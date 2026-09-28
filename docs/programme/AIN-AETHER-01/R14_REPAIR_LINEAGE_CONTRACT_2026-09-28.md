# AIN-AETHER-01R14 — Repair Lineage Contract

Date: 2026-09-28

Parent: `6140432bf829c4c1c83a2adfacee4da74215b9a3`

## Purpose

R14 governs succession among machine reflections, human reviews, and accepted repairs.

> **Interpretation may change; lineage may only grow.**

## One-head law

Each reflection lineage has exactly one active interpretive head.

Historical machine proposals, human reviews, and repairs remain preserved but inactive once superseded.

Competing simultaneous active heads are invalid.

## Append-only law

Lineage nodes are never rewritten in place.

A new human review appends a review node.

A new accepted repair appends a repair node and supersedes the prior active head.

The prior node remains intact and records its successor.
## Human-review node law

A human review is part of lineage history but does not itself become the active reflection.

It witnesses the adjudication event that may later justify a repair.

## Repair-promotion law

Only a repair that already passed R13 may be promoted.

Rejected or semantically invalid repairs cannot become lineage heads.

## Supersession law

When a repair becomes active:

- prior head → inactive;
- prior head records `supersededByRef`;
- new repair becomes the sole active head;
- all earlier nodes remain preserved.

## Rollback law

Returning to an earlier wording is represented as a new repair node carrying the earlier text.

Rollback therefore means:

> **new succession toward prior content**

not:

> **deletion of later history**.
## Validation law

A valid lineage requires:

- exactly one active node;
- active head reference matches that node;
- unique node references;
- every parent reference resolves;
- every successor reference resolves;
- append-only standing remains true.

## Soul-Service law

> **A living interpretation may evolve without pretending the past never happened.**

The member's changing recognition is honored through succession rather than erasure.

## No-build boundary

R14 remains benchmark-only.

No live runtime state.
No production persistence.
No automatic activation from conversation.
No hidden overwrite of earlier interpretations.

## Next boundary

> **AIN-AETHER-01R15 — LINEAGE QUERY + TEMPORAL EXPLANATION · “WHAT CHANGED AND WHY?” WITHOUT RECONSTRUCTIVE FICTION ONLY**

R15 should let MAIA answer how an active reflection changed over time using only preserved lineage, review, and repair evidence.