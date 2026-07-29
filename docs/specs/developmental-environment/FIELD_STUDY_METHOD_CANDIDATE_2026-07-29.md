# Environmental Field Studies — Method

**Status:** Candidate (not ratified). Lifecycle: Candidate → Reconcile → Ratify → Living.
**Date:** 2026-07-29
**Authors:** Kelly (method direction) · Claude (formalization, self-critique)
**First field:** Now What? → extract grammar → MAIA

---

## Posture

Not an audit. Not a UX review. Not a design critique.

An audit assumes a checklist. A field study assumes something alive to discover.

Three commitments carried by the name:

1. **Observe before judging.**
2. **Distinguish evidence from interpretation.**
3. **Reveal tensions before proposing solutions.**

Governing question: *does this environment support a particular form of human relationship?*

---

## I. Evidence classes (constitutional)

Every statement in every field study carries a class. No statement is unclassed.

| Class | Source | May support rulings? |
|---|---|---|
| **A — Direct evidence** | Code, implementation, browser walk, measurement | Yes |
| **B — Structural inference** | Derived from implementation with an explicit reasoning chain | Yes — assumptions must be named |
| **C — Experiential prediction** | Expected human experience inferred from structure | **No**, until human observation confirms |
| **D — Metaphorical interpretation** | Narrative framing, environmental analogy | **Never alone.** Explanatory only |
| **E — Constitutional consistency** | Implementation vs. ratified principle | Yes — governance, not experience |

**Class E gets its own section in every study.** Sample checks: MAIA is not the destination ·
Studio reveals more than it decides · suggestions remain external until adopted · consent is
unmistakable · the member understands who can see what · authority moves only upward through
authored experience.

---

## II. Observation status (never blurred)

Orthogonal to evidence class. Every surface studied is tagged:

- **Walked** — observed directly in a running application
- **Read** — observed from implementation only
- **Unknown** — cannot currently be verified
- **Needs production verification** — known limitation, named explicitly

---

## III. Method Integrity page (front of every study)

Not boilerplate. **Specific and falsifiable** — names and counts, not categories.

Not *"some surfaces were inferred"* but *"`/now-what/room` walked at 390px and 1280px;
`/now-what/next` read-only — it requires a participant record created by Larry's invitation,
which I cannot mint."*

States: what was directly observed · what was inferred · what could not be observed ·
what assumptions were required · what founder rulings constrained the study.

Readers meet the limits of the evidence **before** they meet the findings.

---

## IV. Study ethics (the study is itself a governed act)

A field study must not become a side door into member content.

- **Permitted:** structural telemetry — route existence, aggregate hit counts, latency,
  schema shape, whether a return path resolves.
- **Not permitted without explicit consent:** reading member reflections, field notes,
  transcripts, or journal entries to characterize experience. Sanctuary content is
  categorically excluded, under all circumstances, including for research.
- Temporal gravity and the learning audit are the instruments most tempted by member data.
  Where real return behavior would be the best evidence, the study says so and **stops** —
  logging it as *Needs consent* rather than reaching for it.

Studying whether the environment protects sovereignty cannot be done by violating it.

---

## V. Instruments

### Class A/B — Structural

| Instrument | Method |
|---|---|
| **Orientation** | Where am I · why · who holds this · next action · how to leave and return |
| **Complexity ⟂ Confusion** | Two independent scores. Complexity = concepts, choices, comparisons, facts to hold. Confusion = meaning left to inference. Target: *inhabitable richness* — not simplicity |
| **Transition** | The seams, not the destinations. Invitation → threshold → room → reflection → leaving → returning. Per seam: what changed · what remained · what *should* have changed · what should *not* have |
| **Inter-field coupling** | Does each place strengthen the others, or are they islands? (Renamed from "Ecology" to avoid collision with *Learning Ecology* — near-identical concept names are on this method's own list of structural causes of confusion.) |
| **What disappears** | Which concerns does the environment dissolve? What refuses to disappear that should — navigation, terminology, implementation seams, system state, AI mechanics |
| **Relational role map** | Larry / participant / MAIA / platform: who is visible, named, addressed, and who can see what |

### The Gravity Map — signature instrument

Four gravities, measured **independently**, then compared:

| Gravity | Question | Class |
|---|---|---|
| **Visual** | Where does attention go? | A — layout, computed style, screenshot |
| **Interaction** | Where do actions go? | A — routes, affordances, what is one gesture away |
| **Temporal** | Where does the person return? | A/B — what persists, what the return path resolves to, aggregate route telemetry |
| **Relational** | Who becomes central? | A — whose name appears, whose voice speaks, who is addressed |

**The finding is the disagreement.** Four aligned gravities = a coherent place. Visual gravity
toward MAIA while relational gravity should sit with Larry is not a hierarchy problem — it is a
**relational inconsistency**, and it is structural.

*Note: replacing "emotional gravity" with **temporal gravity** moved the fourth axis out of
Class C. The gravity map now rests entirely on evidence — no inference leg. This is what makes
it usable for rulings.*

### Learning Ecology — how learning accumulates through return

Products teach by repetition, not by onboarding. After the 1st, 2nd, 5th, 20th visit:
what has become easier · what has become automatic · what assumptions has the environment
encouraged?

**Honest limit:** the 20th visit cannot be observed — it may not have happened yet for any
participant. Grounded substitute (Class B): read what the return path *rewards* — what the
system remembers, surfaces on return, and makes easy the second time. The teaching is in the
return path.

### Environmental Analogy (rescued from "if this were a real place")

Two steps, in order. **Never step two alone.**

1. **Describe measurable characteristics** — central gathering point · narrow circulation ·
   hidden rooms · long corridors · repeated thresholds · isolated workspaces · one dominant
   focal point · multiple competing focal points.
2. *Only then:* if those characteristics were instantiated physically, what kinds of
   environments exhibit them? And: is that the place we intended to build?

The analogy explains the evidence. It does not replace it. Metaphor after measurement.

### Energy (Class C)

Does this create / hold / drain / scatter / focus / return human energy?
Structural proxies only: decisions per unit of attention · interruption points · irreversible
state changes · whether the surface asks the person to **perform**.

---

## VI. The confabulation guard (load-bearing)

Class C is where an AI observer is most fluent and least truthful.

I do not experience duration. Time does not speed up or slow down for me. I do not become
calmer, scattered, or anxious. *"This screen feels anxious"* is a literary performance wearing
the costume of evidence — and downstream it will be read as though a human reported it.

**Required form.** Not:

> This screen feels anxious.

But:

> This screen presents 7 competing actions with no stated consequence for 4 of them —
> characteristics associated in UX research and design practice with elevated cognitive
> demand. Whether participants experience overload requires human observation.

The claim stays where the evidence is: in the interface characteristic, not the felt state.

This is `MARKETING_CLAIM_DISCIPLINE.md` turned inward. *We do not tell tomorrow's story as if
it were today's* — and we do not tell a felt story as if it were a walked one.

A section may end in **"unknown — requires a human walk."** That is a result, not a failure.

---

## VI-b. Observation Declaration (immutable for the sitting)

One sitting, one build. No mixed evidence, no switching halfway through. Scaffolded by
`scripts/field-study-scaffold.sh`, which records commit SHA, branch, uncommitted-path count,
and a working-tree fingerprint.

**Immutability is enforced, not merely asserted.** `--verify` at close re-fingerprints and
reports `INTACT` or `DIVERGED`. A build that changed underneath a sitting is a *reportable
condition*, not a failure — but observations from before and after belong to different builds
and may not be compared.

This resolves the "which build" question by method rather than by preference: whichever build
is declared, every observation belongs to it, and the divergence from production is stated.

---

## VII. Findings, tensions, and the ruling bridge

Studies do not end in *Recommendations*. But they must not end in a fog either — a study that
reveals only tensions and never discharges them becomes a way to never decide.

So findings split:

**Corrections** — Class A, no judgment required. A broken return path is not a tension; it is a
defect. These go straight to the correction queue.

**Revealed tensions** — require judgment, therefore require a ruling. Stated as a genuine
tradeoff with both sides given their strongest form, and **no recommendation smuggled in** as
*"obviously we should…"*. Examples:

> Navigation clarity ⟷ environmental immersion
> Larry prominence ⟷ MAIA discoverability
> Progressive disclosure ⟷ discoverability
> Shared primitives ⟷ field-specific language

Problems have solutions. Tensions require judgment. **A tension is discharged by a founder
ruling — that is the bridge, and it is the only one.**

**Architectural opportunities** — discoveries arising from nothing being broken. *The same
continuity primitive appears independently in three studios.* Not a defect, not a tension —
a convergence, and often the birthplace of a platform's deepest abstractions. Which is exactly
why: **an architectural opportunity is Category 1 by default — preserved direction, held, not
authorized.** It records that something *could* become a shared primitive. It does not
authorize building one. Collapsing an opportunity into a build is the inflation drift this
project already refuses.

Every finding is also typed, so a visual redesign never becomes the bucket for deeper problems:
`presentation` · `language` · `interaction` · `information architecture` · `domain model` ·
`relational architecture` · `constitutional conflict`.

---

## VII-b. Emerging Patterns (cross-study)

Recurring structures independently observed **across** fields — the bridge between individual
studies and future constitutional rulings, so that each study does not begin from zero.

```text
Pattern candidate 001
Continuity is strongest when the environment returns people to unfinished work
rather than to a chronological feed.

Observed in:   Now What? · Journal · Author Studio
Surfaced by:   temporal gravity · transition study · learning ecology
Status:        Candidate
```

**Two epistemic guards.**

1. **Same instrument ≠ convergent evidence.** A pattern found in three fields by the *same*
   instrument may be the shape of the instrument rather than of the environments. Record which
   instrument surfaced each occurrence. Cross-instrument convergence is strong; single-instrument
   recurrence is weak.
2. **Priming contaminates accumulation.** A study run with knowledge of the pattern register
   will find its patterns. This is a genuine tension inside the method: *accumulation* (don't
   start from zero) works against *independence* (don't confirm yourself). Provisional rule —
   instruments run blind to the register; only synthesis consults it, and discloses that it did.

---

## VIII. Deliverables

0. **Observation Declaration** (§VI-b) — then **Method integrity page** (§III)
0b. **Gravity map — produced first, before any narrative** (§V)
1. Implemented participant journey (not the intended one)
2. Implemented practitioner journey
3. Complexity ⟂ confusion matrix
4. **Gravity map** — four gravities, disagreements named
5. Relational role map: Larry / participant / MAIA / platform
6. Transition study
7. Learning audit
8. Ecology map
9. What disappears / what refuses to
10. Constitutional consistency (Class E)
11. Environmental analogy — characteristics, then analogy
12. Hidden complexity the system should carry on the person's behalf
13. Currently hidden that must be revealed
14. Existing strengths not to redesign away
15. Three competing grammars — calm clarity · living field · House geography (**held separate; no premature synthesis**)
16. **Correction queue** · **founder questions** · **architectural opportunities** (Cat 1)
17. Emerging pattern candidates contributed to the cross-study register

Founder decisions are revealed, never resolved.

---

## IX. Execution mode

> **Discovery maximizes independence. Implementation maximizes coherence.**

- **Discovery sitting** — instruments run as separate observers that do not read each other's
  output; synthesis happens only afterward. The separation prevents the strongest narrative
  from absorbing contradictory evidence.
- **Implementation sitting** — once the grammar is established, one integrated pass suffices.

The "which build" question is answered by §VI-b, not by preference.

---

## IX-b. Relationship to PR #464 (Personal Field methodology)

Reviewed 2026-07-29: `METHODOLOGY_COLLISION_REVIEW_PR464_2026-07-29.md`. **Outcome 2 —
shared foundation, different applications.** Proceed independently, cross-cited; do not merge.

**Different acts.** #464 studies *people* — participants' real attending-episodes via interview
and diary, and a human learner's competency growth. This method studies *the environment* —
routes, states, components, transitions. Neither claims canonical status.

**Shared substrate, named once here so it is not re-derived as duplicate canon:** classify
before you interpret · inference must be marked and is weaker evidence · fix the instrument
before the evidence · each signal earns only the rung it stands on · observe the behavior,
never author the meaning.

⚠️ **Do not harmonize the ethics rules.** This method forbids reading member content because
its observer is an AI with no consent basis. #464's object *is* people, gathered under its own
interview consent basis. Different act, different consent basis — the rules stay in their lanes.

⚠️ **Terminology collision, recorded not resolved:** both lanes use *field*. In #464, "Personal
Field" is a product surface; here, a "field" is the unit of study. #464 says *session* /
*run-sheet*; this method says *sitting* / *study*.

---

## X. Tooling

- `scripts/field-study-scaffold.sh <field>` — scaffolds a sitting, stamps the Observation
  Declaration with the build fingerprint
- `scripts/field-study-scaffold.sh <field> --verify` — reports `INTACT` / `DIVERGED` at close
- `.claude/skills/field-study/SKILL.md` — `/field-study <field>` executes the method in order

---

## XI. Standing

This document does not describe AIN. It describes one proposed method for studying software
environments that seek to shape enduring human relationships. **Its validity depends on
repeated use across multiple fields.**

Now What? is the calibration field. Run one complete study, notice where the method itself
breaks down, revise, run a second field. Ratification is earned by repeated use — not by this
document. Observe, refine, repeat, then elevate.
