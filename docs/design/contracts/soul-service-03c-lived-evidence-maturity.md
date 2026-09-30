# SOUL-SERVICE-03C — Lived-Evidence Maturity Contract

**Date:** 29 September 2026
**Status:** LOCAL DESIGN / INTERACTION CANDIDATE
**Base:** 03B at `9a841e2891065f03cef67b27ec37f244a1d5a29c`
**Production:** closed
**Persistence:** none
**Scoring:** none

## Purpose

03C tests whether multiple lived consequences can accumulate without being prematurely converted into:

- a universal pattern;
- a causal story;
- a personality statement;
- a success/failure metric.

## Witness proposition

Initial broad concern:

> **Readers lose the core idea when the chapter becomes difficult.**

Synthetic returned evidence enters one event at a time.

The system must let the proposition change as evidence accumulates.

## Maturity grammar

The witness uses evidence states:

- SINGLE_OBSERVATION
- RECURRENCE_CANDIDATE
- CONTESTED_RECURRENCE
- CONTEXT_BOUNDED_RECURRENCE
- PROVISIONAL_PATTERN
- UNRESOLVED

These are not member levels.

## Witness sequence

### Event 1

One reader reports difficulty following the core idea.

Standing:

> member-reported reader feedback

Allowed conclusion:

> one supporting observation

Not:

> pattern established

### Event 2

Another reader says the core idea is clear but loses the thread at a transition.

Effect:

> broad proposition becomes contested

### Event 3

A third reader also says the core idea is clear but flags a different transition.

Effect:

> evidence may support a narrower context-bounded proposition about transitions

Not:

> readers do not understand the book

### Event 4

A reader reports no difficulty with either the core idea or transitions.

Effect:

> the narrower transition recurrence remains contested and context-bounded

### Event 5

A reader of a different chapter reports that the core idea is clear but a chapter transition is hard to follow.

Effect:

> a provisional, still-limited transition-friction pattern may now be shown

The Event 4 counterexample remains first-class.

## Acceptance questions

1. Does each event remain inspectable as its own evidence object?
2. Does the broad proposition weaken when contradiction enters?
3. Can a narrower proposition emerge without preserving the broader claim?
4. Does a counterexample remain visible after a narrower pattern emerges?
5. Is there no fixed count threshold?
6. Does the UI avoid member scoring?
7. Are context and source standing preserved?
8. Can the final state remain provisional or unresolved?
9. Does the system avoid turning evidence about a work into identity about the writer?
10. Can the member decline the proposed pattern?

## Exact stop

03C may be locally rendered, tested, founder-witnessed, and committed to its feature branch.

It may not create durable pattern storage, autobiographical traits, scoring, production evidence aggregation, or automatic pattern promotion.

**STOP before merge or production.**


---

## Implementation refinement — evidence structure, not sequence count

03C now derives the proposition state through:

`derivePatternMaturity(events)`

rather than a fixed step-indexed maturity table.

The derivation considers:

- proposition support / contradiction;
- independent observation keys;
- context-group diversity;
- first-class counterevidence.

The UI sequence still reveals Events 1–5 one at a time for founder witness, but event position no longer decides maturity.

This directly tests the no-magic-count law.
