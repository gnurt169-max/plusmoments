import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const RESERVED_SLUGS = new Set([
  'tao-moi',
  'chinh-sua',
  'api',
  'admin',
  'preview',
  'login',
  'logout',
  'null',
  'undefined',
]);

function cleanSlugString(raw: string): string {
  return raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawSlug = searchParams.get('slug') || '';
    const excludeId = searchParams.get('excludeId') || '';

    const cleanSlug = cleanSlugString(rawSlug);

    if (!cleanSlug || cleanSlug.length < 2) {
      return NextResponse.json({
        available: false,
        error: 'Đường dẫn phải có ít nhất 2 ký tự hợp lệ',
        slug: cleanSlug,
      });
    }

    if (RESERVED_SLUGS.has(cleanSlug)) {
      return NextResponse.json({
        available: false,
        error: 'Đường dẫn này thuộc danh sách hệ thống bảo lưu, vui lòng chọn tên khác.',
        slug: cleanSlug,
      });
    }

    const existing = await prisma.weddingInvitation.findUnique({
      where: { slug: cleanSlug },
      select: { id: true },
    });

    if (existing && existing.id !== excludeId) {
      return NextResponse.json({
        available: false,
        error: 'Đường dẫn này đã tồn tại trên hệ thống, vui lòng chọn tên đường dẫn khác.',
        slug: cleanSlug,
      });
    }

    return NextResponse.json({
      available: true,
      slug: cleanSlug,
    });
  } catch (error: any) {
    return NextResponse.json(
      { available: false, error: 'Lỗi kiểm tra đường dẫn: ' + error.message },
      { status: 500 }
    );
  }
}
