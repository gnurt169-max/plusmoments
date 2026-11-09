'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BlogCreatePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/blog?action=create');
  }, [router]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center text-xs text-stone-500 font-sans">
      Đang chuyển hướng tới trình soạn thảo bài viết...
    </div>
  );
}

