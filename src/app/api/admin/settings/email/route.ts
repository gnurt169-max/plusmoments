import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession, assertRole } from '@/lib/auth';
import { AdminRole } from '@prisma/client';
import { syncSmtpSettingsToSeeds } from '@/lib/seed-sync';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAdminSession();
    const authCheck = assertRole(session, [AdminRole.ADMIN, AdminRole.SUPER_ADMIN]);
    if (!authCheck.authorized) return authCheck.response;

    const settings = await prisma.systemSetting.findFirst().catch(() => null);

    return NextResponse.json({
      success: true,
      settings: {
        smtpEnabled: settings?.smtpEnabled ?? true,
        smtpHost: settings?.smtpHost || process.env.SMTP_HOST || 'mail.plusmoments.vn',
        smtpPort: settings?.smtpPort || Number(process.env.SMTP_PORT) || 465,
        smtpSecure: settings?.smtpSecure ?? (process.env.SMTP_SECURE === 'true' || true),
        smtpUser: settings?.smtpUser || process.env.SMTP_USER || '',
        smtpPass: settings?.smtpPass || process.env.SMTP_PASS || '',
        emailFrom: settings?.emailFrom || process.env.EMAIL_FROM || 'PlusMoments Wedding Studio <booking@plusmoments.vn>',
        adminNotifyEmail: settings?.adminNotifyEmail || process.env.ADMIN_NOTIFICATION_EMAIL || 'director.wedding@plusmoments.vn',
        consultLeadEmailSubject: settings?.consultLeadEmailSubject || '[PlusMoments] Xác nhận đăng ký tư vấn & Nhận ưu đãi 2.000.000đ',
        consultLeadEmailBody: settings?.consultLeadEmailBody || 'Kính gửi {customerName},\n\nPlusMoments rất vinh hạnh được tiếp nhận thông tin đăng ký tư vấn từ hai bạn. Chúng tôi đã kích hoạt bảo lưu gói Ưu đãi 2.000.000đ cho phiên tư vấn này.\n\nTHÔNG TIN TIẾP NHẬN:\n• Số điện thoại: {customerPhone}\n• Dịch vụ quan tâm: {concept}\n• Ngân sách dự kiến: {budget}\n\nChuyên viên tư vấn của studio sẽ chủ động liên hệ qua điện thoại hoặc Zalo trong ít phút để gửi trọn bộ catalog ảnh mẫu và trao đổi lịch trình chu đáo nhất.\n\nHotline: 0903.768.871 | Địa chỉ: 31 Hùng Vương, Phường An Đông',
        packageOrderEmailSubject: settings?.packageOrderEmailSubject || '[PlusMoments] Xác nhận đăng ký gói dịch vụ & Hướng dẫn thanh toán',
        packageOrderEmailBody: settings?.packageOrderEmailBody || 'Kính gửi {customerName},\n\nPlusMoments xin chân thành cảm ơn bạn đã tin tưởng lựa chọn dịch vụ chụp ảnh cưới của chúng tôi. Đơn đặt gói của bạn đã được khởi tạo thành công trên hệ thống.\n\nTHÔNG TIN ĐƠN HÀNG:\n• Mã đơn hàng: #{orderCode}\n• Gói dịch vụ: {packageName}\n• Số tiền thanh toán: {packagePrice}\n• Số điện thoại: {customerPhone}\n\nHƯỚNG DẪN THANH TOÁN VIETQR:\nQuý khách vui lòng hoàn tất thanh toán cọc bằng cách quét mã VietQR tự động trên hệ thống hoặc chuyển khoản chính xác với nội dung chuyển khoản là mã đơn hàng: {orderCode}.\n\nHệ thống sẽ tự động xác nhận ngay khi nhận được thanh toán. Chuyên viên PlusMoments sẽ liên hệ để xếp lịch thử váy cưới và chốt kịch bản chụp.\n\nHotline hỗ trợ 24/7: 0903.768.871',
      },
    });
  } catch (error: any) {
    console.error('Fetch email settings error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi tải cấu hình email.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    const authCheck = assertRole(session, [AdminRole.ADMIN, AdminRole.SUPER_ADMIN]);
    if (!authCheck.authorized) return authCheck.response;

    const body = await request.json();
    const {
      smtpEnabled,
      smtpHost,
      smtpPort,
      smtpSecure,
      smtpUser,
      smtpPass,
      emailFrom,
      adminNotifyEmail,
      consultLeadEmailSubject,
      consultLeadEmailBody,
      packageOrderEmailSubject,
      packageOrderEmailBody,
    } = body;

    const cleanUser = (smtpUser || '').trim();
    const studioBrand = 'PlusMoments Wedding Studio';
    const cleanFrom = cleanUser
      ? `"${studioBrand}" <${cleanUser}>`
      : (emailFrom || `"${studioBrand}" <booking@plusmoments.vn>`).trim();

    const updateData: any = {
      smtpEnabled: Boolean(smtpEnabled ?? true),
      smtpHost: (smtpHost || 'mail.plusmoments.vn').trim(),
      smtpPort: Number(smtpPort) || 465,
      smtpSecure: Boolean(smtpSecure ?? true),
      smtpUser: cleanUser,
      smtpPass: (smtpPass || '').trim(),
      emailFrom: cleanFrom,
      adminNotifyEmail: (adminNotifyEmail || 'director.wedding@plusmoments.vn').trim(),
    };

    if (consultLeadEmailSubject !== undefined) {
      updateData.consultLeadEmailSubject = consultLeadEmailSubject ? consultLeadEmailSubject.trim() : null;
    }
    if (consultLeadEmailBody !== undefined) {
      updateData.consultLeadEmailBody = consultLeadEmailBody ? consultLeadEmailBody.trim() : null;
    }
    if (packageOrderEmailSubject !== undefined) {
      updateData.packageOrderEmailSubject = packageOrderEmailSubject ? packageOrderEmailSubject.trim() : null;
    }
    if (packageOrderEmailBody !== undefined) {
      updateData.packageOrderEmailBody = packageOrderEmailBody ? packageOrderEmailBody.trim() : null;
    }

    // 1. Save to SystemSetting
    const updated = await prisma.systemSetting.upsert({
      where: { id: 'default' },
      update: updateData,
      create: {
        id: 'default',
        ...updateData,
      },
    });

    // 2. Keep NotificationSetting's adminReceiverEmail in sync
    if (updateData.adminNotifyEmail) {
      await prisma.notificationSetting.upsert({
        where: { id: 'default' },
        update: {
          adminReceiverEmail: updateData.adminNotifyEmail,
          emailNotificationEnabled: updateData.smtpEnabled,
        },
        create: {
          id: 'default',
          adminReceiverEmail: updateData.adminNotifyEmail,
          emailNotificationEnabled: updateData.smtpEnabled,
        },
      }).catch(() => null);
    }

    // 3. Synchronize directly into permanent seed snapshot (prisma/seed.ts & prisma/seed.js)
    try {
      await syncSmtpSettingsToSeeds(updateData);
    } catch (seedErr) {
      console.warn('Seed sync warning for SMTP settings:', seedErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Đã lưu cài đặt email và đồng bộ thành công vào dữ liệu gốc (Seed Mockup)!',
      settings: updated,
    });
  } catch (error: any) {
    console.error('Save email settings error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi lưu cấu hình email.' },
      { status: 500 }
    );
  }
}

