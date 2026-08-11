# Journal Slice 1 — Implementation Contract

**Status:** ⛔ **PRE-IMPLEMENTATION. Returned for review per Work Unit §4.** No code edited.
**Date:** 2026-08-10

---

## §2 — Lineage declaration

```
EXPERIENTIAL SOURCE:          JOURNAL_EXPERIENTIAL_REFERENCE_2026-08-10.md
PRIOR IMPLEMENTATION LINEAGE: NOT RECOVERED
NEW IMPLEMENTATION LINEAGE:   BEGINS WITH THIS WORK UNIT
```

This is a **build**, not a reconstruction. No byte or code ancestry is claimed.

---

## §10 — File boundary

### What exists today

| Path | Lines | Relationship to the approved reference |
|---|---|---|
| `app/journal/page.tsx` | 25 | thin wrapper → `UnifiedJournalView` |
| `app/labtools/journal/page.tsx` | ~20 | founder-gated alternate entry, same view |
| `components/journal/UnifiedJournalView.tsx` | 1,587 | **not the approved room** — category filters, sub-filters, search, 6 entry types, chart insights |
| `components/journal/QuickJournalSheet.tsx` | ~1,000 | capture sheet |
| `components/journal/JournalChartInsights.tsx` | ~700 | astrology overlay |
| `components/journal/HandwritingUploadSheet.tsx` | ~450 | OCR upload |

`UnifiedJournalView` carries search, tagging, taxonomy and category navigation —
all explicitly excluded by Work Unit §3. **Retrofitting it would mean deleting most
of it**, and it is shared with a founder-gated route. Per §1 (*do not allow existing
component convenience to redefine the approved room*) and §10 (*distinguish reuse
from inherited design authority*), Slice 1 is a **new minimal room**.

### ⚠️ Routing decision requiring your ruling

`/journal` currently serves `UnifiedJournalView` to members. Slice 1 will be built at
a **new route, additive and reversible** — the existing surface is untouched:

```
NEW:      /journal/room     ← Slice 1, the approved room
UNTOUCHED: /journal          ← UnifiedJournalView, still live
```

Cutover — whether the approved room takes `/journal` and what becomes of
`UnifiedJournalView` — is **deliberately deferred to a founder ruling**, not decided
inside Slice 1. Deleting a live member surface is larger than this unit.

### Declared minimum file set

| File | New/Modified | Purpose |
|---|---|---|
| `app/journal/room/page.tsx` | new | route |
| `components/journal/room/JournalRoom.tsx` | new | state machine across the 5 states |
| `components/journal/room/Arrival.tsx` | new | state 1 |
| `components/journal/room/WritingSurface.tsx` | new | state 2 |
| `components/journal/room/EntryReader.tsx` | new | state 3 |
| `components/journal/room/Reflection.tsx` | new | state 4 |
| `components/journal/room/Return.tsx` | new | state 5 |
| `components/journal/room/tokens.ts` | new | room register, `--sl-*`-derived |
| `docs/design/contracts/journal-room.md` | new | Experience Contract (gate) |

**No migration. No API changes. No shared-component refactor.**
If this set grows materially → STOP and report per §10.

### Reuse — explicitly *not* inherited design authority

| Reused | As | Why this is reuse, not lineage |
|---|---|---|
| `POST /api/journal/quick/list` | create entry | data plumbing; carries no visual authority |
| `GET /api/journal/quick/list` | list entries | ditto |
| `POST /api/journal/reflect` | `{entryId}` → `{noticed, asked}` | **already matches the reference exactly**, incl. reading text from the member's own row, never the request |
| `lib/http/apiBase` | auth/member id | infrastructure |

---

## §4 — Reference extraction

### Schema note governing states 2–3

`quick_journal_entries` = `id · user_id · entry_type(dream|day|handwriting) · content ·
tags · source · meta · created_at`. **No draft/kept column — and none is needed.**

> **draft ≠ entry** is satisfied structurally: a draft is unsaved local text; `Keep this`
> is the gesture that creates the row. Nothing is persisted until the member keeps it.

This is the most faithful reading of the reference *and* requires no schema change.

---

### State 1 — Journal Arrival

| | |
|---|---|
| **Visible copy** | `JOURNAL` · `What is here today?` · `Begin writing` · `Or note something` · `Browse` |
| **Hierarchy** | `What is here today?` is the largest element. `JOURNAL` is a small quiet marker above it. Writing invitation sits directly beneath the question. |
| **Primary action** | `Begin writing` → state 2 |
| **Secondary** | `Or note something` (shorter capture, same surface, lower emphasis) · `Browse` tertiary, visually recessive |
| **MAIA presence** | **none** |
| **Writing surface** | not yet open |
| **Composition** | vertically centred, wide margins, single column; most of the viewport is empty |
| **Transition** | → 2 (`Begin writing` / `Or note something`) · → 3 (`Browse`) |
| **MUST NOT appear** | search field · filters · category tabs · entry counts · streaks · stats · card grid · date pickers · MAIA |

### State 2 — Writing Room

| | |
|---|---|
| **Visible copy** | `Keep this` — and nothing else chrome-side |
| **Hierarchy** | the writing surface *is* the page |
| **Primary action** | `Keep this` — quiet, low-contrast until there is text |
| **Secondary** | classification (`day` / `dream`), **rendered below the writing, revealed only after text exists**, never before |
| **MAIA presence** | **none while writing** |
| **Writing surface** | opens focused, no title field. First line becomes the title on keep. Auto-growing; long readable measure. |
| **Composition** | no toolbar, no formatting bar, no word count, no autosave chatter |
| **Transition** | `Keep this` → creates row → state 3 |
| **MUST NOT appear** | title ceremony · required tags · toolbar · word count · "Draft saved" · AI suggestions · publish/share |

### State 3 — Reading Entry

| | |
|---|---|
| **Visible copy** | the member's text · a date · `Reflect with MAIA` |
| **Hierarchy** | member words dominate absolutely; metadata beneath, small and quiet |
| **Primary action** | `Reflect with MAIA` (present only because this entry is **kept**) |
| **Secondary** | back to arrival |
| **MAIA presence** | offered, not active |
| **Composition** | long readable measure (~60–70ch), generous leading |
| **Transition** | → state 4 |
| **MUST NOT appear** | edit/delete toolbars · tag chips row · "Entry #12" · metadata table · export · share · related-entries rail |

### State 4 — MAIA Reflection

| | |
|---|---|
| **Visible copy** | `MAIA NOTICED` · `MAIA ASKED` · `Write from here` · `Let it go` |
| **Hierarchy** | reflection sits **beneath** the member's entry; entry remains visible and dominant |
| **Primary action** | `Write from here` → state 2, seeded by the question |
| **Secondary** | `Let it go` → dismisses; reflection is **transient, never persisted** |
| **MAIA presence** | two short labelled statements. Short response. Not a chat thread. |
| **Data** | `POST /api/journal/reflect {entryId}` → `{noticed, asked}` |
| **Transition** | → 2 (`Write from here`) · → 3 (`Let it go`) |
| **MUST NOT appear** | chat input · message bubbles · streaming cursor · avatar · "MAIA is thinking" · regenerate · persisted reflection history · follow-up turns |

### State 5 — Return

| | |
|---|---|
| **Visible copy** | one older entry excerpt · a factual reason · `Why this?` |
| **Hierarchy** | one piece only |
| **Primary action** | open it → state 3 |
| **Secondary** | `Why this?` → discloses the literal selection rule |
| **MAIA presence** | none |
| **Selection rule** | **deterministic and date-derived only** — e.g. *"You wrote this a year ago today."* / *"This is the oldest thing you kept."* No similarity scoring, no ranking, no inference. `Why this?` states the actual rule in plain language. |
| **Composition** | a single quiet block on the arrival surface, below the writing invitation |
| **MUST NOT appear** | carousel · "Recommended for you" · relevance % · multiple suggestions · "Because you wrote about X" |

---

## Register (§5)

Derived from `--sl-*` tokens; the room modulates the **signal layer only**, per
`SOULLAB_THEME.md` (*"the field stays continuous"*). Ember/accent restricted to the
single primary gesture per state — never decorative.

⚠️ The approved reference does **not** specify literal colour values, and none are
inherited from Author Studio, Studio Field, Studio Threshold or Wisdom Keepers.
*Similarity is not lineage* (§5). The room takes its register from the House token
layer plus the reference's own qualities: quiet, spacious, literary, writing-first.

---

## Open questions for your ruling

1. **Route.** `/journal/room` additive as proposed, or should Slice 1 take `/journal` directly?
2. **`Or note something`.** Read as a *shorter* writing surface on the same page (my reading), or as a distinct capture affordance?
3. **Return placement.** On the arrival surface as specified above, or a separate state reached deliberately?

Proceeding on the readings above unless corrected.
