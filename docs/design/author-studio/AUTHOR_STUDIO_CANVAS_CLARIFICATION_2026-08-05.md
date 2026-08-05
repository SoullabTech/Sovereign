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

## 2. 🔴🔴 SUPERSEDED — see §2bis. Retained as the record of a corrected error.

⛔ The formulation below — *"Canvas shell + preserved Working Draft engine"* — was **technically
accurate and experientially wrong.** It preserved the **software stack** as the organizing
metaphor, which quietly reproduces the exact failure this lane exists to correct: a writer
arriving at a **tool** rather than entering a **creative environment**. It made the editor the
centre of gravity. ⭐⭐⭐ **The centre is the author's work, never the text editor.**

## 2. The architectural meaning *(superseded — read §2bis)*

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

## 2bis. ⭐⭐⭐ Writer Canvas ⊃ Editing Canvas

```
                 WRITER CANVAS
      (the environment where a work comes into being)

   Capture ─ Gather ─ Shape ─ Write ─ Refine ─ Release
                       |
                 Editing Canvas
        (the instrument where words are composed)
```

⭐⭐⭐ **The Editing Canvas is subordinate. It is essential, but it is not sovereign.**

| **Writer Canvas** — the environment | **Editing Canvas** — the instrument |
|---|---|
| the author's creative environment | the professional writing instrument |
| the evolving body of work | where sentences are formed |
| the relationship between source, insight, structure and expression | where drafts are edited and revised |
| *How does this work come into being?* | *How do I compose and edit words?* |
| spans the whole arc | belongs primarily to **Write** |

⛔ **Writer Canvas contains Editing Canvas. NOT the reverse.**

### The constitutional principle

> ⭐⭐⭐ **Do not confuse a writing instrument with an author's environment.**
> A writing instrument serves **composition**. An author's environment serves **creation**.
> The platform must support both — ⛔ they are not interchangeable.

### The acceptance test

> ⛔ A writer opens it and thinks **"Where do I type?"** — **we failed.**
> ✅ A writer opens it and thinks **"I can work here."** — **we succeeded.**

⭐⭐ It tests the **felt relationship with the environment**, ⛔ not a feature checklist — and it is
answerable in the first second. ⚠️ A good editor can pass *"did you forget the software"*; ⛔ only a
studio passes this.

### Layout relationship — ⛔ must not become another dashboard

```
LEFT — Context          CENTER — Work              RIGHT — Intelligence
what am I working on?   Writer Canvas              MAIA reflection
sources                 Editing Canvas             questions
structure                 when writing             connections
materials                                          observations
```

⛔ **The right panel is NOT an AI assistant panel.** It is a **thinking companion that remains
separate from authorship.**

> ⭐⭐⭐ **MAIA may illuminate the work. MAIA may not become the place where the work originates.**

### `/book-studio/canvas`, precisely

✅ A reference for **spatial thinking**. It asks: *how might creative material be arranged? how
might a workspace feel alive?*
⛔ It does **not** answer: *what is the ontology of an author's life work?* ⭐ That answer belongs to
the Writer Canvas.

⭐⭐ **What this changes about the design brief:** we are no longer designing *an AI writing tool*.
We are designing **a professional creative environment with an excellent writing instrument inside
it.**

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
