# MAIA-WISDOM-CONSENT-01 · ACT 2 — Production Witness

**Status: DEPLOYED · ⭐ DECISIVE FALSIFIER PASSED · ⛔ ACT 2 NOT CLOSED — TWO PROBES OUTSTANDING.**
**Date:** 2026-09-15 · Deploy run by founder from the Mac Studio.

---

## 1. Deployed lineage — ⭐ VERIFIED THREE WAYS

```
[deploy-ctx] DEPLOY TARGET (immutable): 8cb640644  (8cb6406445efb46f6ba884a3775ec6e82cc9e9c7)
[deploy-ctx:ok] Built image provenance verified:   maia-sovereign:prod GIT_COMMIT=8cb640644 == asserted 8cb640644
[deploy-ctx:ok] Running container provenance verified:
                GIT_COMMIT=8cb640644 (printenv) == 8cb640644 (Config.Env) == asserted 8cb640644
$ ssh soullab@minisforum 'docker exec maia-sovereign printenv GIT_COMMIT'
8cb640644
```

⚠️ **`8cb640644` vs the expected `8cb64064` is NOT a mismatch** — it is the repository's own
9-character short-SHA. Verified here: `git rev-parse 8cb640644` →
`8cb6406445efb46f6ba884a3775ec6e82cc9e9c7`, identical to `origin/clean-main-no-secrets`.
⭐ **Same commit. The accepted candidate lineage is what is running.** Recorded explicitly so
the length difference is never read later as a provenance discrepancy.

**Gates on the way through:** disk 387 GB free (floor 60) · ⭐ **Co-Lab boundaries
`33 passed · 0 failed · 0 warned`** (floor 31) · deploy-lane lock acquired · immutable
`git archive` snapshot · rollback tags refreshed (`:previous` preserved).

## 2. ⭐⭐ The decisive falsifier — PASSED

```
$ curl -s -o /dev/null -w '%{http_code}\n' -X POST https://soullab.life/api/ain/collective/breakthrough \
    -H 'content-type: application/json' --data '{}'
401
```

**Before containment: `400`. After: `401`.**

⭐ **Custody now answers before route logic does.** The unauthenticated request no longer
reaches the handler's body validator — it is refused at the middleware by the access-matrix
rule, exactly as the 30-test suite asserted. ⛔ Nothing was contributed: `{}` carries no
`userId` and no `text`, and the request never reached the handler that would have read them.

## 3. ⛔ Outstanding — ACT 2 does not close on one probe

| Closing condition | State |
|---|---|
| deployed SHA identified | ⭐ **`8cb640644`**, verified in image + container + printenv |
| candidate lineage preserved | ⭐ identical to `origin/clean-main-no-secrets` |
| breakthrough anonymous probe → 401 | ⭐ **401** |
| **control anonymous probe → 401** | ⛔ **NOT RUN** |
| **knowledge anonymous probe → 401** | ⛔ **NOT RUN** |
| no contribution/action submitted | ⭐ `{}` only; no action verb, no query |
| `ACCESS_CONTROL_MODE` unchanged | ⭐ 0 occurrences in the diff |
| Seam 2 unchanged | ⭐ asserted in suite; no file touched |
| Sanctuary invariant unchanged | ⭐ no file touched |

⛔ **Two probes remain.** They matter independently: `control` exposes `shutdown` and
`emergency_stabilization`, and `knowledge` performs corpus retrieval over material whose
rights standing is unestablished (R4). **The breakthrough result predicts them — a prefix
rule captures all seven routes — but prediction is not witness**, and this lane's whole
record is built on refusing that substitution.

```bash
curl -s -o /dev/null -w '%{http_code}\n' -X POST https://soullab.life/api/ain/control \
  -H 'content-type: application/json' --data '{}'          # REQUIRED: 401

curl -s -o /dev/null -w '%{http_code}\n' 'https://soullab.life/api/ain/knowledge'   # REQUIRED: 401
```

⛔ No action verb is submitted to `control`; `{}` is sent so its own `!body.action` guard
would have answered had it still been reachable. ⛔ No query is submitted to `knowledge`.

## 4. Deploy-log observations — ⛔ none blocking, all recorded

- ⚠️ `[deploy-tag] WARNING: failed to remove maia-sovereign:staging (in use by a container?)` —
  stale rollback-tag prune, ⛔ unrelated to this change.
- ⚠️ Build verifier: *"Potential sovereignty concern: External AI dependencies found: openai"* —
  the **pre-existing 53-file allowlist** under `PROVIDER_GOVERNANCE.md`, non-blocking by design.
  ⛔ Not introduced here.
- ⚠️ `[POSTGRES] Query error: connect ECONNREFUSED 127.0.0.1:5432` during static generation of
  `/api/ain/telemetry` — **build-time prerender with no database**, ⛔ not a runtime failure;
  the build completed and all 801 pages generated.
- ⚠️ `Mismatching @next/swc version 15.5.7 while Next.js is on 15.5.11` — pre-existing.

⭐ None of these changed with this deploy, and none is evidence about containment either way.

## 5. Standing

**DEPLOYED `8cb640644` · LINEAGE PRESERVED · ⭐ BREAKTHROUGH CONTAINED (400 → 401) ·
⛔ `control` AND `knowledge` PROBES OUTSTANDING · ⛔ ACT 2 NOT CLOSED · ⛔ LANE OPEN ·
⛔ SEAM 2 UNRESOLVED — R15 STILL FALSE THERE · ⛔ IDENTITY BINDING STILL OWED BEFORE ANY
WIDENING BEYOND ADMIN · ⛔ ACT 3 UNOPENED.**

> *The door answered. Two more doors on the same corridor have not been knocked on yet.*
