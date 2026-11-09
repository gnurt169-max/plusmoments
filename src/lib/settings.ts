import { prisma } from './prisma';

export async function getSystemSettings() {
  try {
    let settings = await prisma.systemSetting.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      settings = await prisma.systemSetting.create({
        data: { id: 'default' },
      });
    }

    return settings;
  } catch (error) {
    console.error('Error fetching system settings:', error);
    // Return safe fallback values if database is temporarily unavailable
    return {
      id: 'default',
      siteName: 'PlusMoments Wedding Studio',
      tagline: 'Kể câu chuyện tình yêu bằng ngôn ngữ nhiếp ảnh điện ảnh',
      defaultMetaTitle: 'PlusMoments | Studio Chụp Ảnh Cưới Luxury & Phóng Sự Cưới Cảm Xúc',
      defaultMetaDescription:
        'Studio chụp ảnh cưới cao cấp PlusMoments tại TP.HCM. Phong cách ảnh cưới Pre-Wedding điện ảnh, phóng sự cưới tự nhiên, váy cưới nhập khẩu.',
      defaultOgImage: '',
      canonicalBaseUrl: 'https://plusmoments.vn',
      isMaintenanceMode: false,
      maintenanceNotice:
        'PlusMoments đang tiến hành nâng cấp hệ thống định kỳ. Chúng tôi sẽ trở lại trong ít phút.',
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
      customHeadScript: null,
      customBodyScript: null,

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
      hotline: '0908123456',
      hotlineDisplay: '0908.123.456',
      zaloNumber: '0908123456',
      zaloUrl: 'https://zalo.me/0908123456',
      messengerUrl: 'https://m.me/plusmoments.vn',
      promoText: 'Nhận Báo Giá Ưu Đãi 2Tr',
      email: 'hello@plusmoments.vn',
      studioAddress: '123 Đường Hoa Lan, Phường 2, Quận Phú Nhuận, TP. Hồ Chí Minh',
      googleMapsUrl: 'https://maps.google.com',
      googleMapsEmbedUrl: null,
      googleMapsShareUrl: null,
      openingHours: '09:00 - 21:00 hàng ngày',
      facebookUrl: 'https://facebook.com/plusmoments.vn',
      instagramUrl: 'https://instagram.com/plusmoments.vn',
      tiktokUrl: 'https://tiktok.com/@plusmoments.vn',
      youtubeUrl: 'https://youtube.com/@plusmoments.vn',
      driveFolderUrl: '',
      driveFolderId: '',
      googleDriveApiKey: '',
      bankBin: '970436',
      bankShortName: 'Vietcombank',
      bankAccountNumber: '1029384756',
      bankAccountName: '',
      paymentWebhookKey: 'webhook_secret_test_2026',
      smtpEnabled: true,
      smtpHost: 'mail9234.maychuemail.com',
      smtpPort: 465,
      smtpSecure: true,
      smtpUser: 'booking@plusmoments.vn',
      smtpPass: 'Pa$w0rd',
      emailFrom: 'PlusMoments Wedding Studio <booking@plusmoments.vn>',
      adminNotifyEmail: 'booking@plusmoments.vn',
      consultLeadEmailSubject: '[PlusMoments] Xác nhận đăng ký tư vấn & Nhận ưu đãi 2.000.000đ',
      consultLeadEmailBody: 'Kính gửi {customerName},\n\nPlusMoments rất vinh hạnh được tiếp nhận thông tin đăng ký tư vấn từ hai bạn. Chúng tôi đã kích hoạt bảo lưu gói Ưu đãi 2.000.000đ cho phiên tư vấn này.\n\nTHÔNG TIN TIẾP NHẬN:\n• Số điện thoại: {customerPhone}\n• Dịch vụ quan tâm: {concept}\n• Ngân sách dự kiến: {budget}\n\nChuyên viên tư vấn của studio sẽ chủ động liên hệ qua điện thoại hoặc Zalo trong ít phút để gửi trọn bộ catalog ảnh mẫu và trao đổi lịch trình chu đáo nhất.\n\nHotline: 0903.768.871 | Địa chỉ: 31 Hùng Vương, Phường An Đông',
      packageOrderEmailSubject: '[PlusMoments] Xác nhận đăng ký gói dịch vụ & Hướng dẫn thanh toán',
      packageOrderEmailBody: 'Kính gửi {customerName},\n\nPlusMoments xin chân thành cảm ơn bạn đã tin tưởng lựa chọn dịch vụ chụp ảnh cưới của chúng tôi. Đơn đặt gói của bạn đã được khởi tạo thành công trên hệ thống.\n\nTHÔNG TIN ĐƠN HÀNG:\n• Mã đơn hàng: #{orderCode}\n• Gói dịch vụ: {packageName}\n• Số tiền thanh toán: {packagePrice}\n• Số điện thoại: {customerPhone}\n\nHƯỚNG DẪN THANH TOÁN VIETQR:\nQuý khách vui lòng hoàn tất thanh toán cọc bằng cách quét mã VietQR tự động trên hệ thống hoặc chuyển khoản chính xác với nội dung chuyển khoản là mã đơn hàng: {orderCode}.\n\nHệ thống sẽ tự động xác nhận ngay khi nhận được thanh toán. Chuyên viên PlusMoments sẽ liên hệ để xếp lịch thử váy cưới và chốt kịch bản chụp.\n\nHotline hỗ trợ 24/7: 0903.768.871',
      brandName: 'PLUS MOMENTS',
      brandSlogan: 'LUXURY WEDDING STUDIO',
      brandBio:
        'Chúng tôi ghi lại những rung cảm tinh khôi và chân thành nhất trong tình yêu của bạn bằng ngôn ngữ ánh sáng điện ảnh.',
      address: '31 Hùng Vương, Phường An Đông',
      contactEmail: 'contact@plusmoments.vn',
      workingHours: '09:00 - 21:00 (Thứ 2 - Chủ Nhật)',
      copyrightText: '© 2026 PlusMoments Wedding Studio. All rights reserved.',
      logoType: 'TEXT',
      brandNamePart1: 'PLUS',
      brandNamePart2: 'MOMENTS',
      brandSubtitle: 'LUXURY WEDDING STUDIO',
      logoLightUrl: null,
      logoDarkUrl: null,
      footerAboutText:
        'Chúng tôi không chỉ chụp ảnh cưới, chúng tôi ghi lại những rung cảm tinh khôi và chân thành nhất trong tình yêu của bạn bằng ngôn ngữ ánh sáng điện ảnh.',
      footerNavCol1Title: 'BỘ SƯU TẬP CƯỚI',
      footerNavCol1Links: [
        { label: 'Ảnh Cưới Ngoại Cảnh Đà Lạt', url: '/albums?concept=Outdoor+Luxury' },
        { label: 'Concept Studio Phong Cách Hàn Quốc', url: '/albums?concept=Studio+Editorial' },
        { label: 'Pre-Wedding Biển Hoàng Hôn Phú Quốc', url: '/albums?concept=Pre-Wedding+Cinematic' },
        { label: 'Phóng Sự Cưới Trọn Gói Ngày Cưới', url: '/albums?concept=Phóng+Sự+Cưới' },
        { label: 'Xem tất cả bộ sưu tập →', url: '/albums' },
      ],
      footerNavCol2Title: 'BẢNG GIÁ & DỊCH VỤ',
      footerNavCol2Links: [
        { label: 'Gói Chụp Pre-Wedding Trọn Gói', url: '/pricing' },
        { label: 'Gói Studio Editorial Minimalist', url: '/pricing' },
        { label: 'Gói Phóng Sự Cưới Lễ & Tiệc', url: '/pricing' },
        { label: 'Kinh Nghiệm Chuẩn Bị Cưới', url: '/blog' },
        { label: 'Lịch Hẹn Thử Váy Cưới Miễn Phí', url: '/contact' },
      ],
      footerAddress: '123 Đường Hoa Lan, Phường 2, Quận Phú Nhuận, TP. Hồ Chí Minh',
      footerHotline: '0908.123.456',
      footerEmail: 'hello@plusmoments.vn',
      footerWorkingHours: '09:00 - 21:00 hàng ngày',
      footerCopyrightText: '© 2026 PlusMoments Wedding Studio. All rights reserved.',
      footerPolicyLinks: [
        { label: 'Chính Sách Bảo Mật', url: '/contact' },
        { label: 'Quy Trình & Hợp Đồng', url: '/pricing' },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

