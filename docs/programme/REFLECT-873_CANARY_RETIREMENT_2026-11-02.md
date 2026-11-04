# REFLECT-873 review-image workflows — retired

**Date:** 2026-11-02
**Authority:** founder direction in session, 2026-11-02 ("lets do these", on the item "retire the REFLECT-873 canary").
**Change:** both workflows deleted. No application code, schema or deploy path changes.

## What was retired
| Workflow | What it did |
|---|---|
| `.github/workflows/reflect-873-linux-amd64-review-image.yml` | Built source `873ce151e4ee90fc1e43c89feae2e1bf510f49c5` as a Linux amd64 image. It archived the image as a GitHub artifact with `retention-days: 2`. It never pushed or deployed. |
| `.github/workflows/reflect-873-image-runtime-canary.yml` | Reopened the image archived by run `38817290236` (2026-10-15). It checked image ID `sha256:43ff2e1c5a8229b954b9eaf1ee513a4df00221cfdfaddef4b627154160889215` and archive SHA-256 `8f0e82daa65b8d0699830d55704e53f61fd54909411093e6feede3aa6f6c706b`, then ran the reader against a fictional PostgreSQL. |

Both ran only on a pull request that changed their own file. Neither was a required check.

## Why
The canary's pinned archive expired two days after 2026-10-15, so the canary cannot pass again. Its runs on 2026-10-19 and 2026-10-31 failed with "Artifact not found". The build workflow produces a new archive that nothing reads after two days.

`PRODUCTION_LINEAGE_RECONCILIATION_2026-10-31.md` deliberately left the canary red rather than teaching it to skip a missing artifact, and handed retirement to the REFLECT-873 lane. This record completes that hand-off.

## Evidence preserved
- The successful canary run on the pinned image: run `38829736006` (2026-10-16, PR branch `fix/pro-studio-reflect-livebase-beta-20261015`).
- The workflows' full text remains in git history. They were introduced in `41ac90ea8`, `cf72a96cd` and `c7ea7d580`, and removed by this change.

Retiring the instrument does not change what those runs established, and it confers no new standing on source `873ce151e`.

## Re-pinning later
If REFLECT-873 needs this evidence again, restore both files from history. Then build a fresh archive and pin the canary to the new run, image ID and archive hash. Do not restore the canary alone: it would fail exactly as before.
