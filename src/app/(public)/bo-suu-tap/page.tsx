import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { getSystemSettings } from '@/lib/settings';
import { FloatingCard } from '@/components/motion/FloatingCard';
import { ImageGalleryJsonLd } from '@/components/seo/JsonLdSchema';
import { ConsultationForm } from '@/components/home/ConsultationForm';
import { Sparkles, ArrowRight } from 'lucide-react';

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
  searchParams: { concept?: string };
}) {
  const selectedConcept = searchParams.concept;

  const [albums, dbConcepts, settings] = await Promise.all([
    prisma.album.findMany({
      where: {
        published: true,
        ...(selectedConcept && selectedConcept !== 'Tất Cả' ? { concept: selectedConcept } : {}),
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
    prisma.albumConcept.findMany({
      orderBy: { order: 'asc' },
    }),
    getSystemSettings(),
  ]);

  const baseUrl = settings.canonicalBaseUrl || 'https://plusmoments.vn';

  const concepts = [
    'Tất Cả',
    ...(dbConcepts.length > 0
      ? dbConcepts.map((c) => c.name)
      : ['Outdoor Luxury', 'Studio Editorial', 'Pre-Wedding Cinematic', 'Phóng Sự Cưới']),
  ];

  // Prepare images for ImageGallery Schema.org
  const galleryImages = albums
    .filter((a) => a.coverImage)
    .map((a) => ({
      url: a.coverImage,
      caption: `${a.title} - ${a.coupleNames} (${a.location})`,
      width: 1200,
      height: 800,
    }));

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Schema.org ImageGallery for Rich Snippets */}
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

      {/* CONCEPT FILTER CHIPS */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
        {concepts.map((concept) => {
          const isAll = concept === 'Tất Cả';
          const isActive = isAll ? !selectedConcept || selectedConcept === 'Tất Cả' : selectedConcept === concept;
          const href = isAll ? '/bo-suu-tap' : `/bo-suu-tap?concept=${encodeURIComponent(concept)}`;

          return (
            <Link
              key={concept}
              href={href}
              className={`px-5 py-2.5 rounded-full text-xs uppercase tracking-wider font-medium transition-all duration-300 ${
                isActive
                  ? 'bg-charcoal-900 text-white shadow-md'
                  : 'bg-white text-charcoal-700 hover:bg-[#C5A880]/15 border border-stone-200/80 shadow-2xs'
              }`}
            >
              {concept}
            </Link>
          );
        })}
      </div>

      {/* ALBUMS GRID */}
      {albums.length === 0 ? (
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
          {albums.map((album, idx) => {
            const coverImg = album.coverImage && album.coverImage.trim() ? album.coverImage : '';

            return (
              <FloatingCard
                key={album.id}
                delay={idx * 0.15}
                reverse={idx % 2 === 1}
                className="group h-full"
              >
                <Link
                  href={`/bo-suu-tap/${album.slug}`}
                  className="flex flex-col h-full bg-white p-4 rounded-2xl shadow-luxury hover:shadow-luxury-hover border border-champagne-dark/30 transition-all duration-300"
                >
                  <div className="relative aspect-[4/5] w-full rounded-xl overflow-hidden mb-4 bg-champagne-light">
                    {coverImg ? (
                      <Image
                        src={coverImg}
                        alt={album.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full bg-stone-100 flex items-center justify-center text-stone-300">
                        No Image
                      </div>
                    )}
                    <div className="absolute top-3 left-3 px-3 py-1 bg-charcoal-900/80 backdrop-blur-sm rounded-full text-[10px] tracking-widest uppercase text-champagne-light font-medium">
                      {album.concept}
                    </div>
                    <div className="absolute bottom-3 right-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[11px] font-mono text-charcoal-800">
                      {album.location}
                    </div>
                  </div>

                  <div className="space-y-1.5 px-2 pb-1 mt-auto">
                    <div className="flex items-center justify-between text-xs text-luxury-600">
                      <span className="font-medium tracking-wide">{album.coupleNames}</span>
                      <span className="text-charcoal-400 text-[11px] group-hover:text-luxury-600 transition-colors">
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
          <p className="text-xs uppercase tracking-[0.25em] text-[#C5A880] font-semibold">
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
