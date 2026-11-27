'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  FolderArchive,
  HardDrive,
  Search,
  RefreshCw,
  Copy,
  Check,
  Trash2,
  Loader2,
  AlertCircle,
  FileCheck2,
  Maximize2,
  X,
  Sparkles,
  Layers,
  SlidersHorizontal,
  Folder,
  FolderPlus,
  FolderInput,
  CheckSquare,
  ChevronRight,
  ArrowLeft,
  Edit2,
  Image as ImageIcon,
  Download,
  Upload,
  RectangleHorizontal,
  RectangleVertical,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  RotateCcw,
  FileText,
  LayoutGrid,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { DriveMediaPicker } from '@/components/admin/DriveMediaPicker';
import { AlbumCollageStudioModal } from '@/components/admin/AlbumCollageStudioModal';

interface AiChunkCluster {
  id: string;
  name: string;
  description?: string;
  count: number;
  imageIds: string[];
  sampleUrl?: string;
}

interface AiChunkJob {
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

interface MediaItem {
  id: string;
  filename: string;
  name: string;
  url: string;
  size: number;
  formattedSize: string;
  format: string;
  width?: number;
  height?: number;
  orientation?: 'landscape' | 'portrait' | 'square';
  createdAt: string;
  modifiedAt: string;
  uploadedById?: string | null;
  uploaderName?: string | null;
  folderId?: string | null;
  aiContextChunk?: any;
  aiStatus?: 'PENDING' | 'RUNNING' | 'DONE' | 'FAILED';
  chunkName?: string;
  chunkStatus?: 'NOT_CHUNKED' | 'PROCESSING' | 'CHUNKED' | 'FAILED';
  chunkTitle?: string | null;
  chunkGroup?: string | null;
  aiContext?: string | null;
  pineconeSynced?: boolean;
}

interface FolderItem {
  id?: string;
  slug: string;
  name: string;
  path: string;
  imageCount: number;
  totalBytes: number;
  formattedSize: string;
  coverImage?: string | null;
  driveFolderId?: string;
  createdAt: string;
  updatedAt?: string;
  modifiedAt: string;
  isInvitation?: boolean;
  category?: 'album' | 'invitation';
  invitationSlug?: string;
  coupleTitle?: string | null;
}

function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Convert high-res WebP URL to 540w -sm.webp thumbnail variant
function getThumbnailUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.includes('-sm.webp') || url.includes('-md.webp')) return url;
  if (url.endsWith('.webp')) {
    return url.replace(/\.webp$/, '-sm.webp');
  }
  return url;
}

interface UploadQueueItem {
  id: string;
  name: string;
  size: number;
  formattedSize: string;
  folderSlug?: string;
  folderName?: string;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  errorMessage?: string;
}

interface MediaStats {
  totalFiles: number;
  totalBytes: number;
  formattedTotalSize: string;
  totalFolders: number;
  formatsCount: Record<string, number>;
}

export default function AdminMediaPage() {
  const [currentUser, setCurrentUser] = useState<{ id: string; role: string } | null>(null);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [rootMedia, setRootMedia] = useState<MediaItem[]>([]);
  const [allMedia, setAllMedia] = useState<MediaItem[]>([]);
  const [stats, setStats] = useState<MediaStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCollageModalOpen, setIsCollageModalOpen] = useState(false);

  // Folder Navigation State (null = Root level)
  const [currentFolder, setCurrentFolder] = useState<FolderItem | null>(null);
  const [folderImages, setFolderImages] = useState<MediaItem[]>([]);
  const [folderFilterCategory, setFolderFilterCategory] = useState<'ALL' | 'ALBUMS' | 'INVITATIONS'>('ALL');
  const [folderLoading, setFolderLoading] = useState(false);

  // Search & Filter & Sort & Orientation state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<string>('ALL');
  const [selectedOrientation, setSelectedOrientation] = useState<'all' | 'landscape' | 'portrait'>('all');
  const [loadedDimensions, setLoadedDimensions] = useState<Record<string, { width: number; height: number; orientation: 'landscape' | 'portrait' | 'square' }>>({});
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'size_desc' | 'size_asc' | 'name_asc'>('newest');

  // Copy URL visual state per card
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Delete Image modal state
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Lightbox modal state
  const [lightboxItem, setLightboxItem] = useState<MediaItem | null>(null);

  // Drive Picker Modal state
  const [isDrivePickerOpen, setIsDrivePickerOpen] = useState(false);
  const [isDeduplicating, setIsDeduplicating] = useState(false);

  // Create Folder Modal state
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);

  // Rename Folder Modal state
  const [renameTargetFolder, setRenameTargetFolder] = useState<FolderItem | null>(null);
  const [renameFolderName, setRenameFolderName] = useState('');
  const [renamingFolder, setRenamingFolder] = useState(false);

  // Delete Folder Modal state
  const [deleteTargetFolder, setDeleteTargetFolder] = useState<FolderItem | null>(null);
  const [deletingFolder, setDeletingFolder] = useState(false);

  // Folder Multi-Selection & Bulk Delete state
  const [selectedFolderIds, setSelectedFolderIds] = useState<string[]>([]);
  const [isBulkDeleteFoldersModalOpen, setIsBulkDeleteFoldersModalOpen] = useState(false);
  const [bulkDeletingFolders, setBulkDeletingFolders] = useState(false);

  // Multi-Selection State & Actions
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [targetFolderForMove, setTargetFolderForMove] = useState<string>('root');
  const [movingFiles, setMovingFiles] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [downloadingBatch, setDownloadingBatch] = useState(false);
  const [downloadingFolderId, setDownloadingFolderId] = useState<string | null>(null);

  // Upload Queue & Drag-and-Drop state
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [isUploadDrawerOpen, setIsUploadDrawerOpen] = useState(false);
  const [isDraggingOverPage, setIsDraggingOverPage] = useState(false);
  const [dragOverFolderSlug, setDragOverFolderSlug] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dragCounter = useRef<number>(0);

  // Collapsible Root Media state (collapsed by default in Overview)
  const [isRootMediaExpanded, setIsRootMediaExpanded] = useState<boolean>(false);

  // Observable AI Chunk Job state (Phase 2)
  const [aiJob, setAiJob] = useState<AiChunkJob | null>(null);
  const [isAiDrawerExpanded, setIsAiDrawerExpanded] = useState<boolean>(true);
  const [isStartingAi, setIsStartingAi] = useState<boolean>(false);
  const [processingMediaIds, setProcessingMediaIds] = useState<string[]>([]);
  const [selectedChunkFilter, setSelectedChunkFilter] = useState<string>('ALL');
  const [chunkStatusFilter, setChunkStatusFilter] = useState<'ALL' | 'CHUNKED' | 'NOT_CHUNKED'>('ALL');
  const aiPollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const prevJobProgressRef = useRef<{ processed: number; status: string }>({ processed: 0, status: 'IDLE' });
  const currentFolderRef = useRef<FolderItem | null>(null);
  currentFolderRef.current = currentFolder;
  const onRefreshMediaListRef = useRef<(silent?: boolean) => void>(() => {});
  const hasRefetchedOnCompleteRef = useRef<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Active folder key for stable string dependency comparisons
  const activeFolderKey = currentFolder?.id || currentFolder?.slug || '';
  const lastFolderKeyRef = useRef<string>('');

  // Create Album from Chunk Modal state
  const [createAlbumModalOpen, setCreateAlbumModalOpen] = useState(false);
  const [newAlbumTitle, setNewAlbumTitle] = useState('');
  const [newAlbumConcept, setNewAlbumConcept] = useState('Pre-Wedding');
  const [creatingAlbumFromChunk, setCreatingAlbumFromChunk] = useState(false);

  // Progressive Rendering & Infinite Scroll
  const [visibleCount, setVisibleCount] = useState(24);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Show Toast - memoized to prevent downstream callback recreation
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimeoutRef.current = null;
    }, 3500);
  }, []);

  // Fetch all media and folders from backend (silent = true prevents full-screen skeleton flash)
  const fetchMedia = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
        setErrorMessage('');
      }

      const res = await fetch(`/api/admin/media?t=${Date.now()}`, {
        cache: 'no-store',
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Không thể tải danh sách tài nguyên media.');
      }

      setFolders(data.folders || []);
      setRootMedia(data.rootMedia || []);
      setAllMedia(data.media || []);
      setStats(data.stats || null);
    } catch (err: any) {
      if (!silent) {
        setErrorMessage(err.message || 'Lỗi khi tải kho lưu trữ media.');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  // Fetch images in a specific folder (silent = true prevents full-screen skeleton flash)
  const fetchFolderContent = useCallback(
    async (slug: string, silent = false) => {
      try {
        if (!silent) {
          setFolderLoading(true);
        }
        const res = await fetch(`/api/admin/media/folders/${encodeURIComponent(slug)}?t=${Date.now()}`, {
          cache: 'no-store',
        });
        const data = await res.json();

        if (data.success) {
          const newImages = data.images || [];
          // Shallow diff on key properties to prevent unnecessary re-render of image cards
          setFolderImages((prevImages) => {
            if (prevImages.length !== newImages.length) return newImages;
            const hasChanged = newImages.some((img: any, idx: number) => {
              const prev = prevImages[idx];
              if (!prev) return true;
              return (
                prev.id !== img.id ||
                prev.chunkStatus !== img.chunkStatus ||
                prev.chunkTitle !== img.chunkTitle ||
                prev.aiStatus !== img.aiStatus ||
                prev.url !== img.url
              );
            });
            return hasChanged ? newImages : prevImages;
          });

          if (data.folder) {
            // Keep object reference stable if folder metadata hasn't changed
            setCurrentFolder((prev) => {
              if (
                prev &&
                prev.id === data.folder.id &&
                prev.slug === data.folder.slug &&
                prev.name === data.folder.name &&
                prev.imageCount === data.folder.imageCount
              ) {
                return prev;
              }
              return data.folder;
            });
          }
        } else {
          throw new Error(data.error || 'Không thể tải chi tiết thư mục.');
        }
      } catch (err: any) {
        if (!silent) {
          showToast(`Lỗi tải thư mục: ${err.message}`);
        }
      } finally {
        if (!silent) {
          setFolderLoading(false);
        }
      }
    },
    [showToast]
  );

  // Background refresh callback defaults to silent = true to avoid unmounting the image grid
  const onRefreshMediaList = useCallback(
    (silent = true) => {
      if (currentFolderRef.current) {
        const targetSlug = currentFolderRef.current.slug || currentFolderRef.current.id;
        if (targetSlug) {
          fetchFolderContent(targetSlug, silent);
        }
      } else {
        fetchMedia(silent);
      }
    },
    [fetchFolderContent, fetchMedia]
  );
  onRefreshMediaListRef.current = onRefreshMediaList;

  useEffect(() => {
    fetchMedia();
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setCurrentUser({ id: data.user.userId, role: data.user.role });
        }
      })
      .catch(() => {});
  }, [fetchMedia]);

  // Completely stable fetchAiJobStatus callback: uses ref for onRefreshMediaList to break dependency cycles
  const fetchAiJobStatus = useCallback(async (targetFolderId?: string, targetJobId?: string) => {
    try {
      const q = new URLSearchParams();
      if (targetJobId) q.set('jobId', targetJobId);
      if (targetFolderId) q.set('folderId', targetFolderId);
      q.set('t', Date.now().toString());
      const res = await fetch(`/api/admin/media/ai-chunk-jobs/status?${q.toString()}`, {
        cache: 'no-store',
      });
      if (!res.ok) {
        setAiJob((prev) => (prev === null ? null : null));
        return null;
      }
      const data = await res.json();
      if (data.success && data.job) {
        // Prevent state update if job properties are identical
        setAiJob((prevJob) => {
          if (
            prevJob &&
            prevJob.jobId === data.job.jobId &&
            prevJob.status === data.job.status &&
            prevJob.processed === data.job.processed &&
            prevJob.total === data.job.total &&
            (prevJob.chunksCreated?.length || 0) === (data.job.chunksCreated?.length || 0)
          ) {
            return prevJob;
          }
          return data.job;
        });

        const prev = prevJobProgressRef.current;
        if (
          data.job.processed !== prev.processed ||
          (data.job.status === 'COMPLETED' && prev.status !== 'COMPLETED')
        ) {
          prevJobProgressRef.current = { processed: data.job.processed, status: data.job.status };
          onRefreshMediaListRef.current(true);
        }
        return data.job;
      } else {
        setAiJob((prev) => (prev === null ? null : null));
        return null;
      }
    } catch {
      setAiJob((prev) => (prev === null ? null : null));
      return null;
    }
  }, []);

  const triggerAiChunkJob = useCallback(
    async (
      mediaIds?: string[],
      targetFolderId?: string,
      items?: Array<{ id?: string; url?: string; filename?: string; name?: string }>
    ) => {
      setIsStartingAi(true);
      try {
        const folder = currentFolderRef.current;
        const folderParam = targetFolderId || folder?.id || folder?.slug;
        const res = await fetch('/api/admin/media/ai-chunk-jobs/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mediaIds: mediaIds && mediaIds.length > 0 ? mediaIds : undefined,
            folderId: folderParam,
            folderSlug: folder?.slug,
            items: items && items.length > 0 ? items : undefined,
          }),
        });
        const data = await res.json();
        if (data.success && data.job) {
          setAiJob(data.job);
          setIsAiDrawerExpanded(true);
          prevJobProgressRef.current = { processed: data.job.processed, status: data.job.status };
          showToast(`Đã khởi chạy phân tích AI cho ${data.job.total} ảnh.`);
          onRefreshMediaListRef.current(true);
        } else if (data.message) {
          showToast(data.message);
        }
      } catch (err: any) {
        showToast(`Không thể khởi chạy AI: ${err.message}`);
      } finally {
        setIsStartingAi(false);
      }
    },
    [showToast]
  );

  const handleCancelAiJob = useCallback(async () => {
    if (!aiJob) return;
    const folder = currentFolderRef.current;
    try {
      await fetch('/api/admin/media/ai-chunk-jobs/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: aiJob.jobId, folderId: folder?.id }),
      });
      showToast('Đã tạm dừng tiến trình phân tích AI.');
      fetchAiJobStatus(folder?.id, aiJob.jobId);
      onRefreshMediaListRef.current(true);
    } catch (err: any) {
      showToast(`Lỗi khi dừng: ${err.message}`);
    }
  }, [aiJob, fetchAiJobStatus, showToast]);

  const handleRetryAiJob = useCallback(async () => {
    try {
      setIsStartingAi(true);
      const folder = currentFolderRef.current;
      const res = await fetch('/api/admin/media/ai-chunk-jobs/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: aiJob?.jobId,
          folderId: folder?.id,
        }),
      });
      const data = await res.json();
      if (data.success && data.job) {
        setAiJob(data.job);
        setIsAiDrawerExpanded(true);
        prevJobProgressRef.current = { processed: data.job.processed, status: data.job.status };
        showToast(`Đã bắt đầu chạy lại phân tích AI cho ${data.job.total} ảnh.`);
        onRefreshMediaListRef.current(true);
      }
    } catch (err: any) {
      showToast(`Lỗi khi chạy lại: ${err.message}`);
    } finally {
      setIsStartingAi(false);
    }
  }, [aiJob?.jobId, showToast]);

  const handleDismissAiJob = useCallback(async () => {
    if (!aiJob) return;
    const currentJobId = aiJob.jobId;
    const folder = currentFolderRef.current;
    const currentFolderId = folder?.id || folder?.slug;
    setAiJob(null);
    try {
      await fetch('/api/admin/media/ai-chunk-jobs/dismiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: currentJobId, folderId: currentFolderId }),
      });
    } catch (err) {
      console.warn('[DISMISS_AI_JOB_ERROR]:', err);
    }
  }, [aiJob]);

  const handleConvertSingleImage = useCallback(
    async (item: any) => {
      const targetKey = item.id || item.url;
      if (!targetKey || processingMediaIds.includes(targetKey)) return;

      setProcessingMediaIds((prev) => [...prev, targetKey]);
      showToast(`Đang phân tích AI và tạo chunk cho ảnh "${item.name || item.filename}"...`);

      try {
        const folder = currentFolderRef.current;
        const folderParam = item.folderId || folder?.id || folder?.slug;
        const res = await fetch('/api/admin/media/ai-chunk-jobs/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            folderId: folderParam,
            folderSlug: folder?.slug,
            items: [{ id: item.id, url: item.url, filename: item.filename, name: item.name }],
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          showToast(`Lỗi: ${data.message || data.error || 'Không thể tạo chunk cho ảnh này.'}`);
          return;
        }

        if (data.job) {
          setAiJob(data.job);
          setIsAiDrawerExpanded(true);
          prevJobProgressRef.current = { processed: data.job.processed, status: data.job.status };

          // Chờ worker hoàn tất tấm ảnh này (tối đa 15 giây)
          let isDone = data.job.status === 'COMPLETED';
          let attempts = 0;
          while (!isDone && attempts < 10) {
            await new Promise((r) => setTimeout(r, 1200));
            attempts++;
            const check = await fetchAiJobStatus(folderParam, data.job.jobId);
            if (check?.status === 'COMPLETED' || check?.status === 'FAILED' || check?.status === 'CANCELLED') {
              isDone = true;
            }
          }
          onRefreshMediaListRef.current(true);
          showToast(`✓ Đã tạo Chunk thành công cho "${item.name || item.filename}"!`);
        }
      } catch (err: any) {
        showToast(`Không thể tạo chunk cho ảnh này: ${err.message}`);
      } finally {
        setProcessingMediaIds((prev) => prev.filter((id) => id !== targetKey));
      }
    },
    [fetchAiJobStatus, processingMediaIds, showToast]
  );

  // Poll AI job progress every 2s ONLY when RUNNING
  const isJobRunning = aiJob?.status === 'RUNNING';
  const runningJobId = aiJob?.jobId;

  useEffect(() => {
    if (aiPollTimerRef.current) {
      clearTimeout(aiPollTimerRef.current);
      aiPollTimerRef.current = null;
    }

    if (!isJobRunning || !runningJobId) {
      // If completed or failed, make sure we refresh once silently if we haven't yet for this job
      if (
        (aiJob?.status === 'COMPLETED' || aiJob?.status === 'FAILED') &&
        hasRefetchedOnCompleteRef.current !== aiJob.jobId
      ) {
        hasRefetchedOnCompleteRef.current = aiJob.jobId;
        onRefreshMediaListRef.current(true);
      }
      return;
    }

    aiPollTimerRef.current = setTimeout(async () => {
      await fetchAiJobStatus(activeFolderKey, runningJobId);
    }, 2000);

    return () => {
      if (aiPollTimerRef.current) {
        clearTimeout(aiPollTimerRef.current);
        aiPollTimerRef.current = null;
      }
    };
  }, [isJobRunning, runningJobId, activeFolderKey, aiJob?.status, fetchAiJobStatus]);

  // When changing folder, reset previous job state immediately, then fetch new folder's job
  useEffect(() => {
    if (lastFolderKeyRef.current === activeFolderKey) {
      return;
    }
    lastFolderKeyRef.current = activeFolderKey;

    setAiJob(null);
    setSelectedChunkFilter('ALL');
    setIsStartingAi(false);
    if (aiPollTimerRef.current) {
      clearTimeout(aiPollTimerRef.current);
      aiPollTimerRef.current = null;
    }

    if (activeFolderKey) {
      fetchAiJobStatus(activeFolderKey);
    }
  }, [activeFolderKey, fetchAiJobStatus]);

  // Handle open create album from active chunk
  const handleOpenCreateAlbumModal = useCallback((chunkName: string) => {
    setNewAlbumTitle(`Bộ Sưu Tập: ${chunkName}`);
    const lower = chunkName.toLowerCase();
    if (lower.includes('gia tiên') || lower.includes('truyền thống') || lower.includes('áo dài')) {
      setNewAlbumConcept('Lễ Gia Tiên');
    } else if (lower.includes('phóng sự') || lower.includes('cảm xúc')) {
      setNewAlbumConcept('Phóng Sự Cưới');
    } else if (lower.includes('tiệc cưới') || lower.includes('không gian')) {
      setNewAlbumConcept('Tiệc Cưới Luxury');
    } else if (lower.includes('studio') || lower.includes('editorial')) {
      setNewAlbumConcept('Studio Editorial');
    } else {
      setNewAlbumConcept('Pre-Wedding');
    }
    setCreateAlbumModalOpen(true);
  }, []);

  const handleCreateAlbumFromChunk = useCallback(async () => {
    if (!newAlbumTitle.trim()) {
      showToast('Vui lòng nhập tên bộ sưu tập.');
      return;
    }
    setCreatingAlbumFromChunk(true);
    try {
      // Lấy danh sách URL ảnh thuộc chunk hiện tại
      const activeCluster = aiJob?.chunksCreated?.find((c) => c.name === selectedChunkFilter);
      const currentList = (currentFolder ? folderImages : rootMedia).filter((m) => {
        const matchesText =
          m.chunkTitle === selectedChunkFilter ||
          m.chunkName === selectedChunkFilter ||
          m.chunkGroup === selectedChunkFilter ||
          m.aiContextChunk?.chunkName === selectedChunkFilter;
        const matchesCluster = activeCluster
          ? activeCluster.imageIds.includes(m.id) || activeCluster.imageIds.includes(m.url)
          : false;
        return matchesText || matchesCluster;
      });

      const chunkUrls = Array.from(new Set(currentList.map((m) => m.url)));
      if (chunkUrls.length === 0) {
        throw new Error('Không tìm thấy hình ảnh nào thuộc cụm Chunk này.');
      }

      const res = await fetch('/api/admin/albums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newAlbumTitle.trim(),
          concept: newAlbumConcept,
          mediaUrls: chunkUrls,
          coverImage: chunkUrls[0] || '',
          published: false,
          description: `Bộ sưu tập được khởi tạo tự động từ cụm Chunk AI: "${selectedChunkFilter}" (${chunkUrls.length} ảnh).`,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Lỗi khi tạo bộ sưu tập.');
      }
      setCreateAlbumModalOpen(false);
      showToast(`🎉 Đã tạo thành công bộ sưu tập nháp "${newAlbumTitle.trim()}" (${chunkUrls.length} ảnh)!`);
    } catch (err: any) {
      showToast(`Lỗi tạo album: ${err.message}`);
    } finally {
      setCreatingAlbumFromChunk(false);
    }
  }, [newAlbumTitle, newAlbumConcept, selectedChunkFilter, aiJob, currentFolder, folderImages, rootMedia, showToast]);

  // Listen to background batch import completion events
  useEffect(() => {
    const handleBackgroundImportComplete = (e: any) => {
      const detail = e?.detail;
      const folder = currentFolderRef.current;
      if (detail?.isFinal) {
        showToast(
          `Đã lưu ${detail.totalImages} ảnh vào kho thành công!`
        );
        fetchMedia(true);
        if (folder) {
          fetchFolderContent(folder.slug, true);
        }
        if (detail?.importedMediaIds && detail.importedMediaIds.length > 0) {
          triggerAiChunkJob(detail.importedMediaIds, folder?.id);
        }
      } else if (detail?.isPartial && detail?.folderName) {
        showToast(`Đã lưu ảnh thư mục: ${detail.folderName}`);
        fetchMedia(true);
        if (folder) {
          fetchFolderContent(folder.slug, true);
        }
      } else {
        showToast('Đồng bộ nền Google Drive hoàn tất!');
        fetchMedia(true);
        if (folder) {
          fetchFolderContent(folder.slug, true);
        }
      }
    };

    window.addEventListener('media-library-updated', handleBackgroundImportComplete);
    window.addEventListener('media-job-completed', handleBackgroundImportComplete);
    return () => {
      window.removeEventListener('media-library-updated', handleBackgroundImportComplete);
      window.removeEventListener('media-job-completed', handleBackgroundImportComplete);
    };
  }, [fetchMedia, fetchFolderContent, triggerAiChunkJob, showToast]);

  // Reset visibleCount whenever activeFolderKey, searchQuery, selectedFormat, selectedOrientation, or sortBy changes
  useEffect(() => {
    setVisibleCount(24);
  }, [activeFolderKey, searchQuery, selectedFormat, selectedOrientation, sortBy]);

  // Client-side fallback for dimensions & orientation
  const handleImageLoad = (url: string, naturalWidth: number, naturalHeight: number) => {
    if (!naturalWidth || !naturalHeight) return;
    setLoadedDimensions((prev) => {
      if (prev[url]) return prev;
      const orientation = naturalWidth > naturalHeight ? 'landscape' : naturalHeight > naturalWidth ? 'portrait' : 'square';
      return {
        ...prev,
        [url]: { width: naturalWidth, height: naturalHeight, orientation },
      };
    });
  };

  const getItemOrientation = useCallback((item: MediaItem) => {
    if (item.orientation) return item.orientation;
    if (item.width && item.height) {
      return item.width > item.height ? 'landscape' : item.height > item.width ? 'portrait' : 'square';
    }
    const loaded = loadedDimensions[item.url];
    if (loaded) return loaded.orientation;
    return undefined;
  }, [loadedDimensions]);

  // Infinite Scroll / Progressive Loading Intersection Observer
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((prev) => prev + 24);
        }
      },
      { rootMargin: '300px' }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, []);

  // Upload Files with Concurrency Queue (max 3 concurrent uploads)
  const uploadFilesWithQueue = useCallback(
    async (files: FileList | File[], targetFolderSlug?: string, targetFolderName?: string) => {
      const fileArray = Array.from(files).filter((file) =>
        file.type.startsWith('image/') || /\.(jpe?g|png|webp|avif|gif|svg)$/i.test(file.name)
      );

      if (fileArray.length === 0) {
        showToast('Vui lòng chọn các tệp hình ảnh hợp lệ (JPG, PNG, WebP, AVIF, GIF).');
        return;
      }

      // For batches of more than 2 files: offload to VPS server-side background job
      if (fileArray.length > 2) {
        showToast(`Đang chuyển ${fileArray.length} ảnh lên VPS để xử lý ngầm...`);
        const batchFormData = new FormData();
        fileArray.forEach((file) => {
          batchFormData.append('files', file);
        });
        if (targetFolderSlug) {
          batchFormData.append('folderSlug', targetFolderSlug);
        }
        if (targetFolderName) {
          batchFormData.append('folderName', targetFolderName);
        }

        try {
          const res = await fetch('/api/admin/media/upload-batch', {
            method: 'POST',
            body: batchFormData,
          });
          const data = await res.json();
          if (data.success) {
            showToast(`Đã tạo tiến trình ngầm trên VPS cho ${fileArray.length} ảnh. Bạn có thể tắt trình duyệt.`);
            window.dispatchEvent(new CustomEvent('media-job-started'));
            return;
          }
        } catch (err) {
          console.warn('Batch upload API fallback to sequential queue:', err);
        }
      }

      const newItems: UploadQueueItem[] = fileArray.map((f, i) => ({
        id: `${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
        name: f.name,
        size: f.size,
        formattedSize: formatBytes(f.size),
        folderSlug: targetFolderSlug,
        folderName: targetFolderName || (targetFolderSlug ? `Thư mục ${targetFolderSlug}` : 'Kho Media Gốc'),
        status: 'pending',
      }));

      setUploadQueue((prev) => [...prev, ...newItems]);
      setIsUploadDrawerOpen(true);
      showToast(`Bắt đầu tải lên ${fileArray.length} ảnh (tối đa 3 luồng đồng thời)...`);

      const CONCURRENCY = 3;
      let currentIndex = 0;
      const total = fileArray.length;

      const runWorker = async () => {
        while (currentIndex < total) {
          const fileIdx = currentIndex++;
          const file = fileArray[fileIdx];
          const queueItem = newItems[fileIdx];

          setUploadQueue((prev) =>
            prev.map((item) =>
              item.id === queueItem.id ? { ...item, status: 'uploading' } : item
            )
          );

          try {
            const formData = new FormData();
            formData.append('file', file);
            if (targetFolderSlug) {
              formData.append('folderSlug', targetFolderSlug);
            }

            const res = await fetch('/api/admin/media/upload', {
              method: 'POST',
              body: formData,
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
              throw new Error(data.error || 'Lỗi khi tải ảnh lên');
            }

            setUploadQueue((prev) =>
              prev.map((item) =>
                item.id === queueItem.id ? { ...item, status: 'completed' } : item
              )
            );

            const newMediaItem: MediaItem = {
              id: data.file?.id || data.id,
              filename: data.file?.url ? data.file.url.split('/').pop()! : data.url.split('/').pop()!,
              name: data.file?.name || data.name || file.name,
              url: data.file?.url || data.url,
              size: data.file?.size || file.size,
              formattedSize: formatBytes(data.file?.size || file.size),
              format: data.file?.format || 'WEBP',
              width: data.file?.width,
              height: data.file?.height,
              createdAt: data.file?.createdAt || new Date().toISOString(),
              modifiedAt: data.file?.updatedAt || data.file?.createdAt || new Date().toISOString(),
              uploadedById: currentUser?.id,
              uploaderName: 'Bạn',
            };

            setAllMedia((prev) => [newMediaItem, ...prev]);

            if (targetFolderSlug && currentFolder && targetFolderSlug === currentFolder.slug) {
              setFolderImages((prev) => [newMediaItem, ...prev]);
            } else if (!targetFolderSlug && !currentFolder) {
              setRootMedia((prev) => [newMediaItem, ...prev]);
            }

            if (targetFolderSlug) {
              setFolders((prev) =>
                prev.map((f) => {
                  if (f.slug === targetFolderSlug) {
                    const updatedCount = f.imageCount + 1;
                    const updatedBytes = f.totalBytes + (data.file?.size || file.size);
                    return {
                      ...f,
                      imageCount: updatedCount,
                      totalBytes: updatedBytes,
                      formattedSize: formatBytes(updatedBytes),
                      coverImage: f.coverImage || newMediaItem.url,
                    };
                  }
                  return f;
                })
              );
            }

            setStats((prev) =>
              prev
                ? {
                    ...prev,
                    totalFiles: prev.totalFiles + 1,
                    totalBytes: prev.totalBytes + (data.file?.size || file.size),
                    formattedTotalSize: formatBytes(prev.totalBytes + (data.file?.size || file.size)),
                  }
                : null
            );
          } catch (err: any) {
            setUploadQueue((prev) =>
              prev.map((item) =>
                item.id === queueItem.id
                  ? { ...item, status: 'error', errorMessage: err.message || 'Lỗi khi tải ảnh' }
                  : item
              )
            );
          }
        }
      };

      const workers = [];
      for (let i = 0; i < Math.min(CONCURRENCY, total); i++) {
        workers.push(runWorker());
      }
      await Promise.all(workers);

      showToast(`Đã hoàn tất xử lý ${total} tệp tải lên!`);
    },
    [currentUser, currentFolder]
  );

  // Drag-and-Drop Page Level Handlers
  const handlePageDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDraggingOverPage(true);
    }
  };

  const handlePageDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      setIsDraggingOverPage(false);
      dragCounter.current = 0;
    }
  };

  const handlePageDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handlePageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOverPage(false);
    dragCounter.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const targetSlug = currentFolder ? currentFolder.slug : undefined;
      const targetName = currentFolder ? currentFolder.name : 'Kho Media Gốc';
      uploadFilesWithQueue(e.dataTransfer.files, targetSlug, targetName);
    }
  };

  // Drag-and-Drop Individual Folder Card Handlers
  const handleFolderDragOver = (e: React.DragEvent, slug: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    if (dragOverFolderSlug !== slug) {
      setDragOverFolderSlug(slug);
    }
  };

  const handleFolderDragLeave = (e: React.DragEvent, slug: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragOverFolderSlug === slug) {
      setDragOverFolderSlug(null);
    }
  };

  const handleFolderDrop = (e: React.DragEvent, folder: FolderItem) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolderSlug(null);
    setIsDraggingOverPage(false);
    dragCounter.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFilesWithQueue(e.dataTransfer.files, folder.slug, folder.name);
    }
  };

  // Navigate into a folder
  const handleOpenFolder = (folder: FolderItem) => {
    setSelectedFileIds([]);
    setSelectedFolderIds([]);
    setCurrentFolder(folder);
    setSearchQuery('');
    fetchFolderContent(folder.slug || folder.id || folder.name);
  };

  // Navigate back to Root
  const handleBackToRoot = () => {
    setSelectedFileIds([]);
    setSelectedFolderIds([]);
    setCurrentFolder(null);
    setFolderImages([]);
    setSearchQuery('');
    fetchMedia();
  };

  // Toggle selection for single image
  const toggleSelectImage = (idOrUrl: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedFileIds((prev) =>
      prev.includes(idOrUrl) ? prev.filter((id) => id !== idOrUrl) : [...prev, idOrUrl]
    );
  };

  // Select all or deselect all visible images
  const handleSelectAllVisible = () => {
    if (selectedFileIds.length === filteredAndSortedMedia.length && filteredAndSortedMedia.length > 0) {
      setSelectedFileIds([]);
    } else {
      setSelectedFileIds(filteredAndSortedMedia.map((m) => m.id || m.url));
    }
  };

  // Clear selection
  const handleClearSelection = () => {
    setSelectedFileIds([]);
  };

  // Bulk move selected images to another folder or root
  const handleBulkMove = async () => {
    if (selectedFileIds.length === 0) return;
    setMovingFiles(true);
    try {
      const res = await fetch('/api/admin/media/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileIds: selectedFileIds,
          targetFolderId: targetFolderForMove,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Lỗi khi di chuyển ảnh.');
      }
      showToast(data.message || `Đã di chuyển ${data.movedCount} ảnh thành công!`);
      setIsMoveModalOpen(false);
      setSelectedFileIds([]);
      if (currentFolder) {
        fetchFolderContent(currentFolder.slug);
      }
      fetchMedia();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi di chuyển ảnh.');
    } finally {
      setMovingFiles(false);
    }
  };

  // Bulk delete selected images
  const handleBulkDelete = async () => {
    if (selectedFileIds.length === 0) return;
    setBulkDeleting(true);
    try {
      const res = await fetch('/api/admin/media/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileIds: selectedFileIds,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Lỗi khi xóa tệp ảnh.');
      }
      showToast(data.message || `Đã xóa vĩnh viễn ${data.deletedCount} ảnh!`);
      setIsBulkDeleteModalOpen(false);
      setSelectedFileIds([]);
      if (currentFolder) {
        fetchFolderContent(currentFolder.slug);
      }
      fetchMedia();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa tệp ảnh.');
    } finally {
      setBulkDeleting(false);
    }
  };

  // Download single file directly
  const handleDownloadSingle = (url: string, filename: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const downloadUrl = `/api/admin/media/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename || 'media')}`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`Đang tải xuống: ${filename || 'tệp media'}`);
    } catch (err: any) {
      showToast('Lỗi khi tải xuống tệp');
    }
  };

  // Download batch selected files as ZIP
  const handleDownloadBatch = async (selectedIds: string[]) => {
    if (!selectedIds || selectedIds.length === 0) return;
    setDownloadingBatch(true);
    try {
      showToast(`Đang nén ${selectedIds.length} tệp thành file ZIP...`);
      const res = await fetch('/api/admin/media/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, asZip: true }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Không thể tạo file nén để tải xuống.');
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      const today = new Date().toISOString().slice(0, 10);
      link.download = `plusmoments-media-${today}.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      showToast(`Đã tải xuống thành công ${selectedIds.length} tệp (.ZIP)!`);
    } catch (err: any) {
      showToast(err.message || 'Có lỗi khi tải xuống tệp');
    } finally {
      setDownloadingBatch(false);
    }
  };

  // Download entire folder as ZIP
  const handleDownloadFolder = async (folderIdOrSlug: string, folderName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!folderIdOrSlug) return;
    setDownloadingFolderId(folderIdOrSlug);
    try {
      showToast(`Đang chuẩn bị nén toàn bộ thư mục "${folderName}"...`);
      const res = await fetch(`/api/admin/media/folder-download?folderId=${encodeURIComponent(folderIdOrSlug)}`);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Không thể tạo file nén thư mục.');
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      const safeName = (folderName || 'thu-muc-anh').trim().replace(/[\\/:*?"<>|]/g, '_');
      link.download = `${safeName}.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      showToast(`Đã tải xuống thành công thư mục "${folderName}" (.ZIP)!`);
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi tải thư mục');
    } finally {
      setDownloadingFolderId(null);
    }
  };

  // Copy to clipboard
  const handleCopyUrl = async (url: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      showToast(`Đã sao chép: ${url}`);
      setTimeout(() => setCopiedUrl(null), 2500);
    } catch {
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopiedUrl(url);
      showToast(`Đã sao chép: ${url}`);
      setTimeout(() => setCopiedUrl(null), 2500);
    }
  };

  // Delete single media item
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      // Call dedicated file delete endpoint by ID or fallback by URL
      const deleteEndpoint =
        deleteTarget.id && !deleteTarget.id.startsWith('/uploads/')
          ? `/api/admin/media/files/${encodeURIComponent(deleteTarget.id)}`
          : `/api/admin/media?url=${encodeURIComponent(deleteTarget.url)}`;

      const res = await fetch(deleteEndpoint, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Lỗi khi xóa tệp media.');
      }

      showToast(`Đã xóa vĩnh viễn tệp "${deleteTarget.filename}" khỏi máy chủ!`);
      setDeleteTarget(null);

      if (currentFolder) {
        fetchFolderContent(currentFolder.slug);
      }
      fetchMedia();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa tệp.');
    } finally {
      setDeleting(false);
    }
  };

  // Deduplicate Media Files
  const handleDeduplicate = async () => {
    if (
      !confirm(
        'Hệ thống sẽ quét đối chiếu toàn bộ tệp Media bằng fingerprint (Google Drive ID & MD5 Checksum) để tự động loại bỏ các bản ghi trùng lặp và giải phóng dung lượng VPS. Bạn có muốn tiếp tục?'
      )
    ) {
      return;
    }

    try {
      setIsDeduplicating(true);
      const res = await fetch('/api/admin/media/deduplicate', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        if (currentFolder) {
          fetchFolderContent(currentFolder.slug);
        }
        fetchMedia();
      } else {
        alert(data.error || 'Lỗi khi dọn dẹp ảnh trùng lặp.');
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi kết nối máy chủ.');
    } finally {
      setIsDeduplicating(false);
    }
  };

  // Create Folder
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    setCreatingFolder(true);
    try {
      const res = await fetch('/api/admin/media/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFolderName.trim() }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Lỗi tạo thư mục.');
      }

      showToast(`Đã tạo thư mục "${newFolderName.trim()}" thành công!`);
      setIsCreateFolderOpen(false);
      setNewFolderName('');
      fetchMedia();
    } catch (err: any) {
      alert(err.message || 'Lỗi tạo thư mục.');
    } finally {
      setCreatingFolder(false);
    }
  };

  // Rename Folder
  const handleRenameFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameTargetFolder || !renameFolderName.trim()) return;

    setRenamingFolder(true);
    try {
      const res = await fetch(`/api/admin/media/folders/${renameTargetFolder.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: renameFolderName.trim() }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Lỗi đổi tên thư mục.');
      }

      showToast(`Đã đổi tên thư mục thành "${renameFolderName.trim()}"!`);
      if (currentFolder && currentFolder.slug === renameTargetFolder.slug) {
        setCurrentFolder({ ...currentFolder, name: renameFolderName.trim() });
      }
      setRenameTargetFolder(null);
      setRenameFolderName('');
      fetchMedia();
    } catch (err: any) {
      alert(err.message || 'Lỗi đổi tên thư mục.');
    } finally {
      setRenamingFolder(false);
    }
  };

  // Delete Folder
  const handleDeleteFolder = async () => {
    if (!deleteTargetFolder) return;

    setDeletingFolder(true);
    try {
      const res = await fetch(`/api/admin/media/folders/${deleteTargetFolder.slug}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Lỗi khi xóa thư mục.');
      }

      showToast(`Đã xóa vĩnh viễn thư mục "${deleteTargetFolder.name}" và toàn bộ ảnh!`);
      setDeleteTargetFolder(null);

      if (currentFolder && currentFolder.slug === deleteTargetFolder.slug) {
        handleBackToRoot();
      } else {
        fetchMedia();
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi xóa thư mục.');
    } finally {
      setDeletingFolder(false);
    }
  };

  // Filtered & Sorted Images (either current folder images or root media)
  const displayImages = currentFolder ? folderImages : rootMedia;

  // Base filtered images before orientation filter (to count all / landscape / portrait)
  const baseFilteredMedia = useMemo(() => {
    let result = [...displayImages];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.filename.toLowerCase().includes(q) ||
          m.name.toLowerCase().includes(q) ||
          m.url.toLowerCase().includes(q)
      );
    }

    if (selectedFormat !== 'ALL') {
      result = result.filter((m) => m.format === selectedFormat);
    }

    return result;
  }, [displayImages, searchQuery, selectedFormat]);

  // Compute orientation counts based on baseFilteredMedia
  const orientationCounts = useMemo(() => {
    let landscape = 0;
    let portrait = 0;
    for (const m of baseFilteredMedia) {
      const ori = getItemOrientation(m);
      if (ori === 'landscape') landscape++;
      else if (ori === 'portrait') portrait++;
    }
    return {
      all: baseFilteredMedia.length,
      landscape,
      portrait,
    };
  }, [baseFilteredMedia, getItemOrientation]);

  // Compute Chunk status counts (All / Chunked / Not Chunked)
  const chunkCounts = useMemo(() => {
    let chunked = 0;
    let notChunked = 0;
    for (const m of displayImages) {
      const isDone = m.chunkStatus === 'CHUNKED' || Boolean(m.chunkTitle) || m.aiStatus === 'DONE';
      if (isDone) {
        chunked++;
      } else {
        notChunked++;
      }
    }
    return {
      all: displayImages.length,
      chunked,
      notChunked,
    };
  }, [displayImages]);

  const handleBulkConvertChunks = useCallback(async () => {
    const unchunkedItems = displayImages
      .filter((m) => m.chunkStatus !== 'CHUNKED' && !m.chunkTitle && m.aiStatus !== 'DONE')
      .map((m) => ({ id: m.id, url: m.url, filename: m.filename, name: m.name }));

    if (unchunkedItems.length === 0) {
      showToast('Tất cả ảnh trong thư mục này đã được phân loại Chunks rồi.');
      return;
    }

    setIsStartingAi(true);
    showToast(`Đang khởi tạo tiến trình AI cho ${unchunkedItems.length} ảnh...`);

    try {
      const folderParam = currentFolder?.id || currentFolder?.slug;
      const res = await fetch('/api/admin/media/ai-chunk-jobs/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folderId: folderParam,
          folderSlug: currentFolder?.slug,
          items: unchunkedItems,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(`Lỗi: ${data.message || data.error || 'Không thể khởi chạy Job AI.'}`);
        return;
      }

      if (data.job) {
        setAiJob(data.job);
        setIsAiDrawerExpanded(true);
        prevJobProgressRef.current = { processed: data.job.processed, status: data.job.status };
        showToast(`🚀 Đã khởi chạy tiến trình phân loại Chunks cho ${data.job.total} ảnh.`);
        onRefreshMediaList();
      }
    } catch (err: any) {
      showToast(`Không thể khởi chạy AI: ${err.message}`);
    } finally {
      setIsStartingAi(false);
    }
  }, [displayImages, currentFolder, showToast, onRefreshMediaList]);

  const filteredAndSortedMedia = useMemo(() => {
    let result = [...baseFilteredMedia];

    // Chunk status filter (ALL | CHUNKED | NOT_CHUNKED)
    if (chunkStatusFilter === 'CHUNKED') {
      result = result.filter((m) => m.chunkStatus === 'CHUNKED' || Boolean(m.chunkTitle) || m.aiStatus === 'DONE');
    } else if (chunkStatusFilter === 'NOT_CHUNKED') {
      result = result.filter((m) => m.chunkStatus !== 'CHUNKED' && !m.chunkTitle && m.aiStatus !== 'DONE');
    }

    // Chunk grouping filter (kết hợp đối soát cả tên chunk lẫn imageIds của cluster)
    if (selectedChunkFilter !== 'ALL') {
      const activeCluster = aiJob?.chunksCreated?.find((c) => c.name === selectedChunkFilter);
      result = result.filter((m) => {
        const matchesText =
          m.chunkTitle === selectedChunkFilter ||
          m.chunkName === selectedChunkFilter ||
          m.chunkGroup === selectedChunkFilter ||
          m.aiContextChunk?.chunkName === selectedChunkFilter;

        const matchesCluster = activeCluster
          ? activeCluster.imageIds.includes(m.id) || activeCluster.imageIds.includes(m.url)
          : false;

        return matchesText || matchesCluster;
      });
    }

    // Orientation filter
    if (selectedOrientation !== 'all') {
      result = result.filter((m) => getItemOrientation(m) === selectedOrientation);
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime();
        case 'oldest':
          return new Date(a.modifiedAt).getTime() - new Date(b.modifiedAt).getTime();
        case 'size_desc':
          return b.size - a.size;
        case 'size_asc':
          return a.size - b.size;
        case 'name_asc':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return result;
  }, [baseFilteredMedia, chunkStatusFilter, selectedChunkFilter, aiJob, selectedOrientation, sortBy, getItemOrientation]);

  // Progressive rendering slice for high performance with 764+ images
  const visibleMedia = useMemo(() => {
    return filteredAndSortedMedia.slice(0, visibleCount);
  }, [filteredAndSortedMedia, visibleCount]);

  // Selected Media Statistics
  const selectedStats = useMemo(() => {
    const selectedMedia = displayImages.filter((m) =>
      selectedFileIds.includes(m.id) || selectedFileIds.includes(m.url)
    );
    const totalBytes = selectedMedia.reduce((sum, m) => sum + m.size, 0);
    return {
      count: selectedFileIds.length,
      totalBytes,
      formattedSize: formatBytes(totalBytes),
    };
  }, [selectedFileIds, displayImages]);

  // Album and Invitation Folder Counts
  const albumFoldersCount = useMemo(
    () =>
      folders.filter(
        (f) =>
          !f.isInvitation &&
          !f.slug.startsWith('invitation-') &&
          !f.path.includes('/invitations/')
      ).length,
    [folders]
  );

  const invitationFoldersCount = useMemo(
    () =>
      folders.filter(
        (f) =>
          f.isInvitation ||
          f.slug.startsWith('invitation-') ||
          f.path.includes('/invitations/')
      ).length,
    [folders]
  );

  // Filtered Folders list
  const filteredFolders = useMemo(() => {
    let list = folders;
    if (folderFilterCategory === 'ALBUMS') {
      list = list.filter(
        (f) =>
          !f.isInvitation &&
          !f.slug.startsWith('invitation-') &&
          !f.path.includes('/invitations/')
      );
    } else if (folderFilterCategory === 'INVITATIONS') {
      list = list.filter(
        (f) =>
          f.isInvitation ||
          f.slug.startsWith('invitation-') ||
          f.path.includes('/invitations/')
      );
    }

    if (!searchQuery.trim() || currentFolder) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter((f) => f.name.toLowerCase().includes(q) || f.slug.includes(q));
  }, [folders, searchQuery, currentFolder, folderFilterCategory]);

  // Folder Selection Helpers
  const toggleSelectFolder = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedFolderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const allFolderIds = useMemo(
    () => filteredFolders.map((f) => f.id || f.slug),
    [filteredFolders]
  );

  const isAllFoldersSelected =
    allFolderIds.length > 0 &&
    allFolderIds.every((id) => selectedFolderIds.includes(id));

  const handleSelectAllFolders = () => {
    if (isAllFoldersSelected) {
      setSelectedFolderIds([]);
    } else {
      setSelectedFolderIds(allFolderIds);
    }
  };

  const emptyFolders = useMemo(
    () => filteredFolders.filter((f) => f.imageCount === 0),
    [filteredFolders]
  );

  const handleSelectEmptyFolders = () => {
    const emptyIds = emptyFolders.map((f) => f.id || f.slug);
    setSelectedFolderIds((prev) => Array.from(new Set([...prev, ...emptyIds])));
    showToast(`Đã chọn ${emptyIds.length} thư mục trống.`);
  };

  const handleBulkDeleteFolders = async () => {
    if (selectedFolderIds.length === 0) return;

    setBulkDeletingFolders(true);
    try {
      const res = await fetch('/api/admin/media/folders', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedFolderIds }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Lỗi khi xóa hàng loạt thư mục.');
      }

      showToast(`Đã xóa thành công ${selectedFolderIds.length} thư mục đã chọn!`);
      setSelectedFolderIds([]);
      setIsBulkDeleteFoldersModalOpen(false);
      fetchMedia();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa hàng loạt thư mục.');
    } finally {
      setBulkDeletingFolders(false);
    }
  };

  // Unique formats
  const availableFormats = useMemo(() => {
    const set = new Set<string>();
    allMedia.forEach((m) => set.add(m.format));
    return Array.from(set);
  }, [allMedia]);

  return (
    <div
      onDragEnter={handlePageDragEnter}
      onDragLeave={handlePageDragLeave}
      onDragOver={handlePageDragOver}
      onDrop={handlePageDrop}
      className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto relative min-h-screen"
    >
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-charcoal-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-luxury-500/30 animate-fade-in text-xs font-medium">
          <FileCheck2 className="w-4 h-4 text-luxury-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-luxury-700 font-semibold mb-1">
            <FolderArchive className="w-4 h-4" />
            <span>Hệ Thống Quản Lý Tài Nguyên Số</span>
          </div>
          <h1 className="text-2xl font-serif font-light text-charcoal-900">
            Kho Lưu Trữ Media & Quản Lý Thư Mục
          </h1>
          <p className="text-xs text-charcoal-500 font-light mt-1">
            Quản lý tập trung toàn bộ album và hình ảnh WebP theo thư mục. Hỗ trợ kéo thả tải nhiều ảnh trực tiếp và đồng bộ Google Drive.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (currentFolder) fetchFolderContent(currentFolder.slug);
              fetchMedia();
            }}
            disabled={loading || folderLoading}
            className="p-2.5 bg-white border border-stone-300 hover:bg-stone-50 text-charcoal-700 rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
            title="Làm mới danh sách"
          >
            <RefreshCw
              className={`w-4 h-4 ${loading || folderLoading ? 'animate-spin text-luxury-600' : ''}`}
            />
          </button>

          <button
            type="button"
            onClick={() => setIsCollageModalOpen(true)}
            className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/90 rounded-xl text-xs uppercase tracking-wider font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            title="Mở Studio Ghép Ảnh Tạp Chí 16:9"
          >
            <LayoutGrid className="w-4 h-4 text-amber-600" />
            <span>Ghép Ảnh 16:9</span>
          </button>

          <button
            type="button"
            onClick={handleDeduplicate}
            disabled={isDeduplicating || loading}
            className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/90 rounded-xl text-xs uppercase tracking-wider font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            title="Quét fingerprint và checksum để loại bỏ ảnh trùng lặp"
          >
            {isDeduplicating ? (
              <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
            ) : (
              <Sparkles className="w-4 h-4 text-amber-600" />
            )}
            <span>{isDeduplicating ? 'Đang Quét Dọn...' : 'Dọn Dẹp Trùng Lặp'}</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 bg-luxury-100 hover:bg-luxury-200 text-luxury-900 border border-luxury-300/80 rounded-xl text-xs uppercase tracking-wider font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            title="Tải ảnh lên từ máy tính"
          >
            <Upload className="w-4 h-4 text-luxury-700" />
            <span>Tải Ảnh Lên</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setNewFolderName('');
              setIsCreateFolderOpen(true);
            }}
            className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-charcoal-800 border border-stone-300 rounded-xl text-xs uppercase tracking-wider font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <FolderPlus className="w-4 h-4 text-amber-600" />
            <span>Tạo Thư Mục Mới</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDrivePickerOpen(true)}
            className="px-5 py-2.5 bg-luxury-900 hover:bg-black active:scale-95 text-white rounded-xl text-xs uppercase tracking-wider font-semibold flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <HardDrive className="w-4 h-4 text-luxury-400" />
            <span>Import Từ Google Drive</span>
          </button>
        </div>
      </div>

      {/* ERROR BANNER */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* BREADCRUMB NAVIGATION */}
      <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={handleBackToRoot}
            className={`flex items-center gap-1.5 font-medium transition-colors cursor-pointer ${
              !currentFolder
                ? 'text-luxury-800 font-semibold'
                : 'text-stone-500 hover:text-charcoal-900'
            }`}
          >
            <FolderArchive className="w-4 h-4 text-luxury-600" />
            <span>Kho Media Gốc</span>
          </button>

          {currentFolder && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-stone-300 shrink-0" />
              {(currentFolder.isInvitation ||
                currentFolder.slug.startsWith('invitation-') ||
                currentFolder.path.includes('/invitations/')) && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentFolder(null);
                      setFolderFilterCategory('INVITATIONS');
                    }}
                    className="flex items-center gap-1 text-rose-700 hover:underline font-medium cursor-pointer"
                  >
                    <span>💌 Thiệp Cưới Online</span>
                  </button>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                </>
              )}
              <div className="flex items-center gap-1.5 text-charcoal-900 font-semibold bg-stone-100 px-3 py-1 rounded-lg">
                <Folder className="w-3.5 h-3.5 fill-amber-400 text-amber-600" />
                <span className="truncate max-w-[200px] sm:max-w-md">{currentFolder.name}</span>
                <span className="text-[10px] text-stone-400 font-mono ml-1">
                  ({folderImages.length} ảnh - {currentFolder.formattedSize})
                </span>
              </div>
            </>
          )}
        </div>

        {currentFolder && (
          <button
            type="button"
            onClick={handleBackToRoot}
            className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-charcoal-700 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại tất cả thư mục</span>
          </button>
        )}
      </div>

      {/* ROOT LEVEL VIEW: STATS & FOLDERS GRID & ROOT IMAGES */}
      {!currentFolder && (
        <>
          {/* STATS OVERVIEW CARDS */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-charcoal-400 font-medium">
                    Thư Mục Album Media
                  </span>
                  <p className="text-2xl font-serif font-semibold text-charcoal-900 mt-0.5">
                    {folders.length}
                  </p>
                  <span className="text-[11px] text-stone-400">
                    Gom nhóm theo từng buổi chụp / dâu rể
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Folder className="w-6 h-6 fill-amber-300" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-charcoal-400 font-medium">
                    Tổng Số Ảnh Trên Server
                  </span>
                  <p className="text-2xl font-serif font-semibold text-luxury-800 mt-0.5">
                    {stats.totalFiles}
                  </p>
                  <span className="text-[11px] text-stone-400">
                    Ảnh nén chuẩn WebP chất lượng cao
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-luxury-50 text-luxury-700 flex items-center justify-center shrink-0">
                  <ImageIcon className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-charcoal-400 font-medium">
                    Dung Lượng Bộ Nhớ VPS
                  </span>
                  <p className="text-2xl font-serif font-semibold text-charcoal-900 mt-0.5">
                    {stats.formattedTotalSize}
                  </p>
                  <span className="text-[11px] text-emerald-600 font-medium">
                    ✓ Đã tối ưu hóa ~80% dung lượng
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <HardDrive className="w-6 h-6" />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 1: FOLDERS GRID */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
              <div>
                <h2 className="font-serif text-lg sm:text-xl font-light text-charcoal-900 flex items-center gap-2">
                  <Folder className="w-5 h-5 fill-amber-400 text-amber-600" />
                  <span>
                    {folderFilterCategory === 'INVITATIONS'
                      ? `Thư Mục Thiệp Cưới Online (${filteredFolders.length})`
                      : folderFilterCategory === 'ALBUMS'
                      ? `Thư Mục Album Cưới (${filteredFolders.length})`
                      : `Danh Sách Tất Cả Thư Mục (${filteredFolders.length})`}
                  </span>
                </h2>
                <p className="text-xs text-charcoal-500 font-light mt-0.5">
                  Quản lý phân cấp thư mục ảnh Album và toàn bộ thư mục thiệp cưới của khách hàng.
                </p>

                {/* FOLDER CATEGORY FILTER TABS */}
                <div className="flex flex-wrap items-center gap-1.5 pt-3">
                  <button
                    type="button"
                    onClick={() => setFolderFilterCategory('ALL')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      folderFilterCategory === 'ALL'
                        ? 'bg-[#1C1917] text-white shadow-xs font-semibold'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                  >
                    Tất Cả Thư Mục ({folders.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFolderFilterCategory('ALBUMS')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                      folderFilterCategory === 'ALBUMS'
                        ? 'bg-amber-800 text-white shadow-xs font-semibold'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                  >
                    <Folder className="w-3.5 h-3.5 fill-amber-300" />
                    <span>Album Ảnh ({albumFoldersCount})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFolderFilterCategory('INVITATIONS')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                      folderFilterCategory === 'INVITATIONS'
                        ? 'bg-rose-700 text-white shadow-xs font-semibold'
                        : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200/60'
                    }`}
                  >
                    <span>💌 Thiệp Cưới Online ({invitationFoldersCount})</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    setNewFolderName('');
                    setIsCreateFolderOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-luxury-100 hover:bg-luxury-200 text-luxury-800 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>+ Thêm Thư Mục Mới</span>
                </button>
              </div>
            </div>

            {/* BULK ACTION BAR FOR FOLDERS */}
            {filteredFolders.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-stone-50/80 border border-stone-200/80 rounded-2xl text-xs">
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer select-none font-medium text-charcoal-700 hover:text-charcoal-900">
                    <input
                      type="checkbox"
                      checked={isAllFoldersSelected}
                      onChange={handleSelectAllFolders}
                      className="w-4 h-4 rounded border-stone-300 text-luxury-600 focus:ring-luxury-500 cursor-pointer accent-[#C5A880]"
                    />
                    <span>Chọn tất cả ({filteredFolders.length})</span>
                  </label>

                  {emptyFolders.length > 0 && (
                    <button
                      type="button"
                      onClick={handleSelectEmptyFolders}
                      className="px-2.5 py-1 rounded-lg bg-amber-100/80 hover:bg-amber-200 text-amber-800 text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1"
                      title="Tự động chọn tất cả các thư mục không có ảnh"
                    >
                      <Folder className="w-3.5 h-3.5 fill-amber-300 text-amber-600" />
                      <span>Chọn thư mục trống ({emptyFolders.length})</span>
                    </button>
                  )}

                  {selectedFolderIds.length > 0 && (
                    <span className="text-[11px] text-stone-500 font-mono">
                      Đã chọn: <strong className="text-charcoal-900 font-semibold">{selectedFolderIds.length}</strong> thư mục
                    </span>
                  )}
                </div>

                {selectedFolderIds.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedFolderIds([])}
                      className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 text-stone-600 text-xs font-medium transition-colors cursor-pointer"
                    >
                      Bỏ chọn
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsBulkDeleteFoldersModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa {selectedFolderIds.length} thư mục đã chọn</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {filteredFolders.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-stone-200 rounded-2xl p-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
                  <Folder className="w-6 h-6 fill-amber-300" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif text-base font-light text-charcoal-900">
                    Chưa có thư mục album nào
                  </h4>
                  <p className="text-xs text-stone-500 max-w-md mx-auto">
                    Bạn có thể tạo thư mục thủ công hoặc mở Drive Picker để "Import Nguyên Thư Mục" từ Google Drive vào hệ thống.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewFolderName('');
                      setIsCreateFolderOpen(true);
                    }}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-charcoal-800 text-xs font-medium rounded-xl transition-colors cursor-pointer"
                  >
                    + Tạo Thư Mục Mới
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDrivePickerOpen(true)}
                    className="px-4 py-2 bg-luxury-900 hover:bg-black text-white text-xs font-medium rounded-xl transition-colors cursor-pointer shadow-xs"
                  >
                    📁 Import Từ Google Drive
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredFolders.map((f) => {
                  const folderKey = f.id || f.slug;
                  const isSelected = selectedFolderIds.includes(folderKey);
                  const isDragTarget = dragOverFolderSlug === f.slug;

                  return (
                    <div
                      key={f.slug}
                      onClick={() => handleOpenFolder(f)}
                      onDragOver={(e) => handleFolderDragOver(e, f.slug)}
                      onDragLeave={(e) => handleFolderDragLeave(e, f.slug)}
                      onDrop={(e) => handleFolderDrop(e, f)}
                      className={`group rounded-2xl border transition-all duration-300 p-4 cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden ${
                        isDragTarget
                          ? 'border-[#B8860B] ring-4 ring-[#B8860B]/40 bg-amber-50/70 scale-[1.02] shadow-xl'
                          : isSelected
                          ? 'border-[#C5A880] ring-2 ring-[#C5A880]/30 shadow-md bg-amber-50/15'
                          : 'border-stone-200 bg-white hover:border-luxury-400 hover:shadow-lg'
                      }`}
                    >
                      {/* Drag target overlay badge */}
                      {isDragTarget && (
                        <div className="absolute inset-0 z-30 bg-amber-950/20 backdrop-blur-xs border-2 border-dashed border-[#B8860B] rounded-2xl flex flex-col items-center justify-center p-3 text-center pointer-events-none">
                          <Upload className="w-8 h-8 text-[#B8860B] animate-bounce mb-1" />
                          <span className="text-xs font-semibold text-charcoal-900 bg-white/95 px-3 py-1 rounded-xl shadow-md border border-amber-300">
                            Thả vào "{f.name}"
                          </span>
                        </div>
                      )}

                      {/* Selection Checkbox with stopPropagation */}
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectFolder(folderKey, e);
                        }}
                        className="absolute top-2.5 left-2.5 z-10 p-1 rounded-lg bg-white/85 hover:bg-white backdrop-blur-xs shadow-xs transition-colors cursor-pointer"
                        title={isSelected ? 'Bỏ chọn thư mục' : 'Chọn thư mục'}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 rounded border-stone-300 text-luxury-600 focus:ring-luxury-500 cursor-pointer accent-[#C5A880]"
                        />
                      </div>

                      {/* Cover Photo / Thumbnail Box */}
                    <div className="relative w-full h-32 rounded-xl overflow-hidden bg-stone-100 border border-stone-200/80 flex items-center justify-center">
                      {f.coverImage ? (
                        <img
                          src={getThumbnailUrl(f.coverImage)}
                          alt={f.name}
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            if (f.coverImage && e.currentTarget.src !== f.coverImage) {
                              e.currentTarget.src = f.coverImage;
                            }
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="text-stone-300 flex flex-col items-center gap-1">
                          <Folder className="w-10 h-10 fill-amber-100 text-amber-400" />
                          <span className="text-[10px] text-stone-400 font-mono">Thư mục trống</span>
                        </div>
                      )}

                      {/* Invitation Badge */}
                      {(f.isInvitation ||
                        f.slug.startsWith('invitation-') ||
                        f.path.includes('/invitations/')) && (
                        <div className="absolute top-2 left-10 z-10 px-2 py-0.5 rounded-full bg-rose-900/85 backdrop-blur-xs text-white text-[9px] font-semibold tracking-wider flex items-center gap-1 shadow-xs">
                          <span>💌 Thiệp Cưới</span>
                        </div>
                      )}

                      {/* Floating Badge */}
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono">
                        {f.imageCount} ảnh
                      </div>
                    </div>

                    {/* Folder Info */}
                    <div className="space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-serif text-sm font-semibold text-charcoal-900 group-hover:text-luxury-800 transition-colors line-clamp-1">
                          {f.name}
                        </h3>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono">
                        <span>{f.formattedSize}</span>
                        <span className="text-[10px] text-stone-400">{f.slug}</span>
                      </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                      <span className="text-[11px] text-luxury-700 font-medium group-hover:underline flex items-center gap-1">
                        <span>Xem thư mục</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>

                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        {/* Nút Tải Toàn Bộ Thư Mục */}
                        <button
                          type="button"
                          onClick={(e) => handleDownloadFolder(f.id || f.slug, f.name || f.slug, e)}
                          disabled={downloadingFolderId === (f.id || f.slug)}
                          className="p-1.5 text-stone-400 hover:text-luxury-700 hover:bg-luxury-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                          title="Tải toàn bộ ảnh trong thư mục này (.ZIP)"
                        >
                          {downloadingFolderId === (f.id || f.slug) ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-luxury-600" />
                          ) : (
                            <Download className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {currentUser?.role !== 'USER' && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setRenameTargetFolder(f);
                                setRenameFolderName(f.name);
                              }}
                              className="p-1.5 text-stone-400 hover:text-luxury-700 hover:bg-luxury-50 rounded-lg transition-colors cursor-pointer"
                              title="Đổi tên thư mục"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteTargetFolder(f);
                              }}
                              className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Xóa toàn bộ thư mục"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
            )}
          </div>
        </>
      )}

      {/* SECTION 2: IMAGES GRID (Inside Folder or Root Images) */}
      {!currentFolder && !isRootMediaExpanded ? (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-5 sm:p-6 transition-all hover:border-luxury-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-50/70 border border-amber-200/60 flex items-center justify-center text-luxury-700 shadow-2xs shrink-0">
                <FolderArchive className="w-5 h-5 text-[#B8860B]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-base sm:text-lg font-medium text-charcoal-900">
                    Ảnh Ngoài Thư Mục Gốc (Root Media)
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-charcoal-700 text-xs font-mono font-medium">
                    {rootMedia.length} tệp
                  </span>
                </div>
                <p className="text-xs text-charcoal-500 font-light mt-0.5">
                  Tệp tài nguyên dùng chung & ảnh tải lên ngoài thư mục
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsRootMediaExpanded(true)}
              className="px-4 py-2 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-charcoal-800 text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs hover:shadow-xs self-start sm:self-auto"
            >
              <span>Hiển thị danh sách</span>
              <ChevronDown className="w-4 h-4 text-stone-500" />
            </button>
          </div>
        </div>
      ) : (
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
          <div>
            <h2 className="font-serif text-lg sm:text-xl font-light text-charcoal-900 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-luxury-600" />
              <span>
                {currentFolder
                  ? `Ảnh Trong Thư Mục "${currentFolder.name}"`
                  : 'Ảnh Ngoài Thư Mục Gốc (Root Media)'}
              </span>
              <span className="text-xs font-mono text-stone-400">
                ({filteredAndSortedMedia.length} ảnh)
              </span>
            </h2>
            <p className="text-xs text-charcoal-500 font-light mt-0.5">
              {currentFolder
                ? 'Toàn bộ hình ảnh WebP thuộc riêng thư mục này trên máy chủ VPS.'
                : 'Tệp tài nguyên dùng chung & ảnh tải lên ngoài thư mục'}
            </p>
          </div>

          {currentFolder ? (
            <div className="flex items-center gap-2">
              {currentUser?.role !== 'USER' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setRenameTargetFolder(currentFolder);
                      setRenameFolderName(currentFolder.name);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs text-charcoal-700 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-luxury-600" />
                    <span>Đổi Tên</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteTargetFolder(currentFolder)}
                    className="px-3 py-1.5 rounded-xl border border-red-200 hover:bg-red-50 text-xs text-red-600 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa Thư Mục</span>
                  </button>
                </>
              )}

              <button
                type="button"
                disabled={downloadingFolderId === (currentFolder.id || currentFolder.slug)}
                onClick={(e) => handleDownloadFolder(currentFolder.id || currentFolder.slug, currentFolder.name, e)}
                className="px-3.5 py-1.5 rounded-xl border border-luxury-300 bg-luxury-50 hover:bg-luxury-100 text-xs text-luxury-900 font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
                title="Tải toàn bộ ảnh trong thư mục này dưới dạng .ZIP"
              >
                {downloadingFolderId === (currentFolder.id || currentFolder.slug) ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-luxury-700" />
                    <span>Đang Nén...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 text-luxury-700" />
                    <span>Tải Thư Mục (.ZIP)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsDrivePickerOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-luxury-900 hover:bg-black text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <HardDrive className="w-3.5 h-3.5 text-luxury-400" />
                <span>Thêm Ảnh Từ Drive</span>
              </button>

              <button
                type="button"
                onClick={handleBulkConvertChunks}
                disabled={isStartingAi || chunkCounts.notChunked === 0}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-700 to-yellow-600 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                title="Quét toàn bộ ảnh chưa tạo chunk trong thư mục để AI đọc ngữ cảnh và gom cụm Chunks"
              >
                {isStartingAi || aiJob?.status === 'RUNNING' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>AI Đang Tạo Chunks ({aiJob?.processed || 0}/{aiJob?.total || chunkCounts.notChunked})...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                    <span>Convert Chunks Chưa Xử Lý ({chunkCounts.notChunked})</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsRootMediaExpanded(false)}
              className="px-3.5 py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-charcoal-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs self-start sm:self-auto"
              title="Thu gọn danh sách ảnh gốc"
            >
              <span>Thu Gọn</span>
              <ChevronUp className="w-4 h-4 text-stone-500" />
            </button>
          )}
        </div>

        {/* DRAG-AND-DROP UPLOAD ZONE */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              const targetSlug = currentFolder ? currentFolder.slug : undefined;
              const targetName = currentFolder ? currentFolder.name : 'Kho Media Gốc';
              uploadFilesWithQueue(e.dataTransfer.files, targetSlug, targetName);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className="relative border-2 border-dashed border-amber-300 hover:border-[#B8860B] bg-gradient-to-b from-amber-50/40 via-white to-amber-50/20 rounded-3xl p-6 sm:p-7 text-center cursor-pointer transition-all duration-300 hover:shadow-sm group"
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                const targetSlug = currentFolder ? currentFolder.slug : undefined;
                const targetName = currentFolder ? currentFolder.name : 'Kho Media Gốc';
                uploadFilesWithQueue(e.target.files, targetSlug, targetName);
                e.target.value = '';
              }
            }}
          />

          <div className="flex flex-col items-center justify-center space-y-2.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-100/90 text-amber-800 flex items-center justify-center group-hover:scale-110 group-hover:bg-[#B8860B] group-hover:text-white transition-all duration-300 shadow-2xs">
              <Upload className="w-5 h-5 stroke-[2.2]" />
            </div>

            <div className="space-y-1">
              <h3 className="font-serif text-sm sm:text-base font-medium text-charcoal-900">
                Kéo thả nhiều ảnh vào đây hoặc <span className="text-[#B8860B] underline underline-offset-4 font-semibold">chọn tệp từ máy tính</span>
              </h3>
              <p className="text-xs text-charcoal-500 font-light max-w-lg mx-auto">
                {currentFolder ? (
                  <>
                    Tải trực tiếp vào thư mục{' '}
                    <strong className="text-charcoal-900 font-semibold font-serif">"{currentFolder.name}"</strong>
                  </>
                ) : (
                  'Tải ảnh vào Kho Media Gốc (hoặc kéo thả thẳng vào từng thẻ thư mục bên trên để gom nhóm)'
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px] text-stone-500 font-mono">
              <span className="px-2.5 py-0.5 rounded-full bg-stone-100 border border-stone-200">
                ✓ Tự động nén WebP & biến thể (-sm, -md)
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 font-medium">
                ⚡ Hàng đợi xử lý tối đa 3 luồng đồng thời
              </span>
            </div>
          </div>
        </div>

        {/* SEARCH & FILTER TOOLBAR */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-200/80">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo tên ảnh, tên file hoặc đường dẫn..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-400 shadow-2xs font-light"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Chunk Status Filter Tabs */}
            <div className="flex items-center bg-stone-100 p-0.5 rounded-xl text-xs border border-stone-200">
              <button
                type="button"
                onClick={() => setChunkStatusFilter('ALL')}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  chunkStatusFilter === 'ALL'
                    ? 'bg-white text-charcoal-900 shadow-2xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Tất cả ảnh"
              >
                <span>Tất cả</span>
                <span className="text-[10px] text-stone-400 font-mono">({chunkCounts.all})</span>
              </button>

              <button
                type="button"
                onClick={() => setChunkStatusFilter('CHUNKED')}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  chunkStatusFilter === 'CHUNKED'
                    ? 'bg-white text-emerald-800 shadow-2xs font-semibold ring-1 ring-emerald-400'
                    : 'text-stone-600 hover:text-emerald-800'
                }`}
                title="Chỉ hiển thị ảnh đã tạo Chunks"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Đã Chunk</span>
                <span className="text-[10px] text-emerald-700 font-mono font-bold">({chunkCounts.chunked})</span>
              </button>

              <button
                type="button"
                onClick={() => setChunkStatusFilter('NOT_CHUNKED')}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  chunkStatusFilter === 'NOT_CHUNKED'
                    ? 'bg-white text-amber-900 shadow-2xs font-semibold ring-1 ring-amber-400'
                    : 'text-stone-600 hover:text-amber-800'
                }`}
                title="Chỉ hiển thị ảnh chưa được tạo Chunks"
              >
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Chưa Chunk</span>
                <span className="text-[10px] text-amber-700 font-mono font-bold">({chunkCounts.notChunked})</span>
              </button>
            </div>

            {/* Orientation Segmented Control */}
            <div className="flex items-center bg-stone-200/60 p-0.5 rounded-xl text-xs border border-stone-200/80">
              <button
                type="button"
                onClick={() => setSelectedOrientation('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1 ${
                  selectedOrientation === 'all'
                    ? 'bg-white text-charcoal-900 shadow-2xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Tất cả định hướng ảnh"
              >
                <span>Tất cả</span>
                <span className="text-[10px] text-stone-400 font-mono">({orientationCounts.all})</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedOrientation('landscape')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedOrientation === 'landscape'
                    ? 'bg-white text-luxury-900 shadow-2xs font-semibold ring-1 ring-luxury-400'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Chỉ lọc ảnh ngang (Landscape)"
              >
                <RectangleHorizontal className="w-3.5 h-3.5 text-luxury-600" />
                <span>Ảnh ngang</span>
                <span className="text-[10px] text-stone-400 font-mono">({orientationCounts.landscape})</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedOrientation('portrait')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedOrientation === 'portrait'
                    ? 'bg-white text-luxury-900 shadow-2xs font-semibold ring-1 ring-luxury-400'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Chỉ lọc ảnh dọc (Portrait)"
              >
                <RectangleVertical className="w-3.5 h-3.5 text-luxury-600" />
                <span>Ảnh dọc</span>
                <span className="text-[10px] text-stone-400 font-mono">({orientationCounts.portrait})</span>
              </button>
            </div>

            {/* Format Filter */}
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-stone-200 shadow-2xs">
              <Layers className="w-3.5 h-3.5 text-stone-400" />
              <select
                aria-label="Lọc theo định dạng ảnh"
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="text-xs bg-transparent border-none focus:outline-none text-charcoal-700 cursor-pointer font-medium"
              >
                <option value="ALL">Tất cả định dạng</option>
                {availableFormats.map((fmt) => (
                  <option key={fmt} value={fmt}>
                    Định dạng {fmt}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-stone-200 shadow-2xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-stone-400" />
              <select
                aria-label="Sắp xếp danh sách tệp"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs bg-transparent border-none focus:outline-none text-charcoal-700 cursor-pointer font-medium"
              >
                <option value="newest">Mới nhất trước</option>
                <option value="oldest">Cũ nhất trước</option>
                <option value="size_desc">Dung lượng lớn nhất</option>
                <option value="size_asc">Dung lượng nhỏ nhất</option>
                <option value="name_asc">Tên (A → Z)</option>
              </select>
            </div>

            {/* Select All / Deselect All Button */}
            {filteredAndSortedMedia.length > 0 && (
              <button
                type="button"
                onClick={handleSelectAllVisible}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer shadow-2xs ${
                  selectedFileIds.length > 0 && selectedFileIds.length === filteredAndSortedMedia.length
                    ? 'bg-luxury-100 border-luxury-300 text-luxury-900'
                    : 'bg-white border-stone-200 text-charcoal-700 hover:bg-stone-50'
                }`}
                title="Chọn hoặc bỏ chọn tất cả ảnh đang hiển thị"
              >
                <CheckSquare className="w-3.5 h-3.5 text-luxury-600" />
                <span>
                  {selectedFileIds.length > 0 && selectedFileIds.length === filteredAndSortedMedia.length
                    ? 'Bỏ chọn'
                    : `Chọn tất cả (${filteredAndSortedMedia.length})`}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* PHASE 2: OBSERVABLE BACKGROUND AI CONTEXT & CHUNKING PIPELINE BANNER */}
        {aiJob && (aiJob.status === 'RUNNING' || aiJob.status === 'COMPLETED' || aiJob.status === 'FAILED' || aiJob.status === 'CANCELLED') && (
          <div className="bg-gradient-to-br from-amber-50/80 via-white to-stone-50 border border-amber-200/90 rounded-2xl p-4 sm:p-5 shadow-sm transition-all duration-300 space-y-3.5 mb-6">
            {/* Top Bar: Status Header + Action Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-100/80 pb-3">
              <div className="flex items-center gap-2.5">
                {aiJob.status === 'RUNNING' ? (
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 shadow-xs">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-700" />
                  </div>
                ) : aiJob.status === 'COMPLETED' ? (
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  </div>
                ) : aiJob.status === 'CANCELLED' ? (
                  <div className="w-8 h-8 rounded-xl bg-stone-200 text-stone-700 flex items-center justify-center shrink-0 shadow-xs">
                    <Pause className="w-4 h-4 text-stone-700" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 shadow-xs">
                    <AlertCircle className="w-4 h-4 text-rose-700" />
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-charcoal-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>
                        {aiJob.status === 'RUNNING' && 'Tiến Trình AI Đọc Ngữ Cảnh & Chia Chunks'}
                        {aiJob.status === 'COMPLETED' && 'Đã Hoàn Tất Phân Loại Chunks AI'}
                        {aiJob.status === 'CANCELLED' && 'Tiến Trình AI Đã Tạm Dừng'}
                        {aiJob.status === 'FAILED' && 'Tiến Trình AI Gặp Lỗi'}
                      </span>
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                      {aiJob.status === 'RUNNING' && 'ĐANG CHẠY NGẦM'}
                      {aiJob.status === 'COMPLETED' && 'HOÀN THÀNH 100%'}
                      {aiJob.status === 'CANCELLED' && 'TẠM DỪNG'}
                      {aiJob.status === 'FAILED' && 'CẦN CHẠY LẠI'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 font-light mt-0.5">
                    {aiJob.status === 'RUNNING' && (
                      <>
                        AI đang phân tích thị giác: <strong className="text-stone-800 font-medium">{aiJob.currentFileName || 'Đang nạp ảnh...'}</strong> ({aiJob.processed}/{aiJob.total} ảnh)
                      </>
                    )}
                    {aiJob.status === 'COMPLETED' && `Đã phân loại thành công ${aiJob.successCount}/${aiJob.total} ảnh vào ${aiJob.chunksCreated.length} cụm Chunks.`}
                    {aiJob.status === 'CANCELLED' && `Đã dừng ở ảnh ${aiJob.processed}/${aiJob.total}. Bấm "Chạy Lại AI" để tiếp tục.`}
                    {aiJob.status === 'FAILED' && (aiJob.error || 'Có lỗi xảy ra trong quá trình gọi API Gemini.')}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                {aiJob.status === 'RUNNING' && (
                  <button
                    type="button"
                    onClick={handleCancelAiJob}
                    className="px-3 py-1.5 rounded-lg border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    title="Tạm dừng tiến trình phân tích"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    <span>Dừng</span>
                  </button>
                )}

                {(aiJob.status === 'COMPLETED' || aiJob.status === 'CANCELLED' || aiJob.status === 'FAILED') && (
                  <button
                    type="button"
                    onClick={handleRetryAiJob}
                    disabled={isStartingAi}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                    title="Chạy lại các ảnh chưa hoàn tất hoặc gom lại toàn bộ"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Chạy Lại AI</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsAiDrawerExpanded(!isAiDrawerExpanded)}
                  className="px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  title={isAiDrawerExpanded ? 'Thu gọn chi tiết' : 'Mở rộng chi tiết'}
                >
                  {isAiDrawerExpanded ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Thu Gọn</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Chi Tiết</span>
                    </>
                  )}
                </button>

                {aiJob.status !== 'RUNNING' && (
                  <button
                    type="button"
                    onClick={handleDismissAiJob}
                    className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                    title="Đóng thông báo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Progress Bar Row */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-stone-600 font-medium">
                  Tiến độ: <strong className="text-stone-900">{aiJob.processed} / {aiJob.total} ảnh</strong>
                  {aiJob.successCount > 0 && <span className="text-emerald-700 ml-2">✓ {aiJob.successCount} thành công</span>}
                  {aiJob.failedCount > 0 && <span className="text-rose-700 ml-2">✕ {aiJob.failedCount} lỗi</span>}
                </span>
                <span className="text-amber-800 font-bold">
                  {aiJob.total > 0 ? Math.min(100, Math.round((aiJob.processed / aiJob.total) * 100)) : 0}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-stone-200/80 rounded-full overflow-hidden p-0.5 shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 rounded-full transition-all duration-500 ease-out shadow-xs"
                  style={{
                    width: `${aiJob.total > 0 ? Math.min(100, Math.round((aiJob.processed / aiJob.total) * 100)) : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Expandable Section: Clustered Chunks + Live Logs */}
            {isAiDrawerExpanded && (
              <div className="space-y-3 pt-2 border-t border-amber-100/60">
                {/* Real-time Chunks Clustered */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-charcoal-800 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-amber-600" />
                      <span>Cụm Chunks Đã Gom Nhóm ({aiJob.chunksCreated.length}):</span>
                    </span>
                    {selectedChunkFilter !== 'ALL' && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenCreateAlbumModal(selectedChunkFilter)}
                          className="px-2.5 py-1 rounded-lg bg-luxury-800 hover:bg-luxury-900 text-white text-[11px] font-medium flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                          title="Tạo nhanh bộ sưu tập nháp từ cụm ảnh này"
                        >
                          <FolderPlus className="w-3.5 h-3.5 text-luxury-300" />
                          <span>Tạo Album từ Chunk này</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedChunkFilter('ALL')}
                          className="text-[11px] text-amber-700 hover:text-amber-900 underline font-medium cursor-pointer"
                        >
                          Bỏ lọc cụm (Xem tất cả)
                        </button>
                      </div>
                    )}
                  </div>

                  {aiJob.chunksCreated.length === 0 ? (
                    <p className="text-xs text-stone-400 italic">Đang chờ AI phân tích những bức ảnh đầu tiên để bắt đầu gom nhóm...</p>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedChunkFilter('ALL')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                          selectedChunkFilter === 'ALL'
                            ? 'bg-charcoal-900 text-white shadow-xs'
                            : 'bg-white border border-stone-200 text-stone-700 hover:border-amber-400'
                        }`}
                      >
                        <span>Tất cả</span>
                        <span className="font-mono text-[10px] opacity-75">({aiJob.total})</span>
                      </button>

                      {aiJob.chunksCreated.map((chunk) => (
                        <button
                          key={chunk.id}
                          type="button"
                          onClick={() => setSelectedChunkFilter(selectedChunkFilter === chunk.name ? 'ALL' : chunk.name)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                            selectedChunkFilter === chunk.name
                              ? 'bg-amber-600 text-white ring-2 ring-amber-300'
                              : 'bg-white border border-amber-200 text-stone-800 hover:bg-amber-50/50'
                          }`}
                          title={`Xem ${chunk.count} ảnh thuộc cụm "${chunk.name}"`}
                        >
                          <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                          <span className="font-medium">{chunk.name}</span>
                          <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-mono font-bold">
                            {chunk.count}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Real-time Logs Box */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5 text-xs font-semibold text-charcoal-800">
                    <FileText className="w-3.5 h-3.5 text-stone-500" />
                    <span>Nhật Ký Xử Lý Trực Tiếp (Real-time Logs):</span>
                  </div>
                  <div className="bg-stone-900 text-stone-200 p-3 rounded-xl max-h-36 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-1 shadow-inner">
                    {aiJob.logs && aiJob.logs.length > 0 ? (
                      aiJob.logs.map((log, idx) => (
                        <div key={idx} className="flex items-start gap-1.5">
                          <span className="text-stone-300">{log}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-stone-500 italic">Chưa có nhật ký ghi nhận.</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* LOADING STATE */}
        {loading || folderLoading ? (
          <div className="py-20 text-center text-charcoal-400 space-y-3">
            <Loader2 className="w-7 h-7 animate-spin text-luxury-600 mx-auto" />
            <p className="text-xs font-light">Đang đọc tài nguyên ảnh trên máy chủ...</p>
          </div>
        ) : filteredAndSortedMedia.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed border-stone-200 rounded-2xl p-8 space-y-3">
            <ImageIcon className="w-10 h-10 text-stone-300 mx-auto" />
            <div className="space-y-1">
              <h4 className="font-serif text-base font-light text-charcoal-900">
                {searchQuery
                  ? 'Không tìm thấy ảnh phù hợp'
                  : selectedOrientation !== 'all'
                  ? `Không có ${selectedOrientation === 'landscape' ? 'ảnh ngang' : 'ảnh dọc'} nào`
                  : 'Chưa có ảnh nào'}
              </h4>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                {searchQuery
                  ? 'Thử tìm với từ khóa khác hoặc xóa bộ lọc định dạng / hướng ảnh.'
                  : selectedOrientation !== 'all'
                  ? `Thử chuyển sang "Tất cả" để xem toàn bộ ${baseFilteredMedia.length} ảnh.`
                  : 'Sử dụng nút "Import Từ Google Drive" hoặc kéo thả ảnh để tải lên hệ thống.'}
              </p>
            </div>
            {selectedOrientation !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedOrientation('all')}
                className="px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-charcoal-800 text-xs font-medium transition-colors cursor-pointer"
              >
                Bỏ lọc hướng ảnh (xem {baseFilteredMedia.length} ảnh)
              </button>
            )}
          </div>
        ) : (
          /* IMAGES GRID */
          <>
            {selectedChunkFilter !== 'ALL' && (
              <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-xl bg-amber-500 text-white shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-xs font-semibold text-charcoal-900">
                      Đang lọc theo cụm Chunk: <span className="text-amber-800 font-bold">"{selectedChunkFilter}"</span>
                    </h4>
                    <p className="text-[11px] text-stone-500 font-light">
                      Hiển thị {filteredAndSortedMedia.length} ảnh thuộc cụm phân loại ngữ cảnh AI này.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedChunkFilter('ALL')}
                    className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium transition-colors cursor-pointer"
                  >
                    Bỏ lọc (Xem tất cả)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenCreateAlbumModal(selectedChunkFilter)}
                    className="px-3.5 py-1.5 rounded-xl bg-luxury-800 hover:bg-luxury-900 text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-xs cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <FolderPlus className="w-3.5 h-3.5 text-luxury-300" />
                    <span>Tạo Album từ Chunk này</span>
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {visibleMedia.map((item) => {
                const itemKey = item.id || item.url;
                const isSelected =
                  selectedFileIds.includes(itemKey) ||
                  selectedFileIds.includes(item.url) ||
                  selectedFileIds.includes(item.id);

                const itemOri = getItemOrientation(item);
                const itemWidth = item.width || loadedDimensions[item.url]?.width;
                const itemHeight = item.height || loadedDimensions[item.url]?.height;

                return (
                  <div
                    key={item.id || item.url}
                    className={`group bg-white rounded-2xl border overflow-hidden shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between ${
                      isSelected
                        ? 'border-luxury-500 ring-2 ring-luxury-400/60 shadow-md'
                        : 'border-stone-200'
                    }`}
                  >
                    {/* Image Container with Preview */}
                    <div
                      onClick={(e) => {
                        if (selectedFileIds.length > 0) {
                          toggleSelectImage(itemKey, e);
                        } else {
                          setLightboxItem(item);
                        }
                      }}
                      className="relative aspect-4/3 bg-stone-100 overflow-hidden cursor-pointer"
                    >
                      <img
                        src={getThumbnailUrl(item.url)}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                        onLoad={(e) => handleImageLoad(item.url, e.currentTarget.naturalWidth, e.currentTarget.naturalHeight)}
                        onError={(e) => {
                          if (e.currentTarget.src !== item.url) {
                            e.currentTarget.src = item.url;
                          }
                        }}
                      />

                    {/* Selection Checkbox */}
                    <button
                      type="button"
                      onClick={(e) => toggleSelectImage(itemKey, e)}
                      className={`absolute top-2 right-2 z-20 w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-luxury-600 text-white shadow-md ring-2 ring-white/80'
                          : 'bg-black/40 text-white/40 hover:text-white hover:bg-black/70 border border-white/30 backdrop-blur-xs'
                      }`}
                      title={isSelected ? 'Bỏ chọn ảnh này' : 'Chọn ảnh này'}
                    >
                      <Check
                        className={`w-3.5 h-3.5 stroke-[3] transition-opacity ${
                          isSelected ? 'opacity-100' : 'opacity-0 hover:opacity-100'
                        }`}
                      />
                    </button>

                    {/* Format, Dimensions & AI Status Badges */}
                    <div className="absolute top-2 left-2 flex flex-col items-start gap-1 z-20 pointer-events-auto max-w-[calc(100%-3.2rem)]">
                      <div className="flex items-center gap-1">
                        <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono uppercase font-medium">
                          {item.format}
                        </span>
                        {itemWidth && itemHeight && (
                          <span className="px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-xs text-stone-200 text-[9px] font-mono">
                            {itemWidth}×{itemHeight}
                          </span>
                        )}
                      </div>

                      {/* AI Chunk Status Badge */}
                      {processingMediaIds.includes(item.id || item.url) || item.chunkStatus === 'PROCESSING' || item.aiStatus === 'RUNNING' || (aiJob?.status === 'RUNNING' && (aiJob?.currentFileName?.includes(item.name) || aiJob?.currentFileName?.includes(item.filename))) ? (
                        <span className="relative z-10 px-2 py-0.5 rounded-md bg-amber-500/95 backdrop-blur-xs text-white text-[9px] font-medium flex items-center gap-1 shadow-xs animate-pulse">
                          <Loader2 className="w-2.5 h-2.5 animate-spin" />
                          <span>⟳ Đang xử lý...</span>
                        </span>
                      ) : (item.chunkStatus === 'CHUNKED' || Boolean(item.chunkTitle) || item.aiStatus === 'DONE') ? (
                        <div className="flex flex-col items-start gap-1">
                          <span
                            className="px-2 py-0.5 rounded-md bg-emerald-700/95 backdrop-blur-xs text-white text-[9px] font-semibold flex items-center gap-1 shadow-xs"
                            title={`Đã chunk: ${item.chunkTitle || item.chunkName || 'Ảnh cưới'}${item.aiContext ? `\nNgữ cảnh: ${item.aiContext}` : ''}${item.pineconeSynced ? '\n🌲 Đã đồng bộ Pinecone Vector DB' : ''}`}
                          >
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                            <span>✓ Đã Chunk</span>
                            {item.pineconeSynced && (
                              <span title="Đã lưu vector vào Pinecone Vector DB" className="text-[10px]">
                                🌲
                              </span>
                            )}
                          </span>
                          {(item.chunkTitle || item.chunkName) && (
                            <span
                              className="px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-xs text-emerald-200 text-[8.5px] font-medium max-w-[160px] truncate shadow-2xs"
                              title={`${item.chunkTitle || item.chunkName}${item.aiContext ? ` - ${item.aiContext}` : ''}`}
                            >
                              {item.chunkTitle || item.chunkName}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-stone-700/90 backdrop-blur-xs text-stone-200 text-[9px] font-medium shadow-xs">
                          Chưa Chunk
                        </span>
                      )}
                    </div>

                    {/* Hover Orientation & Dimensions Badge */}
                    <div className="absolute bottom-2 left-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="px-2 py-0.5 rounded-md bg-stone-900/90 backdrop-blur-xs text-white text-[9px] font-mono flex items-center justify-center gap-1 shadow-md">
                        {itemOri === 'landscape' ? (
                          <>
                            <RectangleHorizontal className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                            <span>Ngang</span>
                          </>
                        ) : itemOri === 'portrait' ? (
                          <>
                            <RectangleVertical className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                            <span>Dọc</span>
                          </>
                        ) : itemOri === 'square' ? (
                          <span>Vuông</span>
                        ) : null}
                        {itemWidth && itemHeight && (
                          <>
                            <span className="text-stone-400">•</span>
                            <span>{itemWidth}×{itemHeight}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Hover Overlay Hint for Lightbox */}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLightboxItem(item);
                        }}
                        className="p-2 bg-white/90 rounded-full text-charcoal-900 shadow-md transform translate-y-2 group-hover:translate-y-0 transition-transform pointer-events-auto cursor-pointer hover:bg-white"
                        title="Xem ảnh phóng to"
                      >
                        <Maximize2 className="w-4 h-4 text-luxury-700" />
                      </button>
                    </div>
                  </div>

                {/* Info & Metadata */}
                <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3
                      className="font-serif text-xs font-semibold text-charcoal-900 truncate"
                      title={item.filename}
                    >
                      {item.name}
                    </h3>
                    <p className="text-[10px] text-stone-400 font-mono truncate">{item.filename}</p>
                    {item.uploaderName && (
                      <p className="text-[10px] text-stone-500 truncate mt-0.5">
                        Đăng bởi: <span className="font-medium text-stone-700">{item.uploaderName}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-stone-500 pt-2 border-t border-stone-100 font-mono">
                    <span className="font-medium text-luxury-700 flex items-center gap-1">
                      {itemOri === 'landscape' && (
                        <span title="Ảnh ngang">
                          <RectangleHorizontal className="w-2.5 h-2.5 text-amber-600" />
                        </span>
                      )}
                      {itemOri === 'portrait' && (
                        <span title="Ảnh dọc">
                          <RectangleVertical className="w-2.5 h-2.5 text-amber-600" />
                        </span>
                      )}
                      <span>{item.formattedSize}</span>
                    </span>
                    <span className="text-stone-400">{new Date(item.modifiedAt).toLocaleDateString('vi-VN')}</span>
                  </div>

                    {/* Action Buttons */}
                  <div
                    className="flex items-center justify-between gap-1 pt-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {processingMediaIds.includes(item.id || item.url) ? (
                      <span className="relative z-20 pointer-events-auto py-1.5 px-2.5 rounded-lg text-[11px] font-medium bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1 shrink-0 animate-pulse">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Đang xử lý...</span>
                      </span>
                    ) : item.chunkStatus !== 'CHUNKED' && !item.chunkTitle && item.aiStatus !== 'DONE' ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleConvertSingleImage(item);
                        }}
                        disabled={processingMediaIds.includes(item.id || item.url)}
                        className="relative z-20 pointer-events-auto py-1.5 px-2.5 rounded-lg text-[11px] font-semibold bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white shadow-2xs transition-all flex items-center gap-1 cursor-pointer shrink-0 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
                        title="Bấm để AI đọc ngữ cảnh và tạo chunk cho tấm ảnh này"
                      >
                        <Sparkles className="w-3 h-3 text-amber-200" />
                        <span>Convert Chunks</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleConvertSingleImage(item);
                        }}
                        disabled={processingMediaIds.includes(item.id || item.url)}
                        className="relative z-20 pointer-events-auto py-1.5 px-2.5 rounded-lg text-[11px] font-medium bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 transition-all flex items-center gap-1 cursor-pointer shrink-0 disabled:opacity-50"
                        title="Chạy lại AI để cập nhật ngữ cảnh chunk cho ảnh này"
                      >
                        <RotateCcw className="w-3 h-3 text-stone-500" />
                        <span>Re-chunk</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => handleCopyUrl(item.url, e)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        copiedUrl === item.url
                          ? 'bg-emerald-600 text-white'
                          : 'bg-stone-100 hover:bg-stone-200 text-charcoal-700'
                      }`}
                      title="Sao chép URL ảnh"
                    >
                      {copiedUrl === item.url ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Đã chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-stone-500" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDownloadSingle(item.url, item.filename || item.name, e)}
                      className="p-1.5 text-stone-500 hover:text-luxury-700 hover:bg-luxury-50 rounded-lg transition-colors cursor-pointer"
                      title="Tải tệp này về máy"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    {(!currentUser || currentUser.role !== 'USER' || !item.uploadedById || item.uploadedById === currentUser.id) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(item);
                        }}
                        className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Xóa ảnh khỏi server"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* INFINITE SCROLL SENTINEL & LOAD MORE BUTTON */}
        {visibleCount < filteredAndSortedMedia.length && (
          <div ref={sentinelRef} className="py-6 flex flex-col items-center justify-center gap-2">
            <div className="flex items-center gap-2 text-xs text-stone-500 font-mono">
              <Loader2 className="w-4 h-4 animate-spin text-luxury-600" />
              <span>
                Đang hiển thị {visibleMedia.length} / {filteredAndSortedMedia.length} ảnh...
              </span>
            </div>
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => Math.min(prev + 24, filteredAndSortedMedia.length))}
              className="px-4 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-xs text-charcoal-700 font-medium transition-colors shadow-2xs cursor-pointer"
            >
              Tải thêm 24 ảnh ({filteredAndSortedMedia.length - visibleMedia.length} ảnh còn lại)
            </button>
          </div>
        )}
      </>
      )}
    </div>
  )}

      {/* MODAL 1: CREATE FOLDER */}
      <Modal
        isOpen={isCreateFolderOpen}
        onClose={() => setIsCreateFolderOpen(false)}
        title="Tạo Thư Mục Media Mới"
        subtitle="Tạo thư mục trên máy chủ để gom nhóm ảnh cưới theo từng album hoặc sự kiện"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateFolder} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs uppercase tracking-wider text-charcoal-700 font-medium mb-1.5">
              Tên Thư Mục <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="ví dụ: Đám cưới Minh Trí - Thu Hà"
              className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-luxury-400 font-medium"
            />
            <p className="text-[11px] text-stone-400 mt-1">
              Hệ thống sẽ tự động tạo thư mục con lưu trữ tại: /public/uploads/folders/[ten-thu-muc]/
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setIsCreateFolderOpen(false)}
              className="px-4 py-2 rounded-xl border border-stone-200 text-charcoal-600 text-xs font-medium hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={creatingFolder}
              className="px-5 py-2 rounded-xl bg-charcoal-900 text-white text-xs font-medium uppercase tracking-wider hover:bg-charcoal-800 transition-all flex items-center gap-1.5 shadow-md disabled:opacity-60 cursor-pointer"
            >
              {creatingFolder ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang Tạo...</span>
                </>
              ) : (
                <>
                  <FolderPlus className="w-3.5 h-3.5 text-luxury-400" />
                  <span>Tạo Thư Mục</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: RENAME FOLDER */}
      <Modal
        isOpen={!!renameTargetFolder}
        onClose={() => setRenameTargetFolder(null)}
        title="Đổi Tên Thư Mục Media"
        subtitle="Cập nhật tiêu đề hiển thị cho thư mục album"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleRenameFolder} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs uppercase tracking-wider text-charcoal-700 font-medium mb-1.5">
              Tên Thư Mục Mới <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={renameFolderName}
              onChange={(e) => setRenameFolderName(e.target.value)}
              className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-luxury-400 font-medium"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setRenameTargetFolder(null)}
              className="px-4 py-2 rounded-xl border border-stone-200 text-charcoal-600 text-xs font-medium hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={renamingFolder}
              className="px-5 py-2 rounded-xl bg-charcoal-900 text-white text-xs font-medium uppercase tracking-wider hover:bg-charcoal-800 transition-all flex items-center gap-1.5 shadow-md disabled:opacity-60 cursor-pointer"
            >
              {renamingFolder ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang Lưu...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 text-luxury-400" />
                  <span>Lưu Thay Đổi</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: CONFIRM DELETE FOLDER */}
      <Modal
        isOpen={!!deleteTargetFolder}
        onClose={() => setDeleteTargetFolder(null)}
        title="Xác Nhận Xóa Thư Mục Media"
        subtitle="Hành động này sẽ xóa toàn bộ ảnh bên trong và giải phóng dung lượng ổ cứng"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-charcoal-700 leading-relaxed">
            Bạn có chắc chắn muốn xóa vĩnh viễn thư mục{' '}
            <strong className="text-charcoal-950 font-semibold font-serif">
              "{deleteTargetFolder?.name}"
            </strong>{' '}
            (bao gồm {deleteTargetFolder?.imageCount} ảnh WebP - {deleteTargetFolder?.formattedSize})?
          </p>
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Toàn bộ file ảnh vật lý trên máy chủ VPS sẽ bị xóa không thể khôi phục!</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setDeleteTargetFolder(null)}
              className="px-4 py-2 rounded-xl border border-stone-200 text-charcoal-600 text-xs font-medium hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={deletingFolder}
              onClick={handleDeleteFolder}
              className="px-5 py-2 rounded-xl bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-60 cursor-pointer"
            >
              {deletingFolder ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang Xóa...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa Vĩnh Viễn</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL 3.5: CONFIRM BULK DELETE FOLDERS */}
      <Modal
        isOpen={isBulkDeleteFoldersModalOpen}
        onClose={() => setIsBulkDeleteFoldersModalOpen(false)}
        title="Xác Nhận Xóa Hàng Loạt Thư Mục"
        subtitle="Hành động này sẽ xóa toàn bộ thư mục đã chọn và giải phóng dung lượng ổ cứng"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-charcoal-700 leading-relaxed">
            Bạn có chắc chắn muốn xóa vĩnh viễn{' '}
            <strong className="text-red-600 font-semibold font-serif text-sm">
              {selectedFolderIds.length} thư mục
            </strong>{' '}
            đã chọn cùng toàn bộ dữ liệu bên trong? Thao tác này không thể hoàn tác.
          </p>
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Toàn bộ file ảnh vật lý trên máy chủ VPS sẽ bị xóa vĩnh viễn không thể khôi phục!</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setIsBulkDeleteFoldersModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-stone-200 text-charcoal-600 text-xs font-medium hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={bulkDeletingFolders}
              onClick={handleBulkDeleteFolders}
              className="px-5 py-2 rounded-xl bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-60 cursor-pointer"
            >
              {bulkDeletingFolders ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang Xóa {selectedFolderIds.length} Thư Mục...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa {selectedFolderIds.length} Thư Mục</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL 4: CONFIRM DELETE INDIVIDUAL IMAGE */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Xác Nhận Xóa Tệp Media"
        subtitle="Hành động này sẽ xóa file ảnh vĩnh viễn khỏi máy chủ VPS"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-charcoal-700 leading-relaxed">
            Bạn có chắc chắn muốn xóa vĩnh viễn file{' '}
            <strong className="text-charcoal-950 font-semibold font-mono">
              "{deleteTarget?.filename}"
            </strong>{' '}
            ({deleteTarget?.formattedSize})?
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="px-4 py-2 rounded-xl border border-stone-200 text-charcoal-600 text-xs font-medium hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={handleConfirmDelete}
              className="px-5 py-2 rounded-xl bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-60 cursor-pointer"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang Xóa...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa Vĩnh Viễn</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL 5: LIGHTBOX IMAGE PREVIEW */}
      <Modal
        isOpen={!!lightboxItem}
        onClose={() => setLightboxItem(null)}
        title={lightboxItem?.name || 'Chi Tiết Hình Ảnh'}
        subtitle={lightboxItem?.filename}
        maxWidth="max-w-4xl"
      >
        {lightboxItem && (
          <div className="space-y-4 pt-2">
            <div className="relative max-h-[65vh] flex items-center justify-center bg-stone-900/90 rounded-2xl overflow-hidden p-2">
              <img
                src={lightboxItem.url}
                alt={lightboxItem.name}
                className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-2xl"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-100 p-3 rounded-xl text-xs font-mono">
              <div>
                <span className="text-stone-400 block text-[10px]">Định Dạng</span>
                <span className="font-semibold text-charcoal-800">{lightboxItem.format}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px]">Dung Lượng</span>
                <span className="font-semibold text-charcoal-800">{lightboxItem.formattedSize}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px]">Kích Thước</span>
                <span className="font-semibold text-charcoal-800">
                  {lightboxItem.width && lightboxItem.height
                    ? `${lightboxItem.width} × ${lightboxItem.height}`
                    : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px]">Thời Gian</span>
                <span className="font-semibold text-charcoal-800">
                  {new Date(lightboxItem.modifiedAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <span className="text-xs text-stone-500 font-mono truncate max-w-sm sm:max-w-md">
                {lightboxItem.url}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadSingle(lightboxItem.url, lightboxItem.filename || lightboxItem.name)}
                  className="px-3.5 py-2 rounded-xl bg-luxury-600 text-white text-xs font-medium flex items-center gap-2 hover:bg-luxury-700 cursor-pointer shadow-xs transition-colors"
                  title="Tải tệp này về máy tính"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải Xuống</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCopyUrl(lightboxItem.url)}
                  className="px-3.5 py-2 rounded-xl bg-charcoal-900 text-white text-xs font-medium flex items-center gap-2 hover:bg-charcoal-800 cursor-pointer shadow-xs transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Sao Chép URL</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* FLOATING ACTION BAR FOR BULK ACTIONS */}
      {selectedFileIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-charcoal-900/95 text-white px-5 sm:px-6 py-3 rounded-2xl shadow-2xl backdrop-blur-md border border-stone-700/60 flex items-center gap-3 sm:gap-5 animate-fade-in text-xs">
          <div className="flex items-center gap-2.5 pr-3 sm:pr-4 border-r border-stone-700">
            <span className="w-6 h-6 rounded-full bg-luxury-600 text-white font-mono font-bold text-[11px] flex items-center justify-center">
              {selectedFileIds.length}
            </span>
            <span className="font-medium text-stone-200 hidden sm:inline">
              Đã chọn ({selectedStats.formattedSize})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={downloadingBatch}
              onClick={() => handleDownloadBatch(selectedFileIds)}
              className="px-3.5 py-1.5 rounded-xl bg-luxury-600 hover:bg-luxury-500 text-white font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              title="Nén và tải xuống toàn bộ các tệp đã chọn dưới dạng .ZIP"
            >
              {downloadingBatch ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang nén ZIP...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>📦 Tải xuống ({selectedFileIds.length} tệp .ZIP)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setTargetFolderForMove(
                  currentFolder ? 'root' : folders[0]?.id || folders[0]?.slug || 'root'
                );
                setIsMoveModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <FolderInput className="w-3.5 h-3.5" />
              <span>Di Chuyển</span>
            </button>

            <button
              type="button"
              onClick={() => setIsBulkDeleteModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa ({selectedFileIds.length})</span>
            </button>

            <button
              type="button"
              onClick={handleClearSelection}
              className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
              title="Bỏ chọn tất cả"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* MODAL 6: MOVE SELECTED IMAGES TO FOLDER */}
      <Modal
        isOpen={isMoveModalOpen}
        onClose={() => setIsMoveModalOpen(false)}
        title="Di Chuyển Ảnh Vào Thư Mục"
        subtitle={`Chọn thư mục đích cho ${selectedFileIds.length} ảnh đã chọn`}
        maxWidth="max-w-md"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-charcoal-600 leading-relaxed">
            Hệ thống sẽ di chuyển tệp vật lý trên ổ đĩa và cập nhật liên kết thư mục tự động.
          </p>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {/* Root folder option */}
            <label
              className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                targetFolderForMove === 'root'
                  ? 'border-luxury-500 bg-luxury-50/50 shadow-xs'
                  : 'border-stone-200 hover:border-stone-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="targetFolder"
                  value="root"
                  checked={targetFolderForMove === 'root'}
                  onChange={() => setTargetFolderForMove('root')}
                  className="text-luxury-600 focus:ring-luxury-400"
                />
                <div>
                  <span className="text-xs font-semibold text-charcoal-900 block">
                    📁 Thư mục gốc (Root Media)
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">
                    /public/uploads/products/
                  </span>
                </div>
              </div>
            </label>

            {/* Existing custom folders */}
            {folders.map((f) => {
              const isCurrent = currentFolder && currentFolder.slug === f.slug;
              const folderIdentifier = f.id || f.slug;
              return (
                <label
                  key={f.slug}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isCurrent
                      ? 'border-stone-200 bg-stone-50 opacity-60 cursor-not-allowed'
                      : targetFolderForMove === folderIdentifier
                      ? 'border-luxury-500 bg-luxury-50/50 shadow-xs cursor-pointer'
                      : 'border-stone-200 hover:border-stone-300 bg-white cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="targetFolder"
                      value={folderIdentifier}
                      disabled={Boolean(isCurrent)}
                      checked={targetFolderForMove === folderIdentifier}
                      onChange={() => setTargetFolderForMove(folderIdentifier)}
                      className="text-luxury-600 focus:ring-luxury-400"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-charcoal-900 block">
                          {f.name}
                        </span>
                        {isCurrent && (
                          <span className="text-[9px] bg-stone-200 text-stone-600 px-1.5 py-0.2 rounded-full font-mono">
                            Hiện tại
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {f.imageCount} ảnh • {f.formattedSize}
                      </span>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setIsMoveModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-stone-200 text-charcoal-600 text-xs font-medium hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={movingFiles}
              onClick={handleBulkMove}
              className="px-5 py-2 rounded-xl bg-luxury-900 text-white text-xs font-medium hover:bg-black transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-60 cursor-pointer"
            >
              {movingFiles ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang di chuyển...</span>
                </>
              ) : (
                <>
                  <FolderInput className="w-3.5 h-3.5 text-luxury-400" />
                  <span>Xác Nhận Di Chuyển</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL 7: CONFIRM BULK DELETE IMAGES */}
      <Modal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        title="Xác Nhận Xóa Hàng Loạt Tệp Media"
        subtitle={`Xóa vĩnh viễn ${selectedFileIds.length} ảnh khỏi máy chủ VPS`}
        maxWidth="max-w-md"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-charcoal-700 leading-relaxed">
            Bạn có chắc chắn muốn xóa vĩnh viễn{' '}
            <strong className="text-charcoal-950 font-semibold font-mono">
              {selectedStats.count} tệp ảnh
            </strong>{' '}
            (tổng dung lượng khoảng{' '}
            <strong className="text-luxury-700 font-semibold font-mono">
              {selectedStats.formattedSize}
            </strong>
            )?
          </p>
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Toàn bộ file ảnh vật lý trên máy chủ VPS sẽ bị xóa không thể khôi phục!</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setIsBulkDeleteModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-stone-200 text-charcoal-600 text-xs font-medium hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={bulkDeleting}
              onClick={handleBulkDelete}
              className="px-5 py-2 rounded-xl bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-60 cursor-pointer"
            >
              {bulkDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang Xóa...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa Vĩnh Viễn ({selectedStats.count})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* GOOGLE DRIVE MEDIA PICKER */}
      <DriveMediaPicker
        isOpen={isDrivePickerOpen}
        onClose={() => setIsDrivePickerOpen(false)}
        onSuccess={(urls, importedItems) => {
          showToast(`Đã lưu ${urls.length} ảnh vào kho thành công!`);
          if (currentFolder) fetchFolderContent(currentFolder.slug);
          fetchMedia();
          const mediaIds = (importedItems || []).map((item) => item.id).filter(Boolean);
          triggerAiChunkJob(mediaIds, currentFolder?.id, importedItems);
        }}
        mode="multiple"
        title="Chọn Ảnh Hoặc Import Cả Thư Mục Từ Google Drive"
      />

      {/* FULL-PAGE DRAG-AND-DROP OVERLAY */}
      {isDraggingOverPage && (
        <div className="fixed inset-0 z-50 bg-charcoal-900/60 backdrop-blur-xs flex items-center justify-center p-6 animate-fade-in pointer-events-none">
          <div className="bg-white border-3 border-dashed border-[#B8860B] rounded-3xl p-10 max-w-lg w-full text-center space-y-4 shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-amber-100 text-[#B8860B] flex items-center justify-center mx-auto shadow-inner">
              <Upload className="w-10 h-10 stroke-[2.2] animate-bounce" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-medium text-charcoal-900">
                Thả ảnh vào đây để tải lên
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                {currentFolder ? (
                  <>
                    Tải thẳng vào thư mục <strong className="text-luxury-800 font-semibold font-serif">"{currentFolder.name}"</strong>
                  </>
                ) : (
                  'Tải trực tiếp vào Kho Media Gốc'
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MINIMIZED UPLOAD PROGRESS BUTTON */}
      {uploadQueue.length > 0 && !isUploadDrawerOpen && (
        <button
          type="button"
          onClick={() => setIsUploadDrawerOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-charcoal-900 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 border border-amber-500/40 hover:bg-black transition-all cursor-pointer text-xs"
        >
          <Upload className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>
            Tiến trình tải ({uploadQueue.filter((i) => i.status === 'completed').length}/{uploadQueue.length})
          </span>
        </button>
      )}

      {/* FLOATING UPLOAD QUEUE DRAWER */}
      {uploadQueue.length > 0 && isUploadDrawerOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-slide-up flex flex-col max-h-[420px]">
          {/* Header */}
          <div className="p-4 bg-charcoal-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Upload className="w-4 h-4 text-luxury-400" />
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider">
                  Tiến Trình Tải Lên Media
                </h4>
                <span className="text-[10px] text-stone-300 font-mono">
                  {uploadQueue.filter((i) => i.status === 'completed').length} / {uploadQueue.length} tệp thành công
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setUploadQueue([])}
                className="px-2 py-1 text-stone-400 hover:text-white rounded-lg text-[10px] font-mono cursor-pointer"
                title="Xóa danh sách hoàn tất"
              >
                Xóa hết
              </button>
              <button
                type="button"
                onClick={() => setIsUploadDrawerOpen(false)}
                className="p-1 text-stone-400 hover:text-white rounded-lg cursor-pointer"
                title="Thu nhỏ"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-stone-100 h-1.5">
            <div
              className="bg-amber-500 h-1.5 transition-all duration-300"
              style={{
                width: `${(uploadQueue.filter((i) => i.status === 'completed' || i.status === 'error').length / uploadQueue.length) * 100}%`,
              }}
            />
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs divide-y divide-stone-100">
            {uploadQueue.map((item) => (
              <div key={item.id} className="pt-2 first:pt-0 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-charcoal-900 truncate" title={item.name}>
                    {item.name}
                  </p>
                  <div className="flex items-center gap-1.5 text-[10px] text-stone-400 font-mono">
                    <span>{item.formattedSize}</span>
                    <span>•</span>
                    <span className="truncate">{item.folderName}</span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-1.5">
                  {item.status === 'pending' && (
                    <span className="text-[10px] text-stone-400 font-mono">Chờ lượt...</span>
                  )}
                  {item.status === 'uploading' && (
                    <div className="flex items-center gap-1 text-[11px] text-amber-700 font-medium font-mono">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                      <span>Nén WebP...</span>
                    </div>
                  )}
                  {item.status === 'completed' && (
                    <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-0.5 font-mono">
                      <Check className="w-3.5 h-3.5" /> Xong
                    </span>
                  )}
                  {item.status === 'error' && (
                    <span className="text-[11px] text-red-500 font-medium font-mono" title={item.errorMessage}>
                      ✕ Lỗi
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Tạo Album từ Cụm Chunk */}
      <Modal
        isOpen={createAlbumModalOpen}
        onClose={() => !creatingAlbumFromChunk && setCreateAlbumModalOpen(false)}
        title="Tạo Album / Bộ Sưu Tập Mới Từ Chunk AI"
      >
        <div className="space-y-4 pt-1">
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold block">Gom nhóm thông minh từ AI</span>
              <p className="text-[11px] text-amber-800 leading-relaxed font-light">
                Toàn bộ ảnh thuộc cụm <strong>"{selectedChunkFilter}"</strong> sẽ được gom thành một bộ sưu tập nháp (Draft) để bạn có thể tùy chỉnh thêm trước khi công khai trên website.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-stone-700">Tên Bộ Sưu Tập (Album Title)</label>
            <input
              type="text"
              value={newAlbumTitle}
              onChange={(e) => setNewAlbumTitle(e.target.value)}
              placeholder="Nhập tên bộ sưu tập cưới..."
              className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-luxury-400 text-stone-900 font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-stone-700">Concept / Phong Cách</label>
            <select
              value={newAlbumConcept}
              onChange={(e) => setNewAlbumConcept(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-luxury-400 text-stone-900"
            >
              <option value="Pre-Wedding">Pre-Wedding</option>
              <option value="Phóng Sự Cưới">Phóng Sự Cưới</option>
              <option value="Lễ Gia Tiên">Lễ Gia Tiên</option>
              <option value="Tiệc Cưới Luxury">Tiệc Cưới Luxury</option>
              <option value="Studio Editorial">Studio Editorial</option>
              <option value="Outdoor Luxury">Outdoor Luxury</option>
            </select>
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreateAlbumModalOpen(false)}
              disabled={creatingAlbumFromChunk}
              className="px-4 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleCreateAlbumFromChunk}
              disabled={creatingAlbumFromChunk || !newAlbumTitle.trim()}
              className="px-5 py-2 rounded-xl bg-luxury-800 hover:bg-luxury-900 text-white text-xs font-medium flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
            >
              {creatingAlbumFromChunk ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang Tạo Album...</span>
                </>
              ) : (
                <>
                  <FolderPlus className="w-3.5 h-3.5 text-luxury-300" />
                  <span>Tạo Album Nháp Ngay</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* 16:9 EDITORIAL COLLAGE STUDIO MODAL */}
      <AlbumCollageStudioModal
        isOpen={isCollageModalOpen}
        onClose={() => setIsCollageModalOpen(false)}
      />
    </div>
  );
}
