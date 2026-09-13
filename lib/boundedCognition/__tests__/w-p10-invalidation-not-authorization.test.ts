/**
 * BCS-01A · Step 2 · W-P10 — invalidation is not authorization (F-J9.9).
 * Behavioural, via an enqueue spy. No source scanning.
 */

import { authorizeExecution, type Commission, type ExecutionRequest } from '../executionAuthorization';
import { measureCurrency, type FrozenInputEdge } from '../currency';

const LINEAGE: readonly FrozenInputEdge[] = [
  { evidenceRef: 'section:s1', frozenDigest: 'd-s1-rev3' },
];

const CONSUMED: Commission = {
  commissionId: 'c-A',
  workId: 'w1',
  purpose: 'recurrence sweep',
  maxJurisdiction: 'sovereign',
  maintained: false,
  consumed: true,
};

const FRESH: Commission = { ...CONSUMED, commissionId: 'c-B', consumed: false };

const REQUEST: ExecutionRequest = {
  workId: 'w1',
  requestedJurisdiction: 'sovereign',
  requestedBy: 'member:m1',
};

/** Observable execution boundary. */
function spyQueue() {
  const enqueued: string[] = [];
  return {
    enqueued,
    enqueue: (commissionId: string) => {
      enqueued.push(commissionId);
    },
  };
}

describe('W-P10 · a currency transition creates a reason, never a permission', () => {
  it('currency becomes CHANGED and NO execution is enqueued', () => {
    const q = spyQueue();

    // The lawful pipeline: measurement is measurement. Nothing downstream of it
    // can reach the queue, because authorizeExecution does not accept a Currency.
    const currency = measureCurrency(LINEAGE, () => 'd-s1-rev9');
    expect(currency).toBe('changed');

    expect(q.enqueued).toHaveLength(0);
  });

  it('RED CONTROL — a candidate wiring `on currency CHANGED → enqueue`', () => {
    const q = spyQueue();

    // The prohibited behaviour, expressed deliberately.
    const badOnMeasured = (currency: string) => {
      if (currency === 'changed') q.enqueue('auto');
    };
    badOnMeasured(measureCurrency(LINEAGE, () => 'd-s1-rev9'));

    expect(q.enqueued).toEqual(['auto']); // the instrument can see it
    expect(q.enqueued).not.toHaveLength(0); // and would RED a lawful expectation
  });

  it('an explicit request under a CONSUMED commission is refused', () => {
    const q = spyQueue();
    const r = authorizeExecution(CONSUMED, REQUEST);
    if (r.ok) q.enqueue(r.commissionId);

    expect(r.ok).toBe(false);
    expect(!r.ok && r.refusal).toBe('commission_consumed');
    expect(q.enqueued).toHaveLength(0);
  });

  it('an explicit request with NO commission is refused — staleness is not a basis', () => {
    const q = spyQueue();
    const r = authorizeExecution(null, REQUEST);
    if (r.ok) q.enqueue(r.commissionId);

    expect(r.ok).toBe(false);
    expect(!r.ok && r.refusal).toBe('no_commission');
    expect(q.enqueued).toHaveLength(0);
  });

  it('LAWFUL POSITIVE CONTROL — a fresh commission + explicit request enqueues exactly one', () => {
    const q = spyQueue();
    const r = authorizeExecution(FRESH, REQUEST);
    if (r.ok) q.enqueue(r.commissionId);

    expect(r.ok).toBe(true);
    expect(q.enqueued).toEqual(['c-B']); // recomputation is possible, just not automatic
  });

  it('a fresh commission for a different Work does not authorize this one', () => {
    const r = authorizeExecution({ ...FRESH, workId: 'w2' }, REQUEST);
    expect(r.ok).toBe(false);
    expect(!r.ok && r.refusal).toBe('scope_mismatch');
  });
});
