import React from 'react';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { render } from '@react-email/render';
import OrderConfirmationEmail from '@/components/emails/OrderConfirmationEmail';
import AdminBookingAlertEmail from '@/components/emails/AdminBookingAlertEmail';
import LeadCustomerConfirmationEmail from '@/components/emails/LeadCustomerConfirmationEmail';
import AdminNewLeadAlertEmail from '@/components/emails/AdminNewLeadAlertEmail';
import { prisma } from './prisma';

export interface SmtpConfigParams {
  host?: string | null;
  port?: number | string | null;
  secure?: boolean | null;
  user?: string | null;
  pass?: string | null;
}

/**
 * Hàm biên dịch template email thay thế linh hoạt các thẻ biến số {key}
 */
export function compileTemplate(template: string, data: Record<string, string>): string {
  if (!template) return '';
  let result = template;
  for (const [key, val] of Object.entries(data)) {
    result = result.replace(new RegExp(`{${key}}`, 'g'), val !== undefined && val !== null ? String(val) : '');
  }
  return result;
}

/**
 * Bọc nội dung email động vào khung giao diện Luxury Minimalist chuẩn phong cách PlusMoments
 */
export function wrapLuxuryEmailHtml(
  bodyText: string,
  footerHotline?: string,
  footerAddress?: string
): string {
  const formattedContent = bodyText.includes('<p>') || bodyText.includes('<div>')
    ? bodyText
    : bodyText
        .split('\n\n')
        .map((p) => `<p style="margin: 0 0 16px 0; line-height: 1.6; font-size: 14px; color: #44403C;">${p.replace(/\n/g, '<br />')}</p>`)
        .join('');

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FAF8F5; border: 1px solid #E8E2D9; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #2E2824; padding: 24px; text-align: center;">
        <h1 style="color: #FFFFFF; font-size: 20px; letter-spacing: 2px; margin: 0; font-weight: 300;">PLUSMOMENTS</h1>
        <p style="color: #D6D0C7; font-size: 11px; margin: 4px 0 0 0; letter-spacing: 1px;">LUXURY WEDDING STUDIO</p>
      </div>
      <div style="padding: 32px 24px; color: #1C1917;">
        ${formattedContent}
      </div>
      <div style="background-color: #F5F2EB; padding: 16px 24px; text-align: center; border-top: 1px solid #E8E2D9; font-size: 12px; color: #78716C;">
        <p style="margin: 0;">Hotline: <strong>${footerHotline || '0903.768.871'}</strong> | Địa chỉ: ${footerAddress || '31 Hùng Vương, Phường An Đông'}</p>
        <p style="margin: 4px 0 0 0; font-size: 11px; color: #A8A29E;">© ${new Date().getFullYear()} PlusMoments Wedding Studio. All rights reserved.</p>
      </div>
    </div>
  `;
}

/**
 * Creates a Nodemailer SMTP transporter using Database settings (SystemSetting) with fallback to .env
 */
export async function getSmtpTransporter(customConfig?: SmtpConfigParams): Promise<Transporter | null> {
  let host = customConfig?.host;
  let port = customConfig?.port !== undefined && customConfig?.port !== null ? Number(customConfig.port) : undefined;
  let secure = customConfig?.secure;
  let user = customConfig?.user;
  let pass = customConfig?.pass;

  // If customConfig is incomplete or omitted, read from Database first, fallback to .env
  if (!host || !user || !pass) {
    const settings = await prisma.systemSetting.findFirst().catch(() => null);
    host = host || settings?.smtpHost || process.env.SMTP_HOST || 'mail.plusmoments.vn';
    port = port || settings?.smtpPort || Number(process.env.SMTP_PORT) || 465;
    secure = secure !== undefined && secure !== null
      ? secure
      : (settings?.smtpSecure ?? (process.env.SMTP_SECURE === 'true' || port === 465));
    user = user || settings?.smtpUser || process.env.SMTP_USER || '';
    pass = pass || settings?.smtpPass || process.env.SMTP_PASS || '';
  }

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host: host.trim(),
    port: Number(port) || 465,
    secure: Boolean(secure),
    auth: {
      user: user.trim(),
      pass: pass.trim(),
    },
    tls: {
      rejectUnauthorized: false, // Ensures compatibility with custom domain SSL/TLS certificates
    },
    connectionTimeout: 10000, // 10 giây tối đa để kết nối, tránh treo request
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
}

/**
 * Verifies live connection to the configured SMTP server
 */
export async function verifySmtpConnection(customConfig?: SmtpConfigParams): Promise<{ success: boolean; message: string; code?: string }> {
  try {
    const transporter = await getSmtpTransporter(customConfig);
    if (!transporter) {
      return {
        success: false,
        message: 'Chưa cấu hình đầy đủ thông tin SMTP (Máy chủ, Tài khoản, Mật khẩu).',
      };
    }

    await transporter.verify();
    return {
      success: true,
      message: 'Kết nối máy chủ SMTP thành công!',
    };
  } catch (err: any) {
    console.error('>>> [SMTP VERIFY FAILED FULL ERROR]:', err);
    const errorDetail = err.response || err.code || err.message || 'Lỗi kết nối máy chủ SMTP';
    return {
      success: false,
      message: `Kết nối máy chủ mail thất bại: ${errorDetail}`,
      code: err.code,
    };
  }
}

export interface CustomerOrderEmailData {
  customerEmail: string;
  customerName: string;
  phone: string;
  orderId: string;
  packageName?: string;
  packagePrice?: string;
  bookingDate?: string;
  notes?: string;
}

export interface AdminBookingEmailData {
  orderId: string;
  customerName: string;
  phone: string;
  zalo?: string | null;
  customerEmail?: string | null;
  packageName?: string | null;
  weddingDate?: string | null;
  estimatedBudget?: string | null;
  notes?: string | null;
  sourceUrl?: string | null;
  utmSource?: string | null;
  createdAt?: string;
}

/**
 * Gửi email xác nhận đặt lịch sang trọng cho khách hàng qua SMTP (Nodemailer)
 */
export async function sendOrderConfirmationEmail(orderData: CustomerOrderEmailData) {
  try {
    if (!orderData.customerEmail || !orderData.customerEmail.includes('@')) {
      return { success: false, error: 'Địa chỉ email khách hàng không hợp lệ' };
    }

    const settings = await prisma.systemSetting.findFirst().catch(() => null);
    if (settings && settings.smtpEnabled === false) {
      console.log('[MAIL SKIP] Dịch vụ email đang ở trạng thái Tắt trong Cài đặt.');
      return { success: false, error: 'Dịch vụ email đang tắt trong Cài đặt' };
    }

    const transporter = await getSmtpTransporter();

    // Chuẩn hóa triệt để: senderEmail BẮT BUỘC trùng 100% với tài khoản SMTP đã đăng nhập
    const senderEmail = (settings?.smtpUser || process.env.SMTP_USER || 'booking@plusmoments.vn').trim();
    const studioBrandName = 'PlusMoments Wedding Studio';
    const formattedFrom = `"${studioBrandName}" <${senderEmail}>`;
    const recipientEmail = orderData.customerEmail.trim();

    const formattedOrderId = orderData.orderId.startsWith('PM')
      ? orderData.orderId
      : `PM-${orderData.orderId.slice(-6).toUpperCase()}`;

    // Compile dynamic email template with customer & order data
    const templateData: Record<string, string> = {
      customerName: orderData.customerName || 'Quý Khách',
      customerPhone: orderData.phone || '',
      packageName: orderData.packageName || 'Gói Chụp Cưới PlusMoments',
      packagePrice: orderData.packagePrice || 'Liên hệ báo giá',
      orderCode: formattedOrderId,
      bookingDate: orderData.bookingDate || 'Đang cập nhật',
    };

    const defaultOrderSubject = `[PlusMoments] Xác nhận đăng ký gói dịch vụ & Hướng dẫn thanh toán - Mã đơn #{orderCode}`;
    const defaultOrderBody = `Kính gửi {customerName},\n\nPlusMoments xin chân thành cảm ơn bạn đã tin tưởng lựa chọn dịch vụ chụp ảnh cưới của chúng tôi. Đơn đặt gói của bạn đã được khởi tạo thành công trên hệ thống.\n\nTHÔNG TIN ĐƠN HÀNG:\n• Mã đơn hàng: #{orderCode}\n• Gói dịch vụ: {packageName}\n• Số tiền thanh toán: {packagePrice}\n• Số điện thoại: {customerPhone}\n\nHƯỚNG DẪN THANH TOÁN VIETQR:\nQuý khách vui lòng hoàn tất thanh toán cọc bằng cách quét mã VietQR tự động trên hệ thống hoặc chuyển khoản chính xác với nội dung chuyển khoản là mã đơn hàng: {orderCode}.\n\nHệ thống sẽ tự động xác nhận ngay khi nhận được thanh toán. Chuyên viên PlusMoments sẽ liên hệ để xếp lịch thử váy cưới và chốt kịch bản chụp.\n\nHotline hỗ trợ 24/7: ${settings?.hotlineDisplay || '0903.768.871'}`;

    const rawSubject = (settings as any)?.packageOrderEmailSubject || defaultOrderSubject;
    const rawBody = (settings as any)?.packageOrderEmailBody || defaultOrderBody;

    const compiledSubject = compileTemplate(rawSubject, templateData);
    const compiledBody = compileTemplate(rawBody, templateData);

    const html = wrapLuxuryEmailHtml(
      compiledBody,
      settings?.hotlineDisplay || '0903.768.871',
      settings?.studioAddress || '31 Hùng Vương, Phường An Đông'
    );
    const textContent = compiledBody;

    // 1. Primary: Send via Nodemailer SMTP kèm envelope tường minh
    if (transporter) {
      const info = await transporter.sendMail({
        from: formattedFrom,
        to: recipientEmail,
        envelope: {
          from: senderEmail,
          to: recipientEmail,
        },
        replyTo: senderEmail,
        subject: compiledSubject,
        text: textContent,
        html,
      });

      console.log(`[SMTP SUCCESS] Đã gửi email xác nhận đặt lịch #${formattedOrderId} tới ${orderData.customerEmail} (MessageID: ${info.messageId})`);
      return { success: true, messageId: info.messageId };
    }

    // 2. Legacy Fallback: Try Resend if configured
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim()) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY.trim());
        const { data, error } = await resend.emails.send({
          from: formattedFrom,
          to: [recipientEmail],
          subject: compiledSubject,
          text: textContent,
          html,
        });

        if (error) {
          console.error('[RESEND FALLBACK ERROR]:', error);
          return { success: false, error: error.message || error };
        }

        console.log(`[RESEND SUCCESS] Đã gửi email xác nhận đặt lịch #${formattedOrderId} tới ${orderData.customerEmail}`);
        return { success: true, data };
      } catch (resendErr: any) {
        console.error('[RESEND FALLBACK EXCEPTION]:', resendErr);
        return { success: false, error: resendErr?.message || resendErr };
      }
    }

    console.warn('[MAIL WARN] Chưa cấu hình SMTP_HOST hoặc RESEND_API_KEY trong Cài đặt hoặc .env.');
    return { success: false, error: 'Chưa cấu hình dịch vụ email SMTP' };
  } catch (err: any) {
    console.error('[ORDER CONFIRMATION EMAIL EXCEPTION]:', err);
    return { success: false, error: err?.message || err };
  }
}

/**
 * Gửi email thông báo đơn đặt lịch mới tới Ban Quản Trị Studio qua SMTP (Nodemailer)
 */
export async function sendAdminBookingNotificationEmail(bookingData: AdminBookingEmailData) {
  try {
    const settings = await prisma.systemSetting.findFirst().catch(() => null);
    if (settings && settings.smtpEnabled === false) {
      console.log('[MAIL SKIP] Dịch vụ email đang ở trạng thái Tắt trong Cài đặt.');
      return { success: false, error: 'Dịch vụ email đang tắt trong Cài đặt' };
    }

    const transporter = await getSmtpTransporter();

    const adminEmail =
      settings?.adminNotifyEmail ||
      process.env.ADMIN_NOTIFICATION_EMAIL ||
      settings?.email ||
      'director.wedding@plusmoments.vn';

    const senderEmail = (settings?.smtpUser || process.env.SMTP_USER || 'booking@plusmoments.vn').trim();
    const studioBrandName = 'PlusMoments Wedding Studio';
    const formattedFrom = `"${studioBrandName}" <${senderEmail}>`;
    const recipientEmail = adminEmail.trim();

    const formattedOrderId = bookingData.orderId.startsWith('PM')
      ? bookingData.orderId
      : `PM-${bookingData.orderId.slice(-6).toUpperCase()}`;

    const emailElement = React.createElement(AdminBookingAlertEmail, {
      orderId: formattedOrderId,
      customerName: bookingData.customerName,
      phone: bookingData.phone,
      zalo: bookingData.zalo,
      customerEmail: bookingData.customerEmail,
      packageName: bookingData.packageName,
      weddingDate: bookingData.weddingDate,
      estimatedBudget: bookingData.estimatedBudget,
      notes: bookingData.notes,
      sourceUrl: bookingData.sourceUrl,
      utmSource: bookingData.utmSource,
      createdAt: bookingData.createdAt || new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
      adminDashboardUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://plusmoments.vn'}/admin/leads`,
    });

    const html = await render(emailElement);
    const textContent = `Thông báo đơn mới: #${formattedOrderId}\nKhách hàng: ${bookingData.customerName}\nSĐT: ${bookingData.phone}\nGói: ${bookingData.packageName || 'Tư Vấn'}\nChi tiết: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://plusmoments.vn'}/admin/leads`;

    // 1. Primary: Send via Nodemailer SMTP kèm envelope tường minh
    if (transporter) {
      const info = await transporter.sendMail({
        from: formattedFrom,
        to: recipientEmail,
        envelope: {
          from: senderEmail,
          to: recipientEmail,
        },
        replyTo: senderEmail,
        subject: `🔔 [PlusMoments Đơn Mới] ${bookingData.customerName} (${bookingData.phone}) - ${bookingData.packageName || 'Đăng Ký Tư Vấn'}`,
        text: textContent,
        html,
      });

      console.log(`[SMTP SUCCESS] Đã gửi thông báo đơn mới #${formattedOrderId} tới quản trị viên (${adminEmail}) (MessageID: ${info.messageId})`);
      return { success: true, messageId: info.messageId };
    }

    // 2. Legacy Fallback: Try Resend if configured
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim()) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY.trim());
        const { data, error } = await resend.emails.send({
          from: formattedFrom,
          to: [recipientEmail],
          subject: `🔔 [PlusMoments Đơn Mới] ${bookingData.customerName} (${bookingData.phone}) - ${bookingData.packageName || 'Đăng Ký Tư Vấn'}`,
          text: textContent,
          react: emailElement,
        });

        if (error) {
          console.error('[RESEND ADMIN ALERT ERROR]:', error);
          return { success: false, error: error.message || error };
        }

        console.log(`[RESEND SUCCESS] Đã gửi thông báo đơn mới #${formattedOrderId} tới quản trị viên (${adminEmail})`);
        return { success: true, data };
      } catch (resendErr: any) {
        console.error('[RESEND ADMIN ALERT EXCEPTION]:', resendErr);
        return { success: false, error: resendErr?.message || resendErr };
      }
    }

    console.warn('[MAIL WARN] Chưa cấu hình SMTP_HOST hoặc RESEND_API_KEY trong Cài đặt hoặc .env.');
    return { success: false, error: 'Chưa cấu hình dịch vụ email SMTP' };
  } catch (err: any) {
    console.error('[ADMIN BOOKING EMAIL EXCEPTION]:', err);
    return { success: false, error: err?.message || err };
  }
}

export interface CustomerLeadEmailParams {
  to: string;
  customerName?: string;
  phone?: string;
  concept?: string;
  lead?: {
    id?: string;
    fullName?: string;
    customerName?: string;
    phone?: string;
    customerPhone?: string;
    customerEmail?: string | null;
    email?: string | null;
    packageInterested?: string | null;
    expectedPackage?: string | null;
    weddingDate?: string | null;
    estimatedBudget?: string | null;
    notes?: string | null;
  };
}

/**
 * Gửi email xác nhận tiếp nhận thông tin và bảo lưu ưu đãi 2.000.000đ cho khách hàng
 */
export async function sendCustomerLeadConfirmationEmail({
  to,
  customerName,
  phone,
  concept,
  lead,
}: CustomerLeadEmailParams) {
  const recipient = to.trim();
  if (!recipient || !recipient.includes('@')) {
    throw new Error(`Địa chỉ email người nhận không hợp lệ: "${to}"`);
  }

  const settings = await prisma.systemSetting.findFirst().catch(() => null);
  if (settings && settings.smtpEnabled === false) {
    console.log('[MAIL SKIP] Dịch vụ email đang ở trạng thái Tắt.');
    return { success: false, error: 'Dịch vụ email đang tắt' };
  }

  const smtpUser = (settings?.smtpUser || process.env.SMTP_USER || '').trim();
  const smtpPass = (settings?.smtpPass || process.env.SMTP_PASS || '').trim();
  const smtpHost = (settings?.smtpHost || process.env.SMTP_HOST || '').trim();
  const smtpPort = Number(settings?.smtpPort || process.env.SMTP_PORT || 465);
  const smtpSecure = settings?.smtpSecure ?? (smtpPort === 465);

  if (!smtpUser || !smtpPass || !smtpHost) {
    throw new Error('Chưa cấu hình đầy đủ tài khoản SMTP (Host, User, Password)');
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 10000, // 10 giây tối đa để kết nối, tránh treo request
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  // Tên hiển thị kèm email gửi đi chuẩn RFC: "Tên Thương Hiệu" <email_xac_thuc>
  const senderEmail = smtpUser.trim();
  const fromHeader = `"PlusMoments Wedding Studio" <${senderEmail}>`;

  const clientName = customerName || lead?.fullName || lead?.customerName || 'Quý Khách';
  const clientPhone = phone || lead?.phone || lead?.customerPhone || '';
  const clientConcept = concept || lead?.packageInterested || lead?.expectedPackage || '';
  const clientBudget = lead?.estimatedBudget || 'Tiêu chuẩn Luxury';

  // Dynamic Template Data
  const templateData: Record<string, string> = {
    customerName: clientName,
    customerPhone: clientPhone,
    concept: clientConcept || 'Tư vấn trọn gói',
    budget: clientBudget,
  };

  const defaultLeadSubject = `[PlusMoments] Xác nhận đăng ký tư vấn & Nhận ưu đãi 2.000.000đ`;
  const defaultLeadBody = `Kính gửi {customerName},\n\nPlusMoments rất vinh hạnh được tiếp nhận thông tin đăng ký tư vấn từ hai bạn. Chúng tôi đã kích hoạt bảo lưu gói Ưu đãi 2.000.000đ cho phiên tư vấn này.\n\nTHÔNG TIN TIẾP NHẬN:\n• Số điện thoại: {customerPhone}\n• Dịch vụ quan tâm: {concept}\n• Ngân sách dự kiến: {budget}\n\nChuyên viên tư vấn của studio sẽ chủ động liên hệ qua điện thoại hoặc Zalo trong ít phút để gửi trọn bộ catalog ảnh mẫu và trao đổi lịch trình chu đáo nhất.\n\nHotline: ${settings?.hotlineDisplay || '0903.768.871'} | Địa chỉ: ${settings?.studioAddress || '31 Hùng Vương, Phường An Đông'}`;

  const rawSubject = (settings as any)?.consultLeadEmailSubject || defaultLeadSubject;
  const rawBody = (settings as any)?.consultLeadEmailBody || defaultLeadBody;

  const compiledSubject = compileTemplate(rawSubject, templateData);
  const compiledBody = compileTemplate(rawBody, templateData);

  const html = wrapLuxuryEmailHtml(
    compiledBody,
    settings?.hotlineDisplay || '0903.768.871',
    settings?.studioAddress || '31 Hùng Vương, Phường An Đông'
  );

  // Bắt buộc thiết lập envelope để SMTP server chấp nhận chuyển phát ra ngoài domain
  const mailOptions = {
    from: fromHeader,
    to: recipient,
    envelope: {
      from: senderEmail,
      to: recipient,
    },
    replyTo: senderEmail,
    subject: compiledSubject,
    text: compiledBody,
    html,
  };

  console.log(`>>> [SMTP SENDING] Bắt đầu gửi email cho khách: ${recipient}`);
  const result = await transporter.sendMail(mailOptions);
  console.log(`>>> [SMTP SUCCESS] Gửi thành công tới khách! MessageId: ${result.messageId}`);
  return result;
}

export interface AdminLeadAlertEmailParams {
  to?: string;
  lead: {
    id: string;
    fullName: string;
    phone: string;
    zalo?: string | null;
    customerEmail?: string | null;
    email?: string | null;
    packageInterested?: string | null;
    expectedPackage?: string | null;
    weddingDate?: string | null;
    estimatedBudget?: string | null;
    notes?: string | null;
    sourceUrl?: string | null;
    utmSource?: string | null;
    createdAt?: Date | string;
  };
}

/**
 * Gửi email cảnh báo Lead mới tức thì cho Ban Quản Trị Studio kèm nút gọi nhanh
 */
export async function sendAdminLeadAlertEmail(params: AdminLeadAlertEmailParams) {
  try {
    const settings = await prisma.systemSetting.findFirst().catch(() => null);
    if (settings && settings.smtpEnabled === false) {
      console.log('[MAIL SKIP] Dịch vụ email đang ở trạng thái Tắt.');
      return { success: false, error: 'Dịch vụ email đang tắt' };
    }

    const adminEmail =
      params.to ||
      settings?.adminNotifyEmail ||
      process.env.ADMIN_NOTIFICATION_EMAIL ||
      settings?.email ||
      'director.wedding@plusmoments.vn';

    const transporter = await getSmtpTransporter();
    const senderEmail = (settings?.smtpUser || process.env.SMTP_USER || 'booking@plusmoments.vn').trim();
    const studioBrandName = 'PlusMoments Wedding Studio';
    const formattedFrom = `"${studioBrandName}" <${senderEmail}>`;
    const recipientEmail = adminEmail.trim();

    const emailElement = React.createElement(AdminNewLeadAlertEmail, {
      leadId: params.lead.id,
      customerName: params.lead.fullName,
      customerPhone: params.lead.phone,
      zaloPhone: params.lead.zalo,
      customerEmail: params.lead.customerEmail || params.lead.email,
      conceptOfInterest: params.lead.packageInterested || params.lead.expectedPackage,
      eventDate: params.lead.weddingDate,
      budgetRange: params.lead.estimatedBudget,
      notes: params.lead.notes,
      sourceUrl: params.lead.sourceUrl,
      utmSource: params.lead.utmSource,
      createdAt: params.lead.createdAt instanceof Date ? params.lead.createdAt.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : String(params.lead.createdAt || new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })),
      adminDashboardUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://plusmoments.vn'}/admin/leads`,
    });

    const html = await render(emailElement);
    const textContent = `🔥 [LEAD MỚI] Có khách hàng vừa đăng ký tư vấn!\nHọ tên: ${params.lead.fullName}\nSố điện thoại: ${params.lead.phone}\nZalo: ${params.lead.zalo || params.lead.phone}\nConcept quan tâm: ${params.lead.packageInterested || params.lead.expectedPackage || 'Chưa chọn'}\nNgày dự kiến: ${params.lead.weddingDate || 'Chưa xác định'}\nNgân sách: ${params.lead.estimatedBudget || 'Chưa chọn'}\nXem chi tiết: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://plusmoments.vn'}/admin/leads`;

    if (transporter) {
      const info = await transporter.sendMail({
        from: formattedFrom,
        to: recipientEmail,
        replyTo: senderEmail,
        envelope: {
          from: senderEmail,
          to: recipientEmail,
        },
        subject: `🔥 [LEAD MỚI] Dâu rể ${params.lead.fullName} vừa đăng ký nhận báo giá!`,
        text: textContent,
        html,
      });

      console.log(`[SMTP ADMIN ALERT SUCCESS] Đã gửi thông báo Lead mới tới ${adminEmail} (ID: ${info.messageId})`);
      return { success: true, messageId: info.messageId };
    }

    // Resend fallback
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim()) {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY.trim());
      const { data, error } = await resend.emails.send({
        from: formattedFrom,
        to: [recipientEmail],
        subject: `🔥 [LEAD MỚI] Dâu rể ${params.lead.fullName} vừa đăng ký nhận báo giá!`,
        text: textContent,
        react: emailElement,
      });
      if (error) return { success: false, error: error.message };
      return { success: true, data };
    }

    return { success: false, error: 'Chưa cấu hình dịch vụ email' };
  } catch (err: any) {
    console.error('[ADMIN LEAD ALERT EXCEPTION]:', err);
    return { success: false, error: err?.message || err };
  }
}

/**
 * Gửi email kiểm tra kết nối SMTP trực tiếp (hỗ trợ kiểm tra cấu hình tức thì từ form)
 */
export async function sendSmtpTestEmail(
  recipientEmail: string,
  customConfig?: SmtpConfigParams
): Promise<{ success: boolean; message: string; messageId?: string }> {
  try {
    const transporter = await getSmtpTransporter(customConfig);
    if (!transporter) {
      return {
        success: false,
        message: 'Chưa cấu hình đầy đủ thông số SMTP (Máy chủ, Tài khoản, Mật khẩu) trên giao diện hoặc file .env.',
      };
    }

    const settings = await prisma.systemSetting.findFirst().catch(() => null);
    const senderEmail = (customConfig?.user || settings?.smtpUser || process.env.SMTP_USER || 'booking@plusmoments.vn').trim();
    const studioBrandName = 'PlusMoments Wedding Studio';
    const formattedFrom = `"${studioBrandName}" <${senderEmail}>`;
    const targetRecipient = recipientEmail.trim();

    const timeStr = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    const host = customConfig?.host || settings?.smtpHost || process.env.SMTP_HOST || 'Chưa đặt';
    const port = customConfig?.port || settings?.smtpPort || process.env.SMTP_PORT || '465';
    const isSecure = customConfig?.secure !== undefined
      ? customConfig.secure
      : (settings?.smtpSecure ?? (process.env.SMTP_SECURE === 'true' || Number(port) === 465));

    const testSubject = `[PlusMoments] Kiểm tra kết nối Email Pro SMTP thành công - ${timeStr}`;
    const testHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #FAF8F5; margin: 0; padding: 24px; color: #1C1917; }
          .card { max-width: 560px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; border: 1px solid #E8E2D9; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
          .header { background: #1C1917; color: #D4AF37; padding: 28px 24px; text-align: center; }
          .body { padding: 28px; line-height: 1.6; font-size: 14px; }
          .badge { display: inline-block; background: #10B981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase; margin-bottom: 12px; }
          .config-table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
          .config-table td { padding: 8px 12px; border-bottom: 1px solid #F3F0EB; }
          .footer { background: #FAF8F5; padding: 16px; text-align: center; font-size: 11px; color: #78716C; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <span class="badge">SMTP Verified</span>
            <h1 style="margin: 0; font-size: 20px; font-weight: 300; letter-spacing: 2px;">PLUSMOMENTS STUDIO</h1>
            <p style="margin: 6px 0 0; color: #A8A29E; font-size: 12px;">Email Pro Domain Notification System</p>
          </div>
          <div class="body">
            <h3 style="margin-top: 0; color: #1C1917;">Xin chào Quản Trị Viên!</h3>
            <p>Hệ thống gửi thư điện tử qua giao thức <strong>SMTP (Nodemailer)</strong> của bạn đã được kết nối và hoạt động chính xác.</p>
            <p>Toàn bộ thư xác nhận đặt cọc của khách hàng và thông báo lead mới sẽ được gửi trực tiếp qua gói <strong>Email Pro</strong> theo tên miền của bạn.</p>
            <table class="config-table">
              <tr><td><strong>SMTP Host:</strong></td><td>${host}</td></tr>
              <tr><td><strong>SMTP Port:</strong></td><td>${port} (Secure: ${isSecure ? 'SSL (465)' : 'TLS (587)'})</td></tr>
              <tr><td><strong>Tài khoản gửi:</strong></td><td>${senderEmail}</td></tr>
              <tr><td><strong>Người nhận test:</strong></td><td>${targetRecipient}</td></tr>
              <tr><td><strong>Thời gian kiểm tra:</strong></td><td>${timeStr}</td></tr>
            </table>
          </div>
          <div class="footer">
            Thư gửi tự động từ PlusMoments Wedding Studio Management System.
          </div>
        </div>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: formattedFrom,
      to: targetRecipient,
      envelope: {
        from: senderEmail,
        to: targetRecipient,
      },
      replyTo: senderEmail,
      subject: testSubject,
      text: `Xin chào,\n\nĐây là email kiểm tra kết nối SMTP từ hệ thống PlusMoments Studio.\nTrạng thái: Máy chủ SMTP kết nối và phát thư thành công!\nNgười gửi: ${senderEmail}\nNgười nhận: ${targetRecipient}\nThời gian kiểm tra: ${timeStr}`,
      html: testHtml,
    });

    console.log(`[SMTP TEST SUCCESS] Đã gửi email test thành công tới ${recipientEmail} (ID: ${info.messageId})`);
    return {
      success: true,
      message: `Đã gửi email thử nghiệm SMTP thành công tới ${recipientEmail}!`,
      messageId: info.messageId,
    };
  } catch (err: any) {
    console.error('[SMTP TEST EMAIL ERROR]:', err);
    return {
      success: false,
      message: `Gửi email thử nghiệm thất bại: ${err.message || err}`,
    };
  }
}
