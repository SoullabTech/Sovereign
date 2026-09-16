# WRITERS-STUDIO-EXPERIENCE-REBUILD-01 — rebuild package

Founder directive, 2026-09-16. The current Studio is not the product to
repair. It is **prototype evidence that proved the substrate.**

Production frozen at `ae27205d9`. No incremental Studio fixes deploy while
this runs. Founder attention budget: **zero** until there is a materially
different Studio to sit down with.

---

## 0 · the evidence, closed

    what the founder selected      198 · Chapter 10: The Living Spiral
    what the UI moved toward       199 · I. The Living Spiral
    what was actually persisted      0 · front matter
    durable thread                 a0eda304-3882-4366-938b-06d1b06073f9

**Three loci from one gesture.** That is sufficient. The old architecture is
fractured and needs no further proof.

---

## 1 · current-experience autopsy

Not a bug list. Where implementation history leaks into the writer's head.

**L1 — two lineages, visible in the directory names.** `lib/writersStudio/`
(client, camelCase) and `lib/writers-studio/` (server focus, kebab) are two
different generations of the same idea that never met. The writer meets both.

**L2 — two MAIA paths on the server, and the good one is off.**

| path | vocabulary | state |
|---|---|---|
| `/api/writers-studio/focus` | `workRef` · `scopeKind: whole_work\|section\|passage` · `sectionRef` · `range` · `gesture` | governed, server-reads-text, **founder-flagged OFF** |
| `/api/writers-studio/editorial/{thread,turn,version,adoption,relationships}` | `sectionId` only | **live, and what failed** |

⭐ **This is the finding that reframes the rebuild.** A canonical, scope-aware,
well-governed Focus vocabulary *already exists on the server*. The live
editorial lane was built **beside** it rather than **on** it, and speaks a
degraded dialect with no scope kind, no range and no gesture. The exact-passage
failure is what a sectionId-only dialect does when asked a passage question.

**L3 — three client location authorities**, all deliberate, all documented,
allowed to diverge: `wholePlaceId` (scroll-observed), `writing.activeId`
(editor mount), and whatever editorial reads at render.

**L4 — `activeId` conflates two different facts**: *where the writer is*
(cheap, constant) and *which editor is mounted* (expensive, owns the capture
seam). The laws protecting that conflation — *"navigation is not observation"*,
*"place is observed, not borrowed"* — are correct **given it**. Remove the
conflation and the reason for three authorities disappears.

**L5 — mode as a room.** `Work on an exact passage →` is a conceptual
relocation with its own chooser, its own conversation component and its own
way back. The writer must know which room they are in to know what MAIA will
act on.

**L6 — taxonomy on screen.** `Section` / `Whole manuscript` as two buttons
distinguished only by underline and 45% opacity. `THIS PASSAGE`.
`Conversations` as a destination. Structure, Versions, Threads, Timeline,
Word Web, Goals, Statistics as permanent chrome. Seven zones for one book.

**L7 — silent scope substitution.** No surface ever displays which passage
MAIA is bound to before it acts. The first time the writer learns the answer
is when the answer is wrong.

---

## 2 · substrate salvage map

**KEEP AS-IS — the spine.**
- `/api/writers-studio/focus` + `assembleFocus` + `focusCrossing` — the
  canonical Focus vocabulary and its boundary. **Becomes the only MAIA path.**
- Manuscript storage, section addressing, `working_draft_revisions`, save
  guarantees, `sectionSaveQueue`.
- Provenance: proposal chains, revision authorization, adoption, disclosure
  receipts, `ask_threads`/`ask_turns` append-only laws.
- Canonical turn (`lib/maia/canonical-turn`), identity resolution, L1 session
  recovery.
- `sectionProjection`, `workContext` (identity is the Work, locus is context —
  the rebuild makes this true at the surface, where it currently isn't).

**KEEP / REINTERFACE — capability sound, surface wrong.**
- `/editorial/{turn,version,adoption}` → re-expressed as **gestures within the
  focus path**, not a parallel product. `/editorial/thread` and
  `/relationships` lose their sectionId-only keying.
- `WholeManuscriptSurface` + `SectionWritingSurface` → one continuous
  manuscript; the section you are in is observed, not chosen by a toggle.
- `ManuscriptOutline` → navigation only; never the authority on place.
- `useSectionWriting` → editor lifecycle only; surrenders location.
- Versions / compare / Materials / Structure → contextual, not permanent.

**REPLACE.**
- All three client location authorities → one `StudioFocus`.
- `RelationshipChooser` → resumption is quiet and automatic; plurality stays
  reachable but is not a decision at the door.
- `CanvasClient` composition → three regions.

**RETIRE — removed from the member model entirely.**
- `editorialMode` and `Work on an exact passage →`.
- the `Section` / `Whole manuscript` toggle.
- `Conversations` as a destination.
- the ordinary-vs-editorial distinction, at the surface.
- the permanent lower band.

---

## 3 · canonical Focus architecture

The client's Focus is **the server's vocabulary, spoken natively** — not a new
invention.

```ts
type StudioFocus = {
  workRef: string;
  manuscriptId: string;
  /** Exactly what the server already accepts. */
  scopeKind: 'whole_work' | 'section' | 'passage';
  /** The section in view. `null` only when no section is in view at all. */
  sectionRef: string | null;
  /** Present iff scopeKind === 'passage'. Code points, revision-bound. */
  range: { start: number; end: number; revisionNumber: number } | null;
};
```

`scopeKind` is **derived, never chosen**: text selected → `passage`; a section
in view → `section`; neither → `whole_work`. The writer never picks a scope.
They point at something, and the scope follows.

Laws:

1. **One writer.** Focus changes only from a member act — rail click, settled
   scroll, text selection, reload restoring it.
2. **MAIA never writes Focus.** Not on open, answer, propose or adopt.
3. **No private copies.** A component that caches location has re-created L3.
4. **No capability acts on a locus other than the one the member inhabits.**
5. **`null` is legible.** MAIA says she has no passage in view. She never
   substitutes front matter, the root, or the last thing she saw.
6. **Place ≠ mount.** Focus is cheap and side-effect-free; mounting an editor
   is a consequence of Focus, never an authority over it.

Consumers, all read-only: manuscript surface, MAIA composer, editorial turn,
version/compare, adoption, provenance, URL, restore-on-reload.

---

## 4 · new interaction model

    open book        the manuscript, where you left it
    navigate         scroll, or click the outline. Nothing else moves.
    write            the section under your cursor is the section you are in
    ask MAIA         she already knows the chapter. No room, no mode.
    select passage   composer changes: "Ask MAIA about this passage…"
    develop          proposed wording appears beside the passage
    compare          before and after, in place
    apply            explicit. Only the text you approved changes.
    continue         focus and scroll unmoved
    leave / return   exact place restored

The composer is the only place scope is ever named, and it names it in the
writer's words:

    Ask MAIA about this work…
    Ask MAIA about this chapter…
    Ask MAIA about this passage…

**No `Work on an exact passage →`. No mode. No jump. No chooser at the door.**

Underneath, unchanged: thread, proposal chain, version, adoption, receipts,
authorization. The member never learns these words.

---

## 5 · screen architecture

    PERMANENT
      MANUSCRIPT   the writing. The largest thing on screen, always.
      MAIA         one continuous presence beside it.

    ON REQUEST, THEN GONE
      CONTEXT      versions · compare · structure · materials

    NOT PRESENT
      mode bar · view toggle · relationship chooser · lower band ·
      Conversations destination · any word from the implementation

Two permanent regions, not seven. Context follows attention and recedes.

---

## 6 · migration / build plan

Each stage is a founder act. **Zero founder testing before E4.**

- **E0 — census.** Every read and write of `activeId` / `wholePlaceId` /
  editorial `sectionId`, and every surface deriving location from any of them.
  Read-only. Names the blast radius before a line changes.
- **E1 — Focus beside.** Land `StudioFocus`, written by both surfaces, read by
  nothing. Prove it agrees with the rail in both views, automatically.
- **E2 — readers move.** Editorial first, since it is the one that is wrong.
  Route every MAIA act through `/api/writers-studio/focus`; retire the
  sectionId-only dialect.
- **E3 — remove.** Mode, toggle, affordance, chooser, lower band.
- **E4 — three regions**, then the founder writes for twenty minutes.

Verification is mine: unit, static and browser automation. **The founder is
asked for a product decision only when one genuinely exists** — e.g. MAIA
inline versus beside — and never for SQL, routes, IDs or witness output.

---

## acceptance

The rebuilt Studio succeeds when the founder can sit with Chapter 10 for an
hour without needing to know what route they are on, which conversation kind
MAIA is using, whether they are in Whole or Section, which variable owns the
context, what a proposal chain is, why a panel appeared, or how a relationship
is stored.

**They should be thinking about the book. Not the Studio.**

Falsifiers that would have killed 2026-09-16 — all automated:

- **X1** scroll to a section, invoke MAIA → the passage MAIA names is the one
  on screen.
- **X2** Focus is never front matter, and never the Work root, while a section
  is in view.
- **X3** any MAIA act leaves focus and scroll byte-identical.
- **X4** reload restores focus and selection exactly.
- **X5** static: exactly one module writes `focus.sectionRef`; a second fails
  the build.
- **X6** static: no component holds location state of its own.
- **X7** static: no client call reaches a MAIA path other than `/focus`.
