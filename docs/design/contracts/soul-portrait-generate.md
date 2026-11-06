---
room: Soul Portrait — practitioner draft writer
human_activity: A practitioner or member preparing a Soul Portrait — a symbolic, human-centred portrait of someone's chart — as a private draft to review before it is ever sent as a gift.
surfaces:
  - components/soulPortrait/GeneratePortraitForm.tsx
change_class: experiential
principles:
  - CONSTITUTIONAL_DIRECTION_OF_AUTHORITY — the draft is a reflection for the practitioner to review, never an authority delivered to the person
  - MAIA_SOVEREIGNTY_INVARIANTS — nothing is published or sent from this page; delivery is a separate act with its own consent record
  - MEMORY_CONSENT — birth details named from a Pro chart are read on the server and never placed in a URL
reference_surfaces:
  - docs/design/contracts/astrology-pro-preview.md
  - docs/design/contracts/pro-studio-introduction.md
shared_with_house: plain human labels, one primary action, the same private-draft promise ("Nothing is published or shared") the Studio uses for portraits
distinct_to_room: a quiet light writing desk for one person's portrait, not the dark Studio instrument. When it opens from a Pro Astrology chart, the birth-detail fields are replaced by the named chart and a line saying it is drawn with the Pro calculator, so the practitioner cannot accidentally type a second, different chart.
screenshot_desktop: docs/design/contracts/screenshots/soul-portrait-from-pro-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/soul-portrait-from-pro-mobile.png
experience_verification: 2026-11-05 local walk on localhost:3017 as the founder. In Pro Astrology, "Soul Portrait" under the own-chart button asked first ("MAIA will read your chart to write a private draft. Nothing is sent until you send it."); Continue opened this page with "Chart (from Pro Astrology) · Your own chart" in place of the birth fields. Generating a draft named "Local test" produced a private preview whose placements matched the Pro chart (Sun Sagittarius 4th house, Leo rising). Desktop and phone screenshots captured headless at 1280 and 390 wide. Not the founder's own experiential acceptance.
---

# Soul Portrait — practitioner draft writer — Experience Contract

## What this room is for

Preparing someone's Soul Portrait: the practitioner names the person, chooses how
the page will look, and supplies the chart — either typed birth details or a chart
they already keep in Pro Astrology. The result is a private draft they read before
deciding whether to send it as a gift.

## Arrival

> **Generate a Soul Portrait** — "Creates a private draft for your review. Nothing is published or shared."

From Pro, the chart is already named: the practitioner only adds the name, kind and theme.

## Gestures

| Gesture | Language used | Why this wording |
|---|---|---|
| Begin from Pro | "Soul Portrait" → "Continue" | asks first, because saved charts promise they are not shared with MAIA |
| Make the draft | "Generate Draft" | a draft, not a delivery |

## Forbidden here

- sending or publishing from this page
- birth details in the address bar
- a second chart typed over a chart named from Pro

## The two brand tests

**Same house?** Yes — same private-draft promise and plain labels as the Studio portrait list.

**Distinct room?** Yes — a single light writing desk for one person, unlike the dense dark Pro workstation it is reached from.
