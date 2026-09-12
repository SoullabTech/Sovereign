# KERNEL-00 · DEVICE WITNESS · RUN 4 — 2026-09-12

**Status: OPEN — 4a VERIFIED (`K00-fe6593f4`: F1 FALSIFIED, F2 CONFIRMED — the VP-enabled engine never runs; refined B and one-shot C behaved as accepted) · 4b VERIFIED (K00-03 PASS under the VP-OFF control) · 4a-2 (W4 under VP ON) NOT yet measured · awaiting founder attestation and the B2/B3 ruling.**
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

### 6c. The app container's `tmp/` listed and copied (founder, 11:35, `devicectl … --domain-type appDataContainer`)

Xcode's Download Container failed on `.com.apple.mobile_container_manager.metadata.plist` (`CoreDeviceError 7000`, "The specified file could not be transferred") and discarded the bundle. `xcrun devicectl device info files … --domain-type appDataContainer --domain-identifier life.soullab.voicekernel.k00 --subdirectory tmp` (help text confirmed the verb and options first) listed **12 files**, and `devicectl device copy from` brought all of them to `~/Desktop/k00-tmp` (`File received from Device`). Verbatim listing:

```
kernel00-K00-18f515e1-1789225392.jsonl   16 KB    9/12 11:03   ← run 3a (VP ON, PW-03 build) — the hashed file
kernel00-K00-24694629-1789225445.jsonl   14 KB    9/12 11:04   ← run 3b (VP OFF, PW-03 build) — the hashed file
kernel00-K00-248d5aa6-1789223647.jsonl   81 KB    9/12 10:34   ← run 2 (partial export, in record)
kernel00-K00-248d5aa6-1789223989.jsonl   865 KB   9/12 10:39   ← run 2 (full export, in record)
kernel00-K00-3585a3c7-1789152361.jsonl   678 B    9/11 14:46   ← run 1 pre-enter checkpoint (in record)
kernel00-K00-533addf9-1789226767.jsonl   16 KB    9/12 11:26   ← run 4b (VP OFF, run-4 build) — in record, verified
kernel00-K00-5f2c9cb1-1789226936.jsonl   225 B    9/12 11:28   ← idle export control (in record)
kernel00-K00-73b1c610-1789224075.jsonl   75 KB    9/12 10:41   ← run 2 (in record)
kernel00-K00-983b2f79-1789223298.jsonl   22 KB    9/12 10:28   ← run 2 (in record)
kernel00-K00-b0066fcf-1789226572.jsonl   17 KB    9/12 11:22   ← VP ON, PW-03 build (in record, verified)
kernel00-K00-c9bdd9a0-1789222918.jsonl   678 B    9/12 10:21   ← run 2 pre-enter checkpoint (in record)
kernel00-K00-dd33d8f4-1789158225.jsonl   225 B    9/11 16:23   ← run 1: a one-record export at 16:23 — NOT previously in the record
```

**Finding — there is NO run-4 VP-ON journal file at all.** Every VP-ON session on the run-4 build (the 11:26 degraded session on the screenshot, and any 4a-2 attempt) left nothing in `tmp/`. `HarnessModel.exportJournal()` writes the file only after `await kernel.exportJournalJSONL()` returns; a missing file therefore means the export never reached the write — either the Export tap never dispatched, or the actor call never returned. **H2 is upstream of the share sheet.** This sharpens H2 from "could not send" to "no file was produced", and it raises a question the record cannot yet answer: whether the kernel actor is responsive after a VP-ON session on the run-4 build reaches `degraded` (the projection on screen was published before that point and proves nothing about the actor afterwards). Not repaired; not in any authorized scope; discriminable without code (§6d).

### 6d. Discriminator for H2 (no code; founder act, when convenient)

Force-quit → launch → VP ON → Enter → wait until `degraded` shows → tap Export **once** → wait 10 s → on the Studio: `xcrun devicectl device info processes … | grep -i voicekernel` (is the process alive?) and the `tmp` listing above (did a new `kernel00-*.jsonl` appear?). Three outcomes: file appears → the sheet is the problem (H1-class), attach the file; no file, process alive → the actor did not return (a kernel finding, to be named); no file, process gone → a death, read by the Devices-window crash route. Plus one sentence on what the screen does when Export is tapped. The same act, with Leave-within-2-s before the Export, is 4a-2's W4 measurement.

**Also reachable now:** `devicectl … --domain-type systemCrashLogs` exists in the help text — the run-1 `.ips` reports (and any run-4 death) may be listable/copyable there (identifier requirements per the help, not guessed).

## 5b. Run 4a — voice processing ON — session `K00-fe6593f4` — RECEIVED AND VERIFIED (122 records, SHA-256 `1b005b61cb54e8ac7dfeb7c5cd2fba4d955f6bc7a1d66c30e93b25bf613e08f0`)

The H2 discriminator run (§6d) produced the file: the founder tapped Export after `degraded`, the process stayed alive (pid 54360, container `0CA53022-…`), the file appeared in `tmp/` at 11:38 and was copied out. **H2 did not reproduce on this attempt**; it stays recorded as intermittent, mechanism unknown. Preserved verbatim as `KERNEL-00_WITNESS_2026-09-12_run4a_K00-fe6593f4_vpON.jsonl`. Run-4 code confirmed (`classification` on every change). Read line by line:

```
seq 2    enterConversation                                                                     t=840825465
seq 10   graph_started gen 1 · 48 kHz valid · VP true · engineRunning FALSE · vpReconfigurationExpected true · routeAtStart builtInSpeaker/builtInMic
seq 11   engine_configuration_changed gen 1 · age 142 · classification voice_processing_reconfiguration · ordinal 1 · ports unchanged · ds - → - · engineRunning false · callbacksSinceStart 0
seq 12   configuration_change_deferred gen 1 (causeSeq 11) · vpExpectationConsumed true · engineRunning false      ← refined B: nothing done to the graph
seq 13   input_health_sample gen 1 @ +1.08 s · callbacks 0 · engineRunning FALSE · inputFlow unknown
seq 14   recovery_requested entry_timeout waitedMs 1502 → seq 15 recovery_scheduled entry_timeout attempt 1 · 500 ms → floor entering → recovering
seq 19   graph_start_refused gen 2 invalidInputFormat(0.0 Hz) (fresh engine, 2015 ms into gen 1's window) → graph_rebuild_failed attempt 1 · 500 ms
seq 24–35 input_dead verdicts every ~100 ms (engineRunning false, sinceMs 2262…2683) — each coalesced into the pending recovery
seq 38   graph_started gen 3 · VP true · engineRunning FALSE · expectation armed
seq 40–41 change @172 ms → voice_processing_reconfiguration → deferred (consumed)
seq 43   sample gen 3 · callbacks 0 · engineRunning false → seq 44–45 entry_timeout attempt 2 · 1000 ms
seq 61   graph_started gen 4 · engineRunning FALSE → seq 63–64 change @188 ms → deferred
seq 66   sample gen 4 · 0 callbacks · engineRunning false → seq 67–68 entry_timeout attempt 3 · 2000 ms
seq 103  graph_started gen 5 · engineRunning FALSE → seq 105–106 change @185 ms → deferred
seq 108  SECOND change in gen 5 @287 ms · ordinal 2 · vpReconfigurationExpected false → classification route_configuration_change   ← one-shot classifier, as amended
seq 109–110 recovery_requested configuration_change → attempt 1 · 500 ms (PRE-WITNESS-03 bounded path, distinct class)
seq 114  graph_started gen 6 · engineRunning FALSE → seq 116–117 change @295 ms → deferred
seq 118  sample gen 6 · 0 callbacks · engineRunning false → seq 119 entry_timeout waitedMs 1592
seq 120  DEGRADED attempts 3 / budget 3 (class entry_timeout) → seq 121 recovering → degraded                    13.5 s after Enter
seq 122  sample · engineRunning "-" (graph nil) · inputFlow dead
```

Counts: 5 `graph_started` (every one `engineRunning: false`), 6 `engine_configuration_changed` (5 classified VP, 1 ordinary), 5 `configuration_change_deferred`, 1 refusal, 9 samples (`engineRunning: false` on all 8 with a graph, 0 callbacks in total), 26 coalesced requests, 3 floor transitions all lawful (0 orphans by inspection), `degraded` under `entry_timeout`.

## 7. Findings

**F1 — FALSIFIED.** Deferral was applied five times; the existing generation never settled. Zero input callbacks in 14 seconds across five VP-enabled generations.

**F2 — CONFIRMED, and sharper than the plan wrote it.** The plan's F2 read "the change stops the engine". The record says something narrower and stranger: **with voice processing on, `engine.start()` returned without throwing and `engineRunning` was already `false` at `graph_started`, on every generation, before any change arrived** (seq 10, 38, 61, 103, 114). The change followed 142–295 ms later; the engine stayed not-running through every sample after the deferral. Nothing was stopped; nothing ever ran. With VP off (4b, `K00-533addf9`) `engineRunning` was `true` at start and stayed true. So on this device/runtime the VP-enabled start does not actually start, and the "reconfiguration" is the aftermath of a start that did not take — not an interruption of one that did. Observed, not asserted as Apple-universal.

**Refined B behaved exactly as accepted.** No rebuild on the deferred change; the HealthSupervisor's own `entry_timeout` verdict (1502 / 1577 / 1576 / 1592 ms — the ratified 1500 ms window) drove every recovery through the existing policy; exhaustion degraded under the honest class. The organism now fails for the true reason — no input — not for reacting to a notification.

**C, amended, behaved exactly as accepted.** One expected change per generation classified and consumed; the second change in generation 5 (seq 108) was correctly refused the VP classification and took the bounded path. The one-shot boundary is real, and it was exercised.

**K00-03 with VP ON: FAIL** (never listening). **K00-03 with VP OFF: PASS** (4b). **K00-10: HELD** across three fault classes (entry_timeout ×3 → degraded; graph_rebuild_failed ×1; configuration_change ×1), ratified backoffs honoured (500/1000/2000). **K00-17: 0 orphans; every automatic act attributed** (the 26 coalesced lines are attributed observations, not acts).

**Record-volume observation (not a defect, not repaired):** while a recovery is pending, the `input_dead` verdict re-issues every tick (~100 ms) and each is journalled and coalesced — 26 lines in 14 s. Bounded, attributed, honest, and noisy; an evidence-only refinement for a later plan if the founder wants it.

**W4 under VP ON (4a-2): NOT YET MEASURED** — no Leave in this file.

**B2 / B3:** still reserved. This file is the evidence the fork was waiting for: the deferred VP-enabled engine never runs, so "observe settlement" cannot succeed on this runtime; the question becomes whether a second start on the same engine after the change would run (B2, which per Amendment 2 conflicts with rebuild-not-resume once recovery is declared — and here recovery is declared by the supervisor 1.5 s later) or whether VP must be arranged before the first start so the start takes (B3). **Nothing here authorizes either; the ruling is the founder's.**

## 7b. Crash-log domain (founder, `devicectl … --domain-type systemCrashLogs`, raw preserved in `/tmp/k00-crashlogs.txt`)

```
VoiceKernelHarness-2026-09-11-162349.ips   39 KB   9/11 4:23 PM
VoiceKernelHarness-2026-09-11-162416.ips   37 KB   9/11 4:24 PM
VoiceKernelHarness-2026-09-11-162506.ips   33 KB   9/11 4:25 PM
```

Exactly the three run-1 SIGABRT reports and **no `VoiceKernelHarness` report after 19:54 on the 11th** — runs 2, 3 and 4 produced no death. The owed run-1 dylib UUID is one copy + one grep away (§8).


- **F1 is falsified with VP ON** (screenshot): deferral alone did not let the existing generation settle into a live input; the supervisor's entry window expired and its own verdict drove recovery, three times, to `degraded` under `entry_timeout`.
- **The B/C reading holds and sharpens:** with the deferral in place the budget was exhausted by the *supervisor's* verdict, not by the notification — which is what refined B was for. The organism is now failing for the honest reason (no input) rather than for reacting to a notification.
- **A new, sharp contrast in the same field:** `graph_started … engineRunning` is **true** with VP OFF (this file, seq 11) and **false** in every VP-ON start ever recorded (runs 2, 3, 3′). On this device/runtime, enabling voice processing appears to leave `engine.start()` returning without the engine running, and the configuration change follows. Observed, not asserted as Apple-universal; whether the deferred generation *later* becomes running is the F2/F3 question only the 4a-1 journal can answer.
- **W4 under VP ON (4a-2): NOT YET MEASURED.**
- **B2 / B3:** still reserved; nothing here authorizes either.

## 8. Standing

```
SUBJECT              35b0f61d0 · dylib 37A27138-…
RUN 4a (VP ON)       VERIFIED · F1 FALSIFIED · F2 CONFIRMED (engineRunning false from start, every generation; 0 callbacks) · K00-03 FAIL
RUN 4b (VP OFF)      VERIFIED · K00-03 PASS (control) · clean Leave
B refined            BEHAVED AS ACCEPTED (supervisor's entry_timeout drove recovery; degraded under the honest class)
C one-shot           BEHAVED AS ACCEPTED (gen-5 second change refused the VP classification)
W4 under VP ON       NOT MEASURED (4a-2 owed)
H2                   intermittent, not reproduced on the discriminator run; mechanism unknown; not repaired
CRASH LOGS           only the three run-1 reports exist; no death in runs 2–4
B2 / B3              RESERVED — founder ruling owed on this evidence
OWED                 4a-2 · run-1 .ips dylib UUID (copy + grep) · 3a/3b/dd33d8f4 files attached here · protocol fields · attestation
```
