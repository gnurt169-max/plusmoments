/**
 * Standalone, Server & Client safe Album Utilities.
 * Chứa các hàm chuẩn hóa Location, Concept và serialization an toàn tuyệt đối,
 * không phụ thuộc vào bất kỳ Client Component boundary ('use client') nào.
 */

export const STANDARD_ALBUM_LOCATIONS = [
  'Studio PlusMoments',
  'Lễ Gia Tiên',
  'Sảnh Tiệc Khách Sạn',
  'Tiệc Cưới Ngoài Trời',
  'Ngoại Cảnh TP.HCM',
] as const;

export type StandardAlbumLocation = (typeof STANDARD_ALBUM_LOCATIONS)[number];

/**
 * Chuẩn hóa nhãn địa điểm theo bộ Danh Mục Địa Điểm Chuẩn PlusMoments:
 * 1. Studio PlusMoments
 * 2. Lễ Gia Tiên
 * 3. Sảnh Tiệc Khách Sạn
 * 4. Tiệc Cưới Ngoài Trời
 * 5. Ngoại Cảnh TP.HCM
 *
 * Phòng vệ Null-Safety 100%: Nhận value?: string | null, không bao giờ crash kể cả khi truyền null/undefined.
 */
export function normalizeLocationLabel(value?: string | null): string {
  const raw = (value ?? '').trim();
  if (!raw) return 'Studio PlusMoments';

  const lower = raw.toLowerCase();

  // 1. Lễ Gia Tiên (kiểm tra trước Studio để xử lý các chuỗi như "Lễ Gia Tiên & Studio PlusMoments")
  if (
    lower.includes('gia tiên') ||
    lower.includes('gia tien') ||
    lower.includes('vu quy') ||
    lower.includes('tân hôn') ||
    lower.includes('tan hon')
  ) {
    return 'Lễ Gia Tiên';
  }

  // 2. Sảnh Tiệc Khách Sạn / Ballroom / Hotel
  if (
    lower.includes('khách sạn') ||
    lower.includes('khach san') ||
    lower.includes('sảnh tiệc') ||
    lower.includes('sanh tiec') ||
    lower.includes('ballroom') ||
    lower.includes('hotel')
  ) {
    return 'Sảnh Tiệc Khách Sạn';
  }

  // 3. Tiệc Cưới Ngoài Trời / Outdoor
  if (
    lower.includes('ngoài trời') ||
    lower.includes('ngoai troi') ||
    lower.includes('outdoor') ||
    lower.includes('sân vườn') ||
    lower.includes('san vuon') ||
    lower.includes('bãi biển') ||
    lower.includes('bai bien') ||
    lower.includes('resort')
  ) {
    return 'Tiệc Cưới Ngoài Trời';
  }

  // 4. Studio PlusMoments
  if (lower.includes('studio') || lower.includes('plusmoments')) {
    return 'Studio PlusMoments';
  }

  // 5. Ngoại Cảnh TP.HCM / Sài Gòn
  if (
    lower.includes('ngoại cảnh') ||
    lower.includes('ngoai canh') ||
    lower.includes('hồ chí minh') ||
    lower.includes('tp.hcm') ||
    lower.includes('tphcm') ||
    lower.includes('sài gòn') ||
    lower.includes('sai gon')
  ) {
    return 'Ngoại Cảnh TP.HCM';
  }

  return raw;
}

/**
 * Tách và chuẩn hóa các địa điểm từ chuỗi location của album (hỗ trợ phân tách bằng &, ,, hoặc /)
 */
export function extractNormalizedLocations(rawLocation?: string | null): string[] {
  const raw = (rawLocation ?? '').trim();
  if (!raw) return ['Studio PlusMoments'];

  const parts = raw
    .split(/&|,|\//)
    .map((p) => (p ?? '').trim())
    .filter(Boolean);

  if (parts.length === 0) return ['Studio PlusMoments'];

  const normalized = parts.map((p) => normalizeLocationLabel(p));
  return Array.from(new Set(normalized));
}

/**
 * Rút gọn nhãn hiển thị Concept trên Mobile
 */
export function getShortConceptLabel(concept?: string | null): string {
  const raw = (concept ?? '').trim();
  if (!raw || raw === 'Tất Cả') return 'Tất Cả';

  if (raw.includes(',')) {
    return raw.split(',')[0].trim();
  }
  if (raw.includes(' & ') && raw.length > 18) {
    return raw.split(' & ')[0].trim();
  }
  if (raw.length > 20) {
    return raw.slice(0, 18) + '...';
  }
  return raw;
}

/**
 * Serialize Album từ Prisma Entity sang Plain Object cho Client Component
 * Đảm bảo 100% không bao giờ có Date Object hay hàm bên trong, null-safety toàn diện.
 */
export function serializeAlbumForClient(a: any) {
  if (!a) return null;

  const title = (a.title ?? '').trim() || 'Bộ Sưu Tập Cưới';
  const coupleNames = (a.coupleNames ?? '').trim() || 'Cô dâu & Chú rể';
  const concept = (a.category?.trim() || a.concept?.trim()) || 'Pre-Wedding Luxury';
  const location = normalizeLocationLabel(a.location);
  const coverImage = (a.coverImage ?? '').trim() || (a.media?.[0]?.url ?? '').trim() || '/placeholder.jpg';
  const videoUrl = a.videoUrl ? String(a.videoUrl).trim() : null;
  const blurDataUrl = a.blurDataUrl ? String(a.blurDataUrl).trim() : null;

  return {
    id: String(a.id ?? ''),
    slug: String(a.slug ?? ''),
    title,
    subtitle: a.subtitle ? String(a.subtitle).trim() : null,
    description: a.description ? String(a.description).trim() : null,
    coupleNames,
    concept,
    location,
    coverImage,
    videoUrl,
    blurDataUrl,
  };
}
