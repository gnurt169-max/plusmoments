'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Sparkles } from 'lucide-react';
import { PackageCard } from '@/components/packages/PackageCard';
import type { PricingPackageData } from './LuxuryPricingSection';

// Dynamic load PackageDetailModal on demand
const PackageDetailModal = dynamic(
  () => import('@/components/common/PackageDetailModal'),
  { ssr: false }
);

export interface AllPackagesCatalogProps {
  packages: PricingPackageData[];
  isSummary?: boolean;
}

function formatCategoryLabel(cat: string): string {
  const norm = cat.trim().toUpperCase();
  if (norm === 'PRE_WEDDING' || norm === 'PRE-WEDDING') return 'Pre-Wedding';
  if (norm === 'STUDIO_CONCEPT' || norm === 'STUDIO-CONCEPT') return 'Studio Concept';
  if (norm === 'WEDDING_DAY' || norm === 'WEDDING-DAY') return 'Phóng Sự Ngày Cưới';
  return cat.trim();
}

export function AllPackagesCatalog({
  packages,
  isSummary = false,
}: AllPackagesCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPackage, setSelectedPackage] = useState<PricingPackageData | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    if (!scrollRef.current || filteredPackages.length === 0) return;
    const container = scrollRef.current;
    const scrollLeft = container.scrollLeft;
    const cardWidth = container.scrollWidth / filteredPackages.length;
    const idx = Math.min(
      filteredPackages.length - 1,
      Math.max(0, Math.round(scrollLeft / cardWidth))
    );
    setActiveIndex(idx);
  };

  const scrollToPackage = (index: number) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const children = container.children;
    if (children && children[index]) {
      const targetCard = children[index] as HTMLElement;
      const containerWidth = container.offsetWidth;
      const targetLeft = targetCard.offsetLeft;
      const targetWidth = targetCard.offsetWidth;
      const scrollLeft = targetLeft - (containerWidth - targetWidth) / 2;
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
    setActiveIndex(index);
  };

  // Tự động trích xuất danh mục từ chính mảng packages thực tế truy vấn từ Database
  const dynamicCategories = useMemo(() => {
    return Array.from(
      new Set(
        packages
          .map((pkg) => pkg.category?.trim())
          .filter((cat): cat is string => Boolean(cat))
      )
    );
  }, [packages]);

  const categories = useMemo(() => {
    return [
      { key: 'ALL', label: 'TẤT CẢ GÓI CƯỚI' },
      ...dynamicCategories.map((cat) => ({
        key: cat,
        label: formatCategoryLabel(cat),
      })),
    ];
  }, [dynamicCategories]);

  const filteredPackages = useMemo(() => {
    if (selectedCategory === 'ALL') return packages;
    const target = selectedCategory.trim().toLowerCase();
    return packages.filter(
      (pkg) => pkg.category?.trim().toLowerCase() === target
    );
  }, [packages, selectedCategory]);

  // Reset activeIndex when category or filtered packages change
  useEffect(() => {
    setActiveIndex(0);
  }, [filteredPackages]);

  return (
    <div className="w-full space-y-10">
      {/* CATEGORY FILTER TABS (Chỉ hiển thị khi có từ 2 danh mục trở lên để lọc) */}
      {dynamicCategories.length > 1 && (
        <div className="flex items-center justify-center">
          <div className="inline-flex p-1.5 bg-[#F5F2EB] rounded-full border border-stone-200/90 shadow-2xs overflow-x-auto max-w-full">
            {categories.map((cat) => {
              const isActive =
                cat.key === 'ALL'
                  ? selectedCategory === 'ALL'
                  : selectedCategory.trim().toLowerCase() === cat.key.trim().toLowerCase();
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setSelectedCategory(cat.key)}
                  aria-label={`Lọc gói dịch vụ: ${cat.label}`}
                  aria-pressed={isActive}
                  className={`px-4 sm:px-6 py-2 rounded-full text-xs uppercase tracking-wider font-medium transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#2E2824] text-white shadow-sm font-semibold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* QUICK PACKAGE JUMP PILLS ON MOBILE (< md) */}
      {filteredPackages.length > 1 && (
        <div className="md:hidden flex items-center gap-2 overflow-x-auto no-scrollbar px-4 pb-2 -mt-4">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-500 shrink-0 mr-1">
            Gói:
          </span>
          {filteredPackages.map((pkg, idx) => {
            const isActive = activeIndex === idx;
            return (
              <button
                key={pkg.id || idx}
                type="button"
                onClick={() => scrollToPackage(idx)}
                aria-label={`Xem nhanh gói ${pkg.name}`}
                aria-pressed={isActive}
                className={`px-3 py-1.5 rounded-full text-xs uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer shrink-0 border ${
                  isActive
                    ? 'bg-[#1C1917] text-[#E5C799] border-[#C59B6D] font-semibold shadow-sm'
                    : 'bg-[#FAF7F2] text-[#57534E] border-[#E8E0D5] hover:border-amber-400'
                }`}
              >
                {pkg.name}
              </button>
            );
          })}
        </div>
      )}

      {/* 3-COLUMN FULL PACKAGES GRID (MAX 3 PER ROW) / MOBILE SNAP CAROUSEL */}
      {filteredPackages.length === 0 ? (
        <div className="text-center py-16 bg-stone-50 rounded-3xl border border-dashed border-stone-300 max-w-2xl mx-auto space-y-3">
          <Sparkles className="w-8 h-8 text-stone-400 mx-auto" />
          <p className="font-serif text-lg text-charcoal-800">
            Chưa có gói dịch vụ nào trong danh mục này
          </p>
          <p className="text-xs text-stone-500">
            Vui lòng chọn danh mục khác hoặc liên hệ Hotline để được thiết kế gói riêng biệt.
          </p>
        </div>
      ) : (
        <>
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex md:flex-wrap md:justify-center items-stretch overflow-x-auto md:overflow-visible snap-x snap-mandatory gap-4 md:gap-6 lg:gap-8 px-5 md:px-0 pb-4 no-scrollbar scroll-smooth max-w-7xl mx-auto"
          >
            {filteredPackages.map((pkg, index) => (
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
          {filteredPackages.length > 1 && (
            <div className="flex md:hidden items-center justify-center gap-1 mt-3">
              {filteredPackages.map((pkg, idx) => {
                const isActive = activeIndex === idx;
                return (
                  <button
                    key={pkg.id || idx}
                    type="button"
                    onClick={() => scrollToPackage(idx)}
                    aria-label={`Chuyển tới gói ${pkg.name}`}
                    className="w-8 h-8 flex items-center justify-center cursor-pointer p-0 focus:outline-none"
                  >
                    <span
                      className={`block rounded-full transition-all duration-300 ${
                        isActive ? 'w-6 h-1.5 bg-[#1C1917]' : 'w-1.5 h-1.5 bg-stone-300'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* DETAIL MODAL WITH VIETQR REDIRECT */}
      {selectedPackage && (
        <PackageDetailModal
          packageData={selectedPackage}
          isOpen={!!selectedPackage}
          onClose={() => setSelectedPackage(null)}
        />
      )}
    </div>
  );
}

export default AllPackagesCatalog;

