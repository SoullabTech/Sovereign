import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import {
  listAttentionItems,
  countOpenAttention,
  markAttentionOpened,
  resolveAttentionItem,
  declineAttentionItem,
  withdrawAttentionItem,
} from '@/lib/team/attention';

export const dynamic = 'force-dynamic';

// GET /api/team/attention — the recipient's "For You" loops + open count.
export async function GET(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const includeClosed = new URL(request.url).searchParams.get('includeClosed') === '1';
  const [items, openCount] = await Promise.all([
    listAttentionItems(memberId, { includeClosed }),
    countOpenAttention(memberId),
  ]);
  return NextResponse.json({ items, openCount });
}

// PATCH /api/team/attention — recipient transitions: open | resolve | decline.
// S5: the service enforces actor == recipient_id (a 404 means not-yours / not-found).
export async function PATCH(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { itemId, action } = await request.json().catch(() => ({}));
  if (!itemId || typeof itemId !== 'string') {
    return NextResponse.json({ error: 'itemId required' }, { status: 400 });
  }

  let ok = false;
  switch (action) {
    case 'open':    ok = await markAttentionOpened(itemId, memberId); break;
    case 'resolve': ok = await resolveAttentionItem(itemId, memberId); break;
    case 'decline': ok = await declineAttentionItem(itemId, memberId); break;
    default: return NextResponse.json({ error: 'invalid action' }, { status: 400 });
  }
  if (!ok) return NextResponse.json({ error: 'not_found_or_forbidden' }, { status: 404 });
  return NextResponse.json({ ok: true });
}

// DELETE /api/team/attention?itemId=… — sender withdraws their OWN loop (S5).
export async function DELETE(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const itemId = new URL(request.url).searchParams.get('itemId');
  if (!itemId) return NextResponse.json({ error: 'itemId required' }, { status: 400 });

  const ok = await withdrawAttentionItem(itemId, memberId);
  if (!ok) return NextResponse.json({ error: 'not_found_or_forbidden' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
