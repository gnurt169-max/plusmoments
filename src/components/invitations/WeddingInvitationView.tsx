'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
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
  ArrowRight,
  X,
  Maximize2,
} from 'lucide-react';
import { ProgressiveImage } from '@/components/ui/ProgressiveImage';
import {
  INVITATION_TEMPLATES,
  INVITATION_FONTS,
  VIETQR_BANKS,
  buildVietQrUrl,
  InvitationGalleryImage,
} from '@/lib/invitations/templates';
import { AmbientParticles } from './AmbientParticles';
import { InvitationSectionReveal } from './InvitationSectionReveal';
import { SaveTheDateCalendar } from './SaveTheDateCalendar';
import { AnimatedCountdown } from './AnimatedCountdown';
import { SpinningVinylPlayer } from './SpinningVinylPlayer';
import { CelebrationConfetti } from './CelebrationConfetti';
import { InteractiveGalleryCard } from './InteractiveGalleryCard';
import { CustomerPinModal } from './CustomerPinModal';
import { FullscreenImageLightbox, LightboxImageItem } from './FullscreenImageLightbox';
import { weddingAudioSynth } from '@/lib/invitations/wedding-audio-synth';

function formatDisplayDateVN(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return '';
  let d: Date;
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?)?$/.test(dateInput.trim())) {
    const withTime = dateInput.trim().includes('T') ? dateInput.trim() : `${dateInput.trim()}T00:00:00`;
    d = new Date(`${withTime}+07:00`);
  } else {
    d = new Date(dateInput);
  }
  if (isNaN(d.getTime())) return '';

  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

export interface InvitationViewData {
  id?: string;
  slug: string;
  templateId: string;
  themeColor: string;
  groomName: string;
  brideName: string;
  groomParents?: string | null;
  brideParents?: string | null;
  groomImage?: string | null;
  brideImage?: string | null;
  groomBio?: string | null;
  brideBio?: string | null;
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
  fontFamily?: string | null;
  bankQrImage?: string | null;
  bankInfoText?: string | null;
  bankId?: string | null;
  bankAccount?: string | null;
  bankOwner?: string | null;
  giftAmount?: number | null;
  giftMessage?: string | null;
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

export interface CuratedServicePackage {
  id: string;
  name: string;
  slug: string;
  subtitle?: string | null;
  price: number;
  originalPrice?: number | null;
  unit?: string;
  coverImage?: string;
  highlightPoints?: string[];
  category?: string;
  badgeText?: string | null;
}

interface WeddingInvitationViewProps {
  data: InvitationViewData;
  isPreview?: boolean;
  servicePackages?: CuratedServicePackage[];
  showEnvelopePreview?: boolean;
  onEnvelopeClose?: () => void;
  forceSlideInTrigger?: number;
}

export function WeddingInvitationView({
  data,
  isPreview = false,
  servicePackages = [],
  showEnvelopePreview = false,
  onEnvelopeClose,
  forceSlideInTrigger,
}: WeddingInvitationViewProps) {
  // Envelope opening states
  // When isPreview is true, envelope is open/hidden by default so invitation content is immediately visible
  const [isOpenEnvelope, setIsOpenEnvelope] = useState<boolean>(
    isPreview ? !showEnvelopePreview : false
  );
  const [isOpeningFlap, setIsOpeningFlap] = useState<boolean>(false);
  const [isFadingEnvelope, setIsFadingEnvelope] = useState<boolean>(false);

  // Synchronize envelope state when isPreview or showEnvelopePreview changes
  useEffect(() => {
    if (isPreview) {
      if (showEnvelopePreview) {
        setIsOpenEnvelope(false);
        setIsOpeningFlap(false);
        setIsFadingEnvelope(false);
      } else {
        setIsOpenEnvelope(true);
      }
    }
  }, [isPreview, showEnvelopePreview]);

  // Music & Modal states
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);

  // Fullscreen Lightbox states
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [lightboxInitialIndex, setLightboxInitialIndex] = useState<number>(0);

  // Directional Slide-in for Groom (from Right) and Bride (from Left)
  const [portraitsInView, setPortraitsInView] = useState<boolean>(false);
  const portraitsRef = useRef<HTMLDivElement | null>(null);

  // Observe Portraits Section for 60fps GPU slide-in animation
  useEffect(() => {
    const el = portraitsRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPortraitsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Force replay slide-in animation when test button in Live Preview is clicked
  useEffect(() => {
    if (forceSlideInTrigger) {
      setPortraitsInView(false);
      const timer = setTimeout(() => {
        setPortraitsInView(true);
        if (portraitsRef.current) {
          portraitsRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [forceSlideInTrigger]);

  // Update Audio Synthesizer preset when musicPreset prop changes
  useEffect(() => {
    if (data.musicPreset) {
      weddingAudioSynth.setPreset(data.musicPreset);
    }
  }, [data.musicPreset]);

  // Audio Play/Pause Synchronizer
  const handleToggleMusic = useCallback(() => {
    weddingAudioSynth.init();
    const playing = weddingAudioSynth.toggle();
    setIsMusicPlaying(playing);
  }, []);

  // Unlock audio on first user touch anywhere if not yet playing
  useEffect(() => {
    if (isPreview) return;

    const unlockAudio = () => {
      weddingAudioSynth.init();
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };

    window.addEventListener('click', unlockAudio, { passive: true });
    window.addEventListener('touchstart', unlockAudio, { passive: true });

    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, [isPreview]);

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

  // 4 distinct template theme configurations
  const colors = (() => {
    switch (data.templateId) {
      case 'cinematic-noir':
        return {
          bg: 'bg-[#12100E]',
          bgHex: '#12100E',
          text: 'text-[#FAF8F5]',
          cardBg: 'bg-[#1C1917]',
          cardBorder: 'border border-white/10 shadow-lg',
          cardRadius: 'rounded-2xl',
          title: 'font-serif text-[#FAF8F5] tracking-tight',
          label: 'text-[#FAF8F5]',
          body: 'text-[#D6D0C4]',
          bodyMuted: 'text-[#A8A29E]',
          divider: 'border-white/10',
          inputBg: 'bg-[#25221F]',
          inputBorder: 'border-white/15',
          inputText: 'text-[#FAF8F5]',
          styleType: 'noir' as const,
        };
      case 'botanical-silk':
        return {
          bg: 'bg-[#F2F5F0]',
          bgHex: '#F2F5F0',
          text: 'text-[#1E2923]',
          cardBg: 'bg-white/95',
          cardBorder: 'border border-[#4A6B53]/25 shadow-xs',
          cardRadius: 'rounded-[32px]',
          title: 'font-serif text-[#1E2923]',
          label: 'text-[#1E2923]',
          body: 'text-[#2D3E35]',
          bodyMuted: 'text-[#4A5D52]',
          divider: 'border-[#4A6B53]/20',
          inputBg: 'bg-white',
          inputBorder: 'border-[#4A6B53]/30',
          inputText: 'text-[#1E2923]',
          styleType: 'botanical' as const,
        };
      case 'minimalist-story':
        return {
          bg: 'bg-[#FFFFFF]',
          bgHex: '#FFFFFF',
          text: 'text-[#18181B]',
          cardBg: 'bg-[#FAFAFA]',
          cardBorder: 'border border-stone-200 shadow-none',
          cardRadius: 'rounded-lg',
          title: 'font-serif text-[#18181B] font-light tracking-normal',
          label: 'text-[#18181B]',
          body: 'text-[#27272A]',
          bodyMuted: 'text-[#71717A]',
          divider: 'border-stone-200',
          inputBg: 'bg-white',
          inputBorder: 'border-stone-200',
          inputText: 'text-[#18181B]',
          styleType: 'minimalist' as const,
        };
      case 'timeless-ivory':
      default:
        return {
          bg: 'bg-[#FAF8F5]',
          bgHex: '#FAF8F5',
          text: 'text-[#1C1917]',
          cardBg: 'bg-white',
          cardBorder: 'border-2 border-stone-200/90 border-double shadow-xs',
          cardRadius: 'rounded-3xl',
          title: 'font-serif text-[#1C1917]',
          label: 'text-[#785932]',
          body: 'text-[#3F3A36]',
          bodyMuted: 'text-[#57534E]',
          divider: 'border-stone-200',
          inputBg: 'bg-white',
          inputBorder: 'border-stone-300',
          inputText: 'text-[#1C1917]',
          styleType: 'classic' as const,
        };
    }
  })();

  const galleryItems = Array.isArray(data.galleryImages) ? data.galleryImages : [];

  // Build unified Lightbox image list across all invitation photos: [coverImage, groomImage, brideImage, ...galleryImages]
  const allLightboxImages: LightboxImageItem[] = useMemo(() => {
    const list: LightboxImageItem[] = [];
    if (data.coverImage) {
      list.push({
        url: data.coverImage,
        title: `${data.groomName} & ${data.brideName}`,
        caption: 'Ảnh Bìa Thiệp Cưới',
        tag: 'Cover',
      });
    }
    if (data.groomImage) {
      list.push({
        url: data.groomImage,
        title: `Chú Rể — ${data.groomName || ''}`.trim(),
        caption: data.groomBio ? `"${data.groomBio}"` : 'The Groom',
        tag: 'The Groom',
      });
    }
    if (data.brideImage) {
      list.push({
        url: data.brideImage,
        title: `Cô Dâu — ${data.brideName || ''}`.trim(),
        caption: data.brideBio ? `"${data.brideBio}"` : 'The Bride',
        tag: 'The Bride',
      });
    }
    galleryItems.forEach((img, idx) => {
      list.push({
        url: img.url,
        title: `${data.groomName} & ${data.brideName}`,
        caption: img.caption || `Khoảnh khắc cưới #${idx + 1}`,
        tag: `Khoảnh khắc ${idx + 1}`,
      });
    });
    return list;
  }, [data.coverImage, data.groomImage, data.brideImage, data.groomName, data.brideName, data.groomBio, data.brideBio, galleryItems]);

  const openLightboxAtUrl = useCallback((targetUrl: string) => {
    const foundIdx = allLightboxImages.findIndex((img) => img.url === targetUrl);
    setLightboxInitialIndex(foundIdx >= 0 ? foundIdx : 0);
    setIsLightboxOpen(true);
  }, [allLightboxImages]);

  // Dynamic VietQR & Font Resolution
  const effectiveBankQr = useMemo(() => {
    if (data.bankQrImage && data.bankQrImage.trim()) {
      return data.bankQrImage.trim();
    }
    if (data.bankId && data.bankAccount) {
      return buildVietQrUrl({
        bankId: data.bankId,
        bankAccount: data.bankAccount,
        bankOwner: data.bankOwner,
        giftAmount: data.giftAmount,
        giftMessage: data.giftMessage,
      });
    }
    return null;
  }, [data.bankQrImage, data.bankId, data.bankAccount, data.bankOwner, data.giftAmount, data.giftMessage]);

  const fontOption = useMemo(() => {
    return INVITATION_FONTS.find((f) => f.id === data.fontFamily) || INVITATION_FONTS[0];
  }, [data.fontFamily]);

  // Content presence flags (Strict Zero-Mock Data Policy)
  const hasCoupleNames = Boolean(data.groomName?.trim() || data.brideName?.trim());
  const hasCeremonyTime = Boolean(data.ceremonyTimeText?.trim() || (data.ceremonyDate && String(data.ceremonyDate).trim()));
  const hasCoverImage = Boolean(data.coverImage && data.coverImage.trim());
  const hasParents = Boolean(data.groomParents?.trim() || data.brideParents?.trim());
  const hasGroomBrideIntro = Boolean(
    data.groomImage?.trim() ||
    data.brideImage?.trim() ||
    data.groomBio?.trim() ||
    data.brideBio?.trim() ||
    hasCoupleNames
  );
  const hasStory = Boolean(data.storyText?.trim());
  const hasVenue = Boolean(data.venueName?.trim() || data.venueAddress?.trim());
  const hasBanking = Boolean(effectiveBankQr || data.bankInfoText?.trim() || (data.bankId && data.bankAccount));
  const hasGallery = galleryItems.length > 0;

  const hasAnyContent = Boolean(
    hasCoupleNames ||
    hasCeremonyTime ||
    hasCoverImage ||
    hasParents ||
    (data.groomImage?.trim() || data.brideImage?.trim() || data.groomBio?.trim() || data.brideBio?.trim()) ||
    hasStory ||
    hasVenue ||
    hasBanking ||
    hasGallery
  );

  // Monogram initials for 3D Wax Seal (e.g. "T & T" or "M & T")
  const groomInitial = (data.groomName || '').trim().split(/\s+/).pop()?.charAt(0).toUpperCase() || '';
  const brideInitial = (data.brideName || '').trim().split(/\s+/).pop()?.charAt(0).toUpperCase() || '';

  // Handle 3D Envelope Opening Sequence (60fps GPU 3-stage choreography)
  const handleOpenEnvelope = () => {
    if (isOpeningFlap) return;
    setIsOpeningFlap(true);

    // Start background wedding music immediately on envelope opening gesture
    try {
      weddingAudioSynth.init();
      weddingAudioSynth.play();
      setIsMusicPlaying(true);
    } catch {
      // Audio synth catch
    }

    // Stage 3 (650ms): Fade and zoom out envelope overlay into main wedding invitation
    setTimeout(() => {
      setIsFadingEnvelope(true);
    }, 650);

    // Complete (1150ms): Unmount overlay completely
    setTimeout(() => {
      setIsOpenEnvelope(true);
      if (onEnvelopeClose) onEnvelopeClose();
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
      className={`relative invitation-root ${isPreview && !isOpenEnvelope ? 'h-full overflow-hidden' : 'min-h-screen'
        } ${colors.bg} ${colors.text} font-sans selection:bg-[#8C6D46] selection:text-white pb-24`}
      style={{
        '--inv-accent': themeColor,
        '--inv-font-serif': fontOption.fontFamily,
        fontFamily: fontOption.fontFamily,
        backgroundColor: colors.bgHex,
      } as React.CSSProperties}
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
          className={`${isPreview
            ? 'absolute inset-0 z-50 overflow-hidden'
            : 'fixed inset-0 z-50'
            } flex items-center justify-center p-4 bg-[#141210]/85 backdrop-blur-2xl transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${isFadingEnvelope ? 'opacity-0 scale-[1.06] pointer-events-none' : 'opacity-100 scale-100'
            }`}
          style={{ perspective: '1400px' }}
        >
          {/* Close preview button for editor/builder */}
          {isPreview && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpenEnvelope(true);
                if (onEnvelopeClose) onEnvelopeClose();
              }}
              className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white/90 hover:text-white transition-colors flex items-center gap-1 text-xs border border-white/10 shadow-lg cursor-pointer"
              title="Đóng phong bì để xem nội dung thiệp"
            >
              <X className="w-3.5 h-3.5" />
              <span>Đóng</span>
            </button>
          )}

          {/* Subtle Ambient Background Wedding Cover Glow */}
          {data.coverImage && (
            <div
              className="absolute inset-0 -z-10 bg-cover bg-center opacity-25 blur-3xl pointer-events-none scale-110"
              style={{ backgroundImage: `url(${data.coverImage})` }}
              aria-hidden="true"
            />
          )}

          <div
            onClick={handleOpenEnvelope}
            className={`w-[90vw] ${isPreview ? 'max-w-[320px]' : 'max-w-[380px]'
              } aspect-[3/4.2] cursor-pointer select-none relative group will-change-transform`}
          >
            {/* 3D Envelope Body (Haute Couture Fine Art Paper with Internal Golden Frame) */}
            <div
              className="relative w-full h-full rounded-[28px] shadow-[0_30px_70px_rgba(0,0,0,0.65)] border border-[#C5A059]/40 overflow-hidden flex flex-col items-center justify-between p-6 sm:p-7 text-center select-none"
              style={{
                background: isDarkTemplate
                  ? 'linear-gradient(180deg, #242220 0%, #171514 100%)'
                  : 'linear-gradient(180deg, #FCF9F4 0%, #F3ECE0 100%)',
              }}
            >
              {/* Internal Fine Line Golden Frame (Insets 14px with matching radius) */}
              <div
                className="absolute inset-3.5 border border-[#C5A059]/35 rounded-[20px] pointer-events-none z-10"
                aria-hidden="true"
              />

              {/* 3D Triangular Flap (Kept strictly to top 34% height so it NEVER covers names) */}
              <div
                className={`absolute top-0 left-0 right-0 h-[34%] origin-top transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none ${isOpeningFlap ? 'z-0' : 'z-30'
                  }`}
                style={{
                  transform: isOpeningFlap ? 'rotateX(180deg)' : 'rotateX(0deg)',
                  transformStyle: 'preserve-3d',
                  willChange: 'transform',
                }}
              >
                <svg
                  viewBox="0 0 380 145"
                  className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.18)]"
                  preserveAspectRatio="none"
                >
                  <polygon
                    points="0,0 380,0 190,145"
                    fill={isDarkTemplate ? '#2C2A28' : '#F6F0E6'}
                    stroke={isDarkTemplate ? '#4A4642' : '#E5DAC9'}
                    strokeWidth="1.5"
                  />
                  {/* Flap subtle inner gold accent line */}
                  <polyline
                    points="18,0 190,132 362,0"
                    fill="none"
                    stroke="#C5A059"
                    strokeWidth="0.8"
                    strokeOpacity="0.4"
                  />
                </svg>
              </div>

              {/* Top Flap Peak & Monogram Wax Seal Anchor */}
              <div className="relative w-full pt-10 sm:pt-11 flex justify-center z-40">
                {/* 3D Wax Seal with Bride & Groom Monogram Initials */}
                <div
                  className={`w-16 h-16 rounded-full flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500 transform ${isOpeningFlap
                    ? 'scale-125 opacity-0'
                    : 'scale-100 opacity-100 hover:scale-105 active:scale-95'
                    }`}
                  style={{
                    background: 'radial-gradient(circle at 35% 35%, #F4D38A 0%, #C5A059 45%, #8C6D32 85%, #6B5224 100%)',
                    boxShadow: '0 10px 26px rgba(140, 109, 50, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.4), inset 0 -2px 4px rgba(0, 0, 0, 0.3)',
                    border: '3px solid rgba(244, 211, 138, 0.6)',
                  }}
                >
                  {/* Shimmer Light Reflection Sweep */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/45 to-transparent -translate-x-full animate-[shimmer_2.8s_infinite_linear] pointer-events-none" />

                  {/* Embossed Monogram Initials */}
                  <span className="font-serif font-bold text-sm tracking-widest text-[#2A1D0E] drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)] select-none">
                    {groomInitial || brideInitial ? `${groomInitial} ${groomInitial && brideInitial ? '&' : ''} ${brideInitial}`.trim() : '✦'}
                  </span>
                  <div className="w-6 h-[0.75px] bg-[#6B5224]/50 my-0.5" />
                  <Sparkles className="w-2.5 h-2.5 text-[#2A1D0E]/80" />
                </div>
              </div>

              {/* Lower Section: Wedding Invitation Details (Comfortably spaced, 100% visible, never clipped) */}
              <div
                className="relative z-20 w-full flex-1 flex flex-col justify-center items-center px-2 pt-4 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{
                  transform: isOpeningFlap ? 'translateY(-28px) scale(1.02)' : 'translateY(0)',
                  willChange: 'transform',
                }}
              >
                {/* Header label */}
                <div
                  className="text-[10px] sm:text-[11px] font-mono tracking-[0.25em] uppercase font-medium mb-3"
                  style={{ color: 'var(--inv-accent)' }}
                >
                  Trân Trọng Kính Mời
                </div>

                {/* Couple Names: Groom & Bride balanced with dynamic accent '&' */}
                {hasCoupleNames && (
                  <h2
                    className={`font-serif text-2xl sm:text-[26px] font-normal leading-snug tracking-tight ${isDarkTemplate ? 'text-[#FAF8F5]' : 'text-[#1C1917]'
                      } mb-2`}
                  >
                    <span>{data.groomName}</span>
                    {data.groomName && data.brideName && (
                      <span className="block my-0.5 italic font-light text-xl" style={{ color: 'var(--inv-accent)' }}>&</span>
                    )}
                    <span>{data.brideName}</span>
                  </h2>
                )}

                {/* Date text */}
                {hasCeremonyTime && (
                  <div
                    className={`text-xs ${isDarkTemplate ? 'text-[#D6D0C4]' : 'text-[#57534E]'
                      } font-serif tracking-widest uppercase mt-2`}
                  >
                    {data.ceremonyTimeText || formatDisplayDateVN(data.ceremonyDate)}
                  </div>
                )}
              </div>

              {/* Tap Indicator Hint at Envelope Bottom */}
              <div className="relative z-20 pb-2">
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium tracking-wider animate-pulse"
                  style={{ backgroundColor: `${themeColor}15`, color: themeColor }}
                >
                  <Sparkles className="w-3 h-3" style={{ color: themeColor }} />
                  <span>Chạm vào con dấu để mở thiệp</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1.1 BLANK INVITATION STATE (Zero Mock Data for Live Preview)  */}
      {/* ------------------------------------------------------------- */}
      {isPreview && !hasAnyContent ? (
        <div className="min-h-full py-20 px-4 flex flex-col items-center justify-center text-center">
          <div
            className={`w-full max-w-[320px] ${colors.cardBg} ${colors.cardBorder} ${colors.cardRadius} p-7 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300`}
            style={{ backgroundColor: colors.styleType === 'noir' ? '#1C1917' : undefined }}
          >
            <div
              className="w-14 h-14 rounded-full mx-auto flex items-center justify-center shadow-inner"
              style={{ backgroundColor: `${themeColor}22`, color: themeColor }}
            >
              <Sparkles className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <span
                className="text-[10px] font-mono uppercase tracking-[0.22em] font-semibold block"
                style={{ color: themeColor }}
              >
                {templateConfig.name}
              </span>
              <h3 className={`text-xl ${colors.title}`}>
                {templateConfig.subtitle}
              </h3>
            </div>

            <div className="w-12 h-0.5 mx-auto rounded-full" style={{ backgroundColor: themeColor }} />

            <p className={`text-xs ${colors.bodyMuted} leading-relaxed`}>
              Bắt đầu nhập thông tin cưới ở cột bên trái để xem thiệp của bạn hiện lên tại đây.
            </p>

            <div
              className="pt-2 text-[11px] font-mono flex items-center justify-center gap-1.5"
              style={{ color: themeColor }}
            >
              <span>Điểm nhấn:</span>
              <span
                className="w-3.5 h-3.5 rounded-full inline-block border border-black/10 shadow-2xs"
                style={{ backgroundColor: themeColor }}
              />
              <span className="uppercase font-semibold">{themeColor}</span>
            </div>
          </div>
        </div>
      ) : (
        <>

          {/* ------------------------------------------------------------- */}
          {/* 1.1 SPINNING VINYL DISC MUSIC PLAYER (Floating Bottom Right)  */}
          {/* ------------------------------------------------------------- */}
          <SpinningVinylPlayer
            isPlaying={isMusicPlaying}
            onToggle={handleToggleMusic}
          />

          {/* ------------------------------------------------------------- */}
          {/* 2. KEN BURNS HERO & MASKED TEXT REVEAL                        */}
          {/* ------------------------------------------------------------- */}
          <section className="relative w-full h-[90vh] sm:h-screen min-h-[580px] max-h-[960px] overflow-hidden">
            {data.coverImage ? (
              <div
                onClick={() => openLightboxAtUrl(data.coverImage!)}
                className="w-full h-full animate-[kenBurns_14s_ease-in-out_infinite_alternate] will-change-transform cursor-pointer"
                title="Chạm để xem ảnh bìa toàn màn hình"
              >
                <ProgressiveImage
                  src={data.coverImage}
                  alt={`${data.groomName} & ${data.brideName}`}
                  priority={true}
                  className="w-full h-full"
                  imageClassName="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div
                className="w-full h-full flex flex-col items-center justify-center p-6 text-center"
                style={{ backgroundColor: colors.styleType === 'noir' ? '#181614' : undefined }}
              >
                <Sparkles className="w-8 h-8 mb-3 opacity-60" style={{ color: 'var(--inv-accent)' }} />
                <span className="text-xs uppercase font-mono tracking-widest opacity-60">
                  {templateConfig.name} • Save The Date
                </span>
              </div>
            )}

            {/* Ambient Dark Gradient Overlay with High-Contrast Mobile Shielding */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30 flex flex-col items-center justify-end text-center p-6 pb-16 text-white">
              {/* Masked Subtitle */}
              <div className="overflow-hidden mb-2">
                <span
                  className="inline-block text-xs sm:text-sm font-mono tracking-[0.28em] uppercase font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] animate-[maskReveal_0.9s_cubic-bezier(0.16,1,0.3,1)_forwards]"
                  style={{ color: 'var(--inv-accent)' }}
                >
                  Save The Date
                </span>
              </div>

              {/* Masked Couple Title */}
              {hasCoupleNames && (
                <div className="overflow-hidden mb-3">
                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-normal tracking-tight text-white drop-shadow-[0_3px_12px_rgba(0,0,0,0.75)] animate-[maskReveal_1s_cubic-bezier(0.16,1,0.3,1)_0.15s_both]">
                    {data.groomName}{' '}
                    {data.groomName && data.brideName && (
                      <span className="font-light italic" style={{ color: 'var(--inv-accent)' }}>&</span>
                    )}{' '}
                    {data.brideName}
                  </h1>
                </div>
              )}

              {/* Masked Ceremony Date */}
              {hasCeremonyTime && (
                <div className="overflow-hidden mb-6">
                  <p className="text-sm sm:text-base text-stone-100 font-serif tracking-widest uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] animate-[maskReveal_1s_cubic-bezier(0.16,1,0.3,1)_0.3s_both]">
                    {data.ceremonyTimeText || formatDisplayDateVN(data.ceremonyDate)}
                  </p>
                </div>
              )}

              <ChevronDown className="w-6 h-6 text-white/80 animate-bounce" />
            </div>
          </section>

          {/* ------------------------------------------------------------- */}
          {/* 3. WEDDING INVITATION DETAILS & FAMILY                        */}
          {/* ------------------------------------------------------------- */}
          <section className="max-w-2xl mx-auto px-6 py-16 text-center">
            <InvitationSectionReveal showGoldDivider>
              <div
                className="text-[11px] font-mono tracking-[0.2em] uppercase font-semibold mb-3"
                style={{ color: 'var(--inv-accent)' }}
              >
                Trân Trọng Kính Mời
              </div>

              <h2 className={`text-2xl sm:text-3xl font-serif font-semibold ${colors.title} mb-6`}>
                Lễ Thành Hôn
              </h2>
            </InvitationSectionReveal>

            {/* Parents Names with Reveal */}
            {hasParents && (
              <InvitationSectionReveal delay={150}>
                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 my-8 py-6 border-y ${colors.divider} text-xs sm:text-sm leading-relaxed`}>
                  {data.groomParents?.trim() && (
                    <div>
                      <div
                        className="font-serif font-bold text-xs uppercase tracking-wider mb-1"
                        style={{ color: 'var(--inv-accent)' }}
                      >
                        Nhà Trai
                      </div>
                      <div className={`${colors.body} text-sm sm:text-[15px] font-medium leading-relaxed whitespace-pre-line`}>
                        {data.groomParents}
                      </div>
                    </div>
                  )}
                  {data.brideParents?.trim() && (
                    <div>
                      <div
                        className="font-serif font-bold text-xs uppercase tracking-wider mb-1"
                        style={{ color: 'var(--inv-accent)' }}
                      >
                        Nhà Gái
                      </div>
                      <div className={`${colors.body} text-sm sm:text-[15px] font-medium leading-relaxed whitespace-pre-line`}>
                        {data.brideParents}
                      </div>
                    </div>
                  )}
                </div>
              </InvitationSectionReveal>
            )}

            {/* ============================================================= */}
            {/* 3.0 GROOM -> BRIDE PORTRAIT INTRODUCTION SECTION              */}
            {/* Sequence: THE GROOM (from Right) & THE BRIDE (from Left)      */}
            {/* ============================================================= */}
            {hasGroomBrideIntro && (() => {
              const effectiveGroomImg = data.groomImage || null;
              const effectiveBrideImg = data.brideImage || null;

              return (
                <div ref={portraitsRef} className="my-10 text-center overflow-x-hidden">
                  <span
                    className="text-[11px] font-mono tracking-[0.25em] uppercase font-semibold block mb-2"
                    style={{ color: 'var(--inv-accent)' }}
                  >
                    ✦ HAI NHÂN VẬT CHÍNH ✦
                  </span>
                  <h3 className={`font-serif text-2xl sm:text-3xl font-medium tracking-tight ${colors.title} mb-8`}>
                    Chú Rể & Cô Dâu
                  </h3>

                  {/* 2-Column Responsive Layout with Opposite Directional Slide-in */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start text-left">
                    {/* 1. THE GROOM: Slide in from RIGHT (translate-x-16 -> translate-x-0) */}
                    <div
                      className={`${colors.cardRadius} p-5 sm:p-6 ${colors.cardBg} ${colors.cardBorder} space-y-4 transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${portraitsInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-16'
                        }`}
                    >
                      {effectiveGroomImg ? (
                        <div
                          onClick={() => openLightboxAtUrl(effectiveGroomImg)}
                          className={`relative w-full aspect-[3/4] ${colors.cardRadius} overflow-hidden shadow-md border cursor-pointer group/groomImg`}
                          style={{ borderColor: 'var(--inv-accent)' }}
                        >
                          <ProgressiveImage
                            src={effectiveGroomImg}
                            alt={`Chú Rể ${data.groomName || ''}`}
                            className="w-full h-full"
                            imageClassName="w-full h-full object-cover object-[50%_18%] transition-transform duration-700 group-hover/groomImg:scale-105"
                            sizes="(max-width: 768px) 90vw, 360px"
                          />
                          <div
                            className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#1C1917]/85 backdrop-blur-xs text-[10px] uppercase font-mono tracking-widest border border-white/20"
                            style={{ color: 'var(--inv-accent)' }}
                          >
                            The Groom
                          </div>

                          {/* Expand indicator button on bottom right */}
                          <button
                            type="button"
                            className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-xs text-white flex items-center justify-center transition-transform active:scale-90"
                            title="Xem ảnh phóng to"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : null}

                      <div className="pt-1">
                        <div
                          className="text-[11px] font-mono uppercase tracking-[0.22em] font-semibold mb-1"
                          style={{ color: 'var(--inv-accent)' }}
                        >
                          Chú Rể
                        </div>
                        {data.groomName && (
                          <h4 className={`font-serif text-2xl font-normal leading-snug tracking-tight ${colors.title}`}>
                            {data.groomName}
                          </h4>
                        )}
                        {data.groomBio ? (
                          <p className={`text-xs sm:text-[13px] ${colors.body} mt-2.5 leading-relaxed font-normal italic`}>
                            &ldquo;{data.groomBio}&rdquo;
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {/* 2. THE BRIDE: Slide in from LEFT (-translate-x-16 -> translate-x-0) with 150ms delay */}
                    <div
                      className={`${colors.cardRadius} p-5 sm:p-6 ${colors.cardBg} ${colors.cardBorder} space-y-4 md:mt-10 transition-all duration-1000 delay-150 ease-[cubic-bezier(0.22,1,0.36,1)] ${portraitsInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-16'
                        }`}
                    >
                      {effectiveBrideImg ? (
                        <div
                          onClick={() => openLightboxAtUrl(effectiveBrideImg)}
                          className={`relative w-full aspect-[3/4] ${colors.cardRadius} overflow-hidden shadow-md border cursor-pointer group/brideImg`}
                          style={{ borderColor: 'var(--inv-accent)' }}
                        >
                          <ProgressiveImage
                            src={effectiveBrideImg}
                            alt={`Cô Dâu ${data.brideName || ''}`}
                            className="w-full h-full"
                            imageClassName="w-full h-full object-cover object-[50%_18%] transition-transform duration-700 group-hover/brideImg:scale-105"
                            sizes="(max-width: 768px) 90vw, 360px"
                          />
                          <div
                            className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#1C1917]/85 backdrop-blur-xs text-[10px] uppercase font-mono tracking-widest border border-white/20"
                            style={{ color: 'var(--inv-accent)' }}
                          >
                            The Bride
                          </div>

                          {/* Expand indicator button on bottom right */}
                          <button
                            type="button"
                            className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-xs text-white flex items-center justify-center transition-transform active:scale-90"
                            title="Xem ảnh phóng to"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : null}

                      <div className="pt-1">
                        <div
                          className="text-[11px] font-mono uppercase tracking-[0.22em] font-semibold mb-1"
                          style={{ color: 'var(--inv-accent)' }}
                        >
                          Cô Dâu
                        </div>
                        {data.brideName && (
                          <h4 className={`font-serif text-2xl font-normal leading-snug tracking-tight ${colors.title}`}>
                            {data.brideName}
                          </h4>
                        )}
                        {data.brideBio ? (
                          <p className={`text-xs sm:text-[13px] ${colors.body} mt-2.5 leading-relaxed font-normal italic`}>
                            &ldquo;{data.brideBio}&rdquo;
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Story Text */}
            {hasStory && (
              <InvitationSectionReveal delay={200} showGoldDivider>
                <div className="my-10 px-4">
                  {data.storyTitle && (
                    <h3 className={`font-serif text-xl font-medium italic mb-3 ${colors.title}`}>
                      &ldquo;{data.storyTitle}&rdquo;
                    </h3>
                  )}
                  <p className={`text-sm sm:text-[15px] ${colors.body} font-normal leading-relaxed whitespace-pre-line`}>
                    {data.storyText}
                  </p>
                </div>
              </InvitationSectionReveal>
            )}

            {/* 3.1 SVG HAND-DRAWN HEART CALENDAR & COUNTDOWN */}
            {Boolean(data.ceremonyDate && String(data.ceremonyDate).trim()) && (
              <>
                <InvitationSectionReveal delay={250}>
                  <SaveTheDateCalendar ceremonyDate={data.ceremonyDate} themeColor={themeColor} isDark={isDarkTemplate} />
                </InvitationSectionReveal>

                <InvitationSectionReveal delay={300}>
                  <AnimatedCountdown ceremonyDate={data.ceremonyDate} isDark={isDarkTemplate} />
                </InvitationSectionReveal>
              </>
            )}

            {/* Venue Information & Google Maps Button */}
            {hasVenue && (
              <InvitationSectionReveal delay={350}>
                <div className={`my-10 p-6 sm:p-8 ${colors.cardRadius} ${colors.cardBg} ${colors.cardBorder} text-center shadow-xs`}>
                  {data.ceremonyTimeText && (
                    <>
                      <Clock className="w-5 h-5 mx-auto mb-2" style={{ color: 'var(--inv-accent)' }} />
                      <div className={`font-serif text-lg font-semibold ${colors.title}`}>
                        {data.ceremonyTimeText}
                      </div>
                    </>
                  )}

                  <div className={`mt-4 pt-4 border-t ${colors.divider}`}>
                    <MapPin className="w-5 h-5 mx-auto mb-2" style={{ color: 'var(--inv-accent)' }} />
                    {data.venueName && (
                      <div className={`font-serif text-lg font-bold ${colors.title}`}>
                        {data.venueName}
                      </div>
                    )}
                    {data.venueAddress && (
                      <div className={`text-sm sm:text-[15px] ${colors.body} mt-1.5 max-w-md mx-auto leading-relaxed`}>
                        {data.venueAddress}
                      </div>
                    )}

                    {data.googleMapsUrl && (
                      <a
                        href={data.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-5 inline-flex items-center gap-2 h-10 px-5 rounded-full text-white text-xs font-medium tracking-wide uppercase transition-transform hover:scale-105 shadow-xs"
                        style={{ backgroundColor: 'var(--inv-accent)' }}
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Chỉ Đường Google Maps</span>
                      </a>
                    )}
                  </div>
                </div>
              </InvitationSectionReveal>
            )}
          </section>

          {/* ------------------------------------------------------------- */}
          {/* 4. WEDDING PHOTO GALLERY WITH DOUBLE-TAP HEART BURST           */}
          {/* ------------------------------------------------------------- */}
          {galleryItems.length > 0 && (
            <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
              <InvitationSectionReveal showGoldDivider>
                <div className="text-center mb-8">
                  <span className={`text-[11px] font-mono tracking-[0.2em] uppercase font-semibold ${colors.label}`}>
                    Khoảnh Khắc Hạnh Phúc
                  </span>
                  <h3 className={`text-2xl font-serif font-semibold ${colors.title} mt-1`}>
                    Bộ Ảnh Cưới Của Chúng Mình
                  </h3>
                  <p className={`text-xs ${colors.bodyMuted} mt-1 font-light`}>
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
                      onOpenLightbox={() => openLightboxAtUrl(img.url)}
                    />
                  </InvitationSectionReveal>
                ))}
              </div>
            </section>
          )}

          {/* ------------------------------------------------------------- */}
          {/* 5. WEDDING GIFT QR & BANK INFO                                */}
          {/* ------------------------------------------------------------- */}
          {hasBanking && (
            <section className="max-w-xl mx-auto px-6 py-12 text-center">
              <InvitationSectionReveal showGoldDivider>
                <div className={`p-6 sm:p-8 ${colors.cardRadius} ${colors.cardBg} border ${colors.cardBorder} shadow-xs`}>
                  <QrCode className="w-7 h-7 mx-auto mb-2" style={{ color: 'var(--inv-accent)' }} />
                  <h4 className={`font-serif text-xl font-semibold ${colors.title}`}>
                    Hộp Mừng Cưới
                  </h4>
                  <p className={`text-xs sm:text-sm ${colors.bodyMuted} mt-1 max-w-sm mx-auto leading-relaxed`}>
                    Sự hiện diện và lời chúc phúc của quý khách là món quà quý giá nhất dành cho chúng mình.
                  </p>

                  <button
                    type="button"
                    onClick={() => setShowQrModal(true)}
                    className="mt-5 inline-flex items-center gap-2 h-10 px-5 rounded-full border text-xs font-semibold uppercase tracking-wider transition-opacity hover:opacity-90"
                    style={{ borderColor: 'var(--inv-accent)', color: 'var(--inv-accent)' }}
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
              className={`${isPreview ? 'absolute inset-0 z-50' : 'fixed inset-0 z-50'} flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs`}
              onClick={() => setShowQrModal(false)}
            >
              <div
                className={`w-full max-w-sm ${colors.cardBg} ${colors.cardRadius} p-6 text-center shadow-2xl border ${colors.cardBorder} max-h-[92vh] overflow-y-auto`}
                onClick={(e) => e.stopPropagation()}
              >
                <h4 className={`font-serif text-lg font-semibold ${colors.title} mb-3`}>
                  Mã QR Mừng Cưới
                </h4>

                {effectiveBankQr && (
                  <div className="w-56 h-56 mx-auto rounded-2xl overflow-hidden border border-stone-200 mb-4 bg-white p-2 shadow-inner">
                    <img
                      src={effectiveBankQr}
                      alt="Mã QR Mừng Cưới"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}

                {/* Structured Bank Details if bankId / bankAccount are configured */}
                {(data.bankId || data.bankAccount || data.bankOwner) && (
                  <div className={`text-xs ${isDarkTemplate ? 'bg-[#25221F] text-stone-200 border-white/10' : 'bg-stone-50 text-stone-800 border-stone-200'} border p-3 rounded-xl mb-3 space-y-1.5 text-left`}>
                    {data.bankId && (
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-stone-500">Ngân hàng:</span>
                        <span className="font-semibold">{VIETQR_BANKS.find(b => b.id === data.bankId)?.shortName || data.bankId}</span>
                      </div>
                    )}
                    {data.bankAccount && (
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-stone-500">Số tài khoản:</span>
                        <span className="font-mono font-bold tracking-wider">{data.bankAccount}</span>
                      </div>
                    )}
                    {data.bankOwner && (
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-stone-500">Chủ tài khoản:</span>
                        <span className="font-medium uppercase">{data.bankOwner}</span>
                      </div>
                    )}
                    {data.giftAmount && Number(data.giftAmount) > 0 && (
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-stone-500">Số tiền gợi ý:</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {Number(data.giftAmount).toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                    )}
                    {data.giftMessage && (
                      <div className="pt-1 border-t border-stone-200/50 text-[11px]">
                        <span className="text-stone-500 block mb-0.5">Lời chúc chuyển khoản:</span>
                        <span className="italic">{data.giftMessage}</span>
                      </div>
                    )}
                  </div>
                )}

                {data.bankInfoText && (
                  <div className={`text-xs ${isDarkTemplate ? 'bg-[#25221F] text-stone-200 border-white/10' : 'bg-stone-50 text-stone-800 border-stone-200'} border p-3.5 rounded-2xl mb-4 font-mono leading-relaxed whitespace-pre-line`}>
                    {data.bankInfoText}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setShowQrModal(false)}
                  className={`w-full h-10 rounded-xl ${isDarkTemplate ? 'bg-[#25221F] text-stone-300 hover:bg-[#2e2a27]' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'} text-xs font-medium transition-colors cursor-pointer`}
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
              <div className={`p-6 sm:p-8 ${colors.cardRadius} ${colors.cardBg} border ${colors.cardBorder} shadow-sm`}>
                <div className="text-center mb-6">
                  <Heart className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--inv-accent)', fill: `${themeColor}25` }} />
                  <h3 className={`font-serif text-2xl font-semibold ${colors.title}`}>
                    Xác Nhận Tham Dự & Lời Chúc
                  </h3>
                  <p className={`text-xs sm:text-sm ${colors.bodyMuted} mt-1`}>
                    Để gia đình chuẩn bị chu đáo nhất, xin vui lòng gửi phản hồi trước ngày cưới.
                  </p>
                </div>

                {rsvpSuccessMsg ? (
                  <div className={`p-5 rounded-2xl ${isDarkTemplate ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-800'} border text-center animate-in fade-in zoom-in-95 duration-300`}>
                    <CheckCircle2 className={`w-7 h-7 ${isDarkTemplate ? 'text-emerald-400' : 'text-emerald-600'} mx-auto mb-2`} />
                    <div className="text-sm font-medium leading-relaxed">
                      {rsvpSuccessMsg}
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleRsvpSubmit} className="space-y-4">
                    <div>
                      <label className={`block text-xs font-semibold ${isDarkTemplate ? 'text-stone-300' : 'text-stone-700'} mb-1`}>
                        Họ tên của bạn / gia đình <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className={`w-full h-11 px-3.5 rounded-xl border ${colors.inputBorder} ${colors.inputBg} ${colors.inputText} text-sm focus:outline-none focus:ring-2`}
                        style={{ outlineColor: 'var(--inv-accent)' }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-xs font-semibold ${isDarkTemplate ? 'text-stone-300' : 'text-stone-700'} mb-1`}>
                          Tham dự hôn lễ?
                        </label>
                        <select
                          value={attendance}
                          onChange={(e: any) => setAttendance(e.target.value)}
                          className={`w-full h-11 px-3 rounded-xl border ${colors.inputBorder} ${colors.inputBg} ${colors.inputText} text-sm focus:outline-none`}
                        >
                          <option value="ATTENDING">Sẽ tham dự</option>
                          <option value="DECLINED">Rất tiếc không thể đến</option>
                        </select>
                      </div>

                      <div>
                        <label className={`block text-xs font-semibold ${isDarkTemplate ? 'text-stone-300' : 'text-stone-700'} mb-1`}>
                          Số người tham dự
                        </label>
                        <select
                          value={guestCount}
                          disabled={attendance === 'DECLINED'}
                          onChange={(e) => setGuestCount(Number(e.target.value))}
                          className={`w-full h-11 px-3 rounded-xl border ${colors.inputBorder} ${colors.inputBg} ${colors.inputText} text-sm focus:outline-none disabled:opacity-50`}
                        >
                          <option value={1}>1 người</option>
                          <option value={2}>2 người</option>
                          <option value={3}>3 người</option>
                          <option value={4}>4 người (Gia đình)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold ${isDarkTemplate ? 'text-stone-300' : 'text-stone-700'} mb-1`}>
                        Khách mời của ai?
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setSide('GROOM')}
                          className={`h-9 rounded-lg text-xs font-medium border transition-colors ${side === 'GROOM'
                            ? 'text-white'
                            : `${colors.inputBorder} ${isDarkTemplate ? 'text-stone-300 hover:bg-white/5' : 'text-stone-700 hover:bg-stone-50'}`
                            }`}
                          style={side === 'GROOM' ? { backgroundColor: 'var(--inv-accent)', borderColor: 'var(--inv-accent)' } : undefined}
                        >
                          Nhà Trai
                        </button>
                        <button
                          type="button"
                          onClick={() => setSide('BRIDE')}
                          className={`h-9 rounded-lg text-xs font-medium border transition-colors ${side === 'BRIDE'
                            ? 'text-white'
                            : `${colors.inputBorder} ${isDarkTemplate ? 'text-stone-300 hover:bg-white/5' : 'text-stone-700 hover:bg-stone-50'}`
                            }`}
                          style={side === 'BRIDE' ? { backgroundColor: 'var(--inv-accent)', borderColor: 'var(--inv-accent)' } : undefined}
                        >
                          Nhà Gái
                        </button>
                        <button
                          type="button"
                          onClick={() => setSide('BOTH')}
                          className={`h-9 rounded-lg text-xs font-medium border transition-colors ${side === 'BOTH'
                            ? 'text-white'
                            : `${colors.inputBorder} ${isDarkTemplate ? 'text-stone-300 hover:bg-white/5' : 'text-stone-700 hover:bg-stone-50'}`
                            }`}
                          style={side === 'BOTH' ? { backgroundColor: 'var(--inv-accent)', borderColor: 'var(--inv-accent)' } : undefined}
                        >
                          Cả Hai
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold ${isDarkTemplate ? 'text-stone-300' : 'text-stone-700'} mb-1`}>
                        Lời chúc gửi đến Cô Dâu & Chú Rể
                      </label>
                      <textarea
                        rows={3}
                        value={wishMessage}
                        onChange={(e) => setWishMessage(e.target.value)}
                        className={`w-full p-3 rounded-xl border ${colors.inputBorder} ${colors.inputBg} ${colors.inputText} text-sm focus:outline-none`}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingRsvp}
                      className="w-full h-11 rounded-xl text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50 shadow-xs"
                      style={{ backgroundColor: 'var(--inv-accent)' }}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmittingRsvp ? 'Đang gửi...' : 'Gửi Lời Chúc & Xác Nhận Tham Dự'}</span>
                    </button>
                  </form>
                )}

                {/* Guestbook List with New Wish Highlight */}
                {rsvpsList.length > 0 && (
                  <div className={`mt-8 pt-6 border-t ${colors.divider}`}>
                    <div className={`text-xs font-semibold ${colors.title} uppercase tracking-wider mb-3 flex items-center justify-between`}>
                      <span>Sổ Lưu Bút Trực Tuyến</span>
                      <span className="text-[10px] text-stone-400 font-mono">({rsvpsList.length} lời chúc)</span>
                    </div>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                      {rsvpsList.map((item) => {
                        const isNewlyAdded = item.id === newlyAddedRsvpId;
                        return (
                          <div
                            key={item.id}
                            className={`p-3.5 rounded-2xl border text-xs transition-all ${isNewlyAdded
                              ? isDarkTemplate ? 'bg-amber-950/40 border-amber-700 shadow-xs' : 'bg-amber-50/80 border-amber-300 shadow-xs'
                              : isDarkTemplate ? 'bg-[#25221F] border-white/10' : 'bg-stone-50 border-stone-200/80'
                              }`}
                          >
                            <div className={`flex items-center justify-between font-semibold ${colors.title}`}>
                              <span className="flex items-center gap-1.5">
                                <span>{item.guestName}</span>
                                {isNewlyAdded && (
                                  <span
                                    className="px-1.5 py-0.2 rounded-full text-[9px] font-mono"
                                    style={{ backgroundColor: `${themeColor}25`, color: 'var(--inv-accent)' }}
                                  >
                                    Vừa gửi
                                  </span>
                                )}
                              </span>
                              <span className="text-[10px] text-stone-400 font-normal">
                                {item.attendance === 'ATTENDING' ? 'Sẽ tham dự' : 'Gửi lời chúc'}
                              </span>
                            </div>
                            {item.wishMessage && (
                              <p className={`mt-1.5 ${colors.body} italic leading-relaxed`}>
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

            {/* 1. REPOSITIONED INVITATION FOOTER CREDITS (Tight mt-6 mb-4 right under RSVP Card) */}
            <div className="mt-6 mb-4 text-center space-y-2 px-2">
              <div>
                <Link
                  href="/thiep-cuoi"
                  className="inline-flex items-center gap-1.5 text-xs font-serif tracking-wide text-stone-600 hover:text-stone-900 transition-colors"
                >
                  <span>Thiệp cưới được thiết kế trên</span>
                  <span className="font-semibold underline underline-offset-4" style={{ color: 'var(--inv-accent)' }}>
                    PlusMoments
                  </span>
                </Link>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => setIsPinModalOpen(true)}
                  className="text-[11px] tracking-wide text-[#78716C] hover:text-stone-900 transition-colors cursor-pointer inline-flex items-center gap-1 font-medium hover:underline underline-offset-2 py-1"
                >
                  <span>Dành cho Cô Dâu & Chú Rể • Chỉnh sửa thiệp</span>
                </button>
              </div>
            </div>
          </section>

          {/* 2. CURATED SERVICE PACKAGES SHOWCASE AT BOTTOM OF INVITATION PAGE */}
          {servicePackages && servicePackages.length > 0 && (
            <section className={`border-t ${colors.divider} ${colors.styleType === 'noir' ? 'bg-[#151311]' : 'bg-[#F6F2EB]/70'} pt-10 pb-28 px-4 sm:px-6 mt-6`}>
              <div className="max-w-4xl mx-auto text-center">
                <span
                  className="text-[10px] uppercase tracking-[0.22em] font-semibold block mb-1"
                  style={{ color: 'var(--inv-accent)' }}
                >
                  ✦ DÀNH CHO KHÁCH MỜI SẮP CƯỚI ✦
                </span>
                <h3 className={`font-serif text-2xl sm:text-3xl font-normal ${colors.title} tracking-tight leading-snug`}>
                  Các Gói Chụp Ảnh & Phim Cưới Trọn Gói
                </h3>
                <p className={`text-xs sm:text-sm ${colors.bodyMuted} mt-2 font-normal max-w-md mx-auto leading-relaxed`}>
                  Lưu giữ khoảnh khắc trọng đại của hai bạn cùng đội ngũ nghệ sĩ hình ảnh PlusMoments.
                </p>

                {/* Curated Packages Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-left mt-8">
                  {servicePackages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className={`rounded-2xl border ${colors.cardBorder} ${colors.cardBg} p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow group`}
                    >
                      <div className="space-y-3">
                        {/* Package Cover Image aspect-[16/10] */}
                        {pkg.coverImage && (
                          <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden border border-stone-100 bg-stone-100">
                            <img
                              src={pkg.coverImage}
                              alt={pkg.name}
                              className="w-full h-full object-cover object-[50%_20%] group-hover:scale-105 transition-transform duration-500"
                            />
                            {pkg.badgeText && (
                              <span
                                className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-white text-[9px] font-bold tracking-wider uppercase shadow-xs"
                                style={{ backgroundColor: 'var(--inv-accent)' }}
                              >
                                {pkg.badgeText}
                              </span>
                            )}
                          </div>
                        )}

                        <div>
                          <h4 className={`font-serif text-lg font-medium ${colors.title} leading-snug`}>
                            {pkg.name}
                          </h4>
                          {pkg.subtitle && (
                            <p className={`text-[11px] ${colors.bodyMuted} mt-0.5 line-clamp-1`}>
                              {pkg.subtitle}
                            </p>
                          )}
                        </div>

                        {/* Price Tag */}
                        <div className="pt-1 flex items-baseline gap-1.5">
                          <span className="text-base font-serif font-bold" style={{ color: 'var(--inv-accent)' }}>
                            {pkg.price ? pkg.price.toLocaleString('vi-VN') + 'đ' : 'Liên hệ báo giá'}
                          </span>
                          {pkg.unit && (
                            <span className="text-[10px] text-stone-400 font-normal">
                              / {pkg.unit}
                            </span>
                          )}
                        </div>

                        {/* Highlights (2-3 items) */}
                        {pkg.highlightPoints && pkg.highlightPoints.length > 0 && (
                          <ul className={`space-y-1 pt-1 text-[11px] ${colors.body} border-t ${colors.divider}`}>
                            {pkg.highlightPoints.slice(0, 3).map((pt, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <span className="font-bold" style={{ color: 'var(--inv-accent)' }}>•</span>
                                <span className="line-clamp-1">{pt}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Actions */}
                      <div className={`pt-4 mt-3 border-t ${colors.divider}`}>
                        <Link
                          href="/bang-gia"
                          className="w-full py-2.5 px-3 rounded-xl text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-opacity hover:opacity-90 shadow-2xs"
                          style={{ backgroundColor: 'var(--inv-accent)' }}
                        >
                          <span>Xem Chi Tiết Bảng Giá</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Secondary CTA: Tự tạo thiệp cưới miễn phí */}
                <div className={`mt-8 pt-6 border-t ${colors.divider} flex flex-wrap items-center justify-center gap-4`}>
                  <Link
                    href="/thiep-cuoi/tao-moi"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-xs font-medium uppercase tracking-wider transition-all"
                    style={{ borderColor: 'var(--inv-accent)', color: 'var(--inv-accent)' }}
                  >
                    <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--inv-accent)' }} />
                    <span>Tự Tạo Thiệp Cưới Miễn Phí</span>
                  </Link>
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* Fullscreen Lightbox for All Invitation Images */}
      <FullscreenImageLightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={allLightboxImages}
        initialIndex={lightboxInitialIndex}
        themeColor={themeColor}
      />

      {/* Quick PIN Modal for Couple */}
      <CustomerPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        defaultSlug={data.slug}
      />

      {/* Google Fonts Preconnect & Stylesheet for 4 Invitation Typographies */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Dancing+Script:wght@500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
      />

      {/* Global Embedded Keyframes for Ken Burns, Shimmer, and Mask Reveal */}
      <style jsx global>{`
        .invitation-root .font-serif {
          font-family: var(--inv-font-serif, 'Cormorant Garamond', Georgia, serif) !important;
        }
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
