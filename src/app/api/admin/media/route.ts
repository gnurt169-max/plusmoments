import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { AdminRole } from '@prisma/client';

import { cleanupDanglingMediaReferences, revalidateMediaRelatedPaths } from '@/lib/media-cleanup';

export const dynamic = 'force-dynamic';

export interface MediaItemMetadata {
  id: string;
  filename: string;
  name: string;
  url: string;
  size: number;
  formattedSize: string;
  format: string;
  width?: number;
  height?: number;
  createdAt: string;
  modifiedAt: string;
  uploadedById?: string | null;
  uploaderName?: string | null;
}

const ALLOWED_IMAGE_EXTENSIONS = new Set(['.webp', '.jpg', '.jpeg', '.png', '.avif', '.heic', '.svg']);

function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

async function getMediaFiles(dirPath: string): Promise<MediaItemMetadata[]> {
  let results: MediaItemMetadata[] = [];

  if (!fs.existsSync(dirPath)) {
    return results;
  }

  const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    // Skip hidden files, system files, macOS AppleDouble shadow files
    if (
      entry.name.startsWith('.') ||
      entry.name.startsWith('._') ||
      entry.name.includes('.DS_Store')
    ) {
      continue;
    }

    if (entry.isDirectory()) {
      const subResults = await getMediaFiles(fullPath);
      results = results.concat(subResults);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
        try {
          const stats = await fs.promises.stat(fullPath);
          if (stats.size > 0) {
            const relativeToPublic = path.relative(path.join(process.cwd(), 'public'), fullPath);
            const publicUrl = `/${relativeToPublic.replace(/\\/g, '/')}`;

            // Clean display name
            const rawName = entry.name.replace(/\.[^/.]+$/, '');
            const displayName = rawName
              .replace(/-\d{10,}-[a-z0-9]+$/, '')
              .replace(/[-_]/g, ' ')
              .trim();

            let width: number | undefined;
            let height: number | undefined;

            try {
              const meta = await sharp(fullPath).metadata();
              width = meta.width;
              height = meta.height;
            } catch {
              // Gracefully handle if sharp cannot read image dimensions
            }

            results.push({
              id: publicUrl,
              filename: entry.name,
              name: displayName || entry.name,
              url: publicUrl,
              size: stats.size,
              formattedSize: formatBytes(stats.size),
              format: ext.replace('.', '').toUpperCase(),
              width,
              height,
              createdAt: stats.birthtime.toISOString(),
              modifiedAt: stats.mtime.toISOString(),
            });
          }
        } catch {
          // Skip if unable to read stats
        }
      }
    }
  }

  return results;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetFolder = searchParams.get('folder');

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const foldersBaseDir = path.join(uploadsDir, 'folders');

    if (!fs.existsSync(uploadsDir)) {
      await fs.promises.mkdir(uploadsDir, { recursive: true });
    }
    if (!fs.existsSync(foldersBaseDir)) {
      await fs.promises.mkdir(foldersBaseDir, { recursive: true });
    }

    const media = await getMediaFiles(uploadsDir);

    // Sort by modifiedAt descending (newest images first)
    media.sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime());

    // Enrich with database ownership info
    try {
      const dbFiles = await prisma.mediaFile.findMany({
        select: {
          url: true,
          uploadedById: true,
          uploadedBy: { select: { fullName: true, username: true } },
        },
      });
      const dbMap = new Map(dbFiles.map((f) => [f.url, f]));
      for (const item of media) {
        const match = dbMap.get(item.url);
        if (match) {
          item.uploadedById = match.uploadedById;
          item.uploaderName = match.uploadedBy?.fullName || match.uploadedBy?.username || null;
        }
      }
    } catch (e) {
      console.warn('[MEDIA_ENRICH_WARN] Could not enrich media with DB owners:', e);
    }

    // Separate Root media (standalone in /uploads/products or /uploads/) vs Folders media
    const rootMedia = media.filter((m) => !m.url.startsWith('/uploads/folders/'));

    // Query DB folders to map IDs
    const dbMediaFolders = await prisma.mediaFolder.findMany({
      select: { id: true, slug: true, name: true },
    });
    const dbFolderMap = new Map(dbMediaFolders.map((df) => [df.slug, df]));

    // Read list of folders
    const folderEntries = await fs.promises.readdir(foldersBaseDir, { withFileTypes: true });
    const folders: any[] = [];

    for (const entry of folderEntries) {
      if (!entry.isDirectory() || entry.name.startsWith('.')) continue;

      const folderSlug = entry.name;
      const folderFullPath = path.join(foldersBaseDir, folderSlug);
      const dbMatch = dbFolderMap.get(folderSlug);

      let folderName = dbMatch?.name || folderSlug.replace(/[-_]/g, ' ');
      let createdAt = new Date().toISOString();
      let driveFolderId: string | undefined;

      const metaPath = path.join(folderFullPath, 'metadata.json');
      if (fs.existsSync(metaPath)) {
        try {
          const rawMeta = await fs.promises.readFile(metaPath, 'utf-8');
          const parsed = JSON.parse(rawMeta);
          if (parsed.name && !dbMatch?.name) folderName = parsed.name;
          if (parsed.createdAt) createdAt = parsed.createdAt;
          if (parsed.driveFolderId) driveFolderId = parsed.driveFolderId;
        } catch {}
      }

      // Filter images belonging to this folder from full media list
      const folderImages = media.filter((m) =>
        m.url.startsWith(`/uploads/folders/${folderSlug}/`)
      );

      const totalFolderBytes = folderImages.reduce((sum, img) => sum + img.size, 0);

      folders.push({
        id: dbMatch?.id || folderSlug,
        slug: folderSlug,
        name: folderName,
        path: `/uploads/folders/${folderSlug}`,
        imageCount: folderImages.length,
        totalBytes: totalFolderBytes,
        formattedSize: formatBytes(totalFolderBytes),
        coverImage: folderImages.length > 0 ? folderImages[0].url : null,
        driveFolderId,
        createdAt,
        modifiedAt:
          folderImages.length > 0 ? folderImages[0].modifiedAt : createdAt,
      });
    }

    // Sort folders by modifiedAt descending
    folders.sort(
      (a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime()
    );

    // If specific folder was queried
    if (targetFolder) {
      const filtered = media.filter((m) =>
        m.url.startsWith(`/uploads/folders/${targetFolder}/`)
      );
      return NextResponse.json({
        success: true,
        folderSlug: targetFolder,
        totalFiles: filtered.length,
        media: filtered,
      });
    }

    // Calculate aggregated stats
    const totalFiles = media.length;
    const totalBytes = media.reduce((acc, curr) => acc + curr.size, 0);
    const formattedTotalSize = formatBytes(totalBytes);

    const formatsCount: Record<string, number> = {};
    for (const item of media) {
      formatsCount[item.format] = (formatsCount[item.format] || 0) + 1;
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalFiles,
        totalBytes,
        formattedTotalSize,
        totalFolders: folders.length,
        formatsCount,
      },
      folders,
      rootMedia,
      media,
    });
  } catch (error: any) {
    console.error('List media error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi đọc danh sách media trên server.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    let targetUrl = searchParams.get('url');
    let targetId = searchParams.get('id');

    if (!targetUrl && !targetId) {
      try {
        const body = await request.json();
        targetUrl = body.url || body.filename;
        targetId = body.id || body.fileId;
      } catch {}
    }

    if (!targetUrl && !targetId) {
      return NextResponse.json(
        { success: false, error: 'Thiếu thông tin tệp ảnh cần xóa (id hoặc url).' },
        { status: 400 }
      );
    }

    // Try finding by ID first if given
    let dbFile = null;
    if (targetId) {
      dbFile = await prisma.mediaFile.findUnique({
        where: { id: targetId },
      });
    }

    if (!dbFile && targetUrl) {
      dbFile = await prisma.mediaFile.findFirst({
        where: { url: targetUrl },
      });
    }

    // Ownership check: USER can only delete their own uploaded files
    if (dbFile && session.role === AdminRole.USER && dbFile.uploadedById && dbFile.uploadedById !== session.userId) {
      return NextResponse.json(
        { success: false, error: 'Bạn không có quyền xóa tệp media của người khác.' },
        { status: 403 }
      );
    }

    const resolvedUrl = dbFile?.url || targetUrl;
    if (!resolvedUrl) {
      return NextResponse.json(
        { success: true, message: 'File không tồn tại hoặc đã được xóa trước đó.' },
        { status: 200 }
      );
    }

    // Physical delete with graceful try/catch
    try {
      const relativePath = resolvedUrl.replace(/^\/+/, '');
      const fullPath = path.join(process.cwd(), 'public', relativePath);
      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath).catch(() => {});
      }
    } catch (fsErr) {
      console.warn('[WARN] Lỗi khi xóa file vật lý:', fsErr);
    }

    // Atomically clean up all dangling references in Album, Package, BlogPost, Testimonial, Settings
    await cleanupDanglingMediaReferences([resolvedUrl]);

    // Delete from MediaFile table
    await prisma.mediaFile.deleteMany({
      where: {
        OR: [
          ...(dbFile ? [{ id: dbFile.id }] : []),
          { url: resolvedUrl },
        ],
      },
    });

    // Revalidate all affected media paths
    revalidateMediaRelatedPaths();

    return NextResponse.json({
      success: true,
      message: 'Đã xóa file ảnh vĩnh viễn khỏi máy chủ VPS và dọn sạch các liên kết liên quan!',
      deletedUrl: resolvedUrl,
    });
  } catch (error: any) {
    console.error('Delete media error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi xóa tệp media.' },
      { status: 500 }
    );
  }
}

