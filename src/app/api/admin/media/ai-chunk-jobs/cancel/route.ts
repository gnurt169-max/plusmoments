import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { cancelAiChunkJob } from '@/lib/ai-chunk-job-manager';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { searchParams } = new URL(request.url);

    const jobId = body.jobId || searchParams.get('jobId') || undefined;
    const folderId = body.folderId || searchParams.get('folderId') || undefined;

    const cancelled = await cancelAiChunkJob({ jobId, folderId });

    return NextResponse.json({
      success: true,
      cancelled,
      message: cancelled
        ? 'Đã tạm dừng tiến trình phân tích AI thành công.'
        : 'Không tìm thấy tiến trình đang chạy để dừng.',
    });
  } catch (error: any) {
    console.error('[AI_CHUNK_JOB_CANCEL_ERROR]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi dừng Job AI.' },
      { status: 500 }
    );
  }
}
