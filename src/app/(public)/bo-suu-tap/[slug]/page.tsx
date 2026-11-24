import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { getCachedAlbumBySlug, getCachedAlbums, getCachedPackages, getCachedSystemSettings } from '@/lib/cached-queries';
import { formatDate, toAbsoluteUrl } from '@/lib/utils';
import { ImageGalleryJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLdSchema';
import { AlbumMasonryGallery } from '@/components/albums/AlbumMasonryGallery';
import { AlbumVideoFacade } from '@/components/albums/AlbumVideoFacade';
import { GoogleDriveVideoList, type GoogleDriveVideoItem } from '@/components/ui/GoogleDriveVideoPlayer';
import { ProtectedImage } from '@/components/common/ProtectedImage';
import { LinkedPackageCard } from '@/components/common/LinkedPackageCard';
import { AlbumLeftRail } from '@/components/albums/AlbumLeftRail';
import { AlbumRightRail } from '@/components/albums/AlbumRightRail';
import { EditorialReveal } from '@/components/ui/EditorialReveal';
import { ScrollProgressBar } from '@/components/ui/ScrollProgressBar';
import { FloatingStoryPill } from '@/components/ui/FloatingStoryPill';
import { NextStoryTeaser } from '@/components/common/NextStoryTeaser';
import { AlbumLeadTrigger } from '@/components/albums/AlbumLeadTrigger';
import { MapPin, Calendar, Heart, ArrowLeft, Sparkles, Image as ImageIcon } from 'lucide-react';
import { normalizeLocationLabel } from '@/lib/album-utils';
import { resolveMediaListDimensions, resolveImageDimension } from '@/lib/server-image-dimensions';

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

  const locationDisplay = normalizeLocationLabel(album.location);

  const title = album.metaTitle || `${album.title} - ${album.coupleNames} | PlusMoments`;
  const description =
    album.metaDescription ||
    album.subtitle ||
    `Chiêm ngưỡng bộ ảnh cưới ${album.title} của cặp đôi ${album.coupleNames} tại ${locationDisplay} thực hiện bởi PlusMoments Studio.`;

  const coverImageUrl = toAbsoluteUrl(album.coverImage, baseUrl);

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
          url: coverImageUrl,
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
      images: [coverImageUrl],
    },
  };
}

export default async function BoSuuTapDetailPage({ params }: Props) {
  const [album, allAlbums, allPackages, settings] = await Promise.all([
    getCachedAlbumBySlug(params.slug),
    getCachedAlbums(),
    getCachedPackages(),
    getCachedSystemSettings(),
  ]);

  if (!album) {
    notFound();
  }

  const baseUrl = settings.canonicalBaseUrl || 'https://plusmoments.vn';
  const albumUrl = `${baseUrl}/bo-suu-tap/${album.slug}`;

  // Find next album for the Next Story Teaser & Side Rail
  const currentIdx = allAlbums.findIndex((a) => a.slug === params.slug);
  const nextAlbum =
    allAlbums.length > 1
      ? allAlbums[(currentIdx + 1) % allAlbums.length]
      : null;

  // Resolve active package or fallback package with safe number serialization
  const rawPackage = album.package || allPackages[0] || null;
  const sideRailPackage = rawPackage
    ? {
        id: rawPackage.id,
        name: rawPackage.name,
        slug: rawPackage.slug,
        price: Number(rawPackage.price) || 0,
        originalPrice: rawPackage.originalPrice != null ? Number(rawPackage.originalPrice) : null,
        unit: rawPackage.unit || 'trọn gói',
        subtitle: rawPackage.subtitle,
        highlightPoints: rawPackage.highlightPoints,
        category: rawPackage.category,
      }
    : null;

  const sideRailNextStory = nextAlbum
    ? {
        title: nextAlbum.title,
        slug: nextAlbum.slug,
        coupleNames: nextAlbum.coupleNames,
        location: nextAlbum.location ? normalizeLocationLabel(nextAlbum.location) : null,
        concept: nextAlbum.concept,
        coverImage: nextAlbum.coverImage,
        categoryName: nextAlbum.concept || 'Album Mới',
      }
    : null;

  // Resolve true physical dimensions (portrait vs landscape) to eliminate jumping/resizing
  const resolvedMedia = await resolveMediaListDimensions(album.media);

  // Resolve coverImage true dimensions to adapt Hero layout
  const coverDimension = await resolveImageDimension(album.coverImage);
  const isCoverPortrait = coverDimension.orientation === 'portrait';

  return (
    <div className="pt-28 pb-24">
      {/* 1. EDITORIAL READING PROGRESS BAR */}
      <ScrollProgressBar targetContentId="album-gallery-content" />

      {/* 2. FLOATING STORY & CONSULTATION PILL */}
      <FloatingStoryPill
        title={album.title}
        type="album"
        conceptName={album.concept}
        targetFormId="consultation-section"
        targetContentId="album-gallery-content"
        targetCtaZoneId="linked-package-section"
      />

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
        images={resolvedMedia.map((m) => ({
          url: m.url,
          caption: m.caption || m.altText,
          width: m.width,
          height: m.height,
        }))}
      />

      {/* =========================================================================
          TẦNG 1: KHỐI HERO GIỚI THIỆU BỘ SƯU TẬP (NẰM TRÊN CÙNG, RỘNG RÃI MAX-W-5XL)
      ========================================================================= */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12 mb-12 sm:mb-16">
        {/* Album Header Info - Harmonious Editorial Header */}
        <EditorialReveal className="text-center max-w-3xl mx-auto">
          {/* Centered Back Link */}
          <div>
            <Link
              href="/bo-suu-tap"
              className="text-[11px] uppercase tracking-[0.2em] text-[#8C6D46] hover:opacity-75 mb-4 inline-flex items-center gap-1.5 transition-opacity"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Tất cả bộ sưu tập</span>
            </Link>
          </div>

          {/* Concept Badge */}
          {album.concept && (
            <div className="mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5EFEB] text-[#8C6D46] text-[11px] uppercase tracking-[0.18em] font-medium border border-[#E8DFD8]">
                <span>{album.concept}</span>
              </span>
            </div>
          )}

          {/* Refined Title */}
          <h1 className="font-serif font-normal text-3xl sm:text-4xl md:text-[42px] leading-[1.24] tracking-[-0.01em] text-[#1C1917] max-w-2xl mx-auto">
            {album.title}
          </h1>

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs tracking-wide text-[#78716C] pt-3">
            {album.coupleNames && (
              <span className="flex items-center gap-1.5 font-medium text-[#1C1917]">
                <Heart className="w-3 h-3 fill-rose-500/20 text-rose-500" />
                <span>{album.coupleNames}</span>
              </span>
            )}
            {album.coupleNames && <span>•</span>}
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-[#A8A29E]" />
              <span>{normalizeLocationLabel(album.location)}</span>
            </span>
            {album.shootingDate && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1.5 font-mono">
                  <Calendar className="w-3 h-3 text-[#A8A29E]" />
                  <span>{formatDate(album.shootingDate)}</span>
                </span>
              </>
            )}
            <span>•</span>
            <span className="flex items-center gap-1.5 font-mono text-[#78716C]">
              <ImageIcon className="w-3 h-3 text-[#A8A29E]" />
              <span>{album.media.length} tác phẩm</span>
            </span>
          </div>

          {/* Champagne Gold Divider Line */}
          <div className="w-12 h-[1px] bg-[#C5A059]/60 mx-auto my-6" aria-hidden="true" />

          {/* Magazine Editorial Story Description */}
          {album.description && (
            <p className="max-w-xl mx-auto text-[15px] leading-[1.85] text-[#57534E] font-normal">
              {album.description}
            </p>
          )}
        </EditorialReveal>

        {/* 1. ALBUM COVER HERO - Orientation-Aware Editorial Presentation (Zero Cropping) */}
        {album.coverImage && (
          isCoverPortrait ? (
            /* PORTRAIT COVER HERO: Focused Editorial Center Layout (Locked Aspect 3/4, Head/Face Preserved 100%) */
            <div className="relative w-full max-w-xl mx-auto flex items-center justify-center overflow-hidden rounded-3xl bg-stone-100/70 p-2 sm:p-4 border border-stone-200/80 shadow-2xl">
              {/* Ambient backdrop glow */}
              <img
                src={album.coverImage}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 -z-10 w-full h-full object-cover blur-2xl scale-110 opacity-30 pointer-events-none select-none"
              />

              {/* Pristine uncropped portrait cover photo */}
              <div className="relative z-10 w-full aspect-[3/4] max-h-[82vh] rounded-2xl overflow-hidden shadow-xl">
                <ProtectedImage
                  src={album.coverImage}
                  alt={album.title}
                  priority
                  objectPosition="object-[50%_18%]"
                  sizes="(max-width: 640px) 95vw, 560px"
                  watermark
                  watermarkText="PlusMoments Photography"
                  wrapperClassName="w-full h-full"
                  imageClassName="w-full h-full object-cover object-[50%_18%]"
                />
              </div>
            </div>
          ) : (
            /* LANDSCAPE COVER HERO: Wide Cinema Layout (Locked Aspect 3/2 or 16/9, No Clipping) */
            <div className="relative w-full max-w-5xl mx-auto flex items-center justify-center overflow-hidden rounded-3xl bg-stone-100/70 p-2 sm:p-4 border border-stone-200/80 shadow-2xl">
              {/* Ambient backdrop glow */}
              <img
                src={album.coverImage}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 -z-10 w-full h-full object-cover blur-2xl scale-110 opacity-25 pointer-events-none select-none"
              />

              {/* Pristine uncropped landscape cover photo */}
              <ProtectedImage
                src={album.coverImage}
                alt={album.title}
                priority
                objectPosition="object-center"
                sizes="(max-width: 1024px) 95vw, 1024px"
                watermark
                watermarkText="PlusMoments Photography"
                wrapperClassName="relative z-10 w-full max-h-[82vh] rounded-2xl shadow-xl transition-transform duration-700 hover:scale-[1.01] flex items-center justify-center"
                imageClassName="w-full h-auto max-h-[82vh] object-contain"
              />
            </div>
          )
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
      </div>

      {/* =========================================================================
          TẦNG 2: BỐ CỤC 3 CỘT (CỘT TRÁI: GÓI DỊCH VỤ - CỘT GIỮA: LƯỚI ẢNH - CỘT PHẢI: TIẾP THEO)
      ========================================================================= */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 xl:grid-cols-[230px_minmax(0,1fr)_230px] gap-8 items-start">
          {/* CỘT 1 (BÊN TRÁI): Gói Thực Hiện (Sticky top-28, tự ẩn khi cuộn tới bottom package) */}
          <AlbumLeftRail
            packageData={sideRailPackage}
            targetBottomSectionId="linked-package-section"
          />

          {/* CỘT 2 (Ở GIỮA): Toàn Bộ Góc Ảnh Trong Album */}
          <main className="min-w-0 space-y-12">
            <div id="album-gallery-content" className="space-y-12">
              {/* THƯỚC PHIM KỶ NIỆM (WEDDING FILM) - GOOGLE DRIVE VIDEOS */}
              {(album as any).videoLinks && Array.isArray((album as any).videoLinks) && (album as any).videoLinks.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                    <span className="text-xs uppercase tracking-widest text-[#1C1917] font-semibold flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#8C6D46]" />
                      <span>Thước Phim Kỷ Niệm (Wedding Film)</span>
                    </span>
                    <span className="text-xs font-mono text-stone-500">
                      Phim cưới & Highlight
                    </span>
                  </div>

                  <GoogleDriveVideoList
                    videos={(album as any).videoLinks}
                    coverImage={album.coverImage}
                  />
                </section>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                  <span className="text-xs uppercase tracking-widest text-charcoal-600 font-semibold flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-luxury-600" />
                    <span>Toàn Bộ Góc Ảnh Trong Album</span>
                  </span>
                  <span className="text-xs font-mono text-stone-600">
                    Nhấp vào ảnh để xem chi tiết
                  </span>
                </div>

                <AlbumMasonryGallery media={resolvedMedia} albumTitle={album.title} />

                {/* Sentinel and Trigger for 100% completion popup */}
                <AlbumLeadTrigger
                  slug={album.slug}
                  albumTitle={album.title}
                  conceptName={album.concept}
                  targetContentId="album-gallery-content"
                />
              </div>
            </div>

            {/* LINKED PRICING PACKAGE (CROSS-SELL WIDGET DÀNH CHO CẢ MOBILE LẪN DESKTOP) */}
            <div id="linked-package-section" className="pt-8">
              {album.package ? (
                <LinkedPackageCard
                  packageData={album.package}
                  badgeText="✨ BỘ ẢNH ĐƯỢC THỰC HIỆN VỚI GÓI"
                />
              ) : rawPackage ? (
                <LinkedPackageCard
                  packageData={sideRailPackage as any}
                  badgeText="✨ GÓI CHỤP GỢI Ý CHO PHONG CÁCH NÀY"
                />
              ) : null}
            </div>

            {/* NEXT STORY TEASER (HIỂN THỊ DƯỚI ĐÁY CHO CẢ MOBILE & TABLET) */}
            {nextAlbum && (
              <div className="pt-4">
                <NextStoryTeaser
                  type="album"
                  title={nextAlbum.title}
                  subtitle={nextAlbum.subtitle || nextAlbum.description}
                  coverImage={nextAlbum.coverImage}
                  href={`/bo-suu-tap/${nextAlbum.slug}`}
                  badge={nextAlbum.concept}
                  coupleNames={nextAlbum.coupleNames}
                />
              </div>
            )}

            {/* Consultation CTA tailored to this album */}
            <EditorialReveal id="consultation-section" className="pt-16 max-w-2xl mx-auto">
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
            </EditorialReveal>
          </main>

          {/* CỘT 3 (BÊN PHẢI): Câu Chuyện Kế Tiếp (Sticky top-28, chỉ hiện trên Desktop xl) */}
          <AlbumRightRail nextStory={sideRailNextStory} />
        </div>
      </div>
    </div>
  );
}

