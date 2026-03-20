import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { heartbeat, getPresence } from '@/lib/team/ChannelService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const presence = await getPresence();
  return NextResponse.json({ presence });
}

export async function POST(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Fire-and-forget — never blocks the client
  heartbeat(memberId).catch(() => { /* non-critical */ });

  return NextResponse.json({ ok: true });
}
