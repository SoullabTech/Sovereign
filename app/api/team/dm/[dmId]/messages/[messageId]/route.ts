import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { deleteDMMessage, editDMMessage } from '@/lib/team/DMService';

export const dynamic = 'force-dynamic';

// Soft-delete a DM message. Sender-only; requester must be a member of the DM
// thread (both enforced in deleteDMMessage).
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ dmId: string; messageId: string }> }
) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { dmId, messageId } = await params;
  const result = await deleteDMMessage(dmId, messageId, memberId);
  if (!result.ok) {
    const status = result.reason === 'not_found' ? 404 : 403;
    return NextResponse.json({ error: result.reason }, { status });
  }
  return NextResponse.json({ ok: true });
}

// Edit a DM message's text. Sender-only.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ dmId: string; messageId: string }> }
) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { dmId, messageId } = await params;
  const body = await request.json().catch(() => ({}));
  const newBody = typeof body.body === 'string' ? body.body : '';

  const result = await editDMMessage(dmId, messageId, memberId, newBody);
  if (!result.ok) {
    const status =
      result.reason === 'not_found' ? 404
      : result.reason === 'forbidden' ? 403
      : 400; // empty | too_long
    return NextResponse.json({ error: result.reason }, { status });
  }
  return NextResponse.json({ ok: true, editedAt: result.editedAt });
}
