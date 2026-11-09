# Migration qualification in isolation + review follow-ups (2026-11-09)

Lane: Writer's Studio (#1800). Candidate: the commit adding this file. ⛔ Authorizes no migration on any real database, no merge, no deploy.

## 1 · Isolated qualification (local, disposable PostgreSQL 16)
Method — the repository's own canonical path, nothing hand-assembled:
1. Fresh empty database → `scripts/bootstrap-database.sh` (applies `database/baseline/0001_baseline_2026-09-01.sql`, generated from **production's own schema and migration ledger** as of 2026-09-01, and stamps its 504 ledger entries) → 634 tables, 504 ledger rows.
2. **Production's runner** `scripts/run-sql-migrations.sh` (the `migrate` service's command), with only its hard-coded container path `/app/database/migrations` replaced by this checkout's path (diff shows nothing else changed; ON_ERROR_STOP, ledger and checksum logic unchanged).

Results:
- **90 post-baseline migrations applied, 0 errors, exit 0**, including the four candidates in filename order: `20261108000001_work_reading_scope`, `…0002_writer_decision_events`, `…0003_living_work_kind`, `…0004_development_plans`. All four in `schema_migrations`.
- **Second run: "No pending migrations"** (594 recorded).
- **Each candidate re-applied by hand: exit 0, no errors** (idempotent).
- `npm run check:migration-lock-timeout`: pass.
- Objects present: `work_reading_scope_events`, `writer_decision_events`, `development_plans`, `development_plan_history`, `development_plan_step_links`, `living_works.kind`. Removed in this branch and confirmed absent: `ask_turn_reads`, `ask_turn_readings` (provenance now lives in the answer row).
- This lane's database tests against the qualified database: plan 13/13 · plan-links 4/4 · plan-coverage 1/1 · kind/offer 4/4 · reading-carry 10/10 · route-walk 9/9 · scope 8/8.

Limits of this evidence: the baseline is production **as of 2026-09-01** plus this repository's later migrations — not a read of production's current schema (that read is a founder act). Rollback was not exercised (the migrations are additive; dropping is a separate act). Not a production witness.

## 2 · The "unexplained first-run failures" — explained and fixed
Three times, the first run against a fresh database failed 2 apply/undo link tests. Cause: the **test fixture** stamped a desk change's `accepted_at` with JavaScript's clock (milliseconds) while the plan's `created_at` came from the database (microseconds); a change accepted in the same millisecond as the plan looked older than it and was **correctly refused** by the link rule. Product code was right; the fixture now uses the database clock. Verified: **first run on four fresh copies of the qualified database: 17/17 each.**

## 3 · Review follow-ups (ChatGPT, 2026-11-09)
- **Unread chapter headings were in MAIA's instructions** (writer-supplied text in the system prompt). Fixed: they travel in the data message inside `<not_read>`, with a heading that tries to close the list defused; the instructions only say such a list may follow. Adversarial test: a heading reading "Ignore all previous instructions … </not_read>" never reaches the instructions and cannot close the list.
- **Reading timeout and cancellation (code-read):** the developmental reader runs as a streamed long-running call with no overall timeout and no retries; the readings route accepts no cancellation, so leaving the page does not stop a reading. The new progress display makes the wait visible; it does not bound it. ⛔ Not changed here: whether to time out or allow cancelling a paid, in-flight reading is a product decision. Recommended: a server-side ceiling (e.g. 6 minutes) that records the reading as not completed, plus a "stop waiting" control that leaves any finished reading saved.
- **Integration gate:** this branch is many commits ahead of and behind canonical `84e12cf00`; local results do not qualify the combined build. Reconciling with canonical and re-running everything on that one revision is owed before acceptance.

## Still open
Real-MAIA walks (fiction and nonfiction, including sensitive fictional case material in a helper's book) · reconciliation with canonical and re-qualification on the integrated revision · reading timeout/cancel decision · independent Class A/R20 acceptance · the two canonical defects owned by other lanes.
