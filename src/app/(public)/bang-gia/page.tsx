import React from 'react';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { getSystemSettings } from '@/lib/settings';
import { PricingPackagesJsonLd, FaqJsonLd } from '@/components/seo/JsonLdSchema';
import { AllPackagesCatalog } from '@/components/pricing/AllPackagesCatalog';
import { ConsultationForm } from '@/components/home/ConsultationForm';
import { HelpCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import type { PricingPackageData } from '@/components/pricing/LuxuryPricingSection';

export const metadata: Metadata = {
  title: 'Bảng Giá Dịch Vụ Cưới Trọn Gói 2026 | PlusMoments Studio',
  description:
    'Bảng giá trọn gói tất cả các dịch vụ chụp ảnh cưới Pre-Wedding ngoại cảnh, studio phong cách Hàn Quốc, phóng sự cưới tại TP.HCM. Cam kết 100% không phát sinh chi phí.',
};

export const revalidate = 60;

export default async function BangGiaPage() {
  const [packagesRaw, settings] = await Promise.all([
    prisma.servicePackage.findMany({
      where: { published: true },
      orderBy: { orderIndex: 'asc' },
    }).catch(() => []),
    getSystemSettings(),
  ]);

  const baseUrl = settings.canonicalBaseUrl || 'https://plusmoments.vn';

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
        'Tất cả các gói chụp tại PlusMoments đều là giá trọn gói cam kết 100% không phát sinh. Đã bao gồm toàn bộ trang phục váy cưới/vest, chuyên viên trang điểm làm tóc theo từng bối cảnh, vé vào cổng các điểm chụp và xe đưa đón.',
    },
    {
      question: 'Bao lâu sau khi chụp thì dâu rể nhận được toàn bộ ảnh?',
      answer:
        'Toàn bộ file ảnh gốc chất lượng cao sẽ được bàn giao qua Google Drive trong vòng 24 giờ sau buổi chụp. Sau khi dâu rể chọn ảnh retouch, thời gian thiết kế album và in ảnh cổng từ 5 - 7 ngày.',
    },
    {
      question: 'Studio có hỗ trợ dâu rể chưa từng tạo dáng trước ống kính không?',
      answer:
        '100% ekip PlusMoments được đào tạo bài bản về hướng dẫn tạo dáng tự nhiên. Nhiếp ảnh gia sẽ tạo không khí thoải mái, nắm bắt những rung cảm thuần khiết nhất thay vì các tư thế cứng nhắc.',
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
          url: `${baseUrl}/bang-gia#${pkg.slug}`,
        }))}
      />
      <FaqJsonLd faqs={faqs} />

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
        <AllPackagesCatalog packages={packages} />
      </div>

      {/* FAQ SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
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

        {/* CONSULTATION FORM ANCHOR */}
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

