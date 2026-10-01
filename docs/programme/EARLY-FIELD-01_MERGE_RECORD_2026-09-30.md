# EARLY-FIELD-01 — Merge Record

**Programme day:** 2026-09-30
**Merged:** 2026-10-01 00:26:13Z
**PR:** #1547 — `feat(living-field): cohort-gate R1R3 instrument on current canon`
**Status:** MERGED TO CANON · deployment witness still required

> The implementation admitted for merge is the implementation that passed the Class A bar.
> A docs-only base refresh changed the head SHA, not the implementation.

## 1 · Merge subject

The reviewed candidate was merged from
`feature/early-field-01-current-20260930` into
`clean-main-no-secrets`.

At merge:

- base: `71859c3a3e9cac7abaaf8d57bc54ef21bb533eca`
- PR head: `0e29c65df5af87bb5ae3b3043e9613d037aa738d`
- merge commit: `cc1c5b4d79793dd7911d6aea0054e8c678d01bcb`
- resulting canonical head: `cc1c5b4d79793dd7911d6aea0054e8c678d01bcb`

## 2 · Certified lineage

The implementation lineage recorded for this merge is:

```text
c31b85a34
  → 700d9d361
  → 0e29c65df
  → cc1c5b4d7  (merge / canonical)
```

`700d9d361` was the certified implementation candidate on canonical
`89f7876e8`. Canonical then advanced to `71859c3a3` when #1544 merged.

The branch was refreshed with that canonical change, producing `0e29c65df`.
The refresh brought in only #1544's governing Markdown record. Direct diff
comparison showed the implementation delta was byte-identical before and after
the refresh: the same 8 files, +601 / −2.

No implementation repair was made between the two candidate heads.

## 3 · Merge bar

All 10 required CI checks passed on the merge head `0e29c65df`, including
Docker build, TypeScript no-regression, sovereignty, empty-database
reconstruction, covenant gates, Axis 1, JARVIS falsifiers, check-diagrams,
GitGuardian and auto-label.

The earlier head `700d9d361` also completed its CI run without a failed or
unfinished check. The R1R3 instrument remained unchanged: 52/52 tests, eight
deliberately wrong versions and four source mutations.

GitHub reported the final head mergeable with no conflicts against
`71859c3a3`.

**Merge adjudication: ACCEPTED.**

## 4 · What this merge does not establish

Merge does not constitute production admission or widening evidence.

The next production act must deploy the **canonical merge SHA**, not the PR
head. Before deployment, the production environment must again show
`EARLY_FIELD_ENABLED` unset or `false` and `EARLY_FIELD_MEMBER_IDS` empty.

After deployment, the first runtime witness is the non-cohort case: an ordinary
signed-in member keeps the Living Field, does not receive
`LivingFieldInstrument`, and `/api/early-field/admission` returns
`{"admitted":false}`.

#1539's origin-preservation witness and H1's `localhost:3100` admission witness
remain separate evidence acts.
