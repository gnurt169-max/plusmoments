import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import { Montserrat, Playfair_Display } from 'next/font/google';
import './globals.css';
import { getSystemSettings } from '@/lib/settings';
import { getCachedTestimonials } from '@/lib/cached-queries';
import { RootWebsiteJsonLd, computeReviewStats } from '@/components/seo/JsonLdSchema';

const playfair = Playfair_Display({
  subsets: ['vietnamese'],
  weight: ['400', '600'],
  variable: '--font-playfair',
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
});

const montserrat = Montserrat({
  subsets: ['vietnamese'],
  weight: ['400', '500', '600'],
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

export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nonce = (await headers()).get('x-nonce') || undefined;
  const [settings, testimonials] = await Promise.all([
    getSystemSettings(),
    getCachedTestimonials(),
  ]);
  const { aggregateRating, reviews } = computeReviewStats(testimonials);

  return (
    <html
      lang="vi"
      className={`${playfair.variable} ${montserrat.variable} scroll-smooth`}
    >
      <head>
        {/* Preload Critical WOFF2 Fonts to eliminate CSS-to-Font network chain */}
        <link
          rel="preload"
          href="/_next/static/media/eaead17c7dbfcd5d-s.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/_next/static/media/904be59b21bd51cb-s.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
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
                --logo-font-family: ${settings?.logoFontFamily === 'Montserrat' ? 'var(--font-montserrat), sans-serif' : 'var(--font-playfair), Georgia, serif'};
                --font-serif: var(--font-playfair);
                --font-sans: var(--font-montserrat);
              }
            `,
          }}
        />

        {/* Dynamic LocalBusiness, PhotographyBusiness, BridalShop & WebSite Schemas for Rich Snippets */}
        <RootWebsiteJsonLd
          name={settings?.siteName || 'PlusMoments - Luxury Wedding Studio'}
          description={settings?.defaultMetaDescription || 'PlusMoments Studio chuyên cung cấp dịch vụ chụp ảnh cưới Pre-Wedding, phóng sự cưới cao cấp với phong cách sang trọng, tự nhiên và đậm chất điện ảnh.'}
          url={settings?.canonicalBaseUrl || 'https://plusmoments.vn'}
          logo={`${settings?.canonicalBaseUrl || 'https://plusmoments.vn'}/logo.png`}
          image={settings?.defaultOgImage || `${settings?.canonicalBaseUrl || 'https://plusmoments.vn'}/og-image.jpg`}
          telephone={settings?.hotline || '0903768871'}
          email={settings?.contactEmail || settings?.email || 'contact@plusmoments.vn'}
          address={settings?.address || settings?.studioAddress || '31 Hùng Vương, Phường An Đông'}
          sameAs={[
            settings?.facebookUrl,
            settings?.instagramUrl,
            settings?.tiktokUrl,
            settings?.youtubeUrl,
          ].filter((u): u is string => Boolean(u && u.trim()))}
          priceRange="6.000.000đ - 25.000.000đ"
          latitude={10.7769}
          longitude={106.7009}
          aggregateRating={aggregateRating}
          reviews={reviews}
        />
      </head>
      <body className="min-h-screen bg-[#FAF8F5] text-charcoal-900 selection:bg-champagne selection:text-charcoal-950 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
