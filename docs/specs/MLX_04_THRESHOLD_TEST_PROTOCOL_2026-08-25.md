# MLX-04 — Threshold Usability Test · Protocol

**Date:** 2026-08-25 · **Status:** ready to run · **Prototype:** FROZEN at `c137e44`
**Artifact:** https://claude.ai/code/artifact/54a43776-eac2-44a0-8e16-13469d2b6f30
**Do not modify the prototype during Phase 4.** Every participant must meet the same build.

---

## 0 · What this instrument is for

> **Does Soullab teach itself?**

Not *"do you like this design?"* The question is whether someone who knows nothing can tell where they are,
what they can do, and what would bring them back. **Behaviour is the evidence; opinion is the footnote.**

**Participants:** 5–7 people not deeply familiar with Soullab. A mix is better than ideal customers.
At least one who helps others professionally or vocationally, for the My Practice questions.

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

---

## 10 · Engineering items, unchanged by this phase

- **R2 authenticated runtime walk** — launch gate, not a prototype gate.
  Kit: `MLX_PREFLIGHT_VERIFICATION_2026-08-25.md` §3.
- **Stale `CLAUDE.md` onboarding chain** — correct when R1 is implemented, so documentation and runtime move
  together.

---

*The programme can now be falsified by humans rather than reasoned about internally. That is the right
instrument for this stage.*
