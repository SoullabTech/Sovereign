# ASK-WORK-ANCHOR-01 · B3 — rerun on the new canonical

**Status: GREEN · ⛔ NOT MERGED · ⛔ NOT DEPLOYED**

| | |
|---|---|
| Canonical | `20bef53fa` (carries SECTION-PROJECTION-EXTRACTION-01) |
| B3 candidate | `90db61f40` on `claude/ask-work-anchor-01-b3` |
| Change since the held-RED state | **one import line**, plus the comment that says why |

## 1. The one line B3 owed

```ts
// lib/manuscript/ask/workContext.ts
- import { splitStoredSection } from '@/lib/manuscript/sections/saveSection';
+ import { splitStoredSection } from '@/lib/manuscript/sections/sectionProjection';
```

⛔ Nothing else in B3 moved. No projection semantics, no save semantics, no
authorization semantics, no guard.

## 2. ⭐ The guard, GREEN — and green for the right reason

```
── is saveSection still in the route graph? ──
  OUT lib/manuscript/sections/saveSection.ts
  IN  lib/manuscript/sections/sectionProjection.ts
  files in graph: 35

askRouteEffectFamily · askRuntimeCannotWrite · askHttpBoundary
askPrePersistence · workContextShape
Test Suites: 5 passed · Tests: 50 passed
```

⛔ The allowlist is byte-identical to canonical. The route stopped reaching the
mutating module; the law was not taught to tolerate that it did.

## 3. Witnesses, fresh disposable cluster

| Witness | Result |
|---|---|
| `work-anchor-witness.ts` (B3, real HTTP, provider substituted at the wire) | **30 passed · 0 failed** |
| `work-context-witness.ts` (B2) | **32 passed · 0 failed** |

## 4. Gates — measured repository-wide against canonical

```
✅ No TypeScript regressions.

                        canonical 20bef53fa      B3 90db61f40
Test Suites   failed              42                  42
              passed             395                 397
Tests         failed              94                  94
              passed            7107                7127

RED on B3 but GREEN on canonical : (empty)
RED on canonical but GREEN on B3 : (empty)
```

B3 adds two suites and twenty tests, all passing, and breaks nothing.

## 5. ⚠️ A finding about this programme's own reporting, not about B3

Earlier records in this lane — including `SECTION-PROJECTION-EXTRACTION-01`'s,
which is already canonical — report the standing test debt as **"4 failed / 16
tests"** and name the four suites. Those numbers came from a **manuscript-scoped**
`jest` invocation. The scope was never stated, so the figure read as the whole
repository.

Repository-wide, canonical stands at **42 failing suites / 94 failing tests**.

⛔ **A number quoted without its scope reads as the whole**, and the smaller
number is the flattering one. The extraction record has been corrected in place
on this branch — superseded, never deleted — and the no-regression claim is now
made at the wider scope, where it means more.

⛔ The 42 suites are not this act's to repair, and were not narrowed until they
looked smaller.

## 6. Standing

- ✅ guard GREEN, allowlist unchanged
- ✅ B3 witness 30/0 · B2 witness 32/0 on a fresh cluster
- ✅ typecheck 0 regressions; repository-wide suite delta: none
- ⛔ **NOT MERGED** — awaiting the B3 merge ruling
- ⛔ **NOT DEPLOYED**
