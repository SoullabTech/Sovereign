---
room: Astrology — Whole-Chart Orientation
human_activity: Entering one's calculated birth chart as a whole symbolic map before opening individual placements, interpretive lenses or current activations.
surfaces:
  - app/astrology/page.tsx
  - app/astrology/astrology-room.module.css
change_class: experiential
principles:
  - ASTROLOGY-UX-01 — calculated facts, symbolic tradition, synthesis, possible expression, activation and member meaning remain distinct
  - INHABITABLE_ARCHITECTURE_STANDARD — Astrology is a room for inquiry through one chart, not a dashboard of trait cards
  - CONSTITUTIONAL_DIRECTION_OF_AUTHORITY — the chart can be exact without becoming authority over the member
  - SOULLAB READABILITY — chart facts and detail controls remain legible without browser zoom
reference_surfaces:
  - docs/design/contracts/astrology-room-experience-architecture.md
  - docs/design/contracts/journal-room.md
  - docs/design/contracts/personal-decision-live-room.md
shared_with_house: House architectural field, editorial serif hierarchy, warm material surface, explicit return, restrained brass, readable typography, and quiet epistemic boundaries.
distinct_to_room: Astrology centers calculated natal coordinates and the relationship among them. The Big Three are presented as chart facts inside a whole-chart field, not as personality declarations.
screenshot_desktop: docs/design/contracts/screenshots/astrology-ux-02-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/astrology-ux-02-mobile.png
experience_verification: 2026-09-27 authenticated local witness on isolated localhost:3701 using a temporary member with server-owned birth date, time, location and astrology consent. The page calculated the natal chart through the existing birth-chart route and rendered the new House-aligned Astrology room. The old Your Cosmic Blueprint and Your Archetypal Profile arrival blocks were absent. Three primary factual orientation objects were present for Sun, Moon and Ascendant. Existing House Wheel, Planetary Positions and Major Aspects remained available below. Detail-area text-xs computed to 14px and text-sm to 16px after the room readability overrides. Desktop and mobile captures passed. Temporary session/member were deleted after the witness.
---

# ASTROLOGY-UX-02 — House-Aligned Room Shell + Whole-Chart Orientation

## Purpose

Replace the existing starfield/dashboard arrival without changing the natal calculation substrate.

The first screen now asks the member to encounter one chart rather than a wall of archetypal claims.

## Arrival

The room opens with:

> **A symbolic map of your sky at birth.**

and the boundary:

> **The chart is a lens.**

> Facts can be calculated. Interpretation remains provisional. Lived meaning belongs to you.

This is the epistemic stance for the entire room.

## Material field

The generic navy starfield and decorative distant-moon glows are removed from the canonical Astrology arrival.

Astrology now shares the House architectural field while retaining a distinct celestial-atlas register through:

- cool blue counterpoint;
- brass / parchment chart material;
- fine rules;
- calculated notation;
- restrained orbital/field suggestion rather than literal space wallpaper.

## Whole-chart orientation

The first stable object is a warm atlas surface labelled:

> **Calculated chart facts**

It contains three familiar entry points:

- Sun — sign, exact degree, house;
- Moon — sign, exact degree, house;
- Ascendant — sign and exact degree.

These are deliberately stripped of the former identity claims:

- Core Identity;
- Emotional Truth;
- Life Portal;
- archetypal persona names presented as if factual.

Each placement remains explorable through its existing exact placement route.

## Elemental emphasis

The room shows the existing calculated elemental distribution as percentages.

It explicitly states:

> **Derived from the chart’s inner planets; not a personality score.**

No new interpretation is generated.

## Lens identity

The current lens is named separately from the chart itself.

Initial orientation:

> Tropical · Porphyry

Existing zodiac-system routing and house-system behavior remain available.

The member is told:

> Change the lens when the question changes. The underlying birth chart remains the same member-owned source.

## Existing depth preserved

UX-02 does not delete or replace the existing deeper Astrology capabilities.

The witness confirmed that these remain present:

- House Wheel;
- Planetary Positions;
- Major Aspects;
- nodes;
- transits;
- elemental/pathway material;
- other astrology systems;
- synastry;
- full report.

Those lower surfaces have not yet earned final experiential acceptance. UX-02 only removes the old arrival's authority and creates a coherent place from which to enter them.

## Readability

The legacy detail surface contains many `text-xs`, `text-sm` and 10px utility classes.

Inside the Astrology detail field, UX-02 raises them to the House floors:

- former `text-xs` meaningful detail: **14px**;
- former `text-sm` body/detail: **16px**;
- former 10px detail copy: **14px**.

Actions are not permitted to become micro-sized.

Purely decorative markers in the new room remain 12px.

## Birth-data states

The member-identity security boundary remains intact.

### Authenticated member with birth data

Render the chart.

### Authenticated member without birth data

Invite birth-data entry inside Astrology.

### Signed out

Ask the person to sign in.

### Server identity unavailable

Do not render a cached chart; offer retry.

UX-02 restyles these states but does not weaken their authority contract.

## Explicitly unchanged

UX-02 changes no:

- birth-data ownership;
- birth-data consent;
- chart calculation;
- aspect calculation;
- house-system calculation;
- zodiac system routing;
- transit calculation;
- synastry persistence;
- report generation;
- MAIA prompt behavior;
- memory behavior.

## Exact stop

> **ASTROLOGY-UX-02 — WHOLE-CHART ORIENTATION ROOM CANDIDATE · CALCULATION SUBSTRATE UNCHANGED · FOUNDER VISUAL WITNESS NEXT**

If accepted, the next clean act is:

> **ASTROLOGY-UX-03 — WHOLE-CHART INTERPRETIVE COMPOSITION + EPISTEMIC LAYERING ONLY**

That act should reorganize existing interpretation so calculated fact, symbolic tradition, chart synthesis, possible lived expression and present activation are visibly distinct, without yet opening MAIA conversation through the chart.