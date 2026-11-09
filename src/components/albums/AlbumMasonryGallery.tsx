'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ProtectedImage } from '@/components/common/ProtectedImage';
import {
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Share2,
} from 'lucide-react';

export interface GalleryMediaItem {
  id: string;
  url: string;
  altText?: string | null;
  caption?: string | null;
  width?: number | null;
  height?: number | null;
}

interface AlbumMasonryGalleryProps {
  media: GalleryMediaItem[];
  albumTitle: string;
}

export function AlbumMasonryGallery({
  media,
  albumTitle,
}: AlbumMasonryGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [likedPhotos, setLikedPhotos] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Touch gesture tracking refs
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastTapRef = useRef<number>(0);
  const initialPinchDistanceRef = useRef<number | null>(null);
  const thumbnailScrollRef = useRef<HTMLDivElement>(null);

  const validMedia: GalleryMediaItem[] = useMemo(() => {
    return (media || []).filter((item) => Boolean(item && item.url && item.url.trim().length > 0));
  }, [media]);

  // Load liked photos from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pm_liked_photos');
      if (saved) {
        setLikedPhotos(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const toggleLikePhoto = (photoId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setLikedPhotos((prev) => {
      const next = { ...prev, [photoId]: !prev[photoId] };
      try {
        localStorage.setItem('pm_liked_photos', JSON.stringify(next));
      } catch {}
      if (next[photoId]) {
        showToast('❤️ Đã lưu góc ảnh cưới vào Concept Yêu Thích!');
      } else {
        showToast('Đã xóa khỏi Concept Yêu Thích');
      }
      return next;
    });
  };

  const handleOpenLightbox = (index: number) => {
    setSelectedIndex(index);
    setIsZoomed(false);
    setZoomScale(1);
  };

  const handleCloseLightbox = () => {
    setSelectedIndex(null);
    setIsZoomed(false);
    setZoomScale(1);
  };

  const handleNext = useCallback(
    (e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      if (selectedIndex === null) return;
      setSelectedIndex((prev) => (prev !== null ? (prev + 1) % validMedia.length : null));
      setIsZoomed(false);
      setZoomScale(1);
    },
    [selectedIndex, validMedia.length]
  );

  const handlePrev = useCallback(
    (e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      if (selectedIndex === null) return;
      setSelectedIndex((prev) => (prev !== null ? (prev - 1 + validMedia.length) % validMedia.length : null));
      setIsZoomed(false);
      setZoomScale(1);
    },
    [selectedIndex, validMedia.length]
  );

  // Auto-scroll active thumbnail into center of strip
  useEffect(() => {
    if (selectedIndex !== null && thumbnailScrollRef.current) {
      const thumbEl = thumbnailScrollRef.current.children[selectedIndex] as HTMLElement;
      if (thumbEl) {
        thumbEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCloseLightbox();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, handleNext, handlePrev]);

  // Touch handlers for swipe navigation and double-tap zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
    } else if (e.touches.length === 2) {
      // Pinch to zoom start
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      initialPinchDistanceRef.current = Math.hypot(dx, dy);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialPinchDistanceRef.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDistance = Math.hypot(dx, dy);
      const diff = currentDistance - initialPinchDistanceRef.current;
      if (diff > 40) {
        setIsZoomed(true);
        setZoomScale(1.8);
      } else if (diff < -40) {
        setIsZoomed(false);
        setZoomScale(1);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    initialPinchDistanceRef.current = null;

    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;

    // Double tap detection (within 300ms)
    const now = Date.now();
    if (Math.abs(deltaX) < 15 && Math.abs(deltaY) < 15) {
      if (now - lastTapRef.current < 300) {
        // Toggle zoom on double tap
        setIsZoomed((prev) => !prev);
        setZoomScale((prev) => (prev > 1 ? 1 : 2));
        lastTapRef.current = 0;
        return;
      }
      lastTapRef.current = now;
    }

    // Only swipe if not zoomed in
    if (!isZoomed && Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4 && deltaTime < 400) {
      if (deltaX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    } else if (!isZoomed && deltaY > 80 && Math.abs(deltaY) > Math.abs(deltaX) * 2) {
      // Swipe down to dismiss lightbox
      handleCloseLightbox();
    }

    touchStartRef.current = null;
  };

  if (!media || media.length === 0) {
    return null;
  }

  const currentItem = selectedIndex !== null ? validMedia[selectedIndex] : null;
  const isCurrentLiked = currentItem ? Boolean(likedPhotos[currentItem.id]) : false;

  return (
    <>
      {/* MOBILE QUICK ACTION: Slide Story / View Fullscreen Button */}
      <div className="md:hidden flex items-center justify-between pb-2">
        <button
          type="button"
          onClick={() => handleOpenLightbox(0)}
          className="w-full py-3 px-4 rounded-2xl bg-charcoal-900 text-amber-200 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-luxury active:scale-95 transition-all"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Vuốt Xem Toàn Màn Hình (Story/Carousel)</span>
        </button>
      </div>

      {/* MASONRY CSS COLUMNS GALLERY - Zero Cropping */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6 pt-2">
        {validMedia.map((item, index) => {
          const isLiked = Boolean(likedPhotos[item.id]);

          return (
            <div
              key={item.id}
              onClick={() => handleOpenLightbox(index)}
              className="break-inside-avoid overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-2xl border border-stone-200/80 group transition-all duration-300 cursor-pointer relative"
            >
              {/* Natural Ratio Container - Auto Height Zero Whitespace */}
              <div className="relative w-full overflow-hidden bg-[#FAF8F5]">
                <ProtectedImage
                  src={item.url}
                  alt={item.altText || `${albumTitle} - Ảnh cưới ${index + 1}`}
                  priority={index < 4}
                  imageClassName="w-full h-auto object-cover block transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />

                {/* Heart Button on Corner */}
                <button
                  type="button"
                  aria-label="Lưu concept yêu thích"
                  onClick={(e) => toggleLikePhoto(item.id, e)}
                  className="absolute top-3 right-3 z-30 p-2.5 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md transition-all active:scale-90"
                >
                  <Heart
                    className={`w-4 h-4 transition-colors ${
                      isLiked ? 'fill-rose-500 text-rose-500' : 'text-white/90'
                    }`}
                  />
                </button>

                {/* Hover overlay hint */}
                <div className="absolute inset-0 z-20 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                  <span className="p-3 bg-white/90 backdrop-blur-xs text-charcoal-900 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <Maximize2 className="w-4 h-4 text-luxury-700" />
                  </span>
                </div>
              </div>

              {/* Optional Caption */}
              {item.caption && (
                <div className="p-3.5 bg-white border-t border-stone-100 flex items-center justify-between text-xs">
                  <p className="text-charcoal-700 font-serif italic line-clamp-2">
                    {item.caption}
                  </p>
                  <span className="text-[10px] text-stone-400 font-mono shrink-0 ml-2">
                    #{index + 1}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* =========================================================================
          FULLSCREEN MOBILE-FIRST LIGHTBOX WITH TOUCH SWIPE & THUMBNAIL STRIP
      ========================================================================= */}
      {selectedIndex !== null && currentItem && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={handleCloseLightbox}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex flex-col justify-between p-2 sm:p-4 animate-in fade-in duration-200 select-none touch-pan-y"
        >
          {/* Top Bar */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-between text-white z-30 pt-2 px-2 sm:px-4"
          >
            {/* Left: Counter & Album Title */}
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-xs text-[11px] font-mono font-medium text-amber-200">
                {selectedIndex + 1} / {validMedia.length}
              </span>
              <span className="text-xs font-serif font-light text-stone-300 truncate max-w-[140px] sm:max-w-md">
                {albumTitle}
              </span>
            </div>

            {/* Right: Actions (Heart Concept, Zoom Toggle, Close) */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Heart Button */}
              <button
                type="button"
                onClick={(e) => toggleLikePhoto(currentItem.id, e)}
                className={`p-2 sm:p-2.5 rounded-full transition-all active:scale-90 cursor-pointer ${
                  isCurrentLiked
                    ? 'bg-rose-500/20 text-rose-500 border border-rose-500/50'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
                title="Lưu Concept Yêu Thích"
              >
                <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isCurrentLiked ? 'fill-current' : ''}`} />
              </button>

              {/* Zoom Toggle */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsZoomed((prev) => !prev);
                  setZoomScale((prev) => (prev > 1 ? 1 : 2));
                }}
                className="p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title={isZoomed ? 'Thu nhỏ (1x)' : 'Phóng to (2x)'}
              >
                {isZoomed ? (
                  <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
                ) : (
                  <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={handleCloseLightbox}
                className="p-2 sm:p-2.5 rounded-full bg-white/15 hover:bg-white/30 text-white transition-colors cursor-pointer"
                title="Đóng (ESC)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Central Image Viewport with Pinch & Double Tap Zoom */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex-1 flex items-center justify-center py-1 sm:py-2 overflow-hidden"
          >
            {/* Desktop Prev Button */}
            {validMedia.length > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="hidden md:flex absolute left-3 sm:left-6 z-30 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all backdrop-blur-xs cursor-pointer shadow-xl"
                title="Ảnh trước (Mũi tên trái)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Uncropped Protected Image with Scale Transform */}
            <div
              className="transition-transform duration-300 ease-out flex items-center justify-center max-h-[75vh] sm:max-h-[80vh] max-w-[96vw]"
              style={{
                transform: `scale(${zoomScale})`,
                cursor: isZoomed ? 'zoom-out' : 'zoom-in',
              }}
              onClick={() => {
                setIsZoomed((prev) => !prev);
                setZoomScale((prev) => (prev > 1 ? 1 : 2));
              }}
            >
              <ProtectedImage
                src={currentItem.url}
                alt={currentItem.altText || albumTitle}
                priority
                watermark
                watermarkText="PlusMoments Photography"
                wrapperClassName="rounded-xl shadow-2xl flex items-center justify-center"
                imageClassName="max-h-[75vh] sm:max-h-[80vh] max-w-[96vw] w-auto h-auto object-contain"
              />
            </div>

            {/* Desktop Next Button */}
            {validMedia.length > 1 && (
              <button
                type="button"
                onClick={handleNext}
                className="hidden md:flex absolute right-3 sm:right-6 z-30 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all backdrop-blur-xs cursor-pointer shadow-xl"
                title="Ảnh tiếp theo (Mũi tên phải)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Bottom Area: Caption & Horizontal Thumbnail Strip */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="z-30 space-y-2 pt-1 pb-1 max-w-4xl mx-auto w-full"
          >
            {/* Caption / Swipe Tip */}
            <div className="text-center text-xs text-stone-300 font-light px-4 truncate">
              {currentItem.caption ? (
                <p className="font-serif italic text-amber-200">{currentItem.caption}</p>
              ) : (
                <p className="text-[11px] text-stone-400">
                  Vuốt ngang để đổi ảnh • Chạm 2 lần để phóng to chi tiết váy cưới
                </p>
              )}
            </div>

            {/* HORIZONTAL THUMBNAIL STRIP */}
            <div
              ref={thumbnailScrollRef}
              className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1.5 px-3 max-w-full justify-start sm:justify-center"
            >
              {validMedia.map((thumb, idx) => (
                <button
                  key={thumb.id}
                  type="button"
                  onClick={() => handleOpenLightbox(idx)}
                  className={`relative shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden transition-all duration-200 border cursor-pointer ${
                    selectedIndex === idx
                      ? 'ring-2 ring-amber-400 border-amber-300 scale-105 opacity-100 shadow-md'
                      : 'border-white/20 opacity-40 hover:opacity-80'
                  }`}
                >
                  <img
                    src={thumb.url}
                    alt=""
                    className="w-full h-full object-cover pointer-events-none"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-charcoal-900/95 text-amber-200 text-xs font-medium rounded-full shadow-2xl border border-champagne-gold/30 animate-in fade-in duration-200 flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}
