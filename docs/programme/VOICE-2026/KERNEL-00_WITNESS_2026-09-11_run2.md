# KERNEL-00 · DEVICE WITNESS · RUN 2 — 2026-09-11

**Status: OPEN — Enter EXECUTED · organism SURVIVED ENTRY · never reached listening · self-provoked rebuild loop (K00-W3) · awaiting founder attestation + ruling.**
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

Every generation from 3 to 14 follows one shape: `route_changed` (input data source `-`) → `graph_started` (`engineRunning: false`, format valid 48 kHz, voice processing on) → `route_changed` (data source `Bottom`) → `engine_configuration_changed` 134–509 ms later → `rebuildGraph(cause: route_recovery)` → next generation. **Fourteen generations in 9.3 s, still going at export.** No `input_health_sample` in the whole journal; zero input callbacks in any generation (`callbacks (gen) 0`); floor `recovering` from seq 17 onward and never `listening`. RecoveryPolicy attempts spent: **1** (the gen-2 refusal). The other eleven rebuilds spent nothing, because the route-recovery path does not consult the policy.

## 7. Findings

**PRE-WITNESS-02 §3 — MET, EXACTLY AS PLANNED.** K00-W1 as a *crash* is closed: the invalid format (0 Hz on generation 2's fresh engine, built inside the reconfiguration window) was refused by the precondition before `installTap`, thrown as a Swift error, journalled with the format it saw (`graph_start_refused`), routed through the existing `graph_rebuild_failed` → `recovery_requested` → `recovery_scheduled` road, and the RecoveryPolicy's 500 ms first backoff was honoured to within 15 ms. K00-W2 is closed: the failure is in the journal, with evidence. The recorder outlived its own fault. **The process did not die on any Enter.**

**K00-W3 — NEW · the route-recovery rebuild is self-provoking and unbounded.** With voice processing on, every fresh generation's start is followed 134–509 ms later by an `AVAudioEngineConfigurationChange`; the kernel treats every such change as route recovery and rebuilds **directly**, bypassing RecoveryPolicy; the new generation provokes the next change. The recovery act is the cause of the next fault — the E18 shape, reproduced inside the one-owner kernel, in the seconds after entry. The ratified ceiling (3 attempts / fault class / 60 s) never applies to this path because the path is not classed as a fault; and `beginGeneration` resets the HealthSupervisor's windows on every rebuild, so neither the 1500 ms entry timeout nor the 1 s physiology sample ever gets to run — the ceiling that would have bounded the loop is reset by the act it should count (the E23 §3.3(2) anti-pattern, now witnessed in Voice 2026's own organism). Facts, not yet mechanism: `engineRunning: false` immediately after every `engine.start()` that returned without throwing; the route change pairs (`-` → `Bottom`) bracket each generation; the format was VALID at every notification instant except gen 2's fresh engine. **Inference, kept as inference:** enabling voice processing on a new engine reconfigures the session's input data source, which posts a route configuration change, which posts the engine configuration change — i.e. the loop's driver is the kernel's own start-with-VP. The plan's §4 voice-processing-off control is now the directly indicated discriminator; the harness has **no VP toggle** (`voiceProcessingEnabled` is never mutated), so the control needs a new SHA, which is a founder act.

**On §4 A/B/C.** Candidate A (rebuild-now + guard) was tested first, as ruled: it prevents death and it does not prevent the loop. The gen-2 refusal shows the 0 Hz belongs to a *fresh engine created inside the window* — that is candidate B's premise, and B would remove that one refusal; it would not by itself stop a loop that each valid start re-provokes. C (reclassify the change as an observation rather than a recovery trigger) is the one that speaks to K00-W3 directly. **No candidate is chosen here.** Both B and C remain NOT AUTHORIZED; the evidence for the founder's ruling is above.

**Checklist (K00-01…18) as measured in this run**

| Law | Result | Evidence |
|---|---|---|
| K00-01 one session mutator | HELD | only `AudioSessionAuthority` records mutate; kernel/harness none |
| K00-02 one activation on entry | HELD | exactly one `session_activated` (seq 7); every later session record is a `route_changed` observation |
| K00-03 entering → listening ≤ 1500 ms | **FAIL** | never `listening`; `recovering` from seq 17 |
| K00-04 physiology | NOT MEASURABLE | zero callbacks, no samples |
| K00-05/06 output / duplex | NOT REACHED | |
| K00-07/08 dead-input / stall windows | NOT MEASURABLE | supervisor reset every 134–509 ms |
| K00-09 generation gate | CONSISTENT | no stale-callback records (no callbacks at all) |
| K00-10 bounded recovery 3/60 s at 500/1000/2000 | **EXERCISED ONCE, CORRECT; NOT GOVERNING** | attempt 1 at 500 ms honoured; eleven route rebuilds outside the budget |
| K00-11 route | built-in only this run | |
| K00-12–15 | NOT REACHED | |
| K00-16 nothing else in build | CONSISTENT | |
| K00-17 replayable causality | HELD | every automatic act carries `causeSeq` (config changes are observations) |
| K00-18 | NOT REACHED | |

H1 (harness export latch) stands as recorded below, unrepaired.


**H1 — harness export sheet re-presents itself (harness, not kernel).** After the first Export, the share sheet reappears in front of the screen on every view update, so the member cannot reach **Enter conversation** (founder, phone clock 10:26: "it keeps pushing this in front of screen before I can choose"; the offered file is still 678 bytes = the three pre-enter records, session `K00-c9bdd9a0`, so Enter has not registered). Cause, read from source `HarnessView.swift:24`: `.sheet(item: Binding(get: { m.exportURL.map(ExportItem.init) }, set: { _ in }))` — the setter is a no-op, so dismissal never clears `HarnessModel.exportURL`; the dismissal itself causes `willResignActive`/`didBecomeActive`, which publish a snapshot, which re-renders, which re-presents. VOICE-07 is not violated (the harness still holds no voice state), but the projection has a latch. Run 1 passed through this by timing. **Not repaired in this run** — a harness-only fix (clear `exportURL` on dismiss) is outside the accepted §3 scope and would require a new SHA and compile; it changes no kernel behaviour and no witness meaning. Work-around for this run: relaunch the harness and press Enter **before** any Export (the pre-enter checkpoint is already frozen in §5, so a second one is not needed); export only after Enter, and hand the file off (Save to Files / AirDrop) from the first sheet that appears.

## 8. Standing

```
SUBJECT              728924819 (dylib 1AEBEE45-…)
ENTER                EXECUTED once (session K00-983b2f79) · SURVIVED · LOOPING · never listening
PRE-WITNESS-02 §3    MET (guard exercised at gen 2; failure journalled; RecoveryPolicy road taken)
K00-W1 crash         CLOSED
K00-W2 unrecordable  CLOSED
K00-W3 NEW           self-provoked, unbounded route-recovery rebuild loop (E18 shape inside the kernel)
K00-03               FAIL · K00-10 exercised once, not governing the loop
THRESHOLDS           UNCHANGED · ARCHITECTURE UNCHANGED · CANDIDATE B/C NOT AUTHORIZED · REPAIR NONE
RECORD               OPEN — awaiting founder attestation and ruling
```
