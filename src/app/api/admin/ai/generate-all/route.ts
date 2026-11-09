import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrAnalyzeImageChunk, VisionAIChunk } from '@/lib/vision-ai';

export const dynamic = 'force-dynamic';

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

function formatAltText(chunk: VisionAIChunk, postTitle: string, index: number): string {
  const subject = chunk.mainSubject || chunk.suggestedAlt || 'Ảnh cưới nghệ thuật';
  const cleanTitle = (postTitle || '').trim();

  let formatted = '';
  if (cleanTitle) {
    formatted = `${subject} - Bộ ảnh cưới ${cleanTitle} tại PlusMoments Studio`;
  } else {
    formatted = `${subject} - PlusMoments Wedding Studio`;
  }

  if (formatted.length > 98) {
    formatted = `${subject} - ${cleanTitle || 'PlusMoments'}`.slice(0, 95) + '...';
  }

  return formatted;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { title, category, images } = body;

    const postTitle = (title || '').trim();
    if (!postTitle) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng nhập tiêu đề bài viết trước khi kích hoạt AI Auto-Complete.' },
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

    // 2. Process all images: get cached vision chunks or scan on-the-fly
    const imageList: Array<{ url: string; id?: string }> = Array.isArray(images) ? images : [];
    const imagesMetadata: Array<{ alt: string; caption: string; visualDescription?: string }> = [];
    const visualContextLines: string[] = [];

    for (let i = 0; i < imageList.length; i++) {
      const item = imageList[i];
      const url = typeof item === 'string' ? item : item.url;
      const id = typeof item === 'object' ? item.id : undefined;

      let chunk: VisionAIChunk | null = null;
      if (url) {
        chunk = await getOrAnalyzeImageChunk(url, id);
      }

      if (chunk) {
        const alt = formatAltText(chunk, postTitle, i);
        const caption =
          chunk.suggestedCaption ||
          (chunk.mainSubject ? `${chunk.mainSubject} (${chunk.colorMood})` : '');
        imagesMetadata.push({ alt, caption, visualDescription: chunk.visualDescription });
        visualContextLines.push(
          `- [image:${i + 1}]: ${chunk.visualDescription} (Chủ thể chính: ${chunk.mainSubject}, Tone/Bối cảnh: ${chunk.colorMood})`
        );
      } else {
        const fallbackAlt = `${postTitle} - Khoảnh khắc ảnh cưới PlusMoments #${i + 1}`;
        imagesMetadata.push({ alt: fallbackAlt, caption: '' });
      }
    }

    // 3. Build unified Master Prompt for Gemini
    let visualContextPrompt = '';
    if (visualContextLines.length > 0) {
      visualContextPrompt = `\n\nDANH SÁCH CHI TIẾT CÁC BỨC ẢNH THỰC TẾ TRONG BỘ SƯU TẬP BÀI VIẾT NÀY:
${visualContextLines.join('\n')}
YÊU CẦU: Hãy đọc kỹ từng khoảnh khắc hình ảnh trên và xây dựng mạch văn bài viết ăn khớp 100% với từng chi tiết thực tế của ảnh (váy cưới, biểu cảm, phụ kiện, ánh sáng...). Hãy lồng ghép đúng mã shortcode [image:X] vào phân đoạn tương ứng miêu tả chi tiết đó một cách tự nhiên và giàu cảm xúc.`;
    }

    const systemPrompt = `Bạn là Giám đốc Sáng tạo, Chuyên gia Biên tập Nội dung & Tối ưu SEO cao cấp của PlusMoments Wedding Studio (plusmoments.vn).
Studio định vị phong cách: Luxury, Minimalist, Cảm xúc chân thực & Ánh sáng điện ảnh Cinematic.

Hãy tự động khởi tạo toàn bộ thông tin bài viết chất lượng cao dựa trên:
- Tiêu đề bài viết: "${postTitle}"
- Chuyên mục: "${category || 'Cẩm nang cưới'}"${visualContextPrompt}
${!visualContextPrompt ? `Bài viết dự kiến sẽ đi kèm khoảng ${Math.max(imageList.length, 3)} bức ảnh cưới.` : ''}

YÊU CẦU ĐỊNH DẠNG ĐẦU RA DUY NHẤT LÀ MỘT KHỐI JSON HỢP LỆ VỚI CÁC TRƯỜNG SAU:
{
  "excerpt": "Đoạn tóm tắt bài viết ngắn 2-3 câu (khoảng 140 - 180 ký tự), lời văn quyến rũ, tinh tế, chạm đến cảm xúc sâu kín của dâu rể.",
  "content": "Nội dung bài viết chi tiết, dài khoảng 700 - 1000 từ, cấu trúc chuẩn HTML với các thẻ <h2>, <h3>, <p>, <ul>, <li>. Đính kèm các mã [image:1], [image:2]... xen kẽ hợp lý giữa các phân đoạn.",
  "seoTitle": "Tiêu đề SEO tối ưu chuẩn Google (dưới 65 ký tự, kết thúc bằng ' | PlusMoments')",
  "seoDescription": "Mô tả SEO meta description tối ưu dưới 160 ký tự, hấp dẫn kích thích click xem ngay."
}
Lưu ý: Chỉ trả về JSON thuần túy, tuyệt đối không thêm lời dẫn nào ngoài JSON.`;

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
          console.warn(`[GEN_ALL_WARN] Model ${modelName} returned error: ${lastErrorMsg}. Trying fallback...`);
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
        console.warn(`[GEN_ALL_WARN] Model ${modelName} invocation failed: ${lastErrorMsg}. Trying fallback...`);
      }
    }

    if (!parsed) {
      return NextResponse.json(
        { success: false, message: lastErrorMsg || 'Không thể tạo nội dung từ AI. Vui lòng thử lại sau.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        excerpt: parsed.excerpt || '',
        content: parsed.content || '',
        imagesMetadata,
        seoTitle: parsed.seoTitle || `${postTitle} | PlusMoments`,
        seoDescription: parsed.seoDescription || parsed.excerpt || '',
      },
    });
  } catch (error: any) {
    console.error('[GENERATE_ALL_API_ERROR]:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi khi tự động tạo toàn bộ dữ liệu.' },
      { status: 500 }
    );
  }
}

