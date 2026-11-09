import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { cleanupDanglingFolderReferences, cleanupDanglingMediaReferences } from '@/lib/media-cleanup';

export const dynamic = 'force-dynamic';

function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

interface Props {
  params: { id: string };
}

async function findFolder(identifier: string) {
  return await prisma.mediaFolder.findFirst({
    where: {
      OR: [{ id: identifier }, { slug: identifier }],
    },
    include: {
      files: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

export async function GET(request: Request, { params }: Props) {
  try {
    const folder = await findFolder(params.id);

    if (!folder) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy thư mục yêu cầu.' },
        { status: 404 }
      );
    }

    const totalBytes = folder.files.reduce((sum, file) => sum + file.size, 0);

    const images = folder.files.map((file) => ({
      id: file.id,
      filename: path.basename(file.url),
      name: file.name,
      url: file.url,
      size: file.size,
      formattedSize: formatBytes(file.size),
      format: file.format,
      width: file.width,
      height: file.height,
      folderId: folder.id,
      createdAt: file.createdAt.toISOString(),
      modifiedAt: file.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      folder: {
        id: folder.id,
        slug: folder.slug,
        name: folder.name,
        path: `/uploads/folders/${folder.slug}`,
        imageCount: images.length,
        totalBytes,
        formattedSize: formatBytes(totalBytes),
        coverImage: images.length > 0 ? images[0].url : null,
        createdAt: folder.createdAt.toISOString(),
        updatedAt: folder.updatedAt.toISOString(),
      },
      images,
    });
  } catch (error: any) {
    console.error('Get folder details error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi tải chi tiết thư mục.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: Props) {
  try {
    const folder = await findFolder(params.id);

    if (!folder) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy thư mục để đổi tên.' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Tên thư mục mới không được để trống.' },
        { status: 400 }
      );
    }

    const updated = await prisma.mediaFolder.update({
      where: { id: folder.id },
      data: { name: name.trim() },
    });

    // Update metadata.json on disk if directory exists
    const folderDir = path.join(process.cwd(), 'public', 'uploads', 'folders', folder.slug);
    const metaPath = path.join(folderDir, 'metadata.json');
    if (fs.existsSync(folderDir)) {
      try {
        let metaObj: any = { name: name.trim(), slug: folder.slug };
        if (fs.existsSync(metaPath)) {
          metaObj = JSON.parse(await fs.promises.readFile(metaPath, 'utf-8'));
          metaObj.name = name.trim();
          metaObj.updatedAt = new Date().toISOString();
        }
        await fs.promises.writeFile(metaPath, JSON.stringify(metaObj, null, 2), 'utf-8');
      } catch {}
    }

    return NextResponse.json({
      success: true,
      message: `Đã đổi tên thư mục thành "${name.trim()}"!`,
      folder: {
        id: updated.id,
        slug: updated.slug,
        name: updated.name,
      },
    });
  } catch (error: any) {
    console.error('Rename folder error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi đổi tên thư mục.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: Props) {
  try {
    const folder = await findFolder(params.id);

    if (!folder) {
      // Defense: Check if params.id corresponds to a MediaFile (fallback defense if frontend sent file ID)
      const possibleFile = await prisma.mediaFile.findFirst({
        where: {
          OR: [
            { id: params.id },
            { url: params.id.startsWith('/') ? params.id : `/${params.id}` },
          ],
        },
      });

      if (possibleFile) {
        try {
          const relativePath = possibleFile.url.startsWith('/') ? possibleFile.url.slice(1) : possibleFile.url;
          const absolutePath = path.join(process.cwd(), 'public', relativePath);
          await fs.promises.unlink(absolutePath).catch(() => {});
        } catch {}

        await cleanupDanglingMediaReferences([possibleFile.url]);
        await prisma.mediaFile.deleteMany({
          where: { OR: [{ id: possibleFile.id }, { url: possibleFile.url }] },
        });

        return NextResponse.json({
          success: true,
          message: `Đã xóa file "${possibleFile.name}" thành công!`,
        });
      }

      // If already deleted, return 200 graceful response instead of blocking error
      return NextResponse.json({
        success: true,
        message: 'Thư mục không tồn tại hoặc đã được xóa trước đó.',
      });
    }

    // 1. Delete physical directory and files on disk safely
    try {
      const folderDir = path.join(process.cwd(), 'public', 'uploads', 'folders', folder.slug);
      if (fs.existsSync(folderDir)) {
        await fs.promises.rm(folderDir, { recursive: true, force: true }).catch(() => {});
      }
    } catch (fsErr) {
      console.warn('[WARN] Lỗi xóa thư mục vật lý, tiếp tục dọn DB:', fsErr);
    }

    // 2. Atomically delete from database and cleanup all dangling references across the website
    await cleanupDanglingFolderReferences(folder.slug, folder.id);

    return NextResponse.json({
      success: true,
      message: `Đã xóa toàn bộ thư mục "${folder.name}", tệp vật lý và dọn sạch các liên kết liên quan!`,
    });
  } catch (error: any) {
    console.error('Delete folder error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi xóa thư mục.' },
      { status: 500 }
    );
  }
}

