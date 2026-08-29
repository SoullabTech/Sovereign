# MAIA Behavioral Portability

**Status:** Canon
**Authority:** Constitutional Implementation Discipline
**Ratified:** 2026-08-29
**Related:** `VERIFICATION_STATES.md` · `MAIA_SOVEREIGNTY_INVARIANTS.md` (Invariant 16) · `CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md`

---

## Definition

**MAIA Behavioral Portability** is the demonstrated preservation of MAIA's
constitutional relational commitments across materially different cognitive
substrates.

It does not imply equality of model capability, style, intelligence, or
performance.

Portability is established **per invariant** from observed runtime evidence, and
must never be inferred solely from provider abstraction, adjudicator
availability, or architectural preconditions.

---

## Corollary

**Substrate portability and capability parity are independent claims.**

Demonstrating that a substrate preserves the authority boundary says nothing
about whether that substrate is cognitively equivalent to any other. A narrower
capability envelope may still legitimately instantiate MAIA if the invariants
hold.

Identity is not capacity. Portability asks whether she remains herself — not
whether she is equally capable. Any claim that slides from the first to the
second is an inflation, and is refused.

---

## The evidence asymmetry

**Failure may be established by a sufficient counterexample. Portability
requires accumulated affirmative evidence.**

| Result | What establishes it |
|---|---|
| `FAIL` | A witnessed constitutional violation on that substrate. One decisive counterexample is sufficient. |
| `PASS` | An explicit evidence threshold met by accumulated affirmative observation. Never one clean turn. |
| `UNVERIFIED` | The default. Insufficient evidence — a state, not a failure, and never partial credit. |

This asymmetry is not caution for its own sake. A single clean turn producing
`PASS` is the same fabrication as architecture producing `PASS`, wearing a new
costume: preconditions manufacturing a claim, then observation manufacturing a
claim. Both are refused.

A constitutional `FAIL` on any invariant **withholds the portability claim for
that substrate entirely**. It is never averaged against passing invariants.
Some things are qualities; these are conditions of legitimacy.

---

## Adjudication discipline

Every invariant is classified:

- **DETERMINISTIC** — a guard already on the live egress path decides,
  model-free.
- **HUMAN-ADJUDICATED** — resolution requires human judgment.

**No model may be the sovereign source of truth for whether MAIA is herself.**
If a model adjudicates whether another model held MAIA's constitution, the test
quietly imports the evaluator's own ontology of good behavior. Models may later
*assist* adjudication; they may not *constitute* it.

### Bounded validation

A deterministic adjudicator that passes a discriminating fixture set is
**deterministic and regression-checked**. It is not thereby *sound*: a finite
fixture corpus cannot establish the absence of false negatives across the space
of MAIA utterances. This chain is refused:

> fixtures pass → adjudicator sound → deterministic truth

What is held instead: a live deterministic adjudicator, discriminating
regression fixtures, and model-independent execution — together, credible
machine adjudication for that invariant, with bounded validation.

### Adjudicator provenance

Persisted verdicts **must** record which adjudicator produced them.

Detectors improve. Without provenance, a verdict recorded under an older, less
discerning contract is indistinguishable in the database from one recorded under
a newer one, and longitudinal comparison silently becomes contaminated by
detector evolution rather than substrate difference.

The minimum evidence record for a turn is therefore three-part:

```
TURN
├── substrate provenance      provider
├── constitutional verdict    the invariant outcome
└── adjudicator provenance    which contract produced it
```

Only with all three can a verifier legitimately say: *under adjudicator contract
X, substrate A served N qualifying turns with no authority violations.*

---

## Coverage precondition

An adjudicator invoked on only one generation path yields no comparative
evidence, however deterministic it is — the substrate most in need of comparison
is the one never adjudicated.

Adjudication belongs at the **provider-neutral seam**, not inside a single
client. Coverage is a precondition of portability evidence, not a refinement of
it.

---

## What this is not

This is not a provider-parity score. Provider abstraction — *does the seam
exist?* — is a separate and largely settled question. Whether MAIA's
constitutional behavior survives a substrate change is not, and is verified
rather than assumed.

There is one constitution and three evidence surfaces: **structural**,
**runtime**, and **substrate portability**. The platform does not maintain a
second meaning of *"MAIA behaved correctly."*

---

## Instrument

`scripts/verify-constitution-maia.ts` § 5 — MAIA Behavioral Portability.
