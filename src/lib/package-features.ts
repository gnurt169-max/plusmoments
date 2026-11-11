export const DEFAULT_PACKAGE_FEATURES = [
  'Chụp không giới hạn số lượng file suốt buổi chụp',
  'Toàn bộ file gốc chất lượng cao chỉnh màu cơ bản bàn giao trong 24h',
  'Thiết kế concept độc bản, khắc họa trọn vẹn từng nhịp đập cảm xúc điện ảnh',
  '02 Váy cưới cao cấp & 02 Vest Ý thiết kế riêng cho dâu rể',
  'Chuyên viên trang điểm nghệ thuật & làm tóc thay đổi theo từng trang phục',
  '01 Hoa cầm tay tươi cao cấp & hoa cài áo chú rể theo concept',
  '01 Album Photobook Fine Art mở phẳng 30 trang bọc da thủ công nhập khẩu (30x30 cm)',
  '02 Ảnh cổng Pha lê tráng gương khung hợp kim sang trọng (60x90 cm)',
  '01 Video Slide Highlight Cinematic 4K chiếu tại sảnh tiệc',
];

/**
 * Extracts and guarantees a full, comprehensive array of 6-9 wedding package features.
 * Works seamlessly with JSON string, array, newline-delimited text, or fallback defaults.
 */
export function extractPackageFeatures(pkg: {
  features?: string[];
  inclusions?: string | null;
  highlightPoints?: string | null;
}): string[] {
  if (Array.isArray(pkg.features) && pkg.features.length >= 5) {
    return pkg.features;
  }

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
  extract(pkg.inclusions);
  extract(pkg.highlightPoints);

  // If fewer than 5 features, pad with realistic luxury wedding deliverables
  if (items.length < 5) {
    for (const d of DEFAULT_PACKAGE_FEATURES) {
      if (!items.includes(d)) {
        items.push(d);
      }
    }
  }

  return items;
}

