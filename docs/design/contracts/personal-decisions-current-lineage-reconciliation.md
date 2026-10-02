# DECISIONS-PROMOTION-00 — Current 3597 Lineage Reconciliation Witness

**Date:** 2026-09-27
**Status:** RECONCILED CANDIDATE PASS · FOUNDER VISUAL WITNESS NEXT · 3597 UNCHANGED

## Purpose

Reconcile the accepted Personal Decisions candidate onto the current House + Changes + symbolic-continuity lineage before any promotion to localhost:3597.

## Lineage

Current 3597 lineage used as reconciliation base:

`a5b480cf12b89bb3f3421fde19e1f0299014224f`

That line already contains:

- accepted House + Here · Now holoflowers;
- accepted Changes room;
- House symbolic-continuity governance;
- Divination → Journal crossing;
- House-wide readability standard;
- Journal anchoring correction;
- Divination readable field typography.

The Personal Decisions candidate was replayed on top of that line without replacing those later House changes.

Reconciled candidate head:

`bb9f7adb6dc1f29f1c539bf820b471264392694b`

Branch:

`feature/decisions-current3597-reconcile-20260927`

Local visual/runtime witness:

`http://localhost:3700/decisions`

## Overlap census

The Decisions candidate and the newer 3597 House line had **zero overlapping changed paths** from their common base.

That matters because the reconciliation did not require conflict resolution or manual substitution of newer House work.

The later House readability and symbolic-continuity changes remain native to the reconciled candidate.

## Static gates

Reconciled candidate passed:

- `git diff --check`;
- design canon gate;
- member-owned boundary gate;
- TypeScript no-regression gate.

Type health result:

- program files: 4500;
- errors: 222;
- baseline errors: 239;
- no TypeScript regression.

## Integrated Personal Decisions witness

One temporary member was walked through the reconciled candidate at localhost:3700:

1. Personal Decisions threshold;
2. phenomenon-first naming;
3. exact Decision room;
4. first explicit Gather perspectives;
5. phenomenon-first Notice;
6. explicit perspective revisit from new evidence;
7. member-authored resolution;
8. reopen;
9. second member-authored resolution;
10. return to resolved Decisions list.

Observed:

- old Decision Council threshold title: absent;
- secondary creation context before member words: absent;
- secondary creation context after member words: present;
- creation: HTTP 200;
- consultation POSTs before explicit perspective: 0;
- first perspective: HTTP 200;
- Notice classification before words: absent;
- Notice classification after words: present;
- Notice persistence: HTTP 200;
- recent kept evidence visible during revisit;
- second perspective: HTTP 200;
- resolution field initially blank;
- first choice: HTTP 200;
- reopen: HTTP 200;
- earlier choice preserved;
- second choice: HTTP 200;
- resolved section present on return;
- resolved Decision title present in resolved section;
- final status: complete;
- council iterations: 2;
- member-kept Decision moments: 1;
- choice history: `choice_recorded > reopened > choice_recorded`;
- first exact choice preserved;
- second exact choice preserved;
- Threshold Event delta: 0;
- memory atom delta: 0;
- temporary member residue: 0;
- temporary choice-event residue: 0.

Request counts across the integrated walk:

- Council consultation POSTs: 2;
- Decision experience POSTs: 1;
- choice lifecycle POSTs: 3.

Each corresponds exactly to an explicit member gesture.

## House preservation witness

The reconciled candidate was also walked through the House on localhost:3700.

Results:

- desktop Here · Now links: 9;
- desktop colored holoflower marks: 9;
- mobile Here · Now links: 9;
- mobile colored holoflower marks: 9;
- temporary witness residue: 0.

This confirms the accepted House quick-access visual identity survived reconciliation.

## 3597 standing

`localhost:3597` was not restarted or moved by this reconciliation.

It continues serving the accepted House + Changes line.

## Exact stop

> **DECISIONS CURRENT-LINEAGE RECONCILIATION — PASS · LOCALHOST:3700 READY FOR FOUNDER VISUAL WITNESS · 3597 UNCHANGED**

Founder visual acceptance of the reconciled candidate is required before:

> **DECISIONS-PROMOTION-01 — EXACT RECONCILED CANDIDATE → 3597 + LIVE LOCAL WITNESS ONLY**