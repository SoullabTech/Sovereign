# RGR-07 / H-MO1 — Higher-Order Motif Transfer & Representational Necessity

**Programme:** RELATIONAL-GEOMETRY-REASONING
**Gate (proposed):** RGR-07
**Hypothesis:** H-MO1 — HIGHER-ORDER MOTIF TRANSFER
**Date:** 2026-09-23
**Class:** C — documentary candidate charter only
**Status:** CANDIDATE · NOT OPENED · NO FOUNDER ACT · NO WORK UNIT · NO EXECUTION
**Canonical tip at drafting:** `3f63ca65` (`origin/clean-main-no-secrets`)
**Upstream:** RGR-00 … RGR-06 (RGR-06 §14: any next gate requires a separately authorized Work Unit)

---

# 1 · Standing and non-authorization

This document is a candidate charter. It was produced from a design exchange
(2026-09-23) and records the laws that a future RGR-07 Work Unit would have to
inherit or freeze. It confers nothing.

Explicitly NOT authorized by this document:

- opening RGR-07;
- a Work Unit JSON for RGR-07;
- generator implementation, fixture materialization, model implementation,
  training, TEST or REPLICATION;
- any model/provider call;
- any member-data or natural-conversation access (§16);
- any admission of the H1–H6 research results as repository evidence (§19);
- any Elemental, aspect-derived or Spiralogic operator (§2, §20);
- any MAIA cognition change, schema, migration, deployment or production read/write.

Endorsement of this design by any external model contributes zero evidentiary
support to H-MO1. Only a separately governed adversarial act with captured
provenance (RGR-04 §XXXIV pattern) counts as review.

---

# 2 · Inherited RGR law (by reference, never paraphrased)

RGR-07 inherits the following clauses verbatim. Where this charter appears to
restate them, the source clause governs.

| Inherited clause | Source |
|---|---|
| Conjunctive support: RELATION-PRESERVING TRANSFER **and** RELATION-BREAKING SENSITIVITY | RGR-03 §1 |
| Causal separation of surface and relation in the generator | RGR-03 §2 |
| Surface-only baseline is a preregistered suite, not a strawman | RGR-03 §6 |
| Same-information generic comparator law | RGR-03 §6 (F_G), RGR-04 §XXV |
| Capacity and optimization confound reporting | RGR-03 §10 |
| Negative controls NC1 (label permutation), NC2 (relation break), NC3 (leakage probe) | RGR-03 §8 |
| Interpretation table; failed break control ⇒ NOT_SUPPORTED for claimed relational use | RGR-03 §14 |
| No-rescue law | RGR-03 §15, RGR-04 §XXIX |
| Human-meaning restraint | RGR-03 §18 |
| Elemental restraint and membrane | RGR-03 §19, RGR-04 §XXXI |
| Full-information view: no hidden privileged input path for F_R | RGR-04 §XIII |
| Stopping law | RGR-04 §XXVIII |
| Data limits: member conversation not allowed by default | RGR-00 data limits |

The Elemental operator hypothesis remains CLOSED under RGR-04. Nothing in
H-MO1 reopens it. H2b and the H6 aspect-inspired operators belong to a
separate programme with its own prefix and falsification contract (§20).

---

# 3 · H-MO1 — exact hypothesis

> When surface features change while a declared **group-level** relational
> effect and its constituent pairwise relations are preserved, a
> representation that constructs the group-level effect as a first-class
> object from the observable evidence should exhibit preregistered held-out
> transfer advantage over a matched surface-only baseline; that advantage
> must be disrupted when the group-level effect is severed while every
> pairwise relation, cardinality and surface statistic is preserved.

H-MO1 is silent on necessity. Whether the explicit motif representation is
*necessary* is a separate outcome axis (§15), decided by the F_G contrast
under RGR-04 §XXV, never by H-MO1 support alone.

H-MO1 is not a claim that motifs are fundamental to human meaning
(RGR-03 §18; RGR-04 §I applies unchanged).

---

# 4 · Observable identity law

> **F_G and F_R receive the same observable evidence; only their
> representational inductive bias may differ.**

Information equality is established at the encoding boundary, by byte
identity of the observable set O, never argued after the fact. "Matched
information density" is not an admissible criterion; it cannot be audited.

O contains, for every fixture:

- the evidence spans (synthetic member statements), including the
  group-level span;
- the admitted pairwise relations with type, direction and standing
  (H3j vocabulary: dynamic operator + configuration);
- temporal order where the fixture carries it;
- nuisance fields.

O does NOT contain:

- the target y;
- a precomputed motif label or hyperedge;
- any oracle indicator of r_group.

F_R must construct the motif from O through its own extractor. An oracle
hyperedge supplied to F_R only is a benchmark defect, not a condition.

---

# 5 · Generator

```text
x = G(s, r_pair, r_group, η)
```

- `s`        surface: names, vocabulary bank, phrasing templates, drawn from
             split-disjoint codebooks
- `r_pair`   the pairwise signature of the member set, drawn from the H3j
             vocabulary; partitioned into balanced signature classes
- `r_group`  the group-level effect; initial vocabulary
             `COLLECTIVE_CONSTRAINT | COLLECTIVE_SYNERGY`, with `NONE`
             reserved for the abstention control (§12)
- `η`        nuisance

The generator must be able to intervene on `s`, `r_pair` and `r_group`
independently (RGR-03 §2). A generator that cannot is BENCHMARK_INVALID.

---

# 6 · Full-factorial fixture law

Every `r_pair` signature class occurs with every `r_group` value equally
often, and every surface codebook entry is counterbalanced across roles and
classes.

Consequence, by construction rather than by luck: pairwise structure alone
predicts `r_group` at chance, and no surface token is intrinsically
associated with any `r_group` (RGR-04 §VI generalised one order up). This
generalises the four hand-built H4a collision cases to the whole dataset.

Member count, edge count, per-node degree, span count and span-length class
are matched across `r_group` values.

---

# 7 · Target-function definition

The evaluated target is **downstream of `r_group`**, not `r_group` itself:

```text
y = f(r_pair, r_group, context)
```

Frozen requirement on f (numeric table frozen at the benchmark-constitution
gate, not here):

- `y` is balanced;
- `P(y | s)`, `P(y | r_pair)` and `P(y | r_group)` are each uninformative by
  factorial construction;
- `y` is determined only by the composition of `r_pair` and `r_group`.

Rationale: `r_group` is deliberately expressed through the group span. A
classifier that reads that span and recovers `r_group` is reading evidence
placed in O on purpose. If the task were "predict `r_group`", the leakage
test would reject the benchmark's own intended signal. Placing `y`
downstream makes the benchmark test a motif's consequence rather than
detection of language describing a motif.

RGR-04 §I caveat carried unchanged: because `y` is a function of the
relational structure by construction, a positive result shows that motif
representation transfers; it cannot show that motifs are fundamental.

---

# 8 · Paired counterfactual construction (group-level severance)

Every positive fixture has one paired counterfactual with:

- identical `s`;
- identical `r_pair` (every pairwise relation, type, direction, standing);
- identical member count, edge count, degrees, span count, span-length class;
- `r_group` swapped, and the group span rewritten from a template of the
  same length class and vocabulary class;
- `y` therefore flipped.

This is RGR-04 §VIII lifted one order: the pair differs in group composition
and in nothing measurable at the pairwise or surface level.

The counterfactual metric is `C_break` as defined in RGR-04 §XIX, with its
own preregistered κ_min frozen at the benchmark-constitution gate. Random
independent predictions score near 0.25 on pairs; κ_min must sit above the
floor implied by the example-level accuracy threshold.

---

# 9 · Comparator definitions

| Family | Receives | Role |
|---|---|---|
| F_S | surface view only (spans as bag-of-words / declared surface features; no relations) | preregistered surface-only baseline suite |
| F_G | full observable O, flat encoding | same-information generic comparator |
| F_R | full observable O; constructs the motif object from O via its extractor | relation-aware candidate |
| F_R-oracle | O plus the true `r_group` hyperedge | **diagnostic ceiling only**; never evidence for H-MO1 |

F_G is not part of the primary support inequality (RGR-04 §XXV). Its result
changes interpretation (§17).

Where the extractor is a prompted language model, F_G is the same model
receiving the same O with a schema that has no motif slot, and F_R is the
same model with a hyperedge slot. Forbidding a slot is a representational
constraint, not an information difference.

---

# 10 · Capacity and full-pipeline budget law

Because F_R must infer its motif, **the entire extractor is part of F_R**.
Budget accounting for F_R includes:

- extractor parameters or effective capacity;
- extractor training or few-shot data;
- search and tuning budget;
- inference compute;
- any preprocessing unavailable to F_G.

F_G is allowed a budget at least equal to F_R's total, under RGR-03 §10
(defensible preregistered policy plus sensitivity analysis; identical
parameter counts across unlike architectures are not required and can
themselves be unfair).

Otherwise the experiment degrades into: *does the model already told the
correct abstraction beat the model that was not?*

---

# 11 · Severance / perturbation as one conjunctive family

Inherited from RGR-03 §1, not restated:

```text
preserve r_pair + r_group, perturb s        → prediction must be stable
preserve s + r_pair + marginals, sever r_group → prediction must change
```

Support requires both. A failed severance control is NOT_SUPPORTED for
claimed relational use (RGR-03 §14). Perturbation includes held-out surface
codebooks, paraphrase within template class, randomised serialization order
of relations, and window-boundary shifts that do not remove evidence.

---

# 12 · Null controls and BENCHMARK_INVALID conditions

Each of the following is an invalidation condition, not a caveat:

| Probe | Invalid when |
|---|---|
| Surface / bag-of-words classifier on O's spans → `y` | above preregistered floor |
| Pairwise-only classifier (relations, no spans) → `y` | above chance |
| Group-span-only classifier → `y` | above chance |
| Cardinality audit (member count, edges, degrees, span lengths) by `r_group` | any class difference |
| NC1 label permutation | F_R fails to collapse to chance |
| NC3 residual-dependence leakage diagnostic | above preregistered threshold |
| Generator cannot intervene on `s`, `r_pair`, `r_group` separately | always |

Abstention control: fixtures with `r_group = NONE` (no group-level span)
must yield no minted motif in F_R's extractor output. A motif minted from
pairwise structure alone is a false positive and is scored as such (H4a
false-positive discipline).

---

# 13 · Held-out surface and replication

- Train, validation, test and replication use disjoint surface codebooks
  (RGR-04 §VI).
- Stopping law and replication law inherited (RGR-04 §XXVIII, RGR-03 §13).
- Failed primary support is never rescued by replication.

---

# 14 · Forced-choice human legibility contract

Purpose: establish that an admitted motif can be recognised **without access
to its theoretical label**.

Design:

- witnesses receive the synthetic evidence (the fixture's spans, in plain
  prose) and two or more plain-language translations;
- translations are generated from genuinely different models of the same
  fixture: the admitted motif, a competent defeat candidate, a pairwise-only
  reading;
- all structural vocabulary is withheld (no "triad", "constraint",
  "motif", channel names);
- the witness selects which translation explains the evidence;
- scoring is **discrimination** against the wrong-model translations, with
  a preregistered floor and inter-witness agreement rule;
- an agreement rating ("does this sound right?") is not admissible.

Confabulation boundary (TESTING-01): no automated result may report the
human legibility question as passed. *Unknown — requires human witness* is a
result.

Member-facing legibility (a real member judging a real reading) is outside
this contract; it requires the natural-data gate (§16).

---

# 15 · Support levels (two axes)

Axis A — evidence class

- **MOTIF-STRUCTURAL** — synthetic conditions satisfied: transfer over F_S by
  δ_min, C_break ≥ κ_min, all §12 controls clean, §14 discrimination floor
  met by human witness.
- **MOTIF-NATURAL** — the structural result survives governed
  natural-conversation evidence admitted under §16.

Axis B — representational necessity

- **REPRESENTATIONAL-NECESSITY** — available only if F_R demonstrates the
  preregistered advantage over the full-observable F_G under §10. It is an
  outcome to be earned, never part of the hypothesis conclusion, and
  MOTIF-NATURAL does not confer it.

---

# 16 · Natural-data gate

Under RGR-00, member conversation is **unavailable evidence**, not a pending
dataset. Before natural-conversation evidence can be scheduled, a separate
adjudicated data/ethics gate must determine:

- what constitutes research use;
- which conversations are eligible;
- what consent text authorizes, and whether any existing consent surface
  grants research use (none is known to; a census is owed);
- prospective versus retrospective use;
- withdrawal;
- de-identification;
- storage and custody;
- whether practitioner/client material carries an additional prohibition;
- whether data may leave the sovereign environment at all (default: no).

Sanctuary content is excluded absolutely (project Sanctuary invariants).

---

# 17 · Interpretation table

| Observed | Standing |
|---|---|
| F_R beats F_S by δ_min; C_break ≥ κ_min; §12 clean; §14 floor met | MOTIF-STRUCTURAL (candidate SUPPORT) |
| F_G also passes both | transferable group-level relational information **without** representational necessity; a precommitted admissible outcome, not a failed attempt |
| F_G fails, F_R passes | the tested explicit motif inductive bias enabled transfer; architecture independence not established |
| F_G passes, F_R fails competence | UNDERDETERMINED for the preregistered F_R contrast; F_G may motivate a successor, may not replace F_R post hoc |
| severance control fails | NOT_SUPPORTED for claimed relational use |
| any §12 condition triggered | BENCHMARK_INVALID |
| F_S matches F_R | NOT_SUPPORTED or UNDERDETERMINED per RGR-03 §14 |
| §14 unwitnessed | *Unknown — requires human witness* |

---

# 18 · No-rescue law

RGR-03 §15 and RGR-04 §XXIX inherited. Additionally forbidden after
materialization:

- changing the composition table f;
- changing the `r_pair` class partition;
- changing the group-span template classes;
- promoting F_R-oracle to evidence;
- redefining the legibility floor after witness results are seen.

Any such change creates a new benchmark version.

---

# 19 · Provenance: H0a and the historical H-series

The H1–H6 results summarised in the 16 September 2026 team paper are not
governed experimental objects in the repository. No fixture, prompt, model
identifier, temperature, run log or score for them exists on any branch
(searched 2026-09-23 across all remote refs).

- **H0a** admits only what survives, at its actual provenance class. A result
  with no preserved prompts, configuration, model identity and output is a
  **researcher-reported claim** and may not be promoted.
- A fresh run under governed capture is a **new** result. It may never be
  presented as recovery of a historical one.
- The H3j extractor pipeline and H4a fixture construction, on which H-MO1
  depends, are to be rebuilt under capture inside the RGR-07 Work Unit, not
  reconstructed from the paper.

Naming: `H` is not reused for gates. RGR gates are `RGR-nn`; hypotheses are
`H-XXn`. `H8` already denotes Production Shadow Projection in
`MAIA-RELATIONAL-FIELD-SHADOW-01`.

Routing-hold note (recorded cautiously, not adjudicated): design text citing
RGR clauses, lane names and repository paths was, by founder attestation,
discussed through an external model interaction (Gemini). That provider
appears in no tier of `docs/canon/PROVIDER_GOVERNANCE.md`; the
2026-09-20 interim hold on routing constitutional text to non-Production
providers at development time, and the unratified
`DEVELOPMENT_PROVIDER_GOVERNANCE_CANDIDATE_2026-09-22.md`, govern. Whether a
chat summary citing clauses is `constitutional_canon` or
`repository_source` under the vocabulary now present in that canon is a
founder ruling. POTENTIAL ROUTING-HOLD REVIEW REQUIRED.

---

# 20 · Stop boundary

RGR-07 may not:

- formalize, test or name any Elemental, aspect-derived, Spiralogic or
  alchemical operator (a sibling programme with its own prefix and contract
  is required; H2b and H6 belong there);
- touch member data or natural conversation ahead of §16;
- expose motif vocabulary to members;
- alter MAIA cognition, memory, standing or routing;
- create schema, migrations or deployments.

Governing sentence, frozen for the programme:

> A motif is supported only if it survives transformations that preserve its
> relations, fails transformations that destroy those relations, can be
> recognized without access to its theoretical label, and contributes
> information beyond an equally informative non-motif representation —
> where the last clause names a separate outcome axis, not a support
> condition.

**RGR-07 standing: CANDIDATE · NOT OPENED.**
