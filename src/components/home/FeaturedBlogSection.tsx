import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Clock, Calendar } from 'lucide-react';
import { isOptimizedUploadWebp } from '@/lib/image-utils';

export interface PostItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  summary?: string | null;
  coverImage?: string | null;
  category?: string | null;
  readingMinutes?: number | null;
  createdAt: Date | string;
}

export interface FeaturedBlogSectionProps {
  posts: PostItem[];
}

export function FeaturedBlogSection({ posts }: FeaturedBlogSectionProps) {
  if (!posts || posts.length === 0) return null;

  return (
    <section className="py-20 lg:py-28 bg-[#FAF8F5] border-t border-[#E8E2D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs uppercase tracking-[0.25em] text-[#6E5A49] font-medium mb-3">
            Cảm Hứng & Kinh Nghiệm
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif text-[#1C1917] tracking-tight">
            Cẩm Nang Cưới PlusMoments
          </h2>
          <div className="w-12 h-px bg-[#6E5A49] mx-auto mt-4 mb-4" />
          <p className="text-sm text-[#78716C] leading-relaxed font-light">
            Những chia sẻ chân thành, xu hướng nghệ thuật và kinh nghiệm chuẩn bị để bạn có một ngày trọng đại trọn vẹn và nhẹ nhàng nhất.
          </p>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.slice(0, 3).map((post) => {
            const formattedDate = new Date(post.createdAt).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            });
            const excerptText = post.excerpt || post.summary || '';

            return (
              <article
                key={post.id}
                className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-[#E8E2D9] shadow-sm hover:shadow-md transition-all duration-300"
              >
                {/* Thumbnail Container */}
                <Link
                  href={`/cam-nang/${post.slug}`}
                  className="relative aspect-[16/10] w-full overflow-hidden bg-[#1E1C1A] block"
                  title={post.title}
                  aria-label={`Xem bài viết: ${post.title}`}
                >
                  <Image
                    src={post.coverImage || '/placeholder.jpg'}
                    alt={post.title}
                    fill
                    quality={65}
                    unoptimized={isOptimizedUploadWebp(post.coverImage)}
                    sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 384px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none"
                  />
                  {post.category && (
                    <span className="absolute top-3 left-3 z-20 px-3 py-1 bg-white/90 backdrop-blur-md text-[11px] font-medium tracking-wider uppercase text-[#2E2824] rounded-full shadow-sm pointer-events-none">
                      {post.category}
                    </span>
                  )}
                </Link>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="text-xs text-stone-600 mb-2.5 font-medium flex items-center gap-1.5 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#6E5A49]" />
                      {formattedDate}
                    </span>
                    {post.readingMinutes ? (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#6E5A49]" />
                          {post.readingMinutes} phút đọc
                        </span>
                      </>
                    ) : null}
                  </div>

                  <h3 className="text-lg font-serif font-medium text-[#1C1917] group-hover:text-[#6E5A49] transition-colors duration-200 line-clamp-2 leading-snug mb-3">
                    <Link href={`/cam-nang/${post.slug}`} aria-label={`Đọc bài viết: ${post.title}`}>
                      {post.title}
                    </Link>
                  </h3>

                  {excerptText && (
                    <p className="text-xs sm:text-sm text-[#78716C] line-clamp-2 leading-relaxed mb-6 flex-1 font-light">
                      {excerptText}
                    </p>
                  )}

                  <div className="pt-4 border-t border-[#F5F2EB] mt-auto">
                    <Link
                      href={`/cam-nang/${post.slug}`}
                      aria-label={`Khám phá bài viết: ${post.title}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#7A6243] hover:text-[#5C4930] group-hover:text-[#5C4930] transition-colors"
                    >
                      <span>Khám phá bài viết</span>
                      <span className="sr-only">: {post.title}</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Nút Xem Tất Cả */}
        <div className="mt-14 text-center">
          <Link
            href="/cam-nang"
            className="inline-flex items-center gap-2 px-8 py-3.5 border border-[#7A6243] text-[#7A6243] hover:bg-[#7A6243] hover:text-white transition-all duration-300 rounded-full text-xs sm:text-sm tracking-wider uppercase font-medium shadow-sm"
          >
            <span>Xem Tất Cả Cẩm Nang & Kinh Nghiệm</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default FeaturedBlogSection;

