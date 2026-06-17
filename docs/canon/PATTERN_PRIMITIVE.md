---
level: jurisprudence
---

# Pattern Primitive

**Status:** Working doctrine — no implementation authority.
**Sibling canon:** [Longitudinal Memory Category Gradient](./LONGITUDINAL_MEMORY_CATEGORY_GRADIENT.md), [Intelligence Field Access Map](./INTELLIGENCE_FIELD_ACCESS_MAP.md), [Right to Remain Unpossessed](./RIGHT_TO_REMAIN_UNPOSSESSED.md), [MAIA Canon v1.1](./MAIA_CANON_v1.1.md)
**Created:** 2026-05-20

---

## Purpose

This document defines exactly one architectural distinction: what counts as a *pattern* in this system, versus what is data, an identity fact, or an interpretation.

It governs no implementation. It defines the conceptual primitive that the Mycelial Governor and all downstream pattern-based architecture must respect when those layers are eventually built.

The distinction is articulated now because every later step depends on not confusing *pattern* with *identity fact*. Getting it wrong at the primitive layer would propagate possession-shape architecture upward into the Mycelial Governor, the Council, and any longitudinal synthesis.

---

## Core Invariant

> **A pattern is not a fact about a member. A pattern is a relational structure that tends to become active under certain field conditions.**

This is the discriminator. Patterns describe what tends to be alive in certain kinds of moments. Patterns do not describe what is true about certain kinds of people.

---

## Pattern shape

Healthy pattern shape:

```
when this kind of member-authored context
meets this kind of field state
this kind of resonance tendency may become relevant
```

Unhealthy pattern shape:

```
this member is X
```

The first preserves conditionality, participatoriness, and corrigibility. The second freezes interpretation into identity authority. The second is what [Right to Remain Unpossessed](./RIGHT_TO_REMAIN_UNPOSSESSED.md) refuses.

---

## Data vs Pattern

| Data                   | Pattern                                          |
|------------------------|--------------------------------------------------|
| a row in Postgres      | a relational tendency                            |
| "member said X"        | "X tends to recur when Y field conditions arise" |
| stored fact            | conditional association                          |
| can be retrieved       | must be threshold-gated                          |
| can support continuity | must not become identity claim                   |

Data is retrieved by key. Patterns are surfaced by resonance against current conditions. The retrieval mechanism differs because the epistemic status differs.

---

## Pattern source hierarchy

| Source           | Canon status              |
|------------------|---------------------------|
| author-curated   | safest first              |
| member-confirmed | legitimate with consent   |
| system-inferred  | wait for corpus evidence  |
| observation-only | do not surface            |

The hierarchy maps directly onto the [Longitudinal Memory Category Gradient](./LONGITUDINAL_MEMORY_CATEGORY_GRADIENT.md). Author-curated and member-confirmed correspond to *form* and *form-with-consent* categories. System-inferred remains *non-form by default* until corpus evidence demonstrates inferences are reliable. Observation-only is the manifestation corpus pattern — accumulates outward, does not surface inward.

---

## Implementation constraint

When patterns eventually become runtime-accessible, agents must not query pattern storage directly. Agents query the Mycelial Governor:

```
given this field state, is any pattern resonant enough to surface?
```

The Governor decides which patterns (if any) pass threshold and surface. Surfaced patterns inform agent resonance but do not determine it.

This separation is structurally load-bearing. Without it, agents will use pattern storage to justify speaking — patterns become reasons for manifestation rather than conditions for it. The drift pattern is identical to the agent-layer continuation pressure already named: a layer that always produces because it can.

---

## What this document does NOT authorize

This document does not authorize:

- Pattern storage implementation
- Threshold-gated retrieval
- System-inferred pattern generation
- Agent integration with the Mycelial Governor
- Council integration
- Any code change

It only defines the conceptual primitive that downstream implementation must respect.

---

## Dependencies before implementation

The Mycelial Governor cannot be built until:

- Continuity composition exists (step 2 of the eight-layer FIS path)
- Epistemic posture markers exist (step 3)
- Field resonance has a runtime primitive (step 4)
- The manifestation corpus has produced enough reviewed examples to inform what system-inferred patterns might look like

The pattern primitive is articulable now because every later step depends on the data/pattern distinction being clean. The implementation waits.

---

## Falsifiability gate

If lived contact reveals that the *relational tendency* framing cannot reliably distinguish patterns from identity facts in actual member contexts — if reviewers cannot consistently classify which is which — then the primitive itself needs revision before any pattern-based architecture is built on it.

The gate sits before construction, not after.
