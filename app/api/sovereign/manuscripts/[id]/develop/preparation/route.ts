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
import { convertDraftToSections, type ConversionAuthority } from '@/lib/manuscript/sections/convertDraft';

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
  /* The draft moved after the member was told. They re-read and act on the
     state that actually holds — a conflict, not a failure. */
  return 409;
}

/**
 * THE TWO ACTS, AND WHY NEITHER MAY STAND FOR THE OTHER.
 *
 * Founder ruling (2026-09-06): an exact draft is prepared under MECHANICAL
 * authority — the member initiates, and is not asked to agree to a fact that
 * is mechanically established. A diverged draft is converted under the
 * member's CONFIRMATION of a divergence they were shown.
 *
 * So the act names itself. Accepting `prepare` over a diverged Work would
 * convert a draft the member has written in without ever showing them what
 * moved; accepting `confirm_conversion` over an exact one would record a
 * consent that was never required and was therefore never given meaning. The
 * server decides which state holds and refuses the act that does not fit it.
 */
const ACT_FOR = { exact: 'prepare', diverged: 'confirm_conversion' } as const;

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

  /* The body may carry the act and the digest of the state it was granted
     over, and nothing else. A client that could send boundaries, offsets or
     section text could place a cut the member never saw and the Source never
     had. */
  const keys = Object.keys((body as object) ?? {});
  const foreign = keys.filter((k) => k !== 'act' && k !== 'stateDigest');
  if (foreign.length > 0) {
    return NextResponse.json({ refusal: 'foreign_field', detail: foreign.join(', ') }, { status: 400 });
  }

  const { act, stateDigest } = (body ?? {}) as { act?: unknown; stateDigest?: unknown };
  if (act !== 'prepare' && act !== 'confirm_conversion') {
    return NextResponse.json({ refusal: 'act_required' }, { status: 400 });
  }
  /* ⛔ THE DIGEST IS MANDATORY ON BOTH PATHS, for different reasons that both
     end here. On the diverged path it names the divergence the member was
     shown — source boundaries may be offered and may not be silently imposed
     on a changed draft. On the exact path it names the unchanged state they
     were told about, so a save landing after the panel cannot be prepared
     under a permission granted over something else. An act naming no state is
     refused rather than run with the check skipped. */
  if (typeof stateDigest !== 'string' || stateDigest.length === 0) {
    return NextResponse.json({ refusal: 'state_digest_required' }, { status: 400 });
  }

  /* Re-resolve rather than trusting the client's account of the state. A
     surface that believed a Work convertible does not make it so, and
     `unresolvable` must never reach the conversion service at all. */
  const state = await resolveDevelopPreparation(id, memberId);
  if (state.kind !== 'exact' && state.kind !== 'diverged') {
    return NextResponse.json({ refusal: 'not_convertible', state: state.kind }, { status: 409 });
  }
  if (act !== ACT_FOR[state.kind]) {
    return NextResponse.json(
      { refusal: 'wrong_authority', state: state.kind, expected: ACT_FOR[state.kind] },
      { status: 409 });
  }

  const authority: ConversionAuthority = state.kind === 'exact'
    ? { authority: 'mechanical', stateDigest }
    : { authority: 'member_confirmation', disclosureDigest: stateDigest };

  const result = await convertDraftToSections(id, memberId, authority);
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
