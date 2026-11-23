'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, CheckCircle2, Heart, MapPin, Tag } from 'lucide-react';
import { ProgressiveImage } from '@/components/ui/ProgressiveImage';
import { formatVND } from '@/lib/utils';

export interface SideRailPackage {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number | null;
  unit?: string;
  subtitle?: string | null;
  highlightPoints?: string | string[] | null;
  category?: string | null;
}

export interface SideRailNextStory {
  title: string;
  slug: string;
  coupleNames?: string | null;
  location?: string | null;
  concept?: string | null;
  coverImage?: string | null;
  categoryName?: string;
}

interface AlbumSideRailsProps {
  packageData?: SideRailPackage | null;
  nextStory?: SideRailNextStory | null;
  targetBottomSectionId?: string; // ID of the bottom section where left rail should hide
}

export function AlbumSideRails({
  packageData,
  nextStory,
  targetBottomSectionId = 'linked-package-section',
}: AlbumSideRailsProps) {
  const [isBottomPackageVisible, setIsBottomPackageVisible] = useState(false);

  // Monitor the bottom package / consultation section to auto-hide the left rail
  useEffect(() => {
    if (!targetBottomSectionId) return;

    const targetEl = document.getElementById(targetBottomSectionId);
    if (!targetEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsBottomPackageVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '100px 0px 0px 0px',
      }
    );

    observer.observe(targetEl);
    return () => observer.disconnect();
  }, [targetBottomSectionId]);

  // Parse highlights
  const highlights: string[] = React.useMemo(() => {
    if (!packageData?.highlightPoints) return [];
    if (Array.isArray(packageData.highlightPoints)) {
      return packageData.highlightPoints.slice(0, 3);
    }
    try {
      const parsed = JSON.parse(packageData.highlightPoints);
      return Array.isArray(parsed) ? parsed.slice(0, 3) : [];
    } catch {
      return [String(packageData.highlightPoints)].slice(0, 3);
    }
  }, [packageData?.highlightPoints]);

  return (
    <>
      {/* ========================================================= */}
      {/* 1. LEFT SIDE RAIL: USED SERVICE PACKAGE (STICKY TOP-28) */}
      {/* ========================================================= */}
      <aside className="hidden xl:block col-span-1 sticky top-28 self-start transition-all duration-500 z-20">
        {packageData ? (
          <div
            className={`transition-all duration-500 transform ${
              isBottomPackageVisible
                ? 'opacity-0 -translate-x-4 pointer-events-none'
                : 'opacity-100 translate-x-0'
            }`}
          >
            <div className="bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl p-5 shadow-xs space-y-3.5 hover:shadow-md transition-shadow">
              {/* Badge */}
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold bg-amber-900/10 text-amber-900">
                  <Tag className="w-3 h-3" />
                  <span>Gói Thực Hiện</span>
                </span>
              </div>

              {/* Package Name & Subtitle */}
              <div>
                <h3 className="font-serif text-lg font-normal text-stone-900 line-clamp-1">
                  {packageData.name}
                </h3>
                {packageData.subtitle && (
                  <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5 font-light leading-relaxed">
                    {packageData.subtitle}
                  </p>
                )}
              </div>

              {/* Price */}
              <div className="pt-2 border-t border-stone-200/80">
                <div className="text-[10px] uppercase tracking-wider text-stone-400 font-mono">
                  Chi phí trọn gói
                </div>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="font-mono text-lg font-bold text-amber-900">
                    {formatVND(packageData.price)}
                  </span>
                  {packageData.unit && (
                    <span className="text-[11px] text-stone-500">{packageData.unit}</span>
                  )}
                </div>
                {packageData.originalPrice && packageData.originalPrice > packageData.price && (
                  <div className="text-[11px] text-stone-400 line-through font-mono">
                    {formatVND(packageData.originalPrice)}
                  </div>
                )}
              </div>

              {/* Top 3 Highlights */}
              {highlights.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-stone-200/80 text-[11px] text-stone-700 font-light">
                  {highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-1.5 leading-snug">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{h}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2">
                <a
                  href="#consultation-section"
                  className="w-full h-9 rounded-xl bg-amber-900 hover:bg-amber-950 text-white text-[11px] font-semibold tracking-wider uppercase flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Sparkles className="w-3 h-3 text-amber-200" />
                  <span>Tư Vấn Gói Này</span>
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl p-4 shadow-xs text-center space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500">
              Concept Độc Bản
            </span>
            <p className="text-xs text-stone-700 leading-relaxed font-light">
              Mỗi bộ ảnh tại PlusMoments được thiết kế ánh sáng và phong cách may đo riêng.
            </p>
            <a
              href="#consultation-section"
              className="inline-block text-[11px] font-semibold text-amber-900 hover:underline pt-1"
            >
              Nhận tư vấn concept &rarr;
            </a>
          </div>
        )}
      </aside>

      {/* ========================================================= */}
      {/* 2. RIGHT SIDE RAIL: NEXT STORY / POST (STICKY TOP-28) */}
      {/* ========================================================= */}
      <aside className="hidden xl:block col-span-1 sticky top-28 self-start z-20">
        {nextStory ? (
          <div className="bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl p-4 shadow-xs space-y-3 hover:shadow-md transition-shadow">
            {/* Header label */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#8C6D46] font-semibold flex items-center gap-1">
                <span>TIẾP THEO</span>
              </span>
              <span className="text-[9px] text-stone-400 uppercase font-mono">
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
                  sizes="240px"
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
                className="font-serif text-sm font-normal text-stone-900 hover:text-amber-800 transition-colors line-clamp-2 leading-snug"
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
    </>
  );
}

export default AlbumSideRails;
