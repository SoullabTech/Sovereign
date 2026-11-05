# Writer's Studio — JARVIS flow review (2026-11-05)

**Occasion.** On production, the founder reported: "it shouldn't be this hard to edit my work"; "too many technical words and little relationship"; "it doesn't answer my requests"; "we were supposed to have fixed this months ago".

**Evidence.**
- Live walk of production `f90d03fba`, using the test Work "Title Tesst" and ELEMENTAL_ALCHEMY. The Develop walk was read-only.
- The founder's screenshots.
- A read-only census of the design record against canonical `dcdffad21`.

**Verdict on R&D vs build.** The redesign is sufficient and written down. It was **built for Passage Focus only**, and the Develop room never received it. This is therefore a **build move against existing rulings**, not new research. No new design primitive is proposed.

## What was designed, and what shipped

| Record | Says | Built? |
|---|---|---|
| CONVERGENCE-01 charter (09-21) | Relational language law: *what I'm noticing → what may help → what do you think?* · Work-primary · facets | Steps 2–8 are not marked done anywhere |
| DEVELOP-RELATIONAL-GUIDANCE-R1 (10-02) | Plain language in Develop. Founder correction: **"Develop must lead to editing"** | A copy pass only. Gates never founder-witnessed. The edit path was never built |
| Whole-product review (10-03) | Develop is the **largest coherence risk**: question first, lenses behind | **Never merged** (branch `chore/writers-studio-whole-product-review-20261003`). Nothing built |
| Semantic Field function case study (11-03) | Conversation-first shape, steps 1–5 | **Shipped, Focus only** (11-03 → 11-04). Step 1 is incomplete |

## What a writer meets (live)

1. **Dead ends**:
   - Develop buttons did nothing after "Talk with MAIA first".
   - A question needing a read showed its permission request off-screen, above the conversation.
   - Focus hid MAIA's reply that came after an option.

   → **Fixed in PR #2125, not yet deployed.**
2. **The Studio speaks as the writer.** Composed instructions are stored and shown under "You". For example: "Put this observation into ordinary language for me… No technical editorial vocabulary…", and "Show me one genuinely different option… Original passage:…". This happens in:
   - Focus: `EditorialDancePanel.tsx`, in `adjustProposal`, the approach controls, "Explain this change", "Go deeper" and `sendTalk`
   - Develop: `P4R1DevelopView.tsx` lines 3139, 2909, 2294–2306 and 2322
3. **Develop exposes its machinery.**
   - Three views and nine lenses.
   - Vocabulary such as "frozen reading", "observations", raw lens keys like RECURRENCE, "18 of 262 sections in full; 244 by position only", and "Evidence mapped across".
   - "Permission to read Section 175, Section 176": ordinals, not headings.
   - Lineage panels.
4. **Develop does not lead to editing.** In the observation conversation the founder asked MAIA to "offer edits that cover the points…". There is no path from an observation to changing the words, which the 10-02 founder correction required.
5. **Too many doors to the same act.** Write offers Focus, Craftsman's Table, Discuss, Teach and More, plus Full Canvas, Develop and Review.
6. **Reloading in Focus loses the writer's place.**

## Ranked moves

1. **Deploy #2125.** It removes the three dead ends.
2. **The writer's words only.** Finish Focus step 1, then extend it to Develop. Every button sends a server-owned act, and only the writer's plain words are stored (the existing `passageActs` pattern). Smallest change with the most effect on trust.
3. **Develop leads to editing.** On each observation, add "Work on this with MAIA", which opens Focus on the cited passage with MAIA's point carried in. Gestures and authorship are unchanged. This builds the 10-02 founder correction.
4. **Develop, question first.**
   - Put the question and the relationship in the foreground. Lenses, coverage counts and lineage go behind "More".
   - The permission line reads "To answer, I'd need to read *[headings]*. Go ahead?".
   - Adopt the 10-03 review's recommendation after merging that record.
5. **Fewer doors.** Consolidate the Write menu and the Develop views. This needs a founder ruling on which doors stay.

Each move is a separate PR with a falsifying test and a live walk. Nothing here changes what MAIA may read or write, Sanctuary, or authorship gates.
