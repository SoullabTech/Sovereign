# VOICE-RECOGNITION-ENGINE-01 — Layer 2 recognition upgrade

**Status:** `608e3ac` on `claude/layer-2-recognition-upgrade-99d1re` — **architecture + implementation complete / native acceptance pending.** Not a promotion candidate. No further building in this lane (founder ruling 2026-09-03, §8).
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

## 8 · Closure record — founder ruling 2026-09-03 (after `608e3ac`)

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
3. **Establish the actual baseline build.** Repo says `2511`; the historical
   witness says `2515`. Record the SHA and build installed on the test phone
   before comparing engines. Do not paper over the difference.
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
`start → speech → stalls/interruption → continued speech → explicit turn closure → next turn`.
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
