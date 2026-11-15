import { MetadataRoute } from 'next';
import { getSystemSettings } from '@/lib/settings';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSystemSettings().catch(() => null);
  const baseUrl = (settings?.canonicalBaseUrl || 'https://plusmoments.vn').replace(/\/$/, '');

  const publicAllowed = [
    '/',
    '/bo-suu-tap/',
    '/bang-gia/',
    '/pricing/',
    '/blog/',
    '/uu-dai/',
    '/contact/',
    '/_next/static/',
    '/uploads/',
    '/images/',
  ];

  const privateDisallowed = [
    '/admin/',
    '/api/',
    '/proofing/',
    '/thanh-toan/',
    '/cam-on',
    '/tu-van/thanh-cong',
    '/maintenance',
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
        userAgent: 'Google-InspectionTool',
        allow: publicAllowed,
        disallow: privateDisallowed,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}


