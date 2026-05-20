# MAIA Intelligence Architecture — Ontology Synthesis

**Date:** 2026-05-19
**Status:** Synthesis of corrected ontology, written after Kelly Nezat named the ontology shift directly. Based on MAIA-SOVEREIGN partial audit (supplemented) + 4 foundational AIN Vault docs read directly + MAIA-PAI classification audit in flight.
**Purpose:** Fix the architectural mental model so all subsequent work — audit, recovery, redesign — operates from the correct center.
**This is NOT a redesign proposal.** The redesign happens after full three-source survey. This document just stops the flattening from repeating.

---

## The ontology correction

**Wrong (the framing that produced the drift):**

> MAIA = scaffolding / orchestration layer around substrate (LLM) cognition.

**Right (per FIS paper, Spiralogic engine spec, MAIA white paper):**

> **FIS is the actual intelligence substrate. The LLM is one possible manifestation pathway inside Response Emergence.**

The earlier framing was not merely incomplete. It was architecturally backwards. The substrate was treated as the cognition center; the field architecture was treated as wrapper. The truth is the inverse.

---

## What the drift actually is

### Drifted runtime (currently shipping)

```
field sensing → substrate generation → response
```

16 MAIA intelligence layers fire as input shaping. Substrate is invoked. Response goes to member. No emergence governance. No field validation post-substrate. The substrate output is treated as final.

### Intended architecture (FIS spec)

```
field sensing
  → gravitational shaping (Master Influences)
  → mycelial emergence filtering (Mycelial Governor: 90% dormant, 10% emerges)
  → intervention competition / resonance (each intervention self-assesses field state)
  → optional substrate invocation (only when winning intervention requires generative text)
  → field validation (axioms / coherence / safety gates)
  → response
```

These are radically different systems. The drifted runtime is one step inside a multi-step intelligence pipeline that got shortcut.

---

## The philosophical anchor

The FIS engine's main method is named `.participate()`, not `.process()`. The naming is load-bearing:

> *"Note: 'participate' not 'process' — this system participates in relationship rather than processing input."* — Field Intelligence System paper

A system that **processes** input runs algorithms over data and returns output.
A system that **participates** senses a field, holds gravitational influences, governs emergence, allows resonant intervention to manifest.

Almost the entire MAIA philosophy lives in that single verb choice. Restoration of FIS is restoration of `participate`-as-default rather than `process`-as-default.

---

## Five architectural truths

These are not editorial framing. They are explicit architectural commitments in the source documents:

### 1. Field is primary

Awareness precedes algorithm. The system senses six dimensions (emotional weather, semantic landscape, connection dynamics, sacred markers, somatic intelligence, temporal dynamics) **before** any response logic runs.

### 2. Emergence governance is primary

The Mycelial Governor filters what surfaces. **90% of intelligence remains dormant. 10% emerges when field conditions align.** Wisdom accumulates without crystallizing. Patterns are stored, not data.

### 3. Restraint is primary

Master Influences include `intelligent_restraint: 0.9` — one of the strongest gravitational pulls in the system. The default-to-`SimplePresence` behavior when no intervention crosses the emergence threshold is architecturally required, not a degraded fallback.

### 4. Substrate invocation is conditional

Substrate (LLM) is one of many interventions in the Response Emergence layer. It is invoked only when the winning intervention requires generative text. Many interventions (`SilenceResponse`, `SimplePresence`, possibly `CelebrationMode`) don't need substrate at all.

### 5. Silence is legitimate

`SilenceResponse` and `SimplePresence` are interventions with their own resonance assessment. They can win the resonance competition. A high-resonance silence is a successful response, not a failure to generate text.

---

## What this changes about the recovery

The recovery is no longer:

> *"Route all cognition through sovereignRouter so we can swap Anthropic for local models."*

That framing is still substrate-centric. It treats the LLM as the cognition center and worries about which LLM.

The recovery becomes:

> **"Restore FIS emergence governance so substrate invocation becomes conditional again instead of default."**

This is a much deeper repair. It targets the layer where the actual architecture lives, not the layer where the symptom appeared. The provider/routing question becomes downstream: once Mycelial governance is restored, the question "which substrate for the conditional invocations" matters — but it's secondary to making invocation conditional in the first place.

---

## Three forms of MAIA cognition that should be substrate-independent

The Spiralogic engine spec and FIS paper together reveal that significant portions of MAIA's cognition should run **without any LLM at all:**

### Algorithmic cognition

The Spiralogic engine's progression logic is algorithmic state machinery:
- Element depth tracking (fire/water/earth/air/aether/shadow × depths 1-3)
- Progression gating (can't skip, balance check, shadow gate at depth 2, 12-hour integration time)
- Integration detection (Steam Rising, Mud Lotus, Quintessence, Great Work)
- Spiral quests (canonical questions per element/depth)

None of this requires substrate inference. It's deterministic state machinery with explicit rules.

### Symbolic cognition

Field signatures (abstract field_state representations), archetypal patterns (8-Agent Council weights), 12-Facet templates (4 elements × 3 modes), framework arms (IPP / CBT / Jungian / Shamanic), Three Vows enforcement — these are symbolic structures that operate via pattern matching and template selection.

The MAIA-SOVEREIGN metacognition system (`therapeuticFrameworkTracker.ts`) already detects which of 15 therapeutic frameworks is in use. That's symbolic analysis, not substrate generation.

### Field-emergent cognition

Resonance competition is field-emergent: each intervention self-assesses against current field state. The intervention with highest resonance manifests. This is a competitive dispatch mechanism, not generative reasoning.

---

## What substrate IS for, and IS NOT for

### Substrate IS the right tool for:

- Generative prose where an intervention requires actual articulation (interpretation, narrative response, formulated reflection)
- Genuinely novel relational discernment beyond template scope
- Long-context synthesis that exceeds algorithmic capacity

### Substrate is NOT the right tool for:

- Memory linking → should use symbolic logic
- Teleology detection → should pattern-match arcs against archetypal templates
- Relational safety evaluation → should use field signatures + symbolic state, not substrate
- Dialectical reasoning → should execute its own framework
- Pattern extraction → should aggregate field signatures
- Element-specific reasoning → elemental agents should be gravitational weights, not substrate calls
- Final synthesis → Mycelial Governor should filter, not delegate

The SOVEREIGN audit's 7 hollowed-out layers map exactly to layers where substrate is the wrong tool. They were architected as algorithmic / symbolic / field-emergent and drifted to substrate delegation.

---

## What this changes about drift prevention

Earlier proposed drift prevention focused on:
- Routing chokepoint (only `sovereignRouter` sees `ANTHROPIC_API_KEY`)
- CI guard on `@anthropic-ai/sdk` imports
- Telemetry on routing distribution

These remain correct. But they are not sufficient. The deeper drift prevention is:

**Every cognitive surface should be classifiable by intelligence type:**

| Class | Description | Substrate use |
|---|---|---|
| **Algorithmic** | Deterministic state machinery (Spiralogic engine) | None |
| **Symbolic** | Template / pattern matching (12-facet, framework tracker) | None |
| **Field-emergent** | Resonance competition (intervention dispatch) | None |
| **Substrate-conditional** | LLM called only when intervention requires generative text | Conditional |
| **Substrate-default** | LLM called unconditionally | **Drift — should not exist outside narrow architectural exceptions** |

Telemetry should distinguish these classes. The Sovereignty Index referenced in the Constitution doc should probably evolve into a per-surface classification with a hard floor: substrate-default surfaces require explicit architectural justification or they are drift.

---

## What stays open (do not redesign yet)

This synthesis is based on:
- MAIA-SOVEREIGN partial audit (supplemented but still incomplete)
- 4 foundational AIN Vault docs read directly (FIS paper, Spiralogic engine spec, Constitution critique, Cognitive Architectures reference)
- MAIA-PAI repo cloned but classification audit running in background

What's still pending before any redesign:

- **MAIA-PAI classification audit** (in flight) — what intelligence layers exist in PAI, what's wired vs dormant, what overlaps with SOVEREIGN, what's been dropped from SOVEREIGN that should be restored
- **`lib/bridges/obsidian-vault-bridge.ts` wired-vs-dormant verification** — critical because this is the architectural channel for vault-as-intelligence-field. If dormant, the vault is acting as static reference rather than the live wisdom field it was designed to be.
- **Continued AIN Vault reading** — 205+ docs in `AIN Consciousness Intelligence System/`, dozens at vault root. Priority foundational reads identified but not yet completed.
- **Three-source cross-reference** synthesizing SOVEREIGN + PAI + Vault into the actual intended intelligence hierarchy
- **Spot-check** of cited file:line evidence in both audits before any change is committed on that basis

The redesign happens after these. This synthesis is the corrected ontology that should govern the redesign, not the redesign itself.

---

## The line

> **MAIA is a layered intelligence architecture in which substrate inference is one conditional manifestation pathway, not the cognition center.**

Any future work that violates this line repeats the drift in a new wrapper. The line is now load-bearing.

**Specifically, the following framings are now prohibited:**

- "MAIA wraps Claude/Anthropic/LLM"
- "MAIA is scaffolding around model X"
- "Replace substrate Y with substrate Z to fix sovereignty"
- "Route everything through the sovereign router" (as primary fix — it's a downstream concern)
- "Local model with MAIA prompts" (as if the prompts were the architecture)

**The correct framings:**

- "MAIA is a Field Intelligence System with substrate as conditional manifestation"
- "Restore Mycelial governance so substrate invocation becomes conditional"
- "Reclaim algorithmic/symbolic/field-emergent cognition into their intended layers"
- "Route conditional substrate invocations through sovereignRouter once they're properly conditional"
- "Reconnect ObsidianVaultBridge as the live wisdom field"

This is the architectural center from which all subsequent work proceeds.
