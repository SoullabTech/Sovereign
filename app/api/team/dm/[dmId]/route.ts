import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { hideDMThread } from '@/lib/team/DMService';

export const dynamic = 'force-dynamic';

// Hide a DM thread from the caller's sidebar (soft — thread still exists for the other party)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ dmId: string }> }
) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { dmId } = await params;
  await hideDMThread(dmId, memberId);
  return NextResponse.json({ ok: true });
}
