# VOICE-RECOGNITION-ENGINE-01 — Layer 2 recognition upgrade

**Status:** **SECOND NATIVE COMPILE COMPLETE — O1 NATIVE VIABILITY PROVISIONALLY PASS — INSTALL + `/maia` SHARED-SEAM SMOKE PENDING** (§12). Device witness pending.
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

### 11.5 Compile 2 — PENDING (Mac) → **resolved in §12 (BUILD SUCCEEDED at `73d0df30d`)**

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

## 12 · Second native compile — O1 provisionally PASS — 2026-09-11

### 12.1 Evidence provenance

Same posture as §11.1: the compile ran on the founder's Mac Studio and the
result was **relayed** into this remote session. This session has no Apple
toolchain and did not compile anything. What is recorded here is the relayed
outcome and its classification, not an independent observation.

### 12.2 Compile 2 — **[Mac, relayed]** — BUILD SUCCEEDED

```
branch:   claude/voice-recognition-acceptance-witness-ffeadt
HEAD:     73d0df30d   (contains the §11.4 repair, f110503b1)
command:  §11.5 xcodebuild invocation (Debug, iphoneos SDK, generic/platform=iOS, CODE_SIGNING_ALLOWED=NO)
result:   ** BUILD SUCCEEDED **
errors:   (none)
```

The only messages preceding the result line were two CocoaPods run-script
phase warnings about dependency analysis ("will be run during every build
because it does not specify any outputs" class). They are build-system
hygiene notices from the Pods project, not Swift diagnostics, not
attributable to `Recognition/`, and **not blocking**. They pre-date the lane
(the Pods run-script phases are generated by `pod install`) and are outside
its scope; no repair is indicated.

### 12.3 What this establishes — and what it does not

- The single Class A diagnostic from compile 1 (§11.2) is closed by the
  §11.4 repair: `RecognitionEngineSelector.swift` now compiles against the
  shipped iOS 26 SDK without `DictationTranscriber.isAvailable`.
- The whole `Recognition/` boundary, the `@available`-gated
  `SpeechAnalyzerEngine`, `VoiceController.swift` (registered in Sources by
  this lane, §9.4), and the shared `AudioSessionManager.swift` edit all
  compile together. No second diagnostic surfaced behind the first.
- **O1 native viability: provisionally PASS** (per the §11.5 rule
  "BUILD SUCCEEDED → O1 provisionally PASS").

Not established: anything about runtime behaviour. Compiling is necessary
for the candidate to be witnessed at all; it says nothing about F1–F10,
O2–O6, the live-path smoke (§11.6), or the Probe (§11.7 step 6). The
"provisionally" is load-bearing: O1 becomes PASS only once the exact build
installs and launches on the device.

### 12.4 Development act — still closed

No source change accompanies this record. The repair in §11.4 was the one
authorized exception (a Class A SDK mismatch that made compile impossible),
and compile 2 confirms it was sufficient. No further compile repair is
indicated by this result, and none is authorized by it. Production
recognition routing remains **unchanged**: the live conversation path still
binds `@capacitor-community/speech-recognition` (§9.4), and the engine
default remains `LegacySFSpeechEngine` under `legacy_until_witnessed`.

### 12.5 Frozen next sequence (Mac)

Continues from §11.7 step 4. Order is fixed; each step is a STOP on failure.

1. **Install** the exact `73d0df30d` build on the witness device. Record
   SHA · app version · build number (as produced, not forced to 2515) ·
   device · iOS · Xcode · SDK · locale · install method.
2. **`/maia` shared-seam smoke S1–S4** (§11.6). Record
   `LIVE PATH SMOKE: PASS / FAIL`. FAIL → STOP; classify before any A/B.
3. **`/voice-controller-test` Probe** (§11.7 step 6): requested engine ·
   resolved engine · API availability · locale support · selection reason.
   Modern must not silently execute legacy while reporting modern.
4. **Same-device A/B** baseline → modern → baseline → modern; F1–F10; O1–O6.
5. **Adjudicate** in §10.2 vocabulary. Record here as §13. Even
   `PRODUCTION INTEGRATION RECOMMENDED` is a STOP, not an authorization
   (§10.3).

The next evidence in this lane comes from the device, relayed. Nothing in
this session advances the witness.

### 12.6 Mac runbook for the frozen sequence — and one surface gap found while writing it

**Finding (repo-side, 2026-09-11).** `app/voice-controller-test` is in the
static-export exclusion list of `scripts/capacitor-patch-routes.sh` (P12
founder ruling 2026-08-16: `requireFounder()` reads the server session;
`output:'export'` cannot prerender it; the security boundary wins). So a
normal beta bundle (`scripts/build-ios-static.sh` → static `out/`) **does not contain
the Probe / A/B surface at all.** The `/maia` smoke is unaffected (`/maia`
is in the bundle). P12 already names this state: *ON-DEVICE VOICE
DIAGNOSTIC = UNMET*, replacement is a separate design lane, not authorized.

The only path that reaches the page without building anything is
**Capacitor dev mode** (`CAPACITOR_MODE=dev`, `server.url` → the Mac's
`next dev`), which the repo already supports via
`scripts/mobile-fast-lane.sh`. Two caveats the record must carry:

- `docs/engineering/MOBILE_CONVERSATION_VERIFICATION_LOOP.md` §1 classes
  dev mode as the *fast lane* and says native-plugin claims are out of its
  scope because `getPlatform()` "can report `web`". The Probe is the
  arbiter here: `IOSNativeVoiceProvider` binds `VoiceController` through
  `registerPlugin`, so if the native bridge is absent the Probe fails with
  "not implemented" and the A/B cannot even start. A Probe that returns
  `engineSelected` is therefore proof the bridge is real in that build.
- The native source subject and native build configuration are unchanged;
  dev mode changes the WebView content source and Capacitor configuration.
  (Binary identity across the two Xcode runs is not claimed — it was not
  hashed.) Record the mode on every evidence line.

**Ruling requested (founder):** accept dev-mode bridge evidence for steps 3–4
(Probe, A/B), with the mode recorded — or hold those steps until the P12
replacement diagnostic exists (a build act, refused under §8). Recommendation:
accept; the `/maia` smoke stays on the beta bundle so the shared-seam claim
remains production-faithful.

*Ruled 2026-09-11 — see §12.7. The runbook below is superseded by the
§12.7 sequence where the two differ; §12.7 governs.*

#### Step 1–2 · Install the beta bundle, run the `/maia` smoke

```bash
cd ~/MAIA-SOVEREIGN   # or the worktree that already compiled 73d0df30d
git fetch origin claude/voice-recognition-acceptance-witness-ffeadt
git checkout claude/voice-recognition-acceptance-witness-ffeadt
git rev-parse --short HEAD                      # expect c5ed0ed96 (record) — Swift unchanged since 73d0df30d
git status --short -- ios/App/App.xcodeproj ios/App/App/Info.plist   # must be clean

CAPACITOR_MODE=beta scripts/build-ios-static.sh build   # patch routes → static export → revert  (NOT `npm run ios:bundle` — §12.8)
CAPACITOR_MODE=beta npx cap sync ios                     # /maia in, /voice-controller-test out by design
cd ios/App && pod install && open App.xcworkspace
```

In Xcode: select the connected iPhone as destination, scheme `App`, Debug,
signing automatic (team `ZVK2X646Z2`), **Run** (⌘R). Do not bump the build
number; whatever `CFBundleVersion` the plist carries is the one to record.
Record: SHA · app version · build number · device · iOS · Xcode · SDK ·
locale · install method = `Xcode Run (Debug)`.

Then on the device, signed in as usual, on `/maia`:

| S1 | start the mic | starts; community recognizer runs |
| S2 | speak a short phrase | transcription as before |
| S3 | stop / complete the lifecycle | no crash, no hung audio session |
| S4 | start the mic again | second capture starts |

Record `LIVE PATH SMOKE: PASS / FAIL` with one line per step. **FAIL → stop.**
Attach the Xcode console lines around the failure (look for
`AudioSessionManager` teardown / activation messages).

#### Step 3–4 · Dev-mode bundle for Probe and A/B (only after S1–S4 PASS and the ruling above)

Terminal A (dev server, same LAN as the phone; founder allowlist must be set
or the page 403s by design):

```bash
cd ~/MAIA-SOVEREIGN
FOUNDER_MEMBER_IDS=<your member uuid> \
NEXT_PUBLIC_API_BASE_URL=http://$(ipconfig getifaddr en0):3000 \
scripts/mobile-fast-lane.sh              # prints SHA / LAN URL; runs `next dev`
```

Terminal B (re-sync the shell to point at that server; native code untouched):

```bash
CAPACITOR_MODE=dev CAPACITOR_DEV_SERVER_URL=http://$(ipconfig getifaddr en0):3000 npx cap sync ios
open ios/App/App.xcworkspace              # Run (⌘R) again on the same device
```

If the WebView shows a blank page or a transport-security error on the http
LAN URL, stop and record it: `Info.plist` carries no
`NSAppTransportSecurity` exception, and adding one is a change, not a witness.

On the device: sign in on the dev origin, open `/voice-controller-test`.

- **Probe** with `baseline`, then `modern`, then `dictation`. Record for each:
  requested engine · `engineSelected` · availability flags · locale support ·
  selection reason. Modern reporting `modern` while resolving to legacy is a
  FAIL of the Probe, not a pass.
- **A/B**: same passage, same room, same distance; baseline → modern →
  baseline → modern. Per run record F1–F10 from the page (finalized segments,
  stall events, pause survival, assembled utterance at MAIA close-turn).

#### Step 5–6 · Adjudicate, record

Bring back the raw lines; adjudication happens in §10.2 vocabulary and is
recorded as §13 by the remote session. No source change accompanies it.

### 12.7 Founder ruling — dev-mode evidence admissibility, two-layer record, frozen sequence — 2026-09-11

**Ruling (verbatim core).** *ACCEPT dev-mode bridge evidence for Steps 3–4.
Do not wait for a P12 replacement diagnostic.* The Step 1 correction stands:
a fresh worktree needs the web bundle generated before installation. Record
the web layer separately from the native subject.

```text
RULING
Dev-mode evidence is admissible for Probe + native A/B.

BOUNDARY
It establishes native-candidate behavior only.
It does NOT establish production integration,
production routing, static-beta availability,
or that normal /maia is using VoiceController.
```

**Wording correction (applied to §12.6).** The record does not say the Swift
binary is identical in both modes — that would require hashing the
executable and was not done. It says: *the native source subject and native
build configuration are unchanged; dev mode changes the WebView content
source and Capacitor configuration.*

**Rationale preserved.** The lane's governing question (§10) is narrower than
production integration: *is the new native subsystem a viable candidate.*
The `/maia` smoke asks whether the shared Swift seam (the
`AudioSessionManager.swift` teardown edit) damaged today's product; the
native A/B asks whether the new subsystem merits integration. Those are two
questions with two evidence surfaces. Waiting for a native-shell diagnostic
would require new construction in a frozen lane and would not answer a
different scientific question — the Probe is already falsifiable
(`not implemented` / `web` without bridge / wrong engine resolved = FAIL).
Dev-mode evidence may decide native-candidate viability; it may not be
promoted into evidence of production integration.

**Two-layer evidence header (required on the §13 record).**

```text
NATIVE SUBJECT: 73d0df30d
WEB BUNDLE: beta static export at <actual SHA>
APP VERSION:
BUILD:
DEVICE:
iOS:
XCODE:
SDK:
LOCALE:
INSTALL METHOD:
```

The native subject is the Swift source + Xcode configuration at `73d0df30d`
(unchanged through `2bfdc9d38` and this record — docs only). The web bundle
is whatever `scripts/build-ios-static.sh` produced from the checked-out SHA; record
the SHA actually built, not the one intended.

**Frozen sequence (founder, 2026-09-11) — supersedes §12.5 / §12.6 ordering.
Each step is a STOP on failure.**

1. Build the beta static bundle from the exact witness subject
   (`CAPACITOR_MODE=beta scripts/build-ios-static.sh build && CAPACITOR_MODE=beta npx cap sync ios`
   on the checked-out branch tip — not `npm run ios:bundle`, see §12.8; `/maia` in,
   `/voice-controller-test` out by design — §12.6 finding).
2. Install on the physical iPhone (Xcode Run, Debug; no build-number bump).
3. Record both layers using the header above.
4. Run `/maia` shared-seam smoke S1–S4 (§11.6) on that beta bundle.
   Record `LIVE PATH SMOKE: PASS / FAIL`, one line per step.
5. Any failure → **STOP.** Classify before anything else; no dev mode.
6. Only after PASS: re-sync into Capacitor dev mode on the **same native
   source** (`CAPACITOR_MODE=dev … npx cap sync ios`, Run again on the same
   device; commands in §12.6 Step 3–4). No source change; no plist change;
   an ATS exception would be a change, not a witness → STOP and record.
7. Record `MODE: CAPACITOR DEV` on **every** Probe / A-B evidence line.
8. Run the Probe for `baseline` → `modern` → `dictation`: requested engine ·
   `engineSelected` · availability flags · locale support · selection reason.
9. If the Probe says `not implemented`, reports `web` without the bridge,
   resolves the wrong engine (modern reported, legacy executed), or otherwise
   cannot prove `VoiceController` is native → **STOP.**
10. If the Probe passes: frozen A/B on the same phone — baseline → modern →
    baseline → modern; same passage, room, distance; F1–F10 per run; O1–O6.
11. Adjudicate **only** in §10.2 vocabulary:
    `NATIVE CANDIDATE REJECTED | NATIVE CANDIDATE EXPERIMENTAL | PRODUCTION INTEGRATION RECOMMENDED`.
    Even the last is a STOP, not an authorization (§10.3).
12. Restore / discard the dev-mode generated state afterward
    (`capacitor.config.json`, synced `ios/App/App/public`, any
    `CAPACITOR_MODE` residue). **Nothing from dev mode gets committed as
    product configuration.** `git status` on `ios/` must show no dev-mode
    residue before §13 is written.

**Evidence labelling rule.** Steps 4–5 evidence carries
`WEB BUNDLE: beta static export at <SHA>` and speaks to the shared seam on
today's product. Steps 8–10 evidence carries `MODE: CAPACITOR DEV` and
speaks to native-candidate viability only. A §13 sentence that cites
dev-mode evidence for a production-integration, production-routing,
static-beta-availability, or `/maia`-uses-`VoiceController` claim is
inadmissible by this ruling.

**Status after this record.** SECOND NATIVE COMPILE COMPLETE — O1
PROVISIONALLY PASS — DEV-MODE EVIDENCE RULED ADMISSIBLE (BOUNDED) — INSTALL +
SMOKE PENDING. §13 is reserved for the adjudication and is the Mac's
evidence to produce; the remote session records it, relayed, and adds no
source change.

### 12.8 Step 1 attempt — beta bundle build FAILED — runbook error, not subject — 2026-09-11

**Evidence provenance.** Founder's Mac Studio terminal, relayed. Witness
worktree `/Users/soullab/maia-ds01-witness`, reset hard to
`origin/claude/voice-recognition-acceptance-witness-ffeadt` = `5846a0824`,
`git status --short` clean. Native subject unchanged: `73d0df30d`.

**What happened.** `npm run ios:bundle` ran `next build` under
`output: 'export'` and died at *Collecting page data*:

```text
Error: export const dynamic = "force-static"/export const revalidate not configured
  on route "/api/member-tools" with "output: export"
  (same for /api/auth/microsoft/{calendars,callback,status}, /api/auth/session/step-up/status)
> Build error occurred
[Error: Failed to collect page data for /api/member-tools]
```

`npx cap sync ios` therefore never ran (`npm run build && npx cap sync ios`).
`pod install` ran afterwards because the founder's command chain did not
stop on the failure; it succeeded and changes nothing (pods were already
installed for the §12 compile). No web bundle was produced; nothing was
installed. **Step 1 = FAIL → STOP**, as the sequence requires.

**Classification: runbook error in §12.6 / §12.7 (remote-authored), not a
subject defect and not route drift.**

- `package.json`'s `ios:bundle` script (introduced `1fa816177`, 2026-01-21,
  never referenced by any doc before §12.6) is `CAPACITOR_BUILD=1
  CAPACITOR_MODE=beta … npm run build && npx cap sync ios`. It does **not**
  invoke `scripts/capacitor-patch-routes.sh`, which is what moves `app/api`
  (930 route files, 858 `force-dynamic`) and the other export-incompatible
  surfaces out of the tree before a static export. Without the patch a
  static export of this repo cannot succeed; `next build` reports only the
  first batch of failures, which is why five routes are named rather than
  858. The five are old (`member-tools` 2026-02-04, `step-up/status`
  2026-01-21) and untouched by this lane.
- Every working iOS pipeline in the repo runs the patch first:
  `scripts/build-ios.sh` (patch → build → revert → `cap sync` →
  `xcodebuild archive`), `scripts/build-ios-static.sh` (patch → build →
  revert → `cap copy`), `scripts/ios/build.sh`. The §12.6 runbook named the
  one entry point that skips it. That is the remote session's error.
- `capacitor.config.ts` defaults `CAPACITOR_MODE` to `beta`, so a beta
  config is produced whether or not the variable is set; setting it
  explicitly only makes `BUILD_STAMP.buildMode` read `beta` rather than
  `capacitor`. Set it, so the recorded WEB BUNDLE line is unambiguous.

**Corrected Step 1 (replaces the `ios:bundle` line in §12.6 / §12.7; those
lines are patched in this record).** From the witness worktree, clean tree:

```bash
cd /Users/soullab/maia-ds01-witness
git rev-parse --short HEAD && git status --short          # expect 5846a0824, clean
CAPACITOR_MODE=beta scripts/build-ios-static.sh build     # rm -rf .next out → patch → next build → revert
CAPACITOR_MODE=beta npx cap sync ios                      # web assets + capacitor.config.json into ios/App/App/public
git status --short                                        # must be clean again (patch reverted; out/ .next/ ignored)
open ios/App/App.xcworkspace                              # Run (⌘R) on the iPhone, scheme App, Debug
```

`build-ios-static.sh` is chosen over `build-ios.sh debug` because it ends at
the web export; it does not `xcodebuild archive`, does not touch the build
number, and has no side effects beyond `out/` and `ios/App/App/public`.
If the script reports a stale `.capacitor-*-backup` directory, run
`scripts/capacitor-patch-routes.sh revert` first and re-run; do not delete
the directory by hand.

The two-layer header is unchanged. `WEB BUNDLE: beta static export at
<actual SHA>` records the SHA that `build-ios-static.sh` actually consumed
(`5846a0824` if the branch has not moved).

**Side effects on the Mac to check before continuing (hygiene, not
witness).** The same terminal session ran, in the **main checkout**
`/Users/soullab/MAIA-SOVEREIGN`, `npm install` (after a `cd` to a
non-existent `/tmp/voice-witness-73d0df30` failed) — "added 2445 packages,
removed 1963" — and `pod install` in its `ios/App`. Neither touches the
witness worktree, but the main checkout's `node_modules` and possibly
`ios/App/Podfile.lock` have moved. Run `git status --short` there before
the next deploy or the next lane that builds from it. The RC-GEN-01
specimen script failure in the same transcript (`specimens.ts:99` syntax
error on `claude/s3-implementation`) belongs to that lane, not this one,
and is not addressed here.

**Status after this record.** Unchanged in substance: SECOND NATIVE COMPILE
COMPLETE — O1 PROVISIONALLY PASS — DEV-MODE EVIDENCE RULED ADMISSIBLE
(BOUNDED) — **STEP 1 RETRY PENDING (corrected command)**. No native source,
plist, or routing change. The failure is the runbook's, recorded as such.

### 12.9 Step 1 retry — beta static export SUCCEEDED — web bundle at `5846a0824` — 2026-09-11

**Evidence provenance.** Founder's Mac Studio terminal, relayed. Witness
worktree `/Users/soullab/maia-ds01-witness`.

**Actual SHA consumed: `5846a0824`, not `c756eb412`.** The
`git reset --hard origin/… # now c756eb412` line failed with
`fatal: Cannot do hard reset with paths.` — the founder's interactive zsh
does not treat a trailing `#` as a comment, so `#`, `now`, `c756eb412`
were passed as pathspecs. HEAD stayed at `5846a0824`; `git status --short`
was empty. The build therefore ran on `5846a0824`. The delta
`5846a0824..c756eb412` is `CLAUDE.md` + this lane doc only (docs, 2 files),
so the web bundle content is what `c756eb412` would have produced; the
record nonetheless carries the SHA actually consumed, per §12.7.
The same zsh behaviour mangled the final `open … # Run on the iPhone, Debug`
line (`open` received the comment words as file arguments and reported them
missing). Whether the workspace still opened is not in the transcript.
**Runbook lesson, remote-owned: no trailing `#` comments on any line the
Mac will paste.** Commands below carry none.

**What succeeded.**

```text
patch:   930 API routes, middleware.ts, pages/, 47 web-only dirs, 31 dynamic pages moved out
         — includes "Excluded (web-only): app/voice-controller-test"   (§12.6 finding confirmed live)
build:   next build, output:'export', 498 HTML pages, /maia 91.8 kB present
         warning only: @capacitor-community/contacts unresolved (studio/clients/import; pre-existing, unrelated)
revert:  all backups restored, 0 generateStaticParams patches to revert
sync:    web assets → ios/App/App/public, capacitor.config.json written, pod install ran,
         13 Capacitor plugins incl. @capacitor-community/speech-recognition@7.0.1
status:  git status --short empty after sync (public/ and capacitor.config.json are gitignored;
         Podfile.lock unchanged)
```

`VoiceController` does not appear in the plugin list and is not expected to:
it is an in-app Swift plugin registered via `registerPlugin`, not an npm
Capacitor package. The Probe, not the sync log, is what proves it is bound.

**Step 1 = PASS (web layer).** Step 2 (install) has not happened yet; the
transcript ends at the `open` error.

**Two-layer header, pre-filled where the repo already knows the value.**
`APP VERSION` is `CFBundleShortVersionString` = `MARKETING_VERSION` in the
pbxproj; `BUILD` is `CFBundleVersion` = `$(CURRENT_PROJECT_VERSION)` in the
pbxproj (repo value 2511, §4). Record what Xcode / the device actually
shows; if it differs from the repo value, that is fastlane's out-of-git
plist write (§9) and the observed value wins.

```text
NATIVE SUBJECT: 73d0df30d
WEB BUNDLE: beta static export at 5846a0824
APP VERSION: 1.2.0 (repo)  →  observed:
BUILD: 2511 (repo)  →  observed:
DEVICE:
iOS:
XCODE: 17C529 (from the §12 compile log)  →  confirm
SDK: iPhoneOS26.2 (from the §12 compile log)  →  confirm
LOCALE:
INSTALL METHOD: Xcode Run (Debug)
```

**Next (Mac).** Confirm Xcode has the workspace open (re-run
`open ios/App/App.xcworkspace` if not), select the iPhone, scheme `App`,
Debug, Run. Do not bump the build number. Then `/maia` S1–S4 on the beta
bundle, one line per step, `LIVE PATH SMOKE: PASS / FAIL`. Any FAIL → STOP;
no dev mode.

**Status after this record.** STEP 1 PASS (WEB BUNDLE 5846a0824) — INSTALL
PENDING — `/maia` S1–S4 PENDING.

### 12.10 Step 2 — installed on the iPhone via xcodebuild + devicectl — launch pending (device locked) — 2026-09-11

**Evidence provenance.** Founder's Mac Studio terminal, relayed. Worktree
`/Users/soullab/maia-ds01-witness`, HEAD `5846a0824`, native subject
`73d0df30d`, web bundle from §12.9.

**Toolchain (observed, supersedes the inferred values in §12.9).**

```text
xcodebuild -version:  Xcode 26.3, Build version 17C529
SDK:                  iPhoneOS 26.2 (from the §12 compile log; unchanged toolchain)
device:               iPhone 16 Pro Max (iPhone17,2), CoreDevice A0736AC8…, state available (paired)
```

**Build (third native compile of the same subject).**
`xcodebuild -workspace App.xcworkspace -scheme App -configuration Debug
-destination generic/platform=iOS -allowProvisioningUpdates
-derivedDataPath ~/voice-witness-dd build` → `** BUILD SUCCEEDED **`. No
signing or project-setting prompt was reported. Derived data lives outside
the repo on purpose (`ios/App/build` would break the next `pod install`).

**Install.** `xcrun devicectl device install app` → `App installed:
bundleID life.soullab.maia`, installation URL under
`/private/var/containers/Bundle/Application/CF6A0A75-…`. **Step 2 = PASS.**
`INSTALL METHOD: xcodebuild + devicectl (Debug)`.

**Launch attempt.** `xcrun devicectl device process launch … life.soullab.maia`
→ `FBSOpenApplicationErrorDomain error 7 … Locked ("Unable to launch …
because the device was not, or could not be, unlocked")`. This is the
phone's lock screen, not the app and not the subject. Not a STOP. Retry
after unlocking, or tap the icon.

A first paste of the install/launch lines still carried the `<IDENTIFIER>`
placeholder; zsh read `<` and `>` as redirections and ran nothing for those
two lines (`no such file or directory: IDENTIFIER`). No side effect.

**Header state.**

```text
NATIVE SUBJECT: 73d0df30d
WEB BUNDLE: beta static export at 5846a0824
APP VERSION:      1.2.0    (PlistBuddy on the installed .app — observed 2026-09-11 21:12)
BUILD:            2511     (same source; equals the repo's CURRENT_PROJECT_VERSION — the out-of-git
                            "2515" of §9 is NOT what is under witness; fastlane never touched this worktree)
DEVICE:           iPhone 16 Pro Max (iPhone17,2)
iOS:              26.6.1 (23G83)   (devicectl device info details)
XCODE:            26.3 (17C529)
SDK:              iPhoneOS 26.2
LOCALE:           pending — device Settings
INSTALL METHOD:   xcodebuild + devicectl (Debug)
```

Second launch attempt (21:12:34) returned the identical `Locked` refusal.
Still not a STOP: the phone must be unlocked at the moment the request
lands, or the app is opened from the icon on the phone, which is
equivalent for the witness (same installed artefact, same web bundle).

**Launched (21:14:22).** Third attempt with the phone unlocked:
`Launched application with life.soullab.maia bundle identifier.` The
installed artefact is running on the device. Step 2 complete in full.
`/maia` S1–S4 next.

**Next (Mac, no trailing comments on any line).** Unlock the phone, then:

```bash
xcrun devicectl device process launch --device A0736AC8-793B-516F-AC72-C076DB6CEE38 life.soullab.maia
/usr/libexec/PlistBuddy -c 'Print :CFBundleShortVersionString' -c 'Print :CFBundleVersion' ~/voice-witness-dd/Build/Products/Debug-iphoneos/App.app/Info.plist
xcrun devicectl device info details --device A0736AC8-793B-516F-AC72-C076DB6CEE38 2>/dev/null | grep -iE 'osVersionNumber|osBuildUpdate|name:' | head -5
```

The PlistBuddy line reads APP VERSION and BUILD from the exact `.app` that
was installed, so those two header values are the artefact's, not the
repo's. Then `/maia` S1–S4 on the phone.

**Status after this record.** STEP 1 PASS (WEB 5846a0824) — STEP 2 PASS
(INSTALLED, xcodebuild + devicectl) — LAUNCH RETRY PENDING (device locked) —
`/maia` S1–S4 PENDING.

### 12.11 `/maia` shared-seam smoke — LIVE PATH SMOKE: FAIL (intermittent) — STOP — 2026-09-11

**Evidence provenance.** Founder on the phone, relayed in four messages
(≈21:15–21:30). Installed artefact of §12.10 (NATIVE SUBJECT `73d0df30d`,
WEB BUNDLE `5846a0824`, APP 1.2.0, BUILD 2511, iOS 26.6.1). Nothing was
changed on the device between the messages; the remote session cannot
reach it and pushed nothing to it.

```text
LIVE PATH SMOKE: FAIL
S1: PASS   mic started
S2: PASS   phrase transcribed ("she heard me")
S3: FAIL   reply rendered WITHOUT spoken audio; mic did NOT return to listening
S4: FAIL   not reached in that pass
later:     "she came back" — a subsequent pass returned to listening
later:     "still glitchy" / "listening glitching" — recurs
founder:   "this is reoccurring with this build"
LOCALE:    not recorded
```

The behaviour is **intermittent**, not deterministic. That changes what
can be concluded: a single pass cannot be attributed; only a
same-phone comparison against a build without the lane's native change can.

**Classification (no repair; §12.7 step 5).**

*The lane's native edit is on the live path at every reply.* This was the
bounded exposure named in §10, and the smoke is what it was for. The chain,
none of it changed by the lane on the web side:

- `lib/audio/ttsWithFallback.ts:44-46` and `components/OracleConversation.tsx:1977`
  call `VoiceController.prepareForSpeaking()` before MAIA speaks;
  `prepareForListening()` before the mic resumes.
- `lib/voice/AudioSessionManager.ts` binds those to the native
  `AudioSessionManager` Capacitor plugin (`registerPlugin`, line 67).
- Native `prepareForSpeaking` / `prepareForListening`
  (`AudioSessionManager.swift:114`, `:51`) each call
  `performFullTeardown()` (`:127`, `:64`) and then re-set category and
  activate the session.
- `performFullTeardown()` is one of the two methods the lane edited.

*The native delta on that path is narrow.* Full diff `a4305f4d6..73d0df30d`
of `AudioSessionManager.swift` (73 lines, six hunks):

1. `import Speech` removed; recognizer/request/task fields replaced by a
   weak `RecognitionTeardownHandle` and an `inputTapInstalled` flag.
2. `performFullTeardown()`: recognition cancel now goes through the handle
   (nil on the live path, so a no-op — as the old fields were also nil on
   the live path, which never used `createRecognitionRequest`).
3. `performFullTeardown()`: `engine.inputNode.removeTap(onBus: 0)` was
   unconditional; it is now guarded by `inputTapInstalled`, which is never
   true on the live path. **Behavioural difference on the live path: the
   old code touched `engine.inputNode` on every teardown (accessing the
   property instantiates the input node); the new code does not.**
4. `createRecognitionRequest()` → `installInputTap(consumer:)`;
   `setRecognitionTask` → `setActiveRecognition`. Neither is called on the
   live path.

Item 3 is the only live-path behavioural difference, and it removes a side
effect rather than adding one. It is not obviously a cause of "no spoken
reply, no mic resume"; it is also not excluded, because AVAudioEngine
node graph state across `stop()`/`reset()` is exactly the kind of thing
that produces intermittent audio-session behaviour. The classification
therefore cannot be closed from the source alone.

*What is not the cause:* `enableVoiceInChat` defaults to `true` on a fresh
install (`OracleConversation.tsx:972-978`), so a wiped localStorage does
not silence her. The lane touched no web file on this path
(`ttsWithFallback.ts`, `lib/voice/AudioSessionManager.ts`,
`OracleConversation.tsx`, `ContinuousConversation.tsx`: zero diff). The
`IOSNativeVoiceProvider` / `MAIAVoiceProvider` changes are instantiated only
by `app/voice-controller-test/page.tsx`, which is not in this bundle.

**The one question that decides attribution.** *Did this same behaviour —
reply without voice, mic not returning, intermittently — occur on the
previously installed build (TestFlight 2511/2515, before today's install)?*

- **Yes, it did** → pre-existing live-path flakiness; the lane's seam is
  not shown to have damaged the product; the smoke is recorded FAIL for the
  product and NOT ATTRIBUTED to the lane; the founder may rule whether the
  Probe / A-B proceed on a known-flaky baseline.
- **No, it did not** → the lane's `AudioSessionManager.swift` edit is the
  prime suspect; §13 records `NATIVE CANDIDATE` unadjudicated and the seam
  as SUSPECT; any repair or revert of that file is a build act needing a
  ruling (§8).
- **Unknown** → the discriminating experiment is a same-phone reinstall of
  the pre-lane build and the same S1–S4. Confounded by the older web
  bundle, but it is the only comparison available without construction.

**Evidence that would sharpen either branch, no construction.** Native
logs during a glitch. On the Mac, with the phone connected: Console.app →
the iPhone → filter `AudioSessionManager`. The edited teardown logs
`Performing full teardown…`, `Active recognition cancelled`, `Input tap
removed`, then the prepare methods log their category/activation outcome.
A failed `setActive` / `setCategory` on the `prepareForSpeaking` path at
the moment of a silent reply would localize the fault to the session
transition; a clean log with a silent reply pushes it to the web/TTS side.

**Status after this record.** LIVE PATH SMOKE: FAIL (INTERMITTENT) —
STOP — ATTRIBUTION OPEN — no dev mode, no Probe, no A/B, no repair. §13 not
written.

**Screenshot addendum (founder, 21:18 device time).** `/maia` on the
installed artefact. Visible: the orb in `TAP TO SPEAK` (mic idle) directly
after a MAIA reply — the "did not return to listening" state, captured.
Transcript shows two spoken member turns transcribed and two MAIA replies
rendered as text; whether either reply was voiced is not visible in a
still. Status bar shows the **silent-mode (bell-slash) indicator**: the
ring/silent switch was on silent during the smoke. That is a candidate
mechanism for an intermittent silent reply that costs nothing to test:
WebView audio honours the silent switch unless the native session category
is `.playback`/`.playAndRecord` at the moment playback starts, and
`prepareForSpeaking` sets that category asynchronously right before TTS.
A race there would present exactly as "sometimes voiced, sometimes not."
It would sit in the session-transition code (`AudioSessionManager.swift:137-145`),
which the lane did **not** change — but the teardown that precedes it is
the lane's edit, so it neither clears nor convicts the seam on its own.
**Discriminating test, no construction:** flip the ringer to loud, repeat
S1–S4 five times. If silent replies stop, the mechanism is category timing
versus the silent switch; if they continue, it is not. Also visible: the
composer row shows only `Text`; the always-visible "MAIA voice: On/Off"
control that `__tests__/voice-response-toggle-mobile.test.ts` expects is
absent in this bundle — that test's pre-existing failure (§9) is now
observed on device, so the member cannot glance whether voice reply is on
(it defaults on). MAIA's own line "Seems stable now though — you're coming
through fine" is conversational, not evidence: she has no access to the
audio path's state. Attribution remains OPEN; the question in §12.11
stands.

### 12.12 Founder ruling on the smoke FAIL — UNKNOWN branch — pre-lane control build ordered — 2026-09-11

**Founder characterization added to the evidence:** *"it tends to resolve
itself with time."* Recorded as stated. A fault that settles with time
after launch is the shape of a warm-up (session, network, or TTS backend),
not of a deterministic per-transition regression — but that is a shape,
not an attribution.

**Ruling (verbatim).**

```text
PRE-EXISTING SYMPTOM FAMILY      YES

SAME FAILURE ON SAME PHONE
BEFORE TODAY'S INSTALL           UNKNOWN

LIVE PATH SMOKE                  FAIL

PROBE / A-B                      STOPPED

ATTRIBUTION                      UNRESOLVED
```

Founder's grounds: prior iOS voice-loop testing recorded MAIA speaking on
one turn and the next mic sitting at "Listening…" indefinitely; earlier
materials record no-audio replies, failures to re-arm, and post-TTS
transition problems; an August 30 engineering note dealt with a response
completing without audio and the consequences for re-arming. So the
symptom family is not new to `73d0df30d`. But there is no clean evidence
that this exact intermittent combination occurred on the immediately
previous build on this iPhone 16 Pro Max, and the earlier "2515" evidence
has provenance problems (§9) and may not be used to exonerate the seam.
**The right ruling is UNKNOWN, not "yes."**

**Ordered next act.** Reinstall a pre-lane control build on the same phone
and run exactly the same S1–S4. **Do not repair anything first. No revert
is authorized.** Capture Console.app → iPhone → filter `AudioSessionManager`
during **both** runs. If the silent-reply / stuck-mic event coincides with
an audio-session transition failure, attribution to the shared native seam
strengthens materially. If the native transition logs are clean while
speech disappears, attention shifts to the TTS / web side.

**Control design (remote, for the founder to pick).**

The pre-lane native state is the lane branch's merge base
`a4305f4d6` (merge of PR #1177, 2026-09-02): no `ios/App/App/Recognition/`,
`AudioSessionManager.swift` still owns `SFSpeechAudioBufferRecognitionRequest`,
`VoiceController.swift` not in the pbxproj Sources. Verified from the tree.

| | native | web bundle | what it isolates |
|---|---|---|---|
| **Control A — hybrid (recommended)** | `a4305f4d6` | `5846a0824` (the exact `out/` already built in the witness worktree) | the native seam alone; web layer byte-identical to the lane run |
| Control B — pure | `a4305f4d6` | `a4305f4d6` | both layers older; web confound remains |

Control A is clean because the only web files the lane changed
(`lib/voice/providers/IOSNativeVoiceProvider.ts`,
`lib/voice/contract/MAIAVoiceProvider.ts`,
`lib/voice/recognition/humanTurnAuthority.ts`) are imported solely by
`app/voice-controller-test/page.tsx`, which is not in the bundle. The
`/maia` path talks to native through `lib/voice/AudioSessionManager.ts`
(`prepareForListening` / `prepareForSpeaking`), unchanged by the lane and
present in both native states. Control A is a hybrid artefact that never
existed as a commit; its record therefore carries both SHAs explicitly and
is admissible only as a **control**, never as a subject.

**Runbook — Control A (Mac; no trailing comments on any line; the witness
worktree is not modified).** First, while the lane build is still on the
phone, do the lane run with logs (see *Capture* below). Then:

```bash
cd /Users/soullab/MAIA-SOVEREIGN
git worktree add /Users/soullab/maia-control-a4305f4d6 a4305f4d6
cd /Users/soullab/maia-control-a4305f4d6
git rev-parse --short HEAD
grep -c VoiceController.swift ios/App/App.xcodeproj/project.pbxproj
ls ios/App/App/Recognition 2>&1 | head -1
npm ci
ls /Users/soullab/maia-ds01-witness/out/maia.html
rm -rf out
cp -R /Users/soullab/maia-ds01-witness/out out
CAPACITOR_MODE=beta npx cap sync ios
diff -rq /Users/soullab/maia-ds01-witness/ios/App/App/public ios/App/App/public && echo WEB LAYER IDENTICAL
cd ios/App
pod install
xcodebuild -workspace App.xcworkspace -scheme App -configuration Debug -destination generic/platform=iOS -allowProvisioningUpdates -derivedDataPath ~/voice-control-dd build 2>&1 | tail -3
/usr/libexec/PlistBuddy -c 'Print :CFBundleShortVersionString' -c 'Print :CFBundleVersion' ~/voice-control-dd/Build/Products/Debug-iphoneos/App.app/Info.plist
xcrun devicectl device install app --device A0736AC8-793B-516F-AC72-C076DB6CEE38 ~/voice-control-dd/Build/Products/Debug-iphoneos/App.app
xcrun devicectl device process launch --device A0736AC8-793B-516F-AC72-C076DB6CEE38 life.soullab.maia
```

Expectations: HEAD `a4305f4d6`; `grep -c` → `0`; `ls Recognition` → "No
such file"; `WEB LAYER IDENTICAL` printed (if not, STOP — the control is
not clean); `** BUILD SUCCEEDED **`; the install replaces the lane build
(same bundle id). The lane build survives at
`~/voice-witness-dd/Build/Products/Debug-iphoneos/App.app` and reinstalls
with the §12.10 `devicectl` line if needed. If `npm ci` or `pod install`
fail at `a4305f4d6`, STOP and relay; do not patch the control.

**Capture (both runs, identical procedure).** Ringer set to **loud** for
both runs, so the silent-switch mechanism of §12.11 is held constant.
Console.app on the Mac → sidebar → the iPhone → *Start streaming* → search
`AudioSessionManager`. Then on the phone, `/maia`, five passes of S1–S4,
each pass a fresh mic start after the previous reply. After the run,
select all matching lines → copy → save as
`~/voice-witness-logs/lane-73d0df30d.txt` and
`~/voice-witness-logs/control-a4305f4d6.txt`. Optional second channel for
the web side (beta config has `webContentsDebuggingEnabled`): Safari →
Develop → the iPhone → the MAIA WebView → Console, filter `VoiceController`
and `TTS`; save alongside.

**Record format, one block per run.**

```text
RUN:            LANE | CONTROL A
NATIVE SUBJECT: 73d0df30d | a4305f4d6
WEB BUNDLE:     5846a0824
RINGER:         loud
PASSES:         5
REPLIES VOICED: n/5
MIC RETURNED:   n/5
FIRST PASS AFTER LAUNCH: voiced / silent · mic returned / stuck
TIME-TO-SETTLE: (if it "resolved itself", after how many passes / minutes)
CONSOLE:        file · lines around each silent reply pasted verbatim
```

**Reading the result (pre-declared, so the reading is not fitted to the
outcome).**

- Control A clean (5/5 voiced, 5/5 returned) and lane intermittent → the
  native seam is implicated; §13 records the seam SUSPECT and the founder
  rules on revert/repair as a build act (§8).
- Control A intermittent in the same way → the seam is not shown to have
  changed the product; the smoke FAIL belongs to the product baseline;
  founder rules whether Probe / A-B may proceed on a known-flaky baseline.
- Both clean over 5 passes → the earlier failure was not reproduced; run
  10 more passes on the lane build before concluding anything.
- Console shows a `setCategory` / `setActive` error under
  `prepareForSpeaking` at the moment of a silent reply, in either run →
  the transition is the locus regardless of attribution.

**Not pursued here.** `lib/audio/ttsWithFallback.ts` posts to
`/api/voice/sesame` with a 10 s timeout and then falls back to browser
`speechSynthesis`; no route at that path exists in the repo tree
(`app/api/voice/sesame/route.ts` absent), and production TTS is Kokoro by
compose. Whether `/maia`'s voice mode uses that helper at all was not
traced. It is noted because "resolves with time" fits a TTS warm-up, and
it is left alone because the ruling orders the native control first.

**Status after this record.** LIVE PATH SMOKE: FAIL (INTERMITTENT) — STOP —
ATTRIBUTION UNRESOLVED — PRE-LANE CONTROL A ORDERED (native `a4305f4d6`,
web `5846a0824`) — Console capture on both runs — NO REVERT AUTHORIZED —
§13 not written.

**Addendum (founder, live, after §12.12):** *"Tap To Speak does nothing."*
The stuck state is harder than "did not auto-return": a manual tap on the
orb does not start the mic either. Recorded as **S4: FAIL (hard)** for that
pass. Two mechanisms fit, and the Console capture separates them without
construction: (a) the tap reaches native — `prepareForListening` is logged
and its `setCategory`/`setActive` fails or the recognizer never starts →
native session transition, seam-adjacent; (b) nothing reaches native on
the tap → the web state machine is still in "speaking" because the silent
reply never emitted `AUDIO_ENDED`/`AUDIO_FAILED` (§12.11 handler at
`OracleConversation.tsx` ~2551), so the orb ignores input until a timeout
clears it — which is also what "resolves itself with time" would look like.
(b) is a TTS/web-side locus. Instruction issued: capture the stuck state
now, before killing the app.

**Settings screenshot (founder, 21:24 device time).** The in-app Settings
footer reads `v1.1 (5846a0824) • 2026-09-11 • https://soullab…`, and the
Settings page carries the P12 note *"Voice Controller Test — unavailable on
device … On-device voice diagnostic is unmet (P12)."*

- **`5846a0824` is now confirmed from the artefact itself** — the web
  bundle's `BUILD_STAMP.commit`, inlined at build time — not only from the
  Mac transcript. WEB BUNDLE provenance is closed.
- **The `v1.1` label is not evidence.** `components/account/AccountSettings.tsx:2944`
  renders the literal string `v1.1 (` and interpolates only the commit and
  date; it never reads `BUILD_STAMP.version`, which this bundle does carry
  as `1.2.0` (`NEXT_PUBLIC_VERSION` is stamped in `next.config.js` since
  `425c11ecc`). The plist (`1.2.0` / `2511`, §12.10) remains the APP
  VERSION / BUILD authority. Pre-existing display defect, outside this
  lane; queued as a separate task, not touched here.
- The P12 note on device confirms, from the running bundle, what §12.6
  found in the patch script: the diagnostic surface is absent by design.
- Status bar still shows the silent-mode indicator at 21:24; the ringer
  has not yet been set to loud for the runs ordered in §12.12.