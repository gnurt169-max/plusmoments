import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { AdminRole } from '@prisma/client';
import DOMPurify from 'isomorphic-dompurify';

const ALLOWED_BLOG_FIELDS = [
  'title',
  'slug',
  'summary',
  'content',
  'coverImage',
  'author',
  'authorId',
  'category',
  'readingMinutes',
  'published',
  'metaTitle',
  'metaDescription',
  'galleryImages',
] as const;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const post = await prisma.blogPost.findUnique({
        where: { id },
        include: {
          package: true,
          authorUser: { select: { id: true, fullName: true, username: true } },
          images: { orderBy: { orderIndex: 'asc' } },
        },
      });
      return NextResponse.json({ success: true, post });
    }

    const posts = await prisma.blogPost.findMany({
      include: {
        package: true,
        authorUser: { select: { id: true, fullName: true, username: true } },
        images: { orderBy: { orderIndex: 'asc' } },
      },
      orderBy: { publishedAt: 'desc' },
    });
    return NextResponse.json({ success: true, posts });
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
    if (!session) {
      return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      slug,
      summary,
      content,
      coverImage,
      author,
      category,
      readingMinutes,
      published,
      metaTitle,
      metaDescription,
      images,
      postImages,
      packageId,
    } = body;

    if (!title || !slug || !content || !coverImage) {
      return NextResponse.json(
        { success: false, error: 'Tiêu đề, slug, nội dung và ảnh bìa là bắt buộc.' },
        { status: 400 }
      );
    }

    const incomingImages = postImages || images;

    // Prisma relation connect for ServicePackage
    const packageRelation = packageId && String(packageId).trim()
      ? {
          package: {
            connect: { id: String(packageId).trim() },
          },
        }
      : {};

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug: slug.trim().toLowerCase().replace(/\s+/g, '-'),
        summary: summary || title,
        content: DOMPurify.sanitize(content),
        coverImage,
        author: author || session.fullName || 'PlusMoments Editorial',
        ...(session.userId ? { authorUser: { connect: { id: session.userId } } } : {}),
        category: category || 'Cẩm nang cưới',
        readingMinutes: Number(readingMinutes) || 4,
        published: published ?? true,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        galleryImages: Array.isArray(incomingImages) ? incomingImages : [],
        ...packageRelation,
        ...(Array.isArray(incomingImages) && incomingImages.length > 0
          ? {
              images: {
                create: incomingImages.map((img: any, idx: number) => ({
                  url: img.url,
                  alt: img.alt || null,
                  caption: img.caption || null,
                  orderIndex: typeof img.orderIndex === 'number' ? img.orderIndex : idx,
                })),
              },
            }
          : {}),
      },
      include: {
        package: true,
        images: { orderBy: { orderIndex: 'asc' } },
      },
    });

    revalidatePath('/', 'page');
    revalidatePath('/blog', 'page');
    revalidatePath('/cam-nang', 'page');
    if (post.slug) {
      revalidatePath(`/blog/${post.slug}`, 'page');
      revalidatePath(`/cam-nang/${post.slug}`, 'page');
    }

    return NextResponse.json({
      success: true,
      message: 'Xuất bản bài viết thành công!',
      post,
    });
  } catch (error: any) {
    console.error('Create blog post error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      postImages,
      galleryImages,
      images,
      packageId,
      package: _pkg,
      ...rawFields
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Thiếu ID bài viết.' },
        { status: 400 }
      );
    }

    // Ownership check: USER can only edit their own blog posts
    const existingPost = await prisma.blogPost.findUnique({
      where: { id },
      select: { id: true, authorId: true },
    });

    if (!existingPost) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy bài viết.' },
        { status: 404 }
      );
    }

    if (session.role === AdminRole.USER && existingPost.authorId && existingPost.authorId !== session.userId) {
      return NextResponse.json(
        { success: false, error: 'Bạn không có quyền chỉnh sửa nội dung của người khác.' },
        { status: 403 }
      );
    }

    // 1. Whitelist only scalar BlogPost schema fields to prevent Unknown Argument error
    const updateData: Record<string, any> = {};
    for (const key of ALLOWED_BLOG_FIELDS) {
      if (rawFields[key] !== undefined) {
        updateData[key] = rawFields[key];
      }
    }

    if (rawFields.slug) {
      updateData.slug = String(rawFields.slug).trim().toLowerCase().replace(/\s+/g, '-');
    }
    if (updateData.content) {
      updateData.content = DOMPurify.sanitize(updateData.content);
    }
    if (rawFields.readingMinutes !== undefined) {
      updateData.readingMinutes = Number(rawFields.readingMinutes);
    }
    if (rawFields.published !== undefined) {
      updateData.published = Boolean(rawFields.published);
    }

    // 2. Prisma relation connect / disconnect syntax for ServicePackage
    let packageRelation = {};
    if (packageId && String(packageId).trim()) {
      packageRelation = {
        package: {
          connect: { id: String(packageId).trim() },
        },
      };
    } else if (packageId === '' || packageId === null || 'packageId' in body) {
      packageRelation = {
        package: {
          disconnect: true,
        },
      };
    }

    // 3. Child images update
    const incomingImages = postImages || images;
    if (Array.isArray(incomingImages)) {
      updateData.galleryImages = incomingImages;
      updateData.images = {
        deleteMany: {},
        create: incomingImages.map((img: any, idx: number) => ({
          url: img.url,
          alt: img.alt || null,
          caption: img.caption || null,
          orderIndex: typeof img.orderIndex === 'number' ? img.orderIndex : idx,
        })),
      };
    }

    const updated = await prisma.blogPost.update({
      where: { id },
      data: {
        ...updateData,
        ...packageRelation,
      },
      include: {
        package: true,
        images: { orderBy: { orderIndex: 'asc' } },
      },
    });

    revalidatePath('/', 'page');
    revalidatePath('/blog', 'page');
    revalidatePath(`/blog/${updated.slug}`, 'page');
    revalidatePath('/cam-nang', 'page');
    revalidatePath(`/cam-nang/${updated.slug}`, 'page');

    return NextResponse.json({
      success: true,
      message: 'Cập nhật bài viết thành công!',
      post: updated,
    });
  } catch (error: any) {
    console.error('Update blog post error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Thiếu ID bài viết.' },
        { status: 400 }
      );
    }

    // Ownership check: USER can only delete their own blog posts
    const existing = await prisma.blogPost.findUnique({
      where: { id },
      select: { id: true, title: true, authorId: true, slug: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy bài viết.' },
        { status: 404 }
      );
    }

    if (session.role === AdminRole.USER && existing.authorId && existing.authorId !== session.userId) {
      return NextResponse.json(
        { success: false, error: 'Bạn không có quyền xóa nội dung của người khác.' },
        { status: 403 }
      );
    }

    const deleted = await prisma.blogPost.delete({
      where: { id },
    });

    revalidatePath('/', 'page');
    revalidatePath('/blog', 'page');
    revalidatePath('/cam-nang', 'page');
    if (deleted.slug) {
      revalidatePath(`/blog/${deleted.slug}`, 'page');
      revalidatePath(`/cam-nang/${deleted.slug}`, 'page');
    }

    return NextResponse.json({
      success: true,
      message: `Đã xóa bài viết "${deleted.title}" thành công!`,
    });
  } catch (error: any) {
    console.error('Delete blog post error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

