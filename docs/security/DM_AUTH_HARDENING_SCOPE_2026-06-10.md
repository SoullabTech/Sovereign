# DM Auth Hardening — Read-Only Scoping Pass (`team/dm/*`)

**Date:** 2026-06-10 · **Status:** scope only, **no code changed** · **Branch:** investigated on `fix/studio-calendar-timezone-edit` working tree (will get its own branch before any patch).

> Scope was requested as: "switch the DM routes to the existing proven `getSessionMemberId(request)`." **That premise is wrong for this tree** (see §2). The corrected, code-verified plan is below.

---

## 1. The four DM routes — all forgeable

Every `team/dm/*` route authenticates with `getMemberIdFromRequest()` (`lib/auth/getMemberFromRequest.ts`):

| Route | Methods / lines | Auth call |
|---|---|---|
| `app/api/team/dm/route.ts` | GET :8, POST :16 | `getMemberIdFromRequest(request)` |
| `app/api/team/dm/[dmId]/messages/route.ts` | GET :18, POST :40 | `getMemberIdFromRequest(request)` |
| `app/api/team/dm/[dmId]/stream/route.ts` | GET :19 | `getMemberIdFromRequest(req) ?? url.searchParams.get('_m')` |
| `app/api/team/dm/[dmId]/attachments/[attachmentId]/route.ts` | GET :18 | `getMemberIdFromRequest(request)` |

**Why forgeable:** `getMemberIdFromRequest` accepts identity from, in order, (1) `x-member-id` header validated **on existence only** (`SELECT id FROM members WHERE id=$1`), (2) `maia_member_id` cookie (existence only), (3) `maia_session` cookie → real `auth_sessions` lookup. Paths (1)/(2) are forgeable: any known member UUID authenticates as that member. The `[dmId]/stream` route is worse — it also accepts the member id from a **`_m` URL query param** (forgeable + leaks via logs/referer/history).

**Threat = forged authentication defeating real authorization.** `DMService` *does* enforce participant authorization (`SELECT 1 FROM team_dm_members WHERE dm_thread_id=$1 AND member_id=$2` → throws `Not a member of this DM thread` → 403, at `getDMMessages:188`, `sendDMMessage:257`, `markDMRead`, etc.). The bug is purely that the *identity* is forgeable: an attacker sets `x-member-id` to a victim's UUID, **becomes** the victim, and passes the participant check as them — reading/sending their private DMs. Confused-deputy via forged identity.

---

## 2. The helper to switch to — `requireMemberId()`, NOT `getSessionMemberId`

- The `getSessionMemberId(request)` the task named **does not exist** in this tree. The only `getSessionMemberId` (`lib/team/teamRouting.ts:42`) is **no-arg, server-component-only, and self-documents as "PROVISIONAL, NOT HARDENED … identity is forgeable … DO NOT treat as an access boundary"** (inert; nothing imports it). The hardened version lived on the unmerged `fix/colab-channel-auth-impersonation` branch — **not present locally.**
- **The correct canonical hardened helper already exists: `requireMemberId()` in `lib/auth/session.ts`** (exported). It resolves identity as: (1) `maia_session` cookie → `validateSessionToken` (real `auth_sessions`), (2) `x-session-token` header → `validateSessionToken` (Safari/iOS), and its Method 3 comment states the **bare-`x-member-id` path was REMOVED "for security … allowed impersonation attacks."** Throws `AUTH_REQUIRED` if unauthenticated. It uses `next/headers` ambient context, which works inside App Router route handlers (no `request` arg needed).
- Duplicate private `validateSessionToken` implementations exist (`session.ts`, `practitioner/auth.ts:64`, `capture/captureAuth.ts:31`, `middleware/ApiMiddleware.ts:180`) — all the same `auth_sessions WHERE token AND NOT revoked AND expires_at>NOW()`. **No new helper needs to be built.** (Consolidating the duplicates is a separate, optional cleanup — not required for this slice.)
- **Client already supports it:** `lib/http/apiBase.ts` sends `x-session-token` (preferred, from localStorage) and falls back to `x-member-id` (:466–467, :535, :545).

---

## 3. Patch list (DM slice) — gated on §5

Each swap: `const memberId = await getMemberIdFromRequest(request)` → `let memberId; try { memberId = await requireMemberId(); } catch { return NextResponse.json({error:'Unauthorized'},{status:401}); }` (keeps the existing 401 contract).

1. `app/api/team/dm/route.ts` — GET :8, POST :16
2. `app/api/team/dm/[dmId]/messages/route.ts` — GET :18, POST :40
3. `app/api/team/dm/[dmId]/attachments/[attachmentId]/route.ts` — :18
4. `app/api/team/dm/[dmId]/stream/route.ts` — :19 **and remove the `?? url.searchParams.get('_m')` fallback** — **but see §5b first** (SSE clients can't set headers; confirm how the DM stream actually authenticates before removing `_m`, or it breaks live DM streaming).

---

## 4. Verification plan

| Case | Request | Expected |
|---|---|---|
| Forged identity | bare `x-member-id: <victim uuid>`, no session | **401** (was 200 — the fix) |
| Web session | real `maia_session` cookie | **200** |
| iOS/native | `x-session-token: <real token>` header | **200** |
| Authn'd non-participant | valid session for member **not** in the `dmId` | **403** (DMService participant check still fires) |
| SSE stream | authenticated EventSource still connects; forged `_m` no longer grants access | connect / **401** |

Reproduce with the channel PoC pattern (`scripts/repro/colab-auth-poc.ts`): bare-`x-member-id` → expect 401; minted-session → expect 200; non-member session → expect 403.

---

## 5. Two gating items to resolve BEFORE patching (the real blockers)

**(a) Real-token coverage — migration/lock-out risk.** `setSessionCookies.ts:48` sets `maia_session = session.sessionToken || 'active'` — i.e. the literal placeholder `'active'` when no real token exists. `requireMemberId()` rejects `'active'` (not a valid `auth_sessions` token). So **if currently-active team members hold `'active'` (no real token) and their client has no `x-session-token` in localStorage, hardening locks them out of DMs** — an access/sovereignty regression, not just a security win. **Required pre-patch data check:** confirm active team members have real `auth_sessions` rows + that login/onboarding persists a real token to both cookie and localStorage. (Runtime/DB check, not a code edit.)

**(b) SSE stream auth.** Browser `EventSource` cannot set custom headers (no `x-session-token`) and may not send cross-origin cookies — which is *why* the `_m` query-param fallback exists. Before removing it, confirm how `DMView`'s stream client authenticates (same-origin cookie? if so `_m` is dead and removal is safe — the channel fix noted "SSE client never sent it"). If the DM stream genuinely relies on `_m`, removal needs a short-lived stream-token design, not a straight delete.

**Test fixture needed:** a helper that mints a real `auth_sessions` row (real `session_token`) for a test member so the 200 / 403 cases can present a valid token (cookie + `x-session-token`); plus a forged-`x-member-id`-only request for the 401 case.

---

## 5.1 — Gating-check results (2026-06-10, read-only)

### (a) Session-token coverage — ❌ BLOCKED: ~50% of DM users would be locked out

Prod `maia_consciousness`, read-only aggregate counts (no content, no tokens read):

| Metric | Value |
|---|---|
| `auth_sessions` total / **valid-now** (not revoked, not expired) | 330 / **45** |
| Distinct members with a valid session | **13** of **69** members (**19%**) |
| Distinct members with DM threads (`team_dm_members`) | **18** |
| DM members **with** a valid session (not locked out) | **9** |
| DM members **without** a valid session (**LOCKED OUT** by hardening) | **9** |
| Session issuance, last 21d | ~1–4/day (real tokens *are* minted, coverage is just low) |

**Verdict:** flipping the DM routes to `requireMemberId()` today would 401 **half the DM population** on their own threads — an access/sovereignty regression, not a security win. Most members still authenticate via the forgeable existence-only path (`x-member-id` / `maia_member_id` cookie), consistent with `maia_session='active'`. **A session-token migration / forced login-refresh is a hard prerequisite and is its own task *ahead of* the route flip.** Sketch:
1. Fix `setSessionCookies` so an authenticated member never receives `maia_session='active'` — always a real token (cookie **and** localStorage `x-session-token` for iOS).
2. One-time forced re-auth (or silent token-upgrade on next authenticated contact) so the 56/69 members without a valid session acquire one.
3. **Re-run this same query as the gate** — only flip routes to strict once DM-member coverage ≈ 100%.
4. Optional safety: a **grace window** — harden but log-and-allow the legacy path with an `[auth-legacy]` marker, watch it drain to zero, then enforce.

### (b) DM SSE stream — `_m` removal is SAFE; cross-origin is the real constraint

- `components/team/DMView.tsx:58` opens a **native `EventSource('/api/team/dm/${id}/stream?afterTs=...')`** — only `afterTs`, **never `_m`**. No client anywhere constructs `_m` (grep-confirmed); the channel client (`useChannelStream.ts:30`) is identical. **→ Removing `?? url.searchParams.get('_m')` breaks nothing that works today.** It is dead, forgeable code.
- **Can EventSource auth by cookie alone?** *Same-origin web: yes* — native EventSource auto-sends the `maia_session` cookie, so once it carries a real token (blocker a) `requireMemberId()` validates it. *Cross-origin iOS/Capacitor (`capacitor://localhost` → `soullab.life`): no* — native EventSource sends neither cookies nor custom headers cross-origin, and there's no `withCredentials`/polyfill here. The stream is therefore **web-only today** — the forgeable `_m` was the only thing that could have carried iOS identity, and the client never sends it, so iOS DM streaming is already non-functional via this path.
- **Implication:** `_m` removal ships *with* the route flip (no separate work). **But if iOS DM streaming is a requirement,** it needs an **SSE-safe auth path** — a short-lived, single-use, `dmId`-scoped **signed** token minted by an authenticated endpoint and passed in the query string (a real, expiring replacement for `_m`), since EventSource can't carry a header. **Confirm first:** does the iOS app use the DM stream at all, or poll via `apiFetch`? If it polls, the header path already covers it and no SSE token is needed.

---

## 6. Recommended sequencing (revised after 5.1)

The DM route flip is **downstream of a session-token migration** — it cannot ship first without locking out half the DM population.

1. **Session-token migration (own task, hard prerequisite) — scoped in [`SESSION_TOKEN_MIGRATION_2026-06-10.md`](./SESSION_TOKEN_MIGRATION_2026-06-10.md).** The DM flip is **blocked on that doc's Phase C** (coverage gate: `dm_locked_out ≈ 0`). Summary of that scope: the `'active'` placeholder emitter (`setSessionCookies` plural) is **dead/uncalled** — the gap is **session expiry + unaudited entry paths**, not active emission; the mint chain (`createSession`+`setSessionCookie`) and the client `x-session-token` path already work on the main login routes. Migration = audit remaining entry paths → silent re-mint during a grace window (+forced fallback) → re-run the §5.1(a) query until coverage holds, with an `allowLegacy` logging window as the reversible rollback.
2. New branch `fix/team-dm-auth-impersonation` off `clean-main-no-secrets`.
3. Patch the 4 routes (§3) to `requireMemberId()` + remove the dead `_m` fallback (safe per 5.1b).
4. Confirm whether iOS uses the DM stream; if yes, add the SSE-safe signed-token path before relying on the stream for native.
5. PoC + verification (§4); typecheck + targeted tests.
6. Same pattern then extends to `team/admin/*` (priv-esc) and the long tail — separate batches.

**Nothing is patched yet. This is the scope for review.**
