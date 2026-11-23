'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

export interface FloatingStoryPillProps {
  title: string;
  type?: 'album' | 'blog';
  conceptName?: string;
  targetFormId?: string;
}

/**
 * FloatingStoryPill: Luxury Editorial Floating Story & Consultation Pill for PlusMoments Studio.
 * - Smoothly slides up from bottom-5 when user has scrolled past 35% of page content.
 * - Auto-hides when nearing the very bottom (footer / consultation box).
 * - Displays truncated title + scroll reading progress (e.g. "Đã xem 65% câu chuyện").
 * - Features high-contrast compact CTA "Tư vấn Concept này" that smoothly scrolls to the consultation form.
 */
export function FloatingStoryPill({
  title,
  type = 'album',
  conceptName,
  targetFormId = 'consultation-section',
}: FloatingStoryPillProps) {
  const [visible, setVisible] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);

  useEffect(() => {
    let ticking = false;

    const updatePill = () => {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;

      if (docHeight <= 0) {
        setVisible(false);
        ticking = false;
        return;
      }

      const fraction = Math.min(1, Math.max(0, scrollY / docHeight));
      const percent = Math.round(fraction * 100);
      setProgressPercent(percent);

      // Show between 35% and 88% of page height (disappears when reaching bottom consultation area)
      const shouldShow = percent >= 35 && percent <= 88;
      setVisible(shouldShow);
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updatePill);
        ticking = true;
      }
    };

    updatePill();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const handleScrollToForm = () => {
    const el = document.getElementById(targetFormId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
    }
  };

  const actionText = type === 'album' ? 'câu chuyện' : 'bài viết';
  const verbText = type === 'album' ? 'Đã xem' : 'Đã đọc';

  return (
    <div
      aria-hidden={!visible}
      className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-40 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        visible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : 'translate-y-8 opacity-0 pointer-events-none'
      }`}
    >
      <div className="backdrop-blur-md bg-[#FAF8F5]/92 border border-[#E5DFD5] shadow-xl hover:shadow-2xl rounded-full px-3.5 py-1.5 sm:px-4 sm:py-2 flex items-center gap-2.5 sm:gap-4 max-w-[94vw] sm:max-w-lg transition-all">
        {/* Progress & Title */}
        <div className="flex items-center gap-2 min-w-0 pr-1">
          {/* Mini progress dot */}
          <div className="w-2 h-2 rounded-full bg-[#8C6D46] animate-pulse shrink-0" />

          <div className="flex flex-col min-w-0">
            <span className="font-serif font-light text-charcoal-900 truncate max-w-[120px] sm:max-w-[210px] text-xs sm:text-[13px] leading-tight">
              {title}
            </span>
            <span className="text-[10px] text-stone-500 font-mono">
              {verbText} {progressPercent}% {actionText}
            </span>
          </div>
        </div>

        {/* Vertical divider */}
        <div className="w-[1px] h-6 bg-stone-300/80 shrink-0" />

        {/* CTA Button */}
        <button
          type="button"
          onClick={handleScrollToForm}
          aria-label={`Tư vấn concept ${conceptName || title}`}
          className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#8C6D46] hover:bg-[#785934] text-white text-[10px] sm:text-xs uppercase tracking-wider font-medium transition-all shadow-xs shrink-0 flex items-center gap-1 active:scale-95 cursor-pointer whitespace-nowrap"
        >
          <span>Tư vấn Concept</span>
          <Sparkles className="w-3 h-3 text-amber-200 shrink-0" />
        </button>
      </div>
    </div>
  );
}

export default FloatingStoryPill;
