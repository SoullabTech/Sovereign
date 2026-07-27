# iOS R1 Physical-Device Acceptance Walk

**Build under test:** commit `131d6c236`, marketing 1.2.0, build 2497, Release configuration, development-signed for direct install (store-signed `MAIA.ipa` of the same commit is the upload artifact).
**Device:** Kelly Nezat's iPhone 16 Pro Max (iPhone17,2), iOS 26.6, UDID `00008140-00163D9922E0801C`.
**Walker:** Kelly (his account, his hands). Claude records.
**Install evidence:** 2026-07-27 ~13:41 local — installed via `xcrun devicectl device install app` (installationURL confirmed by device), launched via `devicectl device process launch` → "Launched application with life.soullab.maia bundle identifier." No developer-trust prompt required (profile already trusted). The prior concern that the expired Apple Developer agreement might block provisioning did not materialize: the existing iOS Team Provisioning Profile carried the build without a portal call.

## Scenario results

| Scenario | Device | iOS | Build | Result | Evidence | Notes |
|---|---|---|---|---|---|---|
| 1 — Installation & cold launch (icon, launch screen, no browser chrome, correct environment) | iPhone 16 Pro Max | 26.6 | 2497 | | | |
| 2 — Authentication (sign in, correct account, kill + relaunch restores state) | iPhone 16 Pro Max | 26.6 | 2497 | | | |
| 3 — Arrival threshold (type without trapping, non-writing exit, single composer, return state) | iPhone 16 Pro Max | 26.6 | 2497 | | | |
| 4 — Conversation (send turn, streamed response, scroll, keyboard cycles, background/resume, no lost/duplicated turn) | iPhone 16 Pro Max | 26.6 | 2497 | | | |
| 5 — Voice (deliberate invoke, permission on action not launch, record + submit, playback, silent preference respected) | iPhone 16 Pro Max | 26.6 | 2497 | | | |
| 6 — Session & safety (logout blocks protected routes, second account isolation if available, expired session explicit) | iPhone 16 Pro Max | 26.6 | 2497 | | | |

Result vocabulary: PASS · FAIL (with symptom) · PARTIAL (with boundary) · NOT RUN (with reason).

## Known limitations entering the walk

- Display name is still `Soullab` (rename is deliberately sequenced after the walk, as its own commit).
- The walk build is development-signed; the TestFlight artifact will be the store-signed IPA of the same commit — signature differs, code identical.
- App Store Connect upload is blocked until the Apple Developer agreement is re-accepted (Account Holder).
- Voice on device exercises the production voice path; simulator could not test microphone at all.
