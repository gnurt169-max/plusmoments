import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getSystemSettings } from '@/lib/settings';
import { exportDatabaseToSeedFiles } from '@/lib/seed-exporter';
import { resolveGoogleMapsUrl } from '@/lib/maps-converter';

export const dynamic = 'force-dynamic';

function extractIframeSrc(input: string): string {
  if (!input) return '';
  const match = input.match(/src=["'](.*?)["']/);
  return match ? match[1] : input.trim();
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const existing = await getSystemSettings();

    const updateData: Record<string, any> = {};

    if (body.hotline !== undefined) {
      updateData.hotline = body.hotline.replace(/\s+/g, '');
    }
    if (body.hotlineDisplay !== undefined) {
      updateData.hotlineDisplay = body.hotlineDisplay;
    }
    if (body.zaloPhone !== undefined) {
      const cleanPhone = body.zaloPhone.replace(/\s+/g, '');
      updateData.zaloNumber = cleanPhone;
      if (!body.zaloUrl) {
        updateData.zaloUrl = `https://zalo.me/${cleanPhone}`;
      }
    }
    if (body.zaloUrl !== undefined) {
      updateData.zaloUrl = body.zaloUrl.startsWith('http')
        ? body.zaloUrl
        : `https://zalo.me/${body.zaloUrl.replace(/[^0-9]/g, '')}`;
    }
    if (body.messengerUrl !== undefined) {
      updateData.messengerUrl = body.messengerUrl;
    }
    if (body.promoText !== undefined) {
      updateData.promoText = body.promoText;
    }
    if (body.address !== undefined) {
      updateData.studioAddress = body.address;
      updateData.address = body.address;
      updateData.footerAddress = body.address;
    }
    if (body.email !== undefined) {
      updateData.email = body.email;
      updateData.contactEmail = body.email;
      updateData.footerEmail = body.email;
    }
    const mapsInput =
      body.googleMapsInput !== undefined
        ? body.googleMapsInput
        : body.googleMapsUrl !== undefined
        ? body.googleMapsUrl
        : body.googleMapsEmbedUrl;

    if (mapsInput !== undefined) {
      const fallbackAddr = body.address || existing.studioAddress || existing.address;
      const resolved = resolveGoogleMapsUrl(mapsInput, fallbackAddr);
      updateData.googleMapsUrl = (body.googleMapsUrl || mapsInput || '').trim();
      updateData.googleMapsEmbedUrl = resolved.embedUrl;
      updateData.googleMapsShareUrl = resolved.shareUrl;
    } else {
      if (body.googleMapsEmbedUrl !== undefined) {
        updateData.googleMapsEmbedUrl = extractIframeSrc(body.googleMapsEmbedUrl);
      }
      if (body.googleMapsShareUrl !== undefined) {
        updateData.googleMapsShareUrl = (body.googleMapsShareUrl || '').trim();
      }
    }

    const updated = await prisma.systemSetting.upsert({
      where: { id: 'default' },
      update: updateData,
      create: {
        id: 'default',
        ...updateData,
      },
    });

    // Revalidate all pages to purge stale cached contact data across the entire site
    revalidateTag('settings');
    revalidatePath('/', 'layout');

    // Auto-sync snapshot to prisma/seed.ts
    try {
      await exportDatabaseToSeedFiles();
    } catch (seedErr) {
      console.warn('Seed export warning:', seedErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Cập nhật thông tin liên hệ và làm mới cache thành công!',
      contact: {
        hotline: updated.hotline || '',
        hotlineDisplay: updated.hotlineDisplay || '',
        zaloPhone: updated.zaloNumber || '',
        zaloUrl: updated.zaloUrl || '',
        messengerUrl: updated.messengerUrl || '',
        promoText: updated.promoText || '',
        address: updated.studioAddress || '',
        email: updated.email || '',
      },
    });
  } catch (error: any) {
    console.error('Failed to update contact settings:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi lưu thông tin liên hệ.' },
      { status: 500 }
    );
  }
}
