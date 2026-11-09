import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrAnalyzeImageChunk, VisionAIChunk } from '@/lib/vision-ai';

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

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { type = 'BLOG', images } = body;

    const imgList: Array<{ url: string; id?: string }> = Array.isArray(images) ? images : [];
    if (imgList.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng chọn hoặc tải lên ít nhất 1 ảnh trước khi kích hoạt AI.' },
        { status: 400 }
      );
    }

    // 1. Fetch system settings for Gemini
    const setting = await prisma.systemSetting.findUnique({
      where: { id: 'default' },
    });

    const apiKey = setting?.geminiApiKey?.trim() || process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
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

    // 2. Scan / collect Vision AI chunks for all images
    const visualContextLines: string[] = [];
    const chunks: Array<VisionAIChunk | null> = [];

    for (let i = 0; i < imgList.length; i++) {
      const item = imgList[i];
      const url = typeof item === 'string' ? item : item.url;
      const id = typeof item === 'object' ? item.id : undefined;

      let chunk: VisionAIChunk | null = null;
      if (url) {
        chunk = await getOrAnalyzeImageChunk(url, id);
      }
      chunks.push(chunk);

      if (chunk) {
        visualContextLines.push(
          `- Ảnh [image:${i + 1}]: ${chunk.visualDescription} (Chủ thể: ${chunk.mainSubject}, Tone/Ánh sáng: ${chunk.colorMood})`
        );
      } else {
        visualContextLines.push(`- Ảnh [image:${i + 1}]: Khoảnh khắc chụp ảnh cưới nghệ thuật tại PlusMoments Studio`);
      }
    }

    const visualSummaryText = visualContextLines.join('\n');

    // 3. Build Prompt based on Target Type: BLOG or ALBUM
    let systemPrompt = '';

    if (type === 'ALBUM') {
      systemPrompt = `Bạn là Giám đốc Sáng tạo kiêm Chuyên gia SEO hàng đầu của studio ảnh cưới cao cấp PlusMoments (plusmoments.vn).
Studio định vị phong cách: Luxury, Minimalist, Cảm xúc chân thực & Ánh sáng điện ảnh Cinematic Art.

Dưới đây là mô tả trực quan của toàn bộ các bức ảnh cưới thực tế trong bộ sưu tập này:
${visualSummaryText}

Dựa HOÀN TOÀN vào các bức ảnh trên (nhận diện địa điểm: Đà Lạt, studio, biển, phố cổ...; concept: Editorial, Hàn Quốc, Cổ điển; trang phục váy cưới, vest; nụ cười và cảm xúc của đôi uyên ương), hãy TỰ SUY NGHĨ VÀ ĐẶT TÊN BỘ ẢNH, SÁNG TÁC CÂU CHUYỆN TÌNH YÊU VÀ ĐIỀN TOÀN BỘ THÔNG TIN CHO ALBUM NÀY. Người dùng không cần phải nhập trước tiêu đề.

YÊU CẦU ĐỊNH DẠNG ĐẦU RA DUY NHẤT LÀ MỘT KHỐI JSON HỢP LỆ (KHÔNG bọc markdown backticks):
{
  "title": "Tên album nghệ thuật và gợi cảm (ví dụ: 'Chuyện Tình Mùa Thu Tại Rừng Thông Đà Lạt - Hoàng & Thảo' hoặc 'Minimalist Elegance in Seoul Studio')",
  "slug": "slug-tieng-viet-khong-dau-chuan-seo",
  "subtitle": "Câu định vị phong cách ngắn gọn dưới 15 từ (ví dụ: 'Khoảnh khắc ngọt ngào tự nhiên giữa rừng thông đại ngàn')",
  "concept": "Gợi ý concept (ví dụ: 'Outdoor Luxury', 'Studio Editorial', 'Pre-Wedding Cinematic', 'Minimalist Modern')",
  "location": "Gợi ý địa điểm chụp nhận diện từ ảnh (ví dụ: 'Đà Lạt', 'Studio PlusMoments', 'Vĩnh Hy', 'Hồ Cốc')",
  "coupleNames": "Tên gợi ý cho cặp đôi uyên ương (ví dụ: 'Hoàng & Thảo', 'Khánh & Vy')",
  "description": "Câu chuyện tình yêu / Lời tựa đề tài giàu cảm xúc, đẹp như thơ dài khoảng 150-250 từ giới thiệu bộ ảnh cưới này tại PlusMoments Studio...",
  "seoTitle": "Tiêu đề chuẩn Google SEO dưới 65 ký tự kết thúc bằng ' | PlusMoments'",
  "seoDescription": "Đoạn mô tả Google Meta Description dưới 160 ký tự",
  "images": [
    { "index": 0, "alt": "Thẻ ALT mô tả ảnh 1 chuẩn Google Image SEO", "caption": "Chú thích lãng mạn dưới ảnh 1" }
  ]
}`;
    } else {
      // Type is BLOG
      systemPrompt = `Bạn là Giám đốc Sáng tạo kiêm Chuyên gia SEO hàng đầu của studio ảnh cưới cao cấp PlusMoments (plusmoments.vn).
Studio định vị phong cách: Luxury, Minimalist, Cảm xúc chân thực & Ánh sáng điện ảnh Cinematic Art.

Dưới đây là mô tả trực quan của các bức ảnh cưới thực tế vừa được tải lên cho một bài viết Cẩm Nang Cưới / Phóng Sự Cưới:
${visualSummaryText}

Dựa HOÀN TOÀN vào các bức ảnh trên (nhận diện phong cách chụp, trang phục váy cưới, phụ kiện, bối cảnh, cảm xúc), hãy TỰ NGHĨ RA TIÊU ĐỀ NGHỆ THUẬT VÀ NỘI DUNG HOÀN CHỈNH CHO BÀI VIẾT. Người dùng không cần phải nhập trước tiêu đề.

YÊU CẦU ĐỊNH DẠNG ĐẦU RA DUY NHẤT LÀ MỘT KHỐI JSON HỢP LỆ (KHÔNG bọc markdown backticks):
{
  "title": "Tiêu đề bài viết nghệ thuật, sang trọng và cuốn hút (không quá 70 ký tự, ví dụ: 'Bí Quyết Chọn Váy Cưới Tối Giản Tinh Khôi Cho Nàng Dâu Hiện Đại')",
  "slug": "slug-tieng-viet-khong-dau-chuan-seo",
  "excerpt": "Đoạn giới thiệu ngắn 2-3 câu đầy chất thơ và sang trọng (khoảng 140 - 180 ký tự)...",
  "content": "Nội dung bài viết chi tiết dài khoảng 600-900 từ định dạng HTML an toàn (<p>, <h2>, <h3>, <ul>, <li>), có lồng ghép các shortcode [image:1], [image:2]... vào đúng các đoạn văn miêu tả khoảnh khắc tương ứng.",
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
          signal: AbortSignal.timeout(15000),
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

    if (!parsed) {
      return NextResponse.json(
        { success: false, message: lastErrorMsg || 'Không thể tạo nội dung từ AI. Vui lòng thử lại sau.' },
        { status: 500 }
      );
    }

    // 5. Ensure slug is clean and images metadata is complete for all images
    const finalTitle = (parsed.title || '').trim() || (type === 'ALBUM' ? 'Khoảnh Khắc Cưới Tinh Khôi' : 'Cẩm Nang Cưới Hiện Đại');
    const finalSlug = slugify(parsed.slug || finalTitle);

    const imagesMetadata: Array<{ alt: string; caption: string }> = [];
    for (let i = 0; i < imgList.length; i++) {
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
