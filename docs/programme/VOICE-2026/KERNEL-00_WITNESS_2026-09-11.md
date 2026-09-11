# KERNEL-00 · Device witness record — 2026-09-11

**Lane:** VOICE-2026 · KERNEL-00 · **Subject:** `488e0666c` (`488e0666cfe7501cb55df14bc12dc416f4f7bd5d`)
**Law:** `ARCH-01/06_KERNEL-00_ACCEPTANCE_LAW.md` (K00-01…18, thresholds ratified ×6, unchanged)
**Runbook:** `KERNEL-00_RUNBOOK_2026-09-11.md` §3 (procedure) · §4 (this template)
**Result:** **FAIL AT ENTRY** — the organism did not enter conversation. Reproduced on every attempt. Two findings (K00-W1, K00-W2). Thresholds untouched. Architecture untouched. No repair performed. **Record SEALED 2026-09-11 17:06 (founder attestation + human-only fields filled).**

> A failure is evidence. This record keeps what the organism did, what iOS said, and what the kernel could not say for itself.

---

## 0. Pre-witness liveness checkpoint (founder-frozen, verbatim)

Exported from the harness before any member act. Session `K00-3585a3c7`. Three records, `seq` 1 → 3 contiguous.

```jsonl
{"cause":"didBecomeActive","component":"Harness","event":"app_lifecycle","evidence":{"audioSession":"inactive","floor":"idle","inputFlow":"unknown"},"generation":0,"seq":1,"session":"K00-3585a3c7","timeMonotonicMs":765159377}
{"cause":"willResignActive","component":"Harness","event":"app_lifecycle","evidence":{"audioSession":"inactive","floor":"idle","inputFlow":"unknown"},"generation":0,"seq":2,"session":"K00-3585a3c7","timeMonotonicMs":766221561}
{"cause":"didBecomeActive","component":"Harness","event":"app_lifecycle","evidence":{"audioSession":"inactive","floor":"idle","inputFlow":"unknown"},"generation":0,"seq":3,"session":"K00-3585a3c7","timeMonotonicMs":766231850}
```

```text
PRE-WITNESS CHECKPOINT

session              K00-3585a3c7
seq                   1 → 3 contiguous
floor                 idle throughout
audioSession          inactive throughout

HARNESS LIVENESS      PROVEN
JOURNAL APPEND        PROVEN
EXPORT PATH           PROVEN
PRE-ENTER MUTATIONS   ZERO

K00-01                NOT YET SPENT   (pre-enter purity; one-owner obligation testable only after enterConversation)
K00-02+               NOT YET SPENT
K00-16                CONSISTENT · NOT YET FINAL
WITNESS CLOCK         NOT STARTED
```

The 10 ms resign/active pair one second after launch is observed lifecycle evidence, no defect claim. Recorder custody rule: mid-run exports are lawful checkpoints (append-only, non-destructive); a termination after the last checkpoint is recorded as termination with the gap named. That rule applied today.

---

## 1. Build identity

```text
native SHA           488e0666c (detached, /Users/soullab/MAIA-SOVEREIGN; working tree M only on the xcodegen-materialised Harness/Info.plist)
compile of record    KERNEL-00_MAC-COMPILE-02_2026-09-11.md — swift build PASS · swift test 17/17 · gate 13/13 · xcodegen PASS · unsigned iOS PASS · signed device PASS
artifact             SAME-SOURCE REBUILD — signed CLI build from the witness checkout
                     xcodebuild -project VoiceKernelHarness.xcodeproj -scheme VoiceKernelHarness
                       -destination id=00008140-00163D9922E0801C DEVELOPMENT_TEAM=ZVK2X646Z2 CODE_SIGN_STYLE=Automatic
                       -allowProvisioningUpdates build  →  ** BUILD SUCCEEDED **
                     codesign: Identifier=life.soullab.voicekernel.k00 · TeamIdentifier=ZVK2X646Z2
                     Mach-O UUID 81D0C25C-73C9-39BE-B617-CF1020D0A9A4 (matches all three device crash reports)
install / launch     xcrun devicectl device install app / process launch (device A0736AC8-793B-516F-AC72-C076DB6CEE38) — "Launched application with life.soullab.voicekernel.k00"
Xcode GUI build      FAILED before this run with exactly one error: Signing for "VoiceKernelHarness" requires a development team.
                     (generated .xcodeproj carries no team; project.yml deliberately sets none) — operator evidence, not a kernel defect
launch provenance    (founder correction, verbatim)
                       run 1 launch        devicectl
                       run 2 launch        Xcode debugger
                       crash binary        UUID matched signed CLI artifact
                       binary replacement  not established
                       subject             488e0666c
                     "Xcode" here means launched/debugged under Xcode only; the claim that Xcode replaced the CLI binary is NOT established.
iOS / device         iPhone 16 Pro Max · iOS 26.6.1 (23G83) Beta  [founder-read from the connected device after the seal; the
                     earlier "iOS 18.7" here was the WebKit user-agent string from the legacy captures, not the OS — corrected in
                     place, not erased. Xcode's team label "Kelly Nezat" IS team ZVK2X646Z2 (Individual, isFreeProvisioningTeam=0),
                     per Xcode's stored account metadata read by the founder; the label is not evidence, DEVELOPMENT_TEAM is.]
route hardware       built-in only exercised (Pi8 present in the room, never reached)
legacy process       device process list checked immediately after launch: only VoiceKernelHarness present; no MAIA/Capacitor App process
```

---

## 2. The witness — what happened

### Run 1 — 16:23 (devicectl launch)
Tap **Enter conversation** → process terminated. No journal after the tap (recorder in-memory; a re-export produced only the §0 checkpoint). Device crash report 16:23:49, `SIGABRT / Abort trap: 6`.

### Runs 2 and 3 — 16:24:16, 16:25:06 (device crash reports)
Same tap, same termination, same failing chain, same binary UUID.

### Run 4 — ~16:28 (Xcode debugger attached)
Phone screen at the moment before death, verbatim from the screenshot:

```text
Floor · generation 1        entering        cause: enterConversation
session                     active
inputFlow                   unknown
outputFlow                  idle
input rms / peak            0.00000 / 0.00000
callbacks (gen)             0
recovery                    gen 1 · attempts 0/3
Mic: enabled · Output: enabled
```

Xcode stopped on the exception in `AudioGraph.start(voiceProcessing:clock:)` at `input.installTap(onBus: 0, bufferSize: 1024, format: inFormat)`, locals `voiceProcessing = true`, `gen = 2`. Console, verbatim:

```text
AURemoteIO.cpp:1135  failed: -66635 (enable 3, outf< 1 ch,      0 Hz, Float32> inf< 1 ch,      0 Hz, Float32>)
AVAEInternal.h:71    required condition is false: [AVAEGraphNode.mm:834:CreateRecordingTap: (IsFormatSampleRateAndChannelCountValid(format))]
*** Terminating app due to uncaught exception 'com.apple.coreaudio.avfaudio', reason: 'required condition is false: IsFormatSampleRateAndChannelCountValid(format)'
libc++abi: terminating due to uncaught exception of type NSException
```

Failing chain (identical in the three device crash reports and the debugger backtrace):

```text
CreateRecordingTap
→ AVAudioEngineImpl::InstallTapOnNode
→ AVAudioNode.installTap
→ AudioGraph.start
→ VoiceKernel.startGraph
→ VoiceKernel.rebuildGraph
→ VoiceKernel.handleConfigurationChange
```

### The causal sequence (observed and reproduced; not asserted as Apple-universal)

```text
tap Enter            → floor entering · generation 1 · session activated by the authority (one owner)
generation 1         engine started with voice processing on; input tap installed; ZERO input callbacks; inputFlow unknown
OS                   AVAudioEngineConfigurationChange
kernel               handleConfigurationChange → journal engine_configuration_changed → rebuildGraph(cause: route_recovery) → generation 2
generation 2         new AVAudioEngine built inside the OS reconfiguration window; input.outputFormat(forBus: 0) = 0 Hz
                     installTap(format: 0 Hz) → NSException → process dead
```

The rebuild path is wrapped in `do/catch` expecting a Swift error; `installTap` fails by Objective-C exception, so the designed `graph_rebuild_failed → recovery_requested → RecoveryPolicy` path never ran. The strong local reading is that enabling voice processing causes iOS to reconfigure IO at first start and announce it with the same notification the kernel treats as route recovery. That mechanism is recorded as **observed and reproduced on this device**, not as a universal statement about every first entry on every iOS.

---

## 3. Findings

**K00-W1 — entry sequencing.** `AudioGraph.start()` takes the input node's reported format and installs the tap with no guard on sample rate or channel count, and the kernel rebuilds a new generation synchronously (one actor hop) inside the configuration-change notification, when the hardware format is not yet valid. Self-inflicted, deterministic on this device, reproduced four times.

**K00-W2 — unrecordable failure.** The failure class is `NSException`. Swift `do/catch` cannot see it, so the flight recorder never journals its own death and the bounded recovery policy (3 attempts / fault class / 60 s → degraded) never engages. The organism died with a named cause, but the only witnesses were iOS and the debugger. The law says a failure is evidence; this failure produced none from inside the organism. That is a hole at the observability seam, not at the recovery seam.

What is **not** a finding: rebuild-not-resume (SURVEY-01 §7, ratified) stands; one session owner held for the seconds it lived; no competing writer appeared; the organism did not loop.

---

## 4. Checklist — K00-01 … K00-18

```text
K00-01  one session mutator          OBSERVED (session active under the authority, no competing writer) · NOT SPENT (journal lost)
K00-02  one activation / deactivation OBSERVED entry activation · NOT SPENT
K00-03  entry ≤ 1500 ms to healthy    FAIL — healthy never reached; process died in generation 2
K00-04  physiology longitudinal       NOT MEASURABLE
K00-05  cancel ≤ 100 ms               NOT MEASURABLE
K00-06  duplex physiology / echo      NOT MEASURABLE
K00-07  digital-zero → recovery       NOT MEASURABLE
K00-08  stalled output → recovery     NOT MEASURABLE
K00-09  stale callback dropped        NOT MEASURABLE
K00-10  persistent fault → degraded   NOT MEASURABLE
K00-11  route transitions (Pi8 named) NOT REACHED
K00-12  interruption recovery         NOT REACHED
K00-13  media services reset          NOT REACHED
K00-14  background policy HOLD        NOT REACHED
K00-15  manual interventions = 0      n/a (no witness window existed; each Enter tap was a member act, not an intervention)
K00-16  nothing else in the build     CONSISTENT (harness-only process on device; no legacy actor announced itself) · NOT FINAL
K00-17  causal replay                 NOT MEASURABLE (no journal survived any run)
K00-18  60 min / ≥ 50 cycles          NOT REACHED
```

Thresholds used: the ratified six, unchanged. None loosened, none consulted beyond K00-03.

Journal: §0 checkpoint attached above (`kernel00-K00-3585a3c7-1789152361.jsonl`). No run journal exists; the recorder is in-memory and every run terminated before export. Replay: not possible.

Manual interventions: 0 (no conversation window existed).

Microphone permission (human-only facts, founder-reported 17:06, device not changed):

```text
1. microphone permission dialog on any Enter attempt
   NOT RECALLED — founder: "I don't think a permission popup happened"
   (recorded as the founder's recollection, not as a fact about the device)

2. Settings → Apps → VoiceKernel K00 → Microphone
   TOGGLE PRESENT · ON   (screenshot 17:06; Cellular Data also ON; no other permissions listed)
```

Reading: a Microphone toggle exists only after the app has requested access, and ON means the grant stood at the time of reading. So at 17:06 the harness held microphone permission. Whether the grant preceded the four crashes or was answered unnoticed during one of them is not established by these two facts. What they do establish: the 0 Hz input format at generation 2 is not explained by a denied microphone, which keeps K00-W1 on the configuration-change timing and guard, as read in §2.

Device state at 17:0x, read from the Studio: VoiceKernelHarness resident and running on the unlocked phone (not crashed at that moment).

---

## 5. Standing and ruling

```text
KERNEL-00 DEVICE WITNESS

subject             488e0666c
artifact            signed CLI binary (UUID 81D0C25C-73C9-39BE-B617-CF1020D0A9A4) · binary replacement not established
entry               FAIL
reproduced          4 attempts (3 device crash reports + 1 debugger-captured)
termination         SIGABRT / Objective-C exception
K00-03 onward       NOT MEASURABLE
thresholds          UNCHANGED
architecture        UNCHANGED
repair              NONE
```

**Founder ruling (2026-09-11): PRE-WITNESS-02 OPEN — only after this record is sealed. Not KERNEL-01. Not a new architecture. Not a lower-level audio-stack migration.** *This failure does not argue for another architecture. It argues for repairing the first physical seam where the architecture met iOS.* Bounded to:

```text
PRE-WITNESS-02 — K00 ENTRY SEAM

PURPOSE
Make entry and configuration recovery survivable and journalable
without changing the ratified architecture or thresholds.

IN SCOPE
1. Validate input format before every input-tap installation.
2. An invalid format must never reach AVAudioNode.installTap.
3. Invalid/unready format becomes a journaled graph-start/rebuild failure.
4. That failure enters the existing bounded RecoveryPolicy.
5. Resolve configuration-change behavior while floor == entering:
      rebuild now
      defer/wait
      or another bounded state transition
   by falsification against the witnessed sequence.
6. Preserve generation custody and one-engine-per-generation law.

OUT OF SCOPE
STT · TTS · providers · turn detection · BENCH-01 · BRIDGE-01 · MIGRATE-01
threshold changes · architecture amendment · legacy repair · lower-level AudioUnit migration

PRINCIPLE
Do not try to catch NSException. Make the invalid call unreachable.
The kernel's Swift recovery architecture is useful only if every expected platform
condition is converted into a Swift-visible, journalable state before calling an API
whose violated preconditions abort the process.
```

Sequence ruled: seal witness → open PRE-WITNESS-02 → repair only the entry seam → compile gates → rerun the same KERNEL-00 witness. Nothing else moves. Not yet ruled: whether the implementation is guard-only, deferred configuration recovery, or both. PRE-WITNESS-02 falsifies those alternatives against the observed sequence before choosing. Then the same device witness is rerun from Enter under the unchanged runbook. §20.1 of the research blueprint ("begin with the higher-level engine path; move lower only if it cannot meet the gates") is not triggered by this record: the defect is sequencing and guard within the higher-level path, not a demonstrated ceiling of it.

**Founder attestation — 2026-09-11:** *I witnessed KERNEL-00 fail at entry on the iPhone as recorded here; the failure was reproduced without repair or threshold change, and I attest that this record fairly represents what occurred.*

**Seal status: SEALED — 2026-09-11 17:06.** Attested; both human-only fields filled from the founder's report. Under the ruling above, PRE-WITNESS-02 is OPEN from this seal.

---

## Appendix — chronology of the day (for provenance, not adjudication)

- Harness first reached the phone via `devicectl` after the Xcode GUI build failed on the missing team (one error, verbatim above).
- Three legacy `App` console captures were taken during the same afternoon and classified separately: two Pi8 registered-arm captures held with E23; one built-in **unregistered-arm** capture (the registration branch is not an ancestor of `488e0666c`) held as E18-class, reconfirming that Bluetooth is not required for the legacy pattern. None spends or contaminates this witness: the device process list showed no legacy process at harness launch.
