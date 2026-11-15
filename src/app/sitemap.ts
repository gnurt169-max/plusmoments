import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { getSystemSettings } from '@/lib/settings';

export const revalidate = 3600; // Cache and revalidate every 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getSystemSettings().catch(() => null);
  const baseUrl = (settings?.canonicalBaseUrl || 'https://plusmoments.vn').replace(/\/$/, '');

  try {
    // 1. Truy vấn song song dữ liệu Album, Blog và mốc thời gian cập nhật gần nhất từ Database
    const [
      albums,
      blogPosts,
      latestAlbum,
      latestBlog,
      latestPackage,
    ] = await Promise.all([
      prisma.album.findMany({
        where: { published: true },
        select: {
          slug: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.blogPost.findMany({
        where: { published: true },
        select: {
          slug: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.album.findFirst({
        where: { published: true },
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true },
      }),
      prisma.blogPost.findFirst({
        where: { published: true },
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true },
      }),
      prisma.servicePackage.findFirst({
        where: { published: true },
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true },
      }),
    ]);

    // Mốc thời gian cập nhật mới nhất tổng thể cho Trang Chủ
    const siteLastModified = [
      latestAlbum?.updatedAt,
      latestBlog?.updatedAt,
      latestPackage?.updatedAt,
    ]
      .filter((d): d is Date => Boolean(d))
      .sort((a, b) => b.getTime() - a.getTime())[0] || new Date();

    // 2. Static Core Pages với lastModified chính xác theo ngày cập nhật thực tế từ DB
    const staticRoutes: MetadataRoute.Sitemap = [
      {
        url: `${baseUrl}`,
        lastModified: siteLastModified,
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${baseUrl}/bo-suu-tap`,
        lastModified: latestAlbum?.updatedAt || siteLastModified,
        changeFrequency: 'daily',
        priority: 0.95,
      },
      {
        url: `${baseUrl}/bang-gia`,
        lastModified: latestPackage?.updatedAt || siteLastModified,
        changeFrequency: 'weekly',
        priority: 0.95,
      },
      {
        url: `${baseUrl}/blog`,
        lastModified: latestBlog?.updatedAt || siteLastModified,
        changeFrequency: 'daily',
        priority: 0.85,
      },
      {
        url: `${baseUrl}/contact`,
        lastModified: siteLastModified,
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      {
        url: `${baseUrl}/uu-dai`,
        lastModified: latestPackage?.updatedAt || siteLastModified,
        changeFrequency: 'daily',
        priority: 0.85,
      },
    ];

    // 3. Dynamic Album Pages from Database
    const albumRoutes: MetadataRoute.Sitemap = albums.map((album) => ({
      url: `${baseUrl}/bo-suu-tap/${album.slug}`,
      lastModified: album.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.9,
    }));

    // 4. Dynamic Blog Articles from Database
    const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [...staticRoutes, ...albumRoutes, ...blogRoutes];
  } catch (err) {
    console.error('Failed to generate dynamic sitemap:', err);
    return [
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
        url: `${baseUrl}/blog`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.85,
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
  }
}

