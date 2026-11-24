'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Sparkles } from 'lucide-react';

export interface FloatingStoryPillProps {
  title: string;
  type?: 'album' | 'blog';
  conceptName?: string;
  targetFormId?: string;
  targetContentId?: string;
  targetCtaZoneId?: string;
}

/**
 * FloatingStoryPill: Luxury Editorial Floating Story & Consultation Pill for PlusMoments Studio.
 * - WCAG AAA Compliant Luxury Deep Charcoal theme (solid contrast, zero background bleed).
 * - Scoped reading progress exclusively calculated on actual article/gallery content (0% -> 100%).
 * - Auto-hides when entering CTA zones (pricing package, consultation box, footer) via IntersectionObserver.
 * - Sized & positioned to never collide with floating concierge dock on mobile (max-w-[calc(100vw-110px)]).
 */
export function FloatingStoryPill({
  title,
  type = 'album',
  conceptName,
  targetFormId = 'consultation-section',
  targetContentId,
  targetCtaZoneId,
}: FloatingStoryPillProps) {
  const [visible, setVisible] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [isCtaZoneInView, setIsCtaZoneInView] = useState(false);

  // 1. Observe CTA zones (Linked Package, Bottom Consultation, Footer)
  useEffect(() => {
    const candidateIds = [
      targetCtaZoneId,
      'linked-package-section',
      'consultation-section',
      'footer',
    ].filter(Boolean) as string[];

    const elements = candidateIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Any CTA element visible in viewport sets isCtaZoneInView to true
        const anyIntersecting = entries.some((entry) => entry.isIntersecting);
        setIsCtaZoneInView(anyIntersecting);
      },
      {
        threshold: 0.05,
        rootMargin: '40px 0px 0px 0px',
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [targetCtaZoneId]);

  // 2. Calculate Reading/Viewing Progress scoped to content element
  useEffect(() => {
    let ticking = false;

    const updatePill = () => {
      let progress = 0;

      if (targetContentId) {
        const targetEl = document.getElementById(targetContentId);
        if (targetEl) {
          const rect = targetEl.getBoundingClientRect();
          const startY = rect.top + window.scrollY - window.innerHeight * 0.25;
          const endY = rect.bottom + window.scrollY - window.innerHeight * 0.75;
          const range = Math.max(1, endY - startY);
          const rawProgress = (window.scrollY - startY) / range;
          progress = Math.min(100, Math.max(0, Math.round(rawProgress * 100)));
        }
      }

      // Fallback if targetContentId is not supplied or element not found
      if (!targetContentId && progress === 0) {
        const scrollY = window.scrollY || window.pageYOffset || 0;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight > 0) {
          progress = Math.min(100, Math.max(0, Math.round((scrollY / docHeight) * 100)));
        }
      }

      setProgressPercent(progress);

      // Only show when inside the reading range [8%, 96%] AND CTA zone is not in view
      const shouldShow = progress >= 8 && progress <= 96 && !isCtaZoneInView;
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
  }, [targetContentId, isCtaZoneInView]);

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
      className={`fixed bottom-4 left-3 right-[122px] sm:right-auto sm:left-1/2 sm:-translate-x-1/2 z-40 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        visible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : 'translate-y-4 opacity-0 pointer-events-none'
      }`}
    >
      {/* 1. MOBILE COMPACT PILL (< sm): Sized safely within left-3 right-[122px] to completely avoid Zalo/Chat dock */}
      <div className="sm:hidden bg-[#1C1917]/[0.96] backdrop-blur-md text-[#FAF8F5] border border-[#C5A059]/35 shadow-[0_12px_30px_rgba(0,0,0,0.35)] rounded-full px-2.5 py-1.5 flex items-center justify-between gap-1.5 w-full">
        {/* Left: Gold Dot + Title (truncate) + Progress */}
        <div className="flex items-center gap-1.5 min-w-0 pr-1">
          <div className="w-2 h-2 rounded-full bg-[#E5C585] animate-pulse shrink-0 shadow-[0_0_8px_rgba(229,197,133,0.6)]" />
          <div className="flex flex-col min-w-0">
            <span className="font-serif font-normal text-[#FAF8F5] truncate text-xs leading-tight">
              {title}
            </span>
            <span className="text-[10px] text-[#E5C585] font-mono tracking-tight font-medium">
              {verbText} {progressPercent}%
            </span>
          </div>
        </div>

        {/* Right: Compact button 'Tư vấn' */}
        <button
          type="button"
          onClick={handleScrollToForm}
          aria-label={`Tư vấn concept ${conceptName || title}`}
          className="px-2.5 py-1.5 rounded-full bg-gradient-to-r from-[#C5A059] to-[#D4AF37] hover:from-[#B88E3E] hover:to-[#C5A059] text-[#1C1917] text-[11px] font-bold uppercase tracking-wider transition-all shadow-xs shrink-0 flex items-center gap-1 active:scale-95 cursor-pointer whitespace-nowrap"
        >
          <span>Tư vấn</span>
          <Sparkles className="w-3 h-3 text-[#1C1917] shrink-0" />
        </button>
      </div>

      {/* 2. DESKTOP FULL PILL (>= sm): Centered with full typography and luxury styling */}
      <div className="hidden sm:flex bg-[#1C1917]/[0.96] backdrop-blur-md text-[#FAF8F5] border border-[#C5A059]/35 shadow-[0_14px_34px_rgba(0,0,0,0.28)] rounded-full px-4 py-2 items-center gap-3.5 max-w-lg">
        {/* Progress & Title */}
        <div className="flex items-center gap-2 min-w-0 pr-1">
          <div className="w-2 h-2 rounded-full bg-[#E5C585] animate-pulse shrink-0 shadow-[0_0_8px_rgba(229,197,133,0.6)]" />
          <div className="flex flex-col min-w-0">
            <span className="font-serif font-normal text-[#FAF8F5] truncate max-w-[210px] text-[13px] leading-tight">
              {title}
            </span>
            <span className="text-[10px] text-[#E5C585] font-mono tracking-tight font-medium">
              {verbText} {progressPercent}% {actionText}
            </span>
          </div>
        </div>

        {/* Vertical divider */}
        <div className="w-[1px] h-6 bg-[#C5A059]/30 shrink-0" />

        {/* High-Contrast Bold CTA Button */}
        <button
          type="button"
          onClick={handleScrollToForm}
          aria-label={`Tư vấn concept ${conceptName || title}`}
          className="px-4 py-2 rounded-full bg-gradient-to-r from-[#C5A059] to-[#D4AF37] hover:from-[#B88E3E] hover:to-[#C5A059] text-[#1C1917] text-xs uppercase tracking-wider font-bold transition-all shadow-sm shrink-0 flex items-center gap-1.5 active:scale-95 cursor-pointer whitespace-nowrap"
        >
          <span>Tư Vấn Concept</span>
          <Sparkles className="w-3.5 h-3.5 text-[#1C1917] shrink-0" />
        </button>
      </div>
    </div>
  );
}

export default FloatingStoryPill;
