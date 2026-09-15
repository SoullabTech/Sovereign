# SECTION-PROJECTION-EXTRACTION-01 — record

**Status: EXTRACTION COMPLETE · WITNESSED · ⛔ NOT MERGED · ⛔ NOT DEPLOYED**

| | |
|---|---|
| Canonical at open | `6336f10ab` |
| Extraction candidate | `b8861baaf` on `claude/section-projection-extraction-01` |
| Composition (evidence only, ⛔ not a merge candidate) | `6f52c76e1` on `claude/spx-b3-composition` |
| Held behind this | `ASK-WORK-ANCHOR-01 · B3` (`7c55fb214`), still held RED |

## 1. The acceptance law, as ruled

> **A pure read rule must be importable without importing the authority to mutate
> the object it describes.**

## 2. What was wrong, and it was placement — never behaviour

`splitStoredSection` is pure: `(text, heading) → { headingPrefix, body } | null`.
No database, no ontology, no clock. It lived inside `lib/manuscript/sections/saveSection.ts`,
beside `saveSection` and `saveSectionInTransaction`, which UPDATE
`manuscript_draft_sections` and `manuscript_working_drafts`.

So any read-only caller that needed the projection rule acquired, transitively, a
module that can mutate the Work. `askRouteEffectFamily` detected exactly that when
B3 connected `workContext` to the Ask route, and **it was right to**. The route
never called the mutating exports — and a static law exists precisely because
*does not call it today* is not a guarantee.

⭐ **The pattern was already ruled in this codebase.** `lib/manuscript/exactText.ts`
was extracted on a founder ruling for the same reason. Neutral manuscript law does
not live inside a mutation-bearing carrier merely because that is where it was
first needed.

## 3. The extraction, proved mechanical

`lib/manuscript/sections/sectionProjection.ts` is new. It carries a module header,
then the function and its doc comment, **moved character for character**, and
nothing else.

```
BYTE-IDENTICAL move (doc + body): True
  chars moved                   : 1007
IMPORT added exactly once       : True
SAVE otherwise UNCHANGED        : True
module carries exactly ONE export     : True
module imports NOTHING                : True
remainder beyond header + moved block : ''
```

The whole diff to `saveSection.ts` is: **one import line added, the doc comment and
function removed.** Nothing else in that file moved.

⚠️ **The fidelity check was itself wrong twice before it was right, and both
failures are worth recording.**

- **First**, brace-matching from the first `{` after the signature landed on the
  **return type's** braces (`{ headingPrefix: string; body: string }`), carving 120
  of 1007 characters. It reported `True` — *because both sides were carved by the
  same wrong rule.* ⛔ An instrument that is wrong identically on both sides of a
  comparison reports agreement, not correctness. Repaired by anchoring the carve to
  `} | null {`, the body brace.
- **Second**, the carve started at `export function`, excluding the JSDoc that
  travelled with it, so `SAVE otherwise UNCHANGED` read `False` against a file that
  was in fact unchanged. The instrument was wrong; the extraction was not.

⚠️ **One C21-class near-miss, named rather than absorbed.** A check asserting the
new module contains no `export` beyond the function failed — on the module header's
own prose, *"the route never called the mutating exports."* Prose documenting the
prohibition, matched as the prohibited thing. The check was replaced with a
structural one (`count('export ') == 1`); the prose was not edited to dodge a
scanner.

## 4. Exactly one projection body in the tree

```
splitStoredSection bodies in lib/**: 1
```

⛔ No duplicate was created. A second implementation would shift offsets by the
heading prefix — silently, and only for headed sections.

## 5. Importers rewired, and nothing else

Every importer of `sectionProjection` imports `{ splitStoredSection }` and nothing
else:

```
lib/manuscript/ask/workContext.ts                  (composition branch only — see §8)
lib/manuscript/editorialRuntime/thread.ts
lib/manuscript/proposalChain/legacyLocus.ts
lib/manuscript/revisionAuthorization/execute.ts
lib/manuscript/revisionAuthorization/status.ts
lib/manuscript/revisionAuthorization/store.ts
lib/manuscript/sections/__tests__/saveSection.test.ts
lib/manuscript/sections/saveSection.ts
```

`execute.ts` now imports the mutation and the projection from two addresses,
**because they are two different capabilities.**

### Mutation exports remain reachable only through `saveSection`

```
declared in : lib/manuscript/sections/saveSection.ts:129  saveSection
              lib/manuscript/sections/saveSection.ts:149  saveSectionInTransaction
reached from: app/.../sections/[sectionId]/route.ts       saveSection
              lib/manuscript/revisionAuthorization/execute.ts  saveSectionInTransaction
```

⛔ No mutation export was moved, re-exported, or made reachable from a new address.

## 6. ⭐ The proof the act exists for

On the composition (`6f52c76e1`), walking the Ask route's transitive **VALUE**-import
graph — the same walk `askRouteEffectFamily` performs:

```
── ⭐ THE PROOF: is saveSection still in the route graph? ──
  OUT lib/manuscript/sections/saveSection.ts
  IN  lib/manuscript/sections/sectionProjection.ts
  files in graph: 35
```

Guards, on the composition:

```
askRouteEffectFamily · askRuntimeCannotWrite · askHttpBoundary
askPrePersistence · workContextShape

Test Suites: 5 passed, 5 total
Tests:       50 passed, 50 total
```

⭐ `askRouteEffectFamily` **turns GREEN**, and it turns green because the route no
longer reaches the mutating module — ⛔ not because the law was widened. The guard's
allowlist is **byte-identical to canonical**; no entry was added, none relaxed.

## 7. Owed witnesses, re-run on the composition

Fresh disposable PostgreSQL 16 cluster, `applied=451 refused=36` (the standing
legacy-migration count, unchanged):

| Witness | Result |
|---|---|
| `work-anchor-witness.ts` (B3, end-to-end, real HTTP) | **30 passed · 0 failed** |
| `work-context-witness.ts` (B2) | **32 passed · 0 failed** |
| `locus-alignment-01-witness.ts` | **21 passed · 0 failed** |

Projection, adoption and save-section suites on the extraction branch:
`saveSection.test.ts` **9/9**.

## 8. Gates

**Extraction branch `b8861baaf`:**

```
✅ No TypeScript regressions.
Test Suites: 4 failed, 120 passed, 124 total
Tests:       16 failed, 2140 passed, 2156 total
```

**Composition `6f52c76e1`:**

```
✅ No TypeScript regressions.
Test Suites: 4 failed, 122 passed, 126 total
Tests:       16 failed, 2159 passed, 2175 total
```

⚠️ **CORRECTION, ADDED 2026-09-15 AFTER THIS RECORD WAS MERGED — the numbers
above are a SCOPED run, and the record did not say so.**

Those figures come from a manuscript-scoped `jest` invocation, not the
repository-wide suite. They are real, and they are not the standing debt. Run
repository-wide, canonical `20bef53fa` stands at:

```
Test Suites: 42 failed, 1 skipped, 395 passed, 437 of 438 total
Tests:       94 failed, 19 skipped, 2 todo, 7107 passed, 7222 total
```

⛔ **A number quoted without its scope reads as the whole.** The four REDs
(`draft/route`, `draft/revisions/route`, `readings/route`, `evidenceCannotAct`)
are the four *within the scope that was run*, and prior act records in this
programme quote the same four the same way. The repository-wide standing set is
42 suites / 94 tests, and it is unchanged by this act.

⭐ The no-regression claim survives the correction, and is now made at the wider
scope where it means more. Measured against canonical `20bef53fa`, full set:

```
SUITES RED ON B3 BUT GREEN ON CANONICAL : (empty)
SUITES RED ON CANONICAL BUT GREEN ON B3 : (empty)
failing suites  42 → 42        failing tests  94 → 94
passing suites 395 → 397       passing tests 7107 → 7127
```

⛔ Not repaired here; not this act's. ⛔ And not narrowed until it looked
smaller.

## 9. ⚠️ What the composition branch is, and what it is not

`claude/spx-b3-composition` exists **only to prove the guard**. It is the extraction
plus B3 plus one line:

```ts
// lib/manuscript/ask/workContext.ts
import { splitStoredSection } from '@/lib/manuscript/sections/sectionProjection';
```

⛔ **It is not a merge candidate.** `workContext.ts` does not exist on the extraction
branch — it is B3's file — so that one line is **owed by B3**, once this extraction
lands on canonical. Recorded here so the sequencing is explicit rather than
discovered later:

```
merge SECTION-PROJECTION-EXTRACTION-01  →  B3 takes the one-line import  →  B3 merge ruling
```

## 10. Standing

- ✅ `splitStoredSection` extracted mechanically, byte-identical, single body in tree
- ✅ semantics, heading law, projection law, save behaviour, authorization semantics **all unchanged**
- ✅ `askRouteEffectFamily` GREEN, guard **not widened**
- ✅ mutation exports reachable only through `saveSection`
- ✅ B3 / B2 / locus-alignment witnesses re-run on the composition: 30/0 · 32/0 · 21/0
- ✅ typecheck 0 regressions; suite delta vs canonical: none
- ⛔ **NOT MERGED** — awaiting founder merge ruling
- ⛔ **B3 NOT MERGED** — still held, awaiting its own ruling after this one
- ⛔ **NOT DEPLOYED** — production untouched
