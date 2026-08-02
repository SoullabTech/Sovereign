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
    return { ok: false, error: `lifecycle must be one of: ${NOTE_LIFECYCLES.join(', ')}` };
  }

  if (current === next) {
    return { ok: true, value: next };
  }

  if (current === 'draft' && next === 'completed') {
    return { ok: true, value: next };
  }

  // completed -> draft. Refused with the reason, not a bare 400: a practitioner
  // asking to reopen a note is asking for the correction model, and should be
  // told it does not exist yet rather than that their request was malformed.
  return {
    ok: false,
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
