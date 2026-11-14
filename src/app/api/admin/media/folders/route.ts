import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { cleanupDanglingFolderReferences } from '@/lib/media-cleanup';

export const dynamic = 'force-dynamic';

function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function slugifyFolder(name: string): string {
  if (!name) return 'folder';
  return (
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9_-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60) || 'folder'
  );
}

export async function GET() {
  try {
    const foldersBaseDir = path.join(process.cwd(), 'public', 'uploads', 'folders');
    if (!fs.existsSync(foldersBaseDir)) {
      await fs.promises.mkdir(foldersBaseDir, { recursive: true });
    }

    // Query folders from database with files (excluding variants)
    const dbFolders = await prisma.mediaFolder.findMany({
      include: {
        files: {
          where: {
            AND: [
              { url: { not: { endsWith: '-sm.webp' } } },
              { url: { not: { endsWith: '-md.webp' } } },
            ],
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Scan physical directories on disk to ensure 100% synchronization
    const diskEntries = await fs.promises.readdir(foldersBaseDir, { withFileTypes: true });
    const diskFolderSet = new Set(
      diskEntries.filter((e) => e.isDirectory() && !e.name.startsWith('.')).map((e) => e.name)
    );

    const ALLOWED_IMAGE_EXTENSIONS = new Set(['.webp', '.jpg', '.jpeg', '.png', '.avif', '.heic', '.svg']);

    const folderMap = new Map<string, any>();

    for (const f of dbFolders) {
      const validFiles = f.files.filter(
        (file) =>
          !file.url.endsWith('-sm.webp') &&
          !file.url.endsWith('-md.webp') &&
          !path.basename(file.url).startsWith('.')
      );

      let imageCount = validFiles.length;
      let totalBytes = validFiles.reduce((sum, file) => sum + file.size, 0);
      let coverImage = validFiles.length > 0 ? validFiles[0].url : null;

      // Check physical folder on disk (prioritizing f.slug then f.name)
      const diskName = diskFolderSet.has(f.slug) ? f.slug : diskFolderSet.has(f.name) ? f.name : null;
      if (diskName) {
        diskFolderSet.delete(diskName);
        const folderDiskPath = path.join(foldersBaseDir, diskName);
        try {
          const filesOnDisk = await fs.promises.readdir(folderDiskPath);
          let diskNonVariantCount = 0;
          let diskBytes = 0;
          let firstDiskImage: string | null = null;

          for (const fileName of filesOnDisk) {
            if (
              fileName.startsWith('.') ||
              fileName.startsWith('._') ||
              fileName.endsWith('-sm.webp') ||
              fileName.endsWith('-md.webp')
            ) {
              continue;
            }
            const ext = path.extname(fileName).toLowerCase();
            if (ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
              diskNonVariantCount++;
              try {
                const stat = fs.statSync(path.join(folderDiskPath, fileName));
                diskBytes += stat.size;
                if (!firstDiskImage) {
                  firstDiskImage = `/uploads/folders/${f.slug}/${fileName}`;
                }
              } catch {}
            }
          }

          // Use disk count if DB count was 0 or out of sync
          if (diskNonVariantCount > imageCount || imageCount === 0) {
            imageCount = diskNonVariantCount;
            totalBytes = diskBytes;
            if (firstDiskImage) coverImage = firstDiskImage;
          }
        } catch {}
      }

      folderMap.set(f.slug, {
        id: f.id,
        slug: f.slug,
        name: f.name,
        path: `/uploads/folders/${f.slug}`,
        imageCount,
        totalBytes,
        formattedSize: formatBytes(totalBytes),
        coverImage,
        createdAt: f.createdAt.toISOString(),
        updatedAt: f.updatedAt.toISOString(),
      });
    }

    // Include any physical folders on disk that do not have DB records yet
    for (const diskName of diskFolderSet) {
      const folderDiskPath = path.join(foldersBaseDir, diskName);
      let diskNonVariantCount = 0;
      let diskBytes = 0;
      let firstDiskImage: string | null = null;
      let folderDisplayName = diskName.replace(/[-_]/g, ' ');

      try {
        const metaPath = path.join(folderDiskPath, 'metadata.json');
        if (fs.existsSync(metaPath)) {
          const raw = JSON.parse(await fs.promises.readFile(metaPath, 'utf-8'));
          if (raw.name) folderDisplayName = raw.name;
        }

        const filesOnDisk = await fs.promises.readdir(folderDiskPath);
        for (const fileName of filesOnDisk) {
          if (
            fileName.startsWith('.') ||
            fileName.startsWith('._') ||
            fileName.endsWith('-sm.webp') ||
            fileName.endsWith('-md.webp')
          ) {
            continue;
          }
          const ext = path.extname(fileName).toLowerCase();
          if (ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
            diskNonVariantCount++;
            try {
              const stat = fs.statSync(path.join(folderDiskPath, fileName));
              diskBytes += stat.size;
              if (!firstDiskImage) {
                firstDiskImage = `/uploads/folders/${diskName}/${fileName}`;
              }
            } catch {}
          }
        }
      } catch {}

      folderMap.set(diskName, {
        id: diskName,
        slug: diskName,
        name: folderDisplayName,
        path: `/uploads/folders/${diskName}`,
        imageCount: diskNonVariantCount,
        totalBytes: diskBytes,
        formattedSize: formatBytes(diskBytes),
        coverImage: firstDiskImage,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    const folders = Array.from(folderMap.values());

    return NextResponse.json({
      success: true,
      total: folders.length,
      folders,
    });
  } catch (error: any) {
    console.error('List media folders error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi đọc danh sách thư mục media.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng nhập tên thư mục cần tạo.' },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    let folderSlug = slugifyFolder(trimmedName);

    // Check if folder slug already exists in DB
    const existing = await prisma.mediaFolder.findUnique({
      where: { slug: folderSlug },
    });

    if (existing) {
      folderSlug = `${folderSlug}-${Date.now().toString().slice(-4)}`;
    }

    // Create physical directory on VPS
    const targetDir = path.join(process.cwd(), 'public', 'uploads', 'folders', folderSlug);
    if (!fs.existsSync(targetDir)) {
      await fs.promises.mkdir(targetDir, { recursive: true });
    }

    // Write metadata
    const metaPath = path.join(targetDir, 'metadata.json');
    const metaData = {
      name: trimmedName,
      slug: folderSlug,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await fs.promises.writeFile(metaPath, JSON.stringify(metaData, null, 2), 'utf-8');

    // Create MediaFolder record in database
    const newFolder = await prisma.mediaFolder.create({
      data: {
        name: trimmedName,
        slug: folderSlug,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Đã tạo thư mục "${trimmedName}" thành công!`,
      folder: {
        id: newFolder.id,
        slug: newFolder.slug,
        name: newFolder.name,
        path: `/uploads/folders/${newFolder.slug}`,
        imageCount: 0,
        totalBytes: 0,
        formattedSize: '0 B',
        coverImage: null,
        createdAt: newFolder.createdAt.toISOString(),
        updatedAt: newFolder.updatedAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Create media folder error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi tạo thư mục media.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Chưa đăng nhập quyền quản trị.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng cung cấp danh sách ID hoặc slug thư mục cần xóa.' },
        { status: 400 }
      );
    }

    // Find all matching folders in DB by id or slug
    const foldersToDelete = await prisma.mediaFolder.findMany({
      where: {
        OR: [{ id: { in: ids } }, { slug: { in: ids } }],
      },
    });

    const deletedFolderIds: string[] = [];

    // Delete each folder: remove physical directory and cleanup dangling references
    for (const folder of foldersToDelete) {
      try {
        const folderDir = path.join(process.cwd(), 'public', 'uploads', 'folders', folder.slug);
        if (fs.existsSync(folderDir)) {
          await fs.promises.rm(folderDir, { recursive: true, force: true }).catch(() => {});
        }
      } catch (fsErr) {
        console.warn(`[WARN] Lỗi xóa thư mục vật lý ${folder.slug}:`, fsErr);
      }

      await cleanupDanglingFolderReferences(folder.slug, folder.id);
      deletedFolderIds.push(folder.id);
    }

    // Also handle any IDs that were physical folders on disk but not in DB
    const foldersBaseDir = path.join(process.cwd(), 'public', 'uploads', 'folders');
    for (const rawId of ids) {
      if (typeof rawId === 'string' && !rawId.includes('..') && !rawId.includes('/')) {
        const diskPath = path.join(foldersBaseDir, rawId);
        if (fs.existsSync(diskPath)) {
          await fs.promises.rm(diskPath, { recursive: true, force: true }).catch(() => {});
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Đã xóa thành công ${deletedFolderIds.length} thư mục và toàn bộ dữ liệu bên trong!`,
      deletedCount: deletedFolderIds.length,
      deletedIds: deletedFolderIds,
    });
  } catch (error: any) {
    console.error('Bulk delete media folders error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi xóa hàng loạt thư mục media.' },
      { status: 500 }
    );
  }
}
