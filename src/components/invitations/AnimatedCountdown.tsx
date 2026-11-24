'use client';

import React, { useEffect, useState } from 'react';

interface AnimatedCountdownProps {
  ceremonyDate: string | Date;
  isDark?: boolean;
}

function DigitBox({ value, label, isDark = false }: { value: number; label: string; isDark?: boolean }) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (value !== displayValue) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setDisplayValue(value);
        setIsAnimating(false);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [value, displayValue]);

  return (
    <div className={`p-2 sm:p-3.5 rounded-2xl ${
      isDark ? 'bg-[#25221F] border-white/10' : 'bg-stone-50 border-stone-200/60'
    } border shadow-2xs`}>
      <div className="h-8 sm:h-9 overflow-hidden flex items-center justify-center">
        <div
          className={`text-xl sm:text-2xl font-serif font-bold ${
            isDark ? 'text-[#FAF8F5]' : 'text-[#1C1917]'
          } transition-all duration-300 transform ${
            isAnimating ? '-translate-y-full opacity-0 scale-90' : 'translate-y-0 opacity-100 scale-100'
          }`}
        >
          {String(displayValue).padStart(2, '0')}
        </div>
      </div>
      <div className={`text-[10px] font-mono ${
        isDark ? 'text-[#E5C585]' : 'text-[#8C6D46]'
      } uppercase tracking-wider mt-1`}>
        {label}
      </div>
    </div>
  );
}

export function AnimatedCountdown({ ceremonyDate, isDark = false }: AnimatedCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const target = new Date(ceremonyDate).getTime();
    if (isNaN(target)) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = target - now;

      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [ceremonyDate]);

  return (
    <div className={`my-10 p-6 sm:p-8 rounded-3xl ${
      isDark ? 'bg-[#1C1917] border-white/10' : 'bg-white border-stone-200/90'
    } border shadow-sm max-w-sm mx-auto text-center`}>
      <div className={`text-[11px] font-mono uppercase tracking-[0.2em] ${
        isDark ? 'text-[#E5C585]' : 'text-[#8C6D46]'
      } font-semibold mb-4`}>
        Đếm Ngược Đến Ngày Chung Đôi
      </div>
      <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
        <DigitBox value={timeLeft.days} label="Ngày" isDark={isDark} />
        <DigitBox value={timeLeft.hours} label="Giờ" isDark={isDark} />
        <DigitBox value={timeLeft.minutes} label="Phút" isDark={isDark} />
        <DigitBox value={timeLeft.seconds} label="Giây" isDark={isDark} />
      </div>
    </div>
  );
}
