# RGR-05B — Synthetic Flow Representation Benchmark, repair R1

**Date:** 2026-10-07
**Standing:** REPAIR CANDIDATE — NOT FOUNDER ADJUDICATED; DESIGN ONLY
**Class:** C — documentary research design and contract checks
**Programme:** RELATIONAL-GEOMETRY-REASONING
**Benchmark version:** RGR-FLOW-SFRB-01-R1
**Original reviewed commit:** 7f00d4ee2ba174a0e7245dd11dc9c64f16701a4d
**Lineage parent, not a claim of canonical merge:** 6eb1396912162501982a26d8a105ed165a5f96bd
**Accepted architectural object:** FLOW_D — first-class derived dynamical object
**Primitive #11:** NOT EARNED
**Runtime authority:** NONE
**Member-facing authority:** NONE

## 0. Authority, preservation, and actual standing

The Founder accepted RGR-05A and opened RGR-05B on 2026-10-07. The subsequent instruction to continue after the RETURN review authorizes this bounded design repair and read-only review. It does not accept the repaired design in advance.

R0 remains recoverable at the exact original reviewed commit. The original review and raw independent model critiques are retained; no failed result is erased. R1 deliberately replaces some design choices before any benchmark materialization or training. The change register is in the accompanying rationale.

Only the four existing RGR-05B paths may change. This document and its machine-readable design contract are proposed choices, not an executed experiment, a completed reproducibility claim, or a mechanically ratified JARVIS lifecycle transition. No model performance has informed this revision.

No benchmark data generation, simulator execution, model implementation/training/evaluation, private data use, MAIA change, production schema/migration, merge, or deployment is authorized here. Simple arithmetic and documentary contract checks are permitted; they are not benchmark results. RGR-05C and RGR-05D remain closed.

## 1. A narrower, testable claim

**H-GT1:** On the declared synthetic process and template-held-out distribution, the specified ordinary graph-temporal learner F_F exceeds the specified generic token learner F_G by more than five balanced-accuracy percentage points, while meeting competence, counterfactual, and invariance requirements.

This tests the **combined declared graph-temporal inductive bias**: directed local computation, delay queues, recurrence, and layer interfaces. It does not isolate a unique computational contribution of the name FLOW_D. F_F is an ordinary temporal-relational architecture used to instantiate the Flow design. Neutral renaming of this same architecture is not a new comparator or a new algorithm. No novelty or irreducibility claim is licensed.

Both learners receive the same raw information. Their computation, parameter counts, and optimization landscapes are intentionally different and must be reported. Equal configuration counts are not equal compute. This is a bounded comparison of those families under the declared training protocol, not superiority over every generic architecture.

An absent superiority result, practical equivalence, and an inconclusive interval are distinct outcomes. FLOW_D's accepted design role survives any of them; its utility outside this experiment remains an open engineering question, not a benefit proven by definition.

## 2. Tasks and raw quantities

**Task A — DELIVERY** is primary: D_A >= 3/5 by inclusive horizon H_A = 10.

**Task B — RETURN** is a separate secondary task: D_B >= 3/10 by inclusive horizon H_B = 18. Outbound arrival is converted once into 3/4 return quantity plus 1/4 absorbed loss. Delivery and return have independent models, data, metrics, and dispositions.

Each directed graph has eight nodes and ten edges. Carrier kappa is K0 or K1, with no psychological, physical, or Elemental semantics. Each edge e has:

~~~text
p_e(K0), p_e(K1) in {0, 1/2, 1}
c_e in {1/4, 1/2, 3/4, 1}
r_e in {0, 1/4, 1/2}
d_e in {1, 2, 3}
a_e(kappa) = p_e(kappa) * c_e * (1-r_e)
~~~

Only a_e and d_e affect the transport dynamics. In particular, c=1/2,r=0 and c=1,r=1/2 are indistinguishable at fixed p. The benchmark **cannot establish separate learned meanings of conductance and resistance**. Raw fields remain typed for provenance and an effective-coefficient-preserving invariance control.

Pulse codebook at integer times 0,1,2,3:

~~~text
P0 = [1,   0,   0,   0]
P1 = [1/2, 1/2, 0,   0]
P2 = [1/2, 0,   1/2, 0]
P3 = [1/4, 1/4, 1/4, 1/4]
P4 = [1/2, 0,   0,   1/2]
P5 = [0,   1/2, 1/2, 0]
~~~

All have mass one. P4 and P5 also have mean injection time 3/2, and their cumulative injection curves cross. Only P4/P5 form confirmatory rhythm counterfactuals. P0–P3 remain ordinary-population inputs and descriptive diagnostics; R0's ordered-pulse pair claim is withdrawn. Crossing curves do not prove that both label orientations exist under the constrained graph law. That feasibility remains to be established before training.

## 3. One explicit transport clock

All graph, attribute, and delay choices are constant during an example. Use exact rational arithmetic for target computation and equality audits; model inputs may be float32. There is no tolerance band around either target threshold: equality belongs to class one.

For every layer maintain residual node stock B_v, arrival queues Q_e[u] indexed by arrival tick u, and absorbing counters. All start at zero. For each tick t from zero through the task horizon H, perform this order:

1. Remove every queue entry due at t and deliver it to its destination. Nonterminal arrivals enter that layer's node stock. Terminal arrivals are handled immediately as below; they never enter dispatchable terminal stock.
2. **Task A:** add outbound-sink arrivals to D_A. **Task B:** add return-layer arrivals at the original source s to D_B; for each newly arriving outbound-sink quantity q, add q/4 to permanent loss L and schedule 3q/4 in a turnaround buffer U[t+1]. Do not turn around accumulated historical sink totals again.
3. Release the already-due U[t] into the return-layer node t. This is separate from newly created U[t+1]. Add external pulse P(t) to outbound node s when t is 0–3; inject nothing externally into the return layer.
4. If t equals H, score the absorbing counter and stop without dispatching. Otherwise take a simultaneous snapshot of all nonterminal stocks. For each nonterminal v and outbound edge e=(v,w) in that layer, dispatch

~~~text
A_v = sum_{e in Out(v)} a_e(kappa)
y_e(t) = B_v * a_e(kappa) / max(1,A_v)
B_v_next = B_v - sum_{e in Out(v)} y_e(t)
Q_e[t+d_e] += y_e(t)
~~~

All edge dispatches use the same pre-dispatch stock snapshot. Since d_e>=1, nothing dispatched at t can be received at t. A nonterminal with no outgoing edges simply retains stock. Terminal nodes never dispatch. An arrival on tick H counts; an arrival later does not.

Task B uses distinct outward and return stocks and queues on two layer-tagged graphs. The outward layer continues through H_B; it is **not** cut off at H_A. Outward and return processing overlap. The original source is absorbing only in the return layer; t is absorbing/turning only in the outward layer.

After each completed tick, including the final no-dispatch tick, the exact conservation identities are:

~~~text
Task A: injected_so_far = node_stocks + future_in_transit + D_A
Task B: injected_so_far = stocks_in_both_layers + future_in_transit_both_layers
                         + pending_turnaround + L + D_B
~~~

Queues and buffers beyond the horizon remain in the conservation accounting. Dispersion or retained stock is not unexplained loss. These are obligations for a later independent reference simulator, not claims that one has been run.

## 4. Graph universe and split identity

For an outward graph, begin with ordered labels 0..7, s=0 and t=7. Draw ten distinct pairs uniformly without replacement from the 28 pairs u<v, and reject unless the graph is weakly connected, has at least two directed s-to-t paths, and has at least two edges on no s-to-t path. These last edges define distractors precisely. s has zero indegree and t zero outdegree by construction. No direct-edge prohibition is added.

A return graph is drawn independently by the same rule with t as its source and s as its sink, using the reversed order of the initial labels. It satisfies the same two-path and two-distractor conditions. Task B therefore has two separately acyclic layers, not one DAG containing a directed round-trip cycle.

A **template root** is topology plus source/sink roles, without carrier, pulse, or attributes. For Task A, canonicalize by fixing s to 0 and t to 7 and taking the lexicographically smallest row-major 8x8 adjacency bit string over all 6! internal-node permutations. For Task B take the lexicographically smallest concatenation of outward and return adjacency strings under the **same simultaneous permutation**. Prefix with task A or B.

All attribute assignments, carriers, pulses, counterfactuals, and coherent relabelings of a template belong to its one root. This intentionally coarse grouping prevents transformed copies crossing splits. It does not purport to identify every pair of different graphs with equivalent transfer functions.

For canonical root string k, let bucket be big-endian SHA-256('SFRB01R1|split|' + k) modulo 100:

~~~text
0..59 TRAIN; 60..74 VALIDATION; 75..89 TEST; 90..99 REPLICATION
~~~

Use the first distinct qualifying roots encountered in the frozen graph stream for each required bucket; keep the encounter order and rejection counts. Required roots per task are TRAIN 1000, VALIDATION 250, TEST 500, REPLICATION 500. No performance-dependent replacement is allowed.

R1 replaces R0's unspecified three-axis combination holdout with **query-marked topology-template holdout**. TEST and REPLICATION are disjoint template populations under the same prespecified sampling law; replication is not proof of transfer to a different human or physical domain. No separate claim of globally unseen node-permutation strings is made. Node permutation is a nuisance transformation within a root, not the unit of data independence.

Before any training, prove root and quota feasibility by a separately authorized bounded generator-validation step. Maximum raw graph draws: 20,000,000 per task. Insufficient roots gives DESIGN_INFEASIBLE_UNDER_FROZEN_BUDGET, not a weakened holdout. No enumeration or graph generation is performed by the present document checks.

## 5. Populations, sampling, and leakage control

**Ordinary population O:** each selected root contributes exactly ten negative and ten positive distinct instances. Draw carrier and pulse uniformly, and each edge tuple uniformly from the Cartesian product in section 2. Reject to the two label quotas. This defines a class-balanced conditional population, not a natural process distribution. Retain all acceptance/rejection counts and original label frequencies. Do not claim that negative cases were excluded.

Maximum ordinary attribute draws: 100,000 per root. Failure to fill both classes is a feasibility failure, not permission to replace a difficult root or change thresholds. O supplies the primary balanced-accuracy metric. Consequently ordinary counts per task are 20,000 / 5,000 / 10,000 / 10,000 for TRAIN / VALIDATION / TEST / REPLICATION.

**Opposite-label challenge population C:** separate roots' additional draws, not the same instances as O. Families A: CF-1,CF-2,CF-3. Families B: CF-1,CF-2,CF-3,CF-6. Per family counts by split: 2000 / 500 / 1000 / 1000 pairs. Half each family's accepted pairs must have base label zero and half base label one. For CF-1 base means K0; for CF-2 base means P4. Thus each named carrier or pulse is positive equally often. Counterfactual siblings and displayed pair order are never model inputs.

**Same-label challenge population N:** same transformations, retained when labels agree. Per family: 1000 / 250 / 500 / 500 pairs, half 00 and half 11. N prevents a strategy of changing the answer whenever a parameter changes from masquerading as understanding.

C and N are declared conditional tests, not unbiased estimates over every possible intervention. Pair retention is allowed to depend on reference labels; model selection and generation may not depend on learned-model predictions. The ordinary O population remains distinct. Withdraw R0's inconsistent claim that every ordinary test example must also be in an opposite-label pair.

Choose roots cyclically in their frozen encounter order. For each family/orientation stratum, at most 10,000 transformation attempts may be tried on a root before moving to the next root. Each root contributes at most ten pairs to any family and population. Maximum total transformation attempts is 2,000,000 per family/population/split. After the cap, an unmet quota yields DESIGN_INFEASIBLE_UNDER_FROZEN_BUDGET. No relaxing balance, replacing roots, cherry-picking easier pairs, or post-result threshold tuning.

Deduplicate within each population and between O,C,N. Keep all variants of any accepted pair together. Before acceptance use the canonical full-instance key under simultaneous node renaming, coherent carrier renaming, and edgewise effective-coefficient equivalence; include pulse, task, and layer roles. Use ordered pairs of such keys to reject duplicate pairs. R0-style mere raw-byte inequality is insufficient. Full-instance equivalence across different topological roots is not claimed.

Random number construction: stateless SHA-256 blocks of UTF-8 `SFRB01R1|seed|task|stream|split|root|counter`. Interpret the first 64 bits as unsigned big-endian. Unbiased finite choices use rejection of values >= floor(2^64/n)*n before reduction modulo n. Fisher–Yates uses these choices. Freeze seeds in the machine-readable contract. Streams GRAPH, ATTRIBUTES, CARRIER, PULSE, PAIR, PRESENTATION, TRAIN_ORDER, MODEL_INIT, LABEL_CONTROL, BOOTSTRAP have disjoint names; no model can see any key, seed, split, root digest, or generator role.

## 6. Counterfactuals and invariances

**CF-1:** same topology, all attributes, and pulse; query K0 versus K1. Balance both opposite-label orientations across every split. On N, balance 00 and 11. Coherent carrier-renaming descendants never become new roots.

**CF-2:** same graph(s), attributes, and carrier; P4 versus P5 only. Equal mass and mean timing, crossing cumulative injection. Require both opposite-label orientations at the frozen quotas or report infeasibility. Retain same-label pairs in N. This is sensitivity to these schedules in a time-invariant synthetic system, not general rhythm recognition or entrainment.

**CF-3:** same topology, source/sink, carrier, and pulse; uniformly permute whole edge tuples. Task B applies this to the outward layer only and keeps its return layer fixed. Exactly preserve each layer's full tuple multiset, including both permeability channels and delay. Reject a no-op permutation.

**CF-6, Task B only:** as CF-3 but permute return-layer tuples, keeping the outward layer fixed.

**CF-4 invariance:** swap carrier names and their permeability channels together. **CF-5 invariance:** coherently permute nodes, edges, and role flags. **CF-7 invariance:** enumerate the finite allowed tuple alternatives with identical two-channel effective coefficients and identical delay; replace every eligible tuple by the next distinct tuple in lexicographic cyclic order. Ineligible tuples remain unchanged. Require at least one nontrivial replacement; otherwise the instance is not eligible for CF-7.

On each validation/test/replication split, select exactly 1000 O instances, 500 per label, for each invariance family, with at most ten per template root. CF-7 eligibility is independent of model performance; insufficient eligibility is a design-feasibility failure. CF-4 uses its unique swap. CF-5 uses a uniform nonidentity permutation. The selected family-specific lists and transformed bytes are frozen before training. Do not use evaluation siblings as training inputs.

A later generator must prove exact target invariance for CF-4/5/7. Report both prediction agreement I_inv and accuracy on transformed inputs; a constant prediction has perfect agreement and does not pass accuracy. Invariant controls do not require architecturally enforcing invariance, and they are not independent examples for uncertainty estimation.

**Shortcut checks:** retain a static baseline with useful marginal information. On opposite-label CF-2,CF-3 (and B's CF-6), its View S is exactly paired-identical, so any deterministic binary predictor has balanced accuracy exactly 1/2 and pair correctness zero. Audit this equality, rather than infer it from weak learned performance. For CF-1, carrier is visible in S, so no paired-identity theorem applies.

On CF-2 separately test a pulse-only lookup classifier and an MLP given pulse, mean injection time, source/sink degrees, and global tuple histograms. Pulse-only balanced orientation gives exactly 1/2 at deterministic evaluation. Temporal/marginal-summary models can legitimately do better; report them rather than deleting useful features. If the summary control exceeds 0.60 pair correctness, CF-2 is flagged SHORTCUT_NOT_EXCLUDED and cannot support the conjunction for architectural superiority. The threshold is a proposed conservative diagnostic, not proof that lower performance excludes every shortcut.

## 7. Identical raw information, explicitly different computation

**View S:** directed topology, layer roles, source/sink flags, query carrier, total pulse mass, and per-layer full edge-tuple histograms. No edge-local tuple assignment, pulse ordering, simulated trace, target, or generator IDs.

**View G and View F:** exactly the same node identities, ordered directed endpoints, layer roles, edge tuples, query carrier, four pulse values with time indices, source/sink flags, horizon and turnaround coefficient. Raw fields are reconstructible from either input. No simulator trace, effective-delivery label, precomputed path quantity, or target-derived auxiliary supervision is supplied to either.

Normalize p,c,r at their native 0..1 values, delay by 3, time by 18 and horizon by 18. Use separate one-hot source and destination endpoint IDs (eight bits each), node IDs (eight bits), carrier (two bits), token type and layer type. Arbitrary edge-list order is not edge direction. Both architectures can access direction through ordered endpoints; no claim that a token learner is incapable of graph reasoning.

Train each task separately. All models train on O plus the member instances of that task's C and N populations, with ordinary unweighted per-instance binary loss; no pair-identity loss. The same data, labels, epoch permutations, and deterministic per-instance node renamings are supplied to all families. No carrier or CF-7 evaluation augmentation is implicitly added to training.

## 8. Proposed model definitions

These definitions must be implemented and source-reviewed before any data materialization; no hidden defaults may be filled in after observing results. A separate execution manifest must name exact library versions, hardware, source hashes, trainable parameter counts, and determinism constraints. A failure to implement the declared model is a return to design, not silent substitution.

**F_S1:** logistic regression on the flattened View S, bias included. L2 strengths 1e-4,1e-3,1e-2,1e-1 selected on ordinary validation balanced accuracy. Use full-batch deterministic L-BFGS, at most 1000 iterations, gradient tolerance 1e-8; nonconvergence is recorded and blocks interpreting that configuration. Feature scalings are fixed by section 7, not test statistics.

**F_S2:** flattened View S -> dense 256 -> ReLU -> 128 -> ReLU -> 64 -> ReLU -> one logit. Dropout zero. Select among the four optimizer settings in section 9. F_S is the preregistered maximum of the separately reported F_S1 and F_S2 test scores, not post-hoc addition of a new baseline.

**F_P (shortcut control only):** pulse one-hot, its mean time, source/sink in/out degrees, and per-layer tuple histograms -> dense 64 -> ReLU -> dense 64 -> ReLU -> logit. Four optimizer settings. F_P has no edge-local assignment. Pulse-only lookup predicts each pulse's majority training label, ties zero.

**F_G:** separate learned linear projections of node, edge, pulse, and global token fields into width w. Task A has eight node, ten edge, four pulse, and one global/readout token. Task B has sixteen layer-tagged node, twenty edge, four pulse, and one global token. Projected token embeddings are summed with learned type embeddings. No positional embedding of token-list position; pulse time and ordered endpoints remain explicit fields.

Use pre-normalized transformer encoder blocks: LayerNorm epsilon 1e-5, four-head full self-attention with learned Q/K/V/output projections and biases, residual addition; LayerNorm then dense w->4w, GELU, dense 4w->w and residual addition. Dropout 0.1 on attention weights and residual branches. A final LayerNorm on the global token feeds dense w->w, GELU, dense w->1. Configurations (blocks,width): (4,128),(6,128),(4,256). No attention mask encodes graph incidence; all nonpadding tokens can attend to all others. Token order is deterministically shuffled by the common presentation stream.

**F_F:** widths 64,128,256. Initialize each layer-tagged node state by a linear embedding of node ID, source/sink flags, layer role, and carrier. Maintain a queue of learned vector messages indexed by destination and arrival tick. For t=0..H, sum due messages at each node, concatenate with its source pulse amplitude, t/18, role fields, and carrier, and update its hidden state with one shared GRU cell per task. At t<H, each edge sends `MLP([updated h_u, raw edge tuple, carrier, layer])`, with one width-w hidden layer and GELU, to destination v at t+d_e. No multiplication by a_e, stock-conservation normalization, or reference transport update is hard-coded.

Task B adds one declared bridge from outward t to return t, with delay one and the raw coefficient 3/4 as an input feature to a separately parameterized width-w message MLP. This bridge is an architectural bias, not access to actual turnaround quantities or arrival traces. No neural hidden vector is asserted to equal physical stock; no nonnegativity or conservation target is trained. Residual node state is learned, not an exact simulation. Terminal outgoing edges are absent by graph construction.

At H, read `[target-layer terminal state, mean of all layer-node states, carrier, horizon/18, turnaround coefficient]` through dense -> w, GELU, dense ->1. The target is outward t for A and return s for B. Dropout 0.1 on message-MLP hidden outputs, none on recurrent state. The delay queues, shared updates, and bridge are explicitly the combined inductive bias being compared.

**Name-control obligation:** the implementation must be executable under neutral temporal-relational naming with identical parameters, forward computation, and outputs. This is a source/identity check, not an extra trained model. A Flow label alone cannot receive scientific credit.

## 9. Training, selection, seeds, and bounds

All neural families use binary cross-entropy with logits, AdamW with beta=(0.9,0.999), epsilon 1e-8, gradient-norm clipping 1.0, batch size 128 (last batch retained), no scheduler, no class weighting, no test-derived feature normalization, float32, and no mixed precision. Learning rates {1e-3,3e-4}; weight decay {0,1e-4}. F_G and F_F each have three architectures times four settings = twelve search configurations.

Use 100 epochs maximum and patience ten. Checkpoint at the highest ordinary-validation balanced accuracy; ties within 1e-12 prefer lower ordinary-validation BCE, then earlier epoch. A patience improvement requires balanced accuracy > previous best +1e-4. Record both the retained best checkpoint and stopping reason. Never reset patience from test or pair metrics.

Run each search configuration with two distinct search initialization seeds. Select by mean ordinary-validation balanced accuracy, then mean BCE, then fewer parameters, then lexicographic configuration ID. Counterfactual results are reported after selection and do not tune it. Do not pool Task A and Task B selection.

Confirm the selected configuration with ten fresh initialization seeds, all retained; no dropping failures or choosing the best seed. Replication retrains the same frozen selected configurations with ten further fresh seeds on the unchanged TRAIN/VALIDATION data, then uses the untouched REPLICATION roots. This tests new test-root and training-seed draws, not independence of the shared training set.

Initialization: Xavier-uniform for linear/input matrices; for each GRU hidden gate use orthogonal initialization; biases zero; LayerNorm gains one and bias zero. Framework source and exact RNG versions are declared before any run. Equal integer seed labels do not make different model families statistically paired. Map each model/task/phase/replicate to a separate MODEL_INIT substream; epoch data ordering is a separate shared stream.

Freeze root generation seed 5107001, attribute seed 5107002, presentation seed 5107003, pair seed 5107004, data-order seed 5107005, label-control seed 5107006, bootstrap seed 5107007. Search labels [1101,1102], confirmation labels [2101..2110], replication labels [3101..3110] identify independent family-specific initialization streams, not public model input.

No new architecture, optimizer search, epoch extension, or fallback is permitted after seeing results. Technical run failures give TECHNICAL_INCOMPLETE and remain in the record; retries require the same frozen inputs and a documented infrastructure cause. Report parameter counts, optimizer steps, total FLOPs estimate, wall time, peak memory and hardware for all families. No practical compute-equivalence or readiness claim is licensed by search-count parity.

## 10. Metrics and uncertainty

For each task, **M** is mean over the ten retained confirmation runs of balanced accuracy on O only. M never pools O with C,N or transformed siblings. A model-family competence gate requires mean ordinary-validation balanced accuracy >=0.85 and at least eight of ten runs individually >=0.85. Both F_F and F_G must pass before a comparative superiority or equivalence disposition is available.

**C_f:** fraction of C pairs with both labels correct, separately for each required family. **N_f:** same calculation on N. **I_f:** prediction agreement on invariant pairs; also report **V_f**, transformed-input balanced accuracy. Classification threshold is logit>=0 for all models, including controls. Do not optimize a threshold.

Root is the data resampling unit. In each of 10,000 bootstrap replicates:

1. Sample the split's template-root IDs with replacement, once, using that same sampled root list for every model, seed, metric and related variant in that replicate. Repeated roots carry all their O,C,N,invariance observations with the corresponding multiplicity. Do not resample siblings independently.
2. Separately for each model family, draw ten initialization-run indices with replacement. Use this family-specific draw for every metric of that family. The ten F_F and ten F_G indices are sampled independently; shared integer labels are not paired seeds.
3. Recompute balanced-accuracy class denominators from the sampled root-weighted observations for each seed; average the ten seed scores. Compute pair ratios within each family, with complete pairs retained. Recompute F_S as max of its two component scores within each replicate. Use the common root draw for all contrasts.
4. If a ratio has no eligible observations or a BA denominator is zero, reject that bootstrap replicate for all models and redraw, at most 100 times; if still invalid, report UNCERTAINTY_UNRESOLVED. A failed interval may not become support.

Take percentile endpoints at 2.5% and 97.5% using linear interpolation. These are **proposed approximate clustered bootstrap intervals**, not a demonstrated finite-sample coverage guarantee or a calibrated TOST procedure. Before result interpretation a separate approved evaluator-validation exercise must check coverage/implementation under known null, margin, and clustered-dependence fixtures; it may not tune thresholds from benchmark outcomes. If validation fails, no confirmatory label is assigned. The same frozen method applies to replication.

All superiority support requirements are conjunctive; no cherry-picked family or task may substitute for another. Task B remains secondary and cannot rescue Task A. Marginal intervals are reported for transparency; the document does not promise simultaneous coverage of every interval or all future hypotheses.

## 11. Numerical gates and deterministic disposition order

For task A require CF-1,CF-2,CF-3. For task B require CF-1,CF-2,CF-3,CF-6. Invariant families for both tasks are CF-4,CF-5,CF-7.

Define performance qualification Q(m) for a dynamic family m as all of:

~~~text
competence gate in section 10 passes
L95 M(m) > 0.80
L95 [M(m)-M(F_S)] > 0.10
for every required opposite-label family: L95 C_f(m) > 0.75
for every required same-label family: L95 N_f(m) > 0.75
for every invariant family: L95 I_f(m) > 0.95 and L95 V_f(m) > 0.80
~~~

Let Delta = M(F_F)-M(F_G). Apply this order separately to primary TEST and secondary-task TEST:

1. **BENCHMARK_INVALID / DESIGN_INFEASIBLE_UNDER_FROZEN_BUDGET / TECHNICAL_INCOMPLETE:** corresponding gate fails. Report its actual cause before discussing performance.
2. **UNDERDETERMINED:** uncertainty validation fails, either dynamic family fails competence, or a stipulated unresolved compute/implementation violation prevents the declared comparison. F_G incompetence never licenses F_F superiority.
3. **GRAPH_TEMPORAL_ADVANTAGE:** Q(F_F), L95 Delta > 0.05, all controls pass, and CF-2 shortcut exclusion is not flagged. Q(F_G) is not required here, but its competence is.
4. **PRACTICALLY_EQUIVALENT_ON_DECLARED_METRICS:** Q(F_F) and Q(F_G), L95 Delta > -0.05 and U95 Delta < +0.05, and for every C_f,N_f,V_f contrast the entire interval is inside (-0.05,+0.05); for every I_f contrast the entire interval is inside (-0.02,+0.02). This is bounded task/metric equivalence under the validated interval rule, not “specialization never needed.” Boundary equality is inconclusive.
5. **GENERIC_ADVANTAGE:** Q(F_G), U95 Delta < -0.05, and controls pass.
6. **NOT_SUPPORTED_AT_PREREGISTERED_GATE:** both reach competence but any required F_F quality metric has U95 at or below its threshold, or a demonstrated shortcut/control failure prevents the intended interpretation. State which gate; do not infer universal absence of value.
7. **INCONCLUSIVE:** remaining cases, including intervals spanning the practical margin. Failing to establish superiority alone does not establish equivalence or absence of an effect.

A support/equivalence/advantage label is initially PROVISIONAL_TEST_RESULT. Only the **same disposition and all its required gates** passing on REPLICATION yield the corresponding REPLICATED label. A different disposition yields REPLICATION_FAILED_FOR_ORIGINAL_CLAIM; both result sets remain visible. Task B prefixes all labels with RETURN and repeats the complete rules rather than inheriting Task A success. Primary Task A failure is never hidden by Task B success.

Thresholds are preregistered engineering choices, not measured truths: 0.80 absolute competence beyond chance; 0.75 both-member correctness; five-point practical BA/accuracy differences; two-point invariance differences. Their power and feasibility are not claimed established. Reporting wide intervals is preferable to reducing the thresholds later.

## 12. Controls and pre-execution stop list

Train an F_F and an F_G negative-control copy on a deterministic permutation of TRAIN labels, keeping input and training budgets unchanged. Permute across the full training-member population with the LABEL_CONTROL stream; labels are not exposed as input. The mean true-test balanced accuracy must be <=0.52. Exceedance triggers CONTROL_SUSPECT and halts confirmatory interpretation pending investigation. It is not, by itself, mathematical proof of leakage. The fixed original label control and a documented investigation are preserved; no repeated shuffling until one passes.

Source and generator validators must additionally establish: exact conservation, inclusive-horizon clock, simultaneous dispatch, one-time turnaround, target equality convention, raw-view reconstruction parity, CF change isolation, tuple multiset preservation, rational invariances, exact static paired-identity controls, pulse-identity balance, no sibling split leakage, required template counts and pair quotas, bounded sampling, checkpoint/data separation, name-control identity, and library/hardware determinism status.

The documentary Node matrix only checks contract structure, selected analytic equalities, disposition examples, source hashes and repository scope. It contains no transport simulator and proves none of the above generator or performance claims. The absence of new runtime files is not evidence that the wider repository is safe or correct.

## 13. Scope of interpretation and future integration

A supported finding would concern these finite synthetic graphs, numeric ranges, pulse schedules, horizons, model families, sampling distribution and budgets. It would not validate consciousness, subtle energy, physiology, Elemental operators, human development, therapeutic outcomes, or Flow as an eleventh primitive.

Burger/Stone and Elemental Alchemy remain motivating lineages, not benchmark labels or ground truth. Weather remains candidate field modulation. The present synthetic attributes are not a measured Weather field. No scans, manuscripts, dreams, conversations, physiological recordings or member memory enter this benchmark.

A later AIN adapter may be proposed only after specifying its own observable carrier, evidence, permissible inference, consent, and correction behavior. A positive synthetic result does not authorize MAIA Flow Witness, prompting, memory, inference about third parties, or member-facing release.

## 14. Methodological grounding

The repair choices are authored design proposals. External sources support limited methodological distinctions, not this benchmark's validity:

- Battaglia et al., Relational inductive biases, deep learning, and graph networks, https://arxiv.org/abs/1806.01261 — ordinary graph/relational inductive biases; not evidence of a novel FLOW_D algorithm.
- Lakens, Equivalence Tests, https://pmc.ncbi.nlm.nih.gov/articles/PMC5502906/ — failed difference testing is not equivalence; our grouped interval rule is not thereby calibrated by this paper.

## 15. Current standing

~~~text
RGR-05A: CLOSED BY FOUNDER ACT; accepted source unchanged
FLOW_D: FIRST-CLASS DERIVED DYNAMICAL OBJECT
Flow primitive #11: NOT EARNED
RGR-05B-R1: REPAIR CANDIDATE; not Founder-adjudicated
benchmark data: NOT MATERIALIZED
generator/models: NOT IMPLEMENTED
training/evaluation: NOT RUN
MAIA runtime: UNCHANGED BY THIS LANE
member-facing authority: NONE
merge/deploy: NOT AUTHORIZED
~~~

Next: review the exact R1 bytes and record surviving findings. Generator feasibility, evaluator calibration, implementation freeze, training and runtime integration remain separate bounded acts, not implicit consequences of a documentary check.
