import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import os from 'os';
import sharp from 'sharp';
import { prisma } from '@/lib/prisma';
import {
  generateResponsiveWebPVariants,
  generateTinyBlurDataUrl,
} from '@/lib/image-variants';
import {
  downloadDriveImageBuffer,
  convertBufferToOptimizedWebP,
  getAllFilesRecursively,
  parseGoogleDriveFolderId,
  ScannedFolderItem,
  ScannedImageItem,
} from '@/lib/drive';
import { analyzeAndCacheImageChunk } from '@/lib/vision-ai';
import { getOrientation } from '@/lib/image-dimensions';

export interface MediaJob {
  id: string;
  type: 'google-drive' | 'local-upload';
  folderName: string;
  folderSlug?: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  totalFiles: number;
  processedFiles: number;
  successCount: number;
  failedCount: number;
  skippedCount: number;
  currentFileName?: string;
  errors: string[];
  createdAt: string;
  updatedAt: string;
  dismissed: boolean;
  userId?: string | null;
  summary?: {
    totalFiles: number;
    successCount: number;
    skippedCount: number;
    failedCount: number;
  };
}

const JOBS_FILE_PATH = path.join(process.cwd(), 'prisma', 'media-jobs.json');
const abortControllers = new Map<string, AbortController>();
let isInitialized = false;

// Ensure prisma dir exists & load initial jobs
function ensureStorageDirectory(): void {
  const dir = path.dirname(JOBS_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Atomic file write to avoid corrupted JSON on crash
async function saveJobsToDisk(jobs: MediaJob[]): Promise<void> {
  ensureStorageDirectory();
  const tmpPath = `${JOBS_FILE_PATH}.${process.pid}.${Date.now()}.tmp`;
  try {
    await fs.promises.writeFile(tmpPath, JSON.stringify(jobs, null, 2), 'utf-8');
    await fs.promises.rename(tmpPath, JOBS_FILE_PATH);
  } catch (err) {
    if (fs.existsSync(tmpPath)) {
      try {
        await fs.promises.unlink(tmpPath);
      } catch {}
    }
    console.error('[MEDIA_JOB_QUEUE] Failed to save jobs to disk:', err);
  }
}

// Read jobs from disk & sanitize dangling "running" jobs after server restart
export async function loadJobsFromDisk(): Promise<MediaJob[]> {
  ensureStorageDirectory();
  if (!fs.existsSync(JOBS_FILE_PATH)) {
    return [];
  }

  try {
    const raw = await fs.promises.readFile(JOBS_FILE_PATH, 'utf-8');
    const jobs: MediaJob[] = JSON.parse(raw);

    // On cold boot / process start: detect interrupted jobs
    if (!isInitialized) {
      isInitialized = true;
      let hasChanges = false;
      const sanitized = jobs.map((j) => {
        if (j.status === 'running') {
          hasChanges = true;
          return {
            ...j,
            status: 'failed' as const,
            errors: [
              ...j.errors,
              'Tiến trình bị gián đoạn do máy chủ hoặc PM2 khởi động lại.',
            ],
            updatedAt: new Date().toISOString(),
          };
        }
        return j;
      });

      if (hasChanges) {
        await saveJobsToDisk(sanitized);
        return sanitized;
      }
    }

    return jobs;
  } catch (err) {
    console.error('[MEDIA_JOB_QUEUE] Failed to read jobs from disk:', err);
    return [];
  }
}

export async function getActiveJobs(): Promise<MediaJob[]> {
  const allJobs = await loadJobsFromDisk();
  // Return running jobs or completed/failed jobs that haven't been dismissed yet
  return allJobs
    .filter((j) => j.status === 'running' || !j.dismissed)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getJobById(id: string): Promise<MediaJob | null> {
  const allJobs = await loadJobsFromDisk();
  return allJobs.find((j) => j.id === id) || null;
}

export async function createMediaJob(params: {
  type: 'google-drive' | 'local-upload';
  folderName: string;
  folderSlug?: string;
  totalFiles?: number;
  userId?: string | null;
}): Promise<MediaJob> {
  const allJobs = await loadJobsFromDisk();

  const newJob: MediaJob = {
    id: `job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type: params.type,
    folderName: params.folderName,
    folderSlug: params.folderSlug,
    status: 'running',
    totalFiles: params.totalFiles || 0,
    processedFiles: 0,
    successCount: 0,
    failedCount: 0,
    skippedCount: 0,
    errors: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    dismissed: false,
    userId: params.userId || null,
  };

  const controller = new AbortController();
  abortControllers.set(newJob.id, controller);

  allJobs.unshift(newJob);
  // Keep maximum 50 recent jobs in history
  const trimmed = allJobs.slice(0, 50);
  await saveJobsToDisk(trimmed);

  return newJob;
}

export async function updateMediaJob(
  id: string,
  updates: Partial<MediaJob>
): Promise<MediaJob | null> {
  const allJobs = await loadJobsFromDisk();
  const index = allJobs.findIndex((j) => j.id === id);
  if (index === -1) return null;

  const current = allJobs[index];
  const updated: MediaJob = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  allJobs[index] = updated;
  await saveJobsToDisk(allJobs);
  return updated;
}

export async function dismissMediaJob(id: string): Promise<boolean> {
  const res = await updateMediaJob(id, { dismissed: true });
  return Boolean(res);
}

export async function cancelMediaJob(id: string): Promise<boolean> {
  const controller = abortControllers.get(id);
  if (controller) {
    controller.abort();
    abortControllers.delete(id);
  }

  const res = await updateMediaJob(id, {
    status: 'cancelled',
    errors: ['Tiến trình đã được người quản trị hủy.'],
  });
  return Boolean(res);
}

// Bounded Concurrency Runner (max 2 parallel workers to keep VPS CPU/RAM low)
async function runWithConcurrency<T>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<void>
): Promise<void> {
  let index = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const currentIndex = index++;
      await fn(items[currentIndex], currentIndex);
    }
  });
  await Promise.all(workers);
}

// =========================================================================
// BACKGROUND WORKER: GOOGLE DRIVE IMPORT
// =========================================================================
export function startGoogleDriveImportJob(
  jobId: string,
  options: {
    folders: Array<{ id: string; name?: string }>;
    apiKey?: string;
    userId?: string | null;
  }
): void {
  // Fire and forget: runs in background on VPS Node.js process
  void (async () => {
    const controller = abortControllers.get(jobId) || new AbortController();
    abortControllers.set(jobId, controller);

    try {
      const { folders, apiKey = '', userId } = options;

      // 1. Recursive scan across all target folders
      const allScannedImages: ScannedImageItem[] = [];
      const folderCache = new Map<string, any>();
      const savedFolderIds = new Set<string>();

      for (const target of folders) {
        if (controller.signal.aborted) break;

        const cleanFolderId = parseGoogleDriveFolderId(target.id) || target.id;
        try {
          const scanResult = await getAllFilesRecursively(cleanFolderId, '', apiKey);
          allScannedImages.push(...scanResult.images);
        } catch (scanErr: any) {
          await updateMediaJob(jobId, {
            errors: [`Không thể quét thư mục Drive "${target.name || target.id}": ${scanErr.message}`],
          });
        }
      }

      if (controller.signal.aborted) {
        await updateMediaJob(jobId, { status: 'cancelled' });
        return;
      }

      if (allScannedImages.length === 0) {
        await updateMediaJob(jobId, {
          status: 'completed',
          totalFiles: 0,
          processedFiles: 0,
          summary: {
            totalFiles: 0,
            successCount: 0,
            skippedCount: 0,
            failedCount: 0,
          },
        });
        return;
      }

      // Update total file count
      await updateMediaJob(jobId, {
        totalFiles: allScannedImages.length,
      });

      // Helper to ensure DB folder exists
      const ensureDbFolder = async (folderItem: ScannedFolderItem) => {
        if (folderCache.has(folderItem.slug)) {
          return folderCache.get(folderItem.slug);
        }

        const existingInDb = await prisma.mediaFolder.findUnique({
          where: { slug: folderItem.slug },
        });

        const targetDirAbsolute = path.join(
          process.cwd(),
          'public',
          'uploads',
          'folders',
          folderItem.slug
        );
        if (!fs.existsSync(targetDirAbsolute)) {
          await fs.promises.mkdir(targetDirAbsolute, { recursive: true });
        }

        const dbFolder = existingInDb
          ? await prisma.mediaFolder.update({
              where: { slug: folderItem.slug },
              data: {
                name: folderItem.name,
              },
            })
          : await prisma.mediaFolder.create({
              data: {
                name: folderItem.name,
                slug: folderItem.slug,
              },
            });

        folderCache.set(folderItem.slug, dbFolder);
        return dbFolder;
      };

      let processed = 0;
      let success = 0;
      let skipped = 0;
      let failed = 0;
      const errors: string[] = [];

      // Concurrency = 2 workers to protect VPS memory and CPU
      await runWithConcurrency(allScannedImages, 2, async (img) => {
        if (controller.signal.aborted) return;

        try {
          // Check if file already exists in DB
          const existingFile = await prisma.mediaFile.findFirst({
            where: {
              OR: [
                { driveFileId: img.id },
                ...(img.md5Checksum ? [{ md5Checksum: img.md5Checksum }] : []),
              ],
            },
          });

          if (existingFile) {
            skipped++;
            processed++;
            await updateMediaJob(jobId, {
              processedFiles: processed,
              skippedCount: skipped,
              currentFileName: `[Đã có] ${img.name}`,
            });
            return;
          }

          // Download image buffer from Drive
          const { buffer } = await downloadDriveImageBuffer(img.id, apiKey);
          const dbFolder = await ensureDbFolder(img.folder);

          // Convert buffer to WebP with responsive variants (-sm.webp, -md.webp)
          const converted = await convertBufferToOptimizedWebP(
            buffer,
            img.name,
            `folders/${img.folder.slug}`
          );

          const checksum =
            img.md5Checksum || crypto.createHash('md5').update(buffer).digest('hex');

          // Generate tiny blur placeholder
          let blurDataUrl: string | null = null;
          try {
            blurDataUrl = await generateTinyBlurDataUrl(buffer);
          } catch {}

          const dbFile = await prisma.mediaFile.create({
            data: {
              name: img.name,
              url: converted.publicUrl,
              size: converted.size,
              format: 'WEBP',
              width: converted.width,
              height: converted.height,
              folderId: dbFolder.id,
              driveFileId: img.id,
              md5Checksum: checksum,
              uploadedById: userId || null,
              aiContextChunk: blurDataUrl ? ({ blurDataUrl } as any) : undefined,
            },
          });

          savedFolderIds.add(dbFolder.id);
          // Vision AI analysis in background
          analyzeAndCacheImageChunk(dbFile.id, converted.publicUrl);

          success++;
          processed++;

          await updateMediaJob(jobId, {
            processedFiles: processed,
            successCount: success,
            currentFileName: img.name,
          });
        } catch (itemErr: any) {
          failed++;
          processed++;
          errors.push(`[${img.folder.name}] ${img.name}: ${itemErr.message}`);
          await updateMediaJob(jobId, {
            processedFiles: processed,
            failedCount: failed,
            errors,
          });
        }
      });

      if (controller.signal.aborted) {
        await updateMediaJob(jobId, { status: 'cancelled' });
        return;
      }

      // Mark completed
      await updateMediaJob(jobId, {
        status: failed === allScannedImages.length && success === 0 ? 'failed' : 'completed',
        processedFiles: processed,
        successCount: success,
        skippedCount: skipped,
        failedCount: failed,
        currentFileName: undefined,
        summary: {
          totalFiles: allScannedImages.length,
          successCount: success,
          skippedCount: skipped,
          failedCount: failed,
        },
      });
    } catch (jobErr: any) {
      console.error('[MEDIA_JOB_QUEUE] Fatal Drive job error:', jobErr);
      await updateMediaJob(jobId, {
        status: 'failed',
        errors: [`Lỗi nghiêm trọng: ${jobErr.message}`],
      });
    } finally {
      abortControllers.delete(jobId);
    }
  })();
}

// =========================================================================
// BACKGROUND WORKER: LOCAL MULTI-FILE UPLOAD
// =========================================================================
export interface LocalTempUploadItem {
  tempFilePath: string;
  originalName: string;
  size: number;
}

export function startLocalUploadJob(
  jobId: string,
  options: {
    items: LocalTempUploadItem[];
    folderSlug?: string;
    folderName?: string;
    userId?: string | null;
  }
): void {
  // Fire and forget: runs in background on VPS Node.js process
  void (async () => {
    const controller = abortControllers.get(jobId) || new AbortController();
    abortControllers.set(jobId, controller);

    try {
      const { items, folderSlug, folderName, userId } = options;

      let targetDir = path.join(process.cwd(), 'public', 'uploads');
      let relativeUrlPrefix = '/uploads';

      if (folderSlug) {
        targetDir = path.join(targetDir, 'folders', folderSlug);
        relativeUrlPrefix = `/uploads/folders/${folderSlug}`;
      }

      if (!fs.existsSync(targetDir)) {
        await fs.promises.mkdir(targetDir, { recursive: true });
      }

      // Look up folder record
      let folderRecord = null;
      if (folderSlug) {
        folderRecord = await prisma.mediaFolder.findFirst({
          where: { slug: folderSlug },
        });
      }

      let processed = 0;
      let success = 0;
      let failed = 0;
      const errors: string[] = [];

      // Concurrency = 2
      await runWithConcurrency(items, 2, async (item) => {
        if (controller.signal.aborted) return;

        try {
          const buffer = await fs.promises.readFile(item.tempFilePath);

          const rawName = item.originalName
            .replace(/\.[^/.]+$/, '')
            .replace(/[^a-zA-Z0-9_-]/g, '-')
            .toLowerCase();
          const timestamp = Date.now();
          const randomSuffix = Math.random().toString(36).substring(2, 6);
          const finalFilename = `${rawName}-${timestamp}-${randomSuffix}.webp`;
          const finalFilePath = path.join(targetDir, finalFilename);

          let imageWidth: number | undefined;
          let imageHeight: number | undefined;
          let finalBuffer: Buffer = buffer;

          try {
            let image = sharp(buffer);
            const metadata = await image.metadata();
            imageWidth = metadata.width;
            imageHeight = metadata.height;

            if (imageWidth && imageWidth > 2048) {
              image = image.resize({
                width: 2048,
                withoutEnlargement: true,
                fit: 'inside',
              });
            }

            finalBuffer = await image.webp({ quality: 82, effort: 4 }).toBuffer();
          } catch {
            finalBuffer = buffer;
          }

          await fs.promises.writeFile(finalFilePath, finalBuffer);

          // Responsive variants & tiny blur
          const [, blurDataUrl] = await Promise.all([
            generateResponsiveWebPVariants(finalBuffer, finalFilePath),
            generateTinyBlurDataUrl(finalBuffer),
          ]);

          const publicUrl = `${relativeUrlPrefix}/${finalFilename}`;
          const displayName = item.originalName
            .replace(/\.[^/.]+$/, '')
            .replace(/[-_]/g, ' ');

          const mediaFile = await prisma.mediaFile.create({
            data: {
              name: displayName,
              url: publicUrl,
              size: finalBuffer.length,
              format: 'WEBP',
              width: imageWidth,
              height: imageHeight,
              folderId: folderRecord?.id || null,
              uploadedById: userId || null,
              aiContextChunk: { blurDataUrl } as any,
            },
          });

          analyzeAndCacheImageChunk(mediaFile.id, publicUrl);

          // Delete temp file after successful processing
          try {
            await fs.promises.unlink(item.tempFilePath);
          } catch {}

          success++;
          processed++;

          await updateMediaJob(jobId, {
            processedFiles: processed,
            successCount: success,
            currentFileName: item.originalName,
          });
        } catch (itemErr: any) {
          failed++;
          processed++;
          errors.push(`${item.originalName}: ${itemErr.message}`);

          try {
            await fs.promises.unlink(item.tempFilePath);
          } catch {}

          await updateMediaJob(jobId, {
            processedFiles: processed,
            failedCount: failed,
            errors,
          });
        }
      });

      if (controller.signal.aborted) {
        await updateMediaJob(jobId, { status: 'cancelled' });
        return;
      }

      await updateMediaJob(jobId, {
        status: failed === items.length && success === 0 ? 'failed' : 'completed',
        processedFiles: processed,
        successCount: success,
        failedCount: failed,
        currentFileName: undefined,
        summary: {
          totalFiles: items.length,
          successCount: success,
          skippedCount: 0,
          failedCount: failed,
        },
      });
    } catch (jobErr: any) {
      console.error('[MEDIA_JOB_QUEUE] Fatal Local Upload job error:', jobErr);
      await updateMediaJob(jobId, {
        status: 'failed',
        errors: [`Lỗi nghiêm trọng: ${jobErr.message}`],
      });
    } finally {
      abortControllers.delete(jobId);
    }
  })();
}
