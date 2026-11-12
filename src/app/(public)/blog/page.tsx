import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { getSystemSettings } from '@/lib/settings';
import { formatDate } from '@/lib/utils';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLdSchema';
import { isOptimizedUploadWebp } from '@/lib/image-utils';
import { Clock, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Cẩm Nang Cưới & Kinh Nghiệm Chụp Ảnh | PlusMoments Blog',
  description:
    'Chia sẻ kinh nghiệm chụp ảnh cưới ngoại cảnh, chọn váy cưới phù hợp vóc dáng, bí quyết chuẩn bị đám cưới hoàn hảo từ PlusMoments Studio.',
};

export default async function BlogPage() {
  const [posts, settings] = await Promise.all([
    prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
    }),
    getSystemSettings(),
  ]);

  const baseUrl = settings.canonicalBaseUrl || 'https://plusmoments.vn';

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Schema.org BreadcrumbList */}
      <BreadcrumbJsonLd
        items={[
          { name: 'Trang chủ', item: baseUrl },
          { name: 'Cẩm Nang Cưới', item: `${baseUrl}/blog` },
        ]}
      />
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <p className="text-xs uppercase tracking-[0.25em] text-luxury-600 font-semibold">
          Kinh Nghiệm & Cảm Hứng
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl font-light text-charcoal-900">
          Cẩm Nang Cưới PlusMoments
        </h1>
        <p className="text-sm text-charcoal-600 font-light leading-relaxed">
          Tất cả những bí quyết bỏ túi giúp hai bạn chuẩn bị cho buổi chụp ảnh cưới và ngày hôn lễ trọn vẹn nhất.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => {
          const coverImg =
            post.coverImage && post.coverImage.trim()
              ? post.coverImage
              : '';

          return (
            <article
              key={post.id}
              className="bg-white rounded-2xl overflow-hidden border border-champagne-dark/30 shadow-luxury hover:shadow-luxury-hover transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-champagne-light">
                  <Image
                    src={coverImg || '/placeholder.jpg'}
                    alt={post.title}
                    fill
                    quality={70}
                    unoptimized={isOptimizedUploadWebp(coverImg)}
                    sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 384px"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out select-none pointer-events-none"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 bg-charcoal-900/80 backdrop-blur-sm rounded-full text-[10px] tracking-widest uppercase text-champagne-light font-medium">
                    {post.category}
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-4 text-[11px] text-stone-600 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#7A6243]" />
                      {post.readingMinutes} phút đọc
                    </span>
                    <span>{formatDate(post.publishedAt)}</span>
                  </div>

                  <h2 className="font-serif text-xl font-light text-charcoal-900 group-hover:text-luxury-600 transition-colors line-clamp-2">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h2>

                  <p className="text-xs text-charcoal-600 line-clamp-3 font-light leading-relaxed">
                    {post.summary}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-champagne-light/50 flex items-center justify-between text-xs font-medium text-[#7A6243]">
                <span className="text-charcoal-500 font-light text-[11px]">{post.author}</span>
                <Link
                  href={`/blog/${post.slug}`}
                  aria-label={`Đọc bài viết: ${post.title}`}
                  className="flex items-center gap-1 hover:text-luxury-800 transition-colors"
                >
                  <span>Đọc bài viết</span>
                  <span className="sr-only">: {post.title}</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

