import React from 'react';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { getSystemSettings } from '@/lib/settings';
import { serializePackage } from '@/lib/cached-queries';
import { LandingPageClientView } from './LandingPageClientView';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSystemSettings();
  const baseUrl = settings.canonicalBaseUrl || 'https://plusmoments.vn';
  return {
    title: `${settings.landingPageTitle || 'Ưu Đãi Mùa Cưới 2025'} | PlusMoments Wedding`,
    description:
      settings.landingPageSubtitle ||
      'Nhận ngay Voucher ưu đãi 2.000.000đ khi đăng ký gói chụp ảnh cưới Pre-Wedding hôm nay. Số lượng có hạn!',
    alternates: {
      canonical: `${baseUrl}/uu-dai`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function GoogleAdsLandingPage() {
  const [settings, packages, featuredAlbums, testimonials] = await Promise.all([
    getSystemSettings(),
    prisma.servicePackage
      .findMany({
        where: { published: true },
        orderBy: [{ isFeatured: 'desc' }, { orderIndex: 'asc' }],
        take: 3,
      })
      .then((pkgs) => pkgs.map(serializePackage))
      .catch(() => []),
    prisma.album.findMany({
      where: { published: true },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      take: 6,
    }).catch(() => []),
    prisma.testimonial.findMany({
      where: { published: true },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      take: 3,
    }).catch(() => []),
  ]);

  return (
    <LandingPageClientView
      settings={{
        hotline: settings.hotline,
        hotlineDisplay: settings.hotlineDisplay,
        zaloUrl: settings.zaloUrl || '',
        zaloNumber: settings.zaloNumber,
        googleAdsId: settings.googleAdsId,
        googleAdsConversionLabel: settings.googleAdsConversionLabel,
        googleAdsPhoneConversionLabel: settings.googleAdsPhoneConversionLabel,
        googleAdsZaloConversionLabel: settings.googleAdsZaloConversionLabel,
        googleAdsConversionValue: settings.googleAdsConversionValue || 500000,
        landingPageEnabled: settings.landingPageEnabled !== false,
        landingPageTitle:
          settings.landingPageTitle || 'Ưu Đãi Mùa Cưới 2025 - Tặng Gói Make-Up & Xe Rước Dâu',
        landingPageSubtitle:
          settings.landingPageSubtitle ||
          'Đặc quyền dành riêng cho cặp đôi đăng ký trực tuyến hôm nay: Nhận ngay Voucher 2.000.000đ trừ trực tiếp vào gói chụp Pre-Wedding Luxury.',
        landingPageBannerImage: settings.landingPageBannerImage || '',
        landingPageSlotsRemaining: settings.landingPageSlotsRemaining || 5,
        landingPageDiscountAmount: settings.landingPageDiscountAmount || '2.000.000đ',
        landingPageDeadline:
          settings.landingPageDeadline || 'Áp dụng cho 10 cặp đôi đầu tiên trong tuần này',
        thankYouPageUrl: settings.thankYouPageUrl || '/cam-on',
      }}
      packages={packages}
      albums={featuredAlbums}
      testimonials={testimonials}
    />
  );
}

