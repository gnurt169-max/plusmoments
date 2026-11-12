import { NextResponse } from 'next/server';
import { DELETE as foldersDeleteHandler } from '../route';

export const dynamic = 'force-dynamic';

export async function DELETE(request: Request) {
  return foldersDeleteHandler(request);
}

export async function POST(request: Request) {
  return foldersDeleteHandler(request);
}

