/**
 * BCS-01A · Step 2 · W-P9 — completion and currency are orthogonal axes (F-J9.4).
 * Three arms, two collapse controls, one lawful control.
 */

import { measureCurrency, type FrozenInputEdge } from '../currency';
import { completeExecution, type ExecutionState } from '../executionState';

const LINEAGE: readonly FrozenInputEdge[] = [
  { evidenceRef: 'section:s1', frozenDigest: 'd-s1-rev3' },
  { evidenceRef: 'section:s2', frozenDigest: 'd-s2-rev1' },
];

/** One completed execution, frozen input identity retained. */
function completed(): ExecutionState {
  const r = completeExecution({ executionId: 'x9', status: 'running' });
  if (!r.ok) throw new Error('fixture: completion refused');
  return r.state;
}

describe('W-P9 · execution status is historical; currency is a comparison with now', () => {
  it('ARM A · unchanged — status COMPLETED, currency UNCHANGED', () => {
    const state = completed();
    const currency = measureCurrency(LINEAGE, (ref) =>
      ref === 'section:s1' ? 'd-s1-rev3' : 'd-s2-rev1',
    );
    expect(state.status).toBe('completed');
    expect(currency).toBe('unchanged');
  });

  it('ARM B · changed — status stays COMPLETED while currency becomes CHANGED', () => {
    const state = completed();
    const currency = measureCurrency(LINEAGE, (ref) =>
      ref === 'section:s1' ? 'd-s1-rev9' : 'd-s2-rev1',
    );
    expect(currency).toBe('changed');
    expect(state.status).toBe('completed'); // currency did not touch the lifecycle
  });

  it('ARM C · unmeasurable — status stays COMPLETED, currency becomes UNMEASURED', () => {
    const state = completed();
    const currency = measureCurrency(LINEAGE, () => null);
    expect(currency).toBe('unmeasured');
    expect(state.status).toBe('completed');
  });

  it('RED CONTROL 1 — a candidate that reads a missing measurement as UNCHANGED', () => {
    // The prohibited behaviour, expressed deliberately: unknown collapses to current.
    const badMeasure = (lineage: readonly FrozenInputEdge[], read: (r: string) => string | null) =>
      lineage.every((e) => (read(e.evidenceRef) ?? e.frozenDigest) === e.frozenDigest)
        ? 'unchanged'
        : 'changed';

    expect(badMeasure(LINEAGE, () => null)).toBe('unchanged'); // genuinely bad
    expect(measureCurrency(LINEAGE, () => null)).toBe('unmeasured'); // lawful
  });

  it('RED CONTROL 2 — a candidate that lets CHANGED demote the execution status', () => {
    // The prohibited behaviour: currency written back into the lifecycle axis.
    const badStatusFor = (currency: string) => (currency === 'changed' ? 'invalidated' : 'completed');
    expect(badStatusFor('changed')).toBe('invalidated'); // genuinely bad

    const state = completed();
    const currency = measureCurrency(LINEAGE, () => 'moved');
    expect(currency).toBe('changed');
    expect(state.status).toBe('completed'); // lawful: axes stay orthogonal
  });

  it('LAWFUL CONTROL — an always-unmeasured implementation cannot pass', () => {
    const currency = measureCurrency(LINEAGE, (ref) =>
      ref === 'section:s1' ? 'd-s1-rev3' : 'd-s2-rev1',
    );
    expect(currency).toBe('unchanged'); // identical inputs genuinely yield UNCHANGED
  });

  it('a throwing reader is an unavailable measurement, never a clean bill', () => {
    expect(
      measureCurrency(LINEAGE, () => {
        throw new Error('store unreachable');
      }),
    ).toBe('unmeasured');
  });

  it('no lineage means nothing was compared — UNMEASURED, not UNCHANGED', () => {
    expect(measureCurrency([], () => 'anything')).toBe('unmeasured');
  });
});
