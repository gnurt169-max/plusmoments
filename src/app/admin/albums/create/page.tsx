'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AlbumCreatePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/albums?action=create');
  }, [router]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center text-xs text-stone-500 font-sans">
      Đang chuyển hướng tới trình tạo album cưới...
    </div>
  );
}

