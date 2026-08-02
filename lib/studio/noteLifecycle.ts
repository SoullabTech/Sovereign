/**
 * Note lifecycle axis for practitioner_client_notes.
 *
 * Pure (no Next, no db) so the rules are testable in isolation — same shape as
 * `noteDate.ts` and `continuityKind.ts`.
 *
 * ⛔ LIFECYCLE IS NOT COMMITMENT STATUS. Both vocabularies contain the word
 * "completed" and they answer different questions:
 *
 *     lifecycle  draft | completed            has the practitioner finished writing?
 *     status     alive | completed | released is this commitment still alive?
 *
 * Nothing in this file may read or write `status`, and nothing in
 * `continuityKind.ts` may read or write `lifecycle`. The separation is the
 * ruling; keeping the modules disjoint is how it stays true.
 *
 * @see docs/specs/PRACTITIONER_CLIENT_NOTE_RULING_2026-08-02.md
 * @see database/migrations/20260802000002_practitioner_client_notes_lifecycle.sql
 */

export const NOTE_LIFECYCLES = ['draft', 'completed'] as const;
export type NoteLifecycle = (typeof NOTE_LIFECYCLES)[number];

export function isNoteLifecycle(value: unknown): value is NoteLifecycle {
  return typeof value === 'string' && (NOTE_LIFECYCLES as readonly string[]).includes(value);
}

export interface LifecycleResult {
  ok: boolean;
  /** Present only when ok === false. Safe to return to the client verbatim. */
  error?: string;
  /**
   * Why it failed, so callers map to the right status without re-deriving it.
   *
   * 'malformed'  — not a lifecycle value at all → 400
   * 'revocation' — a valid value the note's state refuses → 409
   *
   * ⚠️ Without this the route would have to re-check the input to tell the two
   * apart, and an earlier revision did not: every failure returned 409, so a
   * plain typo was reported as though the note's state had refused it.
   */
  reason?: 'malformed' | 'revocation';
  /** Present only when ok === true. */
  value?: NoteLifecycle;
}

/**
 * Validate `lifecycle` on a CREATE.
 *
 * Omitted means 'completed' — the pre-lifecycle behaviour, preserved so a client
 * that knows nothing about drafts still creates finished notes, and so Carry
 * Forward keeps working untouched.
 */
export function validateLifecycleCreate(
  lifecycle: unknown,
  kind: string
): LifecycleResult {
  const raw = lifecycle === undefined || lifecycle === null ? 'completed' : lifecycle;

  if (!isNoteLifecycle(raw)) {
    return { ok: false, error: `lifecycle must be one of: ${NOTE_LIFECYCLES.join(', ')}` };
  }

  // Mirrors practitioner_client_notes_draft_kind_check. A commitment,
  // recognition, or detail is created whole by Carry Forward — it is never
  // half-written, so "draft" has no meaning there.
  if (raw === 'draft' && kind !== 'note') {
    return { ok: false, error: `only a session note may be a draft` };
  }

  return { ok: true, value: raw };
}

/**
 * Validate a lifecycle transition on an UPDATE.
 *
 * Only draft -> completed exists in this slice. Completion is a one-way,
 * explicit practitioner act; reopening a completed note requires the correction
 * / addendum model, which is deliberately unbuilt and unruled.
 */
export function validateLifecycleTransition(
  current: NoteLifecycle,
  next: unknown
): LifecycleResult {
  if (next === undefined) return { ok: true };

  if (!isNoteLifecycle(next)) {
    return {
      ok: false,
      reason: 'malformed',
      error: `lifecycle must be one of: ${NOTE_LIFECYCLES.join(', ')}`,
    };
  }

  if (current === next) {
    return { ok: true, value: next };
  }

  if (current === 'draft' && next === 'completed') {
    return { ok: true, value: next };
  }

  // completed -> draft. Refused with the reason, not a bare rejection: a
  // practitioner asking to reopen a note is asking for the correction model,
  // and should be told it does not exist yet rather than that their request
  // was malformed.
  return {
    ok: false,
    reason: 'revocation',
    error:
      'A completed note cannot be reopened. Correcting a completed note needs the amendment path, which does not exist yet.',
  };
}

/**
 * Completion AUTHORITY — under what warrant a note was marked complete.
 *
 * Deliberately a named field rather than something inferred from a timestamp.
 * `completed_at` records WHEN; this records WHETHER a practitioner actually
 * declared it. Only the second can carry the lock.
 */
export const COMPLETION_MODES = ['backfilled', 'practitioner_declared'] as const;
export type CompletionMode = (typeof COMPLETION_MODES)[number];

export function isCompletionMode(value: unknown): value is CompletionMode {
  return typeof value === 'string' && (COMPLETION_MODES as readonly string[]).includes(value);
}

/**
 * Is this note's body still editable in place?
 *
 * ⭐ ONE RULE, stated on its own terms:
 *
 *     A note is locked only when a practitioner explicitly completed it.
 *
 * Backfilled rows stay editable because they carry no such declaration — NOT
 * because some timestamp happens to be absent. The ruling allows locking a
 * completed note "provided the UI says so before the practitioner completes
 * it"; rows predating 20260802000002 were marked complete on their author's
 * behalf, so that proviso was never satisfied for them.
 *
 * ⛔ Do not reintroduce `completedAt === null` as the test. An earlier draft did
 * exactly that, which made a provenance field silently carry policy: two rows
 * both reading lifecycle='completed' behaved differently and nothing named why.
 */
export function isEditableInPlace(completionMode: unknown): boolean {
  return completionMode !== 'practitioner_declared';
}

/** Human-readable refusal for an edit attempt on a locked note. */
export const LOCKED_NOTE_MESSAGE =
  'This note was completed and can no longer be edited.';

/**
 * Fields that carry COMPLETION AUTHORITY. A client may never set, downgrade, or
 * revoke them.
 *
 * ⭐ THE GOVERNING RULE (ruled 2026-08-02):
 *
 *     Completion authority is established only by the explicit completion
 *     operation. It cannot be supplied, downgraded, or revoked through the
 *     ordinary note-update route.
 *
 * ⭐⭐ Why reject rather than ignore, when ignoring is already safe:
 *
 * The routes never read these fields, so the boundary was already unreachable
 * by construction. But silence makes a MISLEADING CONTRACT — a client can send
 * an authority-bearing field, receive an ordinary 200, and have no way to learn
 * the server disregarded it. It also makes ambiguous evidence: an ignored field
 * and a respected field look identical from the client until the row is re-read.
 *
 * Rejecting keeps the transition unreachable by construction AND legible at the
 * boundary. Both, not one.
 */
export const COMPLETION_AUTHORITY_FIELDS = ['completion_mode', 'completed_at'] as const;

/**
 * Stable, machine-readable codes. Callers branch on these rather than on prose,
 * so the refusals stay identifiable when wording changes.
 *
 * Two conditions under one rule, kept distinct because they fail differently:
 *
 *   not_client_settable — an authority FIELD was supplied. Never legitimate,
 *                         independent of the note's state → 400.
 *   not_revocable       — a well-formed lifecycle transition the note's STATE
 *                         refuses (completed → draft) → 409.
 *
 * ⚠️ The status codes differ on purpose. 400 says the request was malformed;
 * 409 says the request was fine and the note's state refused it. Collapsing
 * them would tell a caller the wrong thing about what to change.
 */
export const COMPLETION_AUTHORITY_ERROR = 'completion_authority_not_client_settable';
export const COMPLETION_REVOCATION_ERROR = 'completion_authority_not_revocable';

/**
 * Detect an attempt to supply completion authority in a request body.
 *
 * Presence is the test, not truthiness — `completed_at: null` is as much an
 * attempt to set authority as a timestamp is, and is precisely the shape that
 * would try to unlock a note.
 */
export function findCompletionAuthorityField(
  body: Record<string, unknown> | null | undefined
): string | null {
  if (!body) return null;
  for (const field of COMPLETION_AUTHORITY_FIELDS) {
    if (field in body) return field;
  }
  return null;
}
