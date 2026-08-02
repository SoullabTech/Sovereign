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

## Extension — one ontological family, and representation as a separate axis (Kelly, same day)

### Defined by what they are, not what they are for

Keeps, Ideas, Decisions, Changes, Journals, Quotes, Conversations and their kin belong to **one
ontological family**. They are not defined by their use (writing, coaching, journaling). They are
defined by what they are:

> **Persistent fields of insight that can continue to participate in a person's life.**

So the hierarchy inverts. Not `Writer's Studio → { Keeps, Ideas, Decisions }` but:

```
                          Member Field
      { Keeps · Ideas · Decisions · Changes · Journals · Quotes · Conversations · … }
                               │
      ┌────────────────┬───────┴────────┬─────────────────┐
Writer's Studio   Coach Studio    Vision Studio    Learning Studio
      └────────────────┴────────────────┴─────────────────┘
                    all REFERENCE field objects
```

A Writer's Studio project does not *contain* a Decision; it references one. A coaching preparation
does not *own* an Idea. A Vision exercise does not *consume* a Journal entry. There is **one living
Decision** in the member's field, and many contexts may draw on it.

### The object is not the card

> A card is one **representation**. The underlying thing is a **field object**.

The Canvas renders it as a card because cards are excellent for human spatial thinking. Another
environment might render the same object as a timeline event, a constellation, a conversation thread,
a map, a relationship graph, or a chronological stream. **The object does not change; only the
representation changes.**

### What the Canvas actually is

The Canvas is **not "where writing happens."** It is **where relationships between field objects
become visible through human arrangement.** Writing is one possible consequence. Others:

- *"I suddenly see the pattern in my life."*
- *"These three Decisions all came from one Change."*
- *"Every breakthrough traces back to this Journal entry."*
- *"This coaching framework emerged from these seven Keeps."*
- *"This chapter is really about this cluster of lived insights."*

The Canvas supports **thinking itself**. The Writer's Studio specializes that thinking toward a
manuscript. This is the standing principle applied: **cultivate human perception, do not automate
human conclusions.** The member creates the relationships; the environment makes them easy to see and
revisit.

### What this means for the naming already in the code

Checked against `lib/workbench/sources/types.ts` and `lib/workbench/arrange.ts`:

| Name today | Under the ruling |
| --- | --- |
| `WorkbenchSourceKind` = `uploaded \| ideas \| keep \| journals \| decisions` | This **is** the field-object family — but named after the surface consuming it, not after what the objects are |
| `CardPointer` | Names the reference after **one representation**. The object is a field object; "card" is how the Canvas draws it |
| `lib/workbench/sources/*` | "Source" is Workbench-centric framing for what is actually the member's field |
| **`placement`** (`arrange.ts`) | ⭐ **Already correct.** A placement is a member-authored *relationship* between a field object and a location — not a card, not a copy. It is the primitive the ruling describes |

⭐ The Slice 1 primitive generalizes beyond piles unchanged: a placement is a relationship, so the
same substrate supports a timeline, a constellation, or a graph by varying only the renderer. Nothing
in `arrange.ts` assumes a pile — only ordered membership in a named group.

### Additionally open after this extension

- Does a field object family need a shared interface beyond `{source, ref}` — and if so, is that the
  field's contract or each Studio's?
- ⚠️ **"Field" is now carrying two senses** — the member's field of insight objects, and the Living
  Field substrate. This was already flagged; the extension makes it urgent, because the family name
  would inherit whichever sense is chosen.
- If representation is a separate axis, where does a renderer live — with the Studio, or with the
  field object type?

## Extension — how field objects return (Kelly, same day)

Field objects **remain in the member's Field**, searchable at any time and contextually offered when
they may illuminate the present moment. They are **not raw material waiting to be consumed by a
project.**

### Two distinct ways they return

**1. Search** — the member deliberately looks: *"decisions related to this project"*, *"where have I
written about belonging?"*, *"the changes I noticed last winter"*, *"Keeps connected with fire"*.
Search reaches **across** Keeps, Ideas, Decisions, Changes, Journals and other insight fields while
**preserving each object's identity and source**.

**2. Contextual offering** — MAIA may notice an existing field object appears relevant and offer it:
*"You kept something several months ago that may bear on what you're describing. Would you like to see
it?"* An **offer**, not an insertion, and not an interpretation presented as truth. The member decides
whether to open it, ignore it, place a reference on a Canvas, connect it to a project, continue the
conversation with it, or leave it where it is.

### The authority boundary

The system **may** say: *"This may be relevant."*

It **may not** say: *"This belongs in your book."* · *"These form a theme."* · *"This decision caused
that change."* · *"This pile is ready to become a chapter."*

Those are higher-order meanings. They remain **the member's to recognize and declare.**

### What an offer must carry, and must not do

An offer must be intelligible: **what kind** of field object it is · **when** it arose · **where** it
came from · **why it is being offered now** · whether it is **private** to the member or permitted to
return contextually.

Offering must **not**: alter the object · change its privacy or `return_preference` · attach it to the
current project · place it on a Canvas · count it as *"used"* · silently strengthen an inferred
relationship.

### The governing line

> **Field objects remain available to the member everywhere; the platform may retrieve and offer them,
> but only the member gives them a new relationship, placement, or meaning.**

### Checked against the implementation

| Constraint | State |
| --- | --- |
| Retrieval does not alter the object | ✅ `keep.ts` is `SELECT`-only; walk showed 23/23 fields unchanged |
| Retrieval does not change `return_preference` | ✅ adapter is explicitly barred from writing it |
| Retrieval does not count as "used" | ✅ `surface_count` and `last_surfaced_at` unchanged across the walk |
| Placement is member-authored only | ✅ every verb originates in a member gesture; nothing auto-places |
| No interpretation offered | ✅ MAIA is absent from the room; no clustering, theming, or naming |
| **Member search ≠ MAIA offer, on privacy** | ✅ already anticipated: the adapter deliberately does **not** filter by `return_preference`, because *a private atom is private **from MAIA**; it is still the member's own to see and place*. The gate belongs on the contextual-offer path, not on member search |
| Search reaches across the family | ❌ **member search reaches `keep` only** — Ideas, Decisions, Changes, Journals have no adapter |
| Contextual offering exists | ❌ not built; deliberately absent from the Workbench |

⭐ The privacy row is the one worth noting: the two return paths need **different** gates, and the
code already encodes that distinction rather than collapsing them.

⚠️ **The Shelf is therefore misnamed in spirit** — it is not "writing materials." It is **one view
into the member's wider Field**, currently showing a single object type. The Writer's Studio may
reference those insights; it does not own them.

---

## Refused by default

⛔ No renaming, no namespace move, no migration, no change to graduation is authorized by this
document. It records a ruling and names three divergences. Acting on any of them is a separate
decision, and #2 and #3 in particular are wide-radius refactors that would touch surfaces well
outside the Workbench.
