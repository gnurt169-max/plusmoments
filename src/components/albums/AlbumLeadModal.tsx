'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles } from 'lucide-react';
import { ConsultationForm } from '@/components/home/ConsultationForm';

interface AlbumLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  albumTitle: string;
  conceptName?: string | null;
  slug: string;
}

/**
 * AlbumLeadModal: Luxury Consultation Modal / Mobile Bottom Sheet for Album Detail.
 * - Triggers automatically when user finishes viewing 100% of album content (or via FloatingStoryPill).
 * - Checks & sets sessionStorage('pm_album_popup_' + slug) so it never pesters the user again after closing.
 * - Mobile (< sm): Slides up as an elegant bottom drawer/sheet (rounded-t-3xl, max-h-[88vh]).
 * - Desktop (>= sm): Centered dialog (rounded-3xl, max-w-xl).
 * - z-[60] ensures it sits above the floating Zalo/Hotline concierge dock (z-40) and header.
 */
export function AlbumLeadModal({
  isOpen,
  onClose,
  albumTitle,
  conceptName,
  slug,
}: AlbumLeadModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const handleClose = () => {
    // Record that user dismissed or saw popup in this session
    try {
      if (typeof window !== 'undefined' && slug) {
        sessionStorage.setItem('pm_album_popup_' + slug, 'dismissed');
      }
    } catch {
      // ignore storage quota / sandbox errors
    }
    onClose();
  };

  const handleFormSuccess = () => {
    try {
      if (typeof window !== 'undefined' && slug) {
        sessionStorage.setItem('pm_album_popup_' + slug, 'submitted');
      }
    } catch {
      // ignore
    }
    onClose();
  };

  const defaultPackageValue = conceptName || albumTitle || '';

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="album-lead-modal-title"
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      {/* 1. Backdrop */}
      <div
        className="fixed inset-0 bg-[#1C1917]/75 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
        onClick={handleClose}
      />

      {/* 2. Sheet / Dialog Content */}
      <div
        className="relative w-full sm:max-w-xl bg-[#FAF8F5] border-t sm:border border-[#C5A059]/40 rounded-t-3xl sm:rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.45)] p-5 sm:p-8 max-h-[88vh] overflow-y-auto z-10 transition-all duration-300 transform animate-in slide-in-from-bottom-6 sm:zoom-in-95"
      >
        {/* Mobile Drag Indicator Handle */}
        <div className="sm:hidden flex justify-center pb-2">
          <div className="w-12 h-1.2 rounded-full bg-[#C5A059]/40" />
        </div>

        {/* Close Button Top-Right */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Đóng cửa sổ tư vấn"
          className="absolute top-4 sm:top-5 right-4 sm:right-5 p-2 rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8C6D46] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center pr-6 pl-6 sm:px-4 mb-5 pt-1">
          {/* Badge: ✦ BẠN VỪA KHÁM PHÁ TRỌN VẸN BỘ SƯU TẬP */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5EFEB] border border-[#E8DFD8] text-[#8C6D46] text-[10px] sm:text-[11px] uppercase tracking-[0.18em] font-medium mb-3">
            <Sparkles className="w-3 h-3 text-[#C5A059]" />
            <span>✦ BẠN VỪA KHÁM PHÁ TRỌN VẸN BỘ SƯU TẬP</span>
          </div>

          <h3
            id="album-lead-modal-title"
            className="font-serif text-2xl sm:text-3xl font-normal text-[#1C1917] tracking-tight leading-snug"
          >
            Yêu Thích Phong Cách Này?
          </h3>

          <p className="text-xs sm:text-sm text-stone-600 mt-2 font-normal leading-relaxed max-w-md mx-auto">
            Để lại thông tin để PlusMoments tư vấn địa điểm, gợi ý trang phục và gửi báo giá chi tiết trọn gói cùng ưu đãi đặc quyền cho bộ ảnh tương tự.
          </p>
        </div>

        {/* Form Container */}
        <div className="pt-1">
          <ConsultationForm
            defaultPackage={defaultPackageValue}
            onSuccess={handleFormSuccess}
            redirectOnSuccess={false}
            source={`album_complete_popup_${slug}`}
          />
        </div>

        {/* Secondary Close Action Button at the bottom */}
        <div className="mt-3 pt-2 text-center border-t border-stone-200/60">
          <button
            type="button"
            onClick={handleClose}
            className="text-xs text-stone-500 hover:text-stone-800 transition-colors py-1.5 px-4 font-medium tracking-wide underline underline-offset-4 cursor-pointer"
          >
            Tiếp tục xem trang
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default AlbumLeadModal;
