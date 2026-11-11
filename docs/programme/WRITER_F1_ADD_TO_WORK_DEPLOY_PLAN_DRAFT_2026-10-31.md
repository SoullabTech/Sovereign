# Deploy plan: "Add to a Work" fix for Develop (DRAFT, 31 Oct 2026)

**This authorizes nothing.** Production is untouched. Each step below needs the founder's yes at the time it runs.
**Evidence classes:** RUNTIME = read from production on 2026-10-31 · CODE = read from source · WITNESSED = browser run on a throwaway local stack with a fictional writer.

## What this deploys (UPDATED: founder chose to compose all three)
Branch `fix/writer-release-compose-on-166758f13-20261031`, head `d019be7f0`, **three commits cherry-picked in order onto the live SHA `166758f13`, all clean, no conflicts** (CODE):
1. `4269ef756` lockfile-only patch of the `joi` and `qs` transitive dependencies (`package-lock.json` only; `package.json` unchanged).
2. `61f2b43c8` auth: declares `AUTH_ALLOWED_ORIGINS` required in production, adds a once-only warning naming origins only, documents it in `.env.example`. **Behavior-neutral**: it still returns false exactly where it did, trust is unchanged, nothing refuses at startup. (An earlier draft of this plan called it a possible behavior change. That was wrong; corrected.)
3. `d019be7f0` the "Add to a Work" fix (Develop controller, view, test, `jest.config.js`).

**No migration, no schema change, no route change** (CODE). Composed verification (WITNESSED/CODE): 147 tests pass across the three touched suites; typecheck gate compared against live: **0 new diagnostics, 1 removed** (the self-reference error); `npm ci --ignore-scripts --legacy-peer-deps` (the Dockerfile's flags) dry-run succeeds on both the live and the composed lockfile (2,504 packages each). The browser walk was done on `9fad0d442`, the add-to-Work commit alone; the composed head adds only the lockfile and the auth warning on top.
**Host environment (RUNTIME, presence only, value not read):** `AUTH_ALLOWED_ORIGINS` is **set** in the running container and present once in `.env.production`. So the new warning should not fire, and nothing is needed on the host for this change.

## Why
The live code has a self-referencing declaration (`const manuscriptId = context?.manuscriptId ?? manuscriptId`, line 335 of the live controller). It fails the typecheck (TS2448) and, by code read, throws on every click, which the caller turns into "We couldn't add this writing to that Work". Not reproduced at runtime on the live build. The fix removes the error and adds none (typecheck compared live vs branch: the same 4 older diagnostics remain on both).

## Evidence for the fix (WITNESSED, not production)
12/12 tests pass; panel shows with Talk disabled; "Add to a Work" returns 201, the panel disappears and Talk is enabled; the Full view shows the panel in the MAIA pane. Walked on the branch itself (the view file auto-merged with the Oct 31 changes, so it was re-walked).

## State of production right now (RUNTIME)
| Item | Value |
|---|---|
| Live runtime | `166758f13`, `DEPLOY_LANE=deploy-lane`, container healthy; image tags `current`/`prod`/`candidate-166758f13` created about 41 minutes before this read, so **someone deployed very recently** |
| Deploy lock | no holder |
| Disk | 306 GB free (floor 60 GB) |
| Shared checkout | `56d0cd679` on `clean-main-no-secrets`, 3 modified entries. Irrelevant to the build (the deploy builds from a `git archive` snapshot of the named SHA) |
| Co-Lab gate in the live container | 29 passed, 0 failed, 0 warned |

## The path (quick, `maia`-only; no migrations needed)
1. **Fetch the SHA onto the host** (read-only on the deploy lane): `ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN && git fetch origin fix/writer-release-compose-on-166758f13-20261031 && git rev-parse --short FETCH_HEAD'`. Expect `d019be7f0`. Stop if it differs.
2. **Prepare** (builds and freezes; swaps nothing): `scripts/pre-deploy-gate.sh prepare-maia d019be7f0`. Gates: provenance, Co-Lab (at least 29 passed, 0 failed, 0 warned), disk, deploy lock. Read the output, not only the exit code.
3. **Cutover** (separately authorized): `scripts/pre-deploy-gate.sh cutover-maia d019be7f0`. Refreshes rollback tags, swaps, verifies the running container's `GIT_COMMIT`.
4. **Verify**: `docker exec maia-sovereign printenv GIT_COMMIT` = `d019be7f0`; `printenv DEPLOY_LANE` = `deploy-lane`; `/api/health` fresh with uptime near zero; the Co-Lab gate again, 0 failed.
5. **Witness**: a writer who is not the founder signs in and reaches Develop. Founder use is not a witness.

## Rollback
Re-point to the `previous` image (the lane's `rollback`), which is `166758f13`. This change writes no data, so there is nothing to restore. Cost of rolling back: the Add-to-Work panel is broken again.

## Risks and open items
1. **Composition (decided by the founder): all three together.** This removes the collision where deploying one sibling dropped the others. The remaining caution is that the deploy now carries a lockfile change (2,504 packages resolve identically under the Dockerfile flags in a dry run, but the real image build is what proves it) and an auth warning. Rollback is still the `previous` image, and now reverts all three together.
2. **The gate's Co-Lab floor is 29, lowered from 31.** The gate's own comment says the change to 29 is `RULING_REQUIRED` and "not authorized by this change alone". The live gate passes at 29. Whether that ruling was made is not something I can read.
3. **The Oct 30 stale-principals finding** said the Co-Lab gate aborted on missing principals. It ran clean today. I did not find out why.
4. **No non-founder witness yet.** Cathryn has not confirmed she can sign in.
5. **Not covered by this change:** email (sign-in codes and recovery still refused), the Writers Academy (does not exist), the "several Works declare it" dead end, whether "Start an editorial pass" should need a Work.

## Founder ruling recorded 2026-10-31: Co-Lab floor 29 for this deploy
First `prepare-maia d019be7f0` was refused by the gate: the verifier passed 29 / 0 failed / 0 warned, and the host's older gate script (checkout `56d0cd679`) enforces a floor of 31. The founder ruled: **the floor is 29 for this deploy.** Scope of the ruling: this one prepare/cutover of `d019be7f0`, run with `MIN_COLAB_CHECKS=29` on the command line. It does **not** change the default in any script, does not apply to any later deploy, and does not settle the `RULING_REQUIRED` comment on the committed floor change. 0 failed and 0 warned remain mandatory.

## SUPERSEDED TARGET 2026-10-31 (after the lane collision)
A prepare for another session's `5a9d70067` ("let an author delete a writing from the Studio Home, and fix a shadowed manuscriptId in Develop") held the deploy lane when `d019be7f0` was retried, and it fixes the same self-reference. The composition was therefore rebuilt **on top of `5a9d70067`**: branch `fix/writer-release-compose-on-5a9d70067-20261031`, head **`c74794afe`**, three commits (lockfile patch, auth warning, panel in every view plus the test run under `npm test`); the controller fix is theirs and the one conflict was resolved by keeping their `id` variant. 147 tests pass; typecheck: 0 new diagnostics against live `166758f13`'s list. **It can only be deployed after `5a9d70067` is live** (the gate's ancestry check requires the target to descend from the running SHA). **The floor-29 ruling above covered `d019be7f0` only and must be renewed for `c74794afe`.** Every step in "The path" applies with `c74794afe` in place of `d019be7f0`.

## Founder ruling renewed 2026-10-31: Co-Lab floor 29 for `c74794afe`
`5a9d70067` is live and healthy (RUNTIME). The founder ruled again: **floor 29 for `c74794afe` only**, run as `MIN_COLAB_CHECKS=29` on the command line of this one prepare/cutover. Not a change to any script default; does not carry to any later deploy; 0 failed and 0 warned remain mandatory.

## RESULT 2026-10-31 17:30Z: `c74794afe` is LIVE (RUNTIME)
Prepare then cutover ran with `MIN_COLAB_CHECKS=29` under the founder's rulings. Running provenance verified three ways by the gate (`printenv` == `Config.Env` == asserted `c74794afe`); my own read after the swap: `GIT_COMMIT=c74794afe`, `DEPLOY_LANE=deploy-lane`, container healthy, 0 error lines in the first 3 minutes of logs, Co-Lab gate 29 passed / 0 failed / 0 warned. Rollback tags: `previous` = `5a9d70067`. The gate opened its 30-minute observation window. **Not yet done:** outside-reachability check, and the non-founder writer witness (Cathryn or another writer signs in and reaches Develop).

## Not authorized by this draft
Any deploy step · merging any branch · touching the sibling branches · changing the gate floor · any member data change.
