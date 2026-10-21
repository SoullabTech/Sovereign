# Writer's Field — gap map

**Date:** 2026-08-05 · **Referent:** deployed `f46a4fde4` · **Status:** ⛔ report only. No
implementation. No proposals. Per Prompt 1: *archaeology and alignment.*

**Governing question, from the design:** *How does a life become a book?* — ⛔ **not** *how does a
manuscript become a published book?*

**Sources read:** `docs/design/author-studio/phase-b/` — `STATUS.md` + five prototypes
(`writing-surface` · `sitting-001-returning` · `sitting-002-beginning` · `study-paper` ·
`study-revision`). ⏳ **Not yet read:** the six architecture docs (`R1_EXPERIENTIAL_SPECIFICATION_
CANDIDATE` · `INTEGRATE_PRACTICE_CANDIDATE` · `LIVING_WORK_ATLAS` · `STUDIO_COPY_VOICE` ·
`DESIGN_LENSES` · `MEMBER_EXPERIENCE_DESIGN_CONSTITUTION_CANDIDATE`) — they answer *why is it shaped
this way*, which this pass does not yet cover.

---

## 0. What STATUS.md rules before anything is read

⛔ **Binding constraints on any implementation, from the corpus itself:**

| Rule | Source |
|---|---|
| The surface is a `<textarea>` and **stays** one. A `contenteditable` migration would risk working autosave, selection restoration, scroll restoration, undo, and mobile editing **to reproduce one margin interaction.** | STATUS.md |
| `writing-surface.html` persistence is `localStorage` and **is superseded** by the server durability layer already deployed (PR #849 + #850). ⛔ **Do not port it.** | STATUS.md |
| ⛔ Do not take the prototypes' **navy**. The Author Studio is **espresso** (`pressTheme.ts`). | STATUS.md |
| ⛔ Do not take **any capability the prototypes imply but the product has not built.** | STATUS.md |
| **May** take: typography · measure · page spacing · paste behaviour · section breaks · the simplest viable marking gesture. | STATUS.md |

⚠️ **Chronology unresolved.** The phase-b prototypes and the claude.ai artifact set (*The field ·
Arrival · Your Work · Places & Gestures · Gather · The Page*) are **both dated 2026-07-31**. Phase-b
is navy and page-centred; "The field" is espresso with a gathering rail. They are **siblings, not
revisions** — so *which governs* is **not** answerable from dates. ⛔ Do not assume either
supersedes the other. The architecture docs may settle it.

---

## 1. The findings, stated by the design itself

Three prototypes reach an explicit **Finding**. These are the load-bearing sentences:

> ⭐⭐⭐ **`sitting-001`: "Home is the work."**
> ⭐⭐⭐ **`study-paper`: "Paper's advantage is that nothing moves. Don't move things."**
> ⭐⭐⭐ **`sitting-001`, the method rule: "Restore. Never interpret."**

`study-revision` records **observations only, no findings** — the design deliberately did not
conclude about revision. ⛔ Do not supply a conclusion it withheld.

### The test, pre-registered by the design
> **0 decisions · under 10 seconds · open → first keystroke**

### The two loops
```
Returning:  Decide → Return → Keep writing → Interrupted → Return       (protect: intention)
Beginning:  Idea → Capture → Waits → Return → Keep writing → Idea       (protect: new ideas)
```

### The explicit ⛔ list — what arrival must NOT contain
`sitting-001` names these directly: **Dashboard · Greeting · Counts · Streaks · Choices on arrival ·
Sign-in.**

⚠️ **The deployed `/press/studio` is composed almost entirely of this list.** Its Home is a work
list with Rename/Withdraw, an import form, and three disabled labels — i.e. **choices on arrival**,
which the design names as a thing to remove. The design's own comparison:

| | Steps | Decisions |
|---|---|---|
| **Studio (designed)** | open laptop → the work is there → read one paragraph → cursor waiting → start typing | **0** |
| Everything else | open laptop → dashboard → notifications → choose project → loading → find your place → start typing | 3 |

---

## 2. Gap map

**Columns:** *Designed* = what the experience wants · *Existing substrate* = what the system can
already support · *Current implementation* = what a member actually encounters ·
*Disposition* = build / connect / compose / defer / investigate.
⛔ Dispositions are **classifications, not authorizations.**

### A. Arrival & returning

| Designed | Existing substrate | Current implementation | Disposition |
|---|---|---|---|
| **"Home is the work"** — arrival lands *in* the writing | `useCurrentManuscript`, identity routing `?m=` (#892, deployed) | Home is a **list of works + import form** | **compose** |
| Show the last paragraph | draft `content` in `manuscript_working_drafts` | not surfaced at arrival | **connect** |
| Put the cursor back | ✅ caret persistence in `WorkingDraftEditor` (400 ms writer) | works *inside* the Room; not part of arrival | **connect** |
| Keep the scroll position | ⚠️ `#869` residue — scroll restoration is **structurally inert** (`.cm-scroller` `overflow: visible`) | non-functional | **investigate** |
| Name the work, quietly | `living_works.title`, nullable by design | named **loudly** — h1 + Rename/Withdraw verbs | **compose** |
| Already know them · stay quiet | member auth on every route | ✅ auth fine; ⛔ the room is not quiet | **compose** |
| ⛔ No choices on arrival | — | **the arrival is choices** | **compose** |
| **0 decisions, <10s, open→keystroke** | — | not measured, not measurable today | **defer** (this is the acceptance test, not a feature) |

### B. The writing surface

| Designed | Existing substrate | Current implementation | Disposition |
|---|---|---|---|
| A page: measure, type, spacing | `WorkingDraftEditor` (829) + `PRESS`/`SERIF` | exists, inside a 7-tab Room | **connect** |
| Nothing moves — paragraph returns to where it was | caret + (broken) scroll restore | partial | **investigate** |
| Fixed measure when the window changes | CSS-level | unverified | **investigate** |
| Section breaks | `manuscript_sections` (immutable source) | source-side only; not a draft gesture | **investigate** |
| The margin as a real place · mark with no mode change | ❌ none found | ❌ none | **defer** — STATUS.md warns the textarea must not become `contenteditable` for this |
| Show how much is left | `pageEstimate(charCount)` exists | shown on the manuscript tab, not while writing | **connect** |
| ⛔ Don't imitate: page breaks · paper texture · shadows · fixed page size · page numbers | — | not present | ✅ **already correct** |

### C. Beginning & capture

| Designed | Existing substrate | Current implementation | Disposition |
|---|---|---|---|
| Idea captured **without deciding anything** — no title, no folder, no question | `/api/sovereign/manuscripts/blank` invents no title, no folder, no attachment | ✅ **the route already honours this exactly** | **connect** |
| Spoken capture while walking — no typing | ⚠️ voice-note routes exist but are **practitioner/session-scoped** | ❌ no member walk-capture | **investigate** |
| *"Their own words, next to the work"* — six months later, beside the paragraph | `keeps` (verbatim-verified), `member_memory_atoms` | keeps are a **tab**, not beside the work | **connect** |
| ⛔ Remove: summary · auto-title · cleanup · folder choice · any question | — | ✅ blank route refuses all of these by construction | ✅ **already correct** |
| Keep their exact words + the recording | ✅ keeps verbatim; ⚠️ recording unverified | partial | **investigate** |

### D. Bringing material into the writing

| Designed | Existing substrate | Current implementation | Disposition |
|---|---|---|---|
| **Bring in →** a kept passage, at the caret | ✅ `f24ea189e` — *"bring a kept passage into the working draft at the caret"* | ✅ **built**, reachable from the keeps tab | **connect** |
| Provenance survives the crossing (*"brought in from Keeps… now it is text"*) | keeps carry section provenance | partial | **investigate** |
| KEEP · VOICE · QUESTION · RESEARCH as kinds | ✅ Keep only | Keep only | **investigate** — ⛔ *unverified, not missing* |
| *"Nothing here enters the text on its own"* | ✅ no detector/summarizer writes keeps; blank route has no implicit creation | ✅ holds | ✅ **already correct** |

### E. Revision

| Designed | Existing substrate | Current implementation | Disposition |
|---|---|---|---|
| Revision is a **different practice** from drafting | `working_draft_revisions` append-only, checkpoint, restore | revisions exist; no distinct *practice* | **defer** — ⛔ `study-revision` reached **no finding**; do not invent one |

---

## 3. What exists but is attached to the wrong layer

| Thing | Where it is | Where the design puts it |
|---|---|---|
| **Canvas** — pages, blocks, composition, atmosphere | Book Studio, founder-gated, **iframe over a static file, localStorage** | downstream of writing (Book Studio is publishing) |
| **Workbench** — Shelf/Group/Table/Card/Room | `components/book-studio/workbench/` | the gathering that surrounds writing |
| **Keeps / collections** | tabs *behind* the writing | **beside** the writing |
| **Page estimate / "how much is left"** | manuscript tab | while writing |

---

## 4. Missing entirely (⛔ nothing found under any name)

- The margin as a place; marking with no mode change.
- Member-facing spoken capture ("say it out loud on a walk"); resurfacing a recording beside a
  paragraph months later.
- Any measurement of the design's own test: **0 decisions · under 10 seconds.**

---

## 5. Answers to the four questions

1. **What is the first doorway?** — ⭐⭐⭐ **"Home is the work."** Arrival is not a room *before* the
   writing; it *is* the writing, with the last paragraph and the cursor already in place.
   ⏳ *Open in the design itself:* first visit with no work yet · switching work.
2. **What is the writing surface?** — A page with fixed measure, where **nothing moves**. A
   `<textarea>`, ⛔ explicitly not `contenteditable`.
3. **What surrounds the writing?** — The member's own prior words, **beside** the work, carrying
   what they were doing at the time. ⚠️ Whether that is a *rail* is **not** settled by these five —
   `Places & Gestures` (claude.ai, unread) is the artifact that would settle it.
4. **What does "return" mean?** — **Restore. Never interpret.** Put the writer back exactly where
   they were, ask nothing, offer nothing, and say the work's name quietly.

---

## 6. The one-line diagnosis

The design's arrival is **0 decisions**. The implementation's arrival is **a list of decisions**.
Nearly every disposition above is **connect** or **compose** — ⛔ very few are **build**. The
substrate largely exists; it is arranged behind the writing instead of around it.

⛔ **This document proposes nothing.** Per Prompt 1, the next step is reading the six architecture
docs, which answer *why this shape* — and only then the minimum-loop definition.
