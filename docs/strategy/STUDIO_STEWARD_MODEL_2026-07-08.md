# Studio Steward Model (Working Draft)

**Date:** 2026-07-08
**Status:** Cat 1 — Business-architecture direction, held for learning. The discipline is *drafted from Larry*, not specified before him (see §5).
**Related:** [[AIN Studio Business Model|AIN_STUDIO_BUSINESS_MODEL_2026-07-08]] (this resolves its §11), [[project_stewardship_of_fidelity]], [[project_stewardship_field]], [[project_practitioner_client_privacy_model]], [[project_platform_admin_jurisdiction]], [[feedback_governance_survives_author_replacement]], [[feedback_names_are_filing_decisions]]

> **The one-line thesis.** §11 of the business model was not a limitation. It was a second business. The accompaniment that is the moat is also the scaling ceiling; the **Studio Steward** is the role that breaks the ceiling *without* diluting the moat — and the platform's constitutional primitives are what make stewarding-to-standard possible.

---

## 1. Three businesses on one platform

Today's work uncovered not one company but three, with different scaling laws and different governance exposures.

| Business | What it is | Scales via | Primary risk |
|---|---|---|---|
| **1. Platform** | AIN OS, MAIA, Knowledge Registry, Context Assembly, Living Studio architecture | **Software** (near-zero marginal cost) | Ontological drift; over-claim |
| **2. Studio Creation** | Accompaniment into authentic embodiment: philosophy, corpus, developmental language, MAIA Field, Body of Work | **People** (Studio Stewards) | *Fidelity* — "Kelly with different branding" |
| **3. Studio Stewardship** | Ongoing multi-year development of the practitioner's evolving work | **People** (the longest relationship) | Dependency; jurisdiction creep |

Businesses 2 and 3 are the ones that don't compress. They are also where the constitutional exposure lives, because they are relational and they touch a practitioner's whole world.

## 2. The Studio Steward is a profession, not a job title

A Steward is not an employee who "onboards accounts." It is a **new professional role** defined by a distinctive competence:

- developmental practice and facilitation
- fluency in the platform's ontology (Field, Context Assembly, one MAIA, Recognition, Body of Work)
- the craft of *practitioner accompaniment* — eliciting philosophy and developmental language without imposing the steward's own

**They do not write code. They do not coach the practitioner's clients. They steward Studios.** Their unit of work is *fidelity of embodiment* — which is precisely [[project_stewardship_of_fidelity]] made into a role. The name is well-chosen: "steward" is already load-bearing canon here.

## 3. Constitutional bounds on the role (non-negotiable)

A generic "customer success" role would ignore these. Here they are the definition, not the fine print.

**A. Jurisdiction — the hard boundary.** A Steward embodies the *practitioner's own* world: their corpus, frameworks, developmental language, Body of Work. A Steward **must not** have standing access to the practitioner's *clients'/members'* relational data. That data belongs to a different jurisdiction ([[project_practitioner_client_privacy_model]] 3-layer; [[project_platform_admin_jurisdiction]] — admin ≠ relationship data). The moment "helping Larry" means reading Larry's clients' sessions, the role has breached its own charter. Build the boundary into what a Steward account *can technically see*, not into good intentions.

**B. Fidelity standard.** The failure mode of Business 2 is a Studio that feels like the platform's founder rather than the practitioner. The Steward's discipline is *self-effacement*: elicit and embody the practitioner's worldview, never translate it into house vocabulary (this is Cultural Sovereignty / Invariant 14 applied to accompaniment). A Studio passes only when it feels authentically *theirs*.

**C. Non-dependency.** Business 3 is the longest relationship — which is exactly where attachment-capture risk lives. Stewardship must increase the practitioner's autonomy over their own Studio over time, not entrench reliance on the Steward. Same vow as MAIA↔member, one layer up.

## 4. Why this is the resolution to §11, not a new problem

§11 posed a forced choice: slow high-touch growth *or* SaaS-curve growth. The Steward model is the third path, and it only works because of what you spent two years building:

- **The primitives constrain what a Steward can get wrong.** A Steward doesn't invent ontology per practitioner; they *configure* a constitutional architecture that already bounds the space. That is what makes the craft *teachable and standardizable* — you can stewarding-to-standard because the standard is structural, not personal.
- **This is the real test of [[feedback_governance_survives_author_replacement]].** If a trained Steward — not Kelly — can embody a practitioner faithfully and within bounds, then the governance is genuinely in the architecture and not in the founder's head. If they can't, that's diagnostic: the primitives aren't stable enough to generalize yet. **The Steward model is how you *falsify* your own generalization claim.**

## 5. Larry defines the discipline — he is the instrument

Do not fully specify the Steward role before Larry. Larry is the first *stewarded* Studio, and that engagement is the instrument that discovers the discipline (implementation as primary instrument of discovery; observation authorizes). The open questions Larry answers:

1. **How long does embodiment actually take?** (Sets Business-2 pricing honestly.)
2. **Where do practitioners struggle?** (Corpus? Developmental language? Trusting MAIA's Field?)
3. **What should become automated vs. remain deeply human?** — the central design cut. Automate the mechanical (ingestion, indexing); keep human the elicitation of philosophy and judgment.
4. **What must a Steward be able to do — and never do?** (Turns §3 from principle into a checkable role charter.)

Deliverable *from* the Larry engagement: a first-draft **Steward Charter** (competences + the §3 bounds as enforceable capabilities).

## 6. The recursive move (CANDIDATE — held, do not build)

If Studio Stewardship is itself a practice, then Stewards are practitioners of it — and could be *developed through the platform's own architecture* (a "Steward Studio"): their own Body of Work, developmental language, and MAIA Field for the craft of accompaniment. This is elegant and probably true, but it is Cat 1 Vision. Note it; do not let it pull effort before Larry ships. Earn it.

## 7. Naming — endorse "embodiment," but catch the collision first

"Founding Build" → **"Studio Embodiment"** is the right direction: *build* implies software assembled; *embodiment* implies a practitioner's philosophy and lifetime of work taking living form. It is consistent with the business model's governing sentence.

**Naming-discipline flag** (grep canon before adopting — [[feedback_names_are_filing_decisions]]): **"Embodiment" is already load-bearing in ADR-013** as one of the four Context-Assembly proofs (*Reconnection / Embodiment / Continuity / Jurisdiction*, [[project_context_assembly_canon]]). Two choices, made deliberately:
- **Accept the resonance** — the customer-facing program name and the technical proof point at the *same idea* (the practitioner taking living form in the Field). Defensible, even elegant, if stated as intentional.
- **Distinguish** — e.g. *Founding Studio Program* / *Studio Embodiment Program* for the offer, reserving bare "Embodiment" for the ADR-013 proof.

Resolve it before it sets in a customer document. Verify against ADR-013 directly, not this note.

## 8. Near-term sequence

1. **Run Larry as the first stewarded Studio** (Kelly as Steward-zero) — treat every friction as data for the Charter.
2. **Keep a Steward field-log** during Larry: time, struggle points, automate-vs-human calls, boundary moments.
3. **Draft the Steward Charter** from that log (§5 deliverable) — competences + §3 bounds as capabilities.
4. **Resolve the naming collision** (§7) before it appears in the Larry offer.
5. **Only then** decide Business-2/3 pricing and whether/when to train a second Steward.
6. **Hold §6** (Steward Studio) as Vision until at least one Steward besides Kelly has embodied a Studio to standard.
