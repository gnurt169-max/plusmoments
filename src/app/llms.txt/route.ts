import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const revalidate = 3600; // Cache 1 giờ để trả về tức thì (< 20ms), tránh timeout

export async function GET() {
  try {
    // Lấy nhanh danh sách gói dịch vụ & bài viết mới nhất (giới hạn số lượng & chỉ select trường cần thiết)
    const [packages, posts] = await Promise.all([
      prisma.servicePackage
        .findMany({
          where: { published: true },
          select: { name: true, price: true, subtitle: true },
          orderBy: { orderIndex: 'asc' },
          take: 10,
        })
        .catch(() => []),
      prisma.blogPost
        .findMany({
          where: { published: true },
          select: { title: true, slug: true, summary: true },
          orderBy: { publishedAt: 'desc' },
          take: 10,
        })
        .catch(() => []),
    ]);

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
        : `- [Bảng giá dịch vụ chụp ảnh cưới trọn gói](https://plusmoments.vn/bang-gia): Chi tiết các gói Pre-Wedding và Phóng sự cưới cao cấp.`;

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
        : `- [Cẩm nang cưới PlusMoments](https://plusmoments.vn/cam-nang): Kinh nghiệm chuẩn bị ngày cưới và xu hướng ảnh cưới nghệ thuật.`;

    const content = `# PlusMoments - Studio Chụp Ảnh Cưới & Phóng Sự Cưới Luxury tại TP.HCM

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

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch {
    // Fallback an toàn tuyệt đối để không bao giờ bị lỗi 500 hoặc timeout
    const fallbackContent = `# PlusMoments - Studio Chụp Ảnh Cưới Luxury tại TP.HCM

> Studio chụp ảnh cưới Pre-Wedding và Phóng sự cưới phong cách Cinematic cao cấp tại Thành phố Hồ Chí Minh.

## Liên Kết Chính
- [Trang chủ](https://plusmoments.vn/)
- [Bộ sưu tập](https://plusmoments.vn/bo-suu-tap)
- [Bảng giá dịch vụ](https://plusmoments.vn/bang-gia)
- [Cẩm nang cưới](https://plusmoments.vn/cam-nang)
- [Liên hệ](https://plusmoments.vn/lien-he)
`;
    return new NextResponse(fallbackContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  }
}

