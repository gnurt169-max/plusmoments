'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="vi">
      <body className="min-h-screen flex items-center justify-center bg-[#FAF8F5] text-stone-900 font-sans p-6">
        <main id="main-content" className="max-w-md w-full text-center space-y-4">
          <div className="inline-block px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs uppercase tracking-widest font-medium">
            Hệ Thống Đang Nâng Cấp
          </div>
          <h1 className="text-2xl font-serif font-light text-stone-900">
            Đã có sự cố phát sinh
          </h1>
          <p className="text-xs text-stone-600 leading-relaxed">
            Hệ thống đang được làm mới hoặc kết nối tạm thời bị gián đoạn. Vui lòng bấm thử lại hoặc quay về trang chủ.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="px-6 py-2.5 rounded-full bg-[#9A6436] hover:bg-[#855328] text-white text-xs uppercase tracking-widest font-medium transition-all cursor-pointer shadow-sm"
            >
              Thử Lại
            </button>
            <a
              href="/"
              className="px-6 py-2.5 rounded-full border border-stone-300 hover:border-stone-900 text-stone-800 text-xs uppercase tracking-widest font-medium transition-all"
            >
              Về Trang Chủ
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}

