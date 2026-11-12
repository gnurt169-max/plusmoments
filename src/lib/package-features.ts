/**
 * Extracts the real package features from Database records (features, inclusions, highlightPoints).
 * Strictly returns only real features inputted by Admin - no hardcoded fallbacks or mock padding.
 * Inclusions represent the detailed benefits in DB; highlightPoints are only used if inclusions are empty.
 */
const AI_MOCK_STRINGS = [
  'Kể chuyện bằng cảm xúc: Bắt trọn những rung động',
  'Góc nhìn điện ảnh: Kỹ thuật xử lý ánh sáng',
  'Chất lượng đẳng cấp: Sản phẩm in ấn cao cấp',
  'Lưu giữ khoảnh khắc vĩnh cửu bằng ngôn ngữ ánh sáng',
];

function isMockString(text: string): boolean {
  if (!text) return false;
  return AI_MOCK_STRINGS.some((mock) => text.includes(mock));
}

export function extractPackageFeatures(pkg: {
  features?: string[] | null;
  inclusions?: string | null | string[];
  highlightPoints?: string | null | string[];
}): string[] {
  if (!pkg) return [];

  const parseArrayOrLines = (val: any): string[] => {
    if (!val) return [];
    const items: string[] = [];

    const addClean = (str: string) => {
      const trimmed = str.replace(/^[•\-\*]\s*/, '').trim();
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
        // Fallback to line split if plain text string
        const lines = val.split('\n');
        for (const line of lines) {
          addClean(line);
        }
        return items;
      }
    }

    return items;
  };

  // 1. If explicit features array provided and not empty, use it directly
  if (Array.isArray(pkg.features) && pkg.features.length > 0) {
    const cleaned = pkg.features
      .filter((s): s is string => typeof s === 'string' && s.trim().length > 0 && !isMockString(s))
      .map((s) => s.trim());
    if (cleaned.length > 0) return cleaned;
  }

  // 2. Inclusions is the primary detailed list in DB - use only inclusions when present
  const inclusionsList = parseArrayOrLines(pkg.inclusions);
  if (inclusionsList.length > 0) {
    return inclusionsList;
  }

  // 3. Fallback to highlightPoints ONLY if inclusions is completely empty
  const highlightsList = parseArrayOrLines(pkg.highlightPoints);
  if (highlightsList.length > 0) {
    return highlightsList;
  }

  return [];
}
