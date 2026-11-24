'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, KeyRound, ArrowRight } from 'lucide-react';
import { CustomerPinModal } from './CustomerPinModal';

export function InvitationLandingHeroActions() {
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  return (
    <>
      <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5">
        <Link
          href="/thiep-cuoi/tao-moi"
          className="w-full sm:w-auto h-13 px-8 rounded-full bg-[#8C6D46] hover:bg-[#725735] active:scale-95 text-white text-sm font-semibold tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-amber-200" />
          <span>Tự Thiết Kế Thiệp Ngay (Miễn Phí)</span>
        </Link>

        <button
          type="button"
          onClick={() => setIsPinModalOpen(true)}
          className="w-full sm:w-auto h-13 px-7 rounded-full bg-white hover:bg-amber-500/10 border-2 border-[#8C6D46] text-[#8C6D46] text-sm font-semibold tracking-wide transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          <KeyRound className="w-4 h-4" />
          <span>Chỉnh Sửa Thiệp Đã Tạo</span>
        </button>

        <a
          href="#templates-showcase"
          className="w-full sm:w-auto h-13 px-6 rounded-full bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 text-sm font-medium transition-all flex items-center justify-center gap-1.5"
        >
          <span>Mẫu Thiệp</span>
          <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
        </a>
      </div>

      <CustomerPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
      />
    </>
  );
}
