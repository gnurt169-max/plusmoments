import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { scanProofingFolderImages } from '@/lib/proofing-fs';

export const dynamic = 'force-dynamic';

function slugifyName(name: string): string {
  if (!name) return 'proofing';
  return (
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9_-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50) || 'proofing'
  );
}

function generateRandomPin(): string {
  // Generate random 6-digit PIN
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateRandomSuffix(len = 4): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let str = '';
  for (let i = 0; i < len; i++) {
    str += chars[Math.floor(Math.random() * chars.length)];
  }
  return str;
}

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Chưa đăng nhập quản trị.' }, { status: 401 });
    }

    const galleries = await prisma.clientGallery.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const enrichedGalleries = galleries.map((g) => {
      let selections: Record<string, { photobook?: boolean; portrait?: boolean; note?: string }> = {};
      try {
        selections = JSON.parse(g.selectionsJson || '{}');
      } catch {
        selections = {};
      }

      let photobookCount = 0;
      let portraitCount = 0;
      let notesCount = 0;

      for (const key of Object.keys(selections)) {
        const item = selections[key];
        if (item?.photobook) photobookCount++;
        if (item?.portrait) portraitCount++;
        if (item?.note && item.note.trim()) notesCount++;
      }

      // Check folder image count
      const images = scanProofingFolderImages(g.folderSlug);

      return {
        ...g,
        totalPhotos: images.length,
        photobookCount,
        portraitCount,
        notesCount,
        selectionsCount: Object.keys(selections).length,
      };
    });

    return NextResponse.json({
      success: true,
      galleries: enrichedGalleries,
    });
  } catch (error: any) {
    console.error('[ADMIN_PROOFING_LIST_ERROR]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi lấy danh sách dự án proofing.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Chưa đăng nhập quản trị.' }, { status: 401 });
    }

    const body = await request.json();
    const {
      coupleName,
      folderSlug,
      shootDate,
      coverImage,
      maxPhotobook,
      maxPortrait,
      allowDownload,
      expiresAt,
    } = body;

    const trimmedName = (coupleName || '').trim();
    const trimmedFolder = (folderSlug || '').trim();

    if (!trimmedName) {
      return NextResponse.json(
        { success: false, error: 'Tên dâu rể là bắt buộc.' },
        { status: 400 }
      );
    }

    if (!trimmedFolder) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng chọn thư mục ảnh từ Kho Media.' },
        { status: 400 }
      );
    }

    // Verify folder exists and has photos
    const folderPhotos = scanProofingFolderImages(trimmedFolder);
    if (folderPhotos.length === 0) {
      return NextResponse.json(
        { success: false, error: `Thư mục "${trimmedFolder}" không tồn tại hoặc chưa có ảnh.` },
        { status: 400 }
      );
    }

    // Auto-generate code slug
    let baseSlug = body.code ? slugifyName(body.code) : slugifyName(trimmedName);
    let code = baseSlug;
    let attempts = 0;

    while (attempts < 10) {
      const existing = await prisma.clientGallery.findUnique({
        where: { code },
      });
      if (!existing) break;
      code = `${baseSlug}-${generateRandomSuffix(3)}`;
      attempts++;
    }

    // PIN code: custom or auto-generated 6 digits
    const rawPin = body.pinCode ? String(body.pinCode).trim() : '';
    const pinCode = rawPin && /^\d{4,8}$/.test(rawPin) ? rawPin : generateRandomPin();

    // Cover image: custom or fallback to first photo in folder
    const finalCoverImage =
      coverImage && typeof coverImage === 'string' && coverImage.trim()
        ? coverImage.trim()
        : folderPhotos[0]?.url || null;

    const parsedMaxPhotobook = Number.isInteger(Number(maxPhotobook)) && Number(maxPhotobook) > 0
      ? Number(maxPhotobook)
      : 40;

    const parsedMaxPortrait = Number.isInteger(Number(maxPortrait)) && Number(maxPortrait) >= 0
      ? Number(maxPortrait)
      : 2;

    const parsedExpiresAt = expiresAt ? new Date(expiresAt) : null;

    const gallery = await prisma.clientGallery.create({
      data: {
        code,
        pinCode,
        coupleName: trimmedName,
        shootDate: shootDate ? String(shootDate).trim() : null,
        folderSlug: trimmedFolder,
        coverImage: finalCoverImage,
        maxPhotobook: parsedMaxPhotobook,
        maxPortrait: parsedMaxPortrait,
        allowDownload: allowDownload !== undefined ? Boolean(allowDownload) : true,
        status: 'OPEN',
        selectionsJson: '{}',
        expiresAt: parsedExpiresAt,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Khởi tạo dự án trả ảnh thành công!',
      gallery,
    });
  } catch (error: any) {
    console.error('[ADMIN_PROOFING_CREATE_ERROR]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi tạo dự án proofing.' },
      { status: 500 }
    );
  }
}
