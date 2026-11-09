import nodemailer from 'nodemailer';
import { prisma } from './prisma';

export interface LeadNotificationPayload {
  leadId: string;
  fullName: string;
  phone: string;
  zalo?: string | null;
  email?: string | null;
  weddingDate?: string | null;
  packageInterested?: string | null;
  estimatedBudget?: string | null;
  notes?: string | null;
  sourceUrl?: string | null;
  utmSource?: string | null;
  createdAt?: Date;
}

/**
 * Format datetime for Vietnamese locale
 */
function formatTimeVN(date?: Date): string {
  const d = date || new Date();
  return d.toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Fetch or Initialize Notification Settings from Database with fallback to ENV
 */
export async function getNotificationSettings() {
  try {
    let settings = await prisma.notificationSetting.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      settings = await prisma.notificationSetting.create({
        data: {
          id: 'default',
          telegramEnabled: Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
          telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
          telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
          emailNotificationEnabled: true,
          adminReceiverEmail: process.env.ADMIN_NOTIFICATION_EMAIL || 'contact@plusmoments.vn',
          zaloWebhookUrl: process.env.LEAD_WEBHOOK_URL || '',
        },
      });
    }

    return settings;
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    return {
      id: 'default',
      telegramEnabled: Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
      telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
      telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
      emailNotificationEnabled: true,
      adminReceiverEmail: process.env.ADMIN_NOTIFICATION_EMAIL || 'contact@plusmoments.vn',
      zaloWebhookUrl: process.env.LEAD_WEBHOOK_URL || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

/**
 * Test Telegram Bot connection with provided token & chat ID
 */
export async function testTelegramConnection(
  token: string,
  chatId: string
): Promise<{ success: boolean; message: string; data?: any }> {
  if (!token || !token.trim()) {
    return { success: false, message: 'Vui lòng nhập Telegram Bot Token.' };
  }
  if (!chatId || !chatId.trim()) {
    return { success: false, message: 'Vui lòng nhập Telegram Chat ID.' };
  }

  const cleanToken = token.trim();
  const cleanChatId = chatId.trim();
  const testMessage = [
    `🔔 <b>[PlusMoments Studio] Kết Nối Telegram Bot Thành Công!</b>`,
    `━━━━━━━━━━━━━━━━━━`,
    `Hệ thống thông báo khách hàng mới đã sẵn sàng.`,
    `⚡ Khi có dâu rể để lại thông tin tư vấn báo giá, tin nhắn cảnh báo sẽ được gửi tức thì về đây.`,
    `⏰ Thời gian kiểm tra: ${formatTimeVN()}`,
  ].join('\n');

  try {
    const res = await fetch(`https://api.telegram.org/bot${cleanToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: cleanChatId,
        text: testMessage,
        parse_mode: 'HTML',
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      return {
        success: false,
        message: `Telegram API phản hồi lỗi: ${data.description || 'Không thể gửi tin nhắn.'}`,
        data,
      };
    }

    return {
      success: true,
      message: 'Gửi tin nhắn test thành công! Hãy kiểm tra Telegram của bạn.',
      data,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Lỗi kết nối tới Telegram API: ${err.message}`,
    };
  }
}

/**
 * Send Instant Alert via Telegram Bot
 */
export async function sendTelegramAlert(lead: LeadNotificationPayload): Promise<boolean> {
  const config = await getNotificationSettings();

  if (!config.telegramEnabled) {
    return false;
  }

  const botToken = config.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN;
  const chatId = config.telegramChatId || process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.log('[Telegram Alert] Token hoặc Chat ID chưa được cấu hình. Bỏ qua gửi tin nhắn.');
    return false;
  }

  const cleanPhone = lead.phone.replace(/[^0-9]/g, '');
  const timeStr = formatTimeVN(lead.createdAt);

  const message = [
    `🚨 <b>KHÁCH HÀNG MỚI ĐĂNG KÝ BÁO GIÁ</b>`,
    `━━━━━━━━━━━━━━━━━━`,
    `👤 <b>Họ tên:</b> ${lead.fullName}`,
    `📞 <b>Số điện thoại:</b> <a href="tel:${cleanPhone}">${lead.phone}</a>`,
    `💬 <b>Zalo nhanh:</b> <a href="https://zalo.me/${cleanPhone}">https://zalo.me/${cleanPhone}</a>`,
    lead.email ? `📧 <b>Email:</b> ${lead.email}` : '',
    `💍 <b>Gói quan tâm:</b> ${lead.packageInterested || 'Tư vấn theo yêu cầu'}`,
    lead.weddingDate ? `📅 <b>Ngày dự kiến cưới:</b> ${lead.weddingDate}` : '',
    lead.estimatedBudget ? `💰 <b>Ngân sách:</b> ${lead.estimatedBudget}` : '',
    lead.notes ? `📝 <b>Ghi chú:</b> <i>"${lead.notes}"</i>` : '',
    lead.utmSource ? `🎯 <b>Nguồn chiến dịch:</b> ${lead.utmSource}` : '',
    `⏰ <b>Thời gian gửi:</b> ${timeStr}`,
    `━━━━━━━━━━━━━━━━━━`,
    `<i>⚡ Vui lòng liên hệ hỗ trợ dâu rể trong vòng 15 phút!</i>`,
  ]
    .filter(Boolean)
    .join('\n');

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    const data = await res.json();
    if (!data.ok) {
      console.error('[Telegram Alert Error]:', data.description);
      return false;
    }
    return true;
  } catch (error) {
    console.error('[Telegram Alert Failed]:', error);
    return false;
  }
}

/**
 * Send Email Notification (Resend API or Nodemailer SMTP)
 */
export async function sendEmailAlert(
  lead: LeadNotificationPayload,
  customReceiverEmail?: string
): Promise<boolean> {
  const config = await getNotificationSettings();

  if (!customReceiverEmail && !config.emailNotificationEnabled) {
    return false;
  }

  const adminEmail =
    customReceiverEmail ||
    config.adminReceiverEmail ||
    process.env.ADMIN_NOTIFICATION_EMAIL ||
    'contact@plusmoments.vn';
  const fromEmail = process.env.EMAIL_FROM || 'PlusMoments Wedding <no-reply@plusmoments.vn>';
  const resendApiKey = process.env.RESEND_API_KEY;
  const smtpHost = process.env.SMTP_HOST;

  const cleanPhone = lead.phone.replace(/[^0-9]/g, '');
  const timeStr = formatTimeVN(lead.createdAt);

  const emailSubject = `[PlusMoments] Khách Hàng Mới: ${lead.fullName} (${lead.phone}) - ${lead.packageInterested || 'Đăng Ký Tư Vấn'}`;

  const emailHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f5f2; color: #222; margin: 0; padding: 24px; }
      .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e7dfd5; }
      .header { background: #1c1917; color: #d4af37; padding: 32px 24px; text-align: center; }
      .header h1 { margin: 0; font-size: 20px; font-weight: 300; letter-spacing: 3px; text-transform: uppercase; }
      .header p { margin: 8px 0 0; color: #a8a29e; font-size: 12px; letter-spacing: 1px; }
      .badge { display: inline-block; background: #e0a96d; color: #ffffff; font-size: 11px; font-weight: 600; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; margin-bottom: 12px; }
      .content { padding: 32px 28px; }
      .lead-card { background: #faf8f5; border: 1px solid #e7dfd5; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
      .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dashed #e7dfd5; font-size: 13px; }
      .row:last-child { border-bottom: none; }
      .label { color: #78716c; font-weight: 500; }
      .value { color: #1c1917; font-weight: 600; text-align: right; }
      .cta-button { display: block; text-align: center; background: #1c1917; color: #ffffff !important; padding: 14px 24px; border-radius: 30px; text-decoration: none; font-size: 13px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin: 24px 0 12px; }
      .zalo-button { display: block; text-align: center; background: #0068ff; color: #ffffff !important; padding: 12px 24px; border-radius: 30px; text-decoration: none; font-size: 13px; font-weight: 600; margin-bottom: 16px; }
      .footer { background: #f5f2ed; text-align: center; padding: 20px; font-size: 11px; color: #a8a29e; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="badge">Thông Báo Lead Mới</div>
        <h1>PlusMoments Studio</h1>
        <p>Hệ Thống Tiếp Nhận Yêu Cầu Tư Vấn & Báo Giá</p>
      </div>

      <div class="content">
        <div class="lead-card">
          <div class="row">
            <span class="label">Họ Tên Dâu Rể:</span>
            <span class="value">${lead.fullName}</span>
          </div>
          <div class="row">
            <span class="label">Số Điện Thoại:</span>
            <span class="value"><a href="tel:${cleanPhone}" style="color: #b45309; text-decoration: none; font-size: 15px;">${lead.phone}</a></span>
          </div>
          ${lead.email ? `
          <div class="row">
            <span class="label">Email:</span>
            <span class="value">${lead.email}</span>
          </div>` : ''}
          <div class="row">
            <span class="label">Gói Dịch Vụ Quan Tâm:</span>
            <span class="value" style="color: #b45309;">${lead.packageInterested || 'Tư vấn theo yêu cầu'}</span>
          </div>
          ${lead.weddingDate ? `
          <div class="row">
            <span class="label">Ngày Dự Kiến Cưới / Chụp:</span>
            <span class="value">${lead.weddingDate}</span>
          </div>` : ''}
          ${lead.estimatedBudget ? `
          <div class="row">
            <span class="label">Dự Toán Ngân Sách:</span>
            <span class="value">${lead.estimatedBudget}</span>
          </div>` : ''}
          ${lead.utmSource ? `
          <div class="row">
            <span class="label">Chiến Dịch Tiếp Thị (UTM):</span>
            <span class="value">${lead.utmSource}</span>
          </div>` : ''}
          <div class="row">
            <span class="label">Thời Gian Gửi:</span>
            <span class="value">${timeStr}</span>
          </div>
        </div>

        ${lead.notes ? `
        <div style="background: #fff8ed; border-left: 3px solid #f59e0b; padding: 12px 16px; margin-bottom: 24px; font-size: 13px; color: #78350f;">
          <strong>Lời nhắn / Yêu cầu riêng:</strong><br/>
          "${lead.notes}"
        </div>
        ` : ''}

        <a href="tel:${cleanPhone}" class="cta-button">
          📞 Bấm Gọi Cho Khách Hàng Ngay (${lead.phone})
        </a>

        <a href="https://zalo.me/${cleanPhone}" target="_blank" class="zalo-button">
          💬 Nhắn Tin Zalo Trực Tiếp
        </a>
      </div>

      <div class="footer">
        Email được tự động gửi từ website PlusMoments (plusmoments.vn)<br/>
        Để quản lý toàn bộ danh sách, vui lòng truy cập trang Quản Trị Admin.
      </div>
    </div>
  </body>
  </html>
  `;

  // 1. Primary: Try Nodemailer SMTP (Email Pro)
  if (smtpHost && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const port = Number(process.env.SMTP_PORT) || 465;
      const isSecure = process.env.SMTP_SECURE === 'true' || port === 465;

      const transporter = nodemailer.createTransport({
        host: smtpHost.trim(),
        port,
        secure: isSecure,
        auth: {
          user: process.env.SMTP_USER.trim(),
          pass: process.env.SMTP_PASS.trim(),
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      const senderEmail = process.env.SMTP_USER.trim();
      const studioBrandName = 'PlusMoments Wedding Studio';
      const formattedFrom = `"${studioBrandName}" <${senderEmail}>`;

      await transporter.sendMail({
        from: formattedFrom,
        to: adminEmail,
        envelope: {
          from: senderEmail,
          to: adminEmail,
        },
        replyTo: senderEmail,
        subject: emailSubject,
        html: emailHtml,
      });

      console.log(`[SMTP SUCCESS] Đã gửi email thông báo lead mới tới ${adminEmail}`);
      return true;
    } catch (err) {
      console.error('[SMTP Dispatch Failed]:', err);
    }
  }

  // 2. Legacy Fallback: Try Resend REST API if key exists
  if (resendApiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [adminEmail],
          subject: emailSubject,
          html: emailHtml,
        }),
      });
      const data = await res.json();
      return res.ok;
    } catch (err) {
      console.error('[Resend Dispatch Failed]:', err);
      return false;
    }
  }

  console.log('[Email Alert] Cả RESEND_API_KEY và SMTP_HOST đều chưa được cấu hình.');
  return false;
}

/**
 * Dispatch Generic Lead Webhook
 */
export async function sendWebhookAlert(lead: LeadNotificationPayload): Promise<boolean> {
  const config = await getNotificationSettings();
  const webhookUrl = config.zaloWebhookUrl || process.env.LEAD_WEBHOOK_URL;
  if (!webhookUrl) return false;

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'lead.created',
        leadId: lead.leadId,
        fullName: lead.fullName,
        phone: lead.phone,
        weddingDate: lead.weddingDate,
        package: lead.packageInterested,
        budget: lead.estimatedBudget,
        notes: lead.notes,
        utmSource: lead.utmSource,
        timestamp: lead.createdAt || new Date(),
      }),
    });
    return res.ok;
  } catch (err) {
    console.error('[Webhook Alert Failed]:', err);
    return false;
  }
}

/**
 * Dispatch all notifications in parallel (fail-safe)
 */
export async function dispatchAllLeadNotifications(lead: LeadNotificationPayload): Promise<void> {
  await Promise.allSettled([
    sendTelegramAlert(lead),
    sendWebhookAlert(lead),
  ]);
}
