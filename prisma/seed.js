/**
 * AUTO-GENERATED DATABASE SEED SNAPSHOT (CommonJS)
 * Exported at: 2026-11-11T01:54:44.857Z
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const snapshot = {
  "exportedAt": "2026-11-11T01:54:44.857Z",
  "superAdminPasswordHash": "$2b$12$pdyWDpxT2yfoUqgFptpJnO2dTb2r5Icy8mQCUNrbjfVGgRE/R9tEC",
  "adminUser": [
    {
      "id": "cmw6csqum00001fh3id5ewj2x",
      "username": "trunglnm",
      "fullName": "Lê Nguyễn Minh Trung",
      "email": "trunglnm@plusmoments.vn",
      "passwordHash": "$2b$12$pdyWDpxT2yfoUqgFptpJnO2dTb2r5Icy8mQCUNrbjfVGgRE/R9tEC",
      "role": "SUPER_ADMIN",
      "isActive": true,
      "lastLoginAt": "2026-11-09T04:53:44.683Z",
      "createdAt": "2026-11-07T12:02:18.479Z",
      "updatedAt": "2026-11-09T16:20:20.447Z"
    },
    {
      "id": "cmw6d6j2b000111xefru0nut1",
      "username": "admin",
      "fullName": "Quản trị PlusMoments",
      "email": "admin@plusmoments.vn",
      "passwordHash": "$2b$12$B8GJidmjGaDqkgJvgwKK8uF2xoC/uUkufONbObTDw/FYh8BJ5SNMC",
      "role": "ADMIN",
      "isActive": true,
      "lastLoginAt": "2026-11-10T14:03:06.254Z",
      "createdAt": "2026-11-07T12:13:01.571Z",
      "updatedAt": "2026-11-10T14:03:06.254Z"
    },
    {
      "id": "cmw6d7aiu000211xe6vz1bd7h",
      "username": "user",
      "fullName": "Người dùng 1",
      "email": null,
      "passwordHash": "$2b$12$xt9TuL8/1eTaccD.eWifMeQPZpFYFGgKnSIlGPxNUw.05hGKPxvSi",
      "role": "USER",
      "isActive": true,
      "lastLoginAt": "2026-11-09T08:47:41.690Z",
      "createdAt": "2026-11-07T12:13:37.158Z",
      "updatedAt": "2026-11-09T16:20:20.446Z"
    }
  ],
  "systemSetting": [
    {
      "id": "default",
      "siteName": "PlusMoments Wedding Studio",
      "tagline": "Lưu giữ khoảnh khắc thanh xuân và tình yêu vĩnh cửu",
      "defaultMetaTitle": "PlusMoments | Studio Chụp Ảnh Cưới Phong Cách Luxury & Cảm Xúc",
      "defaultMetaDescription": "PlusMoments Studio chuyên cung cấp dịch vụ chụp ảnh cưới Pre-Wedding, phóng sự cưới cao cấp với phong cách sang trọng, tự nhiên và đậm chất điện ảnh.",
      "defaultOgImage": "",
      "canonicalBaseUrl": "https://plusmoments.vn",
      "isMaintenanceMode": false,
      "maintenanceNotice": "Hệ thống đang bảo trì thử nghiệm 2026",
      "gtmId": "",
      "googleTagManagerId": "",
      "googleAdsId": "",
      "googleAnalyticsId": "",
      "googleAdsConversionLabel": "",
      "googleAdsLeadLabel": "",
      "googleAdsPurchaseLabel": "",
      "googleAdsPhoneConversionLabel": "",
      "googleAdsZaloConversionLabel": "",
      "googleAdsMessengerConversionLabel": "",
      "googleAdsConversionValue": 500000,
      "googleAdsEnhancedConversions": true,
      "metaPixelId": "",
      "tiktokPixelId": "",
      "customHeadScript": "",
      "customBodyScript": "",
      "redirectOnSubmit": true,
      "thankYouPageUrl": "/cam-on",
      "thankYouTitle": "Đặt Lịch Tư Vấn Thành Công!",
      "thankYouMessage": "Cảm ơn bạn đã tin tưởng PlusMoments. Ekip tư vấn sẽ liên hệ lại trong vòng 15 phút để gửi bảng báo giá chi tiết và bảo lưu ưu đãi 2.000.000đ.",
      "thankYouVoucherCode": "PLUSMOMENTS-2TR",
      "landingPageEnabled": true,
      "landingPageTitle": "Ưu Đãi Mùa Cưới 2025 - Tặng Gói Make-Up & Xe Rước Dâu",
      "landingPageSubtitle": "Đặc quyền dành riêng cho cặp đôi đăng ký trực tuyến hôm nay: Nhận ngay Voucher 2.000.000đ trừ trực tiếp vào gói chụp Pre-Wedding Luxury.",
      "landingPageBannerImage": "",
      "landingPageSlotsRemaining": 5,
      "landingPageDiscountAmount": "2.000.000đ",
      "landingPageDeadline": "Áp dụng cho 10 cặp đôi đầu tiên trong tuần này",
      "hotline": "0901577993",
      "hotlineDisplay": "0901577993",
      "zaloNumber": "0903768871",
      "zaloUrl": "https://zalo.me/0901577993",
      "messengerUrl": "https://m.me/plusmoments.vn",
      "promoText": "Nhận Báo Giá Ưu Đãi 2Tr",
      "email": "contact@plusmoments.vn",
      "studioAddress": "32/35 Cao Thắng, Bàn Cờ, TP. Hồ Chí Minh",
      "googleMapsUrl": "https://maps.app.goo.gl/iMMJ7saNvb6SBk8f9?g_st=iz",
      "googleMapsEmbedUrl": "https://www.google.com/maps?q=32%2F35%20Cao%20Th%E1%BA%AFng%2C%20B%C3%A0n%20C%E1%BB%9D%2C%20TP.%20H%E1%BB%93%20Ch%C3%AD%20Minh&output=embed",
      "googleMapsShareUrl": "https://maps.app.goo.gl/iMMJ7saNvb6SBk8f9?g_st=iz",
      "openingHours": "09:00 - 21:00 (Thứ 2 - Chủ Nhật)",
      "facebookUrl": "https://facebook.com/plusmoments.vn",
      "instagramUrl": "https://instagram.com/plusmoments.vn",
      "tiktokUrl": "https://tiktok.com/@plusmoments.vn",
      "youtubeUrl": "https://youtube.com/@plusmoments.vn",
      "driveFolderUrl": "https://drive.google.com/drive/folders/10vXpZxaTVwfY9grzA15T_O-VJo19-rLE?usp=sharing",
      "driveFolderId": "10vXpZxaTVwfY9grzA15T_O-VJo19-rLE",
      "googleDriveApiKey": "",
      "geminiApiKey": "",
      "geminiModel": "gemini-3.1-flash-lite",
      "geminiTemperature": 0.85,
      "geminiTone": "LUXURY_CINEMATIC",
      "bankBin": "970432",
      "bankShortName": "VPBank",
      "bankAccountNumber": "0933877747",
      "bankAccountName": "",
      "paymentWebhookKey": "webhook_secret_placeholder",
      "smtpEnabled": true,
      "smtpHost": "mail9234.maychuemail.com",
      "smtpPort": 465,
      "smtpSecure": true,
      "smtpUser": "booking@plusmoments.vn",
      "smtpPass": "",
      "emailFrom": "\"PlusMoments Wedding Studio\" <booking@plusmoments.vn>",
      "adminNotifyEmail": "booking@plusmoments.vn",
      "consultLeadEmailSubject": "[PlusMoments] Xác nhận đăng ký tư vấn & Nhận ưu đãi 2.000.000đ",
      "consultLeadEmailBody": null,
      "packageOrderEmailSubject": "[PlusMoments] Xác nhận đăng ký gói dịch vụ & Hướng dẫn thanh toán",
      "packageOrderEmailBody": null,
      "brandName": "PLUS MOMENTS",
      "brandSlogan": "LUXURY WEDDING STUDIO",
      "brandBio": "Chúng tôi ghi lại những rung cảm tinh khôi và chân thành nhất trong tình yêu của bạn bằng ngôn ngữ ánh sáng điện ảnh.",
      "address": "32/35 Cao Thắng, Bàn Cờ, TP. Hồ Chí Minh",
      "contactEmail": "contact@plusmoments.vn",
      "workingHours": "09:00 - 21:00 (Thứ 2 - Chủ Nhật)",
      "copyrightText": "© 2026 PlusMoments Wedding Studio. All rights reserved.",
      "logoType": "IMAGE",
      "brandNamePart1": "PLUS",
      "brandNamePart2": "MOMENTS",
      "brandSubtitle": "LUXURY WEDDING STUDIO",
      "logoLightUrl": "",
      "logoDarkUrl": "",
      "logoTextPrimary": "PLUS MOMENTS",
      "logoTextSecondary": "LUXURY WEDDING STUDIO",
      "logoFontFamily": "Playfair Display",
      "logoFontSize": 24,
      "logoFontWeight": "600",
      "logoLetterSpacing": "0.15em",
      "logoColorLight": "#1A1614",
      "logoColorDark": "#F5F2EB",
      "logoAccentColor": "#C5A880",
      "themePrimaryColor": "#C5A880",
      "themeBgColor": "#FAF8F5",
      "themeTextColor": "#1C1917",
      "footerAboutText": "Chúng tôi ghi lại những rung cảm tinh khôi và chân thành nhất trong tình yêu của bạn bằng ngôn ngữ ánh sáng điện ảnh.",
      "footerNavCol1Title": "BỘ SƯU TẬP CƯỚI",
      "footerNavCol1Links": [
        {
          "url": "/albums?concept=Outdoor+Luxury",
          "label": "Ảnh Cưới Ngoại Cảnh Đà Lạt"
        },
        {
          "url": "/albums?concept=Studio+Editorial",
          "label": "Concept Studio Phong Cách Hàn Quốc"
        },
        {
          "url": "/albums?concept=Pre-Wedding+Cinematic",
          "label": "Pre-Wedding Biển Hoàng Hôn Phú Quốc"
        },
        {
          "url": "/albums?concept=Phóng+Sự+Cưới",
          "label": "Phóng Sự Cưới Trọn Gói Ngày Cưới"
        },
        {
          "url": "/albums",
          "label": "Xem tất cả bộ sưu tập →"
        }
      ],
      "footerNavCol2Title": "BẢNG GIÁ & DỊCH VỤ",
      "footerNavCol2Links": [
        {
          "url": "/pricing",
          "label": "Gói Chụp Pre-Wedding Trọn Gói"
        },
        {
          "url": "/pricing",
          "label": "Gói Studio Editorial Minimalist"
        },
        {
          "url": "/pricing",
          "label": "Gói Phóng Sự Cưới Lễ & Tiệc"
        },
        {
          "url": "/blog",
          "label": "Kinh Nghiệm Chuẩn Bị Cưới"
        },
        {
          "url": "/contact",
          "label": "Lịch Hẹn Thử Váy Cưới Miễn Phí"
        }
      ],
      "footerAddress": "32/35 Cao Thắng, Bàn Cờ, TP. Hồ Chí Minh",
      "footerHotline": "0901577993",
      "footerEmail": "contact@plusmoments.vn",
      "footerWorkingHours": "09:00 - 21:00 (Thứ 2 - Chủ Nhật)",
      "footerCopyrightText": "© 2026 PlusMoments Wedding Studio. All rights reserved.",
      "footerPolicyLinks": [
        {
          "url": "/contact",
          "label": "Chính Sách Bảo Mật"
        },
        {
          "url": "/pricing",
          "label": "Quy Trình & Hợp Đồng"
        }
      ],
      "updatedAt": "2026-11-09T16:20:20.448Z",
      "createdAt": "2026-11-06T01:49:07.595Z"
    }
  ],
  "homePageConfig": [
    {
      "id": "default",
      "heroBadge": "LUXURY WEDDING PHOTOGRAPHY & CINEMATIC ART",
      "heroTitle": "Nơi Tình Yêu Trở Thành Tác Phẩm Nghệ Thuật",
      "heroSubtitle": "PlusMoments lưu giữ ánh nhìn say đắm, những cái ôm siết chặt và rung cảm thuần khiết nhất của hai bạn trong từng khung hình điện ảnh.",
      "heroBannerImage": "/uploads/folders/tai-nguyen-9/-0056-hung-nhung-1793939330139-oiis.webp",
      "statsJson": "[{\"label\":\"Cặp Đôi Hạnh Phúc\",\"value\":\"500+\"},{\"label\":\"Váy Cưới Cao Cấp\",\"value\":\"100%\"},{\"label\":\"Đánh Giá Tuyệt Đối\",\"value\":\"5.0 ★\"}]",
      "philosophyTitle": "Nghệ Thuật Của Những Rung Cảm",
      "philosophyText": "Chúng tôi không tìm kiếm sự hoàn hảo của những bức tượng sáp. Chúng tôi đi tìm giọt nước mắt hạnh phúc của người cha, ánh mắt rung rinh của chú rể và nụ cười rạng ngời của cô dâu trong khoảnh khắc thiêng liêng nhất cuộc đời.",
      "showTestimonials": true,
      "testimonialsTitle": "Cảm Xúc Của Các Dâu Rể",
      "testimonialsSubtitle": "Hạnh phúc của bạn chính là niềm tự hào lớn nhất của ekip sáng tạo PlusMoments",
      "updatedAt": "2026-11-09T16:20:20.452Z",
      "createdAt": "2026-11-06T01:49:07.597Z"
    }
  ],
  "notificationSetting": [
    {
      "id": "default",
      "telegramEnabled": false,
      "telegramBotToken": "",
      "telegramChatId": "",
      "emailNotificationEnabled": true,
      "adminReceiverEmail": "booking@plusmoments.vn",
      "zaloWebhookUrl": "",
      "createdAt": "2026-11-04T02:50:16.604Z",
      "updatedAt": "2026-11-09T16:20:20.454Z"
    }
  ],
  "studioLocation": [],
  "servicePackage": [
    {
      "id": "cmw7eel8y00019m43k5s86wev",
      "name": "Cơ bản",
      "slug": "co-ban",
      "category": "PRE_WEDDING",
      "subtitle": "Chạm vào vĩnh cửu qua ngôn ngữ ánh sáng điện ảnh và cảm xúc tinh tế.",
      "price": "1000000000",
      "originalPrice": "1000000000",
      "unit": "trọn gói",
      "isPopular": true,
      "isFeatured": false,
      "orderIndex": 1,
      "published": true,
      "coverImage": "/uploads/folders/tai-nguyen-9/-0041-hung-nhung-1793939098750-p9m8.webp",
      "demoImages": "[\"/uploads/folders/tai-nguyen-9/-0060-hung-nhung-1793939390513-x6zc.webp\",\"/uploads/folders/tai-nguyen-9/-0059-hung-nhung-1793939373839-bwql.webp\",\"/uploads/folders/tai-nguyen-9/-0058-hung-nhung-1793939355472-t89j.webp\",\"/uploads/folders/tai-nguyen-9/-0057-hung-nhung-1793939340809-q33j.webp\",\"/uploads/folders/tai-nguyen-9/-0056-hung-nhung-1793939330139-oiis.webp\",\"/uploads/folders/tai-nguyen-9/-0055-hung-nhung-1793939316160-vafr.webp\",\"/uploads/folders/tai-nguyen-9/-0054-hung-nhung-1793939298580-j64n.webp\",\"/uploads/folders/tai-nguyen-9/-0053-hung-nhung-1793939282465-nl2m.webp\",\"/uploads/folders/tai-nguyen-9/-0052-hung-nhung-1793939266577-bbwk.webp\",\"/uploads/folders/tai-nguyen-9/-0051-hung-nhung-1793939253108-yf2b.webp\",\"/uploads/folders/tai-nguyen-9/-0050-hung-nhung-1793939236157-md0v.webp\",\"/uploads/folders/tai-nguyen-9/-0049-hung-nhung-1793939218471-cwar.webp\",\"/uploads/folders/tai-nguyen-9/-0048-hung-nhung-1793939203906-dvj0.webp\",\"/uploads/folders/tai-nguyen-9/-0047-hung-nhung-1793939189089-mcir.webp\",\"/uploads/folders/tai-nguyen-9/-0046-hung-nhung-1793939172864-sdqq.webp\",\"/uploads/folders/tai-nguyen-9/-0045-hung-nhung-1793939159153-sz67.webp\",\"/uploads/folders/tai-nguyen-9/-0044-hung-nhung-1793939144440-47bm.webp\",\"/uploads/folders/tai-nguyen-9/-0043-hung-nhung-1793939130381-2wg3.webp\",\"/uploads/folders/tai-nguyen-9/-0042-hung-nhung-1793939114036-k7ca.webp\",\"/uploads/folders/tai-nguyen-9/-0041-hung-nhung-1793939098750-p9m8.webp\",\"/uploads/folders/tai-nguyen-9/-0040-hung-nhung-1793939079191-z1b0.webp\",\"/uploads/folders/tai-nguyen-9/-0039-hung-nhung-1793939066089-hq73.webp\",\"/uploads/folders/tai-nguyen-9/-0038-hung-nhung-1793939048515-lwhj.webp\",\"/uploads/folders/tai-nguyen-9/-0037-hung-nhung-1793939030624-w4rz.webp\",\"/uploads/folders/tai-nguyen-9/-0036-hung-nhung-1793939011706-3zt8.webp\",\"/uploads/folders/tai-nguyen-9/-0035-hung-nhung-1793938998549-48oh.webp\",\"/uploads/folders/tai-nguyen-9/-0034-hung-nhung-1793938980433-r3vr.webp\",\"/uploads/folders/tai-nguyen-9/-0033-hung-nhung-1793938965826-pqd5.webp\",\"/uploads/folders/tai-nguyen-9/-0032-hung-nhung-1793938950403-h8mw.webp\",\"/uploads/folders/tai-nguyen-9/-0031-hung-nhung-1793938933342-kio2.webp\",\"/uploads/folders/tai-nguyen-9/-0030-hung-nhung-1793938919962-q4p4.webp\",\"/uploads/folders/tai-nguyen-9/-0029-hung-nhung-1793938906042-doqy.webp\",\"/uploads/folders/tai-nguyen-9/-0028-hung-nhung-1793938890320-vali.webp\",\"/uploads/folders/tai-nguyen-9/-0027-hung-nhung-1793938876811-c8d4.webp\",\"/uploads/folders/tai-nguyen-9/-0026-hung-nhung-1793938862086-wb8g.webp\",\"/uploads/folders/tai-nguyen-9/-0025-hung-nhung-1793938848887-ncn5.webp\",\"/uploads/folders/tai-nguyen-9/-0024-hung-nhung-1793938835822-hfgq.webp\",\"/uploads/folders/tai-nguyen-9/-0023-hung-nhung-1793938818569-xi87.webp\",\"/uploads/folders/tai-nguyen-9/-0022-hung-nhung-1793938806313-ci2f.webp\",\"/uploads/folders/tai-nguyen-9/-0021-hung-nhung-1793938791244-f1xe.webp\",\"/uploads/folders/tai-nguyen-9/-0020-hung-nhung-1793938777702-a7g3.webp\",\"/uploads/folders/tai-nguyen-9/-0019-hung-nhung-1793938766658-j5h2.webp\",\"/uploads/folders/tai-nguyen-9/-0018-hung-nhung-1793938752779-fwjp.webp\",\"/uploads/folders/tai-nguyen-9/-0017-hung-nhung-1793938738911-j950.webp\",\"/uploads/folders/tai-nguyen-9/-0016-hung-nhung-1793938722533-ffnm.webp\",\"/uploads/folders/tai-nguyen-9/-0015-hung-nhung-1793938710026-5p8b.webp\",\"/uploads/folders/tai-nguyen-9/-0014-hung-nhung-1793938694302-epll.webp\",\"/uploads/folders/tai-nguyen-9/-0013-hung-nhung-1793938680524-6w3j.webp\",\"/uploads/folders/tai-nguyen-9/-0012-hung-nhung-1793938665008-zuij.webp\",\"/uploads/folders/tai-nguyen-9/-0011-hung-nhung-1793938648360-74kz.webp\",\"/uploads/folders/tai-nguyen-9/-0010-hung-nhung-1793938635833-bt46.webp\",\"/uploads/folders/tai-nguyen-9/-0009-hung-nhung-1793938621807-kojh.webp\",\"/uploads/folders/tai-nguyen-9/-0008-hung-nhung-1793938603088-8p79.webp\",\"/uploads/folders/tai-nguyen-9/-0007-hung-nhung-1793938585718-afdu.webp\",\"/uploads/folders/tai-nguyen-9/-0006-hung-nhung-1793938567344-5bci.webp\",\"/uploads/folders/tai-nguyen-9/-0005-hung-nhung-1793938552120-bejp.webp\",\"/uploads/folders/tai-nguyen-9/-0004-hung-nhung-1793938532707-iuue.webp\",\"/uploads/folders/tai-nguyen-9/-0003-hung-nhung-1793938515835-9ou7.webp\",\"/uploads/folders/tai-nguyen-9/-0002-hung-nhung-1793938499585-waxn.webp\",\"/uploads/folders/tai-nguyen-9/-0001-hung-nhung-1793938486426-bq0n.webp\"]",
      "highlightPoints": "[\"Thiết kế concept độc bản, khắc họa trọn vẹn từng nhịp đập cảm xúc và câu chuyện tình yêu riêng biệt.\",\"Trải nghiệm dòng váy cưới Haute Couture kiệt tác cùng đội ngũ nghệ sĩ trang điểm và nhiếp ảnh gia riêng biệt.\",\"Chất ảnh Cinematic nghệ thuật lưu giữ thanh xuân, chế tác in ấn theo tiêu chuẩn triển lãm bảo tàng.\"]",
      "inclusions": "[\"Chụp không giới hạn số lượng file suốt buổi chụp\",\"Toàn bộ file gốc chất lượng cao chỉnh màu cơ bản bàn giao trong 24h\",\"Thiết kế concept độc bản, khắc họa trọn vẹn từng nhịp đập cảm xúc điện ảnh\",\"02 Váy cưới cao cấp & 02 Vest Ý thiết kế riêng cho dâu rể\",\"Chuyên viên trang điểm nghệ thuật & làm tóc thay đổi theo từng trang phục\",\"01 Hoa cầm tay tươi cao cấp & hoa cài áo chú rể theo concept\",\"01 Album Photobook Fine Art mở phẳng 30 trang bọc da thủ công nhập khẩu (30x30 cm)\",\"02 Ảnh cổng Pha lê tráng gương khung hợp kim sang trọng (60x90 cm)\",\"01 Video Slide Highlight Cinematic 4K chiếu tại sảnh tiệc\"]",
      "deliverables": "01 Album Photobook Fine Art cao cấp (30x30 cm, 30 trang) bọc da thủ công nhập khẩu; 02 Ảnh cổng Pha lê tráng gương khung hợp kim sang trọng; 01 Video Slide Highlight Cinematic 4K; Toàn bộ File ảnh gốc và File đã chỉnh sửa màu nghệ thuật độ phân giải cao.",
      "createdAt": "2026-11-08T05:35:03.442Z",
      "updatedAt": "2026-11-09T16:20:20.460Z"
    },
    {
      "id": "cmwbt69fr000012i64zv8xwnb",
      "name": "Gói Deluxe - Nâng Cao",
      "slug": "deluxe",
      "category": "PRE_WEDDING",
      "subtitle": "Trải nghiệm đỉnh cao với 2 bối cảnh kết hợp và trang phục Luxury thiết kế.",
      "price": "16900000",
      "originalPrice": "19900000",
      "unit": "trọn gói",
      "isPopular": true,
      "isFeatured": false,
      "orderIndex": 2,
      "published": true,
      "coverImage": "/uploads/folders/tai-nguyen-1/hd_09203-1793935442285-ofgk.webp",
      "demoImages": "[\"/uploads/folders/tai-nguyen-1/hd_09203-1793935442285-ofgk.webp\"]",
      "highlightPoints": "[\"02 Concept độc bản (Studio + Ngoại cảnh) & Xe đưa đón nội thành\",\"02 Váy cưới Luxury cao cấp & 02 Vest Ý thiết kế\",\"01 Album Photobook 30x30cm & 02 Ảnh cổng Pha lê 60x90cm\"]",
      "inclusions": "[\"Chụp không giới hạn số lượng file suốt ngày chụp (6-8 giờ)\",\"Toàn bộ file gốc chất lượng cao chỉnh màu cơ bản bàn giao trong 24h\",\"Thiết kế 02 concept độc bản (01 Studio + 01 Ngoại cảnh nội thành)\",\"02 Váy cưới cao cấp dòng Luxury & 02 Vest Ý thiết kế riêng cho dâu rể\",\"Chuyên viên trang điểm nghệ thuật & làm tóc đổi phong cách theo từng bối cảnh\",\"01 Hoa cầm tay tươi cao cấp & hoa cài áo chú rể theo concept\",\"01 Album Photobook Fine Art mở phẳng 30 trang bọc da thủ công nhập khẩu (30x30 cm)\",\"02 Ảnh cổng Pha lê tráng gương khung hợp kim sang trọng (60x90 cm)\",\"01 Video Slide Highlight Cinematic 4K chiếu tại sảnh tiệc\",\"Xe 16 chỗ đưa đón ekip và dâu rể các điểm chụp nội thành\"]",
      "deliverables": "01 Album Photobook Fine Art 30x30cm; 02 Ảnh cổng Pha lê 60x90cm; Toàn bộ File gốc và 45 ảnh retouch chuyên sâu.",
      "createdAt": "2026-11-08T05:35:03.442Z",
      "updatedAt": "2026-11-09T16:20:20.460Z"
    },
    {
      "id": "cmwbt69ft000112i6ev187rk0",
      "name": "Gói Luxury - Hoàng Gia",
      "slug": "luxury-royal",
      "category": "PRE_WEDDING",
      "subtitle": "Tác phẩm điện ảnh cưới kiệt tác dành riêng cho những chuyện tình đẳng cấp.",
      "price": "26900000",
      "originalPrice": "32000000",
      "unit": "trọn gói",
      "isPopular": false,
      "isFeatured": true,
      "orderIndex": 3,
      "published": true,
      "coverImage": "/uploads/folders/tai-nguyen-2/hd_05419-1793935525781-qg81.webp",
      "demoImages": "[\"/uploads/folders/tai-nguyen-2/hd_05419-1793935525781-qg81.webp\"]",
      "highlightPoints": "[\"Ekip riêng biệt với Nhiếp ảnh gia & Nghệ sĩ makeup hàng đầu\",\"03 Váy cưới Haute Couture kiệt tác & 02 Vest Ý cao cấp\",\"01 Album Photobook 35x35cm, 02 Ảnh cổng 70x105cm & Video 4K\"]",
      "inclusions": "[\"Chụp không giới hạn file với ekip riêng biệt (Nhiếp ảnh gia hàng đầu)\",\"Toàn bộ file gốc chất lượng cao chỉnh màu cơ bản bàn giao trong 24h\",\"Thiết kế concept độc bản Couture cá nhân hóa 100% câu chuyện tình yêu\",\"03 Váy cưới Haute Couture kiệt tác & 02 Vest Ý cao cấp\",\"Nghệ sĩ trang điểm và làm tóc riêng biệt đi cùng dâu rể suốt hành trình\",\"02 Hoa tươi cầm tay thiết kế nghệ thuật cao cấp\",\"01 Album Photobook Fine Art mở phẳng 40 trang bọc da thủ công nhập khẩu (35x35 cm)\",\"02 Ảnh cổng Pha lê tráng gương khung hợp kim sang trọng (70x105 cm)\",\"01 Video Clip Cinematic Pre-Wedding 4K biên tập nghệ thuật chuyên nghiệp\",\"Xe Limousine đưa đón dâu rể & toàn bộ vé vào cổng các điểm quay chụp\"]",
      "deliverables": "01 Album Photobook Fine Art 35x35cm; 02 Ảnh cổng 70x105cm; 01 Video Clip 4K; Toàn bộ File gốc và 60 ảnh retouch đỉnh cao.",
      "createdAt": "2026-11-08T05:35:03.442Z",
      "updatedAt": "2026-11-09T16:20:20.460Z"
    }
  ],
  "album": [
    {
      "id": "cmw8vbed90001w5eh2fagf01y",
      "title": "Sắc Đỏ Duyên Dáng Ngày Vu Quy - Minh & Phương",
      "slug": "sac-do-duyen-dang-ngay-vu-quy-minh-phuong",
      "subtitle": "Vẻ đẹp truyền thống đượm màu hạnh phúc trong lễ vu quy",
      "concept": "Traditional Luxury & Cinematic",
      "location": "Lễ Gia Tiên & Studio PlusMoments",
      "coupleNames": "Minh & Phương",
      "shootingDate": null,
      "description": "Ngày trọng đại khoác lên mình sắc đỏ rực rỡ của tà áo dài truyền thống đính kết thủ công tinh xảo, cô dâu Phương và chú rể Minh đã viết nên câu chuyện tình yêu đậm đà bản sắc nhưng không kém phần sang trọng. Từng khung hình trong bộ sưu tập này là sự hòa quyện hoàn hảo giữa nét đẹp hoài cổ và ánh sáng điện ảnh hiện đại tại PlusMoments Studio. Từ nụ cười rạng rỡ sau tà quạt giấy, chiếc mấn đỏ kiêu sa cho đến khoảnh khắc trao nhau nụ hôn ngọt ngào giữa dàn bê tráp áo dài trắng tinh khôi, tất cả đều lưu giữ trọn vẹn những cảm xúc chân thực và thiêng liêng nhất của ngày vui đôi lứa.",
      "coverImage": "/uploads/folders/tai-nguyen-1/hd_09203-1793935442285-ofgk.webp",
      "featured": true,
      "orderIndex": 1,
      "published": true,
      "views": 0,
      "metaTitle": "Chụp Ảnh Cưới Áo Dài Đỏ Truyền Thống Đẹp | PlusMoments",
      "metaDescription": "Khám phá bộ sưu tập ảnh cưới áo dài đỏ truyền thống sang trọng, đính kết tinh xảo trong lễ vu quy của cặp đôi Minh & Phương tại PlusMoments.",
      "packageId": "cmw7eel8y00019m43k5s86wev",
      "createdById": "cmw6d6j2b000111xefru0nut1",
      "createdAt": "2026-11-09T06:16:14.196Z",
      "updatedAt": "2026-11-09T16:20:20.466Z",
      "media": [
        {
          "id": "cmw8vbvnu000hw5ehbj4j1vpy",
          "albumId": "cmw8vbed90001w5eh2fagf01y",
          "url": "/uploads/folders/tai-nguyen-1/nhd01602-1793935520263-r2wd.webp",
          "altText": "Sắc Đỏ Duyên Dáng Ngày Vu Quy - Minh & Phương - Ảnh 1",
          "caption": null,
          "width": 1920,
          "height": 1280,
          "blurDataUrl": null,
          "isCover": true,
          "orderIndex": 0,
          "createdAt": "2026-11-09T06:16:36.618Z"
        },
        {
          "id": "cmw8vbvnu000iw5ehf25taubx",
          "albumId": "cmw8vbed90001w5eh2fagf01y",
          "url": "/uploads/folders/tai-nguyen-1/nhd01540-1793935512878-bc9w.webp",
          "altText": "Sắc Đỏ Duyên Dáng Ngày Vu Quy - Minh & Phương - Ảnh 2",
          "caption": null,
          "width": 1920,
          "height": 1280,
          "blurDataUrl": null,
          "isCover": false,
          "orderIndex": 1,
          "createdAt": "2026-11-09T06:16:36.618Z"
        },
        {
          "id": "cmw8vbvnu000jw5eh12tnasqk",
          "albumId": "cmw8vbed90001w5eh2fagf01y",
          "url": "/uploads/folders/tai-nguyen-1/nhd01533-1793935506048-83sr.webp",
          "altText": "Sắc Đỏ Duyên Dáng Ngày Vu Quy - Minh & Phương - Ảnh 3",
          "caption": null,
          "width": 1920,
          "height": 1280,
          "blurDataUrl": null,
          "isCover": false,
          "orderIndex": 2,
          "createdAt": "2026-11-09T06:16:36.618Z"
        },
        {
          "id": "cmw8vbvnu000kw5ehiy9s03tp",
          "albumId": "cmw8vbed90001w5eh2fagf01y",
          "url": "/uploads/folders/tai-nguyen-1/nhd01344-1793935499144-w6sn.webp",
          "altText": "Sắc Đỏ Duyên Dáng Ngày Vu Quy - Minh & Phương - Ảnh 4",
          "caption": null,
          "width": 1920,
          "height": 1280,
          "blurDataUrl": null,
          "isCover": false,
          "orderIndex": 3,
          "createdAt": "2026-11-09T06:16:36.618Z"
        },
        {
          "id": "cmw8vbvnu000lw5ehs89v5hxb",
          "albumId": "cmw8vbed90001w5eh2fagf01y",
          "url": "/uploads/folders/tai-nguyen-1/nhd01242-1793935492413-n4oa.webp",
          "altText": "Sắc Đỏ Duyên Dáng Ngày Vu Quy - Minh & Phương - Ảnh 5",
          "caption": null,
          "width": 1920,
          "height": 1280,
          "blurDataUrl": null,
          "isCover": false,
          "orderIndex": 4,
          "createdAt": "2026-11-09T06:16:36.618Z"
        },
        {
          "id": "cmw8vbvnu000mw5ehyt4pxdmb",
          "albumId": "cmw8vbed90001w5eh2fagf01y",
          "url": "/uploads/folders/tai-nguyen-1/nhd01209-1793935485301-83ak.webp",
          "altText": "Sắc Đỏ Duyên Dáng Ngày Vu Quy - Minh & Phương - Ảnh 6",
          "caption": null,
          "width": 1920,
          "height": 1280,
          "blurDataUrl": null,
          "isCover": false,
          "orderIndex": 5,
          "createdAt": "2026-11-09T06:16:36.618Z"
        },
        {
          "id": "cmw8vbvnu000nw5eh66dwwcg4",
          "albumId": "cmw8vbed90001w5eh2fagf01y",
          "url": "/uploads/folders/tai-nguyen-1/hd_09636-1793935478176-mi2b.webp",
          "altText": "Sắc Đỏ Duyên Dáng Ngày Vu Quy - Minh & Phương - Ảnh 7",
          "caption": null,
          "width": 1920,
          "height": 1280,
          "blurDataUrl": null,
          "isCover": false,
          "orderIndex": 6,
          "createdAt": "2026-11-09T06:16:36.618Z"
        },
        {
          "id": "cmw8vbvnu000ow5ehnsn4yvm6",
          "albumId": "cmw8vbed90001w5eh2fagf01y",
          "url": "/uploads/folders/tai-nguyen-1/hd_09432-1793935470452-r982.webp",
          "altText": "Sắc Đỏ Duyên Dáng Ngày Vu Quy - Minh & Phương - Ảnh 8",
          "caption": null,
          "width": 1920,
          "height": 1280,
          "blurDataUrl": null,
          "isCover": false,
          "orderIndex": 7,
          "createdAt": "2026-11-09T06:16:36.618Z"
        },
        {
          "id": "cmw8vbvnu000pw5eha719twre",
          "albumId": "cmw8vbed90001w5eh2fagf01y",
          "url": "/uploads/folders/tai-nguyen-1/hd_09419-1793935463255-vypk.webp",
          "altText": "Sắc Đỏ Duyên Dáng Ngày Vu Quy - Minh & Phương - Ảnh 9",
          "caption": null,
          "width": 1920,
          "height": 1280,
          "blurDataUrl": null,
          "isCover": false,
          "orderIndex": 8,
          "createdAt": "2026-11-09T06:16:36.618Z"
        },
        {
          "id": "cmw8vbvnu000qw5eha7vxnuxu",
          "albumId": "cmw8vbed90001w5eh2fagf01y",
          "url": "/uploads/folders/tai-nguyen-1/hd_09384-1793935456781-z9bz.webp",
          "altText": "Sắc Đỏ Duyên Dáng Ngày Vu Quy - Minh & Phương - Ảnh 10",
          "caption": null,
          "width": 1920,
          "height": 1280,
          "blurDataUrl": null,
          "isCover": false,
          "orderIndex": 9,
          "createdAt": "2026-11-09T06:16:36.618Z"
        },
        {
          "id": "cmw8vbvnu000rw5ehmfp10616",
          "albumId": "cmw8vbed90001w5eh2fagf01y",
          "url": "/uploads/folders/tai-nguyen-1/hd_09253-1793935449691-wthn.webp",
          "altText": "Sắc Đỏ Duyên Dáng Ngày Vu Quy - Minh & Phương - Ảnh 11",
          "caption": null,
          "width": 1920,
          "height": 1280,
          "blurDataUrl": null,
          "isCover": false,
          "orderIndex": 10,
          "createdAt": "2026-11-09T06:16:36.618Z"
        },
        {
          "id": "cmw8vbvnu000sw5eh6uxmhtk0",
          "albumId": "cmw8vbed90001w5eh2fagf01y",
          "url": "/uploads/folders/tai-nguyen-1/hd_09203-1793935442285-ofgk.webp",
          "altText": "Sắc Đỏ Duyên Dáng Ngày Vu Quy - Minh & Phương - Ảnh 12",
          "caption": null,
          "width": 1920,
          "height": 1280,
          "blurDataUrl": null,
          "isCover": false,
          "orderIndex": 11,
          "createdAt": "2026-11-09T06:16:36.618Z"
        },
        {
          "id": "cmw8vbvnu000tw5eh11q97y3r",
          "albumId": "cmw8vbed90001w5eh2fagf01y",
          "url": "/uploads/folders/tai-nguyen-1/hd_00085-1793935433174-hmwi.webp",
          "altText": "Sắc Đỏ Duyên Dáng Ngày Vu Quy - Minh & Phương - Ảnh 13",
          "caption": null,
          "width": 1920,
          "height": 1280,
          "blurDataUrl": null,
          "isCover": false,
          "orderIndex": 12,
          "createdAt": "2026-11-09T06:16:36.618Z"
        },
        {
          "id": "cmw8vbvnu000uw5ehq2wom2xm",
          "albumId": "cmw8vbed90001w5eh2fagf01y",
          "url": "/uploads/folders/tai-nguyen-1/hd_00024-1793935425648-gnzq.webp",
          "altText": "Sắc Đỏ Duyên Dáng Ngày Vu Quy - Minh & Phương - Ảnh 14",
          "caption": null,
          "width": 1920,
          "height": 1280,
          "blurDataUrl": null,
          "isCover": false,
          "orderIndex": 13,
          "createdAt": "2026-11-09T06:16:36.618Z"
        }
      ]
    },
    {
      "id": "cmw9053az0002ah7xx8t8pd6z",
      "title": "Monochrome Symphony: Bản Tình Ca Đen Trắng Của Ngọc & Phong",
      "slug": "monochrome-symphony-ngoc-phong",
      "subtitle": "Khoảnh khắc điện ảnh sang trọng, nơi tình yêu thăng hoa trong nghệ thuật đen trắng.",
      "concept": "Studio Editorial, Cinematic Art, Minimalist Luxury",
      "location": "Studio PlusMoments",
      "coupleNames": "Ngọc & Phong",
      "shootingDate": null,
      "description": "Trong thế giới của những gam màu tối giản, bộ ảnh 'Monochrome Symphony' chính là lời tự tình sâu lắng nhất mà PlusMoments muốn gửi gắm đến Ngọc & Phong. Không cần đến sắc màu rực rỡ, vẻ đẹp tình yêu của đôi uyên ương được tôn vinh trọn vẹn qua sự tương phản mạnh mẽ của ánh sáng điện ảnh, nơi từng chi tiết ren tinh xảo trên váy cưới hòa quyện cùng những cái chạm nhẹ đầy cảm xúc. Từ những nụ hôn ngọt ngào dưới bầu trời đèn lung linh đến những vũ điệu say đắm trong không gian tiệc cưới huyền ảo, mỗi bức ảnh là một thước phim điện ảnh chậm rãi, ghi lại trọn vẹn sự gắn kết bền chặt. Từng bông hoa lan cài tóc, từng họa tiết ren váy hay ánh mắt tình tứ trao nhau đều trở thành những điểm nhấn đắt giá, tạo nên một câu chuyện tình yêu đầy tính nghệ thuật. Tại PlusMoments, chúng tôi không chỉ chụp ảnh, chúng tôi lưu giữ linh hồn của những cảm xúc chân thực nhất, biến những khoảnh khắc đơn giản thành những kỷ niệm vượt thời gian, đẳng cấp và đầy mê hoặc.",
      "coverImage": "/uploads/folders/tai-nguyen-2/hd_05419-1793935525781-qg81.webp",
      "featured": true,
      "orderIndex": 2,
      "published": true,
      "views": 0,
      "metaTitle": "Ảnh cưới đen trắng phong cách Cinematic sang trọng | PlusMoments",
      "metaDescription": "Khám phá bộ ảnh cưới đen trắng nghệ thuật, đậm chất điện ảnh tại PlusMoments. Vẻ đẹp sang trọng, tối giản và đầy cảm xúc của cặp đôi Ngọc & Phong.",
      "packageId": "cmw7eel8y00019m43k5s86wev",
      "createdById": "cmw6d6j2b000111xefru0nut1",
      "createdAt": "2026-11-09T08:31:18.011Z",
      "updatedAt": "2026-11-09T16:20:20.473Z",
      "media": [
        {
          "id": "cmw905jyx000hah7xfv1arpiw",
          "albumId": "cmw9053az0002ah7xx8t8pd6z",
          "url": "/uploads/folders/tai-nguyen-2/nhd05182-1793935647028-l0w7.webp",
          "altText": "Monochrome Symphony: Bản Tình Ca Đen Trắng Của Ngọc & Phong - Ảnh 1",
          "caption": null,
          "width": 1920,
          "height": 1280,
          "blurDataUrl": null,
          "isCover": true,
          "orderIndex": 0,
          "createdAt": "2026-11-09T08:31:39.610Z"
        },
        {
          "id": "cmw905jyx000iah7xrjgfqmaa",
          "albumId": "cmw9053az0002ah7xx8t8pd6z",
          "url": "/uploads/folders/tai-nguyen-2/nhd04924-1793935637476-4t5e.webp",
          "altText": "Monochrome Symphony: Bản Tình Ca Đen Trắng Của Ngọc & Phong - Ảnh 2",
          "caption": null,
          "width": 1920,
          "height": 1280,
          "blurDataUrl": null,
          "isCover": false,
          "orderIndex": 1,
          "createdAt": "2026-11-09T08:31:39.610Z"
        },
        {
          "id": "cmw905jyx000jah7xniqgwmwl",
          "albumId": "cmw9053az0002ah7xx8t8pd6z",
          "url": "/uploads/folders/tai-nguyen-2/nhd04906-1793935626398-bj4e.webp",
          "altText": "Monochrome Symphony: Bản Tình Ca Đen Trắng Của Ngọc & Phong - Ảnh 3",
          "caption": null,
          "width": 1920,
          "height": 1280,
          "blurDataUrl": null,
          "isCover": false,
          "orderIndex": 2,
          "createdAt": "2026-11-09T08:31:39.610Z"
        },
        {
          "id": "cmw905jyx000kah7xucsv5v29",
          "albumId": "cmw9053az0002ah7xx8t8pd6z",
          "url": "/uploads/folders/tai-nguyen-2/nhd04882-1793935616861-f2wq.webp",
          "altText": "Monochrome Symphony: Bản Tình Ca Đen Trắng Của Ngọc & Phong - Ảnh 4",
          "caption": null,
          "width": 1920,
          "height": 1280,
          "blurDataUrl": null,
          "isCover": false,
          "orderIndex": 3,
          "createdAt": "2026-11-09T08:31:39.610Z"
        },
        {
          "id": "cmw905jyx000lah7x415oekyc",
          "albumId": "cmw9053az0002ah7xx8t8pd6z",
          "url": "/uploads/folders/tai-nguyen-2/hd_05971-1793935603999-89xt.webp",
          "altText": "Monochrome Symphony: Bản Tình Ca Đen Trắng Của Ngọc & Phong - Ảnh 5",
          "caption": null,
          "width": 1920,
          "height": 1280,
          "blurDataUrl": null,
          "isCover": false,
          "orderIndex": 4,
          "createdAt": "2026-11-09T08:31:39.610Z"
        },
        {
          "id": "cmw905jyx000mah7x1o9k7gc2",
          "albumId": "cmw9053az0002ah7xx8t8pd6z",
          "url": "/uploads/folders/tai-nguyen-2/hd_05968-1793935592006-7wke.webp",
          "altText": "Monochrome Symphony: Bản Tình Ca Đen Trắng Của Ngọc & Phong - Ảnh 6",
          "caption": null,
          "width": 1920,
          "height": 1280,
          "blurDataUrl": null,
          "isCover": false,
          "orderIndex": 5,
          "createdAt": "2026-11-09T08:31:39.610Z"
        },
        {
          "id": "cmw905jyx000nah7xkgru81oe",
          "albumId": "cmw9053az0002ah7xx8t8pd6z",
          "url": "/uploads/folders/tai-nguyen-2/hd_05959-1793935579395-emwc.webp",
          "altText": "Monochrome Symphony: Bản Tình Ca Đen Trắng Của Ngọc & Phong - Ảnh 7",
          "caption": null,
          "width": 1920,
          "height": 1280,
          "blurDataUrl": null,
          "isCover": false,
          "orderIndex": 6,
          "createdAt": "2026-11-09T08:31:39.610Z"
        },
        {
          "id": "cmw905jyx000oah7x6nhwkcie",
          "albumId": "cmw9053az0002ah7xx8t8pd6z",
          "url": "/uploads/folders/tai-nguyen-2/hd_05933-1793935567437-n0ad.webp",
          "altText": "Monochrome Symphony: Bản Tình Ca Đen Trắng Của Ngọc & Phong - Ảnh 8",
          "caption": null,
          "width": 1920,
          "height": 1280,
          "blurDataUrl": null,
          "isCover": false,
          "orderIndex": 7,
          "createdAt": "2026-11-09T08:31:39.610Z"
        },
        {
          "id": "cmw905jyx000pah7xj17ybv00",
          "albumId": "cmw9053az0002ah7xx8t8pd6z",
          "url": "/uploads/folders/tai-nguyen-2/hd_05832-1793935553589-2zuo.webp",
          "altText": "Monochrome Symphony: Bản Tình Ca Đen Trắng Của Ngọc & Phong - Ảnh 9",
          "caption": null,
          "width": 1920,
          "height": 1280,
          "blurDataUrl": null,
          "isCover": false,
          "orderIndex": 8,
          "createdAt": "2026-11-09T08:31:39.610Z"
        },
        {
          "id": "cmw905jyx000qah7x1tgxjcbk",
          "albumId": "cmw9053az0002ah7xx8t8pd6z",
          "url": "/uploads/folders/tai-nguyen-2/hd_05816-1793935538567-83mv.webp",
          "altText": "Monochrome Symphony: Bản Tình Ca Đen Trắng Của Ngọc & Phong - Ảnh 10",
          "caption": null,
          "width": 1920,
          "height": 1280,
          "blurDataUrl": null,
          "isCover": false,
          "orderIndex": 9,
          "createdAt": "2026-11-09T08:31:39.610Z"
        },
        {
          "id": "cmw905jyx000rah7xx0mv4zcy",
          "albumId": "cmw9053az0002ah7xx8t8pd6z",
          "url": "/uploads/folders/tai-nguyen-2/hd_05742-1793935536981-116n.webp",
          "altText": "Monochrome Symphony: Bản Tình Ca Đen Trắng Của Ngọc & Phong - Ảnh 11",
          "caption": null,
          "width": 1920,
          "height": 1280,
          "blurDataUrl": null,
          "isCover": false,
          "orderIndex": 10,
          "createdAt": "2026-11-09T08:31:39.610Z"
        },
        {
          "id": "cmw905jyx000sah7x4y7g2s7k",
          "albumId": "cmw9053az0002ah7xx8t8pd6z",
          "url": "/uploads/folders/tai-nguyen-2/hd_05602-1793935530579-7pnb.webp",
          "altText": "Monochrome Symphony: Bản Tình Ca Đen Trắng Của Ngọc & Phong - Ảnh 12",
          "caption": null,
          "width": 1920,
          "height": 1280,
          "blurDataUrl": null,
          "isCover": false,
          "orderIndex": 11,
          "createdAt": "2026-11-09T08:31:39.610Z"
        },
        {
          "id": "cmw905jyx000tah7x670518hb",
          "albumId": "cmw9053az0002ah7xx8t8pd6z",
          "url": "/uploads/folders/tai-nguyen-2/hd_05419-1793935525781-qg81.webp",
          "altText": "Monochrome Symphony: Bản Tình Ca Đen Trắng Của Ngọc & Phong - Ảnh 13",
          "caption": null,
          "width": 1920,
          "height": 1280,
          "blurDataUrl": null,
          "isCover": false,
          "orderIndex": 12,
          "createdAt": "2026-11-09T08:31:39.610Z"
        }
      ]
    }
  ],
  "blogPost": [
    {
      "id": "cmw8tkukf0000swgni59zz7hi",
      "title": "Hành Trình Tình Yêu: Phóng Sự Cưới Đậm Chất Điện Ảnh Của Nhân & Thu",
      "slug": "hanh-trinh-tinh-yeu-phong-su-cuoi-nhan-va-thu",
      "summary": "Hòa quyện giữa nét truyền thống tinh tế và hơi thở hiện đại, PlusMoments ghi lại trọn vẹn từng nhịp đập cảm xúc trong ngày trọng đại của cặp đôi Nhân & Thu qua ống kính Cinematic Art.",
      "content": "<h2>Khởi đầu hành trình với những rung cảm nguyên bản</h2><p>Ngày cưới không chỉ là một nghi lễ, đó là thước phim sống động ghi lại những rung động đầu đời và lời hẹn ước trăm năm. Tại PlusMoments, chúng tôi tin rằng vẻ đẹp thực sự nằm ở những khoảnh khắc chân thực nhất. Hãy cùng nhìn lại những thước phim ngày trọng đại của Nhân & Thu, nơi phong cách <strong>Minimalist Luxury</strong> lên ngôi. [image:1] Chiếc váy cưới cúp ngực ren tinh xảo cùng ánh sáng cinematic dịu nhẹ đã tạo nên một khởi đầu đầy lãng mạn cho đôi uyên ương.</p><h2>Nụ cười rạng rỡ và sự gắn kết của tình bạn</h2><p>Một đám cưới trọn vẹn không thể thiếu những nụ cười giòn tan của hội bạn thân. Những khoảnh khắc nhí nhảnh, tự nhiên được bắt trọn giúp khung hình trở nên sống động hơn bao giờ hết. [image:2] Nụ cười của cô dâu bên người bạn thân tại phông nền hoa cẩm tú cầu là minh chứng cho một ngày vui tràn đầy năng lượng tích cực. [image:8] Những tạo dáng tinh nghịch tại khu vực backdrop không chỉ là kỷ niệm, mà là hơi thở của thanh xuân.</p><h3>Bùng nổ cảm xúc trong buổi tiệc After-Party</h3><p>Khi ánh hoàng hôn buông xuống, không gian tiệc cưới tại PlusMoments chuyển mình sang vẻ đẹp điện ảnh đầy chất nghệ thuật. [image:12] Kỹ thuật chụp <em>motion blur</em> đã khắc họa hoàn hảo sự bùng nổ của buổi After-Party. [image:14] Chú rể say sưa hát tặng cô dâu, trong khi cô dâu hòa mình vào điệu nhạc, tất cả tạo nên một bức tranh cảm xúc vỡ òa. [image:16] Những vệt sáng đèn flash nghệ thuật như tô điểm thêm cho sự phóng khoáng và niềm hạnh phúc bất tận của cặp đôi.</p><h2>Sắc đỏ truyền thống - Hơi thở văn hóa Việt</h2><p>Bên cạnh phong cách hiện đại, lễ cưới của Nhân & Thu còn giữ trọn vẹn những nghi thức truyền thống thiêng liêng. [image:22] Tà áo dài đỏ rực rỡ trong cơn mưa pháo giấy tạo nên hiệu ứng thị giác tuyệt đẹp, đầy sức sống. [image:32] Khoảnh khắc cô dâu hôn má mẹ trong lễ đính hôn là điểm chạm cảm xúc sâu sắc nhất, nhắc nhớ về tình thân và cội nguồn. [image:37] Sự ân cần của chú rể khi đeo bông tai cho cô dâu chính là mảnh ghép cuối cùng tạo nên một đám cưới hoàn mỹ.</p><h3>Tại sao chọn PlusMoments cho ngày trọng đại?</h3><ul><li><strong>Phong cách Cinematic Art:</strong> Biến mỗi bức ảnh thành một thước phim kể chuyện.</li><li><strong>Tối giản và Sang trọng:</strong> Tập trung vào cảm xúc thật, không gượng ép.</li><li><strong>Kinh nghiệm dày dặn:</strong> Bắt trọn khoảnh khắc vàng (candid) đầy nghệ thuật.</li></ul><p>Mỗi bức ảnh không chỉ là tư liệu, đó là kỷ vật đi cùng năm tháng. Hãy để PlusMoments đồng hành cùng bạn viết nên câu chuyện tình yêu riêng biệt nhất. [image:21] Gia đình sum vầy, tình yêu thăng hoa – đó là những gì chúng tôi hướng tới.</p>",
      "coverImage": "/uploads/folders/tai-nguyen-8/-739-thu-nhan-1793938473936-vl5d.webp",
      "author": "PlusMoments Editorial",
      "category": "Phóng sự cưới",
      "readingMinutes": 4,
      "views": 0,
      "published": true,
      "publishedAt": "2026-11-09T05:27:35.871Z",
      "metaTitle": "Phóng Sự Cưới Nhân & Thu: Đậm Chất Điện Ảnh | PlusMoments",
      "metaDescription": "Khám phá bộ ảnh phóng sự cưới đầy cảm xúc của Nhân & Thu với phong cách Minimalism & Cinematic Art tại PlusMoments. Xem ngay những khoảnh khắc đẹp nhất.",
      "packageId": "cmw7eel8y00019m43k5s86wev",
      "authorId": "cmw6d6j2b000111xefru0nut1",
      "galleryImages": [
        {
          "alt": "Cái nắm tay dịu dàng và đầy gắn kết của cô dâu chú rể trong trang phục cưới cao cấp - Hành Trìn",
          "url": "/uploads/folders/tai-nguyen-8/-739-thu-nhan-1793938473936-vl5d.webp",
          "caption": "Dưới ánh sáng ấm áp, cái nắm tay dịu dàng là lời hứa hẹn ngọt ngào cho một hành trình hạnh phúc vĩnh cửu.",
          "orderIndex": 0
        },
        {
          "alt": "Khoảnh khắc nắm tay cô dâu chú rể phong cách cinematic",
          "url": "/uploads/folders/tai-nguyen-8/-730-thu-nhan-1793938459671-g7ut.webp",
          "caption": "Cái nắm tay dịu dàng trong ánh sáng điện ảnh",
          "orderIndex": 1
        },
        {
          "alt": "Cô dâu rạng rỡ bên bạn thân tại tiệc cưới",
          "url": "/uploads/folders/tai-nguyen-8/-715-thu-nhan-1793938446050-frbk.webp",
          "caption": "Nụ cười hạnh phúc trong ngày cưới",
          "orderIndex": 2
        },
        {
          "alt": "Khoảnh khắc tung hoa cưới rộn rã năng lượng của cô dâu chú rể cùng dàn khách mời - Hành Trình T",
          "url": "/uploads/folders/tai-nguyen-8/-711-thu-nhan-1793938431017-y342.webp",
          "caption": "Khoảnh khắc tung hoa đầy ắp tiếng cười, gửi gắm trọn vẹn niềm hạnh phúc đến những người thương yêu.",
          "orderIndex": 3
        },
        {
          "alt": "Cô dâu chú rể trao nụ hôn ngọt ngào rạng rỡ giữa không gian ruy-băng rực rỡ cùng bạn bè - Hành",
          "url": "/uploads/folders/tai-nguyen-8/-699-thu-nhan-1793938418362-swn1.webp",
          "caption": "Khoảnh khắc vỡ òa hạnh phúc và đong đầy tiếng cười bên những người bạn thân thương ngày trọng đại.",
          "orderIndex": 4
        },
        {
          "alt": "Cô dâu chú rể chụp ảnh nhí nhố cùng hội bạn thân tại backdrop tiệc cưới - Hành Trình Tình Yêu:",
          "url": "/uploads/folders/tai-nguyen-8/-693-thu-nhan-1793938403327-2ixg.webp",
          "caption": "Khoảnh khắc vỡ òa niềm vui và nhí nhố bên hội bạn thân trong ngày trọng đại của Nhân & Thu.",
          "orderIndex": 5
        },
        {
          "alt": "Khoảnh khắc cô dâu cùng hội bạn thân chụp ảnh selfie vui tươi tại phông tiệc cưới - Hành Trình",
          "url": "/uploads/folders/tai-nguyen-8/-690-thu-nhan-1793938389318-9sqf.webp",
          "caption": "Khoảnh khắc ngọt ngào và tự nhiên của cô dâu bên những người bạn thân thương trong ngày trọng đại.",
          "orderIndex": 6
        },
        {
          "alt": "Khoảnh khắc vui tươi tinh nghịch của cô dâu bên bạn thân tại backdrop tiệc cưới hoa tươi - Hành",
          "url": "/uploads/folders/tai-nguyen-8/-680-thu-nhan-1793938376626-dnex.webp",
          "caption": "Hạnh phúc ngày chung đôi thêm vẹn tròn với những khoảnh khắc nhí nhố bên cạ cứng!",
          "orderIndex": 7
        },
        {
          "alt": "Cô dâu rạng rỡ vỡ òa hạnh phúc bên bạn thân trong ngày cưới - Hành Trình Tình Yêu: Phóng Sự Cướ",
          "url": "/uploads/folders/tai-nguyen-8/-678-thu-nhan-1793938360273-9cfa.webp",
          "caption": "Nụ cười trọn vẹn và khoảnh khắc vô giá bên những người bạn thân yêu trong ngày chung đôi.",
          "orderIndex": 8
        },
        {
          "alt": "Khoảnh khắc quẩy tiệc cưới sôi động và tự nhiên của cô dâu chú rể cùng bạn bè - Hành Trình Tình",
          "url": "/uploads/folders/tai-nguyen-8/-666-thu-nhan-1793938347757-f5rd.webp",
          "caption": "Khoảnh khắc vỡ òa hạnh phúc và năng lượng tích cực của cô dâu chú rể bên những người thân yêu trong ngày trọng đại.",
          "orderIndex": 9
        },
        {
          "alt": "Khoảnh khắc cô dâu chú rể di chuyển trong tiệc cưới với bó hoa baby trắng - Hành Trình Tình Yêu",
          "url": "/uploads/folders/tai-nguyen-8/-665-thu-nhan-1793938334161-jxqg.webp",
          "caption": "Khoảnh khắc rạng rỡ, tràn đầy năng lượng trong ngày trọng đại. Lưu giữ mọi cảm xúc chân thật nhất cùng PlusMoments.",
          "orderIndex": 10
        },
        {
          "alt": "Cô dâu rạng rỡ cùng chú rể và người thân trong khoảnh khắc After-Party tiệc cưới đầy sôi động -",
          "url": "/uploads/folders/tai-nguyen-8/-659-thu-nhan-1793938320248-2sbs.webp",
          "caption": "Khoảnh khắc vỡ òa hạnh phúc và nụ cười rạng rỡ trong bữa tiệc cưới bùng nổ cảm xúc cùng PlusMoments.",
          "orderIndex": 11
        },
        {
          "alt": "Ảnh chụp motion blur sôi động tiệc After-party",
          "url": "/uploads/folders/tai-nguyen-8/-649-thu-nhan-1793938303570-d6gh.webp",
          "caption": "Khoảnh khắc After-party bùng nổ cảm xúc",
          "orderIndex": 12
        },
        {
          "alt": "Chú rể say sưa hát tặng cô dâu cùng không khí tiệc cưới after-party bùng nổ cảm xúc - Hành Trìn",
          "url": "/uploads/folders/tai-nguyen-8/-643-thu-nhan-1793938288753-4kej.webp",
          "caption": "Cháy hết mình trong đêm tiệc after-party – nơi tình yêu và niềm vui thăng hoa trọn vẹn cùng PlusMoments.",
          "orderIndex": 13
        },
        {
          "alt": "Màn song ca đầy thăng hoa và tràn ngập niềm vui của cặp đôi trong đêm tiệc cưới - Hành Trình Tì",
          "url": "/uploads/folders/tai-nguyen-8/-637-thu-nhan-1793938273302-muw1.webp",
          "caption": "Giai điệu hạnh phúc cất lên đầy thăng hoa, ghi dấu khoảnh khắc vui tươi khó quên trong đêm tiệc cưới.",
          "orderIndex": 14
        },
        {
          "alt": "Cô dâu chú rể cùng bạn bè quậy hết mình trong tiệc cưới after-party sôi động - Hành Trình Tình",
          "url": "/uploads/folders/tai-nguyen-8/-634-thu-nhan-1793938259981-dxh6.webp",
          "caption": "Đêm tiệc after-party bùng nổ, nơi cảm xúc thăng hoa và niềm vui kéo dài bất tận cùng PlusMoments.",
          "orderIndex": 15
        },
        {
          "alt": "Cô dâu trong váy cưới ren lấp lánh và khăn voan trắng tại tiệc cưới - Hành Trình Tình Yêu: Phón",
          "url": "/uploads/folders/tai-nguyen-8/-627-thu-nhan-1793938246997-h5qe.webp",
          "caption": "Khoảnh khắc hạnh phúc trong ngày trọng đại, nơi tình yêu tỏa sáng rạng ngời.",
          "orderIndex": 16
        },
        {
          "alt": "Khoảnh khắc nâng ly chúc mừng của cô dâu chú rể và bạn bè trong tiệc cưới - Hành Trình Tình Yêu",
          "url": "/uploads/folders/tai-nguyen-8/-624-thu-nhan-1793938232410-v2qe.webp",
          "caption": "Nâng ly chúc mừng hạnh phúc, lưu giữ những khoảnh khắc rộn ràng nhất cùng những người thân yêu.",
          "orderIndex": 17
        },
        {
          "alt": "Cô dâu chú rể nâng ly chúc mừng cùng bạn bè trong tiệc cưới - Hành Trình Tình Yêu: Phóng Sự Cướ",
          "url": "/uploads/folders/tai-nguyen-8/-614-thu-nhan-1793938216890-ergv.webp",
          "caption": "Nâng ly chúc mừng hạnh phúc, lưu giữ khoảnh khắc rạng rỡ nhất cùng những người thân yêu.",
          "orderIndex": 18
        },
        {
          "alt": "Cô dâu chú rể cùng bạn bè nâng ly chúc mừng trong tiệc cưới - Hành Trình Tình Yêu: Phóng Sự Cướ",
          "url": "/uploads/folders/tai-nguyen-8/-612-thu-nhan-1793938200366-nd9v.webp",
          "caption": "Khoảnh khắc hạnh phúc vỡ òa cùng những người thân yêu. Chúc mừng ngày chung đôi!",
          "orderIndex": 19
        },
        {
          "alt": "Khoảnh khắc gia đình hai bên trong lễ cưới truyền thống - Hành Trình Tình Yêu: Phóng Sự Cưới Đậ",
          "url": "/uploads/folders/tai-nguyen-8/-563-thu-nhan-1793938187050-5qlx.webp",
          "caption": "Gia đình là điểm tựa, là nơi bắt đầu cho hành trình hạnh phúc của đôi lứa.",
          "orderIndex": 20
        },
        {
          "alt": "Cô dâu chú rể trong lễ rước dâu truyền thống - Hành Trình Tình Yêu: Phóng Sự Cưới Đậm Chất Điện",
          "url": "/uploads/folders/tai-nguyen-8/-345-thu-nhan-1793938172003-djj1.webp",
          "caption": "Khoảnh khắc hạnh phúc vỡ òa trong ngày trọng đại. Chúc hai bạn mãi mãi bên nhau!",
          "orderIndex": 21
        },
        {
          "alt": "Cô dâu chú rể trong lễ rước dâu truyền thống áo dài đỏ",
          "url": "/uploads/folders/tai-nguyen-8/-343-thu-nhan-1793938154133-r10x.webp",
          "caption": "Sắc đỏ truyền thống trong ngày vui",
          "orderIndex": 22
        },
        {
          "alt": "Khoảnh khắc hạnh phúc của cô dâu, chú rể và mẹ trong lễ rước dâu truyền thống - Hành Trình Tình",
          "url": "/uploads/folders/tai-nguyen-8/-341-thu-nhan-1793938137510-9q9m.webp",
          "caption": "Khoảnh khắc rạng rỡ ngày chung đôi, nụ cười hạnh phúc lan tỏa trong ngày vui trọng đại.",
          "orderIndex": 23
        },
        {
          "alt": "Cô dâu chú rể trong lễ rước dâu truyền thống - Hành Trình Tình Yêu: Phóng Sự Cưới Đậm Chất Điện",
          "url": "/uploads/folders/tai-nguyen-8/-339-thu-nhan-1793938125364-phzj.webp",
          "caption": "Khoảnh khắc rạng rỡ ngày chung đôi, khởi đầu cho hành trình hạnh phúc viên mãn.",
          "orderIndex": 24
        },
        {
          "alt": "Cô dâu chú rể trong trang phục áo dài truyền thống cùng mẹ trong ngày cưới - Hành Trình Tình Yê",
          "url": "/uploads/folders/tai-nguyen-8/-336-thu-nhan-1793938110028-8n5y.webp",
          "caption": "Khoảnh khắc hạnh phúc ngày chung đôi, nụ cười rạng rỡ bên gia đình thân yêu.",
          "orderIndex": 25
        },
        {
          "alt": "Cô dâu chú rể trong lễ ăn hỏi truyền thống với phong bao lì xì đỏ và áo dài đỏ - Hành Trình Tìn",
          "url": "/uploads/folders/tai-nguyen-8/-278-thu-nhan-1793938099110-1q70.webp",
          "caption": "Ngày chung đôi rạng rỡ, khởi đầu cho hành trình hạnh phúc trọn vẹn. Chúc mừng ngày vui của hai bạn!",
          "orderIndex": 26
        },
        {
          "alt": "Cô dâu chú rể trong lễ ăn hỏi truyền thống cùng bạn thân - Hành Trình Tình Yêu: Phóng Sự Cưới Đ",
          "url": "/uploads/folders/tai-nguyen-8/-276-thu-nhan-1793938085615-da15.webp",
          "caption": "Ngày vui trọn vẹn, nụ cười rạng rỡ bên những người thân yêu nhất. Chúc mừng hạnh phúc đôi uyên ương!",
          "orderIndex": 27
        },
        {
          "alt": "Cô dâu chú rể trong nghi thức trao trang sức ngày cưới - Hành Trình Tình Yêu: Phóng Sự Cưới Đậm",
          "url": "/uploads/folders/tai-nguyen-8/-272-thu-nhan-1793938070056-9sjm.webp",
          "caption": "Nụ cười rạng rỡ ngày chung đôi, khởi đầu cho hành trình hạnh phúc viên mãn.",
          "orderIndex": 28
        },
        {
          "alt": "Cô dâu trong tà áo dài đỏ cầm bó hoa sen trắng trong lễ cưới truyền thống - Hành Trình Tình Yêu",
          "url": "/uploads/folders/tai-nguyen-8/-240-thu-nhan-1793938057240-3lds.webp",
          "caption": "Khoảnh khắc thiêng liêng trong tà áo dài đỏ, gửi gắm trọn vẹn tình yêu và sự gắn kết.",
          "orderIndex": 29
        },
        {
          "alt": "Khoảnh khắc mẹ trao nhẫn cưới cho cô dâu trong lễ đính hôn truyền thống - Hành Trình Tình Yêu:",
          "url": "/uploads/folders/tai-nguyen-8/-237-thu-nhan-1793938045525-9e5a.webp",
          "caption": "Khoảnh khắc thiêng liêng khi tình yêu được kết nối bằng chiếc nhẫn cưới trao tay.",
          "orderIndex": 30
        },
        {
          "alt": "Khoảnh khắc cô dâu hôn má mẹ trong lễ đính hôn truyền thống - Hành Trình Tình Yêu: Phóng Sự Cướ",
          "url": "/uploads/folders/tai-nguyen-8/-235-thu-nhan-1793938032516-rpij.webp",
          "caption": "Khoảnh khắc yêu thương đong đầy trong ngày trọng đại. Chúc mừng hạnh phúc Tuyết Thu & Đình Nhân!",
          "orderIndex": 31
        },
        {
          "alt": "Cô dâu hôn mẹ trong lễ đính hôn truyền thống",
          "url": "/uploads/folders/tai-nguyen-8/-229-thu-nhan-1793938018019-csz0.webp",
          "caption": "Khoảnh khắc tình thân thiêng liêng",
          "orderIndex": 32
        },
        {
          "alt": "Khoảnh khắc trao trang sức vàng cho cô dâu trong lễ đính hôn truyền thống - Hành Trình Tình Yêu",
          "url": "/uploads/folders/tai-nguyen-8/-224-thu-nhan-1793938003274-zxw2.webp",
          "caption": "Khoảnh khắc hạnh phúc ngày chung đôi, trọn vẹn nét đẹp truyền thống Việt Nam.",
          "orderIndex": 33
        },
        {
          "alt": "Gia đình và cô dâu chú rể trong lễ ăn hỏi truyền thống - Hành Trình Tình Yêu: Phóng Sự Cưới Đậm",
          "url": "/uploads/folders/tai-nguyen-8/-222-thu-nhan-1793937990858-hk6j.webp",
          "caption": "Gói trọn khoảnh khắc sum vầy, ấm áp trong ngày vui trọng đại.",
          "orderIndex": 34
        },
        {
          "alt": "Nghi thức trao nhẫn trong lễ đính hôn truyền thống với cô dâu chú rể trong trang phục áo dài đỏ",
          "url": "/uploads/folders/tai-nguyen-8/-202-thu-nhan-1793937975181-nbfd.webp",
          "caption": "Khoảnh khắc thiêng liêng trong ngày trọng đại, nơi tình yêu bắt đầu hành trình mới.",
          "orderIndex": 35
        },
        {
          "alt": "Khoảnh khắc chú rể đeo bông tai vàng cho cô dâu trong trang phục áo dài cưới truyền thống - Hàn",
          "url": "/uploads/folders/tai-nguyen-8/-195-thu-nhan-1793937961594-n0o8.webp",
          "caption": "Khoảnh khắc dịu dàng, nơi tình yêu bắt đầu từ những cử chỉ nhỏ nhất.",
          "orderIndex": 36
        },
        {
          "alt": "Cô dâu áo dài đỏ nhận trang sức trong lễ ăn hỏi - Hành Trình Tình Yêu: Phóng Sự Cưới Đậm Chất Đ",
          "url": "/uploads/folders/tai-nguyen-8/-193-thu-nhan-1793937946489-hcp4.webp",
          "caption": "Khoảnh khắc ngọt ngào và hạnh phúc trong ngày trọng đại.",
          "orderIndex": 37
        },
        {
          "alt": "Khoảnh khắc vui vẻ, tự nhiên của gia đình và bạn bè trong lễ cưới truyền thống - Hành Trình Tìn",
          "url": "/uploads/folders/tai-nguyen-8/-191-thu-nhan-1793937934282-nrey.webp",
          "caption": "Những nụ cười rạng rỡ và khoảnh khắc đáng nhớ cùng người thân trong ngày trọng đại.",
          "orderIndex": 38
        },
        {
          "alt": "Cô dâu trong tà áo dài đỏ truyền thống và khoảnh khắc xuất hiện trong lễ cưới - Hành Trình Tình",
          "url": "/uploads/folders/tai-nguyen-8/-178-thu-nhan-1793937917320-5tz1.webp",
          "caption": "Khoảnh khắc rạng rỡ của cô dâu trong ngày trọng đại, khởi đầu cho hành trình hạnh phúc.",
          "orderIndex": 39
        },
        {
          "alt": "Nhóm phù dâu xinh xắn trong trang phục áo dài hồng pastel tại lễ Vu Quy - Hành Trình Tình Yêu:",
          "url": "/uploads/folders/tai-nguyen-8/-155-thu-nhan-1793937901432-yt9n.webp",
          "caption": "Dàn phù dâu xinh xắn trong sắc hồng ngọt ngào, cùng chung vui ngày hạnh phúc của cô dâu chú rể.",
          "orderIndex": 40
        },
        {
          "alt": "Đội hình bê tráp nam trong lễ ăn hỏi với mâm quả rồng phượng truyền thống - Hành Trình Tình Yêu",
          "url": "/uploads/folders/tai-nguyen-8/-147-thu-nhan-1793937885658-cccn.webp",
          "caption": "Đội hình bê tráp lịch lãm, sẵn sàng cho ngày vui trọng đại. Chúc mừng hạnh phúc đôi uyên ương!",
          "orderIndex": 41
        }
      ],
      "createdAt": "2026-11-09T05:27:35.871Z",
      "updatedAt": "2026-11-09T16:20:20.479Z",
      "images": [
        {
          "id": "cmw8tkukg0005swgntmqblp3c",
          "postId": "cmw8tkukf0000swgni59zz7hi",
          "url": "/uploads/folders/tai-nguyen-8/-699-thu-nhan-1793938418362-swn1.webp",
          "alt": "Cô dâu chú rể trao nụ hôn ngọt ngào rạng rỡ giữa không gian ruy-băng rực rỡ cùng bạn bè - Hành",
          "caption": "Khoảnh khắc vỡ òa hạnh phúc và đong đầy tiếng cười bên những người bạn thân thương ngày trọng đại.",
          "orderIndex": 4,
          "createdAt": "2026-11-09T05:27:35.871Z"
        },
        {
          "id": "cmw8tkukg0006swgnxfti49nv",
          "postId": "cmw8tkukf0000swgni59zz7hi",
          "url": "/uploads/folders/tai-nguyen-8/-693-thu-nhan-1793938403327-2ixg.webp",
          "alt": "Cô dâu chú rể chụp ảnh nhí nhố cùng hội bạn thân tại backdrop tiệc cưới - Hành Trình Tình Yêu:",
          "caption": "Khoảnh khắc vỡ òa niềm vui và nhí nhố bên hội bạn thân trong ngày trọng đại của Nhân & Thu.",
          "orderIndex": 5,
          "createdAt": "2026-11-09T05:27:35.871Z"
        },
        {
          "id": "cmw8tkukg0007swgnwp7b3trh",
          "postId": "cmw8tkukf0000swgni59zz7hi",
          "url": "/uploads/folders/tai-nguyen-8/-690-thu-nhan-1793938389318-9sqf.webp",
          "alt": "Khoảnh khắc cô dâu cùng hội bạn thân chụp ảnh selfie vui tươi tại phông tiệc cưới - Hành Trình",
          "caption": "Khoảnh khắc ngọt ngào và tự nhiên của cô dâu bên những người bạn thân thương trong ngày trọng đại.",
          "orderIndex": 6,
          "createdAt": "2026-11-09T05:27:35.871Z"
        },
        {
          "id": "cmw8tkukg0008swgnvnxhjms5",
          "postId": "cmw8tkukf0000swgni59zz7hi",
          "url": "/uploads/folders/tai-nguyen-8/-680-thu-nhan-1793938376626-dnex.webp",
          "alt": "Khoảnh khắc vui tươi tinh nghịch của cô dâu bên bạn thân tại backdrop tiệc cưới hoa tươi - Hành",
          "caption": "Hạnh phúc ngày chung đôi thêm vẹn tròn với những khoảnh khắc nhí nhố bên cạ cứng!",
          "orderIndex": 7,
          "createdAt": "2026-11-09T05:27:35.871Z"
        },
        {
          "id": "cmw8tkukg0009swgnh6nwpzvx",
          "postId": "cmw8tkukf0000swgni59zz7hi",
          "url": "/uploads/folders/tai-nguyen-8/-678-thu-nhan-1793938360273-9cfa.webp",
          "alt": "Cô dâu rạng rỡ vỡ òa hạnh phúc bên bạn thân trong ngày cưới - Hành Trình Tình Yêu: Phóng Sự Cướ",
          "caption": "Nụ cười trọn vẹn và khoảnh khắc vô giá bên những người bạn thân yêu trong ngày chung đôi.",
          "orderIndex": 8,
          "createdAt": "2026-11-09T05:27:35.871Z"
        },
        {
          "id": "cmw8tkukg000aswgn92nnrwbi",
          "postId": "cmw8tkukf0000swgni59zz7hi",
          "url": "/uploads/folders/tai-nguyen-8/-666-thu-nhan-1793938347757-f5rd.webp",
          "alt": "Khoảnh khắc quẩy tiệc cưới sôi động và tự nhiên của cô dâu chú rể cùng bạn bè - Hành Trình Tình",
          "caption": "Khoảnh khắc vỡ òa hạnh phúc và năng lượng tích cực của cô dâu chú rể bên những người thân yêu trong ngày trọng đại.",
          "orderIndex": 9,
          "createdAt": "2026-11-09T05:27:35.871Z"
        },
        {
          "id": "cmw8tkukg000bswgnyjpnjb3u",
          "postId": "cmw8tkukf0000swgni59zz7hi",
          "url": "/uploads/folders/tai-nguyen-8/-665-thu-nhan-1793938334161-jxqg.webp",
          "alt": "Khoảnh khắc cô dâu chú rể di chuyển trong tiệc cưới với bó hoa baby trắng - Hành Trình Tình Yêu",
          "caption": "Khoảnh khắc rạng rỡ, tràn đầy năng lượng trong ngày trọng đại. Lưu giữ mọi cảm xúc chân thật nhất cùng PlusMoments.",
          "orderIndex": 10,
          "createdAt": "2026-11-09T05:27:35.871Z"
        },
        {
          "id": "cmw8tkukg000cswgnn3rogoq3",
          "postId": "cmw8tkukf0000swgni59zz7hi",
          "url": "/uploads/folders/tai-nguyen-8/-659-thu-nhan-1793938320248-2sbs.webp",
          "alt": "Cô dâu rạng rỡ cùng chú rể và người thân trong khoảnh khắc After-Party tiệc cưới đầy sôi động -",
          "caption": "Khoảnh khắc vỡ òa hạnh phúc và nụ cười rạng rỡ trong bữa tiệc cưới bùng nổ cảm xúc cùng PlusMoments.",
          "orderIndex": 11,
          "createdAt": "2026-11-09T05:27:35.871Z"
        },
        {
          "id": "cmw8tkukg000dswgn3bames1k",
          "postId": "cmw8tkukf0000swgni59zz7hi",
          "url": "/uploads/folders/tai-nguyen-8/-649-thu-nhan-1793938303570-d6gh.webp",
          "alt": "Ảnh chụp motion blur sôi động tiệc After-party",
          "caption": "Khoảnh khắc After-party bùng nổ cảm xúc",
          "orderIndex": 12,
          "createdAt": "2026-11-09T05:27:35.871Z"
        },
        {
          "id": "cmw8tkukg000eswgnbhz23r0w",
          "postId": "cmw8tkukf0000swgni59zz7hi",
          "url": "/uploads/folders/tai-nguyen-8/-643-thu-nhan-1793938288753-4kej.webp",
          "alt": "Chú rể say sưa hát tặng cô dâu cùng không khí tiệc cưới after-party bùng nổ cảm xúc - Hành Trìn",
          "caption": "Cháy hết mình trong đêm tiệc after-party – nơi tình yêu và niềm vui thăng hoa trọn vẹn cùng PlusMoments.",
          "orderIndex": 13,
          "createdAt": "2026-11-09T05:27:35.871Z"
        },
        {
          "id": "cmw8tkukg000fswgn8xr0jd0u",
          "postId": "cmw8tkukf0000swgni59zz7hi",
          "url": "/uploads/folders/tai-nguyen-8/-637-thu-nhan-1793938273302-muw1.webp",
          "alt": "Màn song ca đầy thăng hoa và tràn ngập niềm vui của cặp đôi trong đêm tiệc cưới - Hành Trình Tì",
          "caption": "Giai điệu hạnh phúc cất lên đầy thăng hoa, ghi dấu khoảnh khắc vui tươi khó quên trong đêm tiệc cưới.",
          "orderIndex": 14,
          "createdAt": "2026-11-09T05:27:35.871Z"
        },
        {
          "id": "cmw8tkukg000gswgnb4x9av8h",
          "postId": "cmw8tkukf0000swgni59zz7hi",
          "url": "/uploads/folders/tai-nguyen-8/-634-thu-nhan-1793938259981-dxh6.webp",
          "alt": "Cô dâu chú rể cùng bạn bè quậy hết mình trong tiệc cưới after-party sôi động - Hành Trình Tình",
          "caption": "Đêm tiệc after-party bùng nổ, nơi cảm xúc thăng hoa và niềm vui kéo dài bất tận cùng PlusMoments.",
          "orderIndex": 15,
          "createdAt": "2026-11-09T05:27:35.871Z"
        },
        {
          "id": "cmw8tkukg000hswgnyloiywmf",
          "postId": "cmw8tkukf0000swgni59zz7hi",
          "url": "/uploads/folders/tai-nguyen-8/-627-thu-nhan-1793938246997-h5qe.webp",
          "alt": "Cô dâu trong váy cưới ren lấp lánh và khăn voan trắng tại tiệc cưới - Hành Trình Tình Yêu: Phón",
          "caption": "Khoảnh khắc hạnh phúc trong ngày trọng đại, nơi tình yêu tỏa sáng rạng ngời.",
          "orderIndex": 16,
          "createdAt": "2026-11-09T05:27:35.871Z"
        },
        {
          "id": "cmw8tkukg000iswgn8qbegd3u",
          "postId": "cmw8tkukf0000swgni59zz7hi",
          "url": "/uploads/folders/tai-nguyen-8/-624-thu-nhan-1793938232410-v2qe.webp",
          "alt": "Khoảnh khắc nâng ly chúc mừng của cô dâu chú rể và bạn bè trong tiệc cưới - Hành Trình Tình Yêu",
          "caption": "Nâng ly chúc mừng hạnh phúc, lưu giữ những khoảnh khắc rộn ràng nhất cùng những người thân yêu.",
          "orderIndex": 17,
          "createdAt": "2026-11-09T05:27:35.871Z"
        },
        {
          "id": "cmw8tkukg000jswgnmtpvwjdn",
          "postId": "cmw8tkukf0000swgni59zz7hi",
          "url": "/uploads/folders/tai-nguyen-8/-614-thu-nhan-1793938216890-ergv.webp",
          "alt": "Cô dâu chú rể nâng ly chúc mừng cùng bạn bè trong tiệc cưới - Hành Trình Tình Yêu: Phóng Sự Cướ",
          "caption": "Nâng ly chúc mừng hạnh phúc, lưu giữ khoảnh khắc rạng rỡ nhất cùng những người thân yêu.",
          "orderIndex": 18,
          "createdAt": "2026-11-09T05:27:35.871Z"
        },
        {
          "id": "cmw8tkukg000kswgnqjqtugqy",
          "postId": "cmw8tkukf0000swgni59zz7hi",
          "url": "/uploads/folders/tai-nguyen-8/-612-thu-nhan-1793938200366-nd9v.webp",
          "alt": "Cô dâu chú rể cùng bạn bè nâng ly chúc mừng trong tiệc cưới - Hành Trình Tình Yêu: Phóng Sự Cướ",
          "caption": "Khoảnh khắc hạnh phúc vỡ òa cùng những người thân yêu. Chúc mừng ngày chung đôi!",
          "orderIndex": 19,
          "createdAt": "2026-11-09T05:27:35.871Z"
        },
        {
          "id": "cmw8tkukg0002swgnpwju8435",
          "postId": "cmw8tkukf0000swgni59zz7hi",
          "url": "/uploads/folders/tai-nguyen-8/-730-thu-nhan-1793938459671-g7ut.webp",
          "alt": "Khoảnh khắc nắm tay cô dâu chú rể phong cách cinematic",
          "caption": "Cái nắm tay dịu dàng trong ánh sáng điện ảnh",
          "orderIndex": 1,
          "createdAt": "2026-11-09T05:27:35.871Z"
        },
        {
          "id": "cmw8tkukg0004swgn8dooxx4s",
          "postId": "cmw8tkukf0000swgni59zz7hi",
          "url": "/uploads/folders/tai-nguyen-8/-711-thu-nhan-1793938431017-y342.webp",
          "alt": "Khoảnh khắc tung hoa cưới rộn rã năng lượng của cô dâu chú rể cùng dàn khách mời - Hành Trình T",
          "caption": "Khoảnh khắc tung hoa đầy ắp tiếng cười, gửi gắm trọn vẹn niềm hạnh phúc đến những người thương yêu.",
          "orderIndex": 3,
          "createdAt": "2026-11-09T05:27:35.871Z"
        },
        {
          "id": "cmw8tkukg0003swgnsjg7neym",
          "postId": "cmw8tkukf0000swgni59zz7hi",
          "url": "/uploads/folders/tai-nguyen-8/-715-thu-nhan-1793938446050-frbk.webp",
          "alt": "Cô dâu rạng rỡ bên bạn thân tại tiệc cưới",
          "caption": "Nụ cười hạnh phúc trong ngày cưới",
          "orderIndex": 2,
          "createdAt": "2026-11-09T05:27:35.871Z"
        },
        {
          "id": "cmw8tkukg000qswgnd5kluqah",
          "postId": "cmw8tkukf0000swgni59zz7hi",
          "url": "/uploads/folders/tai-nguyen-8/-336-thu-nhan-1793938110028-8n5y.webp",
          "alt": "Cô dâu chú rể trong trang phục áo dài truyền thống cùng mẹ trong ngày cưới - Hành Trình Tình Yê",
          "caption": "Khoảnh khắc hạnh phúc ngày chung đôi, nụ cười rạng rỡ bên gia đình thân yêu.",
          "orderIndex": 25,
          "createdAt": "2026-11-09T05:27:35.871Z"
        },
        {
          "id": "cmw8tkukg000rswgnsleo20zh",
          "postId": "cmw8tkukf0000swgni59zz7hi",
          "url": "/uploads/folders/tai-nguyen-8/-278-thu-nhan-1793938099110-1q70.webp",
          "alt": "Cô dâu chú rể trong lễ ăn hỏi truyền thống với phong bao lì xì đỏ và áo dài đỏ - Hành Trình Tìn",
          "caption": "Ngày chung đôi rạng rỡ, khởi đầu cho hành trình hạnh phúc trọn vẹn. Chúc mừng ngày vui của hai bạn!",
          "orderIndex": 26,
          "createdAt": "2026-11-09T05:27:35.871Z"
        },
        {
          "id": "cmw8tkukg000sswgnh3aplju0",
          "postId": "cmw8tkukf0000swgni59zz7hi",
          "url": "/uploads/folders/tai-nguyen-8/-276-thu-nhan-1793938085615-da15.webp",
          "alt": "Cô dâu chú rể trong lễ ăn hỏi truyền thống cùng bạn thân - Hành Trình Tình Yêu: Phóng Sự Cưới Đ",
          "caption": "Ngày vui trọn vẹn, nụ cười rạng rỡ bên những người thân yêu nhất. Chúc mừng hạnh phúc đôi uyên ương!",
          "orderIndex": 27,
          "createdAt": "2026-11-09T05:27:35.871Z"
        },
        {
          "id": "cmw8tkukg000tswgnkolkqp8l",
          "postId": "cmw8tkukf0000swgni59zz7hi",
          "url": "/uploads/folders/tai-nguyen-8/-272-thu-nhan-1793938070056-9sjm.webp",
          "alt": "Cô dâu chú rể trong nghi thức trao trang sức ngày cưới - Hành Trình Tình Yêu: Phóng Sự Cưới Đậm",
          "caption": "Nụ cười rạng rỡ ngày chung đôi, khởi đầu cho hành trình hạnh phúc viên mãn.",
          "orderIndex": 28,
          "createdAt": "2026-11-09T05:27:35.871Z"
        },
        {
          "id": "cmw8tkukg000uswgn50kltxm3",
          "postId": "cmw8tkukf0000swgni59zz7hi",
          "url": "/uploads/folders/tai-nguyen-8/-240-thu-nhan-1793938057240-3lds.webp",
          "alt": "Cô dâu trong tà áo dài đỏ cầm bó hoa sen trắng trong lễ cưới truyền thống - Hành Trình Tình Yêu",
          "caption": "Khoảnh khắc thiêng liêng trong tà áo dài đỏ, gửi gắm trọn vẹn tình yêu và sự gắn kết.",
          "orderIndex": 29,
          "createdAt": "2026-11-09T05:27:35.871Z"
        },
        {
          "id": "cmw8tkukg000vswgn9oz76k17",
          "postId": "cmw8tkukf0000swgni59zz7hi",
          "url": "/uploads/folders/tai-nguyen-8/-237-thu-nhan-1793938045525-9e5a.webp",
          "alt": "Khoảnh khắc mẹ trao nhẫn cưới cho cô dâu trong lễ đính hôn truyền thống - Hành Trình Tình Yêu:",
          "caption": "Khoảnh khắc thiêng liêng khi tình yêu được kết nối bằng chiếc nhẫn cưới trao tay.",
          "orderIndex": 30,
          "createdAt": "2026-11-09T05:27:35.871Z"
        },
        {
          "id": "cmw8tkukg000wswgngonuetkh",
          "postId": "cmw8tkukf0000swgni59zz7hi",
          "url": "/uploads/folders/tai-nguyen-8/-235-thu-nhan-1793938032516-rpij.webp",
          "alt": "Khoảnh khắc cô dâu hôn má mẹ trong lễ đính hôn truyền thống - Hành Trình Tình Yêu: Phóng Sự Cướ",
          "caption": "Khoảnh khắc yêu thương đong đầy trong ngày trọng đại. Chúc mừng hạnh phúc Tuyết Thu & Đình Nhân!",
          "orderIndex": 31,
          "createdAt": "2026-11-09T05:27:35.871Z"
        },
        {
          "id": "cmw8tkukg000xswgnpwcij3e1",
          "postId": "cmw8tkukf0000swgni59zz7hi",
          "url": "/uploads/folders/tai-nguyen-8/-229-thu-nhan-1793938018019-csz0.webp",
          "alt": "Cô dâu hôn mẹ trong lễ đính hôn truyền thống",
          "caption": "Khoảnh khắc tình thân thiêng liêng",
          "orderIndex": 32,
          "createdAt": "2026-11-09T05:27:35.871Z"
        },
        {
          "id": "cmw8tkukg000yswgnfx6n0h6m",
          "postId": "cmw8tkukf0000swgni59zz7hi",
          "url": "/uploads/folders/tai-nguyen-8/-224-thu-nhan-1793938003274-zxw2.webp",
          "alt": "Khoảnh khắc trao trang sức vàng cho cô dâu trong lễ đính hôn truyền thống - Hành Trình Tình Yêu",
          "caption": "Khoảnh khắc hạnh phúc ngày chung đôi, trọn vẹn nét đẹp truyền thống Việt Nam.",
          "orderIndex": 33,
          "createdAt": "2026-11-09T05:27:35.871Z"
        },
        {
          "id": "cmw8tkukg000zswgnneyz358e",
          "postId": "cmw8tkukf0000swgni59zz7hi",
          "url": "/uploads/folders/tai-nguyen-8/-222-thu-nhan-1793937990858-hk6j.webp",
          "alt": "Gia đình và cô dâu chú rể trong lễ ăn hỏi truyền thống - Hành Trình Tình Yêu: Phóng Sự Cưới Đậm",
          "caption": "Gói trọn khoảnh khắc sum vầy, ấm áp trong ngày vui trọng đại.",
          "orderIndex": 34,
          "createdAt": "2026-11-09T05:27:35.871Z"
        },
        {
          "id": "cmw8tkukg0010swgnlmc0yccy",
          "postId": "cmw8tkukf0000swgni59zz7hi",
          "url": "/uploads/folders/tai-nguyen-8/-202-thu-nhan-1793937975181-nbfd.webp",
          "alt": "Nghi thức trao nhẫn trong lễ đính hôn truyền thống với cô dâu chú rể trong trang phục áo dài đỏ",
          "caption": "Khoảnh khắc thiêng liêng trong ngày trọng đại, nơi tình yêu bắt đầu hành trình mới.",
          "orderIndex": 35,
          "createdAt": "2026-11-09T05:27:35.871Z"
        },
        {
          "id": "cmw8tkukg0011swgndl64w7xt",
          "postId": "cmw8tkukf0000swgni59zz7hi",
          "url": "/uploads/folders/tai-nguyen-8/-195-thu-nhan-1793937961594-n0o8.webp",
          "alt": "Khoảnh khắc chú rể đeo bông tai vàng cho cô dâu trong trang phục áo dài cưới truyền thống - Hàn",
          "caption": "Khoảnh khắc dịu dàng, nơi tình yêu bắt đầu từ những cử chỉ nhỏ nhất.",
          "orderIndex": 36,
          "createdAt": "2026-11-09T05:27:35.871Z"
        },
        {
          "id": "cmw8tkukg0012swgn7k9ivwp6",
          "postId": "cmw8tkukf0000swgni59zz7hi",
          "url": "/uploads/folders/tai-nguyen-8/-193-thu-nhan-1793937946489-hcp4.webp",
          "alt": "Cô dâu áo dài đỏ nhận trang sức trong lễ ăn hỏi - Hành Trình Tình Yêu: Phóng Sự Cưới Đậm Chất Đ",
          "caption": "Khoảnh khắc ngọt ngào và hạnh phúc trong ngày trọng đại.",
          "orderIndex": 37,
          "createdAt": "2026-11-09T05:27:35.871Z"
        },
        {
          "id": "cmw8tkukg0013swgnadvtvjsa",
          "postId": "cmw8tkukf0000swgni59zz7hi",
          "url": "/uploads/folders/tai-nguyen-8/-191-thu-nhan-1793937934282-nrey.webp",
          "alt": "Khoảnh khắc vui vẻ, tự nhiên của gia đình và bạn bè trong lễ cưới truyền thống - Hành Trình Tìn",
          "caption": "Những nụ cười rạng rỡ và khoảnh khắc đáng nhớ cùng người thân trong ngày trọng đại.",
          "orderIndex": 38,
          "createdAt": "2026-11-09T05:27:35.871Z"
        },
        {
          "id": "cmw8tkukg0014swgndlprs118",
          "postId": "cmw8tkukf0000swgni59zz7hi",
          "url": "/uploads/folders/tai-nguyen-8/-178-thu-nhan-1793937917320-5tz1.webp",
          "alt": "Cô dâu trong tà áo dài đỏ truyền thống và khoảnh khắc xuất hiện trong lễ cưới - Hành Trình Tình",
          "caption": "Khoảnh khắc rạng rỡ của cô dâu trong ngày trọng đại, khởi đầu cho hành trình hạnh phúc.",
          "orderIndex": 39,
          "createdAt": "2026-11-09T05:27:35.871Z"
        },
        {
          "id": "cmw8tkukg0015swgny0wkyc38",
          "postId": "cmw8tkukf0000swgni59zz7hi",
          "url": "/uploads/folders/tai-nguyen-8/-155-thu-nhan-1793937901432-yt9n.webp",
          "alt": "Nhóm phù dâu xinh xắn trong trang phục áo dài hồng pastel tại lễ Vu Quy - Hành Trình Tình Yêu:",
          "caption": "Dàn phù dâu xinh xắn trong sắc hồng ngọt ngào, cùng chung vui ngày hạnh phúc của cô dâu chú rể.",
          "orderIndex": 40,
          "createdAt": "2026-11-09T05:27:35.871Z"
        },
        {
          "id": "cmw8tkukg000mswgn7rlcroo0",
          "postId": "cmw8tkukf0000swgni59zz7hi",
          "url": "/uploads/folders/tai-nguyen-8/-345-thu-nhan-1793938172003-djj1.webp",
          "alt": "Cô dâu chú rể trong lễ rước dâu truyền thống - Hành Trình Tình Yêu: Phóng Sự Cưới Đậm Chất Điện",
          "caption": "Khoảnh khắc hạnh phúc vỡ òa trong ngày trọng đại. Chúc hai bạn mãi mãi bên nhau!",
          "orderIndex": 21,
          "createdAt": "2026-11-09T05:27:35.871Z"
        },
        {
          "id": "cmw8tkukg000pswgnn7e1pg6k",
          "postId": "cmw8tkukf0000swgni59zz7hi",
          "url": "/uploads/folders/tai-nguyen-8/-339-thu-nhan-1793938125364-phzj.webp",
          "alt": "Cô dâu chú rể trong lễ rước dâu truyền thống - Hành Trình Tình Yêu: Phóng Sự Cưới Đậm Chất Điện",
          "caption": "Khoảnh khắc rạng rỡ ngày chung đôi, khởi đầu cho hành trình hạnh phúc viên mãn.",
          "orderIndex": 24,
          "createdAt": "2026-11-09T05:27:35.871Z"
        },
        {
          "id": "cmw8tkukg000nswgny48yuik3",
          "postId": "cmw8tkukf0000swgni59zz7hi",
          "url": "/uploads/folders/tai-nguyen-8/-343-thu-nhan-1793938154133-r10x.webp",
          "alt": "Cô dâu chú rể trong lễ rước dâu truyền thống áo dài đỏ",
          "caption": "Sắc đỏ truyền thống trong ngày vui",
          "orderIndex": 22,
          "createdAt": "2026-11-09T05:27:35.871Z"
        },
        {
          "id": "cmw8tkukg000oswgn6ao77igr",
          "postId": "cmw8tkukf0000swgni59zz7hi",
          "url": "/uploads/folders/tai-nguyen-8/-341-thu-nhan-1793938137510-9q9m.webp",
          "alt": "Khoảnh khắc hạnh phúc của cô dâu, chú rể và mẹ trong lễ rước dâu truyền thống - Hành Trình Tình",
          "caption": "Khoảnh khắc rạng rỡ ngày chung đôi, nụ cười hạnh phúc lan tỏa trong ngày vui trọng đại.",
          "orderIndex": 23,
          "createdAt": "2026-11-09T05:27:35.871Z"
        },
        {
          "id": "cmw8tkukg0001swgntxf050dg",
          "postId": "cmw8tkukf0000swgni59zz7hi",
          "url": "/uploads/folders/tai-nguyen-8/-739-thu-nhan-1793938473936-vl5d.webp",
          "alt": "Cái nắm tay dịu dàng và đầy gắn kết của cô dâu chú rể trong trang phục cưới cao cấp - Hành Trìn",
          "caption": "Dưới ánh sáng ấm áp, cái nắm tay dịu dàng là lời hứa hẹn ngọt ngào cho một hành trình hạnh phúc vĩnh cửu.",
          "orderIndex": 0,
          "createdAt": "2026-11-09T05:27:35.871Z"
        },
        {
          "id": "cmw8tkukg000lswgn0l5drvh4",
          "postId": "cmw8tkukf0000swgni59zz7hi",
          "url": "/uploads/folders/tai-nguyen-8/-563-thu-nhan-1793938187050-5qlx.webp",
          "alt": "Khoảnh khắc gia đình hai bên trong lễ cưới truyền thống - Hành Trình Tình Yêu: Phóng Sự Cưới Đậ",
          "caption": "Gia đình là điểm tựa, là nơi bắt đầu cho hành trình hạnh phúc của đôi lứa.",
          "orderIndex": 20,
          "createdAt": "2026-11-09T05:27:35.871Z"
        },
        {
          "id": "cmw8tkukg0016swgngwyw7u3h",
          "postId": "cmw8tkukf0000swgni59zz7hi",
          "url": "/uploads/folders/tai-nguyen-8/-147-thu-nhan-1793937885658-cccn.webp",
          "alt": "Đội hình bê tráp nam trong lễ ăn hỏi với mâm quả rồng phượng truyền thống - Hành Trình Tình Yêu",
          "caption": "Đội hình bê tráp lịch lãm, sẵn sàng cho ngày vui trọng đại. Chúc mừng hạnh phúc đôi uyên ương!",
          "orderIndex": 41,
          "createdAt": "2026-11-09T05:27:35.871Z"
        }
      ]
    }
  ],
  "mediaFolder": [
    {
      "id": "cmw4esuej0000tcwsur57bi36",
      "name": "Bảng giá Plus Moments",
      "slug": "bang-gia-plus-moments",
      "createdAt": "2026-11-06T03:22:49.963Z",
      "updatedAt": "2026-11-09T16:20:20.462Z",
      "files": [
        {
          "id": "cmw4et5zx0006tcwsh6pv7flf",
          "name": "3.png",
          "url": "/uploads/folders/bang-gia-plus-moments/3-1793935384643-pwd2.webp",
          "size": 201752,
          "format": "WEBP",
          "width": 2560,
          "height": 3621,
          "folderId": "cmw4esuej0000tcwsur57bi36",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1eulHrDwM3bbJkIZaoc4TQdUkq39w98GH",
          "md5Checksum": "c5234d22ef2fe1b8315a3567e50ee89f",
          "createdAt": "2026-11-06T03:23:04.989Z",
          "updatedAt": "2026-11-09T16:20:20.498Z"
        },
        {
          "id": "cmw4et2ow0004tcwsq5ddh6hu",
          "name": "2.png",
          "url": "/uploads/folders/bang-gia-plus-moments/2-1793935380273-e8db.webp",
          "size": 463190,
          "format": "WEBP",
          "width": 2560,
          "height": 3621,
          "folderId": "cmw4esuej0000tcwsur57bi36",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "14W0nAPxRop3WEuLNHDG-xvY9rORiDC5M",
          "md5Checksum": "ecb45b76e0f2c27fc3d87834497a90b5",
          "createdAt": "2026-11-06T03:23:00.705Z",
          "updatedAt": "2026-11-09T16:20:20.498Z"
        },
        {
          "id": "cmw4esywp0002tcws43pd8r4t",
          "name": "1.png",
          "url": "/uploads/folders/bang-gia-plus-moments/1-1793935375389-vtyh.webp",
          "size": 394370,
          "format": "WEBP",
          "width": 2560,
          "height": 3621,
          "folderId": "cmw4esuej0000tcwsur57bi36",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1AmMQnsj5yilgShSxkZ9ottvoVGbmanO3",
          "md5Checksum": "17704a516002cfe464b02cb5dec22fa7",
          "createdAt": "2026-11-06T03:22:55.802Z",
          "updatedAt": "2026-11-09T16:20:20.499Z"
        }
      ]
    },
    {
      "id": "cmw4etvyp0009tcws7erdd458",
      "name": "1",
      "slug": "tai-nguyen-1",
      "createdAt": "2026-11-06T03:23:38.641Z",
      "updatedAt": "2026-11-09T16:20:20.463Z",
      "files": [
        {
          "id": "cmw4ew30o0019tcws9r0orpj6",
          "name": "NHD01602.JPG",
          "url": "/uploads/folders/tai-nguyen-1/nhd01602-1793935520263-r2wd.webp",
          "size": 453400,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyp0009tcws7erdd458",
          "aiContextChunk": {
            "tags": [
              "ảnh cưới",
              "áo dài cưới",
              "lễ ăn hỏi",
              "plusmoments",
              "chụp ảnh cưới truyền thống"
            ],
            "colorMood": "Tone màu đỏ rực rỡ kết hợp trắng tinh khôi, ánh sáng tự nhiên ngoài trời ấm áp và tươi sáng",
            "mainSubject": "Cô dâu chú rể trong trang phục áo dài đỏ truyền thống trao nhau nụ hôn lãng mạn",
            "suggestedAlt": "Cô dâu chú rể mặc áo dài đỏ trao nụ hôn trong lễ ăn hỏi truyền thống",
            "suggestedCaption": "Khoảnh khắc ngọt ngào ngày chung đôi, tình yêu đơm hoa trong sắc đỏ truyền thống.",
            "visualDescription": "Bức ảnh ghi lại khoảnh khắc lãng mạn trong lễ ăn hỏi truyền thống Việt Nam. Cô dâu và chú rể mặc áo dài đỏ rực rỡ, đang trao nhau nụ hôn nhẹ nhàng, cô dâu cầm bó hoa sen trắng tinh khôi. Xung quanh là dàn bê tráp nam và nữ mặc áo dài trắng, tay cầm phong bao lì xì đỏ có chữ Hỷ, tạo nên sự tương phản màu sắc nổi bật. Bối cảnh được trang trí hoa tươi rực rỡ, không khí ấm cúng và tràn đầy hạnh phúc."
          },
          "uploadedById": null,
          "driveFileId": "1ZleNZpQImsV_clHydpy0W4Ta24uO1NPC",
          "md5Checksum": "fed77b7f55190bc97b2a5e3b5dd0a94e",
          "createdAt": "2026-11-06T03:25:21.096Z",
          "updatedAt": "2026-11-09T16:20:20.500Z"
        },
        {
          "id": "cmw4evxc00017tcwsnt2l3dru",
          "name": "NHD01540.JPG",
          "url": "/uploads/folders/tai-nguyen-1/nhd01540-1793935512878-bc9w.webp",
          "size": 502650,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyp0009tcws7erdd458",
          "aiContextChunk": {
            "tags": [
              "lễ vu quy",
              "áo dài cưới",
              "chú rể",
              "ảnh cưới truyền thống",
              "plusmoments"
            ],
            "colorMood": "Tone màu đỏ chủ đạo, ấm áp, tươi vui và tràn đầy năng lượng ngày cưới",
            "mainSubject": "Chú rể mặc áo dài đỏ rạng rỡ trong lễ Vu Quy",
            "suggestedAlt": "Chú rể mặc áo dài đỏ rạng rỡ trong lễ Vu Quy truyền thống",
            "suggestedCaption": "Khoảnh khắc hạnh phúc vỡ òa của chú rể trong ngày lễ Vu Quy trọng đại.",
            "visualDescription": "Một chú rể Việt Nam đang cười rạng rỡ trong lễ Vu Quy, mặc áo dài truyền thống màu đỏ rực rỡ với họa tiết thêu tinh tế ở ngực. Anh đang giơ cao bó hoa cưới cầm tay, tạo dáng đầy phấn khích và hạnh phúc. Bối cảnh xung quanh được trang trí bằng hoa tươi rực rỡ, bảng hiệu 'LỄ VU QUY' nổi bật, không khí buổi lễ ấm cúng với sự hiện diện của khách mời phía dưới."
          },
          "uploadedById": null,
          "driveFileId": "1A3VWTtuzJlKLbLwgSx1hDrhKh6KLjDYB",
          "md5Checksum": "7da658312527b02e3811bf27188eba4e",
          "createdAt": "2026-11-06T03:25:13.728Z",
          "updatedAt": "2026-11-09T16:20:20.500Z"
        },
        {
          "id": "cmw4evs400015tcwsyfkupo9r",
          "name": "NHD01533.JPG",
          "url": "/uploads/folders/tai-nguyen-1/nhd01533-1793935506048-83sr.webp",
          "size": 729588,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyp0009tcws7erdd458",
          "aiContextChunk": {
            "tags": [
              "lễ vu quy",
              "áo dài cưới",
              "tráp ăn hỏi",
              "phong tục cưới Việt Nam",
              "PlusMoments"
            ],
            "colorMood": "Tone màu tươi sáng, rực rỡ với sắc đỏ chủ đạo, ánh sáng tự nhiên ngoài trời dịu nhẹ",
            "mainSubject": "Chú rể trong trang phục áo dài đỏ truyền thống cùng đội ngũ bê tráp trong lễ Vu Quy",
            "suggestedAlt": "Khoảnh khắc chú rể rạng rỡ trong lễ Vu Quy truyền thống tại PlusMoments Wedding",
            "suggestedCaption": "Ngày chung đôi rạng rỡ, khởi đầu cho hành trình hạnh phúc viên mãn. Chúc mừng ngày vui của hai bạn!",
            "visualDescription": "Bức ảnh ghi lại khoảnh khắc rạng rỡ trong lễ Vu Quy truyền thống. Chú rể mặc áo dài đỏ nổi bật, tay giơ cao bó hoa cưới, đứng dưới cổng hoa trang trí rực rỡ với tông màu đỏ, cam và trắng. Phía trước là đội ngũ bê tráp nam mặc áo dài trắng và nữ mặc áo dài trắng cách tân đang trao nhận các mâm quả cưới được bọc vải đỏ. Không gian tràn ngập sắc hoa tươi, tạo nên bầu không khí hân hoan, ấm cúng và đầy tính nghi lễ."
          },
          "uploadedById": null,
          "driveFileId": "1ylF97uTq0yktK6IZq-y-H1gwkq_fJwQX",
          "md5Checksum": "85937e0cc53dd6b4cf5086dac05abd4a",
          "createdAt": "2026-11-06T03:25:06.961Z",
          "updatedAt": "2026-11-09T16:20:20.501Z"
        },
        {
          "id": "cmw4evmql0013tcws7u5m0iam",
          "name": "NHD01344.JPG",
          "url": "/uploads/folders/tai-nguyen-1/nhd01344-1793935499144-w6sn.webp",
          "size": 285006,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyp0009tcws7erdd458",
          "aiContextChunk": {
            "tags": [
              "ảnh cưới",
              "áo dài cưới",
              "cô dâu",
              "plusmoments",
              "chụp ảnh cưới studio"
            ],
            "colorMood": "Tone màu đỏ chủ đạo kết hợp với sắc gỗ tự nhiên, ánh sáng studio mềm mại, tôn lên vẻ đẹp sang trọng và ấm áp.",
            "mainSubject": "Cô dâu mặc áo dài đỏ đính đá cầm quạt gỗ",
            "suggestedAlt": "Cô dâu mặc áo dài đỏ đính đá cầm quạt gỗ chụp ảnh cưới truyền thống",
            "suggestedCaption": "Nét duyên thầm trong tà áo dài đỏ, gửi trao trọn vẹn hạnh phúc ngày chung đôi.",
            "visualDescription": "Cô dâu mặc áo dài cưới màu đỏ rực rỡ với chi tiết đính kết đá pha lê tinh xảo ở cổ áo và tay áo. Cô dâu đang cầm một chiếc quạt xếp bằng gỗ màu nâu nhạt, che một phần khuôn mặt, để lộ nụ cười rạng rỡ với son môi đỏ cùng tông. Bộ móng tay được sơn màu nhũ vàng sang trọng, làm nổi bật vẻ đẹp đài các, truyền thống nhưng không kém phần hiện đại."
          },
          "uploadedById": null,
          "driveFileId": "160h0u3ejUpI81iNzIDMMlv1d56UEf0Vr",
          "md5Checksum": "4672d9e738a683687431627d527eee39",
          "createdAt": "2026-11-06T03:24:59.997Z",
          "updatedAt": "2026-11-09T16:20:20.501Z"
        },
        {
          "id": "cmw4evhiy0011tcws51hc3kd7",
          "name": "NHD01242.JPG",
          "url": "/uploads/folders/tai-nguyen-1/nhd01242-1793935492413-n4oa.webp",
          "size": 351854,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyp0009tcws7erdd458",
          "aiContextChunk": {
            "tags": [
              "ảnh cưới",
              "áo dài cưới",
              "lễ vu quy",
              "cô dâu",
              "plusmoments",
              "trang phục cưới truyền thống"
            ],
            "colorMood": "Tone màu đỏ chủ đạo kết hợp hồng pastel, ánh sáng studio dịu nhẹ, ấm áp và trang trọng",
            "mainSubject": "Cô dâu trong trang phục áo dài cưới truyền thống màu đỏ",
            "suggestedAlt": "Cô dâu mặc áo dài đỏ truyền thống trong lễ Vu Quy tại PlusMoments Wedding Studio",
            "suggestedCaption": "Nét đẹp truyền thống rạng rỡ của cô dâu trong ngày Lễ Vu Quy trọng đại.",
            "visualDescription": "Cô dâu Việt Nam trong trang phục áo dài cưới truyền thống màu đỏ rực rỡ, đính kết họa tiết tinh xảo ở ngực và phụ kiện mấn đội đầu cùng tông màu. Cô dâu trang điểm phong cách thanh lịch với son môi đỏ, đang đứng cạnh bàn tiệc được trang trí hoa tươi, trái cây và bảng tên 'Lễ Vu Quy'. Phông nền phía sau là backdrop tròn màu hồng pastel kết hợp hoa tươi đỏ và trắng, tạo nên không gian lễ cưới ấm cúng, sang trọng."
          },
          "uploadedById": null,
          "driveFileId": "16_7GSuzooRakww6yQ5h5i1JbOwWkM-_p",
          "md5Checksum": "245cc5734a50edced2376f3d672b92ef",
          "createdAt": "2026-11-06T03:24:53.242Z",
          "updatedAt": "2026-11-09T16:20:20.502Z"
        },
        {
          "id": "cmw4evc18000ztcwsg3jor3od",
          "name": "NHD01209.JPG",
          "url": "/uploads/folders/tai-nguyen-1/nhd01209-1793935485301-83ak.webp",
          "size": 269180,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyp0009tcws7erdd458",
          "aiContextChunk": {
            "tags": [
              "áo dài cưới",
              "cô dâu",
              "ảnh cưới truyền thống",
              "PlusMoments",
              "áo dài đỏ"
            ],
            "colorMood": "Tone màu đỏ chủ đạo kết hợp ánh sáng studio mềm mại, sang trọng và đậm chất truyền thống",
            "mainSubject": "Cô dâu trong trang phục áo dài cưới đỏ đính kết thủ công",
            "suggestedAlt": "Cô dâu mặc áo dài cưới đỏ đính kết đá sang trọng tại PlusMoments Wedding Studio",
            "suggestedCaption": "Sắc đỏ nồng nàn, nét duyên dáng của cô dâu trong ngày trọng đại. Một vẻ đẹp truyền thống đầy cuốn hút.",
            "visualDescription": "Cô dâu mặc áo dài cưới truyền thống màu đỏ rực rỡ, chất liệu lụa cao cấp với điểm nhấn là họa tiết hoa sen đính kết đá pha lê thủ công tinh xảo ở ngực và cổ tay. Cô dâu đội mấn đỏ đồng bộ, trang điểm với son môi đỏ quyến rũ, tay cầm chiếc quạt gỗ nhỏ xinh xắn. Bối cảnh studio tối giản với phông nền trung tính, làm nổi bật sắc đỏ sang trọng của trang phục."
          },
          "uploadedById": null,
          "driveFileId": "1xhuOndxbXDT2Hd8pysZyIXs7ctyRMlUu",
          "md5Checksum": "efa8ce621b404b4ed6ff7dc1c864149b",
          "createdAt": "2026-11-06T03:24:46.124Z",
          "updatedAt": "2026-11-09T16:20:20.503Z"
        },
        {
          "id": "cmw4ev6nr000xtcwsxoad9oo4",
          "name": "HD_09636.JPG",
          "url": "/uploads/folders/tai-nguyen-1/hd_09636-1793935478176-mi2b.webp",
          "size": 729596,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyp0009tcws7erdd458",
          "aiContextChunk": {
            "tags": [
              "lễ vu quy",
              "áo dài cưới",
              "ảnh cưới truyền thống",
              "plusmoments",
              "trang trí gia tiên"
            ],
            "colorMood": "Tone màu đỏ chủ đạo kết hợp ánh sáng ấm áp, sang trọng và truyền thống",
            "mainSubject": "Khoảnh khắc chú rể hôn má cô dâu trong lễ Vu Quy truyền thống",
            "suggestedAlt": "Khoảnh khắc hạnh phúc của cô dâu chú rể trong lễ Vu Quy truyền thống tại Việt Nam",
            "suggestedCaption": "Khoảnh khắc ngọt ngào trong ngày trọng đại, khởi đầu cho hành trình hạnh phúc viên mãn.",
            "visualDescription": "Bức ảnh ghi lại khoảnh khắc hạnh phúc trong lễ Vu Quy truyền thống Việt Nam. Cô dâu chú rể mặc áo dài đỏ rực rỡ, chú rể đang trao nụ hôn má ngọt ngào cho cô dâu trước sự chứng kiến của gia đình. Phông nền trang trí hoa tươi tông đỏ-trắng sang trọng với bảng tên dập nổi. Bàn tiệc trà được bày biện chỉn chu với tháp bánh, trái cây và ấm chén sứ cao cấp. Ánh sáng ấm áp lan tỏa, làm nổi bật không khí sum vầy, trang trọng."
          },
          "uploadedById": null,
          "driveFileId": "1x2HiLhCdSB7YVC6lCTdgNXWR2Q2dCvuk",
          "md5Checksum": "eff2dc3ea620413aa5dd811eef1c39e4",
          "createdAt": "2026-11-06T03:24:39.160Z",
          "updatedAt": "2026-11-09T16:20:20.503Z"
        },
        {
          "id": "cmw4ev0mk000vtcwsace1l2vh",
          "name": "HD_09432.JPG",
          "url": "/uploads/folders/tai-nguyen-1/hd_09432-1793935470452-r982.webp",
          "size": 641206,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyp0009tcws7erdd458",
          "aiContextChunk": {
            "tags": [
              "lễ vu quy",
              "áo dài cưới",
              "phụ dâu",
              "cô dâu",
              "plusmoments"
            ],
            "colorMood": "Tone màu tự nhiên, tươi sáng, nổi bật sắc đỏ truyền thống và sắc trắng tinh khôi",
            "mainSubject": "Cô dâu áo dài đỏ và dàn phụ dâu áo dài trắng trong lễ vu quy",
            "suggestedAlt": "Cô dâu áo dài đỏ và dàn phụ dâu áo dài trắng tại lễ vu quy",
            "suggestedCaption": "Khoảnh khắc ngọt ngào ngày trọng đại cùng những người chị em thân thiết.",
            "visualDescription": "Cô dâu mặc áo dài đỏ nổi bật với mấn đội đầu truyền thống, đang đứng cùng dàn phụ dâu mặc áo dài cách tân màu trắng thanh lịch. Phía sau là rạp cưới trang trí hoa tươi rực rỡ với bảng chữ Lễ Vu Quy truyền thống."
          },
          "uploadedById": null,
          "driveFileId": "1caE4qYsFpodTSmBa_xrWkZCnHmAUzcH8",
          "md5Checksum": "d32c7cb624fdd8d8b5e61d3aeb0208fc",
          "createdAt": "2026-11-06T03:24:31.340Z",
          "updatedAt": "2026-11-09T16:20:20.504Z"
        },
        {
          "id": "cmw4euv3s000ttcwsqwqk0k3v",
          "name": "HD_09419.JPG",
          "url": "/uploads/folders/tai-nguyen-1/hd_09419-1793935463255-vypk.webp",
          "size": 581398,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyp0009tcws7erdd458",
          "aiContextChunk": {
            "tags": [
              "ảnh cưới",
              "áo dài cưới",
              "lễ vu quy",
              "phù dâu",
              "cô dâu",
              "plusmoments"
            ],
            "colorMood": "Tone màu tươi sáng, rực rỡ với điểm nhấn là sắc đỏ của cô dâu trên nền trắng thanh lịch",
            "mainSubject": "Cô dâu trong trang phục áo dài đỏ truyền thống cùng dàn phù dâu áo dài trắng",
            "suggestedAlt": "Cô dâu áo dài đỏ cùng dàn phù dâu áo dài trắng trong ngày Lễ Vu Quy truyền thống",
            "suggestedCaption": "Khoảnh khắc rạng rỡ của cô dâu và dàn phù dâu xinh đẹp trong ngày Lễ Vu Quy trọng đại.",
            "visualDescription": "Bức ảnh chụp cô dâu mặc áo dài đỏ truyền thống cùng đội hình phù dâu mặc áo dài trắng tinh khôi trong ngày Lễ Vu Quy. Cô dâu nổi bật ở vị trí trung tâm với mấn đội đầu, tay cầm quạt xếp, trang điểm sắc sảo. Các phù dâu đứng hai bên với tư thế khoanh tay đồng nhất. Bối cảnh là cổng hoa cưới trang trí tông màu pastel và hoa tươi rực rỡ tại không gian ngoài trời."
          },
          "uploadedById": null,
          "driveFileId": "1R_0wPJmZLMOwHmOcAt3yjcC2GokgrwTj",
          "md5Checksum": "c6e7f98994b431d717584e3638891fd4",
          "createdAt": "2026-11-06T03:24:24.185Z",
          "updatedAt": "2026-11-09T16:20:20.504Z"
        },
        {
          "id": "cmw4euq0w000rtcwsemgzvzmf",
          "name": "HD_09384.JPG",
          "url": "/uploads/folders/tai-nguyen-1/hd_09384-1793935456781-z9bz.webp",
          "size": 494220,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyp0009tcws7erdd458",
          "aiContextChunk": {
            "tags": [
              "ảnh cưới",
              "áo dài cưới",
              "lễ vu quy",
              "cô dâu",
              "plusmoments",
              "trang phục cưới truyền thống"
            ],
            "colorMood": "Tone màu rực rỡ, tươi sáng, làm nổi bật sắc đỏ truyền thống trong không gian tiệc cưới ngoài trời",
            "mainSubject": "Cô dâu trong trang phục áo dài đỏ truyền thống tại Lễ Vu Quy",
            "suggestedAlt": "Cô dâu mặc áo dài đỏ truyền thống trong ngày Lễ Vu Quy tại PlusMoments Wedding",
            "suggestedCaption": "Nét duyên dáng của cô dâu trong tà áo dài đỏ ngày Lễ Vu Quy. Hạnh phúc bắt đầu từ những khoảnh khắc giản đơn.",
            "visualDescription": "Cô dâu Việt Nam trong ngày Lễ Vu Quy, mặc áo dài lụa đỏ truyền thống với chi tiết đính kết tinh tế ở cổ tay. Cô dâu đội mấn đỏ đồng bộ, đang xoay nhẹ tà áo dài tạo chuyển động mềm mại. Bối cảnh là cổng hoa cưới rực rỡ với các tông màu đỏ, cam, trắng và hồng, tạo không gian lễ cưới ấm cúng và trang trọng."
          },
          "uploadedById": null,
          "driveFileId": "1F9pCJdNakJ47D9eW50-iT5Bv6Y5ORCqy",
          "md5Checksum": "8336bcf14b1406d4f5fe81eaf4a82909",
          "createdAt": "2026-11-06T03:24:17.600Z",
          "updatedAt": "2026-11-09T16:20:20.505Z"
        },
        {
          "id": "cmw4eukkx000ptcws91rrv0jc",
          "name": "HD_09253.JPG",
          "url": "/uploads/folders/tai-nguyen-1/hd_09253-1793935449691-wthn.webp",
          "size": 163448,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyp0009tcws7erdd458",
          "aiContextChunk": {
            "tags": [
              "áo dài cưới",
              "cô dâu",
              "áo dài đỏ",
              "trang phục cưới",
              "plusmoments",
              "lễ ăn hỏi"
            ],
            "colorMood": "Tone màu đỏ chủ đạo kết hợp với ánh sáng tự nhiên dịu nhẹ, tạo cảm giác ấm áp, hạnh phúc và trang trọng",
            "mainSubject": "Cô dâu trong trang phục áo dài cưới đỏ đính đá sang trọng",
            "suggestedAlt": "Cô dâu mặc áo dài cưới đỏ đính đá sang trọng trong ngày lễ ăn hỏi",
            "suggestedCaption": "Sắc đỏ nồng nàn cho ngày hạnh phúc thêm trọn vẹn. Một vẻ đẹp truyền thống đầy tinh tế.",
            "visualDescription": "Cô dâu mặc áo dài cưới truyền thống màu đỏ rực rỡ với chất liệu lụa cao cấp, cổ áo và cổ tay được đính kết đá pha lê tỉ mỉ. Cô dâu đội mấn đỏ đồng bộ, trang điểm với son môi đỏ nổi bật, nụ cười rạng rỡ. Bối cảnh là không gian tiệc cưới ấm cúng, sang trọng với tông màu trung tính làm nền, tạo sự tập trung tối đa vào vẻ đẹp của trang phục."
          },
          "uploadedById": null,
          "driveFileId": "1ER5zDVDRZXqCzndxODu7DMncbHBaiFuI",
          "md5Checksum": "f4bef6bfa352ced0ce062c9d327a9c1b",
          "createdAt": "2026-11-06T03:24:10.545Z",
          "updatedAt": "2026-11-09T16:20:20.505Z"
        },
        {
          "id": "cmw4euewj000ntcwst0xvn6h1",
          "name": "HD_09203.JPG",
          "url": "/uploads/folders/tai-nguyen-1/hd_09203-1793935442285-ofgk.webp",
          "size": 319856,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyp0009tcws7erdd458",
          "aiContextChunk": {
            "tags": [
              "áo dài cưới",
              "lễ vu quy",
              "cô dâu",
              "truyền thống",
              "plusmoments"
            ],
            "colorMood": "Tone đỏ rực rỡ, ấm áp và trang trọng mang đậm bản sắc truyền thống",
            "mainSubject": "Cô dâu mặc áo dài đỏ truyền thống cầm quạt giấy",
            "suggestedAlt": "Cô dâu mặc áo dài đỏ truyền thống cầm quạt che mặt trong lễ cưới",
            "suggestedCaption": "Nét đẹp truyền thống dịu dàng và đằm thắm trong ngày trọng đại.",
            "visualDescription": "Cô dâu xinh đẹp mặc áo dài đỏ truyền thống đính kết tinh xảo, đội mấn đồng màu và tay cầm quạt giấy che nửa khuôn mặt tạo dáng duyên dáng, thanh lịch trong lễ vu quy với backdrop hoa tươi rực rỡ."
          },
          "uploadedById": null,
          "driveFileId": "12auQrC61DSkzs8Pa6HYGyJAUGKZxyki0",
          "md5Checksum": "49aecf803f631c381e26307940f7fc09",
          "createdAt": "2026-11-06T03:24:03.187Z",
          "updatedAt": "2026-11-09T16:20:20.506Z"
        },
        {
          "id": "cmw4eu7ue000ltcwsb83am6wn",
          "name": "HD_00085.JPG",
          "url": "/uploads/folders/tai-nguyen-1/hd_00085-1793935433174-hmwi.webp",
          "size": 414322,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyp0009tcws7erdd458",
          "aiContextChunk": {
            "tags": [
              "ảnh cưới",
              "lễ đính hôn",
              "khoảnh khắc cưới",
              "đám cưới truyền thống",
              "plusmoments"
            ],
            "colorMood": "Tone màu tự nhiên, tươi sáng, không khí vui vẻ và ấm áp",
            "mainSubject": "Nhóm bạn trẻ hào hứng chúc phúc trong lễ cưới",
            "suggestedAlt": "Khoảnh khắc bạn bè chúc phúc rạng rỡ trong lễ cưới truyền thống Việt Nam",
            "suggestedCaption": "Những nụ cười rạng rỡ của bạn bè là mảnh ghép hạnh phúc nhất trong ngày trọng đại.",
            "visualDescription": "Bức ảnh chụp góc nhìn qua khung hình tạo bởi cô dâu chú rể trong trang phục áo dài đỏ truyền thống ở tiền cảnh, làm mờ để tập trung vào nhóm bạn trẻ phía sau. Nhóm bạn gồm 4 người (2 nam, 2 nữ) đang hào hứng, che miệng cười rạng rỡ, thể hiện sự chúc phúc trong một buổi lễ đính hôn hoặc đám cưới ngoài trời. Phía trước là bó hoa sen trắng làm tiền cảnh mờ ảo. Bối cảnh trang trí hoa tươi, không gian ấm cúng, gần gũi."
          },
          "uploadedById": null,
          "driveFileId": "1xmoa8MVOKMbeVPBTkc4Cjas0S6ssjaJW",
          "md5Checksum": "910b040f4f2dba4aa89e8982d85cc5ec",
          "createdAt": "2026-11-06T03:23:54.039Z",
          "updatedAt": "2026-11-09T16:20:20.506Z"
        },
        {
          "id": "cmw4eu23h000jtcws5ly59h9h",
          "name": "HD_00024.JPG",
          "url": "/uploads/folders/tai-nguyen-1/hd_00024-1793935425648-gnzq.webp",
          "size": 596194,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyp0009tcws7erdd458",
          "aiContextChunk": {
            "tags": [
              "ảnh cưới",
              "lễ vu quy",
              "áo dài cưới",
              "cưới truyền thống",
              "plusmoments"
            ],
            "colorMood": "Tone màu đỏ chủ đạo rực rỡ, ánh sáng tự nhiên tươi sáng, không khí lễ hội vui tươi và ấm áp",
            "mainSubject": "Cô dâu chú rể trong trang phục áo dài đỏ truyền thống ngày cưới",
            "suggestedAlt": "Cô dâu chú rể mặc áo dài đỏ trong lễ Vu Quy truyền thống tại Việt Nam",
            "suggestedCaption": "Khoảnh khắc ngọt ngào ngày Vu Quy, khi tình yêu thăng hoa giữa sắc đỏ hạnh phúc.",
            "visualDescription": "Khoảnh khắc hạnh phúc trong lễ Vu Quy với cô dâu chú rể mặc áo dài truyền thống màu đỏ rực rỡ. Cô dâu đội mấn đỏ, chú rể mặc áo dài đỏ phối quần đen, cả hai đang ôm nhau tình tứ giữa không gian tràn ngập dải ruy băng màu sắc và pháo giấy tung bay. Phía sau là cổng hoa cưới trang trí rực rỡ với bảng hiệu 'LỄ VU QUY', xung quanh là người thân đang chúc mừng với bao lì xì đỏ."
          },
          "uploadedById": null,
          "driveFileId": "13SHfrPfg6k2by2R8SWRJ0U8FlasI8wgd",
          "md5Checksum": "192cd75fcf6193aeb4ecded4d0c41cc1",
          "createdAt": "2026-11-06T03:23:46.589Z",
          "updatedAt": "2026-11-09T16:20:20.507Z"
        }
      ]
    },
    {
      "id": "cmw4etvyp000atcwsqa5sydt8",
      "name": "2",
      "slug": "tai-nguyen-2",
      "createdAt": "2026-11-06T03:23:38.642Z",
      "updatedAt": "2026-11-09T16:20:20.463Z",
      "files": [
        {
          "id": "cmw4eyshx001ztcws3yrpxrvy",
          "name": "NHD05182.JPG",
          "url": "/uploads/folders/tai-nguyen-2/nhd05182-1793935647028-l0w7.webp",
          "size": 420734,
          "format": "WEBP",
          "width": 2338,
          "height": 3507,
          "folderId": "cmw4etvyp000atcwsqa5sydt8",
          "aiContextChunk": {
            "tags": [
              "ảnh cưới",
              "cô dâu",
              "hoa cài tóc",
              "phong cách tối giản",
              "plusmoments"
            ],
            "colorMood": "Đen trắng nghệ thuật, phong cách tối giản, ánh sáng tương phản cao",
            "mainSubject": "Chi tiết hoa lan cài tóc cô dâu",
            "suggestedAlt": "Cô dâu cài hoa lan trắng tinh tế trong ngày cưới",
            "suggestedCaption": "Vẻ đẹp thuần khiết tựa như đóa hoa lan, dịu dàng trong ngày trọng đại.",
            "visualDescription": "Bức ảnh đen trắng cận cảnh góc nghiêng phía sau của cô dâu với mái tóc búi thấp tinh tế. Điểm nhấn là những bông hoa lan trắng tươi tắn được cài khéo léo trên tóc, tạo nên vẻ đẹp thanh lịch và tự nhiên. Ánh sáng tương phản mạnh làm nổi bật đường nét bờ vai và kết cấu mềm mại của cánh hoa."
          },
          "uploadedById": null,
          "driveFileId": "1Pn5mYNWlAS_ImKx5OkeFrPiBxrV8Ky0P",
          "md5Checksum": "f2250145aab693e52d226713a2f437fb",
          "createdAt": "2026-11-06T03:27:27.429Z",
          "updatedAt": "2026-11-09T16:20:20.507Z"
        },
        {
          "id": "cmw4eykzq001xtcwsugbcb0rv",
          "name": "NHD04924.JPG",
          "url": "/uploads/folders/tai-nguyen-2/nhd04924-1793935637476-4t5e.webp",
          "size": 220256,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyp000atcwsqa5sydt8",
          "aiContextChunk": {
            "tags": [
              "ảnh cưới",
              "váy cưới ren",
              "cô dâu",
              "ảnh đen trắng",
              "studio",
              "plusmoments"
            ],
            "colorMood": "Đen trắng (Black and White) cổ điển, ánh sáng tương phản cao, mang phong cách nghệ thuật cinematic",
            "mainSubject": "Cô dâu trong chiếc váy cưới ren tinh tế đang tung khăn voan",
            "suggestedAlt": "Cô dâu mặc váy cưới ren sang trọng tung khăn voan trong studio ảnh cưới",
            "suggestedCaption": "Khoảnh khắc hạnh phúc rạng ngời, nơi vẻ đẹp tinh khôi hòa quyện cùng nghệ thuật nhiếp ảnh.",
            "visualDescription": "Bức ảnh đen trắng nghệ thuật chụp cô dâu từ góc nhìn từ trên cao xuống (high-angle shot). Cô dâu mặc chiếc váy cưới ren cầu kỳ với họa tiết hoa văn tinh xảo, tay cầm bó hoa cưới dáng dài (cascading bouquet) kết hợp từ nhiều loại hoa nhỏ. Cô dâu đang nhẹ nhàng tung bay chiếc khăn voan dài, tạo nên chuyển động mềm mại. Layout makeup tập trung vào sự thanh thoát, tóc búi gọn gàng sang trọng. Bối cảnh studio được trang trí với rèm vải xếp nếp và tường gạch, tạo chiều sâu cho khung hình."
          },
          "uploadedById": null,
          "driveFileId": "1lk8z6UyC_Ftt5vGsoLI8BMo2UijhByp7",
          "md5Checksum": "60fa29b0332cdcf6584fe994177132e2",
          "createdAt": "2026-11-06T03:27:17.702Z",
          "updatedAt": "2026-11-09T16:20:20.508Z"
        },
        {
          "id": "cmw4eychb001vtcwsju6dci67",
          "name": "NHD04906.JPG",
          "url": "/uploads/folders/tai-nguyen-2/nhd04906-1793935626398-bj4e.webp",
          "size": 551974,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyp000atcwsqa5sydt8",
          "aiContextChunk": {
            "tags": [
              "ảnh cưới",
              "váy cưới ren",
              "cô dâu",
              "ảnh cưới đen trắng",
              "plusmoments",
              "wedding photography"
            ],
            "colorMood": "Phong cách đen trắng cổ điển, ánh sáng nghệ thuật, sang trọng và đầy cảm xúc",
            "mainSubject": "Cô dâu trong chiếc váy cưới ren xòe lộng lẫy bên cổng hoa trang trí",
            "suggestedAlt": "Cô dâu mặc váy cưới ren lộng lẫy trong không gian tiệc cưới lãng mạn",
            "suggestedCaption": "Khoảnh khắc hạnh phúc trong chiếc váy cưới ren tinh khôi, lưu giữ vẻ đẹp vượt thời gian.",
            "visualDescription": "Bức ảnh đen trắng ghi lại khoảnh khắc cô dâu xinh đẹp trong chiếc váy cưới ren xòe lộng lẫy với họa tiết hoa văn tinh xảo. Cô dâu cầm bó hoa cưới cầm tay, đứng duyên dáng bên cạnh cổng hoa trang trí bằng vải voan mềm mại và hoa tươi. Khăn voan dài thướt tha tạo nên vẻ đẹp cổ điển, sang trọng. Bối cảnh là không gian tiệc cưới ngoài trời với nền gạch đá và ánh sáng dịu nhẹ, tạo nên bầu không khí lãng mạn và đầy cảm xúc."
          },
          "uploadedById": null,
          "driveFileId": "1-xx5Jcd6QvCxScZLFy5mMiMi1rFRlMWS",
          "md5Checksum": "2b7af763c97de710aefda1dea0a498f6",
          "createdAt": "2026-11-06T03:27:06.671Z",
          "updatedAt": "2026-11-09T16:20:20.509Z"
        },
        {
          "id": "cmw4ey53k001ttcwsqcvt18c9",
          "name": "NHD04882.JPG",
          "url": "/uploads/folders/tai-nguyen-2/nhd04882-1793935616861-f2wq.webp",
          "size": 393710,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyp000atcwsqa5sydt8",
          "aiContextChunk": {
            "tags": [
              "ảnh cưới",
              "tiệc cưới",
              "cô dâu chú rể",
              "ảnh đen trắng",
              "PlusMoments",
              "wedding photography"
            ],
            "colorMood": "Đen trắng (Black and White), phong cách điện ảnh, ánh sáng lung linh huyền ảo",
            "mainSubject": "Khoảnh khắc lãng mạn của cô dâu chú rể trong không gian tiệc cưới sang trọng",
            "suggestedAlt": "Khoảnh khắc lãng mạn của cô dâu chú rể trong tiệc cưới sang trọng tại PlusMoments",
            "suggestedCaption": "Khoảnh khắc tình yêu thăng hoa dưới ánh đèn lung linh. Một kỷ niệm đẹp tại PlusMoments Wedding Studio.",
            "visualDescription": "Bức ảnh đen trắng ghi lại khoảnh khắc lãng mạn của cô dâu chú rể trong không gian tiệc cưới sang trọng. Cô dâu diện váy cưới xòe bồng bềnh với họa tiết ren tinh xảo, tay cầm bó hoa cưới, trong khi chú rể lịch lãm trong bộ vest tối màu. Cặp đôi đứng giữa sân khấu dưới ánh đèn lung linh và hiệu ứng bong bóng bay lơ lửng, tạo nên khung cảnh cổ tích. Phía sau là màn hình LED lớn hiển thị tên cô dâu chú rể, kết hợp với kiến trúc trần nhà lắp kính và hệ thống đèn treo nghệ thuật."
          },
          "uploadedById": null,
          "driveFileId": "1VIDv6rUOZtTe0iZ-WpN51w7ztp78DUYj",
          "md5Checksum": "f3405bfad2b9b8b1a43ef2237d0f8538",
          "createdAt": "2026-11-06T03:26:57.104Z",
          "updatedAt": "2026-11-09T16:20:20.510Z"
        },
        {
          "id": "cmw4exv9a001rtcwse9ibzk24",
          "name": "HD_05971.JPG",
          "url": "/uploads/folders/tai-nguyen-2/hd_05971-1793935603999-89xt.webp",
          "size": 223794,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyp000atcwsqa5sydt8",
          "aiContextChunk": {
            "tags": [
              "ảnh cưới đen trắng",
              "khoảnh khắc lãng mạn",
              "tiệc cưới",
              "váy cưới ren",
              "PlusMoments"
            ],
            "colorMood": "Đen trắng cổ điển, ánh sáng cinematic, không gian tiệc cưới lung linh huyền ảo",
            "mainSubject": "Khoảnh khắc hôn nhau lãng mạn của cô dâu chú rể dưới ánh đèn lung linh",
            "suggestedAlt": "Ảnh cưới đen trắng lãng mạn của cô dâu chú rể dưới ánh đèn lung linh tại PlusMoments",
            "suggestedCaption": "Khoảnh khắc tình yêu thăng hoa dưới ánh đèn lung linh. Một kỷ niệm vĩnh cửu tại PlusMoments.",
            "visualDescription": "Bức ảnh đen trắng ghi lại khoảnh khắc lãng mạn của cô dâu chú rể trong tiệc cưới. Cô dâu mặc váy cưới xòe bồng bềnh với họa tiết ren tinh xảo, chú rể mặc vest lịch lãm. Cả hai đang trao nhau nụ hôn ngọt ngào giữa không gian tiệc tối được trang trí bằng hàng ngàn bóng đèn dây tóc lung linh, tạo hiệu ứng bokeh huyền ảo phía sau."
          },
          "uploadedById": null,
          "driveFileId": "1Ji_bbeDlnNR32VvdcF_wOjkugaJoTZKk",
          "md5Checksum": "f3c7f563eedb74bb5ce9f6df7eae7b6d",
          "createdAt": "2026-11-06T03:26:44.350Z",
          "updatedAt": "2026-11-09T16:20:20.510Z"
        },
        {
          "id": "cmw4exlzx001ptcwsqjlydypl",
          "name": "HD_05968.JPG",
          "url": "/uploads/folders/tai-nguyen-2/hd_05968-1793935592006-7wke.webp",
          "size": 179970,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyp000atcwsqa5sydt8",
          "aiContextChunk": {
            "tags": [
              "ảnh cưới",
              "váy cưới ren",
              "khoảnh khắc tiệc cưới",
              "ảnh đen trắng",
              "PlusMoments"
            ],
            "colorMood": "Đen trắng cổ điển, ánh sáng tương phản cao, phong cách điện ảnh sang trọng",
            "mainSubject": "Khoảnh khắc khiêu vũ lãng mạn của cô dâu chú rể dưới ánh đèn lung linh",
            "suggestedAlt": "Ảnh cưới đen trắng lãng mạn của cô dâu chú rể dưới ánh đèn lung linh tại PlusMoments",
            "suggestedCaption": "Khoảnh khắc tình yêu tỏa sáng giữa không gian tiệc cưới lung linh. Một kỷ niệm mãi mãi.",
            "visualDescription": "Bức ảnh đen trắng ghi lại khoảnh khắc lãng mạn của cô dâu chú rể trong tiệc cưới. Cô dâu mặc váy cưới ren họa tiết hoa cầu kỳ, khoác khăn voan mỏng manh, đang ôm chú rể trong bộ vest lịch lãm. Bối cảnh phía sau là không gian tiệc tối với hệ thống đèn dây treo lung linh tạo hiệu ứng bokeh huyền ảo, mang đậm chất điện ảnh."
          },
          "uploadedById": null,
          "driveFileId": "1_0tJ7fJStr_5Vnk16P5mPscE_G0IpLks",
          "md5Checksum": "618238b0f67151dbca80d0358ad701d2",
          "createdAt": "2026-11-06T03:26:32.349Z",
          "updatedAt": "2026-11-09T16:20:20.511Z"
        },
        {
          "id": "cmw4exca1001ntcwslbogb6u8",
          "name": "HD_05959.JPG",
          "url": "/uploads/folders/tai-nguyen-2/hd_05959-1793935579395-emwc.webp",
          "size": 249786,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyp000atcwsqa5sydt8",
          "aiContextChunk": {
            "tags": [
              "ảnh cưới",
              "váy cưới ren",
              "nụ hôn lãng mạn",
              "tiệc cưới lung linh",
              "plusmoments"
            ],
            "colorMood": "Đen trắng nghệ thuật, ánh sáng điện ảnh cinematic lấp lánh",
            "mainSubject": "Cô dâu chú rể trao nụ hôn ngọt ngào dưới bầu trời đèn lung linh",
            "suggestedAlt": "Khoảnh khắc hôn ngọt ngào của cô dâu chú rể dưới ánh đèn cưới lấp lánh",
            "suggestedCaption": "Nụ hôn ngọt ngào đánh dấu khoảnh khắc hạnh phúc vĩnh cửu tại PlusMoments.",
            "visualDescription": "Khoảnh khắc ngọt ngào khi cô dâu mặc chiếc váy cưới ren lộng lẫy ôm trọn đường cong, đội khăn voan tinh tế, đang say đắm trao nụ hôn tình tứ cho chú đang mặc vest lịch lãm. Bối cảnh tiệc cưới lung linh với hàng ngàn ánh đèn fairy light lấp lánh như bầu trời sao, mang đậm phong cách điện ảnh lãng mạn."
          },
          "uploadedById": null,
          "driveFileId": "1IZ3rRquNzIuThL_Dw7YZWb9UGL5k2xwn",
          "md5Checksum": "bc3c2edc67719b3f958dcc1d85a6cc04",
          "createdAt": "2026-11-06T03:26:19.753Z",
          "updatedAt": "2026-11-09T16:20:20.512Z"
        },
        {
          "id": "cmw4ex34r001ltcwscgui81bk",
          "name": "HD_05933.JPG",
          "url": "/uploads/folders/tai-nguyen-2/hd_05933-1793935567437-n0ad.webp",
          "size": 341802,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyp000atcwsqa5sydt8",
          "aiContextChunk": {
            "tags": [
              "ảnh cưới",
              "tiệc cưới",
              "khoảnh khắc hạnh phúc",
              "đen trắng",
              "plusmoments"
            ],
            "colorMood": "Phong cách đen trắng (Black & White) cổ điển, ánh sáng sân khấu cinematic đầy cảm xúc",
            "mainSubject": "Khoảnh khắc cô dâu chú rể tạo hình trái tim giữa không gian tiệc cưới lung linh",
            "suggestedAlt": "Cô dâu chú rể tạo hình trái tim trong tiệc cưới lung linh ánh đèn",
            "suggestedCaption": "Khoảnh khắc hạnh phúc vỡ òa, nơi tình yêu thăng hoa cùng những ánh đèn lung linh.",
            "visualDescription": "Bức ảnh đen trắng ghi lại khoảnh khắc hạnh phúc của cô dâu chú rể trong tiệc cưới. Cô dâu mặc váy cưới xòe bồng bềnh với chi tiết ren tinh tế, chú rể lịch lãm trong bộ vest tối màu. Cả hai đang cùng tạo hình trái tim bằng tay đầy tình tứ giữa không gian tràn ngập bong bóng xà phòng. Phía trên là hệ thống đèn trang trí lung linh tạo hiệu ứng ánh sáng tỏa tia nghệ thuật, kết hợp với logo tên viết tắt của cặp đôi được chiếu sáng nổi bật trên sàn."
          },
          "uploadedById": null,
          "driveFileId": "1HAPjjHTAyuQU5jdHZhNOpLIjp_sfqy4q",
          "md5Checksum": "4bc0b38b5c4f7e242e3013d39a208775",
          "createdAt": "2026-11-06T03:26:07.899Z",
          "updatedAt": "2026-11-09T16:20:20.512Z"
        },
        {
          "id": "cmw4ewsd2001jtcwslhysfhsa",
          "name": "HD_05832.JPG",
          "url": "/uploads/folders/tai-nguyen-2/hd_05832-1793935553589-2zuo.webp",
          "size": 303710,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyp000atcwsqa5sydt8",
          "aiContextChunk": {
            "tags": [
              "ảnh cưới đen trắng",
              "khoảnh khắc tiệc cưới",
              "cô dâu chú rể",
              "nghệ thuật nhiếp ảnh cưới",
              "plusmoments"
            ],
            "colorMood": "Đen trắng cổ điển, ánh sáng sân khấu cinematic kịch tính",
            "mainSubject": "Khoảnh khắc cô dâu chú rể rót rượu trong không gian tiệc cưới đầy bong bóng",
            "suggestedAlt": "Ảnh cưới đen trắng nghệ thuật cô dâu chú rể rót rượu trong tiệc cưới",
            "suggestedCaption": "Khoảnh khắc ngọt ngào, nơi tình yêu thăng hoa cùng những bong bóng hạnh phúc.",
            "visualDescription": "Bức ảnh đen trắng nghệ thuật chụp từ góc cao, ghi lại khoảnh khắc cô dâu chú rể đang cùng nhau rót rượu trong tiệc cưới. Cô dâu mặc váy cưới ren tinh tế với khăn voan dài, chú rể lịch lãm trong bộ vest tuxedo. Không gian xung quanh được bao phủ bởi những bong bóng xà phòng bay bổng dưới ánh đèn spotlight chiếu rọi, tạo nên hiệu ứng thị giác lung linh và huyền ảo."
          },
          "uploadedById": null,
          "driveFileId": "1d-fSACRuc4Qkd15vtV4VkObvYC6UlTnR",
          "md5Checksum": "e809e95ae37ac6d059d0e54d3650e781",
          "createdAt": "2026-11-06T03:25:53.943Z",
          "updatedAt": "2026-11-09T16:20:20.513Z"
        },
        {
          "id": "cmw4ewgnd001htcws3fk6rehr",
          "name": "HD_05816.jpg",
          "url": "/uploads/folders/tai-nguyen-2/hd_05816-1793935538567-83mv.webp",
          "size": 33500,
          "format": "WEBP",
          "width": 2031,
          "height": 3046,
          "folderId": "cmw4etvyp000atcwsqa5sydt8",
          "aiContextChunk": {
            "tags": [
              "logo cưới",
              "thiết kế tối giản",
              "ảnh cưới nghệ thuật",
              "plusmoments",
              "typography"
            ],
            "colorMood": "Đen trắng tối giản, tương phản cao, phong cách hiện đại và huyền bí",
            "mainSubject": "Logo chữ cái viết tắt N và P cách điệu với hiệu ứng chuyển động nghệ thuật",
            "suggestedAlt": "Logo chữ cái N và P cách điệu nghệ thuật trên nền đen sang trọng",
            "suggestedCaption": "N & P - Khởi đầu cho một hành trình tình yêu đầy cảm xúc và nghệ thuật.",
            "visualDescription": "Một tác phẩm nghệ thuật đồ họa tối giản trên nền đen sâu thẳm, nổi bật với các chữ cái viết tắt 'N' và 'P' được cách điệu tinh tế. Hiệu ứng chuyển động (motion blur) tạo ra các vệt sáng trắng mờ ảo, mang lại cảm giác hiện đại, sang trọng và đầy tính điện ảnh."
          },
          "uploadedById": null,
          "driveFileId": "1fYYv3KQAHuS9b_fajoPb2nfD8DjnCf8T",
          "md5Checksum": "6fafa203925922a1ca82235d11498450",
          "createdAt": "2026-11-06T03:25:38.761Z",
          "updatedAt": "2026-11-09T16:20:20.514Z"
        },
        {
          "id": "cmw4ewfjx001ftcwsds5avfh2",
          "name": "HD_05742.JPG",
          "url": "/uploads/folders/tai-nguyen-2/hd_05742-1793935536981-116n.webp",
          "size": 249976,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyp000atcwsqa5sydt8",
          "aiContextChunk": {
            "tags": [
              "ảnh cưới đen trắng",
              "váy cưới ren",
              "nghệ thuật ánh sáng",
              "plusmoments",
              "wedding photography"
            ],
            "colorMood": "Đen trắng (Black & White), phong cách điện ảnh, tương phản cao, huyền bí",
            "mainSubject": "Chi tiết đuôi váy cưới ren dài và hiệu ứng ánh sáng bokeh nghệ thuật",
            "suggestedAlt": "Ảnh cưới đen trắng nghệ thuật với váy cưới ren và hiệu ứng ánh sáng lung linh",
            "suggestedCaption": "Khoảnh khắc tỏa sáng trong đêm tiệc, nơi tình yêu trở thành tâm điểm của mọi ánh nhìn.",
            "visualDescription": "Bức ảnh đen trắng chụp từ góc cao, ghi lại khoảnh khắc cô dâu trong chiếc váy cưới ren dài thướt tha với phần đuôi xòe rộng. Ánh sáng từ đèn sân khấu tạo nên những đốm sáng bokeh lung linh, huyền ảo đổ bóng lên nền gạch, làm nổi bật họa tiết ren tinh xảo trên váy. Cô dâu đứng giữa không gian tiệc tối, tạo nên vẻ đẹp sang trọng, bí ẩn và đầy tính nghệ thuật."
          },
          "uploadedById": null,
          "driveFileId": "1Zjqh5H5lOkVg937NbX720tfTusL6OSVA",
          "md5Checksum": "c63522acc9c4c748a6512792ae3404b0",
          "createdAt": "2026-11-06T03:25:37.341Z",
          "updatedAt": "2026-11-09T16:20:20.514Z"
        },
        {
          "id": "cmw4ewaku001dtcwsadnb22y9",
          "name": "HD_05602.JPG",
          "url": "/uploads/folders/tai-nguyen-2/hd_05602-1793935530579-7pnb.webp",
          "size": 153826,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyp000atcwsqa5sydt8",
          "aiContextChunk": {
            "tags": [
              "ảnh cưới đen trắng",
              "chụp ảnh cưới nghệ thuật",
              "PlusMoments",
              "váy cưới ren",
              "ảnh cưới studio"
            ],
            "colorMood": "Đen trắng (Black and White), phong cách điện ảnh (cinematic), ánh sáng tương phản cao",
            "mainSubject": "Khoảnh khắc cô dâu chú rể trong trang phục cưới sang trọng với ánh sáng nghệ thuật",
            "suggestedAlt": "Ảnh cưới đen trắng nghệ thuật cô dâu chú rể sang trọng tại PlusMoments",
            "suggestedCaption": "Khoảnh khắc tình yêu vĩnh cửu, nơi thời gian như ngừng lại trong từng đường nét tinh tế.",
            "visualDescription": "Bức ảnh đen trắng nghệ thuật ghi lại khoảnh khắc cô dâu chú rể trong trang phục cưới sang trọng. Cô dâu mặc váy cưới ren tinh tế với khăn voan dài, mái tóc búi gọn gàng, gương mặt trang điểm nhẹ nhàng đang cúi nhìn bó hoa cưới cầm tay. Chú rể mặc vest tuxedo lịch lãm, xuất hiện mờ ảo ở phía dưới, tạo chiều sâu cho khung hình. Ánh sáng mạnh từ phía sau tạo hiệu ứng viền sáng (rim light) quanh chủ thể, làm nổi bật đường nét gương mặt và chi tiết ren trên váy."
          },
          "uploadedById": null,
          "driveFileId": "113Ly5GOfRPNYqz7mNSdpEcLc15lvJnhI",
          "md5Checksum": "57805e6198dd47160e7a64e2f9c2fb16",
          "createdAt": "2026-11-06T03:25:30.895Z",
          "updatedAt": "2026-11-09T16:20:20.515Z"
        },
        {
          "id": "cmw4ew7aa001btcwsigbmt0ay",
          "name": "HD_05419.JPG",
          "url": "/uploads/folders/tai-nguyen-2/hd_05419-1793935525781-qg81.webp",
          "size": 246712,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyp000atcwsqa5sydt8",
          "aiContextChunk": {
            "tags": [
              "ảnh cưới đen trắng",
              "váy cưới ren",
              "chụp ảnh cưới studio",
              "PlusMoments",
              "khoảnh khắc cưới"
            ],
            "colorMood": "Phong cách đen trắng (Black & White) cổ điển, ánh sáng tương phản cao, mang hơi hướng điện ảnh sang trọng",
            "mainSubject": "Khoảnh khắc tình tứ của cô dâu chú rể với chi tiết váy ren và nhẫn cưới",
            "suggestedAlt": "Ảnh cưới đen trắng lãng mạn, cô dâu chú rể trong trang phục cưới sang trọng",
            "suggestedCaption": "Khoảnh khắc tình yêu vĩnh cửu, nơi mỗi chi tiết nhỏ đều kể một câu chuyện hạnh phúc.",
            "visualDescription": "Bức ảnh đen trắng cận cảnh khoảnh khắc lãng mạn của cô dâu chú rể. Cô dâu mặc váy cưới cúp ngực ren tinh xảo, tay đeo vòng tay mảnh và nhẫn cưới, nhẹ nhàng đặt lên ngực chú rể. Chú rể lịch lãm trong bộ vest tuxedo tối màu, thắt nơ đen chỉn chu. Phía trước là bó hoa cưới cầm tay được làm từ các loại hoa dại và hoa hồng, tạo nên bố cục hài hòa, sang trọng."
          },
          "uploadedById": null,
          "driveFileId": "1tHeMwIjm23z_EyKVwYl9ks9JdjIDKB7I",
          "md5Checksum": "068704a08af0a921e81679cf05f7d33c",
          "createdAt": "2026-11-06T03:25:26.626Z",
          "updatedAt": "2026-11-09T16:20:20.515Z"
        }
      ]
    },
    {
      "id": "cmw4etvyq000btcws9vaf4li6",
      "name": "3",
      "slug": "tai-nguyen-3",
      "createdAt": "2026-11-06T03:23:38.642Z",
      "updatedAt": "2026-11-09T16:20:20.464Z",
      "files": [
        {
          "id": "cmw4f1pw5002jtcwsg5y2ail8",
          "name": "NHD09981.JPG",
          "url": "/uploads/folders/tai-nguyen-3/nhd09981-1793935783229-zvzw.webp",
          "size": 366698,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyq000btcws9vaf4li6",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1erbQo3HuesfP-FEc1BuelCOd1C7MD797",
          "md5Checksum": "7080bc88efd35239ecae1fdc8548d2d8",
          "createdAt": "2026-11-06T03:29:44.021Z",
          "updatedAt": "2026-11-09T16:20:20.516Z"
        },
        {
          "id": "cmw4f1ewb002htcwswuhcngbd",
          "name": "NHD09918.jpg",
          "url": "/uploads/folders/tai-nguyen-3/nhd09918-1793935769035-3dkr.webp",
          "size": 214478,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyq000btcws9vaf4li6",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1pNkqf6U-sfDv5pCw2eyZPjcxiyVLfwWI",
          "md5Checksum": "ee1eb5b3002d17a6c710d023023a1898",
          "createdAt": "2026-11-06T03:29:29.772Z",
          "updatedAt": "2026-11-09T16:20:20.516Z"
        },
        {
          "id": "cmw4f160k002ftcwsf1p4dchj",
          "name": "NHD09903.jpg",
          "url": "/uploads/folders/tai-nguyen-3/nhd09903-1793935757509-b60o.webp",
          "size": 289648,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyq000btcws9vaf4li6",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1Zzai_4EJQGB7TCXLcV_l0oCcpIhpO_xW",
          "md5Checksum": "9ed7526555d11317f068499796e72cb2",
          "createdAt": "2026-11-06T03:29:18.261Z",
          "updatedAt": "2026-11-09T16:20:20.516Z"
        },
        {
          "id": "cmw4f0v1s002dtcwsi5d554fe",
          "name": "NHD09455.jpg",
          "url": "/uploads/folders/tai-nguyen-3/nhd09455-1793935743314-wm5l.webp",
          "size": 249766,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyq000btcws9vaf4li6",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1Dxy3wMTo4RAYGusHPgSv8PZlwpyB6HZ5",
          "md5Checksum": "1d33454b1181bd8e6a26c402b92fe2f8",
          "createdAt": "2026-11-06T03:29:04.049Z",
          "updatedAt": "2026-11-09T16:20:20.517Z"
        },
        {
          "id": "cmw4f0jfy002btcwsufdny4rf",
          "name": "NHD09369.jpg",
          "url": "/uploads/folders/tai-nguyen-3/nhd09369-1793935728262-5dyx.webp",
          "size": 206262,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyq000btcws9vaf4li6",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1jYhBwc9Gg6X--5CCUDXA--Zm-ZBxYUiv",
          "md5Checksum": "466be17e915fb4387772c256206406ac",
          "createdAt": "2026-11-06T03:28:49.006Z",
          "updatedAt": "2026-11-09T16:20:20.517Z"
        },
        {
          "id": "cmw4f07ly0029tcws0he9gvoi",
          "name": "NHD09239.jpg",
          "url": "/uploads/folders/tai-nguyen-3/nhd09239-1793935712845-txzg.webp",
          "size": 334776,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyq000btcws9vaf4li6",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1-7DE_Sbayj37mxuBoxGfEDuKkEH4SxgI",
          "md5Checksum": "06d7fa0782ac002ec5bf656d30ee4d37",
          "createdAt": "2026-11-06T03:28:33.670Z",
          "updatedAt": "2026-11-09T16:20:20.518Z"
        },
        {
          "id": "cmw4ezutx0027tcwsavpw1l9g",
          "name": "NHD09211.jpg",
          "url": "/uploads/folders/tai-nguyen-3/nhd09211-1793935696371-3hy4.webp",
          "size": 178546,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyq000btcws9vaf4li6",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1f66H9CSEvT7Gm6eOF_kqwL1UbOtK1uaq",
          "md5Checksum": "7e065ef8177a1eea8a33ef82092563e4",
          "createdAt": "2026-11-06T03:28:17.109Z",
          "updatedAt": "2026-11-09T16:20:20.518Z"
        },
        {
          "id": "cmw4ezjhn0025tcwsfu46tui5",
          "name": "NHD09186.jpg",
          "url": "/uploads/folders/tai-nguyen-3/nhd09186-1793935681653-nory.webp",
          "size": 209560,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyq000btcws9vaf4li6",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1OXENt5R9oOK8joRi_3ws2cuNsoLi4KWx",
          "md5Checksum": "6285cb313c32bd85afe811b6a78b8295",
          "createdAt": "2026-11-06T03:28:02.412Z",
          "updatedAt": "2026-11-09T16:20:20.518Z"
        },
        {
          "id": "cmw4ezah50023tcws75ya24ws",
          "name": "NHD00005.JPG",
          "url": "/uploads/folders/tai-nguyen-3/nhd00005-1793935670002-cjqb.webp",
          "size": 182096,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyq000btcws9vaf4li6",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1JKe6jXCKN8P6CWB_dDfsKtPWh-H-9yze",
          "md5Checksum": "c6e6ba09c0c1735b53d0d788a4bab50f",
          "createdAt": "2026-11-06T03:27:50.729Z",
          "updatedAt": "2026-11-09T16:20:20.519Z"
        },
        {
          "id": "cmw4ez1n90021tcwsxe1x2fjn",
          "name": "HD_01587.jpg",
          "url": "/uploads/folders/tai-nguyen-3/hd_01587-1793935658488-4akm.webp",
          "size": 348764,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyq000btcws9vaf4li6",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1_XaToCTVTRlr_xYWH48BtUcnxCTtkmpu",
          "md5Checksum": "9b23941cb5d2b55f9b9a6888f26fa567",
          "createdAt": "2026-11-06T03:27:39.280Z",
          "updatedAt": "2026-11-09T16:20:20.519Z"
        }
      ]
    },
    {
      "id": "cmw4etvyq000ctcwsdyeykxfx",
      "name": "4",
      "slug": "tai-nguyen-4",
      "createdAt": "2026-11-06T03:23:38.643Z",
      "updatedAt": "2026-11-09T16:20:20.464Z",
      "files": [
        {
          "id": "cmw4f5age0037tcws9bmxfbrq",
          "name": "HD_03179.jpg",
          "url": "/uploads/folders/tai-nguyen-4/hd_03179-1793935949838-kynf.webp",
          "size": 415870,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyq000ctcwsdyeykxfx",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1X989nxmyE29feiQfW1CsdW59b0tyKOY5",
          "md5Checksum": "9cee89013dda1d39d2ee805078127dc1",
          "createdAt": "2026-11-06T03:32:30.638Z",
          "updatedAt": "2026-11-09T16:20:20.520Z"
        },
        {
          "id": "cmw4f4xvv0035tcwsay0bemrl",
          "name": "HD_03161.JPG",
          "url": "/uploads/folders/tai-nguyen-4/hd_03161-1793935933600-57or.webp",
          "size": 214432,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyq000ctcwsdyeykxfx",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1v1qch6_OGf914Ol8Tk7HlKsfCL1R7v5d",
          "md5Checksum": "f10abce0e06e2854265168f2371c7d8b",
          "createdAt": "2026-11-06T03:32:14.347Z",
          "updatedAt": "2026-11-09T16:20:20.520Z"
        },
        {
          "id": "cmw4f4od10033tcwsx25avp00",
          "name": "HD_03156.jpg",
          "url": "/uploads/folders/tai-nguyen-4/hd_03156-1793935921301-mee1.webp",
          "size": 144960,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyq000ctcwsdyeykxfx",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1_GXjDla7ljFl-WjDAguyVq4VQyNeaymt",
          "md5Checksum": "812e0819c8d3fbbd5b47312f3ae0a6b2",
          "createdAt": "2026-11-06T03:32:02.005Z",
          "updatedAt": "2026-11-09T16:20:20.520Z"
        },
        {
          "id": "cmw4f4fwr0031tcws4iqfza6t",
          "name": "HD_03130.jpg",
          "url": "/uploads/folders/tai-nguyen-4/hd_03130-1793935910317-eahb.webp",
          "size": 245490,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyq000ctcwsdyeykxfx",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "11Fwo92ZJ1MnKSeDjpaM3i8720N4vNxjm",
          "md5Checksum": "68366ace7d40bd1a31750cb6ac614409",
          "createdAt": "2026-11-06T03:31:51.052Z",
          "updatedAt": "2026-11-09T16:20:20.521Z"
        },
        {
          "id": "cmw4f44h8002ztcwsvse282xk",
          "name": "HD_03116.jpg",
          "url": "/uploads/folders/tai-nguyen-4/hd_03116-1793935895412-c2hb.webp",
          "size": 520752,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyq000ctcwsdyeykxfx",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1w8eZlCmh0iUI3_c7MscYim1qguDlJCOg",
          "md5Checksum": "e599da910ecd41e9c45b29f0b55d0dd8",
          "createdAt": "2026-11-06T03:31:36.237Z",
          "updatedAt": "2026-11-09T16:20:20.521Z"
        },
        {
          "id": "cmw4f3u96002xtcwsz3i1jvuk",
          "name": "HD_03113.jpg",
          "url": "/uploads/folders/tai-nguyen-4/hd_03113-1793935882387-scvw.webp",
          "size": 254730,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyq000ctcwsdyeykxfx",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1lcV1u55ILcCnZq9ovH-k2GLl7y4vGDj3",
          "md5Checksum": "35e41559ad96d7df86e5cc6c22ddef03",
          "createdAt": "2026-11-06T03:31:22.987Z",
          "updatedAt": "2026-11-09T16:20:20.521Z"
        },
        {
          "id": "cmw4f3ic2002vtcwssi9d1bza",
          "name": "HD_03088.jpg",
          "url": "/uploads/folders/tai-nguyen-4/hd_03088-1793935866760-3ekn.webp",
          "size": 365646,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyq000ctcwsdyeykxfx",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1rpzRC-7lJoMmr-6woOB4C7UQWCdbJCAJ",
          "md5Checksum": "0334bd72deddc0fbfbbf98a8c1d4680e",
          "createdAt": "2026-11-06T03:31:07.538Z",
          "updatedAt": "2026-11-09T16:20:20.522Z"
        },
        {
          "id": "cmw4f36i7002ttcwso9cw5zx4",
          "name": "HD_03007.jpg",
          "url": "/uploads/folders/tai-nguyen-4/hd_03007-1793935851383-3nzg.webp",
          "size": 495832,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyq000ctcwsdyeykxfx",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1JJMy3PP803rWzAnxeSr7uzikVq_HFJLj",
          "md5Checksum": "c6e50fe6f20077628b796883c1576190",
          "createdAt": "2026-11-06T03:30:52.207Z",
          "updatedAt": "2026-11-09T16:20:20.522Z"
        },
        {
          "id": "cmw4f2v79002rtcws3cxy8mao",
          "name": "HD_02991.jpg",
          "url": "/uploads/folders/tai-nguyen-4/hd_02991-1793935836775-nf2m.webp",
          "size": 179878,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyq000ctcwsdyeykxfx",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1IrbpenOJrN0cv8PCqN2mrlV3HUigahBx",
          "md5Checksum": "50612d1389de2cd530aa9641cbe590f6",
          "createdAt": "2026-11-06T03:30:37.558Z",
          "updatedAt": "2026-11-09T16:20:20.522Z"
        },
        {
          "id": "cmw4f2moa002ptcws731sdgb7",
          "name": "HD_02985.jpg",
          "url": "/uploads/folders/tai-nguyen-4/hd_02985-1793935825710-3b5p.webp",
          "size": 325394,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyq000ctcwsdyeykxfx",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1twCVCnUWV5efdiOyz6F-g5B2hSvYnzp0",
          "md5Checksum": "c4bb52f00f5167c69b783558c89a2e01",
          "createdAt": "2026-11-06T03:30:26.506Z",
          "updatedAt": "2026-11-09T16:20:20.523Z"
        },
        {
          "id": "cmw4f2c9k002ntcwsul4w3rv8",
          "name": "HD_02974.jpg",
          "url": "/uploads/folders/tai-nguyen-4/hd_02974-1793935812174-kh5d.webp",
          "size": 436052,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyq000ctcwsdyeykxfx",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1sgMPDkcDUEX4-FDuc1TmEinR19HC6Rkv",
          "md5Checksum": "a682dabeca7539a7d503cdaa0874326a",
          "createdAt": "2026-11-06T03:30:13.017Z",
          "updatedAt": "2026-11-09T16:20:20.523Z"
        },
        {
          "id": "cmw4f21xp002ltcwsulsjfzk9",
          "name": "HD_02886.jpg",
          "url": "/uploads/folders/tai-nguyen-4/hd_02886-1793935798798-cunn.webp",
          "size": 508900,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyq000ctcwsdyeykxfx",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "159hnPJhzva28hcJ_95-BX-VALd5N17Uv",
          "md5Checksum": "659f92c8f2accf79afc9dbc33d7b45d3",
          "createdAt": "2026-11-06T03:29:59.630Z",
          "updatedAt": "2026-11-09T16:20:20.523Z"
        }
      ]
    },
    {
      "id": "cmw4etvyr000dtcwsmuuleoje",
      "name": "5",
      "slug": "tai-nguyen-5",
      "createdAt": "2026-11-06T03:23:38.643Z",
      "updatedAt": "2026-11-09T16:20:20.464Z",
      "files": [
        {
          "id": "cmw4fsa0q0075tcwsv00ye0h7",
          "name": " [0080] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0080--1793937022523-8bhc.webp",
          "size": 300594,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1avRpVPvwQpCcTmcITRILTtgGP906fvUB",
          "md5Checksum": "02faeabce611b5001a635e133ed8f474",
          "createdAt": "2026-11-06T03:50:23.162Z",
          "updatedAt": "2026-11-09T16:20:20.524Z"
        },
        {
          "id": "cmw4fruuv0073tcwsxjda5518",
          "name": " [0079] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0079--1793937002673-iphj.webp",
          "size": 580230,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1F4tSfeRwdbssf31ARPiizco4rn-7deCE",
          "md5Checksum": "ffb00130f61736aef2e37fb911d6d4f5",
          "createdAt": "2026-11-06T03:50:03.511Z",
          "updatedAt": "2026-11-09T16:20:20.524Z"
        },
        {
          "id": "cmw4frgu60071tcwsl1ibhqrj",
          "name": " [0078] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0078--1793936984511-t2hv.webp",
          "size": 467132,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1hmiZvL7vQ1ZoY4a7Gc_V0S17LqN7YxAq",
          "md5Checksum": "b958a45442e86fd9d790c0c10a076cb3",
          "createdAt": "2026-11-06T03:49:45.343Z",
          "updatedAt": "2026-11-09T16:20:20.525Z"
        },
        {
          "id": "cmw4fr4mq006ztcwsonikpexc",
          "name": " [0077] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0077--1793936968685-p4n2.webp",
          "size": 513614,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "15nTyhBiGfoAGVpTVhxWX3Ekw9zdPNmic",
          "md5Checksum": "f399c63dae2e1166d4b42bdceaf13fe0",
          "createdAt": "2026-11-06T03:49:29.522Z",
          "updatedAt": "2026-11-09T16:20:20.525Z"
        },
        {
          "id": "cmw4fqpbq006xtcws2u3gpmgs",
          "name": " [0076] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0076--1793936948800-9uhu.webp",
          "size": 486954,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "18j8Tfvf1rXmtBQODpuDCGRboD8667e8w",
          "md5Checksum": "9edac4cc2114be535db9792298b0bc36",
          "createdAt": "2026-11-06T03:49:09.686Z",
          "updatedAt": "2026-11-09T16:20:20.525Z"
        },
        {
          "id": "cmw4fq8jm006vtcwsya0a3s2x",
          "name": " [0075] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0075--1793936927350-aybe.webp",
          "size": 160108,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1mZTVelwXaESx5dINqvr8vBOMDd3IKn0M",
          "md5Checksum": "5c4367ae126f2419f18b5ad503eeec08",
          "createdAt": "2026-11-06T03:48:47.939Z",
          "updatedAt": "2026-11-09T16:20:20.526Z"
        },
        {
          "id": "cmw4fptxt006ttcwsi5hyi9cu",
          "name": " [0074] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0074--1793936908248-ijsm.webp",
          "size": 178408,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "13Vyp5UJYDmaPc6PElaaFj6M7bwZmUUze",
          "md5Checksum": "895619e19c312ba2eb01ae0ed26782dc",
          "createdAt": "2026-11-06T03:48:29.009Z",
          "updatedAt": "2026-11-09T16:20:20.526Z"
        },
        {
          "id": "cmw4fph4y006rtcwspeyo4zt5",
          "name": " [0073] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0073--1793936891596-qffs.webp",
          "size": 370946,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1q5pojM0DepnsKZrHqwdbdsPrG_ZFjSOV",
          "md5Checksum": "239cc28b0d38bad76463a05d7330c189",
          "createdAt": "2026-11-06T03:48:12.418Z",
          "updatedAt": "2026-11-09T16:20:20.526Z"
        },
        {
          "id": "cmw4fp441006ptcws8x7otxb5",
          "name": " [0072] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0072--1793936874962-29k7.webp",
          "size": 194246,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1M6SLe0FyRbiFMK027UDKlG6114NDCg8w",
          "md5Checksum": "9a4b5dff57cfc8c3a78e08167f302ac7",
          "createdAt": "2026-11-06T03:47:55.537Z",
          "updatedAt": "2026-11-09T16:20:20.527Z"
        },
        {
          "id": "cmw4fotxx006ntcwsdh4id7lr",
          "name": " [0071] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0071--1793936861764-aoxu.webp",
          "size": 210332,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1oi50jPfyl7HE09NFkBFNM_R-U7NPEvsi",
          "md5Checksum": "b26feb235b024c246acbc29f89c80259",
          "createdAt": "2026-11-06T03:47:42.357Z",
          "updatedAt": "2026-11-09T16:20:20.527Z"
        },
        {
          "id": "cmw4foj4k006ltcwsy9pow2nk",
          "name": " [0070] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0070--1793936847441-gz7w.webp",
          "size": 242860,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1tX3dZdiUnjkDVbKxrfxo0prr872sYvgu",
          "md5Checksum": "ce970428e44a31e9f98b716c88cf96ff",
          "createdAt": "2026-11-06T03:47:28.340Z",
          "updatedAt": "2026-11-09T16:20:20.527Z"
        },
        {
          "id": "cmw4fo6yn006jtcwsnbob0ko3",
          "name": " [0069] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0069--1793936831668-bu7k.webp",
          "size": 394664,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "15WAzo2YcVYTQ9u9fv9_US00L61c3QFsD",
          "md5Checksum": "fda25196177ab411f4feb3b5cfa14114",
          "createdAt": "2026-11-06T03:47:12.576Z",
          "updatedAt": "2026-11-09T16:20:20.528Z"
        },
        {
          "id": "cmw4fnw6t006htcwstagjqkdn",
          "name": " [0068] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0068--1793936817785-pvvg.webp",
          "size": 280262,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1ExGreaSyczddqeCvtAT6W0eVD4sxBIc2",
          "md5Checksum": "0acb3f8a09564dc255998e83b1a3694f",
          "createdAt": "2026-11-06T03:46:58.613Z",
          "updatedAt": "2026-11-09T16:20:20.528Z"
        },
        {
          "id": "cmw4fnj7q006ftcwsldk58i7h",
          "name": " [0067] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0067--1793936800944-97ch.webp",
          "size": 287670,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1-WFcnxqqXDIO2awqeB7mDdlxKVJCeEmM",
          "md5Checksum": "6de30a24eee46c06b43c42e1e25b28a0",
          "createdAt": "2026-11-06T03:46:41.798Z",
          "updatedAt": "2026-11-09T16:20:20.529Z"
        },
        {
          "id": "cmw4fn7wy006dtcwsjkgvazz9",
          "name": " [0066] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0066--1793936786360-toll.webp",
          "size": 160962,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1Tsm5GiOlt_o9IV3hE2TV7n7UTcWONMUz",
          "md5Checksum": "a0905285824e5f1bf83afd4b2d0a9fff",
          "createdAt": "2026-11-06T03:46:27.154Z",
          "updatedAt": "2026-11-09T16:20:20.529Z"
        },
        {
          "id": "cmw4fmvun006btcwsb3yyeybk",
          "name": " [0065] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0065--1793936770637-y5x1.webp",
          "size": 331466,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1uJGeakmfXCkSO0GHH9b5NN5tCwn06OVL",
          "md5Checksum": "e3b55c3a838a05cfdd4a0ad66953bb49",
          "createdAt": "2026-11-06T03:46:11.520Z",
          "updatedAt": "2026-11-09T16:20:20.529Z"
        },
        {
          "id": "cmw4fmipf0069tcws4secyj3a",
          "name": " [0063] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0063--1793936753306-guhu.webp",
          "size": 302912,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "18vyO-OEGL-tiC0CXEYI-g0epDsq72GWr",
          "md5Checksum": "620f2cbbfff768e7aa009e6fafc50be4",
          "createdAt": "2026-11-06T03:45:54.483Z",
          "updatedAt": "2026-11-09T16:20:20.530Z"
        },
        {
          "id": "cmw4fm8mg0067tcwsrbqdaeqj",
          "name": " [0062] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0062--1793936740554-28pf.webp",
          "size": 229894,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1h87EjN-IjURj1Kk3O-plV1Nl0NxIsG5A",
          "md5Checksum": "fa4a416cb0c238f581940e943f017bd8",
          "createdAt": "2026-11-06T03:45:41.416Z",
          "updatedAt": "2026-11-09T16:20:20.530Z"
        },
        {
          "id": "cmw4flxp10065tcwsrqx1lk3k",
          "name": " [0061] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0061--1793936726431-3u1m.webp",
          "size": 314982,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1vhiOjUEkpmRRfjjNkLi1TpSzQfy1Jifm",
          "md5Checksum": "87497cb9f59f8b803da74b676d3b882d",
          "createdAt": "2026-11-06T03:45:27.253Z",
          "updatedAt": "2026-11-09T16:20:20.530Z"
        },
        {
          "id": "cmw4flkgt0063tcwsqoqmuo5s",
          "name": " [0060] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0060--1793936709226-k23o.webp",
          "size": 439754,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1CJE4ixBPfMyFdJTvpAeXohLIm5D1K2vV",
          "md5Checksum": "b03b01d43e9d0acb1c11e793d8bef5be",
          "createdAt": "2026-11-06T03:45:10.110Z",
          "updatedAt": "2026-11-09T16:20:20.531Z"
        },
        {
          "id": "cmw4fl99b0061tcwsw88p0pul",
          "name": " [0058] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0058--1793936694904-eos1.webp",
          "size": 797266,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1wzE5xLPuwO86gnO15ZlsGXJyQAj0hb3f",
          "md5Checksum": "33a380489cf15b949a233c23d7c771bb",
          "createdAt": "2026-11-06T03:44:55.583Z",
          "updatedAt": "2026-11-09T16:20:20.531Z"
        },
        {
          "id": "cmw4fkupc005ztcwsalmv3mdi",
          "name": " [0057] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0057--1793936675980-w94v.webp",
          "size": 1032342,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1SaLISwMpLggN7gyRqYmaSZT2NOHbD1kb",
          "md5Checksum": "9a17cf576b5c5a9816ccd2a24474dd9c",
          "createdAt": "2026-11-06T03:44:36.720Z",
          "updatedAt": "2026-11-09T16:20:20.531Z"
        },
        {
          "id": "cmw4fki24005xtcws4af48gap",
          "name": " [0056] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0056--1793936659796-ph9t.webp",
          "size": 444116,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1HnNg6nbYLeJeGBLI1cLDyoFR6-HoI7Ea",
          "md5Checksum": "5267868d282d5de4537ec70eac4b6f10",
          "createdAt": "2026-11-06T03:44:20.333Z",
          "updatedAt": "2026-11-09T16:20:20.532Z"
        },
        {
          "id": "cmw4fk7kt005vtcws85lsaopd",
          "name": " [0054] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0054--1793936646116-otpl.webp",
          "size": 267796,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1mbUOTYNLRscFO2hE8otZM_BvLIoNUZUY",
          "md5Checksum": "a88d606d0a5da02027e06c095808a72b",
          "createdAt": "2026-11-06T03:44:06.749Z",
          "updatedAt": "2026-11-09T16:20:20.532Z"
        },
        {
          "id": "cmw4fjuyi005ttcwsm5dehg8n",
          "name": " [0053] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0053--1793936629424-6wcc.webp",
          "size": 483348,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1abtiO6GH3feB5zWB2TFAjzNh5SDXj1d8",
          "md5Checksum": "5ac2ae3c76d11d6688dd586485f092b2",
          "createdAt": "2026-11-06T03:43:50.389Z",
          "updatedAt": "2026-11-09T16:20:20.532Z"
        },
        {
          "id": "cmw4fjidu005rtcws663zhxxj",
          "name": " [0051] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0051--1793936613502-8u64.webp",
          "size": 111152,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1Odv-rPLBvzl6FGM01Fmyw9VPxjyw5SPR",
          "md5Checksum": "f0486f5d93b659c1f5b45c86e35c0404",
          "createdAt": "2026-11-06T03:43:34.098Z",
          "updatedAt": "2026-11-09T16:20:20.533Z"
        },
        {
          "id": "cmw4fj4mb005ptcwsqlva6r37",
          "name": " [0050] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0050--1793936595278-8qet.webp",
          "size": 1400448,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1DvrMnei2-AYslTFz4P1GaeKC1PSnwUP6",
          "md5Checksum": "98709520847b774bf7ee62b63426a0dd",
          "createdAt": "2026-11-06T03:43:16.260Z",
          "updatedAt": "2026-11-09T16:20:20.533Z"
        },
        {
          "id": "cmw4firf6005ntcws00zfalug",
          "name": " [0049] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0049--1793936578201-p1wx.webp",
          "size": 861542,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "11d3pj7ZdfDP8rFs_C6BOQNt-lvbsYuht",
          "md5Checksum": "4c7d7cdc6be1f4d8bf199fb6fdfb5327",
          "createdAt": "2026-11-06T03:42:59.146Z",
          "updatedAt": "2026-11-09T16:20:20.534Z"
        },
        {
          "id": "cmw4fifkv005ltcwsbxnltezp",
          "name": " [0047] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0047--1793936563359-9pv5.webp",
          "size": 887878,
          "format": "WEBP",
          "width": 2160,
          "height": 3240,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1telQq2OHOKZ8NG_y8Fr0jYpnjlVHxgb2",
          "md5Checksum": "b6c3c4972be4676b1a9d1a3981199d76",
          "createdAt": "2026-11-06T03:42:43.808Z",
          "updatedAt": "2026-11-09T16:20:20.534Z"
        },
        {
          "id": "cmw4fi4rj005jtcwsic2ua1gq",
          "name": " [0046] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0046--1793936548926-bavg.webp",
          "size": 546256,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "16jrYDlT4tx8vZtFTykOGFtVBoOJhYGMr",
          "md5Checksum": "b4656aa3b787d857948ed57617919895",
          "createdAt": "2026-11-06T03:42:29.791Z",
          "updatedAt": "2026-11-09T16:20:20.534Z"
        },
        {
          "id": "cmw4fhszk005htcwscy4f693y",
          "name": " [0045] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0045--1793936533645-zj1s.webp",
          "size": 576444,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "15QuUEe9wQtR56nCm5poO4h4fs8qiSCuV",
          "md5Checksum": "4a36cbf3f004904f08892b91e14edd39",
          "createdAt": "2026-11-06T03:42:14.528Z",
          "updatedAt": "2026-11-09T16:20:20.535Z"
        },
        {
          "id": "cmw4fhgok005ftcwsy94aagu0",
          "name": " [0044] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0044--1793936517942-cg1n.webp",
          "size": 330556,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1r_BK4IDbkLP_xKLb8K53Hk2dC6r4yKYf",
          "md5Checksum": "b8654fd7c937a6cf660d4183e29712cc",
          "createdAt": "2026-11-06T03:41:58.581Z",
          "updatedAt": "2026-11-09T16:20:20.535Z"
        },
        {
          "id": "cmw4fh3ag005dtcws319u78m7",
          "name": " [0043] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0043--1793936500356-o8x2.webp",
          "size": 540320,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1fImrdj18PtDJUs94-BTqx3jokUyORtma",
          "md5Checksum": "d11dbbcc1885fc9f52a232574d2756e8",
          "createdAt": "2026-11-06T03:41:41.225Z",
          "updatedAt": "2026-11-09T16:20:20.535Z"
        },
        {
          "id": "cmw4fgspt005btcwsq6jusq8w",
          "name": " [0042] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0042--1793936486745-hmuo.webp",
          "size": 282072,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1w7ga6EYB0J0QjmxXOjwDomuP6YyzSXNA",
          "md5Checksum": "2940ad45df6729d8a41377b18d7cdc61",
          "createdAt": "2026-11-06T03:41:27.521Z",
          "updatedAt": "2026-11-09T16:20:20.536Z"
        },
        {
          "id": "cmw4fgibk0059tcwsg57cmw3y",
          "name": " [0041] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0041--1793936473251-z6kw.webp",
          "size": 381740,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1qs7aoF4iWCkYezqGxHDr9PNjtArmNwrf",
          "md5Checksum": "65ea6b9a6e74c9adef6209e528d7bda3",
          "createdAt": "2026-11-06T03:41:14.048Z",
          "updatedAt": "2026-11-09T16:20:20.536Z"
        },
        {
          "id": "cmw4fg6nj0057tcwsiiuhfn91",
          "name": " [0040] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0040--1793936458102-ejtp.webp",
          "size": 407942,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1e103IP_oaW0u-QBOe_hcw43gcUnWtjXj",
          "md5Checksum": "91ad1a28cc98c8a8a35a4d22280cf435",
          "createdAt": "2026-11-06T03:40:58.927Z",
          "updatedAt": "2026-11-09T16:20:20.537Z"
        },
        {
          "id": "cmw4ffwng0055tcws5vtb2x9j",
          "name": " [0039] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0039--1793936445053-3x24.webp",
          "size": 926480,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1xdY4wZb9aLygnj9WkufzffcDqSIV6GBT",
          "md5Checksum": "934ab6a37867f67947308f0ed7126b3a",
          "createdAt": "2026-11-06T03:40:45.964Z",
          "updatedAt": "2026-11-09T16:20:20.537Z"
        },
        {
          "id": "cmw4fflrd0053tcwsk52jf8eh",
          "name": " [0038] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0038--1793936431151-np4y.webp",
          "size": 101018,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1lW20AFNB4I6gDVBZNN-E44k_gyaodQgv",
          "md5Checksum": "d90b0bae7b47392f54762ec73f93e155",
          "createdAt": "2026-11-06T03:40:31.849Z",
          "updatedAt": "2026-11-09T16:20:20.537Z"
        },
        {
          "id": "cmw4ffc5y0051tcwsmttzl5bm",
          "name": " [0037] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0037--1793936418695-18xr.webp",
          "size": 123868,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1LZJ0eICrwIsdUEL_JqV3B9CzL8pfbqwD",
          "md5Checksum": "85af96cfcd3da64faa0bfb86022c560a",
          "createdAt": "2026-11-06T03:40:19.414Z",
          "updatedAt": "2026-11-09T16:20:20.538Z"
        },
        {
          "id": "cmw4ff1at004ztcwsp3w454zu",
          "name": " [0036] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0036--1793936404589-qitb.webp",
          "size": 203610,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1yPe-di7lOxEI9gS9GEeX9Dyx8N1XGPsW",
          "md5Checksum": "31b30309df8c8e31db480d2022e16bdc",
          "createdAt": "2026-11-06T03:40:05.333Z",
          "updatedAt": "2026-11-09T16:20:20.538Z"
        },
        {
          "id": "cmw4ferph004xtcwso262nolw",
          "name": " [0034] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0034--1793936392094-33l0.webp",
          "size": 312020,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1V5uu2QyV6Lezu_eMc577rv6F4Ag7IqfE",
          "md5Checksum": "cad89102f1bdc0b898d6f8a46042efa8",
          "createdAt": "2026-11-06T03:39:52.901Z",
          "updatedAt": "2026-11-09T16:20:20.538Z"
        },
        {
          "id": "cmw4feeeq004vtcwsoyyleos1",
          "name": " [0033] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0033--1793936374821-rbon.webp",
          "size": 405198,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1xKmbXw79j5yfqvLG3fkm_REBzivUQjqg",
          "md5Checksum": "bcb862da1c34ea240ab4e6fbfa901bbb",
          "createdAt": "2026-11-06T03:39:35.666Z",
          "updatedAt": "2026-11-09T16:20:20.539Z"
        },
        {
          "id": "cmw4fe1n8004ttcwsl4ukprz0",
          "name": " [0032] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0032--1793936358341-ywas.webp",
          "size": 261148,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1-BzmflJywxmuPkhCPnnzJEydIn84gsQD",
          "md5Checksum": "ab71a0016a1485070687141eee370e36",
          "createdAt": "2026-11-06T03:39:19.124Z",
          "updatedAt": "2026-11-09T16:20:20.539Z"
        },
        {
          "id": "cmw4fdp90004rtcws79zut8io",
          "name": " [0031] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0031--1793936342241-xrio.webp",
          "size": 258472,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1CIecYvjD9vCaxUKXyGwwpItphcoBrY00",
          "md5Checksum": "1a20661f378b63e214f60e568305d356",
          "createdAt": "2026-11-06T03:39:03.060Z",
          "updatedAt": "2026-11-09T16:20:20.539Z"
        },
        {
          "id": "cmw4fddfo004ptcwst1ss2voi",
          "name": " [0030] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0030--1793936327129-3rox.webp",
          "size": 256446,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1zP8ig0HnCmoAxrMJspEP5Og3dJO50GnB",
          "md5Checksum": "27b12956e64bfb9edc9498c3afa34340",
          "createdAt": "2026-11-06T03:38:47.749Z",
          "updatedAt": "2026-11-09T16:20:20.540Z"
        },
        {
          "id": "cmw4fd2ee004ntcwsozh662q4",
          "name": " [0029] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0029--1793936312852-qpck.webp",
          "size": 211444,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1pE-ZzJBLUV2dZTRPzOMwVDd3gxeU_4lr",
          "md5Checksum": "d216d83a6d7bebc5a0aba14094abdc64",
          "createdAt": "2026-11-06T03:38:33.446Z",
          "updatedAt": "2026-11-09T16:20:20.540Z"
        },
        {
          "id": "cmw4fcrbu004ltcwsbh1b4jyi",
          "name": " [0028] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0028--1793936298267-w4zk.webp",
          "size": 380852,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1rDbgY2UqM_kKnkVrSbr8u6_Nu6Z9pyqo",
          "md5Checksum": "fdca24ec178618f26642e27474651170",
          "createdAt": "2026-11-06T03:38:19.099Z",
          "updatedAt": "2026-11-09T16:20:20.540Z"
        },
        {
          "id": "cmw4fccxp004jtcwsw3cotkwy",
          "name": " [0026] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0026--1793936279668-ur5d.webp",
          "size": 174522,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1lkZ43x6jh4FDv_-3ch3N0N83-Lvl-CRi",
          "md5Checksum": "71b87e938a811e3ad6093bf2aa12e221",
          "createdAt": "2026-11-06T03:38:00.446Z",
          "updatedAt": "2026-11-09T16:20:20.541Z"
        },
        {
          "id": "cmw4fc2x7004htcwsuvjj64mr",
          "name": " [0025] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0025--1793936266678-7z6p.webp",
          "size": 396180,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1GuA3mRiYTsWeo3klioXdxXxlMfXDuktY",
          "md5Checksum": "39436c99df0eaf0ca9ea96d1d47a0e97",
          "createdAt": "2026-11-06T03:37:47.465Z",
          "updatedAt": "2026-11-09T16:20:20.541Z"
        },
        {
          "id": "cmw4fbs2y004ftcwsemd9gav5",
          "name": " [0024] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0024--1793936252560-kspr.webp",
          "size": 466484,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1oevVCHJSxJVejaSoKtTn144FsVrpCGWZ",
          "md5Checksum": "0797c1a7f9d3b4120dee961cdead59e2",
          "createdAt": "2026-11-06T03:37:33.418Z",
          "updatedAt": "2026-11-09T16:20:20.541Z"
        },
        {
          "id": "cmw4fbfcm004dtcws5u6ecgk5",
          "name": " [0023] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0023--1793936236142-pq1d.webp",
          "size": 219096,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1d6jJ1bobsZuGOQMolR8jd2aC7PIt7F2R",
          "md5Checksum": "5f5adce542f3ece9c919e264bc5e782d",
          "createdAt": "2026-11-06T03:37:16.919Z",
          "updatedAt": "2026-11-09T16:20:20.542Z"
        },
        {
          "id": "cmw4fb526004btcwsrj0z86u9",
          "name": " [0022] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0022--1793936222752-j7n0.webp",
          "size": 486404,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1cjJExUIngj7HdIIPQq86YtQi70HPlZcf",
          "md5Checksum": "38809009d9f2d02320cbd6066ad75f9e",
          "createdAt": "2026-11-06T03:37:03.582Z",
          "updatedAt": "2026-11-09T16:20:20.542Z"
        },
        {
          "id": "cmw4fasms0049tcwszb8c42oh",
          "name": " [0021] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0021--1793936206889-uecz.webp",
          "size": 176102,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1tb7V2MZcOF4bHzgbP0ZmRFU7fpDPB1hX",
          "md5Checksum": "0477b760f7580106895b3013850e5c76",
          "createdAt": "2026-11-06T03:36:47.476Z",
          "updatedAt": "2026-11-09T16:20:20.542Z"
        },
        {
          "id": "cmw4fagdo0047tcws275nd2m6",
          "name": " [0020] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0020--1793936190747-c4dj.webp",
          "size": 281406,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1tegioTLvXizC2kQcAc4WUfEvPjlQ2xKI",
          "md5Checksum": "3575a0ddade51ab88069c1f0cc81cc28",
          "createdAt": "2026-11-06T03:36:31.597Z",
          "updatedAt": "2026-11-09T16:20:20.543Z"
        },
        {
          "id": "cmw4fa6gs0045tcwss0o8tsa6",
          "name": " [0018] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0018--1793936177946-2h7n.webp",
          "size": 371338,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1B_C4kCipBEwdHlmsju3PMg4BXwAW_pS9",
          "md5Checksum": "214df413d1c02a448c722e6df231aef0",
          "createdAt": "2026-11-06T03:36:18.749Z",
          "updatedAt": "2026-11-09T16:20:20.543Z"
        },
        {
          "id": "cmw4f9u8j0043tcwstf0fb4kn",
          "name": " [0017] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0017--1793936161992-7hda.webp",
          "size": 358878,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1SjSm0T46OKj7AQLhsHArr2zkbFw7LLYQ",
          "md5Checksum": "20451b362f256ab9f2b0fa9be473a7c4",
          "createdAt": "2026-11-06T03:36:02.900Z",
          "updatedAt": "2026-11-09T16:20:20.544Z"
        },
        {
          "id": "cmw4f9krw0041tcws0iscw2dg",
          "name": " [0016] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0016--1793936149800-nj4f.webp",
          "size": 464696,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1L5Z55svxAvusE-O9qM2byVwUnHWy-N3u",
          "md5Checksum": "b6010fed2c8ac63811d9c56a651e021c",
          "createdAt": "2026-11-06T03:35:50.636Z",
          "updatedAt": "2026-11-09T16:20:20.544Z"
        },
        {
          "id": "cmw4f9ait003ztcwsicxz580f",
          "name": " [0015] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0015--1793936136525-svl5.webp",
          "size": 494944,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1On20sh-NAvKaNE03VJI3Mo1dlaPY2P1y",
          "md5Checksum": "c5478803234dfa7101a9421afaa314b9",
          "createdAt": "2026-11-06T03:35:37.349Z",
          "updatedAt": "2026-11-09T16:20:20.544Z"
        },
        {
          "id": "cmw4f91a5003xtcwskj7hefgv",
          "name": " [0014] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0014--1793936124452-n5ds.webp",
          "size": 830158,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1ih43xEfkytl07UQWJanSI_2ZdB0JlkQQ",
          "md5Checksum": "bb4bb7e33b084fc182b37225a75b4a53",
          "createdAt": "2026-11-06T03:35:25.373Z",
          "updatedAt": "2026-11-09T16:20:20.545Z"
        },
        {
          "id": "cmw4f8q0e003vtcws17lg9u3l",
          "name": " [0013] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0013--1793936110020-idsj.webp",
          "size": 97964,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1MtHSHvfkRRsk6gel-XdrzsXAmUd2tF5w",
          "md5Checksum": "ec2c9c75a8340a365afe24fa50a3d56e",
          "createdAt": "2026-11-06T03:35:10.767Z",
          "updatedAt": "2026-11-09T16:20:20.545Z"
        },
        {
          "id": "cmw4f8em6003ttcwsrbdds9kg",
          "name": " [0012] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0012--1793936095257-o1yf.webp",
          "size": 201808,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1abwcN4YFI6gkJQbxuQdV9REzXoBBxdpU",
          "md5Checksum": "9a3d61a293e8fa35d9c6c0dadffb169f",
          "createdAt": "2026-11-06T03:34:55.998Z",
          "updatedAt": "2026-11-09T16:20:20.545Z"
        },
        {
          "id": "cmw4f84l0003rtcwsklq9frp2",
          "name": " [0011] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0011--1793936082121-zld4.webp",
          "size": 656678,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1z8KBSn-Zb7MAHMmnURKBN9e2DNo6TZ61",
          "md5Checksum": "15e61d15d4410ec50a9ea94b244d4b0a",
          "createdAt": "2026-11-06T03:34:42.997Z",
          "updatedAt": "2026-11-09T16:20:20.545Z"
        },
        {
          "id": "cmw4f7ss0003ptcws7c8rvjm2",
          "name": " [0009] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0009--1793936066970-9sw2.webp",
          "size": 150492,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "10aIMPDnzA4kAIAR8gcvyKmsiER2QeUht",
          "md5Checksum": "c042ea670a11bb48affca815921b037b",
          "createdAt": "2026-11-06T03:34:27.696Z",
          "updatedAt": "2026-11-09T16:20:20.546Z"
        },
        {
          "id": "cmw4f7kiu003ntcwsizgga2c5",
          "name": " [0008] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0008--1793936056420-jv5j.webp",
          "size": 239978,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1Qa2RRJ4BPY4yeyF90mcLJcQZeSSqFi3P",
          "md5Checksum": "d3796522a8c090f68158ad2fcca91135",
          "createdAt": "2026-11-06T03:34:16.998Z",
          "updatedAt": "2026-11-09T16:20:20.546Z"
        },
        {
          "id": "cmw4f7919003ltcwsbmhea6tu",
          "name": " [0007] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0007--1793936041222-q92j.webp",
          "size": 563526,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1XoWjAYjLHZTwGRtWKoPAt9kkdSLJq2Ml",
          "md5Checksum": "66193b6d21de3942370763472d14dd00",
          "createdAt": "2026-11-06T03:34:02.109Z",
          "updatedAt": "2026-11-09T16:20:20.547Z"
        },
        {
          "id": "cmw4f6y93003jtcwsm2t9a9ve",
          "name": " [0006] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0006--1793936027400-xs5j.webp",
          "size": 144970,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1TOcU-JBl9f_-F6OOtuE9jUE6GcsjmZnf",
          "md5Checksum": "fd02efa6d7c7603dcfa15953ae1fc60b",
          "createdAt": "2026-11-06T03:33:48.136Z",
          "updatedAt": "2026-11-09T16:20:20.547Z"
        },
        {
          "id": "cmw4f6nib003htcwsijyxls9d",
          "name": " [0005] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0005--1793936013386-ooqu.webp",
          "size": 345072,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1EB84-jXmKXckUla4NIocdMlfLpiqDqZ0",
          "md5Checksum": "9f0db3aa28d75ace63bd1db07426c79a",
          "createdAt": "2026-11-06T03:33:34.211Z",
          "updatedAt": "2026-11-09T16:20:20.547Z"
        },
        {
          "id": "cmw4f6aoi003ftcwsjgh4yu3s",
          "name": " [0004] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0004--1793935996776-k69z.webp",
          "size": 364766,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1kQWGc4-hJiWael37cYkzx4HxGepfxHOP",
          "md5Checksum": "b393c2689e843500ce70b09dc576c325",
          "createdAt": "2026-11-06T03:33:17.586Z",
          "updatedAt": "2026-11-09T16:20:20.548Z"
        },
        {
          "id": "cmw4f61uf003dtcws0b9sdpw7",
          "name": " [0003] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0003--1793935985401-83n9.webp",
          "size": 241826,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1R15op2wz2xt4gl36NZWMFtONssBwz7Yl",
          "md5Checksum": "148dad58b0f6faef9b8d286b1ca95dd0",
          "createdAt": "2026-11-06T03:33:06.135Z",
          "updatedAt": "2026-11-09T16:20:20.548Z"
        },
        {
          "id": "cmw4f5tny003btcwsuvkoi3ze",
          "name": " [0002] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0002--1793935974707-jm8b.webp",
          "size": 558218,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1A5gLTpSxlI9CCcAjc9_KIYcBPCypnIyh",
          "md5Checksum": "21534d1b75b4ff5c5671140391164315",
          "createdAt": "2026-11-06T03:32:55.535Z",
          "updatedAt": "2026-11-09T16:20:20.548Z"
        },
        {
          "id": "cmw4f5km20039tcwsbyy606su",
          "name": " [0001] .JPG",
          "url": "/uploads/folders/tai-nguyen-5/-0001--1793935963019-gqfl.webp",
          "size": 337434,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000dtcwsmuuleoje",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1-O0oOAs42Kn3GdNa0FovP6BcU_RRYsn4",
          "md5Checksum": "cf61cb10c26c53517ac3d69e1ca7611d",
          "createdAt": "2026-11-06T03:32:43.796Z",
          "updatedAt": "2026-11-09T16:20:20.549Z"
        }
      ]
    },
    {
      "id": "cmw4etvyr000etcwstzza2lum",
      "name": "6",
      "slug": "tai-nguyen-6",
      "createdAt": "2026-11-06T03:23:38.644Z",
      "updatedAt": "2026-11-09T16:20:20.464Z",
      "files": [
        {
          "id": "cmw4fwx81007vtcws5z5oehu1",
          "name": "NHD04875.jpg",
          "url": "/uploads/folders/tai-nguyen-6/nhd04875-1793937238833-fllo.webp",
          "size": 506336,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000etcwstzza2lum",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1xY2CtVSvZ8sj1BD23pKN2I_qakNiSm5E",
          "md5Checksum": "d71992fb723a09cb42ff95473be9d420",
          "createdAt": "2026-11-06T03:53:59.857Z",
          "updatedAt": "2026-11-09T16:20:20.549Z"
        },
        {
          "id": "cmw4fwitk007ttcwsgqbo26ww",
          "name": "NHD04835.jpg",
          "url": "/uploads/folders/tai-nguyen-6/nhd04835-1793937220343-y1qf.webp",
          "size": 297696,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000etcwstzza2lum",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1DdknZds5g0nD-tqn6819JoqmSJSe5Zux",
          "md5Checksum": "a397d3387fbe823099e073cd62f3cdbd",
          "createdAt": "2026-11-06T03:53:41.193Z",
          "updatedAt": "2026-11-09T16:20:20.549Z"
        },
        {
          "id": "cmw4fw7ng007rtcwstnlylb9u",
          "name": "NHD04566.jpg",
          "url": "/uploads/folders/tai-nguyen-6/nhd04566-1793937205732-n1uj.webp",
          "size": 563596,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000etcwstzza2lum",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1Q20RxMLkify_TpdHmOz5_n_Ipu1noK87",
          "md5Checksum": "5f18d3a504d37c1e675031aad3e1e003",
          "createdAt": "2026-11-06T03:53:26.717Z",
          "updatedAt": "2026-11-09T16:20:20.550Z"
        },
        {
          "id": "cmw4fvwcb007ptcwsjuorrk44",
          "name": "NHD04557.jpg",
          "url": "/uploads/folders/tai-nguyen-6/nhd04557-1793937191132-d1pu.webp",
          "size": 631636,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000etcwstzza2lum",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "18Xe-mvzM8wa_1EqWaUcKhpTCUxbULsey",
          "md5Checksum": "628ece84bbdc6b6117fc4f37c3f47995",
          "createdAt": "2026-11-06T03:53:12.059Z",
          "updatedAt": "2026-11-09T16:20:20.550Z"
        },
        {
          "id": "cmw4fvgeu007ntcwsk31ocpne",
          "name": "NHD04500.jpg",
          "url": "/uploads/folders/tai-nguyen-6/nhd04500-1793937170661-niet.webp",
          "size": 191860,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000etcwstzza2lum",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1885gtCYLzkAZfWBdjKZXMl0u3ofOOHL9",
          "md5Checksum": "5c03c6711768c6115c61e380fc3cd323",
          "createdAt": "2026-11-06T03:52:51.415Z",
          "updatedAt": "2026-11-09T16:20:20.550Z"
        },
        {
          "id": "cmw4fv57y007ltcwsjj817ck3",
          "name": "HD_05214.jpg",
          "url": "/uploads/folders/tai-nguyen-6/hd_05214-1793937156002-3bxm.webp",
          "size": 589804,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000etcwstzza2lum",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1bn-j0py12ayV-UTDOu9aabywyfXXmRwJ",
          "md5Checksum": "df76682592a2cf9ed7bdb595f1cf9aff",
          "createdAt": "2026-11-06T03:52:36.910Z",
          "updatedAt": "2026-11-09T16:20:20.551Z"
        },
        {
          "id": "cmw4futf0007jtcwslezgfzaw",
          "name": "HD_05202.jpg",
          "url": "/uploads/folders/tai-nguyen-6/hd_05202-1793937140779-eiq2.webp",
          "size": 282672,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000etcwstzza2lum",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1Q63gU_xKibn1COPexRXSgW-AP1zpPECr",
          "md5Checksum": "b74081df726db7d06462cde1cef9df6e",
          "createdAt": "2026-11-06T03:52:21.612Z",
          "updatedAt": "2026-11-09T16:20:20.551Z"
        },
        {
          "id": "cmw4fufur007htcwsxealzzz6",
          "name": "HD_05156.jpg",
          "url": "/uploads/folders/tai-nguyen-6/hd_05156-1793937123206-vpo0.webp",
          "size": 384180,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000etcwstzza2lum",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1jxXHdL9IFuXq3iPgHJps0HKis0uFWvCY",
          "md5Checksum": "d2d40554e6b1893c6ef79cb3fe6ac5d9",
          "createdAt": "2026-11-06T03:52:04.035Z",
          "updatedAt": "2026-11-09T16:20:20.551Z"
        },
        {
          "id": "cmw4fu30p007ftcwszvo9f1nl",
          "name": "HD_05143.jpg",
          "url": "/uploads/folders/tai-nguyen-6/hd_05143-1793937106751-xg1i.webp",
          "size": 358044,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyr000etcwstzza2lum",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1byuefVCTx07ERkUm5VGMyHYA3aboAE1x",
          "md5Checksum": "ba6994d5b8dd4b2761d081bfd45f8592",
          "createdAt": "2026-11-06T03:51:47.401Z",
          "updatedAt": "2026-11-09T16:20:20.552Z"
        },
        {
          "id": "cmw4ftnse007dtcws4t8pvyp1",
          "name": "HD_04958.jpg",
          "url": "/uploads/folders/tai-nguyen-6/hd_04958-1793937086772-32qk.webp",
          "size": 550700,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000etcwstzza2lum",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1tUg6y8j3PQsT8UnxT4EzAXjjiMYfgND8",
          "md5Checksum": "90fc70752a99e42f8cfb4dbd704fa1d3",
          "createdAt": "2026-11-06T03:51:27.662Z",
          "updatedAt": "2026-11-09T16:20:20.552Z"
        },
        {
          "id": "cmw4ftbi3007btcws6b5vb95g",
          "name": "HD_04956.jpg",
          "url": "/uploads/folders/tai-nguyen-6/hd_04956-1793937070838-011x.webp",
          "size": 588782,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000etcwstzza2lum",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1r6-szhHpbLCi9Ztx_PTznEx3kDegLhrN",
          "md5Checksum": "29d9b0107229ddbd1196490e8eda347a",
          "createdAt": "2026-11-06T03:51:11.740Z",
          "updatedAt": "2026-11-09T16:20:20.552Z"
        },
        {
          "id": "cmw4ft0pw0079tcwseswyokzk",
          "name": "HD_04927.jpg",
          "url": "/uploads/folders/tai-nguyen-6/hd_04927-1793937056828-jyig.webp",
          "size": 676540,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000etcwstzza2lum",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "11OyGJDj05CrDfN4_1trTE70pWLdVu1D5",
          "md5Checksum": "3f9fd35a9d2dd6545021b7263bef91aa",
          "createdAt": "2026-11-06T03:50:57.765Z",
          "updatedAt": "2026-11-09T16:20:20.553Z"
        },
        {
          "id": "cmw4fsmwk0077tcwsz28a5ok3",
          "name": "HD_04358.jpg",
          "url": "/uploads/folders/tai-nguyen-6/hd_04358-1793937039035-rcxq.webp",
          "size": 266322,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyr000etcwstzza2lum",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "15OrTwD93PWbWPbhaDzmurYseLFamSTN0",
          "md5Checksum": "795cc5b63e86d70e59d60cc71e90401f",
          "createdAt": "2026-11-06T03:50:39.860Z",
          "updatedAt": "2026-11-09T16:20:20.553Z"
        }
      ]
    },
    {
      "id": "cmw4etvys000ftcws35mhlmu8",
      "name": "7",
      "slug": "tai-nguyen-7",
      "createdAt": "2026-11-06T03:23:38.644Z",
      "updatedAt": "2026-11-09T16:20:20.465Z",
      "files": [
        {
          "id": "cmw4gaffl00a2tcwstl3i6qav",
          "name": "[ 473 ] Duy Khoa & Khánh Ngân.JPG",
          "url": "/uploads/folders/tai-nguyen-7/-473-duy-khoa-khanh-ngan-1793937869260-psah.webp",
          "size": 176292,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvys000ftcws35mhlmu8",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "15Y_HUitXwH7nhasuTYp3z8PEIaZY9Chl",
          "md5Checksum": "3536d1afd287267297ba3fd60305d796",
          "createdAt": "2026-11-06T04:04:29.985Z",
          "updatedAt": "2026-11-09T16:20:20.553Z"
        },
        {
          "id": "cmw4ga52m00a0tcwsekbm492m",
          "name": "[ 471 ] Duy Khoa & Khánh Ngân.JPG",
          "url": "/uploads/folders/tai-nguyen-7/-471-duy-khoa-khanh-ngan-1793937856006-s9bv.webp",
          "size": 110882,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvys000ftcws35mhlmu8",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "194tx2c0DJP0jX128aVH3rXJXfU0CjL9h",
          "md5Checksum": "b9b5c1bb79a99407901ff55233e57fde",
          "createdAt": "2026-11-06T04:04:16.559Z",
          "updatedAt": "2026-11-09T16:20:20.554Z"
        },
        {
          "id": "cmw4g9un9009ytcwstlsj9jav",
          "name": "[ 468 ] Duy Khoa & Khánh Ngân.JPG",
          "url": "/uploads/folders/tai-nguyen-7/-468-duy-khoa-khanh-ngan-1793937842349-c2nf.webp",
          "size": 102582,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvys000ftcws35mhlmu8",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1KbEBeJlFvW6mELFelq5KalOVZ_0JFJVz",
          "md5Checksum": "f0e425ccd612d5097564fd1865d29bdd",
          "createdAt": "2026-11-06T04:04:03.045Z",
          "updatedAt": "2026-11-09T16:20:20.554Z"
        },
        {
          "id": "cmw4g9mp4009wtcwsok395k7z",
          "name": "[ 402 ] Duy Khoa & Khánh Ngân.JPG",
          "url": "/uploads/folders/tai-nguyen-7/-402-duy-khoa-khanh-ngan-1793937832255-t1o0.webp",
          "size": 1067720,
          "format": "WEBP",
          "width": 2262,
          "height": 3391,
          "folderId": "cmw4etvys000ftcws35mhlmu8",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1jtiUxow36iQpSubiPcPw6iEq_63Ly4L8",
          "md5Checksum": "3cd06b8d3baa049b4f3178e464935199",
          "createdAt": "2026-11-06T04:03:52.744Z",
          "updatedAt": "2026-11-09T16:20:20.554Z"
        },
        {
          "id": "cmw4g9ews009utcws6z64frxj",
          "name": "[ 400 ] Duy Khoa & Khánh Ngân.JPG",
          "url": "/uploads/folders/tai-nguyen-7/-400-duy-khoa-khanh-ngan-1793937822263-m8f4.webp",
          "size": 183180,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvys000ftcws35mhlmu8",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1laRCkjm3-crCkaLTb8aDg2HVgyOh4-ZV",
          "md5Checksum": "7988c237cdbdf5b3e6597ed8a1ad3072",
          "createdAt": "2026-11-06T04:03:42.652Z",
          "updatedAt": "2026-11-09T16:20:20.555Z"
        },
        {
          "id": "cmw4g95pe009stcwsnxy0dpj8",
          "name": "[ 399 ] Duy Khoa & Khánh Ngân.JPG",
          "url": "/uploads/folders/tai-nguyen-7/-399-duy-khoa-khanh-ngan-1793937810119-b8de.webp",
          "size": 339992,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvys000ftcws35mhlmu8",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1UUen5DAF6MY_89Bu9K8llGPk9a0QJQ4q",
          "md5Checksum": "383c6985abe0cc16015b6eff9aa0083d",
          "createdAt": "2026-11-06T04:03:30.722Z",
          "updatedAt": "2026-11-09T16:20:20.555Z"
        },
        {
          "id": "cmw4g8uu7009qtcws3yyrf53b",
          "name": "[ 395 ] Duy Khoa & Khánh Ngân.JPG",
          "url": "/uploads/folders/tai-nguyen-7/-395-duy-khoa-khanh-ngan-1793937796210-7p8p.webp",
          "size": 165924,
          "format": "WEBP",
          "width": 2560,
          "height": 1708,
          "folderId": "cmw4etvys000ftcws35mhlmu8",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1DHzBlIJxo-3J80ZFgBgHyDJOJjJVGrhn",
          "md5Checksum": "62343fc2b6eb07138d72dc06d144f8b9",
          "createdAt": "2026-11-06T04:03:16.639Z",
          "updatedAt": "2026-11-09T16:20:20.555Z"
        },
        {
          "id": "cmw4g8iux009otcwsphnfq3uy",
          "name": "[ 393 ] Duy Khoa & Khánh Ngân.JPG",
          "url": "/uploads/folders/tai-nguyen-7/-393-duy-khoa-khanh-ngan-1793937780391-bx3l.webp",
          "size": 114756,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvys000ftcws35mhlmu8",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1OvXLgARZ3NjpgtuTWk-RaK_SuYdfPOh9",
          "md5Checksum": "cd4f0c23a27967e729264ae17631ac54",
          "createdAt": "2026-11-06T04:03:01.114Z",
          "updatedAt": "2026-11-09T16:20:20.556Z"
        },
        {
          "id": "cmw4g86h2009mtcws6c9lqg9s",
          "name": "[ 384 ] Duy Khoa & Khánh Ngân.JPG",
          "url": "/uploads/folders/tai-nguyen-7/-384-duy-khoa-khanh-ngan-1793937764653-06zq.webp",
          "size": 144492,
          "format": "WEBP",
          "width": 2560,
          "height": 1708,
          "folderId": "cmw4etvys000ftcws35mhlmu8",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1GP9z2xEj_kwvbm1w8K22Ny2q4tAKjsGv",
          "md5Checksum": "84a585117bde5babf4975108dfbb892e",
          "createdAt": "2026-11-06T04:02:45.063Z",
          "updatedAt": "2026-11-09T16:20:20.556Z"
        },
        {
          "id": "cmw4g7t4w009ktcwstw7i19bs",
          "name": "[ 381 ] Duy Khoa & Khánh Ngân.JPG",
          "url": "/uploads/folders/tai-nguyen-7/-381-duy-khoa-khanh-ngan-1793937746892-ech6.webp",
          "size": 256508,
          "format": "WEBP",
          "width": 2560,
          "height": 3838,
          "folderId": "cmw4etvys000ftcws35mhlmu8",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1ysvsMfAOpbEANoXwj_cQ2wi6Jnu1pzUn",
          "md5Checksum": "22230dfabe99d2e935b92ad568f657aa",
          "createdAt": "2026-11-06T04:02:27.777Z",
          "updatedAt": "2026-11-09T16:20:20.556Z"
        },
        {
          "id": "cmw4g7hiv009itcwsyjkk625f",
          "name": "[ 378 ] Duy Khoa & Khánh Ngân.JPG",
          "url": "/uploads/folders/tai-nguyen-7/-378-duy-khoa-khanh-ngan-1793937732129-inqy.webp",
          "size": 176388,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvys000ftcws35mhlmu8",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1ox2iQe1grzlkfe8vO5Wr33c8BL-cow_g",
          "md5Checksum": "f6a70e2cb8107f7bb3de047cf36c5921",
          "createdAt": "2026-11-06T04:02:12.728Z",
          "updatedAt": "2026-11-09T16:20:20.557Z"
        },
        {
          "id": "cmw4g78dy009gtcwsb14v0xub",
          "name": "[ 377 ] Duy Khoa & Khánh Ngân.JPG",
          "url": "/uploads/folders/tai-nguyen-7/-377-duy-khoa-khanh-ngan-1793937720077-ht41.webp",
          "size": 578074,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvys000ftcws35mhlmu8",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1ENdoxztVbEkbRe4ilpKWP0XvcmTQO7oB",
          "md5Checksum": "ef195783ee66b3d967f074fb3d9d260e",
          "createdAt": "2026-11-06T04:02:00.886Z",
          "updatedAt": "2026-11-09T16:20:20.557Z"
        },
        {
          "id": "cmw4g6z8w009etcwsgikxe3h8",
          "name": "[ 339 ] Duy Khoa & Khánh Ngân.JPG",
          "url": "/uploads/folders/tai-nguyen-7/-339-duy-khoa-khanh-ngan-1793937707946-p0df.webp",
          "size": 1558176,
          "format": "WEBP",
          "width": 2560,
          "height": 3838,
          "folderId": "cmw4etvys000ftcws35mhlmu8",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1GWa8bJQiZIX9N-I-eKZuCEPgm9iOsN5Z",
          "md5Checksum": "6249d87f3b9375de569ce4d3e697b201",
          "createdAt": "2026-11-06T04:01:49.041Z",
          "updatedAt": "2026-11-09T16:20:20.557Z"
        },
        {
          "id": "cmw4g6ilh009ctcwsppu0o6bw",
          "name": "[ 336 ] Duy Khoa & Khánh Ngân.JPG",
          "url": "/uploads/folders/tai-nguyen-7/-336-duy-khoa-khanh-ngan-1793937686359-j0bp.webp",
          "size": 1582896,
          "format": "WEBP",
          "width": 2560,
          "height": 3838,
          "folderId": "cmw4etvys000ftcws35mhlmu8",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1lkmjlhsMbBJBEbVNZVUEcRHpXUu2rXwh",
          "md5Checksum": "422f121ca9e69d31dd009082277f7792",
          "createdAt": "2026-11-06T04:01:27.461Z",
          "updatedAt": "2026-11-09T16:20:20.558Z"
        },
        {
          "id": "cmw4g650x009atcwsu7j1ygwp",
          "name": "[ 331 ] Duy Khoa & Khánh Ngân.JPG",
          "url": "/uploads/folders/tai-nguyen-7/-331-duy-khoa-khanh-ngan-1793937669051-mcp6.webp",
          "size": 559522,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvys000ftcws35mhlmu8",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1h0wu68n53x-5LxqFTXW9oIbpauN2ue_a",
          "md5Checksum": "45ac2ed743c90fc9d223ec43d92519f1",
          "createdAt": "2026-11-06T04:01:09.874Z",
          "updatedAt": "2026-11-09T16:20:20.558Z"
        },
        {
          "id": "cmw4g5tkl0098tcwscqctkilw",
          "name": "[ 329 ] Duy Khoa & Khánh Ngân.JPG",
          "url": "/uploads/folders/tai-nguyen-7/-329-duy-khoa-khanh-ngan-1793937654652-kh7i.webp",
          "size": 104770,
          "format": "WEBP",
          "width": 2560,
          "height": 1708,
          "folderId": "cmw4etvys000ftcws35mhlmu8",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1USQk1Ry293DlBstREDrfvRouC1q-D9ln",
          "md5Checksum": "2267c3a3d86b96adc9b995bc1a45fab7",
          "createdAt": "2026-11-06T04:00:55.030Z",
          "updatedAt": "2026-11-09T16:20:20.558Z"
        },
        {
          "id": "cmw4g5hgc0096tcwsmlixv5ij",
          "name": "[ 324 ] Duy Khoa & Khánh Ngân.JPG",
          "url": "/uploads/folders/tai-nguyen-7/-324-duy-khoa-khanh-ngan-1793937638699-ay3w.webp",
          "size": 190620,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvys000ftcws35mhlmu8",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1AtQjyn7CnlVE5tmqWJqYHInonpjes3s-",
          "md5Checksum": "e2ec2a36ce7431ab24b492ce76003d77",
          "createdAt": "2026-11-06T04:00:39.324Z",
          "updatedAt": "2026-11-09T16:20:20.559Z"
        },
        {
          "id": "cmw4g575q0094tcwsmfjrc2ll",
          "name": "[ 318 ] Duy Khoa & Khánh Ngân.JPG",
          "url": "/uploads/folders/tai-nguyen-7/-318-duy-khoa-khanh-ngan-1793937625012-eml5.webp",
          "size": 246690,
          "format": "WEBP",
          "width": 2560,
          "height": 3838,
          "folderId": "cmw4etvys000ftcws35mhlmu8",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1s3nj6FC1uQ0OUphtY5Wj8OtmoKGzS__N",
          "md5Checksum": "1b1a02d6a4b1fe7ec23c302e99141538",
          "createdAt": "2026-11-06T04:00:25.983Z",
          "updatedAt": "2026-11-09T16:20:20.559Z"
        },
        {
          "id": "cmw4g4uw60092tcwsiqqeunhb",
          "name": "[ 315 ] Duy Khoa & Khánh Ngân.JPG",
          "url": "/uploads/folders/tai-nguyen-7/-315-duy-khoa-khanh-ngan-1793937609520-2n3k.webp",
          "size": 115580,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvys000ftcws35mhlmu8",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1SXgkc5-iw8tznIphktsQa2xZIegwh7p1",
          "md5Checksum": "42a03610bf406f45d1a2f277150cb9cd",
          "createdAt": "2026-11-06T04:00:10.086Z",
          "updatedAt": "2026-11-09T16:20:20.560Z"
        },
        {
          "id": "cmw4g4j7r0090tcwsuh6de55z",
          "name": "[ 308 ] Duy Khoa & Khánh Ngân.JPG",
          "url": "/uploads/folders/tai-nguyen-7/-308-duy-khoa-khanh-ngan-1793937593873-nd6j.webp",
          "size": 515928,
          "format": "WEBP",
          "width": 2560,
          "height": 3838,
          "folderId": "cmw4etvys000ftcws35mhlmu8",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1RIyhBysBNps0oXcVfCA44TgNfv5g8aPw",
          "md5Checksum": "01fb83538cc4632077eeb4c485b9ef4d",
          "createdAt": "2026-11-06T03:59:54.952Z",
          "updatedAt": "2026-11-09T16:20:20.560Z"
        },
        {
          "id": "cmw4g45y6008ytcws7gy896i2",
          "name": "[ 307 ] Duy Khoa & Khánh Ngân.JPG",
          "url": "/uploads/folders/tai-nguyen-7/-307-duy-khoa-khanh-ngan-1793937577281-q96g.webp",
          "size": 182912,
          "format": "WEBP",
          "width": 2560,
          "height": 1708,
          "folderId": "cmw4etvys000ftcws35mhlmu8",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1L7OA5U-rJUwSeto5k4hAeSRPur02pK-Z",
          "md5Checksum": "9eff5ae005c2e67b539cf932688175bd",
          "createdAt": "2026-11-06T03:59:37.759Z",
          "updatedAt": "2026-11-09T16:20:20.560Z"
        },
        {
          "id": "cmw4g3rce008wtcwszf3819vu",
          "name": "[ 302 ] Duy Khoa & Khánh Ngân.JPG",
          "url": "/uploads/folders/tai-nguyen-7/-302-duy-khoa-khanh-ngan-1793937557954-d4i7.webp",
          "size": 397688,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvys000ftcws35mhlmu8",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "17bS0uBMJDiz3AyqhwttSI_SR3TmCzoEo",
          "md5Checksum": "50391781febce80c68c603d21d8d9411",
          "createdAt": "2026-11-06T03:59:18.831Z",
          "updatedAt": "2026-11-09T16:20:20.561Z"
        },
        {
          "id": "cmw4g3htr008utcws4j0jmzk8",
          "name": "[ 270 ] Duy Khoa & Khánh Ngân.JPG",
          "url": "/uploads/folders/tai-nguyen-7/-270-duy-khoa-khanh-ngan-1793937546020-vmnu.webp",
          "size": 268118,
          "format": "WEBP",
          "width": 2560,
          "height": 1708,
          "folderId": "cmw4etvys000ftcws35mhlmu8",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1C9zmUwS8L4z2yYXGIu4376TifuzzQIRb",
          "md5Checksum": "bb4c56c01295e68e379c03cee1c3ecae",
          "createdAt": "2026-11-06T03:59:06.495Z",
          "updatedAt": "2026-11-09T16:20:20.561Z"
        },
        {
          "id": "cmw4g371y008stcwst2tgwki5",
          "name": "[ 167 ] Duy Khoa & Khánh Ngân.JPG",
          "url": "/uploads/folders/tai-nguyen-7/-167-duy-khoa-khanh-ngan-1793937531573-d9ab.webp",
          "size": 442190,
          "format": "WEBP",
          "width": 2560,
          "height": 3838,
          "folderId": "cmw4etvys000ftcws35mhlmu8",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1xtzMKSDtAmn2suE2bWope0j0QwlakUoi",
          "md5Checksum": "bbbb988c636ebb5d905329febba2ae3d",
          "createdAt": "2026-11-06T03:58:52.534Z",
          "updatedAt": "2026-11-09T16:20:20.562Z"
        },
        {
          "id": "cmw4g2u2z008qtcws2bkkt8ao",
          "name": "[ 161 ] Duy Khoa & Khánh Ngân.JPG",
          "url": "/uploads/folders/tai-nguyen-7/-161-duy-khoa-khanh-ngan-1793937514931-bx3l.webp",
          "size": 321982,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvys000ftcws35mhlmu8",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "10oAuYA8tpRzy3DuUfpXAcpsT6TZhASgx",
          "md5Checksum": "baa6e5c5dbdc4c667fd967e8c3f816a5",
          "createdAt": "2026-11-06T03:58:35.723Z",
          "updatedAt": "2026-11-09T16:20:20.562Z"
        },
        {
          "id": "cmw4g2glf008otcwsl6t3jmqc",
          "name": "[ 148 ] Duy Khoa & Khánh Ngân.JPG",
          "url": "/uploads/folders/tai-nguyen-7/-148-duy-khoa-khanh-ngan-1793937497065-89c5.webp",
          "size": 436086,
          "format": "WEBP",
          "width": 2560,
          "height": 3838,
          "folderId": "cmw4etvys000ftcws35mhlmu8",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1lQkFd_-09LvRbyYiSHQsC3EwHh-EaqT9",
          "md5Checksum": "7e82ab0511f92a3338b5e160cc2b01c5",
          "createdAt": "2026-11-06T03:58:18.243Z",
          "updatedAt": "2026-11-09T16:20:20.562Z"
        },
        {
          "id": "cmw4g1zei008mtcwsnkyg2atl",
          "name": "[ 138 ] Duy Khoa & Khánh Ngân.JPG",
          "url": "/uploads/folders/tai-nguyen-7/-138-duy-khoa-khanh-ngan-1793937475059-axyu.webp",
          "size": 320484,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvys000ftcws35mhlmu8",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1CqkzoQPyKuZql4HlcNZyhK-4X2aFklgq",
          "md5Checksum": "11ff9f11a0451ad2c5f83d52a3e7b496",
          "createdAt": "2026-11-06T03:57:55.962Z",
          "updatedAt": "2026-11-09T16:20:20.563Z"
        },
        {
          "id": "cmw4g1n08008ktcws5uzc2h8n",
          "name": "[ 114 ] Duy Khoa & Khánh Ngân.JPG",
          "url": "/uploads/folders/tai-nguyen-7/-114-duy-khoa-khanh-ngan-1793937459046-0dd0.webp",
          "size": 462154,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvys000ftcws35mhlmu8",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1z9F8hXDSAosvLSd15SfgEM5GHudnBN3D",
          "md5Checksum": "ee75ffcb9eee0dd2e4e4aeb3fee3fa1f",
          "createdAt": "2026-11-06T03:57:39.896Z",
          "updatedAt": "2026-11-09T16:20:20.563Z"
        },
        {
          "id": "cmw4g1b9m008itcwsa6pzgfqr",
          "name": "[ 113 ] Duy Khoa & Khánh Ngân.JPG",
          "url": "/uploads/folders/tai-nguyen-7/-113-duy-khoa-khanh-ngan-1793937443779-7ve6.webp",
          "size": 264914,
          "format": "WEBP",
          "width": 2560,
          "height": 3838,
          "folderId": "cmw4etvys000ftcws35mhlmu8",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1bwcPscG8GDI-shGPS2_12Ny2P7_Y4tU7",
          "md5Checksum": "31613ec9fef04aeb54e9da1c3b7cdeb7",
          "createdAt": "2026-11-06T03:57:24.682Z",
          "updatedAt": "2026-11-09T16:20:20.563Z"
        },
        {
          "id": "cmw4g0wfe008gtcwsjitogr6x",
          "name": "[ 075 ] Duy Khoa & Khánh Ngân.JPG",
          "url": "/uploads/folders/tai-nguyen-7/-075-duy-khoa-khanh-ngan-1793937424903-vmcu.webp",
          "size": 164518,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvys000ftcws35mhlmu8",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1a6hgUGaWRw7eIiXvaWRg3-vnvGCv_6pp",
          "md5Checksum": "344dae0c9767050b341df44b8c5db371",
          "createdAt": "2026-11-06T03:57:05.451Z",
          "updatedAt": "2026-11-09T16:20:20.564Z"
        },
        {
          "id": "cmw4g0k87008etcwsn61k7m9a",
          "name": "[ 071 ] Duy Khoa & Khánh Ngân.JPG",
          "url": "/uploads/folders/tai-nguyen-7/-071-duy-khoa-khanh-ngan-1793937408773-i5x0.webp",
          "size": 187462,
          "format": "WEBP",
          "width": 2560,
          "height": 3838,
          "folderId": "cmw4etvys000ftcws35mhlmu8",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "126M-laRKHVDTG8qZeloFMRYyABtMv0wM",
          "md5Checksum": "96cb527cd3fbba5c543498aee2090bd1",
          "createdAt": "2026-11-06T03:56:49.639Z",
          "updatedAt": "2026-11-09T16:20:20.564Z"
        },
        {
          "id": "cmw4g09pd008ctcwsxefcopi8",
          "name": "[ 057 ] Duy Khoa & Khánh Ngân.JPG",
          "url": "/uploads/folders/tai-nguyen-7/-057-duy-khoa-khanh-ngan-1793937395025-f63v.webp",
          "size": 202538,
          "format": "WEBP",
          "width": 2560,
          "height": 3838,
          "folderId": "cmw4etvys000ftcws35mhlmu8",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1-hnbdJhpFgJZygFdG-k7LcfCxG2ngQSg",
          "md5Checksum": "5040d1fec2dc955587ef0292018ab4a1",
          "createdAt": "2026-11-06T03:56:36.001Z",
          "updatedAt": "2026-11-09T16:20:20.564Z"
        },
        {
          "id": "cmw4fzzj1008atcwsecdcpcgx",
          "name": "[ 042 ] Duy Khoa & Khánh Ngân.JPG",
          "url": "/uploads/folders/tai-nguyen-7/-042-duy-khoa-khanh-ngan-1793937382034-n6h0.webp",
          "size": 304196,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvys000ftcws35mhlmu8",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1nY2ZNdeDMq56MtN9exchB1ZR6iEwAjvY",
          "md5Checksum": "41bcc3d2feb32c9d632ffc963dbc1b73",
          "createdAt": "2026-11-06T03:56:22.813Z",
          "updatedAt": "2026-11-09T16:20:20.565Z"
        },
        {
          "id": "cmw4fx7j3007xtcwshjjjeipr",
          "name": "[ 041 ] Duy Khoa & Khánh Ngân.JPG",
          "url": "/uploads/folders/tai-nguyen-7/-041-duy-khoa-khanh-ngan-1793937252349-palz.webp",
          "size": 186428,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvys000ftcws35mhlmu8",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "14Hk2cJ_fd5wpzxx7ovXR7FdNgu5_X0mE",
          "md5Checksum": "f77d31045987127052b06110efffac4a",
          "createdAt": "2026-11-06T03:54:13.215Z",
          "updatedAt": "2026-11-09T16:20:20.565Z"
        }
      ]
    },
    {
      "id": "cmw4etvyt000gtcws7jyvosfe",
      "name": "8",
      "slug": "tai-nguyen-8",
      "createdAt": "2026-11-06T03:23:38.645Z",
      "updatedAt": "2026-11-09T16:20:20.465Z",
      "files": [
        {
          "id": "cmw4gndue00cetcwsvij6jf5e",
          "name": "[ 739 ] Thu & Nhân.JPG",
          "url": "/uploads/folders/tai-nguyen-8/-739-thu-nhan-1793938473936-vl5d.webp",
          "size": 66172,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyt000gtcws7jyvosfe",
          "aiContextChunk": {
            "tags": [
              "ảnh cưới",
              "váy cưới ren",
              "nắm tay lãng mạn",
              "plusmoments",
              "tuxedo chú rể",
              "ảnh cưới studio"
            ],
            "colorMood": "Tone màu ấm áp, phong cách Hàn Quốc tối giản với ánh sáng điện ảnh cinematic dịu nhẹ",
            "mainSubject": "Cái nắm tay dịu dàng và đầy gắn kết của cô dâu chú rể trong trang phục cưới cao cấp",
            "suggestedAlt": "Cô dâu chú rể nắm tay lãng mạn trong váy cưới ren cao cấp - PlusMoments Studio",
            "suggestedCaption": "Dưới ánh sáng ấm áp, cái nắm tay dịu dàng là lời hứa hẹn ngọt ngào cho một hành trình hạnh phúc vĩnh cửu.",
            "visualDescription": "Cận cảnh khoảnh khắc lãng mạn và tinh tế khi chú rể dịu dàng nắm lấy bàn tay cô dâu. Chú rể diện bộ vest tuxedo màu đen lịch lãm kết hợp áo sơ mi trắng chỉn chu. Cô dâu khoác lên mình chiếc váy cưới thiết kế cúp ngực quyến rũ với chất liệu ren cao cấp thêu họa tiết nổi tỉ mỉ và phần chân váy lụa xòe nhẹ lấp lánh. Ánh sáng studio dạng cinematic dịu nhẹ chiếu rọi vào hai bàn tay đan chặt, hòa cùng hậu cảnh mờ ảo tông màu kem vàng ấm áp, tạo nên không gian vô cùng riêng tư và tình cảm."
          },
          "uploadedById": null,
          "driveFileId": "12njwMajvq4BOsgx6nvVCS7pzsXuKuCcb",
          "md5Checksum": "26cbfdcefc288ad1e4651339d635a5fe",
          "createdAt": "2026-11-06T04:14:34.454Z",
          "updatedAt": "2026-11-09T16:20:20.565Z"
        },
        {
          "id": "cmw4gn31f00cctcwsu8gw8cta",
          "name": "[ 730 ] Thu & Nhân.JPG",
          "url": "/uploads/folders/tai-nguyen-8/-730-thu-nhan-1793938459671-g7ut.webp",
          "size": 387704,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000gtcws7jyvosfe",
          "aiContextChunk": {
            "tags": [
              "ảnh cưới",
              "cô dâu",
              "bạn thân ngày cưới",
              "khoảnh khắc ngày cưới",
              "plusmoments"
            ],
            "colorMood": "Tone màu ấm áp tự nhiên, ánh sáng trong trẻo dịu nhẹ, phong cách chụp khoảnh khắc tự nhiên tươi vui",
            "mainSubject": "Cô dâu rạng rỡ ôm bạn thân tạo dáng nhí nhảnh trong ngày cưới",
            "suggestedAlt": "Cô dâu rạng rỡ cùng bạn thân trong ngày cưới ngọt ngào tại PlusMoments",
            "suggestedCaption": "Khoảnh khắc tràn ngập tiếng cười và niềm hạnh phúc đong đầy bên người bạn thân thiết trong ngày trọng đại.",
            "visualDescription": "Cô dâu lộng lẫy trong chiếc váy cưới cúp ngực ren trắng tinh khôi kết hợp khăn voan cài tóc mềm mại, nở nụ cười rạng rỡ tràn ngập hạnh phúc. Bên cạnh là người bạn thân diện chiếc đầm đen tầng thanh lịch, tay cầm bó hoa cầm tay gam màu trắng xanh tươi mát. Cả hai ôm nhau thân thiết và nhấc chân tạo dáng nhí nhảnh trước phông nền check-in đám cưới được trang trí hoa cẩm tú cầu xanh bồng bềnh cùng bảng tên chữ dập nổi 'Nhân & Thu'."
          },
          "uploadedById": null,
          "driveFileId": "1NsfWkx2YYPSdiP5sVE1mE_RHvzrKYTzn",
          "md5Checksum": "42e6883bd97037958a4a1dbf9a46e47f",
          "createdAt": "2026-11-06T04:14:20.451Z",
          "updatedAt": "2026-11-09T16:20:20.566Z"
        },
        {
          "id": "cmw4gmsbq00catcwsjv1hwogd",
          "name": "[ 715 ] Thu & Nhân.JPG",
          "url": "/uploads/folders/tai-nguyen-8/-715-thu-nhan-1793938446050-frbk.webp",
          "size": 269680,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyt000gtcws7jyvosfe",
          "aiContextChunk": {
            "tags": [
              "tung hoa cưới",
              "ảnh cưới tiệc",
              "PlusMoments",
              "khoảnh khắc tiệc cưới",
              "váy cưới đẹp"
            ],
            "colorMood": "Tone màu ấm áp sang trọng, ánh sáng trong trẻo kết hợp chất điện ảnh tự nhiên và chân thật",
            "mainSubject": "Khoảnh khắc cô dâu tung hoa cưới sôi động và bắt trọn cảm xúc vỡ òa của dàn khách mời",
            "suggestedAlt": "Cô dâu tung hoa cưới vui nhộn cùng nhóm bạn tại tiệc cưới PlusMoments",
            "suggestedCaption": "Khoảnh khắc tung hoa cưới tràn ngập niềm vui và tiếng cười – nơi hạnh phúc được lan tỏa ngọt ngào.",
            "visualDescription": "Khoảnh khắc tự nhiên, đầy năng lượng khi cô dâu trong chiếc váy cưới xòe lấp lánh và khăn voan thướt tha đang quay lưng tung hoa cưới cho nhóm bạn thân. Chú rể mặc vest đen lịch lãm đứng bên cạnh nở nụ cười rạng rỡ. Phía sau, dàn khách mời trẻ trung thể hiện sự hào hứng, phấn khích nhảy lên để bắt lấy chiếc hoa cầm tay tone trắng. Bối cảnh là sảnh tiệc sang trọng với kiến trúc vòm hiện đại, trang trí hoa tươi tinh tế và ánh đèn neon ấm áp."
          },
          "uploadedById": null,
          "driveFileId": "1vFOd5sFwyTY1I5Jo6WvPiDazBhsHnRpR",
          "md5Checksum": "b05418c8fd161415c6b53bb2b43cda6b",
          "createdAt": "2026-11-06T04:14:06.567Z",
          "updatedAt": "2026-11-09T16:20:20.566Z"
        },
        {
          "id": "cmw4gmgsg00c8tcwskxdqz6fx",
          "name": "[ 711 ] Thu & Nhân.JPG",
          "url": "/uploads/folders/tai-nguyen-8/-711-thu-nhan-1793938431017-y342.webp",
          "size": 333886,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyt000gtcws7jyvosfe",
          "aiContextChunk": {
            "tags": [
              "tung hoa cưới",
              "ảnh tiệc cưới",
              "váy cưới cúp ngực",
              "trang trí đám cưới",
              "PlusMoments Wedding"
            ],
            "colorMood": "Tone màu trắng kem sang trọng, ánh sáng sảnh tiệc tươi sáng, rạng rỡ và tràn ngập niềm vui",
            "mainSubject": "Khoảnh khắc tung hoa cưới rộn rã năng lượng của cô dâu chú rể cùng dàn khách mời",
            "suggestedAlt": "Khoảnh khắc tung hoa cưới rạng rỡ của cô dâu chú rể tại sảnh tiệc sang trọng",
            "suggestedCaption": "Khoảnh khắc tung hoa đầy ắp tiếng cười, gửi gắm trọn vẹn niềm hạnh phúc đến những người thương yêu.",
            "visualDescription": "Khoảnh khắc bùng nổ cảm xúc khi cô dâu trong chiếc váy cưới cúp ngực đính ren lấp lánh dáng xòe A-line nhẹ nhàng, kết hợp khăn voan cài tóc dịu dàng, cùng chú rể diện bộ vest tuxedo đen lịch lãm tung bó hoa cầm tay lên không trung. Phía sau là dàn khách mời và bạn bè hào hứng hò reo chờ bắt lấy may mắn. Bối cảnh tiệc cưới mang phong cách hiện đại với tone trắng chủ đạo, vòm hoa trang trí tinh tế phối sắc hoa cẩm tú cầu xanh và hoa hồng phấn cùng bảng tên chữ 'Nhan & Thu'."
          },
          "uploadedById": null,
          "driveFileId": "1DURf6t0_Q3n6XJO4gC9N6EqYV39f9NzZ",
          "md5Checksum": "c1dd3f805336e76683f74e9970f49e7a",
          "createdAt": "2026-11-06T04:13:51.616Z",
          "updatedAt": "2026-11-09T16:20:20.567Z"
        },
        {
          "id": "cmw4gm70j00c6tcwsa0cka9oj",
          "name": "[ 699 ] Thu & Nhân.JPG",
          "url": "/uploads/folders/tai-nguyen-8/-699-thu-nhan-1793938418362-swn1.webp",
          "size": 264688,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyt000gtcws7jyvosfe",
          "aiContextChunk": {
            "tags": [
              "ảnh cưới",
              "tiệc cưới",
              "cô dâu chú rể",
              "khoảnh khắc tiệc cưới",
              "PlusMoments"
            ],
            "colorMood": "Tông màu tươi sáng, ánh sáng tiệc cưới ấm áp, phong cách sôi động rực rỡ màu sắc",
            "mainSubject": "Cô dâu chú rể trao nụ hôn ngọt ngào rạng rỡ giữa không gian ruy-băng rực rỡ cùng bạn bè",
            "suggestedAlt": "Cô dâu chú rể hôn nhau ngọt ngào trong vòng tay bạn bè cùng dây ruy băng rực rỡ",
            "suggestedCaption": "Khoảnh khắc vỡ òa hạnh phúc và đong đầy tiếng cười bên những người bạn thân thương ngày trọng đại.",
            "visualDescription": "Khoảnh khắc ngọt ngào và rạng rỡ khi chú rể hôn nhẹ lên má cô dâu ở trung tâm bức ảnh, xung quanh là nhóm bạn thân hò reo vô cùng hào hứng, giăng những sợi dây ruy-băng đan sắc màu (vàng, xanh, hồng, đỏ) đan xen sống động quanh cặp đôi. Cô dâu khoác lên mình chiếc váy cưới cúp ngực xòe lụa bồng bềnh cùng khăn voan dịu dàng và bó hoa hồng trắng tinh khôi; chú rể diện vest đen lịch lãm. Bối cảnh tiệc cưới mang phong cách hiện đại với phông nền uốn lượn đính đèn LED ấm áp cùng dòng chữ tên cặp đôi. Bức ảnh tràn ngập năng lượng tuổi trẻ, niềm vui vỡ òa và tình cảm chân thành."
          },
          "uploadedById": null,
          "driveFileId": "1apPDjBI-ox3RWM9Ev-lBIBEzourJUIIY",
          "md5Checksum": "ed510c30f383ec6a76cc05e0c339c564",
          "createdAt": "2026-11-06T04:13:38.947Z",
          "updatedAt": "2026-11-09T16:20:20.568Z"
        },
        {
          "id": "cmw4glvem00c4tcwspai8n2d0",
          "name": "[ 693 ] Thu & Nhân.JPG",
          "url": "/uploads/folders/tai-nguyen-8/-693-thu-nhan-1793938403327-2ixg.webp",
          "size": 248272,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyt000gtcws7jyvosfe",
          "aiContextChunk": {
            "tags": [
              "ảnh tiệc cưới",
              "cô dâu chú rể",
              "bạn thân tiệc cưới",
              "chụp ảnh tiệc cưới",
              "PlusMoments",
              "váy cưới đẹp"
            ],
            "colorMood": "Tone màu trắng kem sang trọng, ánh sáng tiệc cưới sáng rõ, tươi tắn và ấm áp",
            "mainSubject": "Cô dâu chú rể chụp ảnh nhí nhố cùng hội bạn thân tại backdrop tiệc cưới",
            "suggestedAlt": "Cô dâu chú rể chụp ảnh nhí nhố cùng bạn thân tại tiệc cưới PlusMoments",
            "suggestedCaption": "Khoảnh khắc vỡ òa niềm vui và nhí nhố bên hội bạn thân trong ngày trọng đại của Nhân & Thu.",
            "visualDescription": "Hình ảnh cô dâu Thu trong chiếc váy cưới cúp ngực lộng lẫy kết hợp khăn voan mỏng dịu dàng cùng chú rể Nhân bảnh bao trong bộ suit đen lịch lãm, đang rạng rỡ chụp ảnh kỷ niệm cùng dàn bạn thân tại tiệc cưới. Bối cảnh là không gian tiệc sang trọng với backdrop vòm trang trí dải đèn LED và hoa tươi hiện đại khắc tên 'Nhân & Thu'. Cả nhóm cùng tạo dáng nhí nhố, bắn tim và chỉ tay về phía ống kính, lan tỏa không khí ngập tràn tiếng cười và niềm hạnh phúc tuổi trẻ."
          },
          "uploadedById": null,
          "driveFileId": "1fTUDwCBWaXYHRY2SODVQcAun-Qo9adps",
          "md5Checksum": "bd1fb20987e938abc9749ee102312125",
          "createdAt": "2026-11-06T04:13:23.903Z",
          "updatedAt": "2026-11-09T16:20:20.568Z"
        },
        {
          "id": "cmw4glklf00c2tcws2eplgu6x",
          "name": "[ 690 ] Thu & Nhân.JPG",
          "url": "/uploads/folders/tai-nguyen-8/-690-thu-nhan-1793938389318-9sqf.webp",
          "size": 261192,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyt000gtcws7jyvosfe",
          "aiContextChunk": {
            "tags": [
              "ảnh cưới",
              "cô dâu",
              "bạn thân",
              "tiệc cưới",
              "plusmoments"
            ],
            "colorMood": "Tone màu trắng kem tươi sáng, ánh sáng tự nhiên rạng rỡ, phong cách hiện đại và ngập tràn niềm vui",
            "mainSubject": "Khoảnh khắc cô dâu cùng hội bạn thân chụp ảnh selfie vui tươi tại phông tiệc cưới",
            "suggestedAlt": "Cô dâu chụp ảnh selfie nhí nhảnh cùng bạn thân tại tiệc cưới",
            "suggestedCaption": "Khoảnh khắc ngọt ngào và tự nhiên của cô dâu bên những người bạn thân thương trong ngày trọng đại.",
            "visualDescription": "Cô dâu trong chiếc váy cưới cúp ngực lấp lánh, đội mạn che tóc ngắn và tay cầm bó hoa hồng trắng, đang hào hứng tạo dáng nhí nhảnh cùng hai người bạn thân. Cô bạn bên trái giơ điện thoại chụp ảnh selfie, trong khi cô bạn bên phải diện váy trễ vai trắng dịu dàng mỉm cười. Bối cảnh phía sau là backdrop cưới sang trọng tạo hình dải quạt trắng mềm mại, điểm xuyết hoa tươi màu xanh pastel - hồng - trắng và dòng chữ uốn lượn 'Nhân & Thu'."
          },
          "uploadedById": null,
          "driveFileId": "1xELdQKQTn_Q__syRPkKivh5TXkSu9Jhs",
          "md5Checksum": "dada8d47d186401f6f0663b650e5607e",
          "createdAt": "2026-11-06T04:13:09.891Z",
          "updatedAt": "2026-11-09T16:20:20.569Z"
        },
        {
          "id": "cmw4glazq00c0tcws7djhvcle",
          "name": "[ 680 ] Thu & Nhân.JPG",
          "url": "/uploads/folders/tai-nguyen-8/-680-thu-nhan-1793938376626-dnex.webp",
          "size": 619418,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000gtcws7jyvosfe",
          "aiContextChunk": {
            "tags": [
              "ảnh cưới",
              "cô dâu",
              "backdrop tiệc cưới",
              "khoảnh khắc tiệc cưới",
              "váy cưới cúp ngực",
              "PlusMoments"
            ],
            "colorMood": "Tone màu tươi sáng, hiện đại với sắc xanh pastel và trắng chủ đạo, ánh sáng dịu nhẹ rạng rỡ",
            "mainSubject": "Khoảnh khắc vui tươi tinh nghịch của cô dâu bên bạn thân tại backdrop tiệc cưới hoa tươi",
            "suggestedAlt": "Cô dâu xinh đẹp chụp ảnh kỷ niệm tinh nghịch cùng bạn thân tại backdrop tiệc cưới",
            "suggestedCaption": "Hạnh phúc ngày chung đôi thêm vẹn tròn với những khoảnh khắc nhí nhố bên cạ cứng!",
            "visualDescription": "Bức ảnh ghi lại khoảnh khắc vô cùng nhí nhố và tự nhiên giữa cô dâu và bạn thân tại khu vực backdrop tiệc cưới. Cô dâu tỏa sáng trong chiếc váy cưới cúp ngực ren trắng tinh khôi dáng xòe nhẹ, kết hợp khăn voan cài tóc dịu dàng và tay cầm bó hoa cưới tone trắng xanh nhỏ nhắn. Người bạn thân bên cạnh diện đầm xòe ngắn màu đen cổ yếm quyến rũ, kết hợp quần tất đen và giày cao gót đính ngọc trai, đang tạo dáng tinh nghịch với nụ cười rạng rỡ. Phía sau là backdrop cưới nghệ thuật thiết kế hình vòm với tên chữ nổi 'Nhân & Thu', được trang trí hoa tươi rực rỡ kết hợp giữa cẩm tú cầu xanh pastel, hoa hồng phấn, hoa baby trắng và lá xanh tươi mát."
          },
          "uploadedById": null,
          "driveFileId": "1V_5j67C4ZUOCf6hx60bk0arlUrDI7XQe",
          "md5Checksum": "18f9fea76e668419170e58c21256e3a6",
          "createdAt": "2026-11-06T04:12:57.446Z",
          "updatedAt": "2026-11-09T16:20:20.569Z"
        },
        {
          "id": "cmw4gkycx00bytcwscow114uv",
          "name": "[ 678 ] Thu & Nhân.JPG",
          "url": "/uploads/folders/tai-nguyen-8/-678-thu-nhan-1793938360273-9cfa.webp",
          "size": 446456,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000gtcws7jyvosfe",
          "aiContextChunk": {
            "tags": [
              "ảnh cưới",
              "cô dâu",
              "váy cưới công chúa",
              "khoảnh khắc ngày cưới",
              "PlusMoments Wedding"
            ],
            "colorMood": "Tone màu tươi sáng, ấm áp, chân thực với ánh sáng rạng rỡ ngập tràn cảm xúc",
            "mainSubject": "Cô dâu rạng rỡ vỡ òa hạnh phúc bên bạn thân trong ngày cưới",
            "suggestedAlt": "Cô dâu cười rạng rỡ bên bạn thân trong ngày tiệc cưới PlusMoments",
            "suggestedCaption": "Nụ cười trọn vẹn và khoảnh khắc vô giá bên những người bạn thân yêu trong ngày chung đôi.",
            "visualDescription": "Bức ảnh ghi lại khoảnh khắc vô cùng tươi vui và tự nhiên của cô dâu bên hai người bạn thân tại sảnh tiệc cưới. Cô dâu tỏa sáng ở trung tâm trong chiếc váy cưới xòe công chúa lộng lẫy bằng chất liệu ren thêu tinh xảo, kết hợp khăn voan mỏng manh và bó hoa cầm tay tone trắng thanh lịch. Cô dâu đang cười thả ga đầy hạnh phúc cùng hai nữ khách mời diện trang phục màu đen hiện đại. Phông nền tiệc cưới được trang trí vòm hoa tươi kết hợp dòng chữ tên chú rể cô dâu 'Nhân & Thu'."
          },
          "uploadedById": null,
          "driveFileId": "17CYLLqVvSPrxhUm1N5yQmo6pQtOfHuuW",
          "md5Checksum": "03f682a7ba310f368f3421d3fddcd38a",
          "createdAt": "2026-11-06T04:12:41.074Z",
          "updatedAt": "2026-11-09T16:20:20.570Z"
        },
        {
          "id": "cmw4gkolh00bwtcwshxwgx137",
          "name": "[ 666 ] Thu & Nhân.JPG",
          "url": "/uploads/folders/tai-nguyen-8/-666-thu-nhan-1793938347757-f5rd.webp",
          "size": 418090,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyt000gtcws7jyvosfe",
          "aiContextChunk": {
            "tags": [
              "ảnh cưới",
              "tiệc cưới",
              "candid wedding",
              "khoảnh khắc ngày cưới",
              "PlusMoments Studio"
            ],
            "colorMood": "Tone màu ấm áp, ánh sáng sự kiện bắt trọn khoảnh khắc chân thực (candid), giàu cảm xúc",
            "mainSubject": "Khoảnh khắc quẩy tiệc cưới sôi động và tự nhiên của cô dâu chú rể cùng bạn bè",
            "suggestedAlt": "Cô dâu chú rể cùng bạn bè quẩy tiệc cưới sôi động ngập tràn niềm vui",
            "suggestedCaption": "Khoảnh khắc vỡ òa hạnh phúc và năng lượng tích cực của cô dâu chú rể bên những người thân yêu trong ngày trọng đại.",
            "visualDescription": "Bức ảnh ghi lại khoảnh khắc quẩy tiệc cưới ngập tràn tiếng cười và năng lượng tích cực. Cô dâu tỏa sáng trong chiếc váy cưới cúp ngực trắng tinh khôi kết hợp voan cài tóc dịu dàng, chú rể diện suit lịch lãm rạng rỡ bên cạnh. Dàn bạn bè xung quanh hào hứng giơ cao những chùm hoa baby trắng tung hô, cùng hai bé trai tinh nghịch tạo dáng ngộ nghĩnh ở tiền cảnh. Bối cảnh tiệc cưới lung linh với ánh đèn nghệ thuật ấm áp phía sau backdrop sân khấu."
          },
          "uploadedById": null,
          "driveFileId": "1iXEohckTpeeGtes6r61FK0NEb6fWnPuj",
          "md5Checksum": "8511215bc7558228497d885da17286d1",
          "createdAt": "2026-11-06T04:12:28.414Z",
          "updatedAt": "2026-11-09T16:20:20.570Z"
        },
        {
          "id": "cmw4gke2j00butcwsthqn4h09",
          "name": "[ 665 ] Thu & Nhân.JPG",
          "url": "/uploads/folders/tai-nguyen-8/-665-thu-nhan-1793938334161-jxqg.webp",
          "size": 275146,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyt000gtcws7jyvosfe",
          "aiContextChunk": {
            "tags": [
              "ảnh cưới",
              "tiệc cưới",
              "khoảnh khắc cưới",
              "cô dâu chú rể",
              "plusmoments"
            ],
            "colorMood": "Tone màu ấm áp, ánh sáng đèn flash trực diện mang phong cách ảnh tư liệu tiệc cưới chân thực",
            "mainSubject": "Khoảnh khắc cô dâu chú rể di chuyển trong tiệc cưới với bó hoa baby trắng",
            "suggestedAlt": "Khoảnh khắc vui vẻ của cô dâu chú rể trong tiệc cưới tại PlusMoments",
            "suggestedCaption": "Khoảnh khắc rạng rỡ, tràn đầy năng lượng trong ngày trọng đại. Lưu giữ mọi cảm xúc chân thật nhất cùng PlusMoments.",
            "visualDescription": "Bức ảnh ghi lại khoảnh khắc vui vẻ, náo nhiệt trong tiệc cưới. Cô dâu mặc váy cưới trắng cúp ngực đính ren tinh tế, đội khăn voan dài, đang cầm bó hoa baby trắng che mặt. Chú rể mặc vest tuxedo đen lịch lãm, đeo kính, đang nắm tay cô dâu và cùng di chuyển trong không gian tiệc. Xung quanh là bạn bè đang cầm hoa baby, tạo nên bầu không khí sôi động, tự nhiên và tràn đầy năng lượng."
          },
          "uploadedById": null,
          "driveFileId": "1Sr4Tjjis417FV3qkDQ-IRUeKM1IYvdq7",
          "md5Checksum": "3986d24d100da547c62e4bcd30505cb4",
          "createdAt": "2026-11-06T04:12:14.780Z",
          "updatedAt": "2026-11-09T16:20:20.571Z"
        },
        {
          "id": "cmw4gk3d600bstcwsql7vvttc",
          "name": "[ 659 ] Thu & Nhân.JPG",
          "url": "/uploads/folders/tai-nguyen-8/-659-thu-nhan-1793938320248-2sbs.webp",
          "size": 383242,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyt000gtcws7jyvosfe",
          "aiContextChunk": {
            "tags": [
              "ảnh cưới party",
              "after party wedding",
              "váy cưới đẹp",
              "khoảnh khắc ngày cưới",
              "PlusMoments Wedding"
            ],
            "colorMood": "Tone ấm áp kết hợp ánh sáng flash điện ảnh, phong cách chụp motion blur năng động và giàu cảm xúc",
            "mainSubject": "Cô dâu rạng rỡ cùng chú rể và người thân trong khoảnh khắc After-Party tiệc cưới đầy sôi động",
            "suggestedAlt": "Cô dâu rạng rỡ trong khoảnh khắc tiệc cưới sôi động phong cách hiện đại",
            "suggestedCaption": "Khoảnh khắc vỡ òa hạnh phúc và nụ cười rạng rỡ trong bữa tiệc cưới bùng nổ cảm xúc cùng PlusMoments.",
            "visualDescription": "Bức ảnh ghi lại khoảnh khắc After-Party tiệc cưới bùng nổ năng lượng và ngập tràn niềm vui với kỹ thuật chụp chuyển động (motion blur). Cô dâu xinh đẹp nổi bật trong chiếc váy cưới cúp ngực xòe nhẹ đính ren cao cấp, kết hợp khăn voan ngắn tinh tế và makeup tông tự nhiên rạng rỡ. Cô dâu nở nụ cười hạnh phúc rạng ngời bên chú rể và bạn bè, người thân cùng các bé nhỏ đang tung hoa, nâng ly chúc mừng. Bối cảnh không gian tiệc tối hiện đại với hiệu ứng ánh sáng đèn flash dải vệt đầy tính nghệ thuật điện ảnh, truyền tải trọn vẹn cảm xúc chân thật, tự do và phấn khích của ngày vui."
          },
          "uploadedById": null,
          "driveFileId": "1X1qQ4zc0jPYEo7F3iOgXkb8uhoRygd2f",
          "md5Checksum": "929e452626bd8c5954497d9f54c4cf14",
          "createdAt": "2026-11-06T04:12:00.906Z",
          "updatedAt": "2026-11-09T16:20:20.571Z"
        },
        {
          "id": "cmw4gjqhq00bqtcwskjz4l3fx",
          "name": "[ 649 ] Thu & Nhân.JPG",
          "url": "/uploads/folders/tai-nguyen-8/-649-thu-nhan-1793938303570-d6gh.webp",
          "size": 310950,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyt000gtcws7jyvosfe",
          "aiContextChunk": {
            "tags": [
              "ảnh cưới",
              "tiệc cưới đêm",
              "cô dâu",
              "váy cưới cúp ngực",
              "after party wedding",
              "PlusMoments"
            ],
            "colorMood": "Tone màu ấm áp, phong cách ảnh tiệc after-party sôi động với hiệu ứng ánh sáng vệt đèn điện ảnh",
            "mainSubject": "Cô dâu rạng rỡ nâng ly champagne và đùa vui cùng bạn bè trong tiệc cưới đêm",
            "suggestedAlt": "Cô dâu rạng rỡ nâng ly champagne cùng bạn bè trong tiệc cưới đêm PlusMoments",
            "suggestedCaption": "Nụ cười sảng khoái và những khoảnh khắc quẩy hết mình cùng hội bạn thân trong đêm tiệc cưới đáng nhớ.",
            "visualDescription": "Khoảnh khắc ngập tràn niềm vui của cô dâu trong chiếc váy cưới cúp ngực đính ren hoa li ti cùng voan cài tóc mềm mại. Cô dâu một tay nâng ly champagne sóng sánh, tay kia cầm bó hoa thạch thảo trắng nhẹ nhàng, cười thả ga đầy tự nhiên bên cạnh người bạn thân mặc đầm đen quyến rũ. Bối cảnh không gian tiệc cưới buổi đêm lung linh với kỹ thuật chụp flash bắt vệt sáng (light trails) sống động, phía sau thấp thoáng chữ Hỷ (囍) màu vàng đồng ấm áp."
          },
          "uploadedById": null,
          "driveFileId": "151b5d4_YnCR1Cgaw828HrltmZ7n4N_Hw",
          "md5Checksum": "cfdcdd4239ae56d5100d2926b6b598c1",
          "createdAt": "2026-11-06T04:11:44.222Z",
          "updatedAt": "2026-11-09T16:20:20.572Z"
        },
        {
          "id": "cmw4gjf2k00botcws7qps8ljp",
          "name": "[ 643 ] Thu & Nhân.JPG",
          "url": "/uploads/folders/tai-nguyen-8/-643-thu-nhan-1793938288753-4kej.webp",
          "size": 317264,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyt000gtcws7jyvosfe",
          "aiContextChunk": {
            "tags": [
              "ảnh cưới",
              "after party",
              "tiệc cưới",
              "chụp ảnh tiệc cưới",
              "PlusMoments",
              "khoảnh khắc tự nhiên"
            ],
            "colorMood": "Phong cách flash cinematic kết hợp motion blur, tông màu hiện đại, cá tính và tràn đầy năng lượng",
            "mainSubject": "Chú rể say sưa hát tặng cô dâu cùng không khí tiệc cưới after-party bùng nổ cảm xúc",
            "suggestedAlt": "Chú rể hát tặng cô dâu trong đêm tiệc cưới after-party sôi động PlusMoments",
            "suggestedCaption": "Cháy hết mình trong đêm tiệc after-party – nơi tình yêu và niềm vui thăng hoa trọn vẹn cùng PlusMoments.",
            "visualDescription": "Khoảnh khắc bùng nổ tại đêm tiệc cưới (after-party) được ghi lại với kỹ thuật hiệu ứng mờ nhòe chuyển động (shutter drag) đầy nghệ thuật. Chú rể diện áo vest xanh navy lịch lãm khoác ngoài sơ mi họa tiết xanh trắng, đeo kính và đang say sưa cất tiếng hát vào micro, tay cầm chùm hoa baby trắng. Phía sau, cô dâu lộng lẫy trong thiết kế váy cưới cúp ngực ren lấp lánh phối khăn voan mỏng, tay cầm ly champagne, nở nụ cười rạng rỡ và hòa mình vào điệu nhảy sôi động cùng bạn bè."
          },
          "uploadedById": null,
          "driveFileId": "1H4Cb6yQjNsJJ30STO2T0ULaaVR1XzCEO",
          "md5Checksum": "2afb7b90ad5efbf459f8fbc92f53dd6c",
          "createdAt": "2026-11-06T04:11:29.420Z",
          "updatedAt": "2026-11-09T16:20:20.573Z"
        },
        {
          "id": "cmw4gj34600bmtcws9u7zwzo5",
          "name": "[ 637 ] Thu & Nhân.JPG",
          "url": "/uploads/folders/tai-nguyen-8/-637-thu-nhan-1793938273302-muw1.webp",
          "size": 238898,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyt000gtcws7jyvosfe",
          "aiContextChunk": {
            "tags": [
              "tiệc cưới",
              "song ca tiệc cưới",
              "ảnh tiệc cưới",
              "khoảnh khắc tiệc cưới",
              "plusmoments"
            ],
            "colorMood": "Tone màu ấm áp ấm cúng, ánh sáng flash sự kiện chân thực, khoảnh khắc bắt động sống động",
            "mainSubject": "Màn song ca đầy thăng hoa và tràn ngập niềm vui của cặp đôi trong đêm tiệc cưới",
            "suggestedAlt": "Màn song ca tràn ngập niềm vui và cảm xúc trong tiệc cưới PlusMoments",
            "suggestedCaption": "Giai điệu hạnh phúc cất lên đầy thăng hoa, ghi dấu khoảnh khắc vui tươi khó quên trong đêm tiệc cưới.",
            "visualDescription": "Khoảnh khắc bùng nổ cảm xúc và đong đầy niềm vui trong đêm tiệc cưới khi cặp đôi hòa giọng song ca trên sân khấu. Phía bên phải, người nam đeo kính cận lịch lãm trong trang phục vest xanh navy kết hợp áo sơ mi họa tiết xanh trắng tươi trẻ, đang say sưa hát vào micro với gương mặt rạng rỡ. Phía bên trái, người nữ diện đầm đen quyến rũ, tóc uốn sóng bồng bềnh, son môi đỏ nổi bật, tay cầm bó hoa thạch thảo trắng nhỏ xinh cùng chiếc micro hòa giọng đầy ngẫu hứng. Ánh sáng đèn tiệc lung linh cùng hiệu ứng bắt chuyển động bắt trọn không khí náo nhiệt, ấm áp và đong đầy hạnh phúc."
          },
          "uploadedById": null,
          "driveFileId": "1yMPwE5abOgYkUM8J3NXcb_Z_Ev3gb91H",
          "md5Checksum": "03dbf76e307edeb5e451dc7a8dae8979",
          "createdAt": "2026-11-06T04:11:13.927Z",
          "updatedAt": "2026-11-09T16:20:20.573Z"
        },
        {
          "id": "cmw4gisuv00bktcws3tuxlvvq",
          "name": "[ 634 ] Thu & Nhân.JPG",
          "url": "/uploads/folders/tai-nguyen-8/-634-thu-nhan-1793938259981-dxh6.webp",
          "size": 281032,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyt000gtcws7jyvosfe",
          "aiContextChunk": {
            "tags": [
              "ảnh cưới after party",
              "phóng sự cưới",
              "váy cưới",
              "tiệc cưới đêm",
              "PlusMoments Wedding"
            ],
            "colorMood": "Phong cách tiệc đêm rực rỡ, hiệu ứng vệt sáng motion blur sống động, tone màu ấm áp chân thực",
            "mainSubject": "Cô dâu chú rể cùng bạn bè quậy hết mình trong tiệc cưới after-party sôi động",
            "suggestedAlt": "Cô dâu chú rể quậy hết mình cùng bạn bè trong tiệc cưới after-party sôi động",
            "suggestedCaption": "Đêm tiệc after-party bùng nổ, nơi cảm xúc thăng hoa và niềm vui kéo dài bất tận cùng PlusMoments.",
            "visualDescription": "Khoảnh khắc tiệc cưới after-party bùng nổ và tràn đầy năng lượng. Cô dâu diện chiếc váy cưới ren cúp ngực xòe bồng cùng voan cài đầu, vừa nhấc vạt váy vừa cầm ly champagne nhún nhảy. Chú rể cực phong cách trong bộ vest xanh khoác ngoài sơ mi họa tiết, tay cầm micro ca hát say sưa cùng bó hoa baby trắng. Xung quanh là dàn bạn bè nhảy múa nhiệt tình. Bức ảnh sử dụng kỹ thuật bắt vệt sáng (motion blur / slow sync flash) tạo nên không khí tiệc đêm điện ảnh, phóng khoáng và tràn ngập niềm vui."
          },
          "uploadedById": null,
          "driveFileId": "1rvb5zKVsc_dwMd0ufzhmrdeo3L-OR5vz",
          "md5Checksum": "bc1e89ca82baaca71753a3550c9abd75",
          "createdAt": "2026-11-06T04:11:00.632Z",
          "updatedAt": "2026-11-09T16:20:20.574Z"
        },
        {
          "id": "cmw4giizh00bitcwsqcirsl8g",
          "name": "[ 627 ] Thu & Nhân.JPG",
          "url": "/uploads/folders/tai-nguyen-8/-627-thu-nhan-1793938246997-h5qe.webp",
          "size": 447740,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000gtcws7jyvosfe",
          "aiContextChunk": {
            "tags": [
              "ảnh cưới",
              "váy cưới",
              "cô dâu",
              "tiệc cưới",
              "plusmoments",
              "wedding photography"
            ],
            "colorMood": "Tone màu ấm áp, ánh sáng tự nhiên của không gian tiệc cưới, mang lại cảm giác gần gũi và chân thực",
            "mainSubject": "Cô dâu trong váy cưới ren lấp lánh và khăn voan trắng tại tiệc cưới",
            "suggestedAlt": "Cô dâu mặc váy cưới ren trắng lấp lánh trong tiệc cưới sang trọng",
            "suggestedCaption": "Khoảnh khắc hạnh phúc trong ngày trọng đại, nơi tình yêu tỏa sáng rạng ngời.",
            "visualDescription": "Bức ảnh ghi lại khoảnh khắc cô dâu trong chiếc váy cưới trắng tinh khôi với họa tiết ren chìm lấp lánh, kết hợp cùng khăn voan dài phủ vai và phụ kiện cài tóc hoa trắng tinh tế. Cô dâu đứng nghiêng, tạo dáng thanh thoát trong không gian tiệc cưới ấm cúng. Bên cạnh là chú rể mặc trang phục sơ mi trắng và quần tây sáng màu, tạo nên sự đồng điệu. Bối cảnh xung quanh là bàn tiệc với khăn trải bàn màu champagne, ly thủy tinh và ánh sáng đèn vàng tạo hiệu ứng mờ ảo, chân thực của một buổi tiệc tối."
          },
          "uploadedById": null,
          "driveFileId": "1VvluqlJ8Bx0PYvMrpsu1F2E68lswq_Qv",
          "md5Checksum": "c8298fb04c96001988836e29fd220353",
          "createdAt": "2026-11-06T04:10:47.838Z",
          "updatedAt": "2026-11-09T16:20:20.575Z"
        },
        {
          "id": "cmw4gi7l400bgtcws1vt3v98g",
          "name": "[ 624 ] Thu & Nhân.JPG",
          "url": "/uploads/folders/tai-nguyen-8/-624-thu-nhan-1793938232410-v2qe.webp",
          "size": 364604,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyt000gtcws7jyvosfe",
          "aiContextChunk": {
            "tags": [
              "ảnh cưới",
              "tiệc cưới",
              "khoảnh khắc cưới",
              "plusmoments",
              "chụp ảnh cưới"
            ],
            "colorMood": "Tone màu ấm áp, ánh sáng đèn flash trực diện mang phong cách ảnh tư liệu chân thực",
            "mainSubject": "Khoảnh khắc nâng ly chúc mừng của cô dâu chú rể và bạn bè trong tiệc cưới",
            "suggestedAlt": "Khoảnh khắc cô dâu chú rể nâng ly cùng bạn bè trong tiệc cưới tại PlusMoments",
            "suggestedCaption": "Nâng ly chúc mừng hạnh phúc, lưu giữ những khoảnh khắc rộn ràng nhất cùng những người thân yêu.",
            "visualDescription": "Một bức ảnh chụp khoảnh khắc tiệc cưới thân mật, nơi cô dâu chú rể cùng bạn bè đang nâng ly chúc mừng quanh bàn tiệc tròn. Cô dâu mặc váy cưới trắng tinh khôi, chú rể mặc vest lịch lãm, xung quanh là bạn bè trong trang phục dự tiệc hiện đại. Bàn tiệc bày biện các món ăn, đồ uống và bia Tiger. Ánh sáng đèn flash trực diện tạo cảm giác chân thực, sống động của một buổi tiệc tối."
          },
          "uploadedById": null,
          "driveFileId": "1DoaAVlLNsmB6tEn_mZ4dsLi4-sRC9avc",
          "md5Checksum": "b618f733635a451fbe0659ad7b14bbd8",
          "createdAt": "2026-11-06T04:10:33.064Z",
          "updatedAt": "2026-11-09T16:20:20.575Z"
        },
        {
          "id": "cmw4ghvkt00betcwszewqb52s",
          "name": "[ 614 ] Thu & Nhân.JPG",
          "url": "/uploads/folders/tai-nguyen-8/-614-thu-nhan-1793938216890-ergv.webp",
          "size": 255074,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyt000gtcws7jyvosfe",
          "aiContextChunk": {
            "tags": [
              "ảnh cưới",
              "tiệc cưới",
              "khoảnh khắc hạnh phúc",
              "plusmoments",
              "wedding party"
            ],
            "colorMood": "Tone màu ấm áp, ánh sáng đèn tiệc lung linh, không khí lễ hội sôi động",
            "mainSubject": "Cô dâu chú rể nâng ly chúc mừng cùng bạn bè trong tiệc cưới",
            "suggestedAlt": "Khoảnh khắc cô dâu chú rể nâng ly chúc mừng cùng bạn bè trong tiệc cưới",
            "suggestedCaption": "Nâng ly chúc mừng hạnh phúc, lưu giữ khoảnh khắc rạng rỡ nhất cùng những người thân yêu.",
            "visualDescription": "Một khoảnh khắc tiệc cưới sôi động với góc chụp rộng, cô dâu mặc váy cưới cúp ngực ren trắng tinh khôi cùng khăn voan cài đầu, chú rể mặc vest tối màu lịch lãm. Cả hai đang cùng bạn bè nâng ly chúc mừng trong không gian tiệc tối sang trọng. Ánh sáng đèn trần tạo hiệu ứng vệt sáng nghệ thuật, làm nổi bật nụ cười rạng rỡ và không khí vui vẻ, náo nhiệt của buổi tiệc."
          },
          "uploadedById": null,
          "driveFileId": "1FrKgg2hzS7HSe-o18FgLzWyNX2in0SQj",
          "md5Checksum": "e92ef768a44284d99186d888299035d9",
          "createdAt": "2026-11-06T04:10:17.501Z",
          "updatedAt": "2026-11-09T16:20:20.576Z"
        },
        {
          "id": "cmw4ghitj00bctcwsnpdrgqxy",
          "name": "[ 612 ] Thu & Nhân.JPG",
          "url": "/uploads/folders/tai-nguyen-8/-612-thu-nhan-1793938200366-nd9v.webp",
          "size": 207556,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyt000gtcws7jyvosfe",
          "aiContextChunk": {
            "tags": [
              "ảnh cưới",
              "tiệc cưới",
              "khoảnh khắc hạnh phúc",
              "cô dâu chú rể",
              "plusmoments"
            ],
            "colorMood": "Tone màu tự nhiên, tươi sáng, không khí tiệc cưới ấm áp và tràn đầy năng lượng",
            "mainSubject": "Cô dâu chú rể cùng bạn bè nâng ly chúc mừng trong tiệc cưới",
            "suggestedAlt": "Khoảnh khắc cô dâu chú rể nâng ly chúc mừng cùng bạn bè trong tiệc cưới",
            "suggestedCaption": "Khoảnh khắc hạnh phúc vỡ òa cùng những người thân yêu. Chúc mừng ngày chung đôi!",
            "visualDescription": "Bức ảnh ghi lại khoảnh khắc vui vẻ, náo nhiệt trong tiệc cưới. Cô dâu mặc váy cưới trắng tinh khôi, đội khăn voan ren, chú rể mặc vest đen lịch lãm. Cả hai cùng bạn bè, người thân đang nâng ly chúc mừng, gương mặt rạng rỡ, cười tươi đầy phấn khích. Bối cảnh là không gian tiệc cưới trong nhà với ánh sáng tự nhiên, ấm áp, tập trung vào sự kết nối và niềm vui của mọi người."
          },
          "uploadedById": null,
          "driveFileId": "10qQb7NsKQSTWiUXR5B4CLPzDgoxarZCJ",
          "md5Checksum": "61a341c607a78fd64a33adc1f20cbc93",
          "createdAt": "2026-11-06T04:10:00.967Z",
          "updatedAt": "2026-11-09T16:20:20.577Z"
        },
        {
          "id": "cmw4gh8j100batcwsaf55b1ft",
          "name": "[ 563 ] Thu & Nhân.JPG",
          "url": "/uploads/folders/tai-nguyen-8/-563-thu-nhan-1793938187050-5qlx.webp",
          "size": 193406,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyt000gtcws7jyvosfe",
          "aiContextChunk": {
            "tags": [
              "ảnh cưới",
              "lễ cưới",
              "gia đình",
              "cô dâu chú rể",
              "plusmoments"
            ],
            "colorMood": "Tone màu ấm áp, ánh sáng dịu nhẹ, sang trọng và giàu cảm xúc",
            "mainSubject": "Khoảnh khắc gia đình hai bên trong lễ cưới truyền thống",
            "suggestedAlt": "Khoảnh khắc gia đình cô dâu chú rể trong lễ cưới truyền thống ấm áp",
            "suggestedCaption": "Gia đình là điểm tựa, là nơi bắt đầu cho hành trình hạnh phúc của đôi lứa.",
            "visualDescription": "Bức ảnh ghi lại khoảnh khắc trang trọng trong lễ cưới với cô dâu chú rể đứng giữa, xung quanh là cha mẹ hai bên. Cô dâu mặc váy cưới cúp ngực đính ren tinh tế, đội khăn voan dài thêu hoa, tay cầm bó hoa hồng trắng. Chú rể mặc vest đen lịch lãm. Cha mẹ cô dâu chú rể mặc áo dài truyền thống (xanh và đỏ) và vest, tạo nên không khí gia đình ấm cúng, thiêng liêng."
          },
          "uploadedById": null,
          "driveFileId": "1vBXmlc3E3PhHv_4aHv9vLlYcys851J57",
          "md5Checksum": "7e4972bcdf93e18d7d0273affc476f51",
          "createdAt": "2026-11-06T04:09:47.629Z",
          "updatedAt": "2026-11-09T16:20:20.577Z"
        },
        {
          "id": "cmw4ggwyc00b8tcws1pmw18h2",
          "name": "[ 345 ] Thu & Nhân.JPG",
          "url": "/uploads/folders/tai-nguyen-8/-345-thu-nhan-1793938172003-djj1.webp",
          "size": 336106,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyt000gtcws7jyvosfe",
          "aiContextChunk": {
            "tags": [
              "ảnh cưới",
              "áo dài cưới",
              "lễ rước dâu",
              "plusmoments",
              "phóng sự cưới"
            ],
            "colorMood": "Tone màu tươi sáng, rực rỡ với sắc đỏ chủ đạo, ánh sáng tự nhiên ngoài trời sống động",
            "mainSubject": "Cô dâu chú rể trong lễ rước dâu truyền thống",
            "suggestedAlt": "Cô dâu chú rể hạnh phúc trong lễ rước dâu truyền thống Việt Nam",
            "suggestedCaption": "Khoảnh khắc hạnh phúc vỡ òa trong ngày trọng đại. Chúc hai bạn mãi mãi bên nhau!",
            "visualDescription": "Khoảnh khắc hạnh phúc trong lễ cưới truyền thống với cô dâu mặc áo dài đỏ rực rỡ, đeo trang sức vàng, cầm bó hoa cưới tone trắng tinh tế. Chú rể mặc vest xanh navy lịch lãm, bên cạnh là người thân trong tà áo dài hồng. Cả ba đang bước đi giữa cơn mưa pháo giấy lấp lánh, nụ cười rạng rỡ và ánh mắt tràn đầy niềm vui."
          },
          "uploadedById": null,
          "driveFileId": "1CYxyqYVqPAWLmHzpgR1ECd_78vrszexd",
          "md5Checksum": "fd522a00184f6513abef1503cb5d0eca",
          "createdAt": "2026-11-06T04:09:32.629Z",
          "updatedAt": "2026-11-09T16:20:20.578Z"
        },
        {
          "id": "cmw4ggj5n00b6tcwsu1lo1t1n",
          "name": "[ 343 ] Thu & Nhân.JPG",
          "url": "/uploads/folders/tai-nguyen-8/-343-thu-nhan-1793938154133-r10x.webp",
          "size": 356948,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyt000gtcws7jyvosfe",
          "aiContextChunk": {
            "tags": [
              "ảnh cưới",
              "lễ rước dâu",
              "áo dài cưới",
              "plusmoments",
              "phóng sự cưới"
            ],
            "colorMood": "Tone màu rực rỡ, ấm áp, ánh sáng tự nhiên ngoài trời tươi sáng",
            "mainSubject": "Cô dâu chú rể trong lễ rước dâu truyền thống với pháo giấy kim tuyến",
            "suggestedAlt": "Khoảnh khắc hạnh phúc cô dâu chú rể trong lễ rước dâu truyền thống",
            "suggestedCaption": "Ngày chung đôi rực rỡ, khởi đầu cho hành trình hạnh phúc vẹn tròn.",
            "visualDescription": "Khoảnh khắc hạnh phúc trong lễ cưới truyền thống Việt Nam. Cô dâu mặc áo dài đỏ rực rỡ, cầm bó hoa cưới tone trắng, tay nắm chặt chú rể mặc vest lịch lãm. Bên cạnh là người thân đang hân hoan chúc mừng. Không gian tràn ngập những mảnh giấy kim tuyến lấp lánh rơi xuống, tạo nên hiệu ứng thị giác sống động và đầy năng lượng."
          },
          "uploadedById": null,
          "driveFileId": "1X9iwC3LiouHnNmw2wnj_EliWquO4p82Z",
          "md5Checksum": "07bfc9f0066832eae1f7214cb16d6ce3",
          "createdAt": "2026-11-06T04:09:14.748Z",
          "updatedAt": "2026-11-09T16:20:20.578Z"
        },
        {
          "id": "cmw4gg6au00b4tcwslm7b2p9o",
          "name": "[ 341 ] Thu & Nhân.JPG",
          "url": "/uploads/folders/tai-nguyen-8/-341-thu-nhan-1793938137510-9q9m.webp",
          "size": 231866,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyt000gtcws7jyvosfe",
          "aiContextChunk": {
            "tags": [
              "ảnh cưới",
              "lễ rước dâu",
              "áo dài cưới",
              "plusmoments",
              "ảnh cưới truyền thống"
            ],
            "colorMood": "Tone màu tươi sáng, rực rỡ, ánh sáng tự nhiên ngoài trời ấm áp",
            "mainSubject": "Khoảnh khắc hạnh phúc của cô dâu, chú rể và mẹ trong lễ rước dâu truyền thống",
            "suggestedAlt": "Khoảnh khắc hạnh phúc của cô dâu chú rể trong lễ rước dâu truyền thống Việt Nam",
            "suggestedCaption": "Khoảnh khắc rạng rỡ ngày chung đôi, nụ cười hạnh phúc lan tỏa trong ngày vui trọng đại.",
            "visualDescription": "Bức ảnh ghi lại khoảnh khắc hạnh phúc trong lễ rước dâu truyền thống. Cô dâu mặc áo dài đỏ rực rỡ, tay cầm bó hoa cưới baby trắng, đang nắm tay mẹ chồng (mặc áo dài hồng cánh sen sang trọng) và chú rể (mặc vest xanh navy lịch lãm). Cả ba nhân vật đều cười rạng rỡ. Không gian xung quanh tràn ngập pháo giấy kim tuyến lấp lánh tạo hiệu ứng bokeh đẹp mắt, làm nổi bật không khí lễ hội vui tươi."
          },
          "uploadedById": null,
          "driveFileId": "1pdcHemDW_3v5Iha36AL2zZQVphI0G6LG",
          "md5Checksum": "725e7d190fc1668d1c01ce971152da32",
          "createdAt": "2026-11-06T04:08:58.087Z",
          "updatedAt": "2026-11-09T16:20:20.579Z"
        },
        {
          "id": "cmw4gfwxr00b2tcwsthlxmdyp",
          "name": "[ 339 ] Thu & Nhân.JPG",
          "url": "/uploads/folders/tai-nguyen-8/-339-thu-nhan-1793938125364-phzj.webp",
          "size": 244594,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyt000gtcws7jyvosfe",
          "aiContextChunk": {
            "tags": [
              "ảnh cưới",
              "lễ rước dâu",
              "áo dài cưới",
              "plusmoments",
              "phóng sự cưới"
            ],
            "colorMood": "Tone màu tươi sáng, rực rỡ với sắc đỏ chủ đạo, ánh sáng tự nhiên ban ngày",
            "mainSubject": "Cô dâu chú rể trong lễ rước dâu truyền thống",
            "suggestedAlt": "Cô dâu chú rể hạnh phúc trong lễ rước dâu truyền thống tại Việt Nam",
            "suggestedCaption": "Khoảnh khắc rạng rỡ ngày chung đôi, khởi đầu cho hành trình hạnh phúc viên mãn.",
            "visualDescription": "Bức ảnh ghi lại khoảnh khắc hạnh phúc trong lễ rước dâu truyền thống. Cô dâu mặc áo dài đỏ đính kết tinh tế, cầm bó hoa cưới hồng trắng, tay trong tay cùng chú rể mặc vest xanh đen lịch lãm. Bên cạnh là người thân trong trang phục áo dài hồng rực rỡ đang vẫy tay chào. Bối cảnh ngoài trời với cửa sắt xám và cây xanh, không khí vui tươi, náo nhiệt."
          },
          "uploadedById": null,
          "driveFileId": "1KSzkFwcz21stxdjPDQb1PFe_Zpu5NAo7",
          "md5Checksum": "18949ed9f139088e11609c0dd179a54d",
          "createdAt": "2026-11-06T04:08:45.952Z",
          "updatedAt": "2026-11-09T16:20:20.579Z"
        },
        {
          "id": "cmw4gfl9600b0tcwsaen5p737",
          "name": "[ 336 ] Thu & Nhân.JPG",
          "url": "/uploads/folders/tai-nguyen-8/-336-thu-nhan-1793938110028-8n5y.webp",
          "size": 479632,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000gtcws7jyvosfe",
          "aiContextChunk": {
            "tags": [
              "ảnh cưới",
              "áo dài cưới",
              "đám cưới truyền thống",
              "plusmoments",
              "ảnh cưới gia đình"
            ],
            "colorMood": "Tone màu tươi sáng, ánh sáng tự nhiên ban ngày, mang lại cảm giác ấm áp và tràn đầy năng lượng",
            "mainSubject": "Cô dâu chú rể trong trang phục áo dài truyền thống cùng mẹ trong ngày cưới",
            "suggestedAlt": "Cô dâu chú rể mặc áo dài đỏ cùng mẹ trong ngày cưới hạnh phúc",
            "suggestedCaption": "Khoảnh khắc hạnh phúc ngày chung đôi, nụ cười rạng rỡ bên gia đình thân yêu.",
            "visualDescription": "Một bức ảnh cưới ngoài trời ghi lại khoảnh khắc cô dâu chú rể cùng mẹ đang bước đi trên phố. Cô dâu mặc áo dài đỏ truyền thống đính kết tinh tế, chú rể lịch lãm trong bộ vest xanh đen, tay cầm bó hoa cưới màu trắng. Người mẹ đi bên cạnh mặc áo dài hồng cánh sen thêu họa tiết sang trọng. Cả ba đều nở nụ cười rạng rỡ, chú rể đang vẫy tay chào, tạo nên không khí gia đình ấm áp và hạnh phúc."
          },
          "uploadedById": null,
          "driveFileId": "1V3i8_aHPXFWWkomLUNqZjz0p-TwZEnEz",
          "md5Checksum": "a7aa56dbd213c7f78e5f9d1a635b3a30",
          "createdAt": "2026-11-06T04:08:30.810Z",
          "updatedAt": "2026-11-09T16:20:20.580Z"
        },
        {
          "id": "cmw4gfcv800aytcws5gshpi2u",
          "name": "[ 278 ] Thu & Nhân.JPG",
          "url": "/uploads/folders/tai-nguyen-8/-278-thu-nhan-1793938099110-1q70.webp",
          "size": 606514,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000gtcws7jyvosfe",
          "aiContextChunk": {
            "tags": [
              "ảnh cưới",
              "lễ ăn hỏi",
              "áo dài cưới",
              "phong bao lì xì",
              "đám cưới truyền thống",
              "plusmoments"
            ],
            "colorMood": "Tone màu đỏ chủ đạo rực rỡ, không khí lễ hội ấm áp, ánh sáng tự nhiên tươi sáng",
            "mainSubject": "Cô dâu chú rể trong lễ ăn hỏi truyền thống với phong bao lì xì đỏ và áo dài đỏ",
            "suggestedAlt": "Cô dâu chú rể trong lễ ăn hỏi truyền thống với phong bao lì xì đỏ",
            "suggestedCaption": "Ngày chung đôi rạng rỡ, khởi đầu cho hành trình hạnh phúc trọn vẹn. Chúc mừng ngày vui của hai bạn!",
            "visualDescription": "Cô dâu chú rể trong trang phục cưới truyền thống Việt Nam, đang mỉm cười rạng rỡ trong ngày lễ ăn hỏi. Cô dâu mặc áo dài đỏ đính ngọc trai, tay cầm bó hoa cưới trắng và xòe quạt tiền mệnh giá 50.000 VNĐ, tay kia cầm phong bao lì xì đỏ. Chú rể mặc vest đen lịch lãm, cài hoa trắng trên ngực, tay cầm phong bao lì xì. Bối cảnh được trang trí bằng vải voan đỏ rực rỡ, tạo không khí lễ hội ấm cúng và hạnh phúc."
          },
          "uploadedById": null,
          "driveFileId": "1KFmWGOjh1_PURTbiYnCpcbIi46hQvlVA",
          "md5Checksum": "6d010b5a428a73bc1128b66abe7de726",
          "createdAt": "2026-11-06T04:08:19.941Z",
          "updatedAt": "2026-11-09T16:20:20.581Z"
        },
        {
          "id": "cmw4gf2a600awtcws41ruiuqi",
          "name": "[ 276 ] Thu & Nhân.JPG",
          "url": "/uploads/folders/tai-nguyen-8/-276-thu-nhan-1793938085615-da15.webp",
          "size": 295684,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyt000gtcws7jyvosfe",
          "aiContextChunk": {
            "tags": [
              "ảnh cưới",
              "lễ ăn hỏi",
              "áo dài cưới",
              "PlusMoments",
              "chụp ảnh cưới truyền thống"
            ],
            "colorMood": "Tone màu rực rỡ, ấm áp với sắc đỏ chủ đạo, ánh sáng studio tươi sáng và sắc nét",
            "mainSubject": "Cô dâu chú rể trong lễ ăn hỏi truyền thống cùng bạn thân",
            "suggestedAlt": "Khoảnh khắc hạnh phúc của cô dâu chú rể trong lễ ăn hỏi truyền thống tại PlusMoments",
            "suggestedCaption": "Ngày vui trọn vẹn, nụ cười rạng rỡ bên những người thân yêu nhất. Chúc mừng hạnh phúc đôi uyên ương!",
            "visualDescription": "Bức ảnh ghi lại khoảnh khắc hạnh phúc trong lễ ăn hỏi với cô dâu mặc áo dài đỏ truyền thống, cầm bó hoa sen trắng và quạt cầm tay trang trí tinh xảo. Bên cạnh là chú rể lịch lãm trong bộ vest đen, sơ mi trắng và cà vạt. Một người bạn thân thiết trong trang phục áo dài hồng pastel đang ôm và hôn má cô dâu. Bối cảnh được trang trí rực rỡ với hoa tươi tông đỏ và trắng, tạo không khí ấm cúng, trang trọng."
          },
          "uploadedById": null,
          "driveFileId": "1cD2hD3yANHpRKNiKn7EKRj8VlIFLaKgY",
          "md5Checksum": "3be9d3e5b0f947f85c7bb2fdbe04fa8a",
          "createdAt": "2026-11-06T04:08:06.222Z",
          "updatedAt": "2026-11-09T16:20:20.582Z"
        },
        {
          "id": "cmw4geqac00autcws4rbee2tk",
          "name": "[ 272 ] Thu & Nhân.JPG",
          "url": "/uploads/folders/tai-nguyen-8/-272-thu-nhan-1793938070056-9sjm.webp",
          "size": 327174,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyt000gtcws7jyvosfe",
          "aiContextChunk": {
            "tags": [
              "ảnh cưới",
              "lễ đính hôn",
              "áo dài cưới",
              "plusmoments",
              "phóng sự cưới"
            ],
            "colorMood": "Tone màu ấm áp, rực rỡ với sắc đỏ chủ đạo, ánh sáng studio tươi sáng và tự nhiên",
            "mainSubject": "Cô dâu chú rể trong nghi thức trao trang sức ngày cưới",
            "suggestedAlt": "Khoảnh khắc hạnh phúc cô dâu chú rể trong lễ đính hôn truyền thống",
            "suggestedCaption": "Nụ cười rạng rỡ ngày chung đôi, khởi đầu cho hành trình hạnh phúc viên mãn.",
            "visualDescription": "Khoảnh khắc ấm áp trong lễ đính hôn truyền thống. Cô dâu mặc áo dài đỏ rạng rỡ, đeo vòng cổ tiền mặt, đang cười hạnh phúc khi được người thân và chú rể đeo trang sức. Chú rể mặc vest đen lịch lãm, cài hoa hồng trắng. Bối cảnh trang trí hoa tươi rực rỡ tông đỏ và trắng, không khí gia đình sum vầy, tràn ngập niềm vui."
          },
          "uploadedById": null,
          "driveFileId": "1T660sglK_uzms-rFQmE9HcjV03LwwoVF",
          "md5Checksum": "9a6f0a813cbf0fe2aea15132b931c9dc",
          "createdAt": "2026-11-06T04:07:50.677Z",
          "updatedAt": "2026-11-09T16:20:20.582Z"
        },
        {
          "id": "cmw4gegdq00astcwsf0ur01md",
          "name": "[ 240 ] Thu & Nhân.JPG",
          "url": "/uploads/folders/tai-nguyen-8/-240-thu-nhan-1793938057240-3lds.webp",
          "size": 283244,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyt000gtcws7jyvosfe",
          "aiContextChunk": {
            "tags": [
              "ảnh cưới",
              "áo dài cưới",
              "lễ ăn hỏi",
              "hoa sen cầm tay",
              "plusmoments"
            ],
            "colorMood": "Tone màu rực rỡ, ấm áp, ánh sáng tự nhiên tập trung vào chủ thể",
            "mainSubject": "Cô dâu trong tà áo dài đỏ cầm bó hoa sen trắng trong lễ cưới truyền thống",
            "suggestedAlt": "Cô dâu áo dài đỏ cầm hoa sen trắng trong lễ cưới truyền thống Việt Nam",
            "suggestedCaption": "Khoảnh khắc thiêng liêng trong tà áo dài đỏ, gửi gắm trọn vẹn tình yêu và sự gắn kết.",
            "visualDescription": "Bức ảnh ghi lại khoảnh khắc trong lễ cưới truyền thống Việt Nam. Cô dâu mặc áo dài đỏ rực rỡ, đính ngọc trai tinh tế, tay cầm bó hoa sen trắng kết hợp hoa baby. Bên cạnh là người thân trong trang phục áo dài xanh lục họa tiết chìm sang trọng và chú rể mặc vest tối màu lịch lãm với hoa cài áo là hoa sen trắng. Các chi tiết trang sức vàng như vòng cổ và lắc tay của cô dâu tạo điểm nhấn quý phái."
          },
          "uploadedById": null,
          "driveFileId": "1_stnKeDi9CqB-nQbsU9103NTOZaw7TJ0",
          "md5Checksum": "ffc948a1c6cc5224ea0c74b95003901f",
          "createdAt": "2026-11-06T04:07:37.838Z",
          "updatedAt": "2026-11-09T16:20:20.583Z"
        },
        {
          "id": "cmw4ge7co00aqtcws7dgzsrc9",
          "name": "[ 237 ] Thu & Nhân.JPG",
          "url": "/uploads/folders/tai-nguyen-8/-237-thu-nhan-1793938045525-9e5a.webp",
          "size": 305994,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyt000gtcws7jyvosfe",
          "aiContextChunk": {
            "tags": [
              "ảnh cưới",
              "lễ đính hôn",
              "áo dài cưới",
              "PlusMoments",
              "khoảnh khắc gia đình"
            ],
            "colorMood": "Tone màu ấm áp, tươi sáng, làm nổi bật sắc đỏ truyền thống và không khí hân hoan của ngày cưới",
            "mainSubject": "Khoảnh khắc mẹ trao nhẫn cưới cho cô dâu trong lễ đính hôn truyền thống",
            "suggestedAlt": "Khoảnh khắc mẹ trao nhẫn cưới cho cô dâu trong lễ đính hôn truyền thống Việt Nam",
            "suggestedCaption": "Khoảnh khắc thiêng liêng khi tình yêu được kết nối bằng chiếc nhẫn cưới trao tay.",
            "visualDescription": "Bức ảnh ghi lại khoảnh khắc thiêng liêng trong lễ đính hôn truyền thống Việt Nam. Cô dâu mặc áo dài đỏ rực rỡ với trang sức vàng sang trọng, chú rể mặc vest đen lịch lãm. Người thân (mẹ cô dâu) đang ân cần trao nhẫn cho cô dâu. Bối cảnh được trang trí với hoa tươi màu đỏ và trắng, tạo không gian ấm cúng, hạnh phúc."
          },
          "uploadedById": null,
          "driveFileId": "1VhZyZ01jP2vroUvRdDW7dtYM9GMFKZu9",
          "md5Checksum": "05de9f7b27e2420f8a4d9bdec68f3f64",
          "createdAt": "2026-11-06T04:07:26.132Z",
          "updatedAt": "2026-11-09T16:20:20.584Z"
        },
        {
          "id": "cmw4gdxbc00aotcws5vlemtrs",
          "name": "[ 235 ] Thu & Nhân.JPG",
          "url": "/uploads/folders/tai-nguyen-8/-235-thu-nhan-1793938032516-rpij.webp",
          "size": 385460,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyt000gtcws7jyvosfe",
          "aiContextChunk": {
            "tags": [
              "ảnh cưới",
              "lễ đính hôn",
              "áo dài cưới",
              "PlusMoments",
              "khoảnh khắc gia đình"
            ],
            "colorMood": "Tone màu ấm áp, tươi sáng, mang đậm không khí hân hoan của ngày lễ cưới truyền thống Việt Nam",
            "mainSubject": "Khoảnh khắc cô dâu hôn má mẹ trong lễ đính hôn truyền thống",
            "suggestedAlt": "Khoảnh khắc cô dâu hôn má mẹ trong lễ đính hôn truyền thống tại PlusMoments",
            "suggestedCaption": "Khoảnh khắc yêu thương đong đầy trong ngày trọng đại. Chúc mừng hạnh phúc Tuyết Thu & Đình Nhân!",
            "visualDescription": "Bức ảnh ghi lại khoảnh khắc ấm áp trong lễ đính hôn truyền thống. Cô dâu mặc áo dài đỏ rực rỡ đang hôn lên má mẹ, tay cầm bó hoa cưới tone trắng tinh khôi. Chú rể mặc vest đen lịch lãm đứng cạnh, cùng bố mẹ hai bên trong không gian trang trí tiệc cưới với hoa tươi đỏ và trắng, phông nền tròn có tên cô dâu chú rể 'Tuyết Thu & Đình Nhân' cùng ngày tháng 13.07.2025."
          },
          "uploadedById": null,
          "driveFileId": "1DLWcWNjYrtXQrkd-7Em_2gbh2TwrCeSY",
          "md5Checksum": "1f6bd59d68617af32871e2ec454c1f0b",
          "createdAt": "2026-11-06T04:07:13.128Z",
          "updatedAt": "2026-11-09T16:20:20.584Z"
        },
        {
          "id": "cmw4gdm3n00amtcwstri0trtl",
          "name": "[ 229 ] Thu & Nhân.JPG",
          "url": "/uploads/folders/tai-nguyen-8/-229-thu-nhan-1793938018019-csz0.webp",
          "size": 203012,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyt000gtcws7jyvosfe",
          "aiContextChunk": {
            "tags": [
              "ảnh cưới",
              "lễ ăn hỏi",
              "áo dài cưới",
              "plusmoments",
              "phóng sự cưới"
            ],
            "colorMood": "Tone màu ấm áp, tươi sáng, mang đậm không khí hân hoan của ngày cưới truyền thống",
            "mainSubject": "Khoảnh khắc trao quà cưới trong lễ ăn hỏi truyền thống",
            "suggestedAlt": "Cô dâu chú rể trong lễ ăn hỏi truyền thống Việt Nam với áo dài đỏ",
            "suggestedCaption": "Khoảnh khắc trao gửi yêu thương, khởi đầu cho hành trình hạnh phúc viên mãn.",
            "visualDescription": "Bức ảnh ghi lại khoảnh khắc thiêng liêng trong lễ cưới truyền thống Việt Nam. Cô dâu mặc áo dài đỏ rực rỡ, đeo vòng cổ vàng sang trọng, đang được một người phụ nữ mặc áo dài xanh đeo vòng tay. Chú rể mặc vest đen lịch lãm, thắt cà vạt, cài hoa sen trắng trên ngực áo, ánh mắt trìu mến nhìn cô dâu. Bối cảnh trang trí hoa tươi rực rỡ phía sau tạo không gian ấm cúng, trang trọng."
          },
          "uploadedById": null,
          "driveFileId": "1iuSTfnNExH6br_LzcnAEe_wo2fLbPsia",
          "md5Checksum": "d5c598c41bcb516d722a6b5aa9e12e84",
          "createdAt": "2026-11-06T04:06:58.596Z",
          "updatedAt": "2026-11-09T16:20:20.585Z"
        },
        {
          "id": "cmw4gdaqm00aktcws26phhrpk",
          "name": "[ 224 ] Thu & Nhân.JPG",
          "url": "/uploads/folders/tai-nguyen-8/-224-thu-nhan-1793938003274-zxw2.webp",
          "size": 288210,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyt000gtcws7jyvosfe",
          "aiContextChunk": {
            "tags": [
              "ảnh cưới",
              "lễ đính hôn",
              "áo dài cưới",
              "PlusMoments",
              "phóng sự cưới"
            ],
            "colorMood": "Tone màu ấm áp, tươi sáng, mang đậm nét văn hóa truyền thống Việt Nam",
            "mainSubject": "Khoảnh khắc trao trang sức vàng cho cô dâu trong lễ đính hôn truyền thống",
            "suggestedAlt": "Cô dâu mặc áo dài đỏ trong lễ đính hôn truyền thống tại PlusMoments Wedding Studio",
            "suggestedCaption": "Khoảnh khắc hạnh phúc ngày chung đôi, trọn vẹn nét đẹp truyền thống Việt Nam.",
            "visualDescription": "Bức ảnh ghi lại khoảnh khắc ấm áp trong lễ đính hôn truyền thống Việt Nam. Cô dâu mặc áo dài đỏ rực rỡ, tay cầm bó hoa sen trắng tinh khôi, đang được người thân đeo trang sức vàng. Chú rể đứng cạnh mặc vest đen lịch lãm, ánh mắt trìu mến nhìn cô dâu. Bối cảnh được trang trí với hoa tươi tông đỏ và trắng, tạo nên không khí trang trọng, hạnh phúc."
          },
          "uploadedById": null,
          "driveFileId": "1j75VDBU6FYzb7UUI8s03k1xs-0-bAfYy",
          "md5Checksum": "e0e2ca56f60abfde467389c00a4501b7",
          "createdAt": "2026-11-06T04:06:43.870Z",
          "updatedAt": "2026-11-09T16:20:20.585Z"
        },
        {
          "id": "cmw4gd15u00aitcwssv5a3rxw",
          "name": "[ 222 ] Thu & Nhân.JPG",
          "url": "/uploads/folders/tai-nguyen-8/-222-thu-nhan-1793937990858-hk6j.webp",
          "size": 249550,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyt000gtcws7jyvosfe",
          "aiContextChunk": {
            "tags": [
              "lễ ăn hỏi",
              "đám cưới truyền thống",
              "áo dài",
              "plusmoments",
              "ảnh cưới gia đình"
            ],
            "colorMood": "Tone màu tự nhiên, ấm áp, ánh sáng trong trẻo của không gian tiệc cưới tại gia",
            "mainSubject": "Gia đình và cô dâu chú rể trong lễ ăn hỏi truyền thống",
            "suggestedAlt": "Khoảnh khắc gia đình trong lễ ăn hỏi truyền thống Việt Nam",
            "suggestedCaption": "Gói trọn khoảnh khắc sum vầy, ấm áp trong ngày vui trọng đại.",
            "visualDescription": "Một khoảnh khắc chân thực trong lễ ăn hỏi truyền thống Việt Nam. Các thành viên gia đình và khách mời đang ngồi quanh bàn tròn phủ khăn đỏ, trên bàn có bình hoa tươi, nước suối và bánh kẹo. Cô dâu mặc áo dài vàng nhạt, chú rể mặc sơ mi sáng màu, cả hai đều cài hoa hồng đỏ trước ngực. Bối cảnh diễn ra trong không gian nhà riêng với rèm trắng và cửa gỗ, không khí ấm cúng, trang trọng."
          },
          "uploadedById": null,
          "driveFileId": "1dG6rwmLFguR29NMlSEm371BbZK5cWsRR",
          "md5Checksum": "fe6b52a5275174713c3bb403bf960438",
          "createdAt": "2026-11-06T04:06:31.458Z",
          "updatedAt": "2026-11-09T16:20:20.586Z"
        },
        {
          "id": "cmw4gcp1s00agtcwsteruoyjr",
          "name": "[ 202 ] Thu & Nhân.JPG",
          "url": "/uploads/folders/tai-nguyen-8/-202-thu-nhan-1793937975181-nbfd.webp",
          "size": 225116,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyt000gtcws7jyvosfe",
          "aiContextChunk": {
            "tags": [
              "ảnh cưới",
              "lễ đính hôn",
              "áo dài đỏ",
              "PlusMoments",
              "phóng sự cưới"
            ],
            "colorMood": "Tone màu đỏ truyền thống ấm áp, ánh sáng tự nhiên kết hợp đèn studio tạo không gian trang trọng",
            "mainSubject": "Nghi thức trao nhẫn trong lễ đính hôn truyền thống với cô dâu chú rể trong trang phục áo dài đỏ",
            "suggestedAlt": "Nghi thức trao nhẫn lễ đính hôn truyền thống Việt Nam tại PlusMoments Wedding Studio",
            "suggestedCaption": "Khoảnh khắc thiêng liêng trong ngày trọng đại, nơi tình yêu bắt đầu hành trình mới.",
            "visualDescription": "Một góc nhìn từ phía sau đám đông khách mời hướng về phía cô dâu chú rể đang thực hiện nghi thức trao nhẫn trong lễ đính hôn truyền thống Việt Nam. Cô dâu mặc áo dài đỏ rực rỡ, chú rể mặc vest tối màu lịch lãm. Không gian được trang trí với tông màu đỏ chủ đạo, hoa tươi, mâm quả và các chi tiết mang đậm nét văn hóa Á Đông. Ánh sáng ấm áp tập trung vào cặp đôi, tạo nên bầu không khí trang trọng và ấm cúng."
          },
          "uploadedById": null,
          "driveFileId": "1nWQH-dbJxFDhK0GgGChkzKujl8gE4QXj",
          "md5Checksum": "167c5b9613aa5e79ac779df7bba3680e",
          "createdAt": "2026-11-06T04:06:15.761Z",
          "updatedAt": "2026-11-09T16:20:20.586Z"
        },
        {
          "id": "cmw4gcekc00aetcws108lva50",
          "name": "[ 195 ] Thu & Nhân.JPG",
          "url": "/uploads/folders/tai-nguyen-8/-195-thu-nhan-1793937961594-n0o8.webp",
          "size": 172250,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyt000gtcws7jyvosfe",
          "aiContextChunk": {
            "tags": [
              "ảnh cưới",
              "áo dài cưới",
              "cô dâu chú rể",
              "khoảnh khắc cưới",
              "plusmoments"
            ],
            "colorMood": "Tone màu ấm áp, ánh sáng tự nhiên dịu nhẹ, tập trung vào chi tiết và cảm xúc chân thực",
            "mainSubject": "Khoảnh khắc chú rể đeo bông tai vàng cho cô dâu trong trang phục áo dài cưới truyền thống",
            "suggestedAlt": "Chú rể đeo bông tai vàng cho cô dâu mặc áo dài đỏ trong ngày cưới",
            "suggestedCaption": "Khoảnh khắc dịu dàng, nơi tình yêu bắt đầu từ những cử chỉ nhỏ nhất.",
            "visualDescription": "Bức ảnh cận cảnh ghi lại khoảnh khắc chú rể đang ân cần đeo bông tai vàng cho cô dâu trong ngày cưới. Cô dâu mặc áo dài đỏ truyền thống, trang điểm nhẹ nhàng, tự nhiên với nụ cười rạng rỡ và ánh mắt hạnh phúc. Chú rể xuất hiện ở tiền cảnh với góc nhìn mờ (bokeh), tập trung sự chú ý vào đôi bàn tay đang chăm chút cho cô dâu. Chi tiết bông tai vàng hình hoa tinh xảo nổi bật trên nền áo dài đỏ, tạo nên không khí ấm áp và đầy tình cảm."
          },
          "uploadedById": null,
          "driveFileId": "1Q5rXBRTfL5hrJVg4r1DUzbYtsdlxvqcn",
          "md5Checksum": "d554d30504c036adad9f0ddee7fcb5c9",
          "createdAt": "2026-11-06T04:06:02.172Z",
          "updatedAt": "2026-11-09T16:20:20.587Z"
        },
        {
          "id": "cmw4gc32r00actcwsi3n6ith6",
          "name": "[ 193 ] Thu & Nhân.JPG",
          "url": "/uploads/folders/tai-nguyen-8/-193-thu-nhan-1793937946489-hcp4.webp",
          "size": 340126,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000gtcws7jyvosfe",
          "aiContextChunk": {
            "tags": [
              "ảnh cưới",
              "lễ ăn hỏi",
              "áo dài cưới",
              "plusmoments",
              "truyền thống"
            ],
            "colorMood": "Tone màu đỏ truyền thống ấm áp, ánh sáng tự nhiên rạng rỡ",
            "mainSubject": "Cô dâu áo dài đỏ nhận trang sức trong lễ ăn hỏi",
            "suggestedAlt": "Khoảnh khắc hạnh phúc cô dâu áo dài đỏ trong lễ ăn hỏi tại PlusMoments",
            "suggestedCaption": "Khoảnh khắc ngọt ngào và hạnh phúc trong ngày trọng đại.",
            "visualDescription": "Khoảnh khắc hạnh phúc trong lễ ăn hỏi truyền thống Việt Nam. Cô dâu mặc áo dài đỏ truyền thống đính hạt tinh tế, tay cầm bó hoa cưới sen trắng kết hợp hoa hồng và baby ngọt ngào. Chú rể mặc vest lịch lãm cùng người thân đang ân cần đeo hoa tai và trang sức chúc phúc cho cô dâu trong nụ cười rạng rỡ."
          },
          "uploadedById": null,
          "driveFileId": "1HF6OdYySDr5VH4UyWjkcti-TGCjC8-yC",
          "md5Checksum": "8dbc7d343e7ed895ff80ee6199756ac9",
          "createdAt": "2026-11-06T04:05:47.283Z",
          "updatedAt": "2026-11-09T16:20:20.587Z"
        },
        {
          "id": "cmw4gbti100aatcwse0i9agmj",
          "name": "[ 191 ] Thu & Nhân.JPG",
          "url": "/uploads/folders/tai-nguyen-8/-191-thu-nhan-1793937934282-nrey.webp",
          "size": 230930,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyt000gtcws7jyvosfe",
          "aiContextChunk": {
            "tags": [
              "ảnh cưới",
              "lễ cưới truyền thống",
              "khoảnh khắc đời thường",
              "gia đình",
              "plusmoments"
            ],
            "colorMood": "Màu sắc tươi sáng, chân thực, không khí ấm áp và tràn đầy năng lượng tích cực",
            "mainSubject": "Khoảnh khắc vui vẻ, tự nhiên của gia đình và bạn bè trong lễ cưới truyền thống",
            "suggestedAlt": "Khoảnh khắc vui vẻ của gia đình và bạn bè trong lễ cưới truyền thống tại Việt Nam",
            "suggestedCaption": "Những nụ cười rạng rỡ và khoảnh khắc đáng nhớ cùng người thân trong ngày trọng đại.",
            "visualDescription": "Một bức ảnh chụp khoảnh khắc đời thường trong lễ cưới tại Việt Nam. Nhóm khách mời và người thân đứng xếp hàng trong không gian nhà riêng, với một người đàn ông mặc sơ mi trắng thắt nơ đứng ở tiền cảnh bên phải đang che mặt cười ngượng ngùng. Phía sau là các phụ nữ mặc áo dài truyền thống màu hồng pastel và xanh ngọc, cùng các khách mời nam mặc trang phục lịch sự. Bối cảnh có cửa xếp kim loại đặc trưng của nhà phố Việt Nam, ánh sáng tự nhiên từ cửa chính tạo nên không khí vui vẻ, gần gũi."
          },
          "uploadedById": null,
          "driveFileId": "1nZ-ElcFEbTz_E8TbH6BP2QTfToPVSNv2",
          "md5Checksum": "946de0db330cff8d8035eac57f93fed4",
          "createdAt": "2026-11-06T04:05:34.873Z",
          "updatedAt": "2026-11-09T16:20:20.588Z"
        },
        {
          "id": "cmw4gbgeq00a8tcws4z1r3wwj",
          "name": "[ 178 ] Thu & Nhân.JPG",
          "url": "/uploads/folders/tai-nguyen-8/-178-thu-nhan-1793937917320-5tz1.webp",
          "size": 184310,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyt000gtcws7jyvosfe",
          "aiContextChunk": {
            "tags": [
              "ảnh cưới",
              "áo dài cưới",
              "lễ cưới truyền thống",
              "plusmoments",
              "cô dâu"
            ],
            "colorMood": "Tone màu ấm áp, ánh sáng tự nhiên dịu nhẹ, mang đậm nét truyền thống Việt Nam",
            "mainSubject": "Cô dâu trong tà áo dài đỏ truyền thống và khoảnh khắc xuất hiện trong lễ cưới",
            "suggestedAlt": "Cô dâu mặc áo dài đỏ truyền thống trong lễ cưới tại Việt Nam",
            "suggestedCaption": "Khoảnh khắc rạng rỡ của cô dâu trong ngày trọng đại, khởi đầu cho hành trình hạnh phúc.",
            "visualDescription": "Bức ảnh ghi lại khoảnh khắc cô dâu trong tà áo dài đỏ truyền thống, tay cầm quạt tròn thêu họa tiết, đang vén rèm bước ra cùng người thân. Cô dâu trang điểm nhẹ nhàng, tóc búi thấp cài hoa, nụ cười rạng rỡ. Phía trước là góc nhìn từ phía chú rể (lấy nét mờ) và một người đàn ông mặc vest đang ngồi. Bối cảnh trang trí lễ cưới với hoa tươi và rèm trắng, tạo không gian ấm cúng, trang trọng."
          },
          "uploadedById": null,
          "driveFileId": "1flhHXnDdR5zSHzMPvXCeKMQrL7czVx6c",
          "md5Checksum": "556a4bb217a5576bed5eb37a36534af7",
          "createdAt": "2026-11-06T04:05:17.907Z",
          "updatedAt": "2026-11-09T16:20:20.588Z"
        },
        {
          "id": "cmw4gb4eu00a6tcwsr7tu2hj5",
          "name": "[ 155 ] Thu & Nhân.JPG",
          "url": "/uploads/folders/tai-nguyen-8/-155-thu-nhan-1793937901432-yt9n.webp",
          "size": 939366,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000gtcws7jyvosfe",
          "aiContextChunk": {
            "tags": [
              "phù dâu",
              "áo dài cưới",
              "lễ Vu Quy",
              "trang trí tiệc cưới",
              "PlusMoments"
            ],
            "colorMood": "Tone màu tươi sáng, rực rỡ với sắc hồng pastel chủ đạo của trang phục đối lập với sắc đỏ truyền thống của không gian tiệc cưới",
            "mainSubject": "Nhóm phù dâu xinh xắn trong trang phục áo dài hồng pastel tại lễ Vu Quy",
            "suggestedAlt": "Nhóm phù dâu mặc áo dài hồng pastel xinh xắn trong lễ Vu Quy tại Việt Nam",
            "suggestedCaption": "Dàn phù dâu xinh xắn trong sắc hồng ngọt ngào, cùng chung vui ngày hạnh phúc của cô dâu chú rể.",
            "visualDescription": "Một nhóm 5 cô gái trẻ trong vai trò phù dâu đang tạo dáng vui vẻ tại một lễ Vu Quy. Các cô gái mặc áo dài cách tân màu hồng pastel nhẹ nhàng, phối cùng quần lụa trắng và cài tóc ngọc trai đồng bộ. Họ đang đứng và ngồi xung quanh một tấm bảng 'Save the Date' in ảnh cưới của cô dâu chú rể. Bối cảnh là không gian tiệc cưới ngoài trời với cổng hoa đỏ rực rỡ, phông màn đỏ truyền thống và thảm cỏ nhân tạo."
          },
          "uploadedById": null,
          "driveFileId": "1aKrA9big3qvOiFRuNRs8o-rEqSVTmfP9",
          "md5Checksum": "605bd11a56ef6aad180153cb84e99285",
          "createdAt": "2026-11-06T04:05:02.359Z",
          "updatedAt": "2026-11-09T16:20:20.589Z"
        },
        {
          "id": "cmw4garzw00a4tcwsf5uenjhy",
          "name": "[ 147 ] Thu & Nhân.JPG",
          "url": "/uploads/folders/tai-nguyen-8/-147-thu-nhan-1793937885658-cccn.webp",
          "size": 344700,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyt000gtcws7jyvosfe",
          "aiContextChunk": {
            "tags": [
              "lễ ăn hỏi",
              "bê tráp",
              "đội bê tráp",
              "phong tục cưới hỏi",
              "plusmoments"
            ],
            "colorMood": "Màu sắc tươi sáng, tự nhiên, làm nổi bật sắc đỏ của mâm quả và sự trang trọng của trang phục",
            "mainSubject": "Đội hình bê tráp nam trong lễ ăn hỏi với mâm quả rồng phượng truyền thống",
            "suggestedAlt": "Đội hình bê tráp nam mặc sơ mi trắng thắt nơ trong lễ ăn hỏi truyền thống",
            "suggestedCaption": "Đội hình bê tráp lịch lãm, sẵn sàng cho ngày vui trọng đại. Chúc mừng hạnh phúc đôi uyên ương!",
            "visualDescription": "Một hàng các chàng trai bê tráp trong lễ ăn hỏi truyền thống Việt Nam. Các nam thanh niên mặc sơ mi trắng, quần tây đen và thắt nơ lịch lãm, đang cầm trên tay các mâm quả cưới được trang trí cầu kỳ với hoa tươi, trái cây và hình tượng rồng phượng nghệ thuật. Bối cảnh là một con phố nhỏ, không khí tươi vui, rạng rỡ."
          },
          "uploadedById": null,
          "driveFileId": "1OeuJ6knLWP1yv7sAmLx4INQ8KtFtTqQs",
          "md5Checksum": "58a04d91a44f9dc58ecab1f48052df1a",
          "createdAt": "2026-11-06T04:04:46.269Z",
          "updatedAt": "2026-11-09T16:20:20.590Z"
        }
      ]
    },
    {
      "id": "cmw4etvyt000htcwslc2e5jvl",
      "name": "9",
      "slug": "tai-nguyen-9",
      "createdAt": "2026-11-06T03:23:38.646Z",
      "updatedAt": "2026-11-09T16:20:20.465Z",
      "files": [
        {
          "id": "cmw4h71fe00fqtcwsido2eqpc",
          "name": "[0060] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0060-hung-nhung-1793939390513-x6zc.webp",
          "size": 769912,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1xU_PWwFw4PQGvHsjsPw1-dtF3SzBs3db",
          "md5Checksum": "a9e452afe37fc2dd8caa08a7492e17df",
          "createdAt": "2026-11-06T04:29:51.483Z",
          "updatedAt": "2026-11-09T16:20:20.590Z"
        },
        {
          "id": "cmw4h6onu00fotcwsx7bg5wvk",
          "name": "[0059] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0059-hung-nhung-1793939373839-bwql.webp",
          "size": 1426794,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1bfAOtmEsaphvn_g_K97pqkWMFbbs-fFj",
          "md5Checksum": "3acb562ea911d0e44445eaef117b9065",
          "createdAt": "2026-11-06T04:29:34.938Z",
          "updatedAt": "2026-11-09T16:20:20.590Z"
        },
        {
          "id": "cmw4h6ahu00fmtcws512gnb6v",
          "name": "[0058] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0058-hung-nhung-1793939355472-t89j.webp",
          "size": 1530168,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1ODcQH-EqcyWYjFtJxE0lFdhP_VEkeKbP",
          "md5Checksum": "a1a3c7aef5d168c31a88119c5e4970ea",
          "createdAt": "2026-11-06T04:29:16.579Z",
          "updatedAt": "2026-11-09T16:20:20.591Z"
        },
        {
          "id": "cmw4h5ylj00fktcwsy4izxgep",
          "name": "[0057] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0057-hung-nhung-1793939340809-q33j.webp",
          "size": 50870,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1cF2VSmK2OfOP3g3Vse585vbUdSpnJeI4",
          "md5Checksum": "9167fc1457126b7033bd41a22113b8dd",
          "createdAt": "2026-11-06T04:29:01.159Z",
          "updatedAt": "2026-11-09T16:20:20.591Z"
        },
        {
          "id": "cmw4h5qrs00fitcws21qj1zb9",
          "name": "[0056] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0056-hung-nhung-1793939330139-oiis.webp",
          "size": 304828,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1eha3GEygOrrmr2iMbriE-8s5aI3jCWbX",
          "md5Checksum": "a7060eccab935020a0c180d34b45fe0a",
          "createdAt": "2026-11-06T04:28:51.016Z",
          "updatedAt": "2026-11-09T16:20:20.592Z"
        },
        {
          "id": "cmw4h5fzn00fgtcws430oy2hs",
          "name": "[0055] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0055-hung-nhung-1793939316160-vafr.webp",
          "size": 363036,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1dIND0kpIyYzYJyq77z46CUuTzWQojf8k",
          "md5Checksum": "5e51814efc47b7f7703be8c087c553a9",
          "createdAt": "2026-11-06T04:28:37.044Z",
          "updatedAt": "2026-11-09T16:20:20.592Z"
        },
        {
          "id": "cmw4h52fd00fetcwslrn8fa4y",
          "name": "[0054] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0054-hung-nhung-1793939298580-j64n.webp",
          "size": 372318,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1-O67ndYSHth6VCQF_a1mARvFHN2w_lWC",
          "md5Checksum": "d0c98c39de5a8e17d2db8c48146b6525",
          "createdAt": "2026-11-06T04:28:19.465Z",
          "updatedAt": "2026-11-09T16:20:20.592Z"
        },
        {
          "id": "cmw4h4q1a00fctcws8h4d4glf",
          "name": "[0053] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0053-hung-nhung-1793939282465-nl2m.webp",
          "size": 526742,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "17zlM6PXXhvWWYOcGFcpKPBiTC-9rxw9B",
          "md5Checksum": "b7fb38e340afcc3c4fc256273bbf43e7",
          "createdAt": "2026-11-06T04:28:03.406Z",
          "updatedAt": "2026-11-09T16:20:20.593Z"
        },
        {
          "id": "cmw4h4dr100fatcwsz3ov0s40",
          "name": "[0052] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0052-hung-nhung-1793939266577-bbwk.webp",
          "size": 368808,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1wNWWEH9E1JMo9mYE8kE_ZiaWn0R8MhFD",
          "md5Checksum": "894b9544424b5f48366b6685ccb1f028",
          "createdAt": "2026-11-06T04:27:47.480Z",
          "updatedAt": "2026-11-09T16:20:20.593Z"
        },
        {
          "id": "cmw4h43c300f8tcwsm599jx90",
          "name": "[0051] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0051-hung-nhung-1793939253108-yf2b.webp",
          "size": 233736,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1ME1VluXuA9-nWkNVI453lJ3u9aLcASXM",
          "md5Checksum": "32fa8663b98e23ad8d9956f90842e956",
          "createdAt": "2026-11-06T04:27:33.987Z",
          "updatedAt": "2026-11-09T16:20:20.593Z"
        },
        {
          "id": "cmw4h3qa000f6tcwsat0f2zg7",
          "name": "[0050] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0050-hung-nhung-1793939236157-md0v.webp",
          "size": 330794,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1qhJim4p8xJ31dN0ILz2wl7CWI7qpLLjc",
          "md5Checksum": "06533d4ffd3bbbb63228efcb2683f0bc",
          "createdAt": "2026-11-06T04:27:17.064Z",
          "updatedAt": "2026-11-09T16:20:20.594Z"
        },
        {
          "id": "cmw4h3ckq00f4tcwsr3reido4",
          "name": "[0049] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0049-hung-nhung-1793939218471-cwar.webp",
          "size": 226908,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1jL5f1YR-mThxEqnn1XtuFjjVZXziE_pK",
          "md5Checksum": "4559d4fdb79c8ea59c5ac7bc97311d1d",
          "createdAt": "2026-11-06T04:26:59.307Z",
          "updatedAt": "2026-11-09T16:20:20.594Z"
        },
        {
          "id": "cmw4h31em00f2tcwszjlwimx5",
          "name": "[0048] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0048-hung-nhung-1793939203906-dvj0.webp",
          "size": 306130,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1LbSFhFjmLhngtzapS6wg6u04Z884Csn0",
          "md5Checksum": "f7839f7f9cc57ceff2b8ea94e29f7f61",
          "createdAt": "2026-11-06T04:26:44.830Z",
          "updatedAt": "2026-11-09T16:20:20.594Z"
        },
        {
          "id": "cmw4h2q0600f0tcwslig5buv7",
          "name": "[0047] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0047-hung-nhung-1793939189089-mcir.webp",
          "size": 352696,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1AZRTZio2md5DoRFzhH6Y42xIInJsdg6G",
          "md5Checksum": "f09c256254bea7e52e1ae68c18d47053",
          "createdAt": "2026-11-06T04:26:30.054Z",
          "updatedAt": "2026-11-09T16:20:20.595Z"
        },
        {
          "id": "cmw4h2deq00eytcwszv6zh4yt",
          "name": "[0046] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0046-hung-nhung-1793939172864-sdqq.webp",
          "size": 288196,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1MGrN6LZZ512CIsFNH7BMBNJzTxGzz0c4",
          "md5Checksum": "812ebb91c03650ee41043326473ebe9f",
          "createdAt": "2026-11-06T04:26:13.731Z",
          "updatedAt": "2026-11-09T16:20:20.595Z"
        },
        {
          "id": "cmw4h22vo00ewtcws7zruludz",
          "name": "[0045] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0045-hung-nhung-1793939159153-sz67.webp",
          "size": 412946,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1Dw2zp9K-CESUu3zCnfvdNOKzIJORnlAY",
          "md5Checksum": "af246378712fe4c081c5c3bfebbd8342",
          "createdAt": "2026-11-06T04:26:00.085Z",
          "updatedAt": "2026-11-09T16:20:20.595Z"
        },
        {
          "id": "cmw4h1rih00eutcws4mjp5wuj",
          "name": "[0044] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0044-hung-nhung-1793939144440-47bm.webp",
          "size": 325440,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1QjkpgtjPxjPTvGzgKHTY17TR94NP9U5u",
          "md5Checksum": "427d8ffbff420282a861a2cb83e0567a",
          "createdAt": "2026-11-06T04:25:45.353Z",
          "updatedAt": "2026-11-09T16:20:20.596Z"
        },
        {
          "id": "cmw4h1gna00estcwsx0qx6d4o",
          "name": "[0043] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0043-hung-nhung-1793939130381-2wg3.webp",
          "size": 378218,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1ddxLKZeY9RZoRBcNTDM6pWJbuua5RQUW",
          "md5Checksum": "076357d44f963094a5c075bc016fdfb2",
          "createdAt": "2026-11-06T04:25:31.270Z",
          "updatedAt": "2026-11-09T16:20:20.596Z"
        },
        {
          "id": "cmw4h140z00eqtcwsysbcwa1l",
          "name": "[0042] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0042-hung-nhung-1793939114036-k7ca.webp",
          "size": 287668,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1LcUpD5m2d3v7_qcjenWcVshF1TVQvtVp",
          "md5Checksum": "d2f7026413336292a3fd77b21c9e36af",
          "createdAt": "2026-11-06T04:25:14.915Z",
          "updatedAt": "2026-11-09T16:20:20.597Z"
        },
        {
          "id": "cmw4h0s7t00eotcwsy7cfvxr3",
          "name": "[0041] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0041-hung-nhung-1793939098750-p9m8.webp",
          "size": 298540,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1lI_9KlS6PHfoqdfkFWcSThhYxxJmFrzu",
          "md5Checksum": "ed6de258988800313b1bb4923da85c85",
          "createdAt": "2026-11-06T04:24:59.609Z",
          "updatedAt": "2026-11-09T16:20:20.597Z"
        },
        {
          "id": "cmw4h0d3300emtcwszzd53lim",
          "name": "[0040] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0040-hung-nhung-1793939079191-z1b0.webp",
          "size": 152376,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1II8GmlxRJPQwBzd4VBE6A933rL3Pi8Nt",
          "md5Checksum": "a769e0ac9590f8d92dc9e785c8a4b907",
          "createdAt": "2026-11-06T04:24:39.999Z",
          "updatedAt": "2026-11-09T16:20:20.597Z"
        },
        {
          "id": "cmw4h031d00ektcwst0r7nu3d",
          "name": "[0039] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0039-hung-nhung-1793939066089-hq73.webp",
          "size": 432826,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "107y1vs8qiNd9NeeKLkSPXuxPWavlT01u",
          "md5Checksum": "69bc398dc32b76babc938e236cb79758",
          "createdAt": "2026-11-06T04:24:26.977Z",
          "updatedAt": "2026-11-09T16:20:20.598Z"
        },
        {
          "id": "cmw4gzpfp00eitcws6kmiyfn3",
          "name": "[0038] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0038-hung-nhung-1793939048515-lwhj.webp",
          "size": 275424,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1eCaY_xKtxS0IWOpuQyaOVvJuBTI2gHkG",
          "md5Checksum": "f2c105e6ba096d7f389ec2a5581262f5",
          "createdAt": "2026-11-06T04:24:09.349Z",
          "updatedAt": "2026-11-09T16:20:20.598Z"
        },
        {
          "id": "cmw4gzblt00egtcws9tx4hgch",
          "name": "[0037] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0037-hung-nhung-1793939030624-w4rz.webp",
          "size": 214216,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1sTV6m_ISCLCJrLOCObX5VzJMFoB_j3jo",
          "md5Checksum": "0aa3e299f0ea02e584b21f297c15fdfb",
          "createdAt": "2026-11-06T04:23:51.421Z",
          "updatedAt": "2026-11-09T16:20:20.598Z"
        },
        {
          "id": "cmw4gyx2100eetcwsunjup95t",
          "name": "[0036] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0036-hung-nhung-1793939011706-3zt8.webp",
          "size": 391818,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1wMru9MbrL3cNn0A-Ml97PkoQJBsq3-3o",
          "md5Checksum": "d7003aa7911443529ba5980cb0081bf6",
          "createdAt": "2026-11-06T04:23:32.569Z",
          "updatedAt": "2026-11-09T16:20:20.599Z"
        },
        {
          "id": "cmw4gymz900ectcwsvkz0njph",
          "name": "[0035] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0035-hung-nhung-1793938998549-48oh.webp",
          "size": 915508,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1JDLQrd9255LevbvzupDlouGRFPFrVM1D",
          "md5Checksum": "906bba73fc4d541c3f0cec033eb5115a",
          "createdAt": "2026-11-06T04:23:19.509Z",
          "updatedAt": "2026-11-09T16:20:20.599Z"
        },
        {
          "id": "cmw4gy8zp00eatcwsywb4ytqd",
          "name": "[0034] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0034-hung-nhung-1793938980433-r3vr.webp",
          "size": 624444,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1kpSbnYUtr2pkHqr50O5JQMGkX4HzQ5mD",
          "md5Checksum": "8b3b5f78b0386fad40a673421288859f",
          "createdAt": "2026-11-06T04:23:01.381Z",
          "updatedAt": "2026-11-09T16:20:20.599Z"
        },
        {
          "id": "cmw4gxxin00e8tcwshiqsxamm",
          "name": "[0033] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0033-hung-nhung-1793938965826-pqd5.webp",
          "size": 313318,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1sd1VH6IlV7BeDLf1S5eL74MWp7YizMfq",
          "md5Checksum": "17058066f74234caf84e5387abeb6223",
          "createdAt": "2026-11-06T04:22:46.507Z",
          "updatedAt": "2026-11-09T16:20:20.600Z"
        },
        {
          "id": "cmw4gxlje00e6tcwspi4ebmzl",
          "name": "[0032] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0032-hung-nhung-1793938950403-h8mw.webp",
          "size": 108060,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1Q2Iz0DLUfQF1HxRSsGnqskeqIwC1BSIL",
          "md5Checksum": "75d34ba0e764a80d45d4d03b7f9c7e28",
          "createdAt": "2026-11-06T04:22:30.987Z",
          "updatedAt": "2026-11-09T16:20:20.600Z"
        },
        {
          "id": "cmw4gx8kn00e4tcwsgox9ikoi",
          "name": "[0031] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0031-hung-nhung-1793938933342-kio2.webp",
          "size": 524482,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1pTtVdQyH_KcZ8YCQL1zzxEHjp6zqM-Ut",
          "md5Checksum": "dd24ac864bdb684c43bf7c52bf70191e",
          "createdAt": "2026-11-06T04:22:14.183Z",
          "updatedAt": "2026-11-09T16:20:20.600Z"
        },
        {
          "id": "cmw4gwy8x00e2tcwsiltmxndn",
          "name": "[0030] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0030-hung-nhung-1793938919962-q4p4.webp",
          "size": 386248,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1fdbswC-vu1bAAPlpRtd97oKrPlFQucGb",
          "md5Checksum": "1d893db0c0bea5bce49f5962574a3a17",
          "createdAt": "2026-11-06T04:22:00.802Z",
          "updatedAt": "2026-11-09T16:20:20.601Z"
        },
        {
          "id": "cmw4gwnfd00e0tcws7yttim0w",
          "name": "[0029] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0029-hung-nhung-1793938906042-doqy.webp",
          "size": 77486,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1xNr8NBf_Saqagm42KLHUeWDvUvJX-I0J",
          "md5Checksum": "52aec82d026d0cf6b09f07ee7408f4bb",
          "createdAt": "2026-11-06T04:21:46.777Z",
          "updatedAt": "2026-11-09T16:20:20.601Z"
        },
        {
          "id": "cmw4gwbbd00dytcws4qm45x25",
          "name": "[0028] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0028-hung-nhung-1793938890320-vali.webp",
          "size": 161344,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1GmiTOz3Pi8If30JRRsZhzGz837fRm-Rm",
          "md5Checksum": "e165c15f5687e1776b2241eeb089ff2a",
          "createdAt": "2026-11-06T04:21:31.081Z",
          "updatedAt": "2026-11-09T16:20:20.601Z"
        },
        {
          "id": "cmw4gw0xc00dwtcwsqkx7p3yz",
          "name": "[0027] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0027-hung-nhung-1793938876811-c8d4.webp",
          "size": 366980,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1WrlGIwPCMYKd_Ez8jCzTqx8vykki-ENk",
          "md5Checksum": "66b476ba8f37f0d380bca80350d4a9f9",
          "createdAt": "2026-11-06T04:21:17.617Z",
          "updatedAt": "2026-11-09T16:20:20.602Z"
        },
        {
          "id": "cmw4gvpmr00dutcwszcwookds",
          "name": "[0026] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0026-hung-nhung-1793938862086-wb8g.webp",
          "size": 493536,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1naQmoXJptBz0HFB2VC4ykqqjwhcCER54",
          "md5Checksum": "1500417f88a0dcc4f0945b0f4ad5adc4",
          "createdAt": "2026-11-06T04:21:02.979Z",
          "updatedAt": "2026-11-09T16:20:20.602Z"
        },
        {
          "id": "cmw4gvfc900dstcwsjat8lfdr",
          "name": "[0025] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0025-hung-nhung-1793938848887-ncn5.webp",
          "size": 169582,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1L4yDHl_T64GtUC0aTJ-So_b-G-wprkhf",
          "md5Checksum": "35eec4654f4ddb2bcf4adbb30cb5fb9d",
          "createdAt": "2026-11-06T04:20:49.642Z",
          "updatedAt": "2026-11-09T16:20:20.603Z"
        },
        {
          "id": "cmw4gv5b900dqtcwsdggdokmg",
          "name": "[0024] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0024-hung-nhung-1793938835822-hfgq.webp",
          "size": 266166,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1JPcNAc4O76wAvtaZf8Gs8HOzZVydjP9k",
          "md5Checksum": "abc71b75ed0b593bddbbeccde48f858e",
          "createdAt": "2026-11-06T04:20:36.645Z",
          "updatedAt": "2026-11-09T16:20:20.603Z"
        },
        {
          "id": "cmw4gurzp00dotcwstuovwhnr",
          "name": "[0023] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0023-hung-nhung-1793938818569-xi87.webp",
          "size": 401166,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1KWEouDnqWXRLqDFpjcAiFp2-3PcfcvNY",
          "md5Checksum": "e03404fe35673b91cd2c75184d869148",
          "createdAt": "2026-11-06T04:20:19.381Z",
          "updatedAt": "2026-11-09T16:20:20.603Z"
        },
        {
          "id": "cmw4guiig00dmtcwsgt96h892",
          "name": "[0022] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0022-hung-nhung-1793938806313-ci2f.webp",
          "size": 293084,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1U56cfFCRon2vibegzbflqgCcPHQSqNYJ",
          "md5Checksum": "509fe7163901e71c3ba3b21d5d5be1d5",
          "createdAt": "2026-11-06T04:20:07.097Z",
          "updatedAt": "2026-11-09T16:20:20.604Z"
        },
        {
          "id": "cmw4gu6uz00dktcwsrsc36s7o",
          "name": "[0021] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0021-hung-nhung-1793938791244-f1xe.webp",
          "size": 245148,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1TEaSkwZxKV8L8GUAhIXUPbfq4B1bOwdd",
          "md5Checksum": "6bd69fa6d7b32fb09c2cbd04e58a2fad",
          "createdAt": "2026-11-06T04:19:51.995Z",
          "updatedAt": "2026-11-09T16:20:20.604Z"
        },
        {
          "id": "cmw4gtwh100ditcwsrlsenx4y",
          "name": "[0020] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0020-hung-nhung-1793938777702-a7g3.webp",
          "size": 396588,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1ooJ9r6hg_qYohBAsquIY7npbnV5h11zJ",
          "md5Checksum": "2883556846817db6d93614d00ce95f84",
          "createdAt": "2026-11-06T04:19:38.533Z",
          "updatedAt": "2026-11-09T16:20:20.604Z"
        },
        {
          "id": "cmw4gtns100dgtcws0xc2r568",
          "name": "[0019] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0019-hung-nhung-1793938766658-j5h2.webp",
          "size": 234952,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1FA-OL-lRx2ZA_6j03NvGlL3PYAbLrHj-",
          "md5Checksum": "f42c860a46cab8545ace730e8e9dbe5b",
          "createdAt": "2026-11-06T04:19:27.265Z",
          "updatedAt": "2026-11-09T16:20:20.605Z"
        },
        {
          "id": "cmw4gtd9p00detcwswums4mux",
          "name": "[0018] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0018-hung-nhung-1793938752779-fwjp.webp",
          "size": 254758,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1QSy_EueqDj7I-Uli2Ro2VDr2hc6MhA2B",
          "md5Checksum": "fa12155cf6cb1effbcec8555e433e013",
          "createdAt": "2026-11-06T04:19:13.645Z",
          "updatedAt": "2026-11-09T16:20:20.605Z"
        },
        {
          "id": "cmw4gt2kl00dctcws5fifnxhr",
          "name": "[0017] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0017-hung-nhung-1793938738911-j950.webp",
          "size": 223616,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1uqlQd3ZAHcrHyYbwS0vyMixfBasxncNi",
          "md5Checksum": "9eb0e08578ddf1de277347dfadfbf4ca",
          "createdAt": "2026-11-06T04:18:59.781Z",
          "updatedAt": "2026-11-09T16:20:20.605Z"
        },
        {
          "id": "cmw4gspwi00datcws77h8f9kr",
          "name": "[0016] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0016-hung-nhung-1793938722533-ffnm.webp",
          "size": 299852,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1z2H5KauaHYUC0rRO23LNT5fOqjnOu4FL",
          "md5Checksum": "735aa8c69fceaf8125fe4356e4468b85",
          "createdAt": "2026-11-06T04:18:43.363Z",
          "updatedAt": "2026-11-09T16:20:20.606Z"
        },
        {
          "id": "cmw4gsg8600d8tcwsxeigqmga",
          "name": "[0015] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0015-hung-nhung-1793938710026-5p8b.webp",
          "size": 178306,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1a8dHTF6O9cG4NPrYhbU2o2C8UXy7u2D4",
          "md5Checksum": "8337e7c20dd0ec309d3c95da1a5cb612",
          "createdAt": "2026-11-06T04:18:30.822Z",
          "updatedAt": "2026-11-09T16:20:20.606Z"
        },
        {
          "id": "cmw4gs43k00d6tcws8ch45hpp",
          "name": "[0014] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0014-hung-nhung-1793938694302-epll.webp",
          "size": 188146,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1QpqfPnGs2Bm0K9nsmVcybF4y-dQVpgGW",
          "md5Checksum": "3f19ba34ad1c3c107bf6d6073556d3f3",
          "createdAt": "2026-11-06T04:18:15.104Z",
          "updatedAt": "2026-11-09T16:20:20.606Z"
        },
        {
          "id": "cmw4grtgl00d4tcws82ajlvo4",
          "name": "[0013] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0013-hung-nhung-1793938680524-6w3j.webp",
          "size": 177834,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1kqKu3BPlcotn7S-rQ-Q-6DLcMXp-BA_N",
          "md5Checksum": "651f02ca1937de5d66bce870e52ace6c",
          "createdAt": "2026-11-06T04:18:01.317Z",
          "updatedAt": "2026-11-09T16:20:20.607Z"
        },
        {
          "id": "cmw4grhjq00d2tcwsewbgg2xc",
          "name": "[0012] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0012-hung-nhung-1793938665008-zuij.webp",
          "size": 436216,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1Py4M2sodGrElg5FaYIbUkiTARMCEbfBS",
          "md5Checksum": "e86ef494a9a996401c208140598b2f02",
          "createdAt": "2026-11-06T04:17:45.879Z",
          "updatedAt": "2026-11-09T16:20:20.607Z"
        },
        {
          "id": "cmw4gr4mj00d0tcwsxud8bor1",
          "name": "[0011] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0011-hung-nhung-1793938648360-74kz.webp",
          "size": 191464,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1NwU68D52j3DutCGYFnxJrcPUD1MxY87B",
          "md5Checksum": "37ebe51db4cc363e8bffb54c9f1bc667",
          "createdAt": "2026-11-06T04:17:29.131Z",
          "updatedAt": "2026-11-09T16:20:20.608Z"
        },
        {
          "id": "cmw4gquyy00cytcws5uns00ie",
          "name": "[0010] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0010-hung-nhung-1793938635833-bt46.webp",
          "size": 194210,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1d1VUK1zZGq3SEgCn1qDSLW8lU4Y9KbxS",
          "md5Checksum": "e308c3c1f7484ea6a5526bb5e669378c",
          "createdAt": "2026-11-06T04:17:16.618Z",
          "updatedAt": "2026-11-09T16:20:20.608Z"
        },
        {
          "id": "cmw4gqkda00cwtcwstnyotcof",
          "name": "[0009] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0009-hung-nhung-1793938621807-kojh.webp",
          "size": 1464048,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "107cc38DqzmOaJQ8LK7cj-nV4YN-eC9oz",
          "md5Checksum": "7d67dc48ac5a8e559311f5b0fc56bcdc",
          "createdAt": "2026-11-06T04:17:02.878Z",
          "updatedAt": "2026-11-09T16:20:20.608Z"
        },
        {
          "id": "cmw4gq5se00cutcws0soey12q",
          "name": "[0008] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0008-hung-nhung-1793938603088-8p79.webp",
          "size": 493774,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1oAxmrfrrGHtyQNRJiBTCL3Co9a90cClQ",
          "md5Checksum": "1e97f886b45c19f3684bf8624b19a5ce",
          "createdAt": "2026-11-06T04:16:43.983Z",
          "updatedAt": "2026-11-09T16:20:20.609Z"
        },
        {
          "id": "cmw4gpsi300cstcwsg0bz6yxy",
          "name": "[0007] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0007-hung-nhung-1793938585718-afdu.webp",
          "size": 1224800,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1kJTAGn3liH3yfI8x-aXdydrgcwELEgIX",
          "md5Checksum": "614a5362a38a3d088a99d0ac1f57e5f3",
          "createdAt": "2026-11-06T04:16:26.763Z",
          "updatedAt": "2026-11-09T16:20:20.609Z"
        },
        {
          "id": "cmw4gpe7p00cqtcws6uadpukz",
          "name": "[0006] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0006-hung-nhung-1793938567344-5bci.webp",
          "size": 441766,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1iBdo9l2ws-2MIFrVUMOYNvCtsz1EpLpQ",
          "md5Checksum": "6864b59d26ca4d3b3bb15dd534dc493e",
          "createdAt": "2026-11-06T04:16:08.245Z",
          "updatedAt": "2026-11-09T16:20:20.609Z"
        },
        {
          "id": "cmw4gp2ge00cotcwsdsjx6mgl",
          "name": "[0005] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0005-hung-nhung-1793938552120-bejp.webp",
          "size": 387844,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1ESN9RxRy5Tn5vYwVczGl2orbJ63SuE0Q",
          "md5Checksum": "6defe03cba312340ec4f1e1d347409ef",
          "createdAt": "2026-11-06T04:15:53.006Z",
          "updatedAt": "2026-11-09T16:20:20.610Z"
        },
        {
          "id": "cmw4gonhx00cmtcwsy18m3iw9",
          "name": "[0004] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0004-hung-nhung-1793938532707-iuue.webp",
          "size": 483278,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1mfBp1jXbqw2NlBfT0fVQOO7VOAPG-zQu",
          "md5Checksum": "58271a3943d908ba41b2ce97ead2b170",
          "createdAt": "2026-11-06T04:15:33.621Z",
          "updatedAt": "2026-11-09T16:20:20.610Z"
        },
        {
          "id": "cmw4goaf300cktcwsrk6sgjjq",
          "name": "[0003] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0003-hung-nhung-1793938515835-9ou7.webp",
          "size": 322788,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1ZZ7v5IzfasFfpy9PN7DpDQkNT95w-YJ6",
          "md5Checksum": "ec137bfd5ac5d5ecb8be3beba0dbbc98",
          "createdAt": "2026-11-06T04:15:16.672Z",
          "updatedAt": "2026-11-09T16:20:20.610Z"
        },
        {
          "id": "cmw4gnxpp00citcws0xu4prdk",
          "name": "[0002] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0002-hung-nhung-1793938499585-waxn.webp",
          "size": 321556,
          "format": "WEBP",
          "width": 2560,
          "height": 3840,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1uhcnNvXWtz7JpytPQdX3WErEYIVSt4xA",
          "md5Checksum": "c18105a4c9e3701a5679f101e0693fd1",
          "createdAt": "2026-11-06T04:15:00.205Z",
          "updatedAt": "2026-11-09T16:20:20.611Z"
        },
        {
          "id": "cmw4gnnj800cgtcwsgskumx1i",
          "name": "[0001] Hùng & Nhung.JPG",
          "url": "/uploads/folders/tai-nguyen-9/-0001-hung-nhung-1793938486426-bq0n.webp",
          "size": 60174,
          "format": "WEBP",
          "width": 2560,
          "height": 1707,
          "folderId": "cmw4etvyt000htcwslc2e5jvl",
          "aiContextChunk": null,
          "uploadedById": null,
          "driveFileId": "1aWzgHNv_Xs1hTqwT_niAx_z1QuNMdEva",
          "md5Checksum": "09c3e9591a30405f9f119fcc56d52cfc",
          "createdAt": "2026-11-06T04:14:47.013Z",
          "updatedAt": "2026-11-09T16:20:20.611Z"
        }
      ]
    }
  ],
  "mediaFile": [],
  "testimonial": [],
  "albumConcept": [
    {
      "id": "cmw4lpmu60000f3yrzoj7mmyv",
      "name": "Outdoor Luxury (Ngoại cảnh cao cấp)",
      "slug": "outdoor-luxury",
      "order": 1,
      "createdAt": "2026-11-06T06:36:17.502Z"
    },
    {
      "id": "cmw4lpmu80001f3yrcl43jgk8",
      "name": "Studio Editorial (Tạp chí Vogue/Hàn Quốc)",
      "slug": "studio-editorial",
      "order": 2,
      "createdAt": "2026-11-06T06:36:17.504Z"
    },
    {
      "id": "cmw4lpmu80002f3yrsgw04u8a",
      "name": "Pre-Wedding Cinematic (Điện ảnh biển/đồi)",
      "slug": "pre-wedding-cinematic",
      "order": 3,
      "createdAt": "2026-11-06T06:36:17.505Z"
    },
    {
      "id": "cmw4lpmu80003f3yruo4v52rg",
      "name": "Phóng Sự Cưới (Wedding Ceremony)",
      "slug": "phong-su-cuoi",
      "order": 4,
      "createdAt": "2026-11-06T06:36:17.505Z"
    }
  ],
  "blogCategory": [
    {
      "id": "cmw4lpp5e0004f3yrxlfhe8sx",
      "name": "Cẩm nang cưới",
      "slug": "cam-nang-cuoi",
      "order": 1,
      "createdAt": "2026-11-06T06:36:20.499Z"
    },
    {
      "id": "cmw4lpp5f0005f3yr7bbj4pp0",
      "name": "Kinh nghiệm chụp ảnh",
      "slug": "kinh-nghiem-chup-anh",
      "order": 2,
      "createdAt": "2026-11-06T06:36:20.500Z"
    },
    {
      "id": "cmw4lpp5f0006f3yrxpcqh570",
      "name": "Xu hướng váy cưới",
      "slug": "xu-huong-vay-cuoi",
      "order": 3,
      "createdAt": "2026-11-06T06:36:20.500Z"
    },
    {
      "id": "cmw4lpp5g0007f3yreuybc3xj",
      "name": "Địa điểm chụp đẹp",
      "slug": "dia-diem-chup-dep",
      "order": 4,
      "createdAt": "2026-11-06T06:36:20.500Z"
    }
  ],
  "serviceCategory": [
    {
      "id": "cmw7dvl0f0000ggdn1iixm0d1",
      "name": "Ngoại Cảnh Pre-Wedding",
      "slug": "pre-wedding",
      "order": 1,
      "createdAt": "2026-11-08T05:20:16.671Z"
    },
    {
      "id": "cmw7dvl0g0001ggdntaiyw5bs",
      "name": "Studio Editorial Hàn Quốc",
      "slug": "studio-concept",
      "order": 2,
      "createdAt": "2026-11-08T05:20:16.673Z"
    },
    {
      "id": "cmw7dvl0h0002ggdnhcwqp03f",
      "name": "Phóng Sự Cưới (Wedding Day)",
      "slug": "wedding-day",
      "order": 3,
      "createdAt": "2026-11-08T05:20:16.673Z"
    }
  ],
  "leadBooking": [],
  "order": [
    {
      "id": "cmw90vjd5000xah7xbkm0tun0",
      "orderCode": "PM94550",
      "customerName": "Trung",
      "customerEmail": "gnurt169@gmai.com",
      "customerPhone": "0903768871",
      "packageId": "cmw7eel8y00019m43k5s86wev",
      "packageName": "Cơ bản",
      "amount": 1000000000,
      "status": "PENDING",
      "paymentMethod": "VIETQR",
      "transactionId": null,
      "paidAt": null,
      "notes": null,
      "createdAt": "2026-11-09T08:51:51.882Z",
      "updatedAt": "2026-11-09T16:20:20.612Z"
    },
    {
      "id": "cmw7wqsn20003sdfwdgc1vg65",
      "orderCode": "PM49899",
      "customerName": "Lê Nguyễn Minh Trung",
      "customerEmail": "gnurt169@icloud.com",
      "customerPhone": "0903768871",
      "packageId": "cmw7eel8y00019m43k5s86wev",
      "packageName": "Cơ bản",
      "amount": 1000000000,
      "status": "PENDING",
      "paymentMethod": "VIETQR",
      "transactionId": null,
      "paidAt": null,
      "notes": null,
      "createdAt": "2026-11-08T14:08:25.983Z",
      "updatedAt": "2026-11-09T16:20:20.613Z"
    },
    {
      "id": "cmw7wn0mi0001sdfwdxyl0zjn",
      "orderCode": "PM63929",
      "customerName": "Lê Nguyễn Minh Trung",
      "customerEmail": "gnurt169@icloud.com",
      "customerPhone": "0903768871",
      "packageId": null,
      "packageName": "Gói Gold Luxury Pre-Wedding",
      "amount": 25000000,
      "status": "PAID",
      "paymentMethod": "VIETQR",
      "transactionId": "MBVCB12345678",
      "paidAt": "2026-11-08T14:05:42.351Z",
      "notes": "Kiểm tra không gửi mail sớm trước khi chuyển khoản",
      "createdAt": "2026-11-08T14:05:29.707Z",
      "updatedAt": "2026-11-09T16:20:20.613Z"
    },
    {
      "id": "cmw7wbyns0001xcc059nue1su",
      "orderCode": "PM42482",
      "customerName": "minh trung",
      "customerEmail": "gnurt169@icloud.com",
      "customerPhone": "0903768871",
      "packageId": "cmw7eel8y00019m43k5s86wev",
      "packageName": "Cơ bản",
      "amount": 1000000000,
      "status": "PENDING",
      "paymentMethod": "VIETQR",
      "transactionId": null,
      "paidAt": null,
      "notes": null,
      "createdAt": "2026-11-08T13:56:53.944Z",
      "updatedAt": "2026-11-09T16:20:20.614Z"
    },
    {
      "id": "cmw7w0rw80001ugm1731n4dk6",
      "orderCode": "PM17587",
      "customerName": "Lê Nguyễn Minh Trung",
      "customerEmail": "gnurt169@icloud.com",
      "customerPhone": "0903768871",
      "packageId": null,
      "packageName": "Gói Silver Classic Luxury",
      "amount": 18000000,
      "status": "PENDING",
      "paymentMethod": "VIETQR",
      "transactionId": null,
      "paidAt": null,
      "notes": "Ngày dự kiến: 12/2026 | Muốn chụp ngoại cảnh Đà Lạt bối cảnh hoàng hôn",
      "createdAt": "2026-11-08T13:48:11.961Z",
      "updatedAt": "2026-11-09T16:20:20.614Z"
    }
  ]
};

async function main() {
  console.log('--- KHỞI TẠO DỮ LIỆU GỐC TỪ SEED MOCKUP ---');
  console.log('Thời gian xuất snapshot:', snapshot.exportedAt);

  // =========================================================================
  // BƯỚC 1: KHỞI TẠO TÀI KHOẢN ADMIN/USER ĐẦU TIÊN (ĐẢM BẢO KHÓA NGOẠI)
  // =========================================================================
  const defaultPasswordHash = snapshot.superAdminPasswordHash || '$2b$12$pdyWDpxT2yfoUqgFptpJnO2dTb2r5Icy8mQCUNrbjfVGgRE/R9tEC';
  const validAdminUserIds = new Set();

  // 1.1 Khởi tạo toàn bộ AdminUser từ snapshot
  if (Array.isArray(snapshot.adminUser)) {
    for (const u of (snapshot.adminUser)) {
      const { createdAt, updatedAt, lastLoginAt, albums, posts, mediaFiles, ...userData } = u;
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
    for (const item of (snapshot.systemSetting)) {
      const { createdAt, updatedAt, ...data } = item;
      await prisma.systemSetting.upsert({
        where: { id: item.id },
        update: data,
        create: data,
      });
    }
    console.log('✓ SystemSetting: ' + snapshot.systemSetting.length + ' bản ghi');
  }

  if (Array.isArray(snapshot.homePageConfig)) {
    for (const item of (snapshot.homePageConfig)) {
      const { createdAt, updatedAt, ...data } = item;
      await prisma.homePageConfig.upsert({
        where: { id: item.id },
        update: data,
        create: data,
      });
    }
    console.log('✓ HomePageConfig: ' + snapshot.homePageConfig.length + ' bản ghi');
  }

  if (Array.isArray(snapshot.notificationSetting)) {
    for (const item of (snapshot.notificationSetting)) {
      const { createdAt, updatedAt, ...data } = item;
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
    for (const item of (snapshot.studioLocation)) {
      const { createdAt, updatedAt, ...data } = item;
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
    for (const item of (snapshot.serviceCategory)) {
      const { createdAt, ...data } = item;
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
    for (const item of (snapshot.albumConcept)) {
      const { createdAt, ...data } = item;
      await prisma.albumConcept.upsert({
        where: { id: item.id },
        update: data,
        create: data,
      });
    }
    console.log('✓ AlbumConcept: ' + snapshot.albumConcept.length + ' bản ghi');
  }

  if (Array.isArray(snapshot.blogCategory)) {
    for (const item of (snapshot.blogCategory)) {
      const { createdAt, ...data } = item;
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
    for (const item of (snapshot.servicePackage)) {
      const { createdAt, updatedAt, albums, blogPosts, orders, categoryId, ...data } = item;
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
    for (const item of (snapshot.mediaFolder)) {
      const { createdAt, updatedAt, files, ...folderData } = item;
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
    for (const item of (snapshot.album)) {
      const { createdAt, updatedAt, media, package: pkgRel, createdBy: userRel, testimonials, ...albumData } = item;
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
        for (const m of (media)) {
          const { createdAt, updatedAt, album: albRel, ...mdata } = m;
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
    for (const item of (snapshot.blogPost)) {
      const { createdAt, updatedAt, images, package: pkgRel, authorUser: userRel, ...blogData } = item;
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
        for (const img of (images)) {
          const { createdAt, updatedAt, post: postRel, ...imgData } = img;
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
    for (const item of (snapshot.mediaFolder)) {
      if (Array.isArray((item).files)) {
        for (const f of ((item).files)) {
          const { createdAt, updatedAt, folder: foldRel, uploadedBy: userRel, ...fileData } = f;
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
    for (const f of (snapshot.mediaFile)) {
      const { createdAt, updatedAt, ...fileData } = f;
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
    for (const item of (snapshot.testimonial)) {
      const { createdAt, updatedAt, ...testData } = item;
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
    for (const item of (snapshot.leadBooking)) {
      const { createdAt, updatedAt, package: pkgRel, ...data } = item;
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
    for (const item of (snapshot.order)) {
      const { createdAt, updatedAt, paidAt, package: pkgRel, ...data } = item;
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
