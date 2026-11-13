'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { ProtectedImage } from '@/components/common/ProtectedImage';
import {
  Maximize2,
  Heart,
  Sparkles,
} from 'lucide-react';

const AlbumLightboxModal = dynamic(
  () => import('./AlbumLightboxModal').then((mod) => mod.AlbumLightboxModal),
  { ssr: false }
);

export interface GalleryMediaItem {
  id: string;
  url: string;
  altText?: string | null;
  caption?: string | null;
  width?: number | null;
  height?: number | null;
  blurDataUrl?: string | null;
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
  const [likedPhotos, setLikedPhotos] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
  };

  const handleCloseLightbox = () => {
    setSelectedIndex(null);
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
              className="break-inside-avoid overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-2xl border border-stone-200/80 group transition-all duration-300 relative"
            >
              {/* Natural Ratio Container - Auto Height Zero Whitespace */}
              <div className="relative w-full overflow-hidden bg-[#FAF8F5]">
                <button
                  type="button"
                  onClick={() => handleOpenLightbox(index)}
                  aria-label={`Xem ảnh lớn: ${item.altText || `${albumTitle} - Ảnh cưới ${index + 1}`}`}
                  className="w-full text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880] focus-visible:ring-offset-2 block border-none bg-transparent p-0"
                >
                  <ProtectedImage
                    src={item.url}
                    alt={item.altText || `${albumTitle} - Ảnh cưới ${index + 1}`}
                    blurDataUrl={item.blurDataUrl}
                    priority={index < 4}
                    imageClassName="w-full h-auto object-cover block transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  />
                </button>

                {/* Heart Button on Corner */}
                <button
                  type="button"
                  aria-label="Lưu concept yêu thích"
                  onClick={(e) => toggleLikePhoto(item.id, e)}
                  className="absolute top-3 right-3 z-30 p-2.5 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md transition-all active:scale-90 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880] focus-visible:ring-offset-2"
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
          FULLSCREEN MOBILE-FIRST LIGHTBOX (Lazy dynamic chunk, only loaded on click)
      ========================================================================= */}
      {selectedIndex !== null && (
        <AlbumLightboxModal
          selectedIndex={selectedIndex}
          validMedia={validMedia}
          albumTitle={albumTitle}
          isCurrentLiked={isCurrentLiked}
          onClose={handleCloseLightbox}
          onSelectIndex={(idx) => setSelectedIndex(idx)}
          onToggleLike={toggleLikePhoto}
        />
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
