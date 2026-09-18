---
room: Living Constellation Projection
human_activity: seeing how my life, developing work, and practitioner field belong to the same wider world without collapsing them

surfaces:
  - components/maia/living-constellation/**
  - components/maia/living-field/PersonalLivingFieldDashboard.tsx
  - components/maia/vision-studio/VisionStudioRoom.tsx
  - components/maia/practice-field/PracticeFieldEditor.tsx

change_class: experiential

principles:
  - INHABITABLE_ARCHITECTURE — visible architecture must help the person know where they are and what belongs together without turning objects into rooms
  - MAIA_SOVEREIGNTY_INVARIANTS — member authorship and agency outrank system interpretation
  - SOULLAB_THEME §3 — emphasis carries meaning; the foregrounded room may be accented while the other rooms remain present
  - MAIA_OATH — no guru stance; the projection reports source and standing rather than claiming hidden meaning

reference_surfaces:
  - docs/design/contracts/LIVING_CONSTELLATION_CONTRACT_V0_1_2026-09-18.md
  - docs/design/contracts/LIVING_CONSTELLATION_PROJECTION_CONTRACT_LC02_2026-09-18.md
  - docs/fields/larry/VISION_STUDIO_SPEC.md
  - docs/ACCOMPANIMENT_MODEL.md
  - components/maia/living-field/PersonalLivingFieldDashboard.tsx
shared_with_house: the member remains the center of orientation; room names, provenance language, and quiet navigation remain legible across the House. The same projection component appears in all three rooms so continuity is learned once rather than reconstructed on every screen.
distinct_to_room: this contract governs only the shared projection inserted into Living Field, Vision Studio, and Practice Field. Each room keeps its own purpose, controls, persistence, authority, palette, and developmental grammar. Foreground changes by room; source reality does not.

screenshot_desktop: docs/design/contracts/screenshots/living-constellation-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/living-constellation-mobile.png
experience_verification: >
  Walked 2026-09-18 against a Next dev server running from the LC-02 worktree
  (port 3311). Used synthetic, non-confidential projection fixtures and browser
  request interception so no production or member data was read or written.
  The actual /maia/living-field and /maia/vision-studio?tab=vision and
  ?tab=practice routes were rendered at 1280x900 and 390x844. Six screenshots
  are on disk: the required Living Field desktop/mobile pair plus Vision Studio
  and Practice Field desktop/mobile witnesses. Across all three routes the same
  "Your wider field" projection rendered around the YOU orientation center;
  Living Field, Vision Studio, and Practice Field remained separately named;
  the room being visited was foregrounded without hiding the other two; authored
  example nodes retained their authority labels; and the visual disclaimer
  stated that lines indicate Soullab location only, not semantic or psychological
  relationship. The walk used route mocks only for source data; the React
  surfaces, layout, responsive CSS, and navigation were the candidate code.
---

# Living Constellation Projection — Experience Contract
## What this surface is for

The Living Constellation projection helps a member perceive continuity across
three already-real Soullab domains without pretending they have become one
database, one psychology, or one developmental sequence.

It answers a narrow experiential question:

> **Where does what I have authored currently live, and how does this room sit inside my wider field?**

The projection is intentionally read-only in LC-02. It gives orientation before
it gives relationship-making power.

## Arrival

> **Your wider field**

The phrase is deliberately descriptive rather than a final product name.
LC-00 left "Living Constellation" as a founder naming decision, so LC-02 does
not settle that decision through UI copy.

The member sees YOU as an orientation center and three surrounding domains:

- Living Field — what is alive in your life;
- Vision Studio — what your work is becoming;
- Practice Field — how your practice meets others.

The current room receives quiet emphasis. The other two remain visible.
## Gestures

| Gesture | Language used | Why this wording |
|---|---|---|
| move to another domain | "open →" beside the room name | Names navigation, not semantic transformation. |
| inspect the map | authority label beneath each visible node | Keeps authorship/standing attached to the representation. |
| encounter an empty domain | "Nothing authored here yet." | Absence is not deficiency and does not imply a hidden score. |
| encounter partial read | "what is shown is partial" | A source outage must not masquerade as biographical absence. |

LC-02 deliberately has **no connect gesture**. No line between two source nodes
can be created in this gate.

## Forbidden here

- lines presented as psychological, causal, developmental, or semantic claims;
- a master profile of the member;
- automatic cross-domain promotion or copying;
- hidden use of Vision Studio's currently non-conforming center provenance;
- treating Practice Field readiness as personal progress;
- showing another practitioner's Practice Field;
- mutating source data from the projection;
- implying an empty or failed source means "nothing exists";
- a stepper suggesting Living Field → Vision Studio → Practice Field is required.
## The two brand tests

**Same house?** Yes. The projection uses the same room names already present in
the House, keeps MAIA/system authority recessive to human authorship, and gives
the member one learned orientation object that travels with them rather than
three unrelated dashboards.

**Distinct room?** Yes. The shared object does not erase room character.
Living Field foregrounds life-level material, Vision Studio foregrounds the
developing body of work, and Practice Field foregrounds the practitioner-authored
relational ecology. The projection stays the same; attention changes.

## Evidence note

Additional route-specific screenshots from the same walk are committed beside
the required pair:

- living-constellation-vision-desktop.png
- living-constellation-vision-mobile.png
- living-constellation-practice-desktop.png
- living-constellation-practice-mobile.png

The screenshots use synthetic fixture data only.
