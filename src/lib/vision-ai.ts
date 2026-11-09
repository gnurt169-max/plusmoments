import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { prisma } from '@/lib/prisma';

export interface VisionAIChunk {
  visualDescription: string;
  mainSubject: string;
  colorMood: string;
  suggestedAlt: string;
  suggestedCaption?: string;
  tags?: string[];
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

/**
 * Load image file as base64 and mimeType (optimizing size with sharp for fast Vision API call)
 */
async function getImageBase64(imageUrl: string): Promise<{ base64: string; mimeType: string } | null> {
  try {
    let buffer: Buffer | null = null;
    let mimeType = 'image/jpeg';

    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      const res = await fetch(imageUrl);
      if (!res.ok) return null;
      const arrayBuf = await res.arrayBuffer();
      buffer = Buffer.from(arrayBuf);
      const ct = res.headers.get('content-type');
      if (ct && ct.startsWith('image/')) mimeType = ct;
    } else {
      // Local image in public folder
      const cleanPath = imageUrl.replace(/^\/+/, '').split('?')[0];
      const fullPath = path.join(process.cwd(), 'public', cleanPath);
      if (!fs.existsSync(fullPath)) return null;

      buffer = await fs.promises.readFile(fullPath);
      const ext = path.extname(cleanPath).toLowerCase();
      if (ext === '.webp') mimeType = 'image/webp';
      else if (ext === '.png') mimeType = 'image/png';
      else if (ext === '.avif') mimeType = 'image/avif';
      else mimeType = 'image/jpeg';
    }

    if (!buffer || buffer.length === 0) return null;

    // Optimize image dimension (max 1024px) to save bandwidth and speed up Gemini Vision inference
    try {
      const optimized = await sharp(buffer)
        .resize({ width: 1024, height: 1024, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();
      return {
        base64: optimized.toString('base64'),
        mimeType: 'image/jpeg',
      };
    } catch {
      return {
        base64: buffer.toString('base64'),
        mimeType,
      };
    }
  } catch (err) {
    console.warn('[VISION_IMAGE_LOAD_ERROR]:', err);
    return null;
  }
}

/**
 * Call Gemini Vision AI to analyze an image and return structured chunk
 */
export async function analyzeImageWithVisionAI(imageUrl: string): Promise<VisionAIChunk | null> {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { id: 'default' },
    });
    const apiKey = setting?.geminiApiKey?.trim() || process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      console.warn('[VISION_AI_WARN]: Chưa cấu hình Gemini API Key.');
      return null;
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

    const imgData = await getImageBase64(imageUrl);
    if (!imgData) {
      console.warn('[VISION_AI_WARN]: Không thể đọc dữ liệu ảnh:', imageUrl);
      return null;
    }

    const prompt = `Bạn là chuyên gia thị giác và biên tập viên cao cấp cho PlusMoments Wedding Studio (plusmoments.vn).
Hãy quan sát và phân tích thật chi tiết bức ảnh cưới này:
- Chi tiết trang phục/phụ kiện (Váy cưới ren/lụa, vest tuxedo, hoa cưới cầm tay, thiệp cưới dập nổi thủ công, nhẫn cưới, khăn voan, layout makeup...).
- Ánh sáng, bối cảnh, màu sắc chủ đạo (Tone ấm áp, studio phong cách Hàn Quốc tối giản, ánh sáng điện ảnh cinematic, ngoại cảnh...).
- Cảm xúc và hành động của nhân vật (Cái nắm tay dịu dàng, trao nhẫn thiêng liêng, ánh mắt tình tứ, nụ cười ngọt ngào...).

Trả về DUY NHẤT một khối JSON hợp lệ theo định dạng:
{
  "visualDescription": "Mô tả cụ thể và đầy đủ về đối tượng, người, trang phục và hành động nổi bật trong ảnh",
  "mainSubject": "Chủ thể chính (vd: Chi tiết váy cưới đuôi cá đính kết, bộ thiệp cưới thủ công tông kem, cô dâu chú rể trao nhẫn)",
  "colorMood": "Tone màu và ánh sáng (vd: Phong cách tối giản ấm áp, ánh sáng điện ảnh dịu nhẹ)",
  "suggestedAlt": "Alt text mô tả ngắn gọn, sang trọng chuẩn Google Image SEO dưới 100 ký tự",
  "suggestedCaption": "Chú thích ảnh lãng mạn, ngắn gọn (dưới 120 ký tự)",
  "tags": ["ảnh cưới", "váy cưới", "studio"]
}`;

    for (const modelName of candidateModels) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent?key=${encodeURIComponent(apiKey)}`;

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  { text: prompt },
                  {
                    inlineData: {
                      mimeType: imgData.mimeType,
                      data: imgData.base64,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: 'application/json',
            },
          }),
          signal: AbortSignal.timeout(12000),
        });

        if (!res.ok) {
          const errText = await res.text().catch(() => '');
          console.warn(`[VISION_AI_WARN] Model ${modelName} returned HTTP ${res.status}: ${errText.slice(0, 120)}. Trying fallback...`);
          continue;
        }

        const data = await res.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const parsed = extractJson(rawText);

        if (parsed && (parsed.visualDescription || parsed.suggestedAlt)) {
          return {
            visualDescription: parsed.visualDescription || 'Khoảnh khắc chụp ảnh cưới nghệ thuật tại PlusMoments Studio',
            mainSubject: parsed.mainSubject || 'Ảnh cưới nghệ thuật',
            colorMood: parsed.colorMood || 'Phong cách sang trọng, tối giản',
            suggestedAlt: parsed.suggestedAlt || 'Ảnh cưới nghệ thuật sang trọng tại PlusMoments Studio',
            suggestedCaption: parsed.suggestedCaption || '',
            tags: Array.isArray(parsed.tags) ? parsed.tags : [],
          };
        }
      } catch (err: any) {
        console.warn(`[VISION_AI_WARN] Model ${modelName} call failed:`, err.message);
      }
    }

    return null;
  } catch (error) {
    console.error('[VISION_AI_EXCEPTION]:', error);
    return null;
  }
}

/**
 * Get cached chunk or analyze on-the-fly and cache into Database MediaFile
 */
export async function getOrAnalyzeImageChunk(
  imageUrl: string,
  mediaId?: string | null
): Promise<VisionAIChunk | null> {
  try {
    const cleanUrl = imageUrl.split('?')[0].trim();

    // 1. Look for existing MediaFile record in DB
    let dbFile = null;
    if (mediaId && !mediaId.startsWith('/')) {
      dbFile = await prisma.mediaFile.findUnique({ where: { id: mediaId } });
    }
    if (!dbFile) {
      dbFile = await prisma.mediaFile.findFirst({ where: { url: cleanUrl } });
    }

    // 2. Return cached aiContextChunk if already present
    if (dbFile?.aiContextChunk) {
      const cached = dbFile.aiContextChunk as any;
      if (cached && (cached.visualDescription || cached.suggestedAlt)) {
        return cached as VisionAIChunk;
      }
    }

    // 3. Analyze with Vision AI
    const analyzed = await analyzeImageWithVisionAI(cleanUrl);
    if (!analyzed) return null;

    // 4. Cache into database
    if (dbFile) {
      await prisma.mediaFile.update({
        where: { id: dbFile.id },
        data: { aiContextChunk: analyzed as any },
      });
    } else {
      // Create new record for this file so chunk is persistently cached
      const filename = path.basename(cleanUrl);
      await prisma.mediaFile
        .create({
          data: {
            name: filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
            url: cleanUrl,
            size: 0,
            format: path.extname(cleanUrl).replace('.', '').toUpperCase() || 'WEBP',
            aiContextChunk: analyzed as any,
          },
        })
        .catch((e) => console.warn('[MEDIA_FILE_CREATE_CHUNK_WARN]:', e));
    }

    return analyzed;
  } catch (error) {
    console.error('[GET_OR_ANALYZE_CHUNK_ERROR]:', error);
    return null;
  }
}

/**
 * Background worker task to analyze image chunk asynchronously
 */
export async function analyzeAndCacheImageChunk(mediaId: string, imageUrl: string): Promise<void> {
  try {
    // Run asynchronously without blocking the upload response
    setTimeout(async () => {
      try {
        await getOrAnalyzeImageChunk(imageUrl, mediaId);
      } catch (e) {
        console.error('[ASYNC_CHUNK_WORKER_ERROR]:', e);
      }
    }, 100);
  } catch (err) {
    console.error('[BACKGROUND_CHUNK_TRIGGER_ERROR]:', err);
  }
}

