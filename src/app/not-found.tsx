import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <main id="main-content" className="min-h-[70vh] flex items-center justify-center bg-[#FAF8F5] text-charcoal-900 font-sans px-4 py-20">
      <div className="max-w-lg w-full text-center space-y-6">
        <div className="inline-block px-4 py-1.5 rounded-full bg-stone-100 text-[#7A6243] text-xs uppercase tracking-widest font-medium">
          404 &bull; Trang Không Tồn Tại
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-charcoal-900 font-light">
          Không Tìm Thấy Trang Yêu Cầu
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light max-w-md mx-auto">
          Trang bạn đang tìm kiếm có thể đã được đổi tên, chuyển đi hoặc tạm thời không khả dụng.
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="px-8 py-3 rounded-full bg-[#9A6436] hover:bg-[#855328] text-white text-xs uppercase tracking-widest font-medium transition-all shadow-md"
          >
            Về Trang Chủ &rarr;
          </Link>
          <Link
            href="/bo-suu-tap"
            className="px-8 py-3 rounded-full border border-stone-300 hover:border-stone-900 text-charcoal-800 text-xs uppercase tracking-widest font-medium transition-all"
          >
            Xem Bộ Sưu Tập
          </Link>
        </div>
      </div>
    </main>
  );
}

