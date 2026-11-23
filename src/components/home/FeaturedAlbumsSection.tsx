'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { FloatingCard } from '@/components/motion/FloatingCard';
import { ProgressiveImage } from '@/components/ui/ProgressiveImage';
import { EditorialReveal } from '@/components/ui/EditorialReveal';

export interface FeaturedAlbumItem {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  coupleNames?: string | null;
  concept?: string | null;
  location?: string | null;
  coverImage?: string | null;
  photos?: { url: string }[];
  media?: { url: string }[];
}

interface FeaturedAlbumsSectionProps {
  albums: FeaturedAlbumItem[];
  totalAlbumsCount?: number;
}

function getMediumImageUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return '/placeholder.jpg';
  const clean = url.trim();
  if (!clean) return '/placeholder.jpg';
  if (clean.includes('-md.webp')) return clean;
  if (clean.endsWith('.webp')) {
    return clean.replace(/\.webp$/, '-md.webp');
  }
  return clean;
}

export function FeaturedAlbumsSection({
  albums,
  totalAlbumsCount = 0,
}: FeaturedAlbumsSectionProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScrollRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    isDraggingRef.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pointerStartRef.current) return;
    const dx = Math.abs(e.clientX - pointerStartRef.current.x);
    const dy = Math.abs(e.clientY - pointerStartRef.current.y);
    if (dx > 8 || dy > 8) {
      isDraggingRef.current = true;
    }
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    if (isDraggingRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // Up to 5 featured albums on Homepage
  const displayedAlbums = Array.isArray(albums) ? albums.slice(0, 5) : [];

  // Sync activeIndex with IntersectionObserver (threshold: 0.6) for instant, lag-free dot tracking
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const cards = Array.from(carousel.children) as HTMLElement[];
    if (cards.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScrollRef.current) return;
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = cards.indexOf(entry.target as HTMLElement);
            if (index !== -1) {
              setActiveIndex(index);
            }
          }
        });
      },
      {
        root: carousel,
        threshold: 0.6,
      }
    );

    cards.forEach((card) => observer.observe(card));

    return () => {
      observer.disconnect();
    };
  }, [displayedAlbums.length]);

  const handleScroll = () => {
    if (!carouselRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 0) {
      const progress = (scrollLeft / maxScroll) * 100;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    }
  };

  const scrollToAlbum = (index: number) => {
    if (!carouselRef.current) return;
    setActiveIndex(index);
    isProgrammaticScrollRef.current = true;

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    const cards = carouselRef.current.children;
    if (cards[index]) {
      (cards[index] as HTMLElement).scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }

    scrollTimeoutRef.current = setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  if (displayedAlbums.length === 0) {
    return (
      <div className="text-center py-12 text-xs text-charcoal-600">
        Đang cập nhật các bộ sưu tập mới...
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-10">
      {/* =========================================================================
          1. MOBILE HORIZONTAL SNAP CAROUSEL (< md)
          - Vuốt ngang 1 chạm mượt mà, quán tính tự nhiên (không dùng scroll-smooth)
          - Chiều rộng 84vw max 340px căn giữa, hé lộ dải ảnh nghệ thuật mảnh
      ========================================================================= */}
      <div className="md:hidden">
        <div
          ref={carouselRef}
          onScroll={handleScroll}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          style={{ WebkitOverflowScrolling: 'touch' }}
          className="flex overflow-x-auto snap-x snap-mandatory gap-3.5 px-[8vw] pb-4 no-scrollbar touch-pan-x overscroll-x-contain -mx-4 sm:-mx-6"
        >
          {displayedAlbums.map((album, idx) => {
            const rawSrc =
              (typeof album?.coverImage === 'string' && album.coverImage.trim() ? album.coverImage.trim() : null) ||
              album?.photos?.[0]?.url ||
              album?.media?.[0]?.url ||
              '/placeholder.jpg';

            const coverImageSrc = getMediumImageUrl(rawSrc);
            const conceptText = album?.concept?.trim();

            return (
              <div
                key={album?.id || idx}
                className="shrink-0 w-[84vw] max-w-[340px] snap-center select-none"
              >
                <Link
                  href={`/bo-suu-tap/${album?.slug || ''}`}
                  onClick={handleLinkClick}
                  draggable={false}
                  aria-label={`Xem album ảnh cưới: ${album?.title || album?.coupleNames || 'Chi tiết'}`}
                  className="group block relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-md active:scale-[0.98] transition-all duration-300 bg-[#1E1C1A] select-none"
                >
                  <ProgressiveImage
                    src={coverImageSrc}
                    alt={album?.title || 'PlusMoments Wedding Album'}
                    aspectRatio="3/4"
                    priority={idx === 0}
                    sizes="(max-width: 640px) 84vw, 340px"
                    className="w-full h-full rounded-2xl"
                    imageClassName="object-cover group-hover:scale-105 transition-transform duration-700 ease-out pointer-events-none select-none"
                  />

                  {/* Lớp phủ chuyển sắc mượt mà ở đáy ảnh */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917]/90 via-[#1C1917]/35 via-45% to-transparent pointer-events-none" />

                  {/* Nội dung thông tin trên ảnh phong cách Editorial Art Card */}
                  <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col justify-end text-left z-10 pointer-events-none select-none">
                    {conceptText && (
                      <p className="text-[10px] tracking-[0.16em] uppercase text-[#E5C799] font-medium line-clamp-1 drop-shadow-sm">
                        {conceptText}
                      </p>
                    )}
                    {album?.coupleNames && (
                      <p className="text-xs text-white/85 font-normal mt-1 drop-shadow-sm">
                        {album.coupleNames}
                      </p>
                    )}
                    <h3 className="font-serif text-[19px] text-[#FAF7F2] font-normal leading-snug line-clamp-2 mt-0.5 group-hover:text-[#E5C799] transition-colors drop-shadow-sm">
                      {album?.title || ''}
                    </h3>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Thanh chỉ báo tiến độ & chấm chỉ báo trên Mobile */}
        {displayedAlbums.length > 1 && (
          <div className="flex flex-col items-center gap-2 mt-3">
            {/* Thanh tiến độ mảnh */}
            <div className="w-24 h-[1.5px] bg-[#E8E0D5] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#C59B6D] transition-all duration-200 rounded-full"
                style={{
                  width: `${100 / displayedAlbums.length}%`,
                  transform: `translateX(${(scrollProgress * (displayedAlbums.length - 1)) / 100 * 100}%)`,
                }}
              />
            </div>
            {/* Chấm chỉ báo với kích thước đích chạm (touch target) tối ưu SEO & Accessibility */}
            <div className="flex items-center justify-center gap-1.5 -my-1">
              {displayedAlbums.map((_, i) => {
                const isActive = activeIndex === i;
                return (
                  <button
                    key={`dot-${i}`}
                    type="button"
                    aria-label={`Chuyển tới album ${i + 1}`}
                    onClick={() => scrollToAlbum(i)}
                    className="touch-manipulation w-8 h-8 inline-flex items-center justify-center cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C59B6D] active:scale-90 transition-transform"
                  >
                    <span
                      className={`h-1.5 rounded-full transition-all duration-300 pointer-events-none ${
                        isActive ? 'w-5 bg-[#C59B6D]' : 'w-1.5 bg-[#E8E0D5]'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          2. DESKTOP EDITORIAL GRID (>= md)
          - Bố cục lưới cân đối: tối đa 3 album mỗi hàng, hàng cuối căn giữa (justify-center)
          - Hiệu ứng FloatingCard sang trọng, phóng nhẹ ảnh khi hover
      ========================================================================= */}
      <div className="hidden md:flex md:flex-wrap md:justify-center md:gap-7">
        {displayedAlbums.map((album, idx) => {
          const rawSrc =
            (typeof album?.coverImage === 'string' && album.coverImage.trim() ? album.coverImage.trim() : null) ||
            album?.photos?.[0]?.url ||
            album?.media?.[0]?.url ||
            '/placeholder.jpg';

          const coverImageSrc = getMediumImageUrl(rawSrc);
          const conceptText = album?.concept?.trim();

          return (
            <EditorialReveal
              key={album?.id || idx}
              delay={(idx % 3) * 80}
              className="w-full md:w-[calc(33.333%-1.25rem)] max-w-[380px]"
            >
              <FloatingCard
                delay={idx * 0.15}
                reverse={idx % 2 === 1}
                className="group h-full"
              >
                <Link
                  href={`/bo-suu-tap/${album?.slug || ''}`}
                  aria-label={`Xem album ảnh cưới: ${album?.title || album?.coupleNames || 'Chi tiết'}`}
                  className="group/card block relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 bg-[#1E1C1A]"
                >
                  <ProgressiveImage
                    src={coverImageSrc}
                    alt={album?.title || 'PlusMoments Wedding Album'}
                    aspectRatio="3/4"
                    priority={idx < 2}
                    sizes="(max-width: 1024px) 33vw, 420px"
                    className="w-full h-full rounded-2xl"
                    imageClassName="object-cover group-hover/card:scale-105 transition-transform duration-700 ease-out select-none pointer-events-none"
                  />

                  {/* Lớp phủ chuyển sắc mượt mà ở đáy ảnh */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917]/90 via-[#1C1917]/35 via-45% to-transparent pointer-events-none" />

                  {/* Nội dung thông tin trên ảnh phong cách Editorial Art Card */}
                  <div className="absolute inset-x-0 bottom-0 p-5 lg:p-6 flex flex-col justify-end text-left z-10">
                    {conceptText && (
                      <p className="text-[10px] tracking-[0.16em] uppercase text-[#E5C799] font-medium line-clamp-1 drop-shadow-sm">
                        {conceptText}
                      </p>
                    )}
                    {album?.coupleNames && (
                      <p className="text-xs text-white/85 font-normal mt-1 drop-shadow-sm">
                        {album.coupleNames}
                      </p>
                    )}
                    <h3 className="font-serif text-lg lg:text-xl text-[#FAF7F2] font-normal leading-snug line-clamp-2 mt-0.5 group-hover/card:text-[#E5C799] transition-colors drop-shadow-sm">
                      {album?.title || ''}
                    </h3>
                  </div>
                </Link>
              </FloatingCard>
            </EditorialReveal>
          );
        })}
      </div>

      {/* =========================================================================
          3. NÚT HÀNH ĐỘNG TỐI GIẢN TINH TẾ
      ========================================================================= */}
      <div className="mt-8 sm:mt-12 text-center">
        <Link
          href="/bo-suu-tap"
          className="inline-flex items-center gap-2.5 px-6 sm:px-8 py-3 rounded-full text-xs sm:text-[13px] font-medium tracking-[0.18em] uppercase border border-[#C59B6D]/60 text-[#856740] bg-transparent hover:bg-[#1C1917] hover:text-[#E5C799] hover:border-[#1C1917] active:scale-95 transition-all duration-300 shadow-xs hover:shadow-md cursor-pointer group"
        >
          <span>Khám Phá Toàn Bộ Bộ Sưu Tập</span>
          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C5A880] group-hover:text-[#E5C799] transform group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  );
}

export default FeaturedAlbumsSection;
