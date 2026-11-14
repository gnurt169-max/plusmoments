import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getProofingCookieName, verifyProofingToken } from '@/lib/proofing-auth';

export const dynamic = 'force-dynamic';

interface Props {
  params: { code: string };
}

export async function POST(request: Request, { params }: Props) {
  try {
    const { code } = params;
    const gallery = await prisma.clientGallery.findUnique({
      where: { code: code.toLowerCase().trim() },
    });

    if (!gallery) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy bộ sưu tập.' }, { status: 404 });
    }

    const cookieStore = cookies();
    const cookieName = getProofingCookieName(gallery.code);
    const clientToken = cookieStore.get(cookieName)?.value;

    if (!verifyProofingToken(gallery.code, gallery.pinCode, clientToken)) {
      return NextResponse.json({ success: false, error: 'Phiên đăng nhập hết hạn hoặc chưa nhập mã PIN.' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const clientNote = body.clientNote ? String(body.clientNote).trim().slice(0, 1000) : gallery.clientNote;

    let selections: Record<string, { photobook?: boolean; portrait?: boolean; note?: string }> = {};
    try {
      selections = JSON.parse(gallery.selectionsJson || '{}');
    } catch {
      selections = {};
    }

    let photobookCount = 0;
    let portraitCount = 0;
    for (const s of Object.values(selections)) {
      if (s.photobook) photobookCount++;
      if (s.portrait) portraitCount++;
    }

    if (photobookCount === 0 && portraitCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Bạn chưa chọn ảnh nào cho Photobook hoặc Ảnh Cổng. Vui lòng chọn ảnh trước khi chốt.' },
        { status: 400 }
      );
    }

    const updated = await prisma.clientGallery.update({
      where: { id: gallery.id },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
        clientNote: clientNote || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Chúc mừng hai bạn! Danh sách chọn ảnh đã được gửi thành công tới ekip hậu kỳ PlusMoments.',
      gallery: {
        status: updated.status,
        submittedAt: updated.submittedAt,
        clientNote: updated.clientNote,
      },
    });
  } catch (error: any) {
    console.error('[PROOFING_SUBMIT_ERROR]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi gửi chốt danh sách chọn ảnh.' },
      { status: 500 }
    );
  }
}
