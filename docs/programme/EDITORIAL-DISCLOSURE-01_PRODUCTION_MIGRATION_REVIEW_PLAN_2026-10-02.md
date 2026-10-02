# EDITORIAL-DISCLOSURE-01 — Production Migration Review Plan

**Date:** 2026-10-02  
**Status:** BOUNDED INDEPENDENT REVIEW PLAN · NO DEPLOYMENT AUTHORITY BY ITSELF  
**Live old reader at plan freeze:** `d4655e647`  
**Candidate lineage before this plan:** canonical `4aebf0d87bee845f063f44c38864206a371c9314`, including #1732 merge `f43f0e7074545a787905017be79bcb51eb4e43e0`.

## Exact target relation

The deployment target is supplied externally by the Review-Custody harness and is never
self-identified by a commit SHA embedded in this document. The target must contain this
plan and the canonical editorial-disclosure repair lineage described above.

The reviewer must establish the exact target relation from immutable git bytes. Any
application, migration, deploy-script, disclosure-law, or governance movement after review
invalidates applicability and requires a new review.

## Exact production-pending set

Read-only production ledger comparison on minisforum found exactly one migration absent:

1. `database/migrations/20261002000001_disclosure_boundary_editorial_turn.sql`
   SHA-256 `08fc3447249e07249d48731bb2a2a8b8612965af82f58e3580fb52625767c0a9`

The deploy lane must independently rederive the pending set immediately before mutation.
Any addition, removal, byte movement, old-reader movement, or target movement refuses this review.
## Production shape evidence

Read-only production evidence captured 2026-10-02 from `maia-postgres`:

- `context_disclosure_receipts`: **3 rows · 80 kB total relation size**.
- Boundary distribution: **3/3** rows are
  `writers_studio.developmental_ask->maia_cognition`.
- Current CHECK admits exactly:
  - `writers_studio.focus->maia_cognition`
  - `writers_studio.developmental_ask->maia_cognition`
  - `writers_studio.review_discuss->maia_cognition`
- The production ledger does not contain the editorial-turn migration.
- The migration rewrites, backfills, and deletes **zero** receipt rows.
- The migration sets `SET LOCAL lock_timeout = '5s'` before DDL.

## Intended schema effect

The migration atomically drops and recreates
`context_disclosure_receipts_boundary_check` with the existing three values plus:

`writers_studio.editorial_turn->maia_cognition`

No column, row, index, trigger, retention rule, member identity, or receipt confirmation
semantics are changed by this migration. Existing rows already satisfy the expanded vocabulary.

## Deployment class and rollback relation

This is a **backward-compatible expansion** under PRODUCTION-DEPLOYMENT-CONTRACT-01.

The old reader must remain lawful after the expanded CHECK is installed. Reader rollback
must require **no database down-migration**. The rollback target remains the exact known-good
reader serving immediately before cutover, provided the review establishes compatibility.
## Required deployment ordering

Because one migration is pending, the zero-drift/quick reader lane is not lawful.

The governed path must preserve:

exact canonical target materialization → build/provenance → admitted migration review
and all-prefix compatibility → exact pending-set re-witness → exact old-reader re-witness
→ migration → candidate swap → running provenance/health → production observation.

A migration failure must leave the candidate reader unswapped and the old reader live.

## Independent review questions

The reviewer must independently establish or reject all of the following:

1. The old reader's existing receipt inserts remain valid after the CHECK is expanded.
2. The expanded CHECK cannot reject any row valid under the current three-value production law.
3. The migration performs no row rewrite/backfill/delete and does not alter receipt immutability.
4. `DROP CONSTRAINT IF EXISTS` + `ADD CONSTRAINT` occur in one transaction and a lock timeout
   aborts the migration rather than leaving a partial constraint state.
5. The 3-row / 80 kB production shape makes the bounded DDL lock risk acceptable, or any
   contrary finding is recorded.
6. The target editorial-turn route requires the new boundary and fails closed if the schema
   remains old; it must not silently mislabel the crossing as another existing boundary.
7. The target confirmation logic remains tied to observed dispatch/arrival rather than provider success.
8. The old reader remains fully compatible after the expansion, so rollback requires only reader swap.
9. The migration is safe to retry if execution aborts before ledger insertion.
10. Existing `focus`, `developmental_ask`, and `review_discuss` paths retain their current meanings.
11. No unrelated disclosure, retention, identity, or external-provider authority is widened.
A verdict of `REVISE` or `BLOCKED` is lawful and must never be converted into approval
to complete deployment.

## Minimum physical Reads

The separate-process reviewer must physically Read at least:

### Plan and migration
- `docs/programme/EDITORIAL-DISCLOSURE-01_PRODUCTION_MIGRATION_REVIEW_PLAN_2026-10-02.md`
- `MIGRATION_COMPATIBILITY_CONTEXT.json`
- `database/migrations/20261002000001_disclosure_boundary_editorial_turn.sql`

### Target reader
- `lib/disclosure/contextDisclosureReceipt.ts`
- `lib/disclosure/crossingConfirmation.ts`
- `app/api/writers-studio/editorial/turn/route.ts`
- `lib/ai/structured/types.ts`
- `lib/ai/structured/router.ts`
- `lib/ai/structured/anthropicStructuredAdapter.ts`
- `scripts/deploy-production.sh`
- `scripts/run-sql-migrations.sh`

### Old reader
- `old-reader/d4655e6477fa40b8f94c5f8f91be47198288d2af/lib/disclosure/contextDisclosureReceipt.ts`
- the exact old-reader Focus crossing caller located by Grep and then Read
- the exact old-reader developmental-Ask crossing caller located by Grep and then Read
- the exact old-reader review-discuss crossing caller, if present, located by Grep and then Read

Search tools may locate additional receipt writers, but search scope is not coverage.
Any old-reader path used to support compatibility must be physically Read.
## Required review output

The review must use the repository's `review-custody/v1`,
`migration-compatibility/v1`, and `migration-prefix-compatibility/v1` structures.

For this one-file migration, `failure_prefix_compatibility.prefixes` must contain exactly
one prefix through the editorial-turn migration and establish that the old reader remains
compatible if that migration commits while the candidate reader remains unswapped.

The review must name limitations explicitly. A zero-finding APPROVED verdict is lawful,
but is not evidence of completeness.

## Reviewer execution law

Run the reviewer as a **separate process** with its event stream captured.

Allowed read surface:
- Read
- Grep
- Glob
- StructuredOutput

Denied:
- Bash/shell
- Write/Edit
- mutation tools
- MCP tools

The reviewer's `coverage.files` is an attestation checked against the captured trace.
A Read event proves only that a file was opened, never that it was understood.

## Stop conditions

STOP before migration or deploy if any of these occurs:

- pending set differs from exactly the one migration above;
- old reader differs from the live reader reviewed;
- target or migration bytes differ;
- custody admission is not APPROVED;
- compatibility or prefix gate refuses;
- production constraint already differs from the observed three-value state unexpectedly;
- pre-deploy build/provenance/health gates refuse.

⛔ This plan authorizes no migration, deploy, traffic cutover, production write, or rollback by itself.
