# Writer's Studio — full JARVIS flow review (2026-11-05)

**Occasion.** The founder reported on production:
- "it shouldn't be this hard to edit my work"
- "way too many technical words and little relationship"
- "it doesn't answer my requests"
- "buttons do nothing"
- "we were supposed to have fixed this months ago"

The founder asked for a full review, not a half measure.

**Evidence.** This review rests on five sources:
- A live walk of production `f90d03fba`, using the test Work and ELEMENTAL_ALCHEMY. The ELEMENTAL_ALCHEMY walk was read-only.
- A **local walk of a new tester's path**: PR #2125 on an isolated local database, with a test member admitted the way testers are (beta roster).
- Four read-only code audits: dead ends, writer-facing language, Studio text stored as the writer's words, and paths from intent to changed words.
- The design record.
- The founder's screenshots.

## Verdict

**The redesign exists and was ruled. It was never built.** The governing design is
`WRITERS-STUDIO_CONVERSATION-STAGE_DESIGN_DECISION_2026-11-04.md`, on branch `claude/ws-conversation-stage-design-20261104`, unmerged. It says:

> One wide conversation. The passage stays pinned above it. Edits arrive as turns you can use, change, discuss or undo. Every refusal has an action.

The founder ruled **R1 (replace Focus)** and **R2 (MAIA speaks first)**, and liked the clickable mock. The build plan has 5 steps; none of them started. The earlier records point the same way:
- CONVERGENCE-01 (relational language law)
- DEVELOP-RELATIONAL-GUIDANCE-R1 ("Develop must lead to editing")
- the 10-03 whole-product review (question first, machinery behind it)

**So this is a build, not new R&D.** Every finding below is either solved by the Conversation Stage or must be carried into it.

## What a tester meets today (witnessed)

| # | Moment | What happens | Witness |
|---|---|---|---|
| 1 | Select a passage, then Focus | **Two gates before any help:** "How would you like me to hold this conversation? Ordinary / Sanctuary", then "I haven't read this book with you yet… Start with MAIA". Both are polite, but neither is a conversation. | local |
| 2 | An option appears | The conversation collapses to a header. **There is no box to answer MAIA.** The only text box is "Edit your working version", inside a collapsed "More". | local; fixed as a stopgap in #2125 |
| 3 | Use this, then ask anything | **MAIA's answer goes into a new, invisible conversation.** The passage changed, so the next question opens a new thread (`de54…`). MAIA replied there; the screen stays on the old thread (`8930…`). | local; server-confirmed |
| 4 | Discuss after an option | The reply is saved but hidden behind the old option card. | production; fixed in #2125 |
| 5 | Develop, after "Talk with MAIA first" | Every other button silently does nothing. The Studio's own starter text counted as the writer's unsent text. | production; fixed in #2125 |
| 6 | Develop: ask in an observation | The question is saved. "May I read Sections 175, 176, 182?" is drawn at the top, off-screen, so it looks like no answer. | production; fixed in #2125 |
| 7 | Anywhere | **The Studio speaks as the writer.** About 20 buttons save composed instructions under "You". | production + audit |
| 8 | Develop | **About 75 technical strings:** "frozen reading", "observations", raw lens keys ("RECURRENCE"), "18 of 262 sections in full; 244 by position only", "Section 175" instead of a heading, 3 views × 9 lenses shown first. | production + audit |
| 9 | Develop | **No path from an observation to editing.** "Nothing said here changes your work"; the founder's "offer edits…" had nowhere to go. | production |
| 10 | Option title | The title shows a stray `*` ("land on \*frightening"): markdown leak. | local |
| 11 | Reload in Focus | The writer's place is lost; the conversation is gone. | production + audit |

## Four audits (summary; file:line detail in the session record)

**Dead ends.** Nine more silent no-ops beyond #2125, ranked:
1. A Focus send is dropped if writing changes while MAIA opens the thread. Same root as row 3.
2. "Use with MAIA" in Materials reports success while nothing was sent.
3. Craftsman per-change Use / Keep / Write, and the Compose menu, are enabled while their handlers refuse.
4. "Use my wording" erases the writer's phrase when the apply is refused.
5. `window.confirm` is the only discard prompt (silently false in some webviews).
6. Reload drops Focus.
7. Early clicks are swallowed during the Work check.
8. A failed conversation load is shown as empty, with no retry.

**Language.** About 110 offending strings, about 75 of them in Develop. Each has a plain, relational replacement in MAIA's voice. Structural problems:
- The lens picker comes first.
- Counts and coverage sit in the foreground.
- Section ordinals are used instead of headings.
- Reassurance comes by negation ("did not trigger", "does not commission").
- Permission is framed as authorization.
- Focus has five machine controls in its top bar.

**Studio text stored as the writer's.**
- **Focus:** adjust (lighter / keep / further / another), approach, the Talk box, "Explain this change", Go deeper, Craftsman Suggest / Discuss, and Why on a change. These need new closed `passageAct`s; the existing turn route already carries them.
- **Develop:** "Explain it plainly", "Talk with me", Go deeper, and the attention / lineage starters. These need one small server key (`observationAct`) on the ask route, following the existing `teachingAnchor` path, so that only the writer's words are stored.

**Paths to changed words.** There are about 12 doors but only 4 writers: typing, Use this, Craftsman save, and Undo.
- Edit options are offered in 5 places, Discuss in 6, Teach in 4.
- Craftsman's Table is reachable as a room and as Focus's deeper mode.
- Develop's dialogue and Write's MAIA panel cannot lead to an edit.
- The writer's own version needs Save → Read in context → Apply, which the 11-03 ruling replaced with one press.

## The build (one lane, built and tested locally before any deploy)

The Conversation Stage is the frame. Everything else goes inside it.

1. **One conversation per passage, always visible** (stage steps 2 and 4).
   - The wide thread replaces Focus.
   - The passage is pinned above.
   - The composer is always at the bottom.
   - Options arrive as turns with **Use it · Change it · Talk about it · Undo**.
   - **The conversation follows the passage through Use this** (fixes row 3: the thread continues, or the new thread is shown with the history carried).
   - Reload restores the passage and the conversation.
2. **Gates speak as MAIA, in the thread, with buttons** (stage step 1). Posture and relationship become one short MAIA turn, not two panels. Every refusal carries an action.
3. **MAIA opens** (stage step 3, R2). An observation and one question, on the writer's gesture only, never under Sanctuary. **Needs O1.**
4. **Only the writer's words are stored** (Focus and Develop). This uses the closed act keys listed above. The server holds the instructions.
5. **Develop leads into the conversation.** Each observation gets "Talk about this passage with MAIA", which opens the stage on the cited passage with her point as the first turn. Develop's own dialogue gains the same exit.
6. **Develop, question first, in plain language.** Machinery (lenses, counts, coverage, lineage) goes behind "More". The ~110 strings are rewritten in MAIA's relational voice; headings are used, never ordinals.
7. **One door per act.** Selection → the conversation. Discuss, Teach and edit options become things you say in it. The menu's duplicate doors and the separate Craftsman room fold into "Change it" (needs a founder ruling on what stays).
8. **Close the remaining dead ends** in the same lane (audit list).

Each step is test-first with a defeat candidate (TESTING-01 §0). It is walked locally as a new tester on the isolated database, and **the founder tests locally before anything deploys.**

## Rulings owed

- **Authorize the Conversation Stage lane** (the record opens none).
- **O1** — how a MAIA-first opening is recorded: (a) as a typed event, or (b) as a fixed short writer turn. Recommendation: **(a)**.
- **Doors** — which menu entries stay once the conversation carries Discuss, Teach and edit options.
