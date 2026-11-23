import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getCachedAlbums, getCachedSystemSettings } from '@/lib/cached-queries';
import dynamic from 'next/dynamic';
import { PortfolioGalleryGrid } from '@/components/albums/PortfolioGalleryGrid';
import { serializeAlbumForClient } from '@/lib/album-utils';
import { ImageGalleryJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLdSchema';
import { toAbsoluteUrl } from '@/lib/utils';
import { EditorialReveal } from '@/components/ui/EditorialReveal';
import { ScrollCue } from '@/components/ui/ScrollCue';
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

  const ogImageUrl = toAbsoluteUrl(settings.defaultOgImage, baseUrl);

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
          url: ogImageUrl,
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
      images: [ogImageUrl],
    },
  };
}

export default async function BoSuuTapPage() {
  const [allAlbums, settings] = await Promise.all([
    getCachedAlbums(),
    getCachedSystemSettings(),
  ]);

  const baseUrl = settings.canonicalBaseUrl || 'https://plusmoments.vn';

  // Serialize albums into plain objects for Client Component (100% null-safe & primitives only)
  const serializedAlbums = allAlbums
    .map((a) => serializeAlbumForClient(a))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

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
    <div className="pt-24 sm:pt-32 pb-16 sm:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-12">
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
      <EditorialReveal className="text-center max-w-3xl mx-auto space-y-2.5 sm:space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full border border-stone-200 bg-stone-50/80 backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
          <span className="text-[10px] sm:text-[11px] font-sans tracking-[0.25em] text-stone-600 uppercase font-medium">
            Portfolio & Lookbook
          </span>
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-light text-charcoal-900 tracking-tight">
          Bộ Sưu Tập Ảnh Cưới
        </h1>

        <p className="text-xs sm:text-base text-charcoal-600 font-light leading-relaxed max-w-2xl mx-auto line-clamp-2 sm:line-clamp-none">
          Nơi lưu giữ những nụ cười rạng rỡ và cảm xúc thuần khiết của hàng trăm cặp đôi qua ngôn ngữ ánh sáng điện ảnh tinh tế.
        </p>

        <div className="pt-3">
          <ScrollCue label="CUỘN ĐỂ KHÁM PHÁ" variant="light" targetId="portfolio-filter-grid" />
        </div>
      </EditorialReveal>

      {/* CLEAN EDITORIAL LOOKBOOK GALLERY GRID */}
      <div id="portfolio-filter-grid">
        <PortfolioGalleryGrid albums={serializedAlbums} />
      </div>

      {/* CONSULTATION CTA SECTION */}
      <EditorialReveal className="pt-12 border-t border-stone-200/60">
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
      </EditorialReveal>
    </div>
  );
}

