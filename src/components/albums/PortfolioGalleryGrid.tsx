'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AlbumCard, AlbumCardData } from './AlbumCard';
import { EditorialReveal } from '@/components/ui/EditorialReveal';
import { Loader2 } from 'lucide-react';

interface PortfolioGalleryGridProps {
  albums: AlbumCardData[];
}

/**
 * PortfolioGalleryGrid: Clean Editorial Lookbook presentation without filter panel.
 * - Renders albums grid immediately below the header section.
 * - Progressive Infinite Loading: Initial 8 albums, batch load 8 more on scroll.
 * - Zero CLS & 60fps GPU reveal animations.
 */
export function PortfolioGalleryGrid({ albums }: PortfolioGalleryGridProps) {
  const [visibleCount, setVisibleCount] = useState<number>(8);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Sentinel IntersectionObserver for progressive loading
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((prev) => Math.min(albums.length, prev + 8));
        }
      },
      {
        rootMargin: '450px 0px',
        threshold: 0.05,
      }
    );

    observer.observe(sentinel);
    return () => {
      observer.disconnect();
    };
  }, [albums.length]);

  const visibleAlbums = useMemo(() => {
    return albums.slice(0, visibleCount);
  }, [albums, visibleCount]);

  if (albums.length === 0) {
    return (
      <div className="text-center py-16 sm:py-20 bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 max-w-xl mx-auto space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-xl">
          📷
        </div>
        <h2 className="font-serif text-xl sm:text-2xl text-charcoal-800 font-light">
          Đang cập nhật các bộ sưu tập mới
        </h2>
        <p className="text-xs text-charcoal-500 font-light max-w-md mx-auto">
          Ekip PlusMoments đang tiến hành chuẩn bị và cập nhật các bộ ảnh cưới mới nhất. Xin vui lòng quay lại sau ít phút.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 [overflow-anchor:none]">
      {/* 1. ALBUMS GRID (2 Cột trên Mobile < 640px, 3-4 Cột trên Desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 lg:gap-6 [overflow-anchor:none]">
        {visibleAlbums.map((album, idx) => (
          <EditorialReveal
            key={album.id}
            delay={(idx % 4) * 60}
            className="h-full"
          >
            <AlbumCard
              album={album}
              priority={idx < 4}
              idx={idx}
            />
          </EditorialReveal>
        ))}
      </div>

      {/* 2. PROGRESSIVE INFINITE SENTINEL & STATUS BAR */}
      {visibleCount < albums.length && (
        <div ref={sentinelRef} className="pt-6 pb-2 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-100 border border-stone-200 text-stone-600 text-xs font-mono shadow-2xs">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-luxury-600" />
            <span>
              Đang hiển thị <strong>{visibleAlbums.length}</strong> / {albums.length} bộ sưu tập
            </span>
          </div>
          <div>
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => Math.min(albums.length, prev + 8))}
              className="text-xs text-charcoal-700 hover:text-charcoal-900 font-medium underline underline-offset-4 cursor-pointer active:scale-95 transition-transform"
            >
              Tải thêm {Math.min(8, albums.length - visibleAlbums.length)} bộ sưu tập tiếp theo
            </button>
          </div>
        </div>
      )}

      {visibleCount >= albums.length && albums.length > 8 && (
        <div className="pt-6 pb-2 text-center text-xs text-stone-400 font-mono tracking-wide">
          ✓ Đã hiển thị toàn bộ {albums.length} / {albums.length} bộ sưu tập
        </div>
      )}
    </div>
  );
}

export default PortfolioGalleryGrid;
