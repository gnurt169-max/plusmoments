'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Sparkles, Check, ArrowRight } from 'lucide-react';
import { formatVND } from '@/lib/utils';

const ConsultationModal = dynamic(
  () => import('@/components/common/ConsultationModal'),
  { ssr: false }
);

export interface LinkedPackageData {
  id: string;
  name: string;
  slug: string;
  price: number | string | any;
  originalPrice?: number | string | any | null;
  unit?: string | null;
  category?: string | null;
  subtitle?: string | null;
  coverImage?: string | null;
  highlightPoints?: string | null | string[];
  inclusions?: string | null | string[];
}

interface LinkedPackageCardProps {
  packageData?: LinkedPackageData | null;
  badgeText?: string;
  className?: string;
}

export function LinkedPackageCard({
  packageData,
  badgeText = '✨ GÓI DỊCH VỤ TRẢI NGHIỆM THỰC TẾ',
  className = '',
}: LinkedPackageCardProps) {
  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);

  if (!packageData) return null;

  // Parse 3 core highlights
  let highlights: string[] = [];
  try {
    if (Array.isArray(packageData.highlightPoints)) {
      highlights = packageData.highlightPoints;
    } else if (typeof packageData.highlightPoints === 'string' && packageData.highlightPoints.trim()) {
      const parsed = JSON.parse(packageData.highlightPoints);
      highlights = Array.isArray(parsed) ? parsed : [];
    }
  } catch {
    highlights = [];
  }

  // Fallback to inclusions if highlights empty
  if (highlights.length === 0) {
    try {
      if (Array.isArray(packageData.inclusions)) {
        highlights = packageData.inclusions.slice(0, 3);
      } else if (typeof packageData.inclusions === 'string' && packageData.inclusions.trim()) {
        const parsed = JSON.parse(packageData.inclusions);
        highlights = Array.isArray(parsed) ? parsed.slice(0, 3) : [];
      }
    } catch {
      highlights = [];
    }
  }

  const numPrice = Number(packageData.price) || 0;
  const numOriginalPrice = packageData.originalPrice ? Number(packageData.originalPrice) : null;
  const unit = packageData.unit || 'trọn gói';

  return (
    <>
      <div
        className={`relative overflow-hidden rounded-3xl bg-[#FAF8F5] border border-amber-900/15 p-6 sm:p-8 shadow-sm hover:shadow-md transition-all ${className}`}
      >
        {/* Subtle decorative background gradient accent */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Badge */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100/80 border border-amber-200 text-amber-950 text-[11px] font-semibold tracking-wider uppercase shadow-2xs">
            <span>{badgeText}</span>
          </div>
          <span className="hidden sm:inline-block text-[11px] text-stone-500 font-light">
            Áp dụng ưu đãi mùa cưới 2026
          </span>
        </div>

        {/* 3-Column Luxury Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          {/* CỘT 1: THUMBNAIL + TÊN GÓI + GIÁ (lg:col-span-5) */}
          <div className="lg:col-span-5 flex items-center gap-4 sm:gap-5">
            <div className="relative w-20 h-28 sm:w-24 sm:h-32 rounded-2xl overflow-hidden bg-stone-200 shrink-0 border border-stone-300/80 shadow-xs">
              {packageData.coverImage ? (
                <img
                  src={packageData.coverImage}
                  alt={packageData.name}
                  className="w-full h-full object-cover select-none pointer-events-none"
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-stone-100 text-stone-400">
                  <Sparkles className="w-6 h-6 text-amber-500/50" />
                </div>
              )}
            </div>

            <div className="space-y-1.5 flex-1 min-w-0">
              <span className="text-[10px] uppercase tracking-widest text-amber-800 font-medium block">
                Gói Dịch Vụ Cưới Cao Cấp
              </span>
              <p className="font-serif text-lg sm:text-2xl text-charcoal-900 font-normal leading-snug line-clamp-2">
                {packageData.name}
              </p>
              <div className="flex items-baseline gap-2 pt-0.5">
                <span className="font-mono text-base sm:text-xl font-bold text-amber-900">
                  {formatVND(numPrice)}
                </span>
                {numOriginalPrice && numOriginalPrice > numPrice && (
                  <span className="font-mono text-xs text-stone-400 line-through">
                    {formatVND(numOriginalPrice)}
                  </span>
                )}
                <span className="text-xs text-stone-500 font-light">/{unit}</span>
              </div>
              {packageData.subtitle && (
                <p className="text-[11px] sm:text-xs text-charcoal-500 line-clamp-1 font-light">
                  {packageData.subtitle}
                </p>
              )}
            </div>
          </div>

          {/* CỘT 2: 3 ĐẶC QUYỀN CỐT LÕI (lg:col-span-4) */}
          <div className="lg:col-span-4 py-3 lg:py-0 border-y lg:border-y-0 lg:border-x border-amber-900/10 lg:px-6">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-700 mb-2.5">
              Đặc Quyền Bao Gồm Trong Gói:
            </p>
            {highlights.length > 0 ? (
              <ul className="space-y-2 text-xs text-charcoal-700">
                {highlights.slice(0, 3).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-800 shrink-0 mt-0.5" />
                    <span className="line-clamp-2 leading-relaxed font-light">{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="space-y-2 text-xs text-charcoal-700">
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-800 shrink-0 mt-0.5" />
                  <span className="font-light">01 Album Photobook cao cấp & 02 Ảnh cổng pha lê</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-800 shrink-0 mt-0.5" />
                  <span className="font-light">Trang phục cưới thiết kế Luxury & Makeup riêng</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-800 shrink-0 mt-0.5" />
                  <span className="font-light">Bàn giao 100% file gốc và ảnh blend màu cao cấp</span>
                </li>
              </ul>
            )}
          </div>

          {/* CỘT 3: CẶP NÚT CTA HÀNH ĐỘNG (lg:col-span-3) */}
          <div className="lg:col-span-3 flex flex-col sm:flex-row lg:flex-col gap-2.5 justify-center">
            <button
              type="button"
              onClick={() => setIsConsultModalOpen(true)}
              aria-label={`Tư vấn gói dịch vụ cưới ${packageData.name}`}
              className="w-full px-5 py-3 rounded-full bg-[#9A6436] hover:bg-[#855328] active:scale-95 text-white text-xs uppercase tracking-wider font-semibold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" aria-hidden="true" />
              <span>Tư Vấn Concept Này</span>
            </button>

            <Link
              href={`/pricing#${packageData.slug}`}
              aria-label={`Xem báo giá chi tiết gói ${packageData.name}`}
              className="w-full px-5 py-3 rounded-full border border-stone-300 hover:border-charcoal-900 text-charcoal-800 hover:bg-white text-xs uppercase tracking-wider font-medium transition-all bg-white/70 shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer text-center"
            >
              <span>Xem Báo Giá Chi Tiết</span>
              <span className="sr-only">: {packageData.name}</span>
              <ArrowRight className="w-3.5 h-3.5 text-stone-500" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>

      {/* POPUP MODAL TƯ VẤN GÓI RIÊNG BIỆT (Chỉ nạp JS/CSS khi bấm mở) */}
      {isConsultModalOpen && (
        <ConsultationModal
          isOpen={isConsultModalOpen}
          onClose={() => setIsConsultModalOpen(false)}
          title={`Tư Vấn Concept ${packageData.name}`}
          subtitle="Để lại thông tin để PlusMoments liên hệ tư vấn bối cảnh, váy cưới và gửi báo giá ưu đãi tốt nhất cho hai bạn."
          defaultPackage={packageData.name}
          source="linked_package_card"
        />
      )}
    </>
  );
}

