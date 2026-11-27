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
  Folder,
  Search,
  CheckCircle2,
  Maximize2,
  Trash2,
  Shuffle,
  AlertCircle,
  Loader2,
  Type,
  Move,
  ZoomIn,
} from 'lucide-react';

export type CollageLayoutType = 'editorial-spread' | 'cinematic-trio' | 'gallery-grid-6';
export type CollageResolution = '1080p' | '4k';
export type CollageTheme = 'warm-ivory' | 'noir' | 'classic-white' | 'editorial-rose';

export interface SlotTransform {
  zoom: number;       // 1.0 to 2.5
  offsetX: number;    // -50% to +50%
  offsetY: number;    // -50% to +50%
  flipX: boolean;     // horizontal flip
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
  media?: Array<{ id: string; url: string }>;
}

interface MediaFileOption {
  id: string;
  url: string;
  filename: string;
  name?: string;
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

  // Selected Images for collage (ordered list)
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);

  // Studio Settings
  const [layout, setLayout] = useState<CollageLayoutType>('editorial-spread');
  const [resolution, setResolution] = useState<CollageResolution>('1080p');
  const [theme, setTheme] = useState<CollageTheme>('warm-ivory');
  const [borderWidth, setBorderWidth] = useState<'none' | 'thin' | 'magazine'>('magazine');

  // Typography Settings
  const [showTitle, setShowTitle] = useState(true);
  const [titleText, setTitleText] = useState('The beginning of Everything');
  const [showSubtitle, setShowSubtitle] = useState(true);
  const [subtitleText, setSubtitleText] = useState('AN EVERLASTING STORY • CHAPTER ONE');
  const [showQuote, setShowQuote] = useState(true);
  const [quoteText, setQuoteText] = useState(PRESET_QUOTES[0]);
  const [coupleCaption, setCoupleCaption] = useState('MINH TRUNG & THANH THAO — 2026');

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

  // Export & Action state
  const [isRendering, setIsRendering] = useState(false);
  const [isSavingMedia, setIsSavingMedia] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
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
          // If initialAlbumId passed, select it, else pick the first album
          if (initialAlbumId) {
            setSelectedAlbumId(initialAlbumId);
            const found = data.albums.find((a: AlbumOption) => a.id === initialAlbumId);
            if (found) {
              const albumImages: string[] = [];
              if (found.coverImage) albumImages.push(found.coverImage);
              if (Array.isArray(found.media)) {
                found.media.forEach((m: any) => {
                  if (m?.url && !albumImages.includes(m.url)) albumImages.push(m.url);
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
                if (m?.url && !albumImages.includes(m.url)) albumImages.push(m.url);
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

    // If initialImages explicitly passed, use them
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
        if (m?.url && !list.includes(m.url)) list.push(m.url);
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

  // Handler when selecting an album from dropdown
  const handleSelectAlbum = (albumId: string) => {
    setSelectedAlbumId(albumId);
    const found = albums.find((a) => a.id === albumId);
    if (!found) return;

    const albumImages: string[] = [];
    if (found.coverImage) albumImages.push(found.coverImage);
    if (Array.isArray(found.media)) {
      found.media.forEach((m) => {
        if (m?.url && !albumImages.includes(m.url)) albumImages.push(m.url);
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

  // Select first 6 images of current album
  const handleSelectFirst6 = () => {
    if (currentAlbumImages.length === 0) return;
    setSelectedUrls(currentAlbumImages.slice(0, 6));
  };

  // Helper to load image as HTMLImageElement with CORS
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
      img.onload = () => {
        imageCacheRef.current.set(url, img);
        resolve(img);
      };
      img.onerror = () => {
        // Retry once without crossOrigin if local/relative
        const retryImg = new Image();
        retryImg.onload = () => {
          imageCacheRef.current.set(url, retryImg);
          resolve(retryImg);
        };
        retryImg.onerror = (e) => reject(e);
        retryImg.src = url;
      };
      img.src = url;
    });
  }, []);

  // Helper to draw an image inside a box with zoom, pan offset, and flip
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
      if (!imgW || !imgH) return;

      const imgAspect = imgW / imgH;
      const boxAspect = dw / dh;

      let baseW = imgW;
      let baseH = imgH;

      if (imgAspect > boxAspect) {
        // Image is wider than box
        baseW = imgH * boxAspect;
      } else {
        // Image is taller than box
        baseH = imgW / boxAspect;
      }

      // Apply zoom
      const cropW = baseW / zoom;
      const cropH = baseH / zoom;

      // Calculate center pan
      const centerX = imgW / 2;
      const centerY = imgH / 2;
      const maxPanX = Math.max(0, (imgW - cropW) / 2);
      const maxPanY = Math.max(0, (imgH - cropH) / 2);

      let cropX = centerX - cropW / 2 + (offsetX / 50) * maxPanX;
      let cropY = centerY - cropH / 2 + (offsetY / 50) * maxPanY;

      // Clamp bounds
      cropX = Math.max(0, Math.min(imgW - cropW, cropX));
      cropY = Math.max(0, Math.min(imgH - cropH, cropY));

      ctx.save();
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
    },
    []
  );

  // Core 16:9 Canvas Rendering Function
  const renderCollage = useCallback(
    async (targetCanvas: HTMLCanvasElement, exportResolution: CollageResolution = resolution) => {
      const ctx = targetCanvas.getContext('2d');
      if (!ctx) return;

      // Determine dimensions: 1080p = 1920x1080, 4K = 3840x2160
      const width = exportResolution === '4k' ? 3840 : 1920;
      const height = exportResolution === '4k' ? 2160 : 1080;
      const scale = exportResolution === '4k' ? 2 : 1;

      targetCanvas.width = width;
      targetCanvas.height = height;

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

      // Make sure we have at least 1 image to draw
      const effectiveUrls =
        selectedUrls.length > 0
          ? selectedUrls
          : ['/images/placeholder-wedding.jpg'];

      // Preload all needed images
      const loadedImages: (HTMLImageElement | null)[] = await Promise.all(
        effectiveUrls.map(async (u) => {
          try {
            return await loadImage(u);
          } catch {
            return null;
          }
        })
      );

      const validImages = loadedImages.filter(Boolean) as HTMLImageElement[];
      if (validImages.length === 0) {
        ctx.fillStyle = '#666';
        ctx.font = `${24 * scale}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('Chưa có ảnh nào được tải. Vui lòng chọn ảnh từ Bộ Sưu Tập hoặc Media.', width / 2, height / 2);
        return;
      }

      // Helper to safely get an image by slot index (with wrapping fallback)
      const getImageForSlot = (slotIdx: number): HTMLImageElement => {
        return validImages[slotIdx % validImages.length];
      };

      // ------------------------------------------------------------------------
      // LAYOUT 1: EDITORIAL SPREAD (Magazine Editorial - Reference Style)
      // ------------------------------------------------------------------------
      if (layout === 'editorial-spread') {
        const halfW = width / 2; // 960px or 1920px

        // --- LEFT HALF: BLURRED COVER BACKGROUND + 2 INSET STAGGERED PHOTOS ---
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, halfW, height);
        ctx.clip();

        // 1. Blurred Background (Image #0)
        const bgImg = getImageForSlot(0);
        ctx.save();
        ctx.filter = `blur(${18 * scale}px)`;
        // Draw slightly oversized to prevent transparent edges
        const bleed = 40 * scale;
        ctx.drawImage(bgImg, -bleed, -bleed, halfW + bleed * 2, height + bleed * 2);
        ctx.filter = 'none';

        // Dark / Tint overlay on top of blur
        ctx.fillStyle = theme === 'noir' ? 'rgba(0, 0, 0, 0.45)' : 'rgba(0, 0, 0, 0.22)';
        ctx.fillRect(0, 0, halfW, height);
        ctx.restore();

        // 2. Inset Photo A (Slot #1) - Lower Left
        const insetAW = 400 * scale;
        const insetAH = 580 * scale;
        const insetAX = 60 * scale;
        const insetAY = 380 * scale;
        const frameA = 8 * scale;

        // Shadow for Inset A
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
        ctx.shadowBlur = 30 * scale;
        ctx.shadowOffsetY = 15 * scale;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(insetAX - frameA, insetAY - frameA, insetAW + frameA * 2, insetAH + frameA * 2);
        ctx.restore();

        // Draw Inset Photo A
        const imgA = getImageForSlot(1);
        drawFittedImage(ctx, imgA, insetAX, insetAY, insetAW, insetAH, slotTransforms[1]);

        // 3. Inset Photo B (Slot #2) - Upper Right of Left Half
        const insetBW = 410 * scale;
        const insetBH = 600 * scale;
        const insetBX = 480 * scale;
        const insetBY = 130 * scale;
        const frameB = 8 * scale;

        // Shadow for Inset B
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.38)';
        ctx.shadowBlur = 35 * scale;
        ctx.shadowOffsetY = 18 * scale;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(insetBX - frameB, insetBY - frameB, insetBW + frameB * 2, insetBH + frameB * 2);
        ctx.restore();

        // Draw Inset Photo B
        const imgB = getImageForSlot(2);
        drawFittedImage(ctx, imgB, insetBX, insetBY, insetBW, insetBH, slotTransforms[2]);

        // 4. Left Half Typography Overlays
        if (showTitle && titleText) {
          ctx.save();
          ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
          ctx.shadowBlur = 12 * scale;
          ctx.fillStyle = '#FFFFFF';

          // Calligraphy Title
          ctx.font = `italic 600 ${52 * scale}px "Dancing Script", cursive, Georgia, serif`;
          ctx.textAlign = 'left';
          ctx.fillText(titleText, 60 * scale, 120 * scale);

          // Subtitle
          if (showSubtitle && subtitleText) {
            ctx.font = `600 ${11 * scale}px "Montserrat", sans-serif`;
            ctx.letterSpacing = `${3 * scale}px`;
            ctx.fillStyle = '#E5C585';
            ctx.fillText(subtitleText.toUpperCase(), 62 * scale, 160 * scale);
          }
          ctx.restore();
        }

        // Quote at bottom of left half
        if (showQuote && quoteText) {
          ctx.save();
          ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
          ctx.shadowBlur = 10 * scale;
          ctx.fillStyle = '#F8F6F0';
          ctx.font = `italic 400 ${16 * scale}px "Playfair Display", Georgia, serif`;
          ctx.textAlign = 'left';
          ctx.fillText(`“${quoteText}”`, 60 * scale, height - 50 * scale);
          ctx.restore();
        }

        ctx.restore(); // end left half clipping

        // --- RIGHT HALF: 2x2 BALANCED EDITORIAL GRID (Slots #3, #4, #5, #6) ---
        ctx.save();
        const padX = 40 * scale;
        const padTop = 40 * scale;
        const gap = 16 * scale;
        const bannerH = 70 * scale; // Bottom reserved space for couple caption

        const rightAreaW = halfW - padX * 2;
        const rightAreaH = height - padTop - padX - bannerH;

        const cellW = (rightAreaW - gap) / 2;
        const cellH = (rightAreaH - gap) / 2;

        const gridPositions = [
          { x: halfW + padX, y: padTop, slot: 3 },
          { x: halfW + padX + cellW + gap, y: padTop, slot: 4 },
          { x: halfW + padX, y: padTop + cellH + gap, slot: 5 },
          { x: halfW + padX + cellW + gap, y: padTop + cellH + gap, slot: 6 },
        ];

        gridPositions.forEach((pos) => {
          const slotImg = getImageForSlot(pos.slot);

          // Subtle shadow / frame
          if (borderPx > 0) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(pos.x - borderPx, pos.y - borderPx, cellW + borderPx * 2, cellH + borderPx * 2);
          }

          drawFittedImage(ctx, slotImg, pos.x, pos.y, cellW, cellH, slotTransforms[pos.slot]);
        });

        // Bottom Typography Banner on Right Half
        ctx.save();
        const bannerCenterY = height - bannerH / 2;
        ctx.textAlign = 'center';

        // Elegant decorative line divider
        ctx.strokeStyle = textColor.divider;
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(halfW + padX + 60 * scale, bannerCenterY - 14 * scale);
        ctx.lineTo(width - padX - 60 * scale, bannerCenterY - 14 * scale);
        ctx.stroke();

        // Little diamond in center
        ctx.fillStyle = textColor.subtitle;
        ctx.beginPath();
        const diamondX = halfW + halfW / 2;
        const diamondY = bannerCenterY - 14 * scale;
        const dSize = 4 * scale;
        ctx.moveTo(diamondX, diamondY - dSize);
        ctx.lineTo(diamondX + dSize, diamondY);
        ctx.lineTo(diamondX, diamondY + dSize);
        ctx.lineTo(diamondX - dSize, diamondY);
        ctx.fill();

        // Couple Caption / Studio Stamp
        ctx.font = `600 ${12 * scale}px "Montserrat", sans-serif`;
        ctx.fillStyle = textColor.title;
        ctx.letterSpacing = `${3 * scale}px`;
        ctx.fillText(coupleCaption, diamondX, bannerCenterY + 12 * scale);

        ctx.restore();
        ctx.restore();
      }

      // ------------------------------------------------------------------------
      // LAYOUT 2: CINEMATIC TRIO (1 Big Hero + 2 or 3 Stacked Side Photos)
      // ------------------------------------------------------------------------
      else if (layout === 'cinematic-trio') {
        const pad = (borderWidth === 'none' ? 0 : borderWidth === 'thin' ? 16 : 28) * scale;
        const gap = 16 * scale;
        const usableW = width - pad * 2;
        const usableH = height - pad * 2;

        const leftW = Math.round(usableW * 0.46);
        const rightW = usableW - leftW - gap;

        // Slot 0: Big Vertical Hero on Left
        const heroImg = getImageForSlot(0);
        drawFittedImage(ctx, heroImg, pad, pad, leftW, usableH, slotTransforms[0]);

        // Right side: 2 stacked horizontal cards
        const stackH = (usableH - gap) / 2;

        const rightImg1 = getImageForSlot(1);
        drawFittedImage(ctx, rightImg1, pad + leftW + gap, pad, rightW, stackH, slotTransforms[1]);

        const rightImg2 = getImageForSlot(2);
        drawFittedImage(
          ctx,
          rightImg2,
          pad + leftW + gap,
          pad + stackH + gap,
          rightW,
          stackH,
          slotTransforms[2]
        );

        // Bottom cinematic watermark
        if (showTitle || coupleCaption) {
          ctx.save();
          const barH = 54 * scale;
          const barY = height - pad - barH;
          const barX = pad;
          const barW = leftW;

          ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
          ctx.fillRect(barX, barY, barW, barH);

          ctx.textAlign = 'left';
          ctx.fillStyle = '#FFFFFF';
          ctx.font = `italic 600 ${22 * scale}px "Playfair Display", Georgia, serif`;
          ctx.fillText(titleText, barX + 20 * scale, barY + 34 * scale);

          ctx.textAlign = 'right';
          ctx.fillStyle = '#E5C585';
          ctx.font = `600 ${10 * scale}px "Montserrat", sans-serif`;
          ctx.letterSpacing = `${2 * scale}px`;
          ctx.fillText(coupleCaption, barX + barW - 20 * scale, barY + 33 * scale);
          ctx.restore();
        }
      }

      // ------------------------------------------------------------------------
      // LAYOUT 3: GALLERY GRID 6 (Balanced 3x2 Grid Across 16:9)
      // ------------------------------------------------------------------------
      else if (layout === 'gallery-grid-6') {
        const pad = (borderWidth === 'none' ? 0 : borderWidth === 'thin' ? 20 : 36) * scale;
        const gap = 16 * scale;
        const bannerReserve = 60 * scale;

        const usableW = width - pad * 2;
        const usableH = height - pad * 2 - bannerReserve;

        const colW = (usableW - gap * 2) / 3;
        const rowH = (usableH - gap) / 2;

        const grid6 = [
          { c: 0, r: 0, slot: 0 },
          { c: 1, r: 0, slot: 1 },
          { c: 2, r: 0, slot: 2 },
          { c: 0, r: 1, slot: 3 },
          { c: 1, r: 1, slot: 4 },
          { c: 2, r: 1, slot: 5 },
        ];

        grid6.forEach((item) => {
          const x = pad + item.c * (colW + gap);
          const y = pad + item.r * (rowH + gap);
          const img = getImageForSlot(item.slot);

          drawFittedImage(ctx, img, x, y, colW, rowH, slotTransforms[item.slot]);
        });

        // Bottom Signature Banner
        ctx.save();
        const bannerY = height - pad - bannerReserve / 2;
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
    },
    [
      resolution,
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
      slotTransforms,
      drawFittedImage,
      loadImage,
    ]
  );

  // Redraw canvas whenever settings change
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    setIsRendering(true);
    const timer = setTimeout(() => {
      if (canvasRef.current) {
        renderCollage(canvasRef.current, '1080p').finally(() => setIsRendering(false));
      }
    }, 80);
    return () => clearTimeout(timer);
  }, [isOpen, renderCollage]);

  // Download High-Res File
  const handleDownload = async () => {
    try {
      setIsRendering(true);
      // Create high-res offscreen canvas
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
          a.download = `plusmoments-collage-16x9-${cleanName}-${resolution}.jpg`;
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
          const filename = `collage-16x9-${cleanSlug}-${Date.now()}.jpg`;
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

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
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
                  Studio Ghép Ảnh Tạp Chí 16:9 (Editorial Collage)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-100 text-amber-900 border border-amber-200">
                  16:9 RATIO
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-mono">
                Xuất file Full HD 1080p & 4K Ultra HD • Tùy chỉnh căn chỉnh khung ảnh không bị cắt mặt
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
            <button type="button" onClick={() => setToastMessage(null)} className="text-white/80 hover:text-white">
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
            <div className="w-full max-w-4xl flex items-center justify-between text-xs text-stone-300 mb-2.5 font-mono px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] text-[#E5C585] tracking-wider uppercase font-semibold">
                  {layout === 'editorial-spread'
                    ? 'Tạp Chí Editorial (Spread 6 Ảnh)'
                    : layout === 'cinematic-trio'
                    ? 'Điện Ảnh Trio (3-4 Ảnh)'
                    : 'Lưới Cân Đối 6 Ảnh (3x2)'}
                </span>
                <span className="text-stone-500 text-[10px]">
                  • {selectedUrls.length} ảnh đã chọn
                </span>
              </div>

              <div className="flex items-center gap-2">
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

            {/* 16:9 Frame Container */}
            <div className="w-full max-w-4xl aspect-[16/9] bg-stone-900 rounded-2xl overflow-hidden shadow-2xl border-4 border-[#282421] relative flex items-center justify-center">
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain cursor-crosshair"
                title="Bấm vào từng ô ảnh bên bảng điều khiển để tinh chỉnh góc nhìn và tỷ lệ zoom"
              />

              {isRendering && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center text-white gap-2 font-mono text-xs">
                  <Loader2 className="w-4 h-4 animate-spin text-[#E5C585]" />
                  <span>Đang render bản mẫu 16:9...</span>
                </div>
              )}
            </div>

            {/* Quick Slot Selector Strip Below Canvas */}
            <div className="w-full max-w-4xl mt-3 flex items-center justify-between text-xs font-mono text-stone-400 px-1">
              <span className="text-[11px]">Chọn ô ảnh để căn chỉnh góc nhìn:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {Array.from({ length: layout === 'cinematic-trio' ? 3 : 6 }).map((_, i) => (
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
                    className={`px-3 py-1 rounded-md font-medium transition-colors ${
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
                    className={`px-3 py-1 rounded-md font-medium transition-colors ${
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
                      className="p-1 text-stone-500 hover:text-stone-800 rounded hover:bg-stone-200 transition-colors"
                      title="Xáo trộn ngẫu nhiên vị trí các ảnh"
                    >
                      <Shuffle className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleSelectFirst6}
                      className="text-[10px] text-[#8C6D46] hover:underline px-1"
                    >
                      Lấy 6 ảnh đầu
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedUrls([])}
                      className="text-[10px] text-red-600 hover:underline px-1"
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
            <div className="p-4 border-b border-stone-200 max-h-48 overflow-y-auto no-scrollbar">
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
                    const isSelected = selectedUrls.includes(item.url);
                    const selectedIndex = selectedUrls.indexOf(item.url);
                    return (
                      <div
                        key={i}
                        onClick={() => handleToggleImage(item.url)}
                        className={`group relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#8C6D46] ring-2 ring-[#E5C585] shadow-xs'
                            : 'border-stone-200 hover:border-stone-400 bg-stone-100 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <img src={item.url} alt="" className="w-full h-full object-cover" />
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

            {/* SETTINGS: LAYOUT, THEME, BORDER */}
            <div className="p-4 border-b border-stone-200 space-y-4">
              <span className="font-semibold text-stone-900 uppercase tracking-wider text-[11px] block">
                2. Mẫu Bố Cục & Tông Màu Tạp Chí
              </span>

              {/* Layout choices */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    id: 'editorial-spread',
                    title: 'Tạp Chí Spread',
                    desc: 'Nửa mờ + 4 lưới',
                  },
                  {
                    id: 'cinematic-trio',
                    title: 'Điện Ảnh Trio',
                    desc: '1 dọc + 2 ngang',
                  },
                  {
                    id: 'gallery-grid-6',
                    title: 'Lưới 6 Cân Đối',
                    desc: '3 cột x 2 hàng',
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLayout(item.id as CollageLayoutType)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      layout === item.id
                        ? 'border-[#8C6D46] bg-amber-50/60 ring-2 ring-[#8C6D46]/20 shadow-2xs font-medium'
                        : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <div className="font-semibold text-xs text-stone-900">{item.title}</div>
                    <div className="text-[10px] text-stone-500 mt-0.5">{item.desc}</div>
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

            {/* SETTINGS: CELL FINE-TUNING (PAN, ZOOM, FLIP) */}
            <div className="p-4 border-b border-stone-200 space-y-3 bg-amber-50/40">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#8C6D46]" />
                  <span>3. Căn Chỉnh Ô Đang Chọn (Ô #{activeSlotIndex + 1})</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSlotTransforms((prev) => ({
                      ...prev,
                      [activeSlotIndex]: {
                        ...prev[activeSlotIndex],
                        flipX: !prev[activeSlotIndex]?.flipX,
                      },
                    }));
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

              {/* Sliders: Pan X, Pan Y, Zoom */}
              <div className="space-y-2 pt-1">
                {/* Pan X Slider */}
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
                      setSlotTransforms((prev) => ({
                        ...prev,
                        [activeSlotIndex]: { ...prev[activeSlotIndex], offsetX: val },
                      }));
                    }}
                    className="w-full accent-[#8C6D46] cursor-pointer"
                  />
                </div>

                {/* Pan Y Slider */}
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
                      setSlotTransforms((prev) => ({
                        ...prev,
                        [activeSlotIndex]: { ...prev[activeSlotIndex], offsetY: val },
                      }));
                    }}
                    className="w-full accent-[#8C6D46] cursor-pointer"
                  />
                </div>

                {/* Zoom Scale Slider */}
                <div>
                  <div className="flex items-center justify-between text-[11px] text-stone-600 mb-0.5">
                    <span>Độ Phóng To (Zoom):</span>
                    <span className="font-mono">{(slotTransforms[activeSlotIndex]?.zoom || 1.0).toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="2.5"
                    step="0.05"
                    value={slotTransforms[activeSlotIndex]?.zoom || 1.0}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setSlotTransforms((prev) => ({
                        ...prev,
                        [activeSlotIndex]: { ...prev[activeSlotIndex], zoom: val },
                      }));
                    }}
                    className="w-full accent-[#8C6D46] cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* SETTINGS: TYPOGRAPHY & QUOTE OVERLAYS */}
            <div className="p-4 space-y-3">
              <span className="font-semibold text-stone-900 uppercase tracking-wider text-[11px] block">
                4. Chữ Nghệ Thuật & Lời Trích Dẫn
              </span>

              {/* Title input */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-medium text-stone-700">Tiêu Đề Thư Pháp:</label>
                  <button
                    type="button"
                    onClick={() => setShowTitle(!showTitle)}
                    className="text-[10px] text-[#8C6D46] hover:underline"
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
                    className="text-[10px] text-[#8C6D46] hover:underline"
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
                    className="text-[10px] text-[#8C6D46] hover:underline"
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
