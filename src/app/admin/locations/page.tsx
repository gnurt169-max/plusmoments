'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Loader2,
  Building,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

interface LocationItem {
  id: string;
  name: string;
  address: string;
  hotline: string;
  hotlineDisplay: string;
  email?: string | null;
  googleMapsUrl?: string | null;
  googleMapsEmbed?: string | null;
  openingHours: string;
  isHeadquarter: boolean;
  orderIndex: number;
  published: boolean;
}

export default function AdminLocationsPage() {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    hotline: '0908123456',
    hotlineDisplay: '0908.123.456',
    email: 'contact@plusmoments.vn',
    googleMapsUrl: 'https://maps.google.com',
    googleMapsEmbed: '',
    openingHours: '09:00 - 21:00 hàng ngày',
    isHeadquarter: false,
    orderIndex: 0,
    published: true,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/locations');
      const data = await res.json();
      if (data.success) {
        setLocations(data.locations || []);
      }
    } catch {
      setErrorMessage('Không thể tải danh sách chi nhánh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      address: '',
      hotline: '0908123456',
      hotlineDisplay: '0908.123.456',
      email: 'contact@plusmoments.vn',
      googleMapsUrl: 'https://maps.google.com',
      googleMapsEmbed: '',
      openingHours: '09:00 - 21:00 hàng ngày',
      isHeadquarter: locations.length === 0,
      orderIndex: locations.length + 1,
      published: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (loc: LocationItem) => {
    setEditingId(loc.id);
    setFormData({
      name: loc.name,
      address: loc.address,
      hotline: loc.hotline,
      hotlineDisplay: loc.hotlineDisplay,
      email: loc.email || '',
      googleMapsUrl: loc.googleMapsUrl || '',
      googleMapsEmbed: loc.googleMapsEmbed || '',
      openingHours: loc.openingHours,
      isHeadquarter: loc.isHeadquarter,
      orderIndex: loc.orderIndex,
      published: loc.published,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa chi nhánh "${name}" không?`)) return;

    try {
      const res = await fetch(`/api/admin/locations?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'Đã xóa chi nhánh!');
        fetchLocations();
      } else {
        alert(data.error || 'Lỗi khi xóa.');
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi kết nối.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      const url = '/api/admin/locations';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingId ? { id: editingId, ...formData } : formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Lỗi khi lưu chi nhánh.');
      }

      showToast(data.message || 'Lưu chi nhánh thành công!');
      setIsModalOpen(false);
      fetchLocations();
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
            Hệ Thống Chi Nhánh & Studio
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Quản lý địa chỉ trụ sở chính, các chi nhánh chụp ảnh cưới ngoại cảnh và link Google Maps hiển thị ở trang Liên Hệ.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-5 py-2.5 bg-luxury-600 hover:bg-luxury-700 active:scale-95 text-white rounded-xl text-xs uppercase tracking-wider font-medium flex items-center gap-2 transition-all shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Chi Nhánh Mới</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh] text-charcoal-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-luxury-600" />
          <span className="text-xs">Đang tải danh sách chi nhánh...</span>
        </div>
      ) : locations.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-stone-200 text-xs text-charcoal-400">
          Chưa có chi nhánh nào. Hãy bấm "Thêm Chi Nhánh Mới"!
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-charcoal-500 uppercase tracking-wider font-semibold border-b border-stone-200">
                <tr>
                  <th className="py-3.5 px-6">Tên Chi Nhánh</th>
                  <th className="py-3.5 px-6">Địa Chỉ Chi Tiết</th>
                  <th className="py-3.5 px-6">Hotline</th>
                  <th className="py-3.5 px-6">Giờ Mở Cửa</th>
                  <th className="py-3.5 px-6">Trụ Sở</th>
                  <th className="py-3.5 px-6">Trạng Thái</th>
                  <th className="py-3.5 px-6 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-charcoal-700">
                {locations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-4 px-6 font-medium text-charcoal-900">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-luxury-500 shrink-0" />
                        <span className="font-serif text-sm">{loc.name}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-charcoal-600 max-w-xs font-light">
                      {loc.address}
                    </td>

                    <td className="py-4 px-6 font-mono text-luxury-700">
                      {loc.hotlineDisplay}
                    </td>

                    <td className="py-4 px-6 text-charcoal-500 font-light">
                      {loc.openingHours}
                    </td>

                    <td className="py-4 px-6">
                      {loc.isHeadquarter ? (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-luxury-100 text-luxury-800">
                          Trụ Sở Chính
                        </span>
                      ) : (
                        <span className="text-[10px] text-charcoal-400">Chi Nhánh</span>
                      )}
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          loc.published
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-100 text-stone-500'
                        }`}
                      >
                        {loc.published ? 'Hoạt Động' : 'Tạm Đóng'}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(loc)}
                          className="p-1.5 text-stone-400 hover:text-luxury-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                          title="Chỉnh sửa chi nhánh"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(loc.id, loc.name)}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Xóa chi nhánh"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT LOCATION MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="max-w-2xl"
        title={editingId ? 'Chỉnh Sửa Chi Nhánh' : 'Thêm Mới Chi Nhánh Studio'}
        subtitle="Cập nhật địa chỉ, số hotline và thông tin bản đồ Google Maps."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1 font-medium">
                Tên Chi Nhánh <span className="text-luxury-600">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="VD: Flagship Studio Phú Nhuận"
                className="w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-400"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1 font-medium">
                Email Chi Nhánh
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@plusmoments.vn"
                className="w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1 font-medium">
              Địa Chỉ Chi Tiết <span className="text-luxury-600">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Đường Hoa Lan, Phường 2, Quận Phú Nhuận, TP.HCM"
              className="w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1 font-medium">
                Số Hotline Raw (cho link tel:) <span className="text-luxury-600">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.hotline}
                onChange={(e) => setFormData({ ...formData, hotline: e.target.value })}
                placeholder="0908123456"
                className="w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-luxury-400"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1 font-medium">
                Số Hotline Hiển Thị Giao Diện <span className="text-luxury-600">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.hotlineDisplay}
                onChange={(e) =>
                  setFormData({ ...formData, hotlineDisplay: e.target.value })
                }
                placeholder="0908.123.456"
                className="w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-luxury-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1 font-medium">
                Giờ Mở Cửa
              </label>
              <input
                type="text"
                value={formData.openingHours}
                onChange={(e) =>
                  setFormData({ ...formData, openingHours: e.target.value })
                }
                placeholder="09:00 - 21:00 hàng ngày"
                className="w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-400"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal-600 mb-1 font-medium">
                Đường Dẫn Google Maps Trực Tiếp
              </label>
              <input
                type="url"
                value={formData.googleMapsUrl}
                onChange={(e) =>
                  setFormData({ ...formData, googleMapsUrl: e.target.value })
                }
                placeholder="https://maps.google.com/?q=..."
                className="w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-luxury-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isHeadquarter}
                onChange={(e) =>
                  setFormData({ ...formData, isHeadquarter: e.target.checked })
                }
                className="w-4 h-4 text-luxury-600 rounded"
              />
              <span className="text-xs text-charcoal-700 font-medium">
                Đặt làm Trụ Sở Chính
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
              <span className="text-xs text-charcoal-700 font-medium">
                Hiển thị công khai
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
                <span>{editingId ? 'Cập Nhật Chi Nhánh' : 'Thêm Chi Nhánh'}</span>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

