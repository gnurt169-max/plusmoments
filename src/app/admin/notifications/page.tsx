'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Send,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  ExternalLink,
  Webhook,
} from 'lucide-react';
import { EmailSettingsCard } from '@/components/admin/EmailSettingsCard';

interface NotificationConfig {
  telegramEnabled: boolean;
  telegramBotToken: string;
  telegramChatId: string;
  emailNotificationEnabled: boolean;
  adminReceiverEmail: string;
  zaloWebhookUrl: string;
}

export default function AdminNotificationSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [verifyingSmtp, setVerifyingSmtp] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Test Results
  const [telegramTestStatus, setTelegramTestStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const [emailTestStatus, setEmailTestStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const [formData, setFormData] = useState<NotificationConfig>({
    telegramEnabled: false,
    telegramBotToken: '',
    telegramChatId: '',
    emailNotificationEnabled: true,
    adminReceiverEmail: 'contact@plusmoments.vn',
    zaloWebhookUrl: '',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    fetch('/api/admin/settings/notifications')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setFormData({
            telegramEnabled: Boolean(data.settings.telegramEnabled),
            telegramBotToken: data.settings.telegramBotToken || '',
            telegramChatId: data.settings.telegramChatId || '',
            emailNotificationEnabled: Boolean(data.settings.emailNotificationEnabled),
            adminReceiverEmail: data.settings.adminReceiverEmail || 'contact@plusmoments.vn',
            zaloWebhookUrl: data.settings.zaloWebhookUrl || '',
          });
        }
      })
      .catch(() => {
        setErrorMessage('Không thể tải cấu hình thông báo từ máy chủ.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/admin/settings/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Lưu cấu hình thất bại.');
      }

      showToast('Đã lưu cấu hình thông báo tức thì thành công!');
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi kết nối khi lưu cấu hình.');
    } finally {
      setSaving(false);
    }
  };

  const handleTestTelegram = async () => {
    if (!formData.telegramBotToken.trim()) {
      alert('Vui lòng nhập Telegram Bot Token trước khi kiểm tra.');
      return;
    }
    if (!formData.telegramChatId.trim()) {
      alert('Vui lòng nhập Telegram Chat ID trước khi kiểm tra.');
      return;
    }

    setTestingTelegram(true);
    setTelegramTestStatus(null);

    try {
      const res = await fetch('/api/admin/notifications/test-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: formData.telegramBotToken,
          chatId: formData.telegramChatId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTelegramTestStatus({
          success: true,
          message: data.message || 'Gửi tin nhắn test thành công! Hãy kiểm tra Telegram của bạn.',
        });
      } else {
        setTelegramTestStatus({
          success: false,
          message: data.error || 'Gửi tin nhắn test thất bại.',
        });
      }
    } catch (err: any) {
      setTelegramTestStatus({
        success: false,
        message: err.message || 'Lỗi kết nối kiểm tra bot Telegram.',
      });
    } finally {
      setTestingTelegram(false);
    }
  };

  const handleVerifySmtp = async () => {
    setVerifyingSmtp(true);
    setEmailTestStatus(null);
    try {
      const res = await fetch('/api/admin/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify' }),
      });
      const data = await res.json();
      setEmailTestStatus({
        success: data.success,
        message: data.message,
      });
    } catch (err: any) {
      setEmailTestStatus({
        success: false,
        message: err.message || 'Lỗi kiểm tra kết nối SMTP.',
      });
    } finally {
      setVerifyingSmtp(false);
    }
  };

  const handleTestEmail = async () => {
    if (!formData.adminReceiverEmail.trim() || !formData.adminReceiverEmail.includes('@')) {
      alert('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }

    setTestingEmail(true);
    setEmailTestStatus(null);

    try {
      const res = await fetch('/api/admin/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.adminReceiverEmail,
          action: 'send',
        }),
      });

      const data = await res.json();
      setEmailTestStatus({
        success: data.success,
        message: data.message || 'Đã gửi email thử nghiệm thành công!',
      });
    } catch (err: any) {
      setEmailTestStatus({
        success: false,
        message: err.message || 'Lỗi kết nối kiểm tra email.',
      });
    } finally {
      setTestingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-charcoal-400 gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-luxury-600" />
        <span className="text-xs">Đang tải cấu hình thông báo...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-8 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl bg-charcoal-900 text-white text-xs shadow-2xl border border-luxury-500/40 animate-in fade-in duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-light text-charcoal-900">
          Cấu Hình Thông Báo Tức Thì (Instant Alerts)
        </h1>
        <p className="text-xs text-charcoal-500 mt-1">
          Thiết lập Telegram Bot và Email nhận thông báo ngay khi có khách hàng điền form tư vấn / báo giá.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* =========================================================================
            CARD 1: TELEGRAM BOT NOTIFICATIONS
        ========================================================================= */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-100 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-200">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-light text-charcoal-900">
                  Thông Báo Qua Telegram Bot
                </h3>
                <p className="text-xs text-charcoal-500 font-light">
                  Bắn tin nhắn tự động về Telegram cá nhân hoặc Group chat của studio ngay trong 1 giây.
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <label className="flex items-center gap-3 cursor-pointer shrink-0">
              <span className="text-xs font-medium text-charcoal-700">
                {formData.telegramEnabled ? 'Đang Bật' : 'Đang Tắt'}
              </span>
              <div className="relative inline-block w-11 h-6">
                <input
                  type="checkbox"
                  checked={formData.telegramEnabled}
                  onChange={(e) =>
                    setFormData({ ...formData, telegramEnabled: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500" />
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Telegram Bot Token */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs uppercase tracking-wider text-charcoal-600 font-medium">
                  Telegram Bot Token <span className="text-luxury-600">*</span>
                </label>
                <a
                  href="https://t.me/BotFather"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-sky-600 hover:underline flex items-center gap-1 font-medium"
                >
                  <span>Lấy tại @BotFather</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="text"
                value={formData.telegramBotToken}
                onChange={(e) =>
                  setFormData({ ...formData, telegramBotToken: e.target.value })
                }
                placeholder="VD: 7123456789:AAHq_m5wB9aZ..."
                className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
              <p className="text-[11px] text-charcoal-400 font-light mt-1">
                Mở ứng dụng Telegram, chat <code>/newbot</code> với <strong>@BotFather</strong> để tạo bot mới và nhận token.
              </p>
            </div>

            {/* Telegram Chat ID */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs uppercase tracking-wider text-charcoal-600 font-medium">
                  Telegram Chat ID / Group ID <span className="text-luxury-600">*</span>
                </label>
                <a
                  href="https://t.me/userinfobot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-sky-600 hover:underline flex items-center gap-1 font-medium"
                >
                  <span>Lấy ID từ @userinfobot</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="text"
                value={formData.telegramChatId}
                onChange={(e) =>
                  setFormData({ ...formData, telegramChatId: e.target.value })
                }
                placeholder="VD: 987654321 hoặc -1001234567890 (Group)"
                className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
              <p className="text-[11px] text-charcoal-400 font-light mt-1">
                Nhập Chat ID của bạn hoặc Group ID (bắt đầu bằng <code>-100...</code> sau khi thêm bot vào nhóm và cấp quyền admin).
              </p>
            </div>
          </div>

          {/* Test Telegram Result Box */}
          {telegramTestStatus && (
            <div
              className={`p-4 rounded-xl text-xs flex items-start gap-2.5 border ${
                telegramTestStatus.success
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : 'bg-red-50 text-red-800 border-red-200'
              }`}
            >
              {telegramTestStatus.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <p className="font-semibold">
                  {telegramTestStatus.success ? 'Kiểm tra thành công!' : 'Kiểm tra thất bại!'}
                </p>
                <p className="font-light">{telegramTestStatus.message}</p>
              </div>
            </div>
          )}

          {/* Test Button */}
          <div className="flex items-center justify-between pt-2 border-t border-stone-100">
            <span className="text-[11px] text-charcoal-500 font-light">
              * Khuyến nghị bấm nút kiểm tra để đảm bảo bot có thể gửi tin nhắn đến Telegram của bạn trước khi lưu.
            </span>

            <button
              type="button"
              onClick={handleTestTelegram}
              disabled={testingTelegram}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-600 active:scale-95 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50 shrink-0"
            >
              {testingTelegram ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang Gửi Tin Nhắn Test...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi Tin Nhắn Kiểm Tra (Test Bot)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* =========================================================================
            CARD 2: EMAIL NOTIFICATIONS (FULL INLINE SMTP CONFIGURATION)
        ========================================================================= */}
        <EmailSettingsCard />

        {/* =========================================================================
            CARD 3: ZALO ZNS / CUSTOM WEBHOOK
        ========================================================================= */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200">
              <Webhook className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-light text-charcoal-900">
                Webhook Kết Nối CRM / Zalo ZNS / Automation
              </h3>
              <p className="text-xs text-charcoal-500 font-light">
                Tự động bắn dữ liệu JSON của dâu rể tới hệ thống CRM hoặc nền tảng n8n / Make / Zapier.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1 font-medium">
              Webhook Endpoint URL (Tùy chọn)
            </label>
            <input
              type="url"
              value={formData.zaloWebhookUrl}
              onChange={(e) =>
                setFormData({ ...formData, zaloWebhookUrl: e.target.value })
              }
              placeholder="https://n8n.yourstudio.com/webhook/plusmoments-leads"
              className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <p className="text-[11px] text-charcoal-400 font-light mt-1">
              Payload gửi đi gồm: <code>fullName</code>, <code>phone</code>, <code>packageInterested</code>, <code>weddingDate</code>, <code>estimatedBudget</code>, <code>notes</code>, <code>utmSource</code>, <code>timestamp</code>.
            </p>
          </div>
        </div>

        {/* Global Save Button */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-stone-200">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 active:scale-95 text-white font-semibold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg disabled:opacity-60 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-luxury-400" />
                <span>Đang Lưu Cấu Hình...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-luxury-400" />
                <span>Lưu Cấu Hình Thông Báo</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

