/**
 * Note lifecycle axis — practitioner_client_notes.
 *
 * The point of these tests is the SEPARATION. Lifecycle and commitment status
 * both contain the word "completed" and answer different questions; a test suite
 * that only checked the happy path would pass just as well if the two had been
 * collapsed into one column. Several cases below exist specifically to fail if
 * that ever happens.
 *
 * @see docs/specs/PRACTITIONER_CLIENT_NOTE_RULING_2026-08-02.md
 */

import {
  NOTE_LIFECYCLES,
  COMPLETION_MODES,
  COMPLETION_AUTHORITY_FIELDS,
  COMPLETION_AUTHORITY_ERROR,
  COMPLETION_REVOCATION_ERROR,
  isNoteLifecycle,
  isCompletionMode,
  findCompletionAuthorityField,
  validateLifecycleCreate,
  validateLifecycleTransition,
  isEditableInPlace,
  LOCKED_NOTE_MESSAGE,
} from '../noteLifecycle';
import { COMMITMENT_STATUSES } from '../continuityKind';

describe('note lifecycle vocabulary', () => {
  it('is exactly draft | completed', () => {
    expect(NOTE_LIFECYCLES).toEqual(['draft', 'completed']);
  });

  it('does not admit commitment statuses', () => {
    // 'alive' and 'released' belong to the OTHER axis. If a refactor ever routed
    // both through one enum, this is where it shows up.
    expect(isNoteLifecycle('alive')).toBe(false);
    expect(isNoteLifecycle('released')).toBe(false);
  });

  it('shares only the word "completed" with commitment status, not the set', () => {
    const overlap = COMMITMENT_STATUSES.filter((s) =>
      (NOTE_LIFECYCLES as readonly string[]).includes(s)
    );
    expect(overlap).toEqual(['completed']);
  });

  it('rejects non-strings and near-misses', () => {
    expect(isNoteLifecycle(undefined)).toBe(false);
    expect(isNoteLifecycle(null)).toBe(false);
    expect(isNoteLifecycle('Draft')).toBe(false);
    expect(isNoteLifecycle('drafts')).toBe(false);
    expect(isNoteLifecycle(1)).toBe(false);
  });
});

describe('validateLifecycleCreate', () => {
  it('defaults to completed when omitted, preserving pre-lifecycle behaviour', () => {
    expect(validateLifecycleCreate(undefined, 'note')).toEqual({
      ok: true,
      value: 'completed',
    });
    expect(validateLifecycleCreate(null, 'note')).toEqual({ ok: true, value: 'completed' });
  });

  it('accepts an explicit draft on a session note', () => {
    expect(validateLifecycleCreate('draft', 'note')).toEqual({ ok: true, value: 'draft' });
  });

  it('refuses a draft on any continuity kind', () => {
    // Carry Forward creates these whole. A half-written commitment is not a
    // thing the object models, and the DB constraint says the same.
    for (const kind of ['commitment', 'recognition', 'detail']) {
      const result = validateLifecycleCreate('draft', kind);
      expect(result.ok).toBe(false);
      expect(result.error).toBe('only a session note may be a draft');
    }
  });

  it('allows continuity kinds to be created completed', () => {
    for (const kind of ['commitment', 'recognition', 'detail']) {
      expect(validateLifecycleCreate('completed', kind)).toEqual({
        ok: true,
        value: 'completed',
      });
    }
  });

  it('rejects rather than coerces an unknown value', () => {
    const result = validateLifecycleCreate('archived', 'note');
    expect(result.ok).toBe(false);
    expect(result.value).toBeUndefined();
  });
});

describe('validateLifecycleTransition', () => {
  it('is a no-op when lifecycle is not being changed', () => {
    expect(validateLifecycleTransition('draft', undefined)).toEqual({ ok: true });
    expect(validateLifecycleTransition('completed', undefined)).toEqual({ ok: true });
  });

  it('allows draft -> completed', () => {
    expect(validateLifecycleTransition('draft', 'completed')).toEqual({
      ok: true,
      value: 'completed',
    });
  });

  it('treats a same-state write as acceptable', () => {
    expect(validateLifecycleTransition('draft', 'draft')).toEqual({ ok: true, value: 'draft' });
  });

  it('refuses completed -> draft, and says why', () => {
    const result = validateLifecycleTransition('completed', 'draft');
    expect(result.ok).toBe(false);
    // The refusal must name the missing capability. "Invalid transition" would
    // read as a malformed request rather than an unbuilt correction model.
    expect(result.error).toMatch(/amendment path/i);
  });

  it('refuses a commitment status supplied as a lifecycle', () => {
    for (const status of ['alive', 'released']) {
      const result = validateLifecycleTransition('draft', status);
      expect(result.ok).toBe(false);
      expect(result.error).toMatch(/lifecycle must be one of/);
    }
  });
});

describe('completion mode', () => {
  it('is exactly backfilled | practitioner_declared', () => {
    expect(COMPLETION_MODES).toEqual(['backfilled', 'practitioner_declared']);
  });

  it('does not overlap the lifecycle vocabulary', () => {
    // Three named vocabularies now live on this table. None may bleed into
    // another: lifecycle, commitment status, completion authority.
    for (const mode of COMPLETION_MODES) {
      expect(isNoteLifecycle(mode)).toBe(false);
    }
    for (const lc of NOTE_LIFECYCLES) {
      expect(isCompletionMode(lc)).toBe(false);
    }
  });
});

describe('completion authority is not client-settable', () => {
  it('names exactly the two authority-bearing fields', () => {
    expect(COMPLETION_AUTHORITY_FIELDS).toEqual(['completion_mode', 'completed_at']);
  });

  it('detects each one', () => {
    expect(findCompletionAuthorityField({ completion_mode: 'backfilled' })).toBe('completion_mode');
    expect(findCompletionAuthorityField({ completed_at: '2026-08-02T00:00:00Z' })).toBe('completed_at');
  });

  it('detects PRESENCE, not truthiness', () => {
    // ⭐ The critical case. `completed_at: null` is the exact shape an attempt to
    // unlock a note would take — a falsy value that a `if (body.completed_at)`
    // check would wave straight through.
    expect(findCompletionAuthorityField({ completed_at: null })).toBe('completed_at');
    expect(findCompletionAuthorityField({ completion_mode: null })).toBe('completion_mode');
    expect(findCompletionAuthorityField({ completed_at: undefined })).toBe('completed_at');
    expect(findCompletionAuthorityField({ completion_mode: '' })).toBe('completion_mode');
  });

  it('leaves ordinary update bodies alone', () => {
    expect(findCompletionAuthorityField({ content: 'x', note_date: '2026-08-02' })).toBeNull();
    expect(findCompletionAuthorityField({ lifecycle: 'completed' })).toBeNull();
    expect(findCompletionAuthorityField({ status: 'alive' })).toBeNull();
    expect(findCompletionAuthorityField({})).toBeNull();
    expect(findCompletionAuthorityField(null)).toBeNull();
    expect(findCompletionAuthorityField(undefined)).toBeNull();
  });

  it('exposes stable codes that do not collide', () => {
    // Callers branch on these; if they ever became equal, a malformed request
    // and a refused state transition would be indistinguishable downstream.
    expect(COMPLETION_AUTHORITY_ERROR).toBe('completion_authority_not_client_settable');
    expect(COMPLETION_REVOCATION_ERROR).toBe('completion_authority_not_revocable');
    expect(COMPLETION_AUTHORITY_ERROR).not.toBe(COMPLETION_REVOCATION_ERROR);
  });
});

describe('lifecycle transition failure reasons', () => {
  it('separates a malformed value from a refused transition', () => {
    // These map to different HTTP statuses. An earlier revision returned 409 for
    // both, so a plain typo was reported as though the note's state had refused
    // it — telling the caller the wrong thing about what to change.
    expect(validateLifecycleTransition('draft', 'archived').reason).toBe('malformed');
    expect(validateLifecycleTransition('completed', 'draft').reason).toBe('revocation');
  });

  it('carries no reason when it succeeds', () => {
    expect(validateLifecycleTransition('draft', 'completed').reason).toBeUndefined();
    expect(validateLifecycleTransition('draft', undefined).reason).toBeUndefined();
  });
});

describe('isEditableInPlace', () => {
  it('allows editing a draft, which carries no completion mode', () => {
    expect(isEditableInPlace(null)).toBe(true);
    expect(isEditableInPlace(undefined)).toBe(true);
  });

  it('locks a note a practitioner declared complete', () => {
    expect(isEditableInPlace('practitioner_declared')).toBe(false);
  });

  it('leaves a backfilled note editable', () => {
    // 20260802000002 marked these complete on their author's behalf. That author
    // was never shown the completion warning, so the lock was never a condition
    // they accepted. Removing the affordance retroactively would take away
    // something the note already had.
    expect(isEditableInPlace('backfilled')).toBe(true);
  });

  it('reads the declaration, never a timestamp', () => {
    // ⛔ REGRESSION GUARD. An earlier draft used `completed_at IS NULL` as the
    // lock authority, which made a provenance field silently carry policy. The
    // signature takes ONE argument — completion authority — so a timestamp
    // cannot be reintroduced as the test without changing it here first.
    expect(isEditableInPlace.length).toBe(1);
    // Both of these are lifecycle='completed'. They differ only by declared
    // authority, and that alone decides the lock.
    expect(isEditableInPlace('backfilled')).not.toBe(
      isEditableInPlace('practitioner_declared')
    );
  });

  it('treats an unknown authority as not a declaration', () => {
    // Fail open to editable rather than locking on a value nobody ruled.
    expect(isEditableInPlace('completed')).toBe(true);
    expect(isEditableInPlace('')).toBe(true);
  });

  it('exposes a refusal message that explains the state, not the request', () => {
    expect(LOCKED_NOTE_MESSAGE).toMatch(/completed/i);
    expect(LOCKED_NOTE_MESSAGE).not.toMatch(/invalid|forbidden|unauthorized/i);
  });
});
