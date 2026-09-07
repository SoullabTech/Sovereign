# I0.5 · RELEASE PREPARATION — STATE OF RECORD

**Date** 2026-09-08 · **Lane** `JARVIS-CIRCLES-01`
**Status** ⛔ **PREPARED, NOT VERIFIED, NOT MERGED, NOT DEPLOYED.**

```
canonical            e535e6246
production           e535e6246          ← production has caught up to canonical
release candidate    d58488db97176295f210fe672d7e5243a5e30589
  parents            e535e6246          current canonical
                     1725a0857          original verified I0.5 tip

RECONCILE        PASS
SCOPE            CLEAN / ISOLATED   (founder-asserted — see §2)
63/63 RERUN      BLOCKED BY TOOL SAFETY BOUNDARY
PR               NOT OPENED
MERGE            NOT DONE
DEPLOY           NOT DONE
PROD WITNESS     NOT DONE
```

> **No authority has been advanced on evidence we do not possess.** The candidate exists; the witness
> does not.

## 1 · Why the rerun stopped, and why that is correct

The connected-machine safety layer refused every operation needed to construct a production-derived
shadow: moving a production dump to the Mac · creating a disposable same-host Postgres shadow · later
schema/dump handling for an existing local witness database. **The safer variants were tried first;
production was not touched.**

⭐ **The gate was not weakened.** No other test was relabelled "63/63", and the refusals were not routed
around. The witness contract — read from the committed instrument itself — requires: **the committed
verifier · the three Circle migrations in order · all 63 required obligations discharged by PASS · zero
failed/warned/skipped · rolled-back fixtures · a disposable shadow.** Anything less is a weaker test
wearing the same number, which is exactly what FR-14 exists to prevent.

**Loose ends, recorded rather than tidied away:**

- One empty local database `maia_i05_shadow_d58488db` was created before the first schema-copy failed
  on a **PostgreSQL client-version mismatch**. **No schema and no candidate migration were applied to
  it.** Destructive cleanup was not attempted after the safety layer began refusing database
  operations. ⚠️ It is a stray empty artifact awaiting cleanup — not evidence of anything.
- ⚠️ **The client/server version mismatch is an operational blocker that will recur.** Until the client
  matches the production server major version, the shadow cannot be constructed by that route at all.

## 2 · ⚠️ Two findings from this session, stated as findings

### 2.1 The candidate is not on `origin`

`d58488db` is **not reachable from this clone after a full fetch**, and **no ref on `origin` points at
it**. It exists only on the machine that built it.

Consequences, both real:

- **It cannot be deployed by the SHA-named path.** `pre-deploy-gate.sh deploy-maia <SHA>` and
  `deploy-production.sh deploy <SHA>` both `git fetch origin` and then materialize a **named commit**.
  An unpushed SHA is not materializable.
- **It is not preserved.** A verified-but-unpushed candidate can be lost to a disk, a checkout, or a
  branch switch — and would then have to be rebuilt and re-verified from scratch.

⭐ **Pushing it costs nothing and advances no authority.** A pushed commit is not a merge and not a
deploy. Recommended as the next act, before the witness.

### 2.2 The scope claim is founder-asserted, not verified here

The candidate is reported to contain the original I0.5 history and **not** the later Salon/interior
doctrine (`SALON_DESIGN_THREAD_v0.1.md`, `CIRCLE_INTERIOR_FUNCTION_MODEL_v0.1.md`).

⛔ **This session could not verify that**, because the object is absent from this clone — a file-presence
probe against an unreachable commit returns "absent" for **everything**, including files that are
certainly in it. **That is not evidence of clean scope; it is evidence of nothing.** Recorded as
founder-asserted, verifiable the moment the candidate is pushed.

## 3 · The lane branch and the candidate have diverged — deliberately

| | |
|---|---|
| `claude/jarvis-circles-programme-reouzc` (head `3fd03ff9e`) | the **doctrine record** — FR-19…FR-35, both design records, the journeys, D-K3. Also carries its own reconcile merge of canonical. |
| `d58488db` | the **release candidate** — I0.5 only. |

⛔ **The lane branch is NOT the release path.** Its earlier reconcile merge was correct at the time and
is now superseded for release purposes; it remains the record. **Do not deploy the lane branch.**

## 4 · Remaining sequence — all founder acts

1. **push** `d58488db` (preserves it; makes it deployable; makes §2.2 verifiable) — advances no authority
2. **rerun** the 63-obligation witness against it on a disposable shadow — blocked on the client-version mismatch
3. **open PR · merge**
4. **deploy**, then a **production witness bound to the actual deployed SHA**
5. **clean up** the stray empty `maia_i05_shadow_d58488db`

⛔ No doctrine folded in. ⛔ Steps 2–5 need a connected machine; this session has neither `DATABASE_URL`
nor `node_modules`.
