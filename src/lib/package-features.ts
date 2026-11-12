/**
 * Extracts the real package features from Database records (features, highlightPoints, inclusions).
 * Strictly returns only features inputted by Admin - no hardcoded fallbacks or mock padding.
 */
export function extractPackageFeatures(pkg: {
  features?: string[] | null;
  inclusions?: string | null | string[];
  highlightPoints?: string | null | string[];
}): string[] {
  if (!pkg) return [];

  const items: string[] = [];

  const extract = (val: any) => {
    if (!val) return;
    if (Array.isArray(val)) {
      for (const s of val) {
        if (typeof s === 'string' && s.trim() && !items.includes(s.trim())) {
          items.push(s.trim());
        }
      }
      return;
    }
    if (typeof val === 'string' && val.trim()) {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) {
          for (const s of parsed) {
            if (typeof s === 'string' && s.trim() && !items.includes(s.trim())) {
              items.push(s.trim());
            }
          }
          return;
        }
      } catch {
        const lines = val
          .split('\n')
          .map((s: string) => s.replace(/^[•\-\*]\s*/, '').trim())
          .filter(Boolean);
        for (const s of lines) {
          if (!items.includes(s)) items.push(s);
        }
      }
    }
  };

  extract(pkg.features);
  extract(pkg.highlightPoints);
  extract(pkg.inclusions);

  return items;
}
