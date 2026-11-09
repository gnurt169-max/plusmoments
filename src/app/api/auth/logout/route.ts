import { NextResponse } from 'next/server';
import { clearAdminSessionCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    clearAdminSessionCookie();
    return NextResponse.json({
      success: true,
      message: 'Đăng xuất tài khoản quản trị thành công!',
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi đăng xuất.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}

