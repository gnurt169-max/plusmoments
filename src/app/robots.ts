import { MetadataRoute } from 'next';
import { getSystemSettings } from '@/lib/settings';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSystemSettings().catch(() => null);
  const baseUrl = settings?.canonicalBaseUrl || 'https://plusmoments.vn';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/api/',
        '/_next/',
        '/thanh-toan/',
        '/cam-on',
        '/tu-van/thanh-cong',
        '/maintenance',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}


