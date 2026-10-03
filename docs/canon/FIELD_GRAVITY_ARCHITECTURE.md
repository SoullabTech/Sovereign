---
level: architecture
---

# Field Gravity Architecture

**Status: Phase 0 — binding architecture canon under observation.**
**Date opened: 2026-05-18.**
**Parent doctrine:** [`MAIA_CANON_v1.1.md`](./MAIA_CANON_v1.1.md) · [`MAIA_SOVEREIGNTY_INVARIANTS.md`](./MAIA_SOVEREIGNTY_INVARIANTS.md)
**Sibling canon:** [`SESSION_REVIEW_LENS_CONSTITUTIONS.md`](./SESSION_REVIEW_LENS_CONSTITUTIONS.md) · [`AI_RELATIONAL_SAFEGUARDS.md`](./AI_RELATIONAL_SAFEGUARDS.md)
**Memory reference:** `project_field_gravity_architecture.md`

---

## Status

This canon names the architectural work of strengthening MAIA's field gravity so that Session Reviews and future interactions draw primarily from Soullab/MAIA canon, corpus, and constitutions — not from default LLM substrate priors.

**This is not a model fine-tuning task.** The underlying engine (Claude) is not being retrained. The work lives in **retrieval, routing, ontology, and attentional architecture**.

The seven goals below are binding scope. Implementation is staged. Observe-before-tightening governs sequencing: no goal is built speculatively; each is grounded in observed drift or observed need.

---

## The diagnosis (summary)

Two intelligences compete in every LLM interaction:

- **General LLM substrate** — statistical consensus, internet priors, flattening toward median cultural coherence. Coherence-via-compression.
- **Soullab/MAIA field** — intentional ontology, disciplined symbolic architecture, relational epistemology, phenomenological depth.

If the curated field is not actively foregrounded, the substrate wins by gravity. Not maliciously — structurally. The architectural answer is not isolation but **local gravity strong enough to resist substrate drift**.

The differentiator is not the model. It is the field architecture. *"Model knows about Jung"* is commodity. *"System inhabits a phenomenological-symbolic ontology consistently over time"* is architecture.

Full diagnosis: `project_field_gravity_architecture.md`.

---

## The seven goals (binding scope)

### 1. Corpus hierarchy

Establish an explicit weighting hierarchy for interpretive substrate:

> **Canon > Constitutions > Practitioner corpus > Session continuity > General substrate**

- Soullab canon, MAIA constitutions, Spiralogic documentation, practitioner writings, book corpus, and approved source material are the **primary interpretive substrate**.
- General model priors become **fallback/background**, not dominant voice.
- The hierarchy is enforceable at retrieval time, not merely documented.

**Existing infrastructure to build on:**
- `lib/knowledge/` — wisdom corpus, used by PersonalOracleAgent
- `lib/knowledgeField/` — orchestration + graph
- `project_knowledge_field_layer` (memory) — 12-domain consciousness registry, non-ambient prompt injection on domain detection

**Greenfield:**
- Weighting policy: how Canon vs. Constitutions vs. Practitioner corpus rank when multiple are relevant
- Fallback policy: when general substrate is permitted, and how it is registered as such
- Source-of-record metadata so any output can be traced to its weighted layer

### 2. Field gravity loading (pre-generation)

Before generation, load:
- relevant canon fragments
- the lens constitution governing this output (if applicable)
- session continuity state
- practitioner orientation

Outputs **inherit** MAIA's phenomenological-relational ontology from the loaded context — they do not synthesize it from latent priors.

**Existing infrastructure:**
- Bridge D: spiral state persistence (CLAUDE.md §Bridge D)
- `project_relational_context_bridge` — V1 bridge MAIA⇄Relationships
- `project_maia_memory_roadmap` — Phase 1.5 deployed; developmental_memory in plan

**Greenfield:**
- Canon-fragment retrieval keyed to the active interpretive task
- Lens-constitution loader (depends on Goal #5)
- Practitioner orientation surface

### 3. Substrate drift detection

Add diagnostics that flag, internally, when an output drifts toward the substrate's metabolic patterns. **Substrate drift indicators include:**

- generic therapy language
- flattening into consensus wisdom
- motivational / coaching clichés
- internet-Jungian shorthand
- premature synthesis
- overconfident symbolic interpretation
- productivity / startup framing leakage
- *"wise AI"* tone — fluent but field-untethered

Flag these internally as `field_drift_*` events. **This is observational telemetry, not output rewriting** in Phase 0. The goal is to surface what drift looks like in real outputs before designing corrections.

Implementation pattern: same listening-posture model used for `meeting_audio_*` (server-side allowlist, `console.log` to docker, no DB writes until volume justifies one).

**Why this is the highest-leverage first move:** it produces signal that informs all the other goals. Building corpus hierarchy weighting before observing what kinds of drift actually occur would weight against anticipated rather than real failure modes.

### 4. Staged cognition for Session Review

Refactor Session Review generation into the cadence already specified in the lens canon:

> **Observe → Reflect → Interpret → Integrate → Unresolved Tensions**

- **Interpret may not dominate Observe.** Premature interpretation is the substrate's most reliable failure mode in this territory.
- Each stage is distinct in the generation pipeline, not merely in prose framing.
- *Unresolved Tensions* is a first-class output. Not a footer.

**Existing infrastructure:**
- Lens canon §6 (Cadence of Attention) — the specification
- Session Room transcript pipeline (Phase A — off-limits to modification, *available as input*)

**Greenfield:**
- The generation pipeline itself — currently a single shared generator across all three lenses (see lens canon §10 Exhibit A)
- Per-stage prompts respecting the lens's native register

### 5. Lens inhabitation

Each lens becomes a genuine **mode of participation**, not a theme or style:

- **Core** notices and grounds (clinical observation)
- **Spiralogic** listens for symbolic movement and preserves multivalence (symbolic listening)
- **Mentor** attends to practitioner craft and developmental edge (craft attention)

The lenses are **distinct attentional postures**, not surface variations of a shared output. The lens canon ([`SESSION_REVIEW_LENS_CONSTITUTIONS.md`](./SESSION_REVIEW_LENS_CONSTITUTIONS.md)) is the binding spec.

**Existing infrastructure:**
- Lens canon (Phase 0, this session)
- UI surface for three lenses + 12 sub-tabs

**Greenfield:**
- Per-lens prompt construction inhabiting the canon's described register
- Per-sub-tab structural shapes (SOAP, Elemental map, Practitioner edge, etc.) respected at the output level

**Register discipline:** governance language ("must avoid," "forbidden") is substrate-coded. Inhabitation language ("notices," "listens for," "attends to") is field-coded. Hold the inhabitation register through implementation. Engineering reflex will try to reintroduce governance. (`feedback_softening_claim_strengthening_invitation`, `feedback_inhabited_not_positioned`.)

### 6. Source anchoring

Important claims emerge **preferentially** from:
- transcript evidence (line ranges, timestamps, direct quotes)
- canon language (named, traceable to source document)
- practitioner corpus (named author, named text)

…rather than latent model synthesis.

**Implementation surface:**
- Every non-trivial claim carries a traceable source anchor where possible
- Where no anchor is available, the claim is registered at lower confidence (see Goal #7 / lens canon §7)
- The UI may surface the anchor (hover, expand, source-reveal) — optional Phase 1+, not required Phase 0

### 7. Field fidelity evaluation

Internal heuristics for evaluating whether an output holds field-coherence:

- **Phenomenological fidelity** — does the output describe what was present, or import what was not?
- **Ambiguity preservation** — where multivalence was real, was it held?
- **Relational coherence** — does the output honor the relational frame of the session?
- **Symbolic restraint** — were symbolic claims tentative and transcript-anchored?
- **Non-collapse across perspectives** — were lenses kept distinct, or did they converge into mutual reassurance?

These are evaluation heuristics, not output filters in Phase 0. The system observes its own outputs against them and surfaces the evaluation (initially) to telemetry, eventually to practitioner review.

---

## What this canon is not

- **Not model fine-tuning.** Claude is the underlying engine. We shape through prompting + corpus + retrieval + routing, not through weights.
- **Not general AI performance optimization.** The goal is not better-sounding outputs. The goal is stronger coherence with the Soullab/MAIA field and way of knowing.
- **Not isolation from the substrate.** The model's broad training is permitted as background. The work is gravity, not exile.
- **Not a single-PR initiative.** The seven goals span multiple staged passes. Each pass earns its scope through observed need.

---

## What counts as success

> *Fluency is not fidelity.*

An output is field-coherent when:
- It could not have been produced by a well-prompted generic LLM.
- Its claims are traceable to canon, corpus, transcript, or named practitioner material.
- Its register inhabits the lens that produced it, not the substrate's default coaching/therapy/Jungian register.
- It preserves what is unresolved rather than smoothing toward consensus closure.
- A practitioner reading it recognizes the field they trained in, not a generic AI summary of it.

The diagnostic test that should be applied to any pass: *could this have been written by any well-prompted LLM?* If yes, the field was not gravitating strongly enough in that pass.

---

## Sequencing discipline

Implementation order is governed by `feedback_observe_before_tightening` and `project_field_gravity_architecture`. No goal is built speculatively.

### Phase 0 (now)
- **Goal #3 — Substrate drift detection (observational telemetry).** Highest-leverage first move. Produces signal that informs Goals #1, #2, #6, #7. Implementation pattern mirrors `meeting_audio_*` listening posture: server-side allowlist, console-log only, no DB writes.

### Phase 1 (after Phase 0 surfaces drift patterns)
- **Goal #5 — Lens inhabitation prompt rewrites.** Lens canon is the spec. Per-sub-tab prompts inhabit the canon's described register. Canary tests against the 17-min Witness session + 3–5 additional real sessions.
- **Goal #4 — Staged cognition pipeline.** Per-stage prompts for Session Review. Depends on Goal #5.

### Phase 2 (after Phase 1 outputs are stable)
- **Goal #1 — Corpus hierarchy enforcement.** Weighting policy + retrieval prioritization. Informed by Phase 0 drift signals.
- **Goal #2 — Field gravity loading.** Pre-generation context loader. Depends on Goal #1.

### Phase 3 (continuous)
- **Goal #6 — Source anchoring.** Layered into every output progressively as anchoring infrastructure matures.
- **Goal #7 — Field fidelity evaluation.** Heuristic refinement informed by accumulated drift telemetry + practitioner review.

This sequencing is provisional. Phase 0 may surface a different next-step priority. The canon expects that.

---

## Extending the field

> *We can extend beyond what we offer as needed but it must be high quality sources.*

The field can grow. The discipline for growth:

- **New canon** enters through canon authorship process (existing canon directory, written and reviewed).
- **New constitutions** for additional lenses or modes enter through the Phase 0 → review → bind cadence demonstrated by the lens canon.
- **New corpus** (book material, practitioner texts, framework documentation) must pass a source-quality threshold consistent with `project_soullab_press_editorial_canon` and `project_soullab_press_audience_register`: McGilchrist/Williams/Bollingen calibration — not internet aggregation.
- **New field-MAIAs** (Astrologer-MAIA, I-Ching-MAIA, etc., per `project_symbolic_field_containment` and `project_multi_tradition_field_architecture`) cross from substrate into inhabited mode only via Tradition Card audit.

The principle: substrate breadth is fine. Canon and inhabited-mode entry is selective.

---

## Observability

This canon is binding scope. The goals are not provisional. What *is* provisional:

- The exact sequencing across phases (drift signal may reorder).
- The specific drift indicators in Goal #3 — the initial list above is observational; new indicators will be added as they appear in practice.
- The specific source-anchor UI in Goal #6.
- The specific evaluation heuristics in Goal #7.

What is **not** provisional:
- That MAIA's interpretive substrate is canon-first, not LLM-priors-first.
- That the seven goals together constitute the field gravity architecture.
- That observe-before-tightening governs implementation sequencing.
- That the diagnostic test (*could this have been written by any well-prompted LLM?*) governs evaluation.
- That fluency is not fidelity.

---

## Cross-reference

| Goal | Sibling memory / canon |
|---|---|
| #1 Corpus hierarchy | `project_knowledge_field_layer`, `lib/knowledge/` (corpus), `project_lib_namespace_doctrine` |
| #2 Field gravity loading | `project_maia_memory_roadmap`, `project_relational_context_bridge`, Bridge D (CLAUDE.md) |
| #3 Substrate drift detection | `project_knowledge_field_evaluation` (flattening drift), `feedback_no_hype_register`, `feedback_substrate_not_surface` |
| #4 Staged cognition | Lens canon §6 (Cadence of Attention), `project_maia_ux_doctrine` principle 3 |
| #5 Lens inhabitation | Lens canon (`SESSION_REVIEW_LENS_CONSTITUTIONS.md`) |
| #6 Source anchoring | `project_changes_synthesis_epistemic_discipline`, `feedback_verify_artifact_before_scaffolding` |
| #7 Field fidelity evaluation | `project_knowledge_field_evaluation`, `feedback_softening_claim_strengthening_invitation` |

---

## Closing principle

> *The goal is not stronger AI performance in general. The goal is stronger coherence with the Soullab/MAIA field and way of knowing.*

Local gravity, not total isolation. The model cannot be made to forget its training. But the field can be made dense enough that, inside MAIA, the field is what is doing the seeing.

---

*End of canon under observation.*
