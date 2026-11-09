import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOrderConfirmationEmail, sendAdminBookingNotificationEmail } from '@/lib/mail';
import { getSystemSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

interface TransactionItem {
  id?: string | number;
  content?: string;
  description?: string;
  transferAmount?: number;
  amount?: number;
  referenceCode?: string;
  tid?: string;
}

export async function POST(req: Request) {
  try {
    const settings = await getSystemSettings().catch(() => null);

    // 1. Security token verification if configured
    if (settings?.paymentWebhookKey && settings.paymentWebhookKey.trim() !== '') {
      const configuredKey = settings.paymentWebhookKey.trim();
      const authHeader = req.headers.get('authorization') || '';
      const xApiKey = req.headers.get('x-api-key') || '';
      const secureToken = req.headers.get('secure-token') || '';

      const { searchParams } = new URL(req.url);
      const queryToken = searchParams.get('token') || searchParams.get('apiKey');

      const isAuthorized =
        authHeader.includes(configuredKey) ||
        xApiKey === configuredKey ||
        secureToken === configuredKey ||
        queryToken === configuredKey;

      if (!isAuthorized) {
        console.warn('[PAYMENT_WEBHOOK_WARN] Unauthorized webhook attempt');
        return NextResponse.json(
          { success: false, message: 'Unauthorized webhook access token' },
          { status: 401 }
        );
      }
    }

    const body = await req.json();

    // 2. Normalize transaction list from body (support SePay single object or Casso data array)
    const transactions: TransactionItem[] = [];

    if (Array.isArray(body)) {
      transactions.push(...body);
    } else if (Array.isArray(body?.data)) {
      transactions.push(...body.data);
    } else if (body && typeof body === 'object') {
      transactions.push(body);
    }

    if (transactions.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Dữ liệu giao dịch rỗng' },
        { status: 400 }
      );
    }

    const results = [];

    for (const tx of transactions) {
      // Extract transaction attributes
      const rawContent = (tx.content || tx.description || '').toUpperCase();
      const amount = Number(tx.transferAmount ?? tx.amount ?? 0);
      const transactionId = String(tx.referenceCode || tx.tid || tx.id || '');

      // Search for orderCode PMXXXXX in content
      const match = rawContent.match(/PM\d{5,6}/i);
      if (!match) {
        results.push({
          content: rawContent,
          status: 'IGNORED',
          reason: 'Không tìm thấy mã đơn hàng PMXXXXX trong nội dung',
        });
        continue;
      }

      const orderCode = match[0].toUpperCase();

      const order = await prisma.order.findUnique({
        where: { orderCode },
      });

      if (!order) {
        results.push({
          orderCode,
          status: 'NOT_FOUND',
          reason: `Đơn hàng ${orderCode} không tồn tại trên hệ thống`,
        });
        continue;
      }

      // Check if order is already paid
      if (order.status === 'PAID') {
        results.push({
          orderCode,
          status: 'ALREADY_PAID',
          message: 'Đơn hàng đã được thanh toán trước đó',
        });
        continue;
      }

      // Check amount matching
      if (order.status === 'PENDING') {
        if (amount < order.amount) {
          results.push({
            orderCode,
            status: 'AMOUNT_MISMATCH',
            reason: `Số tiền chuyển ${amount} VNĐ nhỏ hơn giá trị đơn ${order.amount} VNĐ`,
          });
          continue;
        }

        // Update Order to PAID
        const updatedOrder = await prisma.order.update({
          where: { id: order.id },
          data: {
            status: 'PAID',
            paidAt: new Date(),
            transactionId: transactionId || null,
          },
        });

        console.log(`[PAYMENT_SUCCESS] Đơn hàng ${orderCode} đã được thanh toán thành công qua VietQR.`);

        // Send confirmation email to customer upon successful payment verification
        if (updatedOrder.customerEmail && updatedOrder.customerEmail.includes('@')) {
          try {
            await sendOrderConfirmationEmail({
              customerEmail: updatedOrder.customerEmail,
              customerName: updatedOrder.customerName,
              packageName: updatedOrder.packageName,
              packagePrice: `${updatedOrder.amount.toLocaleString('vi-VN')} VNĐ`,
              phone: updatedOrder.customerPhone,
              orderId: updatedOrder.orderCode,
              notes: `Xác thực thanh toán tự động qua VietQR thành công. Mã giao dịch: ${transactionId || 'N/A'}`,
            });
            console.log(`>>> [WEBHOOK EMAIL SUCCESS] Đã gửi xác nhận đặt cọc thành công tới khách hàng ${updatedOrder.customerEmail}`);
          } catch (err) {
            console.error('[SEND_CONFIRMATION_EMAIL_ERROR]:', err);
          }
        }

        // Notify Studio Admin
        sendAdminBookingNotificationEmail({
          orderId: updatedOrder.orderCode,
          customerName: updatedOrder.customerName,
          phone: updatedOrder.customerPhone,
          customerEmail: updatedOrder.customerEmail,
          packageName: `${updatedOrder.packageName} (ĐÃ THANH TOÁN VIETQR)`,
          estimatedBudget: `${updatedOrder.amount.toLocaleString('vi-VN')} VNĐ`,
          notes: `Đã đối soát thành công qua Webhook SePay/Casso. Mã GD: ${transactionId}`,
        }).catch((err) => {
          console.error('[SEND_ADMIN_NOTIFICATION_EMAIL_ERROR]:', err);
        });

        results.push({
          orderCode,
          status: 'SUCCESS',
          amount,
          transactionId,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Đã xử lý thông báo biến động số dư thành công',
      results,
    });
  } catch (error: any) {
    console.error('[WEBHOOK_PAYMENT_ERROR]:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi xử lý webhook: ' + error.message },
      { status: 500 }
    );
  }
}

