import React from 'react';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { getSystemSettings } from '@/lib/settings';
import { ConsultationForm } from '@/components/home/ConsultationForm';
import { MapPin, Phone, Mail, Clock, Sparkles, Building, ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Liên Hệ Studio & Đặt Lịch Tư Vấn | PlusMoments Wedding',
  description:
    'Ghé thăm studio PlusMoments tại TP.HCM và các chi nhánh để thử váy cưới miễn phí và trải nghiệm không gian tư vấn riêng tư, sang trọng.',
};

export default async function ContactPage() {
  const [settings, locations] = await Promise.all([
    getSystemSettings(),
    prisma.studioLocation.findMany({
      where: { published: true },
      orderBy: { orderIndex: 'asc' },
    }).catch(() => []),
  ]);

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <p className="text-xs uppercase tracking-[0.25em] text-luxury-600 font-semibold">
          Ghé Thăm Studio
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl font-light text-charcoal-900">
          Liên Hệ & Đặt Lịch Hẹn
        </h1>
        <p className="text-sm text-charcoal-600 font-light leading-relaxed">
          Chúng tôi rất hân hạnh được đón tiếp bạn và người thương tại studio để cùng nhau tạo nên những trang nhật ký tình yêu đẹp nhất.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Dynamic Studio Locations Cards */}
        <div className="lg:col-span-5 space-y-6">
          {locations.length > 0 ? (
            locations.map((loc) => (
              <div
                key={loc.id}
                className="bg-white p-7 rounded-3xl border border-champagne-dark/30 shadow-luxury space-y-5"
              >
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-luxury-600 shrink-0" />
                    <h2 className="font-serif text-lg font-medium text-charcoal-900">
                      {loc.name}
                    </h2>
                  </div>
                  {loc.isHeadquarter && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-luxury-100 text-luxury-800">
                      Trụ Sở Chính
                    </span>
                  )}
                </div>

                <div className="space-y-3.5 text-xs text-charcoal-700">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-luxury-600 shrink-0 mt-0.5" />
                    <p className="font-light leading-relaxed">{loc.address}</p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-luxury-600 shrink-0" />
                    <a
                      href={`tel:${loc.hotline}`}
                      className="font-mono font-medium text-luxury-700 hover:underline"
                    >
                      {loc.hotlineDisplay}
                    </a>
                  </div>

                  {loc.email && (
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-4 h-4 text-luxury-600 shrink-0" />
                      <a href={`mailto:${loc.email}`} className="text-charcoal-600 hover:underline">
                        {loc.email}
                      </a>
                    </div>
                  )}

                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-luxury-600 shrink-0" />
                    <span className="text-charcoal-500">{loc.openingHours}</span>
                  </div>

                  {loc.googleMapsUrl && (
                    <div className="pt-2">
                      <a
                        href={loc.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-luxury-700 font-medium hover:text-luxury-900 transition-colors"
                      >
                        <span>Xem chỉ đường trên Google Maps</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            /* Fallback Card from System Settings */
            <div className="bg-white p-8 rounded-3xl border border-champagne-dark/30 shadow-luxury space-y-5">
              <h2 className="font-serif text-2xl font-light text-charcoal-900">
                PlusMoments Studio
              </h2>
              <div className="space-y-4 text-xs text-charcoal-700">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-luxury-600 shrink-0 mt-0.5" />
                  <p className="font-light">{settings.studioAddress}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-luxury-600 shrink-0" />
                  <a href={`tel:${settings.hotline}`} className="font-mono font-medium text-luxury-700">
                    {settings.hotlineDisplay}
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Quick Chat Support */}
          <div className="bg-stone-50 border border-stone-200 rounded-3xl p-6 flex items-center justify-between">
            <div>
              <p className="font-serif text-sm font-medium text-charcoal-900">
                Chat Tư Vấn Ngay Qua Zalo
              </p>
              <p className="text-[11px] text-charcoal-500 font-light mt-0.5">
                Phản hồi gửi catalog báo giá trong 5 phút.
              </p>
            </div>
            <a
              href={settings.zaloUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-[#0068FF] hover:bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-sm transition-transform active:scale-95"
            >
              Chat Zalo
            </a>
          </div>
        </div>

        {/* Consultation Form Container */}
        <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-champagne-dark/30 shadow-luxury">
          <div className="space-y-2 mb-8">
            <div className="inline-flex items-center gap-1.5 text-luxury-600 text-xs uppercase tracking-widest font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>Đăng Ký Tư Vấn Trực Tiếp</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-light text-charcoal-900">
              Gửi Yêu Cầu Cho PlusMoments
            </h3>
            <p className="text-xs text-charcoal-500 font-light">
              Chúng tôi sẽ phản hồi kèm thông tin báo giá chi tiết trong vòng 15 phút.
            </p>
          </div>

          <ConsultationForm />
        </div>
      </div>
    </div>
  );
}
