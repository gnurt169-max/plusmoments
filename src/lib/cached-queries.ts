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

const fetchAlbumBySlugCached = unstable_cache(
  async (slug: string) => {
    try {
      return await prisma.album.findUnique({
        where: { slug },
        include: {
          package: true,
          media: { orderBy: { orderIndex: 'asc' } },
        },
      });
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
      return await prisma.servicePackage.findMany({
        where: { published: true },
        orderBy: [
          { isPopular: 'desc' },
          { isFeatured: 'desc' },
          { orderIndex: 'asc' },
        ],
      });
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

