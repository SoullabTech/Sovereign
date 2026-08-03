# Writer's Studio Phase 1 — Release Walk Record

**Date**: 2026-08-02
**Unit under walk**: Writer's Studio Phase 1 (release object, not a PR sequence)
**Walk authority**: founder-directed release-acceptance walk
**Recorded by**: Claude (Record, not Ratify)

---

## Disposition

**Release walk FAILED at W8.**

**Phase 1 is not ready for founder acceptance or deployment.**

W9 and all later Workbench steps were **not reached**. They are not "pending" and not
"passing" — they are unreached, and no evidence exists for them either way.

---

## W8 — Failure (blocking)

**The acceptance path W8 was written to prove:**

> a member performs a genuine Keep gesture → that Keep becomes available on the
> Workbench Shelf.

**What the running product actually does:**

| Surface | Behavior |
|---|---|
| "Keep this moment" (the prominent member Keep gesture) | creates a **capsule** |
| Workbench Shelf | reads `member_memory_atoms` stamped `generated_by='member-gesture'` |
| `/maia/keep-capture` | can mint those atoms — but **only from pre-existing developed Idea candidates** |

**Consequence**: a member with an ordinary MAIA conversation and no developed Idea
candidate has **no reachable gesture** that puts anything on the Shelf.

The prominent member Keep gesture and the Workbench Shelf use **different persistence
substrates**. Capsules are not atoms.

### Why the endpoint is not admissible evidence

Calling `POST /api/psyche/portfolio/keep` directly would prove the endpoint works. It
would **not** prove that a member can perform the act the release claims to support.

The opposite world — where members cannot get anything onto the Shelf at all — produces
the **same** endpoint result. An instrument that cannot distinguish the two worlds is not
an instrument for this question.

Any atom created that way must be labeled **"diagnostic fixture — not release acceptance
evidence"** and may only be used for developer diagnosis of already-tested Workbench
mechanics.

---

## W4 — Not a clean pass (member-facing defect)

Recorded as:

- blank WriterField **rendered correctly**;
- **direct click-to-focus failed** — the field was hit-test reachable and programmatic
  `.focus()` worked, but a real click did not focus it;
- writing was possible **only after programmatic focus**.

The walk was able to continue through instrumentation. A member cannot call `.focus()`
from DevTools. This is a member-facing defect, and W4 is **qualified, not clean**.

---

## Return routing — known seam surfaced by the walk

- `Start writing` routes correctly **by manuscript identity**.
- `Continue Writing` returns through `/press/manuscript?tab=draft` **without `?m=`** —
  i.e. it returns **by position, not by identity**.

In this single-manuscript fixture it happened to reopen the correct manuscript. That is a
property of the fixture, not of the routing. **Not a failure in this walk; unsafe before
multiple expressions/projects exist.**

---

## Evidence preserved

Successful evidence from W1–W7 stands and is preserved (per-step evidence remains in the
walk session record). It does **not** dilute the W8 failure. Passing seven steps of a walk
whose eighth step is the acceptance claim does not produce a partial acceptance — the
release object either supports the member act or it does not.

---

## Blocking corrections (narrow and concrete)

1. **Connect a genuine, generally reachable member Keep act to the canonical Field Object
   substrate consumed by the Shelf** — or alter the Shelf's admitted sources through an
   **explicit ontology ruling**. Do **not** silently treat capsules as atoms.
2. **Fix blank WriterField click-to-focus** and repeat the **real user action** (not
   programmatic focus).
3. **Replace return-by-position with identity routing** before project multiplicity makes
   the ambiguity consequential.

---

## Notes on standing

- This record is a **Record**, not a ruling and not an acceptance.
- No fix in this list is authorized by this record. Authorization is a separate act.

---

## Founder ruling on correction (1) — 2026-08-02

Correction (1) was ruled the same day by Kelly. **The ruling is not restated here.** This
record is evidence — *why* correction is required; the ruling governs *what* the correction
must be, and lives in its own document so there is one authoritative copy:

> `docs/architecture/FIELD_OBJECT_PROMOTION_RULING_2026-08-02.md`
> — *Capsule → Field Object promotion is an explicit member act.* Carries the preserved
> layer separation and the ten pre-registered acceptance criteria for the correction slice.

Corrections (2) and (3) are independent of that ruling and proceed on their own, as
**separate PRs or clearly separate commits** — each has its own acceptance and revert shape.

### Release state after the ruling — unchanged

> **FAILED at W8. Founder acceptance unavailable. Deployment unauthorized.**

### Implementation sequence

1. Fix real click-to-focus.
2. Fix return-by-identity.
3. Build explicit capsule → Field Keep promotion (10 pre-registered acceptance criteria in
   the ruling).
4. **Repeat the release walk from W1** — not resume at W8. The assembled release object
   will have changed.

⛔ **This record authorizes none of the above.** It records the failure and preserves the
evidence; authorization is a separate act, and the scope of (3) is governed by the ruling
document, not by this record.

## Correction status — 2026-08-02

Branch `fix/writerfield-click-to-focus`, two clearly separate commits.

| # | Correction | Commit | State |
|---|---|---|---|
| 1 | Blank WriterField click-to-focus | `a9cde4520` | implemented, verified by real pointer click |
| 2 | Return by identity | `b326a0a9a` | implemented, verified with two manuscripts |
| 3 | Capsule → Field Keep promotion | — | **not started**; governed by the ruling above |

### Correction 1 — cause and evidence

`.cm-content` is exactly as tall as its content — **33px** on an empty draft — while
`div.writing-surface` held the 60vh that made the blank page *look* like a page. A click in
the blank area landed on the wrapper, which focuses nothing. The 60vh now belongs to the
editable area itself, via a `minHeight` prop on `WriterField`.

Verified on a blank draft reached through the real **Start writing** gesture. No
instrumentation in the act under test:

- `.cm-content` height **33px → 432px**
- same click point: `div.writing-surface` → `div.cm-content`
- after a real pointer click at 70% of the field's height:
  `document.activeElement === .cm-content`, `.cm-editor` carries `cm-focused`
- 39 characters typed with **no programmatic focus anywhere in the sequence**

Counter-check (causality, not correlation): with `minHeight` overridden back to `0`, the
height returns to 33px and the same point resolves to `div.writing-surface` again.

### Correction 2 — cause and evidence

`Continue Writing` and `Read the Source` linked to the bare
`/press/manuscript?tab=draft`, which opens *the most recent manuscript*. The card those
links sit on already holds the manuscript's id; both now name it.

`Read the Source` was fixed alongside `Continue Writing` — same card, same manuscript, same
defect. Leaving it would have left two links about one object disagreeing on which object
it is.

Verified with **two manuscripts**, where position and identity genuinely differ:

- `Continue Writing` href → `/press/manuscript?tab=draft&m=<the card's id>`
- `Read the Source` href → `/press/manuscript?tab=manuscript&m=<the card's id>`
- bare `?tab=draft` → the **newest** manuscript, blank
- `?tab=draft&m=<older>` → the **older** manuscript, with its text

⚠️ **Still positional, and deliberately not fixed here**: the left-nav `Working Draft` /
`Source` entries in `app/press/studio/studioMap.ts`. That map is static and has no
manuscript in scope; giving it identity is a different change with a different shape.

### Gates

`npm run typecheck` — **green**, no regressions (239 errors, baseline 239; 30 files entered
the program from trunk drift, not from these commits).

### What this does not change

⛔ **The walk verdict stands: FAILED at W8.** Two corrections implemented is not a passed
walk. Acceptance requires correction 3 and then **a fresh walk from W1**.
