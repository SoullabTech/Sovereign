# LISTEN-07 — real React UI Chrome acceptance, source pin and limitations

**October 24, 2026 · Isolated review evidence · Member release HOLD**

## What was physically tested

The **actual React source components** from the existing Listening Room review branch were bundled into a disposable local Chrome page on Kelly's Mac Studio, without invoking Next.js routing or loading real Soullab member sessions.

Source pin **`f8c32c7c7641abc41c0496046ae97a2a05db2372`** before adding the new reproducibility tests. React 19.2.0 + esbuild 0.25.12; isolated Chrome harness with `puppeteer-core`. `*.module.css` imports were deliberately replaced by a small class-name identity shim and a **testing-only** layout stylesheet. **Therefore this is a functional React UI test, not a production-design pixel acceptance.**

A fictional **4-second stereo FLAC** was synthesized with FFmpeg at **24-bit / 48 kHz**; no commercial sound recording, artist master, credential, provider SDK, member data, network music stream or production database was involved.

## Results: 24/24 checks PASS

- React room mounts; browser secure context supports WebCrypto; changing mood updates the chosen journey.
- Journal editable, Spotify playlist link safely saved, query parameters stripped; malicious `javascript:` link refused.
- Fictional CSV playlist metadata imported; embedded literal `<script>` stays inert text.
- Mismatched backup passphrases refused; valid AES-GCM private backup generated, and plaintext playlist names/journal absent from ciphertext.
- Passphrase input fields cleared following successful export.
- Clear removes the collection and journal; incorrect passphrase does not restore; correct passphrase restores both; passphrase cleared after successful unlock.
- Real browser **FLAC decoded and playback advanced** (currentTime ~0.35 s, `readyState=4`); activating Soullab's sound sketch pauses the local file; explicit sketch Stop works.
- **Zero nonlocal browser network requests** and **zero JavaScript page errors** observed during the test.

The first automated attempt stalled after wrong-passphrase refusal because Puppeteer keyboard selection appended the corrected passphrase. The harness was corrected to use the native input-value setter and a bubbling `input` event; after correction, the same source code passed all 24 checks. This was a **test automation flaw**, not a source-code repair.

## Reproducible review-only tools committed to this branch

- `tests/listening/listen07_fixture_builder.cjs`
- `tests/listening/listen07_component_browser_witness.cjs`

These require Node 22+, Google Chrome, ffmpeg, and a **temporary** toolchain with `react@19.2.0`, `react-dom@19.2.0`, `esbuild@0.25.12`, `puppeteer-core@24.27.0`.

Example on a dedicated review checkout (not production checkout):

```bash
export LISTEN_UI_FIXTURE_DIR="$(mktemp -d /tmp/soullab-listen07.XXXXXX)"
npm install --prefix "$LISTEN_UI_FIXTURE_DIR" --no-save --ignore-scripts --no-audit --no-fund react@19.2.0 react-dom@19.2.0 esbuild@0.25.12 puppeteer-core@24.27.0
export LISTEN_UI_NODE_MODULES="$LISTEN_UI_FIXTURE_DIR/node_modules"
export NODE_PATH="$LISTEN_UI_NODE_MODULES"
node tests/listening/listen07_fixture_builder.cjs
node tests/listening/listen07_component_browser_witness.cjs
```

Chrome executable defaults to `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`; override with `CHROME_BIN`. Use disposable **fictional** fixtures. Source SHA256s are written as `source-hashes.json` in the test directory.

## Critical boundaries remain

1. **Auth hold**: `lib/auth/session.ts` shared cookie/header concordance still fails 3 of 8 source-level cases; the Listening Room remains off by default. Refer to `LISTEN06_BROWSER_AND_AUTH_EVIDENCE.md` and platform owner [#1877](https://github.com/SoullabTech/Sovereign/issues/1877).
2. This is a file-origin harness, **not** a combined Next.js/proxy/PostgreSQL/real-auth route acceptance, iPhone Safari, Capacitor, screen-reader, background playback or cross-tab audio-focus qualification.
3. Browser FLAC decoding does **not** establish an end-to-end bit-perfect DAC path, nor completed audio mastering and licensing.
4. Encrypted backups are **manual member-held exports**, not a privacy-reviewed cloud vault, member sync, anti-rollback deletion authority or independent KDF/cryptographic audit.
5. No third-party commercial music APIs, licenses, rights verifier, live source deployment or production feature flags were changed.

**Disposition: Native React UI subgate PASS / Shared authentication and integrated release HOLD.** No protected runtime files were modified to obtain this evidence.
