'use client';

import React, { useState } from 'react';

export interface ProtectedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  sizes?: string;
  blurDataUrl?: string | null;
  wrapperClassName?: string;
  imageClassName?: string;
  priority?: boolean;
  watermark?: boolean;
  watermarkText?: string;
}

/**
 * ProtectedImage: Multi-layer Image Protection Wrapper for PlusMoments
 * - Renders the real image directly at 100% opacity with zero delay (no stuck opacity-0 / onLoad lag)
 * - Safe error fallback without hiding images or rendering misplaced blur overlays
 * - Clean security shield overlay & optional subtle studio watermark
 */
export function ProtectedImage({
  src,
  alt,
  sizes,
  blurDataUrl, // kept for interface backward compatibility
  wrapperClassName = '',
  imageClassName = '',
  priority = false,
  watermark = false,
  watermarkText = 'PlusMoments Photography',
  onClick,
  ...props
}: ProtectedImageProps) {
  const [hasError, setHasError] = useState(false);

  // If no source is provided, return null
  if (!src || !src.trim()) {
    return null;
  }

  const cleanSrc = src.trim();
  const displaySrc = hasError ? '/placeholder.jpg' : cleanSrc;

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
      className={`relative select-none overflow-hidden bg-[#F3EFEA] group ${
        onClick
          ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880] focus-visible:ring-offset-2'
          : ''
      } ${wrapperClassName}`}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* CORE IMAGE: Always rendered cleanly with opacity-100 */}
      <img
        {...props}
        src={displaySrc}
        alt={alt}
        sizes={sizes}
        draggable={false}
        fetchPriority={priority ? 'high' : 'auto'}
        loading={priority ? 'eager' : (props.loading || 'lazy')}
        decoding="async"
        className={`pointer-events-none select-none w-full h-auto object-cover block opacity-100 transition-transform ${imageClassName}`}
        onContextMenu={(e) => e.preventDefault()}
        onError={(e) => {
          if (!hasError) {
            setHasError(true);
          }
          props.onError?.(e);
        }}
      />

      {/* LAYER: Transparent Security Shield */}
      <div
        className="absolute inset-0 z-10 select-none bg-transparent cursor-inherit"
        aria-hidden="true"
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      />

      {/* LAYER: Optional Subtle Luxury Watermark */}
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
