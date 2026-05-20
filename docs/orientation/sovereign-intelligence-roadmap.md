# Sovereign Intelligence Roadmap

> **Status:** Working tracker. Companion to [`sovereign-intelligence-orientation.md`](./sovereign-intelligence-orientation.md).
>
> Updates as Phase 1 decisions resolve and lived contact accumulates. Operational, not doctrinal.
>
> **Revision note:** initial version assumed (a) Daily Anchor was Phase 1 first cognitive surface, and (b) local inference needed to be built. Investigation found (a) Daily Anchor has no AI generation path — it serves deterministic prompts, and (b) Phase 1 infrastructure already exists in `lib/ai/sovereignRouter.ts` + `services/local-inference/` — pending activation, not pending construction.

---

## Current Routing Reality

The codebase shows:

- **Claude is primary across all major cognitive surfaces** — oracle conversation, voice reasoning, consciousness dialogues, elemental router. Claude is the cognitive substrate.
- **A sovereign inference router exists** ([`lib/ai/sovereignRouter.ts`](../../lib/ai/sovereignRouter.ts)) with three modes:
  - `sovereign` / `local_only`: local-first, degraded on failure, **no Claude fallback**
  - `primary`: Claude first, local fallback, degraded if both fail
  - unset: original Claude-direct path (current default)
- **A local inference service is built** ([`services/local-inference/`](../../services/local-inference/)) — FastAPI adapter wrapping Ollama. Defined in `docker-compose.production.yml` under `profiles: ["sovereign"]`. Default Ollama model: `deepseek-r1:8b`.
- **A circuit breaker and degraded copy** are wired. Token usage logging is wired.
- **Activation requires three things**: `MAIA_INFERENCE_MODE` env var set, `--profile sovereign` activated in docker-compose, and Ollama running with the desired model on a reachable host.
- **Critical surface gap**: only calls that route through `modelService.generateText()` are intercepted by the sovereign router. Voice reasoning (`getClaudeService()`), consciousness dialogues (direct Anthropic SDK), and the elemental router **bypass it**. Those surfaces need refactoring before they can be sovereign-routed.

This is more Phase 1 infrastructure than the orientation paper assumed — but the coverage is partial.

---

## Phase 1 Decisions

### Resolved

- **First cognitive surface**: Short reflection / mirror response. Bounded, low-risk, clearly generative, good for acceptable/dangerous loss classification.
- **Daily Anchor**: Remains a symbolic/continuity surface. **Not** a Phase 1 local-inference test surface — it has no AI generation path.
- **Escalation mode**: Manual, explicit, visible. No algorithmic auto-escalation.
- **Hardware platform**: Mac Studio Ultra. Reproducibility + practitioner-replicability over throughput.
- **Evaluation criteria**: Interpretive Dialogue elevation conditions — repetition, phenomenological convergence, relational outcome accumulation, continuity change over time, external-life visibility. Weekly batch review.

### Open

- **Mac Studio config**: 192GB vs 512GB. Depends on whether Phase 1 hardware is replication template (favor 192GB) or development node (favor 512GB).
- **First model on Ollama**: Default config has `deepseek-r1:8b` (8B). Phase 1 likely wants 70B-class (Llama 3.3 70B, Qwen 2.5 72B, or DeepSeek V3). Choice can wait until hardware arrives.
- **Which surface gets refactored first** to route through `modelService` so it becomes sovereign-routable. Mirror/short-reflection is the first candidate; voice and consciousness dialogues need scoping later.

---

## Phase 1 Implementation Goal

> Invert routing for a selected bounded surface: local primary → Claude only by explicit/manual escalation.

Concrete steps:

1. Stand up Ollama on a host with a chosen model (currently `deepseek-r1:8b` by default; replace with 70B-class when hardware allows).
2. Activate `maia-local-inference` via `--profile sovereign` in docker-compose.
3. Identify a bounded mirror/reflection surface that already routes through `modelService.generateText()` — or refactor one to.
4. Set `MAIA_INFERENCE_MODE=sovereign` for that surface. (Per-route gating may be needed if global flip is too broad.)
5. Run lived contact. Token usage and provider are already logged per-response by `sovereignRouter.logUsageLine`.
6. Apply acceptable/dangerous loss classifier in weekly batch review.

---

## Per-Surface Threshold Map

Surfaces cross the local-coherence threshold at different times. The transition is not global.

Expected ordering, earliest to latest:

1. **Short reflection / mirror response** — Phase 1 entry (bounded, generative, easy to classify)
2. **Journal reflection** — early (bounded, continuity-relevant, slightly more emotionally loaded)
3. **Portal chat single-turn** — middle (broader, messier early signals)
4. **Symbolic reflection** — middle-late
5. **Practitioner summaries** — late
6. **Voice reasoning** — late (currently bypasses `sovereignRouter`, needs refactor first)
7. **Deep synthesis / long-context reasoning** — last

Daily Anchor is not in this list — it has no AI generation path. It remains a symbolic/continuity surface.

---

## Capability Loss Classifier

Applied per-response, logged, reviewed in batches. **Not** real-time routing.

If acceptable: hold the gap. If dangerous: fix at architectural layer, not by routing to frontier.

| Acceptable losses | Dangerous losses |
|---|---|
| less eloquence | false authority |
| slower synthesis | coercive attachment |
| simpler abstraction | continuity collapse |
| more bounded responses | interpretive possession |
| reduced generative fluency | manipulative intimacy |
|  | ontological domination |

The distinction separates *capability deviation* from *doctrinal deviation*. These must not be confused.

---

## Sequencing Logic

1. Working paper held in `docs/orientation/` — not canon.
2. Phase 1 activation: env var + profile + Ollama on a real model + bounded surface selection.
3. First local node runs the chosen first cognitive surface (short mirror response).
4. Weekly classifications accumulate.
5. Doctrine either survives or bends under mechanism.
6. Working paper commits to canon-grade location only when contact validates the frame.

---

## What This Tracker Is — And Is Not

This tracker is:
- a working coordination document for Phase 1
- a status snapshot of resolved vs open decisions
- a pointer to the orientation paper for framing

This tracker is not:
- canon
- a decision-making authority (decisions live with the team, not the tracker)
- a substitute for lived contact

---

## Open Governance Questions

Federation governance questions are intentionally deferred until Phase 2 operational contact. See [`sovereign-intelligence-orientation.md`](./sovereign-intelligence-orientation.md) § Federation & Governance.

### Named open thread: cross-member learning

How (or whether) MAIA improves through participation across many member relationships remains explicitly unresolved.

**Settled invariants relevant here:**

- Federation distributes compute, never identity or continuity (compute-vs-continuity discriminator).
- No cognitive surface bypasses `sovereignRouter` without documented exemption (engineering invariant).

**Unsettled:**

- No aggregation-layer assumptions are settled. Gradients, embeddings, behavioral statistics, latent representations, and optimization traces all derive from intimate continuity even when anonymized — so the conventional federated-learning paradigm may conflict with continuity sovereignty.
- The distinction worth holding: *learning at the doctrine / grammar / practitioner layer* (compatible) vs *learning at the continuity-aggregation layer* (canon-violating).

**Three paths roughly compatible with the canon** (named for legibility, not commitment):

1. **Doctrinal propagation** — shared prompts, orchestration, safeguards, routing principles. Member continuity stays local.
2. **Symbolic grammar evolution** — shared archetypal maps, Spiralogic refinements, developmental observations, interpretive grammar. Individual symbolic interiors stay local.
3. **Practitioner-mediated learning** — humans observe across cases through situated discernment; learning propagates through community, not optimization loops. Closest to apprenticeship / healing lineage / contemplative transmission.

**Why this stays deferred:** Phase 1 operational contact must precede architectural commitment here. Lived contact may reveal that local continuity + shared doctrine + practitioner observation already produces most of the meaningful developmental intelligence — in which case aggressive collective optimization would be unnecessary and possibly corrosive. That possibility must remain genuinely open.

---

## Adjacent Documents

These pre-existing documents cover adjacent territory and likely warrant cross-reference or reconciliation in a later pass:

- [`docs/sovereign-consciousness-roadmap.md`](../sovereign-consciousness-roadmap.md)
- [`docs/sovereign-deployment-architecture.md`](../sovereign-deployment-architecture.md)
- [`docs/phase1-sovereign-inference.md`](../phase1-sovereign-inference.md) — particularly relevant; may already document the local-inference service activation procedure.

Reconciliation deferred — this tracker stands alone until Phase 1 contact begins.
