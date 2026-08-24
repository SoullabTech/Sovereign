---
name: deploy
description: Ship to production correctly — the immutable-SHA lane, the deploy-lane lock, gates, and post-deploy provenance verification. Use when asked to deploy, ship, release, push to production, run migrations against production, roll back, or verify what is actually live on minisforum.
---

# Deploy

Production is **minisforum**. Docker + Caddy. One deploy at a time, enforced by `flock`.
Every deploy builds an **explicitly named immutable commit**, never "whatever is checked out".

## Choose the lane

| Situation | Lane |
|---|---|
| Code-only change to the `maia` service | `scripts/pre-deploy-gate.sh deploy-maia <SHA>` |
| Schema change, multi-service, or you want a rollback point | `scripts/deploy-production.sh deploy <SHA>` |
| Something is live and wrong | `scripts/deploy-production.sh rollback` |

```bash
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN \
  && git fetch origin clean-main-no-secrets \
  && scripts/pre-deploy-gate.sh deploy-maia "$(git rev-parse --short origin/clean-main-no-secrets)"'
```

The SHA is snapshotted via `git archive` into an isolated build context, so a concurrent
session checking out another branch cannot change what you built. The deploy-lane flock
serializes deploys but does **not** protect the checkout→lock interval — the snapshot does.

## Denied by construction

- **Bare compose against `docker-compose.production.yml`.** Retired structurally: the
  Dockerfile deploy-lane tripwire refuses any build that did not come through
  `acquire_deploy_lock()`. It bakes `GIT_COMMIT=unknown`, races in-flight deploys, and
  skips rollback tagging. The `PreToolUse` guard denies it before you get that far.
- **Deleting `.deploy.lock` to force entry.** Never. A refusal naming a dead PID means a
  child (usually the build) is still running: `fuser -v ~/MAIA-SOVEREIGN/.deploy.lock`.

## Gates

- **Co-Lab release gate — mandatory before any tester wave**, and on any change touching
  Co-Lab, Studio people, DMs, sessions/encounters, files, memory atoms, onboarding,
  invitations/roles, or a migration on those tables:
  ```bash
  scripts/pre-deploy-gate.sh colab      # the gate lane — blocks on fail
  # or directly:
  docker exec maia-sovereign sh -c 'DATABASE_URL="$DATABASE_URL" npx tsx scripts/verify-constitution-colab.ts'
  ```
  Pass condition: **31 passed · 0 failed · 0 warned**. No invite otherwise.
  ⚠️ `CLAUDE.md` and the script's own docblock still name it `scripts/verify-colab-boundaries.ts`.
  That path does not exist in the repo; the file is `scripts/verify-constitution-colab.ts`, which is
  what `pre-deploy-gate.sh:116` actually invokes. Copying the `CLAUDE.md` command verbatim fails.
- Post-swap provenance verify is **fail-closed on every path**. A mismatch aborts before
  migrations and smoke, and points at `rollback`.

## Verify — four checks, all of them

```bash
ssh soullab@minisforum 'docker inspect maia-sovereign --format "{{.Created}}"'   # < 1 min old
ssh soullab@minisforum 'hostname -I'                                            # 192.168.0.104
ssh soullab@minisforum 'docker exec maia-sovereign printenv GIT_COMMIT'         # your SHA, not "unknown"
curl -k https://soullab.life/api/health                                         # fresh JSON, uptime ~0
```

**The most common deploy mistake is rebuilding on the Mac Studio.** The local stack reports
healthy and `Created` updates — while public traffic keeps hitting minisforum's old container.
Verify with the minisforum-side check, not the local one.

## Deeper

- `docs/ops/IMMUTABLE_SHA_DEPLOY.md` · `docs/ops/DEPLOY_LANE_TOKEN.md` · `docs/ops/COLAB_RELEASE_GATE.md`
- `CLAUDE.md` → Production Deployment (authoritative)
