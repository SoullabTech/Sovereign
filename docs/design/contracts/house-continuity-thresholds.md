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
shared_with_house: one restrained threshold grammar — Soullab mark, THE HOUSE, destination name, Return to House — plus preservation of an explicit from=house return path.
distinct_to_room: this contract governs only the entry/return membrane inside the listed files. Commons, Library, Ideas, Living Field, Relationships, Wisdom and Team remain their own rooms/products; the threshold neither grants access nor changes their inner meaning.
screenshot_desktop: docs/design/contracts/screenshots/canonical-house-threshold-library-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/canonical-house-threshold-library-mobile.png
experience_verification: 2026-09-27 authenticated reconciliation witness on isolated localhost:3705. Library was entered with ?from=house at desktop and mobile and rendered the shared House room threshold while retaining its own Wisdom Files experience. Source review confirmed the same explicit from=house membrane in Commons, Ideas, Living Field, Relationships and Wisdom, while TeamSidebar exposes a direct House return. This contract closes historical coverage only; no destination UI source changed during CANONICAL-RECONCILIATION-01.
---

# House Continuity Thresholds

## Law

> **The House may frame the doorway. It does not become the room.**

The member must be able to tell where they are, that they arrived from the House when that context matters, how to return, and that no semantic object crossed merely because navigation occurred.

## Entry

HouseEntryThreshold renders only when the route explicitly carries from=house.

## Return

HouseRoomThreshold names the destination and returns to /house. It does not replace a room's own navigation when that room was entered elsewhere.

## Propagation

Where a room contains deeper child routes, from=house may be preserved only so return orientation survives. It must not become hidden content context.

## Explicit continuity exception

The default law remains: navigation alone does not carry semantic content.

A separately governed continuity threshold may carry an explicitly chosen object identity when the member has acted on that specific object. The destination must validate that identity against the authenticated member and resolve its own local children, ambiguity, and permissions.

`HOUSE-CABIN-CONTEXT-SPINE-01` is the first such governed exception for House → Writer’s Studio: a member explicitly chooses a Work in House, so the Work identity may travel. The House still does not choose a manuscript, and the Studio remains authoritative for manuscript resolution.

This exception does not authorize generic semantic carry, hidden memory transfer, or system-authored interpretation across House doors.

## Access

The threshold is navigation only. It cannot grant Studio, practitioner, community, library, relationship, or other permissions.

## Reconciliation standing

The listed surfaces already existed in the frozen candidate. This contract records the experience they serve without modifying product source.