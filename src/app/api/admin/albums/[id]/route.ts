import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { AdminRole } from '@prisma/client';

export const dynamic = 'force-dynamic';

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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const album = await prisma.album.findUnique({
      where: { id },
      include: {
        package: true,
        createdBy: { select: { id: true, fullName: true, username: true } },
        media: { orderBy: { orderIndex: 'asc' } },
      },
    });

    if (!album) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy album.' },
        { status: 404 }
      );
    }

    const safeAlbum = {
      ...album,
      authorName: album.createdBy?.fullName || album.createdBy?.username || 'Hệ Thống',
    };

    return NextResponse.json({ success: true, album: safeAlbum });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  return handleUpdate(request, params.id);
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  return handleUpdate(request, params.id);
}

async function handleUpdate(request: Request, id: string) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const body = await request.json();

    // 1. Explicitly separate batchMediaUrls and media to prevent Prisma Unknown Argument error
    const { batchMediaUrls, mediaUrls, media, id: bodyId, ...rawFields } = body;
    const targetId = id || bodyId;

    if (!targetId) {
      return NextResponse.json(
        { success: false, error: 'Thiếu ID album cần cập nhật.' },
        { status: 400 }
      );
    }

    // Ownership check: USER can only edit their own albums
    const existingAlbum = await prisma.album.findUnique({
      where: { id: targetId },
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

    // 2. Strict Whitelisting: ONLY pass valid Album columns to Prisma
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

    // 3. Perform update in a transaction
    const updated = await prisma.$transaction(async (tx) => {
      // If media URLs are provided, sync child AlbumMedia records
      if (urls.length > 0) {
        await tx.albumMedia.deleteMany({ where: { albumId: targetId } });
        const newMediaRecords = urls.map((url, idx) => ({
          albumId: targetId,
          url,
          altText: `${albumUpdateData.title || rawFields.title || 'Album'} - Ảnh ${idx + 1}`,
          orderIndex: idx,
          isCover: idx === 0,
        }));
        await tx.albumMedia.createMany({ data: newMediaRecords });
      }

      // Update Album row strictly
      return await tx.album.update({
        where: { id: targetId },
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

    revalidateTag('albums');
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
    console.error('Update album error in [id]:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const id = params.id;
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

    revalidateTag('albums');
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
    console.error('Delete album error in [id]:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
