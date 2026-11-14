import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const addons = await prisma.packageAddon.findMany({
      orderBy: { orderIndex: 'asc' },
    });

    return NextResponse.json({
      success: true,
      addons,
    });
  } catch (error: any) {
    console.error('[API_ADMIN_ADDONS_GET_ERROR]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi tải danh sách Add-on.' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, price, unit, allowQuantity, isActive, orderIndex } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Tên dịch vụ cộng thêm là bắt buộc.' },
        { status: 400 }
      );
    }

    const parsedPrice = typeof price === 'number' ? Math.max(0, price) : parseInt(String(price || 0).replace(/[^\d]/g, ''), 10) || 0;

    const count = await prisma.packageAddon.count();

    const addon = await prisma.packageAddon.create({
      data: {
        name: name.trim(),
        description: description ? String(description).trim() : null,
        price: parsedPrice,
        unit: unit ? String(unit).trim() : '/ buổi',
        allowQuantity: Boolean(allowQuantity),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        orderIndex: orderIndex !== undefined ? Number(orderIndex) : count,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Tạo dịch vụ cộng thêm thành công!',
      addon,
    });
  } catch (error: any) {
    console.error('[API_ADMIN_ADDONS_POST_ERROR]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi tạo Add-on mới.' },
      { status: 500 }
    );
  }
}
