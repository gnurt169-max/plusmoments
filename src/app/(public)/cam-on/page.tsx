import React from 'react';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { getSystemSettings } from '@/lib/settings';
import { ThankYouClientView } from './ThankYouClientView';

export const metadata: Metadata = {
  title: 'Đặt Lịch Thành Công | PlusMoments Wedding Studio',
  description: 'Cảm ơn bạn đã liên hệ PlusMoments. Chuyên viên tư vấn sẽ liên hệ lại với bạn ngay trong ít phút.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: { leadId?: string; name?: string; phone?: string; package?: string };
}) {
  const [settings, featuredAlbums] = await Promise.all([
    getSystemSettings(),
    prisma.album.findMany({
      where: { published: true },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      take: 4,
    }).catch(() => []),
  ]);

  return (
    <ThankYouClientView
      leadId={searchParams.leadId}
      clientName={searchParams.name}
      clientPhone={searchParams.phone}
      packageName={searchParams.package}
      settings={{
        googleAdsId: settings.googleAdsId,
        googleAdsConversionLabel: settings.googleAdsConversionLabel,
        googleAdsPhoneConversionLabel: settings.googleAdsPhoneConversionLabel,
        googleAdsZaloConversionLabel: settings.googleAdsZaloConversionLabel,
        googleAdsConversionValue: settings.googleAdsConversionValue || 500000,
        hotline: settings.hotline,
        hotlineDisplay: settings.hotlineDisplay,
        zaloUrl: settings.zaloUrl || '',
        zaloNumber: settings.zaloNumber,
        thankYouTitle: settings.thankYouTitle || 'Đặt Lịch Tư Vấn Thành Công!',
        thankYouMessage:
          settings.thankYouMessage ||
          'Cảm ơn bạn đã tin tưởng PlusMoments. Ekip tư vấn sẽ liên hệ lại trong vòng 15 phút để gửi bảng báo giá chi tiết và bảo lưu ưu đãi 2.000.000đ.',
        thankYouVoucherCode: settings.thankYouVoucherCode || 'PLUSMOMENTS-2TR',
      }}
      featuredAlbums={featuredAlbums}
    />
  );
}

