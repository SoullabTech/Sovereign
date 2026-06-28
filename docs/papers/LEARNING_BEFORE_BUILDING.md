# Learning Before Building
*How disciplined inquiry shapes the architecture before implementation.*

**Audience:** Internal team — engineering, product, practitioner collaborators, and new contributors.
**Status:** Team process paper. It describes *how we work* and *how an idea earns the right to shape what we build*. It is **not canon and not an ADR** — it defines no architectural constraints. It explains how those constraints are discovered, and how future work should proceed.

---

## How to Read This Paper

- It describes our current method.
- It is not an architectural decision.
- It is not evidence that the method is correct.
- It explains how we intend to learn.

---

## Opening

We discovered that the hardest problems we were encountering were no longer implementation problems. They were problems of deciding when an idea had earned the authority to shape architecture.

We are good at building. Give the team a clear specification and it ships. The bottleneck moved upstream — to the question of *which ideas deserve to become specifications in the first place*. This paper is about that question, and about the small set of habits we adopted to answer it honestly.

It exists so that anyone touching MAIA can understand not just what we currently believe, but how we decide what to believe, and how a good idea is allowed — slowly, and reversibly — to start constraining the system.

---

## 1. The engineering problem we encountered

We repeatedly found ourselves making architectural decisions that felt obvious in the moment but were supported primarily by coherence rather than exposure — they fit everything we already believed, and almost nothing we had yet tested. The danger, we came to see, was never a shortage of good ideas. It was good ideas adopted too early.

A genuinely elegant framing has a particular hazard: it explains everything you have already done, and then quietly begins dictating the next schema, the next API, the next migration — before any evidence has said that it should. The explanation feels like justification. It is not. Fit with the past is not a license over the future.

In a system meant to last, premature authority is expensive. A wrong column becomes load-bearing. A wrong abstraction is depended upon by three services before anyone notices it was a guess. The cost of removing a mistaken commitment grows with every layer built on top of it. We caught ourselves, more than once, designing architecture for value we had not yet validated — building five years of structure on one week of conviction.

The turning point was naming the problem precisely: *architectural commitment had begun to outrun available evidence.* The issue was not exploration — thinking broadly is cheap and good. It was deciding too much before exposure. So the problem to solve was not "have better ideas." It was: **how do we let ideas inform the build without letting unproven ideas command it?**

What follows is our current method for answering that question. It is itself a candidate, subject to the same discipline it describes (see the closing).

---

## 2. The distinction between evidence and authority

The central move is to treat **evidence** and **authority** as different things with different lifecycles.

- **Authority** is permission to constrain future decisions.
- **Evidence** is what an idea accumulates over time through contact with the world.

The two do not move together automatically, and the discipline of this paper is mostly about refusing to let one borrow the other. As the Field Intelligence canon puts it: *evidence accumulates; authority does not.* An idea can have enormous explanatory appeal — it fits everything we have seen — and still have zero predictive authority, because it has never once told us something we did not already know.

Different kinds of evidence answer different questions. Observation may challenge whether a model is **accurate**; practitioner experience may challenge whether a design is **useful**. We refer to these as questions of *truth* and *fitness*. The protocol keeps them distinct because they imply different revisions: a truth problem may require revising the model; a fitness problem may require revising the implementation.

From this follows our working definition of legitimate representation — and almost everything we build is a representation: a model, a document, a schema, an AI's output, an interview template. A representation is **legitimate while it remains correctable by what it represents.** It crosses into illegitimate authority the moment it becomes the final word — unaccountable to the observations or the lived experience that should be able to revise it. That is the Representation–Participation Covenant, stated operationally: representation serves participation; it must never substitute for it.

---

## 3. The protocol for earning authority

Ideas enter as **candidates**, not constraints. Part of this protocol is settled team practice; part of it is a working analytical framework we are still developing. We mark which is which, because you should imitate the first immediately and treat the second as provisional.

### Current team practice

The path from idea to authority is explicit, slow, and reversible: *generate → critique → refine → hold as candidate → promote only on evidence.*

Every candidate is recorded the same way (this is the purpose of the candidate notebook / Evidence Register). For each one:

- **Identity** — the single question it answers, independent of its many implications.
- **Kind** — philosophical, governance, or architectural.
- **Current evidence** — what it has actually earned so far.
- **Promotion criteria** — what would justify giving it authority.
- **Failure criteria** — what would justify discarding it.
- **Open predictions** — what it claims about situations we have not yet faced.

Not all evidence is equal. We distinguish three progressively stronger forms of support:

1. **Corroboration** — it aligns with what we already believe or have decided. *Reassuring; weak.* It demonstrates internal coherence, not explanatory necessity.
2. **Prediction** — it anticipates a problem in a genuinely new situation, *before* we build. *Strong.*
3. **Generalization** — it later proves useful in domains it was not designed for. *Strongest.*

Promotion to canon requires at least **prediction**. Corroboration alone — "it explains the work we already did" — never earns authority, no matter how elegantly.

### Working analytical framework

The following is newer and still evolving. It has helped us reason about candidates and proposals, but it has not yet earned the standing of settled practice. Use it as a lens, not a law.

A test battery for any candidate or proposal:

| Test | Question |
| --- | --- |
| **Decision** | Does it recommend *different actions* for *different kinds of evidence*? |
| **Authority** | Does it detect when a representation has become unaccountable to what it represents? |
| **Flow** | Does it detect construction inversion or layer collapse? |
| **Prediction** | Does it flag a flaw in a genuinely novel proposal *before* implementation? |
| **Reflexive** | Does it keep meeting its own standards over time? |

Three failure modes the framework is meant to catch:

- **Layer collapse** — an artifact at one altitude tries to *become* another: philosophy trying to be architecture; an AI trying to be the person.
- **Anchor substitution** — a representation becomes authoritative *over* what it represents: a model treated as more real than the member's lived experience.
- **Construction inversion** — lower layers begin *authoring* higher ones ("we already built it, so the philosophy must now justify it") instead of supplying evidence that may correct them. This one is dangerous because the system still looks internally coherent; the philosophy has simply been quietly rewritten to ratify the build.

A useful way to hold the last point: correction may always flow upward — lived experience may *veto* a design — but correction is a veto, not an authorship. Experience may say "this does not fit"; it may not say "here is the new philosophy."

---

## 4. The separation between method evidence and domain evidence

This is the most important discipline in the paper, and the easiest to violate by accident.

- **Method evidence** answers: *Does this way of thinking produce a disciplined architecture?*
- **Domain evidence** answers: *Does this architecture actually improve practitioner work, collaboration, reflection, or outcomes?*

A disciplined method can still produce an incorrect architecture. Likewise, a successful architecture does not prove the method that produced it.

**We have the first. We do not yet have the second.**

The canon documents, the ADRs, and the candidate register were all produced by the protocol above. They are real, and they demonstrate that the method works *as a method*: it generated distinctions, left hard questions open rather than resolving them rhetorically, and promoted ideas only after they survived pressure-testing. That is method evidence, and the work itself supports it.

It supports **nothing** about whether the resulting architecture helps anyone. Living Fields, Field Intelligence, the practitioner Studio model, MAIA's effects on reflection — these are **hypotheses awaiting prospective observation in real use.**

The rule: **method evidence and domain evidence may never borrow authority from one another.** Concretely, this forbids:

- citing the rigor of our process as evidence for our conclusions ("we reasoned carefully about Living Fields, *therefore* Living Fields is right");
- citing a fitness signal as a truth claim ("practitioners like the feature, *therefore* its interpretations are accurate");
- citing internal coherence as evidence of real-world value ("it all fits together, *therefore* it works").

Each of those is a category error, and each has a different correct response. A fitness complaint revises an implementation or a practice. A truth failure may revise an architecture or a philosophy. Routing the evidence to the wrong altitude is how good teams quietly corrupt good designs.

---

## 5. What this changes for the team

For anyone touching MAIA — engineering, product, or practitioner work:

1. **Propose ideas as candidates, not constraints.** Bring the identity, the current evidence, and the promotion/failure criteria. Do not smuggle a conviction in as a spec.
2. **Label by altitude and kind.** Distinguish an *observation* from a *recommendation* from a *decision*. Most disagreements dissolve once everyone knows which one is on the table.
3. **Route evidence correctly.** A "people don't like this" is fitness; it revises implementation or practice. A "this isn't true / won't survive contact with reality" is truth; it may revise architecture or philosophy. Never treat one as the other.
4. **Treat practitioner evidence as first-class.** The interview program (the Spiral of Discovery, and the protocols developed with our first practitioner collaborators) exists to generate *domain* evidence for the Evidence Register — real observations, not hypotheses. Ask questions like *when do practitioners begin speaking of relationship rather than person?* and *what becomes indispensable without being designed that way?* — not *do people like MAIA?*
5. **Predict before you build something new.** Run a genuinely novel proposal through the framework first and *record the prediction.* Build anyway. Compare later. That is how we generate prediction evidence instead of retrospective fit — the only path off the weakest rung of the ladder.
6. **Leave unresolved questions unresolved.** Naming a hard problem honestly — for example, *what counts as "materially new evidence"?* — is more valuable than resolving it rhetorically. An honest open question is an asset; a false resolution is a liability that hides.
7. **Promotion is earned, slow, and reversible.** Canon constrains; doctrine interprets; candidates wait. A candidate that has only corroboration stays a candidate, however old or beloved. Promotion is a change in standing, not a reward for elegance.

What this is *not*: a slowdown for its own sake, or a reason to stop building. It is a way to make sure that what we build, we keep — and that what we keep, we can defend with evidence rather than conviction.

---

## Closing

Nothing in this paper should be read as evidence that the protocol described here improves architectural decisions. At present, the paper records a method and the reasons it was adopted. Whether that method deserves continued use depends on future evidence generated through its application. The protocol described here is therefore subject to the same discipline it proposes for every other candidate.
