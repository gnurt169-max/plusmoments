import { NextResponse } from 'next/server';
import { exportDatabaseToSeedFiles } from '@/lib/seed-exporter';
import { getAdminSession, assertRole } from '@/lib/auth';
import { AdminRole } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const session = await getAdminSession();
    const authCheck = assertRole(session, [AdminRole.SUPER_ADMIN]);
    if (!authCheck.authorized) return authCheck.response;

    const result = await exportDatabaseToSeedFiles();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Export seed error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Không thể tạo bản snapshot seed mockup.',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}

