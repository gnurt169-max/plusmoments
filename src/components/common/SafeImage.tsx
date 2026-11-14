'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';

export interface SafeImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  fallbackSrc?: string;
  blurDataURL?: string;
}

/**
 * SafeImage wrapper for Next.js Image:
 * - Renders the real image directly at 100% opacity with zero delay (no stuck opacity-0 / onLoad lag)
 * - Safe fallback to fallbackSrc if original file fails to load
 * - No blurDataURL overlays to avoid distorted corner placeholders
 */
export function SafeImage({
  src,
  fallbackSrc = '/placeholder.jpg',
  onError,
  className = '',
  blurDataURL, // omitted to avoid Next.js blur placeholder overlays
  placeholder, // omitted to avoid Next.js blur placeholder overlays
  ...rest
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  const cleanSrc = src && typeof src === 'string' && src.trim() ? src.trim() : fallbackSrc;
  const finalSrc = hasError ? fallbackSrc : cleanSrc;

  return (
    <Image
      {...rest}
      src={finalSrc}
      onError={(e) => {
        if (!hasError) {
          setHasError(true);
        }
        onError?.(e);
      }}
      className={`opacity-100 select-none ${className}`}
    />
  );
}

export default SafeImage;
