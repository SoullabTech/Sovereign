# JARVIS-CONTINUITY-REMAINDER-01 · ACT 4 · Selection-law implementation

**Date:** 2026-09-15
**Oracle authority:** ACT 3 frozen at `bde5b57b2` before implementation
**Production:** `e57ca1baa` · untouched
**Scope:** bridge selector only. No scorer change, serving-seam widening, deployment, or `S` act.

## 1. Behavioral delta

`recoverViaBridge` no longer requires exact-token overlap between the current opaque probe and a prior retrieval ask.

It now implements the ACT 2 law in four steps:

1. walk the contiguous recent retrieval episode newest-to-oldest;
2. choose the nearest prior grounded member ask as the object source;
3. admit targets only from member-authored object-anchor coverage;
4. recover only maximum-coverage targets, abstaining if that set exceeds capacity.

MAIA replies do not ground a bridge source or make a target admissible. Position orders already-admissible equals only; it cannot select the object.
## 2. Frozen-law implementation witness

The permanent ACT 4 harness applies the implementation to the seven precommitted ACT 3 cases:

```text
P1  original pre-turn bridge                 [22,24]  ✅
P2  production W1 paraphrase                 [22,24]  ✅ · 27 absent
P3  nearer grounded prior ask                [13]     ✅
N1  object anchors assistant-only            []       ✅
N2  single opaque ask / no prior episode     []       ✅
N3  ordinary turn breaks retrieval episode  []       ✅
N4  >capacity maximum-coverage ambiguity     []       ✅
```

No implementation tuning occurred between these results.

## 3. Earlier bridge contracts

The original P1/N1/N2 bridge acceptance remains green. Composition remains `6 passed · 0 failed`, including terminal N2 abstention with no opaque-scorer fall-through.

The original C1-BRIDGE-01 read-only evidence act remains unchanged and still demonstrates the member-originated path to `22` plus the measured assistant-echo hazard.
## 4. Wider gates

```text
L1 recovery falsifier     31 passed · 0 failed
C2 accounting             ✅ contained in that 31/0 gate
recurrence instrument     retired · known 10/2 report · exit 0
TypeScript no-regression  229 vs baseline 239 · 0 regressions · exit 0
```

`l1-r1-frozen-corpus.ts` was not a runnable standalone gate in this worktree because it requires the separately extracted `_deployed-scorer` module. That missing witness dependency is recorded as such; no claim is made from it.

## 5. Standing

```text
ACT 1 census             ✅ complete
ACT 2 selection law      ✅ complete
ACT 3 frozen oracles     ✅ complete before implementation
ACT 4 implementation     ✅ green locally
production               ✅ e57ca1baa · untouched
scorer                    ✅ unchanged
W2 / W3 / S              ⛔ unspent
ACT 5 production witness ⛔ not opened by this act
first-ask opaque memory  ⛔ still unsolved · separate lane
rollback primitive       ⛔ separate · unopened
```

The bridge now solves the production selection-law defect in the frozen evidence. That is not yet a production acceptance finding; ACT 5 still requires a production-lineage transplant and live witness under its own custody.
