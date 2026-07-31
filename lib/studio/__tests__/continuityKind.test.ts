/**
 * The rule these tests exist to hold: REJECT, NEVER COERCE.
 *
 * Every case below has a tempting "helpful" alternative — drop the stray status,
 * default the malformed commitment to 'alive', accept a nearly-right kind. Each
 * would let the API decide what the practitioner meant.
 */

import { describe, it, expect } from '@jest/globals';
import {
  validateContinuityCreate,
  validateStatusUpdate,
  isContinuityKind,
  isCommitmentStatus,
} from '@/lib/studio/continuityKind';

const UUID = '11111111-1111-4111-8111-111111111111';

describe('continuity kind guards', () => {
  it('accepts exactly the four governed kinds', () => {
    expect(isContinuityKind('note')).toBe(true);
    expect(isContinuityKind('commitment')).toBe(true);
    expect(isContinuityKind('recognition')).toBe(true);
    expect(isContinuityKind('detail')).toBe(true);
  });

  it('rejects kinds that were deliberately NOT authorized', () => {
    // `arrival` is the important one: Current Arrival is a per-session prompt
    // inside the note, never a durable kind. Accepting it here would create the
    // accumulating "current state" object the ruling excluded.
    expect(isContinuityKind('arrival')).toBe(false);
    expect(isContinuityKind('pattern')).toBe(false);
    expect(isContinuityKind('archetype')).toBe(false);
    expect(isContinuityKind('')).toBe(false);
    expect(isContinuityKind(undefined)).toBe(false);
  });

  it('accepts exactly the three commitment statuses', () => {
    expect(isCommitmentStatus('alive')).toBe(true);
    expect(isCommitmentStatus('completed')).toBe(true);
    expect(isCommitmentStatus('released')).toBe(true);
    expect(isCommitmentStatus('active')).toBe(false);
    expect(isCommitmentStatus('done')).toBe(false);
  });
});

describe('validateContinuityCreate', () => {
  it('defaults an absent kind to note — a client unaware of continuity still works', () => {
    const r = validateContinuityCreate({});
    expect(r.ok).toBe(true);
    expect(r.value).toEqual({ kind: 'note', status: null, promotedFrom: null });
  });

  it('requires a status on a commitment rather than defaulting it', () => {
    const r = validateContinuityCreate({ kind: 'commitment' });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/status is required/);
  });

  it('rejects an invalid commitment status', () => {
    const r = validateContinuityCreate({ kind: 'commitment', status: 'in_progress' });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/must be one of/);
  });

  it('REJECTS a status on a non-commitment — does not silently drop it', () => {
    for (const kind of ['note', 'recognition', 'detail']) {
      const r = validateContinuityCreate({ kind, status: 'alive' });
      expect(r.ok).toBe(false);
      expect(r.error).toMatch(/only valid when kind is 'commitment'/);
    }
  });

  it('accepts a well-formed commitment', () => {
    const r = validateContinuityCreate({ kind: 'commitment', status: 'alive' });
    expect(r.ok).toBe(true);
    expect(r.value).toEqual({ kind: 'commitment', status: 'alive', promotedFrom: null });
  });

  it('rejects a malformed promoted_from', () => {
    const r = validateContinuityCreate({ kind: 'detail', promoted_from: 'not-a-uuid' });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/uuid/);
  });

  it('carries a well-formed promoted_from through unchanged', () => {
    const r = validateContinuityCreate({ kind: 'detail', promoted_from: UUID });
    expect(r.ok).toBe(true);
    expect(r.value!.promotedFrom).toBe(UUID);
  });

  it('nulls status for non-commitments rather than leaving it undefined', () => {
    const r = validateContinuityCreate({ kind: 'recognition' });
    expect(r.value!.status).toBeNull();
  });
});

describe('validateStatusUpdate', () => {
  it('permits a transition on a commitment', () => {
    expect(validateStatusUpdate('commitment', 'completed').ok).toBe(true);
    expect(validateStatusUpdate('commitment', 'released').ok).toBe(true);
  });

  it('rejects a status transition on a non-commitment', () => {
    for (const kind of ['note', 'recognition', 'detail'] as const) {
      const r = validateStatusUpdate(kind, 'alive');
      expect(r.ok).toBe(false);
    }
  });

  it('rejects an invalid status even on a commitment', () => {
    expect(validateStatusUpdate('commitment', 'archived').ok).toBe(false);
  });

  it('is a no-op when status is absent', () => {
    expect(validateStatusUpdate('note', undefined).ok).toBe(true);
  });
});
