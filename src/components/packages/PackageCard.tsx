'use client';

import React from 'react';
import { SafeImage } from '@/components/common/SafeImage';
import { Sparkles, Eye, ArrowRight, ShieldCheck } from 'lucide-react';
import { formatVND } from '@/lib/utils';
import type { PricingPackageData } from '@/components/pricing/LuxuryPricingSection';

export interface PackageCardProps {
  pkg: PricingPackageData;
  priority?: boolean;
  isSummary?: boolean;
  onSelect?: (pkg: PricingPackageData) => void;
}

export function PackageCard({
  pkg,
  priority = false,
  isSummary = false,
  onSelect,
}: PackageCardProps) {
  // Parse real highlights from Database (highlightPoints or inclusions)
  let highlights: string[] = [];
  try {
    if (pkg.highlightPoints) {
      const parsed = JSON.parse(pkg.highlightPoints);
      if (Array.isArray(parsed) && parsed.length > 0) highlights = parsed;
    }
  } catch {
    // ignore
  }

  if (highlights.length === 0 && pkg.inclusions) {
    try {
      const parsed = JSON.parse(pkg.inclusions);
      if (Array.isArray(parsed)) highlights = parsed;
    } catch {
      highlights = pkg.inclusions
        .split('\n')
        .map((s) => s.replace(/^[•\-\*]\s*/, '').trim())
        .filter(Boolean);
    }
  }

  const coverImg = pkg.coverImage && pkg.coverImage.trim() ? pkg.coverImage.trim() : '';

  return (
    <article
      onClick={() => onSelect?.(pkg)}
      className={`group relative rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 border cursor-pointer select-none bg-[#FAF8F5] border-[#E8E2D9] shadow-sm hover:shadow-2xl hover:-translate-y-1.5 ${
        pkg.isPopular
          ? 'ring-2 ring-amber-500/40 border-amber-500/50 shadow-md'
          : 'hover:border-amber-400/60'
      }`}
    >
      {/* 1. COVER IMAGE */}
      <div className="relative w-full aspect-[4/3] shrink-0 overflow-hidden bg-[#1E1C1A]">
        {coverImg ? (
          <SafeImage
            src={coverImg}
            alt={pkg.name}
            fill
            priority={priority}
            fetchPriority={priority ? 'high' : 'auto'}
            quality={65}
            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 420px"
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out select-none pointer-events-none"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#1E1C1A] text-stone-400">
            <Sparkles className="w-8 h-8 text-amber-500/40" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Popular Badge */}
        {(pkg.isPopular || pkg.isFeatured) && (
          <div className="absolute top-3.5 right-3.5 z-10 px-3 py-1 rounded-full bg-gradient-to-r from-amber-600 to-amber-800 text-white text-[10px] uppercase tracking-widest font-semibold shadow-md flex items-center gap-1.5 border border-amber-300/40">
            <Sparkles className="w-3 h-3 text-amber-200" />
            <span>{pkg.isPopular ? 'Lựa Chọn Nhiều Nhất' : 'Gói Tiêu Biểu'}</span>
          </div>
        )}

        {/* Title on cover */}
        <div className="absolute bottom-4 left-4 right-4 z-10 text-white">
          <h3 className="font-serif text-2xl font-light text-white drop-shadow-sm group-hover:text-amber-200 transition-colors">
            {pkg.name}
          </h3>
        </div>
      </div>

      {/* 2. BODY CONTENT */}
      <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-6">
        {/* Pricing Display */}
        <div className="pb-4 border-b border-[#E8E2D9]/80 flex items-baseline justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-stone-600 font-medium block">
              Giá trọn gói ưu đãi
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-2xl sm:text-3xl font-light text-amber-900 font-semibold">
                {formatVND(pkg.price)}
              </span>
              <span className="text-xs text-stone-600">/{pkg.unit}</span>
            </div>
          </div>
          {pkg.originalPrice && (
            <span className="text-xs text-stone-600 line-through font-mono">
              {formatVND(pkg.originalPrice)}
            </span>
          )}
        </div>

        {/* Danh sách đặc quyền - Chỉ hiển thị khi có dữ liệu thật trong DB */}
        {(() => {
          const rawFeatures = pkg.features && pkg.features.length > 0 ? pkg.features : highlights;
          const displayFeatures = isSummary ? rawFeatures.slice(0, 3) : rawFeatures;
          if (displayFeatures.length === 0) return null;
          return (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#7A6243]">
                <ShieldCheck className="w-4 h-4 text-[#C5A880] shrink-0" />
                <span>ĐẶC QUYỀN TRỌN GÓI:</span>
              </div>
              <ul
                className={`space-y-1.5 text-sm text-[#4A4036] ${
                  !isSummary
                    ? 'min-h-[160px] max-h-[320px] overflow-y-auto pr-1 custom-scrollbar'
                    : ''
                }`}
              >
                {displayFeatures.map((feat: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span
                      aria-hidden="true"
                      className="text-[#C5A880] font-semibold shrink-0 leading-5"
                    >
                      ✓
                    </span>
                    <span className={isSummary ? 'line-clamp-2' : ''}>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })()}

        {/* 3. CARD FOOTER BUTTON */}
        <div className="pt-4 border-t border-[#E8E2D9]/80">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(pkg);
            }}
            aria-label={`Xem chi tiết gói ${pkg.name} & đặt lịch`}
            className="w-full py-3 px-4 rounded-xl text-xs uppercase tracking-wider font-semibold text-white bg-[#2E2824] hover:bg-[#1A1614] transition-all flex items-center justify-center gap-2 shadow-sm group-hover:shadow-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880] focus-visible:ring-offset-2 after:absolute after:inset-0 after:content-['']"
          >
            <Eye className="w-3.5 h-3.5 text-amber-300" />
            <span>Xem Chi Tiết & Đặt Lịch</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-300 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </article>
  );
}

export default PackageCard;

