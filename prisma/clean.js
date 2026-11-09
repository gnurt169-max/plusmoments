const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('--- ĐANG TIẾN HÀNH XÓA DỮ LIỆU MOCKUP ---');

  // Xóa theo thứ tự quan hệ bảng con trước, bảng cha sau
  await prisma.postImage.deleteMany({}).catch((e) => console.warn('PostImage delete error:', e.message));
  await prisma.blogPost.deleteMany({}).catch((e) => console.warn('BlogPost delete error:', e.message));
  await prisma.albumMedia.deleteMany({}).catch((e) => console.warn('AlbumMedia delete error:', e.message));
  await prisma.album.deleteMany({}).catch((e) => console.warn('Album delete error:', e.message));
  await prisma.servicePackage.deleteMany({}).catch((e) => console.warn('ServicePackage delete error:', e.message));
  if (prisma.package) {
    await prisma.package.deleteMany({}).catch(() => {});
  }
  await prisma.testimonial.deleteMany({}).catch((e) => console.warn('Testimonial delete error:', e.message));
  await prisma.mediaFile.deleteMany({}).catch((e) => console.warn('MediaFile delete error:', e.message));
  await prisma.mediaFolder.deleteMany({}).catch((e) => console.warn('MediaFolder delete error:', e.message));
  await prisma.leadBooking.deleteMany({}).catch(() => {});

  // Đối với SystemSetting / SiteConfig: Không xóa hẳn mà reset về giá trị mặc định sạch
  await prisma.systemSetting.deleteMany({}).catch(() => {});
  await prisma.systemSetting.create({
    data: {
      id: 'default',
      siteName: 'PlusMoments Wedding Studio',
      tagline: 'Lưu giữ khoảnh khắc thanh xuân và tình yêu vĩnh cửu',
      defaultMetaTitle: 'PlusMoments | Studio Chụp Ảnh Cưới Phong Cách Luxury & Cảm Xúc',
      defaultMetaDescription: 'PlusMoments Studio chuyên cung cấp dịch vụ chụp ảnh cưới Pre-Wedding, phóng sự cưới cao cấp với phong cách sang trọng, tự nhiên và đậm chất điện ảnh.',
      defaultOgImage: '',
      canonicalBaseUrl: 'https://plusmoments.vn',
      hotline: '0903768871',
      hotlineDisplay: '0903.768.871',
      zaloNumber: '0903768871',
      zaloUrl: 'https://zalo.me/0903768871',
      messengerUrl: 'https://m.me/plusmoments.vn',
      promoText: 'Nhận Báo Giá Ưu Đãi 2Tr',
      email: 'contact@plusmoments.vn',
      studioAddress: '31 Hùng Vương, Phường An Đông',
      openingHours: '09:00 - 21:00 (Thứ 2 - Chủ Nhật)',
      brandNamePart1: 'PLUS',
      brandNamePart2: 'MOMENTS',
      brandSubtitle: 'LUXURY WEDDING STUDIO',
      logoType: 'TEXT',
      logoLightUrl: null,
      logoDarkUrl: null,
      driveFolderUrl: '',
      driveFolderId: '',
      googleDriveApiKey: '',
      footerAboutText: 'Chúng tôi ghi lại những rung cảm tinh khôi và chân thành nhất trong tình yêu của bạn bằng ngôn ngữ ánh sáng điện ảnh.',
      footerCopyrightText: '© 2026 PlusMoments Wedding Studio. All rights reserved.',
      footerAddress: '31 Hùng Vương, Phường An Đông',
      footerHotline: '0903768871',
      footerEmail: 'contact@plusmoments.vn',
      footerWorkingHours: '09:00 - 21:00 (Thứ 2 - Chủ Nhật)',
    },
  }).catch((e) => console.warn('SystemSetting reset error:', e.message));

  // Reset HomePageConfig về trạng thái sạch (không chứa link Unsplash mẫu)
  await prisma.homePageConfig.deleteMany({}).catch(() => {});
  await prisma.homePageConfig.create({
    data: {
      id: 'default',
      heroBadge: 'LUXURY WEDDING PHOTOGRAPHY & CINEMATIC ART',
      heroTitle: 'Nơi Tình Yêu Trở Thành Tác Phẩm Nghệ Thuật',
      heroSubtitle: 'PlusMoments lưu giữ ánh nhìn say đắm, những cái ôm siết chặt và rung cảm thuần khiết nhất của hai bạn trong từng khung hình điện ảnh.',
      heroBannerImage: '', // Để trống sạch sẽ, không gán link Unsplash
      statsJson: '[{"label":"Cặp Đôi Hạnh Phúc","value":"500+"},{"label":"Váy Cưới Cao Cấp","value":"100%"},{"label":"Đánh Giá Tuyệt Đối","value":"5.0 ★"}]',
      philosophyTitle: 'Nghệ Thuật Của Những Rung Cảm',
      philosophyText: 'Chúng tôi không tìm kiếm sự hoàn hảo của những bức tượng sáp. Chúng tôi đi tìm giọt nước mắt hạnh phúc của người cha, ánh mắt rung rinh của chú rể và nụ cười rạng ngời của cô dâu trong khoảnh khắc thiêng liêng nhất cuộc đời.',
      showTestimonials: true,
      testimonialsTitle: 'Cảm Xúc Của Các Dâu Rể',
      testimonialsSubtitle: 'Hạnh phúc của bạn chính là niềm tự hào lớn nhất của ekip sáng tạo PlusMoments',
    },
  }).catch((e) => console.warn('HomePageConfig reset error:', e.message));

  // Dọn dẹp các thư mục media mockup vật lý trong public/uploads
  const uploadsDirsToClean = [
    path.join(process.cwd(), 'public', 'uploads', 'folders'),
    path.join(process.cwd(), 'public', 'uploads', 'logos'),
    path.join(process.cwd(), 'public', 'uploads', 'products'),
  ];
  for (const dir of uploadsDirsToClean) {
    if (fs.existsSync(dir)) {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        await fs.promises.rm(path.join(dir, entry.name), { recursive: true, force: true });
      }
    }
  }

  console.log('--- ĐÃ DỌN DẸP SẠCH TOÀN BỘ DỮ LIỆU MOCKUP THÀNH CÔNG ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

