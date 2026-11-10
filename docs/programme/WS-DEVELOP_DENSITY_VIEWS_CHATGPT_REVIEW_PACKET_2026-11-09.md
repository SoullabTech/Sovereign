# Review packet for ChatGPT — Writer's Studio Develop density views (paste below the line)

Contains no repository source, constitutional text, or manuscript or member content: plain-language design only.

---

You reviewed research for Soullab Writer's Studio Develop earlier today. Here is the resulting draft spec. Please review it critically as an independent design reviewer.

**Context.** Develop shows a writer's manuscript in the centre with MAIA, an editorial AI companion, beside it. Founder direction: calm by default, every tool reachable, writer-tailorable; many writers are ADHD, others need visible structure.

**The spec in brief.**
- Three views: Quiet (default for everyone), Balanced, All tools. Same capabilities in all; only what is open vs folded changes.
- Quiet: header (title, chapter picker, Edit in Write, More, View), chapter text centred, one MAIA conversation entry; chapter rail collapsed; plan, "chapters MAIA read", starter prompts, ways of looking, explanations and evidence are one step away.
- Balanced: rail and ways of looking visible. All tools: everything open.
- On an open MAIA proposal or observation, the acts "talk about it", "decline/let rest" and "undo" are never folded, in any view.
- What MAIA read to form a view stays reachable in every view.
- The view never changes what MAIA reads, proposes or writes, and is separate from MAIA's working style (Guided / Learning / Direct).
- A small labelled "View" control in the header. Remembered in the browser only, per writer, with a temporary "just this manuscript" override. Never inferred from the writer.
- Both the calm stage and an older, denser detail view obey the setting; the denser one is folded, not removed.
- Build falsifiers: a control in All tools unreachable in Quiet; a view switch changing MAIA's behaviour; an authorship act hidden; a view inferred from the writer. Any of these fails.

**Please answer:**
1. What is most likely to go wrong for an ADHD writer in Quiet? For a writer who needs visible structure?
2. Is three views right, or should it be two (Quiet / All tools)? Why?
3. Is "View" the right label and place? Better alternatives?
4. Is browser-only persistence acceptable for a first release? What will writers notice?
5. Any accessibility risk in folding controls (keyboard, screen readers, focus loss)?
6. What would you test first with 5 to 8 beta writers, and what result would make you change the design?
Be specific and say where you are uncertain.
