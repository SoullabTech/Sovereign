# R85 — Listen Safari/WebKit M4A format reliability, real two-channel mono capture

**2026-10-17 · isolated Mac Studio / T7 · R84 parent · beta and production HOLD**

## Problem found with an actual browser recorder

R84 certified Listen's truthful controls, original Work reading, ownership,
private notes download and leave-warning in real WebKit against disposable
PostgreSQL. That run did **not** exercise the real browser MediaRecorder path
or physical microphone.

A further **real WebKit** experiment used only a WebAudio-generated sine wave
connected to a MediaStreamDestination (never to the speakers or the Mac's
microphone). WebKit's MediaRecorder reported both `audio/webm;codecs=opus`
and `audio/mp4` supported. In its existing application preference order,
WebM/Opus won. Independent FFmpeg decoded its audio but reported
`Error parsing Opus packet header` on these short WebKit-generated WebM
files. The identical synthetic recording in MP4/M4A decoded **cleanly**
without warnings, at 48 kHz mono.

The observed issue is **specific to this actual WebKit-generated test
output**, not a universal claim that every Safari WebM recording is broken.
Blindly trusting `MediaRecorder.isTypeSupported` is insufficient evidence
of cross-tool file reliability.

## Exact source correction

The only runtime application change is
`lib/writersStudio/listen/browserCaptureInfo.ts`:
`preferredRecorderMime` first checks for actual Apple WebKit engine UA.
On macOS Safari and iOS WebKit browsers it now **prefers MP4/M4A**, but only
if `MediaRecorder.isTypeSupported('audio/mp4')` reports support. It then
falls back to the previously admitted WebM/Opus and WebM order. Desktop
Chromium/Edge/Gecko retain WebM/Opus first, with their prior fallback
order. No hardcoded "24-bit" or unverified sample-rate/codec claim is
introduced. The actual MIME returned by MediaRecorder is still displayed
and determines the downloaded .m4a or .webm extension.

Unit tests cover genuine Safari UA, iOS Chrome and Firefox WebKit, desktop
Chromium/Edge/Gecko, unavailable MP4, reduced codec capability and missing
MediaRecorder. No other mode, manuscript, identity route or storage changed.

## Real synthetic WebKit two-input experiment

`scripts/ops/wsBetaR85GeneratedTwoChannelWebkit.cjs` bundles the **actual
application TypeScript modules** `browserCaptureInfo.ts` and
`monoCaptureRoute.ts` into a real Playwright WebKit browser connected
to loopback. It uses two independent test oscillators through a
2-channel Web Audio merger: **Input 1 = 440 Hz**; **Input 2 = 660 Hz**.
The production `createMonoCaptureRoute` code selects each exact channel,
produces a verified single mono MediaStream, and the browser's real
MediaRecorder writes compressed audio. Every downloaded blob is checked
with independent `ffprobe`, then fully decoded with `ffmpeg` and its
frequency estimated from the decoded waveform. The accepted result:

| Synthetic channel | Codec / sample rate / output | Independent waveform |
|---|---|---|
| Input 1 | AAC/M4A, 48,000 Hz, 1 channel | 440 Hz, RMS ~0.198 |
| Input 2 | AAC/M4A, 48,000 Hz, 1 channel | 660 Hz, RMS ~0.198 |

**15/15 checks passed**. The two selections were not mixed or inverted.
Both recordings decoded **without warnings**. There were **zero actual
hardware microphone requests**, no audio sent to speakers, and no
off-host browser requests.

Precommit private synthetic evidence (not any member recording):
`/Volumes/T7 Shield/ws-beta-r85-generated-two-input-precommit-v2-20261017/`.

## Real mounted Writer's Studio regression

R85 extends the accepted R84 actual Next.js/WebKit Listen browser fixture
with an assertion that the real recording-specifications panel now displays
`MP4 / M4A (compressed)` before any mic request. This fixture remains
fully **fictional**, uses a signed fake session and disposable PostgreSQL16,
starts with the complete R81 protected author flow and all four upload
formats, then enters the real Listen mode on the **same exact owner Work**.

Precommit combined acceptance:

- **26/26** actual mounted Listen WebKit checks PASS.
- **116/116** inherited real Writer browser checks PASS.
- **78/78** physical PostgreSQL/custody/owner/consent security checks PASS.
- **45/45** dedicated Listen Vitest tests across six files PASS.
- `tsc -p tsconfig.ship.json --noEmit` PASS with **0 errors**.
- All fixture databases, Next processes, browsers and synthetic keys
  were removed; the original manuscript remained unchanged.

Evidence:
`/Volumes/T7 Shield/ws-beta-r85-real-next-safari-precommit-20261017/`,
`/Volumes/T7 Shield/ws-beta-r85-safari-unit-precommit.log`,
and `/Volumes/T7 Shield/ws-beta-r85-safari-ship-type-precommit.log`.

## Real hardware and release remain on HOLD

The Mac Studio detects **Scarlett 2i2 USB** as the two-channel default
audio input at a currently reported **192 kHz** sample rate. No setting
has been changed. The browser requests 48 kHz as a preference, but
cannot force an interface's hardware rate; real-device checking is
therefore needed. Device permission, channel isolation with the actual
Scarlett, real voice level meters, record/stop, genuine Safari playback
and downloadable M4A, and physical iPhone Safari audio recording have
**not been tested** by R85. Nothing here starts real microphone capture.

The R83 strict, original-font offline production-build acceptance and
R84 private owner-source custody remain the source pedigree. This
R85 correction still requires committed-source tests and a strict
Next.js build. Production encryption/cold restore, real consented MAIA
provider output and confidential proposal attribution, real Safari
acceptance, signed deployment/rollback and the restricted member canary
remain separate launch gates.

**Disposition: R85 precommit real-WebKit generated-audio + actual Writer
Listen UI acceptance PASS; physical voice recording and beta HOLD.**
