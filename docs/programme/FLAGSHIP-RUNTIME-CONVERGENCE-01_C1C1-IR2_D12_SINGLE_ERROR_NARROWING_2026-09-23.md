# FLAGSHIP-RUNTIME-CONVERGENCE-01 / C1C1-IR2 — D12 Single-Error Narrowing

**Date**: 2026-09-23
**Act**: C1C1-IR2 — defeat-candidate hygiene, instrument only
**Against**: flagship head `23633b958` · canonical `4d6cc6789`
**Population**: `tests/constitutional/writers-studio/flagship-c1c1/candidates.tsx` (the D12 block and its `CLASSIFIED` entry only) · this record. ⛔ No law, no other candidate, no product source, no witness, no contract, no history.

## Why

`C1C1-D12 — open-before-settlement` was written during C1C1 as the then-reference minus settlement. It therefore inherited the two defects R1 later repaired in the reference — no emptiness predicate (it normalized nothing, but also refused nothing) and no proposal backstop — and after R1 it died on L17 and L18 as well as its named L12. Both extra kills were **reducible**: the candidate could keep its defect and still preserve member bytes and fail closed on proposal material.

**Founder ruling**: reducible collateral is narrowed, never normalized as acceptable. A candidate that dies for reasons unrelated to its named error is a weaker instrument, not a stronger one.

## What changed

D12 now mirrors the repaired reference everywhere except its defect: trim used only as an emptiness predicate, the member's `ask` passed unchanged to `sendTurn`, and the R1-2 backstop (`producedVersionId !== null || thread.versions.length > 0 → refuse as proposal material`) applied after a successful turn. It still reads `currentRevisionId` and opens the passage **without settling the writing session** — the one thing it exists to get wrong. Its `CLASSIFIED` entry (L17 · L18) is removed and not replaced.

## Proof

```
matrix:ws-flagship-c1c1   reference 19/19 · candidates 16/16 dead · LETHAL + DISCRIMINATING
                          DEAD  C1C1-D12-open-before-settlement → C1C1-L12-settle-before-open   (collateral: none)
matrix:ws-flagship-c1a    reference 9/9  · 8/8 dead
matrix:ws-flagship-c1b    reference 10/10 · 9/9 dead
typecheck:ws-flagship-c1c1  PASS — 0 diagnostics outside the named inherited allowance
```

D1–D11 and D13–D16 are byte-identical to `23633b958` (the diff touches only the D12 block and the `CLASSIFIED` entry). No browser walk: no production or presentation source changed.

**Standing: IR2 ✅ CLOSED. Per the founder's stop boundary, `FLAGSHIP-RUNTIME-CONVERGENCE-01 / C1C1 — DISCUSS-ONLY CONTEXTUAL MAIA` is adjudicated PASS and CLOSED ON CANDIDATE. ⛔ No C1C2 authority · ⛔ no merge · ⛔ no deploy · ⛔ no production enablement.**
