'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Phone, ArrowRight } from 'lucide-react';
import { useContact } from '@/context/ContactContext';
import { trackHotlineClick, trackZaloClick, trackMessengerClick } from '@/lib/tracking';

// Tách biệt hoàn toàn JS & CSS của Modal tư vấn khỏi layout chính
const ConsultationModal = dynamic(
  () => import('@/components/common/ConsultationModal'),
  { ssr: false }
);

export function VerticalFloatingContact() {
  const { contact } = useContact();
  const [mounted, setMounted] = useState(false);
  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);

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
    <>
      {/* =========================================================================
          LUXURY EDITORIAL CONCIERGE DOCK (Fixed Bottom-Right)
          - Desktop (>=640px): bottom-5 right-5
          - Mobile (<640px): bottom-20 right-4 (ngăn chặn đè lên thanh điều hướng dưới)
      ========================================================================= */}
      <aside
        aria-label="Khay liên hệ trực tiếp PlusMoments"
        className="fixed bottom-20 right-4 sm:bottom-5 sm:right-5 z-40 flex flex-col items-end gap-2.5 pointer-events-auto select-none"
      >
        {/* 1. NÚT CTA CHÍNH — NHẬN BÁO GIÁ ƯU ĐÃI (Pill Banner with Gold Glow & Shimmer) */}
        <div className="relative group/cta">
          <button
            type="button"
            onClick={() => setIsConsultModalOpen(true)}
            aria-label={contact.promoText || 'Nhận báo giá ưu đãi'}
            className="flex items-center gap-2.5 h-10 sm:h-11 px-3.5 sm:px-4 rounded-full bg-gradient-to-r from-[#29221D] to-[#3E2F24] border border-[#C59B6D]/50 shadow-[0_8px_20px_-4px_rgba(28,25,23,0.5)] hover:shadow-[0_10px_25px_-4px_rgba(197,155,109,0.3)] transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98] cursor-pointer relative overflow-hidden"
          >
            {/* Shimmer sweep animation */}
            <div className="absolute inset-0 -translate-x-full group-hover/cta:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

            {/* Chấm tròn phát sáng nhẹ màu vàng kim */}
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E5C799] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E5C799]" />
            </span>

            {/* Chữ sắc nét màu kem sang trọng */}
            <span className="font-serif tracking-wide text-xs sm:text-[13px] font-medium text-[#FAF7F2] whitespace-nowrap drop-shadow-sm">
              {contact.promoText || 'Nhận Báo Giá Ưu Đãi'}
            </span>

            {/* Mũi tên nhỏ tinh tế */}
            <ArrowRight className="w-3.5 h-3.5 text-[#E5C799] shrink-0 transition-transform duration-300 group-hover/cta:translate-x-0.5" />
          </button>
        </div>

        {/* 2. KHAY LIÊN HỆ NHANH ĐỒNG BỘ (Luxury Concierge Pill Dock) */}
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

      {/* =========================================================================
          POPUP MODAL BÁO GIÁ & TƯ VẤN (Chỉ nạp JS/CSS khi người dùng click mở)
      ========================================================================= */}
      {isConsultModalOpen && (
        <ConsultationModal
          isOpen={isConsultModalOpen}
          onClose={() => setIsConsultModalOpen(false)}
          title="Đăng Ký Tư Vấn & Nhận Báo Giá Trọn Gói"
          subtitle={`Để lại thông tin để PlusMoments gửi trọn bộ catalog ảnh cưới và bảo lưu ưu đãi: "${contact.promoText}".`}
          source="luxury_concierge_dock"
        />
      )}
    </>
  );
}

export default VerticalFloatingContact;
