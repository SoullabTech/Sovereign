# Class A — Sign-out access and durable-session truthfulness

**Date:** 2026-10-18  
**Repository:** `SoullabTech/Sovereign`  
**Branch:** `fix/class-a-signout-session-failclosed-20261018`  
**Pinned protected parent:** `6a144edabc686afc9b99828726c214dc7800158f`  
**Verified candidate commit before adding this witness:** `69db4da1a25d2a1072fc5e6d116aa4b1a2f4aada`  
**Classification:** **Class A — Sacred Boundaries (member identity, CSRF, session revocation)** and structurally relevant auth/routing; no schema migration.  
**Disposition:** **Isolated code and fictional tests PASS; independent security review, production merge, staging and release HOLD.**

## Trigger: observed, not inferred

The founder's Wisdom Gather Together lane reached a genuine disposable-PostgreSQL test of the existing member-authentication code. The original source created a durable test founder session and applied the founder gate successfully; **`POST /api/members/signout` returned 404 before its handler** because `config/accessMatrix.ts` had an exact public route for `/api/members/signin`, but none for sign-out while the proxy was in strict mode. Sign-out could not revoke that session.

The same review found a separate potential false-success branch: after a correct password, `app/api/members/signin/route.ts` caught `createSession` failures but still returned `success:true` without a durable session. That was a **source-level bug candidate** before this repair, not a claimed observed production outage.

## Exact bounded source changes

1. **`config/accessMatrix.ts`**: one **exact** `/api/members/signout` public routing declaration. This permits already-revoked/expired users to clear local state but is **not an authentication decision**. No `/api/members` prefix expansion and no founder/Circle permission change.
2. **`lib/auth/signoutRequestPolicy.ts`**, new: exact accepted web Origin(s), including a valid explicitly configured deployment origin; approved native `capacitor://localhost` and `ionic://localhost` only **with an explicit x-session-token bearer**; an Origin-less request must carry a bearer; **`Origin:null` is never trusted**. No prefix-based origins, wildcard CORS or bare member-ID claims. Explicit POST/OPTIONS-only preflight with a small accepted header set and exact allowed origin.
3. **`app/api/members/signout/route.ts`**: checks origin/credential posture **before** any SQL, revokes all presented cookie/header session tokens in one idempotent PostgreSQL UPDATE, clears four auth cookies, and returns `success:true` only once SQL revocation has completed. Revocation failure returns **503** with `success:false`, `serverRevocationConfirmed:false` and expired **local** cookies. Query parameters and untrusted origins fail before writes. The handler does not claim the user’s remote token was invalidated when the DB was unavailable.
4. **`app/api/members/signin/route.ts`**: successful password verification alone is insufficient. Any session creation or cookie-establishment failure now yields **503**, no bearer token and no misleading signed-in response. If the session row was created but cookie establishment failed, the handler **attempts** explicit session revocation and expires access cookies. A failed compensation is logged as **unconfirmed**, not treated as proof of revocation. Rate-limit reset and last-sign-in writes occur **after** successful session establishment. The new failure audit event uses existing typed `signin_failed`; prior `password_signin` events were not rewritten.

### New tests (source-controlled)

- `lib/auth/__tests__/signoutOriginPolicy.node.test.mjs`
- `lib/auth/__tests__/signoutRoute.node.test.mjs`
- `lib/auth/__tests__/signinSessionFailure.node.test.mjs`

The tests are Node built-in test suites running actual new TypeScript source through a disposable TypeScript transpilation seam. No production credentials, user records, video system or outbound connections are required.

## Isolated verification — evidence actually witnessed

**23/23 Node tests PASS** at the pinned candidate revision, including exact production and staging origin comparisons, suffix/prefix spoofing, missing/null Origin, native-only bearer requirements, preflight method/header refusal, web-cookie and Safari/iOS bearer sign-out, cookie expiry, 503 SQL outage semantics, wrongful sign-in success denial, and partial cookie-establishment cleanup.

**Actual Next.js 16.3.8 focus-app Webpack build PASS** with the protected `proxy.ts`, original canonical session/password/audit/rate-limit code and the candidate patched routes. The app used only a **minimal fictional sign-in UI**, not the entire `UnifiedAuth` application.

**Actual disposable PostgreSQL 14.19 HTTP and SQL tests PASS**:

- Fresh separate `initdb` cluster under `/tmp` using private Unix socket on a distinct fixture port **5549**, with **no TCP listener**, no access to existing PostgreSQL 5432 or Docker-owned 5433.
- Two randomly generated fictional bcrypt accounts, no imported member or credential records; original auth-session, rate-limiter and audit-table migrations applied unchanged.
- Wrong/unknown credentials → 401, no sessions; valid fictional founder → 200, genuine PostgreSQL auth-session row, Secure/HttpOnly session cookie; ordinary member → separate valid session and **404** for founder view.
- Exact browser-Origin sign-out → 200 and **PostgreSQL revoked=true**, old founder session → 404; native `capacitor://localhost` with `x-session-token` and no cookie → 200 and durable revocation; Safari `x-session-token` with no Origin/cookie → 200 and durable revocation.
- `Origin:null`, attacker domains, cookie-only missing Origin and cookie-only native Origin → **403 without revoking**. Native POST preflight → 204; null and wrong-method preflights → 403.
- The real proxy continued to strip forged role/tier input. Fictional password-signin audit events persisted.

**Actual WebKit/Safari engine acceptance PASS**, after a key **test-environment discovery**: Safari rejected the real production `Secure` cookie on unencrypted `http://127.0.0.1`. A temporary, self-signed **HTTPS reverse proxy bound only to 127.0.0.1** was introduced, not a relaxation of cookie flags. On HTTPS, WebKit accepted the cookie, displayed the founder-only page, refused an ordinary member, navigated responsively with keyboard, signed out via the actual endpoint, and refused the old token. No external browser requests or JavaScript errors were observed. The final WebKit pass was run after the audit-action type correction was included in the compiled candidate source.

**Targeted independent TypeScript**: The initial candidate introduced one extra `password_signin` error because that historical action value is absent from the existing `AuthAction` union. The new failure event was corrected to the existing `signin_failed` action. The subsequent isolated independent tsc check reported only the **three original protected-source `password_signin` union diagnostics**, with **zero new errors in the sign-out handler, origin policy, or access matrix**. This does **not** assert that the whole canonical repository is type-error-free or that the candidate has passed the full canonical no-regression gate.

**Two intentionally unsafe mutations killed in disposable source**: an `Origin:null` allowance and a `success:true` return after failed session establishment both caused the intended tests to fail. Original test copies were restored, and no mutation entered the branch.

## Important limits and remaining blocking questions

- **Failure-injection boundary:** SQL/database failure 503 semantics passed via the route’s isolated query stub; a further attempt to force a real PostgreSQL session-insert fault was blocked by safety controls. Do **not** call genuine database-insert failure acceptance complete. The production-shaped 503 / cookie-compensation state still requires a separately authorized fault-injection witness.
- **Current UI semantics:** Existing MAIA and Studio sign-out callers `apiFetch('/api/members/signout')` then clear client auth state without necessarily distinguishing **HTTP 503** from confirmed server revocation. If SQL is unavailable, a stolen header token could remain valid after the UI says “signed out.” This is **not resolved by adding a truthful 503 response alone**. Review/repair the consumer acknowledgement contract before any release.
- **Cookie compensation:** An isolated handler test shows a failed access-cookie setup leads to 503 and best-effort DB revocation/cookie cleanup. The effect of a *real partial Next cookie-write failure* has not been independently demonstrated. Compensation can itself fail and is intentionally described as unconfirmed.
- **Native physical tests:** Capacitor/iOS origin plus valid header was witnessed in HTTP and preflight fixtures, **not a physical iPhone WebView**. The native allowed set is purposefully narrow; do not widen it via `Origin:null` or wildcard settings.
- **Exact protected parent:** The review branch was created from protected commit `6a144ed...`. The protected branch may advance; current conflicts, security policies and tests must be reconciled at the exact promotion commit before contemplating a merge.
- **Broader security:** This candidate does not address the general MAIA Sanctuary source-of-truth issue, Circle cohort release, multi-person video, keeper rights or intellectual property.
- **No full product rollout:** These focused browser and SQL tests do not equal full Soullab product build, staging acceptance, audit/monitoring verification, HTTPS certificate custody review, or real-member field release.

## Proposed independently reviewed acceptance before any merge

1. Reconcile exact source with updated canonical and open an explicitly **draft Class A review**.
2. Review strict `/api/members/signout` route admission and actual CORS/native WebKit behavior; independently scrutinize Origin-missing `x-session-token` bearer authorization, null-origin refusal, cross-site user interaction and the method/header preflight allowlist.
3. Run real PostgreSQL **failure injection and recovery**, including session insert failure, partial cookie failure, signout revocation failure and retry, and explicit no-phantom-token responses.
4. Review/fix **every sign-out consumer** that would currently treat a 503 as harmless local cleanup. Never claim global sign-out complete until DB revocation is established.
5. Run current canonical **governed no-regression type-health**, focused auth/whoami/proxy/mobile tests, full build, iPhone physical native acceptance and isolated staging with fictional accounts.
6. Obtain founder approval for promotion only after these independent gates; then observe the real founder’s separate authenticated staging login. No merge, deploy, member invite or production schema action is implied here.

**Disposition: SOURCE CANDIDATE AND FICTIONAL TESTS VERIFIED; CLASS A INDEPENDENT REVIEW AND RELEASE HOLD.**
