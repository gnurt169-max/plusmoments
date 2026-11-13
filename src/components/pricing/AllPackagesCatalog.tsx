'use client';

import React, { useState, useMemo } from 'react';
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

      {/* 3-COLUMN FULL PACKAGES GRID */}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {filteredPackages.map((pkg, index) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              priority={index < 2}
              isSummary={isSummary}
              onSelect={(selected) => setSelectedPackage(selected)}
            />
          ))}
        </div>
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

