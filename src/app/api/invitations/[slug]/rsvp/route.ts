import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const {
      guestName,
      attendance = 'ATTENDING',
      guestCount = 1,
      side = 'BOTH',
      wishMessage,
    } = body;

    if (!guestName || !guestName.trim()) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng nhập tên của bạn hoặc gia đình' },
        { status: 400 }
      );
    }

    const invitation = await prisma.weddingInvitation.findUnique({
      where: { slug },
      select: { id: true, isPublished: true },
    });

    if (!invitation) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy thiệp cưới' },
        { status: 404 }
      );
    }

    const rsvp = await prisma.invitationRsvp.create({
      data: {
        invitationId: invitation.id,
        guestName: guestName.trim().slice(0, 100),
        attendance: attendance === 'DECLINED' ? 'DECLINED' : 'ATTENDING',
        guestCount: Math.max(1, Math.min(10, Number(guestCount) || 1)),
        side: ['GROOM', 'BRIDE', 'BOTH'].includes(side) ? side : 'BOTH',
        wishMessage: wishMessage?.trim() ? wishMessage.trim().slice(0, 500) : null,
      },
    });

    return NextResponse.json({
      success: true,
      rsvp,
      message: 'Gửi xác nhận tham dự & lời chúc thành công!',
    });
  } catch (error: any) {
    console.error('Error saving invitation RSVP:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi lưu xác nhận tham dự' },
      { status: 500 }
    );
  }
}
