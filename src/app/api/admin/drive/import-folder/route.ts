import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import {
  getAllFilesRecursively,
  downloadDriveImageBuffer,
  convertBufferToOptimizedWebP,
  parseGoogleDriveFolderId,
  ScannedFolderItem,
} from '@/lib/drive';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    const urlObj = new URL(request.url);
    const wantStream =
      urlObj.searchParams.get('stream') === 'true' ||
      request.headers.get('accept') === 'text/event-stream' ||
      request.headers.get('x-stream') === 'true';

    const body = await request.json();
    const { folderId, folderName } = body;

    if (!folderId) {
      return NextResponse.json(
        { success: false, error: 'Thiếu Google Drive Folder ID cần import.' },
        { status: 400 }
      );
    }

    const cleanFolderId = parseGoogleDriveFolderId(folderId) || folderId;

    // Fetch API Key from DB or ENV
    const settings = await prisma.systemSetting.findUnique({
      where: { id: 'default' },
    });
    const apiKey = settings?.googleDriveApiKey || process.env.GOOGLE_DRIVE_API_KEY || '';

    // 1. Recursive scan: finds all subfolders and all images at every depth level
    const scanResult = await getAllFilesRecursively(cleanFolderId, '', apiKey);
    const resolvedFolderName = folderName || scanResult.folders[0]?.name || 'Thư mục Drive';

    const validImages = scanResult.images;

    if (validImages.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Thư mục "${resolvedFolderName}" và các thư mục con không có tệp ảnh hợp lệ nào.`,
        },
        { status: 400 }
      );
    }

    // Cache folders
    const folderCache = new Map<string, any>();
    const ensureDbFolder = async (folderItem: ScannedFolderItem) => {
      if (folderCache.has(folderItem.slug)) {
        return folderCache.get(folderItem.slug);
      }

      const targetDirAbsolute = path.join(
        process.cwd(),
        'public',
        'uploads',
        'folders',
        folderItem.slug
      );
      if (!fs.existsSync(targetDirAbsolute)) {
        await fs.promises.mkdir(targetDirAbsolute, { recursive: true });
      }

      const metadataPath = path.join(targetDirAbsolute, 'metadata.json');
      const metaData = {
        name: folderItem.name,
        path: folderItem.path,
        slug: folderItem.slug,
        driveFolderId: folderItem.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await fs.promises
        .writeFile(metadataPath, JSON.stringify(metaData, null, 2), 'utf-8')
        .catch(() => null);

      const dbFolder = await prisma.mediaFolder.upsert({
        where: { slug: folderItem.slug },
        update: { name: folderItem.name },
        create: { name: folderItem.name, slug: folderItem.slug },
      });

      folderCache.set(folderItem.slug, dbFolder);
      return dbFolder;
    };

    // Ensure all discovered folders exist
    for (const f of scanResult.folders) {
      await ensureDbFolder(f);
    }

    const rootDbFolder = await ensureDbFolder(scanResult.folders[0]);

    // If client requested streaming progress
    if (wantStream) {
      const encoder = new TextEncoder();
      let isClosed = false;

      const stream = new ReadableStream({
        async start(controller) {
          const results: any[] = [];
          const errors: string[] = [];
          let skippedCount = 0;
          let importedCount = 0;

          const safeEnqueue = (data: any) => {
            if (isClosed) return;
            try {
              controller.enqueue(encoder.encode(JSON.stringify(data) + '\n'));
            } catch {
              isClosed = true;
            }
          };

          // Notify start
          safeEnqueue({
            type: 'start',
            folderId: rootDbFolder.id,
            folderName: resolvedFolderName,
            folderSlug: scanResult.folders[0]?.slug,
            total: validImages.length,
            discoveredFolders: scanResult.folders.length,
          });

          for (let i = 0; i < validImages.length; i++) {
            if (isClosed) break;

            const file = validImages[i];
            try {
              const fileId = file.id;
              const fileName = file.name || `image_${i + 1}.jpg`;

              // Two-tier deduplication check:
              // Tier 1: driveFileId unique match
              // Tier 2: md5Checksum match (if present from Drive API)
              const existingFile = await prisma.mediaFile.findFirst({
                where: {
                  OR: [
                    { driveFileId: fileId },
                    ...(file.md5Checksum ? [{ md5Checksum: file.md5Checksum }] : []),
                  ],
                },
              });

              if (existingFile) {
                skippedCount++;
                safeEnqueue({
                  type: 'progress',
                  current: i + 1,
                  total: validImages.length,
                  folderName: file.folder.name,
                  isSkipped: true,
                  skippedCount,
                  importedCount,
                  item: {
                    id: existingFile.id,
                    driveId: fileId,
                    originalName: fileName,
                    url: existingFile.url,
                    size: existingFile.size,
                    folderId: existingFile.folderId,
                    isDuplicate: true,
                  },
                });
                continue;
              }

              const fallbackUrl = undefined;
              const dbFolder = await ensureDbFolder(file.folder);

              // Download and convert
              const { buffer } = await downloadDriveImageBuffer(fileId, apiKey, fallbackUrl);
              const converted = await convertBufferToOptimizedWebP(
                buffer,
                fileName,
                `folders/${file.folder.slug}`
              );

              const checksum =
                file.md5Checksum ||
                crypto.createHash('md5').update(buffer).digest('hex');

              // Save MediaFile record in database
              const dbFile = await prisma.mediaFile.create({
                data: {
                  name: fileName,
                  url: converted.publicUrl,
                  size: converted.size,
                  format: 'WEBP',
                  width: converted.width,
                  height: converted.height,
                  folderId: dbFolder.id,
                  driveFileId: fileId,
                  md5Checksum: checksum,
                  uploadedById: session?.userId || null,
                },
              });

              importedCount++;

              const item = {
                id: dbFile.id,
                driveId: fileId,
                originalName: fileName,
                url: converted.publicUrl,
                filename: converted.filename,
                size: converted.size,
                width: converted.width,
                height: converted.height,
                folderId: dbFolder.id,
              };

              results.push(item);

              // Send progress chunk
              safeEnqueue({
                type: 'progress',
                current: i + 1,
                total: validImages.length,
                folderName: file.folder.name,
                isSkipped: false,
                skippedCount,
                importedCount,
                item,
              });
            } catch (err: any) {
              console.error(`Error importing file ${file.name}:`, err);
              errors.push(`File ${file.name}: ${err.message}`);
              safeEnqueue({
                type: 'error_item',
                current: i + 1,
                total: validImages.length,
                fileName: file.name,
                error: err.message,
              });
            }
          }

          // Complete
          safeEnqueue({
            type: 'complete',
            success: true,
            folderId: rootDbFolder.id,
            folderName: resolvedFolderName,
            folderSlug: scanResult.folders[0]?.slug,
            total: results.length,
            importedCount,
            skippedCount,
            urls: results.map((r) => r.url),
            imported: results,
            errors,
          });

          if (!isClosed) {
            try {
              controller.close();
            } catch {}
          }
        },
        cancel() {
          isClosed = true;
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'application/x-ndjson; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
        },
      });
    }

    // Standard Non-streaming Response
    const results: any[] = [];
    const errors: string[] = [];
    let skippedCount = 0;
    let importedCount = 0;

    for (let i = 0; i < validImages.length; i++) {
      const file = validImages[i];
      try {
        const fileId = file.id;
        const fileName = file.name || `image_${i + 1}.jpg`;

        // Check duplicate
        const existingFile = await prisma.mediaFile.findFirst({
          where: {
            OR: [
              { driveFileId: fileId },
              ...(file.md5Checksum ? [{ md5Checksum: file.md5Checksum }] : []),
            ],
          },
        });

        if (existingFile) {
          skippedCount++;
          results.push({
            id: existingFile.id,
            driveId: fileId,
            originalName: fileName,
            url: existingFile.url,
            filename: path.basename(existingFile.url),
            size: existingFile.size,
            width: existingFile.width || 0,
            height: existingFile.height || 0,
            folderId: existingFile.folderId,
            isDuplicate: true,
          });
          continue;
        }

        const fallbackUrl = undefined;
        const dbFolder = await ensureDbFolder(file.folder);

        const { buffer } = await downloadDriveImageBuffer(fileId, apiKey, fallbackUrl);
        const converted = await convertBufferToOptimizedWebP(
          buffer,
          fileName,
          `folders/${file.folder.slug}`
        );

        const checksum =
          file.md5Checksum ||
          crypto.createHash('md5').update(buffer).digest('hex');

        const dbFile = await prisma.mediaFile.create({
          data: {
            name: fileName,
            url: converted.publicUrl,
            size: converted.size,
            format: 'WEBP',
            width: converted.width,
            height: converted.height,
            folderId: dbFolder.id,
            driveFileId: fileId,
            md5Checksum: checksum,
            uploadedById: session?.userId || null,
          },
        });

        importedCount++;
        results.push({
          id: dbFile.id,
          driveId: fileId,
          originalName: fileName,
          url: converted.publicUrl,
          filename: converted.filename,
          size: converted.size,
          width: converted.width,
          height: converted.height,
          folderId: dbFolder.id,
        });
      } catch (err: any) {
        console.error(`Error importing file ${file.name}:`, err);
        errors.push(`File ${file.name}: ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Đã import trọn vẹn thư mục "${resolvedFolderName}"! Thêm mới: ${importedCount} ảnh | Bỏ qua: ${skippedCount} ảnh đã tồn tại.`,
      folderId: rootDbFolder.id,
      folderName: resolvedFolderName,
      folderSlug: scanResult.folders[0]?.slug,
      discoveredFolders: scanResult.folders.length,
      total: results.length,
      importedCount,
      skippedCount,
      urls: results.map((r) => r.url),
      imported: results,
      errors,
    });
  } catch (error: any) {
    console.error('Import folder error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi import thư mục từ Google Drive.' },
      { status: 500 }
    );
  }
}
