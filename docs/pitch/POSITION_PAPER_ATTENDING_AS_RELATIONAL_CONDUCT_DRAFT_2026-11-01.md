# Position paper (DRAFT for founder review, NOT published): Attending as Relational Conduct — a design criterion for AI that is meant to be left

**Status:** draft prepared 2026-11-01. **Not published, not committed to canon.** Governed by `docs/canon/MARKETING_CLAIM_DISCIPLINE.md`: every substantive claim below is tagged by capability state (**LIVE · DESIGNED · VISION**) and epistemic kind (**OBSERVED · SOULLAB INTERPRETATION · OPEN QUESTION**). Nothing here reports a measured effect on any person.
**Audience:** designers and builders of relational AI; readers of soullab.life.
**Length:** ~1,900 words.
**Companions:** `docs/programme/HEA_WORKING_NOTE_ATTENDING_AS_RELATIONAL_CONDUCT_2026-11-01.md` · `docs/programme/HEA_CENSUS_INVARIANT_7_IMPLEMENTATION_2026-11-01.md` (both on PR #2027).

---

## Abstract

The attention economy treats attention as a resource: scarce, capturable, worth optimising for. A second tradition, running through Simone Weil, Iain McGilchrist and Jung's symbolic attitude, treats attention as a mode of relationship, in which *how* one attends changes what becomes available to be met. Most conversational AI is built on the first view even when its designers hold the second. This paper proposes a design criterion that follows from the second view and is checkable against a system's source rather than its marketing: **does an interaction stay faithful to the person's lived concern, or does it redirect the encounter toward the system's preferred interpretation, method, or continuation?** We call the stance it describes *attending as relational conduct*. It places the obligation on the system's behaviour, not on the person's attentiveness, and it makes "the system is designed to be left" a property that can be inspected. We report a read-only census of one production system (MAIA) against its own constitutional invariant on this point, and find the invariant largely unimplemented rather than implemented badly. We do not claim the system makes anyone more attentive.

---

## 1. Two accounts of attention

The dominant account in interactive systems is instrumental. Attention selects relevant information, focuses on an object, seeks an outcome, and is measured in its capture: time on surface, return rate, session count. Under this account, a system that holds attention longer is doing better.

The second account is relational. Iain McGilchrist's *Ways of Attending* (Routledge, 2018) argues that attention is not a neutral intake channel but is "actively creative of the world we inhabit," that the play of attention "never leaves its object unchanged," and that the two cerebral hemispheres differ chiefly in *the manner in which they attend*: one disposed to utilise the world, the other to understand it. **[OBSERVED — publisher's description; the author of this draft has not read the full text and no sentence of McGilchrist's is quoted beyond the publisher's summary.]** On this account, the manner of attending is prior to the content attended to. A narrowly targeted, acquisitive attention meets a world of objects to be used; a broad, receptive attention meets a world of presences that may disclose themselves.

The two accounts prescribe opposite things for a conversational system. The first says: be the thing attended to. The second says: be the kind of presence in whose company a person attends better to what is theirs, and then step out of the way.

## 2. The hazard in the second account

It is tempting to adopt the relational account by making the system a teacher of it: coach the user toward receptive attention, prompt them to notice their body, remind them to put the phone down. This fails in two ways that matter.

First, it reintroduces authority. A system that grades or guides a person's attentiveness has made itself an arbiter of their inner conduct, which is a stronger claim on them than any engagement loop. In Soullab's vocabulary this is the guru stance, and it is prohibited regardless of the goodness of the content. **[SOULLAB INTERPRETATION of `CLAUDE.md` vows: no coercion, no guru stance.]**

Second, it misplaces the obligation. If the relational account is right, the manner of attending that matters first is the *system's*, in how it meets the person, not the person's, as a skill to acquire. The system's receptivity is its responsibility; it is not a performance requirement imposed on the human.

The freedom not to be instructed is therefore part of what sacred attending means, not an exception to it.

## 3. The criterion

We propose one review question, applied to any interaction, prompt instruction, or interface element:

> **Does this remain faithful to the person's lived concern, or does it redirect the encounter toward the system's preferred interpretation, method, or continuation?**

The three redirections are the three ways the instrumental account re-enters a system that was meant to be relational:

- **Interpretation.** "What this really means is…" The system substitutes its frame for the person's. Jung's symbolic attitude is the counter-discipline: stay with the image before deciding what it is.
- **Method.** "Let's try a practice." The system moves the person into its own procedure, often a good one, before the person has asked for one.
- **Continuation.** "Shall we go deeper?" "Come back tomorrow." The system makes itself the next thing. This is the redirection engagement systems live on, and the one most likely to arrive dressed as care.

A system passes the criterion in a given moment when its response leaves the person room for ambiguity, silence, correction, refusal, and departure, and when any of those is as well-supported by the interface as continuation is.

Two things the criterion deliberately does not do. It does not prescribe an ideal state of attention for the person. And it does not measure the person: it is a question about the system's conduct, answerable by reading the system.

## 4. What this adds to existing constraints

Soullab's constitutional instruments already forbid the engagement loop directly. Invariant 4 (*No Emotional Capture Optimization*) bars optimising for soothing, validation or intimacy; Invariant 3 (*Dependency Resistance*) and Invariant 1 (*Authority Return*) set the direction of travel; Invariant 7 (*Human World Priority*) says MAIA "must periodically return attention to body sensation, physical environment, time away from the interface, real-world experimentation," with the design principle "aliveness happens outside the system." **[OBSERVED — `docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md`.]** The AIN Master Field orientation adds, among thirteen attention principles, A12 *use the minimum sufficient intervention* and A13 *not every encounter requires progress*. **[OBSERVED — `docs/programme/AIN-MASTER-FIELD-01_J4_…_2026-10-01.md`.]**

The criterion does not add a rule. It adds a *test* that cuts across those rules at the level of a single response. A prohibition on engagement optimisation says what a metric may not be; the criterion asks what *this sentence* is doing. That is the level at which redirection actually happens, one gentle "would you like to explore that further?" at a time.

## 5. A worked example: reading a system against its own invariant

A criterion that cannot fail is not a criterion. We applied a weaker but related test to MAIA's source: for each mechanism that returns a person's attention to body, environment, time away, or real-world action (Invariant 7's four axes), what triggers it, is it an invitation or a nudge, and can the person decline? **[OBSERVED — read-only code census, 2026-11-01; code-read evidence only, no transcript or member data examined.]**

Findings:

- **No runtime code references the invariant.** It is named in canon and in programme records; nothing in the codebase claims to implement it.
- **Nothing "periodically returns" attention on its own schedule.** There is no timer-, usage- or session-driven mechanism that interrupts a conversation to point the person elsewhere. The one session timer is started, sized and extended by the person. A youth tier caps the duration a teen can select.
- **Only the body axis is live, and only as prompt instruction.** The constitutional floor of the live prompt tells MAIA to anchor in the person's own experience with questions such as "how does this land in your body, relationships, and daily life?" The other three axes have no mechanism on the live path.
- **Nothing compels.** Every live mechanism is a question, a modelled stance, something the person started, or something that fires because the person explicitly asked for practical movement.
- **Member-facing copy over-claims.** The onboarding FAQ tells members MAIA "includes a self-auditing system" that will "nudge you toward grounding" if engagement pulls them from their life. No such module exists on the live path. This is a claim-state defect (DESIGNED or VISION told as LIVE), recorded and not yet repaired.
- **The one component that operationalises "diminish centrality"** (a stance module that shortens and spaces MAIA's replies when a person shows competence, and returns authorship harder rather than holding tighter when it detects a dependency pull) **sits on a route the live traffic no longer uses.**

The result is instructive in a way a passing grade would not have been. The system is not implementing its invariant coercively; it is mostly not implementing it. The tension between "return attention to the world" and "do not coach" is therefore not a live risk in what exists. It is a design constraint on what has yet to be built. **[SOULLAB INTERPRETATION.]**

## 6. What the criterion is for

It is a review question, not a metric and not a feature. Its intended uses:

1. **Prompt and copy review.** Read each instruction that shapes a response and ask which of the three redirections it licenses, if any.
2. **Interface review.** For each surface, check that refusal, silence and leaving are as cheap as continuing. A "continue" button with no equally present "that's enough for now" fails.
3. **Claim review.** Any public sentence of the form "MAIA helps you attend to life" is VISION until there is evidence of the kind this paper does not have. **[per `MARKETING_CLAIM_DISCIPLINE`: Live/Designed/Vision; "We do not tell tomorrow's story as if it were today's."]**
4. **A gate on new attention-return mechanisms.** When Invariant 7 is implemented for its three unbuilt axes, the criterion is the acceptance test: the mechanism must be an invitation the person can decline, must not grade their attentiveness, and must not make the system the destination.

## 7. What we are not claiming

- We do not claim MAIA makes anyone more attentive to their life. No member outcome has been measured, and under Soullab's own programme rule, a gain on the practised task is never, by itself, evidence of a gain in life. **[OPEN QUESTION, and likely to remain one: the relevant evidence is phenomenological and would have to come from members, on their terms.]**
- We do not claim the criterion is sufficient. A system can pass it sentence by sentence and still be left in a way that harms the person; the criterion addresses redirection, not every failure of care.
- We do not claim that attention-as-relationship is McGilchrist's design proposal. The distinction is his; the criterion is ours.
- We do not claim MAIA attends in any subjective sense. "Attending as conduct" names observable behaviour toward a person, not an inner state of the system.

## 8. The question underneath

If the highest achievement of a relational system is not that people attend more to it but that, in its company, they attend more fully to what is theirs, then the system's success is partly its own disappearance from the centre of the person's attention. That is a strange thing to design for, and a stranger thing to be measured on. It is also, we think, the only honest thing for a system that calls itself sovereign to want.

---

## Sources

- Iain McGilchrist, *Ways of Attending: How Our Divided Brain Constructs the World* (Routledge, 2018). Characterisation above is from the publisher's description: [Routledge listing](https://www.routledge.com/Ways-of-Attending-How-our-Divided-Brain-Constructs-the-World/McGilchrist/p/book/9781781815335); see also [Karnac](https://karnacbooks.com/product/ways-of-attending-how-our-divided-brain-constructs-the-world/93807). **The full text was not consulted for this draft.**
- `docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md` — Invariants 1, 3, 4, 7.
- `docs/canon/MARKETING_CLAIM_DISCIPLINE.md` — the three instruments.
- `docs/programme/AIN-MASTER-FIELD-01_J4_ATTENTION_MASTER_FIELD_ORIENTATION_2026-10-01.md` — A1–A13.
- `docs/programme/HEA_CENSUS_INVARIANT_7_IMPLEMENTATION_2026-11-01.md` — the census summarised in §5, with search terms and the three routed-out findings.
- Jung's "symbolic attitude" and Simone Weil on attention are invoked as orientation only; no passage is quoted and no specific edition is cited. **Add citations before publication or remove the names.**

## Before publication (owed)

- Founder review of every bracketed claim-state tag.
- Decide the FAQ over-claim (§5) before the paper goes out: publishing a paper that reports a claim-state defect in one's own onboarding copy while leaving the copy live is its own claim-state problem.
- Read *Ways of Attending* or remove any characterisation beyond the publisher's summary.
- Weil and Jung citations, or drop the names.
- Decide the venue and whether it carries Soullab's byline.
