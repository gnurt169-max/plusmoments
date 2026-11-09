import { processCreateOrder } from '@/lib/order-service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  return processCreateOrder(request);
}
