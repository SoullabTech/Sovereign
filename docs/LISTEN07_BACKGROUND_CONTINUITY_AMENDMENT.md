# LISTEN-07B — preserve user-initiated audio when changing browser tabs

**2026-10-24 · Isolated review branch only · Production HOLD**

## User requirement

Soullab Listening Room is intended to accompany writing, coding, sauntering, resting and contemplation. The existing source unexpectedly called `stop()` whenever `document.hidden` became true, so merely switching tabs interrupted intentionally started sound.

## Bounded source amendment

On `app/listen/ListenRoom.tsx`, remove the component's automatic `visibilitychange` → `stop()` handler and update its comment. Preserve the existing cleanup on React unmount, mood changes and explicit Pause. Playback still **starts only on a deliberate user action**; no autoplay bypass, persistent background worker or server stream is introduced.

This is a **review-only source change**, not a platform release. Different browsers and mobile OS policies can independently suspend or limit WebAudio. No iOS lock-screen, background entitlement, native audio session or cross-route audio-focus guarantee is made.

## Physical Chromium acceptance (Mac Studio)

The amended GitHub source was fetched back from pinned review commit **`69892508ecdfdfe23d3408bd711009c0a676d1c7`**, and byte-for-byte compared with the isolated source used in the test.

- Isolated real React component browser witness: **24/24 PASS**, including encrypted export/restore and local synthetic 24-bit/48 kHz FLAC playback.
- Added [`tests/listening/listen07_background_continuity_witness.cjs`](../tests/listening/listen07_background_continuity_witness.cjs): **PASS**. A user click started the sound sketch; a second Chrome tab was brought to the foreground; the Listening Room became `document.hidden === true`, but the sound sketch remained selected and its `AudioContext.state` stayed `running`. After returning to the room, explicit Pause stopped playback.
- Browser-observed external network requests: **0**. JavaScript page errors: **0**.

## Next tests for source-owner acceptance

- Browser tab navigation, unmount, memory/audio-context cleanup, duplicated or simultaneous tabs, WebAudio lifecycle.
- Desktop OS sleep/wake, headphone disconnect, volume changes and long-form playback (at least multi-hour), device DAC/FLAC output path.
- Mobile Safari/iPhone background and lock-screen behavior; if necessary choose a native media engine instead of pretending WebAudio guarantees unattended playback.
- Shared audio focus with MAIA speech, Writer Listen, Sound Sanctuary and Cabin; per-member consent and audio continuity.
- Existing shared authentication cookie/header conflict, private persistence/recovery and music rights restrictions remain independently held.

**Disposition:** Chrome background-continuity subgate PASS, native Safari/Next/production HOLD. No change to protected main source, auth/session code, member data, database, commercial licensing or runtime flags.
