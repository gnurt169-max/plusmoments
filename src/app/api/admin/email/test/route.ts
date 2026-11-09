import { NextResponse } from 'next/server';
import { getAdminSession, assertRole } from '@/lib/auth';
import { AdminRole } from '@prisma/client';
import { verifySmtpConnection, sendSmtpTestEmail } from '@/lib/mail';
import { getNotificationSettings } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    const authCheck = assertRole(session, [AdminRole.ADMIN, AdminRole.SUPER_ADMIN]);
    if (!authCheck.authorized) return authCheck.response;

    const body = await request.json().catch(() => ({}));
    const action = body.action || 'send'; // 'verify' | 'send'

    const customConfig = {
      host: body.host,
      port: body.port,
      secure: body.secure,
      user: body.user,
      pass: body.pass,
    };

    // 1. Just verify SMTP connection
    if (action === 'verify') {
      const verifyResult = await verifySmtpConnection(customConfig);
      return NextResponse.json(verifyResult, { status: verifyResult.success ? 200 : 400 });
    }

    // 2. Send live test email
    const notifSettings = await getNotificationSettings().catch(() => null);
    const targetEmail =
      body.email?.trim() ||
      body.adminNotifyEmail?.trim() ||
      notifSettings?.adminReceiverEmail ||
      process.env.ADMIN_NOTIFICATION_EMAIL ||
      'director.wedding@plusmoments.vn';

    if (!targetEmail || !targetEmail.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Địa chỉ email người nhận không hợp lệ.' },
        { status: 400 }
      );
    }

    const result = await sendSmtpTestEmail(targetEmail, customConfig);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error: any) {
    console.error('Test SMTP API error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi kiểm tra kết nối SMTP.' },
      { status: 500 }
    );
  }
}

