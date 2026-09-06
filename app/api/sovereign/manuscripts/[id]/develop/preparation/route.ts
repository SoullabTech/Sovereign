/**
 * DEVELOP PREPARATION — the boundary behind the one gesture that makes a Work
 * readable.
 *
 *   GET   which of the preparation states this Work is in, with the
 *         divergence a member must be shown before confirming anything
 *   POST  the member's confirmation: convert this legacy draft
 *
 * TWO PREPARATION PATHS, ONE HUMAN GESTURE, NO SECOND LIFECYCLE. A Work with
 * no working draft is prepared by the CANONICAL draft-creation POST
 * (`/api/sovereign/manuscripts/[id]/draft`) — the same path WRITE has always
 * used, invoked explicitly by the surface rather than reimplemented here. A
 * Work with a legacy draft is prepared by WS2-04A's conversion service. This
 * route owns the second and deliberately not the first: a second place that
 * can mint a working draft is a second lifecycle, and the two would drift.
 *
 * ⛔ THE READ NEVER PREPARES. GET resolves and returns; it converts nothing
 * and creates nothing. DEVELOP promises that reading a Work changes nothing,
 * and a surface that quietly initialized authoring state while answering
 * "is this readable?" would break that promise at the exact moment the member
 * was told it held.
 *
 * ⛔ NOTHING HERE WRITES TO THE WORK. Conversion is a REPRESENTATION change,
 * gated by WS2-04A's round-trip invariant: the sections it produces must
 * reconstruct the draft byte for byte or the transaction rolls back. The
 * member's characters do not move.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { resolveDevelopPreparation } from '@/lib/manuscript/development/preparation';
import { convertDraftToSections } from '@/lib/manuscript/sections/convertDraft';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  const { id } = await params;
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  return NextResponse.json(await resolveDevelopPreparation(id, memberId));
}

/** A conversion refusal, in HTTP. None of them are retryable as-is. */
function statusFor(refusal: string): number {
  if (refusal === 'draft_not_found') return 404;
  /* The draft moved after the disclosure. The member re-reads and confirms
     the state that actually holds — a conflict, not a failure. */
  if (refusal === 'disclosure_stale') return 409;
  return 409;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  const { id } = await params;
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ refusal: 'malformed' }, { status: 400 });
  }

  /* The body may carry the confirmation and the disclosure it stands on, and
     nothing else. A client that could send boundaries, offsets or section
     text could place a cut the member never saw and the Source never had. */
  const keys = Object.keys((body as object) ?? {});
  const foreign = keys.filter((k) => k !== 'confirm' && k !== 'disclosure');
  if (foreign.length > 0) {
    return NextResponse.json({ refusal: 'foreign_field', detail: foreign.join(', ') }, { status: 400 });
  }

  const { confirm, disclosure } = (body ?? {}) as { confirm?: unknown; disclosure?: unknown };
  if (confirm !== 'convert') {
    return NextResponse.json({ refusal: 'confirmation_required' }, { status: 400 });
  }
  /* ⛔ THE DISCLOSURE IS MANDATORY, not merely accepted when offered. Founder
     ruling: source boundaries may be OFFERED and may not be silently imposed
     on a changed draft. A confirmation that names no disclosed state is
     indistinguishable from a conversion nobody was shown, so it is refused
     here rather than converted with the check skipped. */
  if (typeof disclosure !== 'string' || disclosure.length === 0) {
    return NextResponse.json({ refusal: 'disclosure_required' }, { status: 400 });
  }

  /* Re-resolve rather than trusting the client's account of the state. A
     surface that believed a Work convertible does not make it so, and
     `unresolvable` must never reach the conversion service as a confirmation. */
  const state = await resolveDevelopPreparation(id, memberId);
  if (state.kind !== 'convertible') {
    return NextResponse.json({ refusal: 'not_convertible', state: state.kind }, { status: 409 });
  }

  const result = await convertDraftToSections(id, memberId, disclosure);
  if (result.status === 'refused') {
    return NextResponse.json(
      { refusal: result.refusal, detail: result.detail },
      { status: statusFor(result.refusal ?? '') },
    );
  }

  return NextResponse.json({
    status: result.status,
    sectionCount: result.sectionCount,
    draftVersion: result.draftVersion,
  });
}
