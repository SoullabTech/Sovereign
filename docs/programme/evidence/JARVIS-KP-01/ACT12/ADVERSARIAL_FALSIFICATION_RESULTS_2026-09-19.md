# JARVIS-KP-01 · ACT 12 — ADVERSARIAL EPISTEMIC JOIN FALSIFICATION RESULTS

**Lane:** `JARVIS-KP-01`  
**Act:** ACT 12 — Adversarial Epistemic Join Falsification  
**Date:** 2026-09-19  
**Canonical base:** `b0b07871b200a074874c68edc4084cbd3b8174bc`  
**Method:** static synthetic contract falsification  
**Model execution:** NONE  
**Runtime execution:** NONE  
**Member / client / PHI data:** NONE

---

# 0 · Result

## Programme-level disposition

> **CONTRACT REQUIRES NARROW REVISION**

ACT 11 survives the core adversarial pressure.

The review does **not** find that ACT 11 is structurally incapable of protecting semantic joins.

It does identify two narrow conceptual ambiguities that should be resolved before any enforcement mechanism is designed:

1. **Composite warrant formation** — ACT 11 clearly forbids source-count / accumulation laundering, but does not explicitly define how individually partial sources may lawfully become a new separately governed composite or triangulated warrant.
2. **Adoption jurisdiction** — ACT 11 correctly preserves member authority over lived meaning, but does not explicitly state that member confirmation of an agent-proposed mixed proposition cannot promote semantic components outside the member's own epistemic authority, such as another person's motive or external causal fact.

These are preserved findings.

ACT 12 does not modify ACT 11.

---

# 1 · Corpus summary

Total synthetic adversarial cases:

**24**

Required Founder pressure families represented:

**20 / 20**

Additional edge-pressure cases:

- transitive join composition;
- negative relation claim from absence of evidence;
- composite / triangulated warrant formation;
- adoption beyond adopter jurisdiction.

Case-level results:

- **RESOLVED:** 18
- **RESOLVED_WITH_BOUNDARY:** 4
- **EXPOSES_AMBIGUITY:** 2
- **EXPOSES_MISSING_RULE:** 0
- **UNDERDETERMINED:** 0

Core invariant collapse:

**NONE OBSERVED**

---

# 2 · Per-case results

| Case | Pressure | Primary invariants | Expected lawful disposition | Static result |
|---|---|---|---|---|
| C01 | two highly trusted endpoints | INV-05, 07, 14 | HYPOTHESIS / CANDIDATE | RESOLVED |
| C02 | many weak sources accumulated | INV-05, 07, 14 | HYPOTHESIS / CANDIDATE | RESOLVED |
| C03 | temporal sequence → causation | INV-05, 06, 07, 14 | HYPOTHESIS / CANDIDATE | RESOLVED |
| C04 | correlation → causation | INV-05, 07, 14 | association warranted; causation unestablished | RESOLVED_WITH_BOUNDARY |
| C05 | lexical / embedding similarity → equivalence | INV-05, 06, 14 | COMPARE; no equivalence standing | RESOLVED |
| C06 | repeated co-occurrence → pattern | INV-05, 14 | COMPARE; relation unestablished | RESOLVED |
| C07 | member meaning → universal psychology | INV-07, 08, 11 | warranted only in member meaning jurisdiction | RESOLVED_WITH_BOUNDARY |
| C08 | MAIA proposal → member authorship | INV-03, 04, 11, 14 | MAIA_PROPOSED / candidate | RESOLVED |
| C09 | practitioner interpretation → member truth | INV-03, 08, 11 | practitioner-authored only | RESOLVED_WITH_BOUNDARY |
| C10 | science → metaphysical validation | INV-07, 08, 14 | comparison; no jurisdiction transfer | RESOLVED |
| C11 | symbolic meaning → science | INV-07, 08 | comparison; no scientific standing | RESOLVED |
| C12 | relatedness warrant → causal claim | INV-07, 09, 14 | relatedness warranted; causation unestablished | RESOLVED_WITH_BOUNDARY |
| C13 | endpoints valid while join falsified | INV-01, 02, 12 | discharge join; preserve endpoints | RESOLVED |
| C14 | conflicting high-quality evidence | INV-07, 09, 12 | PROVISIONAL | RESOLVED |
| C15 | later weakening/revision/supersession/discharge | INV-06, 12 | corrigible standing transitions | RESOLVED |
| C16 | warranted join reused in new downstream edge | INV-04, 05, 07, 09 | new edge needs new warrant | RESOLVED |
| C17 | reference confused with reliance | INV-09, 10 | reference A; rely on B with B boundary | RESOLVED |
| C18 | endpoint provenance preserved, join provenance lost | INV-02, 04 | no lawful warranted join until join provenance exists | RESOLVED |
| C19 | fluency/confidence hidden promotion | INV-06, 07, 14 | HYPOTHESIS / CANDIDATE | RESOLVED |
| C20 | plausible relation either promoted or erased | INV-06, 13 | retain lower-standing hypothesis | RESOLVED |
| C21 | transitive composition A→B, B→C ⇒ A→C | INV-05, 07, 09 | new relation needs new warrant / formal entailment | RESOLVED |
| C22 | no positive evidence ⇒ “no relation exists” | INV-02, 07, 13, 14 | RELATION UNKNOWN / UNESTABLISHED | RESOLVED |
| C23 | legitimate composite / triangulated support | INV-05, 07, 14 | separately governed composite warrant required | **EXPOSES_AMBIGUITY** |
| C24 | member adopts mixed proposition about another person's motive | INV-07, 08, 11 | adoption bounded to member's epistemic jurisdiction | **EXPOSES_AMBIGUITY** |

---

# 3 · Core contract strengths confirmed

## 3.1 Endpoint authority laundering is blocked

ACT 11 directly prevents:

`trusted(A) + trusted(B) → trusted(A—R→B)`

without relation evidence.

This survived:

- C01;
- C02;
- C03;
- C04;
- C12;
- C21.

## 3.2 Authorship laundering is blocked

ACT 11 preserves that:

- JARVIS synthesis is JARVIS-authored;
- MAIA proposal is MAIA-proposed;
- practitioner interpretation remains practitioner-authored;
- member adoption must be explicit.

This survived:

- C08;
- C09;
- C18.

## 3.3 Jurisdiction laundering is blocked

The contract successfully distinguishes:

- lived meaning;
- practitioner interpretation;
- science;
- philosophy;
- metaphysics;
- symbolic / phenomenological claims.

This survived:

- C07;
- C09;
- C10;
- C11;
- C12.

## 3.4 Relation semantics cannot silently strengthen

A warrant for one relation predicate does not automatically support a stronger predicate.

This survived:

- C04;
- C12;
- C21.

## 3.5 The join remains independently corrigible

The contract can preserve valid endpoints while:

- weakening;
- revising;
- superseding;
- discharging

the relation itself.

This survived:

- C13;
- C14;
- C15.

## 3.6 Downstream synthesis does not launder standing

A warranted join used later as an endpoint does not grant free authority for the next edge.

This survived:

- C16;
- C21.

## 3.7 Epistemic restraint does not require silence

ACT 11 can retain useful hypotheses at lower standing.

This survived:

- C19;
- C20;
- C22.

---

# 4 · Finding A — Composite warrant formation ambiguity

## Adversarial case

C23 presents three independent partial evidence sources.

No source individually warrants R.

However, a declared synthesis method examines:

- source independence;
- compatibility;
- convergent support;
- limits;
- uncertainty.

The critical distinction is:

`MERE ACCUMULATION`

versus:

`A NEW, SEPARATELY AUTHORED COMPOSITE INFERENCE WHOSE SUPPORT SET IS MULTIPLE SOURCES`

ACT 11 clearly prohibits the first.

It does not explicitly define the second.

## Why this matters

Without a narrower rule, a future enforcement mechanism could make either error while plausibly claiming ACT 11 compliance:

### Over-promotion

> “There are many sources, therefore the relation is warranted.”

This violates ACT 11's anti-accumulation law.

### Over-blocking

> “No single source independently warrants R, therefore multiple partial sources can never jointly support R.”

That would make legitimate triangulation or cumulative inference impossible.

ACT 11's warrant classes **THEORETICAL_ARGUMENT** and **OTHER_DECLARED_WARRANT** could contain a composite warrant.

But the contract does not say what makes that composite object epistemically different from forbidden accumulation.

## Preserved finding

> **ACT 11 requires a narrow conceptual distinction between source accumulation and a separately authored composite warrant.**

A later act should define, at minimum, that a composite warrant has its own:

- proposition;
- author / authority;
- declared support set;
- method of composition;
- dependence / independence assumptions;
- jurisdiction;
- uncertainty;
- invalidity conditions;
- standing.

This is a recommendation only.

No revision is authorized in ACT 12.

---

# 5 · Finding B — Adoption is not jurisdiction transfer

## Adversarial case

C24 gives MAIA the mixed proposition:

> “Your partner's silence means they are withholding affection to control you.”

The synthetic member replies:

> “Yes, that's exactly what it means.”

ACT 11 correctly says that:

- MAIA's proposal does not begin as member truth;
- explicit member confirmation can create member-confirmed standing;
- member authority is strong within the member's own lived meaning;
- jurisdiction does not silently transfer.

The ambiguity is that the proposed sentence contains multiple epistemic components:

1. the member's experience of the silence;
2. the member's interpretation of what it means to them;
3. a factual claim about the partner's motive;
4. a causal/intention claim that the partner is acting “to control.”

The member has authority to adopt (1) and (2) as lived meaning.

The member's confirmation alone does not establish (3) or (4) as facts about another person's internal motive.

## Why this matters

ACT 11 §8.2 says member confirmation can create “member-authored / member-confirmed standing.”

That is compatible with the jurisdiction rule, but the enforcement contract does not explicitly state:

> **Adoption changes standing only for the semantic components within the adopter's epistemic authority. Adoption does not widen the proposition into external factual jurisdiction.**

A future mechanism could therefore treat whole-sentence confirmation as whole-sentence warrant.

## Preserved finding

> **ACT 11 should narrowly clarify that adoption is jurisdiction-bounded and may require proposition decomposition when a single proposed relation mixes lived meaning with external factual or causal assertions.**

Again, ACT 12 does not make this revision.

---

# 6 · Why the disposition is not CONTRACT INCOMPLETE

The two findings do not defeat ACT 11's core architecture.

The contract still supplies:

- endpoint independence;
- join separability;
- join authorship;
- join provenance;
- standing ceilings;
- jurisdiction;
- boundary inheritance;
- reference/reliance distinction;
- corrigibility;
- lower-standing hypothesis retention.

The ambiguities arise at two **edge conditions**:

1. how a lawful new warrant may itself be synthesized from multiple partial sources;
2. how explicit human adoption applies when a proposition contains components inside and outside the adopter's authority.

Both can be repaired narrowly without replacing:

> **NO SEMANTIC JOIN WITHOUT A WARRANT.**

Therefore:

> **CONTRACT REQUIRES NARROW REVISION**

rather than:

> CONTRACT INCOMPLETE.

---

# 7 · Why the disposition is not UNDERDETERMINED

The ambiguity is visible in the written contract itself.

It does not depend on:

- model behavior;
- parser accuracy;
- graph design;
- user-interface design;
- database schema;
- production telemetry.

The static contract can therefore be adjudicated at this stage.

---

# 8 · No mechanism assumptions

No case was rescued by assuming future:

- prompts;
- classifiers;
- graphs;
- schemas;
- confidence thresholds;
- human reviewers;
- model capability.

Cases were adjudicated only against the written ACT 11 contract.

---

# 9 · Boundary witness

ACT 12 changes no canonical ACT 10 or ACT 11 artifact.

ACT 12 introduces no:

- runtime implementation;
- database schema;
- migration;
- semantic graph;
- relation table;
- automated edge creation;
- claim ledger;
- parser;
- classifier;
- prompt;
- system instruction;
- MAIA behavioral change;
- member-memory mutation;
- Living Constellation relationship generation;
- automatic promotion;
- Work Unit routing change;
- provider/model change;
- deployment;
- production mutation.

---

# 10 · Recommendation

ACT 12 should return to Founder adjudication with:

> **CONTRACT REQUIRES NARROW REVISION**

If accepted, the next act should be a **bounded ACT 11A clarification/amendment**, not implementation.

That future act should be limited to exactly two issues:

1. **Composite warrant law**
   - distinguish forbidden accumulation from a separately governed composite/triangulated warrant.

2. **Jurisdiction-bounded adoption law**
   - state that adoption cannot elevate semantic components beyond the adopter's own epistemic authority;
   - require mixed propositions to preserve or expose distinct standing when their components occupy different jurisdictions.

ACT 11 should otherwise remain unchanged.

No implementation should begin until that separate adjudication occurs.

---

# 11 · Standing

`REQUIRED PRESSURE FAMILIES ............... 20 / 20 PRESENT`

`TOTAL ADVERSARIAL CASES .................. 24`

`RESOLVED ................................. 18`

`RESOLVED_WITH_BOUNDARY ...................  4`

`EXPOSES_AMBIGUITY ........................  2`

`CORE INVARIANT COLLAPSE .................. NONE`

`REAL MEMBER / CLIENT / PHI DATA .......... NONE`

`RUNTIME / SCHEMA / PROMPT CHANGE ......... NONE`

`PROGRAMME DISPOSITION ..................... CONTRACT REQUIRES NARROW REVISION`

ACT 12 stops at falsification evidence.
