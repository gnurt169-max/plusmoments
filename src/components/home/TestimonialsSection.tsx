import React from 'react';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { FloatingCard } from '@/components/motion/FloatingCard';

export interface TestimonialItem {
  id: string;
  coupleNames: string;
  quote?: string | null;
  content?: string | null;
  reviewContent?: string | null;
  avatarUrl?: string | null;
  coverImageUrl?: string | null;
  weddingDate?: string | null;
  rating?: number | null;
}

export interface TestimonialsSectionProps {
  testimonials: TestimonialItem[];
  title?: string;
  subtitle?: string;
}

export function TestimonialsSection({
  testimonials,
  title = 'Cảm Xúc Của Các Dâu Rể',
  subtitle = 'Hạnh phúc của bạn chính là niềm tự hào lớn nhất của ekip sáng tạo PlusMoments.',
}: TestimonialsSectionProps) {
  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#7A6243]">
          Câu Chuyện Hạnh Phúc
        </p>
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-charcoal-900">
          {title}
        </h2>
        <p className="text-sm text-charcoal-600 font-light leading-relaxed">
          {subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {testimonials.map((test, index) => {
          const avatar =
            test.avatarUrl ||
            test.coverImageUrl ||
            '';
          const contentText = test.content || test.reviewContent || '';

          return (
            <FloatingCard
              key={test.id}
              delay={index * 0.5}
              reverse={index % 2 === 1}
              className="bg-white p-8 rounded-2xl border border-champagne-dark/30 shadow-luxury flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-500 mb-4">
                  {[...Array(test.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <blockquote className="font-serif text-lg sm:text-xl font-light text-charcoal-900 italic mb-4">
                  "{test.quote}"
                </blockquote>
                <p className="text-xs text-charcoal-600 font-light leading-relaxed mb-6">
                  {contentText}
                </p>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-champagne-light">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-champagne-light shrink-0">
                  <Image
                    src={avatar}
                    alt={test.coupleNames}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-serif text-sm font-medium text-charcoal-900">
                    {test.coupleNames}
                  </h3>
                  {test.weddingDate && (
                    <p className="text-[11px] text-charcoal-600 font-mono">
                      {test.weddingDate}
                    </p>
                  )}
                </div>
              </div>
            </FloatingCard>
          );
        })}
      </div>
    </section>
  );
}

export default TestimonialsSection;

