import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  getCachedSystemSettings,
  getCachedHomePageConfig,
  getCachedAlbums,
  getCachedPackages,
  getCachedTestimonials,
  getCachedBlogs,
} from '@/lib/cached-queries';
import { SafeImage } from '@/components/common/SafeImage';
import { CinematicHeroBanner } from '@/components/home/CinematicHeroBanner';
import { FeaturedAlbumsSection } from '@/components/home/FeaturedAlbumsSection';
import { PricingPackageData } from '@/components/pricing/LuxuryPricingSection';
import {
  PricingPackagesJsonLd,
  computeReviewStats,
  getValidProductImages,
} from '@/components/seo/JsonLdSchema';
import {
  extractPackageHighlights,
  extractPackageInclusions,
} from '@/lib/package-features';
import { toAbsoluteUrl } from '@/lib/utils';
import { serializeAlbumForClient } from '@/lib/album-utils';
import { EditorialReveal } from '@/components/ui/EditorialReveal';
import { ScrollCue } from '@/components/ui/ScrollCue';
import {
  Sparkles,
  ArrowRight,
} from 'lucide-react';

// TRÌ HOÃN HYDRATION CÁC SECTION NẰM DƯỚI TRANG CHỦ (BELOW-THE-FOLD)
// Tách JS của Bảng giá & Modal chi tiết bên dưới trang chủ thành chunk riêng
const PricingSection = dynamic(
  () => import('@/components/home/PricingSection'),
  { ssr: true }
);

// Tách JS của Cẩm nang cưới (Blog Preview) thành chunk riêng
const FeaturedBlogSection = dynamic(
  () => import('@/components/home/FeaturedBlogSection').then((mod) => mod.FeaturedBlogSection),
  { ssr: true }
);

// Tách JS của Đánh giá khách hàng (Testimonials) thành chunk riêng
const TestimonialsSection = dynamic(
  () => import('@/components/home/TestimonialsSection').then((mod) => mod.TestimonialsSection),
  { ssr: true }
);

// Tách CSS và JS của biểu mẫu tư vấn ở cuối trang thành chunk riêng
const ConsultationForm = dynamic(
  () => import('@/components/home/ConsultationForm').then((mod) => mod.ConsultationForm),
  {
    ssr: false,
    loading: () => (
      <div className="h-48 flex items-center justify-center text-xs text-stone-600">
        Đang tải biểu mẫu tư vấn...
      </div>
    ),
  }
);

export const revalidate = 60; // ISR cache revalidation every 60s

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getCachedSystemSettings();
  const baseUrl = settings.canonicalBaseUrl || 'https://plusmoments.vn';
  const ogImageUrl = toAbsoluteUrl(settings.defaultOgImage, baseUrl);

  return {
    alternates: {
      canonical: baseUrl,
    },
    openGraph: {
      title: settings.defaultMetaTitle,
      description: settings.defaultMetaDescription,
      url: baseUrl,
      siteName: settings.siteName,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${settings.siteName} Wedding Photography`,
        },
      ],
      locale: 'vi_VN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: settings.defaultMetaTitle,
      description: settings.defaultMetaDescription,
      images: [ogImageUrl],
    },
  };
}

export default async function HomePage() {
  const [
    settings,
    homeConfig,
    allAlbumsRaw,
    allPackagesRaw,
    testimonials,
    allBlogsRaw,
  ] = await Promise.all([
    getCachedSystemSettings(),
    getCachedHomePageConfig(),
    getCachedAlbums(),
    getCachedPackages(),
    getCachedTestimonials(),
    getCachedBlogs(),
  ]);

  const featuredAlbumsRaw = (allAlbumsRaw || []).slice(0, 6);
  const totalAlbumsCount = (allAlbumsRaw || []).length;
  const totalPackagesCount = (allPackagesRaw || []).length;
  const featuredPostsRaw = (allBlogsRaw || []).slice(0, 3);

  const featuredPosts = (featuredPostsRaw || []).map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.summary,
    summary: post.summary,
    coverImage: post.coverImage,
    category: post.category,
    readingMinutes: post.readingMinutes,
    createdAt: post.createdAt,
  }));

  // 1. Featured Albums (Top 6) - Strictly serialized for Client Component
  const albums = featuredAlbumsRaw.map((a) => serializeAlbumForClient(a)).filter(Boolean);

  // 2. Packages list
  const packages = allPackagesRaw;

  // Safe Stats Fallback
  let statsList: { label: string; value: string }[] = [];
  try {
    statsList = JSON.parse(
      homeConfig?.statsJson ||
        '[{"label":"Cặp Đôi Hạnh Phúc","value":"500+"},{"label":"Váy Cưới Cao Cấp","value":"100%"},{"label":"Đánh Giá Tuyệt Đối","value":"5.0 ★"}]'
    );
  } catch {
    statsList = [
      { label: 'Cặp Đôi Hạnh Phúc', value: '500+' },
      { label: 'Váy Cưới Cao Cấp', value: '100%' },
      { label: 'Đánh Giá Tuyệt Đối', value: '5.0 ★' },
    ];
  }

  const heroBadge = homeConfig?.heroBadge || 'Luxury Wedding Photography & Cinematic Art';
  const heroTitle = homeConfig?.heroTitle || 'Nơi Tình Yêu Trở Thành Tác Phẩm Nghệ Thuật';
  const heroSubtitle =
    homeConfig?.heroSubtitle ||
    'PlusMoments không đơn thuần chụp lại những tư thế, chúng tôi lưu giữ ánh nhìn say đắm, những cái ôm siết chặt và rung cảm thuần khiết nhất của hai bạn trong từng khung hình điện ảnh.';
  const heroBanner =
    homeConfig?.heroBannerImage ||
    (homeConfig as any)?.heroBanner ||
    (homeConfig as any)?.heroBannerUrl ||
    '';

  // Trích xuất 3–4 ảnh bìa đẹp nhất từ album thực tế để tạo Cinematic Slideshow
  const albumSlides = (allAlbumsRaw || [])
    .map((a) => {
      const cover = typeof a.coverImage === 'string' && a.coverImage.trim() ? a.coverImage.trim() : null;
      const photo = a.media?.[0]?.url;
      return cover || photo;
    })
    .filter((url): url is string => Boolean(url && url.trim()));

  const heroSlides = Array.from(
    new Set([heroBanner?.trim(), ...albumSlides].filter(Boolean))
  ).slice(0, 4) as string[];

  // Trích xuất danh sách ảnh bồng bềnh rung rinh (Hero Floating Showcase) do Admin quản lý
  let floatingImages: string[] = [];
  const rawFloating = (homeConfig as any)?.heroFloatingImages;
  if (Array.isArray(rawFloating)) {
    floatingImages = rawFloating
      .map((item) => (typeof item === 'string' ? item.trim() : (item as any)?.url || ''))
      .filter((u): u is string => Boolean(u && u.trim()));
  } else if (typeof rawFloating === 'string') {
    try {
      const parsed = JSON.parse(rawFloating);
      if (Array.isArray(parsed)) {
        floatingImages = parsed
          .map((item) => (typeof item === 'string' ? item.trim() : (item as any)?.url || ''))
          .filter((u): u is string => Boolean(u && u.trim()));
      }
    } catch {}
  }
  // Fallback sang các ảnh đẹp từ album nếu Admin chưa cấu hình
  if (floatingImages.length === 0 && albumSlides.length > 0) {
    floatingImages = albumSlides.slice(0, 6);
  }

  const formattedPackages: PricingPackageData[] = packages.map((pkg) => {
    const coreHighlights = extractPackageHighlights(pkg);
    const fullInclusions = extractPackageInclusions(pkg);
    return {
      id: pkg.id,
      name: pkg.name,
      slug: pkg.slug,
      category: pkg.category,
      subtitle: pkg.subtitle,
      price: pkg.price !== null && pkg.price !== undefined ? Number(pkg.price) : 0,
      originalPrice: pkg.originalPrice !== null && pkg.originalPrice !== undefined ? Number(pkg.originalPrice) : null,
      unit: pkg.unit,
      coverImage: pkg.coverImage,
      demoImages: pkg.demoImages,
      highlightPoints: pkg.highlightPoints,
      inclusions: pkg.inclusions,
      deliverables: pkg.deliverables,
      isPopular: pkg.isPopular,
      isFeatured: pkg.isFeatured,
      highlights: coreHighlights,
      coreHighlights: coreHighlights,
      inclusionsList: fullInclusions,
      features: fullInclusions,
      fullFeatures: fullInclusions,
      shortFeatures: coreHighlights,
      deliveryProcess: pkg.deliverables,
      blurDataUrl: (pkg as any).blurDataUrl || null,
      videoLinks: (pkg as any).videoLinks || null,
      albums: (pkg as any).albums || [],
      blogPosts: (pkg as any).blogPosts || [],
    };
  });

  const baseUrl = settings.canonicalBaseUrl || 'https://plusmoments.vn';
  const { aggregateRating, reviews } = computeReviewStats(testimonials);
  const studioFallbackImage =
    heroBanner ||
    settings.logoDarkUrl ||
    settings.logoLightUrl ||
    settings.defaultOgImage ||
    '/og-image.jpg';

  return (
    <>
      {/* Structured Schema Data for Packages */}
      <PricingPackagesJsonLd
        baseUrl={baseUrl}
        siteLogoOrBanner={studioFallbackImage}
        aggregateRating={aggregateRating}
        reviews={reviews}
        packages={packages.map((pkg) => {
          const validImages = getValidProductImages(
            {
              coverImage: pkg.coverImage,
              demoImages: pkg.demoImages,
            },
            studioFallbackImage,
            baseUrl
          );

          return {
            name: pkg.name,
            slug: pkg.slug,
            description:
              pkg.subtitle ||
              extractPackageHighlights(pkg)?.[0] ||
              `Gói dịch vụ chụp ảnh cưới cao cấp ${pkg.name} trọn gói tại PlusMoments Studio.`,
            price: Number(pkg.price).toString(),
            url: `${baseUrl}/bang-gia#${pkg.slug}`,
            image: validImages,
          };
        })}
      />

      {/* =========================================================================
          CINEMATIC MULTI-SLIDE IMMERSIVE HERO BANNER WITH KEN BURNS MOTION
      ========================================================================= */}
      <CinematicHeroBanner
        heroBanner={heroBanner?.trim()}
        heroBadge={heroBadge}
        heroTitle={heroTitle}
        heroSubtitle={heroSubtitle}
        slides={heroSlides}
        stats={statsList}
        heroFloatingImages={floatingImages}
      />

      {/* =========================================================================
          MAIN PAGE CONTENT SECTIONS (PORTFOLIO, PRICING, BLOG, TESTIMONIALS, CONSULTATION)
      ========================================================================= */}
      <div id="explore-content" className="space-y-24 sm:space-y-32 py-24 sm:py-32 overflow-hidden">
        {/* =========================================================================
            FEATURED ALBUMS WITH ANTIGRAVITY FLOATING MOTION
        ========================================================================= */}
        <EditorialReveal as="section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-2.5 sm:space-y-3 mb-10 sm:mb-16 px-4">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#7A6243]">
              Portfolio Tuyệt Tác
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-charcoal-900">
              Bộ Sưu Tập Cưới Nổi Bật
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-600 font-light leading-relaxed">
              Mỗi bộ ảnh là một cuốn nhật ký tình yêu mang hơi thở riêng biệt, được thực hiện bởi sự tỉ mỉ từ trang phục, makeup đến ánh sáng.
            </p>
          </div>

          <FeaturedAlbumsSection
            albums={albums as any}
            totalAlbumsCount={totalAlbumsCount}
          />
        </EditorialReveal>

      {/* =========================================================================
          PRICING & PACKAGES SECTION (3-Column Grid & Detail Modal)
      ========================================================================= */}
      <EditorialReveal as="section" className="bg-gradient-to-b from-[#1E1A17] via-[#241F1C] to-[#1E1A17] text-white py-20 sm:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden border-y border-[#3E3630]/40">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-luxury-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto">
          <PricingSection
            packages={formattedPackages}
            totalPackagesCount={totalPackagesCount}
            title="Bảng Giá Dịch Vụ Cưới Trọn Gói"
            subtitle="Cam kết không phát sinh chi phí. Toàn bộ gói chụp đã bao gồm trang phục cưới thiết kế, makeup nghệ thuật và xe đưa đón nội thành."
            badge="Minh Bạch & Tối Ưu"
            darkTheme={true}
            isSummary={true}
          />

          <div className="text-center mt-12 text-xs text-stone-300">
            * Cần điều chỉnh lịch trình hoặc chụp ở nước ngoài? Liên hệ Hotline để nhận báo giá thiết kế riêng.
          </div>
        </div>
      </EditorialReveal>

      {/* =========================================================================
          FEATURED BLOG & WEDDING JOURNAL (Cẩm Nang Cưới - Chỉ hiển thị khi có bài viết)
      ========================================================================= */}
      {featuredPosts.length > 0 && (
        <EditorialReveal as="div">
          <FeaturedBlogSection posts={featuredPosts} />
        </EditorialReveal>
      )}

      {/* =========================================================================
          TESTIMONIALS (Floating Love Stories)
      ========================================================================= */}
      {(homeConfig?.showTestimonials ?? true) && testimonials.length > 0 && (
        <EditorialReveal as="div">
          <TestimonialsSection
            testimonials={testimonials}
            title={homeConfig?.testimonialsTitle}
            subtitle={homeConfig?.testimonialsSubtitle}
          />
        </EditorialReveal>
      )}

      {/* =========================================================================
          HIGH-CONVERTING CONSULTATION SECTION (#tu-van)
      ========================================================================= */}
      <EditorialReveal
        as="section"
        id="tu-van"
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28"
      >
        <div className="bg-[#FAF8F5] border-2 border-champagne-gold/40 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto text-center space-y-3 mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-champagne/60 text-[#7A6243] text-xs uppercase tracking-widest font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#7A6243]" />
              <span>Ưu Đãi Đặc Biệt Mùa Cưới 2025</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-light text-charcoal-900">
              Nhận Báo Giá Trọn Gói & Ưu Đãi 2.000.000đ
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-600 font-light leading-relaxed">
              Điền thông tin bên dưới để chuyên viên PlusMoments liên hệ tư vấn bối cảnh, thử váy cưới miễn phí và bảo lưu quà tặng ưu đãi.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <ConsultationForm />
          </div>
        </div>
      </EditorialReveal>
      </div>
    </>
  );
}
