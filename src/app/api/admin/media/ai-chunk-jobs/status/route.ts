import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getAiChunkJob } from '@/lib/ai-chunk-job-manager';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId') || undefined;
    const folderId = searchParams.get('folderId') || undefined;

    const job = await getAiChunkJob({ jobId, folderId });

    return NextResponse.json({
      success: true,
      job,
      active: job?.status === 'RUNNING',
    });
  } catch (error: any) {
    console.error('[AI_CHUNK_JOB_STATUS_ERROR]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi kiểm tra trạng thái Job AI.' },
      { status: 500 }
    );
  }
}
