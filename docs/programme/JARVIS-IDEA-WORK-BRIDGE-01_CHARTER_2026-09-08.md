# JARVIS-IDEA-WORK-BRIDGE-01

## `REFLECTIONS ↔ LIVING WORKS — CREATIVE PROVENANCE`

> **Lane widened by founder act, 2026-09-08, before CONSTITUTE.** Formerly
> `IDEAS → WRITER'S STUDIO — EMERGENCE TO EXPRESSION`. **Same lane, widened scope** — not a
> new lane, not a split. The lane ID is retained unchanged so every prior finding, ruling
> and reference stays addressable; only its title and scope move. §§1–3 below are the
> **original charter, preserved verbatim as the narrower reading**. They were true when
> recorded and remain true of the Idea case. **§9 is the amendment and governs.**

**Opened**: 2026-09-08, founder act. **Widened**: 2026-09-08, same day, founder act.
**Branch**: `claude/jarvis-flow-architecture-w2gont`
**Standing**: see §9.7.

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

---

# 9. AMENDMENT — LANE WIDENED *(founder act, 2026-09-08, before CONSTITUTE)*

**This section governs.** §§1–8 are preserved as the narrower reading and remain true of
the Idea case.

## 9.1 Why the lane widened

The Idea → Work census exposed the underlying problem, but Idea → Work is **one instance of
a broader creative relationship**. Writer's Studio should be able to draw inspiration and
material from the member's wider **Reflections field** — at minimum Journal, Keeps, Ideas,
Changes, Decisions. Widened now rather than after DESIGN, because otherwise the Idea case
ships and the ontology immediately reopens for the other four.

**Not scope creep — scope correction.** The lane's jurisdiction is unchanged: it owns the
*relationship*, never the objects.

### Governing topology

```
                 REFLECTIONS
        ┌────────────┼─────────────┐
     Journal       Keeps        Ideas
     Changes      Decisions       ...
        └────────────┼─────────────┘
                     ↓
              LIVING WORK
                     ↓
             one or many FORMS
```

And, because a Work may draw from many Reflections over years while any Reflection may
inspire many Works, the true shape is:

```
MANY REFLECTIONS  ↔  MANY LIVING WORKS  →  MANY FORMS
```

Governing vision: **`docs/design/author-studio/WRITERS_STUDIO_PRODUCT_THESIS_2026-09-08.md`**
(EXPLORE → DISCOVER → DEVELOP → CREATE → OFFER). Owned by Writer's Studio R&D; **cited
here, never amended here.**

> **Writer's Studio should organize a creative life, not just files.**

## 9.2 Founder law *(recorded as given)*

Do not collapse the Reflection types into a generic content bucket. Their distinctions
carry meaning and should remain visible.

1. A Reflection remains independently existent when associated with a Work.
2. Nothing is moved, consumed, converted, or silently copied into a Work.
3. One Reflection may contribute to many Works.
4. One Work may draw from many Reflections.
5. One Work may give rise to many Forms.
6. Reflection type and provenance are preserved.
7. *"Originated from," "inspired by," "contributes to,"* and similar relationships **must
   not be collapsed without ontological justification.**
8. Association with a Work remains a **member authorship act**; MAIA may surface possible
   connections but **may not silently establish them.**
9. Writer's Studio should eventually be capable of presenting the **creative genealogy** of
   a Work: the Reflections, Ideas, experiences, Changes, Keeps, and Decisions from which it
   has developed.
10. **Reflections remain valuable even when they never become part of a Work.**

**R-01 preserved unchanged**: Idea = generative possibility · Living Work = undertaken
creative continuity · Form = expression arising from a Work. An Idea may hold the special
provenance relation *"gave rise to this Work"* — but **Ideas are not the only source from
which a Work may develop.**

## 9.3 RECOVER — the Reflections field as implemented

| Founder's type | Substrate found | State |
|---|---|---|
| **Journal** | `/journal`, `/journal/room`; `quick_journal` (`20260102000000`), `elemental_journal` (`20260104000002`), chart integration (`20260109000001`) | live, **multiple substrates** |
| **Keeps** | (a) `reflection_capsules` via `/api/capsules` — the member's Keeps behind `/reflections`; (b) manuscript keeps — marked passages, `/api/sovereign/keeps` | live, **two different objects** |
| **Ideas** | `member_ideas` + `member_idea_blocks` | live, censused §2 |
| **Changes** | (a) `member_idea_blocks.block_type='change'`; (b) `studio_changes` (`20260212000001`, practitioner) | **not a first-class member object** |
| **Decisions** | (a) `member_idea_blocks.block_type='decision'`; (b) `studio_decisions` (`20260208000002`, practitioner) | **not a first-class member object** |
| *(also)* | `member_reflections` (`20260721000001`) — Developmental Reflection Experience, `/maia/reflection` | live, **a sixth thing that owns the word** |

## 9.4 RECONCILE — findings exposed by the expansion

### 🔴 F-09 — THE REFLECTIONS FIELD DOES NOT EXIST AS A CONTAINER.

There is no object, table, route, or surface that groups Journal · Keeps · Ideas · Changes
· Decisions. The founder's "Reflections field" is a **true description of the member's
creative reservoir and an unimplemented one**. Five separately-authored substrates, no
common address, no common identity, no common grammar.

This is not an argument against the model. It is the statement of what building it costs:
**the bridge cannot reference "a Reflection" until something can name one.**

### 🔴 F-10 — "REFLECTION" ALREADY DENOTES AT LEAST THREE DIFFERENT THINGS.

1. **`/reflections`** — the capsules feed. Founder-ruled 2026-09-04, *"the only address they
   have"*, moved out of Lab Tools deliberately (`app/labtools/reflections/` deleted, ⛔ do
   not reintroduce).
2. **`member_reflections` / `/maia/reflection`** — the Developmental Reflection Experience:
   a six-question seasonal mirror, verbatim, no scoring, no categories *by design*.
3. **`idea_block_maia_reflection`** — MAIA's reflection *on* an Idea block. Plus
   `pattern_reflections`, `mentor_reflections`, studio encounter reflections.

**This is the Circles "Commons" finding repeating exactly** (*"Commons denotes THREE
different existing things and NONE matches ratified FR-02"*). Adopting "Reflection" as the
bridge's source term without ruling which one it means would inherit all three.

### 🔴 F-11 — CHANGES AND DECISIONS ARE NOT OBJECTS. THEY ARE ROWS INSIDE AN IDEA.

`member_idea_blocks.block_type IN ('note','decision','change')` — a Decision **exists only
as a child of an Idea** and cannot exist without one. There is no free-standing member
Decision or Change.

So founder law 6 — *Reflection type and provenance are preserved* — **cannot be satisfied
today for two of the five named types**, because:

- *"this Decision contributes to this Work"* has no addressable subject; the closest true
  statement is *"this block, inside that Idea, contributes"*;
- promoting Decisions and Changes to first-class Reflections is **an Ideas R&D ontology
  change**, not this lane's, per the anti-drift test.

The `member_ideas` migration header anticipated exactly this: *"those systems are not
unified with this one — that's a future bridge, not a present concern."*

**F-11 is the finding that bounds what CONSTITUTE can close today.**

### 🔴 F-12 — "KEEP" DENOTES TWO OBJECTS, AND ONLY ONE IS A REFLECTION.

(a) **Capsules** — the member's Keeps at `/reflections`. (b) **Manuscript keeps** — marked
verbatim passages *inside the member's own manuscripts*, whose route doctrine is explicit:
it *"ORDERS but never SELECTS"*, is *"NOT a search endpoint and not a text corpus."*

A manuscript keep is a mark **inside a Work's own expression** — downstream of a Work, not a
source feeding one. Admitting both under one name would let Studio output re-enter as
Studio input and quietly close a loop nobody authorized.

### 🔴 F-13 — SOME "REFLECTIONS" ARE MAIA'S WORDS, NOT THE MEMBER'S.

`reflection_capsules`, by its own header: *"MAIA witnesses experience and remembers what
mattered. Capsules are **distilled** artifacts"* — carrying summary, gold lines, practices,
decisions, next steps, patterns.

So the feed the member reads as *their* Reflections is **partly MAIA's distillation of their
words**. A creative genealogy that does not distinguish *the member's words* from *MAIA's
distillation of the member's words* would credit the writer with MAIA's summaries — making
MAIA, invisibly and in part, **the hidden source of the person's voice**, which the Product
Thesis names as the thing it must never be.

Compare the Circles precedent, where system-created affinities were **barred absolutely** as
a substrate for member-declared interest (FR-06). The same discipline applies: **a
system-distilled artifact may not cross into a Work as member material without saying what
it is.**

⛔ This does **not** mean capsules are barred. It means **authorship provenance is a
required field of the crossing**, not an optional one. → **RB-16**.

### ⚠️ F-14 — THE MOVEMENT MUST NOT BECOME A STAGE COLUMN.

EXPLORE → DISCOVER → DEVELOP → CREATE → OFFER is a description of creative life across many
Works. `living_works.stage` (capturing → developing → writing → refining → sharing) is a
member-set orientation on **one** Work, whose ratified header says *"Orientation, never
progress … the system never advances it."* Different lists, different questions; DISCOVER
has no `stage` counterpart. **Do not reconcile them into one ladder.** Detail:
Product Thesis §N-1. → **RB-17**.

### ✅ F-15 — REACHABILITY PRECEDENT EXISTS, AND IT IS GOOD.

`app/maia/useStudioHandoff.ts` (WS2-03C) already carries one Work from Studio → MAIA by URL
and **refuses to take that URL's word for anything**: the id is a claim, verified against
the member's own declared works; unresolved fails visibly rather than degrading into "some
other work". That is the correct shape for bridge reachability in the other direction, and
the lane should follow it rather than invent one.

## 9.5 New questions

| # | Question | Owner |
|---|---|---|
| **O-05** | What is a Reflection? Which of the three existing senses (F-10) does the bridge mean, and does the field need a name of its own to avoid inheriting all three? | **founder** — blocking |
| **O-06** | Are Changes and Decisions promoted to first-class member Reflections, or addressed as Idea blocks (F-11)? | **Ideas R&D** — blocking for those two types |
| **O-07** | Which Journal substrate is *the* Journal (quick / elemental / chart-integrated)? | Journal owner |
| **O-08** | Are manuscript keeps admissible sources at all, or only capsule-Keeps (F-12)? | **founder** |
| **O-09** | How is authorship provenance (member-authored vs MAIA-distilled) represented on a crossing (F-13)? | **this lane**, at DESIGN |
| **O-10** | Does the distinction between *originated from* / *inspired by* / *contributes to* apply to all source types, or is *originated from* reserved to Ideas per R-01? | **this lane**, at CONSTITUTE |

## 9.6 New falsifiers *(extending B-01..B-14, §6 + CONSTITUTE)*

| # | Obligation |
|---|---|
| **RB-15** | **Type survives the crossing.** A Journal entry associated with a Work is still legible as a Journal entry, a Decision as a Decision. No crossing writes a generic `material_type='reflection'`. |
| **⭐ RB-16** | **Authorship provenance is carried.** Every crossing states whether the source is member-authored or system-distilled (F-13). A capsule crossing as though it were the member's own words **fails**. |
| **⭐ RB-17** | **No ladder.** No surface presents EXPLORE→DISCOVER→DEVELOP→CREATE→OFFER as a member state, progress indicator, or advanceable phase, and nothing writes `living_works.stage` on the member's behalf (F-14). |
| **RB-18** | **Surfaced ≠ established.** A MAIA-surfaced possible connection creates no relation until a member act. Dismissing one leaves no residue and does not suppress the Reflection elsewhere. |
| **RB-19** | **Zero is a valid count, for every type.** No Reflections surface presents Work-contribution as progress, completion, or achievement. Founder law 10, made falsifiable. |
| **RB-20** | **No return loop.** Nothing produced inside a Work re-enters that Work as a source (F-12). |
| **RB-21** | **Relations do not collapse.** *Originated from*, *inspired by*, and *contributes to* remain distinguishable in storage and in presentation; none is derived from another. Founder law 7. |

**RB-16 is the new drift falsifier.** An implementation that carries content faithfully and
drops authorship passes RB-15 and every earlier obligation, and fails RB-16 — and the
failure is invisible in the product exactly where it matters most.

## 9.7 Standing

```
LANE           WIDENED — REFLECTIONS ↔ LIVING WORKS — CREATIVE PROVENANCE
R-01           CLOSED — preserved unchanged under the wider model
R-02           CLOSED — origination is a third relation, not a material
FOUNDER LAW    RECORDED — ten clauses, §9.2
PRODUCT THESIS RECORDED under Writer's Studio R&D, cited not owned

RECOVER        COMPLETE for all five named types (read-only)
RECONCILE      COMPLETE — F-09..F-15
CONSTITUTE     PARTIALLY UNBLOCKED — see CONSTITUTE §7 verdict
DESIGN         NOT OPENED
STOP           founder witness owed

O-05, O-06, O-08 blocking · O-07 · O-09, O-10 to this lane
no schema change · no migration · no route added or removed · no UI · no deploy
from-idea drift instance UNTOUCHED by direction
Writer's Studio capability lane cited, NOT reopened
```
