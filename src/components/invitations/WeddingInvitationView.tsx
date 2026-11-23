'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Heart,
  Send,
  Navigation,
  Music,
  Volume2,
  VolumeX,
  QrCode,
  Sparkles,
  Share2,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { ProgressiveImage } from '@/components/ui/ProgressiveImage';
import { INVITATION_TEMPLATES, InvitationGalleryImage } from '@/lib/invitations/templates';

export interface InvitationViewData {
  id?: string;
  slug: string;
  templateId: string;
  themeColor: string;
  groomName: string;
  brideName: string;
  groomParents?: string | null;
  brideParents?: string | null;
  ceremonyDate: string | Date;
  ceremonyTimeText?: string | null;
  venueName: string;
  venueAddress: string;
  googleMapsUrl?: string | null;
  storyTitle?: string | null;
  storyText?: string | null;
  coverImage: string;
  galleryImages: InvitationGalleryImage[];
  musicPreset?: string;
  bankQrImage?: string | null;
  bankInfoText?: string | null;
  rsvps?: Array<{
    id: string;
    guestName: string;
    attendance: string;
    guestCount: number;
    side: string;
    wishMessage?: string | null;
    createdAt: string | Date;
  }>;
}

interface WeddingInvitationViewProps {
  data: InvitationViewData;
  isPreview?: boolean;
}

export function WeddingInvitationView({ data, isPreview = false }: WeddingInvitationViewProps) {
  const [isOpenEnvelope, setIsOpenEnvelope] = useState<boolean>(isPreview);
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);

  // RSVP Form States
  const [guestName, setGuestName] = useState('');
  const [attendance, setAttendance] = useState<'ATTENDING' | 'DECLINED'>('ATTENDING');
  const [guestCount, setGuestCount] = useState<number>(1);
  const [side, setSide] = useState<'GROOM' | 'BRIDE' | 'BOTH'>('BOTH');
  const [wishMessage, setWishMessage] = useState('');
  const [isSubmittingRsvp, setIsSubmittingRsvp] = useState(false);
  const [rsvpSuccessMsg, setRsvpSuccessMsg] = useState('');
  const [rsvpsList, setRsvpsList] = useState(data.rsvps || []);

  const templateConfig = INVITATION_TEMPLATES[data.templateId] || INVITATION_TEMPLATES['timeless-ivory'];
  const themeColor = data.themeColor || templateConfig.defaultThemeColor;
  const isDarkTemplate = data.templateId === 'cinematic-noir';

  // Countdown timer logic
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const target = new Date(data.ceremonyDate).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [data.ceremonyDate]);

  // Gallery partition into pairs or single display (no gap pairing)
  const galleryItems = Array.isArray(data.galleryImages) ? data.galleryImages : [];

  const handleOpenEnvelope = () => {
    setIsOpenEnvelope(true);
    setIsMusicPlaying(true);
  };

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;

    if (isPreview) {
      const mockRsvp = {
        id: `mock-${Date.now()}`,
        guestName: guestName.trim(),
        attendance,
        guestCount,
        side,
        wishMessage: wishMessage.trim() || undefined,
        createdAt: new Date(),
      };
      setRsvpsList([mockRsvp, ...rsvpsList]);
      setRsvpSuccessMsg('Gửi xác nhận tham dự & lời chúc thành công (Bản xem trước)!');
      setGuestName('');
      setWishMessage('');
      return;
    }

    try {
      setIsSubmittingRsvp(true);
      setRsvpSuccessMsg('');
      const res = await fetch(`/api/invitations/${data.slug}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName,
          attendance,
          guestCount,
          side,
          wishMessage,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setRsvpSuccessMsg('Gửi xác nhận tham dự & lời chúc thành công! Cảm ơn bạn rất nhiều.');
        setRsvpsList([result.rsvp, ...rsvpsList]);
        setGuestName('');
        setWishMessage('');
      } else {
        alert(result.error || 'Có lỗi xảy ra khi gửi RSVP');
      }
    } catch (err: any) {
      alert('Không thể kết nối đến máy chủ: ' + err.message);
    } finally {
      setIsSubmittingRsvp(false);
    }
  };

  return (
    <div
      className={`relative min-h-screen ${
        isDarkTemplate ? 'bg-[#121212] text-stone-100' : 'bg-[#FAF8F5] text-stone-900'
      } font-sans selection:bg-[#8C6D46] selection:text-white pb-24`}
    >
      {/* ------------------------------------------------------------- */}
      {/* 1. INTERACTIVE LUXURY ENVELOPE REVEAL (Above the Fold on Mobile) */}
      {/* ------------------------------------------------------------- */}
      {!isOpenEnvelope && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-all duration-700">
          <div
            onClick={handleOpenEnvelope}
            className="w-full max-w-sm cursor-pointer transform hover:scale-[1.02] active:scale-95 transition-all duration-300"
          >
            {/* The Envelope Body */}
            <div
              className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/20 p-8 text-center"
              style={{
                backgroundColor: isDarkTemplate ? '#1E1E20' : '#FFFDF9',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
              }}
            >
              <div className="text-[11px] font-mono tracking-[0.25em] uppercase text-[#8C6D46] mb-3">
                Wedding Invitation
              </div>

              <div className="font-serif text-2xl sm:text-3xl font-normal leading-snug tracking-tight text-stone-900 dark:text-stone-100 mb-2">
                {data.groomName} <br />
                <span className="text-[#8C6D46] italic font-light">&</span> <br />
                {data.brideName}
              </div>

              <div className="text-xs text-stone-500 font-serif tracking-widest uppercase mt-4 mb-8">
                {data.ceremonyTimeText || new Date(data.ceremonyDate).toLocaleDateString('vi-VN')}
              </div>

              {/* Gold Wax Seal Button */}
              <div className="relative inline-flex items-center justify-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg transform transition-transform hover:rotate-12"
                  style={{
                    background: 'radial-gradient(circle, #D4AF37 0%, #8C6D46 100%)',
                    boxShadow: '0 4px 15px rgba(140, 109, 70, 0.4)',
                  }}
                >
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
              </div>

              <div className="mt-4 text-xs font-medium text-stone-500 tracking-wider animate-pulse">
                Chạm để mở phong bì
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Audio Toggle Button */}
      <button
        type="button"
        onClick={() => setIsMusicPlaying(!isMusicPlaying)}
        className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-white/90 dark:bg-stone-800/90 text-stone-800 dark:text-stone-200 shadow-lg border border-stone-200/80 dark:border-stone-700/80 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        title={isMusicPlaying ? 'Tắt nhạc nền' : 'Bật nhạc nền'}
      >
        {isMusicPlaying ? (
          <Volume2 className="w-5 h-5 text-[#8C6D46] animate-pulse" />
        ) : (
          <VolumeX className="w-5 h-5 text-stone-400" />
        )}
      </button>

      {/* ------------------------------------------------------------- */}
      {/* 2. HERO COVER SECTION (Editorial Full View) */}
      {/* ------------------------------------------------------------- */}
      <section className="relative w-full h-[90vh] sm:h-screen min-h-[580px] max-h-[960px] overflow-hidden">
        {data.coverImage ? (
          <ProgressiveImage
            src={data.coverImage}
            alt={`${data.groomName} & ${data.brideName}`}
            priority={true}
            className="w-full h-full"
            imageClassName="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-[#EFECE6] flex items-center justify-center text-stone-400">
            <span>Ảnh bìa hôn lễ</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/30 flex flex-col items-center justify-end text-center p-6 pb-16 text-white">
          <span className="text-xs sm:text-sm font-mono tracking-[0.25em] uppercase text-amber-200/90 mb-3">
            Save The Date
          </span>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-normal tracking-tight text-white mb-3">
            {data.groomName} <span className="font-light italic text-[#D4AF37]">&</span> {data.brideName}
          </h1>

          <p className="text-sm sm:text-base text-stone-200 font-serif tracking-widest uppercase mb-6">
            {data.ceremonyTimeText || new Date(data.ceremonyDate).toLocaleDateString('vi-VN')}
          </p>

          <ChevronDown className="w-6 h-6 text-white/60 animate-bounce" />
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 3. WEDDING INVITATION DETAILS & FAMILY */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-2xl mx-auto px-6 py-16 text-center">
        <div className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#8C6D46] mb-3">
          Trân Trọng Kính Mời
        </div>

        <h2 className="text-2xl sm:text-3xl font-serif font-normal text-stone-900 dark:text-stone-100 mb-6">
          Lễ Thành Hôn
        </h2>

        {/* Parents Names */}
        {(data.groomParents || data.brideParents) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-8 py-6 border-y border-stone-200 dark:border-stone-800 text-xs sm:text-sm leading-relaxed">
            <div>
              <div className="font-serif font-semibold text-stone-800 dark:text-stone-200 uppercase tracking-wider mb-1">
                Nhà Trai
              </div>
              <div className="text-stone-600 dark:text-stone-400 whitespace-pre-line">
                {data.groomParents || 'Ông Bà Thân Sinh'}
              </div>
            </div>
            <div>
              <div className="font-serif font-semibold text-stone-800 dark:text-stone-200 uppercase tracking-wider mb-1">
                Nhà Gái
              </div>
              <div className="text-stone-600 dark:text-stone-400 whitespace-pre-line">
                {data.brideParents || 'Ông Bà Thân Sinh'}
              </div>
            </div>
          </div>
        )}

        {/* Story Text */}
        {data.storyText && (
          <div className="my-10 px-4">
            {data.storyTitle && (
              <h3 className="font-serif text-lg text-stone-900 dark:text-stone-100 italic mb-3">
                &ldquo;{data.storyTitle}&rdquo;
              </h3>
            )}
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-light leading-relaxed whitespace-pre-line">
              {data.storyText}
            </p>
          </div>
        )}

        {/* Countdown Timer */}
        <div className="my-12 p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs">
          <div className="text-xs font-mono uppercase tracking-widest text-[#8C6D46] mb-4">
            Đếm Ngược Đến Ngày Chung Đôi
          </div>
          <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-sm mx-auto text-center">
            <div className="p-2 sm:p-3 rounded-xl bg-stone-50 dark:bg-stone-800">
              <div className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
                {timeLeft.days}
              </div>
              <div className="text-[10px] text-stone-500 uppercase mt-0.5">Ngày</div>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-stone-50 dark:bg-stone-800">
              <div className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
                {timeLeft.hours}
              </div>
              <div className="text-[10px] text-stone-500 uppercase mt-0.5">Giờ</div>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-stone-50 dark:bg-stone-800">
              <div className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
                {timeLeft.minutes}
              </div>
              <div className="text-[10px] text-stone-500 uppercase mt-0.5">Phút</div>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-stone-50 dark:bg-stone-800">
              <div className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
                {timeLeft.seconds}
              </div>
              <div className="text-[10px] text-stone-500 uppercase mt-0.5">Giây</div>
            </div>
          </div>
        </div>

        {/* Venue Information & Google Maps Button */}
        <div className="my-10 p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-center">
          <Clock className="w-5 h-5 text-[#8C6D46] mx-auto mb-2" />
          <div className="font-serif text-lg font-medium text-stone-900 dark:text-stone-100">
            {data.ceremonyTimeText || new Date(data.ceremonyDate).toLocaleDateString('vi-VN')}
          </div>

          <div className="mt-4 pt-4 border-t border-stone-100 dark:border-stone-800">
            <MapPin className="w-5 h-5 text-[#8C6D46] mx-auto mb-2" />
            <div className="font-serif text-base font-semibold text-stone-900 dark:text-stone-100">
              {data.venueName}
            </div>
            <div className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-md mx-auto">
              {data.venueAddress}
            </div>

            {data.googleMapsUrl && (
              <a
                href={data.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 h-10 px-5 rounded-full bg-[#8C6D46] hover:bg-[#725735] text-white text-xs font-medium tracking-wide uppercase transition-colors shadow-xs"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Chỉ Đường Google Maps</span>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 4. WEDDING PHOTO GALLERY (Row-Balanced Editorial Layout) */}
      {/* ------------------------------------------------------------- */}
      {galleryItems.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <div className="text-center mb-8">
            <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#8C6D46]">
              Khoảnh Khắc Hạnh Phúc
            </span>
            <h3 className="text-2xl font-serif text-stone-900 dark:text-stone-100 mt-1">
              Bộ Ảnh Cưới Của Chúng Mình
            </h3>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {galleryItems.map((img, idx) => {
              const isPortrait = img.orientation === 'portrait';
              return (
                <div
                  key={img.id || idx}
                  className="rounded-xl overflow-hidden shadow-xs border border-stone-200/60 dark:border-stone-800"
                >
                  <ProgressiveImage
                    src={img.url}
                    alt={img.caption || `Ảnh cưới ${data.groomName} & ${data.brideName}`}
                    aspectRatio={isPortrait ? '3/4' : '3/2'}
                    orientation={isPortrait ? 'portrait' : 'landscape'}
                    className="w-full"
                  />
                  {img.caption && (
                    <div className="p-3 text-center text-xs text-stone-500 italic bg-white dark:bg-stone-900">
                      {img.caption}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. WEDDING GIFT QR & BANK INFO */}
      {/* ------------------------------------------------------------- */}
      {(data.bankQrImage || data.bankInfoText) && (
        <section className="max-w-xl mx-auto px-6 py-12 text-center">
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs">
            <QrCode className="w-7 h-7 text-[#8C6D46] mx-auto mb-2" />
            <h4 className="font-serif text-xl text-stone-900 dark:text-stone-100">
              Hộp Mừng Cưới
            </h4>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              Sự hiện diện và lời chúc phúc của quý khách là món quà quý giá nhất dành cho chúng mình.
            </p>

            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="mt-5 inline-flex items-center gap-2 h-10 px-5 rounded-full border border-[#8C6D46] text-[#8C6D46] hover:bg-[#8C6D46]/10 text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              <QrCode className="w-4 h-4" />
              <span>Gửi Mừng Cưới Chúc Phúc</span>
            </button>
          </div>
        </section>
      )}

      {/* Modal QR Code */}
      {showQrModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-2xl p-6 text-center shadow-xl border border-stone-200 dark:border-stone-800"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="font-serif text-lg text-stone-900 dark:text-stone-100 mb-4">
              Mã QR Mừng Cưới
            </h4>

            {data.bankQrImage && (
              <div className="w-56 h-56 mx-auto rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800 mb-4 bg-white p-2">
                <img
                  src={data.bankQrImage}
                  alt="Mã QR Mừng Cưới"
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            {data.bankInfoText && (
              <div className="text-xs text-stone-700 dark:text-stone-300 whitespace-pre-line bg-stone-50 dark:bg-stone-800 p-3 rounded-xl mb-4 font-mono">
                {data.bankInfoText}
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full h-10 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 text-xs font-medium transition-colors"
            >
              Đóng Cửa Sổ
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. RSVP & GUESTBOOK WISHES */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-xl mx-auto px-6 py-12">
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm">
          <div className="text-center mb-6">
            <Heart className="w-6 h-6 text-[#8C6D46] mx-auto mb-2 fill-[#8C6D46]/20" />
            <h3 className="font-serif text-2xl text-stone-900 dark:text-stone-100">
              Xác Nhận Tham Dự & Lời Chúc
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Để gia đình chuẩn bị chu đáo nhất, xin vui lòng gửi phản hồi trước ngày cưới.
            </p>
          </div>

          {rsvpSuccessMsg ? (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
              <div className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                {rsvpSuccessMsg}
              </div>
            </div>
          ) : (
            <form onSubmit={handleRsvpSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Họ tên của bạn / gia đình <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Ví dụ: Anh Tuấn & Chị Lan"
                  className="w-full h-11 px-3.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Tham dự hôn lễ?
                  </label>
                  <select
                    value={attendance}
                    onChange={(e: any) => setAttendance(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                  >
                    <option value="ATTENDING">Sẽ tham dự</option>
                    <option value="DECLINED">Rất tiếc không thể đến</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Số người tham dự
                  </label>
                  <select
                    value={guestCount}
                    disabled={attendance === 'DECLINED'}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full h-11 px-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#8C6D46] disabled:opacity-50"
                  >
                    <option value={1}>1 người</option>
                    <option value={2}>2 người</option>
                    <option value={3}>3 người</option>
                    <option value={4}>4 người (Gia đình)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Khách mời của ai?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSide('GROOM')}
                    className={`h-9 rounded-lg text-xs font-medium border transition-colors ${
                      side === 'GROOM'
                        ? 'bg-[#8C6D46] text-white border-[#8C6D46]'
                        : 'border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    Nhà Trai
                  </button>
                  <button
                    type="button"
                    onClick={() => setSide('BRIDE')}
                    className={`h-9 rounded-lg text-xs font-medium border transition-colors ${
                      side === 'BRIDE'
                        ? 'bg-[#8C6D46] text-white border-[#8C6D46]'
                        : 'border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    Nhà Gái
                  </button>
                  <button
                    type="button"
                    onClick={() => setSide('BOTH')}
                    className={`h-9 rounded-lg text-xs font-medium border transition-colors ${
                      side === 'BOTH'
                        ? 'bg-[#8C6D46] text-white border-[#8C6D46]'
                        : 'border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    Cả Hai
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Lời chúc gửi đến Cô Dâu & Chú Rể
                </label>
                <textarea
                  rows={3}
                  value={wishMessage}
                  onChange={(e) => setWishMessage(e.target.value)}
                  placeholder="Chúc hai bạn trăm năm hạnh phúc, đầu bạc răng long..."
                  className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingRsvp}
                className="w-full h-11 rounded-xl bg-[#8C6D46] hover:bg-[#725735] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmittingRsvp ? 'Đang gửi...' : 'Gửi Xác Nhận & Lời Chúc'}</span>
              </button>
            </form>
          )}

          {/* Guestbook List */}
          {rsvpsList.length > 0 && (
            <div className="mt-8 pt-6 border-t border-stone-100 dark:border-stone-800">
              <div className="text-xs font-semibold text-stone-800 dark:text-stone-200 uppercase tracking-wider mb-3">
                Sổ Lưu Bút ({rsvpsList.length})
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {rsvpsList.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800 text-xs"
                  >
                    <div className="flex items-center justify-between font-medium text-stone-800 dark:text-stone-200">
                      <span>{item.guestName}</span>
                      <span className="text-[10px] text-stone-400">
                        {item.attendance === 'ATTENDING' ? 'Tham dự' : 'Gửi lời chúc'}
                      </span>
                    </div>
                    {item.wishMessage && (
                      <p className="mt-1 text-stone-600 dark:text-stone-400 italic">
                        &ldquo;{item.wishMessage}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="text-center py-6 text-[11px] text-stone-400 uppercase tracking-widest font-mono">
        Designed with Love by PlusMoments Wedding Studio
      </footer>
    </div>
  );
}
