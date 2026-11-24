'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Heart,
  Search,
  ExternalLink,
  Copy,
  Check,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  Users,
  MessageSquare,
  Sparkles,
  Calendar,
  MapPin,
  Clock,
  Download,
  AlertTriangle,
  RefreshCw,
  Plus,
  X,
  CheckCircle2,
  ShieldAlert,
  Folder,
  Upload,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import { INVITATION_TEMPLATES } from '@/lib/invitations/templates';

interface InvitationRsvpItem {
  id: string;
  guestName: string;
  attendance: string;
  guestCount: number;
  side: string;
  wishMessage?: string | null;
  createdAt: string;
}

interface AdminInvitationItem {
  id: string;
  slug: string;
  templateId: string;
  themeColor: string;
  groomName: string;
  brideName: string;
  groomParents?: string | null;
  brideParents?: string | null;
  groomImage?: string | null;
  brideImage?: string | null;
  groomBio?: string | null;
  brideBio?: string | null;
  ceremonyDate: string;
  ceremonyTimeText?: string | null;
  venueName: string;
  venueAddress: string;
  googleMapsUrl?: string | null;
  storyTitle?: string | null;
  storyText?: string | null;
  coverImage: string;
  galleryImages: any[];
  musicPreset: string;
  bankQrImage?: string | null;
  bankInfoText?: string | null;
  editPasscode: string;
  isPublished: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  rsvps: InvitationRsvpItem[];
  _count?: { rsvps: number };
}

export default function AdminInvitationsPage() {
  const [invitations, setInvitations] = useState<AdminInvitationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
  const [templateFilter, setTemplateFilter] = useState<string>('ALL');

  // UI state
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [revealedPins, setRevealedPins] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active Modals
  const [selectedForRsvp, setSelectedForRsvp] = useState<AdminInvitationItem | null>(null);
  const [selectedForEdit, setSelectedForEdit] = useState<AdminInvitationItem | null>(null);
  const [selectedForDelete, setSelectedForDelete] = useState<AdminInvitationItem | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit Form State
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [editForm, setEditForm] = useState<{
    groomName: string;
    brideName: string;
    groomParents: string;
    brideParents: string;
    groomImage: string;
    brideImage: string;
    groomBio: string;
    brideBio: string;
    ceremonyDate: string;
    ceremonyTimeText: string;
    venueName: string;
    venueAddress: string;
    googleMapsUrl: string;
    storyTitle: string;
    storyText: string;
    coverImage: string;
    galleryImages: any[];
    templateId: string;
    themeColor: string;
    musicPreset: string;
    bankQrImage: string;
    bankInfoText: string;
    editPasscode: string;
    isPublished: boolean;
  }>({
    groomName: '',
    brideName: '',
    groomParents: '',
    brideParents: '',
    groomImage: '',
    brideImage: '',
    groomBio: '',
    brideBio: '',
    ceremonyDate: '',
    ceremonyTimeText: '',
    venueName: '',
    venueAddress: '',
    googleMapsUrl: '',
    storyTitle: '',
    storyText: '',
    coverImage: '',
    galleryImages: [],
    templateId: 'timeless-ivory',
    themeColor: '#8C6D46',
    musicPreset: 'romantic-piano',
    bankQrImage: '',
    bankInfoText: '',
    editPasscode: '',
    isPublished: true,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/invitations');
      const data = await res.json();
      if (data.success && Array.isArray(data.invitations)) {
        setInvitations(data.invitations);
      } else {
        showToast(data.error || 'Lỗi khi tải danh sách thiệp cưới');
      }
    } catch (err: any) {
      showToast('Không thể kết nối đến máy chủ: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  // Filtered invitations list
  const filteredInvitations = useMemo(() => {
    return invitations.filter((inv) => {
      const matchSearch =
        inv.groomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.brideName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.venueName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        statusFilter === 'ALL'
          ? true
          : statusFilter === 'PUBLISHED'
          ? inv.isPublished
          : !inv.isPublished;

      const matchTemplate =
        templateFilter === 'ALL' ? true : inv.templateId === templateFilter;

      return matchSearch && matchStatus && matchTemplate;
    });
  }, [invitations, searchTerm, statusFilter, templateFilter]);

  // Overall Statistics
  const stats = useMemo(() => {
    const total = invitations.length;
    const published = invitations.filter((i) => i.isPublished).length;
    const totalViews = invitations.reduce((acc, i) => acc + (i.viewCount || 0), 0);
    const totalRsvps = invitations.reduce((acc, i) => acc + (i.rsvps?.length || 0), 0);
    return { total, published, totalViews, totalRsvps };
  }, [invitations]);

  // Copy Link action
  const handleCopyLink = (slug: string) => {
    const fullUrl = `${window.location.origin}/thiep-cuoi/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(slug);
    showToast('Đã sao chép liên kết thiệp cưới!');
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  // Toggle reveal PIN
  const togglePinReveal = (id: string) => {
    setRevealedPins((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Quick toggle isPublished status
  const handleTogglePublish = async (inv: AdminInvitationItem) => {
    try {
      const nextStatus = !inv.isPublished;
      const res = await fetch(`/api/admin/invitations/${inv.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setInvitations((prev) =>
          prev.map((item) =>
            item.id === inv.id ? { ...item, isPublished: nextStatus } : item
          )
        );
        showToast(
          nextStatus ? 'Đã kích hoạt hiển thị thiệp cưới!' : 'Đã chuyển thiệp cưới về bản nháp / ẩn!'
        );
      } else {
        showToast(data.error || 'Có lỗi xảy ra khi cập nhật');
      }
    } catch (err: any) {
      showToast('Lỗi: ' + err.message);
    }
  };

  // Open Edit Modal
  const openEditModal = (inv: AdminInvitationItem) => {
    setSelectedForEdit(inv);
    setEditForm({
      groomName: inv.groomName || '',
      brideName: inv.brideName || '',
      groomParents: inv.groomParents || '',
      brideParents: inv.brideParents || '',
      groomImage: (inv as any).groomImage || '',
      brideImage: (inv as any).brideImage || '',
      groomBio: (inv as any).groomBio || '',
      brideBio: (inv as any).brideBio || '',
      ceremonyDate: inv.ceremonyDate ? new Date(inv.ceremonyDate).toISOString().slice(0, 16) : '',
      ceremonyTimeText: inv.ceremonyTimeText || '',
      venueName: inv.venueName || '',
      venueAddress: inv.venueAddress || '',
      googleMapsUrl: inv.googleMapsUrl || '',
      storyTitle: inv.storyTitle || '',
      storyText: inv.storyText || '',
      coverImage: inv.coverImage || '',
      galleryImages: Array.isArray(inv.galleryImages) ? inv.galleryImages : [],
      templateId: inv.templateId || 'timeless-ivory',
      themeColor: inv.themeColor || '#8C6D46',
      musicPreset: inv.musicPreset || 'romantic-piano',
      bankQrImage: inv.bankQrImage || '',
      bankInfoText: inv.bankInfoText || '',
      editPasscode: inv.editPasscode || '',
      isPublished: inv.isPublished,
    });
  };

  // Upload Cover Image Handler
  const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedForEdit) return;

    try {
      setIsUploadingCover(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('slug', selectedForEdit.slug);

      const res = await fetch('/api/invitations/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setEditForm((prev) => ({ ...prev, coverImage: data.url }));
        showToast('Tải ảnh bìa thành công!');
      } else {
        showToast(data.error || 'Tải ảnh bìa thất bại');
      }
    } catch (err: any) {
      showToast('Lỗi tải ảnh: ' + err.message);
    } finally {
      setIsUploadingCover(false);
      e.target.value = '';
    }
  };

  // Upload Gallery Images Handler (Multi-file)
  const handleUploadGallery = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedForEdit) return;

    try {
      setIsUploadingGallery(true);
      const newImages = [...(editForm.galleryImages || [])];
      let uploadedCount = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('slug', selectedForEdit.slug);

        const res = await fetch('/api/invitations/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.success && data.url) {
          newImages.push({
            url: data.url,
            width: data.width || 1200,
            height: data.height || 800,
            caption: '',
          });
          uploadedCount++;
        }
      }

      setEditForm((prev) => ({ ...prev, galleryImages: newImages }));
      showToast(`Đã tải lên ${uploadedCount} ảnh vào album!`);
    } catch (err: any) {
      showToast('Lỗi tải ảnh album: ' + err.message);
    } finally {
      setIsUploadingGallery(false);
      e.target.value = '';
    }
  };

  // Remove Gallery Image
  const handleRemoveGalleryImage = (indexToRemove: number) => {
    setEditForm((prev) => ({
      ...prev,
      galleryImages: (prev.galleryImages || []).filter((_, idx) => idx !== indexToRemove),
    }));
  };

  // Submit Edit Form
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForEdit) return;

    try {
      setIsSavingEdit(true);
      const res = await fetch(`/api/admin/invitations/${selectedForEdit.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (data.success && data.invitation) {
        showToast('Đã lưu thay đổi thông tin thiệp cưới thành công!');
        setInvitations((prev) =>
          prev.map((item) =>
            item.id === selectedForEdit.id
              ? { ...item, ...data.invitation, rsvps: item.rsvps }
              : item
          )
        );
        setSelectedForEdit(null);
      } else {
        showToast(data.error || 'Có lỗi xảy ra khi cập nhật');
      }
    } catch (err: any) {
      showToast('Lỗi: ' + err.message);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Delete Invitation Action
  const handleDeleteInvitation = async () => {
    if (!selectedForDelete) return;

    try {
      setIsDeleting(true);
      const res = await fetch(`/api/admin/invitations/${selectedForDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast('Đã xóa vĩnh viễn thiệp cưới!');
        setInvitations((prev) => prev.filter((i) => i.id !== selectedForDelete.id));
        setSelectedForDelete(null);
      } else {
        showToast(data.error || 'Có lỗi xảy ra khi xóa thiệp');
      }
    } catch (err: any) {
      showToast('Lỗi: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Delete Individual RSVP
  const handleDeleteRsvp = async (invitationId: string, rsvpId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa phản hồi / lời chúc này khỏi thiệp?')) return;

    try {
      const res = await fetch(`/api/admin/invitations/${invitationId}/rsvps/${rsvpId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast('Đã xóa lời chúc thành công!');
        setInvitations((prev) =>
          prev.map((inv) =>
            inv.id === invitationId
              ? { ...inv, rsvps: inv.rsvps.filter((r) => r.id !== rsvpId) }
              : inv
          )
        );
        if (selectedForRsvp && selectedForRsvp.id === invitationId) {
          setSelectedForRsvp((prev) =>
            prev ? { ...prev, rsvps: prev.rsvps.filter((r) => r.id !== rsvpId) } : null
          );
        }
      } else {
        showToast(data.error || 'Có lỗi khi xóa lời chúc');
      }
    } catch (err: any) {
      showToast('Lỗi: ' + err.message);
    }
  };

  // Export CSV for RSVP list
  const handleExportCsv = (inv: AdminInvitationItem) => {
    if (!inv.rsvps || inv.rsvps.length === 0) {
      showToast('Chưa có danh sách khách mời để xuất file');
      return;
    }

    const headers = ['STT', 'Họ Tên Khách Mời', 'Tham Dự?', 'Số Lượng', 'Khách Của Ai', 'Lời Chúc', 'Thời Gian Gửi'];
    const rows = inv.rsvps.map((r, idx) => [
      idx + 1,
      `"${r.guestName.replace(/"/g, '""')}"`,
      r.attendance === 'ATTENDING' ? 'Tham dự' : 'Báo bận',
      r.guestCount,
      r.side === 'GROOM' ? 'Nhà Trai' : r.side === 'BRIDE' ? 'Nhà Gái' : 'Cả Hai',
      `"${(r.wishMessage || '').replace(/"/g, '""')}"`,
      new Date(r.createdAt).toLocaleString('vi-VN'),
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `DS_KhachMoi_${inv.slug}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Đã tải xuống file CSV danh sách khách mời!');
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-medium shadow-xl border border-stone-800 animate-slide-up flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-3xl font-light text-stone-900">
              Quản Lý Thiệp Cưới Online
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-rose-50 text-rose-700 border border-rose-200">
              Live Mod
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Theo dõi lượt xem, hỗ trợ dâu rể đổi mã PIN, kiểm duyệt lời chúc và danh sách RSVP.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchInvitations}
            className="h-10 px-3.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Làm mới danh sách"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Làm Mới</span>
          </button>

          <Link
            href="/thiep-cuoi/tao-moi"
            target="_blank"
            className="h-10 px-4 rounded-xl bg-[#8C6D46] hover:bg-[#725735] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Thiệp Mới</span>
          </Link>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-stone-400">
            Tổng Số Thiệp Đã Tạo
          </div>
          <div className="font-serif text-3xl font-normal text-stone-900 mt-1">
            {stats.total}
          </div>
          <div className="text-[11px] text-stone-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-semibold">{stats.published}</span> đang xuất bản công khai
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-stone-400">
            Tổng Lượt Xem Thiệp
          </div>
          <div className="font-serif text-3xl font-normal text-stone-900 mt-1">
            {stats.totalViews.toLocaleString('vi-VN')}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Tương tác mở link từ khách mời
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-stone-400">
            Tổng Lượt Xác Nhận RSVP
          </div>
          <div className="font-serif text-3xl font-normal text-stone-900 mt-1">
            {stats.totalRsvps}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Khách gửi phản hồi & lời chúc
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-stone-400">
            Trạng Thái Dịch Vụ
          </div>
          <div className="font-serif text-lg font-medium text-emerald-700 mt-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Hoạt Động Ổn Định</span>
          </div>
          <div className="text-[11px] text-stone-400 mt-1">
            Hỗ trợ 4 phong cách giao diện
          </div>
        </div>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên cô dâu, chú rể, slug, địa điểm..."
            className="w-full h-10 pl-9 pr-3.5 rounded-xl border border-stone-300 bg-stone-50/50 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#8C6D46] focus:bg-white transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-stone-300 bg-white text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PUBLISHED">Đang hiển thị</option>
            <option value="DRAFT">Đang ẩn / Nháp</option>
          </select>

          {/* Template Filter */}
          <select
            value={templateFilter}
            onChange={(e) => setTemplateFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-stone-300 bg-white text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
          >
            <option value="ALL">Tất cả mẫu thiết kế</option>
            {Object.values(INVITATION_TEMPLATES).map((tpl) => (
              <option key={tpl.id} value={tpl.id}>
                {tpl.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TABLE / LIST OF INVITATIONS */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-500 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#8C6D46]" />
            <span>Đang tải danh sách thiệp cưới...</span>
          </div>
        ) : filteredInvitations.length === 0 ? (
          <div className="p-12 text-center text-stone-500 text-xs space-y-2">
            <Heart className="w-8 h-8 text-stone-300 mx-auto" />
            <p className="font-medium text-stone-700 text-sm">Chưa có thiệp cưới nào phù hợp</p>
            <p className="text-stone-400 max-w-sm mx-auto">
              Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái để xem thêm kết quả.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/70 text-[11px] font-mono uppercase tracking-wider text-stone-500">
                  <th className="py-3.5 px-4 font-semibold">Ảnh Bìa</th>
                  <th className="py-3.5 px-4 font-semibold">Cặp Đôi & Liên Kết</th>
                  <th className="py-3.5 px-4 font-semibold">Ngày Cưới & Địa Điểm</th>
                  <th className="py-3.5 px-4 font-semibold">Mã PIN Sửa</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Tương Tác</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Hiển Thị</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredInvitations.map((inv) => {
                  const tpl = INVITATION_TEMPLATES[inv.templateId] || INVITATION_TEMPLATES['timeless-ivory'];
                  const isPinRevealed = revealedPins[inv.id] || false;
                  const attendingCount = (inv.rsvps || []).filter((r) => r.attendance === 'ATTENDING').length;
                  const totalGuests = (inv.rsvps || []).reduce(
                    (acc, r) => (r.attendance === 'ATTENDING' ? acc + (r.guestCount || 1) : acc),
                    0
                  );

                  return (
                    <tr key={inv.id} className="hover:bg-stone-50/60 transition-colors">
                      {/* Cover Thumbnail */}
                      <td className="py-3.5 px-4 align-top w-20">
                        <div className="w-16 h-20 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shadow-2xs relative shrink-0">
                          {inv.coverImage ? (
                            <img
                              src={inv.coverImage}
                              alt=""
                              className="w-full h-full object-cover object-[50%_18%]"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-400">
                              <Heart className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Couple & Link */}
                      <td className="py-3.5 px-4 align-top max-w-xs">
                        <div className="font-serif text-sm font-medium text-stone-900 leading-snug">
                          {inv.groomName} <span className="text-[#8C6D46] italic">&</span> {inv.brideName}
                        </div>

                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono mt-1 bg-stone-100 text-stone-600 border border-stone-200">
                          <span>{tpl.name}</span>
                        </div>

                        {/* Public Link with Copy & New Tab */}
                        <div className="mt-1.5 flex items-center gap-2 text-[11px] font-mono text-stone-500">
                          <span className="truncate max-w-[150px]">{inv.slug}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyLink(inv.slug)}
                            className="p-1 rounded hover:bg-stone-200 text-stone-600 transition-colors"
                            title="Sao chép link thiệp"
                          >
                            {copiedSlug === inv.slug ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                          <Link
                            href={`/thiep-cuoi/${inv.slug}`}
                            target="_blank"
                            className="p-1 rounded hover:bg-stone-200 text-stone-600 transition-colors"
                            title="Xem thiệp cưới công khai"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      </td>

                      {/* Ceremony Date & Venue */}
                      <td className="py-3.5 px-4 align-top max-w-xs">
                        <div className="flex items-center gap-1.5 font-medium text-stone-800">
                          <Calendar className="w-3 h-3 text-[#8C6D46] shrink-0" />
                          <span>
                            {inv.ceremonyTimeText ||
                              new Date(inv.ceremonyDate).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <div className="flex items-start gap-1.5 text-stone-500 mt-1 line-clamp-2">
                          <MapPin className="w-3 h-3 text-stone-400 shrink-0 mt-0.5" />
                          <span>{inv.venueName} — {inv.venueAddress}</span>
                        </div>
                      </td>

                      {/* Edit PIN passcode */}
                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 border border-stone-200 font-mono text-xs">
                          <span className="font-semibold text-stone-800">
                            {isPinRevealed ? inv.editPasscode : '••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePinReveal(inv.id)}
                            className="text-stone-400 hover:text-stone-700 transition-colors"
                            title={isPinRevealed ? 'Ẩn mã PIN' : 'Hiện mã PIN khách'}
                          >
                            {isPinRevealed ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Interactive Stats */}
                      <td className="py-3.5 px-4 align-top text-center whitespace-nowrap">
                        <div className="flex flex-col items-center gap-1 font-mono">
                          <span className="text-[11px] text-stone-600 flex items-center gap-1">
                            <Eye className="w-3 h-3 text-stone-400" />
                            <span>{inv.viewCount} xem</span>
                          </span>
                          <span className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                            <Users className="w-3 h-3 text-emerald-600" />
                            <span>{attendingCount} RSVP ({totalGuests} khách)</span>
                          </span>
                          <span className="text-[10px] text-stone-400">
                            {inv.rsvps?.length || 0} lời chúc
                          </span>
                        </div>
                      </td>

                      {/* Published Toggle */}
                      <td className="py-3.5 px-4 align-top text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(inv)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                            inv.isPublished
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-stone-100 text-stone-500 border border-stone-200 hover:bg-stone-200'
                          }`}
                          title={inv.isPublished ? 'Bấm để ẩn thiệp' : 'Bấm để xuất bản thiệp'}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              inv.isPublished ? 'bg-emerald-600' : 'bg-stone-400'
                            }`}
                          />
                          <span>{inv.isPublished ? 'Hiển thị' : 'Đang ẩn'}</span>
                        </button>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Manage RSVP */}
                          <button
                            type="button"
                            onClick={() => setSelectedForRsvp(inv)}
                            className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-700 transition-colors"
                            title="Quản lý RSVP & Lời Chúc"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Invitation */}
                          <button
                            type="button"
                            onClick={() => openEditModal(inv)}
                            className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-700 transition-colors"
                            title="Chỉnh sửa thiệp cưới"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Invitation */}
                          <button
                            type="button"
                            onClick={() => setSelectedForDelete(inv)}
                            className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 transition-colors"
                            title="Xóa thiệp cưới"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============================================================= */}
      {/* 1. RSVP & WISHES MODERATION MODAL                             */}
      {/* ============================================================= */}
      {selectedForRsvp && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
        >
          <div className="w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl border border-stone-200 shadow-2xl flex flex-col overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
              <div>
                <h3 className="font-serif text-lg font-medium text-stone-900">
                  RSVP & Lời Chúc — {selectedForRsvp.groomName} & {selectedForRsvp.brideName}
                </h3>
                <p className="text-xs text-stone-500 font-mono mt-0.5">
                  /thiep-cuoi/{selectedForRsvp.slug}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleExportCsv(selectedForRsvp)}
                  className="h-8 px-3 rounded-lg border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
                  title="Xuất file CSV danh sách khách"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Xuất CSV</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedForRsvp(null)}
                  className="p-1.5 rounded-full hover:bg-stone-200 text-stone-400 hover:text-stone-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick RSVP Summary Bar */}
            <div className="p-4 bg-amber-50/50 border-b border-amber-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-white border border-amber-200/60">
                <div className="text-[10px] uppercase font-mono text-stone-400">Khách Tham Dự</div>
                <div className="text-base font-bold text-emerald-700 font-mono">
                  {(selectedForRsvp.rsvps || []).reduce(
                    (acc, r) => (r.attendance === 'ATTENDING' ? acc + (r.guestCount || 1) : acc),
                    0
                  )}{' '}
                  người
                </div>
              </div>

              <div className="p-2 rounded-xl bg-white border border-amber-200/60">
                <div className="text-[10px] uppercase font-mono text-stone-400">Khách Báo Bận</div>
                <div className="text-base font-bold text-stone-600 font-mono">
                  {(selectedForRsvp.rsvps || []).filter((r) => r.attendance === 'DECLINED').length}
                </div>
              </div>

              <div className="p-2 rounded-xl bg-white border border-amber-200/60">
                <div className="text-[10px] uppercase font-mono text-stone-400">Khách Nhà Trai</div>
                <div className="text-base font-bold text-[#8C6D46] font-mono">
                  {(selectedForRsvp.rsvps || []).filter((r) => r.side === 'GROOM').length}
                </div>
              </div>

              <div className="p-2 rounded-xl bg-white border border-amber-200/60">
                <div className="text-[10px] uppercase font-mono text-stone-400">Khách Nhà Gái</div>
                <div className="text-base font-bold text-rose-600 font-mono">
                  {(selectedForRsvp.rsvps || []).filter((r) => r.side === 'BRIDE').length}
                </div>
              </div>
            </div>

            {/* RSVP List Body */}
            <div className="p-5 flex-1 overflow-y-auto space-y-3">
              {(!selectedForRsvp.rsvps || selectedForRsvp.rsvps.length === 0) ? (
                <div className="text-center py-10 text-stone-400 text-xs">
                  Chưa có khách mời nào gửi xác nhận hoặc lời chúc cho thiệp cưới này.
                </div>
              ) : (
                selectedForRsvp.rsvps.map((rsvp) => (
                  <div
                    key={rsvp.id}
                    className="p-3.5 rounded-2xl border border-stone-200/80 bg-stone-50/50 hover:bg-stone-50 flex items-start justify-between gap-4 transition-colors"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-stone-900 text-sm">
                          {rsvp.guestName}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                            rsvp.attendance === 'ATTENDING'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-stone-200 text-stone-700'
                          }`}
                        >
                          {rsvp.attendance === 'ATTENDING'
                            ? `Sẽ tham dự (${rsvp.guestCount} người)`
                            : 'Không thể đến'}
                        </span>
                        <span className="text-[10px] font-mono text-stone-400">
                          {rsvp.side === 'GROOM'
                            ? '• Nhà Trai'
                            : rsvp.side === 'BRIDE'
                            ? '• Nhà Gái'
                            : '• Cả Hai'}
                        </span>
                      </div>

                      {rsvp.wishMessage && (
                        <p className="text-xs text-stone-600 italic bg-white p-2.5 rounded-xl border border-stone-200/60 leading-relaxed">
                          &ldquo;{rsvp.wishMessage}&rdquo;
                        </p>
                      )}

                      <div className="text-[10px] text-stone-400 font-mono">
                        Gửi lúc: {new Date(rsvp.createdAt).toLocaleString('vi-VN')}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteRsvp(selectedForRsvp.id, rsvp.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-500 hover:text-rose-700 transition-colors shrink-0"
                      title="Xóa lời chúc này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-stone-200 bg-stone-50 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedForRsvp(null)}
                className="h-9 px-4 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-medium transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 2. EDIT INVITATION MODAL                                      */}
      {/* ============================================================= */}
      {selectedForEdit && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
        >
          <div className="w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl border border-stone-200 shadow-2xl flex flex-col overflow-hidden animate-scale-up">
            <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
              <h3 className="font-serif text-lg font-medium text-stone-900">
                Chỉnh Sửa Thiệp Cưới — {selectedForEdit.slug}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedForEdit(null)}
                className="p-1.5 rounded-full hover:bg-stone-200 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 flex-1 overflow-y-auto space-y-4 text-xs">
              {/* Storage Path Indicator */}
              <div className="p-3 bg-stone-50 border border-stone-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-stone-600">
                <div className="flex items-center gap-2">
                  <Folder className="w-4 h-4 text-[#8C6D46] shrink-0" />
                  <span className="text-[11px]">
                    Thư mục lưu ảnh:{' '}
                    <code className="font-mono font-semibold text-stone-800 bg-stone-200/70 px-1.5 py-0.5 rounded">
                      /uploads/invitations/{selectedForEdit.slug}/
                    </code>
                  </span>
                </div>
                <div className="text-[11px] font-mono text-stone-500 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-stone-400" />
                  <span>{editForm.galleryImages?.length || 0} ảnh trong album</span>
                </div>
              </div>

              {/* Couple names */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Tên Chú Rể <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.groomName}
                    onChange={(e) => setEditForm({ ...editForm, groomName: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Tên Cô Dâu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.brideName}
                    onChange={(e) => setEditForm({ ...editForm, brideName: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                  />
                </div>
              </div>

              {/* Ceremony Date & Time text */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Ngày & Giờ Tổ Chức
                  </label>
                  <input
                    type="datetime-local"
                    value={editForm.ceremonyDate}
                    onChange={(e) => setEditForm({ ...editForm, ceremonyDate: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Văn Bản Hiển Thị Giờ
                  </label>
                  <input
                    type="text"
                    value={editForm.ceremonyTimeText}
                    onChange={(e) => setEditForm({ ...editForm, ceremonyTimeText: e.target.value })}
                    placeholder="11:00 — Chủ Nhật, 20.12.2026"
                    className="w-full h-10 px-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                  />
                </div>
              </div>

              {/* Venue Info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Tên Trung Tâm / Nhà Hàng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.venueName}
                    onChange={(e) => setEditForm({ ...editForm, venueName: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Mã PIN Chỉnh Sửa Của Khách (6 Số)
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={editForm.editPasscode}
                    onChange={(e) => setEditForm({ ...editForm, editPasscode: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-stone-300 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Địa Chỉ Tổ Chức Hôn Lễ
                </label>
                <input
                  type="text"
                  value={editForm.venueAddress}
                  onChange={(e) => setEditForm({ ...editForm, venueAddress: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Đường Dẫn Bản Đồ Google Maps
                </label>
                <input
                  type="url"
                  value={editForm.googleMapsUrl}
                  onChange={(e) => setEditForm({ ...editForm, googleMapsUrl: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                />
              </div>

              {/* Cover Image */}
              <div className="space-y-1.5 p-3 rounded-xl border border-stone-200 bg-stone-50/60">
                <label className="block font-semibold text-stone-800 text-xs">
                  1. Ảnh Bìa Thiệp Cưới (Hero Cover)
                </label>
                <p className="text-[11px] text-stone-500">
                  💡 Hiển thị toàn màn hình ngay đầu thiệp khi khách mở phong bì.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editForm.coverImage}
                    onChange={(e) => setEditForm({ ...editForm, coverImage: e.target.value })}
                    placeholder="/uploads/invitations/..."
                    className="flex-1 h-9 px-3 rounded-lg border border-stone-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#8C6D46]"
                  />
                  <label className="h-9 px-3 rounded-lg border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 font-medium text-xs flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors shadow-2xs">
                    {isUploadingCover ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#8C6D46]" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-stone-600" />
                    )}
                    <span>{isUploadingCover ? 'Đang tải...' : 'Tải ảnh lên'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isUploadingCover}
                      onChange={handleUploadCover}
                    />
                  </label>
                </div>
                {editForm.coverImage && (
                  <div className="w-20 h-28 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 relative shadow-2xs mt-2">
                    <img
                      src={editForm.coverImage}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Groom & Bride Portraits */}
              <div className="p-3 rounded-xl border border-stone-200 bg-stone-50/60 space-y-3">
                <div>
                  <label className="block font-semibold text-stone-800 text-xs">
                    2. Ảnh Chân Dung Chú Rể & Cô Dâu (Thứ tự: Chú Rể → Cô Dâu)
                  </label>
                  <p className="text-[11px] text-stone-500">
                    💡 Hiển thị ngay sau thông tin hai họ. Tỷ lệ dọc 3:4.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-2.5 rounded-lg border border-stone-200 bg-white space-y-2">
                    <span className="text-[11px] font-semibold text-[#8C6D46]">① Chân Dung Chú Rể (The Groom)</span>
                    <input
                      type="text"
                      value={editForm.groomImage}
                      onChange={(e) => setEditForm({ ...editForm, groomImage: e.target.value })}
                      placeholder="URL ảnh chú rể..."
                      className="w-full h-8 px-2.5 rounded-md border border-stone-300 text-xs"
                    />
                    <input
                      type="text"
                      value={editForm.groomBio}
                      onChange={(e) => setEditForm({ ...editForm, groomBio: e.target.value })}
                      placeholder="Lời giới thiệu Chú Rể (Bio)..."
                      className="w-full h-8 px-2.5 rounded-md border border-stone-300 text-xs"
                    />
                  </div>

                  <div className="p-2.5 rounded-lg border border-stone-200 bg-white space-y-2">
                    <span className="text-[11px] font-semibold text-[#8C6D46]">② Chân Dung Cô Dâu (The Bride)</span>
                    <input
                      type="text"
                      value={editForm.brideImage}
                      onChange={(e) => setEditForm({ ...editForm, brideImage: e.target.value })}
                      placeholder="URL ảnh cô dâu..."
                      className="w-full h-8 px-2.5 rounded-md border border-stone-300 text-xs"
                    />
                    <input
                      type="text"
                      value={editForm.brideBio}
                      onChange={(e) => setEditForm({ ...editForm, brideBio: e.target.value })}
                      placeholder="Lời giới thiệu Cô Dâu (Bio)..."
                      className="w-full h-8 px-2.5 rounded-md border border-stone-300 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Visual Gallery Image Manager */}
              <div className="space-y-2 pt-1 border-t border-stone-100">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block font-medium text-stone-700">
                      Album Ảnh Cưới & Khoảnh Khắc (Gallery)
                    </label>
                    <p className="text-[11px] text-stone-400">
                      Khách mời có thể vuốt xem và phóng to trọn màn hình
                    </p>
                  </div>
                  <label className="h-8 px-3 rounded-xl border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-700 font-medium text-[11px] flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors">
                    {isUploadingGallery ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#8C6D46]" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 text-stone-600" />
                    )}
                    <span>{isUploadingGallery ? 'Đang tải ảnh...' : 'Thêm ảnh album'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      disabled={isUploadingGallery}
                      onChange={handleUploadGallery}
                    />
                  </label>
                </div>

                {(!editForm.galleryImages || editForm.galleryImages.length === 0) ? (
                  <div className="p-4 rounded-2xl border border-dashed border-stone-200 bg-stone-50/60 text-center text-[11px] text-stone-400">
                    Chưa có ảnh nào trong album. Bấm &ldquo;Thêm ảnh album&rdquo; để tải lên.
                  </div>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-1">
                    {editForm.galleryImages.map((img: any, idx: number) => {
                      const imgUrl = typeof img === 'string' ? img : img.url;
                      return (
                        <div
                          key={idx}
                          className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-stone-200 bg-stone-100 shadow-2xs"
                        >
                          <img
                            src={imgUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryImage(idx)}
                            className="absolute top-1 right-1 p-1 rounded-full bg-black/60 hover:bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-all"
                            title="Xóa ảnh này"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Template & Theme Color */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Mẫu Thiết Kế (Template)
                  </label>
                  <select
                    value={editForm.templateId}
                    onChange={(e) => setEditForm({ ...editForm, templateId: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                  >
                    {Object.values(INVITATION_TEMPLATES).map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Nhạc Nền Hôn Lễ
                  </label>
                  <select
                    value={editForm.musicPreset}
                    onChange={(e) => setEditForm({ ...editForm, musicPreset: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                  >
                    <option value="romantic-piano">Romantic Piano</option>
                    <option value="acoustic-love">Acoustic Love</option>
                    <option value="cinematic-orchestral">Cinematic Orchestral</option>
                    <option value="gentle-strings">Gentle Strings</option>
                  </select>
                </div>
              </div>

              {/* Story */}
              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Tiêu Đề & Lời Kể Câu Chuyện Tình Yêu
                </label>
                <input
                  type="text"
                  placeholder="Tiêu đề câu chuyện"
                  value={editForm.storyTitle}
                  onChange={(e) => setEditForm({ ...editForm, storyTitle: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-stone-300 mb-2 focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                />
                <textarea
                  rows={3}
                  placeholder="Đoạn văn lời ngỏ..."
                  value={editForm.storyText}
                  onChange={(e) => setEditForm({ ...editForm, storyText: e.target.value })}
                  className="w-full p-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                />
              </div>

              {/* Status Switch */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="modalIsPublished"
                  checked={editForm.isPublished}
                  onChange={(e) => setEditForm({ ...editForm, isPublished: e.target.checked })}
                  className="w-4 h-4 text-[#8C6D46] rounded focus:ring-[#8C6D46]"
                />
                <label htmlFor="modalIsPublished" className="font-medium text-stone-800 cursor-pointer">
                  Xuất bản công khai thiệp cưới (Cho phép khách truy cập)
                </label>
              </div>

              <div className="pt-4 border-t border-stone-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedForEdit(null)}
                  className="h-10 px-4 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="h-10 px-5 rounded-xl bg-[#8C6D46] hover:bg-[#725735] text-white font-semibold transition-colors disabled:opacity-50"
                >
                  {isSavingEdit ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 3. DELETE CONFIRMATION MODAL                                  */}
      {/* ============================================================= */}
      {selectedForDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
        >
          <div className="w-full max-w-md bg-white rounded-3xl border border-stone-200 shadow-2xl p-6 text-center space-y-4 animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-serif text-lg font-medium text-stone-900">
                Xác Nhận Xóa Thiệp Cưới?
              </h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Bạn sắp xóa vĩnh viễn thiệp của cặp đôi{' '}
                <strong>
                  {selectedForDelete.groomName} & {selectedForDelete.brideName}
                </strong>{' '}
                (đường dẫn <code>/thiep-cuoi/{selectedForDelete.slug}</code>). Toàn bộ danh sách RSVP và lời chúc sẽ bị xóa theo. Hành động này không thể hoàn tác!
              </p>
            </div>

            <div className="pt-2 flex justify-center gap-3 text-xs">
              <button
                type="button"
                onClick={() => setSelectedForDelete(null)}
                className="h-10 px-4 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 font-medium transition-colors"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleDeleteInvitation}
                disabled={isDeleting}
                className="h-10 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Đang xóa...' : 'Đồng Ý Xóa Vĩnh Viễn'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
