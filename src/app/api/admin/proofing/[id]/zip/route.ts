import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { resolveFolderPhysicalDir, scanProofingFolderImages } from '@/lib/proofing-fs';
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

interface Props {
  params: { id: string };
}

export async function GET(request: Request, { params }: Props) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Chưa đăng nhập quản trị.' }, { status: 401 });
    }

    const { id } = params;
    const gallery = await prisma.clientGallery.findUnique({
      where: { id },
    });

    if (!gallery) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy dự án.' }, { status: 404 });
    }

    const url = new URL(request.url);
    const filterType = url.searchParams.get('type') || 'selected'; // 'selected' | 'photobook' | 'portrait' | 'all'

    const resolved = resolveFolderPhysicalDir(gallery.folderSlug);
    if (!resolved) {
      return NextResponse.json({ success: false, error: 'Thư mục ảnh không tồn tại.' }, { status: 404 });
    }

    const allPhotos = scanProofingFolderImages(gallery.folderSlug);

    let selections: Record<string, { photobook?: boolean; portrait?: boolean; note?: string }> = {};
    try {
      selections = JSON.parse(gallery.selectionsJson || '{}');
    } catch {
      selections = {};
    }

    // Filter files to archive
    let filesToDownload = allPhotos;
    if (filterType === 'selected') {
      filesToDownload = allPhotos.filter((p) => {
        const s = selections[p.fileName];
        return Boolean(s?.photobook || s?.portrait);
      });
    } else if (filterType === 'photobook') {
      filesToDownload = allPhotos.filter((p) => Boolean(selections[p.fileName]?.photobook));
    } else if (filterType === 'portrait') {
      filesToDownload = allPhotos.filter((p) => Boolean(selections[p.fileName]?.portrait));
    }

    if (filesToDownload.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Không có tệp ảnh nào phù hợp với bộ lọc đã chọn.' },
        { status: 404 }
      );
    }

    const archive = createZipArchive({ zlib: { level: 5 } });
    const passthrough = new PassThrough();
    archive.pipe(passthrough);

    const safeCoupleName = gallery.coupleName.trim().replace(/[\\/:*?"<>|]/g, '_') || 'khach-hang';
    const folderBaseName = `${safeCoupleName}_${filterType}`;

    (async () => {
      try {
        for (const item of filesToDownload) {
          const filePath = path.join(resolved.dir, item.fileName);
          if (fs.existsSync(filePath)) {
            archive.file(filePath, { name: `${folderBaseName}/${item.fileName}` });
          }
        }
      } catch (err) {
        console.error('[PROOFING_ZIP_PROCESS_ERR]', err);
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
  } catch (error: any) {
    console.error('[ADMIN_PROOFING_ZIP_ERROR]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi tạo file zip.' },
      { status: 500 }
    );
  }
}
