# WS-ADVANCED-RUNTIME-01 / P3 — Formal Migration Review Result

**Date:** 2026-10-01
**Status:** ⭐ REVIEW RUN · ADMITTED · **VERDICT REVISE** · `check` REFUSES `[NOT_APPROVED]`
**Target:** `feature/ws-advanced-runtime-rc1-20261001` @ `03f0fd3abce16fcc1132481836b2e6ff8d364cd7`
**Old reader:** `975a208b8c39f99e9b47208ce5139bbec94bd8ac`
**Plan:** `docs/programme/WS-ADVANCED-RUNTIME-01_P2_EXACT_THREE_MIGRATION_REVIEW_PLAN_2026-10-01.md` (sha256 `62b0de90…8a11`)
**Evidence:** `docs/programme/evidence/WS-ADVANCED-RUNTIME-01-P3/` (record · review · raw trace · prompt · schema)

⛔ No migration applied · ⛔ no deploy · production untouched.

## How it ran

- The bundle was rebuilt from git with `scripts/migration-compatibility-review-bundle.sh` and checked with `verify-migration-compatibility-bundle.sh`, which **PASS**. The bundle is deterministic from immutable git objects, so it is byte-equivalent to the bundle on the founder host.
- The three migration SHA-256 values match the frozen plan exactly.
- A **fresh** custody record was bound in a clean detached worktree at the target SHA. The manifest has 0 paths. The founder-host record from the earlier session was not available in this container and was not reused.
- The reviewer ran as a **separate `claude -p` process** (Claude Code 2.1.286) with `stream-json`, an explicit session id `402fe5ae-628e-4642-8836-bbfa5a86e2ce`, and cwd at the bundle root.
  - The harness `init` record shows its tool surface as exactly `Glob · Grep · Read · StructuredOutput`.
  - It had **no MCP servers**, no shell and no write tool.
- The prompt was neutral. It stated that APPROVED, REVISE and BLOCKED are all lawful.
  - It supplied the target and old-reader SHA-256 values, which the harness computed because a read-only reviewer cannot hash files.
  - These values are not trusted: the production gate recomputes them from git.

## Custody chain

```text
witness  COVERAGE WITNESSED — 22 attested files carry a Read event · 12 search scopes (witness nothing)
admit    ADMITTED — verdict REVISE · high 0 · medium 2 · low 3 · 8 limitations · review sha da78e3f8…
check    REFUSED [NOT_APPROVED] — recorded verdict is REVISE
```

⚠️ **One instrument note.** The first `admit` was refused with `UNVERIFIED_REVIEW_COVERAGE` because the CLI resolves paths against the process cwd (the repo checkout), while the trace's reads sit under the bundle root. The second run passed the existing `--repo-root` flag set to the **trace's own harness `cwd`**. That is the same normalization root the Step 3 migration gate already uses.
- No law was changed.
- No coverage was credited without a Read event.

## Verdict

**Compatibility verdicts:** `COMPATIBLE` (migration compatibility) · `ALL_PREFIXES_COMPATIBLE` (failure-prefix compatibility).

**Outcome:** REVISE. The reviewer established Q1–Q7 and Q9, including old-reader compatibility after prefixes 1, 1+2 and 1+2+3, and reader-only rollback. It returns REVISE because of two gaps, not because of any incompatibility with the old reader.

| Id | Sev | Finding | Fix offered |
|---|---|---|---|
| F1 | medium | **Q10 is unestablished.** The bundle has no production row counts or sizes for `living_works`, `member_manuscripts` and `proposal_chains`. Migration 1 adds `UNIQUE (id, member_id)` under ACCESS EXCLUSIVE while the old reader is live. | Read-only production sizes, plus a stated lock budget, then a re-review |
| F2 | medium | **No lock timeout.** Neither the runner nor the migrations set `lock_timeout`, so DDL queued behind a long old-reader transaction stalls every query on hot tables. | `SET LOCAL lock_timeout` in the migrations (new blobs mean a new review), a bounded runner timeout, or a proven quiet window |
| F3 | low | **Migration 2 cannot be re-run after commit.** If the ledger INSERT fails after commit, a retry hits `RENAME COLUMN` on a column that no longer exists. | Guard the renames with an existence check, or add a ledger-repair runbook step |
| F4 | low | **Target reader breaks without migration 2.** The target reader breaks every proposal-chain operation against a pre-migration-2 database. Only the full deploy path orders migration-before-swap; `deploy-maia` and bare recreation do not. | Runbook statement, plus a re-review covering routes and `contract.ts` (Q8) |
| F5 | low | **Unindexed cascade FKs.** The return tables have FK columns with cascade and no index. | Optional later index |

Q8 (target reader fails closed on absent schema) is only **partly established**: the routes and `contract.ts` were not read.

## Next lawful act (founder rulings owed)

The REVISE is not converted. Reaching APPROVED requires an **RC2** with new blobs, a new bind, and a fresh reviewer session. The proposed sequence is:

1. Collect the F1 evidence: read-only row counts and `pg_total_relation_size` for the three tables on minisforum.
2. Remediate F2.
   - **Recommended:** `SET LOCAL lock_timeout = '5s'` at the top of each migration.
   - A timeout aborts before the swap with the old reader intact, which the prefix analysis already tolerates.
   - Production holds 0/3 of these migrations, so changing the blobs strands nothing.
3. Remediate F3 by guarding migration 2's renames with an `information_schema` existence check.
4. Remediate F4 with a runbook line: the target image must only be deployed through `deploy-production.sh deploy`, never `deploy-maia`, while migration 2 is pending.
   - Widen the plan's minimum Reads to the A2 routes and `contract.ts` to close Q8.
5. Re-freeze the plan, rebind, and run a fresh separate-process review.
