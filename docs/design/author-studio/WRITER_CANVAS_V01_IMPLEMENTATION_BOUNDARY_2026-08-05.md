# Writer Canvas v0.1 — Implementation Boundary Statement (Step 4 gate)

> **Status**: Founder-requested boundary statement, 2026-08-05, issued
> before the first line of Step 4 code. Governs the v0.1 slice. The room
> design it implements: `WRITER_CANVAS_ROOM_MAP_2026-08-05.md` as amended
> by the persona walk (A1–A6) and accepted by the founder on the rendered
> room (mockup walk, 2026-08-05).

---

## The boundary

**The first slice is not building Writer Canvas in full. It is building
the room structure with the first real instrument: the Worktable
writing/development surface.**

Two failure modes are refused symmetrically:

- **The earlier danger**: build the editor and call it the studio.
- **The present danger**: build every room and every instrument before
  shipping.

v0.1 ships the *room* with *one* real instrument in it. Every other
instrument stays designed-but-unbuilt, and its absence is rendered
honestly (the `availability: 'later'` grammar already enforced in
`studioMap.ts` — no href, no fake door).

## Writer Canvas v0.1 — what a creator can do

1. **Enter from Writer Studio** — one door from the Studio Home.
2. **Open a Work** — a real `living_works` row, named by its becoming.
3. **See the Study Wall** — folded spine: Work · Materials · Structure ·
   History.
4. **Open a drawer** — real contents where infrastructure exists; honest
   near-empty states where it doesn't. No fabricated objects.
5. **Work at the Worktable** — the writing surface on the existing
   Working Draft engine (`workingDraftClient.ts` reused verbatim; drafts
   autosave through the live `/api/sovereign/manuscripts/[id]/draft`
   routes).
6. **Save / reopen** — leave, return, and the room opens where they left
   it (arrival-as-continuation).
7. **Understand where they are** — the work's name, its becoming, and the
   orientation phrase from authored facts only.

That is the whole slice.

## Explicitly OUT of v0.1 (designed, not built)

| Not in v0.1 | Why held | Where its design lives |
|---|---|---|
| Window / MAIA backend | No reflection endpoint exists on the Press surface; building one is a constitutional decision, not a reuse. The Window ships **folded and honest**: *"Reflection with MAIA will become available when this Work can carry its context."* No beautiful empty panel. | Room map, Zone 3 |
| Renewal surface (A1) | Second instrument; needs its own walk | Persona walk A1 |
| Offered/adopted collaboration (A4) | Own grammar, own slice, own gate | Persona walk A4 |
| Citation instrument + generated bibliography (A5) | Conditional; no citable-materials substrate yet | Persona walk A5 |
| Development surface as a distinct instrument | v0.1 worktable is the writing surface; fragment/thread arranging is the next instrument | Room map, Zone 1 |
| Bulk gathering arrival (A6) | Ingest exists and stays reachable via its current door; the gathering *arrival experience* is its own slice | Persona walk A6 |
| Expression switcher (A3) | Appears only when >1 expression; not manufactured for v0.1 | Persona walk A3 |
| Pinnable drawers (A2) | Comfort refinement; earns its place when a long-form work lives in the room | Persona walk A2 |

## Infrastructure law for this slice

- **Reuse only**: `living_works` + `living_work_expressions` (live),
  Working Draft engine + `workingDraftClient.ts` (live), Studio shell +
  `STUDIO_MAP` honest-navigation model (live).
- **No new tables. No new abstractions.** The walk revealed no gap that
  v0.1 must fill with schema.
- **Namespace**: the Canvas lives under `app/press/studio/` (Writer's
  Studio inside Author Studio). `/studio` is the practitioner namespace
  and is not touched.
- **`keepSource()` remains HELD** — not called, not modified.
- **Nothing in the room keys on inference** — every adaptive behavior
  keys on member-authored facts (sovereignty rider).

## Acceptance for v0.1

Experiential and visual, per the design law: the rendered room, walked —
then **put in front of the five personas again**. Technical checks
(typecheck no-regression gate, existing tests) are preconditions, not
acceptance.
