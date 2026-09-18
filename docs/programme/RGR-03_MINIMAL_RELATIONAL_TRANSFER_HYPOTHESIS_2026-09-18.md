# RGR-03 — Minimal Relational-Transfer Hypothesis

**Programme:** RELATIONAL-GEOMETRY-REASONING
**Gate:** RGR-03 — MINIMAL FALSIFIABLE RELATIONAL-TRANSFER HYPOTHESIS
**Date:** 2026-09-18
**Status:** CLOSED · FOUNDER ADJUDICATED · HYPOTHESIS CONTRACT PRESERVED
**Canonical base:** b0cc9e5a3a3d65ebd52ac1a578e46a5e45848320
**Governing constitution:** RGR-00
**Upstream:** RGR-01 canonical + CLOSED · RGR-02 canonical + CLOSED

---

# 0 · Gate question

RGR-03 asks one question only:

> **Does relational structure carry transferable information beyond surface similarity?**

RGR-03 does **not** ask:

- which RGR formalism is best;
- whether Grassmann geometry is necessary;
- whether sheaf structure is psychologically real;
- whether lived meaning is geometric;
- whether Spiralogic or Elemental Alchemy is supported;
- whether MAIA should implement RGR.

Those remain downstream or separately closed questions.

---

# I · Why this is the next hypothesis

RGR-00 established the epistemic constitution.

RGR-01 established that:

- relation-first reasoning is independently supported;
- geometric structure can matter in bounded reasoning tasks;
- graph, symbolic, predictive, vector, subspace, and local-to-global alternatives all remain viable;
- no unique geometry of human meaning is established.

RGR-02 established a formalism-neutral relational scaffold:

~~~text
ENTITY / STATE
RELATION
TRANSFORMATION
EQUIVALENCE / INVARIANT
CONTEXT
PERSPECTIVE
TRAJECTORY
BOUNDARY
COMPATIBILITY
OBSTRUCTION
~~~

and preserved four candidate formal families:

~~~text
vector / relational
graph / structural
subspace / Grassmann
local-to-global / sheaf
~~~

RGR-03 therefore tests something logically prior to choosing among them.

If relational structure does not support transfer beyond surface structure, there is no justification for escalating to more elaborate relational geometry.

---

# II · The primary hypothesis

RGR-03 names the primary hypothesis:

## H-RT1 — RELATIONAL TRANSFER

> **For one relation family and one surface/relation decomposition frozen before data generation, when the declared surface realization changes while the declared relational rule is preserved, a non-oracular system capable of representing or inferring relational structure will exhibit a preregistered held-out transfer advantage over the strongest preregistered surface-only baseline; that transferable behavior will change in the preregistered direction when the relational rule is broken while relevant surface statistics are preserved.**

H-RT1 is **task-family bounded**, not universal. RGR-04 must freeze one relation family \(q_*\) and one surface specification \(\Sigma_*\) before final generator/data creation. Support applies only to that preregistered instantiation. A different relation family is a new experiment version, not silent expansion of the same result.

This is one hypothesis with two required halves:

1. positive relational transfer;
2. relation-breaking sensitivity.

Neither half alone is sufficient.

---

# III · Formal objects

RGR-03 uses the RGR-02 vocabulary but does not select one candidate formalism.

Let

\[
s \in \mathcal{S}_{surf}
\]

denote surface variables.

Let

\[
r \in \mathcal{R}_{rel}
\]

denote a relational configuration or rule-bearing structure.

Let

\[
\eta \in \mathcal{N}
\]

denote nuisance or stochastic variables.

A future synthetic generator, if separately authorized, must have the abstract form:

\[
x = G(s,r,\eta).
\]

The exact implementation of \(G\) is not part of RGR-03.

A task-defined relational rule classifier or descriptor is:

\[
q : \mathcal{R}_{rel} \to \mathcal{Y}.
\]

The target \(q(r)\) is a formal task label.

It is not "meaning."

For the first empirical instantiation, the relation family \(q_*\), its admissible relation values, and the surface specification \(\Sigma_*\) must be frozen before generator/data creation. Benchmark designers may not inspect empirical performance and then choose the relation family that works best.

---

# IV · Surface and relation must be interventionally separable

The hypothesis is valid only if a later benchmark can construct at least two classes of controlled interventions.

## A · Relation-preserving surface intervention

Hold the relational rule fixed:

\[
q(r_1)=q(r_2)
\]

while changing surface realization:

\[
s_1 \neq s_2.
\]

Generate:

\[
x_1 = G(s_1,r_1,\eta_1),
\qquad
x_2 = G(s_2,r_2,\eta_2).
\]

The future task asks whether the relation can transfer across the changed surface.

## B · Relation-breaking matched-surface intervention

Hold relevant surface statistics fixed or explicitly matched while changing the relational rule:

\[
q(r_1)\neq q(r_2).
\]

The benchmark must construct a pair or set for which a model cannot succeed merely from the retained surface distribution.

## C · Intervention validity law

If RGR-04 cannot operationally vary surface and relation independently enough to create these controls, the benchmark is invalid for H-RT1.

For synthetic data, RGR-04 must prefer **generator-level balancing or factorial/counterbalanced construction** so designated surface variables do not identify \(q_*(r)\) by construction. It must also preregister an empirical residual-dependence/leakage audit and a failure threshold before final evaluation.

That is a design falsifier, not an inconvenience to be explained away.

---

# V · What counts as surface

Surface is benchmark-defined but must be declared before execution.

Candidate surface variables may include:

- entity identity;
- vocabulary;
- color;
- texture;
- visual style;
- absolute position when not part of the relation;
- lexical token choice;
- names;
- modality-specific attributes;
- nuisance ordering;
- irrelevant background features.

A variable may not be labeled "surface" merely because researchers want the relational model to ignore it.

RGR-04 must justify the decomposition.

---

# VI · What counts as relational structure

Relational structure must be specified using the RGR-02 formal discipline.

At minimum, a future benchmark must declare:

1. entities or states;
2. typed relation or relations;
3. any transformations;
4. the target relation class or invariant;
5. which aspects are preserved under transfer;
6. which aspects are deliberately changed in the relation-breaking control.

Examples of admissible relation families might later include:

- ordering;
- analogy;
- containment;
- symmetry;
- composition;
- graph motif;
- transformation equivalence;
- role structure.

RGR-03 does not select one.

---

# VII · Representation classes remain open

Let

\[
F_R
\]

denote a relation-aware candidate representation or evaluator.

RGR-03 does not specify whether \(F_R\) is:

- vector or relational;
- graph or structural;
- subspace or Grassmann;
- local-to-global or sheaf;
- another simpler relation-aware representation admitted by a later gate.

### Information-access law

\(F_R\) may **not** receive the target relation label \(q_*(r)\), oracle latent relation identity, or another variable that directly reveals the target and is unavailable to fair comparators. It must infer or represent relational structure from the same observable instance \(x\), or from a preregistered label-blind transformation of \(x\).

Let

\[
F_S
\]

denote the strongest preregistered surface-only baseline suite, tuned on training/validation data only.

Let

\[
F_G
\]

denote a same-information generic comparator that receives the same raw observation \(x\) as \(F_R\) but has no privileged relation labels. \(F_G\) is required to distinguish **relational information** from an advantage created merely by extra input access.

H-RT1 does not require \(F_R>F_G\). If \(F_G\) also learns the relation and passes the relation-breaking control, that can still support the existence of transferable relational information. A later formalism-specific gate would be required to claim that explicit relational inductive bias outperforms generic learning.

The primary question is not:

\[
\text{Grassmann} > \text{vector}
\]

but:

\[
\text{relation-aware transfer}
>
\text{surface-only transfer}
\]

under preregistered evaluation rules.

Only after that question survives would formalism-specific selection pressure be warranted.

---

# VIII · The null hypothesis

## H0-RT1 — SURFACE SUFFICIENCY

> **After controlling for benchmark leakage, model capacity, training exposure, and declared nuisance variables, access to explicit relational structure does not yield a practically meaningful held-out transfer advantage over the matched surface-only baseline.**

Operationally, in a future benchmark:

\[
\Delta_{transfer}=M(F_R)-M(F_S)
\]

where \(M\) is the preregistered held-out transfer metric.

The null remains viable if:

\[
\Delta_{transfer}\le\delta_{min}
\]

where \(\delta_{min}>0\) is a minimum practically meaningful effect threshold fixed before empirical execution.

RGR-03 does not choose a numerical value for \(\delta_{min}\).

RGR-04 must preregister it before final evaluation and justify it using the metric scale, expected measurement noise, practical consequence, or another domain-relevant rationale. No universal numerical threshold is imposed by RGR-03.

---

# IX · The alternative hypothesis

## H1-RT1 — RELATIONAL INFORMATION

A future result supports H-RT1 only if all required support conditions are satisfied.

### S1 · Held-out transfer advantage

\[
M(F_R)-M(F_S)>\delta_{min}
\]

under the preregistered uncertainty rule.

### S2 · Surface shift

Positive transfer uses held-out surface realizations not trivially recoverable from training identity.

### S3 · Relation-breaking sensitivity

For a preregistered paired counterfactual \((x,x')\) with matched declared surface variables and changed relation label \(q_*(r)\neq q_*(r')\), the system's output must track the changed relational target under a preregistered counterfactual-consistency metric \(C_{break}\).

RGR-04 must define both \(C_{break}\) and its minimum acceptable threshold \(\kappa_{min}\) before final evaluation. Merely changing confidence or producing any different output does not satisfy this condition.

### S4 · Surface-leakage control

A surface-only model does not reproduce the claimed relational-transfer advantage from confounded features.

### S5 · Label or permutation control

A deliberately broken or permuted relation-label control eliminates the claimed transferable signal to the preregistered null expectation.

Failure of any required condition blocks a SUPPORT disposition.

---

# X · Why relation-breaking sensitivity is mandatory

A model can appear to transfer for the wrong reason:

- surface cues correlate with relation class;
- entity identity leaks across splits;
- output distribution differs by domain;
- lexical templates reveal the answer;
- nuisance variables encode the label.

Therefore:

> **A positive transfer score alone is not evidence of relational representation.**

The future system must also respond appropriately when the relational rule is broken while relevant surface statistics remain matched.

~~~text
same relation + changed surface
→ prediction should remain relation-consistent

changed relation + matched surface
→ prediction should change relation-consistently
~~~

The conjunction is the evidence.

---

# XI · Complexity and fairness constraints

A later test of H-RT1 must not win by giving the relation-aware system unrestricted advantages unrelated to the hypothesis.

RGR-04 must preregister how it will control or report:

- parameter count;
- training examples;
- optimization budget;
- privileged labels;
- hand-coded relation access;
- data augmentation;
- preprocessing;
- external retrieval;
- architecture-specific supervision;
- hyperparameter search budget.

Matched does not necessarily mean identical parameter count.

It means that differences relevant to the causal interpretation are explicitly controlled or reported.

---

# XII · Minimum evaluation law

## Operational definition of transfer

For a preregistered relation family \(q_*\), training and model selection occur only on \(D_{train}\) and \(D_{val}\). Transfer is performance on a held-out \(D_{test}\) whose designated surface support/domain differs according to the frozen surface-shift rule while the relevant relation classes remain defined by the same \(q_*\). No test-domain adaptation is allowed unless explicitly preregistered as part of a different hypothesis.

RGR-03 requires a later empirical gate to preregister all of the following before execution:

1. primary transfer metric \(M\);
2. \(\delta_{min}\), the minimum practically meaningful advantage;
3. uncertainty or confidence procedure;
4. train, validation, and test domain partition;
5. what constitutes held-out surface;
6. relation-preserving intervention;
7. relation-breaking intervention;
8. leakage diagnostics;
9. null or permutation behavior;
10. model-selection procedure;
11. stopping rule;
12. replication or reseed rule if stochastic.

No threshold may be chosen after observing final results.

---

# XIII · Allowed future dispositions

A future empirical test of H-RT1 may return only one of these broad standings.

## SUPPORTED

All required support conditions S1-S5 pass under the preregistered rule.

## NOT_SUPPORTED

The relation-aware candidate fails the preregistered transfer advantage or relation-breaking sensitivity requirements.

## UNDERDETERMINED

The benchmark satisfies its preregistered validity conditions, but the evidence remains unable to distinguish relational transfer from a live competing explanation such as capacity, optimization, insufficient precision, or model-selection ambiguity.

## BENCHMARK_INVALID

A preregistered design-validity condition fails independently of the desired model result—for example intervention separation fails, forbidden leakage exceeds its preregistered threshold, test contamination occurs, or the frozen data/generator contract is violated.

A BENCHMARK_INVALID result cannot be upgraded to UNDERDETERMINED merely to preserve interpretability.

## REPLICATION_FAILED

An initial support result does not survive the separately required replication, reseed, or domain-replication rule.

A result may not be promoted from UNDERDETERMINED to SUPPORTED by narrative interpretation.

---

# XIV · Strong falsifiers

H-RT1 should be treated as failed or unsupported in a later empirical gate if any of the following survive appropriate replication.

## F1 · No transfer advantage

A relation-aware model does not exceed the surface baseline by the preregistered meaningful margin.

## F2 · Surface baseline matches it

A matched surface-only model reproduces the supposed relational transfer.

## F3 · Relation break does not matter

Breaking the relational rule while retaining matched surface statistics does not alter model behavior as predicted.

## F4 · Surface shift kills performance

Performance depends on entity, vocabulary, or appearance identity rather than the preserved relation.

## F5 · Permuted relation labels still work

A relation-label permutation or equivalent negative control retains the claimed advantage.

## F6 · Complexity explains the result

The effect disappears under a defensible capacity or training-budget control.

## F7 · Hidden leakage

Inspection reveals information in surface or nuisance variables that deterministically or near-deterministically identifies the relation class.

## F8 · Bespoke-formalism construction

A claimed relational effect exists only because the task was constructed to match one formalism's privileged representation, while simpler relation-aware alternatives were not given a fair test.

This need not falsify all relational transfer, but it makes the general H-RT1 interpretation underdetermined.

---

# XV · What a positive result would establish

A valid positive result would justify only:

> **For the tested task family, relational structure contains transferable information not adequately captured by the tested matched surface-only baseline.**

It could justify moving toward comparative formalism testing.

It would not establish:

- that meaning is geometric;
- that human meaning follows the benchmark's relations;
- that Grassmann geometry is correct;
- that sheaf theory describes psychology;
- that relational structure is metaphysically fundamental;
- that consciousness is relational geometry;
- that Spiralogic is validated;
- that Elemental Alchemy is validated;
- that MAIA should implement RGR.

---

# XVI · What a negative result would mean

A clean negative result must be allowed to shrink the programme.

## Case A · Surface sufficiency

If strong surface baselines explain transfer, a stronger relation-first claim is unnecessary for that task family.

## Case B · Relation representation fails

If relation-aware representations cannot transfer across surface change, the current RGR direction is weakened.

## Case C · Only structural methods work

If graph or structural methods work but metric or geometric enrichments add nothing, the programme may become primarily Relational Reasoning rather than strongly geometric.

## Case D · Benchmark cannot separate relation and surface

Then no conclusion about H-RT1 is licensed.

A benchmark failure is not evidence for the hypothesis.

---

# XVII · Formalism selection remains downstream

RGR-03 explicitly refuses to rank:

~~~text
VECTOR / RELATIONAL
GRAPH / STRUCTURAL
SUBSPACE / GRASSMANN
LOCAL-TO-GLOBAL / SHEAF
~~~

H-RT1 can later be tested with the simplest relation-aware representation adequate to the benchmark. "Adequate" means it satisfies the frozen information-access rules and reaches a preregistered in-domain competence floor selected before test evaluation; adequacy may not be declared after inspecting held-out results.

The purpose is to determine whether relational structure itself contributes transferable information.

A later gate may ask which representation captures that information most efficiently, robustly, or interpretably.

That is not RGR-03.

---

# XVIII · No Elemental bridge

RGR-03 contains no:

- Fire labels;
- Water labels;
- Earth labels;
- Air labels;
- Weather labels;
- Spiralogic state labels;
- Elemental transformation operators.

The first relational-transfer benchmark must stand independently of the originating Elemental architecture.

RGR-04 must include a generator/label audit enumerating all target labels, latent rule identifiers, and benchmark taxonomies and confirming that none is derived from Fire, Water, Earth, Air, Weather, Spiralogic state labels, or Elemental transformation operators.

Otherwise the benchmark risks validating labels it was designed to recover.

---

# XIX · No human or private data requirement

H-RT1 is intentionally designed so its first valid test can be synthetic.

RGR-03 does not create a justification for:

- member conversations;
- client material;
- PHI;
- clinical records;
- private journals;
- MAIA production memory;
- Sanctuary data;
- personal family material.

Any later human-data programme requires separate ethics and data authorization.

---

# XX · RGR-04 handoff conditions

RGR-03 may hand a hypothesis to a future RGR-04 only if RGR-03 is separately Founder-adjudicated and closed.

A future RGR-04 would be allowed to design—but not automatically execute—a synthetic benchmark constitution satisfying:

~~~text
independent surface / relation interventions
held-out surface domains
relation-breaking matched controls
surface-only baseline
relation-aware baseline
permutation / null controls
predeclared metric
predeclared δ_min
uncertainty procedure
leakage diagnostics
replication law
~~~

RGR-03 does not open RGR-04.

---

# XXI · Candidate conclusion

RGR-03 proposes exactly one primary scientific claim:

> **Relational structure should support transferable prediction across changes in surface realization in a way that cannot be reproduced by matched surface similarity alone, and a valid relational signal should respond specifically to interventions that break the relation while preserving relevant surface statistics.**

This claim can fail.

If it fails cleanly, RGR must become smaller.

If it survives, only then is it worth asking whether richer geometry adds anything beyond simpler relation-aware structures.

---

# XXII · Current standing before independent challenge

~~~text
RGR-00:
CANONICAL + CLOSED

RGR-01:
CANONICAL + CLOSED

RGR-02:
CANONICAL + CLOSED

RGR-03:
HYPOTHESIS CANDIDATE

primary hypothesis:
H-RT1 RELATIONAL TRANSFER

null:
H0-RT1 SURFACE SUFFICIENCY

winning formalism:
NONE

benchmark:
NOT CREATED

empirical execution:
NOT AUTHORIZED

RGR-04:
CLOSED

Elemental Operator hypothesis:
CLOSED

MAIA alteration:
NONE

implementation:
NONE

deployment:
NONE
~~~

The next RGR-03 act is independent adversarial review of the hypothesis contract only.


---

# XXIII · Independent adversarial review and grounded corrections

RGR-03 was reviewed against a frozen hypothesis packet containing:

- RGR-03 Minimal Relational-Transfer Hypothesis;
- RGR-03 Falsification Contract;
- the RGR-00 through RGR-02 governing boundaries;
- explicit instructions to attack falsifiability, leakage, null construction, baseline fairness, post-hoc rescue, and formalism bias.

## Review execution provenance

The first parallel review execution did **not** produce valid final evidence.

### GPT-OSS initial execution

~~~text
provider: gpt-oss-local
model:    gpt-oss:20b
standing: INSUFFICIENT
reason:   concurrent local resource contention; cancelled before semantic output
~~~

No verdict was inferred from the absence of output.

### Qwen initial execution

~~~text
provider: qwen-local
model:    qwen3-coder:30b
standing: INSUFFICIENT
reason:   runaway repetitive output exceeding 60 KB without a bounded final adjudication
~~~

The partial repetitive stream is preserved as execution-failure evidence and is not treated as a substantive review.

A subsequent CLI attempt using an unsupported thinking-control flag failed before model review began and is recorded as a tooling failure, not a model verdict.

The two reviewers were then rerun sequentially against the same frozen semantic packet with bounded output instructions.

---

## A · GPT-OSS bounded review

~~~text
VERDICT: RETURN
~~~

GPT-OSS raised ten distinct findings.

### Grounded corrections incorporated

1. **Relation-family scope**
   - H-RT1 is now explicitly task-family bounded.
   - one relation family q_* and surface specification Σ_* must be frozen before generator/data creation.

2. **No oracle relation-label access**
   - F_R may not receive q_*(r), oracle latent relation identity, or another direct target-revealing variable unavailable under the frozen information-access contract.

3. **Surface/relation leakage audit**
   - synthetic construction should use factorial/counterbalanced design where feasible;
   - residual dependence/leakage must be tested under a preregistered threshold.

4. **Relation-family pre-lock**
   - benchmark designers may not inspect performance and then choose the relation family that worked.

5. **Surface-definition audit**
   - future benchmark design must document how designated surface variables were separated from q_*.

### GPT-OSS suggestions rejected or reframed

**Fixed universal surface-baseline performance percentage**

Rejected as arbitrary across task families.

Replacement:

> use the strongest valid preregistered surface-only baseline suite, tuned on training/validation data only.

**Universal fixed δ_min such as 0.05**

Rejected as scale-dependent and arbitrary.

Replacement:

> δ_min must be fixed before final evaluation and justified from metric scale, noise, practical consequence, or another task-relevant rationale.

**Identical compute or parameter budgets**

Rejected as not necessarily fair across unlike architectures.

Replacement:

> preregister a defensible compute/search/capacity policy and report enough sensitivity analysis to rule out gross resource asymmetry.

**Require an explicit graph-like relational module**

Rejected as FORMALISM-BIAS.

Replacement:

> add a same-information generic comparator F_G and prohibit privileged oracle information.

---

## B · Qwen bounded review

~~~text
VERDICT: RETURN
~~~

Qwen raised ten bounded findings.

### Grounded corrections incorporated

1. **Scope restraint**
   - H-RT1 now applies only to the frozen q_* / Σ_* instantiation.

2. **Operational intervention validity**
   - future benchmark must use generator-level balancing/counterbalancing where feasible plus a preregistered residual-dependence audit.

3. **δ_min justification**
   - preregistration plus rationale is now mandatory.

4. **Counterfactual relation-break behavior**
   - relation-breaking sensitivity now requires a preregistered counterfactual-consistency metric C_break and threshold κ_min.

5. **Fairness controls**
   - information-access parity, training exposure, compute envelope, search budget, augmentations, and supervision must be preregistered/reported.

6. **Outcome separation**
   - BENCHMARK_INVALID now means a preregistered design-validity condition failed;
   - UNDERDETERMINED means the benchmark remained valid but evidence could not resolve a competing explanation.

7. **Adequacy definition**
   - a candidate must satisfy information-access rules and a preregistered in-domain competence floor before held-out interpretation.

8. **Programme shrinkage**
   - a clean NOT_SUPPORTED result removes that preregistered relation-family instantiation as evidence for escalation to richer geometry.

9. **Elemental audit**
   - future generator/label audit must confirm no target or latent taxonomy is derived from the Elemental system.

10. **Operational transfer definition**
    - transfer now means evaluation on a held-out surface domain after training/model selection only on the frozen train/validation domains, with no undeclared test-domain adaptation.

---

# XXIV · Review conclusion

After grounded correction:

~~~text
GPT-OSS:
  final verdict: RETURN
  substantive grounded corrections: incorporated
  arbitrary/formalism-biased prescriptions: rejected with rationale

Qwen:
  final verdict: RETURN
  substantive grounded corrections: incorporated

initial failed executions:
  preserved as INSUFFICIENT
  not converted into semantic verdicts
~~~

The important result is not that the reviewers "approved" H-RT1.

They did not.

They found weaknesses, and the contract was tightened until those weaknesses no longer survive inspection.

No reviewer receives winner authority.

---

# XXV · Candidate standing after challenge

RGR-03 now defines one bounded empirical claim:

> **For one preregistered relation family and surface/relation decomposition, relational structure should support transfer across held-out surface change beyond the strongest valid surface-only baseline, without oracle relation access, and the transferable behavior must track a preregistered relation-breaking counterfactual.**

The hypothesis remains formalism-neutral.

A same-information generic comparator prevents extra-input advantage from masquerading as relational architecture evidence.

A future positive result would support only the tested relation-family instantiation.

A future negative result would block that instantiation from serving as evidence for escalation to richer geometry.

Current standing:

~~~text
H-RT1:
DEFINED

H0-RT1:
DEFINED

surface/relation intervention law:
DEFINED

information-access law:
DEFINED

surface baseline suite:
DEFINED

same-information generic comparator:
DEFINED

counterfactual relation-break metric requirement:
DEFINED

leakage audit:
DEFINED

no-rescue law:
DEFINED

independent adversarial challenge:
COMPLETE

benchmark:
NOT CREATED

empirical execution:
NOT AUTHORIZED

RGR-04:
CLOSED

Elemental hypothesis:
CLOSED

MAIA:
UNCHANGED

deployment:
NONE
~~~

The next legitimate act is Founder adjudication of RGR-03 itself.

No benchmark-design gate is opened by this standing.


---

# XXVI · Founder adjudication — RGR-03 closure

**Founder act:** 2026-09-18
**Accepted RGR-03 candidate:** 1d1fe516e4868892bd755cf2592812cceecd9154

The Founder accepts the RGR-03 Minimal Relational-Transfer Hypothesis package and the recorded evidence.

Accepted standing:

- RGR-00 is canonical and CLOSED;
- RGR-01 is canonical and CLOSED;
- RGR-02 is canonical and CLOSED;
- RGR-03 was opened from canonical b0cc9e5a3a3d65ebd52ac1a578e46a5e45848320;
- the governed RGR-03 Work Unit reached EVIDENCE_READY with its authorized core unchanged;
- only the three authorized RGR-03 hypothesis/research artifacts were created;
- no benchmark was created;
- no empirical experiment was executed;
- no RGR model was implemented;
- no member, client, PHI, Sanctuary, private-journal, production-memory, or other private human data was used;
- no schema, migration, MAIA runtime change, deployment, or production action occurred;
- all sovereignty pre-commit gates passed.

The Founder accepts:

> **H-RT1 — RELATIONAL TRANSFER**

For one relation family and one surface/relation decomposition frozen before data generation, when the declared surface realization changes while the declared relational rule is preserved, a non-oracular system capable of representing or inferring relational structure should exhibit a preregistered held-out transfer advantage over the strongest valid preregistered surface-only baseline; and that transferable behavior must change in the preregistered direction when the relational rule is broken while relevant surface statistics are preserved.

H-RT1 remains task-family bounded rather than universal.

Any future empirical instantiation must freeze before generator/data creation:

~~~text
q_* relation family
admissible relation values
Σ_* surface specification
train / validation / held-out test domains
primary transfer metric M
δ_min
uncertainty procedure
relation-preserving intervention
relation-breaking intervention
C_break
κ_min
leakage diagnostics and thresholds
baseline suite
model-selection procedure
compute/search-budget policy
stopping rule
replication rule
~~~

## Accepted information-access law

The Founder ratifies:

- F_R may not receive q_*(r), oracle latent relation identity, or another direct target-revealing variable unavailable under the frozen information-access contract;
- F_R must infer or represent relational structure from the same observable instance x, or from a preregistered label-blind transformation of x;
- the strongest valid preregistered surface-only baseline suite F_S governs the surface comparison;
- a same-information generic comparator F_G must be included or explicitly justified;
- H-RT1 does not require F_R > F_G;
- if F_G learns the relational rule and passes the relation-breaking controls, that may support transferable relational information but does not establish that a specialized relational architecture is necessary.

## Accepted intervention law

~~~text
same relation + changed surface
→ relational transfer test

changed relation + matched surface
→ relation-breaking sensitivity test
~~~

Where feasible, synthetic benchmark construction must use factorial/counterbalanced generation so designated surface variables do not identify the target relation by construction.

A preregistered residual surface/relation leakage audit is required.

If intervention separation or another preregistered design-validity condition fails:

~~~text
BENCHMARK_INVALID
~~~

If the benchmark remains valid but competing explanations cannot be resolved:

~~~text
UNDERDETERMINED
~~~

## Accepted future support requirements

A future SUPPORT disposition requires all preregistered conditions, including:

1. held-out relational-transfer advantage above δ_min;
2. true held-out surface shift;
3. preregistered counterfactual relation-breaking sensitivity;
4. failure of serious surface-only baselines to reproduce the relational effect;
5. failure of relation-label permutation / negative controls to preserve the claimed transferable signal;
6. clean leakage and validity controls;
7. successful replication under the preregistered rule.

## No-rescue law

A failed preregistered experiment may not be converted into SUPPORT by:

- changing the primary metric after results;
- reducing δ_min;
- dropping a failed control;
- redefining surface and relation after results;
- changing held-out domains;
- excluding failed seeds without preregistered grounds;
- adding a new model after inspecting the test set and treating it as confirmatory;
- treating benchmark invalidity as evidence for deeper relational complexity.

Accepted future empirical dispositions remain:

~~~text
SUPPORTED
NOT_SUPPORTED
UNDERDETERMINED
BENCHMARK_INVALID
REPLICATION_FAILED
~~~

A clean NOT_SUPPORTED result removes that preregistered relation-family instantiation as evidence for escalation to richer relational geometry.

Even a SUPPORTED result would establish only:

> For the tested task family, relational structure contains transferable information not adequately captured by the tested surface-only baseline.

It would not establish:

- that meaning is geometry;
- that human lived meaning follows the synthetic benchmark;
- that Grassmann geometry is correct;
- that sheaf theory describes psychology;
- that consciousness is relational geometry;
- that Spiralogic is validated;
- that Elemental Alchemy is validated;
- that MAIA should implement RGR.

## Review evidence

The accepted review record remains:

~~~text
GPT-OSS bounded review:
VERDICT = RETURN

Qwen bounded review:
VERDICT = RETURN
~~~

The initial failed reviewer executions remain preserved as:

~~~text
INSUFFICIENT
~~~

They are not deleted or promoted into semantic verdicts.

Grounded corrections from both bounded reviews remain part of the accepted hypothesis contract.

Arbitrary or formalism-biased reviewer prescriptions—including universal numeric effect thresholds, mandatory identical compute budgets, or requiring a specific relational module—remain rejected with explicit rationale.

## Canonical freshness standing at adjudication

Current canonical had advanced to:

d39e0421c5ea7de854cfd1e19204cee40a9ec8cb

through MAIA Teaching Intelligence T2 work.

The Founder accepts that there was zero true path overlap between that intervening canonical work and the three RGR-03 artifacts.

## Lifecycle closure

By Founder act, the governed RGR-03 Work Unit has advanced:

~~~text
EVIDENCE_READY
→ ADJUDICATED
→ CLOSED
~~~

with:

~~~text
authorized core: unchanged
review attempts: preserved
verifier evidence: preserved
routing provenance: preserved
~~~

## Successor boundary

This closure explicitly preserves:

~~~text
RGR-04: CLOSED

benchmark creation: NOT AUTHORIZED

empirical execution: NOT AUTHORIZED

Elemental Operator hypothesis: CLOSED

MAIA alteration: NOT AUTHORIZED

RGR implementation: NOT AUTHORIZED

deployment: NOT AUTHORIZED
~~~

No successor gate is opened by this closure.

## Preservation law

The exact accepted RGR-03 hypothesis candidate remains identified by:

1d1fe516e4868892bd755cf2592812cceecd9154

This closure act is a later documentary/lifecycle record layered on top of that accepted candidate. It does not rewrite the accepted hypothesis evidence.

**RGR-03 standing: CLOSED.**
