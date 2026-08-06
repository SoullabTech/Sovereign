# Writer Canvas — Integrated Surface Analysis (investigate-first deliverable)

> **Status**: The founder-briefed investigation, delivered BEFORE any
> implementation, per the brief's own order. Governing sentence: **the
> canvas should disappear as an interface and become the place where
> writing happens.** Constraints honored throughout: keep the Writer
> Studio identity and warm language · no word-processor redesign · no new
> features · architectural/UI refinement only.

---

## 1. Why the current experience feels layered

Read directly from the component hierarchy of
`app/writers-studio/canvas/page.tsx` + `Worktable.tsx` (author's own
audit). The layering is real and enumerable — **seven nested layers and
five hard seams** between the writer and their words:

```
room (gradient bg)                          ← layer 1
└─ header block (5 stacked metadata rows)   ← layer 2
   ── border-t (full-width rule)            ← SEAM 1
└─ zone row
   ├─ spine nav ── border-r                 ← SEAM 2
   ├─ drawer aside ── border-r (when open)  ← SEAM 3
   ├─ main (own padding box)                ← layer 5
   │  └─ status row (pages·saved·keep)      ← SEAM 4 (chrome above text)
   │  └─ <textarea> flex-1 w-full           ← layer 7 — THE core defect
   │        · own nested scroll region      ← SEAM 5
   │        · native scrollbar renders as
   │          a bright WHITE strip          ← the loudest single seam
   │        · full-width monolithic text,
   │          no measure, no margins-as-place
   │        · plain text: `#` and
   │          `-- N of 216 --` render raw
   └─ window aside ── border-l              ← (right seam)
```

Named causes, mapped to the brief's checklist:

- **Container hierarchy**: application → zone row → main box → textarea
  = application → viewer → document. Three visual strata where the
  experience calls for one.
- **Scroll regions**: the page does not scroll; a *nested region inside
  it* scrolls. Nested scroll is the strongest "viewer embedded in
  software" signal a UI can emit — and its native scrollbar paints a
  white column down the warm room.
- **Borders**: four hairlines partition the room into panes. Every
  hairline says *software*.
- **Width constraints**: none on the text — it runs edge-to-edge of its
  pane. Prose without a measure reads as *content dumped in a region*,
  never as a page. (The margins are what would make it a canvas; there
  are none.)
- **Page wrappers / imported metaphors**: the PDF ingest carried
  `-- N of 216 --` print separators INTO the stored text, so the data
  itself performs "imported artifact" — a substrate fact, not a CSS one.
- **Chrome placement**: the status row sits between the head and the
  words; "Keep a version" floats at the far corner, unrelated to the act
  it serves.
- **Metadata mass**: five rows of head metadata render before a single
  word of the member's book.

**Summary sentence**: the manuscript is displayed *in* the room; nothing
makes it *be* the room.

## 2. What makes the manuscript become the canvas itself

Five structural changes — each removes a layer rather than styling one:

1. **One scroll.** The page scrolls; nothing inside it scrolls. The text
   surface auto-grows to its content; the header simply scrolls away as
   writing rises. (Kills SEAM 5, the white scrollbar, and the viewer
   metaphor in one move.)
2. **A measure, not a container.** The manuscript sets in a comfortable
   reading measure (~65ch) centered by generous margins. The margins ARE
   the canvas — no box, no border, no shadow around the text. Nothing
   visually separates "application" from "document" because there is no
   second surface: **the room's field is the writing surface.** (This
   supersedes the earlier "elevated sheet" sketch — a sheet is one more
   layer; the founder's final formulation is flat: writing ON the canvas.)
3. **Chrome becomes margin activity.** The status facts (~pages · saved ·
   Keep a version) become one quiet line in the canvas margin, near the
   words they describe — versioning as a consequence of writing, present
   at low opacity, legible on approach.
4. **Seams become space.** Every border-t/r/l is deleted; the spine's
   room-labels float in the left margin of the same field. Separation by
   breathing room, not by lines.
5. **The head quiets and yields.** Title smaller, facts on one line, and
   the whole head scrolls with the page — after a moment of writing, the
   entire screen is manuscript on warm canvas.

The Writing Surface (easel ruling) then operates on **the one real
surface**: Warm Canvas default; Ivory/White/Midnight change the field
under the text and the text color — the room's edges, spine, and head
keep Soullab warm. The desk adapts; the house keeps its paint.

Out of scope for this refinement, named honestly: typographic rendering
of `#` headings inside the plain-text surface (rich rendering is an
editor-architecture change, not a seam removal); the data-level strip of
print markers (belongs to confirm-the-cuts ingest, member-confirmed);
rooms-not-panels for Structure/Materials/History (its own move in the
same conversation, separately sized).

## 3. Minimal implementation plan (when approved — not begun)

All in `Worktable.tsx` + `canvas/page.tsx`; no API, no schema, no new
components beyond a `WRITING_SURFACES` constant:

1. Auto-growing text surface: `field-sizing: content` with a small JS
   fallback; remove `flex-1`/fixed heights; page-level scroll only.
2. Measure + margins: text column `max-width ~65ch`, centered,
   `line-height 1.9`, top padding that lets the head breathe away.
3. Delete the four zone borders; spine floats at low opacity in the
   margin (labels unchanged — adjacency grammar untouched).
4. Merge status + Keep-a-version into one low-opacity margin line
   anchored to the text column.
5. Quiet the head (size, single fact line); it scrolls with the page.
6. `WRITING_SURFACES` (warm/ivory/white/midnight): background + text +
   caret applied to the writing field only; switcher labeled **Writing
   Surface** in the margin line; prototype persistence in localStorage
   (real storage is a slice-ruling question, already flagged).
7. Styled scrollbar on the page (thin, room-toned).

Estimated diff: ~120 lines touched, zero behavior change to saving,
declaring, drawers, or routes. Fully reversible; lands on the prototype
branch (`feature/canvas-surface-prototype`), never on the frozen walked
room until ruled.

## 4. Before / after

Interactive mockup: `mockups/writer-canvas-integrated-surface.html` —
left/right comparison of the layered current state and the integrated
canvas, with the Writing Surface switcher live on the "after" side so
the easel behavior can be felt, not imagined.
