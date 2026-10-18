# Stage I — Wisdom Gather Together: real local browser preview

**Date:** 2026-10-18 EDT  
**Source:** `SoullabTech/Sovereign`, isolated branch `research/glenn-perry-wisdom-candidate-20261017`, **source pin** `f6c3efbf65807bdfba84dfedbdaec2267a63db3d`  
**Status:** **Local Mac Studio founder review is running; no deploy, merge, beta rollout, external account, recording, or real member access.**

## What was actually built and started

A small *independent* Next.js application was created at

`/tmp/soullab-wisdom-gather-preview-20261018-v1` on Kelly's authorized Mac Studio.

Its source contains these four files copied **unchanged** from the pinned research branch:

- `app/wisdom-keepers/wisdom/gather-preview/page.tsx` (real server-gated founder page)
- `components/wisdom/WisdomGatherFounderPreview.tsx` (interactive UI)
- `lib/wisdom/wisdomGatherPreview.ts` (fictional four-stage content)
- `lib/founder/founderAuth.ts` (genuine server-side allowlist algorithm)

The local build replaces **only** `lib/auth/serverSessions.ts` with an isolated, stateless fictional HMAC-cookie session adapter, and adds a small local fixture sign-in, test identity page, temporary project files and strict response headers. It does not import or run Soullab's database, real member session provider, Circle APIs, Gemini/Claude/MAIA LLM clients, commercial payment services, scheduling, video, LiveKit or production configurations.

**Preview URL (Mac Studio Safari only):** `http://127.0.0.1:3817/fixture`. Click **Enter as fictional founder**. This is a *local demo account*, not a Soullab founder login or active keeper room. On the Mac Studio, the restricted Next server listens at `127.0.0.1:3817` only. The preview intentionally is **not** exposed to phones, other computers, the LAN, or `soullab.life`.

The local fixture's `MAIA_WISDOM_GATHER_PREVIEW_ENABLED=1` flag exists **only in the private disposable app's local environment**, not production. The branch's default-off server source is unchanged. Local demo session cookie is HttpOnly, SameSite Strict, HMAC-authenticated, short-lived, and intentionally separate from any real Soullab cookie. No passwords, real member IDs or production tokens are used.

## Build and browser evidence

- Optimized **Next.js 16.3.8 production-mode build + targeted full-project TypeScript check** passed in the standalone app, using Webpack. The first Turbopack attempt refused an external `node_modules` symlink; switching to the supported Webpack bundler in the **isolated preview only** resolved it. Soullab's primary source currently uses Next.js 15.5.11; **this is not qualification of its complete app build**.
- Real localhost HTTP: 200 for the fixture, 404 for unauthed or fictional visitor on the protected page, 200 for a signed-in fictional founder, 404 for malformed/forged session, 403 for cross-origin or invalid-host sign-in, and 404 after sign-out.
- Actual Playwright **WebKit against this running Next.js server**: anonymous denied; fictional visitor denied; fictional founder entered; React client stage-selection/hydration; honest no-event copy and official-author links; sign-out refusal; mobile 390px keyboard and overflow; **zero external browser requests and zero page JS errors**.
- Separate real-running Next server with `MAIA_WISDOM_GATHER_PREVIEW_ENABLED=0`: even a valid fictional founder's cookie received a 404. The disabled-flag process was shut down after the negative check.
- Live listener and accessibility check: service is bound to `127.0.0.1:3817`; attempting to connect via Mac Studio interfaces `en0` and `en1` failed. No LAN binding.
- A browser test initially exposed WebKit's `Origin:null` when the fixture used a `no-referrer` response policy. The isolated fixture now uses `Referrer-Policy:same-origin`, retains exact same-origin POST and Host checks, and restricts browser `connect-src` to `self`. A client-only local session action avoids Next/Safari native-form redirect caching. **The copied actual Gather route and founderAuth source were never modified for this repair.**
- The original Mac Studio `/Users/soullab/MAIA-SERVICE-FIRST-20261013` worktree stayed clean throughout. No code written to the canonical protected branch, no production service reload, no actual member/session use.

## Truthful limitations

This is **not** a deployment of the real platform or a real Soullab founder-auth acceptance: the local session *provider* is fictional. It is a running standalone rendering of the **actual copied founder gate/UI** plus carefully bounded fixture infrastructure, not the exact Next.js 15.5.11 integrated application.

No keeper is approved or present. Glenn Perry has not been contacted or licensed. No member has joined a Circle; its normal v1 UI and API remain founder-restricted. The on-platform hybrid/video stack is not attached; multiperson privacy, remote audio and recording controls remain untested. No invitation or meeting exists.

## Next human and engineering acts

1. **Founder reviews the live local UI** in Safari via the address above and chooses what feels right or needs refinement. It is intentionally safe to click through.
2. Once approved, integrate the smallest `Gather Together` doorway into a specifically reviewed combined Next.js 15.5.11 candidate and verify native-bundle exclusion, server session, cookie and member identity behavior with fictional accounts.
3. Separately qualify the named Circle cohort authorization and existing on-platform multiperson video bridge; test host permissions, isolated membership, guest denial, consent, revocation, recording and data custody before any real invitation.
4. Do not invite a wisdom keeper or announce a gathering without separate human consent and founder authorization.

The local process can be stopped without changing source or production. The `/tmp` preview and its credentials are intentionally temporary and may disappear on restart or system cleanup.

**Disposition: real local Next.js/WebKit fictional preview PASS; member release remains CLOSED.**
