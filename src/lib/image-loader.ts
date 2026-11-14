'use client';

export interface ImageLoaderParams {
  src: string;
  width?: number;
  quality?: number;
}

/**
 * Image Loader for PlusMoments:
 * Ensures the returned image URL always points to the exact, actual file path on the VPS (/uploads/...).
 * Avoids phantom variant rewrites (-sm.webp, -md.webp) that cause 404s and broken image states.
 */
export default function staticVariantLoader({ src }: ImageLoaderParams): string {
  if (!src || typeof src !== 'string') {
    return '';
  }

  // Always return the exact, clean URL as stored on the VPS
  return src.split('?')[0].split('#')[0].trim();
}
