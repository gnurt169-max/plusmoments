'use client';

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
} from 'react';

export interface FolderImportJob {
  id: string;
  name: string;
}

export interface MediaImportContextType {
  // State
  isImporting: boolean;
  queue: FolderImportJob[];
  activeItem: FolderImportJob | null;
  totalFolders: number;
  currentFolderIndex: number;
  currentFolderName: string;
  totalImages: number;
  processedImages: number;
  importedCount: number;
  skippedCount: number;
  currentProgressPercent: number;
  status: 'idle' | 'running' | 'completed' | 'error';
  errorLogs: string[];
  completedSummary?: {
    totalFolders: number;
    totalImages: number;
    importedCount: number;
    skippedCount: number;
  };
  isMinimized: boolean;

  // Actions
  toggleMinimize: () => void;
  dismiss: () => void;
  cancelImport: () => void;
  startBatchFolderImport: (folders: FolderImportJob[]) => void;
  addToQueue: (folders: FolderImportJob[]) => void;
}

const MediaImportContext = createContext<MediaImportContextType | undefined>(undefined);

export function MediaImportProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<FolderImportJob[]>([]);
  const [activeItem, setActiveItem] = useState<FolderImportJob | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [totalFolders, setTotalFolders] = useState(0);
  const [currentFolderIndex, setCurrentFolderIndex] = useState(0);
  const [currentFolderName, setCurrentFolderName] = useState('');
  const [totalImages, setTotalImages] = useState(0);
  const [processedImages, setProcessedImages] = useState(0);
  const [importedCount, setImportedCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [currentProgressPercent, setCurrentProgressPercent] = useState(0);
  const [status, setStatus] = useState<'idle' | 'running' | 'completed' | 'error'>('idle');
  const [errorLogs, setErrorLogs] = useState<string[]>([]);
  const [completedSummary, setCompletedSummary] = useState<
    | {
        totalFolders: number;
        totalImages: number;
        importedCount: number;
        skippedCount: number;
      }
    | undefined
  >(undefined);
  const [isMinimized, setIsMinimized] = useState(false);

  // Mutable refs for persistent background worker (never lost across page route transitions)
  const queueRef = useRef<FolderImportJob[]>([]);
  const isProcessingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null);
  const totalImportedImagesRef = useRef(0);
  const totalSkippedImagesRef = useRef(0);
  const totalFoldersSessionRef = useRef(0);

  const toggleMinimize = useCallback(() => {
    setIsMinimized((prev) => !prev);
  }, []);

  const dismiss = useCallback(() => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
    setStatus('idle');
    setIsImporting(false);
    setIsMinimized(false);
    setCompletedSummary(undefined);
    setImportedCount(0);
    setSkippedCount(0);
    setActiveItem(null);
  }, []);

  const cancelImport = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    queueRef.current = [];
    setQueue([]);
    isProcessingRef.current = false;
    setIsImporting(false);
    setStatus('error');
    setErrorLogs((prev) => [...prev, 'Tiến trình import đã được người dùng dừng lại.']);
  }, []);

  // Worker loop that continuously processes items from queueRef
  const runQueueWorker = useCallback(async () => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsImporting(true);
    setStatus('running');
    setIsMinimized(false);

    while (queueRef.current.length > 0) {
      if (controller.signal.aborted) break;

      const folder = queueRef.current.shift()!;
      setQueue([...queueRef.current]);
      setActiveItem(folder);
      setCurrentFolderIndex((prev) => prev + 1);
      setCurrentFolderName(folder.name || 'Thư mục Drive');
      setTotalImages(0);
      setProcessedImages(0);
      setCurrentProgressPercent(0);

      try {
        const res = await fetch('/api/admin/drive/import-batch?stream=true', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-stream': 'true',
          },
          body: JSON.stringify({
            folders: [{ id: folder.id, name: folder.name }],
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          const errMsg = errData?.error || `Lỗi khi import thư mục "${folder.name}".`;
          setErrorLogs((prev) => [...prev, errMsg]);
          continue;
        }

        if (!res.body) {
          const errMsg = `Trình duyệt không nhận được stream response cho thư mục "${folder.name}".`;
          setErrorLogs((prev) => [...prev, errMsg]);
          continue;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let streamBuffer = '';

        while (true) {
          if (controller.signal.aborted) {
            await reader.cancel().catch(() => null);
            break;
          }

          const { done, value } = await reader.read();
          if (done) break;

          streamBuffer += decoder.decode(value, { stream: true });
          const lines = streamBuffer.split('\n');
          streamBuffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const data = JSON.parse(line);

              if (data.type === 'start') {
                setTotalImages(data.total || 0);
                setProcessedImages(0);
                setCurrentProgressPercent(0);
              } else if (data.type === 'progress') {
                setProcessedImages(data.current || 0);
                if (data.importedCount !== undefined) {
                  setImportedCount(data.importedCount);
                  totalImportedImagesRef.current = data.importedCount;
                }
                if (data.skippedCount !== undefined) {
                  setSkippedCount(data.skippedCount);
                  totalSkippedImagesRef.current = data.skippedCount;
                }
                if (data.total > 0) {
                  const percent = Math.min(
                    100,
                    Math.round(((data.current || 0) / data.total) * 100)
                  );
                  setCurrentProgressPercent(percent);
                }
              } else if (data.type === 'error_item' || data.type === 'error_folder') {
                const itemErr = `[${folder.name}] ${data.fileName || ''}: ${data.error}`;
                setErrorLogs((prev) => [...prev, itemErr]);
              } else if (data.type === 'folder_complete') {
                if (data.importedCount !== undefined) {
                  totalImportedImagesRef.current = data.importedCount;
                  setImportedCount(data.importedCount);
                }
                if (data.skippedCount !== undefined) {
                  totalSkippedImagesRef.current = data.skippedCount;
                  setSkippedCount(data.skippedCount);
                }
                // Partial sync event so active media page can refresh immediately
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(
                    new CustomEvent('media-library-updated', {
                      detail: {
                        folderName: folder.name,
                        importedImages: data.importedCount ?? data.total ?? 0,
                        skippedImages: data.skippedCount ?? 0,
                        isPartial: true,
                      },
                    })
                  );
                }
              } else if (data.type === 'complete') {
                // Entire subfolder tree complete
                if (data.importedCount !== undefined) {
                  totalImportedImagesRef.current = data.importedCount;
                  setImportedCount(data.importedCount);
                } else if (data.totalImages !== undefined) {
                  totalImportedImagesRef.current = data.totalImages;
                  setImportedCount(data.totalImages);
                }
                if (data.skippedCount !== undefined) {
                  totalSkippedImagesRef.current = data.skippedCount;
                  setSkippedCount(data.skippedCount);
                }
              }
            } catch {
              // Ignore non-json line
            }
          }
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          break;
        }
        const msg = `Lỗi xử lý thư mục "${folder.name}": ${err.message || 'Không xác định'}`;
        setErrorLogs((prev) => [...prev, msg]);
      }
    }

    isProcessingRef.current = false;
    setActiveItem(null);
    abortControllerRef.current = null;
    setIsImporting(false);

    if (controller.signal.aborted) {
      return;
    }

    const finalFoldersCount = totalFoldersSessionRef.current;
    const finalImagesCount = totalImportedImagesRef.current;
    const finalSkippedCount = totalSkippedImagesRef.current;

    setStatus('completed');
    setCompletedSummary({
      totalFolders: finalFoldersCount,
      totalImages: finalImagesCount,
      importedCount: finalImagesCount,
      skippedCount: finalSkippedCount,
    });

    // Dispatch global final sync event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('media-library-updated', {
          detail: {
            totalFolders: finalFoldersCount,
            totalImages: finalImagesCount,
            importedCount: finalImagesCount,
            skippedCount: finalSkippedCount,
            isFinal: true,
          },
        })
      );
    }

    // Auto dismiss after 7 seconds
    dismissTimerRef.current = setTimeout(() => {
      dismiss();
    }, 7000);
  }, [dismiss]);

  const addToQueue = useCallback(
    (folders: FolderImportJob[]) => {
      if (!folders || folders.length === 0) return;

      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
        dismissTimerRef.current = null;
      }

      queueRef.current.push(...folders);
      totalFoldersSessionRef.current += folders.length;

      setQueue([...queueRef.current]);
      setTotalFolders(totalFoldersSessionRef.current);

      if (!isProcessingRef.current) {
        runQueueWorker();
      }
    },
    [runQueueWorker]
  );

  const startBatchFolderImport = useCallback(
    (folders: FolderImportJob[]) => {
      if (!folders || folders.length === 0) return;

      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
        dismissTimerRef.current = null;
      }

      // Fresh batch: clear old session counts and error logs
      setErrorLogs([]);
      setCompletedSummary(undefined);
      setImportedCount(0);
      setSkippedCount(0);
      totalImportedImagesRef.current = 0;
      totalSkippedImagesRef.current = 0;
      totalFoldersSessionRef.current = folders.length;

      queueRef.current = [...folders];
      setQueue([...queueRef.current]);
      setTotalFolders(folders.length);
      setCurrentFolderIndex(0);

      // Trigger true server-side background job on VPS (continues even if browser is closed)
      fetch('/api/admin/media/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'google-drive',
          folders: folders.map((f) => ({ id: f.id, name: f.name })),
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('media-job-started'));
            }
          } else {
            // Fallback to client streaming worker if server job creation fails
            runQueueWorker();
          }
        })
        .catch(() => {
          runQueueWorker();
        });
    },
    [runQueueWorker]
  );

  // Clean dismiss timer on unmount, but DO NOT abort background worker on client route changes
  useEffect(() => {
    return () => {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
    };
  }, []);

  return (
    <MediaImportContext.Provider
      value={{
        isImporting,
        queue,
        activeItem,
        totalFolders,
        currentFolderIndex,
        currentFolderName,
        totalImages,
        processedImages,
        importedCount,
        skippedCount,
        currentProgressPercent,
        status,
        errorLogs,
        completedSummary,
        isMinimized,
        toggleMinimize,
        dismiss,
        cancelImport,
        startBatchFolderImport,
        addToQueue,
      }}
    >
      {children}
    </MediaImportContext.Provider>
  );
}

export function useMediaImport() {
  const context = useContext(MediaImportContext);
  if (!context) {
    throw new Error('useMediaImport must be used within a MediaImportProvider');
  }
  return context;
}

// Backward-compatible alias for any components importing useUploadQueue
export const useUploadQueue = useMediaImport;

