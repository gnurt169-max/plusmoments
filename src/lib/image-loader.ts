'use client';

export interface ImageLoaderParams {
  src: string;
  width?: number;
  quality?: number;
}

/**
 * Image Loader for PlusMoments:
 * Ensures the returned image URL always points to the exact, actual file path on the VPS (/uploads/...).
 * Incorporates width parameter to satisfy Next.js loader signature while serving original file directly.
 */
export default function staticVariantLoader({ src, width }: ImageLoaderParams): string {
  if (!src || typeof src !== 'string') {
    return '';
  }

  const clean = src.split('?')[0].split('#')[0].trim();
  return width ? `${clean}?w=${width}` : clean;
}
