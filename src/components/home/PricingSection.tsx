'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import dynamic from 'next/dynamic';
import { PackageCard } from '@/components/packages/PackageCard';
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const pillsRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScrollRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isSnapping, setIsSnapping] = useState(true);

  const handleScroll = () => {
    if (isProgrammaticScrollRef.current || !scrollRef.current || packages.length === 0) return;
    const container = scrollRef.current;
    const containerCenter = container.scrollLeft + container.offsetWidth / 2;
    const children = Array.from(container.children) as HTMLElement[];
    let closestIndex = 0;
    let minDistance = Infinity;

    children.forEach((child, idx) => {
      const childCenter = child.offsetLeft + child.offsetWidth / 2;
      const distance = Math.abs(containerCenter - childCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = idx;
      }
    });

    if (closestIndex !== activeIndex) {
      setActiveIndex(closestIndex);
      // Đồng bộ cuộn thanh Pill phía trên khi vuốt tay
      if (pillsRef.current) {
        const pills = pillsRef.current.querySelectorAll('button');
        if (pills && pills[closestIndex]) {
          (pills[closestIndex] as HTMLElement).scrollIntoView({
            behavior: 'smooth',
            inline: 'center',
            block: 'nearest',
          });
        }
      }
    }
  };

  const scrollToPackage = (index: number) => {
    if (index < 0 || index >= packages.length) return;

    // 1. Phản hồi tức thì 0ms cho UI & chặn onScroll ghi đè
    setActiveIndex(index);
    isProgrammaticScrollRef.current = true;
    setIsSnapping(false);

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // 2. Cuộn mượt thẻ gói dịch vụ vào giữa màn hình
    if (scrollRef.current) {
      const cards = scrollRef.current.children;
      if (cards && cards[index]) {
        (cards[index] as HTMLElement).scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest',
        });
      }
    }

    // 3. Cuộn mượt thanh Pill để gói đang chọn luôn trong tầm mắt
    if (pillsRef.current) {
      const pills = pillsRef.current.querySelectorAll('button');
      if (pills && pills[index]) {
        (pills[index] as HTMLElement).scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest',
        });
      }
    }

    // 4. Khôi phục lại trạng thái snap sau khi hoàn tất cuộn
    scrollTimeoutRef.current = setTimeout(() => {
      setIsSnapping(true);
      isProgrammaticScrollRef.current = false;
    }, 450);
  };

  // Reset activeIndex when packages change
  useEffect(() => {
    setActiveIndex(0);
  }, [packages]);

  // Dọn dẹp timer khi unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

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

      {/* QUICK PACKAGE JUMP PILLS ON MOBILE (< md) */}
      {packages.length > 1 && (
        <div
          ref={pillsRef}
          style={{ WebkitOverflowScrolling: 'touch' }}
          className="md:hidden flex items-center gap-2 overflow-x-auto no-scrollbar px-4 pb-4 mb-2 -mt-4 touch-pan-x overscroll-x-contain"
        >
          <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-500 shrink-0 mr-1 select-none">
            Gói:
          </span>
          {packages.map((pkg, idx) => {
            const isActive = activeIndex === idx;
            return (
              <button
                key={pkg.id || idx}
                type="button"
                onClick={() => scrollToPackage(idx)}
                aria-label={`Xem nhanh gói ${pkg.name}`}
                aria-pressed={isActive}
                className={`touch-manipulation min-h-[36px] px-4 py-1.5 rounded-full text-xs uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer shrink-0 border select-none active:scale-95 flex items-center justify-center font-medium ${
                  isActive
                    ? darkTheme
                      ? 'bg-[#E5C99B] text-[#1C1917] border-[#E5C99B] font-semibold shadow-sm'
                      : 'bg-[#1C1917] text-[#E5C799] border-[#C59B6D] font-semibold shadow-sm'
                    : darkTheme
                    ? 'bg-stone-800/90 text-stone-300 border-stone-700/80 hover:border-stone-500'
                    : 'bg-[#FAF7F2] text-[#57534E] border-[#E8E0D5] hover:border-amber-400'
                }`}
              >
                {pkg.name}
              </button>
            );
          })}
        </div>
      )}

      {/* 3-COLUMN LUXURY GRID (MAX 3 PER ROW) / MOBILE SNAP CAROUSEL */}
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
        <>
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            style={{ WebkitOverflowScrolling: 'touch' }}
            className={`flex md:flex-wrap md:justify-center items-stretch overflow-x-auto md:overflow-visible gap-4 md:gap-6 lg:gap-8 px-5 md:px-0 pb-4 no-scrollbar touch-pan-x overscroll-x-contain max-w-7xl mx-auto ${
              isSnapping ? 'snap-x snap-proximity md:snap-none' : ''
            }`}
          >
            {packages.map((pkg, index) => (
              <div
                key={pkg.id}
                className="shrink-0 w-[84vw] max-w-[340px] snap-center md:shrink md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1.34rem)] flex"
              >
                <PackageCard
                  pkg={pkg}
                  priority={index < 3}
                  isSummary={isSummary}
                  onSelect={(selected) => setSelectedPackage(selected)}
                />
              </div>
            ))}
          </div>

          {/* MOBILE CAROUSEL INDICATOR DOTS (< md) */}
          {packages.length > 1 && (
            <div className="flex md:hidden items-center justify-center gap-1 mt-3">
              {packages.map((pkg, idx) => {
                const isActive = activeIndex === idx;
                return (
                  <button
                    key={pkg.id || idx}
                    type="button"
                    onClick={() => scrollToPackage(idx)}
                    aria-label={`Chuyển tới gói ${pkg.name}`}
                    className="touch-manipulation w-9 h-9 flex items-center justify-center cursor-pointer p-0 focus:outline-none active:scale-90 transition-transform"
                  >
                    <span
                      className={`block rounded-full transition-all duration-300 ${
                        isActive
                          ? 'w-6 h-1.5 bg-[#E5C99B]'
                          : darkTheme
                          ? 'w-1.5 h-1.5 bg-stone-600/70'
                          : 'w-1.5 h-1.5 bg-stone-300'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </>
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


