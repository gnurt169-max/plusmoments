import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getSystemSettings } from '@/lib/settings';
import { FloatingCard } from '@/components/motion/FloatingCard';
import { ConsultationForm } from '@/components/home/ConsultationForm';
import { PricingSection } from '@/components/home/PricingSection';
import { FeaturedBlogSection } from '@/components/home/FeaturedBlogSection';
import { PricingPackageData } from '@/components/pricing/LuxuryPricingSection';
import { extractPackageFeatures } from '@/lib/package-features';
import { ProtectedImage } from '@/components/common/ProtectedImage';
import {
  Sparkles,
  Star,
  ArrowRight,
} from 'lucide-react';

export const revalidate = 60; // ISR cache revalidation every 60s

export default async function HomePage() {
  const [
    settings,
    homeConfig,
    featuredAlbumsRaw,
    allPackagesRaw,
    totalPackagesCount,
    testimonials,
    totalAlbumsCount,
    featuredPostsRaw,
  ] = await Promise.all([
    getSystemSettings(),
    prisma.homePageConfig.findUnique({ where: { id: 'default' } }).catch(() => null),
    prisma.album.findMany({
      where: { published: true },
      include: { media: { take: 1, orderBy: { orderIndex: 'asc' } }, package: true },
      orderBy: [
        { featured: 'desc' }, // Ưu tiên Album nổi bật (featured: true) lên đầu
        { orderIndex: 'asc' },
        { createdAt: 'desc' },
      ],
      take: 3, // GIỚI HẠN CHÍNH XÁC 3 ALBUM TỐI ƯU CORE WEB VITALS
    }).catch(() => []),
    prisma.servicePackage.findMany({
      where: { published: true },
      orderBy: [{ isPopular: 'desc' }, { isFeatured: 'desc' }, { orderIndex: 'asc' }],
    }).catch(() => []),
    prisma.servicePackage.count({
      where: { published: true },
    }).catch(() => 0),
    prisma.testimonial.findMany({
      where: { published: true, OR: [{ featured: true }, { isFeatured: true }] },
      orderBy: [{ orderIndex: 'asc' }, { createdAt: 'desc' }],
      take: 6,
    }).catch(() => []),
    prisma.album.count({
      where: { published: true },
    }).catch(() => 0),
    prisma.blogPost.findMany({
      where: { published: true },
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        summary: true,
        coverImage: true,
        category: true,
        readingMinutes: true,
        createdAt: true,
      },
    }).catch(() => []),
  ]);

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
    const fullFeatures = extractPackageFeatures(pkg);
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
      features: fullFeatures,
      fullFeatures: fullFeatures,
      shortFeatures: fullFeatures.slice(0, 3),
      deliveryProcess: pkg.deliverables,
    };
  });

  return (
    <div className="space-y-24 sm:space-y-32 pb-24 overflow-hidden">
      {/* =========================================================================
          CINEMATIC FULL-SCREEN IMMERSIVE HERO BANNER
      ========================================================================= */}
      <section className="relative w-full h-screen min-h-[700px] flex items-center justify-center overflow-hidden bg-stone-950 pt-16">
        {/* LỚP 1: ẢNH NỀN TRÀN MÀN HÌNH (BACKGROUND IMAGE) */}
        {heroBanner && heroBanner.trim() ? (
          <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden bg-stone-950">
            <Image
              src={heroBanner.trim()}
              alt="Studio ảnh cưới cao cấp PlusMoments"
              fill
              priority
              quality={85}
              sizes="(max-width: 768px) 100vw, 100vw"
              className="object-cover object-center scale-100 transition-transform duration-1000 ease-out select-none pointer-events-none"
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 bg-black/30 backdrop-blur-md mb-6 animate-fade-in">
            <span className="text-amber-400 text-xs">✦</span>
            <span className="text-[11px] sm:text-xs font-sans tracking-[0.25em] text-stone-200 uppercase font-medium">
              {heroBadge || 'LUXURY WEDDING PHOTOGRAPHY & CINEMATIC ART'}
            </span>
          </div>

          {/* 2. Grand Serif Title */}
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal text-white tracking-tight leading-[1.15] mb-6 drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
            {heroTitle || 'Nơi Tình Yêu Trở Thành Tác Phẩm Nghệ Thuật'}
          </h1>

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
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-luxury-600">
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
              <div className="text-center py-12 text-xs text-charcoal-400">
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
                      className="flex flex-col h-full bg-white p-3.5 rounded-2xl shadow-luxury hover:shadow-luxury-hover border border-champagne-dark/30 transition-all duration-300"
                    >
                      <div className="relative aspect-[4/5] w-full rounded-xl overflow-hidden mb-4 bg-[#1E1C1A]">
                        <Image
                          src={coverImageSrc}
                          alt={album?.title || 'PlusMoments Wedding Album'}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
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
                        <div className="flex items-center justify-between text-xs text-luxury-600">
                          <span className="font-medium tracking-wide">{album?.coupleNames || ''}</span>
                          <span className="text-charcoal-400 text-[11px]">Chi tiết →</span>
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
            className="inline-flex items-center gap-3 px-8 py-3.5 border border-[#C5A880] text-[#C5A880] hover:bg-[#C5A880] hover:text-[#0E0D0C] rounded-full text-sm font-medium tracking-widest uppercase transition-all duration-300 shadow-sm hover:shadow-lg group cursor-pointer"
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

          <div className="text-center mt-12 text-xs text-stone-400">
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
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-luxury-600">
              Câu Chuyện Hạnh Phúc
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-charcoal-900">
              {homeConfig?.testimonialsTitle || 'Cảm Xúc Của Các Dâu Rể'}
            </h2>
            <p className="text-sm text-charcoal-600 font-light leading-relaxed">
              {homeConfig?.testimonialsSubtitle ||
                'Hạnh phúc của bạn chính là niềm tự hào lớn nhất của ekip sáng tạo PlusMoments.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((test, index) => {
              const avatar =
                test.avatarUrl ||
                test.coverImageUrl ||
                '';
              const contentText = test.content || test.reviewContent || '';

              return (
                <FloatingCard
                  key={test.id}
                  delay={index * 0.5}
                  reverse={index % 2 === 1}
                  className="bg-white p-8 rounded-2xl border border-champagne-dark/30 shadow-luxury flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1 text-amber-500 mb-4">
                      {[...Array(test.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                      ))}
                    </div>
                    <blockquote className="font-serif text-lg sm:text-xl font-light text-charcoal-900 italic mb-4">
                      "{test.quote}"
                    </blockquote>
                    <p className="text-xs text-charcoal-600 font-light leading-relaxed mb-6">
                      {contentText}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 pt-4 border-t border-champagne-light">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-champagne-light shrink-0">
                      <Image
                        src={avatar}
                        alt={test.coupleNames}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-serif text-sm font-medium text-charcoal-900">
                        {test.coupleNames}
                      </h4>
                      {test.weddingDate && (
                        <p className="text-[11px] text-charcoal-400 font-mono">
                          {test.weddingDate}
                        </p>
                      )}
                    </div>
                  </div>
                </FloatingCard>
              );
            })}
          </div>
        </section>
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-champagne/60 text-luxury-700 text-xs uppercase tracking-widest font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-luxury-600" />
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
