'use client';

import React, { useEffect, useRef } from 'react';

/**
 * ScrollProgressBar: Luxury Editorial Reading Progress Bar for PlusMoments Studio.
 * - Hardware-accelerated GPU transform (scaleX) with left origin to guarantee 60fps and zero reflow.
 * - Champagne gold luxury gradient.
 * - Passive scroll event listener with requestAnimationFrame throttling.
 */
export function ScrollProgressBar() {
  const barRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let ticking = false;

    const updateProgress = () => {
      if (!barRef.current) return;
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;

      if (docHeight <= 0) {
        barRef.current.style.transform = 'scaleX(0)';
        ticking = false;
        return;
      }

      const progress = Math.min(1, Math.max(0, scrollY / docHeight));
      barRef.current.style.transform = `scaleX(${progress})`;
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateProgress);
        ticking = true;
      }
    };

    // Initial calculation
    updateProgress();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-50 pointer-events-none h-[2.5px] bg-transparent"
    >
      <div
        ref={barRef}
        style={{ transform: 'scaleX(0)', transformOrigin: 'left center' }}
        className="h-full w-full bg-gradient-to-r from-[#8C6D46] via-[#C5A059] to-[#8C6D46] will-change-transform shadow-[0_1px_4px_rgba(197,160,89,0.35)]"
      />
    </div>
  );
}

export default ScrollProgressBar;
