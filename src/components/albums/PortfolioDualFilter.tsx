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

  // Extract unique concepts dynamically from DB albums
  const conceptsList = useMemo(() => {
    const set = new Set<string>();
    albums.forEach((a) => {
      const c = a.concept?.trim();
      if (c) set.add(c);
    });
    return ['Tất Cả', ...Array.from(set)];
  }, [albums]);

  // Extract unique locations dynamically from DB albums
  const locationsList = useMemo(() => {
    const set = new Set<string>();
    albums.forEach((a) => {
      const loc = a.location?.trim();
      if (loc) set.add(loc);
    });
    return ['Tất Cả', ...Array.from(set)];
  }, [albums]);

  // Check how many albums have video highlights
  const hasVideoCount = useMemo(() => {
    return albums.filter((a) => Boolean(a.videoUrl?.trim())).length;
  }, [albums]);

  // Update URL search query cleanly
  const updateUrl = (concept: string, location: string, onlyVideo: boolean) => {
    const params = new URLSearchParams();
    if (concept && concept !== 'Tất Cả') params.set('concept', concept);
    if (location && location !== 'Tất Cả') params.set('location', location);
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
        if (c !== selectedConcept.trim().toLowerCase()) return false;
      }

      // 2. Location filter
      if (selectedLocation && selectedLocation !== 'Tất Cả') {
        const l = album.location?.trim().toLowerCase() || '';
        if (l !== selectedLocation.trim().toLowerCase()) return false;
      }

      // 3. Video highlight filter
      if (videoOnly) {
        if (!album.videoUrl || !album.videoUrl.trim()) return false;
      }

      return true;
    });
  }, [albums, selectedConcept, selectedLocation, videoOnly]);

  const isFiltered =
    (selectedConcept && selectedConcept !== 'Tất Cả') ||
    (selectedLocation && selectedLocation !== 'Tất Cả') ||
    videoOnly;

  return (
    <div className="space-y-8">
      {/* FILTER CONTROL CARD */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-5 sm:p-7 border border-[#E8E0D5] shadow-xs space-y-5">
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
                concept === 'Tất Cả'
                  ? !selectedConcept || selectedConcept === 'Tất Cả'
                  : selectedConcept?.trim().toLowerCase() === concept.trim().toLowerCase();

              return (
                <button
                  key={`concept-${concept}`}
                  type="button"
                  onClick={() => handleConceptChange(concept)}
                  className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer select-none ${
                    isActive
                      ? 'bg-charcoal-900 text-white font-semibold shadow-sm'
                      : 'bg-[#FAF7F2] text-charcoal-700 hover:bg-[#F3EDE2] border border-[#E8E0D5]/80 font-normal'
                  }`}
                >
                  {concept}
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
                loc === 'Tất Cả'
                  ? !selectedLocation || selectedLocation === 'Tất Cả'
                  : selectedLocation?.trim().toLowerCase() === loc.trim().toLowerCase();

              return (
                <button
                  key={`loc-${loc}`}
                  type="button"
                  onClick={() => handleLocationChange(loc)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer select-none flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-amber-900 text-white font-semibold shadow-xs'
                      : 'bg-[#FAF7F2] text-stone-700 hover:bg-[#F3EDE2] border border-[#E8E0D5]/80'
                  }`}
                >
                  {loc !== 'Tất Cả' && <MapPin className="w-3 h-3 text-stone-600" />}
                  <span>{loc}</span>
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

      {/* ALBUMS GRID */}
      {filteredAlbums.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-200/80 p-8 max-w-xl mx-auto space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-xl">
            📷
          </div>
          <h2 className="font-serif text-2xl text-charcoal-800 font-light">
            Chưa tìm thấy album phù hợp với bộ lọc
          </h2>
          <p className="text-xs text-charcoal-500 font-light max-w-md mx-auto">
            Không có bộ ảnh nào khớp cùng lúc với Concept &ldquo;{selectedConcept}&rdquo; tại &ldquo;{selectedLocation}&rdquo;
            {videoOnly ? ' kèm Video Highlight' : ''}.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-2 mt-2 px-6 py-2.5 rounded-full text-xs uppercase tracking-wider bg-charcoal-900 hover:bg-charcoal-800 text-white font-medium transition-colors cursor-pointer"
          >
            <span>Xem Lại Tất Cả Album ({albums.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAlbums.map((album, idx) => (
            <AlbumCard
              key={album.id}
              album={album}
              priority={idx < 3}
              idx={idx}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default PortfolioDualFilter;
