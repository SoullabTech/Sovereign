# Workbench Phase 2 — Thinking in Space

**Status:** Recorded (founder definition, 2026-08-01). Not ratified. No build authorized by this document.
**Author of the definition:** Kelly. Recorded verbatim in intent by Claude.
**Referent for current state:** working tree of `fix/ios-pwa-composer-keyboard` (uncommitted), plus
`database/migrations/20260522000003_workbench_v0.sql`.

---

## The definition

The goal is no longer *write*. The goal is **Gather. Arrange. Discover.**
Writing becomes something that emerges.

### Definition of Done

A member opens a project and arrives in a Canvas where they can:

- see everything they've gathered
- move things around
- create piles
- rename piles
- leave and come back
- gradually discover structure

**without MAIA interpreting any of it.** No AI clustering. No suggested themes. No automatic
organization. Just a table.

### The progression (first-class)

```
Shelf   →   Table   →   WriterField
(shoebox)   (spread out)  (one arrangement becomes prose)
```

The Shelf is a first-class concept, not "cards." This is what distinguishes the Studio from
traditional writing applications: it begins with **arrangement and discovery**, not a blank document.

### First field objects (four only)

Keeps · Ideas · Decisions · Journal entries.

Later, not now: Conversations · Quotes · Sources · Voice notes · Changes · Memories.

### Member acts (the complete verb set)

Capture · Move · Gather · Separate · Rename · Duplicate placement · Remove from pile · Return to shelf.

Absent by design: summarize, outline, rewrite, AI.

### MAIA's role

Silent. MAIA does not even suggest *"these seem related."* **The member notices.**
This preserves authorship of meaning.

### Persistence

Every placement, pile, and project persists. Three weeks later the table looks exactly as it was left.

### Multiple projects

Studio → { Book · Course · Podcast · Research · Retreat · Newsletter · Article · Talk }.
Each project owns: Canvas · WriterField · piles · revisions · Keeps in context.

### Graduation — the intentional stop

Only one graduation exists in Phase 2:

```
Pile  →  Open in WriterField   (or "Continue Writing")
```

No Structure mode. No Design. No Publish.

### Success metric

Not *"can they write a chapter?"* but:

> Does someone who does not think of themselves as a writer naturally begin creating structure?

Success sounds like: *"I just kept throwing ideas onto the table, moving them around, and
suddenly I knew what I wanted to write."*

---

## Gap against what exists today

Current substrate (uncommitted working tree + `workbench_v0` migration):

| Phase 2 requirement | State |
| --- | --- |
| Shelf pane with search | **Exists** (`components/book-studio/workbench/Shelf.tsx`) |
| Table with named piles (Groups) | **Exists** (`Table.tsx`, `Group.tsx`) |
| Create pile · rename pile · delete pile | **Exists** |
| Gather (drag Shelf → pile) | **Exists** (native HTML5 DnD) |
| Remove from pile | **Exists** (`onRemoveCard`) |
| Persistence of placements/piles | **Exists** (`workbench_tables.layout` JSONB) |
| Member reaches own Workbench | **Exists** (`lib/workbench/access.ts` — narrow §8 amendment) |
| MAIA silent in the room | **Exists** (explicit in `Room.tsx` header comment) |
| Cards are pointers, not copies | **Exists** (schema invariant) |
| Sanctuary excluded from Shelf | **Exists** (`lib/workbench/sanctuary.ts`) |
| **Move** — card pile → pile | **Missing** (drop target is Shelf→Group only) |
| **Separate** — split a pile | **Missing** |
| **Duplicate placement** — one card, two piles | **Missing** |
| **Return to shelf** as a named act | **Missing** (only "remove", which reads as deletion) |
| Reorder cards within a pile | **Missing** |
| Source: **Keeps** | **Exists** (`lib/workbench/sources/keep.ts`, member set) |
| Source: **Ideas** | **Missing** (no adapter) |
| Source: **Decisions** | **Missing** (no adapter) |
| Source: **Journal entries** | **Missing** (no adapter) |
| **Multiple projects** | **Schema-ready, no UI** (`workbench_tables` is already 1:N per arranger) |
| Project = named container above Table | **Missing** (Table ≈ project today; no naming/switching surface) |
| Graduation → **WriterField** | **Wrong target** — `graduate.ts` pipes to a Book Studio draft, and is `requireFounder()` |

### Candidate slices (each independently shippable, none authorized)

1. **Complete the verb set** — Move · Separate · Duplicate placement · Return to shelf · reorder.
   Pure client + layout-PUT work. No schema change. No new sources.
2. **Three more sources** — Ideas · Decisions · Journal adapters + their Sanctuary checks.
   Widens `sourcesForRole('member')`. No schema change.
3. **Projects made real** — name/create/switch Tables; Studio → project list.
   Schema already supports it; this is UI + one route already built (`GET/POST /tables`).
4. **Graduation to WriterField** — retarget `graduate.ts` from Book Studio draft to WriterField,
   and lift it from `requireFounder()` for the member's own pile.

---

## Open questions this definition does not settle

- **Is "project" a new object, or is `workbench_tables` the project?** The Definition of Done says
  *"a member opens a project and arrives in a Canvas."* If one project = one Canvas = one Table,
  no schema is needed. If a project owns *Canvas + WriterField + revisions*, it is a new object and
  must be reconciled with the Living Works ontology before anything is built.
  → **This is the load-bearing unresolved question.** It gates slice 3 and slice 4.
- **Does "Return to shelf" differ from "Remove from pile"?** The verb list names both. If a card
  removed from a pile is always still on the Shelf (it is — cards are pointers), the two verbs may
  be one act with two names, or "remove" may mean something stronger.
- **What does "Capture" mean inside the Canvas?** Capture is listed as a Phase 2 member act, but
  every existing capture path lives outside the Workbench. Does the Canvas gain a capture affordance?

---

## Slice 1 — complete the verb set (implemented)

Branch `feature/workbench-member-arrangement`, stacked on `feature/member-workbench-keep-slice`
(PR #877), which is where the member-access + Keep-source work lives.

**Truthful claim for this slice:** *let members rearrange deliberately kept material into
persistent, member-authored piles without changing the material or allowing the system to
interpret it.*

Every act is a pure transform of `workbench_tables.layout` in `lib/workbench/arrange.ts`.
No migration, no schema change, no source-row mutation, no MAIA.

| Verb | Semantics as implemented |
| --- | --- |
| Gather | place a Shelf pointer into a pile |
| Move | transfer one placement A → B; the placement **keeps its id** — same act, relocated |
| Reorder | change order within one pile; moving within a pile routes through the same code |
| Duplicate placement | **new** placement id, same `{source, ref}` — one capture genuinely in two places |
| Return to Shelf | remove the placement; the capture is untouched and stays searchable |

### Two things this slice settled

**1. `Separate` and `Return to Shelf` are one operation.** Both remove a placement and leave the
capture alone; they differ only in point of view (the pile's vs the member's). Implemented once,
exported twice. The open question is recorded, not guessed: if lived use shows Separate means *out
of the pile but still on the table*, that requires an ungrouped region in the layout — a real change
to the layout contract, not a second copy of the function.

**2. The v0 "no duplicate `{source, ref}` in one pile" guard had to go.** It predated the Duplicate
verb and contradicts it — the acceptance walk puts two placements of one Keep in a single pile and
then reorders them against each other. Identity now sits where it belongs: a **placement id** is
unique table-wide (enforced client-side *and* in `validateLayout`), while `{source, ref}` is free to
repeat. That distinction is the whole difference between copying a thing and putting a thing in two
places.

### A finding this slice surfaced

**HTML5 drag-and-drop does not fire on iOS Safari.** A verb that exists only as a drag is a verb a
member on a phone does not have — and this platform is substantially used from an iPhone PWA. So
every verb has an explicit control (↑ ↓, *Move to…*, *Also place in…*, *Return to Shelf*) alongside
the drag. The controls are not a fallback; on touch they *are* the interface. Dragging remains the
faster path on desktop, with Alt-drop to duplicate.

### Still deliberately absent

No graduation, no WriterField, no projects UI, no sources beyond Keeps, no ungrouped table region,
no MAIA. The **project = Table vs Living Work** question is untouched and stays open by design —
Slice 1 does not need the answer, and use of the table should inform it.

### Verification status

Authenticated member walk performed locally 2026-08-02, on one genuine Keep minted through
`keepSource()` — the only writer that stamps `generated_by = 'member-gesture'`. Every act was driven
through the **explicit controls**, not drag.

| Evidence | State |
| --- | --- |
| Verb transforms, incl. walk steps 1–9 composed | ✅ unit tests; mutation-checked (breaking `move` fails 3) |
| Place → duplicate → move → reorder → return → rename | ✅ one pile held **two placements of one atom** and reordered them |
| Leave and return | ✅ exact pile name, placement id and order persisted |
| Touch width (375px), all acts via controls | ✅ after correction — five controls, each ≥44px, no horizontal overflow |
| Atom unchanged | ✅ **23/23 watched fields identical**; still exactly 1 atom, 1 table row |
| Graduation + uploads | ✅ both **403**; neither control rendered on the member surface |
| Invalid duplicate placement id | ✅ **400**, saved layout uncorrupted |
| No MAIA/model call from the Workbench | ✅ every request `/api/book-studio/workbench/*` + static |
| Whole workbench suite | ✅ 94 tests · scoped `tsc` clean |
| **Felt grammar of the controls** | ⏳ **founder walk — the one question tests cannot answer** |

### What the walk found that reading the code did not

Two defects, both real, both in the touch path:

1. **Gather was drag-only.** Every other verb had an explicit control; the first act did not. On iOS
   a member could not put anything on the table at all, and every other verb sat unreachable behind
   it.
2. **The controls were present but not tappable.** At 375px the reorder arrows measured **10×16px**.
   The first pass confirmed they *rendered* at touch width and nearly recorded that as a pass.

⭐ **Rendering a control is not proof the act is reachable.** A 10×16px target technically existed
and functionally did not. This is the durable lesson of the slice.

### Prerequisite for any further walk

⚠️ **The Shelf is empty until a real Keep exists.** `generated_by = 'member-gesture'` is the
discriminator, and no member row carries one by default — locally or in production. A walker must
perform a genuine Keep first (`POST /api/psyche/portfolio/keep`, the member Keep gesture). Do **not**
backfill provenance to populate it: an empty Shelf is truthful, and unknown-ness is unrecoverable.
