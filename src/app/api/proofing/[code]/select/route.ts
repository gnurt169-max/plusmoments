import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getProofingCookieName, verifyProofingToken } from '@/lib/proofing-auth';

export const dynamic = 'force-dynamic';

interface Props {
  params: { code: string };
}

export async function PATCH(request: Request, { params }: Props) {
  try {
    const { code } = params;
    const gallery = await prisma.clientGallery.findUnique({
      where: { code: code.toLowerCase().trim() },
    });

    if (!gallery) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy bộ sưu tập.' }, { status: 404 });
    }

    // Check PIN authentication cookie
    const cookieStore = cookies();
    const cookieName = getProofingCookieName(gallery.code);
    const clientToken = cookieStore.get(cookieName)?.value;

    if (!verifyProofingToken(gallery.code, gallery.pinCode, clientToken)) {
      return NextResponse.json({ success: false, error: 'Phiên đăng nhập hết hạn hoặc chưa nhập mã PIN.' }, { status: 401 });
    }

    if (gallery.status === 'COMPLETED') {
      return NextResponse.json(
        { success: false, error: 'Dự án này đã hoàn tất bàn giao và không thể chỉnh sửa thêm.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const fileName = (body.fileName || '').trim();

    if (!fileName) {
      return NextResponse.json({ success: false, error: 'Thiếu tên tệp ảnh.' }, { status: 400 });
    }

    let selections: Record<string, { photobook?: boolean; portrait?: boolean; note?: string }> = {};
    try {
      selections = JSON.parse(gallery.selectionsJson || '{}');
    } catch {
      selections = {};
    }

    const currentItem = selections[fileName] || {};

    // 1. Check photobook toggle
    if (body.photobook !== undefined) {
      const willBePhotobook = Boolean(body.photobook);
      if (willBePhotobook && !currentItem.photobook) {
        // Count existing photobooks
        const count = Object.values(selections).filter((s) => s.photobook).length;
        if (count >= gallery.maxPhotobook) {
          return NextResponse.json(
            {
              success: false,
              limitReached: 'photobook',
              error: `Bạn đã chọn đủ hạn mức ${gallery.maxPhotobook} ảnh in Photobook. Vui lòng bỏ chọn một ảnh khác nếu muốn đổi tấm này.`,
            },
            { status: 400 }
          );
        }
      }
      currentItem.photobook = willBePhotobook;
    }

    // 2. Check portrait toggle
    if (body.portrait !== undefined) {
      const willBePortrait = Boolean(body.portrait);
      if (willBePortrait && !currentItem.portrait) {
        // Count existing portraits
        const count = Object.values(selections).filter((s) => s.portrait).length;
        if (count >= gallery.maxPortrait) {
          return NextResponse.json(
            {
              success: false,
              limitReached: 'portrait',
              error: `Bạn đã chọn đủ hạn mức ${gallery.maxPortrait} ảnh Cổng / Khung lớn. Vui lòng bỏ chọn một ảnh khác nếu muốn đổi tấm này.`,
            },
            { status: 400 }
          );
        }
      }
      currentItem.portrait = willBePortrait;
    }

    // 3. Update note
    if (body.note !== undefined) {
      currentItem.note = body.note ? String(body.note).trim().slice(0, 500) : '';
    }

    // Clean up empty records
    if (!currentItem.photobook && !currentItem.portrait && !currentItem.note) {
      delete selections[fileName];
    } else {
      selections[fileName] = currentItem;
    }

    const updatedSelectionsJson = JSON.stringify(selections);

    await prisma.clientGallery.update({
      where: { id: gallery.id },
      data: { selectionsJson: updatedSelectionsJson },
    });

    // Re-count stats
    let photobookCount = 0;
    let portraitCount = 0;
    for (const s of Object.values(selections)) {
      if (s.photobook) photobookCount++;
      if (s.portrait) portraitCount++;
    }

    return NextResponse.json({
      success: true,
      fileName,
      item: selections[fileName] || null,
      photobookCount,
      portraitCount,
      maxPhotobook: gallery.maxPhotobook,
      maxPortrait: gallery.maxPortrait,
    });
  } catch (error: any) {
    console.error('[PROOFING_SELECT_ERROR]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi lưu lựa chọn ảnh.' },
      { status: 500 }
    );
  }
}
