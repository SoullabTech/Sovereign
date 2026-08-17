---
room: Conversation
human_activity: speaking with MAIA — and being able to speak again after looking away
surfaces:
  - components/voice/ContinuousConversation.tsx
change_class: structural
principles:
  - MAIA_OATH — the system does not claim a capacity it does not have; a resolved promise is not a listening microphone
  - INHABITABLE_ARCHITECTURE — every visible element must serve the person's current moment; a mic control that cannot act is not serving it
  - MAIA_SOVEREIGNTY_INVARIANTS — agency first; a member who leaves a room must be able to return and speak
reference_surfaces:
  - docs/design/contracts/conversation-room-voice-capture.md — the sibling contract for WhisperContinuousConversation.tsx; consulted for shape and scope discipline
  - docs/design/contracts/settings.md — the narrow single-principle precedent
  - device VOICE TRACE, build 2510, 13:57:23–13:57:48 — the witnessed failure this unit removes
shared_with_house: the House's provenance voice — a surface reports what is true about itself. The System panel says UNCONFIGURED rather than UNKNOWN; this room must not say LISTENING when the microphone never armed.
distinct_to_room: this room's state is physical. Elsewhere a wrong state is a wrong label; here it is a microphone that does or does not hear the member, and the member has no way to tell which except by speaking into silence.
structural_rationale: >
  Nothing rendered, laid out, worded or gestured changes. No route, no copy, no
  control, no data path. The change is confined to the mic state machine's
  recovery behaviour: two paths that could enter ARMING without a timeout are
  now both time-bounded, a latch is cleared in a finally, and the
  foreground-resume handler no longer refuses the one state that strands the
  microphone.
  It is filed as structural rather than experiential because there is no design
  decision inside it — but the member-visible consequence is stated plainly
  rather than minimised: before, voice died for the rest of the session after
  leaving MAIA or taking a screenshot, recoverable only by restarting the app.
  Screenshots are not supplied because the defect is a state transition, not a
  rendering; the evidence that belongs to it is the device trace named above and
  the founder walk on build 2511.
---

# Conversation (microphone lifecycle) — Experience Contract

**Scope, stated plainly.** This contract governs **one component**,
`components/voice/ContinuousConversation.tsx`, and **one principle**. It is not a
room contract for `/maia`, and it does not redesign the Conversation room's
composition, copy, or visual language. Authoring the room's own experiential
contract remains unauthored work — as its sibling contract also records.

## The principle this binds

**A voice state the member cannot leave is a defect, whatever caused it.**

Every state the microphone can enter must be able to leave it without the member
restarting the app. Concretely:

- any transition into `ARMING` is time-bounded;
- any latch that blocks a restart is cleared on every path, not only the
  successful one;
- returning to the foreground recovers a stale state rather than refusing it.

**And the state must be true.** A microphone that has not confirmed it is
listening is not reported as listening. When confirmation is missing, the honest
answer is to recover to idle and let the member try again — never to display a
live microphone on the strength of a call that merely returned.

## Why it exists

On build 2510, leaving MAIA for the House — or taking a screenshot of the field —
backgrounded the app mid-arm. The native start-confirmation never arrived, the
state sat in `ARMING`, and every later tap was refused by the authority guard.
Voice was dead for the remainder of the session.

## Forbidden here

- entering `ARMING` without a bounded exit
- a restart latch cleared only on success
- reporting `LISTENING` from anything other than a real start confirmation
- a recovery handler that returns early on the state it exists to recover
