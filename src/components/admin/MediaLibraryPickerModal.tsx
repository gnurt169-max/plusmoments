'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Folder,
  FolderOpen,
  Image as ImageIcon,
  Check,
  CheckSquare,
  Square,
  Search,
  RefreshCw,
  Loader2,
  X,
  ChevronRight,
  HardDrive,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { DriveMediaPicker } from '@/components/admin/DriveMediaPicker';

export interface MediaFileItem {
  id: string;
  filename: string;
  name: string;
  url: string;
  size: number;
  formattedSize: string;
  format: string;
  width?: number;
  height?: number;
  createdAt: string;
  modifiedAt: string;
}

export interface MediaFolderItem {
  slug: string;
  name: string;
  path: string;
  imageCount: number;
  totalBytes: number;
  formattedSize: string;
  coverImage?: string | null;
  driveFolderId?: string;
  createdAt: string;
  modifiedAt: string;
}

export interface MediaLibraryPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selected: string[] | string) => void;
  multiple?: boolean;
  title?: string;
  subtitle?: string;
  allowedExtensions?: string[];
  isLogo?: boolean;
}

export function MediaLibraryPickerModal({
  isOpen,
  onClose,
  onSelect,
  multiple = false,
  title = 'Kho Lưu Trữ Media & Thư Mục',
  subtitle = 'Duyệt các thư mục và chọn ảnh WebP đã đồng bộ từ máy chủ.',
  allowedExtensions,
  isLogo,
}: MediaLibraryPickerModalProps) {
  const [loading, setLoading] = useState(false);
  const [folders, setFolders] = useState<MediaFolderItem[]>([]);
  const [allMedia, setAllMedia] = useState<MediaFileItem[]>([]);
  const [activeFolderSlug, setActiveFolderSlug] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected state
  const [singleSelected, setSingleSelected] = useState<string | null>(null);
  const [multiSelected, setMultiSelected] = useState<Set<string>>(new Set());

  // Google Drive secondary picker modal
  const [isDrivePickerOpen, setIsDrivePickerOpen] = useState(false);

  // Fetch media library data
  const fetchLibrary = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/media');
      const data = await res.json();
      if (data.success) {
        setFolders(data.folders || []);
        setAllMedia(data.media || []);
      }
    } catch (err) {
      console.error('Failed to load media library:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLibrary();
      setSingleSelected(null);
      setMultiSelected(new Set());
      setSearchQuery('');
    }
  }, [isOpen]);

  // Current folder object
  const currentFolder = useMemo(() => {
    if (!activeFolderSlug) return null;
    return folders.find((f) => f.slug === activeFolderSlug) || null;
  }, [activeFolderSlug, folders]);

  // Files to display in the current view
  const currentFiles = useMemo(() => {
    let files = allMedia;
    if (activeFolderSlug) {
      files = allMedia.filter((m) =>
        m.url.startsWith(`/uploads/folders/${activeFolderSlug}/`)
      );
    }

    if (allowedExtensions && allowedExtensions.length > 0) {
      const normalized = allowedExtensions.map((e) =>
        e.startsWith('.') ? e.toLowerCase() : `.${e.toLowerCase()}`
      );
      files = files.filter((m) => {
        const lowerUrl = m.url.toLowerCase();
        return normalized.some((ext) => lowerUrl.endsWith(ext));
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      files = files.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.filename.toLowerCase().includes(q) ||
          m.url.toLowerCase().includes(q)
      );
    }

    return files;
  }, [allMedia, activeFolderSlug, searchQuery, allowedExtensions]);

  // Handle single selection toggle
  const handleItemClick = (url: string) => {
    if (multiple) {
      setMultiSelected((prev) => {
        const next = new Set(prev);
        if (next.has(url)) {
          next.delete(url);
        } else {
          next.add(url);
        }
        return next;
      });
    } else {
      setSingleSelected(url);
    }
  };

  // Double click for rapid single select
  const handleDoubleClick = (url: string) => {
    if (!multiple) {
      onSelect(url);
      onClose();
    }
  };

  // Toggle select all in current view (multi mode)
  const handleToggleSelectAll = () => {
    if (currentFiles.length === 0) return;
    const allUrls = currentFiles.map((f) => f.url);
    const areAllSelected = allUrls.every((u) => multiSelected.has(u));

    setMultiSelected((prev) => {
      const next = new Set(prev);
      if (areAllSelected) {
        allUrls.forEach((u) => next.delete(u));
      } else {
        allUrls.forEach((u) => next.add(u));
      }
      return next;
    });
  };

  // Quick select an entire folder
  const handleSelectEntireFolder = (folderSlug: string) => {
    const folderFiles = allMedia.filter((m) =>
      m.url.startsWith(`/uploads/folders/${folderSlug}/`)
    );
    if (folderFiles.length === 0) return;

    if (multiple) {
      setMultiSelected((prev) => {
        const next = new Set(prev);
        folderFiles.forEach((f) => next.add(f.url));
        return next;
      });
    } else {
      setSingleSelected(folderFiles[0].url);
    }
  };

  // Confirm selection
  const handleConfirm = () => {
    if (multiple) {
      onSelect(Array.from(multiSelected));
      onClose();
    } else {
      if (singleSelected) {
        onSelect(singleSelected);
        onClose();
      }
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        subtitle={subtitle}
        maxWidth="max-w-6xl"
      >
        <div className="flex flex-col h-[75vh] max-h-[800px] -mx-6 -my-4">
          {/* TOP TOOLBAR: BREADCRUMBS, SEARCH, DRIVE SYNC */}
          <div className="px-6 py-3.5 bg-stone-50/80 border-b border-stone-200/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setActiveFolderSlug(null)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  !activeFolderSlug
                    ? 'font-semibold text-stone-900 bg-white shadow-2xs border border-stone-200'
                    : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
              >
                <Folder className="w-3.5 h-3.5 text-amber-600" />
                <span>Kho Media Gốc</span>
              </button>

              {currentFolder && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold text-stone-900 bg-white shadow-2xs border border-stone-200">
                    <FolderOpen className="w-3.5 h-3.5 text-amber-600" />
                    <span className="truncate max-w-[200px]">{currentFolder.name}</span>
                    <span className="text-[10px] text-stone-400 font-normal">
                      ({currentFolder.imageCount} ảnh)
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Right Tools: Search & Google Drive Sync */}
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo tên file..."
                  className="pl-8 pr-3 py-1.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400 w-48 sm:w-56"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={fetchLibrary}
                disabled={loading}
                className="p-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 text-stone-600 transition-colors cursor-pointer"
                title="Làm mới danh sách"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>

              <button
                type="button"
                onClick={() => setIsDrivePickerOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-medium transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <HardDrive className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden sm:inline">Đồng Bộ Từ Google Drive</span>
                <span className="sm:hidden">Drive</span>
              </button>
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 text-stone-400 gap-3">
                <Loader2 className="w-7 h-7 animate-spin text-stone-600" />
                <span className="text-xs font-light">Đang tải Kho Lưu Trữ Media...</span>
              </div>
            ) : (
              <>
                {/* ROOT VIEW: FOLDERS LIST */}
                {!activeFolderSlug && folders.length > 0 && !searchQuery && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                      <Folder className="w-3.5 h-3.5 text-amber-600" />
                      <span>Thư Mục Đã Tạo ({folders.length})</span>
                    </h4>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {folders.map((folder) => (
                        <div
                          key={folder.slug}
                          onClick={() => setActiveFolderSlug(folder.slug)}
                          className="group p-3 rounded-2xl border border-stone-200/80 bg-white hover:border-amber-500 hover:bg-amber-50/30 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                        >
                          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-stone-100 border border-stone-100 mb-2.5 flex items-center justify-center">
                            {folder.coverImage ? (
                              <img
                                src={folder.coverImage}
                                alt={folder.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                loading="lazy"
                              />
                            ) : (
                              <Folder className="w-8 h-8 fill-amber-200 text-amber-500" />
                            )}
                            <div className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[10px] font-mono text-white">
                              {folder.imageCount} ảnh
                            </div>
                          </div>

                          <div className="min-w-0">
                            <h5 className="font-serif text-xs font-semibold text-stone-900 group-hover:text-amber-900 truncate">
                              {folder.name}
                            </h5>
                            <p className="text-[10px] text-stone-400 mt-0.5 truncate">
                              {folder.formattedSize}
                            </p>
                          </div>

                          {multiple && folder.imageCount > 0 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectEntireFolder(folder.slug);
                              }}
                              className="mt-2.5 w-full py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/90 rounded-xl text-[10px] font-semibold flex items-center justify-center gap-1 transition-all shadow-2xs cursor-pointer"
                            >
                              <span>📥 Chọn cả thư mục ({folder.imageCount} ảnh)</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* IMAGES GRID */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-stone-600" />
                      <span>
                        {activeFolderSlug
                          ? `Hình Ảnh Trong "${currentFolder?.name || activeFolderSlug}" (${currentFiles.length})`
                          : `Tất Cả Ảnh (${currentFiles.length})`}
                      </span>
                    </h4>

                    {multiple && currentFiles.length > 0 && (
                      <div className="flex items-center gap-2">
                        {activeFolderSlug && (
                          <button
                            type="button"
                            onClick={() => handleSelectEntireFolder(activeFolderSlug)}
                            className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-medium border border-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <span>📁 Chọn hết {currentFiles.length} ảnh</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleToggleSelectAll}
                          className="text-xs text-amber-800 hover:text-amber-900 font-medium flex items-center gap-1.5 cursor-pointer"
                        >
                          {currentFiles.every((f) => multiSelected.has(f.url)) ? (
                            <>
                              <CheckSquare className="w-3.5 h-3.5 text-amber-700" />
                              <span>Bỏ chọn</span>
                            </>
                          ) : (
                            <>
                              <Square className="w-3.5 h-3.5 text-stone-400" />
                              <span>Chọn tất cả</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {currentFiles.length === 0 ? (
                    <div className="text-center py-16 bg-stone-50/50 rounded-2xl border border-dashed border-stone-200 text-stone-400 space-y-2">
                      <ImageIcon className="w-8 h-8 mx-auto text-stone-300" />
                      <p className="text-xs font-light">
                        {searchQuery
                          ? 'Không tìm thấy ảnh nào khớp với từ khóa.'
                          : 'Thư mục này hiện chưa có ảnh nào.'}
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsDrivePickerOpen(true)}
                        className="text-xs text-amber-800 hover:underline inline-flex items-center gap-1 pt-1 font-medium cursor-pointer"
                      >
                        <span>Nhập ảnh từ Google Drive ngay</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {currentFiles.map((file) => {
                        const isSelected = multiple
                          ? multiSelected.has(file.url)
                          : singleSelected === file.url;

                        return (
                          <div
                            key={file.url}
                            onClick={() => handleItemClick(file.url)}
                            onDoubleClick={() => handleDoubleClick(file.url)}
                            className={`group relative rounded-2xl border bg-white overflow-hidden transition-all cursor-pointer flex flex-col ${
                              isSelected
                                ? 'border-amber-600 ring-2 ring-amber-500/30 shadow-md'
                                : 'border-stone-200/80 hover:border-stone-300 hover:shadow-xs'
                            }`}
                          >
                            {/* Checkbox indicator */}
                            <div className="absolute top-2 left-2 z-10">
                              {multiple ? (
                                <div
                                  className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                                    isSelected
                                      ? 'bg-amber-600 text-white shadow-xs'
                                      : 'bg-black/40 backdrop-blur-xs text-transparent group-hover:text-white/60'
                                  }`}
                                >
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </div>
                              ) : isSelected ? (
                                <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-xs">
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </div>
                              ) : null}
                            </div>

                            {/* Format & Size badge */}
                            <div className="absolute top-2 right-2 z-10 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[9px] font-mono text-white">
                              {file.formattedSize}
                            </div>

                            {/* Thumbnail */}
                            <div className="relative aspect-square w-full bg-stone-100 overflow-hidden">
                              <img
                                src={file.url}
                                alt={file.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                loading="lazy"
                              />
                            </div>

                            {/* File info */}
                            <div className="p-2 min-w-0 bg-white">
                              <p className="text-[11px] font-medium text-stone-800 truncate" title={file.name}>
                                {file.name}
                              </p>
                              <div className="flex items-center justify-between text-[9px] text-stone-400 mt-0.5">
                                <span>{file.format}</span>
                                {file.width && file.height && (
                                  <span>{file.width}x{file.height}</span>
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
          </div>

          {/* BOTTOM ACTION BAR */}
          <div className="px-6 py-4 bg-stone-50 border-t border-stone-200/80 flex items-center justify-between shrink-0">
            <div>
              {multiple ? (
                <span className="text-xs font-medium text-stone-700">
                  Đã chọn{' '}
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold font-mono text-xs">
                    {multiSelected.size}
                  </span>{' '}
                  ảnh
                </span>
              ) : singleSelected ? (
                <div className="flex items-center gap-2 text-xs text-stone-600 truncate max-w-md">
                  <Check className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span className="truncate">Đã chọn: <strong className="text-stone-900 font-mono text-[11px]">{singleSelected}</strong></span>
                </div>
              ) : (
                <span className="text-xs text-stone-400 font-light">
                  * Nhấp chuột để chọn ảnh, hoặc nhấp đúp để chọn nhanh.
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-200 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={multiple ? multiSelected.size === 0 : !singleSelected}
                className="px-6 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4 text-amber-400" />
                <span>
                  {multiple
                    ? `Chèn ${multiSelected.size} Ảnh Đã Chọn`
                    : 'Xác Nhận Chọn Ảnh Này'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Google Drive Import Submodal */}
      {isDrivePickerOpen && (
        <DriveMediaPicker
          isOpen={isDrivePickerOpen}
          onClose={() => setIsDrivePickerOpen(false)}
          onSuccess={(convertedUrls) => {
            setIsDrivePickerOpen(false);
            fetchLibrary(); // Auto-refresh media library when Drive sync finishes
            if (convertedUrls && convertedUrls.length > 0) {
              if (multiple) {
                setMultiSelected((prev) => new Set([...Array.from(prev), ...convertedUrls]));
              } else {
                setSingleSelected(convertedUrls[0]);
              }
            }
          }}
          mode={multiple ? 'multiple' : 'single'}
          allowedExtensions={allowedExtensions}
          isLogo={isLogo}
        />
      )}
    </>
  );
}

export default MediaLibraryPickerModal;

