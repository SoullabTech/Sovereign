# DEPLOYMENT-SAFETY-03 · STEP 2B — COMPATIBILITY GATE COMPOSITION

**Date:** 2026-09-21
**Branch:** `feature/deployment-safety-03-migration-compatibility-20260921`
**Composes:** `e07f100c` (compatibility contract) + `e8787511` (exact review bundle)

## Founder ruling carried into the law

Compatibility custody is a **second, independently admitted claim** — not a field
on the migration review:

- *migration custody* — "was this migration reviewed correctly against the target?"
- *compatibility custody* — "does the exact old reader tolerate the resulting target?"

They must converge on one exact target identity. They must **not** become one
attestation merely because they were observed in one session.

> Independent records do **not** require two different humans. The same reviewer
> may perform both acts if authorized and competent. What the repository preserves
> is **two separately admitted claims, two traces, two applicability checks.**

That precision is load-bearing and is itself falsified (GC-F9): a candidate that
reads independence as *two different humans* is a defeat candidate and dies.
Independence keys on **admission identity — review bytes and trace id — never on
reviewer identity.**

## Composition rule

> The migration may proceed only when both an admitted migration review and an
> admitted compatibility review are bound to the same exact target and each
> remains applicable.

## Artifacts

| Path | Role |
|---|---|
| `scripts/migration-compatibility-gate-core.ts` | pure composition law |
| `tests/constitutional/migration-compatibility-gate/falsifiers.ts` | 12 laws |
| `tests/constitutional/migration-compatibility-gate/candidates.ts` | 12 defeat candidates |
| `tests/constitutional/migration-compatibility-gate/matrix.ts` | execution matrix |
| `tsconfig.migration-compatibility-gate.json` | isolated typecheck |
| `scripts/migration-compatibility-gate.ts` | composed CLI |

## The twelve laws

| id | law |
|---|---|
| GC-F1 | A stale migration review is never rescued by compatibility. |
| GC-F2 | A compatibility review is structurally required, not an optional upgrade. |
| GC-F3 | A stale compatibility review is never rescued by migration custody. |
| GC-F4 | An APPROVED migration review never overrides a refused compatibility verdict. |
| GC-F5 | The migration record must bind to the exact deployment target. |
| GC-F6 | The compatibility record must bind to the exact deployment target. |
| GC-F7 | One trace observed twice is one admitted claim, not two. |
| GC-F8 | One review's bytes admitted twice is one claim, even under two trace ids. |
| GC-F9 | **Independence is of ADMISSIONS, never of humans.** (admit-law, not refuse-law) |
| GC-F10 | Old-reader evidence read from the target tree proves nothing. |
| GC-F11 | Compatibility evidence must be witnessed by its own trace, not the migration review's. |
| GC-F12 | An empty pending set never crosses. |

Two of these close substitution holes that only appear **because** there are now
two records:

- **GC-F10** — hashing "old reader source" at the *target* commit would make every
  compatibility claim vacuously true. The CLI reads those bytes at the old-reader
  commit and the tree it used is named and checked.
- **GC-F11** — with two admitted corpora present, the witness list handed to
  `evaluateCompatibility` could silently become the *migration* review's. The law
  requires the compatibility review's own trace.

## Result

```
COMPOSITION MATRIX: LETHAL + DISCRIMINATING
  12/12 candidates died on their named falsifier
  STRICT_COMPOSITION satisfies 12/12 laws
  all collateral CLASSIFIED
```

One classified collateral: `GC-DC1` also fires `GC-F3`, because `reviewApplicable`
is one predicate serving both records — a candidate that accepts staleness cannot
accept it on only one side without ceasing to model the error. Irreducible.

Lane regression: DS-03 compatibility `10/10` unchanged · Review Custody Step 1
`14/14` · Step 2 coverage green · `FREEZE INTACT`.

## Drift control

The CLI **delegates the migration side to `scripts/review-custody-migration-gate.ts`
as a subprocess** rather than re-implementing its law. Step 3's gate is not edited
and cannot drift from this one. The compatibility side is checked in-process
against the same frozen cores (`review-custody-core`, `review-custody-coverage`).

## ⚠️ Evidence limitations

- `npm run typecheck:migration-compatibility-gate` was **NOT** run to a pass here.
  This container has no `node_modules`/`@types/node`; the **pre-existing**
  `tsconfig.migration-compatibility.json` fails identically, so this is an
  environment fact, not a property of the new suite. The three law-bearing files
  (core, falsifiers, candidates) typecheck **exit 0** under an isolated
  `strict` + `noUncheckedIndexedAccess` config with `types: []`. `matrix.ts` is
  unverified here. A founder-run typecheck is the evidence of record.
- The composed CLI has been smoked only on its argument-refusal path. It has
  **not** been run against real custody records, traces or a real bundle.
- No production database, deployment or reader was contacted.

## ⛔ Standing

- Composition law: **12/12 LETHAL + DISCRIMINATING**
- `deploy-production.sh`: **UNTOUCHED** — this act does not bind the composed gate
  into the deploy script. `review_migration_custody_or_abort` still gates migration
  custody alone.
- `build → swap → migrate` ordering: **NOT reordered, NOT authorized.**
- Production: **UNTOUCHED.**

Binding the composed gate into `review_migration_custody_or_abort` is a distinct
act, and the ordering change is distinct again. This act builds the machinery that
can know when migrating first is safe; it does not move the dangerous line.
