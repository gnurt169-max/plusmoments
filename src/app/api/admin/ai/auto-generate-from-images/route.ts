import { NextResponse } from 'next/server';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { getOrAnalyzeImageChunk, VisionAIChunk } from '@/lib/vision-ai';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function extractJson(text: string): any {
  if (!text) return null;
  try {
    return JSON.parse(text.trim());
  } catch {}
  const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (match && match[1]) {
    try {
      return JSON.parse(match[1].trim());
    } catch {}
  }
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(text.substring(firstBrace, lastBrace + 1));
    } catch {}
  }
  return null;
}

export interface NormalizedImageItem {
  url: string;
  id?: string;
  width?: number;
  height?: number;
  orientation: 'landscape' | 'portrait' | 'square';
  name?: string;
  filename?: string;
}

/**
 * Thuật toán Giám định & Sắp xếp Bố cục Thông minh (Heuristic Fallback Engine)
 * Đảm bảo 100% hoạt động mượt mà khi không có AI Key hoặc khi AI gặp sự cố mạng.
 */
function curateAlbumFallback(images: NormalizedImageItem[], folderName?: string) {
  if (images.length === 0) {
    return {
      title: 'Khoảnh Khắc Cưới Tinh Khôi',
      slug: 'khoanh-khac-cuoi-tinh-khoi',
      subtitle: 'Phong cách Luxury & Cảm xúc vượt thời gian',
      concept: 'Pre-Wedding Luxury',
      location: 'Studio & Ngoại cảnh PlusMoments',
      coupleNames: 'Hai bạn uyên ương',
      description: 'Bộ ảnh cưới lưu giữ những rung cảm tinh khôi và chân thành nhất tại PlusMoments Studio.',
      seoTitle: 'Khoảnh Khắc Cưới Tinh Khôi | PlusMoments',
      seoDescription: 'Bộ sưu tập ảnh cưới tinh khôi, sang trọng phong cách điện ảnh tại PlusMoments Studio.',
      bestCoverUrl: '',
      coverReason: '',
      orderedImages: [],
      imagesMetadata: [],
    };
  }

  // 1. Chấm điểm tìm Ảnh Bìa Đại Diện (Cover Image) xuất sắc nhất
  let bestCover = images[0].url;
  let bestCoverReason = 'Khung hình nổi bật với bố cục cân đối và ánh sáng sang trọng.';
  let highestScore = -1;

  images.forEach((img, index) => {
    let score = 50;
    const fn = (img.filename || img.name || img.url).toLowerCase();

    // Điểm thưởng theo từ khóa ảnh đại diện / ảnh chính
    if (fn.includes('cover') || fn.includes('bia') || fn.includes('hero') || fn.includes('banner')) score += 50;
    if (fn.includes('main') || fn.includes('best') || fn.includes('highlight') || fn.includes('select')) score += 30;

    // Ảnh dọc (portrait) là tỉ lệ vàng lý tưởng cho thẻ ảnh Album 3:4 & 4:5
    if (img.orientation === 'portrait') {
      score += 25;
      if (img.width && img.height) {
        const ratio = img.width / img.height;
        if (ratio >= 0.65 && ratio <= 0.85) score += 15; // Chuẩn 3:4 hoặc 4:5
      }
    } else if (img.orientation === 'landscape' && img.width && img.width >= 1920) {
      score += 15; // Ảnh ngang độ phân giải cao làm banner hero
    }

    // Độ phân giải cao
    if ((img.width && img.width >= 1600) || (img.height && img.height >= 1600)) score += 10;

    // Vị trí: các tấm mở đầu thường là khoảnh khắc đắt giá
    if (index === 0) score += 10;
    else if (index <= 5) score += 5;

    if (score > highestScore) {
      highestScore = score;
      bestCover = img.url;
      if (fn.includes('cover') || fn.includes('bia')) {
        bestCoverReason = 'Tấm ảnh bìa điểm nhấn được đánh dấu trong thư mục với bố cục chân dung chuẩn xác.';
      } else if (img.orientation === 'portrait') {
        bestCoverReason = 'Khung hình chân dung dọc sang trọng, bắt trọn cảm xúc đôi uyên ương với tỉ lệ vàng hoàn hảo cho ảnh bìa.';
      } else {
        bestCoverReason = 'Khung hình toàn cảnh góc rộng ấn tượng, không gian lễ cưới tráng lệ và ánh sáng hài hòa nhất.';
      }
    }
  });

  // 2. Sắp xếp lại thứ tự ảnh tối ưu nhịp điệu lưới Masonry & Mạch kể chuyện
  // Xen kẽ nhịp nhàng giữa landscape và portrait để các cột Masonry cân bằng chiều cao
  const portraits = images.filter((img) => img.orientation === 'portrait');
  const landscapes = images.filter((img) => img.orientation === 'landscape');
  const squaresAndOthers = images.filter((img) => img.orientation !== 'portrait' && img.orientation !== 'landscape');

  const pPool = [...portraits];
  const lPool = [...landscapes];
  const oPool = [...squaresAndOthers];

  const orderedImages: string[] = [];

  // Mở đầu bằng tấm ảnh bìa nếu có
  if (bestCover) {
    orderedImages.push(bestCover);
    const pIdx = pPool.findIndex((it) => it.url === bestCover);
    if (pIdx !== -1) pPool.splice(pIdx, 1);
    const lIdx = lPool.findIndex((it) => it.url === bestCover);
    if (lIdx !== -1) lPool.splice(lIdx, 1);
  }

  // Đan xen nhịp nhàng: 1 Landscape -> 2 Portrait -> 1 Landscape -> 2 Portrait...
  while (pPool.length > 0 || lPool.length > 0 || oPool.length > 0) {
    if (orderedImages.length % 3 === 0) {
      if (lPool.length > 0) orderedImages.push(lPool.shift()!.url);
      else if (pPool.length > 0) orderedImages.push(pPool.shift()!.url);
      else if (oPool.length > 0) orderedImages.push(oPool.shift()!.url);
    } else {
      if (pPool.length > 0) orderedImages.push(pPool.shift()!.url);
      else if (lPool.length > 0) orderedImages.push(lPool.shift()!.url);
      else if (oPool.length > 0) orderedImages.push(oPool.shift()!.url);
    }
  }

  // Tiêu đề & metadata tự nhiên từ tên thư mục
  const cleanName = (folderName || 'Chuyện Tình Mùa Yêu').replace(/[-_]/g, ' ').trim();
  const title = cleanName
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  const slug = slugify(cleanName);

  return {
    title: title || 'Bộ Sưu Tập Cưới Điện Ảnh',
    slug: slug || 'bo-suu-tap-cuoi-dien-anh',
    subtitle: 'Khoảnh khắc tình yêu tinh khôi & ánh sáng điện ảnh vượt thời gian',
    concept: 'Pre-Wedding Luxury',
    location: 'Studio & Ngoại cảnh PlusMoments',
    coupleNames: 'Hai bạn uyên ương',
    description: `Bộ ảnh cưới "${title}" được PlusMoments ghi lại trọn vẹn từng khoảnh khắc rung cảm tinh khôi và ánh mắt yêu thương đong đầy của đôi bạn uyên ương. Dưới lăng kính nghệ thuật điện ảnh kết hợp ánh sáng tự nhiên tinh tế, từng khung hình như một bản tình ca dịu êm dành riêng cho ngày trọng đại.`,
    seoTitle: `${title} | PlusMoments`,
    seoDescription: `Bộ sưu tập ảnh cưới ${title} tại PlusMoments Studio. Phong cách Luxury, ánh sáng điện ảnh và cảm xúc tự nhiên vượt thời gian.`,
    bestCoverUrl: bestCover,
    coverReason: bestCoverReason,
    orderedImages,
    imagesMetadata: images.map((img) => ({
      alt: `${title} - Ảnh cưới nghệ thuật | PlusMoments`,
      caption: '',
    })),
  };
}

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { type = 'BLOG', images, folderName, folderSlug } = body;

    const rawList: any[] = Array.isArray(images) ? images : [];
    if (rawList.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng chọn hoặc tải lên ít nhất 1 ảnh trước khi kích hoạt AI.' },
        { status: 400 }
      );
    }

    // Chuẩn hóa danh sách ảnh đầu vào kèm thông số kích thước & hướng ảnh
    const normalizedImages: NormalizedImageItem[] = [];
    for (const item of rawList) {
      const url = typeof item === 'string' ? item : item?.url || '';
      if (!url || !url.trim()) continue;
      const id = typeof item === 'object' ? item?.id : undefined;
      const width = typeof item === 'object' && typeof item?.width === 'number' ? item.width : undefined;
      const height = typeof item === 'object' && typeof item?.height === 'number' ? item.height : undefined;
      let orientation: 'landscape' | 'portrait' | 'square' = 'landscape';

      if (typeof item === 'object' && item?.orientation) {
        orientation = item.orientation;
      } else if (width && height) {
        if (width > height) orientation = 'landscape';
        else if (height > width) orientation = 'portrait';
        else orientation = 'square';
      }

      const filename = typeof item === 'object' ? item?.filename || item?.name : path.basename(url);

      normalizedImages.push({
        url: url.trim(),
        id,
        width,
        height,
        orientation,
        filename,
      });
    }

    if (normalizedImages.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Danh sách ảnh không hợp lệ.' },
        { status: 400 }
      );
    }

    // 1. Fetch system settings for Gemini AI
    const setting = await prisma.systemSetting.findUnique({
      where: { id: 'default' },
    });

    const apiKey = setting?.geminiApiKey?.trim() || process.env.GEMINI_API_KEY || '';

    // Cơ chế Fallback Thông Minh: Nếu không có API key và yêu cầu là ALBUM, trả về thuật toán Curation Heuristic ngay
    if (!apiKey) {
      if (type === 'ALBUM') {
        const fallbackResult = curateAlbumFallback(normalizedImages, folderName);
        return NextResponse.json({
          success: true,
          data: fallbackResult,
          isFallback: true,
          notice: 'Đã hoàn tất giám định ảnh bìa & sắp xếp bố cục Masonry bằng thuật toán thông minh.',
        });
      }
      return NextResponse.json(
        {
          success: false,
          message:
            'Chưa cấu hình Google Gemini API Key. Vui lòng vào Cài Đặt (/admin/settings) -> Tab Gemini AI để nhập API Key.',
        },
        { status: 400 }
      );
    }

    const preferredModel = (setting?.geminiModel || 'gemini-3.1-flash-lite').replace(/^models\//, '').trim();
    const candidateModels = [
      preferredModel,
      'gemini-3.1-flash-lite',
      'gemini-3.5-flash-lite',
      'gemini-flash-lite-latest',
      'gemini-3-flash-preview',
      'gemini-3.8-flash',
    ].filter((m, idx, arr) => m && !m.includes('2.5') && !m.includes('2.0') && !m.includes('1.5') && arr.indexOf(m) === idx);

    const temperature = setting?.geminiTemperature !== undefined ? Number(setting.geminiTemperature) : 0.7;

    // 2. Thu thập ngữ cảnh thị giác: Phân tích tối đa 12 ảnh đại diện để tối ưu tốc độ gọi Vision API
    const sampleLimit = Math.min(normalizedImages.length, 12);
    const visualContextLines: string[] = [];
    const chunks: Array<VisionAIChunk | null> = [];

    for (let i = 0; i < normalizedImages.length; i++) {
      const item = normalizedImages[i];
      let chunk: VisionAIChunk | null = null;

      // Phân tích Vision cho 12 ảnh mẫu hoặc dùng cache DB có sẵn
      if (i < sampleLimit) {
        chunk = await getOrAnalyzeImageChunk(item.url, item.id);
      }
      chunks.push(chunk);

      const orientationLabel = item.orientation === 'portrait' ? 'Ảnh Dọc (Portrait)' : item.orientation === 'landscape' ? 'Ảnh Ngang (Landscape)' : 'Ảnh Vuông';
      const dimLabel = item.width && item.height ? `${item.width}x${item.height}` : '';

      if (chunk) {
        visualContextLines.push(
          `- [Ảnh #${i + 1}] [${orientationLabel}${dimLabel ? ` ${dimLabel}` : ''}] (URL: "${item.url}"): ${chunk.visualDescription} (Chủ thể: ${chunk.mainSubject}, Tone/Ánh sáng: ${chunk.colorMood})`
        );
      } else {
        visualContextLines.push(
          `- [Ảnh #${i + 1}] [${orientationLabel}${dimLabel ? ` ${dimLabel}` : ''}] (URL: "${item.url}"): Khoảnh khắc cưới nghệ thuật tại PlusMoments`
        );
      }
    }

    const visualSummaryText = visualContextLines.join('\n');

    // 3. Build Prompt based on Target Type: ALBUM (Full-Folder Curation) or BLOG
    let systemPrompt = '';

    if (type === 'ALBUM') {
      systemPrompt = `Bạn là Giám đốc Sáng tạo (Creative Director) kiêm Chuyên gia Nghệ thuật Bố cục của studio ảnh cưới cao cấp PlusMoments (plusmoments.vn).
Studio định vị phong cách: Luxury, Minimalist, Cảm xúc chân thực & Ánh sáng điện ảnh Cinematic Art.

Dưới đây là danh sách đầy đủ ${normalizedImages.length} bức ảnh thực tế vừa được tải lên từ thư mục "${folderName || 'Bộ sưu tập cưới'}":
${visualSummaryText}

NHIỆM VỤ GIÁM ĐỊNH & DÀN TRANG ALBUM (FULL-FOLDER AI CURATION):
1. CHỌN ẢNH BÌA ĐẠI DIỆN (bestCoverUrl & coverReason):
   - Đánh giá toàn bộ các ảnh và chọn ra DUY NHẤT 1 tấm ảnh xuất sắc nhất làm Ảnh Bìa Đại Diện cho Album.
   - Tiêu chí: Bố cục cân đối (ưu tiên ảnh dọc portrait hoặc toàn cảnh ngoạn mục), gương mặt/nụ cười/biểu cảm của cô dâu chú rể ngập tràn hạnh phúc và rõ nét, ánh sáng sang trọng, trang phục hoàn mỹ, không bị mờ nhòe hay cắt góc.
   - Viết 1 câu giải thích ngắn gọn (coverReason, dưới 35 từ) vì sao chọn tấm này làm bìa.

2. SẮP XẾP BỐ CỤC TOÀN BỘ ẢNH (orderedImages):
   - Sắp xếp lại danh sách ĐẦY ĐỦ ${normalizedImages.length} URL ảnh theo 2 nguyên tắc bắt buộc:
     a) Mạch kể chuyện cảm xúc (Storytelling Arc): Mở đầu ấn tượng / Thiết lập không gian -> Chuẩn bị & Chi tiết tinh tế (váy, hoa, nhẫn) -> Khoảnh khắc nghi lễ / Cảm xúc cao trào -> Khép lại bằng những bức chân dung lãng mạn, ngọt ngào.
     b) Nhịp điệu lưới Masonry (Visual Rhythm): Phân bổ xen kẽ hài hòa giữa Ảnh Ngang (Landscape) và Ảnh Dọc (Portrait) để khi hiển thị ra lưới Masonry gallery các cột ảnh khớp chiều cao đẹp mắt, TUYỆT ĐỐI KHÔNG dồn 4-5 ảnh cùng chiều liên tiếp.

3. SÁNG TÁC METADATA:
   - Tự đặt Tên Album nghệ thuật (title), slug chuẩn SEO, lời tựa (subtitle <15 từ), concept, địa điểm, tên dâu rể, câu chuyện tình yêu (description 150-250 từ), thẻ SEO (seoTitle, seoDescription).

YÊU CẦU ĐỊNH DẠNG ĐẦU RA DUY NHẤT LÀ MỘT KHỐI JSON HỢP LỆ (KHÔNG bọc markdown backticks):
{
  "bestCoverUrl": "URL chính xác của bức ảnh xuất sắc nhất làm bìa (phải là 1 trong các URL được cung cấp)",
  "coverReason": "1 câu ngắn gọn lý do chọn bức ảnh này làm bìa",
  "orderedImages": [
    "URL_1",
    "URL_2"
    ... đủ ${normalizedImages.length} URL ảnh theo thứ tự bố cục mới ...
  ],
  "title": "Tên album nghệ thuật và gợi cảm",
  "slug": "slug-tieng-viet-khong-dau-chuan-seo",
  "subtitle": "Câu định vị phong cách ngắn gọn dưới 15 từ",
  "concept": "Gợi ý concept (ví dụ: 'Outdoor Luxury', 'Studio Editorial', 'Pre-Wedding Cinematic', 'Minimalist Modern')",
  "location": "Gợi ý địa điểm chụp nhận diện từ ảnh",
  "coupleNames": "Tên gợi ý cho cặp đôi uyên ương",
  "description": "Câu chuyện tình yêu / Lời tựa đề tài giàu cảm xúc dài khoảng 150-250 từ...",
  "seoTitle": "Tiêu đề chuẩn Google SEO dưới 65 ký tự kết thúc bằng ' | PlusMoments'",
  "seoDescription": "Đoạn mô tả Google Meta Description dưới 160 ký tự",
  "images": [
    { "index": 0, "alt": "Thẻ ALT mô tả ảnh 1", "caption": "Chú thích ảnh 1" }
  ]
}`;
    } else {
      // Type is BLOG
      systemPrompt = `Bạn là Giám đốc Sáng tạo kiêm Chuyên gia SEO hàng đầu của studio ảnh cưới cao cấp PlusMoments (plusmoments.vn).
Studio định vị phong cách: Luxury, Minimalist, Cảm xúc chân thực & Ánh sáng điện ảnh Cinematic Art.

Dưới đây là mô tả trực quan của các bức ảnh cưới thực tế:
${visualSummaryText}

Dựa HOÀN TOÀN vào các bức ảnh trên, hãy TỰ NGHĨ RA TIÊU ĐỀ NGHỆ THUẬT VÀ NỘI DUNG HOÀN CHỈNH CHO BÀI VIẾT.
YÊU CẦU ĐỊNH DẠNG ĐẦU RA DUY NHẤT LÀ MỘT KHỐI JSON HỢP LỆ:
{
  "title": "Tiêu đề bài viết nghệ thuật (không quá 70 ký tự)",
  "slug": "slug-tieng-viet-khong-dau-chuan-seo",
  "excerpt": "Đoạn giới thiệu ngắn 2-3 câu đầy chất thơ (khoảng 140 - 180 ký tự)...",
  "content": "Nội dung bài viết chi tiết dài khoảng 600-900 từ định dạng HTML an toàn (<p>, <h2>, <h3>, <ul>, <li>), có lồng ghép shortcode [image:1], [image:2]...",
  "category": "Gợi ý danh mục (ví dụ: 'Cẩm nang cưới', 'Kinh nghiệm chụp ảnh', 'Xu hướng cưới')",
  "seoTitle": "Tiêu đề chuẩn Google SEO dưới 65 ký tự kết thúc bằng ' | PlusMoments'",
  "seoDescription": "Đoạn mô tả Google Meta Description dưới 160 ký tự",
  "images": [
    { "index": 0, "alt": "Thẻ ALT mô tả ảnh 1 chuẩn Google Image SEO", "caption": "Chú thích lãng mạn dưới ảnh 1" }
  ]
}`;
    }

    // 4. Call Google Gemini with automatic model fallback
    let parsed: any = null;
    let lastErrorMsg = '';

    for (const modelName of candidateModels) {
      try {
        const googleEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent?key=${encodeURIComponent(apiKey)}`;

        const res = await fetch(googleEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
            generationConfig: { temperature, responseMimeType: 'application/json' },
          }),
          signal: AbortSignal.timeout(18000),
        });

        const resData = await res.json().catch(() => null);

        if (!res.ok || !resData) {
          lastErrorMsg = resData?.error?.message || `Lỗi từ Gemini AI API (HTTP ${res.status})`;
          console.warn(`[AUTO_GEN_WARN] Model ${modelName} returned error: ${lastErrorMsg}. Trying fallback...`);
          continue;
        }

        const rawText = resData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const jsonResult = extractJson(rawText);

        if (jsonResult) {
          parsed = jsonResult;
          break;
        }
      } catch (err: any) {
        lastErrorMsg = err.message || 'Timeout / Network error';
        console.warn(`[AUTO_GEN_WARN] Model ${modelName} invocation failed: ${lastErrorMsg}. Trying fallback...`);
      }
    }

    // Nếu Gemini API gặp lỗi hoặc timeout nhưng đang ở tác vụ ALBUM -> Kích hoạt ngay Heuristic Curation Fallback
    if (!parsed) {
      if (type === 'ALBUM') {
        console.warn('[AI_ALBUM] Gemini failed or timed out. Activating smart heuristic fallback curation.');
        const fallbackResult = curateAlbumFallback(normalizedImages, folderName);
        return NextResponse.json({
          success: true,
          data: fallbackResult,
          isFallback: true,
          notice: 'Đã hoàn tất giám định ảnh bìa & sắp xếp bố cục Masonry bằng thuật toán thông minh.',
        });
      }

      return NextResponse.json(
        { success: false, message: lastErrorMsg || 'Không thể tạo nội dung từ AI. Vui lòng thử lại sau.' },
        { status: 500 }
      );
    }

    // 5. Chuẩn hóa & Xác thực kết quả từ Gemini đối với ALBUM
    const allInputUrls = normalizedImages.map((it) => it.url);

    // Xác thực bestCoverUrl: phải nằm trong danh sách URL thực tế
    let finalCoverUrl = parsed.bestCoverUrl?.trim();
    if (!finalCoverUrl || !allInputUrls.includes(finalCoverUrl)) {
      // Fallback về ảnh điểm cao nhất từ thuật toán
      const fallbackEngine = curateAlbumFallback(normalizedImages, folderName);
      finalCoverUrl = fallbackEngine.bestCoverUrl;
    }

    const finalCoverReason =
      (parsed.coverReason || '').trim() ||
      'Khung hình nổi bật nhất với bố cục cân đối và ánh sáng sang trọng.';

    // Xác thực orderedImages: phải bảo toàn 100% tất cả ảnh đầu vào (không bỏ sót ảnh nào)
    let finalOrderedImages: string[] = [];
    if (Array.isArray(parsed.orderedImages) && parsed.orderedImages.length > 0) {
      // Lọc các URL hợp lệ từ AI
      const seen = new Set<string>();
      for (const u of parsed.orderedImages) {
        if (typeof u === 'string' && allInputUrls.includes(u.trim()) && !seen.has(u.trim())) {
          seen.add(u.trim());
          finalOrderedImages.push(u.trim());
        }
      }
      // Bổ sung các ảnh mà AI có thể đã bỏ sót
      for (const u of allInputUrls) {
        if (!seen.has(u)) {
          seen.add(u);
          finalOrderedImages.push(u);
        }
      }
    } else {
      const fallbackEngine = curateAlbumFallback(normalizedImages, folderName);
      finalOrderedImages = fallbackEngine.orderedImages;
    }

    const finalTitle = (parsed.title || '').trim() || (type === 'ALBUM' ? (folderName || 'Khoảnh Khắc Cưới Tinh Khôi') : 'Cẩm Nang Cưới Hiện Đại');
    const finalSlug = slugify(parsed.slug || finalTitle);

    const imagesMetadata: Array<{ alt: string; caption: string }> = [];
    for (let i = 0; i < normalizedImages.length; i++) {
      const generated = Array.isArray(parsed.images)
        ? parsed.images.find((it: any) => it.index === i || it.imageIndex === i)
        : null;
      const chunk = chunks[i];

      let alt = generated?.alt?.trim();
      let caption = generated?.caption?.trim();

      if (!alt) {
        const subject = chunk?.mainSubject || chunk?.suggestedAlt || 'Ảnh cưới nghệ thuật';
        alt = `${subject} - ${finalTitle} | PlusMoments`.slice(0, 95);
      }

      if (!caption) {
        caption = chunk?.suggestedCaption || (chunk?.mainSubject ? `${chunk.mainSubject} (${chunk.colorMood})` : '');
      }

      imagesMetadata.push({ alt, caption });
    }

    const resultPayload = {
      ...parsed,
      title: finalTitle,
      slug: finalSlug,
      bestCoverUrl: finalCoverUrl,
      coverReason: finalCoverReason,
      orderedImages: finalOrderedImages,
      imagesMetadata,
      seoTitle: parsed.seoTitle || `${finalTitle} | PlusMoments`,
      seoDescription: parsed.seoDescription || parsed.excerpt || parsed.description || '',
    };

    return NextResponse.json({
      success: true,
      data: resultPayload,
    });
  } catch (error: any) {
    console.error('[AUTO_GENERATE_FROM_IMAGES_ERROR]:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi khi tự động phân tích ảnh và điền dữ liệu.' },
      { status: 500 }
    );
  }
}
