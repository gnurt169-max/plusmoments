'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Film } from 'lucide-react';
import { FloatingCard } from '@/components/motion/FloatingCard';

export interface AlbumCardData {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  coupleNames?: string | null;
  concept?: string | null;
  location?: string | null;
  coverImage?: string | null;
  videoUrl?: string | null;
  blurDataUrl?: string | null;
  photos?: { url: string; blurDataUrl?: string | null }[];
  media?: { url: string; blurDataUrl?: string | null }[];
}

export interface AlbumCardProps {
  album: AlbumCardData;
  priority?: boolean;
  idx?: number;
}

export function AlbumCard({ album, priority = false, idx = 0 }: AlbumCardProps) {
  const [hasError, setHasError] = useState(false);

  const rawSrc =
    (typeof album?.coverImage === 'string' && album.coverImage.trim() ? album.coverImage.trim() : null) ||
    album?.photos?.[0]?.url ||
    album?.media?.[0]?.url ||
    '/placeholder.jpg';

  const originalSrc = hasError ? '/placeholder.jpg' : rawSrc;

  return (
    <FloatingCard
      delay={idx * 0.15}
      reverse={idx % 2 === 1}
      className="group h-full"
    >
      <Link
        href={`/bo-suu-tap/${album.slug}`}
        aria-label={`Xem album ảnh cưới: ${album.title || album.coupleNames}`}
        className="flex flex-col h-full bg-white p-2.5 sm:p-4 rounded-xl sm:rounded-2xl shadow-luxury hover:shadow-luxury-hover border border-champagne-dark/30 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880] focus-visible:ring-offset-2"
      >
        <div className="relative aspect-[3/4] w-full rounded-lg sm:rounded-xl overflow-hidden mb-2 sm:mb-4 bg-[#F3EFEA]">
          <Image
            src={originalSrc}
            alt={album.title || 'PlusMoments Album'}
            fill
            priority={priority}
            fetchPriority={priority ? 'high' : 'auto'}
            onError={() => setHasError(true)}
            quality={75}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 420px"
            className="object-cover opacity-100 group-hover:scale-105 transition-all duration-700 ease-out select-none pointer-events-none"
          />
          {album.concept && (
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 px-2 sm:px-3 py-0.5 sm:py-1 bg-charcoal-900/80 backdrop-blur-sm rounded-full text-[9px] sm:text-[10px] tracking-widest uppercase text-champagne-light font-medium line-clamp-1 max-w-[85%]">
              {album.concept}
            </div>
          )}
          {album.videoUrl && (
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 px-1.5 sm:px-2.5 py-0.5 sm:py-1 bg-black/75 backdrop-blur-md rounded-full text-[9px] sm:text-[10px] tracking-wider uppercase font-semibold text-amber-300 flex items-center gap-1 border border-amber-500/30 shadow-md">
              <Film className="w-2.5 h-2.5 text-amber-400 shrink-0" />
              <span className="hidden sm:inline">Video 4K</span>
            </div>
          )}
          {album.location && (
            <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 px-2 sm:px-3 py-0.5 sm:py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] sm:text-[11px] font-mono text-charcoal-800 line-clamp-1 max-w-[90%] shadow-xs">
              {album.location}
            </div>
          )}
        </div>

        <div className="space-y-1 sm:space-y-1.5 px-1 sm:px-2 pb-0.5 sm:pb-1 mt-auto">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-[#8C6D46]">
            <span className="font-medium tracking-wide truncate max-w-[85%] sm:max-w-none">
              {album.coupleNames}
            </span>
            <span className="text-charcoal-600 text-[11px] hidden sm:inline group-hover:text-[#7A6243] transition-colors">
              Xem album →
            </span>
          </div>
          <h2 className="font-serif text-sm sm:text-lg text-charcoal-900 font-semibold sm:font-light leading-snug group-hover:text-luxury-600 transition-colors line-clamp-2">
            {album.title}
          </h2>
          {(album.subtitle || album.description) && (
            <p className="text-xs text-charcoal-500 hidden sm:line-clamp-2 font-light">
              {album.subtitle || album.description}
            </p>
          )}
        </div>
      </Link>
    </FloatingCard>
  );
}

export default AlbumCard;
