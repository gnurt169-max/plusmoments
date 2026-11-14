import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getProofingCookieName, verifyProofingToken } from '@/lib/proofing-auth';
import { scanProofingFolderImages } from '@/lib/proofing-fs';
import { getSystemSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

interface Props {
  params: { code: string };
}

export async function GET(_request: Request, { params }: Props) {
  try {
    const { code } = params;
    if (!code) {
      return NextResponse.json({ success: false, error: 'Thiếu mã dự án.' }, { status: 400 });
    }

    const gallery = await prisma.clientGallery.findUnique({
      where: { code: code.toLowerCase().trim() },
    });

    if (!gallery) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy bộ sưu tập ảnh.' }, { status: 404 });
    }

    const settings = await getSystemSettings().catch(() => null);
    const studioInfo = {
      siteName: settings?.siteName || 'PlusMoments Wedding Pictures & Films',
      hotline: settings?.hotline || '093 888 8888',
      zalo: settings?.zaloNumber || settings?.hotline || '',
      email: settings?.contactEmail || 'contact@plusmoments.vn',
    };

    // Check PIN authentication cookie
    const cookieStore = cookies();
    const cookieName = getProofingCookieName(gallery.code);
    const clientToken = cookieStore.get(cookieName)?.value;

    const isAuthenticated = verifyProofingToken(gallery.code, gallery.pinCode, clientToken);

    if (!isAuthenticated) {
      return NextResponse.json(
        {
          authenticated: false,
          coupleName: gallery.coupleName,
          shootDate: gallery.shootDate,
          coverImage: gallery.coverImage,
          studio: studioInfo,
        },
        { status: 401 }
      );
    }

    // Authenticated: scan and return full gallery photos
    const photos = scanProofingFolderImages(gallery.folderSlug);

    let selections: Record<string, { photobook?: boolean; portrait?: boolean; note?: string }> = {};
    try {
      selections = JSON.parse(gallery.selectionsJson || '{}');
    } catch {
      selections = {};
    }

    return NextResponse.json({
      authenticated: true,
      gallery: {
        id: gallery.id,
        code: gallery.code,
        coupleName: gallery.coupleName,
        shootDate: gallery.shootDate,
        coverImage: gallery.coverImage,
        maxPhotobook: gallery.maxPhotobook,
        maxPortrait: gallery.maxPortrait,
        allowDownload: gallery.allowDownload,
        status: gallery.status,
        clientNote: gallery.clientNote,
        submittedAt: gallery.submittedAt,
        expiresAt: gallery.expiresAt,
      },
      photos,
      selections,
      studio: studioInfo,
    });
  } catch (error: any) {
    console.error('[PROOFING_GET_ERROR]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi tải dữ liệu bộ ảnh.' },
      { status: 500 }
    );
  }
}
