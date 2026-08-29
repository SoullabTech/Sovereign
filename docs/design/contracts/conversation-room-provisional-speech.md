---
# Exists ONLY because the design-canon gate requires a contract to cover a
# member-facing file. Scope is ONE row of the voice bar: the text shown while
# the member is still speaking, and whether the member can tell it apart from
# what MAIA has actually taken. It defines nothing else.
room: Conversation
human_activity: speaking to MAIA and being able to see that she is hearing it — before the turn exists
surfaces:
  - components/voice/VoiceInteractionBar.tsx
change_class: experiential
principles:
  - MAIA_OATH — the system does not claim a capacity it does not have; a provisional reading is not a turn and must not be shown as one
  - MAIA_SOVEREIGNTY_INVARIANTS — sovereignty first; the member must be able to see which of their words the system has taken
  - CLAUDE.md, MAIA Sovereignty — "Voice: Local TTS/STT or browser APIs only"; provisional text is produced by the same first-party Whisper as the final transcript
reference_surfaces:
  - docs/design/contracts/conversation-room-mic-lifecycle.md — sibling contract on the component that drives this bar; consulted for scope discipline only
  - docs/ops/MAIA-D01_NATIVE_VOICE_DESKTOP_WITNESS_2026-08-25.md §XII — the ruling that forbids returning member audio to browser SpeechRecognition
  - commit 11bd40e3 (DESKTOP-SOVEREIGN-STT-LIFECYCLE-01) — the revocation this row inherits rather than routes around
screenshot_desktop: docs/design/contracts/screenshots/stt-interim-provisional-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/stt-interim-provisional-mobile.png
experience_verification: >
  Both screenshots are the real `VoiceInteractionBar` rendered by the dev server
  in `voiceState="listening"` with a fixed provisional string, captured headless
  at 1280x800 and 390x844. They witness ONE thing: that the row states its own
  status ("hearing · not sent yet") next to the words, and that the label and the
  text stay on one line with the text truncating rather than the label. They do
  NOT witness provisional text following live speech on the Desktop device —
  that remains unwitnessed, and is the founder's to see.
shared_with_house: a surface names the status of what it is showing; the member never has to infer whether something has been committed
distinct_to_room: here the uncommitted thing is the member's own speech, arriving before they have decided to send it — so the distinction between heard and taken is the member's, not the system's, to lose
---

# Provisional speech row — Experience Contract (minimal)

**This contract exists to satisfy the design-canon gate and nothing more.** It
governs one row of `components/voice/VoiceInteractionBar.tsx` — the transcript
line shown while `voiceState === 'listening'` — as two invariants:

- Text shown during capture is **labelled as provisional**. The member is never
  asked to infer from styling alone whether words have become a turn.
- Provisional text is **erased when the capture that produced it ends** —
  whether it ended in a transcript, a failure, or a revocation. Words MAIA never
  took must not linger where taken words appear.

## Why the label, and not just the italics

The row was already dimmed and italic. That is a hint, not a statement: it asks
the member to know a convention. `DESKTOP-SOVEREIGN-STT-INTERIM-01` makes this
row change *more* — with sovereign rolling transcription, earlier words can be
replaced as later audio is re-read — so the cost of misreading provisional text
as committed text goes up. A member who cannot tell the difference has less
agency over their own turn, which is the thing this surface exists to protect.

## What this contract does NOT define

The Conversation Room. Voice UX. The voice bar's other rows, controls, states,
timing, or copy. MAIA's relational stance. Visual design beyond the two
invariants above. Those remain unauthored, and nothing here should be cited as
settling them.
