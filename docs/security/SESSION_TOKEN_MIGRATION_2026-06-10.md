# Session-Token Migration — Read-Only Scope

**Date:** 2026-06-10 · **Status:** scope only, **no code changed** · **Prereq for:** DM auth hardening (`DM_AUTH_HARDENING_SCOPE_2026-06-10.md` §5.1a).

> **Why this exists:** hardening the DM routes to `requireMemberId()` (validated session token) today would 401 **9 of 18 DM members** (§5.1a) — they hold no valid `auth_sessions` token. This migration restores real-token coverage *before* the route flip so security-first doesn't become an availability failure.

---

## 1. Where `maia_session='active'` is emitted

- **Sole emitter:** `lib/auth/setSessionCookies.ts:48` — `response.cookies.set('maia_session', session.sessionToken || 'active', …)`. `SessionData.sessionToken` is optional, so any caller passing `{memberId,tier,roles}` without a token emits the placeholder.
- **But `setSessionCookies()` (plural) has no active callers** — grep across `app/`+`lib/` (`.ts`/`.tsx`) returns only its own docstring. *(Grep-negative ≠ proof — confirm before deleting, but no live caller found.)* The `teamRouting.ts` docstring that flagged "`maia_session` is frequently `'active'`" describes the **legacy** path: `setSessionCookies` was the old chain, replaced by `createSession`+`setSessionCookie`. So `'active'` cookies in the wild are **legacy artifacts** (set before the migration, persisting up to the 30-day `maxAge`), not freshly emitted.

**Conclusion:** the placeholder is a *dormant* hazard. The coverage gap is driven by **expiry/turnover** and **possibly unaudited entry paths**, not active emission.

---

## 2. Canonical mint path — sound, and the main routes use it

`lib/auth/serverSessions.ts`:
- `createSession()` (:42) → `generateSecureToken(32)` (64 hex) → `INSERT INTO auth_sessions (...)` → returns `{sessionToken, expiresAt, …}`.
- `setSessionCookie(token, expiresAt)` (:210) → sets `maia_session` = **real token** (httpOnly, 30d).
- `validateSession(token)` (:86) / `requireMemberId()` (`lib/auth/session.ts`) validate it.

**Verified good login paths** (mint real session + set real cookie + return token in body):
| Route | mints | real cookie | returns token |
|---|---|---|---|
| `members/signin` | `:116` | `setSessionCookie :121` | `:168 token:` |
| `members/enter` | `:87` | `setSessionCookie :88` | `:104 session:{token}` |
| `members/email-code/verify` | `:165` | `:173` real | (verify) |
| `members/magic-link` | `:345` | `:353` real | (verify) |
| `members/register-email` | — | `:140` real | (verify) |
| `auth/dev-login` | `:114/236` | real | `:155/274 session:` |

**Unaudited entry paths (likely coverage gaps — audit in Phase A):** `auth/signin/google|apple/callback`, `auth/webauthn/register/verify` + passkey auth, `auth/biometric-session`, `portal/[slug]/client-auth/signin`, `members/register-local`, and the **onboarding / `test-elemental` passkey flow** (members may acquire identity cookies without a server session).

---

## 3. Client already persists + sends `x-session-token`

- **Write:** `components/auth/SignInCard.tsx:47`, `UnifiedAuth.tsx:129`, `UnifiedAuthModal.tsx:52` — `localStorage.setItem('maia_session_token', data.session.token)` (only if the response carries `session.token`).
- **Read/send:** `lib/http/apiBase.ts:421` reads it; `:535` (Safari) / `:606` (native Capacitor) set `x-session-token`.
- **Clear:** `apiBase.ts:356` on signout.

So the iOS/Safari header path is **fully wired** for members who logged in via a token-returning route. Members on the legacy/expired path have nothing in `maia_session_token` → fall back to forgeable `x-member-id`.

---

## 4. Migration design

**Phase A — Close mint gaps (so coverage can't re-erode).**
1. Audit every entry path in §2's "unaudited" list — each must `createSession` → `setSessionCookie` (real token) → return `session.token` in the body. Fix any that set identity without a session.
2. Neutralize the dormant placeholder: make `setSessionCookies.ts:48` **refuse** to emit `'active'` (require a real `sessionToken`, or delete the function once §1's no-caller finding is confirmed). Defensive — it can never silently re-introduce the gap.

**Phase B — Re-mint for existing members (the real coverage work; gap is mostly expiry).**
- **Silent upgrade during the grace window (preferred):** when a member hits an authenticated API with a forgeable-but-existing identity (`x-member-id`/`maia_member_id`/`maia_session='active'`) and **no valid session**, mint a fresh session, set the real `maia_session` cookie, and return the token via an `x-session-token-refresh` response header; a small `apiBase` change captures that header into `localStorage['maia_session_token']`. Zero-friction upgrade for active users. **Safe only inside the grace window** (where `x-member-id` is still accepted) — it transitions identity proof without increasing exposure beyond today's state.
- **Forced re-auth (fallback):** anyone not silently upgraded by the gate date re-authenticates via a §2 good path.

**Phase C — Coverage gate (activity-scoped; see §5 recency).**
Do **not** gate on all-time DM participants — most are dormant (only 3 of 27 expired members active ≤30d) and aren't having DMs to be locked out of. Gate on **active DM members** — those who actually appear in the Phase D `[auth-legacy]` logs (i.e. hit DM routes). Require their valid-session coverage ≈ 100% (active-DM legacy-path use → 0) before flipping to strict. Dormant members re-mint naturally on their next login.

**Phase D — Grace / rollback (reversible until the flip).**
Run the hardened helper in `allowLegacy` mode at the DM routes: accept `x-member-id` but **log `[auth-legacy] { route, memberIdPrefix }`**. Watch the legacy count for the DM population drain to zero, then flip to strict-reject. If coverage regresses, no one is locked out (legacy still accepted) — fully reversible.

---

## 5. Sizing result (2026-06-10, read-only)

| Split | expired-only (re-login/refresh) | never-had a session (entry-path or pre-session-era) |
|---|---|---|
| **All sessionless members (56)** | **27** | **29** |
| **DM-population locked-out (9)** | **6** | **3** |

**Recency of the 27 expired-only:** 3 active ≤30d · **19 in 31–90d** · 5 dormant >90d.

**Read — the migration is ~50/50, not mostly-refresh.** 29 of 69 members (**42%**) have *never* held a server session. That is either **(a) a live entry-path gap** — a path that sets identity cookies without `createSession` — or **(b) historical** members predating the session system who haven't re-logged-in. **Phase A's first task is to disambiguate:** do *recently-active* members lack sessions (→ live bug) or are all never-had old/dormant (→ historical, re-auth clears it)? **Prime suspect for (a): the beta/passkey onboarding path** (`lib/auth/betaSession.ts` + `test-elemental` → `/maia`), which may authenticate via a beta-session that never writes `auth_sessions`. Either way, **Phase A (entry-path audit) is co-equal work**, not a minor follow-up.

**Coverage-gate implication (recency):** only **3 of 27** expired members were active in the last 30 days → **silent refresh-on-contact alone moves coverage slowly** (most sessionless members aren't hitting the API). Don't gate on *all-time* DM members — most are dormant and aren't having DMs to be locked out of. **Gate on *active* DM members** (refined Phase C).

### Living-bug vs historical-scar — RESOLVED: historical (generator effectively closed)

Second read-only pass — does the never-had cohort still regenerate?

| Signal | Result |
|---|---|
| Never-had members created in **last 30 days** | **0** (newest never-had: 2026-05-08; **26 of 29 created >90d ago**; oldest 2026-01-23) |
| New signups (created ≤30d) that never had a session | **0 of 4** — all recent signups have sessions |
| New signups (created ≤90d) never-had | 3 of 17 (all in the 31–90d band) |
| The 3 **DM** never-had members | `last_sign_in` = **NULL** — never signed in (added to DM threads but never authenticated) |

**Verdict (per the fork):** the 29 never-had are a **historical scar, not a living bug.** The session-mint path is **currently working** — every member created in the last 30 days has a session, and no never-had member is newer than ~33 days. *Caveat:* small recent-signup n=4, and 3 never-had fall in the 31–90d band (generator was still producing as recently as early May), so **Phase A becomes a fast confirmation that the current onboarding/beta path mints — not an urgent hunt.** The 3 DM never-had members never signed in → not active DM users, not a real lock-out risk.

**Priority decision (data-inference, SUPERSEDED by §5.2):** ~~prioritize Track 1; Track 2 = historical cleanup~~ — overturned by the Phase A code check below.

### §5.2 Phase A code confirmation (2026-06-10) — ⚠️ REVERSES the inference: the generator is LIVE

The "historical scar" read was tested against the code and **did not hold.** The canonical onboarding path mints **no** session at any point:

- `test-elemental` → `components/onboarding/SacredSoulInduction.tsx` (`handleNewSoul`/`handleRecognizedSoul`) → `POST /api/members/register` → straight to `onComplete`. **No `signin`/`enter` call.**
- `app/api/members/register/route.ts` **inserts the member row only** (`onboarding_step='test-elemental'`) — no `createSession`, no cookie, no token returned. (Contrast: `signin`, `enter`, `email-code/verify`, `magic-link`, `register-email` all mint.)
- No post-register step mints either — `complete-onboarding` + the rest of the chain are grep-negative for `createSession`/`setSessionCookie`/`auth_sessions`; no onboarding component calls `signin`/`enter`.
- `lib/auth/betaSession.ts` is a **client-only `localStorage` cache** (`beta_user`) — it never writes `auth_sessions`. It **is** the legacy session-bypass.

**Therefore every member who onboards via test-elemental lands — and stays — sessionless,** authenticated only by `beta_user` (localStorage) + the **forgeable `x-member-id` existence path**, until they later manually `/signin`. The low recent never-had count (0 in 30d) reflects **low fresh-onboarding volume**, not a closed generator — the next test-elemental onboarder will be never-had.

**Verdict: a LIVE architectural defect (a leaking bucket), not a historical scar.** Corollary security finding (broader than DMs): every freshly-onboarded member is impersonatable via forgeable `x-member-id` until they manually sign in.

**Priority reorder:** **Phase A (close the onboarding generator) is now top-tier, must-fix — ahead of re-minting.** Re-minting existing members while new onboarders keep entering sessionless is the literal leaking bucket. Fix = `register` (or onboarding completion) must `createSession` + set the real cookie + return the token for client storage (or the flow must call `enter`/`signin` after register). Only then do re-mint → coverage gate → DM flip make sense. **DM patch remains held — now behind *two* gates: generator closed AND active-DM coverage proven.**

---

## 6. Dependency

**The DM route flip is blocked on Phase C of this doc.** Do not patch DM routes until `dm_locked_out ≈ 0`. Referenced from `DM_AUTH_HARDENING_SCOPE_2026-06-10.md` §6.

**Nothing patched. Scope for review.**
