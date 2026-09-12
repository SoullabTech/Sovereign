# KERNEL-00 · DEVICE WITNESS · RUN 4 — 2026-09-12

**Status: OPEN — 4b VERIFIED (K00-03 PASS under the VP-OFF control) · 4a-1 executed, journal NOT exported (F1 falsified by screenshot; F2/F3 undecided) · 4a-2 (W4) not yet run.**
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

## 5. Run 4a-1 — voice processing ON — JOURNAL NOT EXPORTED; screenshot only (phone clock 11:26)

The founder reports: *"couldn't send journal on second with ON."* The only evidence for this session is one screenshot of the harness, run-4 build (the `Voice processing: ON (default)` control is present, greyed because the floor is not idle):

```
Floor · generation 9 · DEGRADED
cause: budget_exhausted:entry_timeout
DEGRADED — entry_timeout · attempts 3/3. Text channel would remain available.
session active · inputFlow dead · outputFlow idle · input rms/peak 0.00002 / 0.00016
```

**What the screenshot establishes:** with VP ON on the run-4 build the organism did not reach or hold listening; the generation count reached 9; the final exhaustion was under the **`entry_timeout`** fault class (the HealthSupervisor's own verdict), not `configuration_change` — i.e. the deferral took effect (the configuration change was no longer the thing exhausting the budget) and the supervisor then declared failure by its ratified 1500 ms entry window, three times. `inputFlow dead` and a non-zero last rms/peak (`0.00002 / 0.00016`) mean at least one input callback occurred in some generation before death — which generation, and with what `engineRunning`, is exactly what the journal would say.

**What it cannot establish:** F2 vs F3. F1 (defer → listening) is **FALSIFIED** for this session by the screen alone; F2 (engine not running after the VP change) vs F3 (engine running, tap silent) needs `engineRunning` in the samples after `configuration_change_deferred`. **The journal is owed.** If the harness process is still alive in this degraded state (the screenshot shows `session active`), the in-memory journal is intact: tap Export journal again and use Save to Files, then AirDrop the file; if the process has been quit, the session is lost and 4a-1 is recorded as NOT MEASURED, not reconstructed.

## 6. Run 4b — voice processing OFF — session `K00-533addf9` — RECEIVED AND VERIFIED (40 records, SHA-256 `2e91ac21243baebedcc5d57fdf1d27e69d0da155669194056b47d96666dd26e7`)

Preserved verbatim as `KERNEL-00_WITNESS_2026-09-12_run4b_K00-533addf9_vpOFF.jsonl`. Run-4 code confirmed by the new fields (`routeAtStart`, `vpReconfigurationExpected`, `callbacksSinceChange`, `engineRunning` on samples).

```
seq 2–3   command setVoiceProcessing requested=false inConversation=false → voice_processing_set false   (BEFORE Enter)
seq 4     enterConversation                                                       t=840057181
seq 6–10  category/rate/buffer/activated (one activation) → session_configured PlayAndRecord/VoiceChat 48 kHz 10 ms builtInSpeaker/builtInMic
seq 11    graph_started gen 1 · 48 kHz valid · voiceProcessing FALSE · engineRunning TRUE · vpReconfigurationExpected false · routeAtStart builtInSpeaker/builtInMic   (+235 ms)
seq 12    input_flow unknown → healthy  (rms 1.9e-4, peak 7.1e-4 — noise floor, not digital zero)          (+333 ms after Enter)
seq 13    floor entering → LISTENING                                                                    K00-03 PASS (333 ms ≤ 1500)
seq 14–36 23 × input_health_sample, one per second: 10–11 callbacks/s (4800-frame buffers), engineRunning true throughout,
          callbacksSinceChange 10 → 241, signal/noiseFloor classification live, no digital zero, inputFlow healthy every window
          NO engine_configuration_changed · NO configuration_change_deferred · NO recovery_* · NO rebuild · generation 1 throughout
seq 37–40 leaveConversation → session_deactivated ok (once) → session_released → LISTENING → idle        (24.4 s after Enter)
          nothing after.
```

**Verified reading:** identical to 3b in kind and cleaner in instrumentation: with VP OFF the engine reports `engineRunning: true` immediately at start, input flows within a third of a second, listening holds in generation 1 for the whole session, and Leave is exactly one deactivation. No configuration change of any kind. **K00-03 PASS under the VP-OFF control** (not the production posture; a control).

### 6b. H2 — journal export fails after a VP-ON Enter on the run-4 build (founder-reported; mechanism UNKNOWN)

Founder: *"Testing with ON doesn't allow me to create and send journal."* A fresh idle session (`K00-5f2c9cb1`, 1 record, `didBecomeActive` only, preserved as `…_run4_K00-5f2c9cb1_idle-export-control.jsonl`) exported and arrived normally, so export works while the kernel is idle. On the PRE-WITNESS-03 build, VP-ON sessions exported normally (3a, and `K00-b0066fcf` which reached this record). On the run-4 build, after a VP-ON Enter, the founder cannot produce/send the journal. Whether the share sheet never appears, appears without a usable file, or the transfer fails is not yet described. **Not repaired; not in any authorized scope; recorded as H2 beside H1.** Consequence: the in-memory recorder's only egress is the harness export, so until H2 is understood the VP-ON F2/F3 question has no on-device route through the sheet.

**Recovery route that needs no code:** `HarnessModel.exportJournal()` writes `kernel00-<session>-<epoch>.jsonl` to `FileManager.default.temporaryDirectory` **before** presenting the sheet. Every Export tapped under VP ON therefore most likely wrote its file into the app container's `tmp/`. Xcode → Window → Devices and Simulators → the iPhone → Installed Apps → `VoiceKernel K00` → `⋯` → **Download Container…** yields an `.xcappdata` bundle; the files are under `AppData/tmp/`. Any file there whose records carry `"voiceProcessing":"true"` together with `"classification"` is a run-4 VP-ON session. iOS may purge `tmp/` under storage pressure or after a long idle, so the download should be done before anything else on the phone.

## 7. Findings (provisional until the 4a-1 journal arrives or is declared lost)

- **F1 is falsified with VP ON** (screenshot): deferral alone did not let the existing generation settle into a live input; the supervisor's entry window expired and its own verdict drove recovery, three times, to `degraded` under `entry_timeout`.
- **The B/C reading holds and sharpens:** with the deferral in place the budget was exhausted by the *supervisor's* verdict, not by the notification — which is what refined B was for. The organism is now failing for the honest reason (no input) rather than for reacting to a notification.
- **A new, sharp contrast in the same field:** `graph_started … engineRunning` is **true** with VP OFF (this file, seq 11) and **false** in every VP-ON start ever recorded (runs 2, 3, 3′). On this device/runtime, enabling voice processing appears to leave `engine.start()` returning without the engine running, and the configuration change follows. Observed, not asserted as Apple-universal; whether the deferred generation *later* becomes running is the F2/F3 question only the 4a-1 journal can answer.
- **W4 under VP ON (4a-2): NOT YET MEASURED.**
- **B2 / B3:** still reserved; nothing here authorizes either.

## 8. Standing

```
SUBJECT              35b0f61d0 · dylib 37A27138-…
RUN 4b (VP OFF)      VERIFIED · K00-03 PASS (control) · clean Leave
RUN 4a-1 (VP ON)     EXECUTED · JOURNAL NOT EXPORTED · screenshot: degraded budget_exhausted:entry_timeout · gen 9 · F1 FALSIFIED · F2/F3 UNDECIDED
RUN 4a-2 (W4, VP ON) NOT YET RUN
OWED                 4a-1 journal via container download (AppData/tmp) — else NOT MEASURED · 4a-2 (export via the same route) · H2 description · run-3 hashed files · protocol fields
```
