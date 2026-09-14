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
