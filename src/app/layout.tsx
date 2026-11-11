import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { getSystemSettings } from '@/lib/settings';
import { LocalBusinessJsonLd } from '@/components/seo/JsonLdSchema';

const fontSerif = Playfair_Display({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-serif',
  display: 'swap',
});

const fontSans = Plus_Jakarta_Sans({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-sans',
  display: 'swap',
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
      className={`${fontSerif.variable} ${fontSans.variable} scroll-smooth`}
    >
      <head>
        {/* Google Fonts Preconnect & Luxury Editorial Font Families */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..700;1,6..96,400..700&family=Cinzel+Decorative:wght@400;700&family=Cinzel:wght@400;500;600;700;800&family=Cormorant+Garamond:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400..800;1,400..800&family=Prata&display=swap"
        />

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
              }
            `,
          }}
        />

        {/* Dynamic LocalBusiness Schema for Rich Snippets */}
        <LocalBusinessJsonLd
          name={settings?.siteName || 'PlusMoments Wedding Studio'}
          description={settings?.defaultMetaDescription || ''}
          url={settings?.canonicalBaseUrl || 'https://plusmoments.vn'}
          logo={`${settings?.canonicalBaseUrl || 'https://plusmoments.vn'}/logo.png`}
          image={settings?.defaultOgImage || ''}
          telephone={settings?.hotline || ''}
          email={settings?.email || ''}
          address={settings?.studioAddress || ''}
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
