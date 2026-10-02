# FLAGSHIP-RUNTIME-CONVERGENCE-01 / R2-2 — PRODUCTION MIGRATION REVIEW PLAN

**Date:** 2026-09-23  
**Status:** BOUNDED REVIEW PLAN · NO DEPLOYMENT EVIDENCE BY ITSELF  
**Programme:** FLAGSHIP-RUNTIME-CONVERGENCE-01  
**Act:** R2-2 production promotion of Writer's Studio MAIA conversation + Review Discuss

## 1. Exact production pending set observed before promotion

Read-only comparison of the exact R2-2 target migration tree against production
`schema_migrations.filename` found **two** pending SQL migrations, in order:

1. `database/migrations/20260921000001_developmental_reading_observation_identity_compatibility.sql`
2. `database/migrations/20260923000001_review_discuss_disclosure_boundary.sql`

This plan governs exactly that ordered pair. The deploy gate must derive the pending set again immediately before mutation. Any addition, removal, reordering, or byte movement refuses this review.

The review must determine whether the exact reader running immediately before deployment can continue operating after every successfully committed prefix, and whether the exact target reader is compatible with the final schema.## 2. Deployment ordering that governs the review

The production path is `scripts/deploy-production.sh deploy <SHA>`, not the quick
`deploy-maia` lane.

The governed sequence is:

exact target build and provenance
→ migration review / compatibility gate
→ exact pending-set re-witness
→ migrations, independently committed in filename order
→ candidate swap
→ running provenance verification

Therefore two failure states are material:

- **Prefix 1:** observation-identity migration committed; Review Discuss migration not yet committed; old reader remains live.
- **Prefix 2:** both migrations committed; candidate swap has not yet occurred; old reader remains live.

The independent review must attest compatibility for both states or refuse deployment.

## 3. Pending migration 1 — durable observation identity compatibility

`20260921000001_developmental_reading_observation_identity_compatibility.sql` replaces the
`developmental_readings_observations_check()` trigger function.

It widens the admitted observation JSON shape with an all-or-none canonical identity group:

`observationId · admissionIndex · basisFingerprint · position`

while explicitly preserving legacy observations with **zero** identity fields:

`identity_field_count IN (0, 4)`.

It does not rewrite or backfill existing readings, and the existing trigger binding remains unchanged.The target reader's canonical developmental observation contract and freeze seam carry the four identity fields. The old reader evidence must establish what shape the deployed reader can write.

The expected compatibility proposition, which the reviewer must independently confirm or reject, is:

- all legacy observation keys and semantic validations remain accepted;
- an old-reader observation carrying none of the four new identity fields follows the lawful `identity_field_count = 0` path;
- therefore migration 1 may commit while the old reader remains live without making its existing observation writes invalid;
- the target reader needs the widened trigger because its canonical freeze seam emits the identity group.

The reviewer must inspect exact migration bytes plus exact old- and target-reader source. The word "compatibility" in the migration filename is not evidence.

## 4. Pending migration 2 — Review Discuss disclosure vocabulary

`20260923000001_review_discuss_disclosure_boundary.sql` widens two existing CHECK vocabularies on
`context_disclosure_receipts`:

- `boundary` additionally admits `writers_studio.review_discuss->maia_cognition`;
- `gesture` additionally admits `discuss_finding`.

It adds or removes no table, column, index, row, trigger, or persisted prose field.

The expected compatibility proposition, which the reviewer must independently confirm or reject, is:

- every boundary and gesture value lawful for the old reader remains lawful;
- the old reader need not know or emit the new values;
- the target Review Discuss route requires the new values;
- widening the CHECK therefore permits schema-before-swap without invalidating old-reader writes.## 5. Required physical review bundle

Build the reviewer workspace with:

`scripts/migration-compatibility-review-bundle.sh <OLD_READER_SHA> <TARGET_SHA> <BUNDLE_DIR>`

The reviewer process must run with cwd equal to `BUNDLE_DIR`.

The bundle contains:

- exact target tree at repository-relative paths;
- exact old-reader tree at `old-reader/<OLD_READER_SHA>/...`;
- `MIGRATION_COMPATIBILITY_CONTEXT.json` naming both exact commits.

The execution trace, not review prose, must witness every file claimed in coverage.

## 6. Minimum required physical Reads

The reviewer must physically Read, at minimum:

1. this plan;
2. `MIGRATION_COMPATIBILITY_CONTEXT.json`;
3. both pending migration files;
4. target `lib/manuscript/developmentalReading/contract.ts`;
5. target `lib/manuscript/developmentalReading/freeze.ts`;
6. target `lib/disclosure/contextDisclosureReceipt.ts`;
7. target `app/api/sovereign/manuscripts/[id]/review-discuss/route.ts`;
8. target `scripts/deploy-production.sh`;
9. old-reader `old-reader/<OLD_READER_SHA>/lib/manuscript/developmentalReading/contract.ts`;
10. old-reader `old-reader/<OLD_READER_SHA>/lib/manuscript/developmentalReading/freeze.ts`;
11. old-reader `old-reader/<OLD_READER_SHA>/lib/disclosure/contextDisclosureReceipt.ts`.

Additional Read calls are allowed. Grep/Glob may scope discovery but witness no file coverage.
Bash, Write, Edit, and mutation tools are forbidden to the independent reviewer.## 7. Required review JSON

The independent review must emit ordinary REVIEW-CUSTODY fields:

- `verdict`: `APPROVED | REVISE | BLOCKED`
- `plan_sha256`
- `trace_id`
- `reviewer`
- non-empty `summary`
- `findings`
- `coverage.files`
- explicit `limitations`

For deployment, the admitted verdict must be `APPROVED`. A high or medium finding must not be waved through.

The same review bytes must carry `migration_compatibility` with instrument
`migration-compatibility/v1` and bind:

- exact full old-reader commit;
- exact full target-reader commit;
- the exact ordered pair of pending migration paths and SHA-256 values;
- old-reader evidence for both affected domains, with each item containing:
  - repository path in the old-reader git tree;
  - SHA-256 of those exact old-reader bytes;
  - exact `old-reader/<OLD_READER_SHA>/...` trace path physically Read by the reviewer;
- non-empty rationale;
- explicit limitations array.

## 8. Failure-prefix compatibility

`migration_compatibility.failure_prefix_compatibility` is mandatory with instrument
`migration-prefix-compatibility/v1`.

It must contain **exactly two** prefix entries, ordered exactly like the pending set:

1. through observation-identity migration path + exact SHA-256;
2. through Review Discuss migration path + exact SHA-256.

Each prefix needs a non-empty rationale and explicit limitations.

The reviewer must independently decide whether the exact old reader tolerates each prefix. A final-schema-only statement is insufficient.## 9. Runtime activation boundary

Successful migration review and schema application do not themselves activate Review Discuss.

Production activation requires:

`WRITERS_STUDIO_EDITORIAL_ENABLED=1`
`WRITERS_STUDIO_REVIEW_DISCUSS_ENABLED=1`

The editorial flag was already present and enabled in production during the preflight read.
The Review Discuss flag is the R2-2 activation switch.

Fail-closed runtime rollback is:

`WRITERS_STUDIO_REVIEW_DISCUSS_ENABLED=0`

The two migrations are forward-compatible widenings and need not be reversed merely to disable the new cognition surface.

## 10. Review limitations and freshness

This plan does not claim:

- that the observed old-reader SHA will remain the old reader until mutation;
- that these two migrations will remain the complete production-pending set;
- that static source review proves PostgreSQL runtime behavior;
- that migration review substitutes for the R2-2 constitutional matrix or live browser witness;
- that an approved review grants merge or production authority by itself.

Immediately before migration, the deploy lane must re-establish exact old reader, target reader, ordered pending paths, pending bytes, admitted review bytes, and witnessed trace coverage.

Any movement fails closed.

## 11. Closing condition

Production migration may proceed only when the exact composed gate reports:

`MIGRATION REVIEW + COMPATIBILITY + PREFIX GATE APPLIES`

for the live production relation immediately preceding mutation.

Anything else is a deployment refusal, never a warning.
