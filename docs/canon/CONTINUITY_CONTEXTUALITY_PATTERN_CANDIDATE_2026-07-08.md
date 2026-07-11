# Continuity ↔ Contextuality — a Constitutional Pattern (CANDIDATE)

**Date:** 2026-07-08
**Status:** CANDIDATE — governance standing per ADR-011, **not ratified.** *Observed across multiple independent architectural scales; candidate for a cross-scale constitutional pattern.* Not shown to hold at every scale — see §5.
**Supersedes:** the earlier framing `EMBODIMENT_AS_CONSTITUTIONAL_PRIMITIVE_CANDIDATE` (removed 2026-07-08). That draft mis-filed this as a *primitive* (irreducible) and mis-located it in one pole ("embodiment"). The correction is §1.
**Grep-of-canon (2026-07-08):** "embodi*" load-bearing in `docs/adr/013-context-assembly-ainos-maia-boundary.md` (14 hits, incl. the governing couplet), `SPIRALOGIC_THESIS.md`, `MAIA_IDENTITY_ONTOLOGY.md`, `SOULLAB_PRESS_DOORWAY_METHOD.md`. This candidate *generalizes* ADR-013's structure; it must never overwrite its wording.
**Related:** [[project_context_assembly_canon]] (ADR-013 — first statement of the pattern) · [[project_encounter_as_primitive]] · [[project_living_fields]] · [[feedback_names_are_filing_decisions]] · [[feedback_taxonomy_collapse_signal]] · [[feedback_earned_simplicity_translation]] · [[project_constitutional_direction_of_authority]]

---

## 1. The correction: this is a pattern, not a primitive — and it lives in the *relationship*

The unit is neither "identity" nor "embodiment." It is the **lawful relationship between an invariant and its contextual expression.** ADR-013's deepest line already *is* this — read its structure:

> **"Identity is continuous; embodiment is contextual."**

It does not define identity. It does not define embodiment. It defines a **relationship** between an invariant and its expression. That is why the line feels fundamental and why it scales without changing its wording.

**Primitive vs. pattern** (the category correction):
- A **primitive** is *irreducible*. *Encounter* is a primitive. *Relationship* is probably a primitive.
- A **pattern** is *generative* — a rule for producing architectures. **Continuous invariant ↔ contextual embodiment** doesn't feel like a *thing*; it feels like a *rule*. Different category. Filing it as a primitive was the error.

## 2. Neither pole stands alone

The relationship is the meaningful unit *because* each pole is empty without the other:

- "Everything is embodiment." → **Embodiment of what?** (no invariant named → no meaning)
- "Everything has a constitution." → **Constitution of what?** (no expression → no reach)

Each question exposes the missing half. Only the pairing carries meaning.

## 3. Observed instances (independent scales)

| Invariant (continuous) | Contextual embodiment |
|---|---|
| Constitution | Living Field |
| MAIA | Field Configuration |
| Identity | Embodiment |
| Practice | Studio |
| Commitments | Organization |
| Grammar | Conversation |
| Relationship | Encounter |

These are presented as **instances of one polarity**, not analogies — *provisionally* (see §5). ADR-013's "one MAIA, contextually embodied" is the **identity-scale instance**, and the first place the pattern was stated in the canon.

### 3a. Two vocabulary registers (the title is the general one)

The table's column heads — *invariant → embodiment* — carry a hidden assumption: that the continuous pole is a **prior authored object** you can point to. That assumption holds for identity, practice, MAIA, commitments. It may *not* hold everywhere (see §9). So the pattern has two registers, and the general one is the doc's title:

- **General register:** **continuity ↔ contextual enactment.** Makes no claim that the continuous pole is a prior object — only that *something persists across many contextual forms.*
- **Center-type specialization:** **invariant → embodiment.** Adds the assumption of an authored, locatable center. A special case, not the whole pattern.

Keep the general register as canonical; treat *invariant → embodiment* as the center-type reading. §9 is what forced this distinction.

## 4. Relationship to ADR-013 (deepen, never overwrite)

ADR-013 remains the ratified statement at the identity scale: *"Identity is continuous; embodiment is contextual"*, operationalized as Field Configuration and Invariant 17. This candidate proposes only that the *structure* recurs at other scales. **Guardrail:** cite this doc as the generalization; do not retroactively balloon ADR-013's local wording to claim cross-scale scope on its behalf.

## 5. Scope discipline — resist the elegant over-claim

The tempting sentence — *"Constitution is continuous; embodiment is contextual, at every scale"* — is **stronger than the evidence earned.** It has been demonstrated convincingly across several architectural layers (§3); it has **not** been shown to survive *every* scale. Faithful phrasing, per this project's governance method:

> **Observed across multiple independent scales. Candidate for a cross-scale constitutional pattern.**

Less elegant, more honest. (Cf. earn-before-name; name the level; verification requires a frozen subject.)

## 6. The design test (sharpened — two questions)

> **Jurisdiction of this test** (every constitutional test must declare one — see §12):
> **Applies to:** center-type embodiments — Identity, MAIA, Practice, Studio, Commitments.
> **Does NOT apply to:** attractor-type continuities — communities, distributed cultures, emergent collectives (use §9a instead). Running this test there produces false negatives.

For any *center-type* proposed embodiment (a Studio, a Field with an authored center, a feature), ask **both**:

1. **What invariant is being embodied?**
2. **What is legitimately contextual about this embodiment?**

**If either answer is missing, it is not an embodiment.** Missing (1) → it's a *feature*. Missing (2) → it's a *slogan* (an invariant with no honest room to adapt). Both answerable → a candidate embodiment worth building.

(Earlier this test named "a Community" among its targets. §9a corrects that — a category error, like asking a physics equation to adjudicate a legal system.)

## 7. Promotion criterion — exclusion, not description

A candidate is *not* strengthened because it explains the past or compresses what's already built. It is strengthened when, facing a **live** design choice, it **excludes plausible alternatives**:

> "No — that option violates the invariant."
> "These three implementations are all possible; only one is a faithful embodiment."

When a candidate begins *excluding* plausible options rather than merely *describing* what exists, it has begun functioning as **architecture** instead of **interpretation**.

**Two asymmetrical evidence types** (correction — exclusion is *necessary*, not *sole*):
- **Negative evidence (necessary):** the pattern *excludes* an otherwise plausible design ("this fractures the invariant"; "no invariant can be named, so this isn't an embodiment"). Strong, because it constrains choice.
- **Positive evidence (insufficient alone):** the pattern *generates* a design that later proves coherent — a simpler architecture, a predicted structure that survives use, independent builders converging on the same embodiment. Weak alone, because hindsight rationalizes it. Not *zero* weight, as an earlier draft implied — **insufficient**, which is different.

Together they become compelling. The promotion bar:

> **A generative pattern earns standing when it repeatedly excludes plausible alternatives *while* generating architectures that remain coherent under lived use** — not when it sounds universally true, not when it merely compresses the past.

(*Description is what a generative rule does for free* — which is why explanation carries almost no evidential weight, and why the only arena that can't be rewritten afterward, the next real design decision, is the one that counts.)

## 8. Larry as the first live test

Larry's embodiment is valuable here not because it will *prove* the pattern (explaining a success is the weak form) but because it gives the pattern a chance to **constrain a real decision** — to say "no" to a plausible option, or to select the one faithful implementation among several. Watch specifically for the moment the two questions in §6 *exclude* something Kelly would otherwise have built. That moment is the evidence, not the launch.

## 9. The community stress test — constitutional center vs. constitutional attractor

Not an open question. The **stress test.** Every other row in §3 has a relatively clear continuity with a locatable source: identity persists, a practice has commitments, an organization has constitutional commitments, MAIA has constitutional identity. A **community is different** — its continuity is not authored by any single participant, and it is not merely emergent in the weak sense. It is **distributed**: maintained *through ongoing participation* rather than existing as a prior object.

That suggests a distinction:

- **Constitutional center** (identity, practice, MAIA, Studio, commitments): a locatable source that *authors* the invariant. The center-type register (§3a, *invariant → embodiment*) applies.
- **Constitutional attractor** (community): stabilizes around commitments *without possessing a single center*. Its continuity is a standing pattern that participation keeps re-enacting — real and stable, but not pointable-to independent of the flow that sustains it.

For attractors, the shape is not *one invariant → many embodiments* but **one continuity → many contextual enactments** (the general register, §3a). The continuous pole exists in the enacting, not prior to it.

### 9a. Consequence: the §6 design test has a jurisdiction

This is the sharp downstream effect, and the reason the distinction matters operationally. **The two-question test in §6 is the *center-type* test.** Applied to an attractor-type field, it *misfires*: it finds no prior nameable invariant and wrongly returns "missing pole 1 → not an embodiment" or "missing pole 2 → just a slogan" — a **false negative that rejects a legitimate community field.** So §6 needs a scope marker, and attractors need a companion test defined by *refusal* rather than by a prior object:

> **Attractor-type test:** *What continuity does participation keep re-enacting, such that its **absence** would dissolve the field?* Identify the continuity by **what its absence would destroy**, not by an object you can name in advance.

"Continuity," not "commitment" — because communities persist around things nobody explicitly committed to (rituals, practices, narratives, shared attention, mutual recognition, tacit norms). The word looks circular (continuity defined by continuity) but isn't: the **refusal clause** — *absence would dissolve the field* — is what gives it content operationally, without deciding in advance which form (commitment? ritual? recognition?) is primary.

(Naming caution, [[feedback_names_are_filing_decisions]]: "attractor" is borrowed from dynamical systems and is **candidate vocabulary**, not adopted canon — grep and ratify before it hardens.)

### 9b. If this holds, it is a success, not a failure

If communities have attractors rather than centers, the pattern hasn't broken — **you've found the boundary of its jurisdiction**, which is itself a constitutional finding (cf. [[project_epistemic_jurisdiction_canon]]). Either outcome is productive: if the community row survives repeated testing under the attractor-type test, the pattern has earned something substantial; if it doesn't, you've learned the pattern's jurisdiction instead of forcing reality to fit it.

## 10. Residual open questions (hold open)

1. **Do all four §3 "center-type" rows truly have authored invariants**, or is one of them secretly an attractor too?
2. **Is there a third mode** beyond center and attractor?
3. **Where else does the pattern break?** It earns more from one honest scale where it fails than ten where it fits. Keep seeking the scale that doesn't obey.

## 11. Research hypothesis (NOT canon) — two modes of continuity

Center and attractor may not be two ontological *kinds* but two **modes of continuity**:

- **Referential continuity (centered):** continuity maintained *by reference* to a persisting source. Temporal logic points **back**: *"I remain me."*
- **Recurrent continuity (attractor):** continuity maintained *by recurrence* of enactment. Temporal logic points **forward**, continually reconstituting: *"We keep becoming this."*

If this survives, it explains why one design test fails on the other **without the pattern breaking** — continuity itself would have multiple lawful forms.

**Standing: research hypothesis, explicitly not canon.** The test that would promote it is *not* elegance and *not* that it explains §9. It is this: **does the distinction predict a different *protection mechanism* for each mode?** A center is threatened by *inconsistency* and protected by guarding consistency (cf. Invariant 17, "one MAIA"). An attractor is threatened by *abandonment* and protected by sustaining participation. If that prediction holds against a real field, the distinction did work and earns standing. **If both modes turn out to need the same protection, the distinction was ornamental** — beautiful and idle. Hold it here until a live decision decides.

## 12. Methodological instrument (candidate) — tests inherit jurisdiction

The genuinely new move today was not "attractor." It was: **a test inherits the jurisdiction of the pattern it evaluates.** Tests are not universal; applying one outside its jurisdiction is a category error (physics equation → legal system). Proposed standing format for *every* constitutional test:

```
Jurisdiction:
  Applies to:
  Does not apply to:
```

This parallels an earlier instrument — the **collapse detector** (*does this layer have its own jurisdiction?*). The new one is the **test-jurisdiction detector** (*does this test have its own jurisdiction?*). Same shape, different level (layers vs. tests).

**Standing note (be exact):** the test-jurisdiction principle has earned **one** instance — the §6 test misfiring on communities. That is *one* case, and it was reasoned, not observed (we argued the test *would* misfire on a community field; we have not built one and watched it happen). One reasoned instance is enough to adopt the *format* as discipline; it is **not** enough to claim "every test has a jurisdiction" as a law. Second independent instance required before generalizing.

## 13. Standing audit — the brake (read before adding another layer)

Today produced a nested stack of candidates: *embodiment* → *continuity↔contextuality pattern* → *center/attractor* → *referential/recurrent modes* → *tests-inherit-jurisdiction*. Every layer is elegant and compresses what came before. By this doc's own §7 bar, **that is exactly the property that carries no evidential weight** — *description is what a generative rule does for free.*

The honest status of the entire stack: **not one layer has yet excluded a real design alternative under live pressure.** The community "misfire" that generated §9–§12 was itself a thought experiment, not a build. So the whole tower stands at one standing: *reasoned, unearned.*

The methodology's health does not depend on adding a cleaner sixth layer. It depends on the next event being a **decision** — Larry's center-type embodiment giving §6 a real choice to constrain, or a real community field giving §9a one. Until then, resist generating layer six. The healthiest reason this evolved today is that the community case *refused to fit a tool* — but a refusal reasoned in advance is a hypothesis, not evidence. **Next event: a live decision, not another distinction.**

### 13a. Evidentiary gradient (candidate instrument)

Not all resistance carries equal standing. A gradient, so a thought experiment is never mistaken for a painful engineering decision:

| Source of resistance | Standing |
|---|---|
| Logical contradiction (reasoned) | Weak candidate |
| Conflict with an existing artifact — **reasoned by inspection** | Candidate |
| Conflict with an existing artifact — **observed when exercised** | Stronger candidate |
| A real design decision constrained under pressure | Promotion candidate |
| Multiple independent design decisions constrained | Constitutional evidence |

**Self-application (the point):** an earlier read placed the community misfire at "existing implementation conflict." Graded honestly, it sits *lower* — no community field was built or run; the clash between the written §6 test and the community category was **reasoned by inspection**, not observed when exercised. So it is rung 2, *not* rung 3. Larry's embodiment decision would be rung 4 (promotion candidate); repeated independent decisions, rung 5.

The single most important line the gradient enforces: **"existing implementation conflict" hides the reasoned/observed axis** — collapsing the two lets a fluent thought experiment launder itself upward into something that sounds observed. That laundering is exactly what §13 exists to stop, which is why the gradient must keep the two rungs distinct.

**Standing of the gradient itself:** it is layer six — a methodological candidate that has not yet sorted a real decision. Adopt it as *format/discipline* (as with the §12 jurisdiction header), not as a proven law. By its own first rung, this note is reasoned, not observed.

## 14. First run of §6 under pressure (Larry / client-derived recognitions)

**The decision (framed narrowly, both options defensible):** *May MAIA's live field behavior in Larry's Studio draw on unpublished client-derived recognitions from his practice (de-identified) — Option B — or only on knowledge Larry has published or deliberately curated — Option A?*

**Steelman first (safeguard against center-picking to ratify a preference):**
- **A's best case:** the consent-for-memory vow ("no stealth memory") + provenance discipline. Published/curated material has clean, *Larry-authored* provenance and stays inside a consent boundary he can actually author.
- **B's best case:** the business model's governing sentence — the platform stewards the practitioner's *judgment*, which is largely **tacit**; a Studio of only published corpus is a bibliography, not a practice; embodiment fidelity (§6) needs the living layer.

**Center identified independently** (from artifacts authored *before* this decision, not chosen to favor an option): pattern doc §3 lists **Practice → Studio** (not Corpus → Studio); the business-model governing sentence locates the core asset in *judgment*, which is relational. ⟹ Center = **Larry's practice of accompaniment**, whose *nature* is relational and consent-bound.

**Exclusion:** Option B draws recognitions formed inside confidential relationships and redeploys them, through MAIA's field, to *other* people. Prior canon `MAIA_MEMORY_CANON_v1.0.md:61` governs exactly this: patterned wisdom may flow only if **distilled, anonymized, AND consent-gated.** B satisfies distilled + anonymized ("no client-identifying info") but **fails consent-gated** — the clients never consented. **⟹ Option B, as written, cannot honestly claim to preserve the center. Excluded.**

**Did the test do work, or describe?** It did work — with three qualifications, stated honestly:
1. **It excluded the option the framer leaned toward protecting.** The hypothesis was that §6 might exclude *A*; run honestly it excluded *B*. A test that contradicts its runner is constraining, not ratifying a preference — the strongest validity signal available here.
2. **§6 did not exclude unaided.** Its two questions *localized* the decision to "what is the center, and can each option preserve it," and identified the center as consent-bound. The *exclusion* was completed by a pre-existing consent vow (§61). §6 alone strained B; §6 + prior canon excluded it.
3. **The exclusion names a repair, not a death.** B fails only the consent-gate. So the test dissolved a false binary: the real live candidates are **A** vs **B′ = B + a consent gate on which client-derived recognitions may generalize.** Naming the precise missing invariant (client consent) is architecture doing work, not interpretation.

**Residual honesty:** the decision ultimately reduces to one contested question §6 cannot answer alone — *is a client-derived recognition Larry's to deploy, or the client's to consent to?* Prior canon (§61) answers it in favor of the client's consent. The test localized; the canon adjudicated.

**Evidentiary standing (per §13a):** grounded in three pre-existing independent artifacts (pattern §3, business governing sentence, MAIA_MEMORY_CANON §61), *reasoned by inspection* — **rung 2–3, not rung 4.** No build was executed under pressure; this was reasoned against existing canon, which is more than the community misfire (a fresh thought experiment) but less than an engineering decision that actually shipped. **First entry on the ladder above the bottom rung. The pattern is beginning to constrain — provisionally.**
