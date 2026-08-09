# Security finding — `POST /api/sovereignty/delete-my-memory` authorization boundary

**Date:** 2026-08-09 · **Authorized by:** founder, as a security investigation ahead of other lanes
**State** (per `INCIDENT_RESPONSE_STANDARD.md` — seven independent facts):

| designed | implemented | tested | merged | deployed | live-verified | closed |
|---|---|---|---|---|---|---|
| ✅ | ✅ | ✅ 15/15 | ❌ | ❌ | ❌ | ❌ |

⚠️ **Branch-only** (`feature/labtools-redesign`). **The repaired behaviour described below is NOT live** — production still serves the pre-repair route. One larger finding (§4) is **reported, not fixed**; it needs a founder decision. (Only the `premium-storage/export` DELETE fix has shipped — PR #996, `46cdd47dd`.)
**Production impact today:** **none demonstrated.** The authorization defect is confirmed; **exploitability is not**, for two incidental reasons (§3). No exploit was attempted against production; no production state was mutated by this investigation.

---

## 1. The defect (confirmed)

Before this repair, the route read the target identity from the **request body**:

```ts
const { userId, confirmationPhrase, deleteReason } = body;   // ← identity from the caller's own payload
```

and performed **no authentication of any kind**. The only precondition was a confirmation phrase — `'DELETE ALL MY CONSCIOUSNESS DATA'` — which is a **hardcoded constant in the repository**. It is a UI double-check, not a secret and not an authorization control.

**Caller-supplied identity determined deletion scope.** That is the defect.

## 2. Reachability — and why the middleware gate does not save it

`/api/sovereignty/delete-my-memory` **is** covered by an access rule, by coincidence rather than intent: `'/api/sovereignty/…'.startsWith('/api/sovereign')` matches `{ prefix: '/api/sovereign', minTier: 'free' }`. Verified empirically:

```
mode         : permissive
matched rule : {"prefix":"/api/sovereign","minTier":"free","notes":"Sovereign features"}
anon         : {"allowed":false,"reason":"unauthenticated"}
authed free  : {"allowed":true}
```

⚠️ **This protection is accidental and fragile.** `ACCESS_CONTROL_MODE` is **unset in the production container**, so `getAccessMode()` returns `'permissive'` and unmapped routes are **allowed by default**. Renaming the rule prefix, or the route, would silently unprotect it with no test failing.

**And the gate itself is not authentication.** `middleware.ts:81-99`:

```ts
function isAuthenticated(req: NextRequest): boolean {
  if (req.cookies.get('maia_session')?.value) return true;   // any value
  if (req.headers.get('x-member-id'))        return true;   // ← unverified
  if (req.headers.get('x-session-token'))    return true;   // ← unverified
  const url = new URL(req.url);
  if (url.searchParams.get('_t') || url.searchParams.get('_m')) return true;  // ← unverified
  return false;
}
```

**No token is validated.** Presence of an arbitrary `x-member-id` header — or `?_m=1` on the URL — satisfies the gate. So the pre-repair chain was:

```
remote caller
  → POST /api/sovereignty/delete-my-memory?_m=1        (defeats the middleware gate)
  → body: { userId: <any member>, confirmationPhrase: <constant from the repo> }
  → route performs no auth, deletes against body userId
```

That is an **unauthenticated** cross-member deletion path in code, not merely an authenticated IDOR.

## 3. Why it was not exploitable in production — two accidents, neither a control

1. **The service cannot reach a database from that container.** `services/user-sovereignty/delete-memory-api.js` builds its own pool from `POSTGRES_HOST/PORT/DB/USER`. In `maia-sovereign` those are **UNSET** (only `POSTGRES_PASSWORD` and `DATABASE_URL` are set), so the pool defaults to `localhost:5432`, where no Postgres listens — Postgres runs in the separate `maia-postgres` container. `pool.connect()` fails → the route's catch path.
2. **None of the five target tables exist in production.** Verified: `elemental_evolution`, `wisdom_moments`, `ain_consciousness_memory`, `elemental_personalities`, `maia_adaptations`, `data_deletion_log` — **zero of six present**. Every `DELETE` would error into `ROLLBACK`.

**Neither is a security control.** Setting `POSTGRES_HOST`, or landing a migration that creates those tables, would have converted a latent defect into a live one with nothing failing in between. That is the finding worth carrying forward.

## 4. ⚠️ Larger finding — **reported, not fixed**

**`isAuthenticated()` in `middleware.ts` is presence-only across the entire `/api/*` surface.** Any route that trusts the middleware gate rather than verifying identity for itself is gated by an arbitrary header.

Routes that call `getMemberIdFromRequest()` (which validates a session token against `member_sessions`) — e.g. `POST /api/members/delete-account` — are unaffected. **How many routes rely on the middleware gate alone was not enumerated by this investigation.**

This is out of the authorized scope of a single-route repair and its blast radius is the whole API. **It needs a founder decision**, and the enumeration should precede any change.

## 5. The repair (applied)

`app/api/sovereignty/delete-my-memory/route.ts`:

- Identity comes **only** from `getMemberIdFromRequest(request)` — a verified session token. No caller, no cookie value, no header presence substitutes.
- No verified identity → **401**, before the service is touched.
- A body `userId` naming anyone other than the caller → **403 `forbidden_cross_member`**, deleting nothing and never reaching the service.
- A body `userId` is accepted only as a redundant echo of the caller. Absent entirely, the route still knows who is calling.
- The route **does not rely on middleware** and says so in its header comment, so a future change to the access matrix cannot silently unprotect it.

## 6. Regression tests

`app/api/sovereignty/delete-my-memory/__tests__/deleteMemoryHonesty.test.ts` — **15/15 passing** (2026-08-09). The four authorization pins:

| Test | Proves |
|---|---|
| an unauthenticated caller is refused before anything is attempted | 401; service never invoked |
| a body userId naming another member is refused and deletes nothing | 403; service never invoked |
| the id handed to the service is the verified caller, not the body | scope follows the session, not the payload |
| identity is never read from a header or query parameter | an `x-member-id` header does not authenticate here |

Plus the eleven honesty pins from the 2026-08-09 truthfulness ruling.

## 7. Reproduce

```bash
cd /Users/soullab/MAIA-SOVEREIGN

# the access-matrix verdict for this path
npx tsx -e "import {matchRule,checkAccess,getAccessMode} from './config/accessMatrix';
const p='/api/sovereignty/delete-my-memory';
console.log(getAccessMode(), JSON.stringify(matchRule(p)), JSON.stringify(checkAccess(p,'free',[],false)));"

# the gate is presence-only
sed -n '81,99p' middleware.ts

# the confirmation phrase is a repo constant, not a secret
rg -n 'DELETE ALL MY CONSCIOUSNESS DATA' services/user-sovereignty/delete-memory-api.js

# regression suite
npx jest app/api/sovereignty/delete-my-memory/__tests__/deleteMemoryHonesty.test.ts
```

```bash
# production facts (read-only)
ssh soullab@minisforum 'docker exec maia-sovereign sh -lc "printenv POSTGRES_HOST || echo UNSET"'
ssh soullab@minisforum 'docker exec maia-sovereign printenv ACCESS_CONTROL_MODE || echo UNSET'
```

## 8. Recommended decisions (not taken here)

1. **Enumerate every `/api/*` route that relies on the middleware gate alone**, then decide whether `isAuthenticated()` becomes verifying, or whether route-level verification becomes mandatory and pinned.
2. **Set `ACCESS_CONTROL_MODE=strict`** so unmapped routes deny rather than allow — currently a new route is public until someone remembers to map it.
3. **Add an explicit `/api/sovereignty` access rule**; do not leave a deletion endpoint protected by a string-prefix coincidence.
4. **Decide the fate of `services/user-sovereignty/delete-memory-api.js`.** It is an Express app (it constructs a `pg.Pool` and an express instance as an import side effect), it targets five tables that do not exist, and it is reachable from a Next.js route. Deleting the endpoint may be more honest than maintaining it.

---

*No exploit was executed. No production data was read beyond schema/env presence, and none was modified.*
