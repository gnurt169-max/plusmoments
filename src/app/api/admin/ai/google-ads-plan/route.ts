import { NextResponse } from 'next/server';
import { getAdminSession, isSuperAdminTrunglnm } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  generateGoogleAdsCampaignPlan,
  getSavedGoogleAdsPlan,
  GoogleAdsPlan,
} from '@/lib/google-ads-architect';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session || !isSuperAdminTrunglnm(session)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Phân khu dành riêng cho Super Admin trunglnm.' },
        { status: 403 }
      );
    }

    // 1. Fetch saved plan
    let plan = await getSavedGoogleAdsPlan();

    // 2. Fetch packages for selection dropdown
    const packages = await prisma.servicePackage.findMany({
      where: { published: true },
      orderBy: { orderIndex: 'asc' },
      select: { id: true, name: true, price: true, category: true, slug: true },
    });

    // 3. If no plan has ever been generated, generate an initial default plan
    if (!plan) {
      plan = await generateGoogleAdsCampaignPlan({
        campaignGoal: 'all_packages',
        targetLocation: 'TP. Hồ Chí Minh & lân cận (Bán kính 35km)',
        dailyBudget: '300.000đ - 500.000đ/ngày',
      });
    }

    return NextResponse.json({
      success: true,
      plan,
      packages,
      superAdmin: {
        username: session.username,
        email: session.email,
        role: session.role,
      },
    });
  } catch (error: any) {
    console.error('Google Ads Plan GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi tải kịch bản Google Ads.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session || !isSuperAdminTrunglnm(session)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Phân khu dành riêng cho Super Admin trunglnm.' },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const {
      campaignGoal = 'all_packages',
      selectedPackageId,
      targetLocation = 'TP. Hồ Chí Minh & lân cận (Bán kính 35km)',
      dailyBudget = '300.000đ - 500.000đ/ngày',
    } = body;

    const plan = await generateGoogleAdsCampaignPlan({
      campaignGoal,
      selectedPackageId,
      targetLocation,
      dailyBudget,
    });

    return NextResponse.json({
      success: true,
      plan,
      message: 'Kịch bản Google Ads đã được kiến trúc thành công theo dữ liệu thật!',
    });
  } catch (error: any) {
    console.error('Google Ads Plan POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi tạo kịch bản Google Ads.' },
      { status: 500 }
    );
  }
}
