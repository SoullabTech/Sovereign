---
room: Settings — Voice Preferences
human_activity: choosing how much conversational space MAIA leaves while I speak, and whether I or MAIA decides when my turn is complete
surfaces:
  - components/settings/VoiceSettingsPanel.tsx
change_class: experiential
principles:
  - INHABITABLE_ARCHITECTURE — settings name human consequences rather than implementation details
  - MAIA_OATH — member agency outranks inference when the member chooses explicit floor control
  - SOULLAB_THEME — preference choices remain quiet, legible, and consistent with the House
reference_surfaces:
  - docs/design/contracts/settings.md — Settings remains operational and truthful
  - docs/design/contracts/conversation-turn-taking.md — the live conversational expression of these preferences
  - docs/programme/VOICE-2026/TURN-01_CONVERSATIONAL_SOVEREIGNTY_IMPLEMENTATION_2026-09-16.md
shared_with_house: restrained controls, plain-language consequences, persisted member preference, and truthful capability boundaries
distinct_to_room: Settings is where the member chooses the prior; it does not simulate a conversation or predict what their pauses mean
screenshot_desktop: docs/design/contracts/screenshots/voice-preferences-turn-taking-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/voice-preferences-turn-taking-mobile.png
experience_verification: >
  2026-09-16 local evidence walk mounting the exact VoiceSettingsPanel from this branch with a deterministic settings response only inside the temporary evidence page. Desktop and mobile renders showed all four Conversational Space choices (Responsive, Natural, Spacious, Contemplative), Learn my natural rhythm, and both floor-control choices including I’m Done. The component screenshot measured 728px wide on desktop and 350px inside a 390px mobile viewport. The API interception was confined to the temporary evidence page, which was then restored byte-for-byte.
---

# Voice Preferences — Turn Taking

These controls let a member choose a starting conversational posture without asking them to understand VAD, endpointing, or speech-recognition internals.

**Conversational Space** offers Responsive, Natural, Spacious, and Contemplative. **Learn my natural rhythm** may make MAIA more patient inside the selected band; it never makes her more aggressive than the selected preference. **I’m Done** gives the member explicit control of turn completion so silence has no authority to hand the floor to MAIA.
