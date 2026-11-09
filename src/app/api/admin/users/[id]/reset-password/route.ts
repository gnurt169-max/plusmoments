import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession, hashPassword } from '@/lib/auth';
import { AdminRole } from '@prisma/client';
import { syncSuperAdminPasswordToSeeds } from '@/lib/seed-sync';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: {
    id: string;
  };
}

/**
 * POST /api/admin/users/[id]/reset-password
 * SUPER_ADMIN privilege to set a new password for any admin account.
 */
export async function POST(request: Request, { params }: RouteContext) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    // RBAC: SUPER_ADMIN and ADMIN can reset passwords
    if (session.role !== AdminRole.SUPER_ADMIN && session.role !== AdminRole.ADMIN) {
      return NextResponse.json({ error: 'Bạn không có quyền đặt lại mật khẩu' }, { status: 403 });
    }

    const { id } = params;
    const targetUser = await prisma.adminUser.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Không tìm thấy tài khoản quản trị' }, { status: 404 });
    }

    // Scoped restriction for ADMIN: can only reset password for USER
    if (session.role === AdminRole.ADMIN) {
      if (targetUser.role !== AdminRole.USER) {
        return NextResponse.json(
          { error: 'Bạn chỉ có quyền đặt lại mật khẩu cho tài khoản người dùng thông thường (USER).' },
          { status: 403 }
        );
      }
    }

    // STEALTH & SUPREME PROTECTION: If target is 'trunglnm' and caller is not 'trunglnm', forbid!
    if (targetUser.username === 'trunglnm' && session.username !== 'trunglnm') {
      return NextResponse.json({ error: 'Bạn không có quyền thay đổi mật khẩu của tài khoản này' }, { status: 403 });
    }

    const body = await request.json();
    const { newPassword } = body;

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json({ error: 'Mật khẩu mới phải có độ dài tối thiểu 6 ký tự' }, { status: 400 });
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.adminUser.update({
      where: { id },
      data: {
        passwordHash,
      },
    });

    // If resetting the SUPER_ADMIN (trunglnm), persist directly into static seed/mockup files!
    if (targetUser.username === 'trunglnm' || targetUser.role === AdminRole.SUPER_ADMIN) {
      try {
        await syncSuperAdminPasswordToSeeds(passwordHash);
      } catch (syncErr) {
        console.error('[SEED_SYNC_WARNING] Failed to sync new password hash to static seed files:', syncErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Đã đặt lại mật khẩu mới cho tài khoản "${targetUser.username}" thành công.`,
    });
  } catch (error: any) {
    console.error('[RESET_PASSWORD_ERROR]', error);
    return NextResponse.json({ error: 'Lỗi đặt lại mật khẩu: ' + error.message }, { status: 500 });
  }
}

