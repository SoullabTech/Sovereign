# The Field Object Declaration — the constitutional question surfaced by the Phase 1 release walk

> **Status: RECORDED, NOT RATIFIED. Authorizes no implementation.**
> Kelly, 2026-08-02, in response to the Phase 1 release-acceptance walk failing at W8
> (see `docs/product/releases/WRITERS_STUDIO_PHASE_1_RELEASE_RECORD.md` §3b, F3).
> Recorded by Claude. ⛔ Nothing here is a build authorization, and the question below is
> **open** — it is not answered by this document.

---

## What the walk actually exposed

W8 did not fail on a button or an API. It exposed that **two different models of "keeping" are
both live in the product**:

| The member is asked to declare | The Workbench assumes |
|---|---|
| *"This conversation mattered."* | *"This insight now belongs to my enduring Field."* |

**Those are not the same act.** The system currently asks for the first while the Shelf assumes
the second already happened. That gap is the failure.

## The refused fix

The obvious engineering response is: *when someone saves a capsule, create the atom too.*

⛔ **Refused.** It would damage the ontology this project has spent months clarifying, and it is
another instance of a rule already ruled: **the system must not silently promote.** The member
decides *this conversation was valuable*, and separately decides *this belongs in my enduring
Field*. Collapsing them performs a declaration the member did not make.

## The question, stated

> **What is the first deliberate act by which something becomes part of a person's enduring
> Field?**

This is the constitutional question. It is **not** *"how do we get atoms into the Shelf?"* —
that framing takes the substrate as given and asks only for plumbing.

## Why answering it makes everything downstream straightforward

```
conversation
      ↓
conversation reflection (capsule)
      ↓
member declares: "This belongs in my Field."
      ↓
canonical Field Object
      ↓
Project Reference
      ↓
Placement
      ↓
Workbench
```

⭐⭐ **The source stops mattering.** The same declaration could arise from a journal · a notebook
· a coaching session · a dream · a conversation · an uploaded PDF · a book highlight.

**The declaration is what creates the Field Object** — not the source. That is a far stronger
foundation than teaching every source how to manufacture atoms, which is the shape the current
implementation drifted into (`/maia/keep-capture` can only mint atoms from `member_ideas` /
`member_idea_blocks`, so every new source would need its own candidate adapter).

## The distinction the walk clarified: events vs enduring realities

The ratified architecture keeps separating these; the walk revealed **exactly where the running
software still violates the separation**.

| Thing | Kind |
|---|---|
| a conversation | **event** |
| a capsule | **event-derived artifact** |
| a **Keep** | **enduring Field Object** |
| a **Reference** | **enduring relationship** |
| a **Placement** | **temporary spatial arrangement** |

⭐⭐⭐ Consistent with the ratified Member Field re-centering: **Reference = durable · Placement =
surface state**, and the Field is the platform root that Studios only reference.

## Why this matters beyond the fix

> The release walk did not invent this architecture — it revealed where the implementation still
> departs from it.

⭐⭐ That is the significant thing: **the architecture is now mature enough to critique the
implementation, rather than being shaped by it.** Earlier in this project the reverse was true.

## The same question appears on the practitioner axis (Kelly, 2026-08-02)

Assessing the practitioner **note lifecycle** slice (draft → active → completed), Kelly found it
covers the **client-note** case studies — write during/after a session · leave and return ·
Carry Forward · commitments · recognitions · session linkage · encryption/PHI ·
completion-as-explicit-act — and **intentionally does not** cover the practitioner's own
developmental field.

⭐⭐⭐ **The structural pattern is identical; only the object of development differs:**

```
conversation   →  capsule            →  Field Object          (member / Writer's Studio)
session note   →  developmental note →  practitioner Field Object   (practitioner)
```

The next practitioner question is therefore the same constitutional question in another key:

> **When does something cease being documentation of a client encounter and become part of the
> practitioner's own evolving understanding?**

Four things the note-lifecycle slice deliberately does **not** absorb — each the practitioner
analogue of something already separated on the member side:

| Not covered | Why it is a different object |
|---|---|
| **Development Notes** — *"his resistance has shifted from fear to grief"* · *"the leadership question may be an identity question"* | **thinking about the client**, not documentation of the session. The member-side analogue is the **Project Development Record**; practitioner development will likely need its own substrate. |
| **Field Objects** — *"this realization belongs in my own Field"* | a **practitioner** Field Object, not a client note. Different destination. |
| **References** | a note may be referenced by an engagement · a client · a workshop · a model · a future paper · practitioner learning — **without becoming part of any of them**. Same Reference ⊥ Placement distinction as books. |
| **Cross-case insight** — *"what have I learned across hundreds of clients?"* | not a client note at all; a **practitioner Field question**. ⚠️ The ratified rule **history yes, interpretation no** becomes load-bearing here. |

⭐⭐ **The slice being small is the point.** Absorbing Development Notes, Field Objects,
References and practitioner learning now would stop it being about note lifecycle and start it
being the Practitioner Studio architecture — blurring two ontologies immediately after they were
separated on the member side.

⛔ Recorded as scope, not as a plan. No practitioner Field substrate is authorized here.

## What this document does NOT do

- ⛔ It does not answer the question.
- ⛔ It does not authorize a schema, a migration, a route, or a UI surface.
- ⛔ It does not rule on where the declaration gesture lives, what it is called, or what it costs
  the member.
- ⛔ It does not license auto-promotion from any source under any framing.

Phase 1 remains **not ready for founder acceptance or deployment**. Blocking correction #1 in the
Release Record is gated on this question being ruled — not on an implementation being chosen.
