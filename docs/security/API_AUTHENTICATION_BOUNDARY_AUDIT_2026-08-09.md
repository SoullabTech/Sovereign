# API Authentication Boundary Audit

**Date:** 2026-08-09 · **Scope:** bounded, read-only · **Authorized by:** founder, ahead of the Lost Capability Recovery Audit
**Question:** *which externally reachable `/api/*` routes rely on middleware presence checks rather than validated identity?*
**Repairs made during this audit:** **NONE.**
**Data accessed:** none. The reachability probes deliberately **omitted** the identity parameter, so each route rejected at its own validator before touching any record.

---

## 0. Headline

**Confirmed, externally, anonymously, against production:**

```
400  GET https://soullab.life/api/caseload/probe-nonexistent/list   {"error":"memberId required"}
400  GET https://soullab.life/api/premium-storage/export            {"error":"Missing userId parameter"}
401  GET https://soullab.life/api/sovereignty/delete-my-memory      {"error":"Unauthorized"}          ← control, mapped
405  GET https://soullab.life/api/members/delete-account                                              ← control, verified in-route
```

The two `400`s are the finding. **A 400 from the route's own validator means the request reached the route handler from the public internet with no credential of any kind** — no cookie, no header, no token, no query parameter. The only thing standing between that request and practitioner caseload data is that I chose not to supply a `memberId`.

**The middleware is not the problem here.** For these routes the middleware was never consulted as a lock: they are **unmapped**, and `ACCESS_CONTROL_MODE` is unset in production, so `checkAccess()` returns `{ allowed: true, reason: 'no-rule-match' }`. The presence-only `isAuthenticated()` weakness found in the `delete-my-memory` investigation is real (§4) — but it is the *second* problem. The first is that **372 of 918 routes are never checked at all.**

---

## 1. Method

Every `app/api/**/route.ts` (918 files) was classified by **effective** boundary, not by middleware naming:

- **Validated identity** = the route (or a helper it calls) resolves identity against a stored credential: `getMemberIdFromRequest`, `getCurrentSession`, `getCurrentPractitioner`, `requireMember`, `verifySession`, `requireAdmin`, `requireCohort`, `memberIdForSessionToken`, `requireAccess`, `assertTeamMember`, and equivalents.
- **Caller-supplied identity** = `body.userId` / `body.memberId`, `searchParams.get('userId'|'memberId'|'_m')`, `x-member-id` header, `getLocalMemberId`. **Per the founder's instruction, none of these — nor the confirmation phrase — counts as authentication.**
- **Object-scoped** = the query independently constrains by `member_id`/`user_id`/`owner_id`/`practitioner_id`/`team_id`, or calls a scope helper.
- Access-matrix verdict computed by replaying `matchRule()` against the real `ACCESS_RULES` (253 rules) in `matchRule` order.

Script: `scratchpad/authAudit.mjs`; full per-route rows: `scratchpad/routes.json`.

## 2. Blast radius

| Class | Meaning | Count |
|---|---|---|
| **A** | independently authenticated — identity validated in-route/downstream | **256** |
| **B** | authenticated **and** separately authorized — identity validated *and* the object independently scoped | **208** |
| **C** | mapped by the access matrix, but **identity never validated in-route** — middleware is the only lock, and that lock is presence-only | **64** |
| **D** | **unmapped** — default-allow in permissive mode, **and** no validated identity | **372** |
| **E** | intentionally public | **18** |

**464 of 918 routes (A+B) are genuinely defended.** That is the majority, and it is worth stating plainly: most of this codebase authenticates properly.

**436 routes (C+D) are not.** Of those:

| | Count |
|---|---|
| C/D with write or destructive capability | **326** |
| …of which perform destructive SQL or export a `DELETE` handler | **26** |
| …of which take identity from the caller's own request | **76** |

### Priority domains among C/D writers

| Domain | Count |
|---|---|
| practitioner / member data | 35 |
| messaging | 25 |
| sessions | 25 |
| sovereignty / memory | 20 |
| admin / ops | 11 |
| files / export | 6 |
| PHI / health | 5 |
| untagged | 213 |

### Unmapped (D) by top-level segment

`/api/maia` 33 · `/api/portal` 29 · `/api/auth` 22 · `/api/members` 17 · `/api/admin` 15 · `/api/astrology` 14 · `/api/consciousness` 14 · `/api/practice` 14 · `/api/community` 12 · `/api/connectors` 10 · `/api/caseload` 8 · `/api/fields` 7 · `/api/clinical` 5 …

**`/api/admin` has 15 unmapped routes.** That is the line most worth a second look.

## 3. Highest-severity confirmed paths

Class **D**, destructive, identity taken from the caller — i.e. **anonymous cross-member read/write/delete by supplying someone else's id.** Each was read, not merely pattern-matched.

| Route | Methods | Identity source | Why it matters |
|---|---|---|---|
| `/api/caseload/[caseId]/list` | GET, PATCH, DELETE | `searchParams.get('memberId')`, `body.memberId` | The parameter is documented in-file as *"Practitioner's member ID"*. `CaseStore.getCaseWithStats(caseId, memberId)` / `updateCase(...)` are scoped **by the supplied value**, so supplying another practitioner's id scopes to their caseload. **Reachability confirmed anonymously (400 above).** |
| `/api/caseload/[caseId]/captures` | GET, POST, DELETE | `searchParams.get('memberId')`, `body.memberId` | Same pattern; links/unlinks capture sessions. Note `captureSession.user_id !== memberId` is checked — but against the caller-supplied `memberId`, so it constrains nothing. |
| `/api/premium-storage/export` | POST, GET, DELETE | `body.userId`, `searchParams.get('userId')` | Creates export archives and lists/deletes them for an arbitrary `userId`. **Reachability confirmed anonymously (400 above).** Export is a data-egress surface. |
| `/api/maia/meditation` | POST, GET, PUT, DELETE | `body.userId`, `searchParams.get('userId')` | Member session history keyed on the supplied id. |
| `/api/premium-storage/backup/list` | POST, GET, DELETE | `searchParams.get('userId')` | Backup enumeration/deletion per supplied id. |
| `/api/consciousness/symbolic` | GET, POST, DELETE | `searchParams.get('userId')` | Symbolic/telemetry records per supplied id. |
| `/api/debug/symbolic-telemetry` | GET, DELETE | `searchParams.get('memberId')` | A debug surface with a DELETE handler, unmapped. |
| `/api/connectors/caldav/configure`, `/api/connectors/obsidian/configure` | POST, DELETE | `body.userId` | Standing integration configuration — a persistent-config surface, per §"Explicit permission" of ordinary handling. |
| `/api/auth/google/disconnect` | POST | `body.userId` | Revokes another member's OAuth connection. |
| `/api/commons/contributions/[id]` | GET, PUT, DELETE | `searchParams.get('memberId')` | Class **C** — mapped, so the presence-only gate applies; an `x-member-id` header defeats it. |

Class **C**, destructive, identity from the URL rather than the caller's session — mapped, therefore protected only by the presence-only gate:

`/api/stellium/clients/[id]` · `/api/stellium/sessions/[id]` · `/api/stellium/marketing/contacts/[id]` · `/api/stellium/marketing/campaigns/[id]` · `/api/supervision/session/[id]` (GET/PATCH/DELETE, practitioner + session data).

## 4. The second problem — presence-only authentication

For **mapped** non-public routes the middleware does gate. But `middleware.ts:81-99`:

```ts
function isAuthenticated(req: NextRequest): boolean {
  if (req.cookies.get('maia_session')?.value) return true;   // any value, never validated
  if (req.headers.get('x-member-id'))        return true;
  if (req.headers.get('x-session-token'))    return true;
  const url = new URL(req.url);
  if (url.searchParams.get('_t') || url.searchParams.get('_m')) return true;
  return false;
}
```

**No token is validated.** So for the **64 class-C routes**, an arbitrary `x-member-id` header — or `?_m=1` — is the whole lock. Class A and B routes are unaffected: they re-derive identity from a real credential and ignore what the middleware concluded.

This is why the `delete-my-memory` repair deliberately does not lean on middleware.

## 5. Smallest coherent remediation boundary

Ordered by leverage-to-risk. **None of this was done.** Explicitly *not* recommended: a repository-wide middleware rewrite.

**1 — `ACCESS_CONTROL_MODE=strict` (one environment variable).**
Flips 372 unmapped routes from default-allow to default-deny. It is the single highest-leverage change available and it is instantly reversible. It is **also the most likely to break working surfaces**, so: set it in staging first, collect the resulting denials, map the legitimate ones into `ACCESS_RULES`, then promote. Do not set it directly in production.

**2 — Fix identity source on the ~76 caller-supplied-identity routes, highest-severity first.**
The pattern is already established by the `delete-my-memory` repair: derive identity from `getMemberIdFromRequest()`; treat a body/query id as at most a redundant echo; refuse a mismatch with 403. Start with the ten routes in §3 — practitioner caseload and premium-storage first, because those are another person's clinical and archival material.

**3 — Add explicit `ACCESS_RULES` entries for `/api/caseload`, `/api/premium-storage`, `/api/consciousness`, `/api/connectors`, `/api/debug`, `/api/admin`.**
`/api/admin` having 15 unmapped routes should not survive this week. Note that `/api/sovereignty` is protected today only because `'sovereignty'.startsWith('sovereign')` — give it its own rule rather than leaving a deletion surface guarded by a string coincidence.

**4 — Only then decide what `isAuthenticated()` should be.**
Making it verifying is a behavioural change across all 918 routes and would need session validation at the edge (a DB round trip in middleware). Because class A/B routes already re-derive identity, the cheaper and safer end-state may be: **middleware is a coarse filter and is never the only lock** — enforced by a pin, not by convention. That is a founder decision, and the enumeration above is what it needs.

**5 — Pin it.** The `git grep` pattern in `__tests__/practitioner-authority-boundaries.test.ts` can assert that no route in a designated set resolves identity from `body.userId` / `searchParams.get('memberId')` / `x-member-id`. That converts this audit from a snapshot into a standing control. (Not written here.)

## 6. Limits of this audit — stated plainly

1. **Static classification with an empirical spot-check.** Four routes were read in full and four probed live; the remaining 914 are classified by import/call-pattern analysis. Expect false positives in both directions.
2. **Known false-positive margin in class D:** 13 D-routes call `cookies()` directly and may validate a session in a way the detector did not recognise (<4% of D). Treat individual D rows as *candidates*, not verdicts.
3. **Downstream authorization was not traced.** A route classed C or D may still be safe because a service it calls enforces scope. Conversely, a route classed B may scope by a value the caller controls — `caseload/captures` shows exactly that shape, where an ownership check compares against the attacker-supplied id.
4. **No exploitation.** No probe carried an identity value, so no record was read, written, or deleted. Cross-member access is inferred from code plus confirmed anonymous reachability — it was not demonstrated, and should not be described as demonstrated.
5. **`/api/open/*` is intentionally public** by design (`middleware.ts:212`) and is not counted as a defect.

## 7. Reproduce

```bash
cd /Users/soullab/MAIA-SOVEREIGN
S=<scratchpad>
npx tsx -e "import {ACCESS_RULES} from './config/accessMatrix';
  require('fs').writeFileSync('$S/rules.json', JSON.stringify((ACCESS_RULES as any[]).map(r=>({
    exact:r.exact,prefix:r.prefix,regexSrc:r.regex?r.regex.source:undefined,public:!!r.public,
    minTier:r.minTier,rolesAnyOf:r.rolesAnyOf,notes:r.notes}))))"
node $S/authAudit.mjs $S/rules.json $S/routes.json
```

Safe reachability probe — **omit the identity parameter**; a `400` from the route's own validator proves it was reached without credentials and touches nothing:

```bash
# (run via the sandbox fetch helper, not curl)
GET https://soullab.life/api/caseload/probe-nonexistent/list
GET https://soullab.life/api/premium-storage/export
```

---

*Read-only audit. No routes were repaired, no middleware changed, no production data read or modified.*
