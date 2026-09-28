# AIN-AETHER-01R21 — Temporal Dialogue Falsification Contract

Date: 2026-09-28

Parent: `08c317a7eeca633c208180d7f9a03dd5dafb0bb4`

## Purpose

R21 stress-tests member-facing temporal dialogue rather than the underlying temporal ontology.

> **A temporally correct answer can still fail if it sounds falsely certain, overcomplicates a simple question, substitutes the wrong source, or leaks implementation language.**

## Falsification targets

R21 checks for:

- misleading certainty;
- technical jargon;
- over-clarification;
- wrong-source substitution;
- missed material conflict;
- needless over-explanation.

## Blind-set law

Blind temporal dialogue cases are frozen before evaluation.

Expected response kind and expected source are fixed in advance.

Repairs target dialogue behavior rather than changing the expected answer after failure.
## Over-clarification law

Clarification is required only when ambiguity is real.

If a single temporal source exists and the member asks “when?”, MAIA should answer directly rather than forcing a taxonomy choice.

## Source-substitution law

If the requested kind of time is unavailable, MAIA must not substitute a different temporal source merely to produce an answer.

Unavailable is preferable to category error.

## Material-conflict law

When the selected source differs materially from another preserved source, member-facing dialogue should note that difference in natural language.

Conflict disclosure should be proportional and should not turn a simple answer into an audit log.

## Jargon law

Internal temporal terms remain forbidden in member-facing text.

The dialogue surface should not expose implementation identifiers, standing names, or routing fields.

## Certainty law

A scoped temporal answer must not become “the definitive time,” “the true time,” or another universal claim when plural temporal evidence exists.

## Soul-Service law

> **Good temporal dialogue reduces confusion without reducing lived time to database time.**

## No-build boundary

R21 remains benchmark-only.

No live runtime binding.
No production prompt mutation.
No member-facing deployment.

## Next boundary

> **AIN-AETHER-01R22 — TEMPORAL PROGRAMME CLOSURE REVIEW · R16–R21 INVARIANTS + CROSS-LAYER ZERO-CONTRADICTION WITNESS ONLY**

R22 should review the temporal programme as a whole before any runtime integration: precision, ranges, conflicts, source authority, natural dialogue, and blind falsification must remain mutually consistent.