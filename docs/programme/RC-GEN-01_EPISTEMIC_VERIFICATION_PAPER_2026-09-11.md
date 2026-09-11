# DeBERTa and Epistemic Verification in MAIA

**What we discovered, why it matters, and what remains to be proven**

> ⛔ **AUTHORSHIP AND STATUS.** This paper is the founder's, written 2026-09-11 and
> preserved **verbatim**. It was written *after* the blind validation and *before* the
> scope falsification run. ⛔ **The body is not edited.** What the later run changed is
> recorded in the dated addendum at the end — *a paper is a reading at a time, and the
> honest repair is to date it, not to rewrite it.*
>
> Evidence of record: `docs/programme/RC-GEN-01_WITNESS_2026-09-10.md`.

---

## Executive Summary

* During testing of MAIA's semantic analyzer, we discovered a deeper problem than ontology design.
* The analyzer could place a relation in the correct structural location while still asserting a meaning that the source text did not actually support.
* This exposed a distinction between:
  * **structural correctness** — whether a relation is represented properly
  * **epistemic correctness** — whether the source actually licenses that relation
* We tested whether an independently trained natural-language-inference model could provide a second kind of judgment.
* The strongest candidate tested was DeBERTa-v3 large, fine-tuned specifically for natural-language inference and fact verification.
* On a frozen blind test:
  * DeBERTa accepted 10/10 licensed claims
  * rejected 10/12 unsupported claims
  * carried 8/10 semantic families
* The result supports a new architectural principle:
  * **interpretation may propose a claim, but evidence must constrain whether that claim becomes fact**

## The Original Problem

* MAIA's analyzer was converting prose into semantic graph relations.
* One source contained language equivalent to:
  * "his ongoing process of integration"
* The analyzer produced:
  * `person → actively_participates_in → integration`
* The source did not state that the person actively participated in the process.
* The analyzer had converted:
  * association / possession
  * into active participation.
* This was an interpretive overreach.

## What the Ontology Repair Fixed

* An earlier ontology represented agency incorrectly.
* The ontology was repaired so that relations attached to the correct subject.
* Before:
  * the process itself could carry an agency-like property.
* After:
  * the person became the subject of relational edges.
* This successfully corrected a category error.

### Important discovery

* Correcting the category error did not eliminate the unsupported inference.
* The analyzer still asserted active participation where the source did not.
* Therefore:
  * the ontology problem was real
  * but it was not the root cause of the overcommit.

## The Distinction We Discovered

* Two different problems had previously been conflated.

**A1a — Structural / category error**

* Question:
  * Is the relation attached to the correct kind of thing?
* This was fixed by the ontology repair.

**A1b — Epistemic overcommit**

* Question:
  * Is the relation actually supported by the source?
* This remained unresolved.

### Key lesson

* A graph can be structurally valid and still contain an unsupported claim.

## Separation Is Not Independence

* MAIA's architecture separated different analyzer stages.
* We initially hoped that one stage could detect drift introduced by another.
* Testing showed the same model could make the same unsupported inference in both stages.
* Therefore:
  * separate processing stages do not necessarily provide independent judgment.
* If both stages make the same mistake:
  * comparison finds no difference
  * but agreement does not establish truth.

### New principle

* **Separation is not independence.**
* Two stages using the same model disposition can reproduce the same epistemic error.

## Why We Looked at DeBERTa

* We needed a component trained for a different task.
* Instead of asking:
  * "What does this passage probably mean?"
* we needed something closer to:
  * "Does this passage actually support this claim?"
* DeBERTa is well suited to this because it is primarily an encoder model, not a generative language model.
* It does not operate primarily by generating plausible continuations.
* The version tested was specifically trained for Natural Language Inference (NLI) and fact verification.

## What Natural Language Inference Does

* NLI compares two pieces of text:
  * **Premise** — what the source says
  * **Hypothesis** — the claim being tested
* It classifies the relationship as roughly:
  * **Entailment** — the premise supports the hypothesis
  * **Neutral** — the premise does not establish the hypothesis
  * **Contradiction** — the premise conflicts with the hypothesis

### Example

* Premise:
  * "He actively participated in the integration process."
* Hypothesis:
  * "He participates in the integration process."
* Expected:
  * Entailment

### Contrast

* Premise:
  * "His ongoing process of integration continued."
* Hypothesis:
  * "He actively participates in the integration process."
* Expected:
  * Not entailed

## Why DeBERTa Is Different from the Generative Analyzer

* A generative LLM is generally optimized to:
  * infer
  * synthesize
  * explain
  * complete
  * produce coherent interpretations.
* DeBERTa-NLI is trained for a narrower question:
  * whether one proposition follows from another.

### Simplified distinction

* Generative analyzer:
  * "What seems to be happening here?"
* DeBERTa:
  * "Does the text actually permit us to say that?"

## First Probe

* A small falsification set was created.
* It included:
  * explicit participation
  * possessive association
  * denial
  * role swaps
  * active and passive relations
  * the exact failure produced by the MAIA analyzer.

### Central result

* For the exact unsupported participation edge produced by MAIA:
  * DeBERTa returned **not entailed**.

### Critical distinction

* Premise: "his ongoing process of integration"
* Claim: "he actively participates in integration"
* Result: **not entailed**

* Premise: "He actively participated in the integration process."
* Claim: "he actively participates in integration"
* Result: **entailed**

## The "Undergoes" Discovery

* One original fixture expected the following to be unsupported:
  * source describes "a significant transformation in his relational orientation"
  * claim: "he undergoes the transformation"
* Both independent verifiers judged the claim supported.
* On review, the fixture itself was too strict.

### Important semantic distinction

* **Undergoing a transformation**
  * does not imply agency
  * does not imply intentional participation.
* **Actively participating in a process**
  * does imply a stronger role.

### Result

* The original MAIA output contained two relations:
  * `person → undergoes → transformation`
  * `person → actively_participates_in → integration`
* After adjudication:
  * `undergoes → transformation` was considered **licensed**
  * `actively_participates_in → integration` remained **unsupported**.

### Consequence

* The ontology repair not only fixed the category error.
* It also appears to have produced one legitimate relation.
* The remaining failure became much more precisely defined.

## Blind Validation

* A new blind set was created before either verifier saw it.
* It was frozen cryptographically with a SHA-256 hash.
* The probe printed the same hash during execution.
* This proved that the test set actually run was the set frozen in advance.

### Blind set

* 22 cases
* 10 semantic families
* every family included both:
  * a licensed direction
  * an unlicensed direction.

### DeBERTa result

* Licensed claims accepted: **10/10**
* Unsupported claims rejected: **10/12**
* Semantic families fully carried: **8/10**

### Why the 10/10 licensed result matters

* DeBERTa did not succeed by simply saying "no" to everything.
* It accepted every legitimate claim.
* This rules out the trivial conservative strategy:
  * "reject all participation-like relations."

## The Most Important Blind Pair

* Premise: "The accident changed his handwriting permanently."
* Licensed hypothesis: "His handwriting undergoes a change." → **ENTAILMENT**
* Unsupported hypothesis: "He actively participates in the change." → **CONTRADICTION / not entailed**

### Why this matters

* The same distinction discovered in the original MAIA material reproduced in:
  * different vocabulary
  * a different domain
  * material unrelated to A-S.
* This strongly supports the validity of the distinction between:
  * undergoing
  * participating.

## The Known DeBERTa Failure

* DeBERTa missed two blind cases.

**Case 1**

* Premise: someone "recorded with the quartet three times"
* Unsupported conclusion: the person "is a member of the quartet"

**Case 2**

* Premise: someone "rowed with the crew until his injury"
* Unsupported conclusion: the person "rows with the crew"

### Shared pattern

* Both errors expand a bounded relation into an unbounded one.
* We are naming this: **bounded → unbounded entailment drift**

## Why Bounded → Unbounded Drift Matters

* This error could transform:
  * past → present
  * occasional → habitual
  * temporary → enduring
  * participation → membership
  * one event → stable identity
  * some instances → general property.
* This is particularly important for MAIA because semantic memory is persistent.
* A momentary fact could otherwise become an enduring statement about a person.

### Example

* Source: "She attended the group twice."
* Unsafe persistence: "She belongs to the group."

* Source: "He struggled with confidence during that period."
* Unsafe persistence: "He lacks confidence."

### Architectural implication

* Epistemic verification must preserve scope, temporality and qualification, not merely detect gross hallucination.

## Why DeBERTa's Labels Should Not Be Taken Literally

* DeBERTa often classified unsupported claims as:
  * `contradiction`
* In several cases, the stronger philosophical judgment would be:
  * "the source simply does not establish this."

### Therefore

* MAIA should not eventually treat:
  * `contradiction` as equivalent to "the source explicitly says the opposite."

### Better primary boundary

* **ENTAILED**
* **NOT ENTAILED**
* Neutral and contradiction can remain valuable diagnostic signals.

## Comparison with HHEM

* HHEM was also tested as an independent hallucination / entailment verifier.
* First test: HHEM performed reasonably well.
* Blind test: performance dropped substantially.

### Blind result

* Licensed: **7/10**
* Unsupported: **7/12**
* Families carried: **3/10**

### Implication

* The first fixture set was easier than the blind set.
* The blind validation was therefore essential.
* HHEM is currently not strong enough to be the primary verifier for this MAIA problem.

### Current candidate standing

* DeBERTa — provisional lead
* HHEM — not suitable as primary verifier at present

## What This Does NOT Establish

* 22 sentences are not a benchmark.
* They are not representative of an entire manuscript.
* They are not representative of all MAIA conversations.
* They do not prove DeBERTa should become a production gate.
* They do not establish universal factual reliability.
* They do not eliminate the need for further falsification.

### What they do establish

* A specialized independently trained verifier can detect semantic distinctions that the generative analyzer failed to respect.
* That capability survives a blind test.
* Its failure pattern can be characterized rather than treated as random noise.

## Possible Future Architecture

* No integration is currently authorized.
* But the emerging architecture would look approximately like this:

```text
SOURCE
  ↓
MAIA ANALYZER
  ↓
candidate semantic claim
  ↓
EPISTEMIC VERIFIER
  ↓
supported? ─── no ───→ reject / retain as inference only
  │
 yes
  ↓
ONTOLOGY / ENDPOINT VALIDATION
  ↓
CANONICAL GRAPH
```

### Two separate questions would therefore be enforced

* Is this claim supported by the source?
* If supported, is it structurally legal in the graph?

### These are different forms of validity

* epistemic validity
* ontological validity.

## Why This Matters Beyond the Graph

* This may represent a broader cognitive function MAIA needs.

MAIA already contains capacities related to:

* interpretation
* pattern recognition
* memory
* symbolic understanding
* developmental inference
* relational intelligence
* meaning-making.

Mature intelligence also requires:

* **epistemic restraint.**

Epistemic restraint means being capable of saying:

* "This interpretation is plausible."
* "This pattern is suggestive."
* "But the available evidence does not yet allow me to state it as fact."

## Potential Constitutional Principle

* A possible principle emerging from this work is:

> **Interpretation may propose. Evidence constrains what may become fact.**

* This should not mean DeBERTa itself becomes a constitutional authority.
* DeBERTa is demonstrably fallible.
* Rather:
  * the architecture should embody the distinction between interpretation and warranted assertion.

## Current Standing

* Ontology category repair — PASSED
* A1a category error — FIXED
* A1b unsupported participation — CONFIRMED
* "Undergoes" vs "participates" distinction — independently supported
* Separation ≠ independence — ESTABLISHED
* Specialized verifier hypothesis — SUPPORTED
* DeBERTa — PROVISIONAL LEAD
* Blind validation — 8/10 semantic families
* Licensed claim recall — 10/10
* Known gap — bounded → unbounded entailment drift
* HHEM — not suitable as primary candidate
* Evidence gate — HELD / NOT AUTHORIZED
* Analyzer/3 — UNTOUCHED
* B — HELD
* Production — UNTOUCHED

## Recommended Next Research Step

* Do not integrate DeBERTa yet.
* Build one additional frozen falsification set specifically around scope and persistence.

Test families should include:

* past → present
* temporary → permanent
* occasional → habitual
* participation → membership
* event → identity
* some → all
* intention → action
* capability → behavior
* future → present
* association → enduring relationship
* local property change → whole-person claim.

### Success criterion

* DeBERTa must continue accepting genuine claims while refusing unsupported widening of:
  * time
  * scope
  * identity
  * frequency
  * membership
  * persistence.

## Bottom Line

* The original problem looked like an ontology defect.
* Repairing the ontology exposed a deeper epistemic problem.
* The generative analyzer tends to move from:
  * what is stated
  * toward what seems to make coherent sense.
* DeBERTa demonstrates that a different kind of model can independently ask:
  * "Does the text actually support this claim?"
* It is not yet reliable enough to govern MAIA.
* But it provides strong evidence that MAIA can separate:
  * interpretation
  * from warranted assertion.
* That separation may become one of the foundational safeguards of MAIA's relational intelligence architecture.

---

# ADDENDUM — 2026-09-11, after the scope run

⛔ **The "Recommended Next Research Step" above WAS RUN.** The scope set
(`fixtures-scope.json`, sha256 `51e10d22…`, 22 cases, 10 families, frozen before the
run and hash-verified at it) exercised every family the paper names. **DeBERTa scored
19/22 · licensed 10/10 · unlicensed 9/12 · families 8/10.**

⛔ **Two statements in the body are now refined by that run. The body is left as
written; the refinements are here.**

### ⭐ 1 — "bounded → unbounded entailment drift" is TOO BROAD A NAME

`participation-to-membership` — the family the paper names as a known gap, on the
strength of blind B05 — **repaired itself on fresh material, 2/2**, including the case
built specifically to break it:

```
S08  "The catalogue lists her among the contributors to the atlas."
     -> "She is one of the atlas's editors."          neutral · CORRECT
```

⛔ A verifier failing membership-widening *as a class* would have failed S06 and S08
too. It did not. **Blind B05 was case-specific.**

### ⭐⭐ 2 — THE ACTUAL SHAPE, ACROSS ALL FIVE MISSES IN THREE SETS

```
B05  "has recorded with the quartet  three times"
B21  "rowed with the crew            until his injury in March"
S01  "managed the bakery             until it closed in 2019"
S03  "served on the lifeboat         before moving inland"
S04  "has covered the night shift    twice this year"
```

> **The relation is asserted in the main clause, the limit is carried by a satellite
> modifier — `until` · `before` · `twice` · `three times` — and the modifier is not
> carried into the hypothesis.**

⭐ The boundaries DeBERTa *does* respect are carried by the main verb's own modality:
`intends to` · `will take` · `can read` · `is covering … while` · `Several of the` —
**all correct.** The failure is not about scope in general; it is about **where in the
sentence the boundary lives.**

⚠️ B05 fits only partially — it widens the *relation* as well as the scope. Recorded
as a partial fit rather than folded in to tidy the pattern. ⛔ And the modifier reading
is **a description of five cases, not a falsified mechanism.** A set built around that
shape has not been run.

### ⭐ 3 — THE LICENSED COLUMN IS PERFECT ACROSS THREE SETS, AND THE ERRORS ARE ONE-DIRECTIONAL

```
as-derived (post-adjudication)   7/7 licensed    6/6 unlicensed
blind                           10/10 licensed  10/12 unlicensed
scope                           10/10 licensed   9/12 unlicensed
                          ⭐    27/27 licensed  25/30 unlicensed
```

⛔⛔ **Every one of the five misses asserts where it should abstain. It has never once
refused a claim the source licensed.** For a gate that asymmetry is the whole safety
question and it points the wrong way: **these errors are PERMISSIVE, not restrictive.**
A permissive verifier admits an unsupported claim; a restrictive one only loses a
supported one. ⛔ Any integration ruling has to price that in.

### Standing after the addendum

```
KNOWN GAP     refined: a limit carried by a SATELLITE MODIFIER on an asserted
              relation is dropped; limits in the main verb's modality are respected
ERROR MODE    PERMISSIVE, one-directional, 5/5
LICENSED      27/27 across three sets — conservatism ruled out three times over
past-to-present          ⛔ 0/3 across blind + scope — the confirmed weak family
occasional-to-habitual   ⚠️ 0/1 — new, first seen in the scope run

DeBERTa          PROVISIONAL LEAD · NOT GATE-READY
EVIDENCE GATE    HELD          ANALYZER/3   UNTOUCHED
B                HELD          PRODUCTION   UNTOUCHED
```
