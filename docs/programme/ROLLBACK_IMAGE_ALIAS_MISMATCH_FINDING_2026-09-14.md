# FINDING · `deploy-production.sh rollback` DOES NOT RESTORE THE IMAGE COMPOSE USES

**Found** 2026-09-14, in founder inspection of the O1 runbook.
**Routed out of DEPLOYMENT-SAFETY-02 / S3 by the same ruling.**

⛔ **NO LANE IS OPENED HERE. NO REPAIR IS AUTHORIZED.**

---

## The observation, verified in code

`cmd_rollback` (`scripts/deploy-production.sh`):

```bash
docker tag maia-sovereign:current  maia-sovereign:broken || true
docker tag maia-sovereign:previous maia-sovereign:current
docker compose -f "$COMPOSE_FILE" up -d maia
```

`docker-compose.production.yml`:

```yaml
x-maia-image: &maia_image maia-sovereign:prod
maia:
  image: *maia_image
```

⭐⭐ **The service starts `:prod`. Rollback never touches `:prod`.** So after a
deploy has built and tagged the candidate as `:prod`, `rollback` can move
`:current`/`:previous` around and then restart `maia` **from the same candidate
image it was asked to roll back from** — while reporting a rollback.

⚠️ It is not guaranteed to fail: if `:prod` happens to still point at the previous
image, the restart does restore it. ⛔ **That is worse, not better** — a primitive
that works by coincidence is one nobody knows is broken.

Adjacent, same family: two of those three `docker tag` calls end in `|| true`, so
`tag_images_for_rollback` and `cmd_rollback` alike cannot know from an exit code
whether the role tags they wrote are truthful.

## Why it is not repaired here

⭐ *The lane that finds a defect does not thereby own it.* `rollback` is the
general recovery primitive for every deploy, not an S3 concern, and changing what
it retags changes recovery behaviour for every past and future deployment.

**What the S3/O1 act did instead:** it stopped depending on the primitive. The act
captures the pre-act reader's image id, pins it under its own single-use
`maia-sovereign:o1-recovery-<sha>` tag, verifies that tag **before** anything
crosses, and recovers by retagging that image onto **`:prod`** — then restarting
and verifying the running commit and health. ⛔ It never uses `:current` /
`:previous` as recovery authority, and its late-failure message explicitly warns
the operator **off** `deploy-production.sh rollback`.

## Open questions, ⛔ none answered here

1. Should `rollback` retag `:previous → :prod` (the alias compose consumes), or
   should compose consume `:current` instead? ⚠️ The two are not equivalent — the
   second changes what every `up -d` starts.
2. Should `docker tag` failures in `deploy-tag.sh` and `cmd_rollback` stop being
   suppressed, and what should fail when they do?
3. Is `:broken` ever read by anything, or is it write-only?
4. Does any other path assume `:prod` and `:current` agree?

## Standing

```text
FINDING                 RECORDED · verified in code
LANE                    ⛔ NOT OPENED
REPAIR                  ⛔ NOT AUTHORIZED
S3 / O1                 UNAFFECTED — the act owns its own recovery
PRODUCTION              UNTOUCHED
```

---

# ⭐⭐ ADDENDUM · 2026-09-15 · THE PREDICTED FAILURE OCCURRED IN PRODUCTION

⛔ **STILL NO LANE OPENED. STILL NO REPAIR AUTHORIZED.** This addendum changes the finding's
**evidence class only** — from ENTAILED (read from source, 2026-09-14) to **WITNESSED**
(observed in production, 2026-09-15). Nothing below authorizes a repair.

## What happened

During the authorized rollback of the `C1-BRIDGE-02` W1 production failure
(`docs/programme/C1-BRIDGE-02_W1_PRODUCTION_FAILURE_2026-09-15.md`), the founder ran the
scripted primitive to restore `e57ca1baa` from `0f58a7f93`:

```text
[INFO] Rolling back to previous deployment...
[INFO] Current deployment:
[INFO] Rolling back to:
[INFO] Swapping image tags...
[INFO] Restarting MAIA with previous image...
 Container maia-postgres  Recreated
 Container maia-sovereign Recreated
[OK] Rollback complete! Now running:
```

Custody immediately afterwards:

```text
docker exec maia-sovereign printenv GIT_COMMIT        → 0f58a7f93   ⛔ UNCHANGED
grep -rl "L1/bridge" .next/server                     → .next/server/chunks/19214.js
                                                                    ⛔ BRIDGE STILL LIVE
```

⭐⭐ **The rollback reported success and changed nothing.** Production continued serving the
build that had just failed its acceptance witness.

Tag state, read from each image's baked `GIT_COMMIT` env (⛔ not from labels — see §B):

```text
maia-sovereign:e57ca1baa   GIT_COMMIT=e57ca1baa
maia-sovereign:current     GIT_COMMIT=e57ca1baa   ← rollback DID move this
maia-sovereign:previous    GIT_COMMIT=0f58a7f93
maia-sovereign:broken      GIT_COMMIT=0f58a7f93
maia-sovereign:prod        GIT_COMMIT=0f58a7f93   ← ⛔ what compose actually starts
```

⭐ **This is the finding's central claim, observed exactly as written**: `:current` moved,
`:prod` did not, and the service runs `:prod`.

## A · The 2026-09-14 hedge is now resolved against coincidence

The original finding noted it was *"not guaranteed to fail: if `:prod` happens to still point
at the previous image, the restart does restore it"*, and judged that coincidence **worse, not
better**. On its first real use as a safety primitive, the coincidence did not hold. ⛔ The
primitive failed in the exact circumstance it exists for — an operator rolling back a build
that had just been ruled unacceptable.

## B · ⭐ A SECOND DEFECT, NOT COVERED BY THE ORIGINAL FINDING

`cmd_rollback`'s only provenance readout is structurally always blank:

```text
deploy-production.sh:759   CURRENT_SHA=$(docker inspect --format='{{index .Config.Labels "git.commit"}}' …)
deploy-production.sh:760   PREVIOUS_SHA=$(… same …)
```

`git.commit` is **READ in those two places and SET NOWHERE** — not in `deploy-tag.sh`, not
elsewhere in `deploy-production.sh`, not in the `Dockerfile`. ⚠️ And the `|| echo "unknown"`
fallback never fires: `docker inspect` **succeeds** and returns an empty string for a missing
label, so the guard was written for a failure mode that does not occur.

⭐⭐ **The alias mismatch made the rollback a no-op; the missing label made the no-op
unreportable.** An operator reading `Now running: ` with nothing after it has been shown the
one field that would have exposed the failure, blank. *Two defects that are individually
survivable compose into a recovery primitive that cannot report its own failure.*

## C · How production was actually restored (⛔ NOT a repair to the primitive)

The scripted path was abandoned and the restore performed by hand, verifying image identity
from each image's **baked `GIT_COMMIT` env** rather than from the absent label:

```bash
docker tag maia-sovereign:e57ca1baa maia-sovereign:prod
docker compose -f docker-compose.production.yml up -d --no-deps maia
```

Custody after:

```text
printenv GIT_COMMIT                 → e57ca1baa   ✅
grep -rl "L1/bridge" .next/server   → (empty)     ✅
```

⚠️ `--no-deps` was added deliberately. The scripted `cmd_rollback` omits it and **recreated
`maia-postgres`** as collateral during what was supposed to be an application rollback (visible
in the transcript above). It returned healthy, and no data consequence is claimed — ⛔ but an
app rollback restarting the database is a third observation, recorded and not investigated.

⛔ **Nothing in `scripts/` was modified.** The primitive remains exactly as defective as it was
on 2026-09-14.

## D · What this addendum does and does not establish

```text
ESTABLISHED   the alias mismatch is real, reachable, and occurred in production
ESTABLISHED   the primitive cannot report its own failure (blank label readout)
ESTABLISHED   manual retag of :prod, verified by baked env, does restore correctly
⛔ NOT TAKEN  any decision between the two open questions (retag :previous→:prod,
              or make compose consume :current) — they are still not equivalent
⛔ NOT TAKEN  whether `docker tag` failures should stop being `|| true`
⛔ NOT TAKEN  whether a git.commit label should be introduced, and by which lane
⛔ NOT OPENED a repair lane
```

⭐ *The lane that finds a defect does not thereby own it* — and the lane that witnesses one
does not either. What changed today is the strength of the evidence, not the authority to act
on it. A founder act is still required.
