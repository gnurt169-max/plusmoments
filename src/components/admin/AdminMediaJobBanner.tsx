'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  HardDrive,
  UploadCloud,
  Server,
  Sparkles,
} from 'lucide-react';

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
  summary?: {
    totalFiles: number;
    successCount: number;
    skippedCount: number;
    failedCount: number;
  };
}

export function AdminMediaJobBanner() {
  const [jobs, setJobs] = useState<MediaJob[]>([]);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isDismissing, setIsDismissing] = useState<Record<string, boolean>>({});
  const lastCompletedJobIdsRef = useRef<Set<string>>(new Set());
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/media/jobs', { cache: 'no-store' });
      if (!res.ok) return;

      const data = await res.json();
      if (data.success && Array.isArray(data.jobs)) {
        const activeJobs: MediaJob[] = data.jobs;
        setJobs(activeJobs);

        // Detect newly completed jobs to notify media library
        for (const job of activeJobs) {
          if (
            (job.status === 'completed' || job.status === 'failed') &&
            !lastCompletedJobIdsRef.current.has(job.id)
          ) {
            lastCompletedJobIdsRef.current.add(job.id);
            if (typeof window !== 'undefined') {
              window.dispatchEvent(
                new CustomEvent('media-job-completed', { detail: job })
              );
              window.dispatchEvent(new CustomEvent('media-folder-updated'));
            }
          }
        }
      }
    } catch (err) {
      // Ignore network errors during polling
    }
  }, []);

  // Set up dynamic polling
  useEffect(() => {
    fetchJobs();

    // Listen to local job-started event
    const handleJobStarted = () => {
      fetchJobs();
    };
    window.addEventListener('media-job-started', handleJobStarted);

    return () => {
      window.removeEventListener('media-job-started', handleJobStarted);
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    };
  }, [fetchJobs]);

  useEffect(() => {
    if (pollTimerRef.current) clearTimeout(pollTimerRef.current);

    const hasRunningJob = jobs.some((j) => j.status === 'running');
    // Poll every 2.5s if running, otherwise poll every 20s if un-dismissed jobs exist
    const interval = hasRunningJob ? 2500 : jobs.length > 0 ? 20000 : 30000;

    pollTimerRef.current = setTimeout(() => {
      fetchJobs();
    }, interval);

    return () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    };
  }, [jobs, fetchJobs]);

  const handleDismiss = async (jobId: string) => {
    setIsDismissing((prev) => ({ ...prev, [jobId]: true }));
    try {
      await fetch('/api/admin/media/jobs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: jobId, action: 'dismiss' }),
      });
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch {
      // ignore
    } finally {
      setIsDismissing((prev) => ({ ...prev, [jobId]: false }));
    }
  };

  const handleCancel = async (jobId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy tiến trình này trên VPS?')) {
      return;
    }
    try {
      await fetch('/api/admin/media/jobs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: jobId, action: 'cancel' }),
      });
      fetchJobs();
    } catch {
      // ignore
    }
  };

  // If no jobs at all, render nothing
  if (jobs.length === 0) {
    return null;
  }

  // Primary active job (or first in list)
  const primaryJob = jobs[0];
  const percent =
    primaryJob.totalFiles > 0
      ? Math.min(100, Math.round((primaryJob.processedFiles / primaryJob.totalFiles) * 100))
      : primaryJob.status === 'completed'
      ? 100
      : 0;

  // MINIMIZED FLOATING PILL
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
        <div
          onClick={() => setIsMinimized(false)}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md border cursor-pointer transition-all ${
            primaryJob.status === 'running'
              ? 'bg-stone-900/95 text-stone-100 border-[#C5A880]/50 hover:border-[#C5A880]'
              : primaryJob.status === 'completed'
              ? 'bg-emerald-950/95 text-emerald-100 border-emerald-500/50 hover:border-emerald-400'
              : 'bg-red-950/95 text-red-100 border-red-500/50 hover:border-red-400'
          }`}
        >
          {primaryJob.status === 'running' ? (
            <Loader2 className="w-4 h-4 text-[#C5A880] animate-spin shrink-0" />
          ) : primaryJob.status === 'completed' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}

          <div className="text-xs font-medium">
            {primaryJob.status === 'running' ? (
              <span>
                VPS: {primaryJob.folderName} ({primaryJob.processedFiles}/{primaryJob.totalFiles || '?'}) —{' '}
                <strong className="text-[#C5A880]">{percent}%</strong>
              </span>
            ) : primaryJob.status === 'completed' ? (
              <span>
                Đã xong: {primaryJob.folderName} (+{primaryJob.successCount} ảnh)
              </span>
            ) : (
              <span>Có lỗi: {primaryJob.folderName}</span>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(false);
            }}
            className="p-1 hover:text-white rounded-md text-stone-400 transition-colors ml-1"
            title="Mở rộng chi tiết"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // EXPANDED FLOATING STATUS CARD
  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] bg-stone-900/95 text-stone-100 shadow-2xl rounded-2xl border border-[#C5A880]/40 backdrop-blur-md p-4 transition-all duration-300 animate-fade-in font-sans">
      {/* HEADER */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-800">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
              primaryJob.status === 'running'
                ? 'bg-amber-500/20 text-[#C5A880]'
                : primaryJob.status === 'completed'
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-red-500/20 text-red-400'
            }`}
          >
            {primaryJob.status === 'running' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : primaryJob.status === 'completed' ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#C5A880] flex items-center gap-1">
                <Server className="w-3 h-3 inline" />
                {primaryJob.type === 'google-drive' ? 'Google Drive Import' : 'Tải Lên Máy Chủ'}
              </span>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                  primaryJob.status === 'running'
                    ? 'bg-amber-500/20 text-amber-300'
                    : primaryJob.status === 'completed'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-red-500/20 text-red-300'
                }`}
              >
                {primaryJob.status === 'running'
                  ? 'VPS đang chạy ngầm'
                  : primaryJob.status === 'completed'
                  ? 'Hoàn tất'
                  : 'Có lỗi'}
              </span>
            </div>
            <h4 className="text-xs font-semibold text-white truncate max-w-[210px]" title={primaryJob.folderName}>
              {primaryJob.folderName}
            </h4>
          </div>
        </div>

        {/* MINIMIZE & CLOSE BUTTONS */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
            title="Thu nhỏ thanh tiến trình"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          {primaryJob.status !== 'running' && (
            <button
              type="button"
              disabled={isDismissing[primaryJob.id]}
              onClick={() => handleDismiss(primaryJob.id)}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
              title="Đóng thông báo"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* BODY CONTENT */}
      <div className="py-3 space-y-2.5 text-xs">
        {/* PROGRESS BAR */}
        {primaryJob.status === 'running' && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-stone-300 font-mono">
              <span>Tiến độ: {primaryJob.processedFiles} / {primaryJob.totalFiles || '...'} ảnh</span>
              <span className="font-bold text-[#C5A880]">{percent}%</span>
            </div>
            <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-600 via-[#C5A880] to-amber-300 transition-all duration-300 rounded-full"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        )}

        {/* CURRENT FILE BEING PROCESSED */}
        {primaryJob.status === 'running' && primaryJob.currentFileName && (
          <div className="flex items-center gap-1.5 text-[11px] text-stone-400 truncate bg-stone-800/60 p-2 rounded-xl border border-stone-800">
            <Sparkles className="w-3 h-3 text-[#C5A880] shrink-0" />
            <span className="truncate">Đang nén: {primaryJob.currentFileName}</span>
          </div>
        )}

        {/* COMPLETED SUMMARY */}
        {primaryJob.status === 'completed' && (
          <div className="bg-emerald-950/40 border border-emerald-500/30 p-2.5 rounded-xl space-y-1">
            <p className="text-xs font-medium text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Đã hoàn tất xử lý vào thư mục!
            </p>
            <p className="text-[11px] text-stone-300">
              Thêm mới: <strong className="text-white">{primaryJob.successCount} ảnh</strong>
              {primaryJob.skippedCount > 0 && ` | Bỏ qua: ${primaryJob.skippedCount} ảnh đã có`}
              {primaryJob.failedCount > 0 && ` | Lỗi: ${primaryJob.failedCount} ảnh`}
            </p>
          </div>
        )}

        {/* ERROR SUMMARY */}
        {primaryJob.status === 'failed' && (
          <div className="bg-red-950/40 border border-red-500/30 p-2.5 rounded-xl space-y-1">
            <p className="text-xs font-medium text-red-300 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-red-400" />
              Tiến trình gặp lỗi hoặc bị gián đoạn.
            </p>
            {primaryJob.errors.length > 0 && (
              <p className="text-[10px] text-red-200 line-clamp-2">
                {primaryJob.errors[primaryJob.errors.length - 1]}
              </p>
            )}
          </div>
        )}

        {/* PERSISTENT NOTICE */}
        <div className="text-[10px] text-stone-400 bg-stone-950/60 p-2 rounded-xl border border-stone-800 flex items-start gap-1.5">
          <Server className="w-3 h-3 text-[#C5A880] shrink-0 mt-0.5" />
          <span>
            {primaryJob.status === 'running'
              ? 'Tiến trình đang chạy ngầm trên VPS. Bạn có thể tắt máy hoặc đổi thiết bị, hệ thống vẫn tự động hoàn tất 100%.'
              : 'Dữ liệu đã được lưu trữ an toàn trong Kho Media.'}
          </span>
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-xs">
        {primaryJob.status === 'running' ? (
          <button
            type="button"
            onClick={() => handleCancel(primaryJob.id)}
            className="text-[11px] text-red-400 hover:text-red-300 transition-colors"
          >
            Hủy tác vụ
          </button>
        ) : (
          <button
            type="button"
            disabled={isDismissing[primaryJob.id]}
            onClick={() => handleDismiss(primaryJob.id)}
            className="w-full py-1.5 bg-[#C5A880] hover:bg-[#b0936b] text-charcoal-900 font-medium text-[11px] rounded-xl transition-colors text-center"
          >
            {isDismissing[primaryJob.id] ? 'Đang đóng...' : 'Đã hiểu / Đóng thông báo'}
          </button>
        )}
      </div>
    </div>
  );
}
