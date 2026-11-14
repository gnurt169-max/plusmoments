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
import { FloatingCard } from '@/components/motion/FloatingCard';
import { PricingPackageData } from '@/components/pricing/LuxuryPricingSection';
import { PricingPackagesJsonLd, computeReviewStats } from '@/components/seo/JsonLdSchema';
import {
  extractPackageHighlights,
  extractPackageInclusions,
} from '@/lib/package-features';
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
  return {
    alternates: {
      canonical: baseUrl,
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

  const featuredAlbumsRaw = (allAlbumsRaw || []).slice(0, 3);
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

  // 1. Featured Albums (Top 3)
  const albums = featuredAlbumsRaw;

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

  const formattedPackages: PricingPackageData[] = packages.map((pkg) => {
    const coreHighlights = extractPackageHighlights(pkg);
    const fullInclusions = extractPackageInclusions(pkg);
    return {
      id: pkg.id,
      name: pkg.name,
      slug: pkg.slug,
      category: pkg.category,
      subtitle: pkg.subtitle,
      price: Number(pkg.price),
      originalPrice: pkg.originalPrice ? Number(pkg.originalPrice) : null,
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
      albums: (pkg as any).albums || [],
      blogPosts: (pkg as any).blogPosts || [],
    };
  });

  const baseUrl = settings.canonicalBaseUrl || 'https://plusmoments.vn';
  const { aggregateRating, reviews } = computeReviewStats(testimonials);

  return (
    <div className="space-y-24 sm:space-y-32 pb-24 overflow-hidden">
      {/* Structured Schema Data for Packages */}
      <PricingPackagesJsonLd
        baseUrl={baseUrl}
        aggregateRating={aggregateRating}
        reviews={reviews}
        packages={packages.map((pkg) => {
          let demoImagesList: string[] = [];
          if (pkg.demoImages) {
            try {
              const parsed = JSON.parse(pkg.demoImages);
              if (Array.isArray(parsed)) {
                demoImagesList = parsed.filter(
                  (item): item is string => typeof item === 'string' && item.trim().length > 0
                );
              }
            } catch {
              // ignore
            }
          }
          const allImages = [pkg.coverImage, ...demoImagesList].filter(
            (img): img is string => Boolean(img && img.trim())
          );
          const packageImages = allImages.length > 0 ? allImages : ['/og-image.jpg'];

          return {
            name: pkg.name,
            description:
              pkg.subtitle ||
              extractPackageHighlights(pkg)?.[0] ||
              `Gói dịch vụ chụp ảnh cưới cao cấp ${pkg.name} trọn gói tại PlusMoments Studio.`,
            price: Number(pkg.price).toString(),
            url: `${baseUrl}/bang-gia#${pkg.slug}`,
            image: packageImages,
          };
        })}
      />

      {/* =========================================================================
          CINEMATIC FULL-SCREEN IMMERSIVE HERO BANNER
      ========================================================================= */}
      <section className="relative w-full h-screen min-h-[700px] flex items-center justify-center overflow-hidden bg-stone-950 pt-16">
        {/* LỚP 1: ẢNH NỀN TRÀN MÀN HÌNH (BACKGROUND IMAGE) */}
        {heroBanner && heroBanner.trim() ? (
          <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden bg-stone-950">
            <SafeImage
              src={heroBanner.trim()}
              alt="Studio ảnh cưới cao cấp PlusMoments"
              fill
              priority={true}
              fetchPriority="high"
              quality={85}
              sizes="100vw"
              className="object-cover object-center scale-100 select-none pointer-events-none"
            />
          </div>
        ) : (
          <div className="absolute inset-0 bg-[#141210]" />
        )}

        {/* LỚP 2: LỚP PHỦ NGHỆ THUẬT & TỐI HÓA ĐIỆN ẢNH (CINEMATIC OVERLAYS) */}
        {/* Overlay tối toàn cảnh nhẹ để tương phản chữ */}
        <div className="absolute inset-0 bg-black/45 z-10 pointer-events-none" />
        {/* Gradient mềm từ đáy lên để hòa quyện mượt mà vào section kế tiếp */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-black/60 z-10 pointer-events-none" />

        {/* LỚP 3: NỘI DUNG CHỮ & NÚT BẤM CHÍNH GIỮA (CENTER CONTENT - z-20) */}
        <div className="relative z-20 max-w-5xl mx-auto px-6 text-center flex flex-col items-center">
          {/* 1. Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 bg-black/30 backdrop-blur-md mb-6">
            <span className="text-amber-400 text-xs">✦</span>
            <span className="text-[11px] sm:text-xs font-sans tracking-[0.25em] text-stone-200 uppercase font-medium">
              {heroBadge || 'LUXURY WEDDING PHOTOGRAPHY & CINEMATIC ART'}
            </span>
          </div>

          {/* 2. Grand Serif Title with Reserved Container to Prevent Swap CLS */}
          <div className="min-h-[120px] sm:min-h-[160px] lg:min-h-[180px] flex items-center justify-center mb-6">
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal text-white tracking-wide leading-[1.15] drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
              {heroTitle || 'Nơi Tình Yêu Trở Thành Tác Phẩm Nghệ Thuật'}
            </h1>
          </div>

          {/* 3. Emotional Description */}
          <p className="max-w-2xl text-stone-300 font-sans text-sm sm:text-base font-light leading-relaxed mb-10 drop-shadow-sm">
            {heroSubtitle ||
              'PlusMoments không đơn thuần chụp lại những tư thế, chúng tôi lưu giữ ánh nhìn say đắm, những cái ôm siết chặt và rung cảm thuần khiết nhất của hai bạn trong từng khung hình điện ảnh.'}
          </p>

          {/* 4. Dual Call To Action */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-14">
            <Link
              href="/bo-suu-tap"
              className="px-8 py-3.5 rounded-full bg-[#9A6436] hover:bg-[#855328] text-white text-xs uppercase tracking-[0.18em] font-medium transition-all shadow-lg hover:shadow-[#9A6436]/40 hover:-translate-y-0.5 cursor-pointer"
            >
              Khám Phá Bộ Sưu Tập →
            </Link>
            <Link
              href="/bang-gia"
              className="px-8 py-3.5 rounded-full border border-white/30 hover:border-white text-white text-xs uppercase tracking-[0.18em] font-medium bg-black/20 hover:bg-white/10 backdrop-blur-sm transition-all cursor-pointer"
            >
              Nhận Báo Giá Ưu Đãi
            </Link>
          </div>

          {/* 5. Social Proof Stats Row */}
          <div className="grid grid-cols-3 gap-8 sm:gap-16 pt-8 border-t border-white/15 w-full max-w-2xl">
            {statsList && statsList.length > 0 ? (
              statsList.map((st, i) => (
                <div key={i}>
                  <div className="font-serif text-2xl sm:text-3xl text-white font-light">{st.value}</div>
                  <div className="text-[10px] sm:text-xs tracking-wider uppercase text-stone-400 mt-1">{st.label}</div>
                </div>
              ))
            ) : (
              <>
                <div>
                  <div className="font-serif text-2xl sm:text-3xl text-white font-light">500+</div>
                  <div className="text-[10px] sm:text-xs tracking-wider uppercase text-stone-400 mt-1">Cặp Đôi Hạnh Phúc</div>
                </div>
                <div>
                  <div className="font-serif text-2xl sm:text-3xl text-white font-light">100%</div>
                  <div className="text-[10px] sm:text-xs tracking-wider uppercase text-stone-400 mt-1">Váy Cưới Cao Cấp</div>
                </div>
                <div>
                  <div className="font-serif text-2xl sm:text-3xl text-white font-light">5.0 ★</div>
                  <div className="text-[10px] sm:text-xs tracking-wider uppercase text-stone-400 mt-1">Đánh Giá Tuyệt Đối</div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          FEATURED ALBUMS WITH ANTIGRAVITY FLOATING MOTION
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#7A6243]">
            Portfolio Tuyệt Tác
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-charcoal-900">
            Bộ Sưu Tập Cưới Nổi Bật
          </h2>
          <p className="text-sm text-charcoal-600 font-light leading-relaxed">
            Mỗi bộ ảnh là một cuốn nhật ký tình yêu mang hơi thở riêng biệt, được thực hiện bởi sự tỉ mỉ từ trang phục, makeup đến ánh sáng.
          </p>
        </div>

        {(() => {
          const displayedAlbums = albums && Array.isArray(albums) ? albums.slice(0, 3) : [];
          if (displayedAlbums.length === 0) {
            return (
              <div className="text-center py-12 text-xs text-charcoal-600">
                Đang cập nhật các bộ sưu tập mới...
              </div>
            );
          }

          return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {displayedAlbums.map((album, idx) => {
                const coverImageSrc =
                  (typeof album?.coverImage === 'string' && album.coverImage.trim() ? album.coverImage.trim() : null) ||
                  (album as any)?.photos?.[0]?.url ||
                  album?.media?.[0]?.url ||
                  '/placeholder.jpg';

                return (
                  <FloatingCard
                    key={album?.id || idx}
                    delay={idx * 0.2}
                    reverse={idx % 2 === 1}
                    className="group h-full"
                  >
                    <Link
                      href={`/bo-suu-tap/${album?.slug || ''}`}
                      aria-label={`Xem album ảnh cưới: ${album?.title || album?.coupleNames || 'Chi tiết'}`}
                      className="flex flex-col h-full bg-white p-3.5 rounded-2xl shadow-luxury hover:shadow-luxury-hover border border-champagne-dark/30 transition-all duration-300"
                    >
                      <div className="relative aspect-[4/5] w-full rounded-xl overflow-hidden mb-4 bg-[#1E1C1A]">
                        <SafeImage
                          src={coverImageSrc}
                          alt={album?.title || 'PlusMoments Wedding Album'}
                          fill
                          quality={65}
                          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 420px"
                          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out select-none pointer-events-none"
                        />
                        {album?.concept && (
                          <div className="absolute top-3 left-3 px-3 py-1 bg-charcoal-900/80 backdrop-blur-sm rounded-full text-[10px] tracking-widest uppercase text-champagne-light font-medium">
                            {album.concept}
                          </div>
                        )}
                        {album?.location && (
                          <div className="absolute bottom-3 right-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[11px] font-mono text-charcoal-800">
                            {album.location}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5 px-2 pb-2 mt-auto">
                        <div className="flex items-center justify-between text-xs text-[#7A6243]">
                          <span className="font-medium tracking-wide">{album?.coupleNames || ''}</span>
                          <span className="text-charcoal-600 text-[11px] font-medium">Chi tiết →</span>
                        </div>
                        <h3 className="font-serif text-lg text-charcoal-900 font-light group-hover:text-luxury-600 transition-colors line-clamp-1">
                          {album?.title || ''}
                        </h3>
                        <p className="text-xs text-charcoal-500 line-clamp-2 font-light">
                          {album?.subtitle || album?.description || ''}
                        </p>
                      </div>
                    </Link>
                  </FloatingCard>
                );
              })}
            </div>
          );
        })()}

        {/* Nút Xem Tất Cả Bộ Sưu Tập */}
        <div className="mt-12 text-center">
          <Link
            href="/bo-suu-tap"
            className="inline-flex items-center gap-3 px-8 py-3.5 border border-[#7A6243] text-[#7A6243] hover:bg-[#7A6243] hover:text-white rounded-full text-sm font-medium tracking-widest uppercase transition-all duration-300 shadow-sm hover:shadow-lg group cursor-pointer"
          >
            <span>Xem Tất Cả Bộ Sưu Tập {totalAlbumsCount > 0 ? `(${totalAlbumsCount})` : ''}</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* =========================================================================
          PRICING & PACKAGES SECTION (3-Column Grid & Detail Modal)
      ========================================================================= */}
      <section className="bg-charcoal-900 text-white py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
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
      </section>

      {/* =========================================================================
          FEATURED BLOG & WEDDING JOURNAL (Cẩm Nang Cưới)
      ========================================================================= */}
      <FeaturedBlogSection posts={featuredPosts} />

      {/* =========================================================================
          TESTIMONIALS (Floating Love Stories)
      ========================================================================= */}
      {(homeConfig?.showTestimonials ?? true) && testimonials.length > 0 && (
        <TestimonialsSection
          testimonials={testimonials}
          title={homeConfig?.testimonialsTitle}
          subtitle={homeConfig?.testimonialsSubtitle}
        />
      )}

      {/* =========================================================================
          HIGH-CONVERTING CONSULTATION SECTION (#tu-van)
      ========================================================================= */}
      <section
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
      </section>
    </div>
  );
}
