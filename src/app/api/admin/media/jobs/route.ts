import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  getActiveJobs,
  getJobById,
  createMediaJob,
  dismissMediaJob,
  cancelMediaJob,
  startGoogleDriveImportJob,
} from '@/lib/media-job-queue';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const jobs = await getActiveJobs();
    return NextResponse.json({
      success: true,
      jobs,
    });
  } catch (error: any) {
    console.error('[API_MEDIA_JOBS_GET_ERROR]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi lấy danh sách job' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const body = await request.json();
    const { type, folders } = body;

    if (type === 'google-drive') {
      if (!folders || !Array.isArray(folders) || folders.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Vui lòng chọn ít nhất một thư mục Google Drive để import.' },
          { status: 400 }
        );
      }

      // Fetch API Key
      const settings = await prisma.systemSetting.findUnique({
        where: { id: 'default' },
      });
      const apiKey = settings?.googleDriveApiKey || process.env.GOOGLE_DRIVE_API_KEY || '';

      const folderName =
        folders.length === 1
          ? folders[0].name || 'Thư mục Drive'
          : `${folders[0].name || 'Drive'} (+${folders.length - 1} thư mục khác)`;

      // Create persistent job on VPS
      const job = await createMediaJob({
        type: 'google-drive',
        folderName,
        totalFiles: 0,
        userId: session.userId,
      });

      // Fire background worker (does not block HTTP response)
      startGoogleDriveImportJob(job.id, {
        folders,
        apiKey,
        userId: session.userId,
      });

      // Return 202 Accepted in < 200ms
      return NextResponse.json(
        {
          success: true,
          jobId: job.id,
          job,
          message: 'Đã khởi tạo tiến trình import ngầm trên VPS. Bạn có thể đóng trình duyệt.',
        },
        { status: 202 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Loại tác vụ không được hỗ trợ.' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('[API_MEDIA_JOBS_POST_ERROR]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi khởi tạo job ngầm' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const body = await request.json();
    const { id, action } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Thiếu ID tác vụ.' }, { status: 400 });
    }

    if (action === 'dismiss') {
      const ok = await dismissMediaJob(id);
      return NextResponse.json({ success: ok });
    }

    if (action === 'cancel') {
      const ok = await cancelMediaJob(id);
      return NextResponse.json({ success: ok });
    }

    return NextResponse.json({ success: false, error: 'Hành động không hợp lệ.' }, { status: 400 });
  } catch (error: any) {
    console.error('[API_MEDIA_JOBS_PATCH_ERROR]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi cập nhật job' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Thiếu ID tác vụ.' }, { status: 400 });
    }

    const ok = await dismissMediaJob(id);
    return NextResponse.json({ success: ok });
  } catch (error: any) {
    console.error('[API_MEDIA_JOBS_DELETE_ERROR]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi xóa job' },
      { status: 500 }
    );
  }
}
