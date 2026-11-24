import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getAdminSession, assertRole } from '@/lib/auth';
import { AdminRole } from '@prisma/client';
import { exportDatabaseToSeedFiles } from '@/lib/seed-exporter';
import { regenerateLlmsTxt } from '@/lib/llms-generator';

export const dynamic = 'force-dynamic';

function sanitizePrice(value: any): number {
  if (typeof value === 'number') return Math.floor(value);
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9]/g, '');
    const parsed = parseInt(cleaned, 10);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

interface Props {
  params: { id: string };
}

export async function GET(request: Request, { params }: Props) {
  try {
    const { id } = params;
    const pkg = await prisma.servicePackage.findUnique({
      where: { id },
      include: {
        albums: true,
        blogPosts: true,
      },
    });

    if (!pkg) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy gói dịch vụ.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, package: pkg });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

async function handleUpdate(request: Request, id: string) {
  try {
    const session = await getAdminSession();
    const authCheck = assertRole(session, [AdminRole.ADMIN, AdminRole.SUPER_ADMIN]);
    if (!authCheck.authorized) return authCheck.response;

    const body = await request.json();
    const {
      inclusions,
      highlightPoints,
      demoImages,
      price,
      discountPrice,
      originalPrice,
      orderIndex,
      slug,
      albumIds,
      blogPostIds,
      videoLinks,
      ...fields
    } = body;

    const updateData: any = {
      ...fields,
      // Sử dụng cú pháp nested relation set của Prisma để đồng bộ chính xác danh sách Album & Blog gắn kèm
      ...(Array.isArray(albumIds)
        ? {
            albums: {
              set: albumIds.map((item: string) => ({ id: item })),
            },
          }
        : {}),
      ...(Array.isArray(blogPostIds)
        ? {
            blogPosts: {
              set: blogPostIds.map((item: string) => ({ id: item })),
            },
          }
        : {}),
    };

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
    if (videoLinks !== undefined) {
      updateData.videoLinks = Array.isArray(videoLinks) ? videoLinks : [];
    }

    // Đảm bảo tuyệt đối không có albumIds hoặc blogPostIds trong scalar updateData
    delete updateData.albumIds;
    delete updateData.blogPostIds;

    const updated = await prisma.servicePackage.update({
      where: { id },
      data: updateData,
      include: {
        albums: true,
        blogPosts: true,
      },
    });

    revalidateTag('packages');
    revalidateTag('albums');
    revalidateTag('blog');
    revalidatePath('/', 'page');
    revalidatePath('/pricing', 'page');
    revalidatePath('/bang-gia', 'page');
    revalidatePath('/bo-suu-tap', 'page');
    revalidatePath('/blog', 'page');

    exportDatabaseToSeedFiles().catch((err) => {
      console.warn('Sync package to seed mockup failed:', err);
    });

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

export async function PUT(request: Request, { params }: Props) {
  return handleUpdate(request, params.id);
}

export async function PATCH(request: Request, { params }: Props) {
  return handleUpdate(request, params.id);
}

export async function DELETE(request: Request, { params }: Props) {
  try {
    const session = await getAdminSession();
    const authCheck = assertRole(session, [AdminRole.ADMIN, AdminRole.SUPER_ADMIN]);
    if (!authCheck.authorized) return authCheck.response;

    const { id } = params;
    const deleted = await prisma.servicePackage.delete({
      where: { id },
    });

    revalidateTag('packages');
    revalidatePath('/', 'page');
    revalidatePath('/pricing', 'page');
    revalidatePath('/bang-gia', 'page');

    exportDatabaseToSeedFiles().catch((err) => {
      console.warn('Sync package to seed mockup failed:', err);
    });

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
