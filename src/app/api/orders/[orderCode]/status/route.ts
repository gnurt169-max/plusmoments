import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
        status: true,
        paidAt: true,
        transactionId: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy đơn hàng.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      status: order.status,
      isPaid: order.status === 'PAID',
      paidAt: order.paidAt,
      transactionId: order.transactionId,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

