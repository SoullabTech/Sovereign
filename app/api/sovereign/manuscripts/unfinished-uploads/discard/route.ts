// Production web requires force-dynamic for runtime database access / auth.
// Capacitor builds: API routes are moved aside by scripts/build-capacitor.sh
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Remove an unfinished upload or an unattached original (D3).
 *
 * POST { id: <uuid>, kind: 'incomplete' | 'unclaimed' }
 *
 * `incomplete` → an upload that never reached a recorded arrival (discardIncompleteLanding).
 * `unclaimed`  → an original that was recorded but never attached to a Work (discardUnclaimedArrival).
 *
 * The id is only ever looked up UNDER the signed-in member, so another member's id is indistinguishable from an
 * absent one (404). The response states what actually happened and never more:
 *
 *   200 removed         the record, the key and the stored bytes are gone, and the deletion is sealed.
 *   202 removal_pending the record and key are gone but a stored copy or the deletion seal is still owed. It is queued
 *                       durably and will be retried; this is NOT reported as removed.
 *   404 not_found       nothing held under that id for this member (including a second press).
 *   409 in_progress     another request may still be writing it. Try again in a few minutes.
 *   409 already_recorded / attached_to_work
 *                       it has become an arrival, or belongs to a Work. The caller should refresh the list; an attached
 *                       original is removed by deleting the Work, never by this door.
 *
 * Not gated on the release manifest, the pilot roster or Sanctuary posture: removal is the member's right over what is
 * held for them, and none of those gates may stand in front of it. Identity is required; the access matrix has already
 * verified it (this route is not excluded from the middleware matcher).
 */
import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { discardIncompleteLanding } from '@/lib/manuscript/source/discardIncompleteLanding';
import { discardUnclaimedArrival } from '@/lib/manuscript/source/discardUnclaimedArrival';
import { memberRef } from '@/lib/privacy/memberRef';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const NO_STORE = { 'Cache-Control': 'no-store' };

export async function POST(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }
  const id = (body as { id?: unknown } | null)?.id;
  const kind = (body as { kind?: unknown } | null)?.kind;
  if (typeof id !== 'string' || !UUID_PATTERN.test(id) || (kind !== 'incomplete' && kind !== 'unclaimed')) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }

  try {
    if (kind === 'incomplete') {
      const outcome = await discardIncompleteLanding(id, memberId);
      switch (outcome.kind) {
        case 'discarded':
          return NextResponse.json({ result: 'removed' }, { headers: NO_STORE });
        case 'erasure_pending':
          return NextResponse.json({ result: 'removal_pending' }, { status: 202, headers: NO_STORE });
        case 'not_found':
          return NextResponse.json({ result: 'not_found' }, { status: 404, headers: NO_STORE });
        case 'in_progress':
          return NextResponse.json({ result: 'in_progress' }, { status: 409, headers: { ...NO_STORE, 'Retry-After': '600' } });
        case 'already_recorded':
          return NextResponse.json({ result: 'already_recorded' }, { status: 409, headers: NO_STORE });
      }
    }
    const outcome = await discardUnclaimedArrival(id, memberId);
    switch (outcome.kind) {
      case 'discarded':
        return NextResponse.json({ result: 'removed' }, { headers: NO_STORE });
      case 'erasure_pending':
        return NextResponse.json({ result: 'removal_pending' }, { status: 202, headers: NO_STORE });
      case 'not_found':
        return NextResponse.json({ result: 'not_found' }, { status: 404, headers: NO_STORE });
      case 'already_claimed':
        return NextResponse.json({ result: 'attached_to_work' }, { status: 409, headers: NO_STORE });
    }
  } catch (error) {
    // Name and member reference only: never the error object, which can carry SQL text and parameters.
    console.error('[MAIA/press] unfinished upload removal failed', {
      memberRef: memberRef(memberId),
      kind,
      name: error instanceof Error ? error.name : 'unknown',
    });
    return NextResponse.json({ error: 'removal_failed' }, { status: 500, headers: NO_STORE });
  }
}
