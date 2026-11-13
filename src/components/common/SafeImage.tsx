'use client';

import React, { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';

const DEFAULT_WARM_BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI0YzRUZFQSIvPjwvc3ZnPg==';

export interface SafeImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  fallbackSrc?: string;
}

/**
 * SafeImage wrapper for Next.js Image:
 * Automatically falls back to the original image (bypassing -sm.webp/-md.webp static variant loader)
 * if the browser encounters a 404 on the variant file, and provides a warm-beige blur placeholder.
 */
export function SafeImage({
  src,
  fallbackSrc = '/placeholder.jpg',
  placeholder = 'blur',
  blurDataURL = DEFAULT_WARM_BLUR_DATA_URL,
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
  if (errorLevel === 2) {
    finalSrc = fallbackSrc;
  }

  return (
    <Image
      key={errorLevel > 0 ? `raw-${errorLevel}` : 'opt'}
      {...rest}
      src={finalSrc}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      unoptimized={errorLevel > 0 || unoptimized}
      onError={handleError}
    />
  );
}

export default SafeImage;

