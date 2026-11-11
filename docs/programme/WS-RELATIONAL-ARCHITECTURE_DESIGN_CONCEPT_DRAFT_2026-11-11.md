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

---

# Part 2 — Full design (2026-11-11)

This part turns the ruled direction into a design a builder can follow. Each step is its own reviewed change and still needs its own act. Facts about the current code were read from canonical on 2026-11-11 and should be re-checked at build time.

## 9. Step 1 — Coverage map (read-only; no migration)

**Purpose:** one truthful answer to "what has MAIA read of this book, and is it still current?"

**Source of truth (already stored):** every frozen reading holds, per section, the revision it was read at, the exact range, a SHA-256 digest of the text, and the depth it was read at (`readState.sections`, coverage `position | body`).

**Derivation, per section of the current draft:**
- `read`: some reading covers it at body depth, and its digest equals the current section digest.
- `changed`: a body-depth reading exists, but the digest differs.
- `not_read`: no body-depth reading exists.
- `position_only`: read for its place in the structure, not its prose.

Per Work: counts of each, the newest reading time, and which lenses cover the whole current draft.

**Shape:** `GET /api/sovereign/manuscripts/[id]/coverage` returns `{ draftRevision, sections: [{ sectionId, state, readAt, lenses }], whole: { read, changed, notRead } }`. It carries ids, states and times only. No prose.

**Where it shows:** one line at the top of MAIA's column in Write and Develop ("I've read 172 of 178 sections of this draft; 6 have changed since"). The detail opens on the writer's click. The rail may mark changed sections quietly.

**Must fail if:**
- a section edited after its reading still shows `read`;
- a position-only reading counts as read;
- another member's reading counts;
- any state is shown while the draft revision cannot be established.

## 10. Step 2 — Letter and decisions on the server; reread only what changed

**New records (one migration, its own review):**
- `work_editorial_letters`: member, manuscript, draft revision, the synthesized map (which already has no manuscript prose beyond frozen observation text), created time. Append-only; the newest row for a manuscript is current. A letter of an older draft is kept and labelled as such.
- `work_place_decisions`: member, manuscript, letter id, place id, decision (`intended | later`), decided time. Append-only events; the newest event per place is current; a `cleared` event withdraws it. Only the member's own request writes here. Sanctuary: writes fail closed, as the settled-decisions route already does.

**Reread only what changed:** the review reuses a frozen reading only when the whole section set and revision match. The change: commission readings scoped to the changed chapters, and build the letter from the newest valid reading per section. The synthesis route's "exactly eight whole-book readings" rule then needs a ruled alternative (a set of readings that together cover the current draft). This is the one place where an existing constitutional check changes, so it gets its own falsifiers before any code.

**Must fail if:**
- a decision is written by anything but the member's act;
- a letter of an older draft is presented as current;
- a stale reading contributes to a letter presented as current;
- a member can read another member's letter or decisions.

## 11. Step 3 — One surface

- Write is the working surface. MAIA's column holds, in order: the coverage line, the letter or current place, and the conversation.
- A lens (arc, voice, structure and the rest) opens in MAIA's column as a reading of the chapter or book. It never replaces the manuscript.
- Develop's stage stays as a reading-first view. Its "work on this" actions open the same column in Write.
- The Develop conversation is no longer re-created when a starter or selection is used. The starter text goes into the existing composer, unsent.
- Small screens: manuscript and MAIA alternate as two panes that keep their state.

**Must fail if:**
- any lens route renders without the chapter text;
- using a starter loses an unsent message or the conversation;
- an observation arriving moves scroll, selection or focus.

## 12. Step 4 — A pass that survives closing the page

**Fact that makes this small:** each finished lens reading is already saved on the server, and the review already reuses finished readings. Today only the loop and the final synthesis live in the browser.

**Design:**
- `editorial_pass_runs`: member, manuscript, draft revision, state (`queued | reading | synthesizing | done | failed | cancelled`), per-lens outcome (reading id or refusal), started and finished times, letter id when done.
- The writer's click creates the run. A server worker advances it one lens at a time, using the same reader and the same refusals as today. A refused lens is retried once, then the run stops as `failed` at that lens, with the reason shown and a writer-pressed "Try that reading again".
- On opening the page: the run's true state is shown ("5 of 9 readings done; continuing"). Nothing restarts paid work that is already saved.
- The writer can cancel. Withdrawing the read permission or turning on Sanctuary stops the run before its next reading.
- One run per manuscript at a time. A ceiling on runs per day is set before automatic reading is offered beyond the founder.

**Must fail if:**
- a run continues after permission is withdrawn;
- a refused reading is counted as done;
- reopening the page triggers a second paid reading of a lens already saved;
- two runs proceed on one manuscript.

This step adds a worker and a job table, so it gets its own design review before build.

## 13. Step 5 — The letter's opening

- Source: the overview reading's observations and the writer's own stated intention.
- Form: "This is what I think the book is reaching for: … Is that right?" followed by "What's working", with exact quotations that resolve in the current draft.
- When the writer has stated a purpose, she says how her reading compares, in both directions: "You said the book is about X. I read chapters 4 to 6 as doing Y. Is the book changing, or are these chapters?"
- The writer's answer can be kept as a correction (the corrections record exists) or as a change to their stated intention. That is the writer's act.

**Must fail if:**
- the opening states the writer's intention as a fact about the text;
- a quotation does not resolve in the current draft;
- praise appears without a quotation.

## 14. Automatic reading (ruling 1, narrowed)

- A per-member setting, default off, turned on by the member. First enabled for the founder's account only.
- When on: on opening a Work with whole-Work read permission and Sanctuary off, MAIA brings the coverage up to date. Changed sections only, at most once per draft revision, through the durable run in §12.
- Before it is offered to other writers: record the measured cost per run on the founder's book, and set a numeric ceiling. Both are founder acts.

## 15. Acceptance

**Mechanical (tests):** the "must fail if" lists above, each with a deliberately wrong version that the test must catch before the real code is written.

**Founder walk (human witness):** on the founder's own book, in one sitting:
1. Open the book and see truthful coverage.
2. Read the letter and say whether it understands the book.
3. Walk three places; take options on one; use and undo.
4. Ask about a distant chapter and check what she read to answer.
5. Close the page mid-pass and come back.
6. Return the next day and find the decisions and place kept.

**Another writer's walk** before any release decision. Founder use is not witness.

## 16. Open questions that remain

- The numeric cost ceiling for automatic reading.
- Whether macro-to-micro order, when asked for, is produced by MAIA ranking places (which needs the consequence-judgment licence the convergence charter withheld) or by scale alone (whole book, chapter, passage), which ranks nothing. Proposed: scale alone.
- The Write and Develop room names once Write is the one surface.
- How this design reconciles with draft PR #2208 (Quiet / Balanced / All tools), which touches the same files.

---

# Part 3 — Build status and the specs for steps 4 and 5 (2026-11-11)

## 17. Built (draft PRs, stacked, none merged)

| Step | PR | What | Migration |
|---|---|---|---|
| 1 Coverage map | #2216 | per-section read / changed / position-only / not read, derived from frozen readings; a line in MAIA's column | none |
| 2 Letter and decisions on the server | #2217 (on #2216) | letters kept by the synthesis route only, through the keep gate; decisions append-only | `20261111000001` (additive) |
| 3 One surface | #2218 (on #2217) | a lens opens beside the chapter; the stage conversation is never re-created | none |

Already live on production (`323c859cb`): the letter and walk in Write, and the editorial-pass fix (#2215).

## 18. Step 4 spec: a pass that survives closing the page

**Why it is not yet code:** it starts paid model work that no open page is watching. That needs a cost ceiling and a stop rule that are founder acts (§14), and an owner review of the job runner.

**Smallest lawful shape (no new container):**
1. `editorial_pass_runs` (append-only state events): run id, member, manuscript, draft revision, state, per-lens outcome, letter id.
2. `POST /editorial-pass` creates a run (one per manuscript at a time), behind the keep gate. Then it advances the run inside the existing app server. Every lens reading it saves is already durable.
3. `GET /editorial-pass` returns the run's true state ("5 of 9 readings done").
4. A writer-pressed **Continue** resumes any run that stopped (after a server restart, a refusal, or a page close). Finished lenses are reused and never paid twice.
5. Before each lens, the server re-checks the read permission and Sanctuary. If either fails, it stops.
6. To make this possible, the synthesis now inside `attention-map/route.ts` moves into a library function that both the route and the run call. There must be one synthesis, never two.

**Must fail if:**
- a run continues after the read permission is withdrawn;
- a refused reading counts as done;
- reopening the page pays again for a saved lens;
- two runs proceed on one manuscript;
- the run and the route produce different letters from the same readings.

**Founder acts needed:** a daily ceiling of runs per writer; whether a run may continue with no page open, or only resume on request (proposed: resume on request first).

## 19. Step 5 spec: the letter's opening

**Why it is not yet code:** it changes what the synthesis returns. The letter gains an opening that is checked against the text. That is a change to an evidence-bound contract, so its falsifiers come first.

**Shape:**
1. The synthesis tool's output gains an optional `opening` object:
   - `reachingFor`: what she thinks the book is reaching for, phrased as a question;
   - `working`: two or three items, each tied to a frozen observation reference and a quotation;
   - `divergence`: optional. Shown only when the writer has stated an intention, phrased both ways ("is the book changing, or are these chapters?").
2. The server keeps a `working` item only if its quotation is found verbatim in the current draft. Otherwise the item is dropped, and the drop is recorded.
3. The writer's stated intention orients the opening but is never evidence. The opening may say "you told me". It may say "the text does" only where an observation the opening cites supports it.
4. Panel: the opening sits above the places, ending with "Is that right?" and two answers: **Yes** and **Not quite**. "Not quite" opens the existing corrections record in the writer's own words.

**Must fail if:**
- the opening states the writer's intention as a fact about the text;
- a `working` quotation does not resolve verbatim in the current draft;
- praise appears without a quotation;
- the opening is shown for a letter of an earlier draft without saying so.

## 20. Rereading only what changed (step 2, deferred part)

The synthesis route accepts only a complete eight-lens set over the whole current draft. To reread only changed chapters, it must accept a set of readings that **together** cover every section of the current draft at body depth, with matching digests. The coverage map (step 1) is that check. This change gets its own falsifiers:
- a section with no current reading;
- a stale digest;
- two readings of different drafts mixed together.
