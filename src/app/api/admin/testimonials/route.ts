import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: [{ orderIndex: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({
      success: true,
      testimonials,
    });
  } catch (error: any) {
    console.error('Error fetching testimonials:', error);
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
      coupleNames,
      weddingDate,
      rating = 5,
      quote,
      content,
      avatarUrl,
      coverImageUrl,
      featured = true,
      published = true,
      orderIndex = 0,
      albumId,
    } = body;

    if (!coupleNames?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng nhập tên cặp đôi (dâu rể).' },
        { status: 400 }
      );
    }

    if (!quote?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng nhập câu trích dẫn nổi bật (Quote).' },
        { status: 400 }
      );
    }

    const reviewText = (content || body.reviewContent || '').trim();
    if (!reviewText) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng nhập nội dung đánh giá chi tiết.' },
        { status: 400 }
      );
    }

    const finalAvatar = avatarUrl?.trim() || coverImageUrl?.trim() || '';
    const finalCover = coverImageUrl?.trim() || finalAvatar || '';
    const finalRating = Math.max(1, Math.min(5, Number(rating) || 5));
    const isFeat = featured !== false && body.isFeatured !== false;

    const newTestimonial = await prisma.testimonial.create({
      data: {
        coupleNames: coupleNames.trim(),
        weddingDate: weddingDate ? String(weddingDate).trim() : null,
        quote: quote.trim(),
        content: reviewText,
        reviewContent: reviewText,
        rating: finalRating,
        avatarUrl: finalAvatar,
        coverImageUrl: finalCover,
        featured: isFeat,
        isFeatured: isFeat,
        published: published !== false,
        orderIndex: Number(orderIndex) || 0,
        albumId: albumId || null,
      },
    });

    revalidateTag('settings');
    revalidatePath('/', 'layout');

    return NextResponse.json({
      success: true,
      message: 'Thêm đánh giá dâu rể thành công!',
      testimonial: newTestimonial,
    });
  } catch (error: any) {
    console.error('Error creating testimonial:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi tạo mới đánh giá.' },
      { status: 500 }
    );
  }
}
