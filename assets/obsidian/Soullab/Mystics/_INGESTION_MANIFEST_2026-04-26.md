---
date: 2026-04-26
purpose: "Document a multi-tradition library expansion. Curation, not accumulation."
folder_kind: "manifest"
---

# Multi-Tradition Library Expansion — 2026-04-26

This manifest records a curated expansion of MAIA's source library and Use Frame
system across three additional traditions: **Taoist**, **Tibetan Buddhist**, and
**Hermetic / Western esoteric**.

The expansion follows the discipline established with the John of the Cross
folder: **Library (retrieval) → Use Frames (how MAIA holds them) → Knowledge
Field (when they activate)**. It is not a training event.

## Operating principle

> Bulk ingestion is not intelligence.
> MAIA must never flatten Taoist, Tibetan, Hermetic, and Christian systems into
> interchangeable language. Each tradition is held in its own field, with
> sources classified by type, and Use Frames that reflect that hierarchy.

## Training Constraint

No interpretive or secondary text may be used for training without a
corresponding primary source present in the corpus. Secondary texts may
inform context but must not shape model weighting or retrieval priority in
isolation.

Operationally:

- Source files carry frontmatter: `classification`, `training_weight`,
  `retrieval_priority`, `use_for_training`.
- Primary tradition texts: `training_weight: 1`, `use_for_training: true`,
  `retrieval_priority: standard`.
- Secondary academic and interpretive synthesis: `training_weight: 0`,
  `use_for_training: false`, `retrieval_priority: low`.
- Concepts in `lib/maia/knowledge/knowledgeField.ts` from this expansion are
  marked `queryable: false` until a tradition-specific gate / containment
  system exists.

## Gate-system precondition

Activation, retrieval surfacing, and cross-linking of these concepts and
sources is **on hold** until a tradition-specific gate exists for each
field — comparable to the astrologer gate. Until then: registered, classified,
non-surfacing.

## Source classification scheme

Every file in this expansion is classified as one of:

- **primary tradition text** — text from within the tradition (scripture, vow, classical commentary)
- **interpretive modern synthesis** — modern author drawing on the tradition for application
- **secondary academic analysis** — peer-reviewed or scholarly study of the tradition
- **critique / opposition** — a perspective from outside the tradition, included only with explicit framing

The classification is visible in each file's frontmatter and in the relevant
`_index.md`.

## Included sources (this expansion)

### Taoist

| File | Author / Source | Classification |
|------|-----------------|----------------|
| Five Precepts excerpt | *Ultra Supreme Elder Lord's Scripture of Precepts* | **primary tradition text** |
| Wu Wei excerpt | *Tao Te Ching* (ch. 54, etc.) | **primary tradition text** |
| Cosmos and Community framing | Livia Kohn (2004) | **secondary academic analysis** |
| *Taoist Ways to Transform Your Life* | Mantak Chia & David Twicken (2012 retreat brochure) | **interpretive modern synthesis** — minimal note only |

### Tibetan Buddhist

| File | Author / Source | Classification |
|------|-----------------|----------------|
| Game of Liberation paper | Jens Schlieter (2012) | **secondary academic analysis** |
| Samaya vow excerpts | Sa skya paṇḍita Kun dga' rgyal mtshan, *A Clear Differentiation of the Three Codes* | **primary tradition text** (excerpts via Schlieter and Rhoton tr.) |
| *The Tantric Mysticism of Tibet* | John Blofeld (1970/Arkana) | **interpretive modern synthesis** — TOC + curated sections only; full ingestion deferred |

### Hermetic

| File | Author / Source | Classification |
|------|-----------------|----------------|
| Seven Hermetic Principles | *The Kybalion* (1908, "Three Initiates"; public domain) | **interpretive modern synthesis** — *the* canonical 20th-c. articulation; not an ancient Hermetic source |
| *The Inner Alchemist's Handbook* | Master Kambo / Kam Dhadwar | **interpretive modern synthesis** — modern application, treat as such |

## Excluded sources (with reasons)

| File | Reason |
|------|--------|
| `323316329-Yungen-Ray-A-Time-of-Departing-pdf.txt` | **Critique / opposition** of the entire rest of the corpus. Excluded as a peer source. May be reconsidered later only as a `critique / boundary lens` inside `ethics_discernment` — not as Mystics material. |
| `862483423-...Inner-Alchemy-Astrology-...txt` | Junk. File contents are a download promo link, not the book. |
| `IS001DL_Inner_States_manual.pdf` | Read returned no extractable text. Likely image-only PDF. **Flagged for OCR before any reconsideration.** |
| `248905457-complete-catalog-pdf.txt` | Inner Traditions publisher catalog. Not a source text. |
| `143665550-4Keys-Song-of-the-Earth.txt` | Multi-author Gaia Education / sustainability anthology (Maddy Harland & William Keepin, eds., 2012). Coherent work, but **does not belong to the Taoist / Tibetan / Hermetic field** of this expansion. Held for a possible separate `Earth-Care / Gaian` lens; not added now. |
| Duplicate Hermetic file | Two identical copies of *Inner Alchemist's Handbook*; only one retained. |

## What was NOT done in this expansion

- ❌ No LoRA training data created.
- ❌ No cross-tradition mappings added in `knowledgeField.ts`. Concepts are
  registered in their own tradition only. Cross-tradition resonance, if it
  ever lands, will be a separate, deliberate decision per the
  *Symbolic Field Containment* canon.
- ❌ No keyword activation hooks updated. The new concepts do not yet trigger
  anything at runtime.
- ❌ No query expansion added.
- ❌ No PDFs dumped into Obsidian. Obsidian holds Use Frames and curated
  excerpts only. Full sources live in `data/library-sources/`.
- ❌ No flattening: no Use Frame says "this is the same as" across traditions.
  Each frame stays in its own field.

## Pending follow-ups

1. **OCR pass** on `IS001DL_Inner_States_manual.pdf` before any reconsideration.
2. **Curated extraction** from Blofeld's *The Tantric Mysticism of Tibet* — TOC
   already noted; doctrinal chapters to be excerpted in a later, intentional pass.
3. **Curated extraction** from Mantak Chia / Twicken material if a real book
   source replaces the retreat brochure.
4. **Yungen decision** — explicitly accept or refuse him as a critique lens
   inside `ethics_discernment`. Default: refuse.

## Companion canon

- `docs/canon/MAIA_CANON_v1.1.md`
- `docs/canon/AI_RELATIONAL_SAFEGUARDS.md`
- `docs/canon/use-frames/USE_FRAME_ACTIVATION.md` — *naming the source does not authorize activating the frame*
- Memory: *Symbolic Field Containment* (2026-04-24); *MAIA Integrative Nature* (2026-04-25); *Multi-Tradition Field Architecture* (2026-04-26 draft)
