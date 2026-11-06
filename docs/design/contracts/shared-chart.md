---
room: Shared chart — a client's chart by private link
human_activity: A client looking at their own natal chart and its transits, sent to them privately by their astrologer, without needing an account — with the Elemental Alchemy overview, and a chance to ask MAIA about the chart, when the astrologer chooses to include them.
surfaces:
  - app/shared-chart/**
change_class: experiential
principles:
  - MAIA_SOVEREIGNTY_INVARIANTS — no account, no capture, no funnel; nothing about the viewer is recorded
  - CONSTITUTIONAL_DIRECTION_OF_AUTHORITY — calculated positions and aspects only, never a reading; the astrologer remains the interpreter
  - MARKETING_CLAIM_DISCIPLINE — the page says plainly it is a calculated chart, and that precision verification is pending
reference_surfaces:
  - docs/design/contracts/astrology-pro-preview.md
  - app/soul-portrait/view/[slug]/page.tsx (the delivered-gift page this follows: unlisted, noindex, ends on one quiet door)
shared_with_house: the same chart wheel, aspect grid and calculated facts as Pro Astrology; the navy field and gold accents of the astrology rooms
distinct_to_room: a single, finished page for one person and one chart — no member sidebar, no notes, no controls that change anything, and MAIA only where the astrologer turned Ask MAIA on (always labelled as MAIA, an AI, never the astrologer; "offered by" names the astrologer without making MAIA them). It lives outside the member astrology layout on purpose, so a client never meets member navigation.
screenshot_desktop: docs/design/contracts/screenshots/shared-chart-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/shared-chart-mobile.png
experience_verification: 2026-11-05 third walk — Ask MAIA turned on for the fictional chart with 'Offered by Example Astrology Practice': a real question was answered from the chart in plain text and handed meaning back; a crisis question got the fixed safety reply (988, findahelpline.com, emergency number, reach someone you trust and your astrologer) without MAIA being asked and without using the allowance; the per-link count read 1 afterwards (screenshot shared-chart-ask-maia-*.png). Second walk — transits always on (Show transits / Now / step / play, read through the link's own sky lookup, which refuses a turned-off link) and the Elemental Alchemy overview (elemental balance, the four Spiralogic pathways from the canonical house mapping, and the existing SacredHouseWheel in its Spiralogic layout) shown only when the owner ticks 'Include the Elemental Alchemy overview'; both confirmed signed out at 1280 and 390 wide with no page errors (screenshots shared-chart-elemental-*.png). First walk: 2026-11-05 local walk on localhost:3017. In Pro Saved charts, "Share link" asked for the consent confirmation ("… agreed to have their chart shared by link"), then showed the link with Copy, View and Turn off. Opened signed out (a fresh browser with no cookies) at 1280 and 390 wide, the page drew the whole aspect web (60 lines for the fictional "Example Client" chart), the side panel and positions table, with no member rail; robots noindex and referrer no-referrer were present. An unknown link showed no chart. Screenshots use a fictional chart. Not the founder's experiential acceptance.
---

# Shared chart — Experience Contract

## What this room is for

A client opens a link their astrologer sent and sees their own chart: the wheel,
where each planet sits, and how the planets relate. They can tap a planet to read
its position and aspects and turn the aspect and house lines on or off. Nothing
they do changes or saves anything.

## Arrival

> **A CHART SHARED WITH YOU — {name}** · birth date · time · place

## Gestures

| Gesture | Language used | Why this wording |
|---|---|---|
| Look at a planet | tap the planet, or its name under Positions | the chart is the interface |
| Simplify the wheel | "Aspects" · "Houses" | the same words the astrologer uses in Pro |
| Follow the sky | "Show transits" · "Now" · step and play | the same transit panel as Pro, read through the link |
| Ask about the chart | "Ask MAIA about your chart" · "Ask" | names MAIA plainly; says what it reads and that nothing is kept |

## Forbidden here

- notes, or interpretation written by the system outside Ask MAIA
- MAIA, unless the astrologer turned Ask MAIA on for this link; MAIA presented as a person or as the astrologer
- storing or logging what a client asks MAIA
- sign-up prompts, banners, or anything implying the chart is incomplete without an account
- member navigation
- recording who viewed the page
- the Elemental Alchemy overview unless the astrologer chose it for this link

## The two brand tests

**Same house?** Yes — the same wheel, grid and astrology colours as Pro Astrology.

**Distinct room?** Yes — a single finished page for one person, closer to the Soul Portrait gift page than to the dense Pro workstation.
