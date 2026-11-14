'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { trackGoogleAdsConversion, trackEvent } from '@/lib/tracking';
import {
  QrCode,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building2,
  ArrowRight,
  ExternalLink,
  Loader2,
  AlertTriangle,
  Receipt,
  Sparkles,
} from 'lucide-react';

interface SelectedAddonItem {
  id: string;
  name: string;
  price: number;
  quantity?: number;
  total?: number;
  unit?: string;
}

interface OrderData {
  orderCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  packageName: string;
  amount: number;
  basePrice?: number | null;
  totalEstimatedPrice?: number | null;
  selectedAddons?: SelectedAddonItem[] | null;
  notes?: string | null;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  paidAt?: string | null;
  transactionId?: string | null;
  createdAt: string;
}

interface BankData {
  bankBin: string;
  bankShortName: string;
  bankAccountNumber: string;
  bankAccountName: string;
}

export default function CheckoutPage({
  params,
}: {
  params: { orderCode: string };
}) {
  const { orderCode } = params;
  const [order, setOrder] = useState<OrderData | null>(null);
  const [bank, setBank] = useState<BankData | null>(null);
  const [tracking, setTracking] = useState<{ googleAdsId?: string; googleAdsPurchaseLabel?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const hasTriggeredCelebration = useRef(false);

  // Play gentle celebratory chime using Web Audio API
  const playSuccessChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 chord
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + idx * 0.1 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.1 + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.85);
      });
    } catch {
      // Audio autoplay gracefully suppressed if user hasn't interacted
    }
  };

  const triggerConfetti = () => {
    try {
      const end = Date.now() + 3 * 1000;
      const colors = ['#C5A880', '#D4AF37', '#FAF8F5', '#1C1917'];

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    } catch {}
  };

  // 1. Initial Order & Bank Fetch
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/orders/${encodeURIComponent(orderCode)}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Không tìm thấy thông tin đơn hàng.');
        }

        setOrder(data.order);
        setBank(data.bank);
        if (data.tracking) setTracking(data.tracking);

        if (data.order.status === 'PAID') {
          setIsSuccess(true);
          setTransactionId(data.order.transactionId);
          if (!hasTriggeredCelebration.current) {
            hasTriggeredCelebration.current = true;
            trackEvent('conversion_purchase', {
              order_id: data.order.orderCode,
              value: data.order.amount,
              currency: 'VND',
              package: data.order.packageName,
            });
            if (data.tracking?.googleAdsId && data.tracking?.googleAdsPurchaseLabel) {
              trackGoogleAdsConversion(
                data.tracking.googleAdsId,
                data.tracking.googleAdsPurchaseLabel,
                data.order.amount,
                'VND'
              );
            }
          }
        }
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tải thông tin đơn hàng.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderCode]);

  // 2. Real-time Status Polling (every 3 seconds)
  useEffect(() => {
    if (isSuccess) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(orderCode)}/status`);
        const data = await res.json();

        if (data.success && data.status === 'PAID') {
          setIsSuccess(true);
          setTransactionId(data.transactionId || null);
          clearInterval(interval);

          if (!hasTriggeredCelebration.current) {
            hasTriggeredCelebration.current = true;
            playSuccessChime();
            triggerConfetti();
            trackEvent('conversion_purchase', {
              order_id: orderCode,
              value: order?.amount || 0,
              currency: 'VND',
              package: order?.packageName || '',
            });
            if (tracking?.googleAdsId && tracking?.googleAdsPurchaseLabel) {
              trackGoogleAdsConversion(
                tracking.googleAdsId,
                tracking.googleAdsPurchaseLabel,
                order?.amount || 0,
                'VND'
              );
            }
          }
        }
      } catch {
        // Silent poll error
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [orderCode, isSuccess]);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // VietQR QuickLink (qr_only format as specified)
  const vietQrUrl =
    bank && order
      ? `https://img.vietqr.io/image/${bank.bankBin}-${bank.bankAccountNumber}-qr_only.png?amount=${
          order.amount
        }&addInfo=${encodeURIComponent(order.orderCode)}${
          bank.bankAccountName && bank.bankAccountName.trim()
            ? `&accountName=${encodeURIComponent(bank.bankAccountName.trim())}`
            : ''
        }`
      : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1C1917] flex flex-col items-center justify-center p-6 text-white space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-champagne-gold" />
        <p className="font-serif text-sm tracking-widest text-stone-300 uppercase">
          Đang khởi tạo cổng thanh toán VietQR...
        </p>
      </div>
    );
  }

  if (error || !order || !bank) {
    return (
      <div className="min-h-screen bg-[#1C1917] flex items-center justify-center p-6 text-white">
        <div className="max-w-md w-full bg-stone-900/90 border border-stone-800 rounded-3xl p-8 text-center space-y-5">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-serif font-medium text-white">
            Không Tìm Thấy Phiên Thanh Toán
          </h2>
          <p className="text-xs text-stone-400 leading-relaxed">
            {error || 'Mã đơn hàng không hợp lệ hoặc đã hết hạn.'}
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-champagne-gold text-charcoal-950 font-semibold text-xs tracking-wider uppercase hover:bg-white transition-all cursor-pointer"
          >
            Về Trang Chủ
          </Link>
        </div>
      </div>
    );
  }

  // SUCCESS CELEBRATION VIEW
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#141210] text-stone-100 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-lg w-full bg-stone-900 border border-stone-800 rounded-3xl p-8 sm:p-10 shadow-2xl text-center space-y-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          {/* Subtle gold glow background */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-40 bg-champagne-gold/15 blur-3xl pointer-events-none rounded-full" />

          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 shadow-inner">
            <CheckCircle2 className="w-10 h-10 animate-bounce" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Giao Dịch Đã Khớp Tự Động</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-light text-white tracking-wide">
              Thanh Toán Thành Công!
            </h1>
            <p className="text-xs text-stone-400 font-light max-w-sm mx-auto leading-relaxed">
              Cảm ơn quý khách <strong className="text-stone-200">{order.customerName}</strong>.
              Hệ thống đã tự động ghi nhận thanh toán cho đơn hàng{' '}
              <strong className="text-champagne-gold font-mono">{order.orderCode}</strong>.
            </p>
          </div>

          {/* Receipt Info Card */}
          <div className="p-5 rounded-2xl bg-stone-950/60 border border-stone-800/80 text-left space-y-3 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-stone-800/60">
              <span className="text-stone-400">Gói Dịch Vụ:</span>
              <span className="font-serif font-medium text-white">{order.packageName}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-stone-800/60">
              <span className="text-stone-400">Số Tiền Đã Thanh Toán:</span>
              <span className="font-semibold text-champagne-gold font-mono text-sm">
                {order.amount.toLocaleString('vi-VN')} đ
              </span>
            </div>
            {transactionId && (
              <div className="flex justify-between items-center pb-2 border-b border-stone-800/60">
                <span className="text-stone-400">Mã Giao Dịch Ngân Hàng:</span>
                <span className="font-mono text-stone-300">{transactionId}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-stone-400">Thời Gian Ghi Nhận:</span>
              <span className="font-mono text-stone-400 text-[11px]">
                {new Date().toLocaleString('vi-VN')}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-stone-400 leading-relaxed">
            Email xác nhận và biên nhận dịch vụ đã được gửi tới{' '}
            <span className="text-stone-200 font-medium">{order.customerEmail || order.customerPhone}</span>.
            Ekip PlusMoments sẽ liên hệ với quý khách trong ít phút!
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-champagne-gold hover:bg-white text-charcoal-950 font-semibold text-xs tracking-wider uppercase transition-all shadow-md cursor-pointer"
            >
              Về Trang Chủ
            </Link>
            <Link
              href="/albums"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs tracking-wider uppercase transition-all cursor-pointer"
            >
              Khám Phá Album
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // MAIN CHECKOUT & QR CODE VIEW
  return (
    <div className="min-h-screen bg-[#1C1917] text-stone-100 flex flex-col justify-between selection:bg-champagne-gold selection:text-charcoal-950">
      {/* TOP HEADER */}
      <header className="border-b border-stone-800/80 bg-stone-950/40 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-serif text-sm tracking-widest text-white uppercase group-hover:text-champagne-gold transition-colors">
            PLUSMOMENTS
          </span>
          <span className="text-[10px] text-stone-500 font-light tracking-widest uppercase hidden sm:inline">
            | Cổng Thanh Toán An Toàn
          </span>
        </Link>
        <div className="flex items-center gap-2 text-[11px] text-stone-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Bảo mật chuẩn Napas VietQR</span>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main id="main-content" className="max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 my-auto">
        <div className="bg-stone-900/90 rounded-3xl border border-stone-800 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* LEFT: QR CODE DISPLAY (5 COLS) */}
          <div className="md:col-span-5 bg-black/40 p-6 sm:p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-stone-800/80 space-y-4">
            <div className="text-center space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-widest text-champagne-gold">
                Quét mã để chuyển khoản
              </span>
              <h3 className="font-serif text-sm text-stone-300">
                Mở App Ngân Hàng / Ví Điện Tử
              </h3>
            </div>

            {/* QR CODE CONTAINER */}
            <div className="p-3 bg-white rounded-2xl shadow-xl relative group">
              {vietQrUrl ? (
                <img
                  src={vietQrUrl}
                  alt={`VietQR ${order.orderCode}`}
                  className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-xl block"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-stone-400">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              )}
            </div>

            {/* POLLING INDICATOR */}
            <div className="flex items-center gap-2 text-stone-400 text-xs bg-stone-950/60 px-3.5 py-1.5 rounded-full border border-stone-800">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-champagne-gold opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-champagne-gold"></span>
              </span>
              <span className="text-[11px] font-mono">Đang chờ quét mã chuyển khoản...</span>
            </div>
          </div>

          {/* RIGHT: PAYMENT INSTRUCTIONS & DETAILS (7 COLS) */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              {/* Header Title */}
              <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                <div>
                  <h2 className="font-serif text-lg sm:text-xl font-light text-white tracking-wide">
                    {order.packageName}
                  </h2>
                  <p className="text-xs text-stone-400 font-light mt-0.5">
                    Khách hàng: <span className="text-stone-200 font-medium">{order.customerName}</span> ({order.customerPhone})
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-stone-400 block font-mono uppercase">
                    Mã Đơn Hàng
                  </span>
                  <span className="text-sm font-bold font-mono text-champagne-gold">
                    {order.orderCode}
                  </span>
                </div>
              </div>

              {/* BẢNG DỰ TOÁN & DỊCH VỤ ĐI KÈM (KHI CÓ ADD-ONS HOẶC CỌC 30%) */}
              {((order.selectedAddons && order.selectedAddons.length > 0) || (order.totalEstimatedPrice && order.totalEstimatedPrice > order.amount)) && (
                <div className="mt-4 p-3.5 rounded-2xl bg-stone-950/70 border border-amber-500/20 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Chi Tiết Dự Toán Gói Chụp
                    </span>
                    {order.totalEstimatedPrice && order.amount < order.totalEstimatedPrice && (
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                        Đặt cọc giữ ngày 30%
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs">
                    {order.basePrice ? (
                      <div className="flex items-center justify-between text-stone-300">
                        <span>• Gói dịch vụ gốc:</span>
                        <span className="font-mono text-stone-200">{order.basePrice.toLocaleString('vi-VN')} đ</span>
                      </div>
                    ) : null}

                    {Array.isArray(order.selectedAddons) && order.selectedAddons.map((addon) => (
                      <div key={addon.id} className="flex items-center justify-between text-stone-400 text-[11px]">
                        <span className="truncate pr-2">
                          + {addon.name} {addon.quantity && addon.quantity > 1 ? `(x${addon.quantity})` : ''}
                        </span>
                        <span className="font-mono text-amber-200/90 shrink-0">
                          {(addon.total || addon.price * (addon.quantity || 1)).toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                    ))}

                    {order.totalEstimatedPrice ? (
                      <div className="pt-2 border-t border-stone-800 flex items-center justify-between font-medium text-xs">
                        <span className="text-stone-300">Tổng Dự Toán Trọn Gói:</span>
                        <span className="font-mono text-white font-semibold">
                          {order.totalEstimatedPrice.toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}

              {/* PAYMENT DETAILS LIST */}
              <div className="mt-5 space-y-3 text-xs">
                {/* 1. Ngân Hàng */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-stone-950/60 border border-stone-800/80">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-stone-400 uppercase font-mono block">
                      Ngân Hàng Thụ Hưởng
                    </span>
                    <span className="font-semibold text-white text-sm">
                      {bank.bankShortName}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-stone-400 bg-stone-900 px-2 py-0.5 rounded">
                    BIN: {bank.bankBin}
                  </span>
                </div>

                {/* 2. Số Tài Khoản */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-stone-950/60 border border-stone-800/80">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-stone-400 uppercase font-mono block">
                      Số Tài Khoản
                    </span>
                    <span className="font-bold text-white text-base tracking-wider font-mono">
                      {bank.bankAccountNumber}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(bank.bankAccountNumber, 'accNumber')}
                    className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors cursor-pointer"
                    title="Sao chép số tài khoản"
                  >
                    {copiedField === 'accNumber' ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* 3. Tên Chủ Tài Khoản (Hiển thị nếu có hoặc ghi chú tự động tra cứu) */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-stone-950/60 border border-stone-800/80">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-stone-400 uppercase font-mono block">
                      Chủ Tài Khoản
                    </span>
                    <span className="font-semibold text-white uppercase text-xs">
                      {bank.bankAccountName || 'Tự động tra cứu khi quét VietQR'}
                    </span>
                  </div>
                  {bank.bankAccountName && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(bank.bankAccountName, 'accName')}
                      className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors cursor-pointer"
                      title="Sao chép tên chủ tài khoản"
                    >
                      {copiedField === 'accName' ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>

                {/* 4. Số Tiền Chính Xác */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-stone-950/60 border border-stone-800/80">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-stone-400 uppercase font-mono block">
                      Số Tiền Cần Chuyển
                    </span>
                    <span className="font-bold text-champagne-gold text-lg font-mono">
                      {order.amount.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(String(order.amount), 'amount')}
                    className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors cursor-pointer"
                    title="Sao chép số tiền"
                  >
                    {copiedField === 'amount' ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* 5. Nội Dung Chuyển Khoản (CRITICAL) */}
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono font-bold text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Nội Dung Chuyển Khoản (Bắt buộc giữ nguyên)
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(order.orderCode, 'orderCode')}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300 hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedField === 'orderCode' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Đã chép mã</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Sao chép mã</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="text-lg font-mono font-bold text-white tracking-widest py-1 select-all">
                    {order.orderCode}
                  </div>
                  <p className="text-[11px] text-amber-200/80 leading-relaxed font-light">
                    Hệ thống kiểm tra tự động mã <strong className="text-white font-mono">{order.orderCode}</strong> trong lời nhắn để xác nhận thanh toán tức thì trong 3-5 giây.
                  </p>
                </div>
              </div>
            </div>

            {/* Footnote */}
            <div className="pt-2 border-t border-stone-800/80 text-[11px] text-stone-500 flex items-center justify-between">
              <span>Được bảo vệ bởi PlusMoments Payment Gateway</span>
              <span className="font-mono">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="px-6 py-4 border-t border-stone-800/60 text-center text-[11px] text-stone-500 font-light">
        © 2026 PlusMoments Wedding Studio. All rights reserved.
      </footer>
    </div>
  );
}

