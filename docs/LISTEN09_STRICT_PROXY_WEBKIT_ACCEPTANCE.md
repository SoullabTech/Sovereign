# LISTEN-09 — Strict Proxy + WebKit Integration Acceptance (Web-First)

**Date:** 2026-10-24  
**Scope:** isolated evidence for the existing Soullab Listening Room review source  
**Disposition:** `REVIEW GATES PASSED IN DISPOSABLE HARNESS / PRODUCTION & MEMBER RELEASE HOLD`

## What is new

Building on LISTEN-08's genuine Next.js/PostgreSQL fictional-session tests, this qualification included the *actual Soullab source* for:

- `proxy.ts`, `config/accessMatrix.ts`, `lib/auth/verifiedAccess.ts`, `lib/auth/identityAssertions.ts`, and `lib/writersStudio/canonicalStudioRoute.ts`, pinned from protected `clean-main-no-secrets` at `d5545f9f839d1662a90e97510df6844d8d025f21`.
- The authenticated Listening Room route and React source from the existing `review/listen-03-native-20261024` candidate, including its source-pinned `AUTH_REQUIRED` sign-in redirect.
- Next.js **16.3.8**, React **19.2.0**, PostgreSQL **14.19** (a dedicated fake `members` table and `auth_sessions` with fictional tokens/UUIDs), and a narrow **test-only PostgreSQL adapter** restricted to real session-verification query shapes.

**This is not the whole Soullab application image:** global application layout/providers, installed service configuration, full actual schema, member vault, Caddy, production auth flow, real accounts and native iPhone were intentionally excluded.

## Exact trust-source and test-only edit identities

| Source | SHA256 | Treatment |
|---|---|---|
| Original `proxy.ts` | `362cd67f52b4c9552a7a2b826b9720573191609920ea90e5fa680e7aad1c12d3` | Unmodified in disposable harness |
| Original `config/accessMatrix.ts` | `8142cec628f1aa3f103f2261d82f07c1aee5ee82891cc4b32d0b16b5101f0bf0` | Unmodified baseline tested, then **one exact-rule edit in disposable harness only** |
| Test-only access matrix with exact `/listen` | `ec3d555dc8aa6d036f9ffa74001fa33d455925cf65c61f7cd5f7d2f31ea2898a` | **Not** in protected or review source |
| Original shared `lib/auth/session.ts` | `6e37552f56410dd1e045d570d93b0421aa29a62bf79024b947fc4ac7ee7a20d4` | Still requires Class A platform-owned correction |
| Test-only same-member auth function | `ad8c18c8bea89823b72b53f8eef304b01a21bc97ebc3d44610881802abc20728` | **Not** in protected or review source |
| `app/listen/page.tsx` review candidate | `b7d6661f2ce0ce2062218b50117bd641da3779542ab89cc83fbf59addabd703f` | Verified published source byte-identical to joined test |

## Strict-mode access discovery

The genuine source `ACCESS_CONTROL_MODE=strict` with *no* `/listen` rule returned **404 `no-rule-match`** for valid-cookie, valid-header, and anonymous requests, even when the Listening Room review flag was enabled.

The narrow, **DISPOSABLE** policy amendment consisted of just:

```ts
{ exact: '/listen', minTier: 'free', notes: 'LISTEN09 TEST ONLY — server session required; rights and personal-custody rules stay separate' },
```

No broader `/listen/` prefix or public route was added. With the previously tested **test-only** corrected shared authentication and the original proxy, the result was **13/13 strict-proxy session scenarios PASS**, then **21/21** when additional forged-claim, token-query, mobile-spoofing and adjacent-path negatives were included. Explicit strict-mode scenarios include same-member distinct tokens, revoked and expired dual credentials, empty-but-present credential refusal, tier-cookie forgery refusal and exact adjacent route denial.

**Important provider/URL distinction:** The central proxy's `readSessionCredential` can still read `?_t=` as a query credential for existing SSE uses; the Listening Room page independently refused an otherwise valid query-only token. Global narrowing of `?_t` is a separate Class A program [#1862](https://github.com/SoullabTech/Sovereign/issues/1862); this source review does not silently widen or narrow that transport.

## Actual browsers

1. **Chromium:** source-derived Next interface and fictional authenticated sessions **10/10 PASS**, with no external network requests or page errors.
2. **Desktop WebKit 26.0 (Playwright 1.56.0, cached revision 2215): 24/24 PASS.** The genuinely rendered Next interface with actual strict proxy, fictional PostgreSQL, passphrase-backed AES-GCM export, downloaded backup, cleared/incorrect-passphrase refusal, successful restore, mobile-sized layout, and current-only external music link handling passed.
3. **Local stereo FLAC playback in WebKit:** Browser decoder `readyState=4`, `currentTime≈0.42s`, `paused=false` when tested with a *fictional generated* 24-bit/48 kHz FLAC. This proves local playback advanced, **not** bit-perfect DAC or a long-form mastered recording.
4. **Mobile-sized WebKit:** `390px` viewport and `390px` document scroll width, i.e. no horizontal scrolling for that test frame. This is **not a physical iPhone Safari** or background/lock-screen proof.
5. WebKit observable external requests: **0**; unhandled JS errors: **0**.

Read-back verified replayable scripts:
- [`tests/listening/listen09_strict_proxy_witness.cjs`](../tests/listening/listen09_strict_proxy_witness.cjs)
- [`tests/listening/listen09_webkit_browser_witness.cjs`](../tests/listening/listen09_webkit_browser_witness.cjs)

The WebKit script requires an independently generated *fictional* FLAC via `LISTEN09_FLAC_TEST_FILE`; never provide a member recording. It is intentionally hard-bound to localhost `127.0.0.1:43277`. Access-mode test is explicitly opt-in `LISTEN09_MODE=enabled|disabled`. Both scripts require a running, safely configured disposable Next/PG fixture.

## Feature flag and outer proxy precedence

With `SOULLAB_LISTEN_REVIEW_ENABLED=0` but a strict proxy authenticated rule for `/listen`:

- Anonymous URL returned **307 to sign-in** from the outer proxy *before* the page's internal 404 could run.
- Verified fictional Cookie and header each received **404** from the page.
- **No Listening Room content in any response**.

Thus earlier all-404 expectations apply to the route without outer strict proxy; **do not repeat them as full-proxy findings**. The revised strict proxy witness explicitly tests this safe but different behavior and reports **3/3 PASS**. An owner may decide whether strict consistency of 404 for *all* visitors is a future visibility requirement; it is not authorization to bypass or reorder shared proxy checks.

## Mobile native route decision

The canonical `lib/mobile/mobileAllowlist.ts` source evaluation passed **8/8** assertions:

- `/listen` is **not** in the iPhone, iPad, or Capacitor build allowlist.
- The existing `/open-web` handoff **is** allowed, and its base is `https://soullab.life`.
- `/listen` is also not explicitly named in `WEB_ONLY_PREFIXES`; the existing `MobileRouteGuard` treats unknown routes as web-only. Adding `'/listen'` to prefix-based lists would also match misleading adjacent paths such as `/listener`, so do not indiscriminately widen prefixes.
- **Recommendation:** initial Listening Room should be a mobile-responsive **authenticated web destination**, with an explicit future House `nativePolicy:'web'` doorway and existing `/open-web` bridge only after House/native drift guard and actual source-owner admission. Do not advertise native in-app playback yet.

## Member experience and fidelity boundary

Member-started sound sketches survive switching Chrome tabs in review source. **Navigating to another Soullab route unmounts this Listening Room and stops its local WebAudio player.** Truly continuous ecosystem-wide audio needs a separately accepted global audio-focus/player architecture compatible with MAIA voice and Writer Listen, not removal of cleanup or another duplicate player.

Encrypted collection backups are user-custodied only; no synchronized member vault, all-copy delete/recovery or independent restore authority is accepted. Playlist metadata and provider links are not a commercial recording license. The production rights-policy module still **always denies** unverified music delivery. No Spotify/TIDAL streaming permission, commissioned mastering or artist contract is claimed.

## Security/source-owner integration gate

**Minimum admissible combined-source request**, *after* independent shared-auth approval:

1. Existing platform owner accepts the corrected source pin and 13+8 strict proxy tests for one exact authenticated `/listen` route; deny conflict and invalid dual credentials in actual shared `requireMemberId`.
2. Authorize an isolated combined application image with true `proxy.ts`, full layout, real schema, source-verified user context and synthetic two-member Browser/WebKit tests. This **report is evidence, not that admission**.
3. Keep `SOULLAB_LISTEN_REVIEW_ENABLED` disabled in deployed environments until security, privacy, music rights, Safari/iPhone, accessibility and recovery gates pass; do not expand the beta roster.
4. Subsequently qualify one original licensed long-form recording, audio-source truth/quality, consented optional MAIA guidance and review cross-route audio focus.

**No protected app, shared auth, production database, live member permissions, public flag, deployment, partner contact or music budget was altered for LISTEN-09.** Mac Studio disposable Next/PG services were/will be shut down after this bounded evaluation; fictional fixtures and the screenshots remain in the isolated external drive review location.
