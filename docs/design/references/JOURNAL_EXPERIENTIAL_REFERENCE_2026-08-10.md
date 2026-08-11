# Journal — Experiential Reference

**Standing:** `EXPERIENTIALLY_APPROVED` (founder, 2026-08-10)
**Implementation standing:** ⚠️ **NEEDS RECOVERY** — see [result](#lineage-recovery-result)
**Vocabulary:** [`REFERENCE_STANDING.md`](REFERENCE_STANDING.md)

> ⛔ **This document does not name a canonical implementation, and no code path may
> be described as one on its authority.** It preserves an approved *experience*.
> The code lineage that produced it is, as of this date, unestablished.

Founder-authored, recorded in substance. These are the Journal reference states the
founder has walked and approved. Prior to this record they existed only in
conversation — which is itself the reason this file exists.

---

## The approved reference states

### Journal Arrival

- `JOURNAL`
- `What is here today?`
- `Begin writing`
- `Or note something`
- member writing before organization
- Browse secondary

### Writing Room

- writing happens in place
- no title ceremony
- first line can become title
- classification below writing, not before it
- quiet `Keep this`
- draft ≠ entry
- software recedes

### Reading Entry

- member words dominate
- metadata beneath
- long readable measure
- no records-management chrome

### MAIA Reflection

- `Reflect with MAIA` appears only on a kept entry
- `MAIA NOTICED`
- `MAIA ASKED`
- short response
- `Write from here`
- `Let it go`
- reflection itself transient

### Return

- one actual older piece
- factual reason for resurfacing
- `Why this?`
- no relevance theater
- no carousel

---

## Lineage recovery result

**Question:** which dev server → worktree → branch → commit → files produced the
approved rendering?

**Answer: no lineage found anywhere in this repository.**

### Method

Deterministic search for the distinctive approved copy across:

| Surface searched | Extent |
|---|---|
| Git refs | **2,575 refs → 1,584 unique tip commits** (`refs/heads` + `refs/remotes`) |
| Worktrees on disk | **73 roots**, including untracked and uncommitted files |
| In-repo HTML design studies | all of `docs/design/**/*.html` |

Both exact (case-sensitive) and loose (case-insensitive, partial) forms were run, so
this is not a casing or phrasing false-negative.

### Findings

| Approved string | Result |
|---|---|
| `What is here today?` | **0 hits** — anywhere |
| `Or note something` | **0 hits** — anywhere |
| `Begin writing` | 0 exact; loose → `app/press/studio/page.tsx` only (unrelated) |
| `MAIA NOTICED` | 0 exact; loose → `app/fields/[field]/with-me/`, `components/relationships/RelationshipTimeline.tsx` (unrelated) |
| `MAIA ASKED` | **0 hits** |
| `Write from here` | **0 hits** |
| `Why this?` | **0 hits** |
| `Reflect with MAIA` | present, but only in `app/studio/field/`, `app/studio/threshold/`, `app/wisdom-keepers/wisdom/` — **not Journal** |
| `Let it go` | only `app/maia/guide/page.tsx` (unrelated) |

**The shipped Journal is a different artifact.** `app/journal/page.tsx` is a 25-line
wrapper over `components/journal/UnifiedJournalView.tsx` (1,587 lines), whose entire
color inventory is nine amber usages — no ivory field, no serif, no `--sl-*` tokens.
Its only member-facing copy is `Journal`, `Find in my journal`, `Clear search`.

**The in-repo HTML studies are not it either.** The Author Studio phase-b files share
the literary register (`var(--serif)`, off-white `#FCFCFA`, ember `#D9705C`) but
their copy is *Sitting 001 — Returning*, *Study — Paper*, *The Page*. The Now What?
mockups are the CEO flourishing home. Neither carries the Journal arrival.

### What this means

The approved Journal experience was **not produced by any code currently or
historically in this repository**. Candidate explanations — none verified, none to be
treated as fact:

1. A rendering medium outside the repo (a design tool, a deck, a conversation-rendered prototype).
2. A worktree deleted before its branch was ever pushed.
3. A composed/specified design that was walked as a description rather than a running surface.

**This is recorded as an open question, not resolved by inference.** Per the founder
ruling: *do not solve this by declaring whatever is currently in the repo "the
approved Journal."*

### What is preserved

The **experience** above is authoritative and now durable. What is missing is its
implementation lineage.

### What unblocks the next step

The Room Character Register cannot list Journal as `CANONICAL_IMPLEMENTATION` until
either:

- **(a)** the founder identifies where the approved rendering was produced (a URL, a
  screenshot file, a tool, a machine), and the chain is re-established from there; or
- **(b)** a Journal implementation is built *to* this experiential reference, and that
  commit becomes the canonical lineage by construction.

Route **(b)** is available immediately and needs no archaeology — the reference above
is complete enough to build against. It would make the lineage true going forward
rather than recovering a lineage that may no longer exist.
