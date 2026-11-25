'use client';

import React, { useState, useRef, useEffect, useTransition } from 'react';
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
  Play,
  Square,
  RotateCw,
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
  generateRandomSlug,
  generateRandomPin,
  InvitationGalleryImage,
} from '@/lib/invitations/templates';
import { WeddingInvitationView } from '@/components/invitations/WeddingInvitationView';
import { VenueAutocompleteInput } from '@/components/invitations/VenueAutocompleteInput';
import { weddingAudioSynth } from '@/lib/invitations/wedding-audio-synth';

export default function CreateWeddingInvitationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTemplate = searchParams.get('template') || 'timeless-ivory';

  // Step 1: Templates, Styling & Font
  const [templateId, setTemplateId] = useState<string>(initialTemplate);
  const [themeColor, setThemeColor] = useState<string>(
    INVITATION_TEMPLATES[initialTemplate]?.defaultThemeColor || '#8C6D46'
  );
  const [fontFamily, setFontFamily] = useState<string>('cormorant');
  const [musicPreset, setMusicPreset] = useState<string>('romantic-piano');
  const [isPlayingAudioPreview, setIsPlayingAudioPreview] = useState<boolean>(false);

  // Step 2: Couple & Wedding Info (Zero mock data - strictly blank initial state)
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

  // Step 3: Images & Gallery + Drag and Drop
  const [coverImage, setCoverImage] = useState<string>('');
  const [galleryImages, setGalleryImages] = useState<InvitationGalleryImage[]>([]);
  const [isDraggingAlbum, setIsDraggingAlbum] = useState<boolean>(false);

  // Step 4: VietQR & Banking
  const [bankId, setBankId] = useState<string>('VCB');
  const [bankAccount, setBankAccount] = useState<string>('');
  const [bankOwner, setBankOwner] = useState<string>('');
  const [giftAmount, setGiftAmount] = useState<string>('');
  const [giftMessage, setGiftMessage] = useState<string>('Mung cuoi hai ban');
  const [bankQrImage, setBankQrImage] = useState<string>('');
  const [bankInfoText, setBankInfoText] = useState<string>('');
  const [useCustomQr, setUseCustomQr] = useState<boolean>(false);

  // Custom Slug (Default Random pm-xxxxxx) & 6-Digit PIN
  const [customSlug, setCustomSlug] = useState<string>(() => generateRandomSlug());
  const [slugStatus, setSlugStatus] = useState<{ checking: boolean; available: boolean; error?: string }>({
    checking: false,
    available: true,
  });
  const [editPasscode, setEditPasscode] = useState<string>(() => generateRandomPin());

  // UI States & Preview Controls
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [previewKey, setPreviewKey] = useState<number>(0);
  const [forceSlideInTrigger, setForceSlideInTrigger] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Stable unique draft slug for organizing uploads into /uploads/invitations/[draftSlug]/
  const [draftSlug] = useState<string>(() => {
    const randomHex = Math.random().toString(36).substring(2, 6);
    return `draft-${Date.now().toString(36)}-${randomHex}`;
  });

  const [createdResult, setCreatedResult] = useState<{
    slug: string;
    editPasscode: string;
    url: string;
  } | null>(null);
  const [showMobilePreview, setShowMobilePreview] = useState<boolean>(false);
  const [showEnvelopePreview, setShowEnvelopePreview] = useState<boolean>(false);
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

  // Slug collision check effect
  useEffect(() => {
    const raw = customSlug?.trim();
    if (!raw) {
      setSlugStatus({ checking: false, available: false, error: 'Đường dẫn không được để trống' });
      return;
    }
    if (raw.length < 2) {
      setSlugStatus({ checking: false, available: false, error: 'Đường dẫn phải có ít nhất 2 ký tự' });
      return;
    }

    setSlugStatus((prev) => ({ ...prev, checking: true }));
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/invitations/check-slug?slug=${encodeURIComponent(raw)}`);
        const d = await res.json();
        if (d.available) {
          setSlugStatus({ checking: false, available: true });
        } else {
          setSlugStatus({
            checking: false,
            available: false,
            error: d.error || 'Đường dẫn này đã tồn tại trên hệ thống, vui lòng chọn tên đường dẫn khác.',
          });
        }
      } catch {
        setSlugStatus({ checking: false, available: true });
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [customSlug]);

  // Upload handler for Gallery & Cover (organized into /uploads/invitations/[draftSlug]/)
  const uploadFiles = async (files: FileList | File[], isCoverOnly = false) => {
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('slug', draftSlug);
      formData.append('invitationSlug', draftSlug);
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
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isCoverOnly = false) => {
    if (e.target.files) {
      await uploadFiles(e.target.files, isCoverOnly);
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
      await uploadFiles(files, false);
    }
  };

  // Upload QR code image (organized into /uploads/invitations/[draftSlug]/)
  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('slug', draftSlug);
      formData.append('invitationSlug', draftSlug);

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

    if (!slugStatus.available) {
      alert(slugStatus.error || 'Đường dẫn này đã tồn tại trên hệ thống, vui lòng chọn tên đường dẫn khác.');
      handleStepChange(4);
      return;
    }

    if (!/^\d{6}$/.test(editPasscode.trim())) {
      alert('Mã PIN chỉnh sửa phải gồm đúng 6 chữ số');
      handleStepChange(4);
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
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
        customSlug: customSlug.trim(),
        editPasscode: editPasscode.trim(),
        draftSlug,
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

  // Construct Live Preview Data Object (Strictly no fake fallbacks)
  const livePreviewData = {
    slug: customSlug || 'preview-wedding',
    templateId,
    themeColor,
    fontFamily,
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
    musicPreset,
    bankId,
    bankAccount,
    bankOwner,
    giftAmount: giftAmount ? Number(giftAmount) : null,
    giftMessage,
    bankQrImage: useCustomQr ? bankQrImage : (bankId && bankAccount ? buildVietQrUrl({ bankId, bankAccount, bankOwner, giftAmount, giftMessage }) : bankQrImage),
    bankInfoText,
    rsvps: [],
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
              className={`text-xs font-medium tracking-wide py-1.5 border-b-2 transition-colors ${currentStep === s.step
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
                      className={`cursor-pointer p-4 rounded-2xl border-2 transition-all ${templateId === tpl.id
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
                        className={`w-9 h-9 rounded-full border-2 transition-transform ${themeColor === c.hex
                          ? 'scale-110 border-stone-900 shadow-sm'
                          : 'border-transparent hover:scale-105'
                          }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.label}
                      />
                    ))}
                  </div>
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

                {/* Music Preset & Audio Preview */}
                <div className="pt-4 border-t border-stone-100">
                  <label className="block text-xs font-medium text-stone-700 mb-2 flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-[#8C6D46]" />
                    <span>Nhạc Nền Hôn Lễ Tự Động</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={musicPreset}
                      onChange={(e) => handleMusicChange(e.target.value)}
                      className="flex-1 h-11 px-3.5 rounded-xl border border-stone-300 text-stone-800 text-xs focus:ring-2 focus:ring-[#8C6D46] focus:outline-none bg-white"
                    >
                      {MUSIC_PRESETS.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={handleToggleAudioPreview}
                      className={`h-11 px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                        isPlayingAudioPreview
                          ? 'bg-amber-600 text-white shadow-md animate-pulse'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200'
                      }`}
                      title={isPlayingAudioPreview ? 'Dừng phát nhạc thử' : 'Nghe thử giai điệu nhạc cưới'}
                    >
                      {isPlayingAudioPreview ? (
                        <>
                          <Square className="w-3.5 h-3.5 fill-current" />
                          <span>Dừng nghe</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current text-[#8C6D46]" />
                          <span>Nghe thử</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => handleStepChange(2)}
                    className="h-11 px-6 rounded-xl bg-[#8C6D46] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
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
                      className="w-full h-11 px-3.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#8C6D46] focus:outline-none"
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

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Lời Ngỏ / Câu Chuyện Tình Yêu (Tùy chọn)
                  </label>
                  <textarea
                    rows={3}
                    value={storyText}
                    onChange={(e) => setStoryText(e.target.value)}
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
                    onClick={() => {
                      if (!groomName.trim() || !brideName.trim()) {
                        alert('Vui lòng nhập đầy đủ tên Cô Dâu và Chú Rể');
                        return;
                      }
                      // Auto fallback venueAddress if empty
                      if (!venueAddress.trim()) {
                        setVenueAddress(venueName.trim() ? `${venueName.trim()}, TP. Hồ Chí Minh` : 'Tư gia');
                      }
                      setCurrentStep(3);
                    }}
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
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-serif text-stone-900 mb-1">
                    Bước 3: Tải Ảnh Cưới & Thiết Lập Hình Ảnh
                  </h3>
                  <p className="text-xs text-stone-500">
                    Phân định rõ ràng từng vị trí ảnh để thiệp cưới hiển thị hoàn hảo nhất trên mọi dòng điện thoại.
                  </p>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* NHÓM 1: ẢNH BÌA MỞ ĐẦU THIỆP (HERO COVER)                     */}
                {/* ------------------------------------------------------------- */}
                <div className="p-5 sm:p-6 rounded-2xl border border-stone-200 bg-white space-y-4 shadow-2xs">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#8C6D46] text-white text-[11px] font-bold flex items-center justify-center">1</span>
                        <h4 className="text-sm font-semibold text-stone-900">
                          Ảnh Bìa Mở Đầu Thiệp (Hero Cover)
                        </h4>
                      </div>
                      <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                        💡 <strong>Mục đích:</strong> Hiển thị toàn màn hình ngay đầu thiệp khi khách mở phong bì. Khuyến nghị dùng ảnh chụp chung rõ mặt của hai bạn.
                      </p>
                    </div>

                    <label className="px-3.5 py-1.5 rounded-xl bg-[#8C6D46] hover:bg-[#725735] text-white text-[11px] font-medium flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors shadow-2xs">
                      <Camera className="w-3.5 h-3.5" />
                      <span>{isUploading ? 'Đang tải...' : 'Đổi Ảnh Bìa'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, true)}
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
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-[#1C1917]/80 text-[#E5C585] text-[10px] font-mono tracking-wider uppercase">
                        Hero Cover Đang Dùng
                      </span>
                    </div>
                  )}
                </div>

                {/* ------------------------------------------------------------- */}
                {/* NHÓM 2: ẢNH CHÂN DUNG GIỚI THIỆU CHÚ RỂ & CÔ DÂU              */}
                {/* ------------------------------------------------------------- */}
                <div className="p-5 sm:p-6 rounded-2xl border border-stone-200 bg-white space-y-5 shadow-2xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#8C6D46] text-white text-[11px] font-bold flex items-center justify-center">2</span>
                      <h4 className="text-sm font-semibold text-stone-900">
                        Ảnh Chân Dung Giới Thiệu Chú Rể & Cô Dâu (Hiển thị theo thứ tự Chú Rể → Cô Dâu)
                      </h4>
                    </div>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      💡 <strong>Mục đích:</strong> Hai tấm ảnh này sẽ xuất hiện ở mục giới thiệu nhân vật chính ngay khi khách cuộn xuống dưới phần thông tin hai họ. Nên chọn ảnh đơn chân dung dọc (tỷ lệ 3:4) sáng rõ khuôn mặt từng người.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Ô 1: Chân dung Chú Rể */}
                    <div className="p-4 rounded-xl border border-stone-200/90 bg-stone-50/60 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#8C6D46]">
                          ① Chân Dung Chú Rể (The Groom)
                        </span>
                        <label className="px-3 py-1 rounded-lg border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors shadow-2xs">
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
                                fd.append('slug', draftSlug);
                                fd.append('invitationSlug', draftSlug);
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
                        <div className="relative aspect-[3/4] w-28 mx-auto rounded-xl overflow-hidden border border-stone-200 shadow-xs">
                          <img src={groomImage} alt="Chú Rể" className="w-full h-full object-cover object-[50%_18%]" />
                        </div>
                      ) : (
                        <div className="aspect-[3/4] w-28 mx-auto rounded-xl border border-dashed border-stone-300 flex flex-col items-center justify-center p-2 text-center text-stone-400 text-[10px]">
                          <span>Chưa có ảnh (sẽ lấy ảnh 1 trong Album)</span>
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

                    {/* Ô 2: Chân dung Cô Dâu */}
                    <div className="p-4 rounded-xl border border-stone-200/90 bg-stone-50/60 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#8C6D46]">
                          ② Chân Dung Cô Dâu (The Bride)
                        </span>
                        <label className="px-3 py-1 rounded-lg border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors shadow-2xs">
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
                                fd.append('slug', draftSlug);
                                fd.append('invitationSlug', draftSlug);
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
                        <div className="relative aspect-[3/4] w-28 mx-auto rounded-xl overflow-hidden border border-stone-200 shadow-xs">
                          <img src={brideImage} alt="Cô Dâu" className="w-full h-full object-cover object-[50%_18%]" />
                        </div>
                      ) : (
                        <div className="aspect-[3/4] w-28 mx-auto rounded-xl border border-dashed border-stone-300 flex flex-col items-center justify-center p-2 text-center text-stone-400 text-[10px]">
                          <span>Chưa có ảnh (sẽ lấy ảnh 2 trong Album)</span>
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
                <div className="p-5 sm:p-6 rounded-2xl border border-stone-200 bg-white space-y-4 shadow-2xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#8C6D46] text-white text-[11px] font-bold flex items-center justify-center">3</span>
                      <h4 className="text-sm font-semibold text-stone-900">
                        Bộ Sưu Tập Ảnh Kỷ Niệm (Album Dưới Thiệp)
                      </h4>
                    </div>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      💡 <strong>Mục đích:</strong> Hiển thị thành lưới tạp chí ở phần dưới cùng của thiệp (tối đa 12 ảnh). Hệ thống tự động nén sắc nét và xếp cân đối cả ảnh dọc lẫn ảnh ngang.
                    </p>
                  </div>

                  {/* Upload Button & Drag Drop Zone */}
                  <div
                    onDragEnter={handleAlbumDragEnter}
                    onDragOver={handleAlbumDragOver}
                    onDragLeave={handleAlbumDragLeave}
                    onDrop={handleAlbumDrop}
                    className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all text-center ${
                      isDraggingAlbum
                        ? 'border-[#8C6D46] bg-[#8C6D46]/10 scale-[1.01] shadow-md ring-2 ring-[#8C6D46]/20'
                        : 'border-stone-300 bg-stone-50/70 hover:border-stone-400'
                    }`}
                  >
                    <Camera className="w-8 h-8 text-[#8C6D46] mx-auto mb-2" />
                    <div className="text-xs font-semibold text-stone-800">
                      {isDraggingAlbum ? 'Thả ảnh vào đây để tải lên album ngay!' : 'Kéo thả hoặc bấm để tải ảnh kỷ niệm lên'}
                    </div>
                    <div className="text-[11px] text-stone-500 mt-1 mb-4">
                      Hỗ trợ kéo thả cùng lúc nhiều ảnh JPG, PNG, WebP (Tối đa 15MB/ảnh, tự động nén WebP 85%)
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
                      className="h-10 px-5 rounded-xl bg-[#8C6D46] hover:bg-[#725735] text-white text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{isUploading ? 'Đang Xử Lý & Nén Ảnh...' : 'Tải Thêm Ảnh Vào Album'}</span>
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
                    Cấu hình mã VietQR động tự động điền số tiền và lời chúc khi khách mời chuyển khoản, thiết lập đường dẫn và mã PIN quản lý thiệp.
                  </p>
                </div>

                {/* Dynamic VietQR Wedding Gift Box */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-stone-800 uppercase tracking-wider flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-[#8C6D46]" />
                      <span>Hộp Mừng Cưới (VietQR Tự Điền Số Tiền & Lời Chúc)</span>
                    </label>
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                          placeholder="VD: Mung cuoi Minh Trung va Thanh Thao"
                          className="w-full h-10 px-3 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#8C6D46] focus:outline-none"
                        />
                        <span className="text-[10px] text-stone-400 block mt-1">
                          Hệ thống sẽ tự động chuẩn hóa tiếng Việt không dấu chuẩn VietQR khi khách quét mã.
                        </span>
                      </div>

                      {/* VietQR Live Preview Banner */}
                      {bankAccount.trim() && (
                        <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 flex flex-col sm:flex-row items-center gap-4">
                          <div className="w-28 h-28 bg-white p-1 rounded-xl border border-amber-200 shadow-xs shrink-0 flex items-center justify-center">
                            <img
                              src={buildVietQrUrl({ bankId, bankAccount, bankOwner, giftAmount, giftMessage })}
                              alt="VietQR Preview"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="text-left space-y-1 text-xs text-stone-700">
                            <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Mã VietQR Đã Sẵn Sàng</span>
                            </div>
                            <p className="text-[11px] text-stone-600 leading-relaxed">
                              Khi khách mời dùng app của bất kỳ ngân hàng nào quét mã này, ứng dụng sẽ <strong>tự động điền đúng Số tài khoản, Số tiền {giftAmount ? `${Number(giftAmount).toLocaleString('vi-VN')} đ` : ''} và Lời chúc</strong> mà không cần gõ tay.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Manual QR Code Upload */
                    <div className="space-y-4">
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
                              className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full shadow-xs cursor-pointer"
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
                            className="h-9 px-4 rounded-xl bg-white border border-stone-300 text-stone-700 text-xs font-medium hover:bg-stone-50 transition-colors cursor-pointer"
                          >
                            {bankQrImage ? 'Thay Đổi Ảnh QR' : 'Tải Ảnh Mã QR Từ Máy'}
                          </button>
                          <div className="text-[11px] text-stone-500">
                            Hỗ trợ ảnh QR ngân hàng tự tải lên
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-stone-700 mb-1">
                          Thông Tin Số Tài Khoản / Lời Nhắn
                        </label>
                        <textarea
                          rows={2}
                          value={bankInfoText}
                          onChange={(e) => setBankInfoText(e.target.value)}
                          placeholder="VD: STK 1903... Techcombank - Nguyen Van A"
                          className="w-full p-2.5 rounded-xl border border-stone-300 text-xs font-mono focus:ring-2 focus:ring-[#8C6D46] focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Custom Slug & Collision Check */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5 text-[#8C6D46]" />
                      <span>Đường Dẫn Riêng Cho Thiệp Cưới (Slug) *</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setCustomSlug(generateRandomSlug())}
                      className="text-[11px] text-[#8C6D46] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Tạo ngẫu nhiên</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-stone-500 bg-stone-100 px-3 py-2.5 rounded-xl border border-stone-200 shrink-0">
                      plusmoments.vn/thiep-cuoi/
                    </span>
                    <input
                      type="text"
                      value={customSlug}
                      onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                      className={`flex-1 h-11 px-3.5 rounded-xl border text-xs font-mono font-semibold focus:outline-none transition-colors ${
                        slugStatus.available
                          ? 'border-stone-300 focus:ring-2 focus:ring-[#8C6D46]'
                          : 'border-red-400 bg-red-50/30 text-red-700 focus:ring-2 focus:ring-red-400'
                      }`}
                    />
                  </div>

                  {/* Slug Validation Feedback */}
                  {slugStatus.checking ? (
                    <div className="text-[11px] text-stone-400 font-mono flex items-center gap-1.5">
                      <RotateCw className="w-3 h-3 animate-spin" />
                      <span>Đang kiểm tra tính khả dụng của đường dẫn...</span>
                    </div>
                  ) : slugStatus.available ? (
                    <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Đường dẫn hợp lệ và có thể sử dụng.</span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-red-600 font-medium flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{slugStatus.error || 'Đường dẫn này đã tồn tại trên hệ thống, vui lòng chọn tên đường dẫn khác.'}</span>
                    </div>
                  )}
                  <div className="text-[11px] text-stone-500">
                    Mặc định hệ thống tự sinh mã ngẫu nhiên bảo mật, hoặc bạn có thể tự nhập tên tùy chỉnh.
                  </div>
                </div>

                {/* Edit PIN Passcode (6 digits) */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#8C6D46]" />
                      <span>Mã PIN Chỉnh Sửa Thiệp (6 Chữ Số) *</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setEditPasscode(generateRandomPin())}
                      className="text-[11px] text-[#8C6D46] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Tạo mã ngẫu nhiên</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={editPasscode}
                      onChange={(e) => setEditPasscode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-44 h-11 px-3.5 rounded-xl border border-stone-300 text-center text-sm font-mono font-bold tracking-widest focus:ring-2 focus:ring-[#8C6D46] focus:outline-none"
                    />
                    <span className="text-[11px] text-stone-500">
                      {/^\d{6}$/.test(editPasscode) ? (
                        <span className="text-emerald-600 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Mã PIN 6 số hợp lệ
                        </span>
                      ) : (
                        <span className="text-red-500 font-medium flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Vui lòng nhập đủ 6 chữ số
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-500">
                    Dùng để đăng nhập chỉnh sửa thiệp hoặc quản lý danh sách khách mời sau khi xuất bản.
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
                    onClick={() => handleStepChange(3)}
                    className="h-11 px-5 rounded-xl border border-stone-300 text-stone-700 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Quay Lại</span>
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting || isUploading || !slugStatus.available || !/^\d{6}$/.test(editPasscode)}
                    onClick={handleSubmit}
                    className="h-12 px-8 rounded-xl bg-[#8C6D46] hover:bg-[#725735] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 shadow-md transition-all disabled:opacity-50 cursor-pointer"
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
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEnvelopePreview(true);
                    setPreviewKey((prev) => prev + 1);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-[#8C6D46] text-[11px] font-medium transition-colors cursor-pointer"
                  title="Chạy hiệu ứng mở phong bì 3D bên trong khung điện thoại"
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
                  data={livePreviewData}
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
        <div className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col">
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
              data={livePreviewData}
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
