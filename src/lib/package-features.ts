/**
 * Helper to parse and extract Package Highlights and 100% Full Benefits
 * Directly from real database columns (highlightPoints, inclusions, deliverables).
 * Strictly filters out any placeholder or mock strings.
 */

const AI_MOCK_STRINGS = [
  'Kể chuyện bằng cảm xúc: Bắt trọn những rung động',
  'Góc nhìn điện ảnh: Kỹ thuật xử lý ánh sáng',
  'Chất lượng đẳng cấp: Sản phẩm in ấn cao cấp',
  'Lưu giữ khoảnh khắc vĩnh cửu bằng ngôn ngữ ánh sáng',
];

export function isMockString(text: string): boolean {
  if (!text) return false;
  return AI_MOCK_STRINGS.some((mock) => text.includes(mock));
}

/**
 * Parses an array, JSON string, or newline-delimited text into clean trimmed string items.
 */
export function parseArrayOrLines(val: any): string[] {
  if (!val) return [];
  const items: string[] = [];

  const addClean = (str: string) => {
    if (typeof str !== 'string') return;
    const trimmed = str.replace(/^[•\-\*✓]\s*/, '').trim();
    if (trimmed && !isMockString(trimmed) && !items.includes(trimmed)) {
      items.push(trimmed);
    }
  };

  if (Array.isArray(val)) {
    for (const s of val) {
      if (typeof s === 'string') addClean(s);
    }
    return items;
  }

  if (typeof val === 'string' && val.trim()) {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) {
        for (const s of parsed) {
          if (typeof s === 'string') addClean(s);
        }
        return items;
      }
    } catch {
      // Fallback: split by newlines if plain text
      const lines = val.split('\n');
      for (const line of lines) {
        addClean(line);
      }
      return items;
    }
  }

  return items;
}

/**
 * Extracts 3-4 Core Highlights for PackageCard on Home and Pricing pages.
 * 1. Checks `highlightPoints` (or pre-extracted `coreHighlights` / `highlights`).
 *    If present in DB, returns 100% of these core highlights (max 4).
 * 2. ONLY if `highlightPoints` is completely empty, fallbacks to the first 3 items of `inclusions`.
 * 3. Returns empty array if both are empty (never returns mock text).
 */
export function extractPackageHighlights(pkg: {
  coreHighlights?: string[] | null;
  highlights?: string[] | null;
  highlightPoints?: string | null | string[];
  inclusions?: string | null | string[];
  features?: string[] | null;
}): string[] {
  if (!pkg) return [];

  // Check pre-extracted array if present
  if (Array.isArray(pkg.coreHighlights) && pkg.coreHighlights.length > 0) {
    return pkg.coreHighlights.filter((s) => !isMockString(s)).slice(0, 4);
  }
  if (Array.isArray(pkg.highlights) && pkg.highlights.length > 0) {
    return pkg.highlights.filter((s) => !isMockString(s)).slice(0, 4);
  }

  // 1. Primary: highlightPoints from DB
  const rawHighlights = parseArrayOrLines(pkg.highlightPoints);
  if (rawHighlights.length > 0) {
    return rawHighlights.slice(0, 4);
  }

  // 2. Fallback: first 3 items of inclusions if highlightPoints is empty
  const rawInclusions = parseArrayOrLines(pkg.inclusions || pkg.features);
  if (rawInclusions.length > 0) {
    return rawInclusions.slice(0, 3);
  }

  return [];
}

/**
 * Extracts 100% full detailed benefits & deliverables for PackageDetailModal.
 * Returns all items in `inclusions`.
 */
export function extractPackageInclusions(pkg: {
  inclusionsList?: string[] | null;
  fullFeatures?: string[] | null;
  inclusions?: string | null | string[];
  features?: string[] | null;
  highlightPoints?: string | null | string[];
}): string[] {
  if (!pkg) return [];

  if (Array.isArray(pkg.inclusionsList) && pkg.inclusionsList.length > 0) {
    return pkg.inclusionsList.filter((s) => !isMockString(s));
  }
  if (Array.isArray(pkg.fullFeatures) && pkg.fullFeatures.length > 0) {
    return pkg.fullFeatures.filter((s) => !isMockString(s));
  }

  const rawInclusions = parseArrayOrLines(pkg.inclusions || pkg.features);
  if (rawInclusions.length > 0) {
    return rawInclusions;
  }

  // Fallback to highlightPoints only if inclusions is completely empty
  const rawHighlights = parseArrayOrLines(pkg.highlightPoints);
  if (rawHighlights.length > 0) {
    return rawHighlights;
  }

  return [];
}

/**
 * Alias for backward compatibility
 */
export function extractPackageFeatures(pkg: {
  features?: string[] | null;
  inclusions?: string | null | string[];
  highlightPoints?: string | null | string[];
}): string[] {
  return extractPackageInclusions(pkg);
}
