# WRITER-STUDIO-R2 — Phase 3: Rulings and Studio Grammar

> **Status**: Phase 3 of `WRITER-STUDIO-R2`, 2026-08-24. **Decision surface. No production
> code. Authorizes no build.** The W8 freeze on the Canvas implementation lane is treated as
> binding throughout. PR #995 is not merged. `Worktable.tsx` and the drawer spine are not
> extended.
>
> Part 1 records the founder's rulings on C1–C6 as issued. Part 2 states the residue those
> rulings leave. Part 3 is the finding that changes the sequence. Part 4 is the Studio
> grammar. Part 5 maps every part of it to recovered evidence. Part 6 stages Phase 3A.

---

## Part 1 — The rulings, as issued (founder, 2026-08-24)

| # | Question | Ruling |
|---|---|---|
| **C1** | Containment | **The Work is the primary container.** Nothing becomes part of a Work merely because MAIA or the system thinks it belongs there. **Placement is member-declared.** |
| **C2** | Which Canvas is *the* Canvas | **The Writer Canvas is the `CanvasShell` + `registry` + `WritingSurface` architecture represented by PR #995.** `/book-studio/canvas` remains spatial/design inspiration, not a competing canonical Canvas. |
| **C3** | Press Editor vs Book Studio | **Do not create two authoring environments.** Writer's Studio is where Living Works are conceived and written. "Book" is a kind of Work. Press becomes downstream publication/production: editions, trim, front matter, proofing, export, distribution. |
| **C4** | The Structure drawer | Preserve the **capability**, not the old drawer location. **Structure is a first-class view of the Work**, not a drawer that happens to exist in one UI generation. |
| **C5** | Rail / navigator / destination | **All three, at different scales.** Navigator = normal structural navigation. Rail = collapsed/minimal state. Structure destination = expanded structural thinking/reordering. **One underlying structure model; three presentations.** The choice was false; the real question is progressive disclosure. |
| **C6** | Import identity | Never expose `book-print-kdp-final` as Work identity when we can infer better. Import establishes **Work → Edition/source → manuscript**, with member confirmation of title. **Filename is provenance, not identity.** |

**Preserved alongside them** (founder, restating the 2026-08-05 experience definition): *this is
a creation environment centered on the Work, not merely an editor. The Canvas contains editing;
editing does not define the Canvas.*

### What these supersede

- **C2** settles the four-referent confusion recorded in `WRITERS_STUDIO_ECOLOGY_ANATOMY` §9 C2.
  `/book-studio/canvas` is demoted from candidate to reference implementation.
- **C4** supersedes the two options that §9 C4 offered (narrow the label, or let the drawer
  wait) with a third: **dissolve the drawer, keep the capability, promote it to a view.**
- **C5** dissolves a contradiction rather than choosing a side. The earlier
  Structure-as-destination ruling and #995's navigator are now **the same model at two
  disclosure levels**, not rival designs.
- **C3** is the same law already ruled on 2026-08-05 in
  `WRITER_CANVAS_AND_PRESS_EDITOR_DIVISION`, arrived at independently:

  ```text
  Work
      ├── Working Draft  ← Writer Canvas
      ├── Edition 1  →  Press Editor
      └── Edition 2  →  Press Editor
  ```

  That the same grammar surfaced twice, from different directions, is the strongest available
  evidence that it is real.

---

## Part 2 — Residue: three things the rulings imply but do not state

Recorded rather than assumed. Each needs one word from the founder.

**R1 — C1 answers a different question than the archaeology's C1.**
The archaeology's C1 was a *naming* contradiction: is Author Studio the Layer-1 house (ratified
canon, `AUTHOR_STUDIO_THREE_LAYER_RULING`), or is Writer's Studio? The ruling as issued answers
*containment of content* — the Work is the primary container, placement is member-declared —
which is a deeper and more useful answer, but leaves the naming open. **Read together with C3
("Writer's Studio is where Living Works are conceived and written"), the naming appears to
resolve to: Writer's Studio is the place; Press is downstream; "Author Studio" becomes a legacy
name.** That reading is not stated and is not assumed here.

**R2 — Does the Manuscript Room survive?**
`WRITERS_STUDIO_FLOOR_PLAN_2026-08-14` names four rooms: Studio Home · Writer Canvas ·
**Manuscript Room** · Press Editor. C3 says *do not create two authoring environments*, and C5
says one structure model has three presentations. Under those two rulings the Manuscript Room
looks less like a fourth room and more like **the Canvas in its immersive stance**. If so, the
floor plan drops to three rooms and `/press/manuscript` becomes a stance, not an address.

**R3 — What happens to `/book-studio/canvas`?**
C2 demotes it to inspiration, but it is live code on a live route today, with its own layout,
reader, workbench and render pipeline. Does it stay reachable as-is, retire, or become the
implementation of Press Editor's production surface?

---

## Part 3 — The finding that changes the sequence

**The segmentation defect is not upstream of PR #995. It is inside PR #995.**

`WritingSurface.tsx` in #995 derives the navigator's heading lines by running three regexes
live over the draft text:

```js
const marked  = /^(#{1,3})\s+(.+)$/;
const chapter = /^[Cc]hapter\s+\w+.*$/;
const caps    = /^[A-Z][A-Z0-9 ,'&\-—:]{3,80}$/;
```

The third is the same shape as the one in `lib/manuscript/ingest/segment.ts:39` that produced
the founder's 216 false sections. On a print-ready KDP export it fires on **ALL-CAPS running
heads** — the book title at the top of every page.

Two consequences:

1. **Merging #995 would not fix the screen.** It would render the same wrong list of ~150
   identical entries, in a better room. The founder's instruction not to merge #995 yet is
   correct for a reason stronger than sequencing.
2. **#995 conflicts with ratified design.** `WORK_STRUCTURE_DESIGN_2026-08-05` § *Refused now*
   explicitly forbids *"auto-outline, structure detection over the draft, inferred hierarchy."*
   #995's navigator is structure detection over the draft. This is not a small deviation; it is
   the exact prohibition, and it must be reconciled before #995 comes through the gate.

### The synthesis this yields

| | Room | Structure source |
|---|---|---|
| **PR #995** | ✅ Correct — shell, easel, papers, navigator/context grammar | ❌ Live detection over draft text (refused by canon) |
| **`claude/writers-studio-organization-wxpb7q`** | ❌ Wrong — extends `Worktable` + drawer spine | ✅ Anchors *member-declared* cuts; reports drift instead of guessing |
| **Both** | | ❌ Fed by an import that produced page fragments, not chapters |

Neither branch is the answer, and neither is worthless. **#995 supplies the room; yesterday's
`manuscriptMap.ts` supplies the lawful way to locate structure inside it; Phase 3A supplies
the structure worth locating.** That is the transplant the founder described, stated precisely.

---

## Part 4 — The Studio grammar

One Work. One structure model. One Canvas. Five stances the writer moves between, and one
crossing out.

### The constant

```text
┌──────────────────────────────────────────────────────────────┐
│  toolbar — essential acts for the work at center             │
├────────────┬──────────────────────────────┬──────────────────┤
│ NAVIGATOR  │          THE EASEL           │     CONTEXT      │
│            │                              │                  │
│ where am I │       THE WORK               │  MAIA · Work     │
│ in this    │   (the one scroll region)    │  Materials       │
│ Work       │                              │  Connections     │
└────────────┴──────────────────────────────┴──────────────────┘
                    ▲ the Desk opens here, in the margin
```

`CanvasShell` already implements this, including the law that the registry can furnish the
navigator and context but **can never furnish the center** — there is deliberately no
`registerSurface`. The center belongs to the deployment; the Work belongs to the writer.

### The five stances

Same Work, same structure model, different attentional posture. Stance is a member act — the
system never changes stance on the writer's behalf.

| Stance | Regions shown | What the writer is doing | Structure appears as |
|---|---|---|---|
| **Writing** (default) | Navigator · Easel · Context | Continuing the Work, mid-motion | Navigator — normal navigation |
| **Immersive** | Rail · Easel | One measure, nothing else | Collapsed rail — position only |
| **Structural** | Structure workspace · Context | Seeing and rearranging shape | The workspace itself — the destination |
| **Gathering** | Navigator · Easel · Context · **Desk open** | Reaching for an act of writing or bringing something in | Unchanged; the Desk is in the margin |
| **Reviewing** | Navigator · Easel · Context (versions) | Comparing, restoring, seeing what changed | Per part and whole-manuscript |

**Crossing out**: Writer Canvas → Press Editor, *"make an edition"*. Deliberate, never
automatic, derived from a declared revision (`WRITER_CANVAS_AND_PRESS_EDITOR_DIVISION`). The
writer does not leave the Work; they open one form of it.

### The invariants every stance preserves

1. **The Work is the center.** No stance may put an instrument, a panel, or MAIA at the center.
2. **The Working Draft stays one authoritative document.** A narrowed frame is never a narrowed
   save. (Proven in `manuscriptMap.ts`'s `spliceFrame`; must survive the transplant.)
3. **Structure is the writer's.** Carried, declared, or arranged — never detected. This is what
   #995 must be reconciled against.
4. **Absence over emptiness.** A panel with nothing true to say does not render. Already law in
   `registry.ts`; the folded Window placeholder currently breaks it.
5. **The way back up is visible from every stance.** Ruled property, not preference.
6. **MAIA is beside the work, never inside it.** Not one of the organs; adjacent to all of them.

---

## Part 5 — Evidence map

Every part of the grammar above, and what state it is actually in.

| Grammar element | Where it exists | State |
|---|---|---|
| Canvas shell — toolbar · navigator · easel · context | `components/canvas/CanvasShell.tsx` | Merged · **0 callers** |
| Extension contract, absence-over-emptiness, no `registerSurface` | `components/canvas/registry.ts` | Merged · **0 callers** |
| The easel, the weighted sheet, papers Warm · Ivory · White · Midnight | `app/writers-studio/canvas/WritingSurface.tsx` | Merged · **0 callers** |
| The wiring — Canvas as the writing deployment | PR #995 `canvas/page.tsx` | Open since 2026-08-06 · **conflicts with Part 3** |
| Structure located lawfully from declared cuts; drift reported, never guessed | `canvas/manuscriptMap.ts` (this branch) | Built on the wrong host · transplant candidate |
| Frame narrows, storage does not | `spliceFrame` / `frameForRegion` (this branch) | Same |
| The Writer's Desk — Write · Bring Something In · Reference · Organize · Think | `WRITING_CRAFT_CAPABILITY_RECORD_2026-08-05.md` | Designed · **never built** |
| Work → Working Draft / Editions | `WRITER_CANVAS_AND_PRESS_EDITOR_DIVISION_2026-08-05.md` | Ruled · partially built |
| Rooms and crossings, the door rule, the way back up | `WRITERS_STUDIO_FLOOR_PLAN_2026-08-14.md` | Designed · see **R2** |
| Structure: carried · declared · emergent-from-arranging | `WORK_STRUCTURE_DESIGN_2026-08-05.md` | Ruled · arranging surface **has no design at all** |
| The structural workspace (C5's destination) | — | **Unbuilt and undesigned** |
| Modes: Write · Book · Idea · Journal · Research | — | **No code on canonical** |
| Revision comparison / restore | — | **Unbuilt** |

---

## Part 6 — Phase 3A, staged

The founder ruled segmentation P0 and named the ingest model that replaces
*line-looks-like-heading → section*:

```text
Source pages → furniture suppression → semantic candidates
             → structural hierarchy → member review → Work structure
```

Phase 3A must define, before any of it is built:

**The ontology.** What a **Work**, a **manuscript source**, an **edition**, a **part**, a
**chapter**, a **section**, and a **print-furniture element** each are — and which of them the
member declares versus which the system proposes. C1 governs: the system may *propose*
candidates; only a member act makes them structure.

**Reversible re-cut.** The founder's verbs, each of which must be a member gesture with a
stated consequence: ignore running heads · detect chapters again · merge these sections ·
split here · promote to chapter · demote this heading · restore original import · accept
structure.

**Two properties that make it safe**, both already precedented in this codebase:

- **Restore original import** requires the source to stay immutable — which it already is:
  the draft is initialized verbatim from `manuscript_sections` and the sections are never
  touched. The re-cut must preserve that, so "restore" is always available.
- **Re-cut must not rewrite the writer's words.** Furniture suppression removes page numbers
  and running heads from the *structure*, and must be reversible in the *text* — offered and
  previewed, never applied silently. This is the offer/adopt grammar the platform has now
  arrived at four times (renewal · materials · collaboration · editions).

---

## Sequence, as ruled

1. **Phase 3** — Studio grammar. *This document.*
2. **Phase 3A** — Import/Structure contract, including reversible re-cut.
3. **Freeze remedy** — satisfy the W8 failure; re-run W1–W8. Not routed around.
4. **#995 convergence** — bring the Canvas architecture through the gate, **reconciled against
   Part 3** (its navigator must read declared structure, not detect it).
5. **Transplant** — move framed editing and lawful structure-locating out of `Worktable.tsx`
   into the canonical Navigator/Structure system. `Worktable.tsx` is not preserved to preserve
   the code.
6. **Member-facing UX pass** — papers, focus states, the Desk, references, navigation, MAIA
   relationship, structural manipulation, import/re-cut, and the transitions among them.

## What this document does not do

It does not authorize a build lane, lift the freeze, merge #995, extend `Worktable.tsx`, or
settle R1–R3. It does not design the arranging surface, the structural workspace, or the modes
— those are named as unbuilt, and naming is not designing.
