# Gate 1 Migration Review — production-state transition analysis

**Date:** 2026-08-09 · **Status:** READ-ONLY REVIEW (founder-required pre-merge instrument)
**Migration:** `database/migrations/20260809000001_gate1_persistent_corrigibility.sql` (branch `feature/gate1-persistent-corrigibility`)
**Production facts verified live:** PostgreSQL **16.13** · `conversation_turns` **39,555 rows** · `interpretive_ledger` **0 rows** · `ledger_member_annotations` **0 rows** (minisforum, 2026-08-09).

---

## 1. Exact DDL inventory

**New table** `member_corrections`: `id UUID PK` · `member_id TEXT NOT NULL` · `session_id TEXT` · `verbatim_text TEXT NOT NULL CHECK(non-empty)` · `correction_type TEXT CHECK(4 values)` · `matched_phrase TEXT` · `detection_confidence NUMERIC(4,3) CHECK(0..1)` · `detector_version TEXT` · `superseded_turn_id UUID FK→conversation_turns(id)` · `reverses_correction_id UUID FK→member_corrections(id)` · `created_at TIMESTAMPTZ`. Two indexes (member+created_at; partial on superseded_turn_id).

**`conversation_turns`** (the 39,555-row live table): `+recall_eligibility TEXT NOT NULL DEFAULT 'eligible'` · `+superseded_by_correction_id UUID FK→member_corrections(id)` · CHECK `turns_recall_eligibility_valid` · CHECK `turns_supersession_coherent` · partial index `idx_conversation_turns_recall_eligible (user_id, created_at DESC) WHERE recall_eligibility='eligible'`.

**`interpretive_ledger`** (0 rows): `+authority_source TEXT` · `+authority_granted_at TIMESTAMPTZ` · `+superseded_by_correction_id UUID FK` · CHECK `ledger_authority_source_valid` · CHECK `ledger_authority_requires_member_act`.

**Enum** `cogos_annotation_type`: `+'confirm'`, `+'qualify'` (guarded DO blocks, idempotent).

## 2. Existing-row validity

Every existing row remains semantically valid. Turns receive `'eligible'` + `NULL` → both CHECKs satisfied by construction. On PG ≥ 11, `ADD COLUMN ... DEFAULT <constant> NOT NULL` is **metadata-only — no table rewrite** of the 39,555 rows. The ledger constraints validate against 0 rows. FKs are new-column-only (no existing values to validate).

## 3. Default behavior for existing turns

All historical turns default **eligible** — exactly the pre-migration recall behavior. Per the founder ruling's production-data section: no retroactive inference; the test suite pins that the migration contains no `UPDATE conversation_turns`, no `DELETE FROM`, no `DROP TABLE`.

## 4. Data rewritten

**None.** The migration is purely additive (columns, one table, constraints, indexes, enum values).

## 5. Lock/transaction characteristics

The runner (`scripts/run-sql-migrations.sh:79`) executes each file as **one transaction in one psql session** (`BEGIN; -f file; COMMIT;`), with `ON_ERROR_STOP` → failure rolls the whole file back; the filename is only recorded on success.

- `ALTER TABLE conversation_turns` takes **ACCESS EXCLUSIVE** briefly: ADD COLUMN (metadata-only, instant) + 2 CHECK validations (full scan of 39.5k rows — milliseconds) held in the same lock window.
- `CREATE INDEX` (non-concurrent) blocks writes during build: sub-second at this row count.
- `interpretive_ledger` ops: instant (0 rows).
- `ALTER TYPE ... ADD VALUE` inside a transaction: **legal on PG ≥ 12** (we are on 16.13); the new values are not used within the same transaction, so the PG restriction does not bite. The DO-block guards make re-runs no-ops.

## 6. Expected duration and production impact

**Well under ~2 seconds total.** During the ACCESS EXCLUSIVE window on `conversation_turns`, concurrent turn INSERTs (live conversations persisting) **queue briefly — they do not fail**. No read outage: reads queue behind the same lock for milliseconds.

## 7. Rollback feasibility after commit

**Reversible.** Down-path: drop the two turns columns (constraints/index cascade), drop the three ledger columns, drop `member_corrections`. Enum values cannot be removed (PG limitation) — harmless orphans. Nothing about the up-migration destroys data; a rollback executed after members have made corrections would discard those correction records (documented, acceptable pre-adoption). **Critically, rollback of the APPLICATION does not require rolling back the SCHEMA** — see §9: old code runs correctly against the new schema, so `deploy-production.sh rollback` (image-level) is sufficient in almost every failure scenario, and schema rollback should essentially never be needed.

## 8. Deploy ordering (verified in `scripts/deploy-production.sh`)

**The full deploy path swaps containers FIRST (`up -d`, :454), verifies provenance, THEN runs migrations (:470).** So `deploy <SHA>` produces a window (~15–60s: health wait + provenance verify + migration runtime) in which **new code runs against the old schema**.

## 9. Incompatibility-window analysis (both directions)

**NEW code + OLD schema (the actual `deploy` window):** the new recall SQL references `recall_eligibility`, which does not yet exist → those queries error. Verified error containment at every live call site:
- `maiaService` FAST `:714` (try/catch), CORE `:1429` (`.catch`), DEEP `:1881` (try/catch) → degrade to empty recall;
- `loadPriorCrossSessionExchanges` catches → `[]`;
- `MemoryBundle` catches → empty bucket;
- `correctionPersistence` catches → `write_error`, contained.
Net member impact: **a recall blackout for the window's duration — conversations continue, turns persist (INSERT path untouched), no 500s on the live route.** The one unguarded caller (`sessionManager.getUserConversationHistory`) is reachable only from the near-zero-traffic `/api/between/chat` route.

**OLD code + NEW schema (rollback scenario, or the pre-migrate strategy below):** fully compatible — old code never references the new columns; its INSERTs receive the `'eligible'` default. Two theoretical exceptions, both currently unreachable: old `promoteToLedger` writes weight 0.70 with no authority (would violate the new CHECK) — **zero live callers** (COGOS promotion is unwired on trunk); old `markAccepted` raises weight on an authority-NULL entry — requires an existing ledger entry, and the table has **0 rows** with no live writer. Residual documented edge: after members have used `confirm` post-deploy, an image rollback plus a `resonates` annotation on a weight-carrying entry behaves per old semantics (no CHECK violation — authority rows satisfy the second CHECK branch).

## 10. Recommendation (eliminates the window entirely)

**Two-phase: migrate first, then deploy.**

1. **Pre-apply the migration** while old code is running (old code + new schema = compatible, §9). The runner is idempotent and records by filename, so the deploy's own migrate pass becomes a no-op. Mechanism: fetch the merged trunk tip on minisforum and run `./scripts/deploy-production.sh migrate` — the standalone `migrate` command does not swap containers.
2. **Then run the full deploy** `deploy-production.sh deploy <SHA>` as normal. The swap happens against a schema that is already correct; the recall-blackout window never occurs.

If instead the standard single-shot `deploy <SHA>` is used, the impact is bounded and graceful (§9), but the two-phase path is strictly better and uses only existing tooling.

## Verdict

**CLEARS the transition boundary**, with the two-phase sequencing recommended. No destructive SQL, no data rewrite, no table rewrite, sub-second locks at current row counts, both compatibility directions analyzed with all live call sites verified, and application-level rollback does not require schema rollback.
