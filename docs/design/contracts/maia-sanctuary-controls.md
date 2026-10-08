---
room: MAIA Conversation — Sanctuary controls
human_activity: choosing privacy within a MAIA conversation while understanding that preserving material in Writer's Studio is a separate, server-governed act
surfaces:
  - components/QuickSettingsSheet.tsx
  - components/ui/SacredLabDrawer.tsx
  - components/OracleConversation.tsx
change_class: experiential
principles:
  - MAIA_OATH — member custody and truthful limits outrank persuasive privacy claims
  - INHABITABLE_ARCHITECTURE_STANDARD — the member sees meaningful consequences without reading infrastructure
  - CONSTITUTIONAL_DIRECTION_OF_AUTHORITY — local privacy intent never grants server storage authority
  - SOULLAB_THEME — a quiet status inside existing controls, not a competing dashboard
reference_surfaces:
  - docs/design/contracts/maia-room.md — the existing MAIA encounter and relational priority
  - docs/design/contracts/maia-conversation.md — one continuous MAIA voice
  - docs/design/contracts/voice-preferences-turn-taking.md — preferences are distinct from active turn authority
  - docs/programme/WRITERS_STUDIO_SANCTUARY_PERSISTENCE_PROTOCOL_2026-10-08.md — governed storage refusal
shared_with_house: the same Soullab voice, restrained privacy affordances, an explicit account of uncertainty, and no hidden automatic promotion of member material
distinct_to_room: MAIA's conversation may have its own Sanctuary choice; keeping manuscript sources remains a separate Writer's Studio act and cannot be unlocked by changing a conversation mode
screenshot_desktop: docs/programme/evidence/WS-SANCTUARY-BETA-LOCAL-20261008/quick-settings-desktop-selected.png
screenshot_mobile: docs/programme/evidence/WS-SANCTUARY-BETA-LOCAL-20261008/quick-settings-mobile-selected.png
experience_verification: >
  2026-10-08 isolated local beta fixture on the exact candidate, Chrome desktop 1440x900 and mobile 390x844. Using the already supported openLabDrawer event for test entry, the tester selected the newly reachable Quick Settings menu item. The actual panel displayed a local Sanctuary choice and a separate source-persistence status. Server GET returned 503; selecting Sanctuary sent POST 503 and a subsequent GET 503; source status remained unavailable, explicitly stating saving paused. Returning the local toggle to ordinary did not issue a POST to authorize it. Images reviewed; Next.js development error toast and the persistent Soullab footer appear in screenshots and are NOT erased. The MAIA conversation's full privacy substrate, successful source-saving flow, and physical human navigation to the Lab Tools drawer are NOT certified by this witness.
---

# MAIA Sanctuary — honest coordinated controls

## Arrival and gestures

Quick Settings is an entry in the existing Lab Tools shelf, not a separate privacy
room. A member can select Sanctuary as a conversation setting. The server's
source-persistence posture is read independently and displayed with the same
conservative rule as the upload endpoints: unknown means *unavailable*, not
ordinary. No UI toggle or mode command asserts that saving is authorized.

Conversation text and voice mode commands that change the local Sanctuary
selection now publish the same settings event used by Quick Settings, so MAIA's
existing encounter coordinator can ask the server to reaffirm Sanctuary. A
local **off** event is never an authorization to retain new material. Following
an entry notification the coordinator asks the panel to re-read server truth.

## Required distinctions

- **Conversation selection:** a member's currently selected MAIA mode; this UI
  does not certify every cognition or memory pipeline.
- **Source privacy status:** a read-only, server-reported session posture;
  `sanctuary`, `ordinary-unverified` and `unavailable` are distinct.
- **Persistence permission:** still **absent**. The upload and reviewed-text write
  endpoints remain HTTP 423. Neither local off nor a valid server ordinary
  posture can override that hold.

## Evidence boundaries

The screenshots show the actual Quick Settings bottom sheet after authenticated
fixture arrival at `/maia/encounter`. Its Lab Tools drawer was opened by the
existing `openLabDrawer` event in the local browser witness. A fully physical
member navigation to that shelf has not yet been recorded. The VoiceHUD component
is disabled in the active renderer and is not claimed as witnessed.

The status currently says “Materials saving paused” because this branch's server
write guards are deliberately hard-disabled; before any future reopening the
status must be governed alongside the new server authorization contract.

No new memories, manuscript wording, source attachments, production data, or
migration execution are authorized by this Experience Contract.
