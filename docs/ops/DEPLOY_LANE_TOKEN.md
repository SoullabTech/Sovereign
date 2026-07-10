# Deploy-Lane Token — "deprecated" as a behavior, not a label

**Status:** Shipped with the deploy-lane lock family (`scripts/deploy-lock.sh`,
`scripts/pre-deploy-gate.sh`, `scripts/deploy-production.sh`).
**Origin incident:** 2026-07-10 out-of-lane deploy (~21:44–22:18 UTC).

## The incident this closes

A production deploy on minisforum used the doubly-deprecated raw compose
command:

```bash
GIT_COMMIT=$(git rev-parse --short HEAD) docker compose -p maia-sovereign \
  -f docker-compose.production.yml --env-file .env.production up -d --build maia
```

It **succeeded quietly**. Provenance survived only because the operator
happened to type the `GIT_COMMIT` prefix. But the command:

- **bypassed the deploy-lane flock** (`scripts/deploy-lock.sh` /
  `.deploy.lock`) — it could have raced a deploy already in flight;
- **ran no rollback tagging** — `maia-sovereign:current` was left pointing at
  the *wrong* image, a miswired recovery path that only surfaces the day a
  rollback is needed;
- **skipped `scripts/pre-deploy-gate.sh` entirely** — no provenance gate, no
  Co-Lab boundary gate.

A path around a gate that succeeds quietly will be taken again. So
"deprecated" is now enforced by structure: **the raw path fails loudly at
build time**, before the running container is touched.

## Mechanism

1. **`scripts/deploy-lock.sh`** — `acquire_deploy_lock()` exports
   `DEPLOY_LANE_TOKEN=deploy-lane` at the moment the lane lock is acquired.
   Both legitimate entry points (`deploy-production.sh` and
   `pre-deploy-gate.sh deploy-maia`) take the lock first, so the token exists
   for exactly the process trees that came through the lane.

2. **`docker-compose.production.yml`** — forwards the token as a build arg
   with **deliberately no default**:

   ```yaml
   args:
     DEPLOY_LANE_TOKEN: ${DEPLOY_LANE_TOKEN:-}
   ```

   Applied to `x-maia-build` (maia + all workers sharing the image),
   `maia-api`, and `migrate`.

3. **`Dockerfile` (base stage) and `apps/api/Dockerfile` (deps stage)** — the
   tripwire itself, as the *first* layer, before any expensive work:

   ```dockerfile
   ARG DEPLOY_LANE_TOKEN=""
   RUN if [ -z "$DEPLOY_LANE_TOKEN" ]; then echo "🛑 OUT-OF-LANE BUILD REFUSED ..."; exit 1; fi
   ```

   The raw compose command now dies in under a second with instructions
   pointing at the two legitimate entry points. The old container keeps
   running untouched — the failure mode is loud *and* safe.

4. **Runtime provenance** — the runner stage bakes `ENV DEPLOY_LANE=<token>`,
   so you can always ask a running container which lane built it:

   ```bash
   ssh soullab@minisforum 'docker exec maia-sovereign printenv DEPLOY_LANE'
   # → deploy-lane   (pre-tripwire images lack the variable entirely)
   ```

5. **Rollback tagging joins the quick path** — `tag_images_for_rollback` moved
   from `deploy-production.sh` into shared `scripts/deploy-tag.sh`, and
   `pre-deploy-gate.sh deploy-maia` now runs **build → tag → swap** instead of
   one `up -d --build`. Every gated deploy refreshes
   `maia-sovereign:current` / `:previous` / `:<sha>`, so the stale-`:current`
   failure mode of the incident cannot recur on any legitimate path.

## Lanes that declare themselves

The tripwire targets the **production compose file's quiet bypass**, not
builds in general. Non-production lanes carry their token in-file, so their
workflows are unchanged:

| Lane | Where declared | Token |
|------|----------------|-------|
| Production (minisforum + Mac Studio parallel stack) | exported by `acquire_deploy_lock()` only | `deploy-lane` |
| Local dev (`docker-compose.yml`) | in-file default | `local-dev` |
| Staging (`docker-compose.staging.yml`) | in-file default | `staging` |
| M4 setup (`scripts/setup-m4-docker-server.sh`) | explicit `--build-arg` | `m4-setup` |
| Anything else | you type it: `--build-arg DEPLOY_LANE_TOKEN=<lane>` | your call |

## What this is and is not

The token is a **constant, not a nonce** — a per-deploy value would invalidate
the docker layer cache on every deploy. And it is a **tripwire, not a
credential**: someone can type
`DEPLOY_LANE_TOKEN=deploy-lane docker compose ... up -d --build maia` and get
through. That is the designed boundary. The incident's failure mode was a
bypass that *felt identical to the sanctioned path* — nothing was typed that
acknowledged leaving the lane. Forging the token is an explicit, greppable,
conscious act, which is precisely the difference between a quiet hole and a
deliberate override. (Same philosophy as the lock itself: the lockfile *can*
be deleted; doing so is unmistakably a choice.)

## Why not the other shapes

- **Shell wrapper / alias on minisforum intercepting `docker compose`** —
  aliases don't fire for non-interactive `ssh host 'command'` invocations
  (exactly how the incident command ran), and shadowing the `docker` binary in
  `PATH` is host state that lives outside the repo, invisible to review, and
  silently lost on re-provisioning. Structure that matters is versioned here.
- **Entrypoint / healthcheck refusal at container start** — refusing at *run*
  time means the out-of-lane image has already replaced the good container:
  the tripwire itself would cause the outage. Warning instead of refusing
  re-creates the original problem (quiet success). Build time is the only
  moment that is both loud and harmless.
- **Passive tripwire only (log line / health field)** — surfacing
  "built out-of-lane" without failing still lets the deploy succeed quietly;
  the signal arrives after the harm. Kept only as the secondary
  `DEPLOY_LANE` env provenance, riding behind the hard build refusal.

## Verifying the tripwire

```bash
# Should FAIL loudly in <1s (no token):
docker compose -p maia-sovereign -f docker-compose.production.yml \
  --env-file .env.production build maia

# Should succeed (gated path exports the token after taking the lane lock):
scripts/pre-deploy-gate.sh deploy-maia
```
