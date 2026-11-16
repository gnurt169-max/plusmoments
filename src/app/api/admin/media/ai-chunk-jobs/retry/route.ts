import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { retryAiChunkJob } from '@/lib/ai-chunk-job-manager';

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

    const job = await retryAiChunkJob({ jobId, folderId });

    return NextResponse.json({
      success: true,
      jobId: job.jobId,
      job,
      message: `Đã chạy lại Job phân tích AI cho ${job.total} ảnh.`,
    });
  } catch (error: any) {
    console.error('[AI_CHUNK_JOB_RETRY_ERROR]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi chạy lại Job AI.' },
      { status: 500 }
    );
  }
}
