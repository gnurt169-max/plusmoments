'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Calendar as CalendarIcon, Heart } from 'lucide-react';

interface SaveTheDateCalendarProps {
  ceremonyDate: string | Date;
  themeColor?: string;
}

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

export function SaveTheDateCalendar({ ceremonyDate, themeColor = '#8C6D46' }: SaveTheDateCalendarProps) {
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const dateObj = useMemo(() => {
    const d = new Date(ceremonyDate);
    return isNaN(d.getTime()) ? new Date() : d;
  }, [ceremonyDate]);

  const year = dateObj.getFullYear();
  const month = dateObj.getMonth(); // 0 - 11
  const weddingDay = dateObj.getDate();

  // Calculate calendar grid
  const calendarCells = useMemo(() => {
    // First day of month (0 is Sunday, 1 is Monday, ...)
    const firstDay = new Date(year, month, 1).getDay();
    // In Vietnam, Monday is index 0: T2=0, T3=1, ..., CN=6
    const offset = firstDay === 0 ? 6 : firstDay - 1;

    // Number of days in current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: Array<{ day: number | null; isWeddingDay: boolean }> = [];

    // Empty cells before first day
    for (let i = 0; i < offset; i++) {
      cells.push({ day: null, isWeddingDay: false });
    }

    // Days of month
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({
        day: d,
        isWeddingDay: d === weddingDay,
      });
    }

    return cells;
  }, [year, month, weddingDay]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={sectionRef}
      className="my-10 p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-sm max-w-sm mx-auto text-center"
    >
      {/* Calendar Header */}
      <div className="flex items-center justify-center gap-2 mb-2 text-stone-500 text-xs font-mono uppercase tracking-widest">
        <CalendarIcon className="w-3.5 h-3.5 text-[#8C6D46]" />
        <span>Tháng {month + 1}, {year}</span>
      </div>

      <div className="font-serif text-lg font-medium text-stone-900 dark:text-stone-100 mb-6">
        Save Our Date
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2 text-[11px] font-mono text-stone-400">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1 text-xs">
        {calendarCells.map((cell, idx) => {
          if (!cell.day) {
            return <div key={`empty-${idx}`} className="h-9 w-9" />;
          }

          if (cell.isWeddingDay) {
            return (
              <div
                key={`day-${cell.day}`}
                className="relative h-9 w-9 mx-auto flex items-center justify-center font-bold text-amber-950 dark:text-amber-100"
              >
                {/* Animated SVG Hand-Drawn Heart */}
                <svg
                  viewBox="0 0 100 100"
                  className="absolute inset-0 w-full h-full pointer-events-none transform -rotate-6 scale-110"
                >
                  <path
                    d="M 50 28 C 50 12, 28 12, 22 24 C 14 38, 30 62, 50 82 C 70 62, 86 38, 78 24 C 72 12, 50 12, 50 28 Z"
                    fill="none"
                    stroke="#C5A059"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      strokeDasharray: 260,
                      strokeDashoffset: isInView ? 0 : 260,
                      transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1) 0.3s',
                    }}
                  />
                </svg>

                <span className="relative z-10 text-[13px]">{cell.day}</span>
              </div>
            );
          }

          return (
            <div
              key={`day-${cell.day}`}
              className="h-9 w-9 mx-auto flex items-center justify-center text-stone-700 dark:text-stone-300 rounded-full"
            >
              <span>{cell.day}</span>
            </div>
          );
        })}
      </div>

      {/* Caption under calendar */}
      <div className="mt-5 pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-center gap-1.5 text-xs text-[#8C6D46] font-serif italic">
        <Heart className="w-3 h-3 fill-[#8C6D46] text-[#8C6D46]" />
        <span>Ngày chúng mình về chung một nhà</span>
      </div>
    </div>
  );
}
