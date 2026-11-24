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
  aiContextChunk?: any;
  aiStatus?: 'PENDING' | 'RUNNING' | 'DONE' | 'FAILED';
  chunkName?: string;
  chunkStatus?: 'NOT_CHUNKED' | 'PROCESSING' | 'CHUNKED' | 'FAILED';
  chunkTitle?: string | null;
  chunkGroup?: string | null;
  aiContext?: string | null;
  pineconeSynced?: boolean;
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
 * Helper an toàn xác thực và giải quyết folderId hợp lệ tham chiếu đến bảng MediaFolder.
 * Ngăn chặn tuyệt đối lỗi "Foreign key constraint violated: MediaFile_folderId_fkey".
 */
export async function resolveValidFolderId(
  rawFolderId?: string | null,
  folderPathHint?: string | null
): Promise<string | null> {
  const cleanRaw = typeof rawFolderId === 'string' ? rawFolderId.trim() : '';

  // Trích xuất slug thư mục từ đường dẫn nếu có gợi ý (ví dụ: /uploads/folders/tai-nguyen-4/...)
  let hintSlug: string | null = null;
  if (typeof folderPathHint === 'string' && folderPathHint.trim()) {
    const match = folderPathHint.trim().match(/\/uploads\/folders\/([^/]+)/);
    if (match && match[1]) {
      hintSlug = decodeURIComponent(match[1]).trim();
    }
  }

  // 1. Nếu không có rawFolderId và cũng không có hintSlug, hoặc là 'root', hoặc rỗng -> trả về null
  const candidatesToCheck = [cleanRaw, hintSlug].filter(
    (c): c is string => Boolean(c) && c !== 'root' && c !== ''
  );

  if (candidatesToCheck.length === 0) {
    return null;
  }

  for (const candidate of candidatesToCheck) {
    try {
      // 2. Tìm trong bảng MediaFolder theo ID
      const byId = await prisma.mediaFolder.findUnique({
        where: { id: candidate },
        select: { id: true },
      });
      if (byId) return byId.id;

      // 3. Tìm theo slug hoặc name (kể cả slugify)
      const slugified = slugifyFolder(candidate);
      const bySlugOrName = await prisma.mediaFolder.findFirst({
        where: {
          OR: [
            { slug: candidate },
            { name: candidate },
            { slug: slugified },
            { name: slugified },
          ],
        },
        select: { id: true },
      });
      if (bySlugOrName) return bySlugOrName.id;

      // 4. Nếu thư mục vật lý đã tồn tại trên ổ đĩa public/uploads/folders/<candidate>
      const foldersBaseDir = path.join(process.cwd(), 'public', 'uploads', 'folders');
      const candidateDiskDir = path.join(foldersBaseDir, candidate);
      const slugifiedDiskDir = path.join(foldersBaseDir, slugified);

      let matchedDiskDir: string | null = null;
      let targetSlug = candidate;

      if (fs.existsSync(candidateDiskDir) && fs.statSync(candidateDiskDir).isDirectory()) {
        matchedDiskDir = candidateDiskDir;
        targetSlug = candidate;
      } else if (fs.existsSync(slugifiedDiskDir) && fs.statSync(slugifiedDiskDir).isDirectory()) {
        matchedDiskDir = slugifiedDiskDir;
        targetSlug = slugified;
      }

      if (matchedDiskDir) {
        // Tự động tạo bản ghi MediaFolder mới nếu chưa có
        try {
          const created = await prisma.mediaFolder.create({
            data: {
              name: targetSlug.replace(/[-_]/g, ' ') || targetSlug,
              slug: targetSlug,
            },
            select: { id: true },
          });
          return created.id;
        } catch {
          // Phòng trường hợp race-condition đã có bản ghi vừa tạo
          const existing = await prisma.mediaFolder.findFirst({
            where: { OR: [{ slug: targetSlug }, { name: targetSlug }] },
            select: { id: true },
          });
          if (existing) return existing.id;
        }
      }
    } catch (err) {
      console.warn('[RESOLVE_VALID_FOLDER_ID_WARN]:', err);
    }
  }

  // 5. Nếu vẫn không xác định được: an toàn trả về null (lưu ở root)
  return null;
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
  let dbFolder: any = null;
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
    const invitationsBaseDir = path.join(uploadsBaseDir, 'invitations');
    const cleanInvCandidate = candidate.replace(/^invitation-/, '').replace(/^invitations\//, '');
    const dirInInvitations = path.join(invitationsBaseDir, cleanInvCandidate);
    if (fs.existsSync(dirInInvitations) && fs.statSync(dirInInvitations).isDirectory()) {
      physicalDir = dirInInvitations;
      matchedDiskSlug = `invitation-${cleanInvCandidate}`;
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
  const isInvitationFolder = canonicalSlug.startsWith('invitation-') || physicalDir?.includes('/uploads/invitations/');
  let canonicalName = dbFolder?.name || cleanParam.replace(/[-_]/g, ' ') || canonicalSlug;

  if (isInvitationFolder) {
    const cleanInvSlug = canonicalSlug.replace(/^invitation-/, '');
    canonicalName = `Thiệp: ${cleanInvSlug}`;
    try {
      const inv = await prisma.weddingInvitation.findFirst({
        where: { slug: cleanInvSlug },
        select: { groomName: true, brideName: true },
      });
      if (inv) {
        canonicalName = `Thiệp: ${inv.groomName} & ${inv.brideName} (${cleanInvSlug})`;
      }
    } catch {}
  }

  // Nếu thư mục vật lý tồn tại trên đĩa nhưng chưa có trong Database, tự động tạo bản ghi MediaFolder (bỏ qua thư mục thiệp)
  if (!dbFolder && physicalDir && !isInvitationFolder) {
    try {
      dbFolder = await prisma.mediaFolder.create({
        data: {
          name: canonicalName,
          slug: canonicalSlug,
        },
      });
    } catch {
      dbFolder = await prisma.mediaFolder.findFirst({
        where: { OR: [{ slug: canonicalSlug }, { name: canonicalName }] },
      });
    }
  }

  const canonicalId = dbFolder?.id || canonicalSlug;
  const canonicalPath = physicalDir
    ? `/${path.relative(path.join(process.cwd(), 'public'), physicalDir).replace(/\\/g, '/')}`
    : `/uploads/folders/${canonicalSlug}`;

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
              coverImage = `${canonicalPath}/${entry}`;
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

  // Tra cứu trực tiếp từ Database cho toàn bộ MediaFile thuộc thư mục này
  let dbFiles: any[] = [];
  try {
    dbFiles = await prisma.mediaFile.findMany({
      where: {
        OR: [
          ...(dbFolder ? [{ folderId: dbFolder.id }] : []),
          { folderId: canonicalId },
          { url: { startsWith: `/uploads/folders/${canonicalSlug}/` } },
        ],
      },
      include: {
        uploadedBy: {
          select: { id: true, fullName: true, username: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (err) {
    console.warn('[FOLDER_RESOLVER] DB fetch failed, using dbFolder.files:', err);
    dbFiles = dbFolder?.files || [];
  }

  // Kết hợp thêm dbFolder?.files nếu có bản ghi chưa nằm trong dbFiles
  if (dbFolder?.files && dbFolder.files.length > 0) {
    const existingIds = new Set(dbFiles.map((f: any) => f.id));
    for (const f of dbFolder.files) {
      if (!existingIds.has(f.id)) {
        dbFiles.push(f);
      }
    }
  }

  // Bản đồ tra cứu đa khóa từ DB files
  const dbFileMap = new Map<string, any>(dbFiles.map((f: any) => [f.url, f]));
  const dbFileByFilename = new Map<string, any>(
    dbFiles.map((f: any) => [path.basename(f.url), f])
  );
  const dbFileByName = new Map<string, any>(
    dbFiles.map((f: any) => [f.name, f])
  );
  const dbFileById = new Map<string, any>(
    dbFiles.map((f: any) => [f.id, f])
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
            const relativeToPublic = path.relative(path.join(process.cwd(), 'public'), fullPath);
            const publicUrl = `/${relativeToPublic.replace(/\\/g, '/')}`;
            const rawName = entry.name.replace(/\.[^/.]+$/, '');
            const dbMatch =
              dbFileMap.get(publicUrl) ||
              dbFileByFilename.get(entry.name) ||
              dbFileByName.get(entry.name) ||
              dbFileByName.get(rawName);

            let width = dbMatch?.width;
            let height = dbMatch?.height;
            let orientation = dbMatch?.orientation as ImageOrientation | undefined;

            if (!width || !height || !orientation) {
              const dim = await getImageDimensions(fullPath, stats.mtimeMs);
              width = width || dim.width;
              height = height || dim.height;
              orientation = orientation || dim.orientation;
            }

            const displayName =
              dbMatch?.name ||
              rawName.replace(/-\d{10,}-[a-z0-9]+$/, '').replace(/[-_]/g, ' ').trim() ||
              entry.name;

            const chunk = (dbMatch?.aiContextChunk as any) || null;
            const aiStatus: 'PENDING' | 'RUNNING' | 'DONE' | 'FAILED' =
              chunk?.aiStatus ||
              (chunk?.visualDescription || chunk?.mainSubject ? 'DONE' : 'PENDING');
            const chunkName: string | undefined = dbMatch?.chunkTitle || chunk?.chunkName || undefined;
            const isChunked =
              dbMatch?.chunkStatus === 'CHUNKED' ||
              Boolean(dbMatch?.chunkTitle) ||
              Boolean(chunkName) ||
              aiStatus === 'DONE';
            const chunkStatus: 'NOT_CHUNKED' | 'PROCESSING' | 'CHUNKED' | 'FAILED' =
              isChunked
                ? 'CHUNKED'
                : (dbMatch?.chunkStatus as any) ||
                  (aiStatus === 'RUNNING' ? 'PROCESSING' : aiStatus === 'FAILED' ? 'FAILED' : 'NOT_CHUNKED');
            const chunkTitle = dbMatch?.chunkTitle || chunkName || null;
            const aiContext = dbMatch?.aiContext || chunk?.visualDescription || null;
            const pineconeSynced = Boolean(dbMatch?.pineconeSynced);

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
              uploaderName: dbMatch?.uploadedBy?.fullName || dbMatch?.uploadedBy?.username || null,
              aiContextChunk: chunk,
              aiStatus,
              chunkName,
              chunkStatus,
              chunkTitle,
              chunkGroup: dbMatch?.chunkGroup || chunkTitle,
              aiContext,
              pineconeSynced,
            });
          }
        } catch {}
      }
    } catch (err) {
      console.error('[FOLDER_RESOLVER] Error reading physicalDir:', err);
    }
  }

  // Nếu trên đĩa không có file nhưng trong Database có
  if (images.length === 0 && dbFiles.length > 0) {
    for (const file of dbFiles) {
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

      const chunk = (file.aiContextChunk as any) || null;
      const aiStatus: 'PENDING' | 'RUNNING' | 'DONE' | 'FAILED' =
        chunk?.aiStatus ||
        (chunk?.visualDescription || chunk?.mainSubject ? 'DONE' : 'PENDING');
      const chunkName: string | undefined = file.chunkTitle || chunk?.chunkName || undefined;
      const isChunked =
        file.chunkStatus === 'CHUNKED' ||
        Boolean(file.chunkTitle) ||
        Boolean(chunkName) ||
        aiStatus === 'DONE';
      const chunkStatus: 'NOT_CHUNKED' | 'PROCESSING' | 'CHUNKED' | 'FAILED' =
        isChunked
          ? 'CHUNKED'
          : (file.chunkStatus as any) ||
            (aiStatus === 'RUNNING' ? 'PROCESSING' : aiStatus === 'FAILED' ? 'FAILED' : 'NOT_CHUNKED');
      const chunkTitle = file.chunkTitle || chunkName || null;
      const aiContext = file.aiContext || chunk?.visualDescription || null;
      const pineconeSynced = Boolean(file.pineconeSynced);

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
        folderId: dbFolder?.id || canonicalId,
        createdAt: file.createdAt instanceof Date ? file.createdAt.toISOString() : file.createdAt,
        modifiedAt: file.updatedAt instanceof Date ? file.updatedAt.toISOString() : file.updatedAt,
        uploadedById: file.uploadedById || null,
        uploaderName: file.uploadedBy?.fullName || file.uploadedBy?.username || null,
        aiContextChunk: chunk,
        aiStatus,
        chunkName,
        chunkStatus,
        chunkTitle,
        chunkGroup: file.chunkGroup || chunkTitle,
        aiContext,
        pineconeSynced,
      });
    }
  }

  // Sắp xếp ảnh mới nhất lên đầu
  images.sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime());

  return images;
}
