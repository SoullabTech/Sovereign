# Creative Environment — Comparative Study

> **Why this exists.** On 2026-07-31 we discovered that the comparative study of world-class
> creative environments we had been reasoning from **did not exist in the repository**. A
> corpus-wide search for *Ulysses · iA Writer · Scrivener · Bear · Craft · Obsidian ·
> Highland · Final Draft* across `docs/` returned no design study — only incidental matches
> in unrelated files. Design decisions had been made from remembered impressions carrying
> the authority of research.
>
> **Standing rule, adopted from that error:** *Do not assume remembered research exists.
> Verify every claimed design corpus before building from it. If the corpus does not exist,
> create it before using it as an architectural foundation.*

---

## 0. Evidence class — read before citing anything below

This document is **analysis from working knowledge of these applications and their public
documentation. It is not a fresh hands-on audit, and it must not be cited as one.**

| Class | Meaning | How it may be used |
| --- | --- | --- |
| **[S] Structural** | About the app's model of work — its primary object, what it can and cannot represent. Stable across versions; low risk of being wrong. | May ground a design principle. |
| **[E] Experiential** | About how it feels in use — attention, rhythm, what recedes. Defensible but interpretive. | May ground a principle **if** the principle is also justified independently. |
| **[V] Needs verification** | Specific mechanics, defaults, or current-version behavior. | **Must not ground a decision** until a hands-on session confirms it. |

Every claim below carries a tag. **Section 4 (the principles) is deliberately built only
from [S] and [E].** No principle in this study rests on a [V] claim.

**What would upgrade this document:** an hour in each application with a real long-form
project, recording what the eye lands on first, what is required before writing can begin,
and what survives on screen at rest. Until then this is a shared vocabulary — not a
verified corpus.

---

## 1. The six primary environments

### 1.1 Ulysses

- **Governing philosophy** [E] — *Writing is a continuous practice, not a series of documents.* The application is a library of text you write in, not a tool you open files with.
- **Primary object** [S] — **the sheet**. Not a file. Sheets live in groups, can be merged, split, and glued into any output. The manuscript is assembled from sheets at export time, not stored as one.
- **Relationship it creates** [E] — the writer accumulates. Because the unit is small and the library is one continuous place, there is no ceremony to starting and no penalty for fragments.
- **What disappears** [E] — files, formatting, export layout, the concept of "saving".
- **What remains visible** [S] — the text, the sheet list, and a minimal attribute bar.
- **Long-form** [S] — excellent. A book is a group of sheets; reordering the book is reordering a list.
- **Gathering** [S] — attachments, notes, keywords, and goals attach *to sheets*. Gathering is scoped to the unit of writing.
- **Navigation** [S] — three panes: library → sheet list → editor. Panes collapse as focus narrows.
- **Structure** [S] — structure is the sheet order. There is no separate outline document to keep in sync.
- **Interruption** [E] — near-zero ambient interruption; goals are opt-in and quiet.
- **Greatest strength** — the small unit. Fragments are first-class, so the work accretes instead of requiring a decision to begin.
- **Greatest weakness** [S] — its ontology is text. Non-text material is an attachment, never a peer.
- **Adopt** — **the writable unit must be smaller than the artifact.**
- **Reject** — export-time-only assembly; the writer should be able to *see* the shape before producing it.

### 1.2 iA Writer

- **Governing philosophy** [E] — *Remove everything that is not the sentence.* Design as subtraction, taken further than anyone else.
- **Primary object** [S] — the plain-text document.
- **Relationship** [E] — the writer is alone with the current sentence. The app has an opinion about attention and enforces it.
- **What disappears** [E] — the entire interface at rest. Focus Mode dims all but the active sentence or paragraph.
- **What remains visible** [S] — text, and a single unobtrusive status line.
- **Long-form** [S] — weak natively; content blocks let documents transclude others, but it is not a manuscript manager.
- **Gathering** [S] — essentially none, by design.
- **Navigation** [E] — deliberately impoverished. There is nowhere to go, which is the point.
- **Structure** [S] — Markdown headings and nothing more.
- **Interruption** — none. The strongest performance in the set. [E]
- **Greatest strength** — proof that a writing surface can be *actually* quiet, not merely tidy.
- **Greatest weakness** — cannot hold a body of work; every session starts from the file system.
- **Adopt** — **typography and contrast are the product.** The text must be the brightest, largest, most central thing, without exception.
- **Reject** — asceticism as the whole answer. A creator with twelve years of material needs a house, not a cell.

### 1.3 Scrivener

- **Governing philosophy** [S] — *A long work has a workshop behind it.* Research, notes, outline, drafts, and cut material all live inside the project.
- **Primary object** [S] — **the project** — the closest existing analogue to a Living Work. It contains a Draft folder, Research, and Trash, and it survives every artifact produced from it.
- **Relationship** [E] — the writer is a project manager of their own book. Powerful, and the source of its cost.
- **What disappears** — very little. Almost everything is available at once. [E]
- **What remains visible** [S] — binder, editor, inspector, corkboard, outliner, metadata, snapshots, labels, targets.
- **Long-form** — the strongest in the set. Nothing else handles a 200,000-word work with research this well. [S]
- **Gathering** [S] — **best in class, and the most important precedent for the Studio.** Anything — PDFs, images, audio, web pages, notes — can live inside the project alongside the draft. This is *belonging*, implemented.
- **Navigation** [S] — the binder: one durable spine for the whole project.
- **Structure** [S] — three synchronized views of one hierarchy (binder, corkboard, outliner). Structure is directly manipulable, never inferred.
- **Interruption** [E] — no ambient interruption, but high standing cognitive load.
- **Greatest strength** — **the project outlives the artifact.** This is the single most important structural precedent available to us.
- **Greatest weakness** [E] — the workshop is always fully lit. Beginning requires configuration, and the interface never recedes as the writer goes deeper.
- **Adopt** — **the container outlives the output, and material of any kind belongs inside it.**
- **Reject** — showing the whole workshop at all times. Depth must be *available*, not *displayed*.

### 1.4 Bear

- **Governing philosophy** [E] — *Capture should cost nothing; organization should be a byproduct.*
- **Primary object** [S] — the note.
- **Relationship** [E] — frictionless. The writer never decides where something goes.
- **What disappears** [S] — folders. Tags are written inline, so filing is an act of writing.
- **What remains visible** — note list, editor, tag sidebar. [S]
- **Long-form** [S] — poor. Notes do not compose into works.
- **Gathering** [E] — excellent at capture, weak at belonging. Things are findable, not related.
- **Navigation** [S] — tag-driven.
- **Structure** — flat. [S]
- **Interruption** — minimal. [E]
- **Greatest strength** — **filing is never a separate act.**
- **Greatest weakness** — no way to say *this belongs to that work*.
- **Adopt** — **capture must cost one gesture and demand no decision.**
- **Reject** — a flat namespace as the only structure.

### 1.5 Craft

- **Governing philosophy** [E] — *Documents are made of blocks that can also be documents.* Structure is recursive and beautiful.
- **Primary object** [S] — the block / nested page.
- **Relationship** [E] — the creator composes and presents. Craft is the most *aesthetically* accomplished in the set, and the closest to the Studio's own visual ambition.
- **What disappears** [E] — the boundary between note, document, and published page.
- **What remains visible** — blocks, backlinks, style. [S]
- **Long-form** [S] — moderate. Nesting handles structure; sustained prose is not its center.
- **Gathering** [S] — good. Blocks reference blocks; anything can be linked into anything.
- **Navigation** [S] — spatial and nested, with a clear sense of *entering* a page.
- **Structure** — direct manipulation of blocks. [S]
- **Interruption** [V] — formatting affordances appear on hover/selection; the intrusiveness of this at prose length **needs verification**.
- **Greatest strength** — proof that a serious tool can be genuinely beautiful without being decorative.
- **Greatest weakness** [E] — block editing invites fiddling; the surface tempts arrangement over writing.
- **Adopt** — **beauty is a working property, and moving inward should feel like entering.**
- **Reject** — blocks as the writing unit for long-form prose.

### 1.6 Obsidian

- **Governing philosophy** [S] — *The corpus is the product; sovereignty is non-negotiable.* Plain files on the creator's own disk.
- **Primary object** [S] — the note in a **vault** — a durable, self-owned body of work.
- **Relationship** [E] — the creator builds a second memory. Relationships are authored, not inferred.
- **What disappears** — the vendor. [S]
- **What remains visible** — files, links, backlinks, graph, and whatever plugins add. [S]
- **Long-form** [S] — weak natively; long-form is a plugin concern.
- **Gathering** [S] — links and backlinks make belonging explicit and **member-authored**. The closest precedent to the Studio's Gather stage that does not interpret.
- **Navigation** [S] — links, search, and the graph.
- **Structure** [S] — emergent from authored links, never computed meaning.
- **Interruption** [E] — none by default; unbounded once plugins are added.
- **Greatest strength** — **the vault is sovereign and permanent.** Deep alignment with MAIA's vows.
- **Greatest weakness** [E] — infinite configurability. The tool becomes the hobby; many users spend more time arranging the system than working.
- **Adopt** — **relationships are authored by the creator and never computed.**
- **Reject** — configurability as a virtue. **This is the failure mode the Studio is most at risk of importing** — the House can become the project instead of the work.

---

## 2. The contrast set — what to refuse

| Environment | The lesson it teaches by contrast |
| --- | --- |
| **Notion** [E] | Infinite flexibility produces a permanent setup phase. The work never starts because the workspace is never finished. **Refuse: making the creator build the environment.** |
| **Google Docs** [E] | Collaboration-first design puts other people's presence permanently on screen. **Refuse: ambient social presence in a writing room.** |
| **Apple Notes** [S] | Perfect capture, no ontology. Everything is equally weightless, so nothing accumulates into a work. **Refuse: capture without belonging.** |
| **Final Draft** [S] | The form dictates the tool absolutely; the artifact type *is* the application. **Refuse: letting one expression define the environment** — the exact error the Studio made with the manuscript. |
| **Highland** [E] | Radical simplicity works when the output form is fixed and known. **Note: not available to us** — the Studio's outputs are plural by ruling. |

---

## 3. What none of them do

No environment in this study holds **inquiry** as a first-class object. Questions, in every
one of them, are text like any other text.

The Roadmap places **Questions** at stage 4 with the rationale that *questions are living
energy*. That is not an idea recovered from this corpus. It is **original to the Studio**,
and this study is the evidence for that claim rather than an argument against it.

Likewise, none of them holds **conversation** as material belonging to the work — because
none of them has a MAIA. Both are genuine open ground, and both must be built to the same
standard as everything else: authored, never inferred.

---

## 4. The principles

Derived only from **[S]** and **[E]** claims. Each is stated as an experiential property,
not a feature.

**P1 · The container outlives the artifact.** *(Scrivener, Obsidian)* The environment holds
a body of work that persists across every output produced from it. — Directly supports the
Living Work ruling.

**P2 · The writable unit is smaller than the artifact.** *(Ulysses, Bear)* A creator must be
able to add a fragment without deciding what it belongs to yet.

**P3 · Capture costs one gesture and no decision.** *(Bear)* Filing is never a separate act.

**P4 · Relationships are authored, never computed.** *(Obsidian)* The system may hold and
return; it may not decide what belongs with what. — Independently required by the Living
Work ruling's exclusion of AI interpretation.

**P5 · The text is the brightest thing.** *(iA Writer)* Typography and contrast are not
polish; they are the product. — This is now measurable: **the writing surface's own prose
must have the highest contrast on the page, and no chrome may exceed it.**

**P6 · Structure is directly manipulated and always visible on demand.** *(Scrivener, Craft)*
Never a form; never inferred; never a second document to keep in sync.

**P7 · Depth is available, not displayed.** *(the Scrivener correction)* Capability that
exists must not be permanently on screen.

**P8 · Moving inward feels like entering, not like launching.** *(Craft; the failure mode
the Studio currently has)* Continuity of place across every depth.

**P9 · The environment must never become the project.** *(the Obsidian/Notion warning)*
Configuration is not creative work. If a creator can spend an hour improving the Studio
instead of their work, the Studio has failed.

**P10 · One durable spine.** *(Scrivener's binder)* A single, stable orientation object that
does not change as the creator moves between rooms.

---

## 5. The Studio against the principles

Assessed against `95bee3a03` as walked on 2026-07-31.

| # | Principle | Status | Note |
| --- | --- | --- | --- |
| P1 | Container outlives artifact | **absent** | The manuscript *is* the container. This is the ruling's target. |
| P2 | Unit smaller than artifact | **absent** | Nothing smaller than a manuscript can be created. |
| P3 | Capture in one gesture | **absent** | Import is a destination with a form. |
| P4 | Relationships authored | **already present** | No inference anywhere. Strongest alignment in the set. |
| P5 | The text is the brightest thing | **repaired 2026-07-31** | Was inverted by a global form rule; now cream on espresso at 19px/64ch. |
| P6 | Structure directly manipulated | **partially present** | Segmentation is member-confirmed and editable; there is no view of the whole. |
| P7 | Depth available, not displayed | **partially present** | Seven tabs are permanently displayed; unbuilt rooms are correctly *not*. |
| P8 | Moving inward feels like entering | **absent** | The Shell vanishes at Layer 3 — the defect Kelly named. |
| P9 | Environment never becomes the project | **already present** | Nothing to configure. **Protect this** — every future stage threatens it. |
| P10 | One durable spine | **partially present** | `studioMap` is a real spine; it does not survive into the room it leads to. |

**Reading.** The two principles the Studio already satisfies (**P4, P9**) are the two that
are hardest to retrofit and easiest to lose. Most of the absences are consequences of a
single cause — the manuscript standing where the Living Work belongs.

---

## 6. How this changes PR review

Replacing *"does this satisfy the ticket?"*:

1. **Which experiential property did this improve?** — named from §4 or from the spec's five properties.
2. **Which property did it unintentionally weaken?** — answered honestly, including *"none that I can identify"*, which is a weaker claim than *"none."*
3. **Does it move the Studio toward being a house for the work, or extend the Manuscript Room?**

The spec (`AUTHOR_STUDIO_EXPERIENCE_SPEC.md`) references these principles by number. **It
must never reference the applications.** The Studio does not become *like Ulysses*; it
protects the invariants that make Ulysses work.
