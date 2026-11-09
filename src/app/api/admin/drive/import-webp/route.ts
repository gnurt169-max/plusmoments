import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import {
  downloadDriveImageBuffer,
  convertBufferToOptimizedWebP,
} from '@/lib/drive';
import { analyzeAndCacheImageChunk } from '@/lib/vision-ai';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    const body = await request.json();
    const { files, isLogo } = body;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng chọn ít nhất 1 ảnh từ Google Drive để xử lý.' },
        { status: 400 }
      );
    }

    // Fetch API Key from DB or ENV if configured
    const settings = await prisma.systemSetting.findUnique({
      where: { id: 'default' },
    });
    const apiKey = settings?.googleDriveApiKey || process.env.GOOGLE_DRIVE_API_KEY || '';

    // 1. Strict pre-filter: Skip macOS shadow files, dot files, and 0-byte ghost files
    const validFiles = files.filter((item: any) => {
      const fileName = typeof item === 'string' ? '' : item.name || '';
      const size =
        typeof item === 'object' && item.size !== undefined
          ? Number(item.size)
          : undefined;

      if (
        fileName.startsWith('._') ||
        fileName.startsWith('.') ||
        fileName.includes('.DS_Store') ||
        fileName.endsWith('.localized')
      ) {
        return false;
      }
      if (size !== undefined && size <= 0) {
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Tất cả các tệp được chọn là tệp hệ thống ẩn (macOS shadow files ._ / 0 bytes). Vui lòng chọn tệp ảnh thực tế.',
        },
        { status: 400 }
      );
    }

    const results: Array<{
      id: string;
      originalName: string;
      url: string;
      filename: string;
      size: number;
      width: number;
      height: number;
    }> = [];

    const errors: string[] = [];

    // Process files sequentially with isolated try/catch per file
    const logosDir = path.join(process.cwd(), 'public', 'uploads', 'logos');
    if (isLogo && !fs.existsSync(logosDir)) {
      await fs.promises.mkdir(logosDir, { recursive: true });
    }

    let skippedCount = 0;
    let importedCount = 0;

    for (const item of validFiles) {
      try {
        const fileId = typeof item === 'string' ? item : item.id;
        const fileName = typeof item === 'string' ? `${item}.jpg` : item.name || 'image.jpg';
        const checksumFromItem = typeof item === 'object' ? item.md5Checksum : undefined;

        if (!isLogo && fileId) {
          const existingFile = await prisma.mediaFile.findFirst({
            where: {
              OR: [
                { driveFileId: fileId },
                ...(checksumFromItem ? [{ md5Checksum: checksumFromItem }] : []),
              ],
            },
          });

          if (existingFile) {
            skippedCount++;
            results.push({
              id: existingFile.id,
              originalName: existingFile.name,
              url: existingFile.url,
              filename: path.basename(existingFile.url),
              size: existingFile.size,
              width: existingFile.width || 0,
              height: existingFile.height || 0,
            });
            continue;
          }
        }

        const fallbackUrl = undefined;

        // 1. Download original stream / buffer
        const { buffer } = await downloadDriveImageBuffer(fileId, apiKey, fallbackUrl);

        if (isLogo) {
          // Strict Logo handling: Only PNG and SVG are allowed, no conversion to WebP!
          const ext = path.extname(fileName).toLowerCase();
          const cleanBase = path.basename(fileName, ext).replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
          const timestamp = Date.now();

          if (ext === '.svg' || item.mimeType === 'image/svg+xml') {
            const finalFilename = `brand-logo-${timestamp}-${cleanBase}.svg`;
            const finalPath = path.join(logosDir, finalFilename);
            await fs.promises.writeFile(finalPath, buffer);

            importedCount++;
            results.push({
              id: fileId,
              originalName: fileName,
              url: `/uploads/logos/${finalFilename}`,
              filename: finalFilename,
              size: buffer.length,
              width: 0,
              height: 0,
            });
          } else if (ext === '.png' || item.mimeType === 'image/png') {
            const finalFilename = `brand-logo-${timestamp}-${cleanBase}.png`;
            const finalPath = path.join(logosDir, finalFilename);
            const sharpInstance = sharp(buffer);
            const meta = await sharpInstance.metadata();
            const pngBuffer = await sharpInstance
              .png({ quality: 100, compressionLevel: 9 })
              .toBuffer();
            await fs.promises.writeFile(finalPath, pngBuffer);

            importedCount++;
            results.push({
              id: fileId,
              originalName: fileName,
              url: `/uploads/logos/${finalFilename}`,
              filename: finalFilename,
              size: pngBuffer.length,
              width: meta.width || 0,
              height: meta.height || 0,
            });
          } else {
            throw new Error(`Tệp ${fileName} không phải là PNG hoặc SVG. Logo chỉ cho phép định dạng .PNG và .SVG!`);
          }
        } else {
          // 2. Convert to WebP using sharp on RAM buffer for standard media
          const converted = await convertBufferToOptimizedWebP(buffer, fileName);

          const computedChecksum =
            checksumFromItem ||
            crypto.createHash('md5').update(buffer).digest('hex');

          let dbId = fileId;
          try {
            const dbFile = await prisma.mediaFile.create({
              data: {
                name: fileName,
                url: converted.publicUrl,
                size: converted.size,
                format: 'WEBP',
                width: converted.width,
                height: converted.height,
                driveFileId: fileId,
                md5Checksum: computedChecksum,
                uploadedById: session?.userId || null,
              },
            });
            dbId = dbFile.id;
            analyzeAndCacheImageChunk(dbFile.id, converted.publicUrl);
          } catch {
            // In case of any concurrent collision, proceed with converted file
          }

          importedCount++;
          results.push({
            id: dbId,
            originalName: fileName,
            url: converted.publicUrl,
            filename: converted.filename,
            size: converted.size,
            width: converted.width,
            height: converted.height,
          });
        }
      } catch (fileErr: any) {
        console.error(`Error processing file ${item.id || item}:`, fileErr);
        errors.push(`File ${item.name || item.id || item}: ${fileErr.message}`);
      }
    }

    if (results.length === 0 && errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Không thể chuyển đổi ảnh nào. Chi tiết: ${errors.join(', ')}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        skippedCount > 0
          ? `Đã xử lý xong! Thêm mới: ${importedCount} ảnh | Bỏ qua: ${skippedCount} ảnh đã tồn tại.`
          : `Đã tải về và chuyển đổi tối ưu ${results.length} ảnh sang định dạng WebP thành công!`,
      importedCount,
      skippedCount,
      imported: results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Import WebP route error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi xử lý chuyển đổi WebP.' },
      { status: 500 }
    );
  }
}

