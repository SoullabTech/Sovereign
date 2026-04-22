# PR #254 — Deploy Checklist

> This checklist is specific to PR #254 and should not be reused as a general deployment checklist.

## Preconditions

- [ ] PR #254 is merged into `clean-main-no-secrets` via the normal review path (not admin-merge)
- [ ] No DB migration is required by this PR — do not run migrations
- [ ] No frontend rebuild beyond the standard `maia` service is required

## Deploy target

- **Host**: minisForum (192.168.0.103) — production
- **Not**: Mac Studio (192.168.0.101) — dev/build only as of 2026-03-30
- **Compose file**: `docker-compose.production.yml`
- **Service to rebuild**: `maia` (compose service name)
- **Container spawned**: `maia-sovereign`

Note: running `docker compose ... --build maia-sovereign` fails with "no such service". The argument to `--build` is the compose service name (`maia`), not the container name.

## Deploy sequence

### 1. SSH to minisForum

```bash
ssh <your-user>@192.168.0.103
```

### 2. Pull latest main

```bash
cd ~/MAIA-SOVEREIGN
git pull
```

- [ ] `git pull` reports the merge commit for PR #254 on top of `clean-main-no-secrets`
- [ ] Working tree is clean

### 3. Rebuild only the maia service

```bash
docker compose -f docker-compose.production.yml up -d --build maia
```

- [ ] Build completes without errors
- [ ] Container `maia-sovereign` transitions to `Up` / healthy

### 4. Confirm container state

```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

- [ ] `maia-sovereign` is healthy
- [ ] `maia-caddy`, `maia-postgres`, and other supporting containers are undisturbed

### 5. Confirm app is serving

```bash
curl -I http://localhost/api/health
```

or through Caddy externally:

```bash
curl -I https://soullab.life/api/health
```

- [ ] Returns 200 OK (or 204, per the health endpoint contract)

## Post-deploy behavioral verification

**Important:** Cached `council_result` rows in `studio_changes` and `studio_decisions` from pre-fix consultations will continue to display old output. Only trust **fresh consultations** for verification.

### Run one fresh Changes consultation

- [ ] Open a new change in Session Room
- [ ] Leave the evidence bundle empty (no client inquiry, no field signals, no practitioner observations)
- [ ] Run council consultation

**Must see in output:**
- [ ] An `Evidence Limits` / missing-data acknowledgment section (or equivalent section header per #252's scaffold — Notice, Differentiate, Orienting Questions, etc.)
- [ ] Explicit mention that no field signals / no client inquiry / no practitioner observations are available
- [ ] No convergence rhetoric (none of: "remarkably convergent", "the deepest insight", "the real issue is", "all lenses agree")
- [ ] A recommendation that is conditional or experimental, not a single prescriptive move

### Run one fresh Decisions consultation

Same checks as Changes.

- [ ] Same required output properties as above
- [ ] Synthesis reliably names evidence absence
- [ ] Plurality language present ("remains open", "not yet clear", "may be X or Y")
- [ ] Recommendation is robust or conditional

### Mentor Dialogue (optional but recommended)

- [ ] Open Changes Mentor Dialogue, Changes Mentor, or Decisions Mentor
- [ ] Verify the mentor surface applies the shared `MENTOR_EPISTEMIC_DISCIPLINE` from #252 — no pathologizing of urgency or readiness

### Pass criteria

Must hold:
- [ ] Missing-evidence acknowledgment is present in fresh output on both surfaces
- [ ] No banned phrases
- [ ] No regression in recommendation quality

Nice to have (do not block on these — stochastic at temp 0.9):
- [ ] Plurality language
- [ ] Robust-move language
- [ ] Discovery-through-engagement language

## Do not

- [ ] Do not run the harness in production. The harness (`tests/council/run-*.ts`) is a dev-only tool and is not wired to production DB or auth.
- [ ] Do not modify stored `council_result` rows to force-refresh. Old rows are historical record; new consultations produce new rows.
- [ ] Do not chase single-run stochastic variance on plurality/discovery. Hold an observation window first.

## Observation window (24–72 hours post-deploy)

Collect:
- [ ] 2 fresh Changes consultations
- [ ] 2 fresh Decisions consultations
- [ ] 1–2 fresh Mentor Dialogue turns

Watch for:
- [ ] Missing-evidence acknowledgment holding reliably across runs
- [ ] No return of convergence rhetoric
- [ ] No silent inference from absent context
- [ ] No regression in recommendation quality

If any of those fail repeatedly (not just once), open a new issue — do not hotfix in-place without PR review.

## Rollback

If production verification fails:

```bash
cd ~/MAIA-SOVEREIGN
git log --oneline -3   # identify the pre-merge commit
git checkout <pre-merge-sha>
docker compose -f docker-compose.production.yml up -d --build maia
```

Then investigate before re-deploying. Rollback for this PR is safe because there is no schema change.
