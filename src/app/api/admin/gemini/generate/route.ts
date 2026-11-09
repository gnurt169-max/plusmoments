import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function extractJsonFromText(text: string): any {
  if (!text) return null;
  // Try clean JSON parse directly
  try {
    return JSON.parse(text.trim());
  } catch {}

  // Try extracting from markdown code block ```json ... ```
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch && jsonMatch[1]) {
    try {
      return JSON.parse(jsonMatch[1].trim());
    } catch {}
  }

  // Try extracting the first {...}
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(text.substring(firstBrace, lastBrace + 1));
    } catch {}
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { taskType, promptOverride, model: customModel, temperature: customTemp, tone: customTone } = body;
    const inputContext = { ...body, ...(body.inputContext || {}) };

    if (!taskType) {
      return NextResponse.json(
        { success: false, error: 'Thiếu loại tác vụ (taskType).' },
        { status: 400 }
      );
    }

    // 1. Fetch system settings
    const setting = await prisma.systemSetting.findUnique({
      where: { id: 'default' },
    });

    const apiKey = setting?.geminiApiKey?.trim() || process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Chưa cấu hình Google Gemini API Key. Vui lòng vào trang Cài Đặt (/admin/settings) -> Tab Gemini AI để nhập API Key.',
        },
        { status: 400 }
      );
    }

    const preferredModel = (customModel || setting?.geminiModel || 'gemini-3.1-flash-lite').replace(/^models\//, '').trim();
    const candidateModels = [
      preferredModel,
      'gemini-3.1-flash-lite',
      'gemini-3.5-flash-lite',
      'gemini-flash-lite-latest',
      'gemini-3-flash-preview',
      'gemini-3.8-flash',
    ].filter((m, idx, arr) => m && !m.includes('2.5') && !m.includes('2.0') && !m.includes('1.5') && arr.indexOf(m) === idx);

    let cleanModel = candidateModels[0] || 'gemini-3.1-flash-lite';

    const temperature = customTemp !== undefined ? Number(customTemp) : (setting?.geminiTemperature ?? 0.7);
    const selectedTone = customTone || setting?.geminiTone || 'LUXURY_CINEMATIC';

    // Tone guide mapping
    const toneGuides: Record<string, string> = {
      LUXURY_CINEMATIC:
        'Sang trọng, điện ảnh và giàu chất thơ. Sử dụng ngôn từ tinh tế, gợi cảm giác về những khung hình ánh sáng huyền ảo, tình yêu thanh xuân vĩnh cửu.',
      ROMANTIC_POETIC:
        'Lãng mạn, tha thiết và đậm chất tự sự. Tập trung vào những rung cảm tinh khôi, ánh mắt yêu thương và lời ước hẹn trăm năm.',
      MINIMALIST_MODERN:
        'Thanh lịch, hiện đại, tối giản và có chiều sâu. Ngắn gọn, súc tích, tôn vinh vẻ đẹp tự nhiên và cá tính riêng của dâu rể.',
      WARM_INTIMATE:
        'Ấm áp, chân thành, gần gũi và ân cần như một người bạn thân thiết đồng hành trong ngày trọng đại.',
    };

    const currentToneGuide = toneGuides[selectedTone] || toneGuides.LUXURY_CINEMATIC;

    // Base System Instruction
    const systemInstruction = `Bạn là Giám đốc Sáng tạo và Chuyên gia Soạn thảo Nội dung cao cấp của PlusMoments Wedding Studio (Studio ảnh cưới chuẩn phong cách Luxury, Minimalist & Cinematic Art).
- Tôn chỉ thương hiệu: Sang trọng (Luxury), Tinh tế (Minimalist), Giàu cảm xúc, Ngôn ngữ ánh sáng điện ảnh (Cinematic Art).
- Phạm vi hoạt động: Chỉ sáng tạo nội dung xoay quanh dịch vụ chụp ảnh cưới Pre-Wedding, phóng sự cưới (Wedding Journalism), váy cưới cao cấp, concept nghệ thuật và tư vấn cặp đôi uyên ương. Tuyệt đối không trả lời lan man ngoài phạm vi studio cưới.
- Giọng văn thương hiệu: ${currentToneGuide}
- Luôn sử dụng tiếng Việt chuẩn mực, giàu tính gợi hình, trau chuốt và tôn vinh tình yêu đôi lứa.`;

    // 2. Build contextual prompt according to taskType
    let userPrompt = '';
    let expectJson = false;

    switch (taskType) {
      case 'BLOG_POST': {
        const { title, category, keywords } = inputContext;
        expectJson = true;
        userPrompt = `Hãy viết một bài viết cẩm nang cưới hoàn chỉnh, chuẩn SEO và giàu cảm xúc cho PlusMoments Studio.
Thông tin đầu vào:
- Tiêu đề bài viết: "${title || 'Bí quyết chụp ảnh cưới đẹp'}"
- Chuyên mục: "${category || 'Cẩm nang cưới'}"
${keywords ? `- Từ khóa chính: ${keywords}` : ''}

Yêu cầu nội dung:
1. Độ dài khoảng 600 - 1000 từ, định dạng Markdown rõ ràng (sử dụng ##, ###, gạch đầu dòng).
2. Mở đầu chạm đến tâm lý và cảm xúc của cặp đôi đang chuẩn bị đám cưới.
3. Các phần thân bài chia mạch lạc, đưa ra lời khuyên thực tế, hữu ích, tinh tế từ góc nhìn nhiếp ảnh gia chuyên nghiệp của PlusMoments.
4. Chèn tự nhiên các placeholder ảnh: [image:1], [image:2], [image:3] tại những điểm nhấn đắt giá để người biên tập chèn ảnh portfolio cưới.
5. Kết bài ấm áp, truyền cảm hứng và khéo léo mời dâu rể liên hệ PlusMoments để được tư vấn concept riêng.
6. Trả về định dạng JSON thuần túy theo cấu trúc sau (không kèm văn bản ngoài JSON):
{
  "content": "...nội dung bài viết markdown...",
  "summary": "...đoạn tóm tắt bài viết khoảng 150-200 ký tự...",
  "metaTitle": "...tiêu đề SEO tối ưu dưới 65 ký tự...",
  "metaDescription": "...mô tả SEO tối ưu dưới 160 ký tự..."
}`;
        break;
      }

      case 'BLOG_EXCERPT': {
        const { title, category, content } = inputContext;
        userPrompt = `Dựa vào tiêu đề bài viết "${title || ''}" thuộc chuyên mục "${category || ''}" ${content ? `và nội dung tóm tắt: "${content.slice(0, 300)}..."` : ''}, hãy viết một đoạn mô tả tóm tắt (excerpt) thật lôi cuốn, tinh tế và sang trọng trong khoảng 140 - 180 ký tự. Chỉ trả về trực tiếp đoạn văn đó, không thêm bất kỳ lời dẫn nào.`;
        break;
      }

      case 'ALBUM_STORY': {
        const { title, concept, location, coupleNames, notes } = inputContext;
        userPrompt = `Hãy sáng tác một câu chuyện tình yêu (Album Love Story) giàu cảm xúc và mang đậm chất điện ảnh để làm lời tựa giới thiệu cho bộ ảnh cưới này tại PlusMoments Studio:
- Tên album: "${title || 'Khoảnh Khắc Tình Yêu'}"
- Tên cặp đôi: "${coupleNames || 'Hai bạn uyên ương'}"
- Concept chụp: "${concept || 'Pre-Wedding Cinematic'}"
- Địa điểm: "${location || 'Đà Lạt'}"
${notes ? `- Ghi chú thêm: "${notes}"` : ''}

Yêu cầu:
- Độ dài: khoảng 150 - 250 từ.
- Lời văn đẹp như thơ, gợi tả được không gian ánh sáng, cảm xúc chân thực và sự gắn kết vô giá giữa hai tâm hồn.
- Chỉ trả về đoạn văn câu chuyện tình yêu hoàn chỉnh, không thêm tiêu đề hay lời dẫn.`;
        break;
      }

      case 'PACKAGE_HIGHLIGHTS': {
        const { name, category, price, inclusions } = inputContext;
        expectJson = true;
        userPrompt = `Hãy sáng tạo các điểm nhấn đắt giá và lời tựa cho gói chụp ảnh cưới cao cấp của PlusMoments Studio:
- Tên gói: "${name || 'Gói Dịch Vụ Cưới'}"
- Phân loại: "${category || 'PRE_WEDDING'}"
${price ? `- Mức giá: ${price} VNĐ` : ''}
${inclusions ? `- Quyền lợi hiện có: ${inclusions}` : ''}

Yêu cầu trả về định dạng JSON thuần túy (không kèm văn bản ngoài):
{
  "subtitle": "...câu định vị phong cách ngắn gọn, sang trọng (dưới 15 từ)...",
  "highlightPoints": [
    "...điểm nhấn 1 (súc tích, đắt giá, đánh trúng tâm lý cặp đôi)...",
    "...điểm nhấn 2 (về trang phục, địa điểm hoặc trải nghiệm)...",
    "...điểm nhấn 3 (về chất lượng ảnh in, bảo hành hoặc file gốc)..."
  ],
  "deliverables": "...gợi ý sản phẩm bàn giao (ví dụ: 01 Album Photobook cao cấp 30x30, 02 ảnh cổng ép gỗ pha lê, toàn bộ file gốc nén chuẩn WebP...)..."
}`;
        break;
      }

      case 'LEAD_REPLY': {
        const { customerName, phone, weddingDate, expectedPackage, estimatedBudget, notes } = inputContext;
        userPrompt = `Khách hàng (cặp đôi dâu rể) vừa gửi thông tin liên hệ tư vấn chụp ảnh cưới trên website PlusMoments:
- Tên khách hàng: "${customerName || 'Bạn dâu rể'}"
${phone ? `- Số điện thoại: ${phone}` : ''}
${weddingDate ? `- Ngày cưới dự kiến: ${weddingDate}` : ''}
${expectedPackage ? `- Gói dịch vụ quan tâm: ${expectedPackage}` : ''}
${estimatedBudget ? `- Ngân sách dự kiến: ${estimatedBudget}` : ''}
${notes ? `- Lời nhắn của khách hàng: "${notes}"` : ''}

Hãy soạn một tin nhắn tư vấn gửi dâu rể qua Zalo hoặc Messenger:
- Mở đầu: Lịch thiệp, ấm áp, gọi tên dâu rể thân mật và chúc mừng hạnh phúc.
- Thân bài: Giải đáp đúng gói họ đang quan tâm hoặc gợi ý giải pháp phù hợp với ngày cưới và ngân sách.
- Lời mời: Nhẹ nhàng, tinh tế mời dâu rể ghé studio uống cà phê, trò chuyện trực tiếp và thử váy cưới/xem chất liệu photobook thực tế mà không hề tạo cảm giác chèo kéo.
- Ký tên: "PlusMoments Wedding Studio - Hotline/Zalo: 0908.123.456".
Chỉ trả về nội dung tin nhắn, không thêm lời giải thích nào.`;
        break;
      }

      case 'SEO_METADATA': {
        const { title, summary, description, category, concept, coupleNames, location, type = 'bài viết' } = inputContext;
        expectJson = true;
        userPrompt = `Bạn là Chuyên gia Tối ưu hóa Tìm kiếm (Technical SEO Specialist) cho PlusMoments Wedding Studio.
Hãy viết cặp thẻ SEO Meta Title và SEO Meta Description đạt điểm tối đa trên Google cho ${type}:
- Tiêu đề / Tên: "${title || coupleNames || 'Dịch vụ chụp ảnh cưới'}"
${category ? `- Chuyên mục / Phân loại: "${category}"` : ''}
${concept ? `- Concept: "${concept}"` : ''}
${location ? `- Địa điểm: "${location}"` : ''}
${summary || description ? `- Nội dung tóm tắt: "${(summary || description).slice(0, 300)}"` : ''}

Tiêu chuẩn kỹ thuật bắt buộc:
1. metaTitle:
   - Độ dài: Từ 50 đến 65 ký tự (chuẩn Google SERP, không vượt quá 65 ký tự).
   - Chứa từ khóa chính và đuôi thương hiệu: " | PlusMoments".
2. metaDescription:
   - Độ dài: Từ 130 đến 155 ký tự (không quá 160 ký tự).
   - Câu từ tinh tế, kích thích người tìm kiếm click xem ngay.

Trả về định dạng JSON thuần túy (không kèm bất kỳ văn bản nào ngoài JSON):
{
  "metaTitle": "...tiêu đề chuẩn SEO...",
  "metaDescription": "...mô tả chuẩn SEO..."
}`;
        break;
      }

      default:
        userPrompt = promptOverride || 'Hãy gợi ý nội dung chất lượng cao cho studio chụp ảnh cưới.';
    }

    if (promptOverride) {
      userPrompt = `${userPrompt}\n\nLưu ý bổ sung từ biên tập viên: ${promptOverride}`;
    }

    // 3. Call Google Gemini API
    const googleEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(cleanModel)}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const payload = {
      system_instruction: {
        parts: [{ text: systemInstruction }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }],
        },
      ],
      generationConfig: {
        temperature,
      },
    };

    let rawText = '';
    let usedModel = cleanModel;
    let lastErrorMsg = '';

    for (const modelName of candidateModels) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent?key=${encodeURIComponent(apiKey)}`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(15000),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok || !data) {
          lastErrorMsg = data?.error?.message || `Google Gemini API gặp lỗi (Mã: ${res.status})`;
          console.warn(`[GEMINI_GEN_WARN] Model ${modelName} returned error: ${lastErrorMsg}. Trying fallback...`);
          continue;
        }

        const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (candidateText) {
          rawText = candidateText;
          usedModel = modelName;
          break;
        }
      } catch (err: any) {
        lastErrorMsg = err.message || 'Timeout / Network error';
        console.warn(`[GEMINI_GEN_WARN] Model ${modelName} failed: ${lastErrorMsg}. Trying fallback...`);
      }
    }

    if (!rawText) {
      let errMsg = lastErrorMsg || 'Google Gemini không trả về kết quả nào cho yêu cầu này.';
      if (lastErrorMsg.includes('Quota exceeded') || lastErrorMsg.includes('limit: 0') || lastErrorMsg.includes('RESOURCE_EXHAUSTED')) {
        errMsg = `Tài khoản Google AI của bạn đã hết hạn ngạch gọi miễn phí trong ngày (Quota Limit 0). Vui lòng chọn dòng model Flash hoặc kích hoạt Pay-as-you-go trên Google AI Studio.`;
      }
      return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
    }

    let parsedData = null;
    if (expectJson) {
      parsedData = extractJsonFromText(rawText);
    }

    return NextResponse.json({
      success: true,
      modelUsed: usedModel,
      rawText,
      data: parsedData,
      result: parsedData || (taskType === 'LEAD_REPLY' ? { replyMessage: rawText } : taskType === 'ALBUM_STORY' ? { story: rawText } : { text: rawText }),
    });
  } catch (error: any) {
    console.error('Gemini generate error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi gọi trí tuệ nhân tạo Gemini.' },
      { status: 500 }
    );
  }
}

