import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { listDMThreads, findOrCreateDMThread } from '@/lib/team/DMService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const threads = await listDMThreads(memberId);
  return NextResponse.json({ threads });
}

export async function POST(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { targetMemberId } = body;

  if (!targetMemberId || typeof targetMemberId !== 'string') {
    return NextResponse.json({ error: 'targetMemberId required' }, { status: 400 });
  }

  if (targetMemberId === memberId) {
    return NextResponse.json({ error: 'Cannot DM yourself' }, { status: 400 });
  }

  const dmThreadId = await findOrCreateDMThread(memberId, targetMemberId);
  return NextResponse.json({ dmThreadId });
}
