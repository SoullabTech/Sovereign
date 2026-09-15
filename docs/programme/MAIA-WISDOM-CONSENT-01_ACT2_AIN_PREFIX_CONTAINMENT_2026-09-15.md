# MAIA-WISDOM-CONSENT-01 · ACT 2 — AIN Prefix Containment

**Status:** CANDIDATE on branch. ⛔ **MERGE NOT AUTHORIZED · DEPLOY NOT AUTHORIZED.**
**Date:** 2026-09-15. **Base:** canonical `53cd1852`. **Diff: one rule line.**

---

## 1. ⭐ Step 2 gate — conjunctivity PROVEN at code level, not inferred from field names

`checkAccess()` (`config/accessMatrix.ts`) is a sequence of early-return guards:

```ts
if (rule.public)                        return { allowed: true }      // short-circuits BEFORE auth
if (!isAuthenticated)                   return { allowed: false, reason: 'unauthenticated' }
if (!tierSatisfies(userTier, minTier))  return { allowed: false, reason: 'insufficient-tier' }
if (!hasRequiredRole(roles, rolesAnyOf))return { allowed: false, reason: 'missing-role' }
return { allowed: true }
```

`hasRequiredRole` = `userRoles.some(r => requiredRoles.includes(r))` — **the *AnyOf* is disjunction
WITHIN the role list only.** Therefore the authorized combination means exactly:

```
authenticated AND tier >= free AND role ∈ {admin}
```

⛔ **No OR-combination exists between the three conditions.** Gate passes; editing proceeded.

⚠️ **One adjacent fact the gate surfaces:** `public: true` short-circuits *before* the auth
check. A public rule winning precedence would defeat containment entirely — which is why §3
witnesses precedence rather than assuming it.

---

## 2. The defect, demonstrated rather than asserted

`/api/ain/*` carried **no matrix rule at all**. `getAccessMode()` defaults to `permissive`
unless `ACCESS_CONTROL_MODE === 'strict'`, and in permissive mode an unmapped route returns
`{ allowed: true, reason: 'no-rule-match' }`.

**BEFORE (canonical `53cd1852`, rule absent) — same instrument, same probes:**

```
/api/ain/collective/breakthrough   winner=NO RULE
/api/ain/control                   winner=NO RULE
/api/ain/knowledge                 winner=NO RULE
unauthenticated                    allowed=TRUE  reason=no-rule-match   ← all three
```

Exposed handlers: `activate · collective · control · digest · knowledge · process · telemetry`.

---

## 3. The change — exactly one rule

```ts
{ prefix: '/api/ain/', public: false, minTier: 'free', rolesAnyOf: ['admin'], notes: '…' },
```

Placed immediately after `/api/founder`, its sibling admin-only API rule.

### A · Precedence WITNESSED, not assumed

`matchRule()` runs three passes: **exact (any position) → prefix (FIRST match in array order)
→ regex**. So a correct rule can still be dead if something earlier wins.

```
/api/ain/collective/breakthrough   winner=/api/ain/   PASS
/api/ain/control                   winner=/api/ain/   PASS
/api/ain/knowledge                 winner=/api/ain/   PASS

no earlier prefix rule shadows /api/ain/     earlier_matches=0   PASS
no exact rule preempts (exact pass is first) exact_matches=0     PASS
```

### The rule is LIVE — the enforcement path was traced end to end

- `middleware.ts` matcher excludes only `_next/static`, `_next/image`, `favicon.ico`,
  `api/voice/transcribe-simple`, `api/sovereign/manuscripts/ingest` — **`/api/ain/*` is
  matched.**
- The `preRule?.public` early-return cannot bypass this rule (`public: false`).
- `middleware.ts:272` calls `checkAccess(...)`; `/api/` denials return **401 JSON**, not a
  redirect.

---

## 4. B · Authorization-layer probes — AFTER

Run against all three probe paths; identical results on each:

| Caller | Result |
|---|---|
| unauthenticated | `allowed=false reason=unauthenticated` |
| authed member, no role | `allowed=false reason=missing-role` |
| authed practitioner (pro) | `allowed=false reason=missing-role` |
| authed steward | `allowed=false reason=missing-role` |
| **authed admin, free tier** | **`allowed=true`** |
| **authed admin, pro tier** | **`allowed=true`** |
| **authed admin + member** | **`allowed=true`** |

⭐ Per the founder's acceptance detail B, the admin rows establish that **the authorization
layer admits the request** — ⛔ they do not claim any particular handler status code.

### C · Non-AIN regression — the surrounding seam did not move

```
/api/founder/x   admin        allowed=true    PASS
/api/founder/x   member       allowed=false   PASS
/api/sovereign/app member     allowed=true    PASS
/api/team/invite/abc unauth   allowed=true    PASS   (public rule intact)
/faq             unauth       allowed=true    PASS
```

---

## 5. ⛔ What is NOT evidenced here

| Owed | Why |
|---|---|
| Route-level HTTP probes 1–10 | No `node_modules`, no server, no reachable DB in this container. ⛔ Authorization-layer evidence is **not** offered as a substitute. |
| "Admin reaches normal handler semantics" | Requires driving the real route; only the access layer is proven. |
| Production containment | ⏳ **UNWITNESSED.** |

⚠️ **The witness instrument was NOT committed**, to keep the diff containment-only per step 7.
Its output is recorded above verbatim. *Say the word and it lands as a durable instrument.*

### Post-deployment falsifier (for when deploy is authorized)

```
BEFORE  unauthenticated → 400          handler REACHED
AFTER   unauthenticated → 401          handler NOT reached
```

⭐ Per the founder: record **both** the HTTP status **and** the absence of handler-side effects
or log evidence for `control` and `knowledge` — status alone proves the boundary far less
strongly than status paired with *the handler did not execute*.

---

## 6. Standing

```
AIN prefix defect             ✅ CONFIRMED (before-state demonstrated on the same instrument)
candidate containment         ✅ IMPLEMENTED (one rule line)
conjunctivity gate            ✅ PROVEN at code level
precedence witness            ✅ PASS — the new rule wins all three probes
local authorization evidence  ✅ PASS
non-AIN regression evidence   ✅ PASS
route-level HTTP probes 1–10  ⏳ OWED
merge                         ⛔ NOT AUTHORIZED
deployment                    ⛔ NOT AUTHORIZED
production containment        ⏳ UNWITNESSED
ACCESS-MATRIX-COVERAGE-01     ⛔ UNOPENED — the 587 unmapped routes are a security FINDING,
                                 not inherited authority to remediate them
```
