/**
 * WS2-05B step 5b - reading and reshaping a proposal.
 *
 * THIS ROUTE CANNOT AUTHOR STRUCTURE. It reads a proposal and applies review
 * operations to the member's copy. It does not import the structure service,
 * and adoption is not built: `Use this structure` has no endpoint here, so the
 * surface being tested is INCAPABLE of a canonical write rather than merely
 * declining to make one.
 *
 * REVISION AUTHORITY ON EVERY WRITE. The client sends the revision it believed;
 * a mismatch is refused with the current state so a stale tab reloads rather
 * than replaying its intended edit onto someone else's. Same discipline as the
 * draft's `version` in 04B.
 *
 * IDENTITY ONLY OFF THE WIRE. `choose-alternative` carries an id; the server
 * resolves it against the IMMUTABLE stored interpretation. No structural tree
 * is ever accepted from a client.
 *
 * THE REQUEST IS PARSED, NOT ASSERTED. `parseReviewRequest` closes the whole
 * envelope - the operation's discriminant AND the two fields around it, both of
 * which change what the call does when merely cast. A cast is a claim about a
 * request the client writes; this is a check.
 *
 * ONE APPLICATION PER GESTURE. The post-image returned by a preview is the one
 * a commit stores, because it is the same object rather than a second run that
 * is expected to agree.
 *
 * NOTHING IS REPORTED THAT WAS NOT MEASURED. `staleAsRead` is computed against
 * the draft as it stands, and is `null` where the comparison cannot be made.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { loadProposal, updateReviewed, type ProposalRefusal } from '@/lib/manuscript/structure/proposalStore';
import type { ReviewContext, ReviewRefusal } from '@/lib/manuscript/structure/review';
import { previewOperation } from '@/lib/writersStudio/reviewPresentation';
import { parseReviewRequest } from '@/lib/manuscript/structure/reviewOperationParser';
import { interpretationInputHash } from '@/lib/manuscript/structure/interpret';

export const dynamic = 'force-dynamic';

const PROPOSAL_STATUS: Record<ProposalRefusal, number> = {
  not_found: 404,
  stale_revision: 409,
  already_adopted: 409,
  prose_in_payload: 422,
};

const REVIEW_STATUS: Record<ReviewRefusal, number> = {
  unknown_unit: 404,
  unknown_parent: 404,
  unknown_section: 404,
  unknown_alternative: 404,
  inverted_range: 422,
  overlapping_siblings: 422,
  child_outside_parent: 422,
  unit_has_children: 409,
  would_cycle: 422,
  duplicate_unit_id: 422,
  parent_still_spans_child: 409,
  child_splits_parent: 422,
  parent_would_be_empty: 422,
  parents_not_adjacent: 422,
  not_at_the_shared_edge: 422,
  not_nested: 409,
  empty_name: 422,
  /* Defence in depth. The HTTP parser refuses an unrecognised operation before
     the engine sees it, so this arm is reachable only from a TypeScript caller
     that has defeated its own types - a bad request either way. */
  unknown_operation: 400,
};

/** Sections of the addressable draft, ordered. Ids only cross this boundary. */
async function orderedSections(manuscriptId: string, memberId: string) {
  const { query } = await import('@/lib/db/postgres');
  const r = await query<{ id: string; position: number; heading: string | null }>(
    `SELECT s.id, s.position, ms.heading
       FROM manuscript_draft_sections s
       JOIN manuscript_working_drafts d ON d.id = s.draft_id
       JOIN member_manuscripts m ON m.id = d.manuscript_id
       LEFT JOIN manuscript_sections ms ON ms.id = s.source_section_id
      WHERE d.manuscript_id = $1 AND m.member_id = $2
        AND d.section_addressable_at IS NOT NULL
      ORDER BY s.position ASC`,
    [manuscriptId, memberId]);
  return r.rows;
}

/**
 * The bodies a reading actually read, by id, for hashing ONLY.
 *
 * Prose crosses this boundary in memory and leaves it as a digest. Nothing here
 * is returned to the client, logged, or stored.
 */
async function readBodies(
  manuscriptId: string, memberId: string, ids: readonly string[],
): Promise<Map<string, string>> {
  if (ids.length === 0) return new Map();
  const { query } = await import('@/lib/db/postgres');
  const r = await query<{ id: string; text: string }>(
    `SELECT s.id, s.text
       FROM manuscript_draft_sections s
       JOIN manuscript_working_drafts d ON d.id = s.draft_id
       JOIN member_manuscripts m ON m.id = d.manuscript_id
      WHERE d.manuscript_id = $1 AND m.member_id = $2
        AND d.section_addressable_at IS NOT NULL
        AND s.id = ANY($3::uuid[])`,
    [manuscriptId, memberId, ids]);
  return new Map(r.rows.map((row) => [row.id, row.text]));
}

/**
 * Has the material this reading rests on been rewritten since it was made?
 *
 * Measured, not assumed. The frozen `interpretation_input_hash` covers every
 * heading plus exactly the bodies that were supplied; the same function is run
 * over the draft as it stands now and the two are compared.
 *
 * `null` means UNMEASURED - the coverage names sections this draft no longer
 * holds, so the question cannot be answered honestly. That is a third answer,
 * not a quiet `false`: a surface must be able to say "I do not know" rather
 * than reassure a member on the strength of a comparison that never ran.
 */
async function staleAsRead(
  manuscriptId: string, memberId: string,
  sections: readonly { id: string; position: number; heading: string | null }[],
  coveredIds: readonly string[],
  frozenHash: string,
): Promise<boolean | null> {
  const present = new Set(sections.map((s) => s.id));
  if (coveredIds.some((cid) => !present.has(cid))) return null;
  const bodies = await readBodies(manuscriptId, memberId, coveredIds);
  if (bodies.size !== coveredIds.length) return null;
  return interpretationInputHash(sections, bodies) !== frozenHash;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; proposalId: string }> },
) {
  const { id, proposalId } = await params;
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const p = await loadProposal(proposalId, memberId);
  if (p.status === 'refused') {
    return NextResponse.json({ refusal: p.refusal }, { status: PROPOSAL_STATUS[p.refusal] });
  }
  if (p.value.manuscriptId !== id) {
    return NextResponse.json({ refusal: 'not_found' }, { status: 404 });
  }

  const sections = await orderedSections(id, memberId);
  const stale = await staleAsRead(
    id, memberId, sections, p.value.coverage.bodies.sectionIds,
    p.value.interpretationInputHash);

  return NextResponse.json({
    proposalId: p.value.id,
    /* Frozen. What the system proposed, for the surface to show beside what the
       member has made of it. */
    interpretation: p.value.interpretation,
    coverage: p.value.coverage,
    reviewed: p.value.reviewed,
    reviewRevision: p.value.reviewRevision,
    adoptedAt: p.value.adoptedAt,
    /* Whether anything the reading rests on has been rewritten since - or null
       when that could not be measured. The member is told; nothing is decided
       for them. */
    staleAsRead: stale,
    sections,
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; proposalId: string }> },
) {
  const { id, proposalId } = await params;
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ refusal: 'malformed', detail: 'not JSON' }, { status: 400 });
  }

  /* CLOSED AT THE BOUNDARY - THE WHOLE ENVELOPE, NOT ONLY THE OPERATION.
     `as ReviewRequest` is an assertion about a request the client writes. The
     two fields around the operation both change what the call DOES if they are
     merely cast: `previewOnly: "false"` is truthy, so an intended commit
     returns an unsaved preview and says nothing; a fractional revision matches
     nothing and reaches the member as an invented editing conflict. */
  const parsed = parseReviewRequest(raw);
  if (!parsed.ok) {
    return NextResponse.json({ refusal: 'malformed', detail: parsed.reason }, { status: 400 });
  }
  const { operation, expectedReviewRevision, previewOnly } = parsed.request;

  const p = await loadProposal(proposalId, memberId);
  if (p.status === 'refused') {
    return NextResponse.json({ refusal: p.refusal }, { status: PROPOSAL_STATUS[p.refusal] });
  }
  if (p.value.manuscriptId !== id) {
    return NextResponse.json({ refusal: 'not_found' }, { status: 404 });
  }

  /* Checked here as well as in the store, so a stale client is told BEFORE the
     work of computing a post-image it cannot commit, and gets the current state
     to reload rather than an opaque conflict. */
  if (p.value.reviewRevision !== expectedReviewRevision) {
    return NextResponse.json({
      refusal: 'stale_revision',
      reviewRevision: p.value.reviewRevision,
      reviewed: p.value.reviewed,
    }, { status: 409 });
  }

  const sections = await orderedSections(id, memberId);

  /* Alternatives come from the FROZEN interpretation, never from the request. */
  const context: ReviewContext = {
    alternatives: 'alternatives' in p.value.interpretation
      ? p.value.interpretation.alternatives
      : undefined,
  };

  const preview = previewOperation(p.value.reviewed, operation, sections, context);
  if (preview.status === 'refused') {
    return NextResponse.json({ refusal: preview.refusal, detail: preview.detail },
      { status: REVIEW_STATUS[preview.refusal] ?? 422 });
  }

  if (previewOnly) {
    /* Nothing is persisted. `reviewed` is returned alongside the rows so a
       caller - or a witness - can compare the previewed post-image against the
       committed one and see that they are byte-identical, rather than take the
       claim on trust. */
    return NextResponse.json({
      preview: preview.rows,
      reviewed: preview.reviewed,
      reviewRevision: p.value.reviewRevision,
    });
  }

  /* ONE APPLICATION, NOT TWO. `previewOperation` produced this post-image BY
     APPLYING the operation; re-running the engine to get a second one would
     reintroduce exactly the preview/commit divergence the preview exists to
     rule out. What is shown is what is stored. */
  const saved = await updateReviewed(
    proposalId, memberId, expectedReviewRevision, preview.reviewed);
  if (saved.status === 'refused') {
    return NextResponse.json({ refusal: saved.refusal, detail: saved.detail },
      { status: PROPOSAL_STATUS[saved.refusal] });
  }

  return NextResponse.json({
    reviewed: preview.reviewed,
    reviewRevision: saved.value.reviewRevision,
    applied: preview.rows,
  });
}
