'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { ScrollCue } from '@/components/ui/ScrollCue';

export interface HeroStatItem {
  label: string;
  value: string;
}

export interface CinematicHeroBannerProps {
  heroBanner?: string;
  heroBadge?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  slides?: string[];
  stats?: HeroStatItem[];
}

export function CinematicHeroBanner({
  heroBanner,
  heroBadge = 'LUXURY WEDDING PHOTOGRAPHY & FILMS',
  heroTitle = 'Nơi Tình Yêu Trở Thành Tác Phẩm Nghệ Thuật',
  heroSubtitle = 'PlusMoments không đơn thuần chụp lại những tư thế, chúng tôi lưu giữ ánh nhìn say đắm, những cái ôm siết chặt và rung cảm thuần khiết nhất của hai bạn trong từng khung hình điện ảnh.',
  slides = [],
  stats,
}: CinematicHeroBannerProps) {
  // Normalize slide images: combine heroBanner with real album cover photos
  const effectiveSlides = (
    slides.length > 0 ? slides : [heroBanner || '/og-image.jpg']
  ).filter(Boolean);

  const [currentSlide, setCurrentSlide] = useState(0);

  // Cinematic auto-rotation every 6.5s
  useEffect(() => {
    if (effectiveSlides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % effectiveSlides.length);
    }, 6500);

    return () => clearInterval(timer);
  }, [effectiveSlides.length]);

  // Fallback stats list
  const statList: HeroStatItem[] =
    stats && stats.length >= 3
      ? stats
      : [
          { value: '500+', label: 'Cặp Đôi Hạnh Phúc' },
          { value: '100%', label: 'Concept Độc Bản' },
          { value: '4.9 ★', label: 'Hài Lòng Tuyệt Đối' },
        ];

  // Helper to render luxury title with italicized gold highlight
  const renderTitle = () => {
    const raw = heroTitle?.trim() || 'Nơi Tình Yêu Trở Thành Tác Phẩm Nghệ Thuật';
    const highlightPhrase = 'Tác Phẩm Nghệ Thuật';

    if (raw.includes(highlightPhrase)) {
      const parts = raw.split(highlightPhrase);
      return (
        <>
          {parts[0]}
          <span className="italic font-light text-[#E5C585] block sm:inline drop-shadow-[0_2px_12px_rgba(229,197,133,0.35)]">
            {highlightPhrase}
          </span>
          {parts[1]}
        </>
      );
    }

    return raw;
  };

  return (
    <section className="relative w-full h-screen min-h-[720px] max-h-[1050px] flex items-center justify-center overflow-hidden bg-[#141210] pt-20 pb-8 select-none">
      {/* =========================================================================
          1. CINEMATIC BACKGROUND SLIDESHOW WITH KEN BURNS SLOW ZOOM
      ========================================================================= */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#141210] pointer-events-none">
        {effectiveSlides.map((src, idx) => {
          const isActive = idx === currentSlide;
          return (
            <div
              key={`${src}-${idx}`}
              className={`absolute inset-0 transition-opacity duration-1200 ease-in-out will-change-transform ${
                isActive ? 'opacity-100 z-0' : 'opacity-0 -z-10'
              }`}
            >
              <div
                className={`w-full h-full will-change-transform ${
                  isActive ? 'animate-[kenBurnsSlow_7s_ease-out_forwards]' : 'scale-100'
                }`}
              >
                <Image
                  src={src}
                  alt="Studio ảnh cưới cao cấp PlusMoments"
                  fill
                  priority={idx === 0}
                  quality={88}
                  sizes="100vw"
                  className="object-cover object-[50%_20%] select-none pointer-events-none"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* =========================================================================
          2. SMART LAYERED LIGHTING GRADIENT OVERLAYS (WCAG AAA TEXT CONTRAST)
      ========================================================================= */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#141210]/95 via-[#141210]/45 to-[#141210]/30 z-10 pointer-events-none" />

      {/* =========================================================================
          3. CENTER CONTENT AREA: BADGE, GRAND TITLE, DESCRIPTIONS & CTAS
      ========================================================================= */}
      <div className="relative z-20 max-w-4xl mx-auto px-5 text-center flex flex-col items-center my-auto">
        {/* 1. Tagline Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#C5A059]/40 bg-black/40 backdrop-blur-md mb-5 sm:mb-6 shadow-md">
          <span className="text-[#E5C585] text-xs">✦</span>
          <span className="text-[10px] sm:text-[11px] font-sans tracking-[0.22em] text-[#E5C585] uppercase font-semibold">
            {heroBadge}
          </span>
        </div>

        {/* 2. Grand Serif Title with Reserved Space */}
        <div className="min-h-[100px] sm:min-h-[140px] flex items-center justify-center mb-4 sm:mb-5">
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-white tracking-wide leading-[1.2] drop-shadow-[0_4px_18px_rgba(0,0,0,0.65)]">
            {renderTitle()}
          </h1>
        </div>

        {/* 3. Emotional Subtitle */}
        <p className="max-w-2xl text-stone-200/90 font-sans text-xs sm:text-[15px] font-light leading-relaxed mb-8 sm:mb-10 drop-shadow-sm px-2">
          {heroSubtitle}
        </p>

        {/* 4. Dual Call To Action */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 sm:gap-4 mb-9 sm:mb-11 w-full sm:w-auto">
          {/* Primary CTA with Shimmer sweep */}
          <Link
            href="/bo-suu-tap"
            className="group relative overflow-hidden w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#9A6436] hover:bg-[#855328] text-white text-xs uppercase tracking-[0.18em] font-medium transition-all shadow-xl hover:shadow-[#9A6436]/40 hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
          >
            {/* Shimmer sweep reflection */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
            <span>Khám Phá Bộ Sưu Tập</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-200 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Secondary CTA with Glassmorphic polish */}
          <Link
            href="/bang-gia"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 hover:border-white/60 text-white text-xs uppercase tracking-[0.18em] font-medium transition-all cursor-pointer shadow-md"
          >
            Nhận Báo Giá Ưu Đãi
          </Link>
        </div>

        {/* 5. Balanced 3-Column Glassmorphic Social Proof Bar */}
        <div className="w-full max-w-xl mx-auto bg-black/35 backdrop-blur-md border border-white/15 rounded-2xl py-3 sm:py-3.5 px-2 shadow-2xl">
          <div className="grid grid-cols-3 divide-x divide-white/15 text-center">
            <div className="px-2">
              <div className="font-serif text-xl sm:text-2xl text-white font-light tracking-wide">
                {statList[0]?.value}
              </div>
              <div className="text-[9px] sm:text-[11px] tracking-wider uppercase text-stone-300/90 font-medium mt-0.5 truncate">
                {statList[0]?.label}
              </div>
            </div>
            <div className="px-2">
              <div className="font-serif text-xl sm:text-2xl text-white font-light tracking-wide">
                {statList[1]?.value}
              </div>
              <div className="text-[9px] sm:text-[11px] tracking-wider uppercase text-stone-300/90 font-medium mt-0.5 truncate">
                {statList[1]?.label}
              </div>
            </div>
            <div className="px-2">
              <div className="font-serif text-xl sm:text-2xl text-[#E5C585] font-light tracking-wide">
                {statList[2]?.value}
              </div>
              <div className="text-[9px] sm:text-[11px] tracking-wider uppercase text-stone-300/90 font-medium mt-0.5 truncate">
                {statList[2]?.label}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. SLIDE INDICATOR BARS (BOTTOM CHAMPAGNE GOLD) & SCROLL CUE
      ========================================================================= */}
      <div className="absolute bottom-4 sm:bottom-6 inset-x-0 z-20 flex flex-col items-center gap-3 pointer-events-auto">
        {/* Slide Progress Indicators */}
        {effectiveSlides.length > 1 && (
          <div className="flex items-center justify-center gap-2">
            {effectiveSlides.map((_, idx) => {
              const isActive = idx === currentSlide;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Xem ảnh slide ${idx + 1}`}
                  className="relative h-1 w-9 sm:w-12 rounded-full overflow-hidden bg-white/25 cursor-pointer touch-manipulation group py-1 -my-1"
                >
                  <span
                    className={`block h-1 rounded-full ${
                      isActive
                        ? 'bg-[#C5A059] w-full animate-[slideProgress_6.5s_linear_forwards]'
                        : 'bg-transparent group-hover:bg-white/40'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        )}

        {/* Animated Scroll Cue */}
        <ScrollCue label="CUỘN ĐỂ KHÁM PHÁ" variant="dark" targetId="explore-content" />
      </div>

      {/* Global Embedded Keyframes for Ken Burns and Progress Bar */}
      <style jsx global>{`
        @keyframes kenBurnsSlow {
          0% {
            transform: scale(1);
          }
          100% {
            transform: scale(1.07);
          }
        }
        @keyframes slideProgress {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}

export default CinematicHeroBanner;
