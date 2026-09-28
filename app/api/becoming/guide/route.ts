import { NextRequest } from 'next/server';
import { proxyBecomingMaia } from '@/lib/becoming/maiaProxy.server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  return proxyBecomingMaia(request, 'guide');
}
