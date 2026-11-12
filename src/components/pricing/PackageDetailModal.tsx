'use client';

import React, { useState, useEffect, useMemo, useId } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  ArrowRight,
  CreditCard,
  QrCode,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { formatVND } from '@/lib/utils';
import { extractPackageFeatures } from '@/lib/package-features';
import type { PricingPackageData } from './LuxuryPricingSection';

export interface PackageDetailModalProps {
  packageData: PricingPackageData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PackageDetailModal({
  packageData,
  isOpen,
  onClose,
}: PackageDetailModalProps) {
  const router = useRouter();
  const uniqueId = useId();
  const idPrefix = `booking-${uniqueId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

  // Portal mount check for SSR safety
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Active Image & Fullscreen Lightbox State
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    weddingDate: '',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Reset form when modal opens or package changes
  useEffect(() => {
    if (isOpen) {
      setActiveImageIndex(0);
      setIsLightboxOpen(false);
      setErrorMessage('');
    }
  }, [isOpen, packageData?.id]);

  // Parse demo images list
  const demoImagesList: string[] = useMemo(() => {
    if (!packageData) return [];
    let list: string[] = [];
    try {
      const parsed = JSON.parse(packageData.demoImages || '[]');
      list = (Array.isArray(parsed) ? parsed : []).filter(
        (u: string) => u && typeof u === 'string' && u.trim().length > 0
      );
    } catch {
      list = [];
    }
    if (list.length === 0 && packageData.coverImage && packageData.coverImage.trim()) {
      list = [packageData.coverImage.trim()];
    }
    return list;
  }, [packageData]);

  const currentActiveImage = demoImagesList[activeImageIndex] || demoImagesList[0] || '';

  // Full features list guaranteed to contain 100% full comprehensive features (never sliced)
  const fullFeaturesList: string[] = useMemo(() => {
    if (!packageData) return [];
    return extractPackageFeatures(packageData);
  }, [packageData]);

  // Keyboard navigation & ESC close for Fullscreen Lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      } else if (e.key === 'ArrowLeft') {
        setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : demoImagesList.length - 1));
      } else if (e.key === 'ArrowRight') {
        setActiveImageIndex((prev) => (prev < demoImagesList.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, demoImagesList.length]);

  if (!packageData) return null;

  // Form Submit Handler -> POST /api/orders/create -> Redirect to /thanh-toan/[orderCode]
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: packageData.id,
          packageName: packageData.name,
          price: packageData.price,
          customerName: formData.customerName.trim(),
          customerPhone: formData.customerPhone.trim(),
          customerEmail: formData.customerEmail.trim(),
          notes: formData.notes.trim(),
          eventDate: formData.weddingDate.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.');
      }

      if (data.success && data.orderCode) {
        // Đóng modal
        onClose();
        // Chuyển hướng ngay sang trang thanh toán VietQR
        router.push(`/thanh-toan/${data.orderCode}`);
      }
    } catch (err: any) {
      console.error('[PACKAGE_ORDER_ERROR]:', err);
      setErrorMessage(err.message || 'Không thể tạo đơn hàng. Vui lòng thử lại hoặc gọi Hotline.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={packageData.name}
        subtitle={
          packageData.subtitle?.trim() &&
          !packageData.subtitle.includes('Lưu giữ khoảnh khắc vĩnh cửu')
            ? packageData.subtitle.trim()
            : undefined
        }
        maxWidth="max-w-4xl"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* CỘT TRÁI: KHUNG XEM ẢNH TRỌN VẸN (KHÔNG BỊ CẮT) + TỐI ƯU TỐC ĐỘ */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative group rounded-2xl overflow-hidden bg-[#F5F2EB] border border-amber-900/10 shadow-xs flex items-center justify-center min-h-[360px] sm:min-h-[440px] max-h-[500px]">
              {currentActiveImage ? (
                <>
                  <button
                    type="button"
                    aria-label={`Xem ảnh phóng to toàn màn hình gói ${packageData.name}`}
                    className="relative w-full h-[360px] sm:h-[440px] flex items-center justify-center p-3 cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880] focus-visible:ring-offset-2 rounded-xl border-none bg-transparent"
                    onClick={() => setIsLightboxOpen(true)}
                  >
                    <img
                      src={currentActiveImage}
                      alt={packageData.name}
                      className="max-w-full max-h-full object-contain drop-shadow-sm select-none transition-transform duration-200 group-hover:scale-[1.01]"
                      loading="eager"
                    />
                  </button>

                  {/* Nút phóng to toàn màn hình với z-index cao & pointer-events-auto */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsLightboxOpen(true);
                    }}
                    className="absolute bottom-3 right-3 z-20 px-3.5 py-1.5 rounded-full bg-black/70 hover:bg-black/90 text-white text-xs font-medium backdrop-blur-md transition-all flex items-center gap-1.5 shadow-md cursor-pointer pointer-events-auto select-none"
                    title="Xem trọn vẹn toàn màn hình"
                    aria-label="Xem trọn vẹn toàn màn hình"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-amber-200" />
                    <span>Xem Trọn Vẹn</span>
                  </button>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-stone-100 text-stone-400">
                  <Sparkles className="w-8 h-8 text-stone-300" />
                </div>
              )}
            </div>

            {/* Thumbnail Row - Instant Switching với img eager */}
            {demoImagesList.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 no-scrollbar">
                {demoImagesList.map((imgUrl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImageIndex(i)}
                    aria-label={`Xem ảnh ${i + 1} của gói ${packageData.name}`}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer bg-[#F5F2EB] ${
                      activeImageIndex === i
                        ? 'border-amber-700 ring-2 ring-amber-400/40 scale-105 shadow-md'
                        : 'border-stone-200 opacity-60 hover:opacity-100 hover:border-amber-400'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Thumbnail ${i + 1}`}
                      className="w-full h-full object-cover select-none"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}

          </div>

          {/* CỘT PHẢI: QUYỀN LỢI & FORM ĐẶT MUA / THANH TOÁN VIETQR */}
          <div className="lg:col-span-6 space-y-6">
            {/* Pricing Box */}
            <div className="p-4 bg-white rounded-2xl border border-champagne-dark/30 shadow-sm flex items-baseline justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-charcoal-600 font-medium">
                  Giá Trọn Gói Ưu Đãi
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-3xl font-light text-luxury-700">
                    {formatVND(packageData.price)}
                  </span>
                  <span className="text-xs text-charcoal-600">
                    /{packageData.unit}
                  </span>
                </div>
              </div>
              {packageData.originalPrice && (
                <span className="text-xs text-charcoal-600 line-through font-mono">
                  Giá niêm yết: {formatVND(packageData.originalPrice)}
                </span>
              )}
            </div>

            {/* Inclusions List - Only render when real features exist in DB */}
            {fullFeaturesList.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#8C7A6B]">
                  <Sparkles className="w-4 h-4 text-[#C5A880] shrink-0" />
                  <span>QUYỀN LỢI CHI TIẾT & THÀNH PHẨM BÀN GIAO:</span>
                </div>
                <ul className="space-y-2 text-sm text-[#4A4036] max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {fullFeaturesList.map((item: string, idx: number) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-xs text-[#4A4036] font-light leading-relaxed"
                    >
                      <span aria-hidden="true" className="text-[#C5A880] font-semibold shrink-0 leading-5">
                        ✓
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Delivery process - Only render when real deliverable info exists in DB */}
            {(() => {
              const text = (packageData.deliveryProcess || packageData.deliverables)?.trim();
              if (!text || text.includes('Minimalism 25x35')) return null;
              return (
                <div className="p-3 bg-[#F9F7F4] rounded-lg text-xs text-[#7A6E64] border border-[#EAE5D9] leading-relaxed">
                  <strong className="text-[#4A4036]">Quy trình bàn giao:</strong> {text}
                </div>
              );
            })()}

            {/* FORM ĐẶT GÓI & THANH TOÁN VIETQR */}
            <div className="pt-2 border-t border-stone-200">
              <div className="flex items-center justify-between mb-3">
                <p className="font-serif text-sm font-medium text-charcoal-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-700" />
                  <span>Đăng Ký Đặt Gói & Thanh Toán:</span>
                </p>
                <span className="text-[11px] text-amber-800 font-medium bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/80">
                  VietQR Tự Động
                </span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {errorMessage && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                    {errorMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor={`${idPrefix}-name`} className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1 font-medium">
                      Họ Tên Dâu & Rể <span className="text-luxury-600">*</span>
                    </label>
                    <input
                      id={`${idPrefix}-name`}
                      name="customerName"
                      type="text"
                      required
                      aria-label="Họ Tên Dâu & Rể"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-400 font-medium"
                    />
                  </div>

                  <div>
                    <label htmlFor={`${idPrefix}-phone`} className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1 font-medium">
                      Số Điện Thoại <span className="text-luxury-600">*</span>
                    </label>
                    <input
                      id={`${idPrefix}-phone`}
                      name="customerPhone"
                      type="tel"
                      required
                      aria-label="Số Điện Thoại"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-400 font-mono font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor={`${idPrefix}-email`} className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1 font-medium">
                      Email Nhận Xác Nhận
                    </label>
                    <input
                      id={`${idPrefix}-email`}
                      name="customerEmail"
                      type="email"
                      aria-label="Email Nhận Xác Nhận"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-400 font-mono"
                    />
                  </div>

                  <div>
                    <label htmlFor={`${idPrefix}-weddingDate`} className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1 font-medium">
                      Ngày Dự Kiến Cưới / Chụp
                    </label>
                    <input
                      id={`${idPrefix}-weddingDate`}
                      name="weddingDate"
                      type="text"
                      aria-label="Ngày Dự Kiến Cưới hoặc Chụp"
                      value={formData.weddingDate}
                      onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-400 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor={`${idPrefix}-notes`} className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1 font-medium">
                    Ghi Chú Hoặc Mong Muốn Riêng
                  </label>
                  <textarea
                    id={`${idPrefix}-notes`}
                    name="notes"
                    rows={2}
                    aria-label="Ghi Chú Hoặc Mong Muốn Riêng"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-400 leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 active:scale-[0.98] text-white text-xs font-semibold uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                      <span>Đang Khởi Tạo Đơn & Mã VietQR...</span>
                    </>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4 text-amber-400" />
                      <span>ĐẶT CỌC & THANH TOÁN VIETQR</span>
                      <ArrowRight className="w-4 h-4 text-amber-400" />
                    </>
                  )}
                </button>
                <p className="text-[11px] text-center text-stone-600 font-light">
                  Sau khi bấm, bạn sẽ được chuyển đến cổng thanh toán quét mã VietQR tự động.
                </p>
              </form>
            </div>
          </div>
        </div>
      </Modal>

      {/* REACT PORTAL FULLSCREEN LIGHTBOX VIEWER (Directly into document.body) */}
      {mounted &&
        isLightboxOpen &&
        currentActiveImage &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 select-none animate-fadeIn"
            onClick={() => setIsLightboxOpen(false)}
          >
            {/* Top Bar: Title, Counter & Close Button */}
            <div
              className="w-full flex items-center justify-between text-white/90 z-[100000] px-2 sm:px-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <span className="text-xs uppercase tracking-wider font-semibold px-2.5 py-1 bg-white/10 rounded-full text-amber-200 font-mono">
                  {activeImageIndex + 1} / {demoImagesList.length}
                </span>
                <p className="font-serif text-sm sm:text-base font-light text-white truncate max-w-[200px] sm:max-w-md">
                  {packageData.name}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="px-3.5 py-2 rounded-full bg-white/15 hover:bg-white/25 text-white transition-all cursor-pointer flex items-center gap-2 text-xs font-medium border border-white/20"
                aria-label="Đóng xem toàn màn hình (ESC)"
              >
                <span className="hidden sm:inline text-stone-300">Đóng (ESC)</span>
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Center: Fullscreen High-Res Image with Navigation */}
            <div
              className="relative flex-1 w-full max-w-6xl mx-auto flex items-center justify-center my-auto p-2"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Prev Button */}
              {demoImagesList.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : demoImagesList.length - 1));
                  }}
                  className="absolute left-1 sm:left-4 z-[100001] p-3 sm:p-3.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 backdrop-blur-sm transition-all hover:scale-110 cursor-pointer shadow-2xl active:scale-95"
                  aria-label="Ảnh trước (Mũi tên trái)"
                >
                  <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
                </button>
              )}

              {/* Main Image with zero lag */}
              <img
                src={currentActiveImage}
                alt={`${packageData.name} - Full Preview`}
                className="max-w-full max-h-[80vh] object-contain drop-shadow-2xl transition-all duration-150 select-none rounded-md"
                onClick={(e) => e.stopPropagation()}
                loading="eager"
              />

              {/* Next Button */}
              {demoImagesList.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex((prev) => (prev < demoImagesList.length - 1 ? prev + 1 : 0));
                  }}
                  className="absolute right-1 sm:right-4 z-[100001] p-3 sm:p-3.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 backdrop-blur-sm transition-all hover:scale-110 cursor-pointer shadow-2xl active:scale-95"
                  aria-label="Ảnh tiếp theo (Mũi tên phải)"
                >
                  <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
                </button>
              )}
            </div>

            {/* Bottom Thumbnails Strip */}
            {demoImagesList.length > 1 && (
              <div
                className="w-full max-w-3xl mx-auto flex items-center justify-center gap-2 sm:gap-2.5 overflow-x-auto py-2 z-[100000] px-4 no-scrollbar"
                onClick={(e) => e.stopPropagation()}
              >
                {demoImagesList.map((imgUrl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImageIndex(i)}
                    aria-label={`Chuyển đến ảnh phóng to ${i + 1}`}
                    className={`relative w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      activeImageIndex === i
                        ? 'border-amber-400 ring-2 ring-amber-300 scale-105 shadow-xl'
                        : 'border-white/20 opacity-50 hover:opacity-100 hover:border-white/60'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Thumbnail ${i + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>,
          document.body
        )}
    </>
  );
}

export default PackageDetailModal;
