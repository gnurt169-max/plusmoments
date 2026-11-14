'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlbumCard, AlbumCardData } from './AlbumCard';
import { Sparkles, MapPin, Film, RotateCcw, ArrowRight } from 'lucide-react';

interface PortfolioDualFilterProps {
  albums: AlbumCardData[];
  initialConcept?: string;
  initialLocation?: string;
}

/**
 * Chuẩn hóa nhãn địa điểm:
 * Bất kỳ chuỗi nào chứa đồng thời "plusmoments" và "studio" (không phân biệt thứ tự/hoa thường)
 * đều gom thành nhãn chuẩn duy nhất "Studio PlusMoments".
 */
export function normalizeLocationLabel(rawLocation: string): string {
  if (!rawLocation) return '';
  const trimmed = rawLocation.trim();
  const lower = trimmed.toLowerCase();

  if (lower.includes('plusmoments') && lower.includes('studio')) {
    return 'Studio PlusMoments';
  }

  return trimmed;
}

/**
 * Tách và chuẩn hóa các địa điểm từ chuỗi location của album (hỗ trợ phân tách bằng &, ,, hoặc /)
 */
export function extractNormalizedLocations(rawLocation?: string | null): string[] {
  if (!rawLocation) return [];
  const parts = rawLocation.split(/&|,|\//).map((p) => p.trim()).filter(Boolean);
  const normalized = parts.map((p) => normalizeLocationLabel(p));
  return Array.from(new Set(normalized));
}

/**
 * Rút gọn nhãn hiển thị Concept trên Mobile
 */
export function getShortConceptLabel(concept: string): string {
  if (!concept || concept === 'Tất Cả') return 'Tất Cả';
  if (concept.includes(',')) {
    return concept.split(',')[0].trim();
  }
  if (concept.includes(' & ') && concept.length > 18) {
    return concept.split(' & ')[0].trim();
  }
  if (concept.length > 20) {
    return concept.slice(0, 18) + '...';
  }
  return concept;
}

export function PortfolioDualFilter({
  albums,
  initialConcept = 'Tất Cả',
  initialLocation = 'Tất Cả',
}: PortfolioDualFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract initial values from query or props
  const queryConcept = searchParams.get('concept') || searchParams.get('category') || initialConcept;
  const queryLocation = searchParams.get('location') || initialLocation;
  const queryVideoOnly = searchParams.get('video') === 'true';

  const [selectedConcept, setSelectedConcept] = useState<string>(queryConcept);
  const [selectedLocation, setSelectedLocation] = useState<string>(queryLocation);
  const [videoOnly, setVideoOnly] = useState<boolean>(queryVideoOnly);

  // Sync state if URL query params change (e.g. browser back/forward)
  useEffect(() => {
    const c = searchParams.get('concept') || searchParams.get('category') || 'Tất Cả';
    const l = searchParams.get('location') || 'Tất Cả';
    const v = searchParams.get('video') === 'true';
    setSelectedConcept(c);
    setSelectedLocation(l);
    setVideoOnly(v);
  }, [searchParams]);

  // 1. Phân tích địa điểm cho từng album (hỗ trợ gom nhóm & deduplication)
  const albumLocationsMap = useMemo(() => {
    const map = new Map<string, string[]>();
    albums.forEach((album) => {
      const locs = extractNormalizedLocations(album.location);
      map.set(album.id, locs);
    });
    return map;
  }, [albums]);

  // 2. Gom nhóm thông minh & sắp xếp địa điểm theo số lượng album giảm dần
  const locationsList = useMemo(() => {
    const counts: Record<string, number> = {};
    albums.forEach((album) => {
      const locs = albumLocationsMap.get(album.id) || [];
      locs.forEach((loc) => {
        counts[loc] = (counts[loc] || 0) + 1;
      });
    });

    const sortedLocs = Object.entries(counts)
      .sort((a, b) => b[1] - a[1]) // Số lượng album giảm dần
      .map(([loc]) => loc);

    return [
      { label: 'Tất Cả Địa Điểm', shortLabel: 'Tất Cả', value: 'Tất Cả', count: albums.length },
      ...sortedLocs.map((loc) => ({
        label: loc,
        shortLabel: loc,
        value: loc,
        count: counts[loc],
      })),
    ];
  }, [albums, albumLocationsMap]);

  // 3. Danh sách phong cách concept động từ DB
  const conceptsList = useMemo(() => {
    const set = new Set<string>();
    albums.forEach((a) => {
      const c = a.concept?.trim();
      if (c) set.add(c);
    });
    return [
      { label: 'Tất Cả', shortLabel: 'Tất Cả', value: 'Tất Cả' },
      ...Array.from(set).map((concept) => ({
        label: concept,
        shortLabel: getShortConceptLabel(concept),
        value: concept,
      })),
    ];
  }, [albums]);

  // Check how many albums have video highlights
  const hasVideoCount = useMemo(() => {
    return albums.filter((a) => Boolean(a.videoUrl?.trim())).length;
  }, [albums]);

  // Update URL search query cleanly
  const updateUrl = (concept: string, location: string, onlyVideo: boolean) => {
    const params = new URLSearchParams();
    if (concept && concept !== 'Tất Cả') params.set('concept', concept);
    if (location && location !== 'Tất Cả' && location !== 'Tất Cả Địa Điểm') params.set('location', location);
    if (onlyVideo) params.set('video', 'true');

    const queryString = params.toString();
    const newPath = queryString ? `/bo-suu-tap?${queryString}` : '/bo-suu-tap';
    window.history.replaceState(null, '', newPath);
  };

  const handleConceptChange = (concept: string) => {
    setSelectedConcept(concept);
    updateUrl(concept, selectedLocation, videoOnly);
  };

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
    updateUrl(selectedConcept, location, videoOnly);
  };

  const handleToggleVideo = () => {
    const nextVal = !videoOnly;
    setVideoOnly(nextVal);
    updateUrl(selectedConcept, selectedLocation, nextVal);
  };

  const handleResetFilters = () => {
    setSelectedConcept('Tất Cả');
    setSelectedLocation('Tất Cả');
    setVideoOnly(false);
    updateUrl('Tất Cả', 'Tất Cả', false);
  };

  // Filter albums client-side for zero-latency switching
  const filteredAlbums = useMemo(() => {
    return albums.filter((album) => {
      // 1. Concept filter
      if (selectedConcept && selectedConcept !== 'Tất Cả') {
        const c = album.concept?.trim().toLowerCase() || '';
        const sel = selectedConcept.trim().toLowerCase();
        const shortSel = getShortConceptLabel(selectedConcept).trim().toLowerCase();
        const matchesConcept =
          c === sel ||
          c.includes(sel) ||
          c.includes(shortSel) ||
          sel.includes(c);
        if (!matchesConcept) return false;
      }

      // 2. Location filter
      if (selectedLocation && selectedLocation !== 'Tất Cả' && selectedLocation !== 'Tất Cả Địa Điểm') {
        const albumLocs = albumLocationsMap.get(album.id) || [];
        const normSelected = normalizeLocationLabel(selectedLocation).toLowerCase();
        const matchesLocation =
          albumLocs.some((loc) => loc.toLowerCase() === normSelected || loc.toLowerCase().includes(normSelected)) ||
          normalizeLocationLabel(album.location || '').toLowerCase() === normSelected;
        if (!matchesLocation) return false;
      }

      // 3. Video highlight filter
      if (videoOnly) {
        if (!album.videoUrl || !album.videoUrl.trim()) return false;
      }

      return true;
    });
  }, [albums, selectedConcept, selectedLocation, videoOnly, albumLocationsMap]);

  const isFiltered =
    (selectedConcept && selectedConcept !== 'Tất Cả') ||
    (selectedLocation && selectedLocation !== 'Tất Cả' && selectedLocation !== 'Tất Cả Địa Điểm') ||
    videoOnly;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* =========================================================================
          1. MOBILE COMPACT HORIZONTAL SCROLL FILTER BAR (< md)
          - Chiều cao siêu gọn (~110px), cuộn mượt không thanh cuộn
          - Ảnh album xuất hiện ngay ở màn hình đầu tiên
      ========================================================================= */}
      <div className="md:hidden bg-white/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 border border-[#E8E0D5] shadow-xs space-y-2 select-none">
        {/* TẦNG 1: CONCEPT — Cuộn ngang 1 dòng */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 scroll-smooth -mx-1 px-1">
          {conceptsList.map((c) => {
            const isActive =
              c.value === 'Tất Cả'
                ? !selectedConcept || selectedConcept === 'Tất Cả'
                : selectedConcept?.trim().toLowerCase() === c.value.trim().toLowerCase() ||
                  selectedConcept?.trim().toLowerCase() === c.shortLabel.trim().toLowerCase();

            return (
              <button
                key={`m-concept-${c.value}`}
                type="button"
                onClick={() => handleConceptChange(c.value)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] uppercase tracking-wider transition-all duration-200 select-none whitespace-nowrap cursor-pointer active:scale-95 ${
                  isActive
                    ? 'bg-charcoal-900 text-white font-semibold shadow-xs'
                    : 'bg-[#FAF7F2] text-charcoal-700 hover:bg-[#F3EDE2] border border-[#E8E0D5]/80 font-normal'
                }`}
              >
                {c.shortLabel}
              </button>
            );
          })}
        </div>

        {/* TẦNG 2: ĐỊA ĐIỂM + VIDEO HIGHLIGHT — Cuộn ngang 1 dòng */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 scroll-smooth -mx-1 px-1">
          {hasVideoCount > 0 && (
            <button
              type="button"
              onClick={handleToggleVideo}
              className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-semibold transition-all select-none whitespace-nowrap cursor-pointer active:scale-95 ${
                videoOnly
                  ? 'bg-amber-600 text-white shadow-xs border border-amber-500'
                  : 'bg-amber-50/90 text-amber-900 border border-amber-300 hover:bg-amber-100'
              }`}
            >
              <Film className="w-3 h-3 text-amber-500" />
              <span>Video ({hasVideoCount})</span>
            </button>
          )}

          {locationsList.map((loc) => {
            const isActive =
              loc.value === 'Tất Cả'
                ? !selectedLocation || selectedLocation === 'Tất Cả' || selectedLocation === 'Tất Cả Địa Điểm'
                : selectedLocation?.trim().toLowerCase() === loc.value.trim().toLowerCase();

            return (
              <button
                key={`m-loc-${loc.value}`}
                type="button"
                onClick={() => handleLocationChange(loc.value)}
                className={`shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all duration-200 select-none whitespace-nowrap cursor-pointer active:scale-95 ${
                  isActive
                    ? 'bg-amber-900 text-white font-semibold shadow-xs'
                    : 'bg-[#FAF7F2] text-stone-700 hover:bg-[#F3EDE2] border border-[#E8E0D5]/80'
                }`}
              >
                {loc.value !== 'Tất Cả' && <MapPin className="w-2.5 h-2.5 text-stone-600 shrink-0" />}
                <span>{loc.shortLabel}</span>
              </button>
            );
          })}
        </div>

        {/* DÒNG ĐẾM & NÚT RESET TRÊN MOBILE */}
        <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-[11px] text-charcoal-600 px-0.5">
          <span>
            Hiển thị <strong className="text-amber-900 font-bold">{filteredAlbums.length}</strong> / {albums.length} bộ sưu tập
          </span>
          {isFiltered && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 hover:text-amber-950 underline cursor-pointer"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>Xóa lọc</span>
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          2. DESKTOP FILTER CONTROL CARD (>= md)
          - Bố cục 2 hàng ngang sang trọng, hiển thị chi tiết số lượng
      ========================================================================= */}
      <div className="hidden md:block bg-white/80 backdrop-blur-md rounded-3xl p-5 sm:p-7 border border-[#E8E0D5] shadow-xs space-y-5">
        {/* ROW 1: CONCEPT / PHONG CÁCH CHỤP */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-charcoal-700">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>1. Phong Cách / Concept:</span>
            </span>
            <span className="text-[11px] text-stone-600 font-light normal-case">
              {conceptsList.length - 1} phong cách độc bản
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {conceptsList.map((concept) => {
              const isActive =
                concept.value === 'Tất Cả'
                  ? !selectedConcept || selectedConcept === 'Tất Cả'
                  : selectedConcept?.trim().toLowerCase() === concept.value.trim().toLowerCase();

              return (
                <button
                  key={`desktop-concept-${concept.value}`}
                  type="button"
                  onClick={() => handleConceptChange(concept.value)}
                  className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer select-none ${
                    isActive
                      ? 'bg-charcoal-900 text-white font-semibold shadow-sm'
                      : 'bg-[#FAF7F2] text-charcoal-700 hover:bg-[#F3EDE2] border border-[#E8E0D5]/80 font-normal'
                  }`}
                >
                  {concept.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ROW 2: LOCATION / ĐỊA ĐIỂM CHỤP + VIDEO FILTER */}
        <div className="space-y-2.5 pt-4 border-t border-stone-200/60">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-charcoal-700">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>2. Địa Điểm Chụp:</span>
            </span>
            {hasVideoCount > 0 && (
              <button
                type="button"
                onClick={handleToggleVideo}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                  videoOnly
                    ? 'bg-amber-600 text-white shadow-xs border border-amber-500'
                    : 'bg-amber-50/80 text-amber-900 border border-amber-300 hover:bg-amber-100'
                }`}
              >
                <Film className="w-3 h-3 text-amber-500" />
                <span>Có Video Highlight ({hasVideoCount})</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {locationsList.map((loc) => {
              const isActive =
                loc.value === 'Tất Cả'
                  ? !selectedLocation || selectedLocation === 'Tất Cả' || selectedLocation === 'Tất Cả Địa Điểm'
                  : selectedLocation?.trim().toLowerCase() === loc.value.trim().toLowerCase();

              return (
                <button
                  key={`desktop-loc-${loc.value}`}
                  type="button"
                  onClick={() => handleLocationChange(loc.value)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer select-none flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-amber-900 text-white font-semibold shadow-xs'
                      : 'bg-[#FAF7F2] text-stone-700 hover:bg-[#F3EDE2] border border-[#E8E0D5]/80'
                  }`}
                >
                  {loc.value !== 'Tất Cả' && <MapPin className="w-3 h-3 text-stone-600" />}
                  <span>{loc.label}</span>
                  {loc.value !== 'Tất Cả' && (
                    <span className="text-[10px] opacity-75 font-mono">({loc.count})</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ACTIVE FILTER SUMMARY & RESET BAR */}
        <div className="pt-3 border-t border-stone-200/60 flex items-center justify-between text-xs text-charcoal-600">
          <div className="flex items-center gap-2">
            <span className="font-medium text-stone-900">
              Hiển thị <span className="font-bold text-amber-900">{filteredAlbums.length}</span> / {albums.length} bộ sưu tập
            </span>
            {isFiltered && (
              <span className="text-[11px] text-stone-600 hidden sm:inline">
                (đang áp dụng bộ lọc)
              </span>
            )}
          </div>

          {isFiltered && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 hover:text-amber-950 underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Xóa bộ lọc</span>
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          3. ALBUMS GRID (2 Cột trên Mobile < 640px, 3-4 Cột trên Desktop)
      ========================================================================= */}
      {filteredAlbums.length === 0 ? (
        <div className="text-center py-16 sm:py-20 bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 max-w-xl mx-auto space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-xl">
            📷
          </div>
          <h2 className="font-serif text-xl sm:text-2xl text-charcoal-800 font-light">
            Chưa tìm thấy album phù hợp với bộ lọc
          </h2>
          <p className="text-xs text-charcoal-500 font-light max-w-md mx-auto">
            Không có bộ ảnh nào khớp cùng lúc với Concept &ldquo;{selectedConcept}&rdquo; tại &ldquo;{selectedLocation}&rdquo;
            {videoOnly ? ' kèm Video Highlight' : ''}.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-2 mt-2 px-5 sm:px-6 py-2.5 rounded-full text-xs uppercase tracking-wider bg-charcoal-900 hover:bg-charcoal-800 text-white font-medium transition-colors cursor-pointer"
          >
            <span>Xem Lại Tất Cả Album ({albums.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
          {filteredAlbums.map((album, idx) => (
            <AlbumCard
              key={album.id}
              album={album}
              priority={idx < 4}
              idx={idx}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default PortfolioDualFilter;
