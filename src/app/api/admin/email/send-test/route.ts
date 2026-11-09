import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getAdminSession, assertRole } from '@/lib/auth';
import { AdminRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    const authCheck = assertRole(session, [AdminRole.ADMIN, AdminRole.SUPER_ADMIN]);
    if (!authCheck.authorized) return authCheck.response;

    const { to, host, port, secure, user, pass, from } = await req.json().catch(() => ({}));

    // Fallback to saved database settings if some fields are not passed from form
    const settings = await prisma.systemSetting.findFirst().catch(() => null);
    const actualHost = (host || settings?.smtpHost || process.env.SMTP_HOST || '').trim();
    const actualUser = (user || settings?.smtpUser || process.env.SMTP_USER || '').trim();
    const actualPass = (pass || settings?.smtpPass || process.env.SMTP_PASS || '').trim();
    const actualPort = Number(port) || settings?.smtpPort || 465;
    const actualSecure = secure !== undefined ? Boolean(secure) : (settings?.smtpSecure ?? (actualPort === 465));
    const targetEmail = (to || '').trim();

    if (!targetEmail || !targetEmail.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng nhập địa chỉ email người nhận hợp lệ.' },
        { status: 400 }
      );
    }

    if (!actualHost || !actualUser || !actualPass) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng điền đầy đủ cấu hình SMTP (Host, User, Password) và email người nhận.' },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: actualHost,
      port: actualPort,
      secure: actualSecure,
      auth: { user: actualUser, pass: actualPass },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 10000, // 10 giây tối đa để kết nối, tránh treo request
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });

    // Xác thực kết nối trước
    await transporter.verify();

    // Chuẩn hóa triệt để: senderEmail BẮT BUỘC phải trùng 100% với actualUser đã xác thực
    const senderEmail = actualUser;
    const studioBrandName = 'PlusMoments Wedding Studio';
    const formattedFrom = `"${studioBrandName}" <${senderEmail}>`;
    const timeStr = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

    // Gửi thử nghiệm kèm envelope tường minh
    const info = await transporter.sendMail({
      from: formattedFrom,
      to: targetEmail,
      envelope: {
        from: senderEmail,
        to: targetEmail,
      },
      replyTo: senderEmail,
      subject: `[Test] Kiểm tra cấu hình Email Studio - PlusMoments`,
      text: `Xin chào,\n\nĐây là email kiểm tra tính năng gửi thư tự động từ hệ thống PlusMoments Wedding Studio.\nNếu bạn nhận được email này, cấu hình máy chủ SMTP của bạn đã hoạt động chính xác 100%!\n\nThời gian gửi: ${timeStr}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #E8E2D9; border-radius: 8px; background-color: #FAF8F5;">
          <h2 style="color: #2E2824; margin-top: 0;">PlusMoments Wedding Studio</h2>
          <p style="color: #444; font-size: 15px; line-height: 1.6;">Xin chào,</p>
          <p style="color: #444; font-size: 15px; line-height: 1.6;">Đây là email kiểm tra gửi thư tự động từ hệ thống quản trị <strong>PlusMoments Studio</strong>.</p>
          <div style="background-color: #EFECE6; padding: 12px 16px; border-radius: 6px; margin: 16px 0;">
            <p style="margin: 0; font-size: 14px; color: #2E2824;">✅ <strong>Trạng thái:</strong> Máy chủ SMTP kết nối và phát thư thành công!</p>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #666;">Người gửi: ${senderEmail} | Người nhận: ${targetEmail}</p>
          </div>
          <p style="color: #888; font-size: 13px; margin-bottom: 0;">Thời gian thực hiện: ${timeStr}</p>
        </div>
      `,
    });

    console.log(`[SMTP TEST DIRECT SUCCESS] Đã gửi thư test thành công tới: ${targetEmail} (MessageID: ${info.messageId})`);

    return NextResponse.json({
      success: true,
      message: `Đã gửi thư thử nghiệm thành công tới ${targetEmail}! Vui lòng kiểm tra hộp thư đến (và mục Spam).`,
      messageId: info.messageId,
    });
  } catch (error: any) {
    console.error('>>> [SMTP TEST FAILED FULL ERROR]:', error);
    const errorDetail = error.response || error.code || error.message || 'Lỗi không xác định';
    return NextResponse.json(
      {
        success: false,
        message: `Kết nối máy chủ mail thất bại: ${errorDetail}`,
        code: error.code,
      },
      { status: 500 }
    );
  }
}

