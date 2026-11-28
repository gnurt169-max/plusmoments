'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  X,
  Download,
  Upload,
  RefreshCw,
  Sparkles,
  Layers,
  LayoutGrid,
  Image as ImageIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  Sliders,
  FlipHorizontal,
  Search,
  Maximize2,
  Trash2,
  Shuffle,
  AlertCircle,
  Loader2,
  Type,
  Move,
  ZoomIn,
  RotateCcw,
  Sparkle,
} from 'lucide-react';

export type CollageLayoutType =
  | 'editorial-spread'
  | 'cinematic-trio'
  | 'gallery-grid-6'
  | 'hero-filmstrip-5'
  | 'asymmetric-lookbook-4'
  | 'romantic-duo-2'
  | 'mosaic-story-8'
  | 'polaroid-memories-4';

export type CollageResolution = '1080p' | '4k';
export type CollageTheme = 'warm-ivory' | 'noir' | 'classic-white' | 'editorial-rose';

export interface SlotTransform {
  zoom: number;       // 1.0 to 3.0
  offsetX: number;    // -50% to +50%
  offsetY: number;    // -50% to +50%
  flipX: boolean;     // horizontal flip
}

export interface CustomLayoutParams {
  splitRatio: number; // 0.28 to 0.72
  insetScale: number; // 0.75 to 1.35
}

export interface LayoutSlotBox {
  slot: number;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation?: number;  // degrees for Polaroid tilt
  label: string;
  isInset?: boolean;
}

export interface AlbumCollageStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAlbumId?: string | null;
  initialImages?: string[];
  onSavedToMedia?: (url: string) => void;
}

interface AlbumOption {
  id: string;
  title: string;
  slug: string;
  coupleNames?: string;
  location?: string;
  coverImage: string;
  media?: Array<{ id: string; url: string; originalUrl?: string }>;
}

interface MediaFileOption {
  id: string;
  url: string;
  filename: string;
  name?: string;
  originalUrl?: string;
  folderId?: string | null;
}

const PRESET_QUOTES = [
  'I have found the one whom my soul loves.',
  'Every love story is beautiful, but ours is my favorite.',
  'Together is our favorite place to be.',
  'The best thing to hold onto in life is each other.',
  'Once in a while, in the middle of an ordinary life, love gives us a fairy tale.',
  'Where you go I will go, and where you stay I will stay.',
  'The beginning of everything, and the promise of forever.',
];

export const LAYOUT_SLOT_COUNTS: Record<CollageLayoutType, number> = {
  'editorial-spread': 6,
  'cinematic-trio': 3,
  'gallery-grid-6': 6,
  'hero-filmstrip-5': 5,
  'asymmetric-lookbook-4': 4,
  'romantic-duo-2': 2,
  'mosaic-story-8': 8,
  'polaroid-memories-4': 4,
};

export const DEFAULT_LAYOUT_PARAMS: Record<CollageLayoutType, CustomLayoutParams> = {
  'editorial-spread': { splitRatio: 0.50, insetScale: 1.0 },
  'cinematic-trio': { splitRatio: 0.46, insetScale: 1.0 },
  'gallery-grid-6': { splitRatio: 0.50, insetScale: 1.0 },
  'hero-filmstrip-5': { splitRatio: 0.62, insetScale: 1.0 },
  'asymmetric-lookbook-4': { splitRatio: 0.44, insetScale: 1.0 },
  'romantic-duo-2': { splitRatio: 0.38, insetScale: 1.0 },
  'mosaic-story-8': { splitRatio: 0.50, insetScale: 1.0 },
  'polaroid-memories-4': { splitRatio: 0.50, insetScale: 1.0 },
};

/**
 * Calculates absolute layout boxes in base coordinates (1920x1080)
 */
export function getLayoutSlots(
  width: number,
  height: number,
  layout: CollageLayoutType,
  params: CustomLayoutParams,
  borderWidth: 'none' | 'thin' | 'magazine' = 'magazine'
): LayoutSlotBox[] {
  const scale = width / 1920;
  const splitRatio = params.splitRatio;
  const insetScale = params.insetScale || 1.0;

  if (layout === 'editorial-spread') {
    const halfW = width * splitRatio;
    const insetAW = 400 * scale * insetScale;
    const insetAH = 580 * scale * insetScale;
    const insetAX = 60 * scale;
    const insetAY = 380 * scale;

    const insetBW = 410 * scale * insetScale;
    const insetBH = 600 * scale * insetScale;
    const insetBX = Math.max(insetAX + 180 * scale, halfW - insetBW - 30 * scale);
    const insetBY = 130 * scale;

    const padX = 40 * scale;
    const padTop = 40 * scale;
    const gap = 16 * scale;
    const bannerH = 70 * scale;

    const rightAreaW = (width - halfW) - padX * 2;
    const rightAreaH = height - padTop - padX - bannerH;

    const cellW = (rightAreaW - gap) / 2;
    const cellH = (rightAreaH - gap) / 2;

    return [
      { slot: 0, x: insetAX, y: insetAY, w: insetAW, h: insetAH, label: 'Thẻ Nổi A', isInset: true },
      { slot: 1, x: insetBX, y: insetBY, w: insetBW, h: insetBH, label: 'Thẻ Nổi B', isInset: true },
      { slot: 2, x: halfW + padX, y: padTop, w: cellW, h: cellH, label: 'Lưới Trên-Trái' },
      { slot: 3, x: halfW + padX + cellW + gap, y: padTop, w: cellW, h: cellH, label: 'Lưới Trên-Phải' },
      { slot: 4, x: halfW + padX, y: padTop + cellH + gap, w: cellW, h: cellH, label: 'Lưới Dưới-Trái' },
      { slot: 5, x: halfW + padX + cellW + gap, y: padTop + cellH + gap, w: cellW, h: cellH, label: 'Lưới Dưới-Phải' },
    ];
  }

  if (layout === 'cinematic-trio') {
    const pad = (borderWidth === 'none' ? 0 : borderWidth === 'thin' ? 16 : 28) * scale;
    const gap = 16 * scale;
    const usableW = width - pad * 2;
    const usableH = height - pad * 2;

    const leftW = Math.round(usableW * splitRatio);
    const rightW = usableW - leftW - gap;
    const stackH = (usableH - gap) / 2;

    return [
      { slot: 0, x: pad, y: pad, w: leftW, h: usableH, label: 'Hero Dọc Lớn' },
      { slot: 1, x: pad + leftW + gap, y: pad, w: rightW, h: stackH, label: 'Ảnh Phải Trên' },
      { slot: 2, x: pad + leftW + gap, y: pad + stackH + gap, w: rightW, h: stackH, label: 'Ảnh Phải Dưới' },
    ];
  }

  if (layout === 'gallery-grid-6') {
    const pad = (borderWidth === 'none' ? 0 : borderWidth === 'thin' ? 20 : 36) * scale;
    const gap = 16 * scale;
    const bannerReserve = 60 * scale;

    const usableW = width - pad * 2;
    const usableH = height - pad * 2 - bannerReserve;

    const colW = (usableW - gap * 2) / 3;
    const rowH = (usableH - gap) / 2;

    return [
      { slot: 0, x: pad + 0 * (colW + gap), y: pad + 0 * (rowH + gap), w: colW, h: rowH, label: 'Ô 1' },
      { slot: 1, x: pad + 1 * (colW + gap), y: pad + 0 * (rowH + gap), w: colW, h: rowH, label: 'Ô 2' },
      { slot: 2, x: pad + 2 * (colW + gap), y: pad + 0 * (rowH + gap), w: colW, h: rowH, label: 'Ô 3' },
      { slot: 3, x: pad + 0 * (colW + gap), y: pad + 1 * (rowH + gap), w: colW, h: rowH, label: 'Ô 4' },
      { slot: 4, x: pad + 1 * (colW + gap), y: pad + 1 * (rowH + gap), w: colW, h: rowH, label: 'Ô 5' },
      { slot: 5, x: pad + 2 * (colW + gap), y: pad + 1 * (rowH + gap), w: colW, h: rowH, label: 'Ô 6' },
    ];
  }

  if (layout === 'hero-filmstrip-5') {
    const pad = (borderWidth === 'none' ? 0 : borderWidth === 'thin' ? 16 : 28) * scale;
    const gap = 14 * scale;
    const bannerReserve = 48 * scale;

    const usableW = width - pad * 2;
    const usableH = height - pad * 2 - bannerReserve;

    const heroH = Math.round(usableH * splitRatio);
    const filmstripH = usableH - heroH - gap;
    const stripColW = (usableW - gap * 3) / 4;

    return [
      { slot: 0, x: pad, y: pad, w: usableW, h: heroH, label: 'Hero Panorama' },
      { slot: 1, x: pad + 0 * (stripColW + gap), y: pad + heroH + gap, w: stripColW, h: filmstripH, label: 'Dải Phim 1' },
      { slot: 2, x: pad + 1 * (stripColW + gap), y: pad + heroH + gap, w: stripColW, h: filmstripH, label: 'Dải Phim 2' },
      { slot: 3, x: pad + 2 * (stripColW + gap), y: pad + heroH + gap, w: stripColW, h: filmstripH, label: 'Dải Phim 3' },
      { slot: 4, x: pad + 3 * (stripColW + gap), y: pad + heroH + gap, w: stripColW, h: filmstripH, label: 'Dải Phim 4' },
    ];
  }

  if (layout === 'asymmetric-lookbook-4') {
    const pad = (borderWidth === 'none' ? 0 : borderWidth === 'thin' ? 16 : 28) * scale;
    const gap = 16 * scale;
    const bannerReserve = 50 * scale;

    const usableW = width - pad * 2;
    const usableH = height - pad * 2 - bannerReserve;

    const leftW = Math.round(usableW * splitRatio);
    const rightW = usableW - leftW - gap;

    const topH = Math.round(usableH * 0.48);
    const bottomH = usableH - topH - gap;
    const subColW = (rightW - gap) / 2;

    return [
      { slot: 0, x: pad, y: pad, w: leftW, h: usableH, label: 'Hero Dọc Trái' },
      { slot: 1, x: pad + leftW + gap, y: pad, w: rightW, h: topH, label: 'Ngang Phải Trên' },
      { slot: 2, x: pad + leftW + gap, y: pad + topH + gap, w: subColW, h: bottomH, label: 'Dưới Trái' },
      { slot: 3, x: pad + leftW + gap + subColW + gap, y: pad + topH + gap, w: subColW, h: bottomH, label: 'Dưới Phải' },
    ];
  }

  if (layout === 'romantic-duo-2') {
    const pad = (borderWidth === 'none' ? 0 : borderWidth === 'thin' ? 24 : 40) * scale;
    const bannerReserve = 40 * scale;

    const usableW = width - pad * 2;
    const usableH = height - pad * 2 - bannerReserve;
    const photoW = Math.round(usableW * splitRatio);

    return [
      { slot: 0, x: pad, y: pad, w: photoW, h: usableH, label: 'Chân Dung Trái' },
      { slot: 1, x: width - pad - photoW, y: pad, w: photoW, h: usableH, label: 'Chân Dung Phải' },
    ];
  }

  if (layout === 'mosaic-story-8') {
    const pad = (borderWidth === 'none' ? 0 : borderWidth === 'thin' ? 16 : 26) * scale;
    const gap = 12 * scale;
    const bannerReserve = 56 * scale;

    const usableW = width - pad * 2;
    const usableH = height - pad * 2 - bannerReserve;

    const colW = (usableW - gap * 3) / 4;
    const rowH = (usableH - gap) / 2;

    return [
      { slot: 0, x: pad + 0 * (colW + gap), y: pad + 0 * (rowH + gap), w: colW, h: rowH, label: 'Ô 1' },
      { slot: 1, x: pad + 1 * (colW + gap), y: pad + 0 * (rowH + gap), w: colW, h: rowH, label: 'Ô 2' },
      { slot: 2, x: pad + 2 * (colW + gap), y: pad + 0 * (rowH + gap), w: colW, h: rowH, label: 'Ô 3' },
      { slot: 3, x: pad + 3 * (colW + gap), y: pad + 0 * (rowH + gap), w: colW, h: rowH, label: 'Ô 4' },
      { slot: 4, x: pad + 0 * (colW + gap), y: pad + 1 * (rowH + gap), w: colW, h: rowH, label: 'Ô 5' },
      { slot: 5, x: pad + 1 * (colW + gap), y: pad + 1 * (rowH + gap), w: colW, h: rowH, label: 'Ô 6' },
      { slot: 6, x: pad + 2 * (colW + gap), y: pad + 1 * (rowH + gap), w: colW, h: rowH, label: 'Ô 7' },
      { slot: 7, x: pad + 3 * (colW + gap), y: pad + 1 * (rowH + gap), w: colW, h: rowH, label: 'Ô 8' },
    ];
  }

  if (layout === 'polaroid-memories-4') {
    const cardW = 380 * scale * insetScale;
    const cardH = 470 * scale * insetScale;

    return [
      { slot: 0, x: 120 * scale, y: 310 * scale, w: cardW, h: cardH, rotation: -4, label: 'Polaroid 1' },
      { slot: 1, x: 540 * scale, y: 260 * scale, w: cardW, h: cardH, rotation: 3, label: 'Polaroid 2' },
      { slot: 2, x: 980 * scale, y: 320 * scale, w: cardW, h: cardH, rotation: -3, label: 'Polaroid 3' },
      { slot: 3, x: 1420 * scale, y: 270 * scale, w: cardW, h: cardH, rotation: 4, label: 'Polaroid 4' },
    ];
  }

  return [];
}

/**
 * Helper to hit-test a base coordinate (0..1920, 0..1080) to slot index
 */
export function findSlotAt(
  x: number,
  y: number,
  layout: CollageLayoutType,
  params: CustomLayoutParams,
  borderWidth: 'none' | 'thin' | 'magazine'
): number {
  const boxes = getLayoutSlots(1920, 1080, layout, params, borderWidth);
  // Check in reverse order so insets/top layers get chosen first
  for (let i = boxes.length - 1; i >= 0; i--) {
    const b = boxes[i];
    if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
      return b.slot;
    }
  }
  return -1;
}

export function AlbumCollageStudioModal({
  isOpen,
  onClose,
  initialAlbumId,
  initialImages,
  onSavedToMedia,
}: AlbumCollageStudioModalProps) {
  // Source tabs: 'album' | 'media'
  const [sourceTab, setSourceTab] = useState<'album' | 'media'>('album');

  // Albums data
  const [albums, setAlbums] = useState<AlbumOption[]>([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>('');
  const [loadingAlbums, setLoadingAlbums] = useState(false);

  // Media Library data
  const [mediaFiles, setMediaFiles] = useState<MediaFileOption[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [mediaSearch, setMediaSearch] = useState('');

  // Selected Images for collage (ordered list up to 8 images)
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);

  // Studio Settings
  const [layout, setLayout] = useState<CollageLayoutType>('editorial-spread');
  const [resolution, setResolution] = useState<CollageResolution>('1080p');
  const [theme, setTheme] = useState<CollageTheme>('warm-ivory');
  const [borderWidth, setBorderWidth] = useState<'none' | 'thin' | 'magazine'>('magazine');

  // Interactive Custom Dimensions Per Layout
  const [customParams, setCustomParams] = useState<Record<CollageLayoutType, CustomLayoutParams>>(
    DEFAULT_LAYOUT_PARAMS
  );

  // Typography Settings
  const [showTitle, setShowTitle] = useState(true);
  const [titleText, setTitleText] = useState('The beginning of Everything');
  const [showSubtitle, setShowSubtitle] = useState(true);
  const [subtitleText, setSubtitleText] = useState('AN EVERLASTING STORY • CHAPTER ONE');
  const [showQuote, setShowQuote] = useState(true);
  const [quoteText, setQuoteText] = useState(PRESET_QUOTES[0]);
  const [coupleCaption, setCoupleCaption] = useState('MINH TRUNG & THANH THAO — 2026');

  // Brand Watermark Settings ("plusmoments.vn" on ALL templates)
  const [autoBrandWatermark, setAutoBrandWatermark] = useState<boolean>(true);
  const [watermarkPosition, setWatermarkPosition] = useState<'bottom-right' | 'bottom-center' | 'bottom-left'>('bottom-right');
  const [watermarkText, setWatermarkText] = useState<string>('plusmoments.vn');

  // Per-slot fine tuning (up to 8 slots)
  const [activeSlotIndex, setActiveSlotIndex] = useState<number>(0);
  const [slotTransforms, setSlotTransforms] = useState<Record<number, SlotTransform>>({
    0: { zoom: 1.0, offsetX: 0, offsetY: 0, flipX: false },
    1: { zoom: 1.0, offsetX: 0, offsetY: 0, flipX: false },
    2: { zoom: 1.0, offsetX: 0, offsetY: 0, flipX: false },
    3: { zoom: 1.0, offsetX: 0, offsetY: 0, flipX: false },
    4: { zoom: 1.0, offsetX: 0, offsetY: 0, flipX: false },
    5: { zoom: 1.0, offsetX: 0, offsetY: 0, flipX: false },
    6: { zoom: 1.0, offsetX: 0, offsetY: 0, flipX: false },
    7: { zoom: 1.0, offsetX: 0, offsetY: 0, flipX: false },
  });

  // 60FPS REFS: Isolate state from React re-renders during active drag / wheel
  const slotTransformsRef = useRef<Record<number, SlotTransform>>(slotTransforms);
  const customParamsRef = useRef<Record<CollageLayoutType, CustomLayoutParams>>(customParams);

  useEffect(() => {
    slotTransformsRef.current = slotTransforms;
  }, [slotTransforms]);

  useEffect(() => {
    customParamsRef.current = customParams;
  }, [customParams]);

  // Blurred Background Offscreen Cache to eliminate heavy CPU Gaussian blur during 60FPS drag
  const blurredBgCacheRef = useRef<{
    key: string;
    canvas: HTMLCanvasElement;
  } | null>(null);

  // Animation frame ref for drag & wheel
  const rafIdRef = useRef<number | null>(null);
  const wheelDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Interactive Drag-to-Pan / Resize State
  const [dragMode, setDragMode] = useState<'pan' | 'resize-split' | null>(null);
  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    initOffsetX: number;
    initOffsetY: number;
    initSplitRatio: number;
    slotIndex: number;
  }>({
    startX: 0,
    startY: 0,
    initOffsetX: 0,
    initOffsetY: 0,
    initSplitRatio: 0.5,
    slotIndex: 0,
  });

  // Export & Action state
  const [isRendering, setIsRendering] = useState(false);
  const [isSavingMedia, setIsSavingMedia] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Canvas and Preview container refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewContainerRef = useRef<HTMLDivElement | null>(null);
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Pre-load Google Fonts for canvas drawing
  useEffect(() => {
    if (!document.getElementById('plusmoments-canvas-fonts')) {
      const link = document.createElement('link');
      link.id = 'plusmoments-canvas-fonts';
      link.rel = 'stylesheet';
      link.href =
        'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Montserrat:wght@400;500;600;700&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  // Fetch albums on modal open
  useEffect(() => {
    if (!isOpen) return;

    async function loadAlbums() {
      try {
        setLoadingAlbums(true);
        const res = await fetch('/api/admin/albums');
        const data = await res.json();
        if (data.success && Array.isArray(data.albums)) {
          setAlbums(data.albums);
          if (initialAlbumId) {
            setSelectedAlbumId(initialAlbumId);
            const found = data.albums.find((a: AlbumOption) => a.id === initialAlbumId);
            if (found) {
              const albumImages: string[] = [];
              if (found.coverImage) albumImages.push(found.coverImage);
              if (Array.isArray(found.media)) {
                found.media.forEach((m: any) => {
                  const rawUrl = m?.originalUrl || m?.url;
                  if (rawUrl && !albumImages.includes(rawUrl)) albumImages.push(rawUrl);
                });
              }
              setSelectedUrls(albumImages.slice(0, 8));
              if (found.coupleNames) setCoupleCaption(`${found.coupleNames.toUpperCase()} — 2026`);
              if (found.title) setTitleText(found.title);
            }
          } else if (data.albums.length > 0 && !selectedAlbumId) {
            const first = data.albums[0];
            setSelectedAlbumId(first.id);
            const albumImages: string[] = [];
            if (first.coverImage) albumImages.push(first.coverImage);
            if (Array.isArray(first.media)) {
              first.media.forEach((m: any) => {
                const rawUrl = m?.originalUrl || m?.url;
                if (rawUrl && !albumImages.includes(rawUrl)) albumImages.push(rawUrl);
              });
            }
            setSelectedUrls(albumImages.slice(0, 8));
            if (first.coupleNames) setCoupleCaption(`${first.coupleNames.toUpperCase()} — 2026`);
          }
        }
      } catch (err: any) {
        showToast('Lỗi khi tải danh sách bộ sưu tập: ' + err.message);
      } finally {
        setLoadingAlbums(false);
      }
    }

    loadAlbums();

    if (initialImages && initialImages.length > 0) {
      setSelectedUrls(initialImages.slice(0, 8));
    }
  }, [isOpen, initialAlbumId]);

  // Fetch media when switching to media tab
  useEffect(() => {
    if (!isOpen || sourceTab !== 'media' || mediaFiles.length > 0) return;

    async function loadMedia() {
      try {
        setLoadingMedia(true);
        const res = await fetch('/api/admin/media');
        const data = await res.json();
        if (data.success && Array.isArray(data.media)) {
          setMediaFiles(data.media);
        }
      } catch (err: any) {
        showToast('Lỗi khi tải kho media: ' + err.message);
      } finally {
        setLoadingMedia(false);
      }
    }

    loadMedia();
  }, [isOpen, sourceTab]);

  // Currently active album object
  const currentAlbum = useMemo(() => {
    return albums.find((a) => a.id === selectedAlbumId) || null;
  }, [albums, selectedAlbumId]);

  // All images belonging to current album
  const currentAlbumImages = useMemo(() => {
    if (!currentAlbum) return [];
    const list: string[] = [];
    if (currentAlbum.coverImage) list.push(currentAlbum.coverImage);
    if (Array.isArray(currentAlbum.media)) {
      currentAlbum.media.forEach((m) => {
        const rawUrl = m?.originalUrl || m?.url;
        if (rawUrl && !list.includes(rawUrl)) list.push(rawUrl);
      });
    }
    return list;
  }, [currentAlbum]);

  // Filtered media files
  const filteredMedia = useMemo(() => {
    if (!mediaSearch.trim()) return mediaFiles;
    const q = mediaSearch.toLowerCase();
    return mediaFiles.filter(
      (m) => m.filename?.toLowerCase().includes(q) || m.name?.toLowerCase().includes(q)
    );
  }, [mediaFiles, mediaSearch]);

  // Handle album change
  const handleSelectAlbum = (albumId: string) => {
    setSelectedAlbumId(albumId);
    const found = albums.find((a) => a.id === albumId);
    if (!found) return;

    const albumImages: string[] = [];
    if (found.coverImage) albumImages.push(found.coverImage);
    if (Array.isArray(found.media)) {
      found.media.forEach((m) => {
        const rawUrl = m?.originalUrl || m?.url;
        if (rawUrl && !albumImages.includes(rawUrl)) albumImages.push(rawUrl);
      });
    }
    setSelectedUrls(albumImages.slice(0, 8));
    if (found.coupleNames) setCoupleCaption(`${found.coupleNames.toUpperCase()} — 2026`);
    if (found.title) setTitleText(found.title);
  };

  // Toggle image selection
  const handleToggleImage = (url: string) => {
    if (selectedUrls.includes(url)) {
      setSelectedUrls((prev) => prev.filter((u) => u !== url));
    } else {
      if (selectedUrls.length >= 8) {
        showToast('Đã chọn tối đa 8 ảnh cho bố cục 16:9');
        return;
      }
      setSelectedUrls((prev) => [...prev, url]);
    }
  };

  // Move selected image position left/right
  const handleMoveImage = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= selectedUrls.length) return;

    const copy = [...selectedUrls];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    setSelectedUrls(copy);
  };

  // Remove image from selected tray
  const handleRemoveSelectedImage = (index: number) => {
    setSelectedUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Shuffle selected images
  const handleShuffleImages = () => {
    setSelectedUrls((prev) => [...prev].sort(() => Math.random() - 0.5));
  };

  // Select required images for current layout
  const handleSelectEnoughImages = () => {
    const countNeeded = LAYOUT_SLOT_COUNTS[layout];
    if (currentAlbumImages.length === 0) return;
    setSelectedUrls(currentAlbumImages.slice(0, countNeeded));
  };

  // Reset frame layout ratios to template defaults
  const handleResetFrameLayout = () => {
    const defaultParams = { ...DEFAULT_LAYOUT_PARAMS[layout] };
    customParamsRef.current[layout] = defaultParams;
    setCustomParams((prev) => ({
      ...prev,
      [layout]: defaultParams,
    }));
    showToast('↺ Đã đặt lại tỷ lệ khung ảnh chuẩn cho mẫu này');
  };

  // Helper to load image as HTMLImageElement with CORS & High-Res original
  const loadImage = useCallback((url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      if (imageCacheRef.current.has(url)) {
        const cached = imageCacheRef.current.get(url)!;
        if (cached.complete && cached.naturalWidth > 0) {
          resolve(cached);
          return;
        }
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.decoding = 'async';
      img.onload = async () => {
        try {
          await img.decode();
        } catch {}
        imageCacheRef.current.set(url, img);
        resolve(img);
      };
      img.onerror = () => {
        const retryImg = new Image();
        retryImg.decoding = 'async';
        retryImg.onload = async () => {
          try {
            await retryImg.decode();
          } catch {}
          imageCacheRef.current.set(url, retryImg);
          resolve(retryImg);
        };
        retryImg.onerror = (e) => reject(e);
        retryImg.src = url;
      };
      img.src = url;
    });
  }, []);

  // Helper to draw an image inside a box with zoom, pan offset, flip, and ISOLATED filter
  const drawFittedImage = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      img: HTMLImageElement,
      dx: number,
      dy: number,
      dw: number,
      dh: number,
      transform?: SlotTransform
    ) => {
      const zoom = transform?.zoom || 1.0;
      const offsetX = transform?.offsetX || 0;
      const offsetY = transform?.offsetY || 0;
      const flipX = transform?.flipX || false;

      const imgW = img.naturalWidth || img.width;
      const imgH = img.naturalHeight || img.height;
      if (!imgW || !imgH || dw <= 0 || dh <= 0) return;

      const imgAspect = imgW / imgH;
      const boxAspect = dw / dh;

      let baseW = imgW;
      let baseH = imgH;

      if (imgAspect > boxAspect) {
        baseW = imgH * boxAspect;
      } else {
        baseH = imgW / boxAspect;
      }

      const cropW = baseW / zoom;
      const cropH = baseH / zoom;

      const centerX = imgW / 2;
      const centerY = imgH / 2;
      const maxPanX = Math.max(0, (imgW - cropW) / 2);
      const maxPanY = Math.max(0, (imgH - cropH) / 2);

      let cropX = centerX - cropW / 2 + (offsetX / 50) * maxPanX;
      let cropY = centerY - cropH / 2 + (offsetY / 50) * maxPanY;

      cropX = Math.max(0, Math.min(imgW - cropW, cropX));
      cropY = Math.max(0, Math.min(imgH - cropH, cropY));

      ctx.save();
      // CRITICAL: Always ensure imageSmoothing is active & filter is explicitly none
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.filter = 'none';

      ctx.beginPath();
      ctx.rect(dx, dy, dw, dh);
      ctx.clip();

      if (flipX) {
        ctx.translate(dx + dw, dy);
        ctx.scale(-1, 1);
        ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, dw, dh);
      } else {
        ctx.drawImage(img, cropX, cropY, cropW, cropH, dx, dy, dw, dh);
      }

      ctx.restore();
      ctx.filter = 'none';
    },
    []
  );

  // Helper to draw Brand Watermark ("plusmoments.vn" on ALL templates)
  const drawBrandWatermark = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      scale: number,
      pos: 'bottom-right' | 'bottom-center' | 'bottom-left',
      brandText: string,
      currentTheme: CollageTheme
    ) => {
      ctx.save();
      ctx.filter = 'none';
      const text = (brandText || 'PLUSMOMENTS.VN').toUpperCase();
      const fontSize = 11 * scale;
      ctx.font = `700 ${fontSize}px "Montserrat", sans-serif`;
      ctx.letterSpacing = `${3.5 * scale}px`;

      let textColor = '#C5A059';
      let lineCol = 'rgba(197, 160, 89, 0.45)';

      if (currentTheme === 'warm-ivory' || currentTheme === 'classic-white') {
        textColor = '#8C6D46';
        lineCol = 'rgba(140, 109, 70, 0.4)';
      } else if (currentTheme === 'noir') {
        textColor = '#E5C585';
        lineCol = 'rgba(229, 197, 133, 0.45)';
      } else if (currentTheme === 'editorial-rose') {
        textColor = '#A67362';
        lineCol = 'rgba(166, 115, 98, 0.4)';
      }

      ctx.fillStyle = textColor;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
      ctx.shadowBlur = 4 * scale;

      const pad = 36 * scale;
      const bottomY = height - 20 * scale;
      const lineLen = 30 * scale;

      if (pos === 'bottom-right') {
        ctx.textAlign = 'right';
        ctx.fillText(text, width - pad, bottomY);
        const textMetrics = ctx.measureText(text);
        const textLeft = width - pad - textMetrics.width - 8 * scale;
        ctx.strokeStyle = lineCol;
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(textLeft - lineLen, bottomY - 3 * scale);
        ctx.lineTo(textLeft, bottomY - 3 * scale);
        ctx.stroke();
      } else if (pos === 'bottom-left') {
        ctx.textAlign = 'left';
        ctx.fillText(text, pad, bottomY);
        const textMetrics = ctx.measureText(text);
        const textRight = pad + textMetrics.width + 8 * scale;
        ctx.strokeStyle = lineCol;
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(textRight, bottomY - 3 * scale);
        ctx.lineTo(textRight + lineLen, bottomY - 3 * scale);
        ctx.stroke();
      } else {
        ctx.textAlign = 'center';
        ctx.fillText(text, width / 2, bottomY);
        const textMetrics = ctx.measureText(text);
        const halfText = textMetrics.width / 2;
        ctx.strokeStyle = lineCol;
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(width / 2 - halfText - 12 * scale - lineLen, bottomY - 3 * scale);
        ctx.lineTo(width / 2 - halfText - 12 * scale, bottomY - 3 * scale);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(width / 2 + halfText + 12 * scale, bottomY - 3 * scale);
        ctx.lineTo(width / 2 + halfText + 12 * scale + lineLen, bottomY - 3 * scale);
        ctx.stroke();
      }
      ctx.restore();
    },
    []
  );

  // Helper to obtain or generate an Offscreen Blurred Canvas (eliminates repeated CPU blur)
  const getBlurredBgCanvas = useCallback(
    (
      bgImg: HTMLImageElement,
      targetW: number,
      targetH: number,
      blurRadius: number,
      tintColor: string,
      cacheKey: string
    ): HTMLCanvasElement => {
      if (
        blurredBgCacheRef.current &&
        blurredBgCacheRef.current.key === cacheKey &&
        blurredBgCacheRef.current.canvas.width === targetW &&
        blurredBgCacheRef.current.canvas.height === targetH
      ) {
        return blurredBgCacheRef.current.canvas;
      }

      const offCanvas = document.createElement('canvas');
      offCanvas.width = targetW;
      offCanvas.height = targetH;
      const offCtx = offCanvas.getContext('2d');
      if (!offCtx) return offCanvas;

      offCtx.imageSmoothingEnabled = true;
      offCtx.imageSmoothingQuality = 'high';

      // 1. Draw blurred image
      offCtx.save();
      offCtx.filter = `blur(${blurRadius}px)`;
      const bleed = 40 * (targetW / 1920);
      offCtx.drawImage(bgImg, -bleed, -bleed, targetW + bleed * 2, targetH + bleed * 2);
      offCtx.restore();
      offCtx.filter = 'none';

      // 2. Draw tint overlay
      offCtx.fillStyle = tintColor;
      offCtx.fillRect(0, 0, targetW, targetH);

      blurredBgCacheRef.current = { key: cacheKey, canvas: offCanvas };
      return offCanvas;
    },
    []
  );

  // Core Synchronous/Asynchronous Canvas Rendering Engine
  const renderCollageCore = useCallback(
    (
      targetCanvas: HTMLCanvasElement,
      exportResolution: CollageResolution,
      transforms: Record<number, SlotTransform>,
      paramsMap: Record<CollageLayoutType, CustomLayoutParams>
    ) => {
      const ctx = targetCanvas.getContext('2d');
      if (!ctx) return;

      const width = exportResolution === '4k' ? 3840 : 1920;
      const height = exportResolution === '4k' ? 2160 : 1080;
      const scale = exportResolution === '4k' ? 2 : 1;

      if (targetCanvas.width !== width || targetCanvas.height !== height) {
        targetCanvas.width = width;
        targetCanvas.height = height;
      }

      // CRITICAL: Ensure high-quality image smoothing & reset filter to none
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.filter = 'none';

      // Theme colors
      const themeBgColors = {
        'warm-ivory': '#FAF8F5',
        noir: '#121110',
        'classic-white': '#FFFFFF',
        'editorial-rose': '#F6F1ED',
      };
      const themeTextColors = {
        'warm-ivory': {
          title: '#2C2723',
          subtitle: '#8C6D46',
          quote: '#58514A',
          divider: 'rgba(140, 109, 70, 0.4)',
        },
        noir: {
          title: '#F5EBE1',
          subtitle: '#C5A059',
          quote: '#D1C7BD',
          divider: 'rgba(197, 160, 89, 0.4)',
        },
        'classic-white': {
          title: '#1A1A1A',
          subtitle: '#736B63',
          quote: '#4A4A4A',
          divider: 'rgba(0, 0, 0, 0.15)',
        },
        'editorial-rose': {
          title: '#362A28',
          subtitle: '#A67362',
          quote: '#5E4D49',
          divider: 'rgba(166, 115, 98, 0.35)',
        },
      };

      const bgFill = themeBgColors[theme];
      const textColor = themeTextColors[theme];

      // Fill canvas background
      ctx.fillStyle = bgFill;
      ctx.fillRect(0, 0, width, height);

      // Border settings
      const borderPx =
        borderWidth === 'none' ? 0 : borderWidth === 'thin' ? 8 * scale : 16 * scale;

      const effectiveUrls =
        selectedUrls.length > 0
          ? selectedUrls
          : ['/images/placeholder-wedding.jpg'];

      // Gather loaded images synchronously from imageCacheRef
      const validImages: HTMLImageElement[] = [];
      for (const u of effectiveUrls) {
        const cached = imageCacheRef.current.get(u);
        if (cached && cached.complete && cached.naturalWidth > 0) {
          validImages.push(cached);
        }
      }

      if (validImages.length === 0) {
        ctx.fillStyle = '#666';
        ctx.font = `${24 * scale}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(
          'Đang tải hình ảnh chất lượng cao...',
          width / 2,
          height / 2
        );
        return;
      }

      const getImageForSlot = (slotIdx: number): HTMLImageElement => {
        return validImages[slotIdx % validImages.length];
      };

      const currentParams = paramsMap[layout] || DEFAULT_LAYOUT_PARAMS[layout];
      const layoutBoxes = getLayoutSlots(width, height, layout, currentParams, borderWidth);

      // ========================================================================
      // 1. EDITORIAL SPREAD (6 Photos)
      // ========================================================================
      if (layout === 'editorial-spread') {
        const halfW = width * currentParams.splitRatio;

        // --- LEFT HALF: DRAW BLURRED BACKGROUND VIA OFFSCREEN CACHE ---
        const bgImg = getImageForSlot(0);
        const cacheKey = `editorial-spread_${bgImg.src}_${theme}_${Math.round(halfW)}x${height}`;
        const blurCanvas = getBlurredBgCanvas(
          bgImg,
          Math.round(halfW),
          height,
          18 * scale,
          theme === 'noir' ? 'rgba(0, 0, 0, 0.45)' : 'rgba(0, 0, 0, 0.22)',
          cacheKey
        );

        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, halfW, height);
        ctx.clip();
        ctx.drawImage(blurCanvas, 0, 0);
        ctx.restore();
        ctx.filter = 'none';

        // Draw Inset Photo A (Slot 0)
        const boxA = layoutBoxes.find((b) => b.slot === 0);
        if (boxA) {
          const frameA = 8 * scale;
          ctx.save();
          ctx.filter = 'none';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
          ctx.shadowBlur = 30 * scale;
          ctx.shadowOffsetY = 15 * scale;
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(boxA.x - frameA, boxA.y - frameA, boxA.w + frameA * 2, boxA.h + frameA * 2);
          ctx.restore();
          drawFittedImage(ctx, getImageForSlot(0), boxA.x, boxA.y, boxA.w, boxA.h, transforms[0]);
        }

        // Draw Inset Photo B (Slot 1)
        const boxB = layoutBoxes.find((b) => b.slot === 1);
        if (boxB) {
          const frameB = 8 * scale;
          ctx.save();
          ctx.filter = 'none';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.38)';
          ctx.shadowBlur = 35 * scale;
          ctx.shadowOffsetY = 18 * scale;
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(boxB.x - frameB, boxB.y - frameB, boxB.w + frameB * 2, boxB.h + frameB * 2);
          ctx.restore();
          drawFittedImage(ctx, getImageForSlot(1), boxB.x, boxB.y, boxB.w, boxB.h, transforms[1]);
        }

        // Left Half Typography Overlays
        if (showTitle && titleText) {
          ctx.save();
          ctx.filter = 'none';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
          ctx.shadowBlur = 12 * scale;
          ctx.fillStyle = '#FFFFFF';
          ctx.font = `italic 600 ${50 * scale}px "Dancing Script", cursive, Georgia, serif`;
          ctx.textAlign = 'left';
          ctx.fillText(titleText, 60 * scale, 120 * scale);

          if (showSubtitle && subtitleText) {
            ctx.font = `600 ${11 * scale}px "Montserrat", sans-serif`;
            ctx.letterSpacing = `${3 * scale}px`;
            ctx.fillStyle = '#E5C585';
            ctx.fillText(subtitleText.toUpperCase(), 62 * scale, 160 * scale);
          }
          ctx.restore();
        }

        if (showQuote && quoteText) {
          ctx.save();
          ctx.filter = 'none';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
          ctx.shadowBlur = 10 * scale;
          ctx.fillStyle = '#F8F6F0';
          ctx.font = `italic 400 ${16 * scale}px "Playfair Display", Georgia, serif`;
          ctx.textAlign = 'left';
          ctx.fillText(`“${quoteText}”`, 60 * scale, height - 50 * scale);
          ctx.restore();
        }

        // --- RIGHT HALF: 2x2 GRID (Slots 2, 3, 4, 5) ---
        layoutBoxes
          .filter((b) => b.slot >= 2)
          .forEach((box) => {
            if (borderPx > 0) {
              ctx.save();
              ctx.filter = 'none';
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(box.x - borderPx, box.y - borderPx, box.w + borderPx * 2, box.h + borderPx * 2);
              ctx.restore();
            }
            drawFittedImage(ctx, getImageForSlot(box.slot), box.x, box.y, box.w, box.h, transforms[box.slot]);
          });

        // Bottom Typography Banner on Right Half
        ctx.save();
        ctx.filter = 'none';
        const bannerCenterY = height - 35 * scale;
        const rightCenterX = halfW + (width - halfW) / 2;
        ctx.textAlign = 'center';

        ctx.strokeStyle = textColor.divider;
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(halfW + 60 * scale, bannerCenterY - 14 * scale);
        ctx.lineTo(width - 60 * scale, bannerCenterY - 14 * scale);
        ctx.stroke();

        ctx.fillStyle = textColor.subtitle;
        ctx.beginPath();
        const dSize = 4 * scale;
        ctx.moveTo(rightCenterX, bannerCenterY - 14 * scale - dSize);
        ctx.lineTo(rightCenterX + dSize, bannerCenterY - 14 * scale);
        ctx.lineTo(rightCenterX, bannerCenterY - 14 * scale + dSize);
        ctx.lineTo(rightCenterX - dSize, bannerCenterY - 14 * scale);
        ctx.fill();

        ctx.font = `600 ${12 * scale}px "Montserrat", sans-serif`;
        ctx.fillStyle = textColor.title;
        ctx.letterSpacing = `${3 * scale}px`;
        ctx.fillText(coupleCaption, rightCenterX, bannerCenterY + 8 * scale);
        ctx.restore();
      }

      // ========================================================================
      // 2. CINEMATIC TRIO (3 Photos)
      // ========================================================================
      else if (layout === 'cinematic-trio') {
        layoutBoxes.forEach((box) => {
          if (borderPx > 0) {
            ctx.save();
            ctx.filter = 'none';
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(box.x - borderPx, box.y - borderPx, box.w + borderPx * 2, box.h + borderPx * 2);
            ctx.restore();
          }
          drawFittedImage(ctx, getImageForSlot(box.slot), box.x, box.y, box.w, box.h, transforms[box.slot]);
        });

        // Bottom cinematic watermark bar on hero left
        const heroBox = layoutBoxes[0];
        if (heroBox && (showTitle || coupleCaption)) {
          ctx.save();
          ctx.filter = 'none';
          const barH = 54 * scale;
          const barY = heroBox.y + heroBox.h - barH;
          ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
          ctx.fillRect(heroBox.x, barY, heroBox.w, barH);

          ctx.textAlign = 'left';
          ctx.fillStyle = '#FFFFFF';
          ctx.font = `italic 600 ${22 * scale}px "Playfair Display", Georgia, serif`;
          ctx.fillText(titleText, heroBox.x + 20 * scale, barY + 34 * scale);

          ctx.textAlign = 'right';
          ctx.fillStyle = '#E5C585';
          ctx.font = `600 ${10 * scale}px "Montserrat", sans-serif`;
          ctx.letterSpacing = `${2 * scale}px`;
          ctx.fillText(coupleCaption, heroBox.x + heroBox.w - 20 * scale, barY + 33 * scale);
          ctx.restore();
        }
      }

      // ========================================================================
      // 3. GALLERY GRID 6 (6 Photos)
      // ========================================================================
      else if (layout === 'gallery-grid-6') {
        layoutBoxes.forEach((box) => {
          if (borderPx > 0) {
            ctx.save();
            ctx.filter = 'none';
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(box.x - borderPx, box.y - borderPx, box.w + borderPx * 2, box.h + borderPx * 2);
            ctx.restore();
          }
          drawFittedImage(ctx, getImageForSlot(box.slot), box.x, box.y, box.w, box.h, transforms[box.slot]);
        });

        ctx.save();
        ctx.filter = 'none';
        const bannerY = height - 44 * scale;
        ctx.textAlign = 'center';
        ctx.fillStyle = textColor.title;
        ctx.font = `italic 600 ${20 * scale}px "Playfair Display", Georgia, serif`;
        ctx.fillText(titleText, width / 2, bannerY);

        ctx.font = `600 ${10 * scale}px "Montserrat", sans-serif`;
        ctx.fillStyle = textColor.subtitle;
        ctx.letterSpacing = `${3 * scale}px`;
        ctx.fillText(coupleCaption, width / 2, bannerY + 22 * scale);
        ctx.restore();
      }

      // ========================================================================
      // 4. HERO + FILMSTRIP 5 (5 Photos)
      // ========================================================================
      else if (layout === 'hero-filmstrip-5') {
        layoutBoxes.forEach((box) => {
          if (borderPx > 0) {
            ctx.save();
            ctx.filter = 'none';
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(box.x - borderPx, box.y - borderPx, box.w + borderPx * 2, box.h + borderPx * 2);
            ctx.restore();
          }
          drawFittedImage(ctx, getImageForSlot(box.slot), box.x, box.y, box.w, box.h, transforms[box.slot]);
        });

        const heroBox = layoutBoxes[0];
        if (heroBox && showTitle) {
          ctx.save();
          ctx.filter = 'none';
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
          ctx.shadowBlur = 10 * scale;
          ctx.font = `italic 600 ${36 * scale}px "Dancing Script", cursive, Georgia, serif`;
          ctx.textAlign = 'left';
          ctx.fillText(titleText, heroBox.x + 30 * scale, heroBox.y + 60 * scale);

          if (showSubtitle && subtitleText) {
            ctx.font = `600 ${10 * scale}px "Montserrat", sans-serif`;
            ctx.fillStyle = '#E5C585';
            ctx.letterSpacing = `${2.5 * scale}px`;
            ctx.fillText(subtitleText.toUpperCase(), heroBox.x + 32 * scale, heroBox.y + 88 * scale);
          }
          ctx.restore();
        }

        ctx.save();
        ctx.filter = 'none';
        const bannerY = height - 24 * scale;
        ctx.textAlign = 'center';
        ctx.fillStyle = textColor.title;
        ctx.font = `600 ${10 * scale}px "Montserrat", sans-serif`;
        ctx.letterSpacing = `${3 * scale}px`;
        ctx.fillText(coupleCaption, width / 2, bannerY);
        ctx.restore();
      }

      // ========================================================================
      // 5. ASYMMETRIC LOOKBOOK 4 (4 Photos)
      // ========================================================================
      else if (layout === 'asymmetric-lookbook-4') {
        layoutBoxes.forEach((box) => {
          if (borderPx > 0) {
            ctx.save();
            ctx.filter = 'none';
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(box.x - borderPx, box.y - borderPx, box.w + borderPx * 2, box.h + borderPx * 2);
            ctx.restore();
          }
          drawFittedImage(ctx, getImageForSlot(box.slot), box.x, box.y, box.w, box.h, transforms[box.slot]);
        });

        ctx.save();
        ctx.filter = 'none';
        const bannerY = height - 26 * scale;
        ctx.textAlign = 'center';
        ctx.fillStyle = textColor.title;
        ctx.font = `italic 600 ${18 * scale}px "Playfair Display", Georgia, serif`;
        ctx.fillText(titleText, width / 2, bannerY);

        ctx.font = `600 ${9.5 * scale}px "Montserrat", sans-serif`;
        ctx.fillStyle = textColor.subtitle;
        ctx.letterSpacing = `${2.5 * scale}px`;
        ctx.fillText(coupleCaption, width / 2, bannerY + 16 * scale);
        ctx.restore();
      }

      // ========================================================================
      // 6. ROMANTIC DUO 2 (2 Photos)
      // ========================================================================
      else if (layout === 'romantic-duo-2') {
        layoutBoxes.forEach((box) => {
          if (borderPx > 0) {
            ctx.save();
            ctx.filter = 'none';
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(box.x - borderPx, box.y - borderPx, box.w + borderPx * 2, box.h + borderPx * 2);
            ctx.restore();
          }
          drawFittedImage(ctx, getImageForSlot(box.slot), box.x, box.y, box.w, box.h, transforms[box.slot]);
        });

        ctx.save();
        ctx.filter = 'none';
        const centerX = width / 2;
        ctx.textAlign = 'center';

        if (showSubtitle && subtitleText) {
          ctx.font = `600 ${11 * scale}px "Montserrat", sans-serif`;
          ctx.fillStyle = textColor.subtitle;
          ctx.letterSpacing = `${3.5 * scale}px`;
          ctx.fillText(subtitleText.toUpperCase(), centerX, 280 * scale);
        }

        ctx.fillStyle = textColor.subtitle;
        ctx.beginPath();
        const dSize = 6 * scale;
        ctx.moveTo(centerX, 330 * scale - dSize);
        ctx.lineTo(centerX + dSize, 330 * scale);
        ctx.lineTo(centerX, 330 * scale + dSize);
        ctx.lineTo(centerX - dSize, 330 * scale);
        ctx.fill();

        if (showTitle && titleText) {
          ctx.font = `italic 600 ${44 * scale}px "Dancing Script", cursive, Georgia, serif`;
          ctx.fillStyle = textColor.title;
          ctx.fillText(titleText, centerX, 410 * scale);
        }

        if (showQuote && quoteText) {
          ctx.font = `italic 400 ${17 * scale}px "Playfair Display", Georgia, serif`;
          ctx.fillStyle = textColor.quote;
          ctx.fillText(`“${quoteText}”`, centerX, 510 * scale);
        }

        ctx.font = `600 ${12 * scale}px "Montserrat", sans-serif`;
        ctx.fillStyle = textColor.title;
        ctx.letterSpacing = `${4 * scale}px`;
        ctx.fillText(coupleCaption, centerX, 610 * scale);
        ctx.restore();
      }

      // ========================================================================
      // 7. MOSAIC STORY 8 (8 Photos)
      // ========================================================================
      else if (layout === 'mosaic-story-8') {
        layoutBoxes.forEach((box) => {
          if (borderPx > 0) {
            ctx.save();
            ctx.filter = 'none';
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(box.x - borderPx, box.y - borderPx, box.w + borderPx * 2, box.h + borderPx * 2);
            ctx.restore();
          }
          drawFittedImage(ctx, getImageForSlot(box.slot), box.x, box.y, box.w, box.h, transforms[box.slot]);
        });

        ctx.save();
        ctx.filter = 'none';
        const bannerY = height - 26 * scale;
        ctx.textAlign = 'center';
        ctx.fillStyle = textColor.title;
        ctx.font = `italic 600 ${18 * scale}px "Playfair Display", Georgia, serif`;
        ctx.fillText(titleText, width / 2, bannerY);

        ctx.font = `600 ${9 * scale}px "Montserrat", sans-serif`;
        ctx.fillStyle = textColor.subtitle;
        ctx.letterSpacing = `${2.5 * scale}px`;
        ctx.fillText(coupleCaption, width / 2, bannerY + 16 * scale);
        ctx.restore();
      }

      // ========================================================================
      // 8. POLAROID MEMORIES 4 (4 Photos)
      // ========================================================================
      else if (layout === 'polaroid-memories-4') {
        // Draw Blurred Background via Offscreen Cache
        const bgImg = getImageForSlot(0);
        const cacheKey = `polaroid_${bgImg.src}_${theme}_${width}x${height}`;
        const blurCanvas = getBlurredBgCanvas(
          bgImg,
          width,
          height,
          22 * scale,
          theme === 'noir' ? 'rgba(0, 0, 0, 0.55)' : 'rgba(0, 0, 0, 0.28)',
          cacheKey
        );
        ctx.drawImage(blurCanvas, 0, 0);
        ctx.filter = 'none';

        // Top Typography
        if (showTitle && titleText) {
          ctx.save();
          ctx.filter = 'none';
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
          ctx.shadowBlur = 10 * scale;
          ctx.font = `italic 600 ${44 * scale}px "Dancing Script", cursive, Georgia, serif`;
          ctx.textAlign = 'center';
          ctx.fillText(titleText, width / 2, 110 * scale);

          if (showQuote && quoteText) {
            ctx.font = `italic 400 ${15 * scale}px "Playfair Display", Georgia, serif`;
            ctx.fillStyle = '#F4EDE4';
            ctx.fillText(`“${quoteText}”`, width / 2, 160 * scale);
          }
          ctx.restore();
        }

        // Draw 4 Polaroid Cards
        layoutBoxes.forEach((box) => {
          const slotImg = getImageForSlot(box.slot);
          const cx = box.x + box.w / 2;
          const cy = box.y + box.h / 2;
          const rot = box.rotation || 0;

          ctx.save();
          ctx.filter = 'none';
          ctx.translate(cx, cy);
          ctx.rotate((rot * Math.PI) / 180);

          // Card Shadow + White Paper Body
          ctx.save();
          ctx.filter = 'none';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
          ctx.shadowBlur = 24 * scale;
          ctx.shadowOffsetY = 12 * scale;
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(-box.w / 2, -box.h / 2, box.w, box.h);
          ctx.restore();

          // Inner photo area
          const innerPad = 18 * scale * currentParams.insetScale;
          const bottomSpace = 65 * scale * currentParams.insetScale;
          const photoW = box.w - innerPad * 2;
          const photoH = box.h - innerPad * 2 - bottomSpace;
          const photoX = -box.w / 2 + innerPad;
          const photoY = -box.h / 2 + innerPad;

          drawFittedImage(ctx, slotImg, photoX, photoY, photoW, photoH, transforms[box.slot]);

          // Bottom handwritten label on card
          ctx.save();
          ctx.filter = 'none';
          ctx.font = `italic 600 ${14 * scale}px "Dancing Script", cursive, serif`;
          ctx.fillStyle = '#6E6259';
          ctx.textAlign = 'center';
          ctx.fillText(`Moment #${box.slot + 1} • Forever`, 0, box.h / 2 - 20 * scale * currentParams.insetScale);
          ctx.restore();

          ctx.restore();
          ctx.filter = 'none';
        });

        // Bottom Signature Banner
        ctx.save();
        ctx.filter = 'none';
        const bannerY = height - 28 * scale;
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 8 * scale;
        ctx.font = `600 ${11 * scale}px "Montserrat", sans-serif`;
        ctx.letterSpacing = `${3 * scale}px`;
        ctx.fillText(coupleCaption, width / 2, bannerY);
        ctx.restore();
      }

      // ========================================================================
      // AUTO BRAND WATERMARK ("plusmoments.vn" ON ALL TEMPLATES)
      // ========================================================================
      if (autoBrandWatermark) {
        drawBrandWatermark(ctx, width, height, scale, watermarkPosition, watermarkText, theme);
      }
    },
    [
      layout,
      theme,
      borderWidth,
      showTitle,
      titleText,
      showSubtitle,
      subtitleText,
      showQuote,
      quoteText,
      coupleCaption,
      selectedUrls,
      autoBrandWatermark,
      watermarkPosition,
      watermarkText,
      drawFittedImage,
      drawBrandWatermark,
      getBlurredBgCanvas,
    ]
  );

  // High-level render function that ensures all images are preloaded before drawing
  const renderCollage = useCallback(
    async (targetCanvas: HTMLCanvasElement, exportResolution: CollageResolution = resolution) => {
      const effectiveUrls =
        selectedUrls.length > 0
          ? selectedUrls
          : ['/images/placeholder-wedding.jpg'];

      // Preload images into cache
      await Promise.all(
        effectiveUrls.map(async (u) => {
          try {
            await loadImage(u);
          } catch {}
        })
      );

      renderCollageCore(
        targetCanvas,
        exportResolution,
        slotTransformsRef.current,
        customParamsRef.current
      );
    },
    [selectedUrls, resolution, loadImage, renderCollageCore]
  );

  // Fast synchronous 60FPS render loop during user dragging/zooming
  const scheduleFastRender = useCallback(() => {
    if (rafIdRef.current !== null) return;
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      if (canvasRef.current) {
        renderCollageCore(
          canvasRef.current,
          '1080p',
          slotTransformsRef.current,
          customParamsRef.current
        );
      }
    });
  }, [renderCollageCore]);

  // Redraw canvas whenever settings change
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    setIsRendering(true);
    const timer = setTimeout(() => {
      if (canvasRef.current) {
        renderCollage(canvasRef.current, '1080p').finally(() => setIsRendering(false));
      }
    }, 40);
    return () => clearTimeout(timer);
  }, [isOpen, renderCollage]);

  // ========================================================================
  // INTERACTIVE CANVAS POINTER EVENTS: 60FPS DRAG-TO-PAN, WHEEL ZOOM & RESIZE
  // ========================================================================
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!previewContainerRef.current) return;
    const rect = previewContainerRef.current.getBoundingClientRect();
    const normX = (e.clientX - rect.left) / rect.width;
    const normY = (e.clientY - rect.top) / rect.height;
    const baseX = normX * 1920;
    const baseY = normY * 1080;

    const currentP = customParamsRef.current[layout] || DEFAULT_LAYOUT_PARAMS[layout];

    // Check if clicking near vertical split line (for split layouts)
    if (
      layout === 'editorial-spread' ||
      layout === 'cinematic-trio' ||
      layout === 'asymmetric-lookbook-4' ||
      layout === 'romantic-duo-2'
    ) {
      const splitX = 1920 * currentP.splitRatio;
      if (Math.abs(baseX - splitX) < 22) {
        setDragMode('resize-split');
        dragStartRef.current = {
          startX: e.clientX,
          startY: e.clientY,
          initOffsetX: 0,
          initOffsetY: 0,
          initSplitRatio: currentP.splitRatio,
          slotIndex: activeSlotIndex,
        };
        (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
        return;
      }
    }

    // Check if clicking near horizontal split line (for hero-filmstrip-5)
    if (layout === 'hero-filmstrip-5') {
      const splitY = 1080 * currentP.splitRatio;
      if (Math.abs(baseY - splitY) < 22) {
        setDragMode('resize-split');
        dragStartRef.current = {
          startX: e.clientX,
          startY: e.clientY,
          initOffsetX: 0,
          initOffsetY: 0,
          initSplitRatio: currentP.splitRatio,
          slotIndex: activeSlotIndex,
        };
        (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
        return;
      }
    }

    // Find slot at click position
    const clickedSlot = findSlotAt(baseX, baseY, layout, currentP, borderWidth);
    if (clickedSlot >= 0) {
      setActiveSlotIndex(clickedSlot);
      setDragMode('pan');
      const curTrans = slotTransformsRef.current[clickedSlot] || { zoom: 1.0, offsetX: 0, offsetY: 0, flipX: false };
      dragStartRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        initOffsetX: curTrans.offsetX,
        initOffsetY: curTrans.offsetY,
        initSplitRatio: currentP.splitRatio,
        slotIndex: clickedSlot,
      };
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragMode || !previewContainerRef.current) return;
    const rect = previewContainerRef.current.getBoundingClientRect();

    if (dragMode === 'pan') {
      const deltaX = e.clientX - dragStartRef.current.startX;
      const deltaY = e.clientY - dragStartRef.current.startY;

      // Sensitivity: ~150px mouse move equals ~50% offset change
      const deltaPercentX = (deltaX / (rect.width * 0.25)) * 50;
      const deltaPercentY = (deltaY / (rect.height * 0.25)) * 50;

      const newOffsetX = Math.max(
        -50,
        Math.min(50, Math.round(dragStartRef.current.initOffsetX + deltaPercentX))
      );
      const newOffsetY = Math.max(
        -50,
        Math.min(50, Math.round(dragStartRef.current.initOffsetY + deltaPercentY))
      );

      const targetSlot = dragStartRef.current.slotIndex;
      // Update ref directly for 0ms React re-render overhead
      slotTransformsRef.current[targetSlot] = {
        ...slotTransformsRef.current[targetSlot],
        offsetX: newOffsetX,
        offsetY: newOffsetY,
      };

      scheduleFastRender();
    } else if (dragMode === 'resize-split') {
      if (layout === 'hero-filmstrip-5') {
        const deltaY = e.clientY - dragStartRef.current.startY;
        const deltaRatio = deltaY / rect.height;
        const newRatio = Math.max(
          0.38,
          Math.min(0.72, Number((dragStartRef.current.initSplitRatio + deltaRatio).toFixed(2)))
        );
        customParamsRef.current[layout] = {
          ...customParamsRef.current[layout],
          splitRatio: newRatio,
        };
      } else {
        const deltaX = e.clientX - dragStartRef.current.startX;
        const deltaRatio = deltaX / rect.width;
        const newRatio = Math.max(
          0.28,
          Math.min(0.70, Number((dragStartRef.current.initSplitRatio + deltaRatio).toFixed(2)))
        );
        customParamsRef.current[layout] = {
          ...customParamsRef.current[layout],
          splitRatio: newRatio,
        };
      }
      scheduleFastRender();
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragMode) {
      setDragMode(null);
      (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);

      // Sync back to React state ONCE when dragging finishes to update sliders
      setSlotTransforms({ ...slotTransformsRef.current });
      setCustomParams({ ...customParamsRef.current });
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!previewContainerRef.current) return;
    const rect = previewContainerRef.current.getBoundingClientRect();
    const normX = (e.clientX - rect.left) / rect.width;
    const normY = (e.clientY - rect.top) / rect.height;
    const baseX = normX * 1920;
    const baseY = normY * 1080;

    const currentP = customParamsRef.current[layout] || DEFAULT_LAYOUT_PARAMS[layout];
    let targetSlot = findSlotAt(baseX, baseY, layout, currentP, borderWidth);
    if (targetSlot < 0) targetSlot = activeSlotIndex;

    const curZoom = slotTransformsRef.current[targetSlot]?.zoom || 1.0;
    const deltaZoom = -e.deltaY * 0.0015;
    const newZoom = Math.max(1.0, Math.min(3.0, Number((curZoom + deltaZoom).toFixed(2))));

    // Update ref directly
    slotTransformsRef.current[targetSlot] = {
      ...slotTransformsRef.current[targetSlot],
      zoom: newZoom,
    };

    scheduleFastRender();

    // Debounce syncing back to React state to update the slider smoothly
    if (wheelDebounceRef.current) clearTimeout(wheelDebounceRef.current);
    wheelDebounceRef.current = setTimeout(() => {
      setSlotTransforms({ ...slotTransformsRef.current });
    }, 150);
  };

  // Download High-Res File
  const handleDownload = async () => {
    try {
      setIsRendering(true);
      const exportCanvas = document.createElement('canvas');
      await renderCollage(exportCanvas, resolution);

      exportCanvas.toBlob(
        (blob) => {
          if (!blob) {
            showToast('Không thể tạo file ảnh tải xuống');
            setIsRendering(false);
            return;
          }
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          const cleanName = (currentAlbum?.slug || 'plusmoments')
            .replace(/[^a-zA-Z0-9_-]/g, '-')
            .toLowerCase();
          a.download = `plusmoments-collage-16x9-${layout}-${cleanName}-${resolution}.jpg`;
          a.href = url;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          showToast(`✅ Đã xuất ảnh 16:9 ${resolution.toUpperCase()} thành công!`);
          setIsRendering(false);
        },
        'image/jpeg',
        0.95
      );
    } catch (err: any) {
      showToast('Lỗi xuất ảnh: ' + err.message);
      setIsRendering(false);
    }
  };

  // Upload generated collage directly to Media Library
  const handleSaveToMedia = async () => {
    try {
      setIsSavingMedia(true);
      const exportCanvas = document.createElement('canvas');
      await renderCollage(exportCanvas, resolution);

      exportCanvas.toBlob(
        async (blob) => {
          if (!blob) {
            showToast('Lỗi chuyển đổi dữ liệu canvas');
            setIsSavingMedia(false);
            return;
          }

          const cleanSlug = (currentAlbum?.slug || 'collage-16x9')
            .replace(/[^a-zA-Z0-9_-]/g, '-')
            .toLowerCase();
          const filename = `collage-16x9-${layout}-${cleanSlug}-${Date.now()}.jpg`;
          const file = new File([blob], filename, { type: 'image/jpeg' });

          const formData = new FormData();
          formData.append('file', file);
          if (currentAlbum?.slug) {
            formData.append('folderSlug', currentAlbum.slug);
          }

          const res = await fetch('/api/admin/media/upload', {
            method: 'POST',
            body: formData,
          });

          const data = await res.json();
          if (data.success && data.media?.url) {
            showToast('🎉 Đã lưu ảnh ghép 16:9 vào Kho Media thành công!');
            if (onSavedToMedia) onSavedToMedia(data.media.url);
          } else {
            showToast(data.error || 'Lưu vào media thất bại');
          }
          setIsSavingMedia(false);
        },
        'image/jpeg',
        0.95
      );
    } catch (err: any) {
      showToast('Lỗi lưu ảnh: ' + err.message);
      setIsSavingMedia(false);
    }
  };

  // Computed boxes for preview overlay
  const previewBoxes = useMemo(() => {
    const curP = customParams[layout] || DEFAULT_LAYOUT_PARAMS[layout];
    return getLayoutSlots(1920, 1080, layout, curP, borderWidth);
  }, [layout, customParams, borderWidth]);

  const activeBox = useMemo(() => {
    return previewBoxes.find((b) => b.slot === activeSlotIndex) || null;
  }, [previewBoxes, activeSlotIndex]);

  const maxSlotsForLayout = LAYOUT_SLOT_COUNTS[layout];

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none"
    >
      <div className="w-[98vw] max-w-7xl h-[94vh] bg-[#FAF8F5] rounded-3xl border border-stone-200/80 shadow-2xl flex flex-col overflow-hidden text-stone-800">
        {/* HEADER BAR */}
        <div className="px-6 py-3.5 bg-white border-b border-stone-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#8C6D46]/10 text-[#8C6D46] flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base sm:text-lg font-medium text-stone-900 leading-tight">
                  Studio Ghép Ảnh Tạp Chí 16:9 (Editorial Collage Pro)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-100 text-amber-900 border border-amber-200">
                  16:9 STUDIO
                </span>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <Sparkles className="w-2.5 h-2.5" />
                  Kéo Ảnh & Lăn Chuột 60FPS
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-mono">
                Xuất file Full HD 1080p & 4K Ultra HD • Cô lập bộ lọc mờ & tự động gắn watermark plusmoments.vn
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveToMedia}
              disabled={isSavingMedia || isRendering}
              className="h-9 px-3.5 rounded-xl border border-[#8C6D46]/30 bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              title="Lưu ảnh 16:9 vào Kho Media của hệ thống"
            >
              {isSavingMedia ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#8C6D46]" />
              ) : (
                <Upload className="w-3.5 h-3.5 text-[#8C6D46]" />
              )}
              <span className="hidden sm:inline">Lưu Vào Kho Media</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={isRendering || isSavingMedia}
              className="h-9 px-4 rounded-xl bg-[#8C6D46] hover:bg-[#725735] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              title="Tải ảnh 16:9 chất lượng cao về máy tính"
            >
              {isRendering ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>Tải Ảnh 16:9 ({resolution.toUpperCase()})</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TOAST ALERT */}
        {toastMessage && (
          <div className="px-6 py-2 bg-[#8C6D46] text-white text-xs font-medium flex items-center justify-between animate-fade-in shrink-0">
            <span>{toastMessage}</span>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-white/80 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* MAIN BODY: 2 COLUMNS (CANVAS PREVIEW LEFT, CONTROLS RIGHT) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_440px] min-h-0 overflow-hidden">
          {/* ============================================================= */}
          {/* LEFT: INTERACTIVE 16:9 CANVAS VIEWPORT                        */}
          {/* ============================================================= */}
          <div className="p-4 sm:p-6 bg-[#181615] flex flex-col items-center justify-center overflow-y-auto relative no-scrollbar">
            {/* Top Toolbar Above Canvas */}
            <div className="w-full max-w-4xl flex items-center justify-between text-xs text-stone-300 mb-2 font-mono px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] text-[#E5C585] tracking-wider uppercase font-semibold">
                  {layout === 'editorial-spread' && 'Tạp Chí Spread (6 Ảnh)'}
                  {layout === 'cinematic-trio' && 'Điện Ảnh Trio (3 Ảnh)'}
                  {layout === 'gallery-grid-6' && 'Lưới 6 Cân Đối (3x2)'}
                  {layout === 'hero-filmstrip-5' && 'Hero + Dải Phim (5 Ảnh)'}
                  {layout === 'asymmetric-lookbook-4' && 'Lookbook Bất Đối Xứng (4 Ảnh)'}
                  {layout === 'romantic-duo-2' && 'Song Hành Lãng Mạn (2 Ảnh)'}
                  {layout === 'mosaic-story-8' && 'Phóng Sự Đa Khung (8 Ảnh)'}
                  {layout === 'polaroid-memories-4' && 'Kỷ Niệm Polaroid (4 Ảnh)'}
                </span>
                <span className="text-stone-500 text-[10px]">
                  • {selectedUrls.length} ảnh đã chọn
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleResetFrameLayout}
                  className="px-2 py-0.5 rounded text-[10px] text-stone-300 hover:text-amber-300 bg-stone-800/80 border border-stone-700 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Đặt lại kích thước và tỷ lệ khung chuẩn"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>↺ Đặt lại khung chuẩn</span>
                </button>

                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-stone-400">Độ phân giải:</span>
                  <div className="flex items-center bg-[#282421] p-0.5 rounded-lg border border-stone-700 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setResolution('1080p')}
                      className={`px-2 py-0.5 rounded font-semibold transition-colors ${
                        resolution === '1080p'
                          ? 'bg-[#8C6D46] text-white'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      1080p
                    </button>
                    <button
                      type="button"
                      onClick={() => setResolution('4k')}
                      className={`px-2 py-0.5 rounded font-semibold transition-colors ${
                        resolution === '4k'
                          ? 'bg-[#8C6D46] text-white'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      4K UHD
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 16:9 Frame Container with 60FPS Drag & Wheel Zoom */}
            <div
              ref={previewContainerRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onWheel={handleWheel}
              className={`w-full max-w-4xl aspect-[16/9] bg-stone-900 rounded-2xl overflow-hidden shadow-2xl border-4 border-[#282421] relative flex items-center justify-center touch-none select-none ${
                dragMode === 'pan'
                  ? 'cursor-grabbing'
                  : dragMode === 'resize-split'
                  ? 'cursor-col-resize'
                  : 'cursor-grab active:cursor-grabbing'
              }`}
            >
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain pointer-events-none"
              />

              {/* OVERLAY: ACTIVE SLOT HIGHLIGHT BORDER & TOOLTIP */}
              {activeBox && (
                <div
                  style={{
                    left: `${(activeBox.x / 1920) * 100}%`,
                    top: `${(activeBox.y / 1080) * 100}%`,
                    width: `${(activeBox.w / 1920) * 100}%`,
                    height: `${(activeBox.h / 1080) * 100}%`,
                    transform: activeBox.rotation ? `rotate(${activeBox.rotation}deg)` : undefined,
                  }}
                  className="absolute pointer-events-none border-2 border-dashed border-[#E5C585] shadow-[0_0_16px_rgba(229,197,133,0.45)] rounded-md transition-all z-10 flex flex-col justify-between p-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-1.5 py-0.5 bg-black/80 text-[#E5C585] text-[9px] font-mono font-bold rounded shadow-xs">
                      Ô #{activeSlotIndex + 1} • {activeBox.label}
                    </span>
                    <span className="px-1 py-0.5 bg-black/70 text-white text-[8px] font-mono rounded">
                      {(slotTransforms[activeSlotIndex]?.zoom || 1.0).toFixed(1)}x
                    </span>
                  </div>

                  <div className="self-center px-2 py-0.5 bg-black/75 text-[#F8F6F0] text-[9px] font-sans rounded-full backdrop-blur-xs flex items-center gap-1 opacity-90 shadow-xs">
                    <Move className="w-2.5 h-2.5 text-[#E5C585]" />
                    <span>Kéo để di chuyển • Lăn chuột để zoom</span>
                  </div>
                </div>
              )}

              {/* OVERLAY: INTERACTIVE SPLIT RESIZE HANDLE */}
              {(layout === 'editorial-spread' ||
                layout === 'cinematic-trio' ||
                layout === 'asymmetric-lookbook-4' ||
                layout === 'romantic-duo-2') && (
                <div
                  style={{
                    left: `${(customParams[layout]?.splitRatio || 0.5) * 100}%`,
                  }}
                  className="absolute top-0 bottom-0 w-1 bg-amber-400/40 hover:bg-amber-400 transition-colors z-20 flex items-center justify-center pointer-events-auto cursor-col-resize group"
                  title="Kéo sang trái / phải để điều chỉnh tỷ lệ chia khung"
                >
                  <div className="w-5 h-9 rounded-full bg-black/80 group-hover:bg-[#8C6D46] border border-amber-300 text-amber-200 flex items-center justify-center text-[10px] shadow-lg transition-transform group-hover:scale-110">
                    ↔
                  </div>
                </div>
              )}

              {/* OVERLAY: HORIZONTAL SPLIT HANDLE FOR HERO-FILMSTRIP-5 */}
              {layout === 'hero-filmstrip-5' && (
                <div
                  style={{
                    top: `${(customParams[layout]?.splitRatio || 0.62) * 100}%`,
                  }}
                  className="absolute left-0 right-0 h-1 bg-amber-400/40 hover:bg-amber-400 transition-colors z-20 flex items-center justify-center pointer-events-auto cursor-row-resize group"
                  title="Kéo lên / xuống để điều chỉnh chiều cao của Hero Panorama"
                >
                  <div className="h-5 w-9 rounded-full bg-black/80 group-hover:bg-[#8C6D46] border border-amber-300 text-amber-200 flex items-center justify-center text-[10px] shadow-lg transition-transform group-hover:scale-110">
                    ↕
                  </div>
                </div>
              )}

              {isRendering && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center text-white gap-2 font-mono text-xs z-30">
                  <Loader2 className="w-4 h-4 animate-spin text-[#E5C585]" />
                  <span>Đang render bản mẫu 16:9...</span>
                </div>
              )}
            </div>

            {/* Quick Slot Selector Strip Below Canvas */}
            <div className="w-full max-w-4xl mt-3 flex items-center justify-between text-xs font-mono text-stone-400 px-1">
              <span className="text-[11px] text-stone-300">Chọn ô ảnh cần căn chỉnh:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {Array.from({ length: maxSlotsForLayout }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveSlotIndex(i)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeSlotIndex === i
                        ? 'bg-[#8C6D46] text-white ring-2 ring-[#E5C585]'
                        : 'bg-[#282421] text-stone-300 hover:bg-[#342F2B] border border-stone-700'
                    }`}
                  >
                    Ô #{i + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ============================================================= */}
          {/* RIGHT: CONTROLS & PHOTO PICKER DRAWER                         */}
          {/* ============================================================= */}
          <div className="bg-white border-t lg:border-t-0 lg:border-l border-stone-200 flex flex-col min-h-0 overflow-y-auto text-xs">
            {/* TABS: SOURCE SELECTION */}
            <div className="p-4 border-b border-stone-200 bg-stone-50/70 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-900 uppercase tracking-wider text-[11px]">
                  1. Nguồn Ảnh Cho Bố Cục
                </span>
                <div className="flex items-center bg-stone-200/80 p-0.5 rounded-lg text-[11px]">
                  <button
                    type="button"
                    onClick={() => setSourceTab('album')}
                    className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                      sourceTab === 'album'
                        ? 'bg-white text-stone-900 shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Bộ Sưu Tập (Album)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSourceTab('media')}
                    className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                      sourceTab === 'media'
                        ? 'bg-white text-stone-900 shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Kho Media
                  </button>
                </div>
              </div>

              {/* Album Dropdown Selector */}
              {sourceTab === 'album' && (
                <div className="space-y-1.5">
                  <label className="block text-[11px] text-stone-600 font-medium">
                    Chọn Bộ Sưu Tập Cần Ghép Ảnh:
                  </label>
                  <select
                    value={selectedAlbumId}
                    onChange={(e) => handleSelectAlbum(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-stone-300 bg-white text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                  >
                    {albums.map((alb) => (
                      <option key={alb.id} value={alb.id}>
                        {alb.title} {alb.coupleNames ? `— (${alb.coupleNames})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Media Search Input */}
              {sourceTab === 'media' && (
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Tìm ảnh trong kho media..."
                    value={mediaSearch}
                    onChange={(e) => setMediaSearch(e.target.value)}
                    className="w-full h-8 pl-8 pr-3 rounded-lg border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                  />
                </div>
              )}

              {/* Selected Images Tray / Reel */}
              <div className="pt-2 border-t border-stone-200/80">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="text-[11px] font-semibold text-stone-700 flex items-center gap-1.5">
                    <span>Thứ Tự Khung Ảnh ({selectedUrls.length} ảnh):</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleShuffleImages}
                      className="p-1 text-stone-500 hover:text-stone-800 rounded hover:bg-stone-200 transition-colors cursor-pointer"
                      title="Xáo trộn ngẫu nhiên vị trí các ảnh"
                    >
                      <Shuffle className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleSelectEnoughImages}
                      className="text-[10px] text-[#8C6D46] hover:underline px-1 cursor-pointer font-medium"
                      title={`Lấy đủ ${maxSlotsForLayout} ảnh cho mẫu này`}
                    >
                      Lấy {maxSlotsForLayout} ảnh cho mẫu
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedUrls([])}
                      className="text-[10px] text-red-600 hover:underline px-1 cursor-pointer"
                    >
                      Xóa hết
                    </button>
                  </div>
                </div>

                {/* Horizontal Strip of Selected Images */}
                <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
                  {selectedUrls.map((url, idx) => (
                    <div
                      key={idx}
                      className={`relative shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                        activeSlotIndex === idx
                          ? 'border-[#8C6D46] ring-2 ring-[#E5C585] shadow-sm'
                          : 'border-stone-200 bg-stone-100'
                      }`}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <span className="absolute top-0.5 left-0.5 px-1 py-0.2 rounded bg-black/75 text-white text-[9px] font-mono font-bold">
                        #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSelectedImage(idx)}
                        className="absolute top-0.5 right-0.5 p-0.5 bg-red-600 text-white rounded-full opacity-80 hover:opacity-100 cursor-pointer"
                        title="Bỏ ảnh này"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                      <div className="absolute bottom-0 inset-x-0 flex items-center justify-between bg-black/60 px-0.5 py-0.5">
                        <button
                          type="button"
                          onClick={() => handleMoveImage(idx, 'left')}
                          disabled={idx === 0}
                          className="text-white hover:text-amber-300 disabled:opacity-20 cursor-pointer"
                          title="Dời sang trái"
                        >
                          <ChevronLeft className="w-2.5 h-2.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveImage(idx, 'right')}
                          disabled={idx === selectedUrls.length - 1}
                          className="text-white hover:text-amber-300 disabled:opacity-20 cursor-pointer"
                          title="Dời sang phải"
                        >
                          <ChevronRight className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {selectedUrls.length === 0 && (
                    <div className="w-full py-3 text-center text-stone-400 text-[11px] font-mono">
                      Chưa chọn ảnh nào. Bấm vào ảnh bên dưới để thêm vào khung 16:9.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* THUMBNAIL SELECTOR GRID */}
            <div className="p-4 border-b border-stone-200 max-h-44 overflow-y-auto no-scrollbar">
              <div className="text-[11px] font-medium text-stone-500 mb-2">
                Bấm vào ảnh để bật/tắt chọn:
              </div>

              {sourceTab === 'album' && (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {currentAlbumImages.map((url, i) => {
                    const isSelected = selectedUrls.includes(url);
                    const selectedIndex = selectedUrls.indexOf(url);
                    return (
                      <div
                        key={i}
                        onClick={() => handleToggleImage(url)}
                        className={`group relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#8C6D46] ring-2 ring-[#E5C585] shadow-xs'
                            : 'border-stone-200 hover:border-stone-400 bg-stone-100 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#8C6D46] text-white flex items-center justify-center font-bold text-[10px] shadow-sm font-mono">
                            {selectedIndex + 1}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {sourceTab === 'media' && (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {filteredMedia.slice(0, 40).map((item, i) => {
                    const itemUrl = item.originalUrl || item.url;
                    const isSelected = selectedUrls.includes(itemUrl);
                    const selectedIndex = selectedUrls.indexOf(itemUrl);
                    return (
                      <div
                        key={i}
                        onClick={() => handleToggleImage(itemUrl)}
                        className={`group relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#8C6D46] ring-2 ring-[#E5C585] shadow-xs'
                            : 'border-stone-200 hover:border-stone-400 bg-stone-100 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <img src={itemUrl} alt="" className="w-full h-full object-cover" />
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#8C6D46] text-white flex items-center justify-center font-bold text-[10px] shadow-sm font-mono">
                            {selectedIndex + 1}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SETTINGS: 8 LAYOUT TEMPLATES & THEME */}
            <div className="p-4 border-b border-stone-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-900 uppercase tracking-wider text-[11px]">
                  2. Mẫu Bố Cục Tạp Chí (8 Mẫu 16:9)
                </span>
                <span className="text-[10px] text-stone-500 font-mono">
                  {maxSlotsForLayout} ảnh
                </span>
              </div>

              {/* 8 Layout Templates Grid */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    id: 'editorial-spread',
                    title: 'Tạp Chí Spread',
                    desc: 'Nửa mờ + 2 khung nổi + 4 lưới',
                    count: 6,
                  },
                  {
                    id: 'cinematic-trio',
                    title: 'Điện Ảnh Trio',
                    desc: '1 hero dọc + 2 ngang xếp tầng',
                    count: 3,
                  },
                  {
                    id: 'gallery-grid-6',
                    title: 'Lưới 6 Cân Đối',
                    desc: '3 cột x 2 hàng chuẩn tạp chí',
                    count: 6,
                  },
                  {
                    id: 'hero-filmstrip-5',
                    title: 'Hero + Dải Phim',
                    desc: '1 panorama lớn + 4 ảnh phim',
                    count: 5,
                  },
                  {
                    id: 'asymmetric-lookbook-4',
                    title: 'Lookbook Nghệ Thuật',
                    desc: '4 khung tỷ lệ vàng đan xen',
                    count: 4,
                  },
                  {
                    id: 'romantic-duo-2',
                    title: 'Song Hành Lãng Mạn',
                    desc: '2 chân dung đối xứng + chữ giữa',
                    count: 2,
                  },
                  {
                    id: 'mosaic-story-8',
                    title: 'Phóng Sự Đa Khung',
                    desc: 'Lưới 8 khung tiệc cưới sôi động',
                    count: 8,
                  },
                  {
                    id: 'polaroid-memories-4',
                    title: 'Kỷ Niệm Polaroid',
                    desc: '4 ảnh Polaroid nghiêng nghệ thuật',
                    count: 4,
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setLayout(item.id as CollageLayoutType);
                      if (activeSlotIndex >= item.count) {
                        setActiveSlotIndex(0);
                      }
                    }}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer relative ${
                      layout === item.id
                        ? 'border-[#8C6D46] bg-amber-50/70 ring-2 ring-[#8C6D46]/20 shadow-2xs font-medium'
                        : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="font-semibold text-xs text-stone-900 leading-tight">
                        {item.title}
                      </div>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-stone-100 text-stone-600">
                        {item.count} ảnh
                      </span>
                    </div>
                    <div className="text-[10px] text-stone-500 line-clamp-1">{item.desc}</div>
                  </button>
                ))}
              </div>

              {/* Theme & Border */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-medium text-stone-700 mb-1">
                    Tông Màu Nền:
                  </label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as CollageTheme)}
                    className="w-full h-8 px-2.5 rounded-lg border border-stone-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#8C6D46]"
                  >
                    <option value="warm-ivory">Kem Hoàng Gia (Ivory)</option>
                    <option value="noir">Đen Điện Ảnh (Noir)</option>
                    <option value="classic-white">Trắng Tinh Khôi (White)</option>
                    <option value="editorial-rose">Hồng Cổ Điển (Rose)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-stone-700 mb-1">
                    Khung Viền Ảnh:
                  </label>
                  <select
                    value={borderWidth}
                    onChange={(e) => setBorderWidth(e.target.value as any)}
                    className="w-full h-8 px-2.5 rounded-lg border border-stone-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#8C6D46]"
                  >
                    <option value="none">Tràn viền (0px)</option>
                    <option value="thin">Viền mảnh tinh tế (8px)</option>
                    <option value="magazine">Khung tạp chí (16px)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SETTINGS: CELL FINE-TUNING & INTERACTIVE PAN/ZOOM */}
            <div className="p-4 border-b border-stone-200 space-y-3 bg-amber-50/40">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#8C6D46]" />
                  <span>3. Căn Chỉnh Ô Đang Chọn (Ô #{activeSlotIndex + 1})</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const updated = {
                        ...slotTransformsRef.current,
                        [activeSlotIndex]: {
                          ...slotTransformsRef.current[activeSlotIndex],
                          flipX: !slotTransformsRef.current[activeSlotIndex]?.flipX,
                        },
                      };
                      slotTransformsRef.current = updated;
                      setSlotTransforms(updated);
                      scheduleFastRender();
                    }}
                    className={`h-7 px-2.5 rounded-lg border text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                      slotTransforms[activeSlotIndex]?.flipX
                        ? 'bg-[#8C6D46] text-white border-[#8C6D46]'
                        : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-50'
                    }`}
                    title="Lật ảnh nằm ngang"
                  >
                    <FlipHorizontal className="w-3 h-3" />
                    <span>Lật Ngang</span>
                  </button>
                </div>
              </div>

              {/* Sliders: Pan X, Pan Y, Zoom */}
              <div className="space-y-2 pt-1">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-stone-600 mb-0.5">
                    <span>Dịch chuyển Ngang (Trái ↔ Phải):</span>
                    <span className="font-mono">{slotTransforms[activeSlotIndex]?.offsetX || 0}%</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="1"
                    value={slotTransforms[activeSlotIndex]?.offsetX || 0}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      const updated = {
                        ...slotTransformsRef.current,
                        [activeSlotIndex]: { ...slotTransformsRef.current[activeSlotIndex], offsetX: val },
                      };
                      slotTransformsRef.current = updated;
                      setSlotTransforms(updated);
                      scheduleFastRender();
                    }}
                    className="w-full accent-[#8C6D46] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] text-stone-600 mb-0.5">
                    <span>Dịch chuyển Dọc (Lên ↕ Xuống):</span>
                    <span className="font-mono">{slotTransforms[activeSlotIndex]?.offsetY || 0}%</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="1"
                    value={slotTransforms[activeSlotIndex]?.offsetY || 0}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      const updated = {
                        ...slotTransformsRef.current,
                        [activeSlotIndex]: { ...slotTransformsRef.current[activeSlotIndex], offsetY: val },
                      };
                      slotTransformsRef.current = updated;
                      setSlotTransforms(updated);
                      scheduleFastRender();
                    }}
                    className="w-full accent-[#8C6D46] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] text-stone-600 mb-0.5">
                    <span>Độ Phóng To (Zoom):</span>
                    <span className="font-mono">{(slotTransforms[activeSlotIndex]?.zoom || 1.0).toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="3.0"
                    step="0.05"
                    value={slotTransforms[activeSlotIndex]?.zoom || 1.0}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      const updated = {
                        ...slotTransformsRef.current,
                        [activeSlotIndex]: { ...slotTransformsRef.current[activeSlotIndex], zoom: val },
                      };
                      slotTransformsRef.current = updated;
                      setSlotTransforms(updated);
                      scheduleFastRender();
                    }}
                    className="w-full accent-[#8C6D46] cursor-pointer"
                  />
                </div>

                {/* Split Ratio Slider */}
                <div>
                  <div className="flex items-center justify-between text-[11px] text-stone-600 mb-0.5">
                    <span>Tỷ Lệ Chia Khung Ảnh (Split):</span>
                    <span className="font-mono">
                      {Math.round((customParams[layout]?.splitRatio || 0.5) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="28"
                    max="72"
                    step="1"
                    value={Math.round((customParams[layout]?.splitRatio || 0.5) * 100)}
                    onChange={(e) => {
                      const val = Number(e.target.value) / 100;
                      const updated = {
                        ...customParamsRef.current,
                        [layout]: { ...customParamsRef.current[layout], splitRatio: val },
                      };
                      customParamsRef.current = updated;
                      setCustomParams(updated);
                      scheduleFastRender();
                    }}
                    className="w-full accent-[#8C6D46] cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* SETTINGS: BRAND WATERMARK PLUSMOMENTS.VN */}
            <div className="p-4 border-b border-stone-200 space-y-3 bg-stone-50/50">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#8C6D46]" />
                  <span>4. Nhận Diện Thương Hiệu Watermark</span>
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoBrandWatermark}
                    onChange={(e) => setAutoBrandWatermark(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#8C6D46]"></div>
                  <span className="ml-1.5 text-[10px] font-medium text-stone-600">
                    {autoBrandWatermark ? 'Bật' : 'Tắt'}
                  </span>
                </label>
              </div>

              {autoBrandWatermark && (
                <div className="space-y-2 pt-1">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-700 mb-1">
                      Vị Trí Watermark:
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'bottom-right', label: 'Góc Phải' },
                        { id: 'bottom-center', label: 'Chân Giữa' },
                        { id: 'bottom-left', label: 'Góc Trái' },
                      ].map((pos) => (
                        <button
                          key={pos.id}
                          type="button"
                          onClick={() => setWatermarkPosition(pos.id as any)}
                          className={`py-1 px-2 rounded-lg text-[10px] font-medium border text-center transition-colors cursor-pointer ${
                            watermarkPosition === pos.id
                              ? 'bg-[#8C6D46] text-white border-[#8C6D46]'
                              : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                          }`}
                        >
                          {pos.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-700 mb-0.5">
                      Nội Dung Nhận Diện:
                    </label>
                    <input
                      type="text"
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      placeholder="plusmoments.vn"
                      className="w-full h-8 px-2.5 rounded-lg border border-stone-300 text-xs font-mono uppercase focus:outline-none focus:ring-1 focus:ring-[#8C6D46]"
                    />
                    <p className="text-[10px] text-stone-400 mt-1">
                      Tự động vẽ chữ hoa mảnh kèm đường gạch chỉ tinh tế sang trọng trên toàn bộ 8 mẫu xuất ra.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* SETTINGS: TYPOGRAPHY & QUOTE OVERLAYS */}
            <div className="p-4 space-y-3">
              <span className="font-semibold text-stone-900 uppercase tracking-wider text-[11px] block">
                5. Chữ Nghệ Thuật & Lời Trích Dẫn
              </span>

              {/* Title input */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-medium text-stone-700">Tiêu Đề Thư Pháp:</label>
                  <button
                    type="button"
                    onClick={() => setShowTitle(!showTitle)}
                    className="text-[10px] text-[#8C6D46] hover:underline cursor-pointer"
                  >
                    {showTitle ? 'Ẩn tiêu đề' : 'Hiện tiêu đề'}
                  </button>
                </div>
                {showTitle && (
                  <input
                    type="text"
                    value={titleText}
                    onChange={(e) => setTitleText(e.target.value)}
                    className="w-full h-8 px-2.5 rounded-lg border border-stone-300 text-xs font-serif focus:outline-none focus:ring-1 focus:ring-[#8C6D46]"
                  />
                )}
              </div>

              {/* Subtitle / Location */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-medium text-stone-700">Dòng Phụ Đề / Địa Điểm:</label>
                  <button
                    type="button"
                    onClick={() => setShowSubtitle(!showSubtitle)}
                    className="text-[10px] text-[#8C6D46] hover:underline cursor-pointer"
                  >
                    {showSubtitle ? 'Ẩn phụ đề' : 'Hiện phụ đề'}
                  </button>
                </div>
                {showSubtitle && (
                  <input
                    type="text"
                    value={subtitleText}
                    onChange={(e) => setSubtitleText(e.target.value)}
                    className="w-full h-8 px-2.5 rounded-lg border border-stone-300 text-xs font-mono uppercase focus:outline-none focus:ring-1 focus:ring-[#8C6D46]"
                  />
                )}
              </div>

              {/* Quote dropdown and text */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-medium text-stone-700">Lời Quote Ý Nghĩa:</label>
                  <button
                    type="button"
                    onClick={() => setShowQuote(!showQuote)}
                    className="text-[10px] text-[#8C6D46] hover:underline cursor-pointer"
                  >
                    {showQuote ? 'Ẩn quote' : 'Hiện quote'}
                  </button>
                </div>
                {showQuote && (
                  <>
                    <select
                      onChange={(e) => {
                        if (e.target.value) setQuoteText(e.target.value);
                      }}
                      className="w-full h-8 px-2 rounded-lg border border-stone-300 text-[11px] bg-stone-50 mb-1"
                    >
                      <option value="">-- Chọn câu quote mẫu có sẵn --</option>
                      {PRESET_QUOTES.map((q, idx) => (
                        <option key={idx} value={q}>
                          {q}
                        </option>
                      ))}
                    </select>
                    <textarea
                      rows={2}
                      value={quoteText}
                      onChange={(e) => setQuoteText(e.target.value)}
                      className="w-full p-2 rounded-lg border border-stone-300 text-xs italic font-serif focus:outline-none focus:ring-1 focus:ring-[#8C6D46]"
                    />
                  </>
                )}
              </div>

              {/* Couple Caption */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-stone-700 block">
                  Tên Cặp Đôi & Dấu Ấn Studio:
                </label>
                <input
                  type="text"
                  value={coupleCaption}
                  onChange={(e) => setCoupleCaption(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-lg border border-stone-300 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#8C6D46]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
