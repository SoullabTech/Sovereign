---
room: House Continuity Thresholds
human_activity: entering a room from the House and returning to the House without losing the destination's own identity or changing its access rules.
surfaces:
  - app/commons/page.tsx
  - app/library/page.tsx
  - app/maia/ideas/page.tsx
  - app/maia/living-field/page.tsx
  - app/relationships/page.tsx
  - app/wisdom-keepers/sacred-texts/page.tsx
  - app/wisdom-keepers/wisdom/page.tsx
  - app/writers-studio/layout.tsx
  - components/house/HouseEntryThreshold.tsx
  - components/house/HouseRoomThreshold.tsx
  - components/team/TeamSidebar.tsx
change_class: experiential
principles:
  - SOULLAB_LIVING_ORIENTATION_SYSTEM — movement between rooms is part of the experience and return remains visible
  - INHABITABLE_ARCHITECTURE_STANDARD — entering from the House may add orientation but may not redesign or subsume the destination room
  - MAIA_OATH — navigation never implies semantic carry, hidden context transfer, or system authorship
  - SOULLAB_READABILITY_STANDARD — return and room identity are meaningful orientation, not microcopy
reference_surfaces:
  - docs/design/contracts/house-room.md
  - docs/design/contracts/house-return.md
  - docs/design/contracts/facet-crossings.md
  - docs/canon/SOULLAB_LIVING_ORIENTATION_SYSTEM.md
shared_with_house: one restrained threshold grammar — Soullab mark, HOME orientation, destination name, Return Home — plus preservation of an explicit from=house return path.
distinct_to_room: this contract governs only the entry/return membrane inside the listed files. Commons, Library, Ideas, Living Field, Relationships, Wisdom, Writer's Studio and Team remain their own rooms/products; the threshold neither grants access nor changes their inner meaning.
screenshot_desktop: docs/design/contracts/screenshots/canonical-house-threshold-library-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/canonical-house-threshold-library-mobile.png
experience_verification: 2026-09-27 authenticated reconciliation witness on isolated localhost:3705. Library was entered with ?from=house at desktop and mobile and rendered the shared House room threshold while retaining its own Wisdom Files experience. Source review confirmed the same explicit from=house membrane in Commons, Ideas, Living Field, Relationships and Wisdom, while TeamSidebar exposes a direct House return. H1-R3, 2026-09-30, adds Writer's Studio outer-layout coverage: an authenticated Chromium walk entered Writer's Studio from House, rendered the shared threshold with canonical /home return, returned successfully to /home, and confirmed direct /writers-studio entry without from=house exposes no threshold. This extension changes no destination identity or access.
---

# House Continuity Thresholds

## Law

> **The House may frame the doorway. It does not become the room.**

The member must be able to tell where they are, that they arrived from the House when that context matters, how to return, and that no semantic object crossed merely because navigation occurred.

## Entry

HouseEntryThreshold renders only when the route explicitly carries from=house.

## Return

HouseRoomThreshold names the destination and returns to canonical /home.
It does not replace a room's own navigation when that room was entered
elsewhere. The legacy /house route is not the canonical return target.

## Propagation

Where a room contains deeper child routes, from=house may be preserved only so return orientation survives. It must not become hidden content context.

## Access

The threshold is navigation only. It cannot grant Studio, practitioner, community, library, relationship, or other permissions.

## Reconciliation standing

The listed surfaces are the current threshold surfaces. H1-R3 adds
`app/writers-studio/layout.tsx` because Writer's Studio now consumes the
canonical threshold at its outer boundary. The product source reuses the
existing threshold components; no parallel return mechanism is introduced.