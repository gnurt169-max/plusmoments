'use client';

export interface ImageLoaderParams {
  src: string;
  width: number;
  quality?: number;
}

/**
 * Custom Next.js Image Loader:
 * Routes local /uploads/ images to static responsive WebP variants (-sm.webp & -md.webp)
 * served directly by Nginx with zero Node.js / Sharp CPU overhead and zero loopback timeout.
 */
export default function staticVariantLoader({ src, width }: ImageLoaderParams): string {
  if (!src || typeof src !== 'string') {
    return src || '';
  }

  const clean = src.split('?')[0].split('#')[0].trim();

  // Guard: If flagged as raw/fallback, bypass variant loading and return original src
  if (src.includes('raw=1') || src.includes('fallback=1')) {
    return src;
  }

  // Only transform local uploads ending with .webp
  if (!clean.startsWith('/uploads/') || !clean.endsWith('.webp')) {
    return src;
  }

  // Guard: If the source is already a variant, don't modify
  if (clean.endsWith('-sm.webp') || clean.endsWith('-md.webp')) {
    return src;
  }

  const base = clean.slice(0, -5); // strip '.webp'

  // Variant 1: -sm.webp (640w, q72) for mobile viewports and card thumbnails (<= 750px)
  if (width <= 750) {
    return `${base}-sm.webp`;
  }

  // Variant 2: -md.webp (1440w, q78) for desktop Hero, large cards (<= 1600px)
  if (width <= 1600) {
    return `${base}-md.webp`;
  }

  // Original: 2048px for full-screen zoom and high-DPI displays
  return src;
}

