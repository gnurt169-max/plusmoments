import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [
      rawSettings,
      albums,
      albumImages,
      packages,
      blogs,
      leads,
      orders,
      media,
      mediaFolders,
      homePageConfig,
      locations,
      testimonials,
      pricingFaqs,
      albumConcepts,
      blogCategories,
      serviceCategories,
    ] = await Promise.all([
      prisma.systemSetting.findMany(),
      prisma.album.findMany({
        orderBy: [{ orderIndex: 'asc' }, { createdAt: 'desc' }],
        include: { media: { orderBy: { orderIndex: 'asc' } } },
      }),
      prisma.albumMedia.findMany({
        orderBy: [{ albumId: 'asc' }, { orderIndex: 'asc' }],
      }),
      prisma.servicePackage.findMany({
        orderBy: [{ orderIndex: 'asc' }, { createdAt: 'desc' }],
      }),
      prisma.blogPost.findMany({
        orderBy: { publishedAt: 'desc' },
        include: { images: { orderBy: { orderIndex: 'asc' } } },
      }),
      prisma.leadBooking.findMany({
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
      }),
      prisma.mediaFile.findMany({
        orderBy: { createdAt: 'desc' },
      }),
      prisma.mediaFolder.findMany({
        orderBy: { createdAt: 'desc' },
      }),
      prisma.homePageConfig.findMany(),
      prisma.studioLocation.findMany({
        orderBy: { orderIndex: 'asc' },
      }),
      prisma.testimonial.findMany({
        orderBy: [{ orderIndex: 'asc' }, { createdAt: 'desc' }],
      }),
      prisma.pricingFaq.findMany({
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      }),
      prisma.albumConcept.findMany({ orderBy: { order: 'asc' } }),
      prisma.blogCategory.findMany({ orderBy: { order: 'asc' } }),
      prisma.serviceCategory.findMany({ orderBy: { order: 'asc' } }),
    ]);

    // Sanitize sensitive credentials from SystemSetting records in exported backup
    const settings = rawSettings.map((s) => ({
      ...s,
      smtpPass: '',
      paymentWebhookKey: '',
      googleDriveApiKey: '',
      geminiApiKey: '',
    }));

    const backupPayload = {
      exportedAt: new Date().toISOString(),
      site: 'plusmoments.vn',
      version: '1.0',
      data: {
        settings,
        albums,
        albumImages,
        packages,
        blogs,
        leads,
        orders,
        media,
        mediaFolders,
        homePageConfig,
        locations,
        testimonials,
        pricingFaqs,
        taxonomies: {
          albumConcepts,
          blogCategories,
          serviceCategories,
        },
      },
    };

    const dateStamp = new Date().toISOString().slice(0, 10);
    const filename = `plusmoments-backup-${dateStamp}.json`;

    return new NextResponse(JSON.stringify(backupPayload, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('[DATABASE_BACKUP_ERROR]:', error);
    return NextResponse.json(
      { error: error.message || 'Lỗi khi tạo bản sao lưu dữ liệu.' },
      { status: 500 }
    );
  }
}

