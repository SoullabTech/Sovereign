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
  isNoteLifecycle,
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

describe('isEditableInPlace', () => {
  it('always allows editing a draft', () => {
    expect(isEditableInPlace('draft', null)).toBe(true);
  });

  it('locks a note completed by an explicit act', () => {
    expect(isEditableInPlace('completed', '2026-08-02T10:00:00.000Z')).toBe(false);
    expect(isEditableInPlace('completed', new Date())).toBe(false);
  });

  it('leaves a backfilled note editable', () => {
    // The 20260802000002 backfill set lifecycle='completed' with completed_at
    // NULL. Those authors were never shown the completion warning, so the lock
    // was never a condition they accepted. Removing the affordance retroactively
    // would be taking something away that the note already had.
    expect(isEditableInPlace('completed', null)).toBe(true);
  });

  it('does not treat lifecycle alone as sufficient', () => {
    // Both rows are lifecycle='completed'. They differ ONLY by provenance.
    // If this ever collapses to a single boolean, this test fails.
    expect(isEditableInPlace('completed', null)).not.toBe(
      isEditableInPlace('completed', '2026-08-02T10:00:00.000Z')
    );
  });

  it('exposes a refusal message that explains the state, not the request', () => {
    expect(LOCKED_NOTE_MESSAGE).toMatch(/completed/i);
    expect(LOCKED_NOTE_MESSAGE).not.toMatch(/invalid|forbidden|unauthorized/i);
  });
});
