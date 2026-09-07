# WRITERS-STUDIO-WRITE-SELECTION-MAIA-01 · Step 1 · DISCOVER

**Read-only census.** No code changed. Evidence class `L` — source read on `50f5531c9`.

---

## The headline

**A selection→MAIA capability does NOT exist. An Ask-about-a-thing capability DOES**, and it is
closer to this lane's requirements than expected — including falsifier 8, which exists already as a
concept.

```
EXISTS AND REUSABLE          MISSING ENTIRELY
Ask threads + route          text selection capture (anywhere in WRITE)
anchors                      a passage/range anchor kind
staleness                    an "Ask MAIA" gesture near prose
verbatim verification        a revision-proposal object
                             adopt / replace / insert-below
```

## 1 · The live WRITE surfaces

| surface | status | note |
|---|---|---|
| `canvas/SectionWritingSurface` | **LIVE** | what a long book renders as; `<pre>` read-only, `<textarea>` editable |
| `canvas/Worktable` | **LIVE** | continuous path |
| `canvas/WritingSurface` | ⛔ **DEAD** | imported by nothing; carries a 4-material system no member could reach |

## 2 · Selection capture — ⛔ NONE

Every `onSelect` in the Studio is tree/navigation (outline rows, structure units, panels). **No
`getSelection`, no `selectionStart/End`, nowhere.** A. SELECT is genuinely new.

## 3 · The Ask substrate — richer than assumed

`POST /api/sovereign/manuscripts/[id]/ask` · `lib/manuscript/ask/*` · `canvas/AskMaia.tsx`
(mounted today only from `StructureReview`).

Three pieces this lane needs and does not have to invent:

- **Anchors** — `{ on: 'work' } | { on: 'proposal', … } | { on: 'division', … }`. ⛔ **There is no
  passage or range anchor.** A fourth kind is the load-bearing addition, and the anchor union is
  exactly where falsifier 3 lives: MAIA receives what the anchor names, not a surrounding chunk.
- **Staleness** — `computeStaleness`, `isCurrent`, `mustNotAssertCurrent`. **Falsifier 8 already
  exists as a concept**: the system can already say *the thing you pointed at has moved*. It has
  never been applied to a character range.
- **Threads** — `speaker: 'author' | 'maia'`, turns persisted. C. CONVERSE reuses this; RECONCILE's
  "do not invent a second MAIA" is satisfiable.

## 4 · Verbatim verification — the precedent is already ruled

`POST /manuscripts/[id]/keeps` takes `{ sectionId, text }` and **re-verifies the text exists
verbatim inside that member's own section before writing** (whitespace/curly-quote normalised).
*Keeps cannot originate text.* That is the same guarantee falsifier 3 needs, already built and
already ruled — a selection anchor should verify the same way rather than trusting an offset.

## 5 · Edit / save — can it replace an exact range?

⛔ **Not today.** The draft write paths are whole-content (`putDraft`) or whole-section
(`putDraftSections`) — no command anywhere replaces a character range. The section partition gives
exact per-section code-point ranges, and BUILD-07A's `EvidenceRef` already models a **passage**
(`section · passage · section-run · …`) with digest verification. E. ADOPT is new code but not new
architecture: the locator exists.

⚠️ Two ids, and confusing them is the trap this lane will hit. `manuscript_sections` (source) and
`manuscript_draft_sections` (draft) are different rows with different ids. WRITE edits the DRAFT.
Keeps verify against SOURCE. **A selection made in WRITE is a draft-section range, and the keeps
precedent verifies source text.** Which one an anchor names must be decided before A. SELECT.

## 6 · The Work-ambiguity finding

Confirmed against the founder's screenshot. `workContext` returns `ambiguous` for a manuscript
declared in two Works, and `MaiaColumn` then renders *"MAIA will not choose between them"* —
correct for a Work-level question, and **the wrong gate for local passage help**, exactly as ruled.
Nothing in the ask route requires a resolved Work; the block is in the surface, not the substrate.
So the crucial context rule is implementable without touching Work resolution at all.

## 7 · Open before CONSTITUTE

1. **Which id does a passage anchor name** — draft section (what WRITE edits) or source section
   (what keeps verify)? §5.
2. **Range or text or both?** The keeps precedent verifies text; BUILD-07A verifies a digested
   range. A selection that survives an edit needs the second; a selection that survives a
   *re-segmentation* needs the first.
3. **Where does a proposed revision live** before adoption — ask-thread turn, or its own object? It
   must not be manuscript text (falsifier 6), and a turn may be enough.

## Standing

⛔ Nothing built. Falsifiers 1–10 not yet pinned as tests. Steps 2 (RECONCILE) and 3 (CONSTITUTE)
not begun. No branch opened.
