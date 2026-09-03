---
# Exists ONLY because the design-canon gate requires a contract to cover a
# member-facing file. Scope is the live evidence that the microphone is hearing
# speech RIGHT NOW. It defines nothing else, and it does NOT define the
# Conversation Room.
room: Conversation
human_activity: seeing that you are being heard while you speak
surfaces:
  - components/voice/VoiceInteractionBar.tsx
change_class: structural
principles:
  - MAIA_OATH — the system does not claim a capacity it does not have. A
    display that shows speech it is no longer hearing is the same lie as a
    microphone that reports LISTENING without native confirmation.
reference_surfaces:
  - docs/design/contracts/conversation-room-mic-lifecycle.md — sibling minimal
    contract; whether mic state is TRUE and whether it can be LEFT
  - docs/design/contracts/conversation-room-utterance-submission.md — sibling;
    how many submissions one utterance produces
  - commit 31fb4844d — where this bounded-transcript pattern was established
    and adjudicated; restored here, not newly designed
shared_with_house: a surface reports only what it actually knows
distinct_to_room: speech is transient and unreviewable. A member cannot scroll
  back through what they just said, so if the display drops or clips it they
  have no way to tell a mis-hear from a drop — and no way to know which.
structural_rationale: >
  No route, control, copy or gesture changes. The live transcript stops being a
  single `truncate` line that clipped a long thought to an ellipsis, and becomes
  a bounded box that grows to four lines and then scrolls, pinned to the newest
  words. Height is no longer animated, because a height tween measures once on
  reveal and would lock the row at one line while speech accumulates — clipping
  the very scrolling this provides. The transcript remains tied to actual
  `listening`: stale words must NOT persist through ARMING or thinking merely to
  keep something on screen, because the purpose is truthful evidence that the
  microphone is hearing speech now, not reassurance that it might be. A related
  correctness fix clears the line when an utterance is refused as a duplicate,
  so the member's last words are not left frozen in the bar after the episode
  ended. Evidence is the adjudicated pattern in 31fb4844d plus the founder
  device walk that found the one-line clip; no screenshots, because the defect
  is what the box does as text accumulates, not a static rendering.
---

# Seeing that you are being heard — Experience Contract (minimal)

**This contract exists to satisfy the design-canon gate and nothing more.** One
invariant:

- While MAIA is listening, the member can see what she is hearing — bounded,
  scrolled to the newest words, never silently clipped — and when she is not
  listening, that display does not persist and imply she still is.

## What this contract does NOT define

The Conversation Room. Voice UX. The microphone lifecycle (see the sibling
contract). Utterance admission (see the other sibling). Visual design beyond the
transcript box, copy, gestures, composition, navigation, or MAIA's relational
stance. Those remain unauthored, and nothing here should be cited as settling
them.
