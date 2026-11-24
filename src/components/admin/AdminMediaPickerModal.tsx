'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Search,
  Check,
  Folder,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  FolderHeart,
  Images,
  FileText,
  Layers,
  ChevronRight,
} from 'lucide-react';

export interface MediaItem {
  id: string;
  name: string;
  filename: string;
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
  id: string;
  slug: string;
  name: string;
  path: string;
  isInvitation?: boolean;
  category?: 'album' | 'invitation' | string;
  invitationSlug?: string;
  coupleTitle?: string | null;
  imageCount: number;
  totalBytes: number;
  formattedSize: string;
  coverImage?: string | null;
}

interface AdminMediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selectedUrls: string[], selectedItems: MediaItem[]) => void;
  multiple?: boolean;
  title?: string;
}

export function AdminMediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  multiple = false,
  title = 'Kho Lưu Trữ Media Hệ Thống',
}: AdminMediaPickerModalProps) {
  const [loading, setLoading] = useState(false);
  const [allMedia, setAllMedia] = useState<MediaItem[]>([]);
  const [folders, setFolders] = useState<MediaFolderItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Category filter: 'ALL' | 'INVITATIONS' | 'ALBUMS' | 'SERVICES'
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'INVITATIONS' | 'ALBUMS' | 'SERVICES'>('ALL');
  // Specific invitation subfolder or album subfolder selected
  const [selectedFolderSlug, setSelectedFolderSlug] = useState<string>('ALL');

  // Multi-selection state
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);

  // Fetch media from /api/admin/media
  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/media');
      const data = await res.json();
      if (data.success) {
        setAllMedia(Array.isArray(data.media) ? data.media : []);
        setFolders(Array.isArray(data.folders) ? data.folders : []);
      }
    } catch (err) {
      console.error('Error fetching media:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
      setSelectedUrls([]);
      setSearchTerm('');
      setCategoryFilter('ALL');
      setSelectedFolderSlug('ALL');
    }
  }, [isOpen]);

  // Subfolders under invitations
  const invitationFolders = useMemo(() => {
    return folders.filter((f) => f.isInvitation || f.path.startsWith('/uploads/invitations/'));
  }, [folders]);

  // Subfolders under albums / general
  const albumFolders = useMemo(() => {
    return folders.filter((f) => !f.isInvitation && !f.path.startsWith('/uploads/invitations/'));
  }, [folders]);

  // Filter media items
  const filteredMedia = useMemo(() => {
    return allMedia.filter((item) => {
      // 1. Search Query
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchName = item.name?.toLowerCase().includes(query);
        const matchFilename = item.filename?.toLowerCase().includes(query);
        const matchUrl = item.url?.toLowerCase().includes(query);
        if (!matchName && !matchFilename && !matchUrl) return false;
      }

      // 2. Folder specific selection
      if (selectedFolderSlug !== 'ALL') {
        if (selectedFolderSlug.startsWith('invitation-')) {
          const invSlug = selectedFolderSlug.replace(/^invitation-/, '');
          return item.url.startsWith(`/uploads/invitations/${invSlug}/`);
        }
        return (
          item.url.startsWith(`/uploads/folders/${selectedFolderSlug}/`) ||
          item.url.startsWith(`/uploads/invitations/${selectedFolderSlug}/`)
        );
      }

      // 3. Category filter
      if (categoryFilter === 'INVITATIONS') {
        return item.url.startsWith('/uploads/invitations/');
      }
      if (categoryFilter === 'ALBUMS') {
        return item.url.startsWith('/uploads/folders/');
      }
      if (categoryFilter === 'SERVICES') {
        return (
          !item.url.startsWith('/uploads/invitations/') &&
          !item.url.startsWith('/uploads/folders/')
        );
      }

      return true;
    });
  }, [allMedia, searchTerm, categoryFilter, selectedFolderSlug]);

  // Map item details by url
  const mediaMap = useMemo(() => {
    return new Map(allMedia.map((m) => [m.url, m]));
  }, [allMedia]);

  const handleToggleSelect = (url: string) => {
    if (!multiple) {
      const item = mediaMap.get(url);
      onSelect([url], item ? [item] : []);
      onClose();
      return;
    }

    setSelectedUrls((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    );
  };

  const handleConfirmMultiple = () => {
    const selectedItems = selectedUrls
      .map((url) => mediaMap.get(url))
      .filter(Boolean) as MediaItem[];
    onSelect(selectedUrls, selectedItems);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs animate-fade-in"
    >
      <div className="w-full max-w-5xl h-[90vh] bg-white rounded-3xl border border-stone-200 shadow-2xl flex flex-col overflow-hidden animate-scale-up">
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-stone-200 bg-stone-50/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#8C6D46]/10 text-[#8C6D46] flex items-center justify-center">
              <Images className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-base font-medium text-stone-900 flex items-center gap-2">
                <span>{title}</span>
                {multiple ? (
                  <span className="text-[11px] font-sans font-normal px-2 py-0.5 rounded-full bg-[#8C6D46]/10 text-[#8C6D46] border border-[#8C6D46]/20">
                    Chọn nhiều ảnh
                  </span>
                ) : (
                  <span className="text-[11px] font-sans font-normal px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                    Chọn 1 ảnh
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-stone-500 font-mono">
                {filteredMedia.length} / {allMedia.length} hình ảnh sẵn sàng
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchMedia}
              disabled={loading}
              className="p-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-600 transition-colors"
              title="Làm mới thư viện"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-4 border-b border-stone-200 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          {/* Quick Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên ảnh, tên file, slug..."
              className="w-full h-9 pl-9 pr-3.5 rounded-xl border border-stone-300 bg-stone-50 text-xs focus:outline-none focus:ring-2 focus:ring-[#8C6D46] focus:bg-white transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Group categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
            <button
              type="button"
              onClick={() => {
                setCategoryFilter('ALL');
                setSelectedFolderSlug('ALL');
              }}
              className={`px-3 py-1.5 rounded-xl border font-medium flex items-center gap-1.5 whitespace-nowrap transition-all ${
                categoryFilter === 'ALL' && selectedFolderSlug === 'ALL'
                  ? 'border-[#8C6D46] bg-[#8C6D46] text-white shadow-xs'
                  : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Tất cả</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCategoryFilter('INVITATIONS');
                setSelectedFolderSlug('ALL');
              }}
              className={`px-3 py-1.5 rounded-xl border font-medium flex items-center gap-1.5 whitespace-nowrap transition-all ${
                categoryFilter === 'INVITATIONS'
                  ? 'border-[#8C6D46] bg-[#8C6D46] text-white shadow-xs'
                  : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
              }`}
            >
              <FolderHeart className="w-3.5 h-3.5" />
              <span>Thiệp Cưới Online</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCategoryFilter('ALBUMS');
                setSelectedFolderSlug('ALL');
              }}
              className={`px-3 py-1.5 rounded-xl border font-medium flex items-center gap-1.5 whitespace-nowrap transition-all ${
                categoryFilter === 'ALBUMS'
                  ? 'border-[#8C6D46] bg-[#8C6D46] text-white shadow-xs'
                  : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
              }`}
            >
              <Folder className="w-3.5 h-3.5" />
              <span>Bộ Sưu Tập / Album</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCategoryFilter('SERVICES');
                setSelectedFolderSlug('ALL');
              }}
              className={`px-3 py-1.5 rounded-xl border font-medium flex items-center gap-1.5 whitespace-nowrap transition-all ${
                categoryFilter === 'SERVICES'
                  ? 'border-[#8C6D46] bg-[#8C6D46] text-white shadow-xs'
                  : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Blog & Dịch Vụ</span>
            </button>
          </div>
        </div>

        {/* Subfolder pills if Invitations or Albums selected */}
        {(categoryFilter === 'INVITATIONS' || categoryFilter === 'ALBUMS') && (
          <div className="px-4 py-2 bg-stone-50 border-b border-stone-200 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
            <span className="text-[11px] font-medium text-stone-500 whitespace-nowrap">
              Thư mục con:
            </span>
            <button
              type="button"
              onClick={() => setSelectedFolderSlug('ALL')}
              className={`px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap transition-all ${
                selectedFolderSlug === 'ALL'
                  ? 'bg-stone-800 text-white font-medium'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
              }`}
            >
              Xem tất cả
            </button>

            {categoryFilter === 'INVITATIONS' &&
              invitationFolders.map((f) => {
                const isActive = selectedFolderSlug === f.slug;
                return (
                  <button
                    key={f.slug}
                    type="button"
                    onClick={() => setSelectedFolderSlug(f.slug)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-[#8C6D46] text-white font-medium shadow-xs'
                        : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span>{f.name}</span>
                    <span className="opacity-70 text-[10px]">({f.imageCount})</span>
                  </button>
                );
              })}

            {categoryFilter === 'ALBUMS' &&
              albumFolders.map((f) => {
                const isActive = selectedFolderSlug === f.slug;
                return (
                  <button
                    key={f.slug}
                    type="button"
                    onClick={() => setSelectedFolderSlug(f.slug)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-[#8C6D46] text-white font-medium shadow-xs'
                        : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span>{f.name}</span>
                    <span className="opacity-70 text-[10px]">({f.imageCount})</span>
                  </button>
                );
              })}
          </div>
        )}

        {/* Media Grid Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-stone-400 gap-2 py-16">
              <Loader2 className="w-8 h-8 animate-spin text-[#8C6D46]" />
              <span className="text-xs">Đang tải kho ảnh media...</span>
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-stone-400 gap-2 py-16">
              <ImageIcon className="w-12 h-12 stroke-1 text-stone-300" />
              <span className="text-sm font-medium text-stone-600">Không tìm thấy ảnh phù hợp</span>
              <p className="text-xs text-stone-400">
                Thử đổi từ khóa tìm kiếm hoặc chọn danh mục thư mục khác.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {filteredMedia.map((item) => {
                const isSelected = selectedUrls.includes(item.url);
                return (
                  <div
                    key={item.id || item.url}
                    onClick={() => handleToggleSelect(item.url)}
                    className={`group relative aspect-[3/4] rounded-2xl overflow-hidden border cursor-pointer transition-all duration-200 bg-stone-100 select-none ${
                      isSelected
                        ? 'ring-3 ring-[#8C6D46] border-[#8C6D46] shadow-md scale-[0.98]'
                        : 'border-stone-200 hover:border-stone-400 hover:shadow-xs'
                    }`}
                  >
                    <img
                      src={item.url}
                      alt={item.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Selected badge */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#8C6D46] text-white flex items-center justify-center shadow-md animate-scale-up">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}

                    {/* Meta info at bottom */}
                    <div className="absolute bottom-0 inset-x-0 p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-[11px] font-medium truncate drop-shadow-xs">
                        {item.name || item.filename}
                      </p>
                      <p className="text-[9px] text-stone-200 font-mono drop-shadow-xs">
                        {item.formattedSize}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Actions Footer (Especially for multi-select) */}
        {multiple && (
          <div className="px-5 py-3.5 border-t border-stone-200 bg-stone-50/90 flex items-center justify-between shrink-0">
            <div className="text-xs text-stone-600">
              Đã chọn:{' '}
              <strong className="text-stone-900 font-semibold">{selectedUrls.length}</strong> ảnh
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="h-9 px-4 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-medium transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={selectedUrls.length === 0}
                onClick={handleConfirmMultiple}
                className="h-9 px-4 rounded-xl bg-[#8C6D46] hover:bg-[#725735] text-white text-xs font-semibold transition-colors disabled:opacity-40 flex items-center gap-1.5 shadow-xs"
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Thêm {selectedUrls.length} ảnh đã chọn vào Album</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
