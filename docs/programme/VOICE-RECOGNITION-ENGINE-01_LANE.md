# VOICE-RECOGNITION-ENGINE-01 — Layer 2 recognition upgrade

**Status:** **FIRST NATIVE COMPILE COMPLETE — ONE CLASS A SDK MISMATCH IDENTIFIED — REPAIR APPLIED — SECOND COMPILE PENDING** (§11). Device witness pending.
`608e3ac` (implementation) + `6bfc5d2` (governing record) on
`claude/layer-2-recognition-upgrade-99d1re`. Not a promotion candidate. The
development act *in this environment* is closed; **the lane is not.** Its
terminal state is assigned only after the Mac witness, and is one of
(**vocabulary revised by founder ruling after §9, see §10**):
`CLOSED — NATIVE CANDIDATE REJECTED` · `CLOSED — NATIVE CANDIDATE EXPERIMENTAL` · `CLOSED — PRODUCTION INTEGRATION RECOMMENDED`.
(Superseded names: legacy retained / modern experimental / promotion recommended.)
No further building before then (founder ruling 2026-09-03, §8).
**Remote pre-witness pass recorded 2026-09-03 (§9):** provenance resolved on the
committed record, JS gates green, native compile + device witness **blocked** in
that environment (no Apple toolchain). Decision **NOT REACHED**. Mac handoff in §9.6.
**Founder ruling after §9 (§10):** the witness question is narrowed to *does the new
native recognition subsystem compile and behave well enough to become MAIA's
candidate recognition subsystem* — not *should production flip to SpeechAnalyzer*.
The Mac continues from `5a5ad687` on this branch.
**Authorized:** 2026-09-03, founder directive (this document is the ruling the
Voice Ecology Roadmap §5 recorded as *not recovered*; it is dated here, not
back-dated).
**Kind:** bounded engineering migration, not a conceptual lane.

---

## 1 · The target

Not *"replace Apple's old recognizer with Apple's new recognizer."*

**Stop organising MAIA's hearing around the lifecycle of a speech-recognition
task.** Continuous audio → reliable words → MAIA decides when the human is
finished.

```
AVAudioEngine
      │ raw AVAudioPCMBuffer
      ↓
MAIA recognition-engine boundary        ios/App/App/Recognition/RecognitionEngine.swift
      │
      ├── iOS 26 + SpeechTranscriber supported
      │      → SpeechAnalyzer + SpeechTranscriber      SpeechAnalyzerEngine(.transcriber)
      ├── iOS 26 + SpeechTranscriber unavailable
      │      → SpeechAnalyzer + DictationTranscriber   SpeechAnalyzerEngine(.dictation)
      └── iOS 16–25, or neither module supported
             → SFSpeechRecognizer                      LegacySFSpeechEngine
```

No deployment-floor increase: `IPHONEOS_DEPLOYMENT_TARGET` stays 16.0; the
modern engine is `@available(iOS 26.0, *)`.

## 2 · The vocabulary change

The old `started / stopped / partial / final` conflated four things. The
boundary now speaks three orthogonal kinds of evidence, and refuses a fourth:

| Evidence | Values | Who decides |
|---|---|---|
| Capture | `flowing` · `unavailable` | VoiceController watchdog (buffers arriving?) |
| Recognition | `producing` · `stalled` | VoiceController watchdog (voiced audio → segments?) |
| Transcript | `volatile` · `finalized` | the engine |
| **Human turn** | `open` · `complete` | **MAIA only** — `lib/voice/recognition/humanTurnAuthority.ts` |

`finalized` = *the recognizer will not revise these words*.
It is never *the person has finished the thought*. No engine event, no plugin
event, and no field on `VoiceTranscript` can carry turn completion. The only
path to `complete` is `HumanTurnAssembler.closeTurn(reason)` called by
silence / turn authority (or an explicit member act).

A second contract concept was needed so no engine has to impersonate another:
**composition**. SFSpeech re-sends the whole utterance every callback
(`cumulative`); SpeechAnalyzer sends chunks — finalized appends, volatile
replaces the pending tail (`incremental`). The assembler stitches both.

## 3 · Mandate → what shipped

| Item | State | Where |
|---|---|---|
| M0 Preserve baseline as witness control | ✅ structural | `RecognitionEnginePreference.defaultPreference = .baseline`; policy `legacy_until_witnessed`. Modern engine is reachable only by explicit `engine: 'modern'`. |
| M1 Decouple tap from `SFSpeechAudioBufferRecognitionRequest` | ✅ | `AudioSessionManager.installInputTap(consumer:)` hands raw buffers to a closure; `Speech` no longer imported there; teardown cancels through `RecognitionTeardownHandle`. |
| M2 Engine-neutral contract | ✅ | `Recognition/RecognitionEngine.swift` (+ JS mirror in `lib/voice/contract/MAIAVoiceProvider.ts`). |
| M3 Legacy engine unchanged as fallback | ✅ | `Recognition/LegacySFSpeechEngine.swift` — same request, partials on, single pass, 216 swallowed, stop = cancel. |
| M4 Availability-gated SpeechAnalyzer + SpeechTranscriber | ✅ written, ⏳ uncompiled | `Recognition/SpeechAnalyzerEngine.swift` mode `.transcriber`. |
| M5 DictationTranscriber fallback | ✅ written, ⏳ uncompiled | same file, mode `.dictation`; selected by `RecognitionEngineSelector` when SpeechTranscriber is unsupported. |
| M6 Map into MAIA pipeline without recognizer-finality closing the turn | ✅ | `VoiceController.swift` emits compat `transcriptPartial/Final` + stability/composition/segmentId; `humanTurnAuthority.ts` is the only place `complete` exists. |
| M7 Capability telemetry | ✅ | `RecognitionCapabilities.toDictionary()` → `engineSelected` event + `getCapabilities()` method. OS, engine, availability, locale support, reason. No transcript content (gated). |
| M8 Compile + unit + static gates | ◐ | Static gates + JS unit tests green here (see §5). **Xcode compile is NOT witnessed in this environment** — no Swift toolchain. First device-side step is `xcodebuild` on the branch. |

**Kept, untouched:** JS capture heartbeat (`lib/voice/micLiveness.ts`), silence
authority and the `ContinuousConversation` pipeline, mic state / ownership,
TTS↔listening transition authority in `AudioSessionManager`, duplicate-admission
protection (generalised into `HumanTurnAssembler.admit`), utterance identity
(`utteranceId` rotates on close), telemetry.

**Legacy-only, retire after device proof, not before:** SFSpeech task-boundary
stitching, restart machinery, cumulative-composition re-send handling.

## 4 · Findings that changed the plan

1. **`VoiceController.swift` was never in the Xcode project.** The Sources
   build phase listed only `AppDelegate`, `AudioSessionManager`,
   `HandwritingOCR`. Unless the local Xcode had an uncommitted addition, the
   Phase 1 scaffold never compiled into any build, and `/voice-controller-test`
   could only have reported "plugin not implemented". This lane registers
   `VoiceController.swift` plus the four `Recognition/` files (new group
   `Recognition`, ids `A8D00020260903…`). If the local project already had
   `VoiceController.swift` added, expect a trivial pbxproj merge on that line.
   **Resolved on the committed record in §9.4** (2026-09-03): never registered
   before this lane; and the conversation surface never bound to it at all.
2. **Build number.** `project.pbxproj` carries `CURRENT_PROJECT_VERSION = 2511`.
   The 2515 baseline named in the directive is not in the repo — it is either a
   local archive counter or a TestFlight build number set outside git. M0 is
   satisfied structurally (baseline engine remains default) rather than by a
   build-number pin; note which build the witness device actually runs.
3. **Roadmap §5** recorded Apple SpeechAnalyzer as *not recovered — do not
   invent*. This directive is the ruling. §5 now points here, dated 2026-09-03.

## 5 · Gates

```
npx jest __tests__/voice-recognition-engine-01-boundary.test.ts        # 24 structural gates, M0–M8
npx jest __tests__/voice-recognition-engine-01-turn-authority.test.ts  # 13 behavioural, M6
npm run typecheck                                                       # no-regression gate
```

Static gates prove: no `SFSpeech` in AudioSessionManager; no recognizer
construction in VoiceController; iOS 26 symbols only under `#available`;
deployment target 16.0; default preference baseline; VoiceController emits no
turn event; telemetry keys carry no text; all Swift files in the Sources phase.

They do **not** prove the SpeechAnalyzer engine transcribes well, or that the
iOS 26 API signatures used here compile against the installed SDK. That is §6.

## 6 · Witness (STOP — nothing below is done)

```
baseline build (2515 lineage, engine=baseline)
      ↓  same device · same conversational walk
modern build   (engine=modern)
      ↓
COMPARE: finalized segments · stall events · pause survival · what the
         assembled utterance held when MAIA (not the recognizer) closed the turn
```

Surface: `/voice-controller-test` (founder-gated). Preference chips
`baseline | modern | dictation | legacy`; **Probe** shows the M7 telemetry
without starting; **Close turn** is the MAIA-authority act.

**Compile first.** API symbols this lane relies on (Xcode 26 SDK): `SpeechAnalyzer(modules:)`,
`SpeechAnalyzer.bestAvailableAudioFormat(compatibleWith:)`, `start(inputSequence:)`,
`finalizeAndFinishThroughEndOfInput()`, `cancelAndFinishNow()`, `AnalyzerInput(buffer:)`,
`SpeechTranscriber(locale:transcriptionOptions:reportingOptions:attributeOptions:)`,
`DictationTranscriber(locale:contentHints:transcriptionOptions:reportingOptions:attributeOptions:)`,
`SpeechTranscriber.isAvailable` (**not** `DictationTranscriber.isAvailable` — the SDK has no such
member; first native compile, §11), `.supportedLocales`, `.results` (`text: AttributedString`, `isFinal`),
`AssetInventory.assetInstallationRequest(supporting:)`. If a signature differs
in the shipped SDK, the fix belongs in `SpeechAnalyzerEngine.swift` /
`RecognitionEngineSelector.swift` only; the boundary does not move.

Only after the modern engine wins the witness: flip
`RecognitionEnginePreference.defaultPreference` to `.modern` (one line), then
remove legacy-only scaffolding.

## 7 · Not in this lane

WhisperKit / Faster-Whisper / Voxtral benchmarking (2B — after Apple is
witnessed), LiveKit / semantic end-of-utterance (Layer 3 — sits above the
winning Layer 2 output and is where the contemplative-pause problem is solved),
continuous restart, background recovery, integration into `OracleConversation`.

---

## 8 · Development-act record — founder ruling 2026-09-03 (after `608e3ac`)

*This section closes the development act in this environment. It does not
close `VOICE-RECOGNITION-ENGINE-01`; see the terminal states in the status line.*

**Classification:** *architecture + implementation complete / native acceptance
pending.* Jest + typecheck validate the contract, the policy, and the JS turn
authority. They cannot establish that the iOS 26 Speech APIs have the
signatures, actor requirements, availability behaviour, audio formats, or
lifecycle semantics the Swift assumes. **No Swift compiler has yet accepted the
new path.** That is why the lane stopped here.

**What is proven:** recognition ≠ turn authority; modern recognition can be
introduced without replacing the known baseline; engines are allowed different
transcript semantics (`cumulative` vs `incremental`) instead of being forced
through a false common model.

**The next act is four things only, in this order, on the Mac with Xcode:**

1. **Compile the branch without repairing architecture.** Learn whether Apple's
   SDK accepts what was written. Any API-signature correction stays local to
   `SpeechAnalyzerEngine.swift` / `RecognitionEngineSelector.swift`.
2. **Resolve the `VoiceController.swift` Xcode-project finding.** Was the
   committed pbxproj genuinely missing it, or did the working Xcode project
   carry an uncommitted registration? This decides how earlier device evidence
   may be read.
3. **Bind the witness to reality.** Repo says `2511`; the historical witness
   says `2515`. Before comparing engines, record the actual: git SHA · app
   build · device · iOS version · Xcode/SDK. Do not silently equate the
   historical `2515` witness with repo build `2511`.
4. **Run the same-device A/B witness.** Same phone, locale, microphone
   conditions, spoken passage. `baseline → modern` — not two builds, not two
   environments.

**Evidence to capture** (liveness, not a dictation benchmark):

| Evidence | Baseline | Modern |
|---|---:|---:|
| finalized textual fidelity | | |
| volatile update behaviour | | |
| recognition stalls | | |
| capture interruptions | | |
| duplicate segments | | |
| dropped phrase endings | | |
| restart behaviour | | |
| latency to usable text | | |
| **transcript state when the human manually closes the turn** | | |

**Do not flip `legacy_until_witnessed`** — even if SpeechAnalyzer sounds
obviously better in the first test. The default changes only after the modern
engine behaves correctly across the whole lifecycle:
`start → speak → hesitate → continue → recognizer events/restarts → explicit human close → next turn`.
That lifecycle is where the previous voice system actually hurt.

**Do not open another recognition-architecture lane.** Unless the compile
exposes a genuinely architectural flaw, stay in this lane through the witness:

```
608e3ac  IMPLEMENTATION COMPLETE
   ↓
XCODE COMPILE
   ↓
DEVICE A/B WITNESS
   ↓
ADJUDICATION
  ↙          ↘
keep legacy   authorize modern default / next slice
default       (a separate, very small follow-on lane:
              promotion policy + production integration —
              not smuggled into this one)
```

**Provenance caveat to preserve prominently:** `VoiceController.swift` apparently
not being compiled before this lane may revise the interpretation of Phase 1
evidence. It does not invalidate the current work, but until build provenance
is resolved (step 2), earlier TestFlight behaviour must not be reasoned about
as though it is known to have come through the native controller.

**Ruling in one line:** *compile, witness, adjudicate. No more building.*


---

## 9 · Remote pre-witness pass — 2026-09-03 (no Apple toolchain)

*Run against the "NATIVE ACCEPTANCE + DEVICE WITNESS" instructions. This
environment is a remote Linux container: Steps 0, 3, 4, 5 (partial), 14, 15
executed; Steps 1, 2 (no Swift touched — invariants held by the gates),
6–13 could not execute. Nothing below claims a compile or a device result.*

### 9.1 Starting state (Step 0)

```
Mac:            none — remote Linux x86_64 container (kernel 6.18), no xcodebuild / swift
macOS:          n/a
Xcode:          n/a
iOS SDK:        n/a
branch:         claude/voice-recognition-acceptance-witness-ffeadt
                (fast-forward of claude/layer-2-recognition-upgrade-99d1re @ 2d74c20;
                 contains 608e3ac + 6bfc5d2 + 2d74c20 — verified with git cat-file)
starting HEAD:  2d74c20
working tree:   clean (nothing to classify)
clone depth:    shallow at start (boundary cc1f1ea); deepened to 4,389 commits
                before any provenance claim below was made
```

### 9.2 Native compile (Step 1) — **NOT WITNESSED**

No Swift was modified. A desk reading of `SpeechAnalyzerEngine.swift` and
`RecognitionEngineSelector.swift` against the iOS 26 Speech API surface as
documented found every symbol the lane relies on (§6 list) matching its
documented signature: `SpeechAnalyzer(modules:)`,
`bestAvailableAudioFormat(compatibleWith:)`, `start(inputSequence:)`,
`finalizeAndFinishThroughEndOfInput()`, `cancelAndFinishNow()`,
`AnalyzerInput(buffer:)`, both transcriber initialisers, `isAvailable`,
`supportedLocales` (async), `results` (`text: AttributedString`, `isFinal`),
`AssetInventory.assetInstallationRequest(supporting:)` → `downloadAndInstall()`.

That is a reading, not a compiler result. Class A (API/signature) failures
remain possible and are the Mac's to observe first. Notes for whoever runs
`xcodebuild`:

- `SWIFT_VERSION = 5.0` in the project → strict-concurrency diagnostics are
  warnings, not errors; non-`Sendable` `self` captured inside `Task` blocks
  will warn, not fail. Do not "fix" warnings in this lane.
- `AsyncStream.makeStream()` sits inside the `@available(iOS 26.0, *)` class;
  no back-deployment concern.
- `ensureAssets(for: [any SpeechModule])` passes an existential array; the
  documented parameter type is the same.

### 9.3 Gates (Step 3)

```
Native compile:      NOT RUN (no toolchain)
Recognition gates:   PASS — boundary 24/24 · turn-authority 13/13 (37/37)
Voice regressions:   10 suites PASS · 1 suite FAIL (pre-existing, see below)
Typecheck:           PASS — no-regression gate green (231 errors vs baseline 239, 0 new
                     diagnostics, 0 in lane files). First run in this container failed with
                     46 `@prisma/client` diagnostics because `npm ci` had not generated the
                     Prisma client; `npx prisma generate` then a clean re-run — an install
                     artifact, not a lane regression.
```

`__tests__/voice-response-toggle-mobile.test.ts` — 2 failures, class **D**
(pre-existing). Proof it is not lane-caused: the suite reads exactly one
source file, `components/OracleConversation.tsx`, and that file is
byte-identical between `a4305f4` (pre-lane base) and HEAD
(`git diff --quiet a4305f4 HEAD -- components/OracleConversation.tsx` → clean).
The assertion looks for the old top-bar marker
`onClick={() => setShowChatInterface(false)}`; the component's input-mode
switch was relocated by earlier work. Not repaired here.

### 9.4 `VoiceController.swift` provenance (Step 4) — **REVISED**

```
VoiceController file introduced:        4d1d2610 · 2026-05-14 · "feat(voice): Phase 1 — Swift
                                        VoiceController scaffold + smoke test". That commit added
                                        the file, registered 'VoiceController' in
                                        capacitor.config.ts packageClassList, and did NOT touch
                                        project.pbxproj.
VoiceController first registered:       608e3ac · 2026-09-03 (this lane). It is the only commit
                                        in the full history whose pbxproj contains the string
                                        "VoiceController" (git log -S over all 4,389 commits).
previous committed build membership:    NONE. Every committed pbxproj from 2026-05-14 to a4305f4
                                        lists exactly AppDelegate, AudioSessionManager,
                                        HandwritingOCR in the Sources phase. The committed
                                        build-2510 (425c11ec) and build-2511 (8614db7c) pbxprojs
                                        carry that same three-file phase.
local uncommitted membership evidence:  NOT DETERMINABLE FROM THIS ENVIRONMENT. Only
                                        `git status -- ios/App/App.xcodeproj` on the Mac can
                                        close this (hypothesis B).
alternate inclusion mechanism:          NONE THAT COMPILES IT. packageClassList is a runtime
                                        NSClassFromString lookup of an already-compiled class —
                                        an unregistered Swift file yields "plugin not
                                        implemented" at the bridge, it does not get compiled.
                                        `npx cap sync ios` (scripts/build-ios.sh:186) syncs web
                                        assets and pods; CocoaPods cannot add app-target
                                        sources. No xcodegen / project.yml in ios/App.
                                        (hypothesis C ruled out)
conclusion:                             A on the committed record — no committed iOS build ever
                                        compiled VoiceController.swift. B is the sole remaining
                                        route by which it could have compiled, and only the
                                        Mac can test it.
confidence:                             HIGH for the committed record; B open.
```

**Attribution finding (stronger than "not established").** The live
conversation surface never bound to `VoiceController` at all:

- `components/voice/ContinuousConversation.tsx:9` imports
  `SpeechRecognition` from `@capacitor-community/speech-recognition`
  (CocoaPod, `ios/App/Podfile:16`); `VoiceMirror.tsx` likewise.
- The build-2510 ARMING trace (`8614db7c`; contract
  `docs/design/contracts/conversation-room-mic-lifecycle.md`) names
  `NativeSpeechRecognition.start()` — the community plugin.
- `VoiceController` was reachable only from `/voice-controller-test`
  (founder-gated), and **no document in the repository records a device
  result from that page**; the Phase 1 commit's "acceptance test (manual,
  on Kelly's iPhone via TestFlight)" has no recorded outcome.

Therefore:

```
Observed device behaviour (builds 2510/2511 mic lifecycle): established.
Attribution to VoiceController:                            not established —
   and for the conversation path, contradicted by the import graph.
```

Consequence for the witness: `Recognition/` engines and the reworked
`VoiceController` are code no member has ever run. The Step 8 A/B is a
**first-run** of both engines, not a regression comparison against prior
`VoiceController` behaviour. Its "baseline" (`LegacySFSpeechEngine` inside
`VoiceController`) is itself first-compiled; the production baseline members
actually experienced is a third path (community plugin). O6 must be read with
that in view — it does not widen this lane's scope.

### 9.5 Build-number lineage (Step 5, repo side only)

```
authority:  CURRENT_PROJECT_VERSION in project.pbxproj (since 425c11ec, 2026-08-17);
            Info.plist CFBundleVersion = $(CURRENT_PROJECT_VERSION)
2496        Info.plist literal (pre-425c11ec); pbxproj said 743 at the same time
2497–2509   no git source; App Store Connect's highest accepted was 2509 (per 425c11ec message)
2510        425c11ec  2026-08-17
2511        8614db7c  2026-08-17  ← repo value at HEAD; the lane does not change it
2512–2515   NOT IN GIT
```

Most probable mechanism for 2515: the fastlane `bump_build` lane
(`ios/App/fastlane/Fastfile:105`) writes a **literal** `CFBundleVersion` into
`Info.plist` via PlistBuddy, replacing `$(CURRENT_PROJECT_VERSION)` in the Mac
working tree without a commit. That is inference, not proof.

**Ruling:** *Build 2515 observed historically; exact source SHA not established.*

The Mac must therefore record, before Step 6: `git status -- ios/App/App/Info.plist`
(a literal there means the tree is bumped outside git) and the actual
`CFBundleVersion` of the installed witness build.

### 9.6 Withheld / blocked — and the Mac handoff

Not executed here, not claimable: Step 1 compile · Step 6 install + Probe ·
Steps 7–11 passage, A/B walk, run records, F1–F10, comparison table ·
Step 12 O1–O6 · Step 13 adjudication. **Decision: NOT REACHED.** Status
line unchanged. No Swift, no default, no routing, no Xcode project change was
made in this pass.

Mac sequence (picks up at Step 0 with §9.1–9.5 already banked):

```bash
git fetch origin claude/voice-recognition-acceptance-witness-ffeadt
git checkout claude/voice-recognition-acceptance-witness-ffeadt
git status -- ios/App/App.xcodeproj ios/App/App/Info.plist     # closes hypothesis B; reveals any literal build number
sw_vers && xcodebuild -version && xcodebuild -showsdks | grep iphoneos
cd ios/App && pod install
xcodebuild -workspace App.xcworkspace -scheme App -configuration Debug \
  -destination 'generic/platform=iOS' -sdk iphoneos build 2>&1 | tee /tmp/recognition-compile.log
grep -E "error:|warning: .*Speech" /tmp/recognition-compile.log
```

Then Steps 6–15 as written in the run. F1–F10, O1–O6, the comparison table
and the terminal `CLOSED — …` state belong to that pass, not this one.


---

## 10 · Founder ruling after the provenance result — 2026-09-03

*Recorded from the founder's revised continuation run, issued after reading §9.
This section governs the Mac witness. It replaces the adjudication vocabulary
in §8 and reinterprets O6; it does not reopen development.*

### 10.1 What the provenance result changed

The lane was framed as *existing native path → engine abstraction → compare
old vs modern → maybe flip default*. §9.4 shows that framing was not
established: the live MAIA conversation has been running through the
community speech-recognition plugin, and `VoiceController.swift` has never
compiled into a committed build.

```
LIVE MAIA CONVERSATION                      NEW NATIVE EXPERIMENT
        ↓                                           ↓
@capacitor-community/speech-recognition      VoiceController
        ↓                                           ↓
existing production recognition path        RecognitionEngine
                                              ↙            ↘
                                    LegacySFSpeech      SpeechAnalyzer
```

Consequence: flipping `legacy_until_witnessed` would not, by itself, change
what a member hears MAIA hear. The witness is therefore

**FIRST NATIVE ACCEPTANCE + COMPARATIVE WITNESS OF THE NEW RECOGNITION SUBSYSTEM**

and its governing question is:

> Does the new native recognition architecture compile and behave well enough
> to become the candidate recognition subsystem for MAIA?

It is *not*: should MAIA production flip to SpeechAnalyzer. Success on the Mac
must not be described as production recognition being upgraded.

### 10.2 Terminal states (revised)

| State | Meaning | Production path |
|---|---|---|
| `CLOSED — NATIVE CANDIDATE REJECTED` | new subsystem not sufficiently viable | unchanged |
| `CLOSED — NATIVE CANDIDATE EXPERIMENTAL` | works, but evidence incomplete or lifecycle uncertain | unchanged |
| `CLOSED — PRODUCTION INTEGRATION RECOMMENDED` | compiles cleanly; witness shows quality, liveness, transcript integrity and turn sovereignty sufficient to warrant integration work | unchanged — **not** authorization to modify production recognition |

**O6 is reinterpreted:** *sufficient comparative evidence exists to decide
whether the new native subsystem merits production-integration work.* It does
not mean the subsystem is integrated into live conversation.

### 10.3 The new boundary (Step 10 of the continuation)

If the Mac reaches `PRODUCTION INTEGRATION RECOMMENDED`, **do not** create or
execute a "modern default promotion" change. The next authorized programme, if
the founder approves it, must address the seam

```
LIVE CONVERSATION  →  ENGINE-NEUTRAL RECOGNITION BOUNDARY
```

and decide how the community-plugin production path is replaced, wrapped, or
retained as fallback — preserving working production voice until separately
witnessed. Candidate name: `VOICE-RECOGNITION-PRODUCTION-INTEGRATION-01`.
Not created, not executed, in this lane.

### 10.4 Remote-side checks made against the revised run (2026-09-03, same container)

Executed from the same environment as §9; the Mac-only steps remain the Mac's.

**Continuation state (Step 0, repo side).** Branch
`claude/voice-recognition-acceptance-witness-ffeadt` at `5a5ad687`, tree clean.
The Mac-local half of Step 0 (uncommitted Xcode registration; literal build
number in `Info.plist`) cannot be answered here — it is the first thing the
Mac records. If the Mac finds neither, hypothesis B in §9.4 closes as
unsupported.

**CI is not a compile substitute.** `.github/workflows/mobile-deploy.yml`
has a `macos-14` job, but on any ref other than `main` or a `v*` tag it runs
only `pod install` and `cap sync ios`; `xcodebuild` is gated behind signing
secrets and those refs. The workflow also triggers on `main`, which is not
this repository's default branch. Not triggered; it would prove nothing.

**One correction to "the lane does not touch the live path" — bounded, and
material for Step 1.** The lane's M1 change to `AudioSessionManager.swift`
lives inside `performFullTeardown()`, which all three plugin methods the live
conversation calls (`prepareForListening`, `prepareForSpeaking`,
`stopAllAudio` — call sites in `ContinuousConversation.tsx`,
`OracleConversation.tsx`, `ttsWithFallback.ts`, `capacitorRecorder.ts`)
execute. Read against the pre-lane routine:

- The SFSpeech task/request cancellation it removed was state the live path
  never populated (the community plugin owns its own recognizer and its own
  `AVAudioEngine`), so nothing the live path relied on is gone.
- `engine.stop()` / `engine.reset()` / `audioEngine = nil` are unchanged.
- The only behavioural delta: `removeTap(onBus: 0)` on the manager's **own**
  private engine is now skipped unless the manager installed a tap. For the
  live path that is a no-op removal skipped — benign, intended-equivalent,
  and unverified until a device runs it.
- The exposure that matters is **compile-time**: `AudioSessionManager.swift`
  now references `RecognitionTeardownHandle`, declared in
  `Recognition/RecognitionEngine.swift`. If any `Recognition/` file fails to
  compile, the whole `App` target fails — including the live conversation
  build. A Step 1 failure is therefore never "just the experiment".

The four plugin method signatures and the `CAPPluginMethod` list are
byte-identical pre/post lane; no JS-visible surface changed.

Recommended addition to the Mac walk, offered for the founder to accept or
strike (it is a smoke, not new scope): after installing the witness build and
before the A/B, open the ordinary `/maia` conversation once and confirm the
mic lifecycle behaves as on build 2511. That is the direct check that the
teardown delta is as benign as the reading says.

### 10.5 Status after this pass

Unchanged: **IMPLEMENTATION COMPLETE — NATIVE ACCEPTANCE AND DEVICE WITNESS
PENDING.** Decision NOT REACHED. Live MAIA conversation recognition path:
**not changed by this lane** (source in a shared Swift file changed with
intended-equivalent behaviour; see §10.4). No Swift, pbxproj, default, or
routing modified in this pass. Mac entry point: §9.6 commands, starting from
`5a5ad687` or later on this branch; adjudicate in §10.2 vocabulary.


---

## 11 · First native compile, Class A repair, accepted live-path gate — 2026-09-03

### 11.1 Evidence provenance

Items marked **[Mac, relayed]** originate from the Mac session
(`/Users/soullab/maia-ds01-witness`) and were relayed by the founder into the
remote session that wrote this section. The remote session did not compile
and could not; it applied the authorized repair and re-ran the Node gates.

### 11.2 Compile 1 — **[Mac, relayed]**

```
Xcode / iOS SDK compile:  FAILED
Error count:              1
Classification:           CLASS A — Apple API/signature mismatch

ios/App/App/Recognition/RecognitionEngineSelector.swift:90:71
  type 'DictationTranscriber' has no member 'isAvailable'
```

Exactly one diagnostic. Nothing in `SpeechAnalyzerEngine.swift`,
`LegacySFSpeechEngine.swift`, `RecognitionEngine.swift`,
`VoiceController.swift` or the shared `AudioSessionManager.swift` was
rejected by the compiler. Line 90 col 71 in the committed file is exactly
`caps.dictationTranscriberAvailable = DictationTranscriber.isAvailable`.

### 11.3 Mac-local worktree provenance — **[Mac, relayed]**, bounded

`git status --short` in the witness worktree showed only:

```
M ios/App/Podfile
M ios/App/Podfile.lock
```

No modified `project.pbxproj`, no modified `Info.plist`. Therefore:

```
Current Mac worktree contains no uncommitted VoiceController registration
and no uncommitted tracked Info.plist build-number change.

Historical local registration remains unsupported, not disproven.
```

This closes the *present-worktree* form of hypothesis B (§9.4). It does not
speak to what a worktree may have carried in May–August. The Podfile /
Podfile.lock drift is CocoaPods canonicalization noise from `pod install` and
must not be absorbed into a recognition commit.

### 11.4 Repair — authorized, applied remotely, one file

Commit `fix(recognition): drop DictationTranscriber.isAvailable` on this
branch. Diff confined to `RecognitionEngineSelector.swift`:

- probe no longer reads a device-availability member for the dictation module;
  `dictationTranscriberAvailable` stays `nil` and the struct documents why
- `dictationReady = speechAnalyzerApiPresent && dictationTranscriberLocaleSupported == true`
  (`DictationTranscriber.supportedLocales` retained)
- four selection-reason strings reworded so none claims a device-availability
  test occurred

Unchanged: capability schema and telemetry keys (`dictationTranscriberAvailable`
is still emitted, as `NSNull`), SpeechTranscriber availability path, legacy
engine, `legacy_until_witnessed`, deployment floor 16.0, turn authority,
production routing. Podfile / Podfile.lock untouched.

Gates after the repair (remote): recognition suites **37/37**
(the boundary gate initially caught a *doc comment* naming
`DictationTranscriber.` outside an availability region — reworded; the code
change was never the failure). Voice suites and typecheck: voice suites 10 PASS / 1 FAIL
(`voice-response-toggle-mobile`, pre-existing, classification unchanged — 163/165);
typecheck no-regression gate PASS (231 vs baseline 239, 0 new diagnostics).

### 11.5 Compile 2 — PENDING (Mac)

```bash
xcodebuild -workspace ios/App/App.xcworkspace -scheme App -configuration Debug \
  -sdk iphoneos26.2 -destination 'generic/platform=iOS' CODE_SIGNING_ALLOWED=NO \
  build 2>&1 | tee /tmp/second-compile.log
grep -E "BUILD (SUCCEEDED|FAILED)" /tmp/second-compile.log; grep -cE "error:" /tmp/second-compile.log
```

BUILD FAILED → stop at the next diagnostic, classify, no speculative batch
repair of SpeechAnalyzer. BUILD SUCCEEDED → `O1 native viability: provisionally PASS`.

### 11.6 Live MAIA shared-seam smoke — **ACCEPTED as a gate** (founder, 2026-09-03)

Reason: `AudioSessionManager.swift` is shared (§10.4), so the lane has a small
behavioural exposure to the live conversation path even though live
recognition still comes from the community plugin. Not scope creep.

Two questions, kept separate — the smoke is **not** a third recognition comparator:

```
/maia smoke   → did our shared Swift seam damage today's working product?
native A/B    → is the new recognition subsystem good enough to merit integration?
```

Order on the witness build: **/maia smoke before /voice-controller-test.**

| Step | Act | Expected |
|---|---|---|
| S1 | start the normal MAIA microphone | starts normally; existing production recognizer operates |
| S2 | speak a short phrase | existing conversation transcription behaves as before |
| S3 | stop / complete the mic lifecycle | no crash, no hung audio session, no teardown regression |
| S4 | start the microphone a second time | second capture starts normally |

Record `LIVE PATH SMOKE: PASS / FAIL`. FAIL → STOP; classify as a possible
lane-caused integration regression before any A/B. A working
`/voice-controller-test` is not grounds to proceed past a failed smoke.

### 11.7 Remaining Mac sequence

1. Preserve worktree evidence (§11.3 commands) before pulling anything.
2. `git fetch origin claude/voice-recognition-acceptance-witness-ffeadt`; ensure HEAD contains the repair commit.
3. Compile 2 (§11.5).
4. Install the exact build; record SHA · app version · build number · device · iOS · Xcode · SDK · locale · install method. Do not force the build number to equal 2515.
5. `/maia` smoke S1–S4 (§11.6).
6. `/voice-controller-test` Probe: requested engine · resolved engine · API availability · locale support · selection reason. Modern must not silently execute legacy while reporting modern.
7. Same-device A/B baseline → modern → baseline → modern; F1–F10; O1–O6 (O6 per §10.2).
8. Adjudicate in §10.2 vocabulary. `PRODUCTION INTEGRATION RECOMMENDED` → STOP; routing untouched; next seam is `VOICE-RECOGNITION-PRODUCTION-INTEGRATION-01`, not opened.
9. Record here; commit evidence separately from any further source fix.

Production recognition routing: **not changed** by anything in §11.
