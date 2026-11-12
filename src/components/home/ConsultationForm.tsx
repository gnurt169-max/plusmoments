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
  source?: string;
}

export function ConsultationForm({
  defaultPackage = '',
  onSuccess,
  className = '',
  redirectOnSuccess,
  source,
}: ConsultationFormProps) {
  const router = useRouter();
  const { contact } = useContact();

  // Đảm bảo từng input có id duy nhất chuẩn WCAG 2.1 AA
  const nameId = useId();
  const phoneId = useId();
  const zaloId = useId();
  const emailId = useId();
  const weddingDateId = useId();
  const budgetId = useId();
  const packageId = useId();
  const notesId = useId();
  const honeypotId = useId();

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
        <h3 className="font-serif text-2xl text-charcoal-900 font-medium mb-2">
          Đăng Ký Thành Công!
        </h3>
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
      <label htmlFor={honeypotId} className="sr-only">Website URL (vui lòng để trống)</label>
      <input
        id={honeypotId}
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
          <label htmlFor={nameId} className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1.5 font-medium">
            Họ Tên Dâu & Rể <span className="text-luxury-600">*</span>
          </label>
          <input
            id={nameId}
            name="fullName"
            type="text"
            required
            aria-label="Họ tên cô dâu và chú rể"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full px-4 py-3 text-xs bg-white/90 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-400 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label htmlFor={phoneId} className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1.5 font-medium">
            Số Điện Thoại Nhận Báo Giá <span className="text-luxury-600">*</span>
          </label>
          <input
            id={phoneId}
            name="phone"
            type="tel"
            required
            aria-label="Số điện thoại hoặc Zalo liên hệ"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: formatVietnamesePhone(e.target.value) })}
            className="w-full px-4 py-3 text-xs bg-white/90 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-400 focus:border-transparent transition-all font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor={zaloId} className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1.5 font-medium">
            Số Zalo Nhận Catalog
          </label>
          <input
            id={zaloId}
            name="zalo"
            type="tel"
            aria-label="Số Zalo nhận catalog ảnh cưới"
            value={formData.zalo}
            onChange={(e) => setFormData({ ...formData, zalo: formatVietnamesePhone(e.target.value) })}
            className="w-full px-4 py-3 text-xs bg-white/90 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-400 focus:border-transparent transition-all font-mono"
          />
        </div>

        <div>
          <label htmlFor={emailId} className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1.5 font-medium">
            Email Nhận Báo Giá
          </label>
          <input
            id={emailId}
            name="customerEmail"
            type="email"
            aria-label="Email nhận thông tin tư vấn và báo giá"
            value={formData.customerEmail}
            onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
            className="w-full px-4 py-3 text-xs bg-white/90 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-400 focus:border-transparent transition-all font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor={weddingDateId} className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1.5 font-medium">
            Ngày Dự Kiến Cưới / Chụp
          </label>
          <input
            id={weddingDateId}
            name="weddingDate"
            type="text"
            aria-label="Ngày dự kiến cưới hoặc chụp ảnh cưới"
            value={formData.weddingDate}
            onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })}
            className="w-full px-4 py-3 text-xs bg-white/90 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-400 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label htmlFor={budgetId} className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1.5 font-medium">
            Ngân Sách Dự Kiến <span className="sr-only">cho gói chụp ảnh cưới</span>
          </label>
          <select
            id={budgetId}
            name="estimatedBudget"
            aria-label="Ngân sách dự kiến cho gói chụp ảnh cưới"
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
        <label htmlFor={packageId} className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1.5 font-medium">
          Gói Dịch Vụ / Concept Bạn Đang Quan Tâm
        </label>
        <input
          id={packageId}
          name="expectedPackage"
          type="text"
          aria-label="Gói dịch vụ hoặc concept cưới bạn đang quan tâm"
          value={formData.expectedPackage}
          onChange={(e) => setFormData({ ...formData, expectedPackage: e.target.value })}
          className="w-full px-4 py-3 text-xs bg-white/90 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-400 focus:border-transparent transition-all"
        />
      </div>

      <div>
        <label htmlFor={notesId} className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1.5 font-medium">
          Ghi Chú Hoặc Mong Muốn Riêng
        </label>
        <textarea
          id={notesId}
          name="notes"
          rows={2}
          aria-label="Lời nhắn hoặc mong muốn chi tiết về concept chụp ảnh cưới"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full px-4 py-2.5 text-xs bg-white/90 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-400 focus:border-transparent transition-all"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          aria-label="Gửi yêu cầu tư vấn gói cưới"
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
