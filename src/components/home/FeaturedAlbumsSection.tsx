'use client';

import React from 'react';
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
  // Up to 6 featured albums on Homepage (2x2 or 2x3 on Mobile, 3x2 on Tablet & Desktop)
  const displayedAlbums = Array.isArray(albums) ? albums.slice(0, 6) : [];

  if (displayedAlbums.length === 0) {
    return (
      <div className="text-center py-12 text-xs text-charcoal-600">
        Đang cập nhật các bộ sưu tập mới...
      </div>
    );
  }

  return (
    <div className="space-y-8 sm:space-y-12">
      {/* =========================================================================
          1. MOBILE 2-COLUMN DIRECT EDITORIAL GRID (< md)
          - Hiển thị trực diện 4 - 6 bộ sưu tập nổi bật (2 cột x 2 hoặc 3 hàng)
          - Khóa cứng tỷ lệ dọc 3:4, giữ trọn góc mặt nhân vật với object-[50%_18%]
          - Lớp phủ gradient đáy mềm mại và typography gọn gàng sắc nét
      ========================================================================= */}
      <div className="grid grid-cols-2 gap-3.5 md:hidden">
        {displayedAlbums.map((album, idx) => {
          const rawSrc =
            (typeof album?.coverImage === 'string' && album.coverImage.trim() ? album.coverImage.trim() : null) ||
            album?.photos?.[0]?.url ||
            album?.media?.[0]?.url ||
            '/placeholder.jpg';

          const coverImageSrc = getMediumImageUrl(rawSrc);
          const topLabel = album?.coupleNames?.trim() || album?.concept?.trim() || 'PlusMoments';

          return (
            <div key={album?.id || idx} className="w-full">
              <Link
                href={`/bo-suu-tap/${album?.slug || ''}`}
                aria-label={`Xem album ảnh cưới: ${album?.title || album?.coupleNames || 'Chi tiết'}`}
                className="group block relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-md active:scale-[0.98] transition-all duration-300 bg-[#1E1C1A]"
              >
                <ProgressiveImage
                  src={coverImageSrc}
                  alt={album?.title || 'PlusMoments Wedding Album'}
                  aspectRatio="3/4"
                  orientation="portrait"
                  objectPosition="object-[50%_18%]"
                  priority={idx < 2}
                  sizes="(max-width: 768px) 50vw, 320px"
                  className="w-full h-full rounded-2xl"
                  imageClassName="object-cover group-hover:scale-105 transition-transform duration-700 ease-out pointer-events-none select-none"
                />

                {/* Lớp phủ chuyển sắc mượt mà ở đáy ảnh */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

                {/* Nội dung thông tin trên ảnh phong cách Editorial Art Card */}
                <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 flex flex-col justify-end text-left z-10 pointer-events-none select-none">
                  <p className="text-[9px] sm:text-[11px] uppercase tracking-[0.16em] text-[#E5C585] font-medium truncate drop-shadow-sm">
                    {topLabel}
                  </p>
                  <h3 className="font-serif text-[13px] sm:text-base leading-snug text-white line-clamp-2 mt-0.5 group-hover:text-[#E5C799] transition-colors drop-shadow-sm">
                    {album?.title || ''}
                  </h3>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {/* =========================================================================
          2. TABLET & DESKTOP EDITORIAL GRID (>= md)
          - Bố cục lưới 3 cột cân đối, trang nhã (md:grid-cols-3 gap-5 lg:gap-6)
          - Hiệu ứng FloatingCard sang trọng, chuyển động lơ lửng nhẹ
      ========================================================================= */}
      <div className="hidden md:grid md:grid-cols-3 gap-5 lg:gap-6">
        {displayedAlbums.map((album, idx) => {
          const rawSrc =
            (typeof album?.coverImage === 'string' && album.coverImage.trim() ? album.coverImage.trim() : null) ||
            album?.photos?.[0]?.url ||
            album?.media?.[0]?.url ||
            '/placeholder.jpg';

          const coverImageSrc = getMediumImageUrl(rawSrc);
          const topLabel = album?.coupleNames?.trim() || album?.concept?.trim() || 'PlusMoments';

          return (
            <EditorialReveal
              key={album?.id || idx}
              delay={(idx % 3) * 80}
              className="w-full"
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
                    orientation="portrait"
                    objectPosition="object-[50%_18%]"
                    priority={idx < 3}
                    sizes="(max-width: 1024px) 33vw, 420px"
                    className="w-full h-full rounded-2xl"
                    imageClassName="object-cover group-hover/card:scale-105 transition-transform duration-700 ease-out select-none pointer-events-none"
                  />

                  {/* Lớp phủ chuyển sắc mượt mà ở đáy ảnh */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

                  {/* Nội dung thông tin trên ảnh phong cách Editorial Art Card */}
                  <div className="absolute inset-x-0 bottom-0 p-5 lg:p-6 flex flex-col justify-end text-left z-10">
                    <p className="text-[11px] tracking-[0.16em] uppercase text-[#E5C585] font-medium truncate drop-shadow-sm">
                      {topLabel}
                    </p>
                    <h3 className="font-serif text-lg lg:text-xl text-white font-normal leading-snug line-clamp-2 mt-0.5 group-hover/card:text-[#E5C799] transition-colors drop-shadow-sm">
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
