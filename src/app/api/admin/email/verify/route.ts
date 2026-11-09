import { NextResponse } from 'next/server';
import { getAdminSession, assertRole } from '@/lib/auth';
import { AdminRole } from '@prisma/client';
import { verifySmtpConnection } from '@/lib/mail';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    const authCheck = assertRole(session, [AdminRole.ADMIN, AdminRole.SUPER_ADMIN]);
    if (!authCheck.authorized) return authCheck.response;

    const body = await request.json().catch(() => ({}));
    const { host, port, secure, user, pass } = body;

    const result = await verifySmtpConnection({
      host,
      port,
      secure,
      user,
      pass,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message, code: result.code },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Kết nối máy chủ SMTP thành công!',
    });
  } catch (error: any) {
    console.error('>>> [SMTP VERIFY API ERROR]:', error);
    const errorDetail = error.response || error.code || error.message || 'Lỗi khi kiểm tra kết nối SMTP.';
    return NextResponse.json(
      { success: false, message: `Kết nối máy chủ mail thất bại: ${errorDetail}`, code: error.code },
      { status: 400 }
    );
  }
}

