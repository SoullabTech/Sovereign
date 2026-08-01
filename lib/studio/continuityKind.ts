/**
 * Validation for the governed continuity kinds on practitioner_client_notes.
 *
 * Kept pure (no Next, no db) so the rules are testable in isolation — same shape
 * as `noteDate.ts`.
 *
 * ⛔ REJECT, NEVER COERCE. A `status` on a `detail` is not silently dropped; a
 * malformed commitment is not defaulted to 'alive'. Coercion would let the API
 * decide what the practitioner meant, which is the authority boundary this
 * object exists to hold.
 *
 * @see database/migrations/20260731000001_practitioner_client_notes_continuity.sql
 */

export const CONTINUITY_KINDS = ['note', 'commitment', 'recognition', 'detail'] as const;
export type ContinuityKind = (typeof CONTINUITY_KINDS)[number];

export const COMMITMENT_STATUSES = ['alive', 'completed', 'released'] as const;
export type CommitmentStatus = (typeof COMMITMENT_STATUSES)[number];

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isContinuityKind(value: unknown): value is ContinuityKind {
  return typeof value === 'string' && (CONTINUITY_KINDS as readonly string[]).includes(value);
}

export function isCommitmentStatus(value: unknown): value is CommitmentStatus {
  return typeof value === 'string' && (COMMITMENT_STATUSES as readonly string[]).includes(value);
}

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_RE.test(value);
}

export interface KindValidationInput {
  kind?: unknown;
  status?: unknown;
  promoted_from?: unknown;
}

export interface KindValidationResult {
  ok: boolean;
  /** Present only when ok === false. Safe to return to the client verbatim. */
  error?: string;
  /** Present only when ok === true. */
  value?: {
    kind: ContinuityKind;
    status: CommitmentStatus | null;
    promotedFrom: string | null;
  };
}

/**
 * Validate the continuity triple for a CREATE.
 *
 * `kind` omitted means 'note' — the pre-existing behaviour, preserved so that a
 * client that knows nothing about continuity still creates ordinary notes.
 */
export function validateContinuityCreate(input: KindValidationInput): KindValidationResult {
  const rawKind = input.kind === undefined || input.kind === null ? 'note' : input.kind;

  if (!isContinuityKind(rawKind)) {
    return { ok: false, error: `kind must be one of: ${CONTINUITY_KINDS.join(', ')}` };
  }

  const hasStatus = input.status !== undefined && input.status !== null;

  if (rawKind === 'commitment') {
    // Required, not merely permitted: a commitment with no status has no answer
    // to "is this still alive?", which is the question the object exists to hold.
    if (!hasStatus) {
      return {
        ok: false,
        error: `status is required for kind 'commitment' and must be one of: ${COMMITMENT_STATUSES.join(', ')}`,
      };
    }
    if (!isCommitmentStatus(input.status)) {
      return { ok: false, error: `status must be one of: ${COMMITMENT_STATUSES.join(', ')}` };
    }
  } else if (hasStatus) {
    // Rejected, not dropped.
    return { ok: false, error: `status is only valid when kind is 'commitment'` };
  }

  let promotedFrom: string | null = null;
  if (input.promoted_from !== undefined && input.promoted_from !== null) {
    if (!isUuid(input.promoted_from)) {
      return { ok: false, error: 'promoted_from must be a uuid' };
    }
    promotedFrom = input.promoted_from;
  }

  return {
    ok: true,
    value: {
      kind: rawKind,
      status: rawKind === 'commitment' ? (input.status as CommitmentStatus) : null,
      promotedFrom,
    },
  };
}

/**
 * Validate a status transition on an UPDATE.
 *
 * `kind` and `promoted_from` are immutable after creation:
 *  - kind, because promotion CREATES a new item rather than retyping an old one;
 *  - promoted_from, because provenance that can be edited is not provenance.
 */
export function validateStatusUpdate(
  existingKind: ContinuityKind,
  status: unknown
): KindValidationResult {
  if (status === undefined) return { ok: true };

  if (existingKind !== 'commitment') {
    return { ok: false, error: `status is only valid when kind is 'commitment'` };
  }
  if (!isCommitmentStatus(status)) {
    return { ok: false, error: `status must be one of: ${COMMITMENT_STATUSES.join(', ')}` };
  }
  return { ok: true };
}
