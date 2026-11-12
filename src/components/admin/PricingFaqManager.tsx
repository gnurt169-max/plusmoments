'use client';

import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

export interface PricingFaqItem {
  id?: string;
  question: string;
  answer: string;
  order?: number;
  isActive?: boolean;
}

interface PricingFaqManagerProps {
  onSuccessNotification?: (msg: string) => void;
}

export function PricingFaqManager({ onSuccessNotification }: PricingFaqManagerProps) {
  const [faqs, setFaqs] = useState<PricingFaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load existing FAQs from API
  useEffect(() => {
    let isMounted = true;
    async function loadFaqs() {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/faqs');
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.faqs)) {
          setFaqs(data.faqs);
        }
      } catch (err: any) {
        console.error('Failed to load FAQs:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadFaqs();
    return () => {
      isMounted = false;
    };
  }, []);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 4000);
  };

  const handleAddFaq = () => {
    const newFaq: PricingFaqItem = {
      id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      question: '',
      answer: '',
      order: faqs.length,
      isActive: true,
    };
    setFaqs((prev) => [...prev, newFaq]);
  };

  const handleUpdateFaq = (index: number, field: keyof PricingFaqItem, value: any) => {
    setFaqs((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleMoveFaq = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= faqs.length) return;

    setFaqs((prev) => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next.map((item, idx) => ({ ...item, order: idx }));
    });
  };

  const handleDeleteFaq = (index: number) => {
    const target = faqs[index];
    const confirmMessage = target.question.trim()
      ? `Bạn có chắc chắn muốn xóa câu hỏi "${target.question}"?`
      : 'Bạn có chắc chắn muốn xóa câu hỏi này?';

    if (window.confirm(confirmMessage)) {
      setFaqs((prev) => prev.filter((_, idx) => idx !== index));
    }
  };

  const handleSave = async () => {
    // Basic validation
    const hasEmptyField = faqs.some((f) => !f.question.trim() || !f.answer.trim());
    if (hasEmptyField) {
      showFeedback('error', 'Vui lòng điền đầy đủ cả Câu hỏi và Câu trả lời cho tất cả các mục trước khi lưu.');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch('/api/admin/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ faqs }),
      });
      const data = await res.json();

      if (data.success) {
        if (Array.isArray(data.faqs)) {
          setFaqs(data.faqs);
        }
        showFeedback('success', data.message || 'Lưu danh sách Câu Hỏi Thường Gặp thành công!');
        if (onSuccessNotification) {
          onSuccessNotification(data.message || 'Đã lưu danh sách câu hỏi thành công!');
        }
      } else {
        showFeedback('error', data.error || 'Không thể lưu câu hỏi. Vui lòng thử lại.');
      }
    } catch (err: any) {
      console.error('Error saving FAQs:', err);
      showFeedback('error', err.message || 'Lỗi kết nối máy chủ.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-luxury-700">
            <HelpCircle className="w-5 h-5 text-luxury-600" />
            <h3 className="font-serif text-lg sm:text-xl font-medium text-charcoal-900">
              Câu Hỏi Thường Gặp (FAQ - Trang Bảng Giá)
            </h3>
          </div>
          <p className="text-xs text-stone-500 font-light">
            Quản lý nội dung hỏi đáp hiển thị ở chân trang <strong>/bang-gia</strong> và tạo dữ liệu có cấu trúc Rich Snippet <strong>Schema FAQPage</strong> cho Google Search.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleAddFaq}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-charcoal-800 text-xs font-medium rounded-xl transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-luxury-600" />
            <span>Thêm câu hỏi mới</span>
          </button>

          <button
            type="button"
            disabled={saving || loading}
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-luxury-700 to-luxury-600 hover:from-luxury-800 hover:to-luxury-700 text-white text-xs font-semibold rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-60 cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Đang lưu...' : 'Lưu danh sách FAQ'}</span>
          </button>
        </div>
      </div>

      {/* Toast Feedback Banner */}
      {feedback && (
        <div
          role="status"
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span className="font-medium">{feedback.message}</span>
        </div>
      )}

      {/* Content list */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-2 text-stone-400">
          <Loader2 className="w-6 h-6 animate-spin text-luxury-600" />
          <span className="text-xs">Đang tải danh sách câu hỏi...</span>
        </div>
      ) : faqs.length === 0 ? (
        <div className="py-14 px-6 text-center bg-[#FAF8F5] rounded-2xl border border-dashed border-stone-300 space-y-3">
          <HelpCircle className="w-10 h-10 text-stone-300 mx-auto" />
          <div className="space-y-1">
            <p className="font-serif text-sm font-medium text-charcoal-800">
              Chưa có câu hỏi thường gặp nào
            </p>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Khi danh sách rỗng, mục "Câu Hỏi Thường Gặp" trên trang /bang-gia sẽ tự động ẩn để giữ giao diện luôn gọn gàng.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddFaq}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-charcoal-900 hover:bg-charcoal-800 text-white text-xs font-medium rounded-xl transition-colors cursor-pointer mt-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo câu hỏi đầu tiên</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const questionId = `pricing-faq-q-${index}`;
            const answerId = `pricing-faq-a-${index}`;

            return (
              <div
                key={faq.id || index}
                className={`p-5 rounded-2xl border transition-all ${
                  faq.isActive !== false
                    ? 'bg-[#FAF8F5]/80 border-stone-200/90 shadow-2xs hover:border-[#C5A880]/60'
                    : 'bg-stone-50 border-dashed border-stone-300 opacity-60'
                }`}
              >
                {/* Card header controls */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-200/60">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-luxury-100 text-luxury-800 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-xs font-semibold text-charcoal-800">
                      Câu hỏi #{index + 1}
                    </span>
                    {faq.isActive === false && (
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-stone-200 text-stone-600 font-medium">
                        Đang ẩn
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Toggle visibility */}
                    <button
                      type="button"
                      onClick={() => handleUpdateFaq(index, 'isActive', !(faq.isActive ?? true))}
                      aria-label={faq.isActive !== false ? `Ẩn câu hỏi ${index + 1}` : `Hiện câu hỏi ${index + 1}`}
                      className="p-1.5 text-stone-400 hover:text-charcoal-700 hover:bg-stone-200/60 rounded-lg transition-colors cursor-pointer"
                      title={faq.isActive !== false ? 'Đang hiển thị (bấm để ẩn)' : 'Đang ẩn (bấm để hiển thị)'}
                    >
                      {faq.isActive !== false ? (
                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-stone-400" />
                      )}
                    </button>

                    {/* Move Up */}
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveFaq(index, 'up')}
                      aria-label={`Di chuyển câu hỏi ${index + 1} lên`}
                      className="p-1.5 text-stone-400 hover:text-charcoal-700 hover:bg-stone-200/60 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      title="Di chuyển lên trên"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>

                    {/* Move Down */}
                    <button
                      type="button"
                      disabled={index === faqs.length - 1}
                      onClick={() => handleMoveFaq(index, 'down')}
                      aria-label={`Di chuyển câu hỏi ${index + 1} xuống`}
                      className="p-1.5 text-stone-400 hover:text-charcoal-700 hover:bg-stone-200/60 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      title="Di chuyển xuống dưới"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDeleteFaq(index)}
                      aria-label={`Xóa câu hỏi ${index + 1}`}
                      className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer ml-1"
                      title="Xóa câu hỏi này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Form Inputs */}
                <div className="space-y-3">
                  <div>
                    <label
                      htmlFor={questionId}
                      className="block text-xs uppercase tracking-wider text-charcoal-600 font-medium mb-1"
                    >
                      Nội dung câu hỏi <span className="text-luxury-600">*</span>
                    </label>
                    <input
                      id={questionId}
                      type="text"
                      required
                      aria-label={`Nội dung câu hỏi ${index + 1}`}
                      value={faq.question}
                      onChange={(e) => handleUpdateFaq(index, 'question', e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-400 font-medium text-charcoal-900"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={answerId}
                      className="block text-xs uppercase tracking-wider text-charcoal-600 font-medium mb-1"
                    >
                      Câu trả lời chi tiết <span className="text-luxury-600">*</span>
                    </label>
                    <textarea
                      id={answerId}
                      rows={3}
                      required
                      aria-label={`Câu trả lời chi tiết cho câu hỏi ${index + 1}`}
                      value={faq.answer}
                      onChange={(e) => handleUpdateFaq(index, 'answer', e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-400 leading-relaxed text-charcoal-800"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

