# Elemental Order Probe — Pre-Registration (Naturalistic + Null-Model)

*Emerged from inquiry, 2026-06-09 (Kelly Nezat with Claude Code). Offered for ratification. Edit freely — the enshrining is Kelly's. This protocol holds itself to [LEGIBILITY_NOT_TRUTH](../canon/LEGIBILITY_NOT_TRUTH.md): the model's value does not rest on the outcome of this probe, and no member is ever fit to the inquiry.*

## The question — scoped narrowly

> **Does the *order* in which a member's process moves through the elements carry information — or is the canonical Fire → Water → Earth → Air decorative (a convention that organizes the practitioner's attention without itself predicting anything)?**

This probe does **not** test whether Spiralogic is valid, true, or clinically valuable. Twenty-eight years answer the value question; the model is held as an instrument, not a truth-claim. The *only* live question here is whether the **sequence** carries information beyond the broader frame. A null is a complete, first-class answer ("the order is convention, not grammar"), and the work loses nothing if it lands there.

## Ethical invariant (load-bearing — non-negotiable)

**No imposition on members.** No member is ever given a scrambled order to serve the inquiry. We do not manufacture variation in a person; we read the variation life already produced. The frame bends to the member, never the member to the experiment. *(LEGIBILITY_NOT_TRUTH, safeguard 2.)*

- Existing records only, under consent.
- **Sanctuary sessions are excluded absolutely** — no content, no coding, no inclusion, under any circumstance (Sanctuary Mode invariant).
- Arm 1 does not touch real member data until a consent + de-identification + ethics pass is complete. The *design* below is ratifiable now; the *wiring* is gated.

## Two instruments

### Arm 1 — Natural-variation analysis (life ran the shuffle)

Members don't live the canonical order. Some arrive in Water, some in Earth, some in Fire. That divergence is an ethical, already-present source of contrast.

- **Lived-sequence coding** — code the order in which elemental themes actually became salient in each member's process. *Coded blind to outcome.*
- **Match score** — Kendall's τ between the member's lived permutation and the canonical Fire→Water→Earth→Air (−1 = reversed … +1 = exact).
- **Outcome / coherent progress** — operationalized via the practice's existing measure (or a structured developmental-coherence rating). *Rated blind to the sequence coding, by an independent rater.*
- **Confound controls (pre-registered)** — intake severity/chaos, number of sessions, presenting condition. (Presentation order is **not** random — it correlates with severity, which also drives outcome. This is the core confound.)
- **Inter-rater reliability** reported for both the sequence coding and the outcome rating.

### Arm 2 — Null-model simulation (build the ruler)

Runnable now: [`scripts/repro/elemental-order-null-model.ts`](../../scripts/repro/elemental-order-null-model.ts)

Purpose is **not to answer** the question — a simulation only knows the assumptions you build into it, and never touches a real life. Its job is to **build the bar** the real data must clear:

- Simulate the **confounded null**: order is decorative (no effect), but severity drives *both* scramble *and* outcome.
- Show that this confound **alone** produces a spurious *raw* match×outcome correlation — so a raw correlation is **not** evidence.
- Output the distribution of the **severity-controlled (partial) correlation** under the null → its one-sided 95% edge is **the bar**.
- Power: how many members are needed to detect a plausible order effect above that bar.

## How they combine

> **The simulation builds the ruler; the natural variation in real member experience is what you measure with it.**

The real-data **partial (severity-controlled)** correlation must exceed the null bar from Arm 2. Alone, the sim only knows your assumptions and the observation only gives confounded richness. Together they are ethical *and* real.

## Pre-commitments (the teeth)

1. Sequences coded **blind to outcome**; outcomes rated **blind to sequence**; report IRR for both.
2. Confound set and analysis **pre-registered before looking**. No fishing.
3. **The test statistic is the PARTIAL (severity-controlled) correlation, not the raw.** The raw is confounded — the sim demonstrates this directly.
4. A **null is first-class**: it supports "the order is decorative / convention here." Per LEGIBILITY_NOT_TRUTH safeguard 4, holding this open *is* the safeguard — a model whose worth doesn't depend on the order being operative can't be defended as dogma.
5. A **positive is a shard, not proof**: naturalistic, residual confounding remains. It warrants further work; it does not conclude.
6. **Scope, stated up front:** this is deliberately weaker than a controlled manipulation, because imposing a scramble on a suffering member is forbidden. The honest ceiling is *"consistent with / not consistent with"* the operative claim — never "proven."

## What each result means

| Real-data finding | Reading |
|---|---|
| Partial corr clears the null bar, robust across the confound set | Order **may be operative** — a shard worth pursuing |
| Partial corr inside the null interval | Order behaves as **decorative here** — convention, not grammar (first-class) |
| Raw clears the bar but partial does not | The **confound was faking it** — the sim's central lesson, confirmed |

## Honest limits

- Sequence coding is interpretive (mitigated by blind coding + IRR).
- Single practice / single practitioner — holds the practitioner ~constant, which is a *feature* for this question (isolates order from skill) and a *limit* for generality.
- Presentation order is not random — the residual confound is controlled, never eliminated.

## Status

Design complete; null-model simulation **runnable now**. Arm 1 wiring to real records is a **follow-up**, gated behind consent + de-identification + Sanctuary exclusion. Offered for ratification — yours to edit, run, or set down.

---

*Kin: [AIR_PROBE_PREREGISTRATION](./AIR_PROBE_PREREGISTRATION_2026-06-07.md) · [LEGIBILITY_NOT_TRUTH](../canon/LEGIBILITY_NOT_TRUTH.md) · [LIVING_SYMBOLS_PRINCIPLE](../canon/LIVING_SYMBOLS_PRINCIPLE.md)*
