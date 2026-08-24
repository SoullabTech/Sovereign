# Writer Canvas — Working on One Part (implementation record)

> **Status**: Built. Answers the first question the Structure design left to
> the implementation walk. Reads as a companion to
> `WORK_STRUCTURE_DESIGN_2026-08-05.md`; it authorizes nothing beyond what it
> describes, and it adds no ontology, no schema, and no new claim.

## The report

A member with a 216-part book on the table:

> *"if I want to edit the whole of Chapter 10 to redevelop it, look for
> misplaced copy like I have material that is referencing being in the front of
> the book, I should be able to work with it without scrolling through the full
> manuscript."*

Two needs, both real, both about **organization of the work** rather than about
capability the system lacked: reach one part directly, and locate material
wherever it currently sits.

## What was built

1. **The Structure drawer became a rail.** It lists the parts the member
   carried in, by their own heading words, each one a door. Opening a door
   narrows the Worktable's **frame** to that part.
2. **Framed writing at the Worktable.** The field shows one part's text and
   only that. A frame line names the part and offers the way back out.
3. **Find in manuscript.** A plain phrase search over the whole draft that
   answers *where is this?* — every hit labelled with the part it lives in, and
   clickable straight into that part with the passage selected.

## The three rulings this had to satisfy

**The frame narrows; storage does not.** The draft remains one document. A
framed edit is spliced back into the whole text *before* it reaches the saver,
so every guarantee in `workingDraftClient` — ordered single-flight autosave,
idempotency, the version guard, the exit flush — applies to exactly the bytes
it always did. "Keep a version" keeps a version of the book, never of the part
on screen. `spliceFrame` is a pure function precisely so this property is
tested rather than asserted.

**Anchoring, not detection.** `WORK_STRUCTURE_DESIGN_2026-08-05.md` refuses
auto-outlining and structure detection over the draft. Nothing here proposes a
part. The parts are `manuscript_sections` rows — the member's own cuts,
confirmed by them at the import threshold — and `mapDraft` only *locates* those
declared headings inside the living text, by exact whole-line match, in
declared order. No fuzzy matching, no formatting heuristics, no inferred
hierarchy, no progress framing.

**Drift is named, never hidden.** The same design warned that a rail which
silently stays stale is dishonest display. When a member rewrites or removes a
heading, that part can no longer be located — so the rail lists it under *"Not
found in the draft"* in their own words, and says plainly that their words are
unaffected and only the map is. The system does not guess where the part went;
only the writer knows.

Per **S1** of the persona walk, the rail's header names what it is a map OF —
*"<title> — manuscript"* — so a chapter list can never quietly stand in for the
Work.

## Two hazards found by writing the tests first

- **Welding.** A region ends where the next heading line begins, so a frame
  drawn on the raw region would put its far end flush against that heading: a
  sentence added to the end of Chapter Ten would produce
  `…and so it ended.Chapter Eleven`, merging two chapters and taking Chapter
  Eleven off the map in one keystroke, invisibly. `frameForRegion` holds the
  separating newlines **outside** the frame. A frame cannot reach the part
  below it.
- **The frame yanked away mid-sentence.** If the frame were derived from the
  map, editing your own chapter heading would drop the part off the map and
  snap the field back to the whole 216-part draft with the caret elsewhere. The
  frame is therefore held as state and moved by the splice, which knows exactly
  where it now ends. The rail reports the drift; the writing is not interrupted
  to report it.

## Not built, deliberately

- **No move-material gesture.** Relocating a passage between parts is a
  re-shaping act, and the design lane rules re-shaping as a *declaration*
  gesture that has not been walked. Framed writing already makes the manual
  path direct: open the part, cut, open the other part, paste — the member's
  act throughout, with History available on either side of it.
- **No amend-the-map gesture.** When a heading goes adrift, the honest repair
  is the member's declaration, not the system's inference. Named here as the
  next question for that lane, unanswered.
- **No schema, no route, no migration.** Nothing about the substrate changed.

## Where it lives

| File | Role |
|---|---|
| `app/writers-studio/canvas/manuscriptMap.ts` | Pure: anchoring, frames, splice, find |
| `app/writers-studio/canvas/StructureRail.tsx` | The rail, its drift notice, its label |
| `app/writers-studio/canvas/Worktable.tsx` | Framed field, splice-back save, find |
| `app/writers-studio/canvas/page.tsx` | Reads the carried cuts; holds the frame |
| `app/writers-studio/canvas/__tests__/manuscriptMap.test.ts` | 32 tests, incl. coverage + scale |

The coverage invariant is executable: every character of the draft belongs to
exactly one region, with no gaps and no overlaps, so focusing a part can never
hide a member's words from them or drop what was hidden on the next save.
