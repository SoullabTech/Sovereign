# AUDIO-PLATFORM-01 — Source-owner acceptance record

**2026-10-24 · Review-only source candidate · Founder-directed platform scope**

- Source owner issue: https://github.com/SoullabTech/Sovereign/issues/1984
- Protected baseline: `clean-main-no-secrets`; existing audio source, speech, web and native controllers remain unchanged.
- Review branch: `review/audio-platform-authority-v1-20261024`
- Build subject: a universal pure audio focus policy and injectable transaction interface covering 12 currently named Soullab experience groups.
- Local test result: **86/86 Node automated policy and adapter-contract checks PASS**. TypeScript 5.8.3 strict type-check PASS. The exact GitHub-published source was independently fetched on Mac Studio (Node v22.22.3), compiled with strict TypeScript, and rerun **86/86 PASS**. Chrome and WebKit policy-only smoke each **16/16 PASS**, no nonlocal browser requests or JavaScript page errors; browser witness source was also read back and replayed. Results are local source/pure behavior tests, **not** browser/integrated MAIA/iPhone/Writer/Sound Sanctuary acceptance.
- Prior separate LISTEN-14 was itself limited to same-origin cooperating Chrome/WebKit browser tabs, fictional audio and a disposable Next/PostgreSQL environment; it is not a universal native/cross-device lock.

## Exact development stance

New modules here are **not** a parallel authenticated application or replacement global singleton. They define a common contract to be reconciled by the existing `useAudioCoordinator`/`AudioSessionManager` and each source-owned product. The policy can issue a **preference plan only**, never a recording/media/identity entitlement. An adapter is responsible for independent real session, member, media rights and consent checks; owner-acknowledged pause; and a held exclusive output lease.

Any registration in a browser/desktop/native/offline app must use a fixed, trustworthy source owner. A forged `audio-start` message must not gain microphone or voice authority. The browser Web Locks fallback must refuse concurrent output if required capabilities are absent. No source or comment in this packet may be used as a release GO.

**TODO source-owner gates:** reconnect legacy coordinator without breaking earlier callers; full current MAIA/Writer/Reader/Journal/Pro/other voice source survey; native iPhone/AVAudioSession, Jarvis Electron main-process, Cabin offline encrypted local service; authentic signed member-scoped runtime/CSRF and cookie+header concordance; physical devices, privacy and deletion/recovery authority; independent rights and master quality; founder exact-image acceptance.

**Status: A0 POLICY/CONTRACT PASS; ALL RUNTIME ADAPTERS AND PRODUCTION/BETA RELEASE HOLD.**
