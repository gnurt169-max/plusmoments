import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Montserrat, Playfair_Display } from 'next/font/google';
import './globals.css';
import { getSystemSettings } from '@/lib/settings';
import { RootWebsiteJsonLd } from '@/components/seo/JsonLdSchema';

const playfair = Playfair_Display({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '600'],
  variable: '--font-playfair',
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
});

const montserrat = Montserrat({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-montserrat',
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
});

export const viewport: Viewport = {
  themeColor: '#FAF8F5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSystemSettings();
  const baseUrl = settings.canonicalBaseUrl || 'https://plusmoments.vn';

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: settings.defaultMetaTitle,
      template: `%s | ${settings.siteName}`,
    },
    description: settings.defaultMetaDescription,
    alternates: {
      canonical: baseUrl,
    },
    openGraph: {
      title: settings.defaultMetaTitle,
      description: settings.defaultMetaDescription,
      url: baseUrl,
      siteName: settings.siteName,
      images: [
        {
          url: settings.defaultOgImage,
          width: 1200,
          height: 630,
          alt: `${settings.siteName} Wedding Photography`,
        },
      ],
      locale: 'vi_VN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: settings.defaultMetaTitle,
      description: settings.defaultMetaDescription,
      images: [settings.defaultOgImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/icon.png', type: 'image/png', sizes: '192x192' },
        { url: '/icon.png', type: 'image/png', sizes: '512x512' },
      ],
      shortcut: '/favicon.ico',
      apple: [
        { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
      ],
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSystemSettings();

  return (
    <html
      lang="vi"
      className={`${playfair.variable} ${montserrat.variable} scroll-smooth`}
    >
      <head>
        {/* Dynamic Google Font ONLY if admin explicitly customized logo font to a non-bundled family */}
        {(() => {
          const rawFont = settings?.logoFontFamily;
          if (!rawFont || typeof rawFont !== 'string') return null;
          const font = rawFont.trim().toLowerCase();
          const isBundled = !font || font === 'playfair display' || font === 'montserrat';
          if (isBundled) return null;
          return (
            <link
              rel="stylesheet"
              href={`https://fonts.googleapis.com/css2?family=${encodeURIComponent(rawFont).replace(/%20/g, '+')}&display=swap`}
            />
          );
        })()}

        {/* Dynamic Theme Colors & Logo Typography Variables */}
        <style
          id="system-theme-variables"
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                --theme-primary: ${settings?.themePrimaryColor || '#C5A880'};
                --theme-bg: ${settings?.themeBgColor || '#0E0D0C'};
                --theme-text: ${settings?.themeTextColor || '#EAE5D9'};
                --color-primary: ${settings?.themePrimaryColor || '#C5A880'};
                --color-bg: ${settings?.themeBgColor || '#0E0D0C'};
                --color-text: ${settings?.themeTextColor || '#EAE5D9'};
                --logo-font-family: '${settings?.logoFontFamily || 'Playfair Display'}', serif;
                --font-serif: var(--font-playfair);
                --font-sans: var(--font-montserrat);
              }
            `,
          }}
        />

        {/* Dynamic BridalShop, Organization & WebSite Schemas for Rich Snippets */}
        <RootWebsiteJsonLd
          name={settings?.siteName || 'PlusMoments - Luxury Wedding Studio'}
          description={settings?.defaultMetaDescription || 'PlusMoments Studio chuyên cung cấp dịch vụ chụp ảnh cưới Pre-Wedding, phóng sự cưới cao cấp với phong cách sang trọng, tự nhiên và đậm chất điện ảnh.'}
          url={settings?.canonicalBaseUrl || 'https://plusmoments.vn'}
          logo={`${settings?.canonicalBaseUrl || 'https://plusmoments.vn'}/logo.png`}
          image={settings?.defaultOgImage || `${settings?.canonicalBaseUrl || 'https://plusmoments.vn'}/og-image.jpg`}
          telephone={settings?.hotline || '0981577993'}
          email={settings?.email || 'contact@plusmoments.vn'}
          address={settings?.studioAddress || '32/35 Cao Thắng, Bàn Cờ, TP. Hồ Chí Minh'}
          priceRange="6.000.000đ - 25.000.000đ"
          latitude={10.7769}
          longitude={106.7009}
        />

        {/* Global Google Ads Tag (gtag.js) */}
        {settings.googleAdsId && (
          <>
            <Script
              id="google-ads-gtag-src"
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${settings.googleAdsId}`}
            />
            <Script
              id="google-ads-gtag-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${settings.googleAdsId}', { 'allow_enhanced_conversions': true });
                `,
              }}
            />
          </>
        )}
      </head>
      <body className="min-h-screen bg-[#FAF8F5] text-charcoal-900 selection:bg-champagne selection:text-charcoal-950 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
