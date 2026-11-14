import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { prisma } from './prisma';
import { getSystemSettings } from './settings';

/**
 * 1. SYSTEM SETTINGS & HOME PAGE CONFIG (tag: 'settings')
 */
export const getCachedSystemSettings = getSystemSettings;

const fetchHomePageConfigCached = unstable_cache(
  async () => {
    try {
      return await prisma.homePageConfig.findUnique({
        where: { id: 'default' },
      });
    } catch {
      return null;
    }
  },
  ['public-home-config'],
  {
    tags: ['settings'],
    revalidate: 60,
  }
);

export const getCachedHomePageConfig = cache(async () => {
  return fetchHomePageConfigCached();
});

const fetchTestimonialsCached = unstable_cache(
  async () => {
    try {
      return await prisma.testimonial.findMany({
        where: { published: true, OR: [{ featured: true }, { isFeatured: true }] },
        orderBy: [{ orderIndex: 'asc' }, { createdAt: 'desc' }],
        take: 6,
      });
    } catch {
      return [];
    }
  },
  ['public-testimonials'],
  {
    tags: ['settings'],
    revalidate: 60,
  }
);

export const getCachedTestimonials = cache(async () => {
  return fetchTestimonialsCached();
});

/**
 * 2. ALBUMS (tag: 'albums')
 */
const fetchAlbumsCached = unstable_cache(
  async () => {
    try {
      return await prisma.album.findMany({
        where: { published: true },
        orderBy: [
          { featured: 'desc' },
          { orderIndex: 'asc' },
          { createdAt: 'desc' },
        ],
        include: {
          media: { take: 1, orderBy: { orderIndex: 'asc' } },
          package: true,
        },
      });
    } catch {
      return [];
    }
  },
  ['public-albums'],
  {
    tags: ['albums'],
    revalidate: 60,
  }
);

export const getCachedAlbums = cache(async () => {
  return fetchAlbumsCached();
});

/**
 * Serializes Prisma Decimal & Date fields to plain JavaScript types (number & string)
 * to prevent Next.js Flight warning: "Only plain objects can be passed to Client Components from Server Components"
 */
export function serializePackage<T extends Record<string, any>>(pkg: T | null | undefined): any {
  if (!pkg) return null;
  return {
    ...pkg,
    price: Number(pkg.price) || 0,
    originalPrice: pkg.originalPrice != null ? Number(pkg.originalPrice) : null,
    createdAt: pkg.createdAt instanceof Date ? pkg.createdAt.toISOString() : pkg.createdAt,
    updatedAt: pkg.updatedAt instanceof Date ? pkg.updatedAt.toISOString() : pkg.updatedAt,
    blogPosts: Array.isArray(pkg.blogPosts)
      ? pkg.blogPosts.map((b: any) => ({
          ...b,
          createdAt: b.createdAt instanceof Date ? b.createdAt.toISOString() : b.createdAt,
          updatedAt: b.updatedAt instanceof Date ? b.updatedAt.toISOString() : b.updatedAt,
          publishedAt: b.publishedAt instanceof Date ? b.publishedAt.toISOString() : b.publishedAt,
        }))
      : [],
  };
}

const fetchAlbumBySlugCached = unstable_cache(
  async (slug: string) => {
    try {
      const album = await prisma.album.findUnique({
        where: { slug },
        include: {
          package: true,
          media: { orderBy: { orderIndex: 'asc' } },
        },
      });
      if (!album) return null;
      return {
        ...album,
        package: album.package ? serializePackage(album.package) : null,
      };
    } catch {
      return null;
    }
  },
  ['public-album-by-slug'],
  {
    tags: ['albums'],
    revalidate: 60,
  }
);

export const getCachedAlbumBySlug = cache(async (slug: string) => {
  return fetchAlbumBySlugCached(slug);
});

/**
 * 3. PACKAGES & FAQS (tag: 'packages')
 */
const fetchPackagesCached = unstable_cache(
  async () => {
    try {
      const pkgs = await prisma.servicePackage.findMany({
        where: { published: true },
        include: {
          blogPosts: {
            where: { published: true },
            select: {
              id: true,
              title: true,
              slug: true,
              coverImage: true,
              summary: true,
              readingMinutes: true,
              publishedAt: true,
              createdAt: true,
            },
            orderBy: { publishedAt: 'desc' },
          },
        },
        orderBy: [
          { isPopular: 'desc' },
          { isFeatured: 'desc' },
          { orderIndex: 'asc' },
        ],
      });
      return pkgs.map((p) => serializePackage(p));
    } catch {
      return [];
    }
  },
  ['public-packages'],
  {
    tags: ['packages'],
    revalidate: 60,
  }
);

export const getCachedPackages = cache(async () => {
  return fetchPackagesCached();
});

const fetchPricingFaqsCached = unstable_cache(
  async () => {
    try {
      return await prisma.pricingFaq.findMany({
        where: { isActive: true },
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      });
    } catch {
      return [];
    }
  },
  ['public-pricing-faqs'],
  {
    tags: ['packages', 'settings'],
    revalidate: 60,
  }
);

export const getCachedPricingFaqs = cache(async () => {
  return fetchPricingFaqsCached();
});

/**
 * 4. BLOG POSTS (tag: 'blogs')
 */
const fetchBlogsCached = unstable_cache(
  async () => {
    try {
      return await prisma.blogPost.findMany({
        where: { published: true },
        orderBy: { publishedAt: 'desc' },
      });
    } catch {
      return [];
    }
  },
  ['public-blogs'],
  {
    tags: ['blogs'],
    revalidate: 60,
  }
);

export const getCachedBlogs = cache(async () => {
  return fetchBlogsCached();
});

const fetchBlogBySlugCached = unstable_cache(
  async (slug: string) => {
    try {
      return await prisma.blogPost.findUnique({
        where: { slug },
        include: {
          package: true,
          images: {
            orderBy: { orderIndex: 'asc' },
          },
        },
      });
    } catch {
      return null;
    }
  },
  ['public-blog-by-slug'],
  {
    tags: ['blogs'],
    revalidate: 60,
  }
);

export const getCachedBlogBySlug = cache(async (slug: string) => {
  return fetchBlogBySlugCached(slug);
});

