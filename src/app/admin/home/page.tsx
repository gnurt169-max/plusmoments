'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Plus,
  Trash2,
  MessageSquareHeart,
} from 'lucide-react';
import { TestimonialsManager } from '@/components/admin/TestimonialsManager';
import { SingleImagePicker } from '@/components/admin/ImageFieldPicker';

interface StatItem {
  label: string;
  value: string;
}

export default function AdminHomePageConfig() {
  const [activeTab, setActiveTab] = useState<'hero' | 'testimonials'>('hero');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('tab') === 'testimonials') {
        setActiveTab('testimonials');
      }
    }
  }, []);

  const [formData, setFormData] = useState({
    heroBadge: 'Luxury Wedding Photography & Cinematic Art',
    heroTitle: 'Nơi Tình Yêu Trở Thành Tác Phẩm Nghệ Thuật',
    heroSubtitle:
      'PlusMoments không đơn thuần chụp lại những tư thế, chúng tôi lưu giữ ánh nhìn say đắm, những cái ôm siết chặt và rung cảm thuần khiết nhất của hai bạn trong từng khung hình điện ảnh.',
    heroBannerImage: '',
    stats: [
      { label: 'Cặp Đôi Hạnh Phúc', value: '500+' },
      { label: 'Váy Cưới Cao Cấp', value: '100%' },
      { label: 'Đánh Giá Tuyệt Đối', value: '5.0 ★' },
    ] as StatItem[],
    philosophyTitle: 'Nghệ Thuật Của Những Rung Cảm',
    philosophyText:
      'Chúng tôi không tìm kiếm sự hoàn hảo của những bức tượng sáp. Chúng tôi đi tìm giọt nước mắt hạnh phúc của người cha, ánh mắt rung rinh của chú rể và nụ cười rạng ngời của cô dâu trong khoảnh khắc thiêng liêng nhất cuộc đời.',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    fetch('/api/admin/home')
      .then((res) => res.json())
      .then((data) => {
        if (data.config) {
          let parsedStats: StatItem[] = [];
          try {
            parsedStats = JSON.parse(data.config.statsJson || '[]');
          } catch {
            parsedStats = [
              { label: 'Cặp Đôi Hạnh Phúc', value: '500+' },
              { label: 'Váy Cưới Cao Cấp', value: '100%' },
              { label: 'Đánh Giá Tuyệt Đối', value: '5.0 ★' },
            ];
          }

          setFormData({
            heroBadge: data.config.heroBadge || '',
            heroTitle: data.config.heroTitle || '',
            heroSubtitle: data.config.heroSubtitle || '',
            heroBannerImage: data.config.heroBannerImage || '',
            stats: parsedStats,
            philosophyTitle: data.config.philosophyTitle || '',
            philosophyText: data.config.philosophyText || '',
          });
        }
      })
      .catch(() => setErrorMessage('Không thể tải cấu hình trang chủ.'))
      .finally(() => setLoading(false));
  }, []);

  const handleAddStat = () => {
    setFormData({
      ...formData,
      stats: [...formData.stats, { label: 'Chỉ số mới', value: '100+' }],
    });
  };

  const handleRemoveStat = (index: number) => {
    setFormData({
      ...formData,
      stats: formData.stats.filter((_, i) => i !== index),
    });
  };

  const handleStatChange = (index: number, key: 'label' | 'value', val: string) => {
    const updated = [...formData.stats];
    updated[index][key] = val;
    setFormData({ ...formData, stats: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/admin/home', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heroBadge: formData.heroBadge,
          heroTitle: formData.heroTitle,
          heroSubtitle: formData.heroSubtitle,
          heroBannerImage: formData.heroBannerImage,
          statsJson: JSON.stringify(formData.stats),
          philosophyTitle: formData.philosophyTitle,
          philosophyText: formData.philosophyText,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Lỗi cập nhật cấu hình trang chủ.');
      }

      showToast('Đã lưu cấu hình Trang Chủ và làm mới toàn bộ trang ngoài!');
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi kết nối khi cập nhật.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-charcoal-400 gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-luxury-600" />
        <span className="text-xs">Đang tải cấu hình trang chủ...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      {toastMessage && (
        <div className="fixed top-24 right-8 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl bg-charcoal-900 text-white text-xs shadow-2xl border border-luxury-500/40 animate-in fade-in duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      <div>
        <h1 className="font-serif text-3xl font-light text-charcoal-900">
          Quản Lý Nội Dung Trang Chủ (Home CMS)
        </h1>
        <p className="text-xs text-charcoal-500 mt-1">
          Tùy chỉnh biểu ngữ Hero, câu slogan, ảnh nền điện ảnh và quản lý mục cảm xúc dâu rể trên trang chủ.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('hero')}
          className={`px-4 py-2.5 rounded-xl text-xs font-medium uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'hero'
            ? 'bg-charcoal-900 text-white shadow-md'
            : 'text-charcoal-600 bg-white hover:bg-stone-100 border border-stone-200'
            }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-luxury-400" />
          <span>Hero Banner & Triết Lý</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('testimonials')}
          className={`px-4 py-2.5 rounded-xl text-xs font-medium uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'testimonials'
            ? 'bg-charcoal-900 text-white shadow-md'
            : 'text-charcoal-600 bg-white hover:bg-stone-100 border border-stone-200'
            }`}
        >
          <MessageSquareHeart className="w-3.5 h-3.5 text-luxury-400" />
          <span>Cảm Xúc Dâu Rể (Testimonials)</span>
        </button>
      </div>

      {activeTab === 'testimonials' ? (
        <TestimonialsManager />
      ) : (
        <>
          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Live Hero Preview */}
          <div className="relative rounded-3xl overflow-hidden bg-charcoal-950 text-white p-8 sm:p-12 shadow-2xl border border-charcoal-800">
            <div className="absolute inset-0 -z-0 opacity-40">
              {formData.heroBannerImage && (
                <Image
                  src={formData.heroBannerImage}
                  alt="Hero Preview"
                  fill
                  className="object-cover"
                />
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/70 to-transparent -z-0" />

            <div className="relative z-10 max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] tracking-widest uppercase text-amber-200">
                <Sparkles className="w-3 h-3" />
                <span>{formData.heroBadge || 'Hero Badge'}</span>
              </div>

              <h2 className="font-serif text-2xl sm:text-4xl font-light leading-tight">
                {formData.heroTitle || 'Tiêu Đề Hero'}
              </h2>

              <p className="text-xs sm:text-sm text-stone-300 line-clamp-3 font-light leading-relaxed">
                {formData.heroSubtitle || 'Mô tả phụ giới thiệu phong cách ảnh cưới...'}
              </p>

              {/* Stats Preview */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-white/15">
                {formData.stats.map((st, i) => (
                  <div key={i} className="text-left">
                    <p className="font-serif text-xl sm:text-2xl font-light text-amber-200">
                      {st.value}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-stone-400">
                      {st.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Configuration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm space-y-6">
              <h3 className="font-serif text-lg font-light text-charcoal-900 border-b border-stone-100 pb-3">
                1. Biểu Ngữ Hero & Ảnh Bìa
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1 font-medium">
                    Dòng Tagline Badge
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.heroBadge}
                    onChange={(e) => setFormData({ ...formData, heroBadge: e.target.value })}
                    className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-luxury-400"
                  />
                </div>

                <div>
                  <SingleImagePicker
                    label="Ảnh Bìa Chính Hero Banner (1920x1080)"
                    value={formData.heroBannerImage}
                    onChange={(url) => setFormData({ ...formData, heroBannerImage: url })}
                    aspectRatio="video"
                    defaultOrientation="landscape"
                    required
                    modalTitle="Chọn Ảnh Banner Hero Trang Chủ"
                    helperText="Ảnh bìa lớn toàn màn hình xuất hiện ngay khi người dùng truy cập trang chủ."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1 font-medium">
                  Tiêu Đề Chính Hero (Hỗ trợ xuống dòng tự nhiên)
                </label>
                <input
                  type="text"
                  required
                  value={formData.heroTitle}
                  onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl font-serif focus:bg-white focus:outline-none focus:ring-2 focus:ring-luxury-400"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1 font-medium">
                  Đoạn Văn Giới Thiệu Cảm Xúc (Hero Subtitle)
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.heroSubtitle}
                  onChange={(e) =>
                    setFormData({ ...formData, heroSubtitle: e.target.value })
                  }
                  className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-luxury-400 resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Dynamic Stats Configuration */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <h3 className="font-serif text-lg font-light text-charcoal-900">
                    2. Số Liệu Thống Kê Nổi Bật (Stats Highlights)
                  </h3>
                  <p className="text-xs text-charcoal-500 font-light mt-0.5">
                    Các con số bảo chứng uy tín thương hiệu (ví dụ: 500+ Cặp Đôi, 10 Năm Kinh Nghiệm).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddStat}
                  className="px-3.5 py-1.5 rounded-lg bg-luxury-100 text-luxury-800 hover:bg-luxury-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm Chỉ Số</span>
                </button>
              </div>

              <div className="space-y-3">
                {formData.stats.map((stat, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Con số (vd: 500+)"
                      value={stat.value}
                      onChange={(e) => handleStatChange(idx, 'value', e.target.value)}
                      className="w-36 px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-luxury-400"
                    />
                    <input
                      type="text"
                      placeholder="Nhãn (vd: Cặp Đôi Hạnh Phúc)"
                      value={stat.label}
                      onChange={(e) => handleStatChange(idx, 'label', e.target.value)}
                      className="flex-1 px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-luxury-400"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveStat(idx)}
                      className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Philosophy Section */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm space-y-4">
              <h3 className="font-serif text-lg font-light text-charcoal-900 border-b border-stone-100 pb-3">
                3. Triết Lý Nghệ Thuật & Thông Điệp Cưới
              </h3>

              <div>
                <label className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1 font-medium">
                  Tiêu Đề Thông Điệp
                </label>
                <input
                  type="text"
                  value={formData.philosophyTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, philosophyTitle: e.target.value })
                  }
                  className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-luxury-400"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1 font-medium">
                  Nội Dung Triết Lý
                </label>
                <textarea
                  rows={3}
                  value={formData.philosophyText}
                  onChange={(e) =>
                    setFormData({ ...formData, philosophyText: e.target.value })
                  }
                  className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-luxury-400 resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Action Button */}
            <div className="flex items-center justify-end gap-4 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 rounded-xl bg-charcoal-900 text-white font-medium text-xs uppercase tracking-wider hover:bg-charcoal-800 transition-all flex items-center gap-2 shadow-lg disabled:opacity-60 cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-luxury-400" />
                    <span>Đang Lưu Cấu Hình...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-luxury-400" />
                    <span>Lưu Thay Đổi Trang Chủ (Revalidate)</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}

