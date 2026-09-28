# AIN-AETHER-01R12 — Human Semantic Adjudication Contract

Date: 2026-09-28
Parent: `45b88f9c71dc72be113416a1d74b303c8e1ca532`

## Purpose

R12 creates a human-review surface for the frozen R11 held-out cases.

> **Human adjudication may amend the active interpretation, but it may not rewrite the frozen machine witness.**

## Separation law

R12 preserves three distinct artifacts:

1. frozen R11 machine evidence;
2. human-readable review cards;
3. append-only human adjudication records.

These layers must not be collapsed.## Review card law

Each card exposes:

- represented domain trajectories;
- cross-spiral relations;
- current gestalt standing;
- machine admit/refuse decision;
- proposed or refused utterance;
- why-this-reflection provenance when available;
- uncertainty;
- member check;
- machine errors when refused;
- human adjudication choices;
- correction note area;
- corrected reflection area.

The review surface is meant to support judgment, not to steer the reviewer toward approval.

## Human adjudication law

A human may classify a case as:

- semantically faithful;
- useful but incomplete;
- technically grounded but lifeless;
- overinterpreted;
- beautiful but unsupported;
- wrong relation;
- appropriate refusal.## Correction capture law

A human correction creates a new review record.

The record contains:

- case reference;
- frozen R11 evidence reference;
- adjudication;
- correction note;
- optional corrected reflection;
- reviewer = human;
- `sourceMachineEvidenceMutated: false`.

A correction note is required.

The original machine evidence remains untouched.

## Rejected / refused cases

A refused machine case remains fully reviewable.

The card must not fabricate provenance when the underlying semantic claim was refused.

The human may judge the refusal appropriate or too cautious.

## Historical integrity

R12 therefore preserves:

```text
frozen machine witness
        ↓
human review card
        ↓
human adjudication record
```

The final layer appends meaning; it does not rewrite the first.## Authority boundary

R12 does not authorize:

- automatic human approval;
- live member runtime;
- production prompt changes;
- persistence into a person profile;
- machine reinterpretation of human disagreement.

## Soul-Service law

> **The human encounter remains a real epistemic event rather than a ceremonial approval step for machine output.**

Human review is allowed to say that the machine was grounded and still missed the living meaning.

## Next boundary

> **AIN-AETHER-01R13 — HUMAN-REVIEW REPAIR PROTOCOL · ADJUDICATION-TO-DIALOGUE CHANGES WITHOUT RETROACTIVE MACHINE REWRITE ONLY**

R13 should define how accepted human corrections generate candidate dialogue repairs while preserving the frozen machine and human review records as provenance.