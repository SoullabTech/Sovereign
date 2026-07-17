# Conversation Chapters — Cross-Day Continuity Design Note

**Status:** DESIGN ONLY — no implementation authorized. Prepared under Kelly's Ruling 1 (2026-07-17):
> *A conversation may close. The relationship does not.*

One continuing MAIA relationship, expressed through conversation chapters. Not one endless visible transcript; not a stranger each morning.

## The six concepts, kept distinct

| Concept | Definition | Carried by (today) | Under chapters |
|---|---|---|---|
| **Relationship identity** | The one MAIA↔member relationship | `memberId` (server-trusted via session) | unchanged — never rotates |
| **Conversation chapter** | A bounded conversational encounter | `sessionId` (daily rotation) | unchanged mechanism, *named* as a chapter boundary |
| **Visible transcript** | What the member sees on open | current sessionId only (localStorage+PG rehydrate) | current chapter only — identical to today |
| **Remembered continuity** | What MAIA carries across chapters | atoms, conversational recall, spiral state, anamnesis (consent-gated) | unchanged — already crosses chapters |
| **Episodic marks** | Member-marked moments | `is_breakthrough` atoms, Marked Moments | unchanged |
| **Session closure** | An intentional end | does not exist (only the calendar boundary) | optional later gesture — NOT in the smallest model |

## Smallest viable model

**Nothing changes about how conversations run.** The daily rotation stays as the chapter boundary. Three small additions:

1. **A chapter list** — read-only endpoint, member-scoped: `GET /api/conversation/chapters` returning distinct `session_id` + date + turn count + first member line (as a title hint) from the existing `conversation_turns` table. No schema change; one index review (`user_id, session_id, created_at` — likely already served by existing indexes).
2. **A quiet "Earlier" affordance** — in the conversation surface (full page and sheet), alongside the existing session UI: opens the chapter list; selecting a chapter shows that day's transcript **read-only**. No resume, no merge, no "continue from here" in v1 — reopening a closed chapter as live context is a later decision.
3. **One localStorage change** — stop deleting yesterday's `maia_conversation_${sessionId}` cache on new-day mint (`app/maia/page.tsx` new-day branch). PG is the source of truth for chapter viewing anyway; the deletion only exists to serve the "clean slate" that rotation already provides.

**Explicitly NOT in this model:** loading historical transcripts into the prompt (remembered continuity already flows through the consent-gated memory layers — that is the *relationship* speaking, not the transcript); auto-surfacing yesterday ("You were saying yesterday…" volunteered = inference/imposition — MAIA may draw on permitted continuity when the member's words call for it, exactly as now); an explicit "close conversation" gesture (option for a later chapter of this work); any change to Sanctuary (sanctuary turns are never stored, so chapters truthfully contain no sanctuary content).

**Prompt-side guard (one line, when implemented):** never speak as if a new day made a new MAIA or erased the relationship; the day boundary bounds the *transcript*, not the *relationship*.

## Migration implications

- **Data:** none. `conversation_turns` already holds every non-sanctuary chapter keyed by `user_id` + `session_id`. Old chapters become visible retroactively — worth one copy decision: does the chapter list reach back before the feature ships? (Recommend: yes; the data is theirs.)
- **Sanctuary:** no interaction — nothing stored, nothing listed.
- **Consent surface:** viewing one's own past transcript is member-pulled and needs no new consent. If a member deletes memory, chapter transcripts are a *separate* store (`conversation_turns`) — the note flags that a future "delete my conversation history" gesture must cover both stores to be honest.
- **Capacitor/static builds:** chapter list is API-backed → degrades to absent on pure-static builds (same as PG restore today). Acceptable; localStorage still holds the current chapter.
- **Presence sheet:** the "Earlier" affordance rides the same conversation surface — no new architecture.

## Open questions for the implementation ruling

1. Chapter titles: date-only (quietest) vs first-line hint (more findable)?
2. Does "Earlier" live in both sheet and full page, or full page only at first?
3. Retention: chapters forever, or a member-set horizon?
