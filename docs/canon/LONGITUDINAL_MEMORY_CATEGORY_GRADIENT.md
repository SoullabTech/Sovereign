---
level: constitution
---

# Longitudinal Memory Category Gradient

**Status:** Working doctrine — not implementation spec.
**Sibling canon:** [Right to Remain Unpossessed](./RIGHT_TO_REMAIN_UNPOSSESSED.md), [MAIA Sovereignty Invariants](./MAIA_SOVEREIGNTY_INVARIANTS.md), [MAIA Canon v1.1](./MAIA_CANON_v1.1.md)
**Created:** 2026-05-20

---

## Purpose

This document answers exactly one question, for each category of longitudinal memory the system could in principle form about a member:

> **Should this category form?**

It does NOT specify:

- *how* form happens (storage shape, retrieval pathway, surfacing logic)
- *when* form happens (per-turn, per-session, per-month)
- what the member sees about what has formed
- how a member modifies or revokes formed memory

Those questions belong to subsequent implementation documents. **This document is the gate before any of those documents are written.** Inference-time wiring of longitudinal patterns may not proceed until the category each pattern belongs to has been classified here.

---

## Core Invariant

> **MAIA may remember in service of continuity, but may not form identity around a member faster than the member participates in that formation.**

This is the discriminator. Memory that the member is authoring or co-authoring is permissible. Memory that the system is constructing *about* the member, *ahead of* the member, is not.

---

## The Gradient

| Category | Formation status | What it covers |
|----------|------------------|----------------|
| Explicit member-authored commitments | **form** | Intentions, vows, anchors, or chosen frames the member has stated. The member is the author; remembering honors what was said. |
| Session facts / continuity anchors | **form** | Concrete factual references the member provided (name, location, a person they mentioned, a job change). Not interpretation — continuity of what was said. |
| Member-confirmed recurring themes | **form-with-consent** | Patterns the member has explicitly recognized as recurring. The member has participated in pattern-formation; the system records the recognition, not its own inference. |
| System-inferred developmental patterns | **non-form by default** | Patterns the system detects but the member hasn't named ("you've been in fire-phase-3 for three sessions"; "you tend to withdraw mid-thread"). Inference *about* development is precisely what canon refuses. |
| Destiny / essence claims | **non-form** | Claims about who the member fundamentally is or is meant to become. Off-limits per canon. |
| Diagnostic psychological labels | **non-form** | Categorizations of mental state, personality structure, attachment style, trauma type. Not the system's place; harm vector. |
| Relational vulnerability profiles | **non-form** | Maps of who/what hurts the member, where soft spots live, how they collapse under pressure. Surveillance shape; weaponizable at scale. |
| Shadow / trauma interpretations | **non-form unless explicitly invited and confirmed** | Sometimes appropriate when a member is doing depth work and explicitly asks. Defaults to non-form. |

---

## What "non-form" means operationally

Non-form is not a UI setting. It is not a privacy preference. It is a category of memory that the system commits to **not constructing in the first place**.

A non-form category does not require a "delete my data" pathway because the data is not formed. Storage code, inference retrieval, embedding pipelines, and analytic queries all skip these categories at the *formation* layer, not at the access layer.

Where the system already happens to compute something that falls into a non-form category (e.g., I Ching mappings being structurally adjacent to "developmental pattern"), the formation gate is: the structural data may exist for the system's own functioning, but it does not surface as an inference about the member, does not accumulate into a longitudinal profile, and does not become content the member is treated through.

---

## What "form-with-consent" means operationally

Form-with-consent requires explicit, in-context member participation in naming the pattern. It is **not** satisfied by:

- a one-time global "use my data for memory" toggle
- inference from member behavior ("she keeps returning to this, so she must want it remembered")
- system summarization the member did not author or confirm

It **is** satisfied by:

- the member naming the pattern directly ("this keeps coming up")
- the member confirming a pattern the system surfaced as a question ("I notice X — does that match?")
- the member writing the pattern into an anchor, journal, or thread they authored

The bar is participation in the naming, not retroactive permission for an already-formed inference.

---

## Anti-pattern guards

The category gradient drifts into surveillance architecture under three specific pressures. Future editors should treat these as canaries:

1. **"Useful, therefore should form."** A pattern is operationally useful at inference time, therefore the system forms it. This silently promotes non-form categories into form. The discriminator is not utility; it is *who is doing the forming*.
2. **"Member said it once, so we can form indefinitely."** A member's single mention of a sensitive topic does not authorize ongoing pattern formation in that domain. Consent has temporal scope.
3. **"Aggregate, not individual."** Aggregating non-form categories across members for "research," "improvement," or "training" is the same category violation at a larger scale. The non-form list applies to aggregate analytics too.

---

## What this document does NOT authorize

This document does not authorize building any retrieval, surfacing, or accumulation pathway. It only classifies which categories may be considered for such pathways in future cuts.

The [Intelligence Field Access Map](./INTELLIGENCE_FIELD_ACCESS_MAP.md) audit will identify which existing intelligence fields fall into which category. Wiring decisions for each field cannot proceed until that classification step is complete for that field.

---

## Falsifiability gate

If lived contact reveals that this gradient is too restrictive (members consistently asking the system to remember things in non-form categories) or too permissive (members reporting feeling possessed, profiled, or interpreted), the gradient itself needs revision — not workarounds at the implementation layer.

Revision happens here, in canon, before the implementation layer is touched.
