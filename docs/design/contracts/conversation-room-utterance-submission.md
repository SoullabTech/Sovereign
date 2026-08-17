---
# Exists ONLY because the design-canon gate requires a contract to cover a
# member-facing file. Scope is utterance ADMISSION: how many times one thing a
# member said becomes one thing MAIA answers. It defines nothing else, and in
# particular it does NOT define the Conversation Room.
room: Conversation
human_activity: saying one thing, and having it counted once
surfaces:
  - components/OracleConversation.tsx
  - components/voice/ContinuousConversation.tsx
change_class: structural
principles:
  - MAIA_OATH — the system does not manufacture member speech; a sentence said
    once must not enter the record, or the model, as a sentence said twice
reference_surfaces:
  - docs/design/contracts/conversation-room-mic-lifecycle.md — sibling minimal
    contract on the same components; consulted for scope discipline only
  - production conversation_turns, 2026-08-17 — 271 duplicate member turns in
    30 days, 212 with differing exchange ids, mean gap 0.30s. The witnessed
    failure this unit removes.
shared_with_house: a member's authored act is counted once — the record follows
  what the person did, never what the transport happened to deliver
distinct_to_room: speech has no submit button. The member cannot see how many
  times their sentence was sent, so a duplicate is invisible to the only person
  who could correct it.
structural_rationale: >
  Nothing rendered, laid out, worded or gestured changes. No route, no copy, no
  control, no data path, and no timing the member can perceive except the
  disappearance of the second copy. Two duplicate checks are corrected: one
  compared transcripts as exact bytes, so iOS re-emitting its final hypothesis
  capitalized and punctuated read as a different sentence; the other read React
  state inside a callback, which is stale when two submissions land in the same
  batch. Both now compare normalized text through one shared predicate, and the
  second reads a ref written synchronously. Screenshots are not supplied because
  the defect is a count, not a rendering; its evidence is the production query
  named above plus a negative control asserting the previous comparison fails on
  every observed revision pair. Device witness is the founder's and is not
  claimed here.
---

# Utterance submission — Experience Contract (minimal)

**This contract exists to satisfy the design-canon gate and nothing more.** It
governs how many submissions one utterance produces, as one invariant:

- One thing the member said becomes at most one thing MAIA answers — and the
  member can still say the same words again as a genuinely separate turn.

The second clause is not decoration. A duplicate guard that silences a person
repeating themselves is a worse failure than the duplicate it prevents, because
it makes the system unreliable in the direction the member cannot work around.

## Why this is not the mic lifecycle contract

`conversation-room-mic-lifecycle.md` rules whether the microphone's state is
true and whether it can be left. That is a different property, on a different
mechanism, and it was deliberately not widened to absorb this one — a contract
that grows to cover whatever was edited next stops meaning anything.

## What this contract does NOT define

The Conversation Room. Voice UX. MAIA's relational stance. Visual design. Copy,
gestures, composition, navigation, transcript rendering, modes, or any behaviour
beyond the single invariant above. Those remain unauthored, and nothing here
should be cited as settling them.
