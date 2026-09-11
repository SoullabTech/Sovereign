<!-- Text extraction of MAIA_Voice_2026_Architecture_Research_v1.docx (the document of record), made 2026-09-11 in-session. Tables are flattened to one cell per line; figures 1–4 are absent; the founder's Markdown source and the ZIP with diagrams did not arrive with the upload. Read the DOCX for the authoritative layout. -->

MAIA

VOICE 2026

Architecture Research & Redevelopment Blueprint

VERSION  1.0

DATE  11 September 2026

STATUS  Research synthesis; architecture recommendation; no production-code authorization implied

INTERNAL EVIDENCE ANCHOR  VOICE-2026 / CENSUS-01 · 6ae4ace7514fc676f498c1fdcc6aff0e80f80c44

RECOMMENDED DIRECTIONA native iOS VoiceKernel becomes the sole conversational audio authority. Speech models remain replaceable adapters. Canonical MAIA cognition remains intact.

Research synthesis prepared as ARCH-01 design input.

# Executive synthesis

MAIA should not continue treating the current iOS voice failure as a chain of independent defects. The completed executable census shows an authority problem: on /maia iOS voice mode there are four audio-session writers, eleven recognizer-start requesters, seven native stoppers, four simultaneously armed turn-closers, twenty-two discard authorities, ten automatic recovery drivers, and no single source of truth [I1]. The E16/E18 witnesses are therefore better understood as system-level interactions among multiple locally reasonable owners than as a sequence of isolated failures.

The external research converges with that diagnosis. Current Apple APIs support a persistent two-way native audio session using playAndRecord, voiceChat, and voice-processing I/O; Apple's newer Speech architecture explicitly decouples audio input, analysis, results, and session control [R1-R5]. Current voice-agent frameworks independently separate VAD, end-of-turn inference, interruption, output scheduling, and response generation rather than allowing recognition lifecycle to define conversational lifecycle [R7-R12]. Open speech stacks now make self-hosted and on-device deployment practical [R13-R22]. At the same time, full-duplex speech models such as Moshi and PersonaPlex demonstrate where the field is going: continuous listening/speaking, overlap handling, backchannels, and low-latency floor management [R23-R28].

### Recommended target

Build a native iOS `VoiceKernel` as MAIA's sole control authority for conversational audio. The kernel owns the physical session, input/output graph, routing, interruption recovery, turn commitment, observable health, and state projection. STT, TTS, turn-detection models, and network transports are adapters, not authorities. Canonical MAIA cognition remains outside the kernel and communicates through a narrow CognitionBridge.

The same kernel should support three deployment profiles without architectural change:

1.  Local-first profile: native audio + on-device STT/VAD/turn/TTS where performance is acceptable.

2.  Sovereign-server profile: native audio remains on-device; heavier STT/TTS/turn inference runs on infrastructure MAIA controls over an abstract real-time transport.

3.  Duplex research profile: Moshi/PersonaPlex-class models plug in experimentally behind the same boundaries; they never become the owner of MAIA's hardware, memory, or canonical cognition merely because their conversational timing is better.

This is the future-proofing move. Models can change monthly. The authority graph should not.

### What should stop

The legacy voice runtime should be frozen as a reference implementation and evidence source after the already-bounded E19/E20 witnesses. It should not be progressively "cleaned up" into the future architecture. In particular, the new design should not preserve:

- WebKit speech recognition or Web Audio as iOS hardware owners.

- recognizer restart as a recovery primitive for the whole conversation.

- recognizer segment boundaries as turn boundaries.

- multiple silence timers competing to close a turn.

- playback that cannot be explicitly stopped.

- UI booleans that report intended state instead of observed physical state.

- cloud-provider fallback that silently violates the declared sovereignty posture.

### The next implementation act

After architecture ratification, the next code should be a tiny native VoiceKernel reference organism, not a refactor of /maia. Its first task is to prove one coherent audio organism can remain alive through listening, playback, route changes, interruptions, model restarts, and long sessions without requiring a manual microphone tap.

# 1. Research question and method

The research question is not "which speech model is best?" It is:

What is the smallest coherent, sovereign conversational runtime MAIA should own in 2026 so that hearing, speaking, turn-taking, interruption, recovery, and observability remain stable while the underlying speech models continue to change?

The research used four evidence classes:

- Internal executable evidence: the completed MAIA CENSUS-01, E16/E18 failure analysis, repository history, and source tracing [I1].

- Platform authority: current Apple documentation for iOS audio and speech [R1-R6].

- Reference implementations: LiveKit, Pipecat, TEN, Hugging Face, and open speech runtimes/models [R7-R24].

- Research evidence: full-duplex benchmarks and human-conversation literature [R25-R32].

Vendor/model performance statements in this report are treated as candidate evidence, not accepted MAIA performance. They must be tested on MAIA's target iPhones and sovereign servers before selection. This distinction matters because the architectural decisions have a much longer half-life than any individual model.

# 2. The architectural diagnosis: the legacy runtime is split-brain

The completed census finds several partially overlapping systems that can instantiate or modify "voice": native AVAudioSession, the community speech-recognition plugin, a gatekeeper/session manager on the repaired line, WebKit media capture and Web Audio, a composer recorder path, web/native restart logic, independent turn timers, and an output graph that is not reachable by interruption paths [I1].

That is not merely "too much code." It means the system lacks a single answer to fundamental questions:

- Who owns the microphone right now?

- Who owns the speaker right now?

- Which component is allowed to change AVAudioSession category or mode?

- What event actually means the member's turn is complete?

- Which component may cancel MAIA's speech?

- What does "listening" mean: requested, engine-started, receiving frames, or hearing non-zero input?

- Who may initiate recovery, and who decides recovery succeeded?

The E18 storm becomes intelligible under this model. If independent owners each respond to the other's lifecycle transitions by restarting, recovery can become a self-exciting feedback loop. The system can satisfy local conditions while the overall conversational organism dies. That is exactly the class of failure exposed by an engine reporting itself started while the physical input path delivered digital zero.

### The central redesign principle

Voice is not STT + TTS. Voice is a persistent conversational audio runtime.

STT and TTS are capabilities inside that runtime. They are not the runtime itself.

Figure 1. Legacy authority explosion

# 3. What current iOS architecture now makes possible

## 3.1 One durable conversational session

Apple's playAndRecord category is explicitly intended for recording and playback, including simultaneous use, and it continues audio with the iPhone Ring/Silent switch set to silent [R1]. voiceChat is intended for two-way voice communication and Apple recommends Voice I/O or AVAudioEngine voice processing for the voice-specific processing path, including echo cancellation and automatic gain behavior [R2].

The important architectural implication is not merely a choice of category. It is that MAIA no longer needs to conceptualize each conversational turn as:

activate microphone -> recognize -> tear down -> configure output -> speak -> tear down -> configure input -> recognize

A better model is:

enter conversation -> establish duplex-capable session -> listen/think/speak/listen repeatedly -> leave conversation

Logical turn-taking can change while the physical audio session remains coherent.

## 3.2 Speech analysis no longer needs to own capture

Apple's SpeechAnalyzer is explicitly responsible for accepting speech input and coordinating analysis modules while input, output, and session control are decoupled and asynchronous [R3]. SpeechTranscriber is a module for general-purpose transcription and exposes device/locale availability rather than implying that it must control the hardware lifecycle [R4].

This is a useful architectural precedent even if MAIA ultimately chooses a different recognizer. Recognition should consume an audio stream; it should not own the microphone or the conversation.

## 3.3 Routing and interruption must be observable first-class state

Apple documents route changes as events that applications should observe and handle explicitly, including device connect/disconnect behavior [R5]. The current MAIA census finds no native route/interruption authority on the live path [I1]. Voice 2026 should reverse that relationship: route and interruption events belong at the kernel level and are part of the system's state, not incidental logs.

## 3.4 Native synthesis can be rendered without surrendering the audio session

Apple's AVSpeechSynthesizer.write(_:toBufferCallback:) generates audio buffers for further processing [R6]. That makes an Apple system voice useful as a fallback or test adapter without necessarily letting a synthesizer become an independent playback/session owner. The same principle applies to open TTS: models produce audio; the kernel renders it.

# 4. Convergence across modern voice-agent architectures

The most useful finding from the GitHub/framework survey is not a particular framework. It is convergence.

## 4.1 Turn completion is not VAD and not STT finalization

LiveKit treats turn detection, interruption handling, preemptive generation, and audio preprocessing as separate stages [R7]. Its current audio turn detector adds semantic and acoustic signals such as intonation, pitch, and rhythm on top of VAD, specifically because silence alone can prematurely close a thought [R8].

Pipecat's current default turn-stop strategy uses a dedicated Smart Turn model rather than simple VAD-only endpointing [R11-R12]. Pipecat also represents UserStoppedSpeaking separately from UserTurnInferenceCompleted, which is a particularly clean example of the distinction MAIA needs: speech activity ended and the conversational turn is complete are different facts [R10].

This independently supports the principle already earned by Repair Two:

recognizer segment != member turn

The principle should survive. The legacy implementation should not.

## 4.2 Interruption is a first-class event

LiveKit exposes explicit interruption operations and now distinguishes intentional interruptions from backchannels such as "uh-huh" or "right" using an acoustic model after VAD [R7, R9]. Pipecat has an explicit InterruptionFrame that cancels pending pipeline work, rather than hoping a recognizer stop cascades into the correct output behavior [R10].

MAIA therefore needs an InterruptionController with explicit authority to:

- detect candidate overlap,

- distinguish backchannel/noise from a real floor claim,

- cancel or fade output,

- truncate only the portion of response not actually heard when appropriate,

- preserve the incoming member turn,

- return control to the TurnCoordinator.

## 4.3 Data-flow architectures reduce hidden coupling

Pipecat wraps audio, text, and control signals in frames that pass through processors [R10]. Hugging Face's speech-to-speech stack exposes a fully modular VAD -> STT -> LLM -> TTS pipeline with swappable components and local/self-hosted operation [R13]. TEN similarly separates extensions for VAD, turn detection, transport, and model services [R14].

MAIA does not need to adopt these frameworks wholesale. But it should adopt the lesson:

components exchange typed data and events; they do not reach sideways into one another's hardware or lifecycle state.

# 5. Target architecture: Native VoiceKernel

The recommended design is a native iOS kernel with a strict split between control plane and data plane.

Figure 2. Target architecture

## 5.1 Control plane

The control plane owns state transitions and authority. A Swift actor is a good fit for serialized decisions, with real-time audio callbacks kept off the actor and connected through bounded, real-time-safe queues.

### VoiceKernel

The sole coordinator of conversational voice. It owns no model-specific logic. It owns authority.

Responsibilities:

- enter/leave conversational session,

- publish authoritative state,

- sequence route/interruption changes,

- supervise recovery,

- coordinate input, turn, cognition, and output,

- maintain session/turn/segment IDs,

- journal causal events.

### AudioSessionAuthority

The only code permitted to mutate:

- AVAudioSession category/mode/options,

- active/inactive state,

- preferred sample/buffer settings,

- route policy/overrides,

- voice-processing state,

- interruption/media-services reset recovery.

An automated source gate should fail if production code outside this module mutates AVAudioSession.

### TurnCoordinator

The only authority allowed to emit turnCommitted.

It consumes evidence from:

- VAD/speech activity,

- STT partials/finals,

- acoustic/semantic turn detector,

- elapsed pause,

- explicit member gestures,

- current conversational state,

- later, selected prosodic evidence.

A model can recommend a boundary. Only the TurnCoordinator can commit it.

### InterruptionController

Owns floor-transfer policy while MAIA is speaking. A raw VAD start is a candidate interruption, not automatically an interruption. The controller can explicitly cancel/fade output and transition to member speech.

### HealthSupervisor

Determines whether the organism is actually healthy. "Engine started" is never sufficient.

Health is derived from observations such as:

- input callback cadence,

- frame counts and timestamps,

- controlled RMS/peak telemetry,

- route identity,

- output frames scheduled/rendered,

- recognizer progress/heartbeat,

- transport heartbeat,

- model inference progress,

- audio-unit errors,

- interruption/reset state.

It is the only component that may request automatic recovery.

### StateProjection

UI state is a projection of observed kernel state, not the source of truth. Commands such as startConversation() are intentions; events such as inputHealthy=true are observations.

## 5.2 Data plane

The data plane carries:

- PCM input frames,

- audio-feature frames,

- transcript hypotheses,

- committed member text,

- MAIA response text/tokens,

- synthesized PCM output,

- model timing metadata.

No data-plane lifecycle event automatically grants control-plane authority. In particular:

- STT final does not commit a turn.

- VAD stop does not commit a turn.

- TTS EOF does not start a recognizer.

- transport reconnect does not reconfigure the audio session.

## 5.3 Adapter protocols

The volatile technologies sit behind protocols such as:

SpeechRecognizer  start(stream)  hypotheses -> AsyncSequence<TranscriptHypothesis>  stopAnalysis()TurnInference  assess(context) -> incomplete | complete | uncertainSpeechSynthesizer  synthesize(textStream) -> AsyncSequence<AudioChunk>  cancel(requestID)RealtimeTransport  connect()  sendAudio()/receiveAudio()  sendEvents()/receiveEvents()

These interfaces make it possible to swap Apple, Moonshine, sherpa/ONNX, Parakeet, Kokoro, Pocket TTS, Qwen, or future models without changing who owns the conversation.

# 6. The Voice 2026 Constitution

These should be written and ratified before production implementation.

### VOICE-01 — One hardware sovereign

Exactly one native authority may configure or activate the iOS conversational audio session.

### VOICE-02 — Conversation lifetime is independent of recognizer lifetime

An STT process may start, stop, crash, or be replaced without implicitly opening or closing the physical conversation session.

### VOICE-03 — Segment is not turn

Recognizer segmentation, finalization, and task callbacks have zero authority to commit or discard a member turn.

### VOICE-04 — Listening and speaking share one coherent session

Normal listen -> think -> speak -> listen transitions must not require competing components to rewrite the physical audio configuration.

### VOICE-05 — The WebView has no iOS hardware authority

On iOS, the WebView may express commands and render state. It may not own MAIA's microphone, recognizer, audio output, or session configuration.

### VOICE-06 — Recovery has one owner

Only the HealthSupervisor/VoiceKernel may initiate automatic recovery. Recovery is bounded, idempotent, generation-aware, and cannot form a self-exciting restart loop.

### VOICE-07 — Runtime truth precedes UI belief

The UI may display "listening" only from authoritative runtime state. Requested state and observed state remain separate.

### VOICE-08 — Started is not healthy

Health requires evidence of actual input/output flow. A running engine with dead input is degraded.

### VOICE-09 — Exactly one turn-commit authority

Timers, STT, VAD, models, and UI gestures provide evidence; only TurnCoordinator commits.

### VOICE-10 — Output is explicitly cancellable

Every playback request yields an addressable handle. Barge-in, stop, leave, and recovery can stop/fade output deterministically.

### VOICE-11 — Provider/model interchangeability

No STT/TTS/turn model can become architectural authority. Every model is replaceable behind a protocol.

### VOICE-12 — Transport cannot own hardware

WebRTC/WebSocket reconnects may restore a stream; they may not reconfigure the local audio session independently.

### VOICE-13 — Interruption is distinct from speech activity

Incoming speech during MAIA output becomes an interruption only after interruption policy says it is. Backchannels and incidental speech are separate states.

### VOICE-14 — Silence is evidence, never a verdict by itself

A fixed silence threshold may contribute to a turn decision but cannot be the sole definition of human completion.

### VOICE-15 — No unbounded retries

Every recovery attempt carries a generation ID, retry budget, backoff, and terminal degraded state visible to the member.

### VOICE-16 — Causal observability is built in

Every event is stamped with session, turn, output/request, model, and recovery-generation identity where applicable.

### VOICE-17 — Sovereignty is executable policy

Allowed speech providers/transports are enforced in runtime configuration. A local failure cannot silently fall through to a cloud provider.

### VOICE-18 — Raw audio and prosody are minimised

Raw audio is ephemeral by default. Derived prosodic or affective features require an explicit purpose and retention policy; they must not quietly become personality/mental-state surveillance.

# 7. Conversation state: separate floor, health, and route

One cause of the legacy complexity is trying to compress several orthogonal truths into a few booleans. Voice 2026 should keep at least three state dimensions separate.

## 7.1 Floor / conversational state

Figure 3. Conversation state

A useful first version:

- idle

- entering

- listening

- userSpeaking

- turnPending

- maiaThinking

- maiaSpeaking

- overlapCandidate

- recovering/degraded

This is initially compatible with a conservative half-duplex policy while the underlying audio graph remains duplex-capable.

## 7.2 Physical health state

Tracked independently:

- inputFlow: unknown / healthy / suspect / dead

- outputFlow: idle / rendering / stalled / failed

- route: built-in / receiver / HFP / other

- audioSession: inactive / active / interrupted / resetting

- stt: unavailable / ready / analyzing / failed

- tts: unavailable / ready / synthesizing / failed

- transport: local / connected / reconnecting / unavailable

This prevents an error in one layer from pretending the entire conversation has one generic "error" state.

## 7.3 Recovery generations

Every automatic recovery attempt increments a recoveryGeneration. Callbacks carry the generation that created them. A stale recognizer or network callback therefore cannot terminate the current generation's engine. This directly eliminates the class of stale-task ownership revealed in the legacy census [I1].

# 8. Framework survey: what MAIA should learn, not inherit wholesale

System

Useful lesson for MAIA

Why not make it the constitutional owner

LiveKit Agents [R7-R9]

Mature separation of turn detection, interruption, false-interruption handling, speech scheduling.

Its orchestration model is broader than MAIA's needs; MAIA already has canonical cognition, memory, and sovereignty constraints. Use as behavioral reference and benchmark peer.

Pipecat [R10-R12]

Strong frame/event architecture; explicit turn-completion events; open Smart Turn model; interruptions as control events.

Excellent exemplar, but MAIA's iOS hardware authority should remain native and minimal. Avoid moving constitutional ownership into a Python framework.

TEN [R14]

Extensible real-time multimodal graph; separates VAD/turn/model extensions and transports.

Larger runtime/ecosystem than needed for the iOS sensory layer; useful reference for extension boundaries.

Hugging Face speech-to-speech [R13]

Demonstrates a fully modular, local/self-hosted VAD->STT->LLM->TTS stack with WebSocket/WebRTC interfaces.

Best treated as a model/server laboratory or sovereign backend, not as the iOS hardware owner.

### Research ruling

Borrow invariants and test cases; do not import a second orchestration center. MAIA's VoiceKernel should be smaller than these frameworks because MAIA already has the rest of the organism.

# 9. Speech component shortlist for BENCH-01

The benchmark should compare roles, not brands. No model is selected by this research paper.

## 9.1 Speech-to-text

### Apple SpeechTranscriber / SpeechAnalyzer — system baseline [R3-R4]

Why test it:

- current native API,

- on-device availability on supported devices/locales,

- clean architecture for consuming supplied audio,

- low integration surface.

Why not constitutionally depend on it:

- device/locale availability varies,

- Apple's model/runtime evolves with OS versions,

- sovereignty requires a fallback path that does not depend on an Apple speech service decision.

### Moonshine Voice — on-device candidate [R15]

The project is explicitly optimized for streaming, real-time voice and supports iOS. English code/models are MIT-licensed; other-language models have different licensing constraints [R15]. Its claims of accuracy/latency should be independently tested rather than accepted at face value.

### sherpa-onnx — deployment/runtime candidate [R16]

sherpa-onnx supports local streaming and non-streaming ASR, VAD, TTS, Swift, and arm64 iOS. It is important to treat it as a runtime/deployment framework, not a single recognizer model. BENCH-01 should choose explicit model checkpoints within it.

### whisper.cpp — portable baseline [R17]

whisper.cpp remains valuable because it is mature, offline, optimized for Apple Silicon/Metal/Core ML, and demonstrably supports iOS. It is a strong baseline even if newer streaming models beat it on latency.

### NVIDIA Parakeet TDT 0.6B v3 — sovereign-server candidate [R21]

Parakeet v3 is a 600M-parameter multilingual ASR model with a lightweight native C++ local-inference path available via NeMo-Speech.cpp. It is more naturally treated as an owned-server/Mac-class candidate until MAIA's target-phone measurements prove otherwise.

## 9.2 Voice activity detection

### Silero VAD [R18]

Silero remains a practical open, streaming VAD with small ONNX/JIT deployment options. It is a good candidate for the speech-activity role.

Constitutional limitation:

VAD answers "is speech present?" It does not answer "is the member finished?"

## 9.3 Turn inference

### Pipecat Smart Turn v3 [R11-R12]

Smart Turn is an open native-audio turn model that runs locally through ONNX and is explicitly designed to use linguistic/acoustic information beyond VAD. It should be benchmarked on MAIA's reflective speech corpus.

### LiveKit audio turn detector [R8]

LiveKit's current detector uses acoustic cues and semantic information to avoid premature close on mid-thought pauses. It provides an external performance reference even if MAIA does not adopt the surrounding framework.

### MAIA-specific turn policy

A dedicated MAIA TurnCoordinator will likely remain necessary even if an off-the-shelf detector is excellent, because model output must be combined with member gestures, conversation state, and MAIA's tolerance for contemplative silence.

## 9.4 Text-to-speech

### Kokoro-82M [R19]

Kokoro is an Apache-2.0 open-weight 82M-parameter TTS model. It remains attractive as a small sovereign TTS baseline. The current MAIA route already references Kokoro conditionally, but Voice 2026 should benchmark it afresh rather than inherit that configuration.

### Kyutai Pocket TTS [R20]

Pocket TTS is a 100M-parameter MIT-licensed streaming model designed for CPU inference; its published implementation reports roughly 200 ms to first audio chunk and faster-than-real-time CPU generation on Apple hardware. This makes it a strong current candidate for owned-device/owned-server testing.

### Qwen3-TTS [R22]

Qwen's 1.7B CustomVoice model is Apache-2.0 and substantially larger. It is more naturally a sovereign-server quality/expressiveness candidate than a phone-first baseline.

### Apple synthesis buffer adapter [R6]

Apple's buffer callback API is valuable as an OS-native fallback and as an instrumentation control. It can generate PCM for the kernel to render rather than owning output state itself.

# 10. Full-duplex frontier: design for it, do not depend on it yet

The field has crossed an important threshold: full-duplex speech-to-speech systems are no longer theoretical.

## 10.1 Moshi [R23-R24]

Moshi is a full-duplex speech-text model with a streaming codec and provides MLX/iOS experimentation paths. Kyutai also provides moshi-swift specifically for experimentation on iOS. However, the project's own documentation notes that its basic local implementation does not itself solve echo cancellation or lag compensation [R23]. That is exactly why a full-duplex model cannot replace the audio kernel.

## 10.2 PersonaPlex [R25]

PersonaPlex extends the duplex model direction with role and voice conditioning. This is relevant to MAIA because relational role and voice matter. But role/persona and floor behavior should not be conflated.

A very recent 2026 benchmark, DuplexSpeechBench-IFEval, reports that persona-consistent content and conversational floor behavior can vary independently across real-time systems [R28]. This is an important warning for MAIA:

MAIA's relational identity must not be expected to implicitly produce correct turn-taking policy.

Floor policy deserves its own architecture and evaluation.

## 10.3 Full-Duplex-Bench [R26-R27]

Full-Duplex-Bench now evaluates interruptions, overlap, backchannels, side speech, disfluencies, self-corrections, and multi-turn/tool-use conditions. Its 2026 v3 data focuses specifically on real human fillers, pauses, hesitations, false starts, and self-corrections [R26-R27].

That benchmark family should inform MAIA's acceptance suite even if MAIA never uses any of the benchmarked models.

### Ruling for Voice 2026

The production architecture should be duplex-ready but cascade-capable. A future duplex model becomes one adapter/profile. It must not require another rewrite of audio authority, state, or canonical MAIA cognition.

# 11. Human conversation: the engineering model must match the phenomenon

MAIA's voice quality cannot be reduced to word error rate and latency.

## 11.1 Humans project turn endings

Levinson and Torreira review evidence that typical conversational gaps are on the order of ~200 ms while speech production takes substantially longer, implying that people often project an upcoming turn end and prepare before the other person has physically stopped [R31]. Stivers and colleagues found strong cross-linguistic tendencies to minimize both overlap and silence, while allowing quantitative cultural variation in timing [R30].

Engineering implication:

A system that waits for a fixed silence interval before beginning every response is structurally unlike human turn-taking.

## 11.2 But timing is not mechanically precise

Heldner and Edlund caution that real conversational pauses, gaps, and overlaps have broad distributions and that turn timing is less precision-clock-like than some descriptions imply [R32].

For MAIA, this matters even more because reflective dialogue contains meaningful hesitation, unfinished clauses, searching pauses, and deliberately held silence.

Therefore:

- fast response is not always good response,

- long silence is not always turn completion,

- overlap is not always interruption,

- backchannel is not always a new turn,

- a false start is not a failed turn,

- self-correction must remain part of the same living utterance.

## 11.3 Human-interaction data is becoming richer

Meta's Seamless Interaction dataset contains more than 4,000 hours of dyadic human interaction with synchronized multimodal data [R29]. The significance for MAIA is methodological: future conversational models will increasingly use interactional signals, not just transcripts.

MAIA should be prepared to consume richer acoustic timing/prosodic features later, but Voice 2026 should initially use such features for interaction control, not hidden psychological diagnosis.

# 12. Deployment profiles under one architecture

Instead of picking one topology forever, VoiceKernel should support three profiles.

Criterion

Local-first cascade

Native + sovereign server

Duplex research adapter

Hardware authority

Native kernel

Native kernel

Native kernel

Sovereignty

Highest when models are local

High if server/inference are owned

Depends on model/license/runtime

Offline resilience

High

Limited/degraded without network

Variable

Mobile thermal/battery

Main constraint

Better for heavy models

Potentially high cost

Model quality ceiling

Device-limited

High

High conversational naturalness potential

Observability

High

High with owned tracing

Lower unless carefully instrumented

Replaceability

High

High

Must be constrained by adapter

Near-term production fit

Good for lighter components

Strong for heavy STT/TTS

Research only

### Recommendation

Do not choose between local and sovereign-server as competing architectures. Treat them as routing profiles behind the same adapters.

A likely early production mix is:

- native audio/session/health/turn control on device,

- local VAD,

- local turn detector if benchmarked well,

- local STT on capable devices or sovereign-server STT when quality/thermal demands it,

- local or sovereign-server TTS,

- canonical MAIA cognition through its existing authoritative route.

# 13. Sovereignty must become runtime law

The census found /maia currently routes spoken output to an OpenAI TTS endpoint by default unless specific local conditions are met [I1]. Voice 2026 should not merely substitute one provider. It should make provider policy explicit and testable.

A VoiceProviderPolicy should define:

- which STT/TTS/turn backends are allowed,

- whether raw audio may leave the device,

- which owned endpoints are valid,

- offline fallback order,

- whether fallback is allowed at all,

- model/license/version identity,

- telemetry/retention policy.

### Fail-closed sovereignty

If local TTS fails and cloud TTS is prohibited, the correct behavior is a visible degraded voice state with text continuity — not silently sending material to a vendor endpoint.

This principle generalizes:

sovereignty is a routing invariant, not a mission statement.

# 14. BENCH-01: empirical benchmark programme

Model choice should happen only after a repeatable benchmark on MAIA's actual target devices and infrastructure.

## 14.1 Corpus

Build a consented, non-client benchmark corpus with three layers.

### A. Mechanical control corpus

- short commands,

- numbers/names/dates,

- controlled noise levels,

- known timing boundaries,

- speaker/mic distance changes.

Purpose: reproducible ASR, VAD, route, and latency measurement.

### B. Natural conversation corpus

- ordinary spontaneous speech,

- fillers,

- mid-sentence pauses,

- fast turn exchange,

- backchannels,

- interruptions,

- false starts/self-correction.

Purpose: realistic turn-taking behavior.

### C. MAIA reflective corpus

- 30-180 second monologues,

- 2-10 second meaningful pauses inside a single turn,

- "I need a second..." continuation,

- fragmented/hesitant speech,

- soft voice/whisper-like speech,

- emotionally laden but consented material,

- statements corrected late in the same turn.

Purpose: test the exact conversational ecology MAIA is intended to hold.

## 14.2 STT metrics

Do not rely on WER alone. Measure:

- conventional WER,

- semantic preservation score,

- named-entity/date/number preservation,

- partial stability/churn,

- time to useful partial,

- time to final hypothesis,

- long-utterance continuity,

- self-correction preservation,

- CPU/GPU/NPU load,

- memory,

- battery/thermal impact,

- offline/server bandwidth.

## 14.3 Turn metrics

Measure:

- false early close rate,

- missed end-of-turn rate,

- over-wait duration,

- interruption false-positive rate,

- backchannel preservation rate,

- continuation after long pause,

- self-repair continuity,

- floor-transfer latency.

The most important MAIA-specific falsifier is simple:

A person pauses reflectively for several seconds, continues the same thought, and MAIA does not seize the floor prematurely.

## 14.4 TTS metrics

Measure:

- time to first renderable audio,

- real-time factor,

- intelligibility,

- long-form stability,

- cancellation latency,

- streaming underruns,

- voice consistency,

- member preference/naturalness,

- CPU/battery/thermal cost.

## 14.5 End-to-end metrics

- 100 consecutive turns without manual mic recovery,

- 60-minute continuous session,

- zero competing audio-session mutations,

- zero unbounded restart loops,

- zero silent input/output failures without health escalation,

- output cancellation after a validated interruption,

- route switch recovery (speaker/HFP/other supported routes),

- foreground/background and screen-lock policy behavior,

- media-services reset recovery,

- network loss/recovery,

- STT process kill/recovery,

- TTS failure with text continuity,

- UI/runtime-state disagreement rate.

## 14.6 Fault injection

The kernel must be tested by intentionally breaking its parts:

- terminate STT mid-turn,

- terminate TTS mid-response,

- stall the transport,

- return zero audio frames,

- preserve callbacks from an old generation,

- remove/reinsert Bluetooth route,

- simulate interruption/media reset,

- reload the WebView,

- suspend/resume app,

- delay model output,

- inject false VAD speech,

- inject overlapping side speech.

A future-proof architecture is one whose failure modes are bounded and legible.

# 15. KERNEL-00 / KERNEL-01: build the organism before reconnecting MAIA

The first implementation should deliberately exclude most of MAIA.

## KERNEL-00 — physical audio organism

No STT. No TTS model. No LLM. No Web speech.

Prove:

- one session owner,

- duplex-capable graph remains active,

- input frame cadence is observable,

- known PCM can play through native output,

- output can be cancelled,

- route/interruption notifications are handled,

- health supervisor detects broken input/output,

- stale callbacks cannot affect a new generation.

## KERNEL-01 — turn organism

Add:

- VAD adapter,

- one baseline STT adapter (Apple is a useful control),

- TurnCoordinator,

- a simple native synthesis/sample adapter,

- 50-100 repeated conversational turns.

No canonical MAIA yet.

## BENCH-01 — replaceable speech adapters

Run the shortlist against the same harness without modifying the kernel.

A candidate that requires changes to kernel authority to work is architecturally expensive and should be penalized even if its benchmark score is good.

## BRIDGE-01 — reconnect canonical MAIA

Only after the organism is stable:

committed member turn  -> CognitionBridge  -> canonical MAIA route  -> streaming MAIA text  -> TTSAdapter  -> native OutputRenderer

MAIA's memory, cognition, model routing, and relational intelligence remain canonical. VoiceKernel is sensory/motor infrastructure.

# 16. Migration boundary

Figure 4. Migration path

## KEEP

- canonical MAIA cognition and routing,

- memory and relational intelligence,

- member/session identity and existing governed data paths,

- the earned principle that recognizer segment != turn,

- useful diagnostics/provenance concepts that do not carry old authority assumptions.

## ADAPT

- diagnostics into structured causal event journaling,

- server-side sovereign STT/TTS assets where they benchmark well,

- UI presentation into an observed-state projection,

- existing conversation APIs behind a CognitionBridge.

## REPLACE

- audio-session ownership,

- capture ownership,

- recognition lifecycle,

- turn-close system,

- output playback graph,

- interruption policy,

- recovery logic,

- routing/health model,

- native/web state bridge.

## REMOVE from the iOS voice path

- WebKit speech recognition as a capture owner,

- Web Audio as MAIA's primary output owner,

- competing restart-driver family,

- turn closure from recognizer stopped,

- implicit output restart/resume chains,

- watchdogs that restart capture without understanding output/session state,

- any provider fallback that bypasses sovereignty policy.

### No "dual hardware" migration

Do not A/B the old and new runtimes by letting both own the mic. During migration, only one hardware kernel is active.

Shadow evaluation is still possible:

fan out copies of one kernel-owned PCM stream to multiple read-only STT/turn adapters.

That provides comparative data without recreating the ownership defect we are trying to remove.

# 17. WebView boundary

The iOS WebView should remain valuable, but its role changes.

## Commands from UI to kernel

A deliberately small command set:

enterConversation()leaveConversation()setMicEnabled(bool)interruptMAIA()setOutputEnabled(bool)requestDiagnosticsSnapshot()

## Events from kernel to UI

voice.sessionStatevoice.routeStatevoice.inputHealthvoice.outputHealthvoice.userActivityvoice.turnStatevoice.transcriptPartialvoice.transcriptCommittedvoice.maiaOutputStatevoice.recoveryStatevoice.error

The UI never manufactures listening=true. It renders what the kernel says is true.

### Why remove WebKit hardware ownership

The internal census already shows WebKit participation in the legacy ownership collision [I1]. Historical and current WebKit bug reports also show that WKWebView/WebRTC media behavior can diverge from the host app's audio-session expectations and can suffer media-services reset failures [R33-R34]. Those reports are operational evidence, not a universal law, but they reinforce a simple boundary rule:

if native iOS is the product shell, native iOS should own the conversational hardware.

# 18. Full-duplex readiness without premature commitment

VoiceKernel should be physically duplex from the start, even if the initial conversational policy is conservative.

That means:

- input continues to exist while MAIA speaks,

- echo cancellation/voice processing prevents MAIA from transcribing itself,

- member audio can be evaluated for interruption,

- output is cancellable,

- TurnCoordinator can later learn richer floor behavior,

- a duplex model can later receive/emit streams without replacing the kernel.

### Do not confuse duplex hardware with duplex agency

A persistent duplex graph does not mean MAIA must immediately speak and listen freely at the same time. It means the system is capable of doing so without rearchitecting the hardware layer.

Production policy can progress safely:

1.  stable half-duplex turns on duplex hardware,

2.  explicit barge-in,

3.  backchannel-aware interruption,

4.  selected overlap,

5.  experimental duplex-model adapter.

# 19. Observability: build a flight recorder, not more console archaeology

E16/E18 required unusually difficult reconstruction because state lived across logs, JS refs, native callbacks, and physical audio behavior. Voice 2026 should make a complete conversational trace a first-class output.

A structured event might look like:

{  "session": "V-123",  "turn": 17,  "generation": 3,  "time_monotonic_ms": 482921,  "component": "AudioSessionAuthority",  "event": "route_changed",  "from": "builtInSpeaker",  "to": "bluetoothHFP",  "cause": "new_device_available"}

Core trace families:

- session lifecycle,

- route/session mutations,

- input callback cadence,

- VAD transitions,

- transcript hypotheses,

- turn decisions with contributing evidence,

- cognition dispatch/receipt,

- TTS generation/chunks,

- output render/cancel,

- interruption decisions,

- recovery generations,

- UI commands and projected state.

### Causal invariant

Every automatic state-changing event should answer:

What observation caused this act, and which generation/turn did the observation belong to?

If that cannot be answered, the act should not exist in the runtime.

# 20. Research risks and unresolved questions

The research is sufficient to choose the architecture direction, but not to select every implementation detail.

## 20.1 AVAudioEngine voice processing vs lower-level Voice Processing I/O

Apple supports both patterns [R2]. KERNEL-00 should begin with the simpler native path and explicitly measure:

- echo cancellation while MAIA output is rendered through the graph,

- HFP route behavior,

- latency,

- stability after interruptions/media resets.

If the higher-level engine cannot meet those gates, move lower in the stack. Do not choose preemptively.

## 20.2 Minimum iOS/device support

SpeechAnalyzer/SpeechTranscriber are current APIs, but device/locale support must be measured on MAIA's supported OS/device matrix [R3-R4]. They should remain one adapter, not a constitutional dependency.

## 20.3 On-device model thermal cost

Moonshine, whisper.cpp, local ONNX turn detection, and local TTS may each perform well alone but contend for memory/thermal budget when combined. BENCH-01 must run the whole candidate profile over long sessions.

## 20.4 Voice identity and licensing

Model code license, model-weight license, training-data terms, voice-sample consent, and commercial rights must be reviewed before a voice becomes production default. "Open weights" and "sovereign" are not synonyms.

## 20.5 Prosody and affect

Prosodic features are promising for turn timing, but using them to infer emotion, mental state, or personality raises a different validity/privacy question. Keep those concerns architecturally separate.

# 21. Recommended programme sequence

## ARCH-01 — Ratify architecture before source changes

Produce/ratify:

1.  Voice 2026 Constitution.

2.  Target authority graph.

3.  Orthogonal state model.

4.  Migration boundary.

5.  Provider/sovereignty policy.

6.  KERNEL-00 acceptance law.

## KERNEL-00 — Native physical organism

Prove one audio owner, persistent session, input/output health, cancellation, route/interruption recovery.

## KERNEL-01 — Native conversational organism

Add baseline STT/VAD/turn/synthesis adapters and pass repeated/long-session tests.

## BENCH-01 — Speech model comparison

Run Apple, Moonshine, selected sherpa models, whisper.cpp, Parakeet-server candidate; Silero/Smart Turn/other turn models; Kokoro/Pocket/Qwen/server TTS as applicable.

## BRIDGE-01 — Canonical MAIA

Connect committed turns and streaming responses to canonical MAIA without moving cognition into the kernel.

## MIGRATE-01 — Feature-gated iOS path

Replace the old /maia iOS voice transport with VoiceKernel. No dual hardware ownership.

## TURN-02 — Relational timing

Add barge-in, backchannel distinction, longer-pause projection, richer turn inference, prosodic timing.

## DUPLEX-R&D — Speech foundation models

Evaluate Moshi/PersonaPlex-class models behind the same adapters. Promote only if they improve the experience without compromising canonical cognition, sovereignty, or observability.

# 22. Founder decisions recommended from this research

The following are mature enough to ratify now if desired:

1.  Native VoiceKernel is the sole iOS conversational audio authority.

2.  WebView does not own iOS conversational capture or playback.

3.  Canonical MAIA cognition remains separate from voice infrastructure.

4.  Exactly one TurnCoordinator commits human turns.

5.  Speech providers/models are adapters governed by executable sovereignty policy.

6.  The runtime supports local and sovereign-server deployment profiles from one architecture.

7.  Full-duplex speech models are a planned experimental backend, not the production constitution.

8.  The legacy runtime is frozen after bounded witness work and is not incrementally transformed into VoiceKernel.

9.  KERNEL-00 precedes model selection and MAIA reconnection.

10.  Runtime health is physical/observable, not inferred from component booleans.

These decisions would let implementation begin without prematurely choosing a recognizer, TTS model, or full-duplex model.

# 23. Bottom line

The old architecture evolved around components. The new architecture should evolve around continuity of presence.

The technical expression of that is concrete:

- one physical authority,

- one turn authority,

- one recovery authority,

- one observable state projection,

- cancellable output,

- model-neutral adapters,

- a persistent duplex-capable session,

- causal diagnostics,

- canonical MAIA cognition kept intact.

That gives MAIA an architecture capable of using today's cascade models, tomorrow's full-duplex models, or models we have not seen yet without changing the laws of who owns the conversation.

# References

[I1] Internal MAIA executable census. VOICE-2026 · CENSUS-01 — The Executable Voice Authority Map, SoullabTech/Sovereign, commit 6ae4ace7514fc676f498c1fdcc6aff0e80f80c44, 2026-09-11. Path: docs/programme/VOICE-2026/CENSUS-01_EXECUTABLE_VOICE_AUTHORITY_2026-09-11.md.

[R1] Apple. AVAudioSession.Category.playAndRecord. https://developer.apple.com/documentation/avfaudio/avaudiosession/category-swift.struct/playandrecord

[R2] Apple. AVAudioSession.Mode.voiceChat; voice-processing guidance. https://developer.apple.com/documentation/avfaudio/avaudiosession/mode-swift.struct/voicechat

[R3] Apple. SpeechAnalyzer. https://developer.apple.com/documentation/speech/speechanalyzer

[R4] Apple. SpeechTranscriber; WWDC25 advanced speech-to-text. https://developer.apple.com/documentation/speech/speechtranscriber and https://developer.apple.com/videos/play/wwdc2025/277/

[R5] Apple. Responding to audio route changes. https://developer.apple.com/documentation/avfaudio/responding-to-audio-route-changes

[R6] Apple. AVSpeechSynthesizer.write(_:toBufferCallback:). https://developer.apple.com/documentation/avfaudio/avspeechsynthesizer/write(_:tobuffercallback:)

[R7] LiveKit. Turns overview / turn-taking tuning. https://docs.livekit.io/agents/logic/turns/ and https://docs.livekit.io/agents/logic/turns/tuning/

[R8] LiveKit. Audio turn detector. https://docs.livekit.io/agents/logic/turns/turn-detector/

[R9] LiveKit. Adaptive interruption handling. https://docs.livekit.io/agents/logic/turns/adaptive-interruption-handling/

[R10] Pipecat. Frames and system frames. https://docs.pipecat.ai/api-reference/server/frames/overview and https://docs.pipecat.ai/api-reference/server/frames/system-frames

[R11] Pipecat. User Turn Strategies / Smart Turn overview. https://docs.pipecat.ai/api-reference/server/utilities/turn-management/user-turn-strategies and https://docs.pipecat.ai/api-reference/server/utilities/turn-detection/smart-turn-overview

[R12] Pipecat. Smart Turn v3 open model. https://github.com/pipecat-ai/smart-turn

[R13] Hugging Face. speech-to-speech: modular open-source voice agents. https://github.com/huggingface/speech-to-speech

[R14] TEN Framework. Open-source real-time multimodal conversational framework. https://github.com/TEN-framework/ten-framework

[R15] Moonshine AI. Moonshine Voice. https://github.com/moonshine-ai/moonshine

[R16] k2-fsa. sherpa-onnx. https://github.com/k2-fsa/sherpa-onnx

[R17] ggml-org. whisper.cpp. https://github.com/ggml-org/whisper.cpp

[R18] Silero. silero-vad. https://github.com/snakers4/silero-vad

[R19] hexgrad. Kokoro-82M. https://huggingface.co/hexgrad/Kokoro-82M

[R20] Kyutai. Pocket TTS. https://github.com/kyutai-labs/pocket-tts

[R21] NVIDIA. Parakeet TDT 0.6B v3. https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3

[R22] Qwen. Qwen3-TTS 12Hz 1.7B CustomVoice. https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice

[R23] Kyutai. Moshi: speech-text foundation model for real-time dialogue. https://github.com/kyutai-labs/moshi

[R24] Kyutai. moshi-swift. https://github.com/kyutai-labs/moshi-swift

[R25] NVIDIA ADLR. PersonaPlex: Natural Conversational AI With Any Role and Voice, 2026. https://research.nvidia.com/labs/adlr/personaplex/

[R26] Lin et al. Full-Duplex-Bench repository. https://github.com/DanielLin94144/Full-Duplex-Bench

[R27] Lin et al. Full-Duplex-Bench-v3: Tool Use Under Real-World Disfluency, 2026. https://arxiv.org/abs/2604.04847

[R28] Mathur & Manocha. DuplexSpeechBench-IFEval: Implicit Instruction Following in Full-Duplex Voice Agents, 2026. https://arxiv.org/abs/2609.03423

[R29] Meta AI. Seamless Interaction: dataset and foundation models for human-human and human-AI interaction. https://github.com/facebookresearch/seamless_interaction

[R30] Stivers et al. Universals and cultural variation in turn-taking in conversation. PNAS 106(26), 2009. https://pmc.ncbi.nlm.nih.gov/articles/PMC2705608/

[R31] Levinson & Torreira. Timing in turn-taking and its implications for processing models of language. Frontiers in Psychology 6:731, 2015. https://pmc.ncbi.nlm.nih.gov/articles/PMC4464110/

[R32] Heldner & Edlund. Pauses, gaps and overlaps in conversations. Journal of Phonetics 38(4), 2010. https://doi.org/10.1016/j.wocn.2010.08.002

[R33] WebKit Bugzilla. WKWebView seems to ignore AVAudioSession category settings in iOS app, bug 167788. https://bugs.webkit.org/show_bug.cgi?id=167788

[R34] WebKit Bugzilla. getUserMedia can fail after an iOS 26 media-services reset, bug 319706 (2026 report). https://bugs.webkit.org/show_bug.cgi?id=319706

## Research status note

This report is a design synthesis, not a claim that any candidate model has passed MAIA's device-level acceptance gates. It is sufficient to open/ratify ARCH-01 and define KERNEL-00. Model selection remains intentionally uncommitted until BENCH-01 produces comparative evidence on MAIA hardware and owned infrastructure.