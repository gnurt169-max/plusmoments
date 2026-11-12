import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { getSystemSettings } from '@/lib/settings';
import { formatDate } from '@/lib/utils';
import { ConsultationForm } from '@/components/home/ConsultationForm';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLdSchema';
import { ProtectedImage } from '@/components/common/ProtectedImage';
import { LinkedPackageCard } from '@/components/common/LinkedPackageCard';
import { isOptimizedUploadWebp } from '@/lib/image-utils';
import { ArrowLeft, Clock, Calendar, User, Sparkles, Images } from 'lucide-react';
import DOMPurify from 'isomorphic-dompurify';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug },
  });

  if (!post) {
    return { title: 'Không tìm thấy bài viết | PlusMoments' };
  }

  const settings = await getSystemSettings();
  const baseUrl = settings.canonicalBaseUrl || 'https://plusmoments.vn';
  const postUrl = `${baseUrl}/blog/${post.slug}`;

  const title = post.metaTitle || `${post.title} | PlusMoments Blog`;
  const description = post.metaDescription || post.summary;

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
      images: [{ url: post.coverImage, width: 1200, height: 630 }],
      type: 'article',
      publishedTime: post.publishedAt.toISOString(),
      authors: [post.author],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [post.coverImage],
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
  images: Array<{ id: string; url: string; alt: string | null; caption: string | null; orderIndex: number }>,
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
        parts.push(
          <figure
            key={`sc-img-${match.index}`}
            className="my-6 flex flex-col items-center w-full"
          >
            <div className="relative w-full max-w-3xl rounded-2xl overflow-hidden bg-[#FAF8F5] border border-[#E8E2D9] shadow-sm">
              <ProtectedImage
                src={targetImg.url}
                alt={targetImg.alt || postTitle}
                loading="lazy"
                decoding="async"
                watermark
                watermarkText="PlusMoments Photography"
                imageClassName="w-full h-auto object-cover block transition duration-300 hover:scale-[1.01]"
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
          className="my-6 flex flex-col items-center w-full"
        >
          <div className="relative w-full max-w-3xl rounded-2xl overflow-hidden bg-[#FAF8F5] border border-[#E8E2D9] shadow-sm">
            <ProtectedImage
              src={mdUrl}
              alt={mdAlt || postTitle}
              loading="lazy"
              decoding="async"
              watermark
              watermarkText="PlusMoments Photography"
              imageClassName="w-full h-auto object-cover block transition duration-300 hover:scale-[1.01]"
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

export default async function BlogPostPage({ params }: Props) {
  const [post, settings] = await Promise.all([
    prisma.blogPost.findUnique({
      where: { slug: params.slug },
      include: {
        package: true,
        images: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    }),
    getSystemSettings(),
  ]);

  if (!post) {
    notFound();
  }

  const baseUrl = settings.canonicalBaseUrl || 'https://plusmoments.vn';
  const postUrl = `${baseUrl}/blog/${post.slug}`;

  const { parts: renderedContent, usedIndices } = renderContentWithImages(
    post.content,
    post.images || [],
    post.title
  );

  const unusedImages = (post.images || []).filter((_, idx) => !usedIndices.has(idx));

  // Article JSON-LD
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.summary,
    image: post.coverImage,
    datePublished: post.publishedAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
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
        <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden shadow-luxury bg-champagne-light">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover"
          />
        </div>

        {/* Body Content */}
        <div className="prose prose-stone max-w-none text-charcoal-800 leading-relaxed font-light space-y-6 pt-4 text-sm sm:text-base">
          <p className="font-serif text-lg sm:text-xl font-normal text-charcoal-900 italic border-l-2 border-luxury-500 pl-4 py-1">
            {post.summary}
          </p>

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start pt-4">
              {unusedImages.map((img, i) => (
                <figure
                  key={img.id || i}
                  className="flex flex-col items-center w-full"
                >
                  <div className="relative w-full rounded-2xl overflow-hidden bg-[#FAF8F5] border border-[#E8E2D9] shadow-sm">
                    <ProtectedImage
                      src={img.url}
                      alt={img.alt || `${post.title} - Ảnh ${i + 1}`}
                      loading="lazy"
                      decoding="async"
                      watermark
                      watermarkText="PlusMoments Photography"
                      imageClassName="w-full h-auto object-cover block transition duration-300 hover:scale-[1.01]"
                    />
                  </div>
                  {img.caption && (
                    <figcaption className="mt-3 text-center text-xs sm:text-sm text-[#78716C] italic font-serif max-w-xl px-4">
                      {img.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </section>
        )}

        {/* LINKED PRICING PACKAGE (CROSS-SELL WIDGET) */}
        {post.package && (
          <div className="pt-8">
            <LinkedPackageCard
              packageData={post.package}
              badgeText="✨ GÓI DỊCH VỤ ĐỀ XUẤT TRONG BÀI VIẾT"
            />
          </div>
        )}

        {/* Bottom Consultation Box */}
        <div className="pt-12 border-t border-champagne-dark/30">
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

