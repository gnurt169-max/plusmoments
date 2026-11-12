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
import { analyzeAndCacheImageChunk } from '@/lib/vision-ai';

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
    const rawFolders: Array<{ id: string; name?: string }> =
      body.folders || (body.folderIds || []).map((id: string) => ({ id, name: '' }));

    if (!rawFolders || rawFolders.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng chọn ít nhất một thư mục Google Drive để import.' },
        { status: 400 }
      );
    }

    // Clean folder targets
    const targetFolders = rawFolders
      .map((f) => ({
        id: parseGoogleDriveFolderId(f.id) || f.id,
        name: f.name || '',
      }))
      .filter((f) => Boolean(f.id));

    if (targetFolders.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy ID thư mục Google Drive hợp lệ.' },
        { status: 400 }
      );
    }

    // Fetch API Key from DB or ENV
    const settings = await prisma.systemSetting.findUnique({
      where: { id: 'default' },
    });
    const apiKey = settings?.googleDriveApiKey || process.env.GOOGLE_DRIVE_API_KEY || '';

    // STREAMING RESPONSE (SSE / NDJSON)
    if (wantStream) {
      const encoder = new TextEncoder();
      let isClosed = false;

      const stream = new ReadableStream({
        async start(controller) {
          const safeEnqueue = (data: any) => {
            if (isClosed) return;
            try {
              controller.enqueue(encoder.encode(JSON.stringify(data) + '\n'));
            } catch {
              isClosed = true;
            }
          };

          let totalImportedImages = 0;
          let totalSkippedImages = 0;
          const globalErrors: string[] = [];
          const folderCache = new Map<string, any>();
          const newlyCreatedFolders = new Map<string, { id: string; slug: string }>();
          const savedFolderIds = new Set<string>();

          // Helper to get or create DB folder on-demand
          const ensureDbFolder = async (folderItem: ScannedFolderItem) => {
            if (folderCache.has(folderItem.slug)) {
              return folderCache.get(folderItem.slug);
            }

            const existingInDb = await prisma.mediaFolder.findUnique({
              where: { slug: folderItem.slug },
            });

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

            const dbFolder = existingInDb
              ? await prisma.mediaFolder.update({
                  where: { slug: folderItem.slug },
                  data: { name: folderItem.name },
                })
              : await prisma.mediaFolder.create({
                  data: { name: folderItem.name, slug: folderItem.slug },
                });

            if (!existingInDb) {
              newlyCreatedFolders.set(folderItem.slug, { id: dbFolder.id, slug: dbFolder.slug });
            }

            folderCache.set(folderItem.slug, dbFolder);
            return dbFolder;
          };

          const cleanupEmptyCreatedFolders = async () => {
            for (const [slug, fInfo] of newlyCreatedFolders.entries()) {
              if (!savedFolderIds.has(fInfo.id)) {
                const count = await prisma.mediaFile.count({ where: { folderId: fInfo.id } });
                if (count === 0) {
                  await prisma.mediaFolder.delete({ where: { id: fInfo.id } }).catch(() => {});
                  const folderDir = path.join(process.cwd(), 'public', 'uploads', 'folders', slug);
                  if (fs.existsSync(folderDir)) {
                    await fs.promises.rm(folderDir, { recursive: true, force: true }).catch(() => {});
                  }
                }
              }
            }
          };

          // Process each selected root folder in sequence (for...of loop, never early return)
          for (let fIdx = 0; fIdx < targetFolders.length; fIdx++) {
            if (isClosed) break;

            const target = targetFolders[fIdx];
            safeEnqueue({
              type: 'folder_scanning',
              targetFolderId: target.id,
              targetFolderName: target.name || 'Thư mục Drive',
              folderIndex: fIdx + 1,
              totalFolders: targetFolders.length,
            });

            try {
              // 1. Recursive scan: finds all subfolders and all images at every depth level
              const scanResult = await getAllFilesRecursively(target.id, '', apiKey);

              const totalImagesInBatch = scanResult.images.length;

              safeEnqueue({
                type: 'start',
                folderIndex: fIdx + 1,
                totalFolders: targetFolders.length,
                folderName: target.name || scanResult.folders[0]?.name || 'Thư mục Drive',
                folderSlug: scanResult.folders[0]?.slug,
                total: totalImagesInBatch,
                discoveredFolders: scanResult.folders.length,
              });

              if (totalImagesInBatch === 0) {
                safeEnqueue({
                  type: 'folder_complete',
                  folderIndex: fIdx + 1,
                  totalFolders: targetFolders.length,
                  folderName: target.name || scanResult.folders[0]?.name || 'Thư mục Drive',
                  total: 0,
                  importedCount: totalImportedImages,
                  skippedCount: totalSkippedImages,
                  message: `Thư mục "${target.name || 'Drive'}" và các thư mục con không có ảnh nào.`,
                });
                continue;
              }

              // 2. Process each image sequentially with fingerprint & checksum deduplication
              for (let imgIdx = 0; imgIdx < scanResult.images.length; imgIdx++) {
                if (isClosed) break;

                const img = scanResult.images[imgIdx];
                try {
                  // Two-tier deduplication check:
                  // Tier 1: driveFileId unique match
                  // Tier 2: md5Checksum match (if present from Drive API)
                  const existingFile = await prisma.mediaFile.findFirst({
                    where: {
                      OR: [
                        { driveFileId: img.id },
                        ...(img.md5Checksum ? [{ md5Checksum: img.md5Checksum }] : []),
                      ],
                    },
                  });

                  if (existingFile) {
                    totalSkippedImages++;
                    safeEnqueue({
                      type: 'progress',
                      folderIndex: fIdx + 1,
                      totalFolders: targetFolders.length,
                      current: imgIdx + 1,
                      total: totalImagesInBatch,
                      folderName: img.folder.name,
                      folderPath: img.folder.path,
                      isSkipped: true,
                      skippedCount: totalSkippedImages,
                      importedCount: totalImportedImages,
                      item: {
                        id: existingFile.id,
                        name: img.name,
                        url: existingFile.url,
                        size: existingFile.size,
                        folderId: existingFile.folderId,
                        isDuplicate: true,
                      },
                    });
                    continue;
                  }

                  const fallbackUrl = undefined;
                  const { buffer } = await downloadDriveImageBuffer(img.id, apiKey, fallbackUrl);
                  const dbFolder = await ensureDbFolder(img.folder);
                  const converted = await convertBufferToOptimizedWebP(
                    buffer,
                    img.name,
                    `folders/${img.folder.slug}`
                  );

                  const checksum =
                    img.md5Checksum ||
                    crypto.createHash('md5').update(buffer).digest('hex');

                  const dbFile = await prisma.mediaFile.create({
                    data: {
                      name: img.name,
                      url: converted.publicUrl,
                      size: converted.size,
                      format: 'WEBP',
                      width: converted.width,
                      height: converted.height,
                      folderId: dbFolder.id,
                      driveFileId: img.id,
                      md5Checksum: checksum,
                      uploadedById: session?.userId || null,
                    },
                  });

                  savedFolderIds.add(dbFolder.id);
                  analyzeAndCacheImageChunk(dbFile.id, converted.publicUrl);

                  totalImportedImages++;

                  safeEnqueue({
                    type: 'progress',
                    folderIndex: fIdx + 1,
                    totalFolders: targetFolders.length,
                    current: imgIdx + 1,
                    total: totalImagesInBatch,
                    folderName: img.folder.name,
                    folderPath: img.folder.path,
                    isSkipped: false,
                    skippedCount: totalSkippedImages,
                    importedCount: totalImportedImages,
                    item: {
                      id: dbFile.id,
                      name: img.name,
                      url: converted.publicUrl,
                      size: converted.size,
                      folderId: dbFolder.id,
                    },
                  });
                } catch (imgErr: any) {
                  const errMsg = `[${img.folder.name}] ${img.name}: ${imgErr.message}`;
                  console.error('Error importing image item:', errMsg);
                  globalErrors.push(errMsg);
                  safeEnqueue({
                    type: 'error_item',
                    folderIndex: fIdx + 1,
                    totalFolders: targetFolders.length,
                    current: imgIdx + 1,
                    total: totalImagesInBatch,
                    fileName: img.name,
                    error: imgErr.message,
                  });
                }
              }

              safeEnqueue({
                type: 'folder_complete',
                folderIndex: fIdx + 1,
                totalFolders: targetFolders.length,
                folderName: target.name || scanResult.folders[0]?.name || 'Thư mục Drive',
                total: totalImagesInBatch,
                importedCount: totalImportedImages,
                skippedCount: totalSkippedImages,
              });
            } catch (folderErr: any) {
              const errMsg = `Lỗi quét thư mục "${target.name || target.id}": ${folderErr.message}`;
              console.error(errMsg);
              globalErrors.push(errMsg);
              safeEnqueue({
                type: 'error_folder',
                folderIndex: fIdx + 1,
                totalFolders: targetFolders.length,
                folderName: target.name,
                error: folderErr.message,
              });
            }
          }

          // Cleanup any newly created folders that ended up with 0 images
          await cleanupEmptyCreatedFolders();

          // Complete entire batch
          safeEnqueue({
            type: 'complete',
            success: true,
            totalFolders: targetFolders.length,
            discoveredFolders: savedFolderIds.size,
            totalImages: totalImportedImages,
            total: totalImportedImages,
            importedCount: totalImportedImages,
            skippedCount: totalSkippedImages,
            errors: globalErrors,
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

    // NON-STREAMING FALLBACK
    let totalImportedImages = 0;
    let totalSkippedImages = 0;
    const globalErrors: string[] = [];
    const results: any[] = [];
    const folderCache = new Map<string, any>();
    const newlyCreatedFoldersSync = new Map<string, { id: string; slug: string }>();
    const savedFolderIdsSync = new Set<string>();

    const ensureDbFolderSync = async (folderItem: ScannedFolderItem) => {
      if (folderCache.has(folderItem.slug)) {
        return folderCache.get(folderItem.slug);
      }

      const existingInDb = await prisma.mediaFolder.findUnique({
        where: { slug: folderItem.slug },
      });

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

      const dbFolder = existingInDb
        ? await prisma.mediaFolder.update({
            where: { slug: folderItem.slug },
            data: { name: folderItem.name },
          })
        : await prisma.mediaFolder.create({
            data: { name: folderItem.name, slug: folderItem.slug },
          });

      if (!existingInDb) {
        newlyCreatedFoldersSync.set(folderItem.slug, { id: dbFolder.id, slug: dbFolder.slug });
      }

      folderCache.set(folderItem.slug, dbFolder);
      return dbFolder;
    };

    const cleanupEmptyCreatedFoldersSync = async () => {
      for (const [slug, fInfo] of newlyCreatedFoldersSync.entries()) {
        if (!savedFolderIdsSync.has(fInfo.id)) {
          const count = await prisma.mediaFile.count({ where: { folderId: fInfo.id } });
          if (count === 0) {
            await prisma.mediaFolder.delete({ where: { id: fInfo.id } }).catch(() => {});
            const folderDir = path.join(process.cwd(), 'public', 'uploads', 'folders', slug);
            if (fs.existsSync(folderDir)) {
              await fs.promises.rm(folderDir, { recursive: true, force: true }).catch(() => {});
            }
          }
        }
      }
    };

    for (const target of targetFolders) {
      try {
        const scanResult = await getAllFilesRecursively(target.id, '', apiKey);

        for (const img of scanResult.images) {
          try {
            // Deduplication check
            const existingFile = await prisma.mediaFile.findFirst({
              where: {
                OR: [
                  { driveFileId: img.id },
                  ...(img.md5Checksum ? [{ md5Checksum: img.md5Checksum }] : []),
                ],
              },
            });

            if (existingFile) {
              totalSkippedImages++;
              results.push({
                id: existingFile.id,
                name: img.name,
                url: existingFile.url,
                size: existingFile.size,
                folderId: existingFile.folderId,
                isDuplicate: true,
              });
              continue;
            }

            const fallbackUrl = undefined;
            const { buffer } = await downloadDriveImageBuffer(img.id, apiKey, fallbackUrl);
            const dbFolder = await ensureDbFolderSync(img.folder);
            const converted = await convertBufferToOptimizedWebP(
              buffer,
              img.name,
              `folders/${img.folder.slug}`
            );

            const checksum =
              img.md5Checksum ||
              crypto.createHash('md5').update(buffer).digest('hex');

            const dbFile = await prisma.mediaFile.create({
              data: {
                name: img.name,
                url: converted.publicUrl,
                size: converted.size,
                format: 'WEBP',
                width: converted.width,
                height: converted.height,
                folderId: dbFolder.id,
                driveFileId: img.id,
                md5Checksum: checksum,
                uploadedById: session?.userId || null,
              },
            });

            savedFolderIdsSync.add(dbFolder.id);
            analyzeAndCacheImageChunk(dbFile.id, converted.publicUrl);

            totalImportedImages++;
            results.push({
              id: dbFile.id,
              name: img.name,
              url: converted.publicUrl,
              size: converted.size,
              folderId: dbFolder.id,
            });
          } catch (imgErr: any) {
            globalErrors.push(`[${img.folder.name}] ${img.name}: ${imgErr.message}`);
          }
        }
      } catch (folderErr: any) {
        globalErrors.push(`Lỗi thư mục "${target.name || target.id}": ${folderErr.message}`);
      }
    }

    // Cleanup empty created folders
    await cleanupEmptyCreatedFoldersSync();

    return NextResponse.json({
      success: true,
      message: `Đã hoàn tất import ${targetFolders.length} thư mục! Thêm mới: ${totalImportedImages} ảnh | Bỏ qua: ${totalSkippedImages} ảnh đã tồn tại.`,
      totalFolders: targetFolders.length,
      discoveredFolders: savedFolderIdsSync.size,
      totalImages: totalImportedImages,
      importedCount: totalImportedImages,
      skippedCount: totalSkippedImages,
      imported: results,
      errors: globalErrors.length > 0 ? globalErrors : undefined,
    });
  } catch (error: any) {
    console.error('Batch import route error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi xử lý import batch Google Drive.' },
      { status: 500 }
    );
  }
}
