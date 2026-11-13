import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getCachedBlogs, getCachedSystemSettings } from '@/lib/cached-queries';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLdSchema';
import { BlogCard } from '@/components/blog/BlogCard';

export const metadata: Metadata = {
  title: 'Cẩm Nang Cưới & Kinh Nghiệm Chụp Ảnh | PlusMoments Blog',
  description:
    'Chia sẻ kinh nghiệm chụp ảnh cưới ngoại cảnh, chọn váy cưới phù hợp vóc dáng, bí quyết chuẩn bị đám cưới hoàn hảo từ PlusMoments Studio.',
  alternates: {
    canonical: 'https://plusmoments.vn/blog',
  },
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams?: { category?: string };
}) {
  const selectedCategory = searchParams?.category;

  const [posts, settings] = await Promise.all([
    getCachedBlogs(),
    getCachedSystemSettings(),
  ]);

  const baseUrl = settings.canonicalBaseUrl || 'https://plusmoments.vn';

  // Trích xuất danh mục duy nhất từ chính mảng bài viết thực tế trong Database
  const dynamicCategories = Array.from(
    new Set(
      posts
        .map((p) => p.category?.trim())
        .filter((cat): cat is string => Boolean(cat))
    )
  );

  const categories = ['Tất Cả', ...dynamicCategories];

  // Lọc chuẩn hóa chuỗi theo danh mục đã chọn
  const filteredPosts =
    !selectedCategory || selectedCategory === 'Tất Cả'
      ? posts
      : posts.filter(
          (p) =>
            (p.category?.trim() || '').toLowerCase() ===
            selectedCategory.trim().toLowerCase()
        );

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

      {/* CATEGORY FILTER CHIPS (Chỉ hiển thị khi có từ 2 danh mục thực tế trở lên) */}
      {dynamicCategories.length > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
          {categories.map((cat) => {
            const isAll = cat === 'Tất Cả';
            const isActive = isAll
              ? !selectedCategory || selectedCategory === 'Tất Cả'
              : selectedCategory?.trim().toLowerCase() === cat.trim().toLowerCase();
            const href = isAll ? '/blog' : `/blog?category=${encodeURIComponent(cat)}`;

            return (
              <Link
                key={cat}
                href={href}
                className={`px-5 py-2.5 rounded-full text-xs uppercase tracking-wider font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880] focus-visible:ring-offset-2 ${
                  isActive
                    ? 'bg-charcoal-900 text-white shadow-md font-semibold'
                    : 'bg-white text-charcoal-700 hover:bg-[#C5A880]/15 border border-stone-200/80 shadow-2xs'
                }`}
              >
                {cat}
              </Link>
            );
          })}
        </div>
      )}

      {filteredPosts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-200/80 p-8 max-w-xl mx-auto space-y-3 shadow-sm">
          <p className="text-sm text-charcoal-600 font-light">
            Chưa có bài viết nào trong chuyên mục này.
          </p>
          <Link
            href="/blog"
            className="inline-block text-xs uppercase tracking-wider font-medium text-luxury-600 hover:text-luxury-800 underline underline-offset-4"
          >
            Xem tất cả bài viết
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post, idx) => (
            <BlogCard
              key={post.id}
              post={post}
              priority={idx === 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
