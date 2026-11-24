import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

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
