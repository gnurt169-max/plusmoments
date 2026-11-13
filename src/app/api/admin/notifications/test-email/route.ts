import { NextResponse } from 'next/server';
import { sendEmailAlert } from '@/lib/notifications';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email } = body;

    if (!email || !email.trim() || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Địa chỉ email nhận không hợp lệ.' },
        { status: 400 }
      );
    }

    const testPayload = {
      leadId: 'test_lead_demo',
      fullName: 'Dâu Ngọc Hân & Rể Quốc Bảo (Test Email)',
      phone: '0908123456',
      email: email.trim(),
      packageInterested: 'Gói Thử Nghiệm Thông Báo PlusMoments',
      weddingDate: 'Tháng 12, 2025',
      estimatedBudget: 'Từ 20 - 30 triệu',
      notes: 'Đây là email kiểm tra tính năng gửi thông báo tự động từ Admin Dashboard.',
      utmSource: 'admin_test',
      createdAt: new Date(),
    };

    const sent = await sendEmailAlert(testPayload, email.trim());

    if (!sent) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Chưa cấu hình dịch vụ gửi email (RESEND_API_KEY hoặc SMTP_HOST). Vui lòng cấu hình file .env trên server để kích hoạt gửi mail thật.',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Đã gửi email thử nghiệm thành công tới ${email}! Vui lòng kiểm tra hộp thư đến (hoặc Spam).`,
    });
  } catch (error: any) {
    console.error('Test Email API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi kiểm tra gửi email.' },
      { status: 500 }
    );
  }
}

