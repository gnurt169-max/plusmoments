import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { deleteImageWithVariants } from '@/lib/image-variants';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface LocalMediaItem {
  id: string;
  filename: string;
  name: string;
  url: string;
  size: number;
  createdAt: string;
  modifiedAt: string;
}

const ALLOWED_IMAGE_EXTENSIONS = new Set(['.webp', '.jpg', '.jpeg', '.png', '.avif', '.heic', '.svg']);

function getLocalMediaFiles(dirPath: string, rootDir: string): LocalMediaItem[] {
  let results: LocalMediaItem[] = [];

  if (!fs.existsSync(dirPath)) {
    return results;
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

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
      results = results.concat(getLocalMediaFiles(fullPath, rootDir));
    } else if (entry.isFile()) {
      // Skip auto-generated responsive WebP variants (-sm.webp and -md.webp)
      if (entry.name.endsWith('-sm.webp') || entry.name.endsWith('-md.webp')) {
        continue;
      }

      const ext = path.extname(entry.name).toLowerCase();
      if (ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
        try {
          const stats = fs.statSync(fullPath);
          if (stats.size > 0) {
            const relativeToPublic = path.relative(path.join(process.cwd(), 'public'), fullPath);
            const publicUrl = `/${relativeToPublic.replace(/\\/g, '/')}`;

            // Clean display name
            const rawName = entry.name.replace(/\.[^/.]+$/, '');
            const displayName = rawName
              .replace(/-\d{10,}-[a-z0-9]+$/, '')
              .replace(/[-_]/g, ' ')
              .trim();

            results.push({
              id: publicUrl,
              filename: entry.name,
              name: displayName || entry.name,
              url: publicUrl,
              size: stats.size,
              createdAt: stats.birthtime.toISOString(),
              modifiedAt: stats.mtime.toISOString(),
            });
          }
        } catch {
          // Skip file if unable to read stats
        }
      }
    }
  }

  return results;
}

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const items = getLocalMediaFiles(uploadsDir, uploadsDir);

    // Sort by modifiedAt descending (newest uploaded images first)
    items.sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime());

    return NextResponse.json({
      success: true,
      total: items.length,
      media: items,
    });
  } catch (error: any) {
    console.error('List local media error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi đọc thư viện ảnh cục bộ.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');

    if (!targetUrl) {
      return NextResponse.json(
        { success: false, error: 'Thiếu tham số url cần xóa.' },
        { status: 400 }
      );
    }

    // Security check: Must start with /uploads/ and prevent directory traversal
    if (!targetUrl.startsWith('/uploads/') || targetUrl.includes('..')) {
      return NextResponse.json(
        { success: false, error: 'Đường dẫn ảnh không hợp lệ hoặc vi phạm bảo mật.' },
        { status: 400 }
      );
    }

    const relativePath = targetUrl.replace(/^\//, '');
    const fullPath = path.join(process.cwd(), 'public', relativePath);

    if (fs.existsSync(fullPath)) {
      await deleteImageWithVariants(fullPath);
      return NextResponse.json({
        success: true,
        message: 'Đã xóa ảnh và các biến thể (-sm, -md) khỏi server thành công!',
      });
    } else {
      await deleteImageWithVariants(fullPath);
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy tệp ảnh trên server.' },
        { status: 404 }
      );
    }
  } catch (error: any) {
    console.error('Delete local media error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi xóa tệp ảnh cục bộ.' },
      { status: 500 }
    );
  }
}

