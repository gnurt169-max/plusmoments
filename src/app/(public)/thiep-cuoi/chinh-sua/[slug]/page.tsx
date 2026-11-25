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
  Play,
  Square,
  Type,
  Lock,
  RefreshCw,
} from 'lucide-react';
import {
  INVITATION_TEMPLATES,
  INVITATION_FONTS,
  MUSIC_PRESETS,
  VIETQR_BANKS,
  buildVietQrUrl,
  InvitationGalleryImage,
} from '@/lib/invitations/templates';
import { WeddingInvitationView } from '@/components/invitations/WeddingInvitationView';
import { VenueAutocompleteInput } from '@/components/invitations/VenueAutocompleteInput';
import { weddingAudioSynth } from '@/lib/invitations/wedding-audio-synth';
import { formatVietnamDateTimeLocal } from '@/lib/utils';

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
  const [forceSlideInTrigger, setForceSlideInTrigger] = useState<number>(0);
  const [showMobilePreview, setShowMobilePreview] = useState<boolean>(false);
  const [showEnvelopePreview, setShowEnvelopePreview] = useState<boolean>(false);
  const [isPlayingAudioPreview, setIsPlayingAudioPreview] = useState<boolean>(false);
  const [isDraggingAlbum, setIsDraggingAlbum] = useState<boolean>(false);

  // Invitation Form Data States
  const [templateId, setTemplateId] = useState<string>('timeless-ivory');
  const [themeColor, setThemeColor] = useState<string>('#8C6D46');
  const [fontFamily, setFontFamily] = useState<string>('cormorant');
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

  // VietQR & Banking
  const [bankId, setBankId] = useState<string>('VCB');
  const [bankAccount, setBankAccount] = useState<string>('');
  const [bankOwner, setBankOwner] = useState<string>('');
  const [giftAmount, setGiftAmount] = useState<string>('');
  const [giftMessage, setGiftMessage] = useState<string>('Mung cuoi hai ban');
  const [bankQrImage, setBankQrImage] = useState<string>('');
  const [bankInfoText, setBankInfoText] = useState<string>('');
  const [useCustomQr, setUseCustomQr] = useState<boolean>(false);
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
        setFontFamily(inv.fontFamily || 'cormorant');
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
            ? formatVietnamDateTimeLocal(inv.ceremonyDate)
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
        setBankId(inv.bankId || 'VCB');
        setBankAccount(inv.bankAccount || '');
        setBankOwner(inv.bankOwner || '');
        setGiftAmount(inv.giftAmount ? String(inv.giftAmount) : '');
        setGiftMessage(inv.giftMessage || 'Mung cuoi hai ban');
        setBankQrImage(inv.bankQrImage || '');
        setBankInfoText(inv.bankInfoText || '');
        if (inv.bankQrImage && !inv.bankAccount) {
          setUseCustomQr(true);
        }
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

  // Step Switcher with audio auto-pause
  const handleStepChange = (newStep: number) => {
    if (isPlayingAudioPreview) {
      weddingAudioSynth.pause();
      setIsPlayingAudioPreview(false);
    }
    setCurrentStep(newStep);
  };

  // Music Preview Trigger
  const handleToggleAudioPreview = () => {
    weddingAudioSynth.setPreset(musicPreset);
    const playing = weddingAudioSynth.toggle();
    setIsPlayingAudioPreview(playing);
  };

  const handleMusicChange = (preset: string) => {
    setMusicPreset(preset);
    if (isPlayingAudioPreview) {
      weddingAudioSynth.pause();
      weddingAudioSynth.setPreset(preset);
      weddingAudioSynth.play();
    }
  };

  // Upload Multiple Gallery Images into structured folder /uploads/invitations/[slug]/
  const uploadFiles = async (files: FileList | File[]) => {
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
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await uploadFiles(e.target.files);
      e.target.value = '';
    }
  };

  // Drag-and-drop handlers for Step 3 Album
  const handleAlbumDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingAlbum(true);
  };

  const handleAlbumDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingAlbum(true);
  };

  const handleAlbumDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingAlbum(false);
  };

  const handleAlbumDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingAlbum(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
    if (files.length > 0) {
      await uploadFiles(files);
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
      handleStepChange(2);
      return;
    }

    const safeVenueName = venueName.trim() || 'Tư gia';
    const resolvedVenueAddress = venueAddress.trim() || (venueName.trim() ? `${venueName.trim()}, TP. Hồ Chí Minh` : 'Tư gia');
    const resolvedVenueMapUrl = googleMapsUrl.trim() || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([safeVenueName, resolvedVenueAddress].filter(Boolean).join(' ').trim())}`;

    if (!coverImage) {
      alert('Vui lòng chọn hoặc tải lên ảnh bìa thiệp cưới');
      handleStepChange(3);
      return;
    }

    try {
      setIsSaving(true);
      setSaveSuccessMsg('');

      const payload = {
        passcode: pin,
        templateId,
        themeColor,
        fontFamily,
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
        venueName: safeVenueName,
        venueAddress: resolvedVenueAddress,
        googleMapsUrl: resolvedVenueMapUrl,
        storyTitle,
        storyText,
        coverImage,
        galleryImages,
        bankId: bankId.trim(),
        bankAccount: bankAccount.trim(),
        bankOwner: bankOwner.trim(),
        giftAmount: giftAmount ? Number(giftAmount) : null,
        giftMessage: giftMessage.trim(),
        bankQrImage: useCustomQr ? bankQrImage : null,
        bankInfoText: bankInfoText.trim() || null,
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

  // Real-time preview data object (strictly no fake fallbacks)
  const livePreviewData = {
    slug,
    templateId,
    themeColor,
    fontFamily,
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
    googleMapsUrl: googleMapsUrl || ((venueName || venueAddress) ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([venueName, venueAddress].filter(Boolean).join(' ').trim())}` : ''),
    storyTitle,
    storyText,
    coverImage,
    galleryImages,
    bankId,
    bankAccount,
    bankOwner,
    giftAmount: giftAmount ? Number(giftAmount) : null,
    giftMessage,
    bankQrImage: useCustomQr ? bankQrImage : (bankId && bankAccount ? buildVietQrUrl({ bankId, bankAccount, bankOwner, giftAmount, giftMessage }) : bankQrImage),
    bankInfoText,
    isPublished,
    rsvps: [],
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
                onClick={() => handleStepChange(1)}
                className={`py-2 px-3 rounded-xl transition-all cursor-pointer ${currentStep === 1
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
                  }`}
              >
                1. Giao Diện
              </button>
              <button
                type="button"
                onClick={() => handleStepChange(2)}
                className={`py-2 px-3 rounded-xl transition-all cursor-pointer ${currentStep === 2
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
                  }`}
              >
                2. Thông Tin
              </button>
              <button
                type="button"
                onClick={() => handleStepChange(3)}
                className={`py-2 px-3 rounded-xl transition-all cursor-pointer ${currentStep === 3
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
                  }`}
              >
                3. Bộ Ảnh ({galleryImages.length})
              </button>
              <button
                type="button"
                onClick={() => handleStepChange(4)}
                className={`py-2 px-3 rounded-xl transition-all cursor-pointer ${currentStep === 4
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
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${templateId === tpl.id
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

                {/* Font Typography Picker */}
                <div className="pt-4 border-t border-stone-100">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-stone-700 flex items-center gap-1.5">
                      <Type className="w-3.5 h-3.5 text-[#8C6D46]" />
                      <span>Font Chữ Chủ Đạo Cho Thiệp Cưới</span>
                    </label>
                    <span className="text-[10px] text-stone-400 font-mono">Đồng bộ tiêu đề & nội dung</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {INVITATION_FONTS.map((font) => (
                      <div
                        key={font.id}
                        onClick={() => setFontFamily(font.id)}
                        className={`cursor-pointer p-3.5 rounded-xl border-2 transition-all ${
                          fontFamily === font.id
                            ? 'border-[#8C6D46] bg-[#8C6D46]/5 shadow-xs'
                            : 'border-stone-200 hover:border-stone-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className="text-sm font-semibold text-stone-900"
                            style={{ fontFamily: font.fontFamily }}
                          >
                            {font.name}
                          </span>
                          {fontFamily === font.id && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#8C6D46]" />
                          )}
                        </div>
                        <div className="text-[10px] text-stone-500 mb-1.5">
                          {font.styleName}
                        </div>
                        <div
                          className="text-xs text-[#8C6D46] font-medium tracking-wide truncate"
                          style={{ fontFamily: font.fontFamily }}
                        >
                          Save The Date • 2026
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Music Presets & Audio Preview */}
                <div className="pt-4 border-t border-stone-100">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-medium text-stone-700 flex items-center gap-1.5">
                      <Music className="w-3.5 h-3.5 text-[#8C6D46]" />
                      <span>Nhạc Nền Tự Động Phát Khi Mở Thiệp</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleToggleAudioPreview}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                        isPlayingAudioPreview
                          ? 'bg-amber-600 text-white shadow-xs animate-pulse'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200'
                      }`}
                    >
                      {isPlayingAudioPreview ? (
                        <>
                          <Square className="w-3 h-3 fill-current" />
                          <span>Dừng nghe</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-current text-[#8C6D46]" />
                          <span>Nghe thử nhạc</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {MUSIC_PRESETS.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleMusicChange(m.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${musicPreset === m.id
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
                      className="w-full h-11 px-3.5 rounded-xl border border-stone-300 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                    />
                  </div>
                </div>

                {/* Smart HCMC Venue Autocomplete Input */}
                <div className="pt-2 border-t border-stone-100">
                  <VenueAutocompleteInput
                    venueName={venueName}
                    venueAddress={venueAddress}
                    googleMapsUrl={googleMapsUrl}
                    onChangeVenueName={setVenueName}
                    onChangeVenueAddress={setVenueAddress}
                    onChangeGoogleMapsUrl={setGoogleMapsUrl}
                    onSelectVenue={(v) => {
                      setVenueName(v.venueName);
                      setVenueAddress(v.venueAddress);
                      setGoogleMapsUrl(v.venueMapUrl);
                    }}
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
                    className="w-full h-10 px-3.5 rounded-xl border border-stone-300 text-stone-900 text-xs mb-2 focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                  />
                  <textarea
                    rows={3}
                    value={storyText}
                    onChange={(e) => setStoryText(e.target.value)}
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

                  {/* Drag and Drop Zone */}
                  <div
                    onDragEnter={handleAlbumDragEnter}
                    onDragOver={handleAlbumDragOver}
                    onDragLeave={handleAlbumDragLeave}
                    onDrop={handleAlbumDrop}
                    className={`p-6 rounded-2xl border-2 border-dashed transition-all text-center ${
                      isDraggingAlbum
                        ? 'border-[#8C6D46] bg-[#8C6D46]/10 scale-[1.01] shadow-md ring-2 ring-[#8C6D46]/20'
                        : 'border-stone-300 bg-white/80 hover:border-stone-400'
                    }`}
                  >
                    <Camera className="w-8 h-8 text-[#8C6D46] mx-auto mb-2" />
                    <div className="text-xs font-semibold text-stone-800">
                      {isDraggingAlbum ? 'Thả ảnh vào đây để thêm vào album ngay!' : 'Kéo thả hoặc bấm để tải ảnh kỷ niệm lên'}
                    </div>
                    <div className="text-[11px] text-stone-500 mt-1 mb-3">
                      Hỗ trợ kéo thả cùng lúc nhiều ảnh JPG, PNG, WebP (Tự động nén WebP 85%)
                    </div>
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.multiple = true;
                        input.accept = 'image/*';
                        input.onchange = (e: any) => handleGalleryUpload(e);
                        input.click();
                      }}
                      className="h-9 px-4 rounded-xl bg-[#8C6D46] hover:bg-[#725735] text-white text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-2xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploading ? 'Đang xử lý...' : 'Chọn file từ máy tính'}</span>
                    </button>
                  </div>

                  {galleryImages.length === 0 ? (
                    <div className="p-8 text-center text-stone-400 border-2 border-dashed border-stone-200 rounded-2xl">
                      Chưa có ảnh gallery nào. Kéo thả hoặc bấm nút để tải ảnh cưới của hai bạn lên.
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
                              className="p-2 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-colors cursor-pointer"
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
                    Cấu hình mã VietQR động tự động điền số tiền và lời chúc khi khách mừng cưới
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-800 text-sm flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-[#8C6D46]" />
                      <span>Hộp Mừng Cưới (VietQR Tự Điền Số Tiền & Lời Chúc)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setUseCustomQr(!useCustomQr)}
                      className="text-[11px] text-[#8C6D46] hover:underline cursor-pointer"
                    >
                      {useCustomQr ? '← Dùng VietQR Tự Động' : 'Tải Ảnh QR Thủ Công →'}
                    </button>
                  </div>

                  {!useCustomQr ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {/* Ngân hàng */}
                        <div>
                          <label className="block text-[11px] font-medium text-stone-700 mb-1">
                            Ngân Hàng Nhận Mừng Cưới *
                          </label>
                          <select
                            value={bankId}
                            onChange={(e) => setBankId(e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-stone-300 text-xs text-stone-800 focus:ring-2 focus:ring-[#8C6D46] focus:outline-none bg-white"
                          >
                            {VIETQR_BANKS.map((b) => (
                              <option key={b.id} value={b.id}>
                                {b.shortName} — {b.name.split('—')[1]?.trim() || b.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Số tài khoản */}
                        <div>
                          <label className="block text-[11px] font-medium text-stone-700 mb-1">
                            Số Tài Khoản Ngân Hàng *
                          </label>
                          <input
                            type="text"
                            value={bankAccount}
                            onChange={(e) => setBankAccount(e.target.value)}
                            placeholder="Nhập số tài khoản"
                            className="w-full h-10 px-3 rounded-xl border border-stone-300 text-xs font-mono font-semibold focus:ring-2 focus:ring-[#8C6D46] focus:outline-none"
                          />
                        </div>

                        {/* Chủ tài khoản */}
                        <div>
                          <label className="block text-[11px] font-medium text-stone-700 mb-1">
                            Tên Chủ Tài Khoản (Không dấu)
                          </label>
                          <input
                            type="text"
                            value={bankOwner}
                            onChange={(e) => setBankOwner(e.target.value.toUpperCase())}
                            placeholder="VD: NGUYEN VAN A"
                            className="w-full h-10 px-3 rounded-xl border border-stone-300 text-xs font-medium uppercase focus:ring-2 focus:ring-[#8C6D46] focus:outline-none"
                          />
                        </div>

                        {/* Số tiền gợi ý */}
                        <div>
                          <label className="block text-[11px] font-medium text-stone-700 mb-1">
                            Số Tiền Mừng Cưới Gợi Ý (VNĐ, Tùy chọn)
                          </label>
                          <input
                            type="number"
                            value={giftAmount}
                            onChange={(e) => setGiftAmount(e.target.value)}
                            placeholder="VD: 500000"
                            className="w-full h-10 px-3 rounded-xl border border-stone-300 text-xs font-mono focus:ring-2 focus:ring-[#8C6D46] focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Lời chúc mặc định */}
                      <div>
                        <label className="block text-[11px] font-medium text-stone-700 mb-1">
                          Lời Nhắn Chuyển Khoản Mặc Định
                        </label>
                        <input
                          type="text"
                          value={giftMessage}
                          onChange={(e) => setGiftMessage(e.target.value)}
                          placeholder="VD: Mung cuoi hai ban"
                          className="w-full h-10 px-3 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#8C6D46] focus:outline-none"
                        />
                      </div>

                      {/* VietQR Live Preview Banner */}
                      {bankAccount.trim() && (
                        <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row items-center gap-3.5">
                          <div className="w-24 h-24 bg-white p-1 rounded-xl border border-amber-200 shadow-xs shrink-0 flex items-center justify-center">
                            <img
                              src={buildVietQrUrl({ bankId, bankAccount, bankOwner, giftAmount, giftMessage })}
                              alt="VietQR Preview"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="text-left space-y-1 text-xs text-stone-700">
                            <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Mã VietQR Tự Động Hợp Lệ</span>
                            </div>
                            <p className="text-[11px] text-stone-600 leading-relaxed">
                              Khi quét mã này, app ngân hàng của khách sẽ tự động điền đúng Số tài khoản, Số tiền {giftAmount ? `${Number(giftAmount).toLocaleString('vi-VN')} đ` : ''} và Lời chúc.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Manual QR Code Upload */
                    <div className="space-y-3">
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
                    placeholder="VD: STK 1903... Techcombank - Nguyen Van A"
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
                    onClick={() => handleStepChange(currentStep - 1)}
                    className="h-11 px-4 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Quay lại</span>
                  </button>
                )}
                {currentStep < 4 && (
                  <button
                    type="button"
                    onClick={() => handleStepChange(currentStep + 1)}
                    className="h-11 px-5 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
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
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEnvelopePreview(true);
                    setPreviewKey((prev) => prev + 1);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-[#8C6D46] text-[11px] font-medium transition-colors cursor-pointer"
                  title="Khởi động lại hiệu ứng mở phong bì 3D"
                >
                  <span>✉️ Thử mở phong bì</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setForceSlideInTrigger((prev) => prev + 1);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-medium transition-colors cursor-pointer"
                  title="Kích hoạt lại animation trượt Chú Rể và Cô Dâu"
                >
                  <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                  <span>✨ Thử hiệu ứng cuộn</span>
                </button>
              </div>
            </div>

            {/* Smartphone Mockup Frame */}
            <div className="w-[380px] h-[780px] mx-auto rounded-[48px] p-3.5 bg-stone-900 shadow-2xl border-4 border-stone-800 relative flex flex-col">
              {/* Dynamic Island / Speaker Notch */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-30" />

              {/* Screen Viewport with Scroll */}
              <div className="w-full h-full rounded-[36px] overflow-y-auto overflow-x-hidden bg-transparent relative no-scrollbar">
                <WeddingInvitationView
                  key={previewKey}
                  data={livePreviewData as any}
                  isPreview={true}
                  showEnvelopePreview={showEnvelopePreview}
                  onEnvelopeClose={() => setShowEnvelopePreview(false)}
                  forceSlideInTrigger={forceSlideInTrigger}
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
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider">Xem Trước Thiệp Cưới</span>
              <button
                type="button"
                onClick={() => {
                  setShowEnvelopePreview(true);
                  setPreviewKey((prev) => prev + 1);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-200 text-[11px] cursor-pointer"
              >
                <span>✉️ Thử mở phong bì</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setForceSlideInTrigger((prev) => prev + 1);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-800 text-stone-200 text-[11px] cursor-pointer"
              >
                <span>✨ Thử hiệu ứng cuộn</span>
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
          <div className="flex-1 overflow-y-auto relative">
            <WeddingInvitationView
              key={previewKey}
              data={livePreviewData as any}
              isPreview={true}
              showEnvelopePreview={showEnvelopePreview}
              onEnvelopeClose={() => setShowEnvelopePreview(false)}
              forceSlideInTrigger={forceSlideInTrigger}
            />
          </div>
        </div>
      )}
    </div>
  );
}
