import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outputPath = path.join(rootDir, 'public', 'llms.txt');

export function formatLlmsMarkdown(packages = [], posts = []) {
  const packageLines =
    packages.length > 0
      ? packages
          .map((pkg) => {
            const priceText = pkg.price
              ? `Giá từ ${Number(pkg.price).toLocaleString('vi-VN')} VNĐ.`
              : '';
            const subtitleText = pkg.subtitle
              ? pkg.subtitle.replace(/\s+/g, ' ').trim()
              : '';
            return `- [${pkg.name}](https://plusmoments.vn/bang-gia): ${priceText} ${subtitleText}`.trim();
          })
          .join('\n')
      : `- [Gói Chụp Ảnh Cưới Pre-Wedding](https://plusmoments.vn/bang-gia): Trọn gói concept studio, ngoại cảnh Sài Gòn, Đà Lạt, biển Nha Trang, Phú Quốc.\n- [Gói Phóng Sự Cưới (Wedding Journalism)](https://plusmoments.vn/bang-gia): Ghi lại những khoảnh khắc cảm xúc chân thực và tinh tế trong ngày cưới.\n- [Gói Trang Phục Cưới & Make-up Nghệ Thuật](https://plusmoments.vn/bang-gia): Váy cưới thiết kế cao cấp và phong cách trang điểm cô dâu tự nhiên sang trọng.`;

  const postLines =
    posts.length > 0
      ? posts
          .map((post) => {
            const summaryText = post.summary
              ? `: ${post.summary.replace(/\s+/g, ' ').trim()}`
              : '';
            return `- [${post.title}](https://plusmoments.vn/cam-nang/${post.slug})${summaryText}`;
          })
          .join('\n')
      : `- [Kinh nghiệm chọn concept chụp ảnh cưới Pre-Wedding](https://plusmoments.vn/cam-nang): Những lưu ý quan trọng để có bộ ảnh cưới ấn tượng và bền vững theo thời gian.\n- [Bí quyết chuẩn bị cho ngày cưới hoàn hảo](https://plusmoments.vn/cam-nang): Lịch trình chi tiết và lời khuyên hữu ích dành cho các cặp đôi.\n- [Xu hướng màu sắc và phong cách ảnh cưới Cinematic](https://plusmoments.vn/cam-nang): Định hình phong cách nghệ thuật tinh tế cho ngày trọng đại.`;

  return `# PlusMoments - Studio Chụp Ảnh Cưới & Phóng Sự Cưới Luxury tại TP.HCM

> PlusMoments là thương hiệu nhiếp ảnh cưới cao cấp theo phong cách Cinematic & Fine Art tại Thành phố Hồ Chí Minh, chuyên cung cấp dịch vụ chụp ảnh Pre-Wedding, Phóng sự cưới (Wedding Journalism), trang phục cưới thiết kế và trang điểm cô dâu nghệ thuật.

## Thông Tin Liên Hệ & Studio
- Website chính thức: https://plusmoments.vn
- Địa điểm hoạt động: Thành phố Hồ Chí Minh, Việt Nam
- Trang liên hệ & đặt lịch tư vấn: https://plusmoments.vn/lien-he

## Danh Mục Trang Chính
- [Trang chủ](https://plusmoments.vn/): Tổng quan phong cách nghệ thuật, các bộ sưu tập tiêu biểu và dịch vụ cưới tại PlusMoments.
- [Bộ sưu tập ảnh cưới](https://plusmoments.vn/bo-suu-tap): Thư viện các album Pre-Wedding và phóng sự cưới thực tế của khách hàng.
- [Bảng giá dịch vụ](https://plusmoments.vn/bang-gia): Thông tin chi tiết các gói chụp ảnh cưới, quyền lợi đi kèm và câu hỏi thường gặp.
- [Cẩm nang cưới](https://plusmoments.vn/cam-nang): Kiến thức, kinh nghiệm chuẩn bị lễ cưới và gợi ý concept chụp ảnh.
- [Liên hệ & Studio](https://plusmoments.vn/lien-he): Đặt lịch hẹn tư vấn trực tiếp và nhận báo giá chi tiết.

## Các Gói Dịch Vụ Nổi Bật
${packageLines}

## Bài Viết Cẩm Nang Cưới Mới Nhất
${postLines}
`;
}

async function main() {
  console.log('⚡ [generate-llms] Đang tạo file tĩnh public/llms.txt...');
  const prisma = new PrismaClient({
    log: ['error'],
  });

  let packages = [];
  let posts = [];

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Prisma query timed out after 3000ms')), 3000)
  );

  try {
    const fetchData = Promise.all([
      prisma.servicePackage.findMany({
        where: { published: true },
        select: { name: true, price: true, subtitle: true },
        orderBy: { orderIndex: 'asc' },
        take: 10,
      }),
      prisma.blogPost.findMany({
        where: { published: true },
        select: { title: true, slug: true, summary: true },
        orderBy: { publishedAt: 'desc' },
        take: 10,
      }),
    ]);

    const [pkgs, pts] = await Promise.race([fetchData, timeoutPromise]);
    packages = pkgs || [];
    posts = pts || [];
  } catch (err) {
    console.warn('⚠️ [generate-llms] Cảnh báo kết nối DB hoặc timeout (sử dụng fallback):', err.message);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }

  const content = formatLlmsMarkdown(packages, posts);

  // Ensure public directory exists
  const publicDir = path.dirname(outputPath);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, content, 'utf-8');
  console.log(`✅ [generate-llms] Đã tạo thành công ${outputPath} (${Buffer.byteLength(content, 'utf8')} bytes)`);
}

main().catch((err) => {
  console.error('❌ [generate-llms] Lỗi tạo llms.txt:', err);
  // Fallback an toàn nếu có lỗi nghiêm trọng
  try {
    const fallback = formatLlmsMarkdown([], []);
    fs.writeFileSync(outputPath, fallback, 'utf-8');
    console.log('✅ [generate-llms] Đã ghi fallback an toàn vào public/llms.txt');
  } catch {}
  process.exit(0);
});

