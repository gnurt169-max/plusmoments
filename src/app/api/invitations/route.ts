import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function generatePasscode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const template = searchParams.get('template');

    const invitations = await prisma.weddingInvitation.findMany({
      where: {
        isPublished: true,
        ...(template ? { templateId: template } : {}),
      },
      select: {
        id: true,
        slug: true,
        templateId: true,
        themeColor: true,
        groomName: true,
        brideName: true,
        ceremonyDate: true,
        ceremonyTimeText: true,
        venueName: true,
        venueAddress: true,
        coverImage: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({ success: true, invitations });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi tải danh sách thiệp cưới' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      groomName,
      brideName,
      groomParents,
      brideParents,
      groomImage,
      brideImage,
      groomBio,
      brideBio,
      ceremonyDate,
      ceremonyTimeText,
      venueName,
      venueAddress,
      googleMapsUrl,
      storyTitle,
      storyText,
      coverImage,
      galleryImages,
      templateId = 'timeless-ivory',
      themeColor = '#8C6D46',
      musicPreset = 'romantic-piano',
      bankQrImage,
      bankInfoText,
      customSlug,
      editPasscode: requestedPasscode,
    } = body;

    if (!groomName?.trim() || !brideName?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng nhập họ tên Chú Rể và Cô Dâu' },
        { status: 400 }
      );
    }

    if (!venueName?.trim() || !venueAddress?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng nhập tên và địa chỉ địa điểm tổ chức' },
        { status: 400 }
      );
    }

    if (!ceremonyDate) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng chọn ngày tổ chức hôn lễ' },
        { status: 400 }
      );
    }

    if (!coverImage) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng chọn hoặc tải lên ảnh bìa thiệp cưới' },
        { status: 400 }
      );
    }

    // Generate safe unique slug
    let baseSlug = customSlug?.trim()
      ? slugify(customSlug)
      : `${slugify(groomName)}-${slugify(brideName)}`;

    if (!baseSlug) {
      baseSlug = `wedding-${Date.now().toString(36)}`;
    }

    let finalSlug = baseSlug;
    let counter = 1;
    while (await prisma.weddingInvitation.findUnique({ where: { slug: finalSlug } })) {
      const suffix = Math.random().toString(36).substring(2, 6);
      finalSlug = `${baseSlug}-${suffix}`;
      counter++;
      if (counter > 5) break;
    }

    const editPasscode = requestedPasscode?.trim() || generatePasscode();

    const invitation = await prisma.weddingInvitation.create({
      data: {
        slug: finalSlug,
        templateId,
        themeColor,
        groomName: groomName.trim(),
        brideName: brideName.trim(),
        groomParents: groomParents?.trim() || null,
        brideParents: brideParents?.trim() || null,
        groomImage: groomImage?.trim() || null,
        brideImage: brideImage?.trim() || null,
        groomBio: groomBio?.trim() || null,
        brideBio: brideBio?.trim() || null,
        ceremonyDate: new Date(ceremonyDate),
        ceremonyTimeText: ceremonyTimeText?.trim() || null,
        venueName: venueName.trim(),
        venueAddress: venueAddress.trim(),
        googleMapsUrl: googleMapsUrl?.trim() || null,
        storyTitle: storyTitle?.trim() || null,
        storyText: storyText?.trim() || null,
        coverImage,
        galleryImages: Array.isArray(galleryImages) ? galleryImages : [],
        musicPreset,
        bankQrImage: bankQrImage || null,
        bankInfoText: bankInfoText?.trim() || null,
        editPasscode,
        isPublished: true,
      },
    });

    return NextResponse.json({
      success: true,
      invitation,
      slug: invitation.slug,
      editPasscode: invitation.editPasscode,
      url: `/thiep-cuoi/${invitation.slug}`,
    });
  } catch (error: any) {
    console.error('Error creating wedding invitation:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi tạo thiệp cưới' },
      { status: 500 }
    );
  }
}
