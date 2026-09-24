---
# ── Identity ────────────────────────────────────────────────────────────────
room: Writer’s Studio — Write Resting + Full Canvas (PC3-S3)
human_activity: a writer writing in their manuscript, with the Work and its chapters quietly present, and — when they want it — the same page given the whole room, then returned exactly where they were

surfaces:
  - app/writers-studio/full-redesign/WriteRoom.tsx
  - app/writers-studio/full-redesign/Shell.tsx

change_class: experiential

# ── Governing law ───────────────────────────────────────────────────────────
principles:
  - Founder CR1 (PC3-S3 VISUAL AUTHORITY PASS) — “Entering full canvas changes the field, not the work.” · “One editor. More room. No loss.”
  - PC2 §IV — Write: manuscript primary; autosave, save state, current version, exact place, chapter/section movement; Full Canvas = same editor/save engine, same place, same version, reduced chrome, one clear return; no second editor
  - PC1 VS-02 / VS-04 — the full-size writing mode is not a second editor; MAIA is contextual, never resident at rest
  - VC-03 — Write at rest has no resident MAIA
  - CR0 adjudication — no formatting model or toolbar; Markdown remains candidate-only pending the nine formatting invariants
  - APPEARANCE_DEPTH_LAW — two-tone atmospheric depth, one visual world; Light and Night change colour roles only
  - TYPOGRAPHY_CONVENTION_EXTENSIBILITY_DIRECTION — type through semantic roles only, so curated faces can arrive later without redesign
  - NEGATIVE_VISUAL_EVIDENCE NV-01…NV-07

reference_surfaces:
  - docs/design/writers-studio/founder-reference-corpus/s3-visual-authority/a_clean_multi_panel_ui_ux_design_composite_with_fi.png @ fa151298997380fd5e4c76beef22b0afb6dc5662 · sha256 982b363b158a47d229c3efcb634be0ee09e722a7810df33a500a51de8058b5d9 · 1,855,655 bytes — the five labelled regions S3-A…S3-E
  - docs/design/contracts/writers-studio-full-redesign-pc3-s1.md — accepted S1 shell (founder PASS on 9995c785)
  - docs/design/contracts/writers-studio-full-redesign-pc3-s2-home.md — accepted S2R1 Home family

# ── The House / Room split ──────────────────────────────────────────────────
shared_with_house: the accepted S1 product bar, measured equal element-for-element (Write current); Newsreader for the Work and Inter for chrome through --fr-serif / --fr-sans; the same colour roles, radii and quiet action language; restrained gold only where the member has something unsaved
distinct_to_room: manuscript first — a flush MANUSCRIPT context (Chapters 6–12) beside one editable page; no resident MAIA, no toolbar; Full Canvas lets the bar, the context and Previous/Next recede while the page keeps its measure and its height, so the same lines stay where they were and only the field around them changes

# ── Evidence ────────────────────────────────────────────────────────────────
screenshot_desktop: docs/design/contracts/screenshots/full-redesign-pc3-s3/write-resting-1536x1024.png
screenshot_mobile: docs/design/contracts/screenshots/full-redesign-pc3-s3/write-resting-390x844.png
experience_verification: rendered S3-A…S3-D at 1536×1024 and set each beside its region of the custodied authority PNG (board-s3-a…d); walked the transition live — entry by pointer and return by the visible Return, entry by keyboard and return by Escape — and recorded the measured state tuple at every step (board-s3-e). Mechanical witness scripts/writers-studio/pc3-s3-write-fidelity.mjs 65/65 GREEN, REFUSES on any custody mismatch, and turns RED on each of the eleven mandatory known-bad mutants. Whether Write feels like more room rather than another editor is founder judgment and is NOT claimed here.

deviation: the prose measure is identical in Resting and Full Canvas (980px); the authority draws Full Canvas ≈4% wider; the word count is the true count of the fixture page (123), not the generated “214”
authority: founder CR1 law “One editor. More room. No loss.” — keeping one measure means the same editor never re-breaks its lines across the transition; truthful state copy (PC2 §IV, CR0) outranks a generated number with no text behind it; founder adjudication: explicit law outranks incidental image-generation artifacts
---

# Writer’s Studio — Write Resting + Full Canvas (PC3-S3) — Experience Contract

## What this room is for

Writing. The manuscript is the room; everything else is either quiet context (the Work, its chapters, where you are) or a way to move. Full Canvas is not another place — it is the same page with the room given to it.

## Arrival

> **The River Between › Chapter 6 — The Current Changes** · `● Saved · Draft v12` · the page, with the held passage and the cursor exactly where they were.

## Gestures

| Gesture | Language used | Why this wording |
|---|---|---|
| give the page the room | “Full Canvas” | the founder’s word for the mode; quiet, beside the state it will keep |
| come back | “Return” · Escape | one return action, two mechanisms — never a third exit |
| move | “Previous” · “Next” | navigation context, not a toolbar; recede in Full Canvas |
| know where you are | “The River Between › Chapter 6” | present in both fields |
| know it is kept | “Saved” · “Draft v12” | fixture truth; an edit here says “Unsaved”, never pretends to save |

## Geometry derived from the custodied authority

Measured once from the PNG as fractions of each panel’s frame width (method: region crop at 2×, frame edges and prose extents read against the panel frame; the composite draws each 1536-wide screen at ≈0.49 horizontally but a shorter-than-1024 frame, so vertical positions are NOT asserted):

| Measure | Authority | S3 render | Tolerance and why |
|---|---|---|---|
| rail width | 0.236 | 0.234 (360px) | ±0.03 — ≈±1.5% generation noise |
| Resting text left | 0.297 | 0.298 | ±0.03 |
| Resting measure | 0.635 | 0.638 (980px) | ±0.03 |
| Full Canvas text left | 0.188 | 0.181 | ±0.03 |
| Full Canvas measure | 0.661 | 0.638 | ±0.03 — plus the deliberate one-measure law above |
| Light = Night | — | 11 landmark boxes identical per state | exact, no tolerance |
| S1 product bar | — | identical to accepted S1 (Write current) at 1536/1280/1024 | exact, no tolerance |
| page height across the transition | — | title and editor y identical | ±2px |

## Forbidden here

- a second editor, route, document, manuscript state or save engine behind Full Canvas
- a resident MAIA region, at rest or in Full Canvas
- any formatting toolbar, formatting control or rich-text editing (the editor is plain-text only)
- elapsed-time copy (“2 minutes ago”)
- a loading or interstitial screen between the fields
- any exit from Full Canvas other than Return and Escape, and any return that lands differently from the other
- component-local font-family
- unsupported affordances: no MANUSCRIPT document control, search or dropdown

## The two brand tests

**Same house?** Yes — the bar is the accepted S1 bar, measured equal; type, roles, radii and action language are the S1/S2 family.

**Distinct room?** Yes — the page is the room; Full Canvas makes that literal without changing a word of it.
