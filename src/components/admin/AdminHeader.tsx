'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  LogOut,
  KeyRound,
  X,
  Lock,
  CheckCircle2,
  Loader2,
  Menu,
} from 'lucide-react';
import { AdminNotificationBell } from '@/components/admin/AdminNotificationBell';
import { useAdminNav } from '@/context/AdminNavContext';

const routeTitleMap: Record<string, string> = {
  '/admin': 'Tổng Quan Dashboard',
  '/admin/home': 'Quản Lý Trang Chủ',
  '/admin/testimonials': 'Đánh Giá Dâu Rể',
  '/admin/albums': 'Bộ Sưu Tập Album',
  '/admin/media': 'Kho Lưu Trữ Media',
  '/admin/packages': 'Quản Lý Bảng Giá',
  '/admin/orders': 'Đơn Hàng & Đặt Cọc VietQR',
  '/admin/blog': 'Cẩm Nang Cưới',
  '/admin/locations': 'Studio & Chi Nhánh',
  '/admin/leads': 'Khách Hàng (Leads)',
  '/admin/notifications': 'Cấu Hình Thông Báo',
  '/admin/users': 'Quản Lý Tài Khoản Admin',
  '/admin/settings': 'Cài Đặt & Tracking SEO',
};

interface CurrentUser {
  userId: string;
  username: string;
  fullName: string;
  role: string;
}

export function AdminHeader() {
  const pathname = usePathname();
  const { toggleMobileNav } = useAdminNav();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState<boolean>(false);

  // Change Password Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  useEffect(() => {
    // 1. Fetch current user session
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});

    // 2. Fetch system settings to check maintenance mode
    fetch('/api/admin/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.settings?.isMaintenanceMode) {
          setIsMaintenanceMode(true);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi trang quản trị?')) {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
      } catch {}
      window.location.href = '/admin/login';
    }
  };

  const handleOpenPasswordModal = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError(null);
    setPasswordSuccess(null);
    setIsPasswordModalOpen(true);
  };

  const handleSubmitPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có tối thiểu 6 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Mật khẩu xác nhận không khớp với mật khẩu mới.');
      return;
    }

    setIsSubmittingPassword(true);
    try {
      const res = await fetch('/api/admin/profile/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Đổi mật khẩu thất bại.');
      }

      setPasswordSuccess(data.message || 'Đổi mật khẩu thành công!');
      setTimeout(() => {
        setIsPasswordModalOpen(false);
      }, 1500);
    } catch (err: any) {
      setPasswordError(err.message);
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const currentTitle =
    routeTitleMap[pathname] ||
    (pathname.startsWith('/admin/albums')
      ? 'Chi Tiết Album'
      : pathname.startsWith('/admin/blog')
      ? 'Chi Tiết Bài Viết'
      : 'Hệ Thống Quản Trị');

  const initials = currentUser?.fullName
    ? currentUser.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(-2)
        .toUpperCase()
    : 'PM';

  const roleBadgeColor =
    currentUser?.role === 'SUPER_ADMIN'
      ? 'bg-amber-100/80 text-amber-900 border-amber-300'
      : currentUser?.role === 'ADMIN'
      ? 'bg-blue-50 text-blue-800 border-blue-200'
      : 'bg-stone-100 text-stone-700 border-stone-200';

  return (
    <header className="h-16 border-b border-stone-200/70 bg-white/80 backdrop-blur px-4 sm:px-8 flex items-center justify-between shrink-0 z-20">
      {/* BREADCRUMBS & MOBILE MENU TOGGLE */}
      <div className="flex items-center gap-2 text-xs">
        {/* Mobile Hamburger Drawer Trigger */}
        <button
          type="button"
          onClick={toggleMobileNav}
          aria-label="Mở menu quản trị"
          className="md:hidden p-2 -ml-1 text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <span className="hidden sm:inline text-stone-400 font-medium">Hệ Thống</span>
        <ChevronRight className="hidden sm:inline w-3.5 h-3.5 text-stone-300" />
        <span className="font-semibold text-stone-900 font-serif tracking-wide truncate max-w-[160px] sm:max-w-none">
          {currentTitle}
        </span>
      </div>

      {/* RIGHT METRICS & PROFILE */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* MAINTENANCE MODE ALERT PILL */}
        {isMaintenanceMode && (
          <Link
            href="/admin/settings"
            title="Nhấp để vào Cài Đặt tắt chế độ bảo trì"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-medium tracking-wide shadow-xs transition-all animate-pulse"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>BẢO TRÌ ĐANG BẬT</span>
          </Link>
        )}

        {/* NOTIFICATION BELL */}
        <AdminNotificationBell />

        <div className="h-5 w-px bg-stone-200" />

        {/* PROFILE BADGE */}
        <div className="flex items-center gap-2.5 select-none">
          <div
            title={`Tài khoản: ${currentUser?.username || 'admin'}`}
            className="w-8 h-8 rounded-full bg-charcoal-900 text-champagne-gold font-serif font-bold text-xs flex items-center justify-center shadow-xs border border-stone-700"
          >
            {initials}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-stone-900 leading-tight">
              {currentUser?.fullName || 'Quản Trị Viên'}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <span
                className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded border ${roleBadgeColor}`}
              >
                {currentUser?.role === 'SUPER_ADMIN'
                  ? 'Super Admin'
                  : currentUser?.role === 'ADMIN'
                  ? 'Admin'
                  : 'User (Editor)'}
              </span>
            </div>
          </div>
        </div>

        {/* CHANGE PASSWORD BUTTON */}
        <button
          type="button"
          onClick={handleOpenPasswordModal}
          title="Đổi mật khẩu"
          className="p-1.5 text-stone-500 hover:text-champagne-gold hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
        >
          <KeyRound className="w-4 h-4" />
        </button>

        {/* QUICK LOGOUT ICON */}
        <button
          type="button"
          onClick={handleLogout}
          title="Đăng xuất"
          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* CHANGE PASSWORD MODAL */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-champagne-gold/20 text-champagne-gold">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-semibold text-sm tracking-wide text-white">
                    Đổi Mật Khẩu Quản Trị
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    Tài khoản: <span className="font-mono text-champagne-gold font-medium">{currentUser?.username}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-stone-400 hover:text-white p-1 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitPasswordChange} className="p-6 space-y-4">
              {passwordError && (
                <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3 text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1.5">
                  Mật khẩu hiện tại
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Nhập mật khẩu hiện tại"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-champagne-gold focus:ring-1 focus:ring-champagne-gold transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1.5">
                  Mật khẩu mới (Tối thiểu 6 ký tự)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-champagne-gold focus:ring-1 focus:ring-champagne-gold transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1.5">
                  Xác nhận mật khẩu mới
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-champagne-gold focus:ring-1 focus:ring-champagne-gold transition-colors"
                  />
                </div>
              </div>

              {currentUser?.username === 'trunglnm' && (
                <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/60 text-[11px] text-amber-900 leading-relaxed">
                  <span className="font-semibold text-amber-800">Đồng bộ Seed tự động:</span> Mật khẩu mới của Super Admin sẽ được ghi đè trực tiếp vào các file Mockup Seed tĩnh (<code className="font-mono text-[10px] bg-white px-1 py-0.5 rounded border border-amber-200">prisma/seed.ts</code>, <code className="font-mono text-[10px] bg-white px-1 py-0.5 rounded border border-amber-200">prisma/seed.js</code>). Dù có restart server hay seed lại, mật khẩu này vẫn được bảo toàn.
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  disabled={isSubmittingPassword}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-950 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPassword}
                  className="px-4 py-2 text-xs font-semibold text-white bg-charcoal-900 hover:bg-stone-800 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingPassword ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-champagne-gold" />
                      <span>Lưu Mật Khẩu</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}

