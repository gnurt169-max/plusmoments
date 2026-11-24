import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCachedBlogBySlug, getCachedBlogs, getCachedSystemSettings } from '@/lib/cached-queries';
import { formatDate, toAbsoluteUrl } from '@/lib/utils';
import { ConsultationForm } from '@/components/home/ConsultationForm';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLdSchema';
import { ProtectedImage } from '@/components/common/ProtectedImage';
import { SafeImage } from '@/components/common/SafeImage';
import { LinkedPackageCard } from '@/components/common/LinkedPackageCard';
import { isOptimizedUploadWebp } from '@/lib/image-utils';
import { ArrowLeft, Clock, Calendar, User, Sparkles, Images } from 'lucide-react';
import DOMPurify from 'isomorphic-dompurify';
import { ProgressiveImage } from '@/components/ui/ProgressiveImage';
import { ScrollProgressBar } from '@/components/ui/ScrollProgressBar';
import { FloatingStoryPill } from '@/components/ui/FloatingStoryPill';
import { NextStoryTeaser } from '@/components/common/NextStoryTeaser';
import { GoogleDriveVideoList, type GoogleDriveVideoItem } from '@/components/ui/GoogleDriveVideoPlayer';
import { resolveMediaListDimensions } from '@/lib/server-image-dimensions';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getCachedBlogBySlug(params.slug);

  if (!post) {
    return { title: 'Không tìm thấy bài viết | PlusMoments' };
  }

  const settings = await getCachedSystemSettings();
  const baseUrl = settings.canonicalBaseUrl || 'https://plusmoments.vn';
  const postUrl = `${baseUrl}/blog/${post.slug}`;

  const title = post.metaTitle || `${post.title} | PlusMoments Blog`;
  const description = post.metaDescription || post.summary;

  const coverImageUrl = toAbsoluteUrl(post.coverImage, baseUrl);

  return {
    title,
    description,
    alternates: {
      canonical: postUrl,
    },
    openGraph: {
      title,
      description,
      url: postUrl,
      images: [{ url: coverImageUrl, width: 1200, height: 630 }],
      type: 'article',
      publishedTime: new Date(post.publishedAt).toISOString(),
      authors: [post.author],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [coverImageUrl],
    },
  };
}

function formatHtmlOrMarkdown(raw: string): string {
  if (!raw) return '';
  let str = raw.trim();

  // If text does not contain HTML tags, convert basic markdown formatting into HTML
  const hasHtml = /<[a-z][\s\S]*>/i.test(str);
  if (!hasHtml) {
    // Markdown headers
    str = str.replace(/^### (.*$)/gim, '<h3 class="font-serif text-xl sm:text-2xl font-light text-charcoal-900 mt-6 mb-3">$1</h3>');
    str = str.replace(/^## (.*$)/gim, '<h2 class="font-serif text-2xl sm:text-3xl font-light text-charcoal-900 mt-8 mb-4 border-b border-stone-200/60 pb-2">$1</h2>');
    str = str.replace(/^# (.*$)/gim, '<h2 class="font-serif text-3xl sm:text-4xl font-light text-charcoal-900 mt-8 mb-4">$1</h2>');

    // Bold & italic
    str = str.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-charcoal-900">$1</strong>');
    str = str.replace(/\*(.*?)\*/g, '<em class="italic text-charcoal-800">$1</em>');

    // Bullet lists
    str = str.replace(/^\s*[-*]\s+(.*$)/gim, '<li class="my-1 text-stone-700 leading-relaxed">$1</li>');
    str = str.replace(/((?:<li.*<\/li>\s*)+)/gim, '<ul class="list-disc pl-5 my-4 space-y-1.5 text-stone-700">$1</ul>');

    // Paragraphs
    const paras = str.split(/\n\s*\n/);
    str = paras
      .map((p) => {
        const trimmed = p.trim();
        if (!trimmed) return '';
        if (trimmed.startsWith('<h') || trimmed.startsWith('<ul') || trimmed.startsWith('<ol')) {
          return trimmed;
        }
        return `<p class="text-stone-700 leading-relaxed mb-5 font-light text-base sm:text-[17px]">${trimmed.replace(/\n/g, '<br/>')}</p>`;
      })
      .join('\n');
  } else {
    // Enhance existing HTML tags with luxurious styling classes
    str = str
      .replace(/<h2>/gi, '<h2 class="font-serif text-2xl sm:text-3xl font-light text-charcoal-900 mt-8 mb-4 border-b border-stone-200/60 pb-2">')
      .replace(/<h3>/gi, '<h3 class="font-serif text-xl sm:text-2xl font-light text-charcoal-900 mt-6 mb-3">')
      .replace(/<p>/gi, '<p class="text-stone-700 leading-relaxed mb-5 font-light text-base sm:text-[17px]">')
      .replace(/<ul>/gi, '<ul class="list-disc pl-5 my-4 space-y-1.5 text-stone-700">')
      .replace(/<ol>/gi, '<ol class="list-decimal pl-5 my-4 space-y-1.5 text-stone-700">')
      .replace(/<li>/gi, '<li class="my-1 leading-relaxed">');
  }

  return str;
}

function renderContentWithImages(
  content: string,
  images: Array<{
    id: string;
    url: string;
    alt: string | null;
    caption: string | null;
    orderIndex: number;
    width?: number | null;
    height?: number | null;
    orientation?: 'landscape' | 'portrait';
  }>,
  postTitle: string
) {
  const usedIndices = new Set<number>();
  const pattern = /(?:\[image:(\d+)\])|(?:!\[(.*?)\]\((.*?)\))/g;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(content)) !== null) {
    const textBefore = content.substring(lastIndex, match.index);
    if (textBefore.trim()) {
      parts.push(
        <div
          key={`text-${lastIndex}`}
          className="prose prose-stone max-w-none text-charcoal-800 leading-relaxed font-light"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formatHtmlOrMarkdown(textBefore)) }}
        />
      );
    }

    if (match[1] !== undefined) {
      const num = parseInt(match[1], 10);
      const imgIdx = num - 1;
      const targetImg = images[imgIdx];

      if (targetImg) {
        usedIndices.add(imgIdx);
        const isPortrait = targetImg.orientation === 'portrait';
        parts.push(
          <figure
            key={`sc-img-${match.index}`}
            className="my-6 flex flex-col items-center w-full break-inside-avoid"
          >
            <div className={`w-full ${isPortrait ? 'max-w-md sm:max-w-lg' : 'max-w-3xl'}`}>
              <ProgressiveImage
                src={targetImg.url}
                alt={targetImg.alt || postTitle}
                orientation={targetImg.orientation}
                aspectRatio={isPortrait ? '3/4' : '3/2'}
                aspectClassName={isPortrait ? 'aspect-[3/4]' : 'aspect-[3/2]'}
                priority={false}
                watermark
                watermarkText="PlusMoments Photography"
                className="rounded-2xl border border-[#E8E2D9] shadow-sm"
                imageClassName="w-full h-full object-cover block"
              />
            </div>
            {targetImg.caption && (
              <figcaption className="mt-3 text-center text-xs sm:text-sm text-[#78716C] italic font-serif max-w-xl px-4">
                {targetImg.caption}
              </figcaption>
            )}
          </figure>
        );
      }
    } else if (match[2] !== undefined && match[3] !== undefined) {
      const mdAlt = match[2];
      const mdUrl = match[3];
      parts.push(
        <figure
          key={`md-img-${match.index}`}
          className="my-6 flex flex-col items-center w-full break-inside-avoid"
        >
          <div className="w-full max-w-3xl">
            <ProgressiveImage
              src={mdUrl}
              alt={mdAlt || postTitle}
              orientation="landscape"
              aspectRatio="3/2"
              aspectClassName="aspect-[3/2]"
              priority={false}
              watermark
              watermarkText="PlusMoments Photography"
              className="rounded-2xl border border-[#E8E2D9] shadow-sm"
              imageClassName="w-full h-full object-cover block"
            />
          </div>
          {mdAlt && (
            <figcaption className="mt-3 text-center text-xs sm:text-sm text-[#78716C] italic font-serif max-w-xl px-4">
              {mdAlt}
            </figcaption>
          )}
        </figure>
      );
    }

    lastIndex = pattern.lastIndex;
  }

  const remainingText = content.substring(lastIndex);
  if (remainingText.trim()) {
    parts.push(
      <div
        key={`text-${lastIndex}`}
        className="prose prose-stone max-w-none text-charcoal-800 leading-relaxed font-light"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formatHtmlOrMarkdown(remainingText)) }}
      />
    );
  }

  return { parts, usedIndices };
}

interface BlogImageItem {
  id: string;
  url: string;
  alt: string | null;
  caption: string | null;
  orientation?: 'landscape' | 'portrait';
}

function renderBlogFigureCard(
  img: BlogImageItem,
  aspectClass: string,
  wrapperClass: string = 'w-full',
  isPriority: boolean = false
) {
  const isPortrait = img.orientation === 'portrait';
  const resolvedAspect = aspectClass || (isPortrait ? 'aspect-[3/4]' : 'aspect-[3/2]');

  return (
    <figure className={`flex flex-col items-center ${wrapperClass} overflow-hidden my-3 sm:my-4`}>
      <ProgressiveImage
        src={img.url}
        alt={img.alt || 'Hình ảnh phóng sự cưới'}
        orientation={img.orientation}
        aspectRatio={resolvedAspect.includes('3/4') ? '3/4' : '3/2'}
        aspectClassName={resolvedAspect}
        priority={isPriority}
        watermark
        watermarkText="PlusMoments Photography"
        className="rounded-2xl border border-[#E8E2D9] shadow-sm"
        imageClassName="w-full h-full object-cover block"
      />
      {img.caption && (
        <figcaption className="mt-2.5 sm:mt-3 text-center text-xs sm:text-sm text-[#78716C] italic font-serif max-w-xl px-4 leading-relaxed">
          {img.caption}
        </figcaption>
      )}
    </figure>
  );
}

function renderBalancedBlogImageSection(images: BlogImageItem[]) {
  const rows: Array<
    | { type: 'pair-portrait'; items: [BlogImageItem, BlogImageItem] }
    | { type: 'pair-landscape'; items: [BlogImageItem, BlogImageItem] }
    | { type: 'single-portrait'; items: [BlogImageItem] }
    | { type: 'single-landscape'; items: [BlogImageItem] }
  > = [];

  let i = 0;
  while (i < images.length) {
    const current = images[i];
    const next = images[i + 1];

    if (next && next.orientation === current.orientation) {
      if (current.orientation === 'portrait') {
        rows.push({ type: 'pair-portrait', items: [current, next] });
      } else {
        rows.push({ type: 'pair-landscape', items: [current, next] });
      }
      i += 2;
    } else {
      if (current.orientation === 'portrait') {
        rows.push({ type: 'single-portrait', items: [current] });
      } else {
        rows.push({ type: 'single-landscape', items: [current] });
      }
      i += 1;
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 pt-4 [overflow-anchor:none]">
      {rows.map((row, rowIdx) => {
        if (row.type === 'pair-portrait') {
          return (
            <div
              key={`row-pair-port-${rowIdx}-${row.items[0].id}`}
              className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6 items-start"
            >
              {row.items.map((img) => renderBlogFigureCard(img, 'aspect-[3/4]', 'w-full'))}
            </div>
          );
        }

        if (row.type === 'pair-landscape') {
          return (
            <div
              key={`row-pair-land-${rowIdx}-${row.items[0].id}`}
              className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 items-start"
            >
              {row.items.map((img) => renderBlogFigureCard(img, 'aspect-[3/2]', 'w-full'))}
            </div>
          );
        }

        if (row.type === 'single-portrait') {
          return (
            <div
              key={`row-single-port-${rowIdx}-${row.items[0].id}`}
              className="flex justify-center"
            >
              {renderBlogFigureCard(
                row.items[0],
                'aspect-[3/4]',
                'w-full max-w-[460px] mx-auto'
              )}
            </div>
          );
        }

        // single-landscape
        return (
          <div
            key={`row-single-land-${rowIdx}-${row.items[0].id}`}
            className="w-full flex justify-center"
          >
            {renderBlogFigureCard(
              row.items[0],
              'aspect-[3/2]',
              'w-full max-w-4xl mx-auto'
            )}
          </div>
        );
      })}
    </div>
  );
}

export default async function BlogPostPage({ params }: Props) {
  const [post, allBlogs, settings] = await Promise.all([
    getCachedBlogBySlug(params.slug),
    getCachedBlogs(),
    getCachedSystemSettings(),
  ]);

  if (!post) {
    notFound();
  }

  const baseUrl = settings.canonicalBaseUrl || 'https://plusmoments.vn';
  const postUrl = `${baseUrl}/blog/${post.slug}`;

  // Find next blog post for Next Story Teaser
  const currentIdx = allBlogs.findIndex((b) => b.slug === params.slug);
  const nextPost =
    allBlogs.length > 1
      ? allBlogs[(currentIdx + 1) % allBlogs.length]
      : null;

  const resolvedImages = await resolveMediaListDimensions(post.images || []);

  const { parts: renderedContent, usedIndices } = renderContentWithImages(
    post.content,
    resolvedImages,
    post.title
  );

  const unusedImages = resolvedImages.filter((_, idx) => !usedIndices.has(idx));

  // Article JSON-LD with absolute image URL for 100% Google Rich Results validation
  const absoluteCoverImage = post.coverImage
    ? post.coverImage.startsWith('http')
      ? post.coverImage
      : `https://plusmoments.vn${post.coverImage.startsWith('/') ? '' : '/'}${post.coverImage}`
    : undefined;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.summary,
    image: absoluteCoverImage,
    datePublished: new Date(post.publishedAt).toISOString(),
    dateModified: new Date(post.updatedAt).toISOString(),
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: settings.siteName,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
  };

  return (
    <article className="pt-32 pb-24">
      {/* 1. EDITORIAL READING PROGRESS BAR */}
      <ScrollProgressBar targetContentId="blog-body-content" />

      {/* 2. FLOATING STORY & CONSULTATION PILL */}
      <FloatingStoryPill
        title={post.title}
        type="blog"
        conceptName={post.category || undefined}
        targetFormId="consultation-section"
        targetContentId="blog-body-content"
        targetCtaZoneId={post.package ? 'linked-package-section' : 'consultation-section'}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Trang chủ', item: baseUrl },
          { name: 'Cẩm Nang Cưới', item: `${baseUrl}/blog` },
          { name: post.title, item: postUrl },
        ]}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-charcoal-500 hover:text-charcoal-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại cẩm nang cưới</span>
          </Link>
        </div>

        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-champagne text-luxury-800 text-xs uppercase tracking-widest font-semibold">
            {post.category}
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-light text-charcoal-900 leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center justify-center gap-6 text-xs text-charcoal-500 font-mono pt-2">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-luxury-500" />
              {post.author}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-luxury-500" />
              {formatDate(post.publishedAt)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-luxury-500" />
              {post.readingMinutes} phút đọc
            </span>
          </div>
        </div>

        {/* Featured Cover Image */}
        <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden shadow-luxury bg-[#FAF8F5]">
          <ProgressiveImage
            src={post.coverImage || ''}
            alt={post.title}
            priority={true}
            aspectRatio="16/9"
            aspectClassName="aspect-[16/9]"
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="w-full h-full"
            imageClassName="w-full h-full object-cover"
          />
        </div>

        {/* Body Content & Story Gallery in Scoped Reading Container */}
        <div id="blog-body-content" className="space-y-10">
          <div className="prose prose-stone max-w-none text-charcoal-800 leading-relaxed font-light space-y-6 pt-4 text-sm sm:text-base">
            <p className="font-serif text-lg sm:text-xl font-normal text-charcoal-900 italic border-l-2 border-luxury-500 pl-4 py-1">
              {post.summary}
            </p>

            {/* VIDEO ĐÍNH KÈM TRONG BÀI VIẾT (GOOGLE DRIVE VIDEOS) */}
            {(post as any).videoLinks && Array.isArray((post as any).videoLinks) && (post as any).videoLinks.length > 0 && (
              <div className="not-prose my-8 space-y-4">
                <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                  <span className="text-xs uppercase tracking-widest text-[#1C1917] font-semibold flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#8C6D46]" />
                    <span>Video Đính Kèm Trong Bài Viết</span>
                  </span>
                  <span className="text-xs font-mono text-stone-500">
                    Google Drive Player
                  </span>
                </div>

                <GoogleDriveVideoList
                  videos={(post as any).videoLinks}
                  coverImage={post.coverImage}
                />
              </div>
            )}

            <div className="space-y-6">
              {renderedContent}
            </div>
          </div>

          {/* Unplaced Images / Story Gallery */}
          {unusedImages.length > 0 && (
            <section className="pt-10 mt-10 border-t border-champagne-dark/30 space-y-6">
              <div className="text-center space-y-1">
                <div className="inline-flex items-center gap-1.5 text-luxury-600 text-xs uppercase tracking-widest font-semibold">
                  <Images className="w-4 h-4" />
                  <span>Bộ Sưu Tập Phóng Sự</span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-light text-charcoal-900">
                  Khoảnh Khắc Trong Bài Viết
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 font-light">
                  Các khung hình trọn vẹn trong buổi chụp
                </p>
              </div>

              {renderBalancedBlogImageSection(unusedImages)}
            </section>
          )}
        </div>

        {/* LINKED PRICING PACKAGE (CROSS-SELL WIDGET) */}
        {post.package && (
          <div id="linked-package-section" className="pt-8">
            <LinkedPackageCard
              packageData={post.package}
              badgeText="✨ GÓI DỊCH VỤ ĐỀ XUẤT TRONG BÀI VIẾT"
            />
          </div>
        )}

        {/* 3. NEXT STORY TEASER (HÀNH TRÌNH TIẾP THEO) */}
        {nextPost && (
          <NextStoryTeaser
            type="blog"
            title={nextPost.title}
            subtitle={nextPost.summary}
            coverImage={nextPost.coverImage}
            href={`/blog/${nextPost.slug}`}
            badge={nextPost.category}
          />
        )}

        {/* 4. Bottom Consultation Box */}
        <div id="consultation-section" className="pt-12 border-t border-champagne-dark/30">
          <div className="bg-white border-2 border-champagne-gold/40 rounded-3xl p-8 sm:p-10 shadow-lg text-center space-y-4">
            <Sparkles className="w-8 h-8 text-luxury-500 mx-auto" />
            <h2 className="font-serif text-2xl font-light text-charcoal-900">
              Bạn Đang Chuẩn Bị Cho Ngày Cưới?
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-600 font-light max-w-md mx-auto">
              Đừng ngần ngại để lại thông tin để chuyên gia của PlusMoments hỗ trợ bạn lên ý tưởng concept và lộ trình chụp ảnh trọn vẹn nhất.
            </p>
            <div className="pt-2 max-w-xl mx-auto">
              <ConsultationForm />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

