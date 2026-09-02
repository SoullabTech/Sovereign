/**
 * WS2-06A — the member authors the reviewed structure into the Work.
 *
 * ITS OWN BOUNDARY, like /structure/read. The proposals routes read and reshape
 * the member's copy of a reading; /structure is the authored-structure mutation
 * boundary for one unit at a time. Neither is the place for the single act that
 * converts a whole reviewed reading into the Work's structure, and folding it
 * into either would give a route that legitimately handles small edits the power
 * to perform the crossing.
 *
 * THE ONLY THING THE CLIENT SUPPLIES IS THE REVISION IT WAS LOOKING AT.
 * No tree, no section ids, no titles, no ranges, no provenance keys. The
 * structure written is the stored `reviewed` of the named proposal, re-read
 * inside the transaction. A client that could post a tree could make canonical
 * a structure nobody reviewed, under the member's own name.
 *
 * IT RETURNS THE STRUCTURE THAT PERSISTED, NOT COUNTS. The room must be able to
 * show the writer what they authored without inferring it. Counts would make the
 * surface reconstruct the outcome from numbers, or refetch and hope the two
 * agree; this re-reads canonical structure and hands it back.
 *
 * POST ONLY. There is no GET, PUT or DELETE here. Adoption is not idempotent —
 * it is a once-per-Work authorial act — and the second attempt is refused as
 * `already_adopted` rather than quietly succeeding.
 *
 * EVERY REFUSAL WRITES NOTHING, established in the command rather than promised
 * here: every refusal is decided before the first write.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import {
  authorStructureFromProposal, type AuthorStructureRefusal,
} from '@/lib/manuscript/structure/authorStructure';
import { loadStructure } from '@/lib/manuscript/structure/structureService';

export const dynamic = 'force-dynamic';

const STATUS: Record<AuthorStructureRefusal, number> = {
  not_found: 404,
  /* The member's screen is behind. 409 so the surface reloads rather than
     replaying an act aimed at a reading that has moved. */
  stale_revision: 409,
  already_adopted: 409,
  topology_changed: 409,
  structure_exists: 409,
  /* Nothing to author is not a malformed request; the reading simply found no
     divisions. 422: well-formed, but there is no act to perform. */
  nothing_to_adopt: 422,
  /* The reviewed tree does not describe this draft. 409, and each arrives as
     itself — never as a 500 from a database constraint standing in for
     validation. */
  unknown_section: 409,
  inverted_range: 409,
  overlapping_siblings: 409,
  child_outside_parent: 409,
  duplicate_unit_id: 409,
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; proposalId: string }> },
) {
  const { id: manuscriptId, proposalId } = await params;

  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const body = await req.json().catch(() => null) as { expectedReviewRevision?: unknown } | null;
  const revision = body?.expectedReviewRevision;
  /* Asserted, not coerced. `Number(undefined)` is NaN and `Number(null)` is 0 —
     and 0 is a real revision, so a coercing read would author revision 0 for a
     caller that sent nothing at all. */
  if (typeof revision !== 'number' || !Number.isInteger(revision) || revision < 0) {
    return NextResponse.json(
      { refusal: 'bad_request', detail: 'expectedReviewRevision must be a non-negative integer' },
      { status: 400 });
  }

  const r = await authorStructureFromProposal(manuscriptId, memberId, proposalId, revision);
  if (r.status === 'refused') {
    return NextResponse.json(
      { refusal: r.refusal, ...(r.detail ? { detail: r.detail } : {}) },
      { status: STATUS[r.refusal] });
  }

  /* What actually persisted. Read after the transaction committed, so this is
     the Work's structure as it now stands rather than a projection of what was
     planned. */
  const persisted = await loadStructure(manuscriptId, memberId);

  return NextResponse.json({
    authored: true,
    proposalId: r.proposalId,
    adoptedReviewRevision: r.adoptedReviewRevision,
    unitCount: r.unitCount,
    sectionCount: r.sectionCount,
    /* Null only if the read refused after a committed write — the act stands
       either way, and the surface reloads rather than being told a shape that
       was not measured. */
    structure: persisted.status === 'ok' ? persisted.value : null,
  }, { status: 201 });
}
