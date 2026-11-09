# Develop as a conversational field — design (2026-11-09)

Status: **design candidate for founder ruling.** Same lane as everything since 2026-11-08 (Writer's Studio, owner record #1800, branch `feature/ws-work-continuity-part-a-suite`). Authorizes no build, migration, merge or deploy.
Candidate at time of writing: `c09b28986`.

## 0 · Why another design pass
Re-reading the whole conversation against what is built: the founder's asks were, in order —
1. "She should simply read the chapter/book and recall it." (continuity)
2. "Where is the actual developing environment? … all these terse buttons and options." (2026-11-09)
3. "Stop babystepping … next level, future forward."
4. The Foundational Design Direction: *conversation is the primary method of developing the work; prompts and tools emerge when useful rather than determining the conversation.*
5. Most writers: fiction and nonfiction; the primary member is a helper writing about their field. Suggestions not obnoxious.
6. Today: Develop should be "a truly interactive MAIA conversational driven field where more happens through her and conversation than a lot of buttons and fields — while also offering advanced options to technical writers."

**Honest finding.** The stage I built answers 1 and half of 4 and fails 2. It is still an assembly of panels the writer operates: chapter ribbon, thread chips, a plan *form* (input, status dropdown, Remove), an excerpt strip, a kind control, a reading-permission control, starter buttons, then the conversation. Behind it the full Develop has **92 buttons**. MAIA talks *beside* the instruments; she does not carry them.

## 1 · The governing idea
> **The manuscript is the surface. The conversation is the instrument. MAIA carries the operating; the writer carries the deciding.**

Everything a panel does today, MAIA can do *inside a turn*, as long as every act that changes state still needs one deliberate act from the writer. That keeps the ratified law intact (MAIA proposes, the writer decides) while removing most of what the writer has to operate. It is also exactly what the convergence charter put in scope: *a change that reduces what the writer must operate is in scope; one that increases what MAIA can do to the work is not.*

## 2 · What is on the screen (three things, nothing else by default)
1. **The book** — the manuscript itself, centre, readable, scrollable across chapter boundaries (not one chapter at a time). A slim book map at the edge (subordinate structure navigation).
2. **The conversation** — in the same column, under or beside the passage it concerns. MAIA's turns can carry *objects* (below).
3. **One composer** — the writer types or speaks. A single quiet line of contextual suggestion in its placeholder ("not obnoxious"); no starter-button rows.

Nothing else is visible unless MAIA brings it into a turn or the writer opens it.

## 3 · Turns that carry objects (replace the panels)
A MAIA turn is prose plus at most a few typed objects, each grounded and each actionable in place:

| Object | What it shows | The writer's act (one, in place) | Replaces |
|---|---|---|---|
| **Passage card** | The exact words from a chapter she used, labelled with the revision she read; if the writer's text has moved since, the card says so and shows both | *Go there* · *Work on this passage* | excerpt strip, "chapters she read" |
| **Comparison** | 2–3 passage cards side by side (Ch 7 against 2 and 5) with what she notices across them | as above, per card | manual chapter switching |
| **Proposed step** | A direction anchored to a passage (never replacement prose) | *Keep as a step* · reply to change it | the plan form |
| **Request** | "To answer this I'd need to read Chapters 2 and 5. Let me?" | *Yes, read them* (mints receipts) | the reading-permission control |
| **Outline alternative** | A ghost reordering of the book with its consequences and evidence; never applied | *Keep as an alternative* | (new; structure through conversation) |
| **Status suggestion** | "You said you've dealt with step 2 — mark it resolved?" | *Mark resolved* | the status dropdown |
| **Return brief** | Where we are (see §5) | none needed | re-introduction |

The plan stops being a panel. It becomes the conversation's **spine**: a quiet, collapsible list of kept steps at the head of the conversation, each with its state (§6). The writer edits a step by saying so; MAIA proposes the edit as a status suggestion; the writer confirms.

## 4 · Words in, confirmed acts out (the intent protocol)
The writer can just say what they want: *compare 7 with 2 and 5 · read the whole book for pacing · what recurs? · what if Return came before Salt? · I've fixed the lantern scene · show me where I talk about grief · this is a practitioner book.*

- The server, not the browser, maps the request to a **closed capability registry** (read sections, commission a lens, propose steps, propose an outline alternative, find, record a decision, declare kind, change a step's status).
- Anything that changes state comes back as a **Request** or **Status suggestion** object the writer confirms. ⛔ No state changes from words alone: an intent parser never grants scope, commissions a reading, records a decision, declares a kind, applies an edit or marks a step resolved.
- Reading-only answers (talk, compare already-permitted text, recurring words) just happen.
- Kind is still **declared**, never inferred: MAIA may ask once ("Is this a practitioner book, a memoir, an argument…?"); the writer's answer, confirmed, is the declaration.

## 5 · Return is a conversation, not navigation
On opening Develop, MAIA's first turn is a **return brief built from records, not from her memory**:
- what you last asked and where you were (focus, thread);
- plan steps: kept, applied, undone, resolved, still open;
- chapters you changed since she last read them (by revision);
- one line: "Pick up there, or start somewhere new."
Every line in the brief cites a record (thread, plan step, application receipt, revision). A line with no record is not shown. This answers the founder's first complaint directly.

## 6 · Four states, never merged (reviewer's correction, adopted)
**Proposed** (a kept step) · **Applied** and **Undone** (verified events from the existing desk's receipts) · **Resolved** (the writer's decision, which may involve no text change at all).
⛔ An applied edit never resolves a step. ⛔ A resolved step needs no edit. ⛔ A changed or unverified chapter makes a step *needs checking*, never quietly valid.

## 7 · Advanced layer for technical writers = the ratified DIRECT facet
Not a second product, and not more intelligence — the same reading with the machinery visible (facet parity, L6a; everything reachable from every facet).
- **Command palette (⌘K) and slash commands** in the composer: `/read 2 5 7` · `/compare 7 2 5` · `/lens structure scope:work` · `/find "lantern"` · `/plan` · `/outline` · `/scope` · `/export plan md`. Each resolves to the same registry and the same confirmations.
- **Instrument drawer** (closed by default): current reading permission; per turn, exactly which sections and **which revision** of each she was handed, with receipts; coverage; dropped steps and why; quote-check refusals; evidence references; digests.
- **Structured views on request**: outline table (word counts, positions); plan as a table or markdown; chapter-by-term matrix (counted, never interpreted); split view of two chapters.
- **Nonfiction and technical specifics**: terminology consistency (a term defined in Ch 2 used differently in Ch 7 — counted occurrences, shown, not judged); cross-references (a heading, figure or case referred to but absent); for argument books, a claim → evidence → section map **built only from passages, never from inferred meaning**.
- Keyboard navigation throughout.

## 8 · What the stage loses (button inventory → where it goes)
| Today | Goes to |
|---|---|
| Starter-button row | one placeholder line in the composer |
| Thread chips | "what recurs?" in words; counted list arrives as an object; chips only in DIRECT |
| Plan form, status dropdown, Remove | proposed-step objects, the spine, status suggestions |
| Excerpt strip | passage cards inside the turn that used them |
| Reading-permission control | Request objects in context; full control in the drawer |
| Kind control | asked once in conversation; editable in the drawer |
| 7 lens tabs (full Develop) | "read it for pacing / as a first-time reader…" in words; `/lens` in DIRECT |
| 92-button full view | remains as "More ways" for now; retired only after the walk proves nothing is lost |

## 9 · Laws preserved (each with a wrong design the suite must kill)
| Law | Wrong design that must die |
|---|---|
| No state change from words alone | "read the book" silently grants Work-level reading |
| Applied ≠ resolved | a successful Use it marks the step resolved |
| Return brief only from records | the brief says "you fixed Chapter 4" with no receipt |
| A passage card names the revision she read | a card shows today's text labelled as what she read |
| Facet parity | DIRECT finds a step GUIDED cannot reach |
| Suggestions never send themselves | the placeholder line submits on Enter-in-empty |
| Outline alternatives never move the manuscript | "keep as alternative" reorders chapters |
| Plan bound to manuscript and Work | a step edited through another manuscript (fixed in `c09b28986`) |
| Unverified context is refused, not guessed | a moved-but-unique phrase is held as if valid (fixed in `c09b28986`) |
| Standing never reaches cognition (D5, narrow dismiss exception) | kept steps are fed back to her as truth |

## 10 · Substrate: what has to exist
| # | Need | Exists? |
|---|---|---|
| G1 | Step ↔ desk event join (applied/undone from receipts) | ⛔ no — the desk has receipts; nothing links them to a step |
| G2 | Revision-pinned reads (what she was handed, by revision) | ⛔ no — `lastRead` holds section ids; plans hold a digest |
| G3 | Typed turn objects from the Work-conversation route | ⛔ no — turns are text plus at most one navigation action |
| G4 | Intent → capability registry → confirmation protocol | ⛔ no |
| G5 | Return brief composed from records | ⛔ no |
| G6 | Commissioned readings usable in the Work conversation (Nov 8 defect) | ⛔ open, not verified fixed |
| G7 | DIRECT palette and drawer | ⛔ no |
| G8 | Outline alternatives (non-mutating) | ⛔ no; "move chapter" stays a held lane |

## 11 · Order (each one walked on *The Long Harbour* and a helper's nonfiction book before the next)
1. **Finish the journey that exists** (reviewer's gate): G1 + a browser walk of plan → passage → change → apply → leave → return → undo, with the refusal cases (wrong manuscript, duplicate anchor, stale revision, revoked permission, other member, repeated action). Record in the owner handoff.
2. **G6 brought forward (reviewer, 2026-11-09): readings usable in the Work conversation**, with revision provenance and consent, because the Nov 8 witness showed MAIA reading a chapter in Develop and then lacking it in the next turn. This is the core relationship to repair before the interface is called ready.
3. **G2 + G3: passage cards and comparisons in turns**, revision-labelled. Retires the excerpt strip.
4. **G4: words in, confirmed acts out.** Retires the plan form, permission control, kind control and starter row.
5. **G5: return brief.**
6. **Lenses by words.**
7. **G7: DIRECT palette and drawer.**
8. **G8: outline alternatives.**
Then: independent review, founder walk, and only then a ruling on making the stage the default.

## 12 · Lane and process
No new lane: this is the Writer's Studio lane's own next milestone. No orchestrated multi-agent run is needed to build it; it needs one **independent review** before each acceptance, by a reviewer who did not build it. Merge, migrations (`20261108000001–0004`), deploy and the default switch remain founder acts.
