# Step 1 evidence — `ACCESS_CONTROL_MODE=strict`

**Date:** 2026-08-09 · **Status:** ⛔ **STOPPED FOR REVIEW before any staging or production change, as directed.**
**Changes made:** **NONE.** No environment variable was set anywhere, no rule was added, no route was repaired.

---

## 0. Step 1 cannot be executed as written, and the reason is the finding

The founder's Step 1 was: *test strict mode in staging, collect every denial, classify each.* That sequence assumes the denial set is a manageable list of misconfigured routes.

**It is not.** `checkAccess()` denies unmapped routes **before authentication is ever considered**:

```ts
const rule = matchRule(pathname);
if (!rule) {
  if (mode === 'strict') return { allowed: false, reason: 'no-rule-match', unmapped: true };
  //                            ^ no authentication branch — denied to everyone, always
  else                   return { allowed: true,  reason: 'no-rule-match', unmapped: true };
}
if (rule.public) return { allowed: true, rule };
if (!isAuthenticated) return { allowed: false, reason: 'unauthenticated', rule };
```

So strict mode is not a security tightening applied to insecure routes. **It is a hard deny applied to every unmapped path, including paths that are already correctly secured.**

## 1. The denial set

| Surface | Total | **Unmapped → denied in strict mode** |
|---|---|---|
| `/api/**/route.ts` | 918 | **593** (65%) |
| `app/**/page.tsx` (non-API) | 500 | **93** |
| | | **686 surfaces** |

Of the 593 API routes that strict mode would deny:

| | Count | |
|---|---|---|
| **A** — already authenticate in-route | **150** | ⚠️ **secure today; strict mode breaks them** |
| **B** — authenticate *and* object-scope | **71** | ⚠️ **the best-defended routes in the codebase; strict mode breaks them too** |
| **D** — no validated identity | 372 | the genuine exposure |

**221 of 593 (37%) are routes that do their job correctly.** Flipping the flag would take them down alongside the porous ones. The variable does not distinguish "unmapped" from "unsafe" — it only knows "unlisted".

### Denials by namespace (API, top 20)

`/api/maia` 42 · `/api/auth` **40** · `/api/practitioner` 39 · `/api/admin` 37 · `/api/members` **35** · `/api/portal` 29 · `/api/astrology` 16 · `/api/consciousness` 14 · `/api/practice` 14 · `/api/community` 13 · `/api/media` 12 · `/api/voice` 12 · `/api/connectors` 10 · `/api/caseload` 9 · `/api/comms` 9 · `/api/nostr` 9 · `/api/psyche` 8 · `/api/ain` 7 · `/api/fields` 7 · `/api/now-what` 7

⚠️ **`/api/auth` (40) and `/api/members` (35) are in the denial set.** Sign-in, registration, session refresh and recovery run through those namespaces. Enabling strict mode without mapping them first would deny authentication itself — including in staging, which would make the staging run uninterpretable rather than informative.

## 2. This is a known open lane — reconciliation, not rediscovery

Prior work reached the same conclusion and it is recorded:

- `docs/reviews/HOUSE_00_STANDING_RECORD.md` **SR-56**: *"The strict-mode prerequisite is **NOT met** — `ACCESS_CONTROL_MODE` stays `permissive`."* Parent: issue **#732**, noted as *"complete access-surface adjudication (items 2/3/4 untouched)"*.
- `docs/reviews/LAYER1_ROUTE_INVENTORY_2026-07-30.md` — page-route inventory; **85 page routes "unmapped and unguarded"**.
- `docs/reviews/LAYER2_REACHABILITY_SCREENING_2026-07-30.md` — reachability screening, with its own detector caveats.

**What this audit adds that #732 did not have:** the prior lane inventoried **page** routes. It did not classify the **918 API routes** by *effective* authentication, and it did not confirm anonymous external reachability. Both are now on record (`API_AUTHENTICATION_BOUNDARY_AUDIT_2026-08-09.md`).

**What it means for sequencing:** the strict-mode prerequisite has been unmet for at least 10 days and is a mapping problem, not a flag problem. This lane should adopt #732 rather than open a parallel one.

## 3. Staging

`docker-compose.staging.yml` and `Caddyfile.staging` exist. **Whether the staging stack currently runs, and whether it mirrors production's env, was not verified** — and there is no point verifying it until §4.1 is done, because a strict-mode staging run today would deny `/api/auth` and produce an unusable result.

## 4. Recommended revision to the sequence — founder decision

The founder's Steps 2–4 are unaffected and correct. Only the position of Step 1 changes.

### 4.1 Mapping is the prerequisite, not the experiment

Classify all **686** unmapped surfaces as `public` / `authenticated` / `authenticated + object-scoped`, and write the `ACCESS_RULES` entries. This is the bulk of the work and is exactly what #732 scoped. It is safe: adding a rule for a route that already authenticates changes nothing at runtime while permissive is in force.

Per the founder's constraint — *do not weaken strict mode merely to restore a broken caller* — the rule for each route must be justified by what the route **is**, not by what breaks. The A/B classification already carries that evidence for 221 of them.

### 4.2 ⭐ Step 2 should go first, not second

**Step 2 does not depend on strict mode at all**, and it is the step that actually closes member exposure. `/api/caseload/**` and `/api/premium-storage/**` are anonymously reachable *today*; mapping them will not fix them, because the defect is that they take identity from the caller. Conversely, strict mode would hide the exposure behind a gate without repairing the authority model underneath.

**Recommendation: begin Step 2 immediately, in parallel with 4.1, and hold strict mode until last.** Rationale: the founder's own invariant — *no caller-supplied identity may serve as authority* — is violated by Step 2's routes regardless of what the access matrix says about them.

### 4.3 Revised order

1. **Step 2** — caller-supplied identity → authenticated identity. `/api/caseload/**`, then `/api/premium-storage/**`, then the remaining ~76. *(Closes actual exposure.)*
2. **Step 3** — explicit namespace policy; remove the `'sovereignty'.startsWith('sovereign')` accident. *(Makes protection intentional.)*
3. **4.1 mapping** — all 686 surfaces classified and mapped. *(Makes strict mode survivable.)*
4. **Step 4** — the pin: CI fails on unmapped, caller-supplied identity, presence-only reliance, prefix-collision protection, or an undeclared route. *(Makes recurrence impossible — and is what makes "no implicit class D" real.)*
5. **Step 1 / Step 5** — strict mode in staging, then production. *(Now a confirmation, not an experiment.)*

⭐ Note that **Step 4's pin subsumes Step 1's purpose.** Once CI refuses an unmapped route, the map cannot drift, and strict mode becomes a belt-and-braces default rather than the mechanism the boundary depends on. That is the stronger end-state and it matches the founder's stated invariant: *authentication must fail closed at the system boundary; route-specific authorization may strengthen it but may not substitute for it.*

## 5. What I need before proceeding

Per the stop boundary, I am holding here. The decision needed is:

**(a)** Adopt the revised order in §4.3 — Step 2 first, strict mode last — or hold to the original order and accept that the staging run will be uninterpretable until mapping is done?

**(b)** Adopt issue **#732** as the home for the mapping work, or run this lane separately?

## 6. Reproduce

```bash
cd /Users/soullab/MAIA-SOVEREIGN
# strict mode has no authentication branch for unmapped paths
sed -n '659,678p' config/accessMatrix.ts

# the denial set (uses routes.json from the boundary audit)
node -e "const r=require('<scratchpad>/routes.json');
 const u=r.filter(x=>x.rule===null);
 const c={}; for(const x of u) c[x.cls]=(c[x.cls]||0)+1;
 console.log('api total',r.length,'unmapped',u.length,c);"

# prior lane
rg -n 'strict-mode prerequisite' docs/reviews/HOUSE_00_STANDING_RECORD.md
```

---

*Stopped for review. No environment variable set, no rule added, no route repaired, no staging or production change made.*
