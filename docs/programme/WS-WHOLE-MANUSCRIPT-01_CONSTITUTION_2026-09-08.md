# WS-WHOLE-MANUSCRIPT-01 — Constitution

**Standing: DISCOVER / CONSTITUTE. BUILD NOT AUTHORIZED.**
Opened by founder act 2026-09-08. No code written.

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

## 4 · Open questions for founder ruling before BUILD

1. **Mounting strategy.** All 262 sections mounted at once (simple, heavy), or
   windowed around the viewport (light, but a section can scroll out mid-edit)?
   This decides whether "dirty but unmounted" is a state that can exist.
2. **What the boundary gesture DOES.** Backspace at a section start: silently
   nothing, a quiet inline note, or an offer of the explicit merge command?
3. **Where the view switch lives**, and whether the choice persists per Work or
   per member.
4. **Whether Find/Replace is in scope at all.** Recommendation: no — separate
   lane, because it mutates across sections.

---

## 5 · Not in this lane

Find/Replace · Statistics · Timeline · Word Web · shelf ordering · split/merge
commands (WS2-08C) · the writer-facing Develop presentation lane · anything that
writes to Source.

> The rail is the map. The centre is the territory. Neither may pretend to be
> the other.
