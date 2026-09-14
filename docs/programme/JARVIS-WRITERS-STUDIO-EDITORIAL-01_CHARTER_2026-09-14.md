# JARVIS-WRITERS-STUDIO-EDITORIAL-01 · charter

**Opened** founder, 2026-09-14.
**Governs** every Writer's Studio editorial feature from here forward.
**Criterion** `docs/canon/WRITERS_STUDIO_EDITORIAL_OBJECTIVE.md` — ratified the
same day, and the thing this charter sequences.

---

## The destination

> MAIA reads the Work in context, notices something worth attention, shows you
> exactly what she sees and why it may matter, talks it through with you, offers
> possibilities, lets you edit her wording or redirect her thinking, revises
> with you until the result feels right, then applies only the exact version you
> approve.

## The success test

⛔ Not *"can MAIA edit a manuscript?"*

> **Can I sit with MAIA and work on my book the way I would with an unusually
> perceptive developmental editor — questioning, exploring, rewriting,
> disagreeing, refining — while never losing authorship or wondering what she
> changed?**

---

## The two tracks, and when they converge

```
ARCHITECTURE   succession → proposal/authorization separation → revise loop
               → coordinated changes

EXPERIENCE     research → interaction prototypes → conversational editor
               → whole-work guided workflows
```

⭐⭐ **They converge only AFTER step 3.** That is what lets a beautiful
conversational interface remain truthful about who wrote what. Converging
earlier produces a warm surface over a storage layer that has flattened
authorship — which is the same consent failure as EW-F1, wearing a friendlier
face.

---

## The ten steps

**1 · Finish the authorship substrate.** ⭐ NEXT, and the immediate engineering
priority. Staged-version succession, so one editorial idea can become
`MAIA v1 → Kelly v2 → MAIA v3 → Kelly v4` without overwriting history. Every
version carries an author, a rationale where one exists, and a predecessor.
⛔ `expected_text` and the target remain facts about the WORK; proposed wording
remains authored, evolving material.

**2 · Separate proposal from authorization.** A proposal is worked on
repeatedly; an authorization is immutable permission for one exact final version
to cross into one exact state of the Work. Open `replace_exact_text` here, then
insertion and other operations **only as real editorial cases earn them**.
⛔ Do not generalize to every imaginable edit.

**3 · Connect MAIA's intelligence to proposals.** Today scripts create
proposals; MAIA has never proposed anything. The product begins when she can
move from a reading into the ladder: **Insight → Direction → Suggestion →
Change**, and only an exact Change can become an authorization. ⛔ She may never
silently promote an observation into a write-capable object.

**4 · Build the collaborative revise loop.** *Show me what you mean · edit her
wording · ask why · disagree · give direction · ask her to try again · write
your own.* `Ask MAIA to revise` is governed by W7A — one human act, at most one
generation. Your edits create member-authored successors; hers create
MAIA-authored ones. ⛔ Nothing touches the manuscript yet.

**5 · Run the editing UX research lane in parallel.** ⛔ Do not design the final
surface by extending today's card. Benchmark the eleven scenarios in the
objective's appendix across strong editing products and human editorial
workflows. ⭐ Serious interaction and visual design work belongs at the
beginning.

**6 · Replace the witness panel with the conversational editing experience.**
The primary surface is **the Work plus MAIA**, not a change-control form. Her
turn carries the proposition; the Work marks the locus; a small comparison shows
Current / Would read. Actions are human: *Keep mine · Try this · Edit this · Ask
MAIA again · Work on it together.* ⛔ `proposal_work`, `execution_authority`,
coordinate spaces and version ids stay invisible.

**7 · Build scale-aware editorial experiences.** Grammar nearly effortless; a
sentence gets a compact comparison; a paragraph gets context and conversation; a
three-story recurrence becomes a guided workspace — *"3 places in your book"*,
the role each occurrence plays, worked through one at a time, then a coordinated
review. Whole-book issues get their own visual pattern workspace and produce
exact changes **only after the editorial question is resolved**.

**8 · Coordinated change sets last.** One editorial ruling produces several
linked exact changes. The writer works through each, accepts some and rejects
others, and sees a clear summary before anything crosses. ⛔ **No "apply all"
until every member change has an individually intelligible state.**

**9 · Make application feel uneventful.** *Use this version* applies exactly
that staged version through the existing guarded write seam; the Studio rereads
the Work from storage and shows the passage in its real context, authorship
trail preserved. ⛔ No sense of "AI did something behind the curtain."

**10 · Harden on real manuscripts, not fixtures.** Accessibility · keyboard ·
tablet · long books · large recurrence sets · stale proposals · interruption ·
recovery · performance · provenance and history · novice comprehension.

> **The usability test: can a writer unfamiliar with our architecture work with
> MAIA for an hour without needing to understand any of it?**

---

## Standing at charter

```
BUILT · WITNESSED
  MAIA/proposal can point at an exact place                    ✓
  Work state is protected                                       ✓
  the server owns write authority                               ✓
  inspection-only is structural                                 ✓
  exact acceptance is guarded and atomic                        ✓
  stale state refuses rather than rebases                       ✓
  in-place locus + Current / Would read                         ✓

NEXT
  authored proposal succession                             step 1

NOT BUILT
  MAIA-originated suggestions · writer edits to a staged suggestion ·
  the revise loop · the conversational surface ·
  multi-location editorial workspaces · coordinated final edits
```

⛔ **The witness panel is frozen at `e5b363995`.** It proved the machinery and is
not the design template.

---

## Constraints this charter carries in

- **The branch gate (2026-09-07).** ⛔ No migration is authored onto a branch
  whose becoming canonical would itself make it deployable. **Step 1's schema
  therefore needs its own lane and its own branch**, and a separate founder
  authorization.
- **The naming ruling (2026-09-14).** Proposal and authorization are different
  objects. ⛔ No superset migration; the eight identity questions are answered
  per object before any SQL naming is chosen.
- **The four kinds.** Only CHANGE may bind an authorization. The other three are
  safe because there is no executable object for them to become.
- **v35 / v36.** System acceptance REAL, authorial ratification UNRESOLVED.
  Outside this charter and unchanged by it.

## ⭐ The open design question, owed before the first `CREATE TABLE`

> **Does a succession chain belong to a single locus, or can one editorial
> ruling own several?**

The linear `v1 → v2 → v3 → v4` case is not the campfire case. That is **one
ruling** — *keep the first and last, let the middle become a callback* —
governing **three loci**, each with its own wording chain, with exact changes
generated only afterward. ⛔ If succession is designed for the linear case
alone, the coordinated case needs a second mechanism beside it — which is how
two objects end up sharing one table again, the thing the naming ruling exists
to prevent.

⚠️ Step 8 depends on the answer. Answering it after the schema is written is
answering it too late.

---

> *notice → understand → discuss → explore → revise → refine → decide → apply*

---

## Appendix · first design reference (founder, 2026-09-14)

A full-surface mockup: MAIA rail · Manuscript outline grouped into Parts · the
Work typeset as a book (part label, chapter title, epigraph, pull-quote,
marginal ornament) · a MAIA panel with **Suggestions / Conversation / Research**
tabs · a suggestion card reading *Your original → MAIA suggests → Why this
matters* with **Try this · Keep mine · Edit together · Ask MAIA why**.

### What it already gets right, and should be kept

- **The triad is exactly the objective's shape** — original, suggestion,
  rationale — in the writer's language rather than the system's.
- **The verbs are human.** *Try this · Keep mine · Edit together* are what the
  writer is doing, not what the system is doing.
- **`1 of 3` with prev/next is sequential review**, arrived at independently —
  the Word pattern, and the seed of the recurrence walk-through in step 7.
- **Three MAIA modes in one place** (suggest · converse · research) without
  ejecting the writer from the manuscript.
- **It feels like a book.** The Work is typeset, not rendered.

### ⚠️ Three things to resolve in the research, not after

1. **The suggestion is not anchored in the Work.** The card quotes *Your
   original*; nothing marks where it lives. Survivable for one sentence, and it
   breaks at every larger scale. ⭐ The in-place locus already built must carry
   over — *the writer should never hold two texts in their head to compare them.*
2. **`1 of 3` is ambiguous, and the ambiguity is the whole product.** Three
   unrelated suggestions in a queue is Grammarly. Three occurrences of ONE
   pattern is developmental editing. The same control means both, and the writer
   must be able to tell instantly which one they are in.
3. **The progress bar and deadline are engagement mechanics on creative work.**
   `22% · Complete first draft by Dec 31` invites the sovereignty check: does
   this increase agency, push life outward, and reduce the system's
   psychological centrality over time? ⛔ Founder's call, flagged not decided.

### ⭐⭐ Candidate scale rule, for the research to test

> **The panel holds MAIA's voice and the writer's choices. The centre holds the
> evidence — at whatever scale the question has.**

```
sentence      centre = the prose, locus marked        panel = the card as drawn
paragraph     centre = the passage marked whole       panel = the same card, grown
several places  centre = the OUTLINE, occurrences pinned and the rest dimmed,
                         so the writer sees them in the book's real geometry
                panel = the guide through them, one at a time — and `1 of 3`
                         now means something
whole book    centre = a MAP of the Work with the pattern drawn across it
              panel = what she noticed, before any change exists
```

⭐ This is the existing law generalised: *evidence belongs in the Work* — where
"the Work" stops meaning "this section's prose" and starts meaning **the Work at
the scale of the question being asked.**

⛔ Not a decision. The research lane tests it against the eleven scenarios.

### Adoption ruling (founder, 2026-09-14): *"adopt as much as possible"*

```
ADOPT
  Outline / Full manuscript toggle in the Manuscript column
  Section N of 174, with prev/next, in the canvas header
  Saved 2m ago · the overflow menu
  the MAIA panel structure — tabs, card, triad, human verbs
  the bottom bar — book · writing progress · your goal · a quote
                   (founder-endorsed after the engagement-mechanic flag)

HOLD
  Share — there is no sharing model. An inert control that implies a
          capability is "declaration is not liveness" in the surface.
```

### 🔴 DEFECT THE MOCKUP EXPOSED · section numbering disagrees with itself

```
StructuredOutline.tsx:198   {s.position}.              → "22."
ManuscriptOutline.tsx:192   {s.position}.              → "22."
preview.ts:136              Section ${position + 1}    → "Section 23"
```

The outline shows **22**, the MAIA panel says **Section 23**, for the same
section, on the same screen, today. The outline is 0-indexed because position 0
is real (`0. Untitled section`); the panel is 1-indexed because that is how a
writer counts.

⛔ **Settle this before a third place shows a number.** `Section N of 174` in
the canvas header would make it three disagreeing counters. ⚠️ And the Work's
own printed pagination (`-- 34 of 216 --`) is a FOURTH number, from the source
document — a section index and a page number are different facts and must not be
made to look alike.

### Four changes to the mockup, and why

1. **The left toggle collides with the centre's.** The canvas already has
   `Section / Whole manuscript`; the column's `Outline / Full manuscript` reads
   as the same choice made twice. ⭐ The column's real job in the mockup is
   GROUPING — Parts versus a flat list (WS2-05A structure, already built). Name
   it that and the collision disappears: **the centre decides the view, the
   column decides the grouping.**
2. **`Saved 2m ago` must be able to say the other two things.** The save queue
   has three real states, and `hasUnsavedWork()` already exists. A warm label
   that reads "Saved" while a save is in flight is a small lie in the one place
   a writer checks when they are anxious.
3. **`Try this` is only honest after step 1.** The word promises reversibility.
   If it writes, it is wrong; if it stages a version the writer can discard, it
   is exactly right — and staged versions are what succession creates. ⭐ An
   example of language and architecture having to land together.
4. **`Ask MAIA why` sits beside a visible `Why this matters`.** Two whys, one
   answered. If the button opens conversation, call it that — *Talk about this*.

### One addition the ladder requires

The card shows a title and a leaf. It does not show **which of the four kinds**
this is. INSIGHT · DIRECTION · SUGGESTION · CHANGE differ in what they ask of
the writer and in whether they can ever cross into the Work, and that difference
must be visible — ⚠️ more visible as the language gets warmer, not less.

⭐ **The room already holds the honest version of the goal slot**: *"A goal is
yours to set. There is no way to declare one here yet, so nothing is measured."*
The mockup fills that slot in. ⛔ Keep the posture: the goal is the writer's to
set, and progress measures what THEY asked to measure — never what the system
would prefer they do.

---

## Appendix · "what inspires this writing" — door census (2026-09-14)

**The founder asked for an opening section capturing the writers, books,
subjects and ideas behind the Work — to remind the writer and to educate MAIA
about the nature of their work.**

⭐⭐ **It exists.** `MaterialsDrawer`, the Work Continuity Layer's first slice
(`docs/design/author-studio/WORK_MATERIALS_GATHERING_DESIGN_2026-08-05.md`,
walks M1–M7), on `living_work_materials`. ⛔ Nothing needs inventing.

### The ratified design already answers the request

> *A material is a BELONGING, not a thing: the member's sentence renders first,
> the thing's name second, its home stated plainly. Bringing is the member's
> gesture — **the crossing is the consent event** — and un-belonging removes the
> relationship, never the thing.*

**The member's sentence renders FIRST.** That is precisely "remind them and
educate MAIA about the nature of their work" — not a metadata field about an
influence, but the writer saying in their own words why it belongs to this book.

### And the schema is already open enough

```sql
living_work_materials
  material_type          TEXT   -- no CHECK: a writer, a book, a subject, an idea
  material_id            TEXT   -- not a FK: it can name something off-platform
  relationship_sentence  TEXT   -- the member's own words
  declared_by · declared_at
  UNIQUE (living_work_id, material_type, material_id)

living_work_material_considerations
  state TEXT CHECK (state IN ('maybe', 'not_now'))   -- neither asserts belonging
```

⭐ `material_type` and `material_id` are TEXT by design, so **Rilke, a book not
in the platform, "grief", or an idea are all expressible without a migration.**
And `considerations` already holds the honest middle ground — *maybe* and *not
now* — for something circling the Work without belonging to it yet.

### What is actually missing — three things, none of them a new object

1. **Only `manuscript` materials are produced today.** Walk M1 deliberately took
   platform-native things first. The other types need a way to be brought, not a
   schema.
2. ⭐⭐ **MAIA cannot read materials.** This is the whole of the founder's second
   reason — *educate MAIA about the nature of their work* — and it is the gap.
   The S3 developmental Ask reads the manuscript; it does not read what the
   writer said feeds it. ⛔ A material is a member declaration, so reading it is
   a disclosure question, not a convenience: it belongs on the same authority
   footing as the rest of the Ask.
3. **The rail the founder approved has no Materials on it.** The full mockup
   carried `Materials · 0`; the approved rail crop drops it and `Goals`. ⚠️ The
   thing being asked for would have nowhere to live.

### Placement

The founder's instinct — left lane, with a presence at top or bottom — matches
where it already is. ⛔ And the shell's existing law governs it:
`assertShellPromisesNothing` refuses a count on a destination that is not
actionable, because shipping `24` and `12` to a member "as if they were their
own materials and notes" is exactly the failure it was written against. **A
Materials count in the rail must be the writer's real count or absent.**

### ⛔ RULING · "Influences" is NOT BUILT — absorbed by Materials + relational intelligence

**Founder, 2026-09-14.**

> **Influence is not another container. It is a relationship.**

```
MATERIAL
   ├── informs    ──► a section
   ├── resonates  ──► a theme
   ├── supports   ──► a claim
   ├── challenges ──► an idea
   └── influences ──► the Work
```

A source can influence one sentence, a section, several chapters, a theme, the
writer's language, or the conceptual architecture of the whole book. ⛔ A room
called *Influences* would be a fourth container for a thing that is not a
container.

```
WORK                      MAIA
  Home                      Conversations
  Manuscript                Discover
  Materials   ← deepen      Insights
  Structure                 Suggestions
  Notes
  Versions
```

⭐ The same principle as the editorial UX: **change the centre according to the
scale of the question instead of proliferating rooms.** Fewer concepts exposed
to the person; a richer system underneath.

> *A writer does not usually experience an influence as a place they go. They
> experience it as something that begins speaking again inside the Work.*
> **Materials holds the things. MAIA reveals the relationships.**

### ⚠️ The one thing to settle before this becomes a build

**Those five verbs are not all the same kind of statement, and the difference is
the one this programme spent 2026-09-14 closing.**

```
the writer's declaration        MAIA's reading
  "this supports my point"        "this challenges that idea"
  "this informs this chapter"     "you've returned to this image
                                   in three notes and two chapters"
```

⛔ A member declaration and a MAIA observation must not share one object. That
is the four-kinds ladder restated at the material: the writer's relationship is
a **fact she may read**; MAIA's noticing is an **INSIGHT** — which can be wrong,
can be dismissed, and must be correctable without deleting anything the writer
said. `relationship_sentence` is already the writer's. MAIA's side needs to be
separately authored, or her guess becomes indistinguishable from the writer's
claim the moment both are rendered in the same list.

⚠️ **And the grain differs.** `living_work_materials` is
`UNIQUE (living_work_id, material_type, material_id)` — one row per material per
Work. A material that informs a SECTION is a different cardinality. ⛔ Do not
add `section_id` to that row; the relationship is its own object.

⚠️ **`Related material · 3` is a count, and a count is a claim.** Three the
writer placed there, or three MAIA suspects? The existing shell law
(`assertShellPromisesNothing`) refuses a promised count for exactly this reason.
The affordance must not let MAIA's confidence borrow the authority of the
writer's declaration.
