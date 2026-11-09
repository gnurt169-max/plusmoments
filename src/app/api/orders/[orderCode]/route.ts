import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSystemSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

interface Props {
  params: { orderCode: string };
}

export async function GET(_request: Request, { params }: Props) {
  try {
    const { orderCode } = params;

    if (!orderCode) {
      return NextResponse.json(
        { success: false, error: 'Thiếu mã đơn hàng.' },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { orderCode: orderCode.toUpperCase() },
      select: {
        id: true,
        orderCode: true,
        customerName: true,
        customerEmail: true,
        customerPhone: true,
        packageName: true,
        amount: true,
        status: true,
        paidAt: true,
        transactionId: true,
        createdAt: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy thông tin đơn hàng.' },
        { status: 404 }
      );
    }

    const settings = await getSystemSettings().catch(() => null);

    const bank = {
      bankBin: settings?.bankBin || '970422',
      bankShortName: settings?.bankShortName || 'MBBank',
      bankAccountNumber: settings?.bankAccountNumber || '',
      bankAccountName: settings?.bankAccountName || '',
    };

    const tracking = {
      googleAdsId: settings?.googleAdsId || '',
      googleAdsPurchaseLabel: settings?.googleAdsPurchaseLabel || settings?.googleAdsConversionLabel || '',
    };

    return NextResponse.json({
      success: true,
      order,
      bank,
      tracking,
    });
  } catch (error: any) {
    console.error('[GET_ORDER_ERROR]:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi lấy thông tin đơn hàng.' },
      { status: 500 }
    );
  }
}

