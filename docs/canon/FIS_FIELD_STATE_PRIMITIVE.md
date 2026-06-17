---
level: constitution
---

# FIS Field State Primitive

**Status:** Working doctrine / interface target — no runtime authority yet.
**Sibling canon:** [Pattern Primitive](./PATTERN_PRIMITIVE.md), [Longitudinal Memory Category Gradient](./LONGITUDINAL_MEMORY_CATEGORY_GRADIENT.md), [Intelligence Field Access Map](./INTELLIGENCE_FIELD_ACCESS_MAP.md), [Right to Remain Unpossessed](./RIGHT_TO_REMAIN_UNPOSSESSED.md), [MAIA Canon v1.1](./MAIA_CANON_v1.1.md)
**Created:** 2026-05-20

---

## Purpose

This document defines exactly one architectural primitive: the shape of the **field state** that every agent in the FIS architecture reads before deciding whether to manifest.

It governs no implementation. It names the shared sensing substrate that all subsequent FIS layers — per-agent resonance, threshold gating, intervention competition, Council activation, Council deliberation — depend on.

This cut is earned now because the primitive can be defined without deciding:

- which agent should speak
- what pattern should surface
- how the Governor should gate manifestation

It only names what must be sensed before any of those decisions become possible.

---

## Core Invariant

> **FieldState is sensed before agents speak. Agents may read it; agents do not define it.**

This is the discriminator. Agents are consumers of field state, not producers of it. The sensing layer is upstream of the manifestation layer.

Without this separation, agents will tend to construct field state to justify their own activation — the same continuation-pressure failure pattern named at the agent layer, displaced one step earlier into the sensing layer. The invariant protects against that displacement.

---

## The Six Dimensions

Per the FIS paper, field state has six dimensions. This table maps each dimension to its current possible sources, its surfacing status, and the gap that prevents it from being a load-bearing input today.

| Dimension | Meaning | Current possible sources | Surfaced today? | Gap |
|-----------|---------|--------------------------|-----------------|-----|
| **emotional weather** | affective tone / charge | conversation text, voice affect, relational signals | partial | no unified object |
| **semantic landscape** | themes, topics, concepts | `MemberLiveContext`, vault, session arcs | partial | fragmented |
| **connection dynamics** | rupture, trust, distance, repair | trust observations, relationship/anamnesis tables | partial/unclear | not consistently loaded |
| **sacred markers** | awe, grief, threshold, initiation, symbolic charge | vault, journal/capture, user language | partial | no typed marker layer |
| **somatic intelligence** | body, pace, breath, sensation, nervous system cues | voice/session metadata, user language | weak | mostly inferred |
| **temporal dynamics** | recurrence, ripeness, timing, unfinished arcs | anchors, journeys, corpus, spiral state | weak/partial | snapshot-heavy |

Two structural observations:

1. No dimension is fully absent. Every dimension has *some* current source. The work is composition and typed consolidation, not invention.
2. No dimension is fully surfaced. The current pattern is fragmented partial surfacing through different loaders, not a coherent unified object every agent can read.

---

## Interface target

The primitive that downstream layers will eventually consume:

```ts
type FieldDimension = {
  // shape defined in later cut — placeholder for the typed structure
  // each dimension carries: signal strength, contributing sources,
  // epistemic posture markers, last-update timestamp
};

type MemberAuthoredSignal = {
  // member-authored relevance markers
  // distinct from system-sensed dimensions
};

type FieldState = {
  emotionalWeather: FieldDimension;
  semanticLandscape: FieldDimension;
  connectionDynamics: FieldDimension;
  sacredMarkers: FieldDimension;
  somaticIntelligence: FieldDimension;
  temporalDynamics: FieldDimension;
  memberAuthoredSignals: MemberAuthoredSignal[];
};
```

The `memberAuthoredSignals` array is a separate input from the six sensed dimensions — member-authored signals about what kind of moment they're in (e.g., *"this is a shadow moment"* flagged in their anchor) influence resonance computation independently of what the system detects.

The `FieldDimension` and `MemberAuthoredSignal` shapes are deliberately under-specified here. They will be defined in a later cut, after sourcing audit and category-gradient classification are complete.

---

## What this document does NOT authorize

This document does not authorize:

- Implementation of the `FieldState` interface
- Wiring any source into a unified field-state object
- Any agent code changes to consume field state
- Any sensing-layer code changes
- Resonance functions, threshold gating, or any FIS-governance mechanisms

It defines the interface target so future cuts have something to build toward — not a build authorization.

---

## Dependencies before implementation

Before the `FieldState` primitive can become a runtime object:

1. Each dimension's actual sources must be traced field-by-field. The table above gives partial sourcing; the audit needs grep-level confirmation.
2. The `FieldDimension` shape needs definition — what carries from each source into the unified object, with what epistemic markers.
3. The `MemberAuthoredSignal` shape needs definition — what counts as a member-authored field-relevance signal, distinct from system-sensed dimensions.
4. Composition logic needs design — how multiple sources for the same dimension reconcile (most recent wins? weighted? all carried?).

Each is its own future cut.

---

## Falsifiability gate

If the six FIS dimensions cannot be reliably sourced from existing system surfaces — if grep-level tracing reveals that one or more dimensions has no actual computational source today — then either:

- the dimension needs a sensing implementation before the primitive is wired (significant work), or
- the dimension needs to be removed or merged in the primitive (and the FIS paper's six-dimension framing revised accordingly)

The gate sits before the interface is wired into runtime. A `FieldState` object with dimensions that have no real sources would be sophisticated falsification — exactly what the canon stack is built to prevent.
