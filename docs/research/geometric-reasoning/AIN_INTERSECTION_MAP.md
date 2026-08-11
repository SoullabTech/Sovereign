# AIN Intersection Map — Geometric Reasoning Analogues

**Trunk SHA audited:** `f52e8e1c6` (`clean-main-no-secrets`), clean read-only worktree, 0 dirty paths.
**Method:** read-only static audit. Every claimed analogue carries a liveness class **and** a mechanism class.

> **Vocabulary rule (binding).** The words *field*, *coherence*, *geometry*, *resonance*, *quantum*, *lattice*, *morphic* do **not** count as architectural correspondence. Only mechanism counts. AIN contains many richly named modules; naming is not evidence.

## Classification keys

**Liveness:** `LIVE / CALLED` · `LIVE / SUPPORTING` · `DORMANT` · `EXPERIMENTAL` · `METAPHORICAL ONLY` · `NO ANALOGUE`

**Mechanism:** `stored representation` · `computed state` · `embedding geometry` · `recurrent/dynamical state` · `learned representation` · `model-weight geometry`

---

## The headline result

**AIN has NO ANALOGUE for `learned representation` or `model-weight geometry`.**

Direct evidence: a repo-wide search for `backprop | gradient | loss.backward | optimizer | train_step | nn.Module | weights.` across all of `lib/**` returns **zero training code**. Every hit is a CSS gradient — `linear-gradient`, `baseGradient`, `radial-gradient` in palette and holoflower styling files.

AIN does not train, fine-tune, or modify any model weights. It does not own a model. It composes prompts for, and consumes inference from, externally-trained models (Claude via API; `nomic-embed-text` and Ollama-served models locally). There is no substrate whose internal geometry could be cultivated.

**This is a successful audit result, not a gap.** It is also structurally consistent with AIN's sovereignty posture — the architecture is deliberately a composition-and-consent layer, not a training stack.

---

## Mechanism-by-mechanism

### 1. Representational geometry → `embedding geometry` · LIVE / SUPPORTING

**Real mechanism, correctly named, but retrieval-only.**

`lib/memory/embeddings.ts` calls local Ollama `nomic-embed-text` over HTTP for inference. Vectors are stored and searched by cosine distance — `database/migrations/20241202000001_*.sql` declares `VECTOR(1536)` columns with `ivfflat … vector_cosine_ops` indexes and `<=>` distance queries.

This is a **frozen, externally-trained embedding space used for nearest-neighbour lookup**. AIN reads geometry; it does not shape it. Nothing in the codebase adjusts the embedding manifold. The failure mode is telling: on Ollama timeout the function returns `[]` — a zero vector — and semantic search silently degrades.

Distance from the Sophontic claim: maximal. Sophontic claims to *train* internal geometry; AIN *queries* someone else's.

⚠️ Also present: `lib/memory/embeddings/SimpleEmbedder.ts` produces 384-dim vectors from `Math.sin(charCode)` and word hashing. This is **not a learned representation at all** — it is a deterministic hash with no semantic training. Anything routed through it has embedding-shaped output and no embedding semantics. Classify `EXPERIMENTAL`; do not count as representational geometry.

### 2. Recurrent relational state → `recurrent/dynamical state` · LIVE / CALLED

**The strongest genuine analogue in the system — and it is small.**

`lib/voice/conductor.ts` implements element hysteresis: a per-session buffer that refuses to switch dominant element unless a new element appears 2+ consecutive turns, with a high-intensity bypass threshold. Bridge-D seeds the buffer from `member_spiral_state` when empty.

This is real dynamical state with damping and path dependence. It is genuinely *dynamical* rather than merely stored.

But it operates over a **5-element categorical variable plus a 1–12 phase integer** — a handful of discrete symbols in application logic. It is a debouncer, not a manifold. It shares with Sophontic's proposal the abstract property "state has inertia" and nothing else.

⚠️ Liveness caveat inherited from the project anchor: the spiral-state **write** path was severed with the retirement of `app/api/oracle/conversation/route.ts`; production `member_spiral_state` has had no write since 2026-04-08. The in-session hysteresis buffer is live; its cross-session seeding is substantially not. Marked `LIVE / CALLED` for the runtime mechanism only.

### 3. Computed relational state → `computed state` · LIVE / CALLED

`lib/relational/relationalStance.ts` and `lib/relational/developmentalStateAdmission.ts` derive `relational_phase`, `autonomy_streak`, `return_count` and admit them for shaping. This is genuine computation over member-authored facts — not lookup.

It is symbolic/arithmetic state in application code. No geometry, no latent space. Correctly classified as `computed state` and nothing more.

### 4. Perturbation testing → NO ANALOGUE

**Nothing in AIN implements paired-item, minimal-edit, flip-rate testing.** No contrast sets, no counterfactual pairs, no load-bearing-fact manipulation anywhere in the test surface. This is the one Sophontic idea that is (a) genuinely useful, (b) cheap, and (c) entirely absent here. See `DECISIVE_EXPERIMENT.md`.

### 5. Continual / local learning → NO ANALOGUE

No online learning, no weight updates, no local adaptation of any model. `lib/memory/confidenceDecay.ts` and the ACT-R-style decay in `lib/cognitive-engines/actr-memory.ts` implement **scored forgetting curves over stored records** — arithmetic decay on retrieval scores, not learning. `lib/maya/ApprenticeMayaTraining.ts` is named "training" but performs no gradient computation.

### 6. Relational attractors → METAPHORICAL ONLY

The `field` / `coherence` / `resonance` / `quantum` module family is where the vocabulary rule does the most work. Caller counts against trunk:

| Module | Referencing files | Class |
|---|---|---|
| `CoherenceFieldService` | 2 | `DORMANT` — Cat 3 per project anchor, 0 live callers |
| `QuantumFieldMemory` | 5 | `METAPHORICAL ONLY` — 810 LOC, 0 persistence; anchor marks for rename/gut |
| `MorphicPatternService` | 3 | `DORMANT` — Later, gated |
| `EpisodicMemoryService` | 3 | `DORMANT` — Cat 3, built substrate, 0 live callers |
| `SemanticMemoryService` | 5 | `LIVE / SUPPORTING` — duplicated across two paths, anchor flags reconciliation |
| `LocalLLMIntegration` | 2 | `EXPERIMENTAL` |

None of these implements an attractor in any dynamical-systems sense — no state-space trajectory, no basin, no convergence criterion. "Attractor" and "field" here are descriptive vocabulary over ordinary CRUD and scoring. Per the vocabulary rule, **zero architectural correspondence.**

---

## Summary table

| Sophontic mechanism | AIN liveness | AIN mechanism class |
|---|---|---|
| Trained internal geometry | **NO ANALOGUE** | — |
| Learned representations | **NO ANALOGUE** | — |
| Model-weight geometry | **NO ANALOGUE** | — |
| Representational geometry | LIVE / SUPPORTING | `embedding geometry` (frozen, retrieval-only) |
| Perturbation testing | **NO ANALOGUE** | — |
| Continual / local learning | **NO ANALOGUE** | — |
| Recurrent relational state | LIVE / CALLED | `recurrent/dynamical state` (5 categories) |
| Computational operators | LIVE / CALLED | `computed state` (symbolic) |
| Relational attractors | METAPHORICAL ONLY | naming only |

## Reading

AIN possesses **stored representation**, **computed state**, a narrow **recurrent/dynamical state**, and **frozen embedding geometry used for retrieval**. It possesses **no learned representation and no model-weight geometry whatsoever.**

The founder-admissible hypothesis — *"AIN currently has no learned-representation analogue"* — is **confirmed by direct evidence**, not by failure to find. No search was extended until an analogue appeared.

Consequence for the original question: there is no incremental path from AIN's present architecture to "training internal geometry," because the two do not overlap at any mechanism. Such a path would be a new capability acquired wholesale, not an evolution of existing structure. That is a finding about scope and honesty, not a verdict on desirability.
