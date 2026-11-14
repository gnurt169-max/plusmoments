import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const addons = await prisma.packageAddon.findMany({
      where: { isActive: true },
      orderBy: { orderIndex: 'asc' },
    });

    return NextResponse.json({
      success: true,
      addons,
    });
  } catch (error: any) {
    console.error('[API_ADDONS_GET_ERROR]:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tải danh sách dịch vụ cộng thêm.' },
      { status: 500 }
    );
  }
}
