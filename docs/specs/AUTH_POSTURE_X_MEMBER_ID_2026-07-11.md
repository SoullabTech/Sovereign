# Auth Posture Spec: `x-member-id` Header Identity — 2026-07-11

**Status: SPEC — Kelly-gated. No auth behavior on live routes changes until this is ratified.**
**Phase 0 probe: BUILT + dev-witnessed 2026-07-11 (branch-only, log-only, behavior-identical — see §5 Phase 0). Deploy awaits a one-line go; the posture rule (§4) joins the sitting queue.**
**Findings bound to ref `72464c627` (branch `claude/focused-pascal-33242f`, worktree audit 2026-07-11).**
**Lineage: member-arc constitutional trace (docs/overview/ census, ref 831a0ca24+), finding F1.**

---

## 1. Finding

45 route files under `app/api/` derive member identity from a **bare `x-member-id` header** (at most a UUID-regex check) with no session verification — ~30 of them expose WRITE methods. Any caller who knows a well-formed member UUID (member UUIDs are exposed to clients, e.g. as `senderId`) can read and write that member's data on these routes.

This is a **platform posture question, not a one-route defect**: `x-member-id` is the deliberate Capacitor identity mechanism (iOS WebView cannot send `SameSite=Lax` cookies cross-origin). The question is what must *wrap* the header for it to be trustworthy.

## 2. The decisive fact: the target posture already exists

The platform already contains the hardened mechanism, and current clients already carry the credential it needs:

- **`getMemberIdFromRequest`** ([lib/auth/getMemberFromRequest.ts:30](../../lib/auth/getMemberFromRequest.ts)) resolves identity ONLY from an `auth_sessions`-backed token — `maia_session` cookie first, then `x-session-token` header (the iOS/Safari path). `x-member-id` is treated as an unverified *claim*: honored only when it matches the session's member; mismatch → reject + impersonation warning. Bare header alone → `null`.
- **`requireMemberId`** ([lib/auth/session.ts:32](../../lib/auth/session.ts)) — same posture; bare-header acceptance was explicitly removed (comment at L54).
- **`getAuthenticatedMember`** ([lib/practitioner/auth.ts:18](../../lib/practitioner/auth.ts)) and **`getCurrentSession`** ([lib/auth/serverSessions.ts:279](../../lib/auth/serverSessions.ts)) — session-verified; bare header fails.
- **`apiFetch`** ([lib/http/apiBase.ts](../../lib/http/apiBase.ts)) already sends `x-session-token` from localStorage `maia_session_token` on **both** the Safari path (L535) and the native CapacitorHttp path (L606 — its own comment: "x-member-id alone is no longer accepted (security fix)"), with `x-member-id` sent alongside as the claim.

**Therefore the migration is a convergence, not an invention**: move CLASS H routes onto `getMemberIdFromRequest`. No new signing scheme, no token-exchange protocol, no client release required for clients that sign in normally.

## 3. Route classification (audit of all 889 route files)

| Class | Meaning | Count |
|-------|---------|-------|
| **H** | bare `x-member-id`, no session check | **45 files (~30 with writes)** |
| **F** | session-first with bare-header fallback | 3 (`practitioner/practices`, `auth/whoami`, `members/me`) |
| **S** | session required (the four hardened helpers) | dominant majority (`getMemberIdFromRequest` ×182, `getCurrentSession` ×70, `requireMemberId` ×61, `getAuthenticatedMember` ×15 files, overlapping) |
| **O** | public (`/api/open/*`), admin fail-closed, dev bypasses | handful |

### CLASS H — Living Field family (all 9 files; the weakest gate at a Recognition-layer crossing)
`app/api/maia/living-field/`: `route.ts` (GET) · `[fieldKey]/route.ts` (GET, **PATCH**) · `[fieldKey]/encounter` (**POST, PATCH**) · `[fieldKey]/consent` (GET, **POST, DELETE**) · `[fieldKey]/sources` (**POST**) · `[fieldKey]/refine` (**POST**) · `[fieldKey]/gathering` (GET) · `states` (GET, **POST**) · `spirals` (GET, **POST**).

### CLASS H — other WRITE routes
`reader/ask`, `reader/moments`, `content/posts` (POST, PATCH), `members/beads`, `telemetry/client`, `pricing/helper-fund/apply`, `pricing/helper-fund/contribute`, `pricing/check-prompt`, `journal/quick/list`, `admin/monitoring/run-checks`, `practitioner/practice-field/draft`, `practitioner/containers/[containerId]` (+`/transition`), `practices/[practiceId]` (PATCH, DELETE) + `people` + `labtools/{opportunities,meetings,ventures}` families (POST/PATCH/DELETE), `native-biometry/{verify,enable}`, `portal/[slug]/invites/create`, `sovereign/app/maia` (POST — mixed header|body|session), `voice/stream-conversation`.

### CLASS H — READ-only
`field-analytics/report`, `studio/integrations`, `admin/monitoring` + `/system`, `portal/[slug]/auth`, `portal/[slug]/client/status`, `practices/[practiceId]/dashboard` + labtools dashboards/timeline.

⚠️ **Flag within a flag**: `admin/monitoring/*` routes gate on the bare header with **no admin-role check found**. They need role enforcement, not just session verification.

⚠️ **The 45 is a floor, not a total.** The audit enumerated the *header* channel. Identity-by-assertion has at least three syntaxes on this surface: the `x-member-id` header (45 files), the bare `?memberId=` query param (found on `living-field/route.ts` during the Phase 0 build), and body-carried identity (`sovereign/app/maia`, `voice/stream-conversation`). The channel enumeration is therefore **"header + query + body(2 known), others TBD by probe"** — the Phase 0 marker logs `queryClaimPresent` for this reason, and Phase 1 route conversions must close every claim channel on the route they touch, not just the header. No future reader should treat the 45 as exhaustive.

### Middleware
`middleware.ts:81-98` `isAuthenticated` returns true on **mere presence** of `x-member-id` (or `x-session-token`, or `?_t`/`?_m`) — no DB validation; tier/roles come from unsigned cookies. It is a coarse gate only; real identity must be re-derived in handlers. CLASS H handlers never re-derive it.

## 4. Target posture (the rule)

> **Identity is derived only from an `auth_sessions`-backed credential (cookie `maia_session` or header `x-session-token`). `x-member-id` is never identity — it is an optional claim that must match the verified session, everywhere, on every route. Middleware presence-checks may gate coarsely but never confer identity.**

This is already the written contract of `getMemberIdFromRequest`; this spec extends it from "the helpers that adopted it" to "the platform." Ratifying it is recognition, not legislation — naming what the best code already practices and obligating the rest to converge (same move as the locality doctrine).

**Finding for the sitting — every phase is adoption, none is construction.** Three convergence discoveries in a row: `getMemberIdFromRequest` (the member-route pattern, complete with impersonation-rejection), `checkAdminAuth` (the admin pattern, session + role + audit log), and `apiFetch` already sending `x-session-token` on both client paths. The codebase had already solved this problem one layer over at every point the plan touches. The posture rule is not imposing a new standard — it is ending an inconsistency the hardened path had already resolved everywhere it was used.

**Terminal condition (part of the ratification text):** the posture is not Grade-A structural until `middleware.ts` `isAuthenticated` no longer treats a bare `x-member-id` (or `?_m`) as an authentication signal — until then the front door contradicts what the routes enforce behind it. "Done" is testable by the house standard: impersonation proven impossible by a request that fails (§6's bare-header and mismatch probes returning 401 on every formerly-CLASS-H route, with Phase 4 landed).

**Additional claim channel (recorded during Phase 0 build):** `living-field/route.ts` also accepted a bare `?memberId=` query param as identity — a second unverified channel beyond the header. The Phase 0 probe logs it (`queryClaimPresent`); Phase 1 removes it with the header path.

Constitutional framing: identity is the boundary on which every consent gate (Sanctuary, anchors, atoms `return_preference`, Living Field consents) depends. A consent ledger keyed to an impersonatable ID is not a consent ledger. This is Sovereignty-Invariant work, not hardening polish.

## 5. Patch plan (phased; each phase independently deployable + verifiable)

**Phase 0 — telemetry pre-check (1 small deploy, no behavior change). STATUS: BUILT + dev-witnessed 2026-07-11; awaiting one-line go to deploy.**
`lib/auth/authPostureProbe.ts` — `probeAuthPosture(request)` returns exactly the bare header (behavior-identical drop-in) while asynchronously logging marker `[auth-posture] { route, method, headerPresent, queryClaimPresent, credentialPresent, sessionResolved, match, headerIdPrefix }`. Wired at all 14 identity-read sites across the 9 Living Field files plus a standalone call on the hot `sovereign/app/maia` POST path (fires before the `userId ||` short-circuit so every request samples). The call sites are exactly the sites Phase 1 later replaces with `getMemberIdFromRequest`; the probe file deletes at Phase 1.
Dev witness (2026-07-11, `next dev` + real dev DB): bare-header requests still return 200 (behavior unchanged) and the marker logged with correct shape — including a live `sessionResolved: true, match: false` impersonation signature from a mismatched header against a real session cookie.
Run 48–72 h in production. Purpose: detect any live client population that sends `x-member-id` **without** a resolvable session token (e.g. legacy `beta_user` localStorage state predating `auth_sessions`). Expected: near-zero, since `apiFetch` sends both. Probe cost: one indexed single-row `auth_sessions` lookup per sampled request, fire-and-forget (never awaited, never throws into the request).

**Phase 1 also includes (reordered per assessment 2026-07-11): `admin/monitoring/*` role enforcement.**
These routes gate on the bare header with no role check — highest exposure, and unlike member routes they carry **zero client-compatibility risk** (internal surfaces, no Capacitor population, no telemetry dependency). The conforming helper already exists: `checkAdminAuth` (lib/admin/adminAuth.ts:48) — session-verified via `x-session-token`/`maia_session` against `auth_sessions`, then `admin_role` check, with `admin_access_log` audit rows. Pure convergence; ships in the same commit window as the Living Field migration, not behind it.

**Phase 1 — Living Field family (9 files), writes first.**
Replace the local `getMemberId` header-read with `getMemberIdFromRequest`; failure → 401 (not 400). One mechanical pattern across all 9 files. Refusal ID to mint on ratification (registry pattern: R08 precedent).

**Phase 2 — remaining CLASS H WRITE routes (~21 files).**
Same substitution. `sovereign/app/maia` (POST) and `voice/stream-conversation` need care: they read identity from body as well; the session must win and the body value demote to claim. `native-biometry/*` and `portal/[slug]/*` may have pre-session bootstrap semantics — audit each before converting; if a route legitimately runs pre-authentication, reclassify it CLASS O explicitly with a comment, never leave it implicitly H.

**Phase 3 — CLASS H READ routes + CLASS F fallback removal.**
Convert reads; delete the bare-header fallback in `practitioner/practices` (`getMemberIdWithFallback`), `auth/whoami`, `members/me`. (Admin-role enforcement moved up into Phase 1.)

**Phase 4 — middleware tightening (last, after handlers are safe).**
`isAuthenticated`: stop treating bare `x-member-id` and `?_m` as authentication signals; require presence of a *credential* (`maia_session` cookie, `x-session-token`, or `?_t`). Still presence-only (edge runtime — no DB), but presence of a token, not a claim. Remove the `x-maia-roles` header trust or fail-closed it.

**Out of scope (preserved, not authorized):** device-bound secrets, signed headers, token rotation — not needed once convergence lands; hold as Cat 1 unless a future threat model demands them.

## 6. Verification gate (per phase)

```bash
# Bare header must now be refused (was 200 pre-patch):
curl -s -X PATCH https://soullab.life/api/maia/living-field/<key> \
  -H 'x-member-id: <valid-member-uuid>' -H 'content-type: application/json' \
  -d '{"expression":"probe"}'          # expect 401

# Session token path must still work (Capacitor parity):
curl -s -X PATCH ... -H 'x-session-token: <valid-token>' ...   # expect 200

# Mismatch claim must be rejected:
curl -s ... -H 'x-session-token: <member-A-token>' -H 'x-member-id: <member-B-uuid>'  # expect 401 + impersonation warn in logs
```
Plus: iOS device smoke via TestFlight/PWA before and after Phase 1; Co-Lab boundary gate (31/31) since member-scoped surfaces are touched; `[auth-posture]` Phase 0 marker shows `match: true` dominance before Phase 1 ships.

## 7. Risks

- **Legacy clients without a session token** — the only real break risk; Phase 0 telemetry is the gate. If a population exists, add a re-auth prompt path before Phase 1, not a header carve-out.
- **`getMemberIdFromRequest` adds a DB query per request** to routes that had none — negligible (indexed single-row lookup), but note for `voice/stream-conversation` hot path.
- **Local variant drift**: `lib/scribe/scribeAuth.ts` and `app/api/account/storage-consent/route.ts` carry their own copies of the resolution logic — fold into the canonical helper during Phase 3 so the posture has one implementation.

## 8. Decision requested from Kelly

1. **Ratify the target posture rule (§4) at the sitting** — including its terminal condition (middleware line gone = the rule fully structural).
2. **One-line go for Phase 0 deploy** — probe is built, branch-only, dev-witnessed, log-only; the observation window runs in parallel while the sitting queue waits, so the data is ready when the ruling lands.
3. Confirm the Phase 1 pairing (Living Field member routes + `admin/monitoring/*` role enforcement in the same commit window) and the 401-not-400 semantics.
