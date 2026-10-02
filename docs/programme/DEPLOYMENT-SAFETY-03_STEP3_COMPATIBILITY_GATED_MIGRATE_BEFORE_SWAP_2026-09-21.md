# DEPLOYMENT-SAFETY-03 · STEP 3 — COMPATIBILITY-GATED MIGRATE-BEFORE-SWAP

**Date:** 2026-09-21
**Status:** IMPLEMENTED CANDIDATE · PRODUCTION UNTOUCHED
**Founder authorization:** Step 3 only
**Exact parent:** `d75e304711e12174dfe2d7e80f26c7a5e1ad2f5f`

## Authorized objective

Reorder normal `deploy` and `update` only after the composed Review Custody +
Migration Compatibility gate passes.

Before schema mutation, re-witness the exact reviewed old reader.

A migration failure must:

- leave the old reader live;
- prevent the candidate reader from swapping in;
- produce no deployment-success claim.

No merge, deployment or production mutation is performed by this implementation act.

## Additional failure-prefix law discovered during implementation

The production runner executes each migration in its own transaction. A later
migration cannot roll back an earlier committed migration.

Therefore final-schema compatibility is not enough for pre-swap failure safety.

If pending migrations are:

`M1 → M2 → M3`

then a failure in M3 leaves the old reader live against the committed schema
prefix `M1 → M2`.

Step 3 therefore adds, without changing the DS-03 compatibility constitution:

`migration_compatibility.failure_prefix_compatibility`

with one exact prefix entry per ordered pending migration.

Each prefix entry is bound to:

- the path of the migration ending that prefix;
- that migration's exact SHA-256;
- a non-empty rationale;
- an explicit limitations array.

The verdict must be:

`ALL_PREFIXES_COMPATIBLE`

The pure prefix evaluator has five laws and five defeat candidates.

First matrix execution exposed one falsifier defect: the order candidate survived
because the falsifier changed both path and hash, so the wrong implementation
still detected the hash movement. The falsifier was repaired to hold per-position
bytes constant while moving only path/order identity.

Result:

```text
PREFIX MATRIX: LETHAL + DISCRIMINATING
  5/5 candidates died
  STRICT_PREFIX_COMPATIBILITY satisfies 5/5 laws
```

The DS-03 10/10 compatibility matrix and 6/6 composition matrix remain unchanged.

## Last-moment relation re-witness

The composed gate observes the exact ordered pending set and the exact old reader.

Step 3 caches those observations only after the gate passes.

Immediately before the migration runner:

1. the production-pending set is derived again from the immutable target migration
   tree plus the live production ledger;
2. it must equal the exact ordered set approved by the gate;
3. only then is the running `maia-sovereign` `GIT_COMMIT` read again;
4. that stamp must resolve to the exact old-reader commit reviewed for compatibility;
5. the migration runner is the next schema-mutating act.

If the pending set moves, the process refuses before reading the old-reader witness.

If the old reader moves, the process refuses before migration.

A dedicated witness proves the lawful event order:

```text
PENDING
OLD_READER
MIGRATE
```

and proves both mutable-state movements refuse before `MIGRATE`.

## New normal deploy/update order

Before Step 3:

```text
build → verify image → review/compatibility gate
      → rollback tags → candidate swap → verify running → migrate
```

Step 3 candidate:

```text
build
  → verify image
  → review custody + final compatibility + all-prefix compatibility
  → re-witness exact pending set
  → re-witness exact old reader
  → MIGRATE
  → rollback tags
  → candidate swap
  → verify exact running target
  → smoke / completion
```

Rollback role tags no longer advance before migration succeeds.

## Migration failure semantics

On runner failure:

```text
candidate reader       NOT SWAPPED
old reader             REMAINS LIVE
successful prefixes    explicitly reviewed compatible with old reader
later migrations       unapplied
deployment completion  REFUSED
```

No image rollback is requested merely because the migration failed: the reader
never swapped.

## E2E and discrimination

The composed CLI E2E now proves three cases:

1. one exact admitted review + same trace + final compatibility + all-prefix
   compatibility → gate applies;
2. an old-reader Read present in raw trace but absent from admitted custody coverage
   → compatibility refuses;
3. final-schema compatibility with the all-prefix attestation removed → ordering
   refuses with `BAD_PREFIX_COMPATIBILITY`.

The pre-swap relation witness proves:

- unchanged relation may migrate;
- pending-set movement refuses before old-reader observation and migration;
- old-reader movement refuses before migration;
- the old-reader read is the last observation before `MIGRATE`;
- migration failure exits non-zero and states that the candidate was not swapped.

## Preserved boundaries

This candidate does not change:

- Review Custody frozen law;
- DS-03 final compatibility law;
- bundle provenance;
- migration contents;
- per-file transaction semantics;
- production data or schema;
- production runtime;
- the `migrate` command's separate operational role.

Production remains untouched until a separate merge/deployment authorization.
