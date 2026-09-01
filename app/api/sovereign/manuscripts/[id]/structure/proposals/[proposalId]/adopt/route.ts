/**
 * WS2-06A — the member makes a reviewed reading canonical.
 *
 * ITS OWN BOUNDARY, like /structure/read. The proposals routes are GET-only and
 * /structure is the authored-structure mutation boundary for one unit at a time;
 * neither is the place for the single act that converts a whole reviewed reading
 * into the Work's structure.
 *
 * THE ONLY THING THE CLIENT SUPPLIES IS THE REVISION IT WAS LOOKING AT. No tree
 * crosses this wire. The structure written is the stored `reviewed` of the named
 * proposal, re-read inside the transaction — a client that could post a tree
 * could make canonical a structure nobody reviewed.
 *
 * EVERY REFUSAL WRITES NOTHING. The act is one transaction.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { adoptProposal, type AdoptRefusal } from '@/lib/manuscript/structure/adopt';

export const dynamic = 'force-dynamic';

const STATUS: Record<AdoptRefusal, number> = {
  not_found: 404,
  /* The member's screen is behind. 409 so the surface reloads rather than retries. */
  stale_revision: 409,
  already_adopted: 409,
  topology_changed: 409,
  structure_exists: 409,
  /* Nothing to adopt is not a failure of the request; the reading simply found
     no divisions. 422: well-formed, but there is no act to perform. */
  nothing_to_adopt: 422,
  unknown_section: 409,
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; proposalId: string }> },
) {
  const { id: manuscriptId, proposalId } = await params;

  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const body = await req.json().catch(() => null) as { reviewRevision?: unknown } | null;
  const revision = body?.reviewRevision;
  /* Asserted, not coerced. `Number(undefined)` is NaN and `Number(null)` is 0 —
     and 0 is a real revision, so a coercing read would adopt revision 0 for a
     caller that sent nothing at all. */
  if (typeof revision !== 'number' || !Number.isInteger(revision) || revision < 0) {
    return NextResponse.json(
      { refusal: 'bad_request', detail: 'reviewRevision must be a non-negative integer' },
      { status: 400 });
  }

  const r = await adoptProposal(manuscriptId, memberId, proposalId, revision);
  if (r.status === 'refused') {
    return NextResponse.json(
      { refusal: r.refusal, ...(r.detail ? { detail: r.detail } : {}) },
      { status: STATUS[r.refusal] });
  }

  return NextResponse.json({
    adopted: true,
    unitsCreated: r.unitsCreated,
    sectionsPlaced: r.sectionsPlaced,
    adoptedReviewRevision: r.adoptedReviewRevision,
  }, { status: 201 });
}
