---
room: Conversation — Turn Taking
human_activity: speaking with MAIA at one's own pace, including pausing to think without losing the floor
surfaces:
  - components/voice/VoiceInteractionBar.tsx
change_class: experiential
principles:
  - INHABITABLE_ARCHITECTURE — controls serve the member's present activity rather than expose system machinery
  - MAIA_OATH — MAIA accompanies rather than seizes authority; silence is not consent to take the floor
  - SOULLAB_THEME — one restrained accent marks the primary gesture without turning conversation into a control panel
reference_surfaces:
  - docs/design/contracts/conversation-room-mic-lifecycle.md — physical microphone truth remains separate from social turn ownership
  - docs/design/contracts/conversation-room-voice-capture.md — neighboring capture boundary; member speech remains the member's content
  - docs/programme/VOICE-2026/TURN-01_CONVERSATIONAL_SOVEREIGNTY_IMPLEMENTATION_2026-09-16.md
shared_with_house: the House's quiet field, human-language gestures, truthful state, and the rule that the member remains the subject
distinct_to_room: this is the conversational floor itself; while the member owns it, the bar says so and offers one explicit yield gesture rather than inferring consent from silence
screenshot_desktop: docs/design/contracts/screenshots/conversation-turn-taking-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/conversation-turn-taking-mobile.png
experience_verification: >
  2026-09-16 TURN-01 local evidence walk using the exact VoiceInteractionBar and VoiceSettingsPanel from this branch on an existing public evidence route that was restored byte-for-byte after capture. Desktop 1280x900 and mobile 390x844 both returned HTTP 200. The rendered state contained Conversational Space, Spacious, Learn my natural rhythm, holding your floor, and I’m Done together. Mobile document scrollWidth equaled 390 with no horizontal spill. The temporary route changed no access rule and was removed after capture; the persisted screenshots are the evidence.
---

# Conversation — Turn Taking

The member's pause is part of their speech until they yield the floor. TURN-01 makes that visible: automatic mode may use the selected Conversational Space, while explicit mode shows **holding your floor** and waits for **I’m Done**.

## Gestures

| Gesture | Language | Meaning |
| --- | --- | --- |
| explicit yield | I’m Done | commit the accumulated member turn and allow MAIA to respond |
| leave voice | stop | end listening; distinct from yielding a completed thought |

## Forbidden here

- silence presented as consent when explicit floor ownership is active
- an engine restart masquerading as a conversational yield
- duplicate send paths bypassing the canonical transcript commit boundary
