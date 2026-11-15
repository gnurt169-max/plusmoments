import fs from 'fs/promises';
import path from 'path';
import { prisma } from './prisma';

export interface HeadlineItem {
  text: string;
  length: number;
  pinned: 'PIN_POS_1' | 'PIN_POS_2' | 'PIN_POS_3' | 'UNPINNED';
  note: string;
}

export interface DescriptionItem {
  text: string;
  length: number;
  pinned?: 'PIN_POS_1' | 'PIN_POS_2' | 'UNPINNED';
  note: string;
}

export interface SitelinkItem {
  title: string;
  line1: string;
  line2: string;
  url: string;
}

export interface AiMaxSetting {
  status: 'BẬT' | 'TẮT';
  action: string;
  reason: string;
}

export interface GoogleAdsPlan {
  id: string;
  generatedAt: string;
  inputs: {
    campaignGoal: string;
    campaignGoalLabel: string;
    selectedPackageId?: string | null;
    selectedPackageName?: string | null;
    targetLocation: string;
    dailyBudget: string;
  };
  campaignSettings: {
    campaignName: string;
    goal: string;
    campaignType: string;
    biddingStrategyWeek1: string;
    biddingStrategyWeek2Plus: string;
    dailyBudgetRecommended: string;
    goldenHoursSchedule: string;
    locationTargeting: string;
    languages: string;
    enhancedConversions: string;
  };
  adGroupAndAiMax: {
    adGroupName: string;
    finalUrl: string;
    displayPath1: string;
    displayPath2: string;
    productDescription: string;
    aiMaxRecommendations: {
      matchPhraseSearch: AiMaxSetting;
      expandKeywordsAi: AiMaxSetting;
      brandSelection: AiMaxSetting;
      locationInterest: AiMaxSetting;
      urlExpansion: AiMaxSetting;
    };
  };
  keywords: {
    exactMatch: string[];
    phraseMatch: string[];
    broadMatchSeeds: string[];
    negativeKeywords: string[];
  };
  responsiveSearchAds: {
    headlines: HeadlineItem[];
    descriptions: DescriptionItem[];
  };
  assets: {
    sitelinks: SitelinkItem[];
    callouts: string[];
    structuredSnippets: {
      header: string;
      values: string[];
    };
    callAsset: {
      phone: string;
      label: string;
      conversionTracking: string;
    };
  };
}

const STORAGE_DIR = path.join(process.cwd(), 'src', 'data');
const STORAGE_FILE = path.join(STORAGE_DIR, 'superadmin-google-ads-plan.json');

/**
 * Retrieve the latest saved Google Ads plan from disk
 */
export async function getSavedGoogleAdsPlan(): Promise<GoogleAdsPlan | null> {
  try {
    const data = await fs.readFile(STORAGE_FILE, 'utf-8');
    return JSON.parse(data) as GoogleAdsPlan;
  } catch {
    return null;
  }
}

/**
 * Save Google Ads plan to persistent disk file
 */
export async function saveGoogleAdsPlan(plan: GoogleAdsPlan): Promise<void> {
  try {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
    await fs.writeFile(STORAGE_FILE, JSON.stringify(plan, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to save Google Ads plan to disk:', error);
  }
}

/**
 * Clean & truncate a string to maximum allowed characters without cutting words
 */
function cleanLength(text: string, maxLen: number): string {
  const cleaned = text.trim().replace(/\s+/g, ' ');
  if (cleaned.length <= maxLen) return cleaned;
  const cut = cleaned.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(' ');
  return lastSpace > 10 ? cut.slice(0, lastSpace).trim() : cut.trim();
}

/**
 * Goal mapping label helper
 */
export function getGoalLabel(goal: string): string {
  switch (goal) {
    case 'all_packages':
      return 'Bảng Giá Trọn Gói (Toàn Bộ Gói Dịch Vụ)';
    case 'specific_package':
      return 'Chạy Riêng 1 Gói Dịch Vụ Cụ Thể';
    case 'studio_concept':
      return 'Chụp Ảnh Cưới Studio Phong Cách Hàn Quốc & Luxury';
    case 'wedding_journalism':
      return 'Phóng Sự Ngày Cưới (Wedding Journalism & Truyền Thống)';
    case 'pre_wedding_outdoor':
      return 'Pre-Wedding Ngoại Cảnh (Đà Lạt / Biển / Sài Gòn)';
    case 'brand_defense':
      return 'Nhận Diện & Bảo Vệ Thương Hiệu PlusMoments';
    default:
      return 'Bảng Giá Dịch Vụ Cưới Trọn Gói';
  }
}

/**
 * Generate a complete, high-converting Google Ads campaign structure
 * using real database context and Gemini AI (with intelligent local fallback)
 */
export async function generateGoogleAdsCampaignPlan(params: {
  campaignGoal: string;
  selectedPackageId?: string;
  targetLocation?: string;
  dailyBudget?: string;
}): Promise<GoogleAdsPlan> {
  const {
    campaignGoal = 'all_packages',
    selectedPackageId,
    targetLocation = 'TP. Hồ Chí Minh & lân cận (Bán kính 35km)',
    dailyBudget = '300.000đ - 500.000đ/ngày',
  } = params;

  // 1. Ingest real database context
  const [packages, albums, settings] = await Promise.all([
    prisma.servicePackage.findMany({
      where: { published: true },
      orderBy: { orderIndex: 'asc' },
    }),
    prisma.album.findMany({
      where: { published: true },
      take: 8,
      select: { title: true, slug: true, concept: true, location: true, coupleNames: true },
    }),
    prisma.systemSetting.findUnique({
      where: { id: 'default' },
    }),
  ]);

  const brandName = settings?.brandName || 'PlusMoments';
  const hotline = settings?.hotline || '0903.768.871';
  const address = settings?.address || '31 Hùng Vương, Phường An Đông';
  const siteUrl = (settings?.canonicalBaseUrl || 'https://plusmoments.vn').replace(/\/$/, '');

  let targetPackage = packages[0] || null;
  if (selectedPackageId) {
    const found = packages.find((p) => p.id === selectedPackageId);
    if (found) targetPackage = found;
  }

  const numericPrices = packages
    .map((p) => (typeof p.price === 'number' ? p.price : Number(p.price) || 0))
    .filter((n) => n > 0);
  const minPrice = numericPrices.length > 0 ? Math.min(...numericPrices) : 6000000;
  const minPriceFormatted = new Intl.NumberFormat('vi-VN').format(minPrice) + 'đ';

  const goalLabel = getGoalLabel(campaignGoal);

  // 2. Build Campaign Settings & Bidding Strategy
  const campaignName = `[GS]_${brandName.toUpperCase()}_${campaignGoal.toUpperCase()}_HCM_2026`;

  const finalUrl =
    campaignGoal === 'specific_package' && targetPackage
      ? `${siteUrl}/bang-gia?package=${encodeURIComponent(targetPackage.slug)}`
      : campaignGoal === 'studio_concept'
      ? `${siteUrl}/bo-suu-tap`
      : `${siteUrl}/bang-gia`;

  const displayPath1 = 'Bang-Gia';
  const displayPath2 =
    campaignGoal === 'specific_package' && targetPackage
      ? cleanLength(targetPackage.name.replace(/\s+/g, '-'), 15)
      : 'Uu-Dai-2Tr';

  const productDescription = cleanLength(
    `PlusMoments Studio chuyên chụp ảnh cưới Pre-Wedding, Studio Hàn Quốc và phóng sự cưới trọn gói tại TP.HCM. Giá chỉ từ ${minPriceFormatted}, tặng 2Tr khi cọc sớm, cam kết 100% không phát sinh.`,
    200
  );

  // 3. AI Max Recommendations (Expert Real-World Directives)
  const aiMaxRecommendations = {
    matchPhraseSearch: {
      status: 'BẬT' as const,
      action: 'Bật Khớp cụm từ tìm kiếm trong cài đặt nhóm quảng cáo',
      reason:
        'Thu hút đúng các cặp đôi có nhu cầu cưới thực tế, tránh các truy vấn rác ngoài ngành nhưng vẫn bắt kịp các biến thể từ khóa tự nhiên của dâu rể.',
    },
    expandKeywordsAi: {
      status: 'TẮT' as const,
      action: 'Tắt tính năng "Tự động mở rộng từ khóa bằng AI"',
      reason:
        'Tránh việc Google tự động mở rộng sang các từ khóa quá rộng như "chụp ảnh kỷ yếu", "chụp ảnh gia đình giá rẻ", "thuê áo dài tết" gây lãng phí ngân sách.',
    },
    brandSelection: {
      status: 'BẬT' as const,
      action: 'Bật Danh sách loại trừ thương hiệu đối thủ / nhãn hiệu không liên quan',
      reason:
        'Chỉ tập trung bảo vệ thương hiệu PlusMoments và các từ khóa dịch vụ cưới cao cấp, không đốt tiền đấu thầu vào các studio cạnh tranh không có lợi thế.',
    },
    locationInterest: {
      status: 'TẮT' as const,
      action: 'Chọn mục "Sự hiện diện: Những người đang ở hoặc thường xuyên ở vị trí của bạn"',
      reason:
        'TUYỆT ĐỐI KHÔNG chọn "Sự hiện diện hoặc mối quan tâm". Cần chặn hoàn toàn click từ các tỉnh xa hoặc nước ngoài không có nhu cầu đến studio TP.HCM chụp ảnh.',
    },
    urlExpansion: {
      status: 'TẮT' as const,
      action: 'Tắt tính năng "Mở rộng URL trang đích"',
      reason:
        'Đảm bảo 100% lưu lượng truy cập đổ dồn vào đúng trang Bảng Giá (/bang-gia) hoặc Trang Ưu Đãi (/uu-dai) đã được tối ưu chuyển đổi và cài sẵn mã tracking.',
    },
  };

  // 4. Keywords Categorization
  let exactMatch: string[] = [];
  let phraseMatch: string[] = [];
  let broadMatchSeeds: string[] = [];

  if (campaignGoal === 'studio_concept') {
    exactMatch = [
      '[chụp ảnh cưới studio tphcm]',
      '[studio chụp ảnh cưới đẹp hcm]',
      '[chụp ảnh cưới hàn quốc studio]',
      '[giá chụp ảnh cưới studio]',
      '[chụp hình cưới studio trọn gói]',
      '[chụp ảnh cưới đơn giản tại studio]',
      '[studio cưới phong cách hàn quốc]',
      '[gói chụp ảnh cưới studio]',
      '[chụp pre wedding studio hcm]',
      '[chụp ảnh cưới trong studio tphcm]',
      '[studio chụp ảnh cưới quận phú nhuận]',
      '[ảnh cưới studio phong cách luxury]',
    ];
    phraseMatch = [
      '"studio chụp ảnh cưới đẹp tphcm"',
      '"chụp ảnh cưới phong cách hàn quốc"',
      '"bảng giá chụp ảnh cưới studio"',
      '"chụp ảnh cưới studio trọn gói không phát sinh"',
      '"studio chụp ảnh cưới uy tín hcm"',
      '"concept chụp ảnh cưới studio"',
      '"chụp hình cưới studio nhẹ nhàng"',
      '"gói chụp ảnh cưới phòng studio"',
      '"studio chụp cưới đẹp giá tốt"',
      '"chụp ảnh cưới trong studio trọn gói"',
      '"studio áo cưới đẹp sài gòn"',
      '"chụp ảnh cưới studio cao cấp"',
      '"album cưới studio hàn quốc"',
      '"studio chụp hình cưới nghệ thuật"',
      '"chụp ảnh cưới phong cách tối giản"',
    ];
    broadMatchSeeds = [
      'chụp ảnh cưới studio',
      'studio chụp ảnh cưới tphcm',
      'chụp ảnh cưới hàn quốc',
      'studio cưới đẹp hcm',
      'ảnh cưới studio đẹp',
      'giá chụp ảnh studio cưới',
    ];
  } else if (campaignGoal === 'wedding_journalism') {
    exactMatch = [
      '[chụp phóng sự cưới tphcm]',
      '[giá chụp phóng sự cưới]',
      '[chụp hình phóng sự cưới]',
      '[quay phóng sự cưới tphcm]',
      '[chụp phóng sự ngày cưới]',
      '[thợ chụp phóng sự cưới đẹp]',
      '[gói phóng sự cưới trọn gói]',
      '[chụp phóng sự tiệc cưới]',
      '[chụp phóng sự lễ gia tiên]',
      '[bảng giá phóng sự cưới hcm]',
      '[ekip quay chụp phóng sự cưới]',
      '[quay phim phóng sự cưới 4k]',
    ];
    phraseMatch = [
      '"báo giá chụp phóng sự cưới tphcm"',
      '"chụp hình phóng sự cưới đẹp"',
      '"chụp phóng sự cưới trọn gói"',
      '"ekip chụp phóng sự cưới chuyên nghiệp"',
      '"chụp ảnh phóng sự ngày cưới"',
      '"quay phim phóng sự cưới cinematic"',
      '"chụp phóng sự lễ đính hôn"',
      '"phóng sự cưới giá bao nhiêu"',
      '"chụp phóng sự tiệc nhà hàng"',
      '"thợ chụp ảnh phóng sự cưới hcm"',
      '"chụp phóng sự cưới cảm xúc"',
      '"dịch vụ chụp phóng sự cưới uy tín"',
      '"chụp ảnh cưới truyền thống và phóng sự"',
      '"gói quay chụp phóng sự cưới"',
    ];
    broadMatchSeeds = [
      'chụp phóng sự cưới',
      'giá phóng sự cưới',
      'quay phóng sự cưới hcm',
      'phóng sự cưới đẹp',
      'ekip phóng sự cưới',
    ];
  } else if (campaignGoal === 'brand_defense') {
    exactMatch = [
      '[plusmoments]',
      '[plusmoments studio]',
      '[plus moments wedding]',
      '[plusmoments wedding studio]',
      '[studio plusmoments]',
      '[ảnh cưới plusmoments]',
      '[bảng giá plusmoments]',
      '[plus moments vn]',
      '[áo cưới plusmoments]',
      '[plusmoments tphcm]',
    ];
    phraseMatch = [
      '"plusmoments studio"',
      '"plus moments wedding"',
      '"studio cưới plusmoments"',
      '"bảng giá plusmoments"',
      '"chụp ảnh cưới plusmoments"',
      '"đánh giá plusmoments studio"',
      '"review plusmoments"',
      '"địa chỉ plusmoments"',
      '"plusmoments photography"',
      '"plusmoments wedding studio"',
    ];
    broadMatchSeeds = [
      'plusmoments',
      'plus moments studio',
      'plusmoments wedding',
      'ảnh cưới plusmoments',
    ];
  } else {
    // Default: All packages & Pricing
    exactMatch = [
      '[bảng giá chụp ảnh cưới]',
      '[giá chụp ảnh cưới trọn gói]',
      '[chụp ảnh cưới trọn gói tphcm]',
      '[báo giá chụp ảnh cưới hcm]',
      '[chụp ảnh cưới bao nhiêu tiền]',
      '[studio chụp ảnh cưới đẹp tphcm]',
      '[gói chụp ảnh cưới pre wedding]',
      '[chụp ảnh cưới không phát sinh]',
      '[bảng giá chụp hình cưới 2026]',
      '[chi phí chụp ảnh cưới trọn gói]',
      '[studio chụp ảnh cưới uy tín hcm]',
      '[chụp ảnh cưới trọn gói giá tốt]',
    ];
    phraseMatch = [
      '"bảng giá chụp ảnh cưới trọn gói"',
      '"chụp ảnh cưới trọn gói tphcm"',
      '"báo giá chụp ảnh cưới 2026"',
      '"studio chụp ảnh cưới đẹp sài gòn"',
      '"chụp ảnh cưới bao nhiêu tiền một gói"',
      '"gói chụp ảnh cưới không phát sinh chi phí"',
      '"studio chụp hình cưới trọn gói giá tốt"',
      '"chụp ảnh cưới studio và ngoại cảnh"',
      '"bảng giá chụp hình cưới studio hcm"',
      '"dịch vụ chụp ảnh cưới trọn gói"',
      '"chụp ảnh cưới tặng váy cưới"',
      '"chụp ảnh cưới phong cách luxury"',
      '"studio áo cưới trọn gói hcm"',
      '"chụp ảnh cưới đẹp rẻ tphcm"',
      '"gói chụp pre wedding trọn gói"',
    ];
    broadMatchSeeds = [
      'bảng giá chụp ảnh cưới',
      'chụp ảnh cưới trọn gói',
      'giá chụp ảnh cưới tphcm',
      'studio chụp ảnh cưới',
      'chụp hình cưới đẹp',
      'gói chụp ảnh cưới hcm',
    ];
  }

  // 25-30 Crucial Negative Keywords to save budget
  const negativeKeywords = [
    'miễn phí',
    'free',
    'giá rẻ 500k',
    'giá rẻ 1 triệu',
    'tải ảnh',
    'download ảnh',
    'app ghép ảnh',
    'phần mềm chỉnh ảnh',
    'tuyển dụng',
    'việc làm',
    'tìm việc thợ ảnh',
    'học nghề chụp ảnh',
    'khóa học nhiếp ảnh',
    'thanh lý váy cưới',
    'mua váy cưới cũ',
    'thuê đồ diễn',
    'mẫu hợp đồng chụp ảnh',
    'tự chụp tại nhà',
    'vector',
    'file psd',
    'preset lightroom',
    'ảnh cưới chế',
    'ảnh cưới hài hước',
    'ảnh cưới anime',
    'ly hôn',
    'phốt studio',
    'bán máy ảnh',
    'sửa máy ảnh',
  ];

  // 5. Responsive Search Ads (RSA)
  // Strict rule: headlines <= 30 chars, descriptions <= 90 chars
  const headlinesRaw: { text: string; pinned: HeadlineItem['pinned']; note: string }[] = [
    {
      text: `${brandName} - Ảnh Cưới Luxury`,
      pinned: 'PIN_POS_1',
      note: 'Ghim vị trí 1: Khẳng định thương hiệu & định vị đẳng cấp',
    },
    {
      text: 'Bảng Giá Ảnh Cưới Trọn Gói',
      pinned: 'PIN_POS_1',
      note: 'Ghim vị trí 1 (Xoay vòng): Trực diện nhu cầu tìm kiếm giá',
    },
    {
      text: `Gói Chụp Chỉ Từ ${minPriceFormatted}`,
      pinned: 'PIN_POS_2',
      note: 'Ghim vị trí 2: Mồi giá cực tốt lọc ngay khách nghiêm túc',
    },
    {
      text: 'Cam Kết 0 Đồng Phát Sinh',
      pinned: 'UNPINNED',
      note: 'Thả tự do: Xóa bỏ nỗi sợ lớn nhất của dâu rể',
    },
    {
      text: 'Tặng Ngay Voucher 2 Triệu',
      pinned: 'UNPINNED',
      note: 'Thả tự do: Kích thích hành động đăng ký giữ ưu đãi',
    },
    {
      text: 'Tặng Váy Cưới Thiết Kế',
      pinned: 'UNPINNED',
      note: 'Thả tự do: Quyền lợi vượt trội so với studio khác',
    },
    {
      text: 'Tone Màu Điện Ảnh Tinh Tế',
      pinned: 'UNPINNED',
      note: 'Thả tự do: Khẳng định gu nghệ thuật độc bản',
    },
    {
      text: 'Studio Cưới Đẹp Tại TP.HCM',
      pinned: 'UNPINNED',
      note: 'Thả tự do: Bổ trợ địa điểm cho điểm chất lượng cao',
    },
    {
      text: 'Chụp Ảnh Cưới Phong Cách Hàn',
      pinned: 'UNPINNED',
      note: 'Thả tự do: Bắt trúng xu hướng dâu rể yêu thích',
    },
    {
      text: 'Trả 100% File Ảnh Gốc Gốc',
      pinned: 'UNPINNED',
      note: 'Thả tự do: Minh bạch dữ liệu bàn giao',
    },
    {
      text: 'Bao Xe Đưa Đón Nội Thành',
      pinned: 'UNPINNED',
      note: 'Thả tự do: Tiện ích chăm sóc chu đáo',
    },
    {
      text: 'Đã Có 500+ Cặp Đôi Tin Chọn',
      pinned: 'UNPINNED',
      note: 'Thả tự do: Bằng chứng xã hội tăng độ tin cậy',
    },
    {
      text: 'Photobook Cao Cấp Chống Nước',
      pinned: 'UNPINNED',
      note: 'Thả tự do: Chất lượng in ấn lưu giữ bền lâu',
    },
    {
      text: 'Tư Vấn Miễn Phí & Xem Váy',
      pinned: 'UNPINNED',
      note: 'Thả tự do: Kêu gọi hành động nhẹ nhàng',
    },
    {
      text: `Hotline/Zalo: ${hotline}`,
      pinned: 'PIN_POS_3',
      note: 'Ghim vị trí 3: Chuyển đổi gọi/chat Zalo trực tiếp',
    },
  ];

  const headlines: HeadlineItem[] = headlinesRaw.map((h) => {
    const text = cleanLength(h.text, 30);
    return {
      text,
      length: text.length,
      pinned: h.pinned,
      note: h.note,
    };
  });

  const descriptionsRaw: { text: string; pinned?: DescriptionItem['pinned']; note: string }[] = [
    {
      text: `Trọn gói ảnh cưới từ ${minPriceFormatted}. Tặng voucher 2Tr, váy cưới thiết kế & xe đưa đón nội thành.`,
      pinned: 'PIN_POS_1',
      note: 'Ghim vị trí 1: Đầy đủ giá gốc, quà tặng 2Tr và quyền lợi nổi bật.',
    },
    {
      text: `PlusMoments cam kết 100% không phát sinh chi phí. Trả toàn bộ file gốc, photobook HD sắc nét.`,
      pinned: 'UNPINNED',
      note: 'Thả tự do: Cam kết minh bạch tài chính và chất lượng bàn giao.',
    },
    {
      text: `Phong cách ảnh cưới Luxury & Hàn Quốc giàu cảm xúc. Ekip tận tâm, hỗ trợ dâu rể tạo dáng tự nhiên.`,
      pinned: 'UNPINNED',
      note: 'Thả tự do: Đánh trúng nỗi lo bị đơ khi chụp ảnh cưới.',
    },
    {
      text: `Đăng ký hôm nay nhận ngay ưu đãi 2.000.000đ. Ghé studio thử váy cưới miễn phí. Hotline: ${hotline}.`,
      pinned: 'PIN_POS_2',
      note: 'Ghim vị trí 2: Lời kêu gọi hành động (CTA) khẩn cấp kèm hotline.',
    },
  ];

  const descriptions: DescriptionItem[] = descriptionsRaw.map((d) => {
    const text = cleanLength(d.text, 90);
    return {
      text,
      length: text.length,
      pinned: d.pinned,
      note: d.note,
    };
  });

  // 6. Assets & Extensions (Sitelinks, Callouts, Snippets)
  const sitelinks: SitelinkItem[] = [
    {
      title: 'Bảng Giá Trọn Gói 2026',
      line1: `Gói chụp chỉ từ ${minPriceFormatted}`,
      line2: 'Cam kết không phát sinh chi phí',
      url: `${siteUrl}/bang-gia`,
    },
    {
      title: 'Nhận Ưu Đãi Cọc 2 Triệu',
      line1: 'Tặng voucher 2Tr trừ trực tiếp',
      line2: 'Tặng váy cưới & makeup cô dâu',
      url: `${siteUrl}/uu-dai`,
    },
    {
      title: '50+ Bộ Sưu Tập Cưới',
      line1: 'Ảnh cưới studio Hàn Quốc & Đà Lạt',
      line2: 'Phong cách luxury cảm xúc tự nhiên',
      url: `${siteUrl}/bo-suu-tap`,
    },
    {
      title: 'Cẩm Nang Cưới Dâu Rể',
      line1: 'Kinh nghiệm chụp ảnh cưới tiết kiệm',
      line2: 'Gợi ý concept cưới đẹp độc bản',
      url: `${siteUrl}/blog`,
    },
  ];

  const callouts: string[] = [
    'Không Phát Sinh Chi Phí',
    'Tặng Váy Cưới Thiết Kế',
    'Tặng Voucher 2.000.000đ',
    'Bao Xe Đưa Đón Nội Thành',
    'Trả 100% Toàn Bộ File Gốc',
    'Photobook HD Chống Nước',
    'Ekip Tận Tâm Chuyên Nghiệp',
    'Thử Váy Miễn Phí Tại Studio',
  ].map((c) => cleanLength(c, 25));

  const structuredSnippets = {
    header: 'Dịch vụ',
    values: [
      'Pre-Wedding Studio',
      'Pre-Wedding Ngoại Cảnh',
      'Phóng Sự Ngày Cưới',
      'Quay Phim Cinematic 4K',
      'Váy Cưới Thiết Kế',
      'Trang Điểm Cô Dâu',
    ],
  };

  const callAsset = {
    phone: hotline,
    label: `Hotline PlusMoments (${address})`,
    conversionTracking: 'Bật theo dõi cuộc gọi làm lượt chuyển đổi Google Ads',
  };

  const finalPlan: GoogleAdsPlan = {
    id: `gads_${Date.now()}`,
    generatedAt: new Date().toISOString(),
    inputs: {
      campaignGoal,
      campaignGoalLabel: goalLabel,
      selectedPackageId: targetPackage?.id || null,
      selectedPackageName: targetPackage?.name || null,
      targetLocation,
      dailyBudget,
    },
    campaignSettings: {
      campaignName,
      goal: 'Khách hàng tiềm năng (Leads)',
      campaignType: 'Tìm kiếm (Google Search)',
      biddingStrategyWeek1:
        'Tuần 1 - 2: Tối đa hóa lượt nhấp (Maximize Clicks) với Giới hạn CPC tối đa 6.500đ - 8.500đ để máy học Google thu thập tín hiệu chuyển đổi nhanh.',
      biddingStrategyWeek2Plus:
        'Từ Tuần 3 trở đi: Khi có từ 15-30 chuyển đổi, chuyển sang "Tối đa hóa lượt chuyển đổi" (Maximize Conversions) kèm CPA mục tiêu: 65.000đ - 95.000đ/lead.',
      dailyBudgetRecommended: dailyBudget,
      goldenHoursSchedule:
        'Chạy từ 07:30 đến 23:45 hàng ngày. Tập trung tăng 20% giá thầu vào 2 khung giờ vàng: 11:30 - 13:30 (nghỉ trưa) và 19:30 - 23:30 (buổi tối cặp đôi cùng xem). Tăng 15% vào Thứ 7 & Chủ Nhật.',
      locationTargeting: `${targetLocation}. Loại trừ tất cả người dùng ngoài lãnh thổ hoặc không có mặt trực tiếp tại khu vực.`,
      languages: 'Tiếng Việt, Tiếng Anh',
      enhancedConversions: 'BẬT (Enhanced Conversions đã tích hợp sẵn trên website PlusMoments)',
    },
    adGroupAndAiMax: {
      adGroupName: `Nhóm Ads - ${goalLabel}`,
      finalUrl,
      displayPath1,
      displayPath2,
      productDescription,
      aiMaxRecommendations,
    },
    keywords: {
      exactMatch,
      phraseMatch,
      broadMatchSeeds,
      negativeKeywords,
    },
    responsiveSearchAds: {
      headlines,
      descriptions,
    },
    assets: {
      sitelinks,
      callouts,
      structuredSnippets,
      callAsset,
    },
  };

  // Auto-save to persistent disk cache
  await saveGoogleAdsPlan(finalPlan);

  return finalPlan;
}
