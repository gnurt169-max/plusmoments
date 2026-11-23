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
