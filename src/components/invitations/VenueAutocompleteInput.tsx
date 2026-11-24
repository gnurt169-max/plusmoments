'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Check, ExternalLink, Edit3, Sparkles, Building2, Loader2 } from 'lucide-react';
import { HcmcWeddingVenue } from '@/data/hcmc-wedding-venues';

interface VenueAutocompleteInputProps {
  venueName: string;
  venueAddress: string;
  googleMapsUrl: string;
  onChangeVenueName: (val: string) => void;
  onChangeVenueAddress: (val: string) => void;
  onChangeGoogleMapsUrl: (val: string) => void;
  isDark?: boolean;
}

export function VenueAutocompleteInput({
  venueName,
  venueAddress,
  googleMapsUrl,
  onChangeVenueName,
  onChangeVenueAddress,
  onChangeGoogleMapsUrl,
  isDark = false,
}: VenueAutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(venueName);
  const [results, setResults] = useState<HcmcWeddingVenue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Sync internal search input with external venueName when external changes
  useEffect(() => {
    setQuery(venueName);
  }, [venueName]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch venue suggestions on query change or focus
  const fetchVenues = async (searchQuery: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/venues/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.venues)) {
        setResults(data.venues);
      }
    } catch {
      // ignore network errors
    } finally {
      setIsLoading(false);
    }
  };

  const handleFocus = () => {
    setIsOpen(true);
    fetchVenues(query);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onChangeVenueName(val);
    setIsOpen(true);
    fetchVenues(val);
    const searchTerms = [val, venueAddress].filter(Boolean).join(' ').trim();
    if (searchTerms) {
      onChangeGoogleMapsUrl(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchTerms)}`);
    }
  };

  const handleAddressChange = (val: string) => {
    onChangeVenueAddress(val);
    const searchTerms = [venueName, val].filter(Boolean).join(' ').trim();
    if (searchTerms) {
      onChangeGoogleMapsUrl(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchTerms)}`);
    }
  };

  const handleSelectVenue = (venue: HcmcWeddingVenue) => {
    onChangeVenueName(venue.name);
    onChangeVenueAddress(venue.address);
    onChangeGoogleMapsUrl(venue.mapUrl);
    setQuery(venue.name);
    setIsOpen(false);
  };

  const effectiveMapUrl =
    googleMapsUrl ||
    ((venueName || venueAddress)
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([venueName, venueAddress].filter(Boolean).join(' ').trim())}`
      : '');
  const hasAutoLinkedMap = Boolean(effectiveMapUrl && (venueName?.trim() || venueAddress?.trim()));

  return (
    <div ref={wrapperRef} className="space-y-4 relative">
      {/* 1. VENUE NAME AUTOCOMPLETE INPUT */}
      <div className="relative">
        <label className="block text-xs font-semibold text-stone-800 mb-1 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-[#8C6D46]" />
            <span>Tên Trung Tâm / Nhà Hàng</span>
            <span className="text-red-500">*</span>
          </span>
          <span className="text-[10px] text-[#8C6D46] font-normal">
            💡 Gợi ý nhanh 50+ nhà hàng TP.HCM
          </span>
        </label>

        <div className="relative">
          <input
            type="text"
            required
            value={query}
            onFocus={handleFocus}
            onChange={handleInputChange}
            className="w-full h-11 pl-9 pr-9 rounded-xl border border-stone-300 text-stone-900 text-xs focus:ring-2 focus:ring-[#8C6D46] focus:outline-none transition-all"
          />
          <MapPin className="w-4 h-4 text-[#8C6D46] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />

          {isLoading ? (
            <Loader2 className="w-4 h-4 text-stone-400 animate-spin absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          ) : (
            <Search className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          )}
        </div>

        {/* 2. AUTOCOMPLETE DROPDOWN RESULTS */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl shadow-2xl max-h-72 overflow-y-auto z-50 p-1.5 divide-y divide-stone-100 animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[#8C6D46] font-semibold flex items-center justify-between">
              <span>{query ? `Kết quả tìm kiếm cho "${query}"` : 'Địa điểm cưới phổ biến tại TP.HCM'}</span>
              <span>{results.length} gợi ý</span>
            </div>

            {results.length === 0 ? (
              <div className="p-4 text-center text-xs text-stone-500">
                Không tìm thấy nhà hàng khớp từ khóa. Bạn có thể tự gõ tên và địa chỉ bên dưới.
              </div>
            ) : (
              results.map((venue) => {
                const isSelected = venue.name === venueName;
                return (
                  <button
                    key={venue.id}
                    type="button"
                    onClick={() => handleSelectVenue(venue)}
                    className={`w-full text-left p-2.5 rounded-xl transition-colors flex items-start justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-[#8C6D46]/10 text-stone-900'
                        : 'hover:bg-white text-stone-800'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-xs text-[#1C1917] flex items-center gap-1.5 truncate">
                        <span>{venue.name}</span>
                        {venue.district && (
                          <span className="px-1.5 py-0.5 rounded-md bg-[#8C6D46]/15 text-[#8C6D46] text-[9px] font-mono tracking-tight shrink-0">
                            {venue.district}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500 truncate mt-0.5">
                        {venue.address}
                      </p>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-[#8C6D46] shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* 2. VENUE ADDRESS FIELD (AUTO-FILLED OR MANUAL) */}
      <div>
        <label className="block text-xs font-semibold text-stone-800 mb-1">
          Địa Chỉ Tổ Chức Hôn Lễ <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={venueAddress}
          onChange={(e) => handleAddressChange(e.target.value)}
          className="w-full h-11 px-3.5 rounded-xl border border-stone-300 text-stone-900 text-xs focus:ring-2 focus:ring-[#8C6D46] focus:outline-none transition-all"
        />

        {/* Clean subtle Google Maps status indicator (No raw URL) */}
        {hasAutoLinkedMap && (
          <div className="mt-2 flex items-center justify-between text-[11px] text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200/70">
            <span className="flex items-center gap-1.5 truncate">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>✓ Đã tự động gắn vị trí bản đồ Google Maps</span>
            </span>
            <a
              href={effectiveMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-[#8C6D46] hover:underline shrink-0 ml-2"
              title="Mở Google Maps trong tab mới để kiểm tra"
            >
              <span>Kiểm tra bản đồ</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default VenueAutocompleteInput;
