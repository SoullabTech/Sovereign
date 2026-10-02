# Writer's Studio Home — Founder Walk Verdict and Redesign Brief

> ```text
> STATUS ........................... FOUNDER RULING + DESIGN BRIEF, 2026-08-14
> WRITER'S STUDIO HOME WALK ........ FAILED
> FAILURE POINT .................... ARRIVAL / ACTION SEMANTICS
> EXPERIENCE CONTRACT INSTALL ...... HOLD
> C1 COPY CORRECTION ............... STILL AUTHORIZED — DO NOT EXECUTE YET
> W1–W8 ............................ DO NOT ADVANCE
> MEMBER-FACING BUILD .............. CLOSED
> REDESIGN AUTHORITY ............... OPEN — DESIGN ONLY
> ```
>
> **Witness**: Kelly, authenticated walk against `localhost:3493`, referent `a2cc2d90f`,
> 2026-08-14. **This is a custody record.** It preserves a founder walk verdict and design
> brief that otherwise existed only in a chat transcript. It authorizes no implementation and
> installs nothing.
>
> **Why it is on a separate branch from the lane**: the upgrade lane
> `feature/writers-studio-member-upgrade-2026-08-14` was checked out and live in another
> session's worktree at the time of writing. Custody was taken without contesting that branch.

---

## The ruling

The two drafted room contracts remain **preserved as evidence** at `a2cc2d90f`. ⛔ They must
**not** be installed as though this journey passed.

> **"This walk did its job. It prevented a technically elaborate but experientially confusing
> structure from becoming binding simply because contracts and screenshots were completed."**

## The mechanism, confirmed against source at `a2cc2d90f`

`Continue your work` does not open the work — its handler scrolls the same page to the
`Your Work` section (`app/writers-studio/page.tsx:335`). `Bring something in` does not open an
import flow — it scrolls to a second section lower on the same page (`:361`). When the
destination is partly visible, close by, or the smooth scroll is subtle, the result is
indistinguishable from a dead button.

> **This is not primarily a technical bug. It is false action language.**

## The deeper failure

> **"The Studio is asking you to understand its architecture before it lets you continue your
> work."**

The page is simultaneously trying to be an onboarding screen · a project dashboard · a
document importer · a source library · a doorway to MAIA. Those are different moments in the
writer's journey; flattened onto one surface, every element competes with every other.

| Area | Verdict |
|---|---|
| Visual atmosphere | Worth preserving |
| Information architecture | Needs replacement |
| Interaction clarity | Failing |
| Writer's mental model | Incoherent |
| Ready for a user walk | No |

**Every top card duplicates something beneath it.** `Begin something new` duplicates the
`New project` tile; `Bring something in` duplicates the lower panel. The top row is not
navigation — it is a second set of labels for content already on the page.

### The seven specific findings

1. **"Your Work" does not contain the writer's work.** Only `New project` appears there, while
   the actual works (Your writing · Second Book · Elemental Alchemy · Elemental Alchemy KDP
   print) sit under **Bring Something In**. That tells the writer their manuscripts are
   imported files rather than living works — **the hierarchy is reversed.** Correct
   relationship: *a work contains drafts, source documents, notes, recordings, quotations.*
2. **"Continue your work" has no referent.** A continuation action must name the work and the
   place: *"Continue Elemental Alchemy — return to Chapter 7, where you left off yesterday."*
   Generic continuation is a command without an object.
3. **"Bring something in" collapses five different actions** — create a new work from a
   manuscript · add source material to an existing work · attach a note or quotation · import
   an image or recording · upload a finished reference edition. Import must always answer:
   **bring this into which work, or create a new work from it?** Nothing enters an unowned
   document warehouse.
4. **The Document control does not look like an upload control** — no choose-file, drag-and-drop,
   destination selection, import status, or success confirmation.
5. **Dead future features reduce trust.** `NOT YET` tiles should not be shown until they work.
6. **"Open" and "Source" expose machinery.** The Source ⊥ Working Draft distinction matters,
   but belongs *inside the work* where the relationship can be understood — not as a technical
   fork beneath every home-screen item.
7. **MAIA is detached from the work.** A global `Reflection with MAIA` link makes her a
   destination competing with writing. She belongs beside the current work, deliberately
   invoked.

---

## Governing interaction rule

> **A button named for an outcome must perform that outcome.**
> Continue opens the work. Import opens import. New work begins a work.
> Scrolling to another section is **navigation**, and must be represented as navigation —
> never as completion of the act.

## The redesign principle

> **Writer's Studio is the place where a writer re-enters a living work. It is not an
> onboarding menu, document manager, or import tray. The Work is primary. Everything else is
> an instrument used in relation to the Work.**

> **Stop organizing the Studio around what the system can ingest. Organize it around what the
> writer is making.**

The home must answer three questions immediately: **What am I making? · Where did I leave
off? · What is the clearest next movement?** It does not need to expose the full
Capture → Discover → Structure → Write → Refine → Publish architecture; that architecture
should support the writer without becoming the interface.

---

## The replacement: a state-aware home

### Returning writer

```text
WRITER'S STUDIO
WELCOME BACK

ELEMENTAL ALCHEMY
Book · Working Draft
Last opened today
"You had just begun revising the passage on…"
[ Continue writing ]

YOUR WORKS
[ Elemental Alchemy ]  Book · 209 pages · Last worked today
[ Second Book ]        Book · 1 page · Last worked August 12
[ Your Writing ]       Unspecified form · 1 page

[ Start a new work ]     [ Import a manuscript ]
```

The first action resumes the most recent work · project cards expose the writer's actual works ·
starting and importing are secondary · the writer is not asked an onboarding question every
time they arrive.

### First-time writer

**Two** starting paths, not three. `Continue` appears only when there is something real to
continue.

```text
WRITER'S STUDIO
BEGIN YOUR WORK

Start with something new
Open a blank writing space and let the work begin.
[ Begin a new work ]

Start with a document
Bring in a manuscript or pages you have already written.
[ Import a document ]
```

After the choice, the Studio may ask **"What is this becoming?"** with broad, non-confining
choices (book · essay · journal · course · research · teaching · other) — orienting the work
without delaying entry into the Canvas.

## The import flow

```text
BRING IN A DOCUMENT
What should this document become?
  ○ Create a new work from this document
  ○ Add it as material to an existing work
[ Choose a document ]   Accepted: DOCX, PDF, TXT, Markdown
```

After import:

```text
Elemental Alchemy has been added.
The original remains unchanged.
An editable Working Draft is ready.
[ Enter the writing space ]   [ View original ]
```

> That makes the Source ⊥ Working Draft relationship **meaningful rather than technical**.

## Inside each work

The project interior — not the home — contains the instruments.

```text
ELEMENTAL ALCHEMY
[ Write ]   [ Materials ]   [ Shape ]
------------------------------------------------
Writer Canvas
                              [ Reflect with MAIA ]
```

- **Write** — the Writer Canvas is the primary environment. Resume at the writer's last actual
  location, including cursor position where possible.
- **Materials** — imported source documents, quotations, notes, images, recordings associated
  with *this work*. This is where "bring something in" belongs: **Add material to Elemental
  Alchemy** — not as a competing home-page destination.
- **Shape** — structure or arrangement of the writer's own material. ⛔ Must not automatically
  announce themes, infer meaning, or decide what the work is about.
- **MAIA** — explicitly invoked beside the work: reflect on this passage · talk about where I
  am · help me hear what is present · consider the relationship between selected materials.
  She remains outside the authorship of the text; suggestions stay separate until deliberately
  adopted.

## Remove, rather than restyle

The three-card *"Where are you starting?"* row for returning writers · the giant empty
`New project` rectangle · the lower warehouse-like `Bring Something In` panel · all `NOT YET`
tiles · `Source` links beneath every dashboard item · the generic `Continue your work` action ·
the global `Reflection with MAIA` link · duplicate routes to the same action · any card that
appears clickable but has no completed interaction.

The four current manuscripts move into **Your Works** as actual project cards. If some are
only imported sources rather than works, the system must **say so plainly** and attach them to
a work — or invite the writer to make one from them.

## Visual direction

**Preserve**: the warm dark palette · literary serif typography · spaciousness · restrained
gold · the sense of entering a room rather than opening software.

**Change**: one unmistakable primary action · larger, clearer project titles · more useful
project metadata · stronger contrast for actionable text · fewer borders and boxes · no tiny
underlined utility links as primary navigation · project cards that feel like works, not
database records · visible hover, focus, pressed, loading, success and error states for every
interaction.

> The home should feel like **seeing one's manuscripts waiting on a writing table** — not like
> operating a file-ingestion console.

## Interaction requirements

1. A returning writer identifies the correct next action in **under five seconds**.
2. The primary button **names the work**: *Continue Elemental Alchemy*, not *Continue your work*.
3. Every visible interactive element performs an action **or clearly reports why it cannot**.
4. No action is duplicated elsewhere on the same screen.
5. Every imported item either **becomes** a work or is deliberately **attached** to one.
6. Existing works appear under **Your Works**, never under an import heading.
7. Clicking Continue restores the **actual writing context**, not merely the project homepage.
8. Unavailable capabilities remain **hidden**.
9. MAIA is invoked in relation to a selected work, passage, or material.
10. The writer can understand original material vs editable writing **without encountering
    implementation language**.

## Build sequence — ⛔ not authorized yet; recorded for when it is

> **Do not patch the current three cards and call this repaired.**

- **Pass 1 — Replace the home.** Returning and first-time states, using real works and real
  recency data. `Continue writing` is the dominant action.
- **Pass 2 — Repair creation and import.** Two complete paths — begin a new work; create or
  enrich a work from an existing document. Each must end **inside the Writer Canvas**.
- **Pass 3 — Move instruments into the work.** Materials, Source access, structure, and MAIA
  reflection live inside the selected work, not on the home screen.

---

## The authorized design-only lane

**Scope**: Writer's Studio journey reconciliation covering Writer's Studio Home · the
transition into Writer Canvas · the transition into Manuscript Room · first-time arrival ·
returning-member arrival · multiple-Work arrival · direct import · mobile arrival.

**Substrate**: preserve existing persistence, autosave, revision and rendering as
**implementation evidence, not product definition**.

> **"The underlying machinery can remain useful. But the machinery must stop defining the room."**

**Deliverable**: an **experiential map** and an **interactive prototype** for founder review
**before** any member-facing code is modified.

## What this record does not do

Installs no contract · executes no C1 correction · advances no W1–W8 step · authorizes no
implementation · modifies no member-facing code · does not touch the upgrade lane branch.
