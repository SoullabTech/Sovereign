# Writer's Studio ⊥ Author Studio — the distinction is in kind, not scope

**Date:** 2026-08-04 · **Author of the ruling:** Kelly
**Status:** ⭐⭐⭐ **RULED as an architectural distinction. NOT authorized for build.**
**Amends:** `docs/design/author-studio/AUTHOR_INTELLIGENCE_STACK_CLASSIFICATION_2026-08-04.md` §12.3
**Touches:** `docs/canon/AUTHOR_STUDIO_THREE_LAYER_RULING.md` (2026-07-30, ratified)

---

## 1. What changed

§12.3 (earlier the same day) resolved a **referent divergence** by ruling that *Writer's Studio ·
Canvas · WriterField* were **implementation vocabulary** for the same thing the constitutional
record calls **Author Studio**.

That resolution assumed **one referent under two names**. The founder has now ruled the underlying
assumption wrong:

> *"Earlier I was treating Writer's Studio and Author Studio as different names for the same thing.
> What you're describing is different… Those are different in kind, not just in scope."*

**They are two environments, and one contains the other.**

⛔ A future session reading §12.3 alone will "correct" the architecture back to a single environment.
§12.3 must be read through this amendment. Its *procedural* holding still stands: **rename nothing
until ratified.**

---

## 2. The distinction (ruled)

| | **Writer's Studio** | **Author Studio** |
|---|---|---|
| Kind | creative **practice** environment | a **specialization** — the book path |
| Organizing question | ***What are you creating?*** | ***How does this become a published book?*** |
| Entry | writing as practice; publication irrelevant | one body of writing is becoming a book |
| Outputs / concerns | books (eventually) · blogs · articles · newsletters · workshops · courses · talks · speeches · training manuals · client resources · journals · essays · poetry · songs & lyrics · stories · research · reflection | manuscript · chapters · structure · continuity · developmental editing · copy editing · editions · cover · ISBN · EPUB/PDF · publishing · marketing |
| Population | many members may live here permanently | **many members may never enter** |

**Refined 2026-08-04 (second pass).** Not the dictionary sense of "author" — authors write many
things — but **the way the platform organizes human work.** Author Studio's concerns are
**book-specific**, which is what makes it a specialization rather than a bigger container.

> **Author Studio isn't where writing begins. It's where one body of writing becomes a book.**

Progression, as the founder states it: someone enters to develop *a workshop*; months later,
*"this workshop is becoming a book."* Likewise a series of blog posts → a book · years of journals →
a memoir · course material → a handbook · client teachings → a published guide.

```
House
 └── Writer's Studio                    ← the broader creative ecosystem
      ├── Journal · Essays · Notes · Talks · Articles · Letters · Poetry · Songs
      └── Author Studio                 ← one destination inside it
           └── Manuscript Room
                └── Gather · Shape · Refine · Release
```

**The load-bearing sentence:**
> **Writing is the practice. Authorship is one possible expression of that practice.**

**Amendment 2026-08-05 (founder-directed scope addition):** Writer's Studio explicitly supports
**poetry writing and song writing**. Poetry was already in the ruled output list; **song writing is
added by this amendment**. Evidence that this is scope-recognition, not new substrate: a songwriter
practice surface already exists at `app/maia/songwriter/` (page + `songs/`), already named in §3.4
as one of the scattered, unhoused practice surfaces — strengthening §3's finding that Writer's
Studio is substantially a naming-and-navigation act over surfaces that already exist. ⛔ This
amendment authorizes **no build** and does **not** resolve §5's open question of whether the
scattered surfaces move, link, or are gathered in navigation (the W8-class risk stands). Poems and
songs are candidate *expressions* under the existing `living_works` / `living_work_expressions`
model — a work may surface as an essay, a talk, a poem, or a song without ever becoming a
manuscript.

### 2bis. The governing sentence (founder, 2026-08-05)

> **A form is an expression of a Work, not the identity of the Work.**

The thing this amendment protects is **not the list of forms** — the list will keep growing
(essays · books · dissertations · poetry · lyrics · songs · talks · courses · teachings · scripts ·
newsletters · campaigns · research works · worlds). ⛔ **If each form becomes a mode, the product
fractures** into Book Studio / Poetry Studio / Song Studio / Research Studio / Course Studio — the
exact fragmentation the Writer Canvas direction was designed to avoid, and structurally the same
failure class as §4ter (parallel substrates claiming one concern).

The ruled model:

```
                 WORK
                  |
     -------------------------------
     |              |              |
  Materials     Development    Expressions
                                   |
        ------------------------------------
        |          |          |            |
      Book       Poem       Song        Course
```

**The expression is what the Work becomes. The Work is not defined by its eventual form.**

**Same studio. Different instruments.** A poem may need line breaks, rhythm, compression, image,
sequence — it does not need a Poetry Studio. A song may need lyrics, melody, verse/chorus structure,
collaboration, recordings — the Work remains the center; **the instrument changes, the room does
not.** The Canvas may eventually carry instruments (writing · structure · revision · research ·
lyric · presentation), but they are instruments *in* the room, never rooms.

⏳ **Held design question (named, ⛔ not opened):** the conversation this amendment points toward —
positioned **after** the current Creator Walk, not before — is **Work Expressions**: *how many forms
can one Work naturally become, and what instruments does each expression require without creating
separate rooms?* The question is recorded so it cannot be answered by accretion; ⛔ do not resolve
it by building instruments.

---

## 3. Why the existing evidence supports this

This is not a re-derivation. Four measured facts already fit the containment model:

1. **`/press/studio` is manuscript-centric today.** `studioMap.ts` reads `Current Book` → `Working
   Draft` · `Source` · `Import Manuscript`. That is **Author Studio's** shape. It was never a broad
   practice environment; it was correctly named for what it is.
2. **The reserved phases survive the re-frame unchanged.** `studioMap.ts` already carries
   `gatherings · shape · release` at `availability: 'later'`, *inside* `/press/studio`. Under the
   new model those four still belong to Author Studio. Nothing reserved has to move.
3. **`living_works` + `living_work_expressions`** (`20260801000001`) already model *a work* with
   *many expressions*. That is the Writer's-Studio-level container — a work that may surface as an
   essay, a talk, and a letter without ever becoming a manuscript.
4. **The practice surfaces already exist, scattered and unhoused**: `/api/journal/quick`,
   `/api/capsules/*` (+ `lib/capsules/`), `app/maia/songwriter/`, `app/fields/[field]/author/`,
   `app/book-studio/drafts/`. Writer's Studio is therefore substantially a **naming and navigation**
   act over surfaces that already exist — **not new substrate.**

**Consequence:** the cheap part of this ruling is real, and the expensive part is not where it looks.

---

## 4. ⛔ The maturation moment is constitutionally loaded

The ruling includes an illustration:

> *"MAIA might notice: 'You've been developing these ideas for months. They seem to belong to a
> single body of work. Would you like to begin an Author Studio project?'"*

**The architecture is sound. This specific moment is not yet permissible as phrased**, and the
reason is already canon:

- **`CONSTITUTIONAL_DIRECTION_OF_AUTHORITY`** — authority may only move upward through **authored**
  experience; the system may **never manufacture higher-order meaning**. *"These belong to a single
  body of work"* is a Recognition-layer claim synthesized by the system from Encounter-layer
  material. The member may leap; the system may not.
- **Q10 exclusions** — *manuscript-wide patterns* and *generalized suggestion engine* are already
  on the ⛔ not-authorized list.
- **Field Object promotion ruling (2026-08-02)** — ⛔ **NO SILENT PROMOTION.** A higher-order object
  exists when the **member performs the act**.

### 4.1 The permissible shape already has a precedent in code

There is a real difference between two threshold designs:

| | Shape | Verdict |
|---|---|---|
| **(a)** MAIA asserts *"these belong to one body of work"* | system authors the recognition | ⛔ forbidden by the above |
| **(b)** MAIA surfaces **member-authored facts** — *"you have kept 14 pieces under this theme"* — and the member draws the conclusion | evidence, never meaning | ✅ candidate shape |

Shape (b) is **already implemented and doctrinally proven** in
`app/api/sovereign/manuscripts/[id]/candidates/route.ts`: member-pulled only, verbatim evidence,
and the extractor's interpretive fields (`resonance`, `score`) **dropped server-side** — *"Evidence,
never meaning. Proposes, never keeps."*

⏳ **UNRULED:** whether the Writer's Studio → Author Studio threshold may use shape (b), and what
member act constitutes "beginning an Author Studio project." Until ruled, ⛔ build neither.

---

## 4bis. "Nothing has to be copied" — reconcile against Source / Working Draft

The founder states the transition as: *"Nothing has to be copied. The writing becomes the seed of a
manuscript."*

That is right at the **member** level and needs one precision at the **substrate** level, because
the existing model is deliberately a copy:

- `manuscript_working_drafts` is initialized **verbatim** from the source sections, with
  `base_source_hash` (sha256) recording exactly which source it began from. The copy is **the
  immutability guarantee** — it is why the original is never at risk.

**The clean reading — and it fits without changing anything:** the Writer's Studio work becomes the
**Source** (immutable), and the Author Studio manuscript's **Working Draft** is initialized from it.
The member performs no copying and loses no original; the practice writing keeps its own life and
identity in Writer's Studio while seeding the manuscript.

⏳ **UNRULED:** whether the seeded Source is a *reference to* the Writer's Studio work or a
*snapshot of* it — i.e. what happens to the manuscript when the member later edits the original
essay. `base_source_hash` makes divergence **detectable**; it does not decide what should happen.
⛔ Do not pick one by implementing it.

---

## 4ter. ⚠️⚠️ Author Studio ⇄ Book Studio — a boundary collision this sharpening creates

The standing constraint is: **Book Studio remains a distinct studio and is not merged.** The
sharpened Author Studio definition now claims *cover · ISBN · EPUB/PDF · editions · publishing ·
marketing* — and **Book Studio already implements that territory**:

| Concern | Already exists in Book Studio |
|---|---|
| EPUB render | `app/api/book-studio/render/epub` |
| Book page / design | `app/book-studio/book/`, `design-system/`, `illustrations/` |
| Drafts, passages | `app/book-studio/drafts/`, `passages/`, `ready-to-write/` |
| Workbench + Shelf | `app/book-studio/workbench/` |

Author Studio **also** has a render path: `app/api/sovereign/manuscripts/[id]/render` (pdf | epub,
ownership-gated, `manuscript_renders` provenance row).

⚠️ **Two studios now claim the book-production concern, and each has its own substrate.** This is
structurally the **same failure class as W8** — an apparent single gesture over two divergent
substrates. W8 cost a failed release walk; this would cost more, because it is load-bearing for
Release.

⏳ **UNRULED and now consequential:** where the Author Studio / Book Studio line falls.
Candidate readings — ⛔ none selected: (a) Author Studio owns the *manuscript*, Book Studio owns the
*artifact*; (b) Book Studio is Author Studio's Release phase under another name; (c) Book Studio is
the founder/Press instrument and Author Studio the member one.

⛔ **Do not resolve this by building Release.** It must be ruled before Author Studio's Release phase
is specified, and it does **not** block the authorized slice (§6).

---

## 5. What this ruling does **not** settle

- **Layer count.** The Three-Layer Ruling (07-30) becomes House → Writer's Studio → Author Studio →
  Manuscript Room — **four**. The ratified route identities (`/press/studio`, `/press/manuscript`)
  are untouched; Writer's Studio has **no ruled route**. ⏳ UNRULED.
- **Whether Writer's Studio is a new environment or the House's existing writing door re-founded.**
- **Whether the scattered practice surfaces (journal, capsules, songwriter) move, are linked, or are
  merely gathered in navigation.** ⛔ The `keeps`/`shelf` history shows navigation-level gathering
  over divergent substrates is exactly how W8 was produced. This question is **not cosmetic.**
- **Model A vs Model B phase numbering** — still held open on purpose. ⛔ Do not resolve by building
  or renumbering.
- ⛔ **Rename nothing.** §12.3's procedural holding survives intact.

---

## 6. What this ruling does **not** change

**The blocking correction and the authorized next slice are unaffected.**

Field Objects are a **member-field-level** substrate. They sit *beneath* both environments. The
capsule → canonical Field Object crossing behind `keepSource()` is required identically under the
old single-environment model and the new containment model.

Under the new model the slice arguably matters **more**: if Writer's Studio is where most members
will live and never leave, then *"the thing I kept arrives where the environment says it will"* is
the constitutive promise of the practice environment — not a manuscript-specific convenience.

**Sequence is unchanged.** Phase 1 remains **FAILED at W8**.
