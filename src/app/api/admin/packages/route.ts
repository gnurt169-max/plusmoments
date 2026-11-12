import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getAdminSession, assertRole } from '@/lib/auth';
import { AdminRole } from '@prisma/client';
import { exportDatabaseToSeedFiles } from '@/lib/seed-exporter';
import { regenerateLlmsTxt } from '@/lib/llms-generator';

export const dynamic = 'force-dynamic';

/**
 * Làm sạch và chuyển đổi giá tiền về số nguyên an toàn
 * Loại bỏ ký tự phân tách (chấm, phẩy, khoảng trắng, chữ đ/VNĐ)
 */
function sanitizePrice(value: any): number {
  if (typeof value === 'number') return Math.floor(value);
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9]/g, '');
    const parsed = parseInt(cleaned, 10);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

export async function GET(request: Request) {
  try {
    const packages = await prisma.servicePackage.findMany({
      orderBy: { orderIndex: 'asc' },
    });
    return NextResponse.json({ success: true, packages });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    const authCheck = assertRole(session, [AdminRole.ADMIN, AdminRole.SUPER_ADMIN]);
    if (!authCheck.authorized) return authCheck.response;

    const body = await request.json();
    const {
      name,
      slug,
      category,
      subtitle,
      price,
      discountPrice,
      originalPrice,
      unit,
      coverImage,
      demoImages,
      highlightPoints,
      isPopular,
      isFeatured,
      orderIndex,
      published,
      inclusions,
      deliverables,
    } = body;

    const rawPrice = price !== undefined ? price : discountPrice;
    if (!name || !slug || rawPrice === undefined || rawPrice === null || rawPrice === '') {
      return NextResponse.json(
        { success: false, error: 'Tên gói, slug và giá là bắt buộc.' },
        { status: 400 }
      );
    }

    // Làm sạch và giới hạn giá tiền tránh tràn số Postgres 22003
    const parsedPrice = sanitizePrice(rawPrice);
    const parsedOriginalPrice =
      originalPrice !== undefined && originalPrice !== null && originalPrice !== ''
        ? sanitizePrice(originalPrice)
        : null;

    // Giới hạn giá trị hợp lý (tối đa 1 tỷ VNĐ)
    const safePrice = Math.min(Math.max(0, parsedPrice), 1_000_000_000);
    const safeOriginalPrice =
      parsedOriginalPrice !== null
        ? Math.min(Math.max(0, parsedOriginalPrice), 1_000_000_000)
        : null;

    const inclusionsStr = Array.isArray(inclusions)
      ? JSON.stringify(inclusions)
      : inclusions || '[]';

    const highlightsStr = Array.isArray(highlightPoints)
      ? JSON.stringify(highlightPoints)
      : highlightPoints || '[]';

    const demoImagesStr = Array.isArray(demoImages)
      ? JSON.stringify(demoImages)
      : demoImages || '[]';

    const newPkg = await prisma.servicePackage.create({
      data: {
        name,
        slug: slug.trim().toLowerCase().replace(/\s+/g, '-'),
        category: category?.trim() || 'Dịch Vụ Cưới',
        subtitle: subtitle || null,
        price: safePrice,
        originalPrice: safeOriginalPrice,
        unit: unit || 'trọn gói',
        coverImage: coverImage || '',
        demoImages: demoImagesStr,
        highlightPoints: highlightsStr,
        isPopular: isPopular ?? false,
        isFeatured: isFeatured ?? true,
        orderIndex: Number(orderIndex) || 0,
        published: published ?? true,
        inclusions: inclusionsStr,
        deliverables: deliverables || null,
      },
    });

    // Cập nhật bộ nhớ cache Next.js
    revalidatePath('/', 'page');
    revalidatePath('/pricing', 'page');
    revalidatePath('/bang-gia', 'page');

    // Đồng bộ snapshot tĩnh vào prisma/seed.ts & prisma/seed.js
    exportDatabaseToSeedFiles().catch((err) => {
      console.warn('Sync package to seed mockup failed:', err);
    });

    // Tự động làm mới public/llms.txt tĩnh
    regenerateLlmsTxt().catch(console.error);

    return NextResponse.json({
      success: true,
      message: 'Tạo gói dịch vụ thành công!',
      package: newPkg,
    });
  } catch (error: any) {
    console.error('Create package error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getAdminSession();
    const authCheck = assertRole(session, [AdminRole.ADMIN, AdminRole.SUPER_ADMIN]);
    if (!authCheck.authorized) return authCheck.response;

    const body = await request.json();
    const {
      id,
      inclusions,
      highlightPoints,
      demoImages,
      price,
      discountPrice,
      originalPrice,
      orderIndex,
      slug,
      ...fields
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Thiếu ID gói cần cập nhật.' },
        { status: 400 }
      );
    }

    const updateData: any = { ...fields };

    // Chuẩn hóa giá tiền an toàn
    const rawPrice = price !== undefined ? price : discountPrice;
    if (rawPrice !== undefined && rawPrice !== null && rawPrice !== '') {
      const cleanPrice = sanitizePrice(rawPrice);
      updateData.price = Math.min(Math.max(0, cleanPrice), 1_000_000_000);
    }

    if (originalPrice !== undefined) {
      if (originalPrice === null || originalPrice === '') {
        updateData.originalPrice = null;
      } else {
        const cleanOrigPrice = sanitizePrice(originalPrice);
        updateData.originalPrice = Math.min(Math.max(0, cleanOrigPrice), 1_000_000_000);
      }
    }

    if (orderIndex !== undefined) updateData.orderIndex = Number(orderIndex) || 0;
    if (slug) updateData.slug = slug.trim().toLowerCase().replace(/\s+/g, '-');
    if (fields.category !== undefined) updateData.category = String(fields.category).trim();
    if (inclusions !== undefined) {
      updateData.inclusions = Array.isArray(inclusions)
        ? JSON.stringify(inclusions)
        : inclusions;
    }
    if (highlightPoints !== undefined) {
      updateData.highlightPoints = Array.isArray(highlightPoints)
        ? JSON.stringify(highlightPoints)
        : highlightPoints;
    }
    if (demoImages !== undefined) {
      updateData.demoImages = Array.isArray(demoImages)
        ? JSON.stringify(demoImages)
        : demoImages;
    }

    const updated = await prisma.servicePackage.update({
      where: { id },
      data: updateData,
    });

    revalidatePath('/', 'page');
    revalidatePath('/pricing', 'page');
    revalidatePath('/bang-gia', 'page');

    // Đồng bộ snapshot tĩnh vào prisma/seed.ts & prisma/seed.js
    exportDatabaseToSeedFiles().catch((err) => {
      console.warn('Sync package to seed mockup failed:', err);
    });

    // Tự động làm mới public/llms.txt tĩnh
    regenerateLlmsTxt().catch(console.error);

    return NextResponse.json({
      success: true,
      message: 'Cập nhật gói dịch vụ thành công!',
      package: updated,
    });
  } catch (error: any) {
    console.error('Update package error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getAdminSession();
    const authCheck = assertRole(session, [AdminRole.ADMIN, AdminRole.SUPER_ADMIN]);
    if (!authCheck.authorized) return authCheck.response;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Thiếu ID gói dịch vụ.' },
        { status: 400 }
      );
    }

    const deleted = await prisma.servicePackage.delete({
      where: { id },
    });

    revalidatePath('/', 'page');
    revalidatePath('/pricing', 'page');
    revalidatePath('/bang-gia', 'page');

    // Đồng bộ snapshot tĩnh vào prisma/seed.ts & prisma/seed.js
    exportDatabaseToSeedFiles().catch((err) => {
      console.warn('Sync package to seed mockup failed:', err);
    });

    // Tự động làm mới public/llms.txt tĩnh
    regenerateLlmsTxt().catch(console.error);

    return NextResponse.json({
      success: true,
      message: `Đã xóa gói "${deleted.name}" thành công!`,
    });
  } catch (error: any) {
    console.error('Delete package error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
