'use client';

import React, { useState, useEffect } from 'react';
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
  heroFloatingImages?: string[];
}

interface FloatingSlotConfig {
  desktop: string;
  mobile: string;
  baseRotation: number;
  swayDuration: string;
  swayDelay: string;
  entranceDelay: string;
  aspectRatio: string;
  zIndex: string;
  opacityClass?: string;
}

// 10 Artfully layered coordinates: Left wing (4), Right wing (4), Top depth accents (2)
const FLOATING_SLOTS: FloatingSlotConfig[] = [
  // 1. Cánh trái: Góc trên trái (Khung chính lớn)
  {
    desktop: 'top-[7%] left-[1.5%] lg:left-[2.5%] w-36 sm:w-44 lg:w-48 xl:w-56',
    mobile: 'top-16 left-2 w-22 sm:w-28',
    baseRotation: -5.5,
    swayDuration: '5.2s',
    swayDelay: '0s',
    entranceDelay: '0.1s',
    aspectRatio: 'aspect-[3/4]',
    zIndex: 'z-12',
  },
  // 2. Cánh trái: Trung trên trái (Khung lớp sau)
  {
    desktop: 'top-[14%] left-[14%] sm:left-[15%] lg:left-[17%] w-30 sm:w-36 lg:w-40 xl:w-46 hidden md:block',
    mobile: 'hidden',
    baseRotation: 3.2,
    swayDuration: '5.7s',
    swayDelay: '0.4s',
    entranceDelay: '0.22s',
    aspectRatio: 'aspect-[4/5]',
    zIndex: 'z-11',
    opacityClass: 'opacity-95',
  },
  // 3. Cánh trái: Trung dưới trái (Khung lớp sau)
  {
    desktop: 'bottom-[16%] left-[13%] sm:left-[14%] lg:left-[15%] w-30 sm:w-36 lg:w-40 xl:w-46 hidden md:block',
    mobile: 'hidden',
    baseRotation: -2.8,
    swayDuration: '6.1s',
    swayDelay: '0.8s',
    entranceDelay: '0.35s',
    aspectRatio: 'aspect-[3/4]',
    zIndex: 'z-11',
    opacityClass: 'opacity-95',
  },
  // 4. Cánh trái: Góc dưới trái (Khung chính lớn ngang)
  {
    desktop: 'bottom-[5%] left-[1.5%] lg:left-[2.5%] w-38 sm:w-46 lg:w-52 xl:w-60',
    mobile: 'bottom-20 left-2 w-24 sm:w-30',
    baseRotation: 5.0,
    swayDuration: '5.4s',
    swayDelay: '1.2s',
    entranceDelay: '0.48s',
    aspectRatio: 'aspect-[4/3]',
    zIndex: 'z-12',
  },
  // 5. Cánh phải: Góc trên phải (Khung chính lớn)
  {
    desktop: 'top-[7%] right-[1.5%] lg:right-[2.5%] w-36 sm:w-44 lg:w-48 xl:w-56',
    mobile: 'top-16 right-2 w-22 sm:w-28',
    baseRotation: 5.5,
    swayDuration: '5.9s',
    swayDelay: '0.3s',
    entranceDelay: '0.6s',
    aspectRatio: 'aspect-[3/4]',
    zIndex: 'z-12',
  },
  // 6. Cánh phải: Trung trên phải (Khung lớp sau)
  {
    desktop: 'top-[14%] right-[14%] sm:right-[15%] lg:right-[17%] w-30 sm:w-36 lg:w-40 xl:w-46 hidden md:block',
    mobile: 'hidden',
    baseRotation: -3.2,
    swayDuration: '6.3s',
    swayDelay: '0.7s',
    entranceDelay: '0.72s',
    aspectRatio: 'aspect-[4/5]',
    zIndex: 'z-11',
    opacityClass: 'opacity-95',
  },
  // 7. Cánh phải: Trung dưới phải (Khung lớp sau)
  {
    desktop: 'bottom-[16%] right-[13%] sm:right-[14%] lg:right-[15%] w-30 sm:w-36 lg:w-40 xl:w-46 hidden md:block',
    mobile: 'hidden',
    baseRotation: 2.8,
    swayDuration: '5.1s',
    swayDelay: '1.0s',
    entranceDelay: '0.85s',
    aspectRatio: 'aspect-[3/4]',
    zIndex: 'z-11',
    opacityClass: 'opacity-95',
  },
  // 8. Cánh phải: Góc dưới phải (Khung chính lớn ngang)
  {
    desktop: 'bottom-[5%] right-[1.5%] lg:right-[2.5%] w-38 sm:w-46 lg:w-52 xl:w-60',
    mobile: 'bottom-20 right-2 w-24 sm:w-30',
    baseRotation: -5.0,
    swayDuration: '5.6s',
    swayDelay: '0.2s',
    entranceDelay: '0.98s',
    aspectRatio: 'aspect-[4/3]',
    zIndex: 'z-12',
  },
  // 9. Điểm nhấn trên lệch trái (Lớp sâu tạo chiều sâu không gian)
  {
    desktop: 'top-[3.5%] left-[29%] lg:left-[32%] w-26 sm:w-32 lg:w-36 xl:w-42 hidden xl:block',
    mobile: 'hidden',
    baseRotation: 2.0,
    swayDuration: '6.5s',
    swayDelay: '1.4s',
    entranceDelay: '1.1s',
    aspectRatio: 'aspect-[4/3]',
    zIndex: 'z-[9]',
    opacityClass: 'opacity-80 hover:opacity-100',
  },
  // 10. Điểm nhấn trên lệch phải (Lớp sâu tạo chiều sâu không gian)
  {
    desktop: 'top-[3.5%] right-[29%] lg:right-[32%] w-26 sm:w-32 lg:w-36 xl:w-42 hidden xl:block',
    mobile: 'hidden',
    baseRotation: -2.0,
    swayDuration: '6.0s',
    swayDelay: '0.5s',
    entranceDelay: '1.2s',
    aspectRatio: 'aspect-[4/3]',
    zIndex: 'z-[9]',
    opacityClass: 'opacity-80 hover:opacity-100',
  },
];

export function CinematicHeroBanner({
  heroBanner,
  heroBadge = 'LUXURY WEDDING PHOTOGRAPHY & FILMS',
  heroTitle = 'Nơi Tình Yêu Trở Thành Tác Phẩm Nghệ Thuật',
  heroSubtitle = 'PlusMoments không đơn thuần chụp lại những tư thế, chúng tôi lưu giữ ánh nhìn say đắm, những cái ôm siết chặt và rung cảm thuần khiết nhất của hai bạn trong từng khung hình điện ảnh.',
  slides = [],
  stats,
  heroFloatingImages = [],
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

  // Base list of floating photos
  const basePhotos = (
    heroFloatingImages && heroFloatingImages.length > 0
      ? heroFloatingImages
      : effectiveSlides
  ).filter(Boolean);

  // Auto-cycle through available photos to populate all 10 slots without empty gaps
  const effectiveFloatingPhotos = Array.from({ length: 10 }, (_, i) => {
    if (basePhotos.length === 0) return '/og-image.jpg';
    return basePhotos[i % basePhotos.length];
  });

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
    <section className="relative w-full h-screen min-h-[740px] max-h-[1050px] flex items-center justify-center overflow-hidden bg-[#141210] pt-20 pb-8 select-none">
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
                  quality={85}
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
      <div className="absolute inset-0 bg-gradient-to-t from-[#141210]/95 via-[#141210]/60 to-[#141210]/45 z-10 pointer-events-none" />

      {/* Ambient Champagne Gold Glow in Center */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(197,160,89,0.12)_0%,_transparent_70%)] z-10 pointer-events-none" />

      {/* =========================================================================
          3. DENSE MULTI-LAYERED FLOATING & SWAYING COLLAGE (10 STRATEGIC FRAMES)
      ========================================================================= */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        {effectiveFloatingPhotos.map((photoUrl, idx) => {
          const slot = FLOATING_SLOTS[idx % FLOATING_SLOTS.length];
          return (
            <div
              key={`float-photo-${idx}-${photoUrl}`}
              className={`absolute pointer-events-auto ${slot.desktop} ${slot.mobile} ${slot.aspectRatio} ${slot.zIndex} ${slot.opacityClass || ''}`}
              style={{
                animation: `heroEntrance 0.85s cubic-bezier(0.16, 1, 0.3, 1) ${slot.entranceDelay} forwards`,
                opacity: 0,
              }}
            >
              {/* Inner Swaying Container with Organic Oscillation */}
              <div
                className="w-full h-full group transition-transform duration-500 hover:scale-108 hover:z-30 cursor-pointer"
                style={{
                  animation: `heroGentleSway${idx % 10} ${slot.swayDuration} ease-in-out ${slot.swayDelay} infinite`,
                  transformOrigin: 'center center',
                }}
              >
                {/* Luxury Glassmorphic Champagne Bordered Photo Card */}
                <div className="relative w-full h-full rounded-2xl p-1 sm:p-1.5 bg-white/10 backdrop-blur-md border border-[#C5A059]/40 hover:border-[#E5C585] shadow-2xl hover:shadow-[0_15px_35px_rgba(197,160,89,0.45)] transition-all duration-500 overflow-hidden">
                  <div className="relative w-full h-full rounded-xl overflow-hidden bg-stone-900">
                    <Image
                      src={photoUrl}
                      alt={`Khoảnh khắc cưới PlusMoments #${idx + 1}`}
                      fill
                      sizes="(max-width: 768px) 110px, 240px"
                      quality={85}
                      className="object-cover object-[50%_20%] select-none transition-transform duration-700 group-hover:scale-108"
                    />

                    {/* Subtle warm shimmer gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-white/10 opacity-60 group-hover:opacity-20 transition-opacity" />

                    {/* Deluxe corner indicator tag */}
                    <div className="absolute bottom-1 right-1.5 px-1.5 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[#E5C585] text-[8px] font-mono font-semibold tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                      #{idx + 1}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* =========================================================================
          4. CENTER SOFT RADIAL BACKDROP (Z-15) - PROTECTS TEXT CONTRAST & CLARITY
      ========================================================================= */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(18,16,14,0.78)_0%,rgba(18,16,14,0.35)_55%,transparent_100%)] z-15 pointer-events-none" />

      {/* =========================================================================
          5. CENTER CONTENT AREA: BADGE, GRAND TITLE, DESCRIPTIONS & CTAS (Z-20)
      ========================================================================= */}
      <div className="relative z-20 max-w-4xl mx-auto px-5 text-center flex flex-col items-center my-auto">
        {/* 1. Tagline Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#C5A059]/40 bg-black/60 backdrop-blur-md mb-5 sm:mb-6 shadow-md">
          <span className="text-[#E5C585] text-xs">✦</span>
          <span className="text-[10px] sm:text-[11px] font-sans tracking-[0.22em] text-[#E5C585] uppercase font-semibold">
            {heroBadge}
          </span>
        </div>

        {/* 2. Grand Serif Title with Reserved Space */}
        <div className="min-h-[100px] sm:min-h-[140px] flex items-center justify-center mb-4 sm:mb-5">
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-white tracking-wide leading-[1.2] drop-shadow-[0_4px_22px_rgba(0,0,0,0.85)]">
            {renderTitle()}
          </h1>
        </div>

        {/* 3. Emotional Subtitle */}
        <p className="max-w-2xl text-stone-200 font-sans text-xs sm:text-[15px] font-light leading-relaxed mb-8 sm:mb-10 drop-shadow-md px-2">
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
        <div className="w-full max-w-xl mx-auto bg-black/50 backdrop-blur-md border border-white/15 rounded-2xl py-3 sm:py-3.5 px-2 shadow-2xl">
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
          6. SLIDE INDICATOR BARS (BOTTOM CHAMPAGNE GOLD) & SCROLL CUE
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

      {/* Global Embedded Keyframes for Ken Burns, Staggered Reveal and 10 Gentle Floating Sway Motions */}
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
        @keyframes heroEntrance {
          0% {
            opacity: 0;
            transform: translate3d(0, 26px, 0) scale(0.88);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }
        @keyframes heroGentleSway0 {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(-5.5deg);
          }
          50% {
            transform: translate3d(0, -11px, 0) rotate(-3deg);
          }
        }
        @keyframes heroGentleSway1 {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(3.2deg);
          }
          50% {
            transform: translate3d(0, 9px, 0) rotate(1deg);
          }
        }
        @keyframes heroGentleSway2 {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(-2.8deg);
          }
          50% {
            transform: translate3d(0, -9px, 0) rotate(-0.5deg);
          }
        }
        @keyframes heroGentleSway3 {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(5.0deg);
          }
          50% {
            transform: translate3d(0, 11px, 0) rotate(2.5deg);
          }
        }
        @keyframes heroGentleSway4 {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(5.5deg);
          }
          50% {
            transform: translate3d(0, -10px, 0) rotate(3deg);
          }
        }
        @keyframes heroGentleSway5 {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(-3.2deg);
          }
          50% {
            transform: translate3d(0, 9px, 0) rotate(-1deg);
          }
        }
        @keyframes heroGentleSway6 {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(2.8deg);
          }
          50% {
            transform: translate3d(0, -9px, 0) rotate(0.8deg);
          }
        }
        @keyframes heroGentleSway7 {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(-5.0deg);
          }
          50% {
            transform: translate3d(0, 10px, 0) rotate(-2.5deg);
          }
        }
        @keyframes heroGentleSway8 {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(2.0deg);
          }
          50% {
            transform: translate3d(0, -8px, 0) rotate(0deg);
          }
        }
        @keyframes heroGentleSway9 {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(-2.0deg);
          }
          50% {
            transform: translate3d(0, 8px, 0) rotate(0deg);
          }
        }
      `}</style>
    </section>
  );
}

export default CinematicHeroBanner;
