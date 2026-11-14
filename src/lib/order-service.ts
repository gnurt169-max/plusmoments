import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendAdminBookingNotificationEmail } from '@/lib/mail';
import { formatVND } from '@/lib/utils';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export function generateOrderCode(): string {
  // Generates PM + 5 random digits, e.g. PM10234
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `PM${randomNum}`;
}

export async function processCreateOrder(request: Request) {
  try {
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`order_${clientIp}`, 10, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: `Bạn đang thao tác quá nhanh. Vui lòng chờ ${rateLimit.resetInSeconds} giây.` },
        { status: 429 }
      );
    }

    const body = await request.json();

    // 1. Honeypot Bot Trap Defense: silently drop spam bots without writing DB or sending email
    if (Boolean(body.website_url || body.confirm_hp_field)) {
      console.warn(`[SPAM BLOCKED] Honeypot triggered on /api/orders from IP: ${clientIp}`);
      return NextResponse.json({
        success: true,
        message: 'Khởi tạo đơn hàng thành công.',
        orderCode: 'PM99999',
        redirectUrl: '/cam-on',
      });
    }

    const {
      packageId,
      packageName,
      price,
      amount,
      customerName,
      customerPhone,
      customerEmail,
      notes,
      eventDate,
      weddingDate,
    } = body;

    const name = (customerName || body.fullName || '').trim();
    const rawPhone = (customerPhone || body.phone || '').trim();
    const cleanPhone = rawPhone.replace(/[\s.-]/g, '');
    const email = (customerEmail || body.email || '').trim();

    if (!name || !cleanPhone) {
      return NextResponse.json(
        { success: false, error: 'Họ tên và số điện thoại là bắt buộc.' },
        { status: 400 }
      );
    }

    // 2. Validate Customer Name (at least 2 chars, no URLs)
    if (name.length < 2 || /https?:\/\//i.test(name)) {
      return NextResponse.json(
        { success: false, error: 'Họ tên không hợp lệ, vui lòng kiểm tra lại.' },
        { status: 400 }
      );
    }

    // 3. Validate Vietnamese Phone Number format (03, 05, 07, 08, 09 or +84 followed by 8 digits)
    const vnPhoneRegex = /^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/;
    if (!vnPhoneRegex.test(cleanPhone)) {
      return NextResponse.json(
        { success: false, error: 'Số điện thoại không hợp lệ, vui lòng kiểm tra lại.' },
        { status: 400 }
      );
    }

    const phone = cleanPhone.startsWith('+84') ? `0${cleanPhone.slice(3)}` : cleanPhone;

    // Sanitize price/amount to safe integer
    let rawAmount = price !== undefined && price !== null ? price : amount;
    let parsedAmount = 0;
    if (typeof rawAmount === 'number') {
      parsedAmount = Math.max(0, Math.floor(rawAmount));
    } else if (typeof rawAmount === 'string') {
      const sanitized = rawAmount.replace(/[^\d]/g, '');
      parsedAmount = sanitized ? parseInt(sanitized, 10) : 0;
    }

    let finalPackageName = packageName ? String(packageName).trim() : '';

    // If packageId is provided, query package details if needed
    if (packageId && (!finalPackageName || parsedAmount === 0)) {
      const pkg = await prisma.servicePackage.findUnique({
        where: { id: String(packageId).trim() },
      }).catch(() => null);

      if (pkg) {
        if (!finalPackageName) finalPackageName = pkg.name;
        if (parsedAmount === 0 && pkg.price) {
          parsedAmount = Math.max(0, Math.floor(Number(pkg.price)));
        }
      }
    }

    if (!finalPackageName) {
      finalPackageName = 'Gói Chụp Cưới PlusMoments';
    }

    // Combine event date into notes if provided
    const targetDate = eventDate || weddingDate || '';
    let finalNotes = notes ? String(notes).trim() : '';
    if (targetDate && !finalNotes.includes(targetDate)) {
      finalNotes = finalNotes
        ? `Ngày dự kiến: ${targetDate} | ${finalNotes}`
        : `Ngày dự kiến: ${targetDate}`;
    }

    // Attach UTM / GCLID marketing attribution if present
    const utmSource = (body.utmSource || body.trafficSource?.utmSource || '').trim();
    const utmCampaign = (body.utmCampaign || body.trafficSource?.utmCampaign || '').trim();
    const gclid = (body.gclid || body.trafficSource?.gclid || '').trim();
    if (utmSource || gclid) {
      const utmInfo = `[Nguồn: ${utmSource || 'direct'}${utmCampaign ? ` / ${utmCampaign}` : ''}${gclid ? ` | GCLID: ${gclid}` : ''}]`;
      finalNotes = finalNotes ? `${finalNotes} ${utmInfo}` : utmInfo;
    }

    // Process Add-ons Breakdown and Custom Estimates
    const rawBasePrice = body.basePrice;
    const rawTotalEstimatedPrice = body.totalEstimatedPrice;
    const rawSelectedAddons = body.selectedAddons;

    let basePrice: number | null = null;
    if (typeof rawBasePrice === 'number') {
      basePrice = Math.max(0, Math.floor(rawBasePrice));
    }

    let totalEstimatedPrice: number | null = null;
    if (typeof rawTotalEstimatedPrice === 'number') {
      totalEstimatedPrice = Math.max(0, Math.floor(rawTotalEstimatedPrice));
    }

    let selectedAddonsJson: any = null;
    if (Array.isArray(rawSelectedAddons) && rawSelectedAddons.length > 0) {
      selectedAddonsJson = rawSelectedAddons;
      const addonsSummary = rawSelectedAddons
        .map((a: any) => `${a.name || 'Dịch vụ thêm'} (x${a.quantity || 1} - ${formatVND(a.total || a.price || 0)})`)
        .join(', ');
      finalNotes = finalNotes
        ? `[Dịch vụ chọn thêm: ${addonsSummary}] | ${finalNotes}`
        : `[Dịch vụ chọn thêm: ${addonsSummary}]`;
    }

    // Generate unique orderCode
    let orderCode = generateOrderCode();
    let attempts = 0;
    while (attempts < 5) {
      const existing = await prisma.order.findUnique({
        where: { orderCode },
      });
      if (!existing) break;
      orderCode = generateOrderCode();
      attempts++;
    }

    const order = await prisma.order.create({
      data: {
        orderCode,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        packageId: packageId && String(packageId).trim() ? String(packageId).trim() : null,
        packageName: finalPackageName,
        amount: parsedAmount,
        basePrice,
        totalEstimatedPrice,
        selectedAddons: selectedAddonsJson,
        status: 'PENDING',
        paymentMethod: 'VIETQR',
        notes: finalNotes || null,
      },
    });

    console.log(`[ORDER CREATED] #${order.orderCode} - ${name} (${phone}) - Amount: ${parsedAmount}đ [PENDING PAYMENT]`);

    // TUYỆT ĐỐI KHÔNG GỬI EMAIL XÁC NHẬN CHO KHÁCH TẠI ĐÂY KHI ĐƠN ĐANG PENDING.
    // Email xác nhận chỉ được kích hoạt tại Webhook khi tiền đã vào tài khoản (status -> PAID).

    // Thông báo cho Admin biết có khách hàng vừa khởi tạo phiên đặt cọc (Non-blocking Background)
    sendAdminBookingNotificationEmail({
      orderId: order.orderCode,
      customerName: name,
      phone,
      customerEmail: email || null,
      packageName: finalPackageName,
      weddingDate: targetDate || null,
      notes: `[ĐƠN CHỜ THANH TOÁN] ${finalNotes}`,
    })
      .then(() => console.log(`>>> [ADMIN ALERT] Đã gửi thông báo đơn chờ thanh toán #${order.orderCode} tới Admin (Background)`))
      .catch((admErr) => console.error('>>> [ADMIN ALERT ERROR] Gửi thông báo cho Admin thất bại:', admErr?.message || admErr));

    return NextResponse.json({
      success: true,
      orderCode: order.orderCode,
      order,
      redirectUrl: `/thanh-toan/${order.orderCode}`,
    });
  } catch (error: any) {
    console.error('[CREATE_ORDER_ERROR]:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi tạo đơn hàng: ' + (error.message || error) },
      { status: 500 }
    );
  }
}

