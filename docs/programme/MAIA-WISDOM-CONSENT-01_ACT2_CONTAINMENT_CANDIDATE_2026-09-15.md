# MAIA-WISDOM-CONSENT-01 · ACT 2 — AIN Prefix Containment (CANDIDATE)

**Status: CANDIDATE ON BRANCH · ⛔ NOT MERGED · ⛔ NOT DEPLOYED.**
**Date:** 2026-09-15 · Branch `claude/loving-ramanujan-mlka7d`
**Diff:** `config/accessMatrix.ts` **+24 / −0** · new `__tests__/ain-corridor-containment.test.ts`

---

## 1. The semantics check you required — ⭐ CONJUNCTIVE, PROCEED

`checkAccess()` evaluates sequentially, each failure returning immediately:

```ts
if (rule.public)                                  return { allowed: true };
if (!isAuthenticated)                             return { allowed: false, reason: 'unauthenticated' };
if (!tierSatisfies(userTier, rule.minTier))       return { allowed: false, reason: 'insufficient-tier' };
if (!hasRequiredRole(userRoles, rule.rolesAnyOf)) return { allowed: false, reason: 'missing-role' };
return { allowed: true };
```

⭐ **Conjunctive: authenticated AND tier-satisfied AND admin.** Not "free-tier or admin."
`hasRequiredRole` returns true only on `userRoles.some(r => requiredRoles.includes(r))`.
**Proceeding as authorized.**

⚠️ **One dependent subtlety, checked because it would have silently voided the rule.**
Because `checkAccess` returns on the *first* failure, a rule carrying both a high `minTier`
and `rolesAnyOf` reports `insufficient-tier` and **never evaluates the role** — and the
middleware's `insufficient-tier` branch waives tier during development. ⭐ **That exact
bypass was already found and repaired in place** (`middleware.ts:344-372`): the branch
re-tests `rolesAnyOf` independently before waiving, with a comment noting *"Sixteen rules in
the matrix carry both constraints; every one of them was role-unenforced here."*

So the rule holds on **both** paths. ⭐ `minTier: 'free'` is nonetheless load-bearing by
design: it keeps the admin role the **single operative condition** rather than depending on
that repair. Recorded in the code comment so it is not "tidied" to `'pro'` later.

## 2. Precedence — ⛔ no conflict exists

`matchRule` resolves **exact → prefix (array order) → regex**. Programmatic scan of all
195 exact, 63 prefix and 3 regex rules against the corridor paths:

```
EXACT rules matching:  none
PREFIX rules matching: none
REGEX rules matching:  none
```

⭐ The corridor is genuinely unmatched, so placement cannot shadow or be shadowed. Inserted
beside `/api/founder`, which carries the identical `minTier: 'free', rolesAnyOf: ['admin']`
shape.

## 3. The change

```ts
{ prefix: '/api/ain/', public: false, minTier: 'free', rolesAnyOf: ['admin'],
  notes: 'AIN collective field corridor — admin only (MAIA-WISDOM-CONSENT-01 containment)' },
```

Preceded by a comment recording the production witness, the two absent layers, why
`minTier: 'free'` is deliberate, and that ⛔ **this is not the contribution boundary.**

## 4. Acceptance evidence

⚠️ **Jest could not run in this container — the project's `node_modules` is not installed**
(`Preset ts-jest not found`). ⛔ **Not reported as a passing suite.** The assertions were
executed directly against the real `config/accessMatrix` module via `tsx`:

```
25 passed · 0 failed
```

| # | Criterion | Result |
|---|---|---|
| 1 | `collective/breakthrough` unauth → **not 400** | ⭐ `unauthenticated` → middleware returns **401** for `/api/*` (`middleware.ts:281-287`) |
| 2 | `control` unauth → handler must not execute | ⭐ refused at middleware |
| 3 | `knowledge` unauth → corpus retrieval must not execute | ⭐ refused at middleware |
| 4 | authenticated non-admin denied | ⭐ `missing-role` → 403 for member · practitioner · steward · curator · partner |
| 5 | authenticated admin reaches route | ⭐ allowed, all 7 corridor routes |
| 6 | direct-function `RetrievalService` path unchanged | ⭐ untouched — reached by import from `maiaOrchestrator`, never over HTTP |
| 7 | Seam 2 `/api/between/chat` unchanged | ⭐ still unmapped; asserted not captured |
| 8 | Sanctuary invariant unchanged | ⭐ no file touched |
| 9 | `ACCESS_CONTROL_MODE` unchanged | ⭐ **0 occurrences in the diff** |
| 10 | no unrelated matrix behaviour changed | ⭐ **+24 / −0 — zero deleted lines**; `/api/founder/ops`, `/api/team`, `/api/book-studio/x`, `/api/ainsley`, `/` all assert not-captured |

⭐ `/api/ainsley` is asserted deliberately: the rule must mean **corridor**, not substring.

⚠️ **Owed before merge:** `npx jest __tests__/ain-corridor-containment.test.ts` on a machine
with dependencies installed. The founder's run is the evidence of record.

## 5. Scope held

⛔ no `ACCESS_CONTROL_MODE=strict` · ⛔ no consent UX · ⛔ no *"Offer this to the field"* ·
⛔ no Seam 2 change · ⛔ no corpus rewiring · ⛔ no rights-model work · ⛔ no 587-route
cleanup · ⛔ no `ACCESS-MATRIX-COVERAGE-01` work · ⛔ no route handler edited · ⛔ nothing
deployed.

⚠️ **Deliberately NOT done, and why.** ACT 2 authorized *containment*, and the authorized
rule contains the corridor at the middleware. It does **not** bind identity inside the
handler — `collective/breakthrough` still trusts a body-supplied `userId`. ⭐ **That is
correct for now**: an admin-only corridor cannot be reached by a member at all, so the
forgery path is closed by unreachability rather than by binding. ⛔ **But the binding must
land before the corridor is ever widened beyond admin** — otherwise the first step toward a
member-facing contribution path reopens identity forgery. Recorded as the opening obligation
of whatever act widens it.

## 6. Production falsifier — ⛔ after merge and deploy only

```bash
curl -s -o /dev/null -w '%{http_code}\n' -X POST https://soullab.life/api/ain/collective/breakthrough \
  -H 'content-type: application/json' --data '{}'
# before: 400   ·   after: 401  ·   still 400 ⇒ handler still exposed
curl -s -o /dev/null -w '%{http_code}\n' -X POST https://soullab.life/api/ain/control \
  -H 'content-type: application/json' --data '{}'
curl -s -o /dev/null -w '%{http_code}\n' 'https://soullab.life/api/ain/knowledge?stats=true'
```

⭐ All three are no-write probes. ⛔ `control` is sent `{}` so its own `!body.action` guard
would answer if it were still reachable — no action verb is ever submitted.

**Standing: CANDIDATE COMMITTED · 25/25 ASSERTIONS PASS · ⚠️ JEST RUN OWED · ⛔ MERGE NOT
AUTHORIZED · ⛔ DEPLOY NOT AUTHORIZED · ⛔ CONSENT BOUNDARY STILL UNDESIGNED · PRODUCTION
UNTOUCHED.**

> *This closes the door. It does not answer whether anyone knocked.*
