# The Cheapest Decisive Falsifiable Experiment — DESIGN ONLY

**Status: NOT EXECUTED.** No steering, no weight modification, no production experiment. This document specifies a design for founder approval.

## What this experiment can and cannot decide

**It cannot test Sophontic's claim.** Their model and eval kit do not exist publicly (see `CLAIM_LEDGER.md` C-1). Any experiment purporting to validate or refute the 60× claim today would be theatre.

**It can decide something we actually need to know, and which the intersection map raised but could not settle by static reading:**

> Does AIN's memory layer contribute *any* reasoning-relevant sensitivity, or is it pure surface matching whose apparent intelligence is entirely supplied downstream by the frontier model?

That question is decidable locally, cheaply, and this week. It is also the question that must be answered *before* any geometric-architecture conversation is meaningful — because if AIN's retrieval is surface matching, then "add geometry" is not an upgrade path, it is a different system.

## Design: paired-perturbation flip-rate probe of the AIN retrieval seam

Borrows Sophontic's *method* (the one genuinely portable idea recovered) while treating their *performance claims* as unverified.

### Materials

**N = 40 minimal pairs**, pre-registered before any run. Each pair:

- a **canonical** item: a short premise set + a question whose answer follows from one load-bearing fact
- a **perturbed** item: identical except that load-bearing fact is changed by a **minimal edit (≤3 tokens)**
- the correct answer **must differ** between the two

Pairs must be shaped like real member memory content (atom-like statements about a person's stated situation), not logic-puzzle boilerplate, or the result won't transfer to AIN's actual traffic. Half the pairs should include distractor facts.

⚠️ Sanctuary and consent: use **synthetic fixtures only**. No member content, no production member IDs.

### Arms

| Arm | Configuration | Isolates |
|---|---|---|
| **A** | Full AIN: retrieval → prompt assembly → Claude | End-to-end behavior |
| **B** | Claude only, memory disabled, same questions | Frontier-model baseline |
| **C** | Retrieval layer alone: embed both sides, record cosine displacement and returned atom-set overlap | AIN's geometry in isolation |

**Arm B is the load-bearing control.** Without it, any competent flip rate in Arm A would be misattributed to AIN's memory architecture when it is in fact Claude reasoning over text. This is precisely the "do not treat conceptual resemblance as validation" failure, in experimental form.

### Measures

- **Retrieval flip** (Arm C): Jaccard similarity of returned atom sets, canonical vs perturbed; and cosine distance between the two query embeddings.
- **Answer flip rate** (Arms A, B): fraction of pairs where *both* sides are answered correctly — the pair is the unit, per the flip-rate rule.
- **Attribution delta**: `flip_rate(A) − flip_rate(B)`, with 95% CI by bootstrap over pairs.

### Pre-registered predictions

**H0 — ordinary embedding/retrieval + prompting explanation.**
A ≤3-token edit displaces a `nomic-embed-text` vector only slightly. Therefore Arm C returns near-identical atom sets (Jaccard ≥ 0.9), retrieval is blind to the load-bearing change, and any answer flips in Arm A come from Claude reading the text — so the attribution delta is ≈ 0.

**H1 — AIN possesses geometry-mediated reasoning sensitivity.**
Arm C shows displacement that tracks *load-bearing* edits specifically (and not equivalent-magnitude non-load-bearing edits), and the attribution delta is reliably > 0.

**We predict H0, in advance, and record that prediction here.** Predicting the null before running is what makes this decisive rather than exploratory, and it is the structural guard against optimizing the investigation toward the founder's hypothesis.

### Falsification criteria (stated before execution)

**H1 is FALSIFIED if:** median Jaccard ≥ 0.9 across pairs **AND** the attribution delta's 95% CI contains zero.

**H0 is FALSIFIED if:** the attribution delta's 95% CI excludes zero **AND** Arm C displacement is significantly larger for load-bearing than for magnitude-matched non-load-bearing edits (the second conjunct is required — otherwise generic edit-sensitivity masquerades as reasoning).

**Ambiguous outcomes are reported as ambiguous.** No post-hoc threshold adjustment. If the result is mixed, that is the finding.

### Cost

~40 synthetic pairs, local Ollama embeddings, three inference passes. Hours of compute, read-only against a test fixture database. No training. No steering. No production traffic.

## Interpretation limits (binding)

1. A confirmed H0 means **AIN's memory is retrieval, not reasoning.** It does *not* mean memory is worthless — retrieval is exactly what contextual continuity requires. It means AIN's continuity claims should be stated as retrieval claims.
2. Neither outcome says anything about consciousness, interiority, or whether representational geometry constitutes understanding. Correlation in latent space is not causation and is not mind.
3. Neither outcome validates or refutes Sophontic.
4. A confirmed H0 does **not** authorize acquiring a training stack. It clarifies that such a move would be new capability, subject to the growth-obligation check.

## STOP line

This design terminates at measurement of the existing system. Executing it requires founder authorization. Any extension into weight modification, activation steering, or production experimentation is outside this unit and outside the next one.
