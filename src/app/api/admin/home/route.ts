import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let config = await prisma.homePageConfig.findUnique({
      where: { id: 'default' },
    });

    if (!config) {
      config = await prisma.homePageConfig.create({
        data: { id: 'default' },
      });
    }

    return NextResponse.json({ success: true, config });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const updateData: Record<string, any> = {};
    const allowed = [
      'heroBadge',
      'heroTitle',
      'heroSubtitle',
      'heroBannerImage',
      'statsJson',
      'philosophyTitle',
      'philosophyText',
      'showTestimonials',
      'testimonialsTitle',
      'testimonialsSubtitle',
    ];

    for (const key of allowed) {
      if (body[key] !== undefined) {
        updateData[key] = body[key];
      }
    }

    const updated = await prisma.homePageConfig.upsert({
      where: { id: 'default' },
      update: updateData,
      create: {
        id: 'default',
        ...updateData,
      },
    });

    revalidateTag('settings');
    revalidatePath('/', 'layout');

    return NextResponse.json({
      success: true,
      message: 'Cập nhật cấu hình trang chủ thành công!',
      config: updated,
    });
  } catch (error: any) {
    console.error('Error updating home page config:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

