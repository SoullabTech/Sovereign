# Threshold Navigation Doctrine

**Date:** 2026-06-11
**Type:** Design doctrine — governs how every threshold surface navigates. Sits **below canon, above spec**. Operationalizes candidate Invariant 14 (`docs/specs/THRESHOLD_PRINCIPLE_CANON_PROPOSAL_2026-06-11.md`) for the domain of capacity and depth.
**Origin:** Surfaced by the exhausted-day arrival script (`docs/specs/THRESHOLD_ARRIVAL_SCRIPTS_2026-06-11.md`). The prose exposed that an "Exhausted Day" was never a distinct mode — only the floor, left unexpanded.

---

## The discovery

> **The system does not navigate by detecting states. It navigates by offering depth.**

This is the load-bearing simplification of the whole Threshold design. It is the positive architecture that follows when Invariant 14's boundary ("never decide who the person is") meets the question of *how much a surface should ask of a person.*

## The doctrine (the corollary)

> **Threshold depth is controlled by the person, never by system state classification.**

A threshold presents a floor and a path to expand it. The person determines how far to go. The system never classifies "what kind of day this is" and renders a matching experience.

## Why the tempting architecture had to go

The natural design was:

```
detect state → select threshold mode → render matching experience
```

It *sounds* caring — "meet people where they are." But its hidden first move is:

```
the system decides who you are today
```

— which crosses the line Invariant 14 draws. The exhausted-day script revealed there was nothing to detect: **the floor, left unexpanded, already *is* the exhausted-day experience.** Nothing needed to classify, infer, or label. The person simply didn't move upward.

## The architecture that replaces it

Not five modes. One floor and a ladder the person chooses to climb:

```
The Floor            You're here.
   ↓  (the person reaches)
Expansion            Would you like more?
   ↓  (the person reaches)
Further expansion    Would you like to gather what matters?
```

- There is **no Exhausted Mode, no Fragmented / Open / Overwhelmed / Numb Mode** — *as system states.*
- The "capacity states" named in the design docs are **descriptive** — what arrival feels like at each level of expansion — never a **control structure** the system branches on.
- The only inference permitted is tone → *posture* (how gently the floor opens). It adjusts the system's own register and names nothing about the person (Invariant 14, tone-not-label clause).

## This generalizes — four thresholds, not four products

The same principle and the same navigation apply across the platform. Each surface is a threshold with its own opening question:

| Surface | The threshold question |
|---|---|
| Personal Portal | *Where am I?* |
| Studio | *Who needs me today?* |
| Session Room | *What wants attention here?* |
| Accompaniment Layer | *Who stands with me?* |

These are **not four products. They are four thresholds.** Each one:

- **remembers what was placed**
- **invites what is present**
- **offers the next crossing**

And each is bound by the same prohibitions: none decides who the person is; none defines the relationship; none infers significance. The Threshold Principle is platform-wide — and so is navigation-by-depth. A surface that classifies the person's state to choose its mode violates the doctrine no matter which of the four it is.

## Why this is one of the good simplifications

It improves four things at once, which is rare:

- **Sovereignty** — the system stops deciding who the person is.
- **Usability** — the person is never mis-moded; they set their own depth.
- **Implementation** — a floor plus an expansion gesture is *less* code than a state classifier and five modes: no detection, no mis-detection, no model to tune, no mode matrix to maintain.
- **Trust** — there is no hidden read of the person to distrust.

A simplification that improves sovereignty, usability, complexity, and trust *together* is almost always the right one.

## Relation to canon

Candidate Invariant 14 is the **boundary**: *never decide who the person is.* This doctrine is the **chosen mechanism** for honoring that boundary wherever capacity and depth are at stake: *offer depth; the person controls it.*

The boundary is canon. The mechanism is doctrine. Another surface might honor the boundary by other means — but **every threshold must honor the boundary**, and on this platform the chosen means is navigation-by-depth.

---

*Captured because the discovery outranks the wording that occasioned it: the system does not navigate by detecting states — it navigates by offering depth.*
