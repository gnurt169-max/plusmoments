'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell, Check, Phone, ArrowRight, Sparkles } from 'lucide-react';

interface RecentLead {
  id: string;
  fullName: string;
  phone: string;
  packageInterested?: string | null;
  createdAt: string;
}

export function AdminNotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchUnread = async () => {
    try {
      const res = await fetch('/api/leads/unread-count');
      const data = await res.json();
      if (data.success) {
        setUnreadCount(data.unreadCount || 0);
        setRecentLeads(data.recentUnread || []);
      }
    } catch {
      // Quiet fail on network hiccups
    }
  };

  useEffect(() => {
    fetchUnread();
    // Poll unread count every 30 seconds
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAllAsRead = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true }),
      });
      const data = await res.json();
      if (data.success) {
        setUnreadCount(0);
        setRecentLeads([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkSingleAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isRead: true }),
      });
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setRecentLeads((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-stone-600 hover:text-charcoal-950 hover:bg-stone-100 dark:text-stone-300 dark:hover:text-white dark:hover:bg-charcoal-800 rounded-xl transition-colors cursor-pointer"
        aria-label="Thông báo khách hàng mới"
        title="Thông báo khách hàng mới"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center px-1 rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-lg animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* DROPDOWN POPOVER */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-stone-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-serif text-sm font-medium text-charcoal-900">
                Khách Hàng Mới
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-semibold">
                  {unreadCount} mới
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                disabled={loading}
                className="text-[11px] text-luxury-700 hover:text-luxury-900 font-medium flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Check className="w-3 h-3" />
                <span>Đã đọc tất cả</span>
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-stone-100">
            {recentLeads.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-400">
                <Sparkles className="w-6 h-6 mx-auto mb-2 text-stone-300" />
                <span>Không có yêu cầu tư vấn mới chưa đọc.</span>
              </div>
            ) : (
              recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="p-3.5 hover:bg-stone-50 transition-colors flex items-start justify-between gap-3 group"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-xs text-charcoal-900 truncate">
                        {lead.fullName}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-charcoal-500">
                      <a
                        href={`tel:${lead.phone}`}
                        className="flex items-center gap-1 text-luxury-700 hover:underline font-mono"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Phone className="w-2.5 h-2.5" />
                        <span>{lead.phone}</span>
                      </a>
                    </div>

                    {lead.packageInterested && (
                      <p className="text-[11px] text-stone-600 line-clamp-1">
                        💍 {lead.packageInterested}
                      </p>
                    )}

                    <p className="text-[10px] text-stone-400 font-mono">
                      {new Date(lead.createdAt).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: '2-digit',
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleMarkSingleAsRead(lead.id, e)}
                      title="Đánh dấu đã đọc"
                      className="p-1.5 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 bg-stone-50 border-t border-stone-200 text-center">
            <Link
              href="/admin/leads"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-charcoal-900 hover:text-luxury-700 inline-flex items-center gap-1.5 py-1"
            >
              <span>Xem Toàn Bộ Danh Sách Leads</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

