# House-Navigation Candidate — Reconciliation Report

**Date:** 2026-07-23 · **Status:** read-only reconciliation · no push / merge / rebase / split / amend / delete
**Candidate:** `feature/house-canonical-navigation` @ `12fa86fb9` (7 files, +250/−52), branched from `9ad5bf969` (#691 head)

---

## Recommendation: **C — clean-main supersedes the candidate.** Do not rebase; do not promote.

A parallel lane implemented tonight's rulings **directly onto `clean-main`**, more completely and on the current base, while this candidate rebuilt them on a 67-commit-stale base. The proof is not similarity — it is identity: `clean-main`'s `maiaNav.ts` carries the verbatim ruling comment *"RULING (Kelly, 2026-07-22): Now What? is a CLIENT BUILD on AIN OS"* authored in this conversation. Same rulings, both lanes.

---

## 1. Base + drift

- current `clean-main` (origin): **`c68116974`** (local `740e5f01d`)
- candidate base `9ad5bf969` **is an ancestor** of clean-main — #691 is merged.
- **67 commits** on clean-main since the base. **All seven candidate files drifted**, most heavily `OracleConversation.tsx` (24 commits, +724/−91 — mobile/transcript/scroll era the candidate has none of).

A clean rebase is not viable: `OracleConversation.tsx` alone would conflict extensively, and the House files were rewritten by the parallel lane.

## 2. The parallel lane already shipped this ruling

Commits on clean-main, one-to-one with tonight's rulings:

| clean-main commit | Ruling it implements |
|---|---|
| `07d6c3e32` the House becomes the navigation — retire the feature rail | rail retirement |
| `b8cdb64d4` House grammar is Your Center · Worlds · Rooms — and nothing is orphaned | grammar + orphan recovery |
| `972ec1581` mode switch beside the composer, quieter Ask MAIA | Ask MAIA restoration |
| `6c2802737` / `e53e46876` centre the MAIA wordmark, gate at measured width | top-bar ownership + overflow |
| `034fede96` the House doorway rests as an icon, reveals its name on hover | doorway refinement |
| `44b6aea73` Help moves into the House | orphan recovery (not in candidate) |

## 3. Behavior parity (candidate vs clean-main)

| Behavior | clean-main | candidate |
|---|---|---|
| Rail retired (render-level, not import) | ✓ | ✓ |
| Your Center / Worlds / Rooms | ✓ | ✓ |
| Keeps + Co-lab recovered | ✓ (Co-lab richer) | ✓ |
| Now What? excluded (client-platform ruling) | ✓ same comment | ✓ |
| Ask MAIA in composer, `askMode` semantics | ✓ | ✓ |
| MAIA wordmark ownership | ✓ centred + measured-width | ✓ hidden `<sm` |
| `I'm ready` + activation-as-state-transition | ✓ | ✓ |
| Help into House | ✓ | ✗ |
| Transcript clears the jewel | ✓ | ✗ |
| Doorway hover-reveal name | ✓ | ✗ (always labelled) |
| **"Where you were" (last-place evidence)** | ✗ | **✓ — only unique-to-candidate** |
| Base freshness | HEAD | 67 commits stale |

clean-main is a **strict superset** but for one item.

## 4. The one salvage: "Where you were"

The candidate's sole unique behavior is the member-authored **last-place** row in the House (`maia_last_place`, written by the House's own `enter()`; heading shown only when evidence exists). clean-main does not have it. It is a small, self-contained seam (~20 lines in `MaiaHouseSheet`) and a **candidate for a fresh, tiny PR against current clean-main** — not a reason to rebase 7 files. It must be re-derived on clean-main's House sheet, not lifted, since that file was rewritten.

## 5. `feature/arrival-ceremony`

- 2 commits (`0a333abbf` restore ceremony, `4220be3b5` marker on first expression), 3 files, unique vs clean-main.
- clean-main already carries the Arrival ceremony, `I'm ready`, activation-as-transition, and the arrival marker (`recordFirstArrival`), on current base.
- No `onTapJewel` / "TAP TO SPEAK" regression remains in the branch (0 refs), but clean-main's ratified version supersedes it regardless.
- **No unique Arrival behavior would be lost by deletion** — but per standing instruction the branch is **NOT deleted**; this only records that it is safe to.

## 6. Evidence reclassification (per ruling)

The six-journey pass used a **forged `maia_session` cookie — a rendering fixture, not an authenticated session.** It legitimately verified:

- ✓ rendering, navigation reachability, responsive geometry
- ✓ client-side Arrival state (marker on expression, not activation)
- ✓ Ask-mode client state + visible active state
- ✓ contextual Keep **discoverability** (observed, not implemented)

It did **not** verify: authenticated member behavior · Keep **persistence** · server-backed conversation restoration · authorization boundaries.

## 7. Process defect to isolate later (not tonight, not in this branch)

An automated `wip: preserve alternate House navigation work` commit (`643e6ac4b`, Kelly identity, 00:21) mutated history mid-session, capturing uncommitted work. Record for later: what process creates it, whether it runs in every worktree, whether it can commit during active agent sessions. **Not investigated or disabled here.**

## Disposition — CLOSED (Kelly-ratified, 2026-07-23)

> **Reconciliation closed: candidate architecture was independently superseded on current
> clean-main. No candidate code will be promoted. "Where you were" remains an unapproved
> standalone possibility. Rendering evidence was retained; authenticated claims were not made.**

- Preserve `feature/house-canonical-navigation` @ `12fa86fb9` as historical evidence. **No PR. Do not
  transplant the seven-file diff. Do not rebase or split.**
- Keep `feature/arrival-ceremony` **undeleted** for now, despite the comparison showing it is safe to retire.
- Evidence boundary retained exactly: the forged `maia_session` cookie was a **rendering fixture, not
  authenticated verification**.
- Automated-checkpoint defect: **recorded, isolated from product work**; not investigated tonight.

### "Where you were" — a new candidate *question*, not salvaged implementation

Behaviorally confirmed absent from clean-main (0 last-place refs across `MaiaHouseSheet`, `maiaNav`,
`MaiaShell`; Your Center holds only MAIA + Return to Arrival) — **not** a semantic equivalent under
another name. Uniqueness alone does **not** authorize construction. Before any fresh PR, determine
whether member-authored last-place navigation still fits the current House grammar and whether real
use demonstrates a need. **It does not preempt the ratified sequence:**

```
recovery seam merge → authenticated verification harness → benign authenticated proof
→ Header Keep → wider mobile work
```

### Operational correction (base-freshness)

Local `clean-main-no-secrets` was **stale** (`740e5f01d`) while origin was `c68116974`. Any future
worktree must be created **only after `git fetch` and confirming its base == current remote head**,
or the same parallel-lane duplication risk recurs. This candidate was built on a base that was already
67 commits behind — that staleness, not the code, is why it duplicated.
