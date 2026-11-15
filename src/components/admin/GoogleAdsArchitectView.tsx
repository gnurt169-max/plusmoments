'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Target,
  Copy,
  Check,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Clock,
  Layers,
  Key,
  FileText,
  Sliders,
  DollarSign,
  Compass,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Pin,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import type { GoogleAdsPlan } from '@/lib/google-ads-architect';

interface PackageOption {
  id: string;
  name: string;
  price: number | string;
  category: string;
  slug: string;
}

export function GoogleAdsArchitectView() {
  const [plan, setPlan] = useState<GoogleAdsPlan | null>(null);
  const [packages, setPackages] = useState<PackageOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'campaign' | 'aimax' | 'keywords' | 'rsa' | 'assets'>('campaign');

  // Form controls
  const [campaignGoal, setCampaignGoal] = useState<string>('all_packages');
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [targetLocation, setTargetLocation] = useState<string>('TP. Hồ Chí Minh & lân cận (Bán kính 35km)');
  const [dailyBudget, setDailyBudget] = useState<string>('300.000đ - 500.000đ/ngày');

  // Load initial saved plan & package list
  useEffect(() => {
    fetch('/api/admin/ai/google-ads-plan')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (data.plan) {
            setPlan(data.plan);
            setCampaignGoal(data.plan.inputs?.campaignGoal || 'all_packages');
            setSelectedPackageId(data.plan.inputs?.selectedPackageId || '');
            setTargetLocation(data.plan.inputs?.targetLocation || 'TP. Hồ Chí Minh & lân cận (Bán kính 35km)');
            setDailyBudget(data.plan.inputs?.dailyBudget || '300.000đ - 500.000đ/ngày');
          }
          if (Array.isArray(data.packages)) {
            setPackages(data.packages);
            if (!selectedPackageId && data.packages[0]) {
              setSelectedPackageId(data.packages[0].id);
            }
          }
        }
      })
      .catch((err) => console.error('Failed to load Google Ads plan:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/admin/ai/google-ads-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignGoal,
          selectedPackageId: campaignGoal === 'specific_package' ? selectedPackageId : undefined,
          targetLocation,
          dailyBudget,
        }),
      });
      const data = await res.json();
      if (data.success && data.plan) {
        setPlan(data.plan);
        triggerCopyFeedback('all_plan_notification');
      } else {
        alert(data.error || 'Có lỗi xảy ra khi tạo kịch bản.');
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi kết nối khi tạo kịch bản.');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string, keyId: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    triggerCopyFeedback(keyId);
  };

  const triggerCopyFeedback = (keyId: string) => {
    setCopiedKey(keyId);
    setTimeout(() => {
      setCopiedKey((curr) => (curr === keyId ? null : curr));
    }, 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="w-8 h-8 text-amber-600 animate-spin" />
        <p className="text-xs uppercase tracking-widest text-stone-500 font-semibold">
          Đang nạp dữ liệu kiến trúc Google Ads...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. TOP HEADER & SUPER ADMIN BADGE */}
      <div className="bg-gradient-to-r from-[#1C1917] via-[#2A2420] to-[#1C1917] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-[#3E3630] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-mono font-semibold tracking-wider uppercase">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SUPER ADMIN EXCLUSIVE • TRUNGLNM</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-light text-[#FAF8F5]">
              Kiến Trúc Chiến Dịch Google Ads (AI)
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
              Trợ lý chiến lược tự động đồng bộ giá thật, ưu đãi và nội dung từ Database PlusMoments.
              Tạo cấu hình khớp 1-1 từng ô nhập liệu Google Ads Search &amp; AI Max mới nhất.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl text-xs uppercase tracking-wider font-semibold bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white shadow-lg shadow-amber-900/30 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-200" />
                  <span>Đang Phân Tích Web...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>AI Phân Tích &amp; Tạo Kịch Bản</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Lịch sử cập nhật */}
        {plan?.generatedAt && (
          <div className="mt-6 pt-4 border-t border-stone-800/80 flex flex-wrap items-center justify-between text-[11px] text-stone-400 gap-2">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>
                Bản kế hoạch gần nhất: {new Date(plan.generatedAt).toLocaleString('vi-VN')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-stone-300">
                Mục tiêu hiện hành: <strong className="text-amber-300">{plan.inputs?.campaignGoalLabel}</strong>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 2. BỘ ĐIỀU KHIỂN THAM SỐ CHIẾN DỊCH (CONTROLS PANEL) */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E8E2D9] shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-4">
          <div className="flex items-center gap-2 text-stone-900 font-serif text-lg font-light">
            <Sliders className="w-5 h-5 text-amber-700" />
            <span>Tùy Chỉnh Ngữ Cảnh &amp; Mục Tiêu Chiến Dịch</span>
          </div>
          <span className="text-[11px] text-stone-500 font-mono">Realtime Context Ingestion</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Mục tiêu chiến dịch */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider block">
              1. Mục Tiêu Chiến Dịch
            </label>
            <select
              value={campaignGoal}
              onChange={(e) => setCampaignGoal(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              <option value="all_packages">Bảng Giá Trọn Gói (Toàn Bộ Gói Cưới)</option>
              <option value="specific_package">Chạy Riêng 1 Gói Cụ Thể (CLASSIC/LUXURY...)</option>
              <option value="studio_concept">Chụp Ảnh Cưới Studio (Phong Cách Hàn Quốc)</option>
              <option value="wedding_journalism">Phóng Sự Ngày Cưới (Wedding Journalism)</option>
              <option value="pre_wedding_outdoor">Pre-Wedding Ngoại Cảnh (Đà Lạt / Biển)</option>
              <option value="brand_defense">Nhận Diện &amp; Bảo Vệ Thương Hiệu PlusMoments</option>
            </select>
          </div>

          {/* Chọn gói cụ thể (khi chọn specific_package) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider block">
              2. Gói Cưới Trọng Tâm
            </label>
            <select
              value={selectedPackageId}
              onChange={(e) => setSelectedPackageId(e.target.value)}
              disabled={campaignGoal !== 'specific_package'}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:opacity-50"
            >
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name} ({typeof pkg.price === 'number' ? new Intl.NumberFormat('vi-VN').format(pkg.price) : pkg.price}đ)
                </option>
              ))}
            </select>
          </div>

          {/* Vị trí địa lý */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider block">
              3. Vị Trí Nhắm Mục Tiêu
            </label>
            <input
              type="text"
              value={targetLocation}
              onChange={(e) => setTargetLocation(e.target.value)}
              placeholder="TP. Hồ Chí Minh & lân cận"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          {/* Ngân sách ngày */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider block">
              4. Ngân Sách Dự Kiến / Ngày
            </label>
            <input
              type="text"
              value={dailyBudget}
              onChange={(e) => setDailyBudget(e.target.value)}
              placeholder="300.000đ - 500.000đ/ngày"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>
        </div>
      </div>

      {/* 3. TABS NAVIGATION */}
      {plan && (
        <div className="flex items-center gap-2 border-b border-[#E8E2D9] overflow-x-auto no-scrollbar pb-2">
          {[
            { key: 'campaign', label: '1. Chiến Dịch & Ngân Sách', icon: Target },
            { key: 'aimax', label: '2. Nhóm Ads & AI Max Beta', icon: Compass },
            { key: 'keywords', label: '3. Từ Khóa & Phủ Định', icon: Key },
            { key: 'rsa', label: '4. Mẫu Quảng Cáo RSA (15 Tiêu Đề)', icon: FileText },
            { key: 'assets', label: '5. Tiện Ích Mở Rộng (Assets)', icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#1C1917] text-[#E5C799] shadow-sm'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-stone-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* 4. TAB CONTENTS */}
      {plan && (
        <div className="space-y-6">
          {/* TAB 1: CHIẾN DỊCH & NGÂN SÁCH */}
          {activeTab === 'campaign' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D9] shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-4">
                <div>
                  <h3 className="font-serif text-lg font-normal text-stone-900">
                    Cấu Hình Thiết Lập Chiến Dịch Cốt Lõi
                  </h3>
                  <p className="text-xs text-stone-500">
                    Ánh xạ trực tiếp vào bước Tạo chiến dịch mới trên Google Ads
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      JSON.stringify(plan.campaignSettings, null, 2),
                      'campaign_settings_all'
                    )
                  }
                  className="px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-100 flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedKey === 'campaign_settings_all' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>Sao Chép JSON Thiết Lập</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tên chiến dịch */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-500">
                      Tên Chiến Dịch Đề Xuất
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(plan.campaignSettings.campaignName, 'camp_name')
                      }
                      className="text-xs text-amber-800 hover:text-amber-900 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'camp_name' ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>Copy</span>
                    </button>
                  </div>
                  <p className="font-mono text-sm text-stone-900 font-bold">
                    {plan.campaignSettings.campaignName}
                  </p>
                </div>

                {/* Mục tiêu & Loại chiến dịch */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-500 block">
                    Mục Tiêu &amp; Loại Chiến Dịch
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 font-semibold text-xs">
                      {plan.campaignSettings.goal}
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-blue-100 text-blue-800 font-semibold text-xs">
                      {plan.campaignSettings.campaignType}
                    </span>
                  </div>
                </div>

                {/* Chiến lược giá thầu Tuần 1 vs Tuần 2+ */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2 md:col-span-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
                    <TrendingUp className="w-4 h-4 text-amber-700" />
                    <span>Lộ Trình Đấu Thầu Thông Minh (Bidding Strategy)</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                    <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-1">
                      <span className="font-bold text-amber-950 block">Giai đoạn 1 (Tuần 1 - 2):</span>
                      <p className="text-stone-700 leading-relaxed">
                        {plan.campaignSettings.biddingStrategyWeek1}
                      </p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-1">
                      <span className="font-bold text-amber-950 block">Giai đoạn 2 (Sau 15 - 30 leads):</span>
                      <p className="text-stone-700 leading-relaxed">
                        {plan.campaignSettings.biddingStrategyWeek2Plus}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Lịch chạy giờ vàng & Ngân sách */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-500 flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-rose-500" />
                      <span>Lịch Chạy Giờ Vàng Ngành Cưới (Ad Schedule)</span>
                    </span>
                  </div>
                  <p className="text-xs text-stone-800 leading-relaxed">
                    {plan.campaignSettings.goldenHoursSchedule}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NHÓM ADS & AI MAX RECOMMENDATIONS */}
          {activeTab === 'aimax' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D9] shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-4">
                <div>
                  <h3 className="font-serif text-lg font-normal text-stone-900">
                    Nhóm Quảng Cáo &amp; Chỉ Dẫn Bật/Tắt AI Max Beta
                  </h3>
                  <p className="text-xs text-stone-500">
                    Tránh đốt tiền vào các từ khóa rác ngoài ngành do tính năng AI tự động hóa quá đà của Google
                  </p>
                </div>
              </div>

              {/* URL & Mô tả sản phẩm */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-500">
                      URL Trang Đích (Final URL)
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(plan.adGroupAndAiMax.finalUrl, 'final_url')
                      }
                      className="text-xs text-amber-800 hover:text-amber-900 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'final_url' ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>Copy</span>
                    </button>
                  </div>
                  <a
                    href={plan.adGroupAndAiMax.finalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-xs text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <span>{plan.adGroupAndAiMax.finalUrl}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-500">
                      Đường Dẫn Hiển Thị (Display Path)
                    </span>
                  </div>
                  <p className="font-mono text-xs text-stone-800">
                    plusmoments.vn / <span className="font-bold text-amber-900">{plan.adGroupAndAiMax.displayPath1}</span> / <span className="font-bold text-amber-900">{plan.adGroupAndAiMax.displayPath2}</span>
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-500">
                      Mô Tả Sản Phẩm / Dịch Vụ Cho Google AI Quét (150-200 Ký Tự)
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(plan.adGroupAndAiMax.productDescription, 'product_desc')
                      }
                      className="text-xs text-amber-800 hover:text-amber-900 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'product_desc' ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>Copy Mô Tả</span>
                    </button>
                  </div>
                  <p className="text-xs text-stone-800 leading-relaxed font-sans bg-white p-3 rounded-xl border border-stone-200">
                    {plan.adGroupAndAiMax.productDescription}
                  </p>
                  <span className="text-[10px] text-stone-400 font-mono">
                    Độ dài: {plan.adGroupAndAiMax.productDescription.length}/200 ký tự
                  </span>
                </div>
              </div>

              {/* BẢNG KHUYẾN NGHỊ BẬT / TẮT AI MAX BETA */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-900 uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Ma Trận Quyết Định Bật / Tắt AI Max Beta (Tránh Đốt Tiền)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {Object.entries(plan.adGroupAndAiMax.aiMaxRecommendations).map(
                    ([key, rec]) => {
                      const isEnabled = rec.status === 'BẬT';
                      return (
                        <div
                          key={key}
                          className={`p-4 rounded-2xl border transition-all ${
                            isEnabled
                              ? 'bg-emerald-50/60 border-emerald-200'
                              : 'bg-rose-50/60 border-rose-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-stone-900">
                              {rec.action}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider ${
                                isEnabled
                                  ? 'bg-emerald-200 text-emerald-900'
                                  : 'bg-rose-200 text-rose-900'
                              }`}
                            >
                              {rec.status}
                            </span>
                          </div>
                          <p className="text-xs text-stone-600 leading-relaxed">
                            {rec.reason}
                          </p>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BỘ TỪ KHÓA & PHỦ ĐỊNH */}
          {activeTab === 'keywords' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D9] shadow-sm space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E2D9] pb-4">
                <div>
                  <h3 className="font-serif text-lg font-normal text-stone-900">
                    Bộ Từ Khóa 3 Kiểu Khớp &amp; Danh Sách Phủ Định
                  </h3>
                  <p className="text-xs text-stone-500">
                    Đã đóng gói sẵn dấu ngoặc vuông <code>[...]</code> và ngoặc kép <code>&quot;...&quot;</code> để dán thẳng vào Google Ads
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const allKeywords = [
                      ...plan.keywords.exactMatch,
                      ...plan.keywords.phraseMatch,
                    ].join('\n');
                    copyToClipboard(allKeywords, 'all_kw');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#2E2824] hover:bg-[#1A1614] text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  {copiedKey === 'all_kw' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-amber-300" />
                  )}
                  <span>Sao Chép Toàn Bộ Từ Khóa Chạy</span>
                </button>
              </div>

              {/* 3 NHÓM TỪ KHÓA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. ĐỐI SÁNH CHÍNH XÁC */}
                <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-amber-950 uppercase tracking-wider block">
                        Đối Sánh Chính Xác [{plan.keywords.exactMatch.length} từ khóa]
                      </span>
                      <span className="text-[10px] text-stone-500">Tỷ lệ chuyển đổi mua hàng cao nhất</span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(plan.keywords.exactMatch.join('\n'), 'exact_kw')
                      }
                      className="px-2.5 py-1 rounded bg-amber-200 hover:bg-amber-300 text-amber-900 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'exact_kw' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-amber-200/60 max-h-56 overflow-y-auto font-mono text-xs text-stone-800 space-y-1">
                    {plan.keywords.exactMatch.map((kw, i) => (
                      <div key={i} className="py-0.5 hover:text-amber-800">
                        {kw}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. ĐỐI SÁNH CỤM TỪ */}
                <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-stone-900 uppercase tracking-wider block">
                        Đối Sánh Cụm Từ [{plan.keywords.phraseMatch.length} từ khóa]
                      </span>
                      <span className="text-[10px] text-stone-500">Bao phủ lượng tìm kiếm tự nhiên của dâu rể</span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(plan.keywords.phraseMatch.join('\n'), 'phrase_kw')
                      }
                      className="px-2.5 py-1 rounded bg-stone-200 hover:bg-stone-300 text-stone-900 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'phrase_kw' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-stone-200 max-h-56 overflow-y-auto font-mono text-xs text-stone-800 space-y-1">
                    {plan.keywords.phraseMatch.map((kw, i) => (
                      <div key={i} className="py-0.5 hover:text-stone-950">
                        {kw}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. TỪ KHÓA PHỦ ĐỊNH (NEGATIVE KEYWORDS) */}
              <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-rose-950 uppercase tracking-wider flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Danh Sách Từ Khóa Phủ Định Bắt Buộc [{plan.keywords.negativeKeywords.length} từ khóa]</span>
                    </span>
                    <span className="text-[10px] text-stone-500">
                      Chặn ngay lập tức tìm kiếm miễn phí, học nghề, tải ảnh, giá rẻ 500k...
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(plan.keywords.negativeKeywords.join('\n'), 'neg_kw')
                    }
                    className="px-3 py-1.5 rounded-lg bg-rose-200 hover:bg-rose-300 text-rose-950 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedKey === 'neg_kw' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Sao Chép Tất Cả Từ Khóa Phủ Định</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 bg-white p-3.5 rounded-xl border border-rose-200">
                  {plan.keywords.negativeKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[11px] font-mono"
                    >
                      -{kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MẪU QUẢNG CÁO TÌM KIẾM THÍCH ỨNG (RSA) */}
          {activeTab === 'rsa' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D9] shadow-sm space-y-8">
              <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-4">
                <div>
                  <h3 className="font-serif text-lg font-normal text-stone-900">
                    Mẫu Quảng Cáo RSA (Responsive Search Ads)
                  </h3>
                  <p className="text-xs text-stone-500">
                    Đầy đủ 15 dòng tiêu đề (&le; 30 ký tự) và 4 dòng mô tả (&le; 90 ký tự) chuẩn hóa điểm chất lượng &quot;Rất Tốt&quot;
                  </p>
                </div>
              </div>

              {/* 15 TIÊU ĐỀ (HEADLINES) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                    15 Dòng Tiêu Đề (Headlines — Tối đa 30 Ký Tự)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const allHeadlines = plan.responsiveSearchAds.headlines
                        .map((h) => h.text)
                        .join('\n');
                      copyToClipboard(allHeadlines, 'all_headlines');
                    }}
                    className="text-xs text-amber-800 hover:text-amber-900 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'all_headlines' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>Copy 15 Dòng</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {plan.responsiveSearchAds.headlines.map((hl, i) => {
                    const isPinned1 = hl.pinned === 'PIN_POS_1';
                    const isPinned2 = hl.pinned === 'PIN_POS_2';
                    const isPinned3 = hl.pinned === 'PIN_POS_3';
                    const isOver = hl.length > 30;

                    return (
                      <div
                        key={i}
                        className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                          isOver
                            ? 'bg-rose-50 border-rose-300'
                            : 'bg-stone-50 border-stone-200 hover:border-amber-400'
                        }`}
                      >
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-stone-400 font-bold">
                              #{i + 1}
                            </span>
                            <span className="text-xs font-semibold text-stone-900 truncate">
                              {hl.text}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                                isOver
                                  ? 'bg-rose-200 text-rose-800'
                                  : 'bg-stone-200 text-stone-700'
                              }`}
                            >
                              {hl.length}/30 ký tự
                            </span>
                            {isPinned1 && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300">
                                <Pin className="w-2.5 h-2.5" />
                                <span>Ghim Vị Trí 1</span>
                              </span>
                            )}
                            {isPinned2 && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-900 border border-blue-300">
                                <Pin className="w-2.5 h-2.5" />
                                <span>Ghim Vị Trí 2</span>
                              </span>
                            )}
                            {isPinned3 && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-900 border border-purple-300">
                                <Pin className="w-2.5 h-2.5" />
                                <span>Ghim Vị Trí 3</span>
                              </span>
                            )}
                            {!isPinned1 && !isPinned2 && !isPinned3 && (
                              <span className="text-[9px] text-stone-400 italic">
                                Thả tự do
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => copyToClipboard(hl.text, `hl_${i}`)}
                          className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-200 cursor-pointer shrink-0"
                          title="Sao chép tiêu đề"
                        >
                          {copiedKey === `hl_${i}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4 DÒNG MÔ TẢ (DESCRIPTIONS) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                    4 Dòng Mô Tả (Descriptions — Tối đa 90 Ký Tự)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const allDesc = plan.responsiveSearchAds.descriptions
                        .map((d) => d.text)
                        .join('\n');
                      copyToClipboard(allDesc, 'all_desc');
                    }}
                    className="text-xs text-amber-800 hover:text-amber-900 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'all_desc' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>Copy 4 Dòng</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {plan.responsiveSearchAds.descriptions.map((desc, i) => {
                    const isPinned = Boolean(desc.pinned);
                    const isOver = desc.length > 90;

                    return (
                      <div
                        key={i}
                        className={`p-4 rounded-xl border space-y-2 transition-all ${
                          isOver
                            ? 'bg-rose-50 border-rose-300'
                            : 'bg-stone-50 border-stone-200 hover:border-amber-400'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-xs text-stone-900 leading-relaxed font-sans">
                            {desc.text}
                          </p>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(desc.text, `desc_${i}`)}
                            className="px-2.5 py-1 rounded bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0"
                          >
                            {copiedKey === `desc_${i}` ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>Copy</span>
                          </button>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-stone-500 font-mono">
                          <span
                            className={`px-1.5 py-0.2 rounded font-semibold ${
                              isOver ? 'bg-rose-200 text-rose-800' : 'bg-stone-200 text-stone-700'
                            }`}
                          >
                            {desc.length}/90 ký tự
                          </span>
                          {isPinned ? (
                            <span className="font-bold text-amber-900">
                              Ghim vị trí: {desc.pinned === 'PIN_POS_1' ? '1' : '2'}
                            </span>
                          ) : (
                            <span className="italic text-stone-400">Thả tự do</span>
                          )}
                          <span className="text-stone-400">• {desc.note}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: TIỆN ÍCH MỞ RỘNG (ASSETS) */}
          {activeTab === 'assets' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D9] shadow-sm space-y-8">
              <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-4">
                <div>
                  <h3 className="font-serif text-lg font-normal text-stone-900">
                    Thành Phần Tiện Ích Mở Rộng (Assets / Extensions)
                  </h3>
                  <p className="text-xs text-stone-500">
                    Gia tăng 15% - 25% tỷ lệ CTR với liên kết trang web, chú thích và cuộc gọi
                  </p>
                </div>
              </div>

              {/* 4 SITELINKS */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-stone-900 uppercase tracking-wider block">
                  4 Liên Kết Trang Web (Sitelinks)
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plan.assets.sitelinks.map((sl, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-amber-900">
                          {sl.title} ({sl.title.length}/25)
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            copyToClipboard(
                              `${sl.title}\n${sl.line1}\n${sl.line2}\n${sl.url}`,
                              `sl_${i}`
                            )
                          }
                          className="text-xs text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedKey === `sl_${i}` ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>Copy</span>
                        </button>
                      </div>
                      <div className="text-[11px] text-stone-600 space-y-0.5">
                        <p>Dòng 1: {sl.line1} ({sl.line1.length}/35)</p>
                        <p>Dòng 2: {sl.line2} ({sl.line2.length}/35)</p>
                        <p className="font-mono text-blue-600 truncate">{sl.url}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CHÚ THÍCH (CALLOUTS) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                    Chú Thích (Callouts — &le; 25 Ký Tự)
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(plan.assets.callouts.join('\n'), 'all_callouts')
                    }
                    className="text-xs text-amber-800 hover:text-amber-900 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'all_callouts' ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>Copy Tất Cả</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {plan.assets.callouts.map((co, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-950 border border-amber-200 text-xs font-medium"
                    >
                      ✓ {co}
                    </span>
                  ))}
                </div>
              </div>

              {/* ĐOẠN THÔNG TIN CẤU TRÚC & CUỘC GỌI */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                  <span className="text-xs font-bold text-stone-900 uppercase tracking-wider block">
                    Đoạn Thông Tin Có Cấu Trúc (Structured Snippets)
                  </span>
                  <p className="text-xs text-stone-600">
                    Loại tiêu đề: <strong className="text-stone-900">{plan.assets.structuredSnippets.header}</strong>
                  </p>
                  <p className="text-xs font-mono text-stone-800 bg-white p-2.5 rounded-lg border border-stone-200">
                    {plan.assets.structuredSnippets.values.join(', ')}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                  <span className="text-xs font-bold text-stone-900 uppercase tracking-wider block">
                    Thành Phần Cuộc Gọi (Call Asset)
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-base font-bold text-amber-900">
                      {plan.assets.callAsset.phone}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(plan.assets.callAsset.phone, 'call_phone')
                      }
                      className="text-xs text-amber-800 hover:text-amber-900 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'call_phone' ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>Copy</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    {plan.assets.callAsset.conversionTracking}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FLOATING SUCCESS TOAST */}
      {copiedKey && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1C1917] text-white px-5 py-3 rounded-2xl shadow-2xl border border-amber-500/40 flex items-center gap-2.5 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">
            Đã sao chép vào bộ nhớ tạm! Sẵn sàng dán sang Google Ads.
          </span>
        </div>
      )}
    </div>
  );
}
