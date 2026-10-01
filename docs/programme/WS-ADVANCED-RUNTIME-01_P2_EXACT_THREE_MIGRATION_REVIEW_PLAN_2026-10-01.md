# WS-ADVANCED-RUNTIME-01 / P2 — Exact Three-Migration Review Plan

**Date:** 2026-10-01
**Status:** BOUNDED INDEPENDENT REVIEW PLAN · NO DEPLOYMENT AUTHORITY BY ITSELF
**Live old reader at plan freeze:** `975a208b8c39f99e9b47208ce5139bbec94bd8ac`
**Candidate lineage before this plan:** `ecf69ae97eef4e8b9bb010e2f224d33b252ebb42`

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
   SHA-256 `1107b6382edc30d66fd6a043ff0ae8c01fd789c5670462d4ce71bcd8e3d7a84d`
2. `database/migrations/20260925000006_writer_editorial_scope_identity_successor.sql`
   SHA-256 `a514c25540e88e1ef6b20ff49a1f205ddb94a4e95d3c7a1d616dcad8034a2154`
3. `database/migrations/20260926000004_writer_studio_return_state.sql`
   SHA-256 `be3d512e8342060e4056a8643aa77fd78dd576467804b6ee55483ef20f06d616`
Any addition, removal, reorder, byte movement, live-reader movement, or target movement
refuses this review.

### Review-remediation amendment · 2026-10-01

The first independent restricted review returned `REVISE`. Its material schema finding
was that migration 1 built the two composite unique indexes implicitly inside
`ALTER TABLE ... ADD CONSTRAINT UNIQUE`, extending an `ACCESS EXCLUSIVE` lock across the
index build on `living_works` and `member_manuscripts`. Read-only production census at
that point observed 8 and 21 rows respectively (48 KiB each), but the finding was not
converted into approval merely because the present tables are small.

Migration 1 is therefore amended before admission: it now creates the two unique indexes
first, then attaches them with `ADD CONSTRAINT ... UNIQUE USING INDEX`. The composite-FK
semantics are unchanged; reads remain available during index construction and the
exclusive-lock interval is reduced to the metadata attachment. The migration-1 hash above
is the amended blob identity. The earlier A2 programme record retains the original hash as
historical provenance rather than being rewritten.

This amendment invalidates the first review and requires a fresh independent review,
fresh custody binding, and fresh target proof before any production mutation.

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
    shape or are recorded as findings requiring remediation.
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
