'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import {
  Sparkles,
  Camera,
  BookOpen,
  ArrowRight,
  Check,
  Eye,
  ShieldCheck,
  Clock,
  Maximize2,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { formatVND } from '@/lib/utils';

// Dynamic load modals strictly on user interaction
const PackageDetailModal = dynamic(
  () => import('@/components/common/PackageDetailModal'),
  { ssr: false }
);

const ConsultationModal = dynamic(
  () => import('@/components/common/ConsultationModal'),
  { ssr: false }
);

export interface PricingPackageData {
  id: string;
  name: string;
  slug: string;
  category: string;
  subtitle?: string | null;
  price: number | string;
  originalPrice?: number | string | null;
  unit: string;
  coverImage?: string;
  demoImages?: string | null;
  highlightPoints?: string | null;
  inclusions: string;
  deliverables?: string | null;
  isPopular: boolean;
  isFeatured: boolean;
  shortFeatures?: string[];
  fullFeatures?: string[];
  features?: string[];
  deliveryProcess?: string | null;
}

interface LuxuryPricingSectionProps {
  packages: PricingPackageData[];
  title?: string;
  subtitle?: string;
  badge?: string;
  darkTheme?: boolean;
  isSummary?: boolean;
}

export function LuxuryPricingSection({
  packages,
  title = 'Bảng Giá Dịch Vụ Cưới Trọn Gói',
  subtitle = 'Cam kết không phát sinh chi phí. Toàn bộ gói chụp đã bao gồm trang phục cưới thiết kế, makeup nghệ thuật và xe đưa đón.',
  badge = 'Minh Bạch & Tối Ưu',
  darkTheme = false,
  isSummary = true,
}: LuxuryPricingSectionProps) {
  // Modal Detail State
  const [selectedPackage, setSelectedPackage] = useState<PricingPackageData | null>(null);

  // Quick Consultation Modal State
  const [consultPackageName, setConsultPackageName] = useState<string | null>(null);

  const openDetailModal = (pkg: PricingPackageData) => {
    setSelectedPackage(pkg);
  };

  const openConsultModal = (pkgName: string) => {
    setConsultPackageName(pkgName);
  };

  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3 mb-16 px-4">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-luxury-600">
          {badge}
        </p>
        <h2
          className={`font-serif text-3xl sm:text-4xl md:text-5xl font-light ${
            darkTheme ? 'text-white' : 'text-charcoal-900'
          }`}
        >
          {title}
        </h2>
        <p
          className={`text-sm font-light leading-relaxed ${
            darkTheme ? 'text-stone-300' : 'text-charcoal-600'
          }`}
        >
          {subtitle}
        </p>
      </div>

      {/* Mobile Swipe Hint */}
      <div className="md:hidden flex items-center justify-center gap-1.5 text-xs text-stone-500 font-light mb-3">
        <span>👈 Vuốt ngang để so sánh các gói dịch vụ 👉</span>
      </div>

      {/* Luxury Cards Grid & Mobile Horizontal Snap Carousel */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex md:grid overflow-x-auto md:overflow-x-visible snap-x snap-mandatory scrollbar-none pb-6 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8 items-stretch">
          {packages.map((pkg) => {
            // Parse highlights (3 core summary points)
            let highlights: string[] = [];
            try {
              highlights = JSON.parse(pkg.highlightPoints || '[]');
            } catch {
              highlights = [];
            }

            if (highlights.length === 0 && pkg.inclusions) {
              try {
                const inc = JSON.parse(pkg.inclusions || '[]');
                highlights = Array.isArray(inc) ? inc.slice(0, 3) : [];
              } catch {
                highlights = pkg.inclusions
                  .split('\n')
                  .map((s) => s.replace(/^[•\-\*]\s*/, '').trim())
                  .filter(Boolean)
                  .slice(0, 3);
              }
            }

            const coverImg =
              pkg.coverImage && pkg.coverImage.trim()
                ? pkg.coverImage.trim()
                : '';

            const categoryLabel =
              pkg.category === 'PRE_WEDDING'
                ? 'Pre-Wedding Ngoại Cảnh'
                : pkg.category === 'STUDIO_CONCEPT'
                ? 'Studio Concept'
                : 'Phóng Sự Cưới';

            return (
              <div
                key={pkg.id}
                onClick={() => openDetailModal(pkg)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openDetailModal(pkg);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`Xem album và chi tiết gói ${pkg.name}`}
                className={`group relative rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-500 border cursor-pointer select-none w-[84vw] sm:w-[380px] md:w-auto flex-shrink-0 md:flex-shrink snap-center snap-always ${
                  pkg.isPopular
                    ? 'bg-white shadow-2xl border-luxury-500 ring-2 ring-luxury-400/30 md:-translate-y-2 hover:-translate-y-3 hover:shadow-[0_25px_50px_-12px_rgba(180,130,60,0.25)]'
                    : 'bg-white shadow-luxury hover:shadow-2xl border-champagne-dark/30 hover:-translate-y-2 hover:border-luxury-400'
                }`}
              >
                {/* Popular Ribbon Tag */}
                {pkg.isPopular && (
                  <div className="absolute top-4 right-4 z-20 px-3.5 py-1 rounded-full bg-gradient-to-r from-luxury-600 to-amber-700 text-white text-[10px] uppercase tracking-widest font-semibold shadow-lg flex items-center gap-1.5 border border-champagne-gold/40">
                    <Sparkles className="w-3 h-3 text-amber-200" />
                    <span>Lựa Chọn Nhiều Nhất</span>
                  </div>
                )}

                {/* 1. Card Header Image (Aspect 4:5 with Smooth Zoom) */}
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#1E1C1A]">
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
                    <div className="w-full h-full flex items-center justify-center bg-stone-900 text-stone-400">
                      <Sparkles className="w-8 h-8 text-amber-500/40" />
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/20 to-transparent" />

                  {/* Name & Pricing Placed over Image Base */}
                  <div className="absolute bottom-5 left-5 right-5 z-10 text-white space-y-1">
                    <h3 className="font-serif text-2xl font-light text-white group-hover:text-amber-200 transition-colors duration-300 drop-shadow">
                      {pkg.name}
                    </h3>
                    <div className="flex items-baseline gap-2 pt-0.5">
                      <span className="font-serif text-2xl sm:text-3xl font-light text-amber-200">
                        {formatVND(pkg.price)}
                      </span>
                      <span className="text-xs text-stone-300">/{pkg.unit}</span>
                      {pkg.originalPrice && (
                        <span className="text-xs text-stone-400 line-through ml-auto font-mono">
                          {formatVND(pkg.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Core Highlights (Tóm tắt rút gọn 3 quyền lợi với icon tinh tế) */}
                <div className="p-6 space-y-5 flex-1 flex flex-col justify-between">
                  {/* 2. Core Highlights */}
                  {(() => {
                    const rawFeatures = (pkg.features && pkg.features.length > 0) ? pkg.features : highlights;
                    const displayFeatures = isSummary ? rawFeatures.slice(0, 3) : rawFeatures;
                    if (displayFeatures.length === 0) return null;
                    return (
                      <div className="space-y-3">
                        <p className="text-[11px] uppercase tracking-wider text-charcoal-400 font-semibold">
                          Đặc quyền trọn gói:
                        </p>
                        <ul className={`space-y-2.5 ${!isSummary ? 'min-h-[160px] max-h-[320px] overflow-y-auto pr-1 custom-scrollbar' : ''}`}>
                          {displayFeatures.map((item, idx) => {
                            const Icon =
                              idx % 3 === 0
                                ? BookOpen
                                : idx % 3 === 1
                                ? Camera
                                : Sparkles;
                            return (
                              <li
                                key={idx}
                                className="flex items-start gap-2.5 text-xs text-charcoal-700 font-light leading-relaxed"
                              >
                                <span className="w-5 h-5 rounded-full bg-champagne/60 text-luxury-700 flex items-center justify-center shrink-0 mt-0.5">
                                  <Icon className="w-3 h-3" />
                                </span>
                                <span className={isSummary ? "line-clamp-2" : ""}>{item}</span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    );
                  })()}

                  {/* 3. Dual CTA Actions */}
                  <div className="pt-4 border-t border-stone-100 space-y-2.5">
                    {/* Visual Indicator: View Album & Detail Modal (Interactive State on Card Hover) */}
                    <div
                      className="w-full py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider font-medium text-charcoal-800 border border-charcoal-300 group-hover:border-luxury-600 group-hover:bg-luxury-600 group-hover:text-white transition-all duration-300 flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5 text-luxury-600 group-hover:text-white transition-colors duration-300" />
                      <span>Xem Album & Chi Tiết Gói</span>
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    </div>

                    {/* Solid Button: Instant Consultation Booking (Opens Form without triggering detail modal) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        openConsultModal(pkg.name);
                      }}
                      aria-label={`Chọn gói ${pkg.name} & nhận ưu đãi`}
                      className={`relative z-20 w-full py-3 px-4 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                        pkg.isPopular
                          ? 'bg-luxury-600 hover:bg-luxury-700 text-white shadow-luxury hover:scale-[1.02] active:scale-[0.98]'
                          : 'bg-charcoal-900 hover:bg-luxury-800 text-white hover:scale-[1.02] active:scale-[0.98]'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Chọn Gói Này & Nhận Ưu Đãi</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          DETAILED PACKAGE POPUP MODAL (100% Inclusions & VietQR Checkout Redirect)
      ========================================================================= */}
      {selectedPackage && (
        <PackageDetailModal
          packageData={selectedPackage}
          isOpen={!!selectedPackage}
          onClose={() => setSelectedPackage(null)}
        />
      )}

      {/* QUICK CONSULTATION MODAL */}
      {consultPackageName && (
        <ConsultationModal
          isOpen={!!consultPackageName}
          onClose={() => setConsultPackageName(null)}
          title="Nhận Ưu Đãi Gói Cưới"
          subtitle={`Để lại thông tin để PlusMoments giữ ưu đãi 2.000.000đ cho "${consultPackageName}".`}
          defaultPackage={consultPackageName}
        />
      )}
    </div>
  );
}

