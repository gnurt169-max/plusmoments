'use client';

import React, { useState, useMemo } from 'react';
import { Play, Sparkles, Film } from 'lucide-react';

interface AlbumVideoFacadeProps {
  videoUrl: string;
  coverImage?: string;
  albumTitle: string;
}

/**
 * Extracts YouTube or Vimeo ID and returns appropriate embed and thumbnail URLs.
 */
function parseVideoSource(rawUrl: string): {
  type: 'youtube' | 'vimeo' | 'unknown';
  embedUrl: string | null;
  defaultPoster: string | null;
} {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { type: 'unknown', embedUrl: null, defaultPoster: null };
  }

  const url = rawUrl.trim();

  // YouTube detection
  const ytMatch =
    url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    const ytId = ytMatch[1];
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0`,
      defaultPoster: `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`,
    };
  }

  // Vimeo detection
  const vimeoMatch = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    const vimeoId = vimeoMatch[1];
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoId}?autoplay=1`,
      defaultPoster: null,
    };
  }

  // If user passed a direct iframe src URL
  if (url.startsWith('https://') && (url.includes('embed') || url.includes('player'))) {
    const delimiter = url.includes('?') ? '&' : '?';
    return {
      type: 'unknown',
      embedUrl: `${url}${delimiter}autoplay=1`,
      defaultPoster: null,
    };
  }

  return { type: 'unknown', embedUrl: null, defaultPoster: null };
}

export function AlbumVideoFacade({
  videoUrl,
  coverImage,
  albumTitle,
}: AlbumVideoFacadeProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const parsed = useMemo(() => parseVideoSource(videoUrl), [videoUrl]);

  if (!parsed.embedUrl) {
    return null;
  }

  const posterSrc = coverImage || parsed.defaultPoster || '/placeholder.jpg';

  return (
    <div className="relative w-full max-w-5xl mx-auto rounded-3xl overflow-hidden bg-stone-950 border border-stone-800 shadow-2xl">
      {isPlaying ? (
        <div className="relative aspect-video w-full">
          <iframe
            src={parsed.embedUrl}
            title={`Video Highlight - ${albumTitle}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full border-0 rounded-3xl"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="relative aspect-video w-full group cursor-pointer overflow-hidden flex items-center justify-center">
          {/* Poster Image */}
          <img
            src={posterSrc}
            alt={`Video Highlight - ${albumTitle}`}
            className="absolute inset-0 w-full h-full object-cover select-none transition-transform duration-700 ease-out group-hover:scale-105 opacity-80 group-hover:opacity-90"
            loading="lazy"
          />

          {/* Luxury Dark Film Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30 transition-opacity" />

          {/* Top Badge */}
          <div className="absolute top-4 sm:top-6 left-4 sm:left-6 z-10 flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-amber-300 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 border border-amber-500/30 shadow-lg">
              <Film className="w-3.5 h-3.5 text-amber-400" />
              <span>Cinematic Highlight 4K</span>
            </span>
          </div>

          {/* Center Play Button & Title */}
          <div
            onClick={() => setIsPlaying(true)}
            className="relative z-10 flex flex-col items-center justify-center text-center p-4 space-y-3 cursor-pointer"
          >
            {/* Play Button with Gold Glow & Ring Animation */}
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl group-hover:bg-amber-400/40 transition-all scale-125" />
              <button
                type="button"
                aria-label={`Phát video highlight của album ${albumTitle}`}
                className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 text-white flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110 active:scale-95 border-2 border-white/40 cursor-pointer pointer-events-auto"
              >
                <Play className="w-7 h-7 sm:w-9 sm:h-9 fill-white text-white ml-1 drop-shadow" />
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="font-serif text-lg sm:text-2xl text-white font-light drop-shadow-md tracking-wide">
                Thưởng Thức Phim Cưới Highlight
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 font-light drop-shadow flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Nhấp để bắt đầu phát video độ phân giải cao</span>
              </p>
            </div>
          </div>

          {/* Bottom Audio/Format Hint */}
          <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-10">
            <span className="text-[11px] font-mono text-stone-300 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-stone-700">
              Chất lượng 4K UltraHD • Âm thanh gốc
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default AlbumVideoFacade;
