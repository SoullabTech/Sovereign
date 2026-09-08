# WS-WHOLE-MANUSCRIPT-01 — Constitution

**Standing: BUILD AUTHORIZED (founder, 2026-09-08 — see §4).**
Opened by founder act 2026-09-08. §1-3 were written at DISCOVER, before any
code; §4 records the rulings that authorized BUILD and the first-cut boundary.

> **North star (founder).** A writer may return to a whole manuscript as a
> continuous living work without giving up the safety, identity, and
> editability of its sections.

> **Governing rule (founder).** Whole Manuscript is a **view of the same
> sections**, not a second manuscript. There is no second source of truth.

This is not a display mode. It is where someone sits with a book they wrote ten,
twenty, thirty years ago and experiences it again as *their book* — then decides
whether to restore it, redevelop it, or let it seed another Work. Constituted
now, while the intention is fresh.

---

## 1 · Census — the eight questions, answered against the code

### Q1 · How does section autosave work today?

`lib/writersStudio/useSectionWriting.ts` + `sectionSaveQueue.ts`, under a founder
contract of 2026-08-30:

- **A keystroke is not a logical save.** Typing STAGES text locally into a
  `Map<sectionId, body>` and marks the section dirty. The staged snapshot reaches
  the queue on the autosave timer, on a section switch, or when the page hides.
- **Leaving a section is synchronous capture, then switch.** `captureOnLeave`
  forces the exact visible snapshot into the queue *before* the next section
  mounts, so a pending debounce can never race navigation.
- **The queue serializes at the DRAFT level, not per section.** `baseVersion` is
  taken at dispatch, never at enqueue — because two saves in flight cannot both
  build on the same version.

⭐ **Consequence for this lane:** the staging map is already keyed by section and
already holds *several dirty sections at once*. Continuous editing does not need
a new persistence model. It needs the existing one exposed to more than one
mounted editor.

### Q2 · Can multiple sections be mounted and editable simultaneously?

**No.** `activeId` is a single `string | null`; one `active` section, one body,
one editor. This is the single largest gap between today and the north star, and
it is a *mounting* limitation, not a data limitation — see Q1.

### Q3 · How do selection ranges survive across section boundaries?

**The question cannot arise today.** With one section mounted, a selection
physically cannot span a boundary. There is no existing behaviour to preserve —
and no existing guarantee either. Whatever this lane builds is the first answer.

### Q4 · How does Find/Replace behave across the whole draft?

**It does not exist.** `studioMap.ts:227` declares it `availability: 'later'`,
alongside Statistics, Timeline and Word Web; the file states plainly that *"only
Export is real."* The sidebar entry is a declared destination, not a built tool.

⛔ So Find/Replace is an **input to this lane, not a constraint on it** — and a
trap to name: a whole-manuscript view makes cross-draft Find/Replace look
trivially adjacent. It is a separate capability with its own mutation semantics
across 262 canonical sections, and must not be smuggled in as "just a view
feature."

### Q5 · Does "Keep a version" coherently snapshot many changed sections?

**Yes, already.** `settleDraft()` flushes pending work and waits on
`hasUnsavedWork()` — which is true if *any* staged section or queued save
remains — then returns the settled draft version, which `Keep a version` uses as
`baseRevisionId`. Versions are draft-level, so a keep is a snapshot of the whole
draft at a version, not of one section.

⭐ **This is the strongest existing foundation for the lane.** Editing six
sections in one continuous scroll and keeping a version is already coherent.

### Q6 · How does scroll-to-section from the left rail work?

`ManuscriptOutline.tsx:167` calls `onSelect(s.id)`, which **switches the mounted
section**. There is no scrolling — the centre is replaced.

Under the north star this inverts: *the rail becomes the map, the centre becomes
the territory.* The same gesture must move the eye within a continuous document
rather than swap a document out.

### Q7 · What happens at section boundaries when typing or deleting?

**Nothing happens, because no boundary is reachable.** The first boundary this
lane creates is also the first place a writer can backspace from the start of
Section 87 into the end of Section 86.

⛔ **Founder boundary, ratified here:** editing inside Section 86 edits Section 86
*directly*. Backspacing across a boundary must NOT silently merge two canonical
sections, and no editor may re-partition the manuscript behind the writer.
Merge, split and reorder remain **explicit structural acts** — WS2-08's
`topology_change_requires_explicit_command` discipline, which this view must
inherit rather than quietly bypass.

### Q8 · How is the Source / Working Draft distinction preserved for old imports?

Two tables, and the split is load-bearing:

- `manuscript_sections` — **Source**: the work as it arrived (an import, a
  30-year-old file).
- `manuscript_draft_sections` — **Working Draft**: what the writer is editing,
  addressable only once `section_addressable_at` is set.

⭐ **This matters most for exactly the writer the lane exists for.** Someone
returning to a decades-old manuscript must be able to work continuously *without
the original ceasing to exist as it was*. The continuous view renders the
Working Draft. The Source remains untouched and recoverable, and the view must
never blur which one is on screen.

---

## 2 · What the census changes about the plan

| Assumption | Census |
|---|---|
| Needs a new continuous persistence model | **No.** Staging is already multi-section; versions are already draft-level. |
| Needs a flattened document | **No, and forbidden.** One source of truth stays the 262 sections. |
| Find/Replace comes along for free | **No.** It does not exist at all. |
| Section switching can be reused for navigation | **No.** It swaps the centre; the lane needs movement within it. |
| Boundary behaviour must be preserved | **Nothing to preserve.** It must be *decided*, and the founder has: no silent merge. |

The lane is therefore **a mounting-and-navigation problem with a boundary
discipline**, not a data-architecture problem. That is a much smaller and much
safer shape than it first appears.

---

## 3 · Obligations to be discharged before BUILD is authorized

**W-1 · One source of truth.** The view renders the same canonical sections. No
flattening, no second document, no derived text that can be saved back as a
whole.

**W-2 · Section identity survives editing.** A keystroke inside a section edits
that section. No mounted editor may re-partition, merge, or reorder.

**W-3 · Boundaries refuse rather than guess.** A gesture that would change
topology does nothing structural and says so. Explicit commands only.

**W-4 · Settling still means settling.** With several dirty sections mounted,
`Keep a version` and Export must still refuse or settle — never export a state
the writer cannot see, which is the WS-EXPORT settle contract applied here.

**W-5 · Source is never edited by a view.** A continuous view of the Working
Draft may not write to `manuscript_sections`.

**W-6 · The divisions recede visually but not structurally.** Generous space or a
hairline, never cards or database-looking separators — and never at the cost of
a writer being unable to tell which section they are in when it matters.

**W-7 · Precision is not lost.** Section view remains, unchanged, for the work
that needs it. *Section for precision, Whole Manuscript for flow.*

---

## 4 · Founder rulings — 2026-09-08. BUILD AUTHORIZED.

**F-1 · Mounting is WINDOWED, and capture precedes unmount.**
262 live editors are not mounted at once. Virtualize around the viewport under
one invariant:

> **A section may not unmount until its exact visible state has been
> SYNCHRONOUSLY captured into the existing staged-section map.**

The focused section is **pinned** and cannot be virtualized away while the
writer is editing it. After capture, *dirty-but-unmounted is lawful* — the
census established that staging is keyed by `sectionId` and already holds
several dirty sections independently of the DOM.

```
visible editor
     ↓ before unmount — synchronous
staged Map<sectionId, body>
     ↓
existing draft-level save queue
```

⛔ No new persistence system. This is the same discipline `captureOnLeave`
already keeps at the section switch, applied to a second event: scrolling out of
view. The failure it prevents is identical — reading an editor's value after the
DOM has moved on is how the last thing someone typed disappears.

**F-2 · Backspace at a section boundary refuses, quietly.**
At the start of Section 87, Backspace does not merge into Section 86. A brief
inline message — *"Sections stay separate here."* No modal, no warning dialog,
no automatic trip to Structure. **Merge is not offered from this view in the
first cut**: merge, split and reorder remain explicit structural capabilities
owned elsewhere. *Whole Manuscript is for flow, not covert topology editing.*

**F-3 · The view switch sits at the top of the manuscript field, remembered per
member × Work.**
`SECTION | WHOLE MANUSCRIPT`, at the top of the canvas — not in Settings, not
buried in the sidebar. Persistence is **member × Work**, not a universal member
preference: someone may keep one book almost permanently in Whole Manuscript
while working section-by-section on another. Default is **Section** for a Work
that has never had a choice made.

⛔ **Age and provenance do not choose for the writer.** An old import is not
inferred into Whole Manuscript. The writer chooses how to enter their book.
This preference is **view state, never manuscript state**.

**F-4 · Find/Replace is out of scope.**
Whole Manuscript must not manufacture Find/Replace merely because the writing
now appears continuous. Cross-section replacement has its own mutation,
settling, review and undo questions. Separate lane.

**F-5 · Cross-section selection is not in the first cut.**
*(Ruled after the founder noticed §3 identified Q3 as having no existing
behaviour and then failed to carry it forward as an owed ruling — a real gap in
this document, corrected here rather than quietly filled.)*

Selection stays inside one canonical section. Whole Manuscript gives **visual
and navigational continuity, not a flattened editing buffer**. A writer scrolls
seamlessly from 86 into 87; a text selection does not become one mutable range
spanning both.

```
continuous reading        ✅
continuous scrolling      ✅
edit any visible section  ✅
section identity          ✅
cross-boundary mutation   ❌
silent repartition        ❌
```

Cross-section selection for copying, or for asking MAIA, may be worth designing
later. It arrives deliberately or not at all.

### First-cut boundary

```
windowed continuous section mounting
existing staged Map + save queue
capture-before-unmount
focused section pinned
rail click → scroll to section
Section / Whole Manuscript switch
preference per member × Work
quiet boundary refusal
Keep a version unchanged
Working Draft only
Source untouched

NO: Find/Replace · cross-section selection · merge/split/reorder ·
    new persistence model · flattened manuscript
```

⚠️ **One thing F-3 needs that this lane cannot supply.** *member × Work*
persistence implies account-level storage, and no preference table exists —
adding one is a migration, which this lane is not authorized to author and which
carries the BRANCH GATE consequences witnessed repeatedly on 2026-09-07. The
first cut therefore stores the choice **per device**, keyed by Work, and the
gap is recorded rather than hidden: a writer who opens the same book on a second
device gets the default until a preference store exists. Naming it here so it is
a known limitation rather than a silent failure of F-3.

## 5 · Not in this lane

Find/Replace · Statistics · Timeline · Word Web · shelf ordering · split/merge
commands (WS2-08C) · the writer-facing Develop presentation lane · anything that
writes to Source.

> The rail is the map. The centre is the territory. Neither may pretend to be
> the other.
