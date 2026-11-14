import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getProofingCookieName, verifyProofingToken } from '@/lib/proofing-auth';
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
  params: { code: string };
}

export async function GET(request: Request, { params }: Props) {
  try {
    const { code } = params;
    const gallery = await prisma.clientGallery.findUnique({
      where: { code: code.toLowerCase().trim() },
    });

    if (!gallery) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy bộ sưu tập.' }, { status: 404 });
    }

    const cookieStore = cookies();
    const cookieName = getProofingCookieName(gallery.code);
    const clientToken = cookieStore.get(cookieName)?.value;

    if (!verifyProofingToken(gallery.code, gallery.pinCode, clientToken)) {
      return NextResponse.json({ success: false, error: 'Phiên đăng nhập hết hạn hoặc chưa nhập mã PIN.' }, { status: 401 });
    }

    if (!gallery.allowDownload) {
      return NextResponse.json(
        { success: false, error: 'Tính năng tải ảnh đã bị vô hiệu hóa cho bộ sưu tập này. Vui lòng liên hệ Studio.' },
        { status: 403 }
      );
    }

    const resolved = resolveFolderPhysicalDir(gallery.folderSlug);
    if (!resolved) {
      return NextResponse.json({ success: false, error: 'Thư mục ảnh không tồn tại trên hệ thống.' }, { status: 404 });
    }

    const url = new URL(request.url);
    const singleFileName = url.searchParams.get('file');

    // 1. Single File Download
    if (singleFileName) {
      // Prevent directory traversal
      const safeName = path.basename(singleFileName);
      const filePath = path.join(resolved.dir, safeName);

      if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        return NextResponse.json({ success: false, error: 'Không tìm thấy tệp ảnh yêu cầu.' }, { status: 404 });
      }

      const fileBuffer = fs.readFileSync(filePath);
      const ext = path.extname(safeName).toLowerCase();
      let contentType = 'image/webp';
      if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
      else if (ext === '.png') contentType = 'image/png';

      return new Response(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${encodeURIComponent(safeName)}"`,
          'Content-Length': fileBuffer.length.toString(),
        },
      });
    }

    // 2. ZIP Archive Download
    const downloadType = url.searchParams.get('type') || 'selected'; // 'selected' | 'all'
    const allPhotos = scanProofingFolderImages(gallery.folderSlug);

    let selections: Record<string, { photobook?: boolean; portrait?: boolean; note?: string }> = {};
    try {
      selections = JSON.parse(gallery.selectionsJson || '{}');
    } catch {
      selections = {};
    }

    let filesToDownload = allPhotos;
    if (downloadType === 'selected') {
      filesToDownload = allPhotos.filter((p) => {
        const s = selections[p.fileName];
        return Boolean(s?.photobook || s?.portrait);
      });
    }

    if (filesToDownload.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Không có ảnh nào trong danh sách tải xuống.' },
        { status: 404 }
      );
    }

    const archive = createZipArchive({ zlib: { level: 5 } });
    const passthrough = new PassThrough();
    archive.pipe(passthrough);

    const safeCoupleName = gallery.coupleName.trim().replace(/[\\/:*?"<>|]/g, '_') || 'anh_cuoi';
    const zipName = `${safeCoupleName}_${downloadType === 'selected' ? 'anh_da_chon' : 'toan_bo_anh'}`;

    (async () => {
      try {
        for (const item of filesToDownload) {
          const filePath = path.join(resolved.dir, item.fileName);
          if (fs.existsSync(filePath)) {
            archive.file(filePath, { name: `${zipName}/${item.fileName}` });
          }
        }
      } catch (err) {
        console.error('[PROOFING_CLIENT_ZIP_ERR]', err);
      } finally {
        archive.finalize();
      }
    })();

    const webStream = Readable.toWeb(passthrough);

    return new Response(webStream as any, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(zipName)}.zip"`,
      },
    });
  } catch (error: any) {
    console.error('[PROOFING_DOWNLOAD_ERROR]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi tải ảnh.' },
      { status: 500 }
    );
  }
}
