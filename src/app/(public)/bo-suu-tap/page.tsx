import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getCachedAlbums, getCachedSystemSettings } from '@/lib/cached-queries';
import dynamic from 'next/dynamic';
import { PortfolioDualFilter } from '@/components/albums/PortfolioDualFilter';
import { ImageGalleryJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLdSchema';
import { Sparkles, ArrowRight } from 'lucide-react';

const ConsultationForm = dynamic(
  () => import('@/components/home/ConsultationForm').then((mod) => mod.ConsultationForm),
  { ssr: false }
);

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getCachedSystemSettings();
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
      siteName: settings.siteName || 'PlusMoments Wedding Pictures & Films',
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
  searchParams: { concept?: string; category?: string; location?: string };
}) {
  const selectedConcept = searchParams.category || searchParams.concept;
  const selectedLocation = searchParams.location;

  const [allAlbums, settings] = await Promise.all([
    getCachedAlbums(),
    getCachedSystemSettings(),
  ]);

  const baseUrl = settings.canonicalBaseUrl || 'https://plusmoments.vn';

  // Serialize albums into plain objects for Client Component
  const serializedAlbums = allAlbums.map((a) => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    subtitle: a.subtitle,
    description: a.description,
    coupleNames: a.coupleNames,
    concept: (a as any).category?.trim() || a.concept?.trim(),
    location: a.location,
    coverImage: a.coverImage,
    videoUrl: (a as any).videoUrl || null,
    blurDataUrl: (a as any).blurDataUrl || null,
  }));

  // Prepare images for ImageGallery Schema.org
  const galleryImages = serializedAlbums
    .filter((a) => a.coverImage)
    .map((a) => ({
      url: a.coverImage!,
      caption: `${a.title} - ${a.coupleNames} (${a.location})`,
      width: 1200,
      height: 800,
    }));

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
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

      {/* DUAL INTERACTIVE FILTER & GALLERY GRID */}
      <PortfolioDualFilter
        albums={serializedAlbums}
        initialConcept={selectedConcept || 'Tất Cả'}
        initialLocation={selectedLocation || 'Tất Cả'}
      />

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

