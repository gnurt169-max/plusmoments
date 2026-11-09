'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Loader2,
  ExternalLink,
  FolderDown,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Copy,
  Image as ImageIcon,
  Bot,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { formatVND } from '@/lib/utils';
import { SingleImagePicker } from '@/components/admin/ImageFieldPicker';
import { MediaLibraryPickerModal } from '@/components/admin/MediaLibraryPickerModal';
import { TaxonomySelect } from '@/components/admin/TaxonomySelect';

interface PackageOption {
  id: string;
  name: string;
  price: number | string;
  category: string;
  slug: string;
}

export interface PostImageItem {
  id?: string;
  url: string;
  alt: string;
  caption: string;
  orderIndex: number;
}

interface BlogPostItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImage: string;
  author: string;
  authorId?: string | null;
  authorUser?: { id: string; fullName: string; username: string } | null;
  category: string;
  readingMinutes: number;
  published: boolean;
  publishedAt: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  packageId?: string | null;
  package?: PackageOption | null;
  images?: PostImageItem[];
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPostItem[]>([]);
  const [packagesList, setPackagesList] = useState<PackageOption[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isContentMediaPickerOpen, setIsContentMediaPickerOpen] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [generatingAltIdx, setGeneratingAltIdx] = useState<number | null>(null);
  const [isGeneratingAllAlt, setIsGeneratingAllAlt] = useState(false);
  const [isAutoGeneratingAll, setIsAutoGeneratingAll] = useState(false);
  const [isAutoGeneratingFromImages, setIsAutoGeneratingFromImages] = useState(false);
  const [generatingSEO, setGeneratingSEO] = useState(false);

  const [formData, setFormData] = useState<{
    title: string;
    slug: string;
    summary: string;
    content: string;
    coverImage: string;
    packageId: string;
    author: string;
    category: string;
    readingMinutes: number;
    published: boolean;
    metaTitle: string;
    metaDescription: string;
    postImages: PostImageItem[];
  }>({
    title: '',
    slug: '',
    summary: '',
    content: '',
    coverImage: '',
    packageId: '',
    author: 'PlusMoments Editorial',
    category: 'Cẩm nang cưới',
    readingMinutes: 4,
    published: true,
    metaTitle: '',
    metaDescription: '',
    postImages: [],
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/blog');
      const data = await res.json();
      if (data.success) {
        setPosts(data.posts || []);
      }
    } catch {
      setErrorMessage('Không thể tải danh sách bài viết.');
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
    fetchPosts();
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
      summary: '',
      content: '',
      coverImage: '',
      packageId: '',
      author: 'PlusMoments Editorial',
      category: 'Cẩm nang cưới',
      readingMinutes: 4,
      published: true,
      metaTitle: '',
      metaDescription: '',
      postImages: [],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (post: BlogPostItem) => {
    setEditingId(post.id);
    const existingImages: PostImageItem[] = post.images && Array.isArray(post.images)
      ? post.images.map((im, idx) => ({
          id: im.id,
          url: im.url,
          alt: im.alt || '',
          caption: im.caption || '',
          orderIndex: im.orderIndex ?? idx,
        }))
      : [];

    setFormData({
      title: post.title,
      slug: post.slug,
      summary: post.summary,
      content: post.content,
      coverImage: post.coverImage,
      packageId: post.packageId || '',
      author: post.author,
      category: post.category,
      readingMinutes: post.readingMinutes,
      published: post.published,
      metaTitle: post.metaTitle || '',
      metaDescription: post.metaDescription || '',
      postImages: existingImages,
    });
    setIsModalOpen(true);
  };

  const handleAddImages = (urls: string[]) => {
    setFormData((prev) => {
      const existingUrls = new Set(prev.postImages.map((img) => img.url));
      const newItems: PostImageItem[] = urls
        .filter((u) => !existingUrls.has(u))
        .map((u, idx) => ({
          url: u,
          alt: prev.title ? `${prev.title} - Ảnh ${prev.postImages.length + idx + 1}` : '',
          caption: '',
          orderIndex: prev.postImages.length + idx,
        }));
      return {
        ...prev,
        postImages: [...prev.postImages, ...newItems],
      };
    });
    showToast(`Đã thêm ${urls.length} ảnh vào bộ sưu tập bài viết!`);
  };

  const handleUpdateImageField = (idx: number, field: 'alt' | 'caption', val: string) => {
    setFormData((prev) => {
      const next = [...prev.postImages];
      next[idx] = { ...next[idx], [field]: val };
      return { ...prev, postImages: next };
    });
  };

  const handleMoveImage = (fromIdx: number, toIdx: number) => {
    setFormData((prev) => {
      if (toIdx < 0 || toIdx >= prev.postImages.length) return prev;
      const next = [...prev.postImages];
      const item = next.splice(fromIdx, 1)[0];
      next.splice(toIdx, 0, item);
      return {
        ...prev,
        postImages: next.map((it, i) => ({ ...it, orderIndex: i })),
      };
    });
  };

  const handleRemoveImage = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      postImages: prev.postImages.filter((_, i) => i !== idx).map((it, i) => ({ ...it, orderIndex: i })),
    }));
  };

  const handleAutoFillAltText = () => {
    handleGenerateAllAltTextAI();
  };

  const handleGenerateSingleAltText = async (idx: number) => {
    if (!formData.title.trim()) {
      alert('Vui lòng nhập Tiêu Đề Bài Viết trước để AI có ngữ cảnh tạo Alt Text chuẩn SEO!');
      return;
    }
    const targetImg = formData.postImages[idx];
    if (!targetImg) return;

    try {
      setGeneratingAltIdx(idx);
      const res = await fetch('/api/admin/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_single_alt',
          title: formData.title,
          imageUrl: targetImg.url,
          mediaId: targetImg.id,
          imageIndex: idx,
        }),
      });
      const data = await res.json();
      if (data.success && data.altText) {
        setFormData((prev) => {
          const next = [...prev.postImages];
          next[idx] = {
            ...next[idx],
            alt: data.altText.trim(),
            caption: data.caption ? data.caption.trim() : next[idx].caption,
          };
          return { ...prev, postImages: next };
        });
        showToast(`✨ Đã tạo Alt Text & Caption chuẩn SEO cho ảnh #${idx + 1}!`);
      } else {
        alert(data.message || 'Không thể tạo Alt Text.');
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi kết nối AI.');
    } finally {
      setGeneratingAltIdx(null);
    }
  };

  const handleGenerateAllAltTextAI = async () => {
    if (!formData.title.trim()) {
      alert('Vui lòng nhập Tiêu Đề Bài Viết trước để AI có ngữ cảnh tạo Alt Text!');
      return;
    }
    if (formData.postImages.length === 0) {
      alert('Chưa có ảnh nào trong bộ sưu tập để tạo Alt Text!');
      return;
    }
    try {
      setIsGeneratingAllAlt(true);
      const res = await fetch('/api/admin/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_all_alt',
          title: formData.title,
          images: formData.postImages.map((img) => ({ url: img.url, id: img.id })),
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.results)) {
        setFormData((prev) => ({
          ...prev,
          postImages: prev.postImages.map((img, i) => {
            const resItem = data.results[i];
            return {
              ...img,
              alt: resItem?.altText ? resItem.altText.trim() : (data.altTexts?.[i] || img.alt || `${prev.title} - PlusMoments #${i + 1}`),
              caption: resItem?.caption ? resItem.caption.trim() : (data.captions?.[i] || img.caption),
            };
          }),
        }));
        showToast(`✨ Đã tự động tạo Alt Text & Caption chuẩn SEO cho toàn bộ ${formData.postImages.length} ảnh!`);
      } else {
        alert(data.message || 'Không thể tạo Alt Text hàng loạt.');
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi kết nối AI.');
    } finally {
      setIsGeneratingAllAlt(false);
    }
  };

  const handleAIGenerateBlog = async () => {
    if (!formData.title.trim()) {
      alert('Vui lòng nhập tiêu đề bài viết trước khi gọi AI');
      return;
    }
    try {
      setIsAIGenerating(true);
      setGeneratingAI(true);
      setErrorMessage('');
      const res = await fetch('/api/admin/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_blog',
          title: formData.title,
          category: formData.category,
          imageCount: formData.postImages.length || 4,
          images: formData.postImages.map((img) => ({ url: img.url, id: img.id })),
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setFormData((prev) => ({
          ...prev,
          summary: data.data.excerpt || prev.summary,
          content: data.data.content || prev.content,
        }));
        showToast('✨ AI đã tự động phác thảo tóm tắt và nội dung bài viết theo ngữ cảnh thực tế của bộ ảnh!');
      } else {
        alert(data.message || 'Lỗi khi gọi AI soạn thảo bài viết.');
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi kết nối AI.');
    } finally {
      setIsAIGenerating(false);
      setGeneratingAI(false);
    }
  };

  const handleAIAutoCompleteAll = async () => {
    if (!formData.title.trim()) {
      alert('Vui lòng nhập Tiêu Đề Bài Viết trước để AI có ngữ cảnh khởi tạo toàn bộ dữ liệu!');
      return;
    }
    try {
      setIsAutoGeneratingAll(true);
      setErrorMessage('');
      const res = await fetch('/api/admin/ai/generate-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          category: formData.category,
          images: formData.postImages.map((img) => ({ url: img.url, id: img.id })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || 'Lỗi khi gọi AI tự động điền.');
      }
      const resData = data.data || data;
      setFormData((prev) => {
        const updatedImages = prev.postImages.map((img, i) => {
          const meta = resData.imagesMetadata?.[i];
          return {
            ...img,
            alt: meta?.alt ? meta.alt.trim() : img.alt,
            caption: meta?.caption ? meta.caption.trim() : img.caption,
          };
        });

        return {
          ...prev,
          summary: resData.excerpt || resData.summary || prev.summary,
          content: resData.content || prev.content,
          metaTitle: resData.seoTitle || resData.metaTitle || prev.metaTitle,
          metaDescription: resData.seoDescription || resData.metaDescription || prev.metaDescription,
          postImages: updatedImages,
        };
      });
      showToast('⚡ AI đã tự động điền 100% dữ liệu: Tóm tắt, Nội dung, Alt text, Caption & Thẻ SEO!');
    } catch (err: any) {
      alert(err.message || 'Lỗi kết nối AI.');
    } finally {
      setIsAutoGeneratingAll(false);
    }
  };

  const handleAutoGenerateFromImages = async () => {
    if (formData.postImages.length === 0) {
      alert('Vui lòng chọn hoặc tải lên ít nhất 1 ảnh trước để AI có hình ảnh phân tích!');
      return;
    }
    try {
      setIsAutoGeneratingFromImages(true);
      setErrorMessage('');
      const res = await fetch('/api/admin/ai/auto-generate-from-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'BLOG',
          images: formData.postImages.map((img) => ({ url: img.url, id: img.id })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || 'Lỗi khi gọi AI phân tích bộ ảnh.');
      }
      const resData = data.data || data;

      setFormData((prev) => {
        const updatedImages = prev.postImages.map((img, i) => {
          const meta = resData.imagesMetadata?.[i];
          return {
            ...img,
            alt: meta?.alt ? meta.alt.trim() : img.alt,
            caption: meta?.caption ? meta.caption.trim() : img.caption,
          };
        });

        return {
          ...prev,
          title: resData.title || prev.title,
          slug: resData.slug || prev.slug,
          summary: resData.excerpt || prev.summary,
          content: resData.content || prev.content,
          category: resData.category || prev.category,
          metaTitle: resData.seoTitle || prev.metaTitle,
          metaDescription: resData.seoDescription || prev.metaDescription,
          postImages: updatedImages,
        };
      });

      showToast('⚡ AI đã khởi tạo hoàn tất toàn bộ bài viết dựa trên bộ ảnh của bạn!');
    } catch (err: any) {
      alert(err.message || 'Lỗi kết nối AI.');
    } finally {
      setIsAutoGeneratingFromImages(false);
    }
  };

  const handleCopyShortcode = (imageIndex: number) => {
    const code = `[image:${imageIndex}]`;
    navigator.clipboard.writeText(code);
    showToast(`Đã sao chép ${code}! Dán vào bất kỳ vị trí nào trong nội dung.`);
  };

  const handleAppendAllShortcodes = () => {
    if (formData.postImages.length === 0) return;
    const shortcodes = formData.postImages
      .map((_, i) => `[image:${i + 1}]`)
      .join('\n\n');
    setFormData((prev) => ({
      ...prev,
      content: prev.content.trim()
        ? `${prev.content.trim()}\n\n${shortcodes}`
        : shortcodes,
    }));
    showToast('Đã chèn toàn bộ mã nhúng ảnh vào cuối bài viết!');
  };

  const handleGenerateBlogAI = async () => {
    return handleAIGenerateBlog();
  };

  const handleGenerateSeoAI = async () => {
    if (!formData.title.trim()) {
      alert('Vui lòng nhập Tiêu Đề Bài Viết trước để AI tối ưu thẻ SEO!');
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
          category: formData.category,
          summary: formData.summary,
          description: formData.content,
          type: 'bài viết cẩm nang cưới',
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
        showToast('✨ Gemini AI đã tạo thẻ SEO Meta Title & Description chuẩn Google!');
      }
    } catch (err: any) {
      alert(err.message || 'Không thể kết nối Gemini AI.');
    } finally {
      setGeneratingSEO(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa bài viết "${title}" không?`)) return;

    try {
      const res = await fetch(`/api/admin/blog?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'Đã xóa bài viết!');
        fetchPosts();
      } else {
        alert(data.error || 'Lỗi khi xóa.');
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi kết nối.');
    }
  };

  const handleTitleChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      title: val,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      const url = '/api/admin/blog';
      const method = editingId ? 'PUT' : 'POST';
      const payload = {
        title: formData.title,
        slug: formData.slug,
        summary: formData.summary,
        content: formData.content,
        coverImage: formData.coverImage,
        author: formData.author,
        category: formData.category,
        readingMinutes: formData.readingMinutes,
        published: formData.published,
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
        packageId: formData.packageId || null,
        images: formData.postImages,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Lỗi khi lưu bài viết.');
      }

      showToast(data.message || 'Xuất bản bài viết thành công!');
      setIsModalOpen(false);
      fetchPosts();
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
            Cẩm Nang Cưới & Bài Viết SEO
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Soạn thảo cẩm nang cưới, hướng dẫn tạo dáng, mẹo chuẩn bị ngày cưới phục vụ SEO từ khóa và tăng chuyển đổi.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-5 py-2.5 bg-luxury-600 hover:bg-luxury-700 active:scale-95 text-white rounded-xl text-xs uppercase tracking-wider font-medium flex items-center gap-2 transition-all shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Viết Bài Mới</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh] text-charcoal-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-luxury-600" />
          <span className="text-xs">Đang tải danh sách bài viết...</span>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-stone-200 text-xs text-charcoal-400">
          Chưa có bài viết nào. Hãy bấm "Viết Bài Mới" để bắt đầu!
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-charcoal-500 uppercase tracking-wider font-semibold border-b border-stone-200">
                <tr>
                  <th className="py-3.5 px-6">Ảnh Bìa & Tiêu Đề Bài Viết</th>
                  <th className="py-3.5 px-6">Chuyên Mục</th>
                  <th className="py-3.5 px-6">Tác Giả</th>
                  <th className="py-3.5 px-6">Thời Gian Đọc</th>
                  <th className="py-3.5 px-6">Trạng Thái</th>
                  <th className="py-3.5 px-6 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-charcoal-700">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <div className="relative w-14 h-10 rounded-lg overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-serif text-sm font-medium text-charcoal-900 line-clamp-1">
                          {post.title}
                        </p>
                        <p className="font-mono text-[10px] text-charcoal-400">
                          /blog/{post.slug}
                        </p>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-champagne text-luxury-800">
                        {post.category}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-charcoal-600 font-light">
                      <p>{post.author}</p>
                      {post.authorUser && (
                        <p className="text-[10px] text-stone-400 mt-0.5">
                          Tác giả: <span className="text-stone-600 font-medium">{post.authorUser.fullName || post.authorUser.username}</span>
                        </p>
                      )}
                    </td>

                    <td className="py-4 px-6 font-mono text-charcoal-500">
                      {post.readingMinutes} phút
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${post.published
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-100 text-stone-500'
                          }`}
                      >
                        {post.published ? 'Đã Xuất Bản' : 'Bản Nháp'}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      {(() => {
                        const canEditOrDelete =
                          !currentUser ||
                          currentUser.role !== 'USER' ||
                          !post.authorId ||
                          post.authorId === currentUser.id;

                        return (
                          <div className="flex items-center justify-end gap-2">
                            <a
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                              title="Xem bài viết"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                            {canEditOrDelete && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => openEditModal(post)}
                                  className="p-1.5 text-stone-400 hover:text-luxury-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                                  title="Chỉnh sửa bài viết"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(post.id, post.title)}
                                  className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  title="Xóa bài viết"
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

      {/* CREATE / EDIT ARTICLE MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="max-w-3xl"
        title={editingId ? 'Chỉnh Sửa Bài Viết' : 'Viết Bài Cẩm Nang Cưới Mới'}
        subtitle="Soạn thảo nội dung chia sẻ kinh nghiệm chuẩn bị cưới và tối ưu SEO on-page."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl">
              {errorMessage}
            </div>
          )}

          {/* AI ASSISTANT BANNER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-gradient-to-r from-luxury-50 via-amber-50/70 to-luxury-50 border border-luxury-200/80 rounded-2xl shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-luxury-900 text-luxury-400 flex items-center justify-center shadow-xs shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-charcoal-900 flex items-center gap-1.5">
                  <span>Trợ Lý Biên Tập AI (Google Gemini)</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-200/80 text-amber-900 font-bold uppercase tracking-wider">
                    1-Click Auto
                  </span>
                </h4>
                <p className="text-[11px] text-charcoal-500 font-light">
                  Phân tích tiêu đề và ảnh thực tế để tự động điền 100% Tóm tắt, Nội dung, Alt text, Caption & Thẻ SEO.
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={formData.postImages.length === 0 || isAutoGeneratingFromImages}
              onClick={handleAutoGenerateFromImages}
              className="px-5 py-2.5 bg-gradient-to-r from-[#2E2824] to-[#4A3E37] hover:from-[#1A1614] hover:to-[#2E2824] text-white text-xs font-semibold rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shrink-0"
              title={
                formData.postImages.length === 0
                  ? 'Vui lòng chọn hoặc tải lên ít nhất 1 ảnh trước'
                  : 'AI tự động phân tích ảnh để sinh Tiêu đề, Slug, Tóm tắt, Nội dung, Alt text & SEO'
              }
            >
              {isAutoGeneratingFromImages ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                  <span>AI Đang Phân Tích Bộ Ảnh & Viết Bài...</span>
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
                Tiêu Đề Bài Viết <span className="text-luxury-600">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Nhập tiêu đề bài viết..."
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
                placeholder="duong-dan-bai-viet"
                className="w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-luxury-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <TaxonomySelect
              type="blog-categories"
              label="Chuyên Mục"
              value={formData.category}
              onChange={(val) => setFormData({ ...formData, category: val })}
              required
            />

            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1 font-medium">
                Tác Giả
              </label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-400"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1 font-medium">
                Thời Gian Đọc (Phút)
              </label>
              <input
                type="number"
                min="1"
                value={formData.readingMinutes}
                onChange={(e) =>
                  setFormData({ ...formData, readingMinutes: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-luxury-400"
              />
            </div>
          </div>

          {/* COVER THUMBNAIL PICKER */}
          <SingleImagePicker
            label="Ảnh Bìa Đại Diện Bài Viết (Thumbnail)"
            value={formData.coverImage}
            onChange={(url) => setFormData({ ...formData, coverImage: url })}
            aspectRatio="video"
            required
            modalTitle="Chọn Ảnh Bìa Bài Viết Cẩm Nang Cưới"
            helperText="Ảnh hiển thị ở đầu bài viết và ngoài trang danh sách blog."
          />

          {/* LINKED PRICING PACKAGE (CROSS-SELL) */}
          <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/70 space-y-2">
            <label className="block text-xs uppercase tracking-wider text-charcoal-700 font-semibold">
              Gói Dịch Vụ Giới Thiệu Kèm Bài Viết (Cross-sell)
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
              Bài viết sẽ hiển thị thẻ giới thiệu gói chụp này ở cuối bài để kích thích người đọc nhận tư vấn.
            </p>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1 font-medium">
              Đoạn Tóm Tắt Ngắn (Excerpt)
            </label>
            <textarea
              rows={2}
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-400 resize-none leading-relaxed"
            />
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <label className="text-xs uppercase tracking-wider text-charcoal-600 font-medium">
                Nội Dung Bài Viết Chi Tiết <span className="text-luxury-600">*</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAIGenerateBlog}
                  disabled={isAIGenerating || !formData.title.trim()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2E2824] hover:bg-[#1A1614] text-white text-xs font-medium rounded-lg transition disabled:opacity-50 cursor-pointer shadow-2xs"
                >
                  <span>✨</span>
                  <span>{isAIGenerating ? 'AI đang soạn thảo...' : 'AI Hỗ Trợ Viết Bài'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsContentMediaPickerOpen(true)}
                  className="text-[11px] text-amber-800 hover:text-amber-900 font-medium flex items-center gap-1.5 cursor-pointer bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-300 hover:bg-amber-100 transition-all shadow-2xs"
                >
                  <FolderDown className="w-3.5 h-3.5 text-amber-700" />
                  <span>Nhập Thư Mục / Thêm Ảnh Media</span>
                </button>
              </div>
            </div>
            <textarea
              rows={9}
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-400 font-sans leading-relaxed"
            />
          </div>

          {/* Section: BỘ SƯU TẬP HÌNH ẢNH TRONG BÀI VIẾT & QUẢN LÝ SEO ALT TEXT / CAPTION */}
          <div className="pt-4 border-t border-stone-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <label className="text-xs uppercase tracking-wider text-charcoal-700 font-bold flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-luxury-500" />
                    Bộ Sưu Tập Hình Ảnh Trong Bài Viết (Gallery & SEO)
                  </label>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-luxury-100 text-luxury-800 border border-luxury-300">
                    {formData.postImages.length} ảnh
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Quản lý Alt Text chuẩn Google SEO, Chú thích ảnh (Caption) và vị trí hiển thị.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsContentMediaPickerOpen(true)}
                  className="px-3 py-1.5 bg-luxury-500 hover:bg-luxury-600 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                >
                  <FolderDown className="w-3.5 h-3.5" />
                  <span>Chọn Thư Mục / Thêm Ảnh</span>
                </button>

                {formData.postImages.length > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={handleGenerateAllAltTextAI}
                      disabled={isGeneratingAllAlt || !formData.title.trim()}
                      title="AI tự động phân tích và điền toàn bộ Alt Text chuẩn SEO cho tất cả ảnh"
                      className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>{isGeneratingAllAlt ? 'AI đang tạo Alt Text...' : '✨ Tạo Toàn Bộ Alt Text'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleAppendAllShortcodes}
                      title="Chèn toàn bộ mã shortcode [image:X] vào cuối bài viết"
                      className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-charcoal-700 border border-stone-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5 text-stone-600" />
                      <span>Chèn Hết Vào Bài</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Instruction Tip */}
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 mb-3 text-xs text-stone-600 leading-relaxed flex items-start gap-2.5">
              <span className="text-base select-none">💡</span>
              <div className="space-y-1">
                <p>
                  <strong>Cách hiển thị ảnh xen kẽ nội dung:</strong> Copy mã nhúng như <code className="bg-white px-1.5 py-0.5 rounded border border-stone-300 font-mono text-[11px] text-luxury-700 font-semibold">[image:1]</code>, <code className="bg-white px-1.5 py-0.5 rounded border border-stone-300 font-mono text-[11px] text-luxury-700 font-semibold">[image:2]</code> và dán vào bất cứ đoạn nào trong phần <em>Nội Dung Bài Viết</em> phía trên.
                </p>
                <p className="text-[11px] text-stone-500">
                  Hệ thống sẽ tự động chuyển thành thẻ <code className="bg-white px-1 py-0.2 rounded border border-stone-200">&lt;figure&gt;</code> tối ưu SEO, lazy load và hiển thị caption sắc nét. Các ảnh không gắn mã sẽ tự động hiển thị trong <em>Bộ sưu tập ảnh</em> cuối bài viết.
                </p>
              </div>
            </div>

            {/* Images List */}
            {formData.postImages.length === 0 ? (
              <div
                onClick={() => setIsContentMediaPickerOpen(true)}
                className="border-2 border-dashed border-stone-300 hover:border-luxury-400 bg-stone-50 hover:bg-stone-100/60 rounded-xl p-6 text-center cursor-pointer transition-all"
              >
                <FolderDown className="w-8 h-8 mx-auto text-stone-400 mb-2" />
                <p className="text-xs font-medium text-stone-700">Chưa có ảnh nào trong bài viết này</p>
                <p className="text-[11px] text-stone-500 mt-1">
                  Bấm vào đây để mở Kho Media & chọn trọn vẹn cả Thư Mục ảnh hoặc tick nhiều ảnh cùng lúc.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {formData.postImages.map((img, idx) => (
                  <div
                    key={`${img.url}-${idx}`}
                    className="p-3 bg-white border border-stone-200 hover:border-stone-300 rounded-xl shadow-2xs flex flex-col md:flex-row gap-3 items-start transition-all"
                  >
                    {/* Thumbnail & Order & Copy */}
                    <div className="flex flex-col items-center gap-1.5 flex-shrink-0 w-full md:w-32">
                      <div className="relative aspect-4/3 w-full rounded-lg overflow-hidden bg-stone-100 border border-stone-200 group">
                        <img
                          src={img.url}
                          alt={img.alt || 'Ảnh bài viết'}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute top-1 left-1 bg-black/75 text-white text-[10px] font-mono px-1.5 py-0.5 rounded font-bold backdrop-blur-xs">
                          #{idx + 1}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopyShortcode(idx + 1)}
                        title="Copy mã [image:X] để dán vào bài viết"
                        className="w-full py-1 px-2 text-[11px] font-mono font-medium bg-stone-100 hover:bg-luxury-50 hover:text-luxury-800 hover:border-luxury-300 border border-stone-200 rounded text-stone-700 flex items-center justify-center gap-1 transition-all cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>[image:{idx + 1}]</span>
                      </button>
                    </div>

                    {/* Inputs */}
                    <div className="flex-1 w-full space-y-2">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-semibold text-charcoal-700 uppercase tracking-wider flex items-center gap-1">
                            Alt Text (Thẻ ALT Chuẩn SEO)
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={generatingAltIdx === idx || !formData.title.trim()}
                              onClick={() => handleGenerateSingleAltText(idx)}
                              className="inline-flex items-center gap-1 text-[10px] text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2 py-0.5 rounded transition disabled:opacity-50 cursor-pointer font-medium"
                              title="AI tự động phân tích và tạo Alt Text chuẩn SEO cho ảnh này"
                            >
                              <span>✨</span>
                              <span>{generatingAltIdx === idx ? 'Đang tạo...' : 'AI Tạo Alt Text'}</span>
                            </button>
                            <span className="text-[10px] text-stone-400">Google Image & AI SEO</span>
                          </div>
                        </div>
                        <input
                          type="text"
                          value={img.alt}
                          onChange={(e) => handleUpdateImageField(idx, 'alt', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-stone-50 focus:bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-luxury-400 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                          Chú Thích Ảnh (Caption Hiển Thị Dưới Ảnh)
                        </label>
                        <input
                          type="text"
                          value={img.caption}
                          onChange={(e) => handleUpdateImageField(idx, 'caption', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-stone-50 focus:bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-luxury-400 transition-all italic text-stone-700"
                        />
                      </div>
                    </div>

                    {/* Action controls (Move up, Move down, Remove) */}
                    <div className="flex md:flex-col items-center justify-end gap-1 flex-shrink-0 self-center md:self-start pt-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveImage(idx, idx - 1)}
                        title="Di chuyển lên trên"
                        className={`p-1.5 rounded-lg border text-xs transition-all ${
                          idx === 0
                            ? 'text-stone-300 border-stone-200 cursor-not-allowed bg-stone-50'
                            : 'text-stone-600 border-stone-300 hover:bg-stone-100 cursor-pointer'
                        }`}
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        disabled={idx === formData.postImages.length - 1}
                        onClick={() => handleMoveImage(idx, idx + 1)}
                        title="Di chuyển xuống dưới"
                        className={`p-1.5 rounded-lg border text-xs transition-all ${
                          idx === formData.postImages.length - 1
                            ? 'text-stone-300 border-stone-200 cursor-not-allowed bg-stone-50'
                            : 'text-stone-600 border-stone-300 hover:bg-stone-100 cursor-pointer'
                        }`}
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        title="Xóa ảnh này khỏi bài viết"
                        className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submodal to insert image into blog post content */}
          {isContentMediaPickerOpen && (
            <MediaLibraryPickerModal
              isOpen={isContentMediaPickerOpen}
              onClose={() => setIsContentMediaPickerOpen(false)}
              onSelect={(selected) => {
                const urls = Array.isArray(selected) ? selected : [selected];
                handleAddImages(urls);
              }}
              multiple={true}
              title="Chọn Thư Mục Hoặc Nhiều Ảnh Cho Bài Viết"
              subtitle="Bạn có thể chọn cả một thư mục hoặc tick chọn nhiều ảnh để nhập vào bộ sưu tập bài viết."
            />
          )}

          {/* SEO meta */}
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
                title="Tự động tạo cặp thẻ Meta Title & Description chuẩn SEO từ tiêu đề và nội dung"
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
                  placeholder="Tiêu đề chuẩn SEO xuất hiện trên Google Search..."
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
                  placeholder="Đoạn mô tả ngắn hiển thị dưới link Google..."
                  className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-luxury-400"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.published}
                onChange={(e) =>
                  setFormData({ ...formData, published: e.target.checked })
                }
                className="w-4 h-4 text-luxury-600 rounded"
              />
              <span className="text-xs text-charcoal-700 font-medium">
                Xuất bản bài viết ngay
              </span>
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
                  <span>Đang Lưu...</span>
                </>
              ) : (
                <span>{editingId ? 'Cập Nhật Bài Viết' : 'Xuất Bản Bài Viết'}</span>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

