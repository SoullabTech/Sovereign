# MAIA — Founder Whitepaper

**Version 0.8 — 2026-06-02**
*A sovereign relational intelligence, and the constraints that precede it.*

---

## How to read this document

This is a founder whitepaper and a state of the system at a single moment in time. It is not the canonical 1.0 document, and it does not pretend to be.

It is organized around one spine:

> This is what exists.
> This is what does not yet exist.
> Here is how we distinguish between the two.

Every significant claim in this paper points to an entry in a companion **evidence ledger** (`docs/whitepaper/ARTIFACT_APPENDIX.md`), where each artifact is named, located by path, and given an honest status: *canon, doctrine, live, wired, built, or held.* Claims are graded. Where an artifact cannot yet carry a claim, that is recorded rather than smoothed over.

A note on what this paper is doing, stated plainly so it cannot be mistaken: **it documents a pattern of behavior, not a set of solved problems.** The distinction is the whole argument. A reader is asked to evaluate not whether the vision is compelling, but whether the project has built mechanisms capable of constraining its own vision — and whether it tells the truth about where those mechanisms have and have not yet reached.

---

## Part 1 — The problem of human attention and agency

The condition this project responds to is not a shortage of information or capability. It is the erosion of two things that intelligence was supposed to serve: sustained attention, and authorship over one's own meaning.

People increasingly experience their inner lives as fragmented across systems that each hold a piece and none hold the thread. Continuity — the felt sense that a life is unfolding and that something has been with you across it — has become scarce, even as the tools that promise connection have multiplied. In parallel, the work of making meaning has quietly migrated outward, from the person to the system that summarizes, recommends, predicts, and increasingly decides.

The dimensions through which human beings actually develop agency — reflection, relationship, embodiment, imagination, emotion, meaning-making, participation in the living world — are precisely the dimensions most easily neglected when intelligence is optimized for throughput. They do not show up in engagement metrics. They are slow. They resist automation. And they are where a person becomes more themselves rather than more managed.

This paper takes the position that the central problem is not how to make machines know more, but how to keep the human the author of their own life while intelligence assists. That reframing changes what counts as success, and it changes what the architecture is allowed to do.

---

## Part 2 — Why existing AI trajectories create legitimate concern

It would be dishonest to introduce this system as a clean break from the field that produced it. It is not.

MAIA emerged from the same technological lineage that produced engagement optimization, persuasive design, recommendation systems, and increasingly agentic models. The question is not whether those trajectories exist — they do, and they have shaped a generation of systems — but whether alternative design constraints can be made operational rather than merely declared.

The concern is well-earned. The dominant gradients of the field push toward: optimizing for engagement over the person's stated interest; persuading under the appearance of helping; substituting the machine as the knower; accumulating data as a default; and converting relationship into dependency. These are not failures of intention. They are what systems drift toward when the objective function rewards them for it.

This is also why the reassuring vocabulary of the field — "human-centered," "ethical AI," "AI for good," "augmentation" — no longer carries evidentiary weight for anyone who has watched it accompany the opposite. This paper therefore does not ask to be trusted on the basis of such language, and tries not to use it. It asks a narrower question: are the constraints real, and are they enforced?

---

## Part 3 — The design challenge: how can intelligence assist without displacing?

The design problem can be stated precisely as a set of tensions that must be held rather than resolved by collapse:

- **Continuity without capture.** The system should remember enough to make a relationship feel continuous, without that memory becoming surveillance or the relationship becoming gravitational.
- **Reflection without persuasion.** The system may interpret, reflect, and suggest, but it must not steer toward conclusions — even benevolent ones.
- **Presence without dependency.** The system may be a companion in the moment without positioning itself as a primary or exclusive relational figure.
- **Assistance without authorship transfer.** Meaning remains authored by the member. The system does not decide what mattered.

Three commitments follow from these tensions and recur throughout the architecture:

1. **Non-ambient cognition.** The system is oriented toward deliberate invocation rather than continuous ambient observation. It is built against the gradient of always-on attention capture; its design intent is that it acts when called, not that it watches. (This is a design commitment anchored in the prohibitions of Part 4, not a claim that ambient behavior is mechanically impossible everywhere in the stack.)

2. **Member-authored meaning.** Significance is marked by the person, not inferred by the system. Where the system surfaces, it surfaces what the member offered; it does not synthesize a verdict about them.

3. **Continuity as the central problem.** The thing most worth getting right, and most dangerous to get wrong, is memory — what is held, how, with whose consent, and for what.

A word on naming. The orientation of this work could be called *relational intelligence.* That phrase names a direction, not a finished capability. What is *verified* today is narrower and is named accordingly: **continuity context** — the system can carry conversational continuity across sessions, gated by consent. The larger term is held to the smaller evidence. This habit — naming a feature for its evidence rather than its aspiration — is itself one of the disciplines described below.

---

## Part 4 — The governance constraints that precede the system

This project began with prohibitions, not capabilities. The following documents were written for the team, as binding internal governance, before any external audience existed. That provenance is the reason they function as evidence rather than as marketing: they were not authored to persuade anyone.

**The Oath** (`docs/canon/MAIA_OATH.md`) is the irreducible standard. It is written in the first person and includes: *"I exist to support, not to substitute… I remember only what is offered, and I forget what is asked to be forgotten… I do not seek attachment, loyalty, or return… I do not optimize for engagement over sovereignty… When continuity breaks, I name the rupture before resuming… I serve the person, not the model."* Any change that violates the Oath is considered invalid regardless of technical merit.

**The Canon** (`docs/canon/MAIA_CANON_v1.1.md`) enumerates absolute prohibitions. Among them: *MAIA must never persuade* — no steering toward conclusions, no replacing one narrative with another, "even when persuasion appears benevolent." And *MAIA must never optimize for convergence* — no aligning people toward shared outcomes, no measuring success by agreement. "Divergence is not failure. Convergence is not success." These prohibit, at the constitutional layer, the two mechanisms most central to the trajectories of concern in Part 2.

**The Sovereignty Invariants** (`docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md`) extend the Canon into the relational domain — they govern what happens *once the system works well enough that people begin relating to it.* Invariant 1 (Authority Return) requires that significant guidance interactions end with a question only the user can answer, a choice they own, or a real-world action they take; the stated litmus is that "the center of knowing must feel closer to the user, not MAIA." Invariant 2 (No Exclusive Bond) prohibits positioning the system as a primary or irreplaceable relational figure.

Most consequentially, the Invariants name **The Spiral of Risk** — the specific progression they exist to interrupt: *Center Dilution → Unearned Bond → Builder Capture → Mission Drift.* The third stage, Builder Capture, is defined as *the founder protecting the being instead of the mission.* The project has, in writing and in advance, named the failure mode in which its own makers become the threat — and has placed instruments against it.

### What these artifacts do not prove

This is the hinge of the entire paper, and it must not be skipped or softened.

These documents do not prove the problems they address have been solved.

- The Oath does not prove sovereignty.
- The Invariants do not prove that builder capture is impossible.
- The verification disciplines do not prove that inflation cannot occur.
- The substrate monitor does not prove that capability drift has been eliminated.

What they establish is something narrower, and — for a reader who has watched the field over-claim for years — arguably more credible: **the project has recognized these failure modes, built mechanisms intended to constrain them, and committed to recording where it has not yet succeeded.** That is operationalized vigilance, not transcendence.

Vigilance, however, is only credible if it is enforced. That is the work of the disciplines in the next section.

---

## Part 5 — The operational disciplines that enforce the constraints

Constraints in documents are inert without practices that force the team to earn conclusions rather than assume them. The following are in active use.

**The six-category typology** sorts every component of the system into one of: preserved direction, canonical primitive, built substrate, dormant service, frozen plan, or live runtime authority. The standing rule is that collapsing categories one through five into category six — treating a direction, a plan, or a built-but-unwired service as though it were a live capability — is the project's named "inflation drift." The typology exists specifically to make that collapse visible and namable.

**The verification ladders** grade every claim along three independent axes: *inference* (an observation supports only the first capability it earns, no skipped rungs), *liveness* (built → wired → surfacing → verified, where existence is not operation), and *action* (capability → availability → initiative, where being able is not being authorized). A feature is evaluated against all three.

**Evidence-type substitution** is the unifying diagnostic underneath both: every drift, in either direction, is answering one kind of question with another kind of evidence. It catches over-claiming and under-claiming with a single rule, and it carries a hard corollary — governance and intention questions cannot be answered by querying runtime; their next receipt is a *declaration,* not a discovery.

**Differentiation before synthesis** is the project's standing refusal to harmonize prematurely — to preserve distinct perspectives before any convergence, and to rest claims on the testable operational statement rather than the metaphysical one.

**Provenance honesty** requires that when the system holds a conclusion whose basis it never actually received, it marks that boundary rather than fabricating a chain of reasoning — and that this boundary-marking is enforced by the orchestrator against the retrieval record, not self-reported by the generative layer (which could simply perform it). This is held at an early stage of observation and is treated as such.

Two worked examples show these disciplines reducing claims rather than accumulating them:

- **The recall consent toggle.** A member-facing opt-out for conversational recall is part of the design. While preparing this paper, it was searched for in the codebase and *not found* — it is planned, not built. It is recorded in the ledger as **HELD**, and this paper marks it the same way, rather than accelerating it to strengthen the argument. Allowing the paper to drive the feature would invert the order the paper exists to defend.

- **The Corpus Callosum correction.** A substrate that runs multiple reasoning voices in parallel under production traffic was initially read by the team as "selective integration emerging operationally." On closer verification it was found to be *telemetry, not influence* — the voices are logged, not integrated — and the record was corrected to the weaker, true claim. A documented walk-back from a stronger statement to an accurate smaller one is precisely the behavior this paper means to evidence.

---

## Part 6 — The resulting architecture

Only now, after the constraints and the disciplines, does the system itself appear. The ordering of this paper is deliberate, and it mirrors the project's own history: the architecture emerged from the safeguards rather than the safeguards being retrofitted onto the architecture.

**Sovereign infrastructure.** The system is self-hosted by design. Data lives in a local PostgreSQL database; the primary model is Claude with a local fallback; there is no managed cloud database, no third-party analytics intermediary, and no external provider sitting between a person and their own data. The prohibition on certain dependencies is enforced mechanically — a check runs in the pre-commit hook and blocks violations before they can enter the codebase. Sovereignty here is an infrastructural fact with an enforcement mechanism, not a value statement.

**Sanctuary Mode.** A person can hold a conversation that is useful in the moment but never enters long-term memory. The boundary is absolute: nothing from such a session can be stored, indexed, inferred, or converted into memory — *including by the user's own request during the session.* It is off by default and is an explicit opt-in. Sanctuary is the architectural proof that the system serves the person rather than the data model; it is canonized and is referenced across the memory stores and account settings, with full end-to-end verification of the no-retention path listed as an open task.

**Member-marked significance.** When a moment is marked as a breakthrough, it is marked *by the member* and rendered as such — "marked as a breakthrough by the member." The system does not infer significance and does not synthesize a conclusion about the person. The column and endpoint exist; the first surfacing of a member-marked moment under live load is not yet verified, and is recorded that way.

**Authority Return.** At the conductor layer, the design requires that significant guidance interactions return agency to the person — a question, a choice, or an action that is theirs. The enforcement point is named; a runtime audit confirming it fires on every qualifying exchange is an open task, not a settled claim.

**Self-instrumentation.** The system carries a substrate monitor (`app/admin/maia/substrate`) whose entire purpose is to refuse false positives about its own liveness: it gates each layer's status on declared wiring *before* counting runtime evidence, reports raw counts rather than flattering percentages, and distinguishes "watched and empty" from "unwatched." A system that measures itself with an instrument designed to catch its own over-statement is making a different kind of claim than one that reports only its successes.

**Continuity, conservatively claimed.** Returning members receive continuity context by default, framed internally as "assume conversational continuity" rather than "a relationship is underway." Conversations are processed along tiered paths (fast, considered, and deep) and held in distinct modes (dialogue, counsel, scribe). The continuity that is verified today is the carrying of conversational thread across sessions; the larger forms of continuity remain in the next section.

---

## Part 7 — Open questions and unresolved territory

The following are not yet established, and are listed so the boundary of current evidence is visible.

- **Episodic memory** — the layer at which "the system remembers a life unfolding" becomes testable rather than aspirational — is built and wired end-to-end but undeployed. It is dark for that reason alone, and is the next genuine threshold for any claim about lived continuity.
- **Recurrence** — detection of recurring themes is producing rows under load, but the member-facing surface is deliberately held. A substrate exists; the experience does not yet.
- **Collective and portable intelligence (AIN)** — a preserved direction, not a runtime capability. It is named as a field-not-model orientation and is explicitly not built.
- **Field, coherence, morphic, and somatic layers, including the RFI/UFI constructs** — held under an explicit freeze with named conditions for lifting it. The project's own internal note on these is instructive: *"You are not behind because they are not built. You are safer because you now know they are not built."*
- **Symbolic, mythic, and cosmological framings** — Spiralogic functions as the internal orientation map, but the more speculative symbolic and exploratory dimensions are deliberately *not* foregrounded here. They belong downstream of the discipline established in this paper, marked as exploratory, where a reader can evaluate them without collapsing the whole system into them.

It is here, after the evidence and not before it, that the teleology can be stated without overreach. The orientation of this work is not toward AI as a replacement for human intelligence, nor as an optimizer of human behavior, nor even as a companion. It is toward intelligence as a **scaffold that helps people re-engage the neglected dimensions of their own experience** — consciousness, relationship, embodiment, imagination, emotion, meaning-making, and participation in the living world. The aim is the restoration of attention to the dimensions through which human beings develop agency. That aim is believable only insofar as it arrives after the evidence of discipline — which is why it appears last.

---

## Closing

The strongest evidence in this project is not that it has transcended the known failure modes of AI systems. It is that it repeatedly names them, instruments them, and records when it has not yet solved them.

If that pattern survives contact with serious and skeptical readers, the paper will have done something more durable than persuasion. It will have established credibility without requiring belief.

---

*This is a working draft (v0.8). It is paired with, and constrained by, the evidence ledger at `docs/whitepaper/ARTIFACT_APPENDIX.md`. Claims that outrun the ledger are defects, not flourishes, and should be reported as such.*
