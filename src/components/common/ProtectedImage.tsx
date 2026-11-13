'use client';

import React, { useState, useEffect } from 'react';

export interface ProtectedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  sizes?: string;
  wrapperClassName?: string;
  imageClassName?: string;
  priority?: boolean;
  watermark?: boolean;
  watermarkText?: string;
}

/**
 * ProtectedImage: Multi-layer Image Protection Wrapper with Responsive WebP srcSet & Defensive Error Fallback
 * 
 * Layers of defense:
 * 1. Image layer: responsive -sm.webp / -md.webp srcSet with automatic fallback to original on 404,
 *    pointer-events-none, user-select-none, draggable=false
 * 2. Transparent Shield: absolute overlay that absorbs right-clicks and drag events
 * 3. Optional subtle luxury watermark
 * 4. Preserves onClick and interactive functionality for lightboxes & gallery navigation
 */
export function ProtectedImage({
  src,
  alt,
  sizes = '(max-width: 640px) 95vw, (max-width: 1200px) 50vw, 900px',
  wrapperClassName = '',
  imageClassName = '',
  priority = false,
  watermark = false,
  watermarkText = 'PlusMoments Photography',
  onClick,
  ...props
}: ProtectedImageProps) {
  const [fallbackToOriginal, setFallbackToOriginal] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setFallbackToOriginal(false);
    setHasError(false);
  }, [src]);

  // Defensive rendering: If src is null, undefined, empty, or failed to load, suppress rendering cleanly
  if (!src || !src.trim() || hasError) {
    return null;
  }

  const cleanSrc = src.trim();
  const isLocalWebp =
    cleanSrc.startsWith('/uploads/') &&
    cleanSrc.endsWith('.webp') &&
    !cleanSrc.endsWith('-sm.webp') &&
    !cleanSrc.endsWith('-md.webp');
  const base = isLocalWebp ? cleanSrc.slice(0, -5) : '';
  const computedSrcSet =
    isLocalWebp && !fallbackToOriginal
      ? `${base}-sm.webp 540w, ${base}-md.webp 1440w, ${cleanSrc} 2048w`
      : undefined;

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick(e as any);
              }
            }
          : undefined
      }
      className={`relative select-none overflow-hidden group ${
        onClick
          ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880] focus-visible:ring-offset-2'
          : ''
      } ${wrapperClassName}`}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* LAYER 1: Core Image with responsive WebP srcSet, interaction lock & error boundary */}
      <img
        key={fallbackToOriginal ? 'orig' : 'srcset'}
        {...props}
        src={cleanSrc}
        srcSet={computedSrcSet}
        sizes={computedSrcSet ? sizes : undefined}
        alt={alt}
        draggable={false}
        fetchPriority={priority ? 'high' : 'auto'}
        loading={priority ? 'eager' : (props.loading || 'lazy')}
        decoding="async"
        className={`pointer-events-none select-none w-full h-auto object-cover block transition-all duration-500 ${imageClassName}`}
        onContextMenu={(e) => e.preventDefault()}
        onError={(e) => {
          if (isLocalWebp && !fallbackToOriginal) {
            setFallbackToOriginal(true);
            return;
          }
          setHasError(true);
          try {
            (e.target as HTMLElement).style.display = 'none';
          } catch {}
          props.onError?.(e);
        }}
      />

      {/* LAYER 2: Transparent Security Shield */}
      <div
        className="absolute inset-0 z-10 select-none bg-transparent cursor-inherit"
        aria-hidden="true"
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      />

      {/* LAYER 3: Optional Subtle Luxury Watermark */}
      {watermark && (
        <div
          className="absolute bottom-3 right-3 z-15 pointer-events-none select-none px-2.5 py-1 rounded-md bg-black/35 backdrop-blur-xs text-[10px] tracking-widest uppercase font-serif text-white/80 border border-white/10 shadow-sm"
          aria-hidden="true"
        >
          {watermarkText}
        </div>
      )}
    </div>
  );
}

export default ProtectedImage;

