'use client';

import React, { useState, useRef } from 'react';
import {
  Image as ImageIcon,
  FolderOpen,
  RefreshCw,
  Trash2,
  Plus,
  X,
  Upload,
  Loader2,
} from 'lucide-react';
import { MediaLibraryPickerModal } from './MediaLibraryPickerModal';

// ============================================================================
// 1. SINGLE IMAGE PICKER FIELD
// ============================================================================
export interface SingleImagePickerProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  helperText?: string;
  aspectRatio?: 'video' | 'portrait' | 'square' | 'auto';
  required?: boolean;
  modalTitle?: string;
  placeholder?: string;
  allowedExtensions?: string[];
  accept?: string;
  allowDirectUpload?: boolean;
  uploadEndpoint?: string;
  isLogo?: boolean;
  defaultOrientation?: 'all' | 'landscape' | 'portrait';
}

export function SingleImagePicker({
  value,
  onChange,
  label,
  helperText,
  aspectRatio = 'video',
  required = false,
  modalTitle = 'Chọn Ảnh Từ Kho Media',
  allowedExtensions,
  accept,
  allowDirectUpload = false,
  uploadEndpoint = '/api/admin/settings/upload-logo',
  isLogo = false,
  defaultOrientation,
}: SingleImagePickerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const effectiveAllowedExts = allowedExtensions || (isLogo ? ['png', 'svg'] : undefined);
  const effectiveAccept = accept || (isLogo ? '.png,.svg,image/png,image/svg+xml' : 'image/*');

  const aspectClass = {
    video: 'aspect-video max-h-56',
    portrait: 'aspect-[3/4] max-h-64',
    square: 'aspect-square max-h-48',
    auto: 'h-40',
  }[aspectRatio];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so same file can be re-uploaded if needed
    e.target.value = '';
    setUploadError(null);

    // Extension check
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (effectiveAllowedExts && ext && !effectiveAllowedExts.includes(ext)) {
      setUploadError(`Định dạng không hợp lệ. Chỉ chấp nhận: ${effectiveAllowedExts.join(', ').toUpperCase()}`);
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(uploadEndpoint, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Tải file lên thất bại.');
      }

      onChange(data.url);
    } catch (err: any) {
      setUploadError(err.message || 'Lỗi khi tải file lên máy chủ.');
    } finally {
      setIsUploading(false);
    }
  };

  // Auto infer default orientation if not explicitly provided
  const effectiveOrientation =
    defaultOrientation ||
    (aspectRatio === 'video' ||
    modalTitle.toLowerCase().includes('banner') ||
    modalTitle.toLowerCase().includes('hero') ||
    label?.toLowerCase().includes('banner') ||
    label?.toLowerCase().includes('hero')
      ? 'landscape'
      : aspectRatio === 'portrait'
      ? 'portrait'
      : 'all');

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-xs uppercase tracking-wider text-stone-600 font-medium block">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Hidden native file input for direct uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept={effectiveAccept}
        onChange={handleFileChange}
        className="hidden"
      />

      {!value ? (
        // DASHED EMPTY STATE BOX
        <div className="border-2 border-dashed border-stone-300 hover:border-amber-600/70 bg-stone-50/60 rounded-2xl p-5 text-center transition-all flex flex-col items-center justify-center gap-3 min-h-[140px]">
          {isUploading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-4">
              <Loader2 className="w-6 h-6 animate-spin text-amber-700" />
              <span className="text-xs font-semibold text-stone-800">Đang tải file lên...</span>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-white border border-stone-200/80 text-stone-400 flex items-center justify-center shadow-2xs">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-stone-800 block">
                  {isLogo ? 'Chưa có logo nhận diện' : 'Chưa chọn hình ảnh'}
                </span>
                <span className="text-[11px] text-stone-400 font-light block">
                  {isLogo
                    ? 'Chỉ chấp nhận định dạng .PNG tách nền hoặc vector .SVG'
                    : 'Tải lên trực tiếp hoặc chọn từ Kho Media'}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                {allowDirectUpload && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-700" />
                    <span>Tải từ máy</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-stone-500" />
                  <span>Kho Media / Drive</span>
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        // SELECTED PREVIEW BOX WITH LUXURY OVERLAY ACTIONS
        <div className="relative group rounded-2xl overflow-hidden border border-stone-200/90 bg-stone-900 shadow-sm">
          <div
            className={`relative w-full ${isLogo ? 'h-32' : aspectClass} overflow-hidden flex items-center justify-center ${
              isLogo
                ? 'bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] bg-stone-100 p-4'
                : 'bg-stone-100'
            }`}
          >
            <img
              src={value}
              alt="Selected Preview"
              className={
                isLogo
                  ? 'max-h-24 max-w-full object-contain drop-shadow-sm'
                  : 'w-full h-full object-cover transition-transform duration-500 group-hover:scale-102'
              }
            />
          </div>

          {/* Action Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 backdrop-blur-2xs transition-opacity flex items-center justify-center gap-2 p-3">
            {allowDirectUpload && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl bg-white text-stone-900 text-xs font-semibold shadow-md hover:bg-stone-100 transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
                title="Tải file khác từ máy tính"
              >
                <Upload className="w-3.5 h-3.5 text-amber-700" />
                <span>Từ máy</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-white text-stone-900 text-xs font-semibold shadow-md hover:bg-stone-100 transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
              title="Chọn từ Media hoặc Google Drive"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-700" />
              <span>Media/Drive</span>
            </button>

            <button
              type="button"
              onClick={() => onChange('')}
              className="px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-semibold shadow-md hover:bg-red-700 transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
              title="Xóa logo này"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa</span>
            </button>
          </div>

          {/* URL Badge underneath */}
          <div className="px-3 py-1.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-500">
            <span className="truncate max-w-[70%] font-mono text-[10px]">{value}</span>
            <div className="flex items-center gap-2">
              {allowDirectUpload && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-amber-800 hover:text-amber-900 font-medium cursor-pointer shrink-0 text-[10px]"
                >
                  Tải máy
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="text-stone-600 hover:text-stone-900 font-medium cursor-pointer shrink-0 text-[10px]"
              >
                Media/Drive
              </button>
            </div>
          </div>
        </div>
      )}

      {uploadError && (
        <p className="text-[11px] text-red-600 font-medium">{uploadError}</p>
      )}

      {helperText && (
        <p className="text-[10px] text-stone-400 font-light">{helperText}</p>
      )}

      {/* Media Picker Modal */}
      {isModalOpen && (
        <MediaLibraryPickerModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSelect={(selected) => {
            if (typeof selected === 'string') {
              onChange(selected);
            } else if (Array.isArray(selected) && selected.length > 0) {
              onChange(selected[0]);
            }
          }}
          multiple={false}
          title={modalTitle}
          allowedExtensions={effectiveAllowedExts}
          isLogo={isLogo}
          defaultOrientation={effectiveOrientation}
        />
      )}
    </div>
  );
}

// ============================================================================
// 2. MULTI IMAGE PICKER FIELD (GALLERY / DEMO IMAGES)
// ============================================================================
export interface MultiImagePickerProps {
  values: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  helperText?: string;
  modalTitle?: string;
  defaultOrientation?: 'all' | 'landscape' | 'portrait';
}

export function MultiImagePicker({
  values,
  onChange,
  label = 'Bộ Sưu Tập Hình Ảnh',
  helperText,
  modalTitle = 'Chọn Ảnh Cho Bộ Sưu Tập',
  defaultOrientation = 'all',
}: MultiImagePickerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRemove = (indexToRemove: number) => {
    onChange(values.filter((_, idx) => idx !== indexToRemove));
  };

  const handleAddMultiple = (newUrls: string[]) => {
    // Avoid duplicate URLs and maintain order
    const set = new Set(values);
    newUrls.forEach((u) => set.add(u));
    onChange(Array.from(set));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs uppercase tracking-wider text-stone-600 font-medium flex items-center gap-2">
          <span>{label}</span>
          <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[10px] font-mono font-bold">
            {values.length} ảnh
          </span>
        </label>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-amber-700" />
          <span>Thêm Ảnh Từ Kho Media</span>
        </button>
      </div>

      {values.length === 0 ? (
        // DASHED EMPTY STATE BOX
        <div
          onClick={() => setIsModalOpen(true)}
          className="group border-2 border-dashed border-stone-300 hover:border-amber-600 bg-stone-50/60 hover:bg-amber-50/30 rounded-2xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2"
        >
          <div className="w-10 h-10 rounded-xl bg-white group-hover:bg-amber-100/60 border border-stone-200 group-hover:border-amber-300 text-stone-400 group-hover:text-amber-800 flex items-center justify-center transition-colors shadow-2xs">
            <ImageIcon className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-stone-800 group-hover:text-amber-900">
            Chưa có ảnh nào trong danh sách
          </span>
          <span className="text-[11px] text-stone-400 font-light">
            Nhấp vào đây để mở Kho Media và tích chọn nhiều ảnh cùng lúc
          </span>
        </div>
      ) : (
        // GRID OF SELECTED IMAGES
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5 p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
          {values.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="relative group aspect-square rounded-xl overflow-hidden bg-stone-200 border border-stone-300/80 shadow-2xs"
            >
              <img
                src={url}
                alt={`Image ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                loading="lazy"
              />

              {/* Order number badge */}
              <div className="absolute top-1 left-1 w-5 h-5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] font-mono text-white flex items-center justify-center font-bold">
                {index + 1}
              </div>

              {/* Delete button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(index);
                }}
                className="absolute top-1 right-1 w-5 h-5 rounded-md bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title="Xóa ảnh này"
              >
                <X className="w-3 h-3 stroke-[3]" />
              </button>
            </div>
          ))}

          {/* "+ Add more" small card */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="aspect-square rounded-xl border-2 border-dashed border-stone-300 hover:border-amber-600 bg-white hover:bg-amber-50/40 text-stone-400 hover:text-amber-800 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span className="text-[10px] font-semibold uppercase">Thêm</span>
          </button>
        </div>
      )}

      {helperText && (
        <p className="text-[10px] text-stone-400 font-light">{helperText}</p>
      )}

      {/* Media Picker Modal */}
      {isModalOpen && (
        <MediaLibraryPickerModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSelect={(selected) => {
            if (Array.isArray(selected)) {
              handleAddMultiple(selected);
            } else if (typeof selected === 'string' && selected) {
              handleAddMultiple([selected]);
            }
          }}
          multiple={true}
          title={modalTitle}
          defaultOrientation={defaultOrientation}
        />
      )}
    </div>
  );
}

