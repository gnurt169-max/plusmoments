'use client';

import React, { useState, useRef, useEffect } from 'react';

// In-memory module cache for loaded image URLs across component mounts and re-renders
const loadedImageCache = new Set<string>();

export interface ProgressiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  aspectRatio?: string; // e.g. '3/4', '3/2', '16/9', '1/1'
  aspectClassName?: string; // e.g. 'aspect-[3/4]', 'aspect-[3/2]'
  orientation?: 'portrait' | 'landscape';
  priority?: boolean;
  sizes?: string;
  className?: string; // Container wrapper class
  imageClassName?: string; // Inner <img> tag class
  fallbackSrc?: string;
  watermark?: boolean;
  watermarkText?: string;
}

/**
 * ProgressiveImage: True Viewport-Gated DOM-Deferred Lazy Loading for PlusMoments Studio.
 * - Locked Container: Container aspect ratio is permanently locked (block w-full aspect-[...])
 *   to guarantee height is NEVER 0, keeping off-screen images strictly below the viewport.
 * - When priority !== true and not in memory cache, the <img> tag is NOT mounted in the DOM
 *   until container enters viewport (rootMargin: 180px). This guarantees zero network requests
 *   for off-screen images on initial load (Cmd + Shift + R).
 * - Zero-Flicker State: When URL is in loadedImageCache, renders directly at opacity-100
 *   without secondary transitions or placeholder flashes.
 * - Static warm cream placeholder (bg-[#EFECE6]) with zero pulsing, shimmer, or layout shifting.
 * - Multi-layer right-click & drag protection.
 */
export function ProgressiveImage({
  src,
  alt,
  aspectRatio,
  aspectClassName,
  orientation,
  priority = false,
  sizes,
  className = '',
  imageClassName = '',
  fallbackSrc = '/placeholder.jpg',
  watermark = false,
  watermarkText = 'PlusMoments Photography',
  onClick,
  onError,
  width,
  height,
  style,
  ...props
}: ProgressiveImageProps) {
  const cleanSrc = (src || '').trim();

  // Instant check in persistent module-level cache
  const isCached = Boolean(cleanSrc && loadedImageCache.has(cleanSrc));

  // True deferred lazy loading flag: only mount <img> when priority is true, in cache, or entered viewport
  const [shouldLoad, setShouldLoad] = useState<boolean>(() =>
    Boolean(priority || isCached)
  );

  const [isLoaded, setIsLoaded] = useState<boolean>(() => isCached);
  const [hasError, setHasError] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Compute locked aspect ratio & class (guaranteeing non-zero height from the very first frame)
  const isPortrait =
    orientation === 'portrait' ||
    aspectRatio === '3/4' ||
    aspectRatio === '3 / 4' ||
    Boolean(aspectClassName?.includes('3/4'));

  const defaultAspectClass = isPortrait ? 'aspect-[3/4]' : 'aspect-[3/2]';
  const defaultRatio = isPortrait ? '3 / 4' : '3 / 2';

  const computedAspectRatio =
    aspectRatio ||
    (typeof width === 'number' && typeof height === 'number' && width > 0 && height > 0
      ? `${width} / ${height}`
      : defaultRatio);

  const resolvedAspectClass =
    aspectClassName ||
    (aspectRatio ? `aspect-[${aspectRatio.replace(/\s+/g, '')}]` : defaultAspectClass);

  // Mark loaded and remember permanently in module cache
  const markLoaded = (url: string) => {
    if (url) {
      loadedImageCache.add(url);
    }
    setIsLoaded(true);
  };

  // Instant cache detection via ref callback if image was in browser HTTP cache
  const handleImgRef = (el: HTMLImageElement | null) => {
    imgRef.current = el;
    if (el && el.complete && el.naturalWidth > 0 && cleanSrc) {
      loadedImageCache.add(cleanSrc);
      if (!isLoaded) {
        setIsLoaded(true);
      }
    }
  };

  // One-time IntersectionObserver: disconnects immediately upon entering viewport
  useEffect(() => {
    if (priority || shouldLoad) return;

    const el = containerRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '180px 0px',
        threshold: 0.01,
      }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [priority, shouldLoad]);

  // Synchronize state if URL changes or already cached
  useEffect(() => {
    if (!cleanSrc) return;

    if (loadedImageCache.has(cleanSrc)) {
      if (!isLoaded) setIsLoaded(true);
      if (!shouldLoad) setShouldLoad(true);
      return;
    }

    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      markLoaded(cleanSrc);
    }
  }, [cleanSrc, isLoaded, shouldLoad]);

  if (!cleanSrc) {
    return (
      <div
        ref={containerRef}
        style={{
          aspectRatio: computedAspectRatio,
          ...style,
        }}
        className={`relative block w-full select-none overflow-hidden bg-[#EFECE6] flex items-center justify-center text-stone-400 text-xs ${resolvedAspectClass} ${className}`}
      >
        <span>PlusMoments</span>
      </div>
    );
  }

  const displaySrc = hasError ? fallbackSrc : cleanSrc;

  return (
    <div
      ref={containerRef}
      style={{
        aspectRatio: computedAspectRatio,
        ...style,
      }}
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
      className={`relative block w-full select-none overflow-hidden bg-[#EFECE6] ${resolvedAspectClass} ${
        onClick
          ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880] focus-visible:ring-offset-2'
          : ''
      } ${className}`}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* 1. STATIC WARM CREAM PLACEHOLDER - NO ANIMATE-PULSE, NO SHIMMER (Hidden immediately if cached) */}
      {!isCached && (
        <div
          aria-hidden="true"
          className={`absolute inset-0 z-10 pointer-events-none bg-[#EFECE6] ${
            isLoaded ? 'opacity-0 transition-opacity duration-300 ease-out' : 'opacity-100'
          }`}
        />
      )}

      {/* 2. CORE IMAGE WITH TRUE DOM-DEFERRED MOUNTING (Only mounts when shouldLoad is true) */}
      {shouldLoad && (
        <img
          {...props}
          ref={handleImgRef}
          src={displaySrc}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          draggable={false}
          fetchPriority={priority ? 'high' : 'auto'}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => markLoaded(cleanSrc)}
          onError={(e) => {
            e.currentTarget.onerror = null;
            setHasError(true);
            setIsLoaded(true);
            onError?.(e);
          }}
          className={`pointer-events-none select-none w-full h-full object-cover block ${
            isCached
              ? 'opacity-100'
              : isLoaded
              ? 'opacity-100 transition-opacity duration-300 ease-out'
              : 'opacity-0'
          } ${imageClassName}`}
        />
      )}

      {/* 3. TRANSPARENT SECURITY SHIELD */}
      <div
        className="absolute inset-0 z-10 select-none bg-transparent cursor-inherit"
        aria-hidden="true"
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      />

      {/* 4. OPTIONAL LUXURY WATERMARK */}
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

export default ProgressiveImage;
