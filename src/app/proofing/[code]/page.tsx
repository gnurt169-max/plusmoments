'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  Lock,
  Heart,
  Image as ImageIcon,
  MessageSquare,
  Download,
  CheckCircle2,
  Clock,
  Sparkles,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Phone,
  Send,
  AlertCircle,
  ShieldCheck,
  Check,
  Filter,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface GalleryMeta {
  id: string;
  code: string;
  coupleName: string;
  shootDate?: string | null;
  coverImage?: string | null;
  maxPhotobook: number;
  maxPortrait: number;
  allowDownload: boolean;
  status: 'OPEN' | 'SUBMITTED' | 'COMPLETED';
  clientNote?: string | null;
  submittedAt?: string | null;
  expiresAt?: string | null;
}

interface PhotoItem {
  fileName: string;
  url: string;
  thumbUrl: string;
  smallUrl: string;
  sizeBytes: number;
}

interface SelectionState {
  photobook?: boolean;
  portrait?: boolean;
  note?: string;
}

interface StudioInfo {
  siteName: string;
  hotline: string;
  zalo: string;
  email: string;
}

export default function ClientProofingPage({
  params,
}: {
  params: { code: string };
}) {
  const { code } = params;

  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [gallery, setGallery] = useState<GalleryMeta | null>(null);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [selections, setSelections] = useState<Record<string, SelectionState>>({});
  const [studio, setStudio] = useState<StudioInfo | null>(null);

  // PIN Form State
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);

  // Active View Filter
  const [activeFilter, setActiveFilter] = useState<'all' | 'photobook' | 'portrait' | 'notes' | 'unselected'>('all');

  // Active Note Modal
  const [editingNotePhoto, setEditingNotePhoto] = useState<PhotoItem | null>(null);
  const [noteText, setNoteText] = useState('');

  // Submit Modal
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [generalNote, setGeneralNote] = useState('');
  const [isSubmittingFinal, setIsSubmittingFinal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/proofing/${code}`);
      const data = await res.json();

      if (res.ok && data.authenticated) {
        setAuthenticated(true);
        setGallery(data.gallery);
        setPhotos(data.photos || []);
        setSelections(data.selections || {});
        setStudio(data.studio || null);
      } else {
        // Not authenticated yet - shows PIN screen
        setAuthenticated(false);
        setGallery({
          id: '',
          code,
          coupleName: data.coupleName || 'Dâu & Rể',
          shootDate: data.shootDate || null,
          coverImage: data.coverImage || null,
          maxPhotobook: 40,
          maxPortrait: 2,
          allowDownload: true,
          status: 'OPEN',
        });
        setStudio(data.studio || null);
      }
    } catch {
      setPinError('Không thể tải thông tin bộ sưu tập. Vui lòng tải lại trang.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, [code]);

  // Handle PIN Unlock
  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) {
      setPinError('Vui lòng nhập mã PIN bảo mật.');
      return;
    }

    try {
      setIsVerifyingPin(true);
      setPinError('');

      const res = await fetch(`/api/proofing/${code}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinCode: pinInput.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Mã PIN không chính xác.');
      }

      // Success -> Reload gallery in authenticated mode
      await fetchGallery();
    } catch (err: any) {
      setPinError(err.message || 'Mã PIN không chính xác. Vui lòng kiểm tra lại.');
    } finally {
      setIsVerifyingPin(false);
    }
  };

  // Toggle Photo Selection (Auto-save)
  const handleToggleSelection = async (
    fileName: string,
    field: 'photobook' | 'portrait',
    currentVal?: boolean
  ) => {
    const newVal = !currentVal;

    // Optimistic UI update
    setSelections((prev) => {
      const current = prev[fileName] || {};
      const next = { ...current, [field]: newVal };
      if (!next.photobook && !next.portrait && !next.note) {
        const copy = { ...prev };
        delete copy[fileName];
        return copy;
      }
      return { ...prev, [fileName]: next };
    });

    try {
      const res = await fetch(`/api/proofing/${code}/select`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName,
          [field]: newVal,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        // Rollback on limit reached or error
        setSelections((prev) => {
          const current = prev[fileName] || {};
          return { ...prev, [fileName]: { ...current, [field]: currentVal } };
        });
        showToast(data.error || 'Không thể lưu lựa chọn.');
      }
    } catch {
      // Rollback
      setSelections((prev) => {
        const current = prev[fileName] || {};
        return { ...prev, [fileName]: { ...current, [field]: currentVal } };
      });
      showToast('Lỗi kết nối khi lưu lựa chọn.');
    }
  };

  // Save Note for a photo
  const handleSaveNote = async () => {
    if (!editingNotePhoto) return;
    const fileName = editingNotePhoto.fileName;
    const trimmed = noteText.trim();

    setSelections((prev) => {
      const current = prev[fileName] || {};
      return { ...prev, [fileName]: { ...current, note: trimmed } };
    });

    try {
      await fetch(`/api/proofing/${code}/select`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName,
          note: trimmed,
        }),
      });
      showToast('Đã lưu ghi chú chỉnh sửa thành công!');
    } catch {
      showToast('Lỗi lưu ghi chú.');
    } finally {
      setEditingNotePhoto(null);
    }
  };

  // Handle Final Submission
  const handleSubmitFinal = async () => {
    try {
      setIsSubmittingFinal(true);
      const res = await fetch(`/api/proofing/${code}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientNote: generalNote }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Lỗi gửi chốt danh sách.');
      }

      if (gallery) {
        setGallery({
          ...gallery,
          status: 'SUBMITTED',
          submittedAt: new Date().toISOString(),
          clientNote: generalNote,
        });
      }

      setIsSubmitModalOpen(false);

      // Trigger Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#C5A880', '#D4AF37', '#FAF8F5', '#E11D48'],
        });
      } catch {}

      showToast('✨ Chúc mừng hai bạn! Danh sách chọn ảnh đã được gửi tới ekip PlusMoments.');
    } catch (err: any) {
      alert(err.message || 'Lỗi gửi chốt danh sách.');
    } finally {
      setIsSubmittingFinal(false);
    }
  };

  // Counters
  const photobookSelectedCount = useMemo(() => {
    return Object.values(selections).filter((s) => s.photobook).length;
  }, [selections]);

  const portraitSelectedCount = useMemo(() => {
    return Object.values(selections).filter((s) => s.portrait).length;
  }, [selections]);

  const notesSelectedCount = useMemo(() => {
    return Object.values(selections).filter((s) => Boolean(s.note?.trim())).length;
  }, [selections]);

  // Filtered Photos for Display
  const displayedPhotos = useMemo(() => {
    return photos.filter((p) => {
      const s = selections[p.fileName];
      if (activeFilter === 'photobook') return Boolean(s?.photobook);
      if (activeFilter === 'portrait') return Boolean(s?.portrait);
      if (activeFilter === 'notes') return Boolean(s?.note?.trim());
      if (activeFilter === 'unselected') return !s?.photobook && !s?.portrait;
      return true;
    });
  }, [photos, selections, activeFilter]);

  // Lightbox keyboard navigation
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : displayedPhotos.length - 1));
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev !== null && prev < displayedPhotos.length - 1 ? prev + 1 : 0));
      } else if (e.key.toLowerCase() === 'h') {
        const photo = displayedPhotos[lightboxIndex];
        if (photo) handleToggleSelection(photo.fileName, 'photobook', selections[photo.fileName]?.photobook);
      } else if (e.key.toLowerCase() === 'p') {
        const photo = displayedPhotos[lightboxIndex];
        if (photo) handleToggleSelection(photo.fileName, 'portrait', selections[photo.fileName]?.portrait);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, displayedPhotos, selections]);

  // 1. INITIAL LOADING SCREEN
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        <p className="text-xs uppercase tracking-widest text-stone-400 font-light font-mono">
          Đang nạp cổng chọn ảnh cưới...
        </p>
      </div>
    );
  }

  // 2. PIN LOCK SCREEN (UNAUTHENTICATED)
  if (!authenticated) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
        {/* Ambient Blur Backdrop */}
        {gallery?.coverImage && (
          <img
            src={gallery.coverImage}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover blur-3xl scale-110 opacity-30 select-none pointer-events-none"
          />
        )}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

        {/* Card Content */}
        <div className="relative z-10 w-full max-w-md bg-stone-900/90 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center animate-fadeIn">
          {/* Studio Brand */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-[0.3em] text-amber-300">
              {studio?.siteName || 'PlusMoments Wedding Studio'}
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-light text-white tracking-wide">
              {gallery?.coupleName}
            </h1>
            {gallery?.shootDate && (
              <p className="text-xs text-stone-400 font-light flex items-center justify-center gap-1.5 pt-0.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{gallery.shootDate}</span>
              </p>
            )}
          </div>

          {/* Lock Icon */}
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h2 className="font-serif text-base text-stone-200">Nhập Mã PIN Để Xem & Chọn Ảnh</h2>
            <p className="text-xs text-stone-400 font-light">
              Mã bảo mật gồm 6 số đã được ekip gửi riêng qua Zalo cho hai bạn.
            </p>
          </div>

          {/* PIN Input Form */}
          <form onSubmit={handleVerifyPin} className="space-y-4">
            {pinError && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{pinError}</span>
              </div>
            )}

            <div>
              <input
                type="password"
                inputMode="numeric"
                maxLength={8}
                placeholder="••••••"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                autoFocus
                className="w-full text-center py-3 text-2xl tracking-[0.5em] font-mono font-bold bg-stone-950/80 border border-stone-700 rounded-2xl text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all placeholder:text-stone-600 placeholder:tracking-normal"
              />
            </div>

            <button
              type="submit"
              disabled={isVerifyingPin}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 text-xs font-bold uppercase tracking-wider transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isVerifyingPin ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                  <span>Đang Mở Khóa...</span>
                </>
              ) : (
                <>
                  <span>Mở Khóa Album Cưới</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Support Hotline / Zalo Footer */}
          {studio?.hotline && (
            <div className="pt-4 border-t border-stone-800/80 text-[11px] text-stone-400 flex items-center justify-center gap-3">
              <span>Cần hỗ trợ mã PIN?</span>
              <a
                href={`tel:${studio.hotline}`}
                className="text-amber-300 hover:underline flex items-center gap-1 font-mono"
              >
                <Phone className="w-3 h-3" />
                <span>{studio.hotline}</span>
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. MAIN AUTHENTICATED PROOFING GALLERY VIEW
  const isSubmitted = gallery?.status === 'SUBMITTED';
  const isCompleted = gallery?.status === 'COMPLETED';

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* FLOATING TOAST */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[9999] px-4 py-3 bg-stone-900 text-amber-300 text-xs rounded-2xl shadow-2xl border border-amber-500/40 flex items-center gap-2 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP STICKY HEADER & PROGRESS CONTROLS */}
      <header className="sticky top-0 z-40 bg-stone-950/85 backdrop-blur-md border-b border-stone-800 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Left: Branding & Couple Name */}
          <div className="flex items-center justify-between md:justify-start gap-4">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-amber-300 block">
                {studio?.siteName || 'PlusMoments Proofing'}
              </span>
              <h1 className="font-serif text-lg sm:text-xl font-light text-white tracking-wide truncate max-w-[240px] sm:max-w-md">
                {gallery?.coupleName}
              </h1>
            </div>

            {/* Status Pill */}
            {isSubmitted && (
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30 flex items-center gap-1.5 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Đã Gửi Chốt</span>
              </span>
            )}
          </div>

          {/* Center / Right: Progress Counters & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Photobook Counter */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-xs">
              <Heart className={`w-3.5 h-3.5 ${photobookSelectedCount > 0 ? 'fill-rose-500 text-rose-500' : 'text-stone-500'}`} />
              <span className="text-stone-400 hidden sm:inline">Photobook:</span>
              <span className={`font-mono font-bold ${photobookSelectedCount >= (gallery?.maxPhotobook || 40) ? 'text-emerald-400' : 'text-white'}`}>
                {photobookSelectedCount}/{gallery?.maxPhotobook}
              </span>
            </div>

            {/* Portrait Counter */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-xs">
              <ImageIcon className={`w-3.5 h-3.5 ${portraitSelectedCount > 0 ? 'text-amber-400' : 'text-stone-500'}`} />
              <span className="text-stone-400 hidden sm:inline">Ảnh Cổng:</span>
              <span className={`font-mono font-bold ${portraitSelectedCount >= (gallery?.maxPortrait || 2) ? 'text-emerald-400' : 'text-white'}`}>
                {portraitSelectedCount}/{gallery?.maxPortrait}
              </span>
            </div>

            {/* Download Button (If enabled) */}
            {gallery?.allowDownload && (
              <a
                href={`/api/proofing/${code}/download?type=selected`}
                className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-medium border border-stone-800 flex items-center gap-1.5 transition-colors"
                title="Tải về máy tính bộ ảnh hai bạn đã chọn"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tải Ảnh Đã Chọn</span>
              </a>
            )}

            {/* Final Submit Button */}
            {!isSubmitted && (
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(true)}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer ml-auto md:ml-0"
              >
                <Send className="w-3.5 h-3.5 text-stone-950" />
                <span>Gửi Chốt Danh Sách</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* FILTER TABS & INSTRUCTION BAR */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 pb-2 space-y-4">
        {/* Congratulatory Alert if already submitted */}
        {isSubmitted && (
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-3 text-xs text-emerald-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-emerald-300">
                Ekip hậu kỳ PlusMoments đã tiếp nhận danh sách chọn ảnh của hai bạn!
              </p>
              <p className="text-emerald-400/90 font-light leading-relaxed">
                Đã khóa danh sách với {photobookSelectedCount} ảnh Photobook và {portraitSelectedCount} ảnh Cổng.
                Nếu cần điều chỉnh thêm, hai bạn vui lòng liên hệ Hotline/Zalo studio để ekip hỗ trợ mở lại nhé.
              </p>
            </div>
          </div>
        )}

        {/* View Filter Chips */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-stone-800/80">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-white text-stone-950 font-bold shadow-sm'
                  : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
              }`}
            >
              Tất Cả ({photos.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('photobook')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'photobook'
                  ? 'bg-rose-600 text-white font-bold shadow-sm'
                  : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
              }`}
            >
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              <span>In Photobook ({photobookSelectedCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('portrait')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'portrait'
                  ? 'bg-amber-600 text-white font-bold shadow-sm'
                  : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>Ảnh Cổng ({portraitSelectedCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('notes')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'notes'
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
              <span>Có Ghi Chú ({notesSelectedCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('unselected')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeFilter === 'unselected'
                  ? 'bg-stone-800 text-white font-bold'
                  : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
              }`}
            >
              Chưa Chọn ({photos.length - (photobookSelectedCount + portraitSelectedCount)})
            </button>
          </div>

          <div className="text-[11px] text-stone-500 hidden lg:block font-light">
            💡 Mẹo: Nhấp vào ảnh để xem nét 2K • Dùng phím <strong>H</strong> (Thả tim) / <strong>P</strong> (Ảnh Cổng)
          </div>
        </div>
      </div>

      {/* PHOTO MASONRY / GRID VIEW */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 flex-1">
        {displayedPhotos.length === 0 ? (
          <div className="py-24 text-center text-stone-500 space-y-3">
            <ImageIcon className="w-12 h-12 mx-auto text-stone-700" />
            <p className="text-sm">Chưa có ảnh nào trong phân loại này.</p>
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className="px-4 py-2 rounded-xl bg-stone-900 text-stone-300 text-xs border border-stone-800 hover:bg-stone-800"
            >
              Xem lại tất cả ảnh
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {displayedPhotos.map((photo, idx) => {
              const sel = selections[photo.fileName];
              const isPhotobook = Boolean(sel?.photobook);
              const isPortrait = Boolean(sel?.portrait);
              const hasNote = Boolean(sel?.note?.trim());

              return (
                <div
                  key={photo.fileName}
                  className={`group relative rounded-2xl overflow-hidden bg-stone-900 border transition-all flex flex-col justify-between ${
                    isPhotobook
                      ? 'border-rose-500/80 ring-2 ring-rose-500/30'
                      : isPortrait
                      ? 'border-amber-500/80 ring-2 ring-amber-500/30'
                      : 'border-stone-800/80 hover:border-stone-700'
                  }`}
                >
                  {/* Photo Container */}
                  <div
                    onClick={() => setLightboxIndex(idx)}
                    className="relative aspect-[3/4] w-full overflow-hidden cursor-zoom-in bg-stone-950 flex items-center justify-center"
                  >
                    <img
                      src={photo.thumbUrl}
                      alt={photo.fileName}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 select-none"
                      loading="lazy"
                    />

                    {/* Gradient Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                    {/* Top Status Icons */}
                    <div className="absolute top-2 left-2 z-10 flex flex-col gap-1.5">
                      {isPhotobook && (
                        <span className="p-1.5 rounded-full bg-rose-600 text-white shadow-lg flex items-center justify-center">
                          <Heart className="w-3.5 h-3.5 fill-white text-white" />
                        </span>
                      )}
                      {isPortrait && (
                        <span className="p-1.5 rounded-full bg-amber-500 text-stone-950 shadow-lg flex items-center justify-center font-bold">
                          <ImageIcon className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>

                    {/* Center Zoom Hint (Hover) */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <span className="p-2.5 rounded-full bg-black/60 backdrop-blur-md text-white shadow-xl">
                        <Maximize2 className="w-4 h-4" />
                      </span>
                    </div>
                  </div>

                  {/* Action Bar Beneath Card */}
                  <div className="p-2 sm:p-2.5 bg-stone-950/90 border-t border-stone-800/80 space-y-1.5">
                    {/* Filename & Note indicator */}
                    <div className="flex items-center justify-between text-[10px] font-mono text-stone-400">
                      <span className="truncate pr-1 font-light" title={photo.fileName}>
                        {photo.fileName}
                      </span>
                      {hasNote && (
                        <span className="text-blue-400 font-sans text-[10px] font-semibold flex items-center gap-0.5">
                          💬 Đã ghi chú
                        </span>
                      )}
                    </div>

                    {/* Buttons: Heart, Portrait, Note, Download */}
                    <div className="grid grid-cols-3 gap-1 pt-0.5">
                      {/* 1. Photobook Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSelection(photo.fileName, 'photobook', isPhotobook);
                        }}
                        className={`py-1 px-1.5 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1 transition-all cursor-pointer ${
                          isPhotobook
                            ? 'bg-rose-600 text-white font-bold shadow-xs'
                            : 'bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white border border-stone-800'
                        }`}
                        title="Chọn in vào cuốn Photobook"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isPhotobook ? 'fill-white text-white' : ''}`} />
                        <span className="text-[10px]">Cuốn</span>
                      </button>

                      {/* 2. Portrait Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSelection(photo.fileName, 'portrait', isPortrait);
                        }}
                        className={`py-1 px-1.5 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1 transition-all cursor-pointer ${
                          isPortrait
                            ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                            : 'bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white border border-stone-800'
                        }`}
                        title="Chọn làm Ảnh Cổng / Khung Lớn"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span className="text-[10px]">Cổng</span>
                      </button>

                      {/* 3. Note Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingNotePhoto(photo);
                          setNoteText(sel?.note || '');
                        }}
                        className={`py-1 px-1.5 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1 transition-all cursor-pointer ${
                          hasNote
                            ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50'
                            : 'bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white border border-stone-800'
                        }`}
                        title="Ghi chú chỉnh sửa riêng cho tấm này"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="text-[10px]">Sửa</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-stone-800/80 bg-stone-950/60 py-6 px-4 text-center text-xs text-stone-500 space-y-2 mt-12">
        <p className="font-serif tracking-widest text-stone-400 uppercase">
          {studio?.siteName || 'PlusMoments Wedding Pictures & Films'}
        </p>
        <p className="text-[11px] text-stone-600 font-light">
          Bảo mật thông tin hình ảnh chuẩn riêng tư • Cần tư vấn hỗ trợ kỹ thuật gọi ngay Hotline:{' '}
          <a href={`tel:${studio?.hotline}`} className="text-amber-400 hover:underline font-mono">
            {studio?.hotline}
          </a>
        </p>
      </footer>

      {/* NOTE MODAL */}
      {editingNotePhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setEditingNotePhoto(null)}
        >
          <div
            className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-300">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <span>Ghi Chú Chỉnh Sửa Cho Tấm Ảnh</span>
              </div>
              <button
                type="button"
                onClick={() => setEditingNotePhoto(null)}
                className="text-stone-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 p-2 bg-stone-950 rounded-xl border border-stone-800">
              <img
                src={editingNotePhoto.thumbUrl}
                alt={editingNotePhoto.fileName}
                className="w-12 h-12 object-cover rounded-lg shrink-0"
              />
              <span className="font-mono text-xs text-stone-300 truncate">
                {editingNotePhoto.fileName}
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-stone-400 font-light block">
                Mong muốn chỉnh sửa riêng (VD: &ldquo;Bóp gọn bắp tay&rdquo;, &ldquo;Làm sáng tông da&rdquo;, &ldquo;Xóa người phía sau&rdquo;):
              </label>
              <textarea
                rows={3}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Nhập ghi chú cho ekip hậu kỳ..."
                autoFocus
                className="w-full p-3 text-xs bg-stone-950 border border-stone-800 rounded-xl text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 leading-relaxed font-light"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingNotePhoto(null)}
                className="px-4 py-2 rounded-xl text-xs text-stone-400 hover:text-white"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveNote}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold uppercase tracking-wider"
              >
                Lưu Ghi Chú
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FINAL SUBMIT CONFIRMATION MODAL */}
      {isSubmitModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsSubmitModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-amber-400" />
                <h3 className="font-serif text-lg text-white">Xác Nhận Chốt Danh Sách Ảnh In</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Summary Counters */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800/60 space-y-1">
                <span className="text-[11px] text-rose-300 uppercase tracking-wider block font-semibold flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
                  Ảnh In Photobook
                </span>
                <span className="font-mono text-xl font-bold text-white">
                  {photobookSelectedCount} / {gallery?.maxPhotobook} ảnh
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-800/60 space-y-1">
                <span className="text-[11px] text-amber-300 uppercase tracking-wider block font-semibold flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                  Ảnh Cổng / Khung Lớn
                </span>
                <span className="font-mono text-xl font-bold text-white">
                  {portraitSelectedCount} / {gallery?.maxPortrait} ảnh
                </span>
              </div>
            </div>

            {notesSelectedCount > 0 && (
              <p className="text-xs text-blue-300 bg-blue-950/50 border border-blue-800/60 p-2.5 rounded-xl">
                💬 Đã kèm <strong>{notesSelectedCount}</strong> ghi chú chỉnh sửa chi tiết cho từng ảnh.
              </p>
            )}

            <div className="space-y-1.5">
              <label className="text-xs text-stone-300 font-light block">
                Lời nhắn chung hoặc mong muốn gửi tới ekip hậu kỳ (Tùy chọn):
              </label>
              <textarea
                rows={3}
                value={generalNote}
                onChange={(e) => setGeneralNote(e.target.value)}
                placeholder="VD: Nhờ ekip thiết kế dàn trang theo tông ấm điện ảnh giúp hai bạn..."
                className="w-full p-3 text-xs bg-stone-950 border border-stone-800 rounded-xl text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 leading-relaxed font-light"
              />
            </div>

            <p className="text-[11px] text-stone-400 font-light leading-relaxed">
              Sau khi bấm xác nhận, danh sách sẽ được khóa và chuyển ngay sang phòng Hậu kỳ PlusMoments để bắt đầu xử lý màu sắc và dàn trang in ấn.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs text-stone-400 hover:text-white"
              >
                Để xem lại
              </button>
              <button
                type="button"
                disabled={isSubmittingFinal}
                onClick={handleSubmitFinal}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
              >
                {isSubmittingFinal ? (
                  <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                ) : (
                  <Check className="w-4 h-4 text-stone-950" />
                )}
                <span>Xác Nhận & Gửi Studio</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX VIEWER */}
      {lightboxIndex !== null && displayedPhotos[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 select-none animate-fadeIn"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Top Bar: Title, Counter & Action Buttons */}
          <div
            className="w-full flex items-center justify-between text-white/90 z-[100000] px-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase font-mono px-2.5 py-1 bg-white/10 rounded-full text-amber-300">
                {lightboxIndex + 1} / {displayedPhotos.length}
              </span>
              <p className="font-mono text-xs text-stone-300 truncate max-w-[150px] sm:max-w-md">
                {displayedPhotos[lightboxIndex].fileName}
              </p>
            </div>

            {/* Lightbox Quick Actions */}
            {(() => {
              const currentPhoto = displayedPhotos[lightboxIndex];
              const sel = selections[currentPhoto.fileName];
              const isPb = Boolean(sel?.photobook);
              const isPt = Boolean(sel?.portrait);

              return (
                <div className="flex items-center gap-2">
                  {/* Toggle Photobook */}
                  <button
                    type="button"
                    onClick={() => handleToggleSelection(currentPhoto.fileName, 'photobook', isPb)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                      isPb
                        ? 'bg-rose-600 text-white font-bold'
                        : 'bg-white/15 text-stone-200 hover:bg-white/25'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isPb ? 'fill-white text-white' : ''}`} />
                    <span className="hidden sm:inline">Photobook (H)</span>
                  </button>

                  {/* Toggle Portrait */}
                  <button
                    type="button"
                    onClick={() => handleToggleSelection(currentPhoto.fileName, 'portrait', isPt)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                      isPt
                        ? 'bg-amber-500 text-stone-950 font-bold'
                        : 'bg-white/15 text-stone-200 hover:bg-white/25'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Ảnh Cổng (P)</span>
                  </button>

                  {/* Single Download */}
                  {gallery?.allowDownload && (
                    <a
                      href={`/api/proofing/${code}/download?file=${encodeURIComponent(currentPhoto.fileName)}`}
                      download
                      className="p-2 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors"
                      title="Tải ảnh gốc 2K"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => setLightboxIndex(null)}
                    className="p-2 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors"
                    aria-label="Đóng (ESC)"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })()}
          </div>

          {/* Center Image with Prev / Next */}
          <div
            className="relative flex-1 w-full max-w-6xl mx-auto flex items-center justify-center my-auto p-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Prev */}
            {displayedPhotos.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : displayedPhotos.length - 1))
                }
                className="absolute left-2 sm:left-4 z-[100001] p-3 sm:p-3.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 backdrop-blur-sm transition-all hover:scale-110 cursor-pointer shadow-2xl active:scale-95"
                aria-label="Ảnh trước (Mũi tên trái)"
              >
                <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
              </button>
            )}

            {/* High-res Image */}
            <img
              src={displayedPhotos[lightboxIndex].url}
              alt={displayedPhotos[lightboxIndex].fileName}
              className="max-w-full max-h-[82vh] object-contain drop-shadow-2xl select-none rounded-lg"
              loading="eager"
            />

            {/* Next */}
            {displayedPhotos.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setLightboxIndex((prev) => (prev !== null && prev < displayedPhotos.length - 1 ? prev + 1 : 0))
                }
                className="absolute right-2 sm:right-4 z-[100001] p-3 sm:p-3.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 backdrop-blur-sm transition-all hover:scale-110 cursor-pointer shadow-2xl active:scale-95"
                aria-label="Ảnh tiếp theo (Mũi tên phải)"
              >
                <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails */}
          {displayedPhotos.length > 1 && (
            <div
              className="w-full max-w-3xl mx-auto flex items-center justify-center gap-2 overflow-x-auto py-2 z-[100000] px-4 no-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              {displayedPhotos.map((p, i) => (
                <button
                  key={p.fileName}
                  type="button"
                  onClick={() => setLightboxIndex(i)}
                  className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    lightboxIndex === i
                      ? 'border-amber-400 ring-2 ring-amber-400/60 scale-105 shadow-xl'
                      : 'border-white/20 opacity-50 hover:opacity-100 hover:border-white/60'
                  }`}
                >
                  <img src={p.smallUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
