# MLX-04 — Threshold Usability Test · Protocol

**Date:** 2026-08-25 · **Status:** ready to run · **Prototype:** FROZEN at `c137e44`
**Artifact:** https://claude.ai/code/artifact/54a43776-eac2-44a0-8e16-13469d2b6f30
**Do not modify the prototype during Phase 4.** Every participant must meet the same build.

---

## 0 · What this instrument is for

> **Does Soullab teach itself?**

Not *"do you like this design?"* The question is whether someone who knows nothing can tell where they are,
what they can do, and what would bring them back. **Behaviour is the evidence; opinion is the footnote.**

### Run plan — 8 participants, split so first exposure stays cold

| Group | n | First exposure |
|---|---|---|
| **A — new arrival** | 4 | public landing → join → doorway → MAIA → House |
| **B — returning House** | 4 | cold open directly on the populated returning House |

**Splitting the groups is preferable to running both journeys on everyone** — it removes the contamination
problem in §1 entirely rather than managing it.

**Mix to aim for:**

- several ordinary prospective members with little or no AI expertise
- several people comfortable with contemporary digital products
- **2–3 helpers** — coach, therapist, teacher, facilitator, healer, guide — **especially in group B**, so My
  Practice is actually tested
- at least two people with strong visual or aesthetic sensitivity
- **no Soullab insiders** if avoidable

### We are not looking for statistical significance

We are looking for **repeated cognitive failures**. Three unrelated people independently misunderstanding the
same thing is far more meaningful than one person's preference about wording or typography.

---

## 1 · A methodological caution before scheduling

**Do not run Scenario A and Scenario B with the same person in that order without counterbalancing.**

A participant who has completed Scenario A arrives at Scenario B **already taught** the vocabulary — House,
Kept, doorways, the spheres. Their Scenario B performance then measures *retention*, not *comprehension*, and
the returning-House test is exactly the one we cannot afford to contaminate.

**Options, best first:**

1. **Separate people.** 3–4 on Scenario A, 3–4 on Scenario B. Cleanest evidence.
2. **Counterbalance.** Half do B first, half do A first. Note the order on every sheet.
3. **Same person, A then B, flagged.** Acceptable only if the sheet records that B was taught by A.

---

## 2 · Setup

| | |
|---|---|
| **Scenario A — first arrival** | `…/artifact/54a43776-eac2-44a0-8e16-13469d2b6f30?bare=1` |
| **Scenario B — returning member** | `…?bare=1&start=houseBack` |

### Where the stimulus lives — and where it does not

The prototype is a **published Artifact on claude.ai**. It is **not** a route on `soullab.life`, and must not
become one: MLX-03 was specified as isolated from production routing precisely so it could never become a
shipping surface. **There is nothing to deploy.** No minisforum build, no Docker image, no `GIT_COMMIT`
provenance chain — those govern the product, not the research stimulus.

`c137e44` is the **git commit of the source file**, not a deployable build. The relationship to verify is
therefore *"does the published page carry the same bytes as that commit"*, not *"is that SHA live in
production"*.

**Provenance verified 2026-08-25:** the published artifact body and
`docs/specs/prototypes/mlx-03-prototype.html` at `c137e44` are byte-identical — 34,257 bytes,
sha256 `31d78fa8160bf09d…`. Re-verify by reading the artifact and diffing against
`git show c137e44:docs/specs/prototypes/mlx-03-prototype.html`.

### ⚠ Access — the one step still outstanding

**Artifacts are private to their owner by default.** A participant opening the URL without access sees
nothing. Before the first session, the artifact must be **shared from its own page's share menu** — this is a
founder action in the browser; it cannot be done from this workspace.

**Confirm before session 1:** open the participant URL in a private/incognito window, or on a device not
signed in as the owner. If the landing page renders, the cohort can run. If it does not, no amount of
protocol discipline will help.

Their own device where possible — a real phone is better evidence than a borrowed laptop. Screen-record with
permission. Have a second person take notes so the facilitator can watch hands.

**Facilitator rules:**

- **Say only the framing line.** Nothing about MAIA, Soullab, doorways, House, Keeps, or the elements.
- **Do not answer questions during the task.** *"What would you do if I weren't here?"*
- **Do not help until ~30 seconds of genuinely stuck.** Record the intervention; it is data.
- **Silence is allowed.** Let it run. The urge to rescue is the main threat to this instrument.
- Thinking aloud changes behaviour slightly. Accept the trade; prefer **hands over words** where they disagree.

---

## 3 · Scenario A — first arrival

> *"Imagine someone sent you this site and you were curious. Use it however you naturally would. Talk out loud
> about what you're thinking."*

**Observe — hands first:**

```
   □ where the eyes / cursor go first          □ do they scroll, and how far before acting
   □ do they understand the hero               □ Meet MAIA or See how it works — and why
   □ what they expect each button to do        □ does signup feel proportionate
   □ doorway: inviting, or a quiz              □ do they realize voice AND text are possible
   □ does the House feel arrived-at            □ do they notice the wider world after the first conversation
```

**Timings worth capturing:** time to first click · time to first doorway · time to reach the House ·
number of backtracks · any dead-end scrolling.

### Recording a hesitation — three columns, kept apart

For every significant hesitation, capture these **separately**. Collapsing them is how an interpretation
quietly becomes evidence.

| | |
|---|---|
| **Observed behaviour** | what physically happened |
| **Participant explanation** | what they said they thought was happening |
| **Facilitator interpretation** | what we think caused it |

```
   OBSERVED
   Paused 11 seconds on returning House, moved cursor over Kept twice, then clicked Recent.

   PARTICIPANT
   "I wasn't sure whether Kept meant saved conversations."

   INTERPRETATION
   Continuity vocabulary may not yet explain itself.
```

**This project has a great deal of beautiful theory behind it. The instrument exists so the humans can
contradict the theory** — which they cannot do if our reading of their behaviour is written down as the
behaviour itself.

---

## 4 · Scenario B — returning member

> *"Imagine you've been using Soullab for a while. This is what you see when you return."*

**Ask them to find** (one at a time, no hints, record hesitation and route taken):

```
   □ what they were doing last time            □ something they intentionally kept
   □ where they've recently been               □ Relationships
   □ somewhere to develop an idea              □ where a practitioner or helper would go
   □ how to start a completely new conversation
   □ what they'd do if they had no idea where to begin
```

**This scenario answers one question:** has the House become **a place**, or is it an attractive sitemap?

---

## 5 · Questions — after the task, never during

1. Where do you think you are?
2. What do you think MAIA is?
3. What kinds of things could you do here?
4. What would you come back here for?
5. What do you think "Kept" means?
6. What do you think MAIA remembers?
7. What feels unclear or unexplained?
8. What feels different from ChatGPT or another AI?

**For anyone who helps others professionally or vocationally:**

9. What do you think My Practice is for?
10. **Would you expect this to be primarily therapist software? Why or why not?**

*Question 10 tests the Design Canon's category boundary directly. It is the one question whose answer can fail
a ratified standard.*

---

## 6 · Scoring — one sheet per participant

| Dimension | GREEN | AMBER | RED |
|---|---|---|---|
| **Orientation** | knows where they are | mostly | confused |
| **First action** | acts without coaching | hesitates | cannot begin |
| **MAIA comprehension** | understands the relational role | vague | thinks generic chatbot |
| **Ecosystem comprehension** | sees a larger world | notices pieces | thinks it's just chat |
| **Return comprehension** | understands Continue / Kept / Recent | some confusion | cannot resume |

Record **aesthetic response separately.** *Do not let "beautiful" compensate for confusion* — a page can be
admired and still fail every dimension above.

**The target outcome, stated as a sentence to listen for:**

> *"I don't completely understand everything here yet, but I know where I am, what I can do, and I want to
> explore."*

---

## 7 · What is not a defect

One person disliking Spectral · someone preferring light mode · a different preferred word for one doorway ·
unfamiliarity with the philosophical depth.

**These are observations. Patterns matter more than individual taste.**

## 8 · What demands immediate attention

**Multiple people:**

```
   ✗ mistaking doorways for a personality assessment
   ✗ not understanding what MAIA does
   ✗ failing to notice text input
   ✗ reading Keeps as bookmarks/favourites without grasping intentional continuity
   ✗ not realizing there is more than conversation
   ✗ confusing My Contribution with My Practice
   ✗ reading My Practice as therapist software
   ✗ becoming lost after entering a place
   ✗ being unable to get back to the House
   ✗ treating the public page and the authenticated world as unrelated products
```

The last two would falsify ruled architecture — the House as centre (Q1) and the no-cognitive-cliff
requirement — and would be the most consequential findings this instrument can produce.

---

## 8.5 · Interim check after the first 2–3 sheets

Send the first two or three completed sheets before running the rest. **Not to redesign from** — to check
that the instrument is capturing the right evidence: are the three columns staying separate, are hesitations
being timed, is the facilitator holding silence, are the questions producing answers or agreement.

Correcting the instrument mid-run is legitimate. **Correcting the prototype mid-run is not** — every
participant must meet the same build, or the set cannot be synthesized.

---

## 9 · Synthesis — one pass, not five redesigns

After all sessions, **one synthesis**. Classify every finding:

| | | |
|---|---|---|
| **P0** | blocks comprehension or use | fix before implementation |
| **P1** | repeated friction | fix in MLX-05 |
| **P2** | refinement / taste | carry into production craft |
| **Future** | interesting, not launch-critical | park |

**MLX-05 contains only the evidence-driven corrections.** Frozen architecture does not reopen because one
person suggested a hamburger menu. A ruled decision changes only under §12 of MLX-02 — and a phase 4 finding
qualifies **when it is a pattern with evidence**, not a preference.

### Two classes of finding, kept distinct

**Ordinary MLX-05 findings** — fixable inside the frozen architecture:

> *"I didn't immediately understand Kept."* · *"I expected this word to do something slightly different."* ·
> *"I overlooked My Contribution."*

**Architecture-falsifying findings** — these challenge a ruled premise, not an execution:

> *"I don't know how to get home."* → challenges Q1, the House as the single centre.
> *"The thing I joined and the thing I arrived in feel unrelated."* → challenges the no-cognitive-cliff
> requirement.

If either becomes a pattern, **reopen MLX-02 under its explicit change-control provision** rather than quietly
patching around the contradiction.

### Division of labour

| | |
|---|---|
| **Requires a person in the room** | recruiting, facilitating, observing, completing sheets |
| **Can be done from the sheets** | synthesis, scoring, pattern analysis, change-control judgment, the MLX-05 specification |

The sessions themselves cannot be run from inside this workspace. **The world has to answer us.**

---

## 10 · Engineering items, unchanged by this phase

- **R2 authenticated runtime walk** — launch gate, not a prototype gate.
  Kit: `MLX_PREFLIGHT_VERIFICATION_2026-08-25.md` §3.
- **Stale `CLAUDE.md` onboarding chain** — correct when R1 is implemented, so documentation and runtime move
  together.

---

*The programme can now be falsified by humans rather than reasoned about internally. That is the right
instrument for this stage.*
