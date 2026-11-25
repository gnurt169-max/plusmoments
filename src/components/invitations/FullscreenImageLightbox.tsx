'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, Heart } from 'lucide-react';

export interface LightboxImageItem {
  url: string;
  caption?: string | null;
  title?: string | null;
  tag?: string | null;
}

interface FullscreenImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  images: LightboxImageItem[];
  initialIndex?: number;
  themeColor?: string;
}

export function FullscreenImageLightbox({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
  themeColor = '#8C6D46',
}: FullscreenImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setIsZoomed(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialIndex]);

  const handleNext = useCallback(() => {
    if (images.length <= 1) return;
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handlePrev = useCallback(() => {
    if (images.length <= 1) return;
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  // Touch swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const diffX = touchStartXRef.current - e.changedTouches[0].clientX;
    const diffY = touchStartYRef.current - e.changedTouches[0].clientY;

    // Only swipe if horizontal move is significant and greater than vertical
    if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col justify-between select-none animate-in fade-in duration-200"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Header Bar */}
      <div className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-2 text-white/90">
          <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-white/10 border border-white/15">
            {currentIndex + 1} / {images.length}
          </span>
          {currentImage?.tag && (
            <span
              className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-full border border-white/20"
              style={{ color: themeColor }}
            >
              {currentImage.tag}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom toggle button */}
          <button
            type="button"
            onClick={() => setIsZoomed(!isZoomed)}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white/90 transition-all cursor-pointer"
            title={isZoomed ? 'Thu nhỏ' : 'Phóng to'}
          >
            {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
          </button>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white/90 transition-all cursor-pointer"
            title="Đóng xem ảnh (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div className="relative flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden">
        {/* Left Arrow Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="hidden sm:flex absolute left-4 z-20 w-12 h-12 rounded-full bg-black/50 hover:bg-black/80 border border-white/10 items-center justify-center text-white/90 transition-transform hover:scale-110 active:scale-95 cursor-pointer"
            title="Ảnh trước (←)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Right Arrow Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="hidden sm:flex absolute right-4 z-20 w-12 h-12 rounded-full bg-black/50 hover:bg-black/80 border border-white/10 items-center justify-center text-white/90 transition-transform hover:scale-110 active:scale-95 cursor-pointer"
            title="Ảnh tiếp theo (→)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* The Image Element with smooth zoom */}
        <div
          className={`relative max-w-full max-h-full transition-transform duration-300 ease-out cursor-zoom-in ${
            isZoomed ? 'scale-150 sm:scale-175 cursor-zoom-out' : 'scale-100'
          }`}
          onClick={() => setIsZoomed(!isZoomed)}
        >
          <img
            src={currentImage?.url}
            alt={currentImage?.caption || currentImage?.title || 'Ảnh cưới'}
            className="max-h-[80vh] max-w-[95vw] sm:max-w-[85vw] object-contain rounded-lg shadow-2xl mx-auto"
          />
        </div>
      </div>

      {/* Bottom Caption Bar */}
      <div className="relative z-10 px-4 sm:px-6 py-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent text-center">
        {currentImage?.title && (
          <div className="font-serif text-base sm:text-lg font-medium text-white tracking-wide mb-1">
            {currentImage.title}
          </div>
        )}
        {currentImage?.caption && (
          <p className="text-xs sm:text-sm text-stone-300 max-w-xl mx-auto font-light leading-relaxed">
            {currentImage.caption}
          </p>
        )}
        <div className="text-[10px] text-stone-400 mt-2 font-mono tracking-wider">
          💡 Chạm đúp để phóng to • Vuốt ngang để chuyển ảnh
        </div>
      </div>
    </div>
  );
}
