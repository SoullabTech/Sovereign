# JARVIS-KP-01 / I5-P0R2 — DRY RUN 1: BLOCKER, FINDING, INSTRUMENT REPAIR

STATUS: REPAIR CANDIDATE (this file is a record, ⛔ not an authorization)
**Date**: 2026-09-22
**Disposition accepted**: `I5-P0 NOT READY` — Phase 1 could not establish the substrate binding
**Nothing spent**: no `--apply` · no `.env.production` mutation · no reload · no flag · no row · no shadow · no P1

> NO SEMANTIC JOIN WITHOUT A WARRANT.

---

## 1. Custody of the run

The founder's `/tmp` copy hashed `437e2a86f0f4735f74316e8265141a8b1593b71e`, which
is **byte-identical** to `scripts/witness/i5-p0r2-remediation.sh` at the accepted
instrument commit `e2f7d806`. ⭐ The dry run was the authorized instrument, and its
issued-record gate passed (`draft_guard_hits=0`). The blocker is therefore a real
finding about the act, ⛔ not an artifact of running the wrong thing.

## 2. The blocker has two parts, and only one is mere distribution

**(a) Host checkout — distribution.** `~/MAIA-SOVEREIGN` tracks canonical, and the
instrument lives on `claude/magical-dirac-6rcn5k`, never merged. So
`scripts/witness/seam-identity.mjs` was absent, and the runbook — which resolved
its siblings by a path relative to the **current working directory** — died with
`Cannot find module`. A defect in the runbook, repaired below.

**(b) ⭐⭐ Running container — STRUCTURALLY IMPOSSIBLE AS ISSUED.**

| Fact | Value |
|---|---|
| running image built from | `4c097b4c` · 2026-09-21 19:13 |
| container witness first exists at | `ab208a8b` · 2026-09-22 01:06 |
| `/app/scripts` provenance | copied at **build** time (`Dockerfile:137`) |

The instrument did not exist when the running image was built, and `/app/scripts`
is baked at build time. So `/app/scripts/witness/seam-identity-container.mjs`
**cannot** be present, and could only arrive through a rebuild and deploy — which
**§IV and §VIII of this same act prohibit**.

⭐ **§I.3 as issued was unsatisfiable under the act's own non-authority list.** Not
an error of reasoning by anyone: the condition is sound, and nothing short of
running it would have exposed the collision. *This is the dry run earning its
keep — a review pass would have read §I.3 as obviously satisfiable.*

## 3. The repair — four changes, ⛔ none weakening a check

| # | Change | Why it is not a weakening |
|---|---|---|
| **R1** | the container witness also self-invokes when piped in on **stdin** (`process.argv[1] === '-'`) | adds an invocation channel; changes no law and no measurement |
| **R2** | the runbook resolves its siblings **relative to itself**, with `--instrument-dir` to override | makes the act runnable from a `/tmp` copy; the paths it reads are the same authorized blobs |
| **R3** | the container witness is **streamed into the container on stdin** — `docker exec -i <c> node --input-type=module - --expect …` | ⭐ nothing is written into the image, no rebuild, no deploy, no container mutation; **the bytes MEASURED are still the container's own `/app/lib` and `/app/database`** |
| **R4** | the runbook **verifies both siblings' git blob hashes** before use, computed without `git` so it works from `/tmp` | a **strengthening**: the act now refuses a tampered or stale instrument instead of trusting a copy |

⭐ R3 is the one that resolves §I.3. The instrument travels in; the evidence does
not travel out. ⛔ The alternatives were both refused: `docker cp` is an
unauthorized container mutation, and a rebuild is prohibited outright.

### Authorized digests are UNMOVED by the repair

```
full  scope · 37 files · 195b16bce1c807477bf97befc3c9b6d64a22e4520d0bdd8e9fcd173e35bb885b
image scope · 36 files · a63cf931fe80227004ba9d8730c628bb0c0d65deae6e53e8c29b6bc3b3fd3b51
```

Unchanged because no declared seam path lives under `scripts/` — the repair
touched only instrument files, which are outside the measured seam. Matrix re-run:
**12/12 falsifiers · 5/5 candidates DEAD · 0 unclassified collateral.**

Refusals verified from a `/tmp` copy: `INSTRUMENT_MISSING` (siblings absent),
`INSTRUMENT_BLOB_MISMATCH` (one byte appended to a sibling), and clean progression
to Phase 1 when both are present and matching.

## 4. ⚠️ Two traps met on the way, both recorded

**Production does not build from `Dockerfile.production`.** The `x-maia-build`
anchor in `docker-compose.production.yml` says `dockerfile: Dockerfile`. Checking
`Dockerfile.production` would have shown only `.next/standalone`, `.next/static`
and `public` copied into the runner — and the entire container-side witness would
have looked impossible. The image-scope premise holds, ⛔ but only because the
anchor was resolved rather than the filename trusted.

**A C21-class fragility in my own guard.** The draft guard was a free-text grep for
a phrase. Any record that *discussed* the guard would have been refused **because
it documented its own compliance** — the exact defect this project met at C21. The
guard is now **anchored to a status/standing line**: a record may talk about
drafts; it may not declare itself one. Verified: the draft record is still refused,
the issued record is accepted.

## 5. ⚠️ One governance point, ⛔ not assumed away

The act accepted the instrument at `e2f7d806`. The repaired instrument is a
**different commit**, so the acceptance in §IX does not automatically carry to it.
⛔ This record does not claim it does. The act states the instrument is **not**
frozen and that freeze is owed only after the first successful production
execution, which anticipates exactly this repair — but re-pointing acceptance at
the repaired commit is a founder line, and is owed before the next run.

Blob hashes for host-side custody verification:

```
i5-p0r2-remediation.sh       <see commit; verify on host with the printed value>
seam-identity.mjs            b86a7e3982a0bf809022c2fdfe2b7f28c203d223
seam-identity-container.mjs  85bdba16753cceb4d5991ca4c8c69b57f79f1585
```

## 6. Re-run, once acceptance is re-pointed

On minisforum, materializing the three instruments and the issued record from the
branch (no merge, no deploy):

```bash
cd ~/MAIA-SOVEREIGN
git fetch origin claude/magical-dirac-6rcn5k
D=$(mktemp -d)
for f in i5-p0r2-remediation.sh seam-identity.mjs seam-identity-container.mjs; do
  git show origin/claude/magical-dirac-6rcn5k:scripts/witness/$f > "$D/$f"
done
chmod +x "$D/i5-p0r2-remediation.sh"
git show origin/claude/magical-dirac-6rcn5k:docs/programme/JARVIS-KP-01_I5-P0R2_AUTHORIZATION_ISSUED_2026-09-22.md > "$D/issued.md"

"$D/i5-p0r2-remediation.sh" --authorization "$D/issued.md"      # dry run
```

The runbook needs `origin/clean-main-no-secrets` fetched for the ancestry check,
which the first command supplies alongside.

## 7. Standing

`I5-P0` **NOT READY** · dry run 1 **SPENT, nothing mutated** · blocker **(a)
distribution + (b) §I.3 unsatisfiable as issued** · repair **R1–R4 landed, no
check weakened, one strengthened** · authorized digests **UNMOVED** · matrix
**12/12 · 5/5** · instrument acceptance **owed to be re-pointed** · instrument
**NOT FROZEN** · B1 and B2 **UNREPAIRED** · ⛔ no flag enabled · ⛔ no shadow
executed · ⛔ no row written · ⛔ no migration · ⛔ no deploy · ⛔ I5-P1 NOT
OPENED · **PRODUCTION UNTOUCHED.**
