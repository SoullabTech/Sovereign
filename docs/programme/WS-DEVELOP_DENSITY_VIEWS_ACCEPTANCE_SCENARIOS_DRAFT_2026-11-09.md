# WS-DEVELOP density views — acceptance scenarios, DRAFT (2026-11-09)

Fictional writers and books only. Design input, not ratified. Based only on the decisions in `WS-DEVELOP_DENSITY_VIEWS_PARITY_MATRIX_DRAFT_2026-11-09.md`.

### Scenario 1: Focus - Quiet
**Given** Ines opens Develop on her novel *The Salt Orchard* for the first time
**When** the stage loads
**Then** she sees the header, her chapter text in the centre and one place to talk with MAIA; the chapter rail is collapsed; nothing else moves or appears unless she asks.

### Scenario 2: Discoverability - Quiet
**Given** Tomas works in Quiet on *Ledger of Small Hours*
**When** he wants his plan and the chapters MAIA read
**Then** both are one step away behind "More", and the field switches (shape, movement, what returns, what carries through, reader) are one step away; nothing he could use in All tools is missing.

### Scenario 3: Discoverability - All tools
**Given** Ama prefers to see everything while revising *Nine Bridges*
**When** she chooses "All tools" from the View control in the header
**Then** the plan, the excerpts, the starters, the field switches and the "why MAIA thinks this" disclosures are open, and the capabilities are exactly those she had in Quiet.

### Scenario 4: MAIA continuity - switching views
**Given** Ines is mid-conversation with MAIA about chapter 3 in Balanced
**When** she switches to Quiet
**Then** the conversation, its history and the chapter stay exactly where they were; MAIA's reading, proposals and what she read are unchanged.

### Scenario 5: Persistence - browser only
**Given** Tomas set his view to Balanced on his laptop
**When** he reopens Develop on the same laptop the next day
**Then** Balanced is still selected; **and when** he opens Develop on his tablet, he gets Quiet, and nothing tells him otherwise is broken.

### Scenario 6: Persistence - temporary per manuscript
**Given** Ama's default is Quiet and she switches to All tools for *Nine Bridges* only
**When** she opens her other book, *The Long Field*
**Then** it opens in Quiet; her default is unchanged.

### Scenario 7: Authorship - decline and undo in Quiet
**Given** MAIA proposes a change to a passage in Ines's chapter 5 while Ines is in Quiet
**When** Ines declines it, then later accepts another proposal and undoes it
**Then** decline and undo are on the open proposal in Quiet itself, and her own text is exactly as it was before each act.

### Scenario 8: Authorship - challenge in All tools, density separate from working style
**Given** Tomas uses MAIA's Direct working style and the All tools view
**When** he challenges an observation ("I don't think that pattern is there")
**Then** he can talk it through on the observation, the evidence MAIA rests on is reachable, and switching to Quiet afterwards does not change MAIA's working style or what she proposes.

### Scenario 9: Render paths - observation open and close
**Given** Ines is in Quiet on *The Salt Orchard*
**When** she opens one of MAIA's observations, reads it, closes it, then switches to "See how it is shaped"
**Then** the view stays Quiet throughout; the dense layout never appears unfolded; Talk, Let rest, Undo and what MAIA read are visible on the open observation.

> 🔴 **PARTLY RED AGAINST SOURCE, AND NOT YET WALKED** (read 2026-11-10, `de8c3d04b` and `a70bd1cc6`). Two findings, kept apart:
>
> ⭐ **CONFIRMED (source).** `P4R1DevelopView.tsx:3346` gates the calm stage on `!selectedObservation`, so opening an observation **exits the calm-stage render path**. This scenario's second clause — *"the view stays Quiet throughout"* — is therefore not satisfied by one mechanism; it is at best satisfied by two mechanisms agreeing.
>
> 🔶 **UNVERIFIED (runtime).** *"The dense layout never appears unfolded"* is **not** established. Path B carries its own density control, default `focused` (spec §11). The exit may well land folded. Proving or falsifying this clause needs the journey executed, not a file read.
>
> ⭐ **Keep this scenario exactly as written.** It predeclared the right behaviour before the read, and it is the falsifier for P0. Rewriting it to match the source would destroy the only predeclared evidence P0 has — and over-reading it as fully red would claim a visual failure nobody has yet observed.

### Scenario 10: Shared browser - two writers
**Given** Tomas set All tools on a shared library computer and signed out
**When** Ama signs in on the same browser and opens Develop on *Nine Bridges*
**Then** she sees Quiet, her own default, and nothing of Tomas's setting.

### Scenario 11: Conversational parity
**Given** Ama is in Quiet
**When** she asks MAIA in conversation for each capability she can see in All tools (for example "show me how this chapter is shaped", "what did you read for that?", "let that observation rest")
**Then** each is either done through the conversation or MAIA points her to its one-step route; and the request MAIA receives (manuscript context, permissions, available actions) is the same as in All tools.

### Scenario 12: Refresh and switching Work
**Given** Tomas's default is Balanced and he set All tools just for *Ledger of Small Hours*
**When** he refreshes, changes chapter, opens *The Long Field*, then returns to *Ledger of Small Hours* in the same session
**Then** *Ledger* is still All tools, *The Long Field* is Balanced; after he closes the browser and comes back, *Ledger* is Balanced again.

### Scenario 13: The whole journey — attention and authorship end to end

**Given** Ines opens Chapter 10 of *The Salt Orchard* in Quiet
**When** she inspects one of MAIA's observations, talks with MAIA about it, switches to All tools, returns to Quiet, leaves Develop entirely, and later resumes
**Then** across every step: her manuscript position is Chapter 10; her presentation preference is the one she last chose; MAIA's **authorized** reading history is intact and unchanged in extent; her decisions (what she set to rest, declined, undid) are intact; and every one of the 56 mapped capabilities is still reachable.
**And** no step in that journey silently authorized a read, began an edit, or altered MAIA's reasoning — in particular neither of the two view changes.

> ⭐ This is the decisive scenario, and it is decisive because it is the only one that crosses **all four** transitions the parity matrix names (observation · conversation · view change · leaving and resuming). Scenarios 4, 9 and 12 each cover a segment; none covers the journey, and a writer's attention is lost at the seams rather than inside them.

### Scenario 14: R1 — presentation does not turn an encounter into an interrogation

**Given** MAIA has made one grounded observation on Chapter 10
**When** Ines reads it in Quiet, then in All tools
**Then** in both views the encounter **notices once** and stops; further inquiry happens only if Ines opens the discussion act.
**And** All tools does not expose a second or third pass over the same passage as a visible control, in any form — more visible surface is not more licence to speak (R1: `ENCOUNTER notice only` / `DISCUSSION notice → inquire → hear writer → update understanding`).

### Scenario 15: R2 — ordering stays legible in every view

**Given** MAIA has several lawful observations on one chapter
**When** Ines views them in Quiet, Balanced and All tools
**Then** the order is the same and its basis is stateable in each; nothing is withheld in Quiet that is shown in All tools.
**And** no view labels or implies "the three most important things" — selection chooses which lawful things to raise first and is auditable; it is never a ranking by importance, and Quiet's smaller surface must not become screening (R2: *selection is not screening*).

### Scenario 16: R3 — agreement that erases tension fails in every view

**Given** MAIA holds a grounded observation and Ines clarifies an intent that cuts against it
**When** this happens in Quiet, and again in All tools
**Then** MAIA neither ignores the clarification nor agrees in a way that erases the tension; she updates her understanding while the tension remains visible and stateable.
**And** the outcome is identical in all three views: a calmer presentation must not make capitulation easier to produce or harder to see (R3: `update ≠ capitulate`).

### Scenario 17: A late reading cannot interrupt a conversation

**Given** Ines is mid-exchange with MAIA on Chapter 10 and has typed, but not sent, a follow-up
**When** a reading completes
**Then** MAIA's conversation state is unchanged, **Ines's unsent prompt is intact**, the exchange is not ended, focus does not move, and the only visible change is an unobtrusive *reading ready* state.

> 🔴 **A source-level RISK, not yet demonstrated.** The effect keyed on `props.reading?.id` runs `setTalking(false)` and `setDialoguePrompt('')` whenever the reading changes, so an arrival during an observation conversation would end it and clear the prompt. Recorded as a **separate P0 defect**; the observation-selection patch does not repair it.

### Scenario 18: Reading ready is not reading opened

**Given** a reading has completed
**When** Ines chooses **Explore observations**
**Then** the **observation index** opens, **no observation is selected**, and each observation opens only by her explicit choice. *Explore observations* must never open observation 1.

### Scenario 19: Let rest is per-observation, always

**Given** a reading with several observations
**Then** *Let rest* exists only on an individual observation, in every view. **There is no bulk dismissal and no control that rests more than one observation at once.**

### Scenario 20: Existing lens routes preserve manuscript continuity

**Given** Ines is on Chapter 10 in Quiet
**When** she moves from Overview into each existing lens page and back
**Then** the chapter remains a **readable working surface** throughout, and on return her chapter, scroll position, selection and any **unsaved in-progress text** are exactly as she left them.
**And** if a lens page cannot keep the chapter readable within the bounded patch, that is reported as an **unresolved acceptance condition**, not a pass.

### Scenario 21: Reopening restores the view and chapter, and clears temporary focus

**Given** Ines left Develop with an observation open and a saved conversation about it
**When** she reopens Develop on a new visit
**Then** her **View and chapter** are restored, the **temporary observation focus is cleared**, and her **saved conversation history is still there.**

### Scenario 22: Balanced is not credited until it is different

**Given** Quiet, Balanced and All tools
**Then** three-view acceptance requires Balanced to differ from Quiet in **how a capability is presented**, while all three keep the same authorized capabilities.
**Today this FAILS: Balanced is not differentiated from Quiet.** Identical behaviour must not be reported as a completed implementation.

## Also required in every view
Keyboard reach to the View control and every folded item, visible focus, readable contrast, zoom, screen reader names, reduced motion.
