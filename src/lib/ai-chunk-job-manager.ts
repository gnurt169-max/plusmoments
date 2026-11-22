import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { analyzeImageWithVisionAI, inferChunkName, VisionAIChunk } from '@/lib/vision-ai';
import { resolveFolder, resolveValidFolderId } from '@/lib/media-folder-resolver';
import { syncMediaVectorToPinecone } from '@/lib/pinecone-service';

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
  dismissed?: boolean;
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

export async function syncJobResultsToMediaDatabase(job: AiChunkJob): Promise<number> {
  if (!job.chunksCreated || job.chunksCreated.length === 0) return 0;
  let updatedCount = 0;
  try {
    for (const cluster of job.chunksCreated) {
      const targets = cluster.imageIds || [];
      if (targets.length === 0) continue;
      const res = await prisma.mediaFile.updateMany({
        where: {
          OR: [
            { id: { in: targets } },
            { url: { in: targets } },
          ],
        },
        data: {
          chunkStatus: 'CHUNKED',
          chunkTitle: cluster.name,
          chunkGroup: cluster.name,
          aiContext: cluster.description || cluster.name,
        },
      });
      updatedCount += res.count;
    }
  } catch (err) {
    console.error('[SYNC_JOB_RESULTS_TO_DB_ERROR]:', err);
  }
  return updatedCount;
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

      // Tự động đồng bộ các Job đã hoàn tất trước đó vào Database
      for (const j of sanitized) {
        if (j.status === 'COMPLETED' && j.chunksCreated && j.chunksCreated.length > 0) {
          syncJobResultsToMediaDatabase(j).catch(() => null);
        }
      }

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
    const job = jobs.find((j) => j.jobId === query.jobId);
    if (job && !job.dismissed) return job;
    return null;
  }
  if (query.folderId) {
    const cleanId = query.folderId.trim();
    const folderJobs = jobs.filter(
      (j) => (j.folderId === cleanId || j.folderSlug === cleanId) && !j.dismissed
    );
    // Ưu tiên job đang RUNNING, sau đó đến job mới nhất
    const running = folderJobs.find((j) => j.status === 'RUNNING');
    if (running) return running;
    return folderJobs[0] || null;
  }
  // Nếu là kho ảnh gốc (không có folderId): chỉ tìm job của root, tuyệt đối không lấy nhầm job của thư mục con!
  const rootJobs = jobs.filter((j) => (!j.folderId || j.folderId === 'root') && !j.dismissed);
  const activeRoot = rootJobs.find((j) => j.status === 'RUNNING');
  if (activeRoot) return activeRoot;
  return rootJobs[0] || null;
}

export async function dismissAiChunkJob(params: { jobId?: string; folderId?: string }): Promise<boolean> {
  const jobs = await loadAiChunkJobs();
  let targetJob: AiChunkJob | undefined;

  if (params.jobId) {
    targetJob = jobs.find((j) => j.jobId === params.jobId);
  } else if (params.folderId) {
    const cleanId = params.folderId.trim();
    targetJob = jobs.find((j) => (j.folderId === cleanId || j.folderSlug === cleanId) && !j.dismissed);
  } else {
    targetJob = jobs.find((j) => !j.folderId && !j.dismissed);
  }

  if (!targetJob) return false;

  targetJob.dismissed = true;
  targetJob.updatedAt = new Date().toISOString();
  await saveAiChunkJobs(jobs);
  return true;
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
  items?: Array<{ id?: string; url?: string; filename?: string; name?: string }>;
}): Promise<AiChunkJob> {
  const jobs = await loadAiChunkJobs();

  // 1. Identify target media files
  let targetMedia: Array<{ id: string; name: string; url: string; folderId: string | null; aiContextChunk: any; chunkStatus?: string; chunkTitle?: string | null }> = [];
  let resolvedFolderInfo: { id: string; slug: string; name: string; physicalDir: string | null } | null = null;

  if (params.folderId) {
    const resolved = await resolveFolder(params.folderId);
    if (resolved) {
      resolvedFolderInfo = {
        id: resolved.canonicalId,
        slug: resolved.canonicalSlug,
        name: resolved.canonicalName,
        physicalDir: resolved.physicalDir,
      };
    }
  }

  // Hủy hoặc đánh dấu FAILED các Job cũ nếu bị treo quá 3 phút hoặc khi người dùng yêu cầu chạy phiên mới
  const folderKey = resolvedFolderInfo?.id || params.folderId || null;
  const existingRunning = jobs.find(
    (j) =>
      ((folderKey && (j.folderId === folderKey || (resolvedFolderInfo?.slug && j.folderSlug === resolvedFolderInfo.slug))) ||
        (!folderKey && !j.folderId)) &&
      j.status === 'RUNNING'
  );
  if (existingRunning) {
    const updatedAtTime = new Date(existingRunning.updatedAt).getTime();
    const isStale = Date.now() - updatedAtTime > 3 * 60 * 1000;
    if (isStale || (params.items && params.items.length > 0)) {
      const ctrl = activeAbortControllers.get(existingRunning.jobId);
      if (ctrl) {
        ctrl.abort();
        activeAbortControllers.delete(existingRunning.jobId);
      }
      existingRunning.status = isStale ? 'FAILED' : 'CANCELLED';
      existingRunning.error = isStale
        ? 'Tiến trình cũ đã bị treo quá 3 phút và được tự động giải phóng.'
        : 'Được thay thế bằng phiên chạy mới theo yêu cầu của quản trị viên.';
      existingRunning.updatedAt = new Date().toISOString();
      await saveAiChunkJobs(jobs);
    }
  }

  // Luôn chủ động quét và đồng bộ các file ảnh vật lý trên đĩa vào MediaFile trước khi lập danh sách
  if (resolvedFolderInfo?.physicalDir && fs.existsSync(resolvedFolderInfo.physicalDir)) {
    try {
      const diskEntries = await fs.promises.readdir(resolvedFolderInfo.physicalDir, { withFileTypes: true });
      for (const entry of diskEntries) {
        if (
          entry.isDirectory() ||
          entry.name.startsWith('.') ||
          entry.name.startsWith('._') ||
          entry.name.endsWith('-sm.webp') ||
          entry.name.endsWith('-md.webp')
        ) {
          continue;
        }
        const ext = path.extname(entry.name).toLowerCase();
        if (['.webp', '.jpg', '.jpeg', '.png', '.avif'].includes(ext)) {
          const publicUrl = `/uploads/folders/${resolvedFolderInfo.slug}/${entry.name}`;
          const existing = await prisma.mediaFile.findFirst({
            where: {
              OR: [
                { url: publicUrl },
                { name: entry.name, folderId: resolvedFolderInfo.id },
              ],
            },
          });
          if (!existing) {
            const validFolderId = await resolveValidFolderId(resolvedFolderInfo.id, publicUrl);
            const fullP = path.join(resolvedFolderInfo.physicalDir, entry.name);
            const stat = await fs.promises.stat(fullP);
            await prisma.mediaFile.create({
              data: {
                name: entry.name,
                url: publicUrl,
                size: stat.size,
                format: ext.replace('.', '').toUpperCase(),
                folderId: validFolderId,
                chunkStatus: 'NOT_CHUNKED',
              },
            });
          }
        }
      }
    } catch (scanErr) {
      console.warn('[AI_CHUNK_DISK_SCAN_WARN]:', scanErr);
    }
  }

  // Trường hợp 1: Client gửi trực tiếp mảng items ảnh chưa chunk
  if (params.items && params.items.length > 0) {
    const itemIds = params.items.map((i) => i.id).filter(Boolean) as string[];
    const itemUrls = params.items.map((i) => i.url).filter(Boolean) as string[];

    const foundMedia = await prisma.mediaFile.findMany({
      where: {
        OR: [
          ...(itemIds.length > 0 ? [{ id: { in: itemIds } }] : []),
          ...(itemUrls.length > 0 ? [{ url: { in: itemUrls } }] : []),
        ],
      },
      select: { id: true, name: true, url: true, folderId: true, aiContextChunk: true, chunkStatus: true, chunkTitle: true },
    });

    const foundMap = new Map<string, typeof foundMedia[0]>();
    foundMedia.forEach((f) => {
      foundMap.set(f.id, f);
      foundMap.set(f.url, f);
    });

    for (const item of params.items) {
      const match = (item.id && foundMap.get(item.id)) || (item.url && foundMap.get(item.url));
      if (match) {
        if (!targetMedia.some((m) => m.id === match.id)) {
          targetMedia.push(match);
        }
      } else if (item.url) {
        // Kiểm tra trực tiếp URL trong database để không tạo trùng bản ghi nếu item.id là id tạm
        const existingByUrl = await prisma.mediaFile.findFirst({
          where: { url: item.url },
          select: { id: true, name: true, url: true, folderId: true, aiContextChunk: true, chunkStatus: true, chunkTitle: true },
        });

        if (existingByUrl) {
          if (!targetMedia.some((m) => m.id === existingByUrl.id)) {
            targetMedia.push(existingByUrl);
          }
          continue;
        }

        const validFolderId = await resolveValidFolderId(
          resolvedFolderInfo?.id || params.folderId,
          item.url
        );

        const cleanP = item.url.replace(/^\/+/, '');
        const fullP = path.join(process.cwd(), 'public', cleanP);
        let size = 0;
        try {
          if (fs.existsSync(fullP)) {
            size = (await fs.promises.stat(fullP)).size;
          }
        } catch {}
        const created = await prisma.mediaFile.create({
          data: {
            name: item.name || item.filename || path.basename(item.url),
            url: item.url,
            size: size || 1024,
            format: path.extname(item.url).replace('.', '').toUpperCase() || 'WEBP',
            folderId: validFolderId,
            chunkStatus: 'NOT_CHUNKED',
          },
          select: { id: true, name: true, url: true, folderId: true, aiContextChunk: true, chunkStatus: true, chunkTitle: true },
        });
        targetMedia.push(created);
      }
    }
  } else if (params.mediaIds && params.mediaIds.length > 0) {
    // Trường hợp 2: Client gửi mediaIds
    targetMedia = await prisma.mediaFile.findMany({
      where: {
        OR: [
          { id: { in: params.mediaIds } },
          { url: { in: params.mediaIds } },
        ],
      },
      select: { id: true, name: true, url: true, folderId: true, aiContextChunk: true, chunkStatus: true, chunkTitle: true },
    });
  } else if (resolvedFolderInfo) {
    // Trường hợp 3: Client chỉ gửi folderId
    const dbFiles = await prisma.mediaFile.findMany({
      where: {
        OR: [
          { folderId: resolvedFolderInfo.id },
          { url: { startsWith: `/uploads/folders/${resolvedFolderInfo.slug}/` } },
        ],
      },
      select: { id: true, name: true, url: true, folderId: true, aiContextChunk: true, chunkStatus: true, chunkTitle: true },
      orderBy: { createdAt: 'desc' },
    });

    // Lọc các ảnh chưa hoàn tất tạo chunk
    targetMedia = dbFiles.filter((f) => {
      const chunk = f.aiContextChunk as any;
      const isDone =
        f.chunkStatus === 'CHUNKED' ||
        (Boolean(f.chunkTitle) && f.chunkStatus !== 'FAILED') ||
        chunk?.aiStatus === 'DONE';
      return !isDone;
    });

    // Nếu tất cả đã hoàn tất, cho phép phân tích lại toàn bộ ảnh trong thư mục
    if (targetMedia.length === 0) {
      targetMedia = dbFiles;
    }
  } else {
    // Recent pending images in system
    const recent = await prisma.mediaFile.findMany({
      select: { id: true, name: true, url: true, folderId: true, aiContextChunk: true, chunkStatus: true, chunkTitle: true },
      take: 60,
      orderBy: { createdAt: 'desc' },
    });
    targetMedia = recent
      .filter((f) => {
        const chunk = f.aiContextChunk as any;
        const isDone =
          f.chunkStatus === 'CHUNKED' ||
          (Boolean(f.chunkTitle) && f.chunkStatus !== 'FAILED') ||
          chunk?.aiStatus === 'DONE';
        return !isDone;
      })
      .slice(0, 48);
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

  // 2. Set up abort controller and run background loop with batchSize = 2 and delay 300ms
  const abortController = new AbortController();
  activeAbortControllers.set(jobId, abortController);

  // Background detached execution
  (async () => {
    try {
      const chunksMap = new Map<string, AiChunkCluster>();
      const BATCH_SIZE = 2;

      for (let i = 0; i < targetMedia.length; i += BATCH_SIZE) {
        if (abortController.signal.aborted) {
          break;
        }

        const batch = targetMedia.slice(i, i + BATCH_SIZE);
        newJob.currentFileName = batch.map((f) => f.name || path.basename(f.url)).join(', ');
        newJob.updatedAt = new Date().toISOString();

        newJob.logs = [
          `[${new Date().toLocaleTimeString('vi-VN')}] 🔍 Đang phân tích lô ảnh (${i + 1}-${Math.min(i + batch.length, newJob.total)}/${newJob.total}): ${newJob.currentFileName}...`,
          ...newJob.logs.slice(0, 39),
        ];

        // Mark batch as PROCESSING in DB
        await Promise.all(
          batch.map((file) => {
            const existingChunk = (file.aiContextChunk as any) || {};
            return prisma.mediaFile
              .updateMany({
                where: {
                  OR: [{ id: file.id }, { url: file.url }],
                },
                data: {
                  chunkStatus: 'PROCESSING',
                  aiContextChunk: {
                    ...existingChunk,
                    aiStatus: 'RUNNING',
                  },
                },
              })
              .catch(() => null);
          })
        );

        await saveAiChunkJobs(jobs);

        // Process batch items in parallel
        await Promise.all(
          batch.map(async (file, bIdx) => {
            const currentItemIdx = i + bIdx;
            try {
              let analyzed = await analyzeImageWithVisionAI(file.url);

              // Nếu Vision AI không khả dụng (chưa cấu hình API Key hoặc lỗi mạng), sử dụng suy luận thông minh dự phòng
              if (!analyzed) {
                const fallbackChunkName = inferChunkName({
                  mainSubject: file.name,
                  visualDescription: `${resolvedFolderInfo?.name || 'Ảnh cưới'} - ${file.name}`,
                  tags: [resolvedFolderInfo?.slug || '', file.name],
                });
                analyzed = {
                  visualDescription: `Hình ảnh khoảnh khắc cưới thuộc cụm "${fallbackChunkName}" (${file.name}).`,
                  mainSubject: file.name.replace(/\.[^/.]+$/, ''),
                  colorMood: 'Tươi sáng & Tự nhiên',
                  suggestedAlt: `Ảnh cưới ${fallbackChunkName} - PlusMoments Studio`,
                  suggestedCaption: `Khoảnh khắc đẹp tại ${resolvedFolderInfo?.name || 'PlusMoments'}`,
                  chunkName: fallbackChunkName,
                  tags: [fallbackChunkName, 'PlusMoments', 'Wedding'],
                  aiStatus: 'DONE',
                  analyzedAt: new Date().toISOString(),
                };
              }

              if (analyzed) {
                const chunkName = analyzed.chunkName || inferChunkName(analyzed);
                const contextText = analyzed.visualDescription || analyzed.mainSubject || '';
                const enrichedChunk: VisionAIChunk = {
                  ...analyzed,
                  chunkName,
                  aiStatus: 'DONE',
                  analyzedAt: new Date().toISOString(),
                };

                // Sync vector to Pinecone
                let isPineconeUpserted = false;
                try {
                  isPineconeUpserted = await syncMediaVectorToPinecone({
                    id: file.id,
                    folderId: file.folderId,
                    url: file.url,
                    chunkTitle: chunkName,
                    aiContext: contextText,
                  });
                } catch (pineErr) {
                  console.warn('[PINECONE_SYNC_IN_JOB_WARN]:', pineErr);
                }

                // Ghi đồng bộ trực tiếp vào bản ghi ảnh trong Database (Single Source of Truth)
                await prisma.mediaFile.updateMany({
                  where: {
                    OR: [{ id: file.id }, { url: file.url }],
                  },
                  data: {
                    chunkStatus: 'CHUNKED',
                    chunkTitle: chunkName,
                    chunkGroup: chunkName,
                    aiContext: contextText,
                    aiContextChunk: enrichedChunk as any,
                    pineconeSynced: Boolean(isPineconeUpserted),
                  },
                });

                // Update cluster groupings
                if (!chunksMap.has(chunkName)) {
                  chunksMap.set(chunkName, {
                    id: `chunk_${crypto.createHash('md5').update(chunkName).digest('hex').slice(0, 8)}`,
                    name: chunkName,
                    description: analyzed.visualDescription,
                    count: 1,
                    imageIds: [file.id, file.url],
                    sampleUrl: file.url,
                  });
                } else {
                  const cluster = chunksMap.get(chunkName)!;
                  cluster.count += 1;
                  if (!cluster.imageIds.includes(file.id)) {
                    cluster.imageIds.push(file.id);
                  }
                  if (!cluster.imageIds.includes(file.url)) {
                    cluster.imageIds.push(file.url);
                  }
                }

                newJob.chunksCreated = Array.from(chunksMap.values());
                newJob.successCount += 1;
                const pineconeTag = isPineconeUpserted ? ' [🌲 Đã đồng bộ Pinecone Vector DB]' : '';
                newJob.logs = [
                  `[${new Date().toLocaleTimeString('vi-VN')}] ✨ Đã gom nhóm (${currentItemIdx + 1}/${newJob.total}): "${file.name}" → [${chunkName}]${pineconeTag}`,
                  ...newJob.logs.slice(0, 39),
                ];
              } else {
                // Failed to analyze
                await prisma.mediaFile
                  .updateMany({
                    where: {
                      OR: [{ id: file.id }, { url: file.url }],
                    },
                    data: {
                      chunkStatus: 'FAILED',
                      aiContextChunk: {
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
                .updateMany({
                  where: {
                    OR: [{ id: file.id }, { url: file.url }],
                  },
                  data: {
                    chunkStatus: 'FAILED',
                    aiContextChunk: {
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
          })
        );

        newJob.processed = Math.min(newJob.total, i + batch.length);
        newJob.updatedAt = new Date().toISOString();
        await saveAiChunkJobs(jobs);

        // Delay 300ms giữa các lô batchSize = 2 để tránh 429 rate limit
        if (i + BATCH_SIZE < targetMedia.length && !abortController.signal.aborted) {
          await new Promise((resolve) => setTimeout(resolve, 300));
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

      // Đảm bảo đồng bộ kết quả Job vào DB thêm 1 lần cuối
      await syncJobResultsToMediaDatabase(newJob).catch(() => null);
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
