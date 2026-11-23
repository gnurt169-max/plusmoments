'use client';

import React, { useEffect, useState } from 'react';

interface CelebrationConfettiProps {
  active: boolean;
  onComplete?: () => void;
}

interface ConfettiPiece {
  id: number;
  left: number; // percentage
  size: number;
  color: string;
  delay: number;
  duration: number;
  rotation: number;
}

const LUXURY_PALETTE = ['#D4AF37', '#E8C170', '#C5A059', '#F6E4D1', '#FFF4E0', '#8C6D46'];

export function CelebrationConfetti({ active, onComplete }: CelebrationConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (!active) {
      setPieces([]);
      return;
    }

    const generated: ConfettiPiece[] = Array.from({ length: 38 }).map((_, i) => ({
      id: i,
      left: Math.random() * 96 + 2,
      size: Math.random() * 8 + 6,
      color: LUXURY_PALETTE[i % LUXURY_PALETTE.length],
      delay: Math.random() * 0.4,
      duration: Math.random() * 1.5 + 1.8,
      rotation: Math.random() * 360,
    }));

    setPieces(generated);

    const timer = setTimeout(() => {
      setPieces([]);
      if (onComplete) onComplete();
    }, 2600);

    return () => clearTimeout(timer);
  }, [active, onComplete]);

  if (!active || pieces.length === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden select-none"
    >
      <style jsx>{`
        @keyframes confettiFall {
          0% {
            transform: translate3d(0, -20px, 0) rotate(0deg);
            opacity: 1;
          }
          80% {
            opacity: 0.9;
          }
          100% {
            transform: translate3d(calc(sin(var(--confetti-rot)) * 60px), 105vh, 0) rotate(720deg);
            opacity: 0;
          }
        }
        .confetti-piece {
          animation-name: confettiFall;
          animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
          animation-fill-mode: forwards;
          will-change: transform, opacity;
        }
      `}</style>

      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece absolute top-0 block rounded-xs shadow-xs"
          style={
            {
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size * 1.4}px`,
              backgroundColor: p.color,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              '--confetti-rot': `${p.rotation}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
