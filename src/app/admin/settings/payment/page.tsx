'use client';

import React from 'react';
import Link from 'next/link';
import { CreditCard, ChevronLeft } from 'lucide-react';
import { BankSettingsCard } from '@/components/admin/BankSettingsCard';

export default function AdminPaymentSettingsPage() {
  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* HEADER BREADCRUMB */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/admin/settings"
              className="text-stone-400 hover:text-stone-700 transition-colors flex items-center gap-1 text-xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Cài Đặt Hệ Thống</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-luxury-900 text-luxury-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-serif font-medium text-stone-900 tracking-tight">
                Cấu Hình Thanh Toán VietQR & Webhook
              </h1>
              <p className="text-xs text-stone-500 font-light">
                Quản lý số tài khoản nhận tiền Studio, mã QR động và đối soát giao dịch tự động qua SePay/Casso.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* BANK SETTINGS CONTENT */}
      <BankSettingsCard />
    </div>
  );
}
