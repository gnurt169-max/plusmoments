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
  // Typography & Colors Customization
  logoFontFamily?: string;
  logoFontSize?: number;
  logoFontWeight?: string;
  logoLetterSpacing?: string;
  logoColorLight?: string;
  logoColorDark?: string;
  logoAccentColor?: string;
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
  logoFontFamily: propLogoFontFamily,
  logoFontSize: propLogoFontSize,
  logoFontWeight: propLogoFontWeight,
  logoLetterSpacing: propLogoLetterSpacing,
  logoColorLight: propLogoColorLight,
  logoColorDark: propLogoColorDark,
  logoAccentColor: propLogoAccentColor,
}: BrandLogoProps) {
  const contactCtx = useSafeContact();

  const logoType = propLogoType || contactCtx?.contact?.logoType || 'TEXT';
  const part1 = propBrandNamePart1 ?? contactCtx?.contact?.brandNamePart1 ?? 'PLUS';
  const part2 = propBrandNamePart2 ?? contactCtx?.contact?.brandNamePart2 ?? 'MOMENTS';
  const subtitle = propBrandSubtitle ?? contactCtx?.contact?.brandSubtitle ?? 'LUXURY WEDDING STUDIO';
  const logoLightUrl = propLogoLightUrl !== undefined ? propLogoLightUrl : contactCtx?.contact?.logoLightUrl;
  const logoDarkUrl = propLogoDarkUrl !== undefined ? propLogoDarkUrl : contactCtx?.contact?.logoDarkUrl;

  // Typography settings
  const fontFamily = propLogoFontFamily || contactCtx?.contact?.logoFontFamily || 'Playfair Display';
  const fontSize = propLogoFontSize ?? contactCtx?.contact?.logoFontSize ?? 24;
  const fontWeight = propLogoFontWeight || contactCtx?.contact?.logoFontWeight || '600';
  const letterSpacing = propLogoLetterSpacing || contactCtx?.contact?.logoLetterSpacing || '0.15em';
  const colorLight = propLogoColorLight || contactCtx?.contact?.logoColorLight || '#1A1614';
  const colorDark = propLogoColorDark || contactCtx?.contact?.logoColorDark || '#F5F2EB';
  const accentColor = propLogoAccentColor || contactCtx?.contact?.logoAccentColor || '#C5A880';

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

  // Text typography rendering with custom font, size, weight, spacing, and colors
  const primaryColor = variant === 'dark' ? colorLight : colorDark;

  return (
    <div className={`inline-block select-none ${className}`}>
      <div
        className="uppercase leading-none flex items-baseline transition-all"
        style={{
          fontFamily: `'${fontFamily}', serif`,
          fontSize: `${fontSize}px`,
          fontWeight: fontWeight,
          letterSpacing: letterSpacing,
        }}
      >
        <span
          className="transition-colors"
          style={{ color: primaryColor }}
        >
          {part1}
        </span>
        {part2 && (
          <span
            className="ml-1.5 transition-colors"
            style={{
              color: accentColor,
              fontWeight: Math.min(Number(fontWeight) + 100, 800) || 600,
            }}
          >
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
