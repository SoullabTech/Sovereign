---
room: Astrology Pro — founder-only preview
human_activity: A professional astrologer working with one chart at a time in a dedicated workstation (natal chart, relationships, research and study), as a private founder-only preview that is disabled for everyone else.
surfaces:
  - app/astrology/pro-preview/**
change_class: experiential
principles:
  - INHABITABLE_ARCHITECTURE — a workstation for one chart and one professional's attention, not a member-facing feature
  - CONSTITUTIONAL_DIRECTION_OF_AUTHORITY — calculated chart facts stay distinct from interpretation; the astrologer remains the author
  - MAIA_OATH — no MAIA authority over the reading
  - MARKETING_CLAIM_DISCIPLINE — a preview is not a release; nothing here may be presented as available to members
reference_surfaces:
  - docs/design/contracts/astrology.md
  - docs/design/contracts/astrology-room-experience-architecture.md
shared_with_house: the same chart geometry and calculated facts as the Free Astrology room · human-language section names · provenance-aware labels
distinct_to_room: a dense professional instrument (chart studio, relationships, research and study work areas) rather than a member's reflective room. It exists only when the server runs the founder-only preview and the verified session is the founder's; for every other session the route serves no Pro content.
screenshot_desktop: docs/design/contracts/screenshots/astrology-pro-preview-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/astrology-pro-preview-mobile.png
experience_verification: 2026-10-30 automated witness on the same production build and fictional database. With the founder-only preview flags absent (production-like), /astrology/pro-preview served no Pro content to the would-be founder and /api/astrology/pro/my-chart returned 404; note the page returns HTTP 200 wrapping the not-found page (App Router notFound after streaming), not a true 404. With ASTRO_PRO_PREVIEW_ENABLED=true, ASTRO_PRO_ACCESS_PHASE=founder-only and the fictional founder's id, the founder saw Chart Studio on desktop and phone, labelled 'Professional workspace · Private preview', with 'MAIA Mentor · transfer held'; a non-founder member received no Pro content (again HTTP 200 around not-found). Zero MAIA or conversation requests and zero external requests. Not the founder's experiential acceptance.
---

# Astrology Pro — founder-only preview — Experience Contract

**Scope.** `app/astrology/pro-preview/**`, carried dark with the Free Astrology
reconciliation under founder decision D1 (2026-10-30: ship the founder-only Pro
preview with Free, behind the existing gate).

**This is not a release.** The preview is reachable only when all of the following
hold, and is otherwise absent:

- the server sets `ASTRO_PRO_PREVIEW_ENABLED=true` and `ASTRO_PRO_ACCESS_PHASE=founder-only`;
- `ASTRO_PRO_FOUNDER_MEMBER_ID` names one exact member;
- the verified session is that member's.

The production environment is expected to leave these unset. That must be confirmed
before any deploy (D1).

## What this room is for

The founder, working as a professional astrologer, testing a chart-first workstation
before anyone else can see it.

## Arrival

> **Soullab Celestial Observatory · Chart Studio** — *Private natal instrument · current sky · member-led inquiry*, labelled *Professional workspace · Private preview*.

## Gestures

| Gesture | Language used | Why this wording |
|---|---|---|
| Move between work areas | the area's name (Chart Studio, Relationships, Research, Study) | a professional's working vocabulary |
| Return to Astrology | "Return to Soullab Astrology" | the Free room stays the home |

## Known wart

The dark and non-founder responses carry HTTP 200 around the not-found page rather than a 404. No Pro content is served. The canonical proxy already returns a hard 404 for the approved-reading review pages for exactly this reason; extending that to this route is a separate change.

## Forbidden here

- any route by which a non-founder session receives Pro content
- presenting the preview as a member feature, tier or entitlement
- MAIA speaking as astrological authority
- sending chart material to MAIA

## The two brand tests

**Same house?** Yes: the same chart geometry and calculated facts as the Free room.

**Distinct room?** Yes: a professional instrument, not a reflective room, and unseen
by anyone but the founder.
