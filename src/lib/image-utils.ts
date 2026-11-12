/**
 * Determines whether an image source is an already-optimized WebP image inside /uploads/.
 * Uploads processed by PlusMoments are pre-compressed WebP format. Serving them
 * with unoptimized={true} allows Nginx to serve them directly (< 10ms) without
 * hitting Node.js Sharp re-compression, eliminating VPS CPU spikes and net::ERR_TIMED_OUT.
 */
export function isOptimizedUploadWebp(src?: string | null): boolean {
  if (!src || typeof src !== 'string') return false;
  const clean = src.split('?')[0].split('#')[0].trim();
  return clean.startsWith('/uploads/') && clean.endsWith('.webp');
}

