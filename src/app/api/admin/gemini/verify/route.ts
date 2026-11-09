import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
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
        { success: false, error: 'Chưa có Google Gemini API Key để kiểm tra.' },
        { status: 400 }
      );
    }

    // Call models.list ONLY to verify key validity without burning generateContent quota
    const googleEndpoint = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(googleEndpoint, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-store',
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data) {
      const rawMsg = data?.error?.message || '';
      let errMsg =
        rawMsg ||
        `Google API từ chối kết nối (Mã lỗi: ${res.status}). Vui lòng kiểm tra lại API Key.`;
      if (res.status === 429 || data?.error?.status === 'RESOURCE_EXHAUSTED' || rawMsg.includes('Quota exceeded')) {
        errMsg = 'Tài khoản Google AI của bạn đã hết hạn ngạch gọi miễn phí (Quota Limit 0). Vui lòng chọn dòng model Flash hoặc kích hoạt Pay-as-you-go trên Google AI Studio.';
      }
      return NextResponse.json({ success: false, error: errMsg }, { status: res.status || 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Google Gemini API Key hoàn toàn hợp lệ!',
      totalModels: Array.isArray(data.models) ? data.models.length : 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi kiểm tra API Key.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  // Support both GET and POST with { apiKey } in body
  try {
    const body = await request.json().catch(() => ({}));
    let apiKey = body.apiKey?.trim();

    if (!apiKey) {
      const setting = await prisma.systemSetting.findUnique({
        where: { id: 'default' },
        select: { geminiApiKey: true },
      });
      apiKey = setting?.geminiApiKey?.trim() || process.env.GEMINI_API_KEY || '';
    }

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'Chưa có Google Gemini API Key để kiểm tra.' },
        { status: 400 }
      );
    }

    const googleEndpoint = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(googleEndpoint, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-store',
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data) {
      const rawMsg = data?.error?.message || '';
      let errMsg =
        rawMsg ||
        `Google API từ chối kết nối (Mã lỗi: ${res.status}). Vui lòng kiểm tra lại API Key.`;
      if (res.status === 429 || data?.error?.status === 'RESOURCE_EXHAUSTED' || rawMsg.includes('Quota exceeded')) {
        errMsg = 'Tài khoản Google AI của bạn đã hết hạn ngạch gọi miễn phí (Quota Limit 0). Vui lòng chọn dòng model Flash hoặc kích hoạt Pay-as-you-go trên Google AI Studio.';
      }
      return NextResponse.json({ success: false, error: errMsg }, { status: res.status || 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Google Gemini API Key hoàn toàn hợp lệ!',
      totalModels: Array.isArray(data.models) ? data.models.length : 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi kiểm tra API Key.' },
      { status: 500 }
    );
  }
}

