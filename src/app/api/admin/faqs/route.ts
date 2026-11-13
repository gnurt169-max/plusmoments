import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getAdminSession, assertRole } from '@/lib/auth';
import { AdminRole } from '@prisma/client';

export const dynamic = 'force-dynamic';

export interface FaqItem {
  id?: string;
  question: string;
  answer: string;
  order?: number;
  isActive?: boolean;
}

export async function GET() {
  try {
    // 1. Fetch from PricingFaq model first
    const dbFaqs = await prisma.pricingFaq.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });

    if (dbFaqs && dbFaqs.length > 0) {
      return NextResponse.json({
        success: true,
        faqs: dbFaqs.map((f, i) => ({
          id: f.id,
          question: f.question,
          answer: f.answer,
          order: f.order ?? i,
          isActive: f.isActive ?? true,
        })),
      });
    }

    // 2. Fallback to SystemSetting JSON if PricingFaq is empty
    const settings = await prisma.systemSetting.findUnique({
      where: { id: 'default' },
      select: { pricingFaqs: true },
    });

    let jsonFaqs: any[] = [];
    if (settings?.pricingFaqs) {
      if (Array.isArray(settings.pricingFaqs)) {
        jsonFaqs = settings.pricingFaqs;
      } else if (typeof settings.pricingFaqs === 'string') {
        try {
          jsonFaqs = JSON.parse(settings.pricingFaqs);
        } catch {
          jsonFaqs = [];
        }
      }
    }

    return NextResponse.json({
      success: true,
      faqs: Array.isArray(jsonFaqs) ? jsonFaqs : [],
    });
  } catch (error: any) {
    console.error('Fetch FAQs error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi tải danh sách câu hỏi' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    const authCheck = assertRole(session, [AdminRole.ADMIN, AdminRole.SUPER_ADMIN]);
    if (!authCheck.authorized) return authCheck.response;

    const body = await request.json();
    const rawFaqs: FaqItem[] = Array.isArray(body?.faqs) ? body.faqs : [];

    // Filter valid entries (must have non-empty question and answer)
    const validFaqs = rawFaqs
      .filter((item) => item && typeof item.question === 'string' && typeof item.answer === 'string')
      .map((item, index) => ({
        id: item.id && !item.id.startsWith('temp-') ? item.id : undefined,
        question: item.question.trim(),
        answer: item.answer.trim(),
        order: typeof item.order === 'number' ? item.order : index,
        isActive: item.isActive !== false,
      }))
      .filter((item) => item.question.length > 0 && item.answer.length > 0);

    // Atomically replace items in PricingFaq table
    await prisma.$transaction(async (tx) => {
      await tx.pricingFaq.deleteMany();
      if (validFaqs.length > 0) {
        await tx.pricingFaq.createMany({
          data: validFaqs.map((faq, i) => ({
            id: faq.id,
            question: faq.question,
            answer: faq.answer,
            order: faq.order ?? i,
            isActive: faq.isActive,
          })),
        });
      }
      // Also mirror to SystemSetting.pricingFaqs for consistency
      await tx.systemSetting.upsert({
        where: { id: 'default' },
        create: { id: 'default', pricingFaqs: validFaqs },
        update: { pricingFaqs: validFaqs },
      });
    });

    // Revalidate public and admin pages
    revalidateTag('packages');
    revalidateTag('settings');
    revalidatePath('/bang-gia');
    revalidatePath('/pricing');
    revalidatePath('/admin/packages');

    const updatedFaqs = await prisma.pricingFaq.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });

    return NextResponse.json({
      success: true,
      message: 'Lưu danh sách Câu Hỏi Thường Gặp thành công!',
      faqs: updatedFaqs,
    });
  } catch (error: any) {
    console.error('Save FAQs error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi lưu câu hỏi thường gặp' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  return POST(request);
}

