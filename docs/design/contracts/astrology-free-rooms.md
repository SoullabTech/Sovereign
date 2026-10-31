---
room: Astrology — Free lens rooms
human_activity: Exploring one's own birth chart through chosen symbolic lenses (element pathways, aspects, synastry, Vedic, Chinese and Mayan traditions, the chart report) as material for reflection, without the chart becoming diagnosis, prediction or authority over the member.
surfaces:
  - app/astrology/aspects/[slug]/AspectDetailClient.tsx
  - app/astrology/chinese/page.tsx
  - app/astrology/mayan/page.tsx
  - app/astrology/pathways/[element]/PathwayDetailClient.tsx
  - app/astrology/pathways/[element]/layout.tsx
  - app/astrology/pathways/[element]/page.tsx
  - app/astrology/report/page.tsx
  - app/astrology/synastry/page.tsx
  - app/astrology/synastry/saved/page.tsx
  - app/astrology/vedic/page.tsx
  - components/astrology/BirthDataForm.tsx
  - components/astrology/DashaTimeline.tsx
  - components/astrology/SacredHouseWheel.tsx
  - components/astrology/ZodiacToggle.tsx
change_class: experiential
principles:
  - INHABITABLE_ARCHITECTURE — each lens is a place for inquiry, not a catalogue of trait cards
  - CONSTITUTIONAL_DIRECTION_OF_AUTHORITY — symbolic interpretation cannot manufacture higher-order truth about the member
  - MAIA_OATH — reflection, never guru stance or authority; no lens hands the member to MAIA on its own
  - ASTROLOGY-UX-01 — calculated fact, symbolic tradition and member meaning stay distinct
  - MARKETING_CLAIM_DISCIPLINE — a calculation that is not yet qualified says so instead of producing a result
reference_surfaces:
  - docs/design/contracts/astrology.md
  - docs/design/contracts/astrology-room-experience-architecture.md
  - docs/design/contracts/journal-room.md
shared_with_house: quiet field hierarchy · human-language gestures · provenance-aware interpretation · held states named honestly rather than hidden
distinct_to_room: each lens names its tradition and its limits. Calculations that are not independently qualified (Vedic ashtakavarga and gochara current positions, the generated report) are held with a plain explanation instead of a figure. No lens sends chart material to MAIA.
screenshot_desktop: docs/design/contracts/screenshots/astrology-free-rooms-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/astrology-free-rooms-mobile.png
experience_verification: 2026-10-30 automated witness of branch feature/astro-free-canonical-reconcile-20261030 (working tree before commit) on a canonical production build (`npm run build`, next build --webpack), fresh disposable PostgreSQL 16 bootstrapped with the repo's own scripts (684 tables, 570 migrations) and two fictional members; headless Chrome at 1365x900 and 390x844 with every non-loopback request blocked. Pathways (fire), synastry, saved synastry, Vedic, Chinese, Mayan and an aspect page (uranus-conjunction-neptune) all returned 200; /astrology/report returned 404 (report held). Synastry presents itself as held ('Synastry is not open in this Free release'). Vedic states a method boundary and withholds Gochara and Ashtakavarga forecasts. The ashtakavarga, gochara and Spiralogic-report APIs are refused by the strict access matrix before their own held handlers run, so no calculation is served (the honest held message is not reached). Zero MAIA or conversation requests and zero external requests across every visit. This is evidence that the rooms render and behave as described, not the founder's experiential acceptance, which is the physical iPhone re-witness.
---

# Astrology — Free lens rooms — Experience Contract

**Scope.** This contract claims the Free lens rooms and shared chart components
touched by the Free Astrology reconciliation onto canonical (QA lineage `3f63ebfd`,
founder-accepted 2026-10-28). It does not claim `app/astrology/page.tsx`, which the
existing Astrology contracts already govern, or the founder-only Pro preview, which
has its own contract.

**Coverage is not retrospective approval.** The screenshots and walk below come from
an automated witness of the reconciliation branch with fictional members. They are
evidence that the rooms render and behave as described. They are not the founder's
experiential acceptance, which remains the physical iPhone re-witness of this branch.

## What this room is for

A person who has their chart in front of them and wants to look at it through a
particular lens: the four elemental pathways, a single aspect, a relationship chart,
or another tradition's way of reading the sky. Each lens is something to think with.
None of them tells the member who they are.

## Arrival

> **Each lens opens on its own name and its limits** — for example *Fire Pathway · Vision & Projection*, *Vedic Astrology · Jyotish — the science of light* (with its method boundary), and *Relationship Astrology · Held — Synastry is not open in this Free release*.

The member arrives from the Astrology room and can always return to it.

## Gestures

| Gesture | Language used | Why this wording |
|---|---|---|
| Choose a lens | the tradition's own name (Vedic, Chinese, Mayan, Synastry) | names a practice, not a feature |
| Read one aspect | the aspect's plain name (e.g. "Uranus conjunction Neptune") | a relationship between two planets, not a verdict |

## Observed in the witness, not changed here

- The Fire Pathway back link still reads "Back to Cosmic Blueprint", the Astrology room's former name.
- Pathway copy makes neuroscience-style claims (for example "Right Prefrontal Cortex generating compelling vision") that sit uneasily with MARKETING_CLAIM_DISCIPLINE. Recorded for a later copy review; not altered by this reconciliation.

## Held, and said so

Where a calculation has not been independently qualified, the room says that plainly
and offers nothing in its place:

- Vedic ashtakavarga and gochara current positions: held pending independent
  astronomical and Jyotisha qualification.
- The generated Astrology report: held pending consent and provenance review.

## Forbidden here

- dashboard-style scoring of the person
- deterministic fate language or "your chart proves…" claims
- a calculated figure where the calculation is held
- sending chart facts to MAIA from a lens room
- engagement or streak mechanics

## The two brand tests

**Same house?** Yes: the same quiet hierarchy and human-language gestures as the
Astrology room and Journal, with held states named rather than hidden.

**Distinct room?** Yes: each lens names its tradition and its limits, which no other
room does.
