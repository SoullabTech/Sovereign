# JARVIS-IDEA-WORK-BRIDGE-01

## `IDEAS → WRITER'S STUDIO — EMERGENCE TO EXPRESSION`

**Opened**: 2026-09-08, founder act.
**Branch**: `claude/jarvis-flow-architecture-w2gont`
**Standing**: RECOVER complete · RECONCILE complete · **CONSTITUTE BLOCKED on R-01** ·
DESIGN not opened · PROVE not opened · no build · no migration · no deploy.

---

## 1. Why this is a lane and not a feature

> ```
> IDEAS                       WRITER'S STUDIO
> emergence                   expression
> living Idea                 developing Work
>       \                       /
>        \                     /
>         IDEA → WORK BRIDGE
> ```

It sits between two already-meaningful domains. Placed inside Writer's Studio, Studio
quietly becomes the authority over what an Idea is and what may happen to it. Placed
inside Ideas, Ideas determines what a Studio Work is. Both are the wrong ownership
direction.

### Authority rule

> **This lane owns the relationship between Idea and Work. It does not own either object.**

| Domain | Owns |
|---|---|
| **IDEAS R&D** | what an Idea is · how Ideas evolve · Idea history / memory / decisions |
| **WRITER'S STUDIO R&D** | what a Work is · authorship · Materials · development / writing |
| **BRIDGE LANE (this)** | the member threshold act · Idea → Work provenance · one Idea → many Works · what may cross · what may not cross · no-consumption / no-silent-sync rules · reachability between the two places |

### Hard anti-drift test

> **If a proposed bridge change requires redefining Idea or Work, STOP and return the
> question to the domain that owns that object.**

### The rule most likely to be lost

> **The bridge may create relationship and provenance. It may not collapse Idea and Work
> into one object.**

Recorded here because the pressure arrives later, phrased as convenience: *"it would be
simpler if we just converted the Idea."*

### Inheritance boundary

This lane **cites** the Writer's Studio governing R&D. It does **not** reopen the current
Writer's Studio capability lane (WS2-08, open; 08B held pending an explicit founder act)
and does not inherit its pending acceptance work.

### Research posture

No broad external best-practices research. This is an internal architecture question and
the core doctrine is already held. The flow may later call for a **bounded research act
against a specific named unresolved question**. External research may inform interaction
detail. It may never redefine what an Idea or a Work is.

---

## 2. RECOVER — what already exists

Read-only census, 2026-09-08.

### Ideas (implemented)

| Artifact | State |
|---|---|
| `database/migrations/20260409000001_member_ideas.sql` | `member_ideas` (title · framing · status `active/parked/integrated` · tags · `last_entered_at` · `last_decision_at`) + `member_idea_blocks` (`note/decision/change` · content · `metadata` jsonb) |
| `20260422000001_idea_block_maia_reflection.sql` · `..._member_idea_recognition_events.sql` | MAIA reflection + recognition events on blocks |
| `app/maia/ideas/page.tsx` · `app/maia/ideas/[id]/page.tsx` | the Idea workspace — "single-idea continuity field" |
| `app/api/ideas/*` | list · capture · get/patch · touch · blocks CRUD · ask-maia |

Declared intent, from the migration header: *"a container for staying with one idea over
time — iterations, decisions, and changes."* Explicitly: no lifecycle state machine, **no
parent/child lineage**, and — verbatim — *"those systems are not unified with this one —
that's a future bridge, not a present concern."* **This lane is that future bridge, named
at the moment the Idea object was authored.**

### Writer's Studio (implemented)

| Artifact | State |
|---|---|
| `20260801000001_living_works.sql` | `living_works` (member-authored `title` · `purpose`) + `living_work_expressions` (`expression_type` open TEXT · `expression_id` · `declared_by` NOT NULL · `declared_at`) — ratified 2026-08-01 |
| `20260805000001_living_work_form_stage.sql` | `form` free text · `stage` ∈ capturing/developing/writing/refining/sharing |
| `20260805000001_living_work_materials.sql` | `living_work_materials` — the **belonging** record |
| `20260828000001_living_work_material_considerations.sql` | considerations on materials |
| `app/api/sovereign/living-works/*` · `app/writers-studio/*` · `lib/writersStudio/*` | Work Home, canvas, drawer, situation, delete |
| `lib/livingWork/domain.ts` | `NEVER_AUTHORED_BY_THE_SYSTEM = [title, purpose, type, theme, summary, status, phase, relationships]` + *a Living Work is never created on a member's behalf* |

---

## 3. RECONCILE — findings

### 🔴 F-01 — THE THREE-OBJECT PROBLEM. *(blocks CONSTITUTE)*

The contract says IDEA → WORK. The repository has **three** candidate objects:
`member_ideas`, `living_works`, `member_manuscripts`.

The ratified Living Work ontology reads:

> *"a member-authored body of material, inquiry, decisions, and expressions that **may
> exist before any single form and may give rise to many forms over time**."*

That is very nearly the founder's definition of an **Idea**:

> *"An Idea may give rise to one or many Works without being consumed by any of them."*

**Two objects currently claim the same ontological position** — the thing that precedes
form and gives rise to many forms. A bridge built before this is settled will either
duplicate the pre-form object or silently demote one of them.

Three candidate readings, **none adopted here**:

- **(a) Idea → Living Work.** The threshold creates a Living Work. Cost: two pre-form
  objects, and the member must maintain both.
- **(b) Idea → Expression (manuscript) directly.** Cost: skips the Studio's ratified
  governing object.
- **(c) Idea remains upstream; the Living Work is the Work; the Idea is declared as an
  origin of it.** Most consistent with the grammar already ratified (§F-03) — but it makes
  "Work" mean Living Work, which is a statement about what a Work is.

**Returned to the founder as R-01.** This lane may pose the question — the endpoints of a
relationship are its business — but it may not answer it, because every answer says
something about what an Idea or a Work *is*. Per the anti-drift test: STOP.

### 🔴 F-02 — A BRIDGE ALREADY EXISTS, AND IT IS THE DRIFT.

`POST /api/book-studio/drafts/from-idea` (+ `components/maia/MoveToStudioButton.tsx`).

Against the founder's starting contract it fails on nearly every clause:

| Clause | Actual behaviour |
|---|---|
| NO CONSUMPTION | Verb is **"Move to Studio"**. *Move* is the consumption verb. |
| what may cross | Takes `content` **wholesale from the client** — the exact "copy the entire Idea into a manuscript" failure the founder named. |
| WORK | Writes a **markdown file to the repo filesystem** (`docs/book-studio/drafts/<slug>.md`). No Work row. No `living_works`. No `member_manuscripts`. |
| RELATIONSHIP | Provenance is a **prose line inside the markdown body** (`Idea ID: …`). Not queryable, not enforceable, not a relation. |
| MEMBER ACT | **No authentication whatsoever.** `getMemberIdFromRequest` is never called. There is no member, so there is no member act — and an unauthenticated route writes files to disk. |

`MoveToStudioButton` has **zero call sites** — it is orphaned; the route is reachable only
by direct POST. **Do not repair it inside this lane.** It is recorded as the drift instance
the lane exists to replace, and its disposition (retire / 410 / delete) is a **founder act**
at STOP. The unauthenticated write is separately notable on its own merits.

### ⭐ F-03 — THE NO-CONSUMPTION SUBSTRATE ALREADY EXISTS AND IS RATIFIED.

`living_work_materials`, from its own header:

> *"A material is a **BELONGING**, not a thing: a row here is a member's declaration that a
> thing FEEDS a Living Work; the thing itself **keeps its home — nothing is copied, moved,
> or altered**; removing a row removes the relationship, **never the thing**; belonging is
> many-to-many and re-declarable — one thing may feed several works, each by its own
> declaration, declared late or never."*

That is **NO CONSUMPTION**, **ONE → MANY**, and **MEMBER ACT** already made structural —
with `declared_by` NOT NULL, `declared_at`, and a member-authored `relationship_sentence`
that is *optional by design* (an unwritten sentence is a correct state, never a gap).

**But the same design explicitly refused to collapse grammars** — *"one grammar for the
relationship, not one table for everything"*:

- `living_work_expressions` — **is a form of**
- `living_work_materials` — **feeds**

**"Gave rise to" is arguably a third grammar.** Whether Idea-origin is a material
declaration, an expression declaration, or a distinct relation is a genuine CONSTITUTE
question **this lane owns** — provenance is its jurisdiction. It is answerable only after
R-01.

### ⚠️ F-04 — THE ONTOLOGY IS OPEN; THE GATE IS CLOSED.

`memberOwnsMaterial()` in `app/api/sovereign/living-works/[id]/materials/route.ts:47` admits
`'manuscript'` only and returns `false` for everything else, with the comment: *"Openness of
the ontology is not openness of this gate: a type this route cannot verify is refused rather
than trusted."*

So `material_type = 'idea'` is **refused today**. Reuse is a small, in-domain addition (an
idea-ownership branch), not a new substrate — **but it is a Writer's Studio change**, and
therefore not this lane's to make unilaterally.

### ⚠️ F-05 — FORM: PARTIAL COLLISION.

The founder's contract offers `paper / essay / book / talk / workshop / teaching / other`,
*may remain undecided*. Ratified schema: `living_works.form` is **free text, NULL-able, no
CHECK**, and the header states it is *"the member's own word … never a system taxonomy"*.

- *May remain undecided* — **agrees** (NULL is a legitimate permanent state, not a gap).
- The **enumeration** — **collides**. Encoding that list as a constraint would author a
  taxonomy the Studio has already refused.

**Recommendation, not a ruling**: the seven forms are **offered wording**, never a CHECK and
never stored as a closed set. **Returned to Writer's Studio R&D** — it owns what a Work is.

### ℹ️ F-06 — PRECEDENT BORROWED, RELATIONSHIP NEVER BUILT.

`lib/manuscript/types.ts` cites `member_idea_blocks` as a **design precedent** (the
`block_type` discriminator, the `metadata` jsonb pattern). It is a citation, not a data
relationship. The two domains have shaped each other structurally while remaining unjoined.

---

## 4. CONSTITUTE — the contract *(candidate; not ratified)*

Founder's starting contract, carried forward verbatim as the lane's spine:

```text
IDEA → WORK BRIDGE

IDEA               remains the canonical evolving Idea
WORK               is a distinct expression developing from that Idea
RELATIONSHIP       Work records provenance back to the originating Idea
MEMBER ACT         only the member initiates "Develop in Writer's Studio"
NO CONSUMPTION     creating a Work does not close, replace, move, or convert the Idea
NO SILENT SYNC     later changes to the Idea do not silently alter the Work
NO SILENT BACKFLOW Studio changes do not rewrite the Idea
ONE → MANY         one Idea may give rise to multiple Works
FORM               paper / essay / book / talk / workshop / teaching / other
                   may remain undecided when the Work is created
```

### The threshold: what crosses

```text
ALWAYS CARRIED AS PROVENANCE      NOT AUTOMATICALLY COPIED
  Idea identity                     entire conversation history
  Idea title                        all Idea iterations
  origin relationship               everything MAIA ever said
                                    future Idea changes
AVAILABLE TO BRING
  current framing
  central question
  selected reflections
  selected decisions
  selected sources/materials
```

**AVAILABLE TO BRING is a member selection, never a default-all.** The distinction between
*referenced* and *explicitly brought across* is the lane's central design work.

### Open, blocking

- **R-01** — F-01. Which object is the Work? *(founder)*
- **R-02** — F-03. Is origin a material, an expression, or a third relation? *(this lane, after R-01)*
- **R-03** — F-05. Form wording vs. taxonomy. *(Writer's Studio R&D)*
- **R-04** — F-02. Disposition of `from-idea` + `MoveToStudioButton`. *(founder, at STOP)*

---

## 5. DESIGN — not opened

Opens on R-01. Scope when it opens: **the smallest threshold experience**.

> **Develop this in Writer's Studio**
> *Start shaping an expression from this Idea. The Idea stays here and remains connected.*

Possibly a lightweight choice about what to bring. **Not a bureaucratic import wizard.**

---

## 6. PROVE — named obligations *(candidate falsifiers, not runnable until DESIGN)*

Per FR-14 discipline: the named set is the law; the count is descriptive.

| # | Obligation |
|---|---|
| **B-01** | **Idea survives.** After the threshold act the Idea row is unchanged — not closed, not `integrated`, not archived, not moved. Asserted on the row, not on the absence of an error. |
| **B-02** | **Work is created separately.** A distinct Work object exists, with its own identity and its own lifecycle. |
| **B-03** | **Origin is visible.** Provenance is a queryable relation carrying Idea identity + title — never prose inside a body. |
| **B-04** | **Selected material crosses with provenance.** What the member chose is present in the Work and attributed to its Idea origin. |
| **B-05** | **Unselected material does not cross.** Conversation history, all iterations, and MAIA's reflections are absent unless explicitly selected. |
| **B-06** | **NO SILENT SYNC.** A subsequent edit to the Idea leaves the Work byte-identical. |
| **B-07** | **NO SILENT BACKFLOW.** A subsequent edit in the Studio leaves the Idea byte-identical. |
| **B-08** | **ONE → MANY.** A second threshold act on the same Idea yields a second, independent Work; the first is untouched. |
| **B-09** | **MEMBER ACT.** No system path — no import, no inference, no side effect of any other act — creates the relationship. `declared_by` is always a member. |
| **B-10** | **NO COLLAPSE.** Deleting the Work leaves the Idea intact; deleting the Idea does not silently delete the Work. The relationship is severable from both ends without destroying either object. |
| **B-11** | **FORM may be undecided.** A Work created with no stated form is a correct, permanently valid state. |

**B-10 is the falsifier that catches the drift this lane exists to prevent.** A future
"simplification" that converts the Idea into the Work passes B-01 through B-09 by
construction and **fails B-10**.

---

## 7. STOP

Founder witness before any wider build or deploy. Nothing in this lane authorizes a
migration, a route, a UI surface, a deploy, or the retirement of the existing `from-idea`
path.

---

## 8. Standing

```
RECOVER        COMPLETE (read-only)
RECONCILE      COMPLETE — F-01..F-06
CONSTITUTE     BLOCKED on R-01 (founder)
DESIGN         NOT OPENED
PROVE          NOT OPENED — B-01..B-11 candidate
STOP           founder witness owed

no schema change · no migration authored · no route added or removed
no UI built · no deploy · Writer's Studio capability lane NOT reopened
from-idea drift instance RECORDED, deliberately NOT repaired
```
