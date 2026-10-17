---
room: MAIA — New Conversation and encounter privacy arrival
human_activity: begin a separate encounter with an explicit remembrance choice while preserving earlier writing
surfaces:
  - app/maia/page.tsx
  - app/field/talk/page.tsx
  - components/OracleConversation.tsx
  - components/QuickSettingsSheet.tsx
  - components/ui/SacredLabDrawer.tsx
  - components/maia/presence/MaiaPresence.tsx
change_class: experiential
principles:
  - MAIA_OATH — member consent is a deliberate act, not a cached preference
  - INHABITABLE_ARCHITECTURE_STANDARD — New Conversation must create a new encounter, not just clear words
  - SOULLAB_THEME — readable hierarchy, warm materials, and single-gesture agency
  - RF01 S0-B — explicit remembrance authority before Send
reference_surfaces:
  - docs/design/contracts/maia-conversation.md — single conversation-first relationship
  - docs/design/contracts/quick-settings-privacy.md — read-only session privacy
  - components/maia/MaiaArrivalField.tsx — Arrival is a non-writing threshold
  - lib/maia/presence/conversationIdentity.ts — canonical browser session projection
shared_with_house: truthful plain-language promises and one authority per member gesture
distinct_to_room: a fresh MAIA relationship encounter, not a cache clear or duplicate session
screenshot_desktop: docs/design/contracts/screenshots/rf01-r1d-new-session-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/rf01-r1d-new-session-mobile.png
experience_verification: >
  2026-10-17 actual Next.js 16.3.8 /maia/encounter with desktop Chrome,
  desktop WebKit, and 390x844 WebKit mobile emulation, authenticated with a
  synthetic cookie in disposable PostgreSQL 16. Clicked Arrival's I'm ready,
  chose Sanctuary, verified visible held-Send refusal, draft preservation, and zero model requests,
  clicked actual Lab Tools > Conversation Settings > New Conversation, and
  witnessed an unused server-minted session ID, reset privacy, preserved
  fictional prior writing, and a failed New attempt preserving the current ID.
  Real server handlers and PostgreSQL were exercised; unrelated app APIs were
  mocked. No provider calls. Physical iPhone and live sign-in were not tested.
---

# MAIA — New Conversation and privacy arrival

A deliberate new encounter must not relabel a continuing conversation or
silently reuse its history. The server confirms a fresh session identity;
remembrance stays unresolved until the member actively chooses.

## Actual member path

1. Arrival is its own ceremony. Clicking **I'm ready** crosses without
   creating a message.
2. A centered privacy decision surface then offers **Sanctuary** and
   **Continuity**. The old cached setting is never an authority.
3. **Lab Tools → Conversation Settings → New Conversation** creates a
   genuinely separate, server-verified session. Previous writing stays intact.
4. A failed or unauthorized creation request preserves the current session.
5. All MAIA hosts observe the same validated new identity and remount with
   a new privacy decision. Sanctuary messaging remains on hold pending
   independently authorized private processing.

The first Arrival composer also preserves typed words as a draft when privacy
has not yet been chosen. It does not send that material in the background.

## Forbidden here

- A visually cleared conversation with an unchanged session ID.
- A profile preference or Quick Settings toggle presented as memory consent.
- Sending member words before verified privacy and processing permission.
- Rendering privacy controls beneath an inaccessible Arrival overlay.
- A false "saved" claim or deletion of earlier writing on New Conversation.
- Treating a synthetic DOM event as proof the actual member button works.

## Evidence limits

The attached screenshots are the actual Next.js MAIA encounter at the newly
unresolved privacy decision after successful New Conversation, not a design
mockup. They were captured before intentional failure feedback. The red
development toolbar is not a production member feature.

This does not certify production, physical mobile Safari, actual microphone,
native Desktop, or live Anthropic calls. All those remain held.

**Same House:** The controls state only what the server proved and use
existing Soullab presentation grammar.

**Distinct room:** Arrival, remembrance and expression remain consciously
separate gestures particular to MAIA.
