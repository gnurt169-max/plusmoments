'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  UploadCloud,
  X,
} from 'lucide-react';
import { TestimonialsManager } from '@/components/admin/TestimonialsManager';
import { SingleImagePicker } from '@/components/admin/ImageFieldPicker';
import { AdminMediaPickerModal } from '@/components/admin/AdminMediaPickerModal';

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

  // Media picker modal & direct upload states
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    heroFloatingImages: [] as string[],
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

          let parsedFloating: string[] = [];
          if (Array.isArray(data.config.heroFloatingImages)) {
            parsedFloating = data.config.heroFloatingImages;
          } else if (typeof data.config.heroFloatingImages === 'string') {
            try {
              parsedFloating = JSON.parse(data.config.heroFloatingImages);
            } catch {}
          }

          setFormData({
            heroBadge: data.config.heroBadge || '',
            heroTitle: data.config.heroTitle || '',
            heroSubtitle: data.config.heroSubtitle || '',
            heroBannerImage: data.config.heroBannerImage || '',
            heroFloatingImages: parsedFloating,
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

  // Media Picker handlers for Hero Floating Images
  const handleOpenMediaPicker = () => {
    setIsMediaPickerOpen(true);
  };

  const handleSelectMedia = (selectedUrls: string[]) => {
    setIsMediaPickerOpen(false);
    if (!selectedUrls || selectedUrls.length === 0) return;

    const current = [...(formData.heroFloatingImages || [])];
    const newUrls = selectedUrls.filter((u) => !current.includes(u));
    const merged = [...current, ...newUrls].slice(0, 10);
    setFormData({
      ...formData,
      heroFloatingImages: merged,
    });
    showToast(`Đã thêm ${newUrls.length} ảnh vào danh sách ảnh Hero rung rinh!`);
  };

  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fd = new FormData();
        fd.append('file', file);
        fd.append('folderSlug', 'home-hero');

        const res = await fetch('/api/admin/media/upload', {
          method: 'POST',
          body: fd,
        });
        const data = await res.json();
        if (data.success && data.media?.url) {
          uploadedUrls.push(data.media.url);
        }
      }

      if (uploadedUrls.length > 0) {
        const current = [...(formData.heroFloatingImages || [])];
        const merged = [...current, ...uploadedUrls].slice(0, 10);
        setFormData({
          ...formData,
          heroFloatingImages: merged,
        });
        showToast(`Đã tải lên và thêm ${uploadedUrls.length} ảnh mới thành công!`);
      }
    } catch (err: any) {
      showToast(`Lỗi khi tải ảnh: ${err.message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleMoveFloatingImage = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= formData.heroFloatingImages.length) return;

    const copy = [...formData.heroFloatingImages];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    setFormData({ ...formData, heroFloatingImages: copy });
  };

  const handleRemoveFloatingImage = (index: number) => {
    setFormData({
      ...formData,
      heroFloatingImages: formData.heroFloatingImages.filter((_, i) => i !== index),
    });
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
          heroFloatingImages: formData.heroFloatingImages,
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
          Tùy chỉnh biểu ngữ Hero, câu slogan, bộ sưu tập ảnh rung rinh bồng bềnh và mục cảm xúc dâu rể trên trang chủ.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('hero')}
          className={`px-4 py-2.5 rounded-xl text-xs font-medium uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'hero'
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
          className={`px-4 py-2.5 rounded-xl text-xs font-medium uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'testimonials'
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

          {/* Live Hero Preview With Floating Photos Mini Showcase */}
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

            {/* Ambient Gold Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(197,160,89,0.12)_0%,_transparent_70%)] pointer-events-none" />

            {/* Mini Floating Cards in Live Preview */}
            {formData.heroFloatingImages.slice(0, 4).map((url, idx) => {
              const posClasses = [
                'top-4 left-4 -rotate-6',
                'top-4 right-4 rotate-6',
                'bottom-6 left-6 rotate-4',
                'bottom-6 right-6 -rotate-4',
              ][idx];
              return (
                <div
                  key={idx}
                  className={`absolute hidden md:block w-16 h-22 rounded-xl p-1 bg-white/10 backdrop-blur-md border border-[#C5A059]/40 shadow-xl overflow-hidden z-10 transition-transform ${posClasses}`}
                >
                  <div className="relative w-full h-full rounded-lg overflow-hidden">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <span className="absolute bottom-0.5 right-0.5 px-1 py-0.2 rounded bg-black/70 text-[#E5C585] text-[7px] font-mono font-bold">
                      #{idx + 1}
                    </span>
                  </div>
                </div>
              );
            })}

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

            {/* =========================================================================
                2. BỘ SƯU TẬP ẢNH XUẤT HIỆN & RUNG RINH ĐẦU TRANG (HERO FLOATING GALLERY)
            ========================================================================= */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-lg font-light text-charcoal-900">
                      2. Bộ Sưu Tập Ảnh Xuất Hiện & Rung Rinh Đầu Trang (Hero Floating Gallery)
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-100 text-amber-900 border border-amber-200">
                      {formData.heroFloatingImages.length} Ảnh Đã Chọn
                    </span>
                  </div>
                  <p className="text-xs text-charcoal-500 font-light mt-1">
                    Các tấm ảnh cưới này sẽ lần lượt xuất hiện nối tiếp nhau và chuyển động rung rinh bồng bềnh êm ái xung quanh tiêu đề Hero Banner trên trang chủ.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleOpenMediaPicker}
                    className="px-3.5 py-2 rounded-xl bg-luxury-100 hover:bg-luxury-200 text-luxury-900 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-luxury-200"
                  >
                    <ImageIcon className="w-4 h-4 text-luxury-700" />
                    <span>Chọn Từ Kho Media</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-3.5 py-2 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-amber-200" />
                    ) : (
                      <UploadCloud className="w-4 h-4 text-amber-200" />
                    )}
                    <span>Tải Ảnh Mới Lên</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleDirectUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Instruction note box */}
              <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-950 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>Khuyến nghị từ PlusMoments:</strong> Nên chọn từ <strong>4 đến 8 tấm ảnh cưới xuất sắc nhất</strong> (kết hợp cả ảnh dọc 3:4 và ảnh ngang). Khi khách vào trang chủ, các ảnh sẽ lần lượt hiện ra theo đúng thứ tự từ <strong>#1</strong> đến hết và rung rinh bồng bềnh nhẹ nhàng quanh viền trang, không che khuất cụm tiêu đề chính.
                </div>
              </div>

              {/* Grid of Selected Floating Photos */}
              {formData.heroFloatingImages.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
                  {formData.heroFloatingImages.map((url, idx) => (
                    <div
                      key={idx}
                      className="group relative rounded-2xl overflow-hidden border-2 border-stone-200 hover:border-luxury-500 bg-stone-100 shadow-xs transition-all flex flex-col"
                    >
                      {/* Thumbnail Container */}
                      <div className="relative aspect-[3/4] w-full overflow-hidden bg-stone-900">
                        <img
                          src={url}
                          alt=""
                          className="w-full h-full object-cover object-[50%_20%]"
                        />

                        {/* Order Badge */}
                        <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-xs text-[#E5C585] text-[10px] font-mono font-bold shadow-md">
                          #{idx + 1}
                        </div>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveFloatingImage(idx)}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center transition-opacity opacity-80 hover:opacity-100 shadow-md cursor-pointer"
                          title="Bỏ ảnh này"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Reorder Controls */}
                      <div className="p-1.5 bg-white border-t border-stone-100 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => handleMoveFloatingImage(idx, 'left')}
                          disabled={idx === 0}
                          className="p-1 rounded-md text-stone-500 hover:text-charcoal-900 hover:bg-stone-100 disabled:opacity-20 cursor-pointer transition-colors"
                          title="Dời lên trước"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>

                        <span className="text-[10px] font-mono text-stone-400">
                          Thứ tự {idx + 1}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleMoveFloatingImage(idx, 'right')}
                          disabled={idx === formData.heroFloatingImages.length - 1}
                          className="p-1 rounded-md text-stone-500 hover:text-charcoal-900 hover:bg-stone-100 disabled:opacity-20 cursor-pointer transition-colors"
                          title="Dời ra sau"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 border-2 border-dashed border-stone-200 rounded-2xl flex flex-col items-center justify-center text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mb-2">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-medium text-stone-700">Chưa có ảnh Hero rung rinh nào được chọn</p>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Hệ thống sẽ tạm thời dùng các ảnh bìa album để tạo hiệu ứng. Hãy bấm nút phía trên để chọn ảnh độc quyền.
                  </p>
                </div>
              )}
            </div>

            {/* Dynamic Stats Configuration */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <h3 className="font-serif text-lg font-light text-charcoal-900">
                    3. Số Liệu Thống Kê Nổi Bật (Stats Highlights)
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
                4. Triết Lý Nghệ Thuật & Thông Điệp Cưới
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

          {/* Media Picker Modal */}
          <AdminMediaPickerModal
            isOpen={isMediaPickerOpen}
            onClose={() => setIsMediaPickerOpen(false)}
            onSelect={handleSelectMedia}
            multiple={true}
            title="Chọn Ảnh Cho Bố Cục Hero Rung Rinh (Tối Đa 8 Ảnh)"
          />
        </>
      )}
    </div>
  );
}
