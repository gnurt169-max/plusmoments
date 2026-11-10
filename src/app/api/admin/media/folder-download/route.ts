import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import * as archiverModule from 'archiver';
import path from 'path';
import fs from 'fs';
import { PassThrough, Readable } from 'stream';

export const dynamic = 'force-dynamic';

function createZipArchive(options?: any) {
  const mod: any = archiverModule;
  if (typeof mod === 'function') return mod('zip', options);
  if (typeof mod.default === 'function') return mod.default('zip', options);
  if (mod.ZipArchive) return new mod.ZipArchive(options);
  throw new Error('Không thể khởi tạo Zip Archive');
}

/**
 * Handles streaming ZIP download for an entire media folder
 */
async function processFolderDownload(folderIdentifier: string) {
  if (!folderIdentifier || typeof folderIdentifier !== 'string') {
    return NextResponse.json({ error: 'Mã hoặc slug thư mục không hợp lệ' }, { status: 400 });
  }

  // 1. Find folder record in database
  const folder = await prisma.mediaFolder.findFirst({
    where: {
      OR: [{ id: folderIdentifier }, { slug: folderIdentifier }],
    },
    include: {
      files: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  const folderSlug = folder?.slug || folderIdentifier;
  const rawFolderName = folder?.name || folderSlug || 'thu-muc-anh';
  const folderBaseName = rawFolderName.trim().replace(/[\\/:*?"<>|]/g, '_') || 'thu-muc-anh';

  // 2. Scan physical files on disk under /public/uploads/folders/[folderSlug]
  const physicalFolderDir = path.join(process.cwd(), 'public', 'uploads', 'folders', folderSlug);
  const physicalFiles: string[] = [];

  if (fs.existsSync(physicalFolderDir)) {
    try {
      const dirEntries = fs.readdirSync(physicalFolderDir, { withFileTypes: true });
      for (const entry of dirEntries) {
        if (entry.isFile() && !entry.name.startsWith('.')) {
          physicalFiles.push(entry.name);
        }
      }
    } catch (err) {
      console.warn('[FOLDER_DOWNLOAD_DIR_READ_WARN]', err);
    }
  }

  // Gather list of files from DB + disk
  const filesToArchive: Array<{ name: string; localPath?: string; remoteUrl?: string }> = [];
  const addedRelativePaths = new Set<string>();

  // Add DB files
  if (folder?.files && folder.files.length > 0) {
    for (const f of folder.files) {
      const cleanUrl = (f.url || '').split('?')[0];
      if (cleanUrl.startsWith('/') || cleanUrl.startsWith('/uploads/')) {
        const localPath = path.join(process.cwd(), 'public', cleanUrl);
        if (fs.existsSync(localPath)) {
          const fileName = f.name || path.basename(cleanUrl);
          filesToArchive.push({ name: fileName, localPath });
          addedRelativePaths.add(localPath);
        }
      } else if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
        filesToArchive.push({ name: f.name || path.basename(cleanUrl), remoteUrl: cleanUrl });
      }
    }
  }

  // Add physical disk files not registered in DB
  if (physicalFiles.length > 0) {
    for (const fileName of physicalFiles) {
      const fullPath = path.join(physicalFolderDir, fileName);
      if (!addedRelativePaths.has(fullPath)) {
        filesToArchive.push({ name: fileName, localPath: fullPath });
        addedRelativePaths.add(fullPath);
      }
    }
  }

  if (filesToArchive.length === 0) {
    return NextResponse.json(
      { error: `Thư mục "${rawFolderName}" hiện chưa có tệp ảnh nào để tải xuống.` },
      { status: 404 }
    );
  }

  // 3. Initialize streaming archive
  const archive = createZipArchive({ zlib: { level: 6 } });
  const passthrough = new PassThrough();

  archive.pipe(passthrough);

  const usedEntryNames = new Set<string>();
  const getSafeEntryPath = (rawFileName: string) => {
    let cleanName = rawFileName.trim().replace(/[\\/:*?"<>|]/g, '_');
    if (!cleanName) cleanName = 'media.webp';

    const ext = path.extname(cleanName);
    const base = path.basename(cleanName, ext);

    let candidate = cleanName;
    let counter = 1;
    while (usedEntryNames.has(candidate)) {
      candidate = `${base}_${counter}${ext}`;
      counter++;
    }
    usedEntryNames.add(candidate);
    // Nest all files inside a root folder matching folderBaseName when unzipped
    return `${folderBaseName}/${candidate}`;
  };

  // Asynchronously append all files
  (async () => {
    try {
      for (const item of filesToArchive) {
        const entryPath = getSafeEntryPath(item.name);

        if (item.localPath && fs.existsSync(item.localPath)) {
          archive.file(item.localPath, { name: entryPath });
          continue;
        }

        if (item.remoteUrl) {
          try {
            const resp = await fetch(item.remoteUrl);
            if (resp.ok) {
              const buffer = Buffer.from(await resp.arrayBuffer());
              archive.append(buffer, { name: entryPath });
            }
          } catch (err) {
            console.error(`[FOLDER_DOWNLOAD_REMOTE_ERR] ${item.remoteUrl}`, err);
          }
        }
      }
    } catch (err) {
      console.error('[FOLDER_DOWNLOAD_PROCESS_ERR]', err);
    } finally {
      archive.finalize();
    }
  })();

  const webStream = Readable.toWeb(passthrough);

  return new Response(webStream as any, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(folderBaseName)}.zip"`,
    },
  });
}

/**
 * GET /api/admin/media/folder-download?folderId=...&slug=...
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get('folderId') || searchParams.get('slug') || searchParams.get('id');

    if (!folderId) {
      return NextResponse.json({ error: 'Thiếu thông tin thư mục (folderId hoặc slug)' }, { status: 400 });
    }

    return await processFolderDownload(folderId);
  } catch (error: any) {
    console.error('[API_FOLDER_DOWNLOAD_GET_ERROR]', error);
    return NextResponse.json({ error: error.message || 'Lỗi khi chuẩn bị tệp nén thư mục' }, { status: 500 });
  }
}

/**
 * POST /api/admin/media/folder-download { folderId: "..." }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Dữ liệu request không hợp lệ' }, { status: 400 });
    }

    const folderId = body.folderId || body.slug || body.id;
    if (!folderId) {
      return NextResponse.json({ error: 'Thiếu thông tin thư mục' }, { status: 400 });
    }

    return await processFolderDownload(folderId);
  } catch (error: any) {
    console.error('[API_FOLDER_DOWNLOAD_POST_ERROR]', error);
    return NextResponse.json({ error: error.message || 'Lỗi khi chuẩn bị tệp nén thư mục' }, { status: 500 });
  }
}
