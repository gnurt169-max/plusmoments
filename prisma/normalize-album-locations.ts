import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const STANDARD_LOCATIONS = [
  'Studio PlusMoments',
  'Lễ Gia Tiên',
  'Sảnh Tiệc Khách Sạn',
  'Tiệc Cưới Ngoài Trời',
  'Ngoại Cảnh TP.HCM',
] as const;

export type StandardLocation = (typeof STANDARD_LOCATIONS)[number];

export function determineStandardLocation(rawLocation?: string | null): StandardLocation {
  if (!rawLocation) return 'Studio PlusMoments';
  const lower = rawLocation.trim().toLowerCase();

  // 1. Gia Tiên (ưu tiên kiểm tra trước Studio để xử lý các chuỗi như "Lễ Gia Tiên & Studio PlusMoments")
  if (lower.includes('gia tiên') || lower.includes('gia tien') || lower.includes('vu quy') || lower.includes('tân hôn')) {
    return 'Lễ Gia Tiên';
  }

  // 2. Khách sạn / Sảnh tiệc / Ballroom / Hotel
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

  // 3. Tiệc cưới ngoài trời / Outdoor
  if (
    lower.includes('ngoài trời') ||
    lower.includes('ngoai troi') ||
    lower.includes('outdoor') ||
    lower.includes('sân vườn') ||
    lower.includes('san vuon') ||
    lower.includes('bãi biển') ||
    lower.includes('bai bien')
  ) {
    return 'Tiệc Cưới Ngoài Trời';
  }

  // 4. Studio PlusMoments
  if (lower.includes('studio') || lower.includes('plusmoments')) {
    return 'Studio PlusMoments';
  }

  // 5. Ngoại cảnh TP.HCM / Mặc định
  return 'Ngoại Cảnh TP.HCM';
}

async function main() {
  console.log('🔄 Đang kiểm tra và chuẩn hóa địa điểm (location) của tất cả Album trong Database...\n');

  const allAlbums = await prisma.album.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      location: true,
      concept: true,
      published: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`📊 Tìm thấy tổng cộng: ${allAlbums.length} album trong Database.\n`);

  const changes: Array<{
    id: string;
    title: string;
    oldLocation: string | null;
    newLocation: string;
  }> = [];

  for (const album of allAlbums) {
    const targetLocation = determineStandardLocation(album.location);
    if (album.location !== targetLocation) {
      await prisma.album.update({
        where: { id: album.id },
        data: { location: targetLocation },
      });
      changes.push({
        id: album.id,
        title: album.title,
        oldLocation: album.location,
        newLocation: targetLocation,
      });
    }
  }

  if (changes.length > 0) {
    console.log(`✅ Đã cập nhật thành công ${changes.length} album:`);
    console.table(
      changes.map((c) => ({
        Title: c.title.length > 40 ? c.title.slice(0, 37) + '...' : c.title,
        'Trước khi sửa': c.oldLocation,
        'Địa điểm chuẩn hóa': c.newLocation,
      }))
    );
  } else {
    console.log('✨ Toàn bộ album đã chuẩn hóa đúng danh mục chuẩn, không cần thay đổi.');
  }

  // Thống kê phân bổ album theo từng địa điểm chuẩn
  const updatedAlbums = await prisma.album.findMany({
    select: { location: true },
  });

  const stats: Record<string, number> = {};
  for (const loc of STANDARD_LOCATIONS) {
    stats[loc] = 0;
  }
  for (const a of updatedAlbums) {
    const loc = a.location || 'Chưa xác định';
    stats[loc] = (stats[loc] || 0) + 1;
  }

  console.log('\n📈 BẢNG THỐNG KÊ SỐ LƯỢNG ALBUM THEO ĐỊA ĐIỂM CHUẨN:');
  console.table(
    Object.entries(stats).map(([location, count]) => ({
      'Địa điểm chuẩn': location,
      'Số lượng Album': count,
    }))
  );
}

main()
  .catch((err) => {
    console.error('❌ Lỗi chuẩn hóa dữ liệu album:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
