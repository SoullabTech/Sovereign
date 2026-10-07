# RGR-05B — Benchmark Design Rationale

**Date:** 2026-10-07
**Parent:** RGR-05B Synthetic Flow Representation Benchmark
**Standing:** DESIGN RATIONALE · NON-RUNTIME

---

## 1 · Why the benchmark is topology-preserving

If the graph changed every time the target changed, a model could solve the task by recognizing static relational motifs.

RGR-05B therefore makes its strongest counterfactual family preserve:

- graph topology;
- source/sink;
- carrier;
- pulse schedule;
- global edge-attribute multiset;

while moving the exact same passage conditions to different relational locations.

The target changes only because the **configuration of passage through the same relational structure** changes.

That is much closer to the claim RGR-05B actually wants to test.

---

## 2 · Why carrier is synthetic

The carrier names K0 and K1 are deliberately meaningless.

This prevents the benchmark from importing:

- biological semantics;
- psychological semantics;
- Elemental semantics;
- spiritual semantics.

The only thing the model can learn is how a typed carrier interacts with typed passage conditions.

---

## 3 · Why pulse patterns have equal mass

If one rhythm injected more total quantity, the model could solve the rhythm counterfactual from total mass.

All four patterns sum to 1.

Therefore rhythm matters only through timing relative to:

- transit delays;
- held stock;
- horizon.

---

## 4 · Why F_G receives the same information

RGR-05A has already accepted FLOW_D architecturally.

RGR-05B must not manufacture a computational win by withholding dynamic information from the generic comparator.

F_G therefore receives the same:

- topology;
- carrier;
- pulse;
- edge attributes;
- source/sink;
- task specification.

If F_G learns the task equally well, that is a legitimate and useful result.

---

## 5 · Why there is still a static negative control

The static/marginal baseline answers a different question:

> does edge-local and time-local information actually matter?

It is intentionally unable to distinguish topology-preserving CF-3 pairs.

Its role is diagnostic, not the primary scientific comparator.

---

## 6 · Why Task B is separate

"Return" is conceptually important to Flow, but combining delivery and return into one label would make interpretation muddy.

RGR-05B therefore keeps:

~~~text
delivery
≠
return/completion
~~~

A model may be good at outward transport and poor at completing a circulation.

The benchmark should be able to discover that.

---

## 7 · Why this is not a physics claim

The equations define a synthetic process.

Terms such as:

- conductance;
- resistance;
- carrier;
- stock;
- pulse;

are operational labels inside the benchmark.

They do not assert that psychological, spiritual, biological, or linguistic flows obey these equations.

Cross-domain application requires a separate mapping and evidence.

---

## 8 · Why this still matters for AIN

If explicit FLOW_D representation improves held-out transfer, AIN gains evidence that preserving:

- carrier type;
- direction;
- local passage condition;
- rhythm;
- trajectory;
- return;

as an integrated object can improve computation, not merely explanation.

If it does not, FLOW_D can still remain the common architecture that keeps domains:

- interpretable;
- governable;
- provenance-aware;
- standing-aware;
- mutually comparable without semantic collapse.

Both outcomes are informative.
