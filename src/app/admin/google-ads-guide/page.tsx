import React from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAdminSession, isSuperAdminTrunglnm } from '@/lib/auth';
import { GoogleAdsArchitectView } from '@/components/admin/GoogleAdsArchitectView';

export const metadata: Metadata = {
  title: 'Kiến Trúc Chiến Dịch Google Ads (AI) | Super Admin PlusMoments',
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = 'force-dynamic';

export default async function GoogleAdsGuidePage() {
  // 1. Phân quyền tuyệt đối ở cấp độ Server Component
  const session = await getAdminSession();

  if (!session || !isSuperAdminTrunglnm(session)) {
    redirect('/admin');
  }

  return <GoogleAdsArchitectView />;
}
