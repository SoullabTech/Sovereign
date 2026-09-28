# AIN-AETHER-RUNTIME-01R4 — Synthetic Observation Batch → Member Field Derivation Contract

Date: 2026-09-28

Parent runtime R3: `2031daf5c7f1df04aab520ff28079995b00480f0`

## Purpose

R4 proves that a bounded batch of admitted and adapted synthetic observations can be processed by the closed benchmark field engine without giving the runtime layer any new authority.

> **A derived field may organize synthetic observations; it may not acquire more authority than the observations or the closed benchmark engine already permit.**

## Input law

R4 accepts only R3-adapted synthetic observations.

Each input must preserve:

- explicit synthetic provenance;
- explicit synthetic consent;
- member-owned final meaning;
- no persistence authority;
- no authority escalation;
- no confidence increase;
- no temporal-standing strengthening.

## Batch law

The batch must be non-empty and observation references must be unique.

Duplicate observations are refused rather than silently merged.

## Benchmark-engine reuse

R4 calls the existing closed benchmark:

> `deriveMemberAetherField(...)`

rather than introducing a new runtime derivation algorithm.

The resulting field is validated with the existing benchmark field validator.

## Pattern law

The benchmark engine may derive patterns from repeated motifs across facets.

Such patterns remain:

- provisional;
- unreviewed by the member;
- non-identitarian;
- non-diagnostic;
- non-predictive;
- non-Soul-representational.

A converging pattern is a relationship among observations, not a declaration about the person.

## Uncertainty law

If any contributing observation is source-observed rather than member-named, the benchmark engine retains its higher uncertainty behavior.

Runtime translation does not compensate by increasing certainty elsewhere.

## Authority boundary

Every R4 result declares:

- synthetic only: true;
- persisted: false;
- live member data bound: false;
- production authority: false.

The derived field itself preserves:

- final meaning authority: member;
- persistence authority: false.

## No-live-data boundary

R4 remains synthetic and in-memory.

No database write.
No member identity.
No runtime persistence.
No production route.
No MAIA prompt binding.

## Next boundary

> **AIN-AETHER-RUNTIME-01R5 — SYNTHETIC FIELD → CORRIGIBLE REFLECTION CANDIDATE · NO MEMBER-FACING DELIVERY + EVIDENCE-BOUND OUTPUT ONLY**

R5 should generate a synthetic reflection candidate from the in-memory field using the closed dialogue/semantic-fidelity laws, but stop before any member-facing delivery.
