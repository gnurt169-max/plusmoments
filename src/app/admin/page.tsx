import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import {
  Users,
  Image as ImageIcon,
  DollarSign,
  ArrowRight,
  Phone,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const [leadsCount, albumsCount, packagesCount, recentLeads] = await Promise.all([
    prisma.leadBooking.count(),
    prisma.album.count(),
    prisma.servicePackage.count(),
    prisma.leadBooking.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
  ]);

  return (
    <div className="space-y-8 p-6 sm:p-8">
      {searchParams?.error === '403_forbidden' && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-3 animate-fadeIn shadow-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0" />
          <span>
            <strong>Truy cập bị từ chối (403 Forbidden):</strong> Bạn không có đủ đặc quyền để truy cập trang vừa yêu cầu. Phân hệ đó đã bị khóa đối với vai trò hiện tại của bạn.
          </span>
        </div>
      )}

      <div>
        <h1 className="font-serif text-3xl font-light text-charcoal-900">
          Bảng Điều Khiển Quản Trị
        </h1>
        <p className="text-xs text-charcoal-500 mt-1">
          Hệ thống quản lý dữ liệu studio cưới PlusMoments.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-luxury-100 flex items-center justify-center text-luxury-700">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-charcoal-400 font-medium">
              Khách Đăng Ký (Leads)
            </p>
            <p className="font-serif text-2xl sm:text-3xl font-light text-charcoal-900 mt-0.5">
              {leadsCount}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-charcoal-400 font-medium">
              Bộ Sưu Tập Cưới
            </p>
            <p className="font-serif text-2xl sm:text-3xl font-light text-charcoal-900 mt-0.5">
              {albumsCount}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-charcoal-400 font-medium">
              Gói Dịch Vụ Cưới
            </p>
            <p className="font-serif text-2xl sm:text-3xl font-light text-charcoal-900 mt-0.5">
              {packagesCount}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Leads */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-light text-charcoal-900">
              Khách Hàng Đăng Ký Tư Vấn Gần Đây
            </h2>
            <p className="text-xs text-charcoal-500 font-light mt-0.5">
              Dữ liệu được cập nhật tự động khi khách gửi form hoặc bấm conversion tracking.
            </p>
          </div>
          <Link
            href="/admin/leads"
            className="text-xs font-semibold text-luxury-600 hover:text-luxury-800 flex items-center gap-1"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentLeads.length === 0 ? (
          <div className="p-12 text-center text-charcoal-400 text-xs">
            Chưa có khách hàng nào đăng ký mới.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-charcoal-500 uppercase tracking-wider font-semibold border-b border-stone-200">
                <tr>
                  <th className="py-3 px-6">Họ Tên Dâu Rể</th>
                  <th className="py-3 px-6">Số Điện Thoại</th>
                  <th className="py-3 px-6">Gói Quan Tâm</th>
                  <th className="py-3 px-6">Ngày Cưới Dự Kiến</th>
                  <th className="py-3 px-6">Trạng Thái</th>
                  <th className="py-3 px-6">Thời Gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-charcoal-700">
                {recentLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-4 px-6 font-medium text-charcoal-900">
                      {lead.fullName}
                    </td>
                    <td className="py-4 px-6 font-mono text-luxury-700">
                      <a href={`tel:${lead.phone}`} className="hover:underline flex items-center gap-1">
                        <Phone className="w-3 h-3 text-luxury-500" />
                        {lead.phone}
                      </a>
                    </td>
                    <td className="py-4 px-6">
                      {lead.expectedPackage || 'Tư vấn chung'}
                    </td>
                    <td className="py-4 px-6 font-mono">
                      {lead.weddingDate || 'Chưa định ngày'}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-charcoal-400 font-mono">
                      {formatDate(lead.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

