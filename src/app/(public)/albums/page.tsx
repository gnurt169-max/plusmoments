import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { FloatingCard } from '@/components/motion/FloatingCard';

export const metadata: Metadata = {
  title: 'Bộ Sưu Tập Ảnh Cưới Luxury | Pre-Wedding & Phóng Sự Cưới',
  description:
    'Khám phá các album ảnh cưới đẹp nhất tại Đà Lạt, TP.HCM, Phú Quốc phong cách điện ảnh, Hàn Quốc và Châu Âu của PlusMoments Studio.',
};

export default async function AlbumsPage({
  searchParams,
}: {
  searchParams: { concept?: string };
}) {
  const selectedConcept = searchParams.concept;

  const [albums, dbConcepts] = await Promise.all([
    prisma.album.findMany({
      where: {
        published: true,
        ...(selectedConcept ? { concept: selectedConcept } : {}),
      },
      orderBy: { orderIndex: 'asc' },
      include: {
        media: { take: 1 },
      },
    }),
    prisma.albumConcept.findMany({
      orderBy: { order: 'asc' },
    }),
  ]);

  const concepts = [
    'Tất Cả',
    ...(dbConcepts.length > 0
      ? dbConcepts.map((c) => c.name)
      : ['Outdoor Luxury', 'Studio Editorial', 'Pre-Wedding Cinematic', 'Phóng Sự Cưới']),
  ];

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <p className="text-xs uppercase tracking-[0.25em] text-luxury-600 font-semibold">
          Portfolio & Lookbook
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl font-light text-charcoal-900">
          Bộ Sưu Tập Ảnh Cưới
        </h1>
        <p className="text-sm text-charcoal-600 font-light leading-relaxed">
          Nơi lưu giữ những nụ cười rạng rỡ và cảm xúc thăng hoa của hàng trăm cặp đôi.
        </p>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        {concepts.map((concept) => {
          const isAll = concept === 'Tất Cả';
          const isActive = isAll ? !selectedConcept : selectedConcept === concept;
          const href = isAll ? '/albums' : `/albums?concept=${encodeURIComponent(concept)}`;

          return (
            <Link
              key={concept}
              href={href}
              className={`px-5 py-2 rounded-full text-xs uppercase tracking-wider font-medium transition-all ${
                isActive
                  ? 'bg-charcoal-900 text-white shadow-md'
                  : 'bg-white text-charcoal-700 hover:bg-champagne/40 border border-champagne-dark/30'
              }`}
            >
              {concept}
            </Link>
          );
        })}
      </div>

      {/* Albums Grid */}
      {albums.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-champagne-dark/30 p-8">
          <p className="font-serif text-xl text-charcoal-800 font-light">
            Chưa có album nào thuộc phân loại này
          </p>
          <p className="text-xs text-charcoal-500 mt-1 font-light">
            Vui lòng chọn phân loại khác hoặc quay lại xem tất cả bộ sưu tập.
          </p>
          <Link
            href="/albums"
            className="inline-block mt-4 px-6 py-2 rounded-full text-xs uppercase tracking-wider bg-charcoal-900 text-white font-medium"
          >
            Xem Tất Cả Album
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {albums.map((album, idx) => {
            const coverImg =
              album.coverImage && album.coverImage.trim()
                ? album.coverImage
                : '';

            return (
              <FloatingCard
                key={album.id}
                delay={idx * 0.2}
                reverse={idx % 2 === 1}
                className="group"
              >
                <Link
                  href={`/albums/${album.slug}`}
                  className="block bg-white p-4 rounded-2xl shadow-luxury hover:shadow-luxury-hover border border-champagne-dark/30 transition-all duration-300"
                >
                  <div className="relative aspect-[4/5] w-full rounded-xl overflow-hidden mb-4 bg-champagne-light">
                    <Image
                      src={coverImg}
                      alt={album.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 bg-charcoal-900/80 backdrop-blur-sm rounded-full text-[10px] tracking-widest uppercase text-champagne-light font-medium">
                      {album.concept}
                    </div>
                    <div className="absolute bottom-3 right-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[11px] font-mono text-charcoal-800">
                      {album.location}
                    </div>
                  </div>

                  <div className="space-y-1.5 px-2 pb-1">
                    <div className="flex items-center justify-between text-xs text-luxury-600">
                      <span className="font-medium tracking-wide">{album.coupleNames}</span>
                      <span className="text-charcoal-400 text-[11px]">Xem album →</span>
                    </div>
                    <h2 className="font-serif text-lg text-charcoal-900 font-light group-hover:text-luxury-600 transition-colors line-clamp-1">
                      {album.title}
                    </h2>
                    <p className="text-xs text-charcoal-500 line-clamp-2 font-light">
                      {album.subtitle || album.description}
                    </p>
                  </div>
                </Link>
              </FloatingCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

