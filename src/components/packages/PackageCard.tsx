'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Sparkles, Eye, ArrowRight } from 'lucide-react';
import { formatVND } from '@/lib/utils';
import { extractPackageHighlights } from '@/lib/package-features';
import type { PricingPackageData } from '@/components/pricing/LuxuryPricingSection';

export interface PackageCardProps {
  pkg: PricingPackageData & { blurDataUrl?: string | null };
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
  const [hasError, setHasError] = useState(false);

  // 3-4 Điểm nhấn cốt lõi từ DB (highlightPoints) hoặc fallback 3 mục đầu của inclusions
  const highlights = extractPackageHighlights(pkg);

  const rawCover = pkg.coverImage && pkg.coverImage.trim() ? pkg.coverImage.trim() : '';
  const coverImg = hasError ? '/placeholder.jpg' : rawCover;

  const numericPrice = typeof pkg.price === 'number' ? pkg.price : Number(pkg.price) || 0;
  const formattedNumber = new Intl.NumberFormat('vi-VN').format(numericPrice);

  const numericOriginalPrice = pkg.originalPrice ? Number(pkg.originalPrice) : null;
  const formattedOriginalPrice = numericOriginalPrice
    ? new Intl.NumberFormat('vi-VN').format(numericOriginalPrice)
    : null;

  const discountPercent =
    numericOriginalPrice && numericOriginalPrice > numericPrice
      ? Math.round(((numericOriginalPrice - numericPrice) / numericOriginalPrice) * 100)
      : null;

  const pointerStartRef = React.useRef<{ x: number; y: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    // Nếu tương tác trực tiếp lên nút con bên trong thì để nút con xử lý
    if ((e.target as HTMLElement).closest('button')) return;
    if (!pointerStartRef.current) return;
    const dx = Math.abs(e.clientX - pointerStartRef.current.x);
    const dy = Math.abs(e.clientY - pointerStartRef.current.y);
    pointerStartRef.current = null;
    // Chỉ kích hoạt mở Modal khi độ dịch chuyển ngón tay < 8px (tap chuẩn, không phải vuốt)
    if (dx < 8 && dy < 8) {
      onSelect?.(pkg);
    }
  };

  return (
    <article
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      className={`group relative rounded-3xl overflow-hidden flex flex-col w-full h-full transition-all duration-300 border cursor-pointer select-none bg-[#FAF8F5] border-[#E8E2D9] shadow-sm md:hover:shadow-2xl md:hover:-translate-y-1.5 ${
        pkg.isPopular
          ? 'ring-2 ring-amber-500/40 border-amber-500/50 shadow-md'
          : 'md:hover:border-amber-400/60'
      }`}
    >
      {/* 1. COVER IMAGE */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/11] md:aspect-[4/3] shrink-0 overflow-hidden bg-[#F3EFEA]">
        {coverImg ? (
          <Image
            src={coverImg}
            alt={pkg.name}
            fill
            priority={priority}
            fetchPriority={priority ? 'high' : 'auto'}
            onError={() => setHasError(true)}
            quality={65}
            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 420px"
            className="object-cover opacity-100 group-hover:scale-105 transition-all duration-700 ease-out select-none pointer-events-none"
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
          <h3 className="font-serif text-xl sm:text-2xl font-light text-white drop-shadow-sm group-hover:text-amber-200 transition-colors">
            {pkg.name}
          </h3>
        </div>
      </div>

      {/* 2. BODY CONTENT */}
      <div className="p-4 sm:p-6 md:p-7 flex-1 flex flex-col justify-between space-y-4 sm:space-y-5 md:space-y-6">
        {/* Pricing Display */}
        <div className="pb-3 sm:pb-4 border-b border-[#E8E2D9]/80 flex items-baseline justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-stone-600 font-medium block">
              Giá trọn gói ưu đãi
            </span>
            <div className="flex items-baseline">
              <span className="font-serif text-2xl sm:text-3xl font-light text-amber-900 font-semibold tabular-nums tracking-normal">
                {formattedNumber}
              </span>
              <span className="ml-1 text-base sm:text-lg font-sans font-semibold text-amber-800">
                đ
              </span>
              <span className="text-xs text-stone-600 ml-1">/{pkg.unit}</span>
            </div>
          </div>
          {formattedOriginalPrice && (
            <div className="flex flex-col items-end gap-1">
              {discountPercent !== null && discountPercent > 0 && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-600 border border-rose-200">
                  -{discountPercent}%
                </span>
              )}
              <span className="text-xs text-stone-600 line-through font-mono">
                {formattedOriginalPrice} đ
              </span>
            </div>
          )}
        </div>

        {/* Điểm nhấn cốt lõi gói dịch vụ (Chỉ hiển thị khi có dữ liệu thật trong DB) */}
        {highlights.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-[#7A6243]">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
              <span>ĐIỂM NHẤN CỐT LÕI:</span>
            </div>
            <ul className="space-y-1.5 text-xs sm:text-sm text-[#4A4036]">
              {highlights.slice(0, 3).map((feat: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <span
                    aria-hidden="true"
                    className="text-[#C5A880] font-semibold shrink-0 leading-5"
                  >
                    ✓
                  </span>
                  <span className="line-clamp-2 leading-relaxed">{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 3. CARD FOOTER BUTTON */}
        <div className="mt-auto pt-3 sm:pt-4 border-t border-[#E8E2D9]/80">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(pkg);
            }}
            aria-label={`Xem chi tiết và đặt lịch gói ${pkg.name}`}
            className="w-full py-2.5 sm:py-3 px-4 rounded-xl text-xs uppercase tracking-wider font-semibold text-white bg-[#2E2824] hover:bg-[#1A1614] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm group-hover:shadow-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880] focus-visible:ring-offset-2 select-none"
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
