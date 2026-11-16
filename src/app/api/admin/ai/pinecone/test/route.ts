import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { testPineconeConnection } from '@/lib/pinecone-service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { apiKey, host, namespace } = body;

    const result = await testPineconeConnection(apiKey, host, namespace);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API_PINECONE_TEST_ERROR]:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi khi kiểm tra kết nối Pinecone.' },
      { status: 500 }
    );
  }
}
