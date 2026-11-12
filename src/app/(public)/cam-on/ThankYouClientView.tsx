'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { isOptimizedUploadWebp } from '@/lib/image-utils';
import {
  CheckCircle2,
  Sparkles,
  Phone,
  MessageCircle,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Gift,
  QrCode,
  Loader2,
} from 'lucide-react';
import {
  trackGoogleAdsConversion,
  trackHotlineClick,
  trackZaloClick,
  trackEvent,
} from '@/lib/tracking';

interface ThankYouClientViewProps {
  leadId?: string;
  clientName?: string;
  clientPhone?: string;
  packageName?: string;
  settings: {
    googleAdsId?: string | null;
    googleAdsConversionLabel?: string | null;
    googleAdsPhoneConversionLabel?: string | null;
    googleAdsZaloConversionLabel?: string | null;
    googleAdsConversionValue?: number;
    hotline: string;
    hotlineDisplay: string;
    zaloUrl: string;
    zaloNumber: string;
    thankYouTitle: string;
    thankYouMessage: string;
    thankYouVoucherCode: string;
  };
  featuredAlbums: Array<{
    id: string;
    title: string;
    slug: string;
    coverImage: string;
    concept: string;
    location: string;
  }>;
}

export function ThankYouClientView({
  leadId,
  clientName,
  clientPhone,
  packageName,
  settings,
  featuredAlbums,
}: ThankYouClientViewProps) {
  const [copied, setCopied] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);

  const handleProceedToPayment = async () => {
    setCreatingOrder(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: clientName || 'Khách Hàng',
          customerPhone: clientPhone || '0900000000',
          packageName: packageName || 'Gói Chụp Pre-Wedding Luxury',
          amount: 2000000, // Cọc 2,000,000đ giữ lịch
          notes: `Đặt cọc giữ lịch ưu đãi từ trang cảm ơn (Lead ID: ${leadId || 'N/A'})`,
        }),
      });
      const data = await res.json();
      if (data.success && data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        throw new Error(data.error || 'Lỗi khởi tạo đơn');
      }
    } catch {
      alert('Không thể tạo phiên thanh toán tự động. Vui lòng liên hệ Hotline.');
    } finally {
      setCreatingOrder(false);
    }
  };

  // 1. Fire Google Ads & Multi-platform Conversions on Thank You page mount
  useEffect(() => {
    const conversionVal = settings.googleAdsConversionValue || 500000;

    // 1.1. Google Ads Conversion Tag
    if (settings.googleAdsId && settings.googleAdsConversionLabel) {
      const sendTo = `${settings.googleAdsId}/${settings.googleAdsConversionLabel}`;
      trackGoogleAdsConversion(sendTo, conversionVal, leadId);
    }

    // 1.2. Google Tag Manager / GA4 Lead Purchase / Generate Lead
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'google_ads_conversion_thank_you',
        conversion_value: conversionVal,
        transaction_id: leadId || undefined,
        lead_name: clientName || undefined,
        lead_phone: clientPhone || undefined,
        package_interest: packageName || undefined,
      });
    }

    // 1.3. Facebook Meta Pixel Lead
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'Lead', {
        content_name: packageName || 'Wedding Consultation',
        value: conversionVal,
        currency: 'VND',
      });
    }

    // 1.4. TikTok Pixel CompleteRegistration
    if (typeof window !== 'undefined' && window.ttq && typeof window.ttq.track === 'function') {
      window.ttq.track('CompleteRegistration', {
        content_name: packageName || 'Wedding Consultation',
        value: conversionVal,
        currency: 'VND',
      });
    }
  }, [leadId, clientName, clientPhone, packageName, settings]);

  const handleCopyVoucher = () => {
    if (!settings.thankYouVoucherCode) return;
    navigator.clipboard.writeText(settings.thankYouVoucherCode);
    setCopied(true);
    trackEvent('copy_voucher_code', { code: settings.thankYouVoucherCode });
    setTimeout(() => setCopied(false), 3000);
  };

  const onHotlineClick = () => {
    trackHotlineClick(
      settings.hotline,
      'thank_you_page',
      settings.googleAdsPhoneConversionLabel
    );
    window.location.href = `tel:${settings.hotline}`;
  };

  const onZaloClick = () => {
    trackZaloClick(
      settings.zaloNumber,
      'thank_you_page',
      settings.googleAdsZaloConversionLabel
    );
  };

  return (
    <div className="pt-32 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* =========================================================================
          HERO CONFIRMATION CARD (Luxury Golden Glow)
      ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-white border-2 border-champagne-gold/40 shadow-2xl p-8 sm:p-12 text-center space-y-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-champagne-gold/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-luxury-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Success Icon with Subtle Ripple Ring */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-champagne-gold/30 via-emerald-100 to-champagne/40 flex items-center justify-center text-luxury-700 shadow-inner">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 drop-shadow-sm" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500" />
          </span>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-champagne/50 text-luxury-800 text-[11px] uppercase tracking-widest font-semibold">
            <Sparkles className="w-3 h-3 text-luxury-600" />
            <span>Xác Nhận Đặt Lịch Tư Vấn Thành Công</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-charcoal-900 tracking-tight">
            {settings.thankYouTitle}
          </h1>

          {clientName && (
            <p className="text-base text-luxury-700 font-medium font-serif">
              Trân trọng cảm ơn <strong>{clientName}</strong>!
            </p>
          )}

          <p className="text-sm text-charcoal-600 leading-relaxed font-light">
            {settings.thankYouMessage}
          </p>
        </div>

        {/* Lead Summary Pill */}
        {(clientPhone || packageName) && (
          <div className="inline-flex flex-wrap items-center justify-center gap-3 py-2 px-5 bg-stone-50 border border-stone-200/80 rounded-2xl text-xs text-charcoal-700">
            {clientPhone && (
              <span className="flex items-center gap-1.5 font-mono">
                <Phone className="w-3.5 h-3.5 text-luxury-600" />
                {clientPhone}
              </span>
            )}
            {packageName && (
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-luxury-600" />
                {packageName}
              </span>
            )}
          </div>
        )}

        {/* =========================================================================
            EXCLUSIVE VOUCHER CARD
        ========================================================================= */}
        {settings.thankYouVoucherCode && (
          <div className="max-w-md mx-auto p-5 bg-gradient-to-r from-champagne-light via-white to-champagne-light border border-champagne-gold/60 rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-luxury-800 uppercase tracking-widest">
              <Gift className="w-4 h-4 text-amber-600" />
              <span>Mã Ưu Đãi Độc Quyền Dành Cho Bạn</span>
            </div>

            <div className="flex items-center justify-between gap-3 bg-white px-4 py-3 rounded-xl border border-stone-200 shadow-inner">
              <div className="text-left">
                <p className="text-[10px] text-charcoal-400 uppercase tracking-wider">Mã Voucher</p>
                <p className="font-mono text-base sm:text-lg font-bold text-luxury-800 tracking-wider">
                  {settings.thankYouVoucherCode}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopyVoucher}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-charcoal-900 text-white hover:bg-luxury-700'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Đã Chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao Chép</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-charcoal-500 font-light italic">
              * Xuất trình mã này cho chuyên viên tư vấn để được áp dụng giảm trực tiếp vào hợp đồng.
            </p>
          </div>
        )}

        {/* =========================================================================
            HIGH-CONVERSION CTAs (VietQR, Zalo & Hotline)
        ========================================================================= */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleProceedToPayment}
            disabled={creatingOrder}
            className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-800 hover:to-amber-900 text-white font-medium text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {creatingOrder ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <QrCode className="w-4 h-4 text-champagne-light" />
            )}
            <span>Đặt Cọc Giữ Lịch 2.000.000đ Qua VietQR</span>
          </button>

          <a
            href={settings.zaloUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onZaloClick}
            className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Nhắn Zalo Nhận Catalog Ngay</span>
          </a>

          <button
            type="button"
            onClick={onHotlineClick}
            className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-charcoal-900 hover:bg-charcoal-800 text-white font-medium text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <Phone className="w-4 h-4 text-champagne-light" />
            <span>Gọi Hotline: {settings.hotlineDisplay}</span>
          </button>
        </div>

        {/* Trust Badges */}
        <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center justify-center gap-6 text-xs text-charcoal-500 font-light">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-luxury-600" />
            Bảo mật thông tin 100%
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-luxury-600" />
            Hỗ trợ thử váy cưới miễn phí
          </span>
        </div>
      </div>

      {/* =========================================================================
          CONTINUE BROWSING: FEATURED WEDDING ALBUMS
      ========================================================================= */}
      {featuredAlbums.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-luxury-600 font-semibold">
                Cảm Hứng Ảnh Cưới
              </p>
              <h2 className="font-serif text-2xl font-light text-charcoal-900">
                Các Bộ Sưu Tập Được Yêu Thích Nhất
              </h2>
            </div>

            <Link
              href="/albums"
              className="text-xs text-luxury-700 hover:text-charcoal-900 font-medium inline-flex items-center gap-1 transition-colors"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {featuredAlbums.map((album) => (
              <Link
                key={album.id}
                href={`/albums/${album.slug}`}
                className="group relative rounded-2xl overflow-hidden aspect-[3/4] bg-stone-100 block shadow-sm hover:shadow-md transition-shadow"
              >
                <Image
                  src={album.coverImage}
                  alt={album.title}
                  fill
                  unoptimized={isOptimizedUploadWebp(album.coverImage)}
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-[10px] uppercase tracking-wider text-champagne-light font-medium block">
                    {album.concept}
                  </span>
                  <p className="font-serif text-xs font-light line-clamp-1 group-hover:text-champagne-light transition-colors">
                    {album.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

