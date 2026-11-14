'use client';

import React, { useState, useEffect } from 'react';
import { Phone } from 'lucide-react';
import { useContact } from '@/context/ContactContext';
import { trackHotlineClick, trackZaloClick, trackMessengerClick } from '@/lib/tracking';

export function VerticalFloatingContact() {
  const { contact } = useContact();
  const [mounted, setMounted] = useState(false);

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
      'luxury_concierge_dock',
      contact.googleAdsPhoneConversionLabel
    );
    window.location.href = `tel:${contact.hotline}`;
  };

  const handleZaloClick = () => {
    trackZaloClick(
      contact.zaloPhone,
      'luxury_concierge_dock',
      contact.googleAdsZaloConversionLabel
    );
  };

  const handleMessengerClick = () => {
    trackMessengerClick(
      'luxury_concierge_dock',
      contact.googleAdsMessengerConversionLabel
    );
  };

  return (
    <aside
      aria-label="Khay liên hệ trực tiếp PlusMoments"
      className="fixed bottom-5 right-5 z-40 flex items-center pointer-events-auto select-none"
    >
      {/* KHAY LIÊN HỆ NHANH ĐỒNG BỘ (Luxury Concierge Pill Dock) */}
      <div className="bg-[#1C1917]/90 backdrop-blur-md border border-[#D4AF37]/35 rounded-full p-1 sm:p-1.5 flex items-center gap-1 sm:gap-1.5 shadow-[0_12px_32px_-8px_rgba(28,25,23,0.45)]">
        {/* NÚT 1 — HOTLINE (Nút tròn nổi bật màu vàng đồng #C59B6D) */}
        <div className="relative group/hotline flex items-center">
          <button
            type="button"
            onClick={handleHotlineClick}
            aria-label={`Gọi ngay hotline ${contact.hotlineDisplay || contact.hotline}`}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#C59B6D] hover:bg-[#d8b082] text-[#1C1917] flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
          >
            <Phone className="w-4 h-4 fill-current stroke-[2.2] animate-[bounce_2s_infinite]" />
          </button>

          {/* Tooltip hiển thị số hotline động khi hover trên Desktop */}
          <div className="hidden sm:block absolute right-full mr-2.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#1C1917]/95 border border-[#D4AF37]/35 text-[#FAF7F2] text-[11px] font-mono font-medium rounded-xl opacity-0 pointer-events-none group-hover/hotline:opacity-100 transition-all duration-200 whitespace-nowrap shadow-xl">
            Hotline 24/7:{' '}
            <span className="text-[#E5C799] font-bold">
              {contact.hotlineDisplay || contact.hotline}
            </span>
          </div>
        </div>

        {/* NÚT 2 — CHAT ZALO (Nút tròn đồng bộ với chữ Zalo vàng champagne) */}
        <div className="relative group/zalo flex items-center">
          <a
            href={contact.zaloUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleZaloClick}
            aria-label={`Chat Zalo với PlusMoments (${contact.zaloPhone})`}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:bg-white/10 text-[#FAF7F2] flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 border border-transparent hover:border-[#D4AF37]/30 cursor-pointer"
          >
            <span className="font-sans font-bold text-xs tracking-tighter text-[#E5C799] group-hover/zalo:text-[#FAF7F2] transition-colors select-none">
              Zalo
            </span>
          </a>

          {/* Tooltip khi hover trên Desktop */}
          <div className="hidden sm:block absolute right-full mr-2.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-[#1C1917]/95 border border-[#D4AF37]/35 text-[#FAF7F2] text-[11px] font-medium rounded-xl opacity-0 pointer-events-none group-hover/zalo:opacity-100 transition-all duration-200 whitespace-nowrap shadow-xl">
            Chat Zalo 24/7:{' '}
            <span className="text-[#E5C799] font-mono">{contact.zaloPhone}</span>
          </div>
        </div>

        {/* NÚT 3 — MESSENGER (Nút tròn đồng bộ với icon Messenger vàng champagne) */}
        <div className="relative group/msgr flex items-center">
          <a
            href={contact.messengerUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleMessengerClick}
            aria-label="Chat Facebook Messenger với PlusMoments"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:bg-white/10 text-[#FAF7F2] flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 border border-transparent hover:border-[#D4AF37]/30 cursor-pointer"
          >
            <svg
              className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-[#E5C799] group-hover/msgr:fill-[#FAF7F2] transition-colors"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.91 1.455 5.518 3.736 7.214V22l3.373-1.851c.918.254 1.887.391 2.891.391 5.523 0 10-4.145 10-9.258C22 6.145 17.523 2 12 2zm1.066 12.443l-2.617-2.793-5.109 2.793 5.62-5.966 2.68 2.793 5.045-2.793-5.619 5.966z" />
            </svg>
          </a>

          {/* Tooltip khi hover trên Desktop */}
          <div className="hidden sm:block absolute right-full mr-2.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-[#1C1917]/95 border border-[#D4AF37]/35 text-[#FAF7F2] text-[11px] font-medium rounded-xl opacity-0 pointer-events-none group-hover/msgr:opacity-100 transition-all duration-200 whitespace-nowrap shadow-xl">
            Tư vấn Messenger
          </div>
        </div>
      </div>
    </aside>
  );
}

export default VerticalFloatingContact;
