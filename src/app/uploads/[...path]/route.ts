import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePathArray = params.path;
    if (!filePathArray || filePathArray.length === 0) {
      return new NextResponse('File Not Found', { status: 404 });
    }

    // Sanitize path against directory traversal
    const safePath = path.normalize(filePathArray.join('/')).replace(/^(\.\.[\/\\])+/, '');
    const fullPath = path.join(process.cwd(), 'public', 'uploads', safePath);

    if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
      return new NextResponse('File Not Found', { status: 404 });
    }

    const fileBuffer = fs.readFileSync(fullPath);

    // Determine mime type
    let contentType = 'image/webp';
    if (safePath.endsWith('.jpg') || safePath.endsWith('.jpeg')) {
      contentType = 'image/jpeg';
    } else if (safePath.endsWith('.png')) {
      contentType = 'image/png';
    } else if (safePath.endsWith('.svg')) {
      contentType = 'image/svg+xml';
    } else if (safePath.endsWith('.avif')) {
      contentType = 'image/avif';
    }

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
}

