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
    const { mediaIds, folderId, folderSlug, items } = body;

    const job = await startAiChunkJob({
      mediaIds: Array.isArray(mediaIds) ? mediaIds : undefined,
      folderId: typeof folderId === 'string' ? folderId : undefined,
      folderSlug: typeof folderSlug === 'string' ? folderSlug : undefined,
      items: Array.isArray(items) ? items : undefined,
    });

    if (job.total === 0) {
      return NextResponse.json({
        success: false,
        total: 0,
        job,
        message: 'Tất cả ảnh trong thư mục này đã được phân loại Chunks rồi.',
      });
    }

    return NextResponse.json({
      success: true,
      jobId: job.jobId,
      job,
      total: job.total,
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
