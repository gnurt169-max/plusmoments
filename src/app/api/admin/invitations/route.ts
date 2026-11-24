import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
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

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Chưa đăng nhập quản trị' }, { status: 401 });
    }

    const invitations = await prisma.weddingInvitation.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        rsvps: {
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { rsvps: true },
        },
      },
    });

    const safeInvitations = invitations.map((inv) => ({
      ...inv,
      ceremonyDate: inv.ceremonyDate.toISOString(),
      createdAt: inv.createdAt.toISOString(),
      updatedAt: inv.updatedAt.toISOString(),
      rsvps: inv.rsvps.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
      })),
    }));

    return NextResponse.json({ success: true, invitations: safeInvitations });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Chưa đăng nhập quản trị' }, { status: 401 });
    }

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
      isPublished = true,
      draftSlug,
    } = body;

    if (!groomName?.trim() || !brideName?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng nhập họ tên Chú Rể và Cô Dâu' },
        { status: 400 }
      );
    }

    if (!venueName?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng nhập tên địa điểm tổ chức hôn lễ' },
        { status: 400 }
      );
    }

    const resolvedVenueAddress = venueAddress?.trim() || venueName.trim();

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

    // Organize invitation media folder: rename from draftSlug to finalSlug
    const rawDraftSlug = draftSlug ? String(draftSlug).trim() : null;

    let finalCoverImage = coverImage;
    let finalGroomImage = groomImage?.trim() || null;
    let finalBrideImage = brideImage?.trim() || null;
    let finalBankQrImage = bankQrImage || null;
    let finalGalleryImages = Array.isArray(galleryImages) ? galleryImages : [];

    const dirsToCheck = [rawDraftSlug, 'drafts'].filter(Boolean) as string[];
    for (const dSlug of dirsToCheck) {
      if (dSlug !== finalSlug) {
        const oldDir = path.join(process.cwd(), 'public', 'uploads', 'invitations', dSlug);
        const newDir = path.join(process.cwd(), 'public', 'uploads', 'invitations', finalSlug);

        if (fs.existsSync(oldDir)) {
          if (!fs.existsSync(newDir)) {
            await fs.promises.mkdir(newDir, { recursive: true });
          }
          try {
            const files = await fs.promises.readdir(oldDir);
            for (const file of files) {
              if (file.startsWith('.')) continue;
              const oldFile = path.join(oldDir, file);
              const newFile = path.join(newDir, file);
              if (dSlug === 'drafts') {
                await fs.promises.copyFile(oldFile, newFile);
              } else {
                await fs.promises.rename(oldFile, newFile);
              }
            }
            if (dSlug !== 'drafts') {
              await fs.promises.rm(oldDir, { recursive: true, force: true }).catch(() => {});
            }
          } catch (e) {
            console.warn('Could not move draft invitation media directory in admin:', e);
          }
        }

        const rewriteUrl = (url: string | null | undefined) => {
          if (!url) return url;
          return url.replace(`/uploads/invitations/${dSlug}/`, `/uploads/invitations/${finalSlug}/`);
        };

        finalCoverImage = rewriteUrl(finalCoverImage) || finalCoverImage;
        finalGroomImage = rewriteUrl(finalGroomImage) || finalGroomImage;
        finalBrideImage = rewriteUrl(finalBrideImage) || finalBrideImage;
        finalBankQrImage = rewriteUrl(finalBankQrImage) || finalBankQrImage;
        finalGalleryImages = finalGalleryImages.map((img: any) => ({
          ...img,
          url: rewriteUrl(img.url) || img.url,
        }));
      }
    }

    const invitation = await prisma.weddingInvitation.create({
      data: {
        slug: finalSlug,
        templateId,
        themeColor,
        groomName: groomName.trim(),
        brideName: brideName.trim(),
        groomParents: groomParents?.trim() || null,
        brideParents: brideParents?.trim() || null,
        groomImage: finalGroomImage,
        brideImage: finalBrideImage,
        groomBio: groomBio?.trim() || null,
        brideBio: brideBio?.trim() || null,
        ceremonyDate: new Date(ceremonyDate),
        ceremonyTimeText: ceremonyTimeText?.trim() || null,
        venueName: venueName.trim(),
        venueAddress: resolvedVenueAddress,
        googleMapsUrl: googleMapsUrl?.trim() || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([venueName, resolvedVenueAddress].filter(Boolean).join(' ').trim())}`,
        storyTitle: storyTitle?.trim() || null,
        storyText: storyText?.trim() || null,
        coverImage: finalCoverImage,
        galleryImages: finalGalleryImages,
        musicPreset,
        bankQrImage: finalBankQrImage,
        bankInfoText: bankInfoText?.trim() || null,
        editPasscode,
        isPublished: Boolean(isPublished),
      },
    });

    return NextResponse.json({
      success: true,
      invitation: {
        ...invitation,
        ceremonyDate: invitation.ceremonyDate.toISOString(),
        createdAt: invitation.createdAt.toISOString(),
        updatedAt: invitation.updatedAt.toISOString(),
        rsvps: [],
        _count: { rsvps: 0 },
      },
      slug: invitation.slug,
      editPasscode: invitation.editPasscode,
      url: `/thiep-cuoi/${invitation.slug}`,
    });
  } catch (error: any) {
    console.error('Error creating wedding invitation in admin:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi tạo thiệp cưới' },
      { status: 500 }
    );
  }
}

