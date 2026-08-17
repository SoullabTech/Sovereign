---
# Exists ONLY to satisfy the design-canon gate for one diagnostic component.
# Governs whether an instrument is VISIBLE. Defines nothing about voice or
# the Conversation Room.
room: Conversation
human_activity: using MAIA without a diagnostic instrument in the way
surfaces:
  - components/voice/VoiceDebugOverlay.tsx
change_class: structural
principles:
  - MAIA_SOVEREIGNTY_INVARIANTS — observable on intent, invisible by default
reference_surfaces:
  - docs/design/contracts/conversation-room-mic-lifecycle.md — sibling narrow contract; consulted for scope discipline only
  - device screenshot, build 2510 — the VOICE TRACE panel covering MAIA's words and the Keep/Copy row
shared_with_house: diagnostics are not ambient chrome; they appear on intent
distinct_to_room: nothing — this contract asserts no property particular to this room
structural_rationale: >
  The panel's own rendering is unchanged. The only change is WHEN it mounts: it
  enabled itself on every native build, so every TestFlight member received a
  diagnostic board they never asked for, sitting over the conversation. It is
  now off unless explicitly opted in on the device. No voice code path, timing,
  state or behaviour is touched.
---

# Voice diagnostic visibility — Experience Contract (microscopic)

- Diagnostic instrumentation is **OFF by default** in member/native use.
- It may appear **only after explicit local opt-in**.
- Diagnostic visibility **must not alter voice behavior**.
- This contract governs **`VoiceDebugOverlay` only**.
- It **does not define the Conversation Room experience**.

Opt-in, for whoever is debugging:

```
localStorage.setItem('maia_voice_trace', '1')   → on, next launch
localStorage.removeItem('maia_voice_trace')     → off
```
