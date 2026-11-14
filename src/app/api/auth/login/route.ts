import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  verifyPassword,
  createSessionToken,
  setAdminSessionCookie,
} from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.' },
        { status: 400 }
      );
    }

    const cleanUsername = String(username).trim().toLowerCase();

    // 1. Find user in database
    const user = await prisma.adminUser.findUnique({
      where: { username: cleanUsername },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Tên đăng nhập hoặc mật khẩu không chính xác.' },
        { status: 401 }
      );
    }

    // 2. Check if account is active
    if (!user.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tài khoản quản trị này đã bị khóa hoặc tạm ngưng hoạt động. Vui lòng liên hệ SUPER_ADMIN.',
        },
        { status: 403 }
      );
    }

    // 3. Verify password hash
    const isValidPassword = await verifyPassword(String(password), user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Tên đăng nhập hoặc mật khẩu không chính xác.' },
        { status: 401 }
      );
    }

    // 4. Update lastLoginAt timestamp
    await prisma.adminUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // 5. Generate signed JWT session token
    const token = await createSessionToken({
      userId: user.id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    });

    // 6. Set HTTP-only cookie (secure: false on localhost, secure: true on production HTTPS)
    const host = request.headers.get('host') || '';
    const forwardedProto = request.headers.get('x-forwarded-proto') || '';
    const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
    const isHttps = !isLocalhost && (
      forwardedProto === 'https' ||
      (process.env.NODE_ENV === 'production' && forwardedProto !== 'http')
    );

    setAdminSessionCookie(token, isHttps);

    return NextResponse.json({
      success: true,
      message: `Chào mừng ${user.fullName} trở lại hệ thống quản trị PlusMoments!`,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi hệ thống trong quá trình đăng nhập.' },
      { status: 500 }
    );
  }
}

