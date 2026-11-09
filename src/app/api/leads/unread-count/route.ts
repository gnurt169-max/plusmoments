import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [unreadCount, recentUnread] = await Promise.all([
      prisma.leadBooking.count({
        where: { isRead: false },
      }),
      prisma.leadBooking.findMany({
        where: { isRead: false },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          fullName: true,
          phone: true,
          packageInterested: true,
          createdAt: true,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      unreadCount,
      recentUnread,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

