import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getAdminSession, verifyPassword } from '@/lib/auth';
import { syncSuperAdminPasswordToSeeds } from '@/lib/seed-sync';
import { AdminRole } from '@prisma/client';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/profile/change-password
 * Allows the currently logged-in admin user to change their password.
 * When the user is 'trunglnm' (or SUPER_ADMIN), the new password hash is directly
 * synchronized into the static seed/mockup files (prisma/seed.ts, prisma/seed.js, src/lib/seed-exporter.ts).
 */
export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Chưa đăng nhập hoặc phiên làm việc đã hết hạn' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { currentPassword, newPassword } = body;

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Mật khẩu mới phải có độ dài tối thiểu 6 ký tự.' },
        { status: 400 }
      );
    }

    const user = await prisma.adminUser.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy thông tin tài khoản người dùng.' },
        { status: 404 }
      );
    }

    // Verify current password if provided
    if (currentPassword && typeof currentPassword === 'string') {
      const isMatch = await verifyPassword(currentPassword, user.passwordHash);
      if (!isMatch) {
        return NextResponse.json(
          { success: false, error: 'Mật khẩu hiện tại không chính xác. Vui lòng kiểm tra lại.' },
          { status: 400 }
        );
      }
    }

    // Hash the new password with bcrypt salt factor 12
    const newHashedPassword = await bcrypt.hash(newPassword, 12);

    // 1. Update in database
    await prisma.adminUser.update({
      where: { id: user.id },
      data: { passwordHash: newHashedPassword },
    });

    // 2. Direct Sync into Static Seed/Mockup Code for SUPER_ADMIN
    let seedSynced = false;
    if (user.username === 'trunglnm' || user.role === AdminRole.SUPER_ADMIN) {
      seedSynced = await syncSuperAdminPasswordToSeeds(newHashedPassword);
    }

    return NextResponse.json({
      success: true,
      message: seedSynced
        ? 'Đổi mật khẩu thành công! Mật khẩu mới đã được đồng bộ vĩnh viễn vào bộ mã nguồn Seed/Mockup.'
        : 'Đổi mật khẩu tài khoản thành công!',
      seedSynced,
    });
  } catch (error: any) {
    console.error('[CHANGE_PASSWORD_ERROR]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi thay đổi mật khẩu.' },
      { status: 500 }
    );
  }
}

