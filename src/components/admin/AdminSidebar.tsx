'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Home as HomeIcon,
  MessageSquareHeart,
  Image as ImageIcon,
  FolderArchive,
  DollarSign,
  BookOpen,
  MapPin,
  Users,
  BellRing,
  ShieldCheck,
  Settings as SettingsIcon,
  ExternalLink,
  LogOut,
  CreditCard,
  X,
} from 'lucide-react';
import { useAdminNav } from '@/context/AdminNavContext';

interface NavItem {
  name: string;
  href: string;
  icon: any;
  roles: ('SUPER_ADMIN' | 'ADMIN' | 'USER')[];
}

const navItems: NavItem[] = [
  // Common for all 3 roles (SUPER_ADMIN, ADMIN, USER)
  { name: 'Tổng Quan', href: '/admin', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'ADMIN', 'USER'] },
  { name: 'Bộ Sưu Tập Album', href: '/admin/albums', icon: ImageIcon, roles: ['SUPER_ADMIN', 'ADMIN', 'USER'] },
  { name: 'Cẩm Nang Cưới', href: '/admin/blog', icon: BookOpen, roles: ['SUPER_ADMIN', 'ADMIN', 'USER'] },
  { name: 'Kho Lưu Trữ Media', href: '/admin/media', icon: FolderArchive, roles: ['SUPER_ADMIN', 'ADMIN', 'USER'] },

  // Operational ADMIN & SUPER_ADMIN only
  { name: 'Quản Lý Trang Chủ', href: '/admin/home', icon: HomeIcon, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { name: 'Đánh Giá Dâu Rể', href: '/admin/testimonials', icon: MessageSquareHeart, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { name: 'Quản Lý Bảng Giá', href: '/admin/packages', icon: DollarSign, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { name: 'Đơn Hàng & Đặt Cọc', href: '/admin/orders', icon: CreditCard, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { name: 'Studio & Chi Nhánh', href: '/admin/locations', icon: MapPin, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { name: 'Khách Hàng (Leads)', href: '/admin/leads', icon: Users, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { name: 'Cấu Hình Thông Báo', href: '/admin/notifications', icon: BellRing, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { name: 'Cài Đặt & Tracking SEO', href: '/admin/settings', icon: SettingsIcon, roles: ['SUPER_ADMIN', 'ADMIN'] },

  // SUPER_ADMIN & ADMIN
  { name: 'Quản Trị Người Dùng', href: '/admin/users', icon: ShieldCheck, roles: ['SUPER_ADMIN', 'ADMIN'] },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { isMobileOpen, closeMobileNav } = useAdminNav();
  const [currentUserRole, setCurrentUserRole] = useState<'SUPER_ADMIN' | 'ADMIN' | 'USER' | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.role) {
          setCurrentUserRole(data.user.role);
        }
      })
      .catch(() => {});
  }, []);

  const isItemActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleLogout = async () => {
    if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi trang quản trị?')) {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
      } catch {}
      window.location.href = '/admin/login';
    }
  };

  const visibleNavItems = navItems.filter((item) => {
    if (!currentUserRole) {
      return item.roles.includes('USER');
    }
    return item.roles.includes(currentUserRole);
  });

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full w-full bg-[#1C1917] text-stone-300 select-none">
      {/* BRAND LOGO HEADER */}
      <div>
        <div className="h-16 px-6 border-b border-stone-800/80 flex items-center justify-between">
          <Link
            href="/admin"
            onClick={closeMobileNav}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-xl bg-stone-800 border border-luxury-500/30 text-luxury-400 font-serif font-bold text-sm flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              PM
            </div>
            <div>
              <span className="font-serif text-xs font-semibold tracking-widest text-white block uppercase">
                PlusMoments
              </span>
              <span className="text-[9px] tracking-widest uppercase text-luxury-400 font-semibold block">
                CMS Dashboard
              </span>
            </div>
          </Link>

          {/* Close button inside mobile drawer */}
          <button
            type="button"
            onClick={closeMobileNav}
            className="md:hidden p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NAVIGATION LINKS */}
        <nav
          className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-10rem)] scrollbar-thin"
          aria-label="Menu quản trị CMS"
        >
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileNav}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all duration-200 ${
                  active
                    ? 'bg-stone-800 text-white font-medium shadow-xs border-l-2 border-luxury-400 pl-2.5'
                    : 'text-stone-400 hover:text-white hover:bg-stone-800/50'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    active ? 'text-luxury-400' : 'text-stone-500'
                  }`}
                />
                <span className="truncate">{item.name}</span>
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-luxury-400" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="p-3 border-t border-stone-800/80 space-y-1 bg-[#171412]">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-stone-400 hover:text-white hover:bg-stone-800/60 border border-transparent hover:border-stone-700/60 transition-all cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-luxury-400" />
            <span>Xem Website Công Khai</span>
          </span>
          <span className="text-[10px] text-stone-500 font-mono">↗</span>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors cursor-pointer text-left"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Đăng Xuất</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. DESKTOP PERMANENT SIDEBAR */}
      <aside className="hidden md:flex w-64 h-full flex-col justify-between border-r border-stone-800 shrink-0 z-30 shadow-md">
        {sidebarContent}
      </aside>

      {/* 2. MOBILE OFF-CANVAS DRAWER */}
      {isMobileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="md:hidden fixed inset-0 z-50 flex animate-in fade-in duration-200"
        >
          {/* Backdrop Blur */}
          <div
            onClick={closeMobileNav}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Sidebar */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-300">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
