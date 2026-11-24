'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Sparkles,
  Camera,
  Upload,
  Calendar,
  MapPin,
  Heart,
  QrCode,
  Music,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  X,
  Smartphone,
  AlertCircle,
  Trash2,
  ArrowRight,
  KeyRound,
  Loader2,
  Save,
  Check,
} from 'lucide-react';
import {
  INVITATION_TEMPLATES,
  MUSIC_PRESETS,
  InvitationGalleryImage,
} from '@/lib/invitations/templates';
import { WeddingInvitationView } from '@/components/invitations/WeddingInvitationView';

export default function EditWeddingInvitationPage() {
  const router = useRouter();
  const params = useParams();
  const slug = (typeof params?.slug === 'string' ? params.slug : '') as string;

  // PIN & Auth State
  const [pin, setPin] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [isVerifyingPin, setIsVerifyingPin] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);

  // Form Steps & UI
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');
  const [previewKey, setPreviewKey] = useState<number>(0);
  const [showMobilePreview, setShowMobilePreview] = useState<boolean>(false);

  // Invitation Form Data States
  const [templateId, setTemplateId] = useState<string>('timeless-ivory');
  const [themeColor, setThemeColor] = useState<string>('#8C6D46');
  const [musicPreset, setMusicPreset] = useState<string>('romantic-piano');
  const [groomName, setGroomName] = useState<string>('');
  const [brideName, setBrideName] = useState<string>('');
  const [groomParents, setGroomParents] = useState<string>('');
  const [brideParents, setBrideParents] = useState<string>('');
  const [groomImage, setGroomImage] = useState<string>('');
  const [brideImage, setBrideImage] = useState<string>('');
  const [groomBio, setGroomBio] = useState<string>('');
  const [brideBio, setBrideBio] = useState<string>('');
  const [ceremonyDate, setCeremonyDate] = useState<string>('');
  const [ceremonyTimeText, setCeremonyTimeText] = useState<string>('');
  const [venueName, setVenueName] = useState<string>('');
  const [venueAddress, setVenueAddress] = useState<string>('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState<string>('');
  const [storyTitle, setStoryTitle] = useState<string>('');
  const [storyText, setStoryText] = useState<string>('');
  const [coverImage, setCoverImage] = useState<string>('');
  const [galleryImages, setGalleryImages] = useState<InvitationGalleryImage[]>([]);
  const [bankQrImage, setBankQrImage] = useState<string>('');
  const [bankInfoText, setBankInfoText] = useState<string>('');
  const [isPublished, setIsPublished] = useState<boolean>(true);

  // 1. Check SessionStorage for PIN on mount
  useEffect(() => {
    if (!slug) return;

    const storedPin = sessionStorage.getItem(`invitation_pin_${slug}`);
    if (storedPin) {
      setPin(storedPin);
      verifyPinAndLoad(storedPin);
    } else {
      setInitialLoading(false);
    }
  }, [slug]);

  const verifyPinAndLoad = async (pinToVerify: string) => {
    try {
      setIsVerifyingPin(true);
      setPinError('');

      const res = await fetch(`/api/invitations/${slug}/verify-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinToVerify }),
      });

      const data = await res.json();
      if (data.success && data.valid && data.invitation) {
        const inv = data.invitation;
        setTemplateId(inv.templateId || 'timeless-ivory');
        setThemeColor(inv.themeColor || '#8C6D46');
        setMusicPreset(inv.musicPreset || 'romantic-piano');
        setGroomName(inv.groomName || '');
        setBrideName(inv.brideName || '');
        setGroomParents(inv.groomParents || '');
        setBrideParents(inv.brideParents || '');
        setGroomImage(inv.groomImage || '');
        setBrideImage(inv.brideImage || '');
        setGroomBio(inv.groomBio || '');
        setBrideBio(inv.brideBio || '');
        setCeremonyDate(
          inv.ceremonyDate
            ? new Date(inv.ceremonyDate).toISOString().slice(0, 16)
            : ''
        );
        setCeremonyTimeText(inv.ceremonyTimeText || '');
        setVenueName(inv.venueName || '');
        setVenueAddress(inv.venueAddress || '');
        setGoogleMapsUrl(inv.googleMapsUrl || '');
        setStoryTitle(inv.storyTitle || '');
        setStoryText(inv.storyText || '');
        setCoverImage(inv.coverImage || '');
        setGalleryImages(Array.isArray(inv.galleryImages) ? inv.galleryImages : []);
        setBankQrImage(inv.bankQrImage || '');
        setBankInfoText(inv.bankInfoText || '');
        setIsPublished(inv.isPublished !== false);

        setPin(pinToVerify);
        sessionStorage.setItem(`invitation_pin_${slug}`, pinToVerify);
        setIsAuthenticated(true);
      } else {
        setPinError(data.error || 'Mã PIN 6 số không chính xác. Vui lòng thử lại!');
        sessionStorage.removeItem(`invitation_pin_${slug}`);
      }
    } catch (err: any) {
      setPinError('Lỗi kết nối máy chủ: ' + err.message);
    } finally {
      setIsVerifyingPin(false);
      setInitialLoading(false);
    }
  };

  const handleManualPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) return;
    verifyPinAndLoad(pinInput.trim());
  };

  // Upload Cover Image directly into structured folder /uploads/invitations/[slug]/
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('slug', slug);

      const res = await fetch('/api/invitations/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.image) {
        setCoverImage(data.image.url);
      } else {
        alert(data.error || 'Lỗi khi tải ảnh bìa');
      }
    } catch (err: any) {
      alert('Lỗi: ' + err.message);
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  // Upload Multiple Gallery Images into structured folder /uploads/invitations/[slug]/
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append('files', file));
      formData.append('slug', slug);

      const res = await fetch('/api/invitations/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.images)) {
        setGalleryImages((prev) => [...prev, ...data.images]);
      } else {
        alert(data.error || 'Lỗi khi tải ảnh gallery');
      }
    } catch (err: any) {
      alert('Lỗi: ' + err.message);
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleRemoveGalleryImage = (idxToRemove: number) => {
    setGalleryImages((prev) => prev.filter((_, idx) => idx !== idxToRemove));
  };

  // Upload Bank QR Code image
  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('slug', slug);

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

  // Save changes to invitation via PATCH /api/invitations/[slug]
  const handleSaveChanges = async () => {
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
      setIsSaving(true);
      setSaveSuccessMsg('');

      const payload = {
        passcode: pin,
        templateId,
        themeColor,
        musicPreset,
        groomName,
        brideName,
        groomParents,
        brideParents,
        groomImage,
        brideImage,
        groomBio,
        brideBio,
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
        isPublished,
      };

      const res = await fetch(`/api/invitations/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setSaveSuccessMsg('Đã lưu mọi thay đổi cho thiệp cưới thành công!');
        setPreviewKey((prev) => prev + 1);
        setTimeout(() => setSaveSuccessMsg(''), 4000);
      } else {
        alert(data.error || 'Lỗi khi lưu thay đổi thiệp');
      }
    } catch (err: any) {
      alert('Lỗi: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Real-time preview data object
  const livePreviewData = {
    slug,
    templateId,
    themeColor,
    musicPreset,
    groomName: groomName || 'Tên Chú Rể',
    brideName: brideName || 'Tên Cô Dâu',
    groomParents,
    brideParents,
    groomImage,
    brideImage,
    groomBio,
    brideBio,
    ceremonyDate: ceremonyDate || new Date().toISOString(),
    ceremonyTimeText: ceremonyTimeText || '11:00 — Chủ Nhật, 20.12.2026',
    venueName: venueName || 'White Palace',
    venueAddress: venueAddress || '194 Hoàng Văn Thụ, TP.HCM',
    googleMapsUrl,
    storyTitle,
    storyText,
    coverImage,
    galleryImages,
    bankQrImage,
    bankInfoText,
  };

  // Screen 1: Loading
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] pt-32 pb-24 flex items-center justify-center">
        <div className="text-center space-y-2">
          <Loader2 className="w-8 h-8 animate-spin text-[#8C6D46] mx-auto" />
          <p className="text-xs text-stone-500 font-mono">Đang kiểm tra quyền truy cập thiệp...</p>
        </div>
      </div>
    );
  }

  // Screen 2: PIN Unlock Form (if not authenticated)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] pt-32 pb-24 px-4 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-3xl border border-stone-200 shadow-xl p-6 sm:p-8 space-y-5">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-[#8C6D46] mx-auto flex items-center justify-center">
              <KeyRound className="w-7 h-7" />
            </div>
            <h1 className="font-serif text-2xl font-normal text-stone-900">
              Xác Thực Mã PIN Chỉnh Sửa
            </h1>
            <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
              Thiệp cưới <strong>{slug}</strong> được bảo vệ bằng mã PIN 6 số. Vui lòng nhập mã PIN để vào trình chỉnh sửa.
            </p>
          </div>

          {pinError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-snug">{pinError}</span>
            </div>
          )}

          <form onSubmit={handleManualPinSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1 text-center">
                Mã PIN Bảo Mật (6 Chữ Số)
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                required
                autoFocus
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                placeholder="••••••"
                className="w-full h-12 px-3 rounded-2xl border border-stone-300 text-stone-900 text-2xl tracking-[0.4em] text-center font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
              />
            </div>

            <button
              type="submit"
              disabled={isVerifyingPin || pinInput.length < 4}
              className="w-full h-12 rounded-xl bg-[#8C6D46] hover:bg-[#725735] text-white font-semibold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isVerifyingPin ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang Xác Thực...</span>
                </>
              ) : (
                <>
                  <span>Mở Trình Chỉnh Sửa</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center border-t border-stone-100">
            <Link
              href={`/thiep-cuoi/${slug}`}
              className="text-xs text-stone-500 hover:text-stone-800 transition-colors"
            >
              &larr; Xem thiệp cưới không chỉnh sửa
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Screen 3: Full Split-Screen Editor Portal
  return (
    <div className="min-h-screen bg-[#FAF8F5] pt-28 pb-20 text-stone-900 selection:bg-[#8C6D46] selection:text-white">
      {/* Toast Notification */}
      {saveSuccessMsg && (
        <div className="fixed bottom-6 left-6 z-50 px-4 py-3 rounded-2xl bg-emerald-900 text-emerald-100 text-xs font-medium shadow-2xl border border-emerald-700 animate-slide-up flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/10 text-[#8C6D46] font-semibold border border-amber-500/20">
                Chế Độ Chỉnh Sửa
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-normal text-stone-900">
                Thiệp Cưới: {groomName} & {brideName}
              </h1>
            </div>
            <p className="text-xs text-stone-500 font-mono mt-1">
              Đường dẫn: /thiep-cuoi/{slug} • Mã PIN: {pin}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/thiep-cuoi/${slug}`}
              target="_blank"
              className="h-10 px-4 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <span>Xem Thiệp Trực Tiếp</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              type="button"
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="h-10 px-5 rounded-xl bg-[#8C6D46] hover:bg-[#725735] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-200" />
                  <span>Đang Lưu...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-amber-200" />
                  <span>Lưu Thay Đổi</span>
                </>
              )}
            </button>

            {/* Mobile Preview Toggle */}
            <button
              type="button"
              onClick={() => setShowMobilePreview(true)}
              className="lg:hidden h-10 px-3 rounded-xl border border-stone-300 text-stone-700 text-xs font-medium flex items-center gap-1"
            >
              <Smartphone className="w-4 h-4 text-[#8C6D46]" />
              <span>Xem Thử</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Split-Screen Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: EDIT TABS & FORM (col-span-7) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step Navigation Tabs */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-stone-200/70 rounded-2xl text-xs font-medium">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className={`py-2 px-3 rounded-xl transition-all ${
                  currentStep === 1
                    ? 'bg-white text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                1. Giao Diện
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className={`py-2 px-3 rounded-xl transition-all ${
                  currentStep === 2
                    ? 'bg-white text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                2. Thông Tin
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className={`py-2 px-3 rounded-xl transition-all ${
                  currentStep === 3
                    ? 'bg-white text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                3. Bộ Ảnh ({galleryImages.length})
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className={`py-2 px-3 rounded-xl transition-all ${
                  currentStep === 4
                    ? 'bg-white text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                4. Mừng Cưới
              </button>
            </div>

            {/* STEP 1: TEMPLATE & STYLING */}
            {currentStep === 1 && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-2xs space-y-6">
                <div>
                  <h3 className="font-serif text-lg text-stone-900">Mẫu Thiết Kế Thiệp</h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Chọn phong cách phù hợp với tone màu buổi tiệc của bạn
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  {Object.values(INVITATION_TEMPLATES).map((tpl) => (
                    <div
                      key={tpl.id}
                      onClick={() => {
                        setTemplateId(tpl.id);
                        setThemeColor(tpl.defaultThemeColor);
                      }}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        templateId === tpl.id
                          ? 'border-[#8C6D46] bg-[#8C6D46]/5 shadow-xs'
                          : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
                      }`}
                    >
                      <div className="font-serif font-medium text-sm text-stone-900">
                        {tpl.name}
                      </div>
                      <div className="text-[11px] text-stone-500 mt-1 line-clamp-2">
                        {tpl.description}
                      </div>
                      <div className="mt-3 flex items-center gap-1.5">
                        {tpl.accentColors.map((color) => (
                          <span
                            key={color.hex}
                            className="w-3.5 h-3.5 rounded-full border border-black/10"
                            style={{ backgroundColor: color.hex }}
                            title={color.label}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Music Presets */}
                <div className="pt-4 border-t border-stone-100">
                  <label className="block text-xs font-medium text-stone-700 mb-2">
                    Nhạc Nền Tự Động Phát Khi Mở Thiệp
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {MUSIC_PRESETS.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMusicPreset(m.id)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          musicPreset === m.id
                            ? 'border-[#8C6D46] bg-amber-500/10 text-[#8C6D46] font-semibold'
                            : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        <div className="text-xs">{m.name}</div>
                        <div className="text-[10px] text-stone-500 font-normal mt-0.5">
                          {m.artist}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: WEDDING INFORMATION */}
            {currentStep === 2 && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-2xs space-y-5 text-xs">
                <div>
                  <h3 className="font-serif text-lg text-stone-900">Thông Tin Hôn Lễ</h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Tên cô dâu chú rể, hai họ và thời gian địa điểm tổ chức
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-medium text-stone-700 mb-1">
                      Tên Chú Rể <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={groomName}
                      onChange={(e) => setGroomName(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-stone-300 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-stone-700 mb-1">
                      Tên Cô Dâu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={brideName}
                      onChange={(e) => setBrideName(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-stone-300 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-medium text-stone-700 mb-1">
                      Họ Tên Thân Sinh Nhà Trai
                    </label>
                    <textarea
                      rows={2}
                      value={groomParents}
                      onChange={(e) => setGroomParents(e.target.value)}
                      placeholder="Ông: ...&#10;Bà: ..."
                      className="w-full p-3 rounded-xl border border-stone-300 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-stone-700 mb-1">
                      Họ Tên Thân Sinh Nhà Gái
                    </label>
                    <textarea
                      rows={2}
                      value={brideParents}
                      onChange={(e) => setBrideParents(e.target.value)}
                      placeholder="Ông: ...&#10;Bà: ..."
                      className="w-full p-3 rounded-xl border border-stone-300 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-medium text-stone-700 mb-1">
                      Ngày Giờ Tổ Chức (Dùng Cho Đếm Ngược)
                    </label>
                    <input
                      type="datetime-local"
                      value={ceremonyDate}
                      onChange={(e) => setCeremonyDate(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-stone-300 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-stone-700 mb-1">
                      Dòng Chữ Giờ Hiển Thị Trên Thiệp
                    </label>
                    <input
                      type="text"
                      value={ceremonyTimeText}
                      onChange={(e) => setCeremonyTimeText(e.target.value)}
                      placeholder="11:00 — Chủ Nhật, 20.12.2026"
                      className="w-full h-11 px-3.5 rounded-xl border border-stone-300 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Tên Trung Tâm Tiệc Cưới / Nhà Hàng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    placeholder="Ví dụ: White Palace Hoàng Văn Thụ"
                    className="w-full h-11 px-3.5 rounded-xl border border-stone-300 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Địa Chỉ Chi Tiết <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={venueAddress}
                    onChange={(e) => setVenueAddress(e.target.value)}
                    placeholder="Ví dụ: 194 Hoàng Văn Thụ, Phường 9, Phú Nhuận, TP.HCM"
                    className="w-full h-11 px-3.5 rounded-xl border border-stone-300 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Đường Dẫn Chỉ Đường Google Maps (Nếu có)
                  </label>
                  <input
                    type="url"
                    value={googleMapsUrl}
                    onChange={(e) => setGoogleMapsUrl(e.target.value)}
                    placeholder="https://maps.app.goo.gl/..."
                    className="w-full h-11 px-3.5 rounded-xl border border-stone-300 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                  />
                </div>

                <div className="pt-3 border-t border-stone-100">
                  <label className="block font-medium text-stone-700 mb-1">
                    Lời Kể Câu Chuyện Tình Yêu (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={storyTitle}
                    onChange={(e) => setStoryTitle(e.target.value)}
                    placeholder="Tiêu đề câu chuyện"
                    className="w-full h-10 px-3.5 rounded-xl border border-stone-300 text-stone-900 text-xs mb-2 focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                  />
                  <textarea
                    rows={3}
                    value={storyText}
                    onChange={(e) => setStoryText(e.target.value)}
                    placeholder="Viết một đoạn ngắn về tình yêu của hai bạn..."
                    className="w-full p-3 rounded-xl border border-stone-300 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                  />
                </div>
              </div>
            )}

            {/* STEP 3: IMAGES & GALLERY */}
            {currentStep === 3 && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-2xs space-y-8 text-xs">
                <div>
                  <h3 className="font-serif text-lg text-stone-900">Thiết Lập Hình Ảnh Thiệp Cưới</h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Ảnh tải lên được lưu tại <code>/uploads/invitations/{slug}/</code> và tự động nén chuẩn WebP sắc nét.
                  </p>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* NHÓM 1: ẢNH BÌA MỞ ĐẦU THIỆP (HERO COVER)                     */}
                {/* ------------------------------------------------------------- */}
                <div className="p-4 sm:p-5 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#8C6D46] text-white text-[11px] font-bold flex items-center justify-center">1</span>
                        <span className="font-semibold text-stone-800 text-sm">Ảnh Bìa Mở Đầu Thiệp (Hero Cover)</span>
                      </div>
                      <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
                        💡 <strong>Mục đích:</strong> Hiển thị toàn màn hình ngay đầu thiệp khi khách mở phong bì. Khuyến nghị dùng ảnh chụp chung rõ mặt của hai bạn.
                      </p>
                    </div>

                    <label className="px-3 py-1.5 rounded-xl bg-[#8C6D46] hover:bg-[#725735] text-white text-[11px] font-medium flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors shadow-2xs">
                      <Camera className="w-3.5 h-3.5" />
                      <span>{isUploading ? 'Đang tải...' : 'Đổi Ảnh Bìa Mới'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleCoverUpload}
                        disabled={isUploading}
                      />
                    </label>
                  </div>

                  {coverImage && (
                    <div className="relative aspect-[16/9] w-full max-w-md mx-auto rounded-xl overflow-hidden border border-stone-200 shadow-xs">
                      <img
                        src={coverImage}
                        alt="Ảnh bìa thiệp cưới"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* ------------------------------------------------------------- */}
                {/* NHÓM 2: ẢNH CHÂN DUNG GIỚI THIỆU CHÚ RỂ & CÔ DÂU              */}
                {/* ------------------------------------------------------------- */}
                <div className="p-4 sm:p-5 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#8C6D46] text-white text-[11px] font-bold flex items-center justify-center">2</span>
                      <span className="font-semibold text-stone-800 text-sm">
                        Ảnh Chân Dung Giới Thiệu Chú Rể & Cô Dâu (Hiển thị theo thứ tự Chú Rể → Cô Dâu)
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
                      💡 <strong>Mục đích:</strong> Hai tấm ảnh này sẽ xuất hiện ở mục giới thiệu nhân vật chính ngay khi khách cuộn xuống dưới phần thông tin hai họ. Nên chọn ảnh đơn chân dung dọc (tỷ lệ 3:4) sáng rõ khuôn mặt từng người.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Chân dung Chú Rể */}
                    <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#8C6D46]">
                          ① Chân Dung Chú Rể (The Groom)
                        </span>
                        <label className="px-2.5 py-1 rounded-lg border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-700 text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors">
                          <Upload className="w-3 h-3" />
                          <span>{groomImage ? 'Đổi ảnh' : 'Tải ảnh'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const f = e.target.files?.[0];
                              if (!f) return;
                              try {
                                setIsUploading(true);
                                const fd = new FormData();
                                fd.append('file', f);
                                fd.append('slug', slug);
                                const res = await fetch('/api/invitations/upload', { method: 'POST', body: fd });
                                const d = await res.json();
                                if (d.image?.url) setGroomImage(d.image.url);
                              } finally {
                                setIsUploading(false);
                              }
                            }}
                          />
                        </label>
                      </div>

                      {groomImage ? (
                        <div className="relative aspect-[3/4] w-24 mx-auto rounded-lg overflow-hidden border border-stone-200">
                          <img src={groomImage} alt="Chú Rể" className="w-full h-full object-cover object-[50%_18%]" />
                        </div>
                      ) : (
                        <div className="aspect-[3/4] w-24 mx-auto rounded-lg border border-dashed border-stone-300 flex items-center justify-center text-center text-stone-400 text-[10px] p-2">
                          Chưa có ảnh (sẽ lấy ảnh 1 trong Album)
                        </div>
                      )}

                      <div>
                        <label className="block text-[11px] font-medium text-stone-700 mb-1">
                          Lời giới thiệu ngắn về Chú Rể (Bio)
                        </label>
                        <input
                          type="text"
                          value={groomBio}
                          onChange={(e) => setGroomBio(e.target.value)}
                          placeholder="Ví dụ: Trưởng nam • Chàng trai ấm áp..."
                          className="w-full h-9 px-3 rounded-lg border border-stone-300 text-xs focus:ring-1 focus:ring-[#8C6D46] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Chân dung Cô Dâu */}
                    <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#8C6D46]">
                          ② Chân Dung Cô Dâu (The Bride)
                        </span>
                        <label className="px-2.5 py-1 rounded-lg border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-700 text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors">
                          <Upload className="w-3 h-3" />
                          <span>{brideImage ? 'Đổi ảnh' : 'Tải ảnh'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const f = e.target.files?.[0];
                              if (!f) return;
                              try {
                                setIsUploading(true);
                                const fd = new FormData();
                                fd.append('file', f);
                                fd.append('slug', slug);
                                const res = await fetch('/api/invitations/upload', { method: 'POST', body: fd });
                                const d = await res.json();
                                if (d.image?.url) setBrideImage(d.image.url);
                              } finally {
                                setIsUploading(false);
                              }
                            }}
                          />
                        </label>
                      </div>

                      {brideImage ? (
                        <div className="relative aspect-[3/4] w-24 mx-auto rounded-lg overflow-hidden border border-stone-200">
                          <img src={brideImage} alt="Cô Dâu" className="w-full h-full object-cover object-[50%_18%]" />
                        </div>
                      ) : (
                        <div className="aspect-[3/4] w-24 mx-auto rounded-lg border border-dashed border-stone-300 flex items-center justify-center text-center text-stone-400 text-[10px] p-2">
                          Chưa có ảnh (sẽ lấy ảnh 2 trong Album)
                        </div>
                      )}

                      <div>
                        <label className="block text-[11px] font-medium text-stone-700 mb-1">
                          Lời giới thiệu ngắn về Cô Dâu (Bio)
                        </label>
                        <input
                          type="text"
                          value={brideBio}
                          onChange={(e) => setBrideBio(e.target.value)}
                          placeholder="Ví dụ: Út nữ • Cô gái dịu dàng..."
                          className="w-full h-9 px-3 rounded-lg border border-stone-300 text-xs focus:ring-1 focus:ring-[#8C6D46] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* NHÓM 3: BỘ SƯU TẬP ẢNH KỶ NIỆM (ALBUM DƯỚI THIỆP)              */}
                {/* ------------------------------------------------------------- */}
                <div className="p-4 sm:p-5 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#8C6D46] text-white text-[11px] font-bold flex items-center justify-center">3</span>
                        <span className="font-semibold text-stone-800 text-sm">
                          Bộ Sưu Tập Ảnh Kỷ Niệm (Album Dưới Thiệp - {galleryImages.length} ảnh)
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600 mt-1">
                        💡 <strong>Mục đích:</strong> Hiển thị thành lưới tạp chí ở phần dưới cùng của thiệp (tối đa 12 ảnh). Hệ thống tự động nén sắc nét và xếp cân đối cả ảnh dọc lẫn ảnh ngang.
                      </p>
                    </div>

                    <label className="px-3.5 py-1.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-[11px] font-medium flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploading ? 'Đang tải...' : '+ Thêm Ảnh Mới'}</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleGalleryUpload}
                        disabled={isUploading}
                      />
                    </label>
                  </div>

                  {galleryImages.length === 0 ? (
                    <div className="p-8 text-center text-stone-400 border-2 border-dashed border-stone-200 rounded-2xl">
                      Chưa có ảnh gallery nào. Bấm "+ Thêm Ảnh Mới" để tải ảnh cưới của hai bạn lên.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {galleryImages.map((img, idx) => (
                        <div
                          key={img.id || idx}
                          className="relative group rounded-xl overflow-hidden border border-stone-200 aspect-[3/4] bg-stone-100 shadow-2xs"
                        >
                          <img
                            src={img.url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleRemoveGalleryImage(idx)}
                              className="p-2 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                              title="Xóa ảnh này khỏi thiệp"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 4: BANKING & GIFT QR */}
            {currentStep === 4 && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-2xs space-y-5 text-xs">
                <div>
                  <h3 className="font-serif text-lg text-stone-900">Hộp Mừng Cưới & Chúc Phúc</h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Tùy chọn tải mã QR ngân hàng để bạn bè ở xa gửi lời chúc và quà mừng
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-800">Ảnh Mã QR Tài Khoản</span>
                    <label className="px-3 py-1.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-[11px] font-medium flex items-center gap-1.5 cursor-pointer transition-colors">
                      <QrCode className="w-3.5 h-3.5" />
                      <span>{isUploading ? 'Đang tải...' : 'Tải Ảnh Mã QR'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleQrUpload}
                        disabled={isUploading}
                      />
                    </label>
                  </div>

                  {bankQrImage && (
                    <div className="w-32 h-32 rounded-xl border border-stone-200 overflow-hidden bg-white p-1 relative">
                      <img
                        src={bankQrImage}
                        alt="QR Mừng cưới"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Thông Tin Tài Khoản / Lời Cảm Ơn
                  </label>
                  <textarea
                    rows={3}
                    value={bankInfoText}
                    onChange={(e) => setBankInfoText(e.target.value)}
                    placeholder="Ngân hàng: ...&#10;Số tài khoản: ...&#10;Chủ tài khoản: ..."
                    className="w-full p-3 rounded-xl border border-stone-300 text-stone-900 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                  />
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="editIsPublished"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="w-4 h-4 text-[#8C6D46] rounded focus:ring-[#8C6D46]"
                  />
                  <label htmlFor="editIsPublished" className="font-medium text-stone-800 cursor-pointer">
                    Cho phép khách mời truy cập xem thiệp cưới công khai
                  </label>
                </div>
              </div>
            )}

            {/* Bottom Save Action Button */}
            <div className="pt-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((prev) => prev - 1)}
                    className="h-11 px-4 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-medium flex items-center gap-1 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Quay lại</span>
                  </button>
                )}
                {currentStep < 4 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((prev) => prev + 1)}
                    className="h-11 px-5 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-medium flex items-center gap-1 transition-colors"
                  >
                    <span>Tiếp theo</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="h-12 px-7 rounded-2xl bg-[#8C6D46] hover:bg-[#725735] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-200" />
                    <span>Đang Lưu Thay Đổi...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-amber-200" />
                    <span>Lưu Mọi Thay Đổi</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: LIVE PHONE PREVIEW (col-span-5) */}
          <div className="hidden lg:block lg:col-span-5 sticky top-28">
            <div className="flex items-center justify-between mb-3 px-2">
              <span className="text-[11px] font-mono text-stone-500 uppercase tracking-widest flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-[#8C6D46]" />
                <span>Xem Trước Điện Thoại Trực Tiếp</span>
              </span>
              <button
                type="button"
                onClick={() => setPreviewKey((prev) => prev + 1)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-[#8C6D46] text-[11px] font-medium transition-colors cursor-pointer"
                title="Khởi động lại hiệu ứng mở phong bì 3D"
              >
                <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                <span>Mở lại phong bì</span>
              </button>
            </div>

            {/* Smartphone Mockup Frame */}
            <div className="w-[380px] h-[780px] mx-auto rounded-[48px] p-3.5 bg-stone-900 shadow-2xl border-4 border-stone-800 relative flex flex-col">
              {/* Dynamic Island / Speaker Notch */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-30" />

              {/* Screen Viewport with Scroll */}
              <div className="w-full h-full rounded-[36px] overflow-y-auto overflow-x-hidden bg-white relative no-scrollbar">
                <WeddingInvitationView
                  key={previewKey}
                  data={livePreviewData as any}
                  isPreview={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE FULL-SCREEN PREVIEW MODAL */}
      {showMobilePreview && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex flex-col">
          <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider">Xem Trước Thiệp Cưới</span>
            <button
              type="button"
              onClick={() => setShowMobilePreview(false)}
              className="p-1 rounded-full bg-stone-800 text-stone-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <WeddingInvitationView
              key={previewKey}
              data={livePreviewData as any}
              isPreview={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}
