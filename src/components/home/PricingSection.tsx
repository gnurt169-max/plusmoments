'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import dynamic from 'next/dynamic';
import { PackageCard } from '@/components/packages/PackageCard';
import { EditorialReveal } from '@/components/ui/EditorialReveal';
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

  // Hiển thị đầy đủ toàn bộ các gói dịch vụ được xuất bản (không giới hạn take hay slice)
  const totalCount = totalPackagesCount || packages.length;

  return (
    <>
      {/* SECTION HEADER */}
      <div className="text-center max-w-3xl mx-auto space-y-3.5 mb-10 sm:mb-16 px-4">
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

      {/* PACKAGES GRID: VERTICAL STACK ON MOBILE (< md), 2-COL TABLET, 3-COL DESKTOP */}
      {packages.length === 0 ? (
        <div className="text-center py-16 bg-stone-900/40 rounded-3xl border border-dashed border-stone-800 max-w-xl mx-auto space-y-3">
          <Sparkles className="w-8 h-8 text-amber-500/60 mx-auto" />
          <p className="font-serif text-lg text-stone-300">
            Chưa có gói dịch vụ nào được cập nhật
          </p>
          <p className="text-xs text-stone-400">
            Vui lòng liên hệ Hotline để được tư vấn thiết kế gói riêng biệt.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 lg:gap-8 max-w-7xl mx-auto items-stretch">
          {packages.map((pkg, index) => (
            <EditorialReveal
              key={pkg.id}
              delay={(index % 3) * 80}
              className="w-full flex"
            >
              <PackageCard
                pkg={pkg}
                priority={index < 3}
                isSummary={isSummary}
                onSelect={(selected) => setSelectedPackage(selected)}
              />
            </EditorialReveal>
          ))}
        </div>
      )}

      {/* VIEW ALL PACKAGES & FAQ ROUTE BUTTON */}
      <div className="mt-12 sm:mt-16 text-center px-4">
        <Link
          href="/bang-gia"
          className={`inline-flex items-center gap-2.5 px-8 py-3.5 border rounded-full text-xs sm:text-sm tracking-wider uppercase font-medium shadow-2xs hover:shadow-md cursor-pointer transition-all duration-300 ${
            darkTheme
              ? 'border-[#E5C99B]/60 text-[#E5C99B] hover:border-white hover:text-white hover:bg-white/10'
              : 'border-[#7A6243] text-[#7A6243] hover:bg-[#7A6243] hover:text-white'
          }`}
        >
          <span>Khám Phá Chi Tiết Bảng Giá & Câu Hỏi Thường Gặp</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

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

export const PricingPackagesSection = PricingSection;
export default PricingSection;
