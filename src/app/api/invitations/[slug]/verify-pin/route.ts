import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug?.trim().toLowerCase();
    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Thiếu định danh slug thiệp cưới' },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const rawPin = body.pin || body.passcode || '';
    const pin = String(rawPin).trim();

    const invitation = await prisma.weddingInvitation.findUnique({
      where: { slug },
      include: {
        rsvps: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy thiệp cưới với đường dẫn này' },
        { status: 404 }
      );
    }

    // Check Admin Session first
    const adminSession = await getAdminSession();
    const isAuthorized =
      Boolean(adminSession) ||
      (pin.length > 0 && pin === invitation.editPasscode);

    if (!isAuthorized) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Mã PIN 6 số không chính xác, vui lòng kiểm tra lại hoặc liên hệ PlusMoments để được cấp lại',
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      valid: true,
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
    console.error('Error verifying invitation PIN:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi hệ thống khi xác thực mã PIN' },
      { status: 500 }
    );
  }
}
