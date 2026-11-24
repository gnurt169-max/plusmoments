import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const invitation = await prisma.weddingInvitation.findUnique({
      where: { slug },
      include: {
        rsvps: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy thiệp cưới' },
        { status: 404 }
      );
    }

    // Increment viewCount silently
    await prisma.weddingInvitation.update({
      where: { id: invitation.id },
      data: { viewCount: { increment: 1 } },
    });

    // Don't expose editPasscode in public GET unless authenticated as admin
    const session = await getAdminSession();
    const safeInvitation = {
      ...invitation,
      editPasscode: session ? invitation.editPasscode : undefined,
    };

    return NextResponse.json({ success: true, invitation: safeInvitation });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi tải thông tin thiệp cưới' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const pin = body.passcode || body.editPasscode || body.pin;
    const { passcode, editPasscode, pin: _pin, ...updateData } = body;

    const existing = await prisma.weddingInvitation.findUnique({
      where: { slug },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy thiệp cưới' },
        { status: 404 }
      );
    }

    // Check permission: either valid admin session or matched editPasscode
    const adminSession = await getAdminSession();
    const isAuthorized =
      Boolean(adminSession) ||
      (pin && String(pin).trim() === existing.editPasscode);

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Mã PIN bảo mật không đúng hoặc bạn chưa được cấp quyền' },
        { status: 403 }
      );
    }

    const cleanUpdate: any = {};
    const allowedFields = [
      'templateId',
      'themeColor',
      'groomName',
      'brideName',
      'groomParents',
      'brideParents',
      'groomImage',
      'brideImage',
      'groomBio',
      'brideBio',
      'ceremonyTimeText',
      'venueName',
      'venueAddress',
      'googleMapsUrl',
      'storyTitle',
      'storyText',
      'coverImage',
      'galleryImages',
      'musicPreset',
      'bankQrImage',
      'bankInfoText',
      'isPublished',
    ];

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        cleanUpdate[field] = updateData[field];
      }
    }

    if (updateData.ceremonyDate) {
      cleanUpdate.ceremonyDate = new Date(updateData.ceremonyDate);
    }

    const updated = await prisma.weddingInvitation.update({
      where: { slug },
      data: cleanUpdate,
    });

    return NextResponse.json({ success: true, invitation: updated });
  } catch (error: any) {
    console.error('Error updating wedding invitation:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi cập nhật thiệp cưới' },
      { status: 500 }
    );
  }
}
