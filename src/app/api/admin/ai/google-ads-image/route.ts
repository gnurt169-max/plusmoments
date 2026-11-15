import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';
import { getAdminSession, isSuperAdminTrunglnm } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session || !isSuperAdminTrunglnm(session)) {
      return new NextResponse('Forbidden: Phân khu dành riêng cho Super Admin trunglnm.', {
        status: 403,
      });
    }

    const searchParams = request.nextUrl.searchParams;
    const rawPath = searchParams.get('path');
    const ratio = searchParams.get('ratio') || 'square'; // 'square' | 'landscape' | 'original'

    if (!rawPath) {
      return new NextResponse('Missing path parameter', { status: 400 });
    }

    // 1. Path sanitization and Path Traversal prevention
    const decodedPath = decodeURIComponent(rawPath).trim();
    const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');

    let relativePath = decodedPath;
    if (relativePath.startsWith('/uploads/')) {
      relativePath = relativePath.slice('/uploads/'.length);
    } else if (relativePath.startsWith('uploads/')) {
      relativePath = relativePath.slice('uploads/'.length);
    }

    // Resolve safe file path strictly inside public/uploads
    const safeFilePath = path.resolve(uploadsDir, relativePath);
    if (!safeFilePath.startsWith(uploadsDir)) {
      return new NextResponse('Invalid or forbidden path traversal', { status: 400 });
    }

    // Verify source file exists
    try {
      await fs.access(safeFilePath);
    } catch {
      return new NextResponse('Source image file not found', { status: 404 });
    }

    // 2. Process image with Sharp
    const parsedFile = path.parse(safeFilePath);
    const baseSlug = parsedFile.name.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 50);

    let sharpPipeline = sharp(safeFilePath);
    let outputFilename = `plusmoments-ads-original-${baseSlug}.jpg`;

    if (ratio === 'square') {
      // 1:1 Square (1200x1200px) required by Google Ads
      sharpPipeline = sharpPipeline.resize(1200, 1200, {
        fit: 'cover',
        position: sharp.strategy.attention,
      });
      outputFilename = `plusmoments-ads-square-${baseSlug}.jpg`;
    } else if (ratio === 'landscape') {
      // 1.91:1 Landscape (1200x628px) standard Google Ads
      sharpPipeline = sharpPipeline.resize(1200, 628, {
        fit: 'cover',
        position: sharp.strategy.attention,
      });
      outputFilename = `plusmoments-ads-landscape-${baseSlug}.jpg`;
    }

    const jpegBuffer = await sharpPipeline
      .jpeg({
        quality: 92,
        mozjpeg: true,
      })
      .toBuffer();

    return new NextResponse(new Uint8Array(jpegBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${outputFilename}"`,
        'Content-Length': jpegBuffer.length.toString(),
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('Error generating Google Ads compliant image:', error);
    return new NextResponse(`Error converting image: ${error?.message || 'Internal Error'}`, {
      status: 500,
    });
  }
}
