import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export interface GeminiModelInfo {
  id: string; // e.g. "gemini-2.5-flash"
  name: string; // e.g. "models/gemini-2.5-flash"
  displayName: string;
  description: string;
  isRecommended?: boolean;
  tierNote?: string;
  inputTokenLimit?: number;
  outputTokenLimit?: number;
}

export async function GET(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    let apiKey = searchParams.get('apiKey')?.trim();

    if (!apiKey) {
      const setting = await prisma.systemSetting.findUnique({
        where: { id: 'default' },
        select: { geminiApiKey: true },
      });
      apiKey = setting?.geminiApiKey?.trim() || process.env.GEMINI_API_KEY || '';
    }

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Chưa có Google Gemini API Key. Vui lòng nhập API Key để lấy danh sách model thực tế từ Google.',
        },
        { status: 400 }
      );
    }

    // Call Google Generative Language API (models.list only - avoids consuming generation quota)
    const googleEndpoint = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(googleEndpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data) {
      const rawMsg = data?.error?.message || '';
      let errMsg = rawMsg || `Google API từ chối kết nối (Mã lỗi HTTP: ${res.status}). Vui lòng kiểm tra lại tính hợp lệ của API Key.`;

      if (res.status === 429 || data?.error?.status === 'RESOURCE_EXHAUSTED' || rawMsg.includes('Quota exceeded')) {
        errMsg = 'Tài khoản Google AI của bạn đã hết hạn ngạch gọi miễn phí (Quota Limit 0). Vui lòng chọn dòng model Flash hoặc kích hoạt Pay-as-you-go trên Google AI Studio.';
      }

      return NextResponse.json(
        {
          success: false,
          error: errMsg,
        },
        { status: res.status || 400 }
      );
    }

    if (!Array.isArray(data.models)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Phản hồi từ Google AI API không chứa danh sách models hợp lệ.',
        },
        { status: 502 }
      );
    }

    // Filter models supporting generateContent and suitable for studio text/content generation
    const allModels: GeminiModelInfo[] = data.models
      .filter((m: any) => {
        if (!Array.isArray(m.supportedGenerationMethods) || !m.supportedGenerationMethods.includes('generateContent')) {
          return false;
        }

        const id = (m.name || '').replace(/^models\//, '').toLowerCase();

        // Exclude specialized non-text or deprecated types
        if (
          id.includes('embedding') ||
          id.includes('tts') ||
          id.includes('image') ||
          id.includes('robotics') ||
          id.includes('transcribe') ||
          id.includes('customtools') ||
          id.includes('clip')
        ) {
          return false;
        }

        // Exclude models known to have limit 0 on free tier or deprecated
        if (id.includes('3.1-pro') || id === 'gemini-2.5-flash' || id === 'gemini-2.0-flash' || id === 'gemini-1.5-flash') {
          return false;
        }

        return true;
      })
      .map((m: any) => {
        const cleanId = (m.name || '').replace(/^models\//, '');
        const isFlash = cleanId.toLowerCase().includes('flash');
        return {
          id: cleanId,
          name: m.name,
          displayName: m.displayName || cleanId,
          description: m.description || '',
          isRecommended: isFlash,
          tierNote: isFlash ? 'Khuyên dùng cho Free Tier (Ổn định, hạn mức cao)' : 'Hạn mức Free Tier giới hạn',
          inputTokenLimit: m.inputTokenLimit,
          outputTokenLimit: m.outputTokenLimit,
        };
      });

    // Custom sorting: Prioritize safe Free Tier Flash models on top
    const priorityScore = (id: string): number => {
      const lower = id.toLowerCase();
      // Primary Flash models with high free tier limits
      if (lower === 'gemini-3.1-flash-lite') return 100;
      if (lower === 'gemini-3.5-flash-lite') return 98;
      if (lower === 'gemini-flash-lite-latest') return 96;
      if (lower === 'gemini-3-flash-preview') return 94;
      if (lower.includes('3.8-flash')) return 92;
      if (lower.includes('3.5-flash')) return 90;
      if (lower.includes('flash') && !lower.includes('pro')) return 85;
      if (lower.includes('flash-lite')) return 80;
      // Pro models lower down
      if (lower.includes('pro')) return 50;
      return 40;
    };

    allModels.sort((a, b) => priorityScore(b.id) - priorityScore(a.id));

    return NextResponse.json({
      success: true,
      count: allModels.length,
      notice: 'Khuyến nghị: Chọn các dòng Flash để sử dụng ổn định trên gói Free Tier không bị giới hạn quota.',
      models: allModels,
    });
  } catch (error: any) {
    console.error('Gemini models sync error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Lỗi khi kết nối Google API để lấy danh sách models.',
      },
      { status: 500 }
    );
  }
}
