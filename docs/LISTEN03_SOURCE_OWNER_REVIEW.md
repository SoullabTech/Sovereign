# LISTEN-03 — Native Listening Room candidate (REVIEW / RELEASE HOLD)

**Prepared:** 2026-10-24. **Owner:** Soullab founder; existing single Soullab source owner / JARVIS Builder controls integration and verification. The current main Mac Studio checkout is heavily dirty; do not copy files into or reset it. Parent issue: https://github.com/SoullabTech/Sovereign/issues/1979.

## Outcome

Native Next.js App Router code for a proposed `/listen` surface, consistent with the existing app's `requireMemberId()` authentication pattern and CSS modules. **Default denies entry** unless server environment has `SOULLAB_LISTEN_REVIEW_ENABLED=1`. This is a review flag, not a subscription entitlement or public rollout permission. It must not be enabled until an independently accepted authenticated test arrangement exists.

The candidate:
- Presents four atmospheric listening journeys and a locally synthesized, member-click-initiated, low-gain sound sketch. This is **not** a complete music player or high-fidelity mastered composition.
- Provides metadata-only, explicit member-supplied Spotify/TIDAL/Apple Music/Qobuz/SoundCloud playlist link shelving; CSV/M3U import; safe external open links; user-initiated JSON export and clear.
- Keeps current collections and journal **only in React state (this tab)**. No implicit analytics, scraping, provider SDKs, accounts, tokens, localStorage or database writes.
- Has a separate server-only rights policy contract with verified master/composition/sample declaration, member entitlement, time, geography and intended use; no known grant = DENY. It does **not** issue playable media URLs or implement signer, royalty reporting or source custody.
- Dispatches the existing `ws-stop-maia-reading` event before playing the sketch; this is *limited* cooperation with Writer Listen if mounted in the same document, NOT fully integrated cross-route audio focus or interruption handling.

## Explicitly omitted / not yet approved

No production media API, rights authority/signer, long-form audio uploads, authentic provider account connection, commercial stream, Feed.fm partner SDK, synced playlists, encrypted journal, member storage, consent/delete/recovery, Cabin offline rights, group listening or AI interpretation. No public navigation link is added to House, Explore, Writer or MAIA.

## Test evidence in isolated review environment

- Native `rightsPolicy.ts` and `portableCollections.ts`: `tsc --noEmit --strict` PASS.
- Node test suite `tests/listening/contracts.test.mjs`: **18/18 PASS** (fictional license grant; fail-closed boundaries; playlist URL host spoofing; CSV/M3U sanitization).
- `app/listen/page.tsx` and `ListenRoom.tsx`: TypeScript transpile syntax PASS; **not a complete Next production build, not authenticated browser acceptance**.
- Earlier Build 02 self-contained portable page (not the native route) retested in isolated Chromium using `set_content` with no network: **16/16 PASS**, including audible AAC progression, track switching, metadata import/export, XSS text rendering and mobile no overflow. The host browser blocks network and file navigation, so that isolated in-memory test is not equivalent to a real deployed browser or Safari/iPhone acceptance.

## Integration sequencing (source owner gate)

1. Freeze protected base commit and resolve exact route/host compatibility. Review this candidate as an **isolated, draft change**, not an automatically admitted build.
2. Review app-wide `MobileRouteGuard`, auth boundary, CSS styling collisions, existing Sound Sanctuary efforts and Writer's `MaiaListen` event/audio focus (do not patch Writer during this step).
3. Replace temporary WebAudio sketches with studio-mastered source assets *only after* independently accepted rights receipts and media custody are established. Record original sample rate, bit depth, loudness and measured playback route.
4. Implement signed, short-lived, server-gated media delivery using trusted persisted grants; ensure license revocation, territory, session entitlement and audit, and no client-controlled license booleans.
5. Persist playlists and journal only once member-owned encrypted data schema, multi-tenant isolation, withdrawal, deletion/non-resurrection and independent recovery authority pass. Authorize source-owner custody before schema writes.
6. Test member journey in the real joined Next runtime with physical PostgreSQL, Safari/iPhone, headphones/DAC/AirPlay/Bluetooth, VoiceOver/keyboard, no unexpected audio mixing, hours-long uninterrupted playback and human listening review.
7. Content legal counsel; independent security/privacy/recovery reviews; founder felt acceptance and separate **GO**. Until then, **RELEASE HOLD**.

## Audio quality doctrine

Unaltered preservation masters first; optional genuine FLAC where source/hardware supports it; honest source vs actual output-route labeling; no artificial upsample claims; dynamic range preserved; no unwanted loudness jumps, clipping or forced processing. An HTML5 audio player test or WebAudio synthesis alone is insufficient to prove hi-res delivery.

## Reproduction

From the isolated candidate directory (Node 22+ with TS strip-types enabled for test runner):

```bash
tsc --noEmit --strict --target es2022 --module esnext --moduleResolution bundler --lib es2022,dom lib/listening/*.ts
node --experimental-strip-types --test tests/listening/contracts.test.mjs
```

No test uses real accounts or secret data. No backend route or cloud setting is modified by the review packet.

