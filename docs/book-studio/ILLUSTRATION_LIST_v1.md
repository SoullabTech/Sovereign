# Illustration List — v1 (longlist, structural pass)

> **Status.** v1, 2026-04-28. **Longlist only.** Structural extraction
> from the sealed manuscript. Editorial restraint, production fields,
> and final selection happen in the print chat — not here.
>
> **Source manuscript.** `docs/book-studio/ELEMENTAL_ALCHEMY_FROM_ORIGINAL_FULL.md`
> (sealed: 2,845 lines / 59,069 words)
>
> **Method.** Six-pass model — this file is the output of pass 1
> (structural) and the start of pass 2 (semantic). Passes 3–6 (restraint,
> production, rights/accessibility, proof) are not in scope here.

---

## Principles carried forward (do not negotiate)

1. **Longlist first, restraint pass cuts.** Overselect now; cut hard later.
2. **Threshold, not decoration.** Every kept image must mark *initiation,
   passage, return, invocation,* or *ritual* — not break up text.
3. **No H3s in v1.** The manuscript has 185 H3s; promoting any of them
   would shatter the threshold principle.
4. **Cover, title page, imprint mark — tracked separately, not in this
   numbered figure sequence.** Per house convention.
5. **Numbering not yet locked.** The `provisional_no` column is for
   ordering only; final figure numbers are assigned after restraint pass.

---

## Open structural questions (must resolve before final pass)

These three items affect what enters the inventory at all. They are
**not** mine to decide:

1. ~~**Do the three Part openers exist as printed pages?**~~
   **Resolved 2026-04-28.** Part-opener H1 sections added to the
   manuscript between Preface→Ch1, Ch4→Ch5, and Ch9→Ch10. Each carries
   an italic epigraph placeholder for Kelly to author. CSS `.part-opener`
   class added to `print.css` with `break-before: right` (recto-forced),
   2in top margin, no folio.

2. **Is there a printed Introduction page?**
   The TOC lists *Introduction* but the manuscript has no `# Introduction`
   H1 — the flow goes Permissions → Contents → Preface → Chapter 1.
   Either the TOC needs to drop *Introduction* or the manuscript needs
   one. Until resolved, I have **not** added an Introduction row.

3. **Numbering style.**
   Single continuous sequence (likely cleanest for a 59k-word trade book
   under ~25 figures) vs. chapter-dot (`5.1`, `5.2`, …). Not chosen here.
   `provisional_no` uses single sequence as a working default.

---

## Inventory schema

Columns follow the production-safe field set recommended in the
illustration-list memo:

| Field | Filled here? | Owner |
|---|---|---|
| `provisional_no` | yes | structural pass |
| `anchor` | yes | structural pass |
| `anchor_id` | yes (Pandoc-style slug) | structural pass |
| `manuscript_line` | yes | structural pass |
| `role` | provisional | semantic pass |
| `element` | yes (where unambiguous) | semantic pass |
| `tone_note` | yes (factual, one line) | semantic pass |
| `keep` | TBD | restraint pass (print chat) |
| `size_class` | TBD | production pass |
| `art_type` | TBD | production pass |
| `reproduction_mode` | TBD | production pass |
| `bleed` | TBD | production pass |
| `rights_status` | default `commissioned-original` | rights pass |
| `credit_status` | TBD | rights pass |
| `accessibility_status` | TBD | accessibility pass |
| `file_name` | provisional `EA_figNN` | production pass |

---

## Longlist (pass 1 + 2)

### Front matter & part dividers

| # | anchor | anchor_id | line | role | element | tone_note |
|---|---|---|---|---|---|---|
| F-1 | Preface | `preface` | 110 | invocation | — | Author dream-of-the-elements; first crossing into the book. |
| PART-1 | Part One — The Ground | `part-one-the-ground` | — | invocation | — | Frame for orientation chapters (Ch1–4). Page does not yet exist in manuscript. |
| PART-2 | Part Two — The Elements | `part-two-the-elements` | — | invocation | — | Frame for lived elemental descent (Ch5–9). Page does not yet exist. |
| PART-3 | Part Three — The Spiral | `part-three-the-spiral` | — | invocation | — | Frame for system reveal (Ch10). Page does not yet exist. |

### Chapter openers

| # | anchor | anchor_id | line | role | element | tone_note |
|---|---|---|---|---|---|---|
| 1 | Chapter 1: The Journey Begins | `chapter-1-the-journey-begins` | 179 | initiation | — | Augusten campfire opens the book; first lived threshold. |
| 2 | Chapter 2: The Torus of Change | `chapter-2-the-torus-of-change` | 317 | passage | — | Toroidal pattern, cyclical structure of life. |
| 3 | Chapter 3: Understanding the Trinity and the Toroidal Flow | `chapter-3-understanding-the-trinity-and-the-toroidal-flow` | 475 | passage | — | Three-fold dynamic (gunas / cardinal-fixed-mutable / sulfur-mercury-salt). |
| 4 | Chapter 4: The Elements of Wholeness | `chapter-4-the-elements-of-wholeness` | 610 | passage | — | Integration before descent; the four-yogi parable. |
| 5 | Chapter 5: Fire | `chapter-5-fire` | 755 | initiation | fire | Lived fire — campfire, ancestors, firekeeper. |
| 6 | Chapter 6: Water | `chapter-6-water` | 1142 | initiation | water | Lived water — sweat lodge, Sophie, home. |
| 7 | Chapter 7: Earth | `chapter-7-earth` | 1398 | initiation | earth | Lived earth — Bill in the garden, Cajun→Connecticut, father-son trip. |
| 8 | Chapter 8: Air | `chapter-8-air` | 1661 | initiation | air | Lived air — Massoud, daughter, Maestro Benito dragonfly. |
| 9 | Chapter 9: Aether | `chapter-9-aether` | 1922 | initiation | aether | Lived aether — 3:33 dream, duende, heart as conductor. |
| 10 | Chapter 10: The Living Spiral | `chapter-10-the-living-spiral` | 2083 | passage | — | System reveal; integration after descent. |
| 11 | Conclusion — Embracing Your Elemental Soul | `conclusion-embracing-your-elemental-soul` | 2356 | return | — | Emotional closure; release. |
| 12 | Afterword — The Field | `afterword-the-field` | 2376 | invocation | — | Doorway out of the book into the field. |

### Selected H2 thresholds within chapters

These are H2 sections that genuinely mark threshold turns — not every
H2 is included. The memo's filter applied: *initiation, passage, return,
invocation, or ritual.* Conservative selection — print chat cuts further.

| # | anchor | anchor_id | line | role | element | tone_note |
|---|---|---|---|---|---|---|
| 13 | A Prayer for Collective Illumination *(Ch1)* | `a-prayer-for-collective-illumination` | 183 | ritual | — | Canonical ritual/prayer block; second threshold inside Ch1. |
| 14 | The Wisdom of the Firekeeper *(Ch5)* | `the-wisdom-of-the-firekeeper` | 941 | ritual | fire | Bear Heart anchor; lineage and ceremonial witness. |
| 15 | The Dark Side of Fire *(Ch5)* | `the-dark-side-of-fire` | 953 | passage | fire | Polarity turn — the necessary shadow within Fire. |
| 16 | The Secret Fire Walk of Wisdom and Enlightenment *(Ch5)* | `the-secret-fire-walk-of-wisdom-and-enlightenment` | 1003 | passage | fire | Initiation walk; phoenix from ashes. |
| 17 | Closing Blessing *(Ch5)* | `closing-blessing` | 1131 | ritual | fire | Ritual seal closing Fire. (Test case: if this earns its place, equivalent closings could be added in Water/Earth/Air/Aether.) |
| 18 | The Three States Within Each Element *(Ch10)* | `the-three-states-within-each-element` | 2139 | passage | — | System block; one of three integrative reveals. |
| 19 | The Three Phases Within Each Element *(Ch10)* | `the-three-phases-within-each-element` | 2185 | passage | — | System block; cyclical phases per element. |
| 20 | Maya's Journey through the Elements *(Ch10)* | `mayas-journey-through-the-elements` | 2229 | passage | — | Narrative through-line carrying the system. |

### Back matter (intentionally excluded from numbered figure sequence)

These pages typically do **not** carry threshold images in trade books.
Listed for completeness so the print chat can confirm:

| anchor | anchor_id | line | reason excluded |
|---|---|---|---|
| A Message to My Fellow Healers, Mystics, and Cultural Revolutionaries | `a-message-to-my-fellow-healers-mystics-and-cultural-revolutionaries` | 2414 | Practitioner address; tonal step-down from main matter. |
| Acknowledgments | `acknowledgments` | 2452 | Convention. |
| Appendix | `appendix` | 2482 | Reference matter; receives type treatment, not figures. |
| Bibliography | `bibliography` | 2646 | Reference matter. |

If any back-matter page wants a small device (e.g. Soullab Press
colophon mark on copyright or final page), track it in a **separate**
title-page / colophon log — not the numbered figure sequence.

---

## Counts

| Bucket | Count |
|---|---|
| Front matter + Part openers (proposed) | 4 |
| Chapter openers | 12 |
| Selected H2 thresholds | 8 |
| **Longlist total** | **24** |

Memo's heuristic for a contemplative 59k-word trade book: final program
~18–25 illustrations after restraint. This longlist sits at the upper
end (24) — restraint pass is expected to cut ~5–10.

---

## What's still open (for the print chat)

1. **Restraint pass** — every row above marked `keep: TBD`. Cut hard.
2. **Production pass** — `size_class`, `art_type`, `reproduction_mode`,
   `bleed`. None set here.
3. **Rights pass** — `commissioned-original` is the assumed default;
   confirm none of these will use third-party imagery.
4. **Accessibility pass** — `informative` vs `decorative` per row.
   Affects EPUB build later.
5. **Numbering style** — single continuous (used here) vs chapter-dot.
   Lock before file naming.
6. **File naming** — `EA_figNN` placeholder; finalize after restraint.
7. **Front-matter "List of Illustrations" page** — convention split.
   Decide after final count.

---

## Sidecar emit (for Pandoc / Paged.js pipeline, when ready)

When the restraint pass concludes, this file's table can emit as CSV
for downstream tooling. Suggested header:

```csv
provisional_no,anchor,anchor_id,manuscript_line,role,element,tone_note,keep,size_class,art_type,reproduction_mode,bleed,rights_status,credit_status,accessibility_status,file_name
```

Until that point, this single markdown file is the source of truth.
Edit here; do not maintain a parallel CSV.

---

## What I did NOT do (lane discipline)

- ❌ Did not assign `keep` decisions
- ❌ Did not propose visual style, medium, or aesthetic
- ❌ Did not write captions or alt text
- ❌ Did not commission, draw, or describe specific imagery
- ❌ Did not decide numbering style
- ❌ Did not resolve Part-opener question
- ❌ Did not decide Front-matter List of Illustrations question

All of those belong to the print chat with the design system in hand.
This file is the bridge between manuscript structure and that work.
