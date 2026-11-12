'use client';

import React, { useState, useEffect } from 'react';
import {
  Phone,
  Mail,
  Tag,
  MessageCircle,
  Search,
  CheckCircle2,
  Check,
  Trash2,
  Eye,
  EyeOff,
  ShieldCheck,
  Loader2,
  RefreshCw,
  Copy,
  Sparkles,
  Bot,
  Target,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils';

interface Lead {
  id: string;
  fullName: string;
  phone: string;
  email?: string | null;
  zalo?: string | null;
  weddingDate?: string | null;
  packageInterested?: string | null;
  expectedPackage?: string | null;
  estimatedBudget?: string | null;
  notes?: string | null;
  sourceUrl?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmTerm?: string | null;
  utmContent?: string | null;
  gclid?: string | null;
  status: 'NEW' | 'CONTACTED' | 'BOOKED' | 'CANCELLED';
  isRead: boolean;
  createdAt: string;
}

interface Stats {
  total: number;
  new: number;
  contacted: number;
  booked: number;
  cancelled: number;
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    new: 0,
    contacted: 0,
    booked: 0,
    cancelled: 0,
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'NEW' | 'CONTACTED' | 'BOOKED' | 'CANCELLED'>('ALL');
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [generatingReply, setGeneratingReply] = useState(false);
  const [aiSuggestedReply, setAiSuggestedReply] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [customLeadEmail, setCustomLeadEmail] = useState('');

  // PII Data Protection (Customer privacy for Staff vs Super Admin)
  const [currentUserRole, setCurrentUserRole] = useState<string>('USER');
  const [isMaskingEnabled, setIsMaskingEnabled] = useState<boolean>(true);
  const [revealedLeads, setRevealedLeads] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.user) {
          setCurrentUserRole(d.user.role || 'USER');
          if (d.user.role === 'SUPER_ADMIN') {
            setIsMaskingEnabled(false);
          }
        }
      })
      .catch(() => {});
  }, []);

  const toggleRevealLead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setRevealedLeads((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getDisplayPhone = (lead: Lead) => {
    if (currentUserRole === 'SUPER_ADMIN' && !isMaskingEnabled) return lead.phone;
    if (revealedLeads[lead.id]) return lead.phone;
    const clean = lead.phone.trim();
    if (clean.length < 7) return clean;
    return clean.slice(0, 4) + '****' + clean.slice(-2);
  };

  const getDisplayEmail = (lead: Lead) => {
    if (!lead.email) return '(Không có)';
    if (currentUserRole === 'SUPER_ADMIN' && !isMaskingEnabled) return lead.email;
    if (revealedLeads[lead.id]) return lead.email;
    const parts = lead.email.split('@');
    if (parts.length < 2) return lead.email;
    const [name, domain] = parts;
    const maskedName = name.length <= 2 ? `${name}***` : `${name.slice(0, 2)}***${name.slice(-1)}`;
    return `${maskedName}@${domain}`;
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleResendEmail = async (leadId: string, emailToSend: string) => {
    const clean = emailToSend.trim();
    if (!clean || !clean.includes('@')) {
      showToast('Vui lòng nhập địa chỉ email hợp lệ trước khi gửi.');
      return;
    }
    setSendingEmail(true);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/resend-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: clean }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || 'Đã gửi email xác nhận đặt lịch thành công!');
        fetchLeads();
        if (selectedLead && selectedLead.id === leadId) {
          setSelectedLead((prev) => (prev ? { ...prev, email: clean } : null));
        }
      } else {
        showToast(data.error || 'Gửi email thất bại');
      }
    } catch {
      showToast('Lỗi kết nối khi gửi email');
    } finally {
      setSendingEmail(false);
    }
  };

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeTab !== 'ALL') params.set('status', activeTab);
      if (onlyUnread) params.set('isRead', 'false');
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const res = await fetch(`/api/leads?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setLeads(data.leads || []);
        if (data.stats) setStats(data.stats);
        if (data.unreadCount !== undefined) setUnreadCount(data.unreadCount);
      }
    } catch {
      showToast('Không thể kết nối đến máy chủ lấy dữ liệu leads.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [activeTab, onlyUnread]);

  // Handle Enter on search
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLeads();
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      setUpdatingId(id);
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus, isRead: true }),
      });
      const data = await res.json();
      if (data.success) {
        setLeads((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, status: newStatus as any, isRead: true } : item
          )
        );
        showToast('Đã cập nhật trạng thái khách hàng thành công!');
        fetchLeads();
      } else {
        alert(data.error || 'Lỗi khi cập nhật trạng thái.');
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi kết nối.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleRead = async (id: string, currentRead: boolean) => {
    try {
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isRead: !currentRead }),
      });
      const data = await res.json();
      if (data.success) {
        setLeads((prev) =>
          prev.map((item) => (item.id === id ? { ...item, isRead: !currentRead } : item))
        );
        setUnreadCount((prev) => (currentRead ? prev + 1 : Math.max(0, prev - 1)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa lead của "${name}" không?`)) return;

    try {
      const res = await fetch(`/api/leads?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast('Đã xóa thông tin khách hàng.');
        setLeads((prev) => prev.filter((item) => item.id !== id));
      } else {
        alert(data.error || 'Lỗi khi xóa.');
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi kết nối.');
    }
  };

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    showToast(`Đã sao chép SĐT: ${phone}`);
  };

  const handleCopyReply = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('✨ Đã sao chép tin nhắn tư vấn vào bộ nhớ tạm!');
  };

  const handleGenerateLeadReply = async () => {
    if (!selectedLead) return;
    setGeneratingReply(true);
    try {
      const res = await fetch('/api/admin/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType: 'LEAD_REPLY',
          fullName: selectedLead.fullName,
          phone: selectedLead.phone,
          weddingDate: selectedLead.weddingDate,
          expectedPackage: selectedLead.expectedPackage || selectedLead.packageInterested,
          estimatedBudget: selectedLead.estimatedBudget,
          notes: selectedLead.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Lỗi khi tạo tin nhắn phản hồi.');
      }
      setAiSuggestedReply(data.result?.replyMessage || '');
      showToast('✨ Gemini AI đã soạn tin nhắn tư vấn thành công!');
    } catch (err: any) {
      alert(err.message || 'Không thể kết nối Gemini AI.');
    } finally {
      setGeneratingReply(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Đã đánh dấu tất cả leads là đã đọc.');
        fetchLeads();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-8 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl bg-charcoal-900 text-white text-xs shadow-2xl border border-luxury-500/40 animate-in fade-in duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-light text-charcoal-900">
            Quản Lý Khách Hàng (Leads & Bookings)
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Toàn bộ khách hàng để lại thông tin tư vấn kèm nguồn UTM tiếp thị và thông báo tức thì đa kênh.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-charcoal-800 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Đã đọc tất cả ({unreadCount})</span>
            </button>
          )}

          <button
            type="button"
            onClick={fetchLeads}
            disabled={loading}
            className="p-2.5 bg-white border border-stone-200 hover:bg-stone-50 text-charcoal-700 rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-luxury-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* METRICS STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <p className="text-[11px] uppercase tracking-wider text-charcoal-400 font-semibold">
            Tổng Số Leads
          </p>
          <p className="font-serif text-2xl font-light text-charcoal-900 mt-1">
            {stats.total}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs bg-amber-50/30">
          <p className="text-[11px] uppercase tracking-wider text-amber-700 font-semibold flex items-center justify-between">
            <span>Mới Tiếp Nhận</span>
            {stats.new > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            )}
          </p>
          <p className="font-serif text-2xl font-light text-amber-900 mt-1">
            {stats.new}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-xs bg-blue-50/20">
          <p className="text-[11px] uppercase tracking-wider text-blue-700 font-semibold">
            Đã Liên Hệ
          </p>
          <p className="font-serif text-2xl font-light text-blue-900 mt-1">
            {stats.contacted}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs bg-emerald-50/20">
          <p className="text-[11px] uppercase tracking-wider text-emerald-700 font-semibold">
            Đã Chốt Cọc (Booked)
          </p>
          <p className="font-serif text-2xl font-light text-emerald-900 mt-1">
            {stats.booked}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <p className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold">
            Đã Hủy / Không Hợp
          </p>
          <p className="font-serif text-2xl font-light text-stone-700 mt-1">
            {stats.cancelled}
          </p>
        </div>
      </div>

      {/* FILTER TABS & SEARCH BAR */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab('ALL');
              setOnlyUnread(false);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0 ${
              activeTab === 'ALL' && !onlyUnread
                ? 'bg-charcoal-900 text-white shadow-sm'
                : 'bg-white border border-stone-200 text-charcoal-600 hover:bg-stone-50'
            }`}
          >
            Tất Cả ({stats.total})
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('NEW');
              setOnlyUnread(false);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'NEW' && !onlyUnread
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white border border-stone-200 text-amber-800 hover:bg-amber-50'
            }`}
          >
            <span>Mới Cần Gọi</span>
            {stats.new > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px]">
                {stats.new}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('CONTACTED');
              setOnlyUnread(false);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0 ${
              activeTab === 'CONTACTED' && !onlyUnread
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-stone-200 text-blue-800 hover:bg-blue-50'
            }`}
          >
            Đã Liên Hệ ({stats.contacted})
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('BOOKED');
              setOnlyUnread(false);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0 ${
              activeTab === 'BOOKED' && !onlyUnread
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white border border-stone-200 text-emerald-800 hover:bg-emerald-50'
            }`}
          >
            Đã Chốt ({stats.booked})
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('CANCELLED');
              setOnlyUnread(false);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0 ${
              activeTab === 'CANCELLED' && !onlyUnread
                ? 'bg-stone-700 text-white shadow-sm'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            Đã Hủy ({stats.cancelled})
          </button>

          <button
            type="button"
            onClick={() => setOnlyUnread(!onlyUnread)}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              onlyUnread
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white border border-stone-200 text-rose-700 hover:bg-rose-50'
            }`}
          >
            <span>Chưa Đọc</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px]">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {currentUserRole === 'SUPER_ADMIN' && (
            <button
              type="button"
              onClick={() => setIsMaskingEnabled(!isMaskingEnabled)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer shrink-0 ${
                isMaskingEnabled
                  ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
              title="Bật/Tắt che dữ liệu PII dâu rể (Số điện thoại, Email)"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>{isMaskingEnabled ? 'PII: Đang Che' : 'PII: Đang Mở'}</span>
            </button>
          )}

          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên, SĐT, gói..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-400"
            />
          </form>
        </div>
      </div>

      {/* LEADS TABLE */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex items-center justify-center gap-2 text-charcoal-400 text-xs">
            <Loader2 className="w-5 h-5 animate-spin text-luxury-600" />
            <span>Đang tải danh sách khách hàng...</span>
          </div>
        ) : leads.length === 0 ? (
          <div className="p-16 text-center text-charcoal-400 text-xs">
            Không tìm thấy thông tin khách hàng nào phù hợp với bộ lọc.
          </div>
        ) : (
          <>
            {/* 1. MOBILE RESPONSIVE CARD VIEW (< md) */}
            <div className="md:hidden divide-y divide-stone-200">
              {leads.map((lead) => {
                const cleanPhone = lead.phone.replace(/[^0-9]/g, '');

                return (
                  <div
                    key={lead.id}
                    className={`p-4 space-y-3 transition-colors ${
                      !lead.isRead ? 'bg-amber-50/40' : 'bg-white'
                    }`}
                  >
                    {/* Header: Name, unread badge & quick actions */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif font-semibold text-stone-900 text-sm">
                            {lead.fullName}
                          </h4>
                          {!lead.isRead && (
                            <span className="px-1.5 py-0.5 rounded bg-rose-500 text-white text-[9px] font-bold tracking-wider">
                              MỚI
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {formatDate(lead.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        {/* View details */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedLead(lead);
                            setCustomLeadEmail(lead.email || '');
                            setAiSuggestedReply(null);
                          }}
                          className="p-1.5 text-stone-500 hover:text-luxury-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleDelete(lead.id, lead.fullName)}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Xóa lead"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Quick Call & Zalo Action Row */}
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${cleanPhone}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-mono font-medium text-xs transition-colors border border-emerald-200 cursor-pointer shadow-2xs"
                        title="Bấm gọi ngay cho khách hàng"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{getDisplayPhone(lead)}</span>
                      </a>

                      <button
                        type="button"
                        onClick={(e) => toggleRevealLead(lead.id, e)}
                        className="p-2 text-stone-500 hover:text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
                        title={revealedLeads[lead.id] ? 'Ẩn số (Mask)' : 'Xem số đầy đủ'}
                      >
                        {revealedLeads[lead.id] ? (
                          <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyPhone(lead.phone)}
                        className="p-2 text-stone-500 hover:text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
                        title="Sao chép số"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <a
                        href={`https://zalo.me/${cleanPhone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-xs border border-blue-200 transition-colors shadow-2xs cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
                        <span>Zalo</span>
                      </a>
                    </div>

                    {/* Package & Notes */}
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 text-stone-800 font-medium">
                        <Tag className="w-3.5 h-3.5 text-luxury-600 shrink-0" />
                        <span className="truncate">
                          {lead.packageInterested || lead.expectedPackage || 'Tư vấn theo yêu cầu'}
                        </span>
                        {lead.estimatedBudget && (
                          <span className="text-[11px] text-stone-500 font-mono ml-auto">
                            ~{lead.estimatedBudget}
                          </span>
                        )}
                      </div>

                      {lead.weddingDate && (
                        <p className="text-[11px] text-stone-500 pl-5">
                          📅 Ngày cưới/chụp: {lead.weddingDate}
                        </p>
                      )}

                      {lead.notes && (
                        <p className="text-[11px] text-stone-500 italic pl-5 line-clamp-2">
                          "{lead.notes}"
                        </p>
                      )}
                    </div>

                    {/* Status & Read Toggle */}
                    <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                      <select
                        aria-label="Cập nhật trạng thái khách hàng"
                        value={lead.status}
                        disabled={updatingId === lead.id}
                        onChange={(e) => handleUpdateStatus(lead.id, e.target.value)}
                        className={`text-xs py-1 px-2.5 rounded-lg font-medium border focus:outline-none transition-colors cursor-pointer ${
                          lead.status === 'NEW'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : lead.status === 'CONTACTED'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : lead.status === 'BOOKED'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-stone-100 text-stone-600 border-stone-300'
                        }`}
                      >
                        <option value="NEW">🚨 Mới tiếp nhận</option>
                        <option value="CONTACTED">📞 Đã liên hệ</option>
                        <option value="BOOKED">🎉 Đã chốt cọc</option>
                        <option value="CANCELLED">❌ Đã hủy</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => handleToggleRead(lead.id, lead.isRead)}
                        className={`text-xs flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-colors ${
                          lead.isRead
                            ? 'text-stone-400 border-stone-200 hover:bg-stone-50'
                            : 'text-emerald-700 bg-emerald-50 border-emerald-200 font-semibold'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{lead.isRead ? 'Đã xem' : 'Đánh dấu đã xem'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 2. DESKTOP TABLE VIEW (md+) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-charcoal-500 uppercase tracking-wider font-semibold border-b border-stone-200">
                <tr>
                  <th className="py-3.5 px-6">Họ Tên Dâu Rể</th>
                  <th className="py-3.5 px-6">Số Điện Thoại (Bấm Gọi)</th>
                  <th className="py-3.5 px-6">Gói Quan Tâm & Ngân Sách</th>
                  <th className="py-3.5 px-6">Ngày Cưới / Chụp</th>
                  <th className="py-3.5 px-6">Nguồn Chiến Dịch</th>
                  <th className="py-3.5 px-6">Trạng Thái Xử Lý</th>
                  <th className="py-3.5 px-6">Thời Gian Gửi</th>
                  <th className="py-3.5 px-6 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-charcoal-700">
                {leads.map((lead) => {
                  const cleanPhone = lead.phone.replace(/[^0-9]/g, '');

                  return (
                    <tr
                      key={lead.id}
                      className={`hover:bg-stone-50/80 transition-colors ${
                        !lead.isRead ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      {/* Name & Notes */}
                      <td className="py-4 px-6 font-medium text-charcoal-900">
                        <div className="flex items-center gap-2">
                          <p className="font-serif text-sm font-semibold">{lead.fullName}</p>
                          {!lead.isRead && (
                            <span className="px-1.5 py-0.5 rounded bg-rose-500 text-white text-[9px] font-bold tracking-wider">
                              MỚI
                            </span>
                          )}
                        </div>
                        {lead.notes && (
                          <p className="text-[11px] text-charcoal-500 font-light italic mt-0.5 max-w-xs line-clamp-1">
                            "{lead.notes}"
                          </p>
                        )}
                      </td>

                      {/* Phone with Click-to-call & Zalo */}
                      <td className="py-4 px-6 space-y-1">
                        <div className="flex items-center gap-2">
                          {/* Direct Phone Call Button */}
                          <a
                            href={`tel:${cleanPhone}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-mono font-medium text-xs transition-colors border border-emerald-200 cursor-pointer"
                            title="Bấm gọi ngay cho khách hàng"
                          >
                            <Phone className="w-3 h-3 text-emerald-600" />
                            <span>{getDisplayPhone(lead)}</span>
                          </a>

                          {/* Reveal/Mask Toggle Button */}
                          <button
                            type="button"
                            onClick={(e) => toggleRevealLead(lead.id, e)}
                            className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded transition-colors cursor-pointer"
                            title={revealedLeads[lead.id] ? 'Ẩn số (Mask)' : 'Hiện số đầy đủ'}
                          >
                            {revealedLeads[lead.id] ? (
                              <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Copy Phone */}
                          <button
                            type="button"
                            onClick={() => handleCopyPhone(lead.phone)}
                            className="p-1 text-stone-400 hover:text-charcoal-700 rounded transition-colors cursor-pointer"
                            title="Sao chép số điện thoại"
                          >
                            <Copy className="w-3 h-3" />
                          </button>

                          {/* Direct Zalo Chat Button */}
                          <a
                            href={`https://zalo.me/${cleanPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                            title="Mở Zalo chat"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        </div>

                        {lead.email && (
                          <div className="flex items-center gap-1.5 text-charcoal-400 text-[11px]">
                            <Mail className="w-3 h-3" />
                            <span>{getDisplayEmail(lead)}</span>
                          </div>
                        )}
                      </td>

                      {/* Package & Budget */}
                      <td className="py-4 px-6 space-y-0.5">
                        <p className="font-medium text-charcoal-900">
                          {lead.packageInterested || lead.expectedPackage || 'Tư vấn theo yêu cầu'}
                        </p>
                        {lead.estimatedBudget && (
                          <p className="text-[11px] text-luxury-700 font-mono">
                            {lead.estimatedBudget}
                          </p>
                        )}
                      </td>

                      {/* Wedding Date */}
                      <td className="py-4 px-6 font-mono text-charcoal-600">
                        {lead.weddingDate || 'Chưa định ngày'}
                      </td>

                      {/* UTM & Marketing Source */}
                      <td className="py-4 px-6">
                        {lead.gclid || lead.utmSource === 'google_ads' || lead.utmSource?.includes('google') ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-900 text-[10px] font-semibold border border-amber-300">
                              <Target className="w-2.5 h-2.5 text-amber-600" />
                              Google Ads
                            </span>
                            {lead.utmCampaign && (
                              <p className="text-[10px] text-charcoal-500 font-mono truncate max-w-[120px]" title={lead.utmCampaign}>
                                {lead.utmCampaign}
                              </p>
                            )}
                          </div>
                        ) : lead.utmSource ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-mono border border-blue-200">
                              <Tag className="w-2.5 h-2.5" />
                              {lead.utmSource}
                            </span>
                            {lead.utmCampaign && (
                              <p className="text-[10px] text-charcoal-400 font-mono truncate max-w-[120px]" title={lead.utmCampaign}>
                                {lead.utmCampaign}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-charcoal-400 text-[11px]">Direct / Tự nhiên</span>
                        )}
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-4 px-6">
                        <select
                          aria-label="Cập nhật trạng thái khách hàng"
                          value={lead.status}
                          disabled={updatingId === lead.id}
                          onChange={(e) => handleUpdateStatus(lead.id, e.target.value)}
                          className={`px-2.5 py-1 text-[11px] rounded-lg font-medium border cursor-pointer focus:outline-none focus:ring-1 focus:ring-luxury-400 ${
                            lead.status === 'NEW'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : lead.status === 'CONTACTED'
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : lead.status === 'BOOKED'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-stone-100 text-stone-600 border-stone-300'
                          }`}
                        >
                          <option value="NEW">🚨 Mới tiếp nhận</option>
                          <option value="CONTACTED">📞 Đã liên hệ</option>
                          <option value="BOOKED">🎉 Đã chốt cọc</option>
                          <option value="CANCELLED">❌ Đã hủy</option>
                        </select>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6 text-charcoal-400 font-mono text-[11px]">
                        {formatDate(lead.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Toggle read */}
                          <button
                            type="button"
                            onClick={() => handleToggleRead(lead.id, lead.isRead)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              lead.isRead
                                ? 'text-stone-300 hover:text-stone-600 hover:bg-stone-100'
                                : 'text-rose-500 hover:bg-rose-50'
                            }`}
                            title={lead.isRead ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc'}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick send confirmation email */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedLead(lead);
                              setCustomLeadEmail(lead.email || '');
                              setAiSuggestedReply(null);
                            }}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              lead.email
                                ? 'text-luxury-600 hover:bg-luxury-50'
                                : 'text-stone-300 hover:text-stone-500 hover:bg-stone-100'
                            }`}
                            title={lead.email ? `Gửi thư xác nhận tới ${lead.email}` : 'Cập nhật email & gửi xác nhận'}
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>

                          {/* View details */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedLead(lead);
                              setCustomLeadEmail(lead.email || '');
                              setAiSuggestedReply(null);
                            }}
                            className="p-1.5 text-stone-400 hover:text-luxury-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                            title="Xem chi tiết lead"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDelete(lead.id, lead.fullName)}
                            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Xóa lead"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
      </div>

      {/* DETAIL MODAL */}
      <Modal
        isOpen={!!selectedLead}
        onClose={() => {
          setSelectedLead(null);
          setAiSuggestedReply(null);
        }}
        maxWidth="max-w-xl"
        title="Chi Tiết Khách Hàng Tư Vấn"
        subtitle="Thông tin đầy đủ từ form tư vấn và hành vi chuyển đổi của khách."
      >
        {selectedLead && (
          <div className="space-y-4 text-xs">
            <div className="bg-stone-50 p-4 rounded-xl space-y-2 border border-stone-200">
              <div className="flex items-center justify-between">
                <span className="text-charcoal-500">Họ tên:</span>
                <span className="font-serif text-sm font-semibold text-charcoal-900">
                  {selectedLead.fullName}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-charcoal-500">Số điện thoại:</span>
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${selectedLead.phone}`}
                    className="font-mono font-bold text-luxury-700 hover:underline"
                  >
                    {getDisplayPhone(selectedLead)}
                  </a>
                  <button
                    type="button"
                    onClick={() => toggleRevealLead(selectedLead.id)}
                    className="p-1 text-stone-400 hover:text-stone-700 rounded"
                    title={revealedLeads[selectedLead.id] ? 'Ẩn số (Mask)' : 'Hiện số đầy đủ'}
                  >
                    {revealedLeads[selectedLead.id] ? (
                      <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyPhone(selectedLead.phone)}
                    className="p-1 text-stone-400 hover:text-charcoal-700 rounded"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {selectedLead.email && (
                <div className="flex items-center justify-between">
                  <span className="text-charcoal-500">Email:</span>
                  <span className="font-mono text-charcoal-800">{getDisplayEmail(selectedLead)}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-charcoal-500">Gói quan tâm:</span>
                <span className="font-semibold text-charcoal-900">
                  {selectedLead.packageInterested || selectedLead.expectedPackage || 'Chưa chọn'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-charcoal-500">Ngân sách dự kiến:</span>
                <span className="font-mono text-luxury-700">{selectedLead.estimatedBudget || 'Chưa rõ'}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-charcoal-500">Ngày cưới / chụp:</span>
                <span className="font-mono text-charcoal-800">{selectedLead.weddingDate || 'Chưa định ngày'}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-charcoal-500">Thời gian gửi form:</span>
                <span className="font-mono text-charcoal-600">{formatDate(selectedLead.createdAt)}</span>
              </div>
            </div>

            {selectedLead.notes && (
              <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1">
                <p className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
                  Yêu cầu / Ghi chú của khách:
                </p>
                <p className="text-charcoal-700 italic">"{selectedLead.notes}"</p>
              </div>
            )}

            {/* AI CONSULTATION ASSISTANT */}
            <div className="bg-stone-900 border border-luxury-500/30 rounded-2xl p-4 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-luxury-500/20 border border-luxury-500/40 flex items-center justify-center text-luxury-400">
                    <Bot className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-serif tracking-wider uppercase text-white font-medium">
                    Trợ Lý Tư Vấn Gemini AI
                  </span>
                </div>
                <button
                  type="button"
                  disabled={generatingReply}
                  onClick={handleGenerateLeadReply}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-luxury-500 to-luxury-600 hover:from-luxury-400 hover:to-luxury-500 text-stone-950 text-xs font-semibold rounded-xl shadow transition-all disabled:opacity-50 cursor-pointer"
                >
                  {generatingReply ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>{generatingReply ? 'Đang Soạn...' : '✨ AI Soạn Tin Tư Vấn'}</span>
                </button>
              </div>

              {aiSuggestedReply ? (
                <div className="space-y-2 pt-1 border-t border-stone-800">
                  <div className="bg-stone-950/80 p-3 rounded-xl border border-stone-800 text-stone-200 text-xs font-sans whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                    {aiSuggestedReply}
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleCopyReply(aiSuggestedReply)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-white rounded-lg text-xs font-medium cursor-pointer transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao Chép Tin Nhắn</span>
                    </button>
                    <a
                      href={`https://zalo.me/${selectedLead.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Mở Zalo Dán Ngay</span>
                    </a>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-stone-400 font-light">
                  Bấm nút trên để Gemini tự động phân tích nhu cầu của khách ({selectedLead.expectedPackage || selectedLead.packageInterested || 'Tư vấn theo yêu cầu'}), ngày cưới và ghi chú để soạn tin nhắn chào đón lịch sự, chuyên nghiệp qua Zalo.
                </p>
              )}
            </div>

            {/* AUTOMATED RESEND CONFIRMATION EMAIL SECTION */}
            <div className="bg-gradient-to-br from-[#FAF8F5] to-white border border-champagne-gold/40 rounded-2xl p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-charcoal-900 text-champagne-gold flex items-center justify-center shrink-0 shadow-xs">
                    <Mail className="w-4 h-4 text-champagne-gold" />
                  </div>
                  <div>
                    <span className="text-xs font-serif tracking-wider uppercase text-charcoal-900 font-semibold block">
                      Email Xác Nhận Đơn Hàng (Resend Luxury)
                    </span>
                    <span className="text-[11px] text-charcoal-500 font-light block">
                      Mã đơn #{selectedLead.id.startsWith('PM-') ? selectedLead.id : `PM-${selectedLead.id.slice(-6).toUpperCase()}`} • Mẫu email responsive nền kem champagne
                    </span>
                  </div>
                </div>

                {selectedLead.email && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-medium">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Đã có email
                  </span>
                )}
              </div>

              <div className="pt-1 space-y-2">
                <label className="block text-[11px] font-medium text-charcoal-700">
                  Địa chỉ email người nhận:
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <div className="relative w-full">
                    <input
                      type="email"
                      placeholder="nhap.email.khach@gmail.com..."
                      value={customLeadEmail}
                      onChange={(e) => setCustomLeadEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs text-charcoal-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-luxury-600"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={sendingEmail}
                    onClick={() => handleResendEmail(selectedLead.id, customLeadEmail)}
                    className="w-full sm:w-auto px-4 py-2.5 bg-charcoal-900 hover:bg-charcoal-800 text-white rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 shadow transition-all disabled:opacity-50 cursor-pointer shrink-0"
                  >
                    {sendingEmail ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-champagne-gold" />
                        <span>Đang gửi qua Resend...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-3.5 h-3.5 text-champagne-gold" />
                        <span>📧 Gửi Lại Email Xác Nhận</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-charcoal-400 font-light">
                  Khách hàng sẽ nhận được thư chứa đầy đủ mã đơn, gói dịch vụ đã chọn, số điện thoại liên hệ và lời cam kết chăm sóc chuẩn Luxury của PlusMoments.
                </p>
              </div>
            </div>

            {/* Tracking details */}
            <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-amber-600" />
                  <span>Dữ Liệu Tiếp Thị & Chuyển Đổi Google Ads:</span>
                </p>
                {selectedLead.gclid && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-medium">
                    Có Google Click ID (GCLID)
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[11px] font-mono text-charcoal-600">
                <div>UTM Source: <span className="text-charcoal-900 font-semibold">{selectedLead.utmSource || 'direct'}</span></div>
                <div>UTM Medium: <span className="text-charcoal-900">{selectedLead.utmMedium || 'none'}</span></div>
                <div>Chiến Dịch: <span className="text-charcoal-900 font-medium">{selectedLead.utmCampaign || 'none'}</span></div>
                <div>Từ Khóa (Term): <span className="text-charcoal-900">{selectedLead.utmTerm || '—'}</span></div>
                <div>Nội Dung Ads: <span className="text-charcoal-900">{selectedLead.utmContent || '—'}</span></div>
                <div>Trang Đích: <span className="text-charcoal-900 truncate block" title={selectedLead.sourceUrl || '/'}>{selectedLead.sourceUrl || '/'}</span></div>
              </div>

              {selectedLead.gclid && (
                <div className="pt-1.5 border-t border-stone-200/80 text-[10px] font-mono text-charcoal-500 break-all">
                  <span className="font-semibold text-stone-700">GCLID: </span>
                  {selectedLead.gclid}
                </div>
              )}
            </div>

            {/* Quick Actions in Modal */}
            <div className="flex items-center gap-3 pt-3">
              <a
                href={`tel:${selectedLead.phone.replace(/[^0-9]/g, '')}`}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm"
              >
                <Phone className="w-4 h-4" />
                <span>Gọi Điện Thoại Ngay</span>
              </a>

              <a
                href={`https://zalo.me/${selectedLead.phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Nhắn Tin Zalo</span>
              </a>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
