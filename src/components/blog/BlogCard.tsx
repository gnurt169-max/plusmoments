'use client';

import React from 'react';
import Link from 'next/link';
import { SafeImage } from '@/components/common/SafeImage';
import { formatDate } from '@/lib/utils';
import { Clock, ArrowRight } from 'lucide-react';

export interface BlogCardData {
  id: string;
  slug: string;
  title: string;
  summary?: string | null;
  coverImage?: string | null;
  category?: string | null;
  readingMinutes?: number | null;
  publishedAt?: Date | string | null;
  author?: string | null;
}

export interface BlogCardProps {
  post: BlogCardData;
  priority?: boolean;
}

export function BlogCard({ post, priority = false }: BlogCardProps) {
  const coverImg = post.coverImage && post.coverImage.trim() ? post.coverImage : '';

  return (
    <article className="bg-white rounded-2xl overflow-hidden border border-champagne-dark/30 shadow-luxury hover:shadow-luxury-hover transition-all duration-300 flex flex-col justify-between group">
      <div>
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-champagne-light">
          <SafeImage
            src={coverImg || '/placeholder.jpg'}
            alt={post.title}
            fill
            priority={priority}
            fetchPriority={priority ? 'high' : 'auto'}
            quality={70}
            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 420px"
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out select-none pointer-events-none"
          />
          {post.category && (
            <div className="absolute top-3 left-3 px-3 py-1 bg-charcoal-900/80 backdrop-blur-sm rounded-full text-[10px] tracking-widest uppercase text-champagne-light font-medium">
              {post.category}
            </div>
          )}
        </div>

        <div className="p-6 space-y-3">
          <div className="flex items-center gap-4 text-[11px] text-stone-600 font-mono">
            {post.readingMinutes && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#7A6243]" />
                {post.readingMinutes} phút đọc
              </span>
            )}
            {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
          </div>

          <h2 className="font-serif text-xl font-light text-charcoal-900 group-hover:text-luxury-600 transition-colors line-clamp-2">
            <Link href={`/blog/${post.slug}`}>{post.title}</Link>
          </h2>

          {post.summary && (
            <p className="text-xs text-charcoal-600 line-clamp-3 font-light leading-relaxed">
              {post.summary}
            </p>
          )}
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
}

export default BlogCard;
