# Living Field + Writer's Studio Witnesses — Re-baseline after RC1

**Date:** 2026-10-01
**Status:** SOURCE RE-BASELINE COMPLETE · live check 1 ✅ (cabin mode empty) · per-walk SHA start/end still owed
**Previous readiness runtime:** `975a208b8c39f99e9b47208ce5139bbec94bd8ac`
**Current production runtime:** `03f0fd3abce16fcc1132481836b2e6ff8d364cd7` (founder deploy, ~14:35Z)

## Correction to the premise

The first-entry protocol does **not** pin `975a208b8`. Its precondition 4 reads *"production health is green and runtime SHA is recorded"*. The pin sits in the readiness census (`LIVING-FIELD-FIRST-HUMAN-WITNESS_READINESS_2026-10-01.md`), which measured preconditions 3, 5 and 6 against that build.

Precondition 6 (*explicit MAIA entry is present in the deployed build*) depends on the build. So the concern is valid: a new build requires a re-baseline before the witness may rely on the old readiness.

## Source re-baseline: `975a208b8` → `03f0fd3ab`

There are 173 non-documentation paths changed. Filtering them against Living Field surfaces gives:

| Surface | Changed? |
|---|---|
| Living Field routes, components, libraries, R1R3 instrument, constellation, facet-flow, Early Field admission | **No.** No path matching `living-field`, `livingField`, `constellation`, `early-field`, `facet` or `r1r3` changed. |
| `middleware.ts`, `lib/auth/*`, `lib/http/*` | **No.** |
| `app/house/page.tsx`, `app/api/house/preferences/route.ts`, `lib/house/houseCabinContext.ts` | **Yes.** The protocol's task starts *"Start from the House"*. |

**House changes.** Every changed branch in `app/house/page.tsx` and in the preferences route is guarded by `process.env.MAIA_CABIN_MODE === 'offline'`. When that is unset:
- `houseStudioH1Admitted` reduces to its previous expression;
- the Writing links reduce to their previous expressions;
- preferences are read through the previous path.

`docker-compose.production.yml` at `03f0fd3ab` does not set `MAIA_CABIN_MODE` itself. ⚠️ But it loads `env_file: .env.production`, which is host-only and gitignored, so **source cannot rule the variable out**. The House → Living Field door is behaviorally unchanged in production **only if** live check 1 below returns empty.

**Verdict (source):** RC1 did not touch Living Field surfaces. The House changes are inert unless cabin offline mode is set.

## Live confirmations owed (read-only, at walk start)

```bash
# 1. Cabin mode must be unset in the live container (expect: empty line)
ssh soullab@minisforum 'docker exec maia-sovereign printenv MAIA_CABIN_MODE'

# 2. Start SHA (repeat at the end; a difference makes the walk NO EVIDENCE)
ssh soullab@minisforum 'docker exec maia-sovereign printenv GIT_COMMIT'
```

Then re-witness live, as the protocol already requires:
- precondition 3: aggregate substrate counts only, never content;
- precondition 5: early-field admission returns `admitted:true`;
- precondition 6: explicit MAIA entry is present.

The old census does not carry forward. Time has passed and members may have authored substrate since.

## Writer's Studio cohort walk: same rule

No Writer's Studio cohort-walk protocol is on record yet. Whoever writes it inherits:
- production SHA recorded **at start and at end**, and a mismatch makes the walk **NO EVIDENCE**;
- the walk's subject build is `03f0fd3ab`. Any later deploy before the walk requires a new re-baseline.

The Living Field protocol and its record template were amended to match (protocol Amendment 1, made before any run).

## Live check result (founder-run, 2026-10-01 ~15:3xZ)

```text
GIT_COMMIT       03f0fd3ab
MAIA_CABIN_MODE  (empty)
container        restarts=0 · started 2026-10-01T15:32:50Z · image sha256:a028302c2cfc…
```

Cabin offline mode is **unset**. RC1's House changes are inert in production, and the re-baseline holds.

⚠️ The container start time moved from 14:47:54Z (earlier check) to 15:32:50Z. `restarts=0` means each move was a *recreation*, not a crash-restart, and it happened twice after the ~14:36Z RC1 swap on the same commit. **Attributed (founder-run image + lock check):** every image since the swap is commit `03f0fd3ab`.
- `6a1ec88` was built 14:44:42 (container 14:47). It was an in-lane rebuild, but its entry point is unrecorded because the lock file holds only the latest acquisition.
- `a028302c` was built 15:31:37 (container 15:32) by a **locked `pre-deploy-gate.sh deploy-maia`**, target `03f0fd3ab`, `soullab@soullab`, at 15:30:17Z.

The walk therefore ran on RC1 code, whichever container served it. Residual: the 14:44 image's `GIT_COMMIT` is inferred from its tag lineage, not read.

Side effect found: the same-commit redeploys rotated `:previous` onto an RC1 rebuild, so `rollback` no longer reached pre-RC1. The fix is in #1621.

**Repaired on the host (founder-run, 2026-10-01).** The SHA tag's provenance was read first (`GIT_COMMIT=975a208b8`), then it was retagged. `:previous` is now `96a539353023` (pre-RC1) and `:current` is `a028302c` (RC1), so `rollback` again reaches pre-RC1.

~~⚠️ Until #1621 is merged and pulled into the host checkout, any further same-commit redeploy will rotate `:previous` onto an RC1 rebuild again.~~ **Discharged (founder-run, 2026-10-01).** The host checkout is now on `clean-main-no-secrets` at `b8592e60e`, and both #1621 guards are present in it (grep count 2 each). Tags after the pull: `:current` = `a028302c2cfc` (RC1), `:previous` = `96a539353023` (pre-RC1).

⚠️ The precheck reported the deploy lock as **HELD** when the checkout was switched. It has not yet been confirmed that no deploy was in flight at that moment.

