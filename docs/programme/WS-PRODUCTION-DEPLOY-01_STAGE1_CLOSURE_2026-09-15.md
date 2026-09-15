# WRITERS-STUDIO-PRODUCTION-DEPLOY-01 · Stage 1 — CLOSED

**Status: ✅ CLOSED · editorial OFF · Chapter 10 acceptance NOT OPENED**

```
production   e57ca1baa → ae27205d9
```

## Verified independently of `deploy-production.sh`

```
container GIT_COMMIT   ae27205d9   image GIT_COMMIT  ae27205d9   lane  deploy-lane
health                 ok · version ae27205d9 · uptime 34 · safeMode false
editorial flag         absent (OFF)

migrations                7   (want 7)
the Work 55742458…        1   (want 1)
addressable draft         1   (want 1)
Chapter 10 scope         24   = positions 198–221 exactly, all addressable
```

⭐ **Rollback custody is now sound.** `current → previous` rotated `e57ca1baa` into
the rollback seat, so the image tagged `broken` is no longer what a rollback lands
on. That was the pre-deploy hazard, and it closed as predicted.

## ⚠️ Four things recorded rather than passed over

**1. The `prod` tag was stale, and the founder caught it.** Before the deploy,
`maia-sovereign:prod` pointed at `0f58a7f93` — the **broken** image — while the
running container was `e57ca1baa`. The founder re-tagged and recreated. ⚠️ That
path took **no lane lock and made no provenance assertion**; it was safe only
because it never built, so the Dockerfile tripwire had nothing to refuse. ⭐ **It
is the exact gap Stage 2's wrapper exists to close**, and it has now been observed
twice (2026-09-07, 2026-09-15).

**2. The deploy recreated TEN containers**, `maia-postgres` among them — demo,
api, comms-worker, media-worker, nostr-relay, postgres, rlm, sovereign,
summary-worker, oldhead. All healthy, data intact. ⭐ This reproduces the S3
record's observation verbatim: *"swap the reader" names a narrower act than the
one that runs.* It is why Stage 2 carries an explicit only-MAIA obligation.

**3.** `539 already applied · 487 total` — the standing ledger-rows-vs-files
discrepancy, unchanged and already routed out. ⛔ No provenance manufactured here.

**4.** Pre-existing build noise: `@next/swc 15.5.7` vs Next `15.5.11`, unresolved
`@capacitor-community/contacts`, and `ECONNREFUSED 127.0.0.1:5432` while
statically generating `/api/ain/telemetry`. None blocked the build.

## Standing

```
Stage 1                    ✅ CLOSED
production                 ae27205d9
editorial                  ⛔ OFF
Chapter 10 acceptance      ⛔ NOT OPENED
developmental-reading leg  ⛔ UNRESOLVED — no production subject or runtime,
                              and it gains no standing from this deploy
```
