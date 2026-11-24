'use client';

import React, { useEffect, useRef, useState } from 'react';

interface InvitationSectionRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  showGoldDivider?: boolean;
}

export function InvitationSectionReveal({
  children,
  className = '',
  delay = 0,
  showGoldDivider = false,
}: InvitationSectionRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.12,
        rootMargin: '40px 0px 0px 0px',
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={elementRef}
      className={`transition-all duration-700 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {showGoldDivider && (
        <div className="w-full flex justify-center mb-6">
          <div
            className={`h-[1px] transition-all duration-1000 ease-out transform ${
              isVisible ? 'w-24 opacity-80 scale-x-100' : 'w-0 opacity-0 scale-x-0'
            }`}
            style={{
              background: 'linear-gradient(90deg, transparent, var(--inv-accent, #C5A059), transparent)',
            }}
          />
        </div>
      )}
      {children}
    </div>
  );
}
