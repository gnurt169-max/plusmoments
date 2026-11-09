import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const locations = await prisma.studioLocation.findMany({
      orderBy: { orderIndex: 'asc' },
    });
    return NextResponse.json({ success: true, locations });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      address,
      hotline,
      hotlineDisplay,
      email,
      googleMapsUrl,
      googleMapsEmbed,
      openingHours,
      isHeadquarter,
      orderIndex,
      published,
    } = body;

    if (!name || !address) {
      return NextResponse.json(
        { success: false, error: 'Tên chi nhánh và địa chỉ là bắt buộc.' },
        { status: 400 }
      );
    }

    const loc = await prisma.studioLocation.create({
      data: {
        name,
        address,
        hotline: hotline || '0908123456',
        hotlineDisplay: hotlineDisplay || hotline || '0908.123.456',
        email: email || null,
        googleMapsUrl: googleMapsUrl || null,
        googleMapsEmbed: googleMapsEmbed || null,
        openingHours: openingHours || '09:00 - 21:00 hàng ngày',
        isHeadquarter: isHeadquarter ?? false,
        orderIndex: Number(orderIndex) || 0,
        published: published ?? true,
      },
    });

    revalidatePath('/');
    revalidatePath('/contact');
    revalidatePath('/', 'layout');

    return NextResponse.json({
      success: true,
      message: 'Thêm chi nhánh studio thành công!',
      location: loc,
    });
  } catch (error: any) {
    console.error('Create location error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, orderIndex, ...fields } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Thiếu ID chi nhánh.' },
        { status: 400 }
      );
    }

    const updateData: any = { ...fields };
    if (orderIndex !== undefined) updateData.orderIndex = Number(orderIndex);

    const updated = await prisma.studioLocation.update({
      where: { id },
      data: updateData,
    });

    revalidatePath('/');
    revalidatePath('/contact');
    revalidatePath('/', 'layout');

    return NextResponse.json({
      success: true,
      message: 'Cập nhật chi nhánh thành công!',
      location: updated,
    });
  } catch (error: any) {
    console.error('Update location error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Thiếu ID chi nhánh.' },
        { status: 400 }
      );
    }

    const deleted = await prisma.studioLocation.delete({
      where: { id },
    });

    revalidatePath('/');
    revalidatePath('/contact');
    revalidatePath('/', 'layout');

    return NextResponse.json({
      success: true,
      message: `Đã xóa chi nhánh "${deleted.name}" thành công!`,
    });
  } catch (error: any) {
    console.error('Delete location error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

