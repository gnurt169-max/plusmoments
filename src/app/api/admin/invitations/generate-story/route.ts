import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

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

export async function POST(req: Request) {
  try {
    // 1. Auth check
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      mode = 'all', // 'all' | 'groom' | 'bride' | 'story'
      groomName = '',
      brideName = '',
      template = 'timeless-ivory',
      weddingDate = '',
      timeDisplay = '',
      venueName = '',
      venueAddress = '',
      groomParents = '',
      brideParents = '',
      existingGroomBio = '',
      existingBrideBio = '',
      existingStoryTitle = '',
      existingStoryText = '',
    } = body;

    // 2. Fetch Gemini AI configuration
    const setting = await prisma.systemSetting.findUnique({
      where: { id: 'default' },
    });

    const apiKey = setting?.geminiApiKey?.trim() || process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Chưa cấu hình Google Gemini API Key. Vui lòng vào Cài Đặt (/admin/settings) -> Tab Gemini AI.',
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

    // 3. Fetch Knowledge Chunks / AI context references from MediaFile (RAG style)
    let brandChunksContext = '';
    try {
      const sampleMediaChunks = await prisma.mediaFile.findMany({
        where: {
          aiContext: { not: null },
        },
        select: {
          chunkTitle: true,
          aiContext: true,
        },
        take: 3,
        orderBy: { updatedAt: 'desc' },
      });

      if (sampleMediaChunks.length > 0) {
        brandChunksContext = `\n[MẪU VĂN PHONG VÀ CẢM XÚC THỰC TẾ CỦA THƯƠNG HIỆU PLUSMOMENTS]:\n` +
          sampleMediaChunks
            .map((c, idx) => `- Mẫu ${idx + 1} (${c.chunkTitle || 'Khoảnh khắc cưới'}): ${c.aiContext?.slice(0, 160)}...`)
            .join('\n');
      }
    } catch {
      // Fallback silently if db query has issues
    }

    // 4. Template stylistic vibe mapping
    const templateVibes: Record<string, string> = {
      'timeless-ivory': 'Phong cách Timeless Ivory: Cổ điển, vĩnh cửu, thanh lịch, tone màu ngà ấm áp, câu từ trang trọng và tinh khôi.',
      'cinematic-noir': 'Phong cách Cinematic Noir: Điện ảnh sâu lắng, cảm xúc thăng hoa, ngôn từ sắc nét, giàu chất thơ và chiều sâu nội tâm.',
      'botanical-silk': 'Phong cách Botanical Silk: Tự nhiên, mềm mại như lụa, hòa mình cùng hoa lá thiên nhiên, ngọt ngào và tươi mới.',
      'minimalist-story': 'Phong cách Minimalist Story: Hiện đại, tối giản tinh tế, súc tích, chân thực, tôn vinh rung cảm mộc mạc nhất.',
    };

    const templateNote = templateVibes[template] || templateVibes['timeless-ivory'];

    // Couple display
    const gName = groomName.trim() || 'Chú Rể';
    const bName = brideName.trim() || 'Cô Dâu';
    const coupleStr = `${gName} & ${bName}`;
    const venueStr = [venueName.trim(), venueAddress.trim()].filter(Boolean).join(' - ') || 'Không gian tiệc cưới trang trọng';
    const dateStr = [timeDisplay.trim(), weddingDate.trim()].filter(Boolean).join(' ') || 'Ngày chung đôi';

    // 5. Build prompt tailored for requested mode
    let targetFieldsPrompt = '';
    if (mode === 'groom') {
      targetFieldsPrompt = `YÊU CẦU: Chỉ tạo riêng nội dung cho Chú Rể (groomBio):
- "groomBio": 1–2 câu ngắn gọn (khoảng 15–25 từ), góc nhìn ấm áp, chân thành của Chú Rể (${gName}) dành cho Cô Dâu (${bName}) và ngày trọng đại.
Nếu đã có nội dung cũ: "${existingGroomBio}", hãy nâng cấp văn phong tinh tế hơn.`;
    } else if (mode === 'bride') {
      targetFieldsPrompt = `YÊU CẦU: Chỉ tạo riêng nội dung cho Cô Dâu (brideBio):
- "brideBio": 1–2 câu ngắn gọn (khoảng 15–25 từ), góc nhìn dịu dàng, hạnh phúc ngập tràn của Cô Dâu (${bName}) dành cho người bạn đời (${gName}).
Nếu đã có nội dung cũ: "${existingBrideBio}", hãy nâng cấp văn phong tinh tế hơn.`;
    } else if (mode === 'story') {
      targetFieldsPrompt = `YÊU CẦU: Chỉ tạo Tiêu Đề và Lời Kể Câu Chuyện Tình Yêu (storyTitle & storyText):
- "storyTitle": 1 tiêu đề ngắn giàu chất thơ (4–8 từ, ví dụ "Khi Hai Nhịp Đập Chung Một Hành Trình", "Hành Trình Chạm Đến Mùa Yêu"...).
- "storyText": 1 đoạn tự sự 3–4 câu (khoảng 60–90 từ) kể về hành trình yêu thương và lời hẹn ước trăm năm của cặp đôi tại ${venueStr}.
Nếu đã có nội dung cũ: Tiêu đề "${existingStoryTitle}", Lời kể "${existingStoryText}", hãy trau chuốt và viết lại sâu sắc hơn.`;
    } else {
      // mode === 'all'
      targetFieldsPrompt = `YÊU CẦU: Tạo TRỌN BỘ 4 trường nội dung cảm xúc:
1. "groomBio": 1–2 câu ngắn gọn (khoảng 15–25 từ), góc nhìn ấm áp, chân thành của Chú Rể (${gName}) gửi đến Cô Dâu (${bName}).
2. "brideBio": 1–2 câu ngắn gọn (khoảng 15–25 từ), góc nhìn dịu dàng, ngập tràn tin yêu của Cô Dâu (${bName}) gửi đến Chú Rể (${gName}).
3. "storyTitle": 1 tiêu đề ngắn giàu chất thơ (4–8 từ).
4. "storyText": 1 đoạn tự sự 3–4 câu (khoảng 60–90 từ) kể về hành trình yêu thương từ những rung động đầu tiên cho đến lời hẹn ước trăm năm vào ${dateStr} tại ${venueStr}.`;
    }

    const systemPrompt = `Bạn là Giám đốc Sáng tạo và Chuyên gia Soạn thảo Nội dung Thiệp Cưới Cao Cấp của PlusMoments Wedding Studio (plusmoments.vn).
Định vị phong cách: Luxury Editorial, Tinh tế, Giàu chất thơ, Chân thành và Sâu lắng.
${brandChunksContext}

NGỮ CẢNH THIỆP CƯỚI ĐANG THIẾT KẾ:
- Chú Rể: ${gName} ${groomParents ? `(Thân phụ/mẫu: ${groomParents})` : ''}
- Cô Dâu: ${bName} ${brideParents ? `(Thân phụ/mẫu: ${brideParents})` : ''}
- Cặp đôi: ${coupleStr}
- Mẫu thiệp đã chọn: ${template} (${templateNote})
- Thời gian tổ chức: ${dateStr}
- Địa điểm tiệc cưới: ${venueStr}

TIÊU CHUẨN SOẠN THẢO (STRICT EDITORIAL GUIDELINES):
- Ngôn ngữ: Tiếng Việt chuẩn mực, thuần khiết, giàu cảm xúc, không sáo rỗng, không dùng emoji hoặc icon.
- Cá nhân hóa tự nhiên theo tên thật của Chú Rể (${gName}) và Cô Dâu (${bName}) cùng không gian tiệc cưới (${venueStr}).
- Giọng văn chuẩn Luxury Wedding Magazine (Vogue Weddings / Harper's Bazaar Bride).

${targetFieldsPrompt}

ĐỊNH DẠNG ĐẦU RA BẮT BUỘC:
Chỉ trả về DUY NHẤT một đối tượng JSON hợp lệ (không kèm markdown giải thích bên ngoài):
{
  "groomBio": "Nội dung lời tự sự chú rể (hoặc chuỗi rỗng nếu không yêu cầu)",
  "brideBio": "Nội dung lời tự sự cô dâu (hoặc chuỗi rỗng nếu không yêu cầu)",
  "storyTitle": "Tiêu đề câu chuyện tình yêu (hoặc chuỗi rỗng nếu không yêu cầu)",
  "storyText": "Lời kể câu chuyện tình yêu (hoặc chuỗi rỗng nếu không yêu cầu)"
}`;

    let parsedResult: any = null;
    let lastError = '';

    for (const modelName of candidateModels) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent?key=${encodeURIComponent(apiKey)}`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
            generationConfig: {
              temperature,
              maxOutputTokens: 1024,
            },
          }),
        });

        if (!res.ok) {
          const errBody = await res.text().catch(() => '');
          lastError = `Model ${modelName} returned HTTP ${res.status}: ${errBody.slice(0, 150)}`;
          continue;
        }

        const data = await res.json();
        const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText) {
          const extracted = extractJson(candidateText);
          if (extracted && typeof extracted === 'object') {
            parsedResult = extracted;
            break;
          }
        }
      } catch (err: any) {
        lastError = err?.message || String(err);
      }
    }

    // Smart Fallback nếu AI trả về rỗng hoặc các model gặp sự cố tạm thời
    if (!parsedResult) {
      console.warn('[AI Wedding Story Generator] AI fallback used:', lastError);
      parsedResult = {
        groomBio: `Cảm ơn em đã bước vào cuộc đời anh, biến những ngày bình thường thành hành trình hạnh phúc vô tận.`,
        brideBio: `Hạnh phúc nhất không phải là đến đích, mà là mỗi bước đi trên đường đời luôn có bàn tay anh ấm áp nắm chặt.`,
        storyTitle: `Khi Hai Nhịp Đập Chung Một Hành Trình`,
        storyText: `Từ ánh nhìn đầu tiên cho đến ngày hôm nay, tình yêu của chúng mình đã đi qua những thăng trầm để nhận ra rằng: đối phương chính là bến đỗ bình yên nhất. Vào ${dateStr}, trước sự chứng kiến của gia đình và bạn bè tại ${venueStr}, chúng mình trân trọng mở ra trang mới của cuộc đời bằng lời hẹn ước trăm năm.`,
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        groomBio: parsedResult.groomBio || '',
        brideBio: parsedResult.brideBio || '',
        storyTitle: parsedResult.storyTitle || '',
        storyText: parsedResult.storyText || '',
      },
    });
  } catch (error: any) {
    console.error('Error in /api/admin/invitations/generate-story:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi xử lý AI story generator' },
      { status: 500 }
    );
  }
}
