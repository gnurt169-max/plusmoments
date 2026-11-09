'use client';

import React, { useState, useEffect } from 'react';
import {
  Folder,
  Home,
  ChevronRight,
  Image as ImageIcon,
  Check,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  ExternalLink,
  HardDrive,
  FileCheck2,
  FolderDown,
  CheckSquare,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useMediaImport } from '@/context/MediaImportContext';

export interface DriveFolder {
  id: string;
  name: string;
  mimeType: 'application/vnd.google-apps.folder';
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink: string;
  thumbnailUrl?: string;
  directThumbnail?: string;
  size?: number;
}

export interface ConvertedWebPFile {
  id: string;
  originalName: string;
  url: string;
  filename: string;
  size: number;
  width: number;
  height: number;
}

export interface BreadcrumbItem {
  id: string;
  name: string;
}

interface DriveMediaPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (convertedWebpUrls: string[], items: ConvertedWebPFile[]) => void;
  mode?: 'single' | 'multiple';
  title?: string;
  allowedExtensions?: string[];
  isLogo?: boolean;
}

export function DriveMediaPicker({
  isOpen,
  onClose,
  onSuccess,
  mode = 'single',
  title,
  allowedExtensions,
  isLogo,
}: DriveMediaPickerProps) {
  // Background Media Import context
  const { startBatchFolderImport } = useMediaImport();

  // State: Google Drive Explorer - strictly empty by default
  const [driveUrlInput, setDriveUrlInput] = useState('');
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [images, setImages] = useState<DriveFile[]>([]);
  const [selectedFolders, setSelectedFolders] = useState<DriveFolder[]>([]);
  const [selectedDriveIds, setSelectedDriveIds] = useState<string[]>([]);
  const [driveSearchQuery, setDriveSearchQuery] = useState('');
  const [driveLoading, setDriveLoading] = useState(false);
  const [importingSingleBatch, setImportingSingleBatch] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useState('');
  const [rootFolderId, setRootFolderId] = useState('');
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasScanned, setHasScanned] = useState(false);

  // Fetch Drive folder content from API
  const fetchDriveFolderContent = async (targetFolderIdOrUrl?: string, folderName?: string) => {
    try {
      setDriveLoading(true);
      setErrorMessage('');

      const queryParams = new URLSearchParams();
      if (targetFolderIdOrUrl) {
        queryParams.set('parentFolderId', targetFolderIdOrUrl.trim());
      }
      if (isLogo) queryParams.set('isLogo', 'true');
      if (allowedExtensions && allowedExtensions.length > 0) {
        queryParams.set('allowedExtensions', allowedExtensions.join(','));
      }

      const url = `/api/admin/drive/files?${queryParams.toString()}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        // Double-check filtering out any ghost or shadow files (._, ., 0 bytes)
        const safeImages: DriveFile[] = (data.images || data.files || []).filter(
          (img: DriveFile) => {
            const n = img.name || '';
            if (n.startsWith('._') || n.startsWith('.') || n.includes('.DS_Store')) return false;
            if (img.size !== undefined && img.size <= 0) return false;
            return true;
          }
        );

        const safeFolders: DriveFolder[] = (data.folders || []).filter(
          (f: DriveFolder) => !f.name.startsWith('.') && !f.name.startsWith('._')
        );

        setFolders(safeFolders);
        setImages(safeImages);
        setCurrentFolderId(data.folderId || targetFolderIdOrUrl || '');
        if (data.rootFolderId) setRootFolderId(data.rootFolderId);
        setHasScanned(true);

        // Update Breadcrumbs
        if (!targetFolderIdOrUrl || targetFolderIdOrUrl === data.rootFolderId) {
          setBreadcrumbs([
            {
              id: data.rootFolderId || data.folderId,
              name: data.currentFolder?.name || 'Thư mục gốc Studio',
            },
          ]);
        } else {
          setBreadcrumbs((prev) => {
            const existingIndex = prev.findIndex((b) => b.id === targetFolderIdOrUrl);
            if (existingIndex >= 0) {
              return prev.slice(0, existingIndex + 1);
            }
            return [
              ...prev,
              {
                id: targetFolderIdOrUrl,
                name: folderName || data.currentFolder?.name || 'Thư mục con',
              },
            ];
          });
        }
      } else {
        setFolders([]);
        setImages([]);
        setBreadcrumbs([]);
        setErrorMessage(
          data.error ||
            'Không thể truy cập thư mục Google Drive này. Vui lòng kiểm tra lại quyền chia sẻ liên kết.'
        );
      }
    } catch (err: any) {
      setFolders([]);
      setImages([]);
      setBreadcrumbs([]);
      setErrorMessage(err.message || 'Lỗi kết nối khi duyệt thư mục Drive.');
    } finally {
      setDriveLoading(false);
    }
  };

  // Initial load when modal opens - strictly clean state
  useEffect(() => {
    if (isOpen) {
      setSelectedFolders([]);
      setSelectedDriveIds([]);
      setDriveSearchQuery('');
      setErrorMessage('');
      setFolders([]);
      setImages([]);
      setBreadcrumbs([]);
      setCurrentFolderId('');
      setRootFolderId('');
      setHasScanned(false);

      // Check if there is already a configured Drive folder URL in Settings
      fetch('/api/admin/drive/files')
        .then((r) => r.json())
        .then((data) => {
          if (data.configuredFolderUrl) {
            setDriveUrlInput(data.configuredFolderUrl);
            // If already configured and accessible, scan automatically
            if (data.success && (data.folders?.length > 0 || data.images?.length > 0)) {
              setFolders(data.folders || []);
              setImages(data.images || []);
              setCurrentFolderId(data.folderId || '');
              if (data.rootFolderId) setRootFolderId(data.rootFolderId);
              setBreadcrumbs([
                {
                  id: data.rootFolderId || data.folderId,
                  name: data.currentFolder?.name || 'Thư mục gốc Studio',
                },
              ]);
              setHasScanned(true);
            }
          } else {
            setDriveUrlInput('');
          }
        })
        .catch(() => {
          setDriveUrlInput('');
        });
    }
  }, [isOpen]);

  // Click "Quét Thư Mục"
  const handleScanDrive = () => {
    const trimmed = driveUrlInput.trim();
    if (!trimmed) {
      setErrorMessage('Vui lòng dán link thư mục Google Drive hoặc Folder ID tại ô nhập.');
      return;
    }
    setSelectedFolders([]);
    setSelectedDriveIds([]);
    setDriveSearchQuery('');
    setBreadcrumbs([]);
    fetchDriveFolderContent(trimmed);
  };

  // Click on subfolder to drill down
  const handleFolderClick = (subfolder: DriveFolder) => {
    setSelectedFolders([]);
    setSelectedDriveIds([]);
    setDriveSearchQuery('');
    fetchDriveFolderContent(subfolder.id, subfolder.name);
  };

  // Breadcrumb navigation
  const handleBreadcrumbClick = (crumb: BreadcrumbItem) => {
    if (crumb.id === currentFolderId) return;
    setSelectedFolders([]);
    setSelectedDriveIds([]);
    setDriveSearchQuery('');
    fetchDriveFolderContent(crumb.id, crumb.name);
  };

  // Toggle single image selection
  const toggleDriveSelect = (file: DriveFile) => {
    if (mode === 'single') {
      setSelectedDriveIds([file.id]);
    } else {
      setSelectedDriveIds((prev) =>
        prev.includes(file.id) ? prev.filter((id) => id !== file.id) : [...prev, file.id]
      );
    }
  };

  // Toggle folder selection for batch import
  const toggleFolderSelect = (folder: DriveFolder, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedFolders((prev) =>
      prev.some((f) => f.id === folder.id)
        ? prev.filter((f) => f.id !== folder.id)
        : [...prev, folder]
    );
  };

  const filteredDriveFolders = folders.filter((f) =>
    f.name.toLowerCase().includes(driveSearchQuery.toLowerCase().trim())
  );

  const filteredDriveImages = images.filter((img) =>
    img.name.toLowerCase().includes(driveSearchQuery.toLowerCase().trim())
  );

  // Select all / Deselect all folders
  const handleSelectAllFolders = () => {
    if (
      selectedFolders.length === filteredDriveFolders.length &&
      filteredDriveFolders.length > 0
    ) {
      setSelectedFolders([]);
    } else {
      setSelectedFolders([...filteredDriveFolders]);
    }
  };

  // Select all / Deselect all images in current folder
  const handleSelectAllDriveInFolder = () => {
    const currentFilteredIds = filteredDriveImages.map((img) => img.id);
    const allSelected = currentFilteredIds.every((id) => selectedDriveIds.includes(id));

    if (allSelected) {
      setSelectedDriveIds((prev) => prev.filter((id) => !currentFilteredIds.includes(id)));
    } else {
      setSelectedDriveIds((prev) => Array.from(new Set([...prev, ...currentFilteredIds])));
    }
  };

  // START BACKGROUND IMPORT FOR SELECTED MULTIPLE FOLDERS
  const handleStartBatchFolderImport = () => {
    if (selectedFolders.length === 0) return;

    startBatchFolderImport(
      selectedFolders.map((f) => ({
        id: f.id,
        name: f.name,
      }))
    );

    setSelectedFolders([]);
    onClose();
  };

  // START BACKGROUND IMPORT FOR CURRENT FOLDER
  const handleImportCurrentFolderBackground = () => {
    if (!currentFolderId) return;

    const currentFolderName =
      breadcrumbs[breadcrumbs.length - 1]?.name || 'Thư mục Drive';

    startBatchFolderImport([
      {
        id: currentFolderId,
        name: currentFolderName,
      },
    ]);

    onClose();
  };

  // DIRECT CONVERSION FOR INDIVIDUALLY SELECTED IMAGES (FOR PACKAGES / ALBUMS FORMS)
  const handleImportSingleWebP = async () => {
    if (selectedDriveIds.length === 0) return;

    setImportingSingleBatch(true);
    setErrorMessage('');

    try {
      const selectedFiles = images.filter((f) => selectedDriveIds.includes(f.id));

      const res = await fetch('/api/admin/drive/import-webp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: selectedFiles.map((f) => ({
            id: f.id,
            name: f.name,
            size: f.size,
            mimeType: f.mimeType,
          })),
          isLogo: Boolean(isLogo),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Lỗi khi nén ảnh sang WebP.');
      }

      const importedItems: ConvertedWebPFile[] = data.imported || [];
      const urls = importedItems.map((item) => item.url);

      onSuccess(urls, importedItems);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi trong quá trình xử lý convert WebP.');
    } finally {
      setImportingSingleBatch(false);
    }
  };

  const modalTitle =
    title ||
    (mode === 'single'
      ? 'Đồng Bộ 01 Ảnh Từ Google Drive'
      : 'Đồng Bộ Ảnh & Thư Mục Từ Google Drive');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-4xl"
      title={modalTitle}
      subtitle="Nhập liên kết Google Drive công khai để quét ảnh hoặc thư mục cần đồng bộ vào hệ thống"
    >
      <div className="space-y-4">
        {/* ERROR NOTIFICATION */}
        {errorMessage && (
          <div className="p-3.5 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs flex items-center gap-2.5 animate-fade-in font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* DRIVE INPUT SECTION */}
        <div className="bg-stone-50/90 p-3.5 rounded-2xl border border-stone-200 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-charcoal-700 flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-amber-600" />
              <span>Nguồn Google Drive</span>
            </label>
            {currentFolderId && (
              <a
                href={`https://drive.google.com/drive/folders/${currentFolderId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-luxury-700 hover:underline flex items-center gap-1 font-mono px-2 py-0.5 bg-luxury-50 rounded-lg border border-luxury-200"
                title="Mở thư mục này trực tiếp trên Google Drive"
              >
                <span>ID: {currentFolderId.slice(0, 8)}...</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={driveUrlInput}
              onChange={(e) => setDriveUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleScanDrive();
                }
              }}
              placeholder="Dán link thư mục Google Drive (chia sẻ công khai) hoặc Folder ID tại đây..."
              className="flex-1 px-3.5 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-luxury-400 font-mono text-charcoal-900 placeholder:text-stone-400"
            />
            <button
              type="button"
              onClick={handleScanDrive}
              disabled={driveLoading || !driveUrlInput.trim()}
              className="px-4 py-2 bg-luxury-600 hover:bg-luxury-700 active:scale-95 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {driveLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang Quét...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Quét Thư Mục</span>
                </>
              )}
            </button>
          </div>

          <p className="text-[11px] text-stone-500 flex items-center gap-1.5 font-light">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Vui lòng đảm bảo thư mục Google Drive đã được bật quyền "Bất kỳ ai có đường liên kết đều có thể xem".</span>
          </p>
        </div>

        {/* BREADCRUMBS NAVIGATION BAR */}
        {breadcrumbs.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs overflow-x-auto py-2 px-3 bg-stone-100/80 rounded-xl border border-stone-200">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <React.Fragment key={crumb.id}>
                  {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />}
                  <button
                    type="button"
                    onClick={() => handleBreadcrumbClick(crumb)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                      isLast
                        ? 'bg-white text-luxury-900 shadow-xs border border-stone-300 font-semibold'
                        : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-white/80'
                    }`}
                  >
                    {idx === 0 ? (
                      <Home className="w-3.5 h-3.5 text-luxury-600" />
                    ) : (
                      <Folder className="w-3.5 h-3.5 fill-amber-400 text-amber-600" />
                    )}
                    <span>{crumb.name}</span>
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* TOOLBAR (SEARCH & ACTIONS - SHOWN WHEN ITEMS EXIST) */}
        {hasScanned && (folders.length > 0 || images.length > 0) && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-stone-50 p-3 rounded-2xl border border-stone-200">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={driveSearchQuery}
                onChange={(e) => setDriveSearchQuery(e.target.value)}
                placeholder="Tìm theo tên thư mục hoặc tên file ảnh trong thư mục này..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-luxury-400 font-light"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {/* Batch Folders Select All */}
              {filteredDriveFolders.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectAllFolders}
                  className={`px-3 py-1.5 border rounded-xl text-xs font-medium transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5 ${
                    selectedFolders.length > 0 &&
                    selectedFolders.length === filteredDriveFolders.length
                      ? 'bg-amber-100 border-amber-300 text-amber-900'
                      : 'bg-white border-stone-200 text-charcoal-700 hover:bg-stone-100'
                  }`}
                  title="Chọn hoặc bỏ chọn tất cả thư mục đang hiển thị"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-amber-600" />
                  <span>
                    {selectedFolders.length > 0 &&
                    selectedFolders.length === filteredDriveFolders.length
                      ? 'Bỏ chọn thư mục'
                      : `Chọn tất cả thư mục (${filteredDriveFolders.length})`}
                  </span>
                </button>
              )}

              {/* Images Select All */}
              {mode === 'multiple' && filteredDriveImages.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectAllDriveInFolder}
                  className="px-3 py-1.5 bg-white border border-stone-200 hover:bg-stone-100 rounded-xl text-xs text-charcoal-700 font-medium transition-colors cursor-pointer shadow-2xs"
                >
                  {filteredDriveImages.every((img) => selectedDriveIds.includes(img.id))
                    ? 'Bỏ chọn ảnh'
                    : `Chọn tất cả ảnh (${filteredDriveImages.length})`}
                </button>
              )}

              {/* Import Entire Current Folder (Background) */}
              {filteredDriveImages.length > 0 && (
                <button
                  type="button"
                  onClick={handleImportCurrentFolderBackground}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  title="Import nguyên thư mục này vào nền và tự động nén WebP"
                >
                  <FolderDown className="w-3.5 h-3.5" />
                  <span>Import Cả Thư Mục Này ({filteredDriveImages.length})</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => fetchDriveFolderContent(currentFolderId)}
                disabled={driveLoading}
                className="p-1.5 bg-white border border-stone-200 hover:bg-stone-100 text-charcoal-700 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                title="Làm mới thư mục hiện tại"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${driveLoading ? 'animate-spin text-luxury-600' : ''}`}
                />
              </button>
            </div>
          </div>
        )}

        {/* DRIVE EXPLORER CONTAINER */}
        <div className="min-h-[300px] max-h-[460px] overflow-y-auto pr-1 space-y-5">
          {driveLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[280px] text-charcoal-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-luxury-600" />
              <p className="text-xs font-light">Đang quét dữ liệu từ Google Drive...</p>
            </div>
          ) : !hasScanned ? (
            /* EMPTY / UNLOADED STATE */
            <div className="flex flex-col items-center justify-center min-h-[260px] py-12 px-4 text-center border-2 border-dashed border-stone-200 rounded-2xl bg-stone-50/50 space-y-3 select-none">
              <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                <HardDrive className="w-6 h-6 text-stone-400" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-sm font-medium text-charcoal-800">
                  Chưa có thư mục nào được nạp
                </h4>
                <p className="text-xs text-stone-500 max-w-sm">
                  Dán đường link thư mục Google Drive (chia sẻ công khai) hoặc Folder ID ở trên và bấm "Quét Thư Mục" để tải danh sách ảnh và thư mục con.
                </p>
              </div>
            </div>
          ) : filteredDriveFolders.length === 0 && filteredDriveImages.length === 0 ? (
            /* EMPTY SCAN RESULT */
            <div className="flex flex-col items-center justify-center min-h-[240px] py-12 px-4 text-center border-2 border-dashed border-stone-200 rounded-2xl bg-stone-50/50 space-y-3 select-none">
              <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                <ImageIcon className="w-6 h-6 text-stone-400" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-sm font-medium text-charcoal-800">
                  {driveSearchQuery ? 'Không tìm thấy kết quả phù hợp' : 'Thư mục này trống'}
                </h4>
                <p className="text-xs text-stone-500 max-w-sm">
                  {driveSearchQuery
                    ? 'Thử tìm với từ khóa khác hoặc xóa bộ lọc tìm kiếm.'
                    : 'Không tìm thấy thư mục con hoặc tệp ảnh hợp lệ bên trong thư mục Google Drive này.'}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* SUBFOLDERS WITH CHECKBOX SELECTION */}
              {filteredDriveFolders.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-charcoal-600">
                      <Folder className="w-3.5 h-3.5 text-amber-500" />
                      <span>Thư Mục Con ({filteredDriveFolders.length})</span>
                      {selectedFolders.length > 0 && (
                        <span className="text-amber-700 font-mono text-[11px] normal-case font-medium ml-2">
                          (Đã chọn {selectedFolders.length} thư mục)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {filteredDriveFolders.map((subfolder) => {
                      const isFolderSelected = selectedFolders.some(
                        (f) => f.id === subfolder.id
                      );

                      return (
                        <div
                          key={subfolder.id}
                          onClick={() => {
                            if (selectedFolders.length > 0) {
                              toggleFolderSelect(subfolder);
                            } else {
                              handleFolderClick(subfolder);
                            }
                          }}
                          className={`relative p-3 rounded-xl border flex items-center gap-2.5 text-left transition-all cursor-pointer shadow-2xs group ${
                            isFolderSelected
                              ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-400/30'
                              : 'bg-gradient-to-br from-amber-50/30 to-stone-50 hover:from-amber-100/60 hover:to-luxury-50/50 border-amber-200/80 hover:border-amber-400'
                          }`}
                        >
                          {/* Folder Checkbox */}
                          <button
                            type="button"
                            onClick={(e) => toggleFolderSelect(subfolder, e)}
                            className={`w-5 h-5 rounded-md flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                              isFolderSelected
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'border border-amber-300 bg-white/80 hover:bg-white text-transparent hover:text-stone-300'
                            }`}
                            title={isFolderSelected ? 'Bỏ chọn thư mục' : 'Chọn thư mục để import'}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </button>

                          <div className="min-w-0 flex-1">
                            <p
                              className="text-xs font-medium text-charcoal-900 truncate group-hover:text-amber-900"
                              title={subfolder.name}
                            >
                              {subfolder.name}
                            </p>
                            <div className="flex items-center justify-between text-[10px] text-stone-400 mt-0.5">
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFolderClick(subfolder);
                                }}
                                className="hover:text-amber-700 hover:underline flex items-center gap-0.5 cursor-pointer"
                              >
                                <span>Mở xem</span>
                                <ChevronRight className="w-2.5 h-2.5" />
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* IMAGES LIST */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-charcoal-600">
                    <ImageIcon className="w-3.5 h-3.5 text-luxury-600" />
                    <span>Ảnh Google Drive ({filteredDriveImages.length})</span>
                  </div>
                </div>

                {filteredDriveImages.length === 0 ? (
                  <div className="p-8 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-200 text-charcoal-400 text-xs">
                    <ImageIcon className="w-6 h-6 mx-auto mb-1.5 text-stone-300" />
                    <span>Thư mục này không có file ảnh trực tiếp (nhấp vào thư mục con ở trên để xem ảnh hoặc chọn thư mục để import ngầm).</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {filteredDriveImages.map((file) => {
                      const isSelected = selectedDriveIds.includes(file.id);

                      return (
                        <div
                          key={file.id}
                          onClick={() => toggleDriveSelect(file)}
                          className={`group relative rounded-xl border-2 overflow-hidden cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? 'border-luxury-600 ring-2 ring-luxury-400/30 shadow-md bg-luxury-50/20'
                              : 'border-stone-200 hover:border-stone-300 bg-white'
                          }`}
                        >
                          <div className="relative aspect-[4/5] w-full bg-stone-100 overflow-hidden">
                            {/* Fallback info */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-stone-400 bg-stone-100 select-none">
                              <ImageIcon className="w-8 h-8 text-stone-300 mb-1" />
                              <span className="text-[10px] text-center font-mono text-stone-500 truncate max-w-full">
                                {file.name}
                              </span>
                            </div>

                            <img
                              src={
                                file.thumbnailUrl ||
                                file.thumbnailLink ||
                                `https://lh3.googleusercontent.com/d/${file.id}=s400`
                              }
                              alt={file.name}
                              loading="lazy"
                              className="relative z-10 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                const img = e.currentTarget;
                                const directLh3 = `https://lh3.googleusercontent.com/d/${file.id}=s400`;
                                const driveThumb = `https://drive.google.com/thumbnail?id=${file.id}&sz=w400`;

                                if (img.src !== directLh3 && !img.dataset.failedLh3) {
                                  img.dataset.failedLh3 = 'true';
                                  img.src = directLh3;
                                } else if (!img.dataset.failedDrive) {
                                  img.dataset.failedDrive = 'true';
                                  img.src = driveThumb;
                                } else {
                                  img.style.display = 'none';
                                }
                              }}
                            />

                            <div
                              className={`absolute top-2 right-2 z-20 w-6 h-6 rounded-full flex items-center justify-center text-white transition-all shadow-md ${
                                isSelected
                                  ? 'bg-luxury-600 scale-100'
                                  : 'bg-black/40 group-hover:bg-black/60 scale-90'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          </div>

                          <div className="p-2.5">
                            <p
                              className="text-[11px] font-medium text-charcoal-900 truncate"
                              title={file.name}
                            >
                              {file.name}
                            </p>
                            <div className="flex items-center justify-between text-[10px] text-stone-400 mt-0.5 font-mono">
                              <span className="uppercase">
                                {file.mimeType.split('/')[1] || 'IMG'}
                              </span>
                              {file.size && (
                                <span>{(file.size / (1024 * 1024)).toFixed(1)} MB</span>
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

        {/* FOOTER ACTIONS */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-stone-200">
          <div className="text-xs text-charcoal-600">
            {selectedFolders.length > 0 ? (
              <span className="font-semibold text-amber-700 flex items-center gap-1.5">
                <FolderDown className="w-4 h-4" />
                <span>Đã chọn {selectedFolders.length} thư mục để import ngầm</span>
              </span>
            ) : selectedDriveIds.length > 0 ? (
              <span className="font-semibold text-luxury-700">
                {isLogo
                  ? `Đã chọn ${selectedDriveIds.length} tệp logo (.PNG / .SVG)`
                  : `Đã chọn ${selectedDriveIds.length} ảnh (${mode === 'single' ? 'Ảnh đại diện' : 'Bộ ảnh demo'})`}
              </span>
            ) : (
              <span className="text-stone-400">
                {isLogo
                  ? 'Vui lòng quét và chọn file logo định dạng .PNG hoặc .SVG từ Google Drive'
                  : 'Quét thư mục Google Drive để import ngầm hoặc chọn ảnh lẻ nén WebP gán vào form'}
              </span>
            )}
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-charcoal-600 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
            >
              Hủy
            </button>

            {/* BUTTON 1: BATCH FOLDERS IMPORT (BACKGROUND JOB) */}
            {selectedFolders.length > 0 && (
              <button
                type="button"
                onClick={handleStartBatchFolderImport}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs uppercase tracking-wider font-semibold flex items-center gap-2 shadow-md transition-all cursor-pointer animate-fade-in"
              >
                <FolderDown className="w-4 h-4" />
                <span>Bắt đầu Import {selectedFolders.length} Thư Mục (Chạy ngầm)</span>
              </button>
            )}

            {/* BUTTON 2: INDIVIDUAL IMAGES CONVERSION */}
            {selectedFolders.length === 0 && (
              <button
                type="button"
                onClick={handleImportSingleWebP}
                disabled={selectedDriveIds.length === 0 || importingSingleBatch}
                className="px-6 py-2.5 bg-luxury-600 hover:bg-luxury-700 active:scale-95 text-white rounded-xl text-xs uppercase tracking-wider font-semibold flex items-center gap-2 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {importingSingleBatch ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isLogo ? 'Đang Nhập Logo...' : 'Đang Nén WebP...'}</span>
                  </>
                ) : (
                  <>
                    <FileCheck2 className="w-4 h-4" />
                    <span>
                      {isLogo
                        ? `Đồng Bộ Logo (${selectedDriveIds.length})`
                        : `Đồng Bộ & Chuyển Đổi WebP (${selectedDriveIds.length})`}
                    </span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
