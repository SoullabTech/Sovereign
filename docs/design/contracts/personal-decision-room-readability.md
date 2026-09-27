---
room: Personal Decision — Readability
human_activity: Reading the member's choice, lived evidence, Council perspectives, tensions, possible direction and revisit invitation without needing browser zoom.
surfaces:
  - app/decisions/decision-house.module.css
change_class: experiential
principles:
  - SOULLAB READABILITY — quiet is not the same as small
  - DECISIONS-UX-04 — perspectives are material to think with and must remain legible
  - DECISIONS-UX-05 — member-authored evidence keeps reading-size authority
  - DECISIONS-UX-09 — resolution and choice history remain readable member-owned material
reference_surfaces:
  - docs/canon/SOULLAB_READABILITY_STANDARD.md
  - docs/design/contracts/personal-decision-live-room.md
  - docs/design/contracts/personal-decision-resolution.md
shared_with_house: 16px ordinary-copy floor, 17px reading floor, 16px action floor, 14px meaningful-metadata floor, 12px decorative-marker role.
distinct_to_room: Council perspective can be visually quiet through contrast, spacing and material framing, but its substantive prose is reading material and therefore never micro-sized.
screenshot_desktop: docs/design/contracts/screenshots/decisions-ux-11-room-readability-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/decisions-ux-11-room-readability-mobile.png
experience_verification: 2026-09-27 authenticated local witness on the reconciled current-House candidate at localhost:3700 using a temporary Personal Decision with a Council result and a member-authored experience. Computed desktop sizes were: choice metadata 14px, member contextual material 17px, perspective rail body 16px, perspective title 26px, insight/tension card prose 17px, possible-direction prose 18px, revisit body 16px, revisit action 16px, Notice action 16px. Mobile retained the same meaningful-copy floors through wrapping rather than shrinking. No behavioral code changed. Temporary Decision, experience, session and member were removed; residue zero.
---

# DECISIONS-UX-11 — Living Decision Room Readability Conformance

## Founder ruling

The integrated Personal Decisions composition is accepted.

The remaining correction is typographic:

> **make the meaningful text larger without redesigning the room.**

## Governing law

Council material may be secondary in authority.

It may not be secondary in physical legibility.

Hierarchy therefore comes from:

1. placement;
2. material surface;
3. whitespace;
4. serif / sans register;
5. contrast;
6. weight;
7. only then size.

Meaning-bearing prose is not made tiny merely to make it quieter.

## Conformed roles

### Member material

- choice/context supporting material: **17px**;
- choice metadata/date: **14px**;
- member-authored Notice/revisit writing: **17–18px**;
- member choice / resolution prose: **18px where foregrounded**.

### Perspective material

- Council insight cards: **17px**;
- tensions: **17px**;
- risks: **16px**;
- possible direction: **18px**;
- perspective explanations: **16px**;
- section titles: **22–26px**.

### Actions

- Gather perspectives: **16px**;
- Notice what changed: **16px**;
- Revisit perspective: **16px**;
- choice/reopen actions: **16px**;
- interactive targets remain at least **44px**.

### Metadata and markers

- meaningful dates / orientation metadata: **14–15px**;
- purely decorative uppercase markers: **12px**.

## What did not change

UX-11 changes no:

- Decision data;
- Council prompts;
- Council result content;
- Notice behavior;
- revisit behavior;
- resolution behavior;
- source crossings;
- memory behavior;
- layout architecture.

The accepted visual composition remains intact.

## Exact stop

> **DECISIONS-UX-11 — PASS · LIVING DECISION ROOM CONFORMED TO HOUSE READABILITY STANDARD · NO BEHAVIOR CHANGE**

The reconciled candidate remains on localhost:3700 for founder visual confirmation before exact promotion to localhost:3597.