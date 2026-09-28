---
room: MAIA
human_activity: entering direct relationship with MAIA while remaining oriented inside the larger Soullab platform

surfaces:
  - app/maia/page.tsx
  - app/maia/encounter/page.tsx
  - components/maia/MaiaShell.tsx

change_class: experiential

principles:
  - SOULLAB_PLATFORM_IDENTITY_CANON_2026-09-28 — Soullab is the platform; Home is the canonical return; MAIA is a destination
  - INHABITABLE_ARCHITECTURE_STANDARD — the member knows where they are and how to leave without encountering competing platform maps
  - SOULLAB_THEME — preserve quiet field hierarchy and relationship-first presentation

reference_surfaces:
  - app/home/page.tsx
  - app/house/page.tsx
  - components/maia/MaiaCenterField.tsx

shared_with_house: Soullab identity, deep field atmosphere, quiet orientation, and a single clear return to Home
distinct_to_room: MAIA is a direct relational encounter; the conversation remains primary and the wider platform is not reproduced as a second navigation house inside the room

screenshot_desktop: docs/design/contracts/screenshots/maia-room-home-return-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/maia-room-home-return-mobile.png
experience_verification: Presentation fixture witness at desktop 1440x960 and mobile 390x844 verified that the MAIA encounter carries a single Home return, keeps MAIA centered as the destination, and does not render the old House sheet. Separate live local browser witnesses at docs/design/contracts/screenshots/maia-legacy-threshold-desktop.png and maia-legacy-threshold-mobile.png verified bare /maia now renders the compatibility threshold with Go to Soullab → /home. Runtime route assertions verify /maia/encounter hosts the canonical MAIA conversation and remains member-gated.
---

# MAIA — Experience Contract

## What this room is for

`/maia/encounter` is the place for direct encounter with Soullab's relational intelligence. Bare `/maia` is only a compatibility threshold that returns old bookmarks and direct visitors to Soullab. MAIA does not own the platform map; the member may remain in conversation or return to Home to reorient across the larger field.

## Arrival

> **MAIA**

The room should feel like entering a relationship, not opening another dashboard or mini operating system.

## Gestures

| Gesture | Language used | Why this wording |
|---|---|---|
| Platform return | Home | Home is canonical Soullab orientation, not an old House submenu |
| Direct encounter | MAIA | Names the destination the member intentionally entered |
| Input | Speak or type | Keeps relationship and modality primary rather than product controls |

## Forbidden here

- treating /maia as the platform homepage
- mounting the old House sheet as a competing platform navigation system
- labeling the platform return "Return to House"
- redirecting /maia to /home merely because Home is canonical
- removing useful MAIA runtime substrate just to achieve naming cleanliness

## The two brand tests

**Same house?** Yes. MAIA remains unmistakably within Soullab through field atmosphere, typography, restraint, and the canonical Home return.

**Distinct room?** Yes. The center is the relationship with MAIA; Home and the other facets remain elsewhere.
