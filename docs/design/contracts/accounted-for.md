---
room: Accounted For
human_activity: reading Soullab's manifesto-and-accounting in five parts — why it exists, who we are, what exists with every claim labeled, how we work, and what we do not know or refuse to claim

surfaces:
  - app/accounted-for/page.tsx

change_class: experiential

principles:
  - MARKETING_CLAIM_DISCIPLINE — Live, Partly live, Designed and Vision may not borrow maturity from one another
  - INHABITABLE_ARCHITECTURE — every visible element serves the human activity of orientation rather than product display
  - MAIA_OATH — relational language may not manufacture attachment, authority or certainty
  - MAIA_SOVEREIGNTY_INVARIANTS — agency and recognition integrity govern the human–AI relationship
  - SOULLAB_THEME — provenance voice, typography and restrained accent remain coherent with the House

reference_surfaces:
  - app/accounted-for/page.tsx — the existing shipped accounting surface whose visual language this change preserves
  - docs/pitch/MAIA_PLATFORM_ACCOUNTING_2026-09-03.md — source of record for the page copy and evidence boundary
  - docs/research/human-experience/CLAIM_LADDER.md — separates empirical, theoretical, phenomenological, ethical and philosophical claims
  - docs/research/human-experience/WHY_SOUL_LAB_2026-09-06.md — founder foundational statement: the human question is primary; Self, Relationship, World; AI as emergent participant; three nested inquiries; collective laboratory unbuilt

shared_with_house: the House's restrained field hierarchy, Spectral/IBM Plex typography, provenance voice, and refusal to make the system more important than the member
distinct_to_room: a public evidence room rather than a member practice room; it is dense by design because the activity is inspection, with claim boundaries and withheld claims visible rather than simplified into marketing

screenshot_desktop: docs/design/contracts/screenshots/accounted-for-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/accounted-for-mobile.png
experience_verification: >
  Walked 2026-09-06 (third revision, this branch — the five-part manifesto
  structure) in headless Chromium against a local `next dev` render at
  1280×900 and 390×844, from a clean lockfile install. Observed: HTTP 200 at
  both widths; exactly one H1 ("MAIA, Accounted For"); five part-markers in
  order — "I · Why", "II · Who", "III · What", "IV · How", "V · If" — each
  present exactly once; the eyebrows "Why Soul Lab", "Who we are", "What we
  are testing", "What we do not know", "If we are wrong" and "Withheld" each
  appear exactly once; 20 H2 on the page. Read on the render: the human
  question sits above the capabilities under Part I; the encounter foundation
  (both revelations; responsive reflective surface) is inside Why Soul Lab;
  Part II names members as participants not subjects, MAIA as participant not
  center, and Soullab as the accountable party; the existing Live / Partly live
  / Designed / Vision accounting is preserved under Part III; the programme by
  rung and the method sit under Part IV; open questions, withheld claims, and
  "If we are wrong" sit under Part V. Mobile document width is 390px at a 390px
  viewport. Desktop document width is 1597px at a 1280px viewport — the
  pre-existing shared Table wrapper overflow recorded by earlier revisions;
  this change does not touch Table composition or width classes, so it is
  recorded rather than repaired. Screenshots are the top 3000px (desktop) /
  3600px (mobile) of the branch render, not full-page. No navigation,
  interaction, auth, memory, prompt, cognition or runtime path changes. Gates
  at commit: design-canon PASS, no-supabase PASS, diff --check PASS, typecheck
  no-regression PASS (230 vs 239 baseline, TypeScript 5.9.3 from lockfile).
---

# Accounted For — Experience Contract

## What this room is for

A reader comes here to inspect MAIA rather than be persuaded by her. The page
must make it possible to distinguish what exists in production, what is partly
live, what is designed, what remains vision or research, and what Soullab will
not claim. Density is permitted because the human activity is accounting.

## Arrival

> **MAIA, Accounted For** — a manifesto and an accounting in five parts: why · who · what · how · if.

The arrival answers four things immediately: this is Soullab's accounting, the
subject is a person's own inquiry with MAIA as a participant in it, the page
distinguishes present from future, and evidence rather than enthusiasm governs
the claims. The first section after the header is *Why Soul Lab*: the human
question placed above the capabilities, and the accounting named in four kinds
(what exists · what we believe · what we are testing · what we do not know).

## Gestures

| Gesture | Language used | Why this wording |
|---|---|---|
| inspect maturity | Live · Partly live · Designed · Vision | names operational state without translating it into sales language |
| inspect limits | Claims this page withholds | makes non-claims part of the product surface rather than footnotes |
| inspect direction | research direction / hypothesis | keeps active R&D visible without promoting it to a capability |
| inspect the frame | Why Soul Lab · three nested inquiries | places the human question above MAIA; names the collective laboratory as unbuilt so the frame cannot read as a data claim |
| inspect the programme | What we are testing, by rung | each inquiry and principle shown at the claim-ladder rung its evidence licenses |
| inspect ignorance | What we do not know | open questions listed so the reader sees the shape of our uncertainty rather than infers it |

## Forbidden here

- presenting research direction as a Live capability
- implying that Elemental language is a neurological mapping or validated classifier
- implying that felt presence proves consciousness or personhood
- using the human–AI relationship programme as attachment or retention marketing
- replacing evidence-bearing prose with a dashboard of green checks
- simplifying away unresolved or contradictory evidence because it weakens the pitch
- describing members as research subjects, or implying any member conversation serves research today
- letting the human–AI relationship read as the destination; the human question is primary and MAIA is a participant in it

## The two brand tests

**Same house?** Yes. Typography, field hierarchy, restrained accent, provenance
voice and member-sovereignty language remain recognizably Soullab.

**Distinct room?** Yes. This is the House's evidence room: denser, slower and
more explicit than practice surfaces because the activity is inspection rather
than encounter. A reader should be able to challenge the claims from inside the
page itself.