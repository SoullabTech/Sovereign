---
# Exists ONLY because the design-canon gate requires a contract to cover a
# member-facing file. Scope is the native microphone lifecycle in one
# component: whether its state is TRUE, and whether it can be LEFT.
# It defines nothing else.
room: Conversation
human_activity: using the microphone — and being able to use it again afterwards
surfaces:
  - components/voice/ContinuousConversation.tsx
change_class: structural
principles:
  - MAIA_OATH — the system does not claim a capacity it does not have; a resolved promise is not a listening microphone
reference_surfaces:
  - docs/design/contracts/conversation-room-voice-capture.md — sibling contract on the neighbouring component; consulted for scope discipline only
  - device VOICE TRACE, build 2510, 13:57:23–13:57:48 — the witnessed failure this unit removes
shared_with_house: truthful state reporting — a surface does not report a capability it has not confirmed
distinct_to_room: microphone state is physical rather than descriptive; a wrong value here is a member speaking into silence with no way to tell
structural_rationale: >
  Nothing rendered, laid out, worded or gestured changes. No route, no copy, no
  control, no data path, no timing the member can perceive except recovery
  itself. The change is confined to the mic state machine: two paths that could
  enter ARMING without a timeout are now time-bounded, a restart latch is
  cleared in a finally, and foreground resume no longer refuses the one state
  that strands the microphone. Screenshots are not supplied because the defect
  is a state transition, not a rendering; its evidence is the device trace named
  above and the founder walk on build 2511.
---

# Native microphone lifecycle — Experience Contract (minimal)

**This contract exists to satisfy the design-canon gate and nothing more.** It
governs the native microphone lifecycle in
`components/voice/ContinuousConversation.tsx`, as four invariants (founder,
2026-08-17):

- UI must not report `LISTENING` without native confirmation.
- `ARMING` must have a bounded recovery path.
- Background/foreground interruption must not strand the mic.
- `restart_in_flight` must not remain latched indefinitely.

No broader Conversation Room experience is ruled here.

## What this contract does NOT define

The Conversation Room. Voice UX. MAIA's relational stance. Visual design.
Copy, gestures, composition, navigation, or any behaviour beyond the two
properties above. Those remain unauthored, and nothing here should be cited as
settling them.
