# WS-EDITORIAL-UI-03 · EXACT VERSION COMPARISON

**Branch** `claude/ws-editorial-ui-01` · **base** `2b90a8e5c` (UI-02, CLOSED).

**Status: COMPARISON WITH NO AUTHORITY CONSEQUENCE · BROWSER-WITNESSED 91/0 ·
MERGE NOT AUTHORIZED · PRODUCTION UNTOUCHED.**

> The writer's next gain is not more power. It is clarity about exactly which
> authored wording they are looking at, before they decide anything.

---

## 1 · What is compared, and what is deliberately not

```
the passage as this editorial relationship OPENED
                    versus
one EXACT authored ProposalVersion
```

⛔ Not the current manuscript · ⛔ not the latest version · ⛔ not the head by
default.

⭐ `locusText` is the chain's **historical provenance**, and the Work may have
moved since the relationship opened. So the left side is labelled
**"Passage when this exchange opened"** and never *Original*, which would be read
as *what the manuscript says now*.

---

## 2 · Selection is another frozen gesture

`ComparisonTarget` is `useState` set **only** by an explicit
**"Compare with passage"** click on one version. ⛔ Never from `headVersionId`,
⛔ never from `versions[length - 1]`, ⛔ never from `composerTarget` — those
answer different questions.

```
lineage head         V3
comparison target    V1   ← stays V1
```

It moves only through another explicit click. The compared version is then read
back **by its frozen id**, so the screen shows what the server says about the
version the writer chose rather than whichever one is current.

⭐ Comparison is presentation state and is not preserved across a browser
reload — deliberately. Losing an open comparison costs one click; losing a thread
or a ProposalVersion would be a different kind of loss.

---

## 3 · No seam, no diff, no decision

⭐ UI-02 already returns everything needed — `view.locusText` and
`view.versions[]`, immutable and structurally ordered by the server. So UI-03
adds **zero DB writes · zero new API · zero authorization reads · zero Work
mutation**, and ⛔ fetches no manuscript to look "more current", which would
silently change the subject from the chain's historical locus to the present Work.

⛔ **No character diff.** Full exact wording is already truthful, and a diff
engine is another interpretation surface this does not need.

⛔ **No decision.** There is no Keep, Keep Original, Accept, Revise, Adopt, Apply
or Use this. "Done comparing" dismisses a view and decides nothing about the
Work. "Write my version from this" keeps exactly its UI-02 meaning: author
another ProposalVersion. The standing sentence stands.

Side by side where there is room, stacked where there is not — one
`auto-fit / minmax` grid, no breakpoint logic.

---

## 4 · Witness — 91 passed · 0 failed, real Chromium

Added to the existing sequence, on a lineage that already holds MAIA V1, the
member's V2 and a third formulation:

- **K1a/K1b** the left side is labelled by provenance, never *Original*, and
  carries the frozen locus wording exactly
- **K2–K4** the right side is the **exact** version clicked, named with its
  author and ordinal, showing its exact wording
- ⭐⭐ **K5/K6** the succession head is a *different* version, and the comparison
  **still shows V1**
- **K7–K10** comparing wrote **no turn · no version · no authorization**, and the
  manuscript is untouched
- **K11/K12** no decision is offered; the standing sentence is present
- **K13–K15** another explicit gesture moves it and only that; authorship follows
  the version; the left side never moves
- **K16** it survives an ordinary server re-read of the thread

Six source obligations, falsified against six mutants — comparison following the
head (**the tempting one**, killed explicitly) · read by position · the label
reading *Original* · a decision affordance appearing in Compare · a fetch of the
current Work · comparison mirroring the composer target.

---

## 5 · ⚠️ Three defects of my own, all instrument

**(1) `ORDER BY id` was wrong, and it had already reported green.** `vRows()`
ordered by a UUID, so `rows[length - 1]` was not the newest row and `slice(-1)`
was not the head. The UI-02 run's **B11 passed by luck**. Ordering is now
`authored_at`, the **head is derived from succession** (the version nothing
supersedes), and the empty-formulation obligation identifies its row **by the id
the server returned** instead of by position. This also gave `B3`, which checks
the closed-shape probes are aimed at the real head.

⭐ Worth stating plainly: **UI-02's B11 was a true conclusion reached by an
unsound instrument.** The finding is about the witness, not about the product.

**(2) A tautology, caught before it ran.** A first `K1` compared the left side's
text *to itself* — it would have passed on any rendering at all. Deleted rather
than repaired; `K1a` and `K1b` are the two separable claims it was pretending to
make (a provenance question and a content question).

**(3) A slice bounded by a string that is not there is a slice to end-of-file.**
The comparison-block scan ended at `indexOf('YOUR VERSION')` while the source says
`Your version`, so `-1` made the "comparison block" the whole rest of the
component and it failed on the *composer's* copy. Then the repaired anchor
(`══ YOUR VERSION`) was inside a comment that `strip` removes — and the new guard
asserting **both ends** caught that too, loudly, which is what it is for.

---

## 6 · One observation, reported — ⛔ not changed

The standing sentence *"Nothing changes until you explicitly adopt a version."*
now appears **twice** when comparison is open: once under the lineage and once
under Compare. Both are correct in place, and neither is obviously the one to
drop. ⛔ Left alone — panel density is the held class.

---

## 7 · Gates

- Browser witness → **91 passed · 0 failed**
- `npm run typecheck` → **229 vs baseline 239 · 0 regressions · exit 0**
- `app/writers-studio` + `lib/writersStudio` → **878 passed · 52 suites · 0 failed**

## 8 · Standing

**WS-EDITORIAL-UI-03 · EXACT COMPARISON LIVE BEHIND THE FLAG · NO AUTHORITY
CONSEQUENCE · BROWSER-WITNESSED 91/0 · MERGE NOT AUTHORIZED · PRODUCTION
UNTOUCHED.**

Held: Keep Original · a Revise decision affordance · Adopt exact version ·
authorization/execution UI · legacy retirement · the global audio toast · the
inner panel border/ramp · panel density including the composer below the fold and
the duplicated standing sentence · canonical integration (canonical `8cb640644`;
this chain is based through `a2ed3c67d` and is **not merge-ready by implication**).
