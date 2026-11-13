'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw, Home, Sparkles } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log exception for debugging without exposing raw details to visitor
    console.error('[PLUSMOMENTS_APP_ERROR]:', error);
  }, [error]);

  return (
    <main
      id="main-content"
      className="min-h-[75vh] flex items-center justify-center bg-[#FAF8F5] text-charcoal-900 font-sans px-4 py-20 select-none"
    >
      <div className="max-w-lg w-full text-center space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-[#E8E2D9] shadow-sm">
        {/* Status Badge */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-50 text-amber-900 text-xs uppercase tracking-widest font-semibold border border-amber-200/80">
          <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
          <span>Sự Cố Kết Nối Tạm Thời</span>
        </div>

        {/* Heading */}
        <h1 className="font-serif text-2xl sm:text-3xl text-charcoal-900 font-normal leading-snug">
          Đã Xảy Ra Gián Đoạn Kết Nối
        </h1>

        {/* Description */}
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light max-w-md mx-auto">
          Hệ thống gặp sự cố tạm thời khi tải nội dung này. Bạn có thể nhấn thử tải lại trang hoặc quay về trang chủ của PlusMoments.
        </p>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            aria-label="Thử tải lại nội dung trang này"
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#2E2824] hover:bg-[#1A1614] active:scale-95 text-white text-xs uppercase tracking-wider font-semibold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880] focus-visible:ring-offset-2"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-300" />
            <span>Thử Tải Lại Trang</span>
          </button>

          <Link
            href="/"
            aria-label="Quay về trang chủ PlusMoments"
            className="w-full sm:w-auto px-7 py-3 rounded-xl border border-stone-300 hover:border-stone-800 text-charcoal-800 text-xs uppercase tracking-wider font-semibold transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880] focus-visible:ring-offset-2"
          >
            <Home className="w-3.5 h-3.5 text-stone-600" />
            <span>Về Trang Chủ</span>
          </Link>
        </div>

        {/* Subtle Brand Watermark */}
        <div className="pt-4 border-t border-stone-100 flex items-center justify-center gap-1.5 text-[11px] text-stone-400 font-mono">
          <Sparkles className="w-3 h-3 text-amber-600/50" />
          <span>PlusMoments Luxury Wedding Studio</span>
        </div>
      </div>
    </main>
  );
}

