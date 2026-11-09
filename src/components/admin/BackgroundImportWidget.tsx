'use client';

import React from 'react';
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
} from 'lucide-react';
import { useMediaImport } from '@/context/MediaImportContext';

export function BackgroundImportWidget() {
  const {
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
  } = useMediaImport();

  if (status === 'idle') {
    return null;
  }

  // MINIMIZED STATE (Compact Pill)
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 bg-charcoal-900/95 text-white px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md border border-luxury-500/30 flex items-center gap-3 animate-fade-in text-xs font-medium cursor-pointer hover:border-luxury-400 transition-all">
        <div className="flex items-center gap-2" onClick={toggleMinimize}>
          {status === 'running' && (
            <Loader2 className="w-4 h-4 text-luxury-400 animate-spin shrink-0" />
          )}
          {status === 'completed' && (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          {status === 'error' && (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}

          <span>
            {status === 'running' &&
              `Drive: ${currentFolderName || 'Đang nén'} (${currentFolderIndex}/${totalFolders}) - ${currentProgressPercent}%`}
            {status === 'completed' &&
              `Đã xong! +${completedSummary?.importedCount ?? completedSummary?.totalImages ?? 0} mới | Bỏ qua ${completedSummary?.skippedCount ?? 0} trùng`}
            {status === 'error' && 'Đồng bộ gặp lỗi'}
          </span>
        </div>

        <div className="flex items-center gap-1 border-l border-stone-700 pl-2">
          <button
            type="button"
            onClick={toggleMinimize}
            className="p-1 hover:text-luxury-300 rounded-md transition-colors"
            title="Mở rộng chi tiết"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="p-1 text-stone-400 hover:text-white rounded-md transition-colors"
            title="Đóng widget"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // EXPANDED STATE (Floating Drawer Card)
  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-stone-900 shadow-2xl rounded-2xl border border-stone-200/90 dark:border-stone-800 p-4 transition-all duration-300 animate-fade-in-up font-sans text-charcoal-900 dark:text-stone-100">
      {/* HEADER */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center gap-2">
          {status === 'running' && (
            <div className="w-6 h-6 rounded-lg bg-luxury-100 dark:bg-luxury-900/60 flex items-center justify-center text-luxury-700 dark:text-luxury-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            </div>
          )}
          {status === 'completed' && (
            <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          )}
          {status === 'error' && (
            <div className="w-6 h-6 rounded-lg bg-red-100 dark:bg-red-950 flex items-center justify-center text-red-600 dark:text-red-400">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
          )}

          <div>
            <h4 className="text-xs font-semibold text-charcoal-900 dark:text-white leading-tight">
              {status === 'running' && 'Đang Đồng Bộ Google Drive...'}
              {status === 'completed' && 'Đã Đồng Bộ Thành Công!'}
              {status === 'error' && 'Đồng Bộ Gặp Trục Trặc'}
            </h4>
            <p className="text-[10px] text-stone-400 font-light">
              {status === 'running' && 'Xử lý ngầm, bạn có thể tự do chuyển trang'}
              {status === 'completed' && 'Ảnh WebP đã sẵn sàng trong Media Library'}
              {status === 'error' && 'Vui lòng kiểm tra lại kết nối hoặc Google Drive'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleMinimize}
            className="p-1 text-stone-400 hover:text-charcoal-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
            title="Thu nhỏ tiến trình"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="p-1 text-stone-400 hover:text-charcoal-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
            title="Đóng thông báo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* BODY ACCORDING TO STATUS */}
      <div className="pt-3 space-y-3">
        {status === 'running' && (
          <>
            {/* Folder Name & Counter */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-charcoal-800 dark:text-stone-200 truncate max-w-[200px]" title={currentFolderName}>
                  📁 {currentFolderName || 'Đang tải thư mục...'}
                </span>
                <span className="text-[11px] font-mono text-luxury-700 dark:text-luxury-400 font-semibold shrink-0">
                  Thư mục {currentFolderIndex}/{totalFolders}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-luxury-600 via-amber-500 to-luxury-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(5, currentProgressPercent)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 font-mono">
                <span>
                  Đang nén WebP: {processedImages}/{totalImages} ảnh
                </span>
                <span className="font-semibold text-charcoal-900 dark:text-white">
                  {currentProgressPercent}%
                </span>
              </div>

              {/* Live Dual Counters: Imported vs Skipped */}
              <div className="flex items-center gap-2 pt-0.5">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800 text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Thành công: <strong>{importedCount}</strong> ảnh</span>
                </div>
                {skippedCount > 0 && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800 text-[10px] font-medium text-amber-700 dark:text-amber-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>Trùng lặp bỏ qua: <strong>{skippedCount}</strong> ảnh</span>
                  </div>
                )}
              </div>

              {queue.length > 0 && (
                <div className="text-[10px] text-stone-400 dark:text-stone-500 truncate pt-0.5" title={queue.map((q) => q.name).join(', ')}>
                  <span>Hàng đợi chờ: </span>
                  <span className="font-medium text-stone-600 dark:text-stone-300">
                    {queue.length} thư mục ({queue.map((q) => q.name).join(', ')})
                  </span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-stone-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-luxury-500" />
                <span>Nén ảnh 2048px tự động</span>
              </span>

              <button
                type="button"
                onClick={cancelImport}
                className="text-[11px] text-red-500 hover:text-red-700 hover:underline cursor-pointer"
              >
                Hủy bỏ
              </button>
            </div>
          </>
        )}

        {status === 'completed' && (
          <div className="space-y-3">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs space-y-2">
              <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                🎉 Hoàn tất đồng bộ toàn bộ thư mục!
              </p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                Đã hoàn tất đồng bộ <strong>{completedSummary?.totalFolders || totalFolders} thư mục</strong>:
              </p>
              <div className="flex flex-wrap gap-2 pt-0.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 font-medium text-[11px]">
                  ✓ Thêm mới: <strong>{completedSummary?.importedCount ?? completedSummary?.totalImages ?? importedCount} ảnh</strong>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 font-medium text-[11px]">
                  ⚠ Bỏ qua: <strong>{completedSummary?.skippedCount ?? skippedCount} ảnh đã tồn tại</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={dismiss}
                className="px-4 py-1.5 bg-charcoal-900 hover:bg-black dark:bg-stone-100 dark:hover:bg-white text-white dark:text-charcoal-900 rounded-xl text-xs font-medium transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-3">
            <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl text-xs space-y-1">
              <p className="font-semibold text-red-800 dark:text-red-300">
                Đã xảy ra lỗi trong quá trình import:
              </p>
              <div className="max-h-24 overflow-y-auto space-y-1 pr-1 text-[11px] text-red-700 dark:text-red-400 font-mono">
                {errorLogs.map((log, idx) => (
                  <p key={idx}>• {log}</p>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={dismiss}
                className="px-4 py-1.5 bg-stone-200 hover:bg-stone-300 text-charcoal-800 rounded-xl text-xs font-medium transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

