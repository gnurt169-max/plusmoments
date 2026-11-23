'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, CheckCircle2, Tag } from 'lucide-react';
import { formatVND } from '@/lib/utils';

export interface SideRailPackage {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number | null;
  unit?: string;
  subtitle?: string | null;
  highlightPoints?: string | string[] | null;
  category?: string | null;
}

interface AlbumLeftRailProps {
  packageData?: SideRailPackage | null;
  targetBottomSectionId?: string;
}

export function AlbumLeftRail({
  packageData,
  targetBottomSectionId = 'linked-package-section',
}: AlbumLeftRailProps) {
  const [isBottomPackageVisible, setIsBottomPackageVisible] = useState(false);

  useEffect(() => {
    if (!targetBottomSectionId) return;

    const targetEl = document.getElementById(targetBottomSectionId);
    if (!targetEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsBottomPackageVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '100px 0px 0px 0px',
      }
    );

    observer.observe(targetEl);
    return () => observer.disconnect();
  }, [targetBottomSectionId]);

  const highlights: string[] = React.useMemo(() => {
    if (!packageData?.highlightPoints) return [];
    if (Array.isArray(packageData.highlightPoints)) {
      return packageData.highlightPoints.slice(0, 3);
    }
    try {
      const parsed = JSON.parse(packageData.highlightPoints);
      return Array.isArray(parsed) ? parsed.slice(0, 3) : [];
    } catch {
      return [String(packageData.highlightPoints)].slice(0, 3);
    }
  }, [packageData?.highlightPoints]);

  return (
    <aside className="hidden xl:block w-[230px] sticky top-28 self-start h-fit z-10">
      {packageData ? (
        <div
          className={`transition-all duration-500 transform ${
            isBottomPackageVisible
              ? 'opacity-0 -translate-y-2 pointer-events-none'
              : 'opacity-100 translate-y-0'
          }`}
        >
          <div className="bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5 hover:shadow-md transition-shadow">
            {/* Badge */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold bg-amber-900/10 text-amber-900">
                <Tag className="w-3 h-3" />
                <span>Gói Thực Hiện</span>
              </span>
            </div>

            {/* Package Name & Subtitle */}
            <div>
              <h3 className="font-serif text-base font-medium text-stone-900 line-clamp-1">
                {packageData.name}
              </h3>
              {packageData.subtitle && (
                <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5 font-light leading-relaxed">
                  {packageData.subtitle}
                </p>
              )}
            </div>

            {/* Price */}
            <div className="pt-2 border-t border-stone-200/80">
              <div className="text-[10px] uppercase tracking-wider text-stone-400 font-mono">
                Chi phí trọn gói
              </div>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="font-mono text-base font-bold text-amber-900">
                  {formatVND(packageData.price)}
                </span>
                {packageData.unit && (
                  <span className="text-[11px] text-stone-500">{packageData.unit}</span>
                )}
              </div>
              {packageData.originalPrice && packageData.originalPrice > packageData.price && (
                <div className="text-[11px] text-stone-400 line-through font-mono">
                  {formatVND(packageData.originalPrice)}
                </div>
              )}
            </div>

            {/* Top 3 Highlights */}
            {highlights.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-stone-200/80 text-[11px] text-stone-700 font-light">
                {highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-1.5 leading-snug">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{h}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Action Button */}
            <div className="pt-2">
              <a
                href="#consultation-section"
                className="w-full h-9 rounded-xl bg-amber-900 hover:bg-amber-950 text-white text-[11px] font-semibold tracking-wider uppercase flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <Sparkles className="w-3 h-3 text-amber-200" />
                <span>Tư Vấn Gói Này</span>
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl p-4 shadow-xs text-center space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500">
            Concept Độc Bản
          </span>
          <p className="text-xs text-stone-700 leading-relaxed font-light">
            Mỗi bộ ảnh tại PlusMoments được thiết kế ánh sáng và phong cách may đo riêng.
          </p>
          <a
            href="#consultation-section"
            className="inline-block text-[11px] font-semibold text-amber-900 hover:underline pt-1"
          >
            Nhận tư vấn concept &rarr;
          </a>
        </div>
      )}
    </aside>
  );
}
