import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { parseVietnamWeddingDate } from '@/lib/utils';
import { generateRandomSlug, buildVietQrUrl } from '@/lib/invitations/templates';

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
      fontFamily = 'cormorant',
      musicPreset = 'romantic-piano',
      bankQrImage,
      bankInfoText,
      bankId,
      bankAccount,
      bankOwner,
      giftAmount,
      giftMessage,
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

    const safeVenueName = venueName?.trim() || 'Tư gia';
    const resolvedVenueAddress = venueAddress?.trim() || (venueName?.trim() ? `${venueName.trim()}, TP. Hồ Chí Minh` : 'Tư gia');

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

    // Slug Management: Random default or validated custom slug with collision check
    let finalSlug = '';
    if (customSlug && String(customSlug).trim()) {
      const cleanCustom = slugify(String(customSlug).trim());
      if (cleanCustom.length < 2) {
        return NextResponse.json(
          { success: false, error: 'Đường dẫn riêng phải có ít nhất 2 ký tự hợp lệ' },
          { status: 400 }
        );
      }
      const existing = await prisma.weddingInvitation.findUnique({
        where: { slug: cleanCustom },
        select: { id: true },
      });
      if (existing) {
        return NextResponse.json(
          { success: false, error: 'Đường dẫn này đã tồn tại trên hệ thống, vui lòng chọn tên đường dẫn khác.' },
          { status: 409 }
        );
      }
      finalSlug = cleanCustom;
    } else {
      let candidate = generateRandomSlug();
      let attempts = 0;
      while (await prisma.weddingInvitation.findUnique({ where: { slug: candidate } })) {
        candidate = generateRandomSlug();
        attempts++;
        if (attempts > 10) break;
      }
      finalSlug = candidate;
    }

    const rawPasscode = requestedPasscode ? String(requestedPasscode).trim() : generatePasscode();
    if (!/^\d{6}$/.test(rawPasscode)) {
      return NextResponse.json(
        { success: false, error: 'Mã PIN chỉnh sửa phải gồm đúng 6 chữ số' },
        { status: 400 }
      );
    }
    const editPasscode = rawPasscode;

    // Organize invitation media folder: rename from draftSlug to finalSlug
    const rawDraftSlug = draftSlug ? String(draftSlug).trim() : null;

    let finalCoverImage = coverImage;
    let finalGroomImage = groomImage?.trim() || null;
    let finalBrideImage = brideImage?.trim() || null;
    let finalBankQrImage = bankQrImage?.trim() || null;

    // Auto-generate VietQR if bankId & bankAccount are provided and no custom QR image
    if (!finalBankQrImage && bankId?.trim() && bankAccount?.trim()) {
      finalBankQrImage = buildVietQrUrl({
        bankId: bankId.trim(),
        bankAccount: bankAccount.trim(),
        bankOwner: bankOwner?.trim(),
        giftAmount: giftAmount ? Number(giftAmount) : null,
        giftMessage: giftMessage?.trim(),
      });
    }

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
        ceremonyDate: parseVietnamWeddingDate(ceremonyDate) || new Date(ceremonyDate),
        ceremonyTimeText: ceremonyTimeText?.trim() || null,
        venueName: safeVenueName,
        venueAddress: resolvedVenueAddress,
        googleMapsUrl: googleMapsUrl?.trim() || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([safeVenueName, resolvedVenueAddress].filter(Boolean).join(' ').trim())}`,
        storyTitle: storyTitle?.trim() || null,
        storyText: storyText?.trim() || null,
        coverImage: finalCoverImage,
        galleryImages: finalGalleryImages,
        musicPreset,
        fontFamily: fontFamily || 'cormorant',
        bankQrImage: finalBankQrImage,
        bankInfoText: bankInfoText?.trim() || null,
        bankId: bankId?.trim() || null,
        bankAccount: bankAccount?.trim() || null,
        bankOwner: bankOwner?.trim() || null,
        giftAmount: giftAmount ? Number(giftAmount) : null,
        giftMessage: giftMessage?.trim() || null,
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

