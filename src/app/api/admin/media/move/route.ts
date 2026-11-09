import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fileIds, targetFolderId } = body;

    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng chọn ít nhất 1 ảnh để di chuyển.' },
        { status: 400 }
      );
    }

    // Resolve target folder if provided
    let targetFolder: any = null;
    if (targetFolderId && targetFolderId !== 'root') {
      targetFolder = await prisma.mediaFolder.findFirst({
        where: {
          OR: [{ id: targetFolderId }, { slug: targetFolderId }],
        },
      });

      if (!targetFolder) {
        return NextResponse.json(
          { success: false, error: 'Thư mục đích không tồn tại.' },
          { status: 404 }
        );
      }
    }

    // Determine target directory on disk
    const targetDir = targetFolder
      ? path.join(process.cwd(), 'public', 'uploads', 'folders', targetFolder.slug)
      : path.join(process.cwd(), 'public', 'uploads', 'products');

    if (!fs.existsSync(targetDir)) {
      await fs.promises.mkdir(targetDir, { recursive: true });
    }

    // Find all files to move
    const filesToMove = await prisma.mediaFile.findMany({
      where: {
        OR: [{ id: { in: fileIds } }, { url: { in: fileIds } }],
      },
    });

    let movedCount = 0;
    const errors: string[] = [];

    for (const file of filesToMove) {
      try {
        const filename = path.basename(file.url);
        const sourcePath = path.join(process.cwd(), 'public', file.url.replace(/^\//, ''));
        const destinationPath = path.join(targetDir, filename);

        const newUrl = targetFolder
          ? `/uploads/folders/${targetFolder.slug}/${filename}`
          : `/uploads/products/${filename}`;

        // Move physical file if source exists and paths are different
        if (fs.existsSync(sourcePath) && sourcePath !== destinationPath) {
          await fs.promises.rename(sourcePath, destinationPath);
        }

        // Update database record
        await prisma.mediaFile.update({
          where: { id: file.id },
          data: {
            folderId: targetFolder ? targetFolder.id : null,
            url: newUrl,
          },
        });

        movedCount++;
      } catch (err: any) {
        console.error(`Error moving file ${file.id}:`, err);
        errors.push(`File ${file.name}: ${err.message}`);
      }
    }

    // Handle any files specified by URL that are not yet in the MediaFile table
    const processedUrls = new Set(filesToMove.map((f) => f.url));
    const processedIds = new Set(filesToMove.map((f) => f.id));

    for (const item of fileIds) {
      if (
        typeof item === 'string' &&
        !processedIds.has(item) &&
        !processedUrls.has(item) &&
        item.startsWith('/uploads/')
      ) {
        try {
          const filename = path.basename(item);
          const sourcePath = path.join(process.cwd(), 'public', item.replace(/^\//, ''));
          const destinationPath = path.join(targetDir, filename);

          const newUrl = targetFolder
            ? `/uploads/folders/${targetFolder.slug}/${filename}`
            : `/uploads/products/${filename}`;

          if (fs.existsSync(sourcePath)) {
            if (sourcePath !== destinationPath) {
              await fs.promises.rename(sourcePath, destinationPath);
            }

            const stats = await fs.promises.stat(destinationPath);
            const ext = path.extname(filename).toLowerCase();

            await prisma.mediaFile.create({
              data: {
                name: filename.replace(/\.[^/.]+$/, ''),
                url: newUrl,
                size: stats.size,
                format: ext.replace('.', '').toUpperCase() || 'WEBP',
                folderId: targetFolder ? targetFolder.id : null,
              },
            });

            movedCount++;
          }
        } catch (err: any) {
          console.error(`Error moving untracked file ${item}:`, err);
          errors.push(`File ${item}: ${err.message}`);
        }
      }
    }

    const folderName = targetFolder ? targetFolder.name : 'Thư mục gốc';

    return NextResponse.json({
      success: true,
      message: `Đã di chuyển thành công ${movedCount}/${filesToMove.length} ảnh vào "${folderName}"!`,
      movedCount,
      targetFolderId: targetFolder ? targetFolder.id : null,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Move media files error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi di chuyển tệp media.' },
      { status: 500 }
    );
  }
}
