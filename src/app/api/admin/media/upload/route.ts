import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { generateResponsiveWebPVariants } from '@/lib/image-variants';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { analyzeAndCacheImageChunk, getOrAnalyzeImageChunk } from '@/lib/vision-ai';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const contentType = request.headers.get('content-type') || '';

    // If client triggers analysis on an existing image directly
    if (contentType.includes('application/json')) {
      const body = await request.json();
      const { mediaId, imageUrl } = body;
      if (!imageUrl && !mediaId) {
        return NextResponse.json({ success: false, error: 'Thiếu mediaId hoặc imageUrl' }, { status: 400 });
      }

      const chunk = await getOrAnalyzeImageChunk(imageUrl, mediaId);
      return NextResponse.json({ success: true, chunk });
    }

    // Handle Multipart Upload
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folderSlug = (formData.get('folderSlug') as string)?.trim() || '';

    if (!file) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy file tải lên' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Prepare upload directory
    let targetDir = path.join(process.cwd(), 'public', 'uploads');
    let relativeUrlPrefix = '/uploads';

    if (folderSlug) {
      targetDir = path.join(targetDir, 'folders', folderSlug);
      relativeUrlPrefix = `/uploads/folders/${folderSlug}`;
    }

    if (!fs.existsSync(targetDir)) {
      await fs.promises.mkdir(targetDir, { recursive: true });
    }

    // Convert to webp with sharp or save original
    const rawName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase();
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const finalFilename = `${rawName}-${timestamp}-${randomSuffix}.webp`;
    const finalFilePath = path.join(targetDir, finalFilename);

    let imageWidth: number | undefined;
    let imageHeight: number | undefined;
    let finalBuffer: Buffer = buffer;

    try {
      let image = sharp(buffer);
      const metadata = await image.metadata();
      imageWidth = metadata.width;
      imageHeight = metadata.height;

      // Only resize if image exceeds 2048px (2K max for full-screen Lightbox)
      if (imageWidth && imageWidth > 2048) {
        image = image.resize({
          width: 2048,
          withoutEnlargement: true,
          fit: 'inside',
        });
      }

      finalBuffer = await image
        .webp({ quality: 82, effort: 4 })
        .toBuffer();
    } catch {
      // Fallback if sharp fails on vector or special format
      finalBuffer = buffer;
    }

    await fs.promises.writeFile(finalFilePath, finalBuffer);

    // Generate responsive static variants: -sm.webp (540px) & -md.webp (1440px) immediately alongside base file
    await generateResponsiveWebPVariants(finalBuffer, finalFilePath);

    const publicUrl = `${relativeUrlPrefix}/${finalFilename}`;
    const displayName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

    // Look up folder if folderSlug exists
    let folderRecord = null;
    if (folderSlug) {
      folderRecord = await prisma.mediaFolder.findFirst({
        where: { slug: folderSlug },
      });
    }

    // Save into MediaFile table
    const mediaFile = await prisma.mediaFile.create({
      data: {
        name: displayName,
        url: publicUrl,
        size: finalBuffer.length,
        format: 'WEBP',
        width: imageWidth,
        height: imageHeight,
        folderId: folderRecord?.id || null,
        uploadedById: session.userId,
      },
    });

    // Trigger Vision AI chunk analysis in the background
    analyzeAndCacheImageChunk(mediaFile.id, publicUrl);

    return NextResponse.json({
      success: true,
      file: mediaFile,
      id: mediaFile.id,
      url: publicUrl,
      name: displayName,
    });
  } catch (error: any) {
    console.error('[MEDIA_UPLOAD_ERROR]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi tải file lên máy chủ' },
      { status: 500 }
    );
  }
}

