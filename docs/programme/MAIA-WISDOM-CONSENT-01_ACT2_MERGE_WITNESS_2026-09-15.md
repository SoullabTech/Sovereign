# MAIA-WISDOM-CONSENT-01 · ACT 2 — Merge Witness + Deploy Handoff

**Status: ⭐ MERGED TO CANONICAL · ⛔ NOT DEPLOYED · ⛔ ACT 2 OPEN.**
**Date:** 2026-09-15

---

## 1. Merge custody — established BEFORE the push

| | |
|---|---|
| Canonical before | `53cd1852` |
| Merge-base | `53cd1852` — ⭐ **canonical was the branch point; it had not moved** |
| Commits on canonical since branch point | **0** |
| Canonical touched `config/accessMatrix.ts` or the test? | ⭐ **No** |
| Fast-forward? | ⭐ **Yes** — `git merge-base --is-ancestor` confirmed canonical is an ancestor |

⭐ **No conflict resolution and no semantic alteration were possible or performed.** The
ruling's stop-condition — *"if canonical has moved and the candidate requires conflict
resolution or semantic alteration, stop"* — did not arise. Pushed as
`git push origin HEAD:clean-main-no-secrets`, ⛔ **no merge commit, no rebase, no squash.**

**Canonical after: `8cb6406445efb46f6ba884a3775ec6e82cc9e9c7` — byte-identical to the accepted
candidate lineage.**

## 2. Production delta — exactly 13 files, **+2781 / −0**

```
M  config/accessMatrix.ts                                  ← the containment rule
A  __tests__/ain-corridor-containment.test.ts              ← the regression carrier
A  scripts/witness/ain-corpus-census.mjs                   ← read-only census instrument
A  docs/programme/MAIA-WISDOM-01_ACT1_AIN_CORPUS_CENSUS_2026-09-15.md
A  docs/programme/MAIA-WISDOM-01_ACT1B_COMPLETION_WITNESS_2026-09-15.md
A  docs/programme/MAIA-WISDOM-01_ACT1C_ORGANISM_COMPLETION_WITNESS_2026-09-15.md
A  docs/programme/MAIA-WISDOM-01_CHARTER_CANDIDATE_2026-09-15.md
A  docs/programme/MAIA-WISDOM-01_R9_AIN_COLLECTIVE_FIELD_2026-09-15.md
A  docs/programme/MAIA-WISDOM-CONSENT-01_ACT1_INGRESS_CUSTODY_CENSUS_2026-09-15.md
A  docs/programme/MAIA-WISDOM-CONSENT-01_ACT2_CONTAINMENT_CANDIDATE_2026-09-15.md
A  docs/programme/MAIA-WISDOM-CONSENT-01_ACT2_MERGE_GATE_WITNESS_2026-09-15.md
A  docs/programme/MAIA-WISDOM-CONSENT-01_REACHABILITY_WITNESS_2026-09-15.md
A  docs/programme/MAIA-WISDOM_PROGRAMME_STATE_2026-09-15.md
```

⭐ **One source file modified. One test added. Zero deletions.** Everything else is evidence.

Verified present on canonical after the push:
`config/accessMatrix.ts:523` → `{ prefix: '/api/ain/', public: false, minTier: 'free', rolesAnyOf: ['admin'], … }`

⚠️ GitHub reported 764 Dependabot vulnerabilities on the default branch during the push.
⛔ **Pre-existing, unrelated to this change, and not this lane's** — recorded so it is not
mistaken for a consequence of the merge.

## 3. ⛔ DEPLOY CANNOT RUN FROM THIS CONTAINER

`ssh` is **not installed** in this execution environment — the same environmental limit that
made `MAIA-WISDOM-WITNESS-01` A and B unreachable. ⛔ **This is not a deferral; it is a
property of where this session runs.** Deployment is founder-side.

### Deploy command — quick `maia`-only rebuild

This change is code-only: ⛔ no migration, ⛔ no schema, ⛔ no other service. The quick path
is correct and takes the deploy-lane lock, snapshots the named immutable SHA, runs the Co-Lab
and disk gates, refreshes rollback tags, swaps, and fail-closed verifies `GIT_COMMIT`.

```bash
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN \
  && git fetch origin clean-main-no-secrets \
  && scripts/pre-deploy-gate.sh deploy-maia 8cb64064'
```

⭐ **The SHA is named explicitly** — `8cb64064` — rather than resolved from the shared
checkout's tip, per the immutable-SHA discipline. ⚠️ If canonical has moved since this record,
⛔ **do not silently deploy a newer tip**: either deploy `8cb64064`, or re-establish custody
for whatever is newer.

**Confirm the swap took:**

```bash
ssh soullab@minisforum 'docker exec maia-sovereign printenv GIT_COMMIT'   # must be 8cb64064
curl -k https://soullab.life/api/health
```

## 4. Post-deploy witnesses — three no-write probes

⛔ **No action verb, no contribution payload, no query is submitted by any of these.**

```bash
# 1. DECISIVE FALSIFIER — breakthrough
curl -s -o /dev/null -w '%{http_code}\n' -X POST https://soullab.life/api/ain/collective/breakthrough \
  -H 'content-type: application/json' --data '{}'
# REQUIRED: 401      ·      400 = FAIL, handler still publicly reachable

# 2. control — empty body, no action verb
curl -s -o /dev/null -w '%{http_code}\n' -X POST https://soullab.life/api/ain/control \
  -H 'content-type: application/json' --data '{}'
# REQUIRED: 401

# 3. knowledge — no query
curl -s -o /dev/null -w '%{http_code}\n' 'https://soullab.life/api/ain/knowledge'
# REQUIRED: 401
```

⭐ **The property under test in all three is the same: custody answers before route logic
does.** Any route-level validation response (400 for 1 and 2; anything the knowledge handler
produces for 3) means containment did not take.

## 5. ACT 2 closes only on

```
deployed SHA identified                 ☐
candidate lineage preserved             ✅  (canonical == 8cb64064, verified)
breakthrough anonymous probe → 401      ☐
control anonymous probe → 401           ☐
knowledge anonymous probe → 401         ☐
no contribution/action submitted        ✅  (probes carry {} and no query)
ACCESS_CONTROL_MODE unchanged           ✅  (0 occurrences in the diff)
Seam 2 unchanged                        ✅  (asserted in the suite)
Sanctuary invariant unchanged           ✅  (no file touched)
```

## 6. Standing

**⭐ MERGED · CANONICAL `8cb64064` · LINEAGE PRESERVED · ⛔ NOT DEPLOYED (no `ssh` here —
founder-side) · ⛔ ACT 2 OPEN UNTIL THE PRODUCTION WITNESS · ⛔ LANE OPEN · ⛔ ACT 3 UNOPENED.**

⚠️ **Carried forward, unchanged:**
- **Identity binding** — the handler still trusts a body-supplied `userId`. Closed today by
  unreachability, ⛔ **mandatory before any widening beyond admin.**
- **Seam 2** — ⛔ unresolved. **R15 is still false there:** not-private ≠ offered-to-the-field.
- **`ACCESS-MATRIX-COVERAGE-01`** — routed out, unopened. ⛔ Not this lane's.

⛔ **Do not roll from a green deployment into contribution implementation.** The next question
is not *how to build "Offer this to the field"* but what gives an experience standing to cross
from a member's relationship with MAIA into the collective field — **ACT 3**, opened only by a
founder act after ACT 2's production closure.

> *Canonical now carries the door. Whether it is shut is a fact about production, and
> production has not been asked yet.*
