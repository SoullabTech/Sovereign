/**
 * ADOPTION-01 · PHASE B — THE ADOPTION GESTURE.
 *
 *   POST  adopt one exact authored version into the Work
 *
 * ⭐ Same posture as the thread, turn and version routes: ⛔ off by default and
 * 404 — not 403 — ⛔ verified identity only, ⛔ a CLOSED request shape whose
 * unknown keys are refused AND NAMED rather than ignored.
 *
 * ⭐⭐ THE ROUTE IS NOT AN AUTHORITY. It carries two ids across the boundary
 * and renders what the two existing acts said. It does not evaluate fit, does
 * not read the manuscript, does not mint a base version, does not locate the
 * change, and does not decide any of the outcomes it reports.
 *
 * ── ⛔ THE STATUS CODE IS NOT THE OUTCOME ─────────────────────────────────
 *
 *     200 applied          the receipt is whole
 *     200 work_moved       ⭐ a TRUE report about the member's manuscript,
 *                          which is not an error and must not be logged as one
 *     409 system_refusal   ⛔ the Studio could not act — abnormal, so the code
 *                          says so where infrastructure can see it
 *     404 / 400            the relationship or the named version is unreadable
 *
 * The body carries `kind` in every case, and a client that read only the code
 * would still have to read the body to know what happened. ⭐ The code exists
 * so a system failure is visible to operations, ⛔ never so the browser can
 * skip the truth.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { resolveCanonicalIdentity } from '@/lib/maia/canonical-turn';
import { adoptVersion, type AdoptionOutcome } from '@/lib/manuscript/editorialRuntime/adoption';

export const dynamic = 'force-dynamic';

const enabled = () => process.env.WRITERS_STUDIO_EDITORIAL_ENABLED === '1';

/**
 * ⛔ CLOSED, AND DELIBERATELY TWO KEYS.
 *
 * ⚠️ `baseVersion`, `range`, `expectedText`, `chainId`, `idempotencyKey` and
 * `authorizationId` are all absent ON PURPOSE. A caller that sent one and got
 * 200 would believe it had standing it does not have — and an idempotency token
 * in particular would be a second identity laid over a permission that already
 * has a natural one.
 */
const BODY_KEYS = ['threadId', 'versionId'] as const;

function statusFor(outcome: AdoptionOutcome): number {
  switch (outcome.kind) {
    case 'applied':    return 200;
    /* ⭐ Not an error. The member wrote there; that is their manuscript
       working correctly, and a 4xx would teach the log otherwise. */
    case 'work_moved': return 200;
    case 'system_refusal': return 409;
    case 'relationship_refusal':
      return outcome.reason === 'not_editorial' ? 400 : 404;
  }
}

export async function POST(request: NextRequest) {
  if (!enabled()) return new NextResponse(null, { status: 404 });

  const identity = await resolveCanonicalIdentity(request);
  if (identity.status !== 'verified') {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  let raw: unknown;
  try { raw = await request.json(); }
  catch { return NextResponse.json({ error: 'invalid JSON' }, { status: 400 }); }

  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return NextResponse.json({ error: 'a JSON object is required' }, { status: 400 });
  }
  const b = raw as Record<string, unknown>;

  const stray = Object.keys(b).filter(
    (k) => !(BODY_KEYS as readonly string[]).includes(k));
  if (stray.length) {
    return NextResponse.json({
      error: `unknown field(s): ${stray.join(', ')} — these are derived server-side, minted by the authorizing act, or not open in this cut, and carry no standing here`,
    }, { status: 400 });
  }

  if (typeof b.threadId !== 'string' || b.threadId.length === 0) {
    return NextResponse.json({ error: 'threadId is required' }, { status: 400 });
  }
  /* ⭐⭐ REQUIRED AND EXPLICIT. There is no "adopt the latest" spelling of this
     request, and there is no default: an absent version id is refused rather
     than resolved to anything. */
  if (typeof b.versionId !== 'string' || b.versionId.length === 0) {
    return NextResponse.json({ error: 'versionId is required' }, { status: 400 });
  }

  const outcome = await adoptVersion({
    identity, threadId: b.threadId, versionId: b.versionId,
  });
  /* ⭐ THE OUTCOME, WHOLE. ⛔ Not flattened into `{ ok }`, and `permission` is
     never dropped — that field is the difference between "you never authorized
     this" and "you authorized it and it could not run". */
  return NextResponse.json(outcome, { status: statusFor(outcome) });
}
