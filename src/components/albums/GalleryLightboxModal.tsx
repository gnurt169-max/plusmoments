'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ProtectedImage } from '@/components/common/ProtectedImage';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type { GalleryMediaItem } from './AlbumMasonryGallery';

export interface GalleryLightboxModalProps {
  selectedIndex: number;
  validMedia: GalleryMediaItem[];
  albumTitle: string;
  isCurrentLiked: boolean;
  onClose: () => void;
  onSelectIndex: (index: number) => void;
  onToggleLike: (photoId: string, e?: React.MouseEvent) => void;
}

export function GalleryLightboxModal({
  selectedIndex,
  validMedia,
  albumTitle,
  isCurrentLiked,
  onClose,
  onSelectIndex,
  onToggleLike,
}: GalleryLightboxModalProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);

  // Touch gesture tracking refs
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastTapRef = useRef<number>(0);
  const initialPinchDistanceRef = useRef<number | null>(null);
  const thumbnailScrollRef = useRef<HTMLDivElement>(null);

  const currentItem = validMedia[selectedIndex] || validMedia[0];

  const handleNext = useCallback(
    (e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      onSelectIndex((selectedIndex + 1) % validMedia.length);
      setIsZoomed(false);
      setZoomScale(1);
    },
    [selectedIndex, validMedia.length, onSelectIndex]
  );

  const handlePrev = useCallback(
    (e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      onSelectIndex((selectedIndex - 1 + validMedia.length) % validMedia.length);
      setIsZoomed(false);
      setZoomScale(1);
    },
    [selectedIndex, validMedia.length, onSelectIndex]
  );

  // Auto-scroll active thumbnail into center of strip
  useEffect(() => {
    if (thumbnailScrollRef.current) {
      const thumbEl = thumbnailScrollRef.current.children[selectedIndex] as HTMLElement;
      if (thumbEl) {
        window.requestAnimationFrame(() => {
          thumbEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        });
      }
    }
  }, [selectedIndex]);

  // Keyboard navigation (Esc, Left, Right)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, handleNext, handlePrev]);

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
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      initialPinchDistanceRef.current = Math.hypot(dx, dy);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialPinchDistanceRef.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDist = Math.hypot(dx, dy);
      const ratio = currentDist / initialPinchDistanceRef.current;
      const newScale = Math.min(Math.max(1, ratio), 2.5);
      setZoomScale(newScale);
      setIsZoomed(newScale > 1.1);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (initialPinchDistanceRef.current) {
      initialPinchDistanceRef.current = null;
      if (zoomScale < 1.1) {
        setZoomScale(1);
        setIsZoomed(false);
      }
      return;
    }

    if (!touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const dt = Date.now() - touchStartRef.current.time;

    // Detect double tap
    const now = Date.now();
    if (dt < 300 && Math.abs(dx) < 10 && Math.abs(dy) < 10) {
      if (now - lastTapRef.current < 350) {
        setIsZoomed((prev) => !prev);
        setZoomScale((prev) => (prev > 1 ? 1 : 2));
        lastTapRef.current = 0;
        return;
      }
      lastTapRef.current = now;
    }

    // Detect horizontal swipe
    if (!isZoomed && Math.abs(dx) > 50 && Math.abs(dy) < 70 && dt < 400) {
      if (dx < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }

    touchStartRef.current = null;
  };

  if (!currentItem) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Trình xem ảnh toàn màn hình album: ${albumTitle}`}
      onClick={onClose}
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
            onClick={(e) => onToggleLike(currentItem.id, e)}
            aria-label={isCurrentLiked ? 'Bỏ thích ảnh này' : 'Thích ảnh này'}
            title={isCurrentLiked ? 'Xóa khỏi Concept Yêu Thích' : 'Lưu Concept Yêu Thích'}
            className={`p-2 sm:p-2.5 rounded-full transition-all active:scale-90 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880] focus-visible:ring-offset-2 ${
              isCurrentLiked
                ? 'bg-rose-500/20 text-rose-500 border border-rose-500/50'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
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
            aria-label={isZoomed ? 'Thu nhỏ ảnh' : 'Phóng to ảnh'}
            title={isZoomed ? 'Thu nhỏ (1x)' : 'Phóng to (2x)'}
            className="p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880] focus-visible:ring-offset-2"
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
            onClick={onClose}
            aria-label="Đóng trình xem ảnh"
            title="Đóng (ESC)"
            className="p-2 sm:p-2.5 rounded-full bg-white/15 hover:bg-white/30 text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880] focus-visible:ring-offset-2"
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
            aria-label="Xem ảnh trước"
            title="Ảnh trước (Mũi tên trái)"
            className="hidden md:flex absolute left-3 sm:left-6 z-30 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all backdrop-blur-xs cursor-pointer shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880] focus-visible:ring-offset-2"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Uncropped Protected Image with Scale Transform */}
        <button
          type="button"
          aria-label={isZoomed ? 'Thu nhỏ ảnh' : 'Phóng to ảnh'}
          className="transition-transform duration-300 ease-out flex items-center justify-center max-h-[75vh] sm:max-h-[80vh] max-w-[96vw] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880] focus-visible:ring-offset-2 rounded-xl border-none bg-transparent p-0"
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
        </button>

        {/* Desktop Next Button */}
        {validMedia.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            aria-label="Xem ảnh tiếp theo"
            title="Ảnh tiếp theo (Mũi tên phải)"
            className="hidden md:flex absolute right-3 sm:right-6 z-30 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all backdrop-blur-xs cursor-pointer shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880] focus-visible:ring-offset-2"
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
              onClick={() => onSelectIndex(idx)}
              aria-label={`Chuyển đến ảnh ${idx + 1}`}
              className={`relative shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden transition-all duration-200 border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880] focus-visible:ring-offset-2 ${
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
  );
}

export default GalleryLightboxModal;

