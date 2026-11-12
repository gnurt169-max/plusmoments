'use client';

import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  UserPlus,
  KeyRound,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  User,
  Lock,
  Loader2,
  ShieldAlert,
  Crown,
} from 'lucide-react';

interface AdminUserItem {
  id: string;
  username: string;
  fullName: string;
  email: string | null;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'USER';
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string>('ADMIN');
  const [currentUsername, setCurrentUsername] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null);

  // Create form state
  const [formUsername, setFormUsername] = useState('');
  const [formFullName, setFormFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<'ADMIN' | 'USER' | 'SUPER_ADMIN'>('USER');
  const [createSubmitting, setCreateSubmitting] = useState(false);

  // Edit form state
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<'ADMIN' | 'USER' | 'SUPER_ADMIN'>('USER');
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Reset password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetSubmitting, setResetSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Không thể tải danh sách tài khoản.');
      } else {
        setUsers(data.users || []);
        setCurrentUserRole(data.currentUserRole || 'ADMIN');
        setCurrentUsername(data.currentUsername || '');
      }
    } catch {
      setError('Lỗi kết nối khi tải danh sách.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (createSubmitting) return;

    setCreateSubmitting(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formUsername,
          fullName: formFullName,
          email: formEmail,
          password: formPassword,
          role: formRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Tạo tài khoản thất bại');
      } else {
        setIsCreateModalOpen(false);
        setFormUsername('');
        setFormFullName('');
        setFormEmail('');
        setFormPassword('');
        setFormRole('USER');
        fetchUsers();
      }
    } catch {
      alert('Lỗi mạng khi tạo tài khoản');
    } finally {
      setCreateSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (user: AdminUserItem) => {
    setSelectedUser(user);
    setEditFullName(user.fullName);
    setEditEmail(user.email || '');
    setEditRole(user.role);
    setIsEditModalOpen(true);
  };

  // Handle Edit User
  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || editSubmitting) return;

    setEditSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: editFullName,
          email: editEmail,
          role: editRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Cập nhật tài khoản thất bại');
      } else {
        setIsEditModalOpen(false);
        setSelectedUser(null);
        fetchUsers();
      }
    } catch {
      alert('Lỗi mạng khi cập nhật tài khoản');
    } finally {
      setEditSubmitting(false);
    }
  };

  // Handle Toggle Active
  const handleToggleActive = async (user: AdminUserItem) => {
    if (user.username === 'trunglnm') {
      alert('Tài khoản Super Admin mặc định luôn phải ở trạng thái hoạt động.');
      return;
    }
    if (currentUserRole === 'ADMIN' && user.role !== 'USER') {
      alert('Bạn chỉ có quyền quản lý trạng thái tài khoản người dùng thông thường (USER).');
      return;
    }
    const newStatus = !user.isActive;
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus }),
      });
      if (res.ok) {
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || 'Không thể đổi trạng thái');
      }
    } catch {
      alert('Lỗi mạng');
    }
  };

  // Open Reset Password Modal
  const openResetPasswordModal = (user: AdminUserItem) => {
    setSelectedUser(user);
    setNewPassword('');
    setConfirmPassword('');
    setIsResetPasswordModalOpen(true);
  };

  // Handle Reset Password Submit
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || resetSubmitting) return;

    if (newPassword !== confirmPassword) {
      alert('Xác nhận mật khẩu không khớp.');
      return;
    }

    if (newPassword.length < 6) {
      alert('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    setResetSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Đặt lại mật khẩu thất bại');
      } else {
        alert(data.message || 'Đã đổi mật khẩu thành công');
        setIsResetPasswordModalOpen(false);
        setSelectedUser(null);
      }
    } catch {
      alert('Lỗi mạng khi đặt lại mật khẩu');
    } finally {
      setResetSubmitting(false);
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (user: AdminUserItem) => {
    if (user.username === 'trunglnm') {
      alert('Tài khoản Super Admin mặc định được bảo vệ tuyệt đối và không thể bị xóa.');
      return;
    }

    if (currentUserRole === 'ADMIN' && user.role !== 'USER') {
      alert('Bạn chỉ có quyền xóa tài khoản người dùng thông thường (USER).');
      return;
    }

    if (!confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản "${user.fullName}" (@${user.username})?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Xóa tài khoản thất bại');
      } else {
        fetchUsers();
      }
    } catch {
      alert('Lỗi mạng khi xóa tài khoản');
    }
  };

  const isSuperAdmin = currentUserRole === 'SUPER_ADMIN';

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-luxury-600" />
            <h1 className="text-2xl font-serif font-medium text-stone-900 tracking-tight">
              Quản Lý Tài Khoản Quản Trị
            </h1>
          </div>
          <p className="text-xs text-stone-500 font-light">
            Phân quyền vai trò và quản lý nhân sự truy cập Hệ thống Quản trị PlusMoments.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setFormRole('USER');
            setIsCreateModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-white text-xs uppercase tracking-wider font-semibold shadow-md transition-all cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4 text-champagne-gold" />
          <span>{isSuperAdmin ? 'Thêm Quản Trị Viên' : 'Thêm Người Dùng (USER)'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* USERS TABLE */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-stone-400">
            <Loader2 className="w-6 h-6 animate-spin text-luxury-600" />
            <p className="text-xs">Đang tải danh sách tài khoản...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-stone-400 text-xs">
            Chưa có tài khoản nào được tạo.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50/80 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 sm:px-6">Họ Tên & Tên Đăng Nhập</th>
                  <th className="py-3.5 px-4">Email Liên Hệ</th>
                  <th className="py-3.5 px-4">Vai Trò</th>
                  <th className="py-3.5 px-4">Trạng Thái</th>
                  <th className="py-3.5 px-4">Đăng Nhập Gần Nhất</th>
                  <th className="py-3.5 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {users.map((u) => {
                  const isOwner = u.username === 'trunglnm';
                  const isCurrent = u.username === currentUsername;
                  const canToggleActive = isSuperAdmin ? !isOwner : (currentUserRole === 'ADMIN' && u.role === 'USER');
                  const canResetPassword = isSuperAdmin || (currentUserRole === 'ADMIN' && u.role === 'USER');
                  const canEdit = isSuperAdmin || (currentUserRole === 'ADMIN' && (u.role === 'USER' || isCurrent));
                  const canDelete = (isSuperAdmin && !isOwner && !isCurrent) || (currentUserRole === 'ADMIN' && u.role === 'USER');

                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-stone-50/60 transition-colors ${
                        isOwner ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      {/* Name & Username */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              isOwner
                                ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                                : 'bg-stone-100 text-stone-700'
                            }`}
                          >
                            {isOwner ? (
                              <Crown className="w-4 h-4 text-amber-700" />
                            ) : (
                              u.fullName.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                              <span>{u.fullName}</span>
                              {isOwner && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold">
                                  Tối Cao
                                </span>
                              )}
                              {isCurrent && (
                                <span className="text-[10px] text-stone-400 font-normal">
                                  (Bạn)
                                </span>
                              )}
                            </div>
                            <span className="text-stone-400 font-mono text-[11px]">
                              @{u.username}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-4 px-4">
                        {u.email ? (
                          <span className="text-stone-600 flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-stone-400" />
                            {u.email}
                          </span>
                        ) : (
                          <span className="text-stone-300 italic">Chưa liên kết</span>
                        )}
                      </td>

                      {/* Role Badge */}
                      <td className="py-4 px-4">
                        {u.role === 'SUPER_ADMIN' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100/90 text-amber-900 border border-amber-300 text-[10px] font-semibold tracking-wide">
                            <Crown className="w-3 h-3 text-amber-700" />
                            Super Admin
                          </span>
                        ) : u.role === 'ADMIN' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-semibold tracking-wide">
                            <ShieldCheck className="w-3 h-3 text-blue-600" />
                            Quản Trị Viên
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200 text-[10px] font-semibold tracking-wide">
                            Người Dùng (USER)
                          </span>
                        )}
                      </td>

                      {/* Active Status */}
                      <td className="py-4 px-4">
                        {isOwner || !canToggleActive ? (
                          <span className={`inline-flex items-center gap-1 font-medium ${u.isActive ? 'text-emerald-700' : 'text-stone-400'}`}>
                            {u.isActive ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{isOwner ? 'Vĩnh viễn mở' : 'Hoạt động'}</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5 text-stone-400" />
                                <span>Đã khóa</span>
                              </>
                            )}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleToggleActive(u)}
                            className="inline-flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
                          >
                            {u.isActive ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-700 font-medium">Hoạt động</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5 text-stone-400" />
                                <span className="text-stone-400 font-medium">Đã khóa</span>
                              </>
                            )}
                          </button>
                        )}
                      </td>

                      {/* Last Login */}
                      <td className="py-4 px-4 text-stone-500">
                        {u.lastLoginAt ? (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-stone-400" />
                            {new Date(u.lastLoginAt).toLocaleString('vi-VN')}
                          </span>
                        ) : (
                          <span className="text-stone-300 italic">Chưa đăng nhập</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Reset Password Button */}
                          {canResetPassword && (
                            <button
                              type="button"
                              onClick={() => openResetPasswordModal(u)}
                              title="Đặt lại mật khẩu"
                              className="p-1.5 rounded-lg text-stone-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                            >
                              <KeyRound className="w-4 h-4" />
                            </button>
                          )}

                          {/* Edit Button */}
                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => openEditModal(u)}
                              title="Chỉnh sửa thông tin"
                              className="p-1.5 rounded-lg text-stone-400 hover:text-luxury-600 hover:bg-luxury-50 transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete Button */}
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u)}
                              title="Xóa tài khoản"
                              className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
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

      {/* MODAL 1: CREATE USER */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="text-lg font-serif font-medium text-stone-900">
                Thêm Quản Trị Viên Mới
              </h2>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 text-lg leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-semibold text-stone-700">Tên đăng nhập *</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
                  <input
                    type="text"
                    required
                    placeholder="ví dụ: editor01"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-stone-700">Họ và tên *</label>
                <input
                  type="text"
                  required
                  placeholder="ví dụ: Nguyễn Văn A"
                  value={formFullName}
                  onChange={(e) => setFormFullName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-600"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-stone-700">Email (tùy chọn)</label>
                <input
                  type="email"
                  placeholder="nguyenvana@gmail.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-600"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-stone-700">Mật khẩu khởi tạo *</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
                  <input
                    type="password"
                    required
                    placeholder="Tối thiểu 6 ký tự"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="create-user-role-select" className="block font-semibold text-stone-700">Vai trò phân quyền *</label>
                {currentUserRole === 'ADMIN' ? (
                  <div className="px-3 py-2.5 bg-stone-100 border border-stone-200 rounded-xl text-stone-600 text-xs flex items-center justify-between">
                    <span>Người Dùng (USER)</span>
                    <span className="text-[10px] text-stone-400 italic">Quản trị viên chỉ có thể tạo USER</span>
                  </div>
                ) : (
                  <select
                    id="create-user-role-select"
                    aria-label="Vai trò phân quyền"
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-600"
                  >
                    <option value="USER">Người Dùng (USER - Soạn bài viết, album, xem media)</option>
                    <option value="ADMIN">Quản Trị Viên (ADMIN - Quản lý nội dung, gói cưới, leads)</option>
                    {isSuperAdmin && (
                      <option value="SUPER_ADMIN">Super Administrator (SUPER_ADMIN - Tối cao)</option>
                    )}
                  </select>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 cursor-pointer font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-white font-medium shadow-md cursor-pointer disabled:opacity-50"
                >
                  {createSubmitting ? 'Đang tạo...' : 'Tạo Tài Khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT USER */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="text-lg font-serif font-medium text-stone-900">
                Chỉnh Sửa Tài Khoản: @{selectedUser.username}
              </h2>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 text-lg leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleEditUser} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-semibold text-stone-700">Họ và tên *</label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-600"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-stone-700">Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-600"
                />
              </div>

              {isSuperAdmin && selectedUser.username !== 'trunglnm' && (
                <div className="space-y-1">
                  <label htmlFor="edit-user-role-select" className="block font-semibold text-stone-700">Vai trò phân quyền</label>
                  <select
                    id="edit-user-role-select"
                    aria-label="Vai trò phân quyền"
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-600"
                  >
                    <option value="USER">Người Dùng (USER)</option>
                    <option value="ADMIN">Quản Trị Viên (ADMIN)</option>
                    <option value="SUPER_ADMIN">Super Administrator (SUPER_ADMIN)</option>
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 cursor-pointer font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-white font-medium shadow-md cursor-pointer disabled:opacity-50"
                >
                  {editSubmitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RESET PASSWORD */}
      {isResetPasswordModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="space-y-0.5">
                <h2 className="text-lg font-serif font-medium text-stone-900">
                  Đặt Lại Mật Khẩu
                </h2>
                <p className="text-[11px] text-stone-500">
                  Tài khoản: <strong className="text-stone-800">@{selectedUser.username}</strong> ({selectedUser.fullName})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsResetPasswordModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 text-lg leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-semibold text-stone-700">Mật khẩu mới *</label>
                <input
                  type="password"
                  required
                  placeholder="Tối thiểu 6 ký tự"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-600"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-stone-700">Xác nhận mật khẩu mới *</label>
                <input
                  type="password"
                  required
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsResetPasswordModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 cursor-pointer font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={resetSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium shadow-md cursor-pointer disabled:opacity-50"
                >
                  {resetSubmitting ? 'Đang đổi...' : 'Xác Nhận Đổi Mật Khẩu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

