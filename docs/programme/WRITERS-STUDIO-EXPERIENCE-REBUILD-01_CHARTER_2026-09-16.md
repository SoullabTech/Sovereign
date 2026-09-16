# WRITERS-STUDIO-EXPERIENCE-REBUILD-01 — charter

Opened by founder act, 2026-09-16, on the evidence of the
`REAL-WORK-ACCEPTANCE-01` failure. Supersedes `WS-EXACT-PASSAGE-LOCUS-01`,
which is retired as too small: its one-line repair would have fixed the
symptom and preserved the model that produced it.

## mandate

Rebuild the Writer's Studio interaction model around **one canonical Work
focus**, reusing the proven storage, provenance, MAIA, editorial, adoption,
versioning and manuscript substrates underneath.

This is a front-end experience architecture reset. ⛔ It is not a backend
reset. The machinery stays. We stop exposing its history to the writer.

## the defect this exists to end

The Studio has **three location authorities** and permits them to diverge:

| authority | set by | what it means |
|---|---|---|
| `wholePlaceId` | scroll observation in Whole view | what the writer can see |
| `writing.activeId` | `goToSection`, editor mount | what the writing engine has open |
| whatever editorial reads | `activeId` at render | what MAIA acts on |

On 2026-09-16 all three were different at once. The rail showed 199, the
writer had chosen 198, editorial bound to neither, and a durable relationship
was created against the root. Every one of those behaviours is individually
documented, tested and deliberate. **The defect is that they coexist.**

## the correction that makes one focus possible

`activeId` today conflates two facts that are not the same fact:

    where the writer is        (cheap, no side effects, changes constantly)
    which editor is mounted    (expensive, owns the capture seam)

The existing laws — *"navigation is not observation"*, *"place is observed,
not borrowed"* — are **correct given that conflation**: driving `goToSection`
from a scroll would perform an editor mutation to move a marker. The rebuild
does not overrule them. It removes the conflation they were defending against.

    focus.sectionId   where the writer is.      Written by BOTH views.
    editor mount      a consequence of focus.   Never a location authority.

Once place is separable from mount, both views can write the same field
without either one performing a mutation, and the reason for three
authorities disappears.

## the object

```ts
/** The single answer to "where am I". Every surface reads this. */
type StudioFocus = {
  workId: string;
  manuscriptId: string;
  /** The passage in view. ONE id, whatever the view, whatever the mode. */
  sectionId: string | null;
  /** Present only when the writer has selected text. */
  selection: {
    sectionId: string;
    revisionNumber: number;      // selection is revision-bound or it is a lie
    from: number; to: number;    // code points, per the 07A evidence law
  } | null;
};
```

Laws:

1. **One writer per field.** Focus changes only from a member act: a rail
   click, a scroll that settles, a text selection, a reload restoring it.
2. **MAIA never writes focus.** Not on open, not on answer, not on adopt.
3. **No surface keeps a private copy.** A component that caches focus has
   re-created the defect.
4. **`null` is legible.** No passage in view means MAIA says so; it never
   substitutes the Work root. Position 0 is not a passage.

## the experience

You open the Studio. You see your manuscript. You scroll or click to
Chapter 10. MAIA already knows: *Chapter 10 — The Living Spiral.*

You select a paragraph. The composer changes, quietly, from

    Ask MAIA about this work…      →      Ask MAIA about this passage…

No mode switch. No new room. No `Work on an exact passage →`. No jump.

You ask for a revision. The proposed wording appears beside the passage. You
compare. If you like it: **Apply**. The book does not navigate.

## the law above all others

**The screen never moves unless you move it.**

- Invoke MAIA on Chapter 10 → you are still on Chapter 10.
- Select a paragraph → it stays selected.
- MAIA proposes → the book does not navigate.
- Close MAIA → your place remains.
- Reload → your place returns.

## what is removed from the writer's view

Deleted outright, not hidden:

- `Work on an exact passage →` and `editorialMode` — one MAIA, continuously.
- the `Section` / `Whole manuscript` toggle — one continuous manuscript; the
  section you are in is the section you are in.
- the distinction between ordinary and editorial conversation, at the surface.

Kept underneath, invisible: threads, proposal chains, versions, adoption,
provenance, disclosure receipts, revision binding. **The member never has to
know these exist.** Their correctness is unchanged and their laws still bind.

## three regions, not seven

Today the writer holds: left rail (Workspace · MAIA · Tools), Manuscript,
reading pane, MAIA column, and a lower band of Versions / Outline / Threads /
Timeline / Word Web / Goals / Statistics. That is product architecture
leaking through the skin.

    MANUSCRIPT   the actual writing
    MAIA         one continuous presence
    CONTEXT      appears only when needed — versions, compare, materials,
                 structure. Not a permanent zone.

## sequence

- **E0** census: every read and write of `activeId`, `wholePlaceId`, and every
  surface deriving location from either. Read-only. Names the full blast radius
  before a line changes.
- **E1** land `StudioFocus` beside the existing state, written by both views,
  read by nothing. Prove it agrees with the rail in both views.
- **E2** move every reader onto it, one at a time. Editorial first — it is the
  one that is wrong today.
- **E3** delete the mode, the toggle and the affordance.
- **E4** the three regions.

Each stage is a founder act. E1 is the only one that must hold both models at
once, and it holds them without either being authoritative.

## acceptance — the falsifiers that would have killed 2026-09-16

- **X1** Scroll to a section in the continuous manuscript, invoke MAIA. The
  passage MAIA names is the passage on screen. *(kills the whole failure.)*
- **X2** Focus is never the Work root when a section is in view. *(kills the
  position-0 binding.)*
- **X3** Any MAIA act — open, answer, propose, adopt — leaves `focus` and
  scroll position byte-identical. *(kills "it jumped".)*
- **X4** Reload restores focus and selection exactly.
- **X5** Static: exactly one module may write `focus.sectionId`. A second
  writer fails the build.
- **X6** Static: no component holds section-location state of its own.

X1 and X3 are the two that the current suite has no counterpart for. The
existing `canvasEditorialMount` test enters editorial from Section view only,
which is the one view where the three authorities happen to agree.

## immediate containment — recommended, not taken

The editorial surface is live and demonstrably binds wrong. The flag that
Stage 2 activated is the cheapest withdrawal: turning it off removes the
affordance and leaves MAIA's ordinary relationship to the Work intact, by the
superseding law already written into `CanvasClient` at the flag's own site.

⛔ Not done. One founder word and it is off within the minute.

## correction of record

`WS-EXACT-PASSAGE-LOCUS-01_FINDING_2026-09-16.md` states that the click
persisted nothing. **That is wrong.** A thread was created
(`editorialThread=a0eda304-3882-4366-938b-06d1b06073f9`) and, per founder
reading, bound to position 0. The finding's code-path trace of the write path
stands; its conclusion did not, and the error made the defect look smaller
than it is. The finding is superseded by this charter and kept for its chain.
