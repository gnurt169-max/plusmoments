'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Copy,
  Check,
  ExternalLink,
  Folder,
  Eye,
  Trash2,
  Lock,
  Calendar,
  Heart,
  Image as ImageIcon,
  MessageSquare,
  Download,
  RotateCcw,
  CheckCircle2,
  Clock,
  Sparkles,
  Loader2,
  X,
  Send,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

interface ClientGalleryItem {
  id: string;
  code: string;
  pinCode: string;
  coupleName: string;
  shootDate?: string | null;
  folderSlug: string;
  coverImage?: string | null;
  maxPhotobook: number;
  maxPortrait: number;
  allowDownload: boolean;
  status: 'OPEN' | 'SUBMITTED' | 'COMPLETED';
  clientNote?: string | null;
  submittedAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
  totalPhotos: number;
  photobookCount: number;
  portraitCount: number;
  notesCount: number;
  selectionsCount: number;
}

interface MediaFolderOption {
  slug: string;
  name: string;
  fileCount: number;
  formattedSize: string;
  coverImage?: string | null;
}

interface ProofingPhoto {
  fileName: string;
  url: string;
  thumbUrl: string;
  smallUrl: string;
  sizeBytes: number;
}

export default function AdminProofingPage() {
  const [galleries, setGalleries] = useState<ClientGalleryItem[]>([]);
  const [folders, setFolders] = useState<MediaFolderOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Create Project Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState({
    coupleName: '',
    folderSlug: '',
    shootDate: '',
    code: '',
    pinCode: '',
    maxPhotobook: 40,
    maxPortrait: 2,
    allowDownload: true,
  });

  // Details Modal State
  const [selectedGalleryId, setSelectedGalleryId] = useState<string | null>(null);
  const [detailGallery, setDetailGallery] = useState<ClientGalleryItem | null>(null);
  const [detailPhotos, setDetailPhotos] = useState<ProofingPhoto[]>([]);
  const [detailSelections, setDetailSelections] = useState<
    Record<string, { photobook?: boolean; portrait?: boolean; note?: string }>
  >({});
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState<'photobook' | 'portrait' | 'notes' | 'all'>('photobook');
  const [isCopiedFileList, setIsCopiedFileList] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchGalleries = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/proofing');
      const data = await res.json();
      if (data.success) {
        setGalleries(data.galleries || []);
      }
    } catch {
      showToast('Không thể tải danh sách dự án trả ảnh.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFolders = async () => {
    try {
      const res = await fetch('/api/admin/media/folders');
      const data = await res.json();
      if (data.success && Array.isArray(data.folders)) {
        setFolders(data.folders);
      }
    } catch {
      // Non-blocking
    }
  };

  useEffect(() => {
    fetchGalleries();
    fetchFolders();
  }, []);

  // Open Create Modal with auto-generated PIN
  const handleOpenCreateModal = () => {
    const randomPin = Math.floor(100000 + Math.random() * 900000).toString();
    setCreateForm({
      coupleName: '',
      folderSlug: folders[0]?.slug || '',
      shootDate: '',
      code: '',
      pinCode: randomPin,
      maxPhotobook: 40,
      maxPortrait: 2,
      allowDownload: true,
    });
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.coupleName.trim() || !createForm.folderSlug) {
      alert('Vui lòng nhập tên cặp đôi và chọn thư mục ảnh.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/admin/proofing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Lỗi khi tạo dự án.');
      }

      showToast(`✨ Đã tạo dự án trả ảnh cho ${createForm.coupleName} thành công!`);
      setIsCreateOpen(false);
      fetchGalleries();
    } catch (err: any) {
      alert(err.message || 'Lỗi tạo dự án.');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Details Modal
  const handleOpenDetails = async (id: string) => {
    setSelectedGalleryId(id);
    setDetailLoading(true);
    setActiveDetailTab('photobook');
    setIsCopiedFileList(false);

    try {
      const res = await fetch(`/api/admin/proofing/${id}`);
      const data = await res.json();
      if (data.success) {
        setDetailGallery(data.gallery);
        setDetailPhotos(data.photos || []);
        setDetailSelections(data.selections || {});
      } else {
        alert(data.error || 'Không thể tải chi tiết dự án.');
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tải chi tiết dự án.');
    } finally {
      setDetailLoading(false);
    }
  };

  // Delete Gallery
  const handleDeleteGallery = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa dự án trả ảnh của "${name}"?\n(Lưu ý: Thư mục ảnh gốc trên máy chủ KHÔNG bị xóa).`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/proofing/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'Đã xóa dự án.');
        fetchGalleries();
        if (selectedGalleryId === id) {
          setSelectedGalleryId(null);
        }
      } else {
        alert(data.error || 'Lỗi khi xóa.');
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi kết nối.');
    }
  };

  // Update Status
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/proofing/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Đã chuyển trạng thái dự án sang "${newStatus}".`);
        fetchGalleries();
        if (detailGallery) {
          setDetailGallery({ ...detailGallery, status: newStatus as any });
        }
      } else {
        alert(data.error || 'Lỗi khi cập nhật trạng thái.');
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi kết nối.');
    }
  };

  // 1-Click Copy Zalo Message
  const handleCopyZaloMessage = (item: ClientGalleryItem) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://plusmoments.vn';
    const proofingUrl = `${origin}/proofing/${item.code}`;

    const text = `PlusMoments Studio xin gửi tới hai bạn ${item.coupleName} cổng xem & chọn ảnh cưới riêng tư:
🔗 Đường dẫn: ${proofingUrl}
🔑 Mã PIN: ${item.pinCode}
✨ Hai bạn vui lòng chọn tối đa ${item.maxPhotobook} ảnh in Photobook và ${item.maxPortrait} ảnh Cổng nhé! Chúc hai bạn xem ảnh vui vẻ!`;

    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    showToast('Đã sao chép lời nhắn kèm link & mã PIN để gửi Zalo!');
    setTimeout(() => setCopiedId(null), 3000);
  };

  // Copy Lightroom Filename Search Query
  const handleCopyLightroomFileNames = (filter: 'photobook' | 'portrait' | 'allSelected') => {
    const selectedFileNames = detailPhotos
      .filter((p) => {
        const s = detailSelections[p.fileName];
        if (filter === 'photobook') return Boolean(s?.photobook);
        if (filter === 'portrait') return Boolean(s?.portrait);
        return Boolean(s?.photobook || s?.portrait);
      })
      .map((p) => p.fileName);

    if (selectedFileNames.length === 0) {
      alert('Chưa có ảnh nào trong mục này.');
      return;
    }

    // Join with space or comma for Lightroom
    const query = selectedFileNames.join(' ');
    navigator.clipboard.writeText(query);
    setIsCopiedFileList(true);
    showToast(`Đã chép ${selectedFileNames.length} tên tệp để dán vào Lightroom!`);
    setTimeout(() => setIsCopiedFileList(false), 3000);
  };

  // Stats Counters
  const totalCount = galleries.length;
  const openCount = galleries.filter((g) => g.status === 'OPEN').length;
  const submittedCount = galleries.filter((g) => g.status === 'SUBMITTED').length;
  const completedCount = galleries.filter((g) => g.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] px-4 py-3 bg-stone-900 text-amber-300 text-xs rounded-xl shadow-2xl border border-amber-500/30 flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="font-serif text-2xl font-light text-charcoal-900 tracking-wide flex items-center gap-2.5">
            <span>Cổng Trả Ảnh Khách Hàng (Proofing)</span>
            <span className="text-xs bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full font-mono font-medium border border-amber-300">
              Mã PIN Bảo Mật
            </span>
          </h1>
          <p className="text-xs text-charcoal-500 font-light mt-1">
            Tạo liên kết chọn ảnh in riêng tư cho dâu rể, bảo vệ quyền riêng tư bằng mã PIN và kết nối trực tiếp với Kho Media.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-charcoal-900 hover:bg-charcoal-800 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-md hover:shadow-lg cursor-pointer"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Tạo Dự Án Trả Ảnh Mới</span>
        </button>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-mono text-stone-500 block">Tổng Dự Án</span>
          <span className="font-serif text-2xl text-charcoal-900 font-light">{totalCount}</span>
        </div>
        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-mono text-amber-800 block">Đang Chọn Ảnh</span>
          <span className="font-serif text-2xl text-amber-900 font-light">{openCount}</span>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-mono text-emerald-800 block">Khách Đã Chốt</span>
          <span className="font-serif text-2xl text-emerald-900 font-light">{submittedCount}</span>
        </div>
        <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200 shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-mono text-stone-600 block">Đã Hoàn Tất</span>
          <span className="font-serif text-2xl text-stone-800 font-light">{completedCount}</span>
        </div>
      </div>

      {/* GALLERIES LIST */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-stone-400 space-y-3 bg-white rounded-2xl border border-stone-200">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          <p className="text-xs">Đang tải danh sách dự án trả ảnh...</p>
        </div>
      ) : galleries.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-stone-200 p-8 space-y-4">
          <Folder className="w-12 h-12 text-stone-300 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-serif text-lg text-charcoal-800">Chưa có dự án trả ảnh nào</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Nhấp &ldquo;Tạo Dự Án Trả Ảnh Mới&rdquo; để gửi link chọn ảnh in Photobook và Ảnh Cổng bảo mật cho dâu rể.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-charcoal-900 text-white rounded-xl text-xs font-semibold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo dự án đầu tiên</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {galleries.map((item) => {
            const isSubmitted = item.status === 'SUBMITTED';
            const isCompleted = item.status === 'COMPLETED';

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* CARD HEADER & COVER */}
                <div>
                  <div className="relative h-40 bg-stone-100 overflow-hidden border-b border-stone-200/80">
                    {item.coverImage ? (
                      <img
                        src={item.coverImage}
                        alt={item.coupleName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-stone-100 text-stone-400">
                        <ImageIcon className="w-8 h-8 text-stone-300" />
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      {isSubmitted ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-600/90 text-white text-[10px] font-semibold tracking-wider uppercase backdrop-blur-sm flex items-center gap-1 shadow-sm">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Đã Chốt Danh Sách</span>
                        </span>
                      ) : isCompleted ? (
                        <span className="px-2.5 py-1 rounded-full bg-stone-700/90 text-white text-[10px] font-semibold tracking-wider uppercase backdrop-blur-sm">
                          Đã Bàn Giao Xong
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/90 text-white text-[10px] font-semibold tracking-wider uppercase backdrop-blur-sm flex items-center gap-1 shadow-sm">
                          <Clock className="w-3 h-3" />
                          <span>Đang Chọn Ảnh</span>
                        </span>
                      )}
                    </div>

                    {/* PIN & Total Photos Badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-white font-mono text-[11px] font-bold border border-white/20 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-amber-300" />
                        <span>PIN: {item.pinCode}</span>
                      </span>
                    </div>

                    {/* Couple Name on Cover */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="font-serif text-lg text-white font-medium drop-shadow-md truncate">
                        {item.coupleName}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-stone-300 font-light">
                        {item.shootDate && <span>{item.shootDate} •</span>}
                        <span>📁 {item.totalPhotos} ảnh</span>
                      </div>
                    </div>
                  </div>

                  {/* SELECTIONS PROGRESS BAR */}
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {/* Photobook Progress */}
                      <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-stone-600">
                          <span className="flex items-center gap-1 font-medium text-stone-800">
                            <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                            <span>Photobook:</span>
                          </span>
                          <span className="font-mono font-bold text-stone-900">
                            {item.photobookCount}/{item.maxPhotobook}
                          </span>
                        </div>
                        <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              item.photobookCount >= item.maxPhotobook ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                            style={{
                              width: `${Math.min(100, (item.photobookCount / item.maxPhotobook) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Portrait Progress */}
                      <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-stone-600">
                          <span className="flex items-center gap-1 font-medium text-stone-800">
                            <ImageIcon className="w-3 h-3 text-amber-600" />
                            <span>Ảnh Cổng:</span>
                          </span>
                          <span className="font-mono font-bold text-stone-900">
                            {item.portraitCount}/{item.maxPortrait}
                          </span>
                        </div>
                        <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              item.portraitCount >= item.maxPortrait ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                            style={{
                              width: `${Math.min(100, (item.portraitCount / (item.maxPortrait || 1)) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {item.notesCount > 0 && (
                      <div className="text-[11px] text-stone-600 bg-amber-50/80 border border-amber-200/80 p-2 rounded-lg flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Có <strong>{item.notesCount}</strong> ảnh kèm ghi chú chỉnh sửa của dâu rể</span>
                      </div>
                    )}

                    {item.clientNote && (
                      <p className="text-[11px] text-stone-500 italic bg-stone-50 p-2 rounded-lg line-clamp-2 border border-stone-200/60">
                        &ldquo;{item.clientNote}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                {/* CARD FOOTER ACTIONS */}
                <div className="p-4 pt-0 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Copy Link + PIN Button */}
                    <button
                      type="button"
                      onClick={() => handleCopyZaloMessage(item)}
                      className="py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-amber-300 cursor-pointer"
                      title="Sao chép tin nhắn Zalo kèm Link & PIN"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-800 font-bold">Đã Chép!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-amber-700" />
                          <span>Gửi Zalo</span>
                        </>
                      )}
                    </button>

                    {/* View Details Modal Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenDetails(item.id)}
                      className="py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      <span>Xem Lựa Chọn</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[11px] text-stone-500">
                    <Link
                      href={`/proofing/${item.code}`}
                      target="_blank"
                      className="hover:text-charcoal-900 transition-colors inline-flex items-center gap-1"
                    >
                      <span>Mở link khách</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDeleteGallery(item.id, item.coupleName)}
                      className="text-stone-400 hover:text-red-600 transition-colors p-1"
                      title="Xóa dự án trả ảnh"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE PROJECT MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Tạo Dự Án Trả Ảnh & Chọn Ảnh Mới"
        subtitle="Kết nối trực tiếp tới thư mục ảnh trong Kho Media và cấp mã PIN riêng cho cặp đôi"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1 font-medium">
              Tên Dâu Rể <span className="text-luxury-600">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Minh Phương & Hoàng Nam"
              value={createForm.coupleName}
              onChange={(e) => setCreateForm({ ...createForm, coupleName: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-400 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1 font-medium">
              Chọn Thư Mục Ảnh Từ Kho Media <span className="text-luxury-600">*</span>
            </label>
            <select
              required
              value={createForm.folderSlug}
              onChange={(e) => setCreateForm({ ...createForm, folderSlug: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-400 font-medium"
            >
              <option value="">-- Chọn thư mục ảnh của khách --</option>
              {folders.map((f) => (
                <option key={f.slug} value={f.slug}>
                  📁 {f.name} ({f.fileCount} ảnh - {f.formattedSize})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-stone-500 mt-1 font-light">
              Hệ thống sẽ tự động quét toàn bộ ảnh chất lượng cao trong thư mục này để khách chọn.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1 font-medium">
                Ngày Chụp / Ngày Cưới
              </label>
              <input
                type="text"
                placeholder="VD: 18/11/2026"
                value={createForm.shootDate}
                onChange={(e) => setCreateForm({ ...createForm, shootDate: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-400 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1 font-medium">
                Mã PIN Bảo Mật (6 số) <span className="text-luxury-600">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={8}
                value={createForm.pinCode}
                onChange={(e) => setCreateForm({ ...createForm, pinCode: e.target.value.replace(/\D/g, '') })}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-400 font-mono font-bold tracking-wider"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1 font-medium">
                Hạn Mức Ảnh In Photobook
              </label>
              <input
                type="number"
                min={1}
                max={200}
                value={createForm.maxPhotobook}
                onChange={(e) => setCreateForm({ ...createForm, maxPhotobook: parseInt(e.target.value, 10) || 40 })}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1 font-medium">
                Hạn Mức Ảnh Cổng / Khung Lớn
              </label>
              <input
                type="number"
                min={0}
                max={20}
                value={createForm.maxPortrait}
                onChange={(e) => setCreateForm({ ...createForm, maxPortrait: parseInt(e.target.value, 10) || 2 })}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-400 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="allowDownloadCheck"
              checked={createForm.allowDownload}
              onChange={(e) => setCreateForm({ ...createForm, allowDownload: e.target.checked })}
              className="rounded border-stone-300 text-amber-700 focus:ring-amber-500 cursor-pointer"
            />
            <label htmlFor="allowDownloadCheck" className="text-xs text-charcoal-700 select-none cursor-pointer">
              Cho phép cô dâu chú rể tải ảnh về máy tính / điện thoại
            </label>
          </div>

          <div className="pt-3 border-t border-stone-200 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-semibold"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 disabled:opacity-50 shadow-md"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin text-amber-400" /> : <Plus className="w-4 h-4 text-amber-400" />}
              <span>Khởi Tạo Cổng Trả Ảnh</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* DETAILS & SELECTION EXPORT MODAL */}
      <Modal
        isOpen={Boolean(selectedGalleryId)}
        onClose={() => setSelectedGalleryId(null)}
        title={detailGallery ? `Kết Quả Chọn Ảnh: ${detailGallery.coupleName}` : 'Chi Tiết Dự Án'}
        subtitle={
          detailGallery
            ? `Đường dẫn: /proofing/${detailGallery.code} • Mã PIN: ${detailGallery.pinCode}`
            : undefined
        }
        maxWidth="max-w-4xl"
      >
        {detailLoading || !detailGallery ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3 text-stone-400">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            <p className="text-xs">Đang tải kết quả chọn ảnh từ khách hàng...</p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* STATUS & ACTIONS BAR */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs text-stone-600">Trạng thái:</span>
                {detailGallery.status === 'SUBMITTED' ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-xs border border-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Khách Đã Chốt Danh Sách</span>
                  </span>
                ) : detailGallery.status === 'COMPLETED' ? (
                  <span className="px-3 py-1 rounded-full bg-stone-200 text-stone-800 font-semibold text-xs">
                    Đã Hoàn Tất Bàn Giao
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold text-xs border border-amber-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Đang Trong Quá Trình Chọn Ảnh</span>
                  </span>
                )}
              </div>

              {/* Status Switchers */}
              <div className="flex items-center gap-2">
                {detailGallery.status === 'SUBMITTED' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(detailGallery.id, 'COMPLETED')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium cursor-pointer"
                  >
                    Đánh dấu Hoàn tất
                  </button>
                )}
                {detailGallery.status !== 'OPEN' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(detailGallery.id, 'OPEN')}
                    className="px-3 py-1.5 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-medium cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Mở lại cho khách chọn lại</span>
                  </button>
                )}
              </div>
            </div>

            {/* LIGHTROOM EXPORT & ZIP DOWNLOAD TOOLBAR */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <div className="flex items-center gap-2 text-xs font-medium text-amber-900">
                <FileText className="w-4 h-4 text-amber-700" />
                <span>Công cụ dành cho Ekip Hậu Kỳ:</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyLightroomFileNames('photobook')}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-stone-50 border border-amber-300 text-amber-900 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Chép danh sách tên file Photobook để lọc nhanh trong Lightroom"
                >
                  <Copy className="w-3 h-3 text-amber-700" />
                  <span>Chép tên file Photobook</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopyLightroomFileNames('portrait')}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-stone-50 border border-amber-300 text-amber-900 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Chép danh sách tên file Ảnh Cổng để lọc nhanh trong Lightroom"
                >
                  <Copy className="w-3 h-3 text-amber-700" />
                  <span>Chép tên file Ảnh Cổng</span>
                </button>

                <a
                  href={`/api/admin/proofing/${detailGallery.id}/zip?type=selected`}
                  className="px-3 py-1.5 rounded-lg bg-charcoal-900 hover:bg-charcoal-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                  download
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tải ZIP Ảnh Đã Chọn</span>
                </a>
              </div>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
              <button
                type="button"
                onClick={() => setActiveDetailTab('photobook')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5 ${
                  activeDetailTab === 'photobook'
                    ? 'bg-rose-50 text-rose-800 border border-rose-300 font-semibold'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                <span>
                  Ảnh In Photobook (
                  {detailPhotos.filter((p) => detailSelections[p.fileName]?.photobook).length}/
                  {detailGallery.maxPhotobook})
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveDetailTab('portrait')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5 ${
                  activeDetailTab === 'portrait'
                    ? 'bg-amber-50 text-amber-800 border border-amber-300 font-semibold'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  Ảnh Cổng / Khung (
                  {detailPhotos.filter((p) => detailSelections[p.fileName]?.portrait).length}/
                  {detailGallery.maxPortrait})
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveDetailTab('notes')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5 ${
                  activeDetailTab === 'notes'
                    ? 'bg-blue-50 text-blue-800 border border-blue-300 font-semibold'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                <span>
                  Có Ghi Chú (
                  {detailPhotos.filter((p) => Boolean(detailSelections[p.fileName]?.note?.trim())).length})
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveDetailTab('all')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  activeDetailTab === 'all'
                    ? 'bg-stone-900 text-white font-semibold'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                Toàn Bộ Thư Mục ({detailPhotos.length})
              </button>
            </div>

            {/* TAB CONTENT GRID */}
            {(() => {
              const displayedPhotos = detailPhotos.filter((p) => {
                const s = detailSelections[p.fileName];
                if (activeDetailTab === 'photobook') return Boolean(s?.photobook);
                if (activeDetailTab === 'portrait') return Boolean(s?.portrait);
                if (activeDetailTab === 'notes') return Boolean(s?.note?.trim());
                return true;
              });

              if (displayedPhotos.length === 0) {
                return (
                  <div className="py-16 text-center text-stone-400 space-y-2">
                    <ImageIcon className="w-10 h-10 text-stone-300 mx-auto" />
                    <p className="text-xs">Chưa có ảnh nào trong mục này.</p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[480px] overflow-y-auto pr-1 custom-scrollbar">
                  {displayedPhotos.map((photo) => {
                    const sel = detailSelections[photo.fileName];

                    return (
                      <div
                        key={photo.fileName}
                        className="group relative rounded-xl overflow-hidden bg-stone-100 border border-stone-200 flex flex-col justify-between"
                      >
                        <div className="relative aspect-[3/4] w-full overflow-hidden">
                          <img
                            src={photo.thumbUrl}
                            alt={photo.fileName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />

                          {/* Selection Badges */}
                          <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
                            {sel?.photobook && (
                              <span className="p-1 rounded-full bg-rose-600 text-white shadow-sm" title="Chọn in Photobook">
                                <Heart className="w-3 h-3 fill-white" />
                              </span>
                            )}
                            {sel?.portrait && (
                              <span className="p-1 rounded-full bg-amber-500 text-white shadow-sm" title="Chọn làm Ảnh Cổng">
                                <ImageIcon className="w-3 h-3 text-white" />
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="p-2 space-y-1 bg-white">
                          <p className="font-mono text-[10px] text-stone-700 truncate" title={photo.fileName}>
                            {photo.fileName}
                          </p>
                          {sel?.note && (
                            <p className="text-[10px] text-blue-700 bg-blue-50/80 p-1 rounded font-light line-clamp-2" title={sel.note}>
                              💬 {sel.note}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}
      </Modal>
    </div>
  );
}
