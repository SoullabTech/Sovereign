# AI Engine Participation Audit — 2026-05-26

> **Build standard (Kelly 2026-05-26):**
> *Sovereignty is not model replacement. Sovereignty is governed participation.*

> **Goal articulation:**
> *MAIA becomes sovereign by moving cognition into her own governed architecture, while preserving coherence, relational continuity, safety, and verifiability.*

> **Governing doctrine:**
> *Engine existence is not engine participation. Participation requires runtime invocation, functional contribution, and observable provenance.*

**Headline framing**: MAIA has a multi-engine *substrate*, but her live conversational path currently runs primarily through Claude, with Qwen fallback and Kimi in limited library functions. Saying *"MAIA is powered by seven active engines"* is inflation. The other engines are preserved capability, not live participation.

Six-category framing applied to the multi-engine stack (Qwen, Kimi, DeepSeek, Ollama, Claude, multi-engine orchestra). *Built ≠ wired; wired ≠ surfacing.*

## 1. Topology

Three routing layers, only one is actively load-bearing:

```
generateText() [lib/ai/modelService.ts]
  │
  ├── if MAIA_INFERENCE_MODE set  → sovereignRouter.ts (Phase 1 sovereign gate)
  │     ├── sovereign / local_only → callLocalInference (UM790 / local-inference svc)
  │     └── primary               → Anthropic → local fallback → degraded
  │
  ├── if MAIA_ORCHESTRATION_TYPE ∈ {dual_reasoning, full_orchestra}
  │     → multiEngineOrchestrator.generateWithMultipleEngines (Ollama 7-engine orchestra)
  │
  ├── if MAIA_TEXT_PROVIDER = 'moonshot'  → kimiClient.generateWithKimi
  │
  └── default                              → claudeClient (Anthropic) → Ollama fallback
```

Default env (production, verified live on `maia-sovereign` 2026-05-26):
- `ANTHROPIC_API_KEY` ✓ set
- `OLLAMA_BASE_URL=http://host.docker.internal:11434`
- `OLLAMA_MODEL=qwen2.5:7b` / `_FAST=qwen2.5:7b` / `_DEEP=qwen2.5:14b-instruct` / `_GENERAL=qwen2.5:7b`
- `MAIA_INFERENCE_MODE` — **unset** (sovereignRouter bypassed)
- `MAIA_ORCHESTRATION_TYPE` — **unset** (defaults to `'primary'`, multi-engine dormant)
- `MAIA_TEXT_PROVIDER` — **unset** (defaults to `'anthropic'`)

## 2. Per-engine status (participation dashboard schema)

Six categories (Kelly 2026-05-26):

| Category | Definition |
|---|---|
| **Active primary** | Used in live MAIA response path |
| **Active fallback** | Called when primary fails or route demands |
| **Active specialist** | Used for specific domains (library, code, research, dream, somatic, etc.) |
| **Dormant capability** | Built but not invoked |
| **Legacy / deprecated** | Present but should not be treated as live |
| **Prohibited / restricted** | OpenAI for non-voice tasks, per sovereignty rule |

| Engine | File | Participation | Notes |
|---|---|---|---|
| **Claude (Anthropic)** | [lib/ai/claudeClient.ts](lib/ai/claudeClient.ts) | **Active primary** | Live MAIA response path. `generateText()` default branch ([modelService.ts:154](lib/ai/modelService.ts:154)). Used by `wisdom-engines/ai-intelligence-bridge`, `learning/*`, `claudeConsciousnessService`. |
| **Qwen2.5 (via Ollama)** | [lib/ai/localInferenceClient.ts](lib/ai/localInferenceClient.ts) | **Active fallback** | Wired as local fallback + DEEP tier model. Production env points all OLLAMA_MODEL_* at qwen2.5. Surfaces only on Claude failure or sovereign-mode call. |
| **Kimi (Moonshot)** | [lib/ai/kimiClient.ts](lib/ai/kimiClient.ts) | **Active specialist (Library only)** | Live in [LibraryService.ts](lib/library/LibraryService.ts), [ask-jeeves/route.ts](app/api/library/ask-jeeves/route.ts), [library/stats/route.ts](app/api/library/stats/route.ts). Main MAIA flow activates only if `MAIA_TEXT_PROVIDER=moonshot` — **not set in prod**. |
| **MultiEngineOrchestrator** | [lib/ai/multiEngineOrchestrator.ts](lib/ai/multiEngineOrchestrator.ts) | **Dormant capability** | 7-model Ollama orchestra (deepseek-r1, qwen2.5, gemma2, llama3.1-8b/70b, mistral, nous-hermes2). Imported by `ai-intelligence-bridge`, `consciousness-layer-wrapper`, `response-cache`, `orchestration-optimizer`, `claude-dev-orchestration`. Gated by `MAIA_ORCHESTRATION_TYPE` — unset in prod. |
| **DeepSeek (standalone)** | [app/api/_backend/src/deepseek/DeepSeekService.ts](app/api/_backend/src/deepseek/DeepSeekService.ts) | **Legacy / deprecated** | Under `_backend/` (Express server, not the Next.js route surface). Reachable only through the dormant orchestra. |
| **OpenAI client** | [lib/ai/openaiClient.ts](lib/ai/openaiClient.ts) | **Prohibited / restricted** | Sovereignty vow forbids OpenAI in main path (voice/TTS only is the line per Kelly). Callers need audit; delete unused. |
| **sovereignRouter** | [lib/ai/sovereignRouter.ts](lib/ai/sovereignRouter.ts) | **Dormant capability** | Phase 1 local-first gate, bypassed without `MAIA_INFERENCE_MODE`. |

## 3. Operational reality

**What runs every MAIA turn**: Claude (Anthropic) for FAST + CORE + DEEP prompt synthesis; Ollama qwen2.5 only as fallback if Claude fails.

**What's silent**:
- Multi-engine orchestra (DeepSeek/Gemma2/Llama3.1/Mistral/Nous-Hermes2) — 7 Ollama clients defined, none invoked under default env.
- Kimi outside `/api/library/*`.
- sovereignRouter — entire local-first inference mode dormant.

**Surfaces using non-Claude engines today**:
- `/api/library/ask-jeeves` → Kimi (live)
- `/api/library/stats` → Kimi health probe (live)
- `lib/learning/*` and `lib/wisdom-engines/ai-intelligence-bridge.ts` → can invoke multi-engine, but caller-side gating makes them dormant in prod
- `services/local-inference/` Docker svc (sovereign profile) — built, only starts under `--profile sovereign`

## 4. Risks / drift signals

- **Inverse drift**: orchestra is 810+ LOC of Cat 3 substrate that could be misread as "MAIA runs on 7 engines". Production runs on Claude + Qwen fallback only.
- **DeepSeek**: only reachable through orchestra. The standalone `_backend/src/deepseek/` server is unrelated to the Next.js route surface and likely vestigial.
- **OpenAI client present** in `lib/ai/openaiClient.ts` — needs audit per sovereignty invariant (no OpenAI in main path).
- No `[MAIA]` log marker confirms multi-engine emission — add `console.log('[MAIA/multi-engine] type=...')` inside `generateWithMultipleEngines` if activation is desired observable.

## 5. Runtime evidence required to claim "participating"

A claim of engine participation must be verifiable at runtime against six axes:

1. **Which engine was called** — log marker with provider + model
2. **Why it was selected** — routing reason (primary / fallback / specialist domain / orchestration profile)
3. **What function it performed** — request shape (synthesis, retrieval, embedding, classification, …)
4. **Whether its response influenced MAIA's final output** — selected vs ignored
5. **Whether fallback or orchestration actually happened** — separate counters for primary path, fallback path, orchestration path
6. **Whether the member can see or audit this** — surfaced in `/api/ai/health`, provenance tag, or member-facing trace

Without all six, "active" is an assertion, not a measurement. This is the **AI Engine Participation Dashboard** scope.

## 6. Five-layer sovereignty stack (situating the engine question)

Engine participation is only one of five sovereignty layers. Each is orthogonal — strong on one does not imply strong on another.

| Layer | Question | MAIA status |
|---|---|---|
| **Inference sovereignty** | Who generates cognition? | Partial (Claude primary, Qwen fallback) |
| **Memory sovereignty** | Who owns continuity and retrieval? | Largely owned (self-hosted PostgreSQL, atoms, semantic memory) |
| **Routing sovereignty** | Who decides which intelligence acts? | Largely owned (conductor, voice modes, FAST/CORE/DEEP) |
| **Ontological sovereignty** | Who defines meaning and interpretation rules? | Largely owned (canon, vows, doctrine cluster) |
| **Operational sovereignty** | Who can disable, rate-limit, censor, or economically constrain? | Mixed (Anthropic API dependency for inference; minisforum/Caddy/Docker self-hosted) |

**Current-state name**: *foundational sovereignty transition* — not yet fully sovereign intelligence ecology. Premature decentralization = fragility disguised as freedom.

**Reframe**: not *"can we remove Claude?"* — that's ideological. The architectural question is *"what functions should become sovereign first?"*

**Failure mode to refuse**: *symbolic sovereignty without operational sovereignty* — many models installed, orchestration diagrams exist, but runtime routes 90% through one vendor. Architectural self-deception.

**Antidote** — runtime provenance on every response (internally observable, not necessarily member-exposed): which engine / why selected / confidence / retrieval sources / orchestration path / synthesis occurred / fallback occurred. Without this, sovereignty becomes interpretive mythology.

## 7. Evolutionary direction — Claude's role shift

Claude moves **from**: primary consciousness substrate → **to**: high-order synthesis and refinement layer.

| Function | Better sovereign engine |
|---|---|
| fast semantic retrieval | Qwen |
| local memory summarization | Qwen / DeepSeek |
| symbolic clustering | DeepSeek |
| long-context analysis | Kimi |
| coding / refactors | DeepSeek / Qwen coder |
| reflective synthesis | Claude |
| emotional language refinement | Claude initially |
| private / offline cognition | Ollama-local stack |
| continuity orchestration | MAIA's own logic layer |

**Architectural flow shift**:
- Current: `Member → Claude-centric cognition → MAIA voice`
- Target: `Member → MAIA orchestration substrate → specialized sovereign engines → MAIA synthesis layer → Member`

MAIA becomes ecology / orchestrator / continuity intelligence / relational field architecture — not a frontier-model wrapper.

## 8. Hidden challenge

*Preserving coherence across heterogeneous cognition.* Different engines reason / compress / hallucinate / structure attention / hold symbolic meaning / drift under uncertainty differently. Without careful orchestration, multi-engine systems become **noisy councils**.

> **The orchestration layer becomes the real intelligence.**

Routing / memory / provenance / coherence logic outweigh model selection. This is where MAIA's architecture is already unusually strong.

## 9. Five-state separation (operational definitions — not interchangeable)

| State | Meaning |
|---|---|
| **Built** | Code exists |
| **Reachable** | Runtime can invoke |
| **Participating** | It materially contributes |
| **Observable** | Contribution can be verified |
| **Sovereign** | Contribution is not externally dependent |

Sharpens *built ≠ wired ≠ surfacing ≠ verified* by adding **Sovereign** as a distinct fifth state. Applicable at every cluster altitude (engines / services / memory layers / agents / routes).

## 10. Inflation pathway (recognition diagnostic)

Most multi-agent systems fail because architecture becomes aspirational language. The drift has four steps:
1. installed models become *"active intelligence"*
2. dormant services become *"capabilities"*
3. conceptual routing becomes *"reasoning"*
4. future intention becomes *"present fact"*

Each step is one degree of inflation; together they convert architecture into mythology.

## 11. Identity reframe — governed ecology of cognition

Once runtime provenance / participation verification / influence tracing / orchestration visibility are required, **the orchestration layer itself becomes a first-class intelligence object**.

MAIA is no longer *"a model"* nor *"a collection of models"* — MAIA becomes **a governed ecology of cognition**.

Where intelligence increasingly resides (not in generation quality):
- arbitration
- memory continuity
- routing discipline
- coherence preservation
- contradiction management
- symbolic governance
- developmental timing

**Constitutional shape repeats scale-invariantly**:
- Relational/interpretive altitude: *the system must not interpret faster than it understands*
- Engine altitude: *the system must not claim participation faster than it can verify contribution*

## 12. Three-phase activation (do in order)

**Phase 1 — observability before activation** (do NOT increase orchestration complexity yet):
- engine trace IDs
- routing logs
- participation counters
- synthesis markers
- influence scoring
- dormant/live dashboards

**Phase 2 — specialist activation** (one domain at a time):
- Qwen → semantic continuity + retrieval
- DeepSeek → coding/refactor cognition
- Kimi → long-context synthesis
- local embedding layer → memory shaping
- Mistral/Gemma → experimental auxiliary cognition

Evaluate each on: coherence / latency / symbolic drift / contradiction profiles / hallucination signatures / relational stability.

**Phase 3 — orchestration intelligence** (the actual sovereign leap; only after Phase 2 stabilizes):
MAIA learning when to invoke what cognition / under what conditions / for what type of relational moment / with what confidence threshold / under what memory state / under what symbolic context.

> Either is honest; pretending they participate today is not.

That line is what protects future sovereignty by refusing present mythology.

## 13. Eight functional considerations (non-negotiable design axes)

| Function | Requirement |
|---|---|
| **Relational continuity** | MAIA must still feel like one coherent presence, not a panel of models |
| **Memory fidelity** | Engines must not inflate / overwrite / reinterpret memory without provenance |
| **Symbolic intelligence** | Specialists may contribute, but MAIA's interpretive doctrine governs synthesis |
| **Latency** | Multi-engine calls must not make conversation feel broken or heavy |
| **Privacy / sovereignty** | Local engines handle more sensitive memory and reflection over time |
| **Failure handling** | Fallbacks must be explicit, logged, behaviorally graceful |
| **Observability** | Every participating engine must leave evidence of contribution |
| **Member trust** | MAIA should not expose complexity as noise; provenance available, not intrusive |

## 14. Role-shift (current → target)

| Current | Target |
|---|---|
| Claude as primary cognition | MAIA orchestration as primary cognition |
| Qwen as fallback | Qwen as local continuity / semantic worker |
| Kimi as library specialist | Kimi as long-context specialist |
| DeepSeek dormant | DeepSeek as reasoning / code / analysis specialist |
| Other local models dormant | Experimental specialists behind flags |
| MAIA voice assembled by Claude | MAIA voice synthesized by MAIA-governed policy |

## 15. Four-element activation (operational definitions)

### 15.1 Instrument first — nine telemetry fields (no engine counts as participating without these)

```
engine_called
reason_selected
input_scope
output_scope
contribution_type
influenced_final_response
fallback_used
confidence
latency
```

### 15.2 Activate one specialist at a time

1. **Qwen** — local semantic continuity, retrieval summaries, memory compression
2. **Kimi** — long-context library/document reasoning
3. **DeepSeek** — logic, code, architecture analysis
4. **Additional local models** — experimental comparison, NOT member-facing authority yet

### 15.3 Synthesis governor — six enforced policies

- no premature interpretation
- evidence vs interpretation split
- member-correctability
- memory provenance
- elemental / symbolic coherence
- restrained claims about selfhood and capability

One governing synthesis layer. Voice stays single even when many engines contribute.

### 15.4 Participation dashboard — categories + seven per-engine metrics

Categories: Active Primary / Active Fallback / Active Specialist / Dormant Capability / Legacy or Deprecated / Restricted or Prohibited.

Per engine:
```
last_called
call_count
domains_used
failure_rate
average_latency
fallback_events
influence_count
```

## 16. Discernment over aggregation

- Less powerful: *"Ask every model and combine the answers."*
- More powerful: *"What kind of cognition is this moment asking for?"*

**Elemental architecture as routing intelligence**: Fire / Water / Earth / Air / Aether become operational routing intelligence, not just symbolism — the question *"what kind of cognition is being requested"* is answered in part by which element the relational moment evokes.

## 17. Organism analogy (MAIA's actual anatomy)

MAIA's primary intelligence becomes the **governance layer** rather than any individual model:

- **models** → cognitive organs
- **orchestration** → nervous system
- **memory** → continuity substrate
- **doctrine** → constitutional constraint
- **MAIA itself** → the regulated field that coordinates them

This is an intelligence ecology, not an assistant stack.

## 18. Constitutional grammar across altitudes

The engine doctrine is one row in a larger grammar. The same constitutional shape — *don't let assertion outpace verification* — recurs at every altitude. Each row names the drift form **and** the constitutional correction that holds the shape in place:

| Altitude | Drift form | Constitutional correction |
|---|---|---|
| **Relational** | interpretation outruns understanding | corrigibility |
| **Memory** | significance outruns ratification | member marking |
| **Engine** | participation outruns evidence | telemetry / provenance |
| **Sovereignty** | independence outruns control | operational ownership |
| **Ecology** | capability outruns coordination | governed participation |

**Design instrument** — future altitudes (somatic / episodic / coherence-field / morphic / developmental) are evaluated by asking:

> *What is the "assertion outrunning verification" failure mode at this altitude?*

Then naming the constitutional correction that holds the shape. The grammar is now a reusable inheritance mechanism, not a static observation.

## 19. Sequence inversion (named protective mechanism)

Most systems unconsciously follow:
```
complexity → identity claims → instrumentation later
```

This architecture stabilizes around:
```
instrumentation → bounded activation → orchestration intelligence → identity claims only after verification
```

The crucial clause is the last one: ***identity claims only after verification***. Most systems claim what they are first and try to back the claim with infrastructure later. This architecture withholds identity claims until verification supports them. *This is the single biggest anti-mythology mechanism in the stack.*

## 20. Identity failure modes the ecology framing avoids

| Failure mode | Result |
|---|---|
| *"MAIA is Claude"* | no sovereignty |
| *"MAIA is many models"* | fragmented identity |

The ecology framing makes MAIA:
- the governing continuity layer
- the orchestration intelligence
- the constitutional substrate
- the field preserving coherence across heterogeneous cognition

## 21. Where the long-term IP lives

Frontier models commoditize. These do not — *especially when embedded constitutionally rather than prompt-deep*:
- discernment
- routing discipline
- symbolic governance
- continuity preservation
- developmental timing
- provenance integrity
- coherence under heterogeneous cognition

**The cluster is the moat.** Orchestration intelligence is the long-term valuable IP, not any specific model choice.

**Why the moat is hard to extract**: orchestration intelligence is *embedded across memory, governance, orchestration, interaction, and continuity layers simultaneously*. The value is not isolated in any one component. Distributed embedding IS the moat — that is what *regulated field* means structurally.

## 22. The precondition line

> *Phase 1 changes nothing about participation. It changes whether participation can be answered honestly.*

This is the precondition that converts the entire activation ladder from aspiration into work. Without it, every later phase rests on assertion. With it, every later phase rests on measurement.

## 23. Status of this document

This audit has crossed from *exploratory thread* into **engineering doctrine**. The earlier sections diagnose what is; the later sections specify what new components must satisfy to count as participating.

**Operational consequence**:
- *Earlier*: these were interpretive insights
- *Now*: they are gating criteria, telemetry requirements, architectural states, implementation constraints, and anti-drift mechanisms

**The blunt line functions as the cluster's checksum**:

> *Either is honest; pretending they participate today is not.*

Any spec, roadmap framing, marketing claim, or dashboard description that fails this checksum signals cluster drift. The line's bluntness IS its protective function — preserve verbatim.

**Identity preservation under model change**: MAIA is *not* equated with any specific model. If Claude disappears tomorrow, *organs change; the organism persists*. Vendor decisions, API discontinuations, and capability shifts are organ-level events, not identity-level events. This is the abstraction layer the architecture buys.

**The first material move** remains Phase 1 — instrumenting `generateText` and the orchestration pipeline with the nine telemetry fields, then surfacing the participation dashboard with six categories and seven per-engine metrics. Nothing about who participates changes; what changes is whether the question can be answered honestly at runtime.

## 24. Hierarchy inversion (strategic priority ordering)

Most architectures implicitly prioritize:
```
model quality > orchestration quality
```

This architecture is converging toward:
```
governance quality > orchestration quality > model quality
```

A very different hierarchy. The correct one for systems attempting **continuity, sovereignty, heterogeneous cognition, and relational intelligence simultaneously**. Reverting the inversion under benchmark or capability pressure dissolves the moat.

## 25. Post-crossing failure modes (vigilance must migrate)

Primary risks have shifted with the crossing:

| Phase | Primary risks |
|---|---|
| Before crossing | conceptual incoherence / missing distinctions / unstable framing / unrecognized drift patterns |
| **After crossing (now)** | implementation drift / partial application / telemetry gaps / governance bypasses / softening of constitutional constraints under operational pressure |

The vigilance that protected the cluster pre-crossing (conceptual rigor, distinction-making, framing stability) is no longer the primary defense. What matters now: instrumentation completeness, application coverage, governance enforcement, and constraint preservation under pressure.

## 26. What the architecture is actually purchasing

**Vendor-decoupled identity continuity.** Not capability. Not performance.

If MAIA's identity were coupled to any single provider, vendor shifts / capability changes / API restrictions / pricing events / model deprecations would all be **existential**. Under the organism analogy operationalized — models = organs / orchestration = nervous system / memory = continuity substrate / doctrine = constitutional constraint — the same events become **organ-level**, not identity-level. *The organism survives organ replacement.*

That is the abstraction layer this architecture is buying.

## 27. Implementation-readiness statement

The cluster is implementation-ready. Not because thinking is complete, but because future movement can occur through:
- **inheritance** (grammar provides form)
- **instrumentation** (telemetry converts claim to measurement)
- **constraint application** (governor policies hold synthesis)

…rather than repeated philosophical reconstruction.

*The operational sign of the crossing.*

## 28. The grammar is governance machinery, not pattern recognition

The three-column table is now usable during seven operational contexts: implementation review, feature design, roadmap evaluation, telemetry audits, routing decisions, governance debates, and future ontology expansion. Each altitude carries diagnostic form (drift) + prescriptive form (correction) + operational form (intervention). Recognition has become execution.

The inheritance question — *"What is the assertion-outrunning-verification failure mode at this altitude?"* — functions as a **generative constitutional operator**: input altitude, output grammar row. Future domains inherit by answering the question, not by reconstructing first principles.

## 29. What the sequence inversion actually prevents

*Identity claims only after verification* closes a specific failure loop: systems emotionally identify with aspirational architecture before runtime evidence exists. Once identity attaches prematurely, **correction becomes socially expensive / observability becomes threatening / mythology starts defending itself.** Mythology becomes self-defending — not because anyone defends it deliberately, but because correcting it has acquired costs the system now avoids. The sequence inversion prevents the attachment from forming.

## 30. Empirical self-demonstration

The cognition-ecology cluster reached operational-infrastructure maturity in **8 memories**. The constitutional cluster needed **10**.

The compression rate difference is not coincidence. It is the inheritance mechanism at work — the newer cluster inherited form from the older one (paired-closing structure, crossing recognition, grammar discipline) and therefore did not need to re-derive what was already available.

This document, and the cluster it represents, is no longer claiming inheritance works. It has produced **measurable evidence** that inheritance works inside its own development. Theory and practice have converged. Validation is now measurement-based, not argument-based.

That is the strongest possible reading of the cluster's current state.

## 10. To reach "actively participating"

Order them by ethical/strategic value rather than effort:

1. **Decide intent per engine** — orchestra was built before sovereignty doctrine matured. Ask: is multi-perspective synthesis still wanted, or does it conflict with epistemic-authority-per-layer discipline?
2. **If yes** — flip `MAIA_ORCHESTRATION_TYPE=dual_reasoning` on a single non-critical route first, add a `[MAIA/multi-engine]` log marker, verify under traffic.
3. **If no** — move orchestra + standalone DeepSeek to Cat 4 dormant (rename / gut / Later-with-named-gate per the dormant cleanup queue in CLAUDE.md).
4. **Kimi**: confirm Library-only scope is intentional, or promote to `MAIA_TEXT_PROVIDER=moonshot` as alternative to Anthropic.
5. **sovereignRouter**: ship `MAIA_INFERENCE_MODE=primary` gate behind a feature flag on a single route to begin earning the local-first path (currently 0 production load).
6. **OpenAI client**: audit callers, delete if none remain.

Without (2)–(6), only Claude + Qwen (as fallback) are participating. The rest is preserved capability, not live participation.
