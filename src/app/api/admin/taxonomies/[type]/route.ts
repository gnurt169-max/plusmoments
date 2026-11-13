import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { exportDatabaseToSeedFiles } from '@/lib/seed-exporter';
import { getAdminSession } from '@/lib/auth';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

const DEFAULT_TAXONOMIES = {
  concepts: [
    { name: 'Outdoor Luxury (Ngoại cảnh cao cấp)', slug: 'outdoor-luxury', order: 1 },
    { name: 'Studio Editorial (Tạp chí Vogue/Hàn Quốc)', slug: 'studio-editorial', order: 2 },
    { name: 'Pre-Wedding Cinematic (Điện ảnh biển/đồi)', slug: 'pre-wedding-cinematic', order: 3 },
    { name: 'Phóng Sự Cưới (Wedding Ceremony)', slug: 'phong-su-cuoi', order: 4 },
  ],
  'blog-categories': [
    { name: 'Cẩm nang cưới', slug: 'cam-nang-cuoi', order: 1 },
    { name: 'Kinh nghiệm chụp ảnh', slug: 'kinh-nghiem-chup-anh', order: 2 },
    { name: 'Xu hướng váy cưới', slug: 'xu-huong-vay-cuoi', order: 3 },
    { name: 'Địa điểm chụp đẹp', slug: 'dia-diem-chup-dep', order: 4 },
  ],
  'service-categories': [
    { name: 'Ngoại Cảnh Pre-Wedding', slug: 'pre-wedding', order: 1 },
    { name: 'Studio Editorial Hàn Quốc', slug: 'studio-concept', order: 2 },
    { name: 'Phóng Sự Cưới (Wedding Day)', slug: 'wedding-day', order: 3 },
  ],
};

function getModelDelegate(type: string) {
  if (type === 'concepts') return prisma.albumConcept;
  if (type === 'blog-categories') return prisma.blogCategory;
  if (type === 'service-categories') return prisma.serviceCategory;
  return null;
}

export async function GET(
  request: Request,
  { params }: { params: { type: string } }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { type } = params;
    const delegate = getModelDelegate(type);

    if (!delegate) {
      return NextResponse.json(
        { success: false, error: `Loại danh mục không hợp lệ: ${type}` },
        { status: 400 }
      );
    }

    // Auto-seed defaults if table is empty
    let items = await (delegate as any).findMany({
      orderBy: { order: 'asc' },
    });

    if (items.length === 0 && DEFAULT_TAXONOMIES[type as keyof typeof DEFAULT_TAXONOMIES]) {
      const defaults = DEFAULT_TAXONOMIES[type as keyof typeof DEFAULT_TAXONOMIES];
      for (const item of defaults) {
        await (delegate as any).create({
          data: item,
        }).catch(() => {});
      }
      items = await (delegate as any).findMany({
        orderBy: { order: 'asc' },
      });
      exportDatabaseToSeedFiles().catch(() => {});
    }

    return NextResponse.json({
      success: true,
      items,
    });
  } catch (error: any) {
    console.error('Taxonomy GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi tải danh mục.' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { type: string } }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { type } = params;
    const delegate = getModelDelegate(type);

    if (!delegate) {
      return NextResponse.json(
        { success: false, error: `Loại danh mục không hợp lệ: ${type}` },
        { status: 400 }
      );
    }

    const body = await request.json();
    const name = body.name?.trim();
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Tên danh mục không được để trống.' },
        { status: 400 }
      );
    }

    const slug = body.slug?.trim() || slugify(name);
    const order = typeof body.order === 'number' ? body.order : 0;

    // Check duplicate name or slug
    const existing = await (delegate as any).findFirst({
      where: {
        OR: [{ name }, { slug }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Tên hoặc đường dẫn (slug) danh mục này đã tồn tại.' },
        { status: 400 }
      );
    }

    const created = await (delegate as any).create({
      data: {
        name,
        slug,
        order,
      },
    });

    exportDatabaseToSeedFiles().catch(() => {});

    return NextResponse.json({
      success: true,
      item: created,
      message: 'Thêm danh mục mới thành công!',
    });
  } catch (error: any) {
    console.error('Taxonomy POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi tạo danh mục.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { type: string } }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { type } = params;
    const delegate = getModelDelegate(type);

    if (!delegate) {
      return NextResponse.json(
        { success: false, error: `Loại danh mục không hợp lệ: ${type}` },
        { status: 400 }
      );
    }

    const body = await request.json();
    const id = body.id?.trim();
    const name = body.name?.trim();

    if (!id || !name) {
      return NextResponse.json(
        { success: false, error: 'Thiếu ID hoặc Tên danh mục.' },
        { status: 400 }
      );
    }

    const slug = body.slug?.trim() || slugify(name);
    const order = typeof body.order === 'number' ? body.order : 0;

    // Check conflict with other records
    const conflict = await (delegate as any).findFirst({
      where: {
        id: { not: id },
        OR: [{ name }, { slug }],
      },
    });

    if (conflict) {
      return NextResponse.json(
        { success: false, error: 'Tên hoặc slug đã được sử dụng bởi danh mục khác.' },
        { status: 400 }
      );
    }

    const updated = await (delegate as any).update({
      where: { id },
      data: {
        name,
        slug,
        order,
      },
    });

    exportDatabaseToSeedFiles().catch(() => {});

    return NextResponse.json({
      success: true,
      item: updated,
      message: 'Cập nhật danh mục thành công!',
    });
  } catch (error: any) {
    console.error('Taxonomy PUT error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi cập nhật danh mục.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { type: string } }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { type } = params;
    const delegate = getModelDelegate(type);

    if (!delegate) {
      return NextResponse.json(
        { success: false, error: `Loại danh mục không hợp lệ: ${type}` },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Thiếu tham số ID danh mục cần xóa.' },
        { status: 400 }
      );
    }

    await (delegate as any).delete({
      where: { id },
    });

    exportDatabaseToSeedFiles().catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'Đã xóa danh mục thành công!',
    });
  } catch (error: any) {
    console.error('Taxonomy DELETE error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi xóa danh mục.' },
      { status: 500 }
    );
  }
}

