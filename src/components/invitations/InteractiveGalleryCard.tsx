'use client';

import React, { useState, useRef } from 'react';
import { Heart } from 'lucide-react';
import { ProgressiveImage } from '@/components/ui/ProgressiveImage';
import { InvitationGalleryImage } from '@/lib/invitations/templates';

interface InteractiveGalleryCardProps {
  image: InvitationGalleryImage;
  coupleTitle: string;
}

interface FloatingHeart {
  id: number;
  x: number;
  y: number;
}

export function InteractiveGalleryCard({ image, coupleTitle }: InteractiveGalleryCardProps) {
  const [likesCount, setLikesCount] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([]);
  const lastTapRef = useRef<number>(0);

  const isPortrait = image.orientation === 'portrait';

  const triggerHeartBurst = (clientX?: number, clientY?: number, rect?: DOMRect) => {
    let x = 50;
    let y = 50;
    if (clientX && clientY && rect) {
      x = ((clientX - rect.left) / rect.width) * 100;
      y = ((clientY - rect.top) / rect.height) * 100;
    }

    const newHeart: FloatingHeart = {
      id: Date.now() + Math.random(),
      x,
      y,
    };

    setFloatingHearts((prev) => [...prev, newHeart]);
    setLikesCount((prev) => prev + 1);
    setIsLiked(true);

    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 900);
  };

  // Handle Double Tap on Image
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      const rect = e.currentTarget.getBoundingClientRect();
      triggerHeartBurst(e.clientX, e.clientY, rect);
    }
    lastTapRef.current = now;
  };

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-xs border border-stone-200/80 group">
      {/* Image Container with Double Tap */}
      <div
        onClick={handleContainerClick}
        className="relative w-full cursor-pointer select-none"
      >
        <ProgressiveImage
          src={image.url}
          alt={image.caption || `Ảnh cưới ${coupleTitle}`}
          aspectRatio={isPortrait ? '3/4' : '3/2'}
          orientation={isPortrait ? 'portrait' : 'landscape'}
          className="w-full"
          imageClassName="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
        />

        {/* Floating Heart Burst Animations */}
        {floatingHearts.map((h) => (
          <div
            key={h.id}
            className="absolute pointer-events-none z-20 transform -translate-x-1/2 -translate-y-1/2 animate-[heartBurst_0.9s_ease-out_forwards]"
            style={{ left: `${h.x}%`, top: `${h.y}%` }}
          >
            <Heart className="w-12 h-12 text-[#E5C158] fill-[#E5C158] drop-shadow-lg" />
          </div>
        ))}

        {/* Mini Heart Button at top right */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            const rect = e.currentTarget.parentElement?.getBoundingClientRect();
            triggerHeartBurst(undefined, undefined, rect);
          }}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-xs flex items-center justify-center text-white transition-all transform active:scale-75"
          title="Thả tim cho bức ảnh này"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isLiked ? 'text-rose-400 fill-rose-400' : 'text-white'
            }`}
          />
        </button>

        {/* Likes Count pill */}
        {likesCount > 0 && (
          <div className="absolute bottom-3 right-3 z-10 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-xs text-[10px] text-white font-mono flex items-center gap-1 animate-fade-in">
            <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
            <span>{likesCount}</span>
          </div>
        )}
      </div>

      {image.caption && (
        <div className="p-3.5 text-center text-xs text-stone-500 italic bg-white dark:bg-stone-900 border-t border-stone-100 dark:border-stone-800">
          {image.caption}
        </div>
      )}

      <style jsx>{`
        @keyframes heartBurst {
          0% {
            transform: translate(-50%, -50%) scale(0.4);
            opacity: 1;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.3) rotate(-8deg);
            opacity: 0.9;
          }
          100% {
            transform: translate(-50%, -100px) scale(1) rotate(6deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
