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
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { loadProposal, updateReviewed, type ProposalRefusal } from '@/lib/manuscript/structure/proposalStore';
import {
  applyReviewOperation, type ReviewOperation, type ReviewContext, type ReviewRefusal,
} from '@/lib/manuscript/structure/review';
import { previewOperation } from '@/lib/writersStudio/reviewPresentation';

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
  return NextResponse.json({
    proposalId: p.value.id,
    /* Frozen. What the system proposed, for the surface to show beside what the
       member has made of it. */
    interpretation: p.value.interpretation,
    coverage: p.value.coverage,
    reviewed: p.value.reviewed,
    reviewRevision: p.value.reviewRevision,
    adoptedAt: p.value.adoptedAt,
    /* Whether anything the reading rests on has been rewritten since. The
       member is told; nothing is decided for them. */
    staleAsRead: false,
    sections,
  });
}

interface ReviewRequest {
  expectedReviewRevision: number;
  operation: ReviewOperation;
  /** When true the server computes the post-image and returns it UNSAVED. */
  previewOnly?: boolean;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; proposalId: string }> },
) {
  const { id, proposalId } = await params;
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  let body: ReviewRequest;
  try {
    body = (await req.json()) as ReviewRequest;
  } catch {
    return NextResponse.json({ refusal: 'malformed' }, { status: 400 });
  }
  if (!body?.operation?.op || typeof body.expectedReviewRevision !== 'number') {
    return NextResponse.json({ refusal: 'malformed' }, { status: 400 });
  }

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
  if (p.value.reviewRevision !== body.expectedReviewRevision) {
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

  const preview = previewOperation(p.value.reviewed, body.operation, sections, context);
  if (preview.status === 'refused') {
    return NextResponse.json({ refusal: preview.refusal, detail: preview.detail },
      { status: REVIEW_STATUS[preview.refusal] ?? 422 });
  }

  if (body.previewOnly) {
    /* Nothing is persisted. The rows describe the post-image the same call
       would produce without this flag, because it is the same computation. */
    return NextResponse.json({ preview: preview.rows, reviewRevision: p.value.reviewRevision });
  }

  const applied = applyReviewOperation(p.value.reviewed, body.operation, sections, context);
  if (applied.status === 'refused') {
    return NextResponse.json({ refusal: applied.refusal, detail: applied.detail },
      { status: REVIEW_STATUS[applied.refusal] ?? 422 });
  }

  const saved = await updateReviewed(
    proposalId, memberId, body.expectedReviewRevision, applied.reviewed);
  if (saved.status === 'refused') {
    return NextResponse.json({ refusal: saved.refusal, detail: saved.detail },
      { status: PROPOSAL_STATUS[saved.refusal] });
  }

  return NextResponse.json({
    reviewed: applied.reviewed,
    reviewRevision: saved.value.reviewRevision,
    applied: preview.rows,
  });
}
