# Stage L — Next.js 16 proxy and founder session: isolated integration witness

**Date:** 2026-10-18 EDT  
**Research branch:** `research/glenn-perry-wisdom-candidate-20261017`  
**Protected reference commit inspected:** `6a144edabc686afc9b99828726c214dc7800158f`  
**Gather Together research source pin:** `b316e70627d03ca79ed3eebbbafcf9073961f41e`  
**Verdict:** **Integrated, reduced-scope Next.js 16 test passed. Real founder authentication and production release remain CLOSED.**

## Important version correction

The protected repository **now declares Next.js 16.3.8** and implements the central request policy in `proxy.ts` (not `middleware.ts`). Earlier Stage K assumptions about completing a Next.js 15.5.11 application build are therefore outdated. Stage L used the **actual protected Next.js 16 request source**, along with the protected session and founder authorization code.

The access matrix contains `{ prefix: '/wisdom-keepers', public: true }`. Consequently the general proxy short-circuits member authentication for a Wisdom page but sanitizes asserted identity headers. The narrower, staged Gather Together page independently calls `requireFounder()` and refuses without a valid server-side founder session. Both layers were exercised together; **the public matrix prefix itself is not a founder gate**. Adding any more-specific defense-in-depth matrix rule would be a separately scoped change, not performed here.

## Exact-source local Next.js integration

An isolated application was built on the founder's authorized Mac Studio under:

`/tmp/soullab-gather-next16-proxy-chain-20261018-r1`

The following **unchanged protected source files** were byte-for-byte checked against the pinned protected commit: `proxy.ts`, `config/accessMatrix.ts`, `lib/auth/identityAssertions.ts`, `lib/auth/verifiedAccess.ts`, `lib/auth/serverSessions.ts`, `lib/auth/passwordUtils.ts`, `lib/founder/founderAuth.ts`, and `lib/writersStudio/canonicalStudioRoute.ts`.

The three staged Gather Together files were byte-for-byte checked against the pinned research revision: its page, React component, and read-only data module.

Only test infrastructure was invented: a minimal `/signin` screen, a fictional session issuer on a locally public auth-test endpoint, a protected read-only request-context page, and **a non-network database adapter** that returns ephemeral, HMAC-verified fictional session/member records. The adapter cannot reach PostgreSQL or any external service. No existing Soullab real member ID, password, database URL, cookie secret, provider token, email or production connection was read or copied.

An **optimized Next.js 16.3.8 Webpack build passed**, including TypeScript checking. The compiled route listing explicitly included **`ƒ Proxy (Middleware)`** along with the actual Gather Together page. This validates a focused real Next.js integration, **not** the full main Soullab application with all of its routes and dependencies.

## Real HTTP boundary checks — passed

Using the loopback-only local test server, direct HTTP requests confirmed:

- Anonymous request to Gather Together: **404**; anonymous request to a genuinely member-gated fixture route: **307 sign-in redirect by the real proxy**.
- Authenticated ordinary fictional member: **404** for Gather Together; **200** for the member-gated test route, with proxy-forwarded `authenticated=true`, tier `free`, roles `member` from the fake database.
- Authenticated allowlisted fictional founder: **200** for Gather Together; the actual Stage J user-facing review component renders.
- Forged administrator/tier headers do not override the server-derived member role or tier.
- A conflicting member-id claim against a valid member session is refused at the proxy boundary.
- Revoked and expired fictional session tokens, and a session whose named member row is absent, each result in **404** at the founder page.
- Forged founder headers, query parameters and unsigned session values do not grant access; signing out removes access.
- The isolated token-issuing fixture refuses foreign and `Origin:null`, missing required local test-action headers, invalid roles and nonlocal hostnames.

## Actual running WebKit — passed

Playwright WebKit (Safari engine) exercised the **running compiled Next.js server**, not a component-only static bundle:

- Anonymous access denied; ordinary member refused founder entry but admitted to the member route.
- Fictional founder admitted to the Gather Together React experience and could move among the four stages.
- Local sign-out denied the next founder-page request; revoked fixture refused.
- Mobile-sized Safari viewport supported keyboard activation and no horizontal overflow.
- Browser tests observed **no page JavaScript errors or external HTTP requests**.

A first sign-out test read the route during a cookie-update race. It was corrected to wait for cookie deletion; the final browser suite passed without changing any production authentication source.

## Independent kill-switch and native checks — passed

A second isolated Next server launched with the preview feature flag disabled: **404 even for the valid fictional founder token**. Another separate test server with native build mode enabled also returned **404 with the preview flag enabled**. Both short-lived test servers were shut down.

The integrated test process listened at **127.0.0.1:3819 only** and was shut down after verification. Ports 3819, 3820 and 3821 were confirmed closed. The previously established visual founder-review app at **127.0.0.1:3817** remains available on that Mac Studio without modification.

The original Mac Studio Soullab worktree remained clean. No protected branch, production settings, Commons Circle permissions, member records, keeper invitations, source-admission rules, meeting service or deployment was touched.

## Outstanding security and release gates

1. **Full product integration**: a truly isolated build of the entire current Soullab Next.js 16 application, including the real login UI, all middleware/proxy and layouts, and compatibility with the canonical branch, has not been completed.
2. **Database custody**: Stage L used a purposefully fake SQL adapter. Actual staging session persistence, revocation, cleanup and any audit writes need distinct isolated-backend verification; no production database should be used as a shortcut.
3. **Real founder session**: the founder has not logged into this build through their actual Soullab account. Do not use temporary fictional cookies, display text, query parameters, imported production credentials or `FOUNDER_MEMBER_IDS` modifications to manufacture proof of real identity.
4. **Access-matrix discipline**: the broad Wisdom `public` prefix is still the inherited outer declaration, while the narrower founder route is server-gated. Consider an exact, independently reviewed matrix declaration if this feature is promoted, without weakening the member-facing Wisdom room.
5. **Feature readiness**: the preview remains default-off in the research source, and the real Circle cohort gate, private multiperson video, recorded-consent custody, keeper participation and copyrighted knowledge admission remain closed.
6. **Canonical reconciliation**: the long-running Perry research branch diverges from protected canonical. No blind merge/rebase or release promotion is implied by these local tests.

**Next safe action:** a separately reviewed full-app integration candidate using the latest protected Next.js 16 source and a disposable non-production backend, followed by a real founder-only staging sign-in after independent privacy/security review.

**Disposition: Stage L focused real Next.js 16 integration PASS; live authority and release HOLD.**
