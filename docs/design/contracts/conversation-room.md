---
# ── Identity ────────────────────────────────────────────────────────────────
room: Conversation
human_activity: ongoing conversation with MAIA — speaking or writing, reflecting, and deliberately choosing what, if anything, crosses from that conversation into another durable room

surfaces:
  - components/OracleConversation.tsx

change_class: experiential

# ── Governing law ───────────────────────────────────────────────────────────
principles:
  - INHABITABLE_ARCHITECTURE — rooms come from human activity, not data models
  - CONSTITUTIONAL_DIRECTION_OF_AUTHORITY — authority moves upward only, through authored experience; the system never manufactures a higher-order record the member did not author
  - MAIA_OATH — no guru stance; MAIA offers reflection, never authority
  - MAIA_SOVEREIGNTY_INVARIANTS — consent for memory; there is no stealth memory, and nothing durable forms without a member gesture
  - INHABITABLE_ARCHITECTURE_STANDARD design law 2 — the interface reveals, it does not expose

# Approved reference surfaces consulted. Real artifacts, not vibes.
reference_surfaces:
  - docs/design/contracts/journal-room.md — the destination room of the crossing this contract governs; consulted for shape and for what Journal considers a kept entry
  - docs/design/contracts/conversation-room-voice-capture.md — the partial Conversation contract that explicitly reserved this document as unauthored work
  - docs/design/contracts/studio-home.md — consulted for House/Room split shape

# ── The House / Room split ──────────────────────────────────────────────────
shared_with_house: the House token layer and field hierarchy, the provenance voice, gesture language in human verbs, and the House rule that a durable record forms only from a member gesture — Conversation uses the same crossing grammar every other room uses
distinct_to_room: this room is the only one whose material is unfinished — speech and half-formed thought in motion, not a kept artifact. Everything here is provisional until the member chooses otherwise, so the room must make the difference between "said" and "kept" unmistakable, and must never quietly promote the first into the second

# ── Evidence (required when change_class: experiential) ─────────────────────
screenshot_desktop: docs/design/contracts/screenshots/conversation-room-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/conversation-room-mobile.png
experience_verification: WALK (2026-08-14) — walked at /maia against a local dev server on a worktree branched from canonical 8ca322891, authenticated as the existing fixture member walk.878 via a locally minted auth_sessions row, at 1280x800 and 375x812. Captured the arrival state at both viewports; both are the evidence above. Observed at arrival- the greeting "Good afternoon, Walk 878", the line "I'm here when you're ready.", the holoflower, a single "I'm ready" gesture, and one composer reading "Message MAIA...". Confirmed the room offers exactly one way in at arrival and does not present an inventory, a dashboard, or a capability menu. Confirmed the composer is the resting state at both viewports and that nothing is kept by merely arriving. NOT VERIFIED, and deliberately not claimed- the save-to-Journal crossing was NOT exercised in this walk. It is triggered by a voice command requiring a microphone, and the code path that performs it is the subject of a stopped, uncommitted fix; walking it would have meant walking the defect this contract was authored to unblock. The crossing invariant below is therefore stated as governing law, not as verified behavior. OBSERVED AND REPORTED, not fixed- the arrival renders a purple/violet ambient field at both viewports, against the House rule that the field is navy and never purple. Outside this unit's authority; recorded so it is not lost.
---

# Conversation — Experience Contract

**What this governs.** `components/OracleConversation.tsx`, the primary
member-facing Conversation surface. The component is mounted at `/maia` (the
canonical member route), and also at `/field/talk`, `/studio/maia`, and the
partner onboarding prelude. This contract governs the component wherever it
mounts; the walk above was taken at `/maia`.

**Relationship to the existing voice contract.**
`docs/design/contracts/conversation-room-voice-capture.md` governs one component,
`components/voice/WhisperContinuousConversation.tsx`, and says of itself that it
is "not a full room contract for `/maia`", leaving "the Conversation room's own
experiential contract" as unauthored work. This document is that work. The voice
contract is not superseded and its surface is not absorbed here.

## Provenance — read this before treating the contract as a design origin

This contract was authored **after** a journal-save integrity fix was stopped by
`check:design-canon`, and **while that fix remained uncommitted**. It is not
evidence that the implementation was built from a contract. The order of events
was: defect witnessed in production, fix implemented and tested, gate refused the
commit because this surface had no contract, founder authorized this design-only
unit, contract authored, fix still waiting.

The gate did what it exists to do: the first legitimate change to a legacy
member-facing surface forced the system to say what place that surface is. That
is worth recording plainly rather than laundering into a tidier story.

## What this room is for

A person in ongoing conversation with MAIA — talking or typing, thinking out
loud, circling something, changing their mind. The material here is unfinished by
nature. Most of it is meant to pass.

The second half of the activity matters as much as the first: the member decides
what, if anything, survives the conversation. Keeping is a distinct act from
speaking. A room that blurred them would be quietly converting a person's
thinking-out-loud into a record they did not choose.

## Arrival

> **"Good afternoon, [name]" · "I'm here when you're ready."**

Where am I: in conversation with MAIA. What is this place for: saying something
and being met. What is here now: nothing yet — the room opens empty, holding no
inventory of past sessions. Where can I begin: one composer, one "I'm ready".

The room opens on an address, not on a list. Nothing has been kept simply because
the member arrived.

## Gestures

| Gesture | Language used | Why this wording |
|---|---|---|
| begin | "I'm ready" | the member declares readiness; MAIA does not start the encounter |
| speak or write | "Message MAIA..." | plain, unloaded; not "Ask", which would frame MAIA as an answer source |
| cross into Journal | "Saved to journal" | reports a completed crossing — and may therefore be said only when the crossing completed |

## The Conversation to Journal crossing invariant

This is the load-bearing rule of this contract.

1. **A save is a member-authored crossing.** Content moves from Conversation into
   Journal because the member asked, never because the system judged it
   significant.
2. **Success may be represented only after the destination positively
   acknowledges persistence.** Not when a request was dispatched, not when no
   error was thrown. Journal is the authority on whether a Journal entry exists.
3. **A failed or refused crossing remains visibly failed.** The member is told
   plainly. A crossing that did not happen is never reported as one that did.
4. **Originating in conversation confers no authority over Journal.** Conversation
   may not write to Journal without the member gesture, and may not describe a
   Journal state it has not been told about.

Rule 2 is stated in the negative because that is how it failed: a save reported
success on the mere resolution of a request that had in fact reached nothing.

## Forbidden here

- reporting a crossing as successful without positive acknowledgement from the
  destination room
- forming any durable record from conversation without a member gesture
- an inventory, dashboard, or capability grid at arrival — the room opens on the
  person, not on the product's surface area
- MAIA opening the encounter, or framing herself as the reason the member is here
- treating unfinished speech as though the member had committed to it

## The two brand tests

**Same house?** Yes. The field hierarchy, the ember accent on the single
readiness gesture, the human-verb gesture language, and the crossing grammar are
the House's, shared with Journal and Studio Home. (One exception is recorded
honestly in the evidence above: the arrival's ambient field renders purple where
the House rule is navy. Reported, not fixed, not excused.)

**Distinct room?** Yes. Journal opens on the member's kept words; Conversation
opens on the member themself and holds nothing. A member dropped into either
without a label would know which one they were in by whether anything had been
kept.
