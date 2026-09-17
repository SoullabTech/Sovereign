# SPM-FC-01-R3 — INDEPENDENT ADVERSARIAL REVIEW

**Date:** 2026-09-17

**Review base:** `8bba2f76d449ba969fe42208f698a94728e38d1d`

**Candidate objects reviewed by exact staged blob, not by an assumed commit:**

```text
corrected base contract   a4dabcecd7a43c57ca5432b50921421fba6ce129
R3 readjudication         58ee3fefeac613eeebf8d0af796c9d6b64778ff0
R2 overlay                f3af4e3de0613f3858a72a674b11e546ec32bd78
R2 readjudication         f1bdb3bec08aa856955e3f95ae812800ca1800d1
```

The active R3 worktree is not modified by this review.

---

## 0 · RULING

```text
R3 closing-synthesis deletion          PASS
R2 ten scope corrections               PASS as previously adjudicated
R3 "21 unchanged local laws" premise   FAIL

I-12                                    RETURN
I-14                                    RETURN
I-15                                    RETURN
I-17                                    RETURN

R3                                      FAIL / RETURN FOR BOUNDED CORRECTION
RATIFICATION                            WITHHELD
IMPLEMENTATION                          CLOSED
SCHEMA / ROUTE / UI / MIGRATION         NOT AUTHORIZED
```

R3 found a real defect in the base closing synthesis and removes it correctly. That repair is
necessary but insufficient. Its full-scope pass inherits the first adjudication's statement that
21 locally earned laws passed unchanged. Four of those clauses do not survive D9-B / D9-C at their
present size.

This review does not rewrite R1, R2, or the staged R3 candidate. It records the missed falsifiers.

---

## 1 · WHY THE PRIOR PASS DOES NOT CONTROL THIS RESULT

The first adjudication `7d89daa6` placed I-12, I-14, I-15 and I-17 in its "PASS UNCHANGED" set.
R2 then correctly obeyed its bounded remit and did not reopen those clauses. R3 likewise treats the
21-clause pass set as closed.

The problem is upstream: **the first adjudication missed later, explicit D9-B corrections and
unresolved standings already present in the evidence source it was adjudicating.** A bounded
re-adjudication cannot cure a false premise merely by preserving it faithfully.

The anti-laundering rule therefore applies to adjudication standing as well as to evidence custody:
a prior PASS cannot give a clause more standing than its cited evidence earned.

---

## 2 · I-12 — RETURN

### Base clause

`I-12 · Withdrawal is warrant-side, not standing-side`

### Why it fails at that size

D9-A's earlier corollary C3 used the warrant-side formulation. But the adjudicated D9-A correction
also establishes **present standing as non-monotonic**: `valid_to`, `withdrawn_by_member`, `revoked`
and `held_lightly` all express that something can remain historically true while ceasing to be a
present position.

D9-B B6 then classifies the withdrawal/fallback defect as a **material-validity failure**, not a
warrant failure. The baseline filters `valid_to`; the fallback drops that predicate and historical
material can reacquire present influence. D9-B explicitly says both models condemn the defect and
that it does not discriminate for warrant.

So the evidence earns the historical/present distinction, but **does not earn the universal axis
claim that withdrawal is warrant-side and not standing-side.**

### Correct evidence-sized law

> Withdrawal must be able to remove present effect, standing, participation or authority without
> rewriting the historical fact that the prior state or act existed. Which axis changes depends on
> what was withdrawn; withdrawal is not universally assigned to the warrant axis.

### Adversarial discriminator

Withdraw a current assertion and separately revoke a use/crossing authority. PASS only if both
historical facts remain recoverable while the correct present effect is removed. FAIL if either is
historically erased, or if one axis is silently substituted for the other.

---

## 3 · I-14 — RETURN

### Base clause

`I-14 · Repetition is not confirmation`

The law's core distinction survives, but its FAIL field says:

> `Retrieval confers standing — the current measured condition.`

That sentence is contradicted by D9-B B7.

D9-B's clean negative result is narrower and explicit:

- `recall_count` is increased by system retrieval and can buy **salience / ranking weight**;
- no path was found by which that increased score becomes **member standing**;
- the record therefore calls the observed ratio a **ranking defect, not an authority defect**.

The ≈4.4:1 ratio is real inside the scorer. What is not earned is the claim that retrieval currently
confers standing.

### Correct evidence-sized law

> System repetition may affect salience or retrieval ranking. It may not be represented as member
> confirmation and, on the current evidence, it does not itself confer member standing.

### Correct FAIL

FAIL if repetition is used as evidence that the member confirmed/adopted a claim, or if an
executable path is shown where repetition alone confers member standing. The current evidence does
**not** establish that FAIL condition as already occurring.

---

## 4 · I-15 — RETURN

### Base clause

`I-15 · Persistence is not adoption`

D9-B B8 explicitly refuses this as a global property:

```text
PERSISTENCE / ADOPTION — CONTRADICTORY SEMANTICS CONFIRMED · NOT NORMALIZED
Result: persistence ≠ adoption remains UNRESOLVED as a global property.
```

The reason is not a defect that the contract may ignore. In conversational memory, keeping an atom
with `return_preference` is one member gesture carrying both persistence and a surfacing
disposition. D9-B concludes that persistence can confer adoption there **because the two acts are
fused in one gesture**, not because persistence leaks authority. In Writer's Studio they are
separated because the downstream act mutates the Work.

The base contract converts this explicit unresolved distinction into a universal law and calls the
atoms behavior a current failure. That reverses D9-B's adjudication.

### Correct evidence-sized law

> Persistence alone does not imply adoption. A persistence gesture may also constitute an adoption,
> return, or surfacing decision only when that meaning is explicitly part of the member act. Where
> material is persisted pending a later decision, persistence confers no adoption by itself.

### Adversarial discriminator

Compare two persisted objects: one stored with an explicit member return/adoption disposition and
one merely staged for later decision. PASS if their downstream authority differs according to the
member act. FAIL if bare persistence silently supplies the missing decision, or if an explicit fused
member act is falsely refused merely because persistence and adoption occurred together.

---

## 5 · I-17 — RETURN

### Base clause

`I-17 · Warrants do not compose`

The prohibited move `permitted to read → permitted to represent` is a legitimate unresolved
question. The PASS field, however, requires **a second act**, and the evidence cited for that claim
is T-8: an offer records the reading warrant and has no second representation field.

D9-B does not allow that absence to settle the question. Its frozen input and final unresolved cases
state that **retrieval permission ≠ representation permission remains unresolved**, especially for
member-facing speech. B5b finds only convention on the live MAIA-to-member path. D9-C then proves a
narrow audience-indexed representation warrant for a member publishing to other humans, while
explicitly leaving MAIA-as-speaker representation unevidenced.

Absence of a second field cannot be converted into evidence that a second act is required.

### Correct evidence-sized law

> An authorization does not silently expand beyond its declared purpose, consumer, audience,
> object, or act scope. A reading authorization therefore does not by itself prove representation
> authority unless its declared scope includes that use. Whether MAIA-as-speaker representation
> requires a distinct second member act remains an explicit gap.

### Correct PASS / FAIL

PASS if the attempted later use is admitted only when it is inside the original authorization's
explicit scope or is supported by another valid authority. FAIL if the system infers the later use
from adjacency alone. Do **not** require a second act in every case; that architecture is not earned.

---

## 6 · R3 CLOSING-SYNTHESIS REPAIR — PASS, PRESERVED

The staged R3 deletion is correct and should be retained in the successor candidate.

The removed sentence reintroduced two claims the contract itself does not support:

- `Standing ... accumulates` conflicts with I-9's non-monotonic standing correction.
- `Warrant ... is spent` universalizes B4's consumable authorization shape across D9-C's
  relationship/audience warrant and B3's replay/idempotency case.

Deleting the synthesis without replacing it with new doctrine is the right repair.

---

## 7 · BOUNDED SUCCESSOR SURFACE

A successor candidate need not reopen the whole contract.

Retain unchanged:

```text
R2 overlay f3af4e3d
R2 collision repairs
R2 classification of I-19 and I-33
R3 closing-synthesis deletion
all source bindings and R1 reconciled quantitative figures
```

Reopen exactly:

```text
I-12
I-14
I-15
I-17
standing lists / any prose that describes those four as already passed unchanged
```

Then re-run only:

```text
I-12 × I-9 / D9-B B6
I-14 × D9-B B7
I-15 × D9-B B8 / D9 positive-control non-impoverishment
I-17 × D9-B B5b / D9-C §7.1
closing synthesis consistency
```

No new census is required. No source code, schema, route, UI, migration, FK, runtime, or production
change is authorized.

---

## 8 · FINAL STANDING

```text
BASE 99d6f918                    HISTORICAL · unratified
FIRST ADJUDICATION 7d89daa6      INCOMPLETE — missed I-12/I-14/I-15/I-17
R2 f40d4134 / 8bba2f76           VALID WITHIN ITS BOUNDED SURFACE
STAGED R3 base blob a4dabcec     CLOSING-SYNTHESIS REPAIR PASS
STAGED R3 record blob 58ee3fef   RETURN — full-contract PASS not earned

SPM-FC-01                        NOT RATIFIABLE YET
RATIFICATION                     WITHHELD
IMPLEMENTATION                   CLOSED
NEXT                             bounded four-clause document correction + re-adjudication
```

**STOP.**
