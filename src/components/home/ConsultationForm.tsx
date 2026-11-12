'use client';

import React, { useState, useEffect, useId } from 'react';
import { useRouter } from 'next/navigation';
import { trackConsultationSubmit, getStoredTrafficSource, TrafficSourceData } from '@/lib/tracking';
import { useContact } from '@/context/ContactContext';
import { formatVietnamesePhone } from '@/lib/utils';
import { CheckCircle2, Sparkles, Loader2, ArrowRight } from 'lucide-react';

interface ConsultationFormProps {
  defaultPackage?: string;
  onSuccess?: () => void;
  className?: string;
  redirectOnSuccess?: boolean;
}

export function ConsultationForm({
  defaultPackage = '',
  onSuccess,
  className = '',
  redirectOnSuccess,
}: ConsultationFormProps) {
  const router = useRouter();
  const { contact } = useContact();
  const uniqueId = useId();
  const idPrefix = `consult-${uniqueId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    zalo: '',
    customerEmail: '',
    weddingDate: '',
    expectedPackage: defaultPackage,
    estimatedBudget: 'Từ 15 - 25 triệu',
    notes: '',
  });

  const [trafficSource, setTrafficSource] = useState<TrafficSourceData>({
    utmSource: '',
    utmMedium: '',
    utmCampaign: '',
    utmTerm: '',
    utmContent: '',
    gclid: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');

  // Auto-capture UTM and GCLID on mount from URL or session storage
  useEffect(() => {
    const source = getStoredTrafficSource();
    setTrafficSource(source);
  }, []);

  // Tự động đóng modal sau 2.5 giây khi đăng ký thành công
  useEffect(() => {
    if (isSuccess && onSuccess) {
      const timer = setTimeout(() => {
        onSuccess();
        setIsSuccess(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, onSuccess]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const customerEmailValue = (formData.customerEmail || '').trim();

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          _hp_website: honeypot,
          customerName: formData.fullName.trim(),
          customerPhone: formData.phone.trim(),
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          zalo: formData.zalo ? formData.zalo.trim() : formData.phone.trim(),
          customerEmail: customerEmailValue,
          email: customerEmailValue,
          packageInterested: formData.expectedPackage,
          ...trafficSource,
          conversionValue: contact.googleAdsConversionValue || 500000,
          sourceUrl: typeof window !== 'undefined' ? window.location.href : '',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Có lỗi xảy ra khi gửi thông tin.');
      }

      // Fire conversion tracking event
      trackConsultationSubmit({
        leadId: data.lead?.id,
        fullName: formData.fullName,
        package: formData.expectedPackage,
        googleAdsConversionLabel: contact.googleAdsConversionLabel,
        conversionValue: contact.googleAdsConversionValue || 500000,
      });

      // Reset form state về mặc định
      setFormData({
        fullName: '',
        phone: '',
        zalo: '',
        customerEmail: '',
        weddingDate: '',
        expectedPackage: defaultPackage,
        estimatedBudget: 'Từ 15 - 25 triệu',
        notes: '',
      });

      // Nếu chỉ định chuyển trang rõ ràng thì điều hướng, ngược lại hiển thị màn hình chúc mừng
      if (redirectOnSuccess === true) {
        const destination = contact.thankYouPageUrl || '/cam-on';
        const params = new URLSearchParams({
          leadId: data.lead?.id || '',
          name: formData.fullName,
          phone: formData.phone,
          package: formData.expectedPackage || '',
        });
        router.push(`${destination}?${params.toString()}`);
      } else {
        setIsSuccess(true);
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Không thể kết nối máy chủ. Vui lòng thử lại hoặc gọi Hotline.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={`text-center py-8 px-6 bg-white/95 border border-champagne-gold/30 rounded-2xl shadow-sm ${className}`}>
        <div className="w-16 h-16 mx-auto mb-4 bg-emerald-50 border border-emerald-200/80 rounded-full flex items-center justify-center text-emerald-600 shadow-sm">
          <CheckCircle2 className="w-9 h-9 text-emerald-600" />
        </div>
        <h4 className="font-serif text-2xl text-charcoal-900 font-medium mb-2">
          Đăng Ký Thành Công!
        </h4>
        <p className="text-sm text-charcoal-600 max-w-md mx-auto leading-relaxed">
          PlusMoments đã bảo lưu ưu đãi <strong className="text-luxury-700">2.000.000đ</strong> và gửi thông tin chi tiết vào email của bạn. Chuyên viên sẽ liên hệ trong ít phút.
        </p>
        <div className="mt-5 inline-flex items-center gap-2 px-4 py-1.5 bg-stone-100/90 rounded-full text-xs text-stone-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{onSuccess ? 'Cửa sổ sẽ tự động đóng sau 2 giây...' : 'PlusMoments đã ghi nhận thông tin.'}</span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {/* Honeypot field for bot suppression */}
      <label htmlFor={`${idPrefix}-hp`} className="sr-only">Website URL</label>
      <input
        id={`${idPrefix}-hp`}
        type="text"
        name="_hp_website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        className="hidden pointer-events-none"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        aria-label="Website"
      />

      {errorMessage && (
        <div className="p-3 bg-red-50/80 border border-red-200 text-red-700 text-xs rounded-xl">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor={`${idPrefix}-fullName`} className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1.5 font-medium">
            Họ Tên Dâu & Rể <span className="text-luxury-600">*</span>
          </label>
          <input
            id={`${idPrefix}-fullName`}
            name="fullName"
            type="text"
            required
            aria-label="Họ Tên Dâu & Rể"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="Ví dụ: Hoàng Long & Thanh Thảo"
            className="w-full px-4 py-3 text-xs bg-white/90 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-400 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label htmlFor={`${idPrefix}-phone`} className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1.5 font-medium">
            Số Điện Thoại Nhận Báo Giá <span className="text-luxury-600">*</span>
          </label>
          <input
            id={`${idPrefix}-phone`}
            name="phone"
            type="tel"
            required
            aria-label="Số Điện Thoại Nhận Báo Giá"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: formatVietnamesePhone(e.target.value) })}
            placeholder="Ví dụ: 0903 768 871"
            className="w-full px-4 py-3 text-xs bg-white/90 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-400 focus:border-transparent transition-all font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor={`${idPrefix}-zalo`} className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1.5 font-medium">
            Số Zalo Nhận Catalog
          </label>
          <input
            id={`${idPrefix}-zalo`}
            name="zalo"
            type="tel"
            aria-label="Số Zalo Nhận Catalog"
            value={formData.zalo}
            onChange={(e) => setFormData({ ...formData, zalo: formatVietnamesePhone(e.target.value) })}
            placeholder="Ví dụ: 0903 768 871"
            className="w-full px-4 py-3 text-xs bg-white/90 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-400 focus:border-transparent transition-all font-mono"
          />
        </div>

        <div>
          <label htmlFor={`${idPrefix}-email`} className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1.5 font-medium">
            Email Nhận Báo Giá
          </label>
          <input
            id={`${idPrefix}-email`}
            name="customerEmail"
            type="email"
            aria-label="Email nhận báo giá & tư vấn"
            placeholder="Ví dụ: contact@example.com"
            value={formData.customerEmail}
            onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
            className="w-full px-4 py-3 text-xs bg-white/90 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-400 focus:border-transparent transition-all font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor={`${idPrefix}-weddingDate`} className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1.5 font-medium">
            Ngày Dự Kiến Cưới / Chụp
          </label>
          <input
            id={`${idPrefix}-weddingDate`}
            name="weddingDate"
            type="text"
            aria-label="Ngày Dự Kiến Cưới hoặc Chụp Ảnh"
            placeholder="Ví dụ: 25/12/2026 hoặc Tháng 11"
            value={formData.weddingDate}
            onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })}
            className="w-full px-4 py-3 text-xs bg-white/90 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-400 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label htmlFor={`${idPrefix}-budget`} className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1.5 font-medium">
            Ngân Sách Dự Kiến
          </label>
          <select
            id={`${idPrefix}-budget`}
            name="estimatedBudget"
            aria-label="Ngân sách dự kiến cho gói chụp cưới"
            value={formData.estimatedBudget}
            onChange={(e) => setFormData({ ...formData, estimatedBudget: e.target.value })}
            className="w-full px-4 py-3 text-xs bg-white/90 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-400 focus:border-transparent transition-all text-charcoal-700 cursor-pointer"
          >
            <option value="Dưới 15 triệu">Dưới 15 triệu</option>
            <option value="Từ 15 - 25 triệu">Từ 15 - 25 triệu (Phổ biến)</option>
            <option value="Từ 25 - 40 triệu">Từ 25 - 40 triệu (Cao cấp)</option>
            <option value="Trên 40 triệu">Trên 40 triệu (Destination)</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor={`${idPrefix}-package`} className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1.5 font-medium">
          Gói Dịch Vụ / Concept Bạn Đang Quan Tâm
        </label>
        <input
          id={`${idPrefix}-package`}
          name="expectedPackage"
          type="text"
          aria-label="Gói Dịch Vụ hoặc Concept Bạn Đang Quan Tâm"
          placeholder="Ví dụ: Phóng Sự Cưới Deluxe, Chụp Pre-Wedding..."
          value={formData.expectedPackage}
          onChange={(e) => setFormData({ ...formData, expectedPackage: e.target.value })}
          className="w-full px-4 py-3 text-xs bg-white/90 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-400 focus:border-transparent transition-all"
        />
      </div>

      <div>
        <label htmlFor={`${idPrefix}-notes`} className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1.5 font-medium">
          Ghi Chú Hoặc Mong Muốn Riêng
        </label>
        <textarea
          id={`${idPrefix}-notes`}
          name="notes"
          rows={2}
          aria-label="Ghi chú hoặc mong muốn riêng của bạn"
          placeholder="Địa điểm tổ chức, thời gian cụ thể hoặc yêu cầu đặc biệt..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full px-4 py-2.5 text-xs bg-white/90 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-400 focus:border-transparent transition-all"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 px-6 bg-gradient-to-r from-luxury-700 via-luxury-600 to-amber-700 hover:from-luxury-800 hover:to-amber-800 text-white rounded-xl font-medium tracking-widest uppercase text-xs shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Đang gửi thông tin...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-champagne-light" />
              <span>Nhận Báo Giá Trọn Gói & Ưu Đãi 2.000.000đ</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <p className="text-[11px] text-center text-charcoal-400 mt-2.5 font-light">
          🔒 Thông tin được bảo mật tuyệt đối. PlusMoments cam kết không gọi làm phiền ngoài giờ hành chính.
        </p>
      </div>
    </form>
  );
}
