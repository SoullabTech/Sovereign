---
room: Astrology
human_activity: Orienting through a calculated birth chart as a symbolic map, then choosing how deeply to explore its patterns without treating the chart as diagnosis, destiny, or authority over the member.
surfaces:
  - app/astrology/page.tsx
  - app/astrology/layout.tsx
  - components/astrology/BirthChartCalculator.tsx
  - components/astrology/CurrentTransitsField.tsx
change_class: experiential
principles:
  - INHABITABLE_ARCHITECTURE_STANDARD — Astrology is a room for inquiry through a chart, not a dashboard of placements
  - CONSTITUTIONAL_DIRECTION_OF_AUTHORITY — calculated chart facts may be stable; symbolic interpretation remains provisional; lived meaning belongs to the member
  - MAIA_OATH — MAIA may enter conversation through the chart but never tell the member what they are
  - SOULLAB READABILITY — chart facts, interpretation and actions remain readable without zoom
reference_surfaces:
  - docs/design/contracts/journal-room.md
  - docs/design/contracts/changes-living-room.md
  - docs/design/contracts/personal-decision-live-room.md
shared_with_house: warm architectural field, editorial serif hierarchy, restrained material surfaces, quiet MAIA presence, readable typography, and explicit return to House.
distinct_to_room: Astrology is organized around one member-owned birth chart and the relationship among its parts. The chart is encountered as a whole field before individual placements or interpretive lenses are opened.
screenshot_desktop: docs/design/contracts/screenshots/astrology-ux-02-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/astrology-ux-02-mobile.png
experience_verification: 2026-09-27 architecture instantiated through ASTROLOGY-UX-02 on isolated localhost:3701. A temporary authenticated member with server-owned birth data produced a real calculated natal chart. The new room rendered whole-chart orientation before isolated placements, preserved House Wheel/Planetary Positions/Major Aspects below, and retained member-identity safeguards. Temporary member/session were removed after witness.
---

# ASTROLOGY-UX-01 — Whole-Chart Room Experience Architecture

## Core thesis

Astrology should not make the member assemble meaning from a stack of isolated placements.

The room should perform the compositional work of holding the chart as a whole while preserving epistemic boundaries.

The member should feel:

> **I am looking at a symbolic map of one sky, not a list of traits being assigned to me.**

## Epistemic layers

Every substantial Astrology interpretation must keep these layers distinct:

1. **Calculated chart fact** — planet, sign, degree, house, aspect, angle, elemental count.
2. **Symbolic tradition** — what a sign, planet, house, aspect or system has traditionally been used to signify.
3. **Whole-chart synthesis** — how multiple chart factors may be read together rather than in isolation.
4. **Possible human expression** — ways that pattern might appear in a life.
5. **Present activation** — transits or timing factors calculated for a current period.
6. **Member meaning** — what the member recognizes, rejects, amends or leaves open.

No layer may silently impersonate another.

## Whole-chart law

No isolated placement should masquerade as a complete reading when materially relevant chart context is available.

Examples:

- Sun sign is not identity;
- Moon sign is not emotional diagnosis;
- Ascendant is not personality essence;
- one difficult aspect is not fate;
- one transit is not a prediction;
- elemental emphasis is not a character score.

The room may foreground a placement as an entry point, but it must keep the rest of the chart available as context.

## Arrival

The room should open with the chart as one object.

Primary orientation:

> **A symbolic map of your sky at birth.**

Boundary:

> **The chart does not tell you who you are. It gives us patterns to think with.**

The first visible layer should therefore be calculated facts and whole-chart orientation, not generated archetypal claims.

## Primary object

The visual center is the birth chart / wheel and a compact factual orientation around it:

- Sun;
- Moon;
- Ascendant;
- elemental emphasis;
- selected house system;
- zodiac system;
- birth data source.

These are orientation anchors, not a ranking of importance.

## Interpretation sequence

When the member enters a substantial interpretation, the room should move in this order:

### What the chart calculates

Exact factors.

### What the tradition associates with them

Symbolic language with its source/tradition named when useful.

### How these factors relate

Whole-chart synthesis.

### How this might be lived

Possible expression, explicitly provisional.

### What is active now

Only when current transits/timing are actually calculated.

### What do you recognize?

The member's own lived meaning.

## MAIA

MAIA should not merely explain the chart.

She should be able to enter a conversation **through the chart**.

The governing experience:

> **the chart remains visible while the conversation deepens**

MAIA may:

- point to an exact chart fact;
- name one possible relationship among chart factors;
- ask whether that pattern resembles anything in lived experience;
- compare symbolic traditions when relevant;
- help the member hold apparent contradictions.

MAIA may not:

- declare what the member is;
- diagnose from the chart;
- predict an inevitable future;
- treat chart symbolism as higher authority than lived experience;
- silently convert a placement into memory about the member.

## Visual character

Astrology belongs to the same House but should remain distinct.

Allowed language:

- celestial atlas;
- dark architectural field;
- parchment / vellum chart material;
- fine orbital lines;
- brass and muted blue accents;
- one coherent chart geometry;
- restrained astronomical notation;
- spacious reading surfaces.

Avoid:

- generic starfield wallpaper as the primary identity;
- neon cosmic dashboard;
- mystical stock imagery;
- a wall of equal-weight cards;
- emoji as primary wayfinding;
- tiny metadata used to make the screen feel sophisticated;
- 'cosmic destiny' visual clichés.

## Reading hierarchy

Astrology is information-dense, so readability law is especially strict.

- calculated facts: 14px minimum;
- ordinary explanatory copy/actions: 16px minimum;
- interpretation/member-facing prose: 17–18px minimum;
- section titles: 24–28px;
- room title: 28–32px minimum;
- decorative markers only: 12px.

## Systems and lenses

Tropical, Vedic/Sidereal, Chinese, Mayan, Synastry and house-system choices are lenses, not tabs competing for equal authority on arrival.

The member should first know:

> **Which chart am I looking at, and what kind of lens is this?**

Then they may choose another lens.

## Current sky

Transits belong to a distinct 'Now' layer.

Natal chart and current activation must not visually collapse into one unlabeled field.

A transit statement must distinguish:

- natal fact;
- current sky fact;
- symbolic interpretation;
- possible lived expression.

## Existing substrate preserved

ASTROLOGY-UX-01 changes no calculation substrate.

Preserve:

- authenticated member birth-data ownership;
- birth-data consent;
- tropical natal calculation;
- existing house systems;
- zodiac system routing;
- chart wheel;
- aspects;
- planetary positions;
- current transits;
- saved synastry;
- report generation;
- elemental calculations.

## Exact stop

ASTROLOGY-UX-01 is architecture only.

The first implementation act should be:

> **ASTROLOGY-UX-02 — HOUSE-ALIGNED ROOM SHELL + WHOLE-CHART ORIENTATION ONLY**

That act should replace the starfield/dashboard arrival with an inhabited Astrology room, make the chart itself primary, render the Big Three as calculated facts rather than identity claims, preserve all existing lower-detail capabilities, and stop before MAIA chart conversation or new interpretive generation.
## Present-moment field

Current transits belong near the Astrology threshold because they describe the moving sky now, not a fixed identity. The room keeps three layers distinct: current planetary positions are calculated sky facts; natal activations appear only when a transit-to-natal aspect has actually been calculated; symbolic or human meaning remains provisional and belongs to inquiry. The same compact field may appear in the House as orientation to the moment, but the House does not interpret those transits for the member.
