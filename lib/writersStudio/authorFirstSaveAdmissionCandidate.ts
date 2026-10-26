/**
 * AUTHOR-FIRST SAVE / CLASS A — NON-RUNTIME DESIGN FALSIFIER ONLY.
 *
 * This module is intentionally NOT imported by any route, service or UI.
 * Its returned status is never authorization to persist. The "server" facts
 * below must eventually come from a fresh identity/consent/owned-Source check
 * IN the same guarded transaction as chain/thread/version insertion.
 * A caller may not synthesize these facts from URL, client state or a boolean.
 *
 * Read-only conservative refusal model for independent design adjudication.
 */
import { projectEditorialSelection } from '@/lib/manuscript/editorialRuntime/selection';

export interface ProposedAuthorFirstIntent {
  sectionId: string;
  range: { start: number; end: number };
  revisionNumber: number;
  heldText: string;
  replacementText: string;
  supersedes: null;
  sanctuary: boolean;
  gestureId: string;
}

export interface ServerBoundEvidenceForReview {
  /** Server-verified current actor, not a client-supplied identifier. */
  memberId: string | null;
  /** Work resolved through an owned section, not a request-body Work ID. */
  workId: string | null;
  sectionId: string | null;
  ownerCurrent: boolean;
  grantCurrent: boolean;
  consentCurrent: boolean;
  sourcePresent: boolean;
  sectionEditable: boolean;
  sourceDeleted: boolean;
  currentRevision: number | null;
  /** Exact server-projected section body, never normalized UI text. */
  projectedBody: string | null;
  /** Fresh per-request trusted posture evidence, not session default. */
  currentPosture: 'ordinary' | 'sanctuary' | 'unresolved';
  /** Design-only witness; DB uniqueness/locking still required. */
  gestureAlreadyConsumed: boolean | 'unknown';
}

export type AuthorFirstDesignRefusal =
  | 'invalid_request'
  | 'unknown_field'
  | 'invalid_selection'
  | 'invalid_revision'
  | 'invalid_wording'
  | 'invalid_gesture'
  | 'not_first_version'
  | 'not_authenticated'
  | 'not_owned_or_revoked'
  | 'source_unavailable'
  | 'posture_unresolved'
  | 'sanctuary_unavailable'
  | 'stale_revision'
  | 'replayed_or_unproven_gesture'
  | 'selection_ambiguous'
  | 'selection_mismatch';

export type AuthorFirstDesignOutcome =
  | { status: 'refused'; reason: AuthorFirstDesignRefusal }
  | { status: 'candidate_only_NOT_AUTHORIZED' };

const UUID = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const KEYS = ['sectionId', 'range', 'revisionNumber', 'heldText',
  'replacementText', 'supersedes', 'sanctuary', 'gestureId'] as const;
const refuse = (reason: AuthorFirstDesignRefusal): AuthorFirstDesignOutcome =>
  ({ status: 'refused', reason });

/** For fictional falsification; this cannot create or approve a version. */
export function examineAuthorFirstSaveDesign(
  raw: unknown, server: ServerBoundEvidenceForReview,
): AuthorFirstDesignOutcome {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return refuse('invalid_request');
  const body = raw as Record<string, unknown>;
  if (Object.keys(body).some(key => !(KEYS as readonly string[]).includes(key))) return refuse('unknown_field');
  if (typeof body.sectionId !== 'string' || !body.sectionId.trim()
    || body.sectionId.length > 128) return refuse('invalid_selection');
  if (!Number.isSafeInteger(body.revisionNumber) || Number(body.revisionNumber) < 0) {
    return refuse('invalid_revision');
  }
  const range = body.range as Record<string, unknown> | null | undefined;
  if (!range || typeof range !== 'object' || Array.isArray(range)
    || Object.keys(range).some(k => k !== 'start' && k !== 'end')
    || !Number.isSafeInteger(range.start) || !Number.isSafeInteger(range.end)
    || Number(range.start) < 0 || Number(range.end) <= Number(range.start)) {
    return refuse('invalid_selection');
  }
  if (typeof body.heldText !== 'string' || !body.heldText) return refuse('invalid_selection');
  if (typeof body.replacementText !== 'string' || body.replacementText.length > 200_000) {
    return refuse('invalid_wording');
  }
  if (!Object.prototype.hasOwnProperty.call(body, 'supersedes') || body.supersedes !== null) {
    return refuse('not_first_version');
  }
  if (typeof body.gestureId !== 'string' || !UUID.test(body.gestureId)) {
    return refuse('invalid_gesture');
  }
  if (typeof body.sanctuary !== 'boolean') return refuse('posture_unresolved');

  // The request has been parsed, but none of its fields confer authority.
  if (!server.memberId) return refuse('not_authenticated');
  if (!server.workId || server.sectionId !== body.sectionId
    || !server.ownerCurrent || !server.grantCurrent || !server.consentCurrent) {
    return refuse('not_owned_or_revoked');
  }
  if (!server.sourcePresent || server.sourceDeleted || !server.sectionEditable
    || server.projectedBody === null) return refuse('source_unavailable');
  if (server.currentPosture === 'unresolved') return refuse('posture_unresolved');
  if (body.sanctuary || server.currentPosture !== 'ordinary') return refuse('sanctuary_unavailable');
  if (server.currentRevision !== body.revisionNumber) return refuse('stale_revision');
  if (server.gestureAlreadyConsumed !== false) return refuse('replayed_or_unproven_gesture');

  const selection = projectEditorialSelection(server.projectedBody, {
    start: Number(range.start), end: Number(range.end),
  });
  if (!selection.ok) return refuse(selection.reason === 'selection_ambiguous'
    ? 'selection_ambiguous' : 'invalid_selection');
  if (selection.text !== body.heldText) return refuse('selection_mismatch');

  // NOT a positive grant. The actual DB transaction, live auth/consent/posture
  // checks, idempotency key, predecessor and readback are deliberately missing.
  return { status: 'candidate_only_NOT_AUTHORIZED' };
}
