'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, Sparkles, X, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

interface CustomerPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSlug?: string;
}

export function CustomerPinModal({ isOpen, onClose, defaultSlug = '' }: CustomerPinModalProps) {
  const router = useRouter();
  const [slugInput, setSlugInput] = useState(defaultSlug);
  const [pinInput, setPinInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Extract slug from user input (supports full link or bare slug)
  const extractCleanSlug = (val: string): string => {
    let clean = val.trim();
    if (clean.includes('/thiep-cuoi/')) {
      const parts = clean.split('/thiep-cuoi/');
      clean = parts[1] || '';
    }
    clean = clean.replace(/[?#].*$/, '').replace(/^\/+|\/+$/g, '');
    return clean.toLowerCase();
  };

  const handleVerifyAndOpen = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const slug = extractCleanSlug(slugInput);
    const pin = pinInput.trim();

    if (!slug) {
      setErrorMsg('Vui lòng nhập đường dẫn hoặc tên thiệp của bạn');
      return;
    }

    if (!pin || pin.length < 4) {
      setErrorMsg('Vui lòng nhập mã PIN bảo mật 6 số của thiệp');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/invitations/${slug}/verify-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      const data = await res.json();
      if (data.success && data.valid) {
        // Save auth PIN in sessionStorage
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(`invitation_pin_${slug}`, pin);
        }
        onClose();
        router.push(`/thiep-cuoi/chinh-sua/${slug}`);
      } else {
        setErrorMsg(data.error || 'Mã PIN 6 số không chính xác. Vui lòng thử lại!');
      }
    } catch (err: any) {
      setErrorMsg('Lỗi kết nối máy chủ: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-3xl border border-stone-200 shadow-2xl p-6 sm:p-8 relative space-y-5 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1.5 pt-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-[#8C6D46] mx-auto flex items-center justify-center">
            <KeyRound className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-2xl font-normal text-stone-900">
            Chỉnh Sửa Thiệp Cưới Đã Tạo
          </h3>
          <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
            Nhập tên đường dẫn thiệp và mã PIN 6 số được cấp khi xuất bản để mở lại trình chỉnh sửa.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMsg}</span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleVerifyAndOpen} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-stone-700 mb-1">
              Đường dẫn thiệp cưới hoặc tên Slug
            </label>
            <input
              type="text"
              required
              value={slugInput}
              onChange={(e) => setSlugInput(e.target.value)}
              placeholder="Ví dụ: test-trung-thao hoặc dán link đầy đủ"
              className="w-full h-11 px-3.5 rounded-xl border border-stone-300 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#8C6D46] focus:border-transparent font-mono"
            />
            <p className="text-[11px] text-stone-400 mt-1">
              Hỗ trợ dán cả link: <code>https://plusmoments.vn/thiep-cuoi/ten-thiệp</code>
            </p>
          </div>

          <div>
            <label className="block font-medium text-stone-700 mb-1">
              Mã PIN Bảo Mật (6 Chữ Số)
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              required
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
              placeholder="••••••"
              className="w-full h-11 px-3.5 rounded-xl border border-stone-300 text-stone-900 text-lg tracking-[0.35em] text-center font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#8C6D46] focus:border-transparent"
            />
            <p className="text-[11px] text-stone-400 mt-1 text-center">
              Quên mã PIN? Vui lòng liên hệ Studio PlusMoments để được hỗ trợ đọc lại.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-[#8C6D46] hover:bg-[#725735] text-white font-semibold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang Xác Thực...</span>
              </>
            ) : (
              <>
                <span>Mở Trình Chỉnh Sửa</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
