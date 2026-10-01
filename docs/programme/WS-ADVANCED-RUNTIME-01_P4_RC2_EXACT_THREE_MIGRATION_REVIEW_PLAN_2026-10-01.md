# WS-ADVANCED-RUNTIME-01 / P4 — RC2 Exact Three-Migration Review Plan

**Date:** 2026-10-01
**Status:** BOUNDED INDEPENDENT REVIEW PLAN · NO DEPLOYMENT AUTHORITY BY ITSELF
**Live old reader at plan freeze:** `975a208b8c39f99e9b47208ce5139bbec94bd8ac`
**Candidate lineage before this plan:** RC1 `03f0fd3abce16fcc1132481836b2e6ff8d364cd7` + canonical `d8e0c6bc` + RC2 remediation
**Supersedes for review purposes:** P2 (RC1). P2 is preserved unedited; its admitted review (P3, verdict REVISE) is not converted.

## Exact target relation

The deployment target is supplied externally by the Review-Custody harness and is never
self-identified by a commit SHA embedded in this document. The target must contain this
plan and the advanced Writer's Studio candidate lineage described above.

The reviewer must establish the exact target relation from immutable git bytes. Any
application, migration, dependency, deploy-script, or governance movement after review
invalidates applicability and requires a new review.

## Exact production-pending set

Read-only production ledger comparison found these three candidate migrations absent.
The deploy lane must independently rederive the pending set immediately before mutation.

1. `database/migrations/20260925000005_writer_editorial_relationship_custody.sql`
   SHA-256 `e77e45d11c4416785350ffbbea4dc648ecb09557468ee4c1840e9bf8c9600c47`
2. `database/migrations/20260925000006_writer_editorial_scope_identity_successor.sql`
   SHA-256 `c10bea44e539aa452c558d9f794975640eab533a2f47787b86da2d4911856607`
3. `database/migrations/20260926000004_writer_studio_return_state.sql`
   SHA-256 `a3ea657a23dba0e1c3c020a2e1641791bbbc3d91a324ef6d739295911576b6df`
Any addition, removal, reorder, byte movement, live-reader movement, or target movement
refuses this review.

## RC2 remediation of the P3 REVISE findings

| P3 finding | RC2 disposition |
|---|---|
| F1 Q10 unestablished | **Production evidence (founder-run, read-only, 2026-10-01, `pg_stat_user_tables`):** `member_manuscripts` 21 rows / 48 kB · `living_works` 8 / 48 kB · `proposal_chains` 9 / 96 kB. Row counts are statistics estimates; on-disk sizes confirm the scale. Lock *hold* time for the constraint/index builds is negligible at this size. Concurrent index builds are deliberately not used. |
| F2 lock acquisition | Each of the three migrations sets `SET LOCAL lock_timeout = '5s'` inside its own transaction. A timeout aborts that file before the reader swap, with the old reader intact. |
| F3 migration 2 not re-runnable | The succession runs in one `DO` block that is a no-op when `manuscript_scope_requested` already exists, and otherwise refuses on any pre-successor episode row before any rename. |
| F4 target reader requires migration 2 | Runbook rule: while any of these three is pending, the target ships **only** through `scripts/deploy-production.sh deploy|update`, never `pre-deploy-gate.sh deploy-maia` or bare container recreation. The target routes and `contract.ts` are added to the minimum Reads below (Q8). |
| F5 unindexed cascade FKs | Migration 3 adds `wsrr_relationship_idx (relationship_id)` and `wspr_draft_section_idx (draft_section_id)`. |
| Duplicate precheck (founder) | Migration 1's `UNIQUE (id, member_id)` cannot meet duplicates, because `id` is already each table's primary key. Pre-deploy read-only witness, expected to return zero rows: `SELECT id, member_id, count(*) FROM living_works GROUP BY 1,2 HAVING count(*) > 1;` (and the same for `member_manuscripts`). Any row is a founder dedupe decision, never a migration action. |

Disposable PostgreSQL 16 witness of the RC2 bytes (stub prerequisite schema), from a fresh database each time:
fresh apply 1→2→3 PASS · re-run 1, 2, 3 after commit PASS · migration 2 with one pre-successor episode refuses and leaves prefix 1 (no `locus_scope_kind`, `requested_scope` intact) · migration 1 behind a held `ACCESS SHARE` transaction fails after 5 s with `lock timeout` and changes nothing.

## Deployment ordering

The governed production path must preserve:

exact target materialization → build/provenance → admitted migration review and
all-prefix compatibility → exact pending-set re-witness → exact old-reader re-witness
→ migrations in filename order → candidate swap → running provenance/health.

A failed migration must leave the candidate reader unswapped. Because migrations commit
independently, the reviewer must establish old-reader compatibility after every possible
committed prefix 1 through 3, not only after the final schema.

## Independent review questions

The reviewer must independently establish or reject all of the following:

1. Migration 1's new `UNIQUE (id, member_id)` constraints on `living_works` and
   `member_manuscripts` are compatible with the exact old reader's reads/writes and
   cannot reject an old-reader-valid row.
2. Migration 1's relationship/episode tables, indexes, immutable-update trigger and
   foreign keys are additive with respect to the old reader.
3. Migration 1's child-reference choice (non-FK child identities) does not alter any
   old-reader deletion, cascade, or update expectation.
4. Migration 2's nullable `proposal_chains.locus_scope_kind` addition is compatible
   with every old-reader proposal-chain insert/read/update path.
5. Migration 2 refuses before semantic succession if any pre-successor A2 episode exists,
   and a refusal leaves the schema/data at the prior compatible prefix.
6. Migration 2's renames/constraint succession affect only the table created by migration
   1 and cannot invalidate the exact old reader, which has no A2 relationship runtime.
7. Migration 3's return tables are additive and their FKs/cascades do not change old
   Work, manuscript, relationship, or draft-section behavior.
8. The target reader is compatible with the final schema and fails closed when required
   A2 schema is absent or migration 2 refuses.
9. Reader rollback to `975a208b8...` remains lawful after each committed prefix and
   after the final expanded schema; no DB down-migration is required for reader rollback.
10. DDL lock/index/constraint-validation risks are acceptable for the observed production
    shape recorded above, given the 5 s `lock_timeout`, or are recorded as findings requiring remediation.
11. The RC2 remediation is correct: migration 2's re-run guard cannot skip a genuinely
    unapplied succession, and the guard does not weaken the pre-successor refusal.
A verdict of `REVISE` or `BLOCKED` is lawful and must never be converted into
approval to complete deployment.

## Minimum physical Reads

The independent reviewer must physically Read, at minimum:

- this plan;
- `MIGRATION_COMPATIBILITY_CONTEXT.json`;
- all three pending migration files;
- `scripts/deploy-production.sh`;
- `scripts/run-sql-migrations.sh`;
- target `lib/writers-studio/relationshipCustody.ts`;
- target `lib/writers-studio/relationshipCarriage.ts`;
- target `lib/writers-studio/returnState.ts`;
- target `lib/writersStudio/rebuild/relationshipOrchestration.ts`;
- target `lib/writersStudio/rebuild/returnStateClient.ts`;
- target `lib/manuscript/proposalChain/store.ts`;
- target `lib/manuscript/editorialRuntime/thread.ts`;
- target `lib/manuscript/proposalChain/contract.ts`;
- target `app/api/writers-studio/relationships/route.ts`;
- target `app/api/writers-studio/relationships/[id]/route.ts`;
- target `app/api/writers-studio/relationships/[id]/carry-sources/route.ts`;
- target `app/api/writers-studio/return/place/route.ts`;
- target `app/api/writers-studio/return/relationship/route.ts`;
- target `app/api/writers-studio/editorial/turn/route.ts`;
- target `app/api/sovereign/manuscripts/[id]/review-discuss/route.ts`;
- exact old-reader `app/api/sovereign/living-works/route.ts`;
- exact old-reader `app/api/sovereign/living-works/[id]/expressions/route.ts`;
- exact old-reader `app/api/sovereign/manuscripts/route.ts`;
- exact old-reader `app/api/sovereign/manuscripts/blank/route.ts`;
- exact old-reader `lib/manuscript/proposalChain/store.ts`;
- exact old-reader `lib/manuscript/editorialRuntime/thread.ts`;
- exact old-reader `app/api/writers-studio/rebuild/context/route.ts`;
- exact old-reader `app/api/sovereign/manuscripts/[id]/draft/route.ts`.

The old-reader paths live beneath `old-reader/<exact-old-reader-SHA>/...` in the
compatibility review bundle. Search may scope discovery but does not witness coverage.
## Required review JSON

The review must carry the ordinary Review-Custody fields:

- `verdict`: `APPROVED | REVISE | BLOCKED`;
- exact `plan_sha256`;
- stable `trace_id` equal to the reviewer session identity;
- non-empty `reviewer`, `summary`, `findings`, `coverage.files`, and explicit
  `limitations`.

It must additionally carry `migration_compatibility` with:

- `instrument = migration-compatibility/v1`;
- verdict `COMPATIBLE` or `INCOMPATIBLE`;
- exact full old-reader commit;
- exact full target-reader commit;
- exact three ordered pending migration paths and SHA-256 values;
- physically witnessed old-reader evidence with repo path, SHA-256, and exact trace path;
- non-empty rationale and explicit limitations;
- `failure_prefix_compatibility.instrument = migration-prefix-compatibility/v1`;
- verdict `ALL_PREFIXES_COMPATIBLE` only if prefixes 1, 2 and 3 are each established;
- exactly three prefix entries, each bound to its ending migration, with rationale and
  explicit limitations.

The production gate recomputes target migration hashes and old-reader evidence from git
objects. Self-reported hashes do not establish compatibility.

## Existing evidence may inform, not substitute

The focused Writer's Studio tests, migration matrices, A2 fail-closed migration witness,
type-health result, build result, and earlier A2 programme records may inform the review.
They do not substitute for a fresh independent review of this exact relation.

## Closing condition

This plan authorizes nothing by itself.

Deployment may advance only if the frozen composed gate reports:

`MIGRATION REVIEW + COMPATIBILITY + PREFIX GATE APPLIES`

for the exact live old reader, exact target, exact ordered pending migration blobs,
exact admitted review bytes, and physically witnessed trace coverage.
