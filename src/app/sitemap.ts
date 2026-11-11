import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { getSystemSettings } from '@/lib/settings';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getSystemSettings();
  const baseUrl = settings.canonicalBaseUrl || 'https://plusmoments.vn';

  // 1. Static Core Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/bo-suu-tap`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/bang-gia`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cam-nang`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/uu-dai`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.85,
    },
  ];

  try {
    // 2. Dynamic Album Pages from Database
    const albums = await prisma.album.findMany({
      where: { published: true },
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    const albumRoutes: MetadataRoute.Sitemap = albums.map((album) => ({
      url: `${baseUrl}/bo-suu-tap/${album.slug}`,
      lastModified: album.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.9,
    }));

    // 3. Dynamic Blog Articles from Database
    const blogPosts = await prisma.blogPost.findMany({
      where: { published: true },
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    const blogRoutes: MetadataRoute.Sitemap = blogPosts.flatMap((post) => [
      {
        url: `${baseUrl}/cam-nang/${post.slug}`,
        lastModified: post.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: post.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.75,
      },
    ]);

    // 4. Dynamic Packages from Database
    const packages = await prisma.servicePackage.findMany({
      where: { published: true },
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    const packageRoutes: MetadataRoute.Sitemap = packages.map((pkg) => ({
      url: `${baseUrl}/bang-gia/${pkg.slug}`,
      lastModified: pkg.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.85,
    }));

    return [...staticRoutes, ...albumRoutes, ...blogRoutes, ...packageRoutes];
  } catch (err) {
    console.error('Failed to generate dynamic sitemap:', err);
    return staticRoutes;
  }
}

