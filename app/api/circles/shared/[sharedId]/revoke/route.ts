export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { revokeArtifact } from '@/lib/circles/sharingService';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sharedId: string }> }
) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { sharedId } = await params;
    await revokeArtifact(sharedId, memberId);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    if (error?.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Artifact not found' }, { status: 404 });
    }
    console.error('[Circles] POST /api/circles/shared/[sharedId]/revoke error:', error);
    return NextResponse.json({ error: 'Failed to revoke' }, { status: 500 });
  }
}
