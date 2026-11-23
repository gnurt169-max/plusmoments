'use client';

import React, { useEffect, useState } from 'react';

export interface ScrollCueProps {
  label?: string;
  variant?: 'light' | 'dark';
  className?: string;
  targetId?: string;
}

/**
 * ScrollCue: Luxury Editorial Animated Scroll Indicator for PlusMoments Studio.
 * - Displays "CUỘN ĐỂ KHÁM PHÁ" with tracking-[0.25em] text-[10px].
 * - Slim vertical line (w-[1px] h-9) with sliding light drop via GPU transform keyframe.
 * - Auto-fades out (opacity-0 pointer-events-none transition-opacity duration-500) once scrolled past 120px.
 */
export function ScrollCue({
  label = 'CUỘN ĐỂ KHÁM PHÁ',
  variant = 'dark',
  className = '',
  targetId,
}: ScrollCueProps) {
  const [scrolledPast, setScrolledPast] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY || window.pageYOffset || 0;
          setScrolledPast(scrollY > 120);
          ticking = false;
        });
        ticking = true;
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleClick = () => {
    if (targetId) {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    // Default: smooth scroll down 1 viewport height
    window.scrollBy({ top: window.innerHeight * 0.75, behavior: 'smooth' });
  };

  const isDark = variant === 'dark';

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label="Cuộn xuống để khám phá"
      className={`inline-flex flex-col items-center gap-2.5 transition-opacity duration-500 cursor-pointer select-none ${
        scrolledPast ? 'opacity-0 pointer-events-none' : 'opacity-100'
      } ${className}`}
    >
      <span
        className={`text-[10px] font-sans uppercase tracking-[0.25em] font-medium transition-colors ${
          isDark
            ? 'text-stone-300/80 hover:text-white'
            : 'text-stone-500 hover:text-charcoal-900'
        }`}
      >
        {label}
      </span>

      {/* Slim vertical track with animated drop */}
      <div
        className={`relative w-[1px] h-9 overflow-hidden rounded-full ${
          isDark ? 'bg-white/25' : 'bg-stone-300'
        }`}
      >
        <div
          className={`absolute top-0 left-0 w-full h-1/2 rounded-full animate-scroll-drop ${
            isDark
              ? 'bg-gradient-to-b from-transparent via-amber-300 to-white'
              : 'bg-gradient-to-b from-transparent via-[#8C6D46] to-[#C5A059]'
          }`}
        />
      </div>
    </div>
  );
}

export default ScrollCue;
