'use client';

import React, { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';

export interface SafeImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  fallbackSrc?: string;
}

/**
 * SafeImage wrapper for Next.js Image:
 * Automatically falls back to the original image (bypassing -sm.webp/-md.webp static variant loader)
 * if the browser encounters a 404 on the variant file.
 * If the original image also fails, it falls back to fallbackSrc (default '/placeholder.jpg').
 */
export function SafeImage({
  src,
  fallbackSrc = '/placeholder.jpg',
  onError,
  unoptimized,
  ...rest
}: SafeImageProps) {
  // errorLevel: 0 = normal (variant loader), 1 = raw original fallback, 2 = final placeholder fallback
  const [errorLevel, setErrorLevel] = useState<0 | 1 | 2>(0);

  // Reset error state if src changes
  useEffect(() => {
    setErrorLevel(0);
  }, [src]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (errorLevel === 0) {
      // Step 1: Variant (-sm / -md) failed -> Fall back to raw original file without loader
      setErrorLevel(1);
    } else if (errorLevel === 1) {
      // Step 2: Raw original also failed -> Fall back to placeholder
      setErrorLevel(2);
    }
    onError?.(e);
  };

  let finalSrc = src || fallbackSrc;
  if (errorLevel === 1) {
    const clean = src ? src.split('#')[0] : '';
    finalSrc = clean ? (clean.includes('?') ? `${clean}&fallback=1` : `${clean}?fallback=1`) : fallbackSrc;
  } else if (errorLevel === 2) {
    finalSrc = fallbackSrc;
  }

  return (
    <Image
      {...rest}
      src={finalSrc}
      unoptimized={errorLevel > 0 || unoptimized}
      onError={handleError}
    />
  );
}

export default SafeImage;

