# S3 · O1 — PRODUCTION OBSERVATIONS (ROUTED OUT)

**Date:** 2026-09-14
**Source:** the O1 production act at `637c115d10906aec90091d952710a7c00197dcf3`
**Standing:** ⛔ **OBSERVATIONS, NOT DEFECTS OF THIS ACT. NO LANE OPENED. NOTHING REPAIRED.**

---

⭐ *The lane that finds a defect does not thereby own it.* Each of these was visible in the
O1 transcript and none of them is this act's to fix. Every one predates the act, would have
appeared on any deploy, and is recorded here so that noticing it is not mistaken for having
addressed it.

⛔ None reopens the completed act. ⛔ None is authorized for repair.

---

## O-1 · The swap recreates the whole stack, not the reader

The runbook's swap step is `deploy_ctx_compose up -d` with **no service argument**. In
production that recreated nine containers:

```text
maia-nostr-relay · maia-rlm · maia-summary-worker · maia-media-worker
maia-comms-worker · maia-api · demo-plaster · oldhead-plaster · maia-sovereign
```

All returned healthy and the act's provenance verification is unaffected. The finding is
one of **naming versus blast radius**: the step is described throughout the runbook and its
record as *"swap the reader"*, and what it does is recreate every service whose definition
or image changed.

⚠️ The consequence that matters is not this run — it is that a future failure in any of the
other eight would enter the post-swap recovery band for a reason having nothing to do with
the reader. The recovery act pins and restores **the reader's** image only.

⛔ Not repaired. Narrowing the swap is a deployment-architecture change, and the programme
is closed to those.

---

## O-2 · The ledger holds more rows than there are migration files

```text
=== Applied 3 new migrations (529 were already applied, 480 total) ===
```

Mechanically explained by `scripts/run-sql-migrations.sh`: `applied_before` counts **rows in
`schema_migrations`** and is measured **before** the apply loop, while `total` counts **files
on disk** in the deployed snapshot. The two are different populations, so the difference is
**not** `529 − 480`:

```text
  529   ledger filenames, pre-act
− 477   current files already represented  (480 on disk − 3 pending)
─────
   52   ledger filenames with no current migration file
```

⚠️ An earlier draft of this record said **49**, taking `529 − 480` and thereby assuming every
file on disk was already in the ledger — the exact assumption this observation exists to
question. The correct count is **52**.

The runner keys set-membership on filename, so absent files are simply never considered.
Nothing is at risk today. ⚠️ But the count printed as a reassurance (`X already applied,
Y total`) is comparing two different populations, and a reader can take `529 > 480` as a
sign of corruption when it is bookkeeping.

⭐ This is consistent with the 2026-09-14 shadow caveat (56 of 480 legacy migrations refused
on a fresh cluster) and with the unexplained 2026-01-23 rows found during the deployment
custody census. ⛔ **No provenance is claimed or manufactured for those 49 rows here.**

---

## O-3 · Schema change and ledger row are in two different sessions

The sharpest of the three, and the one closest to this programme's own subject matter.

```bash
psql … -v ON_ERROR_STOP=1 -c "BEGIN;" -f "$f" -c "COMMIT;" || { … exit 1; }

psql … -q -c "INSERT INTO schema_migrations (filename) VALUES ('$filename')
              ON CONFLICT (filename) DO NOTHING;"
```

Three distinct consequences, all visible in the O1 output:

**(a) The file's own `BEGIN`/`COMMIT` overrides the runner's.** Each S3 migration opens its
own transaction, so the runner's `BEGIN` warns *"there is already a transaction in
progress"*, the **file's** `COMMIT` is what actually commits, and the runner's trailing
`COMMIT` warns *"there is no transaction in progress"*.

⚠️ Anything after the file's `COMMIT` — here the `DO` block raising the applied notice — runs
**outside the runner's intended explicit migration transaction**, in its own autocommit
transaction. ⛔ Not *"outside any transaction"*: psql autocommits, so such a statement is
committed as its own transaction. The finding is the boundary, not the absence — **the file
can commit its DDL before every statement in it has completed under one atomic boundary.**

**(b) The ledger insert is a separate invocation.** It is a new psql session entirely. A
crash, a network loss, or a failure between the DDL commit and the ledger insert leaves the
**schema changed and unrecorded**. The next run re-applies the file. These three migrations
are written idempotently (`IF EXISTS` / `IF NOT EXISTS`), so it would survive; a
non-idempotent migration would not.

**(c) The ledger insert's failure semantics differ from the DDL's.** It carries no
`ON_ERROR_STOP` and no `||` handler, and `applied_now` is incremented regardless.

⚠️ Stated precisely: a **server-side SQL error** in the ledger `INSERT` is not protected by
`ON_ERROR_STOP`, so psql can finish normally rather than converting that error into the
script-failing exit status (`3`) the DDL invocation relies on. ⛔ This is narrower than *"a
failed ledger write is silent"* — fatal psql or connection errors are a different class and
can still terminate the shell. The asymmetry is the finding: **the two invocations that must
agree do not fail the same way.**

⚠️ Also noted, harmless: the failure-path `ROLLBACK` is issued in a **new** psql session.
The failed session has already ended and its transaction was rolled back by disconnect, so
that statement acts on nothing. It is misleading rather than wrong.

⭐⭐ **This is the same law this programme spent the week establishing, one layer down.** S3's
post-cognition tail was repaired precisely so that a persisted turn, its receipts and its
completion commit together or not at all. The migration runner records *that a schema
change happened* in a different transaction from the change itself. ⛔ **Naming that is not
authorization to fix it** — the runner serves every migration in the system, and a change to
it is a deployment-architecture act.

---

## Standing

```text
O-1  swap blast radius              OBSERVED · ROUTED OUT · not repaired
O-2  ledger rows vs files           OBSERVED · ROUTED OUT · not repaired
O-3  migration atomicity boundary   OBSERVED · ROUTED OUT · not repaired
```

⛔ No lane opened. ⛔ No fifth deployment architecture lane. ⛔ The routed-out rollback
primitive and thread-store concurrency findings stay closed.
