import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export type ImageOrientation = 'landscape' | 'portrait' | 'square';

export interface ImageDimensionResult {
  width?: number;
  height?: number;
  orientation?: ImageOrientation;
}

interface CacheEntry {
  mtimeMs: number;
  width?: number;
  height?: number;
  orientation?: ImageOrientation;
}

// In-memory cache keyed by absolute filePath with mtimeMs invalidation (< 5ms lookups)
const dimensionCache = new Map<string, CacheEntry>();

/**
 * Determine orientation based on width and height
 */
export function getOrientation(width?: number, height?: number): ImageOrientation | undefined {
  if (!width || !height || width <= 0 || height <= 0) return undefined;
  if (width > height) return 'landscape';
  if (height > width) return 'portrait';
  return 'square';
}

/**
 * Read image dimensions and orientation with sharp and in-memory cache
 */
export async function getImageDimensions(filePath: string, mtimeMs?: number): Promise<ImageDimensionResult> {
  try {
    let currentMtime = mtimeMs;
    if (currentMtime === undefined) {
      const stat = await fs.promises.stat(filePath);
      currentMtime = stat.mtimeMs;
    }

    const cached = dimensionCache.get(filePath);
    if (cached && cached.mtimeMs === currentMtime) {
      return {
        width: cached.width,
        height: cached.height,
        orientation: cached.orientation,
      };
    }

    const metadata = await sharp(filePath).metadata();
    const width = metadata.width;
    const height = metadata.height;
    const orientation = getOrientation(width, height);

    dimensionCache.set(filePath, {
      mtimeMs: currentMtime,
      width,
      height,
      orientation,
    });

    return { width, height, orientation };
  } catch {
    return {};
  }
}

/**
 * Resolve dimensions from a public URL (e.g. /uploads/folders/album-1/img.webp)
 */
export async function getDimensionsForPublicUrl(publicUrl: string): Promise<ImageDimensionResult> {
  try {
    if (!publicUrl || publicUrl.startsWith('http://') || publicUrl.startsWith('https://')) {
      return {};
    }

    const cleanUrl = publicUrl.startsWith('/') ? publicUrl.slice(1) : publicUrl;
    const fullPath = path.join(process.cwd(), 'public', cleanUrl);

    if (fs.existsSync(fullPath)) {
      return await getImageDimensions(fullPath);
    }
  } catch {
    // Ignore resolution errors
  }
  return {};
}
