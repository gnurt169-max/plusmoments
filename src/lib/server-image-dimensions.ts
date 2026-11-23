import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

export interface ResolvedMediaDimension {
  width: number;
  height: number;
  orientation: 'landscape' | 'portrait';
}

// In-memory server cache to avoid repeated file system / sharp calls
const dimensionCache = new Map<string, ResolvedMediaDimension>();

/**
 * Resolves the real width, height, and orientation of an image.
 * 1. Checks memory cache for sub-millisecond retrieval.
 * 2. If local upload (/uploads/...), probes physical file with sharp to get exact pixels.
 * 3. Falls back to provided DB dimensions or studio defaults.
 */
export async function resolveImageDimension(
  url?: string | null,
  fallbackWidth?: number | null,
  fallbackHeight?: number | null
): Promise<ResolvedMediaDimension> {
  const defaultW = fallbackWidth && fallbackWidth > 0 ? fallbackWidth : 1920;
  const defaultH = fallbackHeight && fallbackHeight > 0 ? fallbackHeight : 1280;

  if (!url || !url.trim()) {
    return {
      width: defaultW,
      height: defaultH,
      orientation: defaultH > defaultW ? 'portrait' : 'landscape',
    };
  }

  const cleanUrl = url.trim().split('?')[0];

  if (dimensionCache.has(cleanUrl)) {
    return dimensionCache.get(cleanUrl)!;
  }

  // Check local file in public/ directory
  if (cleanUrl.startsWith('/')) {
    const localPath = path.join(process.cwd(), 'public', cleanUrl.replace(/^\//, ''));
    if (fs.existsSync(localPath)) {
      try {
        const metadata = await sharp(localPath).metadata();
        if (metadata.width && metadata.height) {
          const orientation: 'landscape' | 'portrait' =
            metadata.height > metadata.width ? 'portrait' : 'landscape';
          const resolved: ResolvedMediaDimension = {
            width: metadata.width,
            height: metadata.height,
            orientation,
          };
          dimensionCache.set(cleanUrl, resolved);
          return resolved;
        }
      } catch {
        // Fallback to provided DB values
      }
    }
  }

  const orientation: 'landscape' | 'portrait' =
    defaultH > defaultW ? 'portrait' : 'landscape';
  const resolved: ResolvedMediaDimension = {
    width: defaultW,
    height: defaultH,
    orientation,
  };
  dimensionCache.set(cleanUrl, resolved);
  return resolved;
}

/**
 * Resolves real dimensions for a list of media records.
 */
export async function resolveMediaListDimensions<
  T extends { url: string; width?: number | null; height?: number | null }
>(
  items: T[]
): Promise<Array<T & { width: number; height: number; orientation: 'landscape' | 'portrait' }>> {
  if (!Array.isArray(items)) return [];
  return Promise.all(
    items.map(async (item) => {
      const dim = await resolveImageDimension(item.url, item.width, item.height);
      return {
        ...item,
        width: dim.width,
        height: dim.height,
        orientation: dim.orientation,
      };
    })
  );
}
