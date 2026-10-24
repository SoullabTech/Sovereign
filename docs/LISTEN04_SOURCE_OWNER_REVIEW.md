# LISTEN-04 — bounded local audio and member-library restore review

**Status:** Review-only amendment to LISTEN-03, no production changes, source-owner acceptance required. Date: 2026-10-24.

## Delta and reason

1. Browser-selected personal audio via a temporary Blob URL: native accessible controls, source label, no network upload, no commercial third-party API, no recording capture. Supports `.flac`, `.wav`, `.mp3`, `.m4a`, `.aac`, `.ogg`, `.opus` subject to browser decoding. Local playback is not permission for hosted streaming or public circles.
2. Explicit JSON shelf restore from Soullab's own exported format: full revalidation, 5 MB input cap, 30 collections max, 1,000 track references per collection, no arbitrary external URLs, no imported provider claims, no automatic browser/account persistence.
3. Playback exclusivity for the two LISTEN surfaces: selecting personal audio stops the WebAudio sketch; starting the sketch pauses personal audio. Existing Writer STOP event is sent on local play but is not equivalent to cross-route shared audio focus.
4. Recording-rights **fail-closed correction**: formerly, a text-only evidenceRef could produce a false `allowed: true`. Now even an apparently complete fictional rights claim returns `INDEPENDENT_RIGHTS_AUTHORITY_REQUIRED`. No signer or delivery capability exists, and no member stream is issued.
5. Reviewed feature flag, authentication and HTML no-index remain unchanged. No new persistent member data, schema, billing, provider OAuth, AI interpretation, or other Soullab route is modified.

## Evidence

- Node policies and portability: **28/28 PASS**, including forged evidence and sanitization.
- Auth page isolated mocked runtime: **3/3 PASS** (disabled 404 before auth, rejected auth, fictional member permitted only with flag). This is **not** actual Next.js+PostgreSQL integration.
- Source syntax/structure **16/16 PASS**; pure TypeScript strict noEmit passes. Full integrated TSX type-check and Next build still pending.
- Chromium local audio codec witness **PASS** with a newly synthesized 3-second FLAC Blob URL, playback time advancement, pause and **zero network requests**. This is a browser decoder witness, **not** proof of bit-perfect hardware audio or a running Next route.
- Old Build 02 portable browser **16/16 PASS**, not a substitute for joined native acceptance.

## Nonwaivable gates

The source owner must decide source admission and build slot. A real authenticated Next.js runtime with current app middleware/guards and physical devices must be tested. Rights provenance/custody must be independently verified with anti-resurrection and revocation checks before streaming service integration. Member data encryption and proper deletion authority must be approved before persistent playlists/journals. Audiophile review requires original masters, end-to-end delivery and DAC/Bluetooth/AirPlay tests. Production and member beta remain HOLD pending separate founder GO.

## Reproduction

From the candidate source tree, using Node 22+, TypeScript and optional ffmpeg + Python Playwright/Chromium for browser decoder test:

```bash
node --experimental-strip-types --test tests/listening/contracts.test.mjs
node --test tests/listening/page_authentication.test.cjs
node tests/listening/source_integrity.cjs
tsc --noEmit --strict --target es2022 --module esnext --moduleResolution bundler --lib es2022,dom lib/listening/*.ts
python tests/listening/device_local_audio_browser.py
```

**No live commercial recording, provider credential, private member record or production route is exercised by this suite.**
