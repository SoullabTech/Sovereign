/**
 * WS2-05B step 5b - the review surface's client.
 *
 * IDENTITY AND GUARDS ONLY GO UP THE WIRE. Every mutation carries the revision
 * the member's screen was built from; `choose-alternative` carries an id. No
 * structural tree is ever sent, so the server cannot be told what the member's
 * structure is - only what gesture they made.
 *
 * THERE IS NO ADOPTION CALL HERE. Not disabled, not commented out: absent.
 * While the surface is being proven, it must be incapable of a canonical write
 * rather than choosing not to make one.
 */

import { apiFetch } from '@/lib/http/apiBase';
import type { StructureInterpretation } from '@/lib/manuscript/structure/interpret';
import type { ReviewedStructure, ReviewOperation } from '@/lib/manuscript/structure/review';
import type { ChangeRow } from './reviewPresentation';
import type { EvidenceCoverage } from '@/lib/manuscript/structure/evidence';

export interface ProposalView {
  proposalId: string;
  interpretation: StructureInterpretation;
  coverage: EvidenceCoverage;
  reviewed: ReviewedStructure;
  reviewRevision: number;
  adoptedAt: string | null;
  staleAsRead: boolean;
  sections: { id: string; position: number; heading: string | null }[];
}

export type ReviewOutcome =
  | { ok: true; reviewed: ReviewedStructure; reviewRevision: number; applied: ChangeRow[] }
  | { ok: false; refusal: string; detail?: string;
      /** Returned on a stale revision, so the surface can reload rather than retry. */
      current?: { reviewed: ReviewedStructure; reviewRevision: number } };

export type PreviewOutcome =
  | { ok: true; rows: ChangeRow[] }
  | { ok: false; refusal: string; detail?: string };

const url = (manuscriptId: string, proposalId: string) =>
  `/api/sovereign/manuscripts/${manuscriptId}/structure/proposals/${proposalId}`;

export async function fetchProposal(
  manuscriptId: string, proposalId: string,
): Promise<{ ok: true; view: ProposalView } | { ok: false; refusal: string }> {
  try {
    const res = await apiFetch(url(manuscriptId, proposalId), { method: 'GET' });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { ok: false, refusal: String(body?.refusal ?? `http_${res.status}`) };
    }
    return { ok: true, view: (await res.json()) as ProposalView };
  } catch {
    /* A transport failure is not an empty proposal. Reporting one would draw a
       Work nobody has read. */
    return { ok: false, refusal: 'unreachable' };
  }
}

async function post(
  manuscriptId: string, proposalId: string, body: unknown,
): Promise<{ status: number; json: Record<string, unknown> }> {
  const res = await apiFetch(url(manuscriptId, proposalId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: res.status, json: await res.json().catch(() => ({})) };
}

export async function previewGesture(
  manuscriptId: string, proposalId: string,
  expectedReviewRevision: number, operation: ReviewOperation,
): Promise<PreviewOutcome> {
  try {
    const { status, json } = await post(manuscriptId, proposalId,
      { expectedReviewRevision, operation, previewOnly: true });
    if (status >= 400) {
      return { ok: false, refusal: String(json.refusal ?? `http_${status}`),
        detail: json.detail as string | undefined };
    }
    return { ok: true, rows: (json.preview ?? []) as ChangeRow[] };
  } catch {
    return { ok: false, refusal: 'unreachable' };
  }
}

export async function applyGesture(
  manuscriptId: string, proposalId: string,
  expectedReviewRevision: number, operation: ReviewOperation,
): Promise<ReviewOutcome> {
  try {
    const { status, json } = await post(manuscriptId, proposalId,
      { expectedReviewRevision, operation });
    if (status >= 400) {
      return {
        ok: false,
        refusal: String(json.refusal ?? `http_${status}`),
        detail: json.detail as string | undefined,
        current: json.reviewed
          ? { reviewed: json.reviewed as ReviewedStructure,
              reviewRevision: Number(json.reviewRevision) }
          : undefined,
      };
    }
    return {
      ok: true,
      reviewed: json.reviewed as ReviewedStructure,
      reviewRevision: Number(json.reviewRevision),
      applied: (json.applied ?? []) as ChangeRow[],
    };
  } catch {
    return { ok: false, refusal: 'unreachable' };
  }
}

/** What a refusal means, in the member's terms. Never a code on screen. */
export function reviewRefusalCopy(refusal: string): string {
  switch (refusal) {
    case 'stale_revision':
      return 'This proposal changed in another window. The newer version is now shown; your gesture was not applied.';
    case 'already_adopted':
      return 'This proposal has already been used. It can no longer be edited.';
    case 'parent_still_spans_child':
      return 'That division still covers this one. Use “move out one level”, which shortens it at the same time.';
    case 'child_splits_parent':
      return 'This sits in the middle of its division, so taking it out would leave that division in two pieces. Move a boundary first.';
    case 'parent_would_be_empty':
      return 'That would leave the surrounding division holding nothing.';
    case 'parents_not_adjacent':
      return 'Those two divisions do not touch, so the sections between them would belong to neither.';
    case 'not_at_the_shared_edge':
      return 'This is not at the edge the two divisions share, so moving it would leave a gap.';
    case 'overlapping_siblings':
      return 'Two divisions would cover the same sections.';
    case 'child_outside_parent':
      return 'That would reach outside the division it sits in.';
    case 'unit_has_children':
      return 'This division holds others. Move them out first.';
    case 'would_cycle':
      return 'A division cannot be placed inside itself.';
    case 'inverted_range':
      return 'That would run backwards through the book.';
    case 'empty_name':
      return 'Give the division a name, or say what kind of division it is.';
    case 'unknown_alternative':
      return 'That reading is no longer available.';
    case 'unreachable':
      return 'The proposal could not be reached just now. Your writing is not affected.';
    default:
      return 'That could not be done. Your writing is not affected.';
  }
}
