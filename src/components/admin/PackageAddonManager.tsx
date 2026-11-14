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
  ToggleLeft,
  ToggleRight,
  Calculator,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { formatVND } from '@/lib/utils';

export interface PackageAddonItem {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  unit: string;
  allowQuantity: boolean;
  isActive: boolean;
  orderIndex: number;
}

interface PackageAddonManagerProps {
  onSuccessNotification?: (msg: string) => void;
}

export function PackageAddonManager({ onSuccessNotification }: PackageAddonManagerProps) {
  const [addons, setAddons] = useState<PackageAddonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '' as string | number,
    unit: '/ buổi',
    allowQuantity: false,
    isActive: true,
    orderIndex: 0,
  });

  const fetchAddons = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/addons');
      const data = await res.json();
      if (data.success) {
        setAddons(data.addons || []);
      }
    } catch {
      setErrorMessage('Không thể tải danh sách dịch vụ cộng thêm.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddons();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setErrorMessage('');
    setFormData({
      name: '',
      description: '',
      price: '',
      unit: '/ buổi',
      allowQuantity: false,
      isActive: true,
      orderIndex: addons.length,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (addon: PackageAddonItem) => {
    setEditingId(addon.id);
    setErrorMessage('');
    setFormData({
      name: addon.name,
      description: addon.description || '',
      price: addon.price,
      unit: addon.unit || '/ buổi',
      allowQuantity: addon.allowQuantity,
      isActive: addon.isActive,
      orderIndex: addon.orderIndex,
    });
    setIsModalOpen(true);
  };

  const handleToggleActive = async (addon: PackageAddonItem) => {
    try {
      const nextActive = !addon.isActive;
      // Optimistic update
      setAddons((prev) =>
        prev.map((a) => (a.id === addon.id ? { ...a, isActive: nextActive } : a))
      );

      const res = await fetch(`/api/admin/addons/${addon.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: nextActive }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Lỗi cập nhật trạng thái');
      }
      onSuccessNotification?.(
        nextActive
          ? `Đã bật hiển thị "${addon.name}" trên bảng dự toán!`
          : `Đã tạm ẩn "${addon.name}".`
      );
    } catch (err: any) {
      fetchAddons();
      alert(err.message || 'Lỗi khi cập nhật trạng thái.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa dịch vụ cộng thêm "${name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/addons/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Không thể xóa');
      }
      onSuccessNotification?.(`Đã xóa "${name}" thành công!`);
      fetchAddons();
    } catch (err: any) {
      alert(err.message || 'Lỗi xóa Add-on.');
    }
  };

  const handleSeedDefaults = async () => {
    if (addons.length > 0) {
      alert('Danh sách Add-on đã có dữ liệu. Tính năng chỉ khởi tạo khi danh sách đang trống 0 mục.');
      return;
    }

    try {
      setSeeding(true);
      const res = await fetch('/api/admin/addons/seed-defaults', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.addons)) {
        setAddons(data.addons);
        onSuccessNotification?.('Đã khởi tạo 5 dịch vụ cộng thêm phổ biến thành công!');
      } else {
        throw new Error(data.error || 'Không thể khởi tạo Add-ons');
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi khởi tạo Add-on mặc định.');
    } finally {
      setSeeding(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        price: Number(formData.price) || 0,
        unit: formData.unit.trim() || '/ buổi',
        allowQuantity: formData.allowQuantity,
        isActive: formData.isActive,
        orderIndex: Number(formData.orderIndex) || 0,
      };

      const url = editingId ? `/api/admin/addons/${editingId}` : '/api/admin/addons';
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Có lỗi xảy ra.');
      }

      setIsModalOpen(false);
      onSuccessNotification?.(
        editingId ? 'Cập nhật dịch vụ cộng thêm thành công!' : 'Thêm mới Add-on thành công!'
      );
      fetchAddons();
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi lưu thông tin.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/70 text-amber-800 text-[11px] font-semibold tracking-wider uppercase">
            <Calculator className="w-3.5 h-3.5 text-amber-600" />
            <span>Tự Động Tính Dự Toán & Cọc VietQR</span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-light text-charcoal-900">
            Tùy Chọn Dịch Vụ Cộng Thêm (Add-ons Dự Toán)
          </h3>
          <p className="text-xs text-charcoal-500 font-light">
            Các hạng mục dịch vụ nâng cấp cho phép dâu rể tick chọn thêm trong modal chi tiết gói chụp cưới.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {addons.length === 0 && (
            <button
              type="button"
              disabled={seeding}
              onClick={handleSeedDefaults}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-charcoal-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              title="Tự động tạo 5 dịch vụ mẫu phổ biến (Flycam, váy cưới, makeup mẹ...)"
            >
              {seeding ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              )}
              <span>{seeding ? 'Đang Nạp...' : 'Khởi Tạo 5 Mẫu Phổ Biến'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Dịch Vụ Cộng Thêm</span>
          </button>
        </div>
      </div>

      {/* Content list */}
      {loading ? (
        <div className="flex items-center justify-center p-8 text-stone-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
          <span className="text-xs">Đang tải danh sách Add-on...</span>
        </div>
      ) : addons.length === 0 ? (
        <div className="p-8 text-center bg-stone-50/70 rounded-2xl border border-dashed border-stone-200 space-y-3">
          <Layers className="w-8 h-8 text-stone-400 mx-auto" />
          <p className="text-xs text-stone-500">
            Chưa có dịch vụ cộng thêm nào. Bấm nút <strong>"Khởi Tạo 5 Mẫu Phổ Biến"</strong> ở trên để tạo nhanh danh sách gợi ý!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {addons.map((addon) => (
            <div
              key={addon.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                addon.isActive
                  ? 'bg-white border-stone-200 hover:border-amber-400 hover:shadow-md'
                  : 'bg-stone-50/80 border-stone-200/60 opacity-60'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-serif text-sm font-semibold text-charcoal-900 leading-snug">
                    {addon.name}
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleToggleActive(addon)}
                    className="shrink-0 text-stone-400 hover:text-charcoal-800 transition cursor-pointer"
                    title={addon.isActive ? 'Đang bật (Nhấp để ẩn)' : 'Đang ẩn (Nhấp để bật)'}
                  >
                    {addon.isActive ? (
                      <ToggleRight className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-stone-400" />
                    )}
                  </button>
                </div>

                {addon.description && (
                  <p className="text-[11px] text-stone-500 line-clamp-2 font-light">
                    {addon.description}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono font-bold text-amber-700">
                    {formatVND(addon.price)}
                  </span>
                  <span className="text-[10px] text-stone-400 ml-1 font-light">
                    {addon.unit}
                  </span>
                  {addon.allowQuantity && (
                    <span className="ml-2 inline-block px-1.5 py-0.5 rounded text-[9px] font-medium bg-blue-50 text-blue-700">
                      Cho chọn số lượng
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(addon)}
                    className="p-1.5 text-stone-400 hover:text-amber-700 hover:bg-stone-100 rounded-lg transition cursor-pointer"
                    title="Chỉnh sửa Add-on"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(addon.id, addon.name)}
                    className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                    title="Xóa Add-on"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="max-w-md"
        title={editingId ? 'Chỉnh Sửa Dịch Vụ Cộng Thêm' : 'Thêm Dịch Vụ Cộng Thêm Mới'}
        subtitle="Cấu hình tên, đơn giá và cho phép dâu rể tùy biến trên bảng tính dự toán."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs uppercase tracking-wider text-charcoal-700 font-semibold mb-1">
              Tên Dịch Vụ <span className="text-amber-600">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Quay Flycam 4K ngoại cảnh..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-charcoal-700 font-semibold mb-1">
              Mô Tả Ngắn (1 dòng)
            </label>
            <input
              type="text"
              placeholder="VD: Thêm góc quay toàn cảnh trên không bằng flycam..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal-700 font-semibold mb-1">
                Đơn Giá (VNĐ) <span className="text-amber-600">*</span>
              </label>
              <input
                type="number"
                required
                min={0}
                step={50000}
                placeholder="VD: 2500000"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3.5 py-2 text-xs font-mono bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal-700 font-semibold mb-1">
                Đơn Vị Tính
              </label>
              <input
                type="text"
                required
                placeholder="VD: / buổi, / ngày, / bộ..."
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.allowQuantity}
                onChange={(e) => setFormData({ ...formData, allowQuantity: e.target.checked })}
                className="w-4 h-4 text-amber-600 rounded"
              />
              <span className="text-xs text-charcoal-700 font-medium">
                Cho phép khách hàng tăng/giảm số lượng (1, 2, 3...)
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-amber-600 rounded"
              />
              <span className="text-xs text-charcoal-700 font-medium">
                Bật hiển thị cho dâu rể lựa chọn
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-charcoal-900 hover:bg-charcoal-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow disabled:opacity-60 cursor-pointer"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{editingId ? 'Cập Nhật' : 'Tạo Add-on'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
