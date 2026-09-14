# S3 · O1 — PRODUCTION WITNESS

**Date:** 2026-09-14
**Candidate:** `637c115d10906aec90091d952710a7c00197dcf3`
**Act:** O1 · exact-three S3 schema-first production act
**Standing:** ✅ COMPLETE · production carries the three S3 migrations · the reader is the candidate

---

## 1. What this record is, and what it is not

This is the production witness for the O1 act. It is **not** an acceptance of anything
beyond that act. It records what was read, what was entailed, and — with equal care —
what was never seen.

⭐⭐ **Two evidence classes, kept apart.**

| class | meaning |
|---|---|
| **WITNESSED** | a literal line of output, or a durable artifact read directly from production |
| **ENTAILED** | a guard that provably precedes something that demonstrably happened, and that exits rather than continuing — established from source, not from outcome |

⛔ **Entailment is never promoted to witness.** A successful downstream act does not
entitle this record to backfill an unread line. That rule cost this lane a re-read and
two extra readings; it is the reason the record can be trusted.

---

## 2. The act

```text
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN
  && git fetch origin clean-main-no-secrets
  && WT=$(mktemp -d)
  && git worktree add --detach "$WT" 637c115d10906aec90091d952710a7c00197dcf3
  && PROJECT_DIR=$HOME/MAIA-SOVEREIGN "$WT/scripts/s3-schema-first-runbook.sh" 637c115d…
  ; RC=$?; git worktree remove --force "$WT" >/dev/null 2>&1; exit $RC'
```

Two roots, held apart deliberately:

```text
CODE / DEPLOYMENT STRUCTURE   temporary detached worktree @ 637c115d…
OPERATIONAL RUNTIME ROOT      /home/soullab/MAIA-SOVEREIGN
```

---

## 3. WITNESSED — the deploy-lane lock

⭐⭐ **This is the line DEPLOYMENT-SAFETY-02B exists to produce.** The runbook's own
transcript head was not recoverable, so it was read instead from the durable artifact the
act created. `acquire_deploy_lock()` writes its holder record *into* the lockfile, and on
a flock host nothing removes it — only the non-flock fallback traps `rm -f` on EXIT.

```text
-rw-rw-r-- 1 soullab soullab 249 2026-09-14 15:20:23.007212901 +0000
  /home/soullab/MAIA-SOVEREIGN/.deploy.lock

pid=2907670
started=2026-09-14T15:20:22Z
user=soullab@soullab
entry=s3-schema-first-runbook
target=637c115d10906aec90091d952710a7c00197dcf3
target_sha=637c115d1
checkout_head=2d7873c86 (shared checkout HEAD — informational, NOT the deploy target)
```

The record is self-identifying in three independent ways: its **path** is the production
runtime root, its **entry** names this runbook, and its **target** is the exact candidate.
The mtime sits one second after the recorded acquisition.

⭐ **`checkout_head=2d7873c86 ≠ target_sha=637c115d1` is the most valuable line in the
file.** The shared checkout was sitting somewhere else entirely, and the act deployed the
named candidate anyway. That is precisely the condition the immutable-SHA architecture was
built to survive, observed in production rather than argued for.

### Independent corroboration of the lane

```text
docker exec maia-sovereign printenv DEPLOY_LANE  →  deploy-lane
```

`DEPLOY_LANE_TOKEN` is exported **only** inside `acquire_deploy_lock()`, and the Dockerfile
refuses to build without it. A running container reporting `deploy-lane` proves the
candidate image was built through the lane machinery, not around it. It does not speak to
the lock's path — that is what the artifact above is for. The two together close both halves.

⚠️ `user=soullab@soullab` is the host's own `hostname`, not a contradiction of the
minisforum identity. It bears on nothing in this record.

---

## 4. WITNESSED — migration, swap, provenance, gate

```text
→ 20260913000001_ask_authorization_acts.sql                        applied
→ 20260913000002_disclosure_boundary_developmental_ask.sql         applied
→ 20260913000003_disclosure_gesture_authorize_sections.sql         applied

=== Applied 3 new migrations (529 were already applied, 480 total) ===
[RUNBOOK OK] Migrations applied — schema is ready for the candidate reader
[RUNBOOK OK] Running container reports the authorized candidate 637c115d1
[deploy-ctx:ok] GIT_COMMIT=637c115d1 (printenv) == 637c115d1 (Config.Env) == asserted 637c115d1
[RUNBOOK OK] Co-Lab release gate passed            33 passed · 0 failed · 0 warned
[RUNBOOK OK] Rollback custody proved — :previous is the pre-act reader;
                                       :current and :637c115d1 are the candidate
[RUNBOOK OK] S3 schema-first act complete for 637c115d1
```

**Exactly three, no more.** The `NOTICE: trigger … does not exist, skipping` lines are the
migrations' own `DROP TRIGGER IF EXISTS` idempotency, expected on first application.

---

## 5. ENTAILED — read from source ordering, ⛔ not witnessed

The transcript head was never recovered. These are established from the runbook's own
control flow (`scripts/s3-schema-first-runbook.sh` at `637c115d…`), where each guard
precedes something that demonstrably happened and returns rather than continuing.

| point | entailed by |
|---|---|
| `PROJECT_DIR` == the production root literal | `DEPLOY_LOCK_FILE` freezes at source time as `$PROJECT_DIR/.deploy.lock`; the root gate runs **before** any helper is sourced and exits 2 otherwise. The lockfile's path is therefore direct evidence of the value. |
| **two** runtime-root confirmations (re-exec survived) | `rb_pin_and_reexec` execs the pinned copy, and `rb_require_production_root` runs at file load — so it fires once per exec. ⚠️ The *count* was never observed. |
| runbook + four helpers hash-match | `rb_prove_self_provenance` precedes `acquire_deploy_lock`; the lock record exists. |
| pending set == the proved three | the act-scope guard precedes the build and returns 3 on mismatch; the build ran and three migrations applied. |
| build succeeded · image provenance verified | both precede the recovery pin, which precedes the migration that ran. |
| pre-act reader captured · recovery image pinned | `rb_establish_recovery_tag` precedes the migration that ran. |

⚠️ **Root custody surviving re-exec and candidate self-provenance are two different claims.**
Both are entailed here; neither was read. A future act should capture the full transcript
from the first line so this section can shrink.

---

## 6. Observations — ⛔ not defects of this act, ⛔ no lane opened

Routed to `docs/programme/S3-O1_PRODUCTION_OBSERVATIONS_2026-09-14.md`. None reopens the
completed act; none is repaired here.

1. The swap recreated **nine** containers, not one.
2. The ledger holds **529** rows against **480** migration files.
3. Each migration file's own `BEGIN`/`COMMIT` fights the runner's, leaving the trailing
   `DO` block outside any transaction.

---

## 7. Standing

```text
candidate                    637c115d10906aec90091d952710a7c00197dcf3

deploy-lock path             ✅ WITNESSED at the production runtime root
deploy-lane machinery        ✅ WITNESSED, independently
three S3 migrations          ✅ WITNESSED applied
reader swap                  ✅ WITNESSED
running provenance           ✅ WITNESSED 637c115d1, three ways
Co-Lab release gate          ✅ WITNESSED 33 / 0 / 0
rollback custody             ✅ WITNESSED proved

runtime root value           ✅ entailed from the lock artifact
re-exec root custody         ⚠️ ENTAILED, not witnessed
self-pin + four helpers      ⚠️ ENTAILED, not witnessed
exact-three scope guard      ⚠️ ENTAILED, not witnessed
build · image · recovery pin ⚠️ ENTAILED, not witnessed
```

**S3 PRODUCTION ✅ CLOSED · DEPLOYMENT-SAFETY-01 / 02 / 02A / 02B ✅ DISCHARGED IN PRODUCTION.**

⛔ The routed-out rollback-primitive lane stays closed. ⛔ The thread-store concurrency
lane stays closed. ⛔ No fifth deployment architecture lane.
