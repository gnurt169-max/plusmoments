'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Menu, X, Sparkles, Phone, MapPin, MessageCircle, ArrowRight } from 'lucide-react';
import { useContact } from '@/context/ContactContext';
import { BrandLogo } from '@/components/common/BrandLogo';
import { trackHotlineClick, trackZaloClick } from '@/lib/tracking';

// Tách biệt hoàn toàn JS & CSS của Modal tư vấn khỏi thanh Header Above-the-fold
const ConsultationModal = dynamic(
  () => import('@/components/common/ConsultationModal'),
  { ssr: false }
);

interface HeaderProps {
  hotlineDisplay?: string;
  hotline?: string;
}

export function Header(props: HeaderProps) {
  const { contact } = useContact();
  const hotlineDisplay = contact.hotlineDisplay || props.hotlineDisplay || '0903.768.871';
  const hotline = contact.hotline || props.hotline || '0903768871';
  const cleanPhone = hotline.replace(/[^0-9]/g, '');
  const zaloUrl = contact.zaloUrl || `https://zalo.me/${cleanPhone}`;
  const studioAddress = contact.address || 'Hồ Chí Minh & Đà Lạt';

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);

  const pathname = usePathname();
  const isHomePage = pathname === '/';

  // Xác định màu điểm nhấn thương hiệu theo tỷ lệ tương phản WCAG 2.1 AA (>= 4.5:1):
  // Khi Header ở trạng thái nền sáng (trang con, hoặc khi người dùng đã cuộn trang isScrolled === true):
  // dùng màu vàng đồng đậm #856740 (tỷ lệ tương phản 5.12:1 trên #FAF8F5 và 5.41:1 trên #FFFFFF).
  // Chỉ dùng #C5A880 khi Header đang ở chế độ trong suốt đè lên ảnh Hero tối màu ở đầu trang chủ (isHomePage && !isScrolled).
  const isTransparentHero = isHomePage && !isScrolled;
  const brandAccentColor = isTransparentHero ? '#C5A880' : '#856740';

  // Sử dụng IntersectionObserver theo dõi mốc sentinel thay cho scroll listener
  // Triệt tiêu 100% Forced Reflow do không bao giờ đọc window.scrollY đồng bộ
  useEffect(() => {
    const sentinel = document.getElementById('scroll-sentinel');
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsScrolled(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // Prevent background scroll only when mobile full-screen drawer is opened
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { name: 'Trang Chủ', href: '/', num: '01' },
    { name: 'Bộ Sưu Tập', href: '/bo-suu-tap', num: '02' },
    { name: 'Bảng Giá Dịch Vụ', href: '/pricing', num: '03' },
    { name: 'Cẩm Nang Cưới', href: '/blog', num: '04' },
    { name: 'Liên Hệ & Studio', href: '/contact', num: '05' },
  ];

  return (
    <>
      {/* Invisible Scroll Sentinel Fallback */}
      <div
        id="scroll-sentinel"
        aria-hidden="true"
        className="absolute top-0 left-0 h-6 w-px pointer-events-none opacity-0 z-[-1]"
      />

      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 min-h-[72px] sm:min-h-[80px] h-20 flex items-center ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-xs border-b border-stone-200/80 py-3'
            : 'bg-white/85 backdrop-blur-md border-b border-stone-200/60 py-3.5 shadow-2xs'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          {/* DESKTOP LAYOUT (Hidden on mobile) */}
          <div className="hidden lg:flex items-center justify-between min-h-[52px]">
            {/* Brand Logo */}
            <Link href="/" className="inline-block hover:opacity-85 transition-opacity shrink-0">
              <BrandLogo variant="dark" logoAccentColor={brandAccentColor} />
            </Link>

            {/* Desktop Navigation */}
            <nav className="flex items-center gap-8 shrink-0" aria-label="Menu chính">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs uppercase tracking-widest font-medium text-stone-700 hover:text-amber-800 transition-colors relative py-1 group whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#856740] focus-visible:ring-offset-2 rounded-sm"
                >
                  {link.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-800 transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </nav>

            {/* Right Action CTA */}
            <div className="flex items-center gap-4">
              <a
                href={`tel:${cleanPhone}`}
                onClick={() => trackHotlineClick(cleanPhone, 'header_desktop', contact.googleAdsPhoneConversionLabel)}
                className="flex items-center gap-1.5 text-xs font-mono font-medium text-stone-700 hover:text-amber-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#856740] focus-visible:ring-offset-2 rounded-md px-1.5 py-1"
              >
                <Phone className="w-3.5 h-3.5 text-amber-800" />
                <span>{hotlineDisplay}</span>
              </a>

              <button
                type="button"
                onClick={() => setIsConsultModalOpen(true)}
                className="px-5 py-2.5 rounded-full text-xs uppercase tracking-widest font-medium bg-amber-800 hover:bg-amber-900 active:scale-95 text-white transition-all shadow-sm flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#856740] focus-visible:ring-offset-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span>Tư Vấn Concept</span>
              </button>
            </div>
          </div>

          {/* MOBILE & TABLET LAYOUT (< lg): Centered Logo & Thumb-friendly Hamburger */}
          <div className="flex lg:hidden items-center justify-between relative h-10">
            {/* Left: Hamburger Button */}
            <button
              type="button"
              aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu điều hướng'}
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 rounded-xl text-stone-800 hover:bg-stone-100 active:scale-95 transition-all cursor-pointer z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#856740] focus-visible:ring-offset-2"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Center: Brand Logo (Centered perfectly on mobile) */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
              <Link href="/" className="inline-block hover:opacity-85 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#856740] rounded-lg">
                <BrandLogo variant="dark" logoAccentColor={brandAccentColor} />
              </Link>
            </div>

            {/* Right: Spacer for perfect symmetrical balance with hamburger button */}
            <div className="w-10 h-10 -mr-2 pointer-events-none" aria-hidden="true" />
          </div>
        </div>
      </header>

      {/* =========================================================================
          FULLSCREEN CINEMATIC MOBILE DRAWER (Mobile-First Experience)
      ========================================================================= */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="lg:hidden fixed inset-0 z-50 bg-[#FAF8F5]/98 backdrop-blur-xl flex flex-col justify-between p-6 sm:p-8 animate-in fade-in duration-300 select-none overflow-y-auto"
        >
          {/* Top Bar: Brand Logo & Close Button */}
          <div className="flex items-center justify-between border-b border-stone-200/80 pb-4">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-block"
            >
              <BrandLogo variant="dark" logoAccentColor="#856740" />
            </Link>

            <button
              type="button"
              aria-label="Đóng menu"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-full bg-stone-200/70 hover:bg-stone-300 text-stone-800 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#856740] focus-visible:ring-offset-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Links: Large, spaced, editorial serif style */}
          <nav className="py-8 space-y-4" aria-label="Menu di động toàn màn hình">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="group flex items-center justify-between py-2 border-b border-stone-200/50 hover:border-amber-800 transition-colors"
              >
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-xs text-amber-800 font-semibold">
                    {link.num}
                  </span>
                  <span className="font-serif text-2xl sm:text-3xl font-light text-stone-900 group-hover:text-amber-800 transition-colors">
                    {link.name}
                  </span>
                </div>
                <ArrowRight className="w-5 h-5 text-stone-300 group-hover:text-amber-800 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </nav>

          {/* Bottom Drawer Content: Direct Contacts & Showroom Address */}
          <div className="space-y-4 pt-4 border-t border-stone-200/80">
            {/* Showroom Address */}
            <div className="flex items-start gap-2.5 text-xs text-stone-600 font-light">
              <MapPin className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
              <span>{studioAddress}</span>
            </div>

            {/* Quick Contact Buttons Row */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href={`tel:${cleanPhone}`}
                onClick={() => {
                  trackHotlineClick(cleanPhone, 'mobile_fullscreen_drawer', contact.googleAdsPhoneConversionLabel);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white border border-stone-200 text-stone-800 text-xs font-semibold shadow-2xs hover:bg-stone-50 transition-colors"
              >
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>{hotlineDisplay}</span>
              </a>

              <a
                href={zaloUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  trackZaloClick(cleanPhone, 'mobile_fullscreen_drawer', contact.googleAdsZaloConversionLabel);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white border border-stone-200 text-stone-800 text-xs font-semibold shadow-2xs hover:bg-stone-50 transition-colors"
              >
                <div className="w-4 h-4 rounded-full bg-[#0068FF] text-white flex items-center justify-center text-[8px] font-bold">
                  Z
                </div>
                <span>Chat Zalo</span>
              </a>
            </div>

            {/* Full-width CTA Button */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setIsConsultModalOpen(true);
              }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-charcoal-900 via-stone-900 to-amber-900 text-white font-serif text-sm uppercase tracking-wider font-medium shadow-luxury flex items-center justify-center gap-2 active:scale-[0.99] transition-transform cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Nhận Ưu Đãi 2.000.000đ Ngay</span>
            </button>
          </div>
        </div>
      )}

      {/* Global Consultation Modal (Chỉ nạp JS/CSS khi người dùng click mở) */}
      {isConsultModalOpen && (
        <ConsultationModal
          isOpen={isConsultModalOpen}
          onClose={() => setIsConsultModalOpen(false)}
          title="Nhận Báo Giá & Tư Vấn Concept Cưới"
          subtitle="Để lại thông tin để PlusMoments liên hệ tư vấn bối cảnh, váy cưới và lịch trình chụp ảnh cưới hoàn hảo nhất."
          source="header_modal"
        />
      )}
    </>
  );
}
