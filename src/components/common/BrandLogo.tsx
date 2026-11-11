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
  logoTextPrimary?: string;
  logoTextSecondary?: string;
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
  logoTextPrimary: propLogoTextPrimary,
  logoTextSecondary: propLogoTextSecondary,
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
  const settings = contactCtx?.contact;

  const logoType = propLogoType || settings?.logoType || 'TEXT';

  // Primary Text & Secondary Text (Logo Typography) with safe optional chaining & fallbacks
  const primaryText =
    propLogoTextPrimary ||
    settings?.logoTextPrimary ||
    (typeof propBrandNamePart1 === 'string' && propBrandNamePart1
      ? `${propBrandNamePart1} ${propBrandNamePart2 || ''}`.trim()
      : null) ||
    (settings?.brandNamePart1
      ? `${settings.brandNamePart1} ${settings.brandNamePart2 || ''}`.trim()
      : null) ||
    'PLUS MOMENTS';

  const secondaryText =
    propLogoTextSecondary ||
    settings?.logoTextSecondary ||
    propBrandSubtitle ||
    settings?.brandSubtitle ||
    'LUXURY WEDDING STUDIO';

  // Safe decomposition into two parts for 2-tone luxury typography
  let part1 = 'PLUS';
  let part2 = 'MOMENTS';

  if (typeof propBrandNamePart1 === 'string' && propBrandNamePart1.trim()) {
    part1 = propBrandNamePart1.trim();
    part2 = typeof propBrandNamePart2 === 'string' ? propBrandNamePart2.trim() : '';
  } else if (typeof primaryText === 'string' && primaryText.trim()) {
    const trimmed = primaryText.trim();
    const parts = trimmed.split(/\s+/);
    if (parts.length > 1) {
      part1 = parts[0] || 'PLUS';
      part2 = parts.slice(1).join(' ');
    } else {
      part1 = trimmed || 'PLUS';
      part2 = '';
    }
  }

  const subtitle = typeof secondaryText === 'string' ? secondaryText.trim() : 'LUXURY WEDDING STUDIO';

  const logoLightUrl = propLogoLightUrl !== undefined ? propLogoLightUrl : settings?.logoLightUrl;
  const logoDarkUrl = propLogoDarkUrl !== undefined ? propLogoDarkUrl : settings?.logoDarkUrl;

  // Typography settings with complete null-safety & fallbacks
  const fontFamily = propLogoFontFamily || settings?.logoFontFamily || 'Playfair Display';
  const fontSize = Number(propLogoFontSize ?? settings?.logoFontSize ?? 24) || 24;
  const fontWeight = String(propLogoFontWeight || settings?.logoFontWeight || '600');
  const letterSpacing = String(propLogoLetterSpacing || settings?.logoLetterSpacing || '0.15em');
  const colorLight = propLogoColorLight || settings?.logoColorLight || '#1A1614';
  const colorDark = propLogoColorDark || settings?.logoColorDark || '#F5F2EB';
  const accentColor = propLogoAccentColor || settings?.logoAccentColor || '#C5A880';

  const [imageError, setImageError] = useState(false);

  // Image logo rendering
  if (logoType === 'IMAGE' && !imageError) {
    const rawImageUrl = variant === 'dark' ? (logoDarkUrl || logoLightUrl) : (logoLightUrl || logoDarkUrl);
    const imageUrl = typeof rawImageUrl === 'string' ? rawImageUrl.trim() : '';
    if (imageUrl) {
      const altText = `${part1 || ''} ${part2 || ''}`.trim() || 'PlusMoments Logo';
      return (
        <div className={`inline-flex flex-col items-start ${className}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={altText}
            className="h-8 sm:h-9 w-auto max-w-[200px] object-contain transition-transform"
            onError={() => setImageError(true)}
          />
          {showSubtitle && subtitle ? (
            <p
              className={`text-[9px] font-sans tracking-[0.28em] uppercase mt-1 leading-tight ${
                variant === 'dark' ? 'text-stone-500' : 'text-stone-400'
              }`}
            >
              {subtitle}
            </p>
          ) : null}
        </div>
      );
    }
  }

  // Text typography rendering with custom font, size, weight, spacing, and colors
  const primaryColor = variant === 'dark' ? colorLight : colorDark;
  const parsedWeight = parseInt(fontWeight, 10);
  const accentWeight = !isNaN(parsedWeight) ? Math.min(parsedWeight + 100, 800) : 600;

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
        {part2 ? (
          <span
            className="ml-1.5 transition-colors"
            style={{
              color: accentColor,
              fontWeight: accentWeight,
            }}
          >
            {part2}
          </span>
        ) : null}
      </div>
      {showSubtitle && subtitle ? (
        <p
          className={`text-[9px] font-sans tracking-[0.28em] uppercase mt-1 leading-tight ${
            variant === 'dark' ? 'text-stone-500' : 'text-stone-400'
          }`}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

export default BrandLogo;
