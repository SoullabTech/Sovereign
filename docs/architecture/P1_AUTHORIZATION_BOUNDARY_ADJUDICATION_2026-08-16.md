# P1 — Authorization Boundary: Adjudication

**Founder-sequenced P1** (`FRONT_DOOR_FOUNDER_RULINGS_2026-08-16.md`): *adjudicate + repair
middleware / route trust.* This document adjudicates. Repair is **not yet started** — it waits on
one architecture ruling (R5) because two competent implementers bound by canon would build it
differently.

All claims ✅ verified at deployed SHA `39cc97d87`.

## The defect, precisely

The system has **no server-side session verification on its authorization edge, and its "hardened"
route guard has none either.** Two independent layers both derive identity, tier and role from
client-controllable inputs.

**Layer 1 — middleware** (`middleware.ts`, runs on all non-static routes ✅):
- `isAuthenticated()` :81 — true if `x-member-id` *or* `x-session-token` *or* `?_t=`/`?_m=` is
  merely **present**. No value validation. Carries its own `TODO: Replace with actual implementation`.
- `getUserTier()` :32 and `getUserRoles()` :54 — read `x-maia-tier` / `x-maia-roles` **client
  headers**. So a request with `x-maia-roles: admin` is treated as admin at the edge.

**Layer 2 — the route guard** (`lib/security/requireAccess.ts`), which `requireAdmin` → `requireRole`
→ `getAccessContext` all funnel through:
- `getAccessContext()` :42 — `authenticated = Boolean(sessionCookie || memberIdHeader)` :48; roles
  from `x-access-roles` / `maia_roles` cookie / `x-maia-roles` header :73-84.
- This file **never queries `auth_sessions` and never verifies a token** ✅ (grep count = 0).

**Consequence:** even the routes that correctly call `requireAdmin` are defeated by sending
`x-member-id: <any-uuid>` + `x-maia-roles: admin`. The guard the good routes trust is itself a claim
check. `maia_session` is an opaque 64-hex random token stored in `auth_sessions` ✅ — verifying it
*requires* a DB lookup, which neither layer performs.

## Scope — CORRECTED 2026-08-16 (my first pass overstated it three times)

⚠️ **My initial scope claims were wrong and are withdrawn.** They came from greps that did not know
the full guard vocabulary of this codebase, so every route using a guard I hadn't yet found counted
as "unguarded." Corrections replace confidence, not evidence — the corrected numbers below were
re-derived against the complete verified-guard set.

| Claim (first pass) | Corrected | Evidence |
|---|---|---|
| `/api/founder` 8 of 9 unguarded | **13 of 13 GUARDED** | every route calls `await requireFounder()` → `getCurrentSession` → `validateSession` → `auth_sessions`, then a `FOUNDER_MEMBER_IDS` allowlist. The founder lane already *is* Option C. |
| `/api/admin` 15 of 37 unguarded, other 22 use forgeable `requireAdmin` | dangerous admin routes GUARDED via `checkAdminAuth` | `lib/admin/adminAuth.ts` verifies against `auth_sessions` (unexpired, unrevoked) then checks `members.admin_role`, and **explicitly refuses a bare `x-member-id`**. Grant-role, member-list, admin-auth, password-reset all guarded (reset uses a non-forgeable `ADMIN_RESET_SECRET`). |

**What is genuinely open:** only `app/api/admin/monitoring/route.ts`, `.../system/route.ts`,
`.../run-checks/route.ts` — each does `x-member-id` presence-only. They leak ops/monitoring
telemetry (service health, incidents), not member PII or authority. **Fixed in this unit** (below).

**The real member-scoped surface — honestly re-derived:** of 920 API routes, **98** are unguarded
*and* identity-consuming (read `x-member-id` or a `memberId`/`userId` query/param). This matches the
auditor's original ~97 and is the true P2/tranche surface. Inventory:
`scratchpad/unguarded-identity-routes.txt`. Each still needs per-route triage — some may be
legitimately public reads or self-scoped-safe; the count is the candidate set, not a vulnerability
count.

**Middleware forgeability stands but is now in-doctrine:** under R5 middleware is UX-only, so its
presence-check `isAuthenticated()` and `x-maia-roles` reading are acceptable *provided each
sensitive route verifies independently*. The founder and admin lanes already do.

**Not a runtime exploit witness.** No request was ever forged against production. This is
"the deployed code contains no verification on these specific routes," established by reading it.
I did not and will not probe live endpoints.

## Correctly hardened — the assets to build on

`lib/auth/getMemberFromRequest.ts` ✅ verifies `x-session-token` against `auth_sessions`
(`memberIdForSessionToken`), refuses a bare `x-member-id`, and rejects a claim that mismatches the
verified session as impersonation. `resolveIdentity.ts` has a regression test asserting bare
`x-member-id` → null. These are the pattern; the fix is to make them the *only* authority.

## Why middleware cannot be the fix (the decisive architecture fact)

Next.js middleware runs in the **Edge runtime** and cannot use the Postgres driver — the file says
so twice ✅ (`:17`, `:370`). The session token is opaque and only meaningful via a DB lookup. There
is **no Edge-safe session verifier** in the tree (no `jose`/JWT/HMAC helper ✅). Therefore the
authorization boundary physically cannot live in middleware without either changing the session
format or adding an Edge datastore.

## R5 — architecture ruling required (escalated as principle, with recommendation)

Two coherent repairs exist; they differ in blast radius and reversibility, so this is above the
authority boundary:

- **Option A — Edge-verifiable sessions.** Move to signed tokens (JWT/HMAC via Edge-safe `jose`);
  middleware verifies the signature, strips *all* client `x-*` auth headers, sets trusted context.
  Cost: changes session minting at every issue point and **invalidates/ migrates all 483 live
  sessions**. Largest change, touches the thing currently proven to work (R1's evidence).

- **Option C — Node-runtime enforcement (RECOMMENDED).** Middleware is demoted to *routing/redirect
  UX only, making no security claim*. The single security boundary becomes a Node-runtime guard:
  rewrite `getAccessContext` to verify the session token against `auth_sessions` (reuse
  `memberIdForSessionToken`) and load roles/tier from the `members` row, **ignoring all
  client-supplied role/tier/auth headers**. Then route the 37 + 60 unguarded routes through it.
  Cost: no session migration, no format change, reuses proven verifiers; smallest coherent
  reversible unit. Preserves R1's working email-code path untouched.

**Recommended ruling: Option C.** It closes the hole with the least blast radius, leaves the
production-proven session mechanism intact, and converts the existing hardened helpers from
"available but uncalled" into the actual boundary. Middleware keeps doing coarse
unauthenticated→/signin redirects for UX, but is never trusted for authorization.

This is the one P1 question that needs you. Everything else in P1 (which routes, in what order, the
negative-control tests) is below the boundary and will proceed on the ruling.

## Sequencing note

P1 repair is **not started**; no route or middleware file has been edited. On an Option-C ruling the
first commit is the `requireAccess` rewrite + a negative-control test (bare `x-member-id` +
`x-maia-roles: admin` → 401/403), then the route sweep in tranches (founder/admin first). Fail-closed
throughout; no bypass.
