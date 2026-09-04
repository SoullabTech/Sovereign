# R21 — guard domination: every content write individually dominated

**Date:** 2026-09-04
**Branch:** `fix/refusal-21-guard-domination` (stacked on `fix/refusal-registry-grep-portability`, `9a1a863f7`)
**Closes:** `docs/ops/REFUSAL_REGISTRY_DETECTOR_DEFECT_2026-09-04.md` §6.1
**Scope:** `tests/constitutional/refusal-registry/` only. No runtime, store, or guard code was touched.
**Verdict:** **R21 now proves what it always read as proving. No constitutional regression; no live breach was found or fixed.**

---

## 1. The gap this closes

R21's three ordering assertions compared the **first** guard against the **first** write:

```ts
lineOf(turnsGuard) < requireLine(turnsInsert, '…')   //  113 < 125
```

`lib/memory/stores/TurnsStore.ts` has **3** `contentWritable(` guards (113, 206, 256) and
**4** `INSERT INTO conversation_turns` (125, 215, 274, 281). `113 < 125` is true and says
nothing whatever about the INSERT at 281. `corpusCallosumService.ts` and
`sessionManager.ts` had the same shape, currently 1:1.

This was a **gap in what the check proved, not a live breach** — all four TurnsStore
INSERTs were verified guarded by hand on 2026-09-04 (detector-defect record §3), and
that finding still stands.

## 2. What replaces it

`guardDomination()` in `harness.ts` requires, for **every write independently**, a guard
that satisfies **both** conditions:

- **(a) precedes it**, and
- **(b) sits in the same innermost function scope.**

Line order alone is insufficient, and scope alone is insufficient. A guard in `addTurn`
can no longer be credited for an INSERT in `addExchange`.

Scopes come from a real tokenizer, not brace-counting: strings, template literals
(including `${…}` re-entry) and comments are masked out first, because these stores are
built out of SQL string literals and a naive brace count miscounts on them. A write that
lands in **no** recognised scope raises `DetectorDefect` — the detector says "I cannot
tell" rather than crediting whatever guard happens to sit above it.

New shared helpers, per the constraint that no check reintroduce local line parsing:
`linesOf()` (multi-match sibling of `lineOf`) and `requireLines()` (multi-match sibling
of `requireLine`). Both raise `DetectorDefect` rather than ever yielding `NaN`.

## 3. Two parser defects found and fixed while building this

Both were found by checking the parser against the real files rather than trusting it:

| Defect | Symptom | Cause |
|---|---|---|
| Return-type brace | `logCorpusCallosumTrace` span read `317-322` | `Promise<{ … }>` puts a `{` at angle-depth 1; "first `{` after the signature" picked the return type, not the body. Fixed by tracking `<`/`>` depth. |
| **Surrogate pair** | same function read `317-466`, true end `524` | The code-only view was built with `Array.from(source, …)`, which iterates **code points** — one emoji (`🧠`, line 467) collapsed a surrogate pair into one element and shifted every offset after it. Fixed by indexing UTF-16 units. |

Both are covered by permanent unit tests. The second is the more dangerous class: it
silently *truncates* a scope, and this codebase puts emoji in log strings routinely.

## 4. Assertions preserved

No assertion's threshold, pattern, or logical form was relaxed. The corpus-callosum
check retains its existing count thresholds (`guards >= 2 && inserts === 2`) **in
addition to** domination. Registry assertion count is unchanged, so the suite total
stays at **106**.

`hostileForkMustChange` was widened to name the newly-caught diff: *"add a content write
to a scope that has no guard of its own."*

## 5. Verification

| Test | Result |
|---|---|
| Registry, ugrep 7.8.4 (default `PATH`) | `106 passed · 0 failed · 0 warned` |
| Registry, **GNU grep 3.12** first on `PATH` | `106 passed · 0 failed · 0 warned` |
| `npx jest … harness.test.ts` | **29 passed** (was 10; +19) |
| `tsc --noEmit --strict` on the changed sources | clean |
| `npm run typecheck` (ship no-regression gate) | ✅ no regressions |

## 6. Mutation testing — the gap was real, not theoretical

Each mutation was applied to `lib/memory/stores/TurnsStore.ts`, run, then reverted
(`git status` confirmed clean after each). "OLD" reconstructs the pre-strengthening
assertion — first guard vs first write — on the same mutated file.

| # | Mutation | OLD check | NEW check |
|---|---|---|---|
| **M3** | Append an unguarded `INSERT` in a new `leakTurns()` method at end of file | 🟢 **PASS (green)** | ❌ FAIL — `write@322 in leakTurns() has no guard in its own scope` |
| **M4** | Neutralise the guard at 256 — **`addExchange`, the method R21 is named for** | 🟢 **PASS (green)** | ❌ FAIL — `write@274 … ; write@281 in addExchange() has no guard in its own scope` |
| **M5** | Rename the `INSERT` anchor so the pattern stops matching | — | ❌ **DETECTOR DEFECT** — *"could not locate its own anchor and proves NOTHING either way"* (explicitly **not** a breach) |
| **M6** | Hoist an `INSERT` above the guard *within* the same method | — | ❌ FAIL — `write@113 in addTurn() has no guard in its own scope` |

**M3 and M4 are the load-bearing results.** The old assertion reported green while an
unguarded INSERT sat in the file, and green again with `addExchange`'s guard removed
entirely. The strengthening is therefore demonstrated, not assumed.

> A first attempt at M5 renamed the table to `conversation_turns_v2` and the check still
> passed. That was an **ineffective mutation, not a detector result** —
> `conversation_turns` is a substring of `conversation_turns_v2`, so the anchor still
> matched. Recorded because the distinction is exactly the one this registry exists to
> keep: a mutation that fails to mutate proves nothing.

## 7. What a PASS still does not authorize

Unchanged from R21's standing jurisdiction, and **not** widened by this work:

- R21 remains a **source-level structural claim**. It reads code, never data. It does not
  establish that any store behaved correctly at runtime for any member.
- A PASS does not authorize the claim that every content store platform-wide is governed
  (S4–S6 remain), nor that posture resolution is independent of the request flag (S5).
- Domination is proven **within a file**. A caller reaching a store through a path this
  check does not read is outside its jurisdiction.
- The scope parser is a heuristic over well-formed TypeScript. Its failure mode is
  designed to be loud (`DetectorDefect`), not silent — but "loud" is a property of the
  cases tested here, not a proof over all possible source shapes.
