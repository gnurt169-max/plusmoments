'use client';

import React, { useMemo } from 'react';

interface Particle {
  id: number;
  left: number; // percentage
  size: number; // px
  delay: number; // s
  duration: number; // s
  opacity: number;
  type: 'circle' | 'petal';
}

export function AmbientParticles() {
  const particles: Particle[] = useMemo(() => {
    // 14 particles distributed across the width
    return Array.from({ length: 14 }).map((_, i) => ({
      id: i,
      left: 5 + (i * 92) / 14 + (Math.sin(i * 3) * 3),
      size: i % 3 === 0 ? 6 : i % 2 === 0 ? 8 : 4,
      delay: (i * 0.7) % 5,
      duration: 10 + (i % 5) * 2,
      opacity: 0.25 + (i % 4) * 0.15,
      type: i % 4 === 0 ? 'petal' : 'circle',
    }));
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-30 overflow-hidden select-none"
    >
      <style jsx>{`
        @keyframes ambientFloat {
          0% {
            transform: translate3d(0, 105vh, 0) rotate(0deg);
            opacity: 0;
          }
          15% {
            opacity: var(--particle-opacity, 0.5);
          }
          85% {
            opacity: var(--particle-opacity, 0.5);
          }
          100% {
            transform: translate3d(calc(sin(var(--particle-id, 1)) * 40px), -10vh, 0) rotate(360deg);
            opacity: 0;
          }
        }
        .ambient-particle {
          animation-name: ambientFloat;
          animation-iteration-count: infinite;
          animation-timing-function: linear;
          will-change: transform, opacity;
        }
      `}</style>

      {particles.map((p) => (
        <span
          key={p.id}
          className="ambient-particle absolute bottom-0 block pointer-events-none"
          style={
            {
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: p.type === 'petal' ? `${p.size * 1.5}px` : `${p.size}px`,
              borderRadius: p.type === 'petal' ? '80% 0 80% 0' : '50%',
              backgroundColor: p.type === 'petal' ? '#F6E4D1' : '#D4AF37',
              boxShadow: '0 0 8px rgba(212, 175, 55, 0.4)',
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              '--particle-opacity': p.opacity,
              '--particle-id': p.id,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
