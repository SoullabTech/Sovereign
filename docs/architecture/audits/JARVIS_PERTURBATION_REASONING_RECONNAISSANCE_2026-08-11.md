# JARVIS Perturbation-Reasoning Reconnaissance

**Status**: Reconnaissance only. Read-only. No implementation, no harness, no routing change, no model adoption, no dependency created.
**Authorized**: 2026-08-11, founder-directed work unit (read-only research / architecture audit).
**Classification returned**: **C — ADD PERTURBATION EVALUATION, OUTSIDE THE CANONICAL PROOF LADDER.**

> ⚠️ **Checkout-provenance caveat (read first).** This brief was authored from files on disk in the
> working checkout, which is on `feature/labtools-redesign` at `87a972013`, **diverged from trunk**
> `clean-main-no-secrets`. Unlike `JARVIS_GEOMETRIC_INTELLIGENCE_CLAIM_AUDIT_2026-08-11.md` — which
> deliberately pulled every citation from `origin/clean-main-no-secrets` via `git show` — the repo
> citations below are **worktree-state, not trunk-state**. Every cited document is a `docs/**`
> record and none was modified by this lane, so contamination risk is low but **not zero and not
> verified**. This is itself a live instance of the authority perturbation this brief is about
> (§8, Case D: `repo_governance` @ trunk ≠ `repo_governance` @ branch). It is disclosed rather
> than silently assumed away.

---

## 1. Executive finding

Three findings, in order of consequence.

**(1) The method is real, old, and not Sophontic's.** Paired canonical/perturbed evaluation with a
flip/consistency metric is a well-established technique in the literature under at least four prior
names (§4). Sophontic's public material contributes a *packaging* and a *naming* — "the pair is the
unit of measurement," "flip rate," "rails," "ConvergeMini" — not a new evaluation primitive. This
does not diminish the idea's usefulness to JARVIS; it changes who we owe the lineage to and removes
any reason to wait for Sophontic's release before using it.

**(2) JARVIS already has substantial adversarial-evaluation design — but it points at MAIA, not at
JARVIS.** `MAIA_MEMORY_ADVERSARIAL_EVALS_2026-08-09.md` specifies fourteen scenarios including an
explicit **E5 — AUTHORITY** rail, plus a golden-member regression gate. Its subject is *MAIA's
behaviour toward a member*. **Nothing in this repository evaluates the reasoning of JARVIS itself**
— the agent that produces the audits, adjudications, classifications, and claim ledgers on which
governance depends. Every proof instrument in AIN answers *does capability X exist / work / reach
production?* None answers *did the reasoning that produced this audit actually track the
load-bearing evidence, or did it match surface features of the corpus?* **That is the genuinely
missing capability**, and it is exactly what the paired paradigm measures.

**(3) The authority rail (§7 of the directive) is not novel to this repo — it was independently
derived nine hours earlier, and it is currently blocked for want of exactly this instrument.**
`JARVIS_WORK_UNIT_AUTHORITY_SCOPE_PRIMITIVE.md` §3 already states five authority cases (A–E) in
paired canonical/perturbed form in all but name. Its implementation gate has **three of five
conditions stalled at ⏳ "no implementation to inspect."** A paired authority-perturbation suite is
the most direct available candidate for the *acceptance instrument* those conditions lack. This is
the single highest-value adaptation identified by this unit — and it argues for **C, not D**,
because it serves an already-authorized primitive rather than requiring a new proof dimension.

---

## 2. Sophontic claims vs verified facts

**Reconciliation with prior work.** `docs/research/JARVIS_GEOMETRIC_INTELLIGENCE_CLAIM_AUDIT_2026-08-11.md`
(same day, founder-authorized) already produced a full claim ledger: **0 VERIFIED PRIMARY SOURCE ·
3 SUPPORTED BY RELATED LITERATURE · 3 INTERVIEW CLAIM ONLY · 3 UNVERIFIED · 1 CONTRADICTED OR
QUALIFIED.** This brief **does not re-litigate that ledger** and adopts it by reference. What
follows adds only what direct inspection of the two named pages establishes today.

| Claim | Status | Source |
|---|---|---|
| Flip rate is measured as a paired canonical/perturbed test | **PUBLISHED CLAIM — stated verbatim by the vendor** | `sophontic.ai/evals/` |
| "The pair is the unit of measurement, not the item" | **PUBLISHED CLAIM — verbatim** | `sophontic.ai/evals/` |
| A rail named *ConvergeMini* exists and supplies live pairs | **PUBLISHED CLAIM — NOT INDEPENDENTLY VERIFIED.** Named; no definition, sample, schema, or size published | `sophontic.ai/evals/` |
| Two axes are scaled together: *hop count* and *distractor density* | **PUBLISHED CLAIM — described, not specified.** No ranges, units, or generation procedure | `sophontic.ai/evals/` |
| Eval kit carries source-level provenance per rail | **PUBLISHED CLAIM — NOT INDEPENDENTLY VERIFIED**; the page says "Available at launch" | `sophontic.ai/evals/` |
| "Any lab can apply it to its own model" | **PUBLISHED CLAIM.** Plausible on its face — the method is reproducible from the description alone, which is the finding that matters for us (§16) | `sophontic.ai/evals/` |
| Compact prototype outperforms models up to 60× its size | **PUBLISHED CLAIM — NOT INDEPENDENTLY VERIFIED.** No model card, eval report, method notes, weights, repository, or paper | `sophontic.ai/models/` |
| Model card · evaluation report · method notes · access details | **FORTHCOMING — vendor's own word.** Page states "Releasing soon" / "at release" | `sophontic.ai/models/` |

**Standing classification: `SOPHONTIC MODEL = WATCHLIST, NOT DEPENDENCY`.** Nothing in this brief
depends on any Sophontic artifact shipping, and nothing here should be re-read as endorsement of the
60× claim.

**One correction to the framing that authorized this unit.** The directive characterizes Sophontic's
perturbations as *"not primarily meaning-preserving."* Direct inspection **supports** that for the
canonical/perturbed pair itself — the vendor states the flipped fact is load-bearing and the correct
answer moves with it. But the same page's *distractor density* axis describes adding facts
"irrelevant to the conclusion," which is an invariance manipulation. So the published surface
contains **both classes**, with only Class B named as the pair mechanism. Treat Class A as
*present but unnamed* in Sophontic's material, not as absent (§6).

---

## 3. Perturbation paradigm reconstruction

Fourteen questions were posed. **Six are answerable from the primary source. Eight are not.**
Answers below are strictly source-bounded; nothing is inferred without a label.

| # | Question | Reconstruction | Basis |
|---|---|---|---|
| 1 | Canonical item | "The original item, kept as the baseline measurement surface." Structure shown as `premise → question` | ✅ source |
| 2 | Perturbed item | "A minimal load-bearing change that should force the answer to move" | ✅ source |
| 3 | Load-bearing change | "The single fact flipped between canonical and perturbed" — a *single fact*, visually marked | ✅ source |
| 4 | Held invariant | ⛔ **NOT SOURCE-ESTABLISHED.** Implied to be everything but the flipped fact; no invariance specification published | — |
| 5 | Deliberately changed | Exactly one load-bearing fact | ✅ source |
| 6 | Why the answer must change | The flipped fact lies on the inference chain from premise to answer; "a reasoner tracks the change through the chain, a surface-matcher does not" | ✅ source |
| 7 | Successful pair | "A model must answer both sides coherently. One correct item is not enough when the load-bearing fact has moved." | ✅ source |
| 8 | Failure | "A model that gets one item right and the other wrong has not reasoned; it has matched." | ✅ source |
| 9 | Flip-rate definition | ⛔ **NOT SOURCE-ESTABLISHED as a formula.** Described as "how often that happens" — the *direction* of the metric (rate of failure-to-flip vs rate of correct flip) is **ambiguous on the page**. Do not cite a formula | — |
| 10 | Hop count / distractor density | Two axes scaled together by a UI slider; hop count = "number of inference steps from premise to answer"; distractor density = "number of facts irrelevant to the conclusion." ⛔ No ranges, units, or generation method | ◐ partial |
| 11 | ConvergeMini | A named **rail** of the eval kit supplying the displayed pairs. ⛔ Nothing else published — not a size, schema, licence, domain, or provenance | ◐ name only |
| 12 | Provenance retained | "Each release rail carries source and construction metadata for audit." ⛔ Fields unspecified | ◐ partial |
| 13 | Public now | The method description, the pair definition, the flip-rate rule, the five named surfaces, the two axis names, the rail name. That is the whole public surface | ✅ source |
| 14 | Unavailable until release | The kit, the rails' contents, the metric formula, provenance schema, model, model card, eval report, method notes, repository, licence | ✅ source (vendor states) |

> **HYPOTHESIS — NOT SOURCE-ESTABLISHED.** The most natural reading of #9, given #7 and #8, is that
> "flip rate" counts pairs where the model's answer *failed to move* when the load-bearing fact
> moved (i.e. a defect rate, lower is better). The page's phrasing — "Flip rate punishes them" —
> is consistent with this but does not settle it, and the opposite convention (rate of *correct*
> flips, higher is better) is equally readable. **Do not adopt the term without defining it
> ourselves**; the ambiguity is a reason to name our own metric (§12).

---

## 4. Prior-art comparison

The directive's instruction — *identify the correct intellectual lineage and avoid reinventing a
known technique under a new name* — resolves cleanly. This is a known technique.

| Known general method | Relation to the paradigm | Verdict |
|---|---|---|
| **Contrast sets** (Gardner et al., 2020) | Minimally edit an item so the label changes; evaluate on *contrast consistency* — the whole contrast set must be right, not the item. **This is Sophontic's Class B and its "pair is the unit" rule, essentially verbatim** | ⭐ **Direct antecedent** |
| **Counterfactually-augmented data** (Kaushik, Hovy, Lipton, 2020) | Minimal human edits that flip the label; used to expose spurious-feature reliance | ⭐ Direct antecedent |
| **Metamorphic testing** (Chen et al., 1998) | Define relations between inputs and expected output relations — including *invariance* relations. **This is Class A**, and predates the ML framing by two decades | ⭐ Direct antecedent for Class A |
| **CheckList** (Ribeiro et al., 2020) | Behavioural test suites with explicit INV (invariance) and DIR (directional-expectation) tests. **INV = Class A, DIR = Class B, in one framework** | ⭐ Direct antecedent for *both* |
| **Minimal pairs** (linguistics; BLiMP et al.) | Two items differing in one feature; the unit of evaluation is the pair | ⭐ Direct antecedent |
| Mutation testing | Perturb the *program*, not the input; measure whether tests detect it | ◐ Structural cousin, different subject |
| Property-based testing | Assert invariants over generated inputs | ◐ Cousin (Class A shape, no ground-truth pairing) |
| Causal intervention / do-calculus | Intervene on one variable, observe downstream effect | ◐ Conceptual parent |
| Adversarial evaluation | Superset; perturbation is one family within it | ◐ Superset |

**Separation, as required:**

- **KNOWN GENERAL METHOD** — paired minimal-edit evaluation with a pair-level consistency metric,
  in both invariance (Class A) and directional (Class B) forms. Established, published, prior.
- **SOPHONTIC-SPECIFIC IMPLEMENTATION** — the *ConvergeMini* rail, the joint hop-count ×
  distractor-density axis, the specific flip-rate formulation, and the eval-kit provenance schema.
  **All unreleased; none independently verifiable.**
- **POTENTIALLY NOVEL JARVIS ADAPTATION** — perturbing **epistemic and governance status while
  holding informational content byte-identical** (§7), and requiring **multi-state transitions
  rather than binary flips** (§8). No prior art was identified for either. This is where the
  interesting work is, and it owes Sophontic the prompt, not the method.

> The prior art also **retires a dependency**: because the method is fully specified in open
> literature, JARVIS need not wait for, licence, or reproduce Sophontic's kit to use it.

---

## 5. Existing JARVIS overlap

Classified per the directive: OVERLAP · COMPLEMENT · DUPLICATE · CONFLICT · ABSENT.

| Existing mechanism | Where | What it proves | Class |
|---|---|---|---|
| **Proof ladder** `EXISTS → CORRECT → SECURE → CONNECTED → REACHABLE → EXERCISED → OBSERVABLE → SUSTAINED` | `JARVIS_EPISTEMIC_COHERENCE_CAPABILITY_2026-08-09.md` §5 | *Status of a capability.* Answers "how far along is X," never "did the reasoner track the evidence" | **COMPLEMENT** — orthogonal subject; perturbation is not a rung on it |
| **MAIA memory adversarial evals E1–E14**, incl. **E5 AUTHORITY**, E2 CORRECTION, E3 TEMPORAL CHANGE, E7 FALSE INFERENCE | `audits/MAIA_MEMORY_ADVERSARIAL_EVALS_2026-08-09.md` | Adversarial scenarios for **MAIA toward a member**. Scenario-based, **not paired**, and the run-state ledger records **E1–E14 not run** | **OVERLAP (partial) + COMPLEMENT.** Same technique family, different subject. ⛔ Do not duplicate |
| **Golden-member regression gate** | same, §2 | A permanent regression gate design with restraint scoring and machine-checkable assertions. **Designed, not built**; explicitly blocked behind E2/E7 repairs | **OVERLAP in role** — this is the closest existing thing to the proposed instrument |
| **`authority_scope` primitive**, Cases A–E | `JARVIS_WORK_UNIT_AUTHORITY_SCOPE_PRIMITIVE.md` §3 | Five authority cases already stated in paired form; conflict rule ("conflict **only if** scope sets intersect"); "jurisdiction, not prestige"; scope-widening forbidden without an authored act | **OVERLAP — strong.** The authority rail is a re-derivation of this. Its gate needs an instrument (§7) |
| **Observability invariant + five proof levels** `loaded → formatted → registered in inventory → appended to prompt → present in final model context` | `audits/CONVERSATION_IDENTITY_ONTOLOGY_TRACE_BRIEF_2026-08-11.md` §0–§1 | Ratified invariant that no observability instrument proves context inclusion unless reconciled against final assembly | **OVERLAP — strong.** §9's rail already exists as canon *and* has a recorded live instance |
| **Contradiction taxonomy** — DESIGNED BUT ABSENT · IMPLEMENTED BUT UNWIRED · WIRED BUT UNEXERCISED · DOCUMENTATION DRIFT · STALE EVIDENCE | `JARVIS_EPISTEMIC_COHERENCE_CAPABILITY_2026-08-09.md` §7 | Every category has a real recorded instance; **"detecting these automatically is entirely unbuilt"** — all found by directed investigation | **COMPLEMENT.** Perturbation pairs test the *reasoner's* handling of these, not automated detection |
| **Non-perturbation control** (sha1 before/after a read path) | `JARVIS_CLAIM_STATE_ADJUDICATION_2026-08-10.md` | Proves an *inspection* did not mutate evidence | **CONFLICT OF VOCABULARY ONLY.** Same word, opposite meaning — "perturbation" there means *observer effect*. ⚠️ Any new instrument must not collide with this term |
| `verify-colab-boundaries.ts` (31/31 gate) | `scripts/` | Policy/consent invariant gate | **COMPLEMENT** (already noted in the geometric audit as vocabulary-adjacent, not method-adjacent) |
| **Evaluation of JARVIS's own reasoning** | — | — | ⛔ **ABSENT** |

**The answer to the governing question (§0 of the directive).** JARVIS proves **result and
execution correctness, and artifact status**. It does **not** prove structural reasoning under
changed evidence. The one place it came closest was accidental and historical: the
`CONVERSATION_IDENTITY_ONTOLOGY_TRACE_BRIEF` session **retracted four findings mid-audit** when the
assembly path contradicted the instrument — correct behaviour, achieved by directed human
investigation, with no instrument that would catch a recurrence.

---

## 6. Invariance perturbation (Class A)

**Question asked:** *does JARVIS know what does NOT matter?*

Candidate manipulations for governance reasoning, holding the conclusion fixed:

- document **filename or path** changes; heading numbering changes; section reordering
- **recency** changes with no supersession act (per `authority_scope` §8: *"Recency alone confers
  nothing"*) — ⭐ the sharpest Class A case in this repo
- **corpus weight** changes (per the non-derivation law: `corpus_weight ≠ authority_scope`, so a
  weight change must leave authority **and** every authority-dependent conclusion untouched)
- **volume/density** of supporting prose without new evidence
- addition of true-but-irrelevant facts (Sophontic's distractor-density axis)
- **prestige** framing of the author, where scope is unchanged

**Expected behaviour:** conclusion invariant, and — stricter — the *cited* load-bearing fact
invariant. A reasoner that keeps the answer but changes its citation has failed differently and
worse than one that changes the answer.

**Standing note:** two of the above (recency, corpus weight) are **already codified prohibitions**
in `authority_scope` §7/§8 and §9b's I1/I2 obligations. Class A tests are therefore not speculative
here — they are the executable form of prohibitions already written down and currently unenforced.

---

## 7. Load-bearing perturbation (Class B) and the authority rail

This section merges the directive's §4-Class-B and §7 because the repo evidence merges them.

**The finding that matters:** `JARVIS_WORK_UNIT_AUTHORITY_SCOPE_PRIMITIVE.md` §3 already contains
five authority cases in paired form:

| Case | Canonical | Perturbation | Required behaviour |
|---|---|---|---|
| **E** — member sovereignty | member claim @ `member_own_experience` | same content asserted @ `soullab_lineage` | Framework claim **has no standing** over member claim. A design permitting it is *"rejected, regardless of elegance"* |
| **A** — Differentiation | three claims, disjoint scopes | — | ⭐ **Success = representing all four without choosing.** Disjoint scopes ⇒ **not a contradiction.** A schema that forces a choice is a *"failed design"* |
| **B** — supersession | canon @ T1 | newer doc claiming supersession, without an authored act | Newer ⇏ more authoritative |
| **C** — implementation vs stale doc | CLAUDE.md asserts Bridge D wired @ `repo_governance` | runtime proves no write since 2026-04-08 @ `runtime` | **Both true, neither deleted** |
| **D** — trunk vs production | production SHA | trunk SHA, 6 ahead | Separate readings, independent freshness |

Added candidate perturbations from the directive that map onto scopes already named in §9 of that
work unit (`member_own_experience · practitioner_lens · soullab_lineage · maia_ain_architecture ·
repo_governance · implementation · runtime · production · external_scholarship · jarvis_inference`):

- authoritative → advisory · founder ruling → `jarvis_inference` · committed → uncommitted
- canonical trunk → unmerged experimental branch (**this brief's own §0 caveat is a live instance**)
- execution-authorized → read-only · verified runtime evidence → observational instrument

⭐ **The strongest single test available**, and the directive's own example: hold the document
**byte-identical** and change only its `authority_scope`. Content-identical, authority-different.
If the conclusion does not move, the system reasoned from semantic similarity and document
presence, not from authority. Ordinary benchmark accuracy cannot see this failure.

⭐ **The consequential adaptation.** `authority_scope`'s implementation gate currently stands at:

| # | Condition | State |
|---|---|---|
| 1 | `authority_scope` not derived from `corpus_weight` | ⏳ no implementation to inspect |
| 2 | `corpus_weight` not derived from `authority_scope` | ✅ established |
| 3 | mutating `authority_scope` cannot mutate `corpus_weight` | ⏳ awaits implementation |
| 4 | mutating `corpus_weight` cannot mutate `authority_scope` | ✅ established |
| 5 | readers don't convert weight → authority | ⏳ held at PARTIAL |

Conditions 1, 3 and 5 are **discriminating-behaviour** conditions — §9b Amendment 4 explicitly
calls for *"discriminating tests required at implementation."* A paired authority-perturbation suite
is a direct candidate for that instrument. **This is the concrete justification for classification
C**: the mechanism has an already-authorized consumer, so it need not enter the proof ladder to earn
its place.

⛔ **Not authorized by this brief.** `authority_scope` implementation remains gated; §15 of that
unit records *"Differentiation concept-layer build: HELD."* Nothing here lifts either.

---

## 8. Evidence perturbation — and why flip rate does not generalize

**This is the section where Sophontic's metric breaks on contact with AIN.**

Sophontic's grammar is binary: the answer flips or it does not. AIN's governance environment is
**multi-state**, and the correct response to removed evidence is frequently *not* the opposite
conclusion but a **demotion**:

```
PROVEN        → UNKNOWN
AUTHORIZED    → NOT AUTHORIZED
LIVE          → REACHABLE            (per CLAUDE.md: "LIVE" = code + schema deployed and exercised)
VERIFIED      → STALE                (per /orient: VERIFIED never survives a SHA change)
CONTRADICTION → NOT A CONTRADICTION  (Case A: scopes turn out disjoint)
```

The state space already exists and must be reused, not reinvented — the eight-rung proof ladder,
plus `UNKNOWN` / `ABSENT`, plus the Rehabilitation Map dispositions. ⚠️ `JARVIS_EPISTEMIC_COHERENCE`
§5 warns these are **three different vocabularies answering three different questions** and Founder
Ruling §22.4 **forbids merging all four axes into one universal status enum.** A perturbation
grammar must therefore record a **transition per axis**, never a single collapsed verdict.

⭐ **Abstention is a first-class correct answer here, and it has an existing rule.**
`authority_scope` §8b (founder-amended 2026-08-11): **`ABSENT` is derived-only and may never be
inherited from prose; bare authored absence ingests as `UNKNOWN`.** So the evidence rail has a
built-in trap worth testing directly: perturb a case so that a document *asserts* absence, and check
whether JARVIS returns `UNKNOWN` (correct) or `ABSENT` (violation). A binary flip-rate metric cannot
express the difference between these two answers, and both differ from the canonical `PROVEN`.

**Conclusion: adopt the pair, reject the metric.** Flip rate does not generalize cleanly to this
environment. What generalizes is *the pair as the unit of measurement* (§7 of Sophontic's page) —
which, as §4 establishes, is contrast-consistency and predates Sophontic anyway.

---

## 9. Observability perturbation

⭐ **This rail already exists as ratified method, and JARVIS has already passed it once — by hand.**

The governing invariant, verbatim from `CONVERSATION_IDENTITY_ONTOLOGY_TRACE_BRIEF_2026-08-11.md` §0:

> **No observability instrument may be treated as proof of model-context inclusion unless it is
> derived from, or reconciled against, the final prompt assembly path.**

And the five distinct proof levels (§1 of that brief) — proven independent, not one fact:

```
loaded → formatted → registered in inventory → appended to prompt → present in final model context
```

**The recorded live pair.** Anamnesis (`relationship_essences`) is **inventory-invisible** yet
**reaches the prompt on every turn** (~1,693 encounters/turn, interpolated at
`lib/sovereign/maiaService.ts:1297`). The instrument said absent; the assembly path said present.
The session **demoted the instrument and retracted four findings**, including *"Anamnesis is severed
— the largest severance found."*

**What this establishes for classification.** JARVIS demonstrated correct behaviour on a real
observability perturbation — evidence *against* claiming a missing proof dimension (D). But it did
so by directed human investigation, and the brief itself records that the wrong method was in use
**mid-audit** before being caught. There is no instrument that would catch the next recurrence.
That is an argument for a **regression instrument (C)**, not a new proof rung.

Ready-made pairs exist here at zero authoring cost: the four retracted findings are canonical/
perturbed pairs already, with ground truth recorded and a standing instruction — *"do not re-derive
the retracted versions."* A reasoner that re-derives any of them fails the pair.

---

## 10. Proposed paired evaluation grammar

⛔ **Proposal only. Not authorized for implementation.**

```
pair_id
rail                      invariance | load_bearing | authority | evidence | observability
canonical_case            evidence set + question
perturbed_case            canonical + exactly one delta
delta_kind                content | authority_scope | provenance | recency | corpus_weight |
                          custody | instrument_vs_assembly | evidence_removal
load_bearing_fact         the single datum that moved (or: none, for invariance pairs)
canonical_expected_state  per-axis (proof-ladder rung · authority · disposition)
perturbed_expected_state  per-axis
expected_transition       e.g. PROVEN→UNKNOWN | AUTHORIZED→NOT_AUTHORIZED | invariant
canonical_observed_state
perturbed_observed_state
observed_transition
cited_load_bearing_fact   did the reasoner name the datum that actually moved?
authority_preserved       did scope govern, or did similarity/presence govern?
evidence_preserved        citations correct and unfabricated on both sides
abstention_correct        UNKNOWN vs ABSENT vs asserted — per §8b
pair_pass                 both sides coherent AND transition correct AND attribution correct
```

⚠️ **Naming constraint (§5):** "perturbation" is already in use in `docs/ops/**` to mean
*observer effect* (`Non-perturbation control (mandated)`). Any instrument must disambiguate or the
adjudication record becomes ambiguous. Suggested: **"paired-case evaluation"** for this, leaving
"non-perturbation control" untouched.

---

## 11. Candidate metrics

Not flip rate. Reported as a vector, never collapsed to one number:

1. **Pair coherence** — both sides answered correctly *and* the transition is right. The headline.
2. **Invariance preservation** — Class A: conclusion *and* citation unchanged.
3. **Required-transition accuracy** — Class B: the transition matched, not merely "the answer changed."
4. **Causal attribution** — the reasoner named the datum that actually moved.
5. **Authority fidelity** — scope governed; no widening without an authored act; no scope→rank collapse.
6. **Evidence fidelity** — citations resolve; nothing fabricated; nothing inherited from prose.
7. **Abstention correctness** — `UNKNOWN` vs `ABSENT` vs asserted, per §8b.
8. **Confabulation rate** — invented causal explanations for a change. ⭐ The failure mode this
   repo has already been bitten by; measure it explicitly.

⚠️ **Do not average these.** Collapsing them reproduces exactly the single-number gaming that the
paired paradigm exists to prevent, and would violate the §22.4 prohibition on universal status enums
in spirit.

---

## 12. Compact-model implications

**Hypothesis recorded, not tested, not recommended:** *demonstrated robustness on the specific
reasoning rail a task requires may matter more than model size.* If true, paired-case performance
per rail could eventually become one input to a **capability certification** for delegating specific
governed reasoning to smaller or local models —

```
deterministic execution → compact/local reasoner → larger reasoner → frontier model
```

⛔ **No routing change is recommended, implied, or authorized**, and none may be derived from
Sophontic's unreleased model. Note also that AIN's existing lane vocabulary (C0/C1/C3,
`routed_not_executed`) already encodes routing tiers; a certification input would attach to that,
not replace it. Sequencing constraint: certification presupposes an instrument that has actually
**run**, which per §15 is exactly the risk this repo has already realized once.

---

## 13. Sophontic release watchlist

Record only; no action. Re-run `JARVIS_GEOMETRIC_INTELLIGENCE_CLAIM_AUDIT_2026-08-11.md` §5's
standing instruction when these appear.

Model identity · parameter count · architecture · weights availability · licence · commercial-use
rights · local inference support · hardware requirements · quantization support · context window ·
structured-output reliability · tool-use capability · fine-tuning support · **eval-kit licence** ·
**complete methodology (esp. the flip-rate formula, §3 #9)** · benchmark-contamination controls ·
reproduced flip rate · independently reproduced results · latency · memory footprint · cost ·
privacy implications.

**`SOPHONTIC MODEL = WATCHLIST, NOT DEPENDENCY.`**

---

## 14. Risks and failure modes

| # | Risk | Mitigation |
|---|---|---|
| R1 | ⭐ **The unrun-suite trap.** E1–E14 are specified and **not run**; the golden-member gate is **designed, not built**. A second unrun suite is the single most likely outcome | Bind any authorization to a **first run**, not a first spec. Ten run pairs beat a hundred written ones |
| R2 | ⭐ **Self-authored pairs.** If JARVIS authors the pairs it is evaluated on, the evaluation is contaminated | Draw pairs **only** from already-adjudicated historical cases with recorded ground truth (§9's four retracted findings; `authority_scope` Cases A–E). Authoring and answering must be separately sessioned |
| R3 | **Goodharting.** Optimizing the metric rather than the reasoning | Never collapse to one number (§11); rotate rails; keep a held-out set |
| R4 | **Vocabulary collision** — "perturbation" already means observer effect in `docs/ops/**` | Rename (§10) |
| R5 | **Scope creep into the knowledge graph.** Pairs → an index → a graph. ⛔ Ruling §22.2 expressly reaffirms *"do not build a giant knowledge graph"*; capability→implementation index (H) remains **UNAUTHORIZED** | Hard boundary: a flat pair file. No index, no graph, no new persistence service |
| R6 | **Modifying historical records.** The directive forbids it; several source records carry explicit "do not re-derive" instructions | Isolated evaluation surface only; source records read-only |
| R7 | **Premature promotion to a proof rung.** Turning an unrun evaluation into canonical proof architecture would repeat the exact inflation drift CLAUDE.md governs | Classification C keeps it outside the ladder until it has run |
| R8 | **Lineage inflation.** Presenting this as Sophontic-derived novelty | §4 is the standing correction: the method is contrast sets / CheckList / metamorphic testing |
| R9 | **Sanctuary and member data.** Any suite touching MAIA reasoning inherits the standing rule | *"No eval may run against a real member"* — already binding (`MAIA_MEMORY_ADVERSARIAL_EVALS` §1) |

---

## 15. Recommendation

**C — ADD PERTURBATION EVALUATION, OUTSIDE THE CANONICAL PROOF LADDER.**

Why not **A**: the capability is genuinely absent. Every existing instrument proves artifact status
or execution correctness; none evaluates whether JARVIS's own reasoning tracked the load-bearing
evidence (§5).

Why not **B**: no existing mechanism can absorb it. The proof ladder has the wrong subject
(capabilities, not reasoning). The MAIA adversarial suite has the wrong subject (MAIA toward a
member) and is not paired. `authority_scope` is a *representation*, not an evaluation — it is the
consumer, not the container.

Why not **D**: the bar for D is *"perturbation robustness is a genuinely missing proof
dimension requiring canonical architectural change,"* and D requires *"substantially stronger
evidence than C."* Three facts cut against it. (i) JARVIS **already passed** a real observability
perturbation (§9). (ii) The authority cases were **already derived independently** (§7) — the gap is
an instrument for an existing primitive, not a missing dimension. (iii) Nothing has been **run**;
promoting an unrun instrument to canonical proof architecture is precisely the built ≠ wired ≠
surfacing ≠ verified collapse this project's own doctrine forbids. **Default to the least invasive
classification supported by evidence** — that is C.

**What C means concretely:** a small, isolated, read-only paired-case suite, drawn from already-
adjudicated history, serving as (a) a candidate acceptance instrument for `authority_scope`
conditions 1/3/5, and (b) a regression witness for the §9 observability invariant. Outside the proof
ladder. Not a rung. Not a gate. Promotion to either requires its own founder act and, at minimum,
a first run.

---

## 16. Recommended next unit

**Draft only — not authorized by this brief.**

> **Unit: Paired-case evaluation, authority rail, first run (~12 pairs).**
> Draw pairs exclusively from recorded ground truth: `authority_scope` §3 Cases A–E, and the four
> retracted findings in `CONVERSATION_IDENTITY_ONTOLOGY_TRACE_BRIEF_2026-08-11.md`. Hold content
> byte-identical; vary only `authority_scope` / instrument-vs-assembly. Score on §11 metrics 1, 4,
> 5, 7, 8. Isolated surface; no historical record modified; no index, no graph, no persistence
> service. **Acceptance is a run, not a spec** (R1).

Sequencing note, by analogy to `MAIA_MEMORY_ADVERSARIAL_EVALS` §3 (*fix E2/E7 first, or the suite
merely documents known failures*): the authority rail is the correct **first** rail because its
consumer — the `authority_scope` implementation gate — is already authorized and already stalled for
want of a discriminating test. The evidence and observability rails follow. The MAIA-facing rails
should **not** be built by this line of work; they belong to E1–E14, which already exist and need
running, not replacing.

---

## 17. Evidence citations

**Primary external** (fetched and indexed 2026-08-11; content is vendor-authored marketing copy):

- `https://sophontic.ai/evals/` — perturbation paradigm, flip-rate rule, five surfaces, ConvergeMini
  rail, hop count × distractor density.
- `https://sophontic.ai/models/` — compact prototype, 60× claim, "Releasing soon," four forthcoming
  artifacts. Colophon: Sophontic, Inc., Delaware C-corp, founded 2026.

**Repository** (worktree state — see the §0 caveat):

- `docs/research/JARVIS_GEOMETRIC_INTELLIGENCE_CLAIM_AUDIT_2026-08-11.md` — claim ledger adopted by
  reference; §3 intersection map; §4 cheapest falsifiable experiment; §5 limits.
- `docs/architecture/JARVIS_WORK_UNIT_AUTHORITY_SCOPE_PRIMITIVE.md` — §2 semantic gap; §3 Cases
  A–E; §4 inheritance; §7 conflict-only-if-scopes-intersect; §8 recency confers nothing; §8b
  ABSENT/UNKNOWN amendments; §9 fields, scope list, "scope is not rank"; §9b I1/I2 + Amendment 4;
  §14/§14b gate conditions 1–5; §15 HELD.
- `docs/architecture/JARVIS_EPISTEMIC_COHERENCE_CAPABILITY_2026-08-09.md` — §3 typed source
  authority; §5 proof ladder + three-vocabulary warning; §6 recomputable state; §7 contradiction
  taxonomy ("detecting these automatically is entirely unbuilt"); §13 + the §22 supersession header.
- `docs/architecture/audits/MAIA_MEMORY_ADVERSARIAL_EVALS_2026-08-09.md` — §1 E1–E14 (E5 AUTHORITY,
  E7 FALSE INFERENCE, E14 DEEP-TURN); §2 golden-member gate; §3 run-state ledger (not run).
- `docs/architecture/audits/CONVERSATION_IDENTITY_ONTOLOGY_TRACE_BRIEF_2026-08-11.md` — §0 governing
  invariant (verbatim); §1 five proof levels; §2 substrate table + retracted findings.
- `docs/ops/JARVIS_CLAIM_STATE_ADJUDICATION_2026-08-10.md` — "Non-perturbation control (mandated)"
  (vocabulary collision, R4).
- `docs/canon/CORPUS_WEIGHTING_SCHEMA_v1.0.md` — the non-derivation law
  (`corpus_weight ≠ authority_scope`).
- `docs/governance/FOUNDER_RULING_SUPER_LEARNER_S22_2026-08-10.md` — §22.2 knowledge-graph
  prohibition reaffirmed; §22.4 four axes, no universal enum; H remains unauthorized.
- `CLAUDE.md` — "LIVE" means code + schema deployed **and exercised**; *declaration is not liveness;
  built ≠ wired; wired ≠ surfacing; surfacing ≠ verified.*

**Prior art** (§4) is cited by method name and originating work from general knowledge of the
published literature; ⚠️ specific arXiv identifiers appearing in the geometric-claim audit were not
re-verified by this unit and are not restated here as this brief's own evidence.

---

```
SOPHONTIC CLAIM STATUS:     PUBLISHED CLAIM — NOT INDEPENDENTLY VERIFIED. Pre-release on the
                            vendor's own word; model, kit, card, report, method notes all forthcoming.
METHOD RECONSTRUCTED:       PARTIAL — 6 of 14 questions source-established; flip-rate FORMULA and
                            ConvergeMini contents NOT source-established. Pair semantics are clear
                            and sufficient to proceed without Sophontic.
PRIOR ART:                  ESTABLISHED AND PRIOR — contrast sets (Gardner 2020); counterfactually-
                            augmented data (Kaushik 2020); metamorphic testing (Chen 1998);
                            CheckList INV/DIR (Ribeiro 2020); minimal pairs. Sophontic contributes
                            packaging and naming, not a new primitive.
JARVIS EXISTING COVERAGE:   Artifact status + execution correctness (proof ladder, gates, witnesses);
                            MAIA-facing adversarial scenarios E1–E14 (specified, NOT RUN);
                            authority cases A–E (derived, no instrument); observability invariant
                            (ratified, one live pass, no regression witness).
MISSING CAPABILITY:         Evaluation of JARVIS's OWN reasoning under changed evidence — whether a
                            conclusion tracked the load-bearing datum or matched corpus surface.
                            Sharpest form: byte-identical content, changed authority.
CLASSIFICATION:             C — ADD PERTURBATION EVALUATION (outside the canonical proof ladder)
RECOMMENDED NEXT UNIT:      Paired-case evaluation, authority rail, first run (~12 pairs) drawn from
                            already-adjudicated history; candidate acceptance instrument for
                            authority_scope gate conditions 1/3/5. Acceptance is a RUN, not a spec.
IMPLEMENTATION AUTHORIZED:  NO
```
