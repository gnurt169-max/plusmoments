import React from 'react';
import type { Metadata } from 'next';
import { TestimonialsManager } from '@/components/admin/TestimonialsManager';

export const metadata: Metadata = {
  title: 'Quản Lý Đánh Giá Dâu Rể | PlusMoments Admin',
  description: 'Quản lý nhận xét, cảm xúc của các dâu rể và bật/tắt hiển thị trên trang chủ.',
};

export default function AdminTestimonialsPage() {
  return (
    <div className="p-6 sm:p-10 space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-light text-charcoal-900">
          Quản Lý Đánh Giá Dâu Rể (Testimonials)
        </h1>
        <p className="text-xs text-charcoal-500 mt-1">
          Tùy chỉnh thông điệp cảm xúc, bật/tắt hiển thị trên trang chủ và cập nhật những câu chuyện hạnh phúc thực tế từ khách hàng.
        </p>
      </div>

      <TestimonialsManager />
    </div>
  );
}

