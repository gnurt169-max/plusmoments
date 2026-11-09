import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { AdminRole } from '@prisma/client';

export const dynamic = 'force-dynamic';

// Allowed columns on Album table in Prisma schema
const ALLOWED_ALBUM_FIELDS = [
  'title',
  'slug',
  'subtitle',
  'concept',
  'location',
  'coupleNames',
  'shootingDate',
  'description',
  'coverImage',
  'featured',
  'orderIndex',
  'published',
  'views',
  'metaTitle',
  'metaDescription',
  'packageId',
  'createdById',
] as const;

/**
 * Normalize image URLs from either `mediaUrls` or `batchMediaUrls`
 * Supports string arrays, newline/comma-separated strings, or objects with `.url`
 */
function extractMediaUrls(body: Record<string, any>): string[] {
  const rawUrls = body.mediaUrls ?? body.batchMediaUrls;
  if (!rawUrls) return [];

  let list: string[] = [];
  if (Array.isArray(rawUrls)) {
    list = rawUrls
      .map((item) => (typeof item === 'string' ? item.trim() : item?.url?.trim() || ''))
      .filter((u) => u.length > 5);
  } else if (typeof rawUrls === 'string') {
    list = rawUrls
      .split(/[\n,]/)
      .map((u) => u.trim())
      .filter((u) => u.length > 5);
  }

  return Array.from(new Set(list));
}

function parseSafeDate(val: any): Date | null {
  if (!val) return null;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return null;
    const d = new Date(trimmed);
    return isNaN(d.getTime()) ? null : d;
  }
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? null : val;
  }
  return null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const album = await prisma.album.findUnique({
        where: { id },
        include: {
          package: true,
          createdBy: { select: { id: true, fullName: true, username: true } },
          media: { orderBy: { orderIndex: 'asc' } },
        },
      });

      if (!album) {
        return NextResponse.json({ success: false, error: 'Không tìm thấy album.' }, { status: 404 });
      }

      const safeAlbum = {
        ...album,
        authorName: album.createdBy?.fullName || album.createdBy?.username || 'Hệ Thống',
      };

      return NextResponse.json({ success: true, album: safeAlbum });
    }

    const albums = await prisma.album.findMany({
      orderBy: { orderIndex: 'asc' },
      include: {
        package: true,
        createdBy: { select: { id: true, fullName: true, username: true } },
        media: {
          select: { id: true, url: true, altText: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    // Luôn sanitize kết quả trả về, đảm bảo createdBy không làm crash frontend nếu là null
    const safeAlbums = albums.map((album) => ({
      ...album,
      authorName: album.createdBy?.fullName || album.createdBy?.username || 'Hệ Thống',
    }));

    return NextResponse.json({ success: true, albums: safeAlbums });
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

    // 1. Separate media URLs from Album columns
    const { batchMediaUrls, mediaUrls, id, ...rawFields } = body;
    const urls = extractMediaUrls(body);

    const title = rawFields.title?.trim();
    const slug = rawFields.slug?.trim().toLowerCase().replace(/\s+/g, '-');
    const coverImage = rawFields.coverImage?.trim();

    if (!title || !slug || !coverImage) {
      return NextResponse.json(
        { success: false, error: 'Tiêu đề, slug URL và ảnh bìa là bắt buộc.' },
        { status: 400 }
      );
    }

    // 2. Filter data against Prisma Album schema
    const albumData: Record<string, any> = {};
    for (const key of ALLOWED_ALBUM_FIELDS) {
      if (rawFields[key] !== undefined) {
        albumData[key] = rawFields[key];
      }
    }

    const parsedShootingDate = parseSafeDate(rawFields.shootingDate);
    const rawPkgId = rawFields.packageId && String(rawFields.packageId).trim() ? String(rawFields.packageId).trim() : null;

    albumData.title = title;
    albumData.slug = slug;
    albumData.coverImage = coverImage;
    albumData.concept = albumData.concept || 'Outdoor Luxury';
    albumData.location = albumData.location || 'TP. Hồ Chí Minh';
    albumData.coupleNames = albumData.coupleNames || 'Cô dâu & Chú rể';
    albumData.orderIndex = parseInt(String(albumData.orderIndex), 10) || 0;
    albumData.featured = Boolean(albumData.featured);
    albumData.published = albumData.published !== undefined ? Boolean(albumData.published) : true;
    albumData.shootingDate = parsedShootingDate;
    albumData.createdById = session.userId;
    delete albumData.packageId;

    let packageRelation = {};
    if (rawPkgId) {
      packageRelation = {
        package: {
          connect: { id: rawPkgId },
        },
      };
    }

    // 3. Prepare child AlbumMedia records
    const finalMediaUrls = urls.length > 0 ? urls : [coverImage];
    const mediaCreateData = finalMediaUrls.map((url, idx) => ({
      url,
      altText: `${title} - Ảnh ${idx + 1}`,
      caption: null,
      orderIndex: idx,
      isCover: idx === 0,
    }));

    // 4. Create Album with nested media
    const album = await prisma.album.create({
      data: {
        ...albumData,
        ...packageRelation,
        title,
        slug,
        coverImage,
        concept: albumData.concept || 'Outdoor Luxury',
        location: albumData.location || 'TP. Hồ Chí Minh',
        coupleNames: albumData.coupleNames || 'Cô dâu & Chú rể',
        shootingDate: parsedShootingDate,
        media: {
          create: mediaCreateData,
        },
      } as any,
      include: { media: true },
    });

    revalidatePath('/', 'page');
    revalidatePath('/bo-suu-tap', 'page');
    revalidatePath('/albums', 'page');
    if (album.slug) {
      revalidatePath(`/bo-suu-tap/${album.slug}`, 'page');
      revalidatePath(`/albums/${album.slug}`, 'page');
    }

    return NextResponse.json({
      success: true,
      message: 'Tạo album cưới thành công!',
      album,
    });
  } catch (error: any) {
    console.error('Create album error:', error);
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

    // 1. Separate batchMediaUrls and mediaUrls to prevent Prisma Unknown Argument error
    const { id, batchMediaUrls, mediaUrls, media, ...rawFields } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Thiếu ID album cần cập nhật.' },
        { status: 400 }
      );
    }

    // Ownership check: USER can only edit their own albums
    const existingAlbum = await prisma.album.findUnique({
      where: { id },
      select: { id: true, createdById: true },
    });

    if (!existingAlbum) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy album.' },
        { status: 404 }
      );
    }

    if (session.role === AdminRole.USER && existingAlbum.createdById && existingAlbum.createdById !== session.userId) {
      return NextResponse.json(
        { success: false, error: 'Bạn không có quyền chỉnh sửa nội dung của người khác.' },
        { status: 403 }
      );
    }

    const urls = extractMediaUrls(body);

    // 2. Strict Whitelisting: ONLY pass valid Album table columns to Prisma
    const albumUpdateData: Record<string, any> = {};
    for (const key of ALLOWED_ALBUM_FIELDS) {
      if (rawFields[key] !== undefined) {
        albumUpdateData[key] = rawFields[key];
      }
    }

    if (albumUpdateData.slug) {
      albumUpdateData.slug = String(albumUpdateData.slug).trim().toLowerCase().replace(/\s+/g, '-');
    }
    if (albumUpdateData.orderIndex !== undefined || 'orderIndex' in rawFields) {
      albumUpdateData.orderIndex = parseInt(String(albumUpdateData.orderIndex ?? rawFields.orderIndex), 10) || 0;
    }
    if ('shootingDate' in rawFields || albumUpdateData.shootingDate !== undefined) {
      albumUpdateData.shootingDate = parseSafeDate(rawFields.shootingDate ?? albumUpdateData.shootingDate);
    }
    if (albumUpdateData.featured !== undefined) {
      albumUpdateData.featured = Boolean(albumUpdateData.featured);
    }
    if (albumUpdateData.published !== undefined) {
      albumUpdateData.published = Boolean(albumUpdateData.published);
    }
    delete albumUpdateData.packageId;

    let packageRelation = {};
    const pkgId = rawFields.packageId && String(rawFields.packageId).trim() ? String(rawFields.packageId).trim() : null;
    if (pkgId) {
      packageRelation = {
        package: {
          connect: { id: pkgId },
        },
      };
    } else if (rawFields.packageId === '' || rawFields.packageId === null || 'packageId' in rawFields) {
      packageRelation = {
        package: {
          disconnect: true,
        },
      };
    }

    // 3. Update Album record and replace/update child AlbumMedia records safely
    const updated = await prisma.$transaction(async (tx) => {
      // If new media URLs are supplied, update AlbumMedia records
      if (urls.length > 0) {
        await tx.albumMedia.deleteMany({ where: { albumId: id } });
        const newMediaRecords = urls.map((url, idx) => ({
          albumId: id,
          url,
          altText: `${albumUpdateData.title || rawFields.title || 'Album'} - Ảnh ${idx + 1}`,
          orderIndex: idx,
          isCover: idx === 0,
        }));
        await tx.albumMedia.createMany({ data: newMediaRecords });
      }

      // Update Album table strictly with whitelisted columns
      return await tx.album.update({
        where: { id },
        data: {
          ...albumUpdateData,
          ...packageRelation,
        } as any,
        include: {
          package: true,
          media: { orderBy: { orderIndex: 'asc' } },
        },
      });
    });

    revalidatePath('/', 'page');
    revalidatePath('/bo-suu-tap', 'page');
    revalidatePath('/albums', 'page');
    if (updated.slug) {
      revalidatePath(`/bo-suu-tap/${updated.slug}`, 'page');
      revalidatePath(`/albums/${updated.slug}`, 'page');
    }

    return NextResponse.json({
      success: true,
      message: 'Cập nhật album thành công!',
      album: updated,
    });
  } catch (error: any) {
    console.error('Update album error:', error);
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
        { success: false, error: 'Thiếu ID album cần xóa.' },
        { status: 400 }
      );
    }

    // Ownership check: USER can only delete their own albums
    const existing = await prisma.album.findUnique({
      where: { id },
      select: { id: true, title: true, createdById: true, slug: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy album.' },
        { status: 404 }
      );
    }

    if (session.role === AdminRole.USER && existing.createdById && existing.createdById !== session.userId) {
      return NextResponse.json(
        { success: false, error: 'Bạn không có quyền xóa nội dung của người khác.' },
        { status: 403 }
      );
    }

    const deleted = await prisma.album.delete({
      where: { id },
    });

    revalidatePath('/', 'page');
    revalidatePath('/bo-suu-tap', 'page');
    revalidatePath('/albums', 'page');
    if (deleted.slug) {
      revalidatePath(`/bo-suu-tap/${deleted.slug}`, 'page');
      revalidatePath(`/albums/${deleted.slug}`, 'page');
    }

    return NextResponse.json({
      success: true,
      message: `Đã xóa album "${deleted.title}" thành công!`,
    });
  } catch (error: any) {
    console.error('Delete album error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
