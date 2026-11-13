'use client';

import React, { useState } from 'react';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';

export interface GoogleMapFacadeProps {
  embedUrl: string;
  shareUrl?: string | null;
  address?: string;
  studioName?: string;
  className?: string;
}

/**
 * GoogleMapFacade: Click-to-Load Facade for Google Maps iframe.
 * Eliminates ~800KB of third-party JavaScript execution on page load (improving TBT & Mobile PageSpeed).
 * Renders the interactive Google Maps iframe only when the user explicitly clicks to view or interact.
 */
export function GoogleMapFacade({
  embedUrl,
  shareUrl,
  address = '31 Hùng Vương, Phường An Đông',
  studioName = 'PlusMoments Wedding Studio',
  className = '',
}: GoogleMapFacadeProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  if (isLoaded) {
    return (
      <div className={`w-full h-44 sm:h-48 rounded-xl overflow-hidden border border-[#3E3834] bg-[#1A1614] relative shadow-inner animate-in fade-in duration-300 ${className}`}>
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: 0, filter: 'contrast(95%) opacity(90%)' }}
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Bản đồ vị trí ${studioName}`}
          className="w-full h-full"
        />
      </div>
    );
  }

  return (
    <div
      onClick={() => setIsLoaded(true)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsLoaded(true);
        }
      }}
      aria-label="Nhấn để tải bản đồ Google Maps tương tác"
      className={`group w-full h-44 sm:h-48 rounded-xl overflow-hidden border border-[#3E3834] bg-gradient-to-br from-[#1C1815] via-[#151210] to-[#0E0D0C] p-4 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:border-amber-700/60 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880] focus-visible:ring-offset-2 relative select-none ${className}`}
    >
      {/* Subtle map grid background styling */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#C5A880_1px,transparent_1px)] [background-size:16px_16px]"
        aria-hidden="true"
      />

      {/* Top: Location badge */}
      <div className="relative z-10 flex items-start gap-2.5">
        <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
          <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-amber-400 opacity-40" />
          <MapPin className="w-4 h-4 text-amber-300" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold text-amber-200 uppercase tracking-wider font-mono">
            {studioName}
          </p>
          <p className="text-xs text-stone-300 font-light line-clamp-2 leading-relaxed mt-0.5">
            {address}
          </p>
        </div>
      </div>

      {/* Bottom: Dual action buttons */}
      <div className="relative z-10 flex flex-wrap items-center gap-2 pt-2 border-t border-stone-800/80">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsLoaded(true);
          }}
          aria-label="Tải bản đồ tương tác ngay trên trang"
          className="px-3 py-1.5 rounded-lg bg-amber-900/40 hover:bg-amber-800/60 text-amber-200 border border-amber-500/40 text-[11px] font-medium tracking-wide transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Navigation className="w-3 h-3 text-amber-300" />
          <span>Mở Bản Đồ Tương Tác</span>
        </button>

        {shareUrl && (
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            aria-label="Mở ứng dụng Google Maps chỉ đường"
            className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white border border-stone-700/60 text-[11px] transition-colors flex items-center gap-1"
          >
            <span>Chỉ Đường</span>
            <ExternalLink className="w-3 h-3 text-stone-400" />
          </a>
        )}
      </div>
    </div>
  );
}

export default GoogleMapFacade;

