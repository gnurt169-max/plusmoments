'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Sparkles,
  Check,
  ArrowRight,
  Eye,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { formatVND } from '@/lib/utils';
import type { PricingPackageData } from '@/components/pricing/LuxuryPricingSection';

// Chỉ tải JS + CSS của Modal khi người dùng bấm mở
const PackageDetailModal = dynamic(
  () => import('@/components/common/PackageDetailModal'),
  { ssr: false }
);

export interface PricingSectionProps {
  packages: PricingPackageData[];
  totalPackagesCount?: number;
  title?: string;
  subtitle?: string;
  badge?: string;
  darkTheme?: boolean;
  isSummary?: boolean;
}

export function PricingSection({
  packages,
  totalPackagesCount,
  title = 'Bảng Giá Dịch Vụ Cưới Trọn Gói',
  subtitle = 'Cam kết không phát sinh chi phí. Toàn bộ gói chụp đã bao gồm trang phục cưới thiết kế, makeup nghệ thuật và xe đưa đón nội thành.',
  badge = 'Minh Bạch & Tối Ưu',
  darkTheme = false,
  isSummary = true,
}: PricingSectionProps) {
  const [selectedPackage, setSelectedPackage] = useState<PricingPackageData | null>(null);

  // Hiển thị tối đa 3 gói nổi bật nhất trên Trang Chủ
  const featuredPackages = packages.slice(0, 3);
  const totalCount = totalPackagesCount || packages.length;
  const hasMorePackages = totalCount > 3;

  return (
    <>
      {/* SECTION HEADER */}
      <div className="text-center max-w-3xl mx-auto space-y-3.5 mb-12 sm:mb-16 px-4">
        {badge && (
          <span
            className={`inline-block text-[11px] font-semibold uppercase tracking-[0.25em] px-4 py-1.5 rounded-full border ${
              darkTheme
                ? 'bg-stone-800/80 border-stone-700 text-amber-200'
                : 'bg-amber-100/60 border-amber-200 text-amber-900'
            }`}
          >
            {badge}
          </span>
        )}
        <h2
          className={`font-serif text-3xl sm:text-4xl md:text-5xl font-light ${
            darkTheme ? 'text-white' : 'text-charcoal-900'
          }`}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className={`text-xs sm:text-sm font-light leading-relaxed max-w-2xl mx-auto ${
              darkTheme ? 'text-stone-300' : 'text-charcoal-600'
            }`}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* 3-COLUMN LUXURY GRID / MOBILE SNAP CAROUSEL */}
      <div className="flex md:grid overflow-x-auto md:overflow-x-visible snap-x snap-mandatory scrollbar-none pb-6 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
        {featuredPackages.map((pkg) => {
          // Parse 4-5 bullet points
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

          if (highlights.length === 0) {
            highlights = [
              'Trang phục cưới cao cấp không giới hạn khu vực',
              'Makeup nghệ thuật & làm tóc theo từng bối cảnh',
              'Toàn bộ file gốc chất lượng cao bàn giao trong 24h',
              'Photobook mở phẳng 30 trang & ảnh cổng ép gỗ Luxury',
            ];
          }

          const coverImg = pkg.coverImage && pkg.coverImage.trim() ? pkg.coverImage.trim() : '';

          return (
            <article
              key={pkg.id}
              onClick={() => setSelectedPackage(pkg)}
              className={`group relative rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 border cursor-pointer select-none w-[86vw] sm:w-[360px] md:w-auto shrink-0 md:shrink snap-center snap-always bg-[#FAF8F5] border-[#E8E2D9] shadow-sm hover:shadow-2xl hover:-translate-y-1.5 ${
                pkg.isPopular
                  ? 'ring-2 ring-amber-500/40 border-amber-500/50 shadow-md'
                  : 'hover:border-amber-400/60'
              }`}
            >
                {/* 1. COVER IMAGE WITH FIXED HEIGHT */}
                <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-stone-200">
                  {coverImg ? (
                    <Image
                      src={coverImg}
                      alt={pkg.name}
                      fill
                      quality={80}
                      sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 384px"
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out select-none pointer-events-none"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-stone-200 text-stone-400">
                      <Sparkles className="w-8 h-8 text-amber-500/40" />
                    </div>
                  )}

                  {/* Gradient shadow overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                  {/* Popular/Featured Badge (Top Right) */}
                  {(pkg.isPopular || pkg.isFeatured) && (
                    <div className="absolute top-3.5 right-3.5 z-10 px-3 py-1 rounded-full bg-gradient-to-r from-amber-600 to-amber-800 text-white text-[10px] uppercase tracking-widest font-semibold shadow-md flex items-center gap-1.5 border border-amber-300/40">
                      <Sparkles className="w-3 h-3 text-amber-200" />
                      <span>{pkg.isPopular ? 'Lựa Chọn Nhiều Nhất' : 'Gói Tiêu Biểu'}</span>
                    </div>
                  )}

                  {/* Package Name overlay at bottom of cover */}
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
                      <span className="text-[10px] uppercase tracking-wider text-stone-400 font-medium block">
                        Giá trọn gói ưu đãi
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-serif text-2xl sm:text-3xl font-light text-amber-900 font-semibold">
                          {formatVND(pkg.price)}
                        </span>
                        <span className="text-xs text-stone-500">/{pkg.unit}</span>
                      </div>
                    </div>
                    {pkg.originalPrice && (
                      <span className="text-xs text-stone-400 line-through font-mono">
                        {formatVND(pkg.originalPrice)}
                      </span>
                    )}
                  </div>

                  {/* Đặc quyền gói (isSummary=true: 3 dòng tóm tắt; isSummary=false: toàn bộ) */}
                  {(() => {
                    const displayFeatures = isSummary
                      ? (pkg.features || highlights || []).slice(0, 3)
                      : (pkg.features || highlights || []);
                    return (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#8C7A6B]">
                          <ShieldCheck className="w-4 h-4 text-[#C5A880] shrink-0" />
                          <span>ĐẶC QUYỀN TRỌN GÓI:</span>
                        </div>
                        <ul className={`space-y-1.5 text-sm text-[#4A4036] ${!isSummary ? 'min-h-[160px] max-h-[320px] overflow-y-auto pr-1 custom-scrollbar' : ''}`}>
                          {displayFeatures.map((feat: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Check aria-hidden="true" className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                              <span className={isSummary ? "line-clamp-2" : ""}>{feat}</span>
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
                      onClick={() => setSelectedPackage(pkg)}
                      aria-label={`Xem chi tiết gói ${pkg.name} & đặt lịch`}
                      className="w-full py-3 px-4 rounded-xl text-xs uppercase tracking-wider font-semibold text-white bg-[#2E2824] hover:bg-[#1A1614] transition-all flex items-center justify-center gap-2 shadow-sm group-hover:shadow-md cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-300" />
                      <span>Xem Chi Tiết & Đặt Lịch</span>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-300 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

      {/* VIEW ALL PACKAGES ROUTE BUTTON */}
      {hasMorePackages && (
        <div className="mt-12 sm:mt-16 text-center px-4">
          <Link
            href="/bang-gia"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 border border-[#8C7A6B] text-[#8C7A6B] hover:bg-[#8C7A6B] hover:text-white transition-all duration-300 rounded-full text-xs sm:text-sm tracking-wider uppercase font-medium shadow-2xs hover:shadow-md cursor-pointer"
          >
            <span>Xem Tất Cả Các Gói Dịch Vụ ({totalCount})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* PACKAGE DETAIL & VIETQR CHECKOUT MODAL (Strictly conditional) */}
      {selectedPackage && (
        <PackageDetailModal
          packageData={selectedPackage}
          isOpen={!!selectedPackage}
          onClose={() => setSelectedPackage(null)}
        />
      )}
    </>
  );
}

export default PricingSection;

