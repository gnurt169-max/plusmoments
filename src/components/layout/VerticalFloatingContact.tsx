'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Phone, CalendarHeart, Sparkles } from 'lucide-react';
import { useContact } from '@/context/ContactContext';
import { trackHotlineClick, trackZaloClick } from '@/lib/tracking';

// Tách biệt hoàn toàn JS & CSS của Modal tư vấn khỏi layout chính
const ConsultationModal = dynamic(
  () => import('@/components/common/ConsultationModal'),
  { ssr: false }
);

export function VerticalFloatingContact() {
  const { contact } = useContact();
  const [mounted, setMounted] = useState(false);
  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);
  const [isHotlineHovered, setIsHotlineHovered] = useState(false);

  // Trì hoãn khởi tạo widget nổi sau khi main-thread rảnh (requestIdleCallback)
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(() => setMounted(true));
      return () => window.cancelIdleCallback(id);
    } else {
      const timer = setTimeout(() => setMounted(true), 150);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!mounted) return null;

  const handleHotlineClick = () => {
    trackHotlineClick(
      contact.hotline,
      'vertical_floating_bar',
      contact.googleAdsPhoneConversionLabel
    );
    window.location.href = `tel:${contact.hotline}`;
  };

  const handleZaloClick = () => {
    trackZaloClick(
      contact.zaloPhone,
      'vertical_floating_bar',
      contact.googleAdsZaloConversionLabel
    );
  };

  return (
    <>
      {/* =========================================================================
          VERTICAL FLOATING ACTION BAR (Fixed Bottom-Right - Desktop Only)
      ========================================================================= */}
      <aside
        aria-label="Thanh liên hệ trực tiếp PlusMoments"
        className="hidden md:flex fixed bottom-6 right-6 z-50 flex-col items-end gap-3 pointer-events-auto select-none"
      >
        {/* 1. NÚT BÁO GIÁ / ƯU ĐÃI (Pill Banner with Pinging Indicator) */}
        <div className="relative group">
          <button
            type="button"
            onClick={() => setIsConsultModalOpen(true)}
            aria-label="Nhận báo giá ưu đãi"
            className="flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r from-luxury-600 via-luxury-500 to-amber-700 text-white rounded-full shadow-luxury-hover hover:shadow-glow transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 border border-champagne-gold/50 cursor-pointer"
          >
            {/* Live Pinging Pulsing Indicator */}
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-200 opacity-80" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white shadow-sm" />
            </span>

            <CalendarHeart className="w-4 h-4 text-amber-200 shrink-0" />

            <span className="font-serif text-xs sm:text-sm font-medium tracking-wide whitespace-nowrap text-white drop-shadow-sm">
              {contact.promoText || 'Nhận Báo Giá Ưu Đãi 2Tr'}
            </span>

            <Sparkles className="w-3.5 h-3.5 text-champagne-light shrink-0" />
          </button>
        </div>

        {/* 2. NÚT GỌI HOTLINE (Capsule expanding or pulsing with ringing icon) */}
        <div
          className="relative flex items-center justify-end"
          onMouseEnter={() => setIsHotlineHovered(true)}
          onMouseLeave={() => setIsHotlineHovered(false)}
        >
          <button
            type="button"
            onClick={handleHotlineClick}
            aria-label={`Gọi ngay số ${contact.hotlineDisplay}`}
            className="group flex items-center h-12 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-full shadow-luxury hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-emerald-400/40 px-3 pl-3.5 gap-2.5 cursor-pointer"
          >
            {/* Ringing / Vibrating Phone Icon */}
            <div className="relative flex items-center justify-center w-6 h-6">
              <Phone className="w-5 h-5 text-white animate-[bounce_1.4s_infinite]" />
            </div>

            {/* Always visible on desktop, or animated expand */}
            <div className="flex flex-col text-left pr-1.5">
              <span className="text-[9px] uppercase tracking-wider text-emerald-100 font-medium leading-none">
                Hotline 24/7
              </span>
              <span className="font-mono text-xs sm:text-sm font-bold tracking-tight text-white leading-tight">
                {contact.hotlineDisplay || contact.hotline}
              </span>
            </div>
          </button>
        </div>

        {/* 3. NÚT CHAT ZALO (Circular Branded Button with Antigravity Hover) */}
        <div className="relative group">
          <a
            href={contact.zaloUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleZaloClick}
            aria-label={`Chat Zalo với PlusMoments (${contact.zaloPhone})`}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-[#0068FF] hover:bg-[#0055d4] text-white shadow-luxury hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-110 border border-blue-300/40 group relative overflow-hidden"
          >
            {/* Shimmer light sweep */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent" />

            {/* Official Zalo Text / Vector Logo */}
            <span className="font-extrabold text-[13px] tracking-tighter drop-shadow-sm select-none">
              Zalo
            </span>
          </a>

          {/* Tooltip on hover (desktop) */}
          <div className="absolute right-14 top-1/2 -translate-y-1/2 px-3 py-1 bg-charcoal-900/90 text-white text-[11px] font-medium rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg">
            Chat Zalo: {contact.zaloPhone}
          </div>
        </div>

        {/* 4. NÚT MESSENGER (Circular Gradient with Messenger Icon) */}
        <div className="relative group">
          <a
            href={contact.messengerUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat Facebook Messenger với PlusMoments"
            className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-[#00B2FE] via-[#006AFF] to-[#9B51E0] hover:opacity-95 text-white shadow-luxury hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-110 border border-indigo-200/40 relative overflow-hidden"
          >
            {/* Messenger Lightning Bubble Vector */}
            <svg
              className="w-6 h-6 fill-current drop-shadow-sm"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.91 1.455 5.518 3.736 7.214V22l3.373-1.851c.918.254 1.887.391 2.891.391 5.523 0 10-4.145 10-9.258C22 6.145 17.523 2 12 2zm1.066 12.443l-2.617-2.793-5.109 2.793 5.62-5.966 2.68 2.793 5.045-2.793-5.619 5.966z" />
            </svg>
          </a>

          {/* Tooltip on hover (desktop) */}
          <div className="absolute right-14 top-1/2 -translate-y-1/2 px-3 py-1 bg-charcoal-900/90 text-white text-[11px] font-medium rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg">
            Chat Facebook Messenger
          </div>
        </div>
      </aside>

      {/* =========================================================================
          POPUP MODAL BÁO GIÁ & TƯ VẤN (Chỉ nạp JS/CSS khi người dùng click mở)
      ========================================================================= */}
      {isConsultModalOpen && (
        <ConsultationModal
          isOpen={isConsultModalOpen}
          onClose={() => setIsConsultModalOpen(false)}
          title="Đăng Ký Tư Vấn & Nhận Báo Giá Trọn Gói"
          subtitle={`Để lại thông tin để PlusMoments gửi trọn bộ catalog ảnh cưới và bảo lưu ưu đãi: "${contact.promoText}".`}
          source="vertical_floating_bar"
        />
      )}
    </>
  );
}

