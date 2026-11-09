'use client';

import React, { useState } from 'react';
import { useContact } from '@/context/ContactContext';

export interface BrandLogoProps {
  variant?: 'dark' | 'light'; // 'dark' = on light bg (Header); 'light' = on dark bg (Footer)
  className?: string;
  logoType?: string;
  brandNamePart1?: string;
  brandNamePart2?: string;
  brandSubtitle?: string;
  logoLightUrl?: string | null;
  logoDarkUrl?: string | null;
  showSubtitle?: boolean;
}

function useSafeContact() {
  try {
    return useContact();
  } catch {
    return null;
  }
}

export function BrandLogo({
  variant = 'dark',
  className = '',
  logoType: propLogoType,
  brandNamePart1: propBrandNamePart1,
  brandNamePart2: propBrandNamePart2,
  brandSubtitle: propBrandSubtitle,
  logoLightUrl: propLogoLightUrl,
  logoDarkUrl: propLogoDarkUrl,
  showSubtitle = true,
}: BrandLogoProps) {
  const contactCtx = useSafeContact();

  const logoType = propLogoType || contactCtx?.contact?.logoType || 'TEXT';
  const part1 = propBrandNamePart1 ?? contactCtx?.contact?.brandNamePart1 ?? 'PLUS';
  const part2 = propBrandNamePart2 ?? contactCtx?.contact?.brandNamePart2 ?? 'MOMENTS';
  const subtitle = propBrandSubtitle ?? contactCtx?.contact?.brandSubtitle ?? 'LUXURY WEDDING STUDIO';
  const logoLightUrl = propLogoLightUrl !== undefined ? propLogoLightUrl : contactCtx?.contact?.logoLightUrl;
  const logoDarkUrl = propLogoDarkUrl !== undefined ? propLogoDarkUrl : contactCtx?.contact?.logoDarkUrl;

  const [imageError, setImageError] = useState(false);

  // Image logo rendering
  if (logoType === 'IMAGE' && !imageError) {
    const imageUrl = variant === 'dark' ? (logoDarkUrl || logoLightUrl) : (logoLightUrl || logoDarkUrl);
    if (imageUrl && imageUrl.trim()) {
      return (
        <div className={`inline-flex flex-col items-start ${className}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={`${part1} ${part2}`.trim() || 'PlusMoments Logo'}
            className="h-8 sm:h-9 w-auto max-w-[200px] object-contain transition-transform"
            onError={() => setImageError(true)}
          />
          {showSubtitle && subtitle && (
            <p
              className={`text-[9px] font-sans tracking-[0.28em] uppercase mt-1 leading-tight ${
                variant === 'dark' ? 'text-stone-500' : 'text-stone-400'
              }`}
            >
              {subtitle}
            </p>
          )}
        </div>
      );
    }
  }

  // Text typography rendering (Signature 2-Tone Luxury Design)
  return (
    <div className={`inline-block select-none ${className}`}>
      <div className="font-serif text-2xl font-light tracking-[0.16em] uppercase leading-none flex items-baseline">
        <span className={variant === 'dark' ? 'text-stone-900' : 'text-stone-100'}>
          {part1}
        </span>
        {part2 && (
          <span className="font-semibold text-[#C5A880] ml-1.5 transition-colors">
            {part2}
          </span>
        )}
      </div>
      {showSubtitle && subtitle && (
        <p
          className={`text-[9px] font-sans tracking-[0.28em] uppercase mt-1 leading-tight ${
            variant === 'dark' ? 'text-stone-500' : 'text-stone-400'
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default BrandLogo;

