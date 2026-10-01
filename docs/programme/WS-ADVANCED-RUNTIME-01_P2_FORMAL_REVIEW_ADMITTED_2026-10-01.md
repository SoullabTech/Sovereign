# WS-ADVANCED-RUNTIME-01 / P2 — Formal Migration Review ADMITTED · Gate APPLIES

**Date:** 2026-10-01
**Status:** REVIEW ADMITTED · COMPOSED GATE APPLIES (local, exact git objects) · ⛔ NOT DEPLOYED · ⛔ NO MIGRATION APPLIED
**Target (RC1):** `03f0fd3abce16fcc1132481836b2e6ff8d364cd7` (`feature/ws-advanced-runtime-rc1-20261001`, unchanged by this act)
**Old reader:** `975a208b8c39f99e9b47208ce5139bbec94bd8ac`
**Plan:** `docs/programme/WS-ADVANCED-RUNTIME-01_P2_EXACT_THREE_MIGRATION_REVIEW_PLAN_2026-10-01.md` @ sha256 `62b0de90…8a11`
**Evidence:** `docs/programme/evidence/WS-ADVANCED-RUNTIME-01-RC1-REVIEW/`

## What happened

The prior session stopped because QWEN/OpenCode traces are not an admitted reviewer-host
format. This session ran the reviewer on the admitted host: a **separate `claude -p` process**,
`stream-json`, explicit session id, tools restricted to `Read · Grep · Glob` (+ the
`StructuredOutput` formatter), ⛔ no Bash, ⛔ no Write/Edit. The custody record was bound fresh
at the exact RC1 SHA from a clean worktree (manifest 0 paths). The review bundle was rebuilt
from git bytes with the frozen `scripts/migration-compatibility-review-bundle.sh`.

The old-reader file SHA-256 values were given to the reviewer as identifiers. A shell-less
reviewer cannot hash files, and the gate recomputes every value from git, so a wrong value
would be refused, never trusted.

## Result

| Boundary | Result |
|---|---|
| `witness` | COVERAGE WITNESSED — 22 files carry a Read event; 6 search scopes witness nothing |
| `admit` | ADMITTED — **APPROVED** · high 0 · medium 0 · low 3 · 8 limitations · review sha `6d1331f5…` |
| `check` | APPROVAL APPLIES — manifest unchanged |
| `review-custody-migration-gate` | **`MIGRATION REVIEW + COMPATIBILITY + PREFIX GATE APPLIES`** — 3 pending, all witnessed · 3 prefixes attested compatible |

Reviewer: Claude Sonnet 5.5, independent migration reviewer · trace id `fecc0b9f-6552-4ed5-bc5b-607dc1336d40`.

## Low findings (non-blocking by law; carried to the act)

- **F1 — DDL locks.** `UNIQUE (id, member_id)` and the `proposal_chains` column add take ACCESS EXCLUSIVE with no `lock_timeout`. **Operator check before the act:** confirm no long-running transaction is open on `living_works`, `member_manuscripts`, `proposal_chains`.
- **F2 — migration 2 not idempotent after a ledger-insert failure.** If the runner's separate ledger INSERT fails after migration 2 commits, a rerun fails on `RENAME COLUMN`. The deploy aborts pre-swap at prefix 2, which is old-reader compatible. Remedy: insert the missing `schema_migrations` row by hand. Same runner defect as S3-O1 observation (3).
- **F3 — `SELECT *` + non-null assertion** in `relationshipCustody.ts` mapEpisode. Unreachable under the gated ordering. Optional hardening.

## Limitations the reviewer stated (not converted into findings)

These include: no live DB, so lock cost was assessed from statement type only. Only the eight plan-listed old-reader files were read. PK status of `living_works.id` / `member_manuscripts.id` was located by Grep, not Read. The bundle carries no git history; the gate closes that by recomputing from git objects. The review applies to `deploy`/`update` ordering, ⛔ not `migrate`-only.

## The act (founder, from the Mac Studio — this container has no route to minisforum)

Deploy recomputes the pending set and re-witnesses the old reader itself. It refuses if production moved off `975a208b8` or if the pending set is not exactly these three.

```bash
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN \
  && git fetch origin feature/ws-advanced-runtime-rc1-20261001 claude/wonderful-newton-ddw3gx \
  && E=docs/programme/evidence/WS-ADVANCED-RUNTIME-01-RC1-REVIEW B=origin/claude/wonderful-newton-ddw3gx \
  && mkdir -p ~/ws-rc1-review \
  && for f in CUSTODY_RECORD.json REVIEW.json REVIEWER_TRACE.jsonl; do git show "$B:$E/$f" > ~/ws-rc1-review/$f; done \
  && sha256sum ~/ws-rc1-review/REVIEW.json \
  && REVIEW_CUSTODY_RECORD=~/ws-rc1-review/CUSTODY_RECORD.json \
     REVIEW_CUSTODY_REVIEW=~/ws-rc1-review/REVIEW.json \
     REVIEW_CUSTODY_TRACE=~/ws-rc1-review/REVIEWER_TRACE.jsonl \
     scripts/deploy-production.sh deploy 03f0fd3abce16fcc1132481836b2e6ff8d364cd7'
```

`REVIEW.json` must hash to `6d1331f570aad99bb0bc5881e4680ee32019efacafec462cefceadc8515ca645`.
After the act: `printenv GIT_COMMIT` = `03f0fd3ab`, `/api/health` fresh, three `schema_migrations` rows present, Co-Lab gate `0 failed`. Then the cohort walk.

⛔ Custody proves the review is bound and still applies. It never proves the migrations are correct.
