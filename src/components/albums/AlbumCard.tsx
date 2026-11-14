'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
        className="flex flex-col h-full bg-white p-4 rounded-2xl shadow-luxury hover:shadow-luxury-hover border border-champagne-dark/30 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880] focus-visible:ring-offset-2"
      >
        <div className="relative aspect-[4/5] w-full rounded-xl overflow-hidden mb-4 bg-[#F3EFEA]">
          <Image
            src={originalSrc}
            alt={album.title || 'PlusMoments Album'}
            fill
            priority={priority}
            fetchPriority={priority ? 'high' : 'auto'}
            onError={() => setHasError(true)}
            quality={70}
            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 420px"
            className="object-cover opacity-100 group-hover:scale-105 transition-all duration-700 ease-out select-none pointer-events-none"
          />
          {album.concept && (
            <div className="absolute top-3 left-3 px-3 py-1 bg-charcoal-900/80 backdrop-blur-sm rounded-full text-[10px] tracking-widest uppercase text-champagne-light font-medium">
              {album.concept}
            </div>
          )}
          {album.location && (
            <div className="absolute bottom-3 right-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[11px] font-mono text-charcoal-800">
              {album.location}
            </div>
          )}
        </div>

        <div className="space-y-1.5 px-2 pb-1 mt-auto">
          <div className="flex items-center justify-between text-xs text-[#7A6243]">
            <span className="font-medium tracking-wide">{album.coupleNames}</span>
            <span className="text-charcoal-600 text-[11px] group-hover:text-[#7A6243] transition-colors">
              Xem album →
            </span>
          </div>
          <h2 className="font-serif text-lg text-charcoal-900 font-light group-hover:text-luxury-600 transition-colors line-clamp-1">
            {album.title}
          </h2>
          <p className="text-xs text-charcoal-500 line-clamp-2 font-light">
            {album.subtitle || album.description}
          </p>
        </div>
      </Link>
    </FloatingCard>
  );
}

export default AlbumCard;
