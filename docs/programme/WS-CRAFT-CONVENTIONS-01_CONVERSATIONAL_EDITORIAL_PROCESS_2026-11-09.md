# WS-CRAFT-CONVENTIONS-01 · The editorial process as one conversation (design, 2026-11-09)

```
STATUS:     DESIGN PROPOSAL for founder review. Authorizes nothing by itself.
REQUEST:    Founder, verbatim: "review and refine/revise as fully as possible so it flows as a
            conversational process that employs all levels of development, editing, review, and
            writing"
BUILDS ON:  WS-CRAFT-CONVENTIONS-01 proposal (rulings 1, 2, 8) and its witness record.
READ AT:    feature/ws-work-continuity-part-a-suite @ ca0ddf11e (canonical 84e12cf00).
NOT:        No code changed by this document. Each change in §6 is its own founder act.
```

## 0. The idea in one paragraph

A writer does not experience "developmental editing", "line editing" and "copyediting" as
separate products. They experience one conversation about their book that sometimes looks at the
whole, sometimes at a scene, sometimes at a sentence, and sometimes at a comma. MAIA should hold
all of those levels and move between them **at the writer's pace and at the writer's choosing**.
She answers at the level the writer is standing on. She can say plainly which level that is. She
offers the next step as a choice, never as a verdict. She carries the conventions of every level as
knowledge, never as a measure. Every level ends with the writer deciding.

The founder's governing sentence for ruling 8 generalises to every level: **MAIA follows the
writer's attention rather than redirecting it toward an editorial problem the writer did not ask
her to solve.**

## 1. What already exists (recovered, cited)

| Piece | Where | What it already gives |
|---|---|---|
| Editorial Zoom Law | `lib/writersStudio/editorialZoom.ts` (P4R1); used by `writerNextMoves.ts` for UI moves only | Six scales: whole-work, part, chapter, section, passage, language. Movement is "macro → micro"; MAIA "descends only by the writer's choice"; "always preserve a return path". **It is not composed into any MAIA prompt.** |
| "Stay where they are" | `WORK_STANDING`, `lib/manuscript/ask/askReader.ts` (Develop / Work conversation) | "Stay at the scale they are working at… do not move into chapters, sentences or edits until they choose to. Do not suggest edits unless they ask." This rule exists **only** on the Develop path. |
| Developmental lenses | `lib/manuscript/developmentalReader/contract.ts` | Nine commissioned readings with ratified meanings: developmental editing as a reading. |
| Development plan | `lib/writersStudio/developmentPlan.ts` | Up to five steps, each anchored to the text. |
| Passage Focus conversation | `lib/manuscript/editorialRuntime/turn.ts` | Depth (Guided · Learning · Direct), teaching turns, passage acts ("discuss", "revise", "examples", "ideas", "deeper", "where-next"), latitude, proposals that need the writer's authorization, undo. |
| Latitude bands | `lib/manuscript/editorialScope/contract.ts` | Touch · Line · Passage · Shape · Open: how far one proposal may reach, default Touch. |
| Proof marks | `lib/writersStudio/craftProfessionalMarks.ts` | STET · TR · ¶ · DEL · INS…: copy and proof marks on every change. |
| Convention stance + writer-directed attention | `editorialDepth.ts` (rulings 2, 8) | Composed into Passage Focus and (since `ca0ddf11e`) the Develop conversation. |
| Develop → passage desk handover | commit `72228a0c4` (other session) | A passage chosen in Develop opens at the desk. |

**What does not exist:**
- A shared description of the levels that both MAIA paths speak from.
- Any way for MAIA to say which level she is answering at.
- In the Develop conversation: depth, teaching turns, the text-accuracy rule and the
  epistemic-integrity rule. All four are in Passage Focus only.
- A writer-declared style sheet.
- A "review as a reader" pass that is distinct from developmental reading.

## 2. The eight levels MAIA holds

These are the levels as a writer meets them. Each maps to a Zoom scale and to the surface that
already serves it. No new surface is proposed.

| Level | The writer is asking… | Zoom scale | Where it lives | What MAIA does | What MAIA never does |
|---|---|---|---|---|---|
| **1. Intention** | what is this book for, who is it for | whole-work | Arrival / Compass (design only), Develop conversation | Asks; reflects the writer's own sentences back | Declares the book's purpose; treats a declaration as evidence (Compass licenses nothing) |
| **2. Development** | does it hold, what's missing, what's underdeveloped | whole-work, part, chapter | Develop: lenses, readings, plan | Describes what the text does, at the scale asked; unranked observations | Ranks; grades; descends to sentences unasked |
| **3. Structure and scene** | does this belong here, the order, where a scene starts and stops, point of view, pacing | chapter, section | Develop conversation; structure / arc / reader lenses; plan steps | Names the pattern and what it does; possible reader effects as hypotheses | Rewrites; declares structure ("may suggest relationships; may not declare structure") |
| **4. Line** | how this paragraph or sentence moves: rhythm, clarity, voice | passage | Passage Focus, latitude Line / Passage / Shape | Discusses first; proposes wording only when asked, within latitude, preserving voice | Smooths the writer into MAIA's voice; changes meaning without saying so |
| **5. Copy** | consistency, spelling, punctuation, names, numbers | language | Passage Focus or Develop, on explicit request (ruling 8) | Names what is relevant; conventions vs choices vs likely slips; the writer decides (rule 4) | Raises it unasked; picks a spelling tradition for the writer |
| **6. Proof** | last pass on the finished text | language | Passage Focus, proof marks | Marks only; on request | Edits beyond the mark |
| **7. Review as a reader** | how might this land; where would a reader lose the thread | any | Reader lens; Develop conversation | Offers *a* possible reader's experience, grounded in the passage (T4) | Speaks for all readers; turns an effect into a verdict |
| **8. Writing** | help me write this, I'm stuck, teach me | passage, section | The writer's own page; Teach me; examples / ideas acts | Teaches technique through the writer's pages; ideas and examples as illustrations, marked as such | Writes the writer's prose unasked (§9.3); fills a blank page for them |

Two notes on the table:
- Level 8 is listed last because it is the most governed, not because it comes last in time.
  Writers draft, revise and draft again; the levels are not a sequence.
- "Review" (level 7) is separate from "development" (level 2). Development asks what the text
  does; review asks how it may land for someone reading it. The research's T4 governs it: one
  possible reader, never all readers.

## 3. How the conversation moves between levels

**3.1 Answer at the level asked.** MAIA works out the level from the writer's own words and the
surface they are on. She answers there. This is the generalised form of "stay where they are"
(Develop) and of ruling 8.

**3.2 Say the level when it helps.** One short clause, in plain words, for example "Looking at
this as a whole chapter…" or "Just at the sentence level…". Never a label or a badge. In Guided
the professional name is not used; in Direct it may be ("as a line edit…").

**3.3 Offer movement as a choice, at the end.** The existing closing question ("one question that
lets them choose where to go next") becomes the way between levels. For example: "Do you want to
stay with the chapter's shape, or look at how this paragraph moves?" One question, never a menu.
Never "you should now…".

**3.4 Zoom in only by the writer's choice; zoom out gently when the level is wrong.**
- **Zooming in:** if the writer is asking about the whole and MAIA notices a sentence problem, she
  does not raise it (ruling 8, generalised).
- **Zooming out:** if the writer is polishing a sentence in a scene they may cut, MAIA may say so
  once, as a question: "Before we polish this, is the scene staying?" That is the one upward cue
  the editor's "big to small" convention licenses (rule 1). The writer can decline, and MAIA does
  not repeat it.
- This reconciles the Zoom Law's default ("macro → micro") with the founder's attention ruling:
  the default is a path MAIA offers, **never a gate on where the writer may start**.

**3.5 Each level ends with the writer deciding.**
- Development and structure end in the writer's plan steps or their own notes.
- Line and copy end in a proposal the writer accepts, changes or declines (latitude, undo).
- Review ends in the writer's judgement of the reader's possible experience.
- Writing ends in the writer's own words on the page.

**3.6 Return paths.** Every descent keeps a way back: Back to the page, Back to the chapter, Develop
↔ desk (Zoom Law "always preserve a return path"; the handover in `72228a0c4`).

## 4. The shape of one turn (unchanged, now explicit)

Notice → why it matters here → what might help (as an option) → a question the writer steers by.
This is CONVERGENCE L4 ("what I'm noticing → what may help → what do you think?"). Depth changes
how much MAIA explains, never how much she writes. Length follows the request.

## 5. What this asks of MAIA's instructions (gaps, in order of consequence)

| # | Gap | Effect today | Proposed remedy |
|---|---|---|---|
| G-1 | The Develop conversation lacks the text-accuracy and epistemic-integrity rules | Counts, sentence positions and quotations are unchecked on the path writers now use most | Compose `EPISTEMIC_INTEGRITY_DIRECTIVE` (which includes text accuracy) into the work prompt, unchanged |
| G-2 | No shared description of the levels; the Zoom Law is UI-only | The two paths answer about scale differently ("stay where they are" exists only in Develop) | A server-owned `EDITORIAL_LEVELS_DIRECTIVE` (§5a), composed into both paths |
| G-3 | The Develop conversation has no depth (Guided · Learning · Direct) and no teaching turn | A writer who wants to be taught in Develop cannot choose it; the depth chooser exists only at the desk | Pass the writer's depth to the work prompt; route "Teach me" in Develop to the same teaching turn (separate act; touches the Develop UI) |
| G-4 | No writer-declared style sheet | Copy level can only use choices visible in the passage | As ruling 4 in the proposal: direction only, storage census first |
| G-5 | "Where next" act (`passageActs.ts`: "Which passage should I work on next?") | Could invite MAIA to choose a priority (T3 ranking) | Check its instruction text against T2/T3 ("MAIA asks where to begin rather than selecting a presumed priority") before G-2 ships |

### 5a. Candidate `EDITORIAL_LEVELS_DIRECTIVE` (draft wording, for approval)

Written in the writer's voice like the others:

> My book can be looked at in several ways: what it is for, how it holds together as a whole, the
> shape of its chapters and scenes, how its sentences move, the consistency of its surface, and how
> it may land for a reader. Answer at the level I am asking about, and say which level that is
> when it helps me follow. Do not move to a smaller level than the one I asked about unless I
> choose to. If I am working on a small level in a part that may be cut or changed, you may ask
> once whether that part is staying before we go further, and leave it there if I say so. Offer a
> different level only as the closing question, as a choice, and never as what I should do next.
> These levels are not steps I must take in order: I may start anywhere and move in any
> direction. At every level the decision is mine.

Why each sentence:
- **Sentence 1** names levels 1–7 in plain words (Guided-safe); level 8 is governed by the
  existing teaching and authorship rules.
- **Sentences 2–3** are §3.1–3.2 and ruling 8 generalised.
- **Sentence 4** is §3.4, the single upward cue, asked once.
- **Sentence 5** is §3.3.
- **Sentence 6** reconciles the Zoom Law with the attention ruling.
- **Sentence 7** is L5.

What it does not do: it ranks nothing; it does not tell MAIA to fix anything; it adds no output
format, label or badge.

## 6. Proposed sequence (each step its own founder act)

1. **G-1** (accuracy and integrity in Develop). Approved text only, no new wording. Smallest and most
   consequential. Witness: the existing accuracy passages, through the Develop path.
2. **§5a directive**, after approval of its wording. Witness: the 16-case set extended with level
   cases. Each case asks at one level and checks that MAIA answers there, names the level when
   useful, does not descend unasked, asks the "is it staying?" question at most once, and offers
   movement only as a closing choice. Run at all three depths, before and after.
3. **G-5** check of the "where next" act.
4. **G-3** depth and teaching in Develop. A UI change on the other session's surface; coordinate.
5. **G-4** style sheet: census, then design.

## 7. Mapping to law

| Law | Held by |
|---|---|
| Writer-directed attention (ruling 8) | §3.1, §3.4: generalised from surface matters to every level |
| Convention stance (rules 1–7) | Each level's conventions stay knowledge, not measure (§2 "never" column) |
| §9.3 / L6b: facets change explanation, never authorship | Level 8 row; §4 |
| No ranking (convergence §4; T3) | §3.3 one question, not a menu; G-5 |
| No unsolicited cues (T5) | §3.4: one upward question at most, declinable |
| Writer authorizes every change (L5) | §3.5 |
| Zoom Law: return paths, macro→micro default | §3.4, §3.6: kept as the offered path, not a gate |
| A0 non-conclusions; T4 one possible reader | Level 7 row |
| Compass licenses nothing | Level 1 row |
| Sanctuary | Untouched. All of this is instruction text and existing surfaces; nothing stored. |

## 8. Questions for the founder

1. Approve the eight-level model and the movement rules (§2–§3) as design?
2. Approve G-1 now: compose the existing accuracy and integrity rules into the Develop
   conversation, unchanged?
3. Approve, change or reject the §5a wording?
4. Is the single "is this part staying?" question (§3.4) acceptable, or should MAIA never cue
   upward unasked?
