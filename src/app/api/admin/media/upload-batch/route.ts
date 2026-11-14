import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { getAdminSession } from '@/lib/auth';
import {
  createMediaJob,
  startLocalUploadJob,
  LocalTempUploadItem,
} from '@/lib/media-job-queue';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const formData = await request.formData();
    const folderSlug = (formData.get('folderSlug') as string)?.trim() || undefined;
    const folderName = (formData.get('folderName') as string)?.trim() || folderSlug || 'Kho Media Gốc';

    // Collect all files from FormData
    const rawFiles = formData.getAll('files') as File[];
    const singleFile = formData.get('file') as File | null;
    const files: File[] = rawFiles.length > 0 ? rawFiles : singleFile ? [singleFile] : [];

    if (files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy file nào được tải lên.' },
        { status: 400 }
      );
    }

    const tempDir = path.join(os.tmpdir(), 'plusmoments-temp-uploads', `batch-${Date.now()}`);
    if (!fs.existsSync(tempDir)) {
      await fs.promises.mkdir(tempDir, { recursive: true });
    }

    const tempItems: LocalTempUploadItem[] = [];

    // Save all incoming files quickly to temp disk (< 20ms per file)
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const buffer = Buffer.from(await file.arrayBuffer());
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const tempPath = path.join(tempDir, `item-${i}-${safeName}`);
      await fs.promises.writeFile(tempPath, buffer);

      tempItems.push({
        tempFilePath: tempPath,
        originalName: file.name,
        size: buffer.length,
      });
    }

    // Create persistent job
    const job = await createMediaJob({
      type: 'local-upload',
      folderName,
      folderSlug,
      totalFiles: tempItems.length,
      userId: session.userId,
    });

    // Start background processing on VPS
    startLocalUploadJob(job.id, {
      items: tempItems,
      folderSlug,
      folderName,
      userId: session.userId,
    });

    return NextResponse.json(
      {
        success: true,
        jobId: job.id,
        job,
        message: `Đã tiếp nhận ${tempItems.length} file. VPS đang xử lý ngầm (nén WebP và tạo biến thể).`,
      },
      { status: 202 }
    );
  } catch (error: any) {
    console.error('[MEDIA_UPLOAD_BATCH_ERROR]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi tiếp nhận batch upload' },
      { status: 500 }
    );
  }
}
