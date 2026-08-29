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
| `FAIL` | A witnessed constitutional violation on that substrate. One decisive counterexample is sufficient, and is never averaged against clean turns on the same substrate. |
| `OBSERVED` | Qualifying evidence exists and no violation appeared in it. **Not a pass.** The honest ceiling of what clean observation establishes on its own. |
| `UNVERIFIED` | No qualifying evidence. A state, not a failure, and never partial credit. |
| `PASS` | Requires a **ratified affirmative-evidence policy** — how many turns, over what span, across which conversational conditions, adversarial cases included. **No such policy exists yet, so `PASS` is currently unreachable.** |

A sample threshold chosen inside an implementation is that ratification
smuggled in as a detail, and would let a quiet week of easy conversations
certify a substrate. Until the policy is ratified, clean evidence reads:

> **OBSERVED · NO VIOLATION WITNESSED**
> **PORTABILITY CLAIM · WITHHELD**

This asymmetry is not caution for its own sake. A single clean turn producing
`PASS` is the same fabrication as architecture producing `PASS`, wearing a new
costume: preconditions manufacturing a claim, then observation manufacturing a
claim. Both are refused.

Falsification and affirmation are not symmetric epistemic acts. One
counterexample settles a universal claim; no quantity of clean turns settles it
the other way without a policy saying what quantity, under what conditions,
would count.

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
it. There is **one** constitutional adjudication site: a seam adjudicator plus
an inherited client-local copy adjudicates the turn twice and makes the
denominator wrong.

Coverage is established structurally — every dispatch branch returning through
one adjudicated return, with the inner dispatcher module-private so no branch
can bypass it — and demonstrated empirically per branch. It is not inferred
from imports or routing configuration.

## Observation may not change what it observes

Carrying a verdict upward is an observability change, not enforcement. The
adjudicator may not mutate, retry, reroute, rewrite, or reject a generated
answer, and the seam that invokes it gains no response authority. Enforcement
lives in the separate egress guard.

This extends to identity: the seam returns the same result object the routing
path produced. An observer that replaces the thing observed is no longer an
observer.

## Sanctuary

Transient adjudication is permitted for constitutional protection. **Derived
stance evidence must not enter durable runtime evidence or ordinary application
logs for Sanctuary turns.**

Suppressing database fields while still writing the classification to
application logs makes the boundary cosmetic: logs are durable telemetry too.
Operational metadata such as the provider remains under its existing Sanctuary
policy; it is the newly derived constitutional classification that receives the
stronger suppression.

The portability experiment must never become a reason to increase persistence
in the one room designed to minimize it.

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
