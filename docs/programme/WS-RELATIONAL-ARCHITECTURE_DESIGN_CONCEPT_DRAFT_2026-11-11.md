# Writer's Studio — relational architecture: design concept (DRAFT 2, founder rulings recorded 2026-11-11)

**Status:** design direction RULED by the founder on 2026-11-11 (§6a). The rulings settle the design; they authorize no build, migration, deploy or release. Each build step in §7 still needs its own act and review. Owner record #1800, continuity #1982. HOLD #1938 and Class A #1969 are unchanged.

**The question (founder, 2026-11-11):** what does it mean for MAIA to genuinely understand and accompany a writer across an entire manuscript?

**Founder direction this concept answers:**
- "I want her to have read my book, understand it and be ready to dive into any part of it with me."
- "It is easier right now to edit in ChatGPT than here and that is a big problem."
- "Future forward also means we are designing for the future of what AI human creativity can become."
- "An observation is an invitation to attention, not an instruction to change attention."

## 1. The idea in one paragraph

MAIA is an editor who has read the book and remembers the work you have done on it together. You open your manuscript and she is already acquainted with it. She can say what she has read and what she has not. She brings a short letter, walks with you one place at a time, offers options when you ask, and remembers what you decided. Your manuscript stays in the center the whole time, and nothing changes unless you change it. Over months she holds the book's history: what it is reaching for in your words, what you settled, and what moved between drafts.

## 2. Four kinds of knowing, kept apart

"Understanding" is four different things. Each has a different authority, and the design never lets one stand in for another.

| Kind | What it is | Whose authority | State today |
|---|---|---|---|
| **A. What she has read** | Coverage per draft: which sections, at what depth, when | The record | Exists per reading; no single per-Work view |
| **B. What she noticed** | Observations, each tied to evidence in the text | MAIA, as a reading that can be wrong | Exists (`developmental_readings`, observation identity) |
| **C. What you intend** | The book's purpose, what to preserve, what is deliberate, in your words | You alone | Exists (`writerUnderstanding`: becoming, preserve, intentional ambiguity, non-negotiables, challenge-me-on) |
| **D. What you have decided** | Settled decisions, "intended", "later", applied and undone changes | You alone | Partly exists (`writer_decision_events`, revision authorizations); "intended/later" is device-only in #2215 |

Rules that follow:
- **B never becomes C.** MAIA may say "you told me the book does X". She may say "the text does X" only when the text she read supports it. (This is the existing Compass law.)
- **C orients, it never grades.** Your intention tells her where to look. It is never a rubric the chapter passes or fails. When the text and your intention diverge, she asks which one is changing.
- **A is always visible.** Every answer says what it rests on. Unread is said as unread.
- **D is never inferred.** A decision exists only because you made it, and you can change it.

## 3. The Book Understanding (new: one object per Work)

Today these four live in separate places and nothing joins them. The concept adds one durable record per Work that points at them. It stores no new prose of its own.

- **Coverage map:** per section, the newest reading that covers it and the draft it was read at. States: read, reading, changed since read, not read, not permitted, refused.
- **Her letter:** the current editorial pass and its places, kept on the server, tied to a draft.
- **Your intention:** a link to the existing writer understanding.
- **Your decisions:** the per-place decisions and settled notes.
- **The thread of work:** where you were in the walk, and which conversation belongs to which place.

This is what makes "she knows my book" true across devices, visits and months. It is also what a future form of collaboration would build on.

## 4. The experience, as moments

1. **Opening.** Your manuscript, with MAIA beside it. One line tells the truth: "I've read this draft", or "You've changed chapters 3 and 7 since I read them", or "I haven't read this yet."
2. **Acquaintance.** She reads under the permission you have given, never in Sanctuary. Unchanged sections are not read again. Whether she starts by herself is your setting (see §6).
3. **The letter.** Short. What she thinks the book is reaching for, as a question to you. What is working, with quotations. The places she would look at, in book order. What she did not read.
4. **The walk.** One place at a time. What she noticed, why it may matter, "Is this intended?" You hold the pace.
5. **Options.** Only when you ask. A few distinct directions, one of which is always your own wording refined. Shown as a change you can see in your text.
6. **Your act.** Use it, undo it, leave it, later. Recorded as yours.
7. **Diving in anywhere.** Select any words, or ask about any part. She brings that part's text into the conversation and says what she read to answer.
8. **Returning.** "Last time we looked at 4 of 9 places. Chapter 7 has changed since." Nothing is lost by closing the page.

## 5. What makes it more than a chat window

- **Memory of the work, not of the chat.** Decisions and intentions persist as their own records, so they survive any conversation.
- **Honest coverage.** She cannot answer about the whole book from four pages without saying so (the failure witnessed on 2026-11-10).
- **Ownership grows.** Help is on request, small in scope, anchored to your wording, and applied only by you. The research shows these are the levers that protect a writer's sense of authorship.
- **Her reading can be wrong in the open.** You can correct her, and the correction is kept.

## 6. Rulings this concept needs from the founder

1. **Automatic reading.** May MAIA read an opened book by herself under your standing whole-Work permission? It is a paid job each time. Proposed: yes, per writer, as a setting the writer turns on, with a ceiling (for example, changed sections only, at most once per draft).
2. **One surface.** Is Write the single working surface, with lenses opening beside the manuscript instead of replacing it? Proposed: yes.
3. **Order of places.** Book order (current ruling: unranked), or the editor's macro-to-micro order when the writer asks for a "walk"? Proposed: book order by default; macro-to-micro only as an explicit choice.
4. **Server-side decisions.** May "intended" and "later" be stored on the server per Work? This needs a small migration.
5. **Durable passes.** May the editorial pass run as a server job that survives closing the page? This is new infrastructure and needs its own design.

## 6a. Founder rulings (2026-11-11, Claude Code session)

The founder was asked whether to take the five rulings "as proposed, with the narrowed ruling 1" and answered **"yes"**.

1. **Automatic reading: RULED, narrowed.** MAIA may read an opened book by herself under the writer's standing whole-Work permission, never in Sanctuary. It starts as a setting turned on **for the founder's account only**. Its cost is measured on the founder's book before it is offered to any other writer. Ceiling: changed sections only, at most once per draft.
2. **One surface: RULED.** Write is the single working surface. Lenses open beside the manuscript and never replace it.
3. **Order of places: RULED.** Book order by default. An editor's macro-to-micro order only when the writer explicitly asks for it.
4. **Decisions on the server: RULED in direction.** "Intended" and "later" are to be stored per Work. The migration is its own reviewed change and is not authorized by this ruling.
5. **Durable passes: RULED in direction.** The editorial pass is to survive closing the page. It needs its own design before any build.

**Not ruled:** provider cost ceilings in numbers; the migration itself; any deploy; any change to HOLD #1938 or Class A #1969.

## 7. Suggested build order (after rulings; each its own reviewed change)

1. Coverage map per Work (read-only view over existing readings). Smallest step, and it makes every claim checkable.
2. Letter and decisions on the server; reread only what changed.
3. Lenses beside the manuscript; remove the conversation reset in Develop.
4. Durable editorial pass.
5. The letter's opening paragraph ("what this book is reaching for"), grounded in the overview reading and offered as a question.

## 8. What this concept does not claim

- Nothing here is built except what is in draft PR #2215 (the letter and walk in Write, device-only decisions, the pass fix).
- No claim is made about how the experience feels to a writer. That needs the founder's walk and, later, another writer's.
- Research basis: `docs/research/writers-studio/AI_EDITORIAL_FLOW_RESEARCH_2026-11-11.md` (web sources; product notes are not hands-on).
