# Nonfiction (helper's book) walk + G6 review fixes — witness (2026-11-09)

Lane: Writer's Studio (#1800). Branch `feature/ws-work-continuity-part-a-suite`; candidate = the commit adding this file.
Evidence class: **browser walk on the local harness** (throwaway database, fictional *The Quiet Economy*, **stand-in model**), plus real-route
database tests. ⛔ Not real MAIA, not production, not the founder walk, not Class A acceptance. Stage opt-in.

## Walk (in order)
1. Develop on *The Quiet Economy*: chapter text central. Declared **"A helper's book"**; granted reading ("Let MAIA read my saved work").
2. Conversation: "Does What the Clinic Found really support the claim in The Scarce Resource?" → she was handed exactly those two chapters; the panel listed them.
3. Plan: "help the clinic chapter carry the book's one claim" → all five chapters read, two steps on exact sentences, the invented step dropped with a note.
4. Settled a decision in my words ("The clinic study stays in, but I will not claim it proves the whole thesis") → plan shows "What you have settled … has changed since this plan was made"; **Work on this passage refused in place**.
5. Deleted the plan ("The plan and its earlier versions are deleted. Your manuscript was not touched.") — history rows gone.
6. New plan asking to **revisit** the decision → the decision record unchanged (one event, my words); the decision WAS given to MAIA for the plan; plan stores its digest.
7. **Work on this passage on chapter 2 FAILED on the first try** — see defect A. After the fix: the desk opened on the clinic sentence → Show me an edit → Use it → text changed.
8. Develop: "You applied a change here … Whether that resolves the step is yours to say" + chapter changed; status still "Working on it".
9. Write → selected the sentence → Talk with MAIA → Undo → "Undone. Your own wording is back." → Develop: "applied … and then undid it".
10. G6 (fixture reading of the clinic chapter, since the stand-in cannot produce a real reading): asking about the chapter → she was handed her earlier reading + the text (permission) + the settled decision; the turn recorded the reading's revision (7). **Sanctuary: nothing carried** (no reading, no text, no decisions). (Steps 10's requests were sent from the page to the local route, not typed in the composer.)

## Defects found by this walk
- **A (mine, fixed):** the hand-off fingerprinted the editor's chapter text after stripping a heading the editor had already removed, so every hand-off refused "cannot confirm this chapter is the one MAIA read". It was introduced after the novel walk (in `17234b6d1`) and no browser run had covered it; the novel walk's step was on chapter 1 before that change. Unit tests could not see it (they stub the digest). Fixed: the editor's text is already in the server's projection.
- **B (open):** a refused hand-off did not move the editor to the step's chapter (it stayed on chapter 1). Seen once, not yet diagnosed.

## G6 review fixes (ChatGPT source review of `9efc0122b`)
1. **Limits are stated to her**: how many readings of these chapters exist vs how many she was given ("at least" when the 30-reading search window is full), and per reading how many observations she sees and whether any were shortened. She is told not to speak as if she remembers the ones she was not given.
2. **Second-turn quotation test**: a phrase she said in an earlier answer no longer grounds a later quotation of the writing. Grounding = her instructions + the writer's own messages (her earlier answers and her earlier readings excluded). Shown to fail without the fix.
3. **Reading record is atomic, not best-effort**: the readings given are saved in the SAME row as her answer (`answer_provenance.carriedReadings`), so there is no logged-and-continued gap. The separate `ask_turn_readings` table was removed from the candidate migration.

## Evidence
`reading.carry` 9/9 · `route.walk` 9/9 · `scope.probe` 8/8 · `plan.probe` 13/13 · `plan-links` 4/4 · unit/jsdom pass; regression: the same 9 suites that fail at `493f2d6da`.

## Still open
Defect B · real-MAIA walk (both books; sensitive case material in a helper's book) · the several-minute reading wait · silently disabled Send · unread-chapter coverage on plans for long books · readings as layers in the stage · the 9 pre-existing failures · migrations qualified in isolation · independent Class A/R20 acceptance.
