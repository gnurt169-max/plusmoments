import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { dispatchAllLeadNotifications } from '@/lib/notifications';
import {
  sendOrderConfirmationEmail,
  sendAdminBookingNotificationEmail,
  sendCustomerLeadConfirmationEmail,
  sendAdminLeadAlertEmail,
} from '@/lib/mail';
import { getAdminSession, assertRole } from '@/lib/auth';
import { AdminRole } from '@prisma/client';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

// Phone sanitization helper
function sanitizePhone(phone: string): string {
  return phone.replace(/[^0-9+]/g, '');
}

export async function POST(request: Request) {
  try {
    // 0. Rate Limiting Protection (Max 5 submissions per minute per IP)
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`lead_${clientIp}`, 5, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Bạn đã gửi thông tin quá nhiều lần. Vui lòng đợi ${rateLimit.resetInSeconds} giây trước khi gửi lại.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();

    // 0.1 Honeypot Protection (Bots automatically fill hidden fields, humans leave them blank)
    const honeypot = body._hp_website || body.honeypot || body._hp;
    if (honeypot && String(honeypot).trim() !== '') {
      console.warn(`[BOT_HONEYPOT_DETECTED] Spam bot blocked silently from IP: ${clientIp}`);
      return NextResponse.json({
        success: true,
        message: 'Đăng ký tư vấn thành công! Chuyên viên PlusMoments sẽ liên hệ với bạn sớm nhất.',
        leadId: 'hp_' + Date.now(),
      });
    }

    const clientEmail = (body.customerEmail || body.email || '').trim();
    console.log('>>> [LEAD API] Nhận yêu cầu tạo lead với email khách:', clientEmail);

    const {
      fullName,
      phone,
      zalo,
      weddingDate,
      packageInterested,
      expectedPackage,
      estimatedBudget,
      notes,
      sourceUrl,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
      gclid,
      conversionValue,
    } = body;

    const rawFullName = (body.fullName || body.customerName || '').trim();
    const rawPhone = (body.phone || body.customerPhone || '').trim();

    // 1. Validation
    if (!rawFullName || rawFullName.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Họ và tên của dâu rể là bắt buộc (tối thiểu 2 ký tự).' },
        { status: 400 }
      );
    }

    if (!rawPhone) {
      return NextResponse.json(
        { success: false, error: 'Số điện thoại là bắt buộc.' },
        { status: 400 }
      );
    }

    const cleanPhone = sanitizePhone(rawPhone);
    if (cleanPhone.length < 9 || cleanPhone.length > 15) {
      return NextResponse.json(
        { success: false, error: 'Số điện thoại không hợp lệ (cần từ 9 đến 11 số).' },
        { status: 400 }
      );
    }

    const customerEmail = clientEmail;
    const cleanEmail = customerEmail && customerEmail.includes('@') ? customerEmail : null;
    const selectedPackage = (packageInterested || expectedPackage || '').trim();

    // 2. Persist Lead to Database
    const lead = await prisma.leadBooking.create({
      data: {
        fullName: rawFullName,
        phone: cleanPhone,
        zalo: zalo ? zalo.trim() : cleanPhone,
        email: cleanEmail,
        customerEmail: cleanEmail,
        weddingDate: weddingDate ? weddingDate.trim() : null,
        packageInterested: selectedPackage || null,
        expectedPackage: selectedPackage || null,
        estimatedBudget: estimatedBudget ? estimatedBudget.trim() : null,
        notes: notes ? notes.trim() : null,
        sourceUrl: sourceUrl || null,
        utmSource: utmSource || null,
        utmMedium: utmMedium || null,
        utmCampaign: utmCampaign || null,
        utmTerm: utmTerm || null,
        utmContent: utmContent || null,
        gclid: gclid || null,
        conversionValue: conversionValue !== undefined ? Number(conversionValue) : null,
        status: 'NEW',
        isRead: false,
      },
    });

    console.log('[LEAD SUBMITTED] Data:', {
      name: lead.fullName,
      phone: lead.phone,
      email: customerEmail || '(không có)',
    });

    // 3. Dispatch Instant Notifications (Telegram, Zalo Webhook)
    // Run asynchronously without blocking the user response
    dispatchAllLeadNotifications({
      leadId: lead.id,
      fullName: lead.fullName,
      phone: lead.phone,
      zalo: lead.zalo,
      email: cleanEmail,
      weddingDate: lead.weddingDate,
      packageInterested: lead.packageInterested,
      estimatedBudget: lead.estimatedBudget,
      notes: lead.notes,
      sourceUrl: lead.sourceUrl,
      utmSource: lead.utmSource,
      createdAt: lead.createdAt,
    }).catch((err) => {
      console.error('[Notification Dispatch Error]:', err);
    });

    // 4. Automated Dual Email Notifications via SMTP (Nodemailer) - Non-Blocking Background Queue
    // Chạy hoàn toàn bất đồng bộ (Non-blocking) để API phản hồi tức thì cho người dùng trong < 200ms
    (async () => {
      try {
        const settings = await prisma.systemSetting.findFirst().catch(() => null);
        const adminEmail =
          settings?.adminNotifyEmail ||
          process.env.ADMIN_NOTIFICATION_EMAIL ||
          settings?.email ||
          'director.wedding@plusmoments.vn';

        // 4.1 Gửi email thông báo cho Admin
        if (adminEmail) {
          sendAdminLeadAlertEmail({
            to: adminEmail,
            lead: {
              id: lead.id,
              fullName: lead.fullName,
              phone: lead.phone,
              zalo: lead.zalo,
              customerEmail: cleanEmail,
              packageInterested: lead.packageInterested,
              expectedPackage: lead.expectedPackage,
              weddingDate: lead.weddingDate,
              estimatedBudget: lead.estimatedBudget,
              notes: lead.notes,
              sourceUrl: lead.sourceUrl,
              utmSource: lead.utmSource,
              createdAt: lead.createdAt,
            },
          })
            .then(() => console.log('>>> [LEAD] Đã gửi thông báo Admin thành công (Background)'))
            .catch((adminErr) => {
              console.error('>>> [LEAD ERROR] Gửi mail Admin thất bại:', adminErr?.message || adminErr);
            });
        }

        // 4.2 Gửi email xác nhận cho Khách hàng
        if (clientEmail && cleanEmail) {
          sendCustomerLeadConfirmationEmail({
            to: cleanEmail,
            customerName: lead.fullName,
            phone: lead.phone,
            concept: lead.packageInterested || lead.expectedPackage || undefined,
          })
            .then(() => console.log('>>> [LEAD] Đã gửi xác nhận cho Khách hàng thành công (Background)'))
            .catch((clientErr) => {
              console.error('>>> [LEAD ERROR] Gửi mail Khách hàng thất bại:', clientErr?.message || clientErr);
            });
        } else {
          console.log('>>> [LEAD SKIP] Không có email khách hàng, bỏ qua gửi khách.');
        }
      } catch (emailErr: any) {
        console.error('>>> [LEAD EMAIL DISPATCH OVERALL ERROR]:', emailErr?.message || emailErr);
      }
    })().catch((bgErr) => console.error('[BACKGROUND_EMAIL_FATAL]:', bgErr));

    return NextResponse.json(
      {
        success: true,
        message: 'Gửi yêu cầu tư vấn thành công! PlusMoments sẽ liên hệ trong 15 phút.',
        lead: {
          id: lead.id,
          fullName: lead.fullName,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Lead submission error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Có lỗi xảy ra trong quá trình lưu trữ thông tin.',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getAdminSession();
    const authCheck = assertRole(session, [AdminRole.ADMIN, AdminRole.SUPER_ADMIN]);
    if (!authCheck.authorized) return authCheck.response;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const isReadParam = searchParams.get('isRead');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 100;

    const where: any = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (isReadParam !== null && isReadParam !== undefined && isReadParam !== '') {
      where.isRead = isReadParam === 'true';
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { fullName: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { packageInterested: { contains: q, mode: 'insensitive' } },
        { expectedPackage: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [leads, unreadCount, totalCount, newCount, contactedCount, bookedCount, cancelledCount] =
      await Promise.all([
        prisma.leadBooking.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: limit,
        }),
        prisma.leadBooking.count({ where: { isRead: false } }),
        prisma.leadBooking.count(),
        prisma.leadBooking.count({ where: { status: 'NEW' } }),
        prisma.leadBooking.count({ where: { status: 'CONTACTED' } }),
        prisma.leadBooking.count({ where: { status: 'BOOKED' } }),
        prisma.leadBooking.count({ where: { status: 'CANCELLED' } }),
      ]);

    return NextResponse.json({
      success: true,
      leads,
      unreadCount,
      stats: {
        total: totalCount,
        new: newCount,
        contacted: contactedCount,
        booked: bookedCount,
        cancelled: cancelledCount,
      },
    });
  } catch (error: any) {
    console.error('Fetch leads error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getAdminSession();
    const authCheck = assertRole(session, [AdminRole.ADMIN, AdminRole.SUPER_ADMIN]);
    if (!authCheck.authorized) return authCheck.response;

    const body = await request.json();
    const { id, status, isRead, notes, markAllAsRead } = body;

    // Batch Action: Mark all as read
    if (markAllAsRead) {
      await prisma.leadBooking.updateMany({
        where: { isRead: false },
        data: { isRead: true },
      });

      return NextResponse.json({
        success: true,
        message: 'Đã đánh dấu tất cả thông báo là đã đọc.',
      });
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Thiếu ID của Lead cần cập nhật.' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (isRead !== undefined) updateData.isRead = isRead;
    if (notes !== undefined) updateData.notes = notes;

    const updated = await prisma.leadBooking.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Cập nhật trạng thái lead thành công!',
      lead: updated,
    });
  } catch (error: any) {
    console.error('Update lead error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getAdminSession();
    const authCheck = assertRole(session, [AdminRole.ADMIN, AdminRole.SUPER_ADMIN]);
    if (!authCheck.authorized) return authCheck.response;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Thiếu ID của Lead cần xóa.' },
        { status: 400 }
      );
    }

    await prisma.leadBooking.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Đã xóa thông tin Lead thành công.',
    });
  } catch (error: any) {
    console.error('Delete lead error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
