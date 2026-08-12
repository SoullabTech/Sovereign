# Immutable-SHA Deploy — "build a commit, not a checkout"

**Status:** **DEPLOYED and in force.** Verified in production 2026-08-12.

> **Status correction — 2026-08-12.** This document previously read
> *"Proposed structural control for review (not yet deployed)."* That was **stale**, and
> the former text is preserved here rather than erased.
>
> Read-only inspection of the production host (`minisforum`, 192.168.0.104 — the actual
> server for `soullab.life`) established that the control **is deployed and produced the
> running artifact**:
>
> - `scripts/deploy-production.sh` sources `scripts/deploy-context.sh` (tracked, commit
>   `d27c09c9d`, 2026-07-27), which resolves a named SHA → `git archive <SHA> | tar -x`
>   into an isolated directory → exports `MAIA_BUILD_CONTEXT` and `GIT_COMMIT` →
>   `compose build --build-arg GIT_COMMIT` → rollback tagging →
>   `deploy_ctx_verify_running` **fail-closed** provenance assert before migrations and
>   smoke tests.
> - Guarded by `scripts/deploy-lock.sh` flock and the `DEPLOY_LANE_TOKEN` build-arg
>   tripwire, which has no compose default — so a bare `compose up --build` fails.
> - **Content proof, not self-report:** the `package.json` blob inside the running image
>   `sha256:32ccf1eac5c7d1b587e88fc793697d8889539c0a25593d3c8ce5cea482178aeb` equals the
>   blob at commit `e5f2c5fa2`, and **differs** from the blob at the production
>   checkout's HEAD (`7c9dd5192…`). The image was built from the commit, **not** from the
>   working tree.
> - Baked `GIT_COMMIT=e5f2c5fa2` (image `Config.Env` and `docker history` ARG) **equals**
>   the runtime `GIT_COMMIT` — no injection divergence.
>
> This matters because the production checkout is **468 commits behind** origin and
> carries a dirty `M Caddyfile`. The incident this document describes is genuinely
> closed *for the application image*: the dirty checkout cannot contaminate it.
>
> **Scope limit — the guarantee is partial.** The Caddy edge is **not** covered. It is
> bind-mounted live from that same dirty working tree
> (`~/MAIA-SOVEREIGN/Caddyfile` → `/etc/caddy/Caddyfile:ro`), so production edge
> configuration can still change without a commit, review, or deploy. Recorded
> separately as a configuration-governance finding; **not** remediated here.
**Origin incident:** 2026-07-27 shared-checkout deploy race
(memory `reference_shared_checkout_deploy_incident`).
**Companion to:** the deploy-lane lock (`docs/ops/DEPLOY_LANE_TOKEN.md`,
`scripts/deploy-lock.sh`) and rollback tagging (`scripts/deploy-tag.sh`).

## The incident this closes

Both deploy entry points resolved the commit-to-build from the **currently
checked-out HEAD** of minisforum's single **shared** git repo, and the Docker
build context was that same working tree (`context: .`). So a deploy built
"whatever branch happens to be checked out."

On 2026-07-27 two parallel Claude sessions raced:

- **Session A** created a synthetic branch `deploy/arrival-755-iso` @ `84e6e28a4`
  and checked it out in the shared repo.
- **Session B** then ran `scripts/deploy-production.sh deploy`, which built
  Session A's commit `84e6e28a4` — a commit Session B never intended to ship.

The deploy-lane flock did its job (Session A's own subsequent deploy was correctly
refused). But **serialization alone cannot prevent this**: the flock protects the
build from a *second concurrent deploy*, not the interval between a
`checkout`/`pull` and lock acquisition. Whatever is checked out when the lock is
taken is what gets built.

## The ratified invariant

> **A deploy must build an explicitly named immutable commit, never whichever
> branch happens to be checked out in a shared repository.** (Kelly, 2026-07-27)

Companion rule: **deployment ownership is exclusive from announcement through
evidence capture** — one accountable lane owns the whole operational window.

## Mechanism

The seam is `scripts/deploy-context.sh`, sourced by both
`scripts/deploy-production.sh` and `scripts/pre-deploy-gate.sh`. Every deploy
build now passes through it, in four moves that map onto the design options:

| Move | What it does | Option |
|------|--------------|--------|
| **resolve**     | The operator names a commit (explicit SHA arg). We verify it is a real commit **object** — `git rev-parse --verify <sha>^{commit}` — independent of what is checked out. | 1 + 2* |
| **materialize** | `git archive <SHA> \| tar -x` extracts that commit's tree into a fresh isolated dir; that dir becomes the Docker build context (`MAIA_BUILD_CONTEXT`). | 4 (⊇ 3) |
| **stamp**       | `GIT_COMMIT` is exported from the asserted SHA, never a re-resolution of HEAD. | 5 |
| **verify**      | After the container swap, assert the running container's baked `GIT_COMMIT` equals the asserted SHA — **fail-closed**: a mismatch aborts the deploy **before migrations/smoke** on every path (`deploy`, `update`, `deploy-maia`) and points at `rollback`. | 5 |

\* *Option 2 as an **existence assertion**, not a `HEAD == SHA` check. A hard
"refuse if HEAD differs" would re-couple the deploy to the very checkout we are
trying to escape. Materialization decouples us from the checkout entirely, so the
only thing left to prove is that the named SHA is a real commit.*

### Why materialization subsumes the dirty-tree refusal (Option 3)

A snapshot of a committed SHA **cannot contain uncommitted files.** The known
pre-existing `M Caddyfile` on minisforum physically cannot enter an image built
from `git archive <SHA>`. So there is no need for a separate "refuse when the
working tree is dirty" gate — the dirty file is excluded by construction, and the
operator is never blocked by a long-lived local edit. This is the deliberate
handling the incident called for.

### What is decoupled — and what is intentionally NOT

Only the **image build context** is materialized. Runtime service orchestration
is unchanged:

- **Build context** (`context:` for maia + workers + maia-api + migrate + rlm +
  oldhead + demo + nostr-relay) → `${MAIA_BUILD_CONTEXT:-.}`. Under the deploy
  lane this is the immutable snapshot; default `.` keeps local dev / staging / CI
  / M4 identical.
- **Migration source** (the `migrate` service's `./database/migrations` and
  `run-sql-migrations.sh` bind-mounts) → also `${MAIA_BUILD_CONTEXT:-.}/…`, so the
  migrations that *run* are the migrations of the deployed commit, not the shared
  working tree's.
- **Runtime config bind-mounts** (`./Caddyfile`, `./beta`, `./config/strfry.conf`,
  `./scripts/nostr-write-policy.sh`) → **left resolving from the project dir on
  purpose.** These are live runtime config (e.g. the staging Caddyfile route);
  they are never copied into any image, and changing where they resolve at runtime
  would alter production routing. Builds become immutable; runtime is untouched.

The TOCTOU race is closed because the snapshot is a static extraction: a
concurrent `git checkout` in the shared repo after materialization cannot change
what is being built.

## Usage

```bash
# Quick maia-only rebuild — name the fetched remote tip (no checkout of the
# shared working tree at all):
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN \
  && git fetch origin clean-main-no-secrets \
  && scripts/pre-deploy-gate.sh deploy-maia "$(git rev-parse --short origin/clean-main-no-secrets)"'

# Full all-services deploy of a named commit:
scripts/deploy-production.sh deploy <SHA>

# Pull-and-build-the-tip convenience (still snapshots the pulled SHA):
scripts/deploy-production.sh update
```

### Escape hatch — explicit, loud, never silent

`DEPLOY_ALLOW_HEAD=1` builds the currently-checked-out HEAD when no SHA is named.
It is still snapshotted and announced; the operator has consciously accepted the
shared-checkout risk. Same philosophy as the lockfile and the lane token: the
quiet path is closed, the deliberate override is greppable. `update` uses this
model internally (its contract is "build the tip I just pulled").

## Verifying the control

```bash
# Self-test — hermetic (throwaway git repo, no docker, no network):
scripts/verify-deploy-context.sh
# → 13 assertions: naming refusal, immutability vs concurrent checkout,
#   dirty-tree isolation, GIT_COMMIT stamping, HEAD-ack, post-swap verify.

# After a real deploy, the running container must report the SHA you named:
ssh soullab@minisforum 'docker exec maia-sovereign printenv GIT_COMMIT'   # == <SHA>
ssh soullab@minisforum 'docker exec maia-sovereign printenv DEPLOY_LANE'  # == deploy-lane
```

## Rehearsal & test evidence (2026-07-27)

Both a hermetic self-test and a live real-Docker rehearsal were run before this
control was proposed for merge (Kelly-directed pre-merge rehearsal).

- **Hermetic self-test** — `scripts/verify-deploy-context.sh`, a throwaway git
  repo with no docker and no network: **18/18 pass** (naming refusal, immutability
  vs concurrent checkout, dirty-tree isolation, `GIT_COMMIT` stamping, HEAD-ack,
  post-swap verify, and — added in review — that a **verification mismatch fails
  closed before migrations** in the `deploy`/`update` entry points, checked both
  behaviorally and by a source guard against reverting to warn-and-continue).

- **Live end-to-end rehearsal** — **14/14 pass** on an isolated non-production
  target: the **actual `deploy-context.sh` seam** driven through a real
  `docker build` → `docker run` → `docker exec … printenv GIT_COMMIT`, using a
  tiny `caddy:2-alpine`-based image and a throwaway git repo. **This exercised the
  seam with real Docker on an isolated tiny-image target — NOT the full ~40 GB
  MAIA application image, and NOT a live deployment stack.** The checks include a
  real-Docker **mismatch** case: asserting a different SHA against the live
  container is rejected (fail-closed). The four core checks:
    1. **Deploy a named SHA** — the repo was checked out to commit **B**; commit
       **A** was deployed by name → `GIT_COMMIT` stamped to A, snapshot materialized.
    2. **Snapshot contains exactly that commit** — the snapshot file set equalled
       `git ls-tree -r A`; `marker` held A's content; no `.git` in the export.
    3. **Running container reports the expected `GIT_COMMIT`** — a real
       `docker exec … printenv GIT_COMMIT` returned A; the baked artifact content
       was A (even though the repo was on B).
    4. **Race immunity** — a concurrent checkout (and working-tree dirtying) after
       materialization did not change the snapshot.

- **Contrast proof (the load-bearing result):** from the **same repository state**,
  the new named-SHA flow deployed commit **A** while the old mutable `context: .`
  flow deployed commit **B**. The race is removed **structurally**, not guarded
  more aggressively.

- **Isolation confirmed:** the live MAIA stack was untouched (verified running
  before and after the rehearsal), and every throwaway rehearsal resource
  (container, image, temp dirs) was removed.

- **Interface confirmed:** strict required-SHA on `deploy` / `deploy-maia`, with
  `DEPLOY_ALLOW_HEAD=1` retained as the explicit, greppable acknowledgement escape
  hatch.

The full transient rehearsal log is not retained in-repo; this concise result is
the durable record.

## What this is and is not

- It is a **structural** control: the deploy mechanism itself now accepts and
  asserts an immutable commit identity independent of the checkout. It is no
  longer a procedure the operator must remember.
- It is **not** a substitute for quiescing concurrent agent sessions before prod
  actions, nor for the durable ownership invariant. It removes the specific
  failure mode where a deploy silently builds another lane's checkout; the human
  coordination discipline still stands.

## Known residuals / follow-ups

- **macOS Docker Desktop:** binding a `$TMPDIR` snapshot into the `migrate`
  container needs a shared path. Production is Linux/minisforum where `/tmp` binds
  freely; the Mac Studio parallel stack is dev-only. Override with
  `DEPLOY_CONTEXT_DIR=<shared-path>` if needed.
- **Snapshot disk:** each materialized context is the source tree without
  `node_modules` (~sub-GB); it is cleaned up on process exit (crash-safe EXIT
  trap that also preserves the deploy's exit status). The pre-deploy disk gate
  remains the backstop for total storage.
