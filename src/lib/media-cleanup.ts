import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

/**
 * Revalidates all frontend public routes and admin CMS routes that display media
 */
export function revalidateMediaRelatedPaths() {
  try {
    // Public routes
    revalidatePath('/', 'page');
    revalidatePath('/albums', 'page');
    revalidatePath('/albums/[slug]', 'page');
    revalidatePath('/bo-suu-tap', 'page');
    revalidatePath('/bo-suu-tap/[slug]', 'page');
    revalidatePath('/pricing', 'page');
    revalidatePath('/bang-gia', 'page');
    revalidatePath('/blog', 'page');
    revalidatePath('/blog/[slug]', 'page');
    revalidatePath('/cam-nang', 'page');
    revalidatePath('/cam-nang/[slug]', 'page');
    revalidatePath('/contact', 'page');

    // Admin CMS routes
    revalidatePath('/admin/media', 'page');
    revalidatePath('/admin/home', 'page');
    revalidatePath('/admin/albums', 'page');
    revalidatePath('/admin/packages', 'page');
    revalidatePath('/admin/blog', 'page');
    revalidatePath('/admin/settings', 'page');
  } catch (err) {
    console.warn('[revalidateMediaRelatedPaths Error]:', err);
  }
}

/**
 * Cleans up dangling references in all tables (Album, Package, BlogPost, Testimonial, Settings, etc.)
 * when image files are deleted from the system, executed within an atomic Prisma transaction.
 */
export async function cleanupDanglingMediaReferences(urls: string[]) {
  const targetUrls = Array.from(
    new Set(
      urls
        .filter((u): u is string => typeof u === 'string' && u.trim().length > 0)
        .map((u) => u.trim())
    )
  );

  if (targetUrls.length === 0) {
    return { cleanedCount: 0 };
  }

  let cleanedAlbumCovers = 0;
  let cleanedAlbumMedia = 0;
  let cleanedPackageCovers = 0;
  let cleanedBlogCovers = 0;
  let cleanedPostImages = 0;
  let cleanedAvatars = 0;
  let cleanedSettings = 0;

  await prisma.$transaction(async (tx) => {
    // 1. ALBUMS: coverImage & AlbumMedia
    const albumCoverRes = await tx.album.updateMany({
      where: { coverImage: { in: targetUrls } },
      data: { coverImage: '' },
    });
    cleanedAlbumCovers = albumCoverRes.count;

    const albumMediaRes = await tx.albumMedia.deleteMany({
      where: { url: { in: targetUrls } },
    });
    cleanedAlbumMedia = albumMediaRes.count;

    // 2. PACKAGES: coverImage & demoImages JSON array
    const pkgCoverRes = await tx.servicePackage.updateMany({
      where: { coverImage: { in: targetUrls } },
      data: { coverImage: '' },
    });
    cleanedPackageCovers = pkgCoverRes.count;

    const packagesWithDemo = await tx.servicePackage.findMany({
      where: { demoImages: { not: null } },
      select: { id: true, demoImages: true },
    });

    for (const pkg of packagesWithDemo) {
      if (!pkg.demoImages) continue;
      try {
        const parsed = JSON.parse(pkg.demoImages);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((u: string) => !targetUrls.includes(u));
          if (filtered.length !== parsed.length) {
            await tx.servicePackage.update({
              where: { id: pkg.id },
              data: { demoImages: filtered.length > 0 ? JSON.stringify(filtered) : null },
            });
          }
        }
      } catch {}
    }

    // 3. BLOG POSTS: coverImage, PostImage table & galleryImages JSON
    const blogCoverRes = await tx.blogPost.updateMany({
      where: { coverImage: { in: targetUrls } },
      data: { coverImage: '' },
    });
    cleanedBlogCovers = blogCoverRes.count;

    const postImageRes = await tx.postImage.deleteMany({
      where: { url: { in: targetUrls } },
    });
    cleanedPostImages = postImageRes.count;

    const postsWithGallery = await tx.blogPost.findMany({
      select: { id: true, galleryImages: true },
    });

    for (const post of postsWithGallery) {
      if (!post.galleryImages) continue;
      try {
        const gallery = Array.isArray(post.galleryImages) ? post.galleryImages : [];
        const filtered = gallery.filter((item: any) => {
          const u = typeof item === 'string' ? item : item?.url;
          return !targetUrls.includes(u);
        });
        if (filtered.length !== gallery.length) {
          await tx.blogPost.update({
            where: { id: post.id },
            data: { galleryImages: filtered },
          });
        }
      } catch {}
    }

    // 4. TESTIMONIALS: avatarUrl & coverImageUrl
    const avatarRes = await tx.testimonial.updateMany({
      where: { avatarUrl: { in: targetUrls } },
      data: { avatarUrl: null },
    });
    const testCoverRes = await tx.testimonial.updateMany({
      where: { coverImageUrl: { in: targetUrls } },
      data: { coverImageUrl: null },
    });
    cleanedAvatars = avatarRes.count + testCoverRes.count;

    // 5. SYSTEM SETTINGS: logoLightUrl, logoDarkUrl, defaultOgImage
    const logoLightRes = await tx.systemSetting.updateMany({
      where: { logoLightUrl: { in: targetUrls } },
      data: { logoLightUrl: null },
    });
    const logoDarkRes = await tx.systemSetting.updateMany({
      where: { logoDarkUrl: { in: targetUrls } },
      data: { logoDarkUrl: null },
    });
    const ogRes = await tx.systemSetting.updateMany({
      where: { defaultOgImage: { in: targetUrls } },
      data: { defaultOgImage: '' },
    });
    cleanedSettings = logoLightRes.count + logoDarkRes.count + ogRes.count;

    // 6. HOME PAGE CONFIG: heroBannerImage
    await tx.homePageConfig.updateMany({
      where: { heroBannerImage: { in: targetUrls } },
      data: { heroBannerImage: '' },
    });

    // 7. MEDIA FILES: MediaFile database records
    await tx.mediaFile.deleteMany({
      where: { url: { in: targetUrls } },
    });
  });

  // Revalidate Next.js cache across all pages
  revalidateMediaRelatedPaths();

  return {
    cleanedUrlsCount: targetUrls.length,
    cleanedAlbumCovers,
    cleanedAlbumMedia,
    cleanedPackageCovers,
    cleanedBlogCovers,
    cleanedPostImages,
    cleanedAvatars,
    cleanedSettings,
  };
}

/**
 * Cleans up all dangling references across the website when an entire folder is deleted
 */
export async function cleanupDanglingFolderReferences(folderSlug: string, folderId?: string) {
  if (!folderSlug) return { cleanedCount: 0 };
  const prefix = `/uploads/folders/${folderSlug}/`;

  await prisma.$transaction(async (tx) => {
    // 1. ALBUMS: coverImage & AlbumMedia starting with folder prefix
    await tx.album.updateMany({
      where: { coverImage: { startsWith: prefix } },
      data: { coverImage: '' },
    });
    await tx.albumMedia.deleteMany({
      where: { url: { startsWith: prefix } },
    });

    // 2. PACKAGES: coverImage & demoImages
    await tx.servicePackage.updateMany({
      where: { coverImage: { startsWith: prefix } },
      data: { coverImage: '' },
    });
    const packagesWithDemo = await tx.servicePackage.findMany({
      where: { demoImages: { contains: prefix } },
      select: { id: true, demoImages: true },
    });
    for (const pkg of packagesWithDemo) {
      if (!pkg.demoImages) continue;
      try {
        const parsed = JSON.parse(pkg.demoImages);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((u: string) => !u.startsWith(prefix));
          await tx.servicePackage.update({
            where: { id: pkg.id },
            data: { demoImages: filtered.length > 0 ? JSON.stringify(filtered) : null },
          });
        }
      } catch {}
    }

    // 3. BLOG POSTS: coverImage, PostImage & galleryImages
    await tx.blogPost.updateMany({
      where: { coverImage: { startsWith: prefix } },
      data: { coverImage: '' },
    });
    await tx.postImage.deleteMany({
      where: { url: { startsWith: prefix } },
    });
    const postsWithGallery = await tx.blogPost.findMany({
      select: { id: true, galleryImages: true },
    });
    for (const post of postsWithGallery) {
      if (!post.galleryImages) continue;
      try {
        const gallery = Array.isArray(post.galleryImages) ? post.galleryImages : [];
        const filtered = gallery.filter((item: any) => {
          const u = typeof item === 'string' ? item : item?.url;
          return u && !u.startsWith(prefix);
        });
        if (filtered.length !== gallery.length) {
          await tx.blogPost.update({
            where: { id: post.id },
            data: { galleryImages: filtered },
          });
        }
      } catch {}
    }

    // 4. TESTIMONIALS
    await tx.testimonial.updateMany({
      where: { avatarUrl: { startsWith: prefix } },
      data: { avatarUrl: null },
    });
    await tx.testimonial.updateMany({
      where: { coverImageUrl: { startsWith: prefix } },
      data: { coverImageUrl: null },
    });

    // 5. SYSTEM SETTINGS & HOMEPAGE CONFIG
    await tx.systemSetting.updateMany({
      where: { logoLightUrl: { startsWith: prefix } },
      data: { logoLightUrl: null },
    });
    await tx.systemSetting.updateMany({
      where: { logoDarkUrl: { startsWith: prefix } },
      data: { logoDarkUrl: null },
    });
    await tx.systemSetting.updateMany({
      where: { defaultOgImage: { startsWith: prefix } },
      data: { defaultOgImage: '' },
    });
    await tx.homePageConfig.updateMany({
      where: { heroBannerImage: { startsWith: prefix } },
      data: { heroBannerImage: '' },
    });

    // 6. MEDIA FOLDER & FILES
    const folderWhere = folderId
      ? { OR: [{ id: folderId }, { slug: folderSlug }] }
      : { slug: folderSlug };

    await tx.mediaFolder.deleteMany({
      where: folderWhere,
    });
  });

  revalidateMediaRelatedPaths();
  return { success: true };
}

/**
 * Scans DB tables for any /uploads/ paths whose physical file no longer exists on disk,
 * and resets them cleanly to prevent /_next/image timeouts and 404 console errors.
 */
export async function cleanupMissingPhysicalImages() {
  const fs = await import('fs');
  const path = await import('path');
  const rootDir = process.cwd();

  const isFileMissing = (url?: string | null): boolean => {
    if (!url || typeof url !== 'string' || !url.startsWith('/uploads/')) return false;
    const cleanPath = url.split('?')[0].split('#')[0];
    const absolutePath = path.join(rootDir, 'public', cleanPath);
    return !fs.existsSync(absolutePath);
  };

  let cleaned = 0;

  // 1. Albums
  const albums = await prisma.album.findMany({ select: { id: true, coverImage: true } });
  for (const album of albums) {
    if (isFileMissing(album.coverImage)) {
      await prisma.album.update({ where: { id: album.id }, data: { coverImage: '' } });
      cleaned++;
    }
  }

  // 2. Packages
  const packages = await prisma.servicePackage.findMany({ select: { id: true, coverImage: true, demoImages: true } });
  for (const pkg of packages) {
    let updateData: any = {};
    if (isFileMissing(pkg.coverImage)) {
      updateData.coverImage = '';
      cleaned++;
    }
    if (pkg.demoImages) {
      try {
        const parsed = JSON.parse(pkg.demoImages);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((u: string) => !isFileMissing(u));
          if (filtered.length !== parsed.length) {
            updateData.demoImages = filtered.length > 0 ? JSON.stringify(filtered) : null;
            cleaned++;
          }
        }
      } catch {}
    }
    if (Object.keys(updateData).length > 0) {
      await prisma.servicePackage.update({ where: { id: pkg.id }, data: updateData });
    }
  }

  // 3. Blog Posts
  const posts = await prisma.blogPost.findMany({ select: { id: true, coverImage: true } });
  for (const post of posts) {
    if (isFileMissing(post.coverImage)) {
      await prisma.blogPost.update({ where: { id: post.id }, data: { coverImage: '' } });
      cleaned++;
    }
  }

  // 4. HomePageConfig
  const home = await prisma.homePageConfig.findFirst();
  if (home && isFileMissing(home.heroBannerImage)) {
    await prisma.homePageConfig.update({ where: { id: home.id }, data: { heroBannerImage: '' } });
    cleaned++;
  }

  if (cleaned > 0) {
    revalidateMediaRelatedPaths();
  }

  return { cleaned };
}
