# Writer's Studio — Conversation as the main stage (design decision, DRAFT)

**Date:** 2026-11-04 · **Decided by:** founder, in session ("B. Conversation as the main stage, passage pinned on top") · **Status:** DESIGN DECISION RECORDED, ⛔ no build authorized by this record · **Parent:** WRITERS-STUDIO-CONVERGENCE-01 (conversation-first steps 1–5b)

## Why
The founder's read of the Craftsman's Table screen: the conversation felt *confining and an afterthought*. Cause, from the screen and code: MAIA's turn lived in a narrow side column under controls and gates, while the manuscript owned the stage. MAIA read as a tool consulted, not someone worked with.

## Decision
**B — a wide, calm conversation as the main stage, with the selected passage pinned at the top as a quote.** Proposed edits appear **inside the thread as turns** carrying *Use it · Change it · Talk about it · Undo*. (A margin conversation and an inline-at-cursor card were considered; inline may later serve quick asks. Neither is decided here.)
Known cost, accepted: the surrounding manuscript is less visible while in the conversation. Mitigation to design, not assume: a one-gesture return to the passage in place.

## What already exists (census, read-only, canonical `051bdeb9`)
- `EditorialDancePanel.tsx` already renders **the whole conversation oldest-first** (`FocusConversation`, "Your conversation") and an entry state ("What would help you here?"). The change is mostly **layout and where the proposal lives**, not a new engine.
- The proposal chain (Use this / Change / Why / Teach me / Undo) exists on `CraftsmansTableR1` / the Focus option card; step 5b folded it into Focus.
- Gates (posture, MAIA relationship, Living Work) already hold an act and continue after the answer; their copy still speaks in system voice ("Nothing was sent").

## Increments (each reviewable, none started)
1. **Gates speak as MAIA, in the thread**, with the action attached (start with MAIA · keep it private). Smallest, removes the visible dead end.
2. **Stage layout:** wide thread, passage pinned as a quote, composer at the bottom; the side column is retired for this mode. Phone-first.
3. **Proposal as a turn:** edit options render in the thread; Use it / Change it / Undo act on that turn; "shorter" / "why" are follow-up turns, not mode switches.
4. **Return to the page:** a pinned-quote tap or "Back to the page" returns to the passage in place with no loss of position.

## Laws this must not weaken (from the ratified contract)
- The writer authorizes every change; MAIA proposes. Use it stays the writer's gesture; Undo stays available.
- **Authorship is facet-invariant:** a friendlier conversation must not mean MAIA writes more of the text. A proposed rewrite never arrives pre-applied and never grows because the thread is "warmer".
- Sanctuary: nothing is sent, saved or inferred; held acts never run under it.
- No dead end, no loss of place (convergence spine). Every refusal carries a next action.
- Unranked, all reachable: no thread element may imply a ranking of observations.

## Acceptance (to be given defeat candidates before build, per TESTING-01 §0)
- From a selected passage with no relationship begun, a writer reaches an answered first turn without leaving the thread.
- Each proposal turn exposes Use it, Change it, Talk about it, Undo, and Undo restores exactly the prior wording.
- Returning to the page restores the same passage and scroll position.
- No state shows only a system message with no action.
- Phone width: thread, quote and composer usable at 390px.

## Owed from the founder before build
- Is inline-at-cursor (C) wanted for quick asks alongside B, or B only?
- Does the stage replace Focus's current layout everywhere, or only when a conversation is open?
- Authorization of the lane (a founder act); this record opens none.

## Not decided here
Margin conversation (A); ranking or prioritizing observations; any change to what MAIA is allowed to propose; the Jarvis walk charter (separate draft).
