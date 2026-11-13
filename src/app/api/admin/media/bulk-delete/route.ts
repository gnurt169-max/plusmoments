import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { cleanupDanglingMediaReferences } from '@/lib/media-cleanup';
import { deleteImageWithVariants } from '@/lib/image-variants';
import { getAdminSession } from '@/lib/auth';
import { AdminRole } from '@prisma/client';

export const dynamic = 'force-dynamic';

async function handleBulkDelete(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
    }

    let body: any = {};
    try {
      body = await request.json();
    } catch {}

    const { fileIds, urls } = body;

    const targets: string[] = [];
    if (Array.isArray(fileIds)) targets.push(...fileIds);
    if (Array.isArray(urls)) targets.push(...urls);

    if (targets.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng chọn ít nhất 1 ảnh để xóa.' },
        { status: 400 }
      );
    }

    // Find DB records matching either ID or URL
    const dbFiles = await prisma.mediaFile.findMany({
      where: {
        OR: [{ id: { in: targets } }, { url: { in: targets } }],
      },
    });

    if (session.role === AdminRole.USER) {
      const hasOtherFiles = dbFiles.some(
        (f) => f.uploadedById && f.uploadedById !== session.userId
      );
      if (hasOtherFiles) {
        return NextResponse.json(
          { success: false, error: 'Bạn không có quyền xóa các tệp media của người khác.' },
          { status: 403 }
        );
      }
    }

    const urlsToDelete = new Set<string>();
    const idsToDelete = new Set<string>();

    for (const file of dbFiles) {
      urlsToDelete.add(file.url);
      idsToDelete.add(file.id);
    }

    // Also include any raw URLs sent in targets that start with /uploads/
    for (const target of targets) {
      if (typeof target === 'string' && target.startsWith('/uploads/')) {
        urlsToDelete.add(target);
      }
    }

    let unlinkedCount = 0;
    const publicDir = path.join(process.cwd(), 'public');

    // Physical deletion on disk
    for (const url of Array.from(urlsToDelete)) {
      // Security check: Directory traversal defense
      if (url.includes('..') || !url.startsWith('/uploads/')) {
        continue;
      }

      const relativePath = url.replace(/^\//, '');
      const fullPath = path.join(publicDir, relativePath);

      try {
        if (fs.existsSync(fullPath)) {
          unlinkedCount++;
        }
        await deleteImageWithVariants(fullPath);
      } catch (err) {
        console.warn(`Could not unlink file ${fullPath}:`, err);
      }
    }

    // Atomically clean up all dangling references in Album, Package, BlogPost, Testimonial, Settings
    const allUrls = Array.from(urlsToDelete);
    const cleanupResult = await cleanupDanglingMediaReferences(allUrls);

    const totalProcessed = Math.max(
      unlinkedCount,
      cleanupResult.cleanedUrlsCount || 0,
      targets.length
    );

    return NextResponse.json({
      success: true,
      message: `Đã xóa vĩnh viễn ${totalProcessed} tệp ảnh khỏi hệ thống và dọn sạch các liên kết liên quan!`,
      deletedCount: totalProcessed,
      cleanupDetails: cleanupResult,
    });
  } catch (error: any) {
    console.error('Bulk delete media error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi xóa hàng loạt tệp media.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  return handleBulkDelete(request);
}

export async function DELETE(request: Request) {
  return handleBulkDelete(request);
}


