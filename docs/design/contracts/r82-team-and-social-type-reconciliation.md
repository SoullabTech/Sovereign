---
room: Team and social communication
human_activity: entering a chosen team message and reading bounded channel conversation
surfaces:
  - app/team/(shell)/dm/[dmId]/page.tsx
  - components/nostr/NostrChannels.tsx
change_class: structural
principles:
  - docs/canon/INHABITABLE_ARCHITECTURE_STANDARD.md — a room protects the specific human activity rather than turning into a data table.
  - docs/canon/SOULLAB_THEME.md — preserve readable gestures and House continuity.
  - docs/design/contracts/README.md — a genuinely structural change must preserve room character and state its limited rationale.
reference_surfaces:
  - docs/design/contracts/practitioner-messages-structural.md
  - docs/design/contracts/maia-conversation.md
shared_with_house: member-authorized conversation and transparent channel identity.
distinct_to_room: team DM and Nostr social channels have their own audience and sending rules.
structural_rationale: The message route now uses typed identity verification and Nostr item state gains its declared value type. No additional cross-member access, sending surface, token or layout is enabled.
---

# R82 Team and social communication — structural Experience Contract

## Authoritative scope

The exact surface filenames above are the ONLY paths admitted by this R82 compatibility contract. It does not license additional layout, consent, interpretation or navigation changes in those rooms. Existing room-specific Experience Contracts remain authoritative for experience design.

## Evidence and preservation

These changes belong solely to the 69-file typed shipping compatibility correction from the isolated, SHA-256-pinned R78 B1–B9 source. R82 keeps the original room composition and actions. The full tsconfig.ship.json check passed with 0 diagnostics, and the R81 real fictional Writer/browser workflow and owner/cross-member security tests remained green. The next real device canary still owes direct experience verification for all declared exhaustive-label variants.

## Forbidden promotion

Do not construe this TypeScript/route-state compatibility correction as founder approval of a redesigned room, new authorization, consent, or capability. The production build and actual member beta are still release-held.
