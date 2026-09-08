# JARVIS-IDEA-WORK-BRIDGE-01 — CONSTITUTE

## `REFLECTIONS ↔ LIVING WORKS — CREATIVE PROVENANCE`

**R-01 CLOSED** by founder ruling, 2026-09-08. **R-02 directed** in the same act. **Lane
widened** by founder act later the same day, before this document was committed — see
charter §9.

> **Reading order.** §§1–6 constitute the law for the **Idea case**, which the founder ruled
> in full and which is unchanged by the widening. **§7 is the verdict under the wider
> model** and states exactly what is unblocked and what is not. Where §§1–6 say *Idea*, the
> wider law generalizes to *Reflection* **except** where R-01 reserves something to Ideas —
> §7.2 marks every such clause.

---

## 1. R-01 — FOUNDER RULING *(recorded as given)*

> **IDEA ≠ LIVING WORK.**
>
> **An Idea is a generative possibility.** It may be explored, questioned, expanded,
> combined with other ideas, left dormant, abandoned, revisited, or never made into
> anything at all. Its existence does not imply that the member has undertaken a creative
> work.
>
> **A Living Work is a persistent creative undertaking.** It begins when the member chooses
> to establish something they intend to develop through time. A Living Work may exist
> before its eventual form is known and may later give rise to one or many forms.
>
> Therefore, **lack of form does not distinguish Ideas from Living Works.** The
> distinguishing act is **undertaking**:
>
> ```
> IDEA          — possibility
> LIVING WORK   — undertaken creative continuity
> FORM          — an expression arising from that Work
> ```
>
> An Idea may contribute to no Works, one Work, or many Works.
>
> Creating a Living Work from an Idea **MUST NOT consume, move, rename, or convert the
> Idea**. The Idea remains independently existent.
>
> The member act is closer to **"Begin a Work from this Idea"** than **"Move to Studio"**.
> That act creates a new Living Work and preserves a provenance relationship to the
> originating Idea.
>
> **No system inference may silently promote an Idea into a Living Work.** Establishing
> the Work is an authorship act belonging to the member.

### How this dissolves F-01

The census found that both objects can exist before form, and read that as a collision. It
was not one. **Form was the wrong discriminator.** Both objects legitimately precede form;
what separates them is whether the member has *undertaken* anything. The August ontology's
*"may exist before any single form"* describes a Living Work's **freedom from form**, not
its **position before form** — and an Idea's formlessness is of a different kind entirely,
because an Idea is under no obligation to become anything.

**The three objects resolve to three layers, not three competitors for two roles:**

| Layer | Object | The member's relation to it |
|---|---|---|
| **Possibility** | `member_ideas` | *I am staying with this.* No commitment implied. |
| **Undertaking** | `living_works` | *I am developing this through time.* |
| **Form** | `living_work_expressions` → manuscripts, &c. | *This is one way it is being expressed.* |

### Not a pipeline — a generative ecology

> An Idea can remain an Idea forever. Several Ideas can converge into a Work. One Idea can
> awaken several Works. A Work can remain formless for months and ultimately express itself
> as a paper, book, teaching, poem, course, talk, or several of those.

This is the governing shape, and it is **load-bearing for what the Ideas space is for**:
MAIA can help someone stay with an idea **without prematurely turning it into a production
task**. A pipeline reading — Idea *becomes* Work *becomes* Form — reintroduces exactly the
productivity gravity the Ideas space exists to refuse. Every clause below serves that.

---

## 2. R-02 — DIRECTED, and adjudicated

> Do not collapse *"gave rise to"* into *"feeds."* They describe different relations:
>
> - **gave rise to / originated from** = provenance of the Work's establishment
> - **feeds / belongs as material** = ongoing creative contribution
>
> An originating Idea may subsequently also feed the Work, but provenance and material
> membership are not the same assertion. The implementation should preserve that
> distinction rather than overloading `living_work_materials`.

**R-02 CLOSED.** Origination is a **third relation**, alongside the two the Studio already
ratified. The Studio's own design principle — *"one grammar for the relationship, not one
table for everything"* — is not merely honoured by this, it **required** it:

| Relation | Grammar | Substrate |
|---|---|---|
| `living_work_expressions` | **is a form of** | ratified 2026-08-01 |
| `living_work_materials` | **feeds** | ratified 2026-08-05 |
| **origination** | **gave rise to** | **this lane, not yet built** |

An Idea that originated a Work **may also** be declared a material of it. Those are two
assertions, separately made, separately withdrawable. **Declaring one must never write the
other**, in either direction (**BL-09**).

---

## 3. THE BRIDGE LAW *(constituted)*

Named clauses. The names are the law; renumbering never repeals one.

### Identity and non-consumption

- **BL-01 — IDEA SURVIVES.** Establishing a Work from an Idea leaves the Idea row
  unchanged. Not closed, not archived, not renamed, not moved, and **not marked
  `integrated`**. The Idea remains independently existent and independently editable.
- **BL-02 — NO COLLAPSE.** The bridge creates relationship and provenance. It may not
  collapse Idea and Work into one object. Neither object may become a state, a status, or a
  column of the other.
- **BL-03 — NO CONVERSION PATH.** There is no operation anywhere that turns an Idea into a
  Work. Establishment **creates** a Work; it never **transforms** an Idea.

### The act

- **BL-04 — MEMBER ACT ONLY.** Only the member initiates establishment. No system
  inference, no threshold of activity, no MAIA suggestion, no import, and no side effect of
  any other act may create a Living Work. This inherits `lib/livingWork/domain.ts`: *a
  Living Work is never created on a member's behalf.* The bridge does not weaken that; it
  is the first path that could have, and does not.
- **BL-05 — THE ACT IS NAMED FOR WHAT IT DOES.** The member-facing act is
  **"Begin a Work from this Idea."** Not *move*, not *convert*, not *promote*, not *send
  to*. The verb is the ontology in the member's hands, and a transfer verb teaches a
  transfer model.

### Provenance

- **BL-06 — ORIGINATION IS RECORDED AS A RELATION.** A Work records the Idea it was
  established from, as a queryable relation carrying `declared_by` and `declared_at` —
  never as prose inside a body, never as a denormalized string.
- **BL-07 — PROVENANCE IS DURABLE AND HONEST.** The origination record survives later
  divergence of both objects. It asserts *this Work was begun from that Idea*, which
  remains true regardless of what either becomes. It is a historical fact, not a live link.
- **BL-08 — ORIGINATION CARDINALITY IS NOT FORECLOSED.** The relation is a table admitting
  many rows per Work, not a column on `living_works`. The threshold act writes exactly one
  row today; *several Ideas converging into a Work* is thereby representable without a
  destructive migration and without being decided now. **This preserves optionality; it does
  not grant it** — see O-01.
- **BL-09 — GRAMMARS DO NOT CROSS-WRITE.** Origination, material membership, and expression
  are three assertions. Declaring any one never writes another. Withdrawing any one never
  withdraws another.

### Independence

- **BL-10 — NO SILENT SYNC.** Later changes to the Idea do not alter the Work.
- **BL-11 — NO SILENT BACKFLOW.** Changes in the Studio do not rewrite the Idea. The Idea
  has no Studio-authored fields.
- **BL-12 — SEVERABLE FROM BOTH ENDS.** Deleting the Work leaves the Idea intact. Deleting
  the Idea does not silently delete the Work. Withdrawing the origination record destroys
  neither object.

### The threshold

- **BL-13 — CARRIED ALWAYS.** Idea identity, Idea title, and the origin relationship cross
  as provenance, without member selection.
- **BL-14 — BROUGHT ONLY BY SELECTION.** Current framing · central question · selected
  reflections · selected decisions · selected sources/materials cross **only** when the
  member selects them. **Default-all is prohibited**, and "select all" offered as the
  pre-checked default is default-all wearing a checkbox.
- **BL-15 — NEVER CROSSES.** Entire conversation history · all Idea iterations · everything
  MAIA ever said · future Idea changes. Not by default, not by option, not by "advanced".
- **BL-16 — WHAT CROSSES ARRIVES ATTRIBUTED.** Selected material entering the Work carries
  its Idea origin. Material that cannot carry attribution does not cross.
- **BL-17 — NOT A WIZARD.** The threshold is the smallest act that can honour BL-13..BL-16.
  A lightweight choice about what to bring, not a bureaucratic import flow. An Idea with
  nothing selected is a **valid** establishment, not an incomplete one.

### Form

- **BL-18 — FORM MAY BE UNDECIDED, PERMANENTLY.** A Work established with no stated form is
  correct and complete. Formlessness is never a gap, a prompt, an empty state to fill, or a
  reason to nudge.
- **BL-19 — ONE WORK → MANY FORMS.** Establishment commits to no form and forecloses none.

### Ecology

- **BL-20 — ONE IDEA → MANY WORKS.** A second establishment from the same Idea yields a
  second, independent Work. The first is untouched; the Idea is untouched.
- **BL-21 — ZERO IS A VALID COUNT.** An Idea that gives rise to no Work is a complete and
  successful Idea. Nothing in the Ideas surface may present Work-count as progress,
  achievement, completion, or a state to advance.

**BL-21 is the ecology clause.** It is the one that keeps the Ideas space from becoming a
backlog.

---

## 4. Consequences found while constituting

### ⚠️ F-07 — `member_ideas.status` already contains a consumption word.

`status` admits `active | parked | integrated`, member-settable via
`PATCH /api/ideas/[id]` (`route.ts:111`). **`integrated` reads as consumed.**

- The **bridge must never write `status` at all** — this is BL-01, made specific.
- Whether a *member* may mark an Idea `integrated`, and what that should mean under the
  three-layer model, is **Ideas R&D's** question, not this lane's. Returned as **O-02**.

The risk is concrete and near: a future "tidy up" that sets `integrated` on establishment
would satisfy every stated intention about keeping the Idea, while quietly implementing
consumption. **B-01 asserts on the row, not on the absence of an error, for this reason.**

### ⚠️ F-08 — `living_works.form` and Form-the-layer are two different things sharing a word.

Under the ruling, **FORM** is the third layer — *an expression arising from the Work* —
carried by `living_work_expressions`. But `living_works.form` is a column on the **Work**,
whose ratified header calls it *"the member's own word for what this is becoming."*

Those are compatible but distinct: `living_works.form` is **anticipated** form — an
orientation the member holds — while an expression is an **actual** form the Work has taken.
Nothing is wrong today. The drift is one careless reading away: treating `living_works.form`
as *what the Work is* collapses Work into Form and undoes BL-19.

**Recommendation, not a ruling** — keep the column as orientation; never derive it from
expressions; never derive expressions from it. **Returned to Writer's Studio R&D as O-03**,
which owns what a Work is.

### ✅ F-05 resolves.

The seven forms — paper / essay / book / talk / workshop / teaching / other — are **offered
wording** at the surface, never a CHECK constraint and never a stored closed set. This
honours both the founder's list and the ratified rule that `living_works.form` is *never a
system taxonomy*. NULL remains a legitimate permanent state (BL-18).

### 🔴 F-02 stands, untouched, by founder direction.

`POST /api/book-studio/drafts/from-idea` and `MoveToStudioButton` **embody the rejected
ontology** — they treat the Idea as something transferred into a downstream artifact. They
remain untouched until DESIGN determines their replacement or retirement. Recorded, not
repaired.

---

## 5. Open

| # | Question | Owner |
|---|---|---|
| **O-01** | May an Idea be declared an origin of a Work **after** establishment (convergence over time), or is origination bounded to the establishing act — with later arrivals being materials? BL-08 keeps both representable; neither is granted. | this lane, at DESIGN |
| **O-02** | What does `member_ideas.status = 'integrated'` mean under the three-layer model, and should the vocabulary change? | **Ideas R&D** |
| **O-03** | `living_works.form` as anticipated form vs. expressions as actual form (F-08). | **Writer's Studio R&D** |
| **O-04** | Disposition of the `from-idea` route and `MoveToStudioButton`. | founder, at STOP |

**O-01 is the one DESIGN must not answer by accident.** The convenient implementation —
letting any later Idea be added to the origin list — silently makes origination mean
"associated with", and R-02 exists precisely to prevent that.

---

## 6. PROVE — obligations, revised under the ruling

Superseding B-01..B-11 in the charter. Named set is the law; the count is descriptive.

| # | Obligation | Clause |
|---|---|---|
| **B-01** | Idea row byte-identical after establishment — including `status`, which is never written by the bridge. Asserted on the row. | BL-01 · F-07 |
| **B-02** | A distinct `living_works` row exists, with its own identity and lifecycle. | BL-02 |
| **B-03** | Origination is a queryable relation carrying Idea identity, `declared_by`, `declared_at` — not prose in a body. | BL-06 |
| **B-04** | Selected material is present in the Work and attributed to its Idea origin. | BL-14 · BL-16 |
| **B-05** | Unselected material is absent. Conversation history, all iterations, and MAIA's reflections do not cross. | BL-15 |
| **B-06** | Editing the Idea afterwards leaves the Work byte-identical. | BL-10 |
| **B-07** | Editing the Work afterwards leaves the Idea byte-identical. | BL-11 |
| **B-08** | A second establishment from the same Idea yields a second independent Work; the first Work and the Idea are untouched. | BL-20 |
| **B-09** | No system path creates a Living Work. Every `living_works` row and every origination row carries a member `declared_by`. | BL-04 |
| **B-10** | Deleting the Work leaves the Idea intact; deleting the Idea does not silently delete the Work; withdrawing origination destroys neither. | BL-12 |
| **B-11** | A Work established with no stated form is a correct, permanently valid state — no prompt, no empty state, no nudge. | BL-18 |
| **⭐ B-12** | **Establishment writes exactly one relation.** No `living_work_materials` row and no `living_work_expressions` row appears as a side effect. Declaring the Idea a material afterwards does not touch the origination record, and withdrawing either leaves the other standing. | BL-09 · R-02 |
| **⭐ B-13** | **Zero Works is a complete Idea.** No Ideas surface presents Work-count as progress, completion, achievement, or an advanceable state. | BL-21 |
| **B-14** | The member-facing act reads **"Begin a Work from this Idea."** No transfer verb — move, convert, promote, send — appears on the threshold surface. | BL-05 |

**B-10 remains the drift falsifier**: a "simplification" that converts the Idea into the Work
passes B-01..B-09 by construction and fails B-10.

**B-12 is the R-02 falsifier**: an implementation that records origination by writing a
`living_work_materials` row satisfies B-03 — there *is* a queryable relation — and fails
B-12. It is the cheap shortcut that R-02 names in advance.

**B-13 is the ecology falsifier.** It is the only obligation that constrains a surface rather
than a write, and it is the one that keeps Ideas from becoming a backlog.

---

## 7. VERDICT — is CONSTITUTE unblocked?

**Answer: partially, and the partition is clean.**

The founder asked for a verdict, so here it is stated plainly rather than hedged: **the
relational law is unblocked and closed; the source registry is not, and cannot be, until
three questions outside this lane are answered.**

### 7.1 What IS unblocked — the relational law

The founder's ten clauses (charter §9.2) are **object-independent**. They constrain the
*relationship*, which is exactly what this lane owns. None requires knowing what a
Reflection is. Together with BL-01..BL-21 they constitute completely:

```
RL-01  A source remains independently existent when associated with a Work.      (law 1)
RL-02  Nothing is moved, consumed, converted, or silently copied into a Work.    (law 2)
RL-03  One source → many Works.                                                  (law 3)
RL-04  One Work ← many sources.                                                  (law 4)
RL-05  One Work → many Forms.                                                    (law 5)
RL-06  Source type and provenance are preserved; no generic content bucket.      (law 6)
RL-07  Relation kinds do not collapse without ontological justification.         (law 7)
RL-08  Association is a member authorship act. MAIA surfaces; it never
       establishes. No system inference creates a Work or an association.        (law 8)
RL-09  A Work can present its creative genealogy.                                (law 9)
RL-10  A source is valuable having contributed to nothing. Zero is complete.     (law 10)
RL-11  Authorship provenance — member-authored vs system-distilled — is a
       required field of every crossing, never optional.                    (F-13, this lane)
```

**RL-11 is this lane's own addition**, not the founder's. It is proposed because F-13 makes
it necessary: without it, laws 6 and 8 are satisfiable by an implementation that still
makes MAIA the invisible co-author of a member's genealogy. **Flagged as requiring founder
ratification** — it is a new constraint, not a reading of an existing one.

**These are ratifiable now.** Nothing about them waits on O-05..O-08.

### 7.2 What R-01 reserves to Ideas

Under the wider model, one clause does **not** generalize:

> **Origination — *"gave rise to this Work"* — is reserved to Ideas** unless the founder
> extends it. R-01 defines an Idea as *generative possibility*, and establishment as the
> act of undertaking one. A journal entry may have *inspired* a Work; whether it can have
> *originated* it is a question about what originates an undertaking, and R-01 answered it
> only for Ideas.

So the relation vocabulary is currently:

| Relation | Grammar | Admissible subject |
|---|---|---|
| **originated from** | gave rise to the Work's establishment | **Ideas only**, pending O-10 |
| **inspired by** | informed or reshaped the Work | any source *(shape undecided)* |
| **contributes to / feeds** | ongoing creative contribution | any source |
| **is a form of** | expression | expressions only *(ratified)* |

**O-10 is this lane's to answer at CONSTITUTE**, and §7.4 is why it is not answered here.

### 7.3 What is NOT unblocked — the source registry

The bridge cannot admit a source type it cannot name. Per type:

| Type | Admissible? | Blocked by |
|---|---|---|
| **Ideas** | ✅ **YES — constitutable now.** Object exists, ownership verifiable, R-01 settled. | — |
| **Journal** | ⚠️ blocked | **O-07** — three substrates, no ruling on which is *the* Journal |
| **Keeps (capsules)** | ⚠️ blocked | **O-05** + **F-13/RL-11** — name overloaded; content partly system-distilled |
| **Keeps (manuscript)** | ⚠️ blocked | **O-08** — plausibly not a source at all (F-12, RB-20) |
| **Changes** | 🔴 **NO** | **O-06** — not a first-class object; addressing one means addressing an Idea block (F-11) |
| **Decisions** | 🔴 **NO** | **O-06** — same |

**This is the honest shape of it: the model is right and three of its five named types have
no addressable subject yet.** That is not an objection to the widening — it is the
widening's principal finding, and finding it now is why the founder was right to widen
before DESIGN rather than after.

### 7.4 Why this lane does not resolve the blockers itself

Every one of them is a question about **what an object is**:

- O-05 (*what is a Reflection*) and O-08 (*is a manuscript keep a source*) define the
  domain of the relation — **founder**.
- O-06 (*are Changes and Decisions first-class*) would restructure `member_idea_blocks` —
  **Ideas R&D**.
- O-07 (*which Journal*) — **the Journal's owner**.

Per the lane's own anti-drift test: *if a proposed bridge change requires redefining Idea or
Work, STOP and return the question to the domain that owns that object.* Answering O-06
here would let the bridge decide what an Idea contains, which is precisely the ownership
inversion the lane was created to prevent.

### 7.5 Recommended sequence

1. **Ratify the relational law** — RL-01..RL-11 + BL-01..BL-21. Independent of every
   blocker; ratifying now stops the ontology reopening later.
2. **Answer O-05** (*what is a Reflection*) — the widest blocker. Everything else narrows
   once the field has one meaning and, if needed, its own name.
3. **Open DESIGN on the Idea case only**, building the source registry as a **registry** —
   one admissible type today, others admitted as their ontologies settle, no schema change
   per type. The threshold experience is built once; sources join it.
4. **Return O-06/O-07/O-08** to their domains in parallel. They do not block step 3.

**Step 3 is the leverage.** It delivers the founder's original act — *Begin a Work from this
Idea* — while making the widened model structurally reachable, and it is the only sequence
in which no domain is asked to decide another's object.

⛔ **What must not happen instead**: shipping the Idea case with a hardcoded
`source_type='idea'`, which passes every obligation here and re-earns the whole census the
first time Journal arrives.

---

## 8. Standing

```
LANE           WIDENED — REFLECTIONS ↔ LIVING WORKS — CREATIVE PROVENANCE
R-01           CLOSED — founder, 2026-09-08 — IDEA ≠ LIVING WORK (preserved)
R-02           CLOSED — origination is a third relation, not a material
CONSTITUTE     RELATIONAL LAW COMPLETE — BL-01..BL-21 + RL-01..RL-11
               SOURCE REGISTRY OPEN — Ideas admissible; four types blocked (§7.3)
               RL-11 proposed by this lane, awaiting founder ratification
PROVE          B-01..B-14 + RB-15..RB-21 — not runnable until DESIGN
DESIGN         MAY OPEN ON THE IDEA CASE ONLY, built as a registry (§7.5)
STOP           founder witness owed before any build or deploy

O-01 → DESIGN · O-02 → Ideas R&D · O-03 → Writer's Studio R&D · O-04 → founder
O-05 → founder (blocking) · O-06 → Ideas R&D (blocking) · O-07 → Journal owner
O-08 → founder (blocking) · O-09 → this lane at DESIGN · O-10 → this lane

no schema change · no migration authored · no route added or removed
no UI built · no deploy · from-idea drift instance UNTOUCHED by direction
Writer's Studio capability lane cited, NOT reopened
```
