# VOICE-RECOGNITION-ENGINE-01 — Layer 2 recognition upgrade

**Status:** **IMPLEMENTATION COMPLETE — NATIVE ACCEPTANCE AND DEVICE WITNESS PENDING.**
`608e3ac` (implementation) + `6bfc5d2` (governing record) on
`claude/layer-2-recognition-upgrade-99d1re`. Not a promotion candidate. The
development act *in this environment* is closed; **the lane is not.** Its
terminal state is assigned only after the Mac witness, and is one of:
`CLOSED — LEGACY RETAINED` · `CLOSED — MODERN EXPERIMENTAL` · `CLOSED — PROMOTION RECOMMENDED`.
No further building before then (founder ruling 2026-09-03, §8).
**Remote pre-witness pass recorded 2026-09-03 (§9):** provenance resolved on the
committed record, JS gates green, native compile + device witness **blocked** in
that environment (no Apple toolchain). Decision **NOT REACHED**. Mac handoff in §9.6.
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
`.isAvailable`, `.supportedLocales`, `.results` (`text: AttributedString`, `isFinal`),
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
