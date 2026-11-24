'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Film, ExternalLink, AlertCircle, CheckCircle2 } from 'lucide-react';

export interface GoogleDriveVideoItem {
  id: string;
  title?: string;
  driveUrl: string;
  aspectRatio?: '16:9' | '9:16';
}

/**
 * Tự động nhận diện và trích xuất File ID từ mọi định dạng link Google Drive phổ biến:
 * - https://drive.google.com/file/d/<FILE_ID>/view...
 * - https://drive.google.com/file/d/<FILE_ID>/preview
 * - https://drive.google.com/open?id=<FILE_ID>
 * - https://drive.google.com/uc?id=<FILE_ID>&export=download
 * - Link trực tiếp hoặc chuỗi ID thuần
 */
export function extractGoogleDriveFileId(rawUrl: string): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const url = rawUrl.trim();

  // Pattern 1: /file/d/<FILE_ID>/...
  const matchFileD = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (matchFileD && matchFileD[1]) return matchFileD[1];

  // Pattern 2: ?id=<FILE_ID> hoặc &id=<FILE_ID>
  const matchIdParam = url.match(/[?&]id=([a-zA-Z0-9_-]+)/i);
  if (matchIdParam && matchIdParam[1]) return matchIdParam[1];

  // Pattern 3: /d/<FILE_ID>
  const matchD = url.match(/\/d\/([a-zA-Z0-9_-]+)/i);
  if (matchD && matchD[1]) return matchD[1];

  // Pattern 4: Nếu người dùng dán trực tiếp File ID (chuỗi alphanumeric từ 20 ký tự trở lên)
  if (/^[a-zA-Z0-9_-]{20,60}$/.test(url)) {
    return url;
  }

  return null;
}

/**
 * Tạo URL nhúng chuẩn phát video từ Google Drive File ID với đầy đủ thanh điều khiển (seek bar, volume, HD, fullscreen)
 */
export function getGoogleDriveEmbedUrl(
  rawUrlOrId: string,
  options?: { autoPlay?: boolean; hd?: boolean }
): string | null {
  const fileId = extractGoogleDriveFileId(rawUrlOrId);
  if (!fileId) return null;

  const params = new URLSearchParams();
  if (options?.hd !== false) {
    params.set('vq', 'hd1080');
  }
  if (options?.autoPlay) {
    params.set('autoplay', '1');
  }

  const query = params.toString();
  return `https://drive.google.com/file/d/${fileId}/preview${query ? `?${query}` : ''}`;
}

interface GoogleDriveVideoPlayerProps {
  video: GoogleDriveVideoItem;
  coverImage?: string;
  className?: string;
  autoMountOnScroll?: boolean;
  autoPlay?: boolean;
  roundedClass?: string;
}

/**
 * Trình phát Video Google Drive với Lazy Load qua IntersectionObserver & Khóa cứng khung hình chống CLS
 */
export function GoogleDriveVideoPlayer({
  video,
  coverImage,
  className = '',
  autoMountOnScroll = true,
  autoPlay = false,
  roundedClass = 'rounded-2xl',
}: GoogleDriveVideoPlayerProps) {
  const [isVisible, setIsVisible] = useState(!autoMountOnScroll || autoPlay);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const containerRef = useRef<HTMLDivElement>(null);

  const fileId = useMemo(() => extractGoogleDriveFileId(video.driveUrl), [video.driveUrl]);
  const shouldAutoPlay = autoPlay || isPlaying;
  const embedUrl = useMemo(
    () => (fileId ? getGoogleDriveEmbedUrl(fileId, { autoPlay: shouldAutoPlay, hd: true }) : null),
    [fileId, shouldAutoPlay]
  );

  const isPortrait = video.aspectRatio === '9:16';
  const aspectClass = isPortrait ? 'aspect-[9/16] max-w-[340px] mx-auto' : 'aspect-video w-full';

  useEffect(() => {
    if (!autoMountOnScroll || isVisible) return;

    const target = containerRef.current;
    if (!target) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '300px 0px', threshold: 0 }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [autoMountOnScroll, isVisible]);

  if (!embedUrl) {
    return (
      <div
        className={`relative ${aspectClass} rounded-2xl bg-[#1C1917] border border-amber-900/30 flex flex-col items-center justify-center p-6 text-center text-stone-400 ${className}`}
      >
        <AlertCircle className="w-8 h-8 text-amber-500/80 mb-2" />
        <p className="text-xs font-medium text-stone-300">Đường dẫn Google Drive không hợp lệ</p>
        <p className="text-[11px] text-stone-500 mt-1 max-w-sm">
          Vui lòng kiểm tra lại đường dẫn video trên Google Drive và đảm bảo đã bật chia sẻ công khai.
        </p>
      </div>
    );
  }

  const shouldRenderIframe = isVisible || isPlaying || autoPlay;

  return (
    <div
      ref={containerRef}
      className={`relative ${roundedClass} overflow-hidden border border-stone-800/80 shadow-md bg-black transition-all ${aspectClass} ${className}`}
    >
      {/* Luxury Editorial Watermark & Drive Pop-out Blocker */}
      <div
        className="absolute top-2.5 right-2.5 z-20 pointer-events-auto select-none min-w-[138px] h-9 sm:h-10 px-3.5 rounded-full bg-[#1C1917]/95 border border-[#C5A059]/40 backdrop-blur-md flex items-center justify-center gap-2 shadow-md cursor-default"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        title="PlusMoments Wedding Film"
        aria-label="PlusMoments Wedding Film"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#E5C585] shadow-[0_0_8px_#E5C585] shrink-0 animate-pulse" />
        <span className="text-[10px] tracking-[0.22em] uppercase text-[#E5C585] font-medium font-mono whitespace-nowrap">
          PLUSMOMENTS FILM
        </span>
      </div>

      {shouldRenderIframe ? (
        <iframe
          src={embedUrl}
          title={video.title || 'Video Google Drive - PlusMoments Film'}
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
          loading="lazy"
          className={`w-full h-full border-0 ${roundedClass} bg-black block`}
        />
      ) : (
        <div
          onClick={() => setIsPlaying(true)}
          className="w-full h-full group cursor-pointer relative flex flex-col items-center justify-center p-6 text-center overflow-hidden"
        >
          {/* Optional Poster / Cover Background */}
          {coverImage && (
            <img
              src={coverImage}
              alt={video.title || 'Video Thumbnail'}
              className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-500 filter blur-xs"
              loading="lazy"
            />
          )}

          {/* Luxury Film Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

          {/* Center Play Icon */}
          <div className="relative z-10 w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-2xl group-hover:scale-110 group-hover:bg-[#8C6D46] group-hover:border-[#8C6D46] transition-all duration-300">
            <Play className="w-7 h-7 fill-white translate-x-0.5" />
          </div>

          {/* Title & Badge */}
          <div className="relative z-10 mt-4 max-w-md">
            {video.title ? (
              <h4 className="font-serif text-sm sm:text-base font-medium text-white line-clamp-1 drop-shadow-md">
                {video.title}
              </h4>
            ) : (
              <span className="font-mono text-[11px] uppercase tracking-wider text-stone-300">
                Thước Phim Kỷ Niệm
              </span>
            )}
            <p className="text-[11px] text-stone-400 mt-1 flex items-center justify-center gap-1.5 font-sans">
              <Film className="w-3 h-3 text-[#C5A880]" />
              <span>Bấm để phát video Google Drive</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

interface GoogleDriveVideoListProps {
  videos?: GoogleDriveVideoItem[] | null;
  coverImage?: string;
  className?: string;
}

/**
 * Hiển thị danh sách Video Google Drive phân theo tỷ lệ 16:9 và 9:16
 */
export function GoogleDriveVideoList({
  videos,
  coverImage,
  className = '',
}: GoogleDriveVideoListProps) {
  if (!videos || !Array.isArray(videos) || videos.length === 0) {
    return null;
  }

  // Lọc các video có đường dẫn hợp lệ
  const validVideos = videos.filter((v) => extractGoogleDriveFileId(v.driveUrl) !== null);
  if (validVideos.length === 0) return null;

  const landscapeVideos = validVideos.filter((v) => v.aspectRatio !== '9:16');
  const portraitVideos = validVideos.filter((v) => v.aspectRatio === '9:16');

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 1. Các video ngang 16:9 (Trải rộng toàn cột) */}
      {landscapeVideos.length > 0 && (
        <div className="space-y-6">
          {landscapeVideos.map((video, idx) => (
            <div key={video.id || idx} className="space-y-2">
              {video.title && (
                <div className="flex items-center gap-2 text-stone-700">
                  <Film className="w-4 h-4 text-[#8C6D46]" />
                  <span className="font-serif font-medium text-sm text-stone-900">{video.title}</span>
                </div>
              )}
              <GoogleDriveVideoPlayer video={video} coverImage={coverImage} />
            </div>
          ))}
        </div>
      )}

      {/* 2. Các video dọc 9:16 (Xếp lưới 2 cột gọn gàng) */}
      {portraitVideos.length > 0 && (
        <div className="pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {portraitVideos.map((video, idx) => (
              <div key={video.id || idx} className="space-y-2">
                {video.title && (
                  <div className="text-center font-serif font-medium text-xs text-stone-800 line-clamp-1">
                    {video.title}
                  </div>
                )}
                <GoogleDriveVideoPlayer video={video} coverImage={coverImage} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
