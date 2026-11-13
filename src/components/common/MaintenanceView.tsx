'use client';

import React from 'react';
import Link from 'next/link';
import {
  Wrench,
  Clock,
  Phone,
  MessageCircle,
  Sparkles,
  ShieldCheck,
  Lock,
} from 'lucide-react';

interface MaintenanceViewProps {
  notice?: string | null;
  hotline?: string;
  hotlineDisplay?: string;
  zaloUrl?: string;
  brandNamePart1?: string;
  brandNamePart2?: string;
  brandSubtitle?: string;
}

export function MaintenanceView({
  notice,
  hotline = '0908123456',
  hotlineDisplay = '0908.123.456',
  zaloUrl = 'https://zalo.me/0908123456',
  brandNamePart1 = 'PLUS',
  brandNamePart2 = 'MOMENTS',
  brandSubtitle = 'LUXURY WEDDING STUDIO',
}: MaintenanceViewProps) {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-charcoal-900 flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden font-sans">
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-champagne-gold/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-luxury-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Logo */}
      <div className="relative z-10 flex items-center justify-between max-w-5xl mx-auto w-full">
        <div className="flex flex-col">
          <span className="font-serif text-2xl font-light tracking-[0.2em] text-charcoal-900">
            {brandNamePart1}
            <span className="text-luxury-600 font-normal"> {brandNamePart2}</span>
          </span>
          <span className="text-[9px] uppercase tracking-[0.3em] text-stone-600 font-medium">
            {brandSubtitle}
          </span>
        </div>

        <Link
          href="/admin/login"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-200 bg-white/60 hover:bg-white text-stone-500 hover:text-stone-800 text-[11px] font-medium transition-all shadow-xs"
        >
          <Lock className="w-3 h-3 text-stone-400" />
          <span>Cổng Quản Trị</span>
        </Link>
      </div>

      {/* Main Center Announcement Card */}
      <main id="main-content" className="relative z-10 max-w-2xl mx-auto w-full text-center space-y-8 my-auto py-12">
        {/* Animated Badge Icon */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-100 via-champagne-gold/40 to-stone-100 flex items-center justify-center text-luxury-700 shadow-xl border border-champagne-gold/40">
            <Wrench className="w-10 h-10 text-luxury-700 drop-shadow-sm animate-pulse" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500" />
          </span>
        </div>

        {/* Headings */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-champagne/60 border border-champagne-gold/40 text-luxury-800 text-xs uppercase tracking-widest font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-luxury-600" />
            <span>Hệ Thống Đang Nâng Cấp Định Kỳ</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-light text-charcoal-900 tracking-tight leading-tight">
            Chúng Tôi Sẽ Sớm Trở Lại
          </h1>

          <p className="text-sm sm:text-base text-charcoal-600 font-light leading-relaxed max-w-lg mx-auto">
            {notice ||
              'PlusMoments đang tiến hành nâng cấp hệ thống máy chủ và tối ưu trải nghiệm bộ sưu tập ảnh cưới. Website sẽ hoạt động bình thường trở lại trong ít phút.'}
          </p>
        </div>

        {/* Direct Contact CTAs for Urgent Inquiries */}
        <div className="p-6 bg-white/80 border border-stone-200/80 rounded-3xl shadow-sm space-y-4 max-w-lg mx-auto backdrop-blur-xs">
          <p className="text-xs text-charcoal-500 uppercase tracking-wider font-semibold">
            Cần Tư Vấn Gói Chụp Cưới Khẩn Cấp?
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={`tel:${hotline}`}
              className="w-full sm:w-auto flex-1 py-3 px-5 rounded-full bg-charcoal-900 hover:bg-charcoal-800 text-white text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-champagne-light" />
              <span>Gọi: {hotlineDisplay}</span>
            </a>

            <a
              href={zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex-1 py-3 px-5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Nhắn Tin Zalo</span>
            </a>
          </div>

          <div className="flex items-center justify-center gap-4 text-[11px] text-charcoal-400 font-light pt-2">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-luxury-600" />
              Thời gian dự kiến: &lt; 30 phút
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Dữ liệu an toàn 100%
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <div className="relative z-10 text-center text-xs text-charcoal-400 font-light max-w-5xl mx-auto w-full border-t border-stone-200/60 pt-4">
        © 2026 PlusMoments Wedding Studio. All rights reserved.
      </div>
    </div>
  );
}

