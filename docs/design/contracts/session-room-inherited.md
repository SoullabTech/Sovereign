---
# ── Identity ────────────────────────────────────────────────────────────────
room: Session Room
human_activity: two people meeting live in a scoped room. The member enters it from a consent threshold and can stop and leave at any time.

surfaces:
  - app/open/session-room/**
  - app/open/threshold/**

# This contract was drafted during the production-lineage reconciliation of
# 2026-10-31. The page reached canonical by merging production runtime
# 9856e27f7, which shipped it without a contract. Merging changes nothing a
# member experiences, so this contract is structural. It describes what the
# page already does; it authors no new design intent.
change_class: structural
structural_rationale: >-
  app/open/session-room/[roomId]/page.tsx and app/open/threshold/[token]/page.tsx
  on this branch are byte-identical to the pages production serves at 9856e27f7
  (git diff 9856e27f7 -- those paths is empty). Merging it onto canonical changes repository custody, not member
  experience. EXP-21 owes an experiential contract, with screenshots and a
  lived walk, before the next change that actually alters the room.

# ── Governing law ───────────────────────────────────────────────────────────
principles:
  - SESSION_ROOM_LIVING_ENCOUNTER — the Session Room is not a transcription or note-taking feature
  - ENCOUNTER_AS_PRIMITIVE — the encounter is the unit, not the record of it
  - EXP-21 consent threshold — the member arrives through the threshold, and runtime admission precedes all capture
  - EXP-21 Stop — "Stop and leave" closes local effects whether or not durable stop delivery has been confirmed

reference_surfaces:
  - docs/canon/SESSION_ROOM_LIVING_ENCOUNTER.md
  - docs/canon/ENCOUNTER_AS_PRIMITIVE.md
  - app/open/session-room/[roomId]/page.tsx (production 9856e27f7, as read)

# ── The House / Room split ──────────────────────────────────────────────────
shared_with_house: >-
  This contract makes no claim beyond what the page shows. The page uses
  plain-language confirmation and refusal copy ("The room did not authorize
  this request."), and it reports state without claiming more than the server
  confirmed.
distinct_to_room: >-
  This is a live transport room, not a conversation with MAIA. The page's own
  header states that no recorder, transcript or MAIA is opened. Its controls
  are entering, playing incoming audio, stopping and leaving, and returning to
  the threshold.
---

# Session Room — Experience Contract (inherited, pending EXP-21 review)

## Status

**Inherited, not authored.** This contract exists because the page moved from
production onto canonical during the 2026-10-31 production-lineage
reconciliation (`docs/programme/PRODUCTION_LINEAGE_RECONCILIATION_2026-10-31.md`).
It records only what the page's code and its originating commit (`350e58dfa`,
"integrate scoped Session Room lifecycle and durable Stop fencing") already
say. The EXP-21 lane owns the room and should replace this contract with an
experiential one. It does not grant design approval to anything.

## What this room is for

Two people meet live in a bounded room, entered through a consent threshold.
The room carries their connection and nothing else. No recording, transcript
or MAIA participation is opened here.

## Arrival

> **Session Room**

The member arrives from the threshold and sees the room before any capture
begins. Capture starts only after the server admits the runtime.

## Gestures (as the page labels them today)

| Gesture | Language used |
|---|---|
| Enter | "Enter Session Room →" |
| Hear the other person | "Play incoming audio" |
| End | "Stop and leave" |
| Go back | "Return to the threshold" |
| Check | "Check Stop confirmation" |

The page also shows connection-state panels: Capture, Incoming playback,
Signaling, Connection, and Transport observation. It also shows "Reports for
this connection". Whether those belong in the member's view is an open
question for EXP-21; this contract records them and does not endorse them.

## Forbidden here (from canon, not invented)

- Transcription, summarization or a note-taking frame. SESSION_ROOM_LIVING_ENCOUNTER says the room is none of these.
- Any capture before runtime admission.
- Treating Stop as dependent on server confirmation. Leaving must work locally.

## The two brand tests

**Same house?** Not assessed. This contract has no screenshots and no lived
walk. EXP-21 owes that assessment.

**Distinct room?** Partly, from code alone: it is a live-meeting room with no
MAIA presence, which no other room is. Not yet witnessed as experience.
