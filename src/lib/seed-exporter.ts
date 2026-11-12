import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';

export interface SeedExportResult {
  success: boolean;
  message: string;
  exportedAt: string;
  counts: {
    adminUser: number;
    systemSetting: number;
    homePageConfig: number;
    notificationSetting: number;
    studioLocation: number;
    servicePackage: number;
    album: number;
    albumMedia: number;
    blogPost: number;
    postImage: number;
    mediaFolder: number;
    mediaFile: number;
    testimonial: number;
    albumConcept: number;
    blogCategory: number;
    serviceCategory: number;
    leadBooking: number;
    order: number;
  };
}

export async function exportDatabaseToSeedFiles(): Promise<SeedExportResult> {
  const exportedAt = new Date().toISOString();

  // 1. Fetch data across all database models in dependency-safe order
  const [
    adminUsers,
    systemSetting,
    homePageConfig,
    notificationSetting,
    studioLocation,
    servicePackage,
    albumsRaw,
    blogPostsRaw,
    mediaFoldersRaw,
    rootMediaFiles,
    testimonial,
    albumConcept,
    blogCategory,
    serviceCategory,
    leadBooking,
    order,
  ] = await Promise.all([
    prisma.adminUser.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.systemSetting.findMany(),
    prisma.homePageConfig.findMany(),
    prisma.notificationSetting.findMany(),
    prisma.studioLocation.findMany({ orderBy: { orderIndex: 'asc' } }),
    prisma.servicePackage.findMany({ orderBy: { orderIndex: 'asc' } }),
    prisma.album.findMany({
      include: {
        media: {
          orderBy: { orderIndex: 'asc' },
        },
      },
      orderBy: { orderIndex: 'asc' },
    }),
    prisma.blogPost.findMany({
      include: {
        images: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.mediaFolder.findMany({
      include: {
        files: {
          orderBy: { createdAt: 'desc' },
        },
      },
    }),
    prisma.mediaFile.findMany({
      where: { folderId: null },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.testimonial.findMany({ orderBy: { orderIndex: 'asc' } }),
    prisma.albumConcept.findMany({ orderBy: { order: 'asc' } }),
    prisma.blogCategory.findMany({ orderBy: { order: 'asc' } }),
    prisma.serviceCategory.findMany({ orderBy: { order: 'asc' } }),
    prisma.leadBooking.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.order.findMany({ orderBy: { createdAt: 'desc' } }),
  ]);

  const superAdminUser = adminUsers.find((u) => u.username === 'trunglnm') || adminUsers[0];
  const superAdminPasswordHash =
    superAdminUser?.passwordHash ||
    '$2b$12$pdyWDpxT2yfoUqgFptpJnO2dTb2r5Icy8mQCUNrbjfVGgRE/R9tEC';

  const albumMediaCount = albumsRaw.reduce((sum, a) => sum + (a.media?.length || 0), 0);
  const postImageCount = blogPostsRaw.reduce((sum, b) => sum + (b.images?.length || 0), 0);
  const folderMediaCount = mediaFoldersRaw.reduce((sum, f) => sum + (f.files?.length || 0), 0);

  // Sanitize sensitive API keys and credentials before writing to public seed files
  const sanitizedSystemSetting = systemSetting.map((s) => ({
    ...s,
    googleDriveApiKey: '',
    geminiApiKey: '',
    smtpPass: '',
    paymentWebhookKey: s.paymentWebhookKey ? 'webhook_secret_placeholder' : '',
  }));

  const sanitizedNotificationSetting = notificationSetting.map((n) => ({
    ...n,
    telegramBotToken: '',
    zaloWebhookUrl: '',
  }));

  const snapshot = {
    exportedAt,
    superAdminPasswordHash,
    adminUser: adminUsers,
    systemSetting: sanitizedSystemSetting,
    homePageConfig,
    notificationSetting: sanitizedNotificationSetting,
    studioLocation,
    servicePackage,
    album: albumsRaw,
    blogPost: blogPostsRaw,
    mediaFolder: mediaFoldersRaw,
    mediaFile: rootMediaFiles,
    testimonial,
    albumConcept,
    blogCategory,
    serviceCategory,
    leadBooking,
    order,
  };

  const serializedSnapshot = JSON.stringify(snapshot, null, 2);

  // 2. Generate Seed Script Code
  const sharedSeedFunction = `
async function main() {
  console.log('--- KHỞI TẠO DỮ LIỆU GỐC TỪ SEED MOCKUP ---');
  console.log('Thời gian xuất snapshot:', snapshot.exportedAt);

  // =========================================================================
  // BƯỚC 1: KHỞI TẠO TÀI KHOẢN ADMIN/USER ĐẦU TIÊN (ĐẢM BẢO KHÓA NGOẠI)
  // =========================================================================
  const defaultPasswordHash = snapshot.superAdminPasswordHash || '${superAdminPasswordHash}';
  const validAdminUserIds = new Set();

  // 1.1 Khởi tạo toàn bộ AdminUser từ snapshot
  if (Array.isArray(snapshot.adminUser)) {
    for (const u of (snapshot.adminUser as any[])) {
      const { createdAt, updatedAt, lastLoginAt, albums, posts, mediaFiles, ...userData } = u as any;
      const upserted = await prisma.adminUser.upsert({
        where: { id: u.id },
        update: {
          username: userData.username,
          fullName: userData.fullName,
          role: userData.role,
          isActive: userData.isActive !== false,
          email: userData.email,
        },
        create: {
          id: u.id,
          username: userData.username,
          fullName: userData.fullName,
          email: userData.email,
          passwordHash: userData.passwordHash || defaultPasswordHash,
          role: userData.role || 'ADMIN',
          isActive: userData.isActive !== false,
        },
      });
      validAdminUserIds.add(upserted.id);
    }
  }

  // 1.2 Luôn đảm bảo tài khoản SuperAdmin (trunglnm) tồn tại
  const superAdmin = await prisma.adminUser.upsert({
    where: { username: 'trunglnm' },
    update: {
      fullName: 'Lê Nguyễn Minh Trung',
      role: 'SUPER_ADMIN',
      isActive: true,
      email: 'trunglnm@plusmoments.vn',
    },
    create: {
      id: 'cmw6csqum00001fh3id5ewj2x',
      username: 'trunglnm',
      fullName: 'Lê Nguyễn Minh Trung',
      email: 'trunglnm@plusmoments.vn',
      passwordHash: defaultPasswordHash,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });
  validAdminUserIds.add(superAdmin.id);

  // 1.3 Luôn đảm bảo tài khoản Admin chuẩn (admin / admin@plusmoments.vn)
  const fallbackAdmin = await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: {
      fullName: 'Quản trị PlusMoments',
      role: 'ADMIN',
      isActive: true,
      email: 'admin@plusmoments.vn',
    },
    create: {
      id: 'cmw6d6j2b000111xefru0nut1',
      username: 'admin',
      fullName: 'Quản trị PlusMoments',
      email: 'admin@plusmoments.vn',
      passwordHash: defaultPasswordHash,
      role: 'ADMIN',
      isActive: true,
    },
  });
  validAdminUserIds.add(fallbackAdmin.id);
  const primaryAdminId = fallbackAdmin.id;
  console.log('✓ AdminUser: Khởi tạo xong các tài khoản quản trị (Primary Admin ID:', primaryAdminId, ')');

  // =========================================================================
  // BƯỚC 2: CÀI ĐẶT HỆ THỐNG ĐỘC LẬP (SystemSetting, HomePageConfig, NotificationSetting)
  // =========================================================================
  if (Array.isArray(snapshot.systemSetting)) {
    for (const item of (snapshot.systemSetting as any[])) {
      const { createdAt, updatedAt, ...data } = item as any;
      await prisma.systemSetting.upsert({
        where: { id: item.id },
        update: data,
        create: data,
      });
    }
    console.log('✓ SystemSetting: ' + snapshot.systemSetting.length + ' bản ghi');
  }

  if (Array.isArray(snapshot.homePageConfig)) {
    for (const item of (snapshot.homePageConfig as any[])) {
      const { createdAt, updatedAt, ...data } = item as any;
      await prisma.homePageConfig.upsert({
        where: { id: item.id },
        update: data,
        create: data,
      });
    }
    console.log('✓ HomePageConfig: ' + snapshot.homePageConfig.length + ' bản ghi');
  }

  if (Array.isArray(snapshot.notificationSetting)) {
    for (const item of (snapshot.notificationSetting as any[])) {
      const { createdAt, updatedAt, ...data } = item as any;
      await prisma.notificationSetting.upsert({
        where: { id: item.id },
        update: data,
        create: data,
      });
    }
    console.log('✓ NotificationSetting: ' + snapshot.notificationSetting.length + ' bản ghi');
  }

  // =========================================================================
  // BƯỚC 3: DANH MỤC TAXONOMIES & GÓI DỊCH VỤ (ServicePackage, MediaFolder)
  // =========================================================================
  if (Array.isArray(snapshot.studioLocation)) {
    for (const item of (snapshot.studioLocation as any[])) {
      const { createdAt, updatedAt, ...data } = item as any;
      await prisma.studioLocation.upsert({
        where: { id: item.id },
        update: data,
        create: data,
      });
    }
    console.log('✓ StudioLocation: ' + snapshot.studioLocation.length + ' bản ghi');
  }

  const validServiceCategoryIds = new Set();
  if (Array.isArray(snapshot.serviceCategory)) {
    for (const item of (snapshot.serviceCategory as any[])) {
      const { createdAt, ...data } = item as any;
      const upserted = await prisma.serviceCategory.upsert({
        where: { id: item.id },
        update: data,
        create: data,
      });
      validServiceCategoryIds.add(upserted.id);
    }
    console.log('✓ ServiceCategory: ' + snapshot.serviceCategory.length + ' bản ghi');
  }

  if (Array.isArray(snapshot.albumConcept)) {
    for (const item of (snapshot.albumConcept as any[])) {
      const { createdAt, ...data } = item as any;
      await prisma.albumConcept.upsert({
        where: { id: item.id },
        update: data,
        create: data,
      });
    }
    console.log('✓ AlbumConcept: ' + snapshot.albumConcept.length + ' bản ghi');
  }

  if (Array.isArray(snapshot.blogCategory)) {
    for (const item of (snapshot.blogCategory as any[])) {
      const { createdAt, ...data } = item as any;
      await prisma.blogCategory.upsert({
        where: { id: item.id },
        update: data,
        create: data,
      });
    }
    console.log('✓ BlogCategory: ' + snapshot.blogCategory.length + ' bản ghi');
  }

  const validPackageIds = new Set();
  const existingPackagesCount = await prisma.servicePackage.count();
  if (existingPackagesCount > 0) {
    const existing = await prisma.servicePackage.findMany({ select: { id: true } });
    existing.forEach((p) => validPackageIds.add(p.id));
    console.log('✓ ServicePackage: Đã có ' + existingPackagesCount + ' bản ghi, bỏ qua seed để bảo toàn 100% dữ liệu người dùng.');
  } else if (Array.isArray(snapshot.servicePackage)) {
    for (const item of (snapshot.servicePackage as any[])) {
      const { createdAt, updatedAt, albums, blogPosts, orders, categoryId, ...data } = item as any;
      const upserted = await prisma.servicePackage.upsert({
        where: { id: item.id },
        update: data,
        create: data,
      });
      validPackageIds.add(upserted.id);
    }
    console.log('✓ ServicePackage: ' + snapshot.servicePackage.length + ' bản ghi');
  }

  const validFolderIds = new Set();
  if (Array.isArray(snapshot.mediaFolder)) {
    for (const item of (snapshot.mediaFolder as any[])) {
      const { createdAt, updatedAt, files, ...folderData } = item as any;
      const upserted = await prisma.mediaFolder.upsert({
        where: { id: item.id },
        update: folderData,
        create: folderData,
      });
      validFolderIds.add(upserted.id);
    }
    console.log('✓ MediaFolder: ' + snapshot.mediaFolder.length + ' bản ghi');
  }

  // =========================================================================
  // BƯỚC 4: ALBUMS & BLOG POSTS (AN TOÀN TUYỆT ĐỐI KHÓA NGOẠI)
  // =========================================================================
  const validAlbumIds = new Set();
  if (Array.isArray(snapshot.album)) {
    for (const item of (snapshot.album as any[])) {
      const { createdAt, updatedAt, media, package: pkgRel, createdBy: userRel, testimonials, ...albumData } = item as any;
      const safeCreatedById = (albumData.createdById && validAdminUserIds.has(albumData.createdById))
        ? albumData.createdById
        : primaryAdminId;
      const safePackageId = (albumData.packageId && validPackageIds.has(albumData.packageId))
        ? albumData.packageId
        : null;

      const finalAlbumData = {
        ...albumData,
        createdById: safeCreatedById,
        packageId: safePackageId,
      };

      const upserted = await prisma.album.upsert({
        where: { id: item.id },
        update: finalAlbumData,
        create: finalAlbumData,
      });
      validAlbumIds.add(upserted.id);

      if (Array.isArray(media)) {
        for (const m of (media as any[])) {
          const { createdAt, updatedAt, album: albRel, ...mdata } = m as any;
          await prisma.albumMedia.upsert({
            where: { id: m.id },
            update: { ...mdata, albumId: upserted.id },
            create: { ...mdata, albumId: upserted.id },
          });
        }
      }
    }
    console.log('✓ Album: ' + snapshot.album.length + ' bản ghi');
  }

  const validPostIds = new Set();
  if (Array.isArray(snapshot.blogPost)) {
    for (const item of (snapshot.blogPost as any[])) {
      const { createdAt, updatedAt, images, package: pkgRel, authorUser: userRel, ...blogData } = item as any;
      const safeAuthorId = (blogData.authorId && validAdminUserIds.has(blogData.authorId))
        ? blogData.authorId
        : primaryAdminId;
      const safePackageId = (blogData.packageId && validPackageIds.has(blogData.packageId))
        ? blogData.packageId
        : null;

      const finalBlogData = {
        ...blogData,
        authorId: safeAuthorId,
        packageId: safePackageId,
      };

      const upserted = await prisma.blogPost.upsert({
        where: { id: item.id },
        update: finalBlogData,
        create: finalBlogData,
      });
      validPostIds.add(upserted.id);

      if (Array.isArray(images)) {
        for (const img of (images as any[])) {
          const { createdAt, updatedAt, post: postRel, ...imgData } = img as any;
          await prisma.postImage.upsert({
            where: { id: img.id },
            update: { ...imgData, postId: upserted.id },
            create: { ...imgData, postId: upserted.id },
          });
        }
      }
    }
    console.log('✓ BlogPost: ' + snapshot.blogPost.length + ' bản ghi');
  }

  // =========================================================================
  // BƯỚC 5: CÁC THỰC THỂ PHỤ THUỘC TIẾP THEO (MediaFiles, Testimonials, Leads, Orders)
  // =========================================================================
  if (Array.isArray(snapshot.mediaFolder)) {
    for (const item of (snapshot.mediaFolder as any[])) {
      if (Array.isArray((item as any).files)) {
        for (const f of ((item as any).files as any[])) {
          const { createdAt, updatedAt, folder: foldRel, uploadedBy: userRel, ...fileData } = f as any;
          const safeFolderId = (fileData.folderId && validFolderIds.has(fileData.folderId))
            ? fileData.folderId
            : null;
          const safeUploadedById = (fileData.uploadedById && validAdminUserIds.has(fileData.uploadedById))
            ? fileData.uploadedById
            : null;

          await prisma.mediaFile.upsert({
            where: { id: f.id },
            update: { ...fileData, folderId: safeFolderId, uploadedById: safeUploadedById },
            create: { ...fileData, folderId: safeFolderId, uploadedById: safeUploadedById },
          });
        }
      }
    }
  }

  if (Array.isArray(snapshot.mediaFile)) {
    for (const f of (snapshot.mediaFile as any[])) {
      const { createdAt, updatedAt, ...fileData } = f as any;
      const safeUploadedById = (fileData.uploadedById && validAdminUserIds.has(fileData.uploadedById))
        ? fileData.uploadedById
        : null;

      await prisma.mediaFile.upsert({
        where: { id: f.id },
        update: { ...fileData, uploadedById: safeUploadedById },
        create: { ...fileData, uploadedById: safeUploadedById },
      });
    }
    console.log('✓ Root MediaFiles: ' + snapshot.mediaFile.length + ' bản ghi');
  }

  if (Array.isArray(snapshot.testimonial)) {
    for (const item of (snapshot.testimonial as any[])) {
      const { createdAt, updatedAt, ...testData } = item as any;
      const safeAlbumId = (testData.albumId && validAlbumIds.has(testData.albumId))
        ? testData.albumId
        : null;
      const safePackageId = (testData.packageId && validPackageIds.has(testData.packageId))
        ? testData.packageId
        : null;

      await prisma.testimonial.upsert({
        where: { id: item.id },
        update: { ...testData, albumId: safeAlbumId, packageId: safePackageId },
        create: { ...testData, albumId: safeAlbumId, packageId: safePackageId },
      });
    }
    console.log('✓ Testimonial: ' + snapshot.testimonial.length + ' bản ghi');
  }

  if (Array.isArray(snapshot.leadBooking)) {
    for (const item of (snapshot.leadBooking as any[])) {
      const { createdAt, updatedAt, package: pkgRel, ...data } = item as any;
      const safePackageId = (data.packageId && validPackageIds.has(data.packageId))
        ? data.packageId
        : null;

      await prisma.leadBooking.upsert({
        where: { id: item.id },
        update: { ...data, packageId: safePackageId },
        create: {
          ...data,
          packageId: safePackageId,
          createdAt: createdAt ? new Date(createdAt) : new Date(),
          updatedAt: updatedAt ? new Date(updatedAt) : new Date(),
        },
      });
    }
    console.log('✓ LeadBooking: ' + snapshot.leadBooking.length + ' bản ghi');
  }

  if (Array.isArray(snapshot.order)) {
    for (const item of (snapshot.order as any[])) {
      const { createdAt, updatedAt, paidAt, package: pkgRel, ...data } = item as any;
      const safePackageId = (data.packageId && validPackageIds.has(data.packageId))
        ? data.packageId
        : null;

      await prisma.order.upsert({
        where: { id: item.id },
        update: {
          ...data,
          packageId: safePackageId,
          paidAt: paidAt ? new Date(paidAt) : null,
        },
        create: {
          ...data,
          packageId: safePackageId,
          paidAt: paidAt ? new Date(paidAt) : null,
          createdAt: createdAt ? new Date(createdAt) : new Date(),
          updatedAt: updatedAt ? new Date(updatedAt) : new Date(),
        },
      });
    }
    console.log('✓ Order: ' + snapshot.order.length + ' bản ghi');
  }

  console.log('--- KHỞI TẠO DỮ LIỆU TỪ SEED MOCKUP THÀNH CÔNG ---');
}

main()
  .catch((e) => {
    console.error('Lỗi khi nạp seed snapshot:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
`;

  // 3. Generate TypeScript Code for prisma/seed.ts
  const tsSeedContent = `/**
 * AUTO-GENERATED DATABASE SEED SNAPSHOT
 * Exported at: ${exportedAt}
 *
 * This file contains the complete persistent snapshot of the studio's database.
 * To initialize or restore this data on a new VPS or local machine:
 *   npx prisma db seed
 * or:
 *   npm run db:restore-seed
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const snapshot = ${serializedSnapshot};
${sharedSeedFunction}`;

  // 4. Generate CommonJS JavaScript Code for prisma/seed.js
  const jsSeedContent = `/**
 * AUTO-GENERATED DATABASE SEED SNAPSHOT (CommonJS)
 * Exported at: ${exportedAt}
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const snapshot = ${serializedSnapshot};
${sharedSeedFunction}`;

  // 5. Write directly to prisma/seed.ts and prisma/seed.js
  const prismaDir = path.join(process.cwd(), 'prisma');
  const seedTsPath = path.join(prismaDir, 'seed.ts');
  const seedJsPath = path.join(prismaDir, 'seed.js');

  await fs.promises.writeFile(seedTsPath, tsSeedContent, 'utf-8');
  await fs.promises.writeFile(seedJsPath, jsSeedContent, 'utf-8');

  return {
    success: true,
    message: 'Đã lưu toàn bộ dữ liệu hiện tại làm Seed Mockup gốc thành công!',
    exportedAt,
    counts: {
      adminUser: adminUsers.length,
      systemSetting: systemSetting.length,
      homePageConfig: homePageConfig.length,
      notificationSetting: notificationSetting.length,
      studioLocation: studioLocation.length,
      servicePackage: servicePackage.length,
      album: albumsRaw.length,
      albumMedia: albumMediaCount,
      blogPost: blogPostsRaw.length,
      postImage: postImageCount,
      mediaFolder: mediaFoldersRaw.length,
      mediaFile: rootMediaFiles.length + folderMediaCount,
      testimonial: testimonial.length,
      albumConcept: albumConcept.length,
      blogCategory: blogCategory.length,
      serviceCategory: serviceCategory.length,
      leadBooking: leadBooking.length,
      order: order.length,
    },
  };
}
