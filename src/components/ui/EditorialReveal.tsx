'use client';

import React, { useEffect, useRef, useState } from 'react';

export interface EditorialRevealProps {
  children: React.ReactNode;
  delay?: number; // ms delay for stagger effect
  direction?: 'up' | 'fade';
  className?: string;
  as?: React.ElementType;
  threshold?: number;
  rootMargin?: string;
  id?: string;
  style?: React.CSSProperties;
}

/**
 * EditorialReveal: Premium Scroll-Reveal motion component for PlusMoments Luxury Wedding Studio.
 * - Hardware-accelerated transitions with cubic-bezier easing.
 * - IntersectionObserver with one-way trigger (unobserves and disconnects on first view) to eliminate jitter.
 * - Subtle 12px translation (translate-y-3) preventing layout jarring.
 * - 100% accessible: respects prefers-reduced-motion media query.
 */
export function EditorialReveal({
  children,
  delay = 0,
  direction = 'up',
  className = '',
  as: Component = 'div',
  threshold = 0.1,
  rootMargin = '0px 0px -40px 0px',
  id,
  style = {},
}: EditorialRevealProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);
  const hasRevealedRef = useRef(false);

  useEffect(() => {
    // Already revealed once - never re-attach or revert
    if (hasRevealedRef.current) return;

    // If user prefers reduced motion, reveal immediately with no animation
    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      hasRevealedRef.current = true;
      setIsRevealed(true);
      return;
    }

    // Fallback if IntersectionObserver is unavailable
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      hasRevealedRef.current = true;
      setIsRevealed(true);
      return;
    }

    const currentElement = elementRef.current;
    if (!currentElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          hasRevealedRef.current = true;
          setIsRevealed(true);
          observer.unobserve(entry.target);
          observer.disconnect(); // One-time permanent reveal
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(currentElement);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin]);

  // Reduced translation to 12px (translate-y-3) to prevent jarring layout shift
  const initialTransform = direction === 'up' ? 'translate-y-3' : '';
  const revealedTransform = 'translate-y-0';

  const motionClasses = isRevealed
    ? `opacity-100 ${revealedTransform}`
    : `opacity-0 ${initialTransform}`;

  const combinedStyle: React.CSSProperties = {
    ...style,
    transitionDelay: delay > 0 ? `${delay}ms` : undefined,
  };

  return (
    <Component
      ref={elementRef}
      id={id}
      style={combinedStyle}
      className={`transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[transform,opacity] motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:transform-none ${motionClasses} ${className}`}
    >
      {children}
    </Component>
  );
}

export default EditorialReveal;
