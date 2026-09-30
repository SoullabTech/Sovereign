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
  - app/house/page.tsx
  - app/writers-studio/layout.tsx
  - app/writers-studio/StudioHouseReturn.tsx
  - app/writers-studio/situatedWork.ts
  - app/dev/writers-studio-pc3-live/P4R1WorkArrival.tsx
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

## Access

The threshold is navigation only. It cannot grant Studio, practitioner, community, library, relationship, or other permissions.

## Amendment 1 — explicit Work identity (2026-09-30, founder ruling H1-1 / R3)

> **A House crossing may carry an explicit Work identity when the member has chosen to continue an existing act of creation. The carried identity is a pointer, not meaning. Destination surfaces remain responsible for interpretation and presentation.**

This strengthens the contract; it does not weaken it. The invariant is unchanged: *the House does not carry hidden meaning — it carries only explicit member-chosen continuity.*

**Allowed** — `/writers-studio?from=house&work=W`, and within the Studio `…&m=M&work=W`, where `W` is:
- an explicit Work identity the member pointed at;
- visible in the URL (never hidden state, never stored);
- validated on every load against the member's own Works and declarations — a Work the member does not hold confers nothing and discloses nothing;
- carrying **no** manuscript content, **no** interpretation, **no** memory retrieval, **no** inferred intention.

**Not allowed** — any identity accompanied by meaning: a summary of what the member was doing, an emotional thread to "continue", or MAIA preloading an interpretation. That is semantic carry and violates this threshold.

*Choice resolves context, not ontology:* entering M through W declares the context of this encounter only; it never declares that M belongs exclusively to W, and it rewrites no declaration.

**Arrival precedence at the destination (H1-3):** explicit carried Work → the Work's declared manuscripts → the member chooses where several exist → the destination's existing fallback. Recency never decides an arrival made through a governed crossing.

**Return (H1-2):** Writer's Studio renders the shared House threshold on `from=house`, which Studio mode changes preserve. Return is navigation only; it carries nothing back.

⚠️ **Experience verification for the Studio surfaces is owed** — no authenticated witness of the Studio threshold or the arrival panel has been taken yet.

## Reconciliation standing

The listed surfaces already existed in the frozen candidate. This contract records the experience they serve without modifying product source.