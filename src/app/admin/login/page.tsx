'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Lock, User, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/admin';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;

    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Đăng nhập không thành công. Vui lòng kiểm tra lại tài khoản hoặc mật khẩu.');
        setLoading(false);
        return;
      }

      // Success -> navigate to target return URL or dashboard with fresh session evaluation
      const targetUrl = returnUrl && returnUrl.startsWith('/admin') ? returnUrl : '/admin';
      window.location.href = targetUrl;
    } catch (err: any) {
      setErrorMessage(err?.message || 'Đã xảy ra lỗi kết nối mạng tới máy chủ. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col justify-center items-center p-4 sm:p-8 relative selection:bg-champagne selection:text-charcoal-950">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-champagne-gold/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-luxury-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-charcoal-900 text-champagne-gold shadow-xl border border-stone-800 mb-2">
            <ShieldCheck className="w-7 h-7 text-champagne-gold" />
          </div>
          <h1 className="font-serif text-3xl font-light tracking-[0.15em] text-charcoal-900">
            PLUS<span className="text-luxury-600 font-normal">MOMENTS</span>
          </h1>
          <p className="text-xs uppercase tracking-[0.25em] text-stone-500 font-medium">
            Cổng Quản Trị Hệ Thống (CMS)
          </p>
        </div>

        {/* Card Box */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-stone-200/90 shadow-xl p-8 sm:p-10 space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-medium text-stone-900">Đăng nhập tài trị</h2>
            <p className="text-xs text-stone-500 font-light">
              Nhập tên tài khoản và mật khẩu đã được cấp quyền quản trị.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 animate-fadeIn">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} action="#" method="post" className="space-y-4">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="username"
                className="block text-xs font-semibold text-stone-700 tracking-wide uppercase"
              >
                Tên đăng nhập
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="username"
                  type="text"
                  required
                  autoFocus
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin hoặc username"
                  className="w-full pl-10 pr-4 py-3 bg-stone-50/70 border border-stone-200 rounded-xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-luxury-600 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-stone-700 tracking-wide uppercase"
              >
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 bg-stone-50/70 border border-stone-200 rounded-xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-luxury-600 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-charcoal-900/10 hover:shadow-xl transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-champagne-gold" />
                    <span>Đang xác thực...</span>
                  </>
                ) : (
                  <>
                    <span>Đăng nhập hệ thống</span>
                    <ArrowRight className="w-4 h-4 text-champagne-gold" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Security Notice */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-center text-[11px] text-stone-400 font-light gap-1.5">
            <Lock className="w-3 h-3 text-stone-400" />
            <span>Phiên làm việc bảo mật cao với mã hóa JWT 256-bit</span>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-xs text-stone-500 hover:text-stone-800 transition-colors underline font-light"
          >
            &larr; Trở về Trang chủ PlusMoments
          </a>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF8F5]" />}>
      <LoginForm />
    </Suspense>
  );
}

