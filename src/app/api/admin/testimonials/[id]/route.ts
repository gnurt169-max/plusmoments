import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface Props {
  params: { id: string };
}

export async function GET(request: Request, { params }: Props) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const testimonial = await prisma.testimonial.findUnique({
      where: { id: params.id },
    });

    if (!testimonial) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy đánh giá.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, testimonial });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: Props) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      coupleNames,
      weddingDate,
      rating,
      quote,
      content,
      avatarUrl,
      coverImageUrl,
      featured,
      published,
      orderIndex,
      albumId,
    } = body;

    const existing = await prisma.testimonial.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy đánh giá để cập nhật.' },
        { status: 404 }
      );
    }

    const updateData: Record<string, any> = {};

    if (coupleNames !== undefined) updateData.coupleNames = coupleNames.trim();
    if (weddingDate !== undefined) updateData.weddingDate = weddingDate ? String(weddingDate).trim() : null;
    if (quote !== undefined) updateData.quote = quote.trim();
    
    const reviewText = content !== undefined ? content : body.reviewContent;
    if (reviewText !== undefined) {
      updateData.content = reviewText.trim();
      updateData.reviewContent = reviewText.trim();
    }

    if (rating !== undefined) {
      updateData.rating = Math.max(1, Math.min(5, Number(rating) || 5));
    }

    if (avatarUrl !== undefined) {
      updateData.avatarUrl = avatarUrl.trim();
      if (!coverImageUrl && !existing.coverImageUrl) {
        updateData.coverImageUrl = avatarUrl.trim();
      }
    }

    if (coverImageUrl !== undefined) {
      updateData.coverImageUrl = coverImageUrl.trim();
    }

    if (featured !== undefined || body.isFeatured !== undefined) {
      const isFeat = featured !== undefined ? Boolean(featured) : Boolean(body.isFeatured);
      updateData.featured = isFeat;
      updateData.isFeatured = isFeat;
    }

    if (published !== undefined) {
      updateData.published = Boolean(published);
    }

    if (orderIndex !== undefined) {
      updateData.orderIndex = Number(orderIndex) || 0;
    }

    if (albumId !== undefined) {
      updateData.albumId = albumId || null;
    }

    const updated = await prisma.testimonial.update({
      where: { id: params.id },
      data: updateData,
    });

    revalidateTag('settings');
    revalidatePath('/', 'layout');

    return NextResponse.json({
      success: true,
      message: 'Cập nhật đánh giá thành công!',
      testimonial: updated,
    });
  } catch (error: any) {
    console.error('Error updating testimonial:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi cập nhật đánh giá.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: Props) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.testimonial.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Đánh giá không tồn tại hoặc đã bị xóa.' },
        { status: 404 }
      );
    }

    await prisma.testimonial.delete({
      where: { id: params.id },
    });

    revalidateTag('settings');
    revalidatePath('/', 'layout');

    return NextResponse.json({
      success: true,
      message: 'Đã xóa đánh giá thành công!',
    });
  } catch (error: any) {
    console.error('Error deleting testimonial:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi xóa đánh giá.' },
      { status: 500 }
    );
  }
}
