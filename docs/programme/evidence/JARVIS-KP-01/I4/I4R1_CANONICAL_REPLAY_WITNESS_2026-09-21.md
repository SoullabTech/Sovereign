# JARVIS-KP-01 / I4R1 — Canonical Replay Witness

**Date:** 2026-09-21
**Canonical parent:** `0319940f9dc94a637e6f1b0e9f843c971f6fb0c2`
**Relational-field source:** `d2e4dbc24a5efd993bcb785d7b9a05145b7cbd7f`
**Replay head before witness record:** `890a1a042`

## Replay identity

The current-canonical replay was clean and required no conflict resolution or
manual implementation edit.

Stable patch identities:

| Source | Replay | Stable patch-id |
|---|---|---|
| `19ee4fad0…` | `997dbaeee…` | `a26613b425af8cab5638bbdf6fa6a94be244d5d0` |
| `d2e4dbc24…` | `890a1a042…` | `57171b81534be1bb665c9d0c6100454380a36022` |

Direct comparison across the complete I4 candidate file set produced no content
difference between the source candidate and the replayed candidate.

## Exact-head instruments

| Instrument | Result |
|---|---|
| strict epistemic-join typecheck | **PASS** |
| epistemic-join + relational-field runner Jest surface | **118/118 PASS** |
| I4 constitutional matrix | **22/22 PASS** |
| I4 disposable database witness | **7/7 PASS** |
| repository `npm run typecheck` | **229 vs 239 baseline · 0 regressions · EXIT 0** |
| blank PostgreSQL `db:verify-bootstrap` | **PASS · 5/5 stages** |
| `git diff --check` | **PASS** |

## Seam collision witness

The competing remote I4 branch was inspected at
`e90ddf4fce2b4bd325f161267877f5084578209c`.

Its Now What producer yields a `CellCandidate` with element, phase, confidence,
and `system_inferred` source. The adapter itself adds the relation proposition,
relation predicate, directionality, and `association` semantic claim.

The reconciled relational-field branch contains no `nowWhatCell.ts`,
`runNowWhatCellShadow`, or `now_what_cell_candidate` runtime surface.

## Witness standing

> **FRESH REPLAY PASS · NO IMPLEMENTATION DRIFT · FIRST I4 INGRESS = RELATIONAL FIELD · NOW WHAT PARKED**
