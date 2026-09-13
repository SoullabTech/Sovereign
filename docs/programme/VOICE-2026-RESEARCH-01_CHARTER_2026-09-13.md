# VOICE-2026-RESEARCH-01 — Programme Charter

**Opened:** 2026-09-13 (founder act)
**Lane state:** **RESEARCH ONLY.** DECIDE not open. BUILD not open. DEPLOY not authorized.
**Branch:** `claude/voice-2026-research-ici0ph`
**Base commit at opening:** `e1c6f527`
**Authority:** founder (Kelly Nezat). This lane may not infer rulings, lift gates, amend doctrine,
repair defects it finds, or select an architecture.

---

## 1. Requirement (founder, as stated)

> Open a formal deep-research lane for Voice 2026 before we choose the replacement architecture.
> Make it deliberately bounded. We do not need to read 500 GitHub repositories or chase every new
> speech model. We need enough research to make a few foundational decisions correctly and then
> make the rest of the system replaceable.

And the opportunity named beyond repair:

> Design a sovereign conversational substrate that is architecturally ready for the transition
> from today's STT→LLM→TTS systems into tomorrow's genuinely duplex relational speech systems
> without having to rebuild MAIA when that transition matures.

## 2. Governing law for this lane

> **Future-proofing comes from boundaries and authority, not from picking the best STT or TTS
> model in September 2026. Models will change. The voice organism must not have to.**

Status: **CANDIDATE.** Not canon. Requires founder ratification at DECISION.

Corollary, operative immediately: every research output must be expressible as a *boundary* —
who owns the microphone, who owns turn authority, who owns output, who owns cognition — before it
is expressible as a *choice of component*. A finding that can only be stated as "use model X" has
not yet been converted into architecture.

## 3. What the census already established — Artifact 1 is a DELTA, not a start

⭐ **A read-only runtime census of the voice subsystem already exists and is dated:**
`docs/programme/MAIA_WHOLE_ORGANISM_MAP/05_voice.md` (2026-09-06, commit at census `cf6d9ebf`),
produced under the whole-organism master run at Evidence Classes A–E with explicit
WALKED / READ / UNKNOWN status per claim.

It already carries, line-cited:

- the **live spoken turn path end to end** — capture (`ContinuousConversation.tsx`), transport
  selection (`platformDetection.ts:125-130`), silence thresholds (`voiceTiming.ts` — Talk 3,500 ms ·
  Care 10,000 ms · Note never · native 2,500 ms · grace 750 ms), barge-in, admission guards,
  the **convergence point** (`handleTextMessage`, pinned by `__tests__/voice-non-degradation.test.ts`),
  cognition, and egress;
- the **dormant timing/filler machinery** — `NudgeSystem`, `GenuineUtteranceGenerator`,
  `SilenceDetector`, `AdaptiveSilenceCalibration`, `PacingModulation`, `ConversationalTiming` —
  all Cat 4, none mounted on `/maia`;
- six **named Unknowns with the instrument that would answer each** (§6);
- eight **gaps V1–V8 with smallest-intervention proposals** (§7).

**Therefore the CENSUS stage of this lane does not re-walk the subsystem.** It produces only the
delta between `cf6d9ebf` and this lane's base, plus the three things 05_voice.md explicitly could
not read:

- **D-1 · Latency distribution** on the canonical path, transcript → first audible sound, from
  *existing* log markers only (`voice_transcribe_result`, `[openai-tts:<id>] … ms=`). Read-only.
  No new instrumentation. (05_voice.md §6, V2.)
- **D-2 · The `12eb44281` repair** (2026-09-07, `commitOracleTurn()` seam, `VOICE_TRANSCRIPT_WATCHDOG_MS`)
  and `__tests__/voice-transcript-commit.test.ts` — landed *after* the census, therefore absent from it.
  ⛔ That fix is **deployed but NOT falsified by a member**; the decisive case remains **voice mode with
  MAIA's voice OFF**. The census delta records that standing, it does not discharge it.
- **D-3 · Which shells consume the server-side audio payload** (`list/route.ts:1802-1807`) — the
  census grepped `components/` and `lib/hooks` only; `ios/` and the desktop shell were not fully read.

⛔ **The census delta is read-only and repairs nothing.** 05_voice.md §5 records real defects
(OpenAI TTS outside the R15 funnel on both server and client defaults; probable double synthesis;
the crisis script spoken outside every guard; the `apiEndpoint` default hazard). **None of them are
this lane's to fix.** A research lane that repairs becomes an unauthorized change channel — the exact
shape of the 2026-09-07 finding that *merging to canonical is latent deploy authorization*.
Findings route to the founder as repair-lane candidates; they do not route to a commit here.

## 4. ⭐⭐ The constitutional constraint on the architecture space

**The Deep-Intelligence Gate is not a preference this lane may trade against latency.**
(`docs/canon/MAIA_CONVERSATIONAL_INTELLIGENCE_NON_DEGRADATION.md`.)

> *Voice may have a different capture path; it may not have a different mind.*

Restated narrowly and currently GREEN (2026-08-31):

> Every response-producing voice turn requiring MAIA cognition crosses the canonical cognition
> spine exactly once before any response transport begins.

**This has a hard consequence for the architecture space, and it must be stated before the research
runs rather than discovered after a benchmark makes a model attractive:**

⛔ **An end-to-end duplex speech-to-speech foundation model that produces MAIA's words IS a second
mind.** Moshi, PersonaPlex and the duplex lineage generate speech conditioned directly on audio;
placing one on the response path puts cognition inside the speech model, below the convergence
point, with no canonical spine crossing. That is **RED**. It does not become GREEN because the
latency is better, the prosody is warmer, or the demo feels more alive. The gate's own history
records five generations of failed convergence claims; this would be the sixth and the most
seductive, because it would fail *while sounding better*.

**The admissible form of the duplex frontier, and the only one this lane may research toward
adoption:**

```
duplex model confined to:   capture · VAD · turn detection · prosody analysis · backchannel timing
duplex model NEVER:         authoring MAIA's words · selecting MAIA's response · carrying cognition
```

A duplex model used as a **listener** — answering *is the member still speaking, are they pausing to
think, did they just interrupt, is this a backchannel* — is sensory infrastructure, and the gate says
sensory infrastructure may change freely. A duplex model used as a **speaker of MAIA's turn** is
substitution of the mind. Architecture C below is admitted **only in the listener form**; the speaker
form is recorded as out of bounds under current canon, and moving that boundary is a founder act
against the gate, not a research finding.

Same discipline, one layer down: **STT and TTS remain interchangeable sensory components.** The lane
may benchmark them freely. It may not let any of them acquire turn authority, response authority, or
a private path to the member.

## 5. Lane sequence

```
CENSUS (delta)
    ↓
LANDSCAPE
    ↓
EXEMPLARS
    ↓
BENCHMARK
    ↓
ARCHITECTURAL OPTIONS
    ↓
FALSIFICATION
    ↓
DECISION        ← founder act, no other stage may perform it
    ↓
VOICE KERNEL    ← separate lane, separate charter, not opened here
```

Each stage closes on a named artifact. **No stage opens on the previous stage's stage *looking*
finished** — it opens on the founder accepting the artifact. This lane does not infer its own
promotions, and it does not run BENCHMARK because LANDSCAPE went well.

⛔ **Research and design are not the same act.** This lane is explicitly forbidden the instruction
*"find the best architecture and build it"* — that collapse is the failure mode the sequence exists
to prevent.

## 6. The six research layers

### Layer 1 · Native iOS conversational audio — the non-negotiable foundation

Deep-read of current Apple material: `AVAudioSession`, `playAndRecord`, `voiceChat` mode,
`AVAudioEngine`, Voice Processing I/O, echo cancellation, AGC, Bluetooth/HFP, route changes,
interruptions, background/foreground transitions, screen lock, Ring/Silent behaviour,
`SpeechAnalyzer`, `SpeechTranscriber`, microphone capture providers.

**Question answered:** *what is the correct physical nervous system for a conversational iOS
application in 2026?*

**Output binding:** the answer becomes MAIA's **AudioKernel** — **one hardware authority** —
regardless of which speech models are later chosen. Apple's own separation of capture, analysis,
transcription and session management is architecturally healthier than letting a recognizer own the
microphone lifecycle, and MAIA's current arrangement should be read against that standard.

⚠️ This layer is where Capacitor's actual seams matter. `CLAUDE.md` already records that iOS WebView
diverges from web on cookies and static export; audio session ownership across the WebView/native
boundary is the same class of trap and must be read, not assumed.

### Layer 2 · Comparative architecture study (GitHub as architecture research, not shopping)

Four exemplars, deep-read for **laws**, not for code to copy:

| Exemplar | Read for |
|---|---|
| **LiveKit Agents** | session lifecycle · turn detection as its own stage · endpointing · interruptions · **false** interruptions · preemptive generation · speech scheduling · acoustic + semantic end-of-turn detection independent of STT |
| **Pipecat** | the frame-pipeline discipline — audio, text and control as data flowing through processors rather than components mutating each other's state; Smart Turn as a post-VAD conversational-cue evaluator |
| **TEN** | explicit separation of realtime multimodal orchestration, VAD and turn detection; full-duplex dialogue handling |
| **Hugging Face `speech-to-speech`** | the modular `VAD → STT → LLM → TTS` reference with each component replaceable, local operation supported, and the **interface contract separated from the model providers** — closest existing analogue to MAIA's sovereignty requirement |

**The governing question:** *what architectural laws have four independent teams converged upon?*
That convergence is the output. Adopting any of these frameworks is **not** proposed and is not
within this lane's authority.

⭐ Note for the record: MAIA's own 05_voice.md census independently discovered the same law these
four converged on — **turn detection is its own stage**. MAIA currently has no such stage; it has a
silence timer (`voiceTiming.ts`) doing turn detection's job. That is the single most likely
structural finding of this lane, and it was found before the landscape was read.

### Layer 3 · Component benchmarking — benchmark components, never marry them

Candidates to place on the bench (non-exhaustive, and the list is not a shortlist):

- **STT** — Moonshine Voice (realtime/on-device, iOS, streaming models rather than repeated offline
  transcription) · sherpa-onnx (streaming + non-streaming STT, VAD, TTS locally; Swift API; arm64 iOS —
  strong sovereignty candidate) · whisper.cpp (portable offline baseline, Metal/Core ML) ·
  Parakeet (**server-side on the sovereign host**, not assumed mobile).
- **VAD** — Silero (current generation), against a trivial energy baseline.
- **Turn detection** — Pipecat Smart Turn · LiveKit audio turn detector · a simple VAD + timing
  baseline (which is what MAIA has today) · an eventual MAIA turn model.
- **TTS** — Kokoro (82M, Apache-2.0 — unusually attractive for sovereign deployment) against the
  incumbent and against Apple's native synthesis.

**The benchmark question is NOT leaderboard WER.** It is:

> Which component behaves best for **long, reflective, hesitant, psychologically complex human
> speech** in a live MAIA conversation?

That is a different benchmark and it must be constructed, not borrowed.

⭐ **Authority boundaries asserted at this layer, before any measurement:**

- **VAD answers exactly one question:** *is someone speaking?* It never answers *is Kelly finished?*
- **Turn authority is a single named stage.** Today it is a timer; whatever replaces it is one
  authority, not a behaviour distributed across the recognizer, the UI and a timeout.
- **TTS is a slot, never a dependency.** The shape is:

```
SpeechSynthesizer
    ├── SovereignLocalTTS
    ├── SovereignServerTTS
    ├── AppleFallback
    └── ExperimentalTTS
```

  The model behind each slot may change without the organism changing. ⛔ Do not bake a model name
  into the architecture — that is precisely the mistake this lane exists to avoid repeating.

### Layer 4 · The full-duplex frontier — research, not adoption

Moshi (streaming neural audio codec, full duplex, with an MLX implementation targeting iPhone and
Mac alongside PyTorch and production Rust) and PersonaPlex (persona/role conditioning over the Moshi
lineage — relevant because identity and relational role matter more for MAIA than for a generic
assistant) demonstrate that this architecture is real rather than theoretical. Current duplex
research optimizes explicitly around **pause handling · turn-taking · backchanneling · interruption**,
evaluated directly against human conversational data.

That is a categorically different object from:

```
speech → transcription → silence timeout → answer
```

— which is what MAIA runs today. **The field is beginning to treat interaction as a learned
phenomenon rather than a scheduling problem.** This lane must understand that shift.

⛔ **Subject to §4 absolutely.** This layer is studied for the listener form. It is not a candidate
for MAIA's response path under current canon.

### Layer 5 · Benchmarks and acceptance methodology — study the instruments, not only the models

Full-Duplex-Bench and its successors evaluate pause handling, backchannels, interruptions, overlap,
latency, correction and entity tracking across multi-turn realtime conditions including disfluency.
**Borrow the methodology; do not inherit the value system** — its notion of a good conversation is
an assistant's, not MAIA's.

**Seed corpus for MAIA's Voice 2026 acceptance suite** (technical):

```
long reflective pause · "um... I don't know..." · self-correction · sentence restart · whisper ·
very quiet speech · backchannel "mm-hmm" · MAIA interrupted mid-word · false interruption ·
member speaks over MAIA · MAIA begins too early · 30-second monologue · 3-minute monologue ·
Bluetooth route change · AirPods removed · screen lock · phone call interruption ·
network disappears · STT process dies · TTS process dies
```

**Seed corpus, MAIA-specific and relational — this is the part no external benchmark supplies:**

```
crying / fragmented speech · slow contemplative speech ·
long silence that is NOT a turn end · rapid excited speech ·
soft agreement while MAIA is talking · "I need a second..."
```

⭐ **`long silence that is NOT a turn end` is the discriminator.** Every silence-timer architecture
fails it by construction, MAIA's included. An acceptance suite that does not contain it will pass a
system that talks over a person who is thinking.

⚠️ **Any corpus recorded from a real member is Evidence Class C and requires consent under study
ethics.** Synthetic and founder-recorded material carries no such status and must be labelled as
what it is. Sanctuary content may never enter a corpus, under any circumstance, including by request.

### Layer 6 · Human conversation itself

The track most engineering projects skip: turn-taking literature, conversation analysis, prosody,
backchanneling, repair, overlap, silence, interpersonal synchrony. Meta's Seamless Interaction work
(4,000+ hours of dyadic human interaction with explicit multimodal interpersonal-behaviour modelling)
indicates the direction the field is moving.

**For MAIA this is load-bearing, not enrichment.** The goal is not *make voice latency competitive*.
It is:

> understand what makes another presence feel as though it **stayed with you while you were finding
> what you meant**.

⚠️ Sovereignty check on this layer, applied in advance: research into synchrony and interpersonal
attunement is dual-use. The same findings that let MAIA hold a pause well would let a system
optimize for continuation, attachment, and session length. **Invariant: nothing learned here may be
routed into engagement, retention, or re-engagement behaviour.** 05_voice.md already flagged the
dormant precedents — `PacingModulation` ("influence through modeling"), `AdaptiveSilenceCalibration`
(rhythm learning), the `NudgeSystem` re-engagement copy. They are dormant. **This lane does not wake
them, and does not produce research whose only application would be to wake them.**

## 7. The seven artifacts

Each is a file under `docs/research/voice-2026/` or `docs/programme/`, dated, with evidence classes
per claim. **The lane closes a stage only when the founder accepts the artifact.**

| # | Artifact | Contents | Acceptance condition |
|---|---|---|---|
| 1 | **Current Runtime Census — delta** | D-1 latency read · D-2 `12eb44281` standing · D-3 payload consumers; delta vs `cf6d9ebf` | read-only; every claim WALKED/READ/UNKNOWN; **zero repairs** |
| 2 | **Voice Technology Landscape 2026** | Apple · GitHub · Hugging Face · papers | every vendor performance claim marked Class B; no Class A claimed without replication |
| 3 | **Reference Architecture Comparative** | LiveKit · Pipecat · TEN · HF · Moshi/PersonaPlex | states the **converged laws**, not feature tables; each law testable against MAIA |
| 4 | **Sovereign Speech Model Benchmark** | actual STT/VAD/turn/TTS runs on founder hardware + iPhone | ⛔ founder-run; results are measurements with dates and hardware named, never leaderboard citations |
| 5 | **Human Conversation Requirements** | what MAIA must hear about pause, interruption, backchannel, hesitation, prosody, silence | each requirement traceable to a corpus case in §6 Layer 5 |
| 6 | **Three Candidate Architectures + decision matrix** | §8 below, scored | ⛔ presents options; **does not recommend one as decided** |
| 7 | **VOICE-2026 Constitution** | the boundary law | authored **only after** 1–6 accepted; ratified by founder act |

**Artifact 7 is the deliverable this lane exists for.** Its predeclared content — one hardware
authority · one turn authority · one output authority · runtime truth over UI belief · provider
independence · cancellable output · model interchangeability · observable health · and the
Deep-Intelligence Gate's convergence point restated for the new substrate.

⛔ **The VoiceKernel organism is built in a separate lane, on a separate charter, after Artifact 7
is ratified.** It is not opened here.

## 8. The three candidate architectures

**Architecture A — Native sovereign cascade**

```
Native AudioKernel → local VAD → streaming sovereign STT → TurnEngine
    → canonical MAIA → streaming sovereign TTS → Native AudioKernel
```

Founder's current strongest candidate for MAIA 1.0 Voice 2026. Highly observable, sovereign,
components replaceable. ⭐ Satisfies §4 by construction: cognition sits at one named point and
everything either side of it is sensory.

**Architecture B — Native client + sovereign realtime server**

```
iPhone AudioKernel ⇅ WebRTC ⇅ MAIA realtime speech server → canonical cognition
```

Moves heavier speech models onto owned hardware while keeping native iOS audio custody. Patterns
learnable from LiveKit/Pipecat/HF **without using their hosted services**.

**Architecture C — Duplex speech foundation model**

```
continuous audio ⇅ duplex speech model ⇅ MAIA relational/cognitive layer
```

⛔ **Admitted to the comparison in the LISTENER FORM ONLY** (§4). The speaker form — the duplex model
authoring MAIA's turn — is RED under the Deep-Intelligence Gate and is scored as such, not omitted:
the matrix must show *why* the most impressive option is refused, or the refusal will not survive the
first good demo.

**Decision matrix axes:** sovereignty · latency · observability · reliability · battery ·
mobile feasibility · maintainability · licensing · offline capacity · extensibility ·
**relational quality** · ⭐ **gate compliance (pass/fail, not a score — a fail is disqualifying,
never a deficit to be outweighed)**.

## 9. Claim discipline for this lane

Evidence classes, as already in use in the whole-organism map:
**A** replicated external research · **B** single/vendor/conceptual · **C** human witness under study
ethics · **D** interpretive doctrine · **E** runtime fact (code path, migration, production record).

Binding rules:

- A vendor's latency, WER, or naturalness number is **Class B**. It is never promoted to Class A by
  appearing in a paper the vendor wrote.
- **Benchmarked ≠ deployed. Deployed ≠ demonstrated.** A component measured well on the bench has
  told us about the bench.
- `docs/canon/MARKETING_CLAIM_DISCIPLINE.md` governs any outward statement arising from this lane.
  Nothing here is LIVE. *We do not tell tomorrow's story as if it were today's.*
- ⭐ `docs/canon/CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md` applies to this lane's own outputs:
  research may inform design, design may inform a decision, a decision may authorize a build.
  **Never the reverse.** A benchmark result does not authorize an architecture; an architecture does
  not authorize a deploy.

## 10. Standing prohibitions

⛔ Not authorized in this lane, under any finding:

- **No code change to any voice path.** No repair of the defects 05_voice.md records (OpenAI TTS
  outside R15 · double synthesis · crisis script outside the guard · `apiEndpoint` default hazard).
  They are named, routed to the founder, and left alone.
- **No architecture selected.** DECISION is a founder act.
- **No framework adopted** (LiveKit, Pipecat, TEN, HF agents) — studied, not installed.
- **No dependency added, no model downloaded into the repo, no `package.json` change.**
- **No migration. No deploy. No production access beyond read-only log census under D-1.**
- **No dormant module woken** — `NudgeSystem`, `PacingModulation`, `AdaptiveSilenceCalibration`,
  `GenuineUtteranceGenerator`, `ConversationalTiming`, `SilenceDetector` stay Cat 4.
- **No member recording without consent; no Sanctuary content in any corpus, ever.**
- **No weakening of `__tests__/voice-non-degradation.test.ts`** or of the convergence point it pins.
- **No claim that the `12eb44281` voice fix is demonstrated.** It is deployed and author-tested.
  The member falsifier — **voice mode with MAIA's voice OFF** — remains owed.

## 11. Owed founder rulings (these block stages, and are named now rather than discovered late)

| # | Ruling owed | Blocks | Why it cannot be inferred |
|---|---|---|---|
| **FR-V1** | **ADR-012 — is TTS egress to a third party permitted, or is local-only TTS a hard sovereignty requirement?** (`docs/adr/012-openai-tts-production-status.md`, **Open/Deferred since 2026-07-07**) | BENCHMARK, and the meaning of Artifact 4 | If local-only is required, Kokoro/sherpa-onnx are the field and quality is constrained by it. If third-party is permitted, the comparison set and the whole sovereignty axis change. ⭐ **Benchmarking before this ruling measures the wrong field.** |
| **FR-V2** | Is **Architecture C in the listener form** admissible at all, or is the duplex frontier study-only for this cycle? | ARCHITECTURAL OPTIONS scope | §4 states the gate's consequence; whether MAIA *pursues* the admissible form is a founder choice, not a gate reading. |
| **FR-V3** | Benchmark hardware + who runs it | BENCHMARK | Artifact 4 needs an iPhone, the minisforum, and possibly the Mac Studio. A remote session has none of them. **Predeclared founder-run**, as with the disposable-shadow verifier precedent. |
| **FR-V4** | Does the census delta's read-only production log access (D-1) require a separate act? | CENSUS delta | 05_voice.md used **no** runtime access. D-1 would be the first. |

⭐ **FR-V1 is the sequencing fact.** It is the oldest open decision in the voice subsystem, it has
been deferred since July, and every downstream benchmark inherits its answer. Ruling it is the
highest-leverage single act available to this lane.

## 12. Success measures this lane optimizes for

1. **Foundational decisions made correctly** — few, boundary-shaped, durable.
2. **Everything else made replaceable** — no model name load-bearing in the architecture.
3. **The gate held while the voice improves** — §4 survives a better-sounding alternative.
4. **The relational question answered in MAIA's own terms** — pause, hesitation, interruption and
   silence understood as relational acts, not scheduling events.
5. **Research kept distinct from repair and from design** — the sequence not collapsed.

## 13. Stop condition

This lane stops, and does not proceed to VOICE KERNEL, if any of the following hold:

- The founder has not ratified Artifact 7.
- Any candidate architecture would place cognition below the convergence point (§4) and that is
  being argued around rather than refused.
- A benchmark result is being used as authorization rather than as evidence.
- The lane has begun repairing what it was opened to study.

---

**Standing at opening:** CENSUS delta not started · LANDSCAPE not started · EXEMPLARS not started ·
BENCHMARK not started (blocked on FR-V1, FR-V3) · ARCHITECTURAL OPTIONS not started ·
FALSIFICATION not started · DECISION not open · VOICE KERNEL not opened · no code touched ·
no dependency added · no deploy · no production access.

> **Voice may have a different capture path; it may not have a different mind.**
> This lane exists to make that survivable for another decade of speech models.
