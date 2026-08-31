/**
 * WS2-05B - parsing a review operation off the wire.
 *
 * THE COMPILER PROTECTS CALLERS WRITTEN IN TYPESCRIPT. IT DOES NOT PROTECT AN
 * HTTP ENDPOINT. `body = await req.json() as ReviewRequest` is an assertion,
 * not a check: a client sending `{"op":"whatever"}` satisfies it completely.
 *
 * That mattered concretely. `applyReviewOperation`'s switch had no default, so
 * an unknown discriminant fell through every case, validated an unchanged tree,
 * and returned success - a no-op reported as a completed gesture.
 *
 * So the discriminant is closed here, at the boundary, and every field is
 * checked for the shape the operation actually needs.
 *
 * THE ENVELOPE IS PART OF THE REQUEST. `parseReviewRequest` closes the fields
 * around the operation for the same reason. Two of them were load-bearing and
 * merely cast:
 *
 *   `previewOnly: "false"` is a non-empty string, and therefore truthy. A
 *   caller who meant to COMMIT would have received an unsaved preview and been
 *   told nothing - the worst available outcome, since the gesture reads as
 *   accepted and no post-image was stored.
 *
 *   `expectedReviewRevision: 1.5` passed a `typeof === 'number'` check, matched
 *   no stored revision, and surfaced to the member as "someone else changed
 *   this" - a conflict story invented out of malformed input.
 */

import type { ReviewOperation } from './review';

export type ParseResult =
  | { ok: true; operation: ReviewOperation }
  | { ok: false; reason: string };

/** Everything the review route accepts, after checking. */
export interface ReviewRequest {
  /** The revision the caller believed. A whole count, never negative. */
  expectedReviewRevision: number;
  operation: ReviewOperation;
  /** Normalised: absent means commit. Never a truthy string. */
  previewOnly: boolean;
}

export type RequestParseResult =
  | { ok: true; request: ReviewRequest }
  | { ok: false; reason: string };

const str = (v: unknown): v is string => typeof v === 'string' && v.length > 0;
const nullableStr = (v: unknown): v is string | null =>
  v === null || typeof v === 'string';
const int = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v);

export function parseReviewOperation(input: unknown): ParseResult {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { ok: false, reason: 'not an object' };
  }
  const o = input as Record<string, unknown>;

  switch (o.op) {
    case 'rename':
      if (!str(o.unitId)) return { ok: false, reason: 'rename needs unitId' };
      if (!nullableStr(o.title) || !nullableStr(o.kind)) {
        return { ok: false, reason: 'rename needs title and kind' };
      }
      return { ok: true, operation: { op: 'rename', unitId: o.unitId, title: o.title, kind: o.kind } };

    case 'set-boundary': {
      if (!str(o.unitId)) return { ok: false, reason: 'set-boundary needs unitId' };
      const from = o.fromSectionId;
      const to = o.toSectionId;
      if (from !== undefined && !str(from)) return { ok: false, reason: 'bad fromSectionId' };
      if (to !== undefined && !str(to)) return { ok: false, reason: 'bad toSectionId' };
      if (from === undefined && to === undefined) {
        return { ok: false, reason: 'set-boundary changes nothing' };
      }
      return { ok: true, operation: {
        op: 'set-boundary', unitId: o.unitId,
        ...(from === undefined ? {} : { fromSectionId: from as string }),
        ...(to === undefined ? {} : { toSectionId: to as string }),
      } };
    }

    case 'reparent':
      if (!str(o.unitId)) return { ok: false, reason: 'reparent needs unitId' };
      if (!nullableStr(o.parentId)) return { ok: false, reason: 'reparent needs parentId or null' };
      if (!int(o.index)) return { ok: false, reason: 'reparent needs an integer index' };
      return { ok: true, operation: {
        op: 'reparent', unitId: o.unitId, parentId: o.parentId, index: o.index } };

    case 'promote':
      if (!str(o.unitId)) return { ok: false, reason: 'promote needs unitId' };
      return { ok: true, operation: { op: 'promote', unitId: o.unitId } };

    case 'remove':
      if (!str(o.unitId)) return { ok: false, reason: 'remove needs unitId' };
      return { ok: true, operation: { op: 'remove', unitId: o.unitId } };

    case 'add':
      if (!nullableStr(o.parentId)) return { ok: false, reason: 'add needs parentId or null' };
      if (!int(o.index)) return { ok: false, reason: 'add needs an integer index' };
      if (!nullableStr(o.title) || !nullableStr(o.kind)) {
        return { ok: false, reason: 'add needs title and kind' };
      }
      if (!str(o.fromSectionId) || !str(o.toSectionId)) {
        return { ok: false, reason: 'add needs a section range' };
      }
      return { ok: true, operation: {
        op: 'add', parentId: o.parentId, index: o.index,
        title: o.title, kind: o.kind,
        fromSectionId: o.fromSectionId, toSectionId: o.toSectionId } };

    case 'choose-alternative':
      if (!str(o.alternativeId)) {
        return { ok: false, reason: 'choose-alternative needs alternativeId' };
      }
      /* Only the id is carried through. Anything else a client attached -
         a units tree, a label - is discarded here rather than reaching the
         engine, so the authority rule is enforced by construction. */
      return { ok: true, operation: { op: 'choose-alternative', alternativeId: o.alternativeId } };

    case 'transfer':
      if (!str(o.unitId)) return { ok: false, reason: 'transfer needs unitId' };
      if (!str(o.toParentId)) return { ok: false, reason: 'transfer needs toParentId' };
      return { ok: true, operation: {
        op: 'transfer', unitId: o.unitId, toParentId: o.toParentId } };

    default:
      return { ok: false, reason: `unknown operation "${String(o.op)}"` };
  }
}

/* -- the envelope around it --------------------------------------------- */

export function parseReviewRequest(input: unknown): RequestParseResult {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { ok: false, reason: 'not an object' };
  }
  const o = input as Record<string, unknown>;

  const rev = o.expectedReviewRevision;
  if (!int(rev) || rev < 0) {
    return { ok: false, reason: 'expectedReviewRevision must be an integer of at least 0' };
  }

  /* Absent or a real boolean. A string, a number and null are all refused
     rather than coerced: coercion here silently changes what the call DOES. */
  const preview = o.previewOnly;
  if (preview !== undefined && typeof preview !== 'boolean') {
    return { ok: false, reason: 'previewOnly must be absent or a boolean' };
  }

  const parsed = parseReviewOperation(o.operation);
  if (!parsed.ok) return parsed;

  return { ok: true, request: {
    expectedReviewRevision: rev,
    operation: parsed.operation,
    previewOnly: preview === true,
  } };
}
