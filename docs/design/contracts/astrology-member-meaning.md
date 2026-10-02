---
room: Astrology — Member Meaning
human_activity: Authoring what the member recognizes from chart inquiry in their own words and optionally keeping those exact words as a Reflection with Astrology provenance.
surfaces:
  - app/astrology/page.tsx
  - app/astrology/astrology-room.module.css
  - app/api/astrology/reflection/route.ts
  - lib/capsules/types.ts
  - lib/house/facetCrossing.server.ts
  - lib/house/livingOrientation.ts
  - app/api/house/crossings/route.ts
  - components/house/FacetOriginTrail.tsx
  - components/reflections/ReflectionsFeed.tsx
change_class: experiential
principles:
  - ASTROLOGY-UX-01 — member meaning is distinct from chart fact and symbolic interpretation
  - ASTROLOGY-UX-04 — MAIA can reflect through the chart without owning its meaning
  - KEEP AUTHORITY CONTRACT — persistence occurs only after the member explicitly chooses Keep
  - CONSTITUTIONAL_DIRECTION_OF_AUTHORITY — neither chart nor MAIA prose can silently become member-authored meaning
reference_surfaces:
  - docs/design/contracts/astrology-room-experience-architecture.md
  - docs/design/contracts/astrology-maia-encounter.md
  - docs/design/contracts/reflections-room.md
  - docs/design/contracts/facet-crossings.md
shared_with_house: member-authored words, explicit Keep, exact provenance, return-to-source identity, no automatic interpretation, and no ambient memory promotion.
distinct_to_room: Astrology lets the member ratify what becomes meaningful only after chart inquiry. The resulting Reflection contains the member's exact recognition while Astrology remains provenance rather than content copied into the Reflection.
screenshot_desktop: docs/design/contracts/screenshots/astrology-ux-05-kept-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/astrology-ux-05-mobile.png
experience_verification: 2026-09-27 authenticated local witness on isolated localhost:3701 using a temporary member with a real calculated natal chart. Before the member wrote or pressed Keep, there were zero Astrology Reflection capsules, zero Astrology facet crossings, and zero MAIA conversation POSTs. The member authored one recognition and pressed Keep this as a Reflection. The route returned HTTP 201 and persisted one reflection_capsule with source_type=astrology, source_id=natal:tropical:porphyry, exact member-authored summary, empty gold_lines, null source_excerpt, and no copied MAIA/chart prose. Exactly one astrology-keep-as-reflection crossing linked Astrology to the new Reflection. Opening the Reflection rendered the exact member words plus WHERE THIS BEGAN / Astrology provenance and a Return to source link back to /astrology. member_memory_atoms delta remained zero. Temporary crossing, capsule, session and member were explicitly deleted; residue zero.
---

# ASTROLOGY-UX-05 — Member-Ratified Chart Meaning + Optional Keep to Reflections

## Purpose

Close the epistemic loop of Astrology without allowing either symbolic interpretation or MAIA language to become the member's meaning by default.

The sequence is:

> chart fact
> → symbolic interpretation
> → dialogue if wanted
> → **What do you recognize here?**
> → member-authored words
> → optional **Keep this as a Reflection**

## The member meaning field

The room now contains a separate authorship surface:

> **YOUR MEANING**

> **What do you recognize here?**

The invitation explicitly includes disagreement and uncertainty:

> Write what you recognize — including what does not fit, what remains uncertain, or what becomes clearer in your own words.

The text area is blank.

It is not prefilled by:

- chart interpretation;
- MAIA response;
- report prose;
- aspect synthesis;
- node interpretation;
- Steinbrecher material;
- current-sky data.

## Nothing is kept on open

Opening Astrology, reading the chart, opening MAIA, or typing into the recognition field does not create a Reflection.

Persistence is authorized only by:

> **Keep this as a Reflection**

The UI says plainly:

> Nothing from the chart or conversation is saved as your meaning automatically.

## Reflection content

The resulting Reflection stores:

- title deterministically excerpted from the member's own words;
- summary = exact member-authored recognition;
- source type = `astrology`;
- source identity = current natal chart lens;
- signals = Astrology / member-recognition;
- tags = member-kept / astrology / chart-recognition.

It stores no:

- MAIA response;
- generated chart interpretation;
- chart JSON;
- birth date;
- birth time;
- birth location;
- selected aspect prose;
- generated Gold Line.

`gold_lines` is intentionally empty.

`source_excerpt` is intentionally null.

The member's meaning is the Reflection; Astrology is provenance.

## Dedicated Keep route

New governed endpoint:

`POST /api/astrology/reflection`

It accepts only:

- member-authored `text`;
- current zodiac lens;
- current house-system lens;
- optional ayanamsa when sidereal.

The member identity comes from the authenticated session.

The route verifies that the authenticated member has birth data before allowing Astrology provenance.

## Astrology source identity

The crossing source is an opaque, non-birth-data identifier such as:

`natal:tropical:porphyry`

For sidereal lenses it may include the ayanamsa label.

This source identity contains no date, time, coordinates, location name, or chart placements.

## Astrology → Reflections crossing

Canonical gesture:

> **astrology-keep-as-reflection**

Registry contract:

- from: Astrology;
- to: Reflections;
- mode: persistence;
- authority: member explicit;
- carries: member-authored recognition + chart-lens provenance only.

The capsule creation and crossing relation are written in one transaction.

## Reflection provenance

Reflections now recognizes `astrology` as a truthful source type.

On the kept Reflection, **Where this began** resolves the Astrology source as:

> Natal chart · Tropical · Porphyry

or the equivalent current lens.

The source resolver verifies that the source belongs to a member who actually has a natal chart.

It returns only lens-level provenance:

> Member-owned natal chart viewed through the Tropical zodiac and Porphyry house lens.

It does not expose raw birth data or duplicate chart interpretation into Reflections.

## Return

The Reflection provides:

> **Return to source →**

which returns to:

`/astrology`

The Reflection remains a member-owned object after the source crossing.

## Memory boundary

Keeping an Astrology Reflection creates:

- one Reflection capsule;
- one facet-crossing relation.

It does not create:

- a memory atom;
- a Threshold Event;
- a MAIA interpretation record;
- a chart-derived personality claim.

The witness measured member-memory delta = **0**.

## Source-type extension

`astrology` is added to the Reflection Capsule source vocabulary.

This is descriptive provenance only.

It does not grant all Capsules astrological semantics and does not alter existing source types.

## Explicitly unchanged

UX-05 does not:

- save MAIA replies;
- save chart interpretations;
- infer member meaning;
- create cross-facet memory;
- alter chart calculation;
- alter MAIA conversation;
- change Reflection editing or archive semantics;
- auto-open Reflections after Keep.

## Exact stop

> **ASTROLOGY-UX-05 — PASS · MEMBER MEANING REMAINS MEMBER-AUTHORED · EXPLICIT REFLECTION KEEP + RETURNABLE ASTROLOGY PROVENANCE PROVEN · STOP**

The Astrology experiential candidate is now complete enough for integrated founder witness before reconciliation onto the current 3597 lineage.