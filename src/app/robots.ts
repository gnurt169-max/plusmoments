import { MetadataRoute } from 'next';
import { getSystemSettings } from '@/lib/settings';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSystemSettings().catch(() => null);
  const baseUrl = (settings?.canonicalBaseUrl || 'https://plusmoments.vn').replace(/\/$/, '');

  const publicAllowed = [
    '/',
    '/bo-suu-tap/',
    '/bang-gia/',
    '/blog/',
    '/uu-dai/',
    '/lien-he/',
    '/_next/static/',
    '/uploads/',
    '/images/',
    '/favicon.ico',
    '/favicon-48x48.png',
    '/favicon-96x96.png',
    '/apple-touch-icon.png',
    '/icon.png',
  ];

  const privateDisallowed = [
    '/admin/',
    '/api/',
    '/proofing/',
    '/thanh-toan/',
    '/cam-on',
    '/tu-van/thanh-cong',
    '/maintenance',
    '/*?*',
  ];

  return {
    rules: [
      {
        userAgent: '*',
        allow: publicAllowed,
        disallow: privateDisallowed,
      },
      {
        userAgent: 'Googlebot',
        allow: publicAllowed,
        disallow: privateDisallowed,
      },
      {
        userAgent: 'Googlebot-Image',
        allow: [
          '/',
          '/uploads/',
          '/images/',
          '/favicon.ico',
          '/favicon-48x48.png',
          '/favicon-96x96.png',
          '/apple-touch-icon.png',
          '/icon.png',
        ],
        disallow: ['/admin/'],
      },
      {
        userAgent: 'Google-InspectionTool',
        allow: publicAllowed,
        disallow: privateDisallowed,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}


