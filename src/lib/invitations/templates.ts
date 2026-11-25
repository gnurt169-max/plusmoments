export interface InvitationGalleryImage {
  id: string;
  url: string;
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  caption?: string;
}

export interface InvitationTemplateConfig {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  badge: string;
  previewCover: string;
  defaultThemeColor: string;
  accentColors: { label: string; hex: string }[];
  styleClasses: {
    fontSerif: string;
    bgWrapper: string;
    cardBg: string;
    borderAccent: string;
    textPrimary: string;
    textSecondary: string;
    goldAccent: string;
  };
}

export const INVITATION_TEMPLATES: Record<string, InvitationTemplateConfig> = {
  'timeless-ivory': {
    id: 'timeless-ivory',
    name: 'Timeless Ivory',
    subtitle: 'Cổ Điển & Tinh Khôi',
    description: 'Tone ngà hoàng gia sang trọng, khung viền đồng nhung thanh lịch và typography tinh tế phong cách đám cưới Paris.',
    badge: 'Được Yêu Thích Nhất',
    previewCover: '/images/templates/timeless-ivory.jpg',
    defaultThemeColor: '#8C6D46',
    accentColors: [
      { label: 'Gold Bronze', hex: '#8C6D46' },
      { label: 'Royal Burgundy', hex: '#6B2D38' },
      { label: 'Champagne', hex: '#A3885C' },
      { label: 'Deep Amber', hex: '#92400E' },
    ],
    styleClasses: {
      fontSerif: 'font-serif',
      bgWrapper: 'bg-[#FAF8F5]',
      cardBg: 'bg-white',
      borderAccent: 'border-[#8C6D46]/25',
      textPrimary: 'text-stone-900',
      textSecondary: 'text-stone-600',
      goldAccent: 'text-[#8C6D46]',
    },
  },
  'cinematic-noir': {
    id: 'cinematic-noir',
    name: 'Cinematic Noir',
    subtitle: 'Điện Ảnh & Tối Giản',
    description: 'Phong cách Vogue hiện đại với nền than trầm, tương phản sắc nét tôn vinh trọn vẹn từng khoảnh khắc ảnh cưới.',
    badge: 'Phong Cách Vogue',
    previewCover: '/images/templates/cinematic-noir.jpg',
    defaultThemeColor: '#D4AF37',
    accentColors: [
      { label: 'Pure Gold', hex: '#D4AF37' },
      { label: 'Platinum White', hex: '#E5E7EB' },
      { label: 'Copper Rose', hex: '#B76E79' },
      { label: 'Warm Sand', hex: '#C2B280' },
    ],
    styleClasses: {
      fontSerif: 'font-serif',
      bgWrapper: 'bg-[#121212]',
      cardBg: 'bg-[#1C1C1E]',
      borderAccent: 'border-white/15',
      textPrimary: 'text-stone-100',
      textSecondary: 'text-stone-400',
      goldAccent: 'text-[#D4AF37]',
    },
  },
  'botanical-silk': {
    id: 'botanical-silk',
    name: 'Botanical Silk',
    subtitle: 'Nàng Thơ & Thiên Nhiên',
    description: 'Hơi thở lãng mạn nhẹ nhàng xứ sương mù, sắc xanh ngọc olive kết hợp đường viền lụa hữu cơ ấm áp.',
    badge: 'Lãng Mạn & Trong Trẻo',
    previewCover: '/images/templates/botanical-silk.jpg',
    defaultThemeColor: '#4A6B53',
    accentColors: [
      { label: 'Olive Sage', hex: '#4A6B53' },
      { label: 'Dusty Rose', hex: '#9C6674' },
      { label: 'Earthy Clay', hex: '#8C5E47' },
      { label: 'Forest Pine', hex: '#2C4A38' },
    ],
    styleClasses: {
      fontSerif: 'font-serif',
      bgWrapper: 'bg-[#F4F6F3]',
      cardBg: 'bg-white',
      borderAccent: 'border-[#4A6B53]/25',
      textPrimary: 'text-stone-900',
      textSecondary: 'text-stone-600',
      goldAccent: 'text-[#4A6B53]',
    },
  },
  'minimalist-story': {
    id: 'minimalist-story',
    name: 'Minimalist Story',
    subtitle: 'Mộc Mạc & Chân Thành',
    description: 'Tôn trọng vẻ đẹp nguyên bản, tập trung vào câu chuyện tình yêu và hình ảnh giàu cảm xúc của cặp đôi.',
    badge: 'Hiện Đại Tối Giản',
    previewCover: '/images/templates/minimalist-story.jpg',
    defaultThemeColor: '#3A3A3C',
    accentColors: [
      { label: 'Charcoal', hex: '#3A3A3C' },
      { label: 'Terracotta', hex: '#A45D43' },
      { label: 'Muted Gold', hex: '#9A8050' },
      { label: 'Warm Taupe', hex: '#736B60' },
    ],
    styleClasses: {
      fontSerif: 'font-serif',
      bgWrapper: 'bg-[#FBFBFA]',
      cardBg: 'bg-white',
      borderAccent: 'border-stone-200',
      textPrimary: 'text-stone-900',
      textSecondary: 'text-stone-600',
      goldAccent: 'text-[#3A3A3C]',
    },
  },
};

export const MUSIC_PRESETS = [
  { id: 'romantic-piano', name: 'Romantic Piano (Ánh trăng & Phím dương cầm)', artist: 'PlusMoments Melodies' },
  { id: 'acoustic-love', name: 'Acoustic Love (Mộc mạc & Ngọt ngào)', artist: 'Acoustic Soul' },
  { id: 'cinematic-orchestral', name: 'Cinematic Orchestral (Dàn nhạc giao hưởng điện ảnh)', artist: 'Cinema Strings' },
  { id: 'gentle-strings', name: 'Gentle Strings (Vĩ cầm thanh tao)', artist: 'Orchestral Love' },
];

export interface InvitationFontOption {
  id: string;
  name: string;
  styleName: string;
  fontFamily: string;
  cssClass: string;
  sampleText: string;
}

export const INVITATION_FONTS: InvitationFontOption[] = [
  {
    id: 'cormorant',
    name: 'Cormorant Garamond',
    styleName: 'Cổ điển & Quý phái',
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    cssClass: 'font-serif',
    sampleText: 'Save The Date',
  },
  {
    id: 'playfair',
    name: 'Playfair Display',
    styleName: 'Tạp chí Thời trang',
    fontFamily: "'Playfair Display', Georgia, serif",
    cssClass: 'font-serif',
    sampleText: 'Save The Date',
  },
  {
    id: 'be-vietnam',
    name: 'Be Vietnam Pro',
    styleName: 'Hiện đại & Tinh gọn',
    fontFamily: "'Be Vietnam Pro', system-ui, -apple-system, sans-serif",
    cssClass: 'font-sans',
    sampleText: 'Save The Date',
  },
  {
    id: 'dancing',
    name: 'Dancing Script',
    styleName: 'Thư pháp Lãng mạn',
    fontFamily: "'Dancing Script', cursive",
    cssClass: 'font-serif italic',
    sampleText: 'Save The Date',
  },
];

export interface VietQrBankOption {
  id: string; // Mã ngân hàng chuẩn VietQR
  name: string; // Tên hiển thị đầy đủ
  shortName: string; // Tên ngắn gọn phổ biến
}

export const VIETQR_BANKS: VietQrBankOption[] = [
  { id: 'VCB', shortName: 'Vietcombank', name: 'Vietcombank — Ngân hàng Ngoại Thương Việt Nam' },
  { id: 'TCB', shortName: 'Techcombank', name: 'Techcombank — Ngân hàng Kỹ Thương' },
  { id: 'MB', shortName: 'MB Bank', name: 'MB Bank — Ngân hàng Quân Đội' },
  { id: 'ACB', shortName: 'ACB', name: 'ACB — Ngân hàng Á Châu' },
  { id: 'BIDV', shortName: 'BIDV', name: 'BIDV — Ngân hàng Đầu tư và Phát triển Việt Nam' },
  { id: 'ICB', shortName: 'VietinBank', name: 'VietinBank — Ngân hàng Công Thương Việt Nam' },
  { id: 'VPB', shortName: 'VPBank', name: 'VPBank — Ngân hàng Việt Nam Thịnh Vượng' },
  { id: 'TPB', shortName: 'TPBank', name: 'TPBank — Ngân hàng Tiên Phong' },
  { id: 'STB', shortName: 'Sacombank', name: 'Sacombank — Ngân hàng Sài Gòn Thương Tín' },
  { id: 'HDB', shortName: 'HDBank', name: 'HDBank — Ngân hàng Phát triển TP.HCM' },
  { id: 'VIB', shortName: 'VIB', name: 'VIB — Ngân hàng Quốc Tế' },
  { id: 'MSB', shortName: 'MSB', name: 'MSB — Ngân hàng Hàng Hải' },
  { id: 'OCB', shortName: 'OCB', name: 'OCB — Ngân hàng Phương Đông' },
  { id: 'SHBVN', shortName: 'Shinhan Bank', name: 'Shinhan Bank — Ngân hàng Shinhan Việt Nam' },
  { id: 'TIMO', shortName: 'Timo', name: 'Timo by BVBank — Ngân hàng số Timo' },
  { id: 'SEAB', shortName: 'SeABank', name: 'SeABank — Ngân hàng Đông Nam Á' },
  { id: 'LPB', shortName: 'LPBank', name: 'LPBank — Ngân hàng Lộc Phát Việt Nam' },
];

export function normalizeVietnameseForQr(text: string): string {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

export function buildVietQrUrl(params: {
  bankId?: string | null;
  bankAccount?: string | null;
  bankOwner?: string | null;
  giftAmount?: number | string | null;
  giftMessage?: string | null;
}): string {
  const { bankId, bankAccount, bankOwner, giftAmount, giftMessage } = params;
  if (!bankId || !bankAccount) return '';

  const cleanAccount = String(bankAccount).replace(/\s+/g, '');
  const cleanAmount = giftAmount && Number(giftAmount) > 0 ? String(Math.round(Number(giftAmount))) : '';
  const normalizedMsg = giftMessage ? normalizeVietnameseForQr(giftMessage) : '';
  const cleanOwner = bankOwner ? bankOwner.trim().toUpperCase() : '';

  let url = `https://img.vietqr.io/image/${bankId}-${cleanAccount}-compact2.png`;
  const queryParts: string[] = [];

  if (cleanAmount) {
    queryParts.push(`amount=${encodeURIComponent(cleanAmount)}`);
  }
  if (normalizedMsg) {
    queryParts.push(`addInfo=${encodeURIComponent(normalizedMsg)}`);
  }
  if (cleanOwner) {
    queryParts.push(`accountName=${encodeURIComponent(cleanOwner)}`);
  }

  if (queryParts.length > 0) {
    url += `?${queryParts.join('&')}`;
  }

  return url;
}

export function generateRandomSlug(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let rand = '';
  for (let i = 0; i < 6; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `pm-${rand}`;
}

export function generateRandomPin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
