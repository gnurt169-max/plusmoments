'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  MessageSquareHeart,
  Star,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Sparkles,
  Save,
  Check,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { DriveMediaPicker } from '@/components/admin/DriveMediaPicker';
import { SingleImagePicker } from '@/components/admin/ImageFieldPicker';

export interface TestimonialItem {
  id: string;
  coupleNames: string;
  weddingDate?: string | null;
  rating: number;
  quote: string;
  content?: string | null;
  reviewContent?: string | null;
  avatarUrl?: string | null;
  coverImageUrl?: string | null;
  featured?: boolean;
  isFeatured?: boolean;
  orderIndex: number;
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export function TestimonialsManager() {
  // Global home config state for testimonials section
  const [showTestimonials, setShowTestimonials] = useState(true);
  const [testimonialsTitle, setTestimonialsTitle] = useState('Cảm Xúc Của Các Dâu Rể');
  const [testimonialsSubtitle, setTestimonialsSubtitle] = useState(
    'Hạnh phúc của bạn chính là niềm tự hào lớn nhất của ekip sáng tạo PlusMoments'
  );
  const [savingConfig, setSavingConfig] = useState(false);

  // Testimonials list state
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Modal create/edit state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Drive picker modal
  const [isDrivePickerOpen, setIsDrivePickerOpen] = useState(false);

  // Delete confirm modal state
  const [deletingItem, setDeletingItem] = useState<TestimonialItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Form state
  const [formCoupleNames, setFormCoupleNames] = useState('');
  const [formWeddingDate, setFormWeddingDate] = useState('');
  const [formRating, setFormRating] = useState(5);
  const [formQuote, setFormQuote] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formAvatarUrl, setFormAvatarUrl] = useState('');
  const [formFeatured, setFormFeatured] = useState(true);
  const [formPublished, setFormPublished] = useState(true);
  const [formOrderIndex, setFormOrderIndex] = useState(0);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch home config & testimonials
  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const [homeRes, testRes] = await Promise.all([
        fetch('/api/admin/home'),
        fetch('/api/admin/testimonials'),
      ]);

      const homeData = await homeRes.json();
      if (homeData.success && homeData.config) {
        setShowTestimonials(homeData.config.showTestimonials !== false);
        if (homeData.config.testimonialsTitle) {
          setTestimonialsTitle(homeData.config.testimonialsTitle);
        }
        if (homeData.config.testimonialsSubtitle) {
          setTestimonialsSubtitle(homeData.config.testimonialsSubtitle);
        }
      }

      const testData = await testRes.json();
      if (testData.success) {
        setTestimonials(testData.testimonials || []);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi tải dữ liệu đánh giá.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Save Home config toggle & titles
  const handleSaveConfig = async (overrideShow?: boolean) => {
    setSavingConfig(true);
    setErrorMessage('');
    const targetShow = overrideShow !== undefined ? overrideShow : showTestimonials;

    try {
      const res = await fetch('/api/admin/home', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          showTestimonials: targetShow,
          testimonialsTitle,
          testimonialsSubtitle,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Lỗi lưu cấu hình hiển thị.');
      }

      if (overrideShow !== undefined) {
        setShowTestimonials(overrideShow);
      }
      showToast(
        targetShow
          ? 'Đã BẬT hiển thị mục Cảm Xúc Dâu Rể trên Trang Chủ!'
          : 'Đã TẮT mục Cảm Xúc Dâu Rể (đã ẩn khỏi Trang Chủ)!'
      );
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể lưu cấu hình hiển thị.');
    } finally {
      setSavingConfig(false);
    }
  };

  // Open modal to create
  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormCoupleNames('');
    setFormWeddingDate('');
    setFormRating(5);
    setFormQuote('');
    setFormContent('');
    setFormAvatarUrl('');
    setFormFeatured(true);
    setFormPublished(true);
    setFormOrderIndex(testimonials.length);
    setIsModalOpen(true);
  };

  // Open modal to edit
  const handleOpenEditModal = (item: TestimonialItem) => {
    setEditingId(item.id);
    setFormCoupleNames(item.coupleNames || '');
    setFormWeddingDate(item.weddingDate || '');
    setFormRating(item.rating || 5);
    setFormQuote(item.quote || '');
    setFormContent(item.content || item.reviewContent || '');
    setFormAvatarUrl(item.avatarUrl || item.coverImageUrl || '');
    setFormFeatured(item.featured ?? item.isFeatured ?? true);
    setFormPublished(item.published !== false);
    setFormOrderIndex(item.orderIndex || 0);
    setIsModalOpen(true);
  };

  // Handle submit form (Create or Update)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCoupleNames.trim()) {
      alert('Vui lòng nhập tên cặp đôi!');
      return;
    }
    if (!formQuote.trim()) {
      alert('Vui lòng nhập dòng trích dẫn nổi bật!');
      return;
    }
    if (!formContent.trim()) {
      alert('Vui lòng nhập nội dung đánh giá chi tiết!');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        coupleNames: formCoupleNames.trim(),
        weddingDate: formWeddingDate.trim(),
        rating: formRating,
        quote: formQuote.trim(),
        content: formContent.trim(),
        avatarUrl: formAvatarUrl.trim(),
        coverImageUrl: formAvatarUrl.trim(),
        featured: formFeatured,
        published: formPublished,
        orderIndex: Number(formOrderIndex) || 0,
      };

      const url = editingId
        ? `/api/admin/testimonials/${editingId}`
        : '/api/admin/testimonials';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Lỗi khi lưu đánh giá.');
      }

      showToast(
        editingId
          ? 'Đã cập nhật đánh giá thành công!'
          : 'Đã thêm đánh giá dâu rể mới thành công!'
      );
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi thực hiện.');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle quick published
  const handleTogglePublished = async (item: TestimonialItem) => {
    const nextState = !item.published;
    try {
      const res = await fetch(`/api/admin/testimonials/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: nextState }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Lỗi cập nhật trạng thái.');
      }
      setTestimonials((prev) =>
        prev.map((t) => (t.id === item.id ? { ...t, published: nextState } : t))
      );
      showToast(
        nextState
          ? `Đã hiển thị đánh giá của ${item.coupleNames}`
          : `Đã tạm ẩn đánh giá của ${item.coupleNames}`
      );
    } catch (err: any) {
      alert(err.message || 'Lỗi cập nhật trạng thái.');
    }
  };

  // Handle delete
  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/testimonials/${deletingItem.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Lỗi khi xóa đánh giá.');
      }
      setTestimonials((prev) => prev.filter((t) => t.id !== deletingItem.id));
      showToast(`Đã xóa đánh giá của ${deletingItem.coupleNames} thành công!`);
      setDeletingItem(null);
    } catch (err: any) {
      alert(err.message || 'Lỗi xóa đánh giá.');
    } finally {
      setDeleting(false);
    }
  };

  // Handle select image from Google Drive
  const handleDriveSelect = (urls: string[]) => {
    if (urls.length > 0) {
      setFormAvatarUrl(urls[0]);
      showToast('Đã đồng bộ ảnh dâu rể từ Google Drive!');
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-8 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl bg-charcoal-900 text-white text-xs shadow-2xl border border-luxury-500/40 animate-in fade-in duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 1. HOMEPAGE TESTIMONIALS TOGGLE & DISPLAY CONFIGURATION */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-amber-50 rounded-xl text-amber-600">
                <MessageSquareHeart className="w-5 h-5" />
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-light text-charcoal-900">
                Cấu Hình Hiển Thị Trên Trang Chủ
              </h2>
            </div>
            <p className="text-xs text-charcoal-500 font-light">
              Bật hoặc tắt toàn bộ khu vực "Cảm Xúc Của Các Dâu Rể" ngoài trang chủ chỉ bằng 1 nút gạt.
            </p>
          </div>

          {/* Master Toggle Switch */}
          <div className="flex items-center gap-3 bg-stone-50 p-2.5 sm:p-3 rounded-2xl border border-stone-200 shrink-0">
            <span className="text-xs font-medium text-charcoal-700">
              {showTestimonials ? (
                <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Đang Hiển Thị
                </span>
              ) : (
                <span className="text-stone-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-stone-400" />
                  Đang Ẩn
                </span>
              )}
            </span>

            <button
              type="button"
              onClick={() => handleSaveConfig(!showTestimonials)}
              disabled={savingConfig}
              className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-luxury-400 ${
                showTestimonials ? 'bg-emerald-600' : 'bg-stone-300'
              }`}
            >
              <span className="sr-only">Bật tắt mục đánh giá</span>
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  showTestimonials ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Section Title & Subtitle Edit */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
          <div>
            <label className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1.5 font-medium">
              Tiêu Đề Khu Vực (Section Title)
            </label>
            <input
              type="text"
              value={testimonialsTitle}
              onChange={(e) => setTestimonialsTitle(e.target.value)}
              placeholder="Cảm Xúc Của Các Dâu Rể"
              className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl font-serif focus:bg-white focus:outline-none focus:ring-2 focus:ring-luxury-400"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1.5 font-medium">
              Phụ Đề / Thông Điệp Cưới (Section Subtitle)
            </label>
            <input
              type="text"
              value={testimonialsSubtitle}
              onChange={(e) => setTestimonialsSubtitle(e.target.value)}
              placeholder="Hạnh phúc của bạn chính là niềm tự hào lớn nhất..."
              className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-luxury-400"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => handleSaveConfig()}
            disabled={savingConfig}
            className="px-5 py-2.5 rounded-xl bg-charcoal-900 text-white font-medium text-xs uppercase tracking-wider hover:bg-charcoal-800 transition-all flex items-center gap-2 shadow-sm disabled:opacity-60 cursor-pointer"
          >
            {savingConfig ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-luxury-400" />
                <span>Đang Lưu...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-luxury-400" />
                <span>Lưu Tiêu Đề Khu Vực</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. TESTIMONIALS LIST & MANAGEMENT */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-light text-charcoal-900">
              Danh Sách Đánh Giá Dâu Rể ({testimonials.length})
            </h3>
            <p className="text-xs text-charcoal-500 font-light mt-0.5">
              Quản lý các lời cảm ơn, review 5 sao và ảnh kỷ niệm của các cặp đôi để hiển thị trên website.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-5 py-2.5 rounded-xl bg-luxury-600 hover:bg-luxury-700 text-white text-xs font-medium uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Đánh Giá Mới</span>
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-charcoal-400 space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-luxury-600 mx-auto" />
            <p className="text-xs">Đang tải danh sách đánh giá dâu rể...</p>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed border-stone-200 rounded-2xl p-8 space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
              <MessageSquareHeart className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-serif text-lg font-light text-charcoal-900">
                Chưa có đánh giá dâu rể nào
              </h4>
              <p className="text-xs text-charcoal-500 max-w-md mx-auto">
                Bấm vào nút "Thêm Đánh Giá Mới" để đưa những câu chuyện tình yêu và nhận xét đầu tiên lên trang chủ.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="px-5 py-2.5 rounded-xl bg-charcoal-900 text-white text-xs font-medium uppercase tracking-wider inline-flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4 text-luxury-400" />
              <span>Thêm Đánh Giá Đầu Tiên</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((item) => {
              const avatar = item.avatarUrl || item.coverImageUrl || '';
              const contentText = item.content || item.reviewContent || '';
              const isFeat = item.featured ?? item.isFeatured ?? true;

              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 relative ${
                    item.published
                      ? 'bg-white border-stone-200 shadow-sm hover:shadow-md'
                      : 'bg-stone-50/80 border-stone-200/60 opacity-75'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header: Avatar, Couple, Rating, Status Badges */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <div className="relative w-13 h-13 rounded-full overflow-hidden bg-amber-50 border border-luxury-200 shadow-xs shrink-0 flex items-center justify-center text-amber-800 font-serif font-bold text-sm">
                          {avatar ? (
                            <img
                              src={avatar}
                              alt={item.coupleNames}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>{(item.coupleNames || 'PM').slice(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-serif text-base font-semibold text-charcoal-900 leading-snug">
                            {item.coupleNames}
                          </h4>
                          {item.weddingDate && (
                            <p className="text-[11px] text-stone-500 font-mono">
                              {item.weddingDate}
                            </p>
                          )}
                          <div className="flex items-center gap-1 text-amber-500 mt-1">
                            {[...Array(item.rating || 5)].map((_, i) => (
                              <Star
                                key={i}
                                className="w-3.5 h-3.5 fill-amber-500 text-amber-500"
                              />
                            ))}
                            <span className="text-[10px] text-stone-400 font-mono ml-1">
                              ({item.rating || 5}/5)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        {item.published ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-medium border border-emerald-200/60 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Hiển thị
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-500 text-[10px] font-medium border border-stone-200 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
                            Đã ẩn
                          </span>
                        )}

                        {isFeat && (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-medium border border-amber-200/60 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                            Nổi bật
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quote & Content */}
                    <div className="space-y-2 pt-2 border-t border-stone-100">
                      <blockquote className="font-serif text-sm font-medium text-charcoal-900 italic">
                        "{item.quote}"
                      </blockquote>
                      <p className="text-xs text-charcoal-600 font-light leading-relaxed line-clamp-3">
                        {contentText}
                      </p>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-stone-100">
                    <span className="text-[10px] text-stone-400 font-mono">
                      Thứ tự: #{item.orderIndex}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* Toggle Quick Published */}
                      <button
                        type="button"
                        onClick={() => handleTogglePublished(item)}
                        className={`p-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                          item.published
                            ? 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={item.published ? 'Bấm để ẩn đánh giá này' : 'Bấm để hiển thị'}
                      >
                        {item.published ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(item)}
                        className="p-2 text-stone-600 hover:text-luxury-700 hover:bg-luxury-50 rounded-lg transition-colors cursor-pointer"
                        title="Chỉnh sửa đánh giá"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => setDeletingItem(item)}
                        className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Xóa đánh giá"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. MODAL CREATE / EDIT TESTIMONIAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Chỉnh Sửa Đánh Giá Dâu Rể' : 'Thêm Đánh Giá Dâu Rể Mới'}
        subtitle="Chia sẻ cảm xúc chân thật từ cặp đôi để xây dựng niềm tin với khách hàng mới"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmitForm} className="space-y-5 pt-2">
          {/* Row 1: Couple Names & Wedding Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal-700 font-medium mb-1.5">
                Tên Cặp Đôi (Dâu & Rể) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formCoupleNames}
                onChange={(e) => setFormCoupleNames(e.target.value)}
                placeholder="ví dụ: Đức Anh & Mai Phương"
                className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-luxury-400 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal-700 font-medium mb-1.5">
                Ngày Cưới / Chụp Kỷ Niệm
              </label>
              <input
                type="text"
                value={formWeddingDate}
                onChange={(e) => setFormWeddingDate(e.target.value)}
                placeholder="ví dụ: Tháng 10, 2026"
                className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-luxury-400"
              />
            </div>
          </div>

          {/* Row 2: Star Rating & Order Index */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal-700 font-medium mb-1.5">
                Số Sao Đánh Giá (Rating)
              </label>
              <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 px-3.5 py-2 rounded-xl">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormRating(star)}
                    className="p-1 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= formRating
                          ? 'fill-amber-400 text-amber-500'
                          : 'fill-stone-200 text-stone-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-mono font-medium text-charcoal-700 ml-2">
                  {formRating}/5 Sao
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal-700 font-medium mb-1.5">
                Thứ Tự Sắp Xếp (Thấp xếp trước)
              </label>
              <input
                type="number"
                value={formOrderIndex}
                onChange={(e) => setFormOrderIndex(Number(e.target.value))}
                className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-luxury-400"
              />
            </div>
          </div>

          {/* Quote: Dòng trích dẫn in đậm */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-charcoal-700 font-medium mb-1.5">
              Câu Trích Dẫn Nổi Bật (Quote In Đậm) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formQuote}
              onChange={(e) => setFormQuote(e.target.value)}
              placeholder="ví dụ: Ekip PlusMoments làm việc cực kỳ có tâm, từng bức ảnh đều chạm đến cảm xúc!"
              className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl font-serif italic text-charcoal-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-luxury-400"
            />
          </div>

          {/* Content: Nội dung chia sẻ chi tiết */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-charcoal-700 font-medium mb-1.5">
              Nội Dung Đánh Giá Chi Tiết <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              placeholder="Chia sẻ trải nghiệm về thái độ ekip, váy cưới, góc chụp, màu ảnh hoặc sự chu đáo trong ngày chụp..."
              className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-luxury-400 leading-relaxed resize-none"
            />
          </div>

          {/* Avatar Url & Media Library Picker */}
          <SingleImagePicker
            label="Ảnh Đại Diện Dâu Rể (Avatar / Ảnh Cưới)"
            value={formAvatarUrl}
            onChange={(url) => setFormAvatarUrl(url)}
            aspectRatio="square"
            modalTitle="Chọn Ảnh Avatar Cặp Đôi Dâu Rể"
            helperText="Khuyến nghị dùng ảnh chân dung vuông tỉ lệ 1:1 rõ nét. Ảnh hiển thị trên trang chủ và danh sách đánh giá."
          />

          {/* Checkboxes: Featured & Published */}
          <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-stone-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formPublished}
                onChange={(e) => setFormPublished(e.target.checked)}
                className="w-4 h-4 rounded text-luxury-600 focus:ring-luxury-400"
              />
              <span className="text-xs text-charcoal-700 font-medium">
                Xuất bản ngay (Published)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formFeatured}
                onChange={(e) => setFormFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-luxury-600 focus:ring-luxury-400"
              />
              <span className="text-xs text-charcoal-700 font-medium">
                Đánh dấu Nổi Bật trên Trang Chủ (Featured)
              </span>
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 rounded-xl border border-stone-200 text-charcoal-600 text-xs font-medium hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-charcoal-900 text-white text-xs font-medium uppercase tracking-wider hover:bg-charcoal-800 transition-all flex items-center gap-2 shadow-lg disabled:opacity-60 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-luxury-400" />
                  <span>Đang Lưu...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 text-luxury-400" />
                  <span>{editingId ? 'Cập Nhật Đánh Giá' : 'Lưu Đánh Giá Mới'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* 4. CONFIRM DELETE DIALOG */}
      <Modal
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        title="Xác Nhận Xóa Đánh Giá"
        subtitle="Hành động này không thể hoàn tác sau khi thực hiện"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-charcoal-700 leading-relaxed">
            Bạn có chắc chắn muốn xóa vĩnh viễn bài đánh giá của cặp đôi{' '}
            <strong className="text-charcoal-950 font-semibold font-serif">
              "{deletingItem?.coupleNames}"
            </strong>{' '}
            khỏi hệ thống?
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setDeletingItem(null)}
              className="px-4 py-2 rounded-xl border border-stone-200 text-charcoal-600 text-xs font-medium hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={handleDeleteConfirm}
              className="px-5 py-2 rounded-xl bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-60 cursor-pointer"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang Xóa...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa Vĩnh Viễn</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* 5. GOOGLE DRIVE MEDIA PICKER INTEGRATION */}
      <DriveMediaPicker
        isOpen={isDrivePickerOpen}
        onClose={() => setIsDrivePickerOpen(false)}
        onSuccess={handleDriveSelect}
        mode="single"
        title="Chọn Ảnh Dâu Rể Làm Avatar (Tự Động Nén WebP)"
      />
    </div>
  );
}

