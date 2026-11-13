import { NextResponse } from 'next/server';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { cleanupDanglingMediaReferences, revalidateMediaRelatedPaths } from '@/lib/media-cleanup';
import { deleteImageWithVariants } from '@/lib/image-variants';
import { getAdminSession } from '@/lib/auth';
import { AdminRole } from '@prisma/client';

export const dynamic = 'force-dynamic';

interface Props {
  params: { id: string };
}

export async function DELETE(request: Request, { params }: Props) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const fileId = params.id;

    if (!fileId) {
      return NextResponse.json(
        { success: false, error: 'Thiếu định danh file cần xóa.' },
        { status: 400 }
      );
    }

    // 1. Search MediaFile in DB by id or url
    const file = await prisma.mediaFile.findFirst({
      where: {
        OR: [
          { id: fileId },
          { url: fileId.startsWith('/') ? fileId : `/${fileId}` },
        ],
      },
      include: { folder: true },
    });

    if (file && session.role === AdminRole.USER && file.uploadedById && file.uploadedById !== session.userId) {
      return NextResponse.json(
        { success: false, error: 'Bạn không có quyền xóa tệp media của người khác.' },
        { status: 403 }
      );
    }

    if (!file) {
      // Check if file exists physically on disk to clean up (along with -sm.webp & -md.webp variants)
      const candidateUrl = fileId.startsWith('/') ? fileId : `/uploads/${fileId}`;
      const relativePath = candidateUrl.replace(/^\/+/, '');
      const absolutePath = path.join(process.cwd(), 'public', relativePath);
      await deleteImageWithVariants(absolutePath);

      // Cleanup dangling references if any
      await cleanupDanglingMediaReferences([candidateUrl]);
      revalidateMediaRelatedPaths();

      return NextResponse.json(
        { success: true, message: 'File không tồn tại hoặc đã được xóa trước đó.' },
        { status: 200 }
      );
    }

    // 2. Physical deletion of original file + variants (-sm.webp, -md.webp)
    try {
      const relativePath = file.url.startsWith('/') ? file.url.slice(1) : file.url;
      const absolutePath = path.join(process.cwd(), 'public', relativePath);
      await deleteImageWithVariants(absolutePath);
    } catch (fsError) {
      console.warn('[WARN] Lỗi khi xử lý file vật lý, bỏ qua để dọn sạch Database:', fsError);
    }

    // 3. Cleanup database dangling references across tables (Album, Package, BlogPost, Testimonial, Settings)
    await cleanupDanglingMediaReferences([file.url]);

    // 4. Delete MediaFile record from DB
    await prisma.mediaFile.deleteMany({
      where: {
        OR: [{ id: file.id }, { url: file.url }],
      },
    });

    // 5. Revalidate paths
    revalidateMediaRelatedPaths();

    return NextResponse.json(
      {
        success: true,
        message: `Đã xóa vĩnh viễn tệp "${file.name}" khỏi hệ thống!`,
        deletedId: file.id,
        deletedUrl: file.url,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete media file error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi xóa tệp media.' },
      { status: 500 }
    );
  }
}

