import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getNotificationSettings } from '@/lib/notifications';
import { syncNotificationEmailToSeeds } from '@/lib/seed-sync';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await getNotificationSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      telegramEnabled,
      telegramBotToken,
      telegramChatId,
      emailNotificationEnabled,
      adminReceiverEmail,
      zaloWebhookUrl,
    } = body;

    const updated = await prisma.notificationSetting.upsert({
      where: { id: 'default' },
      update: {
        telegramEnabled: Boolean(telegramEnabled),
        telegramBotToken: telegramBotToken ? telegramBotToken.trim() : '',
        telegramChatId: telegramChatId ? telegramChatId.trim() : '',
        emailNotificationEnabled: Boolean(emailNotificationEnabled),
        adminReceiverEmail: adminReceiverEmail ? adminReceiverEmail.trim() : 'contact@plusmoments.vn',
        zaloWebhookUrl: zaloWebhookUrl ? zaloWebhookUrl.trim() : '',
      },
      create: {
        id: 'default',
        telegramEnabled: Boolean(telegramEnabled),
        telegramBotToken: telegramBotToken ? telegramBotToken.trim() : '',
        telegramChatId: telegramChatId ? telegramChatId.trim() : '',
        emailNotificationEnabled: Boolean(emailNotificationEnabled),
        adminReceiverEmail: adminReceiverEmail ? adminReceiverEmail.trim() : 'contact@plusmoments.vn',
        zaloWebhookUrl: zaloWebhookUrl ? zaloWebhookUrl.trim() : '',
      },
    });

    // Synchronize admin receiver email directly to permanent seed snapshot
    if (adminReceiverEmail) {
      try {
        await syncNotificationEmailToSeeds(adminReceiverEmail);
      } catch (seedErr) {
        console.warn('Seed sync warning for notification email:', seedErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Cập nhật cấu hình thông báo và đồng bộ thành công vào dữ liệu gốc (Seed Mockup)!',
      settings: updated,
    });
  } catch (error: any) {
    console.error('Update notification settings error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

