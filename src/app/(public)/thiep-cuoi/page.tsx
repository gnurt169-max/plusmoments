import React from 'react';
import Link from 'next/link';
import { Sparkles, Heart, Smartphone, Camera, Calendar, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { INVITATION_TEMPLATES } from '@/lib/invitations/templates';

export const metadata = {
  title: 'Thiệp Cưới Online Đẹp & Cá Nhân Hóa Chuẩn Luxury | PlusMoments',
  description: 'Tự tạo thiệp cưới điện tử sang trọng miễn phí từ PlusMoments. Mở phong bì lụa sống động, đếm ngược ngày cưới, chỉ đường Google Maps, nhận lời chúc RSVP và chia sẻ ảnh cưới chất lượng cao.',
};

export default function WeddingInvitationsLandingPage() {
  const templates = Object.values(INVITATION_TEMPLATES);

  return (
    <div className="min-h-screen bg-[#FAF8F5] pt-28 pb-24 text-stone-900 selection:bg-[#8C6D46] selection:text-white">
      {/* 1. HERO SECTION */}
      <section className="max-w-6xl mx-auto px-6 lg:px-8 text-center pt-8 pb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#8C6D46]/10 border border-[#8C6D46]/20 text-[#8C6D46] text-xs font-medium tracking-widest uppercase mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Đặc Quyền Dành Cho Cặp Đôi PlusMoments</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-normal tracking-tight text-stone-900 max-w-4xl mx-auto leading-[1.2]">
          Thiệp Cưới Điện Tử Cá Nhân Hóa <br />
          <span className="italic font-light text-[#8C6D46]">Chuẩn Phong Cách Luxury Editorial</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-stone-600 max-w-2xl mx-auto font-light leading-relaxed">
          Gửi gắm lời mời trân trọng nhất đến người thân và bạn bè qua những mẫu thiệp cưới trực tuyến tinh xảo. 
          Hiệu ứng mở phong bì lụa điện ảnh, bộ ảnh cưới sắc nét không nén mờ, chỉ đường Google Maps và sổ lưu bút RSVP tiện lợi.
        </p>

        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/thiep-cuoi/tao-moi"
            className="w-full sm:w-auto h-13 px-8 rounded-full bg-[#8C6D46] hover:bg-[#725735] active:scale-95 text-white text-sm font-semibold tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>Tự Thiết Kế Thiệp Ngay (Miễn Phí)</span>
          </Link>
          <a
            href="#templates-showcase"
            className="w-full sm:w-auto h-13 px-8 rounded-full bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 text-sm font-medium tracking-wider transition-all flex items-center justify-center gap-2"
          >
            <span>Khám Phá Các Mẫu Thiệp</span>
            <ArrowRight className="w-4 h-4 text-stone-500" />
          </a>
        </div>

        {/* Feature Highlights Bar */}
        <div className="mt-14 pt-10 border-t border-stone-200/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
          <div className="p-4 rounded-xl bg-white/70 border border-stone-200/60 shadow-2xs">
            <Smartphone className="w-5 h-5 text-[#8C6D46] mb-2" />
            <div className="font-medium text-sm text-stone-900">Mở Phong Bì 3D</div>
            <div className="text-xs text-stone-500 mt-0.5">Trải nghiệm chạm sáp mở lụa sang trọng trên điện thoại</div>
          </div>
          <div className="p-4 rounded-xl bg-white/70 border border-stone-200/60 shadow-2xs">
            <Camera className="w-5 h-5 text-[#8C6D46] mb-2" />
            <div className="font-medium text-sm text-stone-900">Ảnh Cưới Chuẩn Studio</div>
            <div className="text-xs text-stone-500 mt-0.5">Tự động nén WebP giữ nguyên tỷ lệ dọc/ngang không vỡ hình</div>
          </div>
          <div className="p-4 rounded-xl bg-white/70 border border-stone-200/60 shadow-2xs">
            <Calendar className="w-5 h-5 text-[#8C6D46] mb-2" />
            <div className="font-medium text-sm text-stone-900">Đếm Ngược & Chỉ Đường</div>
            <div className="text-xs text-stone-500 mt-0.5">Tích hợp Google Maps 1 chạm và nhắc lịch hẹn thông minh</div>
          </div>
          <div className="p-4 rounded-xl bg-white/70 border border-stone-200/60 shadow-2xs">
            <Heart className="w-5 h-5 text-[#8C6D46] mb-2" />
            <div className="font-medium text-sm text-stone-900">Xác Nhận RSVP & Lời Chúc</div>
            <div className="text-xs text-stone-500 mt-0.5">Quản lý số lượng khách và lưu giữ lời chúc ý nghĩa</div>
          </div>
        </div>
      </section>

      {/* 2. TEMPLATES SHOWCASE */}
      <section id="templates-showcase" className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <span className="text-xs font-mono tracking-widest uppercase text-[#8C6D46]">Bộ Sưu Tập Giao Diện</span>
          <h2 className="text-2xl sm:text-4xl font-serif font-normal text-stone-900 mt-2">
            4 Mẫu Thiết Kế Hoàng Gia & Tối Giản
          </h2>
          <p className="text-sm sm:text-base text-stone-600 mt-3 max-w-xl mx-auto">
            Mỗi mẫu thiết kế được tinh chỉnh tỉ mỉ về typography, hiệu ứng mở phong bì và nhịp điệu hiển thị ảnh cưới.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="group bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-block px-3 py-1 rounded-full text-[11px] font-medium tracking-wider uppercase bg-[#8C6D46]/10 text-[#8C6D46]">
                    {tpl.badge}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {tpl.accentColors.map((c) => (
                      <span
                        key={c.hex}
                        className="w-3.5 h-3.5 rounded-full border border-stone-300"
                        style={{ backgroundColor: c.hex }}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-serif text-stone-900">{tpl.name}</h3>
                <div className="text-xs text-[#8C6D46] font-medium tracking-wide mt-1 uppercase">
                  {tpl.subtitle}
                </div>
                <p className="text-xs sm:text-sm text-stone-600 mt-3 leading-relaxed">
                  {tpl.description}
                </p>

                {/* Feature Checklist */}
                <div className="mt-5 space-y-2 text-xs text-stone-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Phong bì lụa và con dấu sáp vàng đồng</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Bố cục ảnh cưới tạp chí cân bằng dọc/ngang</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Mã QR mừng cưới & Hộp lời chúc RSVP</span>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8 pt-0 flex items-center gap-3">
                <Link
                  href={`/thiep-cuoi/tao-moi?template=${tpl.id}`}
                  className="flex-1 h-11 rounded-xl bg-[#8C6D46] hover:bg-[#725735] text-white text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Dùng Mẫu Này</span>
                </Link>
                <Link
                  href={`/thiep-cuoi/tao-moi?template=${tpl.id}&demo=true`}
                  className="h-11 px-4 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-medium transition-colors flex items-center justify-center"
                >
                  Xem Mẫu Demo
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section className="max-w-5xl mx-auto px-6 lg:px-8 py-16 border-t border-stone-200">
        <div className="text-center mb-12">
          <span className="text-xs font-mono tracking-widest uppercase text-[#8C6D46]">Quy Trình Nhanh Gọn</span>
          <h2 className="text-2xl sm:text-3xl font-serif text-stone-900 mt-2">
            Chỉ 3 Phút Để Có Một Tấm Thiệp Cưới Hoàn Hảo
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-white border border-stone-200/80">
            <div className="w-10 h-10 rounded-full bg-[#8C6D46]/10 text-[#8C6D46] flex items-center justify-center font-serif text-lg font-bold mb-4">
              1
            </div>
            <h4 className="font-serif text-lg text-stone-900 mb-2">Điền Thông Tin & Chọn Mẫu</h4>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Nhập tên Cô Dâu – Chú Rể, ngày giờ tổ chức, địa chỉ nhà hàng và lời mời thân mật gửi tới khách quý.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-stone-200/80">
            <div className="w-10 h-10 rounded-full bg-[#8C6D46]/10 text-[#8C6D46] flex items-center justify-center font-serif text-lg font-bold mb-4">
              2
            </div>
            <h4 className="font-serif text-lg text-stone-900 mb-2">Tải Ảnh Cưới Lên</h4>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Chọn những tấm ảnh đẹp nhất của bạn. Hệ thống tự động tối ưu định dạng WebP sắc nét và xếp khung tự nhiên.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-stone-200/80">
            <div className="w-10 h-10 rounded-full bg-[#8C6D46]/10 text-[#8C6D46] flex items-center justify-center font-serif text-lg font-bold mb-4">
              3
            </div>
            <h4 className="font-serif text-lg text-stone-900 mb-2">Nhận Link & Gửi Thiệp</h4>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Nhận ngay đường link thiệp riêng kèm mã QR và mã PIN để bạn chủ động chỉnh sửa bất cứ lúc nào.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/thiep-cuoi/tao-moi"
            className="inline-flex items-center gap-2 h-12 px-8 rounded-full bg-[#8C6D46] hover:bg-[#725735] text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-md"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>Bắt Đầu Tạo Thiệp Cưới Của Bạn Ngay</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
