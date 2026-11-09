import { NextResponse } from 'next/server';
import { testTelegramConnection } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, chatId } = body;

    if (!token || !token.trim()) {
      return NextResponse.json(
        { success: false, error: 'Telegram Bot Token không được để trống.' },
        { status: 400 }
      );
    }

    if (!chatId || !chatId.trim()) {
      return NextResponse.json(
        { success: false, error: 'Telegram Chat ID không được để trống.' },
        { status: 400 }
      );
    }

    const result = await testTelegramConnection(token, chatId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    console.error('Test Telegram API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi kiểm tra kết nối Telegram.' },
      { status: 500 }
    );
  }
}

