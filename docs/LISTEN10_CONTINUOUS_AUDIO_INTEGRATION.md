# LISTEN-10 — Persistent, Member-Scoped Listening Transport (Review Candidate)

**2026-10-24 · SOURCE REVIEW / MEMBER AND PRODUCTION RELEASE HOLD**

## Purpose

The founder wants an authentic listening room that can accompany coding, writing, contemplation and rest without stopping whenever the listener visits another part of Soullab.

Builds 07–09 could continue sound when a browser **tab was hidden**, but navigating from `/listen` to `/home` or `/writers-studio` unmounted the route-level player. This candidate supplies a **single optional persistent client transport** intended to be mounted only in an independently accepted **authenticated member-scoped Soullab shell**.

**This implementation is not mounted in Soullab's protected application layout.** The only live mounting used a separate `LISTEN10-PERSISTENT-PLAYER-REVIEW-20261024` test directory on the Mac Studio's external T7 Shield, with fictional session tokens and deliberately fictitious House/Writer pages. The unchanged shared runtime and rollout controls continue to apply.

## Scope and files

- `lib/listening/audioFocus.ts` **new**: cooperative in-window `soullab:audio-focus-request` signal for Listening Room, Writer, MAIA and Sound Sanctuary; a separate `soullab:member-session-ended` teardown signal. The existing `ws-stop-maia-reading` event is retained when Listening Room starts audio. Events are only requests to pause, **not authentication or rights authority**.
- `components/listening/PersistentListeningProvider.tsx` **new**: one client-side player at a stable root, with a restrained persistent dock, low-gain WebAudio sketches, member-selected device-local audio, explicit Stop/Pause/Resume and volume, synchronized cross-tab focus via `BroadcastChannel`. Cross-tab messages contain **only protocol/version/random per-tab ID**; no playlist, artist, member, audio file or personal reflection.
- `app/listen/ListenRoom.tsx` **review-only change**: switches room-to-House/Writer navigation to Next.js `Link`, and delegates sound sketches to the persistent transport when the provider exists. **Without** a provider, the older standalone player continues to work unchanged.
- `app/listen/LocalAudioDesk.tsx` **review-only change**: under a persistent provider, becomes a private file selector and controller rather than another `<audio>` source; the global dock owns the only audio element and its in-memory Blob URL. Standalone behavior remains available without the provider.
- `lib/listening/privateBackup.ts` **review-only compatibility-only update**: copies WebCrypto `salt`/`iv` ciphertext views to `ArrayBuffer`-backed `Uint8Array` for project TypeScript/Dom `BufferSource` types. No alteration to AES-256-GCM, PBKDF2-SHA256-600000, fresh 16-byte salt/12-byte IV, backup format or rights. The 35 encryption/policy tests remain green.
- `tests/listening/listen10_cross_room_browser_witness.cjs` **new**: source-derived, explicit localhost-only browser continuity acceptance with synthetic stereo FLAC; 22 concrete cases each for Chrome and WebKit.
- `tests/listening/listen07_fixture_builder.cjs` review-only **test harness** adjusted for Next `Link` and one React instance so the original standalone route can be regression-tested in isolation.

No protected `app/layout.tsx`, `proxy.ts`, `config/accessMatrix.ts`, `lib/auth/session.ts`, actual Writer component, MAIA voice or native Capacitor build file is changed.

## Physical Mac Studio acceptance

Isolated actual Next.js **16.3.8** with true Soullab strict proxy/route rules and **test-only** same-member shared-session correction, actual PostgreSQL **14.19** with fictional session/member rows, real browser interaction. **The House and Writer destinations are fake UI placeholders**; the shared source-owner must not call this a full Soullab app build.

- **Chrome: 22/22 PASS.**
- **WebKit 26.0 via Playwright 1.56.0: 22/22 PASS.**
- The room starts a member-clicked WebAudio sound sketch. Next client-side navigation to House, back to room, then Writer does not reload the document; the persistent dock and `AudioContext` stay playing.
- A simulated Writer Listen voice request **pauses** music and suspends its `AudioContext`; it does not silently resume. Member Resume works on explicit click.
- Second same-origin tab starting an original sound sketch takes the focus; first tab pauses. Broadcast contains no private library metadata.
- A synthetic **24-bit/48 kHz stereo FLAC** file selected by the member decodes and advances, then **continues through route navigation**. This is source-format/decode evidence, **not** a bit-perfect output, native DAC, iOS audio session or complete original composition.
- A simulated session-ended event stops output and releases the local file URL. The owner must additionally integrate actual session/member-change authority before release.
- External browser requests: **0**. Unhandled JS page errors: **0**.

**Regression:** Pure fallback standalone React Listening Room **24/24 Chrome**, original music/playlist/crypto policy **35/35**, existing mocked route **4/4**, structural tests **25/25**, isolated project TypeScript `tsc --noEmit` **0 errors**. The fallback test had to treat `next/link` as an ordinary anchor in the *test-only* esbuild fixture. That shim is never part of the real Next app.

The test harness initially checked asynchronous WebAudio suspend/resume and HTMLMediaElement play state before browser state settled; it was corrected to wait for real state transitions, after which both engines passed. This was a **test timing issue**, not license or protected source policy change.

## Non-waivable acceptance boundaries

1. **Authoritative authenticated mount:** The real `PersistentListeningProvider` must only live inside a member-authenticated stable root; its `reviewMemberKey` currently comes from a fictional test-only prop. Do not insert it unconditionally into the public `app/layout.tsx`. Actual sign-out/member switch, token revocation, session refresh, multiple tabs and crash/reload disposal require platform review.
2. **Shared Class A auth and strict route:** Same-member cookie/header concordance remains **unmerged**, as does the exact nonpublic `/listen` rule. Prior acceptance is **only the disposable source-pin test**, not production. See [#1877](https://github.com/SoullabTech/Sovereign/issues/1877) and LISTEN-09.
3. **Voice handoff incomplete:** The new event is a proposed handoff for MAIA/Writer. The Writer test click is **a simulated placeholder**. Actual Writer speech must explicitly request focus when starting, and revoke/stop on exception; do not alter settled Writer voice source in this lane.
4. **Member privacy and custody:** No real member information, Spotify/TIDAL OAuth or third-party platform audio enters the provider. Device-local files are not uploaded or retained after closing. Portable AES-GCM backups remain member-held; accepted encrypted account persistence, deletion/restore anti-resurrection, tenant isolation and erasure do not yet exist.
5. **Music rights and fidelity:** The royalty/rights policy still denies unverified in-app streaming, and there are **no** artist contracts, commercial provider playback rights, authorized mixing/stems, long-form masters or measured audiophile output. A FLAC extension is not itself evidence of lossless output.
6. **Devices and accessibility:** Physical iPhone Safari/Capacitor, lock-screen/background service, AirPlay/Bluetooth/wired-DAC path, headphone interrupt and VoiceOver/keyboard QA remain required. The browser `BroadcastChannel` coordinates same-origin tabs only, not OS-level other apps or Spotify/TIDAL playback.
7. **Site-wide audio architecture:** This test maintains audio across fictitious client transitions. The installed Soullab global shell may remount its providers when changing access/Work and must be integrated by the existing source owner with its actual navigation and consent canon. A second parallel player must not be shipped.

**Disposition:** Optional persistent audio transport candidate and source regression tests PASS in isolated Chrome/WebKit/Next+fictional PostgreSQL. **No protected layout/source merge, beta grant, production activation, partner contact or spending.** Source owner and independent security/privacy/recovery/audio acceptance continue to HOLD.

## Where to review

- Source: [Existing Listening Room review branch](https://github.com/SoullabTech/Sovereign/tree/review/listen-03-native-20261024).
- Transport: [PersistentListeningProvider.tsx](https://github.com/SoullabTech/Sovereign/blob/review/listen-03-native-20261024/components/listening/PersistentListeningProvider.tsx).
- Browser test: [listen10_cross_room_browser_witness.cjs](https://github.com/SoullabTech/Sovereign/blob/review/listen-03-native-20261024/tests/listening/listen10_cross_room_browser_witness.cjs).
- Owner coordination: [LISTEN-01 #1979](https://github.com/SoullabTech/Sovereign/issues/1979).

### Next exact owner action

Approve/revise an **authenticated, stable-root integration proposal** within the existing single-build queue, in combination with the separately accepted shared session and exact route rule. Then rerun cross-room focus with the **real House, Writer, MAIA and Sound Sanctuary**, using fictional members before any private member library or licensed music is brought into scope.
