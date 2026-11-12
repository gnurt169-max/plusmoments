'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Sparkles,
  Phone,
  MessageCircle,
  Gift,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Star,
  Camera,
  HeartHandshake,
  ArrowRight,
} from 'lucide-react';
import { ConsultationForm } from '@/components/home/ConsultationForm';
import { trackHotlineClick, trackZaloClick } from '@/lib/tracking';
import { formatVND } from '@/lib/utils';

interface LandingPageClientViewProps {
  settings: {
    hotline: string;
    hotlineDisplay: string;
    zaloUrl: string;
    zaloNumber: string;
    googleAdsId?: string | null;
    googleAdsConversionLabel?: string | null;
    googleAdsPhoneConversionLabel?: string | null;
    googleAdsZaloConversionLabel?: string | null;
    googleAdsConversionValue?: number;
    landingPageEnabled: boolean;
    landingPageTitle: string;
    landingPageSubtitle: string;
    landingPageBannerImage: string;
    landingPageSlotsRemaining: number;
    landingPageDiscountAmount: string;
    landingPageDeadline: string;
    thankYouPageUrl: string;
  };
  packages: any[];
  albums: any[];
  testimonials: any[];
}

export function LandingPageClientView({
  settings,
  packages,
  albums,
  testimonials,
}: LandingPageClientViewProps) {
  const onHotlineClick = () => {
    trackHotlineClick(
      settings.hotline,
      'google_ads_landing_page',
      settings.googleAdsPhoneConversionLabel
    );
    window.location.href = `tel:${settings.hotline}`;
  };

  const onZaloClick = () => {
    trackZaloClick(
      settings.zaloNumber,
      'google_ads_landing_page',
      settings.googleAdsZaloConversionLabel
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-charcoal-900 pb-28 sm:pb-20">
      {/* =========================================================================
          TOP URGENCY BANNER (Sticky on Desktop)
      ========================================================================= */}
      <div className="bg-gradient-to-r from-luxury-800 via-luxury-700 to-amber-900 text-white py-2.5 px-4 text-center text-xs font-medium tracking-wide flex items-center justify-center gap-2 shadow-sm">
        <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
        <span>
          {settings.landingPageDeadline} • <strong>Chỉ Còn {settings.landingPageSlotsRemaining} Suất Giảm {settings.landingPageDiscountAmount}</strong>
        </span>
      </div>

      {/* =========================================================================
          HERO & ABOVE-THE-FOLD LEAD CONVERSION FORM
      ========================================================================= */}
      <section className="pt-8 sm:pt-14 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Value Proposition & High Impact Messaging */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-champagne-gold/30 border border-champagne-gold/50 text-luxury-800 text-xs uppercase tracking-widest font-semibold shadow-xs">
              <Gift className="w-3.5 h-3.5 text-amber-600" />
              <span>Chương Trình Tri Ân Mùa Cưới 2025</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-light text-charcoal-950 leading-[1.15] tracking-tight">
              {settings.landingPageTitle}
            </h1>

            <p className="text-sm sm:text-base text-charcoal-600 font-light leading-relaxed max-w-2xl">
              {settings.landingPageSubtitle}
            </p>

            {/* Core Value Highlights */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-2">
              <div className="p-3.5 bg-white border border-champagne-gold/30 rounded-2xl shadow-xs space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-luxury-800 uppercase tracking-wide">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Tiết Kiệm {settings.landingPageDiscountAmount}</span>
                </div>
                <p className="text-[11px] text-charcoal-500 font-light">
                  Khấu trừ trực tiếp vào hợp đồng ký trong tuần này
                </p>
              </div>

              <div className="p-3.5 bg-white border border-champagne-gold/30 rounded-2xl shadow-xs space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-luxury-800 uppercase tracking-wide">
                  <HeartHandshake className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Trang Phục Nhập Khẩu</span>
                </div>
                <p className="text-[11px] text-charcoal-500 font-light">
                  Miễn phí thử váy cưới thiết kế & vest chú rể cao cấp
                </p>
              </div>
            </div>

            {/* Quick Contact Options */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-charcoal-600">
              <span className="flex items-center gap-1.5 font-medium">
                <Phone className="w-4 h-4 text-luxury-600" />
                Hotline tư vấn 24/7: <strong>{settings.hotlineDisplay}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Cam kết không phát sinh chi phí
              </span>
            </div>
          </div>

          {/* Right Column: High-Converting Lead Form */}
          <div className="lg:col-span-5">
            <div className="bg-white border-2 border-champagne-gold/50 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-champagne-gold/20 rounded-full blur-2xl pointer-events-none" />

              <div className="text-center space-y-1.5 mb-6 relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-semibold uppercase tracking-wider">
                  <Clock className="w-3 h-3 text-amber-600" />
                  <span>Ưu Đãi Còn Hiệu Lực Hôm Nay</span>
                </div>
                <h2 className="font-serif text-2xl font-light text-charcoal-900">
                  Nhận Báo Giá & Giữ Chỗ Ưu Đãi
                </h2>
                <p className="text-xs text-charcoal-500 font-light">
                  Điền form bên dưới để bảo lưu voucher <strong>{settings.landingPageDiscountAmount}</strong>
                </p>
              </div>

              <ConsultationForm
                defaultPackage={`Ưu Đãi Google Ads - Giảm ${settings.landingPageDiscountAmount}`}
                className="relative z-10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4 GOLDEN PROMISES (Cam Kết Vàng Của PlusMoments)
      ========================================================================= */}
      <section className="bg-charcoal-900 text-white py-14 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <p className="text-xs uppercase tracking-[0.25em] text-champagne-light font-semibold">
              Uy Tín & Chất Lượng Đỉnh Cao
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-light text-white">
              Tại Sao Hơn 500+ Cặp Đôi Chọn PlusMoments?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-charcoal-800/60 border border-stone-700 rounded-2xl space-y-2">
              <ShieldCheck className="w-6 h-6 text-champagne-light" />
              <h3 className="font-serif text-base text-white font-medium">Cam Kết Minh Bạch</h3>
              <p className="text-xs text-stone-400 font-light leading-relaxed">
                Hợp đồng rõ ràng, cam kết 100% không phát sinh chi phí di chuyển hay chụp ngoài giờ.
              </p>
            </div>

            <div className="p-6 bg-charcoal-800/60 border border-stone-700 rounded-2xl space-y-2">
              <Camera className="w-6 h-6 text-champagne-light" />
              <h3 className="font-serif text-base text-white font-medium">Chất Màu Điện Ảnh</h3>
              <p className="text-xs text-stone-400 font-light leading-relaxed">
                Phong cách chụp cảm xúc tự nhiên, màu ảnh sang trọng chuẩn chỉnh không lỗi thời theo năm tháng.
              </p>
            </div>

            <div className="p-6 bg-charcoal-800/60 border border-stone-700 rounded-2xl space-y-2">
              <Gift className="w-6 h-6 text-champagne-light" />
              <h3 className="font-serif text-base text-white font-medium">Váy Cưới Thiết Kế</h3>
              <p className="text-xs text-stone-400 font-light leading-relaxed">
                Hơn 200 mẫu váy cưới luxury mới nhất cho cô dâu thử đồ thoải mái đến khi ưng ý nhất.
              </p>
            </div>

            <div className="p-6 bg-charcoal-800/60 border border-stone-700 rounded-2xl space-y-2">
              <HeartHandshake className="w-6 h-6 text-champagne-light" />
              <h3 className="font-serif text-base text-white font-medium">Bảo Hành Trọn Đời</h3>
              <p className="text-xs text-stone-400 font-light leading-relaxed">
                Lưu trữ file gốc trọn đời trên đám mây an toàn, bảo hành in ấn album chất lượng cao.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FEATURED PACKAGES COMPARISON
      ========================================================================= */}
      {packages.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-[0.25em] text-luxury-600 font-semibold">
              Bảng Giá Trọn Gói
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-light text-charcoal-900">
              Các Gói Chụp Được Lựa Chọn Nhiều Nhất
            </h2>
            <p className="text-xs text-charcoal-500 font-light">
              Tất cả các gói dưới đây đều đủ điều kiện áp dụng Voucher giảm <strong>{settings.landingPageDiscountAmount}</strong>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg) => {
              const highlights: string[] = (() => {
                try {
                  if (Array.isArray(pkg.highlightPoints)) return pkg.highlightPoints;
                  if (typeof pkg.highlightPoints === 'string') return JSON.parse(pkg.highlightPoints);
                } catch (e) {}
                return [];
              })();

              return (
                <div
                  key={pkg.id}
                  className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                    pkg.isFeatured
                      ? 'bg-white border-2 border-champagne-gold shadow-xl ring-2 ring-champagne-gold/30'
                      : 'bg-white/80 border border-stone-200 shadow-sm hover:shadow-md'
                  }`}
                >
                  {pkg.isFeatured && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-luxury-700 to-amber-700 text-white text-[10px] uppercase tracking-widest font-semibold shadow-sm">
                      Được Đặt Nhiều Nhất
                    </div>
                  )}

                  <div className="space-y-4">
                    <span className="text-[10px] uppercase tracking-widest text-luxury-600 font-semibold">
                      {pkg.category}
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl font-light text-charcoal-900">
                      {pkg.name}
                    </h3>
                    <p className="text-xs text-charcoal-500 font-light line-clamp-2">
                      {pkg.subtitle}
                    </p>

                    <div className="pt-2 pb-4 border-b border-stone-100">
                      <div className="flex items-baseline gap-2">
                        <span className="font-serif text-2xl sm:text-3xl font-light text-luxury-800">
                          {formatVND(pkg.price)}
                        </span>
                        {pkg.originalPrice && (
                          <span className="text-xs text-stone-400 line-through">
                            {formatVND(pkg.originalPrice)}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-emerald-700 font-medium block mt-1">
                        ✓ Chưa trừ voucher {settings.landingPageDiscountAmount}
                      </span>
                    </div>

                    {highlights.length > 0 && (
                      <ul className="space-y-2 text-xs text-charcoal-700 font-light">
                        {highlights.slice(0, 5).map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-luxury-600 shrink-0 mt-0.5" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="pt-6">
                    <button
                      type="button"
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      aria-label={`Giữ chỗ ưu đãi gói ${pkg.name}`}
                      className="w-full py-3 px-4 rounded-xl text-xs uppercase tracking-wider font-semibold text-white bg-charcoal-900 hover:bg-luxury-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <span>Giữ Chỗ Gói Này</span>
                      <span className="sr-only">: {pkg.name}</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* =========================================================================
          REAL COUPLE REVIEWS (Social Proof)
      ========================================================================= */}
      {testimonials.length > 0 && (
        <section className="bg-stone-50 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <p className="text-xs uppercase tracking-[0.25em] text-luxury-600 font-semibold">
                Đánh Giá Thực Tế
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl font-light text-charcoal-900">
                Chia Sẻ Của Các Cặp Đôi
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-3"
                >
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="font-serif text-sm italic text-charcoal-800 font-light">
                    &ldquo;{t.quote || t.content}&rdquo;
                  </p>
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                    <span className="font-medium text-luxury-700">{t.coupleNames}</span>
                    <span className="text-stone-600 text-[11px]">{t.weddingDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          STICKY MOBILE CONVERSION BAR (1-Click Google Ads Call & Zalo)
      ========================================================================= */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-stone-200 px-4 py-3 sm:hidden flex items-center gap-3 shadow-2xl">
        <button
          type="button"
          onClick={onHotlineClick}
          className="flex-1 py-3 px-3 rounded-full bg-charcoal-900 text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
        >
          <Phone className="w-3.5 h-3.5 text-champagne-light" />
          <span>Gọi Hotline</span>
        </button>

        <a
          href={settings.zaloUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onZaloClick}
          className="flex-1 py-3 px-3 rounded-full bg-blue-600 text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>Chat Zalo</span>
        </a>

        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="p-3 rounded-full bg-luxury-600 text-white shadow-md cursor-pointer"
          title="Nhận Báo Giá"
        >
          <Gift className="w-4 h-4 text-amber-200" />
        </button>
      </div>
    </div>
  );
}

