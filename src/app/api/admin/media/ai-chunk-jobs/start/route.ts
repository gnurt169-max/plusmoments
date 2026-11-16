import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { startAiChunkJob } from '@/lib/ai-chunk-job-manager';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { mediaIds, folderId, folderSlug } = body;

    const job = await startAiChunkJob({
      mediaIds: Array.isArray(mediaIds) ? mediaIds : undefined,
      folderId: typeof folderId === 'string' ? folderId : undefined,
      folderSlug: typeof folderSlug === 'string' ? folderSlug : undefined,
    });

    return NextResponse.json({
      success: true,
      jobId: job.jobId,
      job,
      message: `Đã khởi chạy Job phân tích ngữ cảnh & tạo chunks AI cho ${job.total} ảnh.`,
    });
  } catch (error: any) {
    console.error('[AI_CHUNK_JOB_START_ERROR]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi khởi chạy tiến trình AI.' },
      { status: 500 }
    );
  }
}
