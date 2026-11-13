import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { DELETE as foldersDeleteHandler } from '../route';

export const dynamic = 'force-dynamic';

export async function DELETE(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  return foldersDeleteHandler(request);
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  return foldersDeleteHandler(request);
}

