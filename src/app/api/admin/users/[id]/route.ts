import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { AdminRole } from '@prisma/client';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: {
    id: string;
  };
}

/**
 * PUT /api/admin/users/[id]
 * Updates admin user info or status.
 */
export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const { id } = params;
    const targetUser = await prisma.adminUser.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Không tìm thấy tài khoản quản trị' }, { status: 404 });
    }

    // STEALTH & SUPREME PROTECTION:
    // If target is 'trunglnm' and caller is not 'trunglnm', pretend it doesn't exist or forbid
    if (targetUser.username === 'trunglnm' && session.username !== 'trunglnm') {
      return NextResponse.json({ error: 'Bạn không có quyền chỉnh sửa tài khoản này' }, { status: 403 });
    }

    // If caller is ADMIN, they can only manage USER accounts
    if (session.role === AdminRole.ADMIN) {
      if (targetUser.role !== AdminRole.USER && session.userId !== targetUser.id) {
        return NextResponse.json(
          { error: 'Bạn chỉ có quyền quản lý tài khoản người dùng thông thường (USER).' },
          { status: 403 }
        );
      }
    } else if (session.role !== AdminRole.SUPER_ADMIN && session.userId !== targetUser.id) {
      return NextResponse.json({ error: 'Bạn không có quyền chỉnh sửa tài khoản khác' }, { status: 403 });
    }

    const body = await request.json();
    const { fullName, email, role, isActive } = body;

    const updateData: any = {};

    if (typeof fullName === 'string' && fullName.trim()) {
      updateData.fullName = fullName.trim();
    }

    if (email !== undefined) {
      updateData.email = typeof email === 'string' && email.trim() ? email.trim() : null;
    }

    // Role modification check
    if (role && role !== targetUser.role) {
      if (session.role !== AdminRole.SUPER_ADMIN) {
        return NextResponse.json({ error: 'Chỉ Super Admin mới có quyền phân quyền vai trò' }, { status: 403 });
      }
      // Never downgrade trunglnm
      if (targetUser.username === 'trunglnm' && role !== AdminRole.SUPER_ADMIN) {
        return NextResponse.json({ error: 'Không thể hạ cấp vai trò của tài khoản Super Admin mặc định' }, { status: 403 });
      }
      updateData.role = role;
    }

    // Active status modification check
    if (isActive !== undefined) {
      if (session.role !== AdminRole.SUPER_ADMIN && session.role !== AdminRole.ADMIN) {
        return NextResponse.json({ error: 'Bạn không có quyền thay đổi trạng thái hoạt động' }, { status: 403 });
      }
      // Never deactivate trunglnm
      if (targetUser.username === 'trunglnm' && isActive === false) {
        return NextResponse.json({ error: 'Không thể khóa tài khoản Super Admin mặc định' }, { status: 403 });
      }
      updateData.isActive = Boolean(isActive);
    }

    const updatedUser = await prisma.adminUser.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error('[PUT_ADMIN_USER_ERROR]', error);
    return NextResponse.json({ error: 'Lỗi cập nhật tài khoản: ' + error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Deletes an admin user.
 */
export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    // RBAC: SUPER_ADMIN and ADMIN can delete accounts
    if (session.role !== AdminRole.SUPER_ADMIN && session.role !== AdminRole.ADMIN) {
      return NextResponse.json({ error: 'Bạn không có quyền xóa tài khoản' }, { status: 403 });
    }

    const { id } = params;
    const targetUser = await prisma.adminUser.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Không tìm thấy tài khoản quản trị' }, { status: 404 });
    }

    // Protection for trunglnm
    if (targetUser.username === 'trunglnm') {
      return NextResponse.json({ error: 'Tài khoản Super Admin tối cao không thể bị xóa' }, { status: 403 });
    }

    // Scoped restriction for ADMIN: can only delete role USER
    if (session.role === AdminRole.ADMIN) {
      if (targetUser.role !== AdminRole.USER) {
        return NextResponse.json(
          { error: 'Bạn chỉ có quyền quản lý tài khoản người dùng thông thường (USER).' },
          { status: 403 }
        );
      }
    }

    // Cannot delete self
    if (targetUser.id === session.userId) {
      return NextResponse.json({ error: 'Bạn không thể tự xóa tài khoản đang đăng nhập' }, { status: 400 });
    }

    await prisma.adminUser.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Đã xóa tài khoản thành công' });
  } catch (error: any) {
    console.error('[DELETE_ADMIN_USER_ERROR]', error);
    return NextResponse.json({ error: 'Lỗi xóa tài khoản: ' + error.message }, { status: 500 });
  }
}

