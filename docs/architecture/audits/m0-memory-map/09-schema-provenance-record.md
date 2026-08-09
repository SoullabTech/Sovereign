# Schema Provenance Record — `agent_runs`, `integration_passes`, `memory_transition_records`

**Date**: 2026-08-09 · **M0 closure act** per founder ruling §4 (`docs/governance/FOUNDER_RULING_MEMORY_REHABILITATION_M0_2026-08-09.md`)
**Method**: read-only `pg_dump --schema-only` from production (`maia-postgres` on minisforum) + git verification against the deployed SHA.
**Founder constraint honored**: this record states what production contains; it does **not** manufacture a migration pretending it created production.

## What production contains

`09-production-schema-recovered.sql` (341 lines, in this directory) is the live DDL for all three tables as dumped 2026-08-09 from `maia_consciousness`, deployed container `GIT_COMMIT=b1399f693`.

## Correction of the M0 finding

The M0 map (§6.1, §12.5) reported *"`agent_runs`/`integration_passes` have no CREATE TABLE anywhere in the repo — schema provenance unrecoverable from source."* **That finding was a measurement artifact, not a real provenance gap.**

- The M0 static lanes ran on the local working tree (branch `feature/labtools-redesign`), which diverged from the deployed lineage on **2026-08-01** (merge-base `7c9dd5192`) and is ~**398 commits behind** `origin/clean-main-no-secrets`.
- On the deployed SHA `b1399f693`, the DDL exists in source:
  - `agent_runs`: `database/migrations/20260405100001_agent_runs.sql` (+ `20260122000002_fix_agent_runs_schema.sql`, `20260123_agent_runs_session_id.sql`, `20260112000010_add_origin_route_and_processing_profile.sql`, `20260405100002_agent_run_events.sql`)
  - `integration_passes`: `database/migrations/20260718000001_s5_provenance_substrate.sql` (+ `20260112000010`)
  - `memory_transition_records`: `database/migrations/20260804000001_memory_transition_records.sql`, writer `lib/maia/memoryTransitionRecord.ts`, wired into the live route `app/api/sovereign/app/maia/list`.

**The real defect is measurement-checkout provenance**: the audit did not record (or notice) which checkout produced its static claims. This is a concrete instance of founder ruling §6 (membership provenance) and §8 (provenance statement on every claim): *measurement without checkout provenance*.

## Standing consequence for M1+

Every static claim in an M-stage instrument must name the tree it was verified on — `[deployed <sha>]`, `[local-only <branch>]`, or `[both]`. Claims of absence ("no caller", "no CREATE TABLE", "no consent gate") are only valid against the deployed lineage.

## Findings that survived deployed-tree re-verification (2026-08-09)

- `delete-my-memory` functional voidness: **HOLDS** — the route's 5 target tables have no CREATE TABLE on `b1399f693` either.
- Addenda divergence §II.B closure: **HOLDS** on both trees (`appendAllContextAddenda` in deployed `maiaVoice.ts`).
- Anchors loader wired only to the retired oracle route: **HOLDS** on deployed.
- Spiral-state write severance: **HOLDS behaviorally** (no production write since 2026-04-08); deployed tree has additional static callers (`fieldMonitorTelemetry.ts`, `innerGuideFieldPersistence.ts`, `manifestationCorpus.ts`) beyond the dead oracle route — these are either themselves unreachable or not firing; attribution belongs to the R-M1a/RECONNECT investigation, not this record.
- `conversational_recall_enabled` consumers on deployed: recall-preferences route, dead oracle route, `MemoryConsentSection.tsx`, migrations — **not** the live list route or `maiaService.ts` by that identifier; how the live Phase 2 addendum gate consults the preference on `b1399f693` is delegated to the R-M1a instrument.
