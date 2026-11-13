import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrAnalyzeImageChunk, VisionAIChunk } from '@/lib/vision-ai';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function extractJsonFromText(text: string): any {
  if (!text) return null;

  // 1. Clean JSON parse directly
  try {
    return JSON.parse(text.trim());
  } catch {}

  // 2. Extract from markdown code block ```json ... ``` or ``` ... ```
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {}
  }

  // 3. Extract the first {...}
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(text.substring(firstBrace, lastBrace + 1));
    } catch {}
  }

  // 4. Extract the first [...]
  const firstBracket = text.indexOf('[');
  const lastBracket = text.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    try {
      return JSON.parse(text.substring(firstBracket, lastBracket + 1));
    } catch {}
  }

  return null;
}

function formatAltTextFromChunk(chunk: VisionAIChunk, postTitle: string, index?: number): string {
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
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { action, title, postTitle, category, imageCount, imageIndex, mediaId, imageUrl, images } = body;

    const effectiveTitle = (title || postTitle || '').trim();

    // 1. Fetch system settings for Gemini API Key and Model configuration
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

    // -------------------------------------------------------------------------
    // ACTION 1: generate_single_alt (Fast Context-Aware Alt Text from Cached Vision Chunk)
    // -------------------------------------------------------------------------
    if (action === 'generate_single_alt' || (action === 'generate_alt_text' && (imageUrl || mediaId))) {
      const targetUrl = (imageUrl || '').trim();
      const targetMediaId = mediaId || null;

      let chunk: VisionAIChunk | null = null;
      if (targetUrl || targetMediaId) {
        chunk = await getOrAnalyzeImageChunk(targetUrl, targetMediaId);
      }

      if (chunk) {
        const altText = formatAltTextFromChunk(chunk, effectiveTitle, imageIndex);
        const caption = chunk.suggestedCaption || (chunk.mainSubject ? `${chunk.mainSubject} (${chunk.colorMood})` : '');

        return NextResponse.json({
          success: true,
          cached: true,
          altText,
          caption,
          altTexts: [altText],
          aiChunk: chunk,
        });
      }

      // Fallback if Vision analysis failed
      const fallbackAlt = effectiveTitle
        ? `Khoảnh khắc chụp ảnh cưới ${effectiveTitle} tại PlusMoments #${(imageIndex ?? 0) + 1}`
        : 'Ảnh cưới phong cách sang trọng, tối giản tại PlusMoments Studio';

      return NextResponse.json({
        success: true,
        cached: false,
        altText: fallbackAlt,
        caption: '',
        altTexts: [fallbackAlt],
      });
    }

    // -------------------------------------------------------------------------
    // ACTION 2: generate_all_alt (Context-Aware Alt Text for Entire Gallery)
    // -------------------------------------------------------------------------
    if (action === 'generate_all_alt' || (action === 'generate_alt_text' && Array.isArray(images) && images.length > 0)) {
      const imgList: Array<{ url: string; id?: string }> = Array.isArray(images) ? images : [];
      const results: Array<{ altText: string; caption: string; aiChunk?: VisionAIChunk | null }> = [];

      for (let i = 0; i < imgList.length; i++) {
        const item = imgList[i];
        const url = typeof item === 'string' ? item : item.url;
        const id = typeof item === 'object' ? item.id : undefined;

        let chunk: VisionAIChunk | null = null;
        if (url) {
          chunk = await getOrAnalyzeImageChunk(url, id);
        }

        if (chunk) {
          const altText = formatAltTextFromChunk(chunk, effectiveTitle, i);
          const caption = chunk.suggestedCaption || (chunk.mainSubject ? `${chunk.mainSubject} (${chunk.colorMood})` : '');
          results.push({ altText, caption, aiChunk: chunk });
        } else {
          const alt = effectiveTitle
            ? `${effectiveTitle} - Khoảnh khắc cưới PlusMoments Studio #${i + 1}`
            : `Ảnh cưới nghệ thuật PlusMoments Studio #${i + 1}`;
          results.push({ altText: alt, caption: '' });
        }
      }

      return NextResponse.json({
        success: true,
        results,
        altTexts: results.map((r) => r.altText),
        captions: results.map((r) => r.caption),
      });
    }

    // -------------------------------------------------------------------------
    // ACTION 3: generate_blog (Context-Aware Article Generation Using Vision Chunks)
    // -------------------------------------------------------------------------
    if (action === 'generate_blog') {
      if (!effectiveTitle) {
        return NextResponse.json(
          { success: false, message: 'Vui lòng nhập tiêu đề bài viết trước khi gọi AI' },
          { status: 400 }
        );
      }

      // Collect all visual chunks from the images attached to this post
      let visualContextPrompt = '';
      const imageList = Array.isArray(images) ? images : [];

      if (imageList.length > 0) {
        const urls = imageList.map((item: any) => (typeof item === 'string' ? item : item.url)).filter(Boolean);
        const mediaFiles = await prisma.mediaFile.findMany({
          where: { url: { in: urls } },
          select: { url: true, aiContextChunk: true },
        });

        const contextLines: string[] = [];
        urls.forEach((url: string, idx: number) => {
          const mf = mediaFiles.find((m) => m.url === url);
          const chunk = mf?.aiContextChunk as any;
          if (chunk && (chunk.visualDescription || chunk.mainSubject)) {
            contextLines.push(
              `- [image:${idx + 1}]: ${chunk.visualDescription} (Chủ thể chính: ${chunk.mainSubject}, Bối cảnh/Tone màu: ${chunk.colorMood})`
            );
          }
        });

        if (contextLines.length > 0) {
          visualContextPrompt = `\n\nTHÔNG TIN NGỮ CẢNH CÁC BỨC ẢNH THỰC TẾ TRONG BỘ SƯU TẬP NÀY:
${contextLines.join('\n')}
YÊU CẦU ĐẶC BIỆT: Hãy đọc kỹ mô tả chi tiết của từng bức ảnh trên và xây dựng mạch văn bài viết ăn khớp 100% với từng chi tiết thực tế của bộ ảnh. Hãy nhắc đến và miêu tả từng khoảnh khắc này một cách tự nhiên, tinh tế, chạm đến cảm xúc dâu rể và gán đúng shortcode [image:X] vào đoạn văn tương ứng.`;
        }
      }

      const totalImages = Number(imageCount) > 0 ? Number(imageCount) : Math.max(imageList.length, 3);
      const systemPrompt = `Bạn là chuyên gia Content Creator & SEO cho studio ảnh cưới cao cấp PlusMoments (plusmoments.vn). 
Hãy viết một bài viết blog chất lượng cao dựa trên tiêu đề: "${effectiveTitle}", thuộc thể loại: "${category || 'Cẩm nang cưới'}".${visualContextPrompt}
${!visualContextPrompt ? `Bài viết dự kiến sẽ đi kèm khoảng ${totalImages} bức ảnh portfolio cưới.` : ''}

Yêu cầu định dạng đầu ra dạng JSON:
{
  "excerpt": "Đoạn tóm tắt ngắn 2-3 câu quyến rũ, tinh tế cho bài viết (khoảng 140-180 ký tự), chạm đến cảm xúc của dâu rể...",
  "content": "Nội dung bài viết chi tiết, dài khoảng 600-900 từ, có các thẻ <h2>, <h3>, <p>, tự động đính kèm các thẻ [image:1], [image:2]... xen kẽ hợp lý giữa các phân đoạn."
}
Lưu ý: Chỉ trả về JSON hợp lệ, không thêm bất kỳ văn bản giải thích nào ngoài khối JSON.`;

      let parsed: any = null;
      let rawText = '';
      let lastErrMsg = '';

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
            lastErrMsg = resData?.error?.message || `Lỗi từ Gemini API (HTTP ${res.status})`;
            console.warn(`[GEN_BLOG_WARN] Model ${modelName} returned error: ${lastErrMsg}. Trying fallback...`);
            continue;
          }

          rawText = resData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const jsonResult = extractJsonFromText(rawText);
          if (jsonResult) {
            parsed = jsonResult;
            break;
          }
        } catch (err: any) {
          lastErrMsg = err.message || 'Timeout / Network error';
          console.warn(`[GEN_BLOG_WARN] Model ${modelName} call failed: ${lastErrMsg}. Trying fallback...`);
        }
      }

      if (!parsed && !rawText) {
        return NextResponse.json({ success: false, message: lastErrMsg || 'Không thể tạo nội dung từ AI.' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        data: {
          excerpt: parsed?.excerpt || `Khám phá ${effectiveTitle} cùng PlusMoments Studio.`,
          content: parsed?.content || rawText || `<p>${effectiveTitle}</p>`,
        },
      });
    }

    // -------------------------------------------------------------------------
    // ACTION 4: Legacy generate_alt_text (text-only prompt without image)
    // -------------------------------------------------------------------------
    if (action === 'generate_alt_text') {
      const blogTitle = (effectiveTitle || 'Ảnh cưới nghệ thuật PlusMoments').trim();
      const count = Number(imageCount) > 0 ? Number(imageCount) : 1;
      const targetIndex = imageIndex !== undefined ? Number(imageIndex) + 1 : null;

      let prompt = '';
      if (targetIndex !== null) {
        prompt = `Tạo 01 chuỗi Alt Text tiếng Việt chuẩn Google Image SEO cho bức ảnh cưới thứ #${targetIndex} của bài viết "${blogTitle}".
Nguyên tắc: Tự nhiên, sang trọng, chứa từ khóa chụp ảnh cưới/studio PlusMoments, độ dài dưới 100 ký tự.
Trả về dạng JSON: {"altText": "Chuỗi alt text chuẩn SEO..."}`;
      } else {
        prompt = `Tạo ${count} chuỗi Alt Text tiếng Việt chuẩn Google Image SEO cho ảnh cưới của bài viết "${blogTitle}".
Nguyên tắc: Tự nhiên, sang trọng, chứa từ khóa chụp ảnh cưới/studio PlusMoments, độ dài dưới 100 ký tự mỗi ảnh.
Trả về dạng mảng JSON: ["Alt text 1", "Alt text 2", ...]`;
      }

      let parsed: any = null;
      let rawText = '';
      let lastErrMsg = '';

      for (const modelName of candidateModels) {
        try {
          const googleEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent?key=${encodeURIComponent(apiKey)}`;

          const res = await fetch(googleEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: { temperature, responseMimeType: 'application/json' },
            }),
            signal: AbortSignal.timeout(12000),
          });

          const resData = await res.json().catch(() => null);

          if (!res.ok || !resData) {
            lastErrMsg = resData?.error?.message || `Lỗi kết nối Gemini API (Mã: ${res.status})`;
            console.warn(`[GEN_ALT_WARN] Model ${modelName} returned error: ${lastErrMsg}. Trying fallback...`);
            continue;
          }

          rawText = resData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const jsonResult = extractJsonFromText(rawText);
          if (jsonResult) {
            parsed = jsonResult;
            break;
          }
        } catch (err: any) {
          lastErrMsg = err.message || 'Timeout / Network error';
          console.warn(`[GEN_ALT_WARN] Model ${modelName} call failed: ${lastErrMsg}. Trying fallback...`);
        }
      }

      if (!parsed && !rawText) {
        return NextResponse.json(
          { success: false, message: lastErrMsg || 'Lỗi khi tạo alt text bằng AI' },
          { status: 500 }
        );
      }

      if (targetIndex !== null) {
        const altText = parsed?.altText || (Array.isArray(parsed) ? parsed[0] : rawText.trim());
        return NextResponse.json({
          success: true,
          altText: altText || `${blogTitle} - PlusMoments #${targetIndex}`,
          altTexts: [altText || `${blogTitle} - PlusMoments #${targetIndex}`],
        });
      }

      let parsedList: string[] = [];
      if (Array.isArray(parsed)) {
        parsedList = parsed.map((item) => String(item).trim());
      } else if (parsed && typeof parsed === 'object') {
        parsedList = Object.values(parsed).map((item) => String(item).trim());
      } else {
        parsedList = [rawText.trim()];
      }

      while (parsedList.length < count) {
        const idx = parsedList.length + 1;
        parsedList.push(`${blogTitle} - Khoảnh khắc cưới PlusMoments Studio #${idx}`);
      }

      return NextResponse.json({
        success: true,
        altTexts: parsedList.slice(0, count),
        altText: parsedList[0] || '',
      });
    }

    return NextResponse.json({ success: false, message: 'Hành động không hợp lệ' }, { status: 400 });
  } catch (error: any) {
    console.error('API /admin/ai/generate error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Lỗi xử lý AI' }, { status: 500 });
  }
}
