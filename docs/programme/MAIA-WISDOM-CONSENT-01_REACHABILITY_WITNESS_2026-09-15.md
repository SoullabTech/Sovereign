# MAIA-WISDOM-CONSENT-01 · REACHABILITY WITNESS — ⚠️ CONFIRMED

**Status: FALSIFIER SPENT · RESULT POSITIVE · ⛔ NOTHING REPAIRED · CONTAINMENT NOT AUTHORIZED.**
**Date:** 2026-09-15 · **Run by:** founder, from Kelly's Mac Studio.

---

## 1. The witness

```
$ ssh soullab@minisforum 'docker exec maia-sovereign printenv ACCESS_CONTROL_MODE'
                                        ← empty
$ curl -s -o /dev/null -w '%{http_code}\n' -X POST https://soullab.life/api/ain/collective/breakthrough \
    -H 'content-type: application/json' --data '{}'
400
```

**Both halves read together:**

1. `ACCESS_CONTROL_MODE` is **unset in the running production container** → `getAccessMode()`
   returns **`permissive`** → unmapped routes are **allowed through middleware**.
2. **`400`** — from the public internet, over TLS, on the production domain. ⭐ 400 is the
   route's **own** validator (`userId and text are required`) answering an empty body. The
   middleware's refusals are 404 / 403 / 401; Caddy would not 400 a well-formed POST.

> ⭐⭐ **The request reached the route handler and executed it. Unauthenticated. From the
> open internet. In production.** The ACT 1 census said *probable*; this says **confirmed**.

⛔ Nothing was contributed — `{}` was chosen so the route's own validator would answer before
any write.

---

## 2. ⚠️ The exposure is a family, not a route

`/api/ain/` contains **seven** routes, **all unmapped**, all therefore permissive-allowed:

| Route | Own auth guard | Note |
|---|---|---|
| `collective/breakthrough` | ⛔ **none** | the confirmed one |
| `control` | ⛔ **none** | ⚠️ `action: 'emergency_stabilization' \| 'shutdown' \| 'status'` |
| `knowledge` | ⛔ **none** | corpus retrieval — `GET ?q=` and `POST` |
| `process` | ⛔ **none** | |
| `telemetry` · `digest` · `activate` | ⚠️ unexamined | |

### 2.1 `POST /api/ain/control`

Accepts `shutdown` and `emergency_stabilization` with **no authentication**.
⭐ **Bounded**: non-`status` actions short-circuit unless `GlobalAINActivator.isEvolutionActive()`.
⛔ Whether evolution is active in production is **UNKNOWN**. ⚠️ An unauthenticated shutdown
verb should not depend on a runtime flag for its safety.

### 2.2 `GET /api/ain/knowledge?q=…` — ⚠️ the one that touches R4

Retrieves chunks from `ain_knowledge_chunks` and can return them formatted for prompt
injection. Its only early return is `if (process.env.CAPACITOR_BUILD)` — ⛔ **an iOS
static-export stub, not a production guard.** It reads `betaSession.getCurrentUser()` and
⛔ never refuses on its result.

⭐⭐ **This joins R4 to the security surface.** ACT 1 established that `data/ain/source`
carries **third-party clinical and copyrighted works with no rights standing anywhere in any
schema**. An unauthenticated public endpoint that returns chunks of that corpus is a
**rights exposure**, not only an access one.

⚠️ **Bounded honestly, and the bound matters:** the exposure is **conditional on population**,
which is still **UNKNOWN**. If `ain_knowledge_chunks` holds no rows, the endpoint returns
nothing.

> ⭐ **`MAIA-WISDOM-WITNESS-01` part B is no longer only an architecture question. It is now
> the question of whether copyrighted material is publicly queryable today.** That changes
> its priority, not its method — it is still one read-only query.

---

## 3. ⛔ What this does NOT establish — stated so it is not overread

A scan found **587 of 944 API routes (62%) unmapped** in `config/accessMatrix.ts`.

⛔⛔ **That number must not be read as "62% of the API is open."** Verified by sampling:
`/api/admin/command-center/members` and `/api/admin/activity-feed` **carry their own guards.**
For those, being unmapped is a **loss of defence-in-depth**, ⛔ not an open door.

⭐ **The precise finding is narrower and worse:** the `/api/ain/*` family is **both unmapped
and self-undefended** — the middleware does not guard it and the routes do not guard
themselves. **Two layers, neither present.**

⚠️ **How many of the other 587 are also self-undefended is UNMEASURED.** ⛔ Not inferred, and
⛔ not this lane's to measure — but it is now a question someone owns. Recorded as a routed-out
finding: **`ACCESS-MATRIX-COVERAGE-01`**, ⛔ lane not opened.

---

## 4. Containment — ⛔ PREPARED, NOT APPLIED

⛔ **No file was changed.** ACT 1's instruction was *do not repair*, and a security change to a
shared config that reaches production is a founder act. The exact minimal diff, ready to apply:

```ts
// config/accessMatrix.ts — add ABOVE any broader rule (matchRule: exact → prefix → regex)
{ prefix: '/api/ain/', public: false, minTier: 'free', rolesAnyOf: ['admin'] },
```

⭐ **Why a prefix rule and not `ACCESS_CONTROL_MODE=strict`:** strict flips **all 587** unmapped
routes to 404 at once — including admin surfaces that currently work. That is a large,
unrehearsed blast radius and its own governed act. ⛔ **Do not close this finding by flipping
the mode.**

⚠️ **Verify before applying**, because `matchRule` returns the *first* prefix hit in array
order: confirm no existing rule already matches `/api/ain/…` more broadly, and that the new
entry precedes any `/api/` catch-all. ⛔ In-repo callers of these routes: **none found** —
`RetrievalService` is reached by direct function call from `maiaOrchestrator`, not over HTTP,
so gating the routes does not sever Seam 2.

**Ordered, ⛔ none authorized:**

1. The prefix rule above — closes the whole `/api/ain/*` family in one line.
2. Derive `userId` from the verified session in `collective/breakthrough`; ⛔ reject a
   body-supplied contributor.
3. Keep `AIN_FIELD_BRIDGE_ENABLED` off (R15).
4. Run `MAIA-WISDOM-WITNESS-01` B — now also a rights question (§2.2).

⚠️ **None of these is the consent gate.** They close an ingress. ⛔ The contribution act
remains a member-facing design question and must not be answered with a checkbox.

---

## 5. Standing

**REACHABILITY CONFIRMED · PRODUCTION · UNAUTHENTICATED · `permissive` MODE VERIFIED IN THE
RUNNING CONTAINER · `/api/ain/*` FAMILY (7 ROUTES) UNMAPPED, ≥3 SELF-UNDEFENDED ·
⚠️ `control` EXPOSES `shutdown` · ⚠️ `knowledge` EXPOSES CORPUS RETRIEVAL, BOUNDED BY UNKNOWN
POPULATION · ⛔ 62% UNMAPPED IS NOT 62% OPEN · ⛔ NOTHING CHANGED · ⛔ NOTHING DEPLOYED ·
⛔ CONTAINMENT PREPARED AND NOT APPLIED · `ACCESS-MATRIX-COVERAGE-01` ROUTED OUT.**

**Awaiting founder authorization to contain.**

> *The census said the endpoint was probably reachable. It is. And the route that answered
> was not the most dangerous one on its own corridor.*
