import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getSystemSettings } from '@/lib/settings';
import { parseGoogleDriveFolderId } from '@/lib/drive';
import { exportDatabaseToSeedFiles } from '@/lib/seed-exporter';
import { syncBankSettingsToSeeds } from '@/lib/seed-sync';
import { getAdminSession, assertRole } from '@/lib/auth';
import { AdminRole } from '@prisma/client';
import { resolveGoogleMapsUrl } from '@/lib/maps-converter';

export const dynamic = 'force-dynamic';

function extractIframeSrc(input: string): string {
  if (!input) return '';
  const match = input.match(/src=["'](.*?)["']/);
  return match ? match[1] : input.trim();
}

export async function GET() {
  try {
    const session = await getAdminSession();
    const authCheck = assertRole(session, [AdminRole.ADMIN, AdminRole.SUPER_ADMIN]);
    if (!authCheck.authorized) return authCheck.response;

    const raw = await getSystemSettings();
    const settings: Record<string, any> = {};
    for (const [key, val] of Object.entries(raw)) {
      settings[key] = val === null || val === undefined ? '' : val;
    }

    // RBAC: If ADMIN, hide sensitive API Keys & Maintenance data
    if (authCheck.session.role === AdminRole.ADMIN) {
      if (settings.geminiApiKey) settings.geminiApiKey = '••••••••••••••••';
      if (settings.googleDriveApiKey) settings.googleDriveApiKey = '••••••••••••••••';
    }

    return NextResponse.json({ success: true, settings, currentUserRole: authCheck.session.role });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi tải cấu hình hệ thống.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getAdminSession();
    const authCheck = assertRole(session, [AdminRole.ADMIN, AdminRole.SUPER_ADMIN]);
    if (!authCheck.authorized) return authCheck.response;

    const body = await request.json();

    // Partial update defense: Only update fields that are explicitly provided in the request
    const updateData: Record<string, any> = {};
    const allowedFields = [
      'siteName',
      'tagline',
      'defaultMetaTitle',
      'defaultMetaDescription',
      'defaultOgImage',
      'canonicalBaseUrl',
      'isMaintenanceMode',
      'maintenanceNotice',
      'gtmId',
      'googleTagManagerId',
      'googleAdsId',
      'googleAnalyticsId',
      'googleAdsConversionLabel',
      'googleAdsLeadLabel',
      'googleAdsPurchaseLabel',
      'googleAdsPhoneConversionLabel',
      'googleAdsZaloConversionLabel',
      'googleAdsMessengerConversionLabel',
      'googleAdsConversionValue',
      'googleAdsEnhancedConversions',
      'metaPixelId',
      'tiktokPixelId',
      'customHeadScript',
      'customBodyScript',
      'redirectOnSubmit',
      'thankYouPageUrl',
      'thankYouTitle',
      'thankYouMessage',
      'thankYouVoucherCode',
      'landingPageEnabled',
      'landingPageTitle',
      'landingPageSubtitle',
      'landingPageBannerImage',
      'landingPageSlotsRemaining',
      'landingPageDiscountAmount',
      'landingPageDeadline',
      'hotline',
      'hotlineDisplay',
      'zaloNumber',
      'zaloUrl',
      'messengerUrl',
      'promoText',
      'email',
      'studioAddress',
      'googleMapsUrl',
      'googleMapsEmbedUrl',
      'googleMapsShareUrl',
      'openingHours',
      'facebookUrl',
      'instagramUrl',
      'tiktokUrl',
      'youtubeUrl',
      'driveFolderUrl',
      'driveFolderId',
      'googleDriveApiKey',
      'geminiApiKey',
      'geminiModel',
      'geminiTemperature',
      'geminiTone',
      'bankBin',
      'bankShortName',
      'bankAccountNumber',
      'bankAccountName',
      'paymentWebhookKey',
      'smtpEnabled',
      'smtpHost',
      'smtpPort',
      'smtpSecure',
      'smtpUser',
      'smtpPass',
      'emailFrom',
      'adminNotifyEmail',
      'logoType',
      'brandName',
      'brandSlogan',
      'brandBio',
      'address',
      'contactEmail',
      'workingHours',
      'copyrightText',
      'brandNamePart1',
      'brandNamePart2',
      'brandSubtitle',
      'logoLightUrl',
      'logoDarkUrl',
      'footerAboutText',
      'footerNavCol1Title',
      'footerNavCol1Links',
      'footerNavCol2Title',
      'footerNavCol2Links',
      'footerAddress',
      'footerHotline',
      'footerEmail',
      'footerWorkingHours',
      'footerCopyrightText',
      'footerPolicyLinks',
      'zaloUrl',
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Strictly parse and sanitize folder ID from driveFolderUrl or driveFolderId
    if (body.driveFolderUrl) {
      const parsed = parseGoogleDriveFolderId(body.driveFolderUrl);
      if (parsed) {
        updateData.driveFolderId = parsed;
      }
    } else if (body.driveFolderId) {
      const parsed = parseGoogleDriveFolderId(body.driveFolderId);
      if (parsed) {
        updateData.driveFolderId = parsed;
      } else if (body.driveFolderId.startsWith('AIzaSy')) {
        // If an API key was erroneously sent in driveFolderId, remove it from driveFolderId and move to googleDriveApiKey
        updateData.googleDriveApiKey = body.driveFolderId;
        delete updateData.driveFolderId;
      }
    }

    if (updateData.googleAdsConversionValue !== undefined) {
      updateData.googleAdsConversionValue = Number(updateData.googleAdsConversionValue) || 0;
    }

    const mapsInput =
      body.googleMapsInput !== undefined
        ? body.googleMapsInput
        : body.googleMapsUrl !== undefined
        ? body.googleMapsUrl
        : body.googleMapsEmbedUrl;

    if (mapsInput !== undefined) {
      const fallbackAddr = body.studioAddress || body.address || body.footerAddress;
      const resolved = resolveGoogleMapsUrl(mapsInput, fallbackAddr);
      updateData.googleMapsUrl = (body.googleMapsUrl || mapsInput || '').trim();
      updateData.googleMapsEmbedUrl = resolved.embedUrl;
      updateData.googleMapsShareUrl = resolved.shareUrl;
    } else if (body.googleMapsShareUrl !== undefined) {
      updateData.googleMapsShareUrl = (body.googleMapsShareUrl || '').trim();
    }
    if (updateData.landingPageSlotsRemaining !== undefined) {
      updateData.landingPageSlotsRemaining = Number(updateData.landingPageSlotsRemaining) || 0;
    }
    if (updateData.googleAdsEnhancedConversions !== undefined) {
      updateData.googleAdsEnhancedConversions = Boolean(updateData.googleAdsEnhancedConversions);
    }
    if (body.googleAdsLeadLabel !== undefined && !body.googleAdsConversionLabel) {
      updateData.googleAdsConversionLabel = body.googleAdsLeadLabel;
    } else if (body.googleAdsConversionLabel !== undefined && !body.googleAdsLeadLabel) {
      updateData.googleAdsLeadLabel = body.googleAdsConversionLabel;
    }
    if (body.googleTagManagerId !== undefined && !body.gtmId) {
      updateData.gtmId = body.googleTagManagerId;
    } else if (body.gtmId !== undefined && !body.googleTagManagerId) {
      updateData.googleTagManagerId = body.gtmId;
    }
    if (updateData.redirectOnSubmit !== undefined) {
      updateData.redirectOnSubmit = Boolean(updateData.redirectOnSubmit);
    }
    if (updateData.isMaintenanceMode !== undefined) {
      updateData.isMaintenanceMode = Boolean(updateData.isMaintenanceMode);
    }
    if (updateData.landingPageEnabled !== undefined) {
      updateData.landingPageEnabled = Boolean(updateData.landingPageEnabled);
    }
    if (updateData.smtpPort !== undefined) {
      updateData.smtpPort = Number(updateData.smtpPort) || 465;
    }
    if (updateData.smtpEnabled !== undefined) {
      updateData.smtpEnabled = Boolean(updateData.smtpEnabled);
    }
    if (updateData.smtpSecure !== undefined) {
      updateData.smtpSecure = Boolean(updateData.smtpSecure);
    }

    // RBAC: Strip sensitive SUPER_ADMIN-only configuration if caller is not SUPER_ADMIN
    const superAdminOnlyFields = [
      'geminiApiKey',
      'geminiModel',
      'geminiTemperature',
      'geminiTone',
      'googleDriveApiKey',
      'isMaintenanceMode',
      'maintenanceNotice',
    ];

    if (authCheck.session.role !== AdminRole.SUPER_ADMIN) {
      for (const field of superAdminOnlyFields) {
        delete updateData[field];
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

    // Invalidate cached server components and pages
    revalidatePath('/', 'layout');
    revalidatePath('/bo-suu-tap', 'page');
    revalidatePath('/bang-gia', 'page');

    // Check if bank fields, footer updates, or snapshotSeed is provided
    const hasBankUpdates =
      body.bankBin !== undefined ||
      body.bankAccountNumber !== undefined ||
      body.bankShortName !== undefined ||
      body.bankAccountName !== undefined ||
      body.paymentWebhookKey !== undefined;

    const hasFooterUpdates =
      body.brandName !== undefined ||
      body.brandBio !== undefined ||
      body.brandSlogan !== undefined ||
      body.address !== undefined ||
      body.contactEmail !== undefined ||
      body.workingHours !== undefined ||
      body.copyrightText !== undefined ||
      body.footerAboutText !== undefined ||
      body.footerAddress !== undefined ||
      body.footerHotline !== undefined ||
      body.footerEmail !== undefined ||
      body.footerWorkingHours !== undefined ||
      body.footerCopyrightText !== undefined ||
      body.googleMapsUrl !== undefined ||
      body.googleMapsInput !== undefined ||
      body.googleMapsEmbedUrl !== undefined ||
      body.googleMapsShareUrl !== undefined ||
      body.facebookUrl !== undefined ||
      body.instagramUrl !== undefined ||
      body.youtubeUrl !== undefined ||
      body.tiktokUrl !== undefined ||
      body.zaloUrl !== undefined;

    let seedExported = false;
    if (body.snapshotSeed || hasBankUpdates || hasFooterUpdates || body.geminiApiKey !== undefined || body.geminiModel !== undefined) {
      try {
        if (hasBankUpdates && !hasFooterUpdates && !body.snapshotSeed) {
          await syncBankSettingsToSeeds({
            bankBin: updated.bankBin || body.bankBin || '',
            bankShortName: updated.bankShortName || body.bankShortName || '',
            bankAccountNumber: updated.bankAccountNumber || body.bankAccountNumber || '',
            bankAccountName: updated.bankAccountName || body.bankAccountName || '',
            paymentWebhookKey: updated.paymentWebhookKey || body.paymentWebhookKey || '',
          });
          seedExported = true;
        } else {
          await exportDatabaseToSeedFiles();
          seedExported = true;
        }
      } catch (seedErr) {
        console.warn('Seed export warning:', seedErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: hasBankUpdates
        ? 'Đã lưu cài đặt ngân hàng và đồng bộ thành công vào dữ liệu gốc (Seed Mockup)!'
        : seedExported
        ? 'Cập nhật cài đặt và đã đồng bộ vào snapshot seed code thành công!'
        : 'Cập nhật cài đặt thành công!',
      settings: updated,
      seedExported,
    });
  } catch (error: any) {
    console.error('Failed to update system settings:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
