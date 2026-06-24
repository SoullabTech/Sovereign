# Onboarding Session-Mint Fix — Exact Patch Scope (read-only)

**Date:** 2026-06-10 · **Status:** scope only, **no code changed** · **Closes:** the live generator in `SESSION_TOKEN_MIGRATION_2026-06-10.md` §5.2.
**Dependency chain:** **onboarding session mint (this doc) → active-member coverage → DM auth hardening.** No route flip, no DM hardening, no broad cleanup here.

---

## 1. Confirmed canonical path (the generator)

`/test-elemental` → `components/onboarding/SacredSoulInduction.tsx` (`handleNewSoul` :309 / `handleRecognizedSoul` :377) → `POST /api/members/register` → `setServerMember(data.member)` + writes `beta_user` to `localStorage` → `onComplete` → later onboarding → `/maia`.

`app/api/members/register/route.ts` **inserts the member row only** (INSERT :201, `onboarding_step='test-elemental'`; `member` :226; returns `{member}` :251) — **no `createSession`, no cookie, no token.** Nothing after register mints. Result: the member authenticates only via `beta_user` + the forgeable `x-member-id` path until they manually `/signin`.

## 2. Sibling-path audit (item 4)

| Route | Mints a session today? | Action |
|---|---|---|
| `members/register` (test-elemental) | ❌ **no** | **FIX (primary)** |
| `members/register-local` | ❌ **no** (stub-ish; INSERT :81, no mint) | **co-fix / fast-follow** (2nd generator; lower traffic — `SyncAccountPrompt`) |
| `members/register-email` | ✅ yes (`:128–149`) | **template — copy this** |
| `members/email-code/verify`, `members/magic-link` | ✅ yes | none |
| `members/signin`, `members/enter` | ✅ yes | none |
| `auth/{apple,google}/native-callback`, `auth/signin/{apple,google}/callback` | ✅ yes (`createSession`+`setSessionCookie`) | none |
| `auth/google/callback`, `auth/microsoft/callback` | ⚠️ no `createSession` match — **verify separately** (not the test-elemental path; out of this scope) | note only |
| `team/invite/[token]/register`, `nostr/register`, `events/[slug]/register`, `practitioners/onboarding`, `youth/tier` | not the member-onboarding path | out of scope |

So the member-onboarding never-had generator = **`register` (primary) + `register-local` (secondary)**.

## 3. Safest mint point (named)

**Server-side, inside `register/route.ts`, immediately after the member INSERT is confirmed (after `const member = result.rows[0]`, :226) and after the existing invite-redemption block (:231–249), on the outgoing response, wrapped in a non-fatal `try/catch`** — byte-for-byte the proven `register-email` pattern. This is the moment identity is created; the server leaves the member authenticated. No client follow-up call (skippable/race-prone, per the decision).

## 4. Exact patch

### 4a. `app/api/members/register/route.ts` (primary)
Add `import { createSession } from '@/lib/auth/serverSessions';`. Replace the final `return NextResponse.json({ success, member:{…} }, { headers: corsHeaders })` (:251) with **mint-then-respond**:

```ts
// Mint a real server session so the member is authenticated immediately —
// no reliance on localStorage beta_user. Non-fatal: member is already created.
let sessionForBody: { token: string; expiresAt: string } | null = null;
const responseInit = { headers: corsHeaders };
let response: NextResponse;
try {
  const userAgent = request.headers.get('user-agent') || '';
  const session = await createSession({ memberId: String(member.id), ipAddress: clientIP, userAgent });
  sessionForBody = { token: session.sessionToken, expiresAt: session.expiresAt.toISOString() };
  response = NextResponse.json({ success: true, member: { /* unchanged fields */ }, session: sessionForBody }, responseInit);
  const cookieOpts = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/', expires: session.expiresAt };
  response.cookies.set('maia_session', session.sessionToken, cookieOpts);   // REAL token — never 'active'
  response.cookies.set('maia_member_id', String(member.id), cookieOpts);
  response.cookies.set('maia_tier', 'free', cookieOpts);
  response.cookies.set('maia_roles', JSON.stringify(['member']), cookieOpts);
} catch (sessionErr) {
  console.error('[MEMBERS] Session creation failed (non-fatal):', sessionErr);
  response = NextResponse.json({ success: true, member: { /* unchanged fields */ } }, responseInit); // degrade: member created, no session
}
return response;
```
Notes: mint runs **after** invite redemption (preserve :231–249 untouched); `members.id` FK is satisfied (member already inserted). `register` already CORS-allows `capacitor://localhost`, so iOS hits this route — hence the **token in the body** (for the `x-session-token` path), which `register-email` omits.

### 4b. `components/onboarding/SacredSoulInduction.tsx` (client — required for iOS)
After both register calls (:332 and :400), store the returned token so native (`x-session-token`) works, mirroring `SignInCard`/`UnifiedAuth`:
```ts
if (data?.session?.token) localStorage.setItem('maia_session_token', data.session.token);
```
Web is already covered by the httpOnly `maia_session` cookie; this line covers Capacitor/iOS.

### 4c. `app/api/members/register-local/route.ts` (secondary — same pattern)
Apply the same mint block after its INSERT (:81). Lower priority (stub-ish, `SyncAccountPrompt` only) — co-fix or fast-follow; **not** bundled with broad cleanup.

## 5. Verification (the required list)

| Check | How |
|---|---|
| new register creates an `auth_sessions` row | after `POST /register` (fresh `SOULLAB-*`), assert `SELECT count(*) FROM auth_sessions WHERE member_id=$1 AND revoked=false AND expires_at>NOW()` = 1 |
| `maia_session` cookie is a **real token, not 'active'** | assert `Set-Cookie: maia_session=` is 64-hex and ≠ `active` |
| response carries token for `x-session-token` | assert body `session.token` present; client sets `localStorage['maia_session_token']` |
| invite redemption still works | register with a pending invite → `invites.status` → `redeemed` |
| `register-email`/`signin`/`enter` unchanged | no diff to those files |
| no account-enumeration regression | the 409s ("passkey used" / "username taken") are **pre-existing** and unchanged; mint fires only on success → no new signal |

## 6. Tests
- **Integration** (`__tests__`): fresh-passkey register → 200 + real `maia_session` cookie + body `session.token` + 1 valid `auth_sessions` row. Duplicate passkey → 409 (unchanged). Pending-invite register → invite redeemed. Session-mint failure path → still 200 with member, no session (degrade).
- **Component**: SacredSoulInduction stores `maia_session_token` after register.
- **Prod gate (post-deploy):** re-run `SESSION_TOKEN_MIGRATION` §5.1a — confirm **no new `never_had` members appear from `register`** (generator closed), and `dm_locked_out` trends down as members re-auth.

## 7. Out of scope (held)
No DM route flip. No `setSessionCookies`-plural deletion. No re-mint batch. No OAuth `google/callback`/`microsoft/callback` audit. Those are downstream of this fix landing + coverage proving out.

**Nothing patched. Patch plan for approval — the safest mint point is named (§3).**
