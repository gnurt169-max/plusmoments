import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cổng Trả Ảnh & Chọn Ảnh Riêng Tư | PlusMoments',
  description: 'Cổng xem và chọn ảnh in cưới bảo mật mã PIN riêng tư của PlusMoments Studio.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function ProofingRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#141210] text-stone-100 font-sans selection:bg-[#C5A880] selection:text-black">
      {children}
    </div>
  );
}
