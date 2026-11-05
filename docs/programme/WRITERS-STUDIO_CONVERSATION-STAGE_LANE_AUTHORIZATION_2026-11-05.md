# Writer's Studio — Conversation Stage lane authorized for the whole Studio (founder ruling Q1)

**Date:** 2026-11-05
**Canonical at ruling:** `bf06329adfd76c1f9d5432c4141f8aa8b64bd001`
**Ruling:** founder, in session, 2026-11-05: "Yes, authorize Q1".
**Design report:** "How MAIA Engages Writers" (private Claude Doc, https://claude.ai/artifact/5TMP1pEB2TbzntA3TUv7zP)

## The question and the answer

> **Q1.** Should the Conversation Stage lane be authorized for all of Writer's Studio, Develop included, rather than Passage Focus alone?

**Answer: YES.**

The Conversation Stage design (`WRITERS-STUDIO_CONVERSATION-STAGE_DESIGN_DECISION_2026-11-04.md`, branch
`claude/ws-conversation-stage-design-20261104`) was ruled for Focus: R1 replace and R2 MAIA opens. This ruling
widens the lane to every surface where a writer talks with MAIA: Develop, Review, Write/Focus, and the Work
conversation.

**One engagement model.** MAIA is a close reader you can talk to at the place you are working:
- one conversation per place, opened by the writer's gesture;
- her opening is an observation and one question;
- wording arrives only as a proposal turn the writer can use, change, discuss or undo;
- a whole-Work reading happens only as an explicit, commissioned act.

## What this authorizes

- **Steps that need no further ruling:**
  - **Step 1.** Make MAIA honest about what she has. The Work conversation gets its own standing instruction in place of the frozen-reading one in `lib/manuscript/ask/askReader.ts`, and the screen states the same facts as the prompt (L8).
  - **Step 2.** Pass "take me there" (`onStudioPlace`, Design 1B) into Develop and Review.
- **Steps 3–7 sit inside this lane but wait for their own rulings.** These are Q2 (= O1, how a MAIA-first opening is recorded), Q3 (canonical proposal words), Q4 (default register), Q5 (renaming the view menu) and Q6 (which doors stay).

## Conditions carried into every step

- **One PR per step,** test-first with a defeat candidate (TESTING-01 §0).
- **Walked before deploy,** first locally as a new tester, then by the founder.
- **Laws stay intact:** the convergence charter L1–L8, L6a/L6b (authorship is facet-invariant), Sanctuary, and the founder's "MAIA proposes, the writer decides".
- **Open PR #2125** (two Focus dead ends) should land before the Focus stage work.

## What this does not authorize

- deploying any step without the founder's walk;
- any schema change;
- the Elemental arrival or the Work Compass;
- the whole-book letter's design;
- Q2–Q6 by inference.
