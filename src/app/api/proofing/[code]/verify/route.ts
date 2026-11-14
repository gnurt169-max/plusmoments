import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createProofingToken, getProofingCookieName } from '@/lib/proofing-auth';

export const dynamic = 'force-dynamic';

interface Props {
  params: { code: string };
}

export async function POST(request: Request, { params }: Props) {
  try {
    const { code } = params;
    if (!code) {
      return NextResponse.json({ success: false, error: 'Thiếu mã dự án.' }, { status: 400 });
    }

    const body = await request.json();
    const pin = String(body.pinCode || '').trim();

    if (!pin) {
      return NextResponse.json({ success: false, error: 'Vui lòng nhập mã PIN bảo mật.' }, { status: 400 });
    }

    const gallery = await prisma.clientGallery.findUnique({
      where: { code: code.toLowerCase().trim() },
    });

    if (!gallery) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy bộ sưu tập.' }, { status: 404 });
    }

    if (gallery.pinCode.trim() !== pin) {
      return NextResponse.json(
        { success: false, error: 'Mã PIN không chính xác. Vui lòng kiểm tra lại tin nhắn hoặc gọi Hotline Studio.' },
        { status: 401 }
      );
    }

    const token = createProofingToken(gallery.code, gallery.pinCode);
    const cookieName = getProofingCookieName(gallery.code);

    const response = NextResponse.json({
      success: true,
      message: 'Xác thực mã PIN thành công!',
    });

    response.cookies.set(cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('[PROOFING_VERIFY_ERROR]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi hệ thống khi xác thực PIN.' },
      { status: 500 }
    );
  }
}
