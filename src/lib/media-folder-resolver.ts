import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { getImageDimensions, ImageOrientation, getDimensionsForPublicUrl } from '@/lib/image-dimensions';

export interface FolderImageItem {
  id: string;
  filename: string;
  name: string;
  url: string;
  size: number;
  formattedSize: string;
  format: string;
  width?: number;
  height?: number;
  orientation?: ImageOrientation;
  folderId?: string | null;
  createdAt: string;
  modifiedAt: string;
  uploadedById?: string | null;
  uploaderName?: string | null;
}

export interface ResolvedFolder {
  dbFolder: any | null;
  physicalDir: string | null;
  canonicalId: string;
  canonicalSlug: string;
  canonicalName: string;
  canonicalPath: string;
  imageCount: number;
  totalBytes: number;
  formattedSize: string;
  coverImage: string | null;
  createdAt: string;
  updatedAt: string;
}

const ALLOWED_IMAGE_EXTENSIONS = new Set(['.webp', '.jpg', '.jpeg', '.png', '.avif', '.heic', '.svg']);

export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function slugifyFolder(name: string): string {
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

/**
 * Multi-Key Folder Resolver:
 * Tra cứu thư mục đa tầng qua ID, Slug, Name, hoặc Path trên cả Database và Hệ thống file vật lý.
 */
export async function resolveFolder(identifier: string): Promise<ResolvedFolder | null> {
  const rawParam = decodeURIComponent(identifier || '').trim();
  const cleanParam = rawParam
    .replace(/^\/+/, '')
    .replace(/^uploads\/folders\//, '')
    .replace(/^uploads\//, '')
    .replace(/\/+$/, '');

  if (!cleanParam || cleanParam.includes('..')) {
    return null;
  }

  const slugified = slugifyFolder(cleanParam);
  const prefixedWithTaiNguyen = cleanParam.startsWith('tai-nguyen-') ? cleanParam : `tai-nguyen-${cleanParam}`;
  const withoutTaiNguyen = cleanParam.replace(/^tai-nguyen-/, '');

  // 1. Tìm trong bảng MediaFolder của Database
  let dbFolder = null;
  try {
    dbFolder = await prisma.mediaFolder.findFirst({
      where: {
        OR: [
          { id: cleanParam },
          { slug: cleanParam },
          { name: cleanParam },
          { slug: slugified },
          { name: slugified },
          { slug: prefixedWithTaiNguyen },
          { name: withoutTaiNguyen },
        ],
      },
      include: {
        files: {
          include: {
            uploadedBy: {
              select: { id: true, fullName: true },
            },
          },
          where: {
            AND: [
              { url: { not: { endsWith: '-sm.webp' } } },
              { url: { not: { endsWith: '-md.webp' } } },
            ],
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  } catch (err) {
    console.warn('[FOLDER_RESOLVER] DB lookup failed, falling back to disk:', err);
  }

  // 2. Xác định thư mục vật lý trên ổ đĩa public/uploads/
  const foldersBaseDir = path.join(process.cwd(), 'public', 'uploads', 'folders');
  const uploadsBaseDir = path.join(process.cwd(), 'public', 'uploads');

  const diskCandidates = Array.from(
    new Set([
      dbFolder?.slug,
      dbFolder?.name,
      cleanParam,
      prefixedWithTaiNguyen,
      withoutTaiNguyen,
      slugified,
    ].filter((c): c is string => typeof c === 'string' && c.trim().length > 0 && !c.includes('..')))
  );

  let physicalDir: string | null = null;
  let matchedDiskSlug: string | null = null;

  for (const candidate of diskCandidates) {
    const dirInFolders = path.join(foldersBaseDir, candidate);
    if (fs.existsSync(dirInFolders) && fs.statSync(dirInFolders).isDirectory()) {
      physicalDir = dirInFolders;
      matchedDiskSlug = candidate;
      break;
    }
    const dirInUploads = path.join(uploadsBaseDir, candidate);
    if (fs.existsSync(dirInUploads) && fs.statSync(dirInUploads).isDirectory()) {
      physicalDir = dirInUploads;
      matchedDiskSlug = candidate;
      break;
    }
  }

  // Nếu cả Database lẫn Disk đều không có thư mục này
  if (!dbFolder && !physicalDir) {
    return null;
  }

  // Xác định các định danh chuẩn
  const canonicalSlug = matchedDiskSlug || dbFolder?.slug || slugified || cleanParam;
  const canonicalName = dbFolder?.name || cleanParam.replace(/[-_]/g, ' ') || canonicalSlug;
  const canonicalId = dbFolder?.id || canonicalSlug;
  const canonicalPath = `/uploads/folders/${canonicalSlug}`;

  // Đếm nhanh số ảnh & dung lượng
  let imageCount = 0;
  let totalBytes = 0;
  let coverImage: string | null = null;

  if (physicalDir) {
    try {
      const entries = await fs.promises.readdir(physicalDir);
      for (const entry of entries) {
        if (
          entry.startsWith('.') ||
          entry.startsWith('._') ||
          entry.endsWith('-sm.webp') ||
          entry.endsWith('-md.webp')
        ) {
          continue;
        }
        const ext = path.extname(entry).toLowerCase();
        if (ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
          imageCount++;
          try {
            const stat = fs.statSync(path.join(physicalDir, entry));
            totalBytes += stat.size;
            if (!coverImage) {
              coverImage = `/uploads/folders/${canonicalSlug}/${entry}`;
            }
          } catch {}
        }
      }
    } catch {}
  } else if (dbFolder?.files) {
    imageCount = dbFolder.files.length;
    totalBytes = dbFolder.files.reduce((sum: number, f: any) => sum + (f.size || 0), 0);
    coverImage = dbFolder.files.length > 0 ? dbFolder.files[0].url : null;
  }

  return {
    dbFolder,
    physicalDir,
    canonicalId,
    canonicalSlug,
    canonicalName,
    canonicalPath,
    imageCount,
    totalBytes,
    formattedSize: formatBytes(totalBytes),
    coverImage,
    createdAt: dbFolder?.createdAt?.toISOString?.() || new Date().toISOString(),
    updatedAt: dbFolder?.updatedAt?.toISOString?.() || new Date().toISOString(),
  };
}

/**
 * Đọc toàn bộ ảnh thực tế trong thư mục đã được giải mã
 */
export async function readFolderImages(resolved: ResolvedFolder): Promise<FolderImageItem[]> {
  const { physicalDir, canonicalSlug, canonicalId, dbFolder } = resolved;
  const images: FolderImageItem[] = [];

  // Bản đồ tra cứu từ DB files nếu có
  const dbFileMap = new Map<string, any>((dbFolder?.files || []).map((f: any) => [f.url, f]));
  const dbFileByFilename = new Map<string, any>(
    (dbFolder?.files || []).map((f: any) => [path.basename(f.url), f])
  );

  if (physicalDir && fs.existsSync(physicalDir)) {
    try {
      const entries = await fs.promises.readdir(physicalDir, { withFileTypes: true });

      for (const entry of entries) {
        if (
          entry.isDirectory() ||
          entry.name.startsWith('.') ||
          entry.name.startsWith('._') ||
          entry.name.includes('.DS_Store') ||
          entry.name.endsWith('-sm.webp') ||
          entry.name.endsWith('-md.webp')
        ) {
          continue;
        }

        const ext = path.extname(entry.name).toLowerCase();
        if (!ALLOWED_IMAGE_EXTENSIONS.has(ext)) continue;

        const fullPath = path.join(physicalDir, entry.name);
        try {
          const stats = await fs.promises.stat(fullPath);
          if (stats.size > 0) {
            const publicUrl = `/uploads/folders/${canonicalSlug}/${entry.name}`;
            const dbMatch = dbFileMap.get(publicUrl) || dbFileByFilename.get(entry.name);

            let width = dbMatch?.width;
            let height = dbMatch?.height;
            let orientation = dbMatch?.orientation as ImageOrientation | undefined;

            if (!width || !height || !orientation) {
              const dim = await getImageDimensions(fullPath, stats.mtimeMs);
              width = width || dim.width;
              height = height || dim.height;
              orientation = orientation || dim.orientation;
            }

            const rawName = entry.name.replace(/\.[^/.]+$/, '');
            const displayName =
              dbMatch?.name ||
              rawName.replace(/-\d{10,}-[a-z0-9]+$/, '').replace(/[-_]/g, ' ').trim() ||
              entry.name;

            images.push({
              id: dbMatch?.id || publicUrl,
              filename: entry.name,
              name: displayName,
              url: publicUrl,
              size: stats.size,
              formattedSize: formatBytes(stats.size),
              format: ext.replace('.', '').toUpperCase(),
              width,
              height,
              orientation,
              folderId: dbFolder?.id || canonicalId,
              createdAt: dbMatch?.createdAt instanceof Date ? dbMatch.createdAt.toISOString() : stats.birthtime.toISOString(),
              modifiedAt: stats.mtime.toISOString(),
              uploadedById: dbMatch?.uploadedById || null,
              uploaderName: dbMatch?.uploadedBy?.fullName || null,
            });
          }
        } catch {}
      }
    } catch (err) {
      console.error('[FOLDER_RESOLVER] Error reading physicalDir:', err);
    }
  }

  // Nếu trên đĩa không có file nhưng trong Database có
  if (images.length === 0 && dbFolder?.files && dbFolder.files.length > 0) {
    for (const file of dbFolder.files) {
      if (file.url.endsWith('-sm.webp') || file.url.endsWith('-md.webp')) continue;

      let width = file.width ?? undefined;
      let height = file.height ?? undefined;
      let orientation = file.orientation as ImageOrientation | undefined;

      if (!width || !height || !orientation) {
        const dim = await getDimensionsForPublicUrl(file.url);
        width = width || dim.width;
        height = height || dim.height;
        orientation = orientation || dim.orientation;
      }

      images.push({
        id: file.id,
        filename: path.basename(file.url),
        name: file.name,
        url: file.url,
        size: file.size,
        formattedSize: formatBytes(file.size),
        format: file.format,
        width,
        height,
        orientation,
        folderId: dbFolder.id,
        createdAt: file.createdAt instanceof Date ? file.createdAt.toISOString() : file.createdAt,
        modifiedAt: file.updatedAt instanceof Date ? file.updatedAt.toISOString() : file.updatedAt,
      });
    }
  }

  // Sắp xếp ảnh mới nhất lên đầu
  images.sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime());

  return images;
}
