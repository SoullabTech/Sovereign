# AI Editorial Flow: Research for the Writer's Studio Editing Experience

**Date:** 2026-11-11 · **Status:** research input (working note). It authorizes no build.
**Prompt:** The founder wrote, *"It is easier right now to edit in ChatGPT than here and that is a big problem."* In ChatGPT the founder was "offered options", saw their "own offerings" refined, and was "walked … through issue after issue until we refined the full book."
**Method:** Web research with generic queries only. No manuscript text, private names or repository content entered any search. Claims are tagged **[S]** (sourced, with link) or **[I]** (inference, mine). Vendor pages describe features as they were documented. They were not tested hands-on. Several products have changed their UI since those pages were written, and this is noted where it applies.

---

## 1. Product flow notes

### ChatGPT Canvas
- A document sits beside the chat. You select text and ask about that passage. "Suggest edits" adds inline comment bubbles that each hold a specific suggestion. Shortcuts adjust length and reading level. The writer can type directly into the document, and later AI passes respect those edits. Version arrows show a diff against the previous version and let you restore it. **[S]** [OpenAI launch post](https://openai.com/index/introducing-canvas/) · [OpenAI help](https://help.openai.com/en/articles/9930697-what-is-the-canvas-feature-in-chatgpt-and-how-do-i-use-it) · [DataCamp](https://www.datacamp.com/blog/chatgpt-canvas)
- Third-party reports say Canvas has been partly replaced by "writing blocks". Current availability is unverified. **[S]** [Lilach Bullock](https://www.lilachbullock.com/chatgpt-canvas/) · [Medium](https://medium.com/@mubashirburfat4/i-used-chatgpts-canvas-feature-for-six-months-then-openai-quietly-killed-it-88c542f1a63f)
- **What made the founder's ChatGPT experience work is probably the conversation, not Canvas.** It has one continuous thread that remembers earlier decisions. Each turn offers 2–3 alternatives. The writer pastes their own attempt and gets it back refined. The model always proposes a "next issue". **[I]**, based on the founder's own description.

### Claude Artifacts / Projects
- Projects hold reference files as persistent context. Artifacts keep versions with a selector, and older versions are read-only. Third-party guides say Projects lacks real version control or in-place editing of the files you uploaded. **[S]** [Claude Science docs](https://claude.com/docs/claude-science/artifacts) · [Fast.io guide](https://fast.io/resources/claude-ai-projects-guide/) · [feature request](https://claudeissues.com/issue/25363-claude-projects-read-write-file-capabilities)
- The lesson: "the whole book as context" plus a chat thread is the part users value, and the lack of in-place editing is the part they complain about. **[I]**

### Sudowrite
- Its tools are Write, Rewrite, Describe and Expand, plus Story Bible, formerly called Story Engine. Users praise Describe for sensory detail. Rewrite "may take your story in a completely different direction than you intended", the output can lean on AI tropes, and Story Engine has a steep learning curve. There is an ethics controversy about generating whole books. **[S]** [ProWritingAid review](https://prowritingaid.com/sudowrite-review) · [eesel](https://www.eesel.ai/blog/sudowrite-review) · [Medium critique](https://medium.com/@mikasosnowski/sudowrite-the-little-ai-writing-engine-that-could-but-ethically-probably-shouldnt-5071a0d6e9f3)
- ⚠ Its generative core (write the next scene for you) **conflicts** with "the writer is always the author". **[I]**

### Lex.page
- This is a clean word processor with an "Ask Lex" sidebar. You can ask for feedback on a draft, sharpen an introduction or find weak arguments, and you can select text and ask about it. One-click checks cover clichés, passive voice and readability. Lex does not train on user writing. **[S]** [lex.page](https://lex.page/) · [Lex newsletter](https://buttondown.com/lex/archive/new-in-lex-get-feedback-on-your-writing-from-the) · [review](https://aigoestocollege.substack.com/p/quick-review-of-lexpage)
- Its single-surface design, with the document first and the AI on request, is the closest public analogue to what the founder is asking for. **[I]**

### NovelCrafter
- A chat (formerly "Tinker Chat") sits side by side with the manuscript and uses the Codex (a story bible) and selected scenes as context. You can switch persona mid-conversation, for example to editor or story consultant, and extract answers into the project. Review tools include heatmaps and per-scene character presence. **[S]** [features](https://novelcrafter.com/features) · [blog](https://www.novelcrafter.com/blog/talking-to-your-novel-tinker-chat) · [Kindlepreneur](https://kindlepreneur.com/novelcrafter-review/)
- **Explicit context selection, where the writer chooses which scenes the chat sees, is a strong precedent for "MAIA reads only what the writer allowed."** **[I]**

### Google Docs Gemini
- You select text, tap "Refine" and either type a prompt or pick a suggestion chip. The newer flow refines "specific sections without regenerating the entire document". Suggested edits are visible only to you until you approve them. There is a side panel with suggested prompts. **[S]** [Google help](https://support.google.com/docs/answer/13951448) · [9to5Google 2026](https://9to5google.com/2026/03/10/google-docs-gemini-upgrade/) · [release note](https://releases.sh/release/rel__OGYKSWp_TlT2e0txEVEA)

### Notion AI
- You select text, choose "Edit with AI" or "Improve writing", then Keep, Discard or Try again. One guide notes that "try again" often returns something similar. **[S]** [Notion help](https://www.notion.com/help/guides/notion-ai-for-docs) · [Thomas Frank guide](https://thomasjfrank.com/notion-ai-guide/)

### Microsoft Word Copilot
- You select text and click the margin Copilot icon. You get a rewrite, usually with about three variations, and can Replace, Insert below, Regenerate, or tell Copilot what to change. "Coaching" reviews the draft and is in preview. Leaving draft mode removes the regenerate option. **[S]** [Microsoft: Draft with Copilot](https://support.microsoft.com/en-us/copilot-word) · [screen-reader guide](https://support.microsoft.com/en-us/topic/use-copilot-in-word-with-a-screen-reader-d6132416-993f-42d1-9c2c-4b84c112a9a5) · [Petri](https://petri.com/?p=715051)
- **Three options anchored in the margin next to the passage** is the industry convergence point. **[I]**

### Grammarly / ProWritingAid
- Both show a stream of suggestion cards, one issue per card, each with accept or dismiss. ProWritingAid's 25+ reports "generate hundreds of suggestions across a full manuscript", so the writer has to choose which ones matter at each revision stage. Manuscript Analysis and the Virtual Beta Reader cost extra credits. **[S]** [aiappsforauthors](https://aiappsforauthors-com.pages.dev/apps/prowritingaid/) · [Story Critique](https://prowritingaid.com/story-critique) · [Write Practice](https://thewritepractice.com/prowritingaid-review-manuscript-analysis-and-virtual-beta-reader/)
- The lesson: one-issue cards are good, but **volume without order is the failure**. An editor brings order and triage. **[I]**

### Marlowe (Authors A.I.)
- You upload a manuscript and get a long report on plot, pacing, beats and character. The company says it never trains on your manuscript. A critic found that cited passages "did not make sense in context", that the tool seemed to be keyword-matching, and that it missed a POV break. Another reviewer valued a structural note about a late inciting incident. **[S]** [Marlowe](https://authors.ai/marlowe/) · [Chapter review](https://blog.chapter.pub/marlowe-review/) · [Substack](https://maaja.substack.com/p/what-i-learned-from-a-marlowe-report)
- The lesson: a static report with no path to action is a dead end, and **evidence that doesn't hold up in context destroys trust**. Provenance has to be checkable. **[I]**

### Cursor's inline edit / diff (analogue)
- You select, press Cmd+K and state the intent. The change appears as a red/green inline diff that you Keep or Undo, in some versions hunk by hunk. Forum reports of regressions, where edits applied without the diff UI, prompted users to call per-change review "your best UX advantage". **[S]** [Cursor docs](https://cursor.com/docs/inline-edit/overview) · [forum: bring back per-change apply](https://forum.cursor.com/t/bring-back-per-change-apply-inline-diff-review-you-re-throwing-away-your-best-ux-advantage/160856) · [forum: regression](https://forum.cursor.com/t/regression-ai-edits-applying-automatically-without-diff-approval-ui/154887)
- **Users defend the diff-and-approve step when it is taken away.** That supports "nothing changes without the writer's act." **[S/I]**

---

## 2. How human editors work with authors

- **Order runs macro to micro.** Developmental editing (structure, character, arc) comes first, then line edits, then copyedits and proofreading. Fine-line fixes made before structural change are wasted. Some presses describe three passes: macro (fit to scope), meso (continuity between sections) and micro (detail). **[S]** [Magnolia: macro vs micro](https://magnolia-crimson-knnz.squarespace.com/blog/macroediting-vs-microediting-vs-proofreading) · [rxcomms](https://rxcomms.com/archives/macro-and-micro-editing)
- **The editorial letter and margin comments are paired.** The letter carries the overarching thoughts. Margin comments in Track Changes "tie the overarching thoughts from the letter into actionable examples in the manuscript", and the two inform each other. **[S]** [Center for Engaged Learning](https://www.centerforengagedlearning.org/what-happens-during-developmental-editing/) · [Ooligan Press](https://www.ooliganpress.com/tag/developmental-editing-letter/) · [Stephen Lloyd Webber](https://stephenlloydwebber.com/editing)
- **Queries are questions, not commands.** They are concise and diplomatic, and their tone is "one of the most crucial yet most challenging parts of an editor's job". **[S]** [Milne Publishing: The Art of Editorial Conversation](https://milnepublishing.geneseo.edu/processes/chapter/the-art-of-editorial-conversation/)
- **The relationship needs a shared vocabulary** for editorial terms, and fit matters. **[S]** (same sources)
- **What a great editor does, synthesized:** they read the whole book before saying anything. They open with what is working and what the book is trying to be. They pick the few issues that matter most and explain why. They point to the exact passages. They ask rather than tell, accept "no, that's intentional", and remember it. They let the author do the rewriting. They come back for the next pass. **[I]**, consistent with the sources above.

---

## 3. Research on the writing process and AI co-writing

- **Flower & Hayes (1981)** describe planning, translating and reviewing as recursive cognitive processes coordinated by a "monitor", not linear stages. Writers switch freely between them. **[S]** [Writing Commons](https://writingcommons.org/section/writing-process/problem-solving-strategies/) · [NWEA](https://nwea.org/blog/?p=18074). *Implication:* the tool must not force a stage order, and revising has to be possible from wherever the writer is. **[I]**
- **CoAuthor (Lee, Liang, Yang, CHI 2022)** collected 1,445 sessions from 63 writers to study GPT-3 as a collaborator under different definitions of good collaboration. **[S]** [arXiv 2201.06796](https://arxiv.org/abs/2201.06796)
- **Wordcraft (Yuan et al., IUI 2022)** found that open-ended conversation about the story and natural-language rewrite requests help writers past blocks. **[S]** In the **professional follow-up (Ippolito et al., 2022, 13 published writers)**, the tool "struggle[d] to preserve style and authorial voice" and lacked "deep understanding of story contents". Writers did best when they treated suggestions as raw material. **[S]** [arXiv 2211.05030](https://arxiv.org/pdf/2211.05030)
- **Dramatron (Mirowski et al., CHI 2023, 15 professionals):** writers felt they were collaborating, but the output could be "formulaic", and the top-down hierarchical structure "does not correspond to every writer's writing process". **[S]** [arXiv 2209.14958](https://arxiv.org/abs/2209.14958v1) · [GitHub](https://github.com/google-deepmind/dramatron)
- **Ownership costs (Zhang, Bu, Dhillon, 2026, N=176):** AI help lowered psychological ownership by about 0.85–1.0 points on a 7-point scale, even as cognitive load fell. Style personalization partly restored it. The authors propose five patterns: **on-demand initiation, micro-suggestions, voice anchoring, audience scaffolds, and provenance cues at the point of decision.** They also say to avoid silent insertion and to preview AI text as visibly distinct. **[S]** [arXiv 2601.10236](https://arxiv.org/html/2601.10236)
- **Scaffolding (Dhillon et al., CHI 2024, N=131):** paragraph-level suggestions improved quality and productivity but moderately reduced ownership and satisfaction. **[S]** [arXiv 2402.11723](https://ar5iv.labs.arxiv.org/html/2402.11723)
- **The AI Ghostwriter Effect (Draxler et al., TOCHI):** users don't feel they own AI-generated text, yet they don't declare AI authorship. Control over the model increased ownership. **[S]** [arXiv 2303.03283](https://arxiv.org/abs/2303.03283v1)
- **Opinionated models shift views (Jakesch et al., CHI 2023, N=1,506):** a biased assistant shifted both the writing and the writers' own attitudes, and most participants didn't notice. **[S]** [arXiv 2302.00560](https://arxiv.org/pdf/2302.00560). *Implication:* the default framing of an editorial suggestion is itself an influence. MAIA's observations should describe effects and ask, not prescribe a standard. **[I]**
- **Social dynamics (Gero, Long, Chilton, CHI 2023, 20 writers):** whether writers want help from an AI or a person depends on what they want help with, how they perceive the helper, and their values. **[S]** [paper](https://iamtaolong.github.io/assets/documents/2023_SocialDynamics_CHI.pdf)

---

## 4. Why chat-plus-document feels easier than a multi-room studio

Synthesis, all **[I]** unless a source is cited:

1. **One surface.** The book and the conversation are always both visible. Rooms make the writer carry context between places, which is the "mode switching" cost.
2. **Select-and-ask.** Pointing at text is the cheapest possible way to say "this". Every major tool converges on it (Canvas, Gemini Refine, Word margin icon, Lex, Cursor) **[S, §1]**.
3. **Options, not one answer.** About three variants turns judging into choosing, and choosing is the author's act **[S: Word Copilot]**.
4. **Refine my own words.** The writer pastes their own attempt and gets it back tightened. This keeps the voice anchored, and voice anchoring is the ownership lever with evidence behind it **[S: Zhang et al.]**.
5. **Visible diff, explicit accept.** **[S: Cursor forum; Zhang et al. pattern 5]**
6. **Issue-by-issue rhythm with a "next".** The conversation always has a next turn. A static report (Marlowe) or card flood (ProWritingAid) has none **[S, §1]**.
7. **Decisions are remembered.** "I already said that's intentional" sticks for the rest of the thread.
8. **No setup ceremony.** No configuration happens before help arrives.

---

## 5. Design principles (14)

1. **One editing surface.** The manuscript is the room, and MAIA lives in a margin or panel beside it. No navigation is needed to act on an observation. **[I]**
2. **MAIA reads first, then speaks once, as a letter.** Open with a short editorial letter covering what the book is reaching for, what is working, and the handful of issues that matter most, in macro-to-micro order. **[S: editor practice §2]**
3. **Every letter item links to evidence.** Each issue links to quoted passages. Clicking a link goes to the passage, and the writer has to click. **[S: letter + margin pairing]** ⚠ Honours "invite, never seize": nothing scrolls on its own. **[I]**
4. **Walk issue by issue, with the writer holding the pace.** "Issue 3 of 9 · Next · Skip · Come back later". The writer advances, and MAIA never auto-advances. **[I]**
5. **Ask, don't tell.** Each issue is phrased as noticing, then why it might matter, then a question: *"Is this intended?"* **[S: query practice]**
6. **Options on request: about three, distinct, labelled by approach** (e.g., "tighten", "keep your rhythm, cut the aside", "move it earlier"). One of them is always "your own version, refined". **[S: Word; I]** ⚠ Generating options is MAIA proposing prose. The rule is that the facet does not change how much she writes, and options appear only when the writer asks for them (on-demand initiation **[S: Zhang]**).
7. **Refine the writer's attempt, rather than replace it.** Offer a field labelled "Try it yourself" and return a tightened version of the writer's own words, shown as a diff. **[S: voice anchoring]**
8. **Show a diff in place, and require an explicit Use.** Nothing enters the manuscript without a writer action. Every Use is undoable and recorded in revision history. **[S: Cursor; Zhang pattern 5]**
9. **Mark provenance after acceptance.** Optionally keep a quiet mark showing that a passage came from MAIA's option, which closes the gap Zhang et al. name. **[S/I]**
10. **Remember decisions per Work.** "Intended, leave it" and "not now" persist, and MAIA doesn't raise them again. That memory is visible and revocable by the writer. **[I]** ⚠ It is held under the Work's consent and is not member-profile memory.
11. **Coverage is visible.** "I read chapters 1–14 of 14", or "I read only chapter 3, which you opened". If she hasn't read something, she says so rather than inferring. **[I; Marlowe failure §1]**
12. **Quotes must be checkable in context.** Show the passage with a little surrounding text. If the passage has changed since she read it, mark the issue as stale rather than silently re-anchoring it. **[S: Marlowe critique]**
13. **Macro before micro, but never locked.** Order by depth, not severity. Writers are recursive, so they may jump to any issue or ask about any passage. **[S: Flower & Hayes; editor practice]**
14. **No flattery and no streaks.** "What's working" is specific and evidenced, or it is omitted. There are no completion scores and no "great job!". **[I; Jakesch on influence]**

**Where best practice conflicts with the constraints:**
- *Sudowrite-style generation* and *Canvas "adjust length/reading level" over the whole document* change too much in one act and cannot be reviewed hunk by hunk. **Reject** whole-document rewrites. Changes are limited to one passage at a time.
- *Cursor's agent mode and some Canvas behaviours* apply edits before approval. **Reject.**
- *Grammarly-style auto-underlining while typing* comes close to seizing attention. If used at all, make it a quiet count in the margin that the writer opens. **Modify.**
- *Auto-scroll to the issue*, which Canvas and many editors do, **conflicts** with "invite, never seize". Use a link the writer clicks instead.
- *Paragraph-level options* improve quality but reduce ownership **[S: Dhillon 2024]**. Default to sentence or passage scope, and treat wider scope as an explicit request.

---

## 6. Proposed end-to-end flow (screens and moments)

All **[I]**, built on §§1–5.

**Moment 0 — Opening the book.** One screen with the manuscript in the centre, the chapter list on the left, and MAIA's margin on the right, collapsed to a single line: *"I haven't read this book yet. Would you like me to?"* Next to it is a choice of scope (whole book / these chapters) and a plain note: *"I'll read only what you choose."* No room switch happens and nothing moves.

**Moment 1 — Reading.** The margin shows "Reading chapter 6 of 14…", and the writer can keep writing meanwhile. When she is done the margin says *"I've read chapters 1–14. I have a letter for you when you want it."* It is a quiet badge, with no modal and no focus change.

**Moment 2 — The letter.** Opening the badge expands the margin into a short letter of about 300 words, organised by depth:
- *What I think this book is reaching for* (one paragraph, in her words, framed as a question: "Is that right?")
- *What's working* (two or three specific, quoted points)
- *What I'd look at* (5–9 issues, structure → chapter → passage). Each has a one-line title, the chapters it touches, and "Look at this".
- A footer: *"Read: ch. 1–14 · not read: notes, appendix."*

**Moment 3 — One issue.** Clicking "Look at this" opens that issue as a card in the margin. The quoted passage (or passages) is highlighted in the manuscript, and a link reads "Show me where" that the writer clicks. The card follows the pattern *noticing → why it might matter → "Is this intended?"*, with four buttons: **Talk about it · Show me options · Leave it, it's intended · Later**, plus "Issue 3 of 9 ‹ ›".

**Moment 4 — Options.** "Show me options" produces three short alternatives for the selected passage, each labelled by approach, and a fourth field: *"Or write your own and I'll help refine it."* Each option renders as an inline diff when previewed.

**Moment 5 — Editing in place.** **Use this** applies the diff to the manuscript and creates a revision entry, with a toast offering *Undo*. The writer can also simply type in the manuscript, because the document is always editable. MAIA notices that the passage has changed and offers *"Want me to look at your new version?"*, and only if asked does she reread it. If the writer types their own attempt into the refine field, it comes back as a diff against *their* text.

**Moment 6 — Talking it through.** "Talk about it" opens a threaded conversation inside the card, anchored to this issue and visible beside the text. A select-and-ask gesture works anywhere: the writer highlights any passage, chooses "Ask MAIA", and gets a reply in the same margin.

**Moment 7 — Keep going.** After a decision (Use, Leave or Later) the card collapses to a one-line record and shows **Next issue ›**. The writer presses it, and nothing advances on its own. "Leave it, it's intended" is remembered for this Work.

**Moment 8 — Coming back.** Next session the margin reads: *"Last time: 4 of 9 issues looked at. You've changed chapters 3 and 7 since I read them. Want me to reread those?"* The letter persists, decisions are listed, and stale issues are marked as stale.

**Moment 9 — The next pass.** When structural issues are resolved, MAIA offers (it does not start) a line-level pass on chapters the writer chooses. The same issue → options → diff rhythm repeats at a finer scale.

---

### Sources (consolidated)
OpenAI Canvas: https://openai.com/index/introducing-canvas/ · https://help.openai.com/en/articles/9930697 — Claude: https://claude.com/docs/claude-science/artifacts — Sudowrite: https://prowritingaid.com/sudowrite-review — Lex: https://lex.page/ — NovelCrafter: https://novelcrafter.com/features — Gemini Docs: https://support.google.com/docs/answer/13951448 — Notion: https://www.notion.com/help/guides/notion-ai-for-docs — Word Copilot: https://support.microsoft.com/en-us/copilot-word — ProWritingAid: https://prowritingaid.com/story-critique — Marlowe: https://authors.ai/marlowe/ · https://blog.chapter.pub/marlowe-review/ — Cursor: https://cursor.com/docs/inline-edit/overview — Editing practice: https://www.centerforengagedlearning.org/what-happens-during-developmental-editing/ · https://milnepublishing.geneseo.edu/processes/chapter/the-art-of-editorial-conversation/ — Research: arXiv 2201.06796, 2211.05030, 2209.14958, 2601.10236, 2402.11723, 2303.03283, 2302.00560; Gero et al. CHI 2023.
