import React from 'react';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { getSystemSettings } from '@/lib/settings';
import { PricingPackagesJsonLd, FaqJsonLd } from '@/components/seo/JsonLdSchema';
import { AllPackagesCatalog } from '@/components/pricing/AllPackagesCatalog';
import { ConsultationForm } from '@/components/home/ConsultationForm';
import type { PricingPackageData } from '@/components/pricing/LuxuryPricingSection';
import { HelpCircle, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Bảng Giá Chụp Ảnh Cưới Trọn Gói 2025 | PlusMoments Studio',
  description:
    'Bảng giá dịch vụ chụp ảnh cưới Pre-Wedding ngoại cảnh, studio Hàn Quốc, phóng sự cưới trọn gói tại TP.HCM. Cam kết không phát sinh, tặng 2.000.000đ khi cọc sớm.',
};

export default async function PricingPage() {
  const [packagesRaw, settings] = await Promise.all([
    prisma.servicePackage.findMany({
      where: { published: true },
      orderBy: { orderIndex: 'asc' },
    }),
    getSystemSettings(),
  ]);

  const baseUrl = settings.canonicalBaseUrl || 'https://plusmoments.vn';

  // Format packages data for LuxuryPricingSection
  const packages: PricingPackageData[] = packagesRaw.map((pkg) => ({
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
  }));

  const faqs = [
    {
      question: 'Chụp ảnh cưới tại PlusMoments có phát sinh thêm chi phí nào không?',
      answer:
        'Tất cả các gói chụp tại PlusMoments đều là giá trọn gói cam kết không phát sinh. Đã bao gồm toàn bộ trang phục váy cưới/vest, chuyên viên trang điểm làm tóc theo từng bối cảnh, vé vào cổng các điểm chụp và xe 16 chỗ đưa đón.',
    },
    {
      question: 'Bao lâu sau khi chụp thì dâu rể nhận được ảnh hoàn thiện?',
      answer:
        'Toàn bộ file ảnh gốc sẽ được gửi qua Google Drive cho hai bạn trong vòng 24 giờ sau buổi chụp. Sau khi dâu rể chọn ảnh retouch, thời gian hoàn thiện bản thiết kế album và ảnh cổng từ 5 - 7 ngày.',
    },
    {
      question: 'Studio có hỗ trợ dâu rể chưa từng tạo dáng trước máy ảnh không?',
      answer:
        '100% ekip PlusMoments được đào tạo bài bản về hướng dẫn tạo dáng tâm lý. Nhiếp ảnh gia sẽ trò chuyện, tạo không khí thoải mái tự nhiên như một buổi hẹn hò, giúp bạn có những nụ cười rạng rỡ và cảm xúc chân thật nhất.',
    },
  ];

  return (
    <div className="pt-32 pb-24 space-y-20">
      {/* Structured Schema Data */}
      <PricingPackagesJsonLd
        packages={packages.map((pkg) => ({
          name: pkg.name,
          description: pkg.subtitle || pkg.name,
          price: pkg.price.toString(),
          url: `${baseUrl}/pricing#${pkg.slug}`,
        }))}
      />
      <FaqJsonLd faqs={faqs} />

      {/* HEADER SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.25em] px-4 py-1.5 rounded-full bg-amber-100/70 border border-amber-200 text-amber-900">
          Minh Bạch & Tối Ưu
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-charcoal-900">
          Dịch Vụ Chụp Ảnh Cưới Trọn Gói
        </h1>
        <p className="text-xs sm:text-sm font-light text-charcoal-600 max-w-2xl mx-auto leading-relaxed">
          Lựa chọn gói dịch vụ phù hợp nhất cho ngày trọng đại của hai bạn với chất lượng hoàn mỹ và chi phí tối ưu nhất.
        </p>
      </div>

      {/* Luxury Wedding Pricing Cards with Detail Modal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AllPackagesCatalog packages={packages} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto pt-6 space-y-8">
          <div className="text-center space-y-2">
            <h3 className="font-serif text-2xl sm:text-3xl font-light text-charcoal-900">
              Câu Hỏi Thường Gặp
            </h3>
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
                <h4 className="font-serif text-base font-medium text-charcoal-900 flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-luxury-600 shrink-0 mt-0.5" />
                  <span>{faq.question}</span>
                </h4>
                <p className="text-xs sm:text-sm text-charcoal-600 pl-6 font-light leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Consultation Form Anchor */}
        <div id="tu-van-goi" className="max-w-3xl mx-auto pt-4">
          <div className="bg-white border-2 border-champagne-gold/40 rounded-3xl p-8 sm:p-12 shadow-xl">
            <div className="text-center space-y-2 mb-8">
              <Sparkles className="w-7 h-7 text-luxury-500 mx-auto" />
              <h3 className="font-serif text-2xl sm:text-3xl font-light text-charcoal-900">
                Đăng Ký Nhận Tư Vấn Trực Tiếp
              </h3>
              <p className="text-xs sm:text-sm text-charcoal-500 font-light">
                Chuyên viên PlusMoments sẽ gửi demo album đầy đủ và báo giá ưu đãi độc quyền theo ngày cưới của bạn.
              </p>
            </div>
            <ConsultationForm />
          </div>
        </div>
      </div>
    </div>
  );
}
