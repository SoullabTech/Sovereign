# Voice — whole-organism map page

**Phase:** 1 (JARVIS-HUMAN-EXPERIENCE-MASTER-RUN-v1 §5) · **Date:** 2026-09-06 · **Method:** read-only
census of code, prompts, copy, migrations and dated records. **Stop rule:** a defect found here
creates no permission to repair it. Nothing in this page changes MAIA.

**Evidence classes:** A = replicated external research · B = single/vendor/conceptual · C = human
witness under study ethics · D = interpretive doctrine · E = runtime fact (code path, migration,
production record). **Observation status:** WALKED (runtime witnessed, dated) · READ (code/prompt/
copy read at a named path) · UNKNOWN (with the reason). **Category:** Cat 1–6 (six-category typology).

**Reads against:** P9 · presence · Deep-Intelligence Gate. **Founder's question:** *what are timing, silence, fillers and interruption doing relationally?*

## 0 · What this subsystem is (E, READ) — paths, entry points, what is live vs designed vs dormant

**Live spoken turn on `/maia` (Cat 6):**

```
capture ─ components/voice/ContinuousConversation.tsx (4,275 lines)
   transport: lib/utils/platformDetection.ts:125-130
     native → Capacitor SpeechRecognition · desktop → 'sovereign-whisper' · no Web Speech → 'sovereign-whisper' · else 'web-speech'
     whisper: app/api/voice/transcribe-simple/route.ts:11-20  (local Faster-Whisper, http://127.0.0.1:8000; maia-whisper container)
   silence → auto-submit: lib/voice/voiceTiming.ts  TALK 3,500 ms · CARE 10,000 ms · SCRIBE never · native 2,500 ms · grace 750 ms
     mounted: components/OracleConversation.tsx:10361-10365 (by listeningMode)
   desktop turn cap: lib/voice/desktopUtteranceLimits.ts:40  DESKTOP_MAX_UTTERANCE_MS = 120_000 (after the 8 s inherited-recovery-bound defect, :4-18)
   barge-in: ContinuousConversation.tsx:302-304 (defaults: enabled, 200 ms debounce, 1.2× VAD threshold) · detection :2356-2380 · native path :2988-2999
      → onInterrupt → OracleConversation.tsx:2868-2890 handleVoiceInterrupt (hard cut, refs reset, toast "✋ Interrupted")
      member-governed: QuickSettings :1119-1166, :1377-1401 · voice commands :6848
admission ─ OracleConversation.tsx:6718 handleVoiceTranscript
   :6722 empty guard · :6734-6741 reject transcript while MAIA speaking/processing ("Voice Feedback Prevention")
   :6747-6755 duplicate within 30 s · :6772-6800 crisis detection (mode → care; script spoken via maiaSpeak :6790-6796; does NOT return)
convergence ─ await handleTextMessage(cleanedText)   ← pinned by __tests__/voice-non-degradation.test.ts:360-400 (closed call sets), :401-490 (probes), :516-521 (endpoint passed at every /maia mount)
cognition ─ handleTextMessage :4905 → apiFetch(apiEndpoint) → /api/sovereign/app/maia/list → getMaiaResponse()   (default apiEndpoint '/api/between/chat' at :646 — standing omission hazard, gate doc :117-131)
   modality proxy: list/route.ts:1300-1302 (includeAudio ? 'spoken' : 'typed'); includeAudio → getMaiaResponse :1316, :1368
egress ─ server: lib/sovereign/maiaService.ts:3384-3392 synthesizeMaiaVoice(text) → lib/voice/maiaVoiceService.ts:2-27  = OpenAI `tts-1` DIRECT (no ttsRouter, no assertProviderQualified); payload list/route.ts:1802-1807
         client: NO consumer of that payload found (grep audioBase64|toAudioResponsePayload in components/, lib/hooks → none)
                 client re-synthesizes sentence-by-sentence: OracleConversation.tsx:5901-5944 → generateWithRetry :5918 → lib/voice/StreamingAudioQueue.ts:583-596 → POST /api/voice/openai-tts
                 app/api/voice/openai-tts/route.ts:196-203 "Default ('auto') now routes directly to OpenAI"; Kokoro only if MAIA_TTS_PROVIDER=kokoro; direct OpenAI calls :150, :318 sit OUTSIDE ttsRouter.synthesize (:178) and therefore outside the R15 allow-list (lib/tts/ttsRouter.ts:61-67 'production-maia': ['auto','kokoro'])
wait state ─ no filler audio, no placeholder phrase (grep filler|hmm|thinking sound|one moment in OracleConversation.tsx → none); UI 'thinking' = rotating amber dot, no copy (components/voice/VoiceInteractionBar.tsx:81-89; state derived OracleConversation.tsx:878); watchdog 90 s audio / 120 s processing (:2892-2900)
```

**Designed / dormant (Cat 4) — timing and filler machinery that exists but is not on the `/maia` path:**

| Module | What it would do | Liveness |
|---|---|---|
| `lib/voice/NudgeSystem.ts:16-21` | on member silence speak `"I'm still here."`, `"Take your time."`, `"I'm listening whenever you're ready."`, `"No rush, I'm here for you."` | caller `MayaHybridVoiceSystem` → `components/voice/MayaVoiceIndicator.tsx` → `MayaVoiceChat` / `MayaVoiceJournal` — **not mounted in `app/`** |
| `lib/voice/GenuineUtteranceGenerator.ts:2-4` | "involuntary, contextually appropriate brief responses" (backchannels) | caller `UnifiedVoiceOrchestrator` — **0 callers** |
| `lib/voice/SilenceDetector.ts`, `lib/voice/AdaptiveSilenceCalibration.ts:2-4` ("MAIA learns your natural conversation rhythm") | adaptive silence thresholds | `MayaHybridVoiceSystem` (unmounted) / `lib/consciousness/MAIASelfAwareness.ts` (not imported by `lib/sovereign` or `app/api/sovereign`) |
| `lib/voice/PacingModulation.ts:1-8` | "Influence Through Modeling — mirror the user's energy first, then gently guide toward presence" | `engines/ProsodyEngine.ts` (test-only) · `ElementalVoiceOrchestrator` (0 live callers) |
| `lib/voice/ConversationalTiming.ts` | strategic pauses, emphasis | **0 callers** |
| `lib/consciousness/intimate-conversation-patterns.ts:8, :192-198` `silenceComfort: 0.8` | comfort with extended pauses | debug panel only (`OracleConversation.tsx:10693`) |
| `app/api/voice/stream-conversation` (token streaming + `silence` / `move_outcome` decisions) | low-latency spoken path | **unreachable from voice by structure** since 2026-08-31 (gate doc :148-160, :245-256; test :493-514) |

**Continuity under breakage:** `lib/voice/conversationContinuityBuffer.ts:1-22` — "NO RECOGNIZED SPEECH IS LOST" once the browser produced text; Sanctuary-gated (`OracleConversation.tsx:1081`).

**Dated runtime records (E):** `docs/ops/PRODUCTION_LOG_FINDINGS_2026-08-27.md:34-46` — MAIA's voice witnessed going through OpenAI (`[tts.attempt] provider:"openai"`) in production on the stream route; "Not a bug — designed behaviour"; canon conflict named (`:52-62`). `docs/adr/012-openai-tts-production-status.md` — **Open / Deferred** (2026-07-07). `docs/ops/MAIA-D01_NATIVE_VOICE_DESKTOP_WITNESS_2026-08-25.md:16` — SUPERSEDED; `:208-212` 2,500 ms end-of-utterance; `:277` "What has NOT been witnessed"; `:358` "`UNWITNESSED` is not a pass". `docs/canon/MAIA_CONVERSATIONAL_INTELLIGENCE_NON_DEGRADATION.md:258-260` — narrow invariant **GREEN** 2026-08-31; `:273-291` human witness **required, not recorded**. No record after 2026-08-31 of a walked canonical spoken turn was found in `docs/`.

## 1 · The founder's question for this subsystem

**What are timing, silence, fillers and interruption doing relationally? — Engineered as attentiveness devices; relational effect unmeasured (no class C). (E, READ.)**

- **Latency.** No filler, no "hmm", no placeholder phrase, no thinking sound. The member sees a rotating amber dot with no words for the whole canonical round-trip (transcribe → cognition → text → per-sentence TTS). The gate deliberately traded first-sound latency for one mind (`gate doc :245-256`); the latency distribution is **unmeasured in any dated record**. Whether the pause "feels attentive or broken" (§5 returned UX question) cannot be answered from the repo.
- **Silence.** Silence ends the member's turn (auto-submit at 3.5 s Talk / 10 s Care / never in Note, plus 750 ms grace). MAIA does not re-engage on silence on the live path — the nudge strings exist only in unmounted code. Silence is therefore *turn-taking*, not a relational move; "can silence remain meaningful" is unaddressed by design (Note mode is the one place silence is unbounded).
- **Interruption.** Member-governed (settable on/off, sensitivity) and honoured as a hard cut with a "✋ Interrupted" toast; nothing is spoken back. But transcripts arriving while MAIA is speaking or processing are **rejected** (`:6734-6741`), so whether the words the member spoke *while* interrupting survive into the next turn is **UNKNOWN** from code (depends on recognizer timing after `handleVoiceInterrupt` clears the refs).
- **Engagement vs attentiveness.** No live mechanism optimizes for continuation, length or return. The only re-engagement-shaped artifact ("No rush, I'm here for you.") is dormant. `PacingModulation` ("influence through modeling") is dormant. Verdict: attentiveness by design; effect unwitnessed.
- **One mind.** Yes at the client convergence point, pinned by a compiler-derived closed-set test. STT is local (Whisper) and TTS is OpenAI on both the server (`maiaVoiceService.ts`) and the client (`/api/voice/openai-tts` default) — permitted by the gate ("STT/TTS are sensory infrastructure and may change freely") but contrary to CLAUDE.md *"Voice: Local TTS/STT or browser APIs only"* and outside the R15 allow-list. That is an infrastructure/sovereignty finding, not a mind finding.

## 2 · The nine questions

1. **Human phenomenon.** Presence through contingent responsiveness and interactional vitality (v0.2 §1.6, §2.6); turn-taking as attunement (§1.2). Position: **Relationship**. (D, READ.)
2. **Principle.** Supports P9 (no manufactured reciprocity: no fillers, no "I'm here for you" on the live path) and the Deep-Intelligence Gate. Touches P12 (no disclosure of what the wait is) and P6 (calibrated trust: a long silent wait is uninformative). The dormant nudge copy would touch AP1 shape ("No rush, I'm here for you"). (E, READ.)
3. **Self / World capacity.** Self: member controls mode, interruption, listening mode; generous silence tolerates thought. World: nothing here points outward. Neither measured. (E, READ; C: none.)
4. **Influence (P4′).** 1 — **absent** (wait state undisclosed; no "I'm thinking" copy). 2 — **met** (no distress-sensitive timing on the live path; dormant `AdaptiveSilenceCalibration` would learn rhythm). 3 — **met** (no timing tuned to continuation). 4 — n/a. 5 — **met** (interrupt/mode/listening settings are member-authored). 6 — absent. 7 — unknowable from inside. 8 — n/a. 9 — n/a. (E, READ.)
5. **Remembers.** Client: `voiceSettings` (interrupt, sensitivity, listening mode) in localStorage; continuity buffer of recognized text (Sanctuary-gated); `lastProcessedTranscriptRef` 30 s. Server: transcription audio is not retained by the route (`transcribe-simple` sends to local Whisper); TTS text is sent to OpenAI per sentence (third-party retention **UNKNOWN**). (E, READ.)
6. **Authority.** Member-authored settings (situate). Transcript is member speech mediated by a recognizer — verbatim beneath nothing derived; no derived timing state persists on the live path. (E, READ.)
7. **Useful difference or validation drift?** Not applicable to timing; no filler means no reflexive affirmation sounds. (E, READ.)
8. **Elementally differentiated?** Voice profile/element hints exist (`maiaSpeak(text, elementHint)` :1949; `audioQueue.enqueue({… element})` :5939-5942) — prosody by element is a styling layer after cognition; H1 descriptive only, no runtime claim. (E, READ.)
9. **Human evidence.** **None** for the canonical path. The gate's own acceptance requires a human witness that has not been recorded (`gate doc :273-291`). D01 (native desktop, superseded) explicitly lists unwitnessed criteria.

## 3 · R11 design audit (each: FOUND / NOT FOUND / UNKNOWN, with path)

| Item | Verdict | Where |
|---|---|---|
| agreement drift | NOT APPLICABLE to transport; n/a | — |
| validation loops | NOT FOUND (no backchannel/affirmation audio live) | `OracleConversation.tsx` grep negative; `GenuineUtteranceGenerator` 0 callers |
| memory-amplified sycophancy | n/a here | — |
| hidden shaping objectives | NOT FOUND live; **FOUND dormant** — `PacingModulation` "Influence Through Modeling" (`lib/voice/PacingModulation.ts:1-8`), `AdaptiveSilenceCalibration` rhythm learning | as cited |
| approval optimization | NOT FOUND | no timing/latency/interrupt metric feeds any selection |
| emotional capture | NOT FOUND live; **FOUND dormant copy** — `"No rush, I'm here for you."` (`NudgeSystem.ts:20`) | unmounted |
| excessive reassurance | NOT FOUND live (no fillers); dormant nudge strings are reassurance-shaped | `NudgeSystem.ts:16-21` |
| historical pattern becoming identity | NOT FOUND | — |
| "you said before" becoming leverage | NOT FOUND | — |
| MAIA becoming more central rather than returning capacity outward | UNKNOWN — a long silent wait may hold attention on the interface; unmeasured | `VoiceInteractionBar.tsx:81-89` |

## 4 · Embodies v0.2 (what already does the right thing, with path)

- **Convergence before cognition, compiler-enforced** — `__tests__/voice-non-degradation.test.ts:47-70, :360-400, :401-490`; five generations of failed gates recorded honestly (`:10-46`). Standing law 8.
- **No fillers, no manufactured presence sounds** — P9 by absence (grep negative; generators unwired).
- **Member-governed interruption** with a hard cut and a one-word acknowledgement — `ContinuousConversation.tsx:302-304, :2356-2380`; `OracleConversation.tsx:2868-2890`. P4′-5.
- **Contemplative silence thresholds** stated as intent — `lib/voice/voiceTiming.ts:7-8` ("not a rapid-fire assistant"); Care 10 s; Note never auto-sends. P9.
- **Desktop turn cap raised from an inherited recovery bound (8 s) to 120 s** with the ontology error named — `desktopUtteranceLimits.ts:4-18, :40`.
- **Local STT** — `transcribe-simple/route.ts:11-20`. Sovereignty vow.
- **Continuity buffer, Sanctuary-gated** — `conversationContinuityBuffer.ts:1-22`; `OracleConversation.tsx:1081`.
- **Streaming path structurally unreachable, not flag-disabled; preserved as evidence** — test `:493-514`. Claim discipline.
- **R15 TTS allow-list exists as a funnel** — `lib/tts/ttsRouter.ts:61-67, :96-104` (but see §5).

## 5 · Contradicts v0.2 (what does the wrong thing, with path and the principle/AP violated)

| Finding | Path | Violates |
|---|---|---|
| Canonical voice egress synthesizes via OpenAI on the server (`maiaVoiceService.ts:2-27`) and, by default, on the client (`openai-tts/route.ts:196-203, :150, :318`), both outside the R15 funnel; production witnessed 2026-08-27 | as cited; `PRODUCTION_LOG_FINDINGS_2026-08-27.md:34-62` | CLAUDE.md sovereignty vow ("Local TTS/STT only"); P13 accountable party (member speech content leaves the sovereign host — text of MAIA's replies, not the member's audio); ADR-012 unresolved |
| Probable double synthesis: server synthesizes full audio the client never consumes, then the client re-synthesizes per sentence | `maiaService.ts:3384-3392`; `list/route.ts:1802-1807`; client grep negative; `StreamingAudioQueue.ts:583-596` | not a v0.2 principle — cost and egress duplication; **UNKNOWN** if any surface consumes the payload |
| Wait state has no disclosure — amber dot, no words, for the full canonical latency | `VoiceInteractionBar.tsx:81-89` | P12 (what am I doing), P6 (uninformative silence miscalibrates trust) — *design gap, effect unmeasured* |
| Crisis script spoken outside every guard, does not return (recorded 2026-08-31, unrepaired) | `OracleConversation.tsx:6790-6800`; gate doc `:223-229` | Deep-Intelligence Gate (egress outside the funnel) — already on record |
| Dormant re-engagement copy | `NudgeSystem.ts:16-21` | AP1 / AP2 shape (would apply only if mounted) |
| Default `apiEndpoint = '/api/between/chat'` — a mount without the prop silently changes MAIA's mind | `OracleConversation.tsx:646`; gate doc `:117-131` | Standing law 8 (hazard, not a violation today; guarded for `/maia` only by test `:516-521`) |

## 6 · Unknown (what cannot be known from reading; what instrument would answer it)

| Unknown | Why unreadable | Instrument |
|---|---|---|
| Latency distribution transcript → first audible sound on the canonical path | no dated measurement; stream route (the fast path) unreachable | read-only census of existing timestamps (`voice_transcribe_result`, `[openai-tts:<id>] … ms=` lines) by member-prefix; no new instrumentation needed for a first read |
| Whether words spoken while interrupting are kept or dropped | depends on recognizer timing vs `:6734` reject | count `🔇 [Voice Feedback Prevention] Rejecting transcript` lines per session in existing logs (read-only), then one consented witness walk |
| Whether the 3.5 s / 10 s silence thresholds read as attentive or broken | class C only | consented witness with per-mode timing (E2) |
| Whether any surface consumes the server-side audio payload | client grep negative; other clients (iOS shell, desktop) not fully read | grep across `ios/`, desktop shell; log `voiceEnabled: !!orchestratorResult.audio` (`list/route.ts:1756`) against client playback source |
| Third-party retention of MAIA reply text sent to OpenAI TTS | outside repo | founder/accountable-party statement (P13); ADR-012 decision |
| Voice quality of relational intelligence (same MAIA in voice as text) | gate's human witness not recorded | the witness the gate already specifies (`:273-291`), consented |

## 7 · Smallest evidence-producing intervention per gap

| Gap | Principle/AP | Human impact (1–5) | Architectural leverage (1–5) | Risk (1–5, never 0; higher = riskier) | Evidence state (observed / inferred / unknown) | Confidence (high / medium / low) | Smallest intervention | Experiment it feeds (E1–E10 or new) |
|---|---|---|---|---|---|---|---|---|
| V1 Canonical voice never human-witnessed; timing/silence relational effect unknown | P9, gate §Human witness | 5 | 3 | 1 | unknown | high (that it is unknown) | The gate's own consented witness walk, with per-turn timestamps logged from existing markers; no code change | **E2** (timing) and the gate's acceptance |
| V2 Full-latency silent wait, undisclosed | P12, P6 | 4 | 3 | 2 | observed (design) | high | Read-only latency census first; then a consented copy variant ("still listening / composing") vs dot — never covert | **E2** |
| V3 TTS egress via OpenAI outside R15 on both server and client defaults | sovereignty vow, P13, ADR-012 | 3 | 5 | 3 | observed (code) + WALKED 2026-08-27 (stream route) | high | Read-only log census of `[openai-tts:*]` vs `[tts.resolve] … kokoro` on the canonical path since 2026-08-31; founder decides ADR-012 | none (decision record, not experiment) |
| V4 Interrupting words possibly dropped | P3 (correction), P9 | 3 | 2 | 2 | unknown | medium | Count existing reject-log lines per session (read-only); one consented walk that interrupts mid-sentence | **E1** adjacent (member correction must be heard) |
| V5 Probable double synthesis | cost / egress | 2 | 3 | 1 | inferred | medium | Confirm consumer absence across all shells; log-only | — |
| V6 Dormant nudge / pacing copy | AP1, AP2, P4′-2 | 2 | 1 | 1 | observed (unmounted) | high | Copy audit entry; no action | **E3** |
| V7 Crisis script outside guard | gate | 3 | 2 | 3 | observed | high | Already recorded; no census action | — |
| V8 `apiEndpoint` default hazard | law 8 | 2 | 4 | 1 | observed | high | Extend the existing mount test to every `OracleConversation` mount (test-only) — *proposal, not action* | — |

## 8 · Provenance — files read, records cited, commit

Commit at census: `cf6d9ebf` (2026-09-06). Repository history begins at `2f8d9729` (2026-09-02); file dates carry no earlier provenance.

Files read (line-cited above): `components/OracleConversation.tsx:423, :646, :874-884, :1081, :1119-1166, :1377-1401, :1949, :2020, :2118-2140, :2868-2900, :4905, :5901-5944, :6706-6716, :6718-6800, :6848, :7437-7472, :10340-10372, :10693` · `components/voice/ContinuousConversation.tsx:189-198, :297-304, :336-340, :480-490, :537, :622, :1017-1043, :2352-2380, :2988-2999` · `components/voice/VoiceInteractionBar.tsx:7, :81-89, :121-131` · `__tests__/voice-non-degradation.test.ts:1-70, :92, :143, :217, :293-300, :360-521` · `lib/voice/voiceTiming.ts` (full) · `lib/voice/desktopUtteranceLimits.ts:1-40` · `lib/voice/conversationContinuityBuffer.ts:1-22` · `lib/voice/NudgeSystem.ts:5-40` · `lib/voice/PacingModulation.ts:1-25` · `lib/voice/StreamingAudioQueue.ts:583-596` · `lib/voice/maiaVoiceService.ts:1-40` · `lib/voice/guardrails.ts:1-25` (PII guard for collective listening, 0 callers) · `lib/tts/ttsRouter.ts:61-110, :178` · `lib/utils/platformDetection.ts:125-137` · `app/api/voice/openai-tts/route.ts:11-12, :24, :150, :196-216, :237, :318` · `app/api/voice/transcribe-simple/route.ts:11-20, :46` · `app/api/sovereign/app/maia/list/route.ts:10, :310-313, :1300-1316, :1368, :1756, :1766, :1802-1807` · `lib/sovereign/maiaService.ts:13, :605, :2650, :3384-3398` · `lib/consciousness/intimate-conversation-patterns.ts:8, :192-198` · caller counts for `lib/voice/{SilenceDetector,AdaptiveSilenceCalibration,ConversationalTiming,GenuineUtteranceGenerator,ConversationFlowTracker,ElementalVoiceOrchestrator,MayaHybridVoiceSystem}` and `components/voice/MayaVoiceIndicator.tsx` (grep, listed in §0).

Records cited: `docs/canon/MAIA_CONVERSATIONAL_INTELLIGENCE_NON_DEGRADATION.md:92-160, :218-301` · `docs/ops/PRODUCTION_LOG_FINDINGS_2026-08-27.md:34-62` · `docs/ops/MAIA-D01_NATIVE_VOICE_DESKTOP_WITNESS_2026-08-25.md:16, :101, :135, :208-212, :254, :277, :358-365` · `docs/adr/012-openai-tts-production-status.md:1-4` · `docs/architecture/VOICE_CANONICAL_CONVERGENCE_02_EXIT_MAP.md` (status line, 2026-08-31) · `tests/constitutional/refusal-registry/refusal-15-tts-provider-qualification-guard.ts:1-20` · `docs/research/human-experience/SYNTHESIS_v0.2_2026-09-06.md §1.6, §2.6, §3 (P9, P12), §6 (E2)`.

WALKED is claimed only for the 2026-08-27 production-log observation of OpenAI TTS on the stream route (`PRODUCTION_LOG_FINDINGS_2026-08-27.md`), which predates the 2026-08-31 convergence. Everything on the canonical path is READ or UNKNOWN. No runtime, database or production access was used.
