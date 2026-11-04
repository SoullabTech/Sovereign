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

## Founder rulings taken in session (2026-11-04)
- **R1 — REPLACE.** The conversation stage replaces Focus's current layout; it is not an extra mode.
- **R2 — MAIA OPENS.** MAIA speaks first, with an observation and one question, when the writer opens a conversation on a passage. (Founder: "very helpful".)
- A clickable mock was reviewed and liked: pinned passage in a green quote box, MAIA bubble, option as a turn with Use it / Change it / Talk about it, Undo bar. Mock: https://claude.ai/artifact/MbGB9kpuo44FXdSRhd8Dg2 (made-up passage; private).

## Constraints R2 must respect (design defaults proposed, not yet ruled)
- **Trigger is a writer gesture, never mere selection.** The opening fires when the writer presses *Work with passage* (or the equivalent), not when text is highlighted. Highlighting sends nothing.
- **Never under Sanctuary; never before the gates are answered.** Posture and MAIA-relationship gates come first, and they speak as MAIA with buttons (increment 1).
- **The opening is an observation and a question, never a proposal.** This matches the existing discuss-first sequence gate (`sequence.ts`), which removes `reply_with_proposal` until MAIA has already taken a turn.
- **Cost:** one model call per opened conversation, not per selection.

## Open ruling needed (O1) — authored-turn custody for a MAIA-initiated opening
F1 (#2071) rules that a button press counts as the writer saying the button's words, and the server stores only the writer's short words as the writer's turn. An opening that MAIA speaks first has **no writer words**. Options: (a) store the gesture as a typed event ("opened a conversation on this passage"), not as speech, and let MAIA's turn be first; (b) store a short fixed writer turn ("Let's look at this passage") as the existing `discuss` act does. (a) is more honest; (b) needs no server change. **Recommendation: (a).** Needs a founder ruling because it changes what the thread records as the writer's own words.

## Build plan (none started; each step its own PR and Class A authorization)
1. **Gates as MAIA's voice, with buttons.** Replace system refusals with in-thread MAIA turns carrying actions (Start with MAIA · Keep this private · Just keep writing). Tests: for each refusal state (no Living Work, posture unanswered, no relationship, Sanctuary) a visible action exists; Sanctuary action never sends.
2. **Stage layout replacing Focus.** Wide thread; passage pinned as the green quote; composer at the bottom; side column removed. Tests: 390px width usable; selection and scroll position preserved; no horizontal scroll.
3. **MAIA opening (needs O1).** Gesture-triggered, once per opened conversation, never under Sanctuary or before gates. Tests: no model call on mere selection; exactly one call per opened conversation; opening never contains a proposal.
4. **Proposal as a turn.** Edit options render in the thread; Use it / Change it / Talk about it / Undo act on that turn; Undo restores exact prior wording. Tests: a proposal never arrives applied; "Change it" produces a new proposal turn, not a mutation of the old one.
5. **Back to the page.** One gesture returns to the same passage and scroll position.

Every step carries a defeat candidate per TESTING-01 §0 before implementation: a deliberately wrong version (e.g. opening on selection; a proposal applied on arrival; a refusal with no action) that the suite must kill.

## Owed from the founder before build
- Ruling on O1.
- Authorization of the lane (a founder act); this record opens none.

## Not decided here
Margin conversation (A); ranking or prioritizing observations; any change to what MAIA is allowed to propose; the Jarvis walk charter (separate draft).
