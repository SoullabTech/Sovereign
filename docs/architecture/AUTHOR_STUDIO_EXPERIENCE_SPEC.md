# Author's Studio — Experience Specification

> **Status: RATIFIED AND OPERATIVE, 2026-07-31 (Kelly).** This is the acceptance document
> for Author's Studio work. Ratified together with two governing rulings recorded in §4
> and §6 below: **Living Work as the governing Studio object**, and **the yield clause**.
>
> Ratifying act, in the founder's words:
>
> > *"Ratify the Author Studio Experience Specification as the operative acceptance
> > document for Studio work."*
>
> This ruling makes the document govern. It does not by itself authorize any specific
> merge or deploy; each remains its own explicit act.
>
> **Referent:** `origin/clean-main-no-secrets` @ `95bee3a03` — the commit deployed to
> production at the time of writing (`docker exec maia-sovereign printenv GIT_COMMIT`
> → `95bee3a03`). Every claim about what exists was read from that tree, not from the
> working checkout.

---

## 0. What this document is, and what it is not

It is **one document that a PR can be held against**. Until now the experience intent
lived in five places — none of which a reviewer could fail a PR against:

| Source | What it already settles | Standing |
| --- | --- | --- |
| `docs/canon/MEMBER_EXPERIENCE_DESIGN_CONSTITUTION_CANDIDATE_2026-07-31.md` | the golden rule, design responsibilities, failure modes | recorded, **not ratified**; yield clause open |
| `docs/canon/THE_MEMBERS_WORLD_IS_PRIMARY.md` | direction of attention; the yield boundary | candidate |
| `docs/architecture/STUDIO_PRODUCT_ROADMAP_2026-07-31.md` | the 10 stages and their order | founder-articulated, not ratified |
| `docs/architecture/STUDIO_COPY_VOICE_2026-07-31.md` | how the Studio speaks | founder-articulated |
| `docs/architecture/LIVING_WORK_ONTOLOGY_RATIFICATION_INSTRUMENT_2026-07-31.md` | what the Studio remains in relationship with | **awaiting the founder's explicit act** |

This spec **does not restate them and does not overrule them.** It converts them into
per-moment acceptance tests. Where they conflict, they win; where they are silent, this
spec states a testable default and marks it as a default.

**It is not:** a philosophy document, a screen inventory, a route map, or an authorization.

---

## 1. The acceptance question

Every Author's Studio PR is accepted or refused on one question:

> **Did this bring a creator closer to their work than they were before it merged?**

"Closer" is not a mood word. It decomposes into five observable properties, and a PR
must not regress any of them:

| Property | Observable as |
| --- | --- |
| **Proximity** | keystrokes/clicks between arriving and adding a word to the work |
| **Continuity** | on return, the work is where they left it — same place, same position, no re-orientation |
| **Quiet** | count of elements on screen that are *about the software* rather than *the work* |
| **Truthfulness** | every affordance shown does what it appears to do; nothing unbuilt looks like a door |
| **Reversibility** | every gesture that changes the work can be undone, and the original is preserved |

A PR that improves one by damaging another is **not** an improvement. Say so in the PR.

---

## 2. The five moments

Each moment has: the felt intent (one line), **acceptance tests** (falsifiable, walkable),
and **never** (things whose presence fails the moment regardless of test results).

### 2.1 Arriving — `/press/studio`

**Intent:** you are back in your room. Not a product, not a dashboard, not a menu.

**Acceptance tests**
- A1. On arrival with existing work, the work's own name is on screen before any feature name is.
- A2. There is exactly **one** obvious next action, and it is the one the creator most likely came for. Everything else is secondary in weight, not merely lower on the page.
- A3. Reaching the writing surface from arrival costs **one** deliberate action.
- A4. No unbuilt capability is presented as a door. (Currently enforced by `studioMap.ts`: `availability: 'later'` carries no `href`. This is the standard, not an implementation detail.)
- A5. With no work yet, the Studio offers the one real beginning, not a grid of greyed rooms.
- A6. Arrival never explains itself. No tour, no tips, no "welcome to".

**Never:** feature grids · counts of things · onboarding overlays · "Get started" · progress meters · anything that names the software before it names the work.

### 2.2 Writing — `/press/manuscript?tab=draft`

**Intent:** the room goes quiet and the text is the only lit thing.

**Acceptance tests**
- W1. While the cursor is in the text, nothing on screen moves, appears, animates, or changes state unless the creator caused it.
- W2. Saving is never a decision. There is no Save button and no unsaved-work anxiety; the save state is legible only when the creator looks for it.
- W3. A save failure is stated plainly, in place, **without removing the creator's words from the screen** and without a modal. (`page.tsx` already does this for list-refresh failure — that is the pattern.)
- W4. Measure, leading, and margins are set for reading prose, not for filling a viewport. Line length stays in the 60–75 character band at every breakpoint.
- W5. The creator can reach a state where nothing but their text is visible, and get there without hunting.
- W6. Every destructive or structural change (cut, merge, re-segment, replace) is reversible, and the imported Source is never mutated.
- W7. MAIA does not speak here unless invited. Silence is the default state and remains available permanently.

**Never:** word-count goals · streaks · writing scores · autocomplete of the creator's sentences · AI suggestions offered unprompted · anything that reads the text and reports a judgment about it.

### 2.3 Gathering — *(Roadmap stage 3; unbuilt)*

**Intent:** saying *this belongs with this work* is one gesture and needs no filing decision.

**Acceptance tests (for when it is authorized)**
- G1. Bringing something in is one gesture from wherever the creator already is. No upload page as a destination.
- G2. Nothing is auto-filed, auto-tagged, auto-titled, or auto-summarized on arrival.
- G3. What was brought in remains findable by what the creator called it, not by what the system inferred.
- G4. The source form is preserved (voice stays audio; a PDF stays a PDF) and is retrievable unchanged.

**Never:** folders as the primary structure · required metadata · AI categorization · "we noticed this relates to…".

### 2.4 Shaping — *(Roadmap stage 8; unbuilt)*

**Intent:** the creator sees their own material next to itself and moves it with their hands.

**Acceptance tests (for when it is authorized)**
- S1. Every arrangement is member-made. The system never proposes an order, cluster, or outline.
- S2. Moving a thing is direct manipulation, not a form.
- S3. Any arrangement can be abandoned without losing the material.
- S4. **No interpretation is displayed.** No themes, no similarity scores, no "these belong together". (This is the Roadmap's explicit *"No AI interpretation"* and the Manuscript Room's existing evidence-only line, generalized.)

### 2.5 Publishing — *(partially built: Export tab)*

**Intent:** completion, not export. The work leaves whole and the creator knows exactly what left.

**Acceptance tests**
- P1. Before producing anything, the creator can see precisely what will be included.
- P2. The output is the creator's work, unaltered in content by the act of producing it.
- P3. Publishing changes nothing about the working copy.
- P4. The moment is marked. Finishing something reads as finishing, not as a file download.

---

## 3. Standing properties — every screen, every PR

1. **The work is named before the software is.** Page titles, headers, and tabs say what the creator has, not what the system does.
2. **Nothing unbuilt is clickable.** A capability that does not exist renders as a fact, never as a hopeful link.
3. **Failure never asserts absence.** A load error must be visually distinct from "you have nothing". (This defect was found and fixed once; it is now a standing property.)
4. **Return lands where they left.** Not at a home screen, not on the first tab.
5. **The way out is always visible.** A working surface is somewhere you are, not somewhere you are stuck.
6. **One vocabulary.** A room is called the same thing in navigation, in the page title, and in the copy. Studio navigation is durable; tab names are local and may change beneath it.
7. **Copy follows `STUDIO_COPY_VOICE`.** The strongest rewrite is deletion; if the design says it, the copy must not.
8. **Moving deeper into the Studio increases intimacy without breaking continuity.**
   *(Ruled 2026-07-31, Kelly.)* The shell becomes **quieter as the creator moves inward —
   never absent**. A room that feels like a separate application is a **design defect**, not
   a styling preference. Stop optimizing rooms independently: every commit must improve the
   continuity of the house.
9. **Once inside the work, the room stops describing itself.** Software concepts —
   *Current Book · Working Draft · Source* — recede. The work already says what it is.
10. **No experiential decision from remembered research.** Design decisions cite a principle
    in `docs/research/CREATIVE_ENVIRONMENT_COMPARATIVE_STUDY.md` §4 by number, or they are
    marked as intuition and held. **Verify that a claimed corpus exists before building on
    it** — on 2026-07-31 we found the comparative study we had been reasoning from did not
    exist. Principles are cited by number; the applications are never cited as models.
11. **Espresso Press identity is continuous.** Crossing from Layer 2 to Layer 3 must not feel like changing products. (Palette is currently duplicated across three files — see the gap list.)

---

## 4. The yield clause — RULED 2026-07-31 (Kelly)

> **Ratified:** The environment yields to the member's work except where a surface must
> visibly hold consent, refusal, safety, Sanctuary state, security, provenance, or another
> constitutional boundary. At those boundaries, necessary visibility is not considered
> experiential failure. The boundary must still be expressed with the least intrusion
> consistent with its purpose.

**How this is applied in review.** A boundary surface is exempt from §1 *quiet* and from
the golden rule — but only for what its purpose requires. Two tests, both must pass:

- **Y1 — Necessity.** The attention it takes is what the boundary needs, not what the
  design found convenient. Decoration, repetition, and reassurance are not boundary work.
- **Y2 — Least intrusion.** Among expressions that hold the boundary equally well, the
  quietest one is required.

**No PR may cite "the environment should disappear" to reduce the visibility of a consent,
refusal, Sanctuary, provenance, or security surface.** Conversely, no PR may cite this
clause to justify attention a boundary does not require.

---

## 5. How a PR is reviewed against this document

Three lines in the PR body. Nothing longer:

1. **Moment** — which of §2 this touches.
2. **Tests** — which acceptance tests it satisfies, and which (if any) it knowingly leaves failing.
3. **Regression** — which of the five §1 properties it moves, in which direction.

A PR that satisfies its ticket and moves no §1 property is **complete but not progress**,
and must say so in those words. That sentence is the point of this document.

---

## 6. The governing object — RULED 2026-07-31 (Kelly)

> **Ratified:** The governing object of the Studio is a **Living Work**.
>
> A Living Work is a member-authored body of material, inquiry, decisions, relationships,
> and expressions that may precede any particular form and may give rise to multiple forms
> over time.
>
> A manuscript, workbook, manual, course, program, retreat, framework, publication, or
> other artifact is an **expression** of a Living Work, not the governing ontology.
>
> The Studio must therefore allow a creator to begin with material, inquiry, conversation,
> fragments, or an existing artifact **without requiring a manuscript as the universal
> entrance**.
>
> This ruling authorizes architectural and implementation work necessary to establish the
> Living Work as the Studio's governing object. It **does not** authorize AI interpretation,
> automatic organization, or autonomous decisions about the creator's work.

**What this changes about the acceptance tests.** Two consequences bind immediately:

- **L1 — No universal manuscript entrance.** Arrival (§2.1) fails if the only way in is
  importing or starting a manuscript. A creator holding fragments, a question, or a
  recorded conversation must have a real door.
- **L2 — Expression, not identity.** No surface may state or imply that the creator's work
  *is* a manuscript. "Current Book" names one expression; the governing object is the work.

**The work is an identity, not a container that owns its contents' existence.**
*(Recorded 2026-07-31 — Kelly's sentence, elevated into the ontology because it decides
more than it looks like it does.)* Everything follows from it:

- Deleting a work **never** destroys its expressions.
- Expressions can **move** between works.
- Relationships are **declared**, never structural side effects.
- Attachment is **reversible**.

An ownership model would have given us none of these, and the foreign key alone does not
imply them.

**Identity and recognition are different moments.** A work exists when the creator declares
it; it is named when the creator knows what it is. Sometimes that is the same minute and
sometimes it is months — *"there is something I've been circling"* is a Living Work. The
system never invents the name and never demands it early. A title is required before
publication or sharing, not before existence — **recorded, not ruled**; that boundary
belongs to the publication surface when it is built.

> ⚠️ **Reconciliation note — authorization scope (2026-08-01).** A second instrument reached
> canonical the same day: `docs/architecture/LIVING_WORK_ONTOLOGY_RATIFICATION_INSTRUMENT_2026-07-31.md`
> (via PR #853), recording the same founder ratification but stating that it authorized
> **"no schema, implementation, branch merge, or deployment."** The ruling quoted above,
> given in this session, states that it authorizes implementation work.
>
> **The instrument governs authorization scope.** Neither text is edited here — a
> constitutional record should be the hardest thing in the repository to rewrite, and both
> are faithful transcriptions of what was said. But where they differ, the narrower reading
> holds: **the ontology ruling establishes what the Studio is in relationship with, and
> authorizes nothing buildable.** Every table, route, and gesture is a separate, later,
> explicitly authorized act.
>
> Consequence, already applied: the `living_works` migration was **removed from PR #854**
> and awaits its own implementation authorization, to arrive together with the member
> declaration gesture. A **Studio governance convergence** — inventory every constitutional
> Studio document, name overlaps and contradictions, establish one canonical lineage,
> supersede duplicates explicitly — is required before Stage 2 proceeds.

**Stage 2 is not "the Living Work becomes a record."** Framed that way, it reads as tables
and the schema starts defining the experience. It is:

> **The Studio's identity moves from the artifact to the work.**

One sentence is the whole acceptance test:

> **When I return to the Studio, I return to my work — not to one artifact.**

Everything else is a consequence, and the consequences have an order:

1. The Studio **recognizes the work** — member-named, never inferred (D‑03).
2. The **work owns expressions**.
3. **Current focus** belongs to the work, not to a file.
4. **Manuscripts become one expression** — existing ones attach, unchanged.
5. **Gatherings become another.**
6. **Shape** operates across expressions.
7. **Release** operates from expressions.

Build in that order. Starting from multiple expression types instead of from recognition
produces a type system where an identity belongs.

**Migration constraint, from the same ruling.** Existing Source and Working Draft integrity
is preserved. Manuscript concepts migrate into expressions of a Living Work; nothing
already imported is re-interpreted, re-segmented, or re-titled by the migration.

**Still open (a reading, not a ruling):** ***creator* vs *member*** — used here as the
Constitution uses them. **Who the Studio is for** is settled in the access matrix, not here.
