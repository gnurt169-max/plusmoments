import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { getSystemSettings } from '@/lib/settings';
import dynamic from 'next/dynamic';
import { FloatingCard } from '@/components/motion/FloatingCard';
import { ImageGalleryJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLdSchema';
import { Sparkles, ArrowRight } from 'lucide-react';

const ConsultationForm = dynamic(
  () => import('@/components/home/ConsultationForm').then((mod) => mod.ConsultationForm),
  { ssr: false }
);

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSystemSettings();
  const baseUrl = settings.canonicalBaseUrl || 'https://plusmoments.vn';
  const canonicalUrl = `${baseUrl}/bo-suu-tap`;

  const title = 'Tất Cả Bộ Sưu Tập Ảnh Cưới Luxury | Pre-Wedding & Phóng Sự Cưới | PlusMoments';
  const description =
    'Khám phá toàn bộ album ảnh cưới đẹp nhất tại Đà Lạt, TP.HCM, Phú Quốc phong cách điện ảnh, Hàn Quốc và Châu Âu của PlusMoments Studio.';

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: settings.siteName,
      locale: 'vi_VN',
      type: 'website',
      images: [
        {
          url: settings.defaultOgImage || '/images/og-image.jpg',
          width: 1200,
          height: 630,
          alt: `${settings.siteName} - Bộ Sưu Tập Ảnh Cưới`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [settings.defaultOgImage || '/images/og-image.jpg'],
    },
  };
}

export default async function BoSuuTapPage({
  searchParams,
}: {
  searchParams: { concept?: string; category?: string };
}) {
  const selectedConcept = searchParams.category || searchParams.concept;

  const [allAlbums, settings] = await Promise.all([
    prisma.album.findMany({
      where: {
        published: true,
      },
      orderBy: [
        { featured: 'desc' },
        { orderIndex: 'asc' },
        { createdAt: 'desc' },
      ],
      include: {
        media: { take: 1, orderBy: { orderIndex: 'asc' } },
      },
    }),
    getSystemSettings(),
  ]);

  const baseUrl = settings.canonicalBaseUrl || 'https://plusmoments.vn';

  // Trích xuất danh mục duy nhất từ chính mảng albums thực tế từ Database
  const dynamicCategories = Array.from(
    new Set(
      allAlbums
        .map((album) => (album as any).category?.trim() || album.concept?.trim())
        .filter((cat): cat is string => Boolean(cat))
    )
  );

  const concepts = ['Tất Cả', ...dynamicCategories];

  // Lọc chuẩn hóa chuỗi theo danh mục đã chọn
  const filteredAlbums =
    !selectedConcept || selectedConcept === 'Tất Cả'
      ? allAlbums
      : allAlbums.filter((album) => {
          const cat = ((album as any).category?.trim() || album.concept?.trim() || '').toLowerCase();
          return cat === selectedConcept.trim().toLowerCase();
        });

  // Prepare images for ImageGallery Schema.org
  const galleryImages = filteredAlbums
    .filter((a) => a.coverImage)
    .map((a) => ({
      url: a.coverImage,
      caption: `${a.title} - ${a.coupleNames} (${a.location})`,
      width: 1200,
      height: 800,
    }));

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Schema.org BreadcrumbList & ImageGallery for Rich Snippets */}
      <BreadcrumbJsonLd
        items={[
          { name: 'Trang chủ', item: baseUrl },
          { name: 'Bộ Sưu Tập Cưới', item: `${baseUrl}/bo-suu-tap` },
        ]}
      />
      <ImageGalleryJsonLd
        name="Tất Cả Bộ Sưu Tập Ảnh Cưới Luxury - PlusMoments"
        description="Toàn bộ danh mục album ảnh cưới nghệ thuật điện ảnh của PlusMoments Studio"
        url={`${baseUrl}/bo-suu-tap`}
        images={galleryImages}
      />

      {/* HEADER SECTION */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-stone-200 bg-stone-50/80 backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
          <span className="text-[11px] font-sans tracking-[0.25em] text-stone-600 uppercase font-medium">
            Portfolio & Lookbook
          </span>
        </div>

        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-light text-charcoal-900 tracking-tight">
          Bộ Sưu Tập Ảnh Cưới
        </h1>

        <p className="text-sm sm:text-base text-charcoal-600 font-light leading-relaxed max-w-2xl mx-auto">
          Nơi lưu giữ những nụ cười rạng rỡ và cảm xúc thuần khiết của hàng trăm cặp đôi qua ngôn ngữ ánh sáng điện ảnh tinh tế.
        </p>
      </div>

      {/* CONCEPT FILTER CHIPS (Chỉ hiển thị khi có từ 2 danh mục thực tế trở lên để lọc) */}
      {dynamicCategories.length > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
          {concepts.map((concept) => {
            const isAll = concept === 'Tất Cả';
            const isActive = isAll
              ? !selectedConcept || selectedConcept === 'Tất Cả'
              : selectedConcept?.trim().toLowerCase() === concept.trim().toLowerCase();
            const href = isAll ? '/bo-suu-tap' : `/bo-suu-tap?concept=${encodeURIComponent(concept)}`;

            return (
              <Link
                key={concept}
                href={href}
                className={`px-5 py-2.5 rounded-full text-xs uppercase tracking-wider font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880] focus-visible:ring-offset-2 ${
                  isActive
                    ? 'bg-charcoal-900 text-white shadow-md font-semibold'
                    : 'bg-white text-charcoal-700 hover:bg-[#C5A880]/15 border border-stone-200/80 shadow-2xs'
                }`}
              >
                {concept}
              </Link>
            );
          })}
        </div>
      )}

      {/* ALBUMS GRID */}
      {filteredAlbums.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-stone-200/80 p-8 max-w-xl mx-auto space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-xl">
            📷
          </div>
          <h2 className="font-serif text-2xl text-charcoal-800 font-light">
            Chưa có album nào trong phân loại này
          </h2>
          <p className="text-xs text-charcoal-500 font-light">
            Vui lòng chọn phân loại concept khác hoặc quay lại xem toàn bộ bộ sưu tập cưới.
          </p>
          <Link
            href="/bo-suu-tap"
            className="inline-flex items-center gap-2 mt-2 px-6 py-2.5 rounded-full text-xs uppercase tracking-wider bg-charcoal-900 hover:bg-charcoal-800 text-white font-medium transition-colors"
          >
            <span>Xem Tất Cả Album</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAlbums.map((album, idx) => {
            const coverImg =
              (typeof album?.coverImage === 'string' && album.coverImage.trim() ? album.coverImage.trim() : null) ||
              (album as any)?.photos?.[0]?.url ||
              album?.media?.[0]?.url ||
              '/placeholder.jpg';

            return (
              <FloatingCard
                key={album.id}
                delay={idx * 0.15}
                reverse={idx % 2 === 1}
                className="group h-full"
              >
                <Link
                  href={`/bo-suu-tap/${album.slug}`}
                  aria-label={`Xem album ảnh cưới: ${album.title || album.coupleNames}`}
                  className="flex flex-col h-full bg-white p-4 rounded-2xl shadow-luxury hover:shadow-luxury-hover border border-champagne-dark/30 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880] focus-visible:ring-offset-2"
                >
                  <div className="relative aspect-[4/5] w-full rounded-xl overflow-hidden mb-4 bg-[#1E1C1A]">
                    <Image
                      src={coverImg || '/placeholder.jpg'}
                      alt={album.title || 'PlusMoments Album'}
                      fill
                      priority={idx < 2}
                      quality={70}
                      sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 420px"
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out select-none pointer-events-none"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 bg-charcoal-900/80 backdrop-blur-sm rounded-full text-[10px] tracking-widest uppercase text-champagne-light font-medium">
                      {album.concept}
                    </div>
                    <div className="absolute bottom-3 right-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[11px] font-mono text-charcoal-800">
                      {album.location}
                    </div>
                  </div>

                  <div className="space-y-1.5 px-2 pb-1 mt-auto">
                    <div className="flex items-center justify-between text-xs text-[#7A6243]">
                      <span className="font-medium tracking-wide">{album.coupleNames}</span>
                      <span className="text-charcoal-600 text-[11px] group-hover:text-[#7A6243] transition-colors">
                        Xem album →
                      </span>
                    </div>
                    <h2 className="font-serif text-lg text-charcoal-900 font-light group-hover:text-luxury-600 transition-colors line-clamp-1">
                      {album.title}
                    </h2>
                    <p className="text-xs text-charcoal-500 line-clamp-2 font-light">
                      {album.subtitle || album.description}
                    </p>
                  </div>
                </Link>
              </FloatingCard>
            );
          })}
        </div>
      )}

      {/* CONSULTATION CTA SECTION */}
      <div className="pt-12 border-t border-stone-200/60">
        <div className="max-w-2xl mx-auto text-center space-y-4 mb-8">
          <p className="text-xs uppercase tracking-[0.25em] text-[#7A6243] font-semibold">
            Đồng Hành Cùng Bạn
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-light text-charcoal-900">
            Hiện Thực Hóa Bộ Ảnh Trong Mơ
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-600 font-light leading-relaxed">
            Để lại thông tin để ekip PlusMoments tư vấn kịch bản concept độc bản và gửi báo giá kèm ưu đãi 2.000.000đ dành riêng cho hai bạn.
          </p>
        </div>
        <div className="max-w-xl mx-auto">
          <ConsultationForm />
        </div>
      </div>
    </div>
  );
}

