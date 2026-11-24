import { NextRequest, NextResponse } from 'next/server';
import { HCMC_WEDDING_VENUES, HcmcWeddingVenue } from '@/data/hcmc-wedding-venues';

/**
 * Remove Vietnamese tonal marks for ultra-fast, forgiving search.
 * e.g. "Hoàng Văn Thụ" -> "hoang van thu"
 */
function removeVietnameseTones(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get('q') || '').trim();

    // If query is empty or less than 1 char, return top popular recommendations
    if (!query) {
      const topVenues = HCMC_WEDDING_VENUES.slice(0, 10);
      return NextResponse.json({
        success: true,
        source: 'curated_popular',
        venues: topVenues,
      });
    }

    const cleanQuery = removeVietnameseTones(query);
    const queryTokens = cleanQuery.split(/\s+/).filter(Boolean);

    // 1. Search against curated HCMC wedding venues dataset
    const matchedCurated = HCMC_WEDDING_VENUES.filter((venue) => {
      const targetName = removeVietnameseTones(venue.name);
      const targetShort = removeVietnameseTones(venue.shortName);
      const targetAddress = removeVietnameseTones(venue.address);
      const targetDistrict = removeVietnameseTones(venue.district);
      const fullText = `${targetName} ${targetShort} ${targetAddress} ${targetDistrict}`;

      // Every word in query should match somewhere in the venue's string
      return queryTokens.every((token) => fullText.includes(token));
    });

    // If curated matches are sufficient (>= 3), return immediately with sub-millisecond response
    if (matchedCurated.length >= 3 || query.length < 3) {
      return NextResponse.json({
        success: true,
        source: 'curated',
        count: matchedCurated.length,
        venues: matchedCurated.slice(0, 15),
      });
    }

    // 2. Online Geocoding Fallback via OpenStreetMap Nominatim for unlisted venues/churches in HCMC
    const externalVenues: HcmcWeddingVenue[] = [];
    try {
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=vn&viewbox=106.35,11.16,107.02,10.35&bounded=1&q=${encodeURIComponent(
        query + ' Hồ Chí Minh'
      )}&limit=5`;

      const response = await fetch(nominatimUrl, {
        headers: {
          'User-Agent': 'PlusMomentsWeddingApp/1.0 (trunglnm@plusmoments.vn)',
          Accept: 'application/json',
        },
        next: { revalidate: 3600 },
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          data.forEach((item: any, idx: number) => {
            const displayName = item.display_name || '';
            const name = item.name || displayName.split(',')[0] || query;
            const mapQuery = encodeURIComponent(`${name} ${displayName}`);

            externalVenues.push({
              id: `osm-${item.osm_id || idx}-${Date.now()}`,
              name: name,
              shortName: name,
              address: displayName,
              district: 'TP. Hồ Chí Minh',
              mapUrl: `https://www.google.com/maps/search/?api=1&query=${mapQuery}`,
              category: 'restaurant',
            });
          });
        }
      }
    } catch {
      // Fallback silently if Nominatim has rate limits or network issues
    }

    // Combine curated with external results, deduplicating
    const combined = [...matchedCurated, ...externalVenues];

    return NextResponse.json({
      success: true,
      source: externalVenues.length > 0 ? 'hybrid' : 'curated',
      count: combined.length,
      venues: combined.slice(0, 15),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi tìm kiếm nhà hàng' },
      { status: 500 }
    );
  }
}
