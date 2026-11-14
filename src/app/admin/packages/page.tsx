'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Check,
  X,
  Image as ImageIcon,
  Bot,
  BookOpen,
  Images,
  Share2,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { formatVND } from '@/lib/utils';
import { DriveMediaPicker } from '@/components/admin/DriveMediaPicker';
import { SingleImagePicker, MultiImagePicker } from '@/components/admin/ImageFieldPicker';
import { TaxonomySelect } from '@/components/admin/TaxonomySelect';
import { PricingFaqManager } from '@/components/admin/PricingFaqManager';
import { PackageAddonManager } from '@/components/admin/PackageAddonManager';
import { FacebookPostGeneratorModal, FacebookPostData } from '@/components/admin/FacebookPostGeneratorModal';

export interface LinkedAlbumItem {
  id: string;
  title: string;
  slug: string;
  coverImage?: string;
  concept?: string;
  location?: string;
  packageId?: string | null;
  published?: boolean;
}

export interface LinkedBlogItem {
  id: string;
  title: string;
  slug: string;
  coverImage?: string;
  category?: string;
  packageId?: string | null;
}

interface PackageItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  subtitle?: string | null;
  price: number | string;
  originalPrice?: number | string | null;
  unit: string;
  coverImage?: string;
  demoImages?: string | null;
  highlightPoints?: string | null;
  isPopular: boolean;
  isFeatured: boolean;
  orderIndex: number;
  published: boolean;
  inclusions: string;
  deliverables?: string | null;
  albums?: LinkedAlbumItem[];
  blogPosts?: LinkedBlogItem[];
}

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [generatingAI, setGeneratingAI] = useState(false);

  // Available Albums for Package linking
  const [availableAlbums, setAvailableAlbums] = useState<LinkedAlbumItem[]>([]);
  const [albumSearchTerm, setAlbumSearchTerm] = useState('');

  // Available Blog Posts for Package linking
  const [availableBlogPosts, setAvailableBlogPosts] = useState<LinkedBlogItem[]>([]);
  const [blogSearchTerm, setBlogSearchTerm] = useState('');

  // Google Drive Media Picker Modal State
  const [isDrivePickerOpen, setIsDrivePickerOpen] = useState(false);
  const [drivePickerMode, setDrivePickerMode] = useState<'single' | 'multiple'>('single');

  // Facebook Fanpage Post Generator State
  const [isFacebookModalOpen, setIsFacebookModalOpen] = useState(false);
  const [facebookModalData, setFacebookModalData] = useState<FacebookPostData | null>(null);

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
        const existing = prev.demoImagesText.trim();
        const combined = existing ? `${existing}\n${urls.join('\n')}` : urls.join('\n');
        return {
          ...prev,
          demoImagesText: combined,
        };
      });
      setErrorMessage('');
      showToast(`Đã tải về & chuyển đổi ${urls.length} ảnh demo WebP từ Google Drive thành công!`);
    }
  };

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category: '',
    subtitle: '',
    price: '' as string | number,
    originalPrice: '' as string | number,
    unit: 'trọn gói',
    coverImage: '',
    highlightPointsList: [] as string[],
    demoImagesText: '',
    isPopular: false,
    isFeatured: false,
    orderIndex: 0,
    published: true,
    inclusionsList: [] as string[],
    deliverables: '',
    albumIds: [] as string[],
    blogPostIds: [] as string[],
  });

  const existingCategories = React.useMemo(() => {
    return Array.from(
      new Set(
        packages
          .map((p) => p.category?.trim())
          .filter((c): c is string => Boolean(c))
      )
    );
  }, [packages]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/packages');
      const data = await res.json();
      if (data.success) {
        setPackages(data.packages || []);
      }
    } catch {
      setErrorMessage('Không thể tải danh sách gói dịch vụ.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAlbums = async () => {
    try {
      const res = await fetch('/api/admin/albums');
      const data = await res.json();
      if (data?.success && Array.isArray(data.albums)) {
        setAvailableAlbums(
          data.albums.map((a: any) => ({
            id: a.id,
            title: a.title,
            slug: a.slug,
            coverImage: a.coverImage,
            concept: a.concept,
            location: a.location,
            packageId: a.packageId,
            published: a.published,
          }))
        );
      }
    } catch (err) {
      console.warn('Failed to load albums for package linking:', err);
    }
  };

  const fetchBlogPosts = async () => {
    try {
      const res = await fetch('/api/admin/blog');
      const data = await res.json();
      if (data?.success && Array.isArray(data.posts)) {
        setAvailableBlogPosts(
          data.posts.map((p: any) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            coverImage: p.coverImage,
            category: p.category,
            packageId: p.packageId,
          }))
        );
      }
    } catch (err) {
      console.warn('Failed to load blog posts for package linking:', err);
    }
  };

  useEffect(() => {
    fetchPackages();
    fetchAlbums();
    fetchBlogPosts();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setAlbumSearchTerm('');
    setBlogSearchTerm('');
    setFormData({
      name: '',
      slug: '',
      category: existingCategories[0] || '',
      subtitle: '',
      price: '',
      originalPrice: '',
      unit: 'trọn gói',
      coverImage: '',
      highlightPointsList: [],
      demoImagesText: '',
      isPopular: false,
      isFeatured: false,
      orderIndex: packages.length + 1,
      published: true,
      inclusionsList: [],
      deliverables: '',
      albumIds: [],
      blogPostIds: [],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (pkg: PackageItem) => {
    setEditingId(pkg.id);
    setAlbumSearchTerm('');
    setBlogSearchTerm('');

    let parsedInclusions: string[] = [];
    try {
      parsedInclusions = JSON.parse(pkg.inclusions || '[]');
      if (!Array.isArray(parsedInclusions)) parsedInclusions = [];
    } catch {
      parsedInclusions = pkg.inclusions ? [pkg.inclusions] : [];
    }

    let parsedHighlights: string[] = [];
    try {
      parsedHighlights = JSON.parse(pkg.highlightPoints || '[]');
      if (!Array.isArray(parsedHighlights)) parsedHighlights = [];
    } catch {
      parsedHighlights = pkg.highlightPoints ? [pkg.highlightPoints] : [];
    }

    let parsedDemoImages: string[] = [];
    try {
      parsedDemoImages = JSON.parse(pkg.demoImages || '[]');
      if (!Array.isArray(parsedDemoImages)) parsedDemoImages = [];
    } catch {
      parsedDemoImages = pkg.demoImages ? [pkg.demoImages] : [];
    }

    const linkedAlbumIds = Array.isArray(pkg.albums) && pkg.albums.length > 0
      ? pkg.albums.map((a) => a.id)
      : availableAlbums.filter((a) => a.packageId === pkg.id).map((a) => a.id);

    const linkedPostIds = Array.isArray(pkg.blogPosts) && pkg.blogPosts.length > 0
      ? pkg.blogPosts.map((b) => b.id)
      : availableBlogPosts.filter((b) => b.packageId === pkg.id).map((b) => b.id);

    setFormData({
      name: pkg.name,
      slug: pkg.slug,
      category: pkg.category,
      subtitle: pkg.subtitle || '',
      price: Number(pkg.price),
      originalPrice: pkg.originalPrice ? Number(pkg.originalPrice) : '',
      unit: pkg.unit || 'trọn gói',
      coverImage: pkg.coverImage || '',
      highlightPointsList: parsedHighlights,
      demoImagesText: parsedDemoImages.join('\n'),
      isPopular: pkg.isPopular,
      isFeatured: pkg.isFeatured,
      orderIndex: pkg.orderIndex,
      published: pkg.published,
      inclusionsList: parsedInclusions,
      deliverables: pkg.deliverables || '',
      albumIds: linkedAlbumIds,
      blogPostIds: linkedPostIds,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa gói "${name}" không?`)) return;

    try {
      const res = await fetch(`/api/admin/packages?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'Đã xóa gói dịch vụ!');
        fetchPackages();
      } else {
        alert(data.error || 'Lỗi khi xóa.');
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi kết nối.');
    }
  };

  const handleNameChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      name: val,
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

  const handleAddInclusion = () => {
    setFormData({
      ...formData,
      inclusionsList: [...formData.inclusionsList, ''],
    });
  };

  const handleRemoveInclusion = (idx: number) => {
    setFormData({
      ...formData,
      inclusionsList: formData.inclusionsList.filter((_, i) => i !== idx),
    });
  };

  const handleInclusionChange = (idx: number, val: string) => {
    const updated = [...formData.inclusionsList];
    updated[idx] = val;
    setFormData({ ...formData, inclusionsList: updated });
  };

  const handleAddHighlight = () => {
    setFormData({
      ...formData,
      highlightPointsList: [...formData.highlightPointsList, ''],
    });
  };

  const handleRemoveHighlight = (idx: number) => {
    setFormData({
      ...formData,
      highlightPointsList: formData.highlightPointsList.filter((_, i) => i !== idx),
    });
  };

  const handleHighlightChange = (idx: number, val: string) => {
    const updated = [...formData.highlightPointsList];
    updated[idx] = val;
    setFormData({ ...formData, highlightPointsList: updated });
  };

  const handleGeneratePackageAI = async () => {
    if (!formData.name) {
      alert('Vui lòng nhập Tên gói chụp trước khi dùng AI!');
      return;
    }
    setGeneratingAI(true);
    try {
      const res = await fetch('/api/admin/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType: 'PACKAGE_HIGHLIGHTS',
          packageName: formData.name,
          category: formData.category,
          price: formData.price ? `${formData.price} VNĐ` : '',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Lỗi khi tạo nội dung với Gemini.');
      }
      const r = data.result;
      setFormData((prev) => ({
        ...prev,
        subtitle: r.subtitle || prev.subtitle,
        highlightPointsList:
          r.highlightPoints && Array.isArray(r.highlightPoints) && r.highlightPoints.length > 0
            ? r.highlightPoints
            : prev.highlightPointsList,
        deliverables: r.deliverables || prev.deliverables,
      }));
      showToast('✨ Gemini AI đã tạo điểm nhấn và mô tả cho gói cưới!');
    } catch (err: any) {
      alert(err.message || 'Không thể kết nối Gemini AI.');
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      const parsedDemoUrls = formData.demoImagesText
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const sanitizePriceVal = (val: any) => {
        if (typeof val === 'number') return Math.floor(val);
        if (typeof val === 'string') {
          const cleaned = val.replace(/[^0-9]/g, '');
          const parsed = parseInt(cleaned, 10);
          return isNaN(parsed) ? 0 : parsed;
        }
        return 0;
      };

      const payload = {
        name: formData.name,
        slug: formData.slug,
        category: formData.category,
        subtitle: formData.subtitle,
        price: sanitizePriceVal(formData.price),
        originalPrice: formData.originalPrice ? sanitizePriceVal(formData.originalPrice) : null,
        unit: formData.unit,
        coverImage: formData.coverImage,
        highlightPoints: formData.highlightPointsList.filter((x) => x.trim().length > 0),
        demoImages: parsedDemoUrls,
        isPopular: formData.isPopular,
        isFeatured: formData.isFeatured,
        orderIndex: Number(formData.orderIndex),
        published: formData.published,
        inclusions: formData.inclusionsList.filter((x) => x.trim().length > 0),
        deliverables: formData.deliverables,
        albumIds: formData.albumIds,
        blogPostIds: formData.blogPostIds,
      };

      const url = '/api/admin/packages';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Lỗi khi lưu gói.');
      }

      showToast(data.message || 'Lưu gói dịch vụ thành công!');
      setIsModalOpen(false);
      fetchPackages();
      fetchBlogPosts();
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi kết nối.');
    } finally {
      setSubmitting(false);
    }
  };

  // Preview parsed demo images in modal
  const previewDemoImages = formData.demoImagesText
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.startsWith('http://') || s.startsWith('https://'));

  // Open Facebook Post Generator for a Package (from table row)
  const handleOpenFacebookModalForPackage = (pkg: PackageItem) => {
    // 1. Parse demo images
    let parsedDemoImages: string[] = [];
    try {
      parsedDemoImages = JSON.parse(pkg.demoImages || '[]');
      if (!Array.isArray(parsedDemoImages)) parsedDemoImages = [];
    } catch {
      parsedDemoImages = pkg.demoImages
        ? pkg.demoImages.split('\n').map((s) => s.trim()).filter(Boolean)
        : [];
    }

    // 2. Parse highlights & inclusions
    let parsedHighlights: string[] = [];
    try {
      parsedHighlights = JSON.parse(pkg.highlightPoints || '[]');
      if (!Array.isArray(parsedHighlights)) parsedHighlights = [];
    } catch {
      parsedHighlights = pkg.highlightPoints ? [pkg.highlightPoints] : [];
    }

    let parsedInclusions: string[] = [];
    try {
      parsedInclusions = JSON.parse(pkg.inclusions || '[]');
      if (!Array.isArray(parsedInclusions)) parsedInclusions = [];
    } catch {
      parsedInclusions = pkg.inclusions ? [pkg.inclusions] : [];
    }

    // 3. Find linked published albums
    const linkedFromPkg = Array.isArray(pkg.albums) && pkg.albums.length > 0 ? pkg.albums : [];
    const linkedFromAvailable = availableAlbums.filter((a) => a.packageId === pkg.id);
    const allLinked = linkedFromPkg.length > 0 ? linkedFromPkg : linkedFromAvailable;
    const publishedLinked = allLinked
      .filter((a: any) => a.published !== false && a.title && a.slug)
      .map((a: any) => ({
        title: a.title,
        slug: a.slug,
      }));

    // 4. Combine images: cover image first, followed by demo images
    const combinedImages = [
      pkg.coverImage?.trim(),
      ...parsedDemoImages.map((u) => u.trim()),
    ].filter((u): u is string => Boolean(u));

    const uniqueImages = Array.from(new Set(combinedImages));

    setFacebookModalData({
      title: pkg.name,
      slug: pkg.slug,
      type: 'PACKAGE',
      category: pkg.category,
      subtitle: pkg.subtitle || '',
      summary: pkg.subtitle || '',
      price: pkg.price,
      originalPrice: pkg.originalPrice,
      unit: pkg.unit || 'trọn gói',
      highlights: parsedHighlights,
      features: parsedInclusions,
      deliverables: pkg.deliverables || '',
      deliveryTime: pkg.deliverables || '07 - 10 ngày làm việc (trả file gốc trong 24h)',
      coverImage: pkg.coverImage || '',
      images: uniqueImages,
      linkedAlbums: publishedLinked,
    });
    setIsFacebookModalOpen(true);
  };

  // Open Facebook Post Generator from Form (when editing package)
  const handleOpenFacebookModalFromForm = () => {
    if (!editingId) return;
    const currentPkg = packages.find((p) => p.id === editingId);
    if (!currentPkg) return;

    const demoImages = formData.demoImagesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const linkedAlbums = availableAlbums
      .filter((a) => formData.albumIds.includes(a.id) && a.published !== false && a.title && a.slug)
      .map((a) => ({
        title: a.title,
        slug: a.slug,
      }));

    const combinedImages = Array.from(
      new Set([formData.coverImage?.trim(), ...demoImages].filter((u): u is string => Boolean(u)))
    );

    setFacebookModalData({
      title: formData.name || currentPkg.name,
      slug: formData.slug || currentPkg.slug,
      type: 'PACKAGE',
      category: formData.category || currentPkg.category,
      subtitle: formData.subtitle || currentPkg.subtitle || '',
      summary: formData.subtitle || currentPkg.subtitle || '',
      price: formData.price || currentPkg.price,
      originalPrice: formData.originalPrice || currentPkg.originalPrice,
      unit: formData.unit || currentPkg.unit || 'trọn gói',
      highlights: formData.highlightPointsList.length > 0 ? formData.highlightPointsList : [],
      features: formData.inclusionsList.length > 0 ? formData.inclusionsList : [],
      deliverables: formData.deliverables || currentPkg.deliverables || '',
      deliveryTime: formData.deliverables || currentPkg.deliverables || '07 - 10 ngày làm việc (trả file gốc trong 24h)',
      coverImage: formData.coverImage || currentPkg.coverImage || '',
      images: combinedImages,
      linkedAlbums,
    });
    setIsFacebookModalOpen(true);
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
            Quản Lý Bảng Giá & Dịch Vụ Cưới
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Thiết lập ảnh bìa, bộ ảnh demo thực tế, tóm tắt 3 điểm nhấn ngoài card và chi tiết 100% quyền lợi.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-5 py-2.5 bg-luxury-600 hover:bg-luxury-700 active:scale-95 text-white rounded-xl text-xs uppercase tracking-wider font-medium flex items-center gap-2 transition-all shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Gói Dịch Vụ Mới</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh] text-charcoal-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-luxury-600" />
          <span className="text-xs">Đang tải danh sách gói dịch vụ...</span>
        </div>
      ) : packages.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-stone-200 text-xs text-charcoal-400">
          Chưa có gói dịch vụ nào. Hãy bấm "Thêm Gói Dịch Vụ Mới" ở trên!
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-charcoal-500 uppercase tracking-wider font-semibold border-b border-stone-200">
                <tr>
                  <th className="py-3.5 px-6">Ảnh & Tên Gói Chụp</th>
                  <th className="py-3.5 px-6">Phân Loại</th>
                  <th className="py-3.5 px-6">Giá Niêm Yết (VND)</th>
                  <th className="py-3.5 px-6">Đơn Vị</th>
                  <th className="py-3.5 px-6">Huy Hiệu</th>
                  <th className="py-3.5 px-6">Trạng Thái</th>
                  <th className="py-3.5 px-6 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-charcoal-700">
                {packages.map((pkg) => {
                  let demoCount = 0;
                  try {
                    const parsed = JSON.parse(pkg.demoImages || '[]');
                    demoCount = Array.isArray(parsed) ? parsed.length : 0;
                  } catch {
                    demoCount = 0;
                  }

                  return (
                    <tr key={pkg.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-16 rounded-lg overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                            {pkg.coverImage ? (
                              <img
                                src={pkg.coverImage}
                                alt={pkg.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-stone-400">
                                <ImageIcon className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-serif text-sm font-medium text-charcoal-900">
                              {pkg.name}
                            </p>
                            <p className="text-[11px] text-charcoal-400 line-clamp-1 font-light max-w-xs">
                              {pkg.subtitle || 'Chưa có mô tả ngắn'}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-stone-400 font-mono">
                                {demoCount > 0 ? `${demoCount} ảnh demo thực tế` : 'Chưa có ảnh demo'}
                              </span>
                              {Array.isArray(pkg.albums) && pkg.albums.length > 0 && (
                                <>
                                  <span className="text-stone-300">•</span>
                                  <span className="text-[10px] text-indigo-800 bg-indigo-100/70 px-1.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1">
                                    <Images className="w-2.5 h-2.5" />
                                    {pkg.albums.length} album
                                  </span>
                                </>
                              )}
                              {Array.isArray(pkg.blogPosts) && pkg.blogPosts.length > 0 && (
                                <>
                                  <span className="text-stone-300">•</span>
                                  <span className="text-[10px] text-amber-800 bg-amber-100/70 px-1.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1">
                                    <BookOpen className="w-2.5 h-2.5" />
                                    {pkg.blogPosts.length} bài viết
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-champagne text-luxury-800">
                          {pkg.category || 'Chưa phân loại'}
                        </span>
                      </td>

                      <td className="py-4 px-6 font-mono font-medium text-charcoal-900">
                        {formatVND(pkg.price)}
                        {pkg.originalPrice && (
                          <p className="text-[10px] text-charcoal-400 line-through">
                            {formatVND(pkg.originalPrice)}
                          </p>
                        )}
                      </td>

                      <td className="py-4 px-6 text-charcoal-500 font-light">
                        /{pkg.unit}
                      </td>

                      <td className="py-4 px-6">
                        {pkg.isPopular ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-luxury-100 text-luxury-800">
                            <Sparkles className="w-2.5 h-2.5" />
                            Phổ Biến Nhất
                          </span>
                        ) : (
                          <span className="text-[10px] text-charcoal-400">Tiêu chuẩn</span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            pkg.published
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-stone-100 text-stone-500'
                          }`}
                        >
                          {pkg.published ? 'Hiển Thị' : 'Đang Ẩn'}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenFacebookModalForPackage(pkg)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Tạo bài đăng Fanpage Facebook cho gói này"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(pkg)}
                            className="p-1.5 text-stone-400 hover:text-luxury-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                            title="Chỉnh sửa gói"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(pkg.id, pkg.name)}
                            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Xóa gói"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION QUẢN LÝ DỊCH VỤ CỘNG THÊM (ADD-ONS DỰ TOÁN) */}
      <div className="pt-4">
        <PackageAddonManager onSuccessNotification={(msg) => showToast(msg)} />
      </div>

      {/* SECTION QUẢN LÝ CÂU HỎI THƯỜNG GẶP (FAQ - TRANG BẢNG GIÁ) */}
      <div className="pt-2">
        <PricingFaqManager onSuccessNotification={(msg) => showToast(msg)} />
      </div>

      {/* CREATE / EDIT PACKAGE MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="max-w-3xl"
        title={editingId ? 'Chỉnh Sửa Gói Dịch Vụ Cưới' : 'Thêm Mới Gói Dịch Vụ Cưới'}
        subtitle="Cấu hình card ảnh sang trọng, bộ ảnh demo thực tế và chi tiết quyền lợi cam kết."
      >
        <form onSubmit={handleSubmit} className="space-y-5 max-h-[80vh] overflow-y-auto pr-1">
          {errorMessage && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* AI ASSISTANT BANNER */}
          <div className="bg-stone-900 border border-luxury-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-luxury-500/20 border border-luxury-500/40 flex items-center justify-center text-luxury-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-serif tracking-wider uppercase text-white font-medium">Trợ Lý Sáng Tạo Gói Cưới</h4>
                <p className="text-[11px] text-stone-400">Tự động gợi ý subtitle sang trọng, 3 điểm nhấn đắt giá và sản phẩm bàn giao.</p>
              </div>
            </div>
            <button
              type="button"
              disabled={generatingAI}
              onClick={handleGeneratePackageAI}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-luxury-500 to-luxury-600 hover:from-luxury-400 hover:to-luxury-500 text-stone-950 text-xs font-semibold rounded-xl shadow transition-all duration-300 disabled:opacity-50 cursor-pointer shrink-0"
            >
              {generatingAI ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{generatingAI ? 'Đang Sáng Tạo...' : '✨ AI Gợi Ý Điểm Nhấn & Mô Tả'}</span>
            </button>
          </div>

          {/* BASIC INFO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pkg-name-input" className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1 font-medium">
                Tên Gói Chụp <span className="text-luxury-600">*</span>
              </label>
              <input
                id="pkg-name-input"
                aria-label="Tên Gói Chụp"
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-400"
              />
            </div>

            <div>
              <label htmlFor="pkg-slug-input" className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1 font-medium">
                Đường Dẫn URL (Slug) <span className="text-luxury-600">*</span>
              </label>
              <input
                id="pkg-slug-input"
                aria-label="Đường Dẫn URL (Slug)"
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-luxury-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="pkg-category-input" className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1 font-medium">
                Danh Mục Gói Dịch Vụ <span className="text-luxury-600">*</span>
              </label>
              <input
                id="pkg-category-input"
                list="existing-categories"
                type="text"
                required
                placeholder="Nhập hoặc chọn danh mục (vd: PRE-WEDDING...)"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-400 font-medium"
              />
              <datalist id="existing-categories">
                {existingCategories.map((cat, idx) => (
                  <option key={idx} value={cat} />
                ))}
              </datalist>
            </div>

            <div>
              <label htmlFor="pkg-price-input" className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1 font-medium">
                Giá Ưu Đãi (VND) <span className="text-luxury-600">*</span>
              </label>
              <input
                id="pkg-price-input"
                aria-label="Giá Ưu Đãi"
                type="number"
                required
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: e.target.value === '' ? '' : Number(e.target.value),
                  })
                }
                className="w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-luxury-400"
              />
            </div>

            <div>
              <label htmlFor="pkg-origprice-input" className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1 font-medium">
                Giá Gốc (Gạch ngang)
              </label>
              <input
                id="pkg-origprice-input"
                aria-label="Giá Gốc"
                type="number"
                value={formData.originalPrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    originalPrice: e.target.value === '' ? '' : Number(e.target.value),
                  })
                }
                className="w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-luxury-400"
              />
            </div>
          </div>

          <div>
            <label htmlFor="pkg-subtitle-input" className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1 font-medium">
              Mô Tả Ngắn (Subtitle)
            </label>
            <input
              id="pkg-subtitle-input"
              aria-label="Mô Tả Ngắn"
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-400"
            />
          </div>

          {/* COVER IMAGE */}
          <SingleImagePicker
            label="Ảnh Bìa Đại Diện Gói (Tỉ Lệ 4:5 Sang Trọng)"
            value={formData.coverImage}
            onChange={(url) => {
              setFormData({ ...formData, coverImage: url });
              if (errorMessage) setErrorMessage('');
            }}
            aspectRatio="portrait"
            required
            modalTitle="Chọn Ảnh Bìa Gói Dịch Vụ Cưới"
            helperText="Ảnh bìa hiển thị ngoài bảng giá và thẻ dịch vụ nổi bật."
          />

          {/* 3 CORE SUMMARY HIGHLIGHT POINTS */}
          <div className="bg-stone-50/70 p-4 rounded-2xl border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs uppercase tracking-wider text-charcoal-700 font-semibold block">
                  3 Điểm Nhấn Cốt Lõi (Hiển Thị Ngoài Card)
                </label>
                <p className="text-[11px] text-charcoal-400 font-light">
                  Chỉ hiển thị 3 điểm quan trọng nhất kèm icon tinh tế thay vì tick dày đặc.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddHighlight}
                className="text-[11px] text-luxury-600 hover:text-luxury-800 font-medium flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Thêm</span>
              </button>
            </div>

            <div className="space-y-2">
              {formData.highlightPointsList.length === 0 ? (
                <div className="text-center py-3 bg-white/70 rounded-xl border border-dashed border-stone-300 text-stone-400 text-xs font-light">
                  Chưa có điểm nhấn rút gọn. Bấm &quot;Thêm&quot; để tạo điểm nhấn hiển thị trên card (nếu cần).
                </div>
              ) : (
                formData.highlightPointsList.map((pt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-luxury-600 w-5 text-center font-bold">
                      0{i + 1}
                    </span>
                    <input
                      type="text"
                      aria-label={`Điểm nhấn nổi bật ${i + 1}`}
                      value={pt}
                      onChange={(e) => handleHighlightChange(i, e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-400"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveHighlight(i)}
                      className="p-1 text-stone-400 hover:text-red-500 rounded cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* DEMO IMAGES GALLERY LIST */}
          <div className="bg-stone-50/70 p-4 rounded-2xl border border-stone-200 space-y-3">
            <MultiImagePicker
              label="Bộ Ảnh Thực Tế & Album Mẫu Trong Modal"
              values={formData.demoImagesText.split('\n').map((u) => u.trim()).filter(Boolean)}
              onChange={(urls) => setFormData({ ...formData, demoImagesText: urls.join('\n') })}
              modalTitle="Chọn Ảnh Thực Tế Cho Gói Dịch Vụ Cưới"
              helperText="Khách hàng có thể bấm xem chi tiết bộ ảnh mẫu và sản phẩm thật (album, ảnh cổng, váy) trong modal gói."
            />
          </div>

          {/* FULL INCLUSIONS BULLET POINTS EDITOR */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <label className="text-xs uppercase tracking-wider text-charcoal-700 font-semibold block">
                  Chi Tiết 100% Quyền Lợi & Sản Phẩm Bàn Giao
                </label>
                <p className="text-[11px] text-charcoal-400 font-light">
                  Hiển thị đầy đủ trong bảng chi tiết và Popup Modal.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddInclusion}
                className="text-[11px] text-luxury-600 hover:text-luxury-800 font-medium flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Thêm quyền lợi</span>
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {formData.inclusionsList.length === 0 ? (
                <div className="text-center py-4 bg-white/70 rounded-xl border border-dashed border-stone-300 text-stone-400 text-xs font-light">
                  Chưa có chi tiết quyền lợi nào. Bấm &quot;Thêm quyền lợi&quot; để nhập nội dung thực tế.
                </div>
              ) : (
                formData.inclusionsList.map((inc, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-luxury-500 shrink-0" />
                    <input
                      type="text"
                      aria-label={`Chi tiết quyền lợi ${i + 1}`}
                      value={inc}
                      onChange={(e) => handleInclusionChange(i, e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-luxury-400"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveInclusion(i)}
                      className="p-1 text-stone-400 hover:text-red-500 rounded cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <label htmlFor="pkg-deliverables-input" className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1 font-medium">
              Thời Gian & Cam Kết Bàn Giao File
            </label>
            <input
              id="pkg-deliverables-input"
              aria-label="Thời Gian & Cam Kết Bàn Giao File"
              type="text"
              value={formData.deliverables}
              onChange={(e) =>
                setFormData({ ...formData, deliverables: e.target.value })
              }
              className="w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-400"
            />
          </div>

          {/* LINKED WEDDING ALBUMS */}
          <div className="bg-stone-50/70 p-4 rounded-2xl border border-stone-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <label className="text-xs uppercase tracking-wider text-charcoal-700 font-semibold flex items-center gap-1.5">
                  <Images className="w-3.5 h-3.5 text-luxury-600" />
                  <span>Album Ảnh Cưới Thực Tế Gắn Kèm ({formData.albumIds.length} album đã chọn)</span>
                </label>
                <p className="text-[11px] text-charcoal-400 font-light">
                  Hiển thị ở cột trái Popup Modal chi tiết gói để khách hàng xem trọn bộ ảnh thực tế được chụp từ gói này.
                </p>
              </div>

              {availableAlbums.length > 4 && (
                <input
                  type="text"
                  placeholder="Tìm theo tên album..."
                  value={albumSearchTerm}
                  onChange={(e) => setAlbumSearchTerm(e.target.value)}
                  className="px-3 py-1 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-luxury-400 w-full sm:w-48"
                />
              )}
            </div>

            {availableAlbums.length === 0 ? (
              <div className="text-center py-3 bg-white/70 rounded-xl border border-dashed border-stone-300 text-stone-400 text-xs font-light">
                Chưa có album ảnh cưới nào trong hệ thống.
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                {availableAlbums
                  .filter((a) =>
                    albumSearchTerm
                      ? a.title.toLowerCase().includes(albumSearchTerm.toLowerCase()) ||
                        (a.concept && a.concept.toLowerCase().includes(albumSearchTerm.toLowerCase()))
                      : true
                  )
                  .map((album) => {
                    const isSelected = formData.albumIds.includes(album.id);
                    const isLinkedToAnotherPkg =
                      Boolean(album.packageId) && album.packageId !== editingId;
                    const otherPkgName = isLinkedToAnotherPkg
                      ? packages.find((p) => p.id === album.packageId)?.name
                      : null;

                    const thumbUrl = album.coverImage
                      ? album.coverImage.endsWith('.webp')
                        ? album.coverImage.replace(/\.webp$/, '-sm.webp')
                        : album.coverImage
                      : '';

                    return (
                      <label
                        key={album.id}
                        className={`flex items-center justify-between p-2 rounded-xl text-xs border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-50/80 border-amber-300 text-stone-900 font-medium shadow-2xs'
                            : 'bg-white border-stone-200/80 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData((prev) => ({
                                  ...prev,
                                  albumIds: [...prev.albumIds, album.id],
                                }));
                              } else {
                                setFormData((prev) => ({
                                  ...prev,
                                  albumIds: prev.albumIds.filter((id) => id !== album.id),
                                }));
                              }
                            }}
                            className="w-4 h-4 text-luxury-600 rounded shrink-0 cursor-pointer"
                          />

                          {/* Thumbnail bìa album */}
                          <div className="w-8 h-8 rounded-lg overflow-hidden bg-stone-100 border border-stone-200 shrink-0 flex items-center justify-center">
                            {thumbUrl ? (
                              <img
                                src={thumbUrl}
                                alt={album.title}
                                className="w-full h-full object-cover select-none"
                                onError={(e) => {
                                  if (album.coverImage && e.currentTarget.src !== album.coverImage) {
                                    e.currentTarget.src = album.coverImage;
                                  }
                                }}
                              />
                            ) : (
                              <Images className="w-3.5 h-3.5 text-stone-400" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <span className="truncate block font-medium">{album.title}</span>
                            {album.concept && (
                              <span className="text-[10px] text-stone-400 block truncate font-light">
                                {album.concept}
                              </span>
                            )}
                          </div>
                        </div>

                        {isLinkedToAnotherPkg && !isSelected && (
                          <span className="text-[10px] text-stone-400 shrink-0 italic">
                            (Đang gắn: {otherPkgName || 'Gói khác'})
                          </span>
                        )}
                        {isSelected && (
                          <span className="text-[10px] text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-full shrink-0 font-medium">
                            Đã gắn
                          </span>
                        )}
                      </label>
                    );
                  })}
              </div>
            )}
          </div>

          {/* LINKED BLOG POSTS / GUIDES */}
          <div className="bg-stone-50/70 p-4 rounded-2xl border border-stone-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <label className="text-xs uppercase tracking-wider text-charcoal-700 font-semibold flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-luxury-600" />
                  <span>Bài Viết Cẩm Nang Gắn Kèm ({formData.blogPostIds.length} bài đã chọn)</span>
                </label>
                <p className="text-[11px] text-charcoal-400 font-light">
                  Hiển thị ở cột trái Popup Modal chi tiết gói để khách hàng tham khảo kinh nghiệm trước khi đặt gói.
                </p>
              </div>

              {availableBlogPosts.length > 4 && (
                <input
                  type="text"
                  placeholder="Tìm theo tên bài..."
                  value={blogSearchTerm}
                  onChange={(e) => setBlogSearchTerm(e.target.value)}
                  className="px-3 py-1 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-luxury-400 w-full sm:w-48"
                />
              )}
            </div>

            {availableBlogPosts.length === 0 ? (
              <div className="text-center py-3 bg-white/70 rounded-xl border border-dashed border-stone-300 text-stone-400 text-xs font-light">
                Chưa có bài viết blog nào trong hệ thống.
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                {availableBlogPosts
                  .filter((b) =>
                    blogSearchTerm
                      ? b.title.toLowerCase().includes(blogSearchTerm.toLowerCase())
                      : true
                  )
                  .map((post) => {
                    const isSelected = formData.blogPostIds.includes(post.id);
                    const isLinkedToAnotherPkg =
                      Boolean(post.packageId) && post.packageId !== editingId;
                    const otherPkgName = isLinkedToAnotherPkg
                      ? packages.find((p) => p.id === post.packageId)?.name
                      : null;

                    return (
                      <label
                        key={post.id}
                        className={`flex items-center justify-between p-2 rounded-xl text-xs border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-50/80 border-amber-300 text-stone-900 font-medium shadow-2xs'
                            : 'bg-white border-stone-200/80 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData((prev) => ({
                                  ...prev,
                                  blogPostIds: [...prev.blogPostIds, post.id],
                                }));
                              } else {
                                setFormData((prev) => ({
                                  ...prev,
                                  blogPostIds: prev.blogPostIds.filter((id) => id !== post.id),
                                }));
                              }
                            }}
                            className="w-4 h-4 text-luxury-600 rounded shrink-0 cursor-pointer"
                          />
                          <span className="truncate">{post.title}</span>
                        </div>

                        {isLinkedToAnotherPkg && !isSelected && (
                          <span className="text-[10px] text-stone-400 shrink-0 italic">
                            (Đang gắn: {otherPkgName || 'Gói khác'})
                          </span>
                        )}
                        {isSelected && (
                          <span className="text-[10px] text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-full shrink-0 font-medium">
                            Đã gắn
                          </span>
                        )}
                      </label>
                    );
                  })}
              </div>
            )}
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPopular}
                onChange={(e) =>
                  setFormData({ ...formData, isPopular: e.target.checked })
                }
                className="w-4 h-4 text-luxury-600 rounded"
              />
              <span className="text-xs text-charcoal-700 font-medium">
                Gắn nhãn "Gói Bán Chạy / Phổ Biến Nhất"
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.published}
                onChange={(e) =>
                  setFormData({ ...formData, published: e.target.checked })
                }
                className="w-4 h-4 text-luxury-600 rounded"
              />
              <span className="text-xs text-charcoal-700">Xuất bản hiển thị</span>
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-stone-200">
            <div>
              {editingId && (
                <button
                  type="button"
                  onClick={handleOpenFacebookModalFromForm}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                  title="Soạn nội dung và bố cục hình ảnh để đăng Fanpage Facebook cho gói này"
                >
                  <Share2 className="w-3.5 h-3.5 text-blue-200" />
                  <span>📱 Tạo bài đăng Facebook</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 text-xs font-medium text-charcoal-600 hover:bg-stone-100 rounded-xl cursor-pointer"
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
                    <span>Đang Lưu...</span>
                  </>
                ) : (
                  <span>{editingId ? 'Cập Nhật Gói' : 'Tạo Gói Mới'}</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* GOOGLE DRIVE MEDIA PICKER MODAL */}
      <DriveMediaPicker
        isOpen={isDrivePickerOpen}
        onClose={() => setIsDrivePickerOpen(false)}
        onSuccess={handleDriveImportSuccess}
        mode={drivePickerMode}
        title={
          drivePickerMode === 'single'
            ? 'Chọn 01 Ảnh Bìa Đại Diện Gói Từ Google Drive'
            : 'Chọn Bộ Ảnh Demo Sản Phẩm Từ Google Drive'
        }
      />

      {/* FACEBOOK POST GENERATOR MODAL */}
      {facebookModalData && (
        <FacebookPostGeneratorModal
          isOpen={isFacebookModalOpen}
          onClose={() => setIsFacebookModalOpen(false)}
          data={facebookModalData}
        />
      )}
    </div>
  );
}
