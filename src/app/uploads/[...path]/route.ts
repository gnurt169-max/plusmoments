import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  try {
    const rawSegments = params.path;
    if (!rawSegments || rawSegments.length === 0) {
      return new NextResponse('File Not Found', { status: 404 });
    }

    // 1. Safely decode every segment (handles URL-encoded Vietnamese accents, spaces, special chars)
    const decodedSegments = rawSegments.map((segment) => {
      try {
        return decodeURIComponent(segment);
      } catch {
        return segment;
      }
    });

    // 2. Sanitize against directory traversal attacks
    const rawRelativePath = decodedSegments.join('/');
    const safePath = path
      .normalize(rawRelativePath)
      .replace(/^(\.\.[\/\\])+/, '')
      .replace(/^[\/\\]+/, '');

    if (safePath.includes('..')) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // 3. Resolve possible base upload directories across localhost, PM2 production, and standalone modes
    const candidateBaseDirs = [
      path.join(process.cwd(), 'public', 'uploads'),
      path.resolve(process.cwd(), 'public', 'uploads'),
      path.join(process.cwd(), 'uploads'),
      path.join(process.cwd(), '..', 'public', 'uploads'),
      path.join(process.cwd(), '..', 'uploads'),
      ...(process.env.UPLOADS_DIR ? [process.env.UPLOADS_DIR] : []),
    ];

    const findExistingFile = (relPath: string): string | null => {
      for (const baseDir of candidateBaseDirs) {
        try {
          const full = path.join(baseDir, relPath);
          if (fs.existsSync(full) && fs.statSync(full).isFile()) {
            return full;
          }
        } catch {
          // ignore directory access errors and continue checking next candidate
        }
      }
      return null;
    };

    // 4. Try exact match first
    let resolvedFile = findExistingFile(safePath);

    // 5. Fallback 1: If client requested a variant (-sm.webp or -md.webp) that does not exist on disk,
    // automatically fall back to the original file (.webp, .jpg, .jpeg, .png)
    if (!resolvedFile && (safePath.endsWith('-sm.webp') || safePath.endsWith('-md.webp'))) {
      const baseWithoutVariant = safePath.replace(/-(sm|md)\.webp$/, '');
      const candidateExtensions = ['.webp', '.jpg', '.jpeg', '.png', '.avif', '.svg'];
      for (const ext of candidateExtensions) {
        resolvedFile = findExistingFile(`${baseWithoutVariant}${ext}`);
        if (resolvedFile) break;
      }
    }

    // 6. Fallback 2: Check raw un-decoded segment path (in case disk file literally contains %20 or encoded symbols)
    if (!resolvedFile) {
      const unescapedPath = path
        .normalize(rawSegments.join('/'))
        .replace(/^(\.\.[\/\\])+/, '')
        .replace(/^[\/\\]+/, '');
      resolvedFile = findExistingFile(unescapedPath);
    }

    // 7. Fallback 3: Extension cross-check (if client requested .webp but disk has .jpg / .jpeg / .png or vice-versa)
    if (!resolvedFile) {
      const ext = path.extname(safePath);
      if (ext) {
        const baseWithoutExt = safePath.slice(0, -ext.length);
        const alternateExts = ['.webp', '.jpg', '.jpeg', '.png', '.avif'];
        for (const altExt of alternateExts) {
          if (altExt.toLowerCase() !== ext.toLowerCase()) {
            resolvedFile = findExistingFile(`${baseWithoutExt}${altExt}`);
            if (resolvedFile) break;
          }
        }
      }
    }

    if (!resolvedFile) {
      return new NextResponse('File Not Found', { status: 404 });
    }

    // 8. Determine proper MIME Content-Type
    const lowerFile = resolvedFile.toLowerCase();
    let contentType = 'image/webp';
    if (lowerFile.endsWith('.jpg') || lowerFile.endsWith('.jpeg')) {
      contentType = 'image/jpeg';
    } else if (lowerFile.endsWith('.png')) {
      contentType = 'image/png';
    } else if (lowerFile.endsWith('.svg')) {
      contentType = 'image/svg+xml';
    } else if (lowerFile.endsWith('.avif')) {
      contentType = 'image/avif';
    } else if (lowerFile.endsWith('.gif')) {
      contentType = 'image/gif';
    }

    const fileBuffer = fs.readFileSync(resolvedFile);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Image-Source': 'plusmoments-uploads-service',
      },
    });
  } catch (error) {
    console.error('[UPLOADS_ROUTE_ERROR]:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
