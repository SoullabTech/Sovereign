# Writer Canvas — Replacement Plan (the ruled gate before implementation)

> **Status**: The replacement plan the founder's directive requires before
> implementation. Grounded in a full inspection of the reference
> implementation (`public/book-studio-canvas.html`, served via iframe at
> `/book-studio/canvas`). Slice contract: shell first · four extension
> points · capabilities preserved behind them · surrounding controls NOT
> finalized (founder decides the buttons after the shell is visible) ·
> replace the old layout, never iterate it.

---

## What the inspection established

1. **Book Studio's canvas is not React.** It is one 3,784-line vanilla
   HTML file (CSS 1,131 lines · markup 134 · one 2,507-line script) in a
   founder-gated iframe. There are no components to import.
2. **The shell grammar is pure and liftable.** The frame contract is
   three children of a `.workspace` grid — `220px | 1fr | 240px` under a
   toolbar — left rail, center easel (`flex-center; overflow:auto` — ONE
   scroll), right inspector; the work surface is a weighted page
   (`box-shadow 0 4px 24px`, cream `#f3eddd`, ink `#2a2418`, Crimson
   Text/Georgia). The `.page--flow`/`.flow-column` seam is *already a
   writing-shaped surface* — a centered measure column on the page.
3. **Everything behavioral is publishing-coupled** (blocks with x/y/w/h,
   page-type ontology, templates, typesetting, image bank, a 460-line
   pagination engine, Export PDF) and is rewrite-don't-port by
   construction.
4. **Book Studio's data is localStorage-only** — it never touches
   `member_manuscripts`. Writer Canvas keeps its real substrate; "shared
   manuscript underneath" becomes true the day Book Studio migrates onto
   the shared shell (a later lane, named, not smuggled into this one).
5. **Chrome palettes differ** (Book Studio cool `#1a1c20`/amber
   `#d97706`; Press warm espresso/`#C9A227`) — so the shared shell
   **tokenizes** theme; each sibling keeps its identity. Writer Canvas
   instantiates the grammar in Writer Studio warm.

## The plan

**A. Shared shell (new, React):** `app/writers-studio/canvas/shell/CanvasShell.tsx`
— a faithful React re-expression of the extracted grammar, themed by
tokens, with exactly four extension points and no opinions about their
contents:

```
<CanvasShell
  toolbar={…}      // top strip (rows tokenized; height not hardcoded)
  navigator={…}    // left rail, 220px
  support={…}      // right contextual column, 240px
>
  {surface}        // center easel: flex-centered, the ONE scroll region
</CanvasShell>
```

Book Studio is untouched today and can adopt this shell later — two
siblings on one foundation, no wholesale clone, nothing publishing-
specific in the framework.

**B. Writer Canvas rebuilt as the writing instance** (replaces
`canvas/page.tsx` layout entirely):

- **Surface (center):** the manuscript on a weighted sheet — the Book
  Canvas page grammar at writing proportions (wider sheet, auto-growing
  height, generous measure, `0 4px 24px` shadow = the drafting-table
  weight). The Writing Surface papers apply to the sheet: Warm Canvas
  default · Ivory · White · Midnight — the room never repaints. All
  save/version behavior byte-identical (workingDraftClient reused).
- **Navigator (left):** manuscript structure — the member's own heading
  lines listed mechanically, click lands the surface there. Provisional
  content; the founder's later button-pass rules the final set
  (chapters/scenes/bookmarks/search/reorder all await that pass).
- **Support (right):** contextual groups preserving existing
  capabilities behind the extension point — the Work register (identity
  · becoming · the declare gesture), Materials (belongings + bring),
  History (versions) — reusing the existing WorkDrawer/MaterialsDrawer
  logic re-homed as inspector groups, plus MAIA's one honest folded
  line. Placement provisional by contract.
- **Toolbar (top):** deliberately near-empty — identity, save facts,
  Keep a version, Writing Surface control. Every other candidate
  (undo/redo, insert, find/replace, focus, Design→) is a founder
  decision after the shell is visible; the slot exists, the furniture
  waits.

**C. Deleted rather than adapted** (from the three-day-old canvas):
the zone-row layout, drawer spine, drawer asides, the old Worktable's
embedded-viewer presentation, the mobile drawer rows. What survives is
the relationship loop and data plumbing: fetches, unite rule, declare/
bring/keep gestures, guards.

**D. Explicitly not leaking:** blocks, block inspector, page types,
templates, density/air/typeset, Reality/Proof, image bank, thumbnails-
as-pages, pagination engine, Export PDF, print CSS.

## Success criteria (founder's six, answerable on sight)

1. Writer Canvas visibly shares Book Canvas's spatial grammar
   (rail · easel · inspector · toolbar, same proportions).
2. The manuscript is the dominant central object, with weight.
3. Existing save and manuscript loading behavior still works (same
   client, same routes, verified live).
4. Publishing-specific controls do not appear anywhere.
5. Navigator/support/toolbar contents can be repopulated without
   touching the shell.
6. The old panel layout is gone, not rearranged.

Implementation proceeds now on `feature/canvas-surface-prototype`; the
frozen walked room on #972 remains untouched until the founder rules
sequencing.


## THE AIN CANVAS (founder elevation, 2026-08-05 — written at the top of the framework)

> **"The AIN Canvas is an identifiable, ceremonial, reliable place where
> human work can grow — from a fleeting thought to a lifetime of
> contribution."**

The shared shell is not Writer infrastructure — it is **the canonical AIN
Canvas**, and every discipline is a specialization: member reflections,
Larry's courses, books, dissertations, keynotes, interventions. Four
qualities, experience not UI: **identifiable** (crop the logo out and you
still know it's AIN) · **ceremonial** (crossing onto it is a transition
into focused creation) · **reliable** (always remembers, saves, restores,
respects authorship — a favorite desk) · **powerful** (expands with the
work: note → journal → research → manuscript → dissertation — the tools
evolve, the place does not). Governing line: **the work changes; the
canvas remains.** Writer Canvas is one deployment; people should come to
say "I went into the Canvas." Memorability through continuity, not
flash. Consequence for code: the shell lives at platform level
(`components/canvas/CanvasShell.tsx`), themed per deployment, with the
founder's sentence as its header.
