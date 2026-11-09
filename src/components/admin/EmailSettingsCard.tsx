'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Mail,
  Server,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  Send,
  Plug,
  Sparkles,
  FileText,
  ShoppingBag,
  Code2,
  Tag,
} from 'lucide-react';

export interface EmailSettingsData {
  smtpEnabled: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPass: string;
  emailFrom: string;
  adminNotifyEmail: string;
  consultLeadEmailSubject: string;
  consultLeadEmailBody: string;
  packageOrderEmailSubject: string;
  packageOrderEmailBody: string;
}

export function EmailSettingsCard() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTemplateTab, setActiveTemplateTab] = useState<'LEAD' | 'ORDER'>('LEAD');

  const leadTextareaRef = useRef<HTMLTextAreaElement>(null);
  const orderTextareaRef = useRef<HTMLTextAreaElement>(null);

  // States quản lý email test trực tiếp
  const [testEmailRecipient, setTestEmailRecipient] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [formData, setFormData] = useState<EmailSettingsData>({
    smtpEnabled: true,
    smtpHost: 'mail.plusmoments.vn',
    smtpPort: 465,
    smtpSecure: true,
    smtpUser: '',
    smtpPass: '',
    emailFrom: '"PlusMoments Wedding Studio" <booking@plusmoments.vn>',
    adminNotifyEmail: 'director.wedding@plusmoments.vn',
    consultLeadEmailSubject: '[PlusMoments] Xác nhận đăng ký tư vấn & Nhận ưu đãi 2.000.000đ',
    consultLeadEmailBody: `Kính gửi {customerName},\n\nPlusMoments rất vinh hạnh được tiếp nhận thông tin đăng ký tư vấn từ hai bạn. Chúng tôi đã kích hoạt bảo lưu gói Ưu đãi 2.000.000đ cho phiên tư vấn này.\n\nTHÔNG TIN TIẾP NHẬN:\n• Số điện thoại: {customerPhone}\n• Dịch vụ quan tâm: {concept}\n• Ngân sách dự kiến: {budget}\n\nChuyên viên tư vấn của studio sẽ chủ động liên hệ qua điện thoại hoặc Zalo trong ít phút để gửi trọn bộ catalog ảnh mẫu và trao đổi lịch trình chu đáo nhất.\n\nHotline: 0903.768.871 | Địa chỉ: 31 Hùng Vương, Phường An Đông`,
    packageOrderEmailSubject: '[PlusMoments] Xác nhận đăng ký gói dịch vụ & Hướng dẫn thanh toán',
    packageOrderEmailBody: `Kính gửi {customerName},\n\nPlusMoments xin chân thành cảm ơn bạn đã tin tưởng lựa chọn dịch vụ chụp ảnh cưới của chúng tôi. Đơn đặt gói của bạn đã được khởi tạo thành công trên hệ thống.\n\nTHÔNG TIN ĐƠN HÀNG:\n• Mã đơn hàng: #{orderCode}\n• Gói dịch vụ: {packageName}\n• Số tiền thanh toán: {packagePrice}\n• Số điện thoại: {customerPhone}\n\nHƯỚNG DẪN THANH TOÁN VIETQR:\nQuý khách vui lòng hoàn tất thanh toán cọc bằng cách quét mã VietQR tự động trên hệ thống hoặc chuyển khoản chính xác với nội dung chuyển khoản là mã đơn hàng: {orderCode}.\n\nHệ thống sẽ tự động xác nhận ngay khi nhận được thanh toán. Chuyên viên PlusMoments sẽ liên hệ để xếp lịch thử váy cưới và chốt kịch bản chụp.\n\nHotline hỗ trợ 24/7: 0903.768.871`,
  });

  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      // Auto clear feedback after 7 seconds
      setFeedback((current) => (current?.message === message ? null : current));
    }, 7000);
  };

  // Fetch initial email settings from backend
  useEffect(() => {
    fetch('/api/admin/settings/email')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setFormData((prev) => ({
            ...prev,
            smtpEnabled: Boolean(data.settings.smtpEnabled ?? true),
            smtpHost: data.settings.smtpHost || 'mail.plusmoments.vn',
            smtpPort: Number(data.settings.smtpPort) || 465,
            smtpSecure: Boolean(data.settings.smtpSecure ?? true),
            smtpUser: data.settings.smtpUser || '',
            smtpPass: data.settings.smtpPass || '',
            emailFrom: data.settings.emailFrom || '"PlusMoments Wedding Studio" <booking@plusmoments.vn>',
            adminNotifyEmail: data.settings.adminNotifyEmail || 'director.wedding@plusmoments.vn',
            consultLeadEmailSubject: data.settings.consultLeadEmailSubject || prev.consultLeadEmailSubject,
            consultLeadEmailBody: data.settings.consultLeadEmailBody || prev.consultLeadEmailBody,
            packageOrderEmailSubject: data.settings.packageOrderEmailSubject || prev.packageOrderEmailSubject,
            packageOrderEmailBody: data.settings.packageOrderEmailBody || prev.packageOrderEmailBody,
          }));
        }
      })
      .catch(() => {
        showFeedback('error', 'Không thể tải cấu hình email từ hệ thống.');
      })
      .finally(() => setLoading(false));
  }, []);

  const insertTag = (
    tag: string,
    field: 'consultLeadEmailBody' | 'packageOrderEmailBody',
    ref: React.RefObject<HTMLTextAreaElement>
  ) => {
    const textarea = ref.current;
    if (!textarea) {
      setFormData((prev) => ({ ...prev, [field]: (prev[field] || '') + tag }));
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const updated = before + tag + after;
    setFormData((prev) => ({ ...prev, [field]: updated }));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length, start + tag.length);
    }, 50);
  };

  // 1. Kiểm tra cổng máy chủ SMTP trực tiếp
  const handleVerifyConnection = async () => {
    if (!formData.smtpHost) {
      setTestResult({
        success: false,
        message: 'Vui lòng nhập SMTP Host trước khi kiểm tra.',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/admin/email/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: formData.smtpHost.trim(),
          port: Number(formData.smtpPort) || 465,
          secure: formData.smtpSecure,
          user: formData.smtpUser.trim(),
          pass: formData.smtpPass.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: `✓ ${data.message || 'Kết nối và xác thực cổng máy chủ SMTP thành công 100%!'}`,
        });
      } else {
        setTestResult({
          success: false,
          message: `✕ ${data.message || 'Không thể kết nối máy chủ SMTP. Vui lòng kiểm tra lại Host, Port hoặc Mật khẩu.'}`,
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `✕ Lỗi mạng hoặc máy chủ không phản hồi: ${err.message || err}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  // 2. Gửi thư thử nghiệm trực tiếp đến email người nhận
  const handleSendTestMail = async () => {
    const recipient = testEmailRecipient.trim();
    if (!recipient || !recipient.includes('@')) {
      setTestResult({
        success: false,
        message: 'Vui lòng nhập địa chỉ email người nhận hợp lệ trước khi gửi thư test.',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/admin/email/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipient,
          host: formData.smtpHost.trim(),
          port: Number(formData.smtpPort) || 465,
          secure: formData.smtpSecure,
          user: formData.smtpUser.trim(),
          pass: formData.smtpPass.trim(),
          from: formData.emailFrom.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: data.message || `Đã gửi thư thử nghiệm thành công tới ${recipient}! Vui lòng kiểm tra hộp thư đến (và mục Spam).`,
        });
      } else {
        setTestResult({
          success: false,
          message: data.message || 'Gửi thư thử nghiệm thất bại. Vui lòng kiểm tra lại thông số SMTP hoặc mật khẩu.',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Gửi thất bại: ${err.message || 'Lỗi mạng hoặc máy chủ không phản hồi.'}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  // 3. Save Settings to Database & Sync into prisma/seed.ts
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/settings/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Lưu cài đặt thất bại.');
      }

      showFeedback(
        'success',
        data.message || 'Đã lưu cấu hình email và đồng bộ thành công vào dữ liệu gốc (Seed Mockup)!'
      );
    } catch (err: any) {
      showFeedback('error', err.message || 'Lỗi khi lưu cấu hình.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8 flex items-center justify-center gap-2 text-stone-400 text-xs">
        <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
        <span>Đang tải cấu hình SMTP Email...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
      {/* HEADER & TOGGLE */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-light text-charcoal-900 flex items-center gap-2">
              <span>Thông Báo Qua Email Studio (SMTP Email Pro)</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-mono font-medium border border-emerald-200">
                Nodemailer
              </span>
            </h3>
            <p className="text-xs text-charcoal-500 font-light mt-0.5">
              Tự động gửi email xác nhận đặt lịch Luxury Minimalist cho khách và cảnh báo tức thì cho ban quản trị.
            </p>
          </div>
        </div>

        {/* Toggle On/Off Switch */}
        <label className="flex items-center gap-3 cursor-pointer shrink-0 select-none">
          <span className="text-xs font-medium text-charcoal-700">
            {formData.smtpEnabled ? (
              <span className="text-amber-700 font-semibold">Đang Bật</span>
            ) : (
              <span className="text-stone-400">Đang Tắt</span>
            )}
          </span>
          <div className="relative inline-block w-11 h-6">
            <input
              type="checkbox"
              checked={formData.smtpEnabled}
              onChange={(e) =>
                setFormData({ ...formData, smtpEnabled: e.target.checked })
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600" />
          </div>
        </label>
      </div>

      {/* FEEDBACK ALERT */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs flex items-start gap-2.5 border transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          )}
          <span className="leading-relaxed font-medium">{feedback.message}</span>
        </div>
      )}

      {/* FORM FIELDS - ALL INLINE WITHOUT REDIRECT */}
      <div className="space-y-5">
        {/* TOP FIELD: EMAIL NHẬN THÔNG BÁO LEAD MỚI */}
        <div className="space-y-1.5">
          <label className="block text-xs uppercase tracking-wider text-charcoal-600 font-medium">
            Địa Chỉ Email Nhận Thông Báo Lead Mới <span className="text-luxury-600">*</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              placeholder="VD: director.wedding@plusmoments.vn hoặc plusmoments.studio@gmail.com"
              value={formData.adminNotifyEmail}
              onChange={(e) => setFormData({ ...formData, adminNotifyEmail: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs text-charcoal-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <p className="text-[11px] text-stone-400">
            Hòm thư của studio sẽ nhận cảnh báo tức thì ngay khi có khách hàng điền form tư vấn hoặc thanh toán cọc.
          </p>
        </div>

        {/* DÒNG 1: SMTP HOST + CỔNG PORT + GIAO THỨC BẢO MẬT */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 sm:gap-4">
          {/* SMTP HOST (7 COLS) */}
          <div className="md:col-span-6 space-y-1.5">
            <label className="block text-xs uppercase tracking-wider text-charcoal-600 font-medium">
              SMTP Host / Máy Chủ Thư <span className="text-luxury-600">*</span>
            </label>
            <div className="relative">
              <Server className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="mail.plusmoments.vn"
                value={formData.smtpHost}
                onChange={(e) => setFormData({ ...formData, smtpHost: e.target.value })}
                className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs text-charcoal-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <p className="text-[11px] text-stone-400">
              Địa chỉ SMTP của gói Email Pro tên miền (hoặc smtp.gmail.com).
            </p>
          </div>

          {/* CỔNG PORT (3 COLS) */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="block text-xs uppercase tracking-wider text-charcoal-600 font-medium">
              Cổng Port <span className="text-luxury-600">*</span>
            </label>
            <input
              type="number"
              required
              placeholder="465"
              value={formData.smtpPort}
              onChange={(e) => {
                const port = Number(e.target.value) || 465;
                setFormData({
                  ...formData,
                  smtpPort: port,
                  smtpSecure: port === 465,
                });
              }}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs text-charcoal-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <p className="text-[11px] text-stone-400">Default: 465 (SSL) / 587 (TLS)</p>
          </div>

          {/* GIAO THỨC BẢO MẬT (3 COLS) */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="block text-xs uppercase tracking-wider text-charcoal-600 font-medium">
              Giao Thức Bảo Mật
            </label>
            <select
              value={formData.smtpSecure ? 'SSL' : 'TLS'}
              onChange={(e) => {
                const isSsl = e.target.value === 'SSL';
                setFormData({
                  ...formData,
                  smtpSecure: isSsl,
                  smtpPort: isSsl ? 465 : 587,
                });
              }}
              className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-charcoal-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              <option value="SSL">SSL (Cổng 465)</option>
              <option value="TLS">TLS (Cổng 587)</option>
            </select>
            <p className="text-[11px] text-stone-400">Mã hóa kết nối</p>
          </div>
        </div>

        {/* DÒNG 2: TÀI KHOẢN SMTP USER + MẬT KHẨU (TOGGLE MẮT) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
          {/* SMTP USER */}
          <div className="space-y-1.5">
            <label className="block text-xs uppercase tracking-wider text-charcoal-600 font-medium">
              Tài Khoản SMTP User <span className="text-luxury-600">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="booking@plusmoments.vn"
                value={formData.smtpUser}
                onChange={(e) => setFormData({ ...formData, smtpUser: e.target.value })}
                className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs text-charcoal-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <p className="text-[11px] text-stone-400">
              Tài khoản email dùng để xác thực gửi thư.
            </p>
          </div>

          {/* SMTP PASSWORD */}
          <div className="space-y-1.5">
            <label className="block text-xs uppercase tracking-wider text-charcoal-600 font-medium">
              Mật Khẩu SMTP Password <span className="text-luxury-600">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Nhập mật khẩu hòm thư hoặc App Password..."
                value={formData.smtpPass}
                onChange={(e) => setFormData({ ...formData, smtpPass: e.target.value })}
                className="w-full pl-10 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs text-charcoal-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1.5 text-stone-400 hover:text-stone-700 absolute right-2.5 top-1/2 -translate-y-1/2 rounded transition-colors cursor-pointer"
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-stone-400">
              Bảo mật 100%, có thể bật/tắt hiển thị để kiểm tra chính xác.
            </p>
          </div>
        </div>

        {/* DÒNG 3: TÊN & EMAIL NGƯỜI GỬI HIỂN THỊ (EMAIL FROM) */}
        <div className="space-y-1.5">
          <label className="block text-xs uppercase tracking-wider text-charcoal-600 font-medium">
            Tên & Email Người Gửi Hiển Thị (Email From)
          </label>
          <input
            type="text"
            placeholder="PlusMoments Wedding Studio <booking@plusmoments.vn>"
            value={formData.emailFrom}
            onChange={(e) => setFormData({ ...formData, emailFrom: e.target.value })}
            className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs text-charcoal-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <p className="text-[11px] text-stone-400">
            Tên studio kèm địa chỉ hiển thị trong hòm thư của dâu rể (VD: PlusMoments Wedding Studio &lt;booking@plusmoments.vn&gt;).
          </p>
        </div>

        {/* =========================================================================
            KHU VỰC CẤU HÌNH MẪU EMAIL TỰ ĐỘNG GỬI KHÁCH HÀNG (CMS TEMPLATES)
        ========================================================================= */}
        <div className="mt-8 pt-6 border-t border-stone-200/90 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h4 className="font-serif text-base font-medium text-charcoal-900 flex items-center gap-2">
                <span>📝 Tùy Biến Mẫu Email Tự Động (Email Templates)</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-mono font-medium border border-amber-200">
                  Dynamic Placeholders
                </span>
              </h4>
              <p className="text-xs text-charcoal-500 font-light mt-0.5">
                Thiết lập tiêu đề và nội dung email tự động gửi đến dâu rể khi đăng ký tư vấn hoặc đặt mua gói cưới.
              </p>
            </div>

            {/* Template Tab Switcher */}
            <div className="inline-flex p-1 bg-stone-100 rounded-xl border border-stone-200/80 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTemplateTab('LEAD')}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTemplateTab === 'LEAD'
                    ? 'bg-white text-charcoal-900 shadow-xs font-semibold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-amber-600" />
                <span>Mẫu Email Tư Vấn (Leads)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTemplateTab('ORDER')}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTemplateTab === 'ORDER'
                    ? 'bg-white text-charcoal-900 shadow-xs font-semibold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
                <span>Mẫu Mua Gói (Orders)</span>
              </button>
            </div>
          </div>

          {/* TAB 1: MẪU EMAIL TƯ VẤN (LEADS) */}
          {activeTemplateTab === 'LEAD' && (
            <div className="p-5 bg-[#FAF8F5] border border-amber-900/15 rounded-2xl space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-charcoal-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-700" />
                  <span>Email Xác Nhận Đăng Ký Tư Vấn & Ưu Đãi 2.000.000đ</span>
                </span>
                <span className="text-[11px] text-stone-500">Gửi khi khách submit biểu mẫu tư vấn</span>
              </div>

              {/* Subject Input */}
              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider text-charcoal-600 font-medium">
                  Tiêu Đề Thư (Email Subject) <span className="text-luxury-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.consultLeadEmailSubject}
                  onChange={(e) =>
                    setFormData({ ...formData, consultLeadEmailSubject: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              {/* Dynamic Placeholders Chips */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-charcoal-600">
                  <span className="font-medium flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-amber-600" />
                    <span>Thẻ biến số tự động (Click để chèn nhanh vào nội dung):</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { tag: '{customerName}', desc: 'Họ tên dâu rể' },
                    { tag: '{customerPhone}', desc: 'Số điện thoại' },
                    { tag: '{concept}', desc: 'Dịch vụ / Concept quan tâm' },
                    { tag: '{budget}', desc: 'Ngân sách dự kiến' },
                  ].map((item) => (
                    <button
                      key={item.tag}
                      type="button"
                      onClick={() => insertTag(item.tag, 'consultLeadEmailBody', leadTextareaRef)}
                      className="px-2.5 py-1 bg-white hover:bg-amber-50 border border-stone-300 hover:border-amber-300 text-stone-700 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                      title={`Bấm để chèn ${item.desc}`}
                    >
                      <span className="font-semibold text-amber-700">{item.tag}</span>
                      <span className="text-[10px] text-stone-400 font-sans">({item.desc})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Body Textarea */}
              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider text-charcoal-600 font-medium">
                  Nội Dung Thư (Email Body) <span className="text-luxury-600">*</span>
                </label>
                <textarea
                  ref={leadTextareaRef}
                  rows={8}
                  required
                  value={formData.consultLeadEmailBody}
                  onChange={(e) =>
                    setFormData({ ...formData, consultLeadEmailBody: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-xs text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans leading-relaxed"
                />
                <p className="text-[11px] text-stone-400">
                  Nội dung sẽ được tự động biên dịch và bọc trong khung template Luxury Minimalist trang nhã của PlusMoments.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: MẪU EMAIL MUA GÓI DỊCH VỤ (ORDERS) */}
          {activeTemplateTab === 'ORDER' && (
            <div className="p-5 bg-[#FAF8F5] border border-amber-900/15 rounded-2xl space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-charcoal-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-amber-700" />
                  <span>Email Xác Nhận Đặt Gói Cưới & Hướng Dẫn Thanh Toán VietQR</span>
                </span>
                <span className="text-[11px] text-stone-500">Gửi khi khách đặt mua gói từ popup chi tiết</span>
              </div>

              {/* Subject Input */}
              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider text-charcoal-600 font-medium">
                  Tiêu Đề Thư (Email Subject) <span className="text-luxury-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.packageOrderEmailSubject}
                  onChange={(e) =>
                    setFormData({ ...formData, packageOrderEmailSubject: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              {/* Dynamic Placeholders Chips */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-charcoal-600">
                  <span className="font-medium flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-amber-600" />
                    <span>Thẻ biến số tự động (Click để chèn nhanh vào nội dung):</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { tag: '{customerName}', desc: 'Họ tên dâu rể' },
                    { tag: '{customerPhone}', desc: 'Số điện thoại' },
                    { tag: '{packageName}', desc: 'Tên gói cưới' },
                    { tag: '{packagePrice}', desc: 'Giá trọn gói' },
                    { tag: '{orderCode}', desc: 'Mã đơn (PMxxxxx)' },
                  ].map((item) => (
                    <button
                      key={item.tag}
                      type="button"
                      onClick={() => insertTag(item.tag, 'packageOrderEmailBody', orderTextareaRef)}
                      className="px-2.5 py-1 bg-white hover:bg-amber-50 border border-stone-300 hover:border-amber-300 text-stone-700 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                      title={`Bấm để chèn ${item.desc}`}
                    >
                      <span className="font-semibold text-amber-700">{item.tag}</span>
                      <span className="text-[10px] text-stone-400 font-sans">({item.desc})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Body Textarea */}
              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider text-charcoal-600 font-medium">
                  Nội Dung Thư (Email Body) <span className="text-luxury-600">*</span>
                </label>
                <textarea
                  ref={orderTextareaRef}
                  rows={8}
                  required
                  value={formData.packageOrderEmailBody}
                  onChange={(e) =>
                    setFormData({ ...formData, packageOrderEmailBody: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-xs text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans leading-relaxed"
                />
                <p className="text-[11px] text-stone-400">
                  Email tự động sẽ hiển thị thông tin chuyển khoản VietQR chính xác và mã thanh toán duy nhất cho dâu rể.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* KHUNG THỬ NGHIỆM GỬI THƯ TRỰC TIẾP */}
        <div className="mt-6 pt-6 border-t border-[#E8E2D9] space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-[#1C1917] flex items-center gap-2">
              <span>🧪 Thử Nghiệm Gửi Thư Trực Tiếp</span>
              <span className="text-[11px] font-normal text-stone-500 font-sans hidden sm:inline">
                (Gửi thư mẫu kiểm tra bằng cấu hình đang nhập trên màn hình)
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <input
              type="email"
              placeholder="Nhập email nhận thử (vd: gnurt169@icloud.com, yourname@gmail.com)"
              value={testEmailRecipient}
              onChange={(e) => setTestEmailRecipient(e.target.value)}
              className="flex-1 w-full px-4 py-2.5 rounded-lg border border-[#D6D0C7] text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#8C7A6B] placeholder:text-stone-400 font-mono"
            />
            <button
              type="button"
              disabled={isTesting || !testEmailRecipient}
              onClick={handleSendTestMail}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#2E2824] hover:bg-[#1A1614] text-white text-sm font-medium rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Đang gửi...</span>
                </>
              ) : (
                <span>✈️ Gửi Thư Test Ngay</span>
              )}
            </button>
            <button
              type="button"
              disabled={isTesting}
              onClick={handleVerifyConnection}
              className="w-full sm:w-auto px-4 py-2.5 bg-white border border-[#D6D0C7] hover:bg-[#FAF8F5] text-[#2E2824] text-sm font-medium rounded-lg transition cursor-pointer shrink-0"
            >
              🔌 Kiểm Tra Cổng SMTP
            </button>
          </div>

          {/* Banner hiển thị kết quả kiểm tra trực quan */}
          {testResult && (
            <div
              className={`p-3.5 rounded-lg text-sm flex items-start gap-2 border transition-all ${
                testResult.success
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed font-medium">{testResult.message}</span>
            </div>
          )}
        </div>

        {/* NÚT LƯU CẤU HÌNH EMAIL (SYNC VÀO DATABASE & SEED) */}
        <div className="pt-3 border-t border-stone-100 flex justify-end">
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving || isTesting}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 active:scale-95 text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                <span>Đang Lưu & Đồng Bộ...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-amber-400" />
                <span>💾 Lưu Cấu Hình Email</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
