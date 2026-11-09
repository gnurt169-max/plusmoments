import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';

export interface SeedExportResult {
  success: boolean;
  message: string;
  exportedAt: string;
  counts: {
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

  // 1. Fetch data across all database models
  const [
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
    superAdminUser,
  ] = await Promise.all([
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
    prisma.adminUser.findUnique({ where: { username: 'trunglnm' } }),
  ]);

  const superAdminPasswordHash =
    superAdminUser?.passwordHash ||
    '$2b$12$hKP8uT/Nq4AA4mKlBsXAvuz4q93qGQQp7mkhED2wevmdli/rY8GPG';

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

  // 2. Generate TypeScript Code for prisma/seed.ts
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

async function main() {
  console.log('--- KHỞI TẠO DỮ LIỆU GỐC TỪ SEED MOCKUP ---');
  console.log('Thời gian xuất snapshot:', snapshot.exportedAt);

  // 1. System Settings
  for (const item of ((snapshot.systemSetting || []) as any[])) {
    const { createdAt, updatedAt, ...data } = item as any;
    await prisma.systemSetting.upsert({
      where: { id: item.id },
      update: data,
      create: data,
    });
  }
  console.log(\`✓ SystemSetting: \${snapshot.systemSetting.length} bản ghi\`);

  // 2. Home Page Config
  for (const item of ((snapshot.homePageConfig || []) as any[])) {
    const { createdAt, updatedAt, ...data } = item as any;
    await prisma.homePageConfig.upsert({
      where: { id: item.id },
      update: data,
      create: data,
    });
  }
  console.log(\`✓ HomePageConfig: \${snapshot.homePageConfig.length} bản ghi\`);

  // 3. Notification Settings
  if (Array.isArray(snapshot.notificationSetting)) {
    for (const item of (snapshot.notificationSetting as any[])) {
      const { createdAt, updatedAt, ...data } = item as any;
      await prisma.notificationSetting.upsert({
        where: { id: item.id },
        update: data,
        create: data,
      });
    }
    console.log(\`✓ NotificationSetting: \${snapshot.notificationSetting.length} bản ghi\`);
  }

  // 4. Studio Locations
  if (Array.isArray(snapshot.studioLocation)) {
    for (const item of (snapshot.studioLocation as any[])) {
      const { createdAt, updatedAt, ...data } = item as any;
      await prisma.studioLocation.upsert({
        where: { id: item.id },
        update: data,
        create: data,
      });
    }
    console.log(\`✓ StudioLocation: \${snapshot.studioLocation.length} bản ghi\`);
  }

  // 5. Service Packages
  if (Array.isArray(snapshot.servicePackage)) {
    for (const item of (snapshot.servicePackage as any[])) {
      const { createdAt, updatedAt, albums, blogPosts, ...data } = item as any;
      await prisma.servicePackage.upsert({
        where: { id: item.id },
        update: data,
        create: data,
      });
    }
    console.log(\`✓ ServicePackage: \${snapshot.servicePackage.length} bản ghi\`);
  }

  // 6. Albums & Album Media
  if (Array.isArray(snapshot.album)) {
    for (const item of (snapshot.album as any[])) {
      const { createdAt, updatedAt, media, package: pkgRel, ...albumData } = item as any;
      await prisma.album.upsert({
        where: { id: item.id },
        update: albumData,
        create: albumData,
      });

      if (Array.isArray(media)) {
        for (const m of (media as any[])) {
          const { createdAt, updatedAt, ...mdata } = m as any;
          await prisma.albumMedia.upsert({
            where: { id: m.id },
            update: mdata,
            create: mdata,
          });
        }
      }
    }
    console.log(\`✓ Album: \${snapshot.album.length} bản ghi\`);
  }

  // 7. Blog Posts & Post Images
  if (Array.isArray(snapshot.blogPost)) {
    for (const item of (snapshot.blogPost as any[])) {
      const { createdAt, updatedAt, images, package: pkgRel, ...blogData } = item as any;
      await prisma.blogPost.upsert({
        where: { id: item.id },
        update: blogData,
        create: blogData,
      });

      if (Array.isArray(images)) {
        for (const img of (images as any[])) {
          const { createdAt, ...imgData } = img as any;
          await prisma.postImage.upsert({
            where: { id: img.id },
            update: imgData,
            create: imgData,
          });
        }
      }
    }
    console.log(\`✓ BlogPost: \${snapshot.blogPost.length} bản ghi\`);
  }

  // 8. Media Folders & Files
  if (Array.isArray(snapshot.mediaFolder)) {
    for (const item of (snapshot.mediaFolder as any[])) {
      const { createdAt, updatedAt, files, ...folderData } = item as any;
      await prisma.mediaFolder.upsert({
        where: { id: item.id },
        update: folderData,
        create: folderData,
      });

      if (Array.isArray(files)) {
        for (const f of (files as any[])) {
          const { createdAt, updatedAt, ...fileData } = f as any;
          await prisma.mediaFile.upsert({
            where: { id: f.id },
            update: fileData,
            create: fileData,
          });
        }
      }
    }
    console.log(\`✓ MediaFolder: \${snapshot.mediaFolder.length} bản ghi\`);
  }

  // 9. Root Media Files (folderId is null)
  if (Array.isArray(snapshot.mediaFile)) {
    for (const f of (snapshot.mediaFile as any[])) {
      const { createdAt, updatedAt, ...fileData } = f as any;
      await prisma.mediaFile.upsert({
        where: { id: f.id },
        update: fileData,
        create: fileData,
      });
    }
    console.log(\`✓ Root MediaFiles: \${snapshot.mediaFile.length} bản ghi\`);
  }

  // 10. Testimonials
  if (Array.isArray(snapshot.testimonial)) {
    for (const item of (snapshot.testimonial as any[])) {
      const { createdAt, updatedAt, ...testData } = item as any;
      await prisma.testimonial.upsert({
        where: { id: item.id },
        update: testData,
        create: testData,
      });
    }
    console.log(\`✓ Testimonial: \${snapshot.testimonial.length} bản ghi\`);
  }

  // 11. Album Concepts
  if (Array.isArray(snapshot.albumConcept)) {
    for (const item of (snapshot.albumConcept as any[])) {
      const { createdAt, ...data } = item as any;
      await prisma.albumConcept.upsert({
        where: { id: item.id },
        update: data,
        create: data,
      });
    }
    console.log(\`✓ AlbumConcept: \${snapshot.albumConcept.length} bản ghi\`);
  }

  // 12. Blog Categories
  if (Array.isArray(snapshot.blogCategory)) {
    for (const item of (snapshot.blogCategory as any[])) {
      const { createdAt, ...data } = item as any;
      await prisma.blogCategory.upsert({
        where: { id: item.id },
        update: data,
        create: data,
      });
    }
    console.log(\`✓ BlogCategory: \${snapshot.blogCategory.length} bản ghi\`);
  }

  // 13. Service Categories
  if (Array.isArray(snapshot.serviceCategory)) {
    for (const item of (snapshot.serviceCategory as any[])) {
      const { createdAt, ...data } = item as any;
      await prisma.serviceCategory.upsert({
        where: { id: item.id },
        update: data,
        create: data,
      });
    }
    console.log(\`✓ ServiceCategory: \${snapshot.serviceCategory.length} bản ghi\`);
  }

  // 14. Lead Bookings
  if (Array.isArray(snapshot.leadBooking)) {
    for (const item of (snapshot.leadBooking as any[])) {
      const { createdAt, updatedAt, ...data } = item as any;
      await prisma.leadBooking.upsert({
        where: { id: item.id },
        update: data,
        create: {
          ...data,
          createdAt: createdAt ? new Date(createdAt) : new Date(),
          updatedAt: updatedAt ? new Date(updatedAt) : new Date(),
        },
      });
    }
    console.log(\`✓ LeadBooking: \${snapshot.leadBooking.length} bản ghi\`);
  }

  // 15. Orders
  if (Array.isArray(snapshot.order)) {
    for (const item of (snapshot.order as any[])) {
      const { createdAt, updatedAt, paidAt, ...data } = item as any;
      await prisma.order.upsert({
        where: { id: item.id },
        update: {
          ...data,
          paidAt: paidAt ? new Date(paidAt) : null,
        },
        create: {
          ...data,
          paidAt: paidAt ? new Date(paidAt) : null,
          createdAt: createdAt ? new Date(createdAt) : new Date(),
          updatedAt: updatedAt ? new Date(updatedAt) : new Date(),
        },
      });
    }
    console.log(\`✓ Order: \${snapshot.order.length} bản ghi\`);
  }

  // 16. Super Admin: trunglnm
  const existingSuperAdmin = await prisma.adminUser.findUnique({
    where: { username: 'trunglnm' },
  });

  if (!existingSuperAdmin) {
    await prisma.adminUser.create({
      data: {
        username: 'trunglnm',
        fullName: 'Lê Nguyễn Minh Trung',
        email: 'trunglnm@plusmoments.vn',
        passwordHash: snapshot.superAdminPasswordHash || '${superAdminPasswordHash}',
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    });
    console.log('✓ Default Super Admin (trunglnm) initialized');
  } else {
    await prisma.adminUser.update({
      where: { username: 'trunglnm' },
      data: {
        fullName: 'Lê Nguyễn Minh Trung',
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    });
    console.log('✓ Existing Super Admin (trunglnm) preserved (password untouched)');
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

  // 3. Generate CommonJS JavaScript Code for prisma/seed.js
  const jsSeedContent = `/**
 * AUTO-GENERATED DATABASE SEED SNAPSHOT (CommonJS)
 * Exported at: ${exportedAt}
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const snapshot = ${serializedSnapshot};

async function main() {
  console.log('--- KHỞI TẠO DỮ LIỆU GỐC TỪ SEED MOCKUP (JS) ---');
  console.log('Thời gian xuất snapshot:', snapshot.exportedAt);

  // 1. System Settings
  for (const item of ((snapshot.systemSetting || []) as any[])) {
    const { createdAt, updatedAt, ...data } = item as any;
    await prisma.systemSetting.upsert({
      where: { id: item.id },
      update: data,
      create: data,
    });
  }
  console.log(\`✓ SystemSetting: \${snapshot.systemSetting.length} bản ghi\`);

  // 2. Home Page Config
  for (const item of ((snapshot.homePageConfig || []) as any[])) {
    const { createdAt, updatedAt, ...data } = item as any;
    await prisma.homePageConfig.upsert({
      where: { id: item.id },
      update: data,
      create: data,
    });
  }
  console.log(\`✓ HomePageConfig: \${snapshot.homePageConfig.length} bản ghi\`);

  // 3. Notification Settings
  if (Array.isArray(snapshot.notificationSetting)) {
    for (const item of (snapshot.notificationSetting as any[])) {
      const { createdAt, updatedAt, ...data } = item as any;
      await prisma.notificationSetting.upsert({
        where: { id: item.id },
        update: data,
        create: data,
      });
    }
    console.log(\`✓ NotificationSetting: \${snapshot.notificationSetting.length} bản ghi\`);
  }

  // 4. Studio Locations
  if (Array.isArray(snapshot.studioLocation)) {
    for (const item of (snapshot.studioLocation as any[])) {
      const { createdAt, updatedAt, ...data } = item as any;
      await prisma.studioLocation.upsert({
        where: { id: item.id },
        update: data,
        create: data,
      });
    }
    console.log(\`✓ StudioLocation: \${snapshot.studioLocation.length} bản ghi\`);
  }

  // 5. Service Packages
  if (Array.isArray(snapshot.servicePackage)) {
    for (const item of (snapshot.servicePackage as any[])) {
      const { createdAt, updatedAt, albums, blogPosts, ...data } = item as any;
      await prisma.servicePackage.upsert({
        where: { id: item.id },
        update: data,
        create: data,
      });
    }
    console.log(\`✓ ServicePackage: \${snapshot.servicePackage.length} bản ghi\`);
  }

  // 6. Albums & Album Media
  if (Array.isArray(snapshot.album)) {
    for (const item of (snapshot.album as any[])) {
      const { createdAt, updatedAt, media, package: pkgRel, ...albumData } = item as any;
      await prisma.album.upsert({
        where: { id: item.id },
        update: albumData,
        create: albumData,
      });

      if (Array.isArray(media)) {
        for (const m of (media as any[])) {
          const { createdAt, updatedAt, ...mdata } = m as any;
          await prisma.albumMedia.upsert({
            where: { id: m.id },
            update: mdata,
            create: mdata,
          });
        }
      }
    }
    console.log(\`✓ Album: \${snapshot.album.length} bản ghi\`);
  }

  // 7. Blog Posts & Post Images
  if (Array.isArray(snapshot.blogPost)) {
    for (const item of (snapshot.blogPost as any[])) {
      const { createdAt, updatedAt, images, package: pkgRel, ...blogData } = item as any;
      await prisma.blogPost.upsert({
        where: { id: item.id },
        update: blogData,
        create: blogData,
      });

      if (Array.isArray(images)) {
        for (const img of (images as any[])) {
          const { createdAt, ...imgData } = img as any;
          await prisma.postImage.upsert({
            where: { id: img.id },
            update: imgData,
            create: imgData,
          });
        }
      }
    }
    console.log(\`✓ BlogPost: \${snapshot.blogPost.length} bản ghi\`);
  }

  // 8. Media Folders & Files
  if (Array.isArray(snapshot.mediaFolder)) {
    for (const item of (snapshot.mediaFolder as any[])) {
      const { createdAt, updatedAt, files, ...folderData } = item as any;
      await prisma.mediaFolder.upsert({
        where: { id: item.id },
        update: folderData,
        create: folderData,
      });

      if (Array.isArray(files)) {
        for (const f of (files as any[])) {
          const { createdAt, updatedAt, ...fileData } = f as any;
          await prisma.mediaFile.upsert({
            where: { id: f.id },
            update: fileData,
            create: fileData,
          });
        }
      }
    }
    console.log(\`✓ MediaFolder: \${snapshot.mediaFolder.length} bản ghi\`);
  }

  // 9. Root Media Files (folderId is null)
  if (Array.isArray(snapshot.mediaFile)) {
    for (const f of (snapshot.mediaFile as any[])) {
      const { createdAt, updatedAt, ...fileData } = f as any;
      await prisma.mediaFile.upsert({
        where: { id: f.id },
        update: fileData,
        create: fileData,
      });
    }
    console.log(\`✓ Root MediaFiles: \${snapshot.mediaFile.length} bản ghi\`);
  }

  // 10. Testimonials
  if (Array.isArray(snapshot.testimonial)) {
    for (const item of (snapshot.testimonial as any[])) {
      const { createdAt, updatedAt, ...testData } = item as any;
      await prisma.testimonial.upsert({
        where: { id: item.id },
        update: testData,
        create: testData,
      });
    }
    console.log(\`✓ Testimonial: \${snapshot.testimonial.length} bản ghi\`);
  }

  // 11. Album Concepts
  if (Array.isArray(snapshot.albumConcept)) {
    for (const item of (snapshot.albumConcept as any[])) {
      const { createdAt, ...data } = item as any;
      await prisma.albumConcept.upsert({
        where: { id: item.id },
        update: data,
        create: data,
      });
    }
    console.log(\`✓ AlbumConcept: \${snapshot.albumConcept.length} bản ghi\`);
  }

  // 12. Blog Categories
  if (Array.isArray(snapshot.blogCategory)) {
    for (const item of (snapshot.blogCategory as any[])) {
      const { createdAt, ...data } = item as any;
      await prisma.blogCategory.upsert({
        where: { id: item.id },
        update: data,
        create: data,
      });
    }
    console.log(\`✓ BlogCategory: \${snapshot.blogCategory.length} bản ghi\`);
  }

  // 13. Service Categories
  if (Array.isArray(snapshot.serviceCategory)) {
    for (const item of (snapshot.serviceCategory as any[])) {
      const { createdAt, ...data } = item as any;
      await prisma.serviceCategory.upsert({
        where: { id: item.id },
        update: data,
        create: data,
      });
    }
    console.log(\`✓ ServiceCategory: \${snapshot.serviceCategory.length} bản ghi\`);
  }

  // 14. Lead Bookings
  if (Array.isArray(snapshot.leadBooking)) {
    for (const item of (snapshot.leadBooking as any[])) {
      const { createdAt, updatedAt, ...data } = item as any;
      await prisma.leadBooking.upsert({
        where: { id: item.id },
        update: data,
        create: {
          ...data,
          createdAt: createdAt ? new Date(createdAt) : new Date(),
          updatedAt: updatedAt ? new Date(updatedAt) : new Date(),
        },
      });
    }
    console.log(\`✓ LeadBooking: \${snapshot.leadBooking.length} bản ghi\`);
  }

  // 15. Orders
  if (Array.isArray(snapshot.order)) {
    for (const item of (snapshot.order as any[])) {
      const { createdAt, updatedAt, paidAt, ...data } = item as any;
      await prisma.order.upsert({
        where: { id: item.id },
        update: {
          ...data,
          paidAt: paidAt ? new Date(paidAt) : null,
        },
        create: {
          ...data,
          paidAt: paidAt ? new Date(paidAt) : null,
          createdAt: createdAt ? new Date(createdAt) : new Date(),
          updatedAt: updatedAt ? new Date(updatedAt) : new Date(),
        },
      });
    }
    console.log(\`✓ Order: \${snapshot.order.length} bản ghi\`);
  }

  // 16. Super Admin: trunglnm
  const existingSuperAdmin = await prisma.adminUser.findUnique({
    where: { username: 'trunglnm' },
  });

  if (!existingSuperAdmin) {
    await prisma.adminUser.create({
      data: {
        username: 'trunglnm',
        fullName: 'Lê Nguyễn Minh Trung',
        email: 'trunglnm@plusmoments.vn',
        passwordHash: snapshot.superAdminPasswordHash || '${superAdminPasswordHash}',
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    });
    console.log('✓ Default Super Admin (trunglnm) initialized');
  } else {
    await prisma.adminUser.update({
      where: { username: 'trunglnm' },
      data: {
        fullName: 'Lê Nguyễn Minh Trung',
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    });
    console.log('✓ Existing Super Admin (trunglnm) preserved (password untouched)');
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

  // 4. Write directly to prisma/seed.ts and prisma/seed.js
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
