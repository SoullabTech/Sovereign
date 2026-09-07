# WRITER'S STUDIO — CAPABILITY COMPLETION · 01
## NOTES v1 — BUILT

**Authority** founder act (Notes next) · **FR-07** scope · **FR-08** anchor loss
**Custody** branch `claude/writers-studio-capability-clxw8d`
**Status** BUILT AND TESTED. ⛔ **Not deployed. Migration not applied anywhere.**

> **A Note is the writer's mutable thinking beside the writing.**
>
> The acceptance question: *Can I be writing a section, have a thought I do not
> want in the prose, put it somewhere immediately, and find it again naturally?*

---

## 1 · WHAT WAS BUILT

| piece | file |
|---|---|
| substrate | `database/migrations/20260907000010_writer_notes.sql` |
| collection API | `app/api/sovereign/manuscripts/[id]/notes/route.ts` — GET · POST |
| single-note API | `app/api/sovereign/manuscripts/[id]/notes/[noteId]/route.ts` — PATCH · DELETE |
| client + anchor rule | `lib/writersStudio/notesClient.ts` |
| surface | `app/writers-studio/canvas/NotesDrawer.tsx` |
| declaration | `notes` → `in-room` in `STUDIO_MAP`; hosted by the Canvas |
| falsifiers | `lib/writersStudio/__tests__/notesAnchor.test.ts` (11) |

**Placement was recovered, not invented.** D-019 puts Notes in the WORK SPACE
band; `FUNCTION-PLACEMENT` puts it *inside WRITE* — *"each surfaces inside the
mode where it is needed; none becomes a sixth mode."* So Notes is a panel in the
Canvas, using the `in-room` capability state the D1 repair introduced this
morning. **No new route, no new pattern, no second implementation.**

## 2 · THE TWO RULINGS, IN THE CODE

**FR-07 — the manuscript is the primary anchor.** `manuscript_id NOT NULL`,
`living_work_id` nullable. A Note can always be taken; the Work is recorded as
context **only when exactly one Work declares the manuscript**, resolved
server-side from the member's own declarations — never accepted from the client,
the same discipline `workSituation.ts` holds. With none or several, the column
stays null and the note is still written.

> A `NOT NULL` Work would have made a note untakeable in two of the Canvas's
> three Work-context states — the lockout D4 repaired this morning, rebuilt.

**FR-08 — demote and keep.** `section_id … ON DELETE SET NULL`, never CASCADE.
The three states are discriminated by the row, with no status column to fall out
of step:

```text
section_id NOT NULL                        anchored, live
section_id NULL, anchor_heading NOT NULL   was anchored; the section went
section_id NULL, anchor_heading NULL       never anchored
```

`anchor_heading` is history, not a key. While a section lives, the surface
**prefers the live heading** — the writer may have renamed it, and the note
belongs to the section rather than to the words its heading had that day. After
deletion it reads *"Previously attached to …"* and is never a link.

**Every prohibition is tested**, because none of them would throw and all of
them would look like helpfulness: no reattachment by matching heading text —
even when a section carrying that exact heading is sitting right there in the
list — no move to a neighbour, no inference about which section replaced which.

## 3 · WHAT v1 DELIBERATELY DOES NOT HAVE

folders · tags · backlinks · AI summaries · notebooks · colour · pinning ·
search ranking · sharing · sorting by anything but when the writer wrote it.

The composer is **first and always open** — not behind a button, not a modal,
not a mode. *A thought that has to wait for a click has already started to go.*
⌘/Ctrl+Enter keeps it; plain Enter stays a newline, because a note is prose and
not a chat message. On a failed write the words stay in the box.

**No MAIA path reaches this component**, and the row has no interpretive column
to fill if one did — asserted, not merely absent.

## 4 · TWO RATIFIED TEST PINS UPDATED — declared, not slipped in

`shellProjection.test.ts` pinned the literal source of the panel-yield
conditions, guarding the invariant *chrome collapses before the writing field is
crushed*. Notes adds a **third yield term of the same kind**:

```text
before   materialsOpen && !conversationOpen && !compact
after    materialsOpen && !conversationOpen && !notesOpen && !compact
```

The rule is unchanged and the writing field is still in **no** yield condition —
`expect(page).not.toMatch(/outlineOpen && !compact/)` is untouched. The pins were
updated in the file's own style rather than loosened into property assertions.
**Recorded because rewriting a ratified assertion to match new code is exactly
what went wrong with Threads this morning**, and the difference between that
case and this one should be visible rather than assumed.

`declarationTruth.test.ts` moved its "unbuilt" examples from `notes` to `goals`
and `discover`, because Notes is now built.

## 5 · GATES

```text
app/writers-studio + lib/writersStudio   42 suites · 675 tests · 675 passed
notes falsifiers                         11 passed
npm run typecheck                        ✅ No TypeScript regressions
npm run check:no-supabase                ✅ clean
```

## 6 · STANDING

```text
NOTES v1              BUILT · TESTED
MIGRATION             WRITTEN · NOT APPLIED (no environment, production included)
DEPLOY                NOT AUTHORIZED
MEMBER WITNESS        NOT PERFORMED — nobody has taken a note yet

The 60,000 ceiling is untouched. Notes needs no expansion of MAIA perception.
Next in the founder's sequence: Goals.
```

⛔ **Built ≠ demonstrated.** The acceptance question is answered by a writer
catching a thought and finding it again, not by a passing suite.
