import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { sendOrderConfirmationEmail } from '@/lib/mail';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: {
    id: string;
  };
}

/**
 * POST /api/admin/leads/[id]/resend-email
 * Triggers re-sending the Luxury Order/Booking Confirmation Email to the customer
 */
export async function POST(request: Request, { params }: RouteContext) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Chưa đăng nhập hoặc phiên đã hết hạn' }, { status: 401 });
    }

    const { id } = params;
    const lead = await prisma.leadBooking.findUnique({
      where: { id },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Không tìm thấy thông tin khách hàng' }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const targetEmail = (body.email || lead.email || '').trim();

    if (!targetEmail || !targetEmail.includes('@')) {
      return NextResponse.json(
        { error: 'Vui lòng cung cấp địa chỉ email hợp lệ của khách hàng để gửi thư xác nhận.' },
        { status: 400 }
      );
    }

    // Update lead's email in database if not previously set or changed
    if (!lead.email || lead.email !== targetEmail) {
      await prisma.leadBooking.update({
        where: { id: lead.id },
        data: { email: targetEmail, customerEmail: targetEmail },
      });
    }

    // Send confirmation email
    const result = await sendOrderConfirmationEmail({
      customerEmail: targetEmail,
      customerName: lead.fullName,
      phone: lead.phone,
      orderId: lead.id,
      packageName: lead.packageInterested || lead.expectedPackage || undefined,
      bookingDate: lead.weddingDate || undefined,
      notes: lead.notes || undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Gửi email thất bại. Vui lòng kiểm tra lại cấu hình SMTP trong file .env.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Đã gửi email xác nhận đặt lịch tới ${targetEmail} thành công!`,
      data: result.data,
    });
  } catch (error: any) {
    console.error('[RESEND_EMAIL_API_ERROR]', error);
    return NextResponse.json({ error: error.message || 'Lỗi xử lý gửi email' }, { status: 500 });
  }
}

