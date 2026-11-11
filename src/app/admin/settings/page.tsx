'use client';

import React, { useState, useEffect } from 'react';
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Code2,
  Globe,
  PhoneCall,
  Sparkles,
  RefreshCw,
  Eye,
  HardDrive,
  ExternalLink,
  MessageCircle,
  Search,
  PanelBottom,
  Plus,
  Trash2,
  Link2,
  Database,
  PackageCheck,
  FileCode2,
  Terminal,
  Bot,
  EyeOff,
  Sliders,
  Target,
  Gift,
  Compass,
  Wrench,
  ShieldAlert,
  Lock,
  CreditCard,
  Mail,
  MapPin,
  Copy,
  Check,
  Palette,
  Type,
  RotateCcw,
} from 'lucide-react';
import Link from 'next/link';
import { BrandLogo } from '@/components/common/BrandLogo';
import { SingleImagePicker } from '@/components/admin/ImageFieldPicker';
import { EmailSettingsCard } from '@/components/admin/EmailSettingsCard';
import { BankSettingsCard } from '@/components/admin/BankSettingsCard';
import { resolveGoogleMapsUrl } from '@/lib/maps-converter';

const GOOGLE_FONTS_LIST = [
  { value: 'Playfair Display', label: 'Playfair Display (Hoàng Gia Cổ Điển - Mặc Định)' },
  { value: 'Cormorant Garamond', label: 'Cormorant Garamond (Thanh Thoát Quý Tộc)' },
  { value: 'Cinzel', label: 'Cinzel (La Mã Tinh Tế - Roman Inscriptional)' },
  { value: 'Cinzel Decorative', label: 'Cinzel Decorative (Nghệ Thuật Đậm Chất Quý Phái)' },
  { value: 'Montserrat', label: 'Montserrat (Hiện Đại & Tối Giản)' },
  { value: 'Prata', label: 'Prata (Sang Trọng & Tinh Gọn)' },
  { value: 'Bodoni Moda', label: 'Bodoni Moda (Vogue Editorial Thời Thượng)' },
];

const FONT_WEIGHT_LIST = [
  { value: '300', label: '300 (Light - Mảnh Mai)' },
  { value: '400', label: '400 (Regular - Tiêu Chuẩn)' },
  { value: '500', label: '500 (Medium - Vừa Phải)' },
  { value: '600', label: '600 (SemiBold - Khuyên Dùng)' },
  { value: '700', label: '700 (Bold - Đậm Đẳng Cấp)' },
];

const LETTER_SPACING_LIST = [
  { value: '0.05em', label: '0.05em (Gọn Gàng)' },
  { value: '0.1em', label: '0.1em (Vừa Phải)' },
  { value: '0.15em', label: '0.15em (Chuẩn Luxury Editorial)' },
  { value: '0.2em', label: '0.2em (Rộng Nghệ Thuật)' },
  { value: '0.25em', label: '0.25em (Rất Rộng Đẳng Cấp)' },
];

export interface FooterLinkItem {
  label: string;
  url: string;
}

const DEFAULT_COL1_LINKS: FooterLinkItem[] = [
  { label: 'Ảnh Cưới Ngoại Cảnh Đà Lạt', url: '/bo-suu-tap?concept=Outdoor+Luxury' },
  { label: 'Concept Studio Phong Cách Hàn Quốc', url: '/bo-suu-tap?concept=Studio+Editorial' },
  { label: 'Pre-Wedding Biển Hoàng Hôn Phú Quốc', url: '/bo-suu-tap?concept=Pre-Wedding+Cinematic' },
  { label: 'Phóng Sự Cưới Trọn Gói Ngày Cưới', url: '/bo-suu-tap?concept=Phóng+Sự+Cưới' },
  { label: 'Xem tất cả bộ sưu tập →', url: '/bo-suu-tap' },
];

const DEFAULT_COL2_LINKS: FooterLinkItem[] = [
  { label: 'Gói Chụp Pre-Wedding Trọn Gói', url: '/pricing' },
  { label: 'Gói Studio Editorial Minimalist', url: '/pricing' },
  { label: 'Gói Phóng Sự Cưới Lễ & Tiệc', url: '/pricing' },
  { label: 'Kinh Nghiệm Chuẩn Bị Cưới', url: '/blog' },
  { label: 'Lịch Hẹn Thử Váy Cưới Miễn Phí', url: '/contact' },
];

const DEFAULT_POLICY_LINKS: FooterLinkItem[] = [
  { label: 'Chính Sách Bảo Mật', url: '/contact' },
  { label: 'Quy Trình & Hợp Đồng', url: '/pricing' },
];

const parseLinkJson = (data: any, fallback: FooterLinkItem[]): FooterLinkItem[] => {
  if (!data) return fallback;
  if (Array.isArray(data)) return data.length > 0 ? data : fallback;
  try {
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback;
  } catch {
    return fallback;
  }
};

function extractIframeSrc(input: string): string {
  if (!input) return '';
  const match = input.match(/src=["'](.*?)["']/);
  return match ? match[1] : input.trim();
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingContact, setSavingContact] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'branding' | 'footer' | 'contact' | 'seo' | 'tracking' | 'drive' | 'payment' | 'gemini' | 'email' | 'system'>('branding');
  const [exportingSeed, setExportingSeed] = useState(false);
  const [seedExportSuccess, setSeedExportSuccess] = useState<string | null>(null);
  const [testingDrive, setTestingDrive] = useState(false);
  const [driveTestResult, setDriveTestResult] = useState<{
    success: boolean;
    count?: number;
    warning?: string;
    error?: string;
  } | null>(null);

  // Gemini AI Assistant State
  const [syncingModels, setSyncingModels] = useState(false);
  const [availableGeminiModels, setAvailableGeminiModels] = useState<
    Array<{ id: string; displayName: string; description: string }>
  >([]);
  const [modelsSyncError, setModelsSyncError] = useState('');
  const [modelsSyncSuccess, setModelsSyncSuccess] = useState<string | null>(null);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [testingGemini, setTestingGemini] = useState(false);
  const [geminiTestResult, setGeminiTestResult] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    // Brand Identity & Dynamic Logo
    logoType: 'TEXT',
    brandNamePart1: 'PLUS',
    brandNamePart2: 'MOMENTS',
    brandSubtitle: 'LUXURY WEDDING STUDIO',
    logoLightUrl: '',
    logoDarkUrl: '',

    // Typography Logo & Customizer
    logoTextPrimary: 'PLUS MOMENTS',
    logoTextSecondary: 'LUXURY WEDDING STUDIO',
    logoFontFamily: 'Playfair Display',
    logoFontSize: 24,
    logoFontWeight: '600',
    logoLetterSpacing: '0.15em',
    logoColorLight: '#1A1614',
    logoColorDark: '#F5F2EB',
    logoAccentColor: '#C5A880',

    // Theme Colors
    themePrimaryColor: '#C5A880',
    themeBgColor: '#FAF8F5',
    themeTextColor: '#1C1917',

    // SEO Globals
    siteName: '',
    tagline: '',
    defaultMetaTitle: '',
    defaultMetaDescription: '',
    defaultOgImage: '',
    canonicalBaseUrl: '',

    // Ads Tracking
    gtmId: '',
    googleTagManagerId: '',
    googleAdsId: '',
    googleAnalyticsId: '',
    googleAdsConversionLabel: '',
    googleAdsLeadLabel: '',
    googleAdsPurchaseLabel: '',
    googleAdsPhoneConversionLabel: '',
    googleAdsZaloConversionLabel: '',
    googleAdsMessengerConversionLabel: '',
    googleAdsConversionValue: 500000,
    googleAdsEnhancedConversions: true,
    metaPixelId: '',
    tiktokPixelId: '',
    customHeadScript: '',
    customBodyScript: '',

    // Thank You Page (Trang Đích Đo Lường Chuyển Đổi Sau Gửi Form)
    redirectOnSubmit: true,
    thankYouPageUrl: '/cam-on',
    thankYouTitle: 'Đặt Lịch Tư Vấn Thành Công!',
    thankYouMessage:
      'Cảm ơn bạn đã tin tưởng PlusMoments. Ekip tư vấn sẽ liên hệ lại trong vòng 15 phút để gửi bảng báo giá chi tiết và bảo lưu ưu đãi 2.000.000đ.',
    thankYouVoucherCode: 'PLUSMOMENTS-2TR',

    // Google Ads Promotional Landing Page (/uu-dai)
    landingPageEnabled: true,
    landingPageTitle: 'Ưu Đãi Mùa Cưới 2025 - Tặng Gói Make-Up & Xe Rước Dâu',
    landingPageSubtitle:
      'Đặc quyền dành riêng cho cặp đôi đăng ký trực tuyến hôm nay: Nhận ngay Voucher 2.000.000đ trừ trực tiếp vào gói chụp Pre-Wedding Luxury.',
    landingPageBannerImage: '',
    landingPageSlotsRemaining: 5,
    landingPageDiscountAmount: '2.000.000đ',
    landingPageDeadline: 'Áp dụng cho 10 cặp đôi đầu tiên trong tuần này',

    // Studio Contact & High-Intent Conversion
    hotline: '',
    hotlineDisplay: '',
    zaloNumber: '',
    zaloUrl: '',
    messengerUrl: '',
    promoText: 'Nhận Báo Giá Ưu Đãi 2Tr',
    email: '',
    studioAddress: '',
    openingHours: '',
    googleMapsUrl: '',
    googleMapsEmbedUrl: '',
    googleMapsShareUrl: '',

    // Brand & Footer Identity
    brandName: 'PLUS MOMENTS',
    brandSlogan: 'LUXURY WEDDING STUDIO',
    brandBio:
      'Chúng tôi ghi lại những rung cảm tinh khôi và chân thành nhất trong tình yêu của bạn bằng ngôn ngữ ánh sáng điện ảnh.',
    address: '31 Hùng Vương, Phường An Đông',
    contactEmail: 'contact@plusmoments.vn',
    workingHours: '09:00 - 21:00 (Thứ 2 - Chủ Nhật)',
    copyrightText: '© 2026 PlusMoments Wedding Studio. All rights reserved.',

    // Footer CMS Configuration
    footerAboutText:
      'Chúng tôi không chỉ chụp ảnh cưới, chúng tôi ghi lại những rung cảm tinh khôi và chân thành nhất trong tình yêu của bạn bằng ngôn ngữ ánh sáng điện ảnh.',
    footerNavCol1Title: 'BỘ SƯU TẬP CƯỚI',
    footerNavCol1Links: DEFAULT_COL1_LINKS,
    footerNavCol2Title: 'BẢNG GIÁ & DỊCH VỤ',
    footerNavCol2Links: DEFAULT_COL2_LINKS,
    footerAddress: '31 Hùng Vương, Phường An Đông',
    footerHotline: '0903.768.871',
    footerEmail: 'contact@plusmoments.vn',
    footerWorkingHours: '09:00 - 21:00 (Thứ 2 - Chủ Nhật)',
    footerCopyrightText: '© 2026 PlusMoments Wedding Studio. All rights reserved.',
    footerPolicyLinks: DEFAULT_POLICY_LINKS,

    facebookUrl: 'https://facebook.com/plusmoments.vn',
    instagramUrl: 'https://instagram.com/plusmoments.vn',
    tiktokUrl: 'https://tiktok.com/@plusmoments.vn',
    youtubeUrl: 'https://youtube.com/@plusmoments.vn',

    // Google Drive Media Integration
    driveFolderUrl: '',
    driveFolderId: '',
    googleDriveApiKey: '',

    // Google Gemini AI Assistant Integration
    geminiApiKey: '',
    geminiModel: 'gemini-2.5-flash',
    geminiTemperature: 0.7,
    geminiTone: 'LUXURY_CINEMATIC',

    // Maintenance Mode (Super Admin Only)
    isMaintenanceMode: false,
    maintenanceNotice: 'PlusMoments đang tiến hành nâng cấp hệ thống định kỳ. Chúng tôi sẽ trở lại trong ít phút.',
  });

  const [currentUserRole, setCurrentUserRole] = useState<string>('ADMIN');

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam && ['branding', 'footer', 'contact', 'seo', 'tracking', 'drive', 'payment', 'gemini', 'email', 'system'].includes(tabParam)) {
        setActiveTab(tabParam as any);
      }
    }
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        setErrorMessage('');
        const res = await fetch('/api/admin/settings');
        const data = await res.json();

        if (data.success && data.settings) {
          const s = data.settings;
          setFormData({
            logoType: s.logoType || 'TEXT',
            brandNamePart1: s.brandNamePart1 || 'PLUS',
            brandNamePart2: s.brandNamePart2 || 'MOMENTS',
            brandSubtitle: s.brandSubtitle || 'LUXURY WEDDING STUDIO',
            logoLightUrl: s.logoLightUrl || '',
            logoDarkUrl: s.logoDarkUrl || '',

            // Typography Logo & Customizer
            logoTextPrimary: s.logoTextPrimary || 'PLUS MOMENTS',
            logoTextSecondary: s.logoTextSecondary || 'LUXURY WEDDING STUDIO',
            logoFontFamily: s.logoFontFamily || 'Playfair Display',
            logoFontSize: s.logoFontSize ?? 24,
            logoFontWeight: s.logoFontWeight || '600',
            logoLetterSpacing: s.logoLetterSpacing || '0.15em',
            logoColorLight: s.logoColorLight || '#1A1614',
            logoColorDark: s.logoColorDark || '#F5F2EB',
            logoAccentColor: s.logoAccentColor || '#C5A880',

            // Theme Colors
            themePrimaryColor: s.themePrimaryColor || '#C5A880',
            themeBgColor: s.themeBgColor || '#FAF8F5',
            themeTextColor: s.themeTextColor || '#1C1917',

            siteName: s.siteName || '',
            tagline: s.tagline || '',
            defaultMetaTitle: s.defaultMetaTitle || '',
            defaultMetaDescription: s.defaultMetaDescription || '',
            defaultOgImage: s.defaultOgImage || '',
            canonicalBaseUrl: s.canonicalBaseUrl || '',

            gtmId: s.gtmId || s.googleTagManagerId || '',
            googleTagManagerId: s.googleTagManagerId || s.gtmId || '',
            googleAdsId: s.googleAdsId || '',
            googleAnalyticsId: s.googleAnalyticsId || '',
            googleAdsConversionLabel: s.googleAdsConversionLabel || s.googleAdsLeadLabel || '',
            googleAdsLeadLabel: s.googleAdsLeadLabel || s.googleAdsConversionLabel || '',
            googleAdsPurchaseLabel: s.googleAdsPurchaseLabel || '',
            googleAdsPhoneConversionLabel: s.googleAdsPhoneConversionLabel || '',
            googleAdsZaloConversionLabel: s.googleAdsZaloConversionLabel || '',
            googleAdsMessengerConversionLabel: s.googleAdsMessengerConversionLabel || '',
            googleAdsConversionValue: s.googleAdsConversionValue || 500000,
            googleAdsEnhancedConversions: s.googleAdsEnhancedConversions !== false,
            metaPixelId: s.metaPixelId || '',
            tiktokPixelId: s.tiktokPixelId || '',
            customHeadScript: s.customHeadScript || '',
            customBodyScript: s.customBodyScript || '',

            redirectOnSubmit: s.redirectOnSubmit !== false,
            thankYouPageUrl: s.thankYouPageUrl || '/cam-on',
            thankYouTitle: s.thankYouTitle || 'Đặt Lịch Tư Vấn Thành Công!',
            thankYouMessage:
              s.thankYouMessage ||
              'Cảm ơn bạn đã tin tưởng PlusMoments. Ekip tư vấn sẽ liên hệ lại trong vòng 15 phút để gửi bảng báo giá chi tiết và bảo lưu ưu đãi 2.000.000đ.',
            thankYouVoucherCode: s.thankYouVoucherCode || 'PLUSMOMENTS-2TR',

            landingPageEnabled: s.landingPageEnabled !== false,
            landingPageTitle:
              s.landingPageTitle || 'Ưu Đãi Mùa Cưới 2025 - Tặng Gói Make-Up & Xe Rước Dâu',
            landingPageSubtitle:
              s.landingPageSubtitle ||
              'Đặc quyền dành riêng cho cặp đôi đăng ký trực tuyến hôm nay: Nhận ngay Voucher 2.000.000đ trừ trực tiếp vào gói chụp Pre-Wedding Luxury.',
            landingPageBannerImage: s.landingPageBannerImage || '',
            landingPageSlotsRemaining: s.landingPageSlotsRemaining || 5,
            landingPageDiscountAmount: s.landingPageDiscountAmount || '2.000.000đ',
            landingPageDeadline:
              s.landingPageDeadline || 'Áp dụng cho 10 cặp đôi đầu tiên trong tuần này',

            hotline: s.hotline || '',
            hotlineDisplay: s.hotlineDisplay || '',
            zaloNumber: s.zaloNumber || '',
            zaloUrl: s.zaloUrl || '',
            messengerUrl: s.messengerUrl || '',
            promoText: s.promoText || 'Nhận Báo Giá Ưu Đãi 2Tr',
            email: s.email || '',
            studioAddress: s.studioAddress || '',
            openingHours: s.openingHours || '',
            googleMapsUrl: s.googleMapsUrl || s.googleMapsShareUrl || s.googleMapsEmbedUrl || '',
            googleMapsEmbedUrl: s.googleMapsEmbedUrl || '',
            googleMapsShareUrl: s.googleMapsShareUrl || s.googleMapsUrl || '',

            brandName: s.brandName || `${s.brandNamePart1 || 'PLUS'} ${s.brandNamePart2 || 'MOMENTS'}`.trim(),
            brandSlogan: s.brandSlogan || s.brandSubtitle || 'LUXURY WEDDING STUDIO',
            brandBio:
              s.brandBio ||
              s.footerAboutText ||
              'Chúng tôi ghi lại những rung cảm tinh khôi và chân thành nhất trong tình yêu của bạn bằng ngôn ngữ ánh sáng điện ảnh.',
            address: s.address || s.footerAddress || s.studioAddress || '',
            contactEmail: s.contactEmail || s.footerEmail || s.email || '',
            workingHours: s.workingHours || s.footerWorkingHours || s.openingHours || '',
            copyrightText: s.copyrightText || s.footerCopyrightText || '© 2026 PlusMoments Wedding Studio. All rights reserved.',

            footerAboutText:
              s.footerAboutText ||
              s.brandBio ||
              'Chúng tôi không chỉ chụp ảnh cưới, chúng tôi ghi lại những rung cảm tinh khôi và chân thành nhất trong tình yêu của bạn bằng ngôn ngữ ánh sáng điện ảnh.',
            footerNavCol1Title: s.footerNavCol1Title || 'BỘ SƯU TẬP CƯỚI',
            footerNavCol1Links: parseLinkJson(s.footerNavCol1Links, DEFAULT_COL1_LINKS),
            footerNavCol2Title: s.footerNavCol2Title || 'BẢNG GIÁ & DỊCH VỤ',
            footerNavCol2Links: parseLinkJson(s.footerNavCol2Links, DEFAULT_COL2_LINKS),
            footerAddress: s.footerAddress || s.address || s.studioAddress || '',
            footerHotline: s.footerHotline || s.hotlineDisplay || s.hotline || '',
            footerEmail: s.footerEmail || s.contactEmail || s.email || '',
            footerWorkingHours: s.footerWorkingHours || s.workingHours || s.openingHours || '',
            footerCopyrightText: s.footerCopyrightText || s.copyrightText || '© 2026 PlusMoments Wedding Studio. All rights reserved.',
            footerPolicyLinks: parseLinkJson(s.footerPolicyLinks, DEFAULT_POLICY_LINKS),

            facebookUrl: s.facebookUrl || '',
            instagramUrl: s.instagramUrl || '',
            tiktokUrl: s.tiktokUrl || '',
            youtubeUrl: s.youtubeUrl || '',

            driveFolderUrl: s.driveFolderUrl || '',
            driveFolderId: s.driveFolderId || '',
            googleDriveApiKey: s.googleDriveApiKey || '',

            geminiApiKey: s.geminiApiKey || '',
            geminiModel: s.geminiModel || 'gemini-2.5-flash',
            geminiTemperature: s.geminiTemperature !== undefined ? Number(s.geminiTemperature) : 0.7,
            geminiTone: s.geminiTone || 'LUXURY_CINEMATIC',

            isMaintenanceMode: Boolean(s.isMaintenanceMode),
            maintenanceNotice:
              s.maintenanceNotice ||
              'PlusMoments đang tiến hành nâng cấp hệ thống định kỳ. Chúng tôi sẽ trở lại trong ít phút.',
          });
        } else {
          setErrorMessage(data.error || 'Không thể đọc cấu hình.');
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Lỗi khi kết nối máy chủ.');
      } finally {
        setLoading(false);
      }
    };

    const fetchSession = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data?.user?.role) {
            setCurrentUserRole(data.user.role);
          }
        }
      } catch {}
    };

    fetchSettings();
    fetchSession();
  }, []);

  const handleAddFooterLink = (col: 'col1' | 'col2' | 'policy') => {
    setFormData((prev) => {
      if (col === 'col1') {
        return {
          ...prev,
          footerNavCol1Links: [...prev.footerNavCol1Links, { label: '', url: '' }],
        };
      }
      if (col === 'col2') {
        return {
          ...prev,
          footerNavCol2Links: [...prev.footerNavCol2Links, { label: '', url: '' }],
        };
      }
      return {
        ...prev,
        footerPolicyLinks: [...prev.footerPolicyLinks, { label: '', url: '' }],
      };
    });
  };

  const handleUpdateFooterLink = (
    col: 'col1' | 'col2' | 'policy',
    index: number,
    field: 'label' | 'url',
    val: string
  ) => {
    setFormData((prev) => {
      if (col === 'col1') {
        const next = [...prev.footerNavCol1Links];
        next[index] = { ...next[index], [field]: val };
        return { ...prev, footerNavCol1Links: next };
      }
      if (col === 'col2') {
        const next = [...prev.footerNavCol2Links];
        next[index] = { ...next[index], [field]: val };
        return { ...prev, footerNavCol2Links: next };
      }
      const next = [...prev.footerPolicyLinks];
      next[index] = { ...next[index], [field]: val };
      return { ...prev, footerPolicyLinks: next };
    });
  };

  const handleDeleteFooterLink = (col: 'col1' | 'col2' | 'policy', index: number) => {
    setFormData((prev) => {
      if (col === 'col1') {
        return {
          ...prev,
          footerNavCol1Links: prev.footerNavCol1Links.filter((_, i) => i !== index),
        };
      }
      if (col === 'col2') {
        return {
          ...prev,
          footerNavCol2Links: prev.footerNavCol2Links.filter((_, i) => i !== index),
        };
      }
      return {
        ...prev,
        footerPolicyLinks: prev.footerPolicyLinks.filter((_, i) => i !== index),
      };
    });
  };

  const handleSyncContactToFooter = () => {
    setFormData((prev) => ({
      ...prev,
      address: prev.studioAddress || prev.address || prev.footerAddress,
      footerAddress: prev.studioAddress || prev.address || prev.footerAddress,
      hotline: prev.hotline || prev.footerHotline,
      hotlineDisplay: prev.hotlineDisplay || prev.hotline || prev.footerHotline,
      footerHotline: prev.hotlineDisplay || prev.hotline || prev.footerHotline,
      contactEmail: prev.email || prev.contactEmail || prev.footerEmail,
      footerEmail: prev.email || prev.contactEmail || prev.footerEmail,
      workingHours: prev.openingHours || prev.workingHours || prev.footerWorkingHours,
      footerWorkingHours: prev.openingHours || prev.workingHours || prev.footerWorkingHours,
      googleMapsUrl: prev.googleMapsUrl,
      googleMapsEmbedUrl: prev.googleMapsEmbedUrl,
      googleMapsShareUrl: prev.googleMapsShareUrl,
    }));
    showToast('Đã đồng bộ thông tin liên hệ sang Footer!');
  };

  const handleGoogleMapsInputChange = (inputVal: string) => {
    const fallbackAddr = formData.studioAddress || formData.address || formData.footerAddress;
    const resolved = resolveGoogleMapsUrl(inputVal, fallbackAddr);
    setFormData((prev) => ({
      ...prev,
      googleMapsUrl: inputVal,
      googleMapsEmbedUrl: resolved.embedUrl,
      googleMapsShareUrl: resolved.shareUrl,
    }));
  };

  // Save all settings
  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, snapshotSeed: true }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Lưu cài đặt thất bại.');
      }

      showToast('Đã lưu toàn bộ cấu hình hệ thống & làm mới cache thành công!');
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi kết nối khi cập nhật cài đặt.');
    } finally {
      setSaving(false);
    }
  };

  // Dedicated Contact Save & Instant Revalidate
  const handleSaveContactOnly = async () => {
    setSavingContact(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/admin/settings/contact', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotline: formData.hotline,
          hotlineDisplay: formData.hotlineDisplay,
          zaloPhone: formData.zaloNumber,
          zaloUrl: formData.zaloUrl,
          messengerUrl: formData.messengerUrl,
          promoText: formData.promoText,
          address: formData.studioAddress,
          email: formData.email,
          googleMapsUrl: formData.googleMapsUrl,
          googleMapsEmbedUrl: formData.googleMapsEmbedUrl,
          googleMapsShareUrl: formData.googleMapsShareUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Cập nhật liên hệ thất bại.');
      }

      showToast('Thông tin liên hệ & Vertical Floating Widget đã được cập nhật!');
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi lưu thông tin liên hệ.');
    } finally {
      setSavingContact(false);
    }
  };

  const handleDriveUrlChange = (url: string) => {
    const trimmed = url.trim();
    let extractedId = '';

    if (trimmed.startsWith('AIzaSy')) {
      alert('Chuỗi vừa dán là Google Cloud API Key, không phải Folder ID. Vui lòng dán vào ô "Google Drive API Key" bên dưới.');
      return;
    }

    const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]{15,})/);
    if (folderMatch && folderMatch[1]) {
      extractedId = folderMatch[1].split('?')[0].split('&')[0];
    } else {
      const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{15,})/);
      if (idMatch && idMatch[1]) {
        extractedId = idMatch[1].split('&')[0];
      } else if (/^[a-zA-Z0-9_-]{20,50}$/.test(trimmed) && !trimmed.includes('/')) {
        extractedId = trimmed;
      }
    }

    setFormData((prev) => ({
      ...prev,
      driveFolderUrl: url,
      driveFolderId: extractedId || prev.driveFolderId,
    }));
  };

  const handleTestDrive = async () => {
    setTestingDrive(true);
    setDriveTestResult(null);
    try {
      const res = await fetch(
        `/api/admin/drive/files?folderId=${encodeURIComponent(formData.driveFolderId || '')}`
      );
      const data = await res.json();
      if (data.success) {
        setDriveTestResult({
          success: true,
          count: data.files?.length || 0,
          warning: data.warning,
        });
      } else {
        setDriveTestResult({
          success: false,
          error: data.error || 'Không thể kết nối đến thư mục Drive.',
        });
      }
    } catch (err: any) {
      setDriveTestResult({
        success: false,
        error: err.message || 'Lỗi kết nối kiểm tra Drive.',
      });
    } finally {
      setTestingDrive(false);
    }
  };

  const handleSyncModels = async () => {
    const key = formData.geminiApiKey.trim();
    if (!key) {
      setModelsSyncError('Vui lòng nhập Google Gemini API Key trước khi đồng bộ danh sách model.');
      return;
    }
    try {
      setSyncingModels(true);
      setModelsSyncError('');
      setModelsSyncSuccess(null);
      const res = await fetch(`/api/admin/gemini/models?apiKey=${encodeURIComponent(key)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.models)) {
        setAvailableGeminiModels(data.models);
        setModelsSyncSuccess(`Đã kết nối thành công với Google AI! Tìm thấy ${data.models.length} model khả dụng.`);
        if (!data.models.some((m: any) => m.id === formData.geminiModel) || formData.geminiModel.includes('3.1-pro')) {
          const topFlash = data.models.find((m: any) => m.id.toLowerCase().includes('flash'))?.id || data.models[0]?.id || 'gemini-2.5-flash';
          setFormData((prev) => ({ ...prev, geminiModel: topFlash }));
        }
      } else {
        setModelsSyncError(data.error || 'Không thể đồng bộ danh sách model từ Google AI.');
      }
    } catch (err: any) {
      setModelsSyncError(err.message || 'Lỗi kết nối khi đồng bộ models.');
    } finally {
      setSyncingModels(false);
    }
  };

  const handleTestGemini = async () => {
    const key = formData.geminiApiKey.trim();
    if (!key) {
      setModelsSyncError('Vui lòng nhập Google Gemini API Key trước khi thử nghiệm.');
      return;
    }
    try {
      setTestingGemini(true);
      setGeminiTestResult(null);
      setModelsSyncError('');
      const res = await fetch('/api/admin/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType: 'ALBUM_STORY',
          inputContext: {
            title: 'Hoàng Hôn Tình Yêu',
            concept: 'Pre-Wedding Cinematic',
            location: 'Đà Lạt',
            coupleNames: 'Hoàng Nam & Lan Phương',
          },
          model: formData.geminiModel,
          temperature: formData.geminiTemperature,
          tone: formData.geminiTone,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGeminiTestResult(data.rawText);
        showToast('✨ Thử nghiệm câu chuyện tình yêu bằng Gemini thành công!');
      } else {
        setModelsSyncError(data.error || 'Lỗi khi gọi AI thử nghiệm.');
      }
    } catch (err: any) {
      setModelsSyncError(err.message || 'Lỗi kết nối kiểm tra AI.');
    } finally {
      setTestingGemini(false);
    }
  };

  const handleExportSeed = async () => {
    try {
      setExportingSeed(true);
      setSeedExportSuccess(null);
      setErrorMessage('');

      const res = await fetch('/api/admin/system/snapshot-seed', {
        method: 'POST',
      });
      const data = await res.json();

      if (data.success) {
        const msg = 'Đã lưu toàn bộ dữ liệu hiện tại làm Seed Mockup gốc thành công!';
        setSeedExportSuccess(
          `${msg} (${data.counts?.servicePackage || 0} gói giá, ${data.counts?.album || 0} album, ${data.counts?.blogPost || 0} bài viết blog, ${data.counts?.mediaFolder || 0} thư mục media).`
        );
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 6000);
      } else {
        throw new Error(data.error || 'Lỗi khi đóng gói dữ liệu seed.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi xuất snapshot seed.');
    } finally {
      setExportingSeed(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-stone-400 gap-3">
        <Loader2 className="w-7 h-7 animate-spin text-stone-700" />
        <span className="text-xs font-light tracking-wide">Đang tải cấu hình hệ thống...</span>
      </div>
    );
  }

  // RBAC GUARD: USER is forbidden from Settings
  if (currentUserRole === 'USER') {
    return (
      <div className="p-8 max-w-lg mx-auto text-center space-y-4 my-16">
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200 shadow-sm">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-serif font-medium text-stone-900">Truy Cập Bị Giới Hạn (403 Forbidden)</h2>
        <p className="text-xs text-stone-500 font-light leading-relaxed">
          Tài khoản của bạn được phân quyền <strong>Người Dùng (USER)</strong> chỉ có quyền đăng bài blog, tạo album ảnh cưới và tải media.
          Toàn bộ khu vực Cài Đặt Hệ Thống chỉ dành riêng cho Ban Quản Trị Studio.
        </p>
        <div className="pt-2">
          <a
            href="/admin"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-md"
          >
            Trở Về Tổng Quan
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-stone-900 text-white text-xs shadow-2xl border border-stone-700 animate-fade-in font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-200/80">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-light text-stone-900 tracking-tight">
            Cài Đặt Hệ Thống & Nhận Diện
          </h1>
          <p className="text-xs text-stone-500 font-light mt-1">
            Cấu hình tập trung thông tin liên hệ, nhận diện thương hiệu, SEO và kết nối đám mây.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveAll}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60 shrink-0"
        >
          {saving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-luxury-400" />
              <span>Đang Lưu...</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5 text-luxury-400" />
              <span>Lưu Cấu Hình</span>
            </>
          )}
        </button>
      </div>

      {/* ERROR ALERT */}
      {errorMessage && (
        <div className="p-4 bg-red-50/80 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center gap-2.5 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* TAB NAVIGATION PILLS */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-stone-200/50 rounded-2xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('branding')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'branding'
              ? 'bg-stone-900 text-white shadow-sm'
              : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-luxury-400" />
          <span>Nhận Diện & Bảng Màu</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('footer')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'footer'
              ? 'bg-stone-900 text-white shadow-sm'
              : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
          }`}
        >
          <PanelBottom className="w-3.5 h-3.5 text-luxury-400" />
          <span>Cấu Hình Footer</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('contact')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'contact'
              ? 'bg-stone-900 text-white shadow-sm'
              : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
          }`}
        >
          <PhoneCall className="w-3.5 h-3.5 text-luxury-400" />
          <span>Thông Tin & Widget</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('seo')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'seo'
              ? 'bg-stone-900 text-white shadow-sm'
              : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-luxury-400" />
          <span>Cấu Hình SEO</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tracking')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'tracking'
              ? 'bg-stone-900 text-white shadow-sm'
              : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
          }`}
        >
          <Target className="w-3.5 h-3.5 text-luxury-400" />
          <span>Google Ads & Trang Đích</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('drive')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'drive'
              ? 'bg-stone-900 text-white shadow-sm'
              : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
          }`}
        >
          <HardDrive className="w-3.5 h-3.5 text-luxury-400" />
          <span>Google Drive</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('payment')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'payment'
              ? 'bg-stone-900 text-white shadow-sm'
              : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5 text-luxury-400" />
          <span>Thanh Toán VietQR</span>
        </button>

        {/* SUPER_ADMIN ONLY TABS */}
        {currentUserRole === 'SUPER_ADMIN' && (
          <>
            <button
              type="button"
              onClick={() => setActiveTab('email')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'email'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-luxury-400" />
              <span>Email SMTP (Pro)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('gemini')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'gemini'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-luxury-400" />
              <span>Gemini AI Assistant</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('system')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'system'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-luxury-400" />
              <span>Hệ Thống / VPS Seed</span>
            </button>
          </>
        )}
      </div>

      {activeTab === 'payment' ? (
        <div className="pt-2">
          <BankSettingsCard />
        </div>
      ) : activeTab === 'email' ? (
        <div className="pt-2">
          <EmailSettingsCard />
        </div>
      ) : (
        <form onSubmit={handleSaveAll} className="space-y-6">
        {/* =========================================================================
            TAB: BRANDING & DYNAMIC LOGO IDENTITY
        ========================================================================= */}
        {activeTab === 'branding' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: BRAND CONFIGURATION FORM (60%) */}
            <div className="lg:col-span-7 space-y-6">
              {/* CARD 1: LOGO & TYPOGRAPHY SETTINGS */}
              <div className="bg-white rounded-2xl border border-stone-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 sm:p-8 space-y-6">
                <div className="border-b border-stone-100 pb-5">
                  <h3 className="font-serif text-lg font-medium text-stone-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#C5A880]" />
                    <span>Nhận Diện Thương Hiệu & Logo Hệ Thống</span>
                  </h3>
                  <p className="text-xs text-stone-400 font-light mt-0.5 leading-relaxed">
                    Đồng bộ nhận diện thương hiệu giữa Header, Footer và Admin. Tùy chỉnh Logo dạng Chữ Typography chuẩn tạp chí nghệ thuật hoặc Tải ảnh Logo dạng PNG/SVG.
                  </p>
                </div>

                {/* FORMAT SELECTOR PILLS */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold tracking-wider text-stone-600 uppercase block">
                    Định Dạng Logo Hiển Thị
                  </label>
                  <div className="grid grid-cols-2 gap-3 p-1.5 bg-stone-100/80 rounded-2xl border border-stone-200/50">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, logoType: 'TEXT' })}
                      className={`py-3 px-4 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        formData.logoType === 'TEXT'
                          ? 'bg-stone-900 text-white shadow-sm'
                          : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
                      }`}
                    >
                      <Type className="w-3.5 h-3.5" />
                      <span>✍️ Dạng Chữ (Text Typography)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, logoType: 'IMAGE' })}
                      className={`py-3 px-4 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        formData.logoType === 'IMAGE'
                          ? 'bg-stone-900 text-white shadow-sm'
                          : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
                      }`}
                    >
                      <span>🖼️ Dạng Ảnh (Upload / URL)</span>
                    </button>
                  </div>
                </div>

                {/* WHEN TEXT TYPOGRAPHY IS SELECTED */}
                {formData.logoType === 'TEXT' && (
                  <div className="space-y-6 pt-2">
                    {/* BRAND TEXT INPUTS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold tracking-wider text-stone-600 mb-1.5 block uppercase">
                          Tên chính vế 1 (Nền tương phản)
                        </label>
                        <input
                          type="text"
                          value={formData.brandNamePart1 || ''}
                          onChange={(e) => setFormData({ ...formData, brandNamePart1: e.target.value })}
                          placeholder="PLUS"
                          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-stone-400 bg-stone-50/50"
                        />
                        <p className="text-[10px] text-stone-400 mt-1">
                          Vế thương hiệu đầu tiên (ví dụ: PLUS, THE, LUXE...).
                        </p>
                      </div>

                      <div>
                        <label className="text-xs font-semibold tracking-wider text-stone-600 mb-1.5 flex items-center gap-1.5 uppercase">
                          <span>Tên chính vế 2 (Điểm nhấn Accent)</span>
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block shadow-xs"
                            style={{ backgroundColor: formData.logoAccentColor || '#C5A880' }}
                          />
                        </label>
                        <input
                          type="text"
                          value={formData.brandNamePart2 || ''}
                          onChange={(e) => setFormData({ ...formData, brandNamePart2: e.target.value })}
                          placeholder="MOMENTS"
                          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-stone-400 bg-stone-50/50"
                        />
                        <p className="text-[10px] text-stone-400 mt-1">
                          Vế điểm nhấn thứ hai (ví dụ: MOMENTS, STUDIO, BRIDAL...).
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold tracking-wider text-stone-600 mb-1.5 block uppercase">
                        Dòng Phụ Đề / Slogan Studio
                      </label>
                      <input
                        type="text"
                        value={formData.brandSubtitle || ''}
                        onChange={(e) => setFormData({ ...formData, brandSubtitle: e.target.value })}
                        placeholder="LUXURY WEDDING STUDIO"
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-stone-400 bg-stone-50/50"
                      />
                      <p className="text-[10px] text-stone-400 mt-1">
                        Dòng chữ nhỏ dưới logo, giãn chữ tracking rộng chuẩn tạp chí nghệ thuật.
                      </p>
                    </div>

                    {/* TYPOGRAPHY CUSTOMIZER (FONT FAMILY, FONT SIZE, FONT WEIGHT, SPACING) */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-stone-50/80 border border-stone-200/70 space-y-5">
                      <div className="flex items-center gap-2 pb-2 border-b border-stone-200/50">
                        <Sliders className="w-4 h-4 text-[#C5A880]" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                          Thông Số Typography & Kiểu Chữ Logo
                        </h4>
                      </div>

                      {/* GOOGLE FONT SELECTOR */}
                      <div>
                        <label className="text-xs font-semibold tracking-wider text-stone-600 mb-1.5 block uppercase">
                          Kiểu Chữ (Google Fonts Nghệ Thuật)
                        </label>
                        <select
                          value={formData.logoFontFamily || 'Playfair Display'}
                          onChange={(e) => setFormData({ ...formData, logoFontFamily: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-stone-400 bg-white"
                        >
                          {GOOGLE_FONTS_LIST.map((f) => (
                            <option key={f.value} value={f.value}>
                              {f.label}
                            </option>
                          ))}
                        </select>
                        <p className="text-[10px] text-stone-400 mt-1">
                          Font được nạp trực tiếp từ Google Fonts và áp dụng đồng bộ tức thì.
                        </p>
                      </div>

                      {/* FONT SIZE SLIDER + NUMBER INPUT */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-semibold tracking-wider text-stone-600 uppercase">
                            Kích Thước Chữ Logo (Font Size)
                          </label>
                          <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-white border border-stone-200 text-stone-800">
                            {formData.logoFontSize || 24}px
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <input
                            type="range"
                            min="16"
                            max="48"
                            step="1"
                            value={formData.logoFontSize || 24}
                            onChange={(e) => setFormData({ ...formData, logoFontSize: Number(e.target.value) })}
                            className="w-full accent-stone-900 h-2 bg-stone-200 rounded-lg cursor-pointer"
                          />
                          <input
                            type="number"
                            min="16"
                            max="48"
                            value={formData.logoFontSize || 24}
                            onChange={(e) => setFormData({ ...formData, logoFontSize: Number(e.target.value) })}
                            className="w-16 px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs text-center font-mono focus:outline-none focus:border-stone-400 bg-white"
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                          <span>16px (Nhỏ gọn)</span>
                          <span>24px (Chuẩn)</span>
                          <span>48px (Lớn)</span>
                        </div>
                      </div>

                      {/* FONT WEIGHT & LETTER SPACING IN 2 COLUMNS */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-semibold tracking-wider text-stone-600 mb-1.5 block uppercase">
                            Độ Đậm Nhạt (Font Weight)
                          </label>
                          <select
                            value={formData.logoFontWeight || '600'}
                            onChange={(e) => setFormData({ ...formData, logoFontWeight: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-stone-400 bg-white"
                          >
                            {FONT_WEIGHT_LIST.map((w) => (
                              <option key={w.value} value={w.value}>
                                {w.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-semibold tracking-wider text-stone-600 mb-1.5 block uppercase">
                            Khoảng Cách Chữ (Letter Spacing)
                          </label>
                          <select
                            value={formData.logoLetterSpacing || '0.15em'}
                            onChange={(e) => setFormData({ ...formData, logoLetterSpacing: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-stone-400 bg-white"
                          >
                            {LETTER_SPACING_LIST.map((sp) => (
                              <option key={sp.value} value={sp.value}>
                                {sp.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* LOGO COLORS (LIGHT, DARK, ACCENT) */}
                      <div className="pt-2 border-t border-stone-200/50 space-y-3">
                        <label className="text-xs font-bold tracking-wider text-stone-700 uppercase block">
                          Bảng Màu Chữ Logo
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {/* Color 1: On Light Canvas */}
                          <div className="p-3 bg-white rounded-xl border border-stone-200/70 space-y-2">
                            <span className="text-[11px] font-semibold text-stone-600 block">
                              Màu Nền Sáng (Header)
                            </span>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={formData.logoColorLight || '#1A1614'}
                                onChange={(e) => setFormData({ ...formData, logoColorLight: e.target.value })}
                                className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 bg-transparent"
                              />
                              <input
                                type="text"
                                value={formData.logoColorLight || '#1A1614'}
                                onChange={(e) => setFormData({ ...formData, logoColorLight: e.target.value })}
                                className="w-full px-2 py-1 text-xs font-mono rounded border border-stone-200 uppercase"
                              />
                            </div>
                          </div>

                          {/* Color 2: On Dark Canvas */}
                          <div className="p-3 bg-white rounded-xl border border-stone-200/70 space-y-2">
                            <span className="text-[11px] font-semibold text-stone-600 block">
                              Màu Nền Tối (Footer)
                            </span>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={formData.logoColorDark || '#F5F2EB'}
                                onChange={(e) => setFormData({ ...formData, logoColorDark: e.target.value })}
                                className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 bg-transparent"
                              />
                              <input
                                type="text"
                                value={formData.logoColorDark || '#F5F2EB'}
                                onChange={(e) => setFormData({ ...formData, logoColorDark: e.target.value })}
                                className="w-full px-2 py-1 text-xs font-mono rounded border border-stone-200 uppercase"
                              />
                            </div>
                          </div>

                          {/* Color 3: Accent / Vế 2 */}
                          <div className="p-3 bg-white rounded-xl border border-stone-200/70 space-y-2">
                            <span className="text-[11px] font-semibold text-stone-600 block">
                              Màu Điểm Nhấn (Accent)
                            </span>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={formData.logoAccentColor || '#C5A880'}
                                onChange={(e) => setFormData({ ...formData, logoAccentColor: e.target.value })}
                                className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 bg-transparent"
                              />
                              <input
                                type="text"
                                value={formData.logoAccentColor || '#C5A880'}
                                onChange={(e) => setFormData({ ...formData, logoAccentColor: e.target.value })}
                                className="w-full px-2 py-1 text-xs font-mono rounded border border-stone-200 uppercase"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* WHEN IMAGE LOGO IS SELECTED */}
                {formData.logoType === 'IMAGE' && (
                  <div className="space-y-5 pt-2">
                    {/* Header Dark Logo (For light background) */}
                    <SingleImagePicker
                      label="1. Logo Header (Hiển thị trên nền sáng - Dark Logo)"
                      value={formData.logoDarkUrl || ''}
                      onChange={(url) => setFormData({ ...formData, logoDarkUrl: url })}
                      aspectRatio="auto"
                      modalTitle="Chọn Logo Header Nền Sáng (.PNG / .SVG)"
                      helperText="Chỉ chấp nhận định dạng .PNG tách nền hoặc vector .SVG để đảm bảo độ sắc nét cao nhất."
                      allowedExtensions={['png', 'svg']}
                      accept=".png,.svg,image/png,image/svg+xml"
                      allowDirectUpload={true}
                      uploadEndpoint="/api/admin/settings/upload-logo"
                      isLogo={true}
                    />

                    {/* Footer Light Logo (For dark background) */}
                    <SingleImagePicker
                      label="2. Logo Footer & Sidebar (Hiển thị trên nền tối - Light Logo)"
                      value={formData.logoLightUrl || ''}
                      onChange={(url) => setFormData({ ...formData, logoLightUrl: url })}
                      aspectRatio="auto"
                      modalTitle="Chọn Logo Footer Nền Tối (.PNG / .SVG)"
                      helperText="Chỉ chấp nhận định dạng .PNG tách nền hoặc vector .SVG để đảm bảo độ sắc nét cao nhất."
                      allowedExtensions={['png', 'svg']}
                      accept=".png,.svg,image/png,image/svg+xml"
                      allowDirectUpload={true}
                      uploadEndpoint="/api/admin/settings/upload-logo"
                      isLogo={true}
                    />
                  </div>
                )}
              </div>

              {/* CARD 2: SYSTEM THEME COLOR PALETTE */}
              <div className="bg-white rounded-2xl border border-stone-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 sm:p-8 space-y-6">
                <div className="border-b border-stone-100 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-serif text-lg font-medium text-stone-900 flex items-center gap-2">
                      <Palette className="w-4 h-4 text-[#C5A880]" />
                      <span>Bảng Màu Theme Hệ Thống (Theme Color Palette)</span>
                    </h3>
                    <p className="text-xs text-stone-400 font-light mt-0.5 leading-relaxed">
                      Thiết lập bảng màu chủ đạo cho toàn bộ giao diện website (Màu nhấn Accent, Màu nền chính, Màu chữ).
                    </p>
                  </div>

                  {/* PRESET ACTIONS */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          themePrimaryColor: '#C5A880',
                          themeBgColor: '#FAF8F5',
                          themeTextColor: '#1C1917',
                          logoAccentColor: '#C5A880',
                          logoColorLight: '#1A1614',
                          logoColorDark: '#F5F2EB',
                        })
                      }
                      className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200/80 text-stone-700 text-[11px] font-medium transition-all flex items-center gap-1.5 cursor-pointer"
                      title="Khôi phục tone Luxury Champagne & Nền Kem sáng"
                    >
                      <RotateCcw className="w-3 h-3 text-[#C5A880]" />
                      <span>Mặc Định Luxury Kem</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          themePrimaryColor: '#C5A880',
                          themeBgColor: '#0E0D0C',
                          themeTextColor: '#EAE5D9',
                          logoAccentColor: '#C5A880',
                          logoColorLight: '#1A1614',
                          logoColorDark: '#F5F2EB',
                        })
                      }
                      className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-200 text-[11px] font-medium transition-all flex items-center gap-1.5 cursor-pointer"
                      title="Chuyển sang phong cách Luxury Noir (Nền tối huyền bí & Vàng Gold)"
                    >
                      <span>✨ Noir Dark Gold</span>
                    </button>
                  </div>
                </div>

                {/* THEME COLOR PICKERS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Primary / Accent Color */}
                  <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/70 space-y-2">
                    <label className="text-xs font-semibold tracking-wider text-stone-700 uppercase block">
                      1. Màu Chủ Đạo / Điểm Nhấn
                    </label>
                    <p className="text-[10px] text-stone-400">
                      Nút bấm chính, icon sao, đường viền luxury (#C5A880 hoặc #D4AF37).
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="color"
                        value={formData.themePrimaryColor || '#C5A880'}
                        onChange={(e) => setFormData({ ...formData, themePrimaryColor: e.target.value })}
                        className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={formData.themePrimaryColor || '#C5A880'}
                        onChange={(e) => setFormData({ ...formData, themePrimaryColor: e.target.value })}
                        className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-stone-200 bg-white uppercase"
                      />
                    </div>
                  </div>

                  {/* Page Background Color */}
                  <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/70 space-y-2">
                    <label className="text-xs font-semibold tracking-wider text-stone-700 uppercase block">
                      2. Màu Nền Toàn Trang (Page Bg)
                    </label>
                    <p className="text-[10px] text-stone-400">
                      Màu nền mặc định của website (Kem sáng #FAF8F5 hoặc Tối #0E0D0C).
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="color"
                        value={formData.themeBgColor || '#FAF8F5'}
                        onChange={(e) => setFormData({ ...formData, themeBgColor: e.target.value })}
                        className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={formData.themeBgColor || '#FAF8F5'}
                        onChange={(e) => setFormData({ ...formData, themeBgColor: e.target.value })}
                        className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-stone-200 bg-white uppercase"
                      />
                    </div>
                  </div>

                  {/* Main Text Color */}
                  <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/70 space-y-2">
                    <label className="text-xs font-semibold tracking-wider text-stone-700 uppercase block">
                      3. Màu Chữ Chính (Main Text)
                    </label>
                    <p className="text-[10px] text-stone-400">
                      Tiêu đề và nội dung bài viết (#1C1917 trên nền sáng hoặc #EAE5D9 trên nền tối).
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="color"
                        value={formData.themeTextColor || '#1C1917'}
                        onChange={(e) => setFormData({ ...formData, themeTextColor: e.target.value })}
                        className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={formData.themeTextColor || '#1C1917'}
                        onChange={(e) => setFormData({ ...formData, themeTextColor: e.target.value })}
                        className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-stone-200 bg-white uppercase"
                      />
                    </div>
                  </div>
                </div>

                {/* SAVE BUTTON */}
                <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[11px] text-stone-400 font-light">
                    * Đồng bộ tự động tới Header, Footer, Admin và Toàn Hệ Thống sau khi Lưu.
                  </span>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs shadow-sm flex items-center gap-2 cursor-pointer transition-all"
                  >
                    {saving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5 text-luxury-400" />
                    )}
                    <span>Lưu Nhận Diện & Bảng Màu</span>
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: DUAL LIVE PREVIEW & THEME PALETTE PREVIEW (40%) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="sticky top-24 space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <Eye className="w-4 h-4 text-stone-500" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                    Mô Phỏng Trực Tiếp (Live Realtime Preview)
                  </h4>
                </div>

                {/* PREVIEW 1: LIGHT CANVAS (HEADER NAVBAR) */}
                <div className="rounded-2xl p-5 bg-white border border-stone-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-medium text-stone-500 border-b border-stone-100 pb-2">
                    <span>Nền Sáng (Thanh Header Navbar)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-mono">LIGHT CANVAS</span>
                  </div>
                  <div className="py-6 px-4 bg-white/90 backdrop-blur-md rounded-xl border border-stone-200/60 flex items-center justify-center">
                    <BrandLogo
                      variant="dark"
                      logoType={formData.logoType}
                      brandNamePart1={formData.brandNamePart1}
                      brandNamePart2={formData.brandNamePart2}
                      brandSubtitle={formData.brandSubtitle}
                      logoLightUrl={formData.logoLightUrl}
                      logoDarkUrl={formData.logoDarkUrl}
                      logoFontFamily={formData.logoFontFamily}
                      logoFontSize={Number(formData.logoFontSize) || 24}
                      logoFontWeight={formData.logoFontWeight}
                      logoLetterSpacing={formData.logoLetterSpacing}
                      logoColorLight={formData.logoColorLight}
                      logoColorDark={formData.logoColorDark}
                      logoAccentColor={formData.logoAccentColor}
                    />
                  </div>
                </div>

                {/* PREVIEW 2: DARK CANVAS (FOOTER / DARK MODE) */}
                <div className="rounded-2xl p-5 bg-[#1C1917] border border-stone-800 shadow-xl space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-medium text-stone-400 border-b border-stone-800 pb-2">
                    <span>Nền Tối (Chân Trang Footer)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 font-mono">DARK CANVAS</span>
                  </div>
                  <div className="py-6 px-4 bg-charcoal-950 rounded-xl border border-stone-800 flex items-center justify-center">
                    <BrandLogo
                      variant="light"
                      logoType={formData.logoType}
                      brandNamePart1={formData.brandNamePart1}
                      brandNamePart2={formData.brandNamePart2}
                      brandSubtitle={formData.brandSubtitle}
                      logoLightUrl={formData.logoLightUrl}
                      logoDarkUrl={formData.logoDarkUrl}
                      logoFontFamily={formData.logoFontFamily}
                      logoFontSize={Number(formData.logoFontSize) || 24}
                      logoFontWeight={formData.logoFontWeight}
                      logoLetterSpacing={formData.logoLetterSpacing}
                      logoColorLight={formData.logoColorLight}
                      logoColorDark={formData.logoColorDark}
                      logoAccentColor={formData.logoAccentColor}
                    />
                  </div>
                </div>

                {/* PREVIEW 3: THEME COLOR PALETTE REALTIME SPECIMEN */}
                <div className="rounded-2xl p-5 bg-white border border-stone-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-medium text-stone-500 border-b border-stone-100 pb-2">
                    <span>Mô Phỏng Phối Màu Giao Diện (Theme Preview)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-mono">UI SPECIMEN</span>
                  </div>
                  <div
                    className="p-5 rounded-xl border transition-all space-y-3 shadow-inner"
                    style={{
                      backgroundColor: formData.themeBgColor || '#FAF8F5',
                      borderColor: 'rgba(0,0,0,0.08)',
                    }}
                  >
                    <div>
                      <p
                        className="text-[10px] tracking-widest uppercase font-semibold transition-colors"
                        style={{ color: formData.themePrimaryColor || '#C5A880' }}
                      >
                        PRE-WEDDING EDITORIAL
                      </p>
                      <h4
                        className="font-serif text-base font-medium mt-0.5 transition-colors"
                        style={{ color: formData.themeTextColor || '#1C1917' }}
                      >
                        Nghệ Thuật Ánh Sáng Tình Yêu
                      </h4>
                      <p
                        className="text-[11px] font-light mt-1 opacity-80 leading-relaxed transition-colors"
                        style={{ color: formData.themeTextColor || '#1C1917' }}
                      >
                        Mô phỏng hiển thị văn bản và nút bấm khi áp dụng bộ màu đã chọn.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        className="px-3.5 py-1.5 rounded-lg text-xs font-medium shadow-sm transition-all"
                        style={{
                          backgroundColor: formData.themePrimaryColor || '#C5A880',
                          color: '#FFFFFF',
                        }}
                      >
                        Đặt Lịch Ngay
                      </button>
                      <button
                        type="button"
                        className="px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all"
                        style={{
                          borderColor: formData.themePrimaryColor || '#C5A880',
                          color: formData.themePrimaryColor || '#C5A880',
                        }}
                      >
                        Xem Bảng Giá
                      </button>
                    </div>

                    {/* COLOR CHIPS SUMMARY */}
                    <div className="pt-2 border-t border-black/5 flex items-center justify-between text-[10px] font-mono opacity-70">
                      <span className="flex items-center gap-1">
                        <span
                          className="w-2 h-2 rounded-full inline-block"
                          style={{ backgroundColor: formData.themePrimaryColor }}
                        />
                        {formData.themePrimaryColor}
                      </span>
                      <span className="flex items-center gap-1">
                        <span
                          className="w-2 h-2 rounded-full inline-block border border-black/20"
                          style={{ backgroundColor: formData.themeBgColor }}
                        />
                        {formData.themeBgColor}
                      </span>
                      <span className="flex items-center gap-1">
                        <span
                          className="w-2 h-2 rounded-full inline-block"
                          style={{ backgroundColor: formData.themeTextColor }}
                        />
                        {formData.themeTextColor}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB: FOOTER CMS CONFIGURATION
        ========================================================================= */}
        {activeTab === 'footer' && (
          <div className="space-y-6">
            {/* CARD 1: GIỚI THIỆU THƯƠNG HIỆU & MẠNG XÃ HỘI */}
            <div className="bg-white rounded-2xl border border-stone-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 sm:p-8 space-y-6">
              <div className="pb-4 border-b border-stone-100 flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg font-medium text-stone-900 flex items-center gap-2">
                    <PanelBottom className="w-4 h-4 text-luxury-500" />
                    <span>Cột 1: Giới Thiệu Thương Hiệu & Kênh Mạng XÃ Hội</span>
                  </h3>
                  <p className="text-xs text-stone-400 font-light mt-0.5">
                    Tên thương hiệu, slogan, đoạn triết lý định vị dưới Logo và các đường link mạng xã hội chính thức của studio.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-stone-700 font-medium mb-1.5">
                      Tên Thương Hiệu Studio
                    </label>
                    <input
                      type="text"
                      value={formData.brandName || ''}
                      onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                      placeholder="PLUS MOMENTS"
                      className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-luxury-400 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-stone-700 font-medium mb-1.5">
                      Slogan Thương Hiệu
                    </label>
                    <input
                      type="text"
                      value={formData.brandSlogan || ''}
                      onChange={(e) => setFormData({ ...formData, brandSlogan: e.target.value })}
                      placeholder="LUXURY WEDDING STUDIO"
                      className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-luxury-400 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-stone-700 font-medium mb-1.5">
                    Đoạn Triết Lý Studio (Hiển thị ngay dưới Logo)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.brandBio || formData.footerAboutText || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        brandBio: e.target.value,
                        footerAboutText: e.target.value,
                      })
                    }
                    placeholder="Chúng tôi không chỉ chụp ảnh cưới, chúng tôi ghi lại những rung cảm tinh khôi và chân thành nhất trong tình yêu của bạn..."
                    className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-luxury-400 leading-relaxed font-sans"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-stone-700 font-medium mb-1.5">
                      Facebook URL
                    </label>
                    <input
                      type="url"
                      value={formData.facebookUrl || ''}
                      onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                      placeholder="https://facebook.com/plusmoments.vn"
                      className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-luxury-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-stone-700 font-medium mb-1.5">
                      Instagram URL
                    </label>
                    <input
                      type="url"
                      value={formData.instagramUrl || ''}
                      onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                      placeholder="https://instagram.com/plusmoments.vn"
                      className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-luxury-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-stone-700 font-medium mb-1.5">
                      YouTube URL
                    </label>
                    <input
                      type="url"
                      value={formData.youtubeUrl || ''}
                      onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                      placeholder="https://youtube.com/@plusmoments.vn"
                      className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-luxury-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-stone-700 font-medium mb-1.5">
                      TikTok URL
                    </label>
                    <input
                      type="url"
                      value={formData.tiktokUrl || ''}
                      onChange={(e) => setFormData({ ...formData, tiktokUrl: e.target.value })}
                      placeholder="https://tiktok.com/@plusmoments.vn"
                      className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-luxury-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-stone-700 font-medium mb-1.5">
                      Zalo Link / Hotline Zalo
                    </label>
                    <input
                      type="url"
                      value={formData.zaloUrl || ''}
                      onChange={(e) => setFormData({ ...formData, zaloUrl: e.target.value })}
                      placeholder="https://zalo.me/0903768871"
                      className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-luxury-400"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-stone-400 italic">
                  * Mẹo: Để trống ô mạng xã hội nào thì icon tương ứng sẽ tự động ẩn trên Footer ngoài website.
                </p>
              </div>
            </div>

            {/* CARD 2 & 3: QUẢN LÝ CỘT 2 VÀ CỘT 3 (MENU LINKS) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CỘT 2: BỘ SƯU TẬP CƯỚI */}
              <div className="bg-white rounded-2xl border border-stone-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 space-y-5 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="pb-3 border-b border-stone-100 flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-base font-medium text-stone-900 flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-luxury-500" />
                        <span>Cột 2: Danh Sách Liên Kết 1</span>
                      </h3>
                      <p className="text-[11px] text-stone-400 font-light mt-0.5">
                        Thường dùng cho menu Album / Bộ Sưu Tập Cưới.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-stone-700 font-medium mb-1">
                      Tiêu Đề Cột
                    </label>
                    <input
                      type="text"
                      value={formData.footerNavCol1Title}
                      onChange={(e) => setFormData({ ...formData, footerNavCol1Title: e.target.value })}
                      placeholder="BỘ SƯU TẬP CƯỚI"
                      className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white font-medium"
                    />
                  </div>

                  <div className="space-y-2.5">
                    <label className="block text-[11px] uppercase tracking-wider text-stone-500 font-semibold">
                      Các Liên Kết ({formData.footerNavCol1Links.length})
                    </label>

                    {formData.footerNavCol1Links.map((link, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-stone-50 border border-stone-200 rounded-xl">
                        <input
                          type="text"
                          value={link.label}
                          onChange={(e) => handleUpdateFooterLink('col1', idx, 'label', e.target.value)}
                          placeholder="Tên hiển thị (vd: Ngoại Cảnh Đà Lạt)"
                          className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-luxury-400"
                        />
                        <input
                          type="text"
                          value={link.url}
                          onChange={(e) => handleUpdateFooterLink('col1', idx, 'url', e.target.value)}
                          placeholder="Đường dẫn URL (/albums?...)"
                          className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-luxury-400 font-mono text-[11px]"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteFooterLink('col1', idx)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Xóa link này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleAddFooterLink('col1')}
                  className="w-full py-2 px-3 border border-dashed border-stone-300 hover:border-luxury-500 hover:bg-luxury-50/50 text-stone-700 text-xs rounded-xl flex items-center justify-center gap-1.5 font-medium transition-all cursor-pointer mt-2"
                >
                  <Plus className="w-3.5 h-3.5 text-luxury-600" />
                  <span>+ Thêm Liên Kết Cột 2</span>
                </button>
              </div>

              {/* CỘT 3: BẢNG GIÁ & DỊCH VỤ */}
              <div className="bg-white rounded-2xl border border-stone-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 space-y-5 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="pb-3 border-b border-stone-100 flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-base font-medium text-stone-900 flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-luxury-500" />
                        <span>Cột 3: Danh Sách Liên Kết 2</span>
                      </h3>
                      <p className="text-[11px] text-stone-400 font-light mt-0.5">
                        Thường dùng cho menu Bảng Giá, Cẩm Nang & Liên Hệ.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-stone-700 font-medium mb-1">
                      Tiêu Đề Cột
                    </label>
                    <input
                      type="text"
                      value={formData.footerNavCol2Title}
                      onChange={(e) => setFormData({ ...formData, footerNavCol2Title: e.target.value })}
                      placeholder="BẢNG GIÁ & DỊCH VỤ"
                      className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white font-medium"
                    />
                  </div>

                  <div className="space-y-2.5">
                    <label className="block text-[11px] uppercase tracking-wider text-stone-500 font-semibold">
                      Các Liên Kết ({formData.footerNavCol2Links.length})
                    </label>

                    {formData.footerNavCol2Links.map((link, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-stone-50 border border-stone-200 rounded-xl">
                        <input
                          type="text"
                          value={link.label}
                          onChange={(e) => handleUpdateFooterLink('col2', idx, 'label', e.target.value)}
                          placeholder="Tên hiển thị (vd: Gói Chụp Pre-Wedding)"
                          className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-luxury-400"
                        />
                        <input
                          type="text"
                          value={link.url}
                          onChange={(e) => handleUpdateFooterLink('col2', idx, 'url', e.target.value)}
                          placeholder="Đường dẫn URL (/pricing...)"
                          className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-luxury-400 font-mono text-[11px]"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteFooterLink('col2', idx)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Xóa link này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleAddFooterLink('col2')}
                  className="w-full py-2 px-3 border border-dashed border-stone-300 hover:border-luxury-500 hover:bg-luxury-50/50 text-stone-700 text-xs rounded-xl flex items-center justify-center gap-1.5 font-medium transition-all cursor-pointer mt-2"
                >
                  <Plus className="w-3.5 h-3.5 text-luxury-600" />
                  <span>+ Thêm Liên Kết Cột 3</span>
                </button>
              </div>
            </div>

            {/* CARD 4: THÔNG TIN LIÊN HỆ CỘT 4 */}
            <div className="bg-white rounded-2xl border border-stone-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-3">
                <div>
                  <h3 className="font-serif text-lg font-medium text-stone-900">
                    Cột 4: Thông Tin Liên Hệ & Giờ Làm Việc
                  </h3>
                  <p className="text-xs text-stone-400 font-light mt-0.5">
                    Địa chỉ, hotline, email và giờ mở cửa hiển thị ở cột liên hệ chân trang.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSyncContactToFooter}
                  className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs self-start sm:self-auto"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                  <span>Đồng Bộ Từ Cài Đặt Liên Hệ Chung</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs uppercase tracking-wider text-stone-700 font-medium mb-1.5">
                    Địa Chỉ Studio Chân Trang
                  </label>
                  <input
                    type="text"
                    value={formData.address || formData.footerAddress || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: e.target.value,
                        footerAddress: e.target.value,
                        studioAddress: e.target.value,
                      })
                    }
                    placeholder="31 Hùng Vương, Phường An Đông"
                    className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-stone-700 font-medium mb-1.5">
                    Hotline Hiển Thị
                  </label>
                  <input
                    type="text"
                    value={formData.hotline || formData.footerHotline || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hotline: e.target.value,
                        footerHotline: e.target.value,
                        hotlineDisplay: e.target.value,
                      })
                    }
                    placeholder="0903.768.871"
                    className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-stone-700 font-medium mb-1.5">
                    Email Liên Hệ
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail || formData.footerEmail || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contactEmail: e.target.value,
                        footerEmail: e.target.value,
                        email: e.target.value,
                      })
                    }
                    placeholder="contact@plusmoments.vn"
                    className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs uppercase tracking-wider text-stone-700 font-medium mb-1.5">
                    Khung Giờ Mở Cửa (Working Hours)
                  </label>
                  <input
                    type="text"
                    value={formData.workingHours || formData.footerWorkingHours || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        workingHours: e.target.value,
                        footerWorkingHours: e.target.value,
                        openingHours: e.target.value,
                      })
                    }
                    placeholder="09:00 - 21:00 (Thứ 2 - Chủ Nhật)"
                    className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white"
                  />
                </div>

                {/* 1-INPUT SMART GOOGLE MAPS AUTO-CONVERTER */}
                <div className="sm:col-span-2 pt-4 border-t border-stone-100 space-y-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-luxury-500" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-800">
                      Bản Đồ Google Maps Chân Trang (Footer Map)
                    </h4>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-stone-700 font-medium mb-1.5">
                      ĐƯỜNG LINK VỊ TRÍ GOOGLE MAPS CỦA STUDIO
                    </label>
                    <input
                      type="text"
                      value={formData.googleMapsUrl || ''}
                      onChange={(e) => handleGoogleMapsInputChange(e.target.value)}
                      placeholder=""
                      className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-luxury-400 font-mono transition-all"
                    />
                    <p className="text-[11px] text-stone-400 mt-1.5 leading-relaxed">
                      Chỉ cần dán link Google Maps bất kỳ (ví dụ link chia sẻ từ điện thoại https://maps.app.goo.gl/... hoặc https://google.com/maps/place/...). Hệ thống sẽ tự động tạo bản đồ nhúng và link chỉ đường.
                    </p>
                  </div>

                  {/* Live Conversion Preview If Embed URL exists */}
                  {formData.googleMapsEmbedUrl && (
                    <div className="pt-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-stone-700 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Xem trước khung bản đồ (Tông màu tối sang trọng - Footer Preview):</span>
                        </p>
                        {formData.googleMapsShareUrl && (
                          <a
                            href={formData.googleMapsShareUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-luxury-600 hover:text-luxury-700 underline underline-offset-2 flex items-center gap-1"
                          >
                            <span>Thử link chỉ đường ↗</span>
                          </a>
                        )}
                      </div>
                      <div className="w-full max-w-sm h-36 rounded-xl overflow-hidden border border-[#3E3834] bg-[#1A1614] shadow-inner relative group">
                        <iframe
                          src={formData.googleMapsEmbedUrl}
                          width="100%"
                          height="100%"
                          style={{ border: 0, filter: 'contrast(95%) opacity(85%)' }}
                          allowFullScreen={false}
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title="Bản đồ chỉ đường PlusMoments Wedding Studio"
                          className="group-hover:opacity-100 transition duration-300"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* CARD 5: DÒNG BẢN QUYỀN & TRANG PHÁP LÝ (BOTTOM BAR) */}
            <div className="bg-white rounded-2xl border border-stone-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 sm:p-8 space-y-6">
              <div className="pb-4 border-b border-stone-100">
                <h3 className="font-serif text-lg font-medium text-stone-900">
                  Dòng Bản Quyền & Trang Pháp Lý (Bottom Bar)
                </h3>
                <p className="text-xs text-stone-400 font-light mt-0.5">
                  Dòng chữ bản quyền dưới đáy trang và các liên kết chính sách bảo mật / hợp đồng.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-stone-700 font-medium mb-1.5">
                    Dòng Chữ Bản Quyền (Copyright Text)
                  </label>
                  <input
                    type="text"
                    value={formData.copyrightText || formData.footerCopyrightText || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        copyrightText: e.target.value,
                        footerCopyrightText: e.target.value,
                      })
                    }
                    placeholder="© 2026 PlusMoments Wedding Studio. All rights reserved."
                    className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white"
                  />
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] uppercase tracking-wider text-stone-500 font-semibold">
                      Các Liên Kết Pháp Lý & Chính Sách ({formData.footerPolicyLinks.length})
                    </label>
                    <button
                      type="button"
                      onClick={() => handleAddFooterLink('policy')}
                      className="text-xs text-luxury-700 hover:text-luxury-800 font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm trang pháp lý</span>
                    </button>
                  </div>

                  {formData.footerPolicyLinks.map((link, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-stone-50 border border-stone-200 rounded-xl">
                      <input
                        type="text"
                        value={link.label}
                        onChange={(e) => handleUpdateFooterLink('policy', idx, 'label', e.target.value)}
                        placeholder="Tên trang (vd: Chính Sách Bảo Mật)"
                        className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-luxury-400"
                      />
                      <input
                        type="text"
                        value={link.url}
                        onChange={(e) => handleUpdateFooterLink('policy', idx, 'url', e.target.value)}
                        placeholder="Đường dẫn (/chinh-sach...)"
                        className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-luxury-400 font-mono text-[11px]"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteFooterLink('policy', idx)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Xóa link này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SAVE FOOTER BUTTON */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSaveAll}
                disabled={saving}
                className="px-8 py-3 rounded-xl bg-luxury-600 hover:bg-luxury-700 text-white font-medium text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Đang Lưu Cấu Hình Footer...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-white" />
                    <span>Lưu Cấu Hình Footer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}



        {/* =========================================================================
            TAB 1: CONTACT & VERTICAL FLOATING WIDGET (2-COLUMN LUXURY LAYOUT)
        ========================================================================= */}
        {activeTab === 'contact' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: FORM INPUTS (68%) */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white rounded-2xl border border-stone-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="font-serif text-lg font-medium text-stone-900">
                    Cấu Hình Hotline & Cụm Nút Liên Hệ
                  </h3>
                  <p className="text-xs text-stone-400 font-light mt-0.5">
                    Thông tin hiển thị trên Header, Footer, Trang Liên Hệ và Vertical Floating Widget.
                  </p>
                </div>

                {/* Promo Banner Text */}
                <div>
                  <label className="text-xs font-semibold tracking-wider text-stone-600 mb-2 block uppercase">
                    Text Nút Báo Giá Ưu Đãi (Promo Pill Text)
                  </label>
                  <input
                    type="text"
                    value={formData.promoText || ''}
                    onChange={(e) => setFormData({ ...formData, promoText: e.target.value })}
                    placeholder="Ví dụ: Nhận Báo Giá Ưu Đãi 2Tr hoặc Đăng Ký Thử Váy Cưới"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-all outline-none text-sm font-normal"
                  />
                  <p className="text-stone-400 text-xs mt-1.5">
                    * Nội dung thanh thông báo nổi ở góc trên cụm nút liên hệ.
                  </p>
                </div>

                {/* Hotline fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-semibold tracking-wider text-stone-600 mb-2 block uppercase">
                      Số Điện Thoại Raw (tel:)
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.hotline || ''}
                      onChange={(e) => setFormData({ ...formData, hotline: e.target.value })}
                      placeholder="0908123456"
                      className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-all outline-none text-sm font-mono"
                    />
                    <p className="text-stone-400 text-xs mt-1.5">
                      Viết liền không dấu cách (vd: 0908123456).
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold tracking-wider text-stone-600 mb-2 block uppercase">
                      Hotline Hiển Thị Giao Diện
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.hotlineDisplay || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, hotlineDisplay: e.target.value })
                      }
                      placeholder="0908.123.456"
                      className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-all outline-none text-sm font-mono"
                    />
                    <p className="text-stone-400 text-xs mt-1.5">
                      Định dạng có dấu chấm đẹp mắt (vd: 0908.123.456).
                    </p>
                  </div>
                </div>

                {/* Zalo and Messenger */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-semibold tracking-wider text-stone-600 mb-2 block uppercase">
                      Kênh Chat Zalo (Số hoặc URL)
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.zaloUrl || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({
                          ...formData,
                          zaloUrl: val,
                          zaloNumber: val.replace(/[^0-9]/g, '') || formData.zaloNumber,
                        });
                      }}
                      placeholder="https://zalo.me/0908123456 hoặc 0908123456"
                      className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-all outline-none text-sm font-mono"
                    />
                    <p className="text-stone-400 text-xs mt-1.5">
                      Nhập số hoặc link đầy đủ (vd: https://zalo.me/...).
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold tracking-wider text-stone-600 mb-2 block uppercase">
                      Link Chat Facebook Messenger
                    </label>
                    <input
                      type="url"
                      required
                      value={formData.messengerUrl || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, messengerUrl: e.target.value })
                      }
                      placeholder="https://m.me/plusmoments.vn"
                      className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-all outline-none text-sm font-mono"
                    />
                    <p className="text-stone-400 text-xs mt-1.5">
                      Đường dẫn fanpage m.me tiếp nhận tin nhắn.
                    </p>
                  </div>
                </div>

                {/* Address and Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-semibold tracking-wider text-stone-600 mb-2 block uppercase">
                      Địa Chỉ Trụ Sở Studio
                    </label>
                    <input
                      type="text"
                      value={formData.studioAddress || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, studioAddress: e.target.value })
                      }
                      placeholder="123 Đường Hoa Lan, Phường 2, Quận Phú Nhuận, TP.HCM"
                      className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-all outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold tracking-wider text-stone-600 mb-2 block uppercase">
                      Email Tiếp Nhận Khách Hàng
                    </label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="contact@plusmoments.vn"
                      className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-all outline-none text-sm"
                    />
                  </div>
                </div>

                {/* Opening Hours */}
                <div>
                  <label className="text-xs font-semibold tracking-wider text-stone-600 mb-2 block uppercase">
                    Khung Giờ Mở Cửa & Đón Tiếp
                  </label>
                  <input
                    type="text"
                    value={formData.openingHours || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, openingHours: e.target.value })
                    }
                    placeholder="09:00 - 21:00 hàng ngày (Thứ 2 - Chủ Nhật)"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-all outline-none text-sm"
                  />
                </div>

                {/* 1-INPUT SMART GOOGLE MAPS AUTO-CONVERTER */}
                <div className="pt-4 border-t border-stone-200/60 space-y-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-luxury-500" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-800">
                      Bản Đồ Google Maps Trụ Sở & Chỉ Đường
                    </h4>
                  </div>

                  <div>
                    <label className="text-xs font-semibold tracking-wider text-stone-600 mb-2 block uppercase">
                      ĐƯỜNG LINK VỊ TRÍ GOOGLE MAPS CỦA STUDIO
                    </label>
                    <input
                      type="text"
                      value={formData.googleMapsUrl || ''}
                      onChange={(e) => handleGoogleMapsInputChange(e.target.value)}
                      placeholder=""
                      className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-all outline-none text-xs font-mono"
                    />
                    <p className="text-stone-400 text-xs mt-1.5 leading-relaxed">
                      Chỉ cần dán link Google Maps bất kỳ (ví dụ link chia sẻ từ điện thoại https://maps.app.goo.gl/... hoặc https://google.com/maps/place/...). Hệ thống sẽ tự động tạo bản đồ nhúng và link chỉ đường.
                    </p>
                  </div>

                  {/* Live Conversion Preview If Embed URL exists */}
                  {formData.googleMapsEmbedUrl && (
                    <div className="pt-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-stone-700 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Xem trước khung bản đồ (Tông màu tối sang trọng - Footer Preview):</span>
                        </p>
                        {formData.googleMapsShareUrl && (
                          <a
                            href={formData.googleMapsShareUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-luxury-600 hover:text-luxury-700 underline underline-offset-2 flex items-center gap-1"
                          >
                            <span>Thử link chỉ đường ↗</span>
                          </a>
                        )}
                      </div>
                      <div className="w-full max-w-sm h-36 rounded-xl overflow-hidden border border-[#3E3834] bg-[#1A1614] shadow-inner relative group">
                        <iframe
                          src={formData.googleMapsEmbedUrl}
                          width="100%"
                          height="100%"
                          style={{ border: 0, filter: 'contrast(95%) opacity(85%)' }}
                          allowFullScreen={false}
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title="Bản đồ chỉ đường PlusMoments Wedding Studio"
                          className="group-hover:opacity-100 transition duration-300"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: STICKY LIVE PREVIEW WIDGET (32%) */}
            <div className="lg:col-span-4 sticky top-6 space-y-4">
              <div className="bg-white rounded-2xl border border-stone-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-semibold text-stone-900 uppercase tracking-wider">
                      Live Widget Preview
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-400 font-mono">1:1 Scale</span>
                </div>

                <p className="text-xs text-stone-500 font-light leading-relaxed">
                  Góc dưới bên phải màn hình website thật sẽ hiển thị cụm nút liên hệ như sau:
                </p>

                {/* CANVAS SIMULATION OF WEBSITE CORNER */}
                <div className="relative rounded-xl border border-stone-200 bg-[#FAF8F5] p-4 min-h-[320px] flex flex-col justify-end items-end overflow-hidden shadow-inner">
                  {/* Subtle website corner backdrop */}
                  <div className="absolute top-3 left-3 text-[10px] text-stone-300 font-serif uppercase tracking-widest pointer-events-none select-none">
                    PlusMoments Website
                  </div>

                  {/* FLOATING ACTION STACK */}
                  <div className="flex flex-col items-end gap-2.5 z-10 animate-fade-in">
                    {/* Promo Pill Banner */}
                    <div className="px-3.5 py-1.5 bg-gradient-to-r from-luxury-600 via-amber-600 to-luxury-500 text-white rounded-full text-[11px] font-medium shadow-lg flex items-center gap-1.5 max-w-[210px] truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping shrink-0" />
                      <span className="truncate">{formData.promoText || 'Nhận Báo Giá Ưu Đãi 2Tr'}</span>
                    </div>

                    {/* Hotline Action Button */}
                    <div className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-600 text-white rounded-full text-xs font-mono font-medium shadow-md">
                      <PhoneCall className="w-3.5 h-3.5 animate-bounce" />
                      <span>{formData.hotlineDisplay || formData.hotline || '0908.123.456'}</span>
                    </div>

                    {/* Chat Buttons Row */}
                    <div className="flex items-center gap-2">
                      {/* Zalo Button */}
                      <div className="w-8 h-8 rounded-full bg-[#0068FF] text-white flex items-center justify-center text-[10px] font-bold shadow-md">
                        Zalo
                      </div>

                      {/* Messenger Button */}
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00B2FE] via-[#006AFF] to-[#9B51E0] text-white flex items-center justify-center shadow-md">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instant Revalidate Button */}
                <button
                  type="button"
                  onClick={handleSaveContactOnly}
                  disabled={savingContact}
                  className="w-full py-2.5 px-4 rounded-xl border border-stone-200 hover:border-stone-400 bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
                >
                  {savingContact ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang Cập Nhật Cache...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 text-stone-600" />
                      <span>Cập Nhật Nhanh Widget Này</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}



        {/* =========================================================================
            TAB 2: SEO & METADATA (MINIMALIST LUXURY CARDS)
        ========================================================================= */}
        {activeTab === 'seo' && (
          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="font-serif text-lg font-medium text-stone-900">
                Cài Đặt SEO Toàn Trang & Thẻ Mạng Xã Hội
              </h3>
              <p className="text-xs text-stone-400 font-light mt-0.5">
                Thiết lập tiêu đề, mô tả và hình ảnh hiển thị khi chia sẻ link trên Facebook, Zalo, Google.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-semibold tracking-wider text-stone-600 mb-2 block uppercase">
                  Tên Thương Hiệu (Brand Name)
                </label>
                <input
                  type="text"
                  value={formData.siteName || ''}
                  onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                  placeholder="PlusMoments Wedding Studio"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-all outline-none text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold tracking-wider text-stone-600 mb-2 block uppercase">
                  Canonical Base URL
                </label>
                <input
                  type="url"
                  value={formData.canonicalBaseUrl || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, canonicalBaseUrl: e.target.value })
                  }
                  placeholder="https://plusmoments.vn"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-all outline-none text-sm font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold tracking-wider text-stone-600 mb-2 block uppercase">
                Tiêu Đề SEO Mặc Định (Meta Title - Khuyên Dùng 50-60 Ký Tự)
              </label>
              <input
                type="text"
                value={formData.defaultMetaTitle || ''}
                onChange={(e) =>
                  setFormData({ ...formData, defaultMetaTitle: e.target.value })
                }
                placeholder="PlusMoments | Studio Chụp Ảnh Cưới Luxury & Phóng Sự Cưới Cảm Xúc"
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-all outline-none text-sm"
              />
              <p className="text-stone-400 text-xs mt-1.5 font-mono">
                {formData.defaultMetaTitle.length} ký tự
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold tracking-wider text-stone-600 mb-2 block uppercase">
                Mô Tả SEO Mặc Định (Meta Description - Khuyên Dùng 140-160 Ký Tự)
              </label>
              <textarea
                rows={3}
                value={formData.defaultMetaDescription || ''}
                onChange={(e) =>
                  setFormData({ ...formData, defaultMetaDescription: e.target.value })
                }
                placeholder="Studio chụp ảnh cưới cao cấp PlusMoments tại TP.HCM. Phong cách ảnh cưới Pre-Wedding điện ảnh, phóng sự cưới tự nhiên, váy cưới nhập khẩu."
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-all outline-none text-sm resize-none leading-relaxed"
              />
              <p className="text-stone-400 text-xs mt-1.5 font-mono">
                {formData.defaultMetaDescription.length} ký tự
              </p>
            </div>

            <div>
              <SingleImagePicker
                label="Ảnh Đại Diện Chia Sẻ Mạng Xã Hội (Default OpenGraph Image URL)"
                value={formData.defaultOgImage || ''}
                onChange={(url) => setFormData({ ...formData, defaultOgImage: url })}
                aspectRatio="video"
                modalTitle="Chọn Ảnh Chia Sẻ OpenGraph (1200x630)"
                helperText="Ảnh hiển thị khi chia sẻ link website lên Facebook, Zalo, iMessage..."
              />
            </div>

            {/* Google Search Result Preview */}
            <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-1.5">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Search className="w-3.5 h-3.5 text-stone-400" />
                <span>Mô Phỏng Kết Quả Tìm Kiếm Trên Google</span>
              </span>
              <p className="text-xs text-stone-500 font-mono truncate">
                {formData.canonicalBaseUrl || 'https://plusmoments.vn'}
              </p>
              <h4 className="text-base text-blue-700 hover:underline cursor-pointer font-medium leading-snug line-clamp-1">
                {formData.defaultMetaTitle || 'PlusMoments | Studio Chụp Ảnh Cưới Luxury'}
              </h4>
              <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                {formData.defaultMetaDescription ||
                  'Studio chụp ảnh cưới cao cấp PlusMoments tại TP.HCM. Phong cách ảnh cưới Pre-Wedding điện ảnh...'}
              </p>
            </div>
          </div>
        )}



        {/* =========================================================================
            TAB 3: GOOGLE ADS & CONVERSION TRACKING & LANDING PAGES HUB
        ========================================================================= */}
        {activeTab === 'tracking' && (
          <div className="space-y-8">
            {/* 1. GOOGLE ADS & ANALYTICS CONVERSION CODES */}
            <div className="bg-white rounded-2xl border border-stone-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone-100 pb-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-semibold uppercase tracking-wider mb-1">
                    <Target className="w-3 h-3 text-amber-600" />
                    <span>Hệ Thống Đo Lường Toàn Diện</span>
                  </div>
                  <h3 className="font-serif text-lg font-medium text-stone-900">
                    Cấu Hình Google Ads & Đo Lường Chuyển Đổi (Conversion Tags)
                  </h3>
                  <p className="text-xs text-stone-400 font-light mt-0.5">
                    Đo lường 100% tất cả hành động: Gửi form, Bấm gọi Hotline, Bấm chat Zalo/Messenger từ Google Ads.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="/cam-on?leadId=test-preview&name=Kh%C3%A1ch+H%C3%A0ng+M%E1%BA%ABu&phone=0908123456&package=G%C3%B3i+Pre-Wedding+Luxury"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-[11px] font-medium text-stone-700 transition-colors"
                  >
                    <span>Xem Thử /cam-on</span>
                    <ExternalLink className="w-3 h-3 text-stone-400" />
                  </a>
                  <a
                    href="/uu-dai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-[11px] font-semibold text-amber-900 transition-colors"
                  >
                    <span>Xem Trang /uu-dai</span>
                    <ExternalLink className="w-3 h-3 text-amber-600" />
                  </a>
                </div>
              </div>

              {/* Primary IDs: Google Ads ID & GA4 ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-semibold tracking-wider text-stone-700 mb-2 block uppercase">
                    Google Ads Tag ID (gtag.js) <span className="text-amber-600 font-mono">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="AW-1122334455"
                    value={formData.googleAdsId || ''}
                    onChange={(e) => setFormData({ ...formData, googleAdsId: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-all outline-none text-sm font-mono"
                  />
                  <p className="text-[11px] text-stone-400 mt-1 font-light">
                    Lấy trong Google Ads: Công cụ & Cài đặt → Thẻ Google (Ví dụ: AW-1122334455)
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold tracking-wider text-stone-700 mb-2 block uppercase">
                    Google Analytics 4 Measurement ID (GA4)
                  </label>
                  <input
                    type="text"
                    placeholder="G-XXXXXXXXXX"
                    value={formData.googleAnalyticsId || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, googleAnalyticsId: e.target.value })
                    }
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-all outline-none text-sm font-mono"
                  />
                  <p className="text-[11px] text-stone-400 mt-1 font-light">
                    Mã luồng dữ liệu web Google Analytics 4 (Ví dụ: G-AB12CD34EF)
                  </p>
                </div>
              </div>

              {/* GTM Container ID & Default Conversion Value */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-semibold tracking-wider text-stone-700 mb-2 block uppercase">
                    Google Tag Manager Container ID (GTM)
                  </label>
                  <input
                    type="text"
                    placeholder="GTM-XXXXXXX"
                    value={formData.gtmId || ''}
                    onChange={(e) => setFormData({ ...formData, gtmId: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-all outline-none text-sm font-mono"
                  />
                  <p className="text-[11px] text-stone-400 mt-1 font-light">
                    Tùy chọn: Nhập nếu bạn quản lý thẻ nâng cao qua GTM (Ví dụ: GTM-ABC1234)
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold tracking-wider text-stone-700 mb-2 block uppercase">
                    Giá Trị Chuyển Đổi Ước Tính Mỗi Lead (VNĐ)
                  </label>
                  <input
                    type="number"
                    step="10000"
                    placeholder="500000"
                    value={formData.googleAdsConversionValue || 500000}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        googleAdsConversionValue: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-all outline-none text-sm font-mono"
                  />
                  <p className="text-[11px] text-stone-400 mt-1 font-light">
                    Giá trị truyền vào Google Ads để tính ROAS (Mặc định: 500,000đ / Lead)
                  </p>
                </div>
              </div>

              {/* Conversion Labels */}
              <div className="pt-2 border-t border-stone-100">
                <h4 className="text-xs uppercase tracking-wider text-luxury-800 font-semibold mb-4">
                  Nhãn Chuyển Đổi Chi Tiết (Conversion Labels)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-medium text-stone-700 mb-1.5 block">
                      1. Nhãn Gửi Form Tư Vấn / Trang Cảm Ơn (Lead Form Submit)
                    </label>
                    <input
                      type="text"
                      placeholder="AbCdEfGhIjK hoặc AW-1122334455/AbCdEfGhIjK"
                      value={formData.googleAdsLeadLabel || formData.googleAdsConversionLabel || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          googleAdsConversionLabel: e.target.value,
                          googleAdsLeadLabel: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-2.5 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-all outline-none text-xs font-mono"
                    />
                    <p className="text-[10px] text-stone-400 mt-1 font-light">
                      Kích hoạt khi khách hàng gửi form hoặc truy cập trang /cam-on (/tu-van/thanh-cong)
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-stone-700 mb-1.5 block">
                      2. Nhãn Đặt Cọc VietQR / Mua Gói Dịch Vụ (Purchase Conversion)
                    </label>
                    <input
                      type="text"
                      placeholder="AbCdEfGhIjK hoặc AW-1122334455/PurchaseLabel"
                      value={formData.googleAdsPurchaseLabel || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          googleAdsPurchaseLabel: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-2.5 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-all outline-none text-xs font-mono"
                    />
                    <p className="text-[10px] text-stone-400 mt-1 font-light">
                      Kích hoạt khi đơn hàng VietQR được thanh toán thành công (status = PAID)
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-stone-700 mb-1.5 block">
                      3. Nhãn Bấm Gọi Hotline (Phone Call Click)
                    </label>
                    <input
                      type="text"
                      placeholder="AW-1122334455/PhoneClickLabel"
                      value={formData.googleAdsPhoneConversionLabel || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          googleAdsPhoneConversionLabel: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-2.5 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-all outline-none text-xs font-mono"
                    />
                    <p className="text-[10px] text-stone-400 mt-1 font-light">
                      Kích hoạt khi khách bấm vào số điện thoại hoặc nút gọi trên web/mobile
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-stone-700 mb-1.5 block">
                      4. Nhãn Bấm Chat Zalo (Zalo Click)
                    </label>
                    <input
                      type="text"
                      placeholder="AW-1122334455/ZaloClickLabel"
                      value={formData.googleAdsZaloConversionLabel || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          googleAdsZaloConversionLabel: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-2.5 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-all outline-none text-xs font-mono"
                    />
                    <p className="text-[10px] text-stone-400 mt-1 font-light">
                      Kích hoạt khi khách bấm vào nút Chat Zalo nhận catalog & báo giá
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-stone-700 mb-1.5 block">
                      5. Nhãn Bấm Chat Messenger (Messenger Click)
                    </label>
                    <input
                      type="text"
                      placeholder="AW-1122334455/MessengerClickLabel"
                      value={formData.googleAdsMessengerConversionLabel || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          googleAdsMessengerConversionLabel: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-2.5 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-all outline-none text-xs font-mono"
                    />
                    <p className="text-[10px] text-stone-400 mt-1 font-light">
                      Kích hoạt khi khách bấm chat Facebook Messenger
                    </p>
                  </div>
                </div>

                {/* EXACT URLS & EVENTS CHEAT-SHEET FOR GOOGLE ADS */}
                <div className="mt-6 pt-5 border-t border-stone-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-luxury-600" />
                      <h4 className="text-xs uppercase tracking-wider text-stone-900 font-semibold">
                        Bảng Tra Cứu Đường Dẫn & Sự Kiện Chuẩn Google Ads (Cheat-Sheet)
                      </h4>
                    </div>
                    <span className="text-[10px] text-stone-400 font-mono">1-Click Copy</span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-stone-200 bg-stone-50/50">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-stone-200 bg-stone-100/70 text-stone-600 font-medium">
                          <th className="py-2.5 px-3">Mục Tiêu Chuyển Đổi</th>
                          <th className="py-2.5 px-3">Loại Theo Dõi</th>
                          <th className="py-2.5 px-3">Đường Dẫn / Tên Sự Kiện</th>
                          <th className="py-2.5 px-3 text-right">Thao Tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200/60 font-mono text-[11px]">
                        {/* Row 1: Lead Form / Cam-on */}
                        <tr className="hover:bg-white transition-colors">
                          <td className="py-2.5 px-3 font-sans font-medium text-stone-800">
                            1. Hoàn tất đăng ký tư vấn
                          </td>
                          <td className="py-2.5 px-3 font-sans text-stone-500">
                            URL Đích (Destination URL)
                          </td>
                          <td className="py-2.5 px-3 text-luxury-700 font-semibold">
                            {formData.canonicalBaseUrl || 'https://plusmoments.vn'}/cam-on
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                handleCopy(
                                  `${formData.canonicalBaseUrl || 'https://plusmoments.vn'}/cam-on`,
                                  'lead-url'
                                )
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-stone-200 hover:bg-stone-50 text-[10px] font-sans font-medium text-stone-700 shadow-2xs transition-all cursor-pointer"
                            >
                              {copiedKey === 'lead-url' ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span className="text-emerald-700">Đã chép!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3 text-stone-400" />
                                  <span>Sao chép</span>
                                </>
                              )}
                            </button>
                          </td>
                        </tr>

                        {/* Row 1b: Lead Event */}
                        <tr className="hover:bg-white transition-colors">
                          <td className="py-2.5 px-3 font-sans font-medium text-stone-800">
                            ↳ Sự kiện Gửi Lead (Event)
                          </td>
                          <td className="py-2.5 px-3 font-sans text-stone-500">
                            Custom Event / GTM
                          </td>
                          <td className="py-2.5 px-3 text-stone-700">
                            conversion_lead (hoặc generate_lead)
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleCopy('conversion_lead', 'lead-event')}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-stone-200 hover:bg-stone-50 text-[10px] font-sans font-medium text-stone-700 shadow-2xs transition-all cursor-pointer"
                            >
                              {copiedKey === 'lead-event' ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span className="text-emerald-700">Đã chép!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3 text-stone-400" />
                                  <span>Sao chép</span>
                                </>
                              )}
                            </button>
                          </td>
                        </tr>

                        {/* Row 2: Begin Checkout (VietQR Page) */}
                        <tr className="hover:bg-white transition-colors">
                          <td className="py-2.5 px-3 font-sans font-medium text-stone-800">
                            2. Trang tạo & quét mã VietQR
                          </td>
                          <td className="py-2.5 px-3 font-sans text-stone-500">
                            URL Pattern (Bắt đầu thanh toán)
                          </td>
                          <td className="py-2.5 px-3 text-stone-700">
                            {formData.canonicalBaseUrl || 'https://plusmoments.vn'}/thanh-toan/
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                handleCopy(
                                  `${formData.canonicalBaseUrl || 'https://plusmoments.vn'}/thanh-toan/`,
                                  'qr-url'
                                )
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-stone-200 hover:bg-stone-50 text-[10px] font-sans font-medium text-stone-700 shadow-2xs transition-all cursor-pointer"
                            >
                              {copiedKey === 'qr-url' ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span className="text-emerald-700">Đã chép!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3 text-stone-400" />
                                  <span>Sao chép</span>
                                </>
                              )}
                            </button>
                          </td>
                        </tr>

                        {/* Row 3: Purchase Success URL */}
                        <tr className="hover:bg-white transition-colors">
                          <td className="py-2.5 px-3 font-sans font-medium text-stone-800">
                            3. Hoàn tất thanh toán VietQR
                          </td>
                          <td className="py-2.5 px-3 font-sans text-stone-500">
                            URL Hoàn tất (Purchase Success)
                          </td>
                          <td className="py-2.5 px-3 text-emerald-700 font-semibold">
                            {formData.canonicalBaseUrl || 'https://plusmoments.vn'}/thanh-toan/[orderCode]/hoan-tat
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                handleCopy(
                                  `${formData.canonicalBaseUrl || 'https://plusmoments.vn'}/thanh-toan/[orderCode]/hoan-tat`,
                                  'purchase-url'
                                )
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-stone-200 hover:bg-stone-50 text-[10px] font-sans font-medium text-stone-700 shadow-2xs transition-all cursor-pointer"
                            >
                              {copiedKey === 'purchase-url' ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span className="text-emerald-700">Đã chép!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3 text-stone-400" />
                                  <span>Sao chép</span>
                                </>
                              )}
                            </button>
                          </td>
                        </tr>

                        {/* Row 3b: Purchase Event */}
                        <tr className="hover:bg-white transition-colors">
                          <td className="py-2.5 px-3 font-sans font-medium text-stone-800">
                            ↳ Sự kiện Mua Gói (Purchase Event)
                          </td>
                          <td className="py-2.5 px-3 font-sans text-stone-500">
                            gtag.js / GTM E-commerce
                          </td>
                          <td className="py-2.5 px-3 text-stone-700">
                            conversion_purchase (kèm value tiền cọc)
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleCopy('conversion_purchase', 'purchase-event')}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-stone-200 hover:bg-stone-50 text-[10px] font-sans font-medium text-stone-700 shadow-2xs transition-all cursor-pointer"
                            >
                              {copiedKey === 'purchase-event' ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span className="text-emerald-700">Đã chép!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3 text-stone-400" />
                                  <span>Sao chép</span>
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. THANK YOU PAGE SETTINGS (/cam-on) */}
            <div className="bg-white rounded-2xl border border-stone-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div>
                  <h3 className="font-serif text-lg font-medium text-stone-900 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Trang Đích Cảm Ơn & Xác Nhận Đặt Lịch (/cam-on)</span>
                  </h3>
                  <p className="text-xs text-stone-400 font-light mt-0.5">
                    Trang chuyển tiếp sau khi gửi form để Google Ads đo lường 100% tỷ lệ chuyển đổi (Destination URL Conversion).
                  </p>
                </div>

                <a
                  href="/cam-on?leadId=demo&name=Thu+Th%E1%BA%A3o&phone=0908123456&package=G%C3%B3i+Pre-Wedding+Studio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-luxury-700 hover:text-luxury-900 font-medium inline-flex items-center gap-1"
                >
                  <span>Mở xem trước</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Toggle redirect */}
              <label className="flex items-center gap-3 p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.redirectOnSubmit !== false}
                  onChange={(e) =>
                    setFormData({ ...formData, redirectOnSubmit: e.target.checked })
                  }
                  className="w-4 h-4 text-luxury-600 accent-luxury-600 rounded cursor-pointer"
                />
                <div>
                  <span className="text-xs font-medium text-stone-900 block">
                    Tự Động Chuyển Hướng Sang Trang Cảm Ơn Sau Khi Khách Điền Form (Khuyên dùng)
                  </span>
                  <span className="text-[11px] text-stone-500 font-light block">
                    Giúp Google Ads và GA4 đo lường chính xác chuyển đổi qua URL đích (`/cam-on`), tránh bị chặn bởi ad blockers.
                  </span>
                </div>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-semibold tracking-wider text-stone-700 mb-2 block uppercase">
                    Tiêu Đề Trang Cảm Ơn
                  </label>
                  <input
                    type="text"
                    value={formData.thankYouTitle || ''}
                    onChange={(e) => setFormData({ ...formData, thankYouTitle: e.target.value })}
                    placeholder="Đặt Lịch Tư Vấn Thành Công!"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-2.5 text-stone-900 text-xs focus:bg-white focus:border-stone-800 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold tracking-wider text-stone-700 mb-2 block uppercase">
                    Mã Voucher Ưu Đãi Độc Quyền
                  </label>
                  <input
                    type="text"
                    value={formData.thankYouVoucherCode || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, thankYouVoucherCode: e.target.value })
                    }
                    placeholder="PLUSMOMENTS-2TR"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-2.5 text-stone-900 text-xs font-mono font-bold focus:bg-white focus:border-stone-800 transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold tracking-wider text-stone-700 mb-2 block uppercase">
                  Nội Dung Lời Cảm Ơn & Hướng Dẫn
                </label>
                <textarea
                  rows={2}
                  value={formData.thankYouMessage || ''}
                  onChange={(e) => setFormData({ ...formData, thankYouMessage: e.target.value })}
                  placeholder="Cảm ơn bạn đã tin tưởng PlusMoments..."
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-2.5 text-stone-900 text-xs focus:bg-white focus:border-stone-800 transition-all outline-none leading-relaxed"
                />
              </div>
            </div>

            {/* 3. PROMOTIONAL LANDING PAGE SETTINGS (/uu-dai) */}
            <div className="bg-white rounded-2xl border border-stone-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div>
                  <h3 className="font-serif text-lg font-medium text-stone-900 flex items-center gap-2">
                    <Gift className="w-5 h-5 text-amber-600" />
                    <span>Trang Đích Chiến Dịch Quảng Cáo Google Ads (/uu-dai)</span>
                  </h3>
                  <p className="text-xs text-stone-400 font-light mt-0.5">
                    Trang đích chuyên biệt tối ưu điểm chất lượng Google Ads (Quality Score), tỉ lệ chuyển đổi cao (CRO).
                  </p>
                </div>

                <a
                  href="/uu-dai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-amber-800 hover:text-amber-950 font-semibold inline-flex items-center gap-1 px-3 py-1 bg-amber-50 border border-amber-200 rounded-lg"
                >
                  <span>Mở Trang /uu-dai</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-semibold tracking-wider text-stone-700 mb-2 block uppercase">
                    Tiêu Đề Chiến Dịch Ads
                  </label>
                  <input
                    type="text"
                    value={formData.landingPageTitle || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, landingPageTitle: e.target.value })
                    }
                    placeholder="Ưu Đãi Mùa Cưới 2025 - Tặng Gói Make-Up & Xe Rước Dâu"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-2.5 text-stone-900 text-xs focus:bg-white focus:border-stone-800 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold tracking-wider text-stone-700 mb-2 block uppercase">
                    Số Tiền Giảm Giá Ưu Đãi
                  </label>
                  <input
                    type="text"
                    value={formData.landingPageDiscountAmount || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, landingPageDiscountAmount: e.target.value })
                    }
                    placeholder="2.000.000đ"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-2.5 text-stone-900 text-xs font-bold text-amber-900 focus:bg-white focus:border-stone-800 transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold tracking-wider text-stone-700 mb-2 block uppercase">
                  Mô Tả Quyền Lợi Nổi Bật (Subtitle)
                </label>
                <textarea
                  rows={2}
                  value={formData.landingPageSubtitle || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, landingPageSubtitle: e.target.value })
                  }
                  placeholder="Đặc quyền dành riêng cho cặp đôi đăng ký trực tuyến hôm nay..."
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-2.5 text-stone-900 text-xs focus:bg-white focus:border-stone-800 transition-all outline-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-semibold tracking-wider text-stone-700 mb-2 block uppercase">
                    Số Suất Ưu Đãi Còn Lại (Hiệu ứng khan hiếm)
                  </label>
                  <input
                    type="number"
                    value={formData.landingPageSlotsRemaining || 5}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        landingPageSlotsRemaining: Number(e.target.value) || 0,
                      })
                    }
                    placeholder="5"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-2.5 text-stone-900 text-xs focus:bg-white focus:border-stone-800 transition-all outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold tracking-wider text-stone-700 mb-2 block uppercase">
                    Thời Hạn / Điều Kiện Áp Dụng
                  </label>
                  <input
                    type="text"
                    value={formData.landingPageDeadline || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, landingPageDeadline: e.target.value })
                    }
                    placeholder="Áp dụng cho 10 cặp đôi đầu tiên trong tuần này"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-2.5 text-stone-900 text-xs focus:bg-white focus:border-stone-800 transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 4. OTHER SOCIAL PIXELS & CUSTOM SCRIPTS */}
            <div className="bg-white rounded-2xl border border-stone-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="font-serif text-lg font-medium text-stone-900">
                  Meta Pixel, TikTok Pixel & Custom Scripts
                </h3>
                <p className="text-xs text-stone-400 font-light mt-0.5">
                  Theo dõi tiếp thị lại (Retargeting) trên Facebook và TikTok.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-semibold tracking-wider text-stone-600 mb-2 block uppercase">
                    Facebook Meta Pixel ID
                  </label>
                  <input
                    type="text"
                    placeholder="123456789012345"
                    value={formData.metaPixelId || ''}
                    onChange={(e) => setFormData({ ...formData, metaPixelId: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-all outline-none text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold tracking-wider text-stone-600 mb-2 block uppercase">
                    TikTok Pixel ID
                  </label>
                  <input
                    type="text"
                    placeholder="C1234567890TIKTOK"
                    value={formData.tiktokPixelId || ''}
                    onChange={(e) => setFormData({ ...formData, tiktokPixelId: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-all outline-none text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold tracking-wider text-stone-600 mb-2 block uppercase">
                  Mã Tùy Biến Chèn Vào Thẻ &lt;head&gt; (Custom HTML/JS Script)
                </label>
                <textarea
                  rows={3}
                  value={formData.customHeadScript || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, customHeadScript: e.target.value })
                  }
                  placeholder="<!-- Thêm mã script như Hotjar, Microsoft Clarity, Chatbot... -->"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-all outline-none text-xs font-mono leading-relaxed"
                />
              </div>

              <div>
                <label className="text-xs font-semibold tracking-wider text-stone-600 mb-2 block uppercase">
                  Mã Tùy Biến Chèn Vào Thẻ &lt;body&gt; (Custom Body Script)
                </label>
                <textarea
                  rows={3}
                  value={formData.customBodyScript || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, customBodyScript: e.target.value })
                  }
                  placeholder="<!-- Thêm mã script chạy sau body... -->"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-all outline-none text-xs font-mono leading-relaxed"
                />
              </div>
            </div>

            {/* 5. STEP-BY-STEP GOOGLE ADS SETUP GUIDE */}
            <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 sm:p-8 space-y-4">
              <h4 className="font-serif text-lg font-medium text-champagne-light flex items-center gap-2">
                <Compass className="w-5 h-5 text-champagne-light" />
                <span>Hướng Dẫn 2 Phút Cài Đặt Mục Tiêu Chuyển Đổi Trên Google Ads</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-light text-stone-300 leading-relaxed">
                <div className="p-4 bg-stone-800/80 rounded-xl border border-stone-700/80 space-y-1.5">
                  <p className="font-medium text-white flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[11px] font-bold flex items-center justify-center">1</span>
                    Cách 1: Đo Lường Bằng URL Đích (Khuyên Dùng - Chuẩn 100%)
                  </p>
                  <p>
                    Vào <strong>Google Ads → Mục tiêu → Lượt chuyển đổi → Thao tác chuyển đổi mới</strong>:
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-stone-300">
                    <li>Chọn Trang web → Nhập tên miền `plusmoments.vn`.</li>
                    <li>Thêm chuyển đổi thủ công: Danh mục <strong>Người liên hệ / Khách hàng tiềm năng (Lead)</strong>.</li>
                    <li>Quy tắc kích hoạt: URL chứa <strong>`/cam-on`</strong>.</li>
                    <li>Xong! Google Ads sẽ tự động đếm 1 chuyển đổi mỗi khi có người hoàn tất điền form.</li>
                  </ul>
                </div>

                <div className="p-4 bg-stone-800/80 rounded-xl border border-stone-700/80 space-y-1.5">
                  <p className="font-medium text-white flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-luxury-600 text-white text-[11px] font-bold flex items-center justify-center">2</span>
                    Cách 2: Đo Lường Qua Mã Nhãn Chuyển Đổi (Conversion Label)
                  </p>
                  <p>
                    Tạo chuyển đổi theo sự kiện trong Google Ads:
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-stone-300">
                    <li>Sau khi tạo hành động chuyển đổi, chọn <strong>Xem đoạn mã sự kiện (Event snippet)</strong>.</li>
                    <li>Copy đoạn `AW-XXXXXXXXX/AbCdEfGhIjK` dán vào ô <strong>Nhãn Gửi Form / Gọi Hotline / Chat Zalo</strong> ở trên.</li>
                    <li>Hệ thống PlusMoments sẽ tự động gửi sự kiện về Google Ads ngay khi khách click hoặc submit!</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}



        {/* =========================================================================
            TAB 4: GOOGLE DRIVE INTEGRATION
        ========================================================================= */}
        {activeTab === 'drive' && (
          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="font-serif text-lg font-medium text-stone-900">
                Tích Hợp Google Drive & Nén Ảnh Chuẩn WebP
              </h3>
              <p className="text-xs text-stone-400 font-light mt-0.5">
                Cấu hình liên kết Google Drive để duyệt ảnh trực tiếp và chuyển đổi sang WebP chất lượng cao trên máy chủ.
              </p>
            </div>

            {/* Architecture Explanatory Box */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
              <div className="flex items-center gap-2 text-stone-800 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-luxury-600" />
                <span>Quy Trình Tối Ưu Nén WebP Tự Động</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed font-light">
                1. <strong>Chọn thư mục / file</strong>: Chọn cả thư mục hoặc từng ảnh trực tiếp từ Drive Picker.<br />
                2. <strong>Xử lý RAM Stream</strong>: Tải dữ liệu nhị phân gốc trực tiếp vào bộ nhớ RAM máy chủ.<br />
                3. <strong>Nén Sharp WebP</strong>: Nén ảnh máy cơ 20MB - 30MB thành file WebP siêu nét 200KB - 400KB.<br />
                4. <strong>Lưu trữ & Phục vụ</strong>: Lưu trữ tại <code>/public/uploads/</code> và đồng bộ vào Media Library.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-xs font-semibold tracking-wider text-stone-600 mb-2 block uppercase">
                  Đường Dẫn Thư Mục Google Drive (Drive Folder URL) <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="url"
                    required
                    value={formData.driveFolderUrl || ''}
                    onChange={(e) => handleDriveUrlChange(e.target.value)}
                    placeholder="https://drive.google.com/drive/folders/1A2b3C4d5E6f7G8h9I0jKlMnOp"
                    className="flex-1 rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-all outline-none text-sm font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleTestDrive}
                    disabled={testingDrive}
                    className="px-5 py-3 bg-stone-900 hover:bg-stone-800 active:scale-95 text-white rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-60 shrink-0"
                  >
                    {testingDrive ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang Quét...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 text-luxury-400" />
                        <span>Kiểm Tra Kết Nối</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Parsed Folder ID */}
              <div>
                <label className="text-xs font-semibold tracking-wider text-stone-600 mb-2 block uppercase">
                  Folder ID Được Trích Xuất Tự Động
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={formData.driveFolderId || ''}
                    onChange={(e) => setFormData({ ...formData, driveFolderId: e.target.value })}
                    className="flex-1 rounded-xl border border-stone-200 bg-stone-100 px-4 py-3 text-stone-700 font-mono text-sm outline-none"
                  />
                  {formData.driveFolderId && (
                    <a
                      href={`https://drive.google.com/drive/folders/${formData.driveFolderId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-3 text-xs text-stone-700 hover:text-stone-950 bg-stone-50 hover:bg-stone-100 rounded-xl border border-stone-200 font-medium flex items-center gap-1.5 transition-colors shrink-0"
                    >
                      <span>Mở Trên Drive</span>
                      <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                    </a>
                  )}
                </div>
              </div>

              {/* Test Result Alert */}
              {driveTestResult && (
                <div
                  className={`p-4 rounded-xl text-xs flex items-start gap-3 border ${
                    driveTestResult.success
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                      : 'bg-red-50 text-red-800 border-red-200'
                  }`}
                >
                  {driveTestResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="font-semibold">
                      {driveTestResult.success
                        ? `Kết nối thành công! Tìm thấy ${driveTestResult.count} file ảnh trong thư mục Drive.`
                        : `Lỗi kết nối: ${driveTestResult.error}`}
                    </p>
                    {driveTestResult.warning && (
                      <p className="text-[11px] text-amber-800 italic">{driveTestResult.warning}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Optional Google Drive API Key */}
              <div>
                <label className="text-xs font-semibold tracking-wider text-stone-600 mb-2 block uppercase">
                  Google Drive API Key (Tùy Chọn - Thư Mục Nội Bộ)
                </label>
                <input
                  type="password"
                  value={formData.googleDriveApiKey || ''}
                  onChange={(e) => setFormData({ ...formData, googleDriveApiKey: e.target.value })}
                  placeholder="AIzaSy..."
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-all outline-none text-sm font-mono"
                />
                <p className="text-stone-400 text-xs mt-1.5">
                  Nếu thư mục Drive được cài đặt "Bất kỳ ai có đường liên kết đều có thể xem", hệ thống có thể đọc file trực tiếp.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB: GOOGLE GEMINI AI ASSISTANT CONFIGURATION (SUPER_ADMIN ONLY)
        ========================================================================= */}
        {currentUserRole === 'SUPER_ADMIN' && activeTab === 'gemini' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-stone-200 bg-white p-6 md:p-8 shadow-xs space-y-6">
              {/* Header */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-stone-100">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-luxury-50 text-luxury-700 border border-luxury-200/60">
                      <Bot className="w-5 h-5 text-luxury-600" />
                    </span>
                    <h3 className="font-serif text-lg font-medium text-stone-900">
                      Cấu Hình Trí Tuệ Nhân Tạo Google Gemini (AI Assistant)
                    </h3>
                  </div>
                  <p className="text-xs text-stone-500 font-light leading-relaxed">
                    Tích hợp trực tiếp Google Generative AI API để tự động hóa viết bài blog chuẩn SEO, sáng tác câu chuyện tình yêu cho album cưới, đề xuất điểm nhấn gói giá và soạn thảo tin nhắn tư vấn khách hàng theo chuẩn giọng văn điện ảnh của PlusMoments.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="https://aistudio.google.com/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <span>Lấy API Key Miễn Phí</span>
                    <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                  </a>
                </div>
              </div>

              {/* Status / Sync Feedback */}
              {modelsSyncSuccess && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{modelsSyncSuccess}</span>
                </div>
              )}

              {modelsSyncError && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2.5 animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{modelsSyncError}</span>
                </div>
              )}

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* API Key */}
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-xs font-medium uppercase tracking-wider text-stone-700">
                    Google Gemini API Key <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <input
                        type={showGeminiKey ? 'text' : 'password'}
                        value={formData.geminiApiKey}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, geminiApiKey: e.target.value }))
                        }
                        placeholder="AIzaSy..."
                        className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-luxury-400 font-mono tracking-wider pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowGeminiKey(!showGeminiKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                        title={showGeminiKey ? 'Ẩn API Key' : 'Hiện API Key'}
                      >
                        {showGeminiKey ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleSyncModels}
                      disabled={syncingModels || !formData.geminiApiKey.trim()}
                      className="px-5 py-2.5 rounded-xl bg-luxury-900 hover:bg-black text-white text-xs font-medium uppercase tracking-wider transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50 shadow-xs"
                    >
                      {syncingModels ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Đang Kết Nối Google...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 text-luxury-400" />
                          <span>Kiểm Tra & Đồng Bộ Danh Sách Model</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-stone-400 font-light">
                    API Key được bảo mật trên máy chủ, sử dụng cho các tác vụ sinh nội dung văn bản tự động của studio.
                  </p>
                </div>

                {/* Active Model Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium uppercase tracking-wider text-stone-700">
                    Mô Hình AI Kích Hoạt (Active Model)
                  </label>
                  <select
                    value={formData.geminiModel}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, geminiModel: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-luxury-400 font-medium cursor-pointer"
                  >
                    {availableGeminiModels.length > 0 ? (
                      availableGeminiModels.map((m) => {
                        const isFlash = m.id.toLowerCase().includes('flash');
                        return (
                          <option key={m.id} value={m.id}>
                            {isFlash ? '⚡ [Khuyên Dùng Free Tier] ' : ''}
                            {m.displayName || m.id} ({m.id})
                          </option>
                        );
                      })
                    ) : (
                      <>
                        <option value={formData.geminiModel}>
                          {formData.geminiModel} (Hiện tại)
                        </option>
                        <option value="gemini-2.5-flash">⚡ [Khuyên Dùng Free Tier] Gemini 2.5 Flash</option>
                        <option value="gemini-2.0-flash">⚡ [Khuyên Dùng Free Tier] Gemini 2.0 Flash</option>
                        <option value="gemini-1.5-flash">⚡ [Khuyên Dùng Free Tier] Gemini 1.5 Flash</option>
                        <option value="gemini-2.5-pro">Gemini 2.5 Pro (Hạn mức Free Tier hạn chế)</option>
                      </>
                    )}
                  </select>
                  <div className="p-2.5 bg-amber-50/80 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                    <span className="text-amber-600 font-bold shrink-0">💡 Khuyến nghị:</span>
                    <span>Chọn các dòng <strong>Flash</strong> (ví dụ: <em>gemini-2.5-flash</em>, <em>gemini-2.0-flash</em>) để sử dụng ổn định trên gói Free Tier không bị giới hạn quota (tránh các model Pro bị limit 0).</span>
                  </div>
                  <p className="text-[11px] text-stone-400 font-light">
                    {availableGeminiModels.length > 0
                      ? `Đang hiển thị ${availableGeminiModels.length} model khả dụng từ tài khoản Google của bạn.`
                      : 'Bấm nút "Kiểm Tra & Đồng Bộ" ở trên để nạp danh sách model mới nhất từ Google.'}
                  </p>
                </div>

                {/* Brand Tone Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium uppercase tracking-wider text-stone-700">
                    Giọng Văn Thương Hiệu (Brand Tone)
                  </label>
                  <select
                    value={formData.geminiTone}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, geminiTone: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-luxury-400 font-medium cursor-pointer"
                  >
                    <option value="LUXURY_CINEMATIC">
                      Sang Trọng & Điện Ảnh (Luxury & Cinematic Art - Chuẩn PlusMoments)
                    </option>
                    <option value="ROMANTIC_POETIC">
                      Lãng Mạn, Thơ Mộng & Sâu Lắng (Romantic & Poetic)
                    </option>
                    <option value="MINIMALIST_MODERN">
                      Tinh Tế, Tối Giản & Hiện Đại (Minimalist Editorial)
                    </option>
                    <option value="WARM_INTIMATE">
                      Chân Thành, Ấm Áp & Thân Mật (Warm & Caring Friend)
                    </option>
                  </select>
                  <p className="text-[11px] text-stone-400 font-light">
                    Định hình phong cách ngôn ngữ cho các bài viết cẩm nang và câu chuyện tình yêu.
                  </p>
                </div>

                {/* Temperature Slider */}
                <div className="md:col-span-2 space-y-2 pt-2 border-t border-stone-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-luxury-600" />
                      <span>Mức Độ Sáng Tạo & Linh Hoạt (Temperature):</span>
                    </label>
                    <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-md bg-stone-100 text-stone-900 border border-stone-200">
                      {formData.geminiTemperature}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0.2"
                    max="1.0"
                    step="0.05"
                    value={formData.geminiTemperature}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        geminiTemperature: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-luxury-700"
                  />

                  <div className="flex flex-wrap items-center justify-between text-[11px] text-stone-400 pt-1">
                    <span>0.2 (Chặt chẽ, sát thực tế)</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, geminiTemperature: 0.3 }))}
                        className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                      >
                        0.3 Thực tế
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, geminiTemperature: 0.7 }))}
                        className="px-2 py-0.5 rounded bg-luxury-100 hover:bg-luxury-200 text-luxury-800 font-medium transition-colors"
                      >
                        0.7 Chuẩn Studio
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, geminiTemperature: 0.9 }))}
                        className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                      >
                        0.9 Bay bổng
                      </button>
                    </div>
                    <span>1.0 (Giàu trí tưởng tượng)</span>
                  </div>
                </div>
              </div>

              {/* Live Test Studio Engine */}
              <div className="pt-6 border-t border-stone-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-medium uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-luxury-600" />
                      <span>Thử Nghiệm Sinh Nội Dung Studio (Interactive Sandbox)</span>
                    </h4>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      Chạy thử nghiệm tạo một câu chuyện tình yêu cho concept "Hoàng Hôn Tình Yêu" tại Đà Lạt để đánh giá văn phong.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleTestGemini}
                    disabled={testingGemini || !formData.geminiApiKey.trim()}
                    className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {testingGemini ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>AI Đang Soạn Thảo...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-luxury-600" />
                        <span>Chạy Thử Nghiệm Prompt</span>
                      </>
                    )}
                  </button>
                </div>

                {geminiTestResult && (
                  <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-2 animate-fade-in">
                    <span className="font-semibold text-stone-900 block font-serif">
                      ✨ Kết quả sinh thử nghiệm ({formData.geminiModel}):
                    </span>
                    <p className="text-stone-700 whitespace-pre-wrap leading-relaxed font-light italic">
                      "{geminiTestResult}"
                    </p>
                  </div>
                )}
              </div>

              {/* Seed Snapshot Notice */}
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-3">
                <Database className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-semibold block">Tự Động Lưu Vào Snapshot Mockup Seed</span>
                  <p className="text-[11px] text-amber-800 leading-relaxed font-light">
                    Khi bạn bấm nút <strong>"Lưu Thay Đổi & Cập Nhật Hệ Thống"</strong> ở cuối trang, toàn bộ cấu hình API Key, Model được chọn, Temperature và Tone giọng văn sẽ tự động được đóng gói vào <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">prisma/seed.ts</code>. Khi deploy sang máy chủ VPS mới, chỉ cần chạy seed là toàn bộ cấu hình AI sẽ tự hoạt động mà không cần nhập lại.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB: SYSTEM & VPS PERSISTENT SEED SNAPSHOT & MAINTENANCE (SUPER_ADMIN ONLY)
        ========================================================================= */}
        {currentUserRole === 'SUPER_ADMIN' && activeTab === 'system' && (
          <div className="space-y-6">
            {/* MAINTENANCE MODE CARD */}
            <div className={`rounded-2xl border p-6 md:p-8 shadow-xs transition-colors ${
              formData.isMaintenanceMode
                ? 'bg-amber-50/40 border-amber-300'
                : 'bg-white border-stone-200'
            }`}>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-stone-100">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className={`p-2 rounded-xl border ${
                      formData.isMaintenanceMode
                        ? 'bg-amber-100 text-amber-700 border-amber-300'
                        : 'bg-stone-100 text-stone-600 border-stone-200'
                    }`}>
                      <Wrench className="w-5 h-5" />
                    </span>
                    <h2 className="text-lg font-serif font-medium text-stone-900">
                      Chế Độ Bảo Trì Toàn Hệ Thống (Maintenance Mode)
                    </h2>
                    {formData.isMaintenanceMode && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold tracking-widest uppercase animate-pulse">
                        Đang Kích Hoạt
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 font-light leading-relaxed">
                    Khi kích hoạt, toàn bộ khách truy cập bên ngoài frontend sẽ thấy giao diện thông báo nâng cấp sang trọng. Chỉ duy nhất các phiên đăng nhập Quản Trị Viên mới có thể vượt qua để duyệt và xem trước website.
                  </p>
                </div>

                {/* Maintenance Toggle Switch */}
                {currentUserRole === 'SUPER_ADMIN' ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (!formData.isMaintenanceMode) {
                        if (!confirm('XÁC NHẬN BẬT BẢO TRÌ:\nKhách hàng công khai sẽ tạm thời không thể xem website. Bạn có chắc chắn muốn kích hoạt ngay?')) {
                          return;
                        }
                      }
                      setFormData((prev) => ({
                        ...prev,
                        isMaintenanceMode: !prev.isMaintenanceMode,
                      }));
                    }}
                    className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      formData.isMaintenanceMode ? 'bg-amber-600' : 'bg-stone-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        formData.isMaintenanceMode ? 'translate-x-7' : 'translate-x-0'
                      }`}
                    />
                  </button>
                ) : (
                  <div className="px-3 py-1.5 rounded-xl bg-stone-100 border border-stone-200 text-stone-500 text-xs flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-stone-400" />
                    <span>Yêu cầu quyền Super Admin</span>
                  </div>
                )}
              </div>

              {/* Maintenance Notice Input */}
              <div className="mt-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-stone-700 tracking-wide">
                    Thông Điệp Thông Báo Cho Khách Hàng (Maintenance Notice)
                  </label>
                  <textarea
                    rows={3}
                    disabled={currentUserRole !== 'SUPER_ADMIN'}
                    value={formData.maintenanceNotice}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        maintenanceNotice: e.target.value,
                      }))
                    }
                    placeholder="PlusMoments đang tiến hành nâng cấp hệ thống định kỳ. Chúng tôi sẽ trở lại trong ít phút."
                    className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-luxury-600 disabled:opacity-60"
                  />
                  <p className="text-[11px] text-stone-400 font-light">
                    Đoạn văn này sẽ hiển thị trực tiếp ở trung tâm trang thông báo bảo trì công khai.
                  </p>
                </div>

                {formData.isMaintenanceMode && (
                  <div className="p-4 rounded-xl bg-amber-100/70 border border-amber-300/80 text-amber-900 text-xs flex items-start gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-semibold">Lưu ý khi Chế độ Bảo trì đang Bật:</p>
                      <p className="text-[11px] text-amber-800 font-light leading-relaxed">
                        - Khách vãng lai và công cụ tìm kiếm chỉ nhìn thấy trang bảo trì và các nút gọi Hotline/Zalo khẩn cấp.<br />
                        - Khi duyệt website ngoài frontend, bạn sẽ thấy dải thông báo màu vàng ở đầu trang cho biết bạn đang duyệt với tư cách Quản trị viên.<br />
                        - Đừng quên bấm nút <strong>"Lưu Thay Đổi & Cập Nhật Hệ Thống"</strong> ở cuối trang để áp dụng trạng thái này vào cơ sở dữ liệu.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SEED EXPORT CARD */}
            <div className="rounded-2xl border border-stone-200 bg-white p-6 md:p-8 shadow-xs">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-stone-100">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60">
                      <Database className="w-5 h-5" />
                    </span>
                    <h2 className="text-lg font-serif font-medium text-stone-900">
                      Đóng Gói Dữ Liệu Lên VPS (Database Snapshot to Code)
                    </h2>
                  </div>
                  <p className="text-xs text-stone-500 font-light leading-relaxed">
                    Lưu toàn bộ dữ liệu bạn đã nhập trên máy hiện tại thành bộ dữ liệu mặc định của mã nguồn. Khi đưa code lên VPS hoặc sang máy khác, hệ thống sẽ tự động dùng bộ dữ liệu này mà không cần nhập lại bằng tay.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleExportSeed}
                  disabled={exportingSeed}
                  className="px-6 py-3.5 bg-gradient-to-r from-stone-900 to-stone-800 hover:from-stone-800 hover:to-stone-700 active:scale-95 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {exportingSeed ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-luxury-400" />
                      <span>Đang Đóng Gói Dữ Liệu...</span>
                    </>
                  ) : (
                    <>
                      <PackageCheck className="w-4 h-4 text-luxury-400" />
                      <span>📦 Lưu Dữ Liệu Hiện Tại Thành Mockup Gốc (Export to Seed)</span>
                    </>
                  )}
                </button>
              </div>

              {seedExportSuccess && (
                <div className="mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-3 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold">{seedExportSuccess}</p>
                    <p className="text-[11px] text-emerald-700/80">
                      Hai tệp <span className="font-mono font-medium">prisma/seed.ts</span> và <span className="font-mono font-medium">prisma/seed.js</span> đã được cập nhật thành công. Khi chuyển mã nguồn lên VPS, hệ thống sẽ nạp lại chính xác bộ dữ liệu này.
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs text-stone-600">
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1.5">
                  <span className="font-semibold text-stone-900 flex items-center gap-1.5">
                    <FileCode2 className="w-4 h-4 text-luxury-600" />
                    <span>Tệp Seed Tự Động</span>
                  </span>
                  <p className="text-[11px] text-stone-500 font-mono">prisma/seed.ts & prisma/seed.js</p>
                  <p className="text-[11px] text-stone-500">
                    Được tạo tự động, lưu trực tiếp cấu hình CMS, gói giá, album và bài viết blog.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1.5">
                  <span className="font-semibold text-stone-900 flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-luxury-600" />
                    <span>Lệnh Khởi Tạo Trên VPS</span>
                  </span>
                  <p className="text-[11px] text-stone-500 font-mono">npm run db:restore-seed</p>
                  <p className="text-[11px] text-stone-500">
                    Hoặc <span className="font-mono">npx prisma db seed</span> để nạp dữ liệu snapshot vào PostgreSQL trên VPS.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1.5">
                  <span className="font-semibold text-stone-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-luxury-600" />
                    <span>Cơ Chế An Toàn</span>
                  </span>
                  <p className="text-[11px] text-stone-500 font-mono">Prisma Upsert Logic</p>
                  <p className="text-[11px] text-stone-500">
                    Tự động đồng bộ và cập nhật, không làm trùng lặp dữ liệu khi chạy lại nhiều lần.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* BOTTOM SAVE BAR */}
        <div className="flex items-center justify-end pt-4 border-t border-stone-200/80">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-luxury-400" />
                <span>Đang Lưu Cấu Hình...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-luxury-400" />
                <span>Lưu Thay Đổi & Cập Nhật Hệ Thống</span>
              </>
            )}
          </button>
        </div>
      </form>
      )}
    </div>
  );
}
