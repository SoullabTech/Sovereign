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

## Also required in every view
Keyboard reach to the View control and every folded item, visible focus, readable contrast, zoom, screen reader names, reduced motion.
