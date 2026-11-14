import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const DEFAULT_ADDONS = [
  {
    name: 'Quay Flycam 4K Ngoại Cảnh',
    description: 'Thêm góc quay toàn cảnh trên không bằng flycam 4K điện ảnh',
    price: 2500000,
    unit: '/ buổi',
    allowQuantity: false,
    isActive: true,
    orderIndex: 0,
  },
  {
    name: 'Thêm 01 Ngày Quay/Chụp Phóng Sự Tiệc Cưới',
    description: 'Ghi lại trọn vẹn không khí tiệc cưới, đón khách & nghi thức',
    price: 4000000,
    unit: '/ ngày',
    allowQuantity: true,
    isActive: true,
    orderIndex: 1,
  },
  {
    name: 'Nâng Cấp Váy Cưới Luxury Thiết Kế',
    description: 'Chọn váy cưới thiết kế cao cấp dòng giới hạn từ các NTK hàng đầu',
    price: 3000000,
    unit: '/ bộ',
    allowQuantity: true,
    isActive: true,
    orderIndex: 2,
  },
  {
    name: 'Makeup & Làm Tóc Cho Mẹ Dâu / Chú Rể',
    description: 'Chuyên viên trang điểm riêng chăm sóc diện mạo quý phái cho mẹ',
    price: 800000,
    unit: '/ người',
    allowQuantity: true,
    isActive: true,
    orderIndex: 3,
  },
  {
    name: 'Album Photobook Cao Cấp 30x30cm',
    description: 'In thêm photobook Fine Art 30 trang bọc da thủ công sang trọng',
    price: 2000000,
    unit: '/ cuốn',
    allowQuantity: true,
    isActive: true,
    orderIndex: 4,
  },
];

export async function POST() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const currentCount = await prisma.packageAddon.count();
    if (currentCount > 0) {
      return NextResponse.json({
        success: false,
        error: 'Hệ thống đã có danh sách Add-on. Không thể tự động chèn đè để bảo vệ dữ liệu.',
      });
    }

    await prisma.packageAddon.createMany({
      data: DEFAULT_ADDONS,
    });

    const addons = await prisma.packageAddon.findMany({
      orderBy: { orderIndex: 'asc' },
    });

    return NextResponse.json({
      success: true,
      message: 'Khởi tạo 5 dịch vụ cộng thêm mẫu phổ biến thành công!',
      addons,
    });
  } catch (error: any) {
    console.error('[API_ADMIN_ADDONS_SEED_ERROR]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khởi tạo Add-ons mặc định.' },
      { status: 500 }
    );
  }
}
