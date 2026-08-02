# Writer's Studio — Product Definition

> **Status:** Draft v1. **Authored by Kelly, 2026-08-02.** Recorded verbatim in substance;
> not ratified. This is a **north star, not a specification** — the document every future
> Writer's Studio PR is judged against.
>
> **How to use it:** every slice answers one question — *does this move us toward the
> Canvas-centred Writer's Studio, or merely improve the old manuscript page?*

---

## Purpose

The Writer's Studio is not a manuscript editor.

It is a place where people do the work of writing.

A manuscript is one possible expression of that work. It is not the work itself.

The Studio exists to support the entire creative process — from the first vague intuition to
a finished published book — without requiring the member to leave the same environment.

## The primary object is the Project

The Studio is organized around projects. A project might be: a book · an article · a speech ·
a course · a workshop · a newsletter · a journal · research · a collection of ideas ·
something whose form is not yet known.

The member may have many projects simultaneously. **Projects are first-class citizens.**

## Arrival

Entering the Writer's Studio should never feel like opening a document. It should feel like
entering a creative workspace.

The first question is not *Which manuscript?* The first question is **What are you working on
today?**

- If no project exists: begin something new.
- If several projects exist: continue one of them.

## The Canvas

**The Canvas is the Writer's Studio.** It is not a separate feature. It is the environment
within which all creative work happens. Everything else lives inside it.

The Canvas is calm. It is spacious. It feels like a room rather than software.

## The Canvas contains modes

Modes are different kinds of work. **A mode exists only when the primary human activity
changes** — not because buttons change.

Each mode acts on the same project. Switching modes changes **posture, not destination**.

**Write** — where words are born. The WriterField sits at the centre. Around it are only those
tools that directly support writing: word count · revision status · autosave · Keeps ·
Bring In · focus mode · chapter navigation. *Nothing exists simply because another editor has
it. Everything earns its place by supporting writing.*

**Structure** — changes organization, not wording. Chapters · scenes · sections · arguments ·
flow. The work remains the same work.

**Revise** — compares, remembers, questions, helps the writer decide. **Nothing changes until
the writer chooses.**

**Design** — typography · layout · pages · export · book production. Today's Founder Canvas is
the **embryo** of this mode. Eventually it becomes one mode inside the Writer's Studio rather
than a separate application.

**Publish** — gathers everything needed to produce the finished work. Print · digital ·
metadata · ISBN · exports · distribution.

## One project. One continuity.

Changing modes never changes projects. The project persists. The writing persists. The history
persists. **The member never wonders where the work went.**

## Multiple projects

A writer rarely has only one thing alive. The Studio assumes plurality — books, articles,
talks, essays, research, notes may all coexist.

Returning to the Studio means **returning to one's creative life — not simply reopening a
file.**

## Technical principles

The current persistence substrate survives: autosave · optimistic concurrency · revision
history · Explicit Insertion · Returning State · idempotency · conflict detection.

**These are implementation contracts. They are not the experience.**

## Non-negotiable acceptance criteria

The Writer's Studio must not regress into the previous manuscript page. The previous Working
Draft experience may continue temporarily as an **implementation substrate**. It is not the
finished member experience.

The completed Writer's Studio must present:

- Project selection **before** documents
- Canvas as the primary environment
- WriterField **inside** the Canvas
- Multiple simultaneous projects
- Structure and navigation as first-class parts of the environment
- Import as **one way to begin** — not the defining purpose of the Studio

> No walkthrough or screenshot of the completed Writer's Studio should truthfully be
> describable as: *"It's the same brown page with a better editor."*
> That would mean the implementation succeeded while the product failed.

## Design principle

**Do not confuse preserving the substrate with preserving the experience.**

The persistence architecture, revision system, concurrency model, and continuity mechanisms
should be preserved wherever possible. The sparse manuscript page should not.

The Writer's Studio should feel like entering a place where serious creative work happens —
not like opening a text editor.

---

## Phase 4 — Field objects become a shared creative substrate

> **Authored by Kelly, 2026-08-01.** Recorded, not ratified. No build authorization.
> Phase 3 makes multiple projects real. Phase 4 answers: **what can a member bring into
> those projects, arrange there, and carry between them?**

**Core outcome.** A member works with more than Keeps. Ideas · Decisions · Journal entries ·
Changes · Quotes · research notes · conversation excerpts · voice-note transcripts · (later)
images and source references appear as cards on a project Canvas **without being copied,
consumed, or reinterpreted.**

**The governing model — five layers that must not collapse into one object:**

```text
Source record        holds detail
    ↓
Canonical atom       the continuity anchor
    ↓
Placement            records where the member put it
    ↓
Project Canvas       gives it context
    ↓
Expression           something the member later creates from it
```

### Slices

**4A — Finish canonical atom coverage.** Keeps are today's cleanest path. Ideas, Decisions,
Journals and Changes need a consistent route into canonical atoms. For each source type: a
member act creates or confirms the atom · the atom points back to source detail · privacy and
sanctuary metadata remain intact · duplicate atom creation is prevented · source deletion or
mutation has explicit consequences. **Do not point Canvas cards at every source table
independently** — that recreates the silos the atom layer was meant to unify.

**4B — Add source adapters one at a time,** in observed order of value: Keeps → Ideas →
Journal entries → Decisions → Changes. Each adapter must prove: search · resolve · member
ownership · sanctuary exclusion · no mutation · no `return_preference` change · no MAIA
inference.

**4C — Cross-project placement.** The same atom may appear in more than one project. That
creates **multiple placement records pointing to one atom** — never a duplicate of the
underlying thought. One Keep may sit in Elemental Alchemy, Practitioner Training and Retreat
Curriculum at once, each with its own spatial context.

**4D — Member-authored relationships.** Place cards together · separate them · duplicate a
placement · move between groups · name a pile · remove a placement · return the atom to the
Shelf. **The system preserves relationships but does not interpret them.**

**4E — Bring a chosen arrangement into writing.** Only after placement behavior is proven. The
member selects a group and chooses *Begin writing from this group.* That act does not consume
the atoms · does not mutate source records · creates or opens a governed writing expression ·
makes the material available to WriterField · preserves provenance · remains reversible. **It
must not automatically concatenate fragments into authoritative prose without a member act.**

**MAIA's role — still restrained.** Phase 4 includes no automatic clustering · no suggested
themes · no naming piles · no inferred readiness · no *"these belong together"* claims · no
moving cards · no deciding which project an atom belongs to. **The member authors the
arrangement.**

**What Phase 4 must not become.** A universal dashboard of every memory · an AI knowledge
graph · automatic cross-project relationships · a single global Canvas with no project context
· source-type-specific card systems · silent consent changes when an object is displayed ·
**placement treated as permission for MAIA to surface material later.**

**Acceptance.** A member can: find several kinds of material they deliberately preserved →
place them into a chosen project → arrange them into member-named piles → use the same atom in
more than one project → leave and return with all arrangements intact → confirm the underlying
source and privacy metadata are unchanged → explicitly choose a pile as material for writing →
return later and continue without losing provenance.

> The decisive question: **can a member gather the scattered pieces of their life and work
> into a project without the system claiming authorship over their meaning?**

**Sequence.** Phase 4 begins after Phase 2's arrangement verbs are stable, Phase 3 establishes
project identity and project-bound Canvas state, and canonical atom coverage is reconciled
beyond Keeps. Then: atom coverage → source adapters → cross-project placement → explicit
pile-to-writing gesture.

This is the phase where the old index-card practice becomes a genuine platform capability
rather than a Writer's Studio feature.

### Ontology restatement — recorded here, ruled in canon

> **Kelly, 2026-08-02, after the Member Field ratification.** ⛔ **Nothing here is ratified by
> appearing in this document.** The binding text is
> `docs/canon/MEMBER_FIELD_AND_STUDIO_DIRECTIVE.md`; Amendment 4 is **cited as already ruled
> there, not re-ratified here.** This section records what the ruling means for the Phase 4
> roadmap — roadmap material, which is why it lives in the Product Definition and not in canon.

The Workbench was originally modelled `Sources → Cards → Groups → Draft`. Post-ratification
that ontology is wrong. The restated chain, with Amendment 4's correction applied:

```text
Field Object
    ↓
Project Reference
    ↓
Placement
    ↓
Surface projection and arrangement
    ↓
Project Development Record
    ↓
Expression
```

The first deliberate placement may create the Project Reference. Thereafter: **removing a
Placement does not remove the Reference** · **removing a Reference requires a separate explicit
act** · **connecting References to an Expression requires another explicit member act** · and
**that connection does not make the Field Objects manuscript content.**

Five consequences follow. **Three restate already-ratified canon; one is now ruled by
Amendment 4; one is a conceptual framing recorded but not separately ruled.**

1. **Placement is no longer UI state** — it is its own object, knowing which Field Object it
   references · which project · which pile · where it sits · when placed · (if collaboration
   ever exists) who placed it. Those are properties of the placement, not of the Field Object.
   One Keep may carry several placements without the Keep changing.
2. **Projects are relationships, not containers.** A project does not own Keeps; *the project
   has discovered that this Keep matters.* ✅ Already ratified — *"Project — references Field
   Objects."*
3. **Project Development is a first-class record** — developmental questions · discarded
   hypotheses · chapter experiments · structural observations · author decisions · unresolved
   tensions. **The work's memory, not manuscript and not Field.** ✅ Already ratified as the
   `Project Development Record` (Amendment 1).
4. **Contextual retrieval draws from several contexts at once** — directly referenced Field
   Objects · nearby Field Objects · Development Notes · related journals, Keeps, Decisions,
   Changes — **each visibly identified by object type. Nothing masquerades as manuscript.**
   ✅ Already ratified; also the standing gate on the second Shelf source.
5. **Adapters become projections.** Not *"write an Ideas adapter"* but *"project the Member
   Field into this surface."* The adapter creates no object; it gives one class of Field
   Object a representation inside the current environment.

Consequence 1 was settled by **Amendment 4 — Project Reference and Placement**, ruled
2026-08-02: *Reference is the durable layer; Placement is surface state.* Two shelves follow —
the **Field Shelf** (the member's wider Field) and the **Project Shelf** (referenced but not
currently placed) — and *Return to Shelf* ordinarily means the Project Shelf, not disappearance
into the undifferentiated Field. Binding text lives in the canon directive; this document only
cites it.

**Consequence for `graduate.ts`.** Amendment 4 makes it **formally superseded for any future
member path.** It needs no removal today — it remains founder-gated and unreachable to members
— but **no lane may expose it without first replacing its flatten-and-copy semantics.**
Graduation must not flatten, concatenate, copy, or consume referenced Field Objects as if they
were manuscript text.

**Sequencing (Kelly, correcting an earlier framing):** the **model** comes first. Whether
Placement immediately becomes its own table, or initially lives inside JSON and graduates
later, is an **implementation consequence of the model — not the architectural starting
point.**

---

## Phase 6 — Design Studio

> **Authored by Kelly, 2026-08-01.** Recorded, not ratified. Elaborates the **Design** mode
> named above. No build authorization.

**Core question:** how does a body of writing become a beautiful work without breaking the
creative flow?

The shift is `Thinking → Writing → Design`, not `Thinking → open another application`. The
Design Studio is the next room of the same house.

**The member arrives with something.** By Phase 6 they already have projects, Canvas,
WriterField, piles, drafts, revisions, field objects, structure. They say: *"I'm ready to make
this into something."* That changes the posture completely.

**The verbs change.** Not Capture · Gather · Arrange · Write. Now: Design · Flow · Place ·
Balance · Typeset · Review · Produce.

**The objects change.** Not Keeps · Ideas · piles · drafts. Now pages · spreads · chapters ·
front matter · images · tables · typography · page styles · ornaments · margins · running
heads · TOC · indexes. These are **publication objects, not thinking objects.**

**The Canvas changes meaning:** worktable → drafting table.

This is where the founder typesetting Canvas finally belongs — as the *end* of the Studio
progression, not its beginning. Its page layout, inspector, templates, page ordering, PDF
generation and print preparation become the first generation of Design Studio. **They must
migrate onto the same persistence substrate as everything else. LocalStorage and iframes
disappear.**

The member is now looking at pages not because pages are how people think, but because
**pages are how books are made.**

**Relationship to WriterField.** The writing remains editable; Design *references* it. There
is one living manuscript, and Design is another way of viewing it. The member must never
wonder: *"Which copy is the real one?"*

**Outputs.** A project should eventually produce paperback · hardcover · Kindle · EPUB · PDF ·
print-ready, without leaving the Studio.

**MAIA's role — still restrained.** Helpful: typography explanations · print terminology ·
accessibility checks · consistency checks · missing front matter · widows/orphans warnings ·
export diagnostics. Not helpful: redesigning the member's book · changing their prose ·
rearranging chapters · making aesthetic decisions for them.

**Acceptance.** A member can: open a completed writing project → move naturally into Design
Studio → see a beautifully typeset version immediately → adjust layout without affecting
authorship → add front matter and publication elements → generate professional PDF and EPUB →
return to writing without breaking continuity → move back into Design with everything
preserved.

### The three Canvases

Members never experience these as separate products:

- **Thinking Canvas** — worktable · cards · piles · discovery
- **Writing Canvas** — living manuscript · WriterField · revision · structure
- **Design Canvas** — pages · typography · publication · export

One Studio, because the underlying project is continuous. The member doesn't switch apps; they
change the kind of work they're doing. Most writing software makes people move from notes to
documents to layout in disconnected environments. **That continuity is the architectural idea
worth protecting as the Studio evolves.**

---

## Phase 7 — Steward

> **Authored by Kelly, 2026-08-02.** Recorded, not ratified. No build authorization.
> Named **Steward**, not Share — by this point the member is no longer writing a book;
> they are caring for the ongoing life of a body of work.

**Core question:** how does a finished work continue living without leaving the Studio?

This is not publishing — Phase 6 creates an artifact. **Phase 7 creates a living body of work.**
Publication is not the end of the progression; it is the beginning of a new relationship.

`Capture → Gather → Arrange → Compose → Design → Publish → Steward`

**A project becomes an ecosystem.** A book is not finished; it begins generating talks ·
workshops · retreats · articles · newsletters · podcasts · videos · discussion guides · study
groups · coaching sessions. All are expressions of the same project, sharing one living root:

```text
Elemental Alchemy
├── Book
├── Workbook
├── Course
├── Podcast
├── Retreat
├── Newsletter
├── Articles
├── Social excerpts
├── Quotes
├── Teaching notes
└── MAIA knowledge
```

**Reuse becomes first-class.** A member selects a chapter and asks for a 45-minute workshop —
not to have it written, but to have the material already present *collected*: passages ·
stories · exercises · journal prompts · decisions · Keeps · illustrations · examples.
**The member authors. The Studio gathers.**

**Teaching mode.** Psychologists, coaches, spiritual directors, professors, executive coaches,
therapists, ministers do not stop at a manuscript — they teach from it. The Studio should
understand that.

**Conversation with readers.** Readers ask → questions accumulate → the author answers → those
answers become new Keeps → new projects emerge.

**Multiple editions.** `Edition 1 → reader feedback → revision → Edition 2 → translation →
audiobook.` **The Studio preserves lineage** between every expression.

**MAIA's role — first true collaboration, still not authorship.** MAIA helps the member steward
an expanding body of work by observing the ecosystem: *"These reader questions keep returning."*
· *"This chapter is generating the most discussion."* · *"Several workshops draw from the same
material."* · *"This insight now exists in five places."*

**Communities.** Eventually projects become communities — study circles · courses · reading
groups · practitioner cohorts. Organized around a body of work, **not a social network.**

**The deepest shift.** By Phase 7 the platform supports the whole lifecycle of meaningful work:
`Experience → Capture → Meaning → Writing → Publication → Teaching → Community → Legacy`.
That is larger than a Writer's Studio.

**The phase ledger.** Phase 1 Begin · Phase 2 Gather · Phase 3 Commit · Phase 4 Integrate ·
Phase 5 Compose · Phase 6 Design · **Phase 7 Steward.**

**Acceptance.** A member can: publish a finished work → generate multiple derivative expressions
from the same project → teach from it → answer reader questions → evolve new editions → preserve
lineage between all expressions → continue creating without fragmenting the work into
disconnected files.

### Raised by this phase, not ruled here

Recorded so they are not discovered late. Neither is answered by this document.

1. **Readers are third parties.** Reader questions, discussion, study circles and cohorts
   introduce people who are not the member into the member's Studio. Nothing in the current
   consent architecture governs a non-member's words entering a member's body of work.
2. **Ecosystem observation is cross-work aggregation.** *"This insight now exists in five
   places"* is a claim across works. It is a different authority than surfacing what the member
   marked, and it sits on the line the freeze on synthesis and pattern attunement was drawn to
   protect.

---

## Decision rule (operative)

> Never optimize the existing manuscript page into permanence. If a decision makes the old page
> a little better but delays or weakens the Canvas becoming the primary Writer's Studio
> experience, **prefer the Canvas.** Preserve implementation contracts; do not preserve an
> obsolete interaction model.
