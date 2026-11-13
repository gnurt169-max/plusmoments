import React from 'react';
import type { Metadata } from 'next';
import { getSystemSettings } from '@/lib/settings';
import { MaintenanceView } from '@/components/common/MaintenanceView';

export const metadata: Metadata = {
  title: 'Hệ Thống Đang Nâng Cấp | PlusMoments Wedding Studio',
  description: 'PlusMoments đang tiến hành nâng cấp hệ thống định kỳ để mang lại trải nghiệm tốt nhất.',
  alternates: {
    canonical: 'https://plusmoments.vn/maintenance',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function MaintenancePage() {
  const settings = await getSystemSettings();

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

