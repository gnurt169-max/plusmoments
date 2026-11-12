'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Phone, Sparkles, X, ChevronUp, Gift } from 'lucide-react';
import { useContact } from '@/context/ContactContext';
import { trackHotlineClick, trackZaloClick } from '@/lib/tracking';

const ConsultationForm = dynamic(
  () => import('@/components/home/ConsultationForm').then((mod) => mod.ConsultationForm),
  { ssr: false }
);

export function MobileBottomBar() {
  const { contact } = useContact();
  const [mounted, setMounted] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  // Trì hoãn khởi tạo action bar di động khi trình duyệt rảnh (giải phóng Main-Thread)
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(() => setMounted(true));
      return () => window.cancelIdleCallback(id);
    } else {
      const timer = setTimeout(() => setMounted(true), 150);
      return () => clearTimeout(timer);
    }
  }, []);

  // Clean phone number for tel: protocol
  const rawPhone = contact.hotline || '0903768871';
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
  const displayPhone = contact.hotlineDisplay || '0903.768.871';

  // Zalo URL
  const zaloUrl = contact.zaloUrl || `https://zalo.me/${cleanPhone}`;

  // Prevent background scroll when bottom sheet is open
  useEffect(() => {
    if (isBottomSheetOpen) {
      document.body.style.overflow = 'hidden';
    } else if (document.body.style.overflow === 'hidden') {
      document.body.style.overflow = '';
    }
    return () => {
      if (document.body.style.overflow === 'hidden') {
        document.body.style.overflow = '';
      }
    };
  }, [isBottomSheetOpen]);

  if (!mounted) return null;

  const handlePhoneClick = () => {
    trackHotlineClick(
      cleanPhone,
      'mobile_sticky_bottom_bar',
      contact.googleAdsPhoneConversionLabel
    );
    window.location.href = `tel:${cleanPhone}`;
  };

  const handleZaloClick = (e: React.MouseEvent) => {
    trackZaloClick(
      cleanPhone,
      'mobile_sticky_bottom_bar',
      contact.googleAdsZaloConversionLabel
    );
  };

  return (
    <>
      {/* =========================================================================
          STICKY MOBILE ACTION BAR (Only visible on screens < 768px)
      ========================================================================= */}
      <nav
        aria-label="Thao tác liên hệ nhanh trên di động"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FAF8F5]/95 backdrop-blur-md border-t border-[#E8E2D9] shadow-[0_-4px_25px_rgba(0,0,0,0.08)] px-3 pt-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] transition-transform duration-300"
      >
        <div className="flex items-center justify-between gap-2 max-w-md mx-auto">
          {/* 1. BUTTON: GỌI HOTLINE */}
          <button
            type="button"
            onClick={handlePhoneClick}
            aria-label={`Gọi hotline ngay ${displayPhone}`}
            className="flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl bg-white hover:bg-stone-50 active:scale-95 text-stone-800 border border-stone-200/90 transition-all shadow-2xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880] focus-visible:ring-offset-2"
          >
            <div className="relative flex items-center justify-center w-6 h-6">
              <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-emerald-400 opacity-60" />
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Phone className="w-3.5 h-3.5 fill-current" />
              </div>
            </div>
            <span className="text-[10px] font-medium text-stone-700 tracking-tight mt-1 whitespace-nowrap">
              Gọi Hotline
            </span>
          </button>

          {/* 2. BUTTON: CHAT ZALO */}
          <a
            href={zaloUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleZaloClick}
            aria-label="Chat trực tiếp qua Zalo với chuyên viên tư vấn"
            className="flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl bg-white hover:bg-stone-50 active:scale-95 text-stone-800 border border-stone-200/90 transition-all shadow-2xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880] focus-visible:ring-offset-2"
          >
            <div className="w-6 h-6 rounded-full bg-[#0068FF] text-white flex items-center justify-center shadow-xs">
              <span className="font-extrabold text-[9px] tracking-tighter">Zalo</span>
            </div>
            <span className="text-[10px] font-medium text-stone-700 tracking-tight mt-1 whitespace-nowrap">
              Chat Zalo
            </span>
          </a>

          {/* 3. BUTTON NỔI BẬT: NHẬN ƯU ĐÃI & ĐẶT LỊCH (CTA) */}
          <button
            type="button"
            onClick={() => setIsBottomSheetOpen(true)}
            aria-label="Nhận ưu đãi 2 triệu và đặt lịch chụp ảnh cưới"
            className="flex-[2.4] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-charcoal-900 via-stone-900 to-luxury-900 text-white shadow-luxury active:scale-[0.98] border border-champagne-gold/40 transition-all cursor-pointer relative overflow-hidden group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880] focus-visible:ring-offset-2"
          >
            {/* Shimmer light sweep animation */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="relative flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-300">
              <Gift className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            </div>

            <div className="flex flex-col text-left">
              <span className="text-[11px] font-semibold text-amber-200 tracking-tight leading-tight flex items-center gap-1">
                <span>Ưu Đãi 2Tr & Đặt Lịch</span>
                <Sparkles className="w-2.5 h-2.5 text-amber-300" />
              </span>
              <span className="text-[9px] text-stone-300 font-light leading-none">
                Tư vấn concept miễn phí
              </span>
            </div>
          </button>
        </div>
      </nav>

      {/* =========================================================================
          MOBILE BOTTOM SHEET (SLIDE-UP DRAWER FOR CONSULTATION)
      ========================================================================= */}
      {isBottomSheetOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="md:hidden fixed inset-0 z-50 flex flex-col justify-end select-none animate-in fade-in duration-200"
        >
          {/* Backdrop Blur Overlay */}
          <div
            aria-hidden="true"
            onClick={() => setIsBottomSheetOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Sheet Modal Container */}
          <div className="relative w-full max-h-[90vh] bg-[#FAF8F5] rounded-t-3xl shadow-2xl border-t border-[#E8E2D9] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
            {/* Drag handle & Header */}
            <div className="px-6 pt-3 pb-3 border-b border-stone-200/80 bg-white/70 backdrop-blur flex items-center justify-between">
              {/* Drag Pill */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-stone-300" />

              <div className="pt-2">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-luxury-600 block">
                  PlusMoments Wedding Studio
                </span>
                <h3 className="font-serif text-base font-medium text-charcoal-900 leading-tight">
                  Nhận Ưu Đãi 2.000.000đ & Báo Giá
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsBottomSheetOpen(false)}
                className="p-2 rounded-full text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880] focus-visible:ring-offset-2"
                aria-label="Đóng cửa sổ"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content inside Bottom Sheet */}
            <div className="overflow-y-auto p-5 pb-8 space-y-4">
              <p className="text-xs text-charcoal-600 font-light leading-relaxed">
                Để lại thông tin, chuyên viên tư vấn PlusMoments sẽ gửi trọn bộ catalog ảnh cưới mới nhất và giữ voucher giảm 2.000.000đ cho bạn.
              </p>

              <ConsultationForm
                onSuccess={() => setIsBottomSheetOpen(false)}
                redirectOnSuccess={false}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

