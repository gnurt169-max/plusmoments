import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { cleanupDanglingFolderReferences, cleanupDanglingMediaReferences } from '@/lib/media-cleanup';
import { deleteImageWithVariants } from '@/lib/image-variants';
import { getAdminSession } from '@/lib/auth';
import { resolveFolder, readFolderImages } from '@/lib/media-folder-resolver';

export const dynamic = 'force-dynamic';

interface Props {
  params: { id: string };
}

export async function GET(request: Request, { params }: Props) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const folder = await resolveFolder(params.id);

    if (!folder) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy thư mục yêu cầu.' },
        { status: 404 }
      );
    }

    const images = await readFolderImages(folder);

    return NextResponse.json({
      success: true,
      folder: {
        id: folder.canonicalId,
        slug: folder.canonicalSlug,
        name: folder.canonicalName,
        path: folder.canonicalPath,
        imageCount: images.length,
        totalBytes: folder.totalBytes,
        formattedSize: folder.formattedSize,
        coverImage: images.length > 0 ? images[0].url : folder.coverImage,
        createdAt: folder.createdAt,
        updatedAt: folder.updatedAt,
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
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const folder = await resolveFolder(params.id);

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

    let updatedFolderId = folder.canonicalId;
    let updatedFolderName = name.trim();

    // Cập nhật tên trong Database nếu có bản ghi MediaFolder
    if (folder.dbFolder) {
      const updated = await prisma.mediaFolder.update({
        where: { id: folder.dbFolder.id },
        data: { name: updatedFolderName },
      });
      updatedFolderId = updated.id;
      updatedFolderName = updated.name;
    }

    // Cập nhật file metadata.json trên đĩa nếu thư mục vật lý tồn tại
    if (folder.physicalDir && fs.existsSync(folder.physicalDir)) {
      const metaPath = path.join(folder.physicalDir, 'metadata.json');
      try {
        let metaObj: any = { name: updatedFolderName, slug: folder.canonicalSlug };
        if (fs.existsSync(metaPath)) {
          metaObj = JSON.parse(await fs.promises.readFile(metaPath, 'utf-8'));
          metaObj.name = updatedFolderName;
          metaObj.updatedAt = new Date().toISOString();
        }
        await fs.promises.writeFile(metaPath, JSON.stringify(metaObj, null, 2), 'utf-8');
      } catch {}
    }

    return NextResponse.json({
      success: true,
      message: `Đã đổi tên thư mục thành "${updatedFolderName}"!`,
      folder: {
        id: updatedFolderId,
        slug: folder.canonicalSlug,
        name: updatedFolderName,
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
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const folder = await resolveFolder(params.id);

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
          await deleteImageWithVariants(absolutePath);
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
    if (folder.physicalDir && fs.existsSync(folder.physicalDir)) {
      try {
        await fs.promises.rm(folder.physicalDir, { recursive: true, force: true }).catch(() => {});
      } catch (fsErr) {
        console.warn('[WARN] Lỗi xóa thư mục vật lý, tiếp tục dọn DB:', fsErr);
      }
    }

    // 2. Atomically delete from database and cleanup all dangling references across the website
    await cleanupDanglingFolderReferences(folder.canonicalSlug, folder.canonicalId);

    return NextResponse.json({
      success: true,
      message: `Đã xóa toàn bộ thư mục "${folder.canonicalName}", tệp vật lý và dọn sạch các liên kết liên quan!`,
    });
  } catch (error: any) {
    console.error('Delete folder error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi xóa thư mục.' },
      { status: 500 }
    );
  }
}


