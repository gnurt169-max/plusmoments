'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  Sparkles,
  Check,
  Eye,
  ShieldCheck,
  Clock,
  Layers,
  Camera,
  Heart,
  ArrowRight,
} from 'lucide-react';
import { formatVND } from '@/lib/utils';
import { PackageDetailModal } from './PackageDetailModal';
import type { PricingPackageData } from './LuxuryPricingSection';

interface AllPackagesCatalogProps {
  packages: PricingPackageData[];
}

export function AllPackagesCatalog({ packages }: AllPackagesCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPackage, setSelectedPackage] = useState<PricingPackageData | null>(null);

  const categories = [
    { key: 'ALL', label: 'Tất Cả Gói Cưới' },
    { key: 'PRE_WEDDING', label: 'Pre-Wedding Ngoại Cảnh' },
    { key: 'STUDIO_CONCEPT', label: 'Studio Concept Hàn Quốc' },
    { key: 'WEDDING_DAY', label: 'Phóng Sự Ngày Cưới' },
  ];

  const filteredPackages = useMemo(() => {
    if (selectedCategory === 'ALL') return packages;
    return packages.filter((pkg) => pkg.category === selectedCategory);
  }, [packages, selectedCategory]);

  return (
    <div className="w-full space-y-10">
      {/* CATEGORY FILTER TABS */}
      <div className="flex items-center justify-center">
        <div className="inline-flex p-1.5 bg-[#F5F2EB] rounded-full border border-stone-200/90 shadow-2xs overflow-x-auto max-w-full">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCategory(cat.key)}
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

      {/* 3-COLUMN FULL PACKAGES GRID */}
      {filteredPackages.length === 0 ? (
        <div className="text-center py-16 bg-stone-50 rounded-3xl border border-dashed border-stone-300 max-w-2xl mx-auto space-y-3">
          <Sparkles className="w-8 h-8 text-stone-400 mx-auto" />
          <h4 className="font-serif text-lg text-charcoal-800">
            Chưa có gói dịch vụ nào trong danh mục này
          </h4>
          <p className="text-xs text-stone-500">
            Vui lòng chọn danh mục khác hoặc liên hệ Hotline để được thiết kế gói riêng biệt.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {filteredPackages.map((pkg) => {
            // Parse 4 bullet points
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
            const categoryLabel =
              pkg.category === 'PRE_WEDDING'
                ? 'Pre-Wedding Ngoại Cảnh'
                : pkg.category === 'STUDIO_CONCEPT'
                ? 'Studio Concept'
                : 'Phóng Sự Cưới';

            return (
              <div
                key={pkg.id}
                onClick={() => setSelectedPackage(pkg)}
                className={`group relative rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 border cursor-pointer select-none bg-[#FAF8F5] border-[#E8E2D9] shadow-sm hover:shadow-2xl hover:-translate-y-1.5 ${
                  pkg.isPopular
                    ? 'ring-2 ring-amber-500/40 border-amber-500/50 shadow-md'
                    : 'hover:border-amber-400/60'
                }`}
              >
                {/* 1. COVER IMAGE */}
                <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-stone-200">
                  {coverImg ? (
                    <Image
                      src={coverImg}
                      alt={pkg.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-stone-200 text-stone-400">
                      <Sparkles className="w-8 h-8 text-amber-500/40" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                  {/* Category Badge */}
                  <div className="absolute top-3.5 left-3.5 z-10 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] uppercase tracking-widest text-white font-medium border border-white/20">
                    {categoryLabel}
                  </div>

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

                  {/* 4-5 Core Bullet Points */}
                  <div className="space-y-3">
                    <p className="text-[11px] uppercase tracking-wider text-charcoal-500 font-semibold flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                      <span>Đặc quyền trọn gói:</span>
                    </p>
                    <ul className="space-y-2.5">
                      {highlights.slice(0, 4).map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-xs sm:text-sm text-charcoal-700 font-light leading-relaxed"
                        >
                          <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-2.5 h-2.5" />
                          </span>
                          <span className="line-clamp-2">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 3. CARD FOOTER BUTTON */}
                  <div className="pt-4 border-t border-[#E8E2D9]/80">
                    <button
                      type="button"
                      onClick={() => setSelectedPackage(pkg)}
                      className="w-full py-3 px-4 rounded-xl text-xs uppercase tracking-wider font-semibold text-white bg-[#2E2824] hover:bg-[#1A1614] transition-all flex items-center justify-center gap-2 shadow-sm group-hover:shadow-md cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-300" />
                      <span>Xem Chi Tiết & Đặt Lịch</span>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-300 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAIL MODAL WITH VIETQR REDIRECT */}
      <PackageDetailModal
        packageData={selectedPackage}
        isOpen={!!selectedPackage}
        onClose={() => setSelectedPackage(null)}
      />
    </div>
  );
}

export default AllPackagesCatalog;

