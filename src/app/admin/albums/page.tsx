'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Loader2,
  Sparkles,
  ExternalLink,
  Folder,
  Bot,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { DriveMediaPicker } from '@/components/admin/DriveMediaPicker';
import { SingleImagePicker, MultiImagePicker } from '@/components/admin/ImageFieldPicker';
import { TaxonomySelect } from '@/components/admin/TaxonomySelect';
import { formatVND } from '@/lib/utils';

interface PackageOption {
  id: string;
  name: string;
  price: number | string;
  category: string;
  slug: string;
}

interface AlbumItem {
  id: string;
  title: string;
  slug: string;
  subtitle?: string | null;
  concept: string;
  location: string;
  coupleNames: string;
  shootingDate?: string | null;
  description?: string | null;
  coverImage: string;
  featured: boolean;
  orderIndex: number;
  published: boolean;
  views: number;
  metaTitle?: string | null;
  metaDescription?: string | null;
  packageId?: string | null;
  package?: PackageOption | null;
  media?: { id: string; url: string }[];
  createdById?: string | null;
  createdBy?: { id: string; fullName: string; username: string } | null;
  authorName?: string | null;
}

export default function AdminAlbumsPage() {
  const [albums, setAlbums] = useState<AlbumItem[]>([]);
  const [packagesList, setPackagesList] = useState<PackageOption[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [generatingAI, setGeneratingAI] = useState(false);
  const [generatingSEO, setGeneratingSEO] = useState(false);
  const [isAutoGeneratingFromImages, setIsAutoGeneratingFromImages] = useState(false);

  // Google Drive Media Picker State
  const [isDrivePickerOpen, setIsDrivePickerOpen] = useState(false);
  const [drivePickerMode, setDrivePickerMode] = useState<'single' | 'multiple'>('single');

  // Media Library Folder Picker State
  const [isFolderPickerOpen, setIsFolderPickerOpen] = useState(false);
  const [mediaFolders, setMediaFolders] = useState<
    Array<{
      slug: string;
      name: string;
      imageCount: number;
      formattedSize: string;
      coverImage?: string | null;
    }>
  >([]);
  const [loadingFolders, setLoadingFolders] = useState(false);

  const handleOpenFolderPicker = async () => {
    setIsFolderPickerOpen(true);
    setLoadingFolders(true);
    try {
      const res = await fetch('/api/admin/media/folders');
      const data = await res.json();
      if (data.success) {
        setMediaFolders(data.folders || []);
      }
    } catch {
      // Graceful fallback
    } finally {
      setLoadingFolders(false);
    }
  };

  const handleSelectMediaFolder = async (folder: {
    slug: string;
    name: string;
    imageCount: number;
  }) => {
    try {
      const res = await fetch(`/api/admin/media/folders/${encodeURIComponent(folder.slug)}`);
      const data = await res.json();
      if (data.success && data.images && data.images.length > 0) {
        const urls: string[] = data.images.map((img: any) => img.url);
        setFormData((prev) => ({
          ...prev,
          title: prev.title || folder.name,
          slug: prev.slug || folder.slug,
          coverImage: prev.coverImage || urls[0],
          batchMediaUrls: urls.join('\n'),
        }));
        showToast(`Đã nạp toàn bộ ${urls.length} ảnh từ thư mục "${folder.name}" vào Album!`);
        setIsFolderPickerOpen(false);
      } else {
        alert(`Thư mục "${folder.name}" chưa có ảnh nào.`);
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tải ảnh từ thư mục.');
    }
  };

  const handleDriveImportSuccess = (urls: string[]) => {
    if (urls.length === 0) return;

    if (drivePickerMode === 'single') {
      setFormData((prev) => ({
        ...prev,
        coverImage: urls[0],
      }));
      setErrorMessage('');
      showToast('Đã đồng bộ ảnh bìa WebP từ Google Drive thành công!');
    } else {
      setFormData((prev) => {
        const existing = prev.batchMediaUrls.trim();
        const combined = existing ? `${existing}\n${urls.join('\n')}` : urls.join('\n');
        return {
          ...prev,
          batchMediaUrls: combined,
        };
      });
      setErrorMessage('');
      showToast(`Đã đồng bộ ${urls.length} ảnh WebP từ Google Drive vào album thành công!`);
    }
  };

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    subtitle: '',
    concept: 'Outdoor Luxury',
    location: '',
    coupleNames: '',
    shootingDate: '',
    description: '',
    coverImage: '',
    packageId: '',
    featured: false,
    orderIndex: 0,
    published: true,
    metaTitle: '',
    metaDescription: '',
    batchMediaUrls: '', // One URL per line
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/albums');
      const data = await res.json();
      if (data.success) {
        setAlbums(data.albums || []);
      }
    } catch {
      setErrorMessage('Không thể tải danh sách album.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPackages = async () => {
    try {
      const res = await fetch('/api/admin/packages');
      const data = await res.json();
      if (data.success) {
        setPackagesList(data.packages || []);
      }
    } catch {
      // Non-blocking
    }
  };

  useEffect(() => {
    fetchAlbums();
    fetchPackages();
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setCurrentUser({ id: data.user.userId, role: data.user.role });
        }
      })
      .catch(() => {});

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('action') === 'create' || params.get('create') === 'true') {
        openCreateModal();
      }
    }
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      slug: '',
      subtitle: '',
      concept: 'Outdoor Luxury',
      location: '',
      coupleNames: '',
      shootingDate: '',
      description: '',
      coverImage: '',
      packageId: '',
      featured: true,
      orderIndex: albums.length + 1,
      published: true,
      metaTitle: '',
      metaDescription: '',
      batchMediaUrls: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (album: AlbumItem) => {
    setEditingId(album.id);
    const mediaUrlsString = (album.media || []).map((m) => m.url).join('\n');
    setFormData({
      title: album.title,
      slug: album.slug,
      subtitle: album.subtitle || '',
      concept: album.concept,
      location: album.location,
      coupleNames: album.coupleNames,
      shootingDate: album.shootingDate ? album.shootingDate.slice(0, 10) : '',
      description: album.description || '',
      coverImage: album.coverImage,
      packageId: album.packageId || '',
      featured: album.featured,
      orderIndex: album.orderIndex,
      published: album.published,
      metaTitle: album.metaTitle || '',
      metaDescription: album.metaDescription || '',
      batchMediaUrls: mediaUrlsString,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa album "${title}" không?`)) return;

    try {
      const res = await fetch(`/api/admin/albums?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'Đã xóa album!');
        fetchAlbums();
      } else {
        alert(data.error || 'Lỗi khi xóa album.');
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi kết nối.');
    }
  };

  const handleToggleFeatured = async (album: AlbumItem) => {
    try {
      const nextFeatured = !album.featured;
      const res = await fetch('/api/admin/albums', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: album.id, featured: nextFeatured }),
      });
      const data = await res.json();
      if (data.success) {
        setAlbums((prev) =>
          prev.map((a) => (a.id === album.id ? { ...a, featured: nextFeatured } : a))
        );
        showToast(
          nextFeatured
            ? `✨ Đã đưa album "${album.title}" lên Nổi Bật Trang Chủ!`
            : `Đã bỏ cờ nổi bật của album "${album.title}".`
        );
      } else {
        alert(data.error || 'Lỗi khi cập nhật trạng thái nổi bật.');
      }
    } catch {
      alert('Lỗi kết nối khi cập nhật.');
    }
  };

  const handleTitleChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      title: val,
      // Auto-generate slug if creating new
      slug: !editingId
        ? val
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[đĐ]/g, 'd')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
        : prev.slug,
    }));
  };

  const handleGenerateAlbumAI = async () => {
    if (!formData.title && !formData.coupleNames) {
      alert('Vui lòng nhập Tên Album hoặc Tên Dâu Rể trước khi gọi Gemini AI!');
      return;
    }
    setGeneratingAI(true);
    try {
      const res = await fetch('/api/admin/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType: 'ALBUM_STORY',
          title: formData.title,
          coupleNames: formData.coupleNames,
          location: formData.location,
          concept: formData.concept,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Lỗi khi tạo câu chuyện với Gemini.');
      }
      const story = data.result?.story || '';
      setFormData((prev) => ({
        ...prev,
        description: story || prev.description,
      }));
      showToast('✨ Gemini AI đã tạo câu chuyện tình yêu cho album!');
    } catch (err: any) {
      alert(err.message || 'Không thể kết nối Gemini AI.');
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleAutoGenerateFromImages = async () => {
    const urls = formData.batchMediaUrls
      .split('\n')
      .map((u) => u.trim())
      .filter(Boolean);

    if (urls.length === 0 && !formData.coverImage) {
      alert('Vui lòng chọn hoặc tải lên ít nhất 1 ảnh cho Album trước để AI có hình ảnh phân tích!');
      return;
    }

    const allImages = (formData.coverImage ? [formData.coverImage, ...urls] : urls).map((url) => ({ url }));

    try {
      setIsAutoGeneratingFromImages(true);
      setErrorMessage('');
      const res = await fetch('/api/admin/ai/auto-generate-from-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'ALBUM',
          images: allImages,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || 'Lỗi khi gọi AI phân tích album.');
      }
      const resData = data.data || data;

      setFormData((prev) => ({
        ...prev,
        title: resData.title || prev.title,
        slug: resData.slug || prev.slug,
        subtitle: resData.subtitle || prev.subtitle,
        concept: resData.concept || prev.concept,
        location: resData.location || prev.location,
        coupleNames: resData.coupleNames || prev.coupleNames,
        description: resData.description || prev.description,
        coverImage: prev.coverImage || urls[0] || '',
        metaTitle: resData.seoTitle || prev.metaTitle,
        metaDescription: resData.seoDescription || prev.metaDescription,
      }));

      showToast('⚡ AI đã khởi tạo hoàn tất Tên Album, Câu Chuyện Tình Yêu, Concept & Thẻ SEO!');
    } catch (err: any) {
      alert(err.message || 'Lỗi kết nối AI.');
    } finally {
      setIsAutoGeneratingFromImages(false);
    }
  };

  const handleGenerateSeoAI = async () => {
    if (!formData.title.trim() && !formData.coupleNames.trim()) {
      alert('Vui lòng nhập Tên Album hoặc Tên Dâu Rể trước khi tạo SEO!');
      return;
    }
    try {
      setGeneratingSEO(true);
      const res = await fetch('/api/admin/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType: 'SEO_METADATA',
          title: formData.title,
          coupleNames: formData.coupleNames,
          concept: formData.concept,
          location: formData.location,
          description: formData.description,
          type: 'album ảnh cưới / bộ sưu tập',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Lỗi khi tạo thẻ SEO với Gemini.');
      }
      const resData = data.data || data.result;
      if (resData) {
        setFormData((prev) => ({
          ...prev,
          metaTitle: resData.metaTitle || prev.metaTitle,
          metaDescription: resData.metaDescription || prev.metaDescription,
        }));
        showToast('✨ Gemini AI đã tạo thẻ SEO Meta Title & Description cho album!');
      }
    } catch (err: any) {
      alert(err.message || 'Không thể kết nối Gemini AI.');
    } finally {
      setGeneratingSEO(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      // Split batch URLs by newline or comma
      const mediaUrls = formData.batchMediaUrls
        .split(/[\n,]/)
        .map((u) => u.trim())
        .filter((u) => u.length > 5);

      // Explicitly remove non-schema field batchMediaUrls from payload
      const { batchMediaUrls, shootingDate, packageId, ...cleanFormData } = formData;

      const payload = {
        ...cleanFormData,
        shootingDate: shootingDate.trim() ? shootingDate : null,
        packageId: packageId.trim() ? packageId : null,
        mediaUrls: mediaUrls.length > 0 ? mediaUrls : [formData.coverImage],
      };

      const url = '/api/admin/albums';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Lỗi khi lưu album.');
      }

      showToast(data.message || 'Lưu album thành công!');
      setIsModalOpen(false);
      fetchAlbums();
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi kết nối máy chủ.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 relative">
      {toastMessage && (
        <div className="fixed top-24 right-8 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl bg-charcoal-900 text-white text-xs shadow-2xl border border-luxury-500/40 animate-in fade-in duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-light text-charcoal-900">
            Quản Lý Bộ Sưu Tập Ảnh Cưới
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Thêm album mới, tải danh sách ảnh chất lượng cao và phân loại concept cho trang Bộ sưu tập.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-5 py-2.5 bg-luxury-600 hover:bg-luxury-700 active:scale-95 text-white rounded-xl text-xs uppercase tracking-wider font-medium flex items-center gap-2 transition-all shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Album Mới</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh] text-charcoal-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-luxury-600" />
          <span className="text-xs">Đang tải danh sách album...</span>
        </div>
      ) : albums.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-stone-200 text-xs text-charcoal-400">
          Chưa có album nào. Hãy bấm "Thêm Album Mới" ở trên để bắt đầu!
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-charcoal-500 uppercase tracking-wider font-semibold border-b border-stone-200">
                <tr>
                  <th className="py-3.5 px-6">Ảnh Bìa & Tên Album</th>
                  <th className="py-3.5 px-6">Concept / Địa Điểm</th>
                  <th className="py-3.5 px-6">Cặp Đôi</th>
                  <th className="py-3.5 px-6">Số Ảnh</th>
                  <th className="py-3.5 px-6">Trang Chủ</th>
                  <th className="py-3.5 px-6">Trạng Thái</th>
                  <th className="py-3.5 px-6 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-charcoal-700">
                {albums.map((album) => (
                  <tr key={album.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                        <Image
                          src={album.coverImage}
                          alt={album.title}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-serif text-sm font-medium text-charcoal-900">
                          {album.title}
                        </p>
                        <p className="font-mono text-[10px] text-charcoal-400">
                          /albums/{album.slug}
                        </p>
                        <p className="text-[10px] text-stone-400 mt-0.5">
                          Đăng bởi: <span className="text-stone-600 font-medium">{album.authorName || album.createdBy?.fullName || album.createdBy?.username || 'Hệ Thống'}</span>
                        </p>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-champagne text-luxury-800 mb-0.5">
                        {album.concept}
                      </span>
                      <p className="text-[11px] text-charcoal-500 font-light">
                        {album.location}
                      </p>
                    </td>

                    <td className="py-4 px-6 font-medium text-luxury-700">
                      {album.coupleNames}
                    </td>

                    <td className="py-4 px-6 font-mono text-charcoal-500">
                      {album.media?.length || 1} ảnh
                    </td>

                    <td className="py-4 px-6">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(album)}
                        title={album.featured ? 'Bấm để bỏ nổi bật' : 'Bấm để đưa lên Nổi Bật Trang Chủ'}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium transition-all shadow-sm ${
                          album.featured
                            ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                            : 'bg-stone-100 text-stone-500 border border-stone-200 hover:bg-stone-200 hover:text-stone-700'
                        }`}
                      >
                        <Sparkles
                          className={`w-3 h-3 ${album.featured ? 'text-amber-600 fill-amber-500' : 'text-stone-400'}`}
                        />
                        <span>{album.featured ? 'Nổi Bật' : 'Thường'}</span>
                      </button>
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          album.published
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-100 text-stone-500'
                        }`}
                      >
                        {album.published ? 'Hiển Thị' : 'Đang Ẩn'}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      {(() => {
                        const canEditOrDelete =
                          currentUser?.role === 'SUPER_ADMIN' ||
                          currentUser?.role === 'ADMIN' ||
                          !currentUser ||
                          (album.createdById ? album.createdById === currentUser?.id : true);

                        return (
                          <div className="flex items-center justify-end gap-2">
                            <a
                              href={`/albums/${album.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                              title="Xem trang album"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                            {canEditOrDelete && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => openEditModal(album)}
                                  className="p-1.5 text-stone-400 hover:text-luxury-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                                  title="Chỉnh sửa album"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(album.id, album.title)}
                                  className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  title="Xóa album"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT ALBUM MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="max-w-2xl"
        title={editingId ? 'Chỉnh Sửa Album Cưới' : 'Thêm Mới Album Ảnh Cưới'}
        subtitle="Điền thông tin và dán danh sách URL ảnh cưới chất lượng cao (WebP/AVIF)."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl">
              {errorMessage}
            </div>
          )}

          {/* AI ZERO-INPUT ASSISTANT BANNER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-gradient-to-r from-luxury-50 via-amber-50/70 to-luxury-50 border border-luxury-200/80 rounded-2xl shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-luxury-900 text-luxury-400 flex items-center justify-center shadow-xs shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-charcoal-900 flex items-center gap-1.5">
                  <span>Trợ Lý Khởi Tạo Album AI</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-200/80 text-amber-900 font-bold uppercase tracking-wider">
                    Zero-Input
                  </span>
                </h4>
                <p className="text-[11px] text-charcoal-500 font-light">
                  Chỉ cần chọn ảnh – AI tự phân tích concept để đặt tên album, viết lời tựa và tối ưu SEO.
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={(!formData.batchMediaUrls.trim() && !formData.coverImage) || isAutoGeneratingFromImages}
              onClick={handleAutoGenerateFromImages}
              className="px-5 py-2.5 bg-gradient-to-r from-[#2E2824] to-[#4A3E37] hover:from-[#1A1614] hover:to-[#2E2824] text-white text-xs font-semibold rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shrink-0"
              title={
                !formData.batchMediaUrls.trim() && !formData.coverImage
                  ? 'Vui lòng chọn hoặc tải lên ít nhất 1 ảnh trước'
                  : 'AI tự động phân tích ảnh để sinh Tên Album, Slug, Concept, Địa điểm, Câu chuyện tình yêu & SEO'
              }
            >
              {isAutoGeneratingFromImages ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                  <span>AI Đang Phân Tích Bộ Ảnh...</span>
                </>
              ) : (
                <>
                  <span className="text-amber-300 text-sm">⚡</span>
                  <span>AI Tự Động Phân Tích Ảnh & Điền Tất Cả</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1 font-medium">
                Tên Album <span className="text-luxury-600">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Nhập tên album..."
                className="w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-400"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1 font-medium">
                Đường Dẫn URL (Slug) <span className="text-luxury-600">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="duong-dan-album"
                className="w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-luxury-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <TaxonomySelect
              type="concepts"
              label="Concept Chụp"
              value={formData.concept}
              onChange={(val) => setFormData({ ...formData, concept: val })}
              required
            />

            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1 font-medium">
                Địa Điểm Chụp
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Nhập địa điểm chụp..."
                className="w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-400"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1 font-medium">
                Tên Dâu Rể
              </label>
              <input
                type="text"
                value={formData.coupleNames}
                onChange={(e) => setFormData({ ...formData, coupleNames: e.target.value })}
                placeholder="Nhập tên dâu rể..."
                className="w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-400"
              />
            </div>
          </div>

          {/* LINKED PRICING PACKAGE (CROSS-SELL) */}
          <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/70 space-y-2">
            <label className="block text-xs uppercase tracking-wider text-charcoal-700 font-semibold">
              Gói Dịch Vụ Thực Hiện Album Này (Cross-sell)
            </label>
            <select
              value={formData.packageId}
              onChange={(e) => setFormData({ ...formData, packageId: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-400"
            >
              <option value="">[ Không gắn gói dịch vụ ]</option>
              {packagesList.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name} ({formatVND(pkg.price)})
                </option>
              ))}
            </select>
            {formData.packageId && (
              <div className="flex items-center gap-2 pt-1 text-xs text-amber-900 bg-white/90 p-2.5 rounded-xl border border-amber-200/60 shadow-2xs">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Đã liên kết:{' '}
                  <strong>
                    {packagesList.find((p) => p.id === formData.packageId)?.name}
                  </strong>{' '}
                  - {formatVND(packagesList.find((p) => p.id === formData.packageId)?.price || 0)}
                </span>
              </div>
            )}
            <p className="text-[11px] text-charcoal-500 font-light">
              Album sẽ hiển thị thẻ giới thiệu gói chụp này ở cuối bộ ảnh ngoài trang công khai.
            </p>
          </div>

          {/* COVER IMAGE PICKER */}
          <SingleImagePicker
            label="Ảnh Bìa Đại Diện (Cover Image)"
            value={formData.coverImage}
            onChange={(url) => {
              setFormData({ ...formData, coverImage: url });
              if (errorMessage) setErrorMessage('');
            }}
            aspectRatio="portrait"
            required
            modalTitle="Chọn Ảnh Bìa Đại Diện Album"
            helperText="Ảnh bìa hiển thị ngoài trang danh sách và phần đầu album cưới."
          />

          {/* GALLERY MEDIA PICKER */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-wider text-charcoal-600 font-medium">
                Bộ Ảnh Chi Tiết Trong Album
              </label>
              <button
                type="button"
                onClick={handleOpenFolderPicker}
                className="text-[11px] text-amber-800 hover:text-amber-900 font-semibold flex items-center gap-1.5 cursor-pointer bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-300 hover:bg-amber-100 transition-all shadow-2xs"
                title="Gán nhanh toàn bộ ảnh từ 1 thư mục Media có sẵn vào album"
              >
                <Folder className="w-3.5 h-3.5 fill-amber-400 text-amber-600" />
                <span>📁 Nhập Nhanh Toàn Bộ Thư Mục</span>
              </button>
            </div>

            <MultiImagePicker
              values={formData.batchMediaUrls.split('\n').map((u) => u.trim()).filter(Boolean)}
              onChange={(urls) => setFormData({ ...formData, batchMediaUrls: urls.join('\n') })}
              modalTitle="Chọn Ảnh Cho Bộ Sưu Tập Album"
              helperText="Tích chọn nhiều ảnh cùng lúc từ Kho Media. Các ảnh sẽ xuất hiện trong album chi tiết theo đúng thứ tự."
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-wider text-charcoal-600 font-medium">
                Câu Chuyện Tình Yêu / Lời Đề Từ
              </label>
              <button
                type="button"
                disabled={generatingAI}
                onClick={handleGenerateAlbumAI}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-900 hover:bg-stone-800 text-luxury-300 hover:text-luxury-200 border border-luxury-500/40 text-[11px] font-medium rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                {generatingAI ? <Loader2 className="w-3 h-3 animate-spin" /> : <Bot className="w-3 h-3 text-luxury-400" />}
                <span>{generatingAI ? 'Đang viết...' : '✨ AI Tạo Câu Chuyện Tình Yêu'}</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Nhập lời đề từ hoặc bấm nút AI bên trên để Gemini sáng tác tự động theo phong cách điện ảnh..."
              className="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-400 leading-relaxed"
            />
          </div>

          {/* SEO META SECTION */}
          <div className="pt-3 border-t border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-wider text-charcoal-700 font-bold flex items-center gap-1.5">
                <span>Tối Ưu SEO Google (Meta Tags)</span>
              </label>
              <button
                type="button"
                disabled={generatingSEO}
                onClick={handleGenerateSeoAI}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-luxury-300 hover:text-luxury-200 border border-luxury-500/40 text-[11px] font-medium rounded-lg shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
                title="Tự động tạo cặp thẻ Meta Title & Description chuẩn SEO cho Album cưới"
              >
                {generatingSEO ? (
                  <Loader2 className="w-3 h-3 animate-spin text-luxury-400" />
                ) : (
                  <Bot className="w-3 h-3 text-luxury-400" />
                )}
                <span>{generatingSEO ? 'Đang tạo SEO...' : '✨ AI Viết Thẻ SEO'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] uppercase tracking-wider text-charcoal-500 font-medium">
                    SEO Meta Title
                  </label>
                  <span className={`text-[10px] font-mono ${formData.metaTitle.length > 65 ? 'text-red-500 font-bold' : 'text-stone-400'}`}>
                    {formData.metaTitle.length}/65 ký tự
                  </span>
                </div>
                <input
                  type="text"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                  placeholder="Tiêu đề hiển thị trên Google Search..."
                  className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-luxury-400"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] uppercase tracking-wider text-charcoal-500 font-medium">
                    SEO Meta Description
                  </label>
                  <span className={`text-[10px] font-mono ${formData.metaDescription.length > 160 ? 'text-red-500 font-bold' : 'text-stone-400'}`}>
                    {formData.metaDescription.length}/160 ký tự
                  </span>
                </div>
                <input
                  type="text"
                  value={formData.metaDescription}
                  onChange={(e) =>
                    setFormData({ ...formData, metaDescription: e.target.value })
                  }
                  placeholder="Mô tả tóm tắt hiển thị dưới link Google..."
                  className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-luxury-400"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3">
            <label className={`flex-1 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer ${
              formData.featured 
                ? 'bg-amber-50/90 border-amber-300 text-amber-950 ring-1 ring-amber-300/60' 
                : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
            }`}>
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) =>
                  setFormData({ ...formData, featured: e.target.checked })
                }
                className="w-4 h-4 text-luxury-600 accent-luxury-600 rounded cursor-pointer"
              />
              <span className="text-xs font-medium flex items-center gap-1.5">
                <Sparkles className={`w-3.5 h-3.5 ${formData.featured ? 'text-amber-600 fill-amber-500' : 'text-stone-400'}`} />
                Đưa lên Bộ Sưu Tập Nổi Bật Trang Chủ (Featured on Homepage)
              </span>
            </label>

            <label className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer ${
              formData.published 
                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950' 
                : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100'
            }`}>
              <input
                type="checkbox"
                checked={formData.published}
                onChange={(e) =>
                  setFormData({ ...formData, published: e.target.checked })
                }
                className="w-4 h-4 text-emerald-600 accent-emerald-600 rounded cursor-pointer"
              />
              <span className="text-xs font-medium">Xuất bản công khai</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2 text-xs font-medium text-charcoal-600 hover:bg-stone-100 rounded-xl"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-charcoal-900 hover:bg-charcoal-800 text-white rounded-xl text-xs uppercase tracking-wider font-medium flex items-center gap-2 shadow disabled:opacity-60 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang Lưu Album...</span>
                </>
              ) : (
                <span>{editingId ? 'Cập Nhật Album' : 'Tạo Album Mới'}</span>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* MEDIA LIBRARY FOLDER PICKER MODAL */}
      <Modal
        isOpen={isFolderPickerOpen}
        onClose={() => setIsFolderPickerOpen(false)}
        maxWidth="max-w-2xl"
        title="Chọn Thư Mục Trong Kho Media Để Gán Vào Album"
        subtitle="Toàn bộ hình ảnh trong thư mục được chọn sẽ tự động được gán vào danh sách ảnh album"
      >
        <div className="space-y-4 pt-2">
          {loadingFolders ? (
            <div className="py-12 text-center text-charcoal-400 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-luxury-600 mx-auto" />
              <p className="text-xs">Đang tải danh sách thư mục media...</p>
            </div>
          ) : mediaFolders.length === 0 ? (
            <div className="py-10 text-center border-2 border-dashed border-stone-200 rounded-2xl p-6 space-y-3">
              <Folder className="w-10 h-10 fill-amber-100 text-amber-400 mx-auto" />
              <div className="space-y-1">
                <h4 className="font-serif text-sm font-semibold text-charcoal-900">
                  Chưa có thư mục album nào trong Kho Media
                </h4>
                <p className="text-xs text-stone-500">
                  Bạn có thể vào trang "Kho Lưu Trữ Media" để tạo thư mục hoặc dùng nút "Import Từ Google Drive" để tải cả thư mục về máy chủ.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
              {mediaFolders.map((folder) => (
                <div
                  key={folder.slug}
                  onClick={() => handleSelectMediaFolder(folder)}
                  className="p-3.5 rounded-2xl border border-stone-200 hover:border-luxury-500 hover:bg-luxury-50/50 hover:shadow-md transition-all cursor-pointer flex items-center gap-3.5 group"
                >
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0 flex items-center justify-center">
                    {folder.coverImage ? (
                      <img
                        src={folder.coverImage}
                        alt={folder.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <Folder className="w-6 h-6 fill-amber-200 text-amber-500" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif text-xs font-semibold text-charcoal-900 group-hover:text-luxury-800 truncate">
                      {folder.name}
                    </h4>
                    <p className="text-[11px] text-stone-500 font-mono mt-0.5">
                      {folder.imageCount} ảnh WebP • {folder.formattedSize}
                    </p>
                    <span className="text-[10px] text-luxury-700 font-medium group-hover:underline mt-1 inline-block">
                      Chọn thư mục này →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setIsFolderPickerOpen(false)}
              className="px-4 py-2 rounded-xl border border-stone-200 text-charcoal-600 text-xs font-medium hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </Modal>

      {/* GOOGLE DRIVE MEDIA PICKER MODAL */}
      <DriveMediaPicker
        isOpen={isDrivePickerOpen}
        onClose={() => setIsDrivePickerOpen(false)}
        onSuccess={handleDriveImportSuccess}
        mode={drivePickerMode}
        title={
          drivePickerMode === 'single'
            ? 'Chọn 01 Ảnh Bìa Đại Diện Album Từ Google Drive'
            : 'Chọn Bộ Ảnh Chi Tiết Album Từ Google Drive'
        }
      />
    </div>
  );
}

