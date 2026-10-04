# Writer's Field — state of the work, and the phase plan

**Date:** 2026-08-05 · **Author:** Kelly (founder assessment) · **Recorded by:** Claude Code
**Status:** founder assessment + phase plan. ⛔ Authorizes Phase 1 scoping only; Phases 2–4 are
recorded, not authorized.

> **Why this file exists.** This assessment was made in conversation. The failure it diagnoses is
> *design that never bound to implementation* — twelve artifacts published 2026-07-31 that no spec,
> ruling, or component in this repo cites. Leaving this assessment in a chat log would repeat that
> exact failure at the level of the diagnosis itself.

---

## The honest state

> **Writer's Studio is not done. It is partially designed, partially implemented, and currently
> sitting at the exact point where the original vision has been recovered but not yet rebuilt into
> the product.**
>
> **The work was not lost. The implementation drifted.**

---

## 1. Design foundation — **exists**

The strongest part. The original Writer's Field / Author Studio work exists as artifacts published
**2026-07-31**: *The Field · The Studio (living floor plan) · Arrival · Your Work · Places &
Gestures · Gather — a verb, not a place · The Page · Sitting / Returning · Revision studies.*

The design language is coherent, and its centre is explicit:

> **The centre is not the manuscript.** It is *a person in relationship with something alive that
> wants to become a work.*

Intended movement: `Life → Gather → Discover → Shape → Write → Revise → Publish`

> 🔴🔴 **CORRECTION — 2026-08-05, same day, before this file was an hour old.**
> An earlier draft of this section said *"these artifacts are not in this repository… that
> unboundedness is the root cause of everything below."* **That was false.** A proper archaeology
> pass found the corpus in the repo:
>
> - `docs/design/author-studio/phase-b/` — **five HTML prototypes + STATUS.md**, dated 2026-07-31:
>   `writing-surface.html` (260) · `study-revision.html` (177) · `sitting-001-returning.html` (163)
>   · `sitting-002-beginning.html` (154) · `study-paper.html` (152)
> - `docs/design/author-studio/R1_EXPERIENTIAL_SPECIFICATION_CANDIDATE_2026-08-01.md` (199)
> - `docs/architecture/INTEGRATE_PRACTICE_CANDIDATE_2026-07-31.md` — carries *Places & Gestures*,
>   *never writes for you*, *THREE ACTS*
> - `docs/architecture/THE_CULTIVATION_METHOD_2026-07-31.md` · `LIVING_WORK_ATLAS_2026-07-31.md` ·
>   `STUDIO_COPY_VOICE_2026-07-31.md` · `DESIGN_LENSES_2026-07-31.md` ·
>   `AUTHOR_STUDIO_EXPERIENCE_SPEC.md`
> - `docs/canon/MEMBER_EXPERIENCE_DESIGN_CONSTITUTION_CANDIDATE_2026-07-31.md`
>
> **Why the false claim happened, recorded because it is the lane's signature failure:** the search
> looked for `*.md` files named after artifact titles. The corpus is `.html` prototypes in a
> `phase-b/` subdirectory plus architecture docs under different names. ⭐⭐⭐ *"It exists under
> another name"* is precisely the failure this lane keeps hitting — and the recorder committed it
> while documenting it.
>
> ⛔ **The root cause is therefore NOT that the design is missing from the repo.** It is present and
> unimplemented. Revise any downstream reasoning that assumed absence.

⭐⭐⭐ **`phase-b/STATUS.md` already carries the exact discipline this file was written to restore —
and records that this failure has happened once before, in the opposite direction:**

> *"These files are not implementation… A design passes through five distinct states. They must
> never be blended: **Rendered design → Repo implementation → Merged → Deployed → Experientially
> verified.**"*
>
> *"This folder exists because that distinction failed once. The prototypes below were reviewed
> repeatedly over a day and gradually became mentally indistinguishable from shipped product —
> which produced a false alarm that the deployed Studio had regressed. It had not. The prototypes
> had simply never been code."*

⚠️ **Both directions of the error are now on record.** July: prototypes mistaken *for* shipped
product. August: shipped product searched for the prototypes and concluded they did not exist. Same
missing binding, opposite misreadings.

⚠️ **Palette caution from STATUS.md, load-bearing for implementation:** every phase-b prototype uses
a **deep navy** ground (MAIA's brand note). ⛔ **The Author Studio does not use navy** — it uses the
Soullab Press **espresso** palette in `app/press/studio/pressTheme.ts`. Implementation must extend
espresso or explicitly reopen that ruling; ⛔ it must not drift to navy because a prototype did.
*(Note: the claude.ai artifact "The field" renders in espresso, not navy — so the artifact set and
the phase-b prototypes may be different revisions. Reconcile before building.)*

---

## 2. Current implementation — **partial**

| | State |
|---|---|
| **Author Studio route** `/press/studio` | ✅ exists — the permanent Layer 2 environment; replaced the mistake of dropping members straight into `/press/manuscript` |
| **Manuscript substrate** | ✅ real: manuscripts · sections · source · working drafts · revisions · provenance. Source immutable · Working Draft editable · revisions preserve history · auth boundaries enforced. **This part is strong.** |
| **Writing surface** | ✅ exists — but behaves like *"open a document and edit it"* rather than *"enter a writing environment."* **That distinction is the heart of the remaining work.** |
| **Start-writing defect** | ✅ fixed **locally** — `fix/studio-start-writing-always` @ `a3fcd2c50`, ⛔ not pushed. No longer blocks writing because the system cannot identify the "one true work"; preserves uncertainty; restores the primary doorway. |

---

## 3. What is missing

**The Writer's Field environment is not built.**

- **Arrival** — the writer does not enter through *"here is where your work is alive."* They enter
  through manuscript mechanics.
- **Living work relationship** — *What am I working on? Where did I leave it? What is calling me
  back?* — absent.
- **Gathering field** — the design surrounds writing with keeps · questions · research · voice ·
  fragments · discoveries. The primitives partly exist; **they are not composed around writing.**
- **Returning** — *probably the most important missing capability.* Currently
  `open document → continue editing`. Intended: `return to relationship → notice what changed →
  continue the work`. The design question: ⭐⭐⭐ **what does it mean to come back changed?**

---

## 4. The architectural correction

```
BUILT                          SHOULD EXIST
Book Studio                    Writer's Field
    ↓                               ↓
Manuscript                     Author Studio
    ↓                               ↓
Editor                         Manuscript
    ↓                               ↓
Publish                        Book Studio
                                    ↓
                               Publication
```

⭐⭐⭐ **Book Studio is not wrong. It was promoted too early.**

---

## 5. Phases — what "done" means

**Phase 1 — Restore the room.** Writer's Field home · arrival into a work · clear Start Writing
doorway · writing surface.
→ *Acceptance: **a writer forgets they are using software and begins writing.***

**Phase 2 — Surround the writing.** Keep · Questions · Research · Voice · Gather — ⛔ **not as
panels. As companions to the act of writing.**
→ *Acceptance: **the writer can bring life into the work without leaving the room.***

**Phase 3 — Return.** What changed · what remains alive · what wants attention.
→ *Acceptance: **returning feels like continuing a relationship, not reopening a file.***

**Phase 4 — Author Studio.** Structure · shaping · revision · editions · publishing. **This is where
the existing Book Studio work belongs.**

---

## 6. Completion assessment

| Area | Status |
|---|---:|
| Vision / design | 90% |
| Governance | 90% |
| Data substrate | 70% |
| Writing surface | 50% |
| **Writer's Field environment** | **20%** |
| Publishing pipeline | 70% |
| Integrated experience | 30% |

⛔ **The dangerous move would be declaring victory because the manuscript editor works.**

⭐⭐⭐ **The room you designed is not yet the room people enter.**

---

## 7. Next move

1. **Recover the four core artifacts** — Arrival · Your Work · Returning · Places & Gestures.
2. **Define the minimum living loop** — `Arrive → Work → Write → Keep → Return`.
3. **Build that loop into `/press/studio`.**

⛔ Do not keep patching the current Author Studio. That is the missing bridge between the research
and the product.

---

## Recorder's notes — measured, and where I would qualify the table

Verified by source inspection at deployed `f46a4fde4` during the 2026-08-05 session:

- ✅ Source immutability is **structural**: zero writers can `UPDATE`/`DELETE` `manuscript_sections`
  anywhere in the codebase.
- ✅ Exactly **three** writers to `manuscript_working_drafts` / `working_draft_revisions`, all
  authenticated and member-scoped. No fourth path.
- ✅ Revision history rewrite refused by DB trigger.
- ✅ `f24ea189e` — *"bring a kept passage into the working draft at the caret"* — **the design's
  "Bring in →" gesture already exists in code.**

Two qualifications I would put against §6, offered as measurement rather than disagreement:

1. ⚠️ **Phase 2 may be larger than "70% data substrate" implies.** The Field design names four kinds
   in the gathering rail — **KEEP · VOICE · QUESTION · RESEARCH**. I verified substrate for **Keep**
   only (`keeps`, `member_memory_atoms`, `keepSource()`). I found **no** verified substrate for
   Voice, Question, or Research as first-class kinds bound to a work. ⛔ Unverified, not disproven —
   candidates may exist under other names, which is the failure mode of this whole lane.
2. ⚠️ **"Publishing pipeline 70%" contains a live risk.** Book Studio's Canvas is a 52-line iframe
   over a 3,784-line static file in `public/`, persisting to **localStorage** — no canvas/project/
   page-block table exists in any migration. Its own header records *"Pending Phase C: move state
   from localStorage → database."* **Founder work presently exists in one browser profile only.**

**Blocking the next move:** the four artifacts are not readable from this environment. Three
surfaces attempted — `ctx_fetch_and_index` (page shell only), Claude-in-Chrome (extension not
connected), in-app browser (unauthenticated). They must be pasted, screenshotted, or the extension
connected.
