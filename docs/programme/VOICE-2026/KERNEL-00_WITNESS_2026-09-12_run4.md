# KERNEL-00 · DEVICE WITNESS · RUN 4 — 2026-09-12

**Status: OPEN — installed · NOT launched · 4a (VP ON) and 4b (VP OFF) PENDING.**
**Subject:** `35b0f61d0` (PRE-WITNESS-04, accepted with two amendments). Compile of record: `KERNEL-00_MAC-COMPILE-05_2026-09-12.md` — GREEN (build · test 29/29 · gate 25/25 · xcodegen · unsigned · signed).
**Question (plan §1/§4):** after iOS performs the VP reconfiguration and the kernel now does nothing to the graph, does the existing generation settle into a live input? **F1** callbacks arrive on the same generation within the entry window → listening. **F2** none; `entry_timeout`; `engineRunning: false` in the samples → the change stops the engine (founder fork B2/B3, neither implemented). **F3** `engineRunning: true`, zero callbacks → the tap is dead. Plus **W4 under VP ON**: Leave within ~2 s of Enter → only `stale_callback_dropped not_in_conversation` after `session_released`, floor idle, zero orphans.
**Device:** iPhone 16 Pro Max · iOS 26.6.1 (23G83) Beta · `A0736AC8-793B-516F-AC72-C076DB6CEE38`.

## 1. Artifact identity

```
debug dylib   UUID 37A27138-676A-3E4B-B277-FA71DE53A982   (THE binding)
main exe      stub executor, build-invariant — not evidence
codesign      life.soullab.voicekernel.k00 · ZVK2X646Z2 · Apple Development: Kelly Nezat (N9DTF6434L)
```

## 2. Pre-install device state (founder, 11:25)

```
54278   /private/var/containers/Bundle/Application/5CD545D7-487E-441D-94DE-59E7DC7D161E/VoiceKernelHarness.app/VoiceKernelHarness
```

**The run-3 harness (old container `5CD545D7-…`, PRE-WITNESS-03 code, dylib `F00F11D4-…`) was RESIDENT at install time.** The install proceeded and placed the new bundle in a new container. Whether iOS terminated pid 54278 on replacement is not established by the transcript. Consequence for the protocol: **force-quit the harness on the phone before the first run-4 launch**, and confirm the process list is empty; a session started from a surviving old process would be old code and would not carry `classification` fields — the journal itself will reveal that (a run-4 journal without `classification` on `engine_configuration_changed` is NOT run-4 code).

## 3. Install (verbatim, 11:25:20 local)

```
App installed:
• bundleID: life.soullab.voicekernel.k00
• installationURL: file:///private/var/containers/Bundle/Application/0CA53022-2EF7-4BE5-B7D6-45459A9288DB/VoiceKernelHarness.app/
• databaseUUID: 42158240-DA3F-491F-8B75-F106CD31316A
• databaseSequenceNumber: 4208
```

Taken as the founder's acceptance of MAC-COMPILE-05 by conduct, as for runs 2 and 3.

## 4. Protocol

Force-quit before **every** session. Launch by icon. No debugger. Export only after Enter; hand each file off from the first share sheet (H1 held).

| Run | Control | Steps | Files |
|---|---|---|---|
| 4a-1 | VP **ON** | Enter → 20 s → Export | 1 |
| 4a-2 | VP **ON** | force-quit → launch → Enter → **Leave within 2 s** → 3 s → Export (W4 under VP ON) | 1 |
| 4b | VP **OFF** before Enter | Enter → 20 s → Export → Leave → 3 s → Export | 2 |

Identity check on every file received here: `classification` present on `engine_configuration_changed` (else it is not run-4 code); for 4b, `voice_processing_set false` before Enter.

## 5. Run 4a — PENDING
## 6. Run 4b — PENDING
## 7. Findings — PENDING
## 8. Standing — OPEN · INSTALLED · NOT LAUNCHED · old harness process was resident at install (force-quit required)
