import { prisma } from '@/lib/prisma';

export interface PineconeConfig {
  apiKey: string;
  host: string;
  namespace: string;
}

export interface PineconeTestResult {
  success: boolean;
  vectorCount?: number;
  dimension?: number;
  namespaces?: Record<string, any>;
  message: string;
  raw?: any;
}

function normalizeHost(host: string): string {
  let clean = host.trim().replace(/\/+$/, '');
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = `https://${clean}`;
  }
  return clean;
}

/**
 * Lấy cấu hình Pinecone từ SystemSetting
 */
export async function getPineconeConfig(): Promise<PineconeConfig | null> {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { id: 'default' },
    });
    const apiKey = setting?.pineconeApiKey?.trim() || process.env.PINECONE_API_KEY?.trim() || '';
    const host = setting?.pineconeIndexHost?.trim() || process.env.PINECONE_INDEX_HOST?.trim() || '';
    const namespace = setting?.pineconeNamespace?.trim() || 'plusmoments-media';

    if (!apiKey || !host) {
      return null;
    }

    return {
      apiKey,
      host: normalizeHost(host),
      namespace,
    };
  } catch (err) {
    console.error('[PINECONE_CONFIG_ERROR]:', err);
    return null;
  }
}

/**
 * Kiểm tra kết nối tới Pinecone Vector Index
 */
export async function testPineconeConnection(
  customApiKey?: string,
  customHost?: string,
  customNamespace?: string
): Promise<PineconeTestResult> {
  try {
    let apiKey = customApiKey?.trim();
    let host = customHost?.trim();
    let namespace = customNamespace?.trim() || 'plusmoments-media';

    if (!apiKey || !host) {
      const dbConfig = await getPineconeConfig();
      if (!apiKey && dbConfig) apiKey = dbConfig.apiKey;
      if (!host && dbConfig) host = dbConfig.host;
      if (!customNamespace && dbConfig) namespace = dbConfig.namespace;
    }

    if (!apiKey) {
      return {
        success: false,
        message: 'Thiếu Pinecone API Key. Vui lòng nhập API Key để kiểm tra.',
      };
    }

    if (!host) {
      return {
        success: false,
        message: 'Thiếu Pinecone Index Host. Vui lòng nhập Host (ví dụ: https://plusmoments-xxx.svc.aped-xxx.pinecone.io).',
      };
    }

    const cleanHost = normalizeHost(host);
    const endpoint = `${cleanHost}/describe_index_stats`;

    // Gọi Pinecone Data Plane API
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Api-Key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({}),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      return {
        success: false,
        message: `Pinecone trả về mã lỗi HTTP ${res.status}: ${errText.slice(0, 200) || 'Không thể xác thực'}`,
      };
    }

    const data = await res.json();
    const totalVectorCount = data.totalVectorCount ?? data.totalRecordCount ?? 0;
    const dimension = data.dimension ?? 768;
    const nsStats = data.namespaces || {};
    const currentNsCount = nsStats[namespace]?.vectorCount ?? 0;

    return {
      success: true,
      vectorCount: totalVectorCount,
      dimension,
      namespaces: nsStats,
      message: `Kết nối thành công tới Pinecone Index! Tổng số vector: ${totalVectorCount.toLocaleString()} (Namespace "${namespace}": ${currentNsCount.toLocaleString()} vector) | Số chiều Dimension: ${dimension}.`,
      raw: data,
    };
  } catch (error: any) {
    console.error('[PINECONE_TEST_EXCEPTION]:', error);
    return {
      success: false,
      message: `Lỗi kết nối Pinecone: ${error.message || 'Không thể kết nối tới Host được chỉ định'}`,
    };
  }
}

/**
 * Sinh vector embedding cho nội dung ngữ cảnh ảnh sử dụng Google Gemini Embedding API
 */
export async function generateContextEmbedding(text: string, customApiKey?: string): Promise<number[] | null> {
  try {
    const cleanText = text.trim();
    if (!cleanText) return null;

    let apiKey = customApiKey?.trim();
    if (!apiKey) {
      const setting = await prisma.systemSetting.findUnique({ where: { id: 'default' } });
      apiKey = setting?.geminiApiKey?.trim() || process.env.GEMINI_API_KEY?.trim() || '';
    }

    if (!apiKey) {
      console.warn('[EMBEDDING_WARN]: Chưa cấu hình Gemini API Key để sinh vector.');
      return null;
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${encodeURIComponent(apiKey)}`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/text-embedding-004',
        content: {
          parts: [{ text: cleanText.slice(0, 2048) }],
        },
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.warn(`[EMBEDDING_HTTP_ERROR] ${res.status}:`, errText.slice(0, 160));
      return null;
    }

    const data = await res.json();
    const values = data.embedding?.values;
    if (Array.isArray(values) && values.length > 0) {
      return values as number[];
    }

    return null;
  } catch (err: any) {
    console.error('[GENERATE_EMBEDDING_ERROR]:', err.message);
    return null;
  }
}

/**
 * Đẩy vector ngữ cảnh của 1 hình ảnh đã chunk lên Pinecone
 */
export async function syncMediaVectorToPinecone(media: {
  id: string;
  folderId?: string | null;
  url: string;
  chunkTitle?: string | null;
  aiContext?: string | null;
}): Promise<boolean> {
  try {
    const config = await getPineconeConfig();
    if (!config) {
      // Chưa cấu hình Pinecone, bỏ qua êm ái
      return false;
    }

    const contextText = `${media.chunkTitle || ''}. ${media.aiContext || ''}`.trim();
    if (!contextText) {
      return false;
    }

    const vector = await generateContextEmbedding(contextText);
    if (!vector || vector.length === 0) {
      return false;
    }

    const endpoint = `${config.host}/vectors/upsert`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Api-Key': config.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vectors: [
          {
            id: media.id,
            values: vector,
            metadata: {
              mediaId: media.id,
              folderId: media.folderId || '',
              url: media.url,
              chunkTitle: media.chunkTitle || 'Ảnh cưới nghệ thuật',
              aiContext: (media.aiContext || '').slice(0, 800),
              updatedAt: new Date().toISOString(),
            },
          },
        ],
        namespace: config.namespace,
      }),
      signal: AbortSignal.timeout(12000),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.warn(`[PINECONE_UPSERT_WARN] HTTP ${res.status}:`, errText.slice(0, 150));
      return false;
    }

    // Đánh dấu đã sync trong Database
    await prisma.mediaFile
      .update({
        where: { id: media.id },
        data: { pineconeSynced: true },
      })
      .catch(() => null);

    return true;
  } catch (err: any) {
    console.error('[PINECONE_SYNC_EXCEPTION]:', err.message);
    return false;
  }
}
