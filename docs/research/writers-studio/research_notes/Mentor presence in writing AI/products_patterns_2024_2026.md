# AI writing and thinking products: interaction patterns, 2024–2026

Scope note: 17 searches and fetches, run 2026-11-09. Most product facts come from vendor docs, blogs and announcements. Independent reception is thin. Where a page was blocked (openai.com returned 403) or only third-party guides were found, the note says so. Product constraints used for evaluation: (C1) the writer's work stays central; (C2) the AI never writes prose unless asked; (C3) the writer authorizes every change; (C4) no grading or ranking of the writer.

## How do the named products lay out the work and the AI, and how is the AI invoked?

### Takeaway
Most mainstream products now combine a document canvas with three ways to invoke the AI: a highlight-to-act menu, a generate-on-empty-line or slash trigger, and a side panel or chat. Almost all of them put generation first and require an explicit keep or accept step. Feedback-only products (Marlowe, Lex's critique use, iA Writer's authorship layer, Granola's provenance) are the minority.

### Cited Findings
**ChatGPT Canvas (launched Oct 2024)**
- Canvas launched in beta on 3 Oct 2024 for Plus and Team users. It is a document or code pane that opens beside the chat. — [OpenAI, Introducing canvas](https://openai.com/index/introducing-canvas/) (403 when fetched; facts taken from search summaries and coverage)
- The "Suggest edits" shortcut gives inline suggestions and feedback. Coverage describes them as comment-style boxes beside the relevant line, similar to Google Docs comments. — [Tom's Guide](https://www.tomsguide.com/ai/chatgpt/openai-launches-chatgpt-canvas-an-ai-powered-writing-and-code-editor); [CO/AI](https://getcoai.com/news/chatgpts-new-canvas-tool-lets-you-highlight-specific-sections-and-get-inline-feedback)
- Feedback can target a single line or the whole piece. — [Digital Trends](https://digitaltrends.com/?p=3725929)
- Canvas was later made available to all tiers and to Custom GPTs. The date is unconfirmed. — [Tom's Guide](https://www.tomsguide.com/ai/chatgpt/openai-announces-official-launch-of-canvas-for-writing-and-coding-heres-whats-new)

**Google Docs + Gemini**
- "Help me write" can refine specific sections without regenerating the whole document. Gemini's suggested edits are visible only to the requester until approved, an explicit authorization gate. — [Google Workspace Updates, Apr 2026](https://workspaceupdates.googleblog.com/2026/04/new-gemini-capabilities-in-google-docs-help-you-go-from-blank-page-to-brilliance.html?m=1); [Google Workspace blog](https://workspace.google.com/blog/product-announcements/reimagining-content-creation)
- A side panel takes suggested or free prompts and references Drive files with "@filename". — [Google Docs Help](https://support.google.com/docs/answer/14355406)
- 9to5Google (Mar 2026) calls the upgrade "more Canvas-like". — [9to5Google](https://9to5google.com/2026/03/10/google-docs-gemini-upgrade/)

**Microsoft Word Copilot**
- "Draft with Copilot" output enters a draft mode with Keep, Regenerate, Discard or a refining prompt. Once kept, draft mode ends and Regenerate disappears. — [Microsoft Support](https://support.microsoft.com/en-au/office/draft-and-add-content-with-copilot-in-word-069c91f0-9e42-4c9a-bbce-fddf5d581541); [OSU guide](https://admin.resources.osu.edu/microsoft-365/microsoft-365-copilot-in-app/copilot-and-word-overview)
- Selecting text shows a Copilot icon in the margin. Rewrite then offers replace, insert below, regenerate or refine. — [Microsoft Support, Welcome to Copilot in Word](https://support.microsoft.com/en-us/Word/welcome-to-copilot-in-word)
- Microsoft states that the user is responsible for deciding whether to keep, revise or remove generated content. — [Microsoft Support](https://support.microsoft.com/en-au/office/draft-and-add-content-with-copilot-in-word-069c91f0-9e42-4c9a-bbce-fddf5d581541)

**Notion AI / Notion Agent (3.0, Sept 2025)**
- Pressing Space on an empty line opens an inline prompt. Notion AI then "writes directly on the page", with @-mentions for context. Highlighting existing text offers "Edit with AI". — [Notion Help](https://www.notion.com/help/guides/notion-ai-for-docs)
- In 3.0, Notion AI became the "Notion Agent", which can carry out multi-step workspace tasks. — [The Decoder](https://the-decoder.com/notion-3-0-introduces-ai-agents-for-documents-workflows-and-team-automation/); [AlternativeTo](https://alternativeto.net/news/2025/9/notion-3-0-introduces-new-ai-agents-to-automate-nearly-all-tasks-a-human-can-do-in-the-app)

**Lex (lex.page)**
- Ask Lex is a sidebar that keeps answers next to the draft. Users highlight a passage and ask, for example, for counterarguments. — [GenAI Edu course](https://genaiedu.podia.com/view/courses/43c80bb2-06cd-40d7-a88a-325015293a3c/2815401-session-5-1-45-2-30-ai-in-the-classroom-writing-research-and-feedback/9098673-5-1-using-ai-for-feedback); [Lex help: Use Ask Lex](https://intercom.help/lexful-support/en/articles/13521314-use-ask-lex) (the help domain is "lexful-support", so it is unclear whether this is the same product)
- The sidebar reportedly has preset feedback prompts for structure, argument strength and writer's block, plus "Checks". — [aitoolsatlas](https://aitoolsatlas.ai/tools/lex-page) (aggregator, low confidence)
- Margin comments: highlight text, then "Add Comment" in the right margin, with arrow-key navigation between comments. The founder said in 2023 that more advanced AI feedback was planned. — [Lex newsletter, 2023](https://buttondown.com/lex/archive/new-in-lex-comments-ai-rewrite)

**Sudowrite (fiction)**
- Write works like advanced autocomplete that continues the story. Describe gives sensory detail across the five senses. Rewrite changes phrasing or tone with presets such as "shorter" or "more show-not-tell". — [Sudowrite docs, features](https://docs.sudowrite.com/getting-started/dQph1snuwbfMWG9wRjsNug/features/dq7YUMNy5ZMvKUJiRAisyT); [quick start](https://docs.sudowrite.com/getting-started/dQph1snuwbfMWG9wRjsNug/quick-start/2A4FjtiocrtxHPUyz6WZgR)
- Output appears as cards in a History column on the right, not inserted into the manuscript. Brainstorm results also land there. — [Sudowrite quick start](https://docs.sudowrite.com/getting-started/dQph1snuwbfMWG9wRjsNug/quick-start/2A4FjtiocrtxHPUyz6WZgR)
- Story Engine (May 2023) generates from outline to beats to prose. Sudowrite says its Muse model is trained on a curated, consent-based fiction dataset and never on user data. — [Jason Sanford, Genre Grapevine](https://jasonsanford.substack.com/p/genre-grapevine-on-the-sudowrite); vendor claim via [ucstrategies review](https://ucstrategies.com/news/sudowrite-review-i-tested-the-22-month-ai-against-chatgpt-across-70000-words/)

**NovelCrafter**
- The Codex is a structured story bible (characters, locations, lore) that gives the AI long-term memory. Chat (formerly "Tinker Chat") lets the writer talk with the novel, a character or an "editor", and pulls in scene beats or codex entries as context. — [NovelCrafter Codex](https://www.novelcrafter.com/features/codex); [Kindlepreneur review](https://kindlepreneur.com/novelcrafter-review/)
- The writer brings their own model key (BYOK). Reviewers consistently note a learning curve and API costs on top of the subscription. — [selfpublishing.com](https://selfpublishing.com/novelcrafter-review/); [DreamGen](https://dreamgen.com/blog/articles/novelcrafter-review-and-alternatives)

**Hemingway Editor (Plus)**
- The free editor gives readability grading and colour highlights. Plus adds AI rewrites (tone, detail, shortening). — [Reedsy review](https://reedsy.com/blog/hemingway-app-review); [Hemingway Plus](https://hemingwayapp.com/hemingway-editor-plus)
- Reviewers report that the AI fixes can introduce errors and raise AI-detector scores. — [Originality.ai](https://originality.ai/blog/hemingway-editor-plus-readability-review)

**Granola (meeting notes)**
- The user types sparse notes during the meeting. "Enhance" merges them with an AI summary: the user's words in black, AI text in grey. Any AI text the user edits turns black. Each AI bullet links back to the transcript source. — [Granola docs](https://docs.granola.ai/help-center/taking-notes/ai-enhanced-notes); [Granola launch post](https://www.granola.ai/blog/announcement); [TechCrunch, May 2024](https://techcrunch.com/2024/05/22/granola-debuts-an-ai-notepad-for-meetings)
- Stated rationale: AI makes mistakes, so it matters to know what came from you and what came from the AI. — [Granola docs, editing enhanced notes](https://www.granola.ai/docs/docs/101/afteryourmeeting/editing-your-enhanced-notes)

**Marlowe (Authors A.I.)**
- Upload a manuscript and receive a report on plot, characters, pacing, story beats, narrative drive and theme, compared against bestsellers in the genre. The vendor says Marlowe "does not generate or rewrite text" and is not trained on submitted manuscripts. — [Authors A.I., Marlowe](https://authors.ai/marlowe/); [FAQ](https://authors.ai/faq-new/)
- An independent writer's account of a Marlowe report. — [Maaja, Substack](https://maaja.substack.com/p/what-i-learned-from-a-marlowe-report) (not read in full)

### Inferences
- There are three recurring geometries. (a) **Chat-primary with a doc pane**: ChatGPT Canvas and Claude Artifacts. The conversation drives, the document is an output, and inline comments are a later addition. (b) **Doc-primary with summonable AI**: Word, Google Docs, Notion and Lex. The document fills the screen, and the AI appears on selection, on an empty line, or in a dismissible side panel. (c) **Doc-primary with outputs held outside the text**: Sudowrite's History cards and Marlowe's external report. Pattern (c) fits C2 and C3 best, because nothing enters the manuscript until the writer moves it there.
- "Generate on empty line" (Notion Space, Word Draft, Docs Help me write, Sudowrite Write) is the default invitation in mainstream tools. It is the pattern most opposed to C2, because the blank-line affordance itself suggests that prose should come from the AI.
- The best authorization gates found: Gemini edits private until approved, Word's draft mode (Keep/Discard), and Sudowrite cards outside the text.

### Gaps
- Claude Artifacts / Projects editing behaviour for prose was not researched directly. No source was fetched.
- Type.ai and Reedsy Studio AI features: no usable results found.
- Voice-first writing assistants: not covered within the call budget.
- Current Lex "Checks" behaviour (inline vs sidebar, proactive vs on-demand) is unconfirmed. The best primary source found is from 2023.
- The ChatGPT Canvas primary page was blocked (403), so its details rest on press coverage.

## Which products put the document at the centre with the AI in the margin, and which use margin comments, highlight-to-ask, slash commands or proactive nudges?

### Takeaway
Margin-comment feedback (ChatGPT "Suggest edits", Lex comments, Grammarly's Proofreader inline suggestions) is the closest mainstream analogue to an editor's marginalia. Proactive or ambient behaviour is mostly limited to grammar underlines and ghost-text autocomplete. Critics and practitioners flag ghost text as interrupting thinking, though empirical evidence for prose is thin.

### Cited Findings
- Grammarly's August 2025 "docs" surface hosts agents that "take immediate action" when activated, explicitly as a replacement for prompt engineering. They include: Reader Reactions (predicts a target reader's takeaways, open questions and confusion), Proofreader (inline suggestions), Citation Finder (evidence that supports or refutes claims), AI Grader (estimated grade against an uploaded rubric), AI Detector, Plagiarism Checker, and others. — [Grammarly blog, Aug 2025](https://www.grammarly.com/blog/company/grammarly-launches-ai-agents/)
- As of 5 Nov 2025, docs with agents were in beta for Business, Enterprise and Education customers. — [Grammarly blog](https://www.grammarly.com/blog/company/grammarly-launches-ai-agents/)
- One practitioner guide says ghost text "interrupts your thought process or conflicts with what you're actually trying to write" and suggests switching to sidebar chat during deep thought. — [theluckystrike guide](https://theluckystrike.github.io/ai-tools-compared/how-to-reduce-ai-autocomplete-ghost-text-distractions-while-coding) (coding-focused, low authority)
- A design-pattern write-up recommends that completions sit visually lighter than the user's text (reduced opacity) and vanish as soon as the user types something different. — [Pattern Playground, AI completion](https://pattern-playground.onrender.com/patterns/ai-completion)
- An arXiv paper (2603.10374) on inline "opinionated" writing assistants describes "reactive writing", where writers felt in control while the AI shaped their text without their noticing. — [arXiv 2603.10374](https://arxiv.org/pdf/2603.10374) (only a snippet was seen; methods not verified)
- Cursor offers a ghost-text visibility slider. Forum reports describe ghost text running off-screen. — [Cursor forum](https://forum.cursor.com/t/inline-ghost-text-extends-beyond-screen-and-becomes-invisible/134884.md)

### Inferences
- Grammarly's Reader Reactions is the clearest mainstream example of feedback-as-questions ("what will a reader be confused by") rather than generation. AI Grader is a direct counter-example to C4. The same product family therefore shows both a usable pattern and a prohibited one.
- The "reactive writing" finding (if it holds up) is evidence that inline, always-on suggestions can undermine authorship even when every change is technically accepted by the writer. Authorization alone may not be enough to satisfy the spirit of C3.
- Highlight-to-ask is the most portable pattern that is consistent with C1–C3. It is anchored in the writer's text, invoked by the writer, and its output can be held as a comment rather than an edit.

### Gaps
- No rigorous user study was found that measures flow interruption from ghost text or proactive nudges in prose or fiction writing.
- No source was found on how Grammarly's agents panel is visually laid out (sidebar vs overlay).

## Which products emphasize feedback over generation and protect authorship?

### Takeaway
Two forms of provenance marking now exist. iA Writer and Granola mark provenance in the text itself, as a writer-facing honesty aid. Grammarly Authorship is a process-tracking report built mainly for teachers and verification. Marlowe and, by reputation, Lex lead with critique rather than drafting.

### Cited Findings
- **iA Writer Authorship**: text is labelled by source (Human, AI, Reference). AI text is greyed and Reference text dimmed. Apple Intelligence rewrites are dimmed the same way. Labelling is mostly manual, with no automatic detection; pasting from ChatGPT with the prompt included can be recognised. Author data is stored at the end of the file and stripped on export. Edits made in other editors can misplace the annotations, and the app warns when that happens. — [iA Writer support, Authorship](https://ia.net/writer/support/editor/authorship); [iA, See what AI wrote](https://ia.net/topics/see-what-ai-wrote); [AIPressRoom test](https://aipressroom.beehiiv.com/p/ia-writer-can-now-track-what-you-or-chatgpt-wrote)
- iA's stated rationale (Mar 2026, Windows launch): "Seeing where text came from helps ensure that everything is there on purpose." It says that in the LLM era, tools should "put an honest light on authorship". — [iA, Who wrote this?](https://ia.net/topics/who-wrote-this)
- iA has published a piece on AI watermarks, "Nothing to Hide" (2026, "Putting writers in control of their tools"). It was not read. — [iA](https://ia.net/topics/nothing-to-hide)
- **Grammarly Authorship** (Aug 2024): it classifies text as typed, pasted from a known or unknown source, AI-generated, or modified with Grammarly AI. It produces a shareable report and a replay showing prompts, deletions and sources, and the replay can be excluded when sharing. Distinguishing AI-pasted text from other pasted text requires clipboard access. — [Grammarly support](https://support.grammarly.com/hc/en-us/articles/29548735595405); [NLU overview PDF](https://nl.edu/media/nledu/content-assets/documents/ctle/ai-files/Grammarly-Authorship-Overview.pdf)
- In docs, Authorship is on by default and can attribute use of specific Grammarly/Superhuman agents. — [Grammarly blog, Authorship in docs](https://www.grammarly.com/blog/company/superhuman-authorship-docs/)
- Criticism: Plagiarism Today argues the Grammarly suite "launders" AI-generated content. One reviewer had their own edited text labelled "AI generated". Another found in-document generated text labelled "75% typed by a human". — [Plagiarism Today, Nov 2025](https://www.plagiarismtoday.com/2025/11/06/how-grammarly-launders-ai-generated-content/); [TechRadar](https://www.techradar.com/computing/artificial-intelligence/can-grammarlys-ai-bloodhound-sniff-out-text-written-by-chatgpt) (attributions taken from search summary; articles not read in full)
- **Lex** feedback is described as less sycophantic than critiquing in ChatGPT or Claude directly. — [AI Goes to College, Quick review of Lex.page](https://aigoestocollege.substack.com/p/quick-review-of-lexpage)
- **Marlowe**: analysis only, with no generation (see above). — [Authors A.I.](https://authors.ai/marlowe/)

### Inferences
- iA and Granola both use a grey/dim vs black convention in which the writer's own words carry full visual weight. Granola adds a key behaviour: once the writer edits AI text it becomes theirs and turns black. This rewards ownership through action, not acceptance.
- Grammarly Authorship protects authorship toward a third party (a teacher), not the writer's own sense of ownership. Its error cases show that provenance tracked through the clipboard or by heuristic is fragile.
- Marlowe's comparison to genre bestsellers moves toward benchmarking the manuscript. That is ranking the work, not the writer, but it sits close to C4.

### Gaps
- No primary source was found on how Lex currently presents critique: proactively or only on request, and inline or in a list.
- No data was found on whether authorship colouring changes writers' behaviour or felt ownership.

## How do writers, especially novelists, receive these tools: helped vs replaced, clutter, interruption?

### Takeaway
Among published novelists the dominant sentiment is fear of replacement and near-unanimous rejection of AI writing their prose. A minority use AI for research-type tasks. Fiction-specific generation tools (Sudowrite) attracted early backlash over data and consent.

### Cited Findings
- University of Cambridge, Minderoo Centre (fieldwork Feb–May 2025; 258 published UK novelists plus industry insiders): 51% believe AI is likely to replace their work entirely and 85% expect lower income. 39% say their income has already been hurt, and 59% know their work was used to train LLMs without permission. 33% use AI in their writing, mostly for research-type tasks. 97% were "extremely negative" about AI writing whole novels or even short sections. Romance (66%), thriller (61%) and crime (60%) authors were seen as most threatened. — [University of Cambridge](https://www.cam.ac.uk/stories/generative-ai-novelists); [The Bookseller](https://www.thebookseller.com/news/published-novelists-believe-ai-will-entirely-replace-authors-work-according-to-university-of-cambridge-research)
- Jayson Greene's TIME essay (June 2025) argues that AI storytelling erodes the human connection that writing and reading create. — [TIME](https://time.com/7293926/ai-telling-stories-essay/)
- At the 2023 Story Engine launch, writers questioned whether the "hundreds of novelists" who tested it were paid, and whether their work was used as data. — [Jason Sanford, Genre Grapevine](https://jasonsanford.substack.com/p/genre-grapevine-on-the-sudowrite)
- A hands-on Sudowrite review rated its openings above raw Claude or ChatGPT but said "Muse is not magic". Heavy users report "credit anxiety". — [ucstrategies review](https://ucstrategies.com/news/sudowrite-review-i-tested-the-22-month-ai-against-chatgpt-across-70000-words/)
- An editor's review on Jane Friedman's site discusses the "hidden costs" of AI copyediting tools. — [Jane Friedman](https://janefriedman.com/the-hidden-costs-of-ai-copyediting-tools-an-editors-review/) (title only; not read)
- A survey of seven working authors found career novelists using AI to remove friction, not to replace their voice. — [Descript Substack, How fiction writers are using AI](https://descriptapp.substack.com/p/how-fiction-writers-are-using-ai) (small sample; vendor-hosted)

### Inferences
- For literary writers, a product that "never writes prose unasked" is not a nice-to-have. The 97% rejection figure suggests that unrequested prose generation would disqualify a product for this audience.
- The use novelists accept (research, removing friction) suggests that feedback, questions and memory or continuity aids (NovelCrafter Codex-style story memory, Granola-style provenance) are the defensible territory.
- Clutter or interruption complaints specific to novelists did not surface in this pass. The interruption critique comes mostly from coding and practitioner sources.

### Gaps
- No direct novelist-forum evidence (e.g. r/writing, Absolute Write) was gathered on clutter or interruption with specific products.
- No independent evaluation of Marlowe's critique quality was found. Testimonials are vendor-hosted.
- No sources were gathered on Microsoft Word Copilot or Google Gemini reception among fiction writers specifically.
