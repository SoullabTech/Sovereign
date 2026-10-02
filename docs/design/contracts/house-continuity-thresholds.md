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
shared_with_house: one restrained threshold grammar — Soullab mark (omitted where the destination already carries it), THE HOUSE, destination name, Return Home → (/home) — plus preservation of an explicit from=house return path.
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

**Experience verification (Studio surfaces) — 2026-09-30, authenticated witness on a disposable stack** (fresh Postgres 16 from the canonical baseline + all migrations, `next dev`, one member, data seeded through the app's own APIs): `scripts/witness/house-studio-h1-walk.cjs` → **63 passed · 0 failed**. Evidence: `screenshots/house-studio-circulation-01r1/walk/` (incl. `results.json`). ⛔ Not production; the founder's own walk on the real stack remains the record.

## Amendment 2 — layered vocabulary and the mark (2026-09-30, founder rulings H1-close-1/2)

**Layered, no canon reversal.** *Home* is the member-facing place — where the member arrives, orients and navigates; the route (`/home`), the navigation, and the return action (**Return Home →**). *The House* names the containing whole of Soullab in threshold and circulation language. A House threshold is a boundary of that whole, **not a place**: the member may leave Home through it without `house` becoming a crossing endpoint. The Platform Identity Canon (2026-09-28) stands unamended.

So every threshold reads **THE HOUSE · ‹ROOM› · Return Home →**.

**The mark is orientation's guest, not its subject.** Where the destination already visibly carries the Soullab mark (Writer's Studio's own shell), the threshold omits it (`destinationCarriesMark`); the destination declares that, the threshold never guesses. Every other room keeps the mark.

**Return is not undo.** The member is not backing out of a room; they move from one inhabited place back into Home: *Home → Work → Studio → Home*, never *Home → Studio → back*.

## Amendment 3 — threshold origin, not registry place (2026-09-30, founder)

> **The House is a threshold origin, not a place in the crossing registry. H1 may carry House provenance without widening the registry vocabulary. Any future proposal to make `house` a first-class crossing origin is a separate governed architectural act.**

`FACET_CROSSINGS` keeps its meaning — circulation between places. This membrane (`from=house`, the carried Work pointer, the shared threshold) is where House provenance lives.

## Reconciliation standing

The listed surfaces already existed in the frozen candidate. This contract records the experience they serve without modifying product source.