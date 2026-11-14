import React from 'react';
import type { Metadata } from 'next';
import {
  getCachedPackages,
  getCachedSystemSettings,
  getCachedPricingFaqs,
  getCachedTestimonials,
} from '@/lib/cached-queries';
import {
  PricingPackagesJsonLd,
  FaqJsonLd,
  BreadcrumbJsonLd,
  computeReviewStats,
} from '@/components/seo/JsonLdSchema';
import { AllPackagesCatalog } from '@/components/pricing/AllPackagesCatalog';
import { ConsultationForm } from '@/components/home/ConsultationForm';
import { HelpCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import type { PricingPackageData } from '@/components/pricing/LuxuryPricingSection';
import {
  extractPackageHighlights,
  extractPackageInclusions,
} from '@/lib/package-features';

export const metadata: Metadata = {
  title: 'Bảng Giá Dịch Vụ Cưới Trọn Gói 2026 | PlusMoments Studio',
  description:
    'Bảng giá trọn gói tất cả các dịch vụ chụp ảnh cưới Pre-Wedding ngoại cảnh, studio phong cách Hàn Quốc, phóng sự cưới tại TP.HCM. Cam kết 100% không phát sinh chi phí.',
  alternates: {
    canonical: 'https://plusmoments.vn/bang-gia',
  },
  openGraph: {
    title: 'Bảng Giá Dịch Vụ Cưới Trọn Gói 2026 | PlusMoments Studio',
    description:
      'Bảng giá trọn gói tất cả các dịch vụ chụp ảnh cưới Pre-Wedding ngoại cảnh, studio phong cách Hàn Quốc, phóng sự cưới tại TP.HCM. Cam kết 100% không phát sinh chi phí.',
    url: 'https://plusmoments.vn/bang-gia',
    siteName: 'PlusMoments Wedding Pictures & Films',
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bảng Giá Dịch Vụ Cưới Trọn Gói 2026 | PlusMoments Studio',
    description:
      'Bảng giá trọn gói tất cả các dịch vụ chụp ảnh cưới Pre-Wedding ngoại cảnh, studio phong cách Hàn Quốc, phóng sự cưới tại TP.HCM. Cam kết 100% không phát sinh chi phí.',
  },
};

export const revalidate = 60;

export default async function BangGiaPage() {
  const [packagesRaw, settings, faqsRaw, testimonials] = await Promise.all([
    getCachedPackages(),
    getCachedSystemSettings(),
    getCachedPricingFaqs(),
    getCachedTestimonials(),
  ]);

  const { aggregateRating, reviews } = computeReviewStats(testimonials);

  const baseUrl = settings.canonicalBaseUrl || 'https://plusmoments.vn';

  const packages: PricingPackageData[] = packagesRaw.map((pkg) => {
    const coreHighlights = extractPackageHighlights(pkg);
    const fullInclusions = extractPackageInclusions(pkg);
    return {
      id: pkg.id,
      name: pkg.name,
      slug: pkg.slug,
      category: pkg.category,
      subtitle: pkg.subtitle,
      price: Number(pkg.price),
      originalPrice: pkg.originalPrice ? Number(pkg.originalPrice) : null,
      unit: pkg.unit,
      coverImage: pkg.coverImage,
      demoImages: pkg.demoImages,
      highlightPoints: pkg.highlightPoints,
      inclusions: pkg.inclusions,
      deliverables: pkg.deliverables,
      isPopular: pkg.isPopular,
      isFeatured: pkg.isFeatured,
      highlights: coreHighlights,
      coreHighlights: coreHighlights,
      inclusionsList: fullInclusions,
      features: fullInclusions,
      fullFeatures: fullInclusions,
      shortFeatures: coreHighlights,
      deliveryProcess: pkg.deliverables,
      blurDataUrl: (pkg as any).blurDataUrl || null,
    };
  });

  // Dynamic FAQs from Database with fallback to SystemSetting JSON if needed
  let faqs = faqsRaw.map((f) => ({
    question: f.question,
    answer: f.answer,
  }));

  if (faqs.length === 0 && (settings as any)?.pricingFaqs) {
    try {
      const parsed = Array.isArray((settings as any).pricingFaqs)
        ? (settings as any).pricingFaqs
        : JSON.parse((settings as any).pricingFaqs as string);
      if (Array.isArray(parsed)) {
        faqs = parsed
          .filter((item: any) => item && item.isActive !== false && item.question && item.answer)
          .map((item: any) => ({
            question: item.question.trim(),
            answer: item.answer.trim(),
          }));
      }
    } catch {
      faqs = [];
    }
  }

  return (
    <div className="pt-32 pb-24 space-y-20">
      {/* Structured Schema Data */}
      <BreadcrumbJsonLd
        items={[
          { name: 'Trang chủ', item: baseUrl },
          { name: 'Bảng Giá Dịch Vụ Cưới', item: `${baseUrl}/bang-gia` },
        ]}
      />
      <PricingPackagesJsonLd
        baseUrl={baseUrl}
        aggregateRating={aggregateRating}
        reviews={reviews}
        packages={packages.map((pkg) => {
          let demoImagesList: string[] = [];
          if (pkg.demoImages) {
            try {
              const parsed = JSON.parse(pkg.demoImages);
              if (Array.isArray(parsed)) {
                demoImagesList = parsed.filter(
                  (item): item is string => typeof item === 'string' && item.trim().length > 0
                );
              }
            } catch {
              // ignore
            }
          }
          const allImages = [pkg.coverImage, ...demoImagesList].filter(
            (img): img is string => Boolean(img && img.trim())
          );
          const packageImages = allImages.length > 0 ? allImages : ['/og-image.jpg'];

          return {
            name: pkg.name,
            description:
              pkg.subtitle ||
              pkg.coreHighlights?.[0] ||
              `Gói dịch vụ chụp ảnh cưới cao cấp ${pkg.name} trọn gói tại PlusMoments Studio.`,
            price: pkg.price.toString(),
            url: `${baseUrl}/bang-gia#${pkg.slug}`,
            image: packageImages,
          };
        })}
      />
      {faqs.length > 0 && <FaqJsonLd faqs={faqs} />}

      {/* HEADER SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.25em] px-4 py-1.5 rounded-full bg-amber-100/70 border border-amber-200 text-amber-900">
          Minh Bạch & Tối Ưu
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-charcoal-900">
          Toàn Bộ Gói Dịch Vụ Cưới Trọn Gói
        </h1>
        <p className="text-xs sm:text-sm font-light text-charcoal-600 max-w-2xl mx-auto leading-relaxed">
          Khám phá tất cả các gói dịch vụ ảnh cưới cao cấp của PlusMoments. Cam kết 100% không phát sinh chi phí, bảo lưu ưu đãi 2.000.000đ khi đăng ký trực tuyến hôm nay.
        </p>
      </div>

      {/* FULL CATALOG WITH CATEGORY FILTER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="sr-only">Danh Sách Bảng Giá Các Gói Chụp Ảnh Cưới</h2>
        <AllPackagesCatalog packages={packages} isSummary={false} />
      </div>

      {/* FAQ SECTION - Only render when FAQs exist */}
      {faqs.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto pt-6 space-y-8">
            <div className="text-center space-y-2">
              <h2 className="font-serif text-2xl sm:text-3xl font-light text-charcoal-900">
                Câu Hỏi Thường Gặp
              </h2>
              <p className="text-xs text-charcoal-500 font-light">
                Giải đáp các thắc mắc phổ biến của các cặp dâu rể khi đặt lịch tại PlusMoments.
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-2xl border border-champagne-dark/30 shadow-sm space-y-2"
                >
                  <h3 className="font-serif text-base font-medium text-charcoal-900 flex items-start gap-2">
                    <HelpCircle className="w-4 h-4 text-luxury-600 shrink-0 mt-0.5" />
                    <span>{faq.question}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-charcoal-600 pl-6 font-light leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CONSULTATION FORM ANCHOR */}
      <div id="tu-van-goi" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="bg-white border-2 border-champagne-gold/40 rounded-3xl p-8 sm:p-12 shadow-xl">
          <div className="text-center space-y-2 mb-8">
            <Sparkles className="w-7 h-7 text-luxury-500 mx-auto" />
            <h2 className="font-serif text-2xl sm:text-3xl font-light text-charcoal-900">
              Đăng Ký Nhận Tư Vấn Trực Tiếp
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-500 font-light">
              Chuyên viên PlusMoments sẽ gửi demo album đầy đủ và báo giá ưu đãi độc quyền theo ngày cưới của bạn.
            </p>
          </div>
          <ConsultationForm />
        </div>
      </div>
    </div>
  );
}

