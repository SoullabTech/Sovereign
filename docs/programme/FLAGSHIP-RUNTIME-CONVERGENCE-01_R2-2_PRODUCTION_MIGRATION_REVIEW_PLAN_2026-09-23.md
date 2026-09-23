# FLAGSHIP-RUNTIME-CONVERGENCE-01 / R2-2 — PRODUCTION MIGRATION REVIEW PLAN

**Date:** 2026-09-23  
**Status:** BOUNDED REVIEW PLAN · NO DEPLOYMENT EVIDENCE BY ITSELF  
**Programme:** FLAGSHIP-RUNTIME-CONVERGENCE-01  
**Act:** R2-2 production promotion of Writer's Studio MAIA conversation + Review Discuss

## 1. Question

Before the R2-2 runtime is promoted, determine whether the exact pending migration

`database/migrations/20260923000001_review_discuss_disclosure_boundary.sql`

is compatible with both:

1. the exact reader currently running in production immediately before deployment; and
2. the exact target reader selected for immutable-SHA deployment.

The review must also establish compatibility for every successfully committed migration prefix. There is one migration in this bounded R2-2 set, so there is one non-empty committed prefix to attest.

## 2. Deployment ordering that governs the review

The full production path is `scripts/deploy-production.sh deploy <SHA>`, not the quick `deploy-maia` lane.

The governed deploy sequence is migrate-before-swap: exact target build and provenance checks → migration review/compatibility gate → exact pending-set re-witness → migration → candidate swap.

Therefore the decisive failure condition is:

> if the migration commits but the candidate reader never swaps in, can the exact old reader continue operating against the widened schema?

The review must answer that relation directly.## 3. Migration under review

The migration widens two existing CHECK constraints on `context_disclosure_receipts`:

- `boundary` additionally admits `writers_studio.review_discuss->maia_cognition`;
- `gesture` additionally admits `discuss_finding`.

It does not add or drop a table, column, index, trigger, row, or persisted prose field.

The target application types carry the same new vocabulary in
`lib/disclosure/contextDisclosureReceipt.ts`.

The target Review Discuss route uses those values only for the new flagged R2-2 act.

## 4. Required physical review bundle

Build the reviewer workspace with:

`scripts/migration-compatibility-review-bundle.sh <OLD_READER_SHA> <TARGET_SHA> <BUNDLE_DIR>`

The reviewer process must run with its cwd equal to `BUNDLE_DIR`.

The bundle must contain:

- the exact target tree at repository-relative paths;
- the exact old-reader tree at `old-reader/<OLD_READER_SHA>/...`;
- `MIGRATION_COMPATIBILITY_CONTEXT.json` naming both exact commits.

The reviewer's read trace—not review prose—must witness every file claimed in coverage.

## 5. Minimum required reads

The reviewer must physically Read, at minimum:

1. this plan;
2. `MIGRATION_COMPATIBILITY_CONTEXT.json`;
3. `database/migrations/20260923000001_review_discuss_disclosure_boundary.sql`;
4. target `lib/disclosure/contextDisclosureReceipt.ts`;
5. target `app/api/sovereign/manuscripts/[id]/review-discuss/route.ts`;
6. target `scripts/deploy-production.sh`;
7. old-reader `old-reader/<OLD_READER_SHA>/lib/disclosure/contextDisclosureReceipt.ts`.

Additional Read calls are permitted. Grep/Glob may scope discovery but do not count as coverage.

Shell, Write, Edit, and mutation tools are forbidden to the independent reviewer.## 6. Compatibility question

The reviewer must decide whether the old reader tolerates the schema after the migration.

The expected compatibility argument, which the reviewer must independently confirm or reject, is:

- the migration only widens closed CHECK vocabularies;
- every boundary/gesture value lawful for the old reader remains lawful after migration;
- the old reader does not need to know or emit the newly added values;
- applying the wider CHECK therefore does not invalidate old-reader inserts using the pre-existing vocabulary;
- if migration succeeds and candidate swap subsequently fails, the old reader remains able to use the prior vocabulary;
- the target reader requires the new vocabulary for Review Discuss, so schema-before-swap is the safe direction.

The review must not infer compatibility merely from the word "additive". It must inspect the exact old-reader source evidence and exact migration bytes.

## 7. Required review JSON

The independent review must emit the ordinary REVIEW-CUSTODY fields:

- `verdict`
- `plan_sha256`
- `trace_id`
- `reviewer`
- `summary`
- `findings`
- `coverage.files`
- `limitations`

For deployment, `verdict` must be `APPROVED`. Any high or medium finding must be resolved before a new review is admitted.

It must additionally emit `migration_compatibility` with instrument
`migration-compatibility/v1` and bind:

- exact full old-reader commit;
- exact full target-reader commit;
- ordered pending migration path + SHA-256;
- at least one old-reader evidence item containing:
  - `repo_path` in the old-reader git tree;
  - SHA-256 of those old-reader bytes;
  - `trace_path` under `old-reader/<OLD_READER_SHA>/...` physically Read by the reviewer;
- non-empty rationale;
- explicit limitations array.## 8. Failure-prefix attestation

Because the migration runner commits migrations independently,
`migration_compatibility.failure_prefix_compatibility` is mandatory.

For this bounded set of one pending migration, the attestation must be:

- instrument: `migration-prefix-compatibility/v1`;
- verdict: `ALL_PREFIXES_COMPATIBLE`;
- exactly one prefix entry;
- `through_path` equal to the exact migration path;
- `through_sha256` equal to the exact migration SHA-256;
- non-empty rationale explaining why the old reader tolerates the schema after that migration has committed;
- explicit limitations array.

If production has any additional pending migration at deployment time, this review does **not** automatically extend to it. The pending set must be re-reviewed as a new exact ordered relation.

## 9. Runtime activation boundary

Successful review and migration do not themselves activate Review Discuss.

Production activation additionally requires both runtime flags:

`WRITERS_STUDIO_EDITORIAL_ENABLED=1`
`WRITERS_STUDIO_REVIEW_DISCUSS_ENABLED=1`

The first is already established production configuration as of the preflight observation. The second is the R2-2 activation switch.

Rollback of the new cognition surface is fail-closed by setting
`WRITERS_STUDIO_REVIEW_DISCUSS_ENABLED=0`.
The widened CHECK vocabulary may remain safely present because old values are preserved.

## 10. Review limitations

This plan does not claim:

- that production has only one pending migration until the deploy gate re-derives the ledger;
- that the currently observed old-reader SHA will remain the old reader until deployment;
- that a static review proves PostgreSQL runtime behavior;
- that successful migration proves the Writer's Studio experience is correct;
- that review custody substitutes for the already completed R2-2 constitutional and browser witnesses.

Any movement in old reader, target reader, pending migration set, migration bytes, review bytes, or witnessed coverage must fail closed and require fresh evidence.

## 11. Closing condition

The production migration gate may proceed only when it reports:

`MIGRATION REVIEW + COMPATIBILITY + PREFIX GATE APPLIES`

for the exact production relation immediately preceding migration.

Anything else is a deployment refusal, not a warning.
