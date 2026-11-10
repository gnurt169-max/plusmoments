import { NextResponse } from 'next/server';
import { getSystemSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await getSystemSettings();

    const contact = {
      hotline: settings.hotline || '',
      hotlineDisplay: settings.hotlineDisplay || settings.hotline || '',
      zaloPhone: settings.zaloNumber || '',
      zaloUrl: settings.zaloUrl || '',
      messengerUrl: settings.messengerUrl || '',
      promoText: settings.promoText || 'Nhận Báo Giá Ưu Đãi 2Tr',
      address: settings.studioAddress || '',
      email: settings.email || '',
      googleMapsUrl: settings.googleMapsUrl || '',
      openingHours: settings.openingHours || '',
      logoType: settings.logoType || 'TEXT',
      brandNamePart1: settings.brandNamePart1 || 'PLUS',
      brandNamePart2: settings.brandNamePart2 || 'MOMENTS',
      brandSubtitle: settings.brandSubtitle || 'LUXURY WEDDING STUDIO',
      logoLightUrl: settings.logoLightUrl || null,
      logoDarkUrl: settings.logoDarkUrl || null,
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
      themeBgColor: settings.themeBgColor || '#FAF8F5',
      themeTextColor: settings.themeTextColor || '#1C1917',
    };

    return NextResponse.json(
      { success: true, contact },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=59',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

