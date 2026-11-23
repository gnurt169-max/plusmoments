import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const singleFile = formData.get('file') as File | null;

    const filesToProcess: File[] = [];
    if (files && files.length > 0) {
      filesToProcess.push(...files);
    } else if (singleFile) {
      filesToProcess.push(singleFile);
    }

    if (filesToProcess.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng chọn ít nhất 1 ảnh để tải lên' },
        { status: 400 }
      );
    }

    if (filesToProcess.length > 12) {
      return NextResponse.json(
        { success: false, error: 'Tối đa 12 ảnh cho mỗi lần tải lên' },
        { status: 400 }
      );
    }

    const targetDir = path.join(process.cwd(), 'public', 'uploads', 'invitations');
    if (!fs.existsSync(targetDir)) {
      await fs.promises.mkdir(targetDir, { recursive: true });
    }

    const uploadedImages = [];

    for (const file of filesToProcess) {
      // Validate file size (15MB max)
      if (file.size > 15 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, error: `Ảnh ${file.name} vượt quá dung lượng cho phép (tối đa 15MB)` },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const rawName = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[^a-zA-Z0-9_-]/g, '-')
        .toLowerCase()
        .slice(0, 30);
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 7);
      const finalFilename = `inv-${rawName}-${timestamp}-${randomSuffix}.webp`;
      const finalFilePath = path.join(targetDir, finalFilename);

      // Rotate via EXIF, limit max dimension to 1600px, convert to WebP quality 85
      const image = sharp(buffer).rotate();
      const metadata = await image.metadata();

      const origW = metadata.width || 1200;
      const origH = metadata.height || 800;

      const pipeline = image
        .resize({
          width: 1600,
          height: 1600,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 85, effort: 4 });

      const finalBuffer = await pipeline.toBuffer();
      await fs.promises.writeFile(finalFilePath, finalBuffer);

      // Read finalized dimensions
      const processedMeta = await sharp(finalBuffer).metadata();
      const finalWidth = processedMeta.width || origW;
      const finalHeight = processedMeta.height || origH;
      const orientation = finalWidth > finalHeight ? 'landscape' : 'portrait';

      const publicUrl = `/uploads/invitations/${finalFilename}`;

      uploadedImages.push({
        id: `img-${timestamp}-${randomSuffix}`,
        url: publicUrl,
        width: finalWidth,
        height: finalHeight,
        orientation,
        caption: '',
      });
    }

    return NextResponse.json({
      success: true,
      images: uploadedImages,
      // If single file uploaded, return top-level image info as well for convenience
      image: uploadedImages[0],
    });
  } catch (error: any) {
    console.error('Error uploading invitation images:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi xử lý tải ảnh thiệp cưới' },
      { status: 500 }
    );
  }
}
