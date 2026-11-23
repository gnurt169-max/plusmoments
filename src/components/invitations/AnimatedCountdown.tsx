'use client';

import React, { useEffect, useState } from 'react';

interface AnimatedCountdownProps {
  ceremonyDate: string | Date;
}

function DigitBox({ value, label }: { value: number; label: string }) {
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
    <div className="p-2 sm:p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200/50 dark:border-stone-700/50 shadow-2xs">
      <div className="h-8 sm:h-9 overflow-hidden flex items-center justify-center">
        <div
          className={`text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 transition-all duration-300 transform ${
            isAnimating ? '-translate-y-full opacity-0 scale-90' : 'translate-y-0 opacity-100 scale-100'
          }`}
        >
          {String(displayValue).padStart(2, '0')}
        </div>
      </div>
      <div className="text-[10px] font-mono text-[#8C6D46] uppercase tracking-wider mt-1">
        {label}
      </div>
    </div>
  );
}

export function AnimatedCountdown({ ceremonyDate }: AnimatedCountdownProps) {
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
    <div className="my-10 p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-sm max-w-sm mx-auto text-center">
      <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#8C6D46] mb-4">
        Đếm Ngược Đến Ngày Chung Đôi
      </div>
      <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
        <DigitBox value={timeLeft.days} label="Ngày" />
        <DigitBox value={timeLeft.hours} label="Giờ" />
        <DigitBox value={timeLeft.minutes} label="Phút" />
        <DigitBox value={timeLeft.seconds} label="Giây" />
      </div>
    </div>
  );
}
