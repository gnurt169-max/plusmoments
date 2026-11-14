'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SafeImage } from '@/components/common/SafeImage';
import { FloatingCard } from '@/components/motion/FloatingCard';

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

  const displayedAlbums = Array.isArray(albums) ? albums.slice(0, 3) : [];

  if (displayedAlbums.length === 0) {
    return (
      <div className="text-center py-12 text-xs text-charcoal-600">
        Đang cập nhật các bộ sưu tập mới...
      </div>
    );
  }

  const handleScroll = () => {
    if (!carouselRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 0) {
      const progress = (scrollLeft / maxScroll) * 100;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
      const index = Math.round((scrollLeft / maxScroll) * (displayedAlbums.length - 1));
      setActiveIndex(index);
    }
  };

  const scrollToAlbum = (index: number) => {
    if (!carouselRef.current) return;
    const cards = carouselRef.current.children;
    if (cards[index]) {
      (cards[index] as HTMLElement).scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  };

  return (
    <div className="space-y-6 sm:space-y-10">
      {/* =========================================================================
          1. MOBILE HORIZONTAL SNAP CAROUSEL (< md)
          - Vuốt ngang mượt mà, hé lộ mép thẻ tiếp theo (80vw max 320px)
      ========================================================================= */}
      <div className="md:hidden">
        <div
          ref={carouselRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory gap-4 px-5 pb-4 no-scrollbar scroll-smooth -mx-4 sm:-mx-6"
        >
          {displayedAlbums.map((album, idx) => {
            const rawSrc =
              (typeof album?.coverImage === 'string' && album.coverImage.trim() ? album.coverImage.trim() : null) ||
              album?.photos?.[0]?.url ||
              album?.media?.[0]?.url ||
              '/placeholder.jpg';

            const coverImageSrc = getMediumImageUrl(rawSrc);

            const tagParts = [];
            if (album?.concept?.trim()) tagParts.push(album.concept.trim());
            if (album?.location?.trim()) tagParts.push(album.location.trim());
            const tagLine = tagParts.join(' • ');

            return (
              <div
                key={album?.id || idx}
                className="shrink-0 w-[80vw] max-w-[320px] snap-center select-none"
              >
                <Link
                  href={`/bo-suu-tap/${album?.slug || ''}`}
                  aria-label={`Xem album ảnh cưới: ${album?.title || album?.coupleNames || 'Chi tiết'}`}
                  className="group block relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-md active:scale-[0.98] transition-all duration-300 bg-[#1E1C1A]"
                >
                  <SafeImage
                    src={coverImageSrc}
                    alt={album?.title || 'PlusMoments Wedding Album'}
                    fill
                    quality={75}
                    sizes="(max-width: 640px) 80vw, 320px"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out pointer-events-none"
                  />

                  {/* Lớp phủ chuyển sắc mượt mà ở đáy ảnh */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917]/90 via-[#1C1917]/35 via-45% to-transparent pointer-events-none" />

                  {/* Nội dung thông tin trên ảnh phong cách Editorial Art Card */}
                  <div className="absolute inset-x-0 bottom-0 p-4 flex flex-col justify-end text-left z-10">
                    {tagLine && (
                      <p className="text-[10px] tracking-[0.18em] uppercase text-[#E5C799] font-medium line-clamp-1 drop-shadow-sm">
                        {tagLine}
                      </p>
                    )}
                    {album?.coupleNames && (
                      <p className="text-xs text-white/85 font-light tracking-wide mt-1 drop-shadow-sm">
                        {album.coupleNames}
                      </p>
                    )}
                    <h3 className="font-serif text-base text-[#FAF7F2] font-normal leading-snug line-clamp-2 mt-0.5 group-hover:text-[#E5C799] transition-colors drop-shadow-sm">
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
          <div className="flex flex-col items-center gap-2 mt-2">
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
            {/* Chấm chỉ báo tối giản */}
            <div className="flex items-center gap-1.5">
              {displayedAlbums.map((_, i) => (
                <button
                  key={`dot-${i}`}
                  type="button"
                  aria-label={`Chuyển tới album ${i + 1}`}
                  onClick={() => scrollToAlbum(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    activeIndex === i ? 'w-4 bg-[#C59B6D]' : 'w-1.5 bg-[#E8E0D5]'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          2. DESKTOP 3-COLUMN EDITORIAL GRID (>= md)
          - Hiệu ứng FloatingCard sang trọng, phóng nhẹ ảnh khi hover
      ========================================================================= */}
      <div className="hidden md:grid md:grid-cols-3 gap-6 lg:gap-8">
        {displayedAlbums.map((album, idx) => {
          const rawSrc =
            (typeof album?.coverImage === 'string' && album.coverImage.trim() ? album.coverImage.trim() : null) ||
            album?.photos?.[0]?.url ||
            album?.media?.[0]?.url ||
            '/placeholder.jpg';

          const coverImageSrc = getMediumImageUrl(rawSrc);

          const tagParts = [];
          if (album?.concept?.trim()) tagParts.push(album.concept.trim());
          if (album?.location?.trim()) tagParts.push(album.location.trim());
          const tagLine = tagParts.join(' • ');

          return (
            <FloatingCard
              key={album?.id || idx}
              delay={idx * 0.2}
              reverse={idx % 2 === 1}
              className="group h-full"
            >
              <Link
                href={`/bo-suu-tap/${album?.slug || ''}`}
                aria-label={`Xem album ảnh cưới: ${album?.title || album?.coupleNames || 'Chi tiết'}`}
                className="group/card block relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 bg-[#1E1C1A]"
              >
                <SafeImage
                  src={coverImageSrc}
                  alt={album?.title || 'PlusMoments Wedding Album'}
                  fill
                  quality={75}
                  sizes="(max-width: 1024px) 33vw, 420px"
                  className="object-cover group-hover/card:scale-105 transition-transform duration-700 ease-out select-none pointer-events-none"
                />

                {/* Lớp phủ chuyển sắc mượt mà ở đáy ảnh */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917]/90 via-[#1C1917]/35 via-45% to-transparent pointer-events-none" />

                {/* Nội dung thông tin trên ảnh phong cách Editorial Art Card */}
                <div className="absolute inset-x-0 bottom-0 p-5 lg:p-6 flex flex-col justify-end text-left z-10">
                  {tagLine && (
                    <p className="text-[10px] tracking-[0.18em] uppercase text-[#E5C799] font-medium line-clamp-1 drop-shadow-sm">
                      {tagLine}
                    </p>
                  )}
                  {album?.coupleNames && (
                    <p className="text-xs text-white/85 font-light tracking-wide mt-1 drop-shadow-sm">
                      {album.coupleNames}
                    </p>
                  )}
                  <h3 className="font-serif text-lg lg:text-xl text-[#FAF7F2] font-normal leading-snug line-clamp-2 mt-0.5 group-hover/card:text-[#E5C799] transition-colors drop-shadow-sm">
                    {album?.title || ''}
                  </h3>
                </div>
              </Link>
            </FloatingCard>
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
