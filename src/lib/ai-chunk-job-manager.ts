import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { analyzeImageWithVisionAI, inferChunkName, VisionAIChunk } from '@/lib/vision-ai';
import { resolveFolder } from '@/lib/media-folder-resolver';

export interface AiChunkCluster {
  id: string;
  name: string;
  description?: string;
  count: number;
  imageIds: string[];
  sampleUrl?: string;
}

export interface AiChunkJob {
  jobId: string;
  folderId?: string | null;
  folderSlug?: string | null;
  folderName?: string | null;
  status: 'IDLE' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  total: number;
  processed: number;
  successCount: number;
  failedCount: number;
  currentFileName: string;
  chunksCreated: AiChunkCluster[];
  logs: string[];
  createdAt: string;
  updatedAt: string;
  error?: string;
}

const JOBS_FILE_PATH = path.join(process.cwd(), 'prisma', 'ai-chunk-jobs.json');
const activeAbortControllers = new Map<string, AbortController>();
let isInitialized = false;

function ensureStorageDirectory(): void {
  const dir = path.dirname(JOBS_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export async function loadAiChunkJobs(): Promise<AiChunkJob[]> {
  ensureStorageDirectory();
  if (!fs.existsSync(JOBS_FILE_PATH)) {
    return [];
  }

  try {
    const raw = await fs.promises.readFile(JOBS_FILE_PATH, 'utf-8');
    const jobs: AiChunkJob[] = JSON.parse(raw);

    if (!isInitialized) {
      isInitialized = true;
      let hasChanges = false;
      const sanitized = jobs.map((j) => {
        if (j.status === 'RUNNING') {
          hasChanges = true;
          return {
            ...j,
            status: 'FAILED' as const,
            error: 'Tiến trình bị gián đoạn do máy chủ khởi động lại.',
            updatedAt: new Date().toISOString(),
          };
        }
        return j;
      });

      if (hasChanges) {
        await saveAiChunkJobs(sanitized);
        return sanitized;
      }
    }

    return jobs;
  } catch (err) {
    console.error('[AI_CHUNK_JOB_MANAGER] Failed to load jobs:', err);
    return [];
  }
}

export async function saveAiChunkJobs(jobs: AiChunkJob[]): Promise<void> {
  ensureStorageDirectory();
  const tmpPath = `${JOBS_FILE_PATH}.${process.pid}.${Date.now()}.tmp`;
  try {
    // Keep at most 50 recent jobs
    const trimmed = jobs.slice(0, 50);
    await fs.promises.writeFile(tmpPath, JSON.stringify(trimmed, null, 2), 'utf-8');
    await fs.promises.rename(tmpPath, JOBS_FILE_PATH);
  } catch (err) {
    if (fs.existsSync(tmpPath)) {
      try {
        await fs.promises.unlink(tmpPath);
      } catch {}
    }
    console.error('[AI_CHUNK_JOB_MANAGER] Failed to save jobs to disk:', err);
  }
}

export async function getAiChunkJob(query: { jobId?: string; folderId?: string }): Promise<AiChunkJob | null> {
  const jobs = await loadAiChunkJobs();
  if (query.jobId) {
    return jobs.find((j) => j.jobId === query.jobId) || null;
  }
  if (query.folderId) {
    const cleanId = query.folderId.trim();
    return (
      jobs.find(
        (j) =>
          (j.folderId === cleanId || j.folderSlug === cleanId) &&
          (j.status === 'RUNNING' || j.status === 'COMPLETED' || j.status === 'FAILED')
      ) ||
      jobs.find((j) => j.folderId === cleanId || j.folderSlug === cleanId) ||
      null
    );
  }
  return jobs[0] || null;
}

export async function cancelAiChunkJob(params: { jobId?: string; folderId?: string }): Promise<boolean> {
  const jobs = await loadAiChunkJobs();
  let targetJob: AiChunkJob | undefined;

  if (params.jobId) {
    targetJob = jobs.find((j) => j.jobId === params.jobId);
  } else if (params.folderId) {
    targetJob = jobs.find(
      (j) => (j.folderId === params.folderId || j.folderSlug === params.folderId) && j.status === 'RUNNING'
    );
  } else {
    targetJob = jobs.find((j) => j.status === 'RUNNING');
  }

  if (!targetJob) return false;

  const controller = activeAbortControllers.get(targetJob.jobId);
  if (controller) {
    controller.abort();
    activeAbortControllers.delete(targetJob.jobId);
  }

  targetJob.status = 'CANCELLED';
  targetJob.currentFileName = '';
  targetJob.logs = [
    `[${new Date().toLocaleTimeString('vi-VN')}] 🛑 Quản trị viên đã tạm dừng tiến trình phân tích AI.`,
    ...targetJob.logs.slice(0, 39),
  ];
  targetJob.updatedAt = new Date().toISOString();

  await saveAiChunkJobs(jobs);
  return true;
}

export async function startAiChunkJob(params: {
  mediaIds?: string[];
  folderId?: string;
  folderSlug?: string;
}): Promise<AiChunkJob> {
  const jobs = await loadAiChunkJobs();

  // 1. Identify target media files
  let targetMedia: Array<{ id: string; name: string; url: string; folderId: string | null; aiContextChunk: any }> = [];
  let resolvedFolderInfo: { id: string; slug: string; name: string } | null = null;

  if (params.folderId) {
    const resolved = await resolveFolder(params.folderId);
    if (resolved) {
      resolvedFolderInfo = {
        id: resolved.canonicalId,
        slug: resolved.canonicalSlug,
        name: resolved.canonicalName,
      };
    }
  }

  if (params.mediaIds && params.mediaIds.length > 0) {
    targetMedia = await prisma.mediaFile.findMany({
      where: { id: { in: params.mediaIds } },
      select: { id: true, name: true, url: true, folderId: true, aiContextChunk: true },
    });
  } else if (resolvedFolderInfo) {
    const dbFiles = await prisma.mediaFile.findMany({
      where: {
        OR: [
          { folderId: resolvedFolderInfo.id },
          { url: { startsWith: `/uploads/folders/${resolvedFolderInfo.slug}/` } },
        ],
      },
      select: { id: true, name: true, url: true, folderId: true, aiContextChunk: true },
      orderBy: { createdAt: 'desc' },
    });

    // Filter unanalyzed or failed images
    targetMedia = dbFiles.filter((f) => {
      const chunk = f.aiContextChunk as any;
      return !chunk || chunk.aiStatus !== 'DONE';
    });

    // If all are already done, allow re-analyzing all
    if (targetMedia.length === 0) {
      targetMedia = dbFiles;
    }
  } else {
    // Recent pending images in system
    const recent = await prisma.mediaFile.findMany({
      select: { id: true, name: true, url: true, folderId: true, aiContextChunk: true },
      take: 60,
      orderBy: { createdAt: 'desc' },
    });
    targetMedia = recent
      .filter((f) => {
        const chunk = f.aiContextChunk as any;
        return !chunk || chunk.aiStatus !== 'DONE';
      })
      .slice(0, 40);
  }

  const jobId = `job_ai_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  const now = new Date().toISOString();

  const newJob: AiChunkJob = {
    jobId,
    folderId: resolvedFolderInfo?.id || params.folderId || null,
    folderSlug: resolvedFolderInfo?.slug || params.folderSlug || null,
    folderName: resolvedFolderInfo?.name || (params.folderId ? 'Thư mục kho ảnh' : 'Kho ảnh tổng'),
    status: targetMedia.length > 0 ? 'RUNNING' : 'COMPLETED',
    total: targetMedia.length,
    processed: 0,
    successCount: 0,
    failedCount: 0,
    currentFileName: targetMedia[0]?.name || '',
    chunksCreated: [],
    logs: [
      `[${new Date().toLocaleTimeString('vi-VN')}] 🚀 Bắt đầu Job phân tích thị giác & chia Chunks cho ${targetMedia.length} ảnh.`,
    ],
    createdAt: now,
    updatedAt: now,
  };

  jobs.unshift(newJob);
  await saveAiChunkJobs(jobs);

  if (targetMedia.length === 0) {
    return newJob;
  }

  // 2. Set up abort controller and run background loop
  const abortController = new AbortController();
  activeAbortControllers.set(jobId, abortController);

  // Background detached execution
  (async () => {
    try {
      const chunksMap = new Map<string, AiChunkCluster>();

      for (let i = 0; i < targetMedia.length; i++) {
        if (abortController.signal.aborted) {
          break;
        }

        const file = targetMedia[i];
        newJob.currentFileName = file.name || path.basename(file.url);
        newJob.updatedAt = new Date().toISOString();

        newJob.logs = [
          `[${new Date().toLocaleTimeString('vi-VN')}] 🔍 Đang đọc ngữ cảnh ảnh (${i + 1}/${newJob.total}): ${newJob.currentFileName}...`,
          ...newJob.logs.slice(0, 39),
        ];

        // Mark image as RUNNING in DB
        const existingChunk = (file.aiContextChunk as any) || {};
        await prisma.mediaFile
          .update({
            where: { id: file.id },
            data: {
              aiContextChunk: {
                ...existingChunk,
                aiStatus: 'RUNNING',
              },
            },
          })
          .catch(() => null);

        await saveAiChunkJobs(jobs);

        try {
          const analyzed = await analyzeImageWithVisionAI(file.url);

          if (analyzed) {
            const chunkName = analyzed.chunkName || inferChunkName(analyzed);
            const enrichedChunk: VisionAIChunk = {
              ...analyzed,
              chunkName,
              aiStatus: 'DONE',
              analyzedAt: new Date().toISOString(),
            };

            // Save chunk into MediaFile
            await prisma.mediaFile.update({
              where: { id: file.id },
              data: {
                aiContextChunk: enrichedChunk as any,
              },
            });

            // Update cluster groupings
            if (!chunksMap.has(chunkName)) {
              chunksMap.set(chunkName, {
                id: `chunk_${crypto.createHash('md5').update(chunkName).digest('hex').slice(0, 8)}`,
                name: chunkName,
                description: analyzed.visualDescription,
                count: 1,
                imageIds: [file.id],
                sampleUrl: file.url,
              });
            } else {
              const cluster = chunksMap.get(chunkName)!;
              cluster.count += 1;
              if (!cluster.imageIds.includes(file.id)) {
                cluster.imageIds.push(file.id);
              }
            }

            newJob.chunksCreated = Array.from(chunksMap.values());
            newJob.successCount += 1;
            newJob.logs = [
              `[${new Date().toLocaleTimeString('vi-VN')}] ✨ Đã gom nhóm: "${file.name}" → [${chunkName}]`,
              ...newJob.logs.slice(0, 39),
            ];
          } else {
            // Failed to analyze
            await prisma.mediaFile
              .update({
                where: { id: file.id },
                data: {
                  aiContextChunk: {
                    ...existingChunk,
                    aiStatus: 'FAILED',
                    error: 'Gemini Vision AI không nhận diện được dữ liệu ảnh.',
                  },
                },
              })
              .catch(() => null);

            newJob.failedCount += 1;
            newJob.logs = [
              `[${new Date().toLocaleTimeString('vi-VN')}] ⚠️ Không thể nhận diện ảnh "${file.name}". Bỏ qua.`,
              ...newJob.logs.slice(0, 39),
            ];
          }
        } catch (itemErr: any) {
          await prisma.mediaFile
            .update({
              where: { id: file.id },
              data: {
                aiContextChunk: {
                  ...existingChunk,
                  aiStatus: 'FAILED',
                  error: itemErr.message || 'Lỗi xử lý AI',
                },
              },
            })
            .catch(() => null);

          newJob.failedCount += 1;
          newJob.logs = [
            `[${new Date().toLocaleTimeString('vi-VN')}] ❌ Lỗi xử lý "${file.name}": ${itemErr.message}`,
            ...newJob.logs.slice(0, 39),
          ];
        }

        newJob.processed = i + 1;
        newJob.updatedAt = new Date().toISOString();
        await saveAiChunkJobs(jobs);

        // Pause 200ms between calls to avoid API rate-limit
        if (i < targetMedia.length - 1 && !abortController.signal.aborted) {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      }

      activeAbortControllers.delete(jobId);

      if (abortController.signal.aborted) {
        newJob.status = 'CANCELLED';
        newJob.currentFileName = '';
        newJob.updatedAt = new Date().toISOString();
        await saveAiChunkJobs(jobs);
        return;
      }

      newJob.status = 'COMPLETED';
      newJob.currentFileName = '';
      newJob.logs = [
        `[${new Date().toLocaleTimeString('vi-VN')}] 🎉 Hoàn tất phân tích ${newJob.successCount}/${newJob.total} ảnh! Đã tự động phân loại thành ${newJob.chunksCreated.length} cụm Chunks.`,
        ...newJob.logs.slice(0, 39),
      ];
      newJob.updatedAt = new Date().toISOString();
      await saveAiChunkJobs(jobs);
    } catch (loopErr: any) {
      console.error('[AI_CHUNK_JOB_LOOP_ERROR]:', loopErr);
      activeAbortControllers.delete(jobId);
      newJob.status = 'FAILED';
      newJob.error = loopErr.message || 'Lỗi trong quá trình chạy Job AI';
      newJob.updatedAt = new Date().toISOString();
      await saveAiChunkJobs(jobs);
    }
  })().catch((err) => console.error('[DETACHED_AI_CHUNK_JOB_CRASH]:', err));

  return newJob;
}

export async function retryAiChunkJob(params: { jobId?: string; folderId?: string }): Promise<AiChunkJob> {
  const jobs = await loadAiChunkJobs();
  let prevJob: AiChunkJob | undefined;

  if (params.jobId) {
    prevJob = jobs.find((j) => j.jobId === params.jobId);
  } else if (params.folderId) {
    prevJob = jobs.find((j) => j.folderId === params.folderId || j.folderSlug === params.folderId);
  }

  const folderId = prevJob?.folderId || params.folderId || undefined;
  const folderSlug = prevJob?.folderSlug || undefined;

  return startAiChunkJob({ folderId, folderSlug });
}
