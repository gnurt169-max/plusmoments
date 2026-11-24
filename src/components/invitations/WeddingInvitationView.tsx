'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  MapPin,
  Heart,
  Send,
  Navigation,
  QrCode,
  Sparkles,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { ProgressiveImage } from '@/components/ui/ProgressiveImage';
import { INVITATION_TEMPLATES, InvitationGalleryImage } from '@/lib/invitations/templates';
import { AmbientParticles } from './AmbientParticles';
import { InvitationSectionReveal } from './InvitationSectionReveal';
import { SaveTheDateCalendar } from './SaveTheDateCalendar';
import { AnimatedCountdown } from './AnimatedCountdown';
import { SpinningVinylPlayer } from './SpinningVinylPlayer';
import { CelebrationConfetti } from './CelebrationConfetti';
import { InteractiveGalleryCard } from './InteractiveGalleryCard';
import { CustomerPinModal } from './CustomerPinModal';

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
  // Envelope opening states
  const [isOpenEnvelope, setIsOpenEnvelope] = useState<boolean>(false);
  const [isOpeningFlap, setIsOpeningFlap] = useState<boolean>(false);
  const [isFadingEnvelope, setIsFadingEnvelope] = useState<boolean>(false);

  // Music & Modal states
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);

  // RSVP Form States
  const [guestName, setGuestName] = useState('');
  const [attendance, setAttendance] = useState<'ATTENDING' | 'DECLINED'>('ATTENDING');
  const [guestCount, setGuestCount] = useState<number>(1);
  const [side, setSide] = useState<'GROOM' | 'BRIDE' | 'BOTH'>('BOTH');
  const [wishMessage, setWishMessage] = useState('');
  const [isSubmittingRsvp, setIsSubmittingRsvp] = useState(false);
  const [rsvpSuccessMsg, setRsvpSuccessMsg] = useState('');
  const [rsvpsList, setRsvpsList] = useState(data.rsvps || []);
  const [newlyAddedRsvpId, setNewlyAddedRsvpId] = useState<string | null>(null);

  const templateConfig = INVITATION_TEMPLATES[data.templateId] || INVITATION_TEMPLATES['timeless-ivory'];
  const themeColor = data.themeColor || templateConfig.defaultThemeColor;
  const isDarkTemplate = data.templateId === 'cinematic-noir';

  const galleryItems = Array.isArray(data.galleryImages) ? data.galleryImages : [];

  // Handle 3D Envelope Opening Sequence
  const handleOpenEnvelope = () => {
    if (isOpeningFlap) return;
    setIsOpeningFlap(true);
    setIsMusicPlaying(true);

    // After 750ms 3D flap rotation and card slide, begin fading envelope backdrop
    setTimeout(() => {
      setIsFadingEnvelope(true);
    }, 750);

    // After 1150ms total, unmount envelope overlay
    setTimeout(() => {
      setIsOpenEnvelope(true);
    }, 1150);
  };

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;

    if (isPreview) {
      const mockId = `mock-${Date.now()}`;
      const mockRsvp = {
        id: mockId,
        guestName: guestName.trim(),
        attendance,
        guestCount,
        side,
        wishMessage: wishMessage.trim() || undefined,
        createdAt: new Date(),
      };
      setRsvpsList([mockRsvp, ...rsvpsList]);
      setNewlyAddedRsvpId(mockId);
      setRsvpSuccessMsg('Gửi xác nhận tham dự & lời chúc thành công! Cảm ơn bạn rất nhiều.');
      setShowConfetti(true);
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
        setNewlyAddedRsvpId(result.rsvp.id);
        setShowConfetti(true);
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
      {/* 0. AMBIENT PARTICLES (Luxury Champagne Floating Atmosphere)   */}
      {/* ------------------------------------------------------------- */}
      <AmbientParticles />

      {/* ------------------------------------------------------------- */}
      {/* 0.1 CELEBRATION CONFETTI (Triggered on RSVP Submission)       */}
      {/* ------------------------------------------------------------- */}
      <CelebrationConfetti
        active={showConfetti}
        onComplete={() => setShowConfetti(false)}
      />

      {/* ------------------------------------------------------------- */}
      {/* 1. CINEMATIC 3D ENVELOPE OPENING & METALLIC WAX SEAL          */}
      {/* ------------------------------------------------------------- */}
      {!isOpenEnvelope && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all duration-500 ${
            isFadingEnvelope ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
          }`}
          style={{ perspective: '1200px' }}
        >
          <div
            onClick={handleOpenEnvelope}
            className="w-full max-w-sm cursor-pointer select-none relative"
          >
            {/* 3D Envelope Container */}
            <div
              className="relative w-full rounded-2xl shadow-2xl border border-white/20 p-8 text-center overflow-visible"
              style={{
                backgroundColor: isDarkTemplate ? '#1C1C1F' : '#FFFDF9',
                boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.65)',
              }}
            >
              {/* 3D Triangular Flap that folds up */}
              <div
                className="absolute top-0 left-0 right-0 h-32 origin-top z-30 transition-transform duration-700 ease-in-out pointer-events-none"
                style={{
                  transform: isOpeningFlap ? 'rotateX(180deg)' : 'rotateX(0deg)',
                  transformStyle: 'preserve-3d',
                }}
              >
                <svg viewBox="0 0 400 130" className="w-full h-full drop-shadow-md">
                  <polygon
                    points="0,0 400,0 200,130"
                    fill={isDarkTemplate ? '#26262B' : '#FAF5ED'}
                    stroke={isDarkTemplate ? '#3F3F46' : '#E8DFD0'}
                    strokeWidth="1.5"
                  />
                </svg>
              </div>

              {/* Inner Invitation Card that slides up slightly */}
              <div
                className="relative z-10 transition-transform duration-700 ease-out"
                style={{
                  transform: isOpeningFlap ? 'translateY(-36px)' : 'translateY(0)',
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
              </div>

              {/* Metallic Wax Seal with Shimmer Sweep & Pulse Glow */}
              <div className="relative z-40 inline-flex items-center justify-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center relative overflow-hidden shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95"
                  style={{
                    background: 'radial-gradient(circle, #ECC876 0%, #B88E3E 65%, #7C5C2E 100%)',
                    boxShadow: '0 0 25px rgba(212, 175, 55, 0.65), 0 8px 18px rgba(0, 0, 0, 0.4)',
                  }}
                >
                  {/* Shimmer Light Reflection Sweep */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite_linear] pointer-events-none" />
                  <Sparkles className="w-7 h-7 text-white drop-shadow-md" />
                </div>
              </div>

              <div className="mt-4 text-xs font-medium text-stone-500 tracking-wider animate-pulse relative z-10">
                Chạm để mở phong bì
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1.1 SPINNING VINYL DISC MUSIC PLAYER (Floating Bottom Right)  */}
      {/* ------------------------------------------------------------- */}
      <SpinningVinylPlayer
        isPlaying={isMusicPlaying}
        onToggle={() => setIsMusicPlaying(!isMusicPlaying)}
      />

      {/* ------------------------------------------------------------- */}
      {/* 2. KEN BURNS HERO & MASKED TEXT REVEAL                        */}
      {/* ------------------------------------------------------------- */}
      <section className="relative w-full h-[90vh] sm:h-screen min-h-[580px] max-h-[960px] overflow-hidden">
        {data.coverImage ? (
          <div className="w-full h-full animate-[kenBurns_14s_ease-in-out_infinite_alternate] will-change-transform">
            <ProgressiveImage
              src={data.coverImage}
              alt={`${data.groomName} & ${data.brideName}`}
              priority={true}
              className="w-full h-full"
              imageClassName="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-full h-full bg-[#EFECE6] flex items-center justify-center text-stone-400">
            <span>Ảnh bìa hôn lễ</span>
          </div>
        )}

        {/* Ambient Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/30 flex flex-col items-center justify-end text-center p-6 pb-16 text-white">
          {/* Masked Subtitle */}
          <div className="overflow-hidden mb-2">
            <span className="inline-block text-xs sm:text-sm font-mono tracking-[0.28em] uppercase text-amber-200/90 animate-[maskReveal_0.9s_cubic-bezier(0.16,1,0.3,1)_forwards]">
              Save The Date
            </span>
          </div>

          {/* Masked Couple Title */}
          <div className="overflow-hidden mb-3">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-normal tracking-tight text-white animate-[maskReveal_1s_cubic-bezier(0.16,1,0.3,1)_0.15s_both]">
              {data.groomName} <span className="font-light italic text-[#D4AF37]">&</span> {data.brideName}
            </h1>
          </div>

          {/* Masked Ceremony Date */}
          <div className="overflow-hidden mb-6">
            <p className="text-sm sm:text-base text-stone-200 font-serif tracking-widest uppercase animate-[maskReveal_1s_cubic-bezier(0.16,1,0.3,1)_0.3s_both]">
              {data.ceremonyTimeText || new Date(data.ceremonyDate).toLocaleDateString('vi-VN')}
            </p>
          </div>

          <ChevronDown className="w-6 h-6 text-white/60 animate-bounce" />
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 3. WEDDING INVITATION DETAILS & FAMILY                        */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-2xl mx-auto px-6 py-16 text-center">
        <InvitationSectionReveal showGoldDivider>
          <div className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#8C6D46] mb-3">
            Trân Trọng Kính Mời
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-normal text-stone-900 dark:text-stone-100 mb-6">
            Lễ Thành Hôn
          </h2>
        </InvitationSectionReveal>

        {/* Parents Names with Reveal */}
        {(data.groomParents || data.brideParents) && (
          <InvitationSectionReveal delay={150}>
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
          </InvitationSectionReveal>
        )}

        {/* Story Text */}
        {data.storyText && (
          <InvitationSectionReveal delay={200} showGoldDivider>
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
          </InvitationSectionReveal>
        )}

        {/* 3.1 SVG HAND-DRAWN HEART CALENDAR */}
        <InvitationSectionReveal delay={250}>
          <SaveTheDateCalendar ceremonyDate={data.ceremonyDate} themeColor={themeColor} />
        </InvitationSectionReveal>

        {/* 3.2 ANIMATED SLIDING COUNTDOWN TIMER */}
        <InvitationSectionReveal delay={300}>
          <AnimatedCountdown ceremonyDate={data.ceremonyDate} />
        </InvitationSectionReveal>

        {/* Venue Information & Google Maps Button */}
        <InvitationSectionReveal delay={350}>
          <div className="my-10 p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 text-center shadow-xs">
            <Clock className="w-5 h-5 text-[#8C6D46] mx-auto mb-2" />
            <div className="font-serif text-lg font-medium text-stone-900 dark:text-stone-100">
              {data.ceremonyTimeText || new Date(data.ceremonyDate).toLocaleDateString('vi-VN')}
            </div>

            <div className="mt-4 pt-4 border-t border-stone-100 dark:border-stone-800">
              <MapPin className="w-5 h-5 text-[#8C6D46] mx-auto mb-2" />
              <div className="font-serif text-base font-semibold text-stone-900 dark:text-stone-100">
                {data.venueName}
              </div>
              <div className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-md mx-auto leading-relaxed">
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
        </InvitationSectionReveal>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 4. WEDDING PHOTO GALLERY WITH DOUBLE-TAP HEART BURST           */}
      {/* ------------------------------------------------------------- */}
      {galleryItems.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <InvitationSectionReveal showGoldDivider>
            <div className="text-center mb-8">
              <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#8C6D46]">
                Khoảnh Khắc Hạnh Phúc
              </span>
              <h3 className="text-2xl font-serif text-stone-900 dark:text-stone-100 mt-1">
                Bộ Ảnh Cưới Của Chúng Mình
              </h3>
              <p className="text-xs text-stone-400 mt-1 font-light">
                Chạm đúp vào ảnh để thả tim chúc phúc
              </p>
            </div>
          </InvitationSectionReveal>

          <div className="space-y-4 sm:space-y-6">
            {galleryItems.map((img, idx) => (
              <InvitationSectionReveal key={img.id || idx} delay={idx * 100}>
                <InteractiveGalleryCard
                  image={img}
                  coupleTitle={`${data.groomName} & ${data.brideName}`}
                />
              </InvitationSectionReveal>
            ))}
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. WEDDING GIFT QR & BANK INFO                                */}
      {/* ------------------------------------------------------------- */}
      {(data.bankQrImage || data.bankInfoText) && (
        <section className="max-w-xl mx-auto px-6 py-12 text-center">
          <InvitationSectionReveal showGoldDivider>
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-xs">
              <QrCode className="w-7 h-7 text-[#8C6D46] mx-auto mb-2" />
              <h4 className="font-serif text-xl text-stone-900 dark:text-stone-100">
                Hộp Mừng Cưới
              </h4>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto leading-relaxed">
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
          </InvitationSectionReveal>
        </section>
      )}

      {/* Modal QR Code */}
      {showQrModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl p-6 text-center shadow-2xl border border-stone-200 dark:border-stone-800"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="font-serif text-lg text-stone-900 dark:text-stone-100 mb-4">
              Mã QR Mừng Cưới
            </h4>

            {data.bankQrImage && (
              <div className="w-56 h-56 mx-auto rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 mb-4 bg-white p-2 shadow-inner">
                <img
                  src={data.bankQrImage}
                  alt="Mã QR Mừng Cưới"
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            {data.bankInfoText && (
              <div className="text-xs text-stone-700 dark:text-stone-300 whitespace-pre-line bg-stone-50 dark:bg-stone-800 p-3.5 rounded-2xl mb-4 font-mono leading-relaxed">
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
      {/* 6. RSVP & GUESTBOOK WISHES                                    */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-xl mx-auto px-6 py-12">
        <InvitationSectionReveal showGoldDivider>
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-sm">
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
              <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center animate-in fade-in zoom-in-95 duration-300">
                <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                <div className="text-sm font-medium text-emerald-800 dark:text-emerald-200 leading-relaxed">
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
                  className="w-full h-11 rounded-xl bg-[#8C6D46] hover:bg-[#725735] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingRsvp ? 'Đang gửi...' : 'Gửi Lời Chúc & Xác Nhận Tham Dự'}</span>
                </button>
              </form>
            )}

            {/* Guestbook List with New Wish Highlight */}
            {rsvpsList.length > 0 && (
              <div className="mt-8 pt-6 border-t border-stone-100 dark:border-stone-800">
                <div className="text-xs font-semibold text-stone-800 dark:text-stone-200 uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span>Sổ Lưu Bút Trực Tuyến</span>
                  <span className="text-[10px] text-stone-400 font-mono">({rsvpsList.length} lời chúc)</span>
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {rsvpsList.map((item) => {
                    const isNewlyAdded = item.id === newlyAddedRsvpId;
                    return (
                      <div
                        key={item.id}
                        className={`p-3.5 rounded-2xl border text-xs transition-all ${
                          isNewlyAdded
                            ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 shadow-xs'
                            : 'bg-stone-50 dark:bg-stone-800/60 border-stone-100 dark:border-stone-800'
                        }`}
                      >
                        <div className="flex items-center justify-between font-medium text-stone-800 dark:text-stone-200">
                          <span className="flex items-center gap-1.5">
                            <span>{item.guestName}</span>
                            {isNewlyAdded && (
                              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-[#8C6D46]/20 text-[#8C6D46]">
                                Vừa gửi
                              </span>
                            )}
                          </span>
                          <span className="text-[10px] text-stone-400">
                            {item.attendance === 'ATTENDING' ? 'Sẽ tham dự' : 'Gửi lời chúc'}
                          </span>
                        </div>
                        {item.wishMessage && (
                          <p className="mt-1.5 text-stone-600 dark:text-stone-400 italic leading-relaxed">
                            &ldquo;{item.wishMessage}&rdquo;
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </InvitationSectionReveal>
      </section>

      {/* Footer Branding & Bride/Groom Edit Portal Link */}
      <footer className="text-center py-8 space-y-2 text-stone-400">
        <div className="text-[11px] uppercase tracking-widest font-mono">
          Designed with Love by PlusMoments Wedding Studio
        </div>
        <div>
          <button
            type="button"
            onClick={() => setIsPinModalOpen(true)}
            className="text-[10px] tracking-wide text-stone-400 hover:text-[#8C6D46] transition-colors cursor-pointer inline-flex items-center gap-1 opacity-70 hover:opacity-100"
          >
            <span>Dành cho Cô Dâu & Chú Rể • Chỉnh sửa thiệp</span>
          </button>
        </div>
      </footer>

      {/* Quick PIN Modal for Couple */}
      <CustomerPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        defaultSlug={data.slug}
      />

      {/* Global Embedded Keyframes for Ken Burns, Shimmer, and Mask Reveal */}
      <style jsx global>{`
        @keyframes kenBurns {
          0% {
            transform: scale(1);
          }
          100% {
            transform: scale(1.08);
          }
        }
        @keyframes maskReveal {
          0% {
            transform: translateY(105%);
            opacity: 0;
            letter-spacing: 0.1em;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
            letter-spacing: normal;
          }
        }
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
      `}</style>
    </div>
  );
}
