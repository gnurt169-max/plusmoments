'use client';

import React, { useState } from 'react';

export interface ProtectedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  wrapperClassName?: string;
  imageClassName?: string;
  priority?: boolean;
  watermark?: boolean;
  watermarkText?: string;
}

/**
 * ProtectedImage: Multi-layer Image Protection Wrapper with Defensive Error Fallback
 * 
 * Layers of defense:
 * 1. Image layer: pointer-events-none, user-select-none, draggable=false, onError fallback
 * 2. Transparent Shield: absolute overlay that absorbs right-clicks and drag events
 * 3. Optional subtle luxury watermark
 * 4. Preserves onClick and interactive functionality for lightboxes & gallery navigation
 */
export function ProtectedImage({
  src,
  alt,
  wrapperClassName = '',
  imageClassName = '',
  priority = false,
  watermark = false,
  watermarkText = 'PlusMoments Photography',
  onClick,
  ...props
}: ProtectedImageProps) {
  const [hasError, setHasError] = useState(false);

  // Defensive rendering: If src is null, undefined, empty, or failed to load, suppress rendering cleanly
  if (!src || !src.trim() || hasError) {
    return null;
  }

  return (
    <div
      onClick={onClick}
      className={`relative select-none overflow-hidden group ${wrapperClassName}`}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* LAYER 1: Core Image with interaction lock & error boundary */}
      <img
        src={src}
        alt={alt}
        draggable={false}
        fetchPriority={priority ? 'high' : 'auto'}
        loading={priority ? 'eager' : (props.loading || 'lazy')}
        decoding={props.decoding || 'async'}
        className={`pointer-events-none select-none w-full h-auto object-cover block transition-all duration-500 ${imageClassName}`}
        onContextMenu={(e) => e.preventDefault()}
        onError={(e) => {
          setHasError(true);
          try {
            (e.target as HTMLElement).style.display = 'none';
          } catch {}
          props.onError?.(e);
        }}
        {...props}
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

