import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const invitation = await prisma.weddingInvitation.findUnique({
      where: { id: params.id },
      include: {
        rsvps: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy thiệp cưới' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      invitation: {
        ...invitation,
        ceremonyDate: invitation.ceremonyDate.toISOString(),
        createdAt: invitation.createdAt.toISOString(),
        updatedAt: invitation.updatedAt.toISOString(),
        rsvps: invitation.rsvps.map((r) => ({
          ...r,
          createdAt: r.createdAt.toISOString(),
        })),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const body = await request.json();
    const updateData: Record<string, any> = {};

    if (typeof body.isPublished === 'boolean') {
      updateData.isPublished = body.isPublished;
    }
    if (typeof body.groomName === 'string') {
      updateData.groomName = body.groomName.trim();
    }
    if (typeof body.brideName === 'string') {
      updateData.brideName = body.brideName.trim();
    }
    if (typeof body.groomParents === 'string') {
      updateData.groomParents = body.groomParents.trim() || null;
    }
    if (typeof body.brideParents === 'string') {
      updateData.brideParents = body.brideParents.trim() || null;
    }
    if (typeof body.groomImage === 'string') {
      updateData.groomImage = body.groomImage.trim() || null;
    }
    if (typeof body.brideImage === 'string') {
      updateData.brideImage = body.brideImage.trim() || null;
    }
    if (typeof body.groomBio === 'string') {
      updateData.groomBio = body.groomBio.trim() || null;
    }
    if (typeof body.brideBio === 'string') {
      updateData.brideBio = body.brideBio.trim() || null;
    }
    if (body.ceremonyDate) {
      const d = new Date(body.ceremonyDate);
      if (!isNaN(d.getTime())) {
        updateData.ceremonyDate = d;
      }
    }
    if (typeof body.ceremonyTimeText === 'string') {
      updateData.ceremonyTimeText = body.ceremonyTimeText.trim() || null;
    }
    if (typeof body.venueName === 'string') {
      updateData.venueName = body.venueName.trim();
    }
    if (typeof body.venueAddress === 'string') {
      updateData.venueAddress = body.venueAddress.trim();
    }
    // Auto-fallback venueAddress if venueAddress is empty but venueName is present
    if (updateData.venueName && !updateData.venueAddress) {
      updateData.venueAddress = updateData.venueName;
    }
    if (typeof body.googleMapsUrl === 'string') {
      updateData.googleMapsUrl = body.googleMapsUrl.trim() || null;
    }
    if (typeof body.storyTitle === 'string') {
      updateData.storyTitle = body.storyTitle.trim() || null;
    }
    if (typeof body.storyText === 'string') {
      updateData.storyText = body.storyText.trim() || null;
    }
    if (typeof body.coverImage === 'string') {
      updateData.coverImage = body.coverImage.trim();
    }
    if (Array.isArray(body.galleryImages)) {
      updateData.galleryImages = body.galleryImages;
    }
    if (typeof body.templateId === 'string') {
      updateData.templateId = body.templateId.trim();
    }
    if (typeof body.themeColor === 'string') {
      updateData.themeColor = body.themeColor.trim();
    }
    if (typeof body.musicPreset === 'string') {
      updateData.musicPreset = body.musicPreset.trim();
    }
    if (typeof body.bankQrImage === 'string') {
      updateData.bankQrImage = body.bankQrImage.trim() || null;
    }
    if (typeof body.bankInfoText === 'string') {
      updateData.bankInfoText = body.bankInfoText.trim() || null;
    }
    if (typeof body.editPasscode === 'string') {
      updateData.editPasscode = body.editPasscode.trim();
    }

    const updated = await prisma.weddingInvitation.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      invitation: {
        ...updated,
        ceremonyDate: updated.ceremonyDate.toISOString(),
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
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

    const invitation = await prisma.weddingInvitation.findUnique({
      where: { id: params.id },
      select: { id: true, slug: true },
    });

    if (invitation?.slug) {
      const invDir = path.join(process.cwd(), 'public', 'uploads', 'invitations', invitation.slug);
      try {
        if (fs.existsSync(invDir)) {
          await fs.promises.rm(invDir, { recursive: true, force: true });
        }
      } catch (e) {
        console.warn('Could not remove invitation folder on delete:', e);
      }
    }

    await prisma.weddingInvitation.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Đã xóa thiệp cưới thành công' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
