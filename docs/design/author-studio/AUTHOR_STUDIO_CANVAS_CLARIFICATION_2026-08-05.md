# Author Studio Canvas Clarification — Architecture Referent Correction

**Date:** 2026-08-05
**Status:** ⭐⭐⭐ **CLARIFICATION of the existing Product Definition. ⛔ NOT a new architecture
decision.**
**Authority:** `docs/product/WRITERS_STUDIO_PRODUCT_DEFINITION.md` (#870, **MERGED**) — governs.

---

## 1. What was wrongly left open

`AUTHOR_STUDIO_EXPERIENCE_BRIEF_2026-08-05.md` §H recorded, as an open boundary question:

> *"Does Author Studio require its own native making surface, or does it orchestrate toward an
> existing making surface?"*

⛔ **That question was already answered and should not have been reopened.**

The Product Definition states it directly:

> **"Phase 1 is building the Canvas substrate, not the experience… the objective is to make the
> Canvas the primary workspace."**
>
> Decision rule: *never optimize the existing manuscript page into permanence.* The manuscript page
> is implementation scaffolding — **preserve its persistence layer, revision system, concurrency
> model and editing engine; do not preserve it as the member experience.**
>
> **1D** — choosing a project lands in the **Canvas shell** (Project / Shelf / Groups /
> WriterField), ⛔ **never the brown manuscript page.**

⭐⭐⭐ **Canvas is the primary member writing environment. Author Studio has its own making surface.**

---

## 2. The architectural meaning — ⛔ not "move prose into Canvas"

```
Canvas shell  +  preserved Working Draft engine
```

| The **shell** provides | The **engine** provides |
|---|---|
| the member experience | manuscript persistence |
| composition environment | immutable source handling |
| project / work organization | revision history |
| creative navigation | concurrency controls |
| | editing primitives |

⭐⭐ **The manuscript page remains implementation scaffolding.** Its persistence and editing
infrastructure are **preserved**; ⛔ its surface is not the final member experience.

---

## 3. 🔴🔴 The referent correction — the reason this file exists

⛔ **`/book-studio/canvas` is a visual and interaction REFERENCE for the Canvas shell. It is NOT a
migration target.**

The localStorage measurement taken at `36ca82f08` remains **factually correct** — 52-line iframe
over a 3,784-line static file, `localStorage`, no canvas/project/page-block table, founder-gated,
its own header reading *"Pending Phase C: move state from localStorage → database."*

⭐⭐⭐ **Its MEANING changes:**

| ⛔ Wrong reading | ✅ Correct reading |
|---|---|
| *"Canvas architecture is questionable."* | **"The current Canvas prototype is not the production persistence layer."** |
| *"Canvas is unresolved."* | **"Canvas is ruled; the prototype is a reference, not the substrate."** |

⚠️ **This exact misreading was performed on 2026-08-05** by a session that measured the prototype's
storage without consulting the Product Definition, and concluded that making Canvas primary would
put author prose in a browser. ⛔ It would not. The engine is preserved; only the surface changes.

⛔ **A future session that finds "Canvas uses localStorage" and concludes "Canvas is unresolved" is
repeating a known error.** Read §1 first.

---

## 4. What genuinely remains unresolved

⛔ The open item is **not** *"Should Canvas exist?"* — that is decided.

✅ It is: ⭐⭐⭐ **"Has Phase 1 produced enough evidence and completeness for the Canvas shell to
become the next authorized build lane?"**

**Constraint, unchanged:** ⛔ **No new Canvas implementation lane opens until Phase 1 release
conditions are satisfied.** Phase 1 currently stands **FAILED at W8**.

So the remaining uncertainty is **release readiness and sequencing** — ⛔ not architecture
selection.

---

## 5. Consequences for the sibling records

- `AUTHOR_STUDIO_EXPERIENCE_BRIEF_2026-08-05.md` **§H4/§H5** — the "boundary question" is
  **retired**, and §H's framing of Canvas relocation as an *open candidate* is superseded by §1
  above. ⚠️ §H's persistence measurements stand; only their interpretation is corrected.
- `WRITER_STUDIO_AUTHOR_STUDIO_DISTINCTION_2026-08-04.md` **§4ter** — the **Author Studio ⇄ Book
  Studio publishing overlap remains UNRULED and held.** ⛔ This clarification does **not** touch it:
  Canvas-as-making-surface and the publishing-claim overlap are different questions. ⛔ Do not read
  this file as authorizing a Book Studio merge.
- `8cc838455` (roadmap-leakage removal) is unaffected and stands.

---

## 6. What this file does not do

⛔ It ratifies nothing new · authorizes no implementation · opens no lane · moves no code · does not
resolve W8 · does not rule the Book Studio boundary · does not decide the Author Studio left rail.

⭐ It restores a referent that was already decided, so the decision stops being re-litigated by
sessions that read the prototype instead of the Product Definition.
