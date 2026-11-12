import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getSystemSettings } from '@/lib/settings';
import { getAdminSession } from '@/lib/auth';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { VerticalFloatingContact } from '@/components/layout/VerticalFloatingContact';
import { MobileBottomBar } from '@/components/public/MobileBottomBar';
import { ContactProvider } from '@/context/ContactContext';
import { TrackingProvider } from '@/components/tracking/TrackingProvider';
import { ContentProtection } from '@/components/security/ContentProtection';
import { MaintenanceView } from '@/components/common/MaintenanceView';

export const dynamic = 'force-dynamic';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nonce = (await headers()).get('x-nonce') || undefined;
  const [settings, activeAlbums, activePackages, activePosts] = await Promise.all([
    getSystemSettings(),
    prisma.album
      .findMany({
        where: { published: true },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true, slug: true },
      })
      .catch(() => []),
    prisma.servicePackage
      .findMany({
        where: { published: true },
        take: 5,
        orderBy: { orderIndex: 'asc' },
        select: { id: true, name: true, slug: true },
      })
      .catch(() => []),
    prisma.blogPost
      .findMany({
        where: { published: true },
        take: 4,
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true, slug: true },
      })
      .catch(() => []),
  ]);

  let session = null;
  // If maintenance mode is ON and visitor is not an authenticated Admin, display Maintenance View
  if (settings.isMaintenanceMode) {
    session = await getAdminSession();
    if (!session) {
      return (
        <MaintenanceView
          notice={settings.maintenanceNotice}
          hotline={settings.hotline}
          hotlineDisplay={settings.hotlineDisplay}
          zaloUrl={settings.zaloUrl || ''}
          brandNamePart1={settings.brandNamePart1}
          brandNamePart2={settings.brandNamePart2}
          brandSubtitle={settings.brandSubtitle}
        />
      );
    }
  }

  return (
    <ContactProvider
      initialContact={{
        hotline: settings.hotline,
        hotlineDisplay: settings.hotlineDisplay,
        zaloPhone: settings.zaloNumber,
        zaloUrl: settings.zaloUrl || '',
        messengerUrl: settings.messengerUrl || undefined,
        promoText: settings.promoText || undefined,
        address: settings.address || settings.studioAddress || undefined,
        email: settings.contactEmail || settings.email || undefined,
        openingHours: settings.workingHours || settings.openingHours || undefined,
        logoType: settings.logoType,
        brandNamePart1: settings.brandNamePart1,
        brandNamePart2: settings.brandNamePart2,
        brandSubtitle: settings.brandSubtitle,
        logoLightUrl: settings.logoLightUrl,
        logoDarkUrl: settings.logoDarkUrl,
        logoTextPrimary: settings.logoTextPrimary || 'PLUS MOMENTS',
        logoTextSecondary: settings.logoTextSecondary || 'LUXURY WEDDING STUDIO',
        logoFontFamily: settings.logoFontFamily || 'Playfair Display',
        logoFontSize: settings.logoFontSize ?? 24,
        logoFontWeight: settings.logoFontWeight || '600',
        logoLetterSpacing: settings.logoLetterSpacing || '0.15em',
        logoColorLight: settings.logoColorLight || '#1A1614',
        logoColorDark: settings.logoColorDark || '#F5F2EB',
        logoAccentColor: settings.logoAccentColor || '#C5A880',
        themePrimaryColor: settings.themePrimaryColor || '#C5A880',
        themeBgColor: settings.themeBgColor || '#0E0D0C',
        themeTextColor: settings.themeTextColor || '#EAE5D9',
        googleAdsPhoneConversionLabel: settings.googleAdsPhoneConversionLabel || undefined,
        googleAdsZaloConversionLabel: settings.googleAdsZaloConversionLabel || undefined,
        googleAdsMessengerConversionLabel: settings.googleAdsMessengerConversionLabel,
        googleAdsConversionLabel: settings.googleAdsConversionLabel,
        googleAdsConversionValue: settings.googleAdsConversionValue,
        redirectOnSubmit: settings.redirectOnSubmit,
        thankYouPageUrl: settings.thankYouPageUrl || '/cam-on',
      }}
    >
      {/* Centralized Ad & Analytics Tracking Scripts */}
      <TrackingProvider
        nonce={nonce}
        gtmId={settings.gtmId}
        googleAdsId={settings.googleAdsId}
        googleAnalyticsId={settings.googleAnalyticsId}
        metaPixelId={settings.metaPixelId}
        tiktokPixelId={settings.tiktokPixelId}
        customHeadScript={settings.customHeadScript}
        customBodyScript={settings.customBodyScript}
      />

      <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-charcoal-900 selection:bg-champagne selection:text-charcoal-950 font-sans relative">
        {/* Invisible Scroll Sentinel for Zero-Reflow IntersectionObserver Navbar */}
        <div
          id="scroll-sentinel"
          aria-hidden="true"
          className="absolute top-0 left-0 h-6 w-px pointer-events-none opacity-0"
        />

        {/* Multi-Layer Image & Copyright Protection */}
        <ContentProtection />

        {/* Maintenance Banner for Authenticated Admin Preview */}
        {settings.isMaintenanceMode && session && (
          <aside aria-label="Maintenance Alert" className="bg-amber-600 text-white text-xs font-medium py-2.5 px-4 sticky top-0 z-50 flex items-center justify-center gap-2 shadow-md">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-200 animate-ping inline-block" />
            <span>
              ⚡ <strong>Chế độ Bảo Trì đang BẬT:</strong> Khách vãng lai bị chặn truy cập. Bạn đang xem website dưới quyền Quản Trị ({session.fullName} - {session.role}).
            </span>
            <Link
              href="/admin/settings"
              className="ml-2 inline-flex items-center underline font-semibold hover:text-amber-100 transition-colors"
            >
              Cấu hình tắt bảo trì &rarr;
            </Link>
          </aside>
        )}

        {/* Global Navigation Header for Public Website */}
        <Header
          hotlineDisplay={settings.hotlineDisplay}
          hotline={settings.hotline}
        />

        {/* Main Content Area */}
        <main id="main-content" className="flex-grow pb-16 md:pb-0">{children}</main>

        {/* Luxury Vertical Floating Action Bar (Desktop Only) */}
        <VerticalFloatingContact />

        {/* Sticky Mobile Action Bar (Mobile Only <768px) */}
        <MobileBottomBar />

        {/* Editorial Footer */}
        <Footer
          settings={settings}
          activeAlbums={activeAlbums}
          activePackages={activePackages}
          activePosts={activePosts}
        />
      </div>
    </ContactProvider>
  );
}
