'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings2,
  Plus,
  Edit2,
  Trash2,
  Check,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

export interface TaxonomyItem {
  id: string;
  name: string;
  slug: string;
  order: number;
}

interface TaxonomySelectProps {
  type: 'concepts' | 'blog-categories' | 'service-categories';
  label: string;
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
  helperText?: string;
  useSlugAsValue?: boolean;
}

export function TaxonomySelect({
  type,
  label,
  value,
  onChange,
  required = false,
  helperText,
  useSlugAsValue = false,
}: TaxonomySelectProps) {
  const [items, setItems] = useState<TaxonomyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Form for Add/Edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [slugInput, setSlugInput] = useState('');
  const [orderInput, setOrderInput] = useState(0);

  const typeTitles: Record<string, { title: string; placeholder: string }> = {
    concepts: {
      title: 'Concept Chụp Ảnh Cưới',
      placeholder: 'VD: Outdoor Luxury, Studio Hàn Quốc...',
    },
    'blog-categories': {
      title: 'Chuyên Mục Cẩm Nang Cưới',
      placeholder: 'VD: Cẩm nang cưới, Kinh nghiệm chụp ảnh...',
    },
    'service-categories': {
      title: 'Phân Loại Gói Dịch Vụ',
      placeholder: 'VD: Ngoại Cảnh Pre-Wedding, Phóng Sự Cưới...',
    },
  };

  const currentTypeInfo = typeTitles[type] || {
    title: label,
    placeholder: 'Nhập tên danh mục...',
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/taxonomies/${type}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setItems(data.items);
      }
    } catch {
      console.error('Không thể tải danh mục:', type);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [type]);

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  };

  const handleNameChange = (val: string) => {
    setNameInput(val);
    if (!editingId) {
      setSlugInput(slugify(val));
    }
  };

  const openAddForm = () => {
    setEditingId(null);
    setNameInput('');
    setSlugInput('');
    setOrderInput(items.length + 1);
    setErrorMessage('');
  };

  const openEditForm = (item: TaxonomyItem) => {
    setEditingId(item.id);
    setNameInput(item.name);
    setSlugInput(item.slug);
    setOrderInput(item.order);
    setErrorMessage('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      setErrorMessage('Vui lòng nhập tên danh mục.');
      return;
    }

    try {
      setActionLoading(true);
      setErrorMessage('');

      const payload = {
        id: editingId,
        name: nameInput.trim(),
        slug: slugInput.trim() || slugify(nameInput),
        order: Number(orderInput) || 0,
      };

      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(`/api/admin/taxonomies/${type}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Lỗi khi lưu danh mục.');
      }

      await fetchItems();

      // If creating new, auto-select this new item in the parent form
      if (!editingId && data.item) {
        const valToSet = useSlugAsValue ? data.item.slug : data.item.name;
        onChange(valToSet);
      }

      openAddForm();
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi thao tác danh mục.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (item: TaxonomyItem) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa danh mục "${item.name}" không?`)) return;

    try {
      setActionLoading(true);
      setErrorMessage('');

      const res = await fetch(`/api/admin/taxonomies/${type}?id=${item.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Lỗi khi xóa danh mục.');
      }

      await fetchItems();

      // If deleted item was selected, reset
      if (value === item.name || value === item.slug) {
        onChange('');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi xóa.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-xs uppercase tracking-wider text-charcoal-600 font-medium">
          {label} {required && <span className="text-luxury-600">*</span>}
        </label>
        <button
          type="button"
          onClick={() => {
            openAddForm();
            setIsManageModalOpen(true);
          }}
          className="inline-flex items-center gap-1 text-[11px] text-luxury-700 hover:text-luxury-900 font-medium hover:underline cursor-pointer transition-colors"
          title={`Quản lý và thêm mới ${currentTypeInfo.title}`}
        >
          <Settings2 className="w-3 h-3 text-luxury-600" />
          <span>Quản lý / Thêm mới</span>
        </button>
      </div>

      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className="w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-400 cursor-pointer"
        >
          <option value="">-- Chọn {currentTypeInfo.title} --</option>
          {items.map((item) => {
            const itemValue = useSlugAsValue ? item.slug : item.name;
            return (
              <option key={item.id} value={itemValue}>
                {item.name}
              </option>
            );
          })}
          {/* Fallback option if value is not currently in list (e.g. legacy static value) */}
          {value && !items.some((i) => i.name === value || i.slug === value) && (
            <option value={value}>{value} (Cũ / Tùy chỉnh)</option>
          )}
        </select>
      </div>

      {helperText && (
        <p className="text-[11px] text-stone-400 mt-1">{helperText}</p>
      )}

      {/* MANAGE MODAL */}
      <Modal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        maxWidth="max-w-xl"
        title={`Quản Lý Danh Mục: ${currentTypeInfo.title}`}
        subtitle="Thêm mới, đổi tên hoặc xóa các lựa chọn danh mục trong hệ thống."
      >
        <div className="space-y-5 text-xs">
          {errorMessage && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ADD / EDIT FORM */}
          <form
            onSubmit={handleSave}
            className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-charcoal-900 flex items-center gap-1.5 text-xs">
                {editingId ? (
                  <>
                    <Edit2 className="w-3.5 h-3.5 text-luxury-600" />
                    <span>Chỉnh Sửa Danh Mục</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 text-luxury-600" />
                    <span>Thêm Danh Mục Mới</span>
                  </>
                )}
              </h4>
              {editingId && (
                <button
                  type="button"
                  onClick={openAddForm}
                  className="text-[11px] text-stone-500 hover:text-stone-800"
                >
                  Hủy chỉnh sửa
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6">
                <label className="block text-[11px] text-stone-500 mb-1">
                  Tên Danh Mục <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder={currentTypeInfo.placeholder}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-luxury-400"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-[11px] text-stone-500 mb-1">
                  Đường Dẫn (Slug)
                </label>
                <input
                  type="text"
                  value={slugInput}
                  onChange={(e) => setSlugInput(e.target.value)}
                  placeholder="slug-danh-muc"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-luxury-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] text-stone-500 mb-1">
                  Thứ Tự
                </label>
                <input
                  type="number"
                  value={orderInput}
                  onChange={(e) => setOrderInput(Number(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-luxury-400"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {actionLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                <span>{editingId ? 'Cập Nhật' : 'Lưu Danh Mục'}</span>
              </button>
            </div>
          </form>

          {/* LIST OF CURRENT ITEMS */}
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-wider text-charcoal-600 font-semibold">
              Danh Sách Đang Sử Dụng ({items.length})
            </label>

            {loading ? (
              <div className="py-8 flex justify-center items-center text-stone-400">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : items.length === 0 ? (
              <p className="text-center py-6 text-stone-400 text-xs italic">
                Chưa có danh mục nào. Hãy thêm danh mục đầu tiên ở khung phía trên.
              </p>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                {items.map((item) => {
                  const isSelected =
                    value === item.name || value === item.slug;
                  return (
                    <div
                      key={item.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-luxury-50/70 border-luxury-300 shadow-2xs'
                          : 'bg-white border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-md bg-stone-100 text-stone-600 font-mono text-[10px] font-bold flex items-center justify-center">
                          #{item.order}
                        </span>
                        <div>
                          <div className="font-medium text-charcoal-900 flex items-center gap-2">
                            <span>{item.name}</span>
                            {isSelected && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-luxury-200 text-luxury-900 font-semibold">
                                Đang chọn
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-stone-400 font-mono">
                            /{item.slug}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            const valToSet = useSlugAsValue ? item.slug : item.name;
                            onChange(valToSet);
                            setIsManageModalOpen(false);
                          }}
                          className="px-2 py-1 text-[11px] text-luxury-700 hover:bg-luxury-100 rounded-md font-medium cursor-pointer transition-colors mr-1"
                        >
                          Chọn
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditForm(item)}
                          className="p-1 text-stone-400 hover:text-luxury-600 hover:bg-stone-100 rounded-md cursor-pointer transition-colors"
                          title="Sửa danh mục"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          className="p-1 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-md cursor-pointer transition-colors"
                          title="Xóa danh mục"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}

