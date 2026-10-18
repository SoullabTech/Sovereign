# Stage J — Founder review is real; the local identity is a fixture

**Date:** 2026-10-18  
**Research branch:** `research/glenn-perry-wisdom-candidate-20261017`  
**Exact committed review UI/test source:** `50776b6e177ae4f05ff6661ce06fef8535117323`  
**Authorized act:** Founder requested continued review and clarified, **"I am the real Founder."** No production access or release approval was inferred.

## A necessary semantic correction

The member-facing preview had described the experience as **"Founder-only · Fictional experience · Not open"** and its isolated Mac Studio sign-in button said **"Enter as fictional founder."** This conflated the real human reviewing the work with the **temporary, simulated authentication principal** used in an isolated verification harness.

Two distinctions now govern the review:

1. **The founder is real.** The work, authorship, founding authority and responsibility belong to the actual Soullab founder. The *shared committed UI* now displays **"Founder review · Interactive prototype · Not yet open"**, with revised orientation that invites genuine design review.
2. **The local authentication is still simulated.** It does not validate the real founder's Soullab membership. The stand-alone Mac Studio preview uses its own short-lived, signed, fictional session to exercise the **real server-side `requireFounder()` allowlist algorithm** without contacting actual members, PostgreSQL, session tokens, Studio or production services. On this local-only fixture, visible buttons now read **"Open founder review"**, **"Check visitor restriction"**, **"Leave preview"**. The landing page explicitly explains the local test-session boundary.

Neither of these is a license to mark a guest or an arbitrary request as a real founder. Genuine production or staging authentication requires a real **verified Soullab server session plus the actual `FOUNDER_MEMBER_IDS` server-side allowlist**. Query strings, fake `X-Founder` headers, admin/practitioner client labels, screenshots, personal assertion and test cookies are **not** acceptable substitutes.

## Exact work and evidence

**Committed to the isolated research branch:**

- `components/wisdom/WisdomGatherFounderPreview.tsx`: revised badge and review-purpose copy. All existing inactive-Circle, non-recording, keeper-identity and no-member-access boundaries remain legible.
- `stage-h-gather-placement-webkit.test.mjs`: asserts the status says **Founder review** and **Interactive prototype**, not **Fictional experience** or **fictional founder**.
- **Five of five** real WebKit tests passed against the exact modified committed component.

**Local Mac Studio preview only** (not added to repo or deployed):

- `/tmp/soullab-wisdom-gather-preview-20261018-v1`: copied the exact committed Stage J UI at `50776b6e...` while keeping the previously verified founder gate, original static journey content, and `lib/founder/founderAuth.ts` byte-identical with the same branch.
- Updated only the isolated fictional sign-in screen/button labels and disclosure. No auth bypass, real credential, member ID or database was added.
- Rebuilt the standalone Next.js 16.3.8 application with an optimized Webpack production build and passing TypeScript check. **This is not the full Soullab Next.js 15.5.11 app build.**
- Real WebKit, against the actual running localhost Next server, passed: anonymous 404; fictional visitor 404; fictional founder 200; actual React hydration and 4-step navigation; Content Security Policy; sign-out 404; keyboard/mobile no-overflow; no external browser requests or page JS errors. The local test reuses a fictional HMAC cookie; it does **not** establish that an actual member account has been authenticated.
- Additional live HTTP probes rejected `X-Founder:true`/`?founder=true` without a verified session, fake founder headers on a visitor cookie, and malformed session cookies. All returned 404. The route remains listening on **127.0.0.1:3817** only.
- All four pinned source files (route, preview component, static journey source, real founder allowlist helper) matched their exact GitHub source SHA-256 contents. Original Mac Studio production worktree remained clean; private fixture env file had mode 600.

**The preview address remains:** `http://127.0.0.1:3817/fixture` in Safari **on the Mac Studio only**. The sign-in says **Open founder review** and is candid about the temporary test credential. No changes to the real `soullab.life` interface, production settings, Caddy policy or member accounts.

## The real-founder authentication transition (next security gate)

The existing branch page at `app/wisdom-keepers/wisdom/gather-preview/page.tsx` **already calls** the real `requireFounder()` and refuses unless the server-only `MAIA_WISDOM_GATHER_PREVIEW_ENABLED` flag is exactly `1`; it also excludes static native export. The deployed/combined app still needs separate acceptance:

1. Reconcile the research branch against the latest protected canonical source; do not blindly merge this long-lived divergent branch.
2. Compile/test the exact integrated Soullab Next.js 15.5.11 application, including real middleware, cookie/path behavior, the `getCurrentSession` provider, and `requireFounder()` at the intended route.
3. Run **fictional-account** testing against the isolated full app and a disposable backend first: valid allowlisted fixture principal; invalid/unallowlisted; missing/malformed/expired cookie; CSRF/origin posture; correct WebKit and native exclusion.
4. Only then, under a **separately authorized non-production founder review** with proper security boundaries, permit the actual founder to authenticate through Soullab's real sign-in and verify the founder session. Do not ask for a password in chat, extract cookies, copy production tokens into local tests, or change the allowlist to manufacture permission.
5. Release to actual beta members, connecting Commons Circle access or starting real meetings requires **additional independent decisions**. The Perry source remains unadmitted and he remains an unaffiliated referenced author.

**Disposition:** Founder status in copy is corrected, the local demo remains truthful about its fixture, and no real member or production credential was touched. The next act is authentic founder staging acceptance—not removing the authentication gate.
