import {
  conflictBody,
  payloadHash,
  precheck,
  readGuard,
  type DraftGuardRow,
} from '../draftConcurrency';

const row = (over: Partial<DraftGuardRow> = {}): DraftGuardRow => ({
  version: 5,
  last_idempotency_key: null,
  last_idempotency_op: null,
  last_idempotency_payload_hash: null,
  last_idempotency_response: null,
  ...over,
});

describe('payloadHash', () => {
  it('is stable for the same operation and payload', () => {
    expect(payloadHash('save', { content: 'a' })).toBe(payloadHash('save', { content: 'a' }));
  });

  it('differs when the payload differs', () => {
    expect(payloadHash('save', { content: 'a' })).not.toBe(payloadHash('save', { content: 'b' }));
  });

  it('differs across operations, so one key cannot mean save then restore', () => {
    expect(payloadHash('save', { x: 1 })).not.toBe(payloadHash('restore', { x: 1 }));
  });
});

describe('precheck', () => {
  it('proceeds when the base matches and the key is new', () => {
    expect(precheck(row(), 'save', 'k1', 'h1', 5)).toEqual({ kind: 'proceed' });
  });

  it('refuses a stale base rather than overwriting', () => {
    expect(precheck(row({ version: 7 }), 'save', 'k1', 'h1', 5)).toEqual({
      kind: 'conflict',
      reason: 'stale_base',
      currentRevisionId: 7,
    });
  });

  it('replays a retry of the request that already succeeded', () => {
    const r = row({
      version: 6,
      last_idempotency_key: 'k1',
      last_idempotency_op: 'save',
      last_idempotency_payload_hash: 'h1',
      last_idempotency_response: { revisionId: 6 },
    });
    // base is now behind — it was this very write that advanced it
    expect(precheck(r, 'save', 'k1', 'h1', 5)).toEqual({
      kind: 'replay',
      response: { revisionId: 6 },
    });
  });

  it('refuses the same key carrying a different payload', () => {
    const r = row({
      version: 6,
      last_idempotency_key: 'k1',
      last_idempotency_op: 'save',
      last_idempotency_payload_hash: 'h1',
    });
    expect(precheck(r, 'save', 'k1', 'DIFFERENT', 5)).toEqual({
      kind: 'conflict',
      reason: 'idempotency_key_reuse',
      currentRevisionId: 6,
    });
  });

  it('does not replay a save key against a restore', () => {
    const r = row({
      last_idempotency_key: 'k1',
      last_idempotency_op: 'save',
      last_idempotency_payload_hash: 'h1',
    });
    expect(precheck(r, 'restore', 'k1', 'h1', 5)).toEqual({ kind: 'proceed' });
  });

  it('judges idempotency before staleness', () => {
    // Both conditions hold; the replay must win or every retry becomes a conflict.
    const r = row({
      version: 9,
      last_idempotency_key: 'k1',
      last_idempotency_op: 'save',
      last_idempotency_payload_hash: 'h1',
      last_idempotency_response: { ok: true },
    });
    expect(precheck(r, 'save', 'k1', 'h1', 5).kind).toBe('replay');
  });
});

describe('readGuard', () => {
  it('accepts a valid guard', () => {
    expect(readGuard({ baseRevisionId: 3, idempotencyKey: 'k' })).toEqual({
      baseRevisionId: 3,
      idempotencyKey: 'k',
    });
  });

  const invalid: Array<[string, Record<string, unknown>]> = [
    ['missing base', { idempotencyKey: 'k' }],
    ['zero base', { baseRevisionId: 0, idempotencyKey: 'k' }],
    ['fractional base', { baseRevisionId: 1.5, idempotencyKey: 'k' }],
    ['string base', { baseRevisionId: '3', idempotencyKey: 'k' }],
    ['missing key', { baseRevisionId: 3 }],
    ['blank key', { baseRevisionId: 3, idempotencyKey: '  ' }],
    ['oversized key', { baseRevisionId: 3, idempotencyKey: 'x'.repeat(201) }],
  ];
  invalid.forEach(([label, body]) => {
    it(`refuses ${label}`, () => {
      expect(readGuard(body)).toHaveProperty('error');
    });
  });
});

describe('conflictBody', () => {
  it('names the reason so the client can tell recoverable from defect', () => {
    expect(conflictBody('stale_base', 4).reason).toBe('stale_base');
    expect(conflictBody('idempotency_key_reuse', 4).reason).toBe('idempotency_key_reuse');
  });
});
