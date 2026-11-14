import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { getCachedAlbumBySlug, getCachedSystemSettings } from '@/lib/cached-queries';
import { formatDate } from '@/lib/utils';
import { ImageGalleryJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLdSchema';
import { AlbumMasonryGallery } from '@/components/albums/AlbumMasonryGallery';
import { AlbumVideoFacade } from '@/components/albums/AlbumVideoFacade';
import { ProtectedImage } from '@/components/common/ProtectedImage';
import { LinkedPackageCard } from '@/components/common/LinkedPackageCard';
import { MapPin, Calendar, Heart, ArrowLeft, Sparkles, Image as ImageIcon } from 'lucide-react';

const ConsultationForm = dynamic(
  () => import('@/components/home/ConsultationForm').then((mod) => mod.ConsultationForm),
  { ssr: false }
);

export const revalidate = 60;

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const album = await getCachedAlbumBySlug(params.slug);

  if (!album) {
    return { title: 'Không tìm thấy album | PlusMoments' };
  }

  const settings = await getCachedSystemSettings();
  const baseUrl = settings.canonicalBaseUrl || 'https://plusmoments.vn';
  const albumUrl = `${baseUrl}/bo-suu-tap/${album.slug}`;

  const title = album.metaTitle || `${album.title} - ${album.coupleNames} | PlusMoments`;
  const description =
    album.metaDescription ||
    album.subtitle ||
    `Chiêm ngưỡng bộ ảnh cưới ${album.title} của cặp đôi ${album.coupleNames} tại ${album.location} thực hiện bởi PlusMoments Studio.`;

  return {
    title,
    description,
    alternates: {
      canonical: albumUrl,
    },
    openGraph: {
      title,
      description,
      url: albumUrl,
      images: [
        {
          url: album.coverImage,
          width: 1200,
          height: 800,
          alt: album.title,
        },
      ],
      type: 'article',
      locale: 'vi_VN',
      siteName: settings.siteName,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [album.coverImage],
    },
  };
}

export default async function BoSuuTapDetailPage({ params }: Props) {
  const [album, settings] = await Promise.all([
    getCachedAlbumBySlug(params.slug),
    getCachedSystemSettings(),
  ]);

  if (!album) {
    notFound();
  }

  const baseUrl = settings.canonicalBaseUrl || 'https://plusmoments.vn';
  const albumUrl = `${baseUrl}/bo-suu-tap/${album.slug}`;

  return (
    <div className="pt-28 pb-24">
      {/* Schema.org BreadcrumbList & ImageGallery */}
      <BreadcrumbJsonLd
        items={[
          { name: 'Trang chủ', item: baseUrl },
          { name: 'Bộ Sưu Tập Cưới', item: `${baseUrl}/bo-suu-tap` },
          { name: album.title, item: albumUrl },
        ]}
      />
      <ImageGalleryJsonLd
        name={album.title}
        description={album.description || album.title}
        url={albumUrl}
        images={album.media.map((m) => ({
          url: m.url,
          caption: m.caption || m.altText,
          width: m.width,
          height: m.height,
        }))}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/bo-suu-tap"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-charcoal-500 hover:text-charcoal-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại tất cả bộ sưu tập</span>
          </Link>
        </div>

        {/* Album Header Info */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-champagne text-luxury-800 text-xs uppercase tracking-widest font-semibold">
            <span>{album.concept}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-light text-charcoal-900 leading-tight">
            {album.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-charcoal-600 font-light pt-2">
            <span className="flex items-center gap-1.5 font-medium text-luxury-700">
              <Heart className="w-3.5 h-3.5 fill-luxury-600 text-luxury-600" />
              {album.coupleNames}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-charcoal-500" />
              {album.location}
            </span>
            {album.shootingDate && (
              <span className="flex items-center gap-1.5 font-mono">
                <Calendar className="w-3.5 h-3.5 text-charcoal-500" />
                {formatDate(album.shootingDate)}
              </span>
            )}
            <span className="flex items-center gap-1.5 font-mono text-stone-600">
              <ImageIcon className="w-3.5 h-3.5" />
              {album.media.length} tác phẩm
            </span>
          </div>

          {album.description && (
            <p className="text-sm sm:text-base text-charcoal-700 leading-relaxed font-light pt-4 border-t border-champagne-dark/30 max-w-2xl mx-auto">
              {album.description}
            </p>
          )}
        </div>

        {/* 1. ALBUM COVER HERO - Full Aspect Ratio Preservation (Zero Cropping) */}
        {album.coverImage && (
          <div className="relative w-full max-w-5xl mx-auto flex items-center justify-center overflow-hidden rounded-3xl bg-stone-100/70 p-2 sm:p-4 border border-stone-200/80 shadow-2xl">
            {/* Ambient backdrop glow */}
            <img
              src={album.coverImage}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 -z-10 w-full h-full object-cover blur-2xl scale-110 opacity-25 pointer-events-none select-none"
            />

            {/* Pristine uncropped cover photo with Multi-Layer Copyright Defense */}
            <ProtectedImage
              src={album.coverImage}
              alt={album.title}
              priority
              sizes="(max-width: 1024px) 95vw, 1024px"
              watermark
              watermarkText="PlusMoments Photography"
              wrapperClassName="relative z-10 w-full max-h-[82vh] rounded-2xl shadow-xl transition-transform duration-700 hover:scale-[1.01] flex items-center justify-center"
              imageClassName="w-full h-auto max-h-[82vh] object-contain"
            />
          </div>
        )}

        {/* 2. CINEMATIC VIDEO HIGHLIGHT & TEASER (FACADE LAZY-LOADED) */}
        {album.videoUrl && (
          <div className="space-y-4 pt-6">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <span className="text-xs uppercase tracking-widest text-charcoal-600 font-semibold flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-luxury-600" />
                <span>Video Highlight & Teaser Cưới Điện Ảnh</span>
              </span>
              <span className="text-xs font-mono text-stone-600">
                Chất lượng 4K UltraHD
              </span>
            </div>
            <AlbumVideoFacade
              videoUrl={album.videoUrl}
              coverImage={album.coverImage}
              albumTitle={album.title}
            />
          </div>
        )}

        {/* 3. MASONRY GALLERY - Uncropped Portrait & Landscape Flow with Lightbox */}
        <div className="space-y-4 pt-6">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <span className="text-xs uppercase tracking-widest text-charcoal-600 font-semibold flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-luxury-600" />
              <span>Toàn Bộ Góc Ảnh Trong Album</span>
            </span>
            <span className="text-xs font-mono text-stone-600">
              Nhấp vào ảnh để xem chi tiết
            </span>
          </div>

          <AlbumMasonryGallery media={album.media} albumTitle={album.title} />
        </div>

        {/* LINKED PRICING PACKAGE (CROSS-SELL WIDGET) */}
        {album.package && (
          <div className="pt-8">
            <LinkedPackageCard
              packageData={album.package}
              badgeText="✨ BỘ ẢNH ĐƯỢC THỰC HIỆN VỚI GÓI"
            />
          </div>
        )}

        {/* 3. Consultation CTA tailored to this album */}
        <div className="pt-16 max-w-2xl mx-auto">
          <div className="bg-white border-2 border-champagne-gold/40 rounded-3xl p-8 sm:p-10 shadow-xl text-center space-y-4">
            <Sparkles className="w-8 h-8 text-luxury-500 mx-auto" />
            <h2 className="font-serif text-2xl sm:text-3xl font-light text-charcoal-900">
              Yêu Thích Phong Cách Này?
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-600 font-light leading-relaxed">
              Để lại thông tin để PlusMoments tư vấn địa điểm, lựa chọn trang phục cưới và báo giá chi tiết cho bộ ảnh tương tự.
            </p>
            <div className="pt-2">
              <ConsultationForm defaultPackage={album.concept} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

