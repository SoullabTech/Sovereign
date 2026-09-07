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

## 7 · CONSTITUTE rulings — founder, 2026-09-07

The three questions this census raised are ruled. They are recorded here rather than left as
open items, because a census that still asks a settled question misstates the lane.

```text
PASSAGE ANCHOR     → DRAFT section
ANCHOR EVIDENCE    → range + server-verified text snapshot + digest
REVISION PROPOSAL  → structured MAIA Ask-thread turn until explicit adoption
```

**Draft section** resolves §5's trap in the only direction that can work: WRITE edits the draft, so
an anchor naming a source section would point at rows the writer is not editing.

**All three evidences, not one.** This is stronger than either precedent alone and it is what makes
falsifier 8 *decidable* rather than merely detectable. With range + text + digest the system can
tell apart the two ways a selection goes stale:

| what happened | range | digest | what the system must do |
|---|---|---|---|
| the writer edited those words | valid | mismatch | refuse — the words are not the ones MAIA read |
| the section was re-segmented | invalid | — | refuse; the text snapshot says what was pointed at |
| nothing moved | valid | matches | adoption may proceed |

A range alone cannot see the first; a text snapshot alone cannot see the second. ⛔ Neither may be
dropped as redundant.

**A proposal is a thread turn.** It satisfies falsifier 6 by construction — a turn is not manuscript
text, and no adoption path exists that does not pass through the writer. RECONCILE's "do not invent
a second MAIA" holds: no new object, no new store.

### Governing behaviour, fixed

- A passage selection is **sufficient authority** for passage-local help.
- **Work ambiguity may not block it** — the block is in the surface, not the substrate (§6).
- **MAIA may propose; only the writer may alter the manuscript.**

## Standing

```text
DISCOVER            ✅ this document
CONSTITUTE RULINGS  ✅ §7
RECONCILE           OPEN — deploy verified 2026-09-07T22:35Z
BUILD               HOLD — additionally blocked by the five-point founder witness
PR                  none
```

⛔ Nothing built. Falsifiers 1–10 not yet pinned as tests.

**Deploy verified — both halves, 2026-09-07.** A green deploy command was never the proof:
`deploy-production.sh` runs migrate AFTER the swap and only `log_warn`s on failure, so it reports
success over a schema that never changed. Both were read directly.

```text
PRODUCTION PROVENANCE   GIT_COMMIT = 50f5531c9                         ✅
SCHEMA WITNESS          20260907000003_studio_atmosphere      22:35:37.875Z
                        20260907000004_living_work_visual     22:35:37.942Z
                        20260907000005_canvas_surface         22:35:38.004Z
                        20260907000006_..._comment_correction 22:35:38.069Z
```

Applied in order, 63ms apart — the migrate phase of the deploy that took the lane at 22:28:44Z.
Nothing else rode along: `google_oauth_state` (20:35Z) and `vault_erasure_queue` (19:31Z) belong to
earlier deploys.

⛔ **Deployed is not witnessed.** The five-point Writer's Studio witness has no recorded result, and
BUILD stays held on it.
