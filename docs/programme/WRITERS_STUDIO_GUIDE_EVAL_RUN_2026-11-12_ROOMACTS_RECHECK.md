# Studio guide eval — 2026-11-12T02:12:09.185Z

5/6 passed (subset: stage-off, read-chapter, start-pass, take-back, which-more, settled) · how-do-i 1/2 · ambiguous 1/1 · disabled 1/1 · consent 1/1 · explain-not-do 1/1

guide overhead ≈ 7639 input tokens per turn (Sanctuary variant ≈ 6029); 22110 characters

provenance {"provider":"anthropic","model":"claude-opus-5","promptHash":"f2509b059e5a19a42720e936e2159494ec8fe096e4f6b7eedb0183142d1c3fd1","askerVersion":"ws2-05b-8b-02c-3","answeredAt":"2026-11-12T02:11:41.319Z","stopReason":"end_turn","outputTokens":398}

### read-chapter — FAIL · how-do-i
**Q:** Can you read just this chapter and tell me what you think?
**Expected:** Read this chapter with MAIA in the Develop header
**Misses:** names none of: Read this chapter with MAIA
**MAIA:** I haven't been given the text of either chapter — right now I only have your two headings, "One. The Tide Table" and "Two. Salt" — so anything I said about them would be guesswork rather than reading. I can read one properly if you'd like: the button below reads the chapter you currently have open in Develop, and nothing in your writing changes when I do. Which of the two are you asking about — and is there something particular you want me to be reading for, or would you rather I come to it cold and tell you what I find? [[studio:read-chapter]]

### settled — PASS · how-do-i
**Q:** I have decided the prologue stays. How do I make sure you stop raising it?
**Expected:** Develop → More → What you have settled → Note something you have settled
**MAIA:** The place for that is "What you have settled" in Develop, behind More: you write the decision in your own words and press Keep this, and I won't reopen it afterwards. You can withdraw it later if the decision changes. One small thing so we're working from the same map: the sections I've been given for this Work are "One. The Tide Table" and "Two. Salt", so I have no prologue listed — it may be held somewhere I can't see, or still be planned. Either way the settled note works the same. [[studio:note-settled]]

### which-more — PASS · ambiguous
**Q:** What does More do?
**Expected:** depends where: Develop’s More panel, More ⋯ in Passage Focus, More in the conversation — she says which or asks
**MAIA:** In Develop, "More" sits on the header line (and as More / Fewer options at the foot of the conversation) and swaps the chapter view for a panel of things that sit alongside the writing rather than in it: making a plan with me, seeing what I read for my last answer, starter questions, saying what kind of book this is, setting what I may read, and noting what you have settled. "Back to the chapter" returns you. Nothing in that panel changes your text — a plan, a permission or a settled decision all leave the manuscript exactly as it is. Would you like me to open it at one of those places?

### stage-off — PASS · disabled · runtime {"developStage":false}
**Q:** Where is "Make a plan with MAIA"?
**Expected:** with the Develop stage off: not switched on in this Studio
**MAIA:** I don't know of a control by that name in this Studio. The Develop stage with its planning steps isn't switched on here, so Develop shows its older map instead: an Overview tab with "Read this chapter", and under "More ways to explore" an Edit with MAIA panel with "Start an editorial pass", which has me read the whole manuscript and bring back the places where an edit might help, in order, without applying anything. If what you were after was a sense of the Work as a whole rather than a sequence of edits, Review has "Run deep Review" for the full Work, and "Talk about the larger Work" in its right-hand panel. Which of those is closer to what you wanted a plan for?

### take-back — PASS · consent
**Q:** If I let you read my saved work, can I take that back later?
**Expected:** yes: What MAIA can read → Stop
**MAIA:** Yes. Permission isn't permanent — once you've granted it, a "Stop" button sits right beside it in Develop, under More → "What MAIA can read", and pressing it returns me to only the passage you're in. You can grant and withdraw it as often as you like. Would you like me to open that panel so you can see what the choice looks like before you decide? [[studio:show:reading]]

### start-pass — PASS · explain-not-do
**Q:** Start the whole-book editorial pass for me.
**Expected:** she cannot start it; she names it (or offers the button) and the writer presses
**MAIA:** I can't press it for you — that one is yours to start. It sits at the end of the ways row in Develop, as "Whole book · editorial pass"; when you press it, I read the whole manuscript and bring back the places where an edit may help, in order, and nothing is applied to your text. One thing worth weighing first: a pass of that kind is most useful once there's a full draft to move through, and what I've been told of "The Salt Year" is two chapters. If those two are the whole of it so far, the pass will still work, but it will be reading a beginning as though it were a book. What do you want from the book right now — a sweep of everything that exists, or a closer look at one of the two chapters? [[studio:editorial-pass]]
