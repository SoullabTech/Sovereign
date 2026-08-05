# Structure — Design (Work Continuity Layer, Step 4)

> **Status**: Third and final design object of the Work Continuity Layer
> lane, after the accepted Work drawer and Materials designs. Design only —
> **authorizes no implementation, no schema.** The founder set the
> question and named the trap:
>
> - Wrong: *"How do we make an outline tool?"*
> - Right: **"How does a Work reveal the shape it wants to take?"**
>
> This is the point where Writer Studio moves beyond writing software.
> Unifying test, as everywhere in this lane: **who makes the meaning?** —
> the creator.

---

## The core design decision: shape is revealed by the creator's acts, and spoken in the creator's words

A Work's structure is not a property the system computes or a template the
creator fills. It is **what the creator's own acts of shaping have made
visible so far** — rendered back to them, in their own unit-words.

Two consequences:

1. **The unit-word is the creator's.** Chapters, movements, sections,
   parts, letters, sessions, arguments, threads — the system never
   imposes "chapters" on a work that thinks in movements. The default
   vocabulary is whatever the creator's own material carried or the
   creator says; "Section 1..n" appears only as honest absence of naming,
   never as a suggestion of what the units *are*.
2. **The system renders shape; it never asserts shape.** *"These
   documents are actually chapters of a book"* is the ruled prohibition
   from the Work drawer, applied here structurally: no auto-outlining, no
   inferred hierarchy, no "we detected three acts."

## The three ways shape arrives (all creator acts)

1. **Carried** — an imported manuscript brings its own cuts, confirmed by
   the member at the threshold (built: `manuscript_sections` + the
   confirm-the-cuts stage, including the added cut gesture). The shape
   arrived because the creator wrote it, elsewhere, earlier.
2. **Declared** — the creator names parts: *"this book has four
   movements"*, *"the series is eight posts."* A declaration gesture in
   the room, sibling of declare-expression and bring-to-work. May precede
   any writing (shape as intention) or follow it (shape as recognition).
3. **Emergent from arranging** — the creator arranges materials and
   fragments into threads on the development surface, and the arranging
   itself is the shaping act. The system may render what the arranging
   has made — *"you have gathered these into three threads"* — and, only
   on invitation, offer (never assert) what the member might make of it.

## The distinction that keeps this honest: expression structure ≠ work shape

Two different things, never collapsed:

- **Expression structure** — the internal cuts of one expression: the
  manuscript's chapters, the series' posts. Already real
  (`manuscript_sections`), already member-confirmed, already conditional
  in the room (the Structure drawer appears only when sections exist).
- **Work shape** — the creator's map of the whole Work, possibly spanning
  expressions and materials: the themes the elder's threads form, the
  argument arc across a dissertation's chapters and sources. This has no
  substrate yet, and the walk (below) decides whether it needs one now or
  whether threads-on-the-development-surface (Materials M2/M3 grammar)
  already carries it.

The novelist's built need — chapter names, jumping, orientation — lives
entirely at **expression structure** and is the first slice candidate:
the Structure drawer growing names and jump (the pinnable rail, walk
amendment A2), reading what already exists. No new ontology.

## Where structure lives in the room

**Close to the Worktable, because it affects creation** (founder ruling).
The Structure drawer opens to the parts by name; a part is a door — it
lands the field at that part. For long-form work, the drawer pins as the
rail beside the field (A2). Structure is terrain when the work is large,
folded quiet when it is small, absent when it does not exist.

## The strain named honestly: draft drift

The draft is free text the creator owns; the carried cuts live in the
immutable Source. As the draft evolves, the Source's structure grows
stale as a map of the *living* text. This design does not resolve that
seam — it names it as the first question the implementation walk must
answer: *when the creator reshapes the work at the table, what do they
naturally expect the rail to show — and what gesture updates it?* Any
answer where the system re-derives structure from the draft by detection
is drift; any answer where the rail silently stays stale is dishonest
display. The likely shape (to be walked, not assumed): the rail is the
creator's declared map, and amending it is a declaration gesture as
light as renaming a heading.

## Refused now

- ⛔ An outline tool as identity ("plan first, then write").
- ⛔ Structure templates ("a novel has three acts", "a dissertation has
  six parts").
- ⛔ Auto-outline, structure detection over the draft, inferred hierarchy.
- ⛔ Progress framing on parts ("3 of 12 chapters complete").
- ⛔ Any structure the creator didn't carry, declare, or arrange.

## The walk this design must survive

Walk the five personas on paper asking, at every structural moment:
**whose act made this shape visible?** The novelist (carried cuts +
declared re-shaping at the table), the scholar (argument arc vs chapter
list — do they need work shape or just expression structure?), the
blogger (a series' shape = its posts; nothing more imposed), the elder
(threads from arranging — does emergent shape want to become declared
shape by a gesture?), the collaborator (held). If any shape on screen
traces to detection, template, or inference, the design has drifted at
that point.
