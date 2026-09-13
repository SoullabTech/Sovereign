/**
 * BCS-01A · W-P9 — output currency is a comparison with NOW, and is orthogonal
 * to execution status (FR-J9 §8-9).
 *
 * `completed` is a historical fact about one execution. It says nothing about
 * whether the output is still current. Nothing in this file reads or returns an
 * ExecutionStatus, which is how the axes are kept from collapsing (F-J9.4).
 *
 * THREE STATES, NOT A BOOLEAN. `unmeasured` is a genuine state: a failure to
 * measure may never render or reason as current. The precedent and its doctrine
 * are `lib/manuscript/ask/staleness.ts` — "a surface that cannot say 'I do not
 * know' will say 'no'". Step 1 therefore REFUSED a stored `stale` boolean.
 */

export type Currency = 'unchanged' | 'changed' | 'unmeasured';

/**
 * One frozen input lineage edge: material at a frozen identity was supplied to
 * the execution that produced the output (FR-J9 §9).
 *
 * This is LINEAGE, NOT CAUSALITY. It does not assert that the referenced
 * material affected the output (FR-J3: CONTRIBUTED ≠ EFFECT ESTABLISHED).
 */
export interface FrozenInputEdge {
  readonly evidenceRef: string;
  readonly frozenDigest: string;
}

/**
 * Reads the digest of the referenced material AS IT IS NOW.
 * Returns null when the comparison cannot be performed — which must surface as
 * `unmeasured`, never as `unchanged`.
 */
export type CurrentDigestReader = (evidenceRef: string) => string | null;

export function measureCurrency(
  lineage: readonly FrozenInputEdge[],
  readCurrent: CurrentDigestReader,
): Currency {
  let anyChanged = false;

  for (const edge of lineage) {
    let current: string | null;
    try {
      current = readCurrent(edge.evidenceRef);
    } catch {
      // A throwing reader is an unavailable measurement, not a clean bill.
      return 'unmeasured';
    }
    if (current === null) return 'unmeasured';
    if (current !== edge.frozenDigest) anyChanged = true;
  }

  // No lineage means nothing was compared — that is unmeasured, not unchanged.
  if (lineage.length === 0) return 'unmeasured';

  return anyChanged ? 'changed' : 'unchanged';
}
