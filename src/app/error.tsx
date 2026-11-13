'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { RotateCcw, Home, Sparkles, HelpCircle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log exception for debugging without exposing raw details to visitors
    console.error('[PlusMoments Error Boundary]:', error);
  }, [error]);

  return (
    <main
      id="main-content"
      className="min-h-[70vh] flex items-center justify-center bg-[#FAF8F5] text-charcoal-900 font-sans px-4 py-20"
    >
      <div className="max-w-lg w-full text-center space-y-6">
        {/* Subtle Luxury Status Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-100 text-[#7A6243] text-xs uppercase tracking-widest font-medium">
          <Sparkles className="w-3.5 h-3.5 text-[#9A6436]" />
          <span>Thông Báo Trải Nghiệm</span>
        </div>

        {/* Heading */}
        <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl text-charcoal-900 font-light leading-snug">
          Đã có gián đoạn nhỏ trong quá trình tải trang
        </h1>

        {/* Reassuring Description */}
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light max-w-md mx-auto">
          Hệ thống gặp gián đoạn tạm thời khi kết nối. Bạn có thể thử tải lại trang hoặc quay về trang chủ để tiếp tục khám phá các khoảnh khắc cưới.
        </p>

        {/* Action Buttons (min-h-[44px] for Touch Targets & A11y) */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => reset()}
            aria-label="Thử tải lại nội dung trang này"
            className="min-h-[44px] px-8 py-3 rounded-full bg-[#9A6436] hover:bg-[#855328] active:scale-95 text-white text-xs uppercase tracking-widest font-medium transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880] focus-visible:ring-offset-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Thử Tải Lại Trang</span>
          </button>

          <Link
            href="/"
            aria-label="Quay về trang chủ PlusMoments"
            className="min-h-[44px] px-8 py-3 rounded-full border border-stone-300 hover:border-stone-900 text-charcoal-800 text-xs uppercase tracking-widest font-medium transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880] focus-visible:ring-offset-2"
          >
            <Home className="w-4 h-4 text-stone-600" />
            <span>Về Trang Chủ &rarr;</span>
          </Link>
        </div>

        {/* Support Hotline Hint */}
        <div className="pt-6 border-t border-stone-200/60 flex items-center justify-center gap-2 text-xs text-stone-500 font-light">
          <HelpCircle className="w-3.5 h-3.5 text-stone-400" />
          <span>Cần hỗ trợ nhanh? Hotline studio: </span>
          <a
            href="tel:0903768871"
            className="font-medium text-[#9A6436] hover:underline"
          >
            0903.768.871
          </a>
        </div>
      </div>
    </main>
  );
}
