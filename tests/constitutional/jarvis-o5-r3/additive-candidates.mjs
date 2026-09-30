/**
 * JARVIS O5-R3 — ADDITIVE defeat candidates (not frozen; added after the freeze at their
 * own address, which FREEZE.json permits: "adding never edits a frozen file").
 *
 * DC-C2p exists because frozen DC-C2 turned out to depend on the live classifier: it acts
 * only when the classifier emits TODAY's label (W2_NOT_EXECUTING), so once the classifier
 * was repaired to say CLAIMED_NEVER_DISPATCHED, DC-C2 stopped embodying its error and
 * SURVIVED. That is an instrument defect in a frozen file; repairing it there is a founder
 * act. DC-C2p is the same wrong decision, pinned: it acts on the honest label, whichever
 * layer produced it, so it stays wrong however the live classifier evolves.
 */
import { REASON_REFERENCE } from './settlement-reference-candidates.mjs';

export const ADDITIVE_REASON_CANDIDATES = Object.freeze([
  { id: 'DC-C2p', named: 'R3-C2',
    law: 'relabel AND retire, pinned: the absence proof is used as licence to act (live-independent replacement for frozen DC-C2)',
    subject: { classifyWorkUnit: (fx) => REASON_REFERENCE.classifyWorkUnit(fx).map((d) => (d.reason === 'CLAIMED_NEVER_DISPATCHED' ? { ...d, action: 'RETIRE', retire_grant: true } : d)) },
    collateral: {} },
]);
