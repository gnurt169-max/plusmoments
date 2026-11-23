'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Heart, MapPin } from 'lucide-react';
import { ProgressiveImage } from '@/components/ui/ProgressiveImage';

export interface SideRailNextStory {
  title: string;
  slug: string;
  coupleNames?: string | null;
  location?: string | null;
  concept?: string | null;
  coverImage?: string | null;
  categoryName?: string;
}

interface AlbumRightRailProps {
  nextStory?: SideRailNextStory | null;
}

export function AlbumRightRail({ nextStory }: AlbumRightRailProps) {
  return (
    <aside className="hidden xl:block w-[230px] sticky top-28 self-start h-fit z-10">
      {nextStory ? (
        <div className="bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl p-4 shadow-xs space-y-3 hover:shadow-md transition-shadow">
          {/* Header label */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#8C6D46] font-semibold">
              TIẾP THEO
            </span>
            <span className="text-[9px] text-stone-400 uppercase font-mono truncate max-w-[120px]">
              {nextStory.categoryName || 'Album Mới'}
            </span>
          </div>

          {/* Thumbnail locked aspect 3/4 with face preservation */}
          {nextStory.coverImage && (
            <Link
              href={`/bo-suu-tap/${nextStory.slug}`}
              className="group block relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-stone-200"
            >
              <ProgressiveImage
                src={nextStory.coverImage}
                alt={nextStory.title}
                aspectRatio="3/4"
                orientation="portrait"
                objectPosition="object-[50%_18%]"
                sizes="230px"
                className="w-full h-full"
                imageClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                <span className="text-[10px] font-medium text-white flex items-center gap-1">
                  <span>Xem album</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          )}

          {/* Title & Info */}
          <div>
            <Link
              href={`/bo-suu-tap/${nextStory.slug}`}
              className="font-serif text-sm font-medium text-stone-900 hover:text-amber-800 transition-colors line-clamp-2 leading-snug"
            >
              {nextStory.title}
            </Link>

            {nextStory.coupleNames && (
              <div className="text-[11px] text-stone-500 font-light mt-1 flex items-center gap-1 line-clamp-1">
                <Heart className="w-3 h-3 text-rose-500 fill-rose-500/20 shrink-0" />
                <span>{nextStory.coupleNames}</span>
              </div>
            )}

            {nextStory.location && (
              <div className="text-[10px] text-stone-400 mt-0.5 flex items-center gap-1 line-clamp-1">
                <MapPin className="w-2.5 h-2.5 shrink-0" />
                <span>{nextStory.location}</span>
              </div>
            )}
          </div>

          {/* Link CTA */}
          <div className="pt-2 border-t border-stone-200/80">
            <Link
              href={`/bo-suu-tap/${nextStory.slug}`}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-900 hover:text-amber-950 transition-colors"
            >
              <span>Khám phá ngay</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl p-4 shadow-xs text-center space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500">
            Bộ Sưu Tập Cưới
          </span>
          <p className="text-xs text-stone-700 leading-relaxed font-light">
            Khám phá thêm hàng chục bộ ảnh cưới lộng lẫy tại TP.HCM và Đà Lạt.
          </p>
          <Link
            href="/bo-suu-tap"
            className="inline-block text-[11px] font-semibold text-amber-900 hover:underline pt-1"
          >
            Xem tất cả bộ sưu tập &rarr;
          </Link>
        </div>
      )}
    </aside>
  );
}
