'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  QrCode,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Search,
  Key,
  Building2,
  Copy,
  Check,
} from 'lucide-react';

interface BankItem {
  id?: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
}

export function BankSettingsCard() {
  const [banks, setBanks] = useState<BankItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [bankSearch, setBankSearch] = useState('');
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
  const [copiedWebhookUrl, setCopiedWebhookUrl] = useState(false);

  // Form State
  const [bankBin, setBankBin] = useState('');
  const [bankShortName, setBankShortName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  const [paymentWebhookKey, setPaymentWebhookKey] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Fetch Banks List
  const fetchBanks = async () => {
    try {
      const res = await fetch('/api/admin/payment/banks');
      const data = await res.json();
      if (data.success && Array.isArray(data.banks)) {
        setBanks(data.banks);
      }
    } catch {
      console.warn('Could not fetch bank list');
    }
  };

  // 2. Fetch Current Settings
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.success && data.settings) {
        const s = data.settings;
        setBankBin(s.bankBin || '970422');
        setBankShortName(s.bankShortName || 'MBBank');
        setBankAccountNumber(s.bankAccountNumber || '');
        setBankAccountName(s.bankAccountName || '');
        setPaymentWebhookKey(s.paymentWebhookKey || '');
      }
    } catch (e: any) {
      setErrorMessage('Không thể tải cấu hình tài khoản ngân hàng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanks();
    fetchSettings();
  }, []);

  // Selected Bank Object
  const selectedBank = banks.find((b) => b.bin === bankBin) || {
    bin: bankBin,
    shortName: bankShortName || 'Ngân hàng',
    name: bankShortName || 'Ngân hàng',
    logo: '',
    code: '',
  };

  // Filtered Banks for Search
  const filteredBanks = banks.filter((b) => {
    const q = bankSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      b.shortName.toLowerCase().includes(q) ||
      b.name.toLowerCase().includes(q) ||
      b.bin.includes(q) ||
      b.code.toLowerCase().includes(q)
    );
  });

  // Handle Save
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setErrorMessage('');

    try {
      const payload = {
        bankBin: bankBin.trim(),
        bankShortName: bankShortName.trim(),
        bankAccountNumber: bankAccountNumber.trim(),
        bankAccountName: bankAccountName.trim().toUpperCase(),
        paymentWebhookKey: paymentWebhookKey.trim(),
        snapshotSeed: true,
      };

      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Lưu cấu hình ngân hàng thất bại.');
      }

      showToast(data.message || 'Đã lưu cài đặt ngân hàng và đồng bộ thành công vào dữ liệu gốc (Seed Mockup)!');
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi lưu cấu hình.');
    } finally {
      setSaving(false);
    }
  };

  // VietQR QuickLink for Live Preview (compact2 format)
  const previewQrUrl =
    bankBin && bankAccountNumber
      ? `https://img.vietqr.io/image/${bankBin}-${bankAccountNumber}-compact2.png${
          bankAccountName && bankAccountName.trim()
            ? `?accountName=${encodeURIComponent(bankAccountName.trim())}`
            : ''
        }`
      : null;

  const webhookPublicUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/api/webhooks/payment`
      : 'https://plusmoments.vn/api/webhooks/payment';

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookPublicUrl);
    setCopiedWebhookUrl(true);
    setTimeout(() => setCopiedWebhookUrl(false), 2500);
  };

  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-3 text-stone-400 bg-white rounded-3xl border border-stone-200">
        <Loader2 className="w-6 h-6 animate-spin text-luxury-600" />
        <p className="text-xs">Đang tải cấu hình ngân hàng & VietQR...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: BANK FORM (7 COLS) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-200 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <h2 className="font-serif text-base font-semibold text-stone-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-luxury-600" />
              <span>Thông Tin Tài Khoản Ngân Hàng</span>
            </h2>
            <span className="text-[11px] text-stone-400 font-mono">Chuẩn Napas VietQR</span>
          </div>

          <form onSubmit={handleSave} className="space-y-5 text-xs">
            {/* SELECT BANK DROPDOWN */}
            <div className="space-y-1.5 relative">
              <label className="block font-semibold text-stone-700">
                Ngân hàng thụ hưởng *
              </label>
              <div
                onClick={() => setIsBankDropdownOpen(!isBankDropdownOpen)}
                className="w-full p-3 bg-stone-50 hover:bg-stone-100/70 border border-stone-200 rounded-2xl flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  {selectedBank.logo ? (
                    <img
                      src={selectedBank.logo}
                      alt={selectedBank.shortName}
                      className="h-6 max-w-[80px] object-contain"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-stone-200 flex items-center justify-center font-bold text-stone-600">
                      {selectedBank.shortName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-stone-900">{selectedBank.shortName}</p>
                    <p className="text-[11px] text-stone-500 truncate max-w-[280px]">
                      {selectedBank.name}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-stone-200 text-stone-700 px-2 py-0.5 rounded-full">
                  BIN: {selectedBank.bin}
                </span>
              </div>

              {/* Dropdown Menu */}
              {isBankDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-stone-200 shadow-xl z-50 p-3 space-y-2 max-h-80 overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm ngân hàng (tên hoặc mã viết tắt)..."
                      value={bankSearch}
                      onChange={(e) => setBankSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-luxury-600"
                      autoFocus
                    />
                  </div>

                  <div className="overflow-y-auto divide-y divide-stone-100 space-y-1 max-h-60 pr-1">
                    {filteredBanks.map((b) => (
                      <div
                        key={b.bin}
                        onClick={() => {
                          setBankBin(b.bin);
                          setBankShortName(b.shortName);
                          setIsBankDropdownOpen(false);
                          setBankSearch('');
                        }}
                        className={`p-2 rounded-xl flex items-center justify-between cursor-pointer hover:bg-stone-50 transition-colors ${
                          b.bin === bankBin ? 'bg-luxury-50 border border-luxury-200' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {b.logo && (
                            <img
                              src={b.logo}
                              alt={b.shortName}
                              className="h-5 max-w-[60px] object-contain"
                            />
                          )}
                          <div>
                            <span className="font-semibold text-stone-800">{b.shortName}</span>
                            <span className="text-stone-400 text-[10px] block truncate max-w-[220px]">
                              {b.name}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-stone-400">BIN: {b.bin}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ACCOUNT NUMBER */}
            <div className="space-y-1.5">
              <label className="block font-semibold text-stone-700">
                Số tài khoản ngân hàng *
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: 0908123456 hoặc 1029384756"
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value.replace(/\s+/g, ''))}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-luxury-600"
              />
              <p className="text-[11px] text-stone-400">
                Số tài khoản chính xác nhận tiền chuyển khoản của Studio.
              </p>
            </div>

            {/* ACCOUNT HOLDER NAME */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block font-semibold text-stone-700">
                  Tên chủ tài khoản (Tùy chọn)
                </label>
                <span className="text-[10px] text-stone-400">Không bắt buộc</span>
              </div>
              <input
                type="text"
                placeholder="Ví dụ: NGUYEN VAN A (Không bắt buộc)"
                value={bankAccountName}
                onChange={(e) => setBankAccountName(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl uppercase font-medium text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-luxury-600"
              />
              <p className="text-[11px] text-stone-400">
                Không bắt buộc. App ngân hàng tự tra cứu tên chủ tài khoản thụ hưởng khi quét mã VietQR.
              </p>
            </div>

            {/* WEBHOOK SECRET */}
            <div className="space-y-1.5 pt-3 border-t border-stone-100">
              <div className="flex items-center justify-between">
                <label className="block font-semibold text-stone-700 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-luxury-600" />
                  <span>Webhook API Secret Token</span>
                </label>
                <span className="text-[10px] text-stone-400">Tùy chọn bảo mật</span>
              </div>
              <input
                type="password"
                placeholder="Nhập secret token đã cấu hình trên SePay hoặc Casso..."
                value={paymentWebhookKey}
                onChange={(e) => setPaymentWebhookKey(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-luxury-600"
              />
              <p className="text-[11px] text-stone-400">
                Dùng để xác thực tính toàn vẹn khi cổng SePay/Casso đẩy thông báo giao dịch về website.
              </p>
            </div>

            {/* WEBHOOK URL HELPER */}
            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-700 text-[11px]">
                  URL Webhook nhận biến động số dư:
                </span>
                <button
                  type="button"
                  onClick={copyWebhookUrl}
                  className="inline-flex items-center gap-1 text-[10px] text-luxury-600 hover:text-luxury-800 font-medium cursor-pointer"
                >
                  {copiedWebhookUrl ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700">Đã sao chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Sao chép URL</span>
                    </>
                  )}
                </button>
              </div>
              <code className="block p-2 bg-white rounded-lg border border-stone-200 font-mono text-[11px] text-stone-700 break-all select-all">
                {webhookPublicUrl}
              </code>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-xl bg-charcoal-900 hover:bg-stone-800 text-white font-semibold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-champagne-gold" />
                    <span>Đang lưu cài đặt...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-champagne-gold" />
                    <span>Lưu Cài Đặt Ngân Hàng</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: LIVE PREVIEW QR (5 COLS) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-2 sm:p-4 w-full">
          {previewQrUrl ? (
            <div className="bg-white p-3 rounded-2xl shadow-xl border border-stone-200 flex flex-col items-center justify-center max-w-full">
              <img
                src={previewQrUrl}
                alt="VietQR Live Preview"
                className="w-full max-w-[260px] sm:max-w-xs h-auto object-contain rounded-xl block"
              />
            </div>
          ) : (
            <div className="w-64 sm:w-72 h-64 sm:h-72 rounded-2xl border-2 border-dashed border-stone-300 flex flex-col items-center justify-center text-stone-400 gap-2 p-6 text-center">
              <QrCode className="w-12 h-12 text-stone-300" />
              <p className="text-xs">Vui lòng nhập số tài khoản để xem trước mã QR</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

