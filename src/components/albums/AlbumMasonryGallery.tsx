'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { ProgressiveImage } from '@/components/ui/ProgressiveImage';
import { EditorialReveal } from '@/components/ui/EditorialReveal';
import {
  Maximize2,
  Heart,
  Sparkles,
  Columns,
  Grid3X3,
  Layers,
} from 'lucide-react';

const GalleryLightboxModal = dynamic(
  () => import('./GalleryLightboxModal'),
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
  orientation?: 'landscape' | 'portrait';
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
  const [viewFilter, setViewFilter] = useState<'all' | 'portrait' | 'landscape'>('all');

  const validMedia: GalleryMediaItem[] = useMemo(() => {
    return (media || [])
      .filter((item) => Boolean(item && item.url && item.url.trim().length > 0))
      .map((item) => {
        const orientation: 'portrait' | 'landscape' =
          item.orientation ||
          (item.width && item.height && item.height > item.width ? 'portrait' : 'landscape');
        return {
          ...item,
          orientation,
        };
      });
  }, [media]);

  // Split into indexed landscape and portrait lists
  const landscapeItems = useMemo(
    () =>
      validMedia
        .map((item, originalIndex) => ({ item, originalIndex }))
        .filter((entry) => entry.item.orientation === 'landscape'),
    [validMedia]
  );

  const portraitItems = useMemo(
    () =>
      validMedia
        .map((item, originalIndex) => ({ item, originalIndex }))
        .filter((entry) => entry.item.orientation === 'portrait'),
    [validMedia]
  );

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

  const handleOpenLightbox = (originalIndex: number) => {
    setSelectedIndex(originalIndex);
  };

  const handleCloseLightbox = () => {
    setSelectedIndex(null);
  };

  if (!media || media.length === 0) {
    return null;
  }

  const currentItem = selectedIndex !== null ? validMedia[selectedIndex] : null;
  const isCurrentLiked = currentItem ? Boolean(likedPhotos[currentItem.id]) : false;

  // Single Photo Card Render Component
  const renderPhotoCard = (
    item: GalleryMediaItem,
    originalIndex: number,
    aspectClass: string
  ) => {
    const isLiked = Boolean(likedPhotos[item.id]);

    return (
      <div
        className={`overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-2xl border border-stone-200/80 group transition-all duration-300 relative w-full ${aspectClass}`}
      >
        <ProgressiveImage
          src={item.url}
          alt={item.altText || `${albumTitle} - Ảnh cưới ${originalIndex + 1}`}
          priority={false}
          orientation={item.orientation}
          objectPosition={item.orientation === 'portrait' ? 'object-[50%_18%]' : 'object-center'}
          aspectRatio={aspectClass.includes('16/9') ? '16/9' : aspectClass.includes('3/4') ? '3/4' : '3/2'}
          aspectClassName={aspectClass}
          sizes={
            aspectClass.includes('16/9')
              ? '100vw'
              : aspectClass.includes('3/4')
              ? '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 420px'
              : '(max-width: 768px) 100vw, 640px'
          }
          onClick={() => handleOpenLightbox(originalIndex)}
          className="w-full h-full cursor-pointer"
          imageClassName="w-full h-full object-cover block group-hover:scale-[1.03] transition-transform duration-700 ease-out"
        />

        {/* Heart Button on Top-Right Corner (compact, subtle, never blocks head/face) */}
        <button
          type="button"
          aria-label="Lưu concept yêu thích"
          onClick={(e) => toggleLikePhoto(item.id, e)}
          className="absolute top-2.5 right-2.5 z-20 w-7 h-7 md:w-8 md:h-8 rounded-full bg-black/35 hover:bg-black/60 backdrop-blur-xs flex items-center justify-center transition-all active:scale-90 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880] focus-visible:ring-offset-2"
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors ${
              isLiked ? 'fill-rose-500 text-rose-500' : 'text-white/90'
            }`}
          />
        </button>

        {/* Hover overlay hint */}
        <div
          onClick={() => handleOpenLightbox(originalIndex)}
          className="absolute inset-0 z-20 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer pointer-events-none"
        >
          <span className="p-3 bg-white/90 backdrop-blur-xs text-charcoal-900 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <Maximize2 className="w-4 h-4 text-luxury-700" />
          </span>
        </div>

        {/* Optional Caption */}
        {item.caption && (
          <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-25 text-white text-xs pointer-events-none">
            <p className="font-serif italic line-clamp-1 drop-shadow-sm">
              {item.caption}
            </p>
          </div>
        )}
      </div>
    );
  };

  // Landscape Layout: If odd count, index 0 is full-width hero (16:9), remaining are pairs (3:2)
  const isLandscapeOdd = landscapeItems.length % 2 === 1;

  // Portrait Layout: Full rows of 3, remainder (1 or 2 items) centered in the last row
  const portraitRemainderCount = portraitItems.length % 3;
  const portraitFullCount =
    portraitRemainderCount === 0
      ? portraitItems.length
      : portraitItems.length - portraitRemainderCount;

  const fullGridPortraits = portraitItems.slice(0, portraitFullCount);
  const remainderPortraits = portraitItems.slice(portraitFullCount);

  return (
    <div className="space-y-8 sm:space-y-12">
      {/* MOBILE QUICK ACTION: Slide Story / View Fullscreen Button */}
      <div className="md:hidden flex items-center justify-between">
        <button
          type="button"
          onClick={() => handleOpenLightbox(0)}
          className="w-full py-3 px-4 rounded-2xl bg-charcoal-900 text-amber-200 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-luxury active:scale-95 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Vuốt Xem Toàn Màn Hình (Story/Carousel)</span>
        </button>
      </div>

      {/* ORIENTATION FILTER TABS (Only show when album has both portrait & landscape) */}
      {portraitItems.length > 0 && landscapeItems.length > 0 && (
        <div className="flex items-center justify-center sm:justify-start gap-2 pt-1 pb-2">
          <button
            type="button"
            onClick={() => setViewFilter('all')}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              viewFilter === 'all'
                ? 'bg-charcoal-900 text-white shadow-xs font-semibold'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70 border border-stone-200/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tất Cả ({validMedia.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setViewFilter('landscape')}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              viewFilter === 'landscape'
                ? 'bg-charcoal-900 text-white shadow-xs font-semibold'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70 border border-stone-200/60'
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5" />
            <span>Ảnh Ngang ({landscapeItems.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setViewFilter('portrait')}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              viewFilter === 'portrait'
                ? 'bg-charcoal-900 text-white shadow-xs font-semibold'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70 border border-stone-200/60'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Ảnh Đứng / Dọc ({portraitItems.length})</span>
          </button>
        </div>
      )}

      {/* =========================================================================
          1. KHU VỰC ẢNH NGANG (LANDSCAPE GALLERY - ROW-BALANCED 100% WIDTH)
      ========================================================================= */}
      {(viewFilter === 'all' || viewFilter === 'landscape') && landscapeItems.length > 0 && (
        <section className="space-y-4">
          {viewFilter === 'all' && portraitItems.length > 0 && (
            <div className="flex items-center justify-between border-b border-stone-200/80 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-luxury-600" />
                <h3 className="font-serif text-lg sm:text-xl font-light text-charcoal-900">
                  Góc Máy Toàn Cảnh & Điện Ảnh
                </h3>
              </div>
              <span className="text-xs font-mono text-stone-500">
                {landscapeItems.length} tác phẩm
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 md:gap-6 [overflow-anchor:none]">
            {landscapeItems.map(({ item, originalIndex }, idx) => {
              const isHero = isLandscapeOdd && idx === 0;
              const aspectClass = isHero ? 'aspect-[16/9]' : 'aspect-[3/2]';

              return (
                <EditorialReveal
                  key={item.id}
                  delay={(idx % 2) * 80}
                  className={isHero ? 'md:col-span-2' : ''}
                >
                  {renderPhotoCard(item, originalIndex, aspectClass)}
                </EditorialReveal>
              );
            })}
          </div>
        </section>
      )}

      {/* =========================================================================
          2. KHU VỰC ẢNH DỌC (PORTRAIT GALLERY - ROW-BALANCED & CENTERED REMAINDER)
      ========================================================================= */}
      {(viewFilter === 'all' || viewFilter === 'portrait') && portraitItems.length > 0 && (
        <section className="space-y-4">
          {viewFilter === 'all' && landscapeItems.length > 0 && (
            <div className="flex items-center justify-between border-b border-stone-200/80 pb-3 pt-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-luxury-600" />
                <h3 className="font-serif text-lg sm:text-xl font-light text-charcoal-900">
                  Chân Dung Nghệ Thuật & Cảm Xúc
                </h3>
              </div>
              <span className="text-xs font-mono text-stone-500">
                {portraitItems.length} tác phẩm
              </span>
            </div>
          )}

          {/* Main Portrait Grid: 2 columns on mobile, 3 columns on tablet/desktop */}
          {fullGridPortraits.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 [overflow-anchor:none]">
              {fullGridPortraits.map(({ item, originalIndex }, idx) => (
                <EditorialReveal
                  key={item.id}
                  delay={(idx % 3) * 60}
                  className="h-full"
                >
                  {renderPhotoCard(item, originalIndex, 'aspect-[3/4]')}
                </EditorialReveal>
              ))}
            </div>
          )}

          {/* Centered Remainder: If 1 item, center it */}
          {remainderPortraits.length === 1 && (
            <div className="flex justify-center pt-2 [overflow-anchor:none]">
              <div className="w-full max-w-[calc(50%-0.5rem)] md:max-w-[calc(33.333%-1rem)]">
                <EditorialReveal key={remainderPortraits[0].item.id} delay={60}>
                  {renderPhotoCard(
                    remainderPortraits[0].item,
                    remainderPortraits[0].originalIndex,
                    'aspect-[3/4]'
                  )}
                </EditorialReveal>
              </div>
            </div>
          )}

          {/* Centered Remainder: If 2 items, center pair */}
          {remainderPortraits.length === 2 && (
            <div className="flex justify-center gap-4 md:gap-6 pt-2 [overflow-anchor:none]">
              {remainderPortraits.map(({ item, originalIndex }, idx) => (
                <div
                  key={item.id}
                  className="w-[calc(50%-0.5rem)] md:w-[calc(33.333%-1rem)]"
                >
                  <EditorialReveal delay={idx * 60}>
                    {renderPhotoCard(item, originalIndex, 'aspect-[3/4]')}
                  </EditorialReveal>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* =========================================================================
          FULLSCREEN MOBILE-FIRST LIGHTBOX (Lazy dynamic chunk, only loaded on click)
      ========================================================================= */}
      {selectedIndex !== null && (
        <GalleryLightboxModal
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
    </div>
  );
}

export default AlbumMasonryGallery;
