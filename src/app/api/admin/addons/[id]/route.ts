import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface Props {
  params: { id: string };
}

export async function PATCH(req: Request, { params }: Props) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = String(body.name).trim();
    if (body.description !== undefined) updateData.description = body.description ? String(body.description).trim() : null;
    if (body.price !== undefined) {
      updateData.price = typeof body.price === 'number' ? Math.max(0, body.price) : parseInt(String(body.price).replace(/[^\d]/g, ''), 10) || 0;
    }
    if (body.unit !== undefined) updateData.unit = String(body.unit).trim();
    if (body.allowQuantity !== undefined) updateData.allowQuantity = Boolean(body.allowQuantity);
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);
    if (body.orderIndex !== undefined) updateData.orderIndex = Number(body.orderIndex);

    const updated = await prisma.packageAddon.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Cập nhật Add-on thành công!',
      addon: updated,
    });
  } catch (error: any) {
    console.error('[API_ADMIN_ADDONS_PATCH_ERROR]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi cập nhật Add-on.' },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, { params }: Props) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    await prisma.packageAddon.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Đã xóa dịch vụ cộng thêm thành công!',
    });
  } catch (error: any) {
    console.error('[API_ADMIN_ADDONS_DELETE_ERROR]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi xóa Add-on.' },
      { status: 500 }
    );
  }
}
