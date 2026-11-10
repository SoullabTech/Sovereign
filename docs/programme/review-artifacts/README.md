# Review artifacts — Writer's Studio Develop P0 (2026-11-10)

⛔ **These are UNAPPLIED patch files, published only so they can be inspected.**
Neither has been applied to any branch. Nothing here lands a change on PR #2207,
on canonical, or on any source file.

Why they are here: they were produced in a cloud session and lived only in that
container's scratchpad, which the reviewing host cannot reach — so the clean-apply
result and the line counts were one session's unverifiable local evidence. Committing
the artifacts makes the exact diffs readable where the record already is.

| File | Applies to | Size | Disposition |
|---|---|---|---|
| `WS-DEVELOP_P0_PATCH-1_FOR_PR2207_2026-11-10.diff` | `chore/ws-develop-density-spec-20261109` @ `090a6ba9e` | +130 / −1, 2 files | For the #1800 source owner to incorporate into PR #2207 |
| `WS-DEVELOP_PATCH-2_INVITATION_FOR_OWNER_2026-11-10.diff` | `clean-main-no-secrets` @ `de8c3d04b` | +1 / −1, 1 file | Separate, narrowly scoped source-owner review |

Integrity, so a later copy can be checked against the reviewed one:

```
PATCH-1  sha256  7b6b0e14a16f65108ceb9edc9f41026c…   159 lines
```

Verify before use, rather than trusting this file:

```sh
git apply --check docs/programme/review-artifacts/WS-DEVELOP_P0_PATCH-1_FOR_PR2207_2026-11-10.diff   # from 090a6ba9e
git apply --check docs/programme/review-artifacts/WS-DEVELOP_PATCH-2_INVITATION_FOR_OWNER_2026-11-10.diff  # from de8c3d04b
```

PATCH-1 carries the two precision corrections ruled on 2026-11-10: the confirmed
render-path exit is kept separate from the unverified unfolding, and capability
parity is stated in capabilities rather than in the 56 handler entries. PATCH-2
restores the wording ruled in `WS2-DIALOGUE_FORM_RULINGS_2026-09-08.md` R1 and
needs no part of `cd1235d3`'s ancestry.

⛔ No P0 code fix, PR merge, deployment or release authorization follows from these
files existing. Release ledger #1938 remains HOLD.

## Added 2026-11-10 — P0 observation-state qualification (draft PR #2208 candidate `a70bd1cc6`)

⛔ **Unapplied, as above.** Nothing here lands on PR #2208, #2207, canonical or any source file.

| File | What it is |
|---|---|
| `WS-DEVELOP_P0_OBSERVATION_STATE_RESULTS_2026-11-10.md` | The record: gating answer, reachability, scenario PASS/FAIL/NOT TESTED, findings F1–F5, the #2207/#2208 approval reconciliation, founder visual questions |
| `WS-DEVELOP_P0_PATCH-3_OBSERVATION_NO_AUTOSELECT_FOR_PR2208_2026-11-10.diff` | **+5 / −2, one file.** Stops the two *automatic* observation selections on `overview`. Applies cleanly to `a70bd1cc6`. `sha256` prefix `30709f35e124b0a3`. **Requires source-owner authorization.** |
| `p0-observation-repro/p0_seed.ts` | Freezes two **hand-authored fictional** readings through the product's own capture/freeze/store (the model calls are skipped; provenance says so) |
| `p0-observation-repro/p0-accept.mjs` | The acceptance run. Parameterised by `P0_MS` `P0_MS2` `P0_RA` `P0_RB` `P0_OUT` `CHROMIUM`; assumes `ws-continuity-walk.sh up` and the two fictional writers `bwriter` / `cwriter` |

The seed needs a **kept version** first (press *Keep a version* in Write), because the product correctly refuses to read a draft with no revision.

## Added 2026-11-10 — P0 integrated experience walk

⛔ **Evidence only.** No source file is modified; nothing is promoted, merged, deployed or released.

| File | What it is |
|---|---|
| `WS-DEVELOP_P0_INTEGRATED_EXPERIENCE_WALK_2026-11-10.md` | The seven-scenario walk against `895ffbc61c42` (#2208 + canonical), the acceptance matrix, what is BLOCKED or untested, and the corrections made to my own instrument |
| `p0-walk-repro/` | The walk, helpers, stand-in model and reset scripts, and the raw `events.jsonl`. **Container paths**: provided for audit, not as a runnable kit |
