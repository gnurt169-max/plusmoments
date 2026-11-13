import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng chọn tệp logo để tải lên.' },
        { status: 400 }
      );
    }

    const originalName = file.name || 'logo';
    const ext = path.extname(originalName).toLowerCase();
    const mimeType = file.type?.toLowerCase() || '';

    const isSvg = ext === '.svg' || mimeType === 'image/svg+xml';
    const isPng = ext === '.png' || mimeType === 'image/png';

    if (!isSvg && !isPng) {
      return NextResponse.json(
        {
          success: false,
          error: 'Chỉ chấp nhận định dạng .PNG tách nền hoặc vector .SVG cho Logo thương hiệu!',
        },
        { status: 400 }
      );
    }

    const logosDir = path.join(process.cwd(), 'public', 'uploads', 'logos');
    if (!fs.existsSync(logosDir)) {
      await fs.promises.mkdir(logosDir, { recursive: true });
    }

    const cleanBase = path
      .basename(originalName, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .toLowerCase();
    const timestamp = Date.now();
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (isSvg) {
      const finalFilename = `brand-logo-${timestamp}-${cleanBase}.svg`;
      const finalPath = path.join(logosDir, finalFilename);
      await fs.promises.writeFile(finalPath, buffer);

      return NextResponse.json({
        success: true,
        message: 'Tải lên logo SVG thành công!',
        url: `/uploads/logos/${finalFilename}`,
        filename: finalFilename,
        size: buffer.length,
      });
    }

    // For PNG: preserve alpha transparency, lossless compression
    const finalFilename = `brand-logo-${timestamp}-${cleanBase}.png`;
    const finalPath = path.join(logosDir, finalFilename);
    const sharpInstance = sharp(buffer);
    const meta = await sharpInstance.metadata();
    const pngBuffer = await sharpInstance
      .png({ quality: 100, compressionLevel: 9 })
      .toBuffer();
    await fs.promises.writeFile(finalPath, pngBuffer);

    return NextResponse.json({
      success: true,
      message: 'Tải lên logo PNG thành công!',
      url: `/uploads/logos/${finalFilename}`,
      filename: finalFilename,
      size: pngBuffer.length,
      width: meta.width || 0,
      height: meta.height || 0,
    });
  } catch (error: any) {
    console.error('Upload logo route error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi tải lên file logo.' },
      { status: 500 }
    );
  }
}

