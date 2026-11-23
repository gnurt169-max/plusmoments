'use client';

import React, { useState, useRef, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sparkles,
  Camera,
  Upload,
  Calendar,
  MapPin,
  Heart,
  QrCode,
  Music,
  Eye,
  CheckCircle2,
  Copy,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  X,
  Smartphone,
  AlertCircle,
  Trash2,
  ArrowRight,
} from 'lucide-react';
import {
  INVITATION_TEMPLATES,
  MUSIC_PRESETS,
  InvitationGalleryImage,
} from '@/lib/invitations/templates';
import { WeddingInvitationView } from '@/components/invitations/WeddingInvitationView';

export default function CreateWeddingInvitationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTemplate = searchParams.get('template') || 'timeless-ivory';

  // Step 1: Templates & Styling
  const [templateId, setTemplateId] = useState<string>(initialTemplate);
  const [themeColor, setThemeColor] = useState<string>(
    INVITATION_TEMPLATES[initialTemplate]?.defaultThemeColor || '#8C6D46'
  );
  const [musicPreset, setMusicPreset] = useState<string>('romantic-piano');

  // Step 2: Couple & Wedding Info
  const [groomName, setGroomName] = useState<string>('Minh Trung');
  const [brideName, setBrideName] = useState<string>('Thanh Thảo');
  const [groomParents, setGroomParents] = useState<string>('Ông: Lê Văn Minh\nBà: Nguyễn Thị Hoa');
  const [brideParents, setBrideParents] = useState<string>('Ông: Trần Văn Thành\nBà: Phạm Thị Mai');
  const [ceremonyDate, setCeremonyDate] = useState<string>('2026-12-20T11:00');
  const [ceremonyTimeText, setCeremonyTimeText] = useState<string>('11:00 — Chủ Nhật, 20.12.2026');
  const [venueName, setVenueName] = useState<string>('White Palace Hoàng Văn Thụ');
  const [venueAddress, setVenueAddress] = useState<string>('194 Hoàng Văn Thụ, Phường 9, Phú Nhuận, TP. Hồ Chí Minh');
  const [googleMapsUrl, setGoogleMapsUrl] = useState<string>('https://maps.app.goo.gl/PlusMomentsDemo');
  const [storyTitle, setStoryTitle] = useState<string>('Hành Trình Yêu Thương');
  const [storyText, setStoryText] = useState<string>(
    'Từ ánh nhìn đầu tiên vào một chiều thu Hà Nội cho đến lời hẹn ước trăm năm giữa ngàn thông Đà Lạt. Hạnh phúc trọn vẹn nhất là khi chúng mình được nắm tay nhau bước vào lễ đường.'
  );

  // Step 3: Images & Gallery
  const [coverImage, setCoverImage] = useState<string>('/uploads/albums/pre-wedding/phim-truong-da-lat-01.webp');
  const [galleryImages, setGalleryImages] = useState<InvitationGalleryImage[]>([
    {
      id: 'demo-1',
      url: '/uploads/albums/pre-wedding/phim-truong-da-lat-01.webp',
      width: 1200,
      height: 800,
      orientation: 'landscape',
      caption: 'Khoảnh khắc hoàng hôn ngập nắng',
    },
    {
      id: 'demo-2',
      url: '/uploads/albums/pre-wedding/phong-su-cuoi-hcm-01.webp',
      width: 900,
      height: 1200,
      orientation: 'portrait',
      caption: 'Nụ cười rạng rỡ của nàng dâu',
    },
  ]);

  // Step 4: Banking & Gift QR
  const [bankQrImage, setBankQrImage] = useState<string>('');
  const [bankInfoText, setBankInfoText] = useState<string>('Techcombank: 1903456789012\nChủ TK: LE MINH TRUNG\nNội dung: Mung cuoi Minh Trung & Thanh Thao');

  // Custom Slug & PIN
  const [customSlug, setCustomSlug] = useState<string>('');

  // UI States
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [previewKey, setPreviewKey] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdResult, setCreatedResult] = useState<{
    slug: string;
    editPasscode: string;
    url: string;
  } | null>(null);
  const [showMobilePreview, setShowMobilePreview] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const qrInputRef = useRef<HTMLInputElement | null>(null);

  // When template changes, sync default theme color
  const handleTemplateSelect = (id: string) => {
    setTemplateId(id);
    if (INVITATION_TEMPLATES[id]) {
      setThemeColor(INVITATION_TEMPLATES[id].defaultThemeColor);
    }
  };

  // Upload handler for Gallery & Cover
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isCoverOnly = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }

      const res = await fetch('/api/invitations/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!data.success) {
        alert(data.error || 'Lỗi khi tải ảnh lên');
        return;
      }

      if (isCoverOnly && data.image) {
        setCoverImage(data.image.url);
      } else if (data.images && data.images.length > 0) {
        if (!coverImage && data.images[0]) {
          setCoverImage(data.images[0].url);
        }
        setGalleryImages((prev) => [...prev, ...data.images]);
      }
    } catch (err: any) {
      alert('Không thể kết nối đến máy chủ upload: ' + err.message);
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  // Upload QR code image
  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/invitations/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.image) {
        setBankQrImage(data.image.url);
      } else {
        alert(data.error || 'Lỗi khi tải ảnh mã QR');
      }
    } catch (err: any) {
      alert('Lỗi: ' + err.message);
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  // Handle Publish Invitation
  const handleSubmit = async () => {
    if (!groomName.trim() || !brideName.trim()) {
      alert('Vui lòng nhập đầy đủ tên Cô Dâu và Chú Rể');
      setCurrentStep(2);
      return;
    }

    if (!venueName.trim() || !venueAddress.trim()) {
      alert('Vui lòng nhập địa điểm tổ chức hôn lễ');
      setCurrentStep(2);
      return;
    }

    if (!coverImage) {
      alert('Vui lòng chọn hoặc tải lên ảnh bìa thiệp cưới');
      setCurrentStep(3);
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        templateId,
        themeColor,
        musicPreset,
        groomName,
        brideName,
        groomParents,
        brideParents,
        ceremonyDate,
        ceremonyTimeText,
        venueName,
        venueAddress,
        googleMapsUrl,
        storyTitle,
        storyText,
        coverImage,
        galleryImages,
        bankQrImage,
        bankInfoText,
        customSlug,
      };

      const res = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (result.success) {
        setCreatedResult({
          slug: result.slug,
          editPasscode: result.editPasscode,
          url: result.url,
        });
      } else {
        alert(result.error || 'Có lỗi xảy ra khi tạo thiệp cưới');
      }
    } catch (err: any) {
      alert('Không thể kết nối đến máy chủ: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Construct Live Preview Data Object
  const livePreviewData = {
    slug: customSlug || 'preview-wedding',
    templateId,
    themeColor,
    groomName: groomName || 'Chú Rể',
    brideName: brideName || 'Cô Dâu',
    groomParents,
    brideParents,
    ceremonyDate,
    ceremonyTimeText,
    venueName: venueName || 'Địa điểm tổ chức hôn lễ',
    venueAddress: venueAddress || 'Địa chỉ nhà hàng',
    googleMapsUrl,
    storyTitle,
    storyText,
    coverImage,
    galleryImages,
    musicPreset,
    bankQrImage,
    bankInfoText,
    rsvps: [
      {
        id: 'mock-1',
        guestName: 'Nguyễn Văn An',
        attendance: 'ATTENDING',
        guestCount: 2,
        side: 'GROOM',
        wishMessage: 'Chúc hai em trăm năm hạnh phúc, sớm đón quý tử!',
        createdAt: new Date().toISOString(),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] pt-24 pb-20 text-stone-900 selection:bg-[#8C6D46] selection:text-white">
      {/* SUCCESS MODAL / SCREEN */}
      {createdResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-lg bg-white rounded-3xl p-8 text-center shadow-2xl border border-stone-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-serif text-stone-900 mb-2">
              Thiệp Cưới Đã Xuất Bản Thành Công!
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mb-6 leading-relaxed">
              Thiệp cưới điện tử của hai bạn đã sẵn sàng để gửi đến người thân và bạn bè. 
              Vui lòng lưu lại <strong>Mã PIN 6 số</strong> để chỉnh sửa thiệp sau này.
            </p>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-left space-y-3 mb-6">
              <div>
                <span className="text-[11px] font-mono text-stone-500 uppercase tracking-wider block mb-1">
                  Đường dẫn thiệp cưới:
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}${createdResult.url}`}
                    className="flex-1 text-xs font-mono bg-white p-2.5 rounded-xl border border-stone-300 text-stone-800 select-all"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        `${typeof window !== 'undefined' ? window.location.origin : ''}${createdResult.url}`
                      )
                    }
                    className="h-10 px-3.5 rounded-xl bg-[#8C6D46] hover:bg-[#725735] text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copySuccess ? 'Đã chép' : 'Chép'}</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono text-stone-500 uppercase tracking-wider block">
                    Mã PIN chỉnh sửa thiệp:
                  </span>
                  <span className="font-mono text-lg font-bold text-[#8C6D46] tracking-widest">
                    {createdResult.editPasscode}
                  </span>
                </div>
                <span className="text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                  Lưu lại mã này
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Link
                href={createdResult.url}
                target="_blank"
                className="w-full sm:flex-1 h-12 rounded-xl bg-[#8C6D46] hover:bg-[#725735] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Xem Thiệp Cưới Ngay</span>
                <ExternalLink className="w-4 h-4" />
              </Link>
              <Link
                href="/thiep-cuoi"
                className="w-full sm:w-auto h-12 px-6 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-medium flex items-center justify-center"
              >
                Quay Về Trang Chủ
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/80 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-[#8C6D46] uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Trình Thiết Kế Thiệp Cưới Trực Tiếp</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif text-stone-900">
              Tạo Thiệp Cưới Sang Trọng Của Bạn
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowMobilePreview(!showMobilePreview)}
              className="lg:hidden h-10 px-4 rounded-xl border border-stone-300 bg-white text-stone-800 text-xs font-medium flex items-center gap-2 shadow-2xs"
            >
              <Smartphone className="w-4 h-4 text-[#8C6D46]" />
              <span>{showMobilePreview ? 'Đóng Xem Trước' : 'Xem Trước Thiệp'}</span>
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || isUploading}
              className="h-10 px-6 rounded-xl bg-[#8C6D46] hover:bg-[#725735] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>{isSubmitting ? 'Đang Xuất Bản...' : 'Xuất Bản Thiệp Ngay'}</span>
            </button>
          </div>
        </div>

        {/* STEP PROGRESS BAR */}
        <div className="flex items-center justify-between max-w-2xl mt-4">
          {[
            { step: 1, label: '1. Mẫu & Màu Sắc' },
            { step: 2, label: '2. Thông Tin Cưới' },
            { step: 3, label: '3. Ảnh Cưới' },
            { step: 4, label: '4. Mừng Cưới & Xuất Bản' },
          ].map((s) => (
            <button
              key={s.step}
              type="button"
              onClick={() => setCurrentStep(s.step)}
              className={`text-xs font-medium tracking-wide py-1.5 border-b-2 transition-colors ${
                currentStep === s.step
                  ? 'border-[#8C6D46] text-[#8C6D46] font-semibold'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN TWO-COLUMN WORKSPACE (Desktop Left Controls, Right Live Preview Phone) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ========================================================= */}
          {/* LEFT COLUMN: CUSTOMIZATION STEPS (col-span-7) */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs">
            {/* STEP 1: TEMPLATE & COLORS */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-serif text-stone-900 mb-1">
                    Bước 1: Chọn Mẫu Thiết Kế & Bảng Màu
                  </h3>
                  <p className="text-xs text-stone-500">
                    Chọn phong cách thiết kế định hình cá tính cho ngày trọng đại.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {Object.values(INVITATION_TEMPLATES).map((tpl) => (
                    <div
                      key={tpl.id}
                      onClick={() => handleTemplateSelect(tpl.id)}
                      className={`cursor-pointer p-4 rounded-2xl border-2 transition-all ${
                        templateId === tpl.id
                          ? 'border-[#8C6D46] bg-[#8C6D46]/5 shadow-xs'
                          : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-serif font-bold text-stone-900">
                          {tpl.name}
                        </span>
                        {templateId === tpl.id && (
                          <CheckCircle2 className="w-4 h-4 text-[#8C6D46]" />
                        )}
                      </div>
                      <div className="text-[11px] text-stone-500 line-clamp-2">
                        {tpl.subtitle}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Color Accents */}
                <div className="pt-4 border-t border-stone-100">
                  <label className="block text-xs font-medium text-stone-700 mb-2">
                    Màu Sắc Điểm Nhấn (Accent Color)
                  </label>
                  <div className="flex items-center gap-3">
                    {INVITATION_TEMPLATES[templateId]?.accentColors.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setThemeColor(c.hex)}
                        className={`w-9 h-9 rounded-full border-2 transition-transform ${
                          themeColor === c.hex
                            ? 'scale-110 border-stone-900 shadow-sm'
                            : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>

                {/* Music Preset */}
                <div className="pt-4 border-t border-stone-100">
                  <label className="block text-xs font-medium text-stone-700 mb-2 flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-[#8C6D46]" />
                    <span>Nhạc Nền Hôn Lễ Tự Động</span>
                  </label>
                  <select
                    value={musicPreset}
                    onChange={(e) => setMusicPreset(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-stone-300 text-stone-800 text-xs focus:ring-2 focus:ring-[#8C6D46] focus:outline-none bg-white"
                  >
                    {MUSIC_PRESETS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="h-11 px-6 rounded-xl bg-[#8C6D46] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2"
                  >
                    <span>Tiếp Tục: Điền Thông Tin</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: WEDDING INFORMATION */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-serif text-stone-900 mb-1">
                    Bước 2: Thông Tin Lễ Cưới & Gia Đình
                  </h3>
                  <p className="text-xs text-stone-500">
                    Nhập họ tên Cô Dâu, Chú Rể, thông tin hai họ và địa điểm tiệc cưới.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Họ Tên Chú Rể <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={groomName}
                      onChange={(e) => setGroomName(e.target.value)}
                      placeholder="Minh Trung"
                      className="w-full h-11 px-3.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-[#8C6D46] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Họ Tên Cô Dâu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={brideName}
                      onChange={(e) => setBrideName(e.target.value)}
                      placeholder="Thanh Thảo"
                      className="w-full h-11 px-3.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-[#8C6D46] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Thân Sinh Nhà Trai
                    </label>
                    <textarea
                      rows={2}
                      value={groomParents}
                      onChange={(e) => setGroomParents(e.target.value)}
                      placeholder="Ông: ...&#10;Bà: ..."
                      className="w-full p-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#8C6D46] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Thân Sinh Nhà Gái
                    </label>
                    <textarea
                      rows={2}
                      value={brideParents}
                      onChange={(e) => setBrideParents(e.target.value)}
                      placeholder="Ông: ...&#10;Bà: ..."
                      className="w-full p-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#8C6D46] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Ngày Giờ Hôn Lễ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={ceremonyDate}
                      onChange={(e) => setCeremonyDate(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#8C6D46] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Dòng Hiển Thị Thời Gian (Đẹp Mắt)
                    </label>
                    <input
                      type="text"
                      value={ceremonyTimeText}
                      onChange={(e) => setCeremonyTimeText(e.target.value)}
                      placeholder="11:00 — Chủ Nhật, 20.12.2026"
                      className="w-full h-11 px-3.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#8C6D46] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Tên Nhà Hàng / Địa Điểm <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={venueName}
                      onChange={(e) => setVenueName(e.target.value)}
                      placeholder="Trung Tâm Tiệc Cưới White Palace"
                      className="w-full h-11 px-3.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#8C6D46] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Link Google Maps (Chỉ Đường 1 Chạm)
                    </label>
                    <input
                      type="url"
                      value={googleMapsUrl}
                      onChange={(e) => setGoogleMapsUrl(e.target.value)}
                      placeholder="https://maps.app.goo.gl/..."
                      className="w-full h-11 px-3.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#8C6D46] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Địa Chỉ Chi Tiết Nhà Hàng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={venueAddress}
                    onChange={(e) => setVenueAddress(e.target.value)}
                    placeholder="194 Hoàng Văn Thụ, Phường 9, Phú Nhuận, TP.HCM"
                    className="w-full h-11 px-3.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#8C6D46] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Lời Ngỏ / Câu Chuyện Tình Yêu (Tùy chọn)
                  </label>
                  <textarea
                    rows={3}
                    value={storyText}
                    onChange={(e) => setStoryText(e.target.value)}
                    placeholder="Viết vài dòng chia sẻ ngọt ngào gửi gắm đến khách mời..."
                    className="w-full p-3 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#8C6D46] focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="flex justify-between pt-4 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="h-11 px-5 rounded-xl border border-stone-300 text-stone-700 text-xs font-medium flex items-center gap-1.5"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Quay Lại</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="h-11 px-6 rounded-xl bg-[#8C6D46] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2"
                  >
                    <span>Tiếp Tục: Tải Ảnh Cưới</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: WEDDING PHOTOS */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-serif text-stone-900 mb-1">
                    Bước 3: Tải Ảnh Cưới & Sắp Xếp Bộ Sưu Tập
                  </h3>
                  <p className="text-xs text-stone-500">
                    Tải lên tối đa 12 ảnh cưới đẹp nhất. Hệ thống tự động nén WebP giữ nguyên tỷ lệ dọc/ngang không vỡ nét.
                  </p>
                </div>

                {/* Upload Button */}
                <div className="p-6 rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50/70 text-center">
                  <Camera className="w-8 h-8 text-[#8C6D46] mx-auto mb-2" />
                  <div className="text-xs font-medium text-stone-800">
                    Kéo thả hoặc bấm để tải ảnh cưới lên
                  </div>
                  <div className="text-[11px] text-stone-500 mt-1 mb-4">
                    Hỗ trợ JPG, PNG, WebP (Tối đa 15MB/ảnh, tự động nén WebP 85%)
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, false)}
                    className="hidden"
                  />

                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="h-10 px-5 rounded-xl bg-[#8C6D46] hover:bg-[#725735] text-white text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isUploading ? 'Đang Xử Lý & Nén Ảnh...' : 'Tải Ảnh Cưới Lên'}</span>
                  </button>
                </div>

                {/* Gallery List Preview */}
                <div>
                  <div className="text-xs font-semibold text-stone-800 uppercase tracking-wider mb-3">
                    Ảnh Đã Chọn ({galleryImages.length})
                  </div>

                  {galleryImages.length === 0 ? (
                    <div className="text-center py-8 text-xs text-stone-400">
                      Chưa có ảnh nào được thêm vào thiệp.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {galleryImages.map((img, index) => (
                        <div
                          key={img.id || index}
                          className="relative group rounded-xl overflow-hidden border border-stone-200 bg-stone-100 aspect-square"
                        >
                          <img
                            src={img.url}
                            alt=""
                            className="w-full h-full object-cover"
                          />

                          {/* Cover badge */}
                          {coverImage === img.url && (
                            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#8C6D46] text-white text-[10px] font-semibold tracking-wider uppercase shadow-xs">
                              Ảnh Bìa
                            </span>
                          )}

                          {/* Orientation badge */}
                          <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] uppercase">
                            {img.orientation === 'portrait' ? 'Khung Dọc' : 'Khung Ngang'}
                          </span>

                          {/* Hover Actions */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                            <button
                              type="button"
                              onClick={() => setCoverImage(img.url)}
                              className="text-[10px] font-medium px-2 py-1 rounded bg-white text-stone-800 shadow-xs hover:bg-stone-100"
                            >
                              Đặt Làm Bìa
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setGalleryImages(galleryImages.filter((_, i) => i !== index))
                              }
                              className="text-[10px] font-medium px-2 py-1 rounded bg-red-600 text-white shadow-xs hover:bg-red-700 flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Xóa</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-4 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="h-11 px-5 rounded-xl border border-stone-300 text-stone-700 text-xs font-medium flex items-center gap-1.5"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Quay Lại</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="h-11 px-6 rounded-xl bg-[#8C6D46] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2"
                  >
                    <span>Tiếp Tục: Mừng Cưới & Xuất Bản</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: BANK QR & PUBLISH */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-serif text-stone-900 mb-1">
                    Bước 4: Hộp Mừng Cưới & Tùy Chỉnh Đường Link
                  </h3>
                  <p className="text-xs text-stone-500">
                    Tùy chọn tải ảnh mã QR mừng cưới và đặt tên đường link riêng cho thiệp cưới.
                  </p>
                </div>

                {/* QR Code Upload */}
                <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200">
                  <label className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-[#8C6D46]" />
                    <span>Ảnh Mã QR Ngân Hàng Mừng Cưới</span>
                  </label>

                  <div className="flex items-center gap-4">
                    {bankQrImage ? (
                      <div className="w-24 h-24 rounded-xl border border-stone-300 overflow-hidden bg-white p-1 shrink-0 relative">
                        <img
                          src={bankQrImage}
                          alt="QR Code"
                          className="w-full h-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => setBankQrImage('')}
                          className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full shadow-xs"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-xl border-2 border-dashed border-stone-300 flex items-center justify-center text-stone-400 shrink-0">
                        <QrCode className="w-8 h-8" />
                      </div>
                    )}

                    <div className="space-y-2">
                      <input
                        ref={qrInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleQrUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => qrInputRef.current?.click()}
                        className="h-9 px-4 rounded-xl bg-white border border-stone-300 text-stone-700 text-xs font-medium hover:bg-stone-50 transition-colors"
                      >
                        {bankQrImage ? 'Thay Đổi Ảnh QR' : 'Tải Ảnh Mã QR'}
                      </button>
                      <div className="text-[11px] text-stone-500">
                        Chụp ảnh mã QR VietQR từ app ngân hàng của bạn
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Thông Tin Số Tài Khoản / Lời Nhắn
                    </label>
                    <textarea
                      rows={2}
                      value={bankInfoText}
                      onChange={(e) => setBankInfoText(e.target.value)}
                      placeholder="Ngân hàng: ...&#10;Số tài khoản: ...&#10;Chủ TK: ..."
                      className="w-full p-2.5 rounded-xl border border-stone-300 text-xs font-mono focus:ring-2 focus:ring-[#8C6D46] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Custom Slug */}
                <div>
                  <label className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-1">
                    Đường Dẫn Riêng Cho Thiệp Cưới (Tùy chọn)
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-stone-500">plusmoments.vn/thiep-cuoi/</span>
                    <input
                      type="text"
                      value={customSlug}
                      onChange={(e) => setCustomSlug(e.target.value)}
                      placeholder="minh-trung-thanh-thao"
                      className="flex-1 h-11 px-3.5 rounded-xl border border-stone-300 text-xs font-mono focus:ring-2 focus:ring-[#8C6D46] focus:outline-none"
                    />
                  </div>
                  <div className="text-[11px] text-stone-500 mt-1">
                    Để trống hệ thống sẽ tự động tạo từ tên Chú Rể và Cô Dâu.
                  </div>
                </div>

                {/* Final Publish Banner */}
                <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                  <div className="font-semibold mb-1 flex items-center gap-1.5 text-amber-800">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Lưu Ý Khi Xuất Bản Thiệp Cưới</span>
                  </div>
                  Sau khi bấm xuất bản, bạn sẽ nhận được đường link thiệp chính thức kèm <strong>Mã PIN 6 số</strong>. Bạn có thể gửi link cho khách mời ngay lập tức và dùng mã PIN để quay lại cập nhật thiệp bất cứ lúc nào.
                </div>

                <div className="flex justify-between pt-4 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="h-11 px-5 rounded-xl border border-stone-300 text-stone-700 text-xs font-medium flex items-center gap-1.5"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Quay Lại</span>
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting || isUploading}
                    onClick={handleSubmit}
                    className="h-12 px-8 rounded-xl bg-[#8C6D46] hover:bg-[#725735] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4 text-amber-200" />
                    <span>{isSubmitting ? 'Đang Xuất Bản...' : 'Hoàn Tất & Xuất Bản Thiệp'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: LIVE PHONE PREVIEW (col-span-5) */}
          {/* ========================================================= */}
          <div className="hidden lg:block lg:col-span-5 sticky top-28">
            <div className="flex items-center justify-between mb-3 px-2">
              <span className="text-[11px] font-mono text-stone-500 uppercase tracking-widest flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-[#8C6D46]" />
                <span>Live Preview</span>
              </span>
              <button
                type="button"
                onClick={() => setPreviewKey((prev) => prev + 1)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-[#8C6D46] text-[11px] font-medium transition-colors cursor-pointer"
                title="Khởi động lại hiệu ứng mở phong bì 3D"
              >
                <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                <span>Xem hiệu ứng mở phong bì</span>
              </button>
            </div>

            {/* Smartphone Mockup Frame */}
            <div className="w-[380px] h-[780px] mx-auto rounded-[48px] p-3.5 bg-stone-900 shadow-2xl border-4 border-stone-800 relative flex flex-col">
              {/* Dynamic Island / Speaker Notch */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-30" />

              {/* Screen Viewport with Scroll */}
              <div className="w-full h-full rounded-[36px] overflow-y-auto overflow-x-hidden bg-white relative no-scrollbar">
                <WeddingInvitationView key={previewKey} data={livePreviewData} isPreview={true} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE FULL-SCREEN PREVIEW MODAL */}
      {showMobilePreview && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col">
          <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider">Xem Trước Thiệp Cưới</span>
              <button
                type="button"
                onClick={() => setPreviewKey((prev) => prev + 1)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-200 text-[11px]"
              >
                <Sparkles className="w-3 h-3" />
                <span>Thử mở phong bì</span>
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowMobilePreview(false)}
              className="p-1 rounded-full bg-stone-800 text-stone-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <WeddingInvitationView key={previewKey} data={livePreviewData} isPreview={true} />
          </div>
        </div>
      )}
    </div>
  );
}
