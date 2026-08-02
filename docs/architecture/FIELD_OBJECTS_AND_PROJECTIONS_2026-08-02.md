# Field objects and projections

**Status:** Recorded (Kelly, 2026-08-02). Not ratified. **No build authorized by this document.**
**Referent:** `lib/workbench/*`, `app/api/book-studio/workbench/*`, `database/migrations/20260521000001_member_memory_atoms.sql`, `database/migrations/20260522000003_workbench_v0.sql`, `lib/workbench/graduate.ts`.

---

## The ruling

A Keep is **not manuscript material**. It is not something waiting to be inserted into a draft. It is
a **field object** — an insight, image, question, quotation, observation, or realization that
continues to have its own life whether or not it ever appears in a manuscript.

The flow is not `Keep → insert into manuscript`. It is:

```
Life → Keep → Field → Arrangement → Discovery → Writing (sometimes)
```

**Writing is only one possible outcome.** A Keep might instead become a coaching question, a talk, a
workshop, a journal reflection, a future book, a conversation with MAIA, a decision — or simply
remain an important insight.

Therefore **Writer's Studio never owns Keeps.** Field objects belong to the AIN Field:

```
AIN Field
  ├── Keeps  ├── Ideas  ├── Decisions  ├── Journal moments
  ├── Changes ├── Quotes ├── Conversations └── …
```

A project — book, course, keynote, article, coaching program, research effort — **references** those
field objects. The Canvas does not consume them and does not move them out of the field; it creates a
relationship.

### The distinction that carries the weight

> The thing sitting on the Canvas is not a Keep. It is a **reference to** a Keep.
>
> The Keep lives in the member's field. The Canvas card is a **projection** of that Keep into a
> particular project.

Delete the card from the Canvas and the Keep still exists. Use it in five different books and there is
still only one Keep. Same reason one index card could sit in several conceptual piles: the card never
ceased being itself.

Every studio works with **references into the field** rather than creating competing copies. The
Writer's Studio becomes one of many environments that can think with the same living field objects,
rather than the place those insights reside.

---

## Where the implementation already satisfies this

Checked, not assumed:

| Claim | Evidence |
| --- | --- |
| Keeps are owned by the field, not the Workbench | `member_memory_atoms` has its own migration (`20260521000001`), predating and independent of `workbench_v0` |
| The Canvas card is a reference, not the object | `workbench_tables.layout` stores only `{id, source, ref}`; `stripLayout()` is the sole write path and cannot carry content |
| Deleting a card does not touch the Keep | Walk 2026-08-02: **23/23 atom fields identical** after place → duplicate → move → reorder → return |
| One Keep, many projections | Walk: one pile held two placements of one atom (`c_b62d8afb`, `c_66ece0bb`, both `ref 1a6c8aa1`) |
| Placement identity ≠ object identity | `CardPointer.id` is unique table-wide; `{source, ref}` may repeat freely |
| The field is read-only from the Canvas | `keep.ts` issues `SELECT` only; `arrange.ts` has no database import, enforced by test |

**The ontology is already the implemented data model.** PR #878 is consistent with this ruling and is
not invalidated by it.

---

## Where the architecture contradicts the ruling

Three divergences, none of them addressed by #878, each recorded rather than acted on.

### 1. Graduation copies field content out of the field ⚠️ the sharpest one

`lib/workbench/graduate.ts` resolves each card and writes the **content itself** into a flat markdown
file under `docs/book-studio/drafts/<slug>.md`:

```
resolvedSections.push(`## ${title}\n\n${resolved.content.trim()}`)
```

This is precisely `Keep → insert into manuscript` — the flow the ruling rejects. It severs the
reference and creates the competing copy. Once written, the draft no longer knows which field objects
it came from, and edits to either side diverge silently.

Founder-only, and deliberately excluded from #878. But it is the concrete instance of the rejected
shape, and it is what "graduation to WriterField" would inherit if built as-is.

### 2. The Workbench owns a class of field object

`workbench_uploads` is created by `workbench_v0.sql` — the Workbench's own migration. So uploaded
material is owned by an arrangement surface rather than by the field, unlike Keeps. Under the ruling,
an upload is a field object (like a Quote or a Source) that the Canvas references. The ownership is
inverted relative to Keeps, and the two sources are asymmetric today for no principled reason.

### 3. The namespace places the arrangement surface inside Book Studio

```
app/api/book-studio/workbench/*        ← implies Book Studio owns it
components/book-studio/workbench/*     ← same
lib/workbench/*                        ← already field-neutral ✅
app/maia/workbench                     ← member entry, already outside book-studio ✅
```

If arrangement is a field-level capability that any environment can use, the route and component
namespaces contradict that. The library layer already got this right.

---

## What this settles, and what it does not

**Settles:** the earlier open question *"is a project the Table, or a Living Work?"* is now
constrained from one side. Whatever a project is, it **references** field objects and does not contain
them. A Canvas is a set of projections, not a container of material.

**Does not settle:**

- Whether `workbench_tables` *is* the project or belongs to one.
- Whether a projection carries per-project state (a note on why this Keep is here, an ordering
  rationale) or stays a bare pointer. Bare today.
- What graduation should become, given that copying is rejected. A draft that *references* field
  objects is a different object from a draft that inlines them.
- Whether "Field" here is the same Field as the Living Field substrate, or a distinct sense of the
  word. ⚠️ The term is already load-bearing elsewhere; this needs disambiguating before either
  borrows the other's machinery.

---

## Refused by default

⛔ No renaming, no namespace move, no migration, no change to graduation is authorized by this
document. It records a ruling and names three divergences. Acting on any of them is a separate
decision, and #2 and #3 in particular are wide-radius refactors that would touch surfaces well
outside the Workbench.
