---
room: MAIA Quick Settings — encounter privacy projection
human_activity: checking the privacy choice already established for this encounter while adjusting voice and presentation settings
surfaces:
  - components/QuickSettingsSheet.tsx
change_class: experiential
principles:
  - MAIA_OATH — do not represent a cached client preference as an authenticated member decision
  - INHABITABLE_ARCHITECTURE_STANDARD — controls must act truthfully; do not offer an ineffective privacy toggle
  - SOULLAB_THEME — retain House-level hierarchy, typography, and material vocabulary
  - RF01 S0-B held design — per-turn remembrance authority is established before Send; provider processing requires separate qualification
reference_surfaces:
  - docs/design/contracts/settings.md — a visible control must correspond to an available capability
  - docs/design/contracts/memory-consent.md — retention and recall are separate member permissions
  - components/OracleConversation.tsx — the explicit per-session Sanctuary/Continuity choice and verified pre-Send receipt
  - lib/sanctuary/explicitTurnConsent.ts — authenticated preflight authority, distinct from local session display
shared_with_house: the truthful Soullab status language, explicit agency without pressure toward memory, and one authority per member choice
distinct_to_room: Quick Settings adjusts local voice and interaction preferences, but merely reflects the current encounter's authenticated remembrance choice; it cannot originate or override that choice
screenshot_desktop: docs/design/contracts/screenshots/quick-settings-privacy-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/quick-settings-privacy-mobile.png
experience_verification: >
  October 16 2026 local isolated browser witness of the real
  components/QuickSettingsSheet.tsx bundled from the held RF01 source, with
  ancillary app services replaced by inert fixture stubs. Desktop viewport
  1280x800 displayed 'Sanctuary chosen'; mobile viewport 390x844 displayed
  'Continuity chosen'. Both rendered the truthful read-only status, explanatory
  provider-processing boundary, normal voice controls, and no interactive old
  'Sanctuary Session' button. Chrome/Playwright reported zero script errors and
  zero external requests. Screenshots on disk were visually inspected. This
  does NOT certify the full production application, mounted MAIA Send, phone
  WebKit, Electron device capture, or actual provider non-use; those release
  witnesses remain on hold.
---

# MAIA Quick Settings — truthful privacy projection

Quick Settings is not a second place for inventing account or conversation
consent. It remains useful for voice, pace, display and local controls, but its
privacy area states which per-encounter decision MAIA currently holds.

## Member experience

The top privacy panel says either **Sanctuary chosen**, **Continuity chosen**,
or **Privacy choice required**. It makes no promise to change anything by
tapping that panel. The old localStorage toggle was removed, because a switch
that could appear to disable protection without authenticated consent is an
unsafe affordance.

A new encounter's privacy choice belongs at the conversation's explicit
arrival/Send boundary, never in cached Quick Settings or a voice/style command.
The panel separately names that remembrance does not authorize external model
or speech processing.

## Evidence and limits

The screenshots were captured directly from the modified React component
through a local non-network fixture. Desktop and narrow-screen states, wording,
and the removal of a dead privacy toggle were verified. This is a visual
component witness, not a whole-application browser or physical-device witness.
No member credentials or content were used.

## Forbidden here

- a cached default presented as affirmative authorization to remember
- a local switch that appears to grant or withdraw authenticated privacy
- silently enabling Continuity on account sign-in or Talk/Care/Scribe change
- claiming cloud processing is safe simply because ordinary storage is blocked
- reporting a save to the account before a server-confirmed receipt

## Two brand tests

**Same House?** Yes. The status distinguishes what MAIA knows from what it
has not verified, uses Soullab's shared presentation grammar, and leaves the
member with plain language rather than back-end jargon.

**Distinct room?** Yes. Quick Settings is an operational adjustment surface,
not a second Consent Room. It may reflect privacy but cannot author it.
