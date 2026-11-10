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
 * GET: Proxy single media asset download with Content-Disposition attachment header
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const targetUrl = searchParams.get('url');
    let filename = searchParams.get('filename') || '';

    if (!targetUrl) {
      return NextResponse.json({ error: 'Thiếu đường dẫn tệp (url)' }, { status: 400 });
    }

    if (!filename) {
      filename = path.basename(targetUrl.split('?')[0]) || 'media-download';
    }

    // 1. Local file in /public
    if (targetUrl.startsWith('/') || targetUrl.startsWith('/uploads/')) {
      const cleanPath = targetUrl.split('?')[0];
      const localPath = path.join(process.cwd(), 'public', cleanPath);

      if (fs.existsSync(localPath)) {
        const stats = fs.statSync(localPath);
        const nodeStream = fs.createReadStream(localPath);
        const webStream = Readable.toWeb(nodeStream);

        return new Response(webStream as any, {
          headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
            'Content-Length': stats.size.toString(),
          },
        });
      }
    }

    // 2. Remote URL (Cloudinary / S3 / External)
    if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
      const response = await fetch(targetUrl);
      if (!response.ok) {
        return NextResponse.json({ error: 'Không thể tải tệp từ máy chủ từ xa' }, { status: 502 });
      }

      const contentType = response.headers.get('content-type') || 'application/octet-stream';
      const arrayBuffer = await response.arrayBuffer();

      return new Response(arrayBuffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        },
      });
    }

    return NextResponse.json({ error: 'Tệp không tồn tại trên hệ thống' }, { status: 404 });
  } catch (error: any) {
    console.error('[API_MEDIA_DOWNLOAD_GET_ERROR]', error);
    return NextResponse.json({ error: error.message || 'Lỗi xử lý tải xuống' }, { status: 500 });
  }
}

/**
 * POST: Batch Download (Streams ZIP file containing all selected media files)
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

    const { ids, asZip } = body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Danh sách ID không hợp lệ' }, { status: 400 });
    }

    // Query matching records from MediaFile table
    const mediaItems = await prisma.mediaFile.findMany({
      where: {
        OR: [{ id: { in: ids } }, { url: { in: ids } }],
      },
    });

    // If caller explicitly asked for JSON single download without zip
    if (mediaItems.length === 1 && asZip === false) {
      const item = mediaItems[0];
      return NextResponse.json({
        downloadUrl: item.url,
        filename: item.name || path.basename(item.url) || 'media-download',
      });
    }

    // Gather all target items to download (including direct local/remote URLs not registered in DB)
    const foundUrls = new Set(mediaItems.map((m) => m.url));
    const foundIds = new Set(mediaItems.map((m) => m.id));

    const allItemsToDownload = [...mediaItems];
    for (const idOrUrl of ids) {
      if (typeof idOrUrl === 'string' && !foundIds.has(idOrUrl) && !foundUrls.has(idOrUrl)) {
        if (idOrUrl.startsWith('/') || idOrUrl.startsWith('http')) {
          allItemsToDownload.push({
            id: idOrUrl,
            name: path.basename(idOrUrl.split('?')[0]),
            url: idOrUrl,
          } as any);
        }
      }
    }

    if (allItemsToDownload.length === 0) {
      return NextResponse.json({ error: 'Không tìm thấy tệp media nào' }, { status: 404 });
    }

    // Initialize ZIP Archive Stream
    const archive = createZipArchive({ zlib: { level: 6 } });
    const passthrough = new PassThrough();

    archive.pipe(passthrough);

    const usedFilenames = new Set<string>();
    const getSafeFilename = (rawName: string) => {
      let baseName = rawName.trim().replace(/[\\/:*?"<>|]/g, '_');
      if (!baseName) baseName = 'media-file';

      if (!usedFilenames.has(baseName)) {
        usedFilenames.add(baseName);
        return baseName;
      }

      const ext = path.extname(baseName);
      const nameWithoutExt = path.basename(baseName, ext);
      let counter = 1;
      while (usedFilenames.has(`${nameWithoutExt}_${counter}${ext}`)) {
        counter++;
      }
      const uniqueName = `${nameWithoutExt}_${counter}${ext}`;
      usedFilenames.add(uniqueName);
      return uniqueName;
    };

    // Append all media files into archive asynchronously
    (async () => {
      try {
        for (const item of allItemsToDownload) {
          const rawName = item.name || path.basename(item.url.split('?')[0]) || `media_${item.id}.webp`;
          const entryFilename = getSafeFilename(rawName);

          // 1. Local file in /public
          if (item.url.startsWith('/') || item.url.startsWith('/uploads/')) {
            const cleanPath = item.url.split('?')[0];
            const localPath = path.join(process.cwd(), 'public', cleanPath);

            if (fs.existsSync(localPath)) {
              archive.file(localPath, { name: entryFilename });
              continue;
            }
          }

          // 2. Remote URL (Cloudinary / S3 / External)
          if (item.url.startsWith('http://') || item.url.startsWith('https://')) {
            try {
              const response = await fetch(item.url);
              if (response.ok) {
                const buffer = Buffer.from(await response.arrayBuffer());
                archive.append(buffer, { name: entryFilename });
                continue;
              }
            } catch (err) {
              console.error(`[MEDIA_DOWNLOAD_FETCH_ERROR] Lỗi tải tệp remote: ${item.url}`, err);
            }
          }
        }
      } catch (err) {
        console.error('[MEDIA_DOWNLOAD_APPEND_ERROR]', err);
      } finally {
        archive.finalize();
      }
    })();

    const webStream = Readable.toWeb(passthrough);
    const dateStr = new Date().toISOString().slice(0, 10);

    return new Response(webStream as any, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="plusmoments-media-${dateStr}.zip"`,
      },
    });
  } catch (error: any) {
    console.error('[API_MEDIA_DOWNLOAD_ERROR]', error);
    return NextResponse.json({ error: error.message || 'Lỗi xử lý tải xuống' }, { status: 500 });
  }
}
