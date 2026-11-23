'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Compass } from 'lucide-react';
import { ProgressiveImage } from '@/components/ui/ProgressiveImage';

export interface NextStoryTeaserProps {
  type: 'album' | 'blog';
  title: string;
  subtitle?: string | null;
  coverImage?: string | null;
  href: string;
  badge?: string | null;
  coupleNames?: string | null;
}

/**
 * NextStoryTeaser: Luxury Editorial Next Story Card for PlusMoments Studio.
 * - Sits gracefully at the end of Album or Blog articles before the consultation box.
 * - Prevents bounce-rate dropoff by providing an enticing editorial gateway to the next story.
 * - Uses ProgressiveImage with locked aspect ratio for zero layout shift.
 */
export function NextStoryTeaser({
  type,
  title,
  subtitle,
  coverImage,
  href,
  badge,
  coupleNames,
}: NextStoryTeaserProps) {
  const isAlbum = type === 'album';
  const ctaText = isAlbum ? 'Xem bộ sưu tập tiếp theo' : 'Đọc bài viết tiếp theo';
  const headerSubtitle = isAlbum
    ? 'Khám phá câu chuyện tình yêu tiếp theo'
    : 'Cẩm nang & cảm hứng cưới tiếp theo';

  return (
    <section className="pt-10 sm:pt-14 border-t border-champagne-dark/30">
      <div className="text-center space-y-1.5 mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5EE] border border-[#E5DFD5] text-[#8C6D46] text-[10px] sm:text-xs uppercase tracking-widest font-semibold">
          <Compass className="w-3.5 h-3.5" />
          <span>Hành Trình Tiếp Theo</span>
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl font-light text-charcoal-900">
          {headerSubtitle}
        </h2>
      </div>

      <Link
        href={href}
        className="group block relative w-full rounded-3xl overflow-hidden bg-white border border-[#E8E2D9] shadow-luxury hover:shadow-luxury-hover transition-all duration-500"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 items-center">
          {/* Cover Image Column (5 cols) */}
          <div className="md:col-span-5 relative w-full overflow-hidden bg-[#FAF8F5]">
            <div className="relative aspect-[16/10] md:aspect-[4/3] w-full overflow-hidden">
              <ProgressiveImage
                src={coverImage || '/placeholder.jpg'}
                alt={title}
                aspectRatio="16/10"
                aspectClassName="aspect-[16/10] md:aspect-[4/3]"
                priority={false}
                sizes="(max-width: 768px) 100vw, 480px"
                className="w-full h-full"
                imageClassName="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </div>
            {badge && (
              <span className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-full bg-charcoal-900/85 backdrop-blur-md text-[10px] tracking-wider uppercase text-amber-200 font-medium border border-amber-500/20">
                {badge}
              </span>
            )}
          </div>

          {/* Text & Action Column (7 cols) */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              {coupleNames && (
                <div className="flex items-center gap-1.5 text-xs text-[#8C6D46] font-medium tracking-wide">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>{coupleNames}</span>
                </div>
              )}

              <h3 className="font-serif text-xl sm:text-2xl text-charcoal-900 font-normal leading-snug group-hover:text-luxury-600 transition-colors line-clamp-2">
                {title}
              </h3>

              {subtitle && (
                <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed line-clamp-2">
                  {subtitle}
                </p>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between sm:justify-start gap-3">
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#8C6D46] text-white text-xs uppercase tracking-wider font-medium group-hover:bg-[#785934] transition-all shadow-sm">
                <span>{ctaText}</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </section>
  );
}

export default NextStoryTeaser;
