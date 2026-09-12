# KERNEL-00 · DEVICE WITNESS · RUN 2 — 2026-09-11

**Status: SEALED — 2026-09-12 (founder attestation §9). Enter EXECUTED · SURVIVED ENTRY · listening reached, never held · K00-W3 + K00-W4 CONFIRMED · PRE-WITNESS-03 OPEN (§10).**
**Subject SHA:** `728924819` (PRE-WITNESS-02 §3 applied; plan `6566ace40` accepted as written).
**Compile of record:** `KERNEL-00_MAC-COMPILE-03_2026-09-11.md` — GREEN (build · test 20/20 · gate 16/16 · xcodegen · unsigned · signed).
**Question this run answers:** with an invalid input format made unreachable at `installTap` (§3.1) and every refused build journalled into the existing RecoveryPolicy road (§3.2/§3.4), does the organism survive **Enter conversation** on this device — and what does the journal show at the entry seam (plan §4, candidate A first)?
**Device:** iPhone 16 Pro Max · iOS 26.6.1 (23G83) Beta · devicectl id `A0736AC8-793B-516F-AC72-C076DB6CEE38`.
**Not changed for this run:** thresholds · architecture · STT/TTS (none) · candidate B/C (not implemented).

## 1. Artifact identity (founder-read on the Mac Studio, pre-install)

```
main executable   UUID 81D0C25C-73C9-39BE-B617-CF1020D0A9A4   (stub executor — build-invariant, NOT the code; see MAC-COMPILE-03 §5)
debug dylib       UUID 1AEBEE45-BF4E-3D6E-9D3A-69CFA6E4218A   (the kernel + harness code — THE binding for this run)
codesign          Identifier=life.soullab.voicekernel.k00 · TeamIdentifier=ZVK2X646Z2
identity          Apple Development: Kelly Nezat (N9DTF6434L) · profile "iOS Team Provisioning Profile: *"
```

Dylib UUID **re-read after launch, unchanged: `1AEBEE45-BF4E-3D6E-9D3A-69CFA6E4218A`** — the installed bundle is this one. Run-1 code identity (the dylib UUID inside the three 16:2x `.ips` reports) is still **UNREAD**: the reports are not under `~/Library/Logs/CrashReporter/MobileDevice/` on the Mac Studio (`zsh: no matches found`). Where the founder pulled them from earlier is not recorded. Owed; does not block this run.

## 2. Pre-install device state

`devicectl device info processes … | grep -iE "maia|voicekernel|App$"` → **empty**. No legacy `/maia` process, no resident harness.

## 3. Install (verbatim, founder, 19:54:00–19:54:04 local)

```
xcrun devicectl device install app --device A0736AC8-793B-516F-AC72-C076DB6CEE38 "$APP"
19:54:00  Acquired tunnel connection to device.
19:54:00  Enabling developer disk image services.
19:54:00  Acquired usage assertion.
App installed:
• bundleID: life.soullab.voicekernel.k00
• installationURL: file:///private/var/containers/Bundle/Application/0E9272DC-44AC-4DE0-8EC8-9E4A09D57ED7/VoiceKernelHarness.app/
• launchServicesIdentifier: unknown
• databaseUUID: 42158240-DA3F-491F-8B75-F106CD31316A
• databaseSequenceNumber: 4104
```

**Install = INSTALLED.** The founder executed the install step that this lane had gated on acceptance of MAC-COMPILE-03; the act is taken as that acceptance by conduct. If the founder intends otherwise, say so and this line is corrected, not the install undone.

## 4. Launch attempts

| # | Time | Launcher | Outcome | Classification |
|---|---|---|---|---|
| 1 | 19:54:05 | `devicectl device process launch … life.soullab.voicekernel.k00` | **REFUSED before the process existed**: `CoreDeviceError 10002` → `FBSOpenApplicationServiceErrorDomain error 1` → `SBMainWorkspace … Locked ("Unable to launch … because the device was not, or could not be, unlocked")` · `FBSOpenApplicationErrorDomain error 7` | **Operator condition** (screen locked). No process, no session mutation, no journal, nothing spent. Not a kernel event. |

| 2 | 19:56:13 | same `devicectl … process launch` | **REFUSED, identical**: `10002` → `FBSOpenApplicationServiceErrorDomain 1` → `SBMainWorkspace … Locked` · `FBSOpenApplicationErrorDomain 7`, request `0x93a1` | **Operator condition again** (screen still locked at the moment of the request). No process, nothing spent. |

⛔ **VOID — every `devicectl device info crashes …` query in this run (19:56 and later) was a FAILED COMMAND, not an empty result.** With the raw output preserved (`tee /tmp/maia-device-crashes.txt`, founder's method) the tool answered: `Error: Unknown option '--device'` / `Usage: devicectl device info [--verbose] … <subcommand>` — `crashes` is not a `devicectl device info` subcommand; this session invented it. The `grep` filter hid the failure on every earlier run. **No crash query has been executed in run 2.** The "consistent with no run-2 process" reading above is withdrawn. Device crash reports are read the way run 1 read them (founder: Xcode → Window → Devices and Simulators → View Device Logs, or on the phone Settings → Privacy & Security → Analytics & Improvements → Analytics Data → `VoiceKernelHarness-<date>.ips`), never through a `devicectl` verb this record has not seen succeed.

A signed `xcodebuild … BUILD SUCCEEDED` tail appears in the founder's terminal scrollback immediately before attempt 2. Whether that was a fresh build after the 19:54 install, or the 19:49 build's output re-shown, is not established from the paste. If a rebuild occurred, the installed bundle (19:54) and the DerivedData bundle may differ; the dylib UUID must be re-read with `dwarfdump --uuid` and, if it differs from `1AEBEE45-…`, the app reinstalled before launch so that §1 names the bundle that actually runs.

| 3 | phone clock **10:20** (screenshot) | **launcher NOT STATED by the founder** — presumed Home Screen tap after unlocking; to be confirmed in one line | **LAUNCHED.** Harness on screen: `VoiceKernel · K00` · Floor `idle` · `generation 0` · `session inactive` · `inputFlow unknown` · `outputFlow idle` · rms/peak `0.00000 / 0.00000` · `callbacks (gen) 0` · `recovery gen 0 · attempts 0/3` · `Mic: enabled` · `Output: enabled`. Pre-enter state identical in shape to run 1 §0. **Nothing spent.** |

`dwarfdump --uuid "$APP/VoiceKernelHarness.debug.dylib"` in a fresh shell failed with `error: /VoiceKernelHarness.debug.dylib: No such file or directory` — `$APP` was unset in that shell, so the path collapsed to `/VoiceKernelHarness.debug.dylib`. Not evidence about the bundle. The dylib UUID re-read is still owed with the full path (§1 binding stands as `1AEBEE45-…` from the pre-install read until then).

(Previously written before attempt 3, kept for the record:) Next: unlock the phone **and keep it unlocked** (Settings → Display & Brightness → Auto-Lock → Never for the duration of the witness; the runbook's 60-minute session requires it anyway), then launch — either by the same `devicectl` command while the screen is unlocked, or by tapping the `VoiceKernel K00` icon on the Home Screen (a lawful launcher; the record names whichever was used). Then the pre-enter checkpoint (liveness · append · export) **before** any Enter.

## 5. Pre-enter checkpoint — FROZEN (session `K00-c9bdd9a0`)

Two exports received, byte-identical (`kernel00-K00-c9bdd9a0-1789222918.jsonl`, and a second export of the same file). Identical content under the same session id means the same process and **no Enter between them**. Verbatim:

```
{"cause":"didBecomeActive","component":"Harness","event":"app_lifecycle","evidence":{"audioSession":"inactive","floor":"idle","inputFlow":"unknown"},"generation":0,"seq":1,"session":"K00-c9bdd9a0","timeMonotonicMs":836087877}
{"cause":"willResignActive","component":"Harness","event":"app_lifecycle","evidence":{"audioSession":"inactive","floor":"idle","inputFlow":"unknown"},"generation":0,"seq":2,"session":"K00-c9bdd9a0","timeMonotonicMs":836121432}
{"cause":"didBecomeActive","component":"Harness","event":"app_lifecycle","evidence":{"audioSession":"inactive","floor":"idle","inputFlow":"unknown"},"generation":0,"seq":3,"session":"K00-c9bdd9a0","timeMonotonicMs":836196591}
```

Same shape as run 1 §0: liveness PROVEN (recorder alive, `seq` monotonic 1→3), append PROVEN (the resign/active pair is the export share-sheet round-trip, ~34 ms out, ~75 ms back), export PROVEN (non-destructive — the second export reproduces the first exactly). **Zero session mutations before the member act**: `audioSession: inactive` on every record, `generation 0`, no `session_*`, no `command`. K00-01 = pre-enter purity holds; K00-16 consistent; neither spent. The 1,789,222,918 in the filename is the export's epoch-seconds clock.

**Enter NOT YET PRESSED at the time of both exports.**
## 6. Enter conversation — EXECUTED · **THE ORGANISM SURVIVED ENTRY · IT DID NOT REACH LISTENING · IT LOOPS**

Launch attempt 4: founder force-quit the H1-latched harness and relaunched by icon (recorded as founder relaunch, not a death); **no export before Enter** (checkpoint already frozen in §5). New session **`K00-983b2f79`**. Journal exported after Enter: 79 records, 9.3 s of organism time, preserved verbatim as `KERNEL-00_WITNESS_2026-09-11_run2_K00-983b2f79.jsonl` beside this record. Read in full; the load-bearing records:

```
seq 2   command enterConversation                                      t=836604275
seq 4–7 session_category_set playAndRecord/voiceChat [defaultToSpeaker,allowBluetoothHFP,allowBluetoothA2DP] ok
        · preferred_sample_rate 48000 ok · preferred_io_buffer 0.010 ok · session_activated ok         (ONE activation — K00-02)
seq 8   session_configured  SoloAmbient/Default out=speaker in=none sr=48000 io=0.0200
                         →  PlayAndRecord/VoiceChat out=builtInSpeaker in=builtInMic ds=Bottom sr=48000 io=0.0100
seq 10  graph_started gen 1   inputSampleRate 48000.0 · inputChannels 1 · inputFormatValid true · voiceProcessing true · engineRunning FALSE
seq 11  engine_configuration_changed  generationAgeMs 134 · format at the instant iOS posted: 48000.0 / 1 / VALID
seq 13  graph_start_refused  gen 2  invalidInputFormat(sampleRate: 0.0, channels: 1) · priorGeneration 1 · priorGenerationAgeMs 134   ← §3.1 GUARD, EXERCISED
seq 14  error graph_rebuild_failed (causeSeq 11)                                                                                        ← §3.2 ROAD
seq 15  recovery_requested graph_rebuild_failed
seq 16  recovery_scheduled afterMs 500 attempt 1 nextGeneration 3                                                                      ← RecoveryPolicy
seq 17  floor entering → recovering
seq 20  recovery_started gen 3   (t=836605541, 515 ms after seq 16 — the 500 ms schedule honoured)
seq 23  graph_started gen 3   48000.0 valid · engineRunning FALSE · priorGeneration 1 · priorGenerationAgeMs 878
seq 25  engine_configuration_changed  gen 3 · age 281 · format VALID
seq 28  graph_started gen 4  (cause route_recovery — DIRECT rebuild, no RecoveryPolicy, no budget spent)
seq 30  engine_configuration_changed  gen 4 · age 288
seq 33  graph_started gen 5 … seq 78 graph_started gen 14     — the same pair, eleven more times
```

Every generation from 3 to 14 follows one shape: `route_changed` (input data source `-`) → `graph_started` (`engineRunning: false`, format valid 48 kHz, voice processing on) → `route_changed` (data source `Bottom`) → `engine_configuration_changed` 134–509 ms later → `rebuildGraph(cause: route_recovery)` → next generation. **Fourteen generations in 9.3 s, still going at export; the same session was later seen at generation 487 (§6b).** No `input_health_sample` in the whole journal; zero input callbacks in any generation (`callbacks (gen) 0`); floor `recovering` from seq 17 onward and never `listening`. RecoveryPolicy attempts spent: **1** (the gen-2 refusal). The other eleven rebuilds spent nothing, because the route-recovery path does not consult the policy.

### 6b. Second Enter, session `K00-248d5aa6` — the loop reproduced, and the organism was seen LISTENING inside it

Phone at **10:32** (screenshot): session `K00-983b2f79` still running — **`generation 487` · `recovering` · `cause: route_recovery` · session active · callbacks 0 · `attempts 1/3 · graph_rebuild_failed`** — about 480 generations in ~6 minutes, ≈1.3 generations per second, unbounded, the recording indicator lit the whole time. No `Leave` had been pressed (no `session_deactivated` in any journal). The founder then relaunched (how, not yet stated) and pressed Enter again → session **`K00-248d5aa6`**, exported at 10:33 showing `generation 30 · recovering · rms/peak 0.00027 / 0.00180`. Journal preserved verbatim as `KERNEL-00_WITNESS_2026-09-11_run2_K00-248d5aa6.jsonl`: **287 records, 34 s after Enter, 52 generations, 51 `graph_started` (all `engineRunning: false`, all formats valid except the one gen-2 refusal, identical to session 2), 50 `engine_configuration_changed` at 135–543 ms of generation age, 103 `route_changed`.** Same shape, same rate, one budgeted attempt (gen 2), fifty unbudgeted route rebuilds.

**New in this session — input flowed, and the supervisor did its job when it was allowed to:**

```
seq 50  gen 8   input_flow unknown → suspect   frames 4800 rms 0.0 peak 0.0          (first buffer: digital zero)
seq 51  gen 8   input_flow suspect → healthy   rms 5.1e-4 peak 3.1e-3               (noise floor ≠ digital zero — three-way classification live)
seq 52  gen 8   floor recovering → LISTENING   cause recovery_flow_reobserved
seq 57  gen 9   floor listening → recovering   cause route_recovery                  (630 ms later; the loop took it back)
seq 64–65 gen 10  healthy → LISTENING · seq 71 gen 11 → recovering  (635 ms)
seq 88–89 gen 14  healthy → LISTENING · seq 97 gen 15 → recovering  (778 ms)
seq 153–155 gen 26 suspect → healthy → LISTENING · seq 161 gen 27 → recovering  (630 ms)
```

Four of fifty-two generations received input callbacks (4800-frame batches, real microphone energy: peak up to 0.0115). In each, the HealthSupervisor classified correctly, `displaysListening` became true, and the floor reached **listening** — for 630–778 ms, until the next configuration change rebuilt the graph. **The organism can listen. The loop will not let it.** K00-03 remains FAIL (listening was never reached within 1500 ms of Enter, and never held), but the reason is now isolated to K00-W3 alone: session custody, format, supervisor, recovery budget and projection all behaved lawfully in the windows the loop left them.

Xcode screenshots received alongside: the Xcode project window is the stale `488e066 (detached)` GUI project with Team `None` and yesterday's failed build — it played no part in run 2 (CLI build · `devicectl` install · icon launch). The Devices window confirms iOS 26.6.1 (23G83) · iPhone 16 Pro Max · identifier `00008140-00163D9922E0801C` · installed `VoiceKernel K00` v1 (`life.soullab.voicekernel.k00`) beside `Soullab 2511` (`life.soullab.maia`, the legacy app, not running). **Open Recent Logs** in that window is the crash-report route for the owed run-1 dylib UUID.

### 6c. Leave — the exit seam works, and the loop outlives it (sessions `K00-248d5aa6` full export · `K00-73b1c610`)

Full export of `K00-248d5aa6` (2994 records, replaces the 287-record partial beside this file): **6.2 min after Enter · 584 generations · 583 `graph_started` (580 `engineRunning: false`, 3 `true`) · 583 `engine_configuration_changed` at 122–700 ms of generation age (mean 307) · 1166 `route_changed` · input in 16 generations · floor reached `listening` 12 times, never held · no `input_health_sample` ever.** Harness bookkeeping at 10:40 (screenshot): elapsed 7.0 min · cycles complete 0 · route changes 782 · interruptions 0 · media resets 0 · **manual interventions 0** · journal events 3000 · **replay FAIL · 1 orphan · 0 unattributed · 0 broken causality**.

**Leave (K00-02 exit, VOICE-06 member authority) — HELD as a session act:**

```
seq 2981  command leaveConversation                       gen 583
seq 2983  session_deactivated  ok        (causeSeq 2981)  — exactly one, as the law requires
seq 2984  session_released     PlayAndRecord/VoiceChat … → inactive
seq 2985  floor recovering → idle
```

The same shape in `K00-73b1c610` (263 records, 30.7 s, 50 generations, no input this time): `leaveConversation` → `session_deactivated ok` → `session_released` → `recovering → idle`, and that export ends there, clean.

**K00-W4 — NEW · the loop outlives Leave.** In `K00-248d5aa6`, the records after the floor went idle:

```
seq 2986  engine_configuration_changed  os_configuration_change   (no format evidence — `graph` was already nil)
seq 2987  graph_started  gen 584  cause route_recovery  engineRunning TRUE  format valid   ← a new engine built AFTER session_released
seq 2988  graph_rebuilt  gen 584
seq 2989  floor_transition  idle → recovering                                          ← THE REPLAY ORPHAN (unlawful edge)
seq 2990  engine_configuration_changed  gen 584  age 122
seq 2991  graph_start_refused  gen 585  invalidInputFormat(0.0 Hz, 1 ch)               (the session is inactive now — the guard holds)
seq 2992–2994  error graph_rebuild_failed → recovery_requested → recovery_scheduled 500 ms attempt 1 nextGeneration 586
```

Cause, read from source: `leaveConversation` cancels `pendingRecovery`, stops the tick, stops the graph, releases the session and clears `inConversation` — but `handleConfigurationChange` guards only on generation (`gen == snap.generation`, still 583) and **not on `inConversation`**, so a change notification already in flight from generation 583's stopped engine was honoured after exit and `rebuildGraph` built generation 584 against a released session. The recovery it then scheduled is dropped by the `inConversation` guard on the recovery path (`VoiceKernel.swift:536`), which is why the harness settled at 3000 events rather than looping on — the budget path is guarded, the route path is not. Member-facing: the organism acted for ~900 ms after the member said stop. Session custody was NOT re-taken (no `session_activated` after release — K00-01/K00-02 hold); the engine was. Same seam family as W3: the route-recovery path is the one path with no owner check, no budget and no exit guard.


**PRE-WITNESS-02 §3 — MET, EXACTLY AS PLANNED.** K00-W1 as a *crash* is closed: the invalid format (0 Hz on generation 2's fresh engine, built inside the reconfiguration window) was refused by the precondition before `installTap`, thrown as a Swift error, journalled with the format it saw (`graph_start_refused`), routed through the existing `graph_rebuild_failed` → `recovery_requested` → `recovery_scheduled` road, and the RecoveryPolicy's 500 ms first backoff was honoured to within 15 ms. K00-W2 is closed: the failure is in the journal, with evidence. The recorder outlived its own fault. **The process did not die on any Enter.**

**K00-W3 — NEW · the route-recovery rebuild is self-provoking and unbounded.** With voice processing on, every fresh generation's start is followed 134–509 ms later by an `AVAudioEngineConfigurationChange`; the kernel treats every such change as route recovery and rebuilds **directly**, bypassing RecoveryPolicy; the new generation provokes the next change. The recovery act is the cause of the next fault — the E18 shape, reproduced inside the one-owner kernel, in the seconds after entry. The ratified ceiling (3 attempts / fault class / 60 s) never applies to this path because the path is not classed as a fault; and `beginGeneration` resets the HealthSupervisor's windows on every rebuild, so neither the 1500 ms entry timeout nor the 1 s physiology sample ever gets to run — the ceiling that would have bounded the loop is reset by the act it should count (the E23 §3.3(2) anti-pattern, now witnessed in Voice 2026's own organism). Facts, not yet mechanism: `engineRunning: false` immediately after every `engine.start()` that returned without throwing; the route change pairs (`-` → `Bottom`) bracket each generation; the format was VALID at every notification instant except gen 2's fresh engine. **Inference, kept as inference:** enabling voice processing on a new engine reconfigures the session's input data source, which posts a route configuration change, which posts the engine configuration change — i.e. the loop's driver is the kernel's own start-with-VP. The plan's §4 voice-processing-off control is now the directly indicated discriminator; the harness has **no VP toggle** (`voiceProcessingEnabled` is never mutated), so the control needs a new SHA, which is a founder act.

**On §4 A/B/C.** Candidate A (rebuild-now + guard) was tested first, as ruled: it prevents death and it does not prevent the loop. The gen-2 refusal shows the 0 Hz belongs to a *fresh engine created inside the window* — that is candidate B's premise, and B would remove that one refusal; it would not by itself stop a loop that each valid start re-provokes. C (reclassify the change as an observation rather than a recovery trigger) is the one that speaks to K00-W3 directly. **No candidate is chosen here.** Both B and C remain NOT AUTHORIZED; the evidence for the founder's ruling is above.

**K00-W4 (see §6c).** Post-exit configuration change honoured; generation 584 built after `session_released`; `idle → recovering` = the replay orphan (K00-17 FAIL on this session for exactly one edge, and the replayer caught it — the instrument worked). Not repaired.

**Checklist (K00-01…18) as measured in this run**

| Law | Result | Evidence |
|---|---|---|
| K00-01 one session mutator | HELD | only `AudioSessionAuthority` records mutate; kernel/harness none |
| K00-02 one activation on entry, one deactivation on exit | HELD | one `session_activated` (seq 7); on Leave one `session_deactivated` + `session_released` (both sessions); no re-activation after release |
| K00-03 entering → listening ≤ 1500 ms | **FAIL** | never `listening`; `recovering` from seq 17 |
| K00-04 physiology | NOT MEASURABLE | zero callbacks, no samples |
| K00-05/06 output / duplex | NOT REACHED | |
| K00-07/08 dead-input / stall windows | NOT MEASURABLE | supervisor reset every 134–509 ms |
| K00-09 generation gate | CONSISTENT | no stale-callback records (no callbacks at all) |
| K00-10 bounded recovery 3/60 s at 500/1000/2000 | **EXERCISED ONCE, CORRECT; NOT GOVERNING** | attempt 1 at 500 ms honoured; eleven route rebuilds outside the budget |
| K00-11 route | built-in only this run | |
| K00-12–15 | NOT REACHED | |
| K00-16 nothing else in build | CONSISTENT | |
| K00-17 replayable causality | **FAIL on one edge** (K00-248d5aa6): `idle → recovering` after Leave = 1 orphan; 0 unattributed · 0 broken causality; every automatic act carries `causeSeq` | the replayer caught it — the instrument is sound; the edge is W4 |
| K00-18 | NOT REACHED | |

H1 (harness export latch) stands as recorded below, unrepaired.


**H1 — harness export sheet re-presents itself (harness, not kernel).** After the first Export, the share sheet reappears in front of the screen on every view update, so the member cannot reach **Enter conversation** (founder, phone clock 10:26: "it keeps pushing this in front of screen before I can choose"; the offered file is still 678 bytes = the three pre-enter records, session `K00-c9bdd9a0`, so Enter has not registered). Cause, read from source `HarnessView.swift:24`: `.sheet(item: Binding(get: { m.exportURL.map(ExportItem.init) }, set: { _ in }))` — the setter is a no-op, so dismissal never clears `HarnessModel.exportURL`; the dismissal itself causes `willResignActive`/`didBecomeActive`, which publish a snapshot, which re-renders, which re-presents. VOICE-07 is not violated (the harness still holds no voice state), but the projection has a latch. Run 1 passed through this by timing. **Not repaired in this run** — a harness-only fix (clear `exportURL` on dismiss) is outside the accepted §3 scope and would require a new SHA and compile; it changes no kernel behaviour and no witness meaning. Work-around for this run: relaunch the harness and press Enter **before** any Export (the pre-enter checkpoint is already frozen in §5, so a second one is not needed); export only after Enter, and hand the file off (Save to Files / AirDrop) from the first sheet that appears.

## 8. Standing

```
SUBJECT              728924819 (dylib 1AEBEE45-…)
ENTER                EXECUTED twice (K00-983b2f79 → gen 487 · K00-248d5aa6 → gen 52) · SURVIVED both · LOOPING · listening reached 4× for ≤ 778 ms, never held
PRE-WITNESS-02 §3    MET (guard exercised at gen 2; failure journalled; RecoveryPolicy road taken)
K00-W1 crash         CLOSED
K00-W2 unrecordable  CLOSED
K00-W3 NEW           self-provoked, unbounded route-recovery rebuild loop (E18 shape inside the kernel) — 584 gen / 6.2 min
K00-W4 NEW           the route-recovery path outlives Leave (engine rebuilt after session_released; idle→recovering orphan)
LEAVE                HELD as a session act (one deactivation, release, idle) in both sessions
K00-03               FAIL · K00-10 exercised once, not governing the loop · K00-17 FAIL on the one W4 edge
THRESHOLDS           UNCHANGED · ARCHITECTURE UNCHANGED · CANDIDATE B/C NOT AUTHORIZED · REPAIR NONE
RECORD               OPEN — awaiting founder attestation and ruling
```

## 9. Founder attestation (verbatim)

> Founder attestation — 2026-09-12: I witnessed KERNEL-00 survive entry without crashing, intermittently reach listening, and then enter an unbounded configuration-change/rebuild loop; I also witnessed Leave deactivate and release the session while one already-in-flight configuration-change reaction outlived the member's exit. I attest that the run-2 record fairly represents what occurred.

**Protocol fields — founder ruling: not filled from inference.** Each is `UNKNOWN` until the founder states it:

```
launches by icon tap       UNKNOWN (founder confirmation required)
debugger never attached    UNKNOWN (founder confirmation required)
Enter once per session     UNKNOWN (founder confirmation required)
10:26–10:33 action         UNKNOWN (founder recollection required)
Apply faults never tapped  UNKNOWN (founder confirmation required; harness bookkeeping shows manual interventions 0, which is a different counter)
run-1 debug.dylib UUID     UNRESOLVED — stays so until an actual run-1 .ips binary-images line supplies it (non-blocking)
```

## 10. Founder ruling — PRE-WITNESS-03 OPEN (verbatim scope)

Architecture NOT reopened. W3 and W4 are a bounded defect in the configuration-change / route-recovery seam.

```text
PRE-WITNESS-03 — CONFIGURATION-CHANGE / ROUTE-RECOVERY SEAM

A. EXIT GUARD
   If inConversation == false:
   - configuration-change notifications are journalled and dropped
   - no generation is created
   - no graph is built
   - floor remains idle

B. BOUNDED ROUTE RECOVERY
   AVAudioEngineConfigurationChange may no longer call
   rebuildGraph(route_recovery) directly.

   Any configuration-change rebuild that is treated as a fault/recovery
   must pass through the existing RecoveryPolicy and therefore the
   ratified 3-per-fault-class / 60 s ceiling.

C. VP CONTROL
   Add a harness-only, pre-Enter voice-processing ON/OFF control.
   - default remains ON
   - setting is journalled
   - it does not alter architecture
   - run OFF once as the causal discriminator required by
     PRE-WITNESS-02 §4

D. DIRECT-REBUILD SOURCE GATE
   A configuration-change handler may not directly invoke rebuildGraph.
   The unbounded path must become structurally impossible.
```

Not authorized yet: candidate B deferral · candidate C reclassification · threshold changes · new recovery budgets · STT/TTS/providers · turn work · lower-level AudioUnit migration · architecture amendment · legacy repair. **H1 HELD out of PRE-WITNESS-03** (real harness bug with a workable bypass; not to be mixed into a causal audio experiment).

Acceptance conditions (verbatim):

```text
EXIT
session_released
→ no later graph_started / graph_rebuilt
→ floor remains idle

RECOVERY
configuration-change reactions cannot generate indefinitely
→ bounded by existing RecoveryPolicy
→ budget exhaustion yields degraded

VP OFF CONTROL
if repeated configuration changes disappear:
    local evidence supports VP-induced reconfiguration
if they continue:
    VP attribution is falsified

NO B/C DECISION
until that control journal exists
```

Founder's subtle point, preserved: *if the VP-on run now consumes the recovery budget on every ordinary entry, that is not success merely because it eventually degrades. It proves the path is bounded, but also confirms that an expected lifecycle event is being misclassified as a fault. That would be the evidence needed to rule on B/C.*

Standing: KERNEL-00 RUN 2 ATTESTED · W3 CONFIRMED · W4 CONFIRMED · PRE-WITNESS-03 OPEN (A + B + C + D) · H1 HELD · B/C NOT YET CHOSEN · next: implement the bounded seam → compile gates → VP-OFF control run → the journal decides B/C.
