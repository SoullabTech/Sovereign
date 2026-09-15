# Relational Geometry of Reasoning — a joint empirical question

**Soullab → Sophontic · 2026-09-15 · working brief, for discussion**

Prepared for Julian Michels. This is a proposal for a shared experiment, not a
result. Every claim below is marked for what it is; the things we are *not*
claiming are marked at least as clearly.

---

## 1 · The short version

We have been building a relational AI architecture for reasons that had nothing
to do with representation research. Governance forced us to draw a set of
distinctions very precisely — who authored a thing, how it arrived, what standing
it has, whether a record proves an act began or that it completed, whether an
emptiness means *nothing was supplied* or *the process ran and found nothing*.

Each of those was drawn to refuse a specific way the system could inflate its own
authority. None was designed to produce a measurable result.

We think that makes them unusually good probes.

> **The proposition we want to test with you: relational reasoning may be one form
> of geometric reasoning — where the invariant preserved is the structure of
> relations rather than the properties of individual objects.**

We have built a first instrument toward it: **12 relational operators, 48 paired
stimuli, mechanically validated.** We can run the behavioural half ourselves. The
representational half is yours.

---

## 2 · What we are not claiming

Stated first, because the temptation runs the other way.

- ⛔ We have **not** demonstrated latent-space learning in our system. There is no
  training, gradient or optimizer shaping a model's representation space anywhere
  in our architecture.
- ⛔ We are **not** asserting that "relationship" is literally a geometric object.
- ⛔ **An explicit type-level distinction in TypeScript is not evidence of a
  representational distinction inside a model.** Having built the types is not
  partial evidence for it. That correspondence is precisely the open question.
- ⛔ Of our 12 operators, **8 are compiler-enforced contracts and nothing more.**
  One is witnessed against a live route, two against a test harness, and one is
  declared in our vocabulary but emitted by no code path at all. We grade and
  report this per operator and the grading is machine-checked.

Two independent readings inside our own programme reached that last caution from
opposite directions — an August draft warning against the inflation from the
theory side, and a September repository census reaching it from the code side.
We treat the agreement as a constraint on what we may say, not as a finding.

---

## 3 · What we think we can contribute that is hard to get elsewhere

Your published paradigm perturbs a **load-bearing fact** and asks whether the
conclusion moves with it. Our contribution is a set of perturbations where the
thing that moves is a **load-bearing relation**, and the semantic payload barely
moves at all.

A worked example — our operator R07:

```
A   The lookup over the person's saved notes ran, and returned nothing.
B   The lookup over the person's saved notes was never started.
```

Downstream, in our production system, these are **the same artifact**: the text
carried into the conversation is the empty string in both cases. The distinction
is unrecoverable from the payload. It exists only in how the emptiness arose — and
in our architecture it is load-bearing, because only one of the two leaves room
for a second retrieval path to acquire standing.

⚠️ To be precise, since it matters: what is identical is the *downstream artifact
in our runtime*, not the two stimuli. In the corpus, A and B are minimally
different sentences — one clause changes. That is the paired-perturbation design.
What the same-surface property buys is the guarantee that **a model cannot succeed
by reading the payload**, because in the world the stimulus describes there is no
payload to read.

Ten of our 48 pairs have this property. Others in the set:

| | The distinction |
|---|---|
| R05 | *historically recoverable* stays distinct from *presently current* — an observation of a sentence does not become false when the sentence is later edited |
| R06 | *could not be checked* is a third answer, never the optimistic one — an unreadable present state must not report agreement |
| R09 | a record written **before** a passage proves only that it began; it must never be read as proof it completed |
| R10 | byte-identical content, opposite admissibility — the gate reads who is present, never the text |
| R11 | a standing preference **keeps material back**; it does not delete it, deny it, or bar it permanently |

We ran the corpus construction under six mechanical laws — one perturbation per
pair, no vocabulary leakage into stimuli, repository-derived answer keys,
balanced presentation order, alias tests separated from structural tests, and
graded evidence standing. They are enforced by a validator, not by discipline.
It currently reports 0 failures on 48 pairs.

---

## 4 · The ladder, and where the two programmes meet

```
RELATIONAL OPERATOR
        ↓
1  behavioural discrimination      ← we have this now
        ↓
2  vocabulary invariance           ← we have this now
        ↓
3  representational discrimination ← needs your instrumentation
        ↓
4  causal intervention / ablation  ← needs your instrumentation
        ↓
5  longitudinal transformation     ← the long game
```

Our own earlier research draft started at 3–5 and had no controlled substrate for
1–2. The corpus supplies the missing floor: **a controlled vocabulary of relational
invariants that could serve as the things whose representations get measured.**

⭐ The control structure matters more than the flip rate. A model that changes its
answer whenever *any* word changes will score well on relational perturbation
alone. Our paraphrase controls — same relation, different wording, answer must
**not** move — are where that model dies. We think both numbers must be reported
or neither means anything.

---

## 5 · The four things we would ask of you

1. **Are these legitimate candidate invariants, or are we conflating levels?** The
   answer we most want to hear, if it is the true one, is *"you are mixing
   architecture with representation."* We would rather learn that now.
2. **Help us adapt your perturbation methodology.** We have 48 pairs and a 2×2
   control matrix. We would like it reviewed before it grows.
3. **Instrument latent space on controlled relational pairs.** Does changing a
   relation while holding the payload constant produce systematic structure —
   directions, subspaces, manifolds, trajectories?
4. **Compare the two layers.** Does explicit relational scaffolding select for more
   coherent internal relational geometry, *without retraining the underlying
   model?*

That fourth question is the one we find most interesting, and it separates cleanly
into two experiments that should not be run as one:

```
E1   does relational scaffolding  →  different internal reasoning geometry?
E2   can that discovered geometry →  be trained directly?
```

---

## 6 · The failure test

We hold ourselves to naming, in advance, what result would sink the proposal.

> **If models flip their answers on paraphrase controls as often as on relational
> perturbations, the corpus is measuring surface sensitivity rather than relational
> encoding — and the bridge fails at level 1, before any representational question
> is reached.**

A second, subtler failure: if the operators turn out to be separable only for the
four with runtime or harness standing, and not for the eight that are contract-only,
then what we have found is a property of our test construction rather than of
relational structure. We would report that.

---

## 7 · What we think is genuinely interesting here

Not that we built an elaborate architecture. Architectures are cheap.

**These distinctions were load-bearing before anyone proposed measuring them.**

Provenance became three orthogonal axes because a single scalar let authorship hide
inside epistemic class. Historical recovery is type-separated from present location
because a fuzzy match would let a quotation drift. Our disclosure boundary returns
permission without executing the crossing, because otherwise an audit could not tell
authorization from action. Our receipts have *attempted* and *crossed* and
deliberately no *withheld* state — because that would assert a negative the database
cannot prove.

None of these were chosen to produce a result. They were each the minimum refusal of
a specific failure. If distinctions arrived at that way turn out to correspond to
measurable representational structure, that is a more interesting finding than if we
had designed them to.

And if they don't, we would like to know that too — which is why the failure test is
in §6 and not in a footnote.

---

*Soullab · MAIA/AIN · the corpus, its validator and its answer-key provenance are
available for review.*
