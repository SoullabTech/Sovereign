# RGR-03 — Falsification Contract

**Programme:** RELATIONAL-GEOMETRY-REASONING
**Gate:** RGR-03
**Hypothesis:** H-RT1 — RELATIONAL TRANSFER
**Status:** CANDIDATE · PRE-EMPIRICAL · NO BENCHMARK AUTHORIZED
**Date:** 2026-09-18

---

# 0 · Purpose

This contract defines, before any benchmark exists, the conditions under which a future experiment may legitimately support, fail, or remain unable to resolve H-RT1.

Its purpose is to stop these moves:

~~~text
weak result
→ redefine metric

failed control
→ call it exploratory

surface leakage
→ call it relational transfer

one favorable formalism
→ declare geometry

benchmark failure
→ reinterpret as support
~~~

None are admissible.

---

# 1 · Primary hypothesis under test

H-RT1 states:

> When surface features change while a formally declared relational rule is preserved, a relation-aware representation should exhibit preregistered held-out transfer advantage over a matched surface-only baseline; that advantage must be disrupted when the relational rule is broken while relevant surface statistics are preserved.

Support requires both:

~~~text
RELATION-PRESERVING TRANSFER
AND
RELATION-BREAKING SENSITIVITY
~~~

---

# 2 · Required causal separation

Any future benchmark must define an abstract generator:

\[
x=G(s,r,\eta)
\]

with:

~~~text
s = declared surface variables
r = declared relational structure
η = nuisance variables
~~~

The benchmark must make it possible to intervene on surface and relation separately enough to construct:

1. same relation / changed surface;
2. changed relation / matched surface.

If this cannot be done, the benchmark is invalid for H-RT1.

---

# 3 · Preregistration lock

Before empirical execution begins, a later authorized gate must freeze:

- the **single primary relation family** for that experiment, including admissible relation values and target rule \(q_*\);
- the surface specification \(\Sigma_*\);
- dataset or generator version;
- surface variables;
- nuisance variables;
- train domains;
- validation domains;
- held-out test domains;
- model classes;
- baseline classes;
- preprocessing;
- optimization budget;
- primary metric;
- minimum meaningful effect threshold;
- uncertainty rule;
- leakage tests;
- negative controls;
- stopping rule;
- replication rule.

After the lock:

> changing any item that can materially alter the interpretation creates a new experiment version.

The previous result remains preserved.

---

# 4 · Primary contrast

Define:

\[
\Delta_{transfer}=M(F_R)-M(F_S)
\]

where:

- \(F_R\) is the preregistered relation-aware candidate;
- \(F_S\) is the preregistered surface-only comparator;
- \(M\) is the primary held-out transfer metric.

Support requires:

\[
\Delta_{transfer}>\delta_{min}
\]

under the preregistered uncertainty rule.

The numerical \(\delta_{min}\) must be chosen in the future benchmark-design gate before final evaluation and justified from the metric scale, expected measurement noise, practical consequence, or another task-relevant rationale.

RGR-03 deliberately does not impose one universal numeric threshold across different task families.

---

# 5 · Required control matrix

A valid future test must include all four logical cells.

| Surface | Relation | Purpose |
|---|---|---|
| familiar/matched | preserved | in-domain competence control |
| changed/held-out | preserved | positive relational-transfer test |
| matched | broken/changed | relation-breaking sensitivity test |
| changed | broken/changed | hardest joint-shift control |

The exact operational meanings of "matched" and "changed" must be preregistered.

---

# 6 · Surface-only baseline law

The surface comparator is a **preregistered baseline suite**, not a deliberately weak strawman.

The suite may use information designated as surface and must be tuned using training/validation data only. The strongest valid preregistered surface-only result governs the primary surface comparison.

No universal accuracy percentage is imposed, because such a threshold would be arbitrary across task families.

The future gate must justify that \(F_S\) is a serious attempt to exploit:

- entity identity;
- style;
- vocabulary;
- appearance;
- position if surface;
- nuisance correlations;
- ordinary similarity;
- any other non-relational cue the benchmark permits.

If a stronger surface baseline later eliminates the effect, the stronger result governs the scientific standing.

## Same-information generic comparator

A future test must also include or justify an unrestricted same-observation comparator \(F_G\) that receives the same raw instance \(x\) as the relation-aware candidate. This protects against an "extra information" interpretation.

Neither \(F_R\) nor \(F_G\) may receive the target relation label, oracle latent relation identity, or another direct target-revealing variable unavailable under the frozen information-access contract.

If \(F_G\) matches \(F_R\) while both pass the relation-breaking control and beat the surface-only suite, H-RT1 may still be supported as a claim about transferable relational information. It would **not** support a claim that an explicit relational architecture is necessary.

---

# 7 · Relation-aware baseline law

The first relation-aware system should be the **simplest adequate relational model**, not the most elaborate available geometry.

Adequate means that, before held-out test inspection, the candidate satisfies the frozen information-access contract and reaches the preregistered in-domain competence floor. The competence floor and selection procedure must be fixed before final test evaluation.

Reason:

> H-RT1 tests whether relational information matters, not whether a favored RGR formalism wins.

Therefore RGR-04/RGR-05 must resist beginning with a Grassmann or sheaf construction if a simpler explicit relational operator or graph representation can test H-RT1.

---

# 8 · Negative controls

At minimum, a future benchmark must include:

## NC1 · Relation-label permutation

Destroy the relation-label mapping while preserving other benchmark statistics as much as possible.

Expected result:

~~~text
claimed relational transfer
→ collapses toward preregistered null behavior
~~~

## NC2 · Relation-breaking intervention

Change relation while matching declared surface statistics.

Expected result:

~~~text
relation-aware prediction
→ changes appropriately
~~~

## NC3 · Surface leakage probe

Where feasible for synthetic generation, the benchmark should enforce counterbalancing/factorial construction so the designated surface variables do not identify the target relation class by construction.

It must additionally train/evaluate a diagnostic using only declared surface/nuisance variables and apply a preregistered residual-dependence/leakage threshold.

If the design contract itself fails—such as leakage above the frozen validity threshold—the result is BENCHMARK_INVALID. If the design remains valid but a competing explanation cannot be resolved because of limited precision or model ambiguity, the result is UNDERDETERMINED.

---

# 9 · Leakage classes

The future benchmark must actively test at least these leakage modes and record a **surface-definition audit** showing how each designated surface variable was separated from \(q_*\):

- entity overlap;
- lexical overlap;
- template overlap;
- visual-style correlation;
- position correlation;
- class imbalance;
- output-format cues;
- sequence-length cues;
- nuisance ordering;
- train/test duplicate structures;
- generator seed leakage;
- filename/index leakage;
- relation-label frequency artifacts.

A benchmark is not clean merely because leakage was unintended.

---

# 10 · Capacity and optimization confounds

If \(F_R\) has substantially more capacity or privileged supervision than \(F_S\), the interpretation must distinguish:

~~~text
relational information advantage
from
capacity / supervision advantage
~~~

Required future preregistration/reporting includes:

- parameters or effective capacity;
- supervision available;
- information-access parity;
- optimization steps;
- compute-budget envelope;
- search budget;
- early-stopping rule;
- data augmentations.

RGR-03 does **not** require identical parameter counts or GPU-hours across unlike architectures; that can itself create unfairness. It requires a defensible preregistered budget policy and enough sensitivity analysis to rule out gross resource asymmetry as the explanation.

If a matched or stronger non-relational comparator removes the effect, H-RT1 is not supported by the original comparison.

---

# 11 · Formalism-neutrality test

A benchmark fails RGR-03 discipline if its data representation effectively encodes the solution in the native language of one candidate formalism.

Examples of invalid favoritism could include:

- giving graph edges directly only to the graph candidate while denying equivalent relation information to comparators;
- constructing fixed-dimensional subspace labels specifically to reward Grassmann distance;
- constructing local stalk/restriction-map ground truth only to reward sheaf methods;
- defining success as recovering a geometry used to generate the dataset.

The future benchmark may contain structure.

It may not make one formalism true by construction and then call recovery independent evidence.

---

# 12 · Statistical or uncertainty rule

RGR-03 does not prescribe one inferential school.

A future gate may use:

- confidence intervals;
- bootstrap intervals;
- Bayesian posterior criteria;
- randomization tests;
- permutation tests;
- another justified uncertainty method.

But it must be fixed before final evaluation.

The rule must distinguish:

~~~text
statistically detectable
from
practically meaningful
~~~

Hence the separate \(\delta_{min}\) requirement.

---

# 13 · Replication law

A SUPPORT disposition cannot rest on one favorable stochastic run.

The future benchmark must preregister an appropriate replication rule, which may include:

- multiple random seeds;
- independently generated synthetic test sets;
- multiple held-out surface domains;
- alternate relation families;
- independent reimplementation.

RGR-03 does not choose the replication count.

It requires the count/rule to be frozen before final evaluation.

---

# 14 · Interpretation table

| Observed pattern | Standing |
|---|---|
| relational model beats surface baseline; relation-break control passes; leakage controls clean | candidate SUPPORT, subject to all preregistered criteria |
| relational model does not beat meaningful threshold | NOT_SUPPORTED |
| surface baseline matches relational model | NOT_SUPPORTED or UNDERDETERMINED, depending on design |
| relation-break control fails | NOT_SUPPORTED for claimed relational use |
| preregistered leakage/design-validity condition fails | BENCHMARK_INVALID |
| benchmark remains valid but live competing explanations cannot be resolved | UNDERDETERMINED |
| positive result does not replicate | REPLICATION_FAILED |
| generator cannot separate surface/relation interventions | BENCHMARK_INVALID |
| graph relation model works but geometric enrichments add nothing | H-RT1 may survive; geometry claim does not |
| no relation-aware family transfers | H-RT1 NOT_SUPPORTED for tested task family |

---

# 15 · No rescue law

After a preregistered test, the following are forbidden as ways to preserve a SUPPORT claim:

- replacing the primary metric with a secondary metric because it looks better;
- reducing \(\delta_{min}\);
- dropping a failed control;
- relabeling surface variables as relational post hoc;
- changing test domains;
- excluding failed seeds without preregistered grounds;
- adding a new model after inspecting the test set and treating it as confirmatory;
- interpreting benchmark invalidity as evidence for deeper relational complexity.

Exploratory follow-up is allowed only as a **new Work Unit / new experiment version**.

---

# 16 · Programme-level falsification

RGR-03 distinguishes task-level failure from programme-level failure.

A single negative benchmark does not prove all relational structure irrelevant.

For RGR-03, programme shrinkage has one concrete meaning: a clean NOT_SUPPORTED result removes that preregistered relation-family instantiation as evidence for escalation to richer geometry. It may be studied again only as a new version with an explicit reason, not silently rescued.

Repeated clean failures across separately preregistered relation families should reduce confidence in the broader RGR programme. RGR-03 does not set a universal programme-termination count; if the programme reaches that stage, a later governance act must define the stopping rule before further confirmatory testing.

The programme may not indefinitely respond to negative evidence by inventing more elaborate geometry.

---

# 17 · Geometry-specific restraint

Even if H-RT1 is SUPPORTED:

~~~text
RELATIONAL TRANSFER
does not imply
GEOMETRIC NECESSITY
~~~

A geometric candidate earns separate support only if it later improves something beyond simpler relational structures, such as:

- transfer;
- robustness;
- sample efficiency;
- calibration;
- interpretability;
- compositionality;
- local-to-global consistency.

Those claims require later gates.

---

# 18 · Human-meaning restraint

Even if H-RT1 is SUPPORTED on synthetic tasks:

~~~text
synthetic relational transfer
does not imply
human lived meaning is governed by the same relation
~~~

No human/clinical/spiritual interpretation is licensed by RGR-03.

---

# 19 · Elemental restraint

No RGR-03 result can support:

- Fire;
- Water;
- Earth;
- Air;
- Weather;
- Spiralogic;
- Elemental Alchemy.

The Elemental hypothesis remains separately closed.

A future benchmark-design gate must audit all target labels, latent rule identifiers, and generator taxonomies and confirm that none is derived from Fire, Water, Earth, Air, Weather, Spiralogic state labels, or Elemental transformation operators.

---

# 20 · Gate standing

This falsification contract is complete when:

- H-RT1 is stated;
- H0-RT1 is stated;
- surface/relation interventions are required;
- positive and negative controls are required;
- meaningful-effect threshold must be preregistered;
- leakage diagnostics are mandatory;
- no-rescue rules are explicit;
- allowed outcomes include negative and invalid results;
- RGR-04 remains closed.

RGR-03 does not authorize empirical execution.
