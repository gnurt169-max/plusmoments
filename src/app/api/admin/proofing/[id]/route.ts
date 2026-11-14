import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { scanProofingFolderImages } from '@/lib/proofing-fs';

export const dynamic = 'force-dynamic';

interface Props {
  params: { id: string };
}

export async function GET(_request: Request, { params }: Props) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Chưa đăng nhập quản trị.' }, { status: 401 });
    }

    const { id } = params;
    const gallery = await prisma.clientGallery.findUnique({
      where: { id },
    });

    if (!gallery) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy dự án.' }, { status: 404 });
    }

    const photos = scanProofingFolderImages(gallery.folderSlug);

    let selections: Record<string, { photobook?: boolean; portrait?: boolean; note?: string }> = {};
    try {
      selections = JSON.parse(gallery.selectionsJson || '{}');
    } catch {
      selections = {};
    }

    return NextResponse.json({
      success: true,
      gallery,
      photos,
      selections,
    });
  } catch (error: any) {
    console.error('[ADMIN_PROOFING_GET_ID_ERROR]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi lấy thông tin dự án.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: Props) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Chưa đăng nhập quản trị.' }, { status: 401 });
    }

    const { id } = params;
    const existing = await prisma.clientGallery.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy dự án.' }, { status: 404 });
    }

    const body = await request.json();
    const updateData: Record<string, any> = {};

    if (body.coupleName !== undefined) updateData.coupleName = String(body.coupleName).trim();
    if (body.shootDate !== undefined) updateData.shootDate = body.shootDate ? String(body.shootDate).trim() : null;
    if (body.pinCode !== undefined) {
      const pin = String(body.pinCode).trim();
      if (/^\d{4,8}$/.test(pin)) updateData.pinCode = pin;
    }
    if (body.coverImage !== undefined) updateData.coverImage = body.coverImage ? String(body.coverImage).trim() : null;
    if (body.maxPhotobook !== undefined) updateData.maxPhotobook = Math.max(1, parseInt(String(body.maxPhotobook), 10) || 40);
    if (body.maxPortrait !== undefined) updateData.maxPortrait = Math.max(0, parseInt(String(body.maxPortrait), 10) || 2);
    if (body.allowDownload !== undefined) updateData.allowDownload = Boolean(body.allowDownload);
    if (body.status !== undefined) {
      const validStatuses = ['OPEN', 'SUBMITTED', 'COMPLETED'];
      if (validStatuses.includes(body.status)) {
        updateData.status = body.status;
      }
    }
    if (body.expiresAt !== undefined) {
      updateData.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
    }
    if (body.resetSelections === true) {
      updateData.selectionsJson = '{}';
      updateData.status = 'OPEN';
      updateData.submittedAt = null;
    }

    const updated = await prisma.clientGallery.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Cập nhật dự án thành công!',
      gallery: updated,
    });
  } catch (error: any) {
    console.error('[ADMIN_PROOFING_PATCH_ERROR]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi cập nhật dự án.' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: Props) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Chưa đăng nhập quản trị.' }, { status: 401 });
    }

    const { id } = params;
    const existing = await prisma.clientGallery.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy dự án cần xóa.' }, { status: 404 });
    }

    // Strictly delete database record only — never delete physical photos on VPS!
    await prisma.clientGallery.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `Đã xóa dự án "${existing.coupleName}" thành công (ảnh gốc trên máy chủ được giữ nguyên).`,
    });
  } catch (error: any) {
    console.error('[ADMIN_PROOFING_DELETE_ERROR]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi xóa dự án.' },
      { status: 500 }
    );
  }
}
