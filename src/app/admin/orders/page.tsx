'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Search,
  Phone,
  Mail,
  Copy,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  Loader2,
  RefreshCw,
  QrCode,
  DollarSign,
  TrendingUp,
  Tag,
} from 'lucide-react';
import { formatVND, formatDate } from '@/lib/utils';

interface Order {
  id: string;
  orderCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  packageName: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  paymentMethod: string;
  transactionId?: string | null;
  paidAt?: string | null;
  notes?: string | null;
  createdAt: string;
}

interface OrderStats {
  total: number;
  paid: number;
  pending: number;
  cancelled: number;
  totalRevenue: number;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats>({
    total: 0,
    paid: 0,
    pending: 0,
    cancelled: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PAID' | 'PENDING' | 'CANCELLED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeTab !== 'ALL') params.set('status', activeTab);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
        if (data.stats) setStats(data.stats);
      }
    } catch {
      showToast('Lỗi khi tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleStatusChange = async (orderId: string, newStatus: 'PENDING' | 'PAID' | 'CANCELLED') => {
    setUpdatingId(orderId);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Cập nhật trạng thái đơn hàng thành công');
        fetchOrders();
      } else {
        showToast('Không thể cập nhật đơn hàng');
      }
    } catch {
      showToast('Lỗi kết nối khi cập nhật đơn hàng');
    } finally {
      setUpdatingId(null);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Đã sao chép ${label}: ${text}`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. PAGE HEADER & STATS SUMMARY */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900 tracking-tight flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-luxury-600" />
            <span>Quản Lý Đơn Hàng & Đặt Cọc VietQR</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-light mt-1">
            Theo dõi các phiên thanh toán tự động, đối soát mã đơn PMXXXXX và doanh thu đặt cọc.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/settings/payment"
            className="px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:text-stone-900 text-xs font-medium shadow-2xs hover:bg-stone-50 transition-colors flex items-center gap-1.5"
          >
            <QrCode className="w-3.5 h-3.5 text-luxury-600" />
            <span>Cấu Hình VietQR</span>
          </Link>

          <button
            type="button"
            onClick={fetchOrders}
            className="p-2 rounded-xl bg-white border border-stone-200 text-stone-600 hover:text-stone-900 shadow-2xs hover:bg-stone-50 transition-colors"
            title="Làm mới"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-stone-400">
            Doanh Thu Thực Nhận
          </span>
          <p className="font-serif text-xl sm:text-2xl font-bold text-emerald-600 truncate">
            {formatVND(stats.totalRevenue)}
          </p>
          <span className="text-[10px] text-stone-400 font-mono block">
            {stats.paid} đơn cọc thành công
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-stone-400">
            Tổng Đơn Hàng
          </span>
          <p className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
            {stats.total}
          </p>
          <span className="text-[10px] text-stone-400 block">
            Tất cả phiên thanh toán
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-stone-400">
            Chờ Thanh Toán
          </span>
          <p className="font-serif text-xl sm:text-2xl font-bold text-amber-600">
            {stats.pending}
          </p>
          <span className="text-[10px] text-stone-400 block">
            Khách đang quét mã QR
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-stone-400">
            Đã Hủy / Hết Hạn
          </span>
          <p className="font-serif text-xl sm:text-2xl font-bold text-stone-400">
            {stats.cancelled}
          </p>
          <span className="text-[10px] text-stone-400 block">
            Giao dịch không thành công
          </span>
        </div>
      </div>

      {/* FILTER TABS & SEARCH BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-stone-200/80 shadow-2xs">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-charcoal-900 text-white'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Tất cả ({stats.total})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('PAID')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'PAID'
                ? 'bg-emerald-600 text-white'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Đã Thanh Toán ({stats.paid})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('PENDING')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'PENDING'
                ? 'bg-amber-600 text-white'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Chờ Chuyển Khoản ({stats.pending})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('CANCELLED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'CANCELLED'
                ? 'bg-stone-700 text-white'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Đã Hủy ({stats.cancelled})
          </button>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative min-w-[260px]">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm mã đơn, tên dâu rể, SĐT..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-luxury-600"
          />
        </form>
      </div>

      {/* 2. ORDER LISTING */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-16 flex items-center justify-center gap-2 text-stone-400 text-xs">
            <Loader2 className="w-5 h-5 animate-spin text-luxury-600" />
            <span>Đang tải danh sách đơn hàng...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-16 text-center text-stone-400 text-xs">
            Không tìm thấy đơn hàng nào phù hợp với bộ lọc.
          </div>
        ) : (
          <>
            {/* 2.A MOBILE CARD VIEW (Under 768px - Responsive Thumb-Friendly Cards) */}
            <div className="md:hidden divide-y divide-stone-100">
              {orders.map((order) => {
                const cleanPhone = order.customerPhone.replace(/[^0-9]/g, '');

                return (
                  <div key={order.id} className="p-4 space-y-3 bg-white hover:bg-stone-50/50">
                    {/* Top Row: Order Code & Status Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-luxury-700 px-2 py-0.5 rounded-md bg-luxury-50 border border-luxury-200">
                          {order.orderCode}
                        </span>
                        <Link
                          href={`/thanh-toan/${order.orderCode}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-stone-400 hover:text-stone-700 transition-colors"
                          title="Mở trang thanh toán"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          order.status === 'PAID'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : order.status === 'PENDING'
                            ? 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
                            : 'bg-stone-100 text-stone-500 border-stone-300'
                        }`}
                      >
                        {order.status === 'PAID'
                          ? 'Đã Thanh Toán'
                          : order.status === 'PENDING'
                          ? 'Chờ Chuyển Khoản'
                          : 'Đã Hủy'}
                      </span>
                    </div>

                    {/* Customer Info & Phone Button */}
                    <div className="space-y-1">
                      <h4 className="font-serif text-sm font-semibold text-stone-900">
                        {order.customerName}
                      </h4>

                      <div className="flex items-center gap-2 pt-1">
                        <a
                          href={`tel:${cleanPhone}`}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-mono text-xs font-medium border border-emerald-200 transition-colors shadow-2xs"
                        >
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>{order.customerPhone}</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => copyToClipboard(order.customerPhone, 'SĐT')}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors"
                          title="Sao chép SĐT"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Package & Amount */}
                    <div className="flex items-baseline justify-between pt-1 border-t border-stone-100 text-xs">
                      <div className="flex items-center gap-1.5 text-stone-700 font-medium truncate max-w-[200px]">
                        <Tag className="w-3 h-3 text-luxury-600 shrink-0" />
                        <span className="truncate">{order.packageName}</span>
                      </div>
                      <span className="font-serif text-sm font-bold text-stone-900">
                        {formatVND(order.amount)}
                      </span>
                    </div>

                    {/* Transaction Detail if Paid */}
                    {order.transactionId && (
                      <p className="text-[10px] font-mono text-stone-400">
                        Mã GD: {order.transactionId}
                      </p>
                    )}

                    {/* Status Changer on Card */}
                    <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                      <span className="text-[10px] text-stone-400 font-mono">
                        {formatDate(order.createdAt)}
                      </span>

                      <select
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as any)}
                        className="text-[11px] py-1 px-2 rounded-lg font-medium border bg-stone-50 border-stone-200 text-stone-700 focus:outline-none cursor-pointer"
                      >
                        <option value="PENDING">Chờ chuyển khoản</option>
                        <option value="PAID">Đã thanh toán</option>
                        <option value="CANCELLED">Đã hủy</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 2.B DESKTOP TABLE VIEW (md+) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200">
                  <tr>
                    <th className="py-3.5 px-6">Mã Đơn (PM)</th>
                    <th className="py-3.5 px-6">Dâu Rể</th>
                    <th className="py-3.5 px-6">Số Điện Thoại</th>
                    <th className="py-3.5 px-6">Gói Chụp</th>
                    <th className="py-3.5 px-6">Số Tiền Cọc</th>
                    <th className="py-3.5 px-6">Trạng Thái</th>
                    <th className="py-3.5 px-6">Thời Gian Tạo</th>
                    <th className="py-3.5 px-6 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {orders.map((order) => {
                    const cleanPhone = order.customerPhone.replace(/[^0-9]/g, '');

                    return (
                      <tr key={order.id} className="hover:bg-stone-50/70 transition-colors">
                        {/* Order Code */}
                        <td className="py-4 px-6 font-mono font-semibold text-luxury-700">
                          <div className="flex items-center gap-1.5">
                            <span>{order.orderCode}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(order.orderCode, 'Mã đơn')}
                              className="text-stone-400 hover:text-stone-700"
                              title="Sao chép mã đơn"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="py-4 px-6 font-medium text-stone-900">
                          <p className="font-serif text-sm">{order.customerName}</p>
                          <p className="text-[11px] text-stone-400">{order.customerEmail}</p>
                        </td>

                        {/* Phone */}
                        <td className="py-4 px-6">
                          <a
                            href={`tel:${cleanPhone}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-mono text-xs border border-emerald-200 transition-colors"
                          >
                            <Phone className="w-3 h-3 text-emerald-600" />
                            <span>{order.customerPhone}</span>
                          </a>
                        </td>

                        {/* Package */}
                        <td className="py-4 px-6 font-medium text-stone-800">
                          {order.packageName}
                        </td>

                        {/* Amount */}
                        <td className="py-4 px-6 font-serif font-bold text-sm text-stone-900">
                          {formatVND(order.amount)}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6">
                          <select
                            value={order.status}
                            disabled={updatingId === order.id}
                            onChange={(e) => handleStatusChange(order.id, e.target.value as any)}
                            className={`text-xs py-1 px-2.5 rounded-lg font-medium border focus:outline-none transition-colors cursor-pointer ${
                              order.status === 'PAID'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : order.status === 'PENDING'
                                ? 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
                                : 'bg-stone-100 text-stone-600 border-stone-300'
                            }`}
                          >
                            <option value="PENDING">⏳ Chờ chuyển khoản</option>
                            <option value="PAID">✅ Đã thanh toán</option>
                            <option value="CANCELLED">❌ Đã hủy</option>
                          </select>
                        </td>

                        {/* Date */}
                        <td className="py-4 px-6 font-mono text-[11px] text-stone-400">
                          {formatDate(order.createdAt)}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <Link
                            href={`/thanh-toan/${order.orderCode}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium transition-colors"
                            title="Xem trang thanh toán của khách"
                          >
                            <span>Xem QR</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
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

      {/* Floating Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 bg-stone-900 text-white text-xs font-medium rounded-xl shadow-xl border border-stone-800 animate-in fade-in duration-200">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

