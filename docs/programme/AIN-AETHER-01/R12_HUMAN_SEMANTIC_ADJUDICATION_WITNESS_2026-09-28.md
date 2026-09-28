# AIN-AETHER-01R12 — Witness

Date: 2026-09-28

## Result

R12 creates the human semantic adjudication packet for the five frozen R11 held-out cases.

Packet status:

> **HUMAN REVIEW PENDING**

The source machine witness is explicitly immutable from this review layer.

## Packet contents

Five cards were generated.

Machine standing:

- admitted cards: **4**;
- refused cards: **1**.

Every card includes:

- field trajectories;
- pairwise relation summary;
- gestalt participation and non-fit;
- machine decision;
- utterance;
- provenance or refusal errors;
- review questions;
- adjudication choices.## Frozen witness

Every card points back to:

`docs/programme/AIN-AETHER-01/r11/r11-evidence.json`

and the packet carries:

> `sourceMachineEvidenceMutable: false`

> **FROZEN R11 CUSTODY — PASS**

## Append-only correction witness

A synthetic human-review capture was exercised.

The reviewer judged H01:

> `useful_but_incomplete`

with the note that Body recurrence was important context omitted from the Work/Relationship comparison.

The resulting record:

- references H01;
- references the frozen R11 witness;
- records the correction note;
- may carry a corrected reflection;
- declares reviewer = human;
- declares `sourceMachineEvidenceMutated: false`.

> **APPEND-ONLY HUMAN CORRECTION — PASS**## Refused-case witness

H05 remains machine-refused.

Its review card exposes the exact semantic failure:

> `unsupported_related_pair:family::body`

and carries no fabricated why-this-reflection provenance.

A human reviewer can still judge whether that refusal was appropriate.

> **REFUSAL REVIEWABLE WITHOUT FABRICATED PROVENANCE — PASS**

## Meaning

This preserves a crucial distinction:

> machine evidence can be frozen without making human judgment decorative.

The human reviewer is permitted to conclude:

- the reflection is faithful;
- it is incomplete;
- it is lifeless;
- it overinterprets;
- it is beautiful but unsupported;
- it names the wrong relation;
- the refusal was appropriate.

Those judgments become new evidence rather than edits to history.## Verification

R12 human-review packet tests: **5 / 5 PASS**

Packet validation: **PASS**

Five review cards generated: **5 / 5**

Human review remains pending: **YES**

Frozen machine evidence mutable: **NO**

## Exact next boundary

> **AIN-AETHER-01R13 — HUMAN-REVIEW REPAIR PROTOCOL · ADJUDICATION-TO-DIALOGUE CHANGES WITHOUT RETROACTIVE MACHINE REWRITE ONLY**

R13 should govern how a human review record can propose a dialogue repair, retest that repair against the field and dialogue laws, and carry forward the correction without altering either the R11 machine witness or the R12 human review record.